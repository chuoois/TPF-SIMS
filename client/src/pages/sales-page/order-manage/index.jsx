/**
 * Component SalesOrderManage
 * Quản lý Đơn hàng — Nhân viên bán hàng (Chỉ xem + Gửi yêu cầu hủy)
 *
 * Created Date: 05/03/2026
 * Updated Date: 07/03/2026
 */

import { useState, useMemo, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Users,
  Eye,
  Package,
  Calendar,
  XCircle,
  X,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Printer,
  Clock,
} from "lucide-react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import { MOCK_ORDERS_DETAIL, PrintableInvoice } from "./detail";

// ===================== STATIC DATA =====================
export const INITIAL_ORDERS = [
  // ========== NHÓM 1: HÀNG SẴN ==========
  {
    id: "DH-S01", code: "DH-SAN-001", type: "Hàng sẵn", status: "Chờ xử lý",
    customerName: "Nguyễn Văn Hùng", phone: "0912345678", total: 12500000,
    date: "2026-03-12T08:30:00", deliveryDate: "2026-03-14", fulfillmentType: "Giao tận nhà",
  },
  {
    id: "DH-S02", code: "DH-SAN-002", type: "Hàng sẵn", status: "Chờ giao hàng",
    customerName: "Lê Thị Lan", phone: "0345678901", total: 3500000,
    date: "2026-03-11T14:20:00", deliveryDate: "2026-03-12", fulfillmentType: "Lấy ngay",
  },
  {
    id: "DH-S03", code: "DH-SAN-003", type: "Hàng sẵn", status: "Đang giao hàng",
    customerName: "Trần Minh Quang", phone: "0909123456", total: 45000000,
    date: "2026-03-10T09:15:00", deliveryDate: "2026-03-11", fulfillmentType: "Giao nhà",
  },
  {
    id: "DH-S04", code: "DH-SAN-004", type: "Hàng sẵn", status: "Hoàn thành",
    customerName: "Phạm Thành Nam", phone: "0987654321", total: 8900000,
    date: "2026-03-09T16:45:00", deliveryDate: "2026-03-10", fulfillmentType: "Giao nhà",
    deliveryImage: "https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: "DH-S05", code: "DH-SAN-005", type: "Hàng sẵn", status: "Chờ duyệt hủy",
    customerName: "Đinh Công Vinh", phone: "0944556677", total: 2100000,
    date: "2026-03-11T10:00:00", deliveryDate: "2026-03-13", fulfillmentType: "Giao nhà",
  },
  {
    id: "DH-S06", code: "DH-SAN-006", type: "Hàng sẵn", status: "Đã hủy",
    customerName: "Võ Thị Bảy", phone: "0966778899", total: 1500000,
    date: "2026-03-08T10:00:00", deliveryDate: "2026-03-09", fulfillmentType: "Lấy ngay",
  },

  // ========== NHÓM 2: Hàng mộc ==========
  {
    id: "DH-T01", code: "DH-THO-001", type: "Hàng mộc", status: "Chờ xử lý",
    customerName: "Hoàng Nguyệt Ánh", phone: "0978901234", total: 56000000,
    date: "2026-03-12T10:00:00", deliveryDate: "2026-03-20", fulfillmentType: "Giao nhà",
  },
  {
    id: "DH-T02", code: "DH-THO-002", type: "Hàng mộc", status: "Đang sản xuất",
    customerName: "Đặng Tuấn Kiệt", phone: "0931234567", total: 8200000,
    date: "2026-03-11T15:30:00", deliveryDate: "2026-03-15", fulfillmentType: "Giao nhà",
  },
  {
    id: "DH-T03", code: "DH-THO-003", type: "Hàng mộc", status: "Đang sản xuất",
    customerName: "Vũ Hải Đăng", phone: "0922334455", total: 12500000,
    date: "2026-03-10T08:00:00", deliveryDate: "2026-03-14", fulfillmentType: "Giao nhà",
  },
  {
    id: "DH-T04", code: "DH-THO-004", type: "Hàng mộc", status: "Chờ giao hàng",
    customerName: "Bùi Tiến Dũng", phone: "0911223344", total: 28000000,
    date: "2026-03-09T11:20:00", deliveryDate: "2026-03-12", fulfillmentType: "Giao nhà",
  },
  {
    id: "DH-T05", code: "DH-THO-005", type: "Hàng mộc", status: "Đang giao hàng",
    customerName: "Đinh Công Thành", phone: "0988776655", total: 15400000,
    date: "2026-03-08T14:45:00", deliveryDate: "2026-03-10", fulfillmentType: "Giao nhà",
  },
  {
    id: "DH-T06", code: "DH-THO-006", type: "Hàng mộc", status: "Hoàn thành",
    customerName: "Trần Anh Tú", phone: "0900112233", total: 32000000,
    date: "2026-03-07T09:00:00", deliveryDate: "2026-03-09", fulfillmentType: "Giao nhà",
    deliveryImage: "https://images.unsplash.com/photo-1617806118233-ef203e91122b",
  },

  // ========== NHÓM 3: Hàng khách đặt ==========
  {
    id: "DH-D01", code: "DH-DAT-001", type: "Hàng khách đặt", status: "Chờ xử lý",
    customerName: "Nguyễn Thị Hồng", phone: "0912123123", total: 75000000,
    date: "2026-03-12T11:15:00", deliveryDate: "2026-03-30", fulfillmentType: "Giao nhà",
  },
  {
    id: "DH-D02", code: "DH-DAT-002", type: "Hàng khách đặt", status: "Đang sản xuất",
    customerName: "Lê Văn Tám", phone: "0321654987", total: 120000000,
    date: "2026-03-11T09:00:00", deliveryDate: "2026-03-25", fulfillmentType: "Giao nhà",
  },
  {
    id: "DH-D03", code: "DH-DAT-003", type: "Hàng khách đặt", status: "Đang sản xuất",
    customerName: "Phan Trị", phone: "0944123789", total: 45000000,
    date: "2026-03-10T10:15:00", deliveryDate: "2026-03-28", fulfillmentType: "Giao nhà",
  },
  {
    id: "DH-D04", code: "DH-DAT-004", type: "Hàng khách đặt", status: "Chờ giao hàng",
    customerName: "Sơn", phone: "0988", total: 95000000,
    date: "2026-03-09T14:20:00", deliveryDate: "2026-03-22", fulfillmentType: "Giao nhà",
  },
];


