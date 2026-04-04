/**
 * Component SalesOrderManage
 * Quản lý Đơn hàng — Nhân viên bán hàng (UI/UX đồng bộ Owner + Request Cancel)
 */

import { useState, useMemo, useEffect, useRef } from "react";
import {
  Package,
  Clock,
  Printer,
  Eye,
  Trash2,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  X,
  Settings,
  Activity,
  Truck,
} from "lucide-react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import DataTable from "@/components/control/DataTable";
import { MOCK_ORDERS_DETAIL, PrintableInvoice } from "./detail";
import SalesInvoiceDetailsPopup from "./components/SalesInvoiceDetailsPopup";

// ===================== STATIC DATA =====================
export const INITIAL_ORDERS = [
  // ========== NHÓM 1: HÀNG SẴN ==========
  {
    id: "DH-S01", code: "DH-SAN-001", type: "Hàng sẵn", status: "Chờ xử lý",
    customerName: "Nguyễn Văn Hùng", phone: "0912345678", total: 12500000,
    date: "2026-03-12T08:30:00", deliveryDate: "2026-03-14", fulfillmentType: "Giao tận nơi",
  },
  {
    id: "DH-S02", code: "DH-SAN-002", type: "Hàng sẵn", status: "Chờ giao hàng",
    customerName: "Lê Thị Lan", phone: "0345678901", total: 3500000,
    date: "2026-03-11T14:20:00", deliveryDate: "2026-03-12", fulfillmentType: "Lấy tại cửa hàng",
  },
  {
    id: "DH-S03", code: "DH-SAN-003", type: "Hàng sẵn", status: "Đang giao hàng",
    customerName: "Trần Minh Quang", phone: "0909123456", total: 45000000,
    date: "2026-03-10T09:15:00", deliveryDate: "2026-03-11", fulfillmentType: "Giao tận nơi",
  },
  {
    id: "DH-S04", code: "DH-SAN-004", type: "Hàng sẵn", status: "Hoàn thành",
    customerName: "Phạm Thành Nam", phone: "0987654321", total: 8900000,
    date: "2026-03-09T16:45:00", deliveryDate: "2026-03-10", fulfillmentType: "Lấy tại cửa hàng",
    deliveryImage: "https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: "DH-S05", code: "DH-SAN-005", type: "Hàng sẵn", status: "Chờ duyệt hủy",
    customerName: "Đinh Công Vinh", phone: "0944556677", total: 2100000,
    date: "2026-03-11T10:00:00", deliveryDate: "2026-03-13", fulfillmentType: "Giao tận nơi",
  },
  {
    id: "DH-S06", code: "DH-SAN-006", type: "Hàng sẵn", status: "Đã hủy",
    customerName: "Võ Thị Bảy", phone: "0966778899", total: 1500000,
    date: "2026-03-08T10:00:00", deliveryDate: "2026-03-09", fulfillmentType: "Lấy tại cửa hàng",
  },

  // ========== NHÓM 2: Hàng mộc ==========
  {
    id: "DH-T01", code: "DH-THO-001", type: "Hàng mộc", status: "Chờ xử lý",
    customerName: "Hoàng Nguyệt Ánh", phone: "0978901234", total: 56000000,
    date: "2026-03-12T10:00:00", deliveryDate: "2026-03-20", fulfillmentType: "Giao tận nơi",
  },
  {
    id: "DH-T02", code: "DH-THO-002", type: "Hàng mộc", status: "Đang gia công",
    customerName: "Đặng Tuấn Kiệt", phone: "0931234567", total: 8200000,
    date: "2026-03-11T15:30:00", deliveryDate: "2026-03-15", fulfillmentType: "Giao tận nơi",
  },
  {
    id: "DH-T03", code: "DH-THO-003", type: "Hàng mộc", status: "Đang gia công",
    customerName: "Vũ Hải Đăng", phone: "0922334455", total: 12500000,
    date: "2026-03-10T08:00:00", deliveryDate: "2026-03-14", fulfillmentType: "Giao tận nơi",
  },
  {
    id: "DH-T04", code: "DH-THO-004", type: "Hàng mộc", status: "Chờ giao hàng",
    customerName: "Bùi Tiến Dũng", phone: "0911223344", total: 28000000,
    date: "2026-03-09T11:20:00", deliveryDate: "2026-03-12", fulfillmentType: "Giao tận nơi",
  },
  {
    id: "DH-T05", code: "DH-THO-005", type: "Hàng mộc", status: "Đang giao hàng",
    customerName: "Đinh Công Thành", phone: "0988776655", total: 15400000,
    date: "2026-03-08T14:45:00", deliveryDate: "2026-03-10", fulfillmentType: "Giao tận nơi",
  },
  {
    id: "DH-T06", code: "DH-THO-006", type: "Hàng mộc", status: "Hoàn thành",
    customerName: "Trần Anh Tú", phone: "0900112233", total: 32000000,
    date: "2026-03-07T09:00:00", deliveryDate: "2026-03-09", fulfillmentType: "Giao tận nơi",
    deliveryImage: "https://images.unsplash.com/photo-1617806118233-ef203e91122b",
  },
  {
    id: "DH-T07", code: "DH-THO-007", type: "Hàng mộc", status: "Hoàn thành",
    customerName: "Ngô Quốc Khánh", phone: "0966554433", total: 4200000,
    date: "2026-03-11T08:00:00", deliveryDate: "2026-03-12", fulfillmentType: "Lấy tại cửa hàng",
  },

  // ========== NHÓM 3: HÀNG KHÁCH ĐẶT ==========
  {
    id: "DH-D01", code: "DH-DAT-001", type: "Hàng khách đặt", status: "Chờ xử lý",
    customerName: "Nguyễn Thị Hồng", phone: "0912123123", total: 75000000,
    date: "2026-03-12T11:15:00", deliveryDate: "2026-03-30", fulfillmentType: "Giao tận nơi",
  },
  {
    id: "DH-D02", code: "DH-DAT-002", type: "Hàng khách đặt", status: "Đang gia công",
    customerName: "Lê Văn Tám", phone: "0321654987", total: 120000000,
    date: "2026-03-11T09:00:00", deliveryDate: "2026-03-25", fulfillmentType: "Giao tận nơi",
  },
  {
    id: "DH-D03", code: "DH-DAT-003", type: "Hàng khách đặt", status: "Đang gia công",
    customerName: "Phan Trị", phone: "0944123789", total: 45000000,
    date: "2026-03-10T10:15:00", deliveryDate: "2026-03-28", fulfillmentType: "Giao tận nơi",
  },
  {
    id: "DH-D04", code: "DH-DAT-004", type: "Hàng khách đặt", status: "Chờ giao hàng",
    customerName: "Sơn", phone: "0988", total: 95000000,
    date: "2026-03-09T14:20:00", deliveryDate: "2026-03-22", fulfillmentType: "Giao tận nơi",
  },
  {
    id: "DH-D05", code: "DH-DAT-005", type: "Hàng khách đặt", status: "Chờ sản xuất",
    customerName: "Mai Phương Thúy", phone: "0922889977", total: 110000000,
    date: "2026-03-12T14:00:00", deliveryDate: "2026-04-15", fulfillmentType: "Lấy tại cửa hàng",
  },
];

