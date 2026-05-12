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
import { STATUS_CONFIG } from "../mock";

import workerService from "@/services/worker.service";
import toast from "react-hot-toast";
import DataTable from "@/components/control/DataTable";

const OrderItemRow = ({ item }) => {
  const navigate = useNavigate();
  const config = STATUS_CONFIG[item.status] || STATUS_CONFIG["Hoàn Thành"];
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

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        const res = await workerService.getCompletedTasks();
        setOrders(res.data);
      } catch (error) {
        console.error("Fetch completed tasks failed", error);
        toast.error("Lỗi khi tải dữ liệu công việc đã hoàn thành!");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTasks();
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
  const completedOrders = orders.filter(o => o.status === "Hoàn Thành");

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
        <p className="text-[14px] font-bold font-mono tracking-wide flex items-center gap-2 group-hover:text-green-600 transition-colors" style={{ color: "var(--text-main)" }}>
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
      header: "Ngày đặt hàng",
      render: (o) => (
        <span className="text-[12px] font-medium" style={{ color: "var(--text-main)" }}>
          {o.orderDate}
        </span>
      ),
    },
    {
      header: "Trạng thái",
      render: (o) => (
        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-bold border bg-green-50 text-green-600 border-green-100`}>
          <CheckCircle2 size={12}/>
          ĐÃ HOÀN THÀNH
        </div>
      ),
    },
    {
      header: "Số lượng",
      render: (o) => (
        <span className="text-[12px] font-semibold px-2.5 py-1 bg-gray-100/80 rounded-md border" style={{ color: "var(--text-main)", borderColor: "var(--grid-border)" }}>
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

      </div>

      <DataTable
        columns={columns}
        data={paginatedOrders}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        isLoading={isLoading}
        dateFrom={fromDate}
        setDateFrom={setFromDate}
        dateTo={toDate}
        setDateTo={setToDate}
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
        hasActiveFilters={activeFilter !== "Tất cả" || searchTerm !== "" || fromDate !== "" || toDate !== ""}
        clearAllFilters={() => {
          setActiveFilter("Tất cả");
          setSearchTerm("");
          setFromDate("");
          setToDate("");
        }}
        renderDetail={(order) => (
          <div className="bg-gray-50/50 px-6 py-4" style={{ boxShadow: "inset 0 4px 6px -4px rgba(0,0,0,0.05)" }}>
            <h4 className="text-[11px] font-bold uppercase tracking-wider mb-3 pl-1 text-gray-500">
              Danh sách sản phẩm hoàn thành (# {order.id})
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
