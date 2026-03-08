import { useState, useMemo, useEffect } from "react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import { Search, History, Calendar, XCircle, X, ChevronLeft, ChevronRight, User, Package, ShoppingCart, Key, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const ACTION_TYPES = [
  { value: "Tất cả", label: "Tất cả hoạt động" },
  { value: "ORDER", label: "Đơn hàng" },
  { value: "PRODUCT", label: "Sản phẩm" },
  { value: "INVENTORY", label: "Kho hàng" },
  { value: "USER", label: "Tài khoản" },
  { value: "SYSTEM", label: "Hệ thống" },
];

const INITIAL_LOGS = [
  { id: 1, type: "ORDER", action: "Tạo mới đơn hàng", target: "ĐH-20240308-01", user: "Nguyễn Văn A", role: "Sales", time: "2026-03-08T10:15:00", details: "Giá trị: 15,500,000 đ" },
  { id: 2, type: "INVENTORY", action: "Cập nhật tồn kho", target: "Bàn ăn tròn xoay", user: "Trần Thị B", role: "Thợ", time: "2026-03-08T09:30:00", details: "Tồn: 0 -> 10" },
  { id: 3, type: "USER", action: "Đăng nhập hệ thống", target: "IP: 192.168.1.5", user: "Lê Hoàng C", role: "Chủ cửa hàng", time: "2026-03-08T08:00:00", details: "Đăng nhập thành công" },
  { id: 4, type: "ORDER", action: "Chấp nhận báo giá", target: "BG-20240307-05", user: "Nguyễn Văn A", role: "Sales", time: "2026-03-07T16:45:00", details: "Khách hàng xác nhận" },
  { id: 5, type: "PRODUCT", action: "Sửa thông tin sản phẩm", target: "Ghế đôn sofa L", user: "Trần Thị B", role: "Thợ", time: "2026-03-07T14:20:00", details: "Cập nhật giá bán: 450k -> 480k" },
  { id: 6, type: "SYSTEM", action: "Sao lưu dữ liệu định kỳ", target: "DB_Backup_0307", user: "Hệ thống", role: "Bot", time: "2026-03-07T00:00:00", details: "Tự động sao lưu thành công" },
  { id: 7, type: "ORDER", action: "Hủy đơn hàng", target: "ĐH-20240305-12", user: "Lê Hoàng C", role: "Chủ cửa hàng", time: "2026-03-06T11:10:00", details: "Lý do: Khách đổi ý" },
  { id: 8, type: "USER", action: "Đổi mật khẩu", target: "Tài khoản cá nhân", user: "Nguyễn Văn A", role: "Sales", time: "2026-03-05T09:05:00", details: "Yêu cầu bảo mật" },
  { id: 9, type: "PRODUCT", action: "Thêm sản phẩm mới", target: "Kệ tivi gỗ sồi", user: "Trần Thị B", role: "Thợ", time: "2026-03-04T15:30:00", details: "Danh mục: Phòng khách" },
  { id: 10, type: "INVENTORY", action: "Xuất kho sản xuất", target: "Gỗ ván MFC", user: "Trần Thị B", role: "Thợ", time: "2026-03-04T08:20:00", details: "Số lượng: 50 tấm" },
  { id: 11, type: "ORDER", action: "Gửi báo giá", target: "BG-20240303-02", user: "Nguyễn Văn A", role: "Sales", time: "2026-03-03T14:10:00", details: "Email gửi thành công" },
  { id: 12, type: "USER", action: "Cấp quyền truy cập", target: "Kế toán mới", user: "Lê Hoàng C", role: "Chủ cửa hàng", time: "2026-03-02T10:00:00", details: "Vai trò: ACCOUNTANT" },
  { id: 13, type: "INVENTORY", action: "Kiểm kho định kỳ", target: "Kho phụ kiện", user: "Trần Thị B", role: "Thợ", time: "2026-03-01T16:00:00", details: "Khớp 100% dữ liệu" },
  { id: 14, type: "ORDER", action: "Hoàn tất đơn hàng", target: "ĐH-20240228-09", user: "Lê Hoàng C", role: "Chủ cửa hàng", time: "2026-02-28T17:30:00", details: "Đã giao hàng & thanh toán" },
  { id: 15, type: "SYSTEM", action: "Cập nhật phiên bản phần mềm", target: "v2.1.0", user: "Hệ thống", role: "Bot", time: "2026-02-27T22:00:00", details: "Cải thiện hiệu năng Dashboard" },
];

