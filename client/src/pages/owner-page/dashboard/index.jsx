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
  FileEdit,
  Activity,
  ArrowRight,
  ShieldAlert,
  ShoppingCart,
  Package,
  CheckCircle2,
  AlertTriangle,
  History,
  User,
  Hammer,
  Paintbrush,
  Bell,
  BarChart2,
  ChevronRight,
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
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────
const currentOwnerName = "Võ Cường";

const STATS = {
  revenueToday: 16500000,
  revenueGrowth: 12.5,
  newRequirements: 4,
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

const TOP_PRODUCTS = [
  { name: "Sofa Góc Da L", qty: 24, revenue: 120000000 },
  { name: "Sập Gụ Tủ Chè", qty: 15, revenue: 90000000 },
  { name: "Kệ Tivi Sồi Mỹ", qty: 12, revenue: 45000000 },
  { name: "Bàn Trà Oval", qty: 9, revenue: 27000000 },
  { name: "Tủ Quần Áo 4C", qty: 6, revenue: 48000000 },
];

const BAR_COLORS = ["#2563eb", "#7c3aed", "#059669", "#d97706", "#dc2626"];

const LOW_STOCK_PRODUCTS = [
  { name: "Ghế đôn sofa L", currentStock: 2, id: "SP015", unit: "cái" },
  { name: "Bàn ăn tròn xoay", currentStock: 0, id: "SP088", unit: "bộ" },
  { name: "Kệ giày 3 tầng mỏng", currentStock: 4, id: "SP102", unit: "chiếc" },
];

const RECENT_ACTIVITIES = [
  { id: 1, user: "Bình Nguyễn", action: "Gửi yêu cầu khách hàng mới", target: "Yêu cầu tủ bếp sồi Nga", time: "10 phút trước", type: "order" },
  { id: 2, user: "Thợ cả", action: "Hoàn thành đánh giấy ráp", target: "LSX-2603-0001", time: "35 phút trước", type: "inventory" },
  { id: 3, user: "Thợ sơn B", action: "Báo cáo hoàn thành sơn", target: "LSX-2603-0012", time: "1 giờ trước", type: "product" },
  { id: 4, user: "Nguyễn Văn A", action: "Xác nhận duyệt lệnh", target: "LSX-2603-0007", time: "2 giờ trước", type: "inventory" },
  { id: 101, user: "Hùng (Thợ Sơn)", action: "Sửa xong nứt mặt bàn", target: "DH-SAN-004", time: "1 giờ trước", type: "warranty", link: "/owner/warranty" },
  { id: 102, user: "Bình (Sales)", action: "Ghi nhận trả bảo hành", target: "KH Lê Văn Tám", time: "2 giờ trước", type: "warranty", link: "/owner/warranty" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (val) => new Intl.NumberFormat("vi-VN").format(val) + " ₫";
const fmtShort = (val) => {
  if (val >= 1_000_000_000) return (val / 1_000_000_000).toFixed(1) + " tỷ";
  if (val >= 1_000_000) return (val / 1_000_000).toFixed(1) + " tr";
  return new Intl.NumberFormat("vi-VN").format(val);
};

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Compact KPI card used in financial row */
function KpiCard({ label, value, sub, icon: Icon, color, linkTo }) {
  const inner = (
    <div className={cn(
      "group relative bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-3 h-full",
      "shadow-sm hover:shadow-md transition-all duration-200",
      linkTo && "cursor-pointer hover:-translate-y-0.5"
    )}>
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: color + "18" }}
        >
          <Icon size={20} style={{ color }} />
        </div>
        {linkTo && (
          <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 mt-1 transition-colors" />
        )}
      </div>

      {/* Value */}
      <div>
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-[22px] font-black text-slate-900 leading-none tracking-tight">{value}</p>
        {sub && <p className="text-[11px] text-slate-400 mt-1.5 leading-tight">{sub}</p>}
      </div>
    </div>
  );

  return linkTo ? (
    <Link to={linkTo} className="block h-full">{inner}</Link>
  ) : inner;
}

/** Alert badge for hotspot cards */
function AlertCard({ label, count, countColor, icon: Icon, iconBg, border, to, pulse = false }) {
  return (
    <Link
      to={to}
      className={cn(
        "group bg-white rounded-2xl border p-4 flex items-center gap-4 shadow-sm",
        "hover:shadow-md transition-all duration-200 hover:-translate-y-0.5",
        border
      )}
    >
      <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0", iconBg, pulse && "animate-pulse")}>
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 leading-none mb-1">{label}</p>
        <p className="text-[15px] font-black text-slate-800 leading-tight">
          <span style={{ color: countColor }} className="mr-1 text-[18px]">{count}</span>
          mục cần xử lý
        </p>
      </div>
      <ArrowRight size={14} className="text-slate-300 group-hover:translate-x-0.5 transition-transform shrink-0" />
    </Link>
  );
}

/** Pipeline stage row */
function PipelineRow({ stage, total }) {
  const Icon = stage.icon;
  const pct = Math.min(100, Math.max(4, (stage.value / Math.max(total, 1)) * 100));
  return (
    <Link
      to={stage.link}
      className="group/row flex items-center gap-4 py-3 px-3 -mx-3 rounded-xl hover:bg-slate-50 transition-colors"
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0"
        style={{ backgroundColor: stage.color }}
      >
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[12px] font-bold text-slate-600 group-hover/row:text-slate-900 transition-colors truncate pr-2">
            {stage.name}
          </span>
          <span className="text-[13px] font-black text-slate-800 shrink-0">{stage.value} bộ</span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, backgroundColor: stage.color }}
          />
        </div>
      </div>
    </Link>
  );
}

