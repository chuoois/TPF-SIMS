import React, { useEffect, useState } from "react";
import { ownerService } from "../../../services/owner.service";
import { Card, CardContent, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import {
  RefreshCcw,
  ShieldAlert,
  Clock,
  User,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import { Input } from "../../../components/ui/input";
import { PageHelmet } from "@/components/seo/PageHelmet";

const OwnerSystemLogManage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 20;

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    try {
      const data = await ownerService.getSystemLogs(page, limit);
      setLogs(data.items || []);
      setTotalPages(data.totalPages || 1);
      setTotalItems(data.total || 0);
      setCurrentPage(data.page || 1);
    } catch (error) {
      console.error("Error fetching logs:", error);
      toast.error("Không thể tải nhật ký hệ thống");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.modified_by.toLowerCase().includes(searchTerm.toLowerCase());

    // Sử dụng format yyyy-MM-dd để so sánh chuỗi, tránh lỗi lệch múi giờ (Timezone)
    const logDateStr = format(new Date(log.timestamp), "yyyy-MM-dd");

    const matchesStartDate = startDate ? logDateStr >= startDate : true;
    const matchesEndDate = endDate ? logDateStr <= endDate : true;

    return matchesSearch && matchesStartDate && matchesEndDate;
  });

  if (loading && logs.length === 0) {
    return (
      <div className="p-8 text-center text-gray-400 animate-pulse font-medium uppercase tracking-widest text-xs">
        Đang tải nhật ký...
      </div>
    );
  }

  const resetFilters = () => {
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchLogs(newPage);
    }
  };

  return (
    <>
      <PageHelmet title="Nhật ký hệ thống - TPF-SIMS" />
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Nhật ký hệ thống
            </h1>
            <p className="text-gray-500 text-sm">
              Giám sát các hoạt động quan trọng trên hệ thống
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => fetchLogs(currentPage)}
            disabled={loading}
            className="flex items-center gap-2 border-gray-200"
          >
            <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
            <span className="text-xs font-bold uppercase">Làm mới</span>
          </Button>
        </div>

        {/* SEARCH & DATE FILTERS BAR */}
        <div className="bg-white p-3 border rounded-md shadow-sm flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <Input
              placeholder="Tìm nội dung hoặc người thực hiện..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 border-gray-200"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-md px-2 h-10">
              <span className="text-[10px] font-bold text-gray-400 uppercase">
                Từ
              </span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-xs text-gray-600 outline-none w-28"
              />
            </div>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-md px-2 h-10">
              <span className="text-[10px] font-bold text-gray-400 uppercase">
                Đến
              </span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-xs text-gray-600 outline-none w-28"
              />
            </div>
          </div>
        </div>

        {/* TABLE */}
        <Card className="border shadow-none overflow-hidden rounded-xl">
          <CardContent className="p-0">
            <div className="overflow-auto h-[calc(100vh-420px)] relative">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 sticky top-0 z-10 border-b">
                  <tr>
                    <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-[180px]">
                      Thời gian
                    </th>
                    <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-[200px]">
                      Người thực hiện
                    </th>
                    <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Nội dung thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y bg-white">
                  {filteredLogs.map((log) => (
                    <tr
                      key={log.pk_system_log_id}
                      className="hover:bg-gray-50/50 transition-colors border-gray-100"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-gray-500">
                          <Clock size={14} className="opacity-50" />
                          <span className="text-xs font-medium">
                            {format(
                              new Date(log.timestamp),
                              "HH:mm:ss - dd/MM/yyyy",
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/5 flex items-center justify-center text-primary font-bold text-[10px] border border-primary/10">
                            <User size={12} />
                          </div>
                          <span
                            className="text-xs font-bold text-gray-700 truncate max-w-[160px]"
                            title={log.modified_by}
                          >
                            {log.modified_by}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-start gap-2">
                          <ShieldAlert
                            size={14}
                            className="mt-0.5 text-gray-300"
                          />
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {log.description}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredLogs.length === 0 && !loading && (
                    <tr>
                      <td colSpan="3" className="p-20 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-300 italic">
                          <p className="text-sm">
                            Không tìm thấy nhật ký phù hợp.
                          </p>
                          {(searchTerm || startDate || endDate) && (
                            <Button
                              variant="link"
                              size="sm"
                              onClick={resetFilters}
                              className="mt-2 text-primary font-bold"
                            >
                              Xóa bộ lọc
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
          {/* PAGINATION CONTROLS */}
          <div className="bg-gray-50/50 border-t p-3 flex justify-between items-center">
            <div className="text-xs text-gray-500 italic">
              Hiển thị {filteredLogs.length} / {totalItems} nhật ký
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                disabled={currentPage === 1 || loading}
                onClick={() => handlePageChange(currentPage - 1)}
                className="h-8 w-8 border-gray-200 shadow-none"
              >
                <ChevronLeft size={14} />
              </Button>
              <div className="bg-white border rounded-md h-8 px-3 flex items-center justify-center min-w-[60px] shadow-sm">
                <span className="text-xs font-bold text-primary">
                  {currentPage}{" "}
                  <span className="text-gray-300 mx-1 font-normal">/</span>{" "}
                  {totalPages}
                </span>
              </div>
              <Button
                variant="outline"
                size="icon"
                disabled={currentPage === totalPages || loading}
                onClick={() => handlePageChange(currentPage + 1)}
                className="h-8 w-8 border-gray-200 shadow-none"
              >
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};

export default OwnerSystemLogManage;
