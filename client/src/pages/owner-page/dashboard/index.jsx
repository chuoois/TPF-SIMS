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
  Loader2,
} from "lucide-react";
import { useState, useMemo, useCallback } from "react";
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
import useCachedFetch from "@/hooks/useCachedFetch";
import dashboardService from "@/services/dashboard.service";

// ─── Constants ────────────────────────────────────────────────────────────────
const BAR_COLORS = ["#4f46e5", "#6366f1", "#818cf8", "#94a3b8", "#cbd5e1"];

const PERIOD_OPTIONS = [
  { value: "today", label: "Hôm nay" },
  { value: "week", label: "Tuần này" },
  { value: "month", label: "Tháng này" },
  { value: "year", label: "Năm nay" },
  { value: "all", label: "Tất cả" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (val) => new Intl.NumberFormat("vi-VN").format(val) + " ₫";
const fmtShort = (val) => {
  if (val >= 1_000_000_000) return (val / 1_000_000_000).toFixed(1) + " tỷ";
  if (val >= 1_000_000) return (val / 1_000_000).toFixed(1) + " tr";
  return new Intl.NumberFormat("vi-VN").format(val);
};

/** Format thời gian tương đối (VD: "10 phút trước") */
const timeAgo = (dateStr) => {
  if (!dateStr) return "";
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "Vừa xong";
  if (diffMin < 60) return `${diffMin} phút trước`;
  if (diffHour < 24) return `${diffHour} giờ trước`;
  if (diffDay < 7) return `${diffDay} ngày trước`;
  return date.toLocaleDateString("vi-VN");
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
  const isWarranty = activity.role === "WORKER";
  return (
    <div
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
          {" "}đã {activity.action.toLowerCase()}
          {activity.detail && (
            <>
              {" — "}
              <span className="font-semibold text-slate-700">{activity.detail}</span>
            </>
          )}
        </p>
        <p className="text-[10px] text-slate-400 font-semibold mt-0.5 uppercase tracking-wide">{timeAgo(activity.time)}</p>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function OwnerDashboard() {
  // ── Period filter state ──
  const [period, setPeriod] = useState("month");

  // ── Data fetching (period as dependency per REFACTORING_GUIDELINES) ──
  const fetchDashboard = useCallback(async () => {
    return await dashboardService.getOwnerDashboard({ period });
  }, [period]);

  const {
    data: dashboardData,
    isLoading,
    isRefreshing,
    refresh,
  } = useCachedFetch(`owner_dashboard_${period}`, fetchDashboard, { ttl: 1000 * 60 * 5 });

  // ── Destructure API data with fallbacks ──
  const alerts = dashboardData?.alerts || {};
  const pipeline = dashboardData?.pipeline || {};
  const topProducts = dashboardData?.topProducts || [];
  const lowStockProducts = dashboardData?.lowStockProducts || [];
  const recentActivities = dashboardData?.recentActivities || [];

  // ── Compute pipeline totals ──
  const processingPipeline = pipeline.processing || {};
  const totalProcessing = Object.values(processingPipeline).reduce((s, v) => s + v, 0) || 1;

  // Pipeline data for rendering
  // processing_status: 1=Chờ gia công, 2=Đang gia công, 3=Gửi Nghiệm Thu, 4=Hoàn thành
  const PIPELINE_DATA = [
    {
      name: "Tiếp nhận sản xuất",
      value: (processingPipeline[1] || 0) + (processingPipeline[2] || 0),
      icon: Package,
    },
    {
      name: "Chờ nghiệm thu xưởng",
      value: processingPipeline[3] || 0,
      icon: Camera,
    },
    {
      name: "Đã hoàn thành",
      value: processingPipeline[4] || 0,
      icon: CheckCircle2,
    },
  ];

  return (
    <>
      <PageHelmet title="Tổng quan Điều hành | TPF-SIMS" />

      {/* ── Global Loading (The Purple Bar) ── */}
      {(isLoading || isRefreshing) && (
        <div className="fixed top-0 left-0 right-0 z-[9999]">
          <div className="h-[2px] bg-indigo-500 animate-[loading_1.5s_infinite] origin-left"></div>
        </div>
      )}

      <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 space-y-8">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-black text-slate-900 tracking-tight">
              Tổng quan Điều hành
            </h1>
            <p className="text-[12px] text-slate-400 font-semibold mt-0.5">
              {PERIOD_OPTIONS.find(o => o.value === period)?.label || "Tháng này"}
              {dashboardData?.dateRange && (
                <span className="ml-1.5 text-slate-300">
                  ({new Date(dashboardData.dateRange.from).toLocaleDateString("vi-VN")} → {new Date(dashboardData.dateRange.to).toLocaleDateString("vi-VN")})
                </span>
              )}
            </p>
          </div>

          {/* ── Period Filter Pills ── */}
          <div className="flex items-center bg-white rounded-xl border border-slate-200 p-1 shadow-sm">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setPeriod(opt.value)}
                className={cn(
                  "px-3.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wide transition-all duration-200 cursor-pointer",
                  period === opt.value
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── SECTION 1: Cảnh báo / Việc cần làm ── */}
        <section>
          <SectionLabel icon={Bell} text="Cần xử lý ngay" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
            <AlertCard
              label="Nghiệm thu xưởng"
              count={alerts.itemsToApprove ?? "—"}
              icon={CheckCircle2}
              to="/owner/production"
              urgent={(alerts.itemsToApprove || 0) > 5}
            />
            <AlertCard
              label="Hàng sắp hết kho"
              count={alerts.lowStockCount ?? "—"}
              icon={Package}
              to="/owner/products?tab=low_stock"
            />
            <AlertCard
              label="Yêu cầu từ khách"
              count={alerts.pendingRequests ?? "—"}
              icon={FileEdit}
              to="/owner/requirements?status=Chờ+tiếp+nhận"
            />
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
                {topProducts.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topProducts} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
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
                        {topProducts.map((_, i) => (
                          <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex-1 flex items-center justify-center h-full">
                    <p className="text-[13px] text-slate-400">Chưa có dữ liệu bán hàng</p>
                  </div>
                )}
              </div>

              {/* Low stock table */}
              <div className="border-t border-slate-50 px-6 pb-5 pt-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Package size={11} className="text-rose-400" /> Hàng sắp hết
                </p>
                <div className="space-y-2">
                  {lowStockProducts.length > 0 ? lowStockProducts.map((p) => (
                    <div key={p.id} className="flex items-center justify-between py-2 border-b border-dashed border-slate-100 last:border-0">
                      <div>
                        <p className="text-[12px] font-bold text-slate-700">{p.name}</p>
                        <p className="text-[10px] text-slate-400">{p.sku}</p>
                      </div>
                      <span
                        className={cn(
                          "text-[11px] font-black px-2.5 py-1 rounded-lg",
                          p.currentStock === 0
                            ? "bg-red-50 text-red-600 border border-red-100"
                            : "bg-amber-50 text-amber-600 border border-amber-100"
                        )}
                      >
                        {p.currentStock === 0
                          ? `Hết hàng (Định mức: ${p.minStock})`
                          : `Còn ${p.currentStock} / ${p.minStock} ${p.isBundle ? "bộ" : "chiếc"}`}
                      </span>
                    </div>
                  )) : (
                    <p className="text-[12px] text-slate-400 py-2">Tất cả sản phẩm đều đủ kho</p>
                  )}
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
                {recentActivities.length > 0 ? recentActivities.map((a) => (
                  <ActivityRow key={a.id} activity={a} />
                )) : (
                  <div className="flex items-center justify-center py-12">
                    <p className="text-[13px] text-slate-400">Chưa có hoạt động nào</p>
                  </div>
                )}
              </div>
              <div className="px-6 py-4 border-t border-slate-50">
                <Link to="/owner/system-logs" className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 uppercase tracking-wide">
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