/**
 * AccountantProductManage – Kho Hàng (Read-Only)
 * Hiển thị toàn bộ sản phẩm trong kho, không cho phép chỉnh sửa hay thay đổi trạng thái.
 * UI theo chuẩn owner-page (CSS vars, status toolbar, table card, pagination).
 *
 * Created By: HieuNM – 07/03/2026
 */

import { useState, useMemo, useEffect } from "react";
import {
    Search, Package, Warehouse, Ruler,
    Eye, X, ChevronLeft, ChevronRight,
    Image as ImageIcon,
} from "lucide-react";
import { PageHelmet } from "@/components/seo/PageHelmet";

// ─────────────────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────────────────
const CATEGORIES = [
    { id: "C01", name: "Phòng khách" },
    { id: "C02", name: "Phòng ngủ" },
    { id: "C03", name: "Phòng thờ" },
    { id: "C04", name: "Phòng ăn" },
];

const WOOD_TYPES = ["Gỗ hương đá", "Gỗ gõ đỏ", "Gỗ sồi Nga", "Gỗ gụ mật", "Gỗ xà cừ", "Gỗ mít", "Gỗ óc chó"];
const COLORS = ["Cánh gián", "Trần (giữ vân)", "Óc chó", "Hương", "Chưa sơn (Mộc)"];

// Tab 1 – Sản phẩm
const INITIAL_PRODUCTS = [
    { id: "P001", code: "SP-PK-001", name: "Bộ bàn ghế Nghê Bảo Đỉnh 6 món", category: "Phòng khách", type: "FINISHED", status: "Đang kinh doanh", stock: 5, img: "https://placehold.co/80x80?text=SP001" },
    { id: "P002", code: "SP-PK-002", name: "Sofa nguyên khối chữ L", category: "Phòng khách", type: "RAW", status: "Đang kinh doanh", stock: 12, img: null },
    { id: "P003", code: "SP-PT-001", name: "Sập thờ Mai Điểu chân 20", category: "Phòng thờ", type: "FINISHED", status: "Đang kinh doanh", stock: 2, img: "https://placehold.co/80x80?text=SP003" },
    { id: "P004", code: "SP-PN-001", name: "Giường ngủ hoa hồng Tân cổ điển", category: "Phòng ngủ", type: "RAW", status: "Đang kinh doanh", stock: 8, img: null },
    { id: "P005", code: "SP-PT-002", name: "Hoành phi câu đối chạm rồng", category: "Phòng thờ", type: "FINISHED", status: "Đang kinh doanh", stock: 6, img: "https://placehold.co/80x80?text=SP005" },
    { id: "P006", code: "SP-PA-001", name: "Bộ bàn ăn 8 ghế nguyên khối", category: "Phòng ăn", type: "FINISHED", status: "Đang kinh doanh", stock: 3, img: "https://placehold.co/80x80?text=SP006" },
    { id: "P007", code: "SP-PK-003", name: "Kệ tivi nguyên khối mặt liền", category: "Phòng khách", type: "FINISHED", status: "Ngừng kinh doanh", stock: 0, img: null },
    { id: "P008", code: "SP-PN-002", name: "Tủ quần áo 4 cánh chạm hoa lá tây", category: "Phòng ngủ", type: "FINISHED", status: "Đang kinh doanh", stock: 4, img: null },
    { id: "P009", code: "SP-PT-003", name: "Bàn thờ chạm rồng cuốn thủy", category: "Phòng thờ", type: "RAW", status: "Đang kinh doanh", stock: 7, img: null },
    { id: "P010", code: "SP-PK-004", name: "Tủ rượu nguyên khối cánh kính", category: "Phòng khách", type: "FINISHED", status: "Ngừng kinh doanh", stock: 1, img: null },
];

