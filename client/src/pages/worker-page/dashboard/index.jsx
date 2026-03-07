import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  X,
  LayoutDashboard,
} from "lucide-react";
import { MOCK_TASKS, STATUS_CONFIG } from "../mock";

export default function WorkerDashboard() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [activeFilter, setActiveFilter] = useState("Hôm nay");
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  useEffect(() => {
    setTasks(MOCK_TASKS);
  }, []);

  const openTask = (taskId) => {
    navigate(`/worker/dashboard/${taskId}`);
  };

  const getPrimaryAction = (status) => {
    switch (status) {
      case "WAITING":
      case "REWORK":
        return {
          label: "Bắt đầu làm",
          color: "bg-blue-600 hover:bg-blue-700 text-white",
        };
      case "SANDING":
      case "PAINTING":
        return {
          label: "Tiếp tục",
          color: "bg-green-500 hover:bg-green-600 text-white",
        };
      case "QC_PENDING":
        return {
          label: "Đang kiểm duyệt",
          color: "bg-orange-50 text-orange-600 cursor-default",
          disabled: true,
        };
      case "COMPLETED":
        return {
          label: "Đã hoàn thành",
          color: "bg-gray-100 text-gray-500 cursor-default",
          disabled: true,
        };
      default:
        return {
          label: "Xem chi tiết",
          color: "bg-blue-600 hover:bg-blue-700 text-white",
        };
    }
  };

  const filters = ["Hôm nay", "Ngày mai", "Tuần này"];

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
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
  }, [searchTerm, activeFilter]);

  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
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
            Công việc đang chờ
          </h1>
          <p
            className="text-[13px] mt-0.5"
            style={{ color: "var(--text-placeholder)" }}
          >
            {filteredTasks.length} công việc cần xử lý
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

      {/* Search + Table Card */}
      <div
        className="flex flex-col bg-white rounded-2xl flex-1 overflow-hidden"
        style={{
          boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        }}
      >
        {/* Search */}
        <div
          className="px-4 py-3 border-b shrink-0 flex items-center justify-between gap-4"
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
        </div>

        {/* Table Container - Fixed Height Scroll */}
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
                  "Trạng thái",
                  "Hạn chót",
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
                const action = getPrimaryAction(task.status);

                return (
                  <tr
                    key={task.id}
                    className="hover:bg-gray-50/50 transition-colors cursor-pointer group"
                    style={{ borderBottom: "1px solid var(--grid-border)" }}
                    onClick={() => openTask(task.id)}
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
                            className="w-full h-full object-cover"
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

                    {/* Status */}
                    <td className="px-4 py-3">
                      <div
                        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-bold border ${
                          task.status === "QC_PENDING"
                            ? "bg-orange-50 text-orange-600 border-orange-100"
                            : task.status === "REWORK"
                              ? "bg-red-50 text-red-600 border-red-100"
                              : task.status === "WAITING"
                                ? "bg-gray-50 text-gray-600 border-gray-200"
                                : task.status === "COMPLETED"
                                  ? "bg-green-50 text-green-600 border-green-100"
                                  : "bg-blue-50 text-blue-600 border-blue-100"
                        }`}
                      >
                        <StatusIcon size={12} />
                        {STATUS_CONFIG[task.status].label}
                      </div>
                    </td>

                    {/* Deadline */}
                    <td className="px-4 py-3">
                      {task.deadline ? (
                        <span className="text-[12px] font-bold text-red-600">
                          {task.deadline}
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

                    {/* Action */}
                    <td className="px-4 py-3 text-right">
                      <button
                        disabled={action.disabled}
                        className={`px-3 py-1.5 rounded-md font-semibold text-[12px] transition-colors ${action.disabled ? "bg-gray-100 text-gray-400" : "bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white"}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!action.disabled) openTask(task.id);
                        }}
                      >
                        {action.label}
                      </button>
                    </td>
                  </tr>
                );
              })}

              {paginatedTasks.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-24 text-center">
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
                          ? `Không tìm thấy bộ lọc cho "${searchTerm}"`
                          : "Chưa có công việc nào"}
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
