

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
  Banknote,
  CreditCard,
  Wallet,
  Ban,
  Truck,
} from "lucide-react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import toast from "react-hot-toast";


const INITIAL_ORDERS = [
  // ========== NHÓM 1: HÀNG SẴN (6 trạng thái) ==========
  {
    id: "DH-S01", code: "DH-SAN-001", customerName: "Nguyễn Văn Hùng", phone: "0912345678",
    type: "Hàng sẵn", total: 18500000, status: "Chờ xử lý",
    date: "2026-03-12T08:30:00", salesPerson: "Bình Nguyễn", deliveryDate: "2026-03-14",
    deposit: 2000000, fulfillmentType: "Giao hàng"
  },
  {
    id: "DH-S02", code: "DH-SAN-002", customerName: "Lê Thị Lan", phone: "0345678901",
    type: "Hàng sẵn", total: 5200000, status: "Chờ giao hàng",
    date: "2026-03-11T14:20:00", salesPerson: "Bình Nguyễn", deliveryDate: "2026-03-12",
    deposit: 5200000, fulfillmentType: "Lấy ngay"
  },
  {
    id: "DH-S03", code: "DH-SAN-003", customerName: "Trần Minh Quang", phone: "0909123456",
    type: "Hàng sẵn", total: 12800000, status: "Đang giao hàng",
    date: "2026-03-10T09:15:00", salesPerson: "Bình Nguyễn", deliveryDate: "2026-03-11",
    deposit: 5000000, fulfillmentType: "Giao hàng"
  },
  {
    id: "DH-S04", code: "DH-SAN-004", customerName: "Phạm Thành Nam", phone: "0987654321",
    type: "Hàng sẵn", total: 45000000, status: "Hoàn thành",
    date: "2026-03-09T16:45:00", salesPerson: "Bình Nguyễn", deliveryDate: "2026-03-10",
    deposit: 45000000, fulfillmentType: "Giao hàng",
    deliveryImage: "https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "DH-S05", code: "DH-SAN-005", customerName: "Hoàng Văn Thái", phone: "0912000111",
    type: "Hàng sẵn", total: 4200000, status: "Chờ duyệt hủy",
    date: "2026-03-13T10:00:00", salesPerson: "Bình Nguyễn", deliveryDate: "2026-03-15",
    deposit: 1000000, cancelReason: "Khách đổi ý muốn chuyển sang mẫu khác lớn hơn", fulfillmentType: "Giao hàng"
  },
  {
    id: "DH-S06", code: "DH-SAN-006", customerName: "Võ Thị Bảy", phone: "0966778899",
    type: "Hàng sẵn", total: 1500000, status: "Đơn đã hủy",
    date: "2026-03-08T10:00:00", salesPerson: "Bình Nguyễn", deliveryDate: "2026-03-09",
    deposit: 1500000, fulfillmentType: "Lấy ngay tại cửa hàng", depositResolution: "refunded"
  },
  {
    id: "DH-S07", code: "DH-SAN-007", customerName: "Trịnh Thăng Bình", phone: "0945123789",
    type: "Hàng sẵn", total: 15200000, status: "Chờ giao hàng",
    date: "2026-03-14T09:00:00", salesPerson: "Bình Nguyễn", deliveryDate: "2026-03-16",
    deposit: 5000000, fulfillmentType: "Giao hàng"
  },
  {
    id: "DH-S08", code: "DH-SAN-008", customerName: "Nguyễn Cao Kỳ Duyên", phone: "0933998877",
    type: "Hàng sẵn", total: 6800000, status: "Chờ duyệt hủy",
    date: "2026-03-15T08:30:00", salesPerson: "Bình Nguyễn", deliveryDate: "2026-03-17",
    deposit: 2000000, cancelReason: "Khách tìm được mẫu khác phù hợp hơn với không gian", fulfillmentType: "Giao hàng"
  },

  // ========== NHÓM 2: HÀNG MỘC (7 trạng thái) ==========
  {
    id: "DH-T01", code: "DH-THO-001", customerName: "Hoàng Nguyệt Ánh", phone: "0978901234",
    type: "Hàng mộc", total: 56000000, status: "Chờ xử lý",
    date: "2026-03-12T10:00:00", salesPerson: "Bình Nguyễn", deliveryDate: "2026-03-20",
    deposit: 10000000, fulfillmentType: "Giao hàng",
    products: [{
      name: "Sập thờ Tứ Linh", material: "Gỗ mít", size: "197×107×108 (Lỗ Ban)", finish: "Mộc",
      note: "Chân 18 phân\nDạ 5 phân\nĐục Tứ Linh chạm tay kỹ"
    }]
  },
  {
    id: "DH-T11", code: "DH-THO-0011", customerName: "Hoàng Nguyệt Ánh", phone: "0978901234",
    type: "Hàng mộc", total: 56000000, status: "Chờ xử lý",
    date: "2026-03-12T10:00:00", salesPerson: "Bình Nguyễn", deliveryDate: "2026-03-20",
    deposit: 10000000, fulfillmentType: "Giao hàng",
    products: [{
      name: "Sập thờ Tứ Linh", material: "Gỗ mít", size: "197×107×108 (Lỗ Ban)", finish: "Mộc",
      note: "Chân 18 phân\nDạ 5 phân\nĐục Tứ Linh chạm tay kỹ"
    }]
  },
  {
    id: "DH-T02", code: "DH-THO-002", customerName: "Đặng Tuấn Kiệt", phone: "0931234567",
    type: "Hàng mộc", total: 8200000, status: "Đang gia công",
    date: "2026-03-11T15:30:00", salesPerson: "Bình Nguyễn", deliveryDate: "2026-03-15",
    deposit: 2000000, fulfillmentType: "Giao hàng"
  },
  {
    id: "DH-T03", code: "DH-THO-003", customerName: "Vũ Hải Đăng", phone: "0922334455",
    type: "Hàng mộc", total: 12500000, status: "Chờ giao hàng",
    date: "2026-03-10T08:00:00", salesPerson: "Bình Nguyễn", deliveryDate: "2026-03-14",
    deposit: 5000000, fulfillmentType: "Giao hàng"
  },
  {
    id: "DH-T04", code: "DH-THO-004", customerName: "Bùi Tiến Dũng", phone: "0911223344",
    type: "Hàng mộc", total: 28000000, status: "Đang giao hàng",
    date: "2026-03-09T11:20:00", salesPerson: "Bình Nguyễn", deliveryDate: "2026-03-12",
    deposit: 10000000, fulfillmentType: "Giao hàng"
  },
  {
    id: "DH-T05", code: "DH-THO-005", customerName: "Đinh Công Thành", phone: "0988776655",
    type: "Hàng mộc", total: 15400000, status: "Hoàn thành",
    date: "2026-03-08T14:45:00", salesPerson: "Bình Nguyễn", deliveryDate: "2026-03-10",
    deposit: 15400000, fulfillmentType: "Giao hàng",
    deliveryImage: "https://images.unsplash.com/photo-1617806118233-ef203e91122b"
  },
  {
    id: "DH-T06", code: "DH-THO-006", customerName: "Lý Quí Chung", phone: "0933445566",
    type: "Hàng mộc", total: 18000000, status: "Chờ duyệt hủy",
    date: "2026-03-11T09:00:00", salesPerson: "Bình Nguyễn", deliveryDate: "2026-03-15",
    deposit: 2000000, cancelReason: "Mua nhầm hàng", fulfillmentType: "Giao hàng"
  },
  {
    id: "DH-T07", code: "DH-THO-007", customerName: "Nguyễn Kim Ngân", phone: "0977889900",
    type: "Hàng mộc", total: 9000000, status: "Đơn đã hủy",
    date: "2026-03-05T09:00:00", salesPerson: "Bình Nguyễn", deliveryDate: "2026-03-08",
    deposit: 0, fulfillmentType: "Giao hàng"
  },

  // ========== NHÓM 3: HÀNG KHÁCH ĐẶT (8 trạng thái) ==========
  {
    id: "DH-D01", code: "DH-DAT-001", customerName: "Nguyễn Thị Hồng", phone: "0912123123",
    type: "Hàng khách đặt", total: 75000000, status: "Chờ sản xuất",
    date: "2026-03-12T11:15:00", salesPerson: "Bình Nguyễn", deliveryDate: "2026-03-30",
    deposit: 25000000, fulfillmentType: "Giao hàng"
  },
  {
    id: "DH-D02", code: "DH-DAT-002", customerName: "Lê Văn Tám", phone: "0321654987",
    type: "Hàng khách đặt", total: 120000000, status: "Đã nhập kho",
    date: "2026-03-11T09:00:00", salesPerson: "Bình Nguyễn", deliveryDate: "2026-03-25",
    deposit: 40000000, fulfillmentType: "Giao hàng",
    products: [{
      name: "Trường kỷ Sen Vịt", material: "Gỗ Gụ", size: "2m17", finish: "Sơn Lau",
      note: "Vách đục Sen Vịt kỹ\nChân 12 chỉ"
    }]
  },
  {
    id: "DH-D03", code: "DH-DAT-003", customerName: "Phan Văn Trị", phone: "0944123123",
    type: "Hàng khách đặt", total: 45000000, status: "Đang gia công",
    date: "2026-03-10T10:15:00", salesPerson: "Bình Nguyễn", deliveryDate: "2026-03-28",
    deposit: 15000000, fulfillmentType: "Giao hàng"
  },
  {
    id: "DH-D04", code: "DH-DAT-004", customerName: "Hoàng Thanh Sơn", phone: "0988123123",
    type: "Hàng khách đặt", total: 95000000, status: "Chờ giao hàng",
    date: "2026-03-09T14:20:00", salesPerson: "Bình Nguyễn", deliveryDate: "2026-03-22",
    deposit: 30000000, fulfillmentType: "Giao hàng"
  },
  {
    id: "DH-D05", code: "DH-DAT-005", customerName: "Lưu Bích Thủy", phone: "0909123123",
    type: "Hàng khách đặt", total: 34000000, status: "Đang giao hàng",
    date: "2026-03-08T11:00:00", salesPerson: "Bình Nguyễn", deliveryDate: "2026-03-20",
    deposit: 10000000, fulfillmentType: "Giao hàng"
  },
  {
    id: "DH-D06", code: "DH-DAT-006", customerName: "Trương Vô Kỵ", phone: "0977123123",
    type: "Hàng khách đặt", total: 210000000, status: "Hoàn thành",
    date: "2026-03-05T08:30:00", salesPerson: "Bình Nguyễn", deliveryDate: "2026-03-15",
    deposit: 210000000, fulfillmentType: "Giao hàng",
    deliveryImage: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "DH-D07", code: "DH-DAT-007", customerName: "Triệu Mẫn", phone: "0911123123",
    type: "Hàng khách đặt", total: 85000000, status: "Chờ duyệt hủy",
    date: "2026-03-11T13:45:00", salesPerson: "Bình Nguyễn", deliveryDate: "2026-03-26",
    deposit: 20000000, cancelReason: "Khách đổi kích thước nhà", fulfillmentType: "Giao hàng"
  },
  {
    id: "DH-D08", code: "DH-DAT-008", customerName: "Chu Chỉ Nhược", phone: "0933123123",
    type: "Hàng khách đặt", total: 42000000, status: "Đơn đã hủy",
    date: "2026-03-01T10:00:00", salesPerson: "Bình Nguyễn", deliveryDate: "2026-03-10",
    deposit: 0, fulfillmentType: "Giao hàng"
  },
];

