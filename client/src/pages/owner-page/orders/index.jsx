/**
 * Component OwnerOrders
 * Quản lý Đơn hàng — Chủ cửa hàng (Static Data)
 *
 * Created Date: 06/03/2026
 */

import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  Users,
  Eye,
  Package,
  Calendar,
  FileText,
  XCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Hammer,
} from "lucide-react";
import { PageHelmet } from "@/components/seo/PageHelmet";

// ===================== STATIC DATA =====================
const INITIAL_ORDERS = [
  // ========== HÀNG SẴN ==========
  {
    id: "DH002",
    code: "DH-2603-0009",
    customerName: "Đinh Quang Hiếu",
    phone: "0989012345",
    type: "Hàng sẵn",
    total: 36000000,
    status: "Giao hàng thành công",
    date: "2026-03-05T13:20:00",
  },
  {
    id: "DH999",
    code: "DH-2603-0011",
    customerName: "Đinh Quang Hiếu",
    phone: "0989012345",
    type: "Hàng sẵn",
    total: 1200000,
    status: "Đang chuẩn bị",
    date: "2026-03-05T13:20:00",
  },
  {
    id: "DH005",
    code: "DH-2603-0005",
    customerName: "Võ Đức Anh",
    phone: "0945678901",
    type: "Hàng sẵn",
    total: 3400000,
    status: "Chờ duyệt hủy",
    date: "2026-03-03T16:20:00",
  },
  {
    id: "DH007",
    code: "DH-2603-0007",
    customerName: "Bùi Tuấn Anh",
    phone: "0967890123",
    type: "Hàng sẵn",
    total: 21000000,
    status: "Đang giao hàng",
    date: "2026-03-04T15:30:00",
  },
  {
    id: "DH009",
    code: "DH-2603-0001",
    customerName: "Nguyễn Văn Hoàng",
    phone: "0901234567",
    type: "Hàng sẵn",
    total: 15500000,
    status: "Giao hàng thành công",
    date: "2026-03-01T08:30:00",
  },
  {
    id: "DH011",
    code: "DH-2603-0003",
    customerName: "Lê Minh Tuấn",
    phone: "0923456789",
    type: "Hàng sẵn",
    total: 8900000,
    status: "Chờ xử lý",
    date: "2026-03-02T14:45:00",
  },
  {
    id: "DH012",
    code: "DH-2603-0012",
    customerName: "Nguyễn Thị Hồng",
    phone: "0931234567",
    type: "Hàng sẵn",
    total: 4500000,
    status: "Đang giao hàng",
    date: "2026-03-06T09:15:00",
  },
  {
    id: "DH014",
    code: "DH-2603-0014",
    customerName: "Lê Thị Phương",
    phone: "0953456789",
    type: "Hàng sẵn",
    total: 6700000,
    status: "Giao hàng thành công",
    date: "2026-03-06T11:45:00",
  },
  {
    id: "DH016",
    code: "DH-2603-0016",
    customerName: "Hoàng Văn Sơn",
    phone: "0975678901",
    type: "Hàng sẵn",
    total: 2300000,
    status: "Đang chuẩn bị",
    date: "2026-03-06T15:20:00",
  },
  {
    id: "DH017",
    code: "DH-2603-0017",
    customerName: "Nguyễn Thanh Tùng",
    phone: "0986789012",
    type: "Hàng sẵn",
    total: 3800000,
    status: "Chờ xử lý",
    date: "2026-03-06T16:00:00",
  },
  {
    id: "DH019",
    code: "DH-2603-0019",
    customerName: "Lê Hoàng Nam",
    phone: "0908901234",
    type: "Hàng sẵn",
    total: 5200000,
    status: "Đang giao hàng",
    date: "2026-03-07T08:00:00",
  },
  {
    id: "DH020",
    code: "DH-2603-0020",
    customerName: "Phạm Ngọc Ánh",
    phone: "0919012345",
    type: "Hàng sẵn",
    total: 9100000,
    status: "Giao hàng thành công",
    date: "2026-03-07T08:45:00",
  },
  {
    id: "DH022",
    code: "DH-2603-0022",
    customerName: "Đặng Hữu Phúc",
    phone: "0931234567",
    type: "Hàng sẵn",
    total: 7400000,
    status: "Đang chuẩn bị",
    date: "2026-03-07T10:00:00",
  },
  {
    id: "DH023",
    code: "DH-2603-0023",
    customerName: "Bùi Thị Hạnh",
    phone: "0942345678",
    type: "Hàng sẵn",
    total: 4600000,
    status: "Chờ xử lý",
    date: "2026-03-07T10:30:00",
  },
  {
    id: "DH025",
    code: "DH-2603-0025",
    customerName: "Đinh Thị Mai Anh",
    phone: "0964567890",
    type: "Hàng sẵn",
    total: 2800000,
    status: "Chờ duyệt hủy",
    date: "2026-03-07T11:30:00",
  },
  {
    id: "DH026",
    code: "DH-2603-0026",
    customerName: "Vũ Minh Khoa",
    phone: "0975678901",
    type: "Hàng sẵn",
    total: 6300000,
    status: "Đang giao hàng",
    date: "2026-03-07T12:00:00",
  },
  {
    id: "DH028",
    code: "DH-2603-0028",
    customerName: "Trần Quốc Đạt",
    phone: "0997890123",
    type: "Hàng sẵn",
    total: 11500000,
    status: "Giao hàng thành công",
    date: "2026-03-07T13:30:00",
  },
  {
    id: "DH029",
    code: "DH-2603-0029",
    customerName: "Lê Thị Thanh Hằng",
    phone: "0908901234",
    type: "Hàng sẵn",
    total: 1800000,
    status: "Đang chuẩn bị",
    date: "2026-03-07T14:00:00",
  },
  {
    id: "DH031",
    code: "DH-2603-0031",
    customerName: "Võ Thị Bích Ngọc",
    phone: "0920123456",
    type: "Hàng sẵn",
    total: 5700000,
    status: "Chờ xử lý",
    date: "2026-03-07T15:00:00",
  },
  {
    id: "DH032",
    code: "DH-2603-0032",
    customerName: "Đặng Tuấn Kiệt",
    phone: "0931234567",
    type: "Hàng sẵn",
    total: 8200000,
    status: "Đang giao hàng",
    date: "2026-03-07T15:30:00",
  },
  {
    id: "DH034",
    code: "DH-2603-0034",
    customerName: "Hoàng Thị Diệu Linh",
    phone: "0953456789",
    type: "Hàng sẵn",
    total: 3100000,
    status: "Giao hàng thành công",
    date: "2026-03-07T16:30:00",
  },
  {
    id: "DH035",
    code: "DH-2603-0035",
    customerName: "Đinh Công Vinh",
    phone: "0964567890",
    type: "Hàng sẵn",
    total: 4900000,
    status: "Đang chuẩn bị",
    date: "2026-03-08T08:00:00",
  },
  {
    id: "DH037",
    code: "DH-2603-0037",
    customerName: "Nguyễn Đình Trọng",
    phone: "0986789012",
    type: "Hàng sẵn",
    total: 7800000,
    status: "Đã hủy",
    date: "2026-03-08T09:00:00",
  },
  {
    id: "DH038",
    code: "DH-2603-0038",
    customerName: "Trần Thị Phương Thảo",
    phone: "0997890123",
    type: "Hàng sẵn",
    total: 10200000,
    status: "Chờ xử lý",
    date: "2026-03-08T09:30:00",
  },
  {
    id: "DH040",
    code: "DH-2603-0040",
    customerName: "Phạm Thị Ngọc Trâm",
    phone: "0919012345",
    type: "Hàng sẵn",
    total: 6100000,
    status: "Đang chuẩn bị",
    date: "2026-03-08T10:30:00",
  },
  // ========== ĐẶT THEO MẪU ==========
  {
    id: "DH001",
    code: "DH-2603-0010",
    customerName: "Vũ Phương Thảo",
    phone: "0990123456",
    type: "Đặt theo mẫu",
    total: null,
    status: "Chờ báo giá",
    date: "2026-03-05T16:05:00",
  },
  {
    id: "DH003",
    code: "DH-2603-0012",
    customerName: "Nguyễn Thị Hồng",
    phone: "0912345678",
    type: "Đặt theo mẫu",
    total: 24000000,
    status: "Xác nhận đơn hàng",
    date: "2026-03-04T08:15:00",
  },
  {
    id: "DH004",
    code: "DH-2603-0004",
    customerName: "Phạm Thị Lan",
    phone: "0934567890",
    type: "Đặt theo mẫu",
    total: 125000000,
    status: "Đang giao hàng",
    date: "2026-03-03T09:00:00",
  },
  {
    id: "DH006",
    code: "DH-2603-0006",
    customerName: "Đặng Thùy Linh",
    phone: "0956789012",
    type: "Đặt theo mẫu",
    total: 85000000,
    status: "Đã báo giá",
    date: "2026-03-04T11:10:00",
  },
  {
    id: "DH008",
    code: "DH-2603-0008",
    customerName: "Hoàng Nguyệt Ánh",
    phone: "0978901234",
    type: "Đặt theo mẫu",
    total: 56000000,
    status: "Đang sản xuất",
    date: "2026-03-05T08:45:00",
  },
  {
    id: "DH010",
    code: "DH-2603-0002",
    customerName: "Trần Thị Mai",
    phone: "0912345678",
    type: "Đặt theo mẫu",
    total: 42000000,
    status: "Chờ xác nhận",
    date: "2026-03-02T10:15:00",
  },
  {
    id: "DH013",
    code: "DH-2603-0013",
    customerName: "Trần Văn Đức",
    phone: "0942345678",
    type: "Đặt theo mẫu",
    total: 78000000,
    status: "Đang sản xuất",
    date: "2026-03-06T10:30:00",
  },
  {
    id: "DH015",
    code: "DH-2603-0015",
    customerName: "Phạm Minh Quân",
    phone: "0964567890",
    type: "Đặt theo mẫu",
    total: 110000000,
    status: "Chờ báo giá",
    date: "2026-03-06T14:00:00",
  },
  {
    id: "DH018",
    code: "DH-2603-0018",
    customerName: "Trần Minh Châu",
    phone: "0997890123",
    type: "Đặt theo mẫu",
    total: 67000000,
    status: "Giao hàng thành công",
    date: "2026-03-06T16:30:00",
  },
  {
    id: "DH021",
    code: "DH-2603-0021",
    customerName: "Võ Quốc Bảo",
    phone: "0920123456",
    type: "Đặt theo mẫu",
    total: 135000000,
    status: "Đã báo giá",
    date: "2026-03-07T09:15:00",
  },
  {
    id: "DH024",
    code: "DH-2603-0024",
    customerName: "Hoàng Đức Thịnh",
    phone: "0953456789",
    type: "Đặt theo mẫu",
    total: 88000000,
    status: "Chờ xác nhận",
    date: "2026-03-07T11:00:00",
  },
  {
    id: "DH027",
    code: "DH-2603-0027",
    customerName: "Nguyễn Thị Kim Ngân",
    phone: "0986789012",
    type: "Đặt theo mẫu",
    total: 72000000,
    status: "Chờ duyệt hủy",
    date: "2026-03-07T13:00:00",
  },
  {
    id: "DH030",
    code: "DH-2603-0030",
    customerName: "Phạm Văn Hùng",
    phone: "0919012345",
    type: "Đặt theo mẫu",
    total: 105000000,
    status: "Đang giao hàng",
    date: "2026-03-07T14:30:00",
  },
  {
    id: "DH033",
    code: "DH-2603-0033",
    customerName: "Bùi Hoàng Long",
    phone: "0942345678",
    type: "Đặt theo mẫu",
    total: 92000000,
    status: "Chờ báo giá",
    date: "2026-03-07T16:00:00",
  },
  {
    id: "DH036",
    code: "DH-2603-0036",
    customerName: "Vũ Thị Hương Giang",
    phone: "0975678901",
    type: "Đặt theo mẫu",
    total: 58000000,
    status: "Đang sản xuất",
    date: "2026-03-08T08:30:00",
  },
  {
    id: "DH039",
    code: "DH-2603-0039",
    customerName: "Lê Quang Huy",
    phone: "0908901234",
    type: "Đặt theo mẫu",
    total: 145000000,
    status: "Giao hàng thành công",
    date: "2026-03-08T10:00:00",
  },
  {
    id: "DH041",
    code: "DH-2603-0041",
    customerName: "Trần Đình Phú",
    phone: "0932456789",
    type: "Đặt theo mẫu",
    total: 68000000,
    status: "Đã báo giá",
    date: "2026-03-08T11:00:00",
  },
  {
    id: "DH042",
    code: "DH-2603-0042",
    customerName: "Nguyễn Thị Hạ",
    phone: "0943567890",
    type: "Đặt theo mẫu",
    total: 120000000,
    status: "Chờ xác nhận",
    date: "2026-03-08T12:00:00",
  },
  {
    id: "DH043",
    code: "DH-2604-0043",
    customerName: "Lý Hải Đăng",
    phone: "0912334455",
    type: "Đặt theo mẫu",
    total: 45000000,
    status: "Xác nhận đơn hàng",
    date: "2026-03-08T14:20:00",
  },
  {
    id: "DH044",
    code: "DH-2604-0044",
    customerName: "Trương Mỹ Lan",
    phone: "0345678891",
    type: "Đặt theo mẫu",
    total: 215000000,
    status: "Đang sản xuất",
    date: "2026-03-08T15:10:00",
  },
];

