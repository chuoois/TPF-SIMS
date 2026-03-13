/**
 * Component OwnerProduction
 * Quản lý Sản xuất — Chủ cửa hàng (Static Data)
 *
 * Created Date: 06/03/2026
 */

import { useState, useMemo, useEffect } from "react";
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

// ===================== STATIC DATA =====================
const INITIAL_PRODUCTIONS = [
  {
    id: "LSX001",
    code: "LSX-2603-0001",
    orderCode: "DH-2603-0001",
    orderId: "DH001",
    productName: "Tủ bếp chữ L",
    variantName: "Gỗ sồi Nga — Sơn PU óc chó",
    quantityPlanned: 1,
    quantityCompleted: 0,
    status: "Chờ giao thợ",
    subStage: null,
    assignedWorker: null,
    startDate: null,
    expectedEndDate: "2026-03-20",
    date: "2026-03-05T16:30:00",
  },
  {
    id: "LSX002",
    code: "LSX-2603-0002",
    orderCode: "DH-2603-0002",
    orderId: "DH002",
    productName: "Bàn ăn nguyên tấm",
    variantName: "Gỗ gõ đỏ — Live Edge",
    quantityPlanned: 1,
    quantityCompleted: 0,
    status: "Chờ giao thợ",
    subStage: null,
    assignedWorker: null,
    startDate: null,
    expectedEndDate: "2026-03-25",
    date: "2026-03-05T16:35:00",
  },
  {
    id: "LSX015",
    code: "LSX-2603-0015",
    orderCode: null,
    orderId: null,
    productName: "Bàn ăn gỗ sồi 1m6",
    variantName: "Gỗ sồi Nga — Sơn trần",
    quantityPlanned: 5,
    quantityCompleted: 0,
    status: "Chờ giao thợ",
    subStage: null,
    assignedWorker: null,
    startDate: null,
    expectedEndDate: "2026-04-10",
    date: "2026-03-08T15:30:00",
  },
  {
    id: "LSX010",
    code: "LSX-2603-0010",
    orderCode: "DH-2603-0025",
    orderId: "DH025",
    productName: "Bàn làm việc chữ L",
    variantName: "Gỗ sồi Mỹ — Sơn PU tự nhiên",
    quantityPlanned: 1,
    quantityCompleted: 0,
    status: "Chờ giao thợ",
    subStage: null,
    assignedWorker: null,
    startDate: null,
    expectedEndDate: "2026-03-28",
    date: "2026-03-07T08:30:00",
  },
  {
    id: "LSX003",
    code: "LSX-2603-0003",
    orderCode: "DH-2603-0008",
    orderId: "DH008",
    productName: "Bộ bàn ghế phòng khách",
    variantName: "Gỗ hương đá — Chạm nghê bảo đỉnh",
    quantityPlanned: 1,
    quantityCompleted: 0,
    status: "Đang sản xuất",
    subStage: "gia_cong_moc",
    needsRedo: true,
    redoReason: "Mặt bàn bị xước nhỏ ở góc trái",
    assignedWorker: "Nguyễn Văn Đức",
    startDate: "2026-03-03",
    expectedEndDate: "2026-03-25",
    date: "2026-03-03T08:00:00",
  },
  {
    id: "LSX005",
    code: "LSX-2603-0005",
    orderCode: "DH-2603-0012",
    orderId: "DH012",
    productName: "Bàn thờ chạm rồng",
    variantName: "Gỗ mít — Sơn PU bóng",
    quantityPlanned: 2,
    quantityCompleted: 1,
    status: "Đang sản xuất",
    subStage: "son_hoan_thien",
    needsRedo: true,
    redoReason: "Lớp sơn phủ chưa bóng đều, cần xả nhám nhẹ và phun lại lớp cuối.",
    assignedWorker: "Lê Văn Hùng",
    startDate: "2026-03-04",
    expectedEndDate: "2026-03-20",
    date: "2026-03-04T09:00:00",
  },
  {
    id: "LSX007",
    code: "LSX-2603-0007",
    orderCode: null,
    orderId: null,
    productName: "Tủ đầu giường",
    variantName: "Gỗ sồi — 2 ngăn kéo",
    quantityPlanned: 20,
    quantityCompleted: 5,
    status: "Đang sản xuất",
    subStage: "gia_cong_moc",
    assignedWorker: "Trần Minh Tâm",
    startDate: "2026-03-06",
    expectedEndDate: "2026-03-15",
    date: "2026-03-06T09:00:00",
  },
  {
    id: "LSX011",
    code: "LSX-2603-0011",
    orderCode: "DH-2603-0028",
    orderId: "DH028",
    productName: "Tủ quần áo 4 cánh",
    variantName: "Gỗ hương — Chạm hoa lá tây",
    quantityPlanned: 1,
    quantityCompleted: 0,
    status: "Đang sản xuất",
    subStage: "danh_rap",
    assignedWorker: "Lê Văn Hùng",
    startDate: "2026-03-07",
    expectedEndDate: "2026-03-30",
    date: "2026-03-07T10:00:00",
  },
  {
    id: "LSX004",
    code: "LSX-2603-0004",
    orderCode: "DH-2603-0008",
    orderId: "DH008",
    productName: "Kệ tivi nguyên khối",
    variantName: "Gỗ hương đá — PU đồng màu",
    quantityPlanned: 1,
    quantityCompleted: 1,
    status: "Hoàn thành",
    subStage: null,
    assignedWorker: "Trần Minh Tâm",
    startDate: "2026-03-03",
    expectedEndDate: "2026-03-15",
    date: "2026-03-03T08:15:00",
  },
  {
    id: "LSX006",
    code: "LSX-2603-0006",
    orderCode: "DH-2603-0014",
    orderId: "DH014",
    productName: "Sập thờ mai điểu",
    variantName: "Gỗ gụ mật — Vecni thủ công",
    quantityPlanned: 1,
    quantityCompleted: 1,
    status: "Hoàn thành",
    subStage: null,
    assignedWorker: "Nguyễn Văn Đức",
    startDate: "2026-03-01",
    expectedEndDate: "2026-03-10",
    date: "2026-03-01T08:00:00",
  },
  {
    id: "LSX016",
    code: "LSX-2603-0016",
    orderCode: null,
    orderId: null,
    productName: "Ghế đôn gỗ mít",
    variantName: "Gỗ mít — Đánh bóng",
    quantityPlanned: 10,
    quantityCompleted: 10,
    status: "Hoàn thành",
    subStage: null,
    assignedWorker: "Nguyễn Văn Đức",
    startDate: "2026-03-05",
    expectedEndDate: "2026-03-08",
    date: "2026-03-05T09:00:00",
  },
  {
    id: "LSX012",
    code: "LSX-2603-0012",
    orderCode: "DH-2603-0031",
    orderId: "DH031",
    productName: "Ghế bành cổ điển",
    variantName: "Gỗ óc chó — Bọc da bò",
    quantityPlanned: 4,
    quantityCompleted: 4,
    status: "Hoàn thành",
    subStage: null,
    assignedWorker: "Phạm Quốc Bảo",
    startDate: "2026-03-02",
    expectedEndDate: "2026-03-12",
    date: "2026-03-02T14:00:00",
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
  "Chờ giao thợ",
  "Đang sản xuất",
  "Chờ nghiệm thu",
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

const getStatusColor = (status, subStage = null) => {
  if (status === "Đang sản xuất") {
    if (subStage === "gia_cong_moc") return { bg: "#FDF4FF", text: "#A21CAF", border: "#F5D0FE" }; // Woodworking
    if (subStage === "son_hoan_thien") return { bg: "#FDF2F8", text: "#DB2777", border: "#FBCFE8" }; // Finishing
    return { bg: "#F5F3FF", text: "#7C3AED", border: "#DDD6FE" }; // Purple for general production
  }
  
  switch (status) {
    case "Chờ giao thợ":
      return { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" }; // Orange
    case "Chờ nghiệm thu":
      return { bg: "#EFF6FF", text: "#1D4ED8", border: "#DBEAFE" }; // Blue
    case "Hoàn thành":
      return { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" }; // Green
    default:
      return { bg: "#F3F4F6", text: "#6B7280", border: "#E5E7EB" };
  }
};

// ===================== COMPONENT =====================
export default function OwnerProduction() {
  const [productions] = useState(INITIAL_PRODUCTIONS);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [showRedoModal, setShowRedoModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedWorker, setSelectedWorker] = useState(null);

  const navigate = () => {}; // Dummy for now since we're using static data update alerts

  // Filter & Search
  const filtered = useMemo(() => {
    let result = productions;

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
          p.orderCode.toLowerCase().includes(q) ||
          p.productName.toLowerCase().includes(q) ||
          (p.assignedWorker && p.assignedWorker.toLowerCase().includes(q)),
      );
    }

    return result.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [productions, searchTerm, statusFilter, dateFrom, dateTo]);

  const hasActiveFilters = statusFilter !== "Tất cả" || dateFrom || dateTo || searchTerm;

  const clearAllFilters = () => {
    setStatusFilter("Tất cả");
    setDateFrom("");
    setDateTo("");
    setSearchTerm("");
  };

  const handleQuickComplete = (item) => {
    if (item.status === "Chờ nghiệm thu") {
      const confirm = window.confirm(`Phê duyệt & Chốt hoàn thiện mã lệnh ${item.code}?`);
      if (confirm) {
        alert(`Lệnh sản xuất ${item.code} đã hoàn thành xuất sắc! Đơn hàng ${item.orderCode} đã chuyển sang trạng thái Sẵn sàng giao.`);
      }
    } else {
      const mockPhoto = window.confirm(`Xác nhận báo xong việc cho ${item.code}? Hệ thống sẽ gửi yêu cầu nghiệm thu tới chủ xưởng.`);
      if (mockPhoto) {
        alert(`Đã báo xong việc cho ${item.code}! Trạng thái chuyển sang Chờ nghiệm thu.`);
      }
    }
  };

  const handleQuickRedo = (reason, backToStage) => {
    alert(`Đã gửi yêu cầu sửa lại lệnh ${selectedItem.code}: ${reason}. Quay lại: ${backToStage === "gia_cong_moc" ? "Mộc" : "Sơn"}`);
    setShowRedoModal(false);
  };

  const handleAssignWorker = () => {
    if (!selectedWorker || !selectedItem) return;
    const worker = MOCK_WORKERS.find(w => w.id === selectedWorker);
    alert(`Đã giao lệnh ${selectedItem.code} cho thợ ${worker.name}. Trạng thái chuyển sang Đang sản xuất.`);
    setShowAssignModal(false);
    setSelectedWorker(null);
  };


  const statusCounts = useMemo(() => {
    const counts = { "Tất cả": productions.length };
    STATUSES.forEach(s => {
      if (s !== "Tất cả") {
        counts[s] = productions.filter(p => p.status === s).length;
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
                    Sản phẩm
                  </th>
                  <th
                    className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 text-center"
                    style={{ color: "var(--text-placeholder)" }}
                  >
                    Tiến độ
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
                    Thợ phụ trách
                  </th>
                  <th
                    className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500"
                    style={{ color: "var(--text-placeholder)" }}
                  >
                    Ngày tạo
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedItems.map((p, idx) => {
                  const sc = getStatusColor(p.status);
                  const progress =
                    p.quantityPlanned > 0
                      ? Math.round((p.quantityCompleted / p.quantityPlanned) * 100)
                      : 0;
                  return (
                    <tr
                      key={p.id}
                      className="group relative border-b hover:bg-gray-50/50 transition-colors"
                      style={{ 
                        borderBottom: "1px solid var(--grid-border)",
                        backgroundColor: p.status === "Chờ xử lý" ? "#FFFBF0" : "transparent"
                      }}
                    >
                      <td className="px-6 py-4 font-medium text-gray-400">
                        {(currentPage - 1) * itemsPerPage + idx + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                          <p className="text-[13px] font-bold font-mono text-gray-900">
                            {p.code}
                          </p>
                          {p.orderCode && (
                            <Link
                              to={`/owner/orders/${p.orderId}`}
                              className="text-[11px] font-bold text-gray-400 hover:text-blue-600 hover:underline flex items-center gap-1 w-fit"
                            >
                              <FileText size={10} /> {p.orderCode}
                            </Link>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-bold text-gray-900 truncate">
                              {p.productName}
                            </span>
                            {p.status === "Chờ giao thợ" && (
                              <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse" title="Cần giao việc ngay" />
                            )}
                          </div>
                          <span className="text-[11px] font-medium text-gray-400">
                            {p.variantName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-center gap-1.5">
                          <div className="flex items-center gap-2">
                            <span
                              className="text-[12px] font-bold"
                              style={{
                                color: progress === 100 ? "#16a34a" : "#1f2937",
                              }}
                            >
                              {p.quantityCompleted}/{p.quantityPlanned}
                            </span>
                            <span className="text-[10px] text-gray-400 font-medium">
                              ({progress}%)
                            </span>
                          </div>
                          {p.status !== "Chờ giao thợ" && (
                            <div className="w-20 h-1 rounded-full bg-gray-100 overflow-hidden">
                              <div
                                className="h-full transition-all duration-500"
                                style={{
                                  width: `${progress}%`,
                                  backgroundColor:
                                    progress === 100 ? "#16a34a" : "var(--brand-primary)",
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            {p.status === "Chờ giao thợ" ? (
                              <span
                                className="inline-flex items-center px-3 py-1.5 rounded-xl text-[11px] font-black w-fit bg-red-50 text-red-600 border border-red-200 shadow-sm animate-[bounce_2s_infinite]"
                              >
                                <Activity size={12} className="mr-1.5" />
                                CẦN GIAO VIỆC
                              </span>
                            ) : p.status === "Đang sản xuất" && p.subStage ? (
                              <>
                                <span
                                  className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold w-fit"
                                style={{
                                  backgroundColor: getStatusColor(p.status, p.subStage).bg,
                                  color: getStatusColor(p.status, p.subStage).text,
                                  border: `1px solid ${getStatusColor(p.status, p.subStage).border}`,
                                }}
                              >
                                <span
                                  className="w-1.5 h-1.5 rounded-full mr-1.5"
                                  style={{ backgroundColor: getStatusColor(p.status, p.subStage).text }}
                                />
                                {p.subStage === "gia_cong_moc" ? "Gia công Mộc" : "Sơn hoàn thiện"}
                              </span>
                              {p.needsRedo && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 border border-red-100 text-[10px] font-bold text-red-600 shadow-sm animate-pulse">
                                  <AlertTriangle size={12} className="shrink-0" />
                                  CẦN SỬA LẠI
                                </span>
                              )}
                            </>
                          ) : (
                              <span
                                className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold w-fit"
                                style={{
                                  backgroundColor: getStatusColor(p.status).bg,
                                  color: getStatusColor(p.status).text,
                                  border: `1px solid ${getStatusColor(p.status).border}`,
                                }}
                              >
                                <span
                                  className="w-1.5 h-1.5 rounded-full mr-1.5"
                                  style={{ backgroundColor: getStatusColor(p.status).text }}
                                />
                                {p.status}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {p.assignedWorker ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500 shrink-0">
                              {p.assignedWorker.split(" ").pop()[0]}
                            </div>
                            <span className="font-bold text-gray-700">
                              {p.assignedWorker}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic text-xs">
                            Chưa phân công
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className="font-medium text-gray-700">
                            {formatDate(p.date)}
                          </span>
                          <span className="text-[10px] text-gray-400 font-bold uppercase">
                            {new Date(p.date).toLocaleTimeString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        {/* HOVER QUICK ACTIONS BAR */}
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 flex items-center gap-2 bg-white border border-gray-100 shadow-2xl rounded-2xl p-1.5 z-10">
                           <Link
                              to={`/owner/production/${p.id}`}
                              className="inline-flex items-center gap-1.5 px-4 h-9 rounded-xl bg-emerald-50 text-emerald-700 text-[12px] font-bold hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                            >
                              <Eye size={14} />
                              Chi tiết
                            </Link>

                            {p.status === "Chờ giao thợ" && (
                              <button 
                                onClick={() => {
                                  setSelectedItem(p);
                                  setShowAssignModal(true);
                                }}
                                className="h-9 px-4 rounded-xl bg-emerald-600 flex items-center gap-2 text-[12px] font-bold text-white hover:bg-emerald-700 transition-all shadow-md active:scale-95"
                              >
                                <UserPlus size={16} /> Giao việc
                              </button>
                            )}

                            {p.status === "Đang sản xuất" && !p.needsRedo && p.subStage === "son_hoan_thien" && (
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
                                  <button 
                                    onClick={() => handleQuickComplete(p)}
                                    className="h-9 px-4 rounded-xl bg-emerald-600 flex items-center gap-2 text-[12px] font-bold text-white hover:bg-emerald-700 transition-all shadow-md active:scale-95"
                                  >
                                    <CheckCircle size={16} /> Xong việc
                                  </button>
                               </>
                            )}

                            {p.status === "Chờ nghiệm thu" && (
                                <button 
                                  onClick={() => handleQuickComplete(p)}
                                  className="h-9 px-5 rounded-xl bg-emerald-600 flex items-center gap-2 text-[12px] font-bold text-white hover:bg-emerald-700 transition-all shadow-lg active:scale-95 animate-[pulse_2s_infinite]"
                                >
                                  <Camera size={16} /> Duyệt sản phẩm
                                </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {paginatedItems.length === 0 && (
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

        {/* Quick Assign Modal */}
        {showAssignModal && selectedItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
               <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-emerald-50/30">
                  <div className="flex items-center gap-2 text-emerald-600">
                    <UserPlus size={18} />
                    <h3 className="text-[15px] font-bold uppercase tracking-tight">Giao việc cho thợ</h3>
                  </div>
                  <button onClick={() => setShowAssignModal(false)} className="text-gray-400 hover:text-gray-600 transition p-1 hover:bg-white rounded-lg">
                    <X size={20} />
                  </button>
               </div>
               
               <div className="p-6">
                  <div className="space-y-4">
                     <p className="text-[13px] text-gray-600">Chọn thợ phụ trách cho lệnh sản xuất <span className="font-bold text-emerald-600">{selectedItem.code}</span>:</p>
                     
                     <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                        {MOCK_WORKERS.map(worker => (
                           <label 
                             key={worker.id}
                             className={`flex items-center gap-3 p-3 rounded-xl border-2 transition cursor-pointer hover:border-emerald-200 ${selectedWorker === worker.id ? 'border-emerald-500 bg-emerald-50' : 'border-gray-50 bg-white'}`}
                           >
                              <input 
                                type="radio" 
                                name="worker" 
                                className="hidden" 
                                onChange={() => setSelectedWorker(worker.id)}
                                checked={selectedWorker === worker.id}
                              />
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-[14px] transition-colors ${selectedWorker === worker.id ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                 {worker.avatar}
                              </div>
                              <div className="flex-1">
                                 <p className="text-[14px] font-bold text-gray-900">{worker.name}</p>
                                 <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">{worker.role}</p>
                              </div>
                              {selectedWorker === worker.id && <CheckCircle size={18} className="text-emerald-600" />}
                           </label>
                        ))}
                     </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                     <button 
                       onClick={() => setShowAssignModal(false)}
                       className="flex-1 h-11 rounded-xl text-[13px] font-bold text-gray-400 hover:bg-gray-50 transition"
                     >
                        Hủy bỏ
                     </button>
                     <button 
                       disabled={!selectedWorker}
                       onClick={handleAssignWorker}
                       className="flex-1 h-11 rounded-xl text-[13px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-100 active:scale-95"
                     >
                        Bắt đầu sản xuất
                     </button>
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
