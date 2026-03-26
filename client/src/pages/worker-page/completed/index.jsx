import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  LayoutDashboard,
  Info,
  ChevronRight as ChevronRightIcon,
  CheckCircle2,
  Calendar
} from "lucide-react";
import { getOrders, STATUS_CONFIG } from "../mock";

const OrderItemRow = ({ item }) => {
  const navigate = useNavigate();
  const config = STATUS_CONFIG[item.status] || STATUS_CONFIG.COMPLETED;
  const StatusIcon = config.icon || CheckCircle2;

  return (
    <div
      onClick={() => navigate(`/worker/completed/${item.id}`)}
      className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50/100 transition-colors px-3 rounded-lg cursor-pointer group"
    >
      <div
        className="h-16 w-16 rounded-xl overflow-hidden shrink-0 border bg-white"
        style={{ borderColor: "var(--grid-border)" }}
      >
        <img
          src={item.picture}
          alt={item.productName}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform grayscale-[15%]"
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 gap-2">
          <h4
            className="text-[13px] font-semibold truncate group-hover:text-[var(--brand-primary)] transition-colors"
            style={{ color: "var(--text-main)" }}
          >
            {item.productName}
          </h4>
          <span className={`px-2.5 py-1 ${config.color} rounded-full text-[11px] font-bold border flex items-center gap-1 w-fit`}>
            <StatusIcon size={12} />
            {config.label}
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-1 gap-x-4 text-[12px] mt-1.5" style={{ color: "var(--text-secondary)" }}>
          <div className="flex items-center gap-1">
            <strong className="font-semibold" style={{ color: "var(--text-main)" }}>Kích thước:</strong> {item.size}
          </div>
          <div className="flex items-center gap-1">
            <strong className="font-semibold" style={{ color: "var(--text-main)" }}>Loại:</strong> {item.type}
          </div>
          <div className="flex items-center gap-1">
            <strong className="font-semibold" style={{ color: "var(--text-main)" }}>Màu sắc:</strong> {item.color}
          </div>
          <div className="flex items-center gap-1">
            <strong className="font-semibold" style={{ color: "var(--text-main)" }}>Số lượng:</strong> x{item.quantity}
          </div>
        </div>

        {(item.startedAt || item.deadline) && (
           <div className="mt-2 flex flex-wrap gap-4 text-[11px] font-medium" style={{ color: "var(--text-secondary)" }}>
             {item.startedAt && <span><strong style={{ color: "var(--text-main)" }}>Ngày làm:</strong> {item.startedAt}</span>}
             {item.deadline && <span><strong style={{ color: "var(--text-main)" }}>Hạn chót:</strong> {item.deadline}</span>}
           </div>
        )}

        {item.note && (
          <div className="mt-2 text-[11px] flex items-start gap-1.5 text-gray-500 bg-gray-50 px-2 py-1.5 rounded-md border border-gray-100 w-fit max-w-full">
            <Info size={14} className="shrink-0 mt-0.5" />
            <span className="truncate">{item.note}</span>
          </div>
        )}
      </div>

      <div className="shrink-0 w-full sm:w-auto mt-2 sm:mt-0 flex justify-end">
        <button
          className="px-3 py-1.5 text-[12px] font-bold rounded-lg border text-gray-500 bg-white group-hover:bg-green-50 group-hover:text-green-600 transition-colors flex items-center gap-1"
          style={{ borderColor: "var(--grid-border)" }}
        >
          Xem lại
          <ChevronRightIcon size={14} className="ml-0.5" />
        </button>
      </div>
    </div>
  );
};

