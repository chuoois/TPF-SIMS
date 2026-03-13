import { useState, useMemo, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { PageHelmet } from "@/components/seo/PageHelmet";
import {
  ArrowLeft,
  Phone,
  MapPin,
  Calendar,
  Package,
  User,
  FileText,
  Truck,
  Clock,
  CreditCard,
  XCircle,
  AlertTriangle,
  CheckCircle,
  Calculator,
  Hammer,
  Camera,
  Eye,
  UserPlus,
  Info,
} from "lucide-react";

// ===================== MOCK DATA =====================
const MOCK_ORDERS = {
  // ========== NHÓM 1: HÀNG SẴN (6 trạng thái) ==========
  "DH-S01": {
    code: "DH-SAN-001", type: "Hàng sẵn", status: "Chờ xử lý",
    date: "2026-03-12T08:30:00", deliveryDate: "2026-03-14", fulfillmentType: "Giao tận nhà",
    customer: { name: "Nguyễn Văn Hùng", phone: "0912345678", address: "45 Đường Giải Phóng, Hà Nội" },
    salesPerson: "Bình Nguyễn", total: 12500000, deposit: 12500000, paymentStatus: "full",
    products: [{ name: "Ghế sofa đơn nỉ", material: "Gỗ sồi", size: "80×85 cm", finish: "Chân gỗ", pattern: "Trơn", qty: 2, price: 6250000 }],
    timeline: [{ time: "12/03/2026 08:30", label: "Tiếp nhận đơn", desc: "Đơn hàng mới", active: true }],
  },
  "DH-S02": {
    code: "DH-SAN-002", type: "Hàng sẵn", status: "Chờ giao hàng",
    date: "2026-03-11T14:20:00", deliveryDate: "2026-03-12", fulfillmentType: "Lấy ngay",
    customer: { name: "Lê Thị Lan", phone: "0345678901", address: "Vinhomes Ocean Park, Hà Nội" },
    salesPerson: "Bình Nguyễn", total: 3500000, deposit: 3500000, paymentStatus: "full",
    products: [{ name: "Bàn trà kim loại", material: "Sắt nghệ thuật", size: "70×70 cm", finish: "Sơn tĩnh điện", pattern: "Chân X", qty: 1, price: 3500000 }],
    timeline: [
      { time: "11/03/2026 14:20", label: "Tạo đơn", desc: "Thanh toán đủ", active: false },
      { time: "11/03/2026 15:00", label: "Chờ giao hàng", desc: "Đã sẵn sàng", active: true }
    ],
  },
  "DH-S03": {
    code: "DH-SAN-003", type: "Hàng sẵn", status: "Đang giao hàng",
    date: "2026-03-10T09:15:00", deliveryDate: "2026-03-11", fulfillmentType: "Lấy luôn",
    customer: { name: "Trần Minh Quang", phone: "0909123456", address: "12 Lý Thường Kiệt, Hà Nội" },
    salesPerson: "Bình Nguyễn", total: 45000000, deposit: 45000000, paymentStatus: "full",
    products: [{ name: "Sập thờ gỗ", material: "Gỗ gụ mật", size: "197×107 cm", finish: "Vecni", pattern: "Mai điểu", qty: 1, price: 45000000 }],
    timeline: [{ time: "11/03/2026 08:00", label: "Đang giao hàng", desc: "Shipper đi giao", active: true }],
  },
  "DH-S04": {
    code: "DH-SAN-004", type: "Hàng sẵn", status: "Hoàn thành",
    date: "2026-03-09T16:45:00", deliveryDate: "2026-03-10", fulfillmentType: "Giao nhà",
    deliveryImage: "https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&q=80&w=400",
    customer: { name: "Phạm Thành Nam", phone: "0987654321", address: "TP.HCM" },
    salesPerson: "Bình Nguyễn", total: 8900000, deposit: 8900000, paymentStatus: "full",
    products: [{ name: "Kệ tivi", material: "Gỗ MDF", size: "180x40", finish: "Melamine", pattern: "Trơn", qty: 1, price: 8900000 }],
    timeline: [{ time: "10/03/2026 14:00", label: "Hoàn thành", desc: "Giao xong", active: true }],
  },
  "DH-S05": {
    code: "DH-SAN-005", type: "Hàng sẵn", status: "Chờ duyệt hủy",
    cancelReason: "Khách đổi ý",
    date: "2026-03-11T10:00:00", deliveryDate: "2026-03-13",
    customer: { name: "Đinh Công Vinh", phone: "0944556677", address: "TP.HCM" },
    salesPerson: "Bình Nguyễn", total: 2100000, deposit: 0, paymentStatus: "none",
    products: [{ name: "Ghế", material: "Gỗ tần bì", size: "45x50", finish: "Sơn", pattern: "Trơn", qty: 2, price: 1050000 }],
    timeline: [{ time: "11/03/2026 11:00", label: "Chờ duyệt hủy", desc: "Sale gửi yc hủy", active: true }],
  },
  "DH-S06": {
    code: "DH-SAN-006", type: "Hàng sẵn", status: "Đã hủy",
    date: "2026-03-08T10:00:00", deliveryDate: "2026-03-09",
    customer: { name: "Võ Thị Bảy", phone: "0966778899", address: "TP.HCM" },
    salesPerson: "Bình Nguyễn", total: 1500000, deposit: 0, paymentStatus: "none",
    products: [{ name: "Đôn", material: "Lim", size: "30x30", finish: "PU", pattern: "Trơn", qty: 1, price: 1500000 }],
    timeline: [{ time: "08/03/2026 10:30", label: "Đã hủy", desc: "Hủy do khách báo sai đỏ", active: true }],
  },

  // ========== NHÓM 2: HÀNG THÔ (8 trạng thái) ==========
  "DH-T01": {
    code: "DH-THO-001", type: "Hàng thô", status: "Chờ xử lý",
    date: "2026-03-12T10:00:00", deliveryDate: "2026-03-20",
    customer: { name: "Hoàng Nguyệt Ánh", phone: "0978901234", address: "TP.HCM" },
    salesPerson: "Bình Nguyễn", total: 56000000, deposit: 15000000, paymentStatus: "partial",
    products: [{ name: "Sập thờ", material: "Gỗ mít", size: "220", finish: "Mộc", pattern: "Tứ linh", qty: 1, price: 56000000, note: "Khách yêu cầu làm mộc kỹ như ảnh mẫu" }],
    sampleImages: [
      "https://images.unsplash.com/photo-1615529328322-92c90680fd74?q=80&w=800",
      "https://images.unsplash.com/photo-1620608208153-90928221805b?q=80&w=800"
    ],
    timeline: [{ time: "12/03/2026 10:00", label: "Tạo đơn", desc: "Nhận mộc", active: true }],
  },
  "DH-T02": {
    code: "DH-THO-002", type: "Hàng thô", status: "Đang sản xuất",
    date: "2026-03-11T15:30:00", deliveryDate: "2026-03-15",
    customer: { name: "Đặng Tuấn Kiệt", phone: "0931234567", address: "TP.HCM" },
    salesPerson: "Bình Nguyễn", total: 8200000, deposit: 2000000, paymentStatus: "partial",
    products: [{ name: "Trường kỷ", material: "Gỗ lim", size: "2m", finish: "Mộc", pattern: "Trơn", qty: 1, price: 8200000 }],
    timeline: [{ time: "11/03/2026 16:00", label: "Đang sản xuất", desc: "Chờ chia việc", active: true }],
  },
  "DH-T03": {
    code: "DH-THO-003", type: "Hàng thô", status: "Đang sản xuất",
    date: "2026-03-10T08:00:00", deliveryDate: "2026-03-14",
    customer: { name: "Vũ Hải Đăng", phone: "0922334455", address: "HN" },
    salesPerson: "Bình Nguyễn", total: 12500000, deposit: 4000000, paymentStatus: "partial",
    products: [{ name: "Bàn ghế", material: "Gụ", size: "Chuẩn", finish: "Mộc", pattern: "Chạm", qty: 1, price: 12500000 }],
    timeline: [{ time: "10/03/2026 09:00", label: "Đang sản xuất", desc: "Đang sơn", active: true }],
  },
  "DH-T04": {
    code: "DH-THO-004", type: "Hàng thô", status: "Chờ giao hàng",
    date: "2026-03-09T11:20:00", deliveryDate: "2026-03-12",
    customer: { name: "Bùi Tiến Dũng", phone: "0911223344", address: "HN" },
    salesPerson: "Bình Nguyễn", total: 28000000, deposit: 10000000, paymentStatus: "partial",
    products: [{ name: "Tủ', material: 'Hương", size: "120", finish: "PU", pattern: "Trơn", qty: 1, price: 28000000 }],
    timeline: [{ time: "11/03/2026 09:00", label: "Chờ giao hàng", desc: "Xong mộc", active: true }],
  },
  "DH-T05": {
    code: "DH-THO-005", type: "Hàng thô", status: "Đang giao hàng",
    date: "2026-03-08T14:45:00", deliveryDate: "2026-03-10",
    customer: { name: "Đinh Công Thành", phone: "0988776655", address: "HN" },
    salesPerson: "Bình Nguyễn", total: 15400000, deposit: 5000000, paymentStatus: "partial",
    products: [{ name: "Salon", material: "Xà cừ", size: "Chuẩn", finish: "PU", pattern: "Trơn", qty: 1, price: 15400000 }],
    timeline: [{ time: "09/03/2026 10:00", label: "Đang giao hàng", desc: "Lên xe tãi", active: true }],
  },
  "DH-T06": {
    code: "DH-THO-006", type: "Hàng thô", status: "Hoàn thành",
    date: "2026-03-07T09:00:00", deliveryDate: "2026-03-09",
    deliveryImage: "https://images.unsplash.com/photo-1617806118233-ef203e91122b",
    customer: { name: "Trần Anh Tú", phone: "0900112233", address: "HN" },
    salesPerson: "Bình Nguyễn", total: 32000000, deposit: 32000000, paymentStatus: "full",
    products: [{ name: "Kệ TV", material: "Sồi", size: "Chuẩn", finish: "PU", pattern: "Trơn", qty: 1, price: 32000000 }],
    timeline: [{ time: "07/03/2026 09:00", label: "Hoàn thành", desc: "Đã giao", active: true }],
  },
  "DH-T07": {
    code: "DH-THO-007", type: "Hàng thô", status: "Chờ duyệt hủy",
    cancelReason: "Mua nhầm",
    date: "2026-03-11T09:00:00", deliveryDate: "2026-03-15",
    customer: { name: "Lý Quí Chung", phone: "0933445566", address: "HCM" },
    salesPerson: "Bình Nguyễn", total: 18000000, deposit: 0, paymentStatus: "none",
    products: [{ name: "Kệ", material: "Hương", size: "2m", finish: "Mộc", pattern: "Trơn", qty: 1, price: 18000000 }],
    timeline: [{ time: "11/03/2026 10:00", label: "Chờ duyệt hủy", desc: "Chờ chủ", active: true }],
  },
  "DH-T08": {
    code: "DH-THO-008", type: "Hàng thô", status: "Đã hủy",
    date: "2026-03-05T09:00:00", deliveryDate: "2026-03-08",
    customer: { name: "Nguyễn Kim Ngân", phone: "0977889900", address: "HN" },
    salesPerson: "Bình Nguyễn", total: 9000000, deposit: 0, paymentStatus: "none",
    products: [{ name: "Đôn", material: "Gõ", size: "Chuẩn", finish: "Mộc", pattern: "Trơn", qty: 1, price: 9000000 }],
    timeline: [{ time: "05/03/2026 10:00", label: "Đã hủy", desc: "Hủy", active: true }],
  },

  // ========== NHÓM 3: HÀNG ĐẶT ==========
  "DH-D01": {
    code: "DH-DAT-001", type: "Hàng đặt", status: "Chờ xử lý",
    date: "2026-03-12T11:15:00", deliveryDate: "2026-03-30",
    customer: { name: "Nguyễn Thị Hồng", phone: "0912123123", address: "Hà Nội" },
    salesPerson: "Bình Nguyễn", total: 75000000, deposit: 25000000, paymentStatus: "partial",
    products: [{ name: "Tủ thờ", material: "Hương đá", size: "160", finish: "PU", pattern: "Chạm", qty: 1, price: 75000000 }],
    sampleImages: ["https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=800"],
    timeline: [{ time: "12/03/2026 11:15", label: "Tạo đơn", desc: "Cọc 25tr", active: true }],
  },
  "DH-D02": {
    code: "DH-DAT-002", type: "Hàng đặt", status: "Đang sản xuất",
    date: "2026-03-11T09:00:00", deliveryDate: "2026-03-25",
    customer: { name: "Lê Văn Tám", phone: "0321654987", address: "TP.HCM" },
    salesPerson: "Bình Nguyễn", total: 120000000, deposit: 40000000, paymentStatus: "partial",
    products: [{ name: "Bộ Salon", material: "Hương", size: "To", finish: "PU", pattern: "Trơn", qty: 1, price: 120000000 }],
    timeline: [{ time: "11/03/2026 09:30", label: "Đang sản xuất", desc: "Chuẩn bị", active: true }],
  },
  "DH-D03": {
    code: "DH-DAT-003", type: "Hàng đặt", status: "Đang sản xuất",
    date: "2026-03-10T10:15:00", deliveryDate: "2026-03-28",
    customer: { name: "Phan Trị", phone: "0944123789", address: "158 Nguyễn Văn Cừ, Long Biên, HN" },
    salesPerson: "Bình Nguyễn", total: 45000000, deposit: 10000000, paymentStatus: "partial",
    products: [{ 
      name: "Tủ rượu gỗ sồi", material: "Sồi Nga", size: "120x200x40cm", finish: "Sơn màu óc chó", pattern: "Trơn hiện đại", qty: 1, price: 45000000,
      note: "Yêu cầu sơn màu óc chó đậm giống ảnh mẫu khách gửi."
    }],
    sampleImages: [
      "https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=800",
      "https://images.unsplash.com/photo-1616486341351-70252447aece?q=80&w=800"
    ],
    timeline: [
      { time: "10/03/2026 10:15", label: "Tạo đơn", desc: "Khách đặt màu óc chó", active: false },
      { time: "11/03/2026 09:00", label: "Đang sản xuất", desc: "Đã bàn giao xưởng", active: true }
    ],
  },
  "DH-D04": {
    code: "DH-DAT-004", type: "Hàng đặt", status: "Chờ giao hàng",
    date: "2026-03-09T14:20:00", deliveryDate: "2026-03-22",
    customer: { name: "Sơn", phone: "0988", address: "HCM" },
    salesPerson: "Bình", total: 95000000, deposit: 30000000, paymentStatus: "partial",
    products: [{ name: "Bàn ăn", material: "Me tây", size: "2m", finish: "PU", pattern: "Trơn", qty: 1, price: 95000000 }],
    timeline: [{ time: "14/03", label: "Xong", desc: "Chờ xe", active: true }],
  },
  "DH-D05": {
    code: "DH-DAT-005", type: "Hàng đặt", status: "Đang giao hàng",
    date: "2026-03-08T11:00:00", deliveryDate: "2026-03-20",
    customer: { name: "Thủy", phone: "0909", address: "HCM" },
    salesPerson: "Bình", total: 34000000, deposit: 10000000, paymentStatus: "partial",
    products: [{ name: "Giường", material: "Xoan", size: "1m8", finish: "Sơn", pattern: "Trơn", qty: 1, price: 34000000 }],
    timeline: [{ time: "18/03", label: "Đang giao", desc: "Đi giao", active: true }],
  },
  "DH-D06": {
    code: "DH-DAT-006", type: "Hàng đặt", status: "Hoàn thành",
    date: "2026-03-05T08:30:00", deliveryDate: "2026-03-15",
    deliveryImage: "https://images.unsplash.com/photo-1599690924032-4e55e5108bb6",
    customer: { name: "Kỵ", phone: "0977", address: "HCM" },
    salesPerson: "Bình", total: 210000000, deposit: 210000000, paymentStatus: "full",
    products: [{ name: "Sofa", material: "Đỏ", size: "To", finish: "PU", pattern: "Chạm", qty: 1, price: 210000000 }],
    timeline: [{ time: "15/03", label: "Hoàn thành", desc: "Đã giao", active: true }],
  },
  "DH-D07": {
    code: "DH-DAT-007", type: "Hàng đặt", status: "Chờ duyệt hủy",
    cancelReason: "Đổi ý",
    date: "2026-03-11T13:45:00", deliveryDate: "2026-03-26",
    customer: { name: "Triệu", phone: "0911", address: "HCM" },
    salesPerson: "Bình", total: 85000000, deposit: 0, paymentStatus: "none",
    products: [{ name: "Bếp", material: "Gỗ", size: "3m", finish: "PU", pattern: "Trơn", qty: 1, price: 85000000 }],
    timeline: [{ time: "11/03", label: "Chờ duyệt", desc: "Yêu cầu hủy", active: true }],
  },
  "DH-D08": {
    code: "DH-DAT-008", type: "Hàng đặt", status: "Đã hủy",
    date: "2026-03-01T10:00:00", deliveryDate: "2026-03-10",
    customer: { name: "Chu", phone: "0933", address: "Cần Thơ" },
    salesPerson: "Bình", total: 42000000, deposit: 0, paymentStatus: "none",
    products: [{ name: "Phấn", material: "MDF", size: "Chưa rõ", finish: "Sơn", pattern: "Trơn", qty: 1, price: 42000000 }],
    timeline: [{ time: "01/03", label: "Hủy", desc: "Hủy sớm", active: true }],
  },
};

// ===================== HELPERS =====================
const fmtCurrency = (n) =>
  n != null ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n) : "—";

