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
  Hammer,
  Paintbrush,
} from "lucide-react";
import { useState, useMemo } from "react";
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
  revenueToday: 16500000, // Includes 1M from forfeited deposit
  revenueGrowth: 12.5,
  newRequirements: 4,
  productionToApprove: 3,
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



const LOW_STOCK_PRODUCTS = [
  { name: "Ghế đôn sofa L", currentStock: 2, id: "SP015", unit: "cái" },
  { name: "Bàn ăn tròn xoay", currentStock: 0, id: "SP088", unit: "bộ" },
  { name: "Kệ giày 3 tầng mỏng", currentStock: 4, id: "SP102", unit: "chiếc" },
];

const RECENT_ACTIVITIES = [
  {
    id: 1,
    user: "Bình Nguyễn",
    action: "Gửi yêu cầu khách hàng mới",
    target: "Yêu cầu tủ bếp sồi Nga",
    time: "10 phút trước",
    type: "order",
  },
  {
    id: 2,
    user: "Thợ cả",
    action: "Hoàn thành đánh giấy ráp",
    target: "LSX-2603-0001",
    time: "35 phút trước",
    type: "inventory",
  },
  {
    id: 3,
    user: "Thợ sơn B",
    action: "Báo cáo hoàn thành sơn",
    target: "LSX-2603-0012",
    time: "1 giờ trước",
    type: "product",
  },
  {
    id: 4,
    user: "Nguyễn Văn A",
    action: "Xác nhận duyệt lệnh",
    target: "LSX-2603-0007",
    time: "2 giờ trước",
    type: "inventory",
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
    <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white h-full transition-all group">
      <CardContent className="p-4 h-full flex flex-col justify-between">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              {title}
            </p>
            <div className="flex items-baseline gap-2 flex-wrap">
              <h3 className="text-[18px] font-black text-slate-900 tracking-tight leading-tight">
                {value}
              </h3>
              {trend && (
                <span className="text-[11px] font-bold flex items-center gap-0.5 text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-lg border border-emerald-100">
                  <TrendingUp size={12} /> {trend}
                </span>
              )}
            </div>
            {subtext && (
              <p className="text-[11px] text-slate-400 font-medium mt-1 leading-tight italic">
                {subtext}
              </p>
            )}
          </div>
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br shadow-inner",
              gradient,
            )}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>

        {linkTo && (
          <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between text-[11px] font-bold text-blue-600 transition-colors group-hover:text-blue-700">
            <span className="uppercase tracking-wider">XEM CHI TIẾT</span>
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        )}
      </CardContent>
    </Card>
  );

  return linkTo ? (
    <Link to={linkTo} className="block h-full hover:-translate-y-1 transition-all">
      {CardContentBlock}
    </Link>
  ) : (
    CardContentBlock
  );
};

