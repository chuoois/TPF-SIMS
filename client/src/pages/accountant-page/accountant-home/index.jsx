/**
 * AccountantHome – Tổng quan Tài chính Kế toán
 * Doanh thu / Chi phí / Lợi nhuận / Dòng tiền / Doanh thu bất thường
 * Kết nối dữ liệu thực tế từ API /dashboard/accountant kèm bộ lọc đa dạng
 */

import { useState, useEffect } from "react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import {
  TrendingUp, TrendingDown, DollarSign, ArrowDownUp,
  AlertCircle, ChevronDown, ChevronRight,
  ArrowUpRight, ArrowDownRight, Plus,
  Calendar, RefreshCw, AlertTriangle,
  Package, UserCheck
} from "lucide-react";
import dashboardService from "@/services/dashboard.service";

// ── Helpers ──────────────────────────────────────────────
const fmt = (n) => (n != null ? new Intl.NumberFormat("vi-VN").format(n) + "₫" : "0₫");
const fmtM = (n) => {
  if (n == null) return "0₫";
  if (Math.abs(n) >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + " Tỷ";
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(1) + " Tr";
  return fmt(n);
};

// ── Tự động sinh danh sách tháng/quý/năm từ 12 tháng gần nhất ──
function generateAvailableMonths(count = 12) {
  const now = new Date();
  const result = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push(`${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`);
  }
  return result;
}

function generateAvailableQuarters(count = 6) {
  const now = new Date();
  const result = [];
  let year = now.getFullYear();
  let quarter = Math.floor(now.getMonth() / 3) + 1;
  for (let i = 0; i < count; i++) {
    result.push(`Q${quarter}/${year}`);
    quarter--;
    if (quarter < 1) { quarter = 4; year--; }
  }
  return result;
}

function generateAvailableYears(count = 3) {
  const y = new Date().getFullYear();
  return Array.from({ length: count }, (_, i) => String(y - i));
}

const AVAILABLE_MONTHS   = generateAvailableMonths(12);
const AVAILABLE_QUARTERS = generateAvailableQuarters(6);
const AVAILABLE_YEARS    = generateAvailableYears(3);

