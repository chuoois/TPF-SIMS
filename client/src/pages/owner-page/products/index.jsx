/**
 * Component OwnerProducts
 * Quản lý Sản phẩm — Chủ cửa hàng
 *
 * Nghiệp vụ trạng thái sản phẩm:
 *  - "Đang kinh doanh": SP được hiển thị trên hệ thống bán hàng, có thể đặt hàng
 *  - "Ngừng kinh doanh": SP không còn bán / ẩn khỏi danh sách bán hàng
 *  - Chủ xưởng toggle trạng thái qua nút hành động
 *
 * Created Date: 06/03/2026
 */

import { useState, useMemo, useEffect } from "react";
import {
  Search,
  Plus,
  Package,
  Warehouse,
  Ruler,
  Pencil,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Power,
  Ban,
} from "lucide-react";
import { PageHelmet } from "@/components/seo/PageHelmet";

// ===================== MOCK DATA =====================
const CATEGORIES = [
  { id: "C01", name: "Phòng khách", count: 12 },
  { id: "C02", name: "Phòng ngủ", count: 8 },
  { id: "C03", name: "Phòng thờ", count: 15 },
  { id: "C04", name: "Phòng ăn", count: 6 },
];

const WOOD_TYPES = ["Gỗ hương đá", "Gỗ gõ đỏ", "Gỗ sồi Nga", "Gỗ gụ mật", "Gỗ xà cừ"];
const COLORS = ["Cánh gián", "Trần (giữ vân)", "Óc chó", "Hương", "Chưa sơn (Mộc)"];

const INITIAL_PRODUCTS = [
  { id: "P001", code: "SP-PK-001", name: "Bộ bàn ghế Nghê Bảo Đỉnh 6 món", category: "Phòng khách", type: "FINISHED", status: "Đang kinh doanh", stock: 5, img: "https://placehold.co/100x100?text=BanGhe" },
  { id: "P002", code: "SP-PK-002", name: "Sofa nguyên khối chữ L (Mộc)", category: "Phòng khách", type: "RAW", status: "Đang kinh doanh", stock: 12, img: "https://placehold.co/100x100?text=Sofa" },
  { id: "P003", code: "SP-PT-001", name: "Sập thờ Mai Điểu chân 20", category: "Phòng thờ", type: "FINISHED", status: "Đang kinh doanh", stock: 2, img: "https://placehold.co/100x100?text=SapTho" },
  { id: "P004", code: "SP-PN-001", name: "Giường ngủ hoa hồng Tân cổ điển (Thô)", category: "Phòng ngủ", type: "RAW", status: "Đang kinh doanh", stock: 8, img: null },
  { id: "P005", code: "SP-PT-002", name: "Hoành phi câu đối chạm rồng", category: "Phòng thờ", type: "FINISHED", status: "Đang kinh doanh", stock: 6, img: "https://placehold.co/100x100?text=HoanhPhi" },
  { id: "P006", code: "SP-PA-001", name: "Bộ bàn ăn 8 ghế nguyên khối", category: "Phòng ăn", type: "FINISHED", status: "Đang kinh doanh", stock: 3, img: "https://placehold.co/100x100?text=BanAn" },
  { id: "P007", code: "SP-PK-003", name: "Kệ tivi nguyên khối mặt liền", category: "Phòng khách", type: "FINISHED", status: "Ngừng kinh doanh", stock: 0, img: null },
  { id: "P008", code: "SP-PN-002", name: "Tủ quần áo 4 cánh chạm hoa lá tây", category: "Phòng ngủ", type: "FINISHED", status: "Đang kinh doanh", stock: 4, img: "https://placehold.co/100x100?text=TuAo" },
  { id: "P009", code: "SP-PT-003", name: "Bàn thờ chạm rồng cuốn thủy", category: "Phòng thờ", type: "RAW", status: "Đang kinh doanh", stock: 7, img: "https://placehold.co/100x100?text=BanTho" },
  { id: "P010", code: "SP-PK-004", name: "Tủ rượu nguyên khối cánh kính", category: "Phòng khách", type: "FINISHED", status: "Ngừng kinh doanh", stock: 1, img: null },
];

