import { useState, useMemo } from "react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import { Search, Plus, Eye, Users, FileText, ChevronLeft, ChevronRight, X, Phone, MapPin, Building2, User } from "lucide-react";

// ===================== STATIC DATA =====================
const INITIAL_CUSTOMERS = [
  { id: "KH001", code: "KH-0001", name: "Đinh Quang Hiếu", phone: "0989012345", address: "Hà Nội", ordersCount: 2, totalSpent: 2400000, debt: 0 },
  { id: "KH002", code: "KH-0002", name: "Nguyễn Văn Hoàng", phone: "0901234567", address: "Bắc Ninh", ordersCount: 15, totalSpent: 125000000, debt: 15000000 },
  { id: "KH003", code: "KH-0003", name: "Công ty Nội Thất Xanh", phone: "0945678901", address: "Hải Phòng", ordersCount: 42, totalSpent: 890000000, debt: 45000000 },
  { id: "KH004", code: "KH-0004", name: "Võ Đức Anh", phone: "0931234567", address: "Hà Nội", ordersCount: 8, totalSpent: 34000000, debt: 0 },
  { id: "KH005", code: "KH-0005", name: "Bùi Tuấn Anh", phone: "0967890123", address: "Thanh Hóa", ordersCount: 5, totalSpent: 18500000, debt: 2000000 },
  { id: "KH006", code: "KH-0006", name: "Lê Minh Tuấn", phone: "0923456789", address: "Hà Nam", ordersCount: 1, totalSpent: 8900000, debt: 0 },
  { id: "KH007", code: "KH-0007", name: "Nguyễn Thị Hồng", phone: "0919012345", address: "Hưng Yên", ordersCount: 3, totalSpent: 12400000, debt: 1000000 },
  { id: "KH008", code: "KH-0008", name: "Vũ Phương Thảo", phone: "0990123456", address: "Hà Nội", ordersCount: 12, totalSpent: 230000000, debt: 0 },
  { id: "KH009", code: "KH-0009", name: "Phạm Thị Lan", phone: "0934567890", address: "Vĩnh Phúc", ordersCount: 1, totalSpent: 125000000, debt: 50000000 },
  { id: "KH010", code: "KH-0010", name: "Đặng Thùy Linh", phone: "0956789012", address: "Bắc Giang", ordersCount: 9, totalSpent: 45000000, debt: 0 },
  { id: "KH011", code: "KH-0011", name: "Hoàng Nguyệt Ánh", phone: "0978901234", address: "Thái Nguyên", ordersCount: 2, totalSpent: 56000000, debt: 0 },
  { id: "KH012", code: "KH-0012", name: "Trần Thị Mai", phone: "0912345678", address: "Hà Nội", ordersCount: 6, totalSpent: 62000000, debt: 5000000 },
  { id: "KH013", code: "KH-0013", name: "Đại lý Tiến Phát", phone: "0888123456", address: "Nam Định", ordersCount: 28, totalSpent: 560000000, debt: 120000000 },
  { id: "KH014", code: "KH-0014", name: "Nội thất Hoa Ban", phone: "0777123456", address: "Hòa Bình", ordersCount: 19, totalSpent: 340000000, debt: 0 },
  { id: "KH015", code: "KH-0015", name: "Lê Thị Thanh Hằng", phone: "0908901234", address: "Hà Nội", ordersCount: 1, totalSpent: 1800000, debt: 0 },
  { id: "KH016", code: "KH-0016", name: "Võ Quốc Bảo", phone: "0920123456", address: "Ninh Bình", ordersCount: 14, totalSpent: 165000000, debt: 25000000 },
  { id: "KH017", code: "KH-0017", name: "Hoàng Đức Thịnh", phone: "0953456789", address: "Hà Nội", ordersCount: 2, totalSpent: 91100000, debt: 0 },
  { id: "KH018", code: "KH-0018", name: "Cửa hàng Gỗ Mỹ Nghệ", phone: "0981112233", address: "Bắc Ninh", ordersCount: 35, totalSpent: 750000000, debt: 80000000 },
];

