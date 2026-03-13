import { useState, useMemo, useEffect } from "react";
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

export default function OwnerEmployees() {
  const [activeTab, setActiveTab] = useState("Tất cả"); // Roles filter
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0 });

  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  const fetchAccounts = () => {
    setLoading(true);
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

  const handleSearch = () => {};

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

  const handleDeleteAccount = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản này? Thao tác này không thể hoàn tác.")) {
      setAccounts(prev => prev.filter(a => a.pk_user_account_id !== id));
      toast.success("Đã xóa tài khoản thành công");
    }
  };

  const processedAccounts = useMemo(() => {
    let result = accounts;

    if (search) {
      const s = search.toLowerCase();
      result = result.filter(a =>
        (a.email || "").toLowerCase().includes(s) ||
        (a.profile?.full_name || "").toLowerCase().includes(s) ||
        (a.profile?.phone_number || "").toLowerCase().includes(s)
      );
    }

    // Hide OWNER accounts
    result = result.filter(a => (a.role?.role_code || a.role_id) !== "OWNER");

    if (activeTab !== "Tất cả") {
      result = result.filter(a => (a.role?.role_code || a.role_id) === activeTab);
    }

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
  }, [accounts, activeTab, dateFrom, dateTo, search]);

  const hasActiveFilters = activeTab !== "Tất cả" || dateFrom || dateTo || search;

  const clearAllFilters = () => {
    setActiveTab("Tất cả");
    setDateFrom("");
    setDateTo("");
    setSearch("");
  };

  return (
    <>
      <PageHelmet title="Quản lý nhân sự | TPF-SIMS" />

      <div className="flex flex-col h-[calc(100vh-64px)] -m-6 p-6 space-y-4" style={{ backgroundColor: "var(--bg-main)" }}>
        <div className="flex items-center justify-between shrink-0 mb-1">
          <div>
            <h1 className="text-[22px] font-bold flex items-center gap-2.5" style={{ color: "var(--text-main)", letterSpacing: "-0.01em" }}>
              <Users size={24} style={{ color: "var(--brand-primary)" }} />
              Quản lý tài khoản & Nhân sự
            </h1>
            <p className="text-[13px] mt-1 font-medium italic" style={{ color: "var(--text-placeholder)" }}>
              {processedAccounts.length} nhân viên ({activeTab === "Tất cả" ? "tất cả vai trò" : ROLES.find(r => r.value === activeTab)?.label.toLowerCase()})
            </p>
          </div>

          <button 
            onClick={() => { setEditingAccount(null); setShowAddEditModal(true); }}
            className="h-10 px-4 rounded-xl flex items-center gap-2 text-[13px] font-bold text-white shadow-sm hover:-translate-y-0.5 transition cursor-pointer"
            style={{ backgroundColor: "var(--brand-primary)", boxShadow: "0 4px 10px rgba(16, 185, 129, 0.2)" }}
          >
            <Plus size={18} /> Thêm tài khoản
          </button>
        </div>

        <div className="flex flex-col bg-white rounded-2xl flex-1 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div className="px-4 py-3 border-b shrink-0 flex flex-wrap items-center justify-between gap-3" style={{ borderColor: "var(--grid-border)" }}>
            <div className="relative w-full max-w-md shrink-0">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-placeholder)" }} />
              <input
                type="text"
                placeholder="Tìm email, tên nhân viên..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-10 pr-8 rounded-lg text-[13px] focus:outline-none transition"
                style={{ border: "1px solid var(--grid-border)", backgroundColor: "var(--bg-main)" }}
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400">
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
                    className="h-9 px-3 pr-8 rounded-lg text-[13px] border cursor-pointer focus:outline-none appearance-none"
                    style={{ backgroundColor: activeTab !== "Tất cả" ? "var(--status-focus)" : "var(--bg-main)", color: activeTab !== "Tất cả" ? "var(--brand-primary)" : "var(--text-main)" }}
                 >
                    {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                 </select>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Calendar size={14} style={{ color: "var(--text-placeholder)" }} />
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-9 px-3 rounded-lg text-[13px] border focus:outline-none"
                />
                <span className="text-[12px] text-gray-400">đến</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-9 px-3 rounded-lg text-[13px] border focus:outline-none"
                />
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="h-9 px-3 rounded-lg text-[13px] font-medium text-red-500 bg-red-50 border border-red-100 flex items-center gap-1.5 cursor-pointer hover:bg-red-100 transition"
                >
                  <XCircle size={14} /> Xóa bộ lọc
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left relative text-[13px]">
              <thead className="sticky top-0 z-10" style={{ backgroundColor: "var(--grid-header-bg)", borderBottom: "1px solid var(--grid-border)" }}>
                <tr>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-center w-[50px] text-gray-400">STT</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Nhân viên</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Liên hệ</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Vai trò</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Ngày tạo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={5} className="py-20 text-center text-gray-400"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" /> Đang tải dữ liệu...</td></tr>
                ) : processedAccounts.length === 0 ? (
                  <tr><td colSpan={5} className="py-20 text-center text-gray-400"><Users size={28} className="mx-auto mb-3 opacity-20" /> Không tìm thấy nhân viên nào</td></tr>
                ) : (
                  processedAccounts.slice((pagination.page - 1) * pagination.limit, pagination.page * pagination.limit).map((a, idx) => {
                    const roleLabel = ROLES.find(r => r.value === (a.role?.role_code || a.role_id))?.label || a.role?.role_name || a.role_id;

                    return (
                      <tr key={a.pk_user_account_id} className="group hover:bg-emerald-50/30 transition-all border-b border-gray-100 relative">
                        <td className="px-4 py-3 text-center text-gray-500">{(pagination.page - 1) * pagination.limit + idx + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold border border-emerald-100 uppercase">
                              {a.profile?.full_name?.charAt(0) || <User size={18} />}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{a.profile?.full_name || "Chưa cập nhật"}</p>
                              <p className="text-[11px] text-gray-400 flex items-center gap-1"><Mail size={12} /> {a.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-700 whitespace-nowrap"><div className="flex items-center gap-1.5"><Phone size={13} className="text-gray-400" /> {a.profile?.phone_number || "—"}</div></td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-tighter">
                            <Shield size={12} /> {roleLabel}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 relative">
                          {a.timestamp ? new Date(a.timestamp).toLocaleDateString("vi-VN") : "—"}
                          
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
                            <div className="flex gap-1.5 p-1 bg-white border border-gray-100 rounded-xl shadow-sm">
                              <Button variant="ghost" size="sm" className="h-8 px-2.5 rounded-lg text-[12px] font-bold text-gray-600 hover:bg-gray-100" onClick={() => { setEditingAccount(a); setShowAddEditModal(true); }}>
                                <Pencil size={14} className="mr-1.5" /> Sửa
                              </Button>
                              <Button variant="ghost" size="sm" className={cn("h-8 px-2.5 rounded-lg text-[12px] font-bold hover:bg-gray-100", String(a.status) === "-1" ? "text-emerald-600" : "text-amber-500")} onClick={() => { setSelectedAccount(a); setShowStatusModal(true); }}>
                                {String(a.status) === "-1" ? <Unlock size={14} /> : <Lock size={14} />} {String(a.status) === "-1" ? "Mở khóa" : "Trạng thái"}
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 px-2.5 rounded-lg text-[12px] font-bold text-red-500 hover:bg-red-50" onClick={() => handleDeleteAccount(a.pk_user_account_id)}>
                                <Trash2 size={14} className="mr-1.5" /> Xóa
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

          {processedAccounts.length > 0 && (
            <div className="flex items-center justify-between px-6 py-3 border-t bg-gray-50/30" style={{ borderColor: "var(--grid-border)" }}>
              <div className="text-[13px] text-gray-500">Tổng số: <span className="font-bold text-gray-900">{processedAccounts.length}</span> nhân sự</div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <button onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))} disabled={pagination.page === 1} className="p-1 disabled:opacity-20 cursor-pointer hover:bg-gray-200 rounded"><ChevronLeft size={16} /></button>
                  <span className="text-[13px] font-bold">{pagination.page}</span>
                  <button onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))} disabled={pagination.page * pagination.limit >= processedAccounts.length} className="p-1 disabled:opacity-20 cursor-pointer hover:bg-gray-200 rounded"><ChevronRight size={16} /></button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showAddEditModal && <AccountFormModal account={editingAccount} onClose={() => setShowAddEditModal(false)} onSave={handleSaveAccount} />}
      {showStatusModal && <StatusModal account={selectedAccount} onClose={() => setShowStatusModal(false)} onUpdate={handleUpdateStatus} />}
    </>
  );
}

