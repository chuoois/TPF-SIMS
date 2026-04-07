import { Link } from "react-router-dom";
import { PageHelmet } from "@/components/seo/PageHelmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Package,
    Warehouse,
    TrendingDown,
    LayoutGrid,
    ArrowDownToLine,
    ChevronRight,
    CheckCircle,
    Hammer,
    Users,
    Calendar,
    AlertTriangle,
    XCircle,
    Clock,
} from "lucide-react";
import {
    ALL_PRODUCTS,
    INIT_IMPORTS,
    CATEGORIES,
} from "../mockData";

/**
 * AccountantDashboard – Tổng quan kho hàng
 * Dữ liệu động được tính toán trực tiếp từ ALL_PRODUCTS và INIT_IMPORTS
 *
 * Created By: HieuNM
 * Updated: Tích hợp logic tính toán thực tế từ trang Kho Hàng và trang Nhập Hàng.
 */

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtCurrency = (n) =>
    n != null ? new Intl.NumberFormat("vi-VN").format(n) + "₫" : "—";

const fmtDateTime = (s) => {
    if (!s) return "—";
    const d = new Date(s);
    return `${d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} - ${d.toLocaleDateString("vi-VN")}`;
};

// ── TYPE BADGE (giống trang kho hàng) ─────────────────────────────────────────
const TYPE_BADGE = {
    FINISHED: { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0", label: "Có sẵn" },
    RAW: { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA", label: "Hàng mộc" },
    CUSTOM: { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE", label: "Khách đặt" },
};

// ── StatCard ──────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, color, to }) => {
    const content = (
        <Card className="border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-start gap-4">
                <div className={`p-3 rounded-xl ${color}`}>
                    <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">{label}</p>
                    <p className="text-2xl font-bold text-gray-900">{value ?? "—"}</p>
                    {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
                </div>
            </CardContent>
        </Card>
    );
    return to ? <Link to={to} className="block">{content}</Link> : content;
};

// ── Hỗ trợ tính ngày tồn kho theo logic mới (giống trang Kho hàng) ───────────
const TODAY_DB = new Date("2026-03-17");

const getImportDateRange = (p) => {
    let dates = [];
    if (p.lots && p.lots.length > 0) {
        p.lots.forEach((lot) => {
            if (lot.importDate) dates.push(new Date(lot.importDate));
            if (lot.units) {
                lot.units.forEach((u) => {
                    if (u.importDate) dates.push(new Date(u.importDate));
                });
            }
        });
    } else if (p.importedAt) {
        dates.push(new Date(p.importedAt));
    }
    if (dates.length === 0) return null;

    dates.sort((a, b) => a.getTime() - b.getTime());
    return { first: dates[0], last: dates[dates.length - 1] };
};

const getDaysInStockDB = (p) => {
    const range = getImportDateRange(p);
    if (!range) return null;
    return Math.floor((TODAY_DB - range.first) / (1000 * 60 * 60 * 24));
};

const getDaysStyleDB = (days) => {
    if (days === null) return null;
    if (days > 60) return { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA", label: `${days} ngày` };
    if (days > 30) return { bg: "#FFFBEB", text: "#D97706", border: "#FDE68A", label: `${days} ngày` };
    return { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0", label: `${days} ngày` };
};

// ── Urgency helper dựa trên số lượng available ──────────────────────────────
const getUrgency = (p) => {
    const available = p.stockBreakdown?.available ?? p.stock;
    if (available === 0) return { label: "Đã hết", bg: "#FEF2F2", text: "#DC2626", border: "#FECACA", Icon: XCircle };
    if (available <= p.minStock) return { label: "Sắp hết", bg: "#FFFBEB", text: "#D97706", border: "#FDE68A", Icon: AlertTriangle };
    return null;
};


// ── Main Component ─────────────────────────────────────────────────────────────
export default function AccountantDashboard() {
    // ── Tính toán động từ mockData ──────────────────────────────────────────
    const LOW_STOCK_PRODUCTS = ALL_PRODUCTS.filter(
        (p) => p.type === "FINISHED" && p.minStock != null && (p.stockBreakdown?.available ?? p.stock) <= p.minStock
    );

    const LONG_STAY_PRODUCTS = ALL_PRODUCTS.filter((p) => getDaysInStockDB(p) > 60);

    const STATS = {
        totalProducts: ALL_PRODUCTS.length,
        totalInventoryQty: ALL_PRODUCTS.reduce((acc, p) => acc + p.stock, 0),
        lowStockCount: LOW_STOCK_PRODUCTS.length,
        totalCategories: CATEGORIES.length,
        finishedCount: ALL_PRODUCTS.filter((p) => p.type === "FINISHED").length,
        rawCount: ALL_PRODUCTS.filter((p) => p.type === "RAW").length,
        customCount: ALL_PRODUCTS.filter((p) => p.type === "CUSTOM").length,
    };

    const TYPE_STATS = [
        { label: "Hàng có sẵn", value: STATS.finishedCount, icon: CheckCircle, badge: TYPE_BADGE.FINISHED },
        { label: "Hàng mộc", value: STATS.rawCount, icon: Hammer, badge: TYPE_BADGE.RAW },
        { label: "Khách đặt", value: STATS.customCount, icon: Users, badge: TYPE_BADGE.CUSTOM },
    ];

    // Chỉ lấy 5 phiếu nhập gần nhất
    const RECENT_IMPORTS = INIT_IMPORTS.slice(0, 5);

    const kpiCards = [
        {
            icon: Package,
            label: "Tổng sản phẩm",
            value: STATS.totalProducts.toLocaleString(),
            color: "bg-blue-500",
            sub: "Toàn bộ sản phẩm trong hệ thống",
            to: "/accountant/products",
        },
        {
            icon: Warehouse,
            label: "Tổng tồn kho",
            value: STATS.totalInventoryQty.toLocaleString(),
            color: "bg-emerald-500",
            sub: "Tổng số lượng tất cả sản phẩm",
        },
        {
            icon: TrendingDown,
            label: "Dưới định mức tồn kho",
            value: STATS.lowStockCount.toLocaleString(),
            color: STATS.lowStockCount > 0 ? "bg-red-500" : "bg-gray-400",
            sub: "Sản phẩm có tồn kho ≤ mức tối thiểu",
            to: "/accountant/products",
        },
        {
            icon: Clock,
            label: "Tồn lâu > 60 ngày",
            value: LONG_STAY_PRODUCTS.length.toLocaleString(),
            color: LONG_STAY_PRODUCTS.length > 0 ? "bg-orange-500" : "bg-gray-400",
            sub: "Hàng cần xử lý hoặc giảm giá",
            to: "/accountant/products",
        },
        {
            icon: LayoutGrid,
            label: "Danh mục",
            value: STATS.totalCategories.toLocaleString(),
            color: "bg-violet-500",
            sub: "Phòng khách · Phòng ngủ · Phòng thờ · Phòng ăn",
        },
    ];

    return (
        <>
            <PageHelmet title="Tổng quan kho | Kế toán" />
            <div className="p-6 space-y-6">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Warehouse size={24} className="text-blue-600" />
                        Tổng quan kho hàng
                    </h1>
                    <p className="mt-1 text-gray-500">Theo dõi tình trạng kho và các phiếu nhập hàng gần đây.</p>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {kpiCards.map((card) => (
                        <StatCard key={card.label} {...card} />
                    ))}
                </div>

                {/* ───── BẢNG CẢNH BÁO HÀNG SẮP HẾT ───── */}
                {LOW_STOCK_PRODUCTS.length > 0 && (
                    <Card className="border-red-200 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-5">
                            <CardTitle className="text-base flex items-center gap-2 text-red-700">
                                <AlertTriangle size={17} className="text-red-500" />
                                Sản phẩm dưới định mức tồn kho
                                <span className="ml-1 text-[12px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600 border border-red-200">
                                    {LOW_STOCK_PRODUCTS.length}
                                </span>
                            </CardTitle>
                            <Button variant="link" size="sm" asChild className="text-red-600 hover:text-red-800">
                                <Link to="/accountant/products?filter=lowstock">Xem trong kho hàng</Link>
                            </Button>
                        </CardHeader>
                        <CardContent className="px-0 pb-0">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-y bg-red-50/60">
                                        <th className="text-left py-2 px-5 font-medium text-red-700 text-[11px] uppercase tracking-wider">Sản phẩm</th>
                                        <th className="text-left py-2 px-3 font-medium text-red-700 text-[11px] uppercase tracking-wider">Mã sản phẩm</th>
                                        <th className="text-left py-2 px-3 font-medium text-red-700 text-[11px] uppercase tracking-wider">Danh mục</th>
                                        <th className="text-center py-2 px-3 font-medium text-red-700 text-[11px] uppercase tracking-wider">Tồn kho</th>
                                        <th className="text-center py-2 px-3 font-medium text-red-700 text-[11px] uppercase tracking-wider">Tối thiểu</th>
                                        <th className="text-center py-2 px-3 font-medium text-red-700 text-[11px] uppercase tracking-wider">Trạng thái</th>
                                        <th className="py-2 px-4 w-32"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {LOW_STOCK_PRODUCTS.map((p, idx) => {
                                        const urgency = getUrgency(p);
                                        return (
                                            <tr
                                                key={p.id}
                                                className="hover:bg-red-50/40 transition-colors"
                                                style={{ borderBottom: idx < LOW_STOCK_PRODUCTS.length - 1 ? "1px solid #FEE2E2" : "none" }}
                                            >
                                                {/* Tên sản phẩm */}
                                                <td className="py-3 px-5">
                                                    <p className="text-[13px] font-semibold text-gray-800 max-w-[200px] truncate">{p.name}</p>
                                                </td>
                                                {/* SKU */}
                                                <td className="py-3 px-3">
                                                    <span className="font-mono text-[11px] font-bold bg-gray-100 text-gray-600 border border-gray-200 px-1.5 py-0.5 rounded">
                                                        {p.sku}
                                                    </span>
                                                </td>
                                                {/* Danh mục */}
                                                <td className="py-3 px-3">
                                                    <span className="text-[12px] text-gray-500">{p.category}</span>
                                                </td>
                                                {/* Tồn kho */}
                                                <td className="py-3 px-3 text-center">
                                                    <span className="text-[15px] font-bold" style={{ color: (p.stockBreakdown?.available ?? p.stock) === 0 ? "#DC2626" : "#D97706" }}>
                                                        {p.stockBreakdown?.available ?? p.stock}
                                                    </span>
                                                </td>
                                                {/* Tối thiểu */}
                                                <td className="py-3 px-3 text-center">
                                                    <span className="text-[13px] text-gray-500">{p.minStock}</span>
                                                </td>
                                                {/* Trạng thái */}
                                                <td className="py-3 px-3 text-center">
                                                    {urgency && (
                                                        <span
                                                            className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full"
                                                            style={{ backgroundColor: urgency.bg, color: urgency.text, border: `1px solid ${urgency.border}` }}
                                                        >
                                                            <urgency.Icon size={11} />
                                                            {urgency.label}
                                                        </span>
                                                    )}
                                                </td>
                                                {/* Nhập ngay */}
                                                <td className="py-3 px-4 text-right">
                                                    <Link
                                                        to="/accountant/imports"
                                                        className="inline-flex items-center gap-1.5 text-[12px] font-bold px-3 py-1.5 rounded-lg transition-colors hover:opacity-90"
                                                        style={{ backgroundColor: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}
                                                    >
                                                        <ArrowDownToLine size={13} />
                                                        Nhập ngay
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                )}

                {/* ───── BẢNG CẢNH BÁO HÀNG TỔ̀N LÂU ───── */}
                {LONG_STAY_PRODUCTS.length > 0 && (
                    <Card className="border-orange-200 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-5">
                            <CardTitle className="text-base flex items-center gap-2 text-orange-700">
                                <Clock size={17} className="text-orange-500" />
                                Hàng tồn kho lâu ngày
                                <span className="ml-1 text-[12px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 border border-orange-200">
                                    {LONG_STAY_PRODUCTS.length}
                                </span>
                            </CardTitle>
                            <Button variant="link" size="sm" asChild className="text-orange-600 hover:text-orange-800">
                                <Link to="/accountant/products">Xem trong kho hàng</Link>
                            </Button>
                        </CardHeader>
                        <CardContent className="px-0 pb-0">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-y bg-orange-50/60">
                                        <th className="text-left py-2 px-5 font-medium text-orange-700 text-[11px] uppercase tracking-wider">Sản phẩm</th>
                                        <th className="text-left py-2 px-3 font-medium text-orange-700 text-[11px] uppercase tracking-wider">Mã sản phẩm</th>
                                        <th className="text-left py-2 px-3 font-medium text-orange-700 text-[11px] uppercase tracking-wider">Danh mục</th>
                                        <th className="text-left py-2 px-3 font-medium text-orange-700 text-[11px] uppercase tracking-wider">Loại hàng</th>
                                        <th className="text-center py-2 px-3 font-medium text-orange-700 text-[11px] uppercase tracking-wider">Tồn kho</th>
                                        <th className="text-center py-2 px-3 font-medium text-orange-700 text-[11px] uppercase tracking-wider">Tồn từ</th>
                                        <th className="text-right py-2 px-3 font-medium text-orange-700 text-[11px] uppercase tracking-wider">Giá nhập</th>
                                        <th className="text-right py-2 px-3 font-medium text-orange-700 text-[11px] uppercase tracking-wider">Vốn tồn</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {LONG_STAY_PRODUCTS.map((p, idx) => {
                                        const days = getDaysInStockDB(p);
                                        const ds = getDaysStyleDB(days);
                                        const badge = TYPE_BADGE[p.type];
                                        const capitalTied = p.stock * p.importPrice;
                                        return (
                                            <tr
                                                key={p.id}
                                                className="hover:bg-orange-50/40 transition-colors"
                                                style={{ borderBottom: idx < LONG_STAY_PRODUCTS.length - 1 ? "1px solid #FFEDD5" : "none" }}
                                            >
                                                <td className="py-3 px-5">
                                                    <p className="text-[13px] font-semibold text-gray-800 max-w-[200px] truncate">{p.name}</p>
                                                </td>
                                                <td className="py-3 px-3">
                                                    <span className="font-mono text-[11px] font-bold bg-gray-100 text-gray-600 border border-gray-200 px-1.5 py-0.5 rounded">{p.sku}</span>
                                                </td>
                                                <td className="py-3 px-3">
                                                    <span className="text-[12px] text-gray-500">{p.category}</span>
                                                </td>
                                                <td className="py-3 px-3">
                                                    <span className="inline-block px-2 py-0.5 text-[11px] font-bold rounded-md"
                                                        style={{ backgroundColor: badge.bg, color: badge.text, border: `1px solid ${badge.border}` }}>
                                                        {badge.label}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3 text-center">
                                                    <span className="text-[14px] font-bold" style={{ color: p.stock === 0 ? "#DC2626" : "var(--text-main)" }}>{p.stock}</span>
                                                </td>
                                                <td className="py-3 px-3 text-center">
                                                    {ds && (
                                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md"
                                                            style={{ backgroundColor: ds.bg, color: ds.text, border: `1px solid ${ds.border}` }}>
                                                            <Clock size={10} />{ds.label}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-3 text-right text-[12px] text-gray-500">{fmtCurrency(p.importPrice)}</td>
                                                <td className="py-3 px-3 text-right">
                                                    <span className="text-[13px] font-bold text-orange-700">{fmtCurrency(capitalTied)}</span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                <tfoot>
                                    <tr className="border-t bg-orange-50/60">
                                        <td colSpan={7} className="py-2 px-5 text-right text-[12px] font-bold text-orange-700 uppercase tracking-wider">Tổng vốn bị tồn đợng</td>
                                        <td className="py-2 px-3 text-right text-[14px] font-black text-orange-700">
                                            {fmtCurrency(LONG_STAY_PRODUCTS.reduce((s, p) => s + p.stock * p.importPrice, 0))}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </CardContent>
                    </Card>
                )}

                {/* Phân bổ loại hàng */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {TYPE_STATS.map(({ label, value, icon: Icon, badge }) => (
                        <div
                            key={label}
                            className="flex items-center gap-3 bg-white rounded-xl border px-4 py-3 shadow-sm"
                            style={{ borderColor: badge.border }}
                        >
                            <div
                                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                                style={{ backgroundColor: badge.bg }}
                            >
                                <Icon size={16} style={{ color: badge.text }} />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500">{label}</p>
                                <p className="text-lg font-bold" style={{ color: badge.text }}>
                                    {value} <span className="text-xs font-medium text-gray-400">sản phẩm</span>
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Nhập hàng gần đây – cột khớp với trang Nhập Hàng */}
                    <Card className="lg:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                <ArrowDownToLine size={16} className="text-gray-500" />
                                Phiếu nhập gần đây
                            </CardTitle>
                            <Button variant="link" size="sm" asChild>
                                <Link to="/accountant/imports">Xem tất cả</Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-gray-50">
                                            <th className="text-left py-2 px-2 font-medium text-gray-600 text-[11px] uppercase tracking-wider">Ngày nhập</th>
                                            <th className="text-left py-2 px-2 font-medium text-gray-600 text-[11px] uppercase tracking-wider">Mã phiếu</th>
                                            <th className="text-left py-2 px-2 font-medium text-gray-600 text-[11px] uppercase tracking-wider">Sản phẩm</th>
                                            <th className="text-left py-2 px-2 font-medium text-gray-600 text-[11px] uppercase tracking-wider">Xưởng cung cấp</th>
                                            <th className="text-right py-2 px-2 font-medium text-gray-600 text-[11px] uppercase tracking-wider">SL</th>
                                            <th className="text-right py-2 px-2 font-medium text-gray-600 text-[11px] uppercase tracking-wider">Thành tiền</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {RECENT_IMPORTS.map((item) => (
                                            <tr key={item.id} className="border-b hover:bg-gray-50 transition-colors">
                                                <td className="py-2 px-2 whitespace-nowrap">
                                                    <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
                                                        <Calendar size={12} className="text-gray-400" />
                                                        {fmtDateTime(item.date)}
                                                    </div>
                                                </td>
                                                <td className="py-2 px-2">
                                                    <span className="font-mono text-[11px] font-bold bg-gray-100 text-gray-700 border border-gray-200 px-2 py-0.5 rounded">
                                                        {item.code}
                                                    </span>
                                                </td>
                                                <td className="py-2 px-2 font-semibold text-gray-800 max-w-[160px] truncate text-[13px]">
                                                    {item.product}
                                                </td>
                                                <td className="py-2 px-2 text-[12px] text-gray-500">{item.supplier}</td>
                                                <td className="py-2 px-2 text-right font-bold text-gray-800 text-[13px]">{item.qty}</td>
                                                <td className="py-2 px-2 text-right font-bold text-gray-800 text-[13px]">
                                                    {fmtCurrency(item.totalPrice)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Link nhanh */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Link nhanh</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            {[
                                { to: "/accountant/products", label: "Kho hàng", icon: Warehouse, desc: "Xem toàn bộ sản phẩm" },
                                { to: "/accountant/imports", label: "Nhập hàng", icon: ArrowDownToLine, desc: "Quản lý phiếu nhập" },
                                {
                                    to: "/accountant/products",
                                    label: "Dưới định mức",
                                    icon: TrendingDown,
                                    desc: `${STATS.lowStockCount} sản phẩm cần chú ý`,
                                    alert: STATS.lowStockCount > 0,
                                },
                            ].map(({ to, label, icon: Icon, desc, alert }) => (
                                <Link
                                    key={label}
                                    to={to}
                                    className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors group"
                                >
                                    <span className="flex items-center gap-3">
                                        <span
                                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0"
                                            style={{ backgroundColor: alert ? "#FEF2F2" : "#F3F4F6" }}
                                        >
                                            <Icon size={16} style={{ color: alert ? "#DC2626" : "#6B7280" }} />
                                        </span>
                                        <span>
                                            <p className="text-[13px] font-semibold text-gray-800">{label}</p>
                                            <p className="text-[11px]" style={{ color: alert ? "#DC2626" : "#9CA3AF" }}>{desc}</p>
                                        </span>
                                    </span>
                                    <ChevronRight size={16} className="text-gray-400" />
                                </Link>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
