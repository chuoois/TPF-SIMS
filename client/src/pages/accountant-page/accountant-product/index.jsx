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
    Image as ImageIcon, CheckCircle, Hammer, Users,
} from "lucide-react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import ViewProductModal from "./ViewProductModal";

// ─────────────────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────────────────
const CATEGORIES = ["Phòng khách", "Phòng ngủ", "Phòng thờ", "Phòng ăn"];

const ALL_PRODUCTS = [
    // FINISHED – Hàng hoàn thiện
    { id: "P001", code: "SP-PK-001", name: "Bộ bàn ghế Nghê Bảo Đỉnh 6 món",         category: "Phòng khách", type: "FINISHED", woodType: "Gỗ Hương",   color: "Hương",      stock: 5,  importPrice: 38000000, sellingPrice: 55000000, status: "Đang kinh doanh",  img: "https://placehold.co/80x80?text=SP001", length: "180", width: "90",  height: "75",  minStock: 2,    maxStock: 10,   location: "Kho A – Tầng 1, Dãy C",         details: "Bộ 6 món gồm 1 bàn lớn, 4 ghế tựa và 1 ghế chủ. Chạm khắc hình nghê bảo đỉnh tinh xảo, sơn PU cao cấp." },
    { id: "P003", code: "SP-PT-001", name: "Sập thờ Mai Điểu chân 20",                category: "Phòng thờ",   type: "FINISHED", woodType: "Gỗ Gụ",      color: "Chay",       stock: 2,  importPrice: 18000000, sellingPrice: 27000000, status: "Đang kinh doanh",  img: "https://placehold.co/80x80?text=SP003", length: "200", width: "100", height: "60",  minStock: 1,    maxStock: 5,    location: "Kho B – Tầng 1, Dãy A",         details: "Chạm khắc hoa văn mai điểu tứ quý, chân chạm 20 vòng. Gỗ gụ mật già, màu chay tự nhiên." },
    { id: "P005", code: "SP-PT-002", name: "Hoành phi câu đối chạm rồng",             category: "Phòng thờ",   type: "FINISHED", woodType: "Gỗ Hương",   color: "Hương",      stock: 6,  importPrice: 9500000,  sellingPrice: 15000000, status: "Đang kinh doanh",  img: "https://placehold.co/80x80?text=SP005", length: "120", width: "40",  height: "5",   minStock: 2,    maxStock: 15,   location: "Kho A – Tầng 2, Dãy B",         details: "Bộ hoành phi 1 tấm + 2 câu đối. Chạm rồng 5 móng nổi, sơn thiếp vàng 24k." },
    { id: "P006", code: "SP-PA-001", name: "Bộ bàn ăn 8 ghế nguyên khối",            category: "Phòng ăn",    type: "FINISHED", woodType: "Gỗ Hương",   color: "Hương",      stock: 3,  importPrice: 32000000, sellingPrice: 48000000, status: "Đang kinh doanh",  img: "https://placehold.co/80x80?text=SP006", length: "220", width: "100", height: "78",  minStock: 1,    maxStock: 6,    location: "Kho A – Tầng 1, Dãy D",         details: "Bộ gồm 1 bàn + 8 ghế. Mặt bàn nguyên khối liền, chân chạm hoa văn truyền thống. Sơn PU bóng." },
    { id: "P007", code: "SP-PK-003", name: "Kệ tivi nguyên khối mặt liền",            category: "Phòng khách", type: "FINISHED", woodType: "Gỗ Gõ Đỏ",  color: "Trần",       stock: 0,  importPrice: 22000000, sellingPrice: 32000000, status: "Ngừng kinh doanh", img: null,                                     length: "180", width: "45",  height: "55",  minStock: 1,    maxStock: 5,    location: "Kho C – Tầng 1",                 details: "Kệ tivi 3 ngăn, mặt liền không mộng. Gỗ gõ đỏ trần tự nhiên, giữ vân gỗ." },
    { id: "P008", code: "SP-PN-002", name: "Tủ quần áo 4 cánh chạm hoa lá tây",      category: "Phòng ngủ",   type: "FINISHED", woodType: "Gỗ Gụ",      color: "Chay",       stock: 4,  importPrice: 22000000, sellingPrice: 33000000, status: "Đang kinh doanh",  img: null,                                     length: "220", width: "60",  height: "240", minStock: 2,    maxStock: 8,    location: "Kho A – Tầng 3, Dãy A",         details: "Tủ 4 cánh, chạm hoa lá tây nổi trên toàn bộ cánh tủ. Bên trong có ngăn kéo và thanh treo." },
    { id: "P010", code: "SP-PK-004", name: "Tủ rượu nguyên khối cánh kính",           category: "Phòng khách", type: "FINISHED", woodType: "Gỗ Sồi Nga", color: "Óc chó",     stock: 1,  importPrice: 19000000, sellingPrice: 28000000, status: "Ngừng kinh doanh", img: null,                                     length: "120", width: "40",  height: "180", minStock: 1,    maxStock: 4,    location: "Kho C – Tầng 2",                 details: "Tủ rượu cánh kính cường lực, thân gỗ sồi Nga, màu óc chó đậm. 3 tầng kệ bên trong." },
    { id: "P011", code: "SP-PN-003", name: "Giường ngủ hoa hồng Tân cổ điển",         category: "Phòng ngủ",   type: "FINISHED", woodType: "Gỗ Sồi Nga", color: "Óc chó",     stock: 4,  importPrice: 15000000, sellingPrice: 24000000, status: "Đang kinh doanh",  img: null,                                     length: "200", width: "160", height: "50",  minStock: 2,    maxStock: 8,    location: "Kho B – Tầng 2, Dãy C",         details: "Giường đôi, đầu giường chạm hoa hồng nổi. Phù hợp trang trí phòng ngủ tân cổ điển." },

    // RAW – Hàng thô
    { id: "P002", code: "SP-PK-002", name: "Sofa nguyên khối chữ L",                   category: "Phòng khách", type: "RAW",      woodType: "Gỗ Gõ Đỏ",  color: "Nguyên mộc", stock: 12, importPrice: 25000000, sellingPrice: null,     status: "Đang kinh doanh",  img: null,                                     length: "260", width: "160", height: "85",  minStock: 3,    maxStock: 20,   location: "Kho D – Tầng 1",                 details: "Khung sofa nguyên khối gỗ gõ đỏ, chưa bọc đệm. Dùng để bán thô hoặc gia công thêm." },
    { id: "P004", code: "SP-PN-001", name: "Giường ngủ hoa hồng Tân cổ điển (mộc)",   category: "Phòng ngủ",   type: "RAW",      woodType: "Gỗ Sồi Nga", color: "Nguyên mộc", stock: 8,  importPrice: 12000000, sellingPrice: null,     status: "Đang kinh doanh",  img: null,                                     length: "200", width: "160", height: "50",  minStock: 2,    maxStock: 12,   location: "Kho D – Tầng 2",                 details: "Phôi giường chưa sơn, chưa đánh bóng. Cần gia công sơn PU trước khi xuất." },
    { id: "P009", code: "SP-PT-003", name: "Bàn thờ chạm rồng cuốn thủy (mộc)",       category: "Phòng thờ",   type: "RAW",      woodType: "Gỗ Hương",   color: "Nguyên mộc", stock: 7,  importPrice: 28000000, sellingPrice: null,     status: "Đang kinh doanh",  img: null,                                     length: "180", width: "60",  height: "100", minStock: 2,    maxStock: 10,   location: "Kho D – Tầng 1, Dãy B",         details: "Bàn thờ chạm rồng cuốn thủy, chưa sơn. Đang chờ lô sơn để hoàn thiện." },
    { id: "P012", code: "SP-PA-002", name: "Ghế chạm hoa văn (mộc)",                   category: "Phòng ăn",    type: "RAW",      woodType: "Gỗ Mít",     color: "Nguyên mộc", stock: 20, importPrice: 3500000,  sellingPrice: null,     status: "Đang kinh doanh",  img: null,                                     length: "45",  width: "45",  height: "95",  minStock: 5,    maxStock: 30,   location: "Kho D – Tầng 3",                 details: "Ghế ăn phôi thô, khung chạm hoa văn dây leo. Bộ 4–8 chiếc tùy đơn." },

    // CUSTOM – Hàng khách đặt
    { id: "P013", code: "KD-PK-001", name: "Bộ bàn ghế Nghê Bảo Đỉnh 6 món – ĐĐ anh Tuấn", category: "Phòng khách", type: "CUSTOM", woodType: "Gỗ Hương",   color: "Hương",      stock: 2, importPrice: 42000000, sellingPrice: 65000000, status: "Đang sản xuất",  img: null, length: "180", width: "90",  height: "75",  minStock: null, maxStock: null, location: "Kho sản xuất – Xưởng 2",         details: "Đơn đặt của anh Tuấn – TP.HCM. Bộ 6 món, yêu cầu chạm thêm hoa văn riêng theo mẫu. Dự kiến giao 25/03/2026." },
    { id: "P014", code: "KD-PN-001", name: "Giường hoa hồng – ĐĐ cô Lan",              category: "Phòng ngủ",   type: "CUSTOM", woodType: "Gỗ Gụ",      color: "Chay",       stock: 1, importPrice: 22000000, sellingPrice: 35000000, status: "Hoàn thành",       img: null, length: "200", width: "160", height: "50",  minStock: null, maxStock: null, location: "Kho B – Tầng 2, Dãy D",         details: "Đơn đặt của cô Lan – Hà Nội. Đã hoàn thiện, chờ khách đến nhận ngày 15/03/2026." },
    { id: "P015", code: "KD-PT-001", name: "Sập thờ 6 chân – ĐĐ anh Minh",             category: "Phòng thờ",   type: "CUSTOM", woodType: "Gỗ Gụ",      color: "Cánh gián",  stock: 1, importPrice: 30000000, sellingPrice: 45000000, status: "Hoàn thành",       img: null, length: "200", width: "100", height: "60",  minStock: null, maxStock: null, location: "Kho B – Tầng 1, Dãy B",         details: "Đơn đặt của anh Minh – Hải Phòng. Sập 6 chân chạm hoa văn theo yêu cầu riêng. Đã giao xong." },
    { id: "P016", code: "KD-PT-002", name: "Bàn thờ rồng lớn – ĐĐ gia đình bà Hà",     category: "Phòng thờ",   type: "CUSTOM", woodType: "Gỗ Hương",   color: "Hương",      stock: 1, importPrice: 38000000, sellingPrice: 55000000, status: "Đang sản xuất",  img: null, length: "200", width: "70",  height: "110", minStock: null, maxStock: null, location: "Kho sản xuất – Xưởng 1",         details: "Đơn của gia đình bà Hà – Nam Định. Bàn thờ rồng 5 móng kích thước lớn, yêu cầu thiếp vàng thật 24k. Dự kiến giao 01/04/2026." },
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
        label: "Hàng hoàn thiện",
        icon: CheckCircle,
        activeStyle: { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
    },
    {
        value: "RAW",
        label: "Hàng thô",
        icon: Hammer,
        activeStyle: { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
    },
    {
        value: "CUSTOM",
        label: "Hàng khách đặt",
        icon: Users,
        activeStyle: { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
    },
];

const TYPE_BADGE = {
    FINISHED: { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0", label: "Hoàn thiện" },
    RAW:      { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA", label: "Hàng thô" },
    CUSTOM:   { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE", label: "Khách đặt" },
};

const fmtCurrency = (n) =>
    n != null ? new Intl.NumberFormat("vi-VN").format(n) + "₫" : "—";

const getStatusColor = (status) => {
    if (["Đang kinh doanh", "Đang sản xuất"].includes(status))
        return { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" };
    if (status === "Hoàn thành")
        return { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" };
    return { bg: "#F3F4F6", text: "#6B7280", border: "#D1D5DB" };
};

// ─────────────────────────────────────────────────────────
export default function AccountantProductManage() {
    const [typeFilter, setTypeFilter] = useState("ALL");
    const [categoryFilter, setCategoryFilter] = useState("Tất cả");
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [viewProduct, setViewProduct] = useState(null);

    const filtered = useMemo(() => {
        let r = ALL_PRODUCTS;
        if (typeFilter !== "ALL") r = r.filter(p => p.type === typeFilter);
        if (categoryFilter !== "Tất cả") r = r.filter(p => p.category === categoryFilter);
        if (search.trim()) {
            const q = search.toLowerCase();
            r = r.filter(p =>
                p.name.toLowerCase().includes(q) ||
                p.code.toLowerCase().includes(q) ||
                p.woodType?.toLowerCase().includes(q)
            );
        }
        return r;
    }, [typeFilter, categoryFilter, search]);

    useEffect(() => { setCurrentPage(1); }, [typeFilter, categoryFilter, search]);

    const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
    const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // counts per type
    const counts = useMemo(() => {
        const c = { ALL: ALL_PRODUCTS.length, FINISHED: 0, RAW: 0, CUSTOM: 0 };
        ALL_PRODUCTS.forEach(p => { c[p.type] = (c[p.type] || 0) + 1; });
        return c;
    }, []);

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
                                placeholder="Tìm mã, tên, loại gỗ..."
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
                                    <TH>Mã SP</TH>
                                    <TH>Tên sản phẩm</TH>
                                    <TH>Danh mục</TH>
                                    <TH>Loại hàng</TH>
                                    <TH>Loại gỗ</TH>
                                    <TH>Màu sắc</TH>
                                    <TH right>Giá bán</TH>
                                    <TH center>Tồn kho</TH>
                                    <TH>Trạng thái</TH>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.map(p => {
                                    const isStopped = ["Ngừng kinh doanh"].includes(p.status);
                                    const badge = TYPE_BADGE[p.type];
                                    return (
                                        <tr key={p.id} className="group relative hover:bg-gray-50/50 transition-colors"
                                            style={{ borderBottom: "1px solid var(--grid-border)", opacity: isStopped ? 0.55 : 1 }}>
                                            {/* Ảnh */}
                                            <td className="px-4 py-3">
                                                {p.img
                                                    ? <img src={p.img} alt={p.name} className="w-10 h-10 rounded-lg object-cover"
                                                        style={{ border: "1px solid var(--grid-border)", filter: isStopped ? "grayscale(100%)" : "none" }} />
                                                    : <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                                                        style={{ backgroundColor: "var(--bg-main)", border: "1px solid var(--grid-border)" }}>
                                                        <ImageIcon size={16} style={{ color: "var(--text-placeholder)" }} />
                                                    </div>}
                                            </td>
                                            {/* Mã */}
                                            <td className="px-4 py-3">
                                                <span className="text-[12px] font-bold font-mono px-2 py-1 rounded"
                                                    style={{ backgroundColor: "var(--bg-main)", color: "var(--text-main)", border: "1px solid var(--grid-border)" }}>
                                                    {p.code}
                                                </span>
                                            </td>
                                            {/* Tên */}
                                            <td className="px-4 py-3 max-w-[240px]">
                                                <p className="text-[13px] font-semibold truncate"
                                                    style={{ color: "var(--text-main)", textDecoration: isStopped ? "line-through" : "none" }}>
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
                                            {/* Loại gỗ */}
                                            <td className="px-4 py-3">
                                                <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>{p.woodType || "—"}</span>
                                            </td>
                                            {/* Màu */}
                                            <td className="px-4 py-3">
                                                <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>{p.color || "—"}</span>
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
                                                    style={{ color: p.stock === 0 ? "#DC2626" : p.stock <= 3 ? "#D97706" : "var(--text-main)" }}>
                                                    {p.stock}
                                                </span>
                                            </td>
                                            {/* Trạng thái */}
                                            <td className="px-4 py-3"><StatusChip status={p.status} /></td>
                                            {/* Hover action */}
                                            <td className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                <div className="flex gap-1.5 bg-white/90 backdrop-blur-sm p-1 rounded-xl shadow-sm border border-gray-100">
                                                    <button onClick={() => setViewProduct(p)}
                                                        className="h-8 px-2.5 rounded-lg flex items-center gap-1.5 text-[12px] font-bold hover:bg-gray-100 cursor-pointer transition"
                                                        style={{ color: "var(--text-secondary)" }}>
                                                        <Eye size={14} /> Xem
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {paginated.length === 0 && (
                                    <tr><td colSpan={10} className="py-24 text-center">
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
        </>
    );
}