export default function OwnerDashboard() {
  const [revenueFilter, setRevenueFilter] = useState("7_days");

  // --- DYNAMIC DATA LOADING ---
  const [productions] = useState(() => {
    const saved = localStorage.getItem("tpf_simulated_productions");
    return saved ? JSON.parse(saved) : [];
  });

  const [warrantyRequests] = useState(() => {
    const saved = localStorage.getItem("tpf_simulated_warranty_requests");
    return saved ? JSON.parse(saved) : [];
  });

  // --- DERIVED METRICS ---
  const dynamicStats = useMemo(() => {
    const pendingWarranty = warrantyRequests.filter(r => r.status === "PENDING").length;
    const itemsToApprove = productions.filter(p => p.isPendingApproval).length;
    
    // Production Pipeline Stages
    const stageSummary = {
      moc: productions.filter(p => p.status === "Đang đánh giấy ráp").length,
      son: productions.filter(p => p.status === "Đang sơn" && !p.isPendingApproval).length,
      hoan_thanh: productions.filter(p => p.status === "Hoàn thành").length
    };

    // Financial estimations (Furniture-specific scale)
    const totalContractValue = 85500000; 
    const cashCollected = 25200000; 
    const estimatedProfit = totalContractValue * 0.42; 

    return {
      pendingWarranty,
      itemsToApprove,
      stageSummary,
      estimatedProfit,
      totalContractValue,
      cashCollected
    };
  }, [productions, warrantyRequests]);

  const currentRevenueData = revenueFilter === "7_days" ? REVENUE_DATA_7_DAYS : REVENUE_DATA_30_DAYS;

  const PIPELINE_DATA = [
     { name: "Công đoạn đánh giấy ráp", value: dynamicStats.stageSummary.moc, color: "#8b5cf6", icon: Hammer, link: "/owner/production?status=Đang đánh giấy ráp" },
     { name: "Công đoạn Sơn", value: dynamicStats.stageSummary.son, color: "#db2777", icon: Paintbrush, link: "/owner/production?status=Đang sơn" },
     { name: "KT & Hoàn thiện", value: dynamicStats.itemsToApprove, color: "#3b82f6", icon: CheckCircle2, link: "/owner/production?status=Chờ duyệt" },
  ];

  return (
    <>
      <PageHelmet title="Tổng quan Điều hành | TPF-SIMS" />

      <div className="flex flex-col h-[calc(100vh-64px)] -m-6 p-6 md:p-8 space-y-8 overflow-y-auto bg-slate-50">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between shrink-0 gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
              Bảng điều khiển Tổng quan
            </h1>
            <p className="text-[13px] text-slate-400 font-medium">Báo cáo tình hình kinh doanh & sản xuất thực tế</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="h-10 px-4 rounded-xl font-bold shadow-sm border-slate-200 text-slate-700 bg-white hover:bg-slate-50"
              asChild
            >
              <Link to="/owner/reports">Báo cáo chi tiết</Link>
            </Button>
          </div>
        </div>

        {/* 0. HOTSPOT / ATTENTION REQUIRED */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
          {/* SỰ CỐ BẢO HÀNH (URGENT) */}
          <Link
            to="/owner/warranty"
            className="bg-white rounded-2xl p-4 shadow-sm border-2 border-orange-100 flex items-center justify-between hover:border-orange-400 hover:shadow-md transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-2 h-full bg-orange-400"></div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center shrink-0 border border-orange-100 animate-pulse">
                <AlertTriangle className="text-orange-600" size={24} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black text-orange-600/60 mb-0.5 uppercase tracking-widest leading-none">
                  SỰ CỐ KHẨN CẤP
                </p>
                <p className="text-[14px] font-black text-slate-800 leading-tight">
                  <span className="text-orange-600 mr-1">{dynamicStats.pendingWarranty}</span> ca bảo trì mới
                </p>
              </div>
            </div>
            <ArrowRight size={14} className="text-orange-300 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          {/* DUYỆT SẢN XUẤT */}
          <Link
            to="/owner/production"
            className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex items-center justify-between hover:border-blue-400 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                <CheckCircle2 className="text-blue-600" size={24} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black text-blue-600/60 mb-0.5 uppercase tracking-widest leading-none">
                  TIẾN ĐỘ XƯỞNG
                </p>
                <p className="text-[14px] font-black text-slate-800 leading-tight">
                  <span className="text-blue-600 mr-1">{dynamicStats.itemsToApprove}</span> bộ cần nghiệm thu
                </p>
              </div>
            </div>
            <ArrowRight size={14} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          {/* HÀNG SẮP HẾT */}
          <Link
            to="/owner/products?tab=low_stock"
            className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex items-center justify-between hover:border-emerald-400 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                <Package className="text-emerald-600" size={24} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black text-emerald-600/60 mb-0.5 uppercase tracking-widest leading-none">
                  KHO THÀNH PHẨM
                </p>
                <p className="text-[14px] font-black text-slate-800 leading-tight">
                  <span className="text-emerald-600 mr-1">3</span> mã hàng sắp hết
                </p>
              </div>
            </div>
            <ArrowRight size={14} className="text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          {/* YÊU CẦU MỚI TỪ SALES */}
          <Link
            to="/owner/customer-requirements"
            className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex items-center justify-between hover:border-purple-400 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center shrink-0 border border-purple-100">
                <FileEdit className="text-purple-600" size={24} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black text-purple-600/60 mb-0.5 uppercase tracking-widest leading-none">
                  YÊU CẦU KHÁCH
                </p>
                <p className="text-[14px] font-black text-slate-800 leading-tight">
                   <span className="text-purple-600 mr-1">{STATS.newRequirements}</span> đơn đặt mới
                </p>
              </div>
            </div>
            <ArrowRight size={14} className="text-slate-300 group-hover:text-purple-500 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* 1. FINANCIAL PULSE ROW */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 shrink-0">
          <MetricCard
            title="Tổng giá trị chốt đơn"
            value={formatCurrency(dynamicStats.totalContractValue)}
            trend="+18.5%"
            subtext="Tổng giá trị hợp đồng mới hôm nay"
            icon={Wallet}
            gradient="from-blue-500 to-indigo-600"
            linkTo="/owner/reports?type=sales"
          />

          <MetricCard
            title="Lợi nhuận gộp (Tạm tính)"
            value={formatCurrency(dynamicStats.estimatedProfit)}
            subtext="Dựa trên biên lợi nhuận đồ gỗ thủ công"
            icon={TrendingUp}
            gradient="from-emerald-400 to-teal-500"
            linkTo="/owner/reports?type=sales"
          />


          <MetricCard
            title="Tổng Phải Thu (KH)"
            value={formatCurrency(STATS.debtCustomer)}
            subtext="Số dư nợ khách hàng cần thu hồi"
            icon={Building2}
            gradient="from-indigo-400 to-blue-500"
            linkTo="/owner/reports?type=debt_customer"
          />

          <MetricCard
            title="Tổng Phải Trả (NCC)"
            value={formatCurrency(STATS.debtSupplier)}
            subtext="Công nợ gỗ & phụ kiện"
            icon={Building2}
            gradient="from-rose-400 to-red-500"
            linkTo="/owner/reports?type=debt_supplier"
          />
        </div>

        {/* 2. REVENUE CHART */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 shrink-0">
          <Card className="xl:col-span-2 border-0 shadow-sm rounded-2xl bg-white flex flex-col">
            <CardHeader className="py-5 px-8 border-b border-slate-50 flex flex-row items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-[16px] font-black text-slate-900 uppercase">
                  Biến động doanh thu
                </CardTitle>
                <CardDescription className="text-xs">Theo thời gian thực cập nhật từ đơn hàng</CardDescription>
              </div>
              <select
                value={revenueFilter}
                onChange={(e) => setRevenueFilter(e.target.value)}
                className="h-9 px-4 pr-10 rounded-xl text-[12px] font-black text-slate-700 bg-slate-50 border border-slate-200 focus:outline-none appearance-none cursor-pointer transition-colors hover:bg-slate-100"
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
            <CardContent className="p-8 flex-1 min-h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={currentRevenueData}
                  margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
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
                    tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 700 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 700 }}
                    tickFormatter={(value) => `${value / 1000000}M`}
                    width={40}
                  />
                  <RechartsTooltip
                    formatter={(value) => [formatCurrency(value), "Doanh thu"]}
                    contentStyle={{
                      borderRadius: "16px",
                      border: "none",
                      boxShadow: "0 20px 40px -10px rgba(0,0,0,0.1)",
                      fontSize: "12px",
                      padding: "12px 16px",
                      fontWeight: 800,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#3b82f6"
                    strokeWidth={4}
                    fill="url(#colorRev)"
                    activeDot={{ r: 6, fill: "#3b82f6", stroke: "#fff", strokeWidth: 3 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* WORKSHOP PIPELINE FLOW */}
          <Card className="xl:col-span-1 border-0 shadow-sm rounded-2xl bg-white flex flex-col overflow-hidden">
             <CardHeader className="py-5 px-8 border-b border-slate-50 bg-[#1e1e1e] text-white">
                <CardTitle className="text-[14px] font-black uppercase tracking-widest flex items-center gap-2">
                   <Activity size={18} className="text-blue-400" /> Tiến độ xưởng thực tế
                </CardTitle>
             </CardHeader>
             <CardContent className="p-8 space-y-8 flex-1 flex flex-col justify-center">
                {PIPELINE_DATA.map((stage, i) => {
                   const stageTotal = productions.length || 1;
                   const Icon = stage.icon;
                   return (
                      <Link 
                        key={i} 
                        to={stage.link}
                        className="block space-y-3 p-2 -m-2 rounded-xl hover:bg-slate-50 transition-colors group/stage"
                       >
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: stage.color, boxShadow: `0 8px 16px ${stage.color}40` }}>
                                  <Icon size={20} />
                                </div>
                               <span className="text-[13px] font-black text-slate-700 uppercase group-hover/stage:text-blue-600 transition-colors">{stage.name}</span>
                            </div>
                            <span className="text-[18px] font-black text-slate-900">{stage.value} <span className="text-[10px] text-slate-400 uppercase">Bộ</span></span>
                         </div>
                         <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                            <div 
                              className="h-full transition-all duration-1000 ease-out rounded-full" 
                              style={{ width: `${Math.min(100, Math.max(5, (stage.value / stageTotal) * 100))}%`, backgroundColor: stage.color }}
                            ></div>
                         </div>
                      </Link>
                   )
                })}
                <div className="mt-4 pt-6 border-t border-slate-50">
                   <Button variant="ghost" className="w-full text-blue-600 font-black text-xs uppercase" asChild>
                      <Link to="/owner/production">Xem chi tiết xưởng <ArrowRight size={14} className="ml-2"/></Link>
                   </Button>
                </div>
             </CardContent>
          </Card>
        </div>

        {/* 3. OPERATIONAL & ALERTS ROW */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 shrink-0">
          {/* Top Sản Phẩm */}
          <Card className="xl:col-span-2 border-0 shadow-sm rounded-2xl bg-white overflow-hidden flex flex-col">
            <CardHeader className="py-5 px-8 border-b border-slate-50 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="text-indigo-500 w-5 h-5" />
                <CardTitle className="text-[16px] font-black text-slate-900 uppercase">
                  Sản phẩm bán chạy nhất
                </CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-indigo-600 font-black hover:text-indigo-700 hover:bg-indigo-50 h-8 uppercase text-[11px]"
                asChild
              >
                <Link to="/owner/products">Xem toàn bộ</Link>
              </Button>
            </CardHeader>
            <CardContent className="p-6 flex-1">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={TOP_PRODUCTS}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#64748b", fontWeight: 800 }}
                  />
                  <RechartsTooltip cursor={{ fill: "#f8fafc" }} />
                  <Bar 
                    dataKey="revenue" 
                    fill="#6366f1" 
                    radius={[0, 4, 4, 0]} 
                    barSize={24}
                    className="cursor-pointer"
                    onClick={() => {
                       // Direct navigation to products
                       window.location.href = "/owner/products";
                    }}
                  >
                    {TOP_PRODUCTS.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Nhật ký hoạt động (Integrated) */}
          <Card className="xl:col-span-1 border-0 shadow-sm rounded-2xl bg-white flex flex-col">
            <CardHeader className="py-5 px-8 border-b border-slate-50">
              <div className="flex items-center gap-2">
                <History className="text-slate-400 w-5 h-5" />
                <CardTitle className="text-[16px] font-black text-slate-900 uppercase">
                  Nhật ký xưởng & CSKH
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              <div className="flex flex-col h-[350px] overflow-y-auto custom-scrollbar">
                {[...RECENT_ACTIVITIES, 
                  { id: 101, user: "Hùng (Thợ Sơn)", action: "Sửa xong nứt mặt bàn", target: "DH-SAN-004", time: "1 giờ trước", type: "warranty", link: "/owner/warranty" },
                  { id: 102, user: "Bình (Sales)", action: "Ghi nhận trả bảo hành", target: "KH Lê Văn Tám", time: "2 giờ trước", type: "warranty", link: "/owner/warranty" }
                ].sort((a, b) => b.id - a.id).map((activity) => (
                  <Link
                    key={activity.id}
                    to={activity.link || (activity.type === 'order' ? '/owner/orders' : activity.type === 'inventory' ? '/owner/products' : '/owner/dashboard')}
                    className="px-8 py-5 flex items-start gap-4 border-b border-slate-50 hover:bg-slate-50 transition-colors last:border-0 group/log"
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border mt-0.5 ${activity.type === 'warranty' ? 'bg-orange-50 border-orange-100 text-orange-500' : 'bg-blue-50 border-blue-100 text-blue-500'}`}>
                      {activity.type === 'warranty' ? <ShieldAlert size={16} /> : <User size={16} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-slate-600 font-bold leading-relaxed">
                        <span className="text-slate-900 group-hover/log:text-blue-600 transition-colors">{activity.user}</span> đã {activity.action.toLowerCase()}{" "}
                        <span className="text-slate-900 truncate">
                          {activity.target}
                        </span>
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">
                        {activity.time}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
