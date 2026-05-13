import { useState, useMemo, useEffect, useCallback } from "react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  Pencil,
  Lock,
  Unlock,
  Mail,
  Phone,
  User,
  Shield,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar,
  Users,
  XCircle,
  Layers,
  Trash2,
  ChevronDown,
  Key,
} from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import DataTable from "@/components/control/DataTable";
import ConfirmModal from "@/components/control/ConfirmModal";
import accountService from "@/services/account.service";
import useCachedFetch from "@/hooks/useCachedFetch";
import useDebounce from "@/hooks/useDebounce";

const STATUS_MAP = {
  1: { label: "Hoạt động", bg: "#ECFDF5", text: "#047857", border: "#A7F3D0" },
  0: { label: "Khóa", bg: "#FEF2F2", text: "#DC2626", border: "#FECACA" },
};

const ModalContainer = ({
  title,
  onClose,
  children,
  maxWidth = "max-w-md",
}) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div
      className="absolute inset-0 bg-black/30 backdrop-blur-[2px] animate-in fade-in duration-200"
      onClick={onClose}
    />
    <div
      className={cn(
        "relative bg-white rounded-lg w-full shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200",
        maxWidth,
      )}
    >
      <div
        className="px-6 py-4 border-b flex items-center justify-between shrink-0"
        style={{ borderColor: "var(--grid-border)" }}
      >
        <h3 className="text-[16px] font-bold text-gray-900">{title}</h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition text-gray-400 hover:text-gray-600 cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-6 text-gray-900">{children}</div>
    </div>
  </div>
);