function AccountFormModal({ account, onClose, onSave }) {
  const [formData, setFormData] = useState({
    email: account?.email || "",
    password: "",
    full_name: account?.profile?.full_name || "",
    phone_number: account?.profile?.phone_number || "",
    role_id: account?.role?.role_code || account?.role_id || "SALES",
  });

  return (
    <ModalContainer title={account ? "Cập nhật tài khoản" : "Thêm tài khoản mới"} onClose={onClose}>
      <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Họ tên</label>
          <Input required className="rounded-xl h-11" placeholder="Họ và tên..." value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Email đăng nhập</label>
          <Input required type="email" disabled={!!account} className="rounded-xl h-11 disabled:opacity-50" placeholder="email@tpf.vn" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
        </div>
        {!account && (
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Mật khẩu</label>
            <Input required type="password" placeholder="••••••••" className="rounded-xl h-11" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Số điện thoại</label>
            <Input className="rounded-xl h-11" placeholder="09xxxxxx" value={formData.phone_number} onChange={e => setFormData({ ...formData, phone_number: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Vai trò</label>
            <select value={formData.role_id} onChange={e => setFormData({ ...formData, role_id: e.target.value })} className="flex h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:outline-none">
              <option value="SALES">Kinh doanh</option>
              <option value="ACCOUNTANT">Kế toán</option>
              <option value="WORKER">Thợ</option>
            </select>
          </div>
        </div>
        <div className="pt-4 flex gap-3">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1 h-12 rounded-xl font-bold">Hủy</Button>
          <Button type="submit" className="flex-1 h-12 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md">Lưu tài khoản</Button>
        </div>
      </form>
    </ModalContainer>
  );
}

function StatusModal({ account, onClose, onUpdate }) {
  return (
    <ModalContainer title="Trạng thái tài khoản" onClose={onClose} maxWidth="max-w-sm">
      <div className="text-center space-y-4">
        <div className={cn("w-16 h-16 rounded-3xl mx-auto flex items-center justify-center border-2", String(account.status) === "-1" ? "bg-red-50 text-red-600 border-red-100" : "bg-emerald-50 text-emerald-600 border-emerald-100")}>
          {String(account.status) === "-1" ? <Lock size={30} /> : <Unlock size={30} />}
        </div>
        <h4 className="font-bold text-gray-900">{String(account.status) === "-1" ? "Mở khóa tài khoản?" : "Cập nhật trạng thái?"}</h4>
        <div className="grid grid-cols-1 gap-2">
          {String(account.status) === "-1" ? (
            <Button onClick={() => onUpdate(1)} className="h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold">Mở khóa tài khoản</Button>
          ) : (
            <>
              <Button onClick={() => onUpdate(-1)} className="h-12 rounded-xl border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 border bg-red-50/50 font-bold">Khóa truy cập</Button>
              <Button onClick={() => onUpdate(0)} className="h-12 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50 border bg-white font-bold">Tạm nghỉ</Button>
            </>
          )}
          <Button onClick={onClose} variant="ghost" className="h-10 rounded-xl text-gray-400 font-medium">Đóng</Button>
        </div>
      </div>
    </ModalContainer>
  );
}