/** Activity log row */
function ActivityRow({ activity }) {
  const isWarranty = activity.type === "warranty";
  return (
    <Link
      to={activity.link || (activity.type === "order" ? "/owner/orders" : activity.type === "inventory" ? "/owner/products" : "/owner/dashboard")}
      className="flex items-start gap-3 px-6 py-4 border-b border-slate-50 hover:bg-slate-50/80 transition-colors last:border-0"
    >
      <div className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
        isWarranty ? "bg-amber-50 text-amber-500" : "bg-blue-50 text-blue-500"
      )}>
        {isWarranty ? <ShieldAlert size={14} /> : <User size={14} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12.5px] text-slate-600 font-medium leading-snug">
          <span className="font-bold text-slate-800">{activity.user}</span>
          {" "}đã {activity.action.toLowerCase()}{" "}
          <span className="font-semibold text-slate-700">{activity.target}</span>
        </p>
        <p className="text-[10px] text-slate-400 font-semibold mt-0.5 uppercase tracking-wide">{activity.time}</p>
      </div>
    </Link>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function OwnerDashboard() {
  const [revenueFilter, setRevenueFilter] = useState("7_days");

  const [productions] = useState(() => {
    try {
      const saved = localStorage.getItem("tpf_simulated_productions");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [warrantyRequests] = useState(() => {
    try {
      const saved = localStorage.getItem("tpf_simulated_warranty_requests");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const dynamicStats = useMemo(() => {
    const pendingWarranty = warrantyRequests.filter((r) => r.status === "PENDING").length;
    const itemsToApprove = productions.filter((p) => p.isPendingApproval).length;
    const stageSummary = {
      moc: productions.filter((p) => p.status === "Đang đánh giấy ráp").length,
      son: productions.filter((p) => p.status === "Đang sơn" && !p.isPendingApproval).length,
      hoan_thanh: productions.filter((p) => p.status === "Hoàn thành").length,
    };
    const totalContractValue = 85500000;
    const estimatedProfit = totalContractValue * 0.42;
    return { pendingWarranty, itemsToApprove, stageSummary, estimatedProfit, totalContractValue };
  }, [productions, warrantyRequests]);

  const currentRevenueData = revenueFilter === "7_days" ? REVENUE_DATA_7_DAYS : REVENUE_DATA_30_DAYS;

  const PIPELINE_DATA = [
    { name: "Đánh giấy ráp", value: dynamicStats.stageSummary.moc, color: "#7c3aed", icon: Hammer, link: "/owner/production?status=Đang đánh giấy ráp" },
    { name: "Công đoạn sơn", value: dynamicStats.stageSummary.son, color: "#db2777", icon: Paintbrush, link: "/owner/production?status=Đang sơn" },
    { name: "Nghiệm thu hoàn thiện", value: dynamicStats.itemsToApprove, color: "#2563eb", icon: CheckCircle2, link: "/owner/production?status=Chờ duyệt" },
  ];

  const sortedActivities = [...RECENT_ACTIVITIES].sort((a, b) => b.id - a.id);

  return (
    <>
      <PageHelmet title="Tổng quan Điều hành | TPF-SIMS" />

      <div className="min-h-screen bg-[#f4f6fa] p-6 md:p-8 space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              Xin chào, {currentOwnerName}
            </p>
            <h1 className="text-[22px] font-black text-slate-900 tracking-tight">
              Tổng quan Điều hành
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-4 rounded-xl font-semibold text-[12px] border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
              asChild
            >
              <Link to="/owner/reports">
                <BarChart2 size={14} className="mr-1.5" />
                Báo cáo chi tiết
              </Link>
            </Button>
          </div>
        </div>

        {/* ── SECTION 1: Cảnh báo / Việc cần làm ── */}
        <section>
          <SectionLabel icon={Bell} text="Cần xử lý ngay" />
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mt-3">
            <AlertCard
              label="Sự cố bảo hành"
              count={dynamicStats.pendingWarranty || "—"}
              countColor="#f97316"
              icon={AlertTriangle}
              iconBg="bg-orange-50 text-orange-500"
              border="border-orange-200 hover:border-orange-400"
              to="/owner/warranty"
              pulse
            />
            <AlertCard
              label="Nghiệm thu xưởng"
              count={dynamicStats.itemsToApprove || "—"}
              countColor="#2563eb"
              icon={CheckCircle2}
              iconBg="bg-blue-50 text-blue-500"
              border="border-slate-100 hover:border-blue-300"
              to="/owner/production"
            />
            <AlertCard
              label="Hàng sắp hết kho"
              count={LOW_STOCK_PRODUCTS.length}
              countColor="#059669"
              icon={Package}
              iconBg="bg-emerald-50 text-emerald-500"
              border="border-slate-100 hover:border-emerald-300"
              to="/owner/products?tab=low_stock"
            />
            <AlertCard
              label="Yêu cầu từ khách"
              count={STATS.newRequirements}
              countColor="#7c3aed"
              icon={FileEdit}
              iconBg="bg-purple-50 text-purple-500"
              border="border-slate-100 hover:border-purple-300"
              to="/owner/customer-requirements"
            />
          </div>
        </section>

        {/* ── SECTION 2: Chỉ số tài chính ── */}
        <section>
          <SectionLabel icon={Wallet} text="Tài chính hôm nay" />
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mt-3">
            <KpiCard
              label="Giá trị hợp đồng mới"
              value={fmtShort(dynamicStats.totalContractValue)}
              sub={fmt(dynamicStats.totalContractValue)}
              icon={TrendingUp}
              color="#2563eb"
              linkTo="/owner/reports?type=sales"
            />
            <KpiCard
              label="Lợi nhuận gộp (tạm tính)"
              value={fmtShort(dynamicStats.estimatedProfit)}
              sub="Biên ~42% đồ gỗ thủ công"
              icon={Wallet}
              color="#059669"
              linkTo="/owner/reports?type=sales"
            />
            <KpiCard
              label="Phải thu (Khách hàng)"
              value={fmtShort(STATS.debtCustomer)}
              sub={fmt(STATS.debtCustomer)}
              icon={Building2}
              color="#6366f1"
              linkTo="/owner/reports?type=debt_customer"
            />
            <KpiCard
              label="Phải trả (Nhà cung cấp)"
              value={fmtShort(STATS.debtSupplier)}
              sub={fmt(STATS.debtSupplier)}
              icon={Building2}
              color="#e11d48"
              linkTo="/owner/reports?type=debt_supplier"
            />
          </div>
        </section>

        {/* ── SECTION 3: Charts & Pipeline ── */}
        <section>
          <SectionLabel icon={Activity} text="Biến động & Tiến độ" />
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-3">

            {/* Revenue chart */}
            <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
                <div>
                  <p className="text-[13px] font-black text-slate-800 uppercase tracking-tight">Biến động doanh thu</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Cập nhật từ đơn hàng thực tế</p>
                </div>
                <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
                  {[
                    { val: "7_days", label: "7 ngày" },
                    { val: "30_days", label: "30 ngày" },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      onClick={() => setRevenueFilter(opt.val)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all",
                        revenueFilter === opt.val
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-500 hover:text-slate-700"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-6 flex-1 min-h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={currentRevenueData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 600 }} dy={8} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 600 }} tickFormatter={(v) => `${v / 1e6}M`} width={36} />
                    <RechartsTooltip
                      formatter={(v) => [fmt(v), "Doanh thu"]}
                      contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 8px 24px rgba(0,0,0,0.10)", fontSize: 12, fontWeight: 700, padding: "10px 16px" }}
                    />
                    <Area type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={2.5} fill="url(#revGrad)" activeDot={{ r: 5, fill: "#2563eb", stroke: "#fff", strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pipeline */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-50 bg-slate-900">
                <p className="text-[12px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <Activity size={15} className="text-blue-400" />
                  Tiến độ xưởng thực tế
                </p>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-center gap-1">
                {PIPELINE_DATA.map((stage, i) => (
                  <PipelineRow key={i} stage={stage} total={productions.length || 10} />
                ))}
                <div className="pt-4 mt-2 border-t border-slate-50">
                  <Button variant="ghost" size="sm" className="w-full text-blue-600 font-bold text-[12px] uppercase hover:bg-blue-50" asChild>
                    <Link to="/owner/production">Xem chi tiết xưởng <ArrowRight size={13} className="ml-1.5" /></Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 4: Products & Activity ── */}
        <section>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

            {/* Top Products bar chart */}
            <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
                <div className="flex items-center gap-2">
                  <Package size={15} className="text-indigo-500" />
                  <p className="text-[13px] font-black text-slate-800 uppercase tracking-tight">Sản phẩm bán chạy</p>
                </div>
                <Link to="/owner/products" className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 uppercase tracking-wide">
                  Xem tất cả <ChevronRight size={12} />
                </Link>
              </div>
              <div className="px-6 pb-6 pt-4 flex-1 min-h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={TOP_PRODUCTS} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }}
                      width={130}
                    />
                    <RechartsTooltip
                      formatter={(v) => [fmt(v), "Doanh thu"]}
                      contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 8px 24px rgba(0,0,0,0.10)", fontSize: 12, fontWeight: 700, padding: "8px 14px" }}
                      cursor={{ fill: "#f8fafc" }}
                    />
                    <Bar dataKey="revenue" radius={[0, 6, 6, 0]} barSize={22}>
                      {TOP_PRODUCTS.map((_, i) => (
                        <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Low stock table */}
              <div className="border-t border-slate-50 px-6 pb-5 pt-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Package size={11} className="text-rose-400" /> Hàng sắp hết
                </p>
                <div className="space-y-2">
                  {LOW_STOCK_PRODUCTS.map((p) => (
                    <div key={p.id} className="flex items-center justify-between py-2 border-b border-dashed border-slate-100 last:border-0">
                      <div>
                        <p className="text-[12px] font-bold text-slate-700">{p.name}</p>
                        <p className="text-[10px] text-slate-400">{p.id}</p>
                      </div>
                      <span
                        className={cn(
                          "text-[11px] font-black px-2.5 py-1 rounded-lg",
                          p.currentStock === 0
                            ? "bg-red-50 text-red-600 border border-red-100"
                            : "bg-amber-50 text-amber-600 border border-amber-100"
                        )}
                      >
                        {p.currentStock === 0 ? "Hết hàng" : `Còn ${p.currentStock} ${p.unit}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Activity log */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-2">
                <History size={15} className="text-slate-400" />
                <p className="text-[13px] font-black text-slate-800 uppercase tracking-tight">Nhật ký hoạt động</p>
              </div>
              <div className="flex-1 overflow-y-auto" style={{ maxHeight: 520 }}>
                {sortedActivities.map((a) => (
                  <ActivityRow key={a.id} activity={a} />
                ))}
              </div>
              <div className="px-6 py-4 border-t border-slate-50">
                <Link to="/owner/logs" className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 uppercase tracking-wide">
                  Xem toàn bộ nhật ký <ChevronRight size={12} />
                </Link>
              </div>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}

// ─── Section Label helper ─────────────────────────────────────────────────────
function SectionLabel({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={13} className="text-slate-400" />
      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{text}</p>
      <div className="flex-1 h-px bg-slate-200/70" />
    </div>
  );
}