export default function OwnerEmployees() {
  const [activeTab, setActiveTab] = useState("Tất cả"); // Role filter
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [roles, setRoles] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
  });

  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showResetModal, setShowResetModal] = useState(false);
  const [accountToReset, setAccountToReset] = useState(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);

  const fetchRoles = async () => {
    try {
      const data = await accountService.getRoles();
      setRoles(data);
    } catch (error) {
      console.error("Fetch roles error:", error);
    }
  };

  const fetchFn = useCallback(async () => {
    const params = {
      search: debouncedSearch || undefined,
      page: pagination.page,
      limit: pagination.limit,
      fromDate: dateFrom || undefined,
      toDate: dateTo || undefined,
      role_id: activeTab === "Tất cả" ? undefined : activeTab,
    };
    const response = await accountService.getAllAccounts(params);
    return {
      items: response.data,
      total: response.pagination.totalItems,
    };
  }, [debouncedSearch, pagination.page, pagination.limit, dateFrom, dateTo, activeTab]);

  const cacheKey = `employees_${debouncedSearch}_${activeTab}_${dateFrom}_${dateTo}_${pagination.page}_${pagination.limit}`;
  const { data: cachedData, isLoading, isRefreshing, refresh } = useCachedFetch(
    cacheKey,
    fetchFn,
    { ttl: 1000 * 60 * 5 }
  );

  const accounts = cachedData?.items || [];
  const totalItems = cachedData?.total || 0;

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleSaveAccount = async (formData) => {
    try {
      if (editingAccount) {
        const { email, ...updateData } = formData;
        await accountService.updateAccount(
          editingAccount.user_account_id,
          updateData,
        );
        toast.success("Cập nhật tài khoản thành công");
      } else {
        await accountService.createAccount(formData);
        toast.success("Tạo tài khoản thành công");
      }
      setShowAddEditModal(false);
      refresh();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi lưu tài khoản");
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      await accountService.toggleStatus(
        selectedAccount.user_account_id,
        newStatus,
      );
      toast.success("Đã cập nhật trạng thái");
      setShowStatusModal(false);
      refresh();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Lỗi khi cập nhật trạng thái",
      );
    }
  };

  const handleDeleteAccount = (acc) => {
    setAccountToDelete(acc);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAccount = async () => {
    if (!accountToDelete) return;
    try {
      await accountService.deleteAccount(accountToDelete.user_account_id);
      toast.success("Đã xóa tài khoản thành công");
      setShowDeleteConfirm(false);
      setAccountToDelete(null);
      refresh();
    } catch (error) {
      toast.error("Lỗi khi xóa tài khoản");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(
        selectedIds.map((id) => accountService.deleteAccount(id)),
      );
      toast.success(`Đã xóa ${selectedIds.length} tài khoản`);
      setSelectedIds([]);
      refresh();
    } catch (error) {
      toast.error("Lỗi khi xóa hàng loạt");
    }
  };

  const handleResetPassword = async (newPwd) => {
    try {
      await accountService.updateAccount(accountToReset.user_account_id, {
        password: newPwd,
      });
      toast.success(
        `Đã đặt lại mật khẩu cho "${accountToReset?.profile?.full_name}"`,
      );
      setShowResetModal(false);
      setAccountToReset(null);
    } catch (error) {
      toast.error("Lỗi khi đặt lại mật khẩu");
    }
  };

  const displayRoles = useMemo(
    () => [
      { value: "Tất cả", label: "Tất cả vai trò" },
      ...roles.map((r) => ({ value: r.role_id, label: r.role_name })),
    ],
    [roles],
  );

  const processedAccounts = useMemo(() => {
    return accounts.map((a) => ({ ...a, id: a.user_account_id }));
  }, [accounts]);

  const hasActiveFilters =
    activeTab !== "Tất cả" || dateFrom || dateTo || search;

  const clearAllFilters = () => {
    setActiveTab("Tất cả");
    setDateFrom("");
    setDateTo("");
    setSearch("");
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  return (
    <>
      <PageHelmet title="Quản lý tài khoản | TPF-SIMS" />

      {/* Global Loading Bar */}
      {(isLoading || isRefreshing) && (
        <div className="fixed top-0 left-0 right-0 z-[9999]">
          <div className="h-[2px] bg-indigo-500 animate-[loading_1.5s_infinite] origin-left"></div>
        </div>
      )}

      <div
        className="flex flex-col h-[calc(100vh-64px)] -m-6 p-6 space-y-4"
        style={{ backgroundColor: "var(--bg-main)" }}
      >
        <div className="flex items-center justify-between shrink-0 mb-1">
          <div>
            <h1
              className="text-[22px] font-bold flex items-center gap-2.5"
              style={{ color: "var(--text-main)", letterSpacing: "-0.01em" }}
            >
              <Users size={24} style={{ color: "var(--brand-primary)" }} />
              Quản lý tài khoản
            </h1>
            <p
              className="text-[13px] mt-1 font-medium italic"
              style={{ color: "var(--text-placeholder)" }}
            >
              {totalItems} nhân viên (
              {activeTab === "Tất cả"
                ? "tất cả vai trò"
                : displayRoles
                    .find((r) => r.value === activeTab)
                    ?.label?.toLowerCase()}
              )
            </p>
          </div>

          <button
            onClick={() => {
              setEditingAccount(null);
              setShowAddEditModal(true);
            }}
            className="h-10 px-6 rounded-xl flex items-center gap-2 text-[13px] font-bold text-white transition-all hover:opacity-90 shadow-sm active:scale-95 cursor-pointer"
            style={{ backgroundColor: "var(--brand-primary)" }}
          >
            <Plus size={18} /> Thêm tài khoản
          </button>
        </div>

        <DataTable
          data={processedAccounts}
          isLoading={isLoading}
          isRefreshing={isRefreshing}
          searchTerm={search}
          setSearchTerm={setSearch}
          searchPlaceholder="Tìm email, tên nhân viên..."
          dateFrom={dateFrom}
          setDateFrom={setDateFrom}
          dateTo={dateTo}
          setDateTo={setDateTo}
          hasActiveFilters={hasActiveFilters}
          clearAllFilters={clearAllFilters}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          bulkActions={[
            {
              label: "Xóa đã chọn",
              icon: Trash2,
              onClick: handleBulkDelete,
              requireConfirm: true,
              confirmTitle: "Xác nhận xóa hàng loạt",
              confirmMessage: (ids) =>
                `Bạn có chắc chắn muốn xóa vĩnh viễn ${selectedIds.length} tài khoản đã chọn không?`,
            },
          ]}
          extraFilters={
            <div className="flex items-center gap-1.5 shrink-0 relative">
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
                className="h-10 px-3 pr-8 rounded-lg text-[13px] border cursor-pointer focus:outline-none appearance-none font-medium transition-all hover:border-gray-400"
                style={{
                  backgroundColor:
                    activeTab !== "Tất cả" ? "var(--status-focus)" : "#fff",
                  color:
                    activeTab !== "Tất cả"
                      ? "var(--brand-primary)"
                      : "var(--text-main)",
                  borderColor: "var(--grid-border)",
                }}
              >
                {displayRoles.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-2.5 pointer-events-none text-gray-400"
                strokeWidth={2.5}
              />
            </div>
          }
          columns={[
            {
              header: "STT",
              headerClassName: "text-center w-[60px]",
              className: "text-center font-medium",
              style: { color: "var(--text-secondary)" },
              render: (_, idx) =>
                (pagination.page - 1) * pagination.limit + idx + 1,
            },
            {
              header: "Nhân viên",
              render: (a) => (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold border border-emerald-100 uppercase overflow-hidden shrink-0">
                    {a.profile?.full_name?.charAt(0) || <User size={18} />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 truncate">
                      {a.profile?.full_name || "Chưa cập nhật"}
                    </p>
                    <p className="text-[11px] text-gray-400 flex items-center gap-1 truncate">
                      <Mail size={12} className="shrink-0" /> {a.email}
                    </p>
                  </div>
                </div>
              ),
            },
            {
              header: "Liên hệ",
              className: "whitespace-nowrap",
              render: (a) => (
                <div className="flex items-center gap-1.5 text-gray-600 font-medium">
                  <Phone size={13} className="text-gray-400 shrink-0" />{" "}
                  {a.profile?.phone_number || "—"}
                </div>
              ),
            },
            {
              header: "Vai trò",
              render: (a) => {
                const roleLabel = a.role?.role_name || "N/A";
                return (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-tight">
                    <Shield size={12} /> {roleLabel}
                  </span>
                );
              },
            },
            {
              header: "Ngày tạo",
              render: (a) => (
                <div className="text-gray-500 font-medium">
                  {a.createdate
                    ? new Date(a.createdate).toLocaleDateString("vi-VN")
                    : "—"}
                </div>
              ),
            },
            {
              header: "Trạng thái",
              render: (a) => {
                const status = STATUS_MAP[a.status] || STATUS_MAP[1];
                return (
                  <span
                    className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold border uppercase tracking-tight"
                    style={{
                      backgroundColor: status.bg,
                      color: status.text,
                      borderColor: status.border,
                    }}
                  >
                    {status.label}
                  </span>
                );
              },
            },
          ]}
          rowActions={[
            {
              icon: Pencil,
              label: "Sửa",
              onClick: (a) => {
                setEditingAccount(a);
                setShowAddEditModal(true);
              },
            },
            {
              icon: Key,
              label: "Mật khẩu",
              className:
                "bg-white border-gray-200 text-blue-500 hover:text-blue-600",
              onClick: (a) => {
                setAccountToReset(a);
                setShowResetModal(true);
              },
            },
            {
              icon: Lock,
              label: "Trạng thái",
              className:
                "bg-white border-gray-200 text-amber-500 hover:text-amber-600",
              onClick: (a) => {
                setSelectedAccount(a);
                setShowStatusModal(true);
              },
            },
            {
              icon: Trash2,
              label: "Xóa",
              className:
                "bg-white border-gray-200 text-red-500 hover:text-red-600",
              onClick: (a) => handleDeleteAccount(a),
            },
          ]}
          pagination={{
            total: totalItems,
            currentPage: pagination.page,
            setCurrentPage: (p) =>
              setPagination((prev) => ({ ...prev, page: p })),
            itemsPerPage: pagination.limit,
            setItemsPerPage: (l) =>
              setPagination((prev) => ({ ...prev, limit: l })),
          }}
        />
      </div>

      {showAddEditModal && (
        <AccountFormModal
          account={editingAccount}
          roles={roles}
          defaultRoleId={activeTab}
          onClose={() => setShowAddEditModal(false)}
          onSave={handleSaveAccount}
        />
      )}
      {showStatusModal && (
        <StatusModal
          account={selectedAccount}
          onClose={() => setShowStatusModal(false)}
          onUpdate={handleUpdateStatus}
        />
      )}
      {showResetModal && (
        <ResetPasswordModal
          account={accountToReset}
          onClose={() => setShowResetModal(false)}
          onConfirm={handleResetPassword}
        />
      )}

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Xác nhận xóa tài khoản"
        message={`Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản của "${accountToDelete?.profile?.full_name}" không? Thao tác này không thể hoàn tác.`}
        onConfirm={confirmDeleteAccount}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}

function ResetPasswordModal({ account, onClose, onConfirm }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    onConfirm(newPassword);
  };

  return (
    <ModalContainer
      title="Đặt lại mật khẩu"
      onClose={onClose}
      maxWidth="max-w-sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            <Key size={24} />
          </div>
          <div className="text-center">
            <p className="text-[13px] text-gray-500">
              Đang đặt lại mật khẩu cho
            </p>
            <p className="font-bold text-gray-900">
              {account?.profile?.full_name}
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
            Mật khẩu mới
          </label>
          <Input
            required
            type="password"
            placeholder="••••••••"
            className="rounded-xl h-11"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
            Xác nhận mật khẩu
          </label>
          <Input
            required
            type="password"
            placeholder="••••••••"
            className="rounded-xl h-11"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <div className="pt-2 flex gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="flex-1 h-11 rounded-xl text-gray-500"
          >
            Hủy
          </Button>
          <Button
            type="submit"
            className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
          >
            Xác nhận
          </Button>
        </div>
      </form>
    </ModalContainer>
  );
}

function AccountFormModal({ account, roles, defaultRoleId, onClose, onSave }) {
  const [formData, setFormData] = useState({
    email: account?.email || "",
    password: "",
    full_name: account?.profile?.full_name || "",
    phone_number: account?.profile?.phone_number || "",
    gender: account?.profile?.gender || "1",
    dob: account?.profile?.dob
      ? new Date(account.profile.dob).toISOString().split("T")[0]
      : "",
    role_id:
      account?.role_id ||
      (defaultRoleId !== "Tất cả"
        ? defaultRoleId
        : roles.find((r) => r.role_code !== "OWNER")?.role_id || ""),
  });

  return (
    <ModalContainer
      title={account ? "Cập nhật tài khoản" : "Thêm tài khoản mới"}
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave(formData);
        }}
        className="space-y-4"
      >
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
            Họ tên
          </label>
          <Input
            required
            className="rounded-xl h-11 text-gray-900"
            placeholder="Họ và tên..."
            value={formData.full_name}
            onChange={(e) =>
              setFormData({ ...formData, full_name: e.target.value })
            }
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
            Email đăng nhập
          </label>
          <Input
            required
            type="email"
            disabled={!!account}
            className="rounded-xl h-11 text-gray-900 disabled:opacity-50"
            placeholder="email@tpf.vn"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
        </div>
        {!account && (
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              Mật khẩu
            </label>
            <Input
              required
              type="password"
              placeholder="••••••••"
              className="rounded-xl h-11 text-gray-900"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              Số điện thoại
            </label>
            <Input
              className="rounded-xl h-11 text-gray-900"
              placeholder="09xxxxxx"
              value={formData.phone_number}
              onChange={(e) =>
                setFormData({ ...formData, phone_number: e.target.value })
              }
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              Vai trò
            </label>
            {account ? (
              <div className="h-11 w-full rounded-xl border border-gray-100 bg-gray-50/50 px-4 flex items-center text-sm font-bold text-emerald-700">
                <Shield size={14} className="mr-2 opacity-70" />
                {roles.find((r) => r.role_id === formData.role_id)?.role_name || "N/A"}
              </div>
            ) : (
              <select
                value={formData.role_id}
                onChange={(e) =>
                  setFormData({ ...formData, role_id: e.target.value })
                }
                className="flex h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:outline-none cursor-pointer"
              >
                {roles
                  .filter((r) => r.role_code !== "OWNER")
                  .map((r) => (
                    <option key={r.role_id} value={r.role_id}>
                      {r.role_name}
                    </option>
                  ))}
              </select>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              Ngày sinh
            </label>
            <Input
              type="date"
              className="rounded-xl h-11 text-gray-900"
              value={formData.dob}
              onChange={(e) =>
                setFormData({ ...formData, dob: e.target.value })
              }
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              Giới tính
            </label>
            <select
              value={formData.gender}
              onChange={(e) =>
                setFormData({ ...formData, gender: e.target.value })
              }
              className="flex h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:outline-none cursor-pointer"
            >
              <option value="1">Nam</option>
              <option value="0">Nữ</option>
            </select>
          </div>
        </div>


        <div className="pt-4 flex gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="flex-1 h-12 rounded-xl font-bold"
          >
            Hủy
          </Button>
          <Button
            type="submit"
            className="flex-1 h-12 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
          >
            Lưu tài khoản
          </Button>
        </div>
      </form>
    </ModalContainer>
  );
}

function StatusModal({ account, onClose, onUpdate }) {
  return (
    <ModalContainer
      title="Trạng thái tài khoản"
      onClose={onClose}
      maxWidth="max-w-sm"
    >
      <div className="text-center space-y-4">
        <div
          className={cn(
            "w-16 h-16 rounded-3xl mx-auto flex items-center justify-center border-2",
            String(account.status) === "0"
              ? "bg-red-50 text-red-600 border-red-100"
              : "bg-emerald-50 text-emerald-600 border-emerald-100",
          )}
        >
          {String(account.status) === "0" ? (
            <Lock size={30} />
          ) : (
            <Unlock size={30} />
          )}
        </div>
        <h4 className="font-bold text-gray-900">
          {String(account.status) === "0"
            ? "Mở khóa tài khoản?"
            : "Cập nhật trạng thái?"}
        </h4>
        <div className="grid grid-cols-1 gap-2">
          {String(account.status) === "0" ? (
            <Button
              onClick={() => onUpdate(1)}
              className="h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              Mở khóa tài khoản
            </Button>
          ) : (
            <Button
              onClick={() => onUpdate(0)}
              className="h-12 rounded-xl border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 border bg-red-50/50 font-bold"
            >
              Khóa truy cập
            </Button>
          )}
          <Button
            onClick={onClose}
            variant="ghost"
            className="h-10 rounded-xl text-gray-400 font-medium"
          >
            Đóng
          </Button>
        </div>
      </div>
    </ModalContainer>
  );
}
