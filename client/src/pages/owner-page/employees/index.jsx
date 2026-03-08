import { useState, useMemo, useEffect } from "react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  Pencil,
  UserCog,
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
  FileText,
  Factory,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const STATUS_MAP = {
  1: { label: "Hoạt động", bg: "#ECFDF5", text: "#047857", border: "#A7F3D0" },
  0: { label: "Nghỉ", bg: "#F3F4F6", text: "#6B7280", border: "#D1D5DB" },
  "-1": { label: "Khóa", bg: "#FEF2F2", text: "#DC2626", border: "#FECACA" },
};

const ROLES = [
  { value: "Tất cả", label: "Tất cả" },
  { value: "OWNER", label: "Chủ cửa hàng" },
  { value: "SALES", label: "Nhân viên kinh doanh" },
  { value: "ACCOUNTANT", label: "Kế toán" },
  { value: "WORKER", label: "Thợ" },
];

const STATUS_OPTIONS = ["Tất cả", "Hoạt động", "Nghỉ", "Khóa"];

const INITIAL_ACCOUNTS = [
  {
    pk_user_account_id: "fake-1",
    email: "hieu.nd@tp-f.vn",
    status: 1,
    timestamp: "2026-03-01T08:00:00",
    role: { role_code: "OWNER", role_name: "Chủ cửa hàng" },
    profile: { full_name: "Nguyễn Đình Hiếu", phone_number: "0987654321" }
  },
  {
    pk_user_account_id: "fake-2",
    email: "anh.vd@tp-f.vn",
    status: 1,
    timestamp: "2026-03-02T09:30:00",
    role: { role_code: "SALES", role_name: "Sales" },
    profile: { full_name: "Võ Đức Anh", phone_number: "0945678901" }
  },
  {
    pk_user_account_id: "fake-3",
    email: "tuan.ba@tp-f.vn",
    status: 0,
    timestamp: "2026-03-04T10:15:00",
    role: { role_code: "ACCOUNTANT", role_name: "Kế toán" },
    profile: { full_name: "Bùi Tuấn Anh", phone_number: "0967890123" }
  },
  {
    pk_user_account_id: "fake-4",
    email: "mai.tt@tp-f.vn",
    status: -1,
    timestamp: "2026-03-05T14:45:00",
    role: { role_code: "WORKER", role_name: "Công nhân" },
    profile: { full_name: "Trần Thị Mai", phone_number: "0912345678" }
  },
  {
    pk_user_account_id: "fake-5",
    email: "lan.pt@tp-f.vn",
    status: 1,
    timestamp: "2026-03-06T11:20:00",
    role: { role_code: "SALES", role_name: "Sales" },
    profile: { full_name: "Phạm Thị Lan", phone_number: "0934567890" }
  }
];

/**
 * Common Modal Container
 */
const ModalContainer = ({ title, onClose, children, maxWidth = "max-w-md" }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
    <div className={cn("bg-white rounded-2xl w-full shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200", maxWidth)}>
      <div className="px-6 py-4 border-b flex items-center justify-between shrink-0" style={{ borderColor: "var(--grid-border)" }}>
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-400 hover:text-gray-600 cursor-pointer">
          <X size={20} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-6 text-gray-900">
        {children}
      </div>
    </div>
  </div>
);
//       </div>
//     </div>
//   </div>
// );

