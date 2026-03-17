/**
 * Component SalesDashboardHome
 * Tổng quan Dashboard cho Sales - Hiển thị KPI, Biểu đồ và Đơn hàng mới nhất
 *
 * Created Date: 06/03/2026
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { PageHelmet } from "@/components/seo/PageHelmet";
import { TrendingUp, Users, Package, ShoppingBag, ChevronRight, Truck, Wallet, AlertCircle, CheckCircle2, Clock, Hammer, Paintbrush, BadgeDollarSign } from "lucide-react";
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
const MOCK_DATA = {
  today: {
    kpis: [
      {
        label: "Doanh thu",
        value: "85.500.000 ₫",
        trend: "+12.5%",
        isPositive: true,
        icon: TrendingUp,
        color: "var(--brand-primary)",
      },
      {
        label: "Đơn hàng",
        value: "24",
        trend: "+4",
        isPositive: true,
        icon: ShoppingBag,
        color: "var(--palette-blue)",
      },
      {
        label: "Khách mới",
        value: "8",
        trend: "-2",
        isPositive: false,
        icon: Users,
        color: "var(--palette-purple)",
      },
      {
        label: "SP bán ra",
        value: "158",
        trend: "+12",
        isPositive: true,
        icon: Package,
        color: "var(--palette-teal)",
      },
    ],
    revenueData: [
      { name: "08:00", total: 12000000 },
      { name: "10:00", total: 25000000 },
      { name: "12:00", total: 18000000 },
      { name: "14:00", total: 45000000 },
      { name: "16:00", total: 85500000 },
    ],
    orderStatusData: [
      { name: "Hoàn thành", value: 65, color: "var(--status-success)" },
      { name: "Đang giao", value: 20, color: "var(--palette-dark-blue)" },
      { name: "Chờ xử lý", value: 10, color: "var(--status-pending)" },
      { name: "Hủy", value: 5, color: "var(--status-error)" },
    ],
    recentOrders: [
      {
        id: "DH-0001",
        customer: "Nguyễn Văn Hoàng",
        type: "Hàng có sẵn",
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
    ],
  },
  yesterday: {
    kpis: [
      {
        label: "Doanh thu",
        value: "72.000.000 ₫",
        trend: "-5.2%",
        isPositive: false,
        icon: TrendingUp,
        color: "var(--brand-primary)",
      },
      {
        label: "Đơn hàng",
        value: "20",
        trend: "-1",
        isPositive: false,
        icon: ShoppingBag,
        color: "var(--palette-blue)",
      },
      {
        label: "Khách mới",
        value: "10",
        trend: "+3",
        isPositive: true,
        icon: Users,
        color: "var(--palette-purple)",
      },
      {
        label: "SP bán ra",
        value: "140",
        trend: "-8",
        isPositive: false,
        icon: Package,
        color: "var(--palette-teal)",
      },
    ],
    revenueData: [
      { name: "08:00", total: 8000000 },
      { name: "10:00", total: 20000000 },
      { name: "12:00", total: 35000000 },
      { name: "14:00", total: 50000000 },
      { name: "16:00", total: 72000000 },
    ],
    orderStatusData: [
      { name: "Hoàn thành", value: 60, color: "var(--status-success)" },
      { name: "Đang giao", value: 15, color: "var(--palette-dark-blue)" },
      { name: "Chờ xử lý", value: 15, color: "var(--status-pending)" },
      { name: "Hủy", value: 10, color: "var(--status-error)" },
    ],
    recentOrders: [
      {
        id: "DH-Y001",
        customer: "Lê Minh Tuấn",
        type: "Hàng có sẵn",
        total: 8900000,
        status: "Hoàn thành",
        date: "10:30",
      },
      {
        id: "DH-Y002",
        customer: "Võ Đức Anh",
        type: "Hàng có sẵn",
        total: 3400000,
        status: "Hủy",
        date: "14:20",
      },
    ],
  },
  "7_days": {
    kpis: [
      {
        label: "Doanh thu",
        value: "417.000.000 ₫",
        trend: "+15.8%",
        isPositive: true,
        icon: TrendingUp,
        color: "var(--brand-primary)",
      },
      {
        label: "Đơn hàng",
        value: "145",
        trend: "+20",
        isPositive: true,
        icon: ShoppingBag,
        color: "var(--palette-blue)",
      },
      {
        label: "Khách mới",
        value: "45",
        trend: "+12",
        isPositive: true,
        icon: Users,
        color: "var(--palette-purple)",
      },
      {
        label: "SP bán ra",
        value: "920",
        trend: "+85",
        isPositive: true,
        icon: Package,
        color: "var(--palette-teal)",
      },
    ],
    revenueData: [
      { name: "T2", total: 45000000 },
      { name: "T3", total: 52000000 },
      { name: "T4", total: 38000000 },
      { name: "T5", total: 65000000 },
      { name: "T6", total: 40000000 },
      { name: "T7", total: 85000000 },
      { name: "CN", total: 92000000 },
    ],
    orderStatusData: [
      { name: "Hoàn thành", value: 70, color: "var(--status-success)" },
      { name: "Đang giao", value: 15, color: "var(--palette-dark-blue)" },
      { name: "Chờ xử lý", value: 10, color: "var(--status-pending)" },
      { name: "Hủy", value: 5, color: "var(--status-error)" },
    ],
    recentOrders: [
      {
        id: "DH-0001",
        customer: "Nguyễn Văn Hoàng",
        type: "Hàng có sẵn",
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
        type: "Hàng có sẵn",
        total: 8900000,
        status: "Hoàn thành",
        date: "Hôm qua",
      },
      {
        id: "DH-0005",
        customer: "Võ Đức Anh",
        type: "Hàng có sẵn",
        total: 3400000,
        status: "Hủy",
        date: "Hôm qua",
      },
    ],
  },
  this_month: {
    kpis: [
      {
        label: "Doanh thu",
        value: "1.250.000.000 ₫",
        trend: "+25.4%",
        isPositive: true,
        icon: TrendingUp,
        color: "var(--brand-primary)",
      },
      {
        label: "Đơn hàng",
        value: "620",
        trend: "+115",
        isPositive: true,
        icon: ShoppingBag,
        color: "var(--palette-blue)",
      },
      {
        label: "Khách mới",
        value: "185",
        trend: "+45",
        isPositive: true,
        icon: Users,
        color: "var(--palette-purple)",
      },
      {
        label: "SP bán ra",
        value: "3.850",
        trend: "+420",
        isPositive: true,
        icon: Package,
        color: "var(--palette-teal)",
      },
    ],
    revenueData: [
      { name: "Tuần 1", total: 250000000 },
      { name: "Tuần 2", total: 320000000 },
      { name: "Tuần 3", total: 410000000 },
      { name: "Tuần 4", total: 270000000 },
    ],
    orderStatusData: [
      { name: "Hoàn thành", value: 75, color: "var(--status-success)" },
      { name: "Đang giao", value: 15, color: "var(--palette-dark-blue)" },
      { name: "Chờ xử lý", value: 7, color: "var(--status-pending)" },
      { name: "Hủy", value: 3, color: "var(--status-error)" },
    ],
    recentOrders: [
      {
        id: "DH-M001",
        customer: "Hoàng Nguyệt Ánh",
        type: "Đặt theo mẫu",
        total: 56000000,
        status: "Hoàn thành",
        date: "01/03/2026",
      },
      {
        id: "DH-M002",
        customer: "Bùi Tuấn Anh",
        type: "Hàng có sẵn",
        total: 21000000,
        status: "Đang giao",
        date: "02/03/2026",
      },
      {
        id: "DH-0002",
        customer: "Trần Thị Mai",
        type: "Đặt theo mẫu",
        total: 42000000,
        status: "Chờ xử lý",
        date: "05/03/2026",
      },
      {
        id: "DH-0001",
        customer: "Nguyễn Văn Hoàng",
        type: "Hàng có sẵn",
        total: 15500000,
        status: "Hoàn thành",
        date: "06/03/2026",
      },
    ],
  },
  last_month: {
    kpis: [
      {
        label: "Doanh thu",
        value: "980.000.000 ₫",
        trend: "-10.5%",
        isPositive: false,
        icon: TrendingUp,
        color: "var(--brand-primary)",
      },
      {
        label: "Đơn hàng",
        value: "480",
        trend: "-50",
        isPositive: false,
        icon: ShoppingBag,
        color: "var(--palette-blue)",
      },
      {
        label: "Khách mới",
        value: "140",
        trend: "-15",
        isPositive: false,
        icon: Users,
        color: "var(--palette-purple)",
      },
      {
        label: "SP bán ra",
        value: "2.950",
        trend: "-120",
        isPositive: false,
        icon: Package,
        color: "var(--palette-teal)",
      },
    ],
    revenueData: [
      { name: "Tuần 1", total: 150000000 },
      { name: "Tuần 2", total: 220000000 },
      { name: "Tuần 3", total: 280000000 },
      { name: "Tuần 4", total: 330000000 },
    ],
    orderStatusData: [
      { name: "Hoàn thành", value: 68, color: "var(--status-success)" },
      { name: "Đang giao", value: 18, color: "var(--palette-dark-blue)" },
      { name: "Chờ xử lý", value: 10, color: "var(--status-pending)" },
      { name: "Hủy", value: 4, color: "var(--status-error)" },
    ],
    recentOrders: [
      {
        id: "DH-L001",
        customer: "Đặng Thùy Linh",
        type: "Đặt theo mẫu",
        total: 85000000,
        status: "Hoàn thành",
        date: "28/02/2026",
      },
      {
        id: "DH-L002",
        customer: "Vũ Phương Thảo",
        type: "Đặt theo mẫu",
        total: 95000000,
        status: "Hủy",
        date: "25/02/2026",
      },
    ],
  },
};

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

  // Get current active data
  const data = MOCK_DATA[timeRange];

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
              { id: "today", label: "Hôm nay" },
              { id: "yesterday", label: "Hôm qua" },
              { id: "7_days", label: "7 ngày qua" },
              { id: "this_month", label: "Tháng này" },
              { id: "last_month", label: "Tháng trước" },
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
          {data.kpis.map((kpi, idx) => {
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
                  data={data.revenueData}
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
              Đơn hàng theo trạng thái
            </h3>
            <p
              className="text-[12px] mb-4"
              style={{ color: "var(--text-placeholder)" }}
            >
              Tỷ lệ theo số lượng đơn
            </p>
            <div className="flex-1 min-h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.orderStatusData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {data.orderStatusData.map((entry, index) => (
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
                {data.recentOrders.map((o, idx) => {
                  const statusConfig = getStatusColor(o.status);
                  const isLast = idx === data.recentOrders.length - 1;
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

        {/* ─────────────────────────────────────────
          4.  CÔNG NỢ KHÁCH HÀNG
        ───────────────────────────────────────── */}

        <div
          className="bg-white rounded-2xl shrink-0 mb-6"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)" }}
        >
          {/* Header */}
          <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: "var(--grid-border)" }}>
            <h3 className="text-[15px] font-bold flex items-center gap-2" style={{ color: "var(--text-main)" }}>
              <Users size={18} className="text-blue-500" />
              Công nợ khách hàng
            </h3>
            <Link to="/accountant/customer-debt" className="flex items-center gap-1 text-[13px] font-semibold" style={{ color: "var(--brand-primary)" }}>
              Xem tất cả <ChevronRight size={14} />
            </Link>
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-3 gap-4 p-5 border-b" style={{ borderColor: "var(--grid-border)" }}>
            {[
              { label: "Tổng đơn hàng", value: "5", color: "text-gray-800", sub: "nợ + đã tất toán" },
              { label: "Còn nợ", value: "4 đơn", color: "text-amber-600", sub: new Intl.NumberFormat("vi-VN").format(53700000) + "₫" },
              { label: "Đã tất toán", value: "1 đơn", color: "text-green-600", sub: "Toàn bộ số tiền đã thu" },
            ].map(kpi => (
              <div key={kpi.label} className="flex flex-col gap-0.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">{kpi.label}</p>
                <p className={`text-xl font-black ${kpi.color}`}>{kpi.value}</p>
                <p className="text-[11px] text-gray-400 font-medium">{kpi.sub}</p>
              </div>
            ))}
          </div>

          {/* Mini table: top 3 debt orders */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead style={{ backgroundColor: "var(--grid-header-bg)", borderBottom: "1px solid var(--grid-border)" }}>
                <tr>
                  {["Mã đơn", "Khách hàng", "Tổng tiền", "Đã thu", "Còn nợ", "Ngày đặt"].map((h, i) => (
                    <th key={i} className={`px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider ${i >= 2 && i <= 4 ? "text-right" : ""}`} style={{ color: "var(--text-placeholder)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { code: "HD260314A1B2C3", customer: "Nguyễn Văn A", total: 15500000, paid: 5000000, date: "10/03/2026" },
                  { code: "HD260312X7Y8Z9", customer: "Lê Minh C",    total: 25000000, paid: 10000000, date: "05/03/2026" },
                  { code: "HD260313D4E5F6", customer: "Trần Thị B",   total: 8200000,  paid: 3000000, date: "12/03/2026" },
                ].map((row, idx) => {
                  const remaining = row.total - row.paid;
                  return (
                    <tr key={idx} className="hover:bg-gray-50/60 transition-colors" style={{ borderBottom: "1px solid var(--grid-border)" }}>
                      <td className="px-4 py-2.5"><span className="font-mono text-[11px] font-bold bg-gray-100 text-gray-600 border border-gray-200 px-1.5 py-0.5 rounded">{row.code}</span></td>
                      <td className="px-4 py-2.5 font-semibold text-gray-800">{row.customer}</td>
                      <td className="px-4 py-2.5 text-right text-gray-600">{new Intl.NumberFormat("vi-VN").format(row.total)}₫</td>
                      <td className="px-4 py-2.5 text-right text-gray-500">{new Intl.NumberFormat("vi-VN").format(row.paid)}₫</td>
                      <td className="px-4 py-2.5 text-right font-bold text-amber-600">{new Intl.NumberFormat("vi-VN").format(remaining)}₫</td>
                      <td className="px-4 py-2.5 text-gray-400 text-[12px]">{row.date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ─────────────────────────────────────────
          5.  CÔNG NỢ THU MUA (nhà cung cấp)
        ───────────────────────────────────────── */}
        <div
          className="bg-white rounded-2xl shrink-0 mb-6"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)" }}
        >
          <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: "var(--grid-border)" }}>
            <h3 className="text-[15px] font-bold flex items-center gap-2" style={{ color: "var(--text-main)" }}>
              <Truck size={18} className="text-green-600" />
              Công nợ thu mua
            </h3>
            <Link to="/accountant/supplier-debt" className="flex items-center gap-1 text-[13px] font-semibold" style={{ color: "var(--brand-primary)" }}>
              Xem tất cả <ChevronRight size={14} />
            </Link>
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-3 gap-4 p-5 border-b" style={{ borderColor: "var(--grid-border)" }}>
            {[
              { label: "Nhà cung cấp", value: "4", color: "text-gray-800", sub: "đang theo dõi" },
              { label: "Đang có nợ", value: "3 NCC", color: "text-red-600", sub: new Intl.NumberFormat("vi-VN").format(550000000) + "₫" },
              { label: "Đã tất toán", value: "1 NCC", color: "text-green-600", sub: "Tổng kho gỗ Nam Hải" },
            ].map(kpi => (
              <div key={kpi.label} className="flex flex-col gap-0.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">{kpi.label}</p>
                <p className={`text-xl font-black ${kpi.color}`}>{kpi.value}</p>
                <p className="text-[11px] text-gray-400 font-medium">{kpi.sub}</p>
              </div>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead style={{ backgroundColor: "var(--grid-header-bg)", borderBottom: "1px solid var(--grid-border)" }}>
                <tr>
                  {["Mã NCC", "Nhà cung cấp", "Tổng nhập hàng", "Đã thanh toán", "Còn nợ"].map((h, i) => (
                    <th key={i} className={`px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider ${i >= 2 ? "text-right" : ""}`} style={{ color: "var(--text-placeholder)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { code: "NCC-TAM",  name: "Xưởng gỗ mỹ nghệ Thành Tâm",    totalImport: 1250000000, debt: 350000000 },
                  { code: "NCC-PHAT", name: "Xưởng mộc nội thất Gia Phát",    totalImport: 890000000,  debt: 120000000 },
                  { code: "NCC-MINH", name: "Cơ sở sản xuất gỗ Minh Long",    totalImport: 620000000,  debt: 80000000 },
                  { code: "NCC-HAI",  name: "Tổng kho gỗ nguyên liệu Nam Hải", totalImport: 4500000000, debt: 0 },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/60 transition-colors" style={{ borderBottom: "1px solid var(--grid-border)" }}>
                    <td className="px-4 py-2.5"><span className="font-mono text-[11px] font-bold bg-gray-100 text-gray-600 border border-gray-200 px-1.5 py-0.5 rounded">{row.code}</span></td>
                    <td className="px-4 py-2.5 font-semibold text-gray-800">{row.name}</td>
                    <td className="px-4 py-2.5 text-right text-gray-600">{new Intl.NumberFormat("vi-VN").format(row.totalImport)}₫</td>
                    <td className="px-4 py-2.5 text-right text-green-600 font-semibold">{new Intl.NumberFormat("vi-VN").format(row.totalImport - row.debt)}₫</td>
                    <td className="px-4 py-2.5 text-right">
                      {row.debt > 0
                        ? <span className="font-black text-red-600">{new Intl.NumberFormat("vi-VN").format(row.debt)}₫</span>
                        : <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Đã tất toán</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ─────────────────────────────────────────
          6.  LƯƠNG NHÂN VIÊN
        ───────────────────────────────────────── */}
        <div
          className="bg-white rounded-2xl shrink-0 mb-6"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)" }}
        >
          <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: "var(--grid-border)" }}>
            <h3 className="text-[15px] font-bold flex items-center gap-2" style={{ color: "var(--text-main)" }}>
              <Wallet size={18} className="text-amber-500" />
              Lương nhân viên – Tháng 03/2026
            </h3>
            <Link to="/accountant/employee-salary" className="flex items-center gap-1 text-[13px] font-semibold" style={{ color: "var(--brand-primary)" }}>
              Xem tất cả <ChevronRight size={14} />
            </Link>
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-4 gap-4 p-5 border-b" style={{ borderColor: "var(--grid-border)" }}>
            {[
              { label: "Tổng nhân viên", value: "6",  color: "text-gray-800", sub: "3 loại bộ phận" },
              { label: "Chưa thanh toán", value: "4 NV", color: "text-red-600", sub: "Cần chi trả kỳ này" },
              { label: "Đã thanh toán", value: "2 NV", color: "text-green-600", sub: "NV002, NV006" },
              { label: "Tổng quỹ lương", value: new Intl.NumberFormat("vi-VN").format(11000000 + 8500000 + 8800000 + 10200000 + 18000000 + 17500000) + "₫", color: "text-amber-600", sub: "Tháng 03/2026" },
            ].map(kpi => (
              <div key={kpi.label} className="flex flex-col gap-0.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">{kpi.label}</p>
                <p className={`text-[17px] font-black leading-tight ${kpi.color}`}>{kpi.value}</p>
                <p className="text-[11px] text-gray-400 font-medium">{kpi.sub}</p>
              </div>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead style={{ backgroundColor: "var(--grid-header-bg)", borderBottom: "1px solid var(--grid-border)" }}>
                <tr>
                  {["Mã NV", "Họ tên", "Bộ phận", "Cách tính", "Tổng lương", "Trạng thái"].map((h, i) => (
                    <th key={i} className={`px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider ${i === 4 ? "text-right" : i === 5 ? "text-center" : ""}`} style={{ color: "var(--text-placeholder)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { id: "NV001", name: "Nguyễn Thị Mai", role: "Nhân viên bán hàng", type: "SALES",   calc: "Lương tháng cố định",    total: 11000000, status: "Chưa thanh toán" },
                  { id: "NV002", name: "Trần Văn Khoa",  role: "Nhân viên bán hàng", type: "SALES",   calc: "Lương tháng cố định",    total: 8500000,  status: "Đã thanh toán" },
                  { id: "NV003", name: "Lê Đình Chinh",  role: "Nhân viên giấy ráp", type: "SANDER",  calc: "400.000₫ × 22 ngày",     total: 8800000,  status: "Chưa thanh toán" },
                  { id: "NV004", name: "Phạm Xuân Đạt",  role: "Nhân viên giấy ráp", type: "SANDER",  calc: "400.000₫ × 25 ngày",     total: 10200000, status: "Chưa thanh toán" },
                  { id: "NV005", name: "Đỗ Hữu Hùng",   role: "Thợ sơn",            type: "PAINTER", calc: "150.000₫ × 120 SP",      total: 18000000, status: "Chưa thanh toán" },
                  { id: "NV006", name: "Vũ Tấn Tài",    role: "Thợ sơn",            type: "PAINTER", calc: "200.000₫ × 85 SP",       total: 17500000, status: "Đã thanh toán" },
                ].map((emp, idx) => {
                  const isPaid = emp.status === "Đã thanh toán";
                  const RoleIcon = emp.type === "SALES" ? Users : emp.type === "SANDER" ? Hammer : Paintbrush;
                  const roleColor = emp.type === "SALES" ? "text-blue-600" : emp.type === "SANDER" ? "text-amber-600" : "text-green-600";
                  return (
                    <tr key={idx} className="hover:bg-gray-50/60 transition-colors" style={{ borderBottom: "1px solid var(--grid-border)" }}>
                      <td className="px-4 py-2.5"><span className="font-mono text-[11px] font-bold bg-gray-100 text-gray-600 border border-gray-200 px-1.5 py-0.5 rounded">{emp.id}</span></td>
                      <td className="px-4 py-2.5 font-semibold text-gray-800">{emp.name}</td>
                      <td className="px-4 py-2.5">
                        <span className={`flex items-center gap-1 text-[12px] font-medium ${roleColor}`}>
                          <RoleIcon size={13} />{emp.role}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-[12px] text-gray-500">{emp.calc}</td>
                      <td className="px-4 py-2.5 text-right font-black text-amber-600">{new Intl.NumberFormat("vi-VN").format(emp.total)}₫</td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${isPaid ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-600 border-red-200"}`}>
                          {isPaid ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                          {emp.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot style={{ backgroundColor: "var(--grid-header-bg)", borderTop: "1px solid var(--grid-border)" }}>
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-right text-[12px] font-black uppercase tracking-wider text-gray-500">Tổng quỹ lương</td>
                  <td className="px-4 py-3 text-right text-[15px] font-black text-amber-600">{new Intl.NumberFormat("vi-VN").format(11000000 + 8500000 + 8800000 + 10200000 + 18000000 + 17500000)}₫</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

      </div>
    </>
  );
}
