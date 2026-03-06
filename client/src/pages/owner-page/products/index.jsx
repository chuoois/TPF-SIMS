/**
 * Component OwnerProducts
 * Quản lý Sản phẩm — Chủ cửa hàng (Mô phỏng Đồ gỗ mỹ nghệ)
 *
 * Created Date: 06/03/2026
 */

import { useState } from "react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import {
  Search,
  Plus,
  Package,
  Layers,
  FolderTree,
  Pencil,
  Eye,
  Filter,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ===================== MOCK DATA =====================
const CATEGORIES = [
  { id: "C01", name: "Phòng khách", count: 12 },
  { id: "C02", name: "Phòng ngủ", count: 8 },
  { id: "C03", name: "Phòng thờ", count: 15 },
  { id: "C04", name: "Phòng ăn", count: 6 },
];

const WOOD_TYPES = ["Gỗ hương đá", "Gỗ gõ đỏ", "Gỗ sồi Nga", "Gỗ gụ mật", "Gỗ xà cừ"];
const COLORS = ["Cánh gián", "Trần (giữ vân)", "Óc chó", "Hương", "Chưa sơn (Mộc)"];

// Sản phẩm cha (Product)
const PRODUCTS = [
  {
    id: "P001",
    code: "SP-PK-001",
    name: "Bộ bàn ghế Nghê Bảo Đỉnh 6 món",
    category: "Phòng khách",
    type: "FINISHED", // Hoàn thiện
    status: "Đang kinh doanh",
    stock: 5,
    img: "https://placehold.co/100x100?text=BanGhe",
  },
  {
    id: "P002",
    code: "SP-PK-002",
    name: "Sofa nguyên khối chữ L (Mộc)",
    category: "Phòng khách",
    type: "RAW", // Thô
    status: "Đang kinh doanh",
    stock: 12,
    img: "https://placehold.co/100x100?text=Sofa",
  },
  {
    id: "P003",
    code: "SP-PT-001",
    name: "Sập thờ Mai Điểu chân 20",
    category: "Phòng thờ",
    type: "FINISHED",
    status: "Sắp hết hàng",
    stock: 2,
    img: "https://placehold.co/100x100?text=SapTho",
  },
  {
    id: "P004",
    code: "SP-PN-001",
    name: "Giường ngủ hoa hồng Tân cổ điển (Thô)",
    category: "Phòng ngủ",
    type: "RAW",
    status: "Đang kinh doanh",
    stock: 8,
    img: null,
  },
];

// Biến thể (Variants) — Các cấu hình cụ thể của sản phẩm
const VARIANTS = [
  {
    id: "V001",
    sku: "SP-PK-001-HD-CG",
    productName: "Bộ bàn ghế Nghê Bảo Đỉnh 6 món",
    woodType: "Gỗ hương đá",
    color: "Cánh gián",
    importPrice: 42000000,
    retailPrice: 55000000,
    wholeSalePrice: 50000000,
    stock: 3,
  },
  {
    id: "V002",
    sku: "SP-PK-001-GD-TR",
    productName: "Bộ bàn ghế Nghê Bảo Đỉnh 6 món",
    woodType: "Gỗ gõ đỏ",
    color: "Trần (giữ vân)",
    importPrice: 45000000,
    retailPrice: 58000000,
    wholeSalePrice: 53000000,
    stock: 2,
  },
  {
    id: "V003",
    sku: "SP-PK-002-HD-M",
    productName: "Sofa nguyên khối chữ L (Mộc)",
    woodType: "Gỗ hương đá",
    color: "Chưa sơn (Mộc)",
    importPrice: 25000000,
    retailPrice: 35000000,
    wholeSalePrice: 30000000,
    stock: 8,
  },
  {
    id: "V004",
    sku: "SP-PT-001-GM-CG",
    productName: "Sập thờ Mai Điểu chân 20",
    woodType: "Gỗ gụ mật",
    color: "Cánh gián",
    importPrice: 18000000,
    retailPrice: 25000000,
    wholeSalePrice: 22000000,
    stock: 2,
  },
];

const TABS = [
  { id: "products", label: "Danh sách sản phẩm", icon: Package },
  { id: "variants", label: "Biến thể sản phẩm", icon: Layers },
  { id: "categories", label: "Danh mục sản phẩm", icon: FolderTree },
];

const fmtCurrency = (n) => new Intl.NumberFormat("vi-VN").format(n);