export default function OwnerEmployees() {
  const [activeTab, setActiveTab] = useState("Tất cả"); // Roles as tabs
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0 });

  // Modal states
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  const fetchAccounts = () => {
    setLoading(true);
    // Mimic API delay
    setTimeout(() => {
      if (accounts.length === 0) {
        setAccounts(INITIAL_ACCOUNTS);
        setPagination(prev => ({ ...prev, total: INITIAL_ACCOUNTS.length }));
      }
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleSearch = () => {
    // Search is handled via processedAccounts useMemo
  };

  const handleSaveAccount = (formData) => {
    if (editingAccount) {
      setAccounts(prev => prev.map(a =>
        a.pk_user_account_id === editingAccount.pk_user_account_id
          ? { ...a, ...formData, profile: { ...a.profile, ...formData }, role: { ...a.role, role_code: formData.role_id } }
          : a
      ));
      toast.success("Cập nhật tài khoản thành công");
    } else {
      const newAccount = {
        pk_user_account_id: `fake-${Date.now()}`,
        email: formData.email,
        status: 1,
        timestamp: new Date().toISOString(),
        role: { role_code: formData.role_id, role_name: ROLES.find(r => r.value === formData.role_id)?.label },
        profile: { full_name: formData.full_name, phone_number: formData.phone_number }
      };
      setAccounts(prev => [newAccount, ...prev]);
      toast.success("Tạo tài khoản thành công");
    }
    setShowAddEditModal(false);
  };

  const handleUpdateStatus = (newStatus) => {
    setAccounts(prev => prev.map(a =>
      a.pk_user_account_id === selectedAccount.pk_user_account_id
        ? { ...a, status: newStatus }
        : a
    ));
    toast.success("Đã cập nhật trạng thái");
    setShowStatusModal(false);
  };

  // Client-side filtering for active tab (Role) and horizontal status marker
  const processedAccounts = useMemo(() => {
    let result = accounts;

    // Search filter
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(a =>
        (a.email || "").toLowerCase().includes(s) ||
        (a.profile?.full_name || "").toLowerCase().includes(s) ||
        (a.profile?.phone_number || "").toLowerCase().includes(s)
      );
    }

    // Filter by Role (Tabs)
    if (activeTab !== "Tất cả") {
      result = result.filter(a => (a.role?.role_code || a.role_id) === activeTab);
    }

    // Filter by Status (Horizontal marker)
    if (statusFilter !== "Tất cả") {
      const statusValue = statusFilter === "Hoạt động" ? 1 : statusFilter === "Nghỉ" ? 0 : -1;
      result = result.filter(a => a.status === statusValue);
    }

    // Filter by date range (Account creation)
    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      result = result.filter((a) => new Date(a.timestamp) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      result = result.filter((a) => new Date(a.timestamp) <= to);
    }

    return result;
  }, [accounts, activeTab, statusFilter, dateFrom, dateTo, search]);

  const hasActiveFilters = statusFilter !== "Tất cả" || dateFrom || dateTo || search;

  const clearAllFilters = () => {
    setActiveTab("Tất cả");
    setStatusFilter("Tất cả");
    setDateFrom("");
    setDateTo("");
    setSearch("");
    handleSearch();
  };

  return (
    <>
      <PageHelmet title="Quản lý nhân sự | TPF-SIMS" />

      <div className="flex flex-col h-[calc(100vh-64px)] -m-6 p-6 space-y-4" style={{ backgroundColor: "var(--bg-main)" }}>
        {/* Header */}
        <div className="flex items-center justify-between shrink-0 mb-1">
          <div>
            <h1
              className="text-[22px] font-bold flex items-center gap-2.5"
              style={{ color: "var(--text-main)", letterSpacing: "-0.01em" }}
            >
              <Users size={24} style={{ color: "var(--brand-primary)" }} />
              Quản lý tài khoản & Nhân sự
            </h1>
            <p
              className="text-[13px] mt-1 font-medium italic"
              style={{ color: "var(--text-placeholder)" }}
            >
              {processedAccounts.length} nhân viên ({activeTab === "Tất cả" ? "tất cả vai trò" : ROLES.find(r => r.value === activeTab)?.label.toLowerCase()})
            </p>
          </div>

          <div className="flex items-center gap-3">
             <button 
               onClick={() => {
                 setEditingAccount(null);
                 setShowAddEditModal(true);
               }}
               className="h-10 px-4 rounded-xl flex items-center gap-2 text-[13px] font-bold text-white shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 hover:-translate-y-0.5 cursor-pointer"
               style={{ backgroundColor: "var(--brand-primary)", boxShadow: "0 4px 10px rgba(11, 87, 208, 0.2)" }}
             >
                <Plus size={18} />
                Thêm tài khoản
             </button>
          </div>
        </div>



        {/* Status Toolbar */}
        <div className="flex items-center gap-2 shrink-0 px-1 flex-wrap">
          {STATUS_OPTIONS.map((s) => {
            const isActive = statusFilter === s;
            const statusValue = s === "Hoạt động" ? 1 : s === "Nghỉ" ? 0 : s === "Khóa" ? -1 : null;
            const statusStyle = statusValue !== null ? STATUS_MAP[statusValue] : null;

            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                style={{
                  backgroundColor: isActive
                    ? (statusStyle ? statusStyle.bg : "#fff")
                    : "transparent",
                  color: isActive
                    ? (statusStyle ? statusStyle.text : "var(--text-main)")
                    : "var(--text-secondary)",
                  border: isActive
                    ? `1.5px solid ${statusStyle ? statusStyle.border : "var(--grid-border)"}`
                    : "1.5px solid transparent",
                }}
              >
                {s !== "Tất cả" && (
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor: statusStyle ? statusStyle.text : "var(--text-secondary)",
                      opacity: isActive ? 1 : 0.5,
                    }}
                  />
                )}
                {s}
              </button>
            );
          })}
        </div>

        {/* Search & Table Card */}
        <div className="flex flex-col bg-white rounded-2xl flex-1 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)" }}>
          {/* Search Header */}
          <div
            className="px-4 py-3 border-b shrink-0 flex flex-wrap items-center justify-between gap-3"
            style={{ borderColor: "var(--grid-border)" }}
          >
            <div className="relative w-full max-w-md shrink-0">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-placeholder)" }}
              />
              <input
                type="text"
                placeholder="Tìm mã, email, tên nhân viên..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full h-9 pl-10 pr-8 rounded-lg text-[13px] focus:outline-none focus:ring-2 transition"
                style={{
                  border: "1px solid var(--grid-border)",
                  backgroundColor: "var(--bg-main)",
                  color: "var(--text-main)",
                }}
              />
              {search && (
                <button
                  onClick={() => { setSearch(""); handleSearch(); }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
                  style={{ color: "var(--text-placeholder)" }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5 shrink-0 overflow-x-auto min-w-0">
              <div className="flex items-center gap-1.5 shrink-0">
                 <Layers size={14} style={{ color: "var(--text-placeholder)" }} />
                 <select
                    value={activeTab}
                    onChange={(e) => setActiveTab(e.target.value)}
                    className="h-9 px-3 pr-8 rounded-lg text-[13px] focus:outline-none focus:ring-1 transition appearance-none cursor-pointer"
                    style={{
                      border: `1px solid ${activeTab !== "Tất cả" ? "var(--brand-primary)" : "var(--grid-border)"}`,
                      backgroundColor: activeTab !== "Tất cả" ? "var(--status-focus)" : "var(--bg-main)",
                      color: activeTab !== "Tất cả" ? "var(--brand-primary)" : "var(--text-main)",
                      fontWeight: activeTab !== "Tất cả" ? 600 : 400,
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 8px center",
                    }}
                    title="Lọc theo vai trò"
                 >
                    {ROLES.map(r => (
                       <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                 </select>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Calendar
                  size={14}
                  style={{ color: "var(--text-placeholder)" }}
                />
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-9 px-3 rounded-lg text-[13px] focus:outline-none focus:ring-2 transition"
                  style={{
                    border: `1px solid ${dateFrom ? "var(--brand-primary)" : "var(--grid-border)"}`,
                    backgroundColor: dateFrom
                      ? "var(--status-focus)"
                      : "var(--bg-main)",
                    color: dateFrom
                      ? "var(--brand-primary)"
                      : "var(--text-main)",
                    fontWeight: dateFrom ? 600 : 400,
                  }}
                  title="Từ ngày"
                />
              </div>

              <span
                className="text-[12px] shrink-0"
                style={{ color: "var(--text-placeholder)" }}
              >
                đến
              </span>

              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-9 px-3 rounded-lg text-[13px] focus:outline-none focus:ring-2 transition shrink-0"
                style={{
                  border: `1px solid ${dateTo ? "var(--brand-primary)" : "var(--grid-border)"}`,
                  backgroundColor: dateTo
                    ? "var(--status-focus)"
                    : "var(--bg-main)",
                  color: dateTo ? "var(--brand-primary)" : "var(--text-main)",
                  fontWeight: dateTo ? 600 : 400,
                }}
                title="Đến ngày"
              />

              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="h-9 px-3 rounded-lg text-[13px] font-medium flex-shrink-0 flex items-center gap-1.5 cursor-pointer transition hover:opacity-80"
                  style={{
                    color: "var(--status-error)",
                    backgroundColor: "#FEF2F2",
                    border: "1px solid #FECACA",
                  }}
                >
                  <XCircle size={14} />
                  Xóa bộ lọc
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left relative text-[13px]">
              <thead
                className="sticky top-0 z-10"
                style={{
                  backgroundColor: "var(--grid-header-bg)",
                  borderBottom: "1px solid var(--grid-border)",
                }}
              >
                <tr>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-center w-[50px]" style={{ color: "var(--text-placeholder)" }}>STT</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-placeholder)" }}>Nhân viên</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-placeholder)" }}>Liên hệ</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-placeholder)" }}>Vai trò</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-placeholder)" }}>Trạng thái</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-placeholder)" }}>Ngày tạo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                        <span className="text-gray-500 font-medium">Đang tải dữ liệu...</span>
                      </div>
                    </td>
                  </tr>
                ) : processedAccounts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div
                          className="w-16 h-16 rounded-2xl flex items-center justify-center"
                          style={{ backgroundColor: "var(--bg-main)" }}
                        >
                          <Users size={28} strokeWidth={1.5} style={{ color: "var(--text-placeholder)" }} />
                        </div>
                        <p className="text-gray-400 font-bold">Không tìm thấy nhân viên nào phù hợp</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  processedAccounts.slice((pagination.page - 1) * pagination.limit, pagination.page * pagination.limit).map((a, idx) => {
                    const st = STATUS_MAP[String(a.status)] ?? STATUS_MAP[1];
                    const roleLabel = ROLES.find(r => r.value === (a.role?.role_code || a.role_id))?.label || a.role?.role_name || a.role_id;

                    return (
                      <tr key={a.pk_user_account_id} className="hover:bg-gray-50/50 transition-all group relative" style={{ borderBottom: "1px solid var(--grid-border)" }}>
                        <td className="px-4 py-3 text-center text-[13px] font-medium" style={{ color: "var(--text-secondary)" }}>
                          {(pagination.page - 1) * pagination.limit + idx + 1}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold overflow-hidden border border-blue-100">
                              {a.profile?.full_name ? a.profile.full_name.charAt(0).toUpperCase() : <User size={18} />}
                            </div>
                            <div>
                              <p className="font-bold text-[13px] mb-0.5" style={{ color: "var(--text-main)" }}>{a.profile?.full_name || "Chưa cập nhật"}</p>
                              <p className="text-[11px] flex items-center gap-1 font-mono" style={{ color: "var(--text-placeholder)" }}>
                                <Mail size={12} className="opacity-50" /> {a.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[13px] font-medium whitespace-nowrap" style={{ color: "var(--text-main)" }}>
                          <div className="flex items-center gap-1.5">
                            <Phone size={13} style={{ color: "var(--text-placeholder)" }} /> {a.profile?.phone_number || "—"}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-tighter">
                            <Shield size={12} /> {roleLabel}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold"
                            style={{ backgroundColor: st.bg, color: st.text, border: `1px solid ${st.border}` }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: st.text }} />
                            {st.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[13px] font-medium relative overflow-visible" style={{ color: "var(--text-secondary)" }}>
                          {a.timestamp ? new Date(a.timestamp).toLocaleDateString("vi-VN") : "—"}

                          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none group-hover:pointer-events-auto">
                            <div className="flex justify-end gap-1.5 bg-white/90 backdrop-blur-sm p-1 rounded-xl shadow-sm border border-gray-100 pointer-events-auto">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2.5 rounded-lg flex items-center justify-center transition cursor-pointer hover:bg-gray-100 gap-1.5 text-[12px] font-bold text-gray-600"
                                onClick={() => { setEditingAccount(a); setShowAddEditModal(true); }}
                                title="Chỉnh sửa"
                              >
                                <Pencil size={14} /> Sửa
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                  "h-8 px-2.5 rounded-lg flex items-center justify-center transition cursor-pointer hover:bg-gray-100 gap-1.5 text-[12px] font-bold",
                                  String(a.status) === "-1" ? "text-emerald-600" : "text-red-500"
                                )}
                                onClick={() => { setSelectedAccount(a); setShowStatusModal(true); }}
                                title={String(a.status) === "-1" ? "Mở khóa" : "Khóa/Tạm nghỉ"}
                              >
                                {String(a.status) === "-1" ? <Unlock size={14} /> : <Lock size={14} />}
                                {String(a.status) === "-1" ? "Mở khóa" : "Khóa"}
                              </Button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {processedAccounts.length > 0 && (
            <div
              className="flex items-center justify-between px-6 py-3 border-t shrink-0"
              style={{
                borderColor: "var(--grid-border)",
                backgroundColor: "var(--bg-main)",
              }}
            >
              <div
                className="text-[13px]"
                style={{ color: "var(--text-secondary)" }}
              >
                Tổng số bản ghi:{" "}
                <span
                  className="font-bold"
                  style={{ color: "var(--text-main)" }}
                >
                  {processedAccounts.length}
                </span>
              </div>

              <div className="flex items-center gap-6">
                {/* Items per page indicator */}
                <div className="flex items-center gap-2">
                  <span
                    className="text-[13px]"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Số bản ghi/trang
                  </span>
                  <select
                    value={pagination.limit}
                    onChange={(e) => {
                      setPagination((p) => ({ ...p, limit: Number(e.target.value), page: 1 }));
                    }}
                    className="h-8 px-2 pr-6 rounded-md text-[13px] border cursor-pointer focus:outline-none focus:ring-1 transition appearance-none"
                    style={{
                      borderColor: "var(--grid-border)",
                      backgroundColor: "#fff",
                      color: "var(--text-main)",
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 8px center",
                    }}
                  >
                    {[15, 30, 50, 100].map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Range Info */}
                <div
                  className="text-[13px]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <span
                    className="font-bold"
                    style={{ color: "var(--text-main)" }}
                  >
                    {(pagination.page - 1) * pagination.limit + 1} -{" "}
                    {Math.min(pagination.page * pagination.limit, processedAccounts.length)}
                  </span>{" "}
                  bản ghi
                </div>

                {/* Arrows */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }))}
                    disabled={pagination.page === 1}
                    className="flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer hover:bg-gray-200 rounded p-1"
                    style={{ color: "var(--text-main)" }}
                  >
                    <ChevronLeft size={16} strokeWidth={2.5} />
                  </button>
                  <button
                    onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                    disabled={pagination.page * pagination.limit >= processedAccounts.length}
                    className="flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer hover:bg-gray-200 rounded p-1"
                    style={{ color: "var(--text-main)" }}
                  >
                    <ChevronRight size={16} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddEditModal && (
        <AccountFormModal
          account={editingAccount}
          onClose={() => setShowAddEditModal(false)}
          onSave={handleSaveAccount}
        />
      )}

      {/* Status Modal */}
      {showStatusModal && (
        <StatusModal
          account={selectedAccount}
          onClose={() => setShowStatusModal(false)}
          onUpdate={handleUpdateStatus}
        />
      )}
    </>
  );
}