const ORDER_TYPES = ["Hàng sẵn", "Hàng mộc", "Hàng khách đặt"];

const HANG_SAN_STATUSES = [
  "Chờ xử lý",
  "Chờ giao hàng",
  "Đang giao hàng",
  "Hoàn thành",
  "Chờ duyệt hủy",
  "Đơn đã hủy",
];

const HANG_THO_STATUSES = [
  "Chờ xử lý",
  "Đang sản xuất",
  "Chờ giao hàng",
  "Đang giao hàng",
  "Hoàn thành",
  "Chờ duyệt hủy",
  "Đơn đã hủy",
];

const HANG_DAT_STATUSES = [
  "Chờ xử lý",
  "Đang sản xuất",
  "Chờ giao hàng",
  "Đang giao hàng",
  "Hoàn thành",
  "Chờ duyệt hủy",
  "Đã hủy",
];

const ALL_STATUSES = [
  ...new Set([
    ...HANG_SAN_STATUSES,
    ...HANG_THO_STATUSES,
    ...HANG_DAT_STATUSES,
  ]),
];

// Trạng thái cho phép gửi yêu cầu hủy (sale chỉ được gửi khi đơn chưa hoàn thành / chưa hủy / chưa gửi hủy rồi)
const CANCELLABLE_STATUSES = [
  "Chờ xử lý",
  "Đang chuẩn bị",
  "Chờ báo giá",
  "Đã báo giá",
  "Chờ xác nhận",
  "Đang sản xuất", // Có thể cho phép gửi YC hủy khi đang sx nếu chính sách cho phép
];

