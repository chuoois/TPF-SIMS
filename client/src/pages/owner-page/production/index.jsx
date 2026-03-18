/**
 * Component OwnerProduction
 * Quản lý Sản xuất — Chủ cửa hàng (Static Data)
 *
 * Created Date: 06/03/2026
 */

import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Package,
  Calendar,
  Eye,
  UserPlus,
  Hammer,
  X,
  ChevronLeft,
  ChevronRight,
  Activity,
  CheckCircle,
  XCircle,
  PackagePlus,
  Pencil,
  FileText,
  AlertTriangle,
  RotateCcw,
  Camera,
  Paintbrush,
} from "lucide-react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import toast from "react-hot-toast";

// ===================== STATIC DATA =====================
const INITIAL_PRODUCTIONS = [
  // Order 1: Multi-product (Kitchen)
  {
    id: "LSX001",
    code: "LSX-2603-0001",
    orderCode: "DH-2603-0001",
    orderId: "DH001",
    customerName: "Nguyễn Văn A",
    productName: "Tủ bếp chữ L",
    productImage: "https://images.unsplash.com/photo-1556912177-c54030639a03?q=80&w=300",
    variantName: "Gỗ sồi Nga — Sơn PU",
    orderType: "Hàng đặt",
    quantityPlanned: 1,
    quantityCompleted: 0,
    status: "Đang đánh giấy ráp",
    subStage: "gia_cong_moc",
    assignedWorker: "Thợ cả",
    startDate: null,
    expectedEndDate: "2026-03-20",
    date: "2026-03-05T16:30:00",
  },
  {
    id: "LSX021",
    code: "LSX-2603-0021",
    orderCode: "DH-2603-0001",
    orderId: "DH001",
    customerName: "Nguyễn Văn A",
    productName: "Đảo bếp",
    productImage: "https://images.unsplash.com/photo-1588854337221-4cf9fa96059c?q=80&w=300",
    variantName: "Đồng bộ tủ bếp",
    orderType: "Hàng đặt",
    quantityPlanned: 1,
    quantityCompleted: 0,
    status: "Đang đánh giấy ráp",
    subStage: "gia_cong_moc",
    assignedWorker: "Thợ cả",
    startDate: null,
    expectedEndDate: "2026-03-22",
    date: "2026-03-05T16:32:00",
  },
  {
    id: "LSX022",
    code: "LSX-2603-0022",
    orderCode: "DH-2603-0001",
    orderId: "DH001",
    customerName: "Nguyễn Văn A",
    productName: "Kệ trang trí",
    productImage: "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?q=80&w=300",
    variantName: "Gỗ sồi Nga — Sơn PU",
    orderType: "Hàng đặt",
    quantityPlanned: 2,
    quantityCompleted: 0,
    status: "Đang đánh giấy ráp",
    subStage: "gia_cong_moc",
    assignedWorker: "Thợ cả",
    startDate: null,
    expectedEndDate: "2026-03-22",
    date: "2026-03-05T16:33:00",
  },
  // Order 2: Single product (Dining room)
  {
    id: "LSX002",
    code: "LSX-2603-0002",
    orderCode: "DH-2603-0002",
    orderId: "DH002",
    customerName: "Trần Thị B",
    productName: "Bàn ăn nguyên tấm",
    productImage: "https://images.unsplash.com/photo-1577145745727-42b77daeb623?q=80&w=300",
    variantName: "Gỗ gõ đỏ — Live Edge",
    orderType: "Hàng mộc",
    quantityPlanned: 1,
    quantityCompleted: 0,
    status: "Đang đánh giấy ráp",
    subStage: "gia_cong_moc",
    assignedWorker: "Thợ cả",
    startDate: null,
    expectedEndDate: "2026-03-25",
    date: "2026-03-05T16:35:00",
  },
  // Order 3: Multi-product (Living room - Mixed Status)
  {
    id: "LSX003",
    code: "LSX-2603-0003",
    orderCode: "DH-2603-0008",
    orderId: "DH008",
    customerName: "Lê Văn C",
    productName: "Bàn trà phòng khách",
    productImage: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=300",
    variantName: "Gỗ hương đá — Chạm nghê",
    orderType: "Hàng đặt",
    quantityPlanned: 1,
    quantityCompleted: 0,
    status: "Đang đánh giấy ráp",
    subStage: "gia_cong_moc",
    assignedWorker: "Nguyễn Văn Đức",
    startDate: "2026-03-03",
    expectedEndDate: "2026-03-25",
    date: "2026-03-03T08:00:00",
  },
  // Order 4: Pending Approval (was Chờ nghiệm thu)
  {
    id: "LSX005",
    code: "LSX-2603-0005",
    orderCode: "DH-2603-0012",
    orderId: "DH012",
    customerName: "Phạm Văn D",
    productName: "Tủ quần áo 4 cánh",
    productImage: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=300",
    variantName: "Gỗ công nghiệp MDF — Phủ Melamine",
    orderType: "Hàng đặt",
    quantityPlanned: 1,
    quantityCompleted: 1,
    status: "Đang sơn",
    subStage: "son_hoan_thien",
    isPendingApproval: true,
    completionPhoto: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=3000&auto=format&fit=crop",
    assignedWorker: "Lê Văn Hùng",
    startDate: "2026-03-01",
    expectedEndDate: "2026-03-10",
    date: "2026-03-01T09:00:00",
  },
  // Order 5: High Priority / Delayed
  {
    id: "LSX006",
    code: "LSX-2603-0006",
    orderCode: "DH-2603-0015",
    orderId: "DH015",
    customerName: "Hoàng Anh Tuấn",
    productName: "Giường ngủ 1m8",
    productImage: "https://images.unsplash.com/photo-1505693419173-42b925b406af?q=80&w=300",
    variantName: "Gỗ xoan đào — Kiểu hiện đại",
    orderType: "Hàng đặt",
    quantityPlanned: 1,
    quantityCompleted: 0,
    status: "Đang sơn",
    subStage: "son_hoan_thien",
    assignedWorker: "Phạm Quốc Bảo",
    startDate: "2026-03-02",
    expectedEndDate: "2026-03-12",
    date: "2026-03-02T10:00:00",
  },
  {
    id: "LSX023",
    code: "LSX-2603-0023",
    orderCode: "DH-2603-0015",
    orderId: "DH015",
    customerName: "Hoàng Anh Tuấn",
    productName: "Tủ đầu giường",
    productImage: "https://images.unsplash.com/photo-1616137509918-62f4f22c1926?q=80&w=300",
    variantName: "Gỗ xoan đào — Đồng bộ giường",
    orderType: "Hàng đặt",
    quantityPlanned: 2,
    quantityCompleted: 0,
    status: "Đang đánh giấy ráp",
    subStage: "gia_cong_moc",
    assignedWorker: "Thợ cả",
    startDate: null,
    expectedEndDate: "2026-03-15",
    date: "2026-03-02T09:58:00",
  },
  // Order 6: Completed
  {
    id: "LSX007",
    code: "LSX-2603-0007",
    orderCode: "DH-2603-0018",
    orderId: "DH018",
    customerName: "Nguyễn Thu Hà",
    productName: "Bộ bàn ghế ăn 6 ghế",
    productImage: "https://images.unsplash.com/photo-1617806118233-ef203e91122b?q=80&w=300",
    variantName: "Gỗ sồi — Màu óc chó",
    orderType: "Hàng mộc",
    quantityPlanned: 1,
    quantityCompleted: 1,
    status: "Hoàn thành",
    assignedWorker: "Trần Minh Tâm",
    startDate: "2026-02-28",
    expectedEndDate: "2026-03-08",
    date: "2026-02-27T14:20:00",
  },
];