// Tab 2 – Hàng sẵn
const STOCK_ITEMS = [
    { id: "HS001", code: "HS-PK-001", sku: "BBGND-GH-HS-4821", name: "Bộ bàn ghế Nghê Bảo Đỉnh 6 món", woodType: "Gỗ hương đá", color: "Cánh gián", retailPrice: 55000000, stock: 3, status: "Đang kinh doanh" },
    { id: "HS002", code: "HS-PK-002", sku: "SNKSCL-GGD-HS-2341", name: "Sofa nguyên khối chữ L", woodType: "Gỗ gõ đỏ", color: "Chưa sơn (Mộc)", retailPrice: 35000000, stock: 8, status: "Đang kinh doanh" },
    { id: "HS003", code: "HS-PT-001", sku: "STMD-GGM-HS-9102", name: "Sập thờ Mai Điểu chân 20", woodType: "Gỗ gụ mật", color: "Cánh gián", retailPrice: 25000000, stock: 2, status: "Đang kinh doanh" },
    { id: "HS004", code: "HS-PA-001", sku: "BBA8GNK-GH-HS-6657", name: "Bộ bàn ăn 8 ghế nguyên khối", woodType: "Gỗ hương đá", color: "Cánh gián", retailPrice: 48000000, stock: 3, status: "Đang kinh doanh" },
    { id: "HS005", code: "HS-PK-003", sku: "KTVNKML-GGD-HS-7723", name: "Kệ tivi nguyên khối mặt liền", woodType: "Gỗ gõ đỏ", color: "Trần (giữ vân)", retailPrice: 32000000, stock: 0, status: "Ngừng kinh doanh" },
    { id: "HS006", code: "HS-PN-001", sku: "GNHHTCD-GSN-HS-3380", name: "Giường ngủ hoa hồng Tân cổ điển", woodType: "Gỗ sồi Nga", color: "Óc chó", retailPrice: 22000000, stock: 4, status: "Đang kinh doanh" },
];

// Tab 3 – Đặt theo mẫu (hàng khách đặt cũng có mã SKU)
const CUSTOM_MODELS = [
    { id: "DTM001", code: "M-PK-001", sku: "BBGND-GH-KD-1021", name: "Bộ bàn ghế Nghê Bảo Đỉnh 6 món", category: "Phòng khách", minPrice: 42000000, maxPrice: 65000000, leadTime: "25–35 ngày", woodOptions: "Gỗ hương, Gỗ gõ đỏ", status: "Đang nhận đơn" },
    { id: "DTM002", code: "M-PN-001", sku: "GNHH-GSN-KD-3380", name: "Giường ngủ hoa hồng Tân cổ điển", category: "Phòng ngủ", minPrice: 15000000, maxPrice: 35000000, leadTime: "20–30 ngày", woodOptions: "Gỗ sồi, Gỗ gõ đỏ", status: "Đang nhận đơn" },
    { id: "DTM003", code: "M-PT-001", sku: "STM-GGM-KD-9102", name: "Sập thờ Mai Điểu", category: "Phòng thờ", minPrice: 18000000, maxPrice: 45000000, leadTime: "30–45 ngày", woodOptions: "Gỗ gụ, Gỗ hương", status: "Đang nhận đơn" },
    { id: "DTM004", code: "M-PT-002", sku: "BTCR-GM-KD-4492", name: "Bàn thờ chạm rồng cuốn thủy", category: "Phòng thờ", minPrice: 25000000, maxPrice: 55000000, leadTime: "35–50 ngày", woodOptions: "Gỗ mít, Gỗ hương", status: "Đang nhận đơn" },
    { id: "DTM005", code: "M-PA-001", sku: "BBA8-GH-KD-6657", name: "Bộ bàn ăn 8 ghế nguyên khối", category: "Phòng ăn", minPrice: 35000000, maxPrice: 60000000, leadTime: "25–40 ngày", woodOptions: "Gỗ hương, Gỗ sồi", status: "Tạm ngưng" },
];

const TABS = [
    { id: "products", label: "Sản phẩm", icon: Package },
    { id: "stock", label: "Hàng sẵn", icon: Warehouse },
    { id: "custom", label: "Đặt theo mẫu", icon: Ruler },
];

const PRODUCT_CATEGORIES = ["Tất cả", ...CATEGORIES.map(c => c.name)];

const fmtCurrency = (n) => new Intl.NumberFormat("vi-VN").format(n) + "₫";

