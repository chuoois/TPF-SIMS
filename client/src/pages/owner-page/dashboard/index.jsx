import { Link } from "react-router-dom";
import { PageHelmet } from "@/components/seo/PageHelmet";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Wallet,
  Building2,
  AlertCircle,
  FileEdit,
  Truck,
  Activity,
  ArrowRight,
  ShieldAlert,
  Clock,
  ShoppingCart,
  Package,
  PiggyBank,
  CheckCircle2,
  AlertTriangle,
  History,
  User,
} from "lucide-react";
import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { cn } from "@/lib/utils";

// Lấy tên người dùng hiện tại (Giả lập)
const currentOwnerName = "Võ Cường";

const STATS = {
  revenueToday: 15500000,
  revenueGrowth: 12.5,
  newOrders: 8,
  pendingApprovals: 5,
  debtCustomer: 45000000,
  debtSupplier: 28500000,
  deliveriesToday: 2,
};

const REVENUE_DATA_7_DAYS = [
  { date: "02/03", total: 12000000 },
  { date: "03/03", total: 18500000 },
  { date: "04/03", total: 14200000 },
  { date: "05/03", total: 22000000 },
  { date: "06/03", total: 19800000 },
  { date: "07/03", total: 26500000 },
  { date: "08/03", total: 15500000 },
];

const REVENUE_DATA_30_DAYS = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(2026, 2, 8);
  d.setDate(d.getDate() - (29 - i));
  return {
    date: `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}`,
    total: Math.floor(Math.random() * 20000000) + 10000000,
  };
});

const REVENUE_BY_CATEGORY = [
  { name: "Sofa & Bàn trà", value: 45 },
  { name: "Giường & Tủ áo", value: 25 },
  { name: "Bàn ghế ăn", value: 20 },
  { name: "Đồ trang trí", value: 10 },
];
const PIE_COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b"];

const TOP_PRODUCTS = [
  { name: "Sofa Góc Da L", qty: 24, revenue: 120000000 },
  { name: "Sập Gụ Tủ Chè", qty: 15, revenue: 90000000 },
  { name: "Kệ Tivi Sồi Mỹ", qty: 12, revenue: 45000000 },
  { name: "Bàn Trà Oval", qty: 9, revenue: 27000000 },
  { name: "Tủ Quần Áo 4C", qty: 6, revenue: 48000000 },
];

const OVERDUE_CUSTOMERS = [
  { name: "Anh Hưng (Q7)", amount: 15000000, overdueDays: 5, id: "KH045" },
  { name: "Chị Lan Anh", amount: 4500000, overdueDays: 2, id: "KH012" },
];

const LOW_STOCK_PRODUCTS = [
  { name: "Ghế đôn sofa L", currentStock: 2, id: "SP015", unit: "cái" },
  { name: "Bàn ăn tròn xoay", currentStock: 0, id: "SP088", unit: "bộ" },
  { name: "Kệ giày 3 tầng mỏng", currentStock: 4, id: "SP102", unit: "chiếc" },
];

const RECENT_ACTIVITIES = [
  {
    id: 1,
    user: "Nguyễn Văn A",
    action: "Tạo mới đơn hàng",
    target: "ĐH-20240308-01",
    time: "10 phút trước",
    type: "order",
  },
  {
    id: 2,
    user: "Trần Thị B",
    action: "Cập nhật tồn kho",
    target: "Bàn ăn tròn xoay",
    time: "35 phút trước",
    type: "inventory",
  },
  {
    id: 3,
    user: "Lê Hoàng C",
    action: "Thêm thông tin khách hàng",
    target: "Công ty Vạn Phát",
    time: "1 giờ trước",
    type: "customer",
  },
  {
    id: 4,
    user: "Nguyễn Văn A",
    action: "Xác nhận báo giá",
    target: "BG-20240307-05",
    time: "2 giờ trước",
    type: "quote",
  },
  {
    id: 5,
    user: "Phạm D.",
    action: "Tạo phiếu nhập hàng",
    target: "Gỗ An Cường",
    time: "3 giờ trước",
    type: "supplier",
  },
  {
    id: 6,
    user: "Trần Thị B",
    action: "Sửa thông tin sản phẩm",
    target: "Ghế đôn sofa L",
    time: "Hôm qua",
    type: "product",
  },
];

const formatCurrency = (val) =>
  new Intl.NumberFormat("vi-VN").format(val) + " ₫";