// Mock Purchase History
const MOCK_ORDER_HISTORY = [
  { id: "DH001", code: "DH-1025", date: "2024-03-01 09:30", total: 15000000, status: "Hoàn thành" },
  { id: "DH002", code: "DH-1028", date: "2024-03-05 14:15", total: 24500000, status: "Đang giao" },
  { id: "DH003", code: "DH-1042", date: "2024-03-10 10:00", total: 8900000, status: "Đã hủy" },
  { id: "DH004", code: "DH-1056", date: "2024-03-15 16:45", total: 42000000, status: "Hoàn thành" },
];

// Mock Debt Transactions
const MOCK_DEBT_TRANSACTIONS = [
  { id: "TX001", date: "2024-02-15 08:30", note: "Mua đơn hàng DH-1001", change: 50000000, balance: 50000000 },
  { id: "TX002", date: "2024-02-20 10:15", note: "Thanh toán chuyển khoản", change: -20000000, balance: 30000000 },
  { id: "TX003", date: "2024-03-01 11:00", note: "Mua đơn hàng DH-1025", change: 15000000, balance: 45000000 },
  { id: "TX004", date: "2024-03-05 15:30", note: "Thanh toán tiền mặt", change: -10000000, balance: 35000000 },
  { id: "TX005", date: "2024-03-10 09:00", note: "Hoàn tiền hủy đơn DH-1042", change: -8900000, balance: 26100000 },
];
// ===================== HELPERS =====================
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
};

// ===================== SUB-COMPONENTS =====================
const ModalContainer = ({ title, onClose, children, maxWidth = "max-w-2xl" }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
    <div className={`bg-white rounded-2xl w-full ${maxWidth} shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200`}>
      <div className="px-6 py-4 border-b flex items-center justify-between shrink-0" style={{ borderColor: "var(--grid-border)" }}>
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        {children}
      </div>
    </div>
  </div>
);

