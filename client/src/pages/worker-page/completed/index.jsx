import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  Play,
  Pause,
  CheckCircle2,
  AlertCircle,
  X,
  Camera,
  Upload,
  MessageSquare,
  Box,
  CornerDownRight,
  TrendingUp,
  Award,
  Search,
  Filter,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
} from "lucide-react";

// Mock Data cho Thợ (Chỉ List Đã Hoàn Thành)
const MOCK_TASKS = [
  {
    id: "T-0985",
    productName: "Bàn ăn gỗ sồi 6 ghế",
    woodType: "Gỗ Sồi",
    dimensions: "160 x 80 x 75 cm",
    colorType: "Nâu tự nhiên",
    status: "COMPLETED",
    isCustomOrder: true,
    orderCode: "DH-102",
    notes: "Khách khen làm đúng yêu cầu bo tròn viền.",
    startedAt: "05/03/2026 08:30",
    completedAt: "14:30 Hôm nay",
    rating: 5,
    image: "/wood_products.png",
  },
  {
    id: "T-0982",
    productName: "Kệ sách treo tường thông minh",
    woodType: "Gỗ Công Nghiệp MDF",
    dimensions: "120 x 20 x 30 cm",
    colorType: "Trắng bóng mờ",
    status: "COMPLETED",
    isCustomOrder: false,
    orderCode: "NK-09",
    notes: "Xử lý bề mặt rất mịn, đạt chuẩn xuất xưởng.",
    startedAt: "04/03/2026 09:00",
    completedAt: "09:15 Hôm qua",
    rating: 4,
    image: "/wood_products.png",
  },
  {
    id: "T-0975",
    productName: "Giường ngủ tân cổ điển",
    woodType: "Gỗ Gõ Đỏ",
    dimensions: "180 x 200 x 45 cm",
    colorType: "Nâu đỏ đậm",
    status: "COMPLETED",
    isCustomOrder: true,
    orderCode: "DH-099",
    notes: "",
    startedAt: "15/02/2026 14:00",
    completedAt: "Thứ 4, 18/02",
    rating: 5,
    image: "/wood_products.png",
  },
];

const STATUS_CONFIG = {
  COMPLETED: {
    label: "Đã Xong",
    color: "bg-green-100 text-green-700",
    icon: CheckCircle2,
  },
};

