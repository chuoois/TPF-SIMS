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
    Search, Package, Warehouse,
    Eye, X, ChevronLeft, ChevronRight,
    Image as ImageIcon, CheckCircle, Hammer, Users, AlertTriangle, Clock,
} from "lucide-react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import ViewProductModal from "./ViewProductModal";
import EditProductModal from "./EditProductModal";
import { toast } from "react-hot-toast";

// ─────────────────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────────────────
const CATEGORIES = ["Phòng khách", "Phòng ngủ", "Phòng thờ", "Phòng ăn"];

const ALL_PRODUCTS = [
    // FINISHED – Hàng có sẵn
    { id: "P001", sku: "BBG-HS-180x90x75-Huong", name: "Bộ bàn ghế Nghê Bảo Đỉnh 6 món", category: "Phòng khách", type: "FINISHED", materialType: "Gỗ Hương", color: "Hương", stock: 5, importPrice: 38000000, sellingPrice: 55000000, img: "https://placehold.co/80x80?text=SP001", length: "180", width: "90", height: "75", minStock: 2, importedAt: "2025-12-20", details: "Bộ 6 món gồm 1 bàn lớn, 4 ghế tựa và 1 ghế chủ. Chạm khắc hình nghê bảo đỉnh tinh xảo, sơn PU cao cấp." },
    { id: "P003", sku: "STM-HS-200x100x60-Chay", name: "Sập thờ Mai Điểu chân 20", category: "Phòng thờ", type: "FINISHED", materialType: "Gỗ Gụ", color: "Chay", stock: 2, importPrice: 18000000, sellingPrice: 27000000, img: "https://placehold.co/80x80?text=SP003", length: "200", width: "100", height: "60", minStock: 1, importedAt: "2026-01-05", details: "Chạm khắc hoa văn mai điểu tứ quý, chân chạm 20 vòng. Gỗ gụ mật già, màu chay tự nhiên." },
    { id: "P005", sku: "HPD-HS-120x40x5-Huong", name: "Hoành phi câu đối chạm rồng", category: "Phòng thờ", type: "FINISHED", materialType: "Gỗ Hương", color: "Hương", stock: 6, importPrice: 9500000, sellingPrice: 15000000, img: "https://placehold.co/80x80?text=SP005", length: "120", width: "40", height: "5", minStock: 2, importedAt: "2026-03-01", details: "Bộ hoành phi 1 tấm + 2 câu đối. Chạm rồng 5 móng nổi, sơn thiếp vàng 24k." },
    { id: "P006", sku: "BBA-HS-220x100x78-Huong", name: "Bộ bàn ăn 8 ghế nguyên khối", category: "Phòng ăn", type: "FINISHED", materialType: "Gỗ Hương", color: "Hương", stock: 3, importPrice: 32000000, sellingPrice: 48000000, img: "https://placehold.co/80x80?text=SP006", length: "220", width: "100", height: "78", minStock: 1, importedAt: "2026-02-10", details: "Bộ gồm 1 bàn + 8 ghế. Mặt bàn nguyên khối liền, chân chạm hoa văn truyền thống. Sơn PU bóng." },
    { id: "P007", sku: "KTV-HS-180x45x55-Tran", name: "Kệ tivi nguyên khối mặt liền", category: "Phòng khách", type: "FINISHED", materialType: "Gỗ Gõ Đỏ", color: "Trần", stock: 0, importPrice: 22000000, sellingPrice: 32000000, img: null, length: "180", width: "45", height: "55", minStock: 1, importedAt: "2025-12-01", details: "Kệ tivi 3 ngăn, mặt liền không mộng. Gỗ gõ đỏ trần tự nhiên, giữ vân gỗ." },
    { id: "P008", sku: "TQA-HS-220x60x240-Chay", name: "Tủ quần áo 4 cánh chạm hoa lá tây", category: "Phòng ngủ", type: "FINISHED", materialType: "Gỗ Gụ", color: "Chay", stock: 4, importPrice: 22000000, sellingPrice: 33000000, img: null, length: "220", width: "60", height: "240", minStock: 2, importedAt: "2026-01-20", details: "Tủ 4 cánh, chạm hoa lá tây nổi trên toàn bộ cánh tủ. Bên trong có ngăn kéo và thanh treo." },
    { id: "P010", sku: "TRU-HS-120x40x180-OcCho", name: "Tủ rượu nguyên khối cánh kính", category: "Phòng khách", type: "FINISHED", materialType: "Gỗ Sồi Nga", color: "Óc chó", stock: 1, importPrice: 19000000, sellingPrice: 28000000, img: null, length: "120", width: "40", height: "180", minStock: 1, importedAt: "2025-11-15", details: "Tủ rượu cánh kính cường lực, thân gỗ sồi Nga, màu óc chó đậm. 3 tầng kệ bên trong." },
    { id: "P011", sku: "GNG-HS-200x160x50-OcCho", name: "Giường ngủ hoa hồng Tân cổ điển", category: "Phòng ngủ", type: "FINISHED", materialType: "Gỗ Sồi Nga", color: "Óc chó", stock: 4, importPrice: 15000000, sellingPrice: 24000000, img: null, length: "200", width: "160", height: "50", minStock: 2, importedAt: "2026-02-25", details: "Giường đôi, đầu giường chạm hoa hồng nổi. Phù hợp trang trí phòng ngủ tân cổ điển." },

    // RAW – Hàng mộc
    { id: "P002", sku: "SFA-HM-260x160x85-raw", name: "Sofa nguyên khối chữ L", category: "Phòng khách", type: "RAW", materialType: "Gỗ Gõ Đỏ", color: "raw", stock: 12, importPrice: 25000000, sellingPrice: null, img: null, length: "260", width: "160", height: "85", minStock: 3, importedAt: "2026-01-10", details: "Khung sofa nguyên khối gỗ gõ đỏ, chưa bọc đệm. Dùng để bán thô hoặc gia công thêm." },
    { id: "P004", sku: "GNG-HM-200x160x50-raw", name: "Giường ngủ hoa hồng Tân cổ điển (mộc)", category: "Phòng ngủ", type: "RAW", materialType: "Gỗ Sồi Nga", color: "raw", stock: 8, importPrice: 12000000, sellingPrice: null, img: null, length: "200", width: "160", height: "50", minStock: 2, importedAt: "2025-12-10", details: "Phôi giường chưa sơn, chưa đánh bóng. Cần gia công sơn PU trước khi xuất." },
    { id: "P009", sku: "BTT-HM-180x60x100-raw", name: "Bàn thờ chạm rồng cuốn thủy (mộc)", category: "Phòng thờ", type: "RAW", materialType: "Gỗ Hương", color: "raw", stock: 7, importPrice: 28000000, sellingPrice: null, img: null, length: "180", width: "60", height: "100", minStock: 2, importedAt: "2026-02-01", details: "Bàn thờ chạm rồng cuốn thủy, chưa sơn. Đang chờ lô sơn để hoàn thiện." },
    { id: "P012", sku: "GHV-HM-45x45x95-raw", name: "Ghế chạm hoa văn (mộc)", category: "Phòng ăn", type: "RAW", materialType: "Gỗ Mít", color: "raw", stock: 20, importPrice: 3500000, sellingPrice: null, img: null, length: "45", width: "45", height: "95", minStock: 5, importedAt: "2025-10-01", details: "Ghế ăn phôi thô, khung chạm hoa văn dây leo. Bộ 4–8 chiếc tùy đơn." },

    // CUSTOM – Hàng khách đặt
    { id: "P013", sku: "BBG-KD-180x90x75-Huong", name: "Bộ bàn ghế Nghê Bảo Đỉnh 6 món – ĐĐ anh Tuấn", category: "Phòng khách", type: "CUSTOM", materialType: "Gỗ Hương", color: "Hương", stock: 2, importPrice: 42000000, sellingPrice: 65000000, img: null, length: "180", width: "90", height: "75", minStock: null, importedAt: "2026-03-10", details: "Đơn đặt của anh Tuấn. Bộ 6 món, yêu cầu chạm thêm hoa văn riêng. Dự kiến giao 25/03/2026." },
    { id: "P014", sku: "GHH-KD-200x160x50-Chay", name: "Giường hoa hồng – ĐĐ cô Lan", category: "Phòng ngủ", type: "CUSTOM", materialType: "Gỗ Gụ", color: "Chay", stock: 1, importPrice: 22000000, sellingPrice: 35000000, img: null, length: "200", width: "160", height: "50", minStock: null, importedAt: "2026-03-12", details: "Đơn của cô Lan. Đã hoàn thiện, chờ khách nhận ngày 15/03/2026." },
    { id: "P015", sku: "ST6-KD-200x100x60-CanhGian", name: "Sập thờ 6 chân – ĐĐ anh Minh", category: "Phòng thờ", type: "CUSTOM", materialType: "Gỗ Gụ", color: "Cánh gián", stock: 1, importPrice: 30000000, sellingPrice: 45000000, img: null, length: "200", width: "100", height: "60", minStock: null, importedAt: "2026-03-05", details: "Đơn của anh Minh. Sập 6 chân chạm hoa văn theo yêu cầu riêng. Đã giao xong." },
    { id: "P016", sku: "BTR-KD-200x70x110-Huong", name: "Bàn thờ rồng lớn – ĐĐ gia đình bà Hà", category: "Phòng thờ", type: "CUSTOM", materialType: "Gỗ Hương", color: "Hương", stock: 1, importPrice: 38000000, sellingPrice: 55000000, img: null, length: "200", width: "70", height: "110", minStock: null, importedAt: "2026-02-20", details: "Đơn của gia đình bà Hà. Bàn thờ rồng 5 móng, yêu cầu thiếp vàng 24k. Dự kiến giao 01/04/2026." },
];

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
        label: "Dưới định mức tồn kho",
        icon: AlertTriangle,
        activeStyle: { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA" },
    },
    {
        value: "LONG_STAY",
        label: "Tồn lâu > 60 ngày",
        icon: Clock,
        activeStyle: { bg: "#FFF7ED", text: "#9A3412", border: "#FDBA74" },
    },
];