const MetricCard = ({
  title,
  value,
  subtext,
  icon: Icon,
  trend,
  trendLabel,
  gradient,
  linkTo,
}) => {
  const CardContentBlock = (
    <Card
      className={cn(
        "border-0 shadow-sm rounded-xl overflow-hidden relative bg-white group transition-shadow duration-300",
        linkTo
          ? "hover:shadow-md cursor-pointer hover:border-blue-200"
          : "hover:shadow-md",
      )}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-center gap-4">
          <div className="flex-1">
            <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              {title}
            </p>
            <div className="flex items-end gap-2">
              <h3 className="text-[20px] font-black text-slate-900 tracking-tight leading-none">
                {value}
              </h3>
              {trend && (
                <span className="text-[12px] font-semibold flex items-center gap-0.5 text-emerald-600 mb-0.5">
                  <TrendingUp size={14} /> {trend}
                </span>
              )}
            </div>
            {subtext && (
              <p className="text-[12px] text-slate-500 font-medium mt-1 truncate">
                {subtext}
              </p>
            )}
          </div>
          <div
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br shadow-inner",
              gradient,
            )}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return linkTo ? (
    <Link
      to={linkTo}
      className="block relative hover:-translate-y-0.5 transition-transform"
    >
      {CardContentBlock}
    </Link>
  ) : (
    CardContentBlock
  );
};