const MOCK_WORKERS = [
  { id: "W001", name: "Nguyễn Văn Đức", role: "Thợ sản xuất", avatar: "Đ" },
  { id: "W002", name: "Trần Minh Tâm", role: "Thợ sản xuất", avatar: "T" },
  { id: "W003", name: "Lê Văn Hùng", role: "Thợ sơn", avatar: "H" },
  { id: "W004", name: "Phạm Quốc Bảo", role: "Thợ mộc", avatar: "B" },
];

const STATUSES = [
  "Tất cả",
  "Đang đánh giấy ráp",
  "Đang sơn",
  "Hoàn thành",
];

// ===================== HELPERS =====================
const formatDateTime = (dateString) => {
  if (!dateString) return "—";
  const d = new Date(dateString);
  return `${d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} - ${d.toLocaleDateString("vi-VN")}`;
};

const formatDate = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("vi-VN");
};

const getDeadlineStyle = (dateString) => {
  if (!dateString) return { color: "var(--text-main)", text: "Chưa định ngày" };
  const d = new Date(dateString);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const deadline = new Date(d);
  deadline.setHours(0, 0, 0, 0);
  const diffTime = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { color: "#EF4444", text: formatDate(dateString), urgent: true };
  if (diffDays <= 3) return { color: "#F59E0B", text: formatDate(dateString), urgent: true };
  return { color: "var(--text-main)", text: formatDate(dateString), urgent: false };
};