// Hàng sẵn (Stock items — có sẵn trong kho, bán ngay)
const STOCK_ITEMS = [
  { id: "HS001", code: "HS-PK-001", name: "Bộ bàn ghế Nghê Bảo Đỉnh 6 món", woodType: "Gỗ hương đá", color: "Cánh gián", retailPrice: 55000000, stock: 3, status: "Đang kinh doanh" },
  { id: "HS002", code: "HS-PK-002", name: "Sofa nguyên khối chữ L", woodType: "Gỗ hương đá", color: "Chưa sơn (Mộc)", retailPrice: 35000000, stock: 8, status: "Đang kinh doanh" },
  { id: "HS003", code: "HS-PT-001", name: "Sập thờ Mai Điểu chân 20", woodType: "Gỗ gụ mật", color: "Cánh gián", retailPrice: 25000000, stock: 2, status: "Đang kinh doanh" },
  { id: "HS004", code: "HS-PA-001", name: "Bộ bàn ăn 8 ghế nguyên khối", woodType: "Gỗ hương đá", color: "Cánh gián", retailPrice: 48000000, stock: 3, status: "Đang kinh doanh" },
  { id: "HS005", code: "HS-PK-003", name: "Kệ tivi nguyên khối mặt liền", woodType: "Gỗ gõ đỏ", color: "Trần (giữ vân)", retailPrice: 32000000, stock: 0, status: "Ngừng kinh doanh" },
  { id: "HS006", code: "HS-PN-001", name: "Giường ngủ hoa hồng Tân cổ điển", woodType: "Gỗ sồi Nga", color: "Óc chó", retailPrice: 22000000, stock: 4, status: "Đang kinh doanh" },
];

// Đặt theo mẫu (Made to order — khách chọn mẫu sản phẩm, xưởng gia công)
const CUSTOM_MODELS = [
  { id: "DTM001", code: "M-PK-001", name: "Bộ bàn ghế Nghê Bảo Đỉnh 6 món", category: "Phòng khách", minPrice: 42000000, maxPrice: 65000000, leadTime: "25–35 ngày", woodOptions: "Gỗ hương, Gỗ gõ đỏ", status: "Đang nhận đơn" },
  { id: "DTM002", code: "M-PN-001", name: "Giường ngủ hoa hồng Tân cổ điển", category: "Phòng ngủ", minPrice: 15000000, maxPrice: 35000000, leadTime: "20–30 ngày", woodOptions: "Gỗ sồi, Gỗ gõ đỏ", status: "Đang nhận đơn" },
  { id: "DTM003", code: "M-PT-001", name: "Sập thờ Mai Điểu", category: "Phòng thờ", minPrice: 18000000, maxPrice: 45000000, leadTime: "30–45 ngày", woodOptions: "Gỗ gụ, Gỗ hương", status: "Đang nhận đơn" },
  { id: "DTM004", code: "M-PT-002", name: "Bàn thờ chạm rồng cuốn thủy", category: "Phòng thờ", minPrice: 25000000, maxPrice: 55000000, leadTime: "35–50 ngày", woodOptions: "Gỗ mít, Gỗ hương", status: "Đang nhẫn đơn" },
  { id: "DTM005", code: "M-PA-001", name: "Bộ bàn ăn 8 ghế nguyên khối", category: "Phòng ăn", minPrice: 35000000, maxPrice: 60000000, leadTime: "25–40 ngày", woodOptions: "Gỗ hương, Gỗ sồi", status: "Tạm ngưng" },
];

const TABS = [
  { id: "products", label: "Sản phẩm", icon: Package },
  { id: "stock", label: "Hàng sẵn", icon: Warehouse },
  { id: "custom", label: "Đặt theo mẫu", icon: Ruler },
];

// Trạng thái nghiệp vụ sản phẩm: chỉ có 2
const PRODUCT_STATUSES = ["Tất cả", "Đang kinh doanh", "Ngừng kinh doanh"];
const PRODUCT_TYPES = ["Tất cả", "Hàng Mộc", "Hoàn thiện"];

// ===================== HELPERS =====================
const fmtCurrency = (n) => new Intl.NumberFormat("vi-VN").format(n) + "₫";

