import { useState, useMemo, useEffect } from "react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import { Search, History, X, ChevronLeft, ChevronRight, User, Filter, Calendar, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import systemLogService from "@/services/systemLog.service";
import toast from "react-hot-toast";

const formatDate = (dateString) => {
  if (!dateString) return "—";
  const d = new Date(dateString);
  return d.toLocaleString("vi-VN", {
    hour: '2-digit', minute: '2-digit',
    day: '2-digit', month: '2-digit', year: 'numeric'
  });
};

const LEVEL_COLORS = {
  INFO: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-100" },
  WARN: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-100" },
  ERROR: { bg: "bg-red-50", text: "text-red-700", border: "border-red-100" },
};

export default function SystemLogs() {
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, totalItems: 0, totalPages: 0 });

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = {
        search,
        level: level || undefined,
        fromDate: dateFrom || undefined,
        toDate: dateTo || undefined,
        page: pagination.page,
        limit: pagination.limit
      };
      const response = await systemLogService.getAllLogs(params);
      setLogs(response.data);
      setPagination(prev => ({
        ...prev,
        totalItems: response.pagination.totalItems,
        totalPages: response.pagination.totalPages
      }));
    } catch (error) {
      toast.error("Không thể tải nhật ký hệ thống");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [pagination.page, pagination.limit, level, dateFrom, dateTo]);

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      setPagination(prev => ({ ...prev, page: 1 }));
      fetchLogs();
    }
  };

  const clearFilters = () => {
    setSearch("");
    setLevel("");
    setDateFrom("");
    setDateTo("");
    setPagination(prev => ({ ...prev, page: 1 }));
  };

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
              {pagination.totalItems} bản ghi hoạt động được giám sát trên hệ thống
            </p>
          </div>
          {(search || level || dateFrom || dateTo) && (
            <Button 
              variant="ghost" 
              onClick={clearFilters}
              className="h-8 px-3 text-[11px] font-bold text-red-500 hover:text-red-600 hover:bg-red-50 gap-1.5"
            >
              <X size={14} /> XÓA TẤT CẢ BỘ LỌC
            </Button>
          )}
        </div>

        {/* Bảng & Filter */}
        <div 
          className="flex flex-col bg-white rounded-2xl flex-1 overflow-hidden"
          style={{
            boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
          }}
        >

          {/* Search & Filter Header */}
          <div 
            className="px-4 py-3 shrink-0 flex items-center flex-wrap gap-4"
            style={{ 
              backgroundColor: "var(--grid-header-bg)",
              borderBottom: "1px solid var(--grid-border)"
            }}
          >
            {/* Search */}
            <div className="relative w-full max-w-[300px]">
              <Search 
                size={16} 
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-placeholder)" }}
              />
              <input
                type="text"
                placeholder="Tìm user, hành động, chi tiết..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearch}
                className="w-full h-9 pl-10 pr-8 rounded-lg text-[13px] border focus:outline-none focus:ring-1 transition"
                style={{
                  borderColor: "var(--grid-border)",
                  backgroundColor: "#fff",
                  color: "var(--text-main)",
                }}
              />
              {search && (
                <button
                  onClick={() => { setSearch(""); fetchLogs(); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full cursor-pointer"
                >
                  <X size={14} style={{ color: "var(--text-placeholder)" }} />
                </button>
              )}
            </div>

            {/* Level Filter */}
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-gray-400" />
              <select
                value={level}
                onChange={(e) => { setLevel(e.target.value); setPagination(prev => ({ ...prev, page: 1 })); }}
                className="h-9 px-3 rounded-lg text-[12px] border focus:outline-none font-medium cursor-pointer"
                style={{ borderColor: "var(--grid-border)", color: "var(--text-main)" }}
              >
                <option value="">Tất cả mức độ</option>
                <option value="INFO">Thông tin (INFO)</option>
                <option value="WARN">Cảnh báo (WARN)</option>
                <option value="ERROR">Lỗi (ERROR)</option>
              </select>
            </div>

            {/* Date Range */}
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-gray-400 ml-2" />
              <div className="flex items-center gap-1.5">
                <input 
                  type="date" 
                  value={dateFrom} 
                  onChange={(e) => { setDateFrom(e.target.value); setPagination(prev => ({ ...prev, page: 1 })); }}
                  className="h-9 px-2 rounded-lg text-[12px] border focus:outline-none font-medium"
                  style={{ borderColor: "var(--grid-border)", color: "var(--text-main)" }}
                />
                <span className="text-gray-400 text-[12px]">—</span>
                <input 
                  type="date" 
                  value={dateTo} 
                  onChange={(e) => { setDateTo(e.target.value); setPagination(prev => ({ ...prev, page: 1 })); }}
                  className="h-9 px-2 rounded-lg text-[12px] border focus:outline-none font-medium"
                  style={{ borderColor: "var(--grid-border)", color: "var(--text-main)" }}
                />
              </div>
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
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-[13px] text-gray-500 font-medium italic">Đang tải nhật ký...</p>
                      </div>
                    </td>
                  </tr>
                ) : logs.length > 0 ? (
                  logs.map((log, index) => {
                    const levelStyle = LEVEL_COLORS[log.level] || LEVEL_COLORS.INFO;
                    return (
                      <tr 
                        key={log.system_log_id} 
                        className="group hover:bg-gray-50/50 transition-colors cursor-default"
                        style={{ borderBottom: "1px solid var(--grid-border)" }}
                      >
                        <td className="px-4 py-4 text-center text-[13px] font-medium" style={{ color: "var(--text-secondary)" }}>
                          {(pagination.page - 1) * pagination.limit + index + 1}
                        </td>
                        <td className="px-4 py-4 text-[13px] font-semibold" style={{ color: "var(--text-main)" }}>
                          {formatDate(log.createdate)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 group-hover:border-blue-200 group-hover:bg-blue-50 transition-colors">
                              <User size={14} className="text-slate-500 group-hover:text-blue-600" />
                            </div>
                            <div>
                              <p className="text-[13px] font-bold leading-tight" style={{ color: "var(--text-main)" }}>
                                {log.account?.profile?.full_name || "Hệ thống"}
                              </p>
                              <p className="text-[11px] font-medium" style={{ color: "var(--text-placeholder)" }}>
                                {log.account?.role?.role_name || (log.account ? "Chưa rõ vai trò" : "Bot")}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${levelStyle.bg} ${levelStyle.text} border ${levelStyle.border}`}>
                                {log.level}
                              </span>
                              <span className="text-[13px] font-bold group-hover:text-emerald-700 transition-colors" style={{ color: "var(--text-main)" }}>
                                {log.action}
                              </span>
                            </div>
                            <span className="text-[11px] font-medium truncate" style={{ color: "var(--text-placeholder)" }}>
                              IP: {log.ip_address || "N/A"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-[13px] font-medium italic" style={{ color: "var(--text-secondary)" }}>
                          "{log.detail}"
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

          {/* Pagination */}
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
                {pagination.totalItems}
              </span>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-medium" style={{ color: "var(--text-secondary)" }}>
                  Số bản ghi/trang
                </span>
                <select
                  value={pagination.limit}
                  onChange={(e) => {
                    setPagination(prev => ({ ...prev, limit: Number(e.target.value), page: 1 }));
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
                  {[15, 30, 50, 100].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-[13px] font-medium" style={{ color: "var(--text-secondary)" }}>
                Trang <span className="font-bold text-gray-900">{pagination.page}</span> / {pagination.totalPages || 1}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))}
                  disabled={pagination.page === 1 || loading}
                  className="flex items-center justify-center h-8 w-8 rounded-lg border text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  style={{ borderColor: "var(--grid-border)" }}
                >
                  <ChevronLeft size={16} strokeWidth={2.5} />
                </button>
                <button
                  onClick={() => setPagination(p => ({ ...p, page: Math.min(pagination.totalPages, p.page + 1) }))}
                  disabled={pagination.page === pagination.totalPages || pagination.totalPages === 0 || loading}
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
