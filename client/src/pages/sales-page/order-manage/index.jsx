/**
 * Component SalesOrderManage
 * Quản lý Đơn hàng — Bán tại quầy & Đặt theo mẫu (Static Data)
 *
 * Created Date: 05/03/2026
 */

import { useState, useMemo, useEffect } from "react";
import {
  Search,
  Users,
  Eye,
  Printer,
  ChevronLeft,
  ChevronRight,
  Package,
  Calendar,
  X,
  Filter,
} from "lucide-react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import { Button } from "@/components/ui/button";

// ===================== STATIC DATA =====================
const INITIAL_ORDERS = [
  {
    id: "DH001",
    code: "DH-2603-0001",
    customerName: "Nguyễn Văn Hoàng",
    phone: "0901234567",
    type: "Hàng có sẵn",
    total: 15500000,
    status: "Hoàn thành",
    date: "2026-03-01T08:30:00",
  },
  {
    id: "DH002",
    code: "DH-2603-0002",
    customerName: "Trần Thị Mai",
    phone: "0912345678",
    type: "Đặt theo mẫu",
    total: 42000000,
    status: "Chờ xử lý",
    date: "2026-03-02T10:15:00",
  },
  {
    id: "DH003",
    code: "DH-2603-0003",
    customerName: "Lê Minh Tuấn",
    phone: "0923456789",
    type: "Hàng có sẵn",
    total: 8900000,
    status: "Hoàn thành",
    date: "2026-03-02T14:45:00",
  },
  {
    id: "DH004",
    code: "DH-2603-0004",
    customerName: "Phạm Thị Lan",
    phone: "0934567890",
    type: "Đặt theo mẫu",
    total: 125000000,
    status: "Đang giao",
    date: "2026-03-03T09:00:00",
  },
  {
    id: "DH005",
    code: "DH-2603-0005",
    customerName: "Võ Đức Anh",
    phone: "0945678901",
    type: "Hàng có sẵn",
    total: 3400000,
    status: "Hủy",
    date: "2026-03-03T16:20:00",
  },
  {
    id: "DH006",
    code: "DH-2603-0006",
    customerName: "Đặng Thùy Linh",
    phone: "0956789012",
    type: "Đặt theo mẫu",
    total: 85000000,
    status: "Chờ xử lý",
    date: "2026-03-04T11:10:00",
  },
  {
    id: "DH007",
    code: "DH-2603-0007",
    customerName: "Bùi Tuấn Anh",
    phone: "0967890123",
    type: "Hàng có sẵn",
    total: 21000000,
    status: "Hoàn thành",
    date: "2026-03-04T15:30:00",
  },
  {
    id: "DH008",
    code: "DH-2603-0008",
    customerName: "Hoàng Nguyệt Ánh",
    phone: "0978901234",
    type: "Đặt theo mẫu",
    total: 56000000,
    status: "Đang giao",
    date: "2026-03-05T08:45:00",
  },
  {
    id: "DH009",
    code: "DH-2603-0009",
    customerName: "Đinh Quang Hiếu",
    phone: "0989012345",
    type: "Hàng có sẵn",
    total: 1200000,
    status: "Hoàn thành",
    date: "2026-03-05T13:20:00",
  },
  {
    id: "DH010",
    code: "DH-2603-0010",
    customerName: "Vũ Phương Thảo",
    phone: "0990123456",
    type: "Đặt theo mẫu",
    total: 95000000,
    status: "Chờ xử lý",
    date: "2026-03-05T16:05:00",
  },
  {
    id: "DH011",
    code: "DH-2603-0011",
    customerName: "Đinh Quang Hiếu",
    phone: "0989012345",
    type: "Hàng có sẵn",
    total: 1200000,
    status: "Hoàn thành",
    date: "2026-03-05T13:20:00",
  },
  {
    id: "DH012",
    code: "DH-2603-0012",
    customerName: "Đinh Quang Hiếu",
    phone: "0989012345",
    type: "Hàng có sẵn",
    total: 1200000,
    status: "Hoàn thành",
    date: "2026-03-05T13:20:00",
  },
  {
    id: "DH013",
    code: "DH-2603-0013",
    customerName: "Đinh Quang Hiếu",
    phone: "0989012345",
    type: "Hàng có sẵn",
    total: 1200000,
    status: "Hoàn thành",
    date: "2026-03-05T13:20:00",
  },
  {
    id: "DH014",
    code: "DH-2603-0014",
    customerName: "Đinh Quang Hiếu",
    phone: "0989012345",
    type: "Hàng có sẵn",
    total: 1200000,
    status: "Hoàn thành",
    date: "2026-03-05T13:20:00",
  },
  {
    id: "DH015",
    code: "DH-2603-0015",
    customerName: "Đinh Quang Hiếu",
    phone: "0989012345",
    type: "Hàng có sẵn",
    total: 1200000,
    status: "Hoàn thành",
    date: "2026-03-05T13:20:00",
  },
  {
    id: "DH016",
    code: "DH-2603-0016",
    customerName: "Đinh Quang Hiếu",
    phone: "0989012345",
    type: "Hàng có sẵn",
    total: 1200000,
    status: "Hoàn thành",
    date: "2026-03-05T13:20:00",
  },
];