const TYPE_BADGE = {
    FINISHED: { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0", label: "Có sẵn" },
    RAW: { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA", label: "Hàng mộc" },
    CUSTOM: { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE", label: "Khách đặt" },
};

const fmtCurrency = (n) =>
    n != null ? new Intl.NumberFormat("vi-VN").format(n) + "₫" : "—";

// ── Hỗ trợ tính ngày tồn kho ──────────────────────────────
const TODAY = new Date("2026-03-17");
const getDaysInStock = (importedAt) => {
    if (!importedAt) return null;
    const d = Math.floor((TODAY - new Date(importedAt)) / (1000 * 60 * 60 * 24));
    return d;
};

// Ngưỡng: <30 OK, 30-60 chú ý, >60 cảnh báo
const getDaysStyle = (days) => {
    if (days === null) return null;
    if (days > 60) return { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA", label: `${days} ngày` };
    if (days > 30) return { bg: "#FFFBEB", text: "#D97706", border: "#FDE68A", label: `${days} ngày` };
    return { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0", label: `${days} ngày` };
};

const LONG_STAY_DAYS = 60; // ngưỡng cảnh báo tồn lâu

// ─────────────────────────────────────────────────────────
export default function AccountantProductManage() {
    const [products, setProducts] = useState(ALL_PRODUCTS);
    const [editProduct, setEditProduct] = useState(null);
    const [typeFilter, setTypeFilter] = useState("ALL");
    const [categoryFilter, setCategoryFilter] = useState("Tất cả");
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [viewProduct, setViewProduct] = useState(null);

    const handleSaveProduct = (updated) => {
        setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
        setEditProduct(null);
        toast.success("Đã cập nhật thông tin sản phẩm!", { style: { fontSize: "14px" } });
    };

    const filtered = useMemo(() => {
        let r = products;
        if (typeFilter === "LOW_STOCK") {
            r = r.filter(p => p.type === "FINISHED" && p.minStock != null && p.stock <= p.minStock);
        } else if (typeFilter === "LONG_STAY") {
            r = r.filter(p => getDaysInStock(p.importedAt) > LONG_STAY_DAYS);
        } else if (typeFilter !== "ALL") {
            r = r.filter(p => p.type === typeFilter);
        }
        if (categoryFilter !== "Tất cả") r = r.filter(p => p.category === categoryFilter);
        if (search.trim()) {
            const q = search.toLowerCase();
            r = r.filter(p =>
                p.name.toLowerCase().includes(q) ||
                p.sku.toLowerCase().includes(q) ||
                p.materialType?.toLowerCase().includes(q)
            );
        }
        return r;
    }, [typeFilter, categoryFilter, search]);

    useEffect(() => { setCurrentPage(1); }, [typeFilter, categoryFilter, search]);

    const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
    const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // counts per type
    const counts = useMemo(() => {
        const c = { ALL: products.length, FINISHED: 0, RAW: 0, CUSTOM: 0, LOW_STOCK: 0, LONG_STAY: 0 };
        products.forEach(p => {
            c[p.type] = (c[p.type] || 0) + 1;
            if (p.type === "FINISHED" && p.minStock != null && p.stock <= p.minStock) {
                c.LOW_STOCK = (c.LOW_STOCK || 0) + 1;
            }
            if (getDaysInStock(p.importedAt) > LONG_STAY_DAYS) {
                c.LONG_STAY = (c.LONG_STAY || 0) + 1;
            }
        });
        return c;
    }, [products]);

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

    return (
        <>
            <PageHelmet title="Kho hàng | Kế toán" />
            <div className="flex flex-col h-[calc(100vh-64px)] -m-6 p-6 space-y-4" style={{ backgroundColor: "var(--bg-main)" }}>

                {/* ── Header ── */}
                <div className="flex items-center justify-between shrink-0">
                    <div>
                        <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: "var(--text-main)" }}>
                            <Warehouse size={22} style={{ color: "var(--brand-primary)" }} />
                            Kho hàng
                        </h1>
                        <p className="text-[13px] mt-0.5" style={{ color: "var(--text-placeholder)" }}>
                            {filtered.length} sản phẩm
                            {typeFilter !== "ALL" && ` · ${TYPE_FILTERS.find(t => t.value === typeFilter)?.label}`}
                        </p>
                        {typeFilter === "LOW_STOCK" && (
                            <p className="text-[12px] mt-0.5 font-medium" style={{ color: "#DC2626" }}>
                                ⚠️ Các sản phẩm này cần nhập hàng bổ sung
                            </p>
                        )}
                        {typeFilter === "LONG_STAY" && (
                            <p className="text-[12px] mt-0.5 font-medium" style={{ color: "#9A3412" }}>
                                ⏰ Hàng tồn trong kho quá {LONG_STAY_DAYS} ngày, cần xem xét xử lý
                            </p>
                        )}
                    </div>
                </div>

                {/* ── Filter pills theo loại hàng ── */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    {TYPE_FILTERS.map(tf => {
                        const isActive = typeFilter === tf.value;
                        const Icon = tf.icon;
                        const s = tf.activeStyle;
                        return (
                            <button key={tf.value} onClick={() => setTypeFilter(tf.value)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all cursor-pointer"
                                style={{
                                    backgroundColor: isActive ? s.bg : "transparent",
                                    color: isActive ? s.text : "var(--text-secondary)",
                                    border: isActive ? `1.5px solid ${s.border}` : "1.5px solid transparent",
                                }}>
                                <Icon size={13} style={{ opacity: isActive ? 1 : 0.5 }} />
                                {tf.label}
                                <span className="text-[11px] opacity-60">({counts[tf.value] ?? 0})</span>
                            </button>
                        );
                    })}
                </div>

                {/* ── Table card ── */}
                <div className="flex flex-col bg-white rounded-2xl flex-1 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                    {/* Toolbar: search + category */}
                    <div className="px-4 py-3 border-b shrink-0 flex flex-wrap items-center gap-3" style={{ borderColor: "var(--grid-border)" }}>
                        <div className="relative w-full max-w-sm">
                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-placeholder)" }} />
                            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="Tìm SKU, tên, loại..."
                                className="w-full h-9 pl-10 pr-8 rounded-lg text-[13px] focus:outline-none focus:ring-2 transition"
                                style={{ border: "1px solid var(--grid-border)", backgroundColor: "var(--bg-main)", color: "var(--text-main)" }} />
                            {search && (
                                <button onClick={() => setSearch("")}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
                                    style={{ color: "var(--text-placeholder)" }}><X size={14} /></button>
                            )}
                        </div>

                        {/* Danh mục */}
                        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
                            className="h-9 px-3 rounded-lg text-[13px] outline-none cursor-pointer shrink-0"
                            style={{ border: "1px solid var(--grid-border)", color: "var(--text-main)", backgroundColor: "#fff" }}>
                            <option value="Tất cả">Tất cả danh mục</option>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>

                        {(search || categoryFilter !== "Tất cả") && (
                            <button onClick={() => { setSearch(""); setCategoryFilter("Tất cả"); }}
                                className="h-9 px-3 rounded-lg text-[13px] font-medium flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition"
                                style={{ color: "#DC2626", backgroundColor: "#FEF2F2", border: "1px solid #FECACA" }}>
                                <X size={14} /> Xóa bộ lọc
                            </button>
                        )}
                    </div>

                    {/* Table */}
                    <div className="flex-1 overflow-y-auto">
                        <table className="w-full text-left relative">
                            <thead className="sticky top-0 z-10" style={{ backgroundColor: "var(--grid-header-bg)", borderBottom: "1px solid var(--grid-border)" }}>
                                <tr>
                                    <TH>Ảnh</TH>
                                    <TH>Mã SKU</TH>
                                    <TH>Tên sản phẩm</TH>
                                    <TH>Danh mục</TH>
                                    <TH>Loại hàng</TH>
                                    <TH>Loại</TH>
                                    <TH>Màu sắc</TH>
                                    <TH>Tồn từ</TH>
                                    <TH right>Giá bán</TH>
                                    <TH center>Tồn kho</TH>
                                    <th className="w-24 px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.map(p => {
                                    const badge = TYPE_BADGE[p.type];
                                    return (
                                        <tr key={p.id} className="group relative hover:bg-gray-50/50 transition-colors"
                                            style={{ borderBottom: "1px solid var(--grid-border)" }}>
                                            {/* Ảnh */}
                                            <td className="px-4 py-3">
                                                {p.img
                                                    ? <img src={p.img} alt={p.name} className="w-10 h-10 rounded-lg object-cover"
                                                        style={{ border: "1px solid var(--grid-border)" }} />
                                                    : <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                                                        style={{ backgroundColor: "var(--bg-main)", border: "1px solid var(--grid-border)" }}>
                                                        <ImageIcon size={16} style={{ color: "var(--text-placeholder)" }} />
                                                    </div>}
                                            </td>
                                            {/* Mã SKU */}
                                            <td className="px-4 py-3">
                                                <span className="text-[12px] font-bold font-mono px-2 py-1 rounded"
                                                    style={{ backgroundColor: "var(--bg-main)", color: "var(--text-main)", border: "1px solid var(--grid-border)" }}>
                                                    {p.sku}
                                                </span>
                                            </td>
                                            {/* Tên */}
                                            <td className="px-4 py-3 max-w-[240px]">
                                                <p className="text-[13px] font-semibold truncate"
                                                    style={{ color: "var(--text-main)" }}>
                                                    {p.name}
                                                </p>
                                            </td>
                                            {/* Danh mục */}
                                            <td className="px-4 py-3">
                                                <span className="inline-block px-2.5 py-1 text-[11px] font-bold rounded-md"
                                                    style={{ backgroundColor: "var(--bg-main)", color: "var(--text-secondary)", border: "1px solid var(--grid-border)" }}>
                                                    {p.category}
                                                </span>
                                            </td>
                                            {/* Loại hàng */}
                                            <td className="px-4 py-3">
                                                <span className="inline-block px-2.5 py-1 text-[11px] font-bold rounded-md"
                                                    style={{ backgroundColor: badge.bg, color: badge.text, border: `1px solid ${badge.border}` }}>
                                                    {badge.label}
                                                </span>
                                            </td>
                                            {/* Loại */}
                                            <td className="px-4 py-3">
                                                <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>{p.materialType || "—"}</span>
                                            </td>
                                            {/* Màu */}
                                            <td className="px-4 py-3">
                                                <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>{p.color || "—"}</span>
                                            </td>
                                            {/* Tồn từ (ngày) */}
                                            <td className="px-4 py-3">
                                                {(() => {
                                                    const days = getDaysInStock(p.importedAt);
                                                    const ds = getDaysStyle(days);
                                                    if (!ds) return <span className="text-[12px]" style={{ color: "var(--text-placeholder)" }}>—</span>;
                                                    return (
                                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md"
                                                            style={{ backgroundColor: ds.bg, color: ds.text, border: `1px solid ${ds.border}` }}>
                                                            <Clock size={10} />
                                                            {ds.label}
                                                        </span>
                                                    );
                                                })()}
                                            </td>
                                            {/* Giá bán */}
                                            <td className="px-4 py-3 text-right">
                                                <span className="text-[13px] font-bold" style={{ color: "var(--text-main)" }}>
                                                    {fmtCurrency(p.sellingPrice)}
                                                </span>
                                            </td>
                                            {/* Tồn kho */}
                                            <td className="px-4 py-3 text-center">
                                                <span className="text-[13px] font-bold"
                                                    style={{ color: p.stock === 0 ? "#DC2626" : p.stock <= p.minStock ? "#D97706" : "var(--text-main)" }}>
                                                    {p.stock}
                                                </span>
                                            </td>

                                            {/* Spacer */}
                                            <td className="px-4 py-3"></td>

                                            {/* Hover action */}
                                            <td className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                <div className="flex gap-1.5 bg-white/90 backdrop-blur-sm p-1 rounded-xl shadow-sm border border-gray-100">
                                                    <button onClick={() => setViewProduct(p)}
                                                        className="h-8 px-2.5 rounded-lg flex items-center gap-1.5 text-[12px] font-bold hover:bg-gray-100 cursor-pointer transition"
                                                        style={{ color: "var(--text-secondary)" }}>
                                                        <Eye size={14} /> Xem
                                                    </button>
                                                    <button onClick={() => setEditProduct(p)}
                                                        className="h-8 px-2.5 rounded-lg flex items-center gap-1.5 text-[12px] font-bold hover:bg-blue-50 cursor-pointer transition"
                                                        style={{ color: "var(--brand-primary)" }}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22h6" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                                                        Sửa
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {paginated.length === 0 && (
                                    <tr><td colSpan={9} className="py-24 text-center">
                                        <div className="flex flex-col items-center gap-2" style={{ color: "var(--text-placeholder)" }}>
                                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "var(--bg-main)" }}>
                                                <Package size={28} strokeWidth={1.5} />
                                            </div>
                                            <p className="text-sm font-medium mt-1">
                                                {search ? `Không tìm thấy "${search}"` : "Không có sản phẩm nào"}
                                            </p>
                                        </div>
                                    </td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {filtered.length > 0 && (
                        <div className="flex items-center justify-between px-6 py-3 border-t shrink-0"
                            style={{ borderColor: "var(--grid-border)", backgroundColor: "var(--bg-main)" }}>
                            <div className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                                Tổng: <span className="font-bold" style={{ color: "var(--text-main)" }}>{filtered.length}</span> sản phẩm
                            </div>
                            <div className="flex items-center gap-5">
                                <div className="flex items-center gap-2">
                                    <span className="text-[13px]" style={{ color: "var(--text-secondary)" }}>Bản ghi/trang</span>
                                    <select value={itemsPerPage} onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                                        className="h-8 px-2 pr-6 rounded-md text-[13px] border cursor-pointer appearance-none"
                                        style={{
                                            borderColor: "var(--grid-border)", backgroundColor: "#fff", color: "var(--text-main)",
                                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                                            backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center",
                                        }}>
                                        {[15, 30, 50].map(n => <option key={n} value={n}>{n}</option>)}
                                    </select>
                                </div>
                                <span className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                                    <span className="font-bold" style={{ color: "var(--text-main)" }}>
                                        {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filtered.length)}
                                    </span> sản phẩm
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
                    )}
                </div>
            </div>
            {viewProduct && (
                <ViewProductModal
                    product={viewProduct}
                    onClose={() => setViewProduct(null)}
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