const getIconForType = (type) => {
  switch (type) {
    case "ORDER": return <ShoppingCart size={16} className="text-emerald-600" />;
    case "PRODUCT": return <Package size={16} className="text-blue-600" />;
    case "INVENTORY": return <FileText size={16} className="text-orange-600" />;
    case "USER": return <Key size={16} className="text-purple-600" />;
    case "SYSTEM": return <History size={16} className="text-slate-600" />;
    default: return <User size={16} className="text-slate-600" />;
  }
};

const getBadgeForType = (type) => {
  switch (type) {
    case "ORDER": return { bg: "#d1fae5", text: "#059669", label: "Đơn hàng" };
    case "PRODUCT": return { bg: "#dbeafe", text: "#2563eb", label: "Sản phẩm" };
    case "INVENTORY": return { bg: "#ffedd5", text: "#ea580c", label: "Kho hàng" };
    case "USER": return { bg: "#f3e8ff", text: "#9333ea", label: "Tài khoản" };
    case "SYSTEM": return { bg: "#f1f5f9", text: "#475569", label: "Hệ thống" };
    default: return { bg: "#f1f5f9", text: "#475569", label: "Khác" };
  }
};

const formatDate = (dateString) => {
  const d = new Date(dateString);
  return d.toLocaleString("vi-VN", {
    hour: '2-digit', minute: '2-digit',
    day: '2-digit', month: '2-digit', year: 'numeric'
  });
};