const getStatusColor = (status) => {
  switch (status) {
    case "Đang kinh doanh":
      return { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" };
    case "Ngừng kinh doanh":
      return { bg: "#F3F4F6", text: "#6B7280", border: "#D1D5DB" };
    default:
      return { bg: "#F3F4F6", text: "#6B7280", border: "#E5E7EB" };
  }
};

// ===================== COMPONENT =====================
export default function OwnerProducts() {
  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState(INITIAL_PRODUCTS);

  // Products filters
  const [productSearch, setProductSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [typeFilter, setTypeFilter] = useState("Tất cả");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  // Variants (now stock) filters
  const [stockSearch, setStockSearch] = useState("");
  const [woodFilter, setWoodFilter] = useState("");
  const [colorFilter, setColorFilter] = useState("");
  const [customSearch, setCustomSearch] = useState("");

  // ═══ TOGGLE TRẠNG THÁI SẢN PHẨM ═══
  const toggleProductStatus = (productId) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              status: p.status === "Đang kinh doanh" ? "Ngừng kinh doanh" : "Đang kinh doanh",
            }
          : p,
      ),
    );
  };

  // Count per status
  const statusCounts = useMemo(() => {
    const counts = { "Tất cả": products.length, "Đang kinh doanh": 0, "Ngừng kinh doanh": 0 };
    products.forEach((p) => { counts[p.status] = (counts[p.status] || 0) + 1; });
    return counts;
  }, [products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    let result = products;
    if (statusFilter !== "Tất cả") {
      result = result.filter((p) => p.status === statusFilter);
    }
    if (typeFilter !== "Tất cả") {
      const typeKey = typeFilter === "Hàng Mộc" ? "RAW" : "FINISHED";
      result = result.filter((p) => p.type === typeKey);
    }
    if (productSearch.trim()) {
      const q = productSearch.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q),
      );
    }
    return result;
  }, [products, statusFilter, typeFilter, productSearch]);

  // Filtered stock items
  const filteredStock = useMemo(() => {
    let result = STOCK_ITEMS;
    if (woodFilter) result = result.filter((v) => v.woodType === woodFilter);
    if (colorFilter) result = result.filter((v) => v.color === colorFilter);
    if (stockSearch.trim()) {
      const q = stockSearch.toLowerCase();
      result = result.filter(
        (v) => v.code.toLowerCase().includes(q) || v.name.toLowerCase().includes(q),
      );
    }
    return result;
  }, [woodFilter, colorFilter, stockSearch]);

  // Filtered custom models
  const filteredCustom = useMemo(() => {
    let result = CUSTOM_MODELS;
    if (customSearch.trim()) {
      const q = customSearch.toLowerCase();
      result = result.filter(
        (m) => m.code.toLowerCase().includes(q) || m.name.toLowerCase().includes(q),
      );
    }
    return result;
  }, [customSearch]);

  const hasActiveProductFilters = statusFilter !== "Tất cả" || typeFilter !== "Tất cả" || productSearch;

  const clearProductFilters = () => {
    setStatusFilter("Tất cả");
    setTypeFilter("Tất cả");
    setProductSearch("");
  };

  useEffect(() => { setCurrentPage(1); }, [productSearch, statusFilter, typeFilter]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // ===================== RENDER =====================
  return (
    <>
      <PageHelmet title="Sản phẩm - Chủ cửa hàng | TPF-SIMS" />

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
              Quản lý sản phẩm
            </h1>
            <p className="text-[13px] mt-0.5" style={{ color: "var(--text-placeholder)" }}>
              {activeTab === "products" && `${filteredProducts.length} sản phẩm`}
              {activeTab === "stock" && `${filteredStock.length} hàng sẵn`}
              {activeTab === "custom" && `${filteredCustom.length} mẫu đặt`}
            </p>
          </div>

          {/* Tab Switcher */}
          <div
            className="flex p-1 rounded-xl"
            style={{ backgroundColor: "var(--grid-header-bg)", border: "1px solid var(--grid-border)" }}
          >
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-all cursor-pointer"
                  style={{
                    backgroundColor: activeTab === tab.id ? "#fff" : "transparent",
                    color: activeTab === tab.id ? "var(--text-main)" : "var(--text-secondary)",
                    boxShadow: activeTab === tab.id ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                  }}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ════════ TAB: SẢN PHẨM ════════ */}
        {activeTab === "products" && (
          <>
            {/* Status + Type Toolbar */}
            <div className="flex items-center gap-2 shrink-0 px-1 flex-wrap">
              {PRODUCT_STATUSES.map((s) => {
                const isActive = statusFilter === s;
                const sc = s !== "Tất cả" ? getStatusColor(s) : null;
                return (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                    style={{
                      backgroundColor: isActive ? (sc ? sc.bg : "#fff") : "transparent",
                      color: isActive ? (sc ? sc.text : "var(--text-main)") : "var(--text-secondary)",
                      border: isActive
                        ? `1.5px solid ${sc ? sc.border : "var(--grid-border)"}`
                        : "1.5px solid transparent",
                    }}
                  >
                    {s !== "Tất cả" && (
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: sc ? sc.text : "var(--text-secondary)", opacity: isActive ? 1 : 0.5 }}
                      />
                    )}
                    {s}
                    <span className="text-[11px] opacity-60">({statusCounts[s] || 0})</span>
                  </button>
                );
              })}
            </div>

            {/* Search + Table Card */}
            <div
              className="flex flex-col bg-white rounded-2xl flex-1 overflow-hidden"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)" }}
            >
              {/* Search bar */}
              <div
                className="px-4 py-3 border-b shrink-0 flex flex-wrap items-center justify-between gap-3"
                style={{ borderColor: "var(--grid-border)" }}
              >
                <div className="relative w-full max-w-md shrink-0">
                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--text-placeholder)" }}
                  />
                  <input
                    type="text"
                    placeholder="Tìm mã sản phẩm, tên sản phẩm..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full h-9 pl-10 pr-8 rounded-lg text-[13px] focus:outline-none focus:ring-2 transition"
                    style={{
                      border: "1px solid var(--grid-border)",
                      backgroundColor: "var(--bg-main)",
                      color: "var(--text-main)",
                    }}
                  />
                  {productSearch && (
                    <button
                      onClick={() => setProductSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
                      style={{ color: "var(--text-placeholder)" }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Type filter: Hàng Mộc / Hoàn thiện */}
                  <div className="flex p-0.5 rounded-lg" style={{ backgroundColor: "var(--bg-main)", border: "1px solid var(--grid-border)" }}>
                    {PRODUCT_TYPES.map((t) => {
                      const isActive = typeFilter === t;
                      return (
                        <button
                          key={t}
                          onClick={() => setTypeFilter(t)}
                          className="px-3 py-1 rounded-md text-[12px] font-semibold transition-all cursor-pointer"
                          style={{
                            backgroundColor: isActive ? "#fff" : "transparent",
                            color: isActive
                              ? (t === "Hàng Mộc" ? "#C2410C" : t === "Hoàn thiện" ? "#15803D" : "var(--text-main)")
                              : "var(--text-secondary)",
                            boxShadow: isActive ? "0 1px 2px rgba(0,0,0,0.08)" : "none",
                          }}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>

                  {hasActiveProductFilters && (
                    <button
                      onClick={clearProductFilters}
                      className="h-9 px-3 rounded-lg text-[13px] font-medium flex items-center gap-1.5 cursor-pointer transition hover:opacity-80"
                      style={{ color: "#DC2626", backgroundColor: "#FEF2F2", border: "1px solid #FECACA" }}
                    >
                      <X size={14} /> Xóa bộ lọc
                    </button>
                  )}
                  <button
                    className="h-9 px-4 rounded-lg flex items-center gap-2 text-[13px] font-bold transition hover:opacity-90 cursor-pointer"
                    style={{ backgroundColor: "var(--brand-primary)", color: "#fff" }}
                  >
                    <Plus size={16} /> Thêm sản phẩm
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-left relative">
                  <thead
                    className="sticky top-0 z-10"
                    style={{ backgroundColor: "var(--grid-header-bg)", borderBottom: "1px solid var(--grid-border)" }}
                  >
                    <tr>
                      {["Ảnh", "Mã SP", "Tên sản phẩm", "Danh mục", "Loại hàng", "Trạng thái", "Tồn kho"].map((h, i) => (
                        <th
                          key={i}
                          className={`px-4 py-3 text-[11px] font-bold uppercase tracking-wider ${i === 6 ? "text-center" : ""}`}
                          style={{ color: "var(--text-placeholder)" }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedProducts.map((p) => {
                      const sc = getStatusColor(p.status);
                      const isStopped = p.status === "Ngừng kinh doanh";
                      return (
                        <tr
                          key={p.id}
                          className="group relative hover:bg-gray-50/50 transition-colors cursor-pointer"
                          style={{
                            borderBottom: "1px solid var(--grid-border)",
                            opacity: isStopped ? 0.55 : 1,
                          }}
                        >
                          <td className="px-4 py-3">
                            {p.img ? (
                              <img
                                src={p.img}
                                alt={p.name}
                                className="w-10 h-10 rounded-lg object-cover"
                                style={{
                                  border: "1px solid var(--grid-border)",
                                  filter: isStopped ? "grayscale(100%)" : "none",
                                }}
                              />
                            ) : (
                              <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: "var(--bg-main)", border: "1px solid var(--grid-border)" }}
                              >
                                <ImageIcon size={16} style={{ color: "var(--text-placeholder)" }} />
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-[13px] font-bold font-mono" style={{ color: "var(--text-main)" }}>{p.code}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p
                              className="text-[13px] font-semibold"
                              style={{
                                color: "var(--text-main)",
                                textDecoration: isStopped ? "line-through" : "none",
                              }}
                            >
                              {p.name}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className="inline-block px-2.5 py-1 text-[11px] font-bold rounded-md"
                              style={{ backgroundColor: "var(--bg-main)", color: "var(--text-secondary)", border: "1px solid var(--grid-border)" }}
                            >
                              {p.category}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className="inline-block px-2.5 py-1 text-[11px] font-bold rounded-md"
                              style={{
                                backgroundColor: p.type === "RAW" ? "#FFF7ED" : "#F0FDF4",
                                color: p.type === "RAW" ? "#C2410C" : "#15803D",
                                border: `1px solid ${p.type === "RAW" ? "#FED7AA" : "#BBF7D0"}`,
                              }}
                            >
                              {p.type === "RAW" ? "Hàng Mộc" : "Hoàn thiện"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className="inline-flex items-center px-2.5 py-1 text-[11px] font-bold rounded-md"
                              style={{ backgroundColor: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: sc.text }} />
                              {p.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className="text-[13px] font-bold"
                              style={{ color: "var(--text-main)" }}
                            >
                              {p.stock}
                            </span>
                          </td>
                          {/* Hover Actions */}
                          <td className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ opacity: undefined }}>
                            <div className="flex justify-end gap-1.5 bg-white/90 backdrop-blur-sm p-1 rounded-xl shadow-sm border border-gray-100">
                              <button
                                className="h-8 px-2.5 rounded-lg flex items-center justify-center transition cursor-pointer hover:bg-gray-100 gap-1.5 text-[12px] font-bold"
                                style={{ color: "var(--text-secondary)" }}
                              >
                                <Eye size={14} /> Xem
                              </button>
                              <button
                                className="h-8 px-2.5 rounded-lg flex items-center justify-center transition cursor-pointer hover:bg-gray-100 gap-1.5 text-[12px] font-bold"
                                style={{ color: "var(--brand-primary)" }}
                              >
                                <Pencil size={14} /> Sửa
                              </button>
                              {/* Toggle: Ngừng kinh doanh ↔ Đang kinh doanh */}
                              {p.status === "Đang kinh doanh" ? (
                                <button
                                  onClick={(e) => { e.stopPropagation(); toggleProductStatus(p.id); }}
                                  className="h-8 px-2.5 rounded-lg flex items-center justify-center transition cursor-pointer hover:bg-red-50 gap-1.5 text-[12px] font-bold"
                                  style={{ color: "#DC2626" }}
                                  title="Ngừng kinh doanh sản phẩm này"
                                >
                                  <Ban size={14} /> Ngừng KD
                                </button>
                              ) : (
                                <button
                                  onClick={(e) => { e.stopPropagation(); toggleProductStatus(p.id); }}
                                  className="h-8 px-2.5 rounded-lg flex items-center justify-center transition cursor-pointer hover:bg-green-50 gap-1.5 text-[12px] font-bold"
                                  style={{ color: "#15803D" }}
                                  title="Mở lại kinh doanh sản phẩm này"
                                >
                                  <Power size={14} /> Mở KD
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {paginatedProducts.length === 0 && (
                      <tr>
                        <td colSpan="7" className="py-24 text-center">
                          <div className="flex flex-col items-center gap-2" style={{ color: "var(--text-placeholder)" }}>
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "var(--bg-main)" }}>
                              <Package size={28} strokeWidth={1.5} />
                            </div>
                            <p className="text-sm font-medium mt-1">
                              {productSearch ? `Không tìm thấy sản phẩm "${productSearch}"` : "Chưa có sản phẩm nào"}
                            </p>
                            {productSearch && (
                              <button onClick={() => setProductSearch("")} className="text-[13px] font-medium cursor-pointer" style={{ color: "var(--brand-primary)" }}>
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

              {/* Pagination */}
              {filteredProducts.length > 0 && (
                <div
                  className="flex items-center justify-between px-6 py-3 border-t shrink-0"
                  style={{ borderColor: "var(--grid-border)", backgroundColor: "var(--bg-main)" }}
                >
                  <div className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                    Tổng số bản ghi: <span className="font-bold" style={{ color: "var(--text-main)" }}>{filteredProducts.length}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px]" style={{ color: "var(--text-secondary)" }}>Số bản ghi/trang</span>
                      <select
                        value={itemsPerPage}
                        onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                        className="h-8 px-2 pr-6 rounded-md text-[13px] border cursor-pointer focus:outline-none focus:ring-1 transition appearance-none"
                        style={{
                          borderColor: "var(--grid-border)", backgroundColor: "#fff", color: "var(--text-main)",
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                          backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center",
                        }}
                      >
                        {[15, 30, 50, 100].map((size) => <option key={size} value={size}>{size}</option>)}
                      </select>
                    </div>
                    <div className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                      <span className="font-bold" style={{ color: "var(--text-main)" }}>
                        {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredProducts.length)}
                      </span>{" "}bản ghi
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setCurrentPage((pg) => Math.max(1, pg - 1))} disabled={currentPage === 1}
                        className="flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer hover:bg-gray-200 rounded p-1"
                        style={{ color: "var(--text-main)" }}>
                        <ChevronLeft size={16} strokeWidth={2.5} />
                      </button>
                      <button onClick={() => setCurrentPage((pg) => Math.min(totalPages, pg + 1))} disabled={currentPage === totalPages || totalPages === 0}
                        className="flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer hover:bg-gray-200 rounded p-1"
                        style={{ color: "var(--text-main)" }}>
                        <ChevronRight size={16} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

       
        {activeTab === "stock" && (
          <div
            className="flex flex-col bg-white rounded-2xl flex-1 overflow-hidden"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)" }}
          >
            {/* Search + Filter bar */}
            <div
              className="px-4 py-3 border-b shrink-0 flex flex-wrap items-center justify-between gap-3"
              style={{ borderColor: "var(--grid-border)" }}
            >
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="relative w-72 shrink-0">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-placeholder)" }} />
                  <input
                    type="text"
                    placeholder="Tìm mã hàng sẵn, tên sản phẩm..."
                    value={stockSearch}
                    onChange={(e) => setStockSearch(e.target.value)}
                    className="w-full h-9 pl-10 pr-8 rounded-lg text-[13px] focus:outline-none focus:ring-2 transition"
                    style={{ border: "1px solid var(--grid-border)", backgroundColor: "var(--bg-main)", color: "var(--text-main)" }}
                  />
                </div>
                <select value={woodFilter} onChange={(e) => setWoodFilter(e.target.value)}
                  className="h-9 px-3 rounded-lg text-[13px] font-medium outline-none cursor-pointer"
                  style={{ border: "1px solid var(--grid-border)", color: "var(--text-main)" }}>
                  <option value="">Tất cả Loại Gỗ</option>
                  {WOOD_TYPES.map((w) => <option key={w} value={w}>{w}</option>)}
                </select>
                <select value={colorFilter} onChange={(e) => setColorFilter(e.target.value)}
                  className="h-9 px-3 rounded-lg text-[13px] font-medium outline-none cursor-pointer"
                  style={{ border: "1px solid var(--grid-border)", color: "var(--text-main)" }}>
                  <option value="">Tất cả Màu Sơn</option>
                  {COLORS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <button className="h-9 px-4 rounded-lg flex items-center gap-2 text-[13px] font-bold transition hover:opacity-90 cursor-pointer"
                style={{ backgroundColor: "var(--brand-primary)", color: "#fff" }}>
                <Plus size={16} /> Thêm hàng sẵn
              </button>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left relative">
                <thead className="sticky top-0 z-10" style={{ backgroundColor: "var(--grid-header-bg)", borderBottom: "1px solid var(--grid-border)" }}>
                  <tr>
                    {["Mã", "Tên sản phẩm", "Loại Gỗ", "Màu Sơn", "Giá bán", "Tồn kho", "Trạng thái"].map((h, i) => (
                      <th key={i} className={`px-4 py-3 text-[11px] font-bold uppercase tracking-wider ${i === 4 ? "text-right" : ""} ${i === 5 ? "text-center" : ""}`}
                        style={{ color: "var(--text-placeholder)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredStock.map((v) => {
                    const isStopped = v.status === "Ngừng kinh doanh";
                    return (
                      <tr key={v.id} className="group relative hover:bg-gray-50/50 transition-colors cursor-pointer" style={{ borderBottom: "1px solid var(--grid-border)", opacity: isStopped ? 0.55 : 1 }}>
                        <td className="px-4 py-3">
                          <span className="text-[12px] font-bold font-mono px-2 py-1 rounded" style={{ backgroundColor: "var(--bg-main)", color: "var(--text-main)", border: "1px solid var(--grid-border)" }}>
                            {v.code}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-[13px] font-semibold" style={{ color: "var(--text-main)", textDecoration: isStopped ? "line-through" : "none" }}>{v.name}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[12px] font-bold px-2 py-1 rounded" style={{ backgroundColor: "#FFF7ED", color: "#C2410C" }}>{v.woodType}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[12px] font-bold px-2 py-1 rounded" style={{ backgroundColor: "#F0FDF4", color: "#15803D" }}>{v.color}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <p className="text-[13px] font-bold" style={{ color: "var(--text-main)" }}>{fmtCurrency(v.retailPrice)}</p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-[13px] font-bold" style={{ color: v.stock === 0 ? "#DC2626" : "var(--text-main)" }}>{v.stock}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="inline-flex items-center px-2.5 py-1 text-[11px] font-bold rounded-md"
                            style={{
                              backgroundColor: isStopped ? "#F3F4F6" : "#F0FDF4",
                              color: isStopped ? "#6B7280" : "#15803D",
                              border: `1px solid ${isStopped ? "#D1D5DB" : "#BBF7D0"}`,
                            }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: isStopped ? "#6B7280" : "#15803D" }} />
                            {v.status}
                          </span>
                        </td>
                        {/* Hover actions */}
                        <td className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <div className="flex justify-end gap-1.5 bg-white/90 backdrop-blur-sm p-1 rounded-xl shadow-sm border border-gray-100">
                            <button className="h-8 px-2.5 rounded-lg flex items-center justify-center transition cursor-pointer hover:bg-gray-100 gap-1.5 text-[12px] font-bold"
                              style={{ color: "var(--text-secondary)" }}>
                              <Eye size={14} /> Xem
                            </button>
                            <button className="h-8 px-2.5 rounded-lg flex items-center justify-center transition cursor-pointer hover:bg-gray-100 gap-1.5 text-[12px] font-bold"
                              style={{ color: "var(--brand-primary)" }}>
                              <Pencil size={14} /> Sửa
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredStock.length === 0 && (
                    <tr>
                      <td colSpan="7" className="py-24 text-center">
                        <div className="flex flex-col items-center gap-2" style={{ color: "var(--text-placeholder)" }}>
                          <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "var(--bg-main)" }}>
                            <Warehouse size={28} strokeWidth={1.5} />
                          </div>
                          <p className="text-sm font-medium mt-1">Không tìm thấy hàng sẵn nào</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════════ TAB: ĐẶT THEO MẪu ════════ */}
        {activeTab === "custom" && (
          <div
            className="flex flex-col bg-white rounded-2xl flex-1 overflow-hidden"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)" }}
          >
            {/* Search bar */}
            <div
              className="px-4 py-3 border-b shrink-0 flex flex-wrap items-center justify-between gap-3"
              style={{ borderColor: "var(--grid-border)" }}
            >
              <div className="relative w-full max-w-md shrink-0">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-placeholder)" }} />
                <input
                  type="text"
                  placeholder="Tìm mã mẫu, tên sản phẩm..."
                  value={customSearch}
                  onChange={(e) => setCustomSearch(e.target.value)}
                  className="w-full h-9 pl-10 pr-8 rounded-lg text-[13px] focus:outline-none focus:ring-2 transition"
                  style={{ border: "1px solid var(--grid-border)", backgroundColor: "var(--bg-main)", color: "var(--text-main)" }}
                />
              </div>
              <button className="h-9 px-4 rounded-lg flex items-center gap-2 text-[13px] font-bold transition hover:opacity-90 cursor-pointer"
                style={{ backgroundColor: "var(--brand-primary)", color: "#fff" }}>
                <Plus size={16} /> Thêm mẫu
              </button>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left relative">
                <thead className="sticky top-0 z-10" style={{ backgroundColor: "var(--grid-header-bg)", borderBottom: "1px solid var(--grid-border)" }}>
                  <tr>
                    {["Mã mẫu", "Tên sản phẩm", "Danh mục", "Loại gỗ khả dụng", "Mức giá", "Thời gian SX", "Trạng thái"].map((h, i) => (
                      <th key={i} className={`px-4 py-3 text-[11px] font-bold uppercase tracking-wider`}
                        style={{ color: "var(--text-placeholder)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredCustom.map((m) => {
                    const isStopped = m.status === "Tạm ngưng";
                    return (
                      <tr key={m.id} className="group relative hover:bg-gray-50/50 transition-colors cursor-pointer" style={{ borderBottom: "1px solid var(--grid-border)", opacity: isStopped ? 0.55 : 1 }}>
                        <td className="px-4 py-3">
                          <span className="text-[12px] font-bold font-mono px-2 py-1 rounded" style={{ backgroundColor: "var(--bg-main)", color: "var(--text-main)", border: "1px solid var(--grid-border)" }}>
                            {m.code}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-[13px] font-semibold" style={{ color: "var(--text-main)" }}>{m.name}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-block px-2.5 py-1 text-[11px] font-bold rounded-md"
                            style={{ backgroundColor: "var(--bg-main)", color: "var(--text-secondary)", border: "1px solid var(--grid-border)" }}>
                            {m.category}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-[12px] font-medium" style={{ color: "var(--text-secondary)" }}>{m.woodOptions}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-[13px] font-bold" style={{ color: "var(--text-main)" }}>
                            {fmtCurrency(m.minPrice)} <span className="font-normal" style={{ color: "var(--text-placeholder)" }}>–</span> {fmtCurrency(m.maxPrice)}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-[13px] font-medium" style={{ color: "var(--text-secondary)" }}>{m.leadTime}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="inline-flex items-center px-2.5 py-1 text-[11px] font-bold rounded-md"
                            style={{
                              backgroundColor: isStopped ? "#F3F4F6" : "#F0FDF4",
                              color: isStopped ? "#6B7280" : "#15803D",
                              border: `1px solid ${isStopped ? "#D1D5DB" : "#BBF7D0"}`,
                            }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: isStopped ? "#6B7280" : "#15803D" }} />
                            {m.status}
                          </span>
                        </td>
                        {/* Hover actions */}
                        <td className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <div className="flex justify-end gap-1.5 bg-white/90 backdrop-blur-sm p-1 rounded-xl shadow-sm border border-gray-100">
                            <button className="h-8 px-2.5 rounded-lg flex items-center justify-center transition cursor-pointer hover:bg-gray-100 gap-1.5 text-[12px] font-bold"
                              style={{ color: "var(--text-secondary)" }}>
                              <Eye size={14} /> Xem
                            </button>
                            <button className="h-8 px-2.5 rounded-lg flex items-center justify-center transition cursor-pointer hover:bg-gray-100 gap-1.5 text-[12px] font-bold"
                              style={{ color: "var(--brand-primary)" }}>
                              <Pencil size={14} /> Sửa
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredCustom.length === 0 && (
                    <tr>
                      <td colSpan="7" className="py-24 text-center">
                        <div className="flex flex-col items-center gap-2" style={{ color: "var(--text-placeholder)" }}>
                          <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "var(--bg-main)" }}>
                            <Ruler size={28} strokeWidth={1.5} />
                          </div>
                          <p className="text-sm font-medium mt-1">Chưa có mẫu đặt nào</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
