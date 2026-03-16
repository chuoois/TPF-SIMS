

import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
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
  Clock,
  CheckCircle,
  RefreshCw,
  Camera,
} from "lucide-react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import toast from "react-hot-toast";


const INITIAL_ORDERS = [
  // ========== NHÓM 1: HÀNG SẴN (6 trạng thái) ==========
  {
    id: "DH-S01", code: "DH-SAN-001", customerName: "Nguyễn Văn Hùng", phone: "0912345678",
    type: "Hàng sẵn", total: 12500000, status: "Chờ xử lý",
    date: "2026-03-12T08:30:00", salesPerson: "Bình Nguyễn", deliveryDate: "2026-03-14"
  },
  {
    id: "DH-S02", code: "DH-SAN-002", customerName: "Lê Thị Lan", phone: "0345678901",
    type: "Hàng sẵn", total: 3500000, status: "Chờ giao hàng",
    date: "2026-03-11T14:20:00", salesPerson: "Bình Nguyễn", deliveryDate: "2026-03-12"
  },
  {
    id: "DH-S03", code: "DH-SAN-003", customerName: "Trần Minh Quang", phone: "0909123456",
    type: "Hàng sẵn", total: 45000000, status: "Đang giao hàng",
    date: "2026-03-10T09:15:00", salesPerson: "Bình Nguyễn", deliveryDate: "2026-03-11"
  },
  {
    id: "DH-S04", code: "DH-SAN-004", customerName: "Phạm Thành Nam", phone: "0987654321",
    type: "Hàng sẵn", total: 8900000, status: "Hoàn thành",
    date: "2026-03-09T16:45:00", salesPerson: "Bình Nguyễn", deliveryDate: "2026-03-10"
  },
  {
    id: "DH-S05", code: "DH-SAN-005", customerName: "Đinh Công Vinh", phone: "0944556677",
    type: "Hàng sẵn", total: 2100000, status: "Chờ duyệt hủy",
    date: "2026-03-11T10:00:00", salesPerson: "Bình Nguyễn", deliveryDate: "2026-03-13",
    cancelReason: "Khách đổi ý"
  },
  {
    id: "DH-S06", code: "DH-SAN-006", customerName: "Võ Thị Bảy", phone: "0966778899",
    type: "Hàng sẵn", total: 1500000, status: "Đã hủy",
    date: "2026-03-08T10:00:00", salesPerson: "Bình Nguyễn", deliveryDate: "2026-03-09",
  },

  // ========== NHÓM 2: HÀNG THÔ (8 trạng thái) ==========
  {
    id: "DH-T01", code: "DH-THO-001", customerName: "Hoàng Nguyệt Ánh", phone: "0978901234",
    type: "Hàng thô", total: 56000000, status: "Chờ xử lý",
    date: "2026-03-12T10:00:00", salesPerson: "Bình Nguyễn", deliveryDate: "2026-03-20"
  },
  {
    id: "DH-T02", code: "DH-THO-002", customerName: "Đặng Tuấn Kiệt", phone: "0931234567",
    type: "Hàng thô", total: 8200000, status: "Đang gia công",
    date: "2026-03-11T15:30:00", salesPerson: "Bình Nguyễn", deliveryDate: "2026-03-15"
  },
  {
    id: "DH-T03", code: "DH-THO-003", customerName: "Vũ Hải Đăng", phone: "0922334455",
    type: "Hàng thô", total: 12500000, status: "Đang sản xuất",
    date: "2026-03-10T08:00:00", salesPerson: "Bình Nguyễn", deliveryDate: "2026-03-14"
  },
  {
    id: "DH-T04", code: "DH-THO-004", customerName: "Bùi Tiến Dũng", phone: "0911223344",
    type: "Hàng thô", total: 28000000, status: "Chờ giao hàng",
    date: "2026-03-09T11:20:00", salesPerson: "Bình Nguyễn", deliveryDate: "2026-03-12"
  },
  {
    id: "DH-T05", code: "DH-THO-005", customerName: "Đinh Công Thành", phone: "0988776655",
    type: "Hàng thô", total: 15400000, status: "Đang giao hàng",
    date: "2026-03-08T14:45:00", salesPerson: "Bình Nguyễn", deliveryDate: "2026-03-10"
  },
  {
    id: "DH-T06", code: "DH-THO-006", customerName: "Trần Anh Tú", phone: "0900112233",
    type: "Hàng thô", total: 32000000, status: "Hoàn thành",
    date: "2026-03-07T09:00:00", salesPerson: "Bình Nguyễn", deliveryDate: "2026-03-09"
  },
  {
    id: "DH-T07", code: "DH-THO-007", customerName: "Lý Quí Chung", phone: "0933445566",
    type: "Hàng thô", total: 18000000, status: "Chờ duyệt hủy",
    date: "2026-03-11T09:00:00", salesPerson: "Bình Nguyễn", deliveryDate: "2026-03-15",
    cancelReason: "Mua nhầm hàng"
  },
  {
    id: "DH-T08", code: "DH-THO-008", customerName: "Nguyễn Kim Ngân", phone: "0977889900",
    type: "Hàng thô", total: 9000000, status: "Đã hủy",
    date: "2026-03-05T09:00:00", salesPerson: "Bình Nguyễn", deliveryDate: "2026-03-08"
  },

  // ========== NHÓM 3: HÀNG ĐẶT (12 trạng thái) ==========
  {
    id: "DH-D01", code: "DH-DAT-001", customerName: "Nguyễn Thị Hồng", phone: "0912123123",
    type: "Hàng đặt", total: 75000000, status: "Đang gia công",
    date: "2026-03-12T11:15:00", salesPerson: "Bình Nguyễn", deliveryDate: "2026-03-30"
  },
  {
    id: "DH-D02", code: "DH-DAT-002", customerName: "Lê Văn Tám", phone: "0321654987",
    type: "Hàng đặt", total: 120000000, status: "Đang gia công",
    date: "2026-03-11T09:00:00", salesPerson: "Bình Nguyễn", deliveryDate: "2026-03-25"
  },
  {
    id: "DH-D03", code: "DH-DAT-003", customerName: "Phan Văn Trị", phone: "0944123123",
    type: "Hàng đặt", total: 45000000, status: "Đang gia công",
    date: "2026-03-10T10:15:00", salesPerson: "Bình Nguyễn", deliveryDate: "2026-03-28"
  },
  {
    id: "DH-D04", code: "DH-DAT-004", customerName: "Hoàng Thanh Sơn", phone: "0988123123",
    type: "Hàng đặt", total: 95000000, status: "Chờ giao hàng",
    date: "2026-03-09T14:20:00", salesPerson: "Bình Nguyễn", deliveryDate: "2026-03-22"
  },
  {
    id: "DH-D05", code: "DH-DAT-005", customerName: "Lưu Bích Thủy", phone: "0909123123",
    type: "Hàng đặt", total: 34000000, status: "Đang giao hàng",
    date: "2026-03-08T11:00:00", salesPerson: "Bình Nguyễn", deliveryDate: "2026-03-20"
  },
  {
    id: "DH-D06", code: "DH-DAT-006", customerName: "Trương Vô Kỵ", phone: "0977123123",
    type: "Hàng đặt", total: 210000000, status: "Hoàn thành",
    date: "2026-03-05T08:30:00", salesPerson: "Bình Nguyễn", deliveryDate: "2026-03-15"
  },
  {
    id: "DH-D07", code: "DH-DAT-007", customerName: "Triệu Mẫn", phone: "0911123123",
    type: "Hàng đặt", total: 85000000, status: "Chờ duyệt hủy",
    date: "2026-03-11T13:45:00", salesPerson: "Bình Nguyễn", deliveryDate: "2026-03-26",
    cancelReason: "Khách đổi kích thước nhà"
  },
  {
    id: "DH-D08", code: "DH-DAT-008", customerName: "Chu Chỉ Nhược", phone: "0933123123",
    type: "Hàng đặt", total: 42000000, status: "Đã hủy",
    date: "2026-03-01T10:00:00", salesPerson: "Bình Nguyễn", deliveryDate: "2026-03-10"
  },
  {
    id: "DH-D09", code: "DH-DAT-009", customerName: "Vũ Phương Thảo", phone: "0944000111",
    type: "Hàng đặt", total: 15600000, status: "Chờ sản xuất",
    date: "2026-03-12T16:30:00", salesPerson: "Bình Nguyễn", deliveryDate: "2026-03-20"
  },
  {
    id: "DH-D10", code: "DH-DAT-010", customerName: "Đỗ Minh Quân", phone: "0944222333",
    type: "Hàng đặt", total: 32000000, status: "Chờ sản xuất",
    date: "2026-03-13T09:00:00", salesPerson: "Bình Nguyễn", deliveryDate: "2026-03-25"
  },
  {
    id: "DH-D11", code: "DH-DAT-011", customerName: "Phạm Gia Bảo", phone: "0944444555",
    type: "Hàng đặt", total: 8500000, status: "Chờ sản xuất",
    date: "2026-03-14T10:15:00", salesPerson: "Bình Nguyễn", deliveryDate: "2026-03-28"
  },
  {
    id: "DH-D12", code: "DH-DAT-012", customerName: "Nguyễn Anh Tuấn", phone: "0944666777",
    type: "Hàng đặt", total: 112000000, status: "Đang gia công",
    date: "2026-03-15T14:20:00", salesPerson: "Bình Nguyễn", deliveryDate: "2026-03-30"
  },
];

