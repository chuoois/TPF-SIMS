/**
 * AccountantHome – Tổng quan Tài chính
 * Doanh thu / Chi phí / Lợi nhuận / Dòng tiền / Doanh thu bất thường / Lợi nhuận cuối
 */

import { useState } from "react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import {
  TrendingUp, TrendingDown, DollarSign, ArrowDownUp,
  AlertCircle, Star, ChevronDown, ChevronRight,
  ArrowUpRight, ArrowDownRight, Minus,
} from "lucide-react";
import {
  COMPLETED_ORDERS,
  IMPORT_COSTS_BY_MONTH,
  SALARY_COSTS_BY_MONTH,
  CASH_FLOW_DEPOSITS,
  ABNORMAL_REVENUE,
} from "../mockData";

// ── Helpers ──────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat("vi-VN").format(n) + "₫";
const fmtM = (n) => {
  if (Math.abs(n) >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + " Tỷ";
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(1) + " Tr";
  return fmt(n);
};

const ALL_MONTHS = ["01/2026", "02/2026", "03/2026"];

// Tính toán theo tháng
function buildMonthData(month) {
  const revenue = COMPLETED_ORDERS
    .filter((o) => o.month === month)
    .reduce((s, o) => s + o.total_amount, 0);

  const importCost = (IMPORT_COSTS_BY_MONTH.find((m) => m.month === month) || {}).total || 0;
  const salaryCost = (SALARY_COSTS_BY_MONTH.find((m) => m.month === month) || {}).total || 0;
  const totalCost = importCost + salaryCost;
  const profit = revenue - totalCost;

  const cashIn = CASH_FLOW_DEPOSITS
    .filter((c) => c.month === month && c.amount > 0)
    .reduce((s, c) => s + c.amount, 0);
  const cashOut = CASH_FLOW_DEPOSITS
    .filter((c) => c.month === month && c.amount < 0)
    .reduce((s, c) => s + Math.abs(c.amount), 0);

  const abnormal = ABNORMAL_REVENUE
    .filter((a) => a.month === month)
    .reduce((s, a) => s + a.deposit_kept, 0);

  const finalProfit = profit + abnormal;

  return { month, revenue, importCost, salaryCost, totalCost, profit, cashIn, cashOut, abnormal, finalProfit };
}

// ── Section Card ─────────────────────────────────────────
function Section({ icon: Icon, iconColor, borderColor, title, subtitle, badge, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl overflow-hidden" style={{ border: `1px solid ${borderColor}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
      <button
        className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50/60 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: borderColor + "33" }}>
            <Icon size={18} style={{ color: iconColor }} />
          </div>
          <div>
            <p className="text-[15px] font-bold text-gray-800">{title}</p>
            {subtitle && <p className="text-[12px] text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
          {badge && (
            <span className="ml-2 text-[12px] font-black px-2.5 py-0.5 rounded-full" style={{ backgroundColor: borderColor + "22", color: iconColor }}>
              {badge}
            </span>
          )}
        </div>
        {open ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
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
        <div key={k.label}>
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">{k.label}</p>
          <p className="text-[18px] font-black leading-tight" style={{ color: k.color }}>{k.value}</p>
          {k.sub && <p className="text-[11px] text-gray-400 mt-0.5">{k.sub}</p>}
        </div>
      ))}
    </div>
  );
}