// ===================== HELPERS =====================
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const formatDateTime = (dateString) => {
  const d = new Date(dateString);
  return `${d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} - ${d.toLocaleDateString("vi-VN")}`;
};

const getStatusColor = (status) => {
  switch (status) {
    case "Chờ xử lý":
      return { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" }; // Blue
    case "Đang xử lý":
      return { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" }; // Orange
    case "Đang sản xuất":
      return { bg: "#FEF3C7", text: "#D97706", border: "#FDE68A" }; // Amber
    case "Chờ giao hàng":
      return { bg: "#F5F3FF", text: "#7C3AED", border: "#DDD6FE" }; // Purple
    case "Đang giao hàng":
      return { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" }; // Deep Blue
    case "Hoàn thành":
      return { bg: "#F0FDF4", text: "#166534", border: "#BBF7D0" }; // Green
    case "Chờ duyệt hủy":
      return { bg: "#FEF3C7", text: "#D97706", border: "#FDE68A" }; // Amber/Yellow
    case "Đơn đã hủy":
      return { bg: "#FEF2F2", text: "#B91C1C", border: "#FECACA" }; // Red

    default:
      return { bg: "var(--bg-main)", text: "var(--text-secondary)", border: "var(--grid-border)" };
  }
};

// ===================== COMPONENT =====================
export default function SalesOrderManage() {
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("Hàng sẵn");
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [selectedOrders, setSelectedOrders] = useState([]);

  // Print
  const printRef = useRef(null);
  const [printingOrders, setPrintingOrders] = useState([]); // Array instead of single order

  useEffect(() => {
    if (printingOrders.length > 0 && printRef.current) {
      const content = printRef.current;
      const printWindow = window.open("", "_blank", "width=900,height=700");
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>In hóa đơn</title>
            <style>
              @page { size: A4; margin: 15mm; }
              body { margin: 0; padding: 0; }
              .page-break { page-break-after: always; }
              .page-break:last-child { page-break-after: auto; }
            </style>
          </head>
          <body>${content.innerHTML}</body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          setPrintingOrders([]);
          setSelectedOrders([]); // Clear selection after print
        }, 500); // Increased timeout slightly for multiple images/pages
      } else {
        setPrintingOrders([]);
      }
    }
  }, [printingOrders]);

  const prepOrderForPrint = (o) => {
    const fullOrder = MOCK_ORDERS_DETAIL[o.id] || {
      ...MOCK_ORDERS_DETAIL["DH-S01"],
      code: o.code,
      customer: {
        name: o.customerName,
        phone: o.phone,
        address: "Đang cập nhật...",
      },
      total: o.total,
      deposit: 0,
      status: o.status,
      type: o.type,
      date: o.date,
      products: [],
    };
    fullOrder.displayTotal =
      fullOrder.total != null
        ? fullOrder.total
        : fullOrder.products?.reduce(
            (acc, p) => acc + (p.price || 0) * p.qty,
            0,
          ) || 0;
    return fullOrder;
  };

  const handlePrintClick = (e, o) => {
    e.stopPropagation();
    setPrintingOrders([prepOrderForPrint(o)]);
  };

  const handleBatchPrint = () => {
    if (selectedOrders.length === 0) return;
    const ordersToPrint = orders
      .filter((o) => selectedOrders.includes(o.id))
      .map(prepOrderForPrint);
    setPrintingOrders(ordersToPrint);
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === paginatedOrders.length && paginatedOrders.length > 0) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(paginatedOrders.map((o) => o.id));
    }
  };

  const handleSelectOrder = (e, id) => {
    e.stopPropagation();
    if (e.target.checked) {
      setSelectedOrders((prev) => [...prev, id]);
    } else {
      setSelectedOrders((prev) => prev.filter((orderId) => orderId !== id));
    }
  };

  // Cancel request modal
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelSuccess, setCancelSuccess] = useState(false);

  // Filter & Search
  const filtered = useMemo(() => {
    let result = orders;

    // Filter by type
    result = result.filter((o) => o.type === activeTab);

    // Filter by status
    if (statusFilter !== "Tất cả") {
      result = result.filter((o) => o.status === statusFilter);
    }

    // Filter by date range
    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      result = result.filter((o) => new Date(o.date) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      result = result.filter((o) => new Date(o.date) <= to);
    }

    // Search
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (o) =>
          o.customerName.toLowerCase().includes(q) ||
          o.phone.includes(q) ||
          o.code.toLowerCase().includes(q),
      );
    }

    return result.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [orders, activeTab, searchTerm, statusFilter, dateFrom, dateTo]);

  const hasActiveFilters =
    statusFilter !== "Tất cả" || dateFrom || dateTo || searchTerm;

  const clearAllFilters = () => {
    setStatusFilter("Tất cả");
    setDateFrom("");
    setDateTo("");
    setSearchTerm("");
  };

  // Reset status filter when switching tabs
  useEffect(() => {
    setStatusFilter("Tất cả");
    setDateFrom("");
    setDateTo("");
    setSearchTerm("");
  }, [activeTab]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
    setSelectedOrders([]);
  }, [searchTerm, activeTab, statusFilter, dateFrom, dateTo]);

  useEffect(() => {
    setSelectedOrders([]);
  }, [currentPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedOrders = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Handle cancel request submit
  const handleCancelSubmit = () => {
    if (!cancelTarget || !cancelReason.trim()) return;
    setOrders((prev) =>
      prev.map((o) =>
        o.id === cancelTarget.id ? { ...o, status: "Chờ duyệt hủy" } : o,
      ),
    );
    setCancelSuccess(true);
    setTimeout(() => {
      setCancelTarget(null);
      setCancelReason("");
      setCancelSuccess(false);
    }, 1500);
  };

  // ===================== RENDER =====================
  return (
    <>
      <PageHelmet title="Quản lý đơn hàng - Nhân viên | TPF-SIMS" />

      <div
        className="flex flex-col h-[calc(100vh-64px)] -m-6 p-6 space-y-4"
        style={{ backgroundColor: "var(--bg-main)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1
              className="text-xl font-bold flex items-center gap-2"
              style={{ color: "var(--text-main)" }}
            >
              <Package size={22} style={{ color: "var(--brand-primary)" }} />
              Quản lý đơn hàng
            </h1>
            <p
              className="text-[13px] mt-0.5"
              style={{ color: "var(--text-placeholder)" }}
            >
              {filtered.length} đơn hàng ({activeTab.toLowerCase()})
            </p>
          </div>

          {/* Tabs */}
          <div
            className="flex p-1 rounded-xl"
            style={{
              backgroundColor: "var(--grid-header-bg)",
              border: "1px solid var(--grid-border)",
            }}
          >
            {ORDER_TYPES.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-all cursor-pointer"
                style={{
                  backgroundColor: activeTab === tab ? "#fff" : "transparent",
                  color:
                    activeTab === tab
                      ? "var(--text-main)"
                      : "var(--text-secondary)",
                  boxShadow:
                    activeTab === tab ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        {/* Status Toolbar */}
        <div className="flex items-center gap-2 shrink-0 px-1 flex-wrap">
          {useMemo(() => {
            let statuses = [];
            if (activeTab === "Hàng sẵn") statuses = HANG_SAN_STATUSES;
            else if (activeTab === "Hàng mộc") statuses = HANG_THO_STATUSES;
            else if (activeTab === "Hàng khách đặt") statuses = HANG_DAT_STATUSES;
            else statuses = ALL_STATUSES;
            return ["Tất cả", ...statuses];
          }, [activeTab]).map((s) => {
            const isActive = statusFilter === s;
            const sc = s !== "Tất cả" ? getStatusColor(s) : null;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className="px-4 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer flex items-center gap-2 border"
                style={{
                  backgroundColor: isActive
                    ? (sc ? sc.bg : "#fff")
                    : "transparent",
                  color: isActive
                    ? (sc ? sc.text : "var(--brand-primary)")
                    : "var(--text-secondary)",
                  borderColor: isActive
                    ? (sc ? sc.border : "var(--grid-border)")
                    : "transparent",
                  boxShadow: isActive ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
                }}
              >
                {s !== "Tất cả" && (
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor: sc ? sc.text : "var(--brand-primary)",
                    }}
                  />
                )}
                {s}
              </button>
            );
          })}
        </div>
        {/* Batch Print Action Bar - ALWAYS VISIBLE ALONGSIDE FILTERS */}
        <div className="flex items-center justify-between bg-[#F0FDF4] border border-[#BBF7D0] px-4 py-2.5 rounded-xl mb-4 mt-2 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#166534] text-white text-[11px] font-bold">
              {selectedOrders.length}
            </span>
            <span
              className="text-[13px] font-bold"
              style={{ color: "#14532D" }}
            >
              đơn hàng được chọn
            </span>
          </div>
          <div className="flex items-center gap-2">
            {selectedOrders.length > 0 && (
              <button
                onClick={() => setSelectedOrders([])}
                className="px-3 py-1.5 rounded-lg text-[12px] font-bold cursor-pointer transition hover:bg-[#DCFCE7]"
                style={{ color: "#166534" }}
              >
                Hủy chọn
              </button>
            )}
            <button
              onClick={handleBatchPrint}
              disabled={selectedOrders.length === 0}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[12px] font-bold transition shadow-sm ${
                selectedOrders.length > 0
                  ? "text-white hover:opacity-90 cursor-pointer"
                  : "text-gray-400 bg-gray-100 cursor-not-allowed border outline-none"
              }`}
              style={
                selectedOrders.length > 0
                  ? { backgroundColor: "var(--brand-primary)" }
                  : {}
              }
            >
              <Printer size={14} />
              In hóa đơn
            </button>
          </div>
        </div>{" "}
        {/* Search + Table Card */}
        <div
          className="flex flex-col bg-white rounded-2xl flex-1 overflow-hidden"
          style={{
            boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
          }}
        >
          {/* Search */}
          <div
            className="px-4 py-3 border-b shrink-0 flex flex-wrap items-center justify-between gap-3"
            style={{ borderColor: "var(--grid-border)" }}
          >
            {/* LEFT — Search */}
            <div className="relative w-full max-w-md shrink-0">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-placeholder)" }}
              />
              <input
                type="text"
                placeholder="Tìm mã đơn, tên khách hàng, SĐT..."
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

            {/* RIGHT — Filters */}
            <div className="flex items-center gap-2.5 shrink-0 overflow-x-auto">
              {/* Date From */}
              <div className="flex items-center gap-1.5 shrink-0">
                <Calendar
                  size={14}
                  style={{ color: "var(--text-placeholder)" }}
                />
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-9 px-3 rounded-lg text-[13px] focus:outline-none focus:ring-2 transition"
                  style={{
                    border: `1px solid ${dateFrom ? "var(--brand-primary)" : "var(--grid-border)"}`,
                    backgroundColor: dateFrom
                      ? "var(--status-focus)"
                      : "var(--bg-main)",
                    color: dateFrom
                      ? "var(--brand-primary)"
                      : "var(--text-main)",
                    fontWeight: dateFrom ? 600 : 400,
                  }}
                  title="Từ ngày"
                />
              </div>

              <span
                className="text-[12px] shrink-0"
                style={{ color: "var(--text-placeholder)" }}
              >
                đến
              </span>

              {/* Date To */}
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-9 px-3 rounded-lg text-[13px] focus:outline-none focus:ring-2 transition shrink-0"
                style={{
                  border: `1px solid ${dateTo ? "var(--brand-primary)" : "var(--grid-border)"}`,
                  backgroundColor: dateTo
                    ? "var(--status-focus)"
                    : "var(--bg-main)",
                  color: dateTo ? "var(--brand-primary)" : "var(--text-main)",
                  fontWeight: dateTo ? 600 : 400,
                }}
                title="Đến ngày"
              />

              {/* Clear filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="h-9 px-3 rounded-lg text-[13px] font-medium flex-shrink-0 flex items-center gap-1.5 cursor-pointer transition hover:opacity-80"
                  style={{
                    color: "var(--status-error)",
                    backgroundColor: "#FEF2F2",
                    border: "1px solid #FECACA",
                  }}
                >
                  <X size={14} />
                  Xóa bộ lọc
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
                  <th className="px-4 py-3 w-10">
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectAll();
                      }}
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer ${
                        paginatedOrders.length > 0 && selectedOrders.length === paginatedOrders.length
                          ? "bg-green-500 border-green-500 text-white"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {paginatedOrders.length > 0 && selectedOrders.length === paginatedOrders.length && (
                        <CheckCircle2 size={12} strokeWidth={3} />
                      )}
                    </div>
                  </th>
                  {[
                    "STT",
                    "Mã đơn",
                    "Khách hàng",
                    "Loại đơn",
                    "Tổng tiền",
                    "Trạng thái",
                    "Hình thức giao",
                    "Ngày giao dự kiến",
                    "Ảnh giao hàng"
                  ].map((h, i) => (
                    <th
                      key={i}
                      className={`px-4 py-3 text-[11px] font-bold uppercase tracking-wider ${i === 4 ? "text-right pr-6" : ""} ${i === 0 ? "text-center w-[50px]" : ""} ${i >= 7 && i < 9 ? "text-center whitespace-nowrap" : ""}`}
                      style={{ color: "var(--text-placeholder)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map((o) => {
                  const statusConfig = getStatusColor(o.status);
                  const canCancel = CANCELLABLE_STATUSES.includes(o.status);
                  return (
                    <tr
                      key={o.id}
                      className={`group relative transition-colors cursor-pointer ${
                        selectedOrders.includes(o.id)
                          ? "bg-[#F0FDF4]"
                          : "hover:bg-gray-50/50"
                      }`}
                      style={{ borderBottom: "1px solid var(--grid-border)" }}
                      onClick={() => {
                        if (selectedOrders.includes(o.id)) {
                          setSelectedOrders((prev) =>
                            prev.filter((id) => id !== o.id),
                          );
                        } else {
                          setSelectedOrders((prev) => [...prev, o.id]);
                        }
                      }}
                    >
                      <td
                        className="px-4 py-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            if (selectedOrders.includes(o.id)) {
                              setSelectedOrders(prev => prev.filter(id => id !== o.id));
                            } else {
                              setSelectedOrders(prev => [...prev, o.id]);
                            }
                          }}
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer ${
                            selectedOrders.includes(o.id)
                              ? "bg-green-500 border-green-500 text-white"
                              : "border-gray-300 bg-white"
                          }`}
                        >
                          {selectedOrders.includes(o.id) && (
                            <CheckCircle2 size={12} strokeWidth={3} />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-[13px] font-medium" style={{ color: "var(--text-secondary)" }}>
                        {(currentPage - 1) * itemsPerPage + paginatedOrders.indexOf(o) + 1}
                      </td>
                      <td className="px-4 py-3">
                        <p
                          className="text-[13px] font-bold font-mono"
                          style={{ color: "var(--text-main)" }}
                        >
                          {o.code}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p
                          className="text-[13px] font-semibold"
                          style={{ color: "var(--text-main)" }}
                        >
                          {o.customerName}
                        </p>
                        <p
                          className="text-[11px]"
                          style={{ color: "var(--text-placeholder)" }}
                        >
                          {o.phone}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-block px-2.5 py-1 text-[11px] font-bold rounded-md"
                          style={{
                            backgroundColor: "var(--bg-main)",
                            color: "var(--text-secondary)",
                            border: "1px solid var(--grid-border)",
                          }}
                        >
                          {o.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right pr-6">
                        <p
                          className="text-[13px] font-bold"
                          style={{ color: "var(--text-main)" }}
                        >
                          {formatCurrency(o.total)}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center px-2.5 py-1 text-[11px] font-bold rounded-md"
                          style={{
                            backgroundColor: statusConfig.bg,
                            color: statusConfig.text,
                            border: `1px solid ${statusConfig.border}`,
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full mr-1.5"
                            style={{ backgroundColor: statusConfig.text }}
                          ></span>
                          {o.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[12px] font-medium text-gray-500">
                          {o.fulfillmentType || "Chưa xác định"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5 text-gray-600">
                          <Clock size={12} className="text-gray-400" />
                          <span className="text-[13px] font-bold">
                            {o.deliveryDate ? new Date(o.deliveryDate).toLocaleDateString("vi-VN") : "---"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {o.deliveryImage ? (
                          <div className="w-10 h-10 rounded-lg overflow-hidden border border-green-200 mx-auto">
                            <img src={o.deliveryImage} alt="delivery" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <p className="text-[11px] text-gray-300 italic">Chưa có ảnh</p>
                        )}

                        {/* ===================== HOVER ACTIONS AREA ===================== */}
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 translate-x-4 group-hover:translate-x-0 z-20">
                          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-2xl">
                            <Link
                              to={`/sales/dashboard/orders/${o.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="h-9 px-4 rounded-xl bg-white border border-slate-200 text-slate-600 text-[12px] font-black hover:bg-slate-50 transition-all flex items-center gap-2 active:scale-95"
                            >
                              <Eye size={16} /> XEM CHI TIẾT
                            </Link>

                            <button
                              onClick={(e) => handlePrintClick(e, o)}
                              className="h-9 px-4 rounded-xl bg-emerald-600 text-white text-[12px] font-black hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center gap-2 active:scale-95"
                            >
                              <Printer size={16} /> IN HÓA ĐƠN
                            </button>

                            {canCancel && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCancelTarget(o);
                                  setCancelReason("");
                                  setCancelSuccess(false);
                                }}
                                className="h-9 px-4 rounded-xl bg-red-50 text-red-600 text-[12px] font-black hover:bg-red-100 transition-all flex items-center gap-2 active:scale-95 border border-red-100"
                              >
                                <XCircle size={16} /> YÊU CẦU HỦY
                              </button>
                            )}

                            {o.status === "Chờ duyệt hủy" && (
                              <div className="h-9 px-4 rounded-xl bg-amber-50 text-amber-600 text-[11px] font-black flex items-center gap-2 border border-amber-100 uppercase tracking-tight">
                                <AlertTriangle size={14} /> Chờ duyệt hủy
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {paginatedOrders.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-24 text-center">
                      <div
                        className="flex flex-col items-center gap-2"
                        style={{ color: "var(--text-placeholder)" }}
                      >
                        <div
                          className="w-16 h-16 rounded-2xl flex items-center justify-center"
                          style={{ backgroundColor: "var(--bg-main)" }}
                        >
                          <Users size={28} strokeWidth={1.5} />
                        </div>
                        <p className="text-sm font-medium mt-1">
                          {searchTerm
                            ? `Không tìm thấy đơn hàng "${searchTerm}"`
                            : "Chưa có đơn hàng nào"}
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
          {filtered.length > 0 && (
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
                <span
                  className="font-bold"
                  style={{ color: "var(--text-main)" }}
                >
                  {filtered.length}
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
                    {[15, 30, 50, 100].map((size) => (
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
                    {Math.min(currentPage * itemsPerPage, filtered.length)}
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

      {/* ════════════ MODAL: GỬI YÊU CẦU HỦY ════════════ */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col"
            style={{ border: "1px solid var(--grid-border)" }}
          >
            {cancelSuccess ? (
              /* ── Success State ── */
              <div className="p-8 flex flex-col items-center text-center gap-3">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{
                    background: "var(--status-focus)",
                  }}
                >
                  <CheckCircle2
                    size={28}
                    style={{ color: "var(--status-success)" }}
                  />
                </div>
                <h3
                  className="text-[16px] font-bold"
                  style={{ color: "var(--text-main)" }}
                >
                  Đã gửi yêu cầu hủy
                </h3>
                <p
                  className="text-[13px]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Đơn hàng <strong>{cancelTarget.code}</strong> đã chuyển sang
                  trạng thái "Chờ duyệt hủy". Chủ cửa hàng sẽ xem xét yêu cầu
                  của bạn.
                </p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div
                  className="px-6 py-4 flex items-center justify-between"
                  style={{ borderBottom: "1px solid var(--grid-border)" }}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{
                        background: "#FEF2F2",
                      }}
                    >
                      <XCircle size={18} style={{ color: "#DC2626" }} />
                    </div>
                    <div>
                      <h3
                        className="text-[15px] font-bold"
                        style={{ color: "var(--text-main)" }}
                      >
                        Gửi yêu cầu hủy đơn
                      </h3>
                      <p
                        className="text-[12px] font-medium"
                        style={{ color: "var(--text-placeholder)" }}
                      >
                        {cancelTarget.code} · {cancelTarget.customerName}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setCancelTarget(null)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <X size={18} style={{ color: "var(--text-secondary)" }} />
                  </button>
                </div>

                {/* Body */}
                <div className="p-6 flex flex-col gap-4">
                  <div
                    className="p-3.5 rounded-xl flex gap-2.5 text-[13px]"
                    style={{
                      background: "#FFFBEB",
                      border: "1px solid #FDE68A",
                      color: "#92400E",
                    }}
                  >
                    <AlertTriangle className="shrink-0 mt-0.5" size={15} />
                    <span>
                      Yêu cầu hủy sẽ được gửi đến Chủ cửa hàng để duyệt. Đơn
                      hàng sẽ chuyển sang trạng thái "Chờ duyệt hủy" cho đến khi
                      được xử lý.
                    </span>
                  </div>

                  <div>
                    <label
                      className="block text-[13px] font-semibold mb-1.5"
                      style={{ color: "var(--text-main)" }}
                    >
                      Lý do hủy đơn{" "}
                      <span style={{ color: "var(--status-error)" }}>*</span>
                    </label>
                    <textarea
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="Nhập lý do hủy đơn hàng..."
                      rows={3}
                      className="w-full rounded-xl px-4 py-3 text-[13px] focus:outline-none focus:ring-2 transition resize-none"
                      style={{
                        border: "1px solid var(--grid-border)",
                        backgroundColor: "var(--bg-main)",
                        color: "var(--text-main)",
                      }}
                    />
                  </div>
                </div>

                {/* Footer */}
                <div
                  className="px-6 py-4 flex justify-end gap-3"
                  style={{
                    borderTop: "1px solid var(--grid-border)",
                    background: "var(--grid-header-bg)",
                  }}
                >
                  <button
                    onClick={() => setCancelTarget(null)}
                    className="px-4 py-2 rounded-lg text-[13px] font-semibold transition hover:bg-gray-100 cursor-pointer"
                    style={{
                      border: "1px solid var(--grid-border)",
                      color: "var(--text-main)",
                      backgroundColor: "#fff",
                    }}
                  >
                    Hủy bỏ
                  </button>
                  <button
                    onClick={handleCancelSubmit}
                    disabled={!cancelReason.trim()}
                    className="px-4 py-2 rounded-lg text-[13px] font-semibold text-white flex items-center gap-2 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: "#DC2626",
                    }}
                  >
                    <XCircle size={15} /> Gửi yêu cầu hủy
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Hidden printable invoice */}
      {printingOrders.length > 0 && (
        <div
          ref={printRef}
          style={{
            position: "absolute",
            left: "-9999px",
            top: 0,
            width: "800px",
          }}
        >
          {printingOrders.map((o, idx) => (
            <div key={idx} className="page-break">
              <PrintableInvoice o={o} displayTotal={o.displayTotal} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