export default function SystemLogs() {
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState("Tất cả");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [logs, setLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  useEffect(() => {
    // Mimic API Fetch
    setLogs(INITIAL_LOGS);
  }, []);

  const hasActiveFilters = activeType !== "Tất cả" || dateFrom || dateTo || search;

  const clearAllFilters = () => {
    setSearch("");
    setActiveType("Tất cả");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  };

  const processedLogs = useMemo(() => {
    let result = [...logs];

    // Lọc theo Type
    if (activeType !== "Tất cả") {
      result = result.filter(log => log.type === activeType);
    }

    // Lọc theo Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(log =>
        log.user.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.target.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q)
      );
    }

    // Lọc theo Date
    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      result = result.filter(log => new Date(log.time) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      result = result.filter(log => new Date(log.time) <= to);
    }

    // Sort mới nhất trước
    result.sort((a, b) => new Date(b.time) - new Date(a.time));

    return result;
  }, [logs, activeType, search, dateFrom, dateTo]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeType, dateFrom, dateTo]);

  // Dữ liệu hiển thị theo trang
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedLogs.slice(startIndex, startIndex + itemsPerPage);
  }, [processedLogs, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(processedLogs.length / itemsPerPage);

  return (
    <>
      <PageHelmet title="Nhật ký hệ thống | TPF-SIMS" />
      <div className="flex flex-col h-[calc(100vh-64px)] -m-6 p-6 md:p-8 space-y-6 overflow-hidden bg-slate-50">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between shrink-0 gap-4 mb-2">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 border-b-4 border-blue-500 pb-1 inline-block">
              Nhật ký Hệ thống
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-2">
              Giám sát toàn bộ hoạt động, thao tác của người dùng trên hệ thống
            </p>
          </div>
        </div>

        {/* Bảng & Filter */}
        <div className="flex flex-col bg-white rounded-2xl flex-1 overflow-hidden shadow-sm border border-slate-100">

          {/* Top Filter Bar */}
          <div className="px-5 py-4 border-b border-slate-100 shrink-0 flex flex-wrap items-center justify-between gap-4 bg-white z-10">
            <div className="relative w-full md:w-[350px] shrink-0">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm user, hành động, đối tượng..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-10 pr-8 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 border border-slate-200 transition-all bg-slate-50"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <select
                  value={activeType}
                  onChange={(e) => setActiveType(e.target.value)}
                  className="h-10 px-4 pr-10 rounded-xl text-[13px] font-semibold focus:outline-none appearance-none cursor-pointer border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all shadow-sm"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 12px center",
                    color: activeType !== "Tất cả" ? "#2563eb" : "#475569",
                    borderColor: activeType !== "Tất cả" ? "#bfdbfe" : "#e2e8f0",
                    backgroundColor: activeType !== "Tất cả" ? "#eff6ff" : "#f8fafc",
                  }}
                >
                  {ACTION_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }}
                    className="h-10 pl-9 pr-3 rounded-xl text-[13px] font-medium border border-slate-200 bg-slate-50 text-slate-700 shadow-sm focus:ring-2 focus:ring-blue-500/10"
                  />
                </div>
                <span className="text-slate-400 text-sm">-</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }}
                  className="h-10 px-3 rounded-xl text-[13px] font-medium border border-slate-200 bg-slate-50 text-slate-700 shadow-sm focus:ring-2 focus:ring-blue-500/10"
                />
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="h-10 px-4 rounded-xl text-[13px] font-bold flex items-center gap-2 text-rose-600 bg-rose-50 border border-rose-100 hover:bg-rose-100 transition-colors shadow-sm"
                >
                  <XCircle size={16} /> Bỏ lọc
                </button>
              )}
            </div>
          </div>

          {/* Data Table */}
          <div className="flex-1 overflow-auto bg-white custom-scrollbar">
            <table className="w-full text-left text-[13px]">
              <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm border-b border-slate-100 shadow-sm">
                <tr>
                  <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-center w-[60px]">STT</th>
                  <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 w-[180px]">Thời gian</th>
                  <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 w-[220px]">Tài khoản</th>
                  <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 w-[150px]">Phân loại</th>
                  <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 w-[240px]">Hành động</th>
                  <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedLogs.length > 0 ? (
                  paginatedLogs.map((log, index) => {
                    const badge = getBadgeForType(log.type);
                    return (
                      <tr key={log.id} className="hover:bg-slate-50/60 transition-colors group">
                        <td className="px-5 py-4 text-center text-slate-500 font-semibold">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-semibold text-slate-700">{formatDate(log.time)}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 group-hover:border-blue-200 group-hover:bg-blue-50 transition-colors">
                              <User size={14} className="text-slate-500 group-hover:text-blue-600" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 leading-tight">{log.user}</p>
                              <p className="text-[11px] text-slate-500 font-medium">{log.role}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-extrabold shadow-sm"
                            style={{ backgroundColor: badge.bg, color: badge.text }}
                          >
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{log.action}</span>
                            <span className="text-[12px] text-slate-500 font-medium truncate mt-0.5">{log.target}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-slate-600 font-medium italic">
                          "{log.details}"
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <History size={48} className="mb-4 opacity-20 animate-pulse" />
                        <p className="text-[14px] font-black text-slate-600">Không tìm thấy hoạt động nào.</p>
                        <p className="text-[13px] mt-1 font-medium text-slate-400">Vui lòng thử điều chỉnh lại bộ lọc tìm kiếm hoặc khoảng thời gian.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between bg-white shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.01)]">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold text-blue-600">
                Tổng số:
              </span>
              <span className="text-[13px] font-bold text-slate-700">
                {processedLogs.length}
              </span>
            </div>

            <div className="flex items-center gap-6">
              {/* Items per page indicator */}
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-slate-500 font-medium">
                  Số bản ghi/trang
                </span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="h-8 px-2 pr-6 rounded-md text-[13px] border cursor-pointer focus:outline-none focus:ring-1 transition appearance-none bg-slate-50 border-slate-200 text-slate-700 font-medium"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 8px center",
                  }}
                >
                  {[12, 24, 48, 100].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              {/* Range Info */}
              <div className="text-[13px] text-slate-500 font-medium">
                <span className="font-bold text-slate-800">
                  {(currentPage - 1) * itemsPerPage + 1} -{" "}
                  {Math.min(currentPage * itemsPerPage, processedLogs.length)}
                </span>{" "}
                bản ghi
              </div>

              {/* Arrows */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center justify-center h-8 w-8 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  <ChevronLeft size={16} strokeWidth={2.5} />
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="flex items-center justify-center h-8 w-8 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  <ChevronRight size={16} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
