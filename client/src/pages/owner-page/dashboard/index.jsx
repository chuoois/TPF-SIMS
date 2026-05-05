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
  Truck,
  Camera,
} from "lucide-react";
import { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from "recharts";
import { cn } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────
const currentOwnerName = "Võ Cường";

const STATS = {
  newRequirements: 4,
};



const TOP_PRODUCTS = [
  { name: "Sofa Góc Da L", qty: 24, revenue: 120000000 },
  { name: "Sập Gụ Tủ Chè", qty: 15, revenue: 90000000 },
  { name: "Kệ Tivi Sồi Mỹ", qty: 12, revenue: 45000000 },
  { name: "Bàn Trà Oval", qty: 9, revenue: 27000000 },
  { name: "Tủ Quần Áo 4C", qty: 6, revenue: 48000000 },
];

const BAR_COLORS = ["#4f46e5", "#6366f1", "#818cf8", "#94a3b8", "#cbd5e1"];

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



/** Alert badge for hotspot cards */
function AlertCard({ label, count, icon: Icon, to, urgent = false }) {
  return (
    <Link
      to={to}
      className={cn(
        "group bg-white rounded-2xl border border-slate-100 p-4 shrink-0 flex items-center gap-4 transition-all duration-200",
        "hover:shadow-md hover:border-indigo-100",
        urgent && "border-orange-100 bg-orange-50/10"
      )}
    >
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
        urgent ? "bg-orange-50 text-orange-500" : "bg-indigo-50 text-indigo-500"
      )}>
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
        <p className="text-[15px] font-black text-slate-800 leading-none">
          <span className={cn("mr-1 text-[17px]", urgent ? "text-orange-600" : "text-indigo-600")}>{count}</span>
          đang chờ xử lý
        </p>
      </div>
      <ChevronRight size={14} className="text-slate-300 group-hover:translate-x-0.5 transition-transform" />
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
      className="group/row flex items-center gap-4 py-2.5 px-3 -mx-3 rounded-xl hover:bg-indigo-50/30 transition-colors"
    >
      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 text-slate-500 group-hover/row:bg-indigo-600 group-hover/row:text-white transition-all shrink-0">
        <Icon size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[12px] font-bold text-slate-600 group-hover/row:text-slate-900 truncate">
            {stage.name}
          </span>
          <span className="text-[13px] font-black text-slate-800">{stage.value} đơn</span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all duration-700"
            style={{ width: `${pct}%` }}
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
      received: productions.filter((p) => p.status === "Tiếp nhận" || p.status === "Đang đánh giấy ráp" || p.status === "Đang sơn").length,
      hoan_thanh: productions.filter((p) => p.status === "Hoàn thành" || p.status === "COMPLETED").length,
    };
    return { pendingWarranty, itemsToApprove, stageSummary };
  }, [productions, warrantyRequests]);



  const PIPELINE_DATA = [
    { name: "Tiếp nhận sản xuất", value: dynamicStats.stageSummary.received, icon: Package, link: "/owner/manufacturing-orders" },
    { name: "Chờ nghiệm thu xưởng", value: dynamicStats.itemsToApprove, icon: Camera, link: "/owner/manufacturing-orders" },
    { name: "Đã hoàn thành", value: dynamicStats.stageSummary.hoan_thanh, icon: CheckCircle2, link: "/owner/manufacturing-orders" },
  ];

  const sortedActivities = [...RECENT_ACTIVITIES].sort((a, b) => b.id - a.id);

  return (
    <>
      <PageHelmet title="Tổng quan Điều hành | TPF-SIMS" />

      <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 space-y-8">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
           
            <h1 className="text-[22px] font-black text-slate-900 tracking-tight">
              Tổng quan Điều hành
            </h1>
          </div>
          <div className="flex items-center gap-2">

          </div>
        </div>

        {/* ── SECTION 1: Cảnh báo / Việc cần làm ── */}
        <section>
          <SectionLabel icon={Bell} text="Cần xử lý ngay" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
            <AlertCard
              label="Nghiệm thu xưởng"
              count={dynamicStats.itemsToApprove || "—"}
              icon={CheckCircle2}
              to="/owner/production"
              urgent={dynamicStats.itemsToApprove > 5}
            />
            <AlertCard
              label="Hàng sắp hết kho"
              count={LOW_STOCK_PRODUCTS.length}
              icon={Package}
              to="/owner/products?tab=low_stock"
            />
            <AlertCard
              label="Yêu cầu từ khách"
              count={STATS.newRequirements}
              icon={FileEdit}
              to="/owner/customer-requirements"
            />
          </div>
        </section>



        {/* ── SECTION 3: Charts & Pipeline ── */}
        <section>
          <SectionLabel icon={Activity} text="Biến động & Tiến độ" />
          <div className="grid grid-cols-1 gap-4 mt-3">


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