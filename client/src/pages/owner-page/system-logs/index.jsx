import { useState, useMemo, useCallback } from "react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import { History, X, User, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import systemLogService from "@/services/systemLog.service";
import DataTable from "@/components/control/DataTable";
import useCachedFetch from "@/hooks/useCachedFetch";
import useDebounce from "@/hooks/useDebounce";

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
  const debouncedSearch = useDebounce(search, 300);
  const [level, setLevel] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [pagination, setPagination] = useState({ page: 1, limit: 15 });

  const fetchFn = useCallback(async () => {
    const params = {
      search: debouncedSearch || undefined,
      level: level || undefined,
      fromDate: dateFrom || undefined,
      toDate: dateTo || undefined,
      page: pagination.page,
      limit: pagination.limit
    };
    const response = await systemLogService.getAllLogs(params);
    return {
      logs: response.data,
      totalItems: response.pagination.totalItems,
      totalPages: response.pagination.totalPages
    };
  }, [debouncedSearch, level, dateFrom, dateTo, pagination.page, pagination.limit]);

  const cacheKey = `system_logs_${debouncedSearch}_${level}_${dateFrom}_${dateTo}_${pagination.page}_${pagination.limit}`;
  const { data: cachedData, isLoading, isRefreshing } = useCachedFetch(cacheKey, fetchFn, { ttl: 1000 * 60 * 5 });

  const logs = cachedData?.logs || [];
  const totalItems = cachedData?.totalItems || 0;

  const clearFilters = () => {
    setSearch("");
    setLevel("");
    setDateFrom("");
    setDateTo("");
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const columns = [
    {
      header: "STT",
      headerClassName: "text-center w-[60px]",
      className: "text-center font-medium",
      style: { color: "var(--text-secondary)" },
      render: (_, index) => (pagination.page - 1) * pagination.limit + index + 1
    },
    {
      header: "Thời gian",
      headerClassName: "w-[180px]",
      className: "font-semibold",
      render: (log) => formatDate(log.createdate)
    },
    {
      header: "Tài khoản",
      headerClassName: "w-[220px]",
      render: (log) => (
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
      )
    },
    {
      header: "Hành động",
      headerClassName: "w-[240px]",
      render: (log) => {
        const levelStyle = LEVEL_COLORS[log.level] || LEVEL_COLORS.INFO;
        return (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${levelStyle.bg} ${levelStyle.text} border ${levelStyle.border}`}>
                {log.level}
              </span>
              <span className="text-[13px] font-bold group-hover:text-indigo-600 transition-colors" style={{ color: "var(--text-main)" }}>
                {log.action}
              </span>
            </div>
            <span className="text-[11px] font-medium truncate" style={{ color: "var(--text-placeholder)" }}>
              IP: {log.ip_address || "N/A"}
            </span>
          </div>
        );
      }
    },
    {
      header: "Chi tiết",
      className: "font-medium italic",
      style: { color: "var(--text-secondary)" },
      render: (log) => `"${log.detail}"`
    }
  ];

  const displayLogs = useMemo(() => {
    return logs.map(log => ({
      ...log,
      id: log.system_log_id
    }));
  }, [logs]);

  const extraFilters = (
    <div className="flex items-center gap-2">
      <Filter size={14} className="text-gray-400" />
      <select
        value={level}
        onChange={(e) => { 
          setLevel(e.target.value); 
          setPagination(prev => ({ ...prev, page: 1 })); 
        }}
        className="h-10 px-3 rounded-lg text-[12px] border focus:outline-none font-medium cursor-pointer"
        style={{ borderColor: "var(--grid-border)", color: "var(--text-main)" }}
      >
        <option value="">Tất cả mức độ</option>
        <option value="INFO">Thông tin (INFO)</option>
        <option value="WARN">Cảnh báo (WARN)</option>
        <option value="ERROR">Lỗi (ERROR)</option>
      </select>
    </div>
  );

  return (
    <>
      <PageHelmet title="Nhật ký hệ thống | TPF-SIMS" />

      {/* Global Loading Bar */}
      {(isLoading || isRefreshing) && (
        <div className="fixed top-0 left-0 right-0 z-[9999]">
          <div className="h-[2px] bg-indigo-500 animate-[loading_1.5s_infinite] origin-left"></div>
        </div>
      )}

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
              {totalItems} bản ghi hoạt động được giám sát trên hệ thống
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

        {/* DataTable usage */}
        <DataTable
          columns={columns}
          data={displayLogs}
          isLoading={isLoading}
          isRefreshing={isRefreshing}
          
          // Search & Filters
          searchTerm={search}
          setSearchTerm={(val) => {
            setSearch(val);
            setPagination(prev => ({ ...prev, page: 1 }));
          }}
          searchPlaceholder="Tìm user, hành động, chi tiết..."
          
          dateFrom={dateFrom}
          setDateFrom={(val) => {
            setDateFrom(val);
            setPagination(prev => ({ ...prev, page: 1 }));
          }}
          dateTo={dateTo}
          setDateTo={(val) => {
            setDateTo(val);
            setPagination(prev => ({ ...prev, page: 1 }));
          }}
          
          extraFilters={extraFilters}
          hasActiveFilters={!!(search || level || dateFrom || dateTo)}
          clearAllFilters={clearFilters}

          // Pagination
          pagination={{
            total: totalItems,
            currentPage: pagination.page,
            setCurrentPage: (page) => setPagination(prev => ({ ...prev, page })),
            itemsPerPage: pagination.limit,
            setItemsPerPage: (limit) => setPagination(prev => ({ ...prev, limit, page: 1 })),
          }}
        />
      </div>
    </>
  );
}