const fmtDate = (s) => (s ? new Date(s).toLocaleDateString("vi-VN") : "Chưa xác định");

const fmtDateTime = (s) => {
  if (!s) return "—";
  const d = new Date(s);
  return `${d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} — ${d.toLocaleDateString("vi-VN")}`;
};

const statusStyle = (status) => {
  const m = {
    "Chờ xử lý":       { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" }, // Blue
    "Đang xử lý":      { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" }, // Orange
    "Đang sản xuất":   { bg: "#FEF3C7", text: "#D97706", border: "#FDE68A" }, // Amber
    "Chờ giao hàng":   { bg: "#F5F3FF", text: "#7C3AED", border: "#DDD6FE" }, // Purple
    "Đang giao hàng":  { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" }, // Deep Blue
    "Hoàn thành":      { bg: "#F0FDF4", text: "#166534", border: "#BBF7D0" }, // Green
    "Chờ duyệt hủy":   { bg: "#FEF3C7", text: "#D97706", border: "#FDE68A" }, // Amber/Yellow
    "Đã hủy":          { bg: "#FEF2F2", text: "#B91C1C", border: "#FECACA" }, // Red
  };
  return m[status] || { bg: "#F3F4F6", text: "#6B7280", border: "#E5E7EB" };
};

// ===================== SUB-COMPONENTS =====================


const Badge = ({ children, style }) => (
  <span
    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap"
    style={style}
  >
    {children}
  </span>
);

const CustomerInfoCard = ({ o }) => (
  <div
    className="rounded-2xl overflow-hidden mb-4"
    style={{ backgroundColor: "var(--background)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
  >
    <div
      className="px-5 py-4 flex items-center gap-4"
      style={{ borderBottom: "1px solid var(--grid-border)" }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center text-[15px] font-bold shrink-0"
        style={{ backgroundColor: "var(--bg-main)", color: "var(--brand-primary)", border: "1px solid var(--grid-border)" }}
      >
        {o.customer.name.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-bold truncate" style={{ color: "var(--text-main)" }}>{o.customer.name}</p>
        <div className="flex items-center gap-4 mt-0.5 flex-wrap">
          <span className="inline-flex items-center gap-1 text-[12px]" style={{ color: "var(--text-secondary)" }}>
            <Phone size={11} style={{ color: "var(--text-placeholder)" }} />
            {o.customer.phone}
          </span>
          <span className="inline-flex items-center gap-1 text-[12px]" style={{ color: "var(--text-secondary)" }}>
            <MapPin size={11} style={{ color: "var(--text-placeholder)" }} />
            {o.customer.address}
          </span>
        </div>
      </div>
    </div>

    <div className="px-5 py-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "var(--text-placeholder)" }}>Mã đơn</p>
          <p className="text-[13px] font-semibold mt-0.5" style={{ color: "var(--text-main)" }}>{o.code}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "var(--text-placeholder)" }}>Loại đơn</p>
          <p className="text-[13px] font-semibold mt-0.5" style={{ color: "var(--text-main)" }}>{o.type}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "var(--text-placeholder)" }}>Nhân viên</p>
          <p className="text-[13px] font-semibold mt-0.5" style={{ color: "var(--text-main)" }}>{o.salesPerson}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "var(--text-placeholder)" }}>Ngày tạo</p>
          <p className="text-[13px] font-semibold mt-0.5" style={{ color: "var(--text-main)" }}>{fmtDateTime(o.date)}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "var(--text-placeholder)" }}>Ngày giao</p>
          <p className="text-[13px] font-semibold mt-0.5" style={{ color: "var(--text-main)" }}>{fmtDate(o.deliveryDate)}</p>
        </div>
      </div>

      {o.notes && (
        <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--grid-border)" }}>
          <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "var(--text-placeholder)" }}>Ghi chú</p>
          <p className="text-[12px] mt-0.5" style={{ color: "var(--text-secondary)" }}>{o.notes}</p>
        </div>
      )}
    </div>
  </div>
);