const getStatusColor = (status, subStage = null, isPendingApproval = false, needsRedo = false) => {
  // 1. Primary Status (Matching the Tabs)
  const primaryBadge = {
    "Đang đánh giấy ráp": { label: "Đang đánh giấy ráp", bg: "#FDF4FF", text: "#A21CAF", border: "#F5D0FE" },
    "Đang sơn": { label: "Đang sơn", bg: "#FDF2F8", text: "#DB2777", border: "#FBCFE8" },
    "Hoàn thành": { label: "Hoàn thành", bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
  }[status] || { label: status, bg: "#F3F4F6", text: "#6B7280", border: "#E5E7EB" };

  // 2. Detail Status (The Nuance)
  let detailBadge = null;
  if (isPendingApproval && status === "Đang sơn") {
    detailBadge = { label: "Chờ duyệt", bg: "#EFF6FF", text: "#1D4ED8", border: "#DBEAFE" };
  } else if (needsRedo && status === "Đang sơn") {
    detailBadge = { label: "Sửa lại", bg: "#FEF2F2", text: "#EF4444", border: "#FEE2E2" };
  }

  return { primaryBadge, detailBadge };
};

// ===================== COMPONENT =====================
export default function OwnerProduction() {
  const [productions, setProductions] = useState(INITIAL_PRODUCTIONS);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [showRedoModal, setShowRedoModal] = useState(false);
  const [showInspectModal, setShowInspectModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const navigate = () => { }; // Dummy for now since we're using static data update alerts

  // Filter & Search
  const filtered = useMemo(() => {
    let result = productions.filter(p => p.orderType !== "Hàng sẵn");

    // Filter by status
    if (statusFilter !== "Tất cả") {
      result = result.filter((p) => p.status === statusFilter);
    }

    // Filter by date range
    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      result = result.filter((p) => new Date(p.date) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      result = result.filter((p) => new Date(p.date) <= to);
    }

    // Search
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.code.toLowerCase().includes(q) ||
          p.orderCode?.toLowerCase().includes(q) ||
          p.productName.toLowerCase().includes(q)
      );
    }

    return result.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [productions, searchTerm, statusFilter, dateFrom, dateTo]);

  const hasActiveFilters =
    statusFilter !== "Tất cả" || searchTerm !== "" || dateFrom !== "" || dateTo !== "";

  const clearAllFilters = () => {
    setStatusFilter("Tất cả");
    setSearchTerm("");
    setDateFrom("");
    setDateTo("");
  };

  const handleQuickComplete = (item) => {
    if (item.isPendingApproval) {
      setSelectedItem(item);
      setShowInspectModal(true);
    } else {
      toast((t) => (
        <div className="flex flex-col gap-3">
          <p className="text-[13px] font-medium text-gray-700">
            Xác nhận <strong>Duyệt & Hoàn thành</strong> cho mã lệnh <strong>{item.code}</strong>?
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-gray-400 hover:bg-gray-50 transition"
            >
              Hủy
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                setProductions(prev => prev.map(p =>
                  p.id === item.id
                    ? { ...p, isPendingApproval: true, quantityCompleted: p.quantityPlanned }
                    : p
                ));
                toast.success(`Đã ghi nhận yêu cầu duyệt cho ${item.code}`);
              }}
              className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition"
            >
              Xác nhận
            </button>
          </div>
        </div>
      ), { duration: 5000, position: 'top-center' });
    }
  };

  const handleApprove = (item) => {
    setProductions(prev => prev.map(p =>
      p.id === item.id
        ? { ...p, status: "Hoàn thành", isPendingApproval: false }
        : p
    ));
    setShowInspectModal(false);
  };

  const handleQuickRedo = (reason, backToStage) => {
    setProductions(prev => prev.map(p =>
      p.id === selectedItem.id
        ? { ...p, status: "Đang sản xuất", isPendingApproval: false, needsRedo: true, redoReason: reason, subStage: backToStage }
        : p
    ));
    setShowRedoModal(false);
  };




  const statusCounts = useMemo(() => {
    const validProductions = productions.filter(p => p.orderType !== "Hàng sẵn");
    const counts = { "Tất cả": validProductions.length };
    STATUSES.forEach(s => {
      if (s !== "Tất cả") {
        counts[s] = validProductions.filter(p => p.status === s).length;
      }
    });
    return counts;
  }, [productions]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateFrom, dateTo]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedItems = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // ===================== RENDER =====================
  return (
    <>
      <PageHelmet title="Quản lý sản xuất - Chủ cửa hàng | TPF-SIMS" />

      <div
        className="flex flex-col h-[calc(100vh-64px)] -m-6 p-6 space-y-4"
        style={{ backgroundColor: "var(--bg-main)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between shrink-0 px-1">
          <div>
            <h1
              className="text-[22px] font-bold flex items-center gap-2.5"
              style={{ color: "var(--text-main)", letterSpacing: "-0.01em" }}
            >
              <Hammer size={24} style={{ color: "#10B981" }} />
              Quản lý sản xuất
            </h1>
            <p
              className="text-[13px] mt-1 font-medium italic"
              style={{ color: "var(--text-placeholder)" }}
            >
              {filtered.length} lệnh sản xuất đang lưu hành
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 px-1 flex-wrap">
          {STATUSES.map((s) => {
            const isActive = statusFilter === s;
            const sc = s !== "Tất cả" ? getStatusColor(s) : null;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className="px-4 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer flex items-center gap-2 border"
                style={{
                  backgroundColor: isActive
                    ? (sc ? sc.bg : "#ECFDF5")
                    : "transparent",
                  color: isActive
                    ? (sc ? sc.text : "#059669")
                    : "var(--text-secondary)",
                  borderColor: isActive
                    ? (sc ? sc.border : "#A7F3D0")
                    : "transparent",
                  boxShadow: isActive ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
                }}
              >
                {s !== "Tất cả" && (
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor: sc ? sc.text : "#10B981",
                    }}
                  />
                )}
                {s}
                <span className="text-[10px] opacity-60 bg-black/5 px-1.5 rounded-md ml-0.5">
                  {statusCounts[s] || 0}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search + Table Card */}
        <div
          className="flex flex-col bg-white rounded-2xl flex-1 overflow-hidden"
          style={{
            boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
          }}
        >
          {/* Search Header */}
          <div
            className="px-4 py-3 shrink-0 flex flex-wrap items-center justify-between gap-4"
            style={{
              backgroundColor: "var(--grid-header-bg)",
              borderBottom: "1px solid var(--grid-border)",
            }}
          >
            <div className="flex items-center gap-4 flex-1 min-w-[300px]">
              {/* Search */}
              <div className="relative flex-1 max-w-sm">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-placeholder)" }}
                />
                <input
                  type="text"
                  placeholder="Tìm lệnh SX, mã đơn, thợ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-9 pl-10 pr-8 rounded-lg text-[13px] border focus:outline-none focus:ring-1 transition"
                  style={{
                    borderColor: "var(--grid-border)",
                    backgroundColor: "#fff",
                    color: "var(--text-main)",
                  }}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full cursor-pointer"
                  >
                    <X size={14} style={{ color: "var(--text-placeholder)" }} />
                  </button>
                )}
              </div>

              {/* Date Filter */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Calendar
                    size={14}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--text-placeholder)" }}
                  />
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="h-9 pl-9 pr-3 rounded-lg text-[13px] border focus:outline-none shadow-xs"
                    style={{
                      borderColor: dateFrom
                        ? "var(--brand-primary)"
                        : "var(--grid-border)",
                      backgroundColor: "#fff",
                      color: "var(--text-main)",
                    }}
                  />
                </div>
                <span className="text-gray-400 text-xs font-bold">~</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-9 px-3 rounded-lg text-[13px] border focus:outline-none shadow-xs"
                  style={{
                    borderColor: dateTo
                      ? "var(--brand-primary)"
                      : "var(--grid-border)",
                    backgroundColor: "#fff",
                    color: "var(--text-main)",
                  }}
                />
              </div>

            </div>

            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="h-9 px-3 rounded-lg text-[12px] font-bold text-red-600 hover:bg-red-50 transition border border-transparent hover:border-red-100 cursor-pointer"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left relative text-[13px]">
              <thead
                className="sticky top-0 z-10"
                style={{
                  backgroundColor: "var(--grid-header-bg)",
                  borderBottom: "1px solid var(--grid-border)",
                }}
              >
                <tr>
                  <th
                    className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 w-16"
                    style={{ color: "var(--text-placeholder)" }}
                  >
                    STT
                  </th>
                  <th
                    className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500"
                    style={{ color: "var(--text-placeholder)" }}
                  >
                    Mã lệnh SX
                  </th>
                  <th
                    className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500"
                    style={{ color: "var(--text-placeholder)" }}
                  >
                    Loại hàng
                  </th>
                  <th
                    className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500"
                    style={{ color: "var(--text-placeholder)" }}
                  >
                    Khách hàng
                  </th>
                  <th
                    className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500"
                    style={{ color: "var(--text-placeholder)" }}
                  >
                    Sản phẩm
                  </th>
                  <th
                    className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500"
                    style={{ color: "var(--text-placeholder)" }}
                  >
                    Trạng thái
                  </th>
                  <th
                    className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500"
                    style={{ color: "var(--text-placeholder)" }}
                  >
                    Hạn giao
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedItems.map((p, idx) => {
                  const sc = getStatusColor(p.status, p.subStage, p.isPendingApproval, p.needsRedo);
                  const ds = getDeadlineStyle(p.expectedEndDate);
                  const progress =
                    p.quantityPlanned > 0
                      ? Math.round((p.quantityCompleted / p.quantityPlanned) * 100)
                      : 0;

                  // Check if this item belongs to a group (same order) on this page
                  const sameOrderItems = paginatedItems.filter(item => item.orderId === p.orderId && p.orderId !== null);
                  const isFirstInGroup = sameOrderItems.length > 1 && sameOrderItems[0].id === p.id;
                  const isLastInGroup = sameOrderItems.length > 1 && sameOrderItems[sameOrderItems.length - 1].id === p.id;
                  const isInGroup = sameOrderItems.length > 1;

                  return (
                    <tr
                      key={p.id}
                      className="group relative border-b hover:bg-emerald-50/10 transition-colors"
                      style={{
                        borderBottom: "1px solid var(--grid-border)",
                      }}
                    >
                      <td className="px-6 py-4 font-medium text-gray-400">
                        {(currentPage - 1) * itemsPerPage + idx + 1}
                      </td>
                      <td className="px-6 py-4 relative">
                        {/* Group Indicator Line */}
                        {isInGroup && (
                          <div
                            className={`absolute left-0 w-1 bg-blue-400/30 ${isFirstInGroup ? 'top-4 rounded-t-full' : 'top-0'} ${isLastInGroup ? 'bottom-4 rounded-b-full' : 'bottom-0'}`}
                          />
                        )}

                        <div className="flex flex-col gap-1.5">
                          <p className="text-[13px] font-bold font-mono text-gray-900 tracking-tight">
                            {p.code}
                          </p>
                          {p.orderCode && (
                            <Link
                              to={`/owner/orders/${p.orderId}`}
                              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 border border-blue-100 text-[10px] font-bold text-blue-600 hover:bg-blue-600 hover:text-white transition-all w-fit group/order"
                            >
                              <FileText size={10} className="text-blue-400 group-hover/order:text-white" />
                              {p.orderCode}
                            </Link>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {p.orderType && (
                          <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-slate-100 text-slate-500 border border-slate-200 uppercase w-fit tracking-tight">
                            {p.orderType}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[13px] font-bold text-gray-900">
                            {p.customerName || "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-bold text-gray-900 truncate">
                              {p.productName}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-50 border border-gray-100 text-[10px] font-bold text-gray-500">
                              {p.variantName}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold whitespace-nowrap"
                            style={{
                              backgroundColor: sc.primaryBadge.bg,
                              color: sc.primaryBadge.text,
                              border: `1px solid ${sc.primaryBadge.border}`,
                            }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full mr-1.5"
                              style={{ backgroundColor: sc.primaryBadge.text }}
                            />
                            {sc.primaryBadge.label}
                          </span>
                          {sc.detailBadge && (
                            <span
                              className="px-2 py-0.5 rounded-md text-[10px] font-bold"
                              style={{
                                backgroundColor: sc.detailBadge.bg,
                                color: sc.detailBadge.text,
                                border: `1px solid ${sc.detailBadge.border}`
                              }}
                            >
                              {sc.detailBadge.label}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-[13px] font-bold relative" style={{ color: ds.color }}>
                        {ds.text}

                        {/* HOVER QUICK ACTIONS BAR */}
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 flex items-center gap-2 bg-white border border-gray-100 shadow-2xl rounded-2xl p-1.5 z-10">
                          <Link
                            to={`/owner/production/${p.id}`}
                            className="inline-flex items-center gap-1.5 px-4 h-9 rounded-xl bg-emerald-50 text-emerald-700 text-[12px] font-bold hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                          >
                            <Eye size={14} />
                            Chi tiết
                          </Link>



                          {p.status === "Đang sơn" && (
                            <>
                              {p.isPendingApproval ? (
                                <button
                                  onClick={() => {
                                    setSelectedItem(p);
                                    setShowInspectModal(true);
                                  }}
                                  className="h-9 px-5 rounded-xl bg-blue-600 flex items-center gap-2 text-[12px] font-bold text-white hover:bg-blue-700 transition-all shadow-lg active:scale-95"
                                >
                                  <Camera size={16} /> Duyệt
                                </button>
                              ) : (
                                <>
                                  <button
                                    onClick={() => {
                                      setSelectedItem(p);
                                      setShowRedoModal(true);
                                    }}
                                    className="h-9 px-3 rounded-xl bg-white border border-red-200 flex items-center gap-1.5 text-[12px] font-bold text-red-500 hover:bg-red-50 transition-all shadow-sm"
                                  >
                                    <RotateCcw size={16} /> Sửa lại
                                  </button>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {paginatedItems.length === 0 && (
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
                          <Hammer size={28} strokeWidth={1.5} />
                        </div>
                        <p className="text-sm font-medium mt-1">
                          {searchTerm
                            ? `Không tìm thấy lệnh sản xuất "${searchTerm}"`
                            : "Chưa có lệnh sản xuất nào"}
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
                      setCurrentPage(1); // Reset to page 1 when changing items per page
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
        {/* Redo Modal */}
        {showRedoModal && selectedItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-emerald-50/30">
                <div className="flex items-center gap-2 text-emerald-600">
                  <AlertTriangle size={18} />
                  <h3 className="text-[15px] font-bold uppercase tracking-tight">Yêu cầu sửa lại sản phẩm</h3>
                </div>
                <button onClick={() => setShowRedoModal(false)} className="text-gray-400 hover:text-gray-600 transition p-1 hover:bg-white rounded-lg">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200">
                  <p className="text-[11px] text-gray-400 font-bold uppercase mb-1">Đang xử lý lệnh</p>
                  <p className="text-[13px] font-bold text-gray-900">{selectedItem.code} - {selectedItem.productName}</p>
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-gray-400 uppercase mb-2 ml-1">Nguyên nhân lỗi / Dặn dò thợ</label>
                  <textarea
                    id="redoReasonQuick"
                    className="w-full h-24 p-4 rounded-2xl border border-gray-200 text-[13px] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-300 transition resize-none"
                    placeholder="Ví dụ: Màu sơn chưa đều, còn xước ở cạnh bàn..."
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-gray-400 uppercase mb-2 ml-1">Quay lại công đoạn</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleQuickRedo(document.getElementById('redoReasonQuick').value, 'gia_cong_moc')}
                      className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50 transition group"
                    >
                      <Hammer size={20} className="text-gray-400 group-hover:text-emerald-600" />
                      <span className="text-[12px] font-bold text-gray-600 group-hover:text-emerald-700">Gia công Mộc</span>
                    </button>
                    <button
                      onClick={() => handleQuickRedo(document.getElementById('redoReasonQuick').value, 'son_hoan_thien')}
                      className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50 transition group"
                    >
                      <Paintbrush size={20} className="text-gray-400 group-hover:text-emerald-600" />
                      <span className="text-[12px] font-bold text-gray-600 group-hover:text-emerald-700">Sơn hoàn thiện</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => setShowRedoModal(false)}
                  className="px-5 py-2 rounded-xl text-[13px] font-bold text-gray-400 hover:text-gray-600 transition"
                >
                  Hủy bỏ
                </button>
              </div>
            </div>
          </div>
        )}


        {/* Photo Inspection Modal */}
        {showInspectModal && selectedItem && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-blue-50/30">
                <div className="flex items-center gap-3 text-blue-600">
                  <Camera size={22} />
                  <h3 className="text-[17px] font-bold uppercase tracking-tight">Nghiệm thu sản phẩm qua ảnh</h3>
                </div>
                <button
                  onClick={() => setShowInspectModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition p-2 hover:bg-white rounded-xl"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Photo Preview */}
                  <div className="flex-1 aspect-square rounded-3xl overflow-hidden border border-gray-100 shadow-inner bg-gray-50">
                    <img
                      src={selectedItem.completionPhoto}
                      alt="Ảnh hoàn thiện"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Details & Decision */}
                  <div className="flex-1 flex flex-col justify-between py-2">
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                        <p className="text-[11px] text-gray-400 font-bold uppercase mb-1">Thông tin lệnh</p>
                        <p className="text-[15px] font-bold text-gray-900">{selectedItem.code}</p>
                        <p className="text-[13px] text-gray-600 mt-1">{selectedItem.productName}</p>
                      </div>

                      <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                        <p className="text-[11px] text-emerald-600/60 font-bold uppercase mb-1">Người báo xong</p>
                        <p className="text-[14px] font-bold text-emerald-900">{selectedItem.assignedWorker}</p>
                        <p className="text-[12px] text-emerald-600 mt-0.5">Thời gian: {formatDateTime(new Date())}</p>
                      </div>

                      <div className="flex items-start gap-2 text-amber-600 bg-amber-50 p-4 rounded-2xl border border-amber-100">
                        <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                        <p className="text-[12px] leading-relaxed">
                          Hãy kiểm tra kỹ các góc cạnh, màu sơn và quy cách so với yêu cầu khách hàng trước khi phê duyệt.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 mt-6">
                      <button
                        onClick={() => handleApprove(selectedItem)}
                        className="w-full h-14 rounded-2xl bg-emerald-600 text-white font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-lg active:scale-95"
                      >
                        <CheckCircle size={20} /> Duyệt & Hoàn thành
                      </button>
                      <button
                        onClick={() => {
                          setShowInspectModal(false);
                          setShowRedoModal(true);
                        }}
                        className="w-full h-14 rounded-2xl bg-white border-2 border-red-200 text-red-600 font-bold flex items-center justify-center gap-2 hover:bg-red-50 transition-all active:scale-95"
                      >
                        <RotateCcw size={20} /> Sai mẫu - Yêu cầu sửa lại
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
