import { useState, useMemo, useEffect } from "react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import { Search, History, X, ChevronLeft, ChevronRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  { id: 12, type: "USER", action: "Cập quyền truy cập", target: "Kế toán mới", user: "Lê Hoàng C", role: "Chủ cửa hàng", time: "2026-03-02T10:00:00", details: "Vai trò: ACCOUNTANT" },
  { id: 13, type: "INVENTORY", action: "Kiểm kho định kỳ", target: "Kho phụ kiện", user: "Trần Thị B", role: "Thợ", time: "2026-03-01T16:00:00", details: "Khớp 100% dữ liệu" },
  { id: 14, type: "ORDER", action: "Hoàn tất đơn hàng", target: "ĐH-20240228-09", user: "Lê Hoàng C", role: "Chủ cửa hàng", time: "2026-02-28T17:30:00", details: "Đã giao hàng & thanh toán" },
  { id: 15, type: "SYSTEM", action: "Cập nhật phiên bản phần mềm", target: "v2.1.0", user: "Hệ thống", role: "Bot", time: "2026-02-27T22:00:00", details: "Cải thiện hiệu năng Dashboard" },
];

const formatDate = (dateString) => {
  const d = new Date(dateString);
  return d.toLocaleString("vi-VN", {
    hour: '2-digit', minute: '2-digit',
    day: '2-digit', month: '2-digit', year: 'numeric'
  });
};