export default function WorkerCompleted() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [orders, setOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    // Fetch global mock state so returning from Detail Page reflects updates
    setOrders(getOrders());
  }, []);

  const activeFilter = searchParams.get("filter") || "Tất cả";
  const searchTerm = searchParams.get("search") || "";
  const fromDate = searchParams.get("from") || "";
  const toDate = searchParams.get("to") || "";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const itemsPerPage = parseInt(searchParams.get("perPage") || "15", 10);

  const updateParams = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    if (!updates.page && (updates.filter || updates.search || updates.from || updates.to)) {
      newParams.set("page", "1");
    }
    setSearchParams(newParams);
  };

  const setActiveFilter = (f) => updateParams({ filter: f });
  const setSearchTerm = (s) => updateParams({ search: s });
  const setFromDate = (d) => updateParams({ from: d });
  const setToDate = (d) => updateParams({ to: d });
  const setCurrentPage = (p) => updateParams({ page: p.toString() });
  const setItemsPerPage = (sp) => updateParams({ perPage: sp.toString() });

  const toggleOrder = (orderId) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  const filters = ["Tất cả", "Hàng khách đặt", "Hàng mộc"];

  // Filter ONLY COMPLETED orders
  const completedOrders = orders.filter(o => o.status === "COMPLETED");

  const filteredOrders = completedOrders.filter((o) => {
    if (activeFilter === "Hàng khách đặt" && !o.isCustomOrder) return false;
    if (activeFilter === "Hàng mộc" && o.isCustomOrder) return false;

    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      o.id.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.items.some((item) => item.productName.toLowerCase().includes(q))
    );
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
            <span className="text-green-600 font-bold">{completedOrders.length}</span>{" "}
            đơn hàng gần đây.
          </p>
        </div>

        {/* Filters */}
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
              placeholder="Tìm mã ĐH, tên KH, sản phẩm..."
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
              className="flex items-center gap-1 border rounded-lg bg-[var(--bg-main)] focus-within:ring-2 focus-within:ring-green-500/20 transition-all px-1"
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
              className="flex items-center gap-1 border rounded-lg bg-[var(--bg-main)] focus-within:ring-2 focus-within:ring-green-500/20 transition-all px-1"
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
          <table className="w-full text-left relative" style={{ borderCollapse: 'collapse' }}>
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
                  "Mã ĐH",
                  "Khách hàng",
                  "Ngày đặt hàng",
                  "Trạng thái",
                  "Số lượng",
                  "",
                ].map((h, i) => (
                  <th
                    key={i}
                    className={`px-4 py-3 text-[11px] font-bold uppercase tracking-wider ${
                      i === 6 ? "text-right" : ""
                    }`}
                    style={{ color: "var(--text-placeholder)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map((order, idx) => {
                const isExpanded = expandedOrderId === order.id;

                return (
                  <React.Fragment key={order.id}>
                    <tr
                      className={`transition-colors cursor-pointer group hover:bg-gray-50/50`}
                      style={{ borderBottom: "1px solid var(--grid-border)" }}
                      onClick={() => toggleOrder(order.id)}
                    >
                      <td
                        className="px-4 py-4 text-[12px] font-medium"
                        style={{ color: "var(--text-placeholder)" }}
                      >
                        {(currentPage - 1) * itemsPerPage + idx + 1}
                      </td>

                      <td className="px-4 py-4">
                        <p
                          className="text-[14px] font-bold font-mono tracking-wide flex items-center gap-2 group-hover:text-green-600 transition-colors"
                          style={{ color: "var(--text-main)" }}
                        >
                          {order.id}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className="text-[13px] font-semibold"
                          style={{ color: "var(--text-main)" }}
                        >
                          {order.customerName}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className="text-[12px] font-medium"
                          style={{ color: "var(--text-main)" }}
                        >
                          {order.orderDate}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div
                          className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-bold border bg-green-50 text-green-600 border-green-100`}
                        >
                          <CheckCircle2 size={12}/>
                          ĐÃ HOÀN THÀNH
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className="text-[12px] font-semibold px-2.5 py-1 bg-gray-100/80 rounded-md border"
                          style={{
                            color: "var(--text-main)",
                            borderColor: "var(--grid-border)",
                          }}
                        >
                          {order.items.length} SP
                        </span>
                      </td>

                      <td className="px-4 py-4 text-right">
                        <button
                          className={`p-1.5 rounded-full transition-colors inline-flex items-center justify-center ${
                            isExpanded
                              ? "bg-green-100 text-green-600"
                              : "text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-700"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleOrder(order.id);
                          }}
                        >
                          <ChevronDown
                            className={`transition-transform duration-300 ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                            size={18}
                          />
                        </button>
                      </td>
                    </tr>

                    {/* Expandable Content inside Table Row */}
                    <tr>
                      <td colSpan={7} className="p-0 border-0">
                        <div
                          className={`grid transition-all duration-300 ease-in-out ${
                            isExpanded
                              ? "grid-rows-[1fr] opacity-100 border-b"
                              : "grid-rows-[0fr] opacity-0"
                          }`}
                          style={{ borderColor: "var(--grid-border)" }}
                        >
                          <div className="overflow-hidden">
                            <div className="bg-gray-50/50 px-6 py-4 shrink-0" style={{ boxShadow: "inset 0 4px 6px -4px rgba(0,0,0,0.05)" }}>
                              <h4
                                className="text-[11px] font-bold uppercase tracking-wider mb-3 pl-1"
                                style={{ color: "var(--text-placeholder)" }}
                              >
                                Danh sách sản phẩm hoàn thành (# {order.id})
                              </h4>
                              <div
                                className="bg-white border rounded-xl shadow-sm p-2 flex flex-col"
                                style={{ borderColor: "var(--grid-border)" }}
                              >
                                {order.items.filter((item) => item.status === "COMPLETED").map((item) => (
                                  <OrderItemRow
                                    key={item.id}
                                    item={item}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}

              {paginatedOrders.length === 0 && (
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
                          ? `Không tìm thấy đơn hàng hoàn thành cho "${searchTerm}"`
                          : "Chưa có đơn hàng nào hoàn thành"}
                      </p>
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm("")}
                          className="text-[13px] font-medium cursor-pointer transition-colors hover:underline"
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
        {filteredOrders.length > 0 && (
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
                {filteredOrders.length}
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
                  {[10, 15, 30, 50].map((size) => (
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
                <span
                  className="font-bold"
                  style={{ color: "var(--text-main)" }}
                >
                  {(currentPage - 1) * itemsPerPage + 1} -{" "}
                  {Math.min(currentPage * itemsPerPage, filteredOrders.length)}
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