const ORDER_TYPES = ["Hàng sẵn", "Hàng mộc", "Hàng khách đặt"];

const HANG_SAN_STATUSES = [
  "Chờ xử lý",
  "Chờ giao hàng",
  "Đang giao hàng",
  "Hoàn thành",
  "Chờ duyệt hủy",
  "Đơn đã hủy",
];

const HANG_THO_STATUSES = [
  "Chờ xử lý",
  "Đang gia công",
  "Chờ giao hàng",
  "Đang giao hàng",
  "Hoàn thành",
  "Chờ duyệt hủy",
  "Đơn đã hủy",
];

const HANG_DAT_STATUSES = [
  "Chờ sản xuất",
  "Đã nhập kho",
  "Đang gia công",
  "Chờ giao hàng",
  "Đang giao hàng",
  "Hoàn thành",
  "Chờ duyệt hủy",
  "Đơn đã hủy",
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

const formatNumberInput = (value) => {
  if (value === "" || value === null || value === undefined) return "";
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const parseNumberInput = (value) => {
  return value.replace(/\./g, "").replace(/[^\d]/g, "");
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
    case "Đơn đã hủy":
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
    // Lọc bỏ những đơn trong INITIAL_ORDERS đã có trong saved để tránh trùng lặp
    const uniqueInitial = INITIAL_ORDERS.filter(io => !saved.find(so => so.id === io.id || so.code === io.code));
    return [...saved, ...uniqueInitial];
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

  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [finalPayment, setFinalPayment] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("Chuyển khoản");
  const [deliveryImage, setDeliveryImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  // ── Handover Modal State (Ported from Detail) ──
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [handoverOrder, setHandoverOrder] = useState(null);
  const [handoverType, setHandoverType] = useState(null); // "moc" | "dat"
  const [handoverNotes, setHandoverNotes] = useState("");
  const [handoverDeadline, setHandoverDeadline] = useState("");

  // Helper để cập nhật Search Params mượt mà
  const updateParams = (newParams) => {
    const current = Object.fromEntries(searchParams.entries());
    setSearchParams({ ...current, ...newParams });
  };

  // Khởi tạo Deadline mặc định khi mở Modal Bàn giao
  useEffect(() => {
    if (showHandoverModal && handoverOrder?.deliveryDate) {
      const delivery = new Date(handoverOrder.deliveryDate);
      // Giảm 2 ngày so với ngày giao khách
      delivery.setDate(delivery.getDate() - 2);
      const isoDate = delivery.toISOString().split('T')[0];
      setHandoverDeadline(isoDate);
      setHandoverNotes("");
    }
  }, [showHandoverModal, handoverOrder]);

  const openHandoverModal = (order, type) => {
    setHandoverOrder(order);
    setHandoverType(type);
    setShowHandoverModal(true);
  };

  const fmtDate = (dateStr) => {
    if (!dateStr) return "---";
    return new Date(dateStr).toLocaleDateString("vi-VN");
  };

  const setActiveTab = (tab) => {
    updateParams({ tab, status: "Tất cả" }); // Reset status khi đổi tab
  };

  const setStatusFilter = (status) => {
    updateParams({ status });
  };

  // Logic kích hoạt bảo hành tự động (Software Standard Design)
  const activateWarrantyForOrder = (order) => {
    const savedWarranties = JSON.parse(localStorage.getItem("tpf_simulated_warranties") || "[]");

    // Phân loại chính sách dựa trên SKU/Tên sản phẩm
    const isNaturalWood = order.items?.some(item =>
      item.productName.toLowerCase().includes("gụ") ||
      item.productName.toLowerCase().includes("hương") ||
      item.productName.toLowerCase().includes("mít")
    ) || order.code.includes("-Mit") || order.code.includes("-Huong") || order.code.includes("-Gu");

    const policy = isNaturalWood ? {
      label: "Gỗ tự nhiên (Gụ, Hương, Mít)",
      duration: 36,
      coverage: [
        "Bảo hành nứt nẻ, cong vênh do lỗi xử lý gỗ.",
        "Xử lý gỗ bị co ngót, hở mộng do thời tiết.",
        "Cam kết đúng chủng loại gỗ 100%."
      ],
      conditions: "Không để sản phẩm dưới ánh nắng trực tiếp hoặc nơi quá ẩm ướt."
    } : {
      label: "Gỗ công nghiệp (MDF, HDF)",
      duration: 12,
      coverage: [
        "Bảo hành bong tróc cạnh, bề mặt gỗ.",
        "Lỗi phụ kiện (bản lề, tay nắm) trong 12 tháng."
      ],
      conditions: "Tránh tiếp xúc trực tiếp với nước hoặc độ ẩm cao kéo dài."
    };

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + policy.duration);

    const newWarranty = {
      id: `BH-${order.code}`,
      customerName: order.customerName,
      customerPhone: order.phone,
      productName: order.items?.[0]?.productName || "Sản phẩm đồ gỗ",
      productCode: order.items?.[0]?.sku || order.code.replace("DH", "SKU"),
      productImg: order.items?.[0]?.image || "https://images.unsplash.com/photo-1620608208153-90928221805b?q=80&w=300",
      warrantyMonths: policy.duration,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      status: "Active",
      policy,
      history: [
        { date: startDate.toISOString(), action: "Kích hoạt Tự động", note: `Đã giao hàng thành công. Hệ thống tự động kích hoạt bảo hành ${policy.label}.` }
      ],
      maintenanceLogs: []
    };

    // Kiểm tra xem đã có chưa, nếu chưa thì push, nếu có rồi thì update (tránh trùng lặp)
    const existingIndex = savedWarranties.findIndex(w => w.id === newWarranty.id);
    if (existingIndex > -1) {
      savedWarranties[existingIndex] = newWarranty;
    } else {
      savedWarranties.push(newWarranty);
    }

    localStorage.setItem("tpf_simulated_warranties", JSON.stringify(savedWarranties));
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

  const openCompleteModal = (order) => {
    setSelectedOrder(order);
    const balance = (order.total || 0) - (order.deposit || 0);
    setFinalPayment(balance > 0 ? balance : 0);
    setDeliveryImage(null);
    setShowCompleteModal(true);
  };

  const handleFinishOrder = () => {
    if (!deliveryImage) {
      toast.error("Vui lòng tải ảnh giao hàng!");
      return;
    }

    const { id } = selectedOrder;
    setOrders(prev => prev.map(o => o.id === id ? {
      ...o,
      status: "Hoàn thành",
      deliveryImage,
      finalPayment,
      paymentMethod
    } : o));

    const saved = JSON.parse(localStorage.getItem("tpf_simulated_orders") || "[]");
    const updatedSaved = saved.map(o => o.id === id ? {
      ...o,
      status: "Hoàn thành",
      deliveryImage,
      finalPayment,
      paymentMethod
    } : o);
    localStorage.setItem("tpf_simulated_orders", JSON.stringify(updatedSaved));

    toast.success("Đã hoàn tất đơn hàng và ghi nhận thanh toán!");
    activateWarrantyForOrder(selectedOrder);
    toast.success("Hệ thống đã tự động kích hoạt bảo hành cho khách hàng!");
    setShowCompleteModal(false);
    setSelectedOrder(null);
  };

  const handleDeliveryUpload = (id, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: "Hoàn thành", deliveryImage: reader.result } : o));

        const saved = JSON.parse(localStorage.getItem("tpf_simulated_orders") || "[]");
        const updatedSaved = saved.map(o => o.id === id ? { ...o, status: "Hoàn thành", deliveryImage: reader.result } : o);
        localStorage.setItem("tpf_simulated_orders", JSON.stringify(updatedSaved));

        toast.success("Đã tải ảnh giao hàng và hoàn tất đơn!");
        const currentOrder = orders.find(o => o.id === id);
        if (currentOrder) activateWarrantyForOrder(currentOrder);
        toast.success("Hệ thống đã tự động kích hoạt bảo hành cho khách hàng!");
        setStatusFilter("Hoàn thành"); // Tự động chuyển tab filter
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
          (o.customerName || o.customer?.name || "").toLowerCase().includes(q) ||
          (o.phone || o.customer?.phone || "").includes(q) ||
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
    else if (activeTab === "Hàng mộc") statuses = HANG_THO_STATUSES;
    else if (activeTab === "Hàng khách đặt") statuses = HANG_DAT_STATUSES;
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
                    ...(activeTab !== "Hàng khách đặt" ? ["Hình thức giao"] : []),
                    "Ngày giao dự kiến"
                  ].map((h, i) => (
                    <th
                      key={i}
                      className={`px-4 py-3 text-[11px] font-bold uppercase tracking-wider ${i === 4 ? "text-right pr-8" : ""} ${i === 0 ? "text-center w-[50px]" : ""} ${(activeTab !== "Hàng khách đặt" ? (i >= 7 && i < 9) : (i >= 6 && i < 8)) ? "text-center whitespace-nowrap" : ""}`}
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
                          {o.customerName || o.customer?.name || "—"}
                        </p>
                        <p
                          className="text-[11px]"
                          style={{ color: "var(--text-placeholder)" }}
                        >
                          {o.phone || o.customer?.phone || "—"}
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
                          className={`text-[13px] font-bold ${o.status === "Đơn đã hủy" ? "text-gray-400 line-through" : ""}`}
                          style={{ color: o.status === "Đơn đã hủy" ? undefined : "var(--text-main)" }}
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
                            {o.status === "Đã nhập kho" && o.type === "Hàng khách đặt" ? "Đã nhập kho (Duyệt mộc)" : o.status}
                          </span>
                          {o.status === "Đơn đã hủy" && o.depositResolution && (
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border self-start ${o.depositResolution === 'refunded' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                              {o.depositResolution === 'refunded' ? "ĐÃ HOÀN CỌC" : "THU CỌC (BỒI THƯỜNG)"}
                            </span>
                          )}
                        </div>
                      </td>
                      {activeTab !== "Hàng khách đặt" && (
                        <td className="px-4 py-3">
                          <span className="text-[12px] font-medium text-gray-500">
                            {o.fulfillmentType || "Chưa xác định"}
                          </span>
                        </td>
                      )}
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-center justify-center gap-1.5">
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Clock size={12} className="text-gray-400" />
                            <span className="text-[13px] font-bold">
                              {o.deliveryDate ? new Date(o.deliveryDate).toLocaleDateString("vi-VN") : "---"}
                            </span>
                          </div>
                          {(() => {
                            if (o.status === "Hoàn thành" || o.status === "Đơn đã hủy" || o.status === "Chờ xử lý" || o.status === "Chờ sản xuất") return null;
                            const orderDate = new Date(o.date);
                            const today = new Date();
                            const diffDays = Math.floor((today - orderDate) / (1000 * 60 * 60 * 24));
                            let expectedLT = 0;
                            if (o.type === "Hàng mộc") expectedLT = 7;
                            if (o.type === "Hàng khách đặt") expectedLT = 30;
                            if (expectedLT === 0) return null;
                            const remaining = expectedLT - diffDays;
                            if (remaining < 0) return <span className="text-[9px] font-black uppercase tracking-tighter text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100 whitespace-nowrap">Quá hạn {Math.abs(remaining)}n</span>;
                            if (remaining <= 2) return <span className="text-[9px] font-black uppercase tracking-tighter text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100 whitespace-nowrap">Sắp hạn ({remaining}n)</span>;
                            return <span className="text-[9px] font-black uppercase tracking-tighter text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 whitespace-nowrap">Còn {remaining}n</span>;
                          })()}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center relative">
                        {/* ===================== VÙNG HOVER (TẤC CẢ THAO TÁC) ===================== */}
                        <div className="absolute inset-y-0 right-10 flex items-center pr-4 pointer-events-none opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 translate-x-4 group-hover:translate-x-0 z-50">
                          <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-2xl shadow-indigo-100/50">

                            {/* 1. CÁC THAO TÁC CHÍNH (THEO TRẠNG THÁI) */}
                            <div className="flex items-center gap-2 pr-2 border-r border-slate-100 empty:hidden">
                              {/* Bàn giao gia công */}
                              {((o.status === "Chờ xử lý" && o.type === "Hàng mộc") || (o.status === "Đã nhập kho" && o.type === "Hàng khách đặt")) && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openHandoverModal(o, o.type === "Hàng mộc" ? "moc" : "dat");
                                  }}
                                  className="h-9 px-4 rounded-xl text-[12px] font-bold text-white transition-all shadow-md active:scale-95 whitespace-nowrap bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
                                >
                                  <Hammer size={15} /> Bàn giao xưởng
                                </button>
                              )}

                              {/* Xác nhận đơn */}
                              {o.status === "Chờ xử lý" && o.type === "Hàng sẵn" && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm("Xác nhận đơn hàng và Chờ giao hàng?")) {
                                      handleUpdateStatus(o.id, "Chờ giao hàng");
                                    }
                                  }}
                                  className="h-9 px-4 rounded-xl bg-emerald-600 text-white text-[12px] font-bold transition-all shadow-md active:scale-95 whitespace-nowrap flex items-center gap-2"
                                >
                                  <CheckCircle size={15} /> Xác nhận đơn
                                </button>
                              )}

                              {/* Hoàn tất gia công */}
                              {o.status === "Đang gia công" && (o.type === "Hàng mộc" || o.type === "Hàng khách đặt") && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm("Xác nhận sản phẩm đã hoàn thiện và sẵn sàng để giao?")) {
                                      handleUpdateStatus(o.id, "Chờ giao hàng");
                                    }
                                  }}
                                  className="h-9 px-4 rounded-xl bg-emerald-600 text-white text-[12px] font-bold transition-all shadow-md active:scale-95 whitespace-nowrap flex items-center gap-2"
                                >
                                  <CheckCircle size={15} /> Hoàn tất gia công
                                </button>
                              )}

                              {/* Bắt đầu giao hàng */}
                              {o.status === "Chờ giao hàng" && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateStatus(o.id, "Đang giao hàng");
                                  }}
                                  className="h-9 px-4 rounded-xl bg-blue-600 text-white text-[12px] font-bold transition-all shadow-md active:scale-95 whitespace-nowrap flex items-center gap-2"
                                >
                                  <RefreshCw size={15} /> Bắt đầu giao
                                </button>
                              )}

                              {/* Hoàn tất đơn hàng */}
                              {o.status === "Đang giao hàng" && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openCompleteModal(o);
                                  }}
                                  className="h-9 px-4 rounded-xl bg-emerald-600 text-white text-[12px] font-bold transition-all shadow-md active:scale-95 whitespace-nowrap flex items-center gap-2"
                                >
                                  <CheckCircle size={15} /> Hoàn tất đơn
                                </button>
                              )}
                            </div>

                            {/* 2. DUYỆT HỦY (NẾU CẦN) */}
                            {o.status === "Chờ duyệt hủy" && (
                              <div className="flex items-center gap-2 px-2 border-r border-slate-100">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm("Duyệt hủy đơn và HOÀN TRẢ TIỀN CỌC?")) {
                                      handleUpdateStatus(o.id, "Đơn đã hủy");
                                      const saved = JSON.parse(localStorage.getItem("tpf_simulated_orders") || "[]");
                                      const updated = saved.map(order =>
                                        (order.id === o.id) ? { ...order, status: "Đơn đã hủy", depositResolution: "refunded" } : order
                                      );
                                      localStorage.setItem("tpf_simulated_orders", JSON.stringify(updated));
                                      setOrders(updated);
                                    }
                                  }}
                                  className="h-9 px-3 rounded-xl bg-red-500 text-white text-[10px] font-black uppercase tracking-wider hover:bg-red-600 transition-all flex items-center gap-1.5 active:scale-95"
                                >
                                  <XCircle size={14} /> Hoàn cọc
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm("Duyệt hủy đơn và THU HỒI TIỀN CỌC?")) {
                                      handleUpdateStatus(o.id, "Đơn đã hủy");
                                      const saved = JSON.parse(localStorage.getItem("tpf_simulated_orders") || "[]");
                                      const updated = saved.map(order =>
                                        (order.id === o.id) ? { ...order, status: "Đơn đã hủy", depositResolution: "forfeited" } : order
                                      );
                                      localStorage.setItem("tpf_simulated_orders", JSON.stringify(updated));
                                      setOrders(updated);
                                    }
                                  }}
                                  className="h-9 px-3 rounded-xl bg-amber-700 text-white text-[10px] font-black uppercase tracking-wider hover:bg-amber-800 transition-all flex items-center gap-1.5 active:scale-95"
                                >
                                  <Ban size={14} /> Thu cọc
                                </button>
                              </div>
                            )}

                            {/* 3. CÁC TÁC VỤ PHỤ (CHI TIẾT, HỦY) */}
                            <div className="flex items-center gap-2 pl-1">
                              <Link
                                to={`/owner/orders/${o.id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="h-9 w-9 rounded-xl bg-slate-50 text-slate-600 hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center shadow-sm active:scale-95 border border-slate-100"
                                title="Xem chi tiết"
                              >
                                <Eye size={18} />
                              </Link>

                              {["Chờ xử lý", "Đã nhập kho", "Đang gia công", "Chờ giao hàng"].includes(o.status) && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) {
                                      handleUpdateStatus(o.id, "Đơn đã hủy");
                                    }
                                  }}
                                  className="h-9 w-9 rounded-xl bg-white text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center shadow-sm active:scale-95 border border-red-50"
                                  title="Hủy đơn hàng"
                                >
                                  <XCircle size={18} />
                                </button>
                              )}

                              {/* Preview ảnh giao hàng nếu có */}
                              {o.deliveryImage && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPreviewImage(o.deliveryImage);
                                  }}
                                  className="h-9 w-9 rounded-xl border border-slate-200 overflow-hidden hover:ring-2 ring-indigo-500 transition-all cursor-pointer shadow-sm"
                                  title="Xem ảnh giao hàng"
                                >
                                  <img src={o.deliveryImage} alt="delivery" className="w-full h-full object-cover" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {paginatedOrders.length === 0 && (
                  <tr>
                    <td colSpan={activeTab === "Hàng khách đặt" ? 8 : 9} className="py-24 text-center">
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

      {/* MODAL HOÀN TẤT ĐƠN & THANH TOÁN */}
      {showCompleteModal && selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <CheckCircle className="text-emerald-500" size={24} /> HOÀN TẤT ĐƠN HÀNG
              </h3>
              <button onClick={() => setShowCompleteModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Summary Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tổng đơn hàng</p>
                  <p className="text-lg font-black text-slate-800">{formatCurrency(selectedOrder.total)}</p>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                  <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Đã đặt cọc</p>
                  <p className="text-lg font-black text-emerald-700">{formatCurrency(selectedOrder.deposit || 0)}</p>
                </div>
              </div>

              {/* Balance Due */}
              <div className="p-5 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-indigo-100 uppercase tracking-wider">Số tiền còn lại cần thu</p>
                    <p className="text-2xl font-black">{formatCurrency(selectedOrder.total - (selectedOrder.deposit || 0))}</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <Banknote size={24} />
                  </div>
                </div>
              </div>

              {/* Form Inputs */}
              <div className="space-y-4">
                <div>
                  <label className="text-[12px] font-bold text-slate-600 ml-1 mb-1.5 block">Số tiền thực tế thu tại chỗ</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formatNumberInput(finalPayment)}
                      onChange={(e) => {
                        const val = parseNumberInput(e.target.value);
                        setFinalPayment(val === "" ? 0 : Number(val));
                      }}
                      className="w-full h-12 pl-10 pr-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-800 shadow-sm"
                      placeholder="0"
                    />
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₫</div>
                  </div>
                </div>

                <div>
                  <label className="text-[12px] font-bold text-slate-600 ml-1 mb-1.5 block">Hình thức thanh toán cuối</label>
                  <div className="grid grid-cols-2 gap-3">
                    {["Chuyển khoản", "Tiền mặt"].map(m => (
                      <button
                        key={m}
                        onClick={() => setPaymentMethod(m)}
                        className={`h-12 rounded-2xl border font-bold text-[13px] flex items-center justify-center gap-2 transition-all ${paymentMethod === m ? 'bg-indigo-50 border-indigo-600 text-indigo-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                          }`}
                      >
                        {m === "Chuyển khoản" ? <CreditCard size={16} /> : <Wallet size={16} />}
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[12px] font-bold text-slate-600 ml-1 mb-1.5 block">Ảnh giao hàng (Thực tế tại nhà khách)</label>
                  <div className="relative group">
                    <label className={`w-full h-28 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${deliveryImage ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                      }`}>
                      {deliveryImage ? (
                        <div className="flex items-center gap-4 px-4">
                          <img src={deliveryImage} className="w-20 h-20 rounded-xl object-cover border border-emerald-200 shadow-md" alt="Delivery" />
                          <div className="flex flex-col">
                            <span className="text-emerald-700 font-bold text-[13px]">Ảnh đã tải lên</span>
                            <button
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeliveryImage(null); }}
                              className="text-[11px] text-slate-400 font-bold hover:text-red-500 transition-colors uppercase tracking-wider text-left mt-1"
                            >
                              Thay đổi ảnh
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm mb-2 group-hover:scale-110 transition-transform">
                            <Camera size={20} className="text-slate-400" />
                          </div>
                          <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Nhấp để chụp hoặc tải ảnh</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setDeliveryImage(reader.result);
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100">
              <button
                onClick={handleFinishOrder}
                className="w-full h-12 rounded-2xl bg-indigo-600 text-white font-black text-[14px] hover:bg-slate-900 transition-all shadow-lg shadow-indigo-100 active:scale-95"
              >
                XÁC NHẬN HOÀN TẤT & LƯU LẠI
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Handover Modal (Ported from Detail) */}
      {showHandoverModal && handoverOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-indigo-50/50">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <Hammer className="text-indigo-600" size={24} /> ĐỐI SOÁT TRƯỚC KHI BÀN GIAO
              </h3>
              <button onClick={() => setShowHandoverModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 cursor-pointer">
                <XCircle size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
              {/* Thông tin sản phẩm */}
              <div className="space-y-3">
                {(handoverOrder.products || handoverOrder.items || []).map((p, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 shadow-sm">
                    <p className="text-[14px] font-bold text-slate-800">{p.name || p.productName}</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Chất liệu</p>
                        <p className="text-[13px] font-semibold text-slate-700">{p.material || "Gỗ mít"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Kích thước</p>
                        <p className="text-[13px] font-semibold text-slate-700">{p.size || "197×107×108"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Hoàn thiện</p>
                        <p className="text-[13px] font-semibold text-slate-700">{p.finish || "Mộc"}</p>
                      </div>
                    </div>

                    {/* Ghi chú kỹ thuật nổi bật */}
                    {(p.note || p.notes) && (
                      <div className="p-3 rounded-xl border-2 border-amber-300 bg-amber-50">
                        <p className="text-[10px] uppercase font-bold text-amber-600 tracking-wider flex items-center gap-1.5 mb-1">
                          <FileText size={12} /> GHI CHÚ KỸ THUẬT TỪ SALES
                        </p>
                        <ul className="space-y-1">
                          {(p.note || p.notes).split(/[,;\n]/).map((item, idx) => item.trim() && (
                            <li key={idx} className="text-[13px] font-bold text-amber-900 flex items-start gap-1.5">
                              <span className="text-amber-500 mt-0.5">•</span> {item.trim()}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Hạn hoàn thành & Ghi chú cho thợ */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar size={14} className="text-indigo-500" /> Hạn hoàn thành xong
                    </label>
                    <input
                      type="date"
                      value={handoverDeadline}
                      onChange={(e) => setHandoverDeadline(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none text-[14px] font-bold text-slate-700 bg-white"
                    />
                    <p className="text-[10px] text-indigo-500 font-medium italic">
                      Gợi ý: Trước ngày giao khách {handoverOrder.deliveryDate ? "2 ngày" : "... "}
                    </p>
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                      <p className="text-[11px] font-bold text-amber-700 uppercase flex items-center gap-1.5">
                        <Truck size={14} /> Ngày giao khách
                      </p>
                      <p className="text-[14px] font-black text-amber-800 mt-0.5">{fmtDate(handoverOrder.deliveryDate)}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText size={14} className="text-indigo-500" /> Ghi chú dặn thợ
                  </label>
                  <textarea
                    placeholder="Nhập các yêu cầu cụ thể cho đội thợ gia công..."
                    value={handoverNotes}
                    onChange={(e) => setHandoverNotes(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none text-[13px] font-medium text-slate-700 min-h-[100px] bg-white shadow-sm"
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100">
              <button
                onClick={() => {
                  const newStatus = handoverType === "moc" ? "Đang sản xuất" : "Đang gia công";
                  const desc = handoverType === "moc"
                    ? `Owner bàn giao xưởng. Deadline: ${new Date(handoverDeadline).toLocaleDateString('vi-VN')}. Ghi chú: ${handoverNotes || "Không"}`
                    : `Đã duyệt mộc & chuyển gia công. Deadline: ${new Date(handoverDeadline).toLocaleDateString('vi-VN')}`;

                  const saved = JSON.parse(localStorage.getItem("tpf_simulated_orders") || "[]");
                  let needsAdd = !saved.find(so => so.id === handoverOrder.id || so.code === handoverOrder.code);

                  const updated = needsAdd ? [...saved, { ...handoverOrder }] : saved;

                  const finalUpdated = updated.map(order =>
                    (order.code === handoverOrder.code || order.id === handoverOrder.id) ? {
                      ...order,
                      status: newStatus,
                      worker_deadline: handoverDeadline,
                      handover_notes: handoverNotes,
                      handover_checklist: {
                        approved_at: new Date().toISOString(),
                        notes: handoverNotes,
                        deadline: handoverDeadline
                      },
                      timeline: [
                        ...(order.timeline || []),
                        {
                          time: new Date().toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" }).replace(',', ' —'),
                          label: "Bàn giao gia công",
                          desc,
                          active: true
                        }
                      ]
                    } : order
                  );
                  localStorage.setItem("tpf_simulated_orders", JSON.stringify(finalUpdated));
                  setOrders(finalUpdated);
                  toast.success("Đã bàn giao xưởng thành công!");
                  setShowHandoverModal(false);
                  if (handoverType === "moc") navigate("/owner/production/LSX001");
                }}
                className="w-full h-12 rounded-2xl bg-indigo-600 text-white font-black text-[14px] transition-all shadow-lg shadow-indigo-200 active:scale-95 hover:bg-indigo-700"
              >
                ✅ XÁC NHẬN BÀN GIAO XƯỞNG
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL XEM ẢNH PHÓNG TO */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-5xl w-full h-full flex items-center justify-center">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-0 right-0 m-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-[210]"
            >
              <X size={24} />
            </button>
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

    </>
  );
}