const ORDER_TYPES = ["Tất cả", "Hàng có sẵn", "Đặt theo mẫu"];
const ORDER_STATUSES = [
  "Tất cả",
  "Hoàn thành",
  "Chờ xử lý",
  "Đang giao",
  "Hủy",
];

// ===================== HELPERS =====================
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const formatDateTime = (dateString) => {
  const d = new Date(dateString);
  return `${d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} - ${d.toLocaleDateString("vi-VN")}`;
};

const getStatusColor = (status) => {
  switch (status) {
    case "Hoàn thành":
      return {
        bg: "var(--status-focus)",
        text: "var(--status-success)",
        border: "var(--brand-primary)",
      };
    case "Chờ xử lý":
      return {
        bg: "#FFF7ED",
        text: "var(--status-pending)",
        border: "#FED7AA",
      };
    case "Đang giao":
      return {
        bg: "#EFF6FF",
        text: "var(--palette-dark-blue)",
        border: "#BFDBFE",
      };
    case "Hủy":
      return { bg: "#FEF2F2", text: "var(--status-error)", border: "#FECACA" };
    default:
      return {
        bg: "var(--bg-main)",
        text: "var(--text-secondary)",
        border: "var(--grid-border)",
      };
  }
};

// ===================== COMPONENT =====================
export default function SalesOrderManage() {
  const [orders] = useState(INITIAL_ORDERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("Tất cả");
  const [filterStatus, setFilterStatus] = useState("Tất cả");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Filter & Search
  const filtered = useMemo(() => {
    let result = orders;

    // Filter by type
    if (activeTab !== "Tất cả") {
      result = result.filter((o) => o.type === activeTab);
    }

    // Filter by status
    if (filterStatus !== "Tất cả") {
      result = result.filter((o) => o.status === filterStatus);
    }

    // Filter by date range
    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      result = result.filter((o) => new Date(o.date) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      result = result.filter((o) => new Date(o.date) <= to);
    }

    // Search
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (o) =>
          o.customerName.toLowerCase().includes(q) ||
          o.phone.includes(q) ||
          o.code.toLowerCase().includes(q),
      );
    }

    return result.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [orders, activeTab, filterStatus, dateFrom, dateTo, searchTerm]);

  const hasActiveFilters = filterStatus !== "Tất cả" || dateFrom || dateTo;

  const clearAllFilters = () => {
    setFilterStatus("Tất cả");
    setDateFrom("");
    setDateTo("");
    setSearchTerm("");
  };

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeTab, filterStatus, dateFrom, dateTo]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedOrders = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // ===================== RENDER =====================
  return (
    <>
      <PageHelmet title="Quản lý đơn hàng - TPF-SIMS" />

      <div
        className="flex flex-col h-[calc(100vh-64px)] -m-6 p-6 space-y-4"
        style={{ backgroundColor: "var(--bg-main)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1
              className="text-xl font-bold flex items-center gap-2"
              style={{ color: "var(--text-main)" }}
            >
              <Package size={22} style={{ color: "var(--brand-primary)" }} />
              Quản lý đơn hàng
            </h1>
            <p
              className="text-[13px] mt-0.5"
              style={{ color: "var(--text-placeholder)" }}
            >
              {filtered.length} đơn hàng{" "}
              {activeTab !== "Tất cả" ? `(${activeTab.toLowerCase()})` : ""}
            </p>
          </div>

          {/* Tabs */}
          <div
            className="flex p-1 rounded-xl"
            style={{
              backgroundColor: "var(--grid-header-bg)",
              border: "1px solid var(--grid-border)",
            }}
          >
            {ORDER_TYPES.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-all cursor-pointer"
                style={{
                  backgroundColor: activeTab === tab ? "#fff" : "transparent",
                  color:
                    activeTab === tab
                      ? "var(--text-main)"
                      : "var(--text-secondary)",
                  boxShadow:
                    activeTab === tab ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Search + Table Card */}
        <div
          className="flex flex-col bg-white rounded-2xl flex-1 overflow-hidden"
          style={{
            boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
          }}
        >
          {/* Search + Filters */}
          <div
            className="px-4 py-3 border-b shrink-0"
            style={{ borderColor: "var(--grid-border)" }}
          >
            <div className="flex items-center justify-between gap-3">
              {/* LEFT — Search */}
              <div className="relative w-full max-w-md">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-placeholder)" }}
                />
                <input
                  type="text"
                  placeholder="Tìm mã đơn, tên khách hàng, SĐT..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-9 pl-10 pr-8 rounded-lg text-[13px] focus:outline-none focus:ring-2 transition"
                  style={{
                    border: "1px solid var(--grid-border)",
                    backgroundColor: "var(--bg-main)",
                    color: "var(--text-main)",
                  }}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
                    style={{ color: "var(--text-placeholder)" }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* RIGHT — Filters */}
              <div className="flex items-center gap-2.5 shrink-0">
                {/* Status Filter */}
                <div className="flex items-center gap-1.5">
                  <Filter
                    size={14}
                    style={{ color: "var(--text-placeholder)" }}
                  />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="h-9 px-3 pr-8 rounded-lg text-[13px] cursor-pointer focus:outline-none focus:ring-2 transition appearance-none"
                    style={{
                      border: `1px solid ${filterStatus !== "Tất cả" ? "var(--brand-primary)" : "var(--grid-border)"}`,
                      backgroundColor:
                        filterStatus !== "Tất cả"
                          ? "var(--status-focus)"
                          : "var(--bg-main)",
                      color:
                        filterStatus !== "Tất cả"
                          ? "var(--brand-primary)"
                          : "var(--text-main)",
                      fontWeight: filterStatus !== "Tất cả" ? 600 : 400,
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 8px center",
                    }}
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s === "Tất cả" ? "Trạng thái" : s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date From */}
                <div className="flex items-center gap-1.5">
                  <Calendar
                    size={14}
                    style={{ color: "var(--text-placeholder)" }}
                  />
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="h-9 px-3 rounded-lg text-[13px] focus:outline-none focus:ring-2 transition"
                    style={{
                      border: `1px solid ${dateFrom ? "var(--brand-primary)" : "var(--grid-border)"}`,
                      backgroundColor: dateFrom
                        ? "var(--status-focus)"
                        : "var(--bg-main)",
                      color: dateFrom
                        ? "var(--brand-primary)"
                        : "var(--text-main)",
                      fontWeight: dateFrom ? 600 : 400,
                    }}
                    title="Từ ngày"
                  />
                </div>

                <span
                  className="text-[12px]"
                  style={{ color: "var(--text-placeholder)" }}
                >
                  đến
                </span>

                {/* Date To */}
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-9 px-3 rounded-lg text-[13px] focus:outline-none focus:ring-2 transition"
                  style={{
                    border: `1px solid ${dateTo ? "var(--brand-primary)" : "var(--grid-border)"}`,
                    backgroundColor: dateTo
                      ? "var(--status-focus)"
                      : "var(--bg-main)",
                    color: dateTo ? "var(--brand-primary)" : "var(--text-main)",
                    fontWeight: dateTo ? 600 : 400,
                  }}
                  title="Đến ngày"
                />

                {/* Clear filters */}
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="h-9 px-3 rounded-lg text-[13px] font-medium flex items-center gap-1.5 cursor-pointer transition hover:opacity-80"
                    style={{
                      color: "var(--status-error)",
                      backgroundColor: "#FEF2F2",
                      border: "1px solid #FECACA",
                    }}
                  >
                    <X size={14} />
                    Xóa bộ lọc
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Table Container - Fixed Height Scroll */}
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left relative">
              <thead
                className="sticky top-0 z-10"
                style={{
                  backgroundColor: "var(--grid-header-bg)",
                  borderBottom: "1px solid var(--grid-border)",
                }}
              >
                <tr>
                  {[
                    "Mã đơn",
                    "Khách hàng",
                    "Loại đơn",
                    "Tổng tiền",
                    "Trạng thái",
                    "Thời gian",
                    "Thao tác",
                  ].map((h, i) => (
                    <th
                      key={i}
                      className={`px-4 py-3 text-[11px] font-bold uppercase tracking-wider ${i === 6 ? "text-right" : i === 3 ? "text-right pr-8" : ""}`}
                      style={{ color: "var(--text-placeholder)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map((o) => {
                  const statusConfig = getStatusColor(o.status);
                  return (
                    <tr
                      key={o.id}
                      className="hover:bg-gray-50/50 transition-colors"
                      style={{ borderBottom: "1px solid var(--grid-border)" }}
                    >
                      <td className="px-4 py-3">
                        <p
                          className="text-[13px] font-bold font-mono"
                          style={{ color: "var(--text-main)" }}
                        >
                          {o.code}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p
                          className="text-[13px] font-semibold"
                          style={{ color: "var(--text-main)" }}
                        >
                          {o.customerName}
                        </p>
                        <p
                          className="text-[11px]"
                          style={{ color: "var(--text-placeholder)" }}
                        >
                          {o.phone}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-block px-2.5 py-1 text-[11px] font-bold rounded-md"
                          style={{
                            backgroundColor: "var(--bg-main)",
                            color: "var(--text-secondary)",
                            border: "1px solid var(--grid-border)",
                          }}
                        >
                          {o.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right pr-8">
                        <p
                          className="text-[13px] font-bold"
                          style={{ color: "var(--text-main)" }}
                        >
                          {formatCurrency(o.total)}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center px-2.5 py-1 text-[11px] font-bold rounded-md"
                          style={{
                            backgroundColor: statusConfig.bg,
                            color: statusConfig.text,
                            border: `1px solid ${statusConfig.border}`,
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full mr-1.5"
                            style={{ backgroundColor: statusConfig.text }}
                          ></span>
                          {o.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div
                          className="flex items-center gap-1.5 text-[12px]"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          <Calendar
                            size={13}
                            style={{ color: "var(--text-placeholder)" }}
                          />
                          {formatDateTime(o.date)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => setSelectedOrder(o)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition cursor-pointer hover:bg-gray-100"
                            style={{ color: "var(--text-placeholder)" }}
                            title="Xem chi tiết"
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition cursor-pointer hover:bg-gray-100"
                            style={{ color: "var(--text-placeholder)" }}
                            title="In phiếu"
                          >
                            <Printer size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {paginatedOrders.length === 0 && (
                  <tr>
                    <td colSpan="7" className="py-24 text-center">
                      <div
                        className="flex flex-col items-center gap-2"
                        style={{ color: "var(--text-placeholder)" }}
                      >
                        <div
                          className="w-16 h-16 rounded-2xl flex items-center justify-center"
                          style={{ backgroundColor: "var(--bg-main)" }}
                        >
                          <Users size={28} strokeWidth={1.5} />
                        </div>
                        <p className="text-sm font-medium mt-1">
                          {searchTerm
                            ? `Không tìm thấy đơn hàng "${searchTerm}"`
                            : "Chưa có đơn hàng nào"}
                        </p>
                        {searchTerm && (
                          <button
                            onClick={() => setSearchTerm("")}
                            className="text-[13px] font-medium cursor-pointer"
                            style={{ color: "var(--brand-primary)" }}
                          >
                            Xóa bộ lọc
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {/* Pagination Footer */}
          {filtered.length > 0 && (
            <div
              className="flex items-center justify-between px-6 py-3 border-t shrink-0"
              style={{
                borderColor: "var(--grid-border)",
                backgroundColor: "var(--bg-main)",
              }}
            >
              <div
                className="text-[13px]"
                style={{ color: "var(--text-secondary)" }}
              >
                Tổng số bản ghi:{" "}
                <span
                  className="font-bold"
                  style={{ color: "var(--text-main)" }}
                >
                  {filtered.length}
                </span>
              </div>

              <div className="flex items-center gap-6">
                {/* Items per page indicator */}
                <div className="flex items-center gap-2">
                  <span
                    className="text-[13px]"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Số bản ghi/trang
                  </span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1); // Reset to page 1 when changing items per page
                    }}
                    className="h-8 px-2 pr-6 rounded-md text-[13px] border cursor-pointer focus:outline-none focus:ring-1 transition appearance-none"
                    style={{
                      borderColor: "var(--grid-border)",
                      backgroundColor: "#fff",
                      color: "var(--text-main)",
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 8px center",
                    }}
                  >
                    {[15, 30, 50, 100].map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Range Info */}
                <div
                  className="text-[13px]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <span
                    className="font-bold"
                    style={{ color: "var(--text-main)" }}
                  >
                    {(currentPage - 1) * itemsPerPage + 1} -{" "}
                    {Math.min(currentPage * itemsPerPage, filtered.length)}
                  </span>{" "}
                  bản ghi
                </div>

                {/* Arrows */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer hover:bg-gray-200 rounded p-1"
                    style={{ color: "var(--text-main)" }}
                  >
                    <ChevronLeft size={16} strokeWidth={2.5} />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer hover:bg-gray-200 rounded p-1"
                    style={{ color: "var(--text-main)" }}
                  >
                    <ChevronRight size={16} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Chi tiết đơn hàng */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div
              className="px-6 py-4 border-b flex items-center justify-between"
              style={{ borderColor: "var(--grid-border)" }}
            >
              <h2
                className="text-lg font-bold"
                style={{ color: "var(--text-main)" }}
              >
                Chi tiết đơn hàng{" "}
                <span style={{ color: "var(--brand-primary)" }}>
                  {selectedOrder.code}
                </span>
              </h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={20} style={{ color: "var(--text-secondary)" }} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-4">
                <div
                  className="p-4 rounded-xl border flex flex-col gap-1"
                  style={{
                    borderColor: "var(--grid-border)",
                    backgroundColor: "var(--bg-main)",
                  }}
                >
                  <p
                    className="text-[12px] font-medium"
                    style={{ color: "var(--text-placeholder)" }}
                  >
                    Khách hàng
                  </p>
                  <p
                    className="font-bold text-[14px]"
                    style={{ color: "var(--text-main)" }}
                  >
                    {selectedOrder.customerName}
                  </p>
                  <p
                    className="text-[13px]"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    SĐT: {selectedOrder.phone}
                  </p>
                </div>
                <div
                  className="p-4 rounded-xl border flex flex-col gap-1"
                  style={{
                    borderColor: "var(--grid-border)",
                    backgroundColor: "var(--bg-main)",
                  }}
                >
                  <p
                    className="text-[12px] font-medium"
                    style={{ color: "var(--text-placeholder)" }}
                  >
                    Thông tin đơn
                  </p>
                  <p
                    className="font-bold text-[14px] flex items-center gap-1.5"
                    style={{ color: "var(--text-main)" }}
                  >
                    <Calendar
                      size={14}
                      style={{ color: "var(--text-placeholder)" }}
                    />
                    {formatDateTime(selectedOrder.date)}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className="inline-block px-2 text-[11px] font-bold rounded"
                      style={{
                        backgroundColor: "var(--bg-main)",
                        color: "var(--text-secondary)",
                        border: "1px solid var(--grid-border)",
                      }}
                    >
                      {selectedOrder.type}
                    </span>
                    <span
                      className="inline-flex items-center px-2 text-[11px] font-bold rounded"
                      style={{
                        backgroundColor: getStatusColor(selectedOrder.status)
                          .bg,
                        color: getStatusColor(selectedOrder.status).text,
                        border: `1px solid ${getStatusColor(selectedOrder.status).border}`,
                      }}
                    >
                      {selectedOrder.status}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3
                  className="text-[14px] font-bold mb-3"
                  style={{ color: "var(--text-main)" }}
                >
                  Sản phẩm (Minh họa)
                </h3>
                <div
                  className="border rounded-xl overflow-hidden"
                  style={{ borderColor: "var(--grid-border)" }}
                >
                  <table className="w-full text-left">
                    <thead
                      style={{
                        backgroundColor: "var(--grid-header-bg)",
                        borderBottom: "1px solid var(--grid-border)",
                      }}
                    >
                      <tr>
                        <th
                          className="px-4 py-2.5 text-[12px] font-medium"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Tên sản phẩm
                        </th>
                        <th
                          className="px-4 py-2.5 text-[12px] font-medium text-center w-20"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          SL
                        </th>
                        <th
                          className="px-4 py-2.5 text-[12px] font-medium text-right w-32"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Đơn giá
                        </th>
                        <th
                          className="px-4 py-2.5 text-[12px] font-medium text-right w-32"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Thành tiền
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        className="border-b last:border-0"
                        style={{ borderColor: "var(--grid-border)" }}
                      >
                        <td className="px-4 py-3 text-[13px] font-medium text-gray-800">
                          Sản phẩm test từ đơn hàng
                        </td>
                        <td className="px-4 py-3 text-[13px] text-center text-gray-600">
                          1
                        </td>
                        <td className="px-4 py-3 text-[13px] text-right font-medium text-gray-700">
                          {formatCurrency(selectedOrder.total)}
                        </td>
                        <td className="px-4 py-3 text-[13px] font-bold text-right text-gray-900">
                          {formatCurrency(selectedOrder.total)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div
                className="flex items-center justify-end pt-4 border-t"
                style={{ borderColor: "var(--grid-border)" }}
              >
                <div className="text-right">
                  <p
                    className="text-[13px] mb-1 font-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Tổng cộng
                  </p>
                  <p
                    className="text-2xl font-bold"
                    style={{ color: "var(--status-error)" }}
                  >
                    {formatCurrency(selectedOrder.total)}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              className="px-6 py-4 border-t flex justify-end gap-3 bg-gray-50/50"
              style={{ borderColor: "var(--grid-border)" }}
            >
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-lg text-[13px] font-semibold transition hover:bg-gray-100 cursor-pointer"
                style={{
                  border: "1px solid var(--grid-border)",
                  color: "var(--text-main)",
                  backgroundColor: "#fff",
                }}
              >
                Đóng
              </button>
              <button
                className="px-4 py-2 rounded-lg text-[13px] font-semibold text-white flex items-center gap-2 transition hover:opacity-90 cursor-pointer"
                style={{ backgroundColor: "var(--brand-primary)" }}
              >
                <Printer size={16} /> In phiếu
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
