/**
 * Component SalesDashboardHome
 * Tổng quan Dashboard cho Sales - Hiển thị KPI, Biểu đồ và Đơn hàng mới nhất
 *
 * Created Date: 06/03/2026
 */

import { useState } from "react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import {
  TrendingUp,
  Users,
  CheckCircle2,
  Package,
  ShoppingBag,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// ===================== STATIC DATA =====================
const KPIS = [
  {
    label: "Doanh thu hôm nay",
    value: "85.500.000 ₫",
    trend: "+12.5%",
    isPositive: true,
    icon: TrendingUp,
    color: "var(--brand-primary)",
  },
  {
    label: "Đơn hàng mới",
    value: "24",
    trend: "+4",
    isPositive: true,
    icon: ShoppingBag,
    color: "var(--palette-blue)",
  },
  {
    label: "Khách hàng mới",
    value: "8",
    trend: "-2",
    isPositive: false,
    icon: Users,
    color: "var(--palette-purple)",
  },
  {
    label: "Sản phẩm bán ra",
    value: "158",
    trend: "+12",
    isPositive: true,
    icon: Package,
    color: "var(--palette-teal)",
  },
];

const REVENUE_DATA = [
  { name: "T2", total: 45000000 },
  { name: "T3", total: 52000000 },
  { name: "T4", total: 38000000 },
  { name: "T5", total: 65000000 },
  { name: "T6", total: 48000000 },
  { name: "T7", total: 85000000 },
  { name: "CN", total: 92000000 },
];

const WOOD_TYPE_DATA = [
  { name: "Gỗ Óc chó", value: 45, color: "#8B5A2B" }, // Brown
  { name: "Gỗ Sồi", value: 30, color: "#D2B48C" }, // Tan
  { name: "Gỗ Gõ đỏ", value: 15, color: "#CD5C5C" }, // IndianRed
  { name: "Khác", value: 10, color: "var(--status-pending)" },
];

const RECENT_ORDERS = [
  {
    id: "DH-0001",
    customer: "Nguyễn Văn Hoàng",
    type: "Bán tại quầy",
    total: 15500000,
    status: "Hoàn thành",
    date: "15 phút trước",
  },
  {
    id: "DH-0002",
    customer: "Trần Thị Mai",
    type: "Đặt theo mẫu",
    total: 42000000,
    status: "Chờ xử lý",
    date: "1 giờ trước",
  },
  {
    id: "DH-0003",
    customer: "Phạm Thị Lan",
    type: "Đặt theo mẫu",
    total: 125000000,
    status: "Đang giao",
    date: "3 giờ trước",
  },
  {
    id: "DH-0004",
    customer: "Lê Minh Tuấn",
    type: "Bán tại quầy",
    total: 8900000,
    status: "Hoàn thành",
    date: "Hôm qua",
  },
  {
    id: "DH-0005",
    customer: "Võ Đức Anh",
    type: "Bán tại quầy",
    total: 3400000,
    status: "Hủy",
    date: "Hôm qua",
  },
];

