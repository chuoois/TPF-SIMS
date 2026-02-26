import { useEffect, useState } from "react";
import { accountantService } from "@/services/accountant.service";
import { PageHelmet } from "@/components/seo/PageHelmet";
import { Card, CardContent } from "@/components/ui/card";
import {
    Package,
    Layers,
    Warehouse,
    LayoutGrid,
    TrendingDown,
    BarChart3,
} from "lucide-react";

/**
 * AccountantDashboard
 * Trang tổng quan kho hàng dành cho kế toán
 *
 * Created By: ThinhBui
 * Created Date: 27/02/2026
 */

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
    <Card className="border shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-5 flex items-start gap-4">
            <div className={`p-3 rounded-xl ${color}`}>
                <Icon className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mb-1">{label}</p>
                <p className="text-2xl font-bold text-gray-900">
                    {value ?? <span className="text-gray-300 text-lg animate-pulse">...</span>}
                </p>
                {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
            </div>
        </CardContent>
    </Card>
);

export default function AccountantDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await accountantService.getDashboardStats();
                setStats(data);
            } catch (error) {
                console.error("fetchStats Error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const cards = [
        {
            icon: Package,
            label: "Tổng sản phẩm",
            value: stats?.totalProducts?.toLocaleString(),
            color: "bg-blue-500",
            sub: "Toàn bộ sản phẩm trong hệ thống",
        },
        {
            icon: Layers,
            label: "Tổng SKU",
            value: stats?.totalSkus?.toLocaleString(),
            color: "bg-indigo-500",
            sub: "Phân loại theo kích thước, màu, gỗ",
        },
        {
            icon: BarChart3,
            label: "Tổng tồn kho",
            value: stats?.totalInventoryQty?.toLocaleString(),
            color: "bg-emerald-500",
            sub: "Tổng số lượng có sẵn trong kho",
        },
        {
            icon: TrendingDown,
            label: "Sắp hết hàng",
            value: stats?.lowStockCount?.toLocaleString(),
            color: stats?.lowStockCount > 0 ? "bg-red-500" : "bg-gray-400",
            sub: "SKU có số lượng ≤ mức tối thiểu",
        },
        {
            icon: LayoutGrid,
            label: "Danh mục",
            value: stats?.totalCategories?.toLocaleString(),
            color: "bg-violet-500",
            sub: "Danh mục sản phẩm đang hoạt động",
        },
        {
            icon: Warehouse,
            label: "Kho hàng",
            value: stats?.totalWarehouses?.toLocaleString(),
            color: "bg-amber-500",
            sub: "Số kho trong hệ thống",
        },
    ];

    return (
        <>
            <PageHelmet title="Tổng quan kho - TPF-SIMS" />
            <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Tổng quan kho hàng</h1>
                    <p className="text-gray-500 text-sm mt-1">Theo dõi các chỉ số quan trọng về hàng tồn kho</p>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {cards.map((card) => (
                        <StatCard key={card.label} {...card} />
                    ))}
                </div>

                {/* Low stock alert */}
                {!loading && stats?.lowStockCount > 0 && (
                    <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                        <TrendingDown className="text-red-500 shrink-0" size={18} />
                        <p className="text-sm text-red-700 font-medium">
                            Có <span className="font-bold">{stats.lowStockCount}</span> SKU đang sắp hết hàng. Vui lòng kiểm tra và nhập hàng kịp thời.
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}
