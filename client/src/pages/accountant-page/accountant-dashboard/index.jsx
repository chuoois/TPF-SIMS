import { Link } from "react-router-dom";
import { PageHelmet } from "@/components/seo/PageHelmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Package,
    Layers,
    Warehouse,
    LayoutGrid,
    TrendingDown,
    BarChart3,
    ChevronRight,
    ArrowDownToLine,
    CheckCircle2,
    Clock,
} from "lucide-react";

/**
 * AccountantDashboard
 * Trang tổng quan dành cho kế toán (static mock data – không gọi backend)
 *
 * Created By: HieuNM
 * Updated: 12/03/2026
 */

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

// ── Mock data ──────────────────────────────────────────────────────────────
const STATS = {
    totalProducts: 48,
    totalInventoryQty: 3_840,
    lowStockCount: 6,
    totalCategories: 9,
};

const RECENT_IMPORTS = [
    { id: 1, date: "06/03/2026", product: "Ghế gỗ sồi tự nhiên", sku: "GHET-OAK-BRN-120X60", qty: 50, price: "2.500.000 ₫", warehouse: "Kho chính", status: "Hoàn tất" },
    { id: 2, date: "05/03/2026", product: "Bàn ăn gỗ thông", sku: "BAAN-PINE-NAT-180X90", qty: 20, price: "4.200.000 ₫", warehouse: "Kho chính", status: "Hoàn tất" },
    { id: 3, date: "04/03/2026", product: "Tủ quần áo 3 cánh", sku: "TUQA-WAL-GRY-200X60", qty: 15, price: "8.900.000 ₫", warehouse: "Kho phụ", status: "Hoàn tất" },
    { id: 4, date: "03/03/2026", product: "Kệ sách 5 tầng", sku: "KESA-OAK-WHT-80X30", qty: 30, price: "1.800.000 ₫", warehouse: "Kho chính", status: "Hoàn tất" },
    { id: 5, date: "02/03/2026", product: "Giường ngủ gỗ cao su", sku: "GIAN-RUB-BRN-160X200", qty: 8, price: "6.500.000 ₫", warehouse: "Kho phụ", status: "Chờ xử lý" },
];

export default function AccountantDashboard() {
    const cards = [
        {
            icon: Package,
            label: "Tổng sản phẩm",
            value: STATS.totalProducts.toLocaleString(),
            color: "bg-blue-500",
            sub: "Toàn bộ sản phẩm trong hệ thống",
        },
        {
            icon: BarChart3,
            label: "Tổng tồn kho",
            value: STATS.totalInventoryQty.toLocaleString(),
            color: "bg-emerald-500",
            sub: "Tổng số lượng có sẵn trong kho",
        },
        {
            icon: TrendingDown,
            label: "Sắp hết hàng",
            value: STATS.lowStockCount.toLocaleString(),
            color: STATS.lowStockCount > 0 ? "bg-red-500" : "bg-gray-400",
            sub: "SKU có số lượng ≤ mức tối thiểu",
            to: "/accountant/products",
        },
        {
            icon: LayoutGrid,
            label: "Danh mục",
            value: STATS.totalCategories.toLocaleString(),
            color: "bg-violet-500",
            sub: "Danh mục sản phẩm đang hoạt động",
        },
    ];

    return (
        <>
            <PageHelmet title="Tổng quan | Kế toán" />
            <div className="p-6 space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Tổng quan</h1>
                    <p className="mt-1 text-gray-500">Theo dõi các chỉ số kho hàng và nhập hàng gần đây.</p>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cards.map((card) => (
                        <StatCard key={card.label} {...card} />
                    ))}
                </div>

                {/* Low stock alert */}
                {STATS.lowStockCount > 0 && (
                    <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                        <TrendingDown className="text-red-500 shrink-0" size={18} />
                        <p className="text-sm text-red-700 font-medium">
                            Có <span className="font-bold">{STATS.lowStockCount}</span> sản phẩm đang sắp hết hàng.{" "}
                            <Link to="/accountant/products" className="underline font-bold">
                                Xem danh sách sản phẩm
                            </Link>
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Nhập hàng gần đây */}
                    <Card className="lg:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                <ArrowDownToLine size={16} className="text-gray-500" />
                                Nhập hàng gần đây
                            </CardTitle>
                            <Button variant="link" size="sm" asChild>
                                <Link to="/accountant/products">Xem tất cả</Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-gray-50">
                                            <th className="text-left py-2 px-2 font-medium text-gray-600">Ngày</th>
                                            <th className="text-left py-2 px-2 font-medium text-gray-600">Sản phẩm</th>
                                            <th className="text-left py-2 px-2 font-medium text-gray-600">SKU</th>
                                            <th className="text-right py-2 px-2 font-medium text-gray-600">SL</th>
                                            <th className="text-right py-2 px-2 font-medium text-gray-600">Giá nhập</th>
                                            <th className="text-center py-2 px-2 font-medium text-gray-600">Trạng thái</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {RECENT_IMPORTS.map((item) => (
                                            <tr key={item.id} className="border-b hover:bg-gray-50 transition-colors">
                                                <td className="py-2 px-2 text-gray-500 text-xs whitespace-nowrap">{item.date}</td>
                                                <td className="py-2 px-2 font-medium text-gray-800 max-w-[160px] truncate">{item.product}</td>
                                                <td className="py-2 px-2">
                                                    <span className="font-mono text-[10px] bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded">
                                                        {item.sku}
                                                    </span>
                                                </td>
                                                <td className="py-2 px-2 text-right font-semibold text-gray-800">{item.qty}</td>
                                                <td className="py-2 px-2 text-right text-gray-700">{item.price}</td>
                                                <td className="py-2 px-2 text-center">
                                                    {item.status === "Hoàn tất" ? (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-100">
                                                            <CheckCircle2 size={10} /> Hoàn tất
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100">
                                                            <Clock size={10} /> Chờ xử lý
                                                        </span>
                                                    )}
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
                                { to: "/accountant/products", label: "Quản lý sản phẩm", icon: Package },
                                { to: "/accountant/products", label: "Kho hàng", icon: Warehouse },
                                { to: "/accountant/products", label: "Báo cáo tồn kho", icon: BarChart3 },
                            ].map(({ to, label, icon: Icon }) => (
                                <Link
                                    key={label}
                                    to={to}
                                    className="flex items-center justify-between py-2 px-2 rounded-md hover:bg-gray-100 text-gray-700 transition-colors"
                                >
                                    <span className="flex items-center gap-2">
                                        <Icon size={18} className="text-gray-500" />
                                        {label}
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