// ===================== HELPERS =====================
const formatCurrency = (value) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)} Tr`;
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

const getStatusColor = (status) => {
  switch (status) {
    case "Hoàn thành":
      return { bg: "var(--status-focus)", text: "var(--status-success)" };
    case "Chờ xử lý":
      return { bg: "#FFF7ED", text: "var(--status-pending)" };
    case "Đang giao":
      return { bg: "#EFF6FF", text: "var(--palette-dark-blue)" };
    case "Hủy":
      return { bg: "#FEF2F2", text: "var(--status-error)" };
    default:
      return { bg: "var(--bg-main)", text: "var(--text-secondary)" };
  }
};

// ===================== COMPONENT =====================
export default function SalesDashboardHome() {
  const [timeRange, setTimeRange] = useState("7_days");

  return (
    <>
      <PageHelmet title="Tổng quan - TPF-SIMS" />

      <div
        className="flex flex-col h-[calc(100vh-64px)] -m-6 p-6 overflow-y-auto"
        style={{ backgroundColor: "var(--bg-main)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6 shrink-0">
          <div>
            <h1
              className="text-xl font-bold"
              style={{ color: "var(--text-main)" }}
            >
              Tổng quan bán hàng
            </h1>
            <p
              className="text-[13px] mt-0.5"
              style={{ color: "var(--text-placeholder)" }}
            >
              Xin chào, chúc bạn một ngày làm việc hiệu quả!
            </p>
          </div>

          <div
            className="flex p-1 rounded-xl"
            style={{
              backgroundColor: "var(--grid-header-bg)",
              border: "1px solid var(--grid-border)",
            }}
          >
            {[
              { id: "7_days", label: "7 ngày qua" },
              { id: "30_days", label: "30 ngày qua" },
              { id: "this_month", label: "Tháng này" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTimeRange(tab.id)}
                className="px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-all cursor-pointer"
                style={{
                  backgroundColor:
                    timeRange === tab.id ? "#fff" : "transparent",
                  color:
                    timeRange === tab.id
                      ? "var(--text-main)"
                      : "var(--text-secondary)",
                  boxShadow:
                    timeRange === tab.id ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 1. KPIs */}
        <div className="grid grid-cols-4 gap-4 mb-6 shrink-0">
          {KPIS.map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-5"
                style={{
                  boxShadow:
                    "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50">
                    <Icon size={20} style={{ color: kpi.color }} />
                  </div>
                  <div
                    className={`px-2 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 ${kpi.isPositive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}
                  >
                    {kpi.trend}
                  </div>
                </div>
                <p
                  className="text-[12px] font-semibold uppercase tracking-wider mb-1"
                  style={{ color: "var(--text-placeholder)" }}
                >
                  {kpi.label}
                </p>
                <h3
                  className="text-2xl font-bold"
                  style={{ color: "var(--text-main)" }}
                >
                  {kpi.value}
                </h3>
              </div>
            );
          })}
        </div>

        {/* 2. CHARTS */}
        <div className="grid grid-cols-3 gap-6 mb-6 shrink-0">
          {/* Revenue Area Chart (2/3 width) */}
          <div
            className="col-span-2 bg-white rounded-2xl p-5"
            style={{
              boxShadow:
                "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
            }}
          >
            <h3
              className="text-[15px] font-bold mb-6"
              style={{ color: "var(--text-main)" }}
            >
              Xu hướng doanh thu
            </h3>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={REVENUE_DATA}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="var(--brand-primary)"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--brand-primary)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--grid-border)"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "var(--text-placeholder)" }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "var(--text-placeholder)" }}
                    tickFormatter={formatCurrency}
                  />
                  <Tooltip
                    formatter={(value) => [
                      new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(value),
                      "Doanh thu",
                    ]}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="var(--brand-primary)"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorTotal)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Product Mix Pie Chart (1/3 width) */}
          <div
            className="bg-white rounded-2xl p-5 flex flex-col"
            style={{
              boxShadow:
                "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
            }}
          >
            <h3
              className="text-[15px] font-bold mb-2"
              style={{ color: "var(--text-main)" }}
            >
              Cơ cấu sản phẩm
            </h3>
            <p
              className="text-[12px] mb-4"
              style={{ color: "var(--text-placeholder)" }}
            >
              Phân bổ theo loại gỗ
            </p>
            <div className="flex-1 min-h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={WOOD_TYPE_DATA}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {WOOD_TYPE_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value}%`, "Tỷ trọng"]}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    formatter={(value) => (
                      <span
                        style={{
                          color: "var(--text-main)",
                          fontSize: "12px",
                          fontWeight: 500,
                        }}
                      >
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 3. RECENT ORDERS LIST */}
        <div
          className="bg-white rounded-2xl flex-1 shrink-0 mb-6"
          style={{
            boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
          }}
        >
          <div
            className="p-5 border-b flex items-center justify-between"
            style={{ borderColor: "var(--grid-border)" }}
          >
            <h3
              className="text-[15px] font-bold"
              style={{ color: "var(--text-main)" }}
            >
              Đơn hàng gần đây
            </h3>
            <button
              className="text-[13px] font-semibold"
              style={{ color: "var(--brand-primary)" }}
            >
              Xem tất cả
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead
                style={{
                  backgroundColor: "var(--grid-header-bg)",
                  borderBottom: "1px solid var(--grid-border)",
                }}
              >
                <tr>
                  {[
                    "Mã Đơn",
                    "Khách hàng",
                    "Loại đơn",
                    "Tổng tiền",
                    "Trạng thái",
                    "Thời gian",
                  ].map((h, i) => (
                    <th
                      key={i}
                      className={`px-5 py-3 text-[11px] font-bold uppercase tracking-wider ${i === 3 ? "text-right pr-6" : ""}`}
                      style={{ color: "var(--text-placeholder)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RECENT_ORDERS.map((o, idx) => {
                  const statusConfig = getStatusColor(o.status);
                  const isLast = idx === RECENT_ORDERS.length - 1;
                  return (
                    <tr
                      key={o.id}
                      className="hover:bg-gray-50/50 transition-colors"
                      style={{
                        borderBottom: isLast
                          ? "none"
                          : "1px solid var(--grid-border)",
                      }}
                    >
                      <td className="px-5 py-3.5">
                        <span
                          className="text-[13px] font-bold font-mono"
                          style={{ color: "var(--text-main)" }}
                        >
                          {o.id}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className="text-[13px] font-semibold"
                          style={{ color: "var(--text-main)" }}
                        >
                          {o.customer}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className="text-[12px]"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {o.type}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right pr-6">
                        <span
                          className="text-[13px] font-bold"
                          style={{ color: "var(--text-main)" }}
                        >
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(o.total)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className="inline-flex items-center px-2 py-1 text-[11px] font-bold rounded-md"
                          style={{
                            backgroundColor: statusConfig.bg,
                            color: statusConfig.text,
                          }}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td
                        className="px-5 py-3.5 text-[12px]"
                        style={{ color: "var(--text-placeholder)" }}
                      >
                        {o.date}
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
