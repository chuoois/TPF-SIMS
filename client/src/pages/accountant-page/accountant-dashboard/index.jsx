import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PageHelmet } from "@/components/seo/PageHelmet";
import {
  Package, Warehouse, TrendingDown, LayoutGrid,
  ArrowDownToLine, ChevronRight, CheckCircle, Hammer,
  Users, Calendar, AlertTriangle, XCircle, Clock,
  RefreshCw, ShieldAlert,
} from "lucide-react";
import inventoryService from "@/services/inventory.service";

/**
 * AccountantDashboard – Tổng quan kho hàng
 * Dữ liệu thực từ API /inventory/dashboard
 * Updated: 2026-05-12 – Kết nối BE thật
 */

// ── Helpers ──────────────────────────────────────────────
const fmtCurrency = (n) =>
  n != null ? new Intl.NumberFormat("vi-VN").format(n) + "₫" : "—";

const fmtDateTime = (s) => {
  if (!s) return "—";
  const d = new Date(s);
  return `${d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}`;
};

const fmtMillions = (n) => {
  if (!n) return "—";
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + " Tỷ";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + " Tr";
  return fmtCurrency(n);
};

// ── TYPE BADGE ────────────────────────────────────────────
const TYPE_BADGE = {
  FINISHED: { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0", label: "Có sẵn" },
  RAW:      { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA", label: "Hàng mộc" },
  CUSTOM:   { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE", label: "Khách đặt" },
};

const getDaysStyle = (days) => {
  if (days === null || days === undefined) return null;
  if (days > 60) return { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA", label: `${days} ngày` };
  if (days > 30) return { bg: "#FFFBEB", text: "#D97706", border: "#FDE68A", label: `${days} ngày` };
  return { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0", label: `${days} ngày` };
};

const getUrgency = (p) => {
  const available = p.available ?? p.stock;
  if (available === 0) return { label: "Đã hết", bg: "#FEF2F2", text: "#DC2626", border: "#FECACA", Icon: XCircle };
  if (available <= p.minStock) return { label: "Sắp hết", bg: "#FFFBEB", text: "#D97706", border: "#FDE68A", Icon: AlertTriangle };
  return null;
};

// ── KPI Card ──────────────────────────────────────────────
function KpiCard({ icon: Icon, label, value, sub, colorClass, alert, to }) {
  const inner = (
    <div
      className="bg-white rounded-2xl p-5 flex items-start gap-4 shadow-sm border transition-all hover:shadow-md"
      style={{ borderColor: alert ? "#FECACA" : "var(--grid-border)" }}
    >
      <div className={`p-3 rounded-xl shrink-0 ${colorClass}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">{label}</p>
        <p className="text-2xl font-black text-gray-900">{value ?? "—"}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
  return to ? <Link to={to} className="block">{inner}</Link> : inner;
}

// ── Section wrapper ────────────────────────────────────────
function SectionCard({ title, titleColor, badge, badgeBg, badgeText, icon: Icon, iconColor, action, children }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm" style={{ border: "1px solid var(--grid-border)" }}>
      <div className="px-5 py-4 flex items-center justify-between border-b" style={{ borderColor: "var(--grid-border)" }}>
        <div className="flex items-center gap-2">
          <Icon size={17} style={{ color: iconColor }} />
          <span className="font-bold text-[15px]" style={{ color: titleColor }}>{title}</span>
          {badge != null && (
            <span className="ml-1 text-[12px] font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: badgeBg, color: badgeText, border: `1px solid ${badgeBg}` }}>
              {badge}
            </span>
          )}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

// ── Skeleton loader ────────────────────────────────────────
function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-gray-100 rounded-lg ${className}`} />;
}

// ── Main ──────────────────────────────────────────────────
export default function AccountantDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await inventoryService.getDashboardStats();
      setData(res);
    } catch (err) {
      console.error("Dashboard error:", err);
      setError("Không thể tải dữ liệu tổng quan kho hàng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const kpi = data?.kpi || {};
  const lowStockProducts = data?.lowStockProducts || [];
  const longStayProducts = data?.longStayProducts || [];
  const recentImports    = data?.recentImports    || [];

  const kpiCards = [
    {
      icon: Package, label: "Tổng sản phẩm",
      value: kpi.totalProducts?.toLocaleString(),
      colorClass: "bg-blue-500",
      sub: "Toàn bộ sản phẩm đang hoạt động",
      to: "/accountant/products",
    },
    {
      icon: Warehouse, label: "Tổng tồn kho",
      value: kpi.totalStock?.toLocaleString(),
      colorClass: "bg-emerald-500",
      sub: "Tổng số lượng tất cả sản phẩm",
    },
    {
      icon: TrendingDown, label: "Dưới định mức",
      value: kpi.lowStockCount?.toLocaleString(),
      colorClass: kpi.lowStockCount > 0 ? "bg-red-500" : "bg-gray-400",
      sub: "Sản phẩm cần nhập thêm hàng",
      to: "/accountant/products",
      alert: kpi.lowStockCount > 0,
    },
    {
      icon: Clock, label: "Tồn lâu > 60 ngày",
      value: kpi.longStayCount?.toLocaleString(),
      colorClass: kpi.longStayCount > 0 ? "bg-orange-500" : "bg-gray-400",
      sub: "Hàng cần xử lý hoặc giảm giá",
      to: "/accountant/products",
    },
    {
      icon: LayoutGrid, label: "Danh mục",
      value: kpi.categoryCount?.toLocaleString(),
      colorClass: "bg-violet-500",
      sub: "Số danh mục sản phẩm",
    },
    {
      icon: ShieldAlert, label: "Hàng lỗi",
      value: kpi.defectiveCount?.toLocaleString(),
      colorClass: kpi.defectiveCount > 0 ? "bg-red-400" : "bg-gray-400",
      sub: "Sản phẩm có đơn vị báo lỗi",
      to: "/accountant/products",
    },
  ];

  const typeStats = [
    { label: "Hàng có sẵn", value: kpi.finishedCount, icon: CheckCircle, badge: TYPE_BADGE.FINISHED },
    { label: "Hàng mộc",    value: kpi.rawCount,      icon: Hammer,      badge: TYPE_BADGE.RAW },
    { label: "Khách đặt",   value: kpi.customCount,   icon: Users,       badge: TYPE_BADGE.CUSTOM },
  ];

  return (
    <>
      <PageHelmet title="Tổng quan kho | Kế toán" />
      <div className="p-6 space-y-6" style={{ backgroundColor: "var(--bg-main)", minHeight: "calc(100vh - 64px)" }}>

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: "var(--text-main)" }}>
              <Warehouse size={22} style={{ color: "var(--brand-primary)" }} />
              Tổng quan kho hàng
            </h1>
            <p className="text-[13px] mt-0.5" style={{ color: "var(--text-placeholder)" }}>
              Theo dõi tình trạng kho và các cảnh báo tồn kho theo thời gian thực.
            </p>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-1.5 h-9 px-4 rounded-xl text-[13px] font-bold border cursor-pointer hover:bg-gray-50 transition"
            style={{ borderColor: "var(--grid-border)", color: "var(--text-secondary)" }}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            {loading ? "Đang tải..." : "Làm mới"}
          </button>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="rounded-xl px-4 py-3 flex items-center gap-2 text-red-700 text-[13px] font-semibold"
            style={{ backgroundColor: "#FEF2F2", border: "1px solid #FECACA" }}>
            <AlertTriangle size={15} /> {error}
          </div>
        )}

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[100px]" />)
            : kpiCards.map((c) => <KpiCard key={c.label} {...c} />)
          }
        </div>

        {/* ── Phân loại sản phẩm ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16" />)
            : typeStats.map(({ label, value, icon: Icon, badge }) => (
                <div key={label}
                  className="flex items-center gap-3 bg-white rounded-xl border px-4 py-3 shadow-sm"
                  style={{ borderColor: badge.border }}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: badge.bg }}>
                    <Icon size={16} style={{ color: badge.text }} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">{label}</p>
                    <p className="text-lg font-bold" style={{ color: badge.text }}>
                      {value ?? "—"} <span className="text-xs font-medium text-gray-400">sản phẩm</span>
                    </p>
                  </div>
                </div>
              ))
          }
        </div>

        {/* ── Cảnh báo dưới định mức ── */}
        {(loading || lowStockProducts.length > 0) && (
          <SectionCard
            title="Sản phẩm dưới định mức tồn kho"
            titleColor="#B91C1C"
            icon={AlertTriangle} iconColor="#EF4444"
            badge={lowStockProducts.length}
            badgeBg="#FEE2E2" badgeText="#DC2626"
            action={
              <Link to="/accountant/products"
                className="text-[12px] font-bold text-red-600 hover:text-red-800 flex items-center gap-1">
                Xem kho hàng <ChevronRight size={13} />
              </Link>
            }
          >
            {loading ? (
              <div className="p-4 space-y-2">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b" style={{ backgroundColor: "#FFF5F5" }}>
                      {["Sản phẩm", "Mã SP", "Danh mục", "Còn sẵn", "Định mức", "Trạng thái", ""].map((h, i) => (
                        <th key={i} className={`py-2 px-4 text-[11px] font-bold uppercase tracking-wider text-left text-red-700 ${i >= 3 && i <= 4 ? "text-center" : ""}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockProducts.map((p, idx) => {
                      const urgency = getUrgency(p);
                      return (
                        <tr key={p.id} className="hover:bg-red-50/40 transition-colors"
                          style={{ borderBottom: idx < lowStockProducts.length - 1 ? "1px solid #FEE2E2" : "none" }}>
                          <td className="py-3 px-4">
                            <p className="text-[13px] font-semibold text-gray-800 max-w-[200px] truncate">{p.name}</p>
                            {p.category && <p className="text-[11px] text-gray-400">{p.category}</p>}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-mono text-[11px] font-bold bg-gray-100 text-gray-600 border border-gray-200 px-1.5 py-0.5 rounded">
                              {p.sku}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-[12px] text-gray-500">{p.category || "—"}</span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="text-[15px] font-bold"
                              style={{ color: p.available === 0 ? "#DC2626" : "#D97706" }}>
                              {p.available}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="text-[13px] text-gray-500">{p.minStock}</span>
                          </td>
                          <td className="py-3 px-4">
                            {urgency && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full"
                                style={{ backgroundColor: urgency.bg, color: urgency.text, border: `1px solid ${urgency.border}` }}>
                                <urgency.Icon size={11} /> {urgency.label}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Link to="/accountant/imports"
                              className="inline-flex items-center gap-1 text-[12px] font-bold px-3 py-1.5 rounded-lg hover:opacity-90"
                              style={{ backgroundColor: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}>
                              <ArrowDownToLine size={12} /> Nhập ngay
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        )}

        {/* ── Hàng tồn lâu ── */}
        {(loading || longStayProducts.length > 0) && (
          <SectionCard
            title="Hàng tồn kho lâu ngày (> 60 ngày)"
            titleColor="#92400E"
            icon={Clock} iconColor="#F59E0B"
            badge={longStayProducts.length}
            badgeBg="#FEF3C7" badgeText="#B45309"
            action={
              <Link to="/accountant/products"
                className="text-[12px] font-bold text-orange-600 hover:text-orange-800 flex items-center gap-1">
                Xem kho hàng <ChevronRight size={13} />
              </Link>
            }
          >
            {loading ? (
              <div className="p-4 space-y-2">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b" style={{ backgroundColor: "#FFFBF0" }}>
                      {["Sản phẩm", "Mã SP", "Danh mục", "Loại hàng", "Tổng tồn", "Tồn từ"].map((h, i) => (
                        <th key={i} className={`py-2 px-4 text-[11px] font-bold uppercase tracking-wider text-left text-amber-700 ${i >= 4 ? "text-center" : ""}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {longStayProducts.map((p, idx) => {
                      const ds = getDaysStyle(p.daysOld);
                      const badge = TYPE_BADGE[p.type] || TYPE_BADGE.FINISHED;
                      return (
                        <tr key={p.id} className="hover:bg-orange-50/40 transition-colors"
                          style={{ borderBottom: idx < longStayProducts.length - 1 ? "1px solid #FEE0AA" : "none" }}>
                          <td className="py-3 px-4">
                            <p className="text-[13px] font-semibold text-gray-800 max-w-[200px] truncate">{p.name}</p>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-mono text-[11px] font-bold bg-gray-100 text-gray-600 border border-gray-200 px-1.5 py-0.5 rounded">
                              {p.sku}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-[12px] text-gray-500">{p.category || "—"}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-block px-2 py-0.5 text-[11px] font-bold rounded-md"
                              style={{ backgroundColor: badge.bg, color: badge.text, border: `1px solid ${badge.border}` }}>
                              {badge.label}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="text-[14px] font-bold"
                              style={{ color: p.stock === 0 ? "#DC2626" : "var(--text-main)" }}>
                              {p.stock}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {ds && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md"
                                style={{ backgroundColor: ds.bg, color: ds.text, border: `1px solid ${ds.border}` }}>
                                <Clock size={10} /> {ds.label}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        )}

        {/* ── Grid bottom: Nhập gần đây + Link nhanh ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Nhập hàng gần đây */}
          <div className="lg:col-span-2">
            <SectionCard
              title="Phiếu nhập hàng gần đây"
              titleColor="var(--text-main)"
              icon={ArrowDownToLine} iconColor="#6B7280"
              action={
                <Link to="/accountant/imports"
                  className="text-[12px] font-bold flex items-center gap-1"
                  style={{ color: "var(--brand-primary)" }}>
                  Xem tất cả <ChevronRight size={13} />
                </Link>
              }
            >
              {loading ? (
                <div className="p-4 space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
                </div>
              ) : recentImports.length === 0 ? (
                <div className="py-12 text-center text-[13px] text-gray-400">
                  Chưa có phiếu nhập hàng nào
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b" style={{ backgroundColor: "var(--grid-header-bg)" }}>
                        {["Ngày nhập", "Mã phiếu", "Sản phẩm", "SL", "Thành tiền"].map((h, i) => (
                          <th key={i} className={`py-2 px-4 text-[11px] font-bold uppercase tracking-wider text-left`}
                            style={{ color: "var(--text-placeholder)" }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {recentImports.map((item, idx) => (
                        <tr key={`${item.code}-${idx}`} className="hover:bg-gray-50/50 transition-colors"
                          style={{ borderBottom: idx < recentImports.length - 1 ? "1px solid var(--grid-border)" : "none" }}>
                          <td className="py-2.5 px-4">
                            <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
                              <Calendar size={12} className="text-gray-400" />
                              {fmtDateTime(item.date)}
                            </div>
                          </td>
                          <td className="py-2.5 px-4">
                            <span className="font-mono text-[11px] font-bold bg-gray-100 text-gray-700 border border-gray-200 px-2 py-0.5 rounded">
                              {item.code}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 font-semibold text-gray-800 max-w-[180px] truncate text-[13px]">
                            {item.product}
                          </td>
                          <td className="py-2.5 px-4 font-bold text-gray-800 text-[13px]">
                            {item.qty}
                          </td>
                          <td className="py-2.5 px-4 font-bold text-[13px]" style={{ color: "#15803D" }}>
                            {item.totalPrice > 0 ? fmtMillions(item.totalPrice) : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </SectionCard>
          </div>

          {/* Link nhanh */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: "1px solid var(--grid-border)" }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: "var(--grid-border)" }}>
              <p className="font-bold text-[15px]" style={{ color: "var(--text-main)" }}>Truy cập nhanh</p>
            </div>
            <div className="p-2 space-y-1">
              {[
                { to: "/accountant/products", label: "Kho hàng", icon: Warehouse, desc: "Xem toàn bộ sản phẩm" },
                { to: "/accountant/imports",  label: "Nhập hàng", icon: ArrowDownToLine, desc: "Quản lý phiếu nhập" },
                {
                  to: "/accountant/products",
                  label: "Dưới định mức",
                  icon: TrendingDown,
                  desc: kpi.lowStockCount > 0 ? `${kpi.lowStockCount} sản phẩm cần chú ý` : "Tất cả đều ổn",
                  alert: kpi.lowStockCount > 0,
                },
              ].map(({ to, label, icon: Icon, desc, alert }) => (
                <Link
                  key={label} to={to}
                  className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-gray-50 text-gray-700 transition-colors group"
                >
                  <span className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors"
                      style={{ backgroundColor: alert ? "#FEF2F2" : "#F3F4F6" }}>
                      <Icon size={16} style={{ color: alert ? "#DC2626" : "#6B7280" }} />
                    </span>
                    <span>
                      <p className="text-[13px] font-semibold text-gray-800">{label}</p>
                      <p className="text-[11px]" style={{ color: alert ? "#DC2626" : "#9CA3AF" }}>{desc}</p>
                    </span>
                  </span>
                  <ChevronRight size={15} className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              ))}
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
