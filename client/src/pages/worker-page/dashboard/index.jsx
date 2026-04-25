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
  AlertTriangle,
  Clock,
  Hammer,
  Package,
  CheckCircle2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { getOrders, STATUS_CONFIG, getWarehouseStatus, updateWarehouseStatus } from "../mock";

const OrderItemRow = ({ item }) => {
  const navigate = useNavigate();
  const config = STATUS_CONFIG[item.status] || STATUS_CONFIG.WAITING;
  const StatusIcon = config.icon || LayoutDashboard;

  return (
    <div
      onClick={() => navigate(`/worker/dashboard/${item.id}`)}
      className="flex flex-col md:flex-row items-start md:items-center gap-4 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50/100 transition-colors px-4 rounded-xl cursor-pointer group"
    >
      <div
        className="h-20 w-20 rounded-2xl overflow-hidden shrink-0 border bg-white shadow-sm"
        style={{ borderColor: "var(--grid-border)" }}
      >
        <img
          src={item.picture}
          alt={item.productName}
          className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>

      <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <h4
            className="text-[15px] font-black mb-2 group-hover:text-[var(--brand-primary)] transition-colors"
            style={{ color: "var(--text-main)" }}
          >
            {item.productName}
          </h4>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-2 gap-x-6 text-[12px]" style={{ color: "var(--text-secondary)" }}>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Kích thước</span>
              <span className="font-bold text-slate-600">{item.size}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Loại gỗ</span>
              <span className="font-bold text-slate-600">{item.type}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Màu sắc</span>
              <span className="font-bold text-slate-600">{item.color}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Số lượng</span>
              <span className="font-black text-indigo-600">x{item.quantity}</span>
            </div>
          </div>

          {(item.startedAt || item.deadline || item.note) && (
            <div className="mt-3 flex flex-wrap items-center gap-4 border-t border-dashed pt-2 border-slate-100">
               {item.startedAt && <span className="text-[11px]"><strong className="text-slate-400 uppercase tracking-tighter mr-1">Ngày làm:</strong> <span className="font-bold text-slate-600">{item.startedAt}</span></span>}
               {item.deadline && <span className="text-[11px]"><strong className="text-slate-400 uppercase tracking-tighter mr-1">Hạn chót:</strong> <span className="font-bold text-slate-600">{item.deadline}</span></span>}
               {item.note && (
                  <div className="text-[11px] flex items-center gap-1.5 text-amber-600 bg-amber-50/50 px-2 py-0.5 rounded border border-amber-100">
                    <Info size={12} className="shrink-0" />
                    <span className="font-bold truncate max-w-[200px]">{item.note}</span>
                  </div>
               )}
            </div>
          )}
        </div>

        <div className="flex flex-row md:flex-col items-center md:items-end gap-3 shrink-0 self-stretch justify-between md:justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-6">
          <div className={`px-3 py-1.5 ${config.color} rounded-full text-[11px] font-black border flex items-center gap-2 shadow-sm whitespace-nowrap`}>
            <StatusIcon size={14} className={(item.status === 'INSPECTION') ? 'animate-pulse' : ''} />
            <span className="uppercase tracking-wider">{config.label}</span>
          </div>
          
          <button
            className="px-4 py-2 text-[11px] font-black uppercase tracking-widest rounded-xl border text-slate-500 bg-white hover:bg-[var(--brand-primary)] hover:text-white hover:border-[var(--brand-primary)] transition-all flex items-center gap-2 shadow-sm"
          >
            Chi tiết
            <ChevronRightIcon size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default function WorkerDashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [orders, setOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [isWarehouseOverloaded, setIsWarehouseOverloaded] = useState(false);

  useEffect(() => {
    // Fetch global mock state so returning from Detail Page reflects updates
    setOrders(getOrders());
    setIsWarehouseOverloaded(getWarehouseStatus().isOverloaded);
  }, []);

  const handleToggleWarehouseStatus = () => {
    const newStatus = !isWarehouseOverloaded;
    updateWarehouseStatus(newStatus);
    setIsWarehouseOverloaded(newStatus);
    if (newStatus) {
      toast.success("Đã báo cáo kho quá tải cho Sales", {
        icon: '⚠️',
        style: {
          borderRadius: '10px',
          background: '#fff',
          color: '#d97706',
          border: '1px solid #fcd34d'
        },
      });
    } else {
      toast.success("Đã cập nhật: Kho đã ổn định", {
        icon: '✅',
      });
    }
  };

  const activeFilter = searchParams.get("filter") || "Tất cả";
  const searchTerm = searchParams.get("search") || "";
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
    if (!updates.page && (updates.filter || updates.search)) {
      newParams.set("page", "1");
    }
    setSearchParams(newParams);
  };

  const setActiveFilter = (f) => updateParams({ filter: f });
  const setSearchTerm = (s) => updateParams({ search: s });
  const setCurrentPage = (p) => updateParams({ page: p.toString() });
  const setItemsPerPage = (sp) => updateParams({ perPage: sp.toString() });

  const toggleOrder = (orderId) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  const filters = ["Tất cả", "Hàng khách đặt", "Hàng mộc"];

  // Filter orders
  const filteredOrders = orders.filter((o) => {
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
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2 text-slate-800">
            <LayoutDashboard className="text-[var(--brand-primary)]" />
            Công việc đang chờ xử lý
          </h1>
          <p className="text-[13px] mt-0.5 text-slate-400 font-medium">
            {filteredOrders.length} đơn hàng đang trong quá trình gia công
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Warehouse Overload Toggle Button */}
          <button
            onClick={handleToggleWarehouseStatus}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold transition-all duration-300 shadow-sm border ${
              isWarehouseOverloaded
                ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 animate-pulse"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            <AlertTriangle size={18} className={isWarehouseOverloaded ? "text-red-600" : "text-amber-500"} />
            {isWarehouseOverloaded ? "KHO ĐANG QUÁ TẢI" : "BÁO KHO QUÁ TẢI"}
          </button>

          {/* Filters */}
          <div
            className="flex gap-1 bg-white p-1 rounded-xl border shadow-sm shrink-0 border-slate-200"
          >
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-[13px] font-bold transition-all ${
                  activeFilter === f
                    ? "bg-slate-100 text-slate-900 border-slate-200 border"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TỔNG HỢP TIẾN ĐỘ (STATS ROW) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-4 rounded-2xl shadow-lg shadow-indigo-200 flex items-center justify-between group">
          <div className="text-white">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-70">Tổng đơn tại xưởng</p>
            <h3 className="text-3xl font-black mt-1 leading-none">{orders.length}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:scale-110 transition-transform">
             <Package size={24} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-sky-500 to-blue-600 p-4 rounded-2xl shadow-lg shadow-blue-200 flex items-center justify-between group">
          <div className="text-white">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-70">Đang xử lý</p>
            <h3 className="text-3xl font-black mt-1 leading-none">
              {orders.filter(o => ["WAITING", "PROCESSING", "INSPECTION", "OWNER_PENDING"].includes(o.status)).length}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:scale-110 transition-transform">
             <Clock size={24} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-4 rounded-2xl shadow-lg shadow-emerald-200 flex items-center justify-between group">
          <div className="text-white">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-70">Hoàn thành</p>
            <h3 className="text-3xl font-black mt-1 leading-none">{orders.filter(o => o.status === 'COMPLETED').length}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:scale-110 transition-transform">
             <CheckCircle2 size={24} />
          </div>
        </div>


        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
           <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                  type="text" 
                  placeholder="Tìm đơn, khách..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-bold focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
              />
           </div>
           {searchTerm && (
             <button onClick={() => setSearchTerm("")} className="text-slate-400 hover:text-slate-600 transition-colors">
               <X size={18} />
             </button>
           )}
        </div>
      </div>

      <div
        className="flex flex-col bg-white rounded-2xl flex-1 overflow-hidden"
        style={{
          boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        }}
      >

        {/* Table Container */}
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
                  "Ngày đặt nội thất",
                  "Hạn chót",
                  "Trạng thái",
                  "Số lượng",
                ].map((h, i) => (
                  <th
                    key={i}
                    className={`px-4 py-3 text-[11px] font-bold uppercase tracking-wider ${
                      i === 6 ? "text-right pr-6" : ""
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
                      className={`transition-colors cursor-pointer group ${
                        isExpanded ? "bg-blue-50/20" : "hover:bg-gray-50/50"
                      }`}
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
                          className="text-[14px] font-bold font-mono tracking-wide flex items-center gap-2 group-hover:text-blue-600 transition-colors"
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
                        {(() => {
                          const deadlines = order.items
                            .map((item) => item.deadline)
                            .filter(Boolean);
                          if (deadlines.length === 0) return <span className="text-[12px] text-gray-400">Chưa có</span>;
                          
                          const sorted = deadlines.sort((a, b) => {
                            const [da, ma, ya] = a.split("/").map(Number);
                            const [db, mb, yb] = b.split("/").map(Number);
                            return new Date(ya, ma - 1, da) - new Date(yb, mb - 1, db);
                          });
                          
                          const earliest = sorted[0];
                          const [d, m, y] = earliest.split("/").map(Number);
                          const expiryDate = new Date(y, m - 1, d);
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const diffDays = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

                          let colorClass = "text-gray-600 bg-gray-50 border-gray-100";
                          if (diffDays <= 1) colorClass = "text-orange-700 bg-orange-50 border-orange-100 font-bold animate-pulse";
                          else if (diffDays <= 3) colorClass = "text-amber-700 bg-amber-50 border-amber-100 font-semibold";

                          return (
                            <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px] border ${colorClass}`}>
                              {earliest}
                              {diffDays >= 0 && diffDays <= 3 && <span className="text-[9px] uppercase">({diffDays === 0 ? "Hôm nay" : `Còn ${diffDays}n`})</span>}
                            </div>
                          );
                        })()}
                      </td>

                      <td className="px-4 py-4">
                        <div
                          className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-bold border ${
                            order.status === "COMPLETED"
                              ? "bg-green-50 text-green-600 border-green-100"
                              : order.status === "PROCESSING"
                              ? "bg-blue-50 text-blue-600 border-blue-100"
                              : "bg-gray-50 text-gray-600 border-gray-200"
                          }`}
                        >
                          {order.status === "PROCESSING" ? "ĐANG XỬ LÝ" : order.status === "COMPLETED" ? "HOÀN THÀNH" : "CHỜ XỬ LÝ"}
                        </div>
                      </td>

                      <td className="px-4 py-4 text-right pr-6">
                        <div className="flex items-center justify-end gap-4">
                          <span
                            className="text-[12px] font-semibold px-2.5 py-1 bg-gray-100/80 rounded-md border whitespace-nowrap"
                            style={{
                              color: "var(--text-main)",
                              borderColor: "var(--grid-border)",
                            }}
                          >
                            {order.items.length} SP
                          </span>
                          <button
                            className={`p-1.5 rounded-full transition-colors inline-flex items-center justify-center shrink-0 ${
                              isExpanded
                                ? "bg-blue-100 text-blue-600"
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
                        </div>
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
                                Chi tiết sản phẩm trong đơn (# {order.id})
                              </h4>
                              <div
                                className="bg-white border rounded-xl shadow-sm p-2 flex flex-col"
                                style={{ borderColor: "var(--grid-border)" }}
                              >
                                {order.items.map((item) => (
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
                          ? `Không tìm thấy đơn hàng cho "${searchTerm}"`
                          : "Chưa có đơn hàng nào"}
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
