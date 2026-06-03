/**
 * AccountantProductManage – Kho Hàng (Read-Only)
 * Hiển thị toàn bộ sản phẩm trong kho theo 3 loại:
 *   - Hàng hoàn thiện (FINISHED)
 *   - Hàng thô (RAW)
 *   - Hàng khách đặt (CUSTOM)
 *
 * Created By: HieuNM – 07/03/2026
 * Updated: 12/03/2026 – Gộp tab → filter pill theo loại hàng
 */

import { useState, useMemo, useEffect } from "react";
import {
  Search,
  Package,
  Warehouse,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  CheckCircle,
  Hammer,
  Users,
  AlertTriangle,
  Clock,
  Layers,
  MapPin,
  ShieldCheck,
  Gift,
} from "lucide-react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import ViewProductModal from "./ViewProductModal";
import EditProductModal from "./EditProductModal";
import { toast } from "react-hot-toast";
import { CATEGORIES } from "../mockData";
import inventoryService from "@/services/inventory.service";

// ── Pill config ──────────────────────────────────────────
const TYPE_FILTERS = [
  {
    value: "ALL",
    label: "Tất cả",
    icon: Warehouse,
    activeStyle: { bg: "#F5F3FF", text: "#7C3AED", border: "#DDD6FE" },
  },
  {
    value: "FINISHED",
    label: "Hàng có sẵn",
    icon: CheckCircle,
    activeStyle: { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
  },
  {
    value: "RAW",
    label: "Hàng mộc",
    icon: Hammer,
    activeStyle: { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
  },
  {
    value: "CUSTOM",
    label: "Hàng khách đặt",
    icon: Users,
    activeStyle: { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  },
  {
    value: "LOW_STOCK",
    label: "Dưới định mức",
    icon: AlertTriangle,
    activeStyle: { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA" },
  },
  {
    value: "LONG_STAY",
    label: "Tồn lâu > 60 ngày",
    icon: Clock,
    activeStyle: { bg: "#FFF7ED", text: "#9A3412", border: "#FDBA74" },
  },
/* 
  {
    value: "DEFECTIVE",
    label: "Hàng chờ xử lý",
    icon: AlertTriangle,
    activeStyle: { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA" },
  },
  */
];

const TYPE_BADGE = {
  FINISHED: {
    bg: "#F0FDF4",
    text: "#15803D",
    border: "#BBF7D0",
    label: "Có sẵn",
  },
  RAW: { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA", label: "Hàng mộc" },
  CUSTOM: {
    bg: "#EFF6FF",
    text: "#1D4ED8",
    border: "#BFDBFE",
    label: "Khách đặt",
  },
};

const fmtCurrency = (n) =>
  n != null ? new Intl.NumberFormat("vi-VN").format(n) + "₫" : "—";

// ── Hỗ trợ tính ngày tồn kho ──────────────────────────────
// Dùng hàm thay vì hằng số để luôn lấy ngày hiện tại, tránh lỗi -1 khi nhập hàng mới
const getToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0); // chuẩn về 00:00:00 để so sánh theo ngày
  return d;
};

const normalizeDate = (d) => {
  const nd = new Date(d);
  nd.setHours(0, 0, 0, 0);
  return nd;
};

const getImportDateRange = (p) => {
  let dates = [];
  if (p.lots && p.lots.length > 0) {
    p.lots.forEach((lot) => {
      if (lot.importDate) dates.push(normalizeDate(lot.importDate));
      if (lot.units) {
        lot.units.forEach((u) => {
          if (u.importDate) dates.push(normalizeDate(u.importDate));
        });
      }
    });
  } else if (p.importedAt) {
    dates.push(normalizeDate(p.importedAt));
  }
  if (dates.length === 0) return null;

  dates.sort((a, b) => a.getTime() - b.getTime());
  return { first: dates[0], last: dates[dates.length - 1] };
};

const getDaysInStock = (p) => {
  const range = getImportDateRange(p);
  if (!range) return null;
  return Math.max(0, Math.floor((getToday() - range.first) / (1000 * 60 * 60 * 24)));
};

const fmtShortDate = (d) =>
  d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

// Ngưỡng: <30 OK, 30-60 chú ý, >60 cảnh báo
const getDaysStyle = (days) => {
  if (days === null) return null;
  if (days > 60)
    return {
      bg: "#FEF2F2",
      text: "#DC2626",
      border: "#FECACA",
      label: `${days} ngày`,
    };
  if (days > 30)
    return {
      bg: "#FFFBEB",
      text: "#D97706",
      border: "#FDE68A",
      label: `${days} ngày`,
    };
  return {
    bg: "#F0FDF4",
    text: "#15803D",
    border: "#BBF7D0",
    label: `${days} ngày`,
  };
};

const LONG_STAY_DAYS = 60; // ngưỡng cảnh báo tồn lâu

export default function AccountantProductManage() {
  const [products, setProducts] = useState([]);
  const [counts, setCounts] = useState({
    ALL: 0, FINISHED: 0, RAW: 0, CUSTOM: 0,
    LOW_STOCK: 0, LONG_STAY: 0, DEFECTIVE: 0
  });
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);

  const [editProduct, setEditProduct] = useState(null);
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("Tất cả");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [viewProduct, setViewProduct] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await inventoryService.getInventoryProducts({
        page: currentPage,
        limit: itemsPerPage,
        search: search.trim(),
        category: categoryFilter,
        typeFilter: typeFilter,
      });
      setProducts(res.data || []);
      setCounts(res.counts || {});
      setTotalItems(res.pagination?.totalItems || 0);
    } catch (error) {
      console.error("Lỗi khi tải kho hàng:", error);
      toast.error("Không thể tải dữ liệu kho hàng!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, itemsPerPage, search, categoryFilter, typeFilter]);

  const handleSaveProduct = async (updated) => {
    try {
      setLoading(true);
      // Truyền imgUrl nếu ảnh thay đổi (khác ảnh gốc trong editProduct)
      const imgChanged = updated.img !== editProduct?.img;
      await inventoryService.updateMinStock(
        updated.id,
        updated.minStock,
        imgChanged ? updated.img : undefined  // undefined = không thay đổi ảnh
      );

      // Cập nhật local state ngay lập tức để UI phản hồi nhanh
      setProducts(prev => prev.map(p =>
        p.id === updated.id
          ? { ...p, minStock: updated.minStock, img: imgChanged ? updated.img : p.img }
          : p
      ));

      setEditProduct(null);
      toast.success("Đã cập nhật sản phẩm!");
      fetchProducts(); // Refresh từ server để đảm bảo đồng bộ
    } catch (error) {
      console.error("Lỗi khi cập nhật sản phẩm:", error);
      toast.error("Không thể lưu thay đổi!");
    } finally {
      setLoading(false);
    }
  };

  // Đã bỏ logic filter local vì API đã xử lý
  const paginated = products;
  const filteredLength = totalItems;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  const TH = ({ children, right, center }) => (
    <th
      className={`px-4 py-3 text-[11px] font-bold uppercase tracking-wider ${right ? "text-right" : center ? "text-center" : ""}`}
      style={{ color: "var(--text-placeholder)" }}
    >
      {children}
    </th>
  );



  return (
    <>
      <PageHelmet title="Kho hàng | Kế toán" />
      <div
        className="flex flex-col h-[calc(100vh-64px)] -m-6 p-6 space-y-4"
        style={{ backgroundColor: "var(--bg-main)" }}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1
              className="text-xl font-bold flex items-center gap-2"
              style={{ color: "var(--text-main)" }}
            >
              <Warehouse size={22} style={{ color: "var(--brand-primary)" }} />
              Kho hàng
            </h1>
            <p
              className="text-[13px] mt-0.5"
              style={{ color: "var(--text-placeholder)" }}
            >
              {totalItems} sản phẩm
              {typeFilter !== "ALL" &&
                ` · ${TYPE_FILTERS.find((t) => t.value === typeFilter)?.label}`}
            </p>
            {typeFilter === "LOW_STOCK" && (
              <p
                className="text-[12px] mt-0.5 font-medium"
                style={{ color: "#DC2626" }}
              >
                ⚠️ Các sản phẩm này cần nhập hàng bổ sung
              </p>
            )}
            {typeFilter === "LONG_STAY" && (
              <p
                className="text-[12px] mt-0.5 font-medium"
                style={{ color: "#9A3412" }}
              >
                ⏰ Hàng tồn trong kho quá {LONG_STAY_DAYS} ngày, cần xem xét xử
                lý
              </p>
            )}
            {typeFilter === "DEFECTIVE" && (
              <p
                className="text-[12px] mt-0.5 font-medium"
                style={{ color: "#DC2626" }}
              >
                ⚠️ Các sản phẩm này có đơn vị hàng lỗi, cần tiến hành xử lý
              </p>
            )}
          </div>
        </div>

        {/* ── Filter pills theo loại hàng ── */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {TYPE_FILTERS.map((tf) => {
            const isActive = typeFilter === tf.value;
            const Icon = tf.icon;
            const s = tf.activeStyle;
            return (
              <button
                key={tf.value}
                onClick={() => setTypeFilter(tf.value)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all cursor-pointer"
                style={{
                  backgroundColor: isActive ? s.bg : "transparent",
                  color: isActive ? s.text : "var(--text-secondary)",
                  border: isActive
                    ? `1.5px solid ${s.border}`
                    : "1.5px solid transparent",
                }}
              >
                <Icon size={13} style={{ opacity: isActive ? 1 : 0.5 }} />
                {tf.label}
              </button>
            );
          })}
        </div>

        {/* ── Table card ── */}
        <div
          className="flex flex-col bg-white rounded-2xl flex-1 overflow-hidden"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
        >
          {/* Toolbar: search + category */}
          <div
            className="px-4 py-3 border-b shrink-0 flex flex-wrap items-center gap-3"
            style={{ borderColor: "var(--grid-border)" }}
          >
            <div className="relative w-full max-w-sm">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-placeholder)" }}
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm mã sản phẩm, tên, loại..."
                className="w-full h-9 pl-10 pr-8 rounded-lg text-[13px] focus:outline-none focus:ring-2 transition"
                style={{
                  border: "1px solid var(--grid-border)",
                  backgroundColor: "var(--bg-main)",
                  color: "var(--text-main)",
                }}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
                  style={{ color: "var(--text-placeholder)" }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Danh mục */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-9 px-3 rounded-lg text-[13px] outline-none cursor-pointer shrink-0"
              style={{
                border: "1px solid var(--grid-border)",
                color: "var(--text-main)",
                backgroundColor: "#fff",
              }}
            >
              <option value="Tất cả">Tất cả danh mục</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {(search || categoryFilter !== "Tất cả") && (
              <button
                onClick={() => {
                  setSearch("");
                  setCategoryFilter("Tất cả");
                }}
                className="h-9 px-3 rounded-lg text-[13px] font-medium flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition"
                style={{
                  color: "#DC2626",
                  backgroundColor: "#FEF2F2",
                  border: "1px solid #FECACA",
                }}
              >
                <X size={14} /> Xóa bộ lọc
              </button>
            )}
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
                  <TH>Ảnh</TH>
                  <TH>Mã sản phẩm</TH>
                  <TH>Tên sản phẩm</TH>
                  <TH>Danh mục</TH>
                  <TH>Loại hàng</TH>
                  <TH>Chất liệu</TH>
                  <TH>Màu sắc</TH>
                  <TH>Tồn từ</TH>
                  <TH center>Chi tiết tồn kho</TH>
                  <th className="w-24 px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((p) => {
                  const badge = TYPE_BADGE[p.type];
                  return (
                    <tr
                      key={p.id}
                      className="group relative hover:bg-gray-50/50 transition-colors"
                      style={{ borderBottom: "1px solid var(--grid-border)" }}
                    >
                      {/* Ảnh */}
                      <td className="px-4 py-3">
                        {p.img ? (
                          <img
                            src={p.img}
                            alt={p.name}
                            className="w-10 h-10 rounded-lg object-cover"
                            style={{ border: "1px solid var(--grid-border)" }}
                          />
                        ) : (
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{
                              backgroundColor: "var(--bg-main)",
                              border: "1px solid var(--grid-border)",
                            }}
                          >
                            <ImageIcon
                              size={16}
                              style={{ color: "var(--text-placeholder)" }}
                            />
                          </div>
                        )}
                      </td>
                      {/* Mã sản phẩm */}
                      <td className="px-4 py-3">
                        <span
                          className="text-[12px] font-bold font-mono px-2 py-1 rounded"
                          style={{
                            backgroundColor: "var(--bg-main)",
                            color: "var(--text-main)",
                            border: "1px solid var(--grid-border)",
                          }}
                        >
                          {p.sku}
                        </span>
                      </td>
                      {/* Tên */}
                      <td className="px-4 py-3 max-w-[240px]">
                        <div>
                          <p
                            className="text-[13px] font-semibold truncate"
                            style={{ color: "var(--text-main)" }}
                          >
                            {p.name}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {p.isBundle && p.bundleItems && (
                              <span
                                className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                                style={{
                                  backgroundColor: "#F5F3FF",
                                  color: "#7C3AED",
                                  border: "1px solid #EDE9FE",
                                }}
                              >
                                <Layers size={9} /> {p.bundleItems.length} món lẻ
                              </span>
                            )}
                            {p.room && (
                              <span
                                className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                                style={{
                                  backgroundColor: "#F0F9FF",
                                  color: "#0369A1",
                                  border: "1px solid #BAE6FD",
                                }}
                              >
                                <MapPin size={9} /> {p.room}
                              </span>
                            )}
                            {p.warrantyMonths != null && (
                              <span
                                className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                                style={{
                                  backgroundColor: "#EFF6FF",
                                  color: "#1D4ED8",
                                  border: "1px solid #BFDBFE",
                                }}
                              >
                                <ShieldCheck size={9} /> {p.warrantyMonths}th
                              </span>
                            )}
                            {p.isGift && (
                              <span
                                className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                                style={{
                                  backgroundColor: "#FDF4FF",
                                  color: "#7C3AED",
                                  border: "1px solid #E9D5FF",
                                }}
                              >
                                <Gift size={9} /> Quà tặng
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      {/* Danh mục */}
                      <td className="px-4 py-3">
                        <span
                          className="inline-block px-2.5 py-1 text-[11px] font-bold rounded-md"
                          style={{
                            backgroundColor: "var(--bg-main)",
                            color: "var(--text-secondary)",
                            border: "1px solid var(--grid-border)",
                          }}
                        >
                          {p.category}
                        </span>
                      </td>
                      {/* Loại hàng */}
                      <td className="px-4 py-3">
                        <span
                          className="inline-block px-2.5 py-1 text-[11px] font-bold rounded-md"
                          style={{
                            backgroundColor: badge.bg,
                            color: badge.text,
                            border: `1px solid ${badge.border}`,
                          }}
                        >
                          {badge.label}
                        </span>
                      </td>
                      {/* Loại */}
                      <td className="px-4 py-3">
                        <span
                          className="text-[12px]"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {p.materialType || "—"}
                        </span>
                      </td>
                      {/* Màu */}
                      <td className="px-4 py-3">
                        <span
                          className="text-[12px]"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {p.color || "—"}
                        </span>
                      </td>
                      {/* Tồn từ (ngày) */}
                      <td className="px-4 py-3">
                        {(() => {
                          const range = getImportDateRange(p);
                          if (!range)
                            return (
                              <span
                                className="text-[12px]"
                                style={{ color: "var(--text-placeholder)" }}
                              >
                                —
                              </span>
                            );

                          const today = getToday();
                          const daysOldest = Math.max(0, Math.floor(
                            (today - range.first) / (1000 * 60 * 60 * 24),
                          ));
                          const daysNewest = Math.max(0, Math.floor(
                            (today - range.last) / (1000 * 60 * 60 * 24),
                          ));
                          const text =
                            daysOldest === daysNewest
                              ? `${daysOldest} ngày`
                              : `${daysNewest} - ${daysOldest} ngày`;

                          const ds = getDaysStyle(daysOldest);

                          return (
                            <span
                              className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md"
                              style={{
                                backgroundColor: ds.bg,
                                color: ds.text,
                                border: `1px solid ${ds.border}`,
                              }}
                            >
                              <Clock size={10} />
                              {text}
                            </span>
                          );
                        })()}
                      </td>

                      {/* Tồn kho chi tiết */}
                      <td className="px-4 py-3 align-top">
                        <div className="flex flex-col gap-0.5 w-full min-w-[110px]">
                          <div className="text-[10px] font-bold text-gray-500 uppercase flex justify-between items-center mb-1 pb-1 border-b border-gray-100">
                            <span>Tổng:</span>
                            <span className="text-[12px] text-gray-900">
                              {p.stock}
                            </span>
                          </div>
                          {p.stockBreakdown ? (
                            <>
                              {p.stockBreakdown.available >= 0 && (
                                <div className="flex justify-between items-center text-[11px] leading-tight">
                                  <span className="text-green-600 font-semibold flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>{" "}
                                    Sẵn sàng:
                                  </span>
                                  <span
                                    className="font-bold flex items-center gap-1"
                                    style={{
                                      color:
                                        p.stockBreakdown.available === 0
                                          ? "#DC2626"
                                          : p.minStock != null &&
                                              p.stockBreakdown.available <=
                                                p.minStock
                                            ? "#D97706"
                                            : "#15803D",
                                    }}
                                  >
                                    {p.stockBreakdown.available}
                                    {p.minStock != null &&
                                      p.stockBreakdown.available <=
                                        p.minStock && (
                                        <AlertTriangle
                                          size={10}
                                          style={{
                                            color:
                                              p.stockBreakdown.available === 0
                                                ? "#DC2626"
                                                : "#D97706",
                                          }}
                                          title={`Sắp hết hàng (Dưới định mức tối thiểu: ${p.minStock})`}
                                        />
                                      )}
                                  </span>
                                </div>
                              )}
                              {p.stockBreakdown.processing > 0 &&
                                p.type !== "FINISHED" && (
                                  <div className="flex justify-between items-center text-[11px] leading-tight mt-0.5">
                                    <span className="text-orange-600 font-semibold flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>{" "}
                                      Gia công:
                                    </span>
                                    <span className="font-bold text-orange-700">
                                      {p.stockBreakdown.processing}
                                    </span>
                                  </div>
                                )}
{/* p.stockBreakdown.defective > 0 && (
                                <div className="flex justify-between items-center text-[11px] leading-tight mt-0.5">
                                  <span className="text-red-500 font-semibold flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>{" "}
                                    Lỗi:
                                  </span>
                                  <span className="font-bold text-red-600">
                                    {p.stockBreakdown.defective}
                                  </span>
                                </div>
                              )*/ }
                              {p.stockBreakdown.delivering > 0 && (
                                <div className="flex justify-between items-center text-[11px] leading-tight mt-0.5">
                                  <span className="text-blue-600 font-semibold flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>{" "}
                                    Chờ giao:
                                  </span>
                                  <span className="font-bold text-blue-700">
                                    {p.stockBreakdown.delivering}
                                  </span>
                                </div>
                              )}
                            </>
                          ) : (
                            <span className="text-[12px] font-bold text-gray-400">
                              Không có dữ liệu
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Spacer */}
                      <td className="px-4 py-3"></td>

                      {/* Hover action */}
                      <td className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="flex gap-1.5 bg-white/90 backdrop-blur-sm p-1 rounded-xl shadow-sm border border-gray-100">
                          <button
                            onClick={() => setViewProduct(p)}
                            className="h-8 px-2.5 rounded-lg flex items-center gap-1.5 text-[12px] font-bold hover:bg-gray-100 cursor-pointer transition"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            <Eye size={14} /> Xem
                          </button>
                          <button
                            onClick={() => setEditProduct(p)}
                            className="h-8 px-2.5 rounded-lg flex items-center gap-1.5 text-[12px] font-bold hover:bg-blue-50 cursor-pointer transition"
                            style={{ color: "var(--brand-primary)" }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M12 22h6" />
                              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                            </svg>
                            Sửa
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {loading ? (
                  <tr>
                    <td colSpan={10} className="py-24 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <div className="w-8 h-8 border-4 border-gray-200 border-t-[var(--brand-primary)] rounded-full animate-spin mb-4"></div>
                        <p className="text-sm font-medium">Đang tải dữ liệu...</p>
                      </div>
                    </td>
                  </tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-24 text-center">
                      <div
                        className="flex flex-col items-center gap-2"
                        style={{ color: "var(--text-placeholder)" }}
                      >
                        <div
                          className="w-16 h-16 rounded-2xl flex items-center justify-center"
                          style={{ backgroundColor: "var(--bg-main)" }}
                        >
                          <Package size={28} strokeWidth={1.5} />
                        </div>
                        <p className="text-sm font-medium mt-1">
                          {search
                            ? `Không tìm thấy "${search}"`
                            : "Không có sản phẩm nào"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalItems > 0 && (
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
                Tổng:{" "}
                <span
                  className="font-bold"
                  style={{ color: "var(--text-main)" }}
                >
                  {totalItems}
                </span>{" "}
                sản phẩm
              </div>
              <div className="flex items-center gap-5">
                <div className="flex items-center gap-2">
                  <span
                    className="text-[13px]"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Bản ghi/trang
                  </span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="h-8 px-2 pr-6 rounded-md text-[13px] border cursor-pointer appearance-none"
                    style={{
                      borderColor: "var(--grid-border)",
                      backgroundColor: "#fff",
                      color: "var(--text-main)",
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 8px center",
                    }}
                  >
                    {[15, 30, 50].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
                <span
                  className="text-[13px]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <span
                    className="font-bold"
                    style={{ color: "var(--text-main)" }}
                  >
                    {(currentPage - 1) * itemsPerPage + 1}–
                    {Math.min(currentPage * itemsPerPage, totalItems)}
                  </span>{" "}
                  sản phẩm
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1 rounded disabled:opacity-30 hover:bg-gray-200 cursor-pointer"
                    style={{ color: "var(--text-main)" }}
                  >
                    <ChevronLeft size={16} strokeWidth={2.5} />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage >= totalPages}
                    className="p-1 rounded disabled:opacity-30 hover:bg-gray-200 cursor-pointer"
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
      {viewProduct && (
        <ViewProductModal
          product={viewProduct}
          onClose={() => setViewProduct(null)}
          onRefreshInventory={fetchProducts}
        />
      )}
      {editProduct && (
        <EditProductModal
          product={editProduct}
          onClose={() => setEditProduct(null)}
          onSave={handleSaveProduct}
        />
      )}
    </>
  );
}