export default function SystemLogs() {
  const [search, setSearch] = useState("");
  const [logs, setLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  useEffect(() => {
    // Mimic API Fetch
    setLogs(INITIAL_LOGS);
  }, []);

  const processedLogs = useMemo(() => {
    let result = [...logs];

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

    // Sort mới nhất trước
    result.sort((a, b) => new Date(b.time) - new Date(a.time));

    return result;
  }, [logs, search]);

  // Reset page on search change
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Dữ liệu hiển thị theo trang
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedLogs.slice(startIndex, startIndex + itemsPerPage);
  }, [processedLogs, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(processedLogs.length / itemsPerPage);

  return (
    <>
      <PageHelmet title="Nhật ký hệ thống | TPF-SIMS" />
      <div 
        className="flex flex-col h-[calc(100vh-64px)] -m-6 p-6 space-y-4 overflow-hidden"
        style={{ backgroundColor: "var(--bg-main)" }}
      >

        {/* Header */}
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1 
              className="text-xl font-bold flex items-center gap-2"
              style={{ color: "var(--text-main)" }}
            >
              <History size={22} style={{ color: "var(--brand-primary)" }} />
              Nhật ký hệ thống
            </h1>
            <p 
              className="text-[13px] mt-0.5"
              style={{ color: "var(--text-placeholder)" }}
            >
              {processedLogs.length} bản ghi hoạt động được giám sát trên hệ thống
            </p>
          </div>
        </div>

        {/* Bảng & Filter */}
        <div 
          className="flex flex-col bg-white rounded-2xl flex-1 overflow-hidden"
          style={{
            boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
          }}
        >

          {/* Search Header - Aligned with Orders */}
          <div 
            className="px-4 py-3 shrink-0 flex items-center justify-between gap-4"
            style={{ 
              backgroundColor: "var(--grid-header-bg)",
              borderBottom: "1px solid var(--grid-border)"
            }}
          >
            <div className="relative flex-1 max-w-sm">
              <Search 
                size={16} 
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-placeholder)" }}
              />
              <input
                type="text"
                placeholder="Tìm user, hành động, đối tượng..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-10 pr-8 rounded-lg text-[13px] border focus:outline-none focus:ring-1 transition"
                style={{
                  borderColor: "var(--grid-border)",
                  backgroundColor: "#fff",
                  color: "var(--text-main)",
                }}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full cursor-pointer"
                >
                  <X size={14} style={{ color: "var(--text-placeholder)" }} />
                </button>
              )}
            </div>
          </div>

          {/* Data Table */}
          <div className="flex-1 overflow-auto bg-white custom-scrollbar">
            <table className="w-full text-left relative">
              <thead 
                className="sticky top-0 z-10"
                style={{
                  backgroundColor: "var(--grid-header-bg)",
                  borderBottom: "1px solid var(--grid-border)",
                }}
              >
                <tr>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-center w-[60px]" style={{ color: "var(--text-placeholder)" }}>STT</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider w-[180px]" style={{ color: "var(--text-placeholder)" }}>Thời gian</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider w-[220px]" style={{ color: "var(--text-placeholder)" }}>Tài khoản</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider w-[240px]" style={{ color: "var(--text-placeholder)" }}>Hành động</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-placeholder)" }}>Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--grid-border)" }}>
                {paginatedLogs.length > 0 ? (
                  paginatedLogs.map((log, index) => {
                    return (
                      <tr 
                        key={log.id} 
                        className="group hover:bg-gray-50/50 transition-colors cursor-default"
                        style={{ borderBottom: "1px solid var(--grid-border)" }}
                      >
                        <td className="px-4 py-4 text-center text-[13px] font-medium" style={{ color: "var(--text-secondary)" }}>
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className="px-4 py-4 text-[13px] font-semibold" style={{ color: "var(--text-main)" }}>
                          {formatDate(log.time)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 group-hover:border-blue-200 group-hover:bg-blue-50 transition-colors">
                              <User size={14} className="text-slate-500 group-hover:text-blue-600" />
                            </div>
                            <div>
                              <p className="text-[13px] font-bold leading-tight" style={{ color: "var(--text-main)" }}>{log.user}</p>
                              <p className="text-[11px] font-medium" style={{ color: "var(--text-placeholder)" }}>{log.role}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col">
                            <span className="text-[13px] font-bold group-hover:text-emerald-700 transition-colors" style={{ color: "var(--text-main)" }}>{log.action}</span>
                            <span className="text-[11px] font-medium truncate mt-0.5" style={{ color: "var(--text-placeholder)" }}>{log.target}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-[13px] font-medium italic" style={{ color: "var(--text-secondary)" }}>
                          "{log.details}"
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-5 py-20 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <History size={48} className="mb-4 opacity-10 animate-pulse" />
                        <p className="text-[14px] font-bold text-slate-600">Không tìm thấy hoạt động nào.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination - Aligned with Orders */}
          <div 
            className="px-5 py-4 flex items-center justify-between shrink-0"
            style={{ 
              backgroundColor: "var(--grid-header-bg)",
              borderTop: "1px solid var(--grid-border)"
            }}
          >
            <div 
              className="text-[13px]"
              style={{ color: "var(--text-secondary)" }}
            >
              Tổng số bản ghi:{" "}
              <span className="font-bold" style={{ color: "var(--brand-primary)" }}>
                {processedLogs.length}
              </span>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-medium" style={{ color: "var(--text-secondary)" }}>
                  Số bản ghi/trang
                </span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="h-8 px-2 pr-6 rounded-md text-[13px] border cursor-pointer focus:outline-none focus:ring-1 transition appearance-none font-medium"
                  style={{
                    borderColor: "var(--grid-border)",
                    backgroundColor: "#fff",
                    color: "var(--text-main)",
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

              <div className="text-[13px] font-medium" style={{ color: "var(--text-secondary)" }}>
                <span className="font-bold" style={{ color: "var(--text-main)" }}>
                  {(currentPage - 1) * itemsPerPage + 1} -{" "}
                  {Math.min(currentPage * itemsPerPage, processedLogs.length)}
                </span>{" "}
                bản ghi
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center justify-center h-8 w-8 rounded-lg border text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  style={{ borderColor: "var(--grid-border)" }}
                >
                  <ChevronLeft size={16} strokeWidth={2.5} />
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="flex items-center justify-center h-8 w-8 rounded-lg border text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  style={{ borderColor: "var(--grid-border)" }}
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