const ORDER_TYPES = ["Hàng sẵn", "Hàng thô", "Hàng đặt"];

const HANG_SAN_STATUSES = [
  "Chờ xử lý",
  "Chờ giao hàng",
  "Đang giao hàng",
  "Hoàn thành",
  "Chờ duyệt hủy",
  "Đã hủy",
];

const HANG_THO_STATUSES = [
  "Chờ xử lý",
  "Đang gia công",
  "Chờ giao hàng",
  "Đang giao hàng",
  "Hoàn thành",
  "Chờ duyệt hủy",
  "Đã hủy",
];

const HANG_DAT_STATUSES = [
  "Chờ sản xuất",
  "Đang gia công",
  "Đã nhập kho",
  "Chờ giao hàng",
  "Đang giao hàng",
  "Hoàn thành",
  "Chờ duyệt hủy",
  "Đã hủy",
];

const ALL_STATUSES = [
  ...new Set([
    ...HANG_SAN_STATUSES,
    ...HANG_THO_STATUSES,
    ...HANG_DAT_STATUSES,
  ]),
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
    case "Chờ xử lý":
      return { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" }; // Blue
    case "Đang xử lý":
      return { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" }; // Orange
    case "Chờ sản xuất":
      return { bg: "#FEF3C7", text: "#B45309", border: "#FDE68A" }; // Amber/Dark
    case "Đã nhập kho":
      return { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" }; // Green
    case "Đang sản xuất":
    case "Đang gia công":
      return { bg: "#FEF3C7", text: "#D97706", border: "#FDE68A" }; // Amber
    case "Chờ giao hàng":
      return { bg: "#F5F3FF", text: "#7C3AED", border: "#DDD6FE" }; // Purple
    case "Đang giao hàng":
      return { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" }; // Deep Blue
    case "Hoàn thành":
      return { bg: "#F0FDF4", text: "#166534", border: "#BBF7D0" }; // Green
    case "Chờ duyệt hủy":
      return { bg: "#FEF3C7", text: "#D97706", border: "#FDE68A" }; // Amber/Yellow
    case "Đã hủy":
      return { bg: "#FEF2F2", text: "#B91C1C", border: "#FECACA" }; // Red

    default:
      return { bg: "var(--bg-main)", text: "var(--text-secondary)", border: "var(--grid-border)" };
  }
};


// ===================== COMPONENT =====================
export default function OwnerOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState(() => {
    const saved = JSON.parse(localStorage.getItem("tpf_simulated_orders") || "[]");
    return [...saved, ...INITIAL_ORDERS];
  });
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

  // Logic cập nhật trạng thái đơn hàng (Simulated)
  const handleUpdateStatus = (id, newStatus) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    
    // Đồng bộ lại localStorage nếu là hàng giả lập
    const saved = JSON.parse(localStorage.getItem("tpf_simulated_orders") || "[]");
    const updatedSaved = saved.map(o => o.id === id ? { ...o, status: newStatus } : o);
    localStorage.setItem("tpf_simulated_orders", JSON.stringify(updatedSaved));

    toast.success(`Đã cập nhật trạng thái đơn hàng sang: ${newStatus}`);
  };

  const handleDeliveryUpload = (id, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: "Giao hàng thành công", deliveryImage: reader.result } : o));
        
        const saved = JSON.parse(localStorage.getItem("tpf_simulated_orders") || "[]");
        const updatedSaved = saved.map(o => o.id === id ? { ...o, status: "Giao hàng thành công", deliveryImage: reader.result } : o);
        localStorage.setItem("tpf_simulated_orders", JSON.stringify(updatedSaved));

        toast.success("Đã tải ảnh giao hàng và hoàn tất đơn!");
        setStatusFilter("Giao hàng thành công"); // Tự động chuyển tab filter
      };
      reader.readAsDataURL(file);
    }
  };

  // Filter & Search
  const filtered = useMemo(() => {
    let result = orders;

    // Filter by type (Tab)
    if (activeTab !== "Tất cả") {
      result = result.filter((o) => o.type === activeTab);
    }

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

    // Search (Unified)
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (o) =>
          o.customerName.toLowerCase().includes(q) ||
          o.phone.includes(q) ||
          o.code.toLowerCase().includes(q) ||
          o.salesPerson?.toLowerCase().includes(q)
      );
    }

    return result.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [orders, activeTab, searchTerm, statusFilter, dateFrom, dateTo]);

  const { possibleStatuses, statusCounts } = useMemo(() => {
    let baseOrders = orders;
    if (activeTab !== "Tất cả") {
      baseOrders = baseOrders.filter(o => o.type === activeTab);
    }
    
    let statuses = [];
    if (activeTab === "Hàng sẵn") statuses = HANG_SAN_STATUSES;
    else if (activeTab === "Hàng thô") statuses = HANG_THO_STATUSES;
    else if (activeTab === "Hàng đặt") statuses = HANG_DAT_STATUSES;
    else statuses = ALL_STATUSES;

    const counts = { "Tất cả": baseOrders.length };
    statuses.forEach(s => {
      counts[s] = baseOrders.filter(o => o.status === s).length;
    });
    
    return { possibleStatuses: ["Tất cả", ...statuses], statusCounts: counts };
  }, [orders, activeTab]);

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

        {/* Status Pills Filter */}
        <div className="flex items-center gap-2 shrink-0 px-1 flex-wrap">
          {possibleStatuses.map((s) => {
            const isActive = statusFilter === s;
            const sc = s !== "Tất cả" ? getStatusColor(s) : null;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className="px-4 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer flex items-center gap-2 border"
                style={{
                  backgroundColor: isActive
                    ? (sc ? sc.bg : "#fff")
                    : "transparent",
                  color: isActive
                    ? (sc ? sc.text : "var(--brand-primary)")
                    : "var(--text-secondary)",
                  borderColor: isActive
                    ? (sc ? sc.border : "var(--grid-border)")
                    : "transparent",
                  boxShadow: isActive ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
                }}
              >
                {s !== "Tất cả" && (
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor: sc ? sc.text : "var(--brand-primary)",
                    }}
                  />
                )}
                {s}
                <span className="text-[10px] opacity-60 bg-black/5 px-1.5 rounded-md ml-0.5">
                  {statusCounts[s] || 0}
                </span>
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
          {/* Search Header */}
          <div
            className="px-4 py-3 shrink-0 flex flex-wrap items-center justify-between gap-4"
            style={{
              backgroundColor: "var(--grid-header-bg)",
              borderBottom: "1px solid var(--grid-border)",
            }}
          >
            <div className="flex items-center gap-4 flex-1 min-w-[300px]">
              {/* Search */}
              <div className="relative flex-1 max-w-sm">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-placeholder)" }}
                />
                <input
                  type="text"
                  placeholder="Mã đơn, khách hàng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-9 pl-10 pr-8 rounded-lg text-[13px] border focus:outline-none focus:ring-1 transition"
                  style={{
                    borderColor: "var(--grid-border)",
                    backgroundColor: "#fff",
                    color: "var(--text-main)",
                  }}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full cursor-pointer"
                  >
                    <X size={14} style={{ color: "var(--text-placeholder)" }} />
                  </button>
                )}
              </div>

              {/* Date Filter */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Calendar
                    size={14}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--text-placeholder)" }}
                  />
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="h-9 pl-9 pr-3 rounded-lg text-[13px] border focus:outline-none shadow-xs"
                    style={{
                      borderColor: dateFrom
                        ? "var(--brand-primary)"
                        : "var(--grid-border)",
                      backgroundColor: "#fff",
                      color: "var(--text-main)",
                    }}
                  />
                </div>
                <span className="text-gray-400 text-xs font-bold">~</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-9 px-3 rounded-lg text-[13px] border focus:outline-none shadow-xs"
                  style={{
                    borderColor: dateTo
                      ? "var(--brand-primary)"
                      : "var(--grid-border)",
                    backgroundColor: "#fff",
                    color: "var(--text-main)",
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="h-9 px-3 rounded-lg text-[12px] font-bold text-red-600 hover:bg-red-50 transition border border-transparent hover:border-red-100 cursor-pointer"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          </div>
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
                    "Hình thức giao",
                    "Ngày giao dự kiến",
                    "Ảnh giao hàng"
                  ].map((h, i) => (
                    <th
                      key={i}
                      className={`px-4 py-3 text-[11px] font-bold uppercase tracking-wider ${i === 4 ? "text-right pr-6" : ""} ${i === 0 ? "text-center w-[50px]" : ""} ${i >= 7 && i < 9 ? "text-center whitespace-nowrap" : ""}`}
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
                        <div className="flex flex-col gap-1.5">
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
                            {o.status === "Đã nhập kho" && o.type === "Hàng đặt" ? "Đã nhập kho (Duyệt mộc)" : o.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[12px] font-medium text-gray-500">
                          {o.fulfillmentType || "Chưa xác định"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5 text-gray-600">
                          <Clock size={12} className="text-gray-400" />
                          <span className="text-[13px] font-bold">
                            {o.deliveryDate ? new Date(o.deliveryDate).toLocaleDateString("vi-VN") : "---"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {o.deliveryImage ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toast.success("Đang mở ảnh bàn giao cho đơn " + o.code);
                            }}
                            className="w-10 h-10 rounded-lg overflow-hidden border border-green-200 hover:ring-2 ring-green-400 transition cursor-pointer mx-auto block"
                          >
                            <img src={o.deliveryImage} alt="delivery" className="w-full h-full object-cover" />
                          </button>
                        ) : (
                          <p className="text-[11px] text-gray-300 italic">Chưa có ảnh</p>
                        )}

                        {/* ===================== HOVER ACTIONS AREA ===================== */}
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 translate-x-4 group-hover:translate-x-0 z-20">
                          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-2xl shadow-indigo-200/50">
                            
                            {/* OWNER ACTIONS - CONTEXTUAL BY TYPE & STATUS */}
                            
                            {/* HOÀN TOÀN CHUNG */}
                            {o.status === "Chờ duyệt hủy" && (
                              <>
                                <button
                                  onClick={(e) => { e.stopPropagation(); toast.success("Đã duyệt hủy đơn hàng."); }}
                                  className="h-9 px-4 rounded-xl bg-red-500 text-white text-[12px] font-black hover:bg-red-600 transition-all shadow-lg shadow-red-100 flex items-center gap-2 active:scale-95"
                                >
                                  <XCircle size={16} /> DUYỆT HỦY
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); toast.error("Đã từ chối yêu cầu hủy."); }}
                                  className="h-9 px-4 rounded-xl bg-slate-100 text-slate-600 text-[12px] font-bold hover:bg-slate-200 transition-all active:scale-95"
                                >
                                  TỪ CHỐI
                                </button>
                              </>
                            )}

                            {/* FLOW THEO LOẠI HÀNG */}
                            {o.type === "Hàng sẵn" ? (
                              <>
                                {o.status === "Chờ xử lý" && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if(window.confirm("Xác nhận đơn hàng và chuẩn bị giao hàng?")) {
                                        handleUpdateStatus(o.id, "Chờ giao hàng");
                                      }
                                    }}
                                    className="h-9 px-4 rounded-xl bg-emerald-600 text-white text-[12px] font-black hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center gap-2 active:scale-95"
                                  >
                                    <CheckCircle size={16} /> XÁC NHẬN ĐƠN
                                  </button>
                                )}
                              </>
                            ) : (
                              <>
                                {/* HÀNG THÔ VÀ ĐẶT */}
                                
                                {o.status === "Chờ xử lý" && o.type === "Hàng thô" && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if(window.confirm("Bàn giao đơn hàng này sang Xưởng sản xuất?")) {
                                        handleUpdateStatus(o.id, "Đang gia công");
                                        navigate("/owner/production/LSX007"); // LSX007 is a raw item
                                      }
                                    }}
                                    className="h-9 px-4 rounded-xl bg-indigo-600 text-white text-[12px] font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2 active:scale-95"
                                  >
                                    <Hammer size={16} /> BÀN GIAO SẢN XUẤT
                                  </button>
                                )}

                                {o.status === "Chờ sản xuất" && o.type === "Hàng đặt" && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if(window.confirm("Bàn giao đơn hàng này sang Xưởng sản xuất?")) {
                                        handleUpdateStatus(o.id, "Đang gia công");
                                        navigate("/owner/production/LSX001");
                                      }
                                    }}
                                    className="h-9 px-4 rounded-xl bg-indigo-600 text-white text-[12px] font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2 active:scale-95"
                                  >
                                    <Hammer size={16} /> BÀN GIAO SẢN XUẤT
                                  </button>
                                )}

                                {/* HÀNG ĐẶT: Đang gia công (Mộc) -> Đã nhập kho (Duyệt mộc) */}
                                {o.status === "Đang gia công" && o.type === "Hàng đặt" && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if(window.confirm("Xác nhận sản phẩm đã xong phần mộc và nhập kho để kiểm tra?")) {
                                        handleUpdateStatus(o.id, "Đã nhập kho");
                                      }
                                    }}
                                    className="h-9 px-4 rounded-xl bg-emerald-600 text-white text-[12px] font-black hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center gap-2 active:scale-95"
                                  >
                                    <CheckCircle size={16} /> NHẬP KHO (Xong Mộc)
                                  </button>
                                )}

                                {/* HÀNG ĐẶT: Đã nhập kho (Duyệt mộc) -> Chờ giao hàng (Xong Sơn) */}
                                {o.status === "Đã nhập kho" && o.type === "Hàng đặt" && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if(window.confirm("Xác nhận sản phẩm đã hoàn thiện sơn và sẵn sàng giao hàng?")) {
                                        handleUpdateStatus(o.id, "Chờ giao hàng");
                                      }
                                    }}
                                    className="h-9 px-4 rounded-xl bg-indigo-600 text-white text-[12px] font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2 active:scale-95"
                                  >
                                    <CheckCircle size={16} /> HOÀN THIỆN SƠN
                                  </button>
                                )}

                                {(o.status === "Đang sản xuất" || o.status === "Đang gia công") && (
                                   <div className="flex flex-col items-center">
                                      <div className="text-[10px] text-indigo-600 font-bold uppercase tracking-tight">Đang sản xuất...</div>
                                      <div className="text-[9px] text-gray-400 italic mt-0.5">Xử lý tại mục Sản xuất</div>
                                   </div>
                                )}
                              </>
                            )}

                            {/* CHUNG PHẦN GIAO VẬN */}
                            {o.status === "Chờ giao hàng" && (
                              <button
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  handleUpdateStatus(o.id, "Đang giao hàng");
                                }}
                                className="h-9 px-4 rounded-xl bg-blue-600 text-white text-[12px] font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2 active:scale-95"
                              >
                                <RefreshCw size={16} /> BẮT ĐẦU GIAO
                              </button>
                            )}

                            {o.status === "Đang giao hàng" && (
                              <label
                                className="h-9 px-4 rounded-xl bg-emerald-600 text-white text-[12px] font-black hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center gap-2 cursor-pointer active:scale-95"
                              >
                                <Camera size={16} /> TẢI ẢNH & HOÀN TẤT
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  className="hidden" 
                                  onChange={(e) => handleDeliveryUpload(o.id, e)} 
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </label>
                            )}

                            <Link
                              to={`/owner/orders/${o.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="h-9 px-4 rounded-xl bg-white border border-slate-200 text-slate-600 text-[12px] font-black hover:bg-slate-50 transition-all flex items-center gap-2 active:scale-95"
                            >
                              <Eye size={16} /> XEM CHI TIẾT
                            </Link>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {paginatedOrders.length === 0 && (
                  <tr>
                    <td colSpan="9" className="py-24 text-center">
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
      {/* Modal Selection đã được gỡ bỏ để tránh chồng chéo logic với màn hình Sản xuất */}
    </>
  );
}