const getStatusColor = (status) => {
    if (status === "Đang kinh doanh" || status === "Đang nhận đơn")
        return { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" };
    if (status === "Ngừng kinh doanh" || status === "Tạm ngưng")
        return { bg: "#F3F4F6", text: "#6B7280", border: "#D1D5DB" };
    return { bg: "#F3F4F6", text: "#6B7280", border: "#E5E7EB" };
};

// ─────────────────────────────────────────────────────────
export default function AccountantProductManage() {
    const [activeTab, setActiveTab] = useState("products");

    // Products filters
    const [productSearch, setProductSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("Tất cả");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);

    // Stock / custom search
    const [stockSearch, setStockSearch] = useState("");
    const [woodFilter, setWoodFilter] = useState("");
    const [colorFilter, setColorFilter] = useState("");
    const [customSearch, setCustomSearch] = useState("");

    // ── Filtered sets ──
    const filteredProducts = useMemo(() => {
        let r = INITIAL_PRODUCTS;
        if (categoryFilter !== "Tất cả") r = r.filter(p => p.category === categoryFilter);
        if (productSearch.trim()) {
            const q = productSearch.toLowerCase();
            r = r.filter(p => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q));
        }
        return r;
    }, [categoryFilter, productSearch]);

    const filteredStock = useMemo(() => {
        let r = STOCK_ITEMS;
        if (woodFilter) r = r.filter(v => v.woodType === woodFilter);
        if (colorFilter) r = r.filter(v => v.color === colorFilter);
        if (stockSearch.trim()) {
            const q = stockSearch.toLowerCase();
            r = r.filter(v => v.code.toLowerCase().includes(q) || v.name.toLowerCase().includes(q) || v.sku.toLowerCase().includes(q));
        }
        return r;
    }, [woodFilter, colorFilter, stockSearch]);

    const filteredCustom = useMemo(() => {
        if (!customSearch.trim()) return CUSTOM_MODELS;
        const q = customSearch.toLowerCase();
        return CUSTOM_MODELS.filter(m => m.code.toLowerCase().includes(q) || m.name.toLowerCase().includes(q));
    }, [customSearch]);

    const hasActiveFilters = categoryFilter !== "Tất cả" || productSearch;
    const clearFilters = () => { setCategoryFilter("Tất cả"); setProductSearch(""); };

    useEffect(() => { setCurrentPage(1); }, [productSearch, categoryFilter]);

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
    const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // ── Shared components ──
    const TH = ({ children, right, center }) => (
        <th className={`px-4 py-3 text-[11px] font-bold uppercase tracking-wider ${right ? "text-right" : center ? "text-center" : ""}`}
            style={{ color: "var(--text-placeholder)" }}>{children}</th>
    );

    const StatusChip = ({ status }) => {
        const sc = getStatusColor(status);
        return (
            <span className="inline-flex items-center px-2.5 py-1 text-[11px] font-bold rounded-md"
                style={{ backgroundColor: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}>
                <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: sc.text }} />
                {status}
            </span>
        );
    };

    const PaginationBar = ({ filtered }) => {
        if (filtered.length === 0) return null;
        return (
            <div className="flex items-center justify-between px-6 py-3 border-t shrink-0"
                style={{ borderColor: "var(--grid-border)", backgroundColor: "var(--bg-main)" }}>
                <div className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                    Tổng: <span className="font-bold" style={{ color: "var(--text-main)" }}>{filtered.length}</span> bản ghi
                </div>
                <div className="flex items-center gap-5">
                    <div className="flex items-center gap-2">
                        <span className="text-[13px]" style={{ color: "var(--text-secondary)" }}>Bản ghi/trang</span>
                        <select value={itemsPerPage} onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                            className="h-8 px-2 pr-6 rounded-md text-[13px] border cursor-pointer appearance-none"
                            style={{
                                borderColor: "var(--grid-border)", backgroundColor: "#fff", color: "var(--text-main)",
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                                backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center"
                            }}>
                            {[15, 30, 50].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                    </div>
                    <span className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                        <span className="font-bold" style={{ color: "var(--text-main)" }}>
                            {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filtered.length)}
                        </span> bản ghi
                    </span>
                    <div className="flex items-center gap-1">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                            className="p-1 rounded disabled:opacity-30 hover:bg-gray-200 cursor-pointer"
                            style={{ color: "var(--text-main)" }}><ChevronLeft size={16} strokeWidth={2.5} /></button>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}
                            className="p-1 rounded disabled:opacity-30 hover:bg-gray-200 cursor-pointer"
                            style={{ color: "var(--text-main)" }}><ChevronRight size={16} strokeWidth={2.5} /></button>
                    </div>
                </div>
            </div>
        );
    };

    // ─────────────────────────────────────────────────────────
    return (
        <>
            <PageHelmet title="Kho hàng | Kế toán" />
            <div className="flex flex-col h-[calc(100vh-64px)] -m-6 p-6 space-y-4" style={{ backgroundColor: "var(--bg-main)" }}>

                {/* Header + Tab switcher */}
                <div className="flex items-center justify-between shrink-0">
                    <div>
                        <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: "var(--text-main)" }}>
                            <Package size={22} style={{ color: "var(--brand-primary)" }} />
                            Kho hàng
                        </h1>
                        <p className="text-[13px] mt-0.5" style={{ color: "var(--text-placeholder)" }}>
                            {activeTab === "products" && `${filteredProducts.length} sản phẩm`}
                            {activeTab === "stock" && `${filteredStock.length} hàng sẵn`}
                            {activeTab === "custom" && `${filteredCustom.length} mẫu đặt`}
                        </p>
                    </div>

                    {/* Tab switcher */}
                    <div className="flex p-1 rounded-xl" style={{ backgroundColor: "var(--grid-header-bg)", border: "1px solid var(--grid-border)" }}>
                        {TABS.map(tab => {
                            const Icon = tab.icon;
                            return (
                                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-all cursor-pointer"
                                    style={{ backgroundColor: activeTab === tab.id ? "#fff" : "transparent", color: activeTab === tab.id ? "var(--text-main)" : "var(--text-secondary)", boxShadow: activeTab === tab.id ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}>
                                    <Icon size={14} />{tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ════ TAB: SẢN PHẨM ════ */}
                {activeTab === "products" && (
                    <>
                        <div className="flex flex-col bg-white rounded-2xl flex-1 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                            {/* Toolbar */}
                            <div className="px-4 py-3 border-b shrink-0 flex flex-wrap items-center justify-between gap-3" style={{ borderColor: "var(--grid-border)" }}>
                                <div className="flex items-center gap-3 w-full max-w-2xl">
                                    <div className="relative w-full max-w-md shrink-0">
                                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-placeholder)" }} />
                                        <input type="text" value={productSearch} onChange={e => setProductSearch(e.target.value)}
                                            placeholder="Tìm mã sản phẩm, tên sản phẩm..."
                                            className="w-full h-9 pl-10 pr-8 rounded-lg text-[13px] focus:outline-none focus:ring-2 transition"
                                            style={{ border: "1px solid var(--grid-border)", backgroundColor: "var(--bg-main)", color: "var(--text-main)" }} />
                                        {productSearch && <button onClick={() => setProductSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer" style={{ color: "var(--text-placeholder)" }}><X size={14} /></button>}
                                    </div>
                                    {/* Category filter */}
                                    <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
                                        className="h-9 px-3 rounded-lg text-[13px] outline-none cursor-pointer shrink-0"
                                        style={{ border: "1px solid var(--grid-border)", color: "var(--text-main)" }}>
                                        {PRODUCT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="flex items-center gap-2">
                                    {hasActiveFilters && (
                                        <button onClick={clearFilters}
                                            className="h-9 px-3 rounded-lg text-[13px] font-medium flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition"
                                            style={{ color: "#DC2626", backgroundColor: "#FEF2F2", border: "1px solid #FECACA" }}>
                                            <X size={14} /> Xóa bộ lọc
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Table */}
                            <div className="flex-1 overflow-y-auto">
                                <table className="w-full text-left relative">
                                    <thead className="sticky top-0 z-10" style={{ backgroundColor: "var(--grid-header-bg)", borderBottom: "1px solid var(--grid-border)" }}>
                                        <tr>
                                            <TH>Ảnh</TH><TH>Mã SP</TH><TH>Tên sản phẩm</TH><TH>Danh mục</TH><TH>Loại hàng</TH><TH center>Tồn kho</TH><TH>Trạng thái</TH>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedProducts.map(p => {
                                            const isStopped = p.status === "Ngừng kinh doanh";
                                            return (
                                                <tr key={p.id} className="group relative hover:bg-gray-50/50 transition-colors"
                                                    style={{ borderBottom: "1px solid var(--grid-border)", opacity: isStopped ? 0.55 : 1 }}>
                                                    <td className="px-4 py-3">
                                                        {p.img
                                                            ? <img src={p.img} alt={p.name} className="w-10 h-10 rounded-lg object-cover" style={{ border: "1px solid var(--grid-border)", filter: isStopped ? "grayscale(100%)" : "none" }} />
                                                            : <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--bg-main)", border: "1px solid var(--grid-border)" }}><ImageIcon size={16} style={{ color: "var(--text-placeholder)" }} /></div>}
                                                    </td>
                                                    <td className="px-4 py-3"><p className="text-[13px] font-bold font-mono" style={{ color: "var(--text-main)" }}>{p.code}</p></td>
                                                    <td className="px-4 py-3"><p className="text-[13px] font-semibold" style={{ color: "var(--text-main)", textDecoration: isStopped ? "line-through" : "none" }}>{p.name}</p></td>
                                                    <td className="px-4 py-3"><span className="inline-block px-2.5 py-1 text-[11px] font-bold rounded-md" style={{ backgroundColor: "var(--bg-main)", color: "var(--text-secondary)", border: "1px solid var(--grid-border)" }}>{p.category}</span></td>
                                                    <td className="px-4 py-3">
                                                        <span className="inline-block px-2.5 py-1 text-[11px] font-bold rounded-md"
                                                            style={{ backgroundColor: p.type === "RAW" ? "#FFF7ED" : "#F0FDF4", color: p.type === "RAW" ? "#C2410C" : "#15803D", border: `1px solid ${p.type === "RAW" ? "#FED7AA" : "#BBF7D0"}` }}>
                                                            {p.type === "RAW" ? "Hàng Mộc" : "Hoàn thiện"}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className="text-[13px] font-bold" style={{ color: p.stock === 0 ? "#DC2626" : p.stock <= 3 ? "#D97706" : "var(--text-main)" }}>{p.stock}</span>
                                                    </td>
                                                    <td className="px-4 py-3"><StatusChip status={p.status} /></td>
                                                    {/* Hover: chỉ Xem, không sửa/ngừng KD */}
                                                    <td className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                        <div className="flex gap-1.5 bg-white/90 backdrop-blur-sm p-1 rounded-xl shadow-sm border border-gray-100">
                                                            <button className="h-8 px-2.5 rounded-lg flex items-center gap-1.5 text-[12px] font-bold hover:bg-gray-100 cursor-pointer transition" style={{ color: "var(--text-secondary)" }}><Eye size={14} /> Xem</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {paginatedProducts.length === 0 && (
                                            <tr><td colSpan={7} className="py-24 text-center">
                                                <div className="flex flex-col items-center gap-2" style={{ color: "var(--text-placeholder)" }}>
                                                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "var(--bg-main)" }}><Package size={28} strokeWidth={1.5} /></div>
                                                    <p className="text-sm font-medium mt-1">{productSearch ? `Không tìm thấy "${productSearch}"` : "Chưa có sản phẩm nào"}</p>
                                                </div>
                                            </td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <PaginationBar filtered={filteredProducts} />
                        </div>
                    </>
                )}

                {/* ════ TAB: HÀNG SẴN ════ */}
                {activeTab === "stock" && (
                    <div className="flex flex-col bg-white rounded-2xl flex-1 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                        <div className="px-4 py-3 border-b shrink-0 flex flex-wrap items-center gap-3" style={{ borderColor: "var(--grid-border)" }}>
                            <div className="relative w-72">
                                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-placeholder)" }} />
                                <input type="text" value={stockSearch} onChange={e => setStockSearch(e.target.value)} placeholder="Tìm mã, SKU, tên sản phẩm..."
                                    className="w-full h-9 pl-10 rounded-lg text-[13px] focus:outline-none focus:ring-2 transition"
                                    style={{ border: "1px solid var(--grid-border)", backgroundColor: "var(--bg-main)", color: "var(--text-main)" }} />
                            </div>
                            <select value={woodFilter} onChange={e => setWoodFilter(e.target.value)}
                                className="h-9 px-3 rounded-lg text-[13px] outline-none cursor-pointer"
                                style={{ border: "1px solid var(--grid-border)", color: "var(--text-main)" }}>
                                <option value="">Tất cả Loại Gỗ</option>
                                {WOOD_TYPES.map(w => <option key={w} value={w}>{w}</option>)}
                            </select>
                            <select value={colorFilter} onChange={e => setColorFilter(e.target.value)}
                                className="h-9 px-3 rounded-lg text-[13px] outline-none cursor-pointer"
                                style={{ border: "1px solid var(--grid-border)", color: "var(--text-main)" }}>
                                <option value="">Tất cả Màu Sơn</option>
                                {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            <table className="w-full text-left relative">
                                <thead className="sticky top-0 z-10" style={{ backgroundColor: "var(--grid-header-bg)", borderBottom: "1px solid var(--grid-border)" }}>
                                    <tr><TH>Mã</TH><TH>SKU</TH><TH>Tên sản phẩm</TH><TH>Loại Gỗ</TH><TH>Màu Sơn</TH><TH right>Giá bán</TH><TH center>Tồn kho</TH><TH>Trạng thái</TH></tr>
                                </thead>
                                <tbody>
                                    {filteredStock.map(v => {
                                        const isStopped = v.status === "Ngừng kinh doanh";
                                        return (
                                            <tr key={v.id} className="group relative hover:bg-gray-50/50 transition-colors" style={{ borderBottom: "1px solid var(--grid-border)", opacity: isStopped ? 0.55 : 1 }}>
                                                <td className="px-4 py-3"><span className="text-[12px] font-bold font-mono px-2 py-1 rounded" style={{ backgroundColor: "var(--bg-main)", color: "var(--text-main)", border: "1px solid var(--grid-border)" }}>{v.code}</span></td>
                                                <td className="px-4 py-3"><span className="text-[11px] font-bold font-mono px-2 py-1 rounded" style={{ backgroundColor: "#EEF2FF", color: "#4F46E5" }}>{v.sku}</span></td>
                                                <td className="px-4 py-3"><p className="text-[13px] font-semibold" style={{ color: "var(--text-main)" }}>{v.name}</p></td>
                                                <td className="px-4 py-3"><span className="text-[12px] font-bold px-2 py-1 rounded" style={{ backgroundColor: "#FFF7ED", color: "#C2410C" }}>{v.woodType}</span></td>
                                                <td className="px-4 py-3"><span className="text-[12px] font-bold px-2 py-1 rounded" style={{ backgroundColor: "#F0FDF4", color: "#15803D" }}>{v.color}</span></td>
                                                <td className="px-4 py-3 text-right"><p className="text-[13px] font-bold" style={{ color: "var(--text-main)" }}>{fmtCurrency(v.retailPrice)}</p></td>
                                                <td className="px-4 py-3 text-center"><span className="text-[13px] font-bold" style={{ color: v.stock === 0 ? "#DC2626" : "var(--text-main)" }}>{v.stock}</span></td>
                                                <td className="px-4 py-3"><StatusChip status={v.status} /></td>
                                                <td className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                    <div className="flex gap-1.5 bg-white/90 backdrop-blur-sm p-1 rounded-xl shadow-sm border border-gray-100">
                                                        <button className="h-8 px-2.5 rounded-lg flex items-center gap-1.5 text-[12px] font-bold hover:bg-gray-100 cursor-pointer transition" style={{ color: "var(--text-secondary)" }}><Eye size={14} /> Xem</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {filteredStock.length === 0 && (
                                        <tr><td colSpan={8} className="py-24 text-center"><div className="flex flex-col items-center gap-2" style={{ color: "var(--text-placeholder)" }}><div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "var(--bg-main)" }}><Warehouse size={28} strokeWidth={1.5} /></div><p className="text-sm font-medium mt-1">Không tìm thấy hàng sẵn</p></div></td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ════ TAB: ĐẶT THEO MẪU ════ */}
                {activeTab === "custom" && (
                    <div className="flex flex-col bg-white rounded-2xl flex-1 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                        <div className="px-4 py-3 border-b shrink-0" style={{ borderColor: "var(--grid-border)" }}>
                            <div className="relative w-full max-w-md">
                                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-placeholder)" }} />
                                <input type="text" value={customSearch} onChange={e => setCustomSearch(e.target.value)} placeholder="Tìm mã mẫu, tên sản phẩm..."
                                    className="w-full h-9 pl-10 rounded-lg text-[13px] focus:outline-none focus:ring-2 transition"
                                    style={{ border: "1px solid var(--grid-border)", backgroundColor: "var(--bg-main)", color: "var(--text-main)" }} />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            <table className="w-full text-left relative">
                                <thead className="sticky top-0 z-10" style={{ backgroundColor: "var(--grid-header-bg)", borderBottom: "1px solid var(--grid-border)" }}>
                                    <tr><TH>Mã mẫu</TH><TH>SKU</TH><TH>Tên sản phẩm</TH><TH>Danh mục</TH><TH>Loại gỗ khả dụng</TH><TH>Mức giá</TH><TH>TG sản xuất</TH><TH>Trạng thái</TH></tr>
                                </thead>
                                <tbody>
                                    {filteredCustom.map(m => {
                                        const isStopped = m.status === "Tạm ngưng";
                                        return (
                                            <tr key={m.id} className="group relative hover:bg-gray-50/50 transition-colors" style={{ borderBottom: "1px solid var(--grid-border)", opacity: isStopped ? 0.55 : 1 }}>
                                                <td className="px-4 py-3"><span className="text-[12px] font-bold font-mono px-2 py-1 rounded" style={{ backgroundColor: "var(--bg-main)", color: "var(--text-main)", border: "1px solid var(--grid-border)" }}>{m.code}</span></td>
                                                <td className="px-4 py-3">{m.sku ? <span className="text-[11px] font-bold font-mono px-2 py-1 rounded" style={{ backgroundColor: "#EEF2FF", color: "#4F46E5" }}>{m.sku}</span> : <span className="text-[11px] italic" style={{ color: "var(--text-placeholder)" }}>Chưa có</span>}</td>
                                                <td className="px-4 py-3"><p className="text-[13px] font-semibold" style={{ color: "var(--text-main)" }}>{m.name}</p></td>
                                                <td className="px-4 py-3"><span className="inline-block px-2.5 py-1 text-[11px] font-bold rounded-md" style={{ backgroundColor: "var(--bg-main)", color: "var(--text-secondary)", border: "1px solid var(--grid-border)" }}>{m.category}</span></td>
                                                <td className="px-4 py-3"><p className="text-[12px]" style={{ color: "var(--text-secondary)" }}>{m.woodOptions}</p></td>
                                                <td className="px-4 py-3"><p className="text-[13px] font-bold" style={{ color: "var(--text-main)" }}>{fmtCurrency(m.minPrice)} – {fmtCurrency(m.maxPrice)}</p></td>
                                                <td className="px-4 py-3"><p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>{m.leadTime}</p></td>
                                                <td className="px-4 py-3"><StatusChip status={m.status} /></td>
                                                <td className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                    <div className="flex gap-1.5 bg-white/90 backdrop-blur-sm p-1 rounded-xl shadow-sm border border-gray-100">
                                                        <button className="h-8 px-2.5 rounded-lg flex items-center gap-1.5 text-[12px] font-bold hover:bg-gray-100 cursor-pointer transition" style={{ color: "var(--text-secondary)" }}><Eye size={14} /> Xem</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {filteredCustom.length === 0 && (
                                        <tr><td colSpan={8} className="py-24 text-center"><div className="flex flex-col items-center gap-2" style={{ color: "var(--text-placeholder)" }}><div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "var(--bg-main)" }}><Ruler size={28} strokeWidth={1.5} /></div><p className="text-sm font-medium mt-1">Không tìm thấy mẫu nào</p></div></td></tr>
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