const HistoryCard = ({ o }) => (
  <div
    className="rounded-2xl overflow-hidden mt-4"
    style={{ backgroundColor: "var(--background)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
  >
    <div
      className="px-5 py-3 flex items-center gap-2"
      style={{ borderBottom: "1px solid var(--grid-border)", backgroundColor: "var(--grid-header-bg)" }}
    >
      <Clock size={14} style={{ color: "var(--brand-primary)" }} />
      <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: "var(--text-main)" }}>Lịch sử giao dịch</span>
    </div>
    <div className="px-5 py-4">
      {o.timeline.map((t, i) => {
        const isLast = i === o.timeline.length - 1;
        return (
          <div key={i} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                style={{ backgroundColor: t.active ? "var(--brand-primary)" : "var(--grid-border)" }}
              />
              {!isLast && (
                <div className="w-px flex-1 my-1" style={{ backgroundColor: "var(--grid-border)" }} />
              )}
            </div>
            <div className="pb-3.5 min-w-0">
              <p
                className="text-[12px] font-bold"
                style={{ color: t.active ? "var(--brand-primary)" : "var(--text-main)" }}
              >
                {t.label}
              </p>
              <p className="text-[10px]" style={{ color: "var(--text-placeholder)" }}>{t.time}</p>
              <p className="text-[11px] mt-0.5" style={{ color: "var(--text-secondary)" }}>{t.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

const MediaGallery = ({ images }) => (
  <div
    className="rounded-2xl overflow-hidden mt-4"
    style={{ backgroundColor: "var(--background)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
  >
    <div
      className="px-5 py-3 flex items-center justify-between"
      style={{ borderBottom: "1px solid var(--grid-border)", backgroundColor: "var(--grid-header-bg)" }}
    >
      <div className="flex items-center gap-2">
        <Camera size={14} className="text-emerald-600" />
        <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: "var(--text-main)" }}>
          Ảnh mẫu / Yêu cầu từ khách
        </span>
      </div>
      <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
        {images?.length || 0} Ảnh
      </span>
    </div>
    <div className="p-5">
       <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((img, idx) => (
             <div key={idx} className="group relative aspect-square rounded-xl overflow-hidden bg-gray-50 border border-gray-100 hover:shadow-lg transition cursor-pointer">
                <img src={img} alt="Sample" className="w-full h-full object-cover transition duration-300 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <div className="w-8 h-8 rounded-full bg-white/90 text-gray-900 flex items-center justify-center shadow-md">
                      <Eye size={16} />
                   </div>
                </div>
             </div>
          ))}
       </div>
    </div>
  </div>
);


// --- KIỂU HIỂN THỊ ĐƠN HÀNG THÔNG THƯỜNG ---
// Chuyên dụng để theo dõi đơn (Đã chốt giá, Đang sản xuất, Giao hàng...)
const StandardOrderView = ({ o, displayTotal, hasPricing, remaining, deliveryImage, onDeliveryImageChange }) => {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      {/* ── BANNER ── */}
      {o.status === "Chờ giao hàng" && (
        <div
          className="flex flex-col md:flex-row items-stretch md:items-start gap-4 p-5 rounded-2xl"
          style={{ backgroundColor: "#F0FDF4", border: "1px solid #BBF7D0" }}
        >
          <div className="shrink-0 relative group cursor-pointer w-full md:w-40 h-32 md:h-auto object-cover rounded-xl overflow-hidden border-2 border-green-200">
            {o.finishedImage ? (
              <img src={o.finishedImage} alt="Sản phẩm hoàn thiện" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-green-50 flex items-center justify-center text-green-300">
                <Camera size={24} />
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
              <Eye size={20} className="text-white" />
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-start gap-2">
              <CheckCircle size={18} className="shrink-0 mt-0.5" style={{ color: "#166534" }} />
              <div>
                <p className="text-[14px] font-bold" style={{ color: "#14532D" }}>Sản phẩm đã sẵn sàng giao!</p>
                <p className="text-[13px] mt-0.5" style={{ color: "#15803D" }}>
                  Hàng hóa đã được hoàn thiện và đóng gói. Vui lòng sắp xếp lịch trình và phương tiện để giao hàng cho khách.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {o.status === "Đang giao hàng" && (
        <div
          className="flex items-start gap-3 p-4 rounded-2xl"
          style={{ backgroundColor: "#EFF6FF", border: "1px solid #BFDBFE" }}
        >
          <Truck size={18} className="shrink-0 mt-0.5" style={{ color: "#1D4ED8" }} />
          <div className="flex-1">
            <p className="text-[13px] font-bold" style={{ color: "#1E40AF" }}>Đơn hàng đang được giao</p>
            <p className="text-[12px] mt-0.5" style={{ color: "#1D4ED8" }}>
              Vui lòng chụp ảnh giao hàng để xác nhận hoàn tất. Bắt buộc có ảnh mới được chuyển trạng thái.
            </p>
            <div className="mt-3 flex items-center gap-3 flex-wrap">
              {!deliveryImage ? (
                <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-bold cursor-pointer transition hover:opacity-90 shadow-sm"
                  style={{ backgroundColor: "#1D4ED8", color: "#fff" }}
                >
                  <Camera size={14} />
                  Tải ảnh giao hàng
                  <input type="file" accept="image/*" className="hidden" onChange={onDeliveryImageChange} />
                </label>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img src={deliveryImage} alt="Ảnh giao hàng" className="w-20 h-20 rounded-xl object-cover border-2 border-blue-300 shadow-sm" />
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                      <CheckCircle size={12} className="text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-green-700">Đã tải ảnh lên</p>
                    <label className="text-[11px] text-blue-600 cursor-pointer hover:underline font-semibold">
                      Đổi ảnh khác
                      <input type="file" accept="image/*" className="hidden" onChange={onDeliveryImageChange} />
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {o.status === "Chờ duyệt hủy" && o.cancelReason && (
        <div
          className="flex items-start gap-3 p-4 rounded-2xl"
          style={{ backgroundColor: "#FEF3C7", border: "1px solid #FDE68A" }}
        >
          <AlertTriangle size={18} className="shrink-0 mt-0.5" style={{ color: "#D97706" }} />
          <div>
            <p className="text-[13px] font-bold" style={{ color: "#92400E" }}>Yêu cầu hủy đơn hàng</p>
            <p className="text-[12px] mt-0.5" style={{ color: "#A16207" }}>Lý do: {o.cancelReason}</p>
          </div>
        </div>
      )}

      {o.status === "Hoàn thành" && (
        <div
          className="flex items-start gap-3 p-4 rounded-2xl"
          style={{ backgroundColor: "#F0FDF4", border: "1px solid #BBF7D0" }}
        >
          <CheckCircle size={18} className="shrink-0 mt-0.5" style={{ color: "#166534" }} />
          <div>
            <p className="text-[13px] font-bold" style={{ color: "#14532D" }}>Đơn hàng đã hoàn tất</p>
            <p className="text-[12px] mt-0.5" style={{ color: "#166534" }}>
              Khách hàng đã nhận đủ sản phẩm và thanh toán hoàn tất.
            </p>
          </div>
        </div>
      )}
      

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* LEFT COL */}
        <div className="lg:col-span-2 space-y-4">
          <CustomerInfoCard o={o} />

           {/* ── CARD: Sản phẩm chi tiết ── */}
           <div
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: "var(--background)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
          >
            <div
              className="px-5 py-3 flex items-center gap-2"
              style={{ borderBottom: "1px solid var(--grid-border)", backgroundColor: "var(--grid-header-bg)" }}
            >
              <Package size={14} style={{ color: "var(--brand-primary)" }} />
              <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: "var(--text-main)" }}>
                Sản phẩm đặt mua ({o.products.length})
              </span>
            </div>

            <div className="divide-y" style={{ borderColor: "var(--grid-border)" }}>
              {o.products.map((p, i) => (
                <div key={i} className="px-5 py-4 flex flex-col md:flex-row items-start gap-4">
                  {/* Tên SP + Chi tiết Kỹ thuật */}
                  <div className="flex-1 min-w-0 w-full space-y-3">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                        style={{ backgroundColor: "var(--bg-main)", border: "1px solid var(--grid-border)" }}
                      >
                        <Package size={16} style={{ color: "var(--text-secondary)" }} />
                      </div>
                      <div>
                        <p className="text-[14px] font-bold" style={{ color: "var(--text-main)" }}>{p.name}</p>
                        {p.note && (
                          <p className="text-[12px] italic mt-0.5" style={{ color: "var(--status-error)" }}>
                            * {p.note}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2.5 bg-[#F9F9F9] p-3 rounded-xl border border-dashed border-gray-200">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-gray-400">Chất liệu gỗ</p>
                        <p className="text-[12px] font-semibold text-gray-700">{p.material}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-gray-400">Kích thước</p>
                        <p className="text-[12px] font-semibold text-gray-700">{p.size}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-gray-400">Hoàn thiện</p>
                        <p className="text-[12px] font-semibold text-gray-700">{p.finish}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-gray-400">Hoa văn</p>
                        <p className="text-[12px] font-semibold text-gray-700">{p.pattern}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-gray-400">Bảo hành</p>
                        <p className="text-[12px] font-semibold text-gray-700">{p.warranty}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Số lượng & Giá */}
                  <div className="text-right shrink-0 w-full md:w-auto flex md:flex-col justify-between items-center md:items-end">
                    <div className="bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                      <span className="text-[11px] font-bold text-gray-500 uppercase">SL:</span>{" "}
                      <span className="text-[14px] font-bold text-gray-800">{p.qty}</span>
                    </div>
                    <div className="mt-2 text-right">
                       <p className="text-[16px] font-bold" style={{ color: "var(--text-main)" }}>
                         {p.price ? fmtCurrency(p.price * p.qty) : "—"}
                       </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {hasPricing && (
              <div
                className="px-5 py-3 flex items-center justify-between"
                style={{ borderTop: "1px solid var(--grid-border)", backgroundColor: "var(--grid-header-bg)" }}
              >
                <span className="text-[12px] font-bold uppercase" style={{ color: "var(--text-placeholder)" }}>Tổng đơn hàng</span>
                <span className="text-[16px] font-bold" style={{ color: "var(--brand-primary)" }}>{fmtCurrency(displayTotal)}</span>
              </div>
            )}
          </div>

          {/* ── CARD: Danh sách Lệnh Sản Xuất Liên Kết ── */}
          {o.type === "Đặt theo mẫu" && o.status === "Đang sản xuất" && (
            <div
              className="rounded-2xl overflow-hidden mt-4"
              style={{ backgroundColor: "var(--background)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
            >
              <div
                className="px-5 py-3 flex items-center justify-between"
                style={{ borderBottom: "1px solid var(--grid-border)", backgroundColor: "var(--grid-header-bg)" }}
              >
                <div className="flex items-center gap-2">
                  <Hammer size={14} style={{ color: "var(--brand-primary)" }} />
                  <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: "var(--text-main)" }}>
                    Lệnh sản xuất liên kết
                  </span>
                </div>
              </div>
              
              <div className="divide-y" style={{ borderColor: "var(--grid-border)" }}>
                {/* Giả lập Lệnh Sản Xuất linked với DH008 */}
                <div className="px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                     <span className="w-2 h-2 rounded-full bg-purple-600 shadow-[0_0_0_4px_#F5F3FF]" />
                     <div>
                       <p className="text-[13px] font-bold text-gray-800">LSX-2603-0003</p>
                       <p className="text-[12px] text-gray-500 mt-0.5">Bộ bàn ghế phòng khách (x1) • Thợ: Nguyễn Văn Đức</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-purple-100 text-purple-700">
                      Đang sản xuất (Đánh ráp)
                    </span>
                    <Link to="/owner/production/LSX003" className="text-[12px] font-bold text-blue-600 hover:underline">Xem chi tiết</Link>
                  </div>
                </div>

                <div className="px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                     <span className="w-2 h-2 rounded-full bg-green-600 shadow-[0_0_0_4px_#F0FDF4]" />
                     <div>
                       <p className="text-[13px] font-bold text-gray-800">LSX-2603-0004</p>
                       <p className="text-[12px] text-gray-500 mt-0.5">Kệ tivi nguyên khối (x1) • Thợ: Trần Minh Tâm</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-green-100 text-green-700">
                      Hoàn thành
                    </span>
                    <Link to="/owner/production/LSX004" className="text-[12px] font-bold text-blue-600 hover:underline">Xem chi tiết</Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── CARD: Ảnh mẫu khách gửi — Không hiện với Hàng Sẵn ── */}
          {o.type !== "Hàng sẵn" && o.sampleImages && o.sampleImages.length > 0 && (
            <MediaGallery images={o.sampleImages} />
          )}
        </div>

        {/* RIGHT COL */}
        <div className="space-y-4">
          {hasPricing && (
            <div
              className="rounded-2xl overflow-hidden"
              style={{ backgroundColor: "var(--background)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
            >
              <div
                className="px-5 py-3 flex items-center gap-2"
                style={{ borderBottom: "1px solid var(--grid-border)", backgroundColor: "var(--grid-header-bg)" }}
              >
                <CreditCard size={14} style={{ color: "var(--brand-primary)" }} />
                <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: "var(--text-main)" }}>Thanh toán</span>
              </div>
              <div className="px-5 py-4 space-y-2.5">
                <div className="flex justify-between text-[13px]">
                  <span style={{ color: "var(--text-secondary)" }}>Tổng tiền</span>
                  <span className="font-bold" style={{ color: "var(--text-main)" }}>{fmtCurrency(displayTotal)}</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span style={{ color: "var(--text-secondary)" }}>Đặt cọc</span>
                  <span className="font-bold" style={{ color: "#15803D" }}>{fmtCurrency(o.deposit)}</span>
                </div>
                <div className="pt-2.5" style={{ borderTop: "1px solid var(--grid-border)" }}>
                  <div className="flex justify-between text-[13px]">
                    <span className="font-bold" style={{ color: "var(--text-main)" }}>Còn lại</span>
                    <span className="font-bold" style={{ color: remaining > 0 ? "#DC2626" : "#15803D" }}>{fmtCurrency(remaining)}</span>
                  </div>
                </div>
                <div className="pt-2">
                  {o.paymentStatus === "full" && (
                    <Badge style={{ backgroundColor: "#F0FDF4", color: "#15803D", border: "1px solid #BBF7D0" }}>
                      <CreditCard size={11} /> Đã thanh toán đủ
                    </Badge>
                  )}
                  {o.paymentStatus === "partial" && (
                    <Badge style={{ backgroundColor: "#FFFBEB", color: "#B45309", border: "1px solid #FDE68A" }}>
                      <CreditCard size={11} /> Đặt cọc một phần
                    </Badge>
                  )}
                  {o.paymentStatus === "pending" && (
                    <Badge style={{ backgroundColor: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}>
                      <CreditCard size={11} /> Chưa thanh toán
                    </Badge>
                  )}
                  {o.status === "Chờ xác nhận" && (
                    <Badge style={{ backgroundColor: "#FFF7ED", color: "#C2410C", border: "1px solid #FED7AA" }}>
                      <Clock size={11} /> Đang đợi vào tiền cọc
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}

          <div
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: "var(--background)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
          >
            <div
              className="px-5 py-3 flex items-center gap-2"
              style={{ borderBottom: "1px solid var(--grid-border)", backgroundColor: "var(--grid-header-bg)" }}
            >
              <Truck size={14} style={{ color: "var(--brand-primary)" }} />
              <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: "var(--text-main)" }}>Giao hàng</span>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div className="flex items-start gap-2.5">
                <MapPin size={13} className="mt-0.5 shrink-0" style={{ color: "var(--text-placeholder)" }} />
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "var(--text-placeholder)" }}>Địa chỉ giao</p>
                  <p className="text-[12px] font-semibold mt-0.5" style={{ color: "var(--text-main)" }}>{o.customer.address}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Calendar size={13} className="mt-0.5 shrink-0" style={{ color: "var(--text-placeholder)" }} />
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "var(--text-placeholder)" }}>Ngày giao dự kiến</p>
                  <p className="text-[12px] font-semibold mt-0.5" style={{ color: "var(--text-main)" }}>{fmtDate(o.deliveryDate)}</p>
                </div>
              </div>
              {o.deliveryImage && (
                <div className="flex items-start gap-2.5 pt-2" style={{ borderTop: "1px solid var(--grid-border)" }}>
                  <Camera size={13} className="mt-0.5 shrink-0" style={{ color: "var(--text-placeholder)" }} />
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "var(--text-placeholder)" }}>Ảnh giao hàng</p>
                    <img src={o.deliveryImage} alt="Ảnh giao hàng" className="w-28 h-28 rounded-xl object-cover mt-1 border border-gray-200 shadow-sm" />
                  </div>
                </div>
              )}
              {deliveryImage && !o.deliveryImage && (
                <div className="flex items-start gap-2.5 pt-2" style={{ borderTop: "1px solid var(--grid-border)" }}>
                  <Camera size={13} className="mt-0.5 shrink-0" style={{ color: "var(--text-placeholder)" }} />
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "var(--text-placeholder)" }}>Ảnh giao hàng (đã tải lên)</p>
                    <img src={deliveryImage} alt="Ảnh giao hàng" className="w-28 h-28 rounded-xl object-cover mt-1 border-2 border-green-300 shadow-sm" />
                  </div>
                </div>
              )}
            </div>
          </div>

          <HistoryCard o={o} />
        </div>
      </div>
    </div>
  );
};

// ===================== MAIN EXPORT =====================
export default function OwnerOrderDetail() {
  const { id } = useParams();

  // Fake data fallback logic based on ID
  const idFallbackMap = {
     // Hàng sẵn
     "DH011": "DH-S01", "DH999": "DH-S01", "DH012": "DH-S02", "DH016": "DH-S03", "DH002": "DH-S04", "DH005": "DH-S05", "DH025": "DH-S06",
     
     // Hàng thô
     "DH017": "DH-T01", "DH019": "DH-T02", "DH022": "DH-T03", "DH023": "DH-T04", "DH026": "DH-T05", "DH029": "DH-T06", "DH031": "DH-T07", "DH032": "DH-T08",
     
     // Hàng đặt
     "DH001": "DH-D01", "DH015": "DH-D02", "DH008": "DH-D03", "DH013": "DH-D04", "DH036": "DH-D05", "DH033": "DH-D06", "DH006": "DH-D07", "DH021": "DH-D08"
  };
  
  // Catch all existing missing to DH-D01
  const fallbackRef = idFallbackMap[id] || "DH-D01"; 

  const o = MOCK_ORDERS[id] || { 
    ...MOCK_ORDERS[fallbackRef], 
    code: `DH-2603-${id?.replace(/\D/g, '') || "9999"}`,
  };

  const ss = statusStyle(o.status);
  const [deliveryImage, setDeliveryImage] = useState(null);

  const handleDeliveryImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setDeliveryImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const calculatedTotal = o.products.reduce((acc, p) => acc + (p.price || 0) * p.qty, 0);
  const displayTotal = o.total != null ? o.total : calculatedTotal;
  const hasPricing = displayTotal > 0 || o.total != null;
  const remaining = hasPricing ? displayTotal - (o.deposit || 0) : null;

  const navigate = useNavigate();
  const savedOrders = JSON.parse(localStorage.getItem("tpf_simulated_orders") || "[]");

  return (
    <>
      <PageHelmet title={`${o.code} | Chi tiết đơn hàng`} />

      <div className="flex flex-col h-full -m-6" style={{ backgroundColor: "var(--bg-main)" }}>
        {/* ╔══════════ STICKY HEADER ══════════╗ */}
        <div
          className="shrink-0 px-6 py-4"
          style={{
            backgroundColor: "var(--background)",
            borderBottom: "1px solid var(--grid-border)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div className="flex items-center justify-between">
            {/* Left: Back + Info */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition hover:opacity-70 cursor-pointer"
                style={{ color: "var(--text-secondary)", border: "1px solid var(--grid-border)" }}
              >
                <ArrowLeft size={15} />
              </button>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-[16px] font-bold" style={{ color: "var(--text-main)" }}>{o.code}</h1>
                  <Badge style={{ backgroundColor: ss.bg, color: ss.text, border: `1px solid ${ss.border}` }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ss.text }} />
                    {o.status}
                  </Badge>
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                    style={{ backgroundColor: "var(--bg-main)", color: "var(--text-placeholder)", border: "1px solid var(--grid-border)" }}
                  >
                    {o.type}
                  </span>
                </div>
                <p className="text-[11px] mt-0.5" style={{ color: "var(--text-placeholder)" }}>
                  Tạo bởi {o.salesPerson} • {fmtDateTime(o.date)}
                </p>
              </div>
            </div>

            {/* Right: Action buttons (Top level actions) */}
            <div className="flex items-center gap-2">


              {/* Nút Bàn giao Xưởng (Hàng đặt, Hàng thô nhảy thẳng từ Chờ xử lý -> Đang sản xuất) */}
              {o.status === "Chờ xử lý" && (o.type === "Hàng đặt" || o.type === "Hàng thô") && (
                 <button
                   className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold transition hover:opacity-90 cursor-pointer shadow-sm"
                   style={{ backgroundColor: "#4F46E5", color: "#fff" }}
                   onClick={() => {
                      if(window.confirm("Bàn giao đơn hàng này sang Xưởng sản xuất?")) {
                        const updated = savedOrders.map(order => 
                          (order.code === o.code || order.id === id) ? { ...order, status: "Đang sản xuất" } : order
                        );
                        localStorage.setItem("tpf_simulated_orders", JSON.stringify(updated));
                        alert("Đã bàn giao Xưởng thành công!");
                        // Deep link to production detail and auto-open modal for assignment
                        navigate("/owner/production/LSX001", { state: { autoOpenAssign: true } });
                      }
                   }}
                 >
                   <Hammer size={14} />
                   Bàn giao sản xuất
                 </button>
              )}
              
              {/* Nút Chuyển từ Chờ xử lý -> Chờ giao hàng (Dành cho Hàng Sẵn - Nhảy cóc) - ĐÃ GỠ THEO YÊU CẦU: Sales tự xử lý */}


              {o.status === "Đang sản xuất" && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 border border-indigo-100 shadow-sm">
                   <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse mr-2" />
                   <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-indigo-700 uppercase leading-none">Đang sản xuất tại Xưởng</span>
                      <span className="text-[10px] text-indigo-400 mt-0.5">Xử lý tiến độ tại mục Quản lý sản xuất</span>
                   </div>
                </div>
              )}

              {/* Chủ duyệt hủy đơn mà Sales yêu cầu */}
              {o.status === "Chờ duyệt hủy" && (
                <button
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold transition hover:opacity-90 cursor-pointer"
                  style={{ backgroundColor: "#DC2626", color: "#fff" }}
                  onClick={() => {
                    if(window.confirm("Bạn xác nhận duyệt phê chuẩn hủy đơn hàng này?")) {
                      const updated = savedOrders.map(order => 
                        (order.code === o.code || order.id === id) ? { ...order, status: "Đã hủy" } : order
                      );
                      localStorage.setItem("tpf_simulated_orders", JSON.stringify(updated));
                      alert("Đã duyệt hủy đơn hàng thành công!");
                      navigate("/owner/orders");
                    }
                  }}
                >
                  <XCircle size={14} />
                  Duyệt hủy đơn
                </button>
              )}

              {/* Chỉ cho phép Hủy trực tiếp ở trạng thái đầu */}
              {o.status === "Chờ xử lý" && (
                <button
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold transition hover:opacity-90 cursor-pointer"
                  style={{ backgroundColor: "#DC2626", color: "#fff" }}
                  onClick={() => {
                    if(window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) {
                      const updated = savedOrders.map(order => 
                        (order.code === o.code || order.id === id) ? { ...order, status: "Đã hủy" } : order
                      );
                      localStorage.setItem("tpf_simulated_orders", JSON.stringify(updated));
                      alert("Đã hủy đơn hàng!");
                      navigate("/owner/orders");
                    }
                  }}
                >
                  <XCircle size={14} />
                  Hủy đơn hàng
                </button>
              )}

              {o.status === "Chờ giao hàng" && (
                <button
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold transition hover:opacity-90 cursor-pointer shadow-sm"
                  style={{ backgroundColor: "#7C3AED", color: "#fff" }}
                  onClick={() => {
                        const updated = savedOrders.map(order => 
                          (order.code === o.code || order.id === id) ? { ...order, status: "Đang giao hàng" } : order
                        );
                        localStorage.setItem("tpf_simulated_orders", JSON.stringify(updated));
                        alert("Đã cập nhật trạng thái: Đang giao hàng");
                        navigate(0);
                  }}
                >
                  <Truck size={14} />
                  Bắt đầu xếp xe giao hàng
                </button>
              )}

              {o.status === "Đang giao hàng" && (
                <button
                  disabled={!deliveryImage}
                  onClick={() => {
                    const saved = JSON.parse(localStorage.getItem("tpf_simulated_orders") || "[]");
                    let needsAdd = true;
                    const updated = saved.map(order => {
                      if (order.code === o.code || order.id === id) { // fallback check
                        needsAdd = false;
                        return { ...order, status: "Hoàn thành", deliveryImage };
                      }
                      return order;
                    });
                    if (needsAdd) {
                       updated.push({ ...o, status: "Hoàn thành", deliveryImage, id });
                    }
                    localStorage.setItem("tpf_simulated_orders", JSON.stringify(updated));
                    alert("Cập nhật đơn hàng: Hoàn thành!");
                    navigate("/owner/orders");
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold transition hover:opacity-90 cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ backgroundColor: deliveryImage ? "#15803D" : "#9CA3AF", color: "#fff" }}
                  title={!deliveryImage ? "Vui lòng tải ảnh giao hàng trước" : ""}
                >
                  <CheckCircle size={14} />
                  Xác nhận hoàn thành
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ╔══════════ SCROLLABLE CONTENT ══════════╗ */}
        <StandardOrderView
          o={o}
          displayTotal={displayTotal}
          hasPricing={hasPricing}
          remaining={remaining}
          deliveryImage={deliveryImage}
          onDeliveryImageChange={handleDeliveryImageChange}
        />
      </div>

      {/* AssignWorkerModal đã được gỡ bỏ khỏi đây để tránh chồng chéo logic với Quản lý Sản xuất */}
    </>
  );
}