const ORDER_TYPES = ["Hàng sẵn", "Hàng mộc", "Hàng khách đặt"];

const CANCELLABLE_STATUSES = [
  "Chờ xử lý",
  "Đang chuẩn bị",
  "Chờ báo giá",
  "Đã báo giá",
  "Chờ xác nhận",
  "Đang gia công",
  "Chờ sản xuất",
  "Chờ giao hàng"
];

const STATUS_CONFIG = {
  "Chờ xử lý": { bg: "rgba(59, 130, 246, 0.08)", text: "#1d4ed8", border: "rgba(59, 130, 246, 0.2)", icon: Clock },
  "Đang xử lý": { bg: "rgba(249, 115, 22, 0.08)", text: "#c2410c", border: "rgba(249, 115, 22, 0.2)", icon: Activity },
  "Chờ sản xuất": { bg: "rgba(245, 158, 11, 0.08)", text: "#b45309", border: "rgba(245, 158, 11, 0.2)", icon: Settings },
  "Đã nhập kho": { bg: "rgba(34, 197, 94, 0.08)", text: "#15803d", border: "rgba(34, 197, 94, 0.2)", icon: Package },
  "Đang gia công": { bg: "rgba(245, 158, 11, 0.08)", text: "#b45309", border: "rgba(245, 158, 11, 0.2)", icon: Activity },
  "Chờ giao hàng": { bg: "rgba(139, 92, 246, 0.08)", text: "#7c3aed", border: "rgba(139, 92, 246, 0.2)", icon: Clock },
  "Đang giao hàng": { bg: "rgba(59, 130, 246, 0.08)", text: "#1d4ed8", border: "rgba(59, 130, 246, 0.2)", icon: Truck },
  "Hoàn thành": { bg: "rgba(34, 197, 94, 0.08)", text: "#15803d", border: "rgba(34, 197, 94, 0.2)", icon: CheckCircle2 },
  "Chờ duyệt hủy": { bg: "rgba(245, 158, 11, 0.08)", text: "#b45309", border: "rgba(245, 158, 11, 0.2)", icon: AlertCircle },
  "Đơn đã hủy": { bg: "rgba(239, 68, 68, 0.08)", text: "#b91c1c", border: "rgba(239, 68, 68, 0.2)", icon: Trash2 },
};

