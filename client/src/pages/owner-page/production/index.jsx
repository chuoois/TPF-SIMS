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

} from "lucide-react";
import { PageHelmet } from "@/components/seo/PageHelmet";

// ===================== STATIC DATA =====================
const INITIAL_PRODUCTIONS = [
  {
    id: "LSX001",
    code: "LSX-2603-0001",
    orderCode: "DH-2603-0010",
    orderId: "DH001",
    productName: "Tủ bếp chữ L",
    variantName: "Gỗ sồi Nga — Sơn PU óc chó",
    quantityPlanned: 1,
    quantityCompleted: 0,
    status: "Chờ xử lý",
    subStage: null,
    assignedWorker: null,
    startDate: null,
    expectedEndDate: "2026-03-20",
    date: "2026-03-05T16:30:00",
  },
  {
    id: "LSX002",
    code: "LSX-2603-0002",
    orderCode: "DH-2603-0010",
    orderId: "DH001",
    productName: "Bàn ăn nguyên tấm",
    variantName: "Gỗ gõ đỏ — Live Edge",
    quantityPlanned: 1,
    quantityCompleted: 0,
    status: "Chờ xử lý",
    subStage: null,
    assignedWorker: null,
    startDate: null,
    expectedEndDate: "2026-03-25",
    date: "2026-03-05T16:35:00",
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
    subStage: "danh_rap",
    assignedWorker: "Nguyễn Văn Đức",
    startDate: "2026-03-03",
    expectedEndDate: "2026-03-25",
    date: "2026-03-03T08:00:00",
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
    id: "LSX005",
    code: "LSX-2603-0005",
    orderCode: "DH-2603-0012",
    orderId: "DH012",
    productName: "Bàn thờ chạm rồng",
    variantName: "Gỗ mít — Sơn PU bóng",
    quantityPlanned: 2,
    quantityCompleted: 1,
    status: "Đang sản xuất",
    subStage: "phun_son",
    assignedWorker: "Lê Văn Hùng",
    startDate: "2026-03-04",
    expectedEndDate: "2026-03-20",
    date: "2026-03-04T09:00:00",
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
    id: "LSX009",
    code: "LSX-2603-0009",
    orderCode: "DH-2603-0022",
    orderId: "DH022",
    productName: "Kệ sách 5 tầng",
    variantName: "Gỗ thông — Sơn trắng",
    quantityPlanned: 3,
    quantityCompleted: 2,
    status: "Đang sản xuất",
    subStage: "phun_son",
    assignedWorker: "Trần Minh Tâm",
    startDate: "2026-03-06",
    expectedEndDate: "2026-03-18",
    date: "2026-03-06T09:00:00",
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
    status: "Chờ xử lý",
    subStage: null,
    assignedWorker: null,
    startDate: null,
    expectedEndDate: "2026-03-28",
    date: "2026-03-07T08:30:00",
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

const STATUSES = [
  "Tất cả",
  "Chờ xử lý",
  "Đang sản xuất",
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

const getStatusColor = (status) => {
  switch (status) {
    case "Chờ xử lý":
      return { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" };
    case "Đang sản xuất":
      return { bg: "#F5F3FF", text: "#7C3AED", border: "#DDD6FE" };
    case "Hoàn thành":
      return { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" };

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
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1
              className="text-xl font-bold flex items-center gap-2"
              style={{ color: "var(--text-main)" }}
            >
              <Hammer size={22} style={{ color: "var(--brand-primary)" }} />
              Quản lý sản xuất
            </h1>
            <p
              className="text-[13px] mt-0.5"
              style={{ color: "var(--text-placeholder)" }}
            >
              {filtered.length} lệnh sản xuất
            </p>
          </div>
        </div>

        {/* Status Toolbar */}
        <div className="flex items-center gap-2 shrink-0 px-1 flex-wrap">
          {STATUSES.map((s) => {
            const isActive = statusFilter === s;
            const statusStyle = s !== "Tất cả" ? getStatusColor(s) : null;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                style={{
                  backgroundColor: isActive
                    ? (statusStyle ? statusStyle.bg : "#fff")
                    : "transparent",
                  color: isActive
                    ? (statusStyle ? statusStyle.text : "var(--text-main)")
                    : "var(--text-secondary)",
                  border: isActive
                    ? `1.5px solid ${statusStyle ? statusStyle.border : "var(--grid-border)"}`
                    : "1.5px solid transparent",
                }}
              >
                {s !== "Tất cả" && (
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor: statusStyle ? statusStyle.text : "var(--text-secondary)",
                      opacity: isActive ? 1 : 0.5,
                    }}
                  />
                )}
                {s}
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
          {/* Search + Filters */}
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
                placeholder="Tìm mã lệnh, mã đơn, sản phẩm, thợ..."
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

            {/* RIGHT — Date Filters */}
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

          {/* Table */}
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
                    "Mã lệnh SX",
                    "Đơn hàng",
                    "Sản phẩm",
                    "SL kế hoạch",
                    "Đã hoàn thành",
                    "Trạng thái",
                    "Thợ phụ trách",
                    "Thời gian",
                  ].map((h, i) => (
                    <th
                      key={i}
                      className={`px-4 py-3 text-[11px] font-bold uppercase tracking-wider ${i === 3 || i === 4 ? "text-center" : ""}`}
                      style={{ color: "var(--text-placeholder)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((p) => {
                  const sc = getStatusColor(p.status);
                  const progress = p.quantityPlanned > 0 ? Math.round((p.quantityCompleted / p.quantityPlanned) * 100) : 0;
                  return (
                    <tr
                      key={p.id}
                      className="group relative hover:bg-gray-50/50 transition-colors cursor-pointer"
                      style={{ borderBottom: "1px solid var(--grid-border)" }}
                    >
                      <td className="px-4 py-3">
                        <p
                          className="text-[13px] font-bold font-mono"
                          style={{ color: "var(--text-main)" }}
                        >
                          {p.code}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/owner/orders/${p.orderId}`}
                          className="text-[13px] font-semibold hover:underline"
                          style={{ color: "var(--brand-primary)" }}
                        >
                          {p.orderCode}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <p
                          className="text-[13px] font-semibold"
                          style={{ color: "var(--text-main)" }}
                        >
                          {p.productName}
                        </p>
                        <p
                          className="text-[11px]"
                          style={{ color: "var(--text-placeholder)" }}
                        >
                          {p.variantName}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className="text-[13px] font-bold"
                          style={{ color: "var(--text-main)" }}
                        >
                          {p.quantityPlanned}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span
                            className="text-[13px] font-bold"
                            style={{ color: progress === 100 ? "#15803D" : "var(--text-main)" }}
                          >
                            {p.quantityCompleted}/{p.quantityPlanned}
                          </span>
                          {p.status !== "Chờ xử lý" && (
                            <div className="w-14 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${progress}%`,
                                  backgroundColor: progress === 100 ? "#15803D" : "#7C3AED",
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span
                            className="inline-flex items-center px-2.5 py-1 text-[11px] font-bold rounded-md w-fit"
                            style={{
                              backgroundColor: sc.bg,
                              color: sc.text,
                              border: `1px solid ${sc.border}`,
                            }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full mr-1.5"
                              style={{ backgroundColor: sc.text }}
                            ></span>
                            {p.status}
                          </span>
                          {p.subStage && p.status === "Đang sản xuất" && (
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded w-fit"
                              style={{
                                backgroundColor: p.subStage === "danh_rap" ? "#F5F3FF" : "#ECFEFF",
                                color: p.subStage === "danh_rap" ? "#7C3AED" : "#0891B2",
                              }}
                            >
                              {p.subStage === "danh_rap" ? "🔨 Đánh ráp" : "🎨 Phun sơn"}
                            </span>
                          )}

                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {p.assignedWorker ? (
                          <p
                            className="text-[13px] font-semibold"
                            style={{ color: "var(--text-main)" }}
                          >
                            {p.assignedWorker}
                          </p>
                        ) : (
                          <p
                            className="text-[12px] italic"
                            style={{ color: "var(--text-placeholder)" }}
                          >
                            Chưa giao
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div
                          className="flex items-center gap-1.5 text-[12px]"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          <Calendar
                            size={13}
                            style={{ color: "var(--text-placeholder)" }}
                          />
                          {formatDateTime(p.date)}
                        </div>
                      </td>
                      {/* Hover Actions */}
                      <td className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="flex justify-end gap-1.5 bg-white/90 backdrop-blur-sm p-1 rounded-xl shadow-sm border border-gray-100">
                          <Link
                            to={`/owner/production/${p.id}`}
                            className="h-8 px-2.5 rounded-lg flex items-center justify-center transition cursor-pointer hover:bg-gray-100 gap-1.5 text-[12px] font-bold"
                            style={{ color: "var(--text-secondary)" }}
                            title="Xem chi tiết"
                          >
                            <Eye size={14} /> Xem
                          </Link>

                          {p.status === "Chờ xử lý" && (
                            <button
                              className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-[12px] font-bold transition cursor-pointer hover:opacity-80"
                              style={{
                                backgroundColor: "#F5F3FF",
                                color: "#7C3AED",
                                border: "1px solid #DDD6FE",
                              }}
                              title="Giao việc"
                            >
                              <UserPlus size={14} /> Giao việc
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
                {/* Items per page */}
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
                    onClick={() => setCurrentPage((pg) => Math.max(1, pg - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer hover:bg-gray-200 rounded p-1"
                    style={{ color: "var(--text-main)" }}
                  >
                    <ChevronLeft size={16} strokeWidth={2.5} />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage((pg) => Math.min(totalPages, pg + 1))
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
    </>
  );
}