// ── Mini table ───────────────────────────────────────────
function MiniTable({ heads, rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead>
          <tr style={{ backgroundColor: "var(--grid-header-bg)", borderBottom: "1px solid var(--grid-border)" }}>
            {heads.map((h, i) => (
              <th key={i} className={`px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider ${h.right ? "text-right" : "text-left"}`}
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
    <div className="flex items-center justify-between py-3 px-5" style={{ borderBottom: "1px solid var(--grid-border)" }}>
      <span className="flex items-center gap-2 text-[13px] font-semibold text-gray-600">
        <Icon size={14} style={{ color }} />
        {label}
      </span>
      <span className="text-[15px] font-black" style={{ color }}>{fmtM(value)}</span>
    </div>
  );
}

// ── DEPOSIT TYPE badge ────────────────────────────────────
const DEPOSIT_META = {
  IMPORT_DEPOSIT:   { label: "Cọc nhập hàng", bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  CUSTOMER_DEPOSIT: { label: "Cọc khách mua", bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
  REFUND_DEPOSIT:   { label: "Hoàn cọc KH",   bg: "#FEF2F2", text: "#DC2626", border: "#FECACA" },
};

// ══════════════════════════════════════════════════════════
export default function AccountantHome() {
  const [selectedMonth, setSelectedMonth] = useState("03/2026");

  const md = buildMonthData(selectedMonth);
  const monthOrders = COMPLETED_ORDERS.filter((o) => o.month === selectedMonth);
  const monthCashFlows = CASH_FLOW_DEPOSITS.filter((c) => c.month === selectedMonth);
  const monthAbnormal = ABNORMAL_REVENUE.filter((a) => a.month === selectedMonth);

  // Summary cards top
  const summaryCards = [
    { label: "Doanh thu", value: fmtM(md.revenue), color: "#15803D", bg: "#F0FDF4", border: "#BBF7D0", icon: TrendingUp },
    { label: "Chi phí",   value: fmtM(md.totalCost), color: "#DC2626", bg: "#FEF2F2", border: "#FECACA", icon: TrendingDown },
    { label: "Lợi nhuận", value: fmtM(md.profit),    color: md.profit >= 0 ? "#1D4ED8" : "#DC2626", bg: "#EFF6FF", border: "#BFDBFE", icon: DollarSign },
    { label: "Lợi nhuận cuối", value: fmtM(md.finalProfit), color: md.finalProfit >= 0 ? "#7C3AED" : "#DC2626", bg: "#F5F3FF", border: "#DDD6FE", icon: Star },
  ];

  return (
    <>
      <PageHelmet title="Tổng quan tài chính - TPF-SIMS" />
      <div className="flex flex-col -m-6 p-6 gap-6 overflow-y-auto" style={{ backgroundColor: "var(--bg-main)", minHeight: "calc(100vh - 64px)" }}>

        {/* Header */}
        <div className="flex items-start justify-between shrink-0">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Tổng quan tài chính</h1>
            <p className="text-[13px] text-gray-400 mt-0.5">Doanh thu · Chi phí · Lợi nhuận · Dòng tiền · Doanh thu bất thường</p>
          </div>
          {/* Month selector */}
          <div className="flex items-center gap-2 bg-white border rounded-xl px-3 py-2 shadow-sm" style={{ borderColor: "var(--grid-border)" }}>
            <span className="text-[12px] font-semibold text-gray-500">Tháng:</span>
            <div className="flex gap-1">
              {ALL_MONTHS.map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedMonth(m)}
                  className="px-3 py-1 rounded-lg text-[12px] font-bold transition-colors"
                  style={selectedMonth === m
                    ? { backgroundColor: "#1D4ED8", color: "#fff" }
                    : { backgroundColor: "#F3F4F6", color: "#6B7280" }}
                >{m}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Top KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
          {summaryCards.map(({ label, value, color, bg, border, icon: Icon }) => (
            <div key={label} className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm" style={{ border: `1px solid ${border}` }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: bg }}>
                <Icon size={18} style={{ color }} />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">{label}</p>
                <p className="text-[17px] font-black leading-tight" style={{ color }}>{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── 1. DOANH THU ─────────────────────────────── */}
        <Section
          icon={TrendingUp} iconColor="#15803D" borderColor="#BBF7D0"
          title="Doanh thu (Đầu vào)"
          subtitle="Ghi nhận từ các đơn hàng đã hoàn thành"
          badge={`${monthOrders.length} đơn`}
        >
          <KpiRow items={[
            { label: "Số đơn hoàn thành", value: monthOrders.length, color: "#374151", sub: `Tháng ${selectedMonth}` },
            { label: "Tổng doanh thu",    value: fmtM(md.revenue),   color: "#15803D", sub: "Tính từ tổng giá trị đơn" },
          ]} />
          <MiniTable
            heads={[{ label: "Mã đơn" }, { label: "Khách hàng" }, { label: "Ngày HT" }, { label: "Giá trị", right: true }]}
            rows={monthOrders.map((o) => (
              <>
                <td className="px-4 py-2.5"><span className="font-mono text-[11px] font-bold bg-gray-100 text-gray-600 border border-gray-200 px-1.5 py-0.5 rounded">{o.code}</span></td>
                <td className="px-4 py-2.5 font-semibold text-gray-800">{o.customer}</td>
                <td className="px-4 py-2.5 text-gray-500 text-[12px]">{o.date}</td>
                <td className="px-4 py-2.5 text-right font-black text-green-700">{fmtM(o.total_amount)}</td>
              </>
            ))}
          />
          <div className="flex justify-end px-5 py-3 bg-green-50/60">
            <span className="text-[12px] font-bold text-green-700 uppercase tracking-wider mr-4">Tổng doanh thu</span>
            <span className="text-[15px] font-black text-green-700">{fmt(md.revenue)}</span>
          </div>
        </Section>

        {/* ── 2. CHI PHÍ ───────────────────────────────── */}
        <Section
          icon={TrendingDown} iconColor="#DC2626" borderColor="#FECACA"
          title="Chi phí (Đầu ra)"
          subtitle="Lương nhân viên + Chi phí nhập hàng"
          badge={fmtM(md.totalCost)}
        >
          <KpiRow items={[
            { label: "Lương nhân viên",  value: fmtM(md.salaryCost),  color: "#D97706", sub: "Chi trả kỳ này" },
            { label: "Chi phí nhập hàng", value: fmtM(md.importCost), color: "#DC2626", sub: "Tổng phiếu nhập" },
            { label: "Tổng chi phí",     value: fmtM(md.totalCost),   color: "#7F1D1D", sub: "Lương + Nhập hàng" },
          ]} />
          <div style={{ borderTop: "1px solid #FECACA" }}>
            {[
              { label: "Chi phí lương nhân viên", value: md.salaryCost, color: "#D97706" },
              { label: "Chi phí nhập hàng sản phẩm", value: md.importCost, color: "#DC2626" },
            ].map((r) => (
              <div key={r.label} className="flex items-center justify-between px-5 py-3" style={{ borderBottom: "1px solid #FEE2E2" }}>
                <span className="text-[13px] text-gray-600 font-medium">{r.label}</span>
                <span className="text-[14px] font-black" style={{ color: r.color }}>{fmt(r.value)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between px-5 py-3 bg-red-50/60">
              <span className="text-[13px] font-black uppercase tracking-wider text-red-700">Tổng chi phí</span>
              <span className="text-[16px] font-black text-red-700">{fmt(md.totalCost)}</span>
            </div>
          </div>
        </Section>

        {/* ── 3. LỢI NHUẬN ─────────────────────────────── */}
        <Section
          icon={DollarSign} iconColor="#1D4ED8" borderColor="#BFDBFE"
          title={`Lợi nhuận – Tháng ${selectedMonth}`}
          subtitle="Doanh thu – Chi phí"
        >
          <div style={{ padding: "0" }}>
            <ProfitBar label="Doanh thu" value={md.revenue} color="#15803D" icon={ArrowUpRight} />
            <ProfitBar label="Chi phí"   value={-md.totalCost} color="#DC2626" icon={ArrowDownRight} />
            <div className="flex items-center justify-between py-4 px-5 bg-blue-50/60">
              <span className="flex items-center gap-2 text-[14px] font-black text-blue-800 uppercase tracking-wide">
                <Minus size={14} />Lợi nhuận tháng
              </span>
              <span className="text-[20px] font-black" style={{ color: md.profit >= 0 ? "#1D4ED8" : "#DC2626" }}>
                {md.profit >= 0 ? "+" : ""}{fmtM(md.profit)}
              </span>
            </div>
          </div>
        </Section>

        {/* ── 4. DÒNG TIỀN ─────────────────────────────── */}
        <Section
          icon={ArrowDownUp} iconColor="#7C3AED" borderColor="#DDD6FE"
          title="Dòng tiền"
          subtitle="Tiền đặt cọc nhập hàng, cọc khách mua và hoàn trả cọc"
          badge={`${monthCashFlows.length} giao dịch`}
        >
          <KpiRow items={[
            { label: "Tiền cọc vào",  value: fmtM(md.cashIn),  color: "#15803D", sub: "Cọc nhập hàng + cọc KH" },
            { label: "Hoàn trả cọc", value: fmtM(md.cashOut), color: "#DC2626", sub: "Hoàn cọc cho khách" },
            { label: "Dòng tiền ròng", value: fmtM(md.cashIn - md.cashOut), color: "#7C3AED", sub: "Vào – Hoàn trả" },
          ]} />
          <MiniTable
            heads={[
              { label: "Ngày" }, { label: "Loại" }, { label: "Nội dung" }, { label: "Số tiền", right: true },
            ]}
            rows={monthCashFlows.map((c) => {
              const meta = DEPOSIT_META[c.type];
              return (
                <>
                  <td className="px-4 py-2.5 text-[12px] text-gray-500">{c.date}</td>
                  <td className="px-4 py-2.5">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: meta.bg, color: meta.text, border: `1px solid ${meta.border}` }}>
                      {meta.label}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-gray-700 text-[13px]">{c.label}</td>
                  <td className="px-4 py-2.5 text-right font-black" style={{ color: c.amount >= 0 ? "#15803D" : "#DC2626" }}>
                    {c.amount >= 0 ? "+" : ""}{fmtM(c.amount)}
                  </td>
                </>
              );
            })}
          />
        </Section>

        {/* ── 5. DOANH THU BẤT THƯỜNG ──────────────────── */}
        <Section
          icon={AlertCircle} iconColor="#D97706" borderColor="#FDE68A"
          title="Doanh thu bất thường"
          subtitle="Thu cọc từ đơn bị hủy do lỗi phía khách hàng"
          badge={monthAbnormal.length > 0 ? `${monthAbnormal.length} trường hợp` : "Không có"}
          defaultOpen={monthAbnormal.length > 0}
        >
          {monthAbnormal.length === 0 ? (
            <div className="px-5 py-6 text-center text-[13px] text-gray-400">Không có doanh thu bất thường trong tháng {selectedMonth}</div>
          ) : (
            <>
              <MiniTable
                heads={[
                  { label: "Mã đơn hủy" }, { label: "Khách hàng" }, { label: "Ngày" }, { label: "Lý do" }, { label: "Tiền cọc thu", right: true },
                ]}
                rows={monthAbnormal.map((a) => (
                  <>
                    <td className="px-4 py-2.5"><span className="font-mono text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded">{a.order_code}</span></td>
                    <td className="px-4 py-2.5 font-semibold text-gray-800">{a.customer}</td>
                    <td className="px-4 py-2.5 text-[12px] text-gray-500">{a.date}</td>
                    <td className="px-4 py-2.5 text-[12px] text-gray-500 max-w-[240px]">{a.reason}</td>
                    <td className="px-4 py-2.5 text-right font-black text-amber-600">{fmtM(a.deposit_kept)}</td>
                  </>
                ))}
              />
              <div className="flex justify-end px-5 py-3 bg-amber-50/60">
                <span className="text-[12px] font-bold text-amber-700 uppercase tracking-wider mr-4">Tổng doanh thu bất thường</span>
                <span className="text-[15px] font-black text-amber-700">{fmt(md.abnormal)}</span>
              </div>
            </>
          )}
        </Section>

        {/* ── 6. LỢI NHUẬN CUỐI ────────────────────────── */}
        <Section
          icon={Star} iconColor="#7C3AED" borderColor="#DDD6FE"
          title="Lợi nhuận cuối cùng"
          subtitle="Lợi nhuận + Doanh thu bất thường"
        >
          <div>
            <ProfitBar label="Lợi nhuận tháng" value={md.profit} color={md.profit >= 0 ? "#1D4ED8" : "#DC2626"} icon={DollarSign} />
            <ProfitBar label="Doanh thu bất thường" value={md.abnormal} color="#D97706" icon={AlertCircle} />
            <div className="flex items-center justify-between py-5 px-5 bg-violet-50/80">
              <div>
                <p className="text-[12px] font-bold uppercase tracking-wider text-violet-500 mb-0.5">Lợi nhuận cuối cùng</p>
                <p className="text-[12px] text-gray-400">= Lợi nhuận + Doanh thu bất thường</p>
              </div>
              <span className="text-[26px] font-black" style={{ color: md.finalProfit >= 0 ? "#7C3AED" : "#DC2626" }}>
                {md.finalProfit >= 0 ? "+" : ""}{fmtM(md.finalProfit)}
              </span>
            </div>
          </div>
        </Section>

        {/* All-months summary table */}
        <div className="bg-white rounded-2xl overflow-hidden shrink-0" style={{ border: "1px solid var(--grid-border)", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: "var(--grid-border)" }}>
            <p className="text-[15px] font-bold text-gray-800">So sánh các tháng</p>
            <p className="text-[12px] text-gray-400 mt-0.5">Tổng hợp doanh thu, chi phí và lợi nhuận</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr style={{ backgroundColor: "var(--grid-header-bg)", borderBottom: "1px solid var(--grid-border)" }}>
                  {["Tháng","Doanh thu","Chi phí lương","Chi phí nhập","Tổng chi phí","Lợi nhuận","DT bất thường","Lợi nhuận cuối"].map((h, i) => (
                    <th key={i} className={`px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider ${i === 0 ? "text-left" : "text-right"}`}
                      style={{ color: "var(--text-placeholder)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ALL_MONTHS.map((m) => {
                  const d = buildMonthData(m);
                  const isSelected = m === selectedMonth;
                  return (
                    <tr key={m}
                      onClick={() => setSelectedMonth(m)}
                      className="cursor-pointer hover:bg-violet-50/40 transition-colors"
                      style={{ borderBottom: "1px solid var(--grid-border)", backgroundColor: isSelected ? "#F5F3FF" : undefined }}
                    >
                      <td className="px-4 py-3 font-bold text-gray-800">{m}</td>
                      <td className="px-4 py-3 text-right font-semibold text-green-700">{fmtM(d.revenue)}</td>
                      <td className="px-4 py-3 text-right text-amber-600">{fmtM(d.salaryCost)}</td>
                      <td className="px-4 py-3 text-right text-red-600">{fmtM(d.importCost)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-red-700">{fmtM(d.totalCost)}</td>
                      <td className="px-4 py-3 text-right font-bold" style={{ color: d.profit >= 0 ? "#1D4ED8" : "#DC2626" }}>
                        {d.profit >= 0 ? "+" : ""}{fmtM(d.profit)}
                      </td>
                      <td className="px-4 py-3 text-right text-amber-600">{d.abnormal > 0 ? fmtM(d.abnormal) : "—"}</td>
                      <td className="px-4 py-3 text-right font-black" style={{ color: d.finalProfit >= 0 ? "#7C3AED" : "#DC2626" }}>
                        {d.finalProfit >= 0 ? "+" : ""}{fmtM(d.finalProfit)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </>
  );
}