// ── Section Card ─────────────────────────────────────────
function Section({ icon: Icon, iconColor, borderColor, title, subtitle, badge, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl overflow-hidden transition-all shadow-sm hover:shadow" style={{ border: `1px solid ${borderColor}` }}>
      <button
        className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50/60 transition-colors cursor-pointer"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: borderColor + "33" }}>
            <Icon size={20} style={{ color: iconColor }} />
          </div>
          <div>
            <p className="text-[16px] font-bold text-gray-900">{title}</p>
            {subtitle && <p className="text-[13px] text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
          {badge && (
            <span className="ml-3 text-[12px] font-black px-3 py-1 rounded-full" style={{ backgroundColor: borderColor + "22", color: iconColor }}>
              {badge}
            </span>
          )}
        </div>
        {open ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronRight size={18} className="text-gray-400" />}
      </button>
      {open && <div style={{ borderTop: `1px solid ${borderColor}` }}>{children}</div>}
    </div>
  );
}

// ── KPI pill ─────────────────────────────────────────────
function KpiRow({ items }) {
  return (
    <div className="grid gap-4 p-5" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0,1fr))` }}>
      {items.map((k) => (
        <div key={k.label} className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">{k.label}</p>
          <p className="text-[20px] font-black leading-tight" style={{ color: k.color }}>{k.value}</p>
          {k.sub && <p className="text-[12px] text-gray-400 mt-1">{k.sub}</p>}
        </div>
      ))}
    </div>
  );
}

// ── Mini table ───────────────────────────────────────────
function MiniTable({ heads, rows, emptyLabel = "Không có dữ liệu" }) {
  if (!rows || rows.length === 0) {
    return <div className="p-6 text-center text-sm text-gray-400">{emptyLabel}</div>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead>
          <tr style={{ backgroundColor: "var(--grid-header-bg)", borderBottom: "1px solid var(--grid-border)" }}>
            {heads.map((h, i) => (
              <th key={i} className={`px-5 py-3 text-[11px] font-bold uppercase tracking-wider ${h.right ? "text-right" : "text-left"}`}
                style={{ color: "var(--text-placeholder)" }}>{h.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: "1px solid var(--grid-border)" }} className="hover:bg-gray-50/50 transition-colors">
              {row}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Profit summary bar ───────────────────────────────────
function ProfitBar({ label, value, color, icon: Icon }) {
  return (
    <div className="flex items-center justify-between py-3.5 px-6" style={{ borderBottom: "1px solid var(--grid-border)" }}>
      <span className="flex items-center gap-2.5 text-[14px] font-semibold text-gray-700">
        <Icon size={16} style={{ color }} />
        {label}
      </span>
      <span className="text-[16px] font-black" style={{ color }}>{fmtM(value)}</span>
    </div>
  );
}

// ── DEPOSIT TYPE badge ────────────────────────────────────
const DEPOSIT_META = {
  IMPORT_DEPOSIT:   { label: "Cọc nhập hàng", bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  CUSTOMER_DEPOSIT: { label: "Cọc khách mua", bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
  REFUND_DEPOSIT:   { label: "Hoàn cọc KH",   bg: "#FEF2F2", text: "#DC2626", border: "#FECACA" },
};

// ── Skeleton loader ────────────────────────────────────────
function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />;
}

// ══════════════════════════════════════════════════════════
export default function AccountantHome() {
  // Bộ lọc
  const [period, setPeriod] = useState("month");
  const [selectedMonth, setSelectedMonth] = useState(AVAILABLE_MONTHS[0]);    // tháng hiện tại
  const [selectedQuarter, setSelectedQuarter] = useState(AVAILABLE_QUARTERS[0]); // quý hiện tại
  const [selectedYear, setSelectedYear] = useState(AVAILABLE_YEARS[0]);       // năm hiện tại
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateRangeError, setDateRangeError] = useState(""); // lỗi khoảng ngày
  const [orderType, setOrderType] = useState("all");

  // Dữ liệu & Trạng thái
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await dashboardService.getAccountantDashboard({
        period,
        selectedMonth: period === "month" ? selectedMonth : undefined,
        selectedQuarter: period === "quarter" ? selectedQuarter : undefined,
        selectedYear: period === "year" ? selectedYear : undefined,
        startDate: period === "custom" ? startDate : undefined,
        endDate: period === "custom" ? endDate : undefined,
        orderType,
      });
      setData(res);
    } catch (err) {
      console.error("Fetch accountant dashboard error:", err);
      setError("Không thể tải dữ liệu tổng quan tài chính. Vui lòng kiểm tra lại kết nối.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Validate khoảng ngày tùy chọn trước khi fetch
    if (period === "custom") {
      if (startDate && endDate && startDate > endDate) {
        setDateRangeError("Ngày bắt đầu không được lớn hơn ngày kết thúc");
        return;
      }
      if (!startDate || !endDate) return; // chờ user điền đủ 2 ngày
    }
    setDateRangeError("");
    fetchData();
  }, [period, selectedMonth, selectedQuarter, selectedYear, startDate, endDate, orderType]);

  // Giải nén dữ liệu
  const summary = data?.summary || {};
  const completedOrders = data?.completedOrders || [];
  const abnormalOrders = data?.abnormalOrders || [];
  const importReceipts = data?.importReceipts || [];
  const salaryRecords = data?.salaryRecords || [];
  const cashFlows = data?.cashFlows || [];
  const monthlyComparisons = data?.monthlyComparisons || [];

  // Summary cards top
  const summaryCards = [
    { label: "Doanh thu",    value: fmtM(summary.revenue),   color: "#15803D", bg: "#F0FDF4", border: "#BBF7D0", icon: TrendingUp },
    { label: "Chi phí",      value: fmtM(summary.totalCost), color: "#DC2626", bg: "#FEF2F2", border: "#FECACA", icon: TrendingDown },
    { label: "DT bất thường",value: fmtM(summary.abnormalRevenue), color: "#D97706", bg: "#FFFBEB", border: "#FDE68A", icon: AlertCircle },
    { label: "Lợi nhuận",    value: fmtM(summary.profit),    color: summary.profit >= 0 ? "#7C3AED" : "#DC2626", bg: "#F5F3FF", border: "#DDD6FE", icon: DollarSign },
  ];

  return (
    <>
      <PageHelmet title="Tổng quan tài chính | Kế toán TPF-SIMS" />
      <div className="flex flex-col -m-6 p-6 gap-6 overflow-y-auto" style={{ backgroundColor: "var(--bg-main)", minHeight: "calc(100vh - 64px)" }}>

        {/* ── Header & Thanh Bộ Lọc (Filters Bar) ── */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border flex flex-col gap-4" style={{ borderColor: "var(--grid-border)" }}>
          <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: "var(--grid-border)" }}>
            <div>
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <DollarSign className="text-violet-600" size={24} />
                Tổng quan tài chính Kế toán
              </h1>
              <p className="text-[13px] text-gray-400 mt-0.5">Quản lý và phân tích Doanh thu, Chi phí, Dòng tiền và Lợi nhuận theo thời gian thực</p>
            </div>
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 h-10 px-4 rounded-xl text-[13px] font-bold border cursor-pointer hover:bg-gray-50 transition"
              style={{ borderColor: "var(--grid-border)", color: "var(--text-secondary)" }}
            >
              <RefreshCw size={15} className={loading ? "animate-spin text-violet-600" : "text-violet-600"} />
              {loading ? "Đang xử lý..." : "Làm mới"}
            </button>
          </div>

          {/* Bộ lọc chi tiết */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
            {/* 1. Chọn mốc / kỳ thời gian */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1">
                <Calendar size={13} /> Kỳ báo cáo
              </label>
              <div className="flex gap-1.5">
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="h-10 px-3 rounded-xl border text-[13px] font-semibold bg-gray-50 hover:bg-white focus:bg-white transition outline-none"
                  style={{ borderColor: "var(--grid-border)" }}
                >
                  <option value="month">Theo Tháng</option>
                  <option value="quarter">Theo Quý</option>
                  <option value="year">Theo Năm</option>
                  <option value="custom">Tùy chọn</option>
                </select>

                {period === "month" && (
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="h-10 px-3 flex-1 rounded-xl border text-[13px] font-semibold bg-white outline-none"
                    style={{ borderColor: "var(--grid-border)" }}
                  >
                    {AVAILABLE_MONTHS.map(m => <option key={m} value={m}>Tháng {m}</option>)}
                  </select>
                )}

                {period === "quarter" && (
                  <select
                    value={selectedQuarter}
                    onChange={(e) => setSelectedQuarter(e.target.value)}
                    className="h-10 px-3 flex-1 rounded-xl border text-[13px] font-semibold bg-white outline-none"
                    style={{ borderColor: "var(--grid-border)" }}
                  >
                    {AVAILABLE_QUARTERS.map(q => <option key={q} value={q}>{q}</option>)}
                  </select>
                )}

                {period === "year" && (
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="h-10 px-3 flex-1 rounded-xl border text-[13px] font-semibold bg-white outline-none"
                    style={{ borderColor: "var(--grid-border)" }}
                  >
                    {AVAILABLE_YEARS.map(y => <option key={y} value={y}>Năm {y}</option>)}
                  </select>
                )}
              </div>
            </div>

            {/* 2. Custom Date (nếu chọn Tùy chọn) */}
            {period === "custom" && (
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Từ ngày</label>
                  <input type="date" value={startDate}
                    max={endDate || undefined}
                    onChange={(e) => { setStartDate(e.target.value); setDateRangeError(""); }}
                    className="h-10 w-full px-3 rounded-xl border text-[13px] font-semibold bg-white outline-none"
                    style={{ borderColor: dateRangeError ? "#EF4444" : "var(--grid-border)" }} />
                </div>
                <div className="flex-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Đến ngày</label>
                  <input type="date" value={endDate}
                    min={startDate || undefined}
                    onChange={(e) => { setEndDate(e.target.value); setDateRangeError(""); }}
                    className="h-10 w-full px-3 rounded-xl border text-[13px] font-semibold bg-white outline-none"
                    style={{ borderColor: dateRangeError ? "#EF4444" : "var(--grid-border)" }} />
                </div>
              </div>
            )}
            {dateRangeError && period === "custom" && (
              <div className="text-[12px] text-red-500 font-semibold flex items-center gap-1 mt-1 col-span-full">
                <AlertTriangle size={13} /> {dateRangeError}
              </div>
            )}

            {/* 3. Lọc theo Loại đơn hàng */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1">
                <Package size={13} /> Nhóm đơn hàng
              </label>
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value)}
                className="h-10 w-full px-3 rounded-xl border text-[13px] font-semibold bg-white outline-none"
                style={{ borderColor: "var(--grid-border)" }}
              >
                <option value="all">Tất cả đơn hàng</option>
                <option value="2">Đơn hàng sẵn (Stock)</option>
                <option value="1">Đơn hàng mộc (Raw)</option>
                <option value="3">Đơn hàng custom</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Error Alert ── */}
        {error && (
          <div className="rounded-2xl px-5 py-4 flex items-center gap-3 text-red-700 text-[14px] font-semibold shadow-sm"
            style={{ backgroundColor: "#FEF2F2", border: "1px solid #FECACA" }}>
            <AlertTriangle size={18} className="text-red-600 shrink-0" /> {error}
          </div>
        )}

        {/* ── Top KPI cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[90px]" />)
          ) : (
            summaryCards.map(({ label, value, color, bg, border, icon: Icon }) => (
              <div key={label} className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm border transition-all hover:shadow" style={{ borderColor: border }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: bg }}>
                  <Icon size={22} style={{ color }} />
                </div>
                <div>
                  <p className="text-[12px] font-bold uppercase tracking-wider text-gray-400 mb-1">{label}</p>
                  <p className="text-[22px] font-black leading-tight" style={{ color }}>{value}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── 1. DOANH THU ─────────────────────────────── */}
        {loading ? <Skeleton className="h-[250px]" /> : (
          <Section
            icon={TrendingUp} iconColor="#15803D" borderColor="#BBF7D0"
            title="Doanh thu bán hàng (Đầu vào)"
            subtitle="Ghi nhận từ các đơn hàng đã giao và hoàn thành thành công"
            badge={`${completedOrders.length} đơn hàng`}
          >
            <KpiRow items={[
              { label: "Số đơn hoàn thành", value: completedOrders.length, color: "#374151", sub: "Trong kỳ báo cáo" },
              { label: "Tổng doanh thu",    value: fmtM(summary.revenue),   color: "#15803D", sub: "Tổng giá trị thanh toán" },
            ]} />
            <MiniTable
              heads={[{ label: "Mã đơn" }, { label: "Khách hàng" }, { label: "Ngày HT" }, { label: "Giá trị", right: true }]}
              rows={completedOrders.map((o) => (
                <>
                  <td className="px-5 py-3.5"><span className="font-mono text-[11px] font-bold bg-gray-100 text-gray-700 border border-gray-200 px-2 py-0.5 rounded">{o.code}</span></td>
                  <td className="px-5 py-3.5 font-semibold text-gray-800">{o.customer}</td>
                  <td className="px-5 py-3.5 text-gray-500 text-[12px]">{o.date}</td>
                  <td className="px-5 py-3.5 text-right font-black text-green-700">{fmtM(o.total_amount)}</td>
                </>
              ))}
              emptyLabel="Không có đơn hàng nào hoàn thành trong kỳ lọc"
            />
            <div className="flex justify-end px-6 py-4 bg-green-50/60 border-t border-green-100">
              <span className="text-[13px] font-bold text-green-800 uppercase tracking-wider mr-4">Tổng doanh thu bán hàng</span>
              <span className="text-[18px] font-black text-green-700">{fmt(summary.revenue)}</span>
            </div>
          </Section>
        )}

        {/* ── 2. CHI PHÍ ───────────────────────────────── */}
        {loading ? <Skeleton className="h-[250px]" /> : (
          <Section
            icon={TrendingDown} iconColor="#DC2626" borderColor="#FECACA"
            title="Chi phí hoạt động (Đầu ra)"
            subtitle="Tổng hợp chi phí nhập hàng hóa và chi trả lương nhân sự"
            badge={fmtM(summary.totalCost)}
          >
            <KpiRow items={[
              { label: "Lương nhân viên",  value: fmtM(summary.salaryCost),  color: "#D97706", sub: "Tổng lương thực tế" },
              { label: "Chi phí nhập hàng", value: fmtM(summary.importCost), color: "#DC2626", sub: "Tổng giá trị phiếu nhập" },
              { label: "Tổng chi phí",     value: fmtM(summary.totalCost),   color: "#7F1D1D", sub: "Lương + Nhập hàng" },
            ]} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border-t border-red-200 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
              {/* Bảng chi phí nhập */}
              <div>
                <div className="p-4 bg-gray-50/50 border-b border-gray-200 font-bold text-[13px] text-gray-700 flex items-center gap-2">
                  <Package size={16} className="text-red-600" /> Bảng kê phiếu nhập hàng
                </div>
                <MiniTable
                  heads={[{ label: "Mã phiếu" }, { label: "Nhà cung cấp" }, { label: "Ngày" }, { label: "Số tiền", right: true }]}
                  rows={importReceipts.map(r => (
                    <>
                      <td className="px-4 py-3"><span className="font-mono text-[11px] font-bold bg-gray-100 px-1.5 py-0.5 rounded">{r.code}</span></td>
                      <td className="px-4 py-3 font-semibold text-gray-800 text-[12px]">{r.supplier}</td>
                      <td className="px-4 py-3 text-gray-500 text-[12px]">{r.date}</td>
                      <td className="px-4 py-3 text-right font-bold text-red-600">{fmtM(r.amount)}</td>
                    </>
                  ))}
                  emptyLabel="Không có phiếu nhập kho nào trong kỳ lọc"
                />
              </div>

              {/* Bảng chi phí lương */}
              <div>
                <div className="p-4 bg-gray-50/50 border-b border-gray-200 font-bold text-[13px] text-gray-700 flex items-center gap-2">
                  <UserCheck size={16} className="text-amber-600" /> Bảng kê lương nhân viên
                </div>
                <MiniTable
                  heads={[{ label: "Nhân viên" }, { label: "Lương cơ bản" }, { label: "Phụ cấp/Trừ" }, { label: "Thực lãnh", right: true }]}
                  rows={salaryRecords.map(s => (
                    <>
                      <td className="px-4 py-3 font-semibold text-gray-800 text-[12px]">{s.employee}</td>
                      <td className="px-4 py-3 text-gray-600 text-[12px]">{fmtM(s.baseSalary)}</td>
                      <td className="px-4 py-3 text-[12px] font-medium" style={{ color: s.adjustmentsSum >= 0 ? "#15803D" : "#DC2626" }}>
                        {s.adjustmentsSum >= 0 ? "+" : ""}{fmtM(s.adjustmentsSum)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-amber-700">{fmtM(s.totalSalary)}</td>
                    </>
                  ))}
                  emptyLabel="Không có bản ghi lương nào trong kỳ lọc"
                />
              </div>
            </div>

            <div className="flex items-center justify-between px-6 py-4 bg-red-50/60 border-t border-red-100">
              <span className="text-[13px] font-black uppercase tracking-wider text-red-800">Tổng chi phí hoạt động</span>
              <span className="text-[18px] font-black text-red-700">{fmt(summary.totalCost)}</span>
            </div>
          </Section>
        )}

        {/* ── 3. LỢI NHUẬN ─────────────────────────────── */}
        {loading ? <Skeleton className="h-[180px]" /> : (
          <Section
            icon={DollarSign} iconColor="#7C3AED" borderColor="#DDD6FE"
            title="Báo cáo Lợi nhuận ròng"
            subtitle="Công thức: Doanh thu bán hàng − Tổng chi phí + Doanh thu bất thường"
          >
            <div style={{ padding: "0" }}>
              <ProfitBar label="Doanh thu bán hàng" value={summary.revenue} color="#15803D" icon={ArrowUpRight} />
              <ProfitBar label="Tổng chi phí hoạt động" value={-summary.totalCost} color="#DC2626" icon={ArrowDownRight} />
              <ProfitBar label="Doanh thu bất thường (Phạt cọc)" value={summary.abnormalRevenue} color="#D97706" icon={Plus} />
              <div className="flex items-center justify-between py-6 px-6 bg-violet-50/80 border-t border-violet-100">
                <div>
                  <p className="text-[13px] font-bold uppercase tracking-wider text-violet-700 mb-1">Lợi nhuận ròng trong kỳ</p>
                  <p className="text-[12px] text-gray-500">= Doanh thu − Chi phí + DT bất thường</p>
                </div>
                <span className="text-[28px] font-black" style={{ color: summary.profit >= 0 ? "#7C3AED" : "#DC2626" }}>
                  {summary.profit >= 0 ? "+" : ""}{fmtM(summary.profit)}
                </span>
              </div>
            </div>
          </Section>
        )}

        {/* ── 4. DÒNG TIỀN ─────────────────────────────── */}
        {loading ? <Skeleton className="h-[250px]" /> : (
          <Section
            icon={ArrowDownUp} iconColor="#7C3AED" borderColor="#DDD6FE"
            title="Lưu chuyển Dòng tiền (Cash Flow)"
            subtitle="Theo dõi chi tiết dòng tiền vào (thu cọc khách) và dòng tiền ra (cọc xưởng, hoàn cọc)"
            badge={`${cashFlows.length} giao dịch`}
          >
            <KpiRow items={[
              { label: "Cọc khách vào",   value: fmtM(summary.customerIn), color: "#15803D", sub: "Tiền mặt thu vào" },
              { label: "Cọc cửa hàng → xưởng", value: fmtM(summary.importOut), color: "#DC2626", sub: "Tiền mặt chi ra" },
              { label: "Hoàn cọc khách",  value: fmtM(summary.refundOut), color: "#EF4444", sub: "Tiền mặt chi ra" },
              { label: "Dòng tiền ròng",  value: fmtM(summary.netCash),   color: summary.netCash >= 0 ? "#7C3AED" : "#DC2626", sub: "Cọc vào − Cọc ra − Hoàn cọc" },
            ]} />
            <MiniTable
              heads={[
                { label: "Ngày" }, { label: "Phân loại" }, { label: "Nội dung giao dịch" }, { label: "Số tiền", right: true },
              ]}
              rows={cashFlows.map((c) => {
                const meta = DEPOSIT_META[c.type] || DEPOSIT_META.CUSTOMER_DEPOSIT;
                const isOut = c.type === "IMPORT_DEPOSIT" || c.type === "REFUND_DEPOSIT";
                const displayAmt = isOut ? -Math.abs(c.amount) : Math.abs(c.amount);
                return (
                  <>
                    <td className="px-5 py-3.5 text-[12px] text-gray-500">{c.date}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full inline-block"
                        style={{ backgroundColor: meta.bg, color: meta.text, border: `1px solid ${meta.border}` }}>
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-800 font-medium text-[13px]">{c.label}</td>
                    <td className="px-5 py-3.5 text-right font-black text-[14px]" style={{ color: displayAmt >= 0 ? "#15803D" : "#DC2626" }}>
                      {displayAmt >= 0 ? "+" : ""}{fmtM(displayAmt)}
                    </td>
                  </>
                );
              })}
              emptyLabel="Không có giao dịch lưu chuyển tiền tệ nào trong kỳ lọc"
            />
          </Section>
        )}

        {/* ── 5. DOANH THU BẤT THƯỜNG ──────────────────── */}
        {loading ? <Skeleton className="h-[200px]" /> : (
          <Section
            icon={AlertCircle} iconColor="#D97706" borderColor="#FDE68A"
            title="Doanh thu bất thường (Thu phạt cọc)"
            subtitle="Ghi nhận từ các đơn hàng bị hủy do lỗi phía khách hàng dẫn đến việc mất cọc"
            badge={abnormalOrders.length > 0 ? `${abnormalOrders.length} trường hợp` : "Không có"}
            defaultOpen={abnormalOrders.length > 0}
          >
            {abnormalOrders.length === 0 ? (
              <div className="px-6 py-8 text-center text-sm text-gray-400">Không phát sinh khoản doanh thu bất thường nào trong kỳ lọc</div>
            ) : (
              <>
                <MiniTable
                  heads={[
                    { label: "Mã đơn hủy" }, { label: "Khách hàng" }, { label: "Ngày hủy" }, { label: "Lý do hủy" }, { label: "Tiền cọc thu phạt", right: true },
                  ]}
                  rows={abnormalOrders.map((a) => (
                    <>
                      <td className="px-5 py-3.5"><span className="font-mono text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded">{a.order_code}</span></td>
                      <td className="px-5 py-3.5 font-semibold text-gray-800">{a.customer}</td>
                      <td className="px-5 py-3.5 text-[12px] text-gray-500">{a.date}</td>
                      <td className="px-5 py-3.5 text-[12px] text-gray-600 max-w-[280px] truncate">{a.reason}</td>
                      <td className="px-5 py-3.5 text-right font-black text-amber-600 text-[14px]">{fmtM(a.deposit_kept)}</td>
                    </>
                  ))}
                />
                <div className="flex justify-end px-6 py-4 bg-amber-50/60 border-t border-amber-100">
                  <span className="text-[13px] font-bold text-amber-800 uppercase tracking-wider mr-4">Tổng doanh thu bất thường</span>
                  <span className="text-[18px] font-black text-amber-700">{fmt(summary.abnormalRevenue)}</span>
                </div>
              </>
            )}
          </Section>
        )}

        {/* ── BẢNG SO SÁNH CÁC THÁNG GẦN NHẤT ── */}
        <div className="bg-white rounded-2xl overflow-hidden shrink-0 shadow-sm border" style={{ borderColor: "var(--grid-border)" }}>
          <div className="px-6 py-5 border-b flex items-center justify-between bg-gray-50/40" style={{ borderColor: "var(--grid-border)" }}>
            <div>
              <p className="text-[16px] font-bold text-gray-900">So sánh chỉ số tài chính các tháng gần nhất</p>
              <p className="text-[13px] text-gray-400 mt-0.5">Bảng tổng hợp biến động Doanh thu, Chi phí và Lợi nhuận trong vòng 6 tháng qua</p>
            </div>
            <span className="text-[12px] font-bold px-3 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-200">
              6 Tháng gần nhất
            </span>
          </div>
          {loading ? <Skeleton className="h-[300px] m-4" /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr style={{ backgroundColor: "var(--grid-header-bg)", borderBottom: "1px solid var(--grid-border)" }}>
                    {["Tháng", "Doanh thu", "Chi phí lương", "Chi phí nhập", "Tổng chi phí", "DT bất thường", "Lợi nhuận ròng"].map((h, i) => (
                      <th key={i} className={`px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider ${i === 0 ? "text-left" : "text-right"}`}
                        style={{ color: "var(--text-placeholder)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {monthlyComparisons.map((d, idx) => {
                    const isSelected = period === "month" && d.month === selectedMonth;
                    return (
                      <tr key={d.month}
                        onClick={() => { setPeriod("month"); setSelectedMonth(d.month); }}
                        className="cursor-pointer hover:bg-violet-50/50 transition-colors"
                        style={{ borderBottom: idx < monthlyComparisons.length - 1 ? "1px solid var(--grid-border)" : "none", backgroundColor: isSelected ? "#F5F3FF" : undefined }}
                      >
                        <td className="px-5 py-4 font-bold text-gray-900 flex items-center gap-2.5 text-[14px]">
                          {isSelected && <span className="w-2 h-2 rounded-full bg-violet-600 inline-block shrink-0" />}
                          Tháng {d.month}
                        </td>
                        <td className="px-5 py-4 text-right font-bold text-green-700">{fmtM(d.revenue)}</td>
                        <td className="px-5 py-4 text-right font-medium text-amber-700">{fmtM(d.salaryCost)}</td>
                        <td className="px-5 py-4 text-right font-medium text-red-600">{fmtM(d.importCost)}</td>
                        <td className="px-5 py-4 text-right font-bold text-red-700">{fmtM(d.totalCost)}</td>
                        <td className="px-5 py-4 text-right font-medium text-amber-600">{d.abnormal > 0 ? fmtM(d.abnormal) : "—"}</td>
                        <td className="px-5 py-4 text-right font-black text-[15px]" style={{ color: d.profit >= 0 ? "#7C3AED" : "#DC2626" }}>
                          {d.profit >= 0 ? "+" : ""}{fmtM(d.profit)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </>
  );
}
