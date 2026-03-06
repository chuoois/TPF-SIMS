import { Link } from "react-router-dom";
import { PageHelmet } from "@/components/seo/PageHelmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Calendar,
  Clock,
  Hammer,
  Users,
  Building2,
  ClipboardList,
  Package,
  BarChart3,
  ChevronRight,
} from "lucide-react";

const StatCard = ({ icon: Icon, label, value, sub, color, to }) => {
  const content = (
    <Card className="border shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5 flex items-start gap-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">
            {value ?? "—"}
          </p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
  return to ? <Link to={to} className="block">{content}</Link> : content;
};

export default function OwnerDashboard() {
  // TODO: gọi API lấy stats và đơn chờ xác nhận
  const stats = {
    revenueToday: "0",
    revenueMonth: "0",
    pendingOrders: 0,
    inProduction: 0,
    debtCustomer: "0",
    debtSupplier: "0",
  };
  const pendingOrders = []; // TODO: API

  return (
    <>
      <PageHelmet title="Tổng quan | Chủ cửa hàng" />
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tổng quan</h1>
          <p className="mt-1 text-gray-500">Tổng quan doanh thu, đơn hàng và công nợ.</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            icon={TrendingUp}
            label="Doanh thu hôm nay"
            value={stats.revenueToday ? `${Number(stats.revenueToday).toLocaleString("vi-VN")} ₫` : "—"}
            sub="Đã thu trong ngày"
            color="bg-emerald-500"
          />
          <StatCard
            icon={Calendar}
            label="Doanh thu tháng"
            value={stats.revenueMonth ? `${Number(stats.revenueMonth).toLocaleString("vi-VN")} ₫` : "—"}
            sub="Tháng hiện tại"
            color="bg-blue-500"
          />
          <StatCard
            icon={Clock}
            label="Đơn chờ xử lý"
            value={String(stats.pendingOrders)}
            sub="Chờ chủ xác nhận / báo giá"
            color="bg-amber-500"
            to="/owner/orders?status=pending"
          />
          <StatCard
            icon={Hammer}
            label="Đơn đang sản xuất"
            value={String(stats.inProduction)}
            sub="Đang tại xưởng"
            color="bg-violet-500"
          />
          <StatCard
            icon={Users}
            label="Công nợ khách"
            value={stats.debtCustomer ? `${Number(stats.debtCustomer).toLocaleString("vi-VN")} ₫` : "—"}
            sub="Tổng nợ thu"
            color="bg-orange-500"
          />
          <StatCard
            icon={Building2}
            label="Công nợ NCC"
            value={stats.debtSupplier ? `${Number(stats.debtSupplier).toLocaleString("vi-VN")} ₫` : "—"}
            sub="Tổng nợ trả"
            color="bg-rose-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Đơn chờ xác nhận */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">Đơn chờ xác nhận</CardTitle>
              <Button variant="link" size="sm" asChild>
                <Link to="/owner/orders?status=pending">Xem tất cả</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-2 px-2 font-medium">Mã đơn</th>
                      <th className="text-left py-2 px-2 font-medium">Khách hàng</th>
                      <th className="text-left py-2 px-2 font-medium">Ngày đặt</th>
                      <th className="text-right py-2 px-2 font-medium">Giá kiến nghị</th>
                      <th className="text-right py-2 px-2 font-medium w-20">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingOrders.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-gray-500">
                          Không có đơn chờ xác nhận.
                        </td>
                      </tr>
                    ) : (
                      pendingOrders.map((o) => (
                        <tr key={o.id} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-2">
                            <Link to={`/owner/orders/${o.id}`} className="text-primary hover:underline">
                              {o.order_code}
                            </Link>
                          </td>
                          <td className="py-2 px-2">{o.customer_name}</td>
                          <td className="py-2 px-2">{o.order_date}</td>
                          <td className="py-2 px-2 text-right">{o.suggested_price}</td>
                          <td className="py-2 px-2 text-right">
                            <Button variant="outline" size="xs" asChild>
                              <Link to={`/owner/orders/${o.id}`}>Báo giá</Link>
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
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
                { to: "/owner/orders", label: "Đơn hàng", icon: ClipboardList },
                { to: "/owner/products", label: "Sản phẩm", icon: Package },
                { to: "/owner/production", label: "Quản lý sản xuất", icon: Hammer },
                { to: "/owner/reports", label: "Báo cáo", icon: BarChart3 },
              ].map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center justify-between py-2 px-2 rounded-md hover:bg-gray-100 text-gray-700"
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