// ===================== COMPONENT =====================
export default function OwnerProducts() {
  const [activeTab, setActiveTab] = useState("products");

  // --- Filter Sản phẩm cha ---
  const [productTypeFilter, setProductTypeFilter] = useState(""); // ALL | RAW | FINISHED
  const [categoryFilter, setCategoryFilter] = useState("");
  const [productSearch, setProductSearch] = useState("");

  // --- Filter Biến thể ---
  const [variantSearch, setVariantSearch] = useState("");
  const [woodFilter, setWoodFilter] = useState("");
  const [colorFilter, setColorFilter] = useState("");

  // ================= RENDER TABS =================
  return (
    <>
      <PageHelmet title="Sản phẩm | TPF-SIMS" />

      <div className="flex flex-col h-[calc(100vh-64px)] -m-6" style={{ backgroundColor: "var(--bg-main)" }}>
        {/* HEADER */}
        <div
          className="shrink-0 px-6 py-4 flex items-center justify-between"
          style={{ backgroundColor: "var(--background)", borderBottom: "1px solid var(--grid-border)" }}
        >
          <div>
            <h1 className="text-xl font-bold" style={{ color: "var(--text-main)" }}>Quản lý Sản phẩm</h1>
            <p className="text-[12px] mt-1" style={{ color: "var(--text-secondary)" }}>
              Quản lý danh mục hàng thô (mộc), hàng hoàn thiện và các biến thể gỗ/màu sơn.
            </p>
          </div>
          
          {/* TAB SWITCHER */}
          <div className="flex p-1 rounded-xl" style={{ backgroundColor: "var(--bg-main)", border: "1px solid var(--grid-border)" }}>
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-bold transition-all",
                    isActive ? "bg-white shadow-sm" : "hover:bg-white/50"
                  )}
                  style={{ color: isActive ? "var(--brand-primary)" : "var(--text-secondary)" }}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-6">
          
         
          {activeTab === "products" && (
            <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "var(--background)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              {/* TOOLBAR */}
              <div className="p-4 flex flex-wrap items-center justify-between gap-4" style={{ borderBottom: "1px solid var(--grid-border)" }}>
                <div className="flex items-center gap-3">
                  {/* Tìm kiếm */}
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4" style={{ color: "var(--text-placeholder)" }} />
                    <input
                      type="text"
                      placeholder="Tìm tên sản phẩm..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full h-9 pl-9 pr-3 rounded-lg text-[13px] font-medium outline-none transition-all"
                      style={{ border: "1px solid var(--grid-border)", color: "var(--text-main)" }}
                    />
                  </div>
                  {/* Lọc loại */}
                  <select
                    value={productTypeFilter}
                    onChange={(e) => setProductTypeFilter(e.target.value)}
                    className="h-9 px-3 rounded-lg text-[13px] font-medium outline-none cursor-pointer"
                    style={{ border: "1px solid var(--grid-border)", color: "var(--text-main)" }}
                  >
                    <option value="">Tất cả loại</option>
                    <option value="RAW">Hàng Mộc</option>
                    <option value="FINISHED">Hàng Hoàn thiện (Sơn PU)</option>
                  </select>
                  {/* Lọc danh mục */}
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="h-9 px-3 rounded-lg text-[13px] font-medium outline-none cursor-pointer"
                    style={{ border: "1px solid var(--grid-border)", color: "var(--text-main)" }}
                  >
                    <option value="">Tất cả danh mục</option>
                    {CATEGORIES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                
                {/* ACTIONS */}
                <div className="flex items-center gap-2">
                  <button
                    className="h-9 px-4 rounded-lg flex items-center gap-2 text-[13px] font-bold transition hover:bg-gray-50 cursor-pointer"
                    style={{ border: "1px solid var(--grid-border)", color: "var(--text-main)" }}
                  >
                    <FolderTree size={14} /> Thêm Danh mục
                  </button>
                  <button
                    className="h-9 px-4 rounded-lg flex items-center gap-2 text-[13px] font-bold transition hover:opacity-90 cursor-pointer"
                    style={{ backgroundColor: "var(--brand-primary)", color: "#fff" }}
                  >
                    <Plus size={16} /> Thêm Sản phẩm
                  </button>
                </div>
              </div>

              {/* BẢNG SẢN PHẨM */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr style={{ backgroundColor: "var(--grid-header-bg)", borderBottom: "1px solid var(--grid-border)" }}>
                      <th className="px-5 py-3 text-[12px] font-bold uppercase tracking-wider text-center w-12" style={{ color: "var(--text-secondary)" }}>STT</th>
                      <th className="px-5 py-3 text-[12px] font-bold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Mã SP</th>
                      <th className="px-5 py-3 text-[12px] font-bold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Ảnh</th>
                      <th className="px-5 py-3 text-[12px] font-bold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Tên sản phẩm</th>
                      <th className="px-5 py-3 text-[12px] font-bold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Danh mục</th>
                      <th className="px-5 py-3 text-[12px] font-bold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Loại hàng</th>
                      <th className="px-5 py-3 text-[12px] font-bold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Tồn tổng</th>
                      <th className="px-5 py-3 text-[12px] font-bold uppercase tracking-wider text-right" style={{ color: "var(--text-secondary)" }}>Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: "var(--grid-border)" }}>
                    {PRODUCTS.map((p, index) => (
                      <tr key={p.id} className="transition-colors hover:bg-gray-50/50">
                        <td className="px-5 py-3 text-[13px] font-medium text-center text-gray-500">{index + 1}</td>
                        <td className="px-5 py-3 text-[13px] font-bold text-gray-700">{p.code}</td>
                        <td className="px-5 py-3">
                          {p.img ? (
                            <img src={p.img} alt={p.name} className="w-10 h-10 rounded-lg object-cover border border-gray-200" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100 border border-gray-200">
                              <ImageIcon size={16} className="text-gray-400" />
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-3 text-[14px] font-bold" style={{ color: "var(--text-main)" }}>{p.name}</td>
                        <td className="px-5 py-3 text-[13px] font-medium text-gray-600">{p.category}</td>
                        <td className="px-5 py-3">
                          <span className={`px-2 py-1 rounded text-[11px] font-bold ${
                            p.type === 'RAW' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          }`}>
                            {p.type === 'RAW' ? 'Hàng Mộc (Thô)' : 'Hoàn thiện'}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-[13px] font-bold text-gray-700">{p.stock}</td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 transition border border-transparent hover:border-gray-200">
                              <Eye size={14} />
                            </button>
                            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-600 hover:bg-blue-50 transition border border-transparent hover:border-blue-200">
                              <Pencil size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}


          {activeTab === "variants" && (
            <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "var(--background)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              {/* TOOLBAR */}
              <div className="p-4 flex flex-wrap items-center justify-between gap-4" style={{ borderBottom: "1px solid var(--grid-border)" }}>
                <div className="flex items-center gap-3">
                  {/* Tìm kiếm */}
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4" style={{ color: "var(--text-placeholder)" }} />
                    <input
                      type="text"
                      placeholder="Tìm mã SKU hoặc tên SP..."
                      value={variantSearch}
                      onChange={(e) => setVariantSearch(e.target.value)}
                      className="w-full h-9 pl-9 pr-3 rounded-lg text-[13px] font-medium outline-none transition-all"
                      style={{ border: "1px solid var(--grid-border)", color: "var(--text-main)" }}
                    />
                  </div>
                  {/* Lọc Gỗ */}
                  <select
                    value={woodFilter}
                    onChange={(e) => setWoodFilter(e.target.value)}
                    className="h-9 px-3 rounded-lg text-[13px] font-medium outline-none cursor-pointer"
                    style={{ border: "1px solid var(--grid-border)", color: "var(--text-main)" }}
                  >
                    <option value="">Tất cả Loại Gỗ</option>
                    {WOOD_TYPES.map((w, index) => <option key={index} value={w}>{w}</option>)}
                  </select>
                  {/* Lọc Màu */}
                  <select
                    value={colorFilter}
                    onChange={(e) => setColorFilter(e.target.value)}
                    className="h-9 px-3 rounded-lg text-[13px] font-medium outline-none cursor-pointer"
                    style={{ border: "1px solid var(--grid-border)", color: "var(--text-main)" }}
                  >
                    <option value="">Tất cả Màu Sơn</option>
                    {COLORS.map((c, index) => <option key={index} value={c}>{c}</option>)}
                  </select>
                </div>
                
                {/* ACTIONS */}
                <div className="flex items-center gap-2">
                  <button
                    className="h-9 px-3 rounded-lg flex items-center gap-1.5 text-[12px] font-bold transition hover:bg-gray-50 cursor-pointer text-amber-700 border border-amber-200 bg-amber-50"
                  >
                    <Plus size={14} /> Thêm Loại Gỗ
                  </button>
                  <button
                    className="h-9 px-3 rounded-lg flex items-center gap-1.5 text-[12px] font-bold transition hover:bg-gray-50 cursor-pointer text-emerald-700 border border-emerald-200 bg-emerald-50"
                  >
                    <Plus size={14} /> Thêm Màu Sơn
                  </button>
                  <div className="w-px h-6 bg-gray-300 mx-2"></div>
                  <button
                    className="h-9 px-4 rounded-lg flex items-center gap-2 text-[13px] font-bold transition hover:opacity-90 cursor-pointer"
                    style={{ backgroundColor: "var(--brand-primary)", color: "#fff" }}
                  >
                    <Plus size={16} /> Thêm Biến thể
                  </button>
                </div>
              </div>

              {/* BẢNG BIẾN THỂ */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr style={{ backgroundColor: "var(--grid-header-bg)", borderBottom: "1px solid var(--grid-border)" }}>
                      <th className="px-5 py-3 text-[12px] font-bold uppercase tracking-wider text-center w-12" style={{ color: "var(--text-secondary)" }}>STT</th>
                      <th className="px-5 py-3 text-[12px] font-bold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Mã SKU</th>
                      <th className="px-5 py-3 text-[12px] font-bold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Tên sản phẩm</th>
                      <th className="px-5 py-3 text-[12px] font-bold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Loại Gỗ</th>
                      <th className="px-5 py-3 text-[12px] font-bold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Màu Sơn</th>
                      <th className="px-5 py-3 text-[12px] font-bold uppercase tracking-wider text-right" style={{ color: "var(--text-secondary)" }}>Giá Bán Lẻ</th>
                      <th className="px-5 py-3 text-[12px] font-bold uppercase tracking-wider text-center" style={{ color: "var(--text-secondary)" }}>Tồn kho</th>
                      <th className="px-5 py-3 text-[12px] font-bold uppercase tracking-wider text-right" style={{ color: "var(--text-secondary)" }}>Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: "var(--grid-border)" }}>
                    {VARIANTS.map((v, index) => (
                      <tr key={v.id} className="transition-colors hover:bg-gray-50/50">
                        <td className="px-5 py-3 text-[13px] font-medium text-center text-gray-500">{index + 1}</td>
                        <td className="px-5 py-3">
                          <span className="font-mono text-[13px] font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded border border-gray-200">
                            {v.sku}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-[13px] font-bold" style={{ color: "var(--text-main)" }}>{v.productName}</td>
                        <td className="px-5 py-3 text-[13px] font-medium text-amber-800">{v.woodType}</td>
                        <td className="px-5 py-3 text-[13px] font-medium text-emerald-800">{v.color}</td>
                        <td className="px-5 py-3 text-[14px] font-bold text-right text-red-600">{fmtCurrency(v.retailPrice)}</td>
                        <td className="px-5 py-3 text-[14px] font-bold text-center text-gray-800">{v.stock}</td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-600 hover:bg-blue-50 transition border border-transparent hover:border-blue-200">
                              <Pencil size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══════════════ TAB: DANH MỤC ══════════════ */}
          {activeTab === "categories" && (
            <div className="rounded-2xl overflow-hidden max-w-4xl border" style={{ backgroundColor: "var(--background)", borderColor: "var(--grid-border)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <div className="p-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--grid-border)" }}>
                <h2 className="text-[14px] font-bold uppercase tracking-wider" style={{ color: "var(--text-main)" }}>Danh mục sản phẩm</h2>
                <button
                  className="h-9 px-4 rounded-lg flex items-center gap-2 text-[13px] font-bold transition hover:opacity-90 cursor-pointer"
                  style={{ backgroundColor: "var(--brand-primary)", color: "#fff" }}
                >
                  <Plus size={16} /> Thêm Danh mục
                </button>
              </div>
              <table className="w-full text-left">
                  <thead>
                    <tr style={{ backgroundColor: "var(--grid-header-bg)", borderBottom: "1px solid var(--grid-border)" }}>
                      <th className="px-5 py-3 text-[12px] font-bold uppercase tracking-wider text-center w-12" style={{ color: "var(--text-secondary)" }}>STT</th>
                      <th className="px-5 py-3 text-[12px] font-bold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Mã</th>
                      <th className="px-5 py-3 text-[12px] font-bold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Tên Danh mục</th>
                      <th className="px-5 py-3 text-[12px] font-bold uppercase tracking-wider text-center" style={{ color: "var(--text-secondary)" }}>Số SP</th>
                      <th className="px-5 py-3 text-[12px] font-bold uppercase tracking-wider text-right" style={{ color: "var(--text-secondary)" }}>Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: "var(--grid-border)" }}>
                    {CATEGORIES.map((c, index) => (
                      <tr key={c.id} className="transition-colors hover:bg-gray-50/50">
                        <td className="px-5 py-3 text-[13px] font-medium text-center text-gray-500">{index + 1}</td>
                        <td className="px-5 py-3 text-[13px] font-bold text-gray-500">{c.id}</td>
                        <td className="px-5 py-3 text-[14px] font-bold" style={{ color: "var(--text-main)" }}>{c.name}</td>
                        <td className="px-5 py-3 text-[13px] font-bold text-center text-blue-600 bg-blue-50/50">{c.count}</td>
                        <td className="px-5 py-3 text-right">
                          <button className="px-3 py-1.5 rounded-lg text-[12px] font-bold text-blue-600 hover:bg-blue-50 transition border border-transparent hover:border-blue-200">
                            Chỉnh sửa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
              </table>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
