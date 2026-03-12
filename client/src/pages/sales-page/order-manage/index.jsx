/**
 * Component SalesOrderManage
 * Quản lý Đơn hàng — Nhân viên bán hàng (Chỉ xem + Gửi yêu cầu hủy)
 *
 * Created Date: 05/03/2026
 * Updated Date: 07/03/2026
 */

import { useState, useMemo, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Users,
  Eye,
  Package,
  Calendar,
  XCircle,
  X,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Printer,
} from "lucide-react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import { MOCK_ORDERS_DETAIL, PrintableInvoice } from "./detail";

// ===================== STATIC DATA =====================
export const INITIAL_ORDERS = [
  // ========== HÀNG SẴN ==========
  {
    id: "DH002",
    code: "DH-2603-0009",
    customerName: "Đinh Quang Hiếu",
    phone: "0989012345",
    type: "Hàng sẵn",
    total: 1200000,
    status: "Giao hàng thành công",
    date: "2026-03-05T13:20:00",
  },
  {
    id: "DH003",
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
    total: 95000000,
    status: "Chờ báo giá",
    date: "2026-03-05T16:05:00",
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

// Trạng thái cho phép gửi yêu cầu hủy (sale chỉ được gửi khi đơn chưa hoàn thành / chưa hủy / chưa gửi hủy rồi)
const CANCELLABLE_STATUSES = [
  "Chờ xử lý",
  "Đang chuẩn bị",
  "Chờ báo giá",
  "Đã báo giá",
  "Chờ xác nhận",
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
      return {
        bg: "var(--status-focus)",
        text: "var(--status-success)",
        border: "var(--brand-primary)",
      };

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
      return {
        bg: "var(--bg-main)",
        text: "var(--text-secondary)",
        border: "var(--grid-border)",
      };
  }
};

// ===================== COMPONENT =====================
export default function SalesOrderManage() {
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("Hàng sẵn");
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [selectedOrders, setSelectedOrders] = useState([]);

  // Print
  const printRef = useRef(null);
  const [printingOrders, setPrintingOrders] = useState([]); // Array instead of single order

  useEffect(() => {
    if (printingOrders.length > 0 && printRef.current) {
      const content = printRef.current;
      const printWindow = window.open("", "_blank", "width=900,height=700");
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>In hóa đơn</title>
            <style>
              @page { size: A4; margin: 15mm; }
              body { margin: 0; padding: 0; }
              .page-break { page-break-after: always; }
              .page-break:last-child { page-break-after: auto; }
            </style>
          </head>
          <body>${content.innerHTML}</body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          setPrintingOrders([]);
          setSelectedOrders([]); // Clear selection after print
        }, 500); // Increased timeout slightly for multiple images/pages
      } else {
        setPrintingOrders([]);
      }
    }
  }, [printingOrders]);

  const prepOrderForPrint = (o) => {
    const fullOrder = MOCK_ORDERS_DETAIL[o.id] || {
      ...MOCK_ORDERS_DETAIL["DH008"],
      code: o.code,
      customer: {
        name: o.customerName,
        phone: o.phone,
        address: "Đang cập nhật...",
      },
      total: o.total,
      deposit: null,
      status: o.status,
      type: o.type,
      date: o.date,
    };
    fullOrder.displayTotal =
      fullOrder.total != null
        ? fullOrder.total
        : fullOrder.products?.reduce(
            (acc, p) => acc + (p.price || 0) * p.qty,
            0,
          ) || 0;
    return fullOrder;
  };

  const handlePrintClick = (e, o) => {
    e.stopPropagation();
    setPrintingOrders([prepOrderForPrint(o)]);
  };

  const handleBatchPrint = () => {
    if (selectedOrders.length === 0) return;
    const ordersToPrint = orders
      .filter((o) => selectedOrders.includes(o.id))
      .map(prepOrderForPrint);
    setPrintingOrders(ordersToPrint);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedOrders(paginatedOrders.map((o) => o.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOrder = (e, id) => {
    e.stopPropagation();
    if (e.target.checked) {
      setSelectedOrders((prev) => [...prev, id]);
    } else {
      setSelectedOrders((prev) => prev.filter((orderId) => orderId !== id));
    }
  };

  // Cancel request modal
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelSuccess, setCancelSuccess] = useState(false);

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

  const hasActiveFilters =
    statusFilter !== "Tất cả" || dateFrom || dateTo || searchTerm;

  const clearAllFilters = () => {
    setStatusFilter("Tất cả");
    setDateFrom("");
    setDateTo("");
    setSearchTerm("");
  };

  // Reset status filter when switching tabs
  useEffect(() => {
    setStatusFilter("Tất cả");
    setDateFrom("");
    setDateTo("");
    setSearchTerm("");
  }, [activeTab]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
    setSelectedOrders([]);
  }, [searchTerm, activeTab, statusFilter, dateFrom, dateTo]);

  useEffect(() => {
    setSelectedOrders([]);
  }, [currentPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedOrders = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Handle cancel request submit
  const handleCancelSubmit = () => {
    if (!cancelTarget || !cancelReason.trim()) return;
    setOrders((prev) =>
      prev.map((o) =>
        o.id === cancelTarget.id ? { ...o, status: "Chờ duyệt hủy" } : o,
      ),
    );
    setCancelSuccess(true);
    setTimeout(() => {
      setCancelTarget(null);
      setCancelReason("");
      setCancelSuccess(false);
    }, 1500);
  };

  // ===================== RENDER =====================
  return (
    <>
      <PageHelmet title="Quản lý đơn hàng - Nhân viên | TPF-SIMS" />

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
        <div className="flex items-center gap-2 shrink-0 px-1 flex-wrap">
          {(activeTab === "Hàng sẵn"
            ? HANG_SAN_STATUSES
            : DAT_THEO_MAU_STATUSES
          ).map((s) => {
            const isActive = statusFilter === s;
            const statusStyle = s !== "Tất cả" ? getStatusColor(s) : null;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
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
        {/* Batch Print Action Bar - ALWAYS VISIBLE ALONGSIDE FILTERS */}
        <div className="flex items-center justify-between bg-[#F0FDF4] border border-[#BBF7D0] px-4 py-2.5 rounded-xl mb-4 mt-2 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#166534] text-white text-[11px] font-bold">
              {selectedOrders.length}
            </span>
            <span
              className="text-[13px] font-bold"
              style={{ color: "#14532D" }}
            >
              đơn hàng được chọn
            </span>
          </div>
          <div className="flex items-center gap-2">
            {selectedOrders.length > 0 && (
              <button
                onClick={() => setSelectedOrders([])}
                className="px-3 py-1.5 rounded-lg text-[12px] font-bold cursor-pointer transition hover:bg-[#DCFCE7]"
                style={{ color: "#166534" }}
              >
                Hủy chọn
              </button>
            )}
            <button
              onClick={handleBatchPrint}
              disabled={selectedOrders.length === 0}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[12px] font-bold transition shadow-sm ${
                selectedOrders.length > 0
                  ? "text-white hover:opacity-90 cursor-pointer"
                  : "text-gray-400 bg-gray-100 cursor-not-allowed border outline-none"
              }`}
              style={
                selectedOrders.length > 0
                  ? { backgroundColor: "var(--brand-primary)" }
                  : {}
              }
            >
              <Printer size={14} />
              In hóa đơn
            </button>
          </div>
        </div>{" "}
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
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary cursor-pointer w-4 h-4"
                      checked={
                        paginatedOrders.length > 0 &&
                        selectedOrders.length === paginatedOrders.length
                      }
                      onChange={handleSelectAll}
                    />
                  </th>
                  {[
                    "Mã đơn",
                    "Khách hàng",
                    "Loại đơn",
                    "Tổng tiền",
                    "Trạng thái",
                    "Thời gian",
                  ].map((h, i) => (
                    <th
                      key={i}
                      className={`px-4 py-3 text-[11px] font-bold uppercase tracking-wider ${i === 3 ? "text-right pr-8" : ""}`}
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
                  const canCancel = CANCELLABLE_STATUSES.includes(o.status);
                  return (
                    <tr
                      key={o.id}
                      className={`group relative transition-colors cursor-pointer ${
                        selectedOrders.includes(o.id)
                          ? "bg-[#F0FDF4]"
                          : "hover:bg-gray-50/50"
                      }`}
                      style={{ borderBottom: "1px solid var(--grid-border)" }}
                      onClick={() => {
                        if (selectedOrders.includes(o.id)) {
                          setSelectedOrders((prev) =>
                            prev.filter((id) => id !== o.id),
                          );
                        } else {
                          setSelectedOrders((prev) => [...prev, o.id]);
                        }
                      }}
                    >
                      <td
                        className="px-4 py-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary cursor-pointer w-4 h-4"
                          checked={selectedOrders.includes(o.id)}
                          onChange={(e) => handleSelectOrder(e, o.id)}
                        />
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
                          {/* Xem chi tiết */}
                          <Link
                            to={`/sales/dashboard/orders/${o.id}`}
                            className="h-8 px-2.5 rounded-lg flex items-center justify-center transition cursor-pointer hover:bg-gray-100 gap-1.5 text-[12px] font-bold"
                            style={{ color: "var(--text-secondary)" }}
                            title="Xem chi tiết"
                          >
                            <Eye size={14} /> Xem
                          </Link>

                          {/* Gửi yêu cầu hủy — chỉ hiện khi trạng thái cho phép */}
                          {canCancel && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setCancelTarget(o);
                                setCancelReason("");
                                setCancelSuccess(false);
                              }}
                              className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-[12px] font-bold transition cursor-pointer hover:opacity-80"
                              style={{
                                backgroundColor: "#FEF2F2",
                                color: "#DC2626",
                                border: "1px solid #FECACA",
                              }}
                              title="Gửi yêu cầu hủy đơn"
                            >
                              <XCircle size={14} /> Yêu cầu hủy
                            </button>
                          )}

                          {/* Đã gửi yêu cầu hủy */}
                          {o.status === "Chờ duyệt hủy" && (
                            <span
                              className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-[12px] font-bold"
                              style={{
                                backgroundColor: "#FEF3C7",
                                color: "#D97706",
                                border: "1px solid #FDE68A",
                              }}
                            >
                              <AlertTriangle size={14} /> Chờ duyệt hủy
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {paginatedOrders.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-24 text-center">
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

      {/* ════════════ MODAL: GỬI YÊU CẦU HỦY ════════════ */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col"
            style={{ border: "1px solid var(--grid-border)" }}
          >
            {cancelSuccess ? (
              /* ── Success State ── */
              <div className="p-8 flex flex-col items-center text-center gap-3">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{
                    background: "var(--status-focus)",
                  }}
                >
                  <CheckCircle2
                    size={28}
                    style={{ color: "var(--status-success)" }}
                  />
                </div>
                <h3
                  className="text-[16px] font-bold"
                  style={{ color: "var(--text-main)" }}
                >
                  Đã gửi yêu cầu hủy
                </h3>
                <p
                  className="text-[13px]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Đơn hàng <strong>{cancelTarget.code}</strong> đã chuyển sang
                  trạng thái "Chờ duyệt hủy". Chủ cửa hàng sẽ xem xét yêu cầu
                  của bạn.
                </p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div
                  className="px-6 py-4 flex items-center justify-between"
                  style={{ borderBottom: "1px solid var(--grid-border)" }}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{
                        background: "#FEF2F2",
                      }}
                    >
                      <XCircle size={18} style={{ color: "#DC2626" }} />
                    </div>
                    <div>
                      <h3
                        className="text-[15px] font-bold"
                        style={{ color: "var(--text-main)" }}
                      >
                        Gửi yêu cầu hủy đơn
                      </h3>
                      <p
                        className="text-[12px] font-medium"
                        style={{ color: "var(--text-placeholder)" }}
                      >
                        {cancelTarget.code} · {cancelTarget.customerName}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setCancelTarget(null)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <X size={18} style={{ color: "var(--text-secondary)" }} />
                  </button>
                </div>

                {/* Body */}
                <div className="p-6 flex flex-col gap-4">
                  <div
                    className="p-3.5 rounded-xl flex gap-2.5 text-[13px]"
                    style={{
                      background: "#FFFBEB",
                      border: "1px solid #FDE68A",
                      color: "#92400E",
                    }}
                  >
                    <AlertTriangle className="shrink-0 mt-0.5" size={15} />
                    <span>
                      Yêu cầu hủy sẽ được gửi đến Chủ cửa hàng để duyệt. Đơn
                      hàng sẽ chuyển sang trạng thái "Chờ duyệt hủy" cho đến khi
                      được xử lý.
                    </span>
                  </div>

                  <div>
                    <label
                      className="block text-[13px] font-semibold mb-1.5"
                      style={{ color: "var(--text-main)" }}
                    >
                      Lý do hủy đơn{" "}
                      <span style={{ color: "var(--status-error)" }}>*</span>
                    </label>
                    <textarea
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="Nhập lý do hủy đơn hàng..."
                      rows={3}
                      className="w-full rounded-xl px-4 py-3 text-[13px] focus:outline-none focus:ring-2 transition resize-none"
                      style={{
                        border: "1px solid var(--grid-border)",
                        backgroundColor: "var(--bg-main)",
                        color: "var(--text-main)",
                      }}
                    />
                  </div>
                </div>

                {/* Footer */}
                <div
                  className="px-6 py-4 flex justify-end gap-3"
                  style={{
                    borderTop: "1px solid var(--grid-border)",
                    background: "var(--grid-header-bg)",
                  }}
                >
                  <button
                    onClick={() => setCancelTarget(null)}
                    className="px-4 py-2 rounded-lg text-[13px] font-semibold transition hover:bg-gray-100 cursor-pointer"
                    style={{
                      border: "1px solid var(--grid-border)",
                      color: "var(--text-main)",
                      backgroundColor: "#fff",
                    }}
                  >
                    Hủy bỏ
                  </button>
                  <button
                    onClick={handleCancelSubmit}
                    disabled={!cancelReason.trim()}
                    className="px-4 py-2 rounded-lg text-[13px] font-semibold text-white flex items-center gap-2 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: "#DC2626",
                    }}
                  >
                    <XCircle size={15} /> Gửi yêu cầu hủy
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Hidden printable invoice */}
      {printingOrders.length > 0 && (
        <div
          ref={printRef}
          style={{
            position: "absolute",
            left: "-9999px",
            top: 0,
            width: "800px",
          }}
        >
          {printingOrders.map((o, idx) => (
            <div key={idx} className="page-break">
              <PrintableInvoice o={o} displayTotal={o.displayTotal} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