const CustomerDetailsModal = ({ customer, onClose }) => {
  return (
    <ModalContainer title="Chi tiết hồ sơ khách hàng" onClose={onClose}>
      <div className="space-y-6">
        {/* Profile Card */}
        <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-bold shrink-0">
            {customer.name.split(" ").pop().charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h4 className="text-lg font-bold text-gray-900 truncate">{customer.name}</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 gap-x-4 text-[13px] text-gray-600">
              <p className="flex items-center gap-1.5"><Phone size={13} className="text-gray-400" /> {customer.phone}</p>
              <p className="flex items-center gap-1.5"><MapPin size={13} className="text-gray-400" /> {customer.address}</p>
              <p className="flex items-center gap-1.5 font-mono text-blue-600"><Building2 size={13} className="text-gray-400" /> {customer.code}</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 rounded-xl border border-gray-100 bg-white shadow-sm">
            <p className="text-[11px] font-bold text-gray-400 uppercase mb-1">Tổng đơn</p>
            <p className="text-lg font-bold text-gray-900">{customer.ordersCount}</p>
          </div>
          <div className="p-3 rounded-xl border border-gray-100 bg-white shadow-sm">
            <p className="text-[11px] font-bold text-gray-400 uppercase mb-1">Tổng chi tiêu</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(customer.totalSpent)}</p>
          </div>
          <div className="p-3 rounded-xl border border-gray-100 bg-white shadow-sm">
            <p className="text-[11px] font-bold text-gray-400 uppercase mb-1">Công nợ</p>
            <p className={`text-lg font-bold ${customer.debt > 0 ? "text-red-600" : "text-green-600"}`}>
              {customer.debt > 0 ? formatCurrency(customer.debt) : "—"}
            </p>
          </div>
        </div>

        {/* Recent Orders */}
        <div>
          <h5 className="text-[13px] font-bold text-gray-900 mb-3 flex items-center gap-2">
            <FileText size={15} className="text-blue-500" /> Lịch sử mua hàng gần nhất
          </h5>
          <div className="rounded-xl border border-gray-100 overflow-hidden shadow-sm">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-2 font-bold text-gray-500 text-center w-[40px]">STT</th>
                  <th className="px-4 py-2 font-bold text-gray-500">Mã đơn</th>
                  <th className="px-4 py-2 font-bold text-gray-500">Ngày mua</th>
                  <th className="px-4 py-2 font-bold text-gray-500 text-right">Giá trị</th>
                  <th className="px-4 py-2 font-bold text-gray-500 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {MOCK_ORDER_HISTORY.map((o, idx) => (
                  <tr key={o.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-2.5 text-center text-[12px] font-medium text-gray-500">{idx + 1}</td>
                    <td className="px-4 py-2.5 font-bold font-mono text-blue-600">{o.code}</td>
                    <td className="px-4 py-2.5 text-gray-600">{o.date}</td>
                    <td className="px-4 py-2.5 text-right font-bold text-gray-900">{formatCurrency(o.total)}</td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${o.status === "Hoàn thành" ? "bg-green-100 text-green-700" :
                          o.status === "Đang giao" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                        }`}>{o.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-[11px] text-center text-gray-400 italic">
          * Thông tin được cập nhật tự động từ hệ thống bán hàng và kế toán
        </p>
      </div>
    </ModalContainer>
  );
};

const DebtHistoryModal = ({ customer, onClose }) => {
  // Tinh toán sơ bộ từ mock data
  const totalIncurred = MOCK_DEBT_TRANSACTIONS.reduce((acc, t) => t.change > 0 ? acc + t.change : acc, 0);
  const totalPaid = Math.abs(MOCK_DEBT_TRANSACTIONS.reduce((acc, t) => t.change < 0 ? acc + t.change : acc, 0));

  return (
    <ModalContainer title="Sao kê lịch sử công nợ" onClose={onClose} maxWidth="max-w-4xl">
      <div className="space-y-6">
        {/* Customer Info Mini Header */}
        <div className="flex items-center justify-between pb-4 border-b border-dashed border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
              <Users size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">{customer.name}</h4>
              <p className="text-[12px] text-gray-500">{customer.code} • {customer.phone}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-bold text-gray-400 uppercase">Dư nợ hiện tại</p>
            <h4 className="text-xl font-black text-red-600">{formatCurrency(customer.debt)}</h4>
          </div>
        </div>

        {/* Summary Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 shadow-sm transition hover:shadow-md">
            <p className="text-[11px] font-bold text-gray-500 uppercase flex items-center gap-1.5 mb-1">
              <Plus size={12} className="text-red-500" /> Tổng tiền mua
            </p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(totalIncurred)}</p>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 shadow-sm transition hover:shadow-md">
            <p className="text-[11px] font-bold text-gray-500 uppercase flex items-center gap-1.5 mb-1">
              <ChevronLeft size={12} className="text-green-500" /> Tổng tiền đã trả
            </p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(totalPaid)}</p>
          </div>
          <div className="p-4 rounded-2xl bg-red-50 border border-red-100 shadow-sm transition hover:shadow-md">
            <p className="text-[11px] font-bold text-red-600 uppercase flex items-center gap-1.5 mb-1">
              <Building2 size={12} /> Còn lại phải thu
            </p>
            <p className="text-lg font-bold text-red-600">{formatCurrency(customer.debt)}</p>
          </div>
        </div>

        {/* Improved Transactions Table */}
        <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm bg-white">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-[#F8FAFC] border-b border-gray-200">
              <tr>
                <th className="px-4 py-4 font-bold text-gray-600 text-[11px] uppercase tracking-wider text-center w-[50px]">STT</th>
                <th className="px-6 py-4 font-bold text-gray-600 text-[11px] uppercase tracking-wider">Thời gian</th>
                <th className="px-6 py-4 font-bold text-gray-600 text-[11px] uppercase tracking-wider">Nội dung</th>
                <th className="px-6 py-4 font-bold text-gray-600 text-[11px] uppercase tracking-wider text-right">Tiền mua hàng (+)</th>
                <th className="px-6 py-4 font-bold text-gray-600 text-[11px] uppercase tracking-wider text-right">Tiền đã trả (-)</th>
                <th className="px-6 py-4 font-bold text-gray-600 text-[11px] uppercase tracking-wider text-right">Công nợ còn lại</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {MOCK_DEBT_TRANSACTIONS.map((t, idx) => (
                <tr key={t.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-4 py-4 text-center text-[13px] font-medium text-gray-500">{idx + 1}</td>
                  <td className="px-6 py-4 text-gray-500 whitespace-nowrap font-medium">{t.date}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${t.change > 0 ? "bg-red-400" : "bg-green-400"}`} />
                      <span className="font-semibold text-gray-800">{t.note}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {t.change > 0 ? (
                      <span className="font-bold text-red-600">{formatCurrency(t.change)}</span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {t.change < 0 ? (
                      <span className="font-bold text-green-600">{formatCurrency(Math.abs(t.change))}</span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right font-black text-gray-900">{formatCurrency(t.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Legends */}
        <div className="flex items-center justify-between text-[11px] text-gray-400 px-2">
          <div className="flex gap-4">
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-400" /> Mua nợ</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-400" /> Trả nợ</span>
          </div>
          <p className="italic">Dữ liệu được trích xuất từ phần mềm kế toán SIMS-Accounting</p>
        </div>

        {/* Warning Footnote */}

      </div>
    </ModalContainer>
  );
};

export default function OwnerCustomers() {
  const [customers] = useState(INITIAL_CUSTOMERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  // Modals state
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [modalType, setModalType] = useState(null); // 'details' | 'debt'

  // Filter & Search
  const filtered = useMemo(() => {
    let result = customers;

    // Search
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.code.toLowerCase().includes(q)
      );
    }

    return result;
  }, [customers, searchTerm]);

  const hasActiveFilters = searchTerm;

  const clearAllFilters = () => {
    setSearchTerm("");
  };

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedCustomers = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const openModal = (customer, type) => {
    setSelectedCustomer(customer);
    setModalType(type);
  };

  const closeModal = () => {
    setSelectedCustomer(null);
    setModalType(null);
  };

  // ===================== RENDER =====================
  return (
    <>
      <PageHelmet title="Quản lý khách hàng - Chủ cửa hàng | TPF-SIMS" />

      <div className="flex flex-col h-[calc(100vh-64px)] -m-6 p-6 space-y-4" style={{ backgroundColor: "var(--bg-main)" }}>
        {/* Header */}
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: "var(--text-main)" }}>
              <Users size={22} style={{ color: "var(--brand-primary)" }} />
              Quản lý khách hàng
            </h1>
            <p className="text-[13px] mt-0.5" style={{ color: "var(--text-placeholder)" }}>
              {filtered.length} khách hàng
            </p>
          </div>
        </div>


        {/* Search + Table Card */}
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
                placeholder="Tìm mã khách, tên khách hàng, SĐT..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full h-9 pl-10 pr-8 rounded-lg text-[13px] focus:outline-none focus:ring-2 transition"
                style={{
                  border: "1px solid var(--grid-border)",
                  backgroundColor: "var(--bg-main)",
                  color: "var(--text-main)",
                }}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
                  style={{ color: "var(--text-placeholder)" }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5 shrink-0 overflow-x-auto">
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
                  <X size={14} /> Xóa bộ lọc
                </button>
              )}
            </div>
          </div>

          {/* Table Container */}
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
                  <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-placeholder)" }}>Mã KH</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-placeholder)" }}>Khách hàng</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-placeholder)" }}>Liên hệ</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-right" style={{ color: "var(--text-placeholder)" }}>Tổng chi tiêu</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-right" style={{ color: "var(--text-placeholder)" }}>Chi tiết</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-right" style={{ color: "var(--text-placeholder)" }}>Công nợ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedCustomers.map((c, idx) => {
                  return (
                    <tr
                      key={c.id}
                      className="group relative hover:bg-gray-50/50 transition-colors cursor-pointer"
                      style={{ borderBottom: "1px solid var(--grid-border)" }}
                    >
                      <td className="px-4 py-4 text-center text-[13px] font-medium" style={{ color: "var(--text-secondary)" }}>
                        {(currentPage - 1) * itemsPerPage + idx + 1}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold font-mono text-blue-600 bg-blue-50/50 px-2 py-0.5 rounded-md inline-block">
                          {c.code}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-bold text-gray-900">{c.name}</p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5 text-[12px] font-medium text-gray-600 mb-1">
                          <Phone size={12} className="text-gray-400" /> {c.phone}
                        </div>
                        <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
                          <MapPin size={12} className="text-gray-400" /> {c.address}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <p className="font-bold text-gray-900">
                          {formatCurrency(c.totalSpent)}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="text-[12px] font-medium text-gray-600">
                          {c.ordersCount} đơn
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <p
                          className={`font-bold ${c.debt > 0 ? "text-red-600" : "text-gray-400"}`}
                        >
                          {c.debt > 0 ? formatCurrency(c.debt) : "—"}
                        </p>

                        {/* Hover Actions */}
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-none group-hover:pointer-events-auto">
                          <div className="flex justify-end gap-1.5 bg-white/90 backdrop-blur-sm p-1 rounded-xl shadow-sm border border-gray-100 pointer-events-auto">
                            <button
                              onClick={() => openModal(c, "details")}
                              className="h-8 px-2.5 rounded-lg flex items-center justify-center transition cursor-pointer hover:bg-gray-100 gap-1.5 text-[12px] font-bold"
                              style={{ color: "var(--text-secondary)" }}
                              title="Xem chi tiết & Lịch sử mua"
                            >
                              <Eye size={14} /> Chi tiết
                            </button>
                            {c.debt > 0 && (
                              <button
                                onClick={() => openModal(c, "debt")}
                                className="h-8 px-2.5 rounded-lg flex items-center justify-center transition cursor-pointer hover:opacity-80 gap-1.5 text-[12px] font-bold"
                                style={{
                                  backgroundColor: "#FEF2F2",
                                  color: "#DC2626",
                                  border: "1px solid #FECACA",
                                }}
                                title="Xem lịch sử công nợ"
                              >
                                <FileText size={14} /> Lịch sử nợ
                              </button>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {paginatedCustomers.length === 0 && (
                  <tr>
                    <td colSpan="7" className="py-24 text-center">
                      <div className="flex flex-col items-center gap-2" style={{ color: "var(--text-placeholder)" }}>
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "var(--bg-main)" }}>
                          <Users size={28} strokeWidth={1.5} />
                        </div>
                        <p className="text-sm font-medium mt-1">
                          {searchTerm ? `Không tìm thấy khách hàng "${searchTerm}"` : "Chưa có khách hàng nào"}
                        </p>
                        {hasActiveFilters && (
                          <button onClick={clearAllFilters} className="text-[13px] font-medium cursor-pointer" style={{ color: "var(--brand-primary)" }}>Xóa bộ lọc</button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {filtered.length > 0 && (
            <div
              className="px-6 py-3 border-t shrink-0 flex items-center justify-between"
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
                <span className="font-bold" style={{ color: "var(--text-main)" }}>
                  {filtered.length}
                </span>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span
                    className="text-[13px]"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Số bản ghi/trang
                  </span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
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

                <div
                  className="text-[13px]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <span className="font-bold" style={{ color: "var(--text-main)" }}>
                    {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filtered.length)}
                  </span>{" "}
                  bản ghi
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer hover:bg-gray-200 rounded p-1"
                    style={{ color: "var(--text-main)" }}
                  >
                    <ChevronLeft size={16} strokeWidth={2.5} />
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
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

      {/* Modals Rendering */}
      {modalType === "details" && selectedCustomer && (
        <CustomerDetailsModal customer={selectedCustomer} onClose={closeModal} />
      )}
      {modalType === "debt" && selectedCustomer && (
        <DebtHistoryModal customer={selectedCustomer} onClose={closeModal} />
      )}
    </>
  );
}