/**
 * Account Form Modal Component
 */
function AccountFormModal({ account, onClose, onSave }) {
  const [formData, setFormData] = useState({
    email: account?.email || "",
    password: "",
    full_name: account?.profile?.full_name || "",
    phone_number: account?.profile?.phone_number || "",
    role_id: account?.role?.role_code || account?.role_id || "SALES",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <ModalContainer title={account ? "Cập nhật tài khoản nhân sự" : "Tạo tài khoản nhân viên mới"} onClose={onClose} maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Họ tên nhân viên</label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              required
              className="pl-11 h-11 rounded-xl border-gray-200 focus:ring-blue-500/20 shadow-none bg-gray-50/50"
              placeholder="Nhập họ và tên đầy đủ..."
              value={formData.full_name}
              onChange={e => setFormData({ ...formData, full_name: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email (Dùng để đăng nhập)</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                required
                type="email"
                disabled={!!account}
                className="pl-11 h-11 rounded-xl disabled:bg-gray-100 border-gray-200 shadow-none bg-gray-50/50"
                placeholder="example@gmail.com"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Mật khẩu truy cập</label>
            <Input
              required={!account}
              type="password"
              className="h-11 rounded-xl border-gray-200 shadow-none bg-gray-50/50"
              placeholder={account ? "Để trống nếu không muốn đổi" : "••••••••"}
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Số điện thoại</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                className="pl-11 h-11 rounded-xl border-gray-200 shadow-none bg-gray-50/50"
                placeholder="09xx..."
                value={formData.phone_number}
                onChange={e => setFormData({ ...formData, phone_number: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Vai trò hệ thống</label>
            <select
              value={formData.role_id}
              onChange={e => setFormData({ ...formData, role_id: e.target.value })}
              className="flex h-11 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all shadow-none"
            >
              <option value="SALES">Nhân viên kinh doanh</option>
              <option value="ACCOUNTANT">Kế toán</option>
              <option value="WORKER">Thợ</option>
              <option value="OWNER">Chủ cửa hàng</option>
            </select>
          </div>
        </div>

        <div className="pt-4 flex gap-3">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1 rounded-full h-12 font-bold text-gray-400 hover:bg-gray-50">Hủy</Button>
          <Button type="submit" className="flex-1 rounded-full h-12 font-bold bg-green-600 hover:bg-green-700 shadow-md">
            {account ? "Cập nhật" : "Tạo tài khoản"}
          </Button>
        </div>
      </form>
    </ModalContainer>
  );
}

/**
 * Status / Lock Modal Component
 */
function StatusModal({ account, onClose, onUpdate }) {
  return (
    <ModalContainer title="Quản lý trạng thái tài khoản" onClose={onClose} maxWidth="max-w-sm">
      <div className="text-center space-y-4">
        <div className={cn(
          "w-16 h-16 rounded-3xl mx-auto flex items-center justify-center shadow-sm border rotate-3",
          String(account.status) === "-1" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-red-50 text-red-600 border-red-100"
        )}>
          {String(account.status) === "-1" ? <Unlock size={30} /> : <Lock size={30} />}
        </div>
        <div>
          <h4 className="font-bold text-gray-900 text-lg">
            {String(account.status) === "-1" ? "Mở khóa tài khoản?" : "Thay đổi trạng thái?"}
          </h4>
          <p className="text-[13px] text-gray-500 mt-2 leading-relaxed px-4">
            {String(account.status) === "-1"
              ? "Tài khoản nhân viên này sẽ được khôi phục quyền truy cập vào hệ thống ngay lập tức."
              : "Chọn trạng thái mới cho nhân viên. Khi bị khóa, nhân viên sẽ không thể đăng nhập."}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2 pt-4">
          {String(account.status) === "-1" ? (
            <Button onClick={() => onUpdate(1)} className="w-full rounded-full h-12 bg-green-600 hover:bg-green-700 font-bold shadow-sm text-white">Mở khóa tài khoản</Button>
          ) : (
            <>
              <Button onClick={() => onUpdate(-1)} variant="destructive" className="w-full rounded-full h-12 font-bold shadow-sm">Khóa vĩnh viễn</Button>
              <Button onClick={() => onUpdate(0)} variant="secondary" className="w-full rounded-full h-12 font-bold bg-gray-100 border-gray-200">Nghỉ (Tạm khóa)</Button>
            </>
          )}
          <Button onClick={onClose} variant="ghost" className="w-full rounded-full h-10 font-bold text-gray-400 mt-2">Đóng</Button>
        </div>
      </div>
    </ModalContainer>
  );
}
