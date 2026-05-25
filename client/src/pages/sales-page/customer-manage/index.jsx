

import { useState, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import {
  Plus,
  Pencil,
  X,
  Search,
  User,
  Trash2,
  Phone,
  Mail,
  UserPlus,
  ChevronDown,
  Eye,
  MapPin,
  Calendar,
  ShoppingCart
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHelmet } from "@/components/seo/PageHelmet";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/control/DataTable";
import ConfirmModal from "@/components/control/ConfirmModal";
import useCachedFetch from "@/hooks/useCachedFetch";
import useDebounce from "@/hooks/useDebounce";
import customerService from "@/services/customer.service";
import { formatShortDateVN, formatDateVN, nowVN } from "@/lib/dateUtils";

// ===================== CONFIG =====================
const GENDER_OPTIONS = ["Nam", "Nữ", "Khác"];
const GENDER_MAP = { "Nam": 1, "Nữ": 2, "Khác": 3 };
const REVERSE_GENDER_MAP = { 1: "Nam", 2: "Nữ", 3: "Khác" };

// ===================== HELPERS =====================
const formatDate = (d) => formatShortDateVN(d) || "—";

const inputIconBase =
  "w-full text-[13px] rounded-lg pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 transition bg-transparent";
const inputStyle = {
  border: "1px solid var(--grid-border)",
  color: "var(--text-main)",
};
const labelClass =
  "text-[11px] font-semibold uppercase tracking-wider mb-1.5 block";

// ===================== COMPONENT =====================
export default function SalesCustomerManage() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 400);
  const [genderFilter, setGenderFilter] = useState("Tất cả");
  const [pagination, setPagination] = useState({ page: 1, limit: 15 });

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [historyPagination, setHistoryPagination] = useState({ page: 1, limit: 5 });
  const [historyTotal, setHistoryTotal] = useState(0);

  // Form state
  const [form, setForm] = useState({
    full_name: "",
    phone_number: "",
    email: "",
    gender: "",
    dob: "",
    address: "",
    note: "",
  });
  const [formErrors, setFormErrors] = useState({});

  // ===================== SWR FETCHING =====================
  const fetchFn = useCallback(async () => {
    const genderValue = genderFilter === "Tất cả" ? undefined : GENDER_MAP[genderFilter];
    const params = {
      search: debouncedSearch || undefined,
      gender: genderValue,
      page: pagination.page,
      limit: pagination.limit
    };
    const response = await customerService.getAllCustomers(params);
    return {
      items: response.data,
      total: response.pagination.totalItems,
    };
  }, [debouncedSearch, genderFilter, pagination.page, pagination.limit]);

  const cacheKey = `customers_${debouncedSearch}_${genderFilter}_${pagination.page}_${pagination.limit}`;
  const { data: cachedData, isLoading, isRefreshing, refresh } = useCachedFetch(
    cacheKey,
    fetchFn,
    { ttl: 1000 * 60 * 5 }
  );

  const customers = cachedData?.items || [];
  const totalItems = cachedData?.total || 0;

  // ===================== HANDLERS =====================
  const handleOpenCreate = () => {
    setCurrentCustomer(null);
    setForm({
      full_name: "",
      phone_number: "",
      email: "",
      gender: "",
      dob: "",
      address: "",
      note: "",
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleOpenEdit = (c) => {
    setCurrentCustomer(c);
    setForm({
      full_name: c.full_name,
      phone_number: c.phone_number,
      email: c.email || "",
      gender: c.gender ? REVERSE_GENDER_MAP[c.gender] : "",
      dob: c.dob ? formatDateVN(c.dob, "yyyy-MM-dd") : "",
      address: c.address || "",
      note: c.note || "",
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleOpenHistory = async (c, page = 1) => {
    try {
      const detail = await customerService.getCustomerById(c.pk_customer_id, { page, limit: historyPagination.limit });
      setCurrentCustomer(detail);
      setCustomerOrders(detail.orders || []);
      setHistoryTotal(detail.pagination?.totalItems || 0);
      setHistoryPagination(prev => ({ ...prev, page }));
      setIsHistoryOpen(true);
    } catch (error) {
      toast.error("Không thể tải lịch sử khách hàng");
      console.error(error);
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!form.full_name.trim()) errors.full_name = "Vui lòng nhập họ tên";
    if (!form.phone_number.trim()) errors.phone_number = "Vui lòng nhập SĐT";
    if (!form.address.trim()) errors.address = "Vui lòng nhập địa chỉ";

    if (form.dob) {
      const selectedDate = form.dob ? new Date(form.dob) : nowVN();
      const today = nowVN();
      if (selectedDate > today) {
        errors.dob = "Ngày sinh không thể ở tương lai";
      }
    }

    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }

    try {
      const submitData = {
        ...form,
        email: form.email.trim() === "" ? null : form.email.trim(),
        dob: form.dob === "" ? null : form.dob,
        note: form.note.trim() === "" ? null : form.note.trim(),
        gender: GENDER_MAP[form.gender] || 0
      };

      if (currentCustomer) {
        await customerService.updateCustomer(currentCustomer.pk_customer_id, submitData);
        toast.success("Cập nhật hồ sơ thành công");
      } else {
        await customerService.createCustomer(submitData);
        toast.success("Tạo hồ sơ khách hàng thành công");
      }
      setIsFormOpen(false);
      setCurrentCustomer(null);
      refresh();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi xử lý thông tin khách hàng");
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await customerService.deleteCustomer(deleteConfirm.pk_customer_id);
      toast.success("Xóa khách hàng thành công");
      setDeleteConfirm(null);
      refresh();
    } catch (error) {
      toast.error("Lỗi khi xóa khách hàng");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedIds.map(id => customerService.deleteCustomer(id)));
      toast.success(`Đã xóa ${selectedIds.length} khách hàng thành công`);
      setSelectedIds([]);
      refresh();
    } catch (error) {
      toast.error("Lỗi khi xóa hàng loạt");
    }
  };

  const updateForm = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (formErrors[field]) setFormErrors((p) => ({ ...p, [field]: null }));
  };

  // ===================== DATATABLE CONFIG =====================
  const processedCustomers = useMemo(() => {
    return customers.map(c => ({ ...c, id: c.pk_customer_id }));
  }, [customers]);

  const columns = [
    {
      header: "STT",
      headerClassName: "w-[60px]",
      render: (_, idx) => (
        <span className="text-[12px] font-medium text-[var(--text-placeholder)]">
          {(pagination.page - 1) * pagination.limit + idx + 1}
        </span>
      ),
    },
    {
      header: "Khách hàng",
      render: (c) => (
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[12px] font-bold shrink-0"
            style={{
              backgroundColor: "var(--status-focus)",
              color: "var(--brand-primary)",
            }}
          >
            {c.full_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[var(--text-main)]">
              {c.full_name}
            </p>
            <p className="text-[10px] font-mono tracking-wide text-[var(--text-placeholder)]">
              {c.customer_code}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "SĐT / Email",
      render: (c) => (
        <div>
          <p className="text-[13px] font-medium text-[var(--text-main)]">
            {c.phone_number}
          </p>
          <p className="text-[11px] text-[var(--text-placeholder)]">
            {c.email || "—"}
          </p>
        </div>
      ),
    },
    {
      header: "Địa chỉ",
      render: (c) => (
        <p
          className="text-[12px] max-w-[180px] truncate text-[var(--text-secondary)]"
          title={c.address}
        >
          {c.address || "—"}
        </p>
      ),
    },
    {
      header: "Ghi chú",
      render: (c) => (
        <div className="max-w-[180px]">
          {c.note ? (
            <p
              className="text-[12px] italic line-clamp-2 text-[var(--text-secondary)]"
              title={c.note}
            >
              {c.note}
            </p>
          ) : (
            <span className="text-[12px] text-[var(--text-placeholder)]">—</span>
          )}
        </div>
      ),
    },
    {
      header: "Ngày tạo",
      render: (c) => (
        <span className="text-[12px] text-[var(--text-placeholder)]">
          {formatDate(c.createdate)}
        </span>
      ),
    },
  ];

  const rowActions = [
    {
      icon: Eye,
      label: "Xem chi tiết",
      onClick: (c) => handleOpenHistory(c),
    },
    {
      icon: Pencil,
      label: "Chỉnh sửa",
      onClick: (c) => handleOpenEdit(c),
    },
    {
      icon: Trash2,
      label: "Xóa",
      onClick: (c) => setDeleteConfirm(c),
      className: "text-red-500 hover:bg-red-50 hover:border-red-200",
    },
  ];

  // ===================== RENDER =====================
  return (
    <>
      <PageHelmet title="Quản lý khách hàng - TPF-SIMS" />

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
        {/* Header */}
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1
              className="text-xl font-bold"
              style={{ color: "var(--text-main)" }}
            >
              Khách hàng
            </h1>
            <p
              className="text-[13px] mt-0.5"
              style={{ color: "var(--text-placeholder)" }}
            >
              {totalItems} khách hàng
            </p>
          </div>
          <Button
            onClick={handleOpenCreate}
            className="h-9 px-4 text-[13px] font-semibold text-white rounded-lg cursor-pointer transition-all duration-200 active:scale-[0.97]"
            style={{ backgroundColor: "var(--brand-primary)" }}
          >
            <Plus size={15} className="mr-1.5" /> Thêm khách hàng
          </Button>
        </div>

        {/* DataTable Wrapper */}
        <DataTable
          columns={columns}
          data={processedCustomers}
          isLoading={isLoading}
          isRefreshing={isRefreshing}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          searchPlaceholder="Tìm tên, SĐT, mã KH..."
          rowActions={rowActions}
          onRowClick={(c) => handleOpenHistory(c)}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          bulkActions={[
            {
              label: "Xóa hàng loạt",
              icon: Trash2,
              onClick: handleBulkDelete,
              requireConfirm: true,
              confirmTitle: "Xác nhận xóa hàng loạt?",
              confirmMessage: (ids) => `Bạn có chắc chắn muốn xóa ${selectedIds.length} khách hàng đã chọn?`,
            }
          ]}
          extraFilters={
            <div className="relative flex items-center">
              <select
                value={genderFilter}
                onChange={(e) => {
                  setGenderFilter(e.target.value);
                  setPagination(p => ({ ...p, page: 1 }));
                }}
                className="h-10 px-3 pr-9 rounded-lg text-[13px] font-medium outline-none cursor-pointer focus:ring-2 transition appearance-none"
                style={{
                  border:
                    genderFilter !== "Tất cả"
                      ? "1px solid var(--brand-primary)"
                      : "1px solid var(--grid-border)",
                  backgroundColor:
                    genderFilter !== "Tất cả"
                      ? "var(--status-focus)"
                      : "#fff",
                  color:
                    genderFilter !== "Tất cả"
                      ? "var(--brand-primary)"
                      : "var(--text-main)",
                }}
              >
                <option value="Tất cả">Giới tính: Tất cả</option>
                {GENDER_OPTIONS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 pointer-events-none opacity-50"
                style={{
                  color:
                    genderFilter !== "Tất cả"
                      ? "var(--brand-primary)"
                      : "var(--text-main)",
                }}
                strokeWidth={2.5}
              />
            </div>
          }
          pagination={{
            total: totalItems,
            currentPage: pagination.page,
            setCurrentPage: (p) => setPagination(prev => ({ ...prev, page: p })),
            itemsPerPage: pagination.limit,
            setItemsPerPage: (l) => setPagination(prev => ({ ...prev, limit: l, page: 1 })),
          }}
        />
      </div>

      {/* ═══ MODAL: CREATE / EDIT ═══ */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
            onClick={() => setIsFormOpen(false)}
          />
          <div
            className="relative bg-white rounded-lg w-full max-w-lg overflow-hidden animate-in zoom-in-95"
            style={{ boxShadow: "0 25px 50px rgba(0,0,0,0.15)" }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4 border-b"
              style={{ borderColor: "var(--grid-border)" }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: "var(--status-focus)",
                    color: "var(--brand-primary)",
                  }}
                >
                  <UserPlus size={16} />
                </div>
                <h2
                  className="text-[15px] font-bold"
                  style={{ color: "var(--text-main)" }}
                >
                  {currentCustomer ? "Cập nhật hồ sơ" : "Thêm khách hàng mới"}
                </h2>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition cursor-pointer hover:bg-gray-100"
                style={{ color: "var(--text-placeholder)" }}
              >
                <X size={16} />
              </button>
            </div>

            <form
              onSubmit={handleSubmitForm}
              className="p-5 space-y-4 max-h-[70vh] overflow-y-auto"
            >
              {/* Name */}
              <div>
                <label
                  className={labelClass}
                  style={{ color: "var(--text-placeholder)" }}
                >
                  Họ và tên{" "}
                  <span style={{ color: "var(--status-error)" }}>*</span>
                </label>
                <div className="relative">
                  <User
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--text-placeholder)" }}
                  />
                  <input
                    type="text"
                    placeholder="Nhập họ tên"
                    value={form.full_name}
                    onChange={(e) => updateForm("full_name", e.target.value)}
                    className={inputIconBase}
                    style={{
                      ...inputStyle,
                      borderColor: formErrors.full_name
                        ? "var(--status-error)"
                        : "var(--grid-border)",
                    }}
                    autoFocus
                  />
                </div>
                {formErrors.full_name && (
                  <p
                    className="text-[11px] mt-1"
                    style={{ color: "var(--status-error)" }}
                  >
                    {formErrors.full_name}
                  </p>
                )}
              </div>

              {/* Phone + Email */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className={labelClass}
                    style={{ color: "var(--text-placeholder)" }}
                  >
                    Số điện thoại{" "}
                    <span style={{ color: "var(--status-error)" }}>*</span>
                  </label>
                  <div className="relative">
                    <Phone
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2"
                      style={{ color: "var(--text-placeholder)" }}
                    />
                    <input
                      type="tel"
                      placeholder="0xxx xxx xxx"
                      value={form.phone_number}
                      onChange={(e) => updateForm("phone_number", e.target.value)}
                      className={inputIconBase}
                      style={{
                        ...inputStyle,
                        borderColor: formErrors.phone_number
                          ? "var(--status-error)"
                          : "var(--grid-border)",
                      }}
                    />
                  </div>
                  {formErrors.phone_number && (
                    <p
                      className="text-[11px] mt-1"
                      style={{ color: "var(--status-error)" }}
                    >
                      {formErrors.phone_number}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    className={labelClass}
                    style={{ color: "var(--text-placeholder)" }}
                  >
                    Email
                  </label>
                  <div className="relative">
                    <Mail
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2"
                      style={{ color: "var(--text-placeholder)" }}
                    />
                    <input
                      type="email"
                      placeholder="email@example.com"
                      value={form.email}
                      onChange={(e) => updateForm("email", e.target.value)}
                      className={inputIconBase}
                      style={inputStyle}
                    />
                  </div>
                </div>
              </div>

              {/* Gender + DOB */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className={labelClass}
                    style={{ color: "var(--text-placeholder)" }}
                  >
                    Giới tính
                  </label>
                  <select
                    value={form.gender}
                    onChange={(e) => updateForm("gender", e.target.value)}
                    className="w-full text-[13px] rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 transition bg-transparent cursor-pointer"
                    style={inputStyle}
                  >
                    <option value="">Chọn giới tính</option>
                    {GENDER_OPTIONS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    className={labelClass}
                    style={{ color: "var(--text-placeholder)" }}
                  >
                    Ngày sinh
                  </label>
                  <input
                    type="date"
                    value={form.dob}
                    onChange={(e) => updateForm("dob", e.target.value)}
                    className="w-full text-[13px] rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 transition bg-transparent"
                    style={{
                      ...inputStyle,
                      borderColor: formErrors.dob
                        ? "var(--status-error)"
                        : "var(--grid-border)",
                    }}
                  />
                  {formErrors.dob && (
                    <p
                      className="text-[11px] mt-1"
                      style={{ color: "var(--status-error)" }}
                    >
                      {formErrors.dob}
                    </p>
                  )}
                </div>
              </div>

              {/* Address */}
              <div>
                <label
                  className={labelClass}
                  style={{ color: "var(--text-placeholder)" }}
                >
                  Địa chỉ <span style={{ color: "var(--status-error)" }}>*</span>
                </label>
                <div className="relative">
                  <MapPin
                    size={14}
                    className="absolute left-3 top-2.5"
                    style={{ color: "var(--text-placeholder)" }}
                  />
                  <textarea
                    placeholder="Số nhà, tên đường, phường/xã..."
                    rows={2}
                    value={form.address}
                    onChange={(e) => updateForm("address", e.target.value)}
                    className="w-full text-[13px] rounded-lg pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 transition bg-transparent resize-none"
                    style={{
                      ...inputStyle,
                      borderColor: formErrors.address
                        ? "var(--status-error)"
                        : "var(--grid-border)",
                    }}
                  />
                </div>
                {formErrors.address && (
                  <p
                    className="text-[11px] mt-1"
                    style={{ color: "var(--status-error)" }}
                  >
                    {formErrors.address}
                  </p>
                )}
              </div>

              {/* Note */}
              <div>
                <label
                  className={labelClass}
                  style={{ color: "var(--text-placeholder)" }}
                >
                  Ghi chú
                </label>
                <textarea
                  placeholder="Đặc điểm nhận dạng, sở thích khách hàng..."
                  rows={2}
                  value={form.note}
                  onChange={(e) => updateForm("note", e.target.value)}
                  className="w-full text-[13px] rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 transition bg-transparent resize-none"
                  style={inputStyle}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 h-11 text-[13px] font-bold rounded-xl"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-11 text-[13px] font-bold text-white rounded-xl shadow-md transition-all active:scale-[0.98]"
                  style={{ backgroundColor: "var(--brand-primary)" }}
                >
                  {currentCustomer ? "Cập nhật hồ sơ" : "Tạo khách hàng"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══ MODAL: HISTORY ═══ */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
            onClick={() => setIsHistoryOpen(false)}
          />
          <div
            className="relative bg-white rounded-xl w-full max-w-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300"
            style={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
          >
            {/* Header */}
            <div className="px-6 py-5 border-b bg-[var(--grid-header-bg)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="text-[16px] font-bold text-[var(--text-main)]">
                    Chi tiết khách hàng
                  </h2>
                  <p className="text-[11px] font-medium text-[var(--text-placeholder)] uppercase tracking-wider">
                    {currentCustomer?.customer_code} — {currentCustomer?.full_name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="p-2 hover:bg-[var(--grid-border)] rounded-lg transition text-[var(--text-placeholder)] cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[75vh] custom-scrollbar space-y-6">
              {/* Profile Overview */}
              <div className="grid grid-cols-2 gap-6 bg-[var(--grid-header-bg)] p-4 rounded-xl border border-[var(--grid-border)]">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Phone size={14} className="text-[var(--text-placeholder)] mt-1 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-[var(--text-placeholder)] uppercase mb-0.5">Số điện thoại</p>
                      <p className="text-[13px] font-semibold text-[var(--text-main)]">{currentCustomer?.phone_number}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail size={14} className="text-[var(--text-placeholder)] mt-1 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-[var(--text-placeholder)] uppercase mb-0.5">Email</p>
                      <p className="text-[13px] font-semibold text-[var(--text-main)]">{currentCustomer?.email || "—"}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin size={14} className="text-[var(--text-placeholder)] mt-1 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-[var(--text-placeholder)] uppercase mb-0.5">Địa chỉ</p>
                      <p className="text-[13px] font-semibold text-[var(--text-main)] leading-relaxed">{currentCustomer?.address || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar size={14} className="text-[var(--text-placeholder)] mt-1 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-[var(--text-placeholder)] uppercase mb-0.5">Ngày sinh</p>
                      <p className="text-[13px] font-semibold text-[var(--text-main)]">{formatDate(currentCustomer?.dob)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order History */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--grid-border)] pb-2">
                  <h3 className="text-[14px] font-bold text-[var(--text-main)] flex items-center gap-2">
                    <ShoppingCart size={16} className="text-[var(--brand-primary)]" />
                    Lịch sử mua hàng
                  </h3>
                  <span className="px-2 py-0.5 bg-[var(--bg-main)] rounded-full text-[10px] font-bold text-[var(--text-secondary)]">
                    {historyTotal} Đơn hàng
                  </span>
                </div>

                {customerOrders.length > 0 ? (
                  <>
                    <div className="space-y-4">
                      {customerOrders.map((order) => {
                        const total = parseFloat(order.total_amount) || 0;
                        const paid = parseFloat(order.deposit_amount) || 0;
                        const balance = total - paid;

                        return (
                          <div
                            key={order.pk_order_id}
                            className="border border-[var(--grid-border)] rounded-xl overflow-hidden bg-white shadow-sm"
                          >
                            {/* Order Header */}
                            <div className="p-3 bg-[var(--grid-header-bg)] border-b flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-[12px] font-bold text-[var(--text-main)]">#{order.pk_order_id}</span>
                                <span className="text-[11px] text-[var(--text-placeholder)] font-medium">{formatDate(order.createdate)}</span>
                              </div>
                              <span className={cn(
                                "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                                order.order_status === 5 ? "bg-[var(--status-focus)] text-[var(--status-success)]" : "bg-amber-50 text-amber-600"
                              )}>
                                {order.order_status === 1 ? "Chờ xử lý" :
                                  order.order_status === 5 ? "Hoàn thành" : "Đang xử lý"}
                              </span>
                            </div>

                            {/* Items List */}
                            <div className="p-3 space-y-2 border-b border-[var(--bg-main)]">
                              {order.items?.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center text-[12px]">
                                  <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--brand-primary)]" />
                                    <span className="text-[var(--text-secondary)] font-medium">{item.item_name}</span>
                                    <span className="text-[var(--text-placeholder)]">x{item.item_quantity}</span>
                                  </div>
                                  <span className="text-[var(--text-main)] font-semibold">{parseFloat(item.item_price).toLocaleString()}đ</span>
                                </div>
                              ))}
                            </div>

                            {/* Payment Summary */}
                            <div className="p-3 bg-[var(--status-focus)] grid grid-cols-3 gap-2 text-center divide-x divide-[var(--grid-border)]">
                              <div>
                                <p className="text-[10px] font-bold text-[var(--text-placeholder)] uppercase mb-0.5">Tổng cộng</p>
                                <p className="text-[13px] font-bold text-[var(--text-main)]">{total.toLocaleString()}đ</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-emerald-500 uppercase mb-0.5">Đã thanh toán</p>
                                <p className="text-[13px] font-bold text-emerald-600">{paid.toLocaleString()}đ</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-red-500 uppercase mb-0.5">Còn lại</p>
                                <p className="text-[13px] font-bold text-red-600">{balance.toLocaleString()}đ</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Pagination for History */}
                    {historyTotal > historyPagination.limit && (
                      <div className="flex items-center justify-between pt-4">
                        <p className="text-[11px] text-[var(--text-placeholder)] font-medium">
                          Hiển thị {(historyPagination.page - 1) * historyPagination.limit + 1} - {Math.min(historyPagination.page * historyPagination.limit, historyTotal)} / {historyTotal} đơn hàng
                        </p>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={historyPagination.page === 1}
                            onClick={() => handleOpenHistory(currentCustomer, historyPagination.page - 1)}
                            className="h-8 px-2 text-[11px]"
                          >
                            Trước
                          </Button>
                          <div className="flex items-center gap-1 px-2">
                            {Array.from({ length: Math.ceil(historyTotal / historyPagination.limit) }).map((_, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleOpenHistory(currentCustomer, idx + 1)}
                                className={cn(
                                  "w-6 h-6 rounded flex items-center justify-center text-[11px] font-bold transition",
                                  historyPagination.page === idx + 1
                                    ? "bg-[var(--brand-primary)] text-white"
                                    : "text-[var(--text-placeholder)] hover:bg-[var(--bg-main)]"
                                )}
                              >
                                {idx + 1}
                              </button>
                            ))}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={historyPagination.page >= Math.ceil(historyTotal / historyPagination.limit)}
                            onClick={() => handleOpenHistory(currentCustomer, historyPagination.page + 1)}
                            className="h-8 px-2 text-[11px]"
                          >
                            Sau
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-[var(--text-placeholder)] bg-[var(--bg-main)] rounded-2xl border-2 border-dashed border-[var(--grid-border)]">
                    <ShoppingCart size={40} className="mb-3 opacity-20" />
                    <p className="text-[13px] font-medium">Khách hàng chưa có đơn hàng nào.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-[var(--grid-header-bg)] border-t flex justify-end">
              <Button
                onClick={() => setIsHistoryOpen(false)}
                className="px-6 h-10 rounded-xl text-white font-bold text-[13px] hover:opacity-90 transition-all active:scale-[0.98] shadow-sm"
                style={{ backgroundColor: "var(--brand-primary)" }}
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Deletion */}
      <ConfirmModal
        isOpen={!!deleteConfirm}
        title="Xác nhận xóa?"
        message={`Bạn có chắc chắn muốn xóa hồ sơ khách hàng "${deleteConfirm?.full_name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </>
  );
}
