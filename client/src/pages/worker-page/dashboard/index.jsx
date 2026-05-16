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
  Clock,
  Hammer,
  Package,
  CheckCircle2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { STATUS_CONFIG } from "../mock";
import workerService from "@/services/worker.service";
import DataTable from "@/components/control/DataTable";

const OrderItemRow = ({ item }) => {
  const navigate = useNavigate();
  const config = STATUS_CONFIG[item.status] || STATUS_CONFIG["Chờ gia công"] || { label: item.status, color: "bg-gray-100 text-gray-700", icon: LayoutDashboard };
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
                  <div className="mt-2 text-[11px] flex items-start gap-1.5 text-amber-600 bg-amber-50 px-2 py-1.5 rounded-md border border-amber-100 w-fit max-w-full">
                    <Info size={14} className="shrink-0 mt-0.5" />
                    <span className="truncate font-medium">Ghi chú: {item.note}</span>
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        const res = await workerService.getPendingTasks();
        setOrders(res.data);
      } catch (error) {
        console.error("Fetch tasks failed", error);
        toast.error("Lỗi khi tải dữ liệu công việc!");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTasks();
  }, []);



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

  const columns = [
    {
      header: "STT",
      headerClassName: "text-center w-[60px]",
      render: (_, idx) => (currentPage - 1) * itemsPerPage + idx + 1,
      className: "text-center text-[12px] font-medium text-gray-500",
    },
    {
      header: "Mã ĐH",
      render: (o) => (
        <p className="text-[14px] font-bold font-mono tracking-wide flex items-center gap-2 group-hover:text-blue-600 transition-colors" style={{ color: "var(--text-main)" }}>
          {o.id}
        </p>
      ),
    },
    {
      header: "Khách hàng",
      render: (o) => (
        <span className="text-[13px] font-semibold" style={{ color: "var(--text-main)" }}>
          {o.customerName}
        </span>
      ),
    },
    {
      header: "Ngày đặt nội thất",
      render: (o) => (
        <span className="text-[12px] font-medium" style={{ color: "var(--text-main)" }}>
          {o.orderDate}
        </span>
      ),
    },
    {
      header: "Hạn chót",
      render: (o) => {
        const deadlines = o.items.map((item) => item.deadline).filter(Boolean);
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
      },
    },
    {
      header: "Trạng thái",
      render: (o) => {
        const isCompleted = o.status === "Hoàn Thành";
        const isProcessing = o.status === "Đang gia công";
        const isPending = o.status === "Gửi Nghiệm Thu";
        
        return (
          <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-bold border ${
              isCompleted ? "bg-green-50 text-green-600 border-green-100"
            : isProcessing ? "bg-blue-50 text-blue-600 border-blue-100"
            : isPending ? "bg-amber-50 text-amber-600 border-amber-100"
            : "bg-gray-50 text-gray-600 border-gray-200"
          }`}>
            {o.status.toUpperCase()}
          </div>
        );
      },
    },
    {
      header: "Số lượng",
      headerClassName: "text-right pr-6",
      className: "text-right pr-6",
      render: (o) => (
        <span className="text-[12px] font-semibold px-2.5 py-1 bg-gray-100/80 rounded-md border whitespace-nowrap" style={{ color: "var(--text-main)", borderColor: "var(--grid-border)" }}>
          {o.items.length} SP
        </span>
      ),
    }
  ];

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

      </div>

      {/* TỔNG HỢP TIẾN ĐỘ (STATS ROW) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
        <div className="bg-gradient-to-br from-slate-500 to-slate-600 p-4 rounded-2xl shadow-lg shadow-slate-200 flex items-center justify-between group">
          <div className="text-white">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-70">Chờ nhận</p>
            <h3 className="text-3xl font-black mt-1 leading-none">{orders.filter(o => o.status === 'Chờ gia công').length}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:scale-110 transition-transform">
             <Package size={24} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-sky-500 to-blue-600 p-4 rounded-2xl shadow-lg shadow-blue-200 flex items-center justify-between group">
          <div className="text-white">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-70">Đang làm</p>
            <h3 className="text-3xl font-black mt-1 leading-none">
              {orders.filter(o => o.status === "Đang gia công").length}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:scale-110 transition-transform">
             <Hammer size={24} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-4 rounded-2xl shadow-lg shadow-orange-200 flex items-center justify-between group">
          <div className="text-white">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-70">Chờ duyệt</p>
            <h3 className="text-3xl font-black mt-1 leading-none">
              {orders.filter(o => o.status === "Gửi Nghiệm Thu").length}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:scale-110 transition-transform">
             <Clock size={24} />
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={paginatedOrders}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        isLoading={isLoading}
        extraFilters={
          <div className="flex gap-1 bg-white p-1 rounded-lg border border-slate-200">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-1 rounded-md text-[13px] font-bold transition-all ${
                  activeFilter === f
                    ? "bg-slate-100 text-slate-900 border-slate-200 border"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        }
        hasActiveFilters={activeFilter !== "Tất cả" || searchTerm !== ""}
        clearAllFilters={() => {
          setActiveFilter("Tất cả");
          setSearchTerm("");
        }}
        renderDetail={(order) => (
          <div className="bg-gray-50/50 px-6 py-4" style={{ boxShadow: "inset 0 4px 6px -4px rgba(0,0,0,0.05)" }}>
            <h4 className="text-[11px] font-bold uppercase tracking-wider mb-3 pl-1 text-gray-500">
              Chi tiết sản phẩm trong đơn (# {order.id})
            </h4>
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-2 flex flex-col gap-2">
              {order.items.map((item) => (
                <OrderItemRow key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}
        expandedIds={expandedOrderId ? [expandedOrderId] : []}
        onToggleExpand={(id) => toggleOrder(id)}
        pagination={{
          total: filteredOrders.length,
          currentPage: currentPage,
          setCurrentPage: setCurrentPage,
          itemsPerPage: itemsPerPage,
          setItemsPerPage: setItemsPerPage,
        }}
      />
    </div>
  );
}