export default function OwnerDashboard() {
  const [revenueFilter, setRevenueFilter] = useState("7_days");
  const currentRevenueData =
    revenueFilter === "7_days" ? REVENUE_DATA_7_DAYS : REVENUE_DATA_30_DAYS;

  return (
    <>
      <PageHelmet title="Tổng quan | TPF-SIMS" />

      <div className="flex flex-col h-[calc(100vh-64px)] -m-6 p-6 md:p-8 space-y-8 overflow-y-auto bg-slate-50">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between shrink-0 gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Tổng quan Doanh nghiệp
            </h1>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="h-10 px-4 rounded-xl font-semibold shadow-sm border-slate-200 text-slate-700 bg-white"
              asChild
            >
              <Link to="/owner/reports">Báo cáo chi tiết</Link>
            </Button>
          </div>
        </div>

        {/* 0. ATTENTION REQUIRED (To-Do List) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
          {/* Sắp hết hàng */}
          <Link
            to="/owner/products?tab=low_stock"
            className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex items-center justify-between hover:border-orange-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center shrink-0 border border-orange-100/50">
                <Package className="text-orange-600" size={20} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 mb-0.5 uppercase tracking-wider">
                  Sắp hết hàng
                </p>
                <p className="text-[13px] font-medium text-slate-600">
                  <span className="font-bold text-orange-600 text-[15px] mr-1">
                    {LOW_STOCK_PRODUCTS.length}
                  </span>
                  sản phẩm
                </p>
              </div>
            </div>
            <ArrowRight
              size={16}
              className="text-slate-300 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-transform"
            />
          </Link>

          {/* Cần duyệt gấp */}
          <Link
            to="/owner/orders?tab=pending"
            className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex items-center justify-between hover:border-blue-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100/50">
                <Clock className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 mb-0.5 uppercase tracking-wider">
                  Cần phê duyệt
                </p>
                <p className="text-[13px] font-medium text-slate-600">
                  <span className="font-bold text-blue-600 text-[15px] mr-1">
                    {STATS.pendingApprovals}
                  </span>
                  báo giá
                </p>
              </div>
            </div>
            <ArrowRight
              size={16}
              className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-transform"
            />
          </Link>

          {/* Nợ quá hạn */}
          <Link
            to="/owner/customers?tab=debt"
            className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex items-center justify-between hover:border-rose-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center shrink-0 border border-rose-100/50">
                <ShieldAlert className="text-rose-600" size={20} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 mb-0.5 uppercase tracking-wider">
                  Nợ quá hạn
                </p>
                <p className="text-[13px] font-medium text-slate-600">
                  <span className="font-bold text-rose-600 text-[15px] mr-1">
                    {OVERDUE_CUSTOMERS.length}
                  </span>
                  khách hàng
                </p>
              </div>
            </div>
            <ArrowRight
              size={16}
              className="text-slate-300 group-hover:text-rose-500 group-hover:translate-x-0.5 transition-transform"
            />
          </Link>
        </div>

        {/* 1. KEY METRICS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 shrink-0">
          <MetricCard
            title="Doanh Thu Hôm Nay"
            value="15.5M"
            trend="+12.5%"
            subtext="so với hôm qua"
            icon={Wallet}
            gradient="from-blue-500 to-indigo-600"
            linkTo="/owner/reports"
          />

          <MetricCard
            title="Tổng Phải Thu (KH)"
            value="45M"
            subtext="Từ 12 khách hàng đang nợ"
            icon={PiggyBank}
            gradient="from-amber-400 to-orange-500"
            linkTo="/owner/customers"
          />
          <MetricCard
            title="Tổng Phải Trả (NCC)"
            value="28.5M"
            subtext="Cho 5 nhà cung cấp"
            icon={Building2}
            gradient="from-rose-400 to-red-500"
            linkTo="/owner/suppliers"
          />
        </div>

        {/* 2. CHARTS OVERVIEW ROW */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 shrink-0">
          {/* Biểu đồ Doanh Thu Area Chart (Full width) */}
          <Card className="xl:col-span-3 border-0 shadow-sm rounded-2xl bg-white flex flex-col">
            <CardHeader className="py-5 px-6 border-b border-slate-50 flex flex-row items-center justify-between pb-4">
              <div className="space-y-1">
                <CardTitle className="text-[16px] font-bold text-slate-900">
                  Biểu đồ doanh thu
                </CardTitle>
              </div>
              <select
                value={revenueFilter}
                onChange={(e) => setRevenueFilter(e.target.value)}
                className="h-9 px-4 pr-10 rounded-xl text-[13px] font-bold text-slate-700 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer transition-colors hover:bg-slate-100"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 12px center",
                }}
              >
                <option value="7_days">7 Ngày qua</option>
                <option value="30_days">30 Ngày qua</option>
              </select>
            </CardHeader>
            <CardContent className="p-6 flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={currentRevenueData}
                  margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
                >
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="4 4"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#64748b", fontWeight: 600 }}
                    dy={15}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#64748b", fontWeight: 600 }}
                    tickFormatter={(value) => `${value / 1000000}M`}
                    dx={-10}
                    width={45}
                  />
                  <RechartsTooltip
                    formatter={(value) => [formatCurrency(value), "Doanh thu"]}
                    labelStyle={{
                      color: "#0f172a",
                      fontWeight: "bold",
                      marginBottom: "8px",
                    }}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow:
                        "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                      fontSize: "13px",
                      padding: "12px 16px",
                      fontWeight: 500,
                    }}
                    cursor={{
                      stroke: "#94a3b8",
                      strokeWidth: 1.5,
                      strokeDasharray: "4 4",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#3b82f6"
                    strokeWidth={4}
                    fill="url(#colorRev)"
                    activeDot={{
                      r: 6,
                      fill: "#3b82f6",
                      stroke: "#fff",
                      strokeWidth: 3,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* 3. OPERATIONAL & ALERTS ROW */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 shrink-0">
          {/* Top Sản Phẩm */}
          <Card className="xl:col-span-2 border-0 shadow-sm rounded-2xl bg-white overflow-hidden flex flex-col">
            <CardHeader className="py-5 px-6 border-b border-slate-50 flex flex-row items-center justify-between bg-white z-10">
              <div className="flex items-center gap-2">
                <Package className="text-blue-500 w-5 h-5" />
                <CardTitle className="text-[16px] font-bold text-slate-900">
                  Top Sản Phẩm Bán Chạy Nhất
                </CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-600 font-semibold hover:text-blue-700 hover:bg-blue-50 h-8"
                asChild
              >
                <Link to="/owner/reports">Xem toàn bộ</Link>
              </Button>
            </CardHeader>
            <CardContent className="p-4 flex-1">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={TOP_PRODUCTS}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={true}
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#475569", fontWeight: 600 }}
                  />
                  <RechartsTooltip
                    cursor={{ fill: "#f8fafc" }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-100">
                            <p className="font-bold text-[13px] text-slate-800 mb-1">
                              {data.name}
                            </p>
                            <p className="text-[12px] text-slate-500 font-medium">
                              Doanh thu:{" "}
                              <span className="text-blue-600 font-bold">
                                {formatCurrency(data.revenue)}
                              </span>
                            </p>
                            <p className="text-[12px] text-slate-500 font-medium">
                              Số lượng bán:{" "}
                              <span className="text-slate-800 font-bold">
                                {data.qty}
                              </span>{" "}
                              cái
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="#3b82f6"
                    radius={[0, 4, 4, 0]}
                    barSize={24}
                  >
                    {TOP_PRODUCTS.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          index === 0
                            ? "#3b82f6"
                            : index === 1
                              ? "#60a5fa"
                              : index === 2
                                ? "#93c5fd"
                                : "#bfdbfe"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Nhật ký hoạt động */}
          <Card className="xl:col-span-1 border-0 shadow-sm rounded-2xl bg-white flex flex-col">
            <CardHeader className="py-5 px-6 border-b border-slate-50 flex flex-row items-center justify-between pb-4">
              <div className="flex items-center gap-2">
                <History className="text-blue-500 w-5 h-5" />
                <CardTitle className="text-[16px] font-bold text-slate-900">
                  Nhật ký hoạt động
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              <div className="flex flex-col h-[350px] overflow-y-auto custom-scrollbar">
                {RECENT_ACTIVITIES.map((activity, index) => (
                  <div
                    key={activity.id}
                    className="px-6 py-4 flex items-start gap-3 border-b border-slate-50 hover:bg-slate-50/50 transition-colors last:border-0"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100 mt-0.5">
                      <User className="text-blue-500 w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-slate-600 font-medium leading-relaxed">
                        <span className="font-bold text-slate-800">
                          {activity.user}
                        </span>{" "}
                        đã {activity.action.toLowerCase()}{" "}
                        <span className="font-semibold text-slate-900 truncate">
                          {activity.target}
                        </span>
                      </p>
                      <p className="text-[11px] text-slate-400 font-medium mt-1 uppercase tracking-wider">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