const ORDER_TYPES = ["Hàng sẵn", "Đặt theo mẫu"];

// Hàng sẵn: chờ xử lý → đang chuẩn bị → đang giao hàng → giao hàng thành công | chờ duyệt hủy → đã hủy
const HANG_SAN_STATUSES = [
  "Tất cả",
  "Chờ xử lý",
  "Đang chuẩn bị",
  "Đang giao hàng",
  "Giao hàng thành công",
  "Chờ duyệt hủy",
  "Đã hủy",
];

// Đặt theo mẫu: chờ báo giá → đã báo giá → chờ xác nhận → xác nhận → đang sản xuất → đang giao hàng → thành công | chờ duyệt hủy → đã hủy
const DAT_THEO_MAU_STATUSES = [
  "Tất cả",
  "Chờ báo giá",
  "Đã báo giá",
  "Chờ xác nhận",
  "Xác nhận đơn hàng",
  "Đang sản xuất",
  "Đang giao hàng",
  "Giao hàng thành công",
  "Chờ duyệt hủy",
  "Đã hủy",
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
    // === HÀNG SẴN ===
    case "Chờ xử lý":
      return { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" };
    case "Đang chuẩn bị":
      return { bg: "#F5F3FF", text: "#7C3AED", border: "#DDD6FE" };
    case "Đang giao hàng":
      return { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" };
    case "Giao hàng thành công":
      return { bg: "var(--status-focus)", text: "var(--status-success)", border: "var(--brand-primary)" };

    // === ĐẶT THEO MẪU ===
    case "Chờ báo giá":
      return { bg: "#FFFBEB", text: "#B45309", border: "#FDE68A" };
    case "Đã báo giá":
      return { bg: "#ECFDF5", text: "#047857", border: "#A7F3D0" };
    case "Chờ xác nhận":
      return { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" };
    case "Xác nhận đơn hàng":
      return { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" };
    case "Đang sản xuất":
      return { bg: "#F5F3FF", text: "#7C3AED", border: "#DDD6FE" };

    // === CHUNG ===
    case "Chờ duyệt hủy":
      return { bg: "#FEF3C7", text: "#D97706", border: "#FDE68A" };
    case "Đã hủy":
      return { bg: "#FEF2F2", text: "var(--status-error)", border: "#FECACA" };

    default:
      return { bg: "var(--bg-main)", text: "var(--text-secondary)", border: "var(--grid-border)" };
  }
};

// ===================== COMPONENT =====================
export default function OwnerOrders() {
  const [orders] = useState(INITIAL_ORDERS);
  const [searchParams, setSearchParams] = useSearchParams();

  // Đọc giá trị từ URL, nếu không có thì mặc định
  const activeTab = searchParams.get("tab") || "Hàng sẵn";
  const statusFilter = searchParams.get("status") || "Tất cả";

  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  // Helper để cập nhật Search Params mượt mà
  const updateParams = (newParams) => {
    const current = Object.fromEntries(searchParams.entries());
    setSearchParams({ ...current, ...newParams });
  };

  const setActiveTab = (tab) => {
    updateParams({ tab, status: "Tất cả" }); // Reset status khi đổi tab
  };

  const setStatusFilter = (status) => {
    updateParams({ status });
  };

  // Filter & Search
  const filtered = useMemo(() => {
    let result = orders;

    // Filter by type
    result = result.filter((o) => o.type === activeTab);

    // Filter by status
    if (statusFilter !== "Tất cả") {
      result = result.filter((o) => o.status === statusFilter);
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
  }, [orders, activeTab, searchTerm, statusFilter, dateFrom, dateTo]);

  const hasActiveFilters = statusFilter !== "Tất cả" || dateFrom || dateTo || searchTerm;

  const clearAllFilters = () => {
    updateParams({ status: "Tất cả" });
    setDateFrom("");
    setDateTo("");
    setSearchTerm("");
  };

  // Reset date and search when folder/tab changes
  useEffect(() => {
    setDateFrom("");
    setDateTo("");
    setSearchTerm("");
  }, [activeTab]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeTab, statusFilter, dateFrom, dateTo]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedOrders = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // ===================== RENDER =====================
  return (
    <>
      <PageHelmet title="Quản lý đơn hàng - Chủ cửa hàng | TPF-SIMS" />

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
              {filtered.length} đơn hàng ({activeTab.toLowerCase()})
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

        {/* Status Toolbar */}
        <div
          className="flex items-center gap-2 shrink-0 px-1 flex-wrap"
        >
          {(activeTab === "Hàng sẵn" ? HANG_SAN_STATUSES : DAT_THEO_MAU_STATUSES).map((s) => {
            const isActive = statusFilter === s;
            const statusStyle = s !== "Tất cả" ? getStatusColor(s) : null;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                style={{
                  backgroundColor: isActive
                    ? (statusStyle ? statusStyle.bg : "#fff")
                    : "transparent",
                  color: isActive
                    ? (statusStyle ? statusStyle.text : "var(--text-main)")
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
                      backgroundColor: statusStyle ? statusStyle.text : "var(--text-secondary)",
                      opacity: isActive ? 1 : 0.5,
                    }}
                  />
                )}
                {s}
              </button>
            );
          })}
        </div>

        {/* Search + Table Card */}
        <div
          className="flex flex-col bg-white rounded-2xl flex-1 overflow-hidden"
          style={{
            boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
          }}
        >
          {/* Search */}
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
                className="text-[12px] shrink-0"
                style={{ color: "var(--text-placeholder)" }}
              >
                đến
              </span>

              {/* Date To */}
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
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
                  onClick={clearAllFilters}
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
              <thead
                className="sticky top-0 z-10"
                style={{
                  backgroundColor: "var(--grid-header-bg)",
                  borderBottom: "1px solid var(--grid-border)",
                }}
              >
                <tr>
                  {[
                    "STT",
                    "Mã đơn",
                    "Khách hàng",
                    "Loại đơn",
                    "Tổng tiền",
                    "Trạng thái",
                    "Thời gian"
                  ].map((h, i) => (
                    <th
                      key={i}
                      className={`px-4 py-3 text-[11px] font-bold uppercase tracking-wider ${i === 4 ? "text-right pr-8" : ""} ${i === 0 ? "text-center w-[50px]" : ""}`}
                      style={{ color: "var(--text-placeholder)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map((o, idx) => {
                  const statusConfig = getStatusColor(o.status);
                  return (
                    <tr
                      key={o.id}
                      className="group relative hover:bg-gray-50/50 transition-colors cursor-pointer"
                      style={{ borderBottom: "1px solid var(--grid-border)" }}
                    >
                      <td className="px-4 py-3 text-center text-[13px] font-medium" style={{ color: "var(--text-secondary)" }}>
                        {(currentPage - 1) * itemsPerPage + idx + 1}
                      </td>
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
                      {/* Group Buttons Hover (Floating Right) */}
                      <td className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="flex justify-end gap-1.5 bg-white/90 backdrop-blur-sm p-1 rounded-xl shadow-sm border border-gray-100">
                          {/* Luôn hiển thị nút Xem chi tiết */}
                          <Link
                            to={`/owner/orders/${o.id}`}
                            className="h-8 px-2.5 rounded-lg flex items-center justify-center transition cursor-pointer hover:bg-gray-100 gap-1.5 text-[12px] font-bold"
                            style={{ color: "var(--text-secondary)" }}
                            title="Xem chi tiết"
                          >
                            <Eye size={14} /> Xem
                          </Link>

                          {/* Báo giá — chỉ hiện khi Chờ báo giá */}
                          {o.status === "Chờ báo giá" && (
                            <Link
                              to={`/owner/orders/${o.id}`}
                              className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-[12px] font-bold transition cursor-pointer hover:opacity-80"
                              style={{
                                backgroundColor: "#FFFBEB",
                                color: "#B45309",
                                border: "1px solid #FDE68A",
                              }}
                              title="Báo giá"
                            >
                              <FileText size={14} /> Báo giá
                            </Link>
                          )}

                          {/* Duyệt sản xuất — chỉ hiện khi Xác nhận đơn hàng (Đặt theo mẫu) */}
                          {o.status === "Xác nhận đơn hàng" && o.type === "Đặt theo mẫu" && (
                            <Link
                              to={`/owner/orders/${o.id}`}
                              className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-[12px] font-bold transition cursor-pointer hover:opacity-80 shadow-sm"
                              style={{
                                backgroundColor: "#EFF6FF",
                                color: "#1D4ED8",
                                border: "1px solid #BFDBFE",
                              }}
                              title="Duyệt sản xuất"
                            >
                              <Hammer size={14} /> Duyệt SX
                            </Link>
                          )}

                          {/* Duyệt hủy — chỉ hiện khi Chờ duyệt hủy */}
                          {o.status === "Chờ duyệt hủy" && (
                            <Link
                              to={`/owner/orders/${o.id}`}
                              className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-[12px] font-bold transition cursor-pointer hover:opacity-80"
                              style={{
                                backgroundColor: "#FEF2F2",
                                color: "#DC2626",
                                border: "1px solid #FECACA",
                              }}
                              title="Duyệt hủy đơn"
                            >
                              <XCircle size={14} /> Duyệt hủy
                            </Link>
                          )}
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
    </>
  );
}