export default function WorkerCompleted() {
  const navigate = useNavigate();
  const [tasks] = useState(MOCK_TASKS);

  const [activeFilter, setActiveFilter] = useState("Tất cả");
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  const filters = ["Tất cả", "Đặt theo mẫu", "Hàng sẵn"];

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    // Filter by order type
    if (activeFilter === "Đặt theo mẫu" && !t.isCustomOrder) return false;
    if (activeFilter === "Hàng sẵn" && t.isCustomOrder) return false;

    // Filter by date range (mock logic, should use proper timestamps in prod)
    if (fromDate || toDate) {
      // In a real app with proper timestamps, we would convert completedAt to Date and compare:
      // const taskDate = new Date(t.completedAt).getTime();
      // const start = fromDate ? new Date(fromDate).getTime() : 0;
      // const end = toDate ? new Date(toDate).setHours(23, 59, 59, 999) : Infinity;
      // if (taskDate < start || taskDate > end) return false;

      // For mock data, we just check if it matches basic string formats
      // This is a placeholder since mock data dates are strings like "14:30 Hôm nay"
      const taskDateStr = t.completedAt.toLowerCase();

      if (fromDate) {
        const dObj = new Date(fromDate);
        const df = `${String(dObj.getDate()).padStart(2, "0")}/${String(dObj.getMonth() + 1).padStart(2, "0")}`;
        // Very basic mock check: if user picked a fromDate, tasks not mentioning it or generic terms are excluded (Demo only)
        if (
          !taskDateStr.includes(df) &&
          !taskDateStr.includes("hôm nay") &&
          !taskDateStr.includes("hôm qua")
        ) {
          return false;
        }
      }
      if (toDate) {
        const dObj = new Date(toDate);
        const df = `${String(dObj.getDate()).padStart(2, "0")}/${String(dObj.getMonth() + 1).padStart(2, "0")}`;
        if (
          !taskDateStr.includes(df) &&
          !taskDateStr.includes("hôm nay") &&
          !taskDateStr.includes("hôm qua")
        ) {
          return false;
        }
      }
    }

    // Filter by search term
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      t.productName.toLowerCase().includes(q) ||
      t.orderCode.toLowerCase().includes(q) ||
      t.id.toLowerCase().includes(q)
    );
  });

  // Reset page on search or filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeFilter, fromDate, toDate]);

  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const openTask = (task) => {
    navigate(`/worker/completed/${task.id}`, { state: { task } });
  };

  return (
    <div
      className="flex flex-col h-[calc(100vh-64px)] -m-6 p-6 space-y-4"
      style={{ backgroundColor: "var(--bg-main)" }}
    >
      {/* ── Header Area ── */}
      <div className="flex flex-col gap-4 shrink-0 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-xl font-bold"
            style={{ color: "var(--text-main)" }}
          >
            Lịch sử Hoàn Thành
          </h1>
          <p
            className="text-[13px] mt-0.5"
            style={{ color: "var(--text-placeholder)" }}
          >
            Tuyệt vời! Bạn đã hoàn thành{" "}
            <span className="text-green-600 font-bold">{tasks.length}</span>{" "}
            công việc gần đây.
          </p>
        </div>

        {/* Date Filters (Moved to header right side for better layout match) */}
        <div
          className="flex gap-1 bg-white p-1 rounded-lg border shadow-sm shrink-0"
          style={{ borderColor: "var(--grid-border)" }}
        >
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-1.5 rounded-md text-[13px] font-semibold transition-all ${
                activeFilter === f
                  ? "bg-[var(--bg-main)] text-[var(--text-main)] shadow-sm border"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-main)]"
              }`}
              style={
                activeFilter === f ? { borderColor: "var(--grid-border)" } : {}
              }
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table Container ── */}
      <div
        className="flex flex-col bg-white rounded-2xl flex-1 overflow-hidden"
        style={{
          boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        }}
      >
        {/* Search & Filter Header inside card */}
        <div
          className="px-4 py-3 border-b shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderColor: "var(--grid-border)" }}
        >
          <div className="relative max-w-sm w-full">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-placeholder)" }}
            />
            <input
              type="text"
              placeholder="Tìm tên sản phẩm, mã ĐH..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div
              className="flex items-center gap-1 border rounded-lg bg-[var(--bg-main)] focus-within:ring-2 focus-within:ring-blue-500/20 transition-all px-1"
              style={{ borderColor: "var(--grid-border)" }}
            >
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="h-9 w-[115px] bg-transparent text-[13px] border-none focus:outline-none cursor-pointer text-center"
                style={{ color: "var(--text-main)" }}
              />
            </div>

            <span className="text-[13px] text-gray-400 font-medium">đến</span>

            <div
              className="flex items-center gap-1 border rounded-lg bg-[var(--bg-main)] focus-within:ring-2 focus-within:ring-blue-500/20 transition-all px-1"
              style={{ borderColor: "var(--grid-border)" }}
            >
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="h-9 w-[115px] bg-transparent text-[13px] border-none focus:outline-none cursor-pointer text-center"
                style={{ color: "var(--text-main)" }}
              />
            </div>

            {(fromDate || toDate) && (
              <button
                onClick={() => {
                  setFromDate("");
                  setToDate("");
                }}
                className="p-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-500"
                title="Xóa bộ lọc ngày"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left relative">
            <thead
              className="sticky top-0 z-10"
              style={{
                backgroundColor: "var(--grid-header-bg)",
                borderBottom: "1px solid var(--grid-border)",
              }}
            >
              <tr>
                {[
                  "#",
                  "Sản phẩm",
                  "Mã ĐH",
                  "Thông số",
                  "Ngày bắt đầu",
                  "Thời gian hoàn thành",
                  "",
                ].map((h, i) => (
                  <th
                    key={i}
                    className={`px-4 py-3 text-[11px] font-bold uppercase tracking-wider ${i === 6 ? "text-right" : ""}`}
                    style={{ color: "var(--text-placeholder)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedTasks.map((task, idx) => {
                const StatusIcon = STATUS_CONFIG[task.status].icon;

                return (
                  <tr
                    key={task.id}
                    className="hover:bg-gray-50/50 transition-colors cursor-pointer group"
                    style={{ borderBottom: "1px solid var(--grid-border)" }}
                    onClick={() => openTask(task)}
                  >
                    <td
                      className="px-4 py-3 text-[12px] font-medium"
                      style={{ color: "var(--text-placeholder)" }}
                    >
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </td>

                    {/* Product Name & Image */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border overflow-hidden"
                          style={{
                            borderColor: "var(--grid-border)",
                            backgroundColor: "var(--bg-main)",
                          }}
                        >
                          <img
                            src={task.image}
                            alt={task.productName}
                            className="w-full h-full object-cover grayscale-[20%]"
                          />
                        </div>
                        <div>
                          <p
                            className="text-[13px] font-semibold group-hover:text-blue-600 transition-colors"
                            style={{ color: "var(--text-main)" }}
                          >
                            {task.productName}
                          </p>
                          <p
                            className="text-[10px] font-mono tracking-wide mt-0.5"
                            style={{ color: "var(--text-placeholder)" }}
                          >
                            #{task.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Origin / Order Code */}
                    <td className="px-4 py-3">
                      <p
                        className="text-[12px] font-mono tracking-wide mb-0.5"
                        style={{ color: "var(--text-main)" }}
                      >
                        {task.orderCode}
                      </p>
                      <span
                        className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                          task.isCustomOrder
                            ? "bg-[var(--status-focus)] text-[var(--brand-primary)] border-[var(--status-focus)]"
                            : "bg-gray-100 text-gray-500 border-gray-100"
                        }`}
                      >
                        {task.isCustomOrder ? "Đặt riêng" : "Kho"}
                      </span>
                    </td>

                    {/* Specs */}
                    <td className="px-4 py-3">
                      <p
                        className="text-[12px] font-medium"
                        style={{ color: "var(--text-main)" }}
                      >
                        {task.woodType}
                      </p>
                      <p
                        className="text-[11px]"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {task.dimensions}
                      </p>
                    </td>

                    {/* Start Date */}
                    <td className="px-4 py-3">
                      {task.startedAt ? (
                        <span
                          className="text-[12px] font-medium"
                          style={{ color: "var(--text-main)" }}
                        >
                          {task.startedAt}
                        </span>
                      ) : (
                        <span
                          className="text-[12px]"
                          style={{ color: "var(--text-placeholder)" }}
                        >
                          —
                        </span>
                      )}
                    </td>

                    {/* Time */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-bold bg-green-50 text-green-700 border border-green-100 w-fit">
                        <StatusIcon size={12} />
                        {task.completedAt}
                      </div>
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3 text-right">
                      <button
                        className={`px-3 py-1.5 rounded-md font-semibold text-[12px] transition-colors bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100`}
                        onClick={(e) => {
                          e.stopPropagation();
                          openTask(task);
                        }}
                      >
                        Xem Lại
                      </button>
                    </td>
                  </tr>
                );
              })}

              {paginatedTasks.length === 0 && (
                <tr>
                  <td colSpan="8" className="py-24 text-center">
                    <div
                      className="flex flex-col items-center gap-2"
                      style={{ color: "var(--text-placeholder)" }}
                    >
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center"
                        style={{ backgroundColor: "var(--bg-main)" }}
                      >
                        <LayoutDashboard size={28} strokeWidth={1.5} />
                      </div>
                      <p className="text-sm font-medium mt-1">
                        {searchTerm
                          ? `Không tìm thấy kết quả cho "${searchTerm}"`
                          : "Chưa có công việc nào hoàn thành"}
                      </p>
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm("")}
                          className="text-[13px] font-medium cursor-pointer"
                          style={{ color: "var(--brand-primary)" }}
                        >
                          Xóa bộ lọc
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filteredTasks.length > 0 && (
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
              <span className="font-bold" style={{ color: "var(--text-main)" }}>
                {filteredTasks.length}
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
                  {[10, 15, 30, 50].map((size) => (
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
                  {(currentPage - 1) * itemsPerPage + 1} -{" "}
                  {Math.min(currentPage * itemsPerPage, filteredTasks.length)}
                </span>{" "}
                bản ghi
              </div>

              {/* Arrows */}
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
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
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
  );
}
