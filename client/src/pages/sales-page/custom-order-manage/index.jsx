/**
 * Component SalesCustomOrderManage
 * Quản lý Yêu cầu đặt riêng — Nhân viên bán hàng
 *
 * Chỉ hiển thị các yêu cầu đặt riêng chưa thành phẩm/chưa thành đơn.
 *
 * Created Date: 12/03/2026
 */

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Eye,
  Calendar,
  XCircle,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  TreePine,
  Palette,
  Ruler,
  Image as ImageIcon,
} from "lucide-react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import { Button } from "@/components/ui/button";

// ===================== MOCK DATA =====================
export const MOCK_CUSTOM_REQUESTS = [
  {
    id: "YC001",
    customerName: "Nguyễn Văn Hoàng",
    phone: "0901234567",
    productName: "Bàn ăn tròn xoay",
    woodType: "Gỗ sồi",
    color: "Tự nhiên",
    size: "D120 R120 C75 cm",
    note: "Mặt bàn xoay gỗ nguyên khối",
    quantity: 1,
    status: "Chờ duyệt",
    date: "2026-03-08T09:15:00",
    images: ["https://dogohoangphong.com/wp-content/uploads/2021/04/1-11-768x576.jpg"],
  },
  {
    id: "YC002",
    customerName: "Trần Thị Mai",
    phone: "0912345678",
    productName: "Sofa góc chữ L",
    woodType: "Gỗ óc chó",
    color: "Nâu đậm",
    size: "280 x 180 cm",
    note: "Bọc nệm da bồ tót đen",
    quantity: 1,
    status: "Chờ duyệt",
    date: "2026-03-07T14:30:00",
    images: [],
  },
  {
    id: "YC003",
    customerName: "Lê Minh Tuấn",
    phone: "0923456789",
    productName: "Tủ bếp acrylic thẳng",
    woodType: "Gỗ công nghiệp",
    color: "Trắng",
    size: "D450 C220 cm",
    note: "Gắn sẵn phụ kiện hafele",
    quantity: 1,
    status: "Đã tạo đơn",
    date: "2026-03-06T10:00:00",
    images: [],
  },
  {
    id: "YC004",
    customerName: "Phạm Thị Lan",
    phone: "0934567890",
    productName: "Giường ngủ tân cổ điển",
    woodType: "Gỗ gõ đỏ",
    color: "Nâu cánh gián",
    size: "D200 R180 cm",
    note: "Đầu giường bọc nhung ép cúc trám",
    quantity: 1,
    status: "Khách từ chối",
    date: "2026-03-05T16:45:00",
    images: ["https://dogohoangphong.com/wp-content/uploads/2021/04/1-3.jpg"],
  },
  {
    id: "YC005",
    customerName: "Võ Đức Anh",
    phone: "0945678901",
    productName: "Tủ quần áo 4 buồng",
    woodType: "Gỗ tần bì",
    color: "Tự nhiên",
    size: "D240 C220 S60 cm",
    note: "",
    quantity: 1,
    status: "Chờ duyệt",
    date: "2026-03-09T08:20:00",
    images: [],
  },
];