const getStatusColor = (status) => STATUS_CONFIG[status] || { bg: "#F3F4F6", text: "#374151", border: "#D1D5DB", icon: Clock };

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
};

export default function SalesOrderManage() {
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [activeTab, setActiveTab] = useState("Hàng sẵn");
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Cancellation State
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelSuccess, setCancelSuccess] = useState(false);

  // Print Handling
  const printRef = useRef(null);
  const [printingOrders, setPrintingOrders] = useState([]);

  useEffect(() => {
    if (printingOrders.length > 0 && printRef.current) {
      const content = printRef.current;
      const printWindow = window.open("", "_blank", "width=900,height=700");
      if (printWindow) {
        printWindow.document.write(`
          <html><head><title>In hóa đơn</title>
          <style>@page { size: A4; margin: 15mm; } body { margin: 0; padding: 0; } .page-break { page-break-after: always; } .page-break:last-child { page-break-after: auto; }</style>
          </head><body>${content.innerHTML}</body></html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          setPrintingOrders([]);
          setSelectedIds([]);
        }, 500);
      } else {
        setPrintingOrders([]);
      }
    }
  }, [printingOrders]);

  const prepOrderForPrint = (o) => {
    const fullOrder = MOCK_ORDERS_DETAIL[o.id] || {
      ...o,
      customer: { name: o.customerName, phone: o.phone, address: "Đang cập nhật..." },
      products: []
    };
    fullOrder.displayTotal = o.total;
    return fullOrder;
  };

  const handleBatchPrint = () => {
    const toPrint = orders.filter(o => selectedIds.includes(o.id)).map(prepOrderForPrint);
    setPrintingOrders(toPrint);
  };

  const handleCancelSubmit = () => {
    if (!cancelTarget || !cancelReason.trim()) return;
    setOrders(prev => prev.map(o => o.id === cancelTarget.id ? { ...o, status: "Chờ duyệt hủy" } : o));
    setCancelSuccess(true);
    setTimeout(() => {
      setCancelTarget(null);
      setCancelReason("");
      setCancelSuccess(false);
    }, 1500);
  };

  // Filter Logic
  const filtered = useMemo(() => {
    let res = orders.filter(o => o.type === activeTab);
    if (statusFilter !== "Tất cả") res = res.filter(o => o.status === statusFilter);
    if (dateFrom) {
       const from = new Date(dateFrom); from.setHours(0,0,0,0);
       res = res.filter(o => new Date(o.date) >= from);
    }
    if (dateTo) {
       const to = new Date(dateTo); to.setHours(23,59,59,999);
       res = res.filter(o => new Date(o.date) <= to);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      res = res.filter(o => 
        o.customerName.toLowerCase().includes(q) || 
        o.phone.includes(q) || 
        o.code.toLowerCase().includes(q)
      );
    }
    return res.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [orders, activeTab, statusFilter, dateFrom, dateTo, searchTerm]);

  const paginatedOrders = useMemo(() => {
    return filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const { possibleStatuses, statusCounts } = useMemo(() => {
    const tabOrders = orders.filter(o => o.type === activeTab);
    const statuses = activeTab === "Hàng sẵn" ? ["Chờ xử lý", "Chờ giao hàng", "Đang giao hàng", "Hoàn thành", "Chờ duyệt hủy", "Đơn đã hủy"] :
                     activeTab === "Hàng mộc" ? ["Chờ xử lý", "Đang gia công", "Chờ giao hàng", "Đang giao hàng", "Hoàn thành", "Chờ duyệt hủy", "Đơn đã hủy"] :
                     ["Chờ sản xuất", "Đã nhập kho", "Đang gia công", "Chờ giao hàng", "Đang giao hàng", "Hoàn thành", "Chờ duyệt hủy", "Đơn đã hủy"];
    
    const counts = { "Tất cả": tabOrders.length };
    statuses.forEach(s => counts[s] = tabOrders.filter(o => o.status === s).length);
    return { possibleStatuses: ["Tất cả", ...statuses], statusCounts: counts };
  }, [orders, activeTab]);

  const columns = [
    {
      header: "STT",
      headerClassName: "text-center w-[60px]",
      render: (_, idx) => (currentPage - 1) * itemsPerPage + idx + 1,
      className: "text-center text-[13px] font-medium text-gray-400 font-bold",
    },
    {
      header: "Mã đơn hàng",
      render: (o) => <p className="text-[13px] font-bold font-mono text-gray-900">{o.code}</p>,
    },
    {
      header: "Khách hàng",
      render: (o) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[12px] bg-indigo-50 text-indigo-500 border border-indigo-100 transition group-hover:bg-white group-hover:text-indigo-600">
            {o.customerName.charAt(0)}
          </div>
          <div>
            <p className="text-[13px] font-black text-slate-800">{o.customerName}</p>
            <p className="text-[11px] text-slate-400 font-bold">{o.phone}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Tổng thanh toán",
      headerClassName: "text-right pr-10",
      render: (o) => <p className="text-[14px] font-black text-slate-900">{formatCurrency(o.total)}</p>,
      className: "text-right pr-10",
    },
    {
      header: "Ngày giao dự kiến",
      headerClassName: "text-center",
      render: (o) => (
        <div className="flex items-center justify-center gap-1.5 text-slate-600 font-bold text-[13px]">
          <Clock size={12} className="text-slate-300" />
          {o.deliveryDate ? new Date(o.deliveryDate).toLocaleDateString("vi-VN") : "---"}
        </div>
      ),
      className: "text-center",
    },
    {
      header: "Trạng thái",
      headerClassName: "text-right pr-12",
      render: (o) => {
        const sc = getStatusColor(o.status);
        return (
          <div className="flex flex-col items-end gap-1.5">
            <span className="inline-flex items-center justify-center w-[140px] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-md border gap-1.5 shrink-0" style={{ backgroundColor: sc.bg, color: sc.text, borderColor: sc.border }}>
              {sc.icon && <sc.icon size={12} />}
              {o.status}
            </span>
          </div>
        );
      },
      className: "text-right pr-12",
    }
  ];

  const hasActiveFilters = statusFilter !== "Tất cả" || dateFrom || dateTo || searchTerm;

  return (
    <>
      <PageHelmet title="Quản lý đơn hàng | TPF-SIMS" />
      <div className="flex flex-col h-[calc(100vh-64px)] -m-6 p-6 space-y-4 bg-gray-50/50">
        
        {/* Header Section */}
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2 text-slate-900">
              <Package size={22} className="text-indigo-600" />
              Quản lý đơn hàng
            </h1>
            <p className="text-[13px] mt-0.5 text-slate-400 font-bold uppercase tracking-tight">
              {filtered.length} đơn hàng ({activeTab.toLowerCase()})
            </p>
          </div>
          <div className="flex p-1 rounded-xl bg-slate-100/80 border border-slate-200">
            {ORDER_TYPES.map((tab) => (
              <button key={tab} onClick={() => { setActiveTab(tab); setStatusFilter("Tất cả"); }} 
                      className={`px-5 py-1.5 rounded-lg text-[13px] font-black transition-all cursor-pointer ${activeTab === tab ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Status Quick Filters */}
        <div className="flex items-center gap-2 shrink-0 px-1 overflow-x-auto custom-scrollbar pb-1">
          {possibleStatuses.map((s) => {
            const isActive = statusFilter === s;
            const sc = s !== "Tất cả" ? getStatusColor(s) : null;
            return (
              <button key={s} onClick={() => setStatusFilter(s)} 
                      className={`px-4 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer flex items-center gap-2 border whitespace-nowrap ${
                        isActive ? "shadow-md" : "bg-transparent border-transparent text-slate-500 hover:bg-slate-100"
                      }`}
                      style={isActive ? { backgroundColor: sc ? sc.bg : "#fff", color: sc ? sc.text : "var(--brand-primary)", borderColor: sc ? sc.border : "#e2e8f0" } : {}}>
                {s !== "Tất cả" && sc?.icon && <sc.icon size={14} />}
                {s} <span className="text-[10px] font-black opacity-60 bg-black/5 px-1.5 rounded-md ml-0.5">{statusCounts[s] || 0}</span>
              </button>
            );
          })}
        </div>

        <DataTable
          columns={columns}
          data={paginatedOrders}
          onRowClick={(o) => setSelectedOrder(o)}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          searchPlaceholder="Tìm đơn theo mã, tên khách hoặc SĐT..."
          dateFrom={dateFrom}
          setDateFrom={setDateFrom}
          dateTo={dateTo}
          setDateTo={setDateTo}
          hasActiveFilters={hasActiveFilters}
          clearAllFilters={() => { setStatusFilter("Tất cả"); setDateFrom(""); setDateTo(""); setSearchTerm(""); }}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          rowActions={[
            {
              icon: Eye,
              label: "Xem chi tiết",
              onClick: (o) => setSelectedOrder(o),
              className: "bg-white border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-100"
            },
            {
              icon: Printer,
              label: "In hóa đơn",
              onClick: (o) => setPrintingOrders([prepOrderForPrint(o)]),
              className: "bg-white border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-100"
            },
            {
              icon: Trash2,
              label: "Yêu cầu hủy",
              onClick: (o) => { setCancelTarget(o); setCancelReason(""); setCancelSuccess(false); },
              className: "bg-white border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-100",
              requireConfirm: true,
              confirmTitle: "Gửi yêu cầu hủy đơn?",
              confirmMessage: (o) => `Xác nhận gửi yêu cầu hủy đơn hàng ${o.code}? Hệ thống sẽ thông báo tới Chủ cửa hàng duyệt.`,
              hidden: (o) => {
                const isPickupCompleted = o.fulfillmentType === "Lấy tại cửa hàng" && o.status === "Hoàn thành";
                return !(CANCELLABLE_STATUSES.includes(o.status) || isPickupCompleted);
              }
            },
          ]}
          bulkActions={[
            {
              label: "IN HÓA ĐƠN HÀNG LOẠT",
              icon: Printer,
              onClick: handleBatchPrint,
              colorClass: "bg-indigo-600 focus:ring-indigo-500"
            }
          ]}
          pagination={{
            total: filtered.length,
            currentPage: currentPage,
            setCurrentPage: setCurrentPage,
            itemsPerPage: itemsPerPage,
            setItemsPerPage: setItemsPerPage,
          }}
        />
      </div>

      {/* Details Popup */}
      <SalesInvoiceDetailsPopup
        orderData={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onCancelRequest={(o) => { setSelectedOrder(null); setCancelTarget(o); setCancelReason(""); setCancelSuccess(false); }}
      />

      {/* Cancellation Modal */}
      {cancelTarget && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-[4px]">
           <div className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-white">
              {cancelSuccess ? (
                <div className="p-10 flex flex-col items-center text-center gap-4">
                  <div className="w-20 h-20 rounded-3xl bg-emerald-50 flex items-center justify-center text-emerald-500 shadow-inner">
                    <CheckCircle2 size={40} />
                  </div>
                  <div>
                    <h3 className="text-[20px] font-black text-slate-900">Đã gửi yêu cầu hủy</h3>
                    <p className="text-[14px] text-slate-400 mt-2 font-medium">
                        Đơn hàng <span className="text-slate-900 font-bold">{cancelTarget.code}</span> đã được chuyển trạng thái <span className="text-amber-600 font-bold">Chờ duyệt hủy</span>.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-rose-50 text-rose-600"><Trash2 size={22} /></div>
                        <div>
                            <h3 className="text-[16px] font-black text-slate-900">Yêu cầu hủy đơn hàng</h3>
                            <p className="text-[11px] font-bold text-slate-400 tracking-wider">MÃ ĐƠN: {cancelTarget.code}</p>
                        </div>
                     </div>
                     <button onClick={() => setCancelTarget(null)} className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-slate-50 text-slate-400 transition-colors cursor-pointer"><X size={20} /></button>
                  </div>
                  <div className="p-8 space-y-6">
                     <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100/50 flex gap-4">
                        <AlertTriangle className="shrink-0 text-amber-500" size={20} />
                        <p className="text-[12px] text-amber-800 font-bold leading-relaxed">
                            Nhân viên bán hàng chỉ có thể gửi yêu cầu hủy. Đơn hàng sẽ cần <span className="border-b-2 border-amber-300">Chủ cửa hàng xét duyệt</span> để hoàn tất quy trình hủy.
                        </p>
                     </div>
                     <div>
                        <label className="block text-[13px] font-black text-slate-700 mb-3 ml-1 uppercase tracking-widest">Lý do khách hủy đơn <span className="text-rose-500">*</span></label>
                        <textarea 
                          value={cancelReason} 
                          onChange={(e) => setCancelReason(e.target.value)}
                          placeholder="Mô tả chi tiết lý do..."
                          rows={4}
                          className="w-full rounded-2xl px-5 py-4 text-[14px] border border-slate-100 bg-slate-50 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-100 transition-all resize-none shadow-inner"
                        />
                     </div>
                  </div>
                  <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                     <button onClick={() => setCancelTarget(null)} className="px-6 py-2.5 rounded-2xl text-[13px] font-black text-slate-400 hover:text-slate-600 transition uppercase tracking-widest">Đóng</button>
                     <button 
                        onClick={handleCancelSubmit}
                        disabled={!cancelReason.trim()}
                        className="px-8 py-2.5 rounded-2xl text-[13px] font-black text-white bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-100 transition active:scale-95 disabled:opacity-30 disabled:shadow-none uppercase tracking-widest"
                     >
                        XÁC NHẬN GỬI
                     </button>
                  </div>
                </>
              )}
           </div>
        </div>
      )}

      {/* Printable Invoice Container */}
      <div ref={printRef} style={{ position: "absolute", left: "-9999px", top: 0, width: "800px" }}>
        {printingOrders.map((o, idx) => (
          <div key={idx} className="page-break">
            <PrintableInvoice o={o} displayTotal={o.displayTotal} />
          </div>
        ))}
      </div>
    </>
  );
}