const CUSTOM_ORDER_STATUSES = [
  "Tất cả",
  "Chờ duyệt",
  "Đã tạo đơn",
  "Khách từ chối",
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
    case "Chờ duyệt":
      return { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" };
    case "Đã tạo đơn":
      return { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" };
    case "Khách từ chối":
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
export default function SalesCustomOrderManage() {
  const [activeFilter, setActiveFilter] = useState("Tất cả");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  
  // Modal states
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  // Lọc dữ liệu
  const filteredRequests = useMemo(() => {
    let result = MOCK_CUSTOM_REQUESTS;

    if (activeFilter !== "Tất cả") {
      result = result.filter((req) => req.status === activeFilter);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (req) =>
          req.id.toLowerCase().includes(q) ||
          req.customerName.toLowerCase().includes(q) ||
          req.phone.includes(q) ||
          req.productName.toLowerCase().includes(q)
      );
    }

    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      fromDate.setHours(0, 0, 0, 0);
      result = result.filter((req) => new Date(req.date) >= fromDate);
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      result = result.filter((req) => new Date(req.date) <= toDate);
    }

    return result.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [activeFilter, searchTerm, dateFrom, dateTo]);

  const hasActiveFilters = activeFilter !== "Tất cả" || dateFrom || dateTo || searchTerm;

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const currentItems = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const resetFilters = () => {
    setActiveFilter("Tất cả");
    setSearchTerm("");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  };

  const openDetail = (req) => {
    setSelectedRequest(req);
    setIsDetailModalOpen(true);
  };

  return (
    <>
      <PageHelmet title="Quản lý yêu cầu đặt riêng - TPF-SIMS" />

      <div
        className="flex flex-col h-[calc(100vh-64px)] -m-6 p-6 space-y-4"
        style={{ backgroundColor: "var(--bg-main)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-xl font-bold" style={{ color: "var(--text-main)" }}>
              Yêu cầu đặt riêng
            </h1>
            <p className="text-[13px] mt-0.5" style={{ color: "var(--text-placeholder)" }}>
              {filteredRequests.length} yêu cầu đặt riêng
            </p>
          </div>
          
          <Link to="/sales/dashboard/invoice-custom-order">
            <Button className="bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/90 text-[13px] font-semibold text-white rounded-lg h-9 px-4 cursor-pointer transition-all duration-200 active:scale-[0.97]">
              Tạo yêu cầu mới
            </Button>
          </Link>
        </div>

        {/* Status Toolbar */}
        <div className="flex items-center gap-2 shrink-0 px-1 flex-wrap">
          {CUSTOM_ORDER_STATUSES.map((s) => {
            const isActive = activeFilter === s;
            const statusStyle = s !== "Tất cả" ? getStatusColor(s) : null;
            return (
              <button
                key={s}
                onClick={() => {
                  setActiveFilter(s);
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                style={{
                  backgroundColor: isActive
                    ? statusStyle
                      ? statusStyle.bg
                      : "#fff"
                    : "transparent",
                  color: isActive
                    ? statusStyle
                      ? statusStyle.text
                      : "var(--text-main)"
                    : "var(--text-secondary)",
                  border: isActive
                    ? `1.5px solid ${statusStyle ? statusStyle.border : "var(--grid-border)"}`
                    : "1.5px solid transparent",
                }}
              >
                {s !== "Tất cả" && (
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor: statusStyle
                        ? statusStyle.text
                        : "var(--text-secondary)",
                      opacity: isActive ? 1 : 0.5,
                    }}
                  />
                )}
                {s}
              </button>
            );
          })}
        </div>

        {/* Search & Table Card */}
        <div
          className="flex flex-col bg-white rounded-2xl flex-1 overflow-hidden"
          style={{
            boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
          }}
        >


          {/* Search  */}
          <div
            className="px-4 py-3 border-b shrink-0 flex flex-wrap items-center justify-between gap-3"
            style={{ borderColor: "var(--grid-border)" }}
          >
            {/* LEFT — Search */}
            <div className="relative w-full max-w-md shrink-0">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-placeholder)" }}
              />
              <input
                type="text"
                placeholder="Tìm tên khách hàng, SĐT, Sản phẩm, Mã yêu cầu..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
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
            <div className="flex items-center gap-2.5 shrink-0 overflow-x-auto">
              {/* Date From */}
              <div className="flex items-center gap-1.5 shrink-0">
                <Calendar
                  size={14}
                  style={{ color: "var(--text-placeholder)" }}
                />
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    setCurrentPage(1);
                  }}
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
                className="text-[12px] shrink-0"
                style={{ color: "var(--text-placeholder)" }}
              >
                đến
              </span>

              {/* Date To */}
              <input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-9 px-3 rounded-lg text-[13px] focus:outline-none focus:ring-2 transition shrink-0"
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
                  onClick={resetFilters}
                  className="h-9 px-3 rounded-lg text-[13px] font-medium flex-shrink-0 flex items-center gap-1.5 cursor-pointer transition hover:opacity-80"
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

          {/* Table Container - Fixed Height Scroll */}
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left relative">
              <thead className="sticky top-0 z-10" style={{ backgroundColor: "var(--grid-header-bg)", borderBottom: "1px solid var(--grid-border)" }}>
                <tr>
                  {[
                    "Mã YC",
                    "Khách hàng",
                    "Chi tiết sản phẩm",
                    "Trạng thái",
                    "Ngày tạo",
                    "",
                  ].map((h, i) => (
                    <th
                      key={i}
                      className={`px-4 py-3 text-[11px] font-bold uppercase tracking-wider ${i === 5 ? "text-right" : ""}`}
                      style={{ color: "var(--text-placeholder)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((req) => {
                    const statusColor = getStatusColor(req.status);
                    
                    return (
                      <tr
                        key={req.id}
                        className="hover:bg-gray-50/50 transition-colors group"
                        style={{ borderBottom: "1px solid var(--grid-border)" }}
                      >
                        <td className="px-4 py-3">
                          <span className="font-semibold text-[var(--brand-primary)] bg-[var(--brand-primary)]/5 px-2 py-1 rounded-md text-[12px]">
                            {req.id}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-[13px]" style={{ color: "var(--text-main)" }}>{req.customerName}</div>
                          <div className="text-[11px]" style={{ color: "var(--text-placeholder)" }}>{req.phone}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-[13px]" style={{ color: "var(--text-main)" }}>{req.productName}</div>
                          <div className="flex flex-wrap gap-2 mt-1.5">
                            {req.woodType && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-green-50 text-green-700">
                                <TreePine size={10} /> {req.woodType}
                              </span>
                            )}
                            {req.size && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-purple-50 text-purple-700">
                                <Ruler size={10} /> {req.size}
                              </span>
                            )}
                            {req.color && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-orange-50 text-orange-700">
                                <Palette size={10} /> {req.color}
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                              SL: {req.quantity}
                            </span>
                          </div>
                          {req.images && req.images.length > 0 && (
                            <div className="flex gap-2 mt-2">
                              {req.images.map((img, idx) => (
                                <button 
                                  key={idx}
                                  onClick={(e) => { e.stopPropagation(); setImagePreview(img); }}
                                  className="relative group/img overflow-hidden rounded-md border border-gray-200 hover:border-[var(--brand-primary)] cursor-zoom-in"
                                >
                                  <img src={img} alt="Mẫu" className="w-10 h-10 object-cover" />
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                                    <Eye size={14} className="text-white" />
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="inline-flex items-center px-2.5 py-1 text-[11px] font-bold rounded-md"
                            style={{
                              backgroundColor: statusColor.bg,
                              color: statusColor.text,
                              border: `1px solid ${statusColor.border}`,
                            }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full mr-1.5"
                              style={{ backgroundColor: statusColor.text }}
                            ></span>
                            {req.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-[12px]" style={{ color: "var(--text-main)" }}>{formatDateTime(req.date).split(' - ')[1]}</div>
                          <div className="text-[11px]" style={{ color: "var(--text-placeholder)" }}>{formatDateTime(req.date).split(' - ')[0]}</div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => openDetail(req)}
                            className="p-1.5 text-gray-400 hover:text-[var(--brand-primary)] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center"
                            title="Xem chi tiết"
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-24 text-center">
                      <div className="flex flex-col items-center gap-2" style={{ color: "var(--text-placeholder)" }}>
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "var(--bg-main)" }}>
                          <Calendar size={28} strokeWidth={1.5} />
                        </div>
                        <p className="text-sm font-medium mt-1">Không tìm thấy yêu cầu nào</p>
                        <p className="text-xs">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {filteredRequests.length > 0 && (
            <div
              className="flex items-center justify-between px-6 py-3 border-t shrink-0"
              style={{
                borderColor: "var(--grid-border)",
                backgroundColor: "var(--bg-main)",
              }}
            >
              <div className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                Tổng số bản ghi: <span className="font-bold" style={{ color: "var(--text-main)" }}>{filteredRequests.length}</span>
              </div>

              <div className="flex items-center gap-6">
                {/* Items per page indicator */}
                <div className="flex items-center gap-2">
                  <span className="text-[13px]" style={{ color: "var(--text-secondary)" }}>Số bản ghi/trang</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
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
                    {[8, 15, 30, 50].map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Range Info */}
                <div className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                  <span className="font-bold" style={{ color: "var(--text-main)" }}>
                    {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredRequests.length)}
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
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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

      {/* Model Detail */}
      {isDetailModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                Chi tiết Yêu cầu <span className="text-[var(--brand-primary)] bg-[var(--brand-primary)]/10 px-2 py-0.5 rounded-md text-sm">{selectedRequest.id}</span>
              </h3>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Thông tin Khách hàng</h4>
                    <p className="font-medium text-gray-900">{selectedRequest.customerName}</p>
                    <p className="text-gray-600 mt-0.5">{selectedRequest.phone}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Trạng thái</h4>
                    <span
                      className="inline-flex items-center px-2.5 py-1 text-[11px] font-bold rounded-md"
                      style={{
                        backgroundColor: getStatusColor(selectedRequest.status).bg,
                        color: getStatusColor(selectedRequest.status).text,
                        border: `1px solid ${getStatusColor(selectedRequest.status).border}`,
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full mr-1.5"
                        style={{ backgroundColor: getStatusColor(selectedRequest.status).text }}
                      ></span>
                      {selectedRequest.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                   <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Ngày tạo</h4>
                    <p className="text-gray-900">{formatDateTime(selectedRequest.date)}</p>
                  </div>
                </div>
              </div>

              <div className="border hover:border-[var(--brand-primary)]/50 transition-colors rounded-xl p-5 bg-gray-50/30">
                <h4 className="text-sm font-bold text-gray-900 mb-3 pb-2 border-b">Yêu cầu sản phẩm</h4>
                
                <p className="text-lg font-medium text-gray-900 mb-4">{selectedRequest.productName}</p>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                  <div>
                     <span className="text-xs text-gray-500 block mb-1">Loại gỗ</span>
                     <span className="font-medium text-gray-900 flex items-center gap-1.5"><TreePine size={14} className="text-green-600"/> {selectedRequest.woodType || "N/A"}</span>
                  </div>
                  <div>
                     <span className="text-xs text-gray-500 block mb-1">Màu sắc</span>
                     <span className="font-medium text-gray-900 flex items-center gap-1.5"><Palette size={14} className="text-orange-600"/> {selectedRequest.color || "N/A"}</span>
                  </div>
                  <div>
                     <span className="text-xs text-gray-500 block mb-1">Kích thước</span>
                     <span className="font-medium text-gray-900 flex items-center gap-1.5"><Ruler size={14} className="text-purple-600"/> {selectedRequest.size || "N/A"}</span>
                  </div>
                  <div>
                     <span className="text-xs text-gray-500 block mb-1">Số lượng</span>
                     <span className="font-medium text-gray-900 block">{selectedRequest.quantity}</span>
                  </div>
                </div>

                {selectedRequest.note && (
                  <div className="bg-yellow-50/50 p-3 rounded-lg border border-yellow-100 mt-4">
                    <span className="text-xs font-semibold text-yellow-800 block mb-1">Ghi chú bổ sung:</span>
                    <p className="text-sm text-yellow-900 italic">{selectedRequest.note}</p>
                  </div>
                )}

                {selectedRequest.images && selectedRequest.images.length > 0 && (
                  <div className="mt-5">
                    <span className="text-xs font-semibold text-gray-500 block mb-2 flex items-center gap-1.5"><ImageIcon size={14}/> Ảnh mẫu tham khảo:</span>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                       {selectedRequest.images.map((img, idx) => (
                          <button 
                            key={idx}
                            onClick={() => setImagePreview(img)}
                            className="relative group/img overflow-hidden rounded-lg border-2 border-transparent hover:border-[var(--brand-primary)] transition-all cursor-zoom-in shrink-0"
                          >
                            <img src={img} alt="Mẫu" className="w-24 h-24 object-cover" />
                             <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                                    <Eye size={20} className="text-white" />
                                  </div>
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
               <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
                  Đóng
               </Button>
               {selectedRequest.status === "Chờ duyệt" && (
                  <Button className="bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/90 text-white">
                    Ghi nhận khách duyệt
                  </Button>
               )}
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {imagePreview && (
         <div 
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200 cursor-zoom-out"
          onClick={() => setImagePreview(null)}
         >
             <button 
               className="absolute top-4 right-4 text-white hover:text-gray-300 p-2 bg-black/20 hover:bg-black/40 rounded-full transition-all"
               onClick={() => setImagePreview(null)}
             >
                <X size={24} />
             </button>
             <img src={imagePreview} alt="Preview" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" />
         </div>
      )}
    </>
  );
}
