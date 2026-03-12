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
  // ========== NHÓM 1: HÀNG SẴN ==========
  "DH-S01": {
    code: "DH-SAN-001", type: "Hàng sẵn", status: "Chờ xử lý",
    date: "2026-03-12T08:30:00", deliveryDate: "2026-03-14", fulfillmentType: "Giao tận nhà",
    customer: { name: "Nguyễn Văn Hùng", phone: "0912345678", address: "45 Đường Giải Phóng, Q. Hai Bà Trưng, Hà Nội" },
    salesPerson: "Bình Nguyễn", total: 12500000, deposit: 12500000, paymentStatus: "full",
    notes: "Khách yêu cầu giao trước 10h sáng.",
    products: [
      { name: "Ghế sofa đơn nỉ xanh rêu", material: "Khung gỗ sồi, nỉ Hàn Quốc", size: "80×85×95 cm", finish: "Chân gỗ óc chó tự nhiên", pattern: "Trơn hiện đại", qty: 2, price: 6250000 },
    ],
    timeline: [
      { time: "12/03/2026 08:30", label: "Tiếp nhận đơn hàng", desc: "Hệ thống ghi nhận đơn hàng sẵn. Chờ xác nhận kho.", active: true },
    ],
  },
  "DH-S02": {
    code: "DH-SAN-002", type: "Hàng sẵn", status: "Đang giao hàng",
    date: "2026-03-11T14:20:00", deliveryDate: "2026-03-12", fulfillmentType: "Lấy ngay",
    customer: { name: "Lê Thị Lan", phone: "0345678901", address: "Căn 1204, Tòa C, Vinhomes Ocean Park, Hà Nội" },
    salesPerson: "Bình Nguyễn", total: 3500000, deposit: 3500000, paymentStatus: "full",
    notes: "",
    products: [
      { name: "Bàn trà kim loại sơn tĩnh điện", material: "Sắt nghệ thuật uốn thủ công", size: "70×70×40 cm", finish: "Sơn tĩnh điện màu đen mờ", pattern: "Chân chữ X", qty: 1, price: 3500000 },
    ],
    timeline: [
      { time: "11/03/2026 14:20", label: "Tạo đơn", desc: "Khách thanh toán đủ tại quầy.", active: false },
      { time: "12/03/2026 09:00", label: "Đang giao hàng", desc: "Shipper đã lấy hàng tại kho và đang trên đường giao.", active: true },
    ],
  },
  "DH-S03": {
    code: "DH-SAN-003", type: "Hàng sẵn", status: "Giao hàng thành công",
    date: "2026-03-10T09:15:00", deliveryDate: "2026-03-11", fulfillmentType: "Lấy luôn",
    deliveryImage: "https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&q=80&w=400",
    customer: { name: "Trần Minh Quang", phone: "0909123456", address: "12 Lý Thường Kiệt, Q. Hoàn Kiếm, Hà Nội" },
    salesPerson: "Bình Nguyễn", total: 45000000, deposit: 45000000, paymentStatus: "full",
    notes: "",
    products: [
      { name: "Sập thờ gỗ gụ mật", material: "Gỗ gụ mật cao cấp", size: "197×107×127 cm", finish: "Đánh vecni thủ công 5 lớp", pattern: "Chạm mai điểu sắc nét", qty: 1, price: 45000000 },
    ],
    timeline: [
      { time: "10/03/2026 09:15", label: "Tạo đơn", desc: "Khách chọn hàng tại showroom, thanh toán 100%.", active: false },
      { time: "11/03/2026 08:00", label: "Chuẩn bị giao hàng", desc: "Xuất kho, đóng gói, lau bụi.", active: false },
      { time: "11/03/2026 14:30", label: "Giao hàng thành công", desc: "Khách đã xác nhận nhận hàng. Hoàn tất.", active: true },
    ],
  },
  "DH-S04": {
    code: "DH-SAN-004", type: "Hàng sẵn", status: "Chờ duyệt hủy",
    date: "2026-03-11T16:45:00", deliveryDate: "2026-03-13",
    cancelReason: "Khách đổi mẫu khác",
    customer: { name: "Phạm Thành Nam", phone: "0987654321", address: "456 Đường Nguyễn Huệ, Q. 1, TP.HCM" },
    salesPerson: "Bình Nguyễn", total: 8900000, deposit: 8900000, paymentStatus: "full",
    notes: "",
    products: [
      { name: "Kệ tivi gỗ công nghiệp 3 cánh", material: "Gỗ MDF chống ẩm", size: "180×40×60 cm", finish: "Phủ melamine vân gỗ óc chó", pattern: "Trơn hiện đại, tay nắm ẩn", qty: 1, price: 8900000 },
    ],
    timeline: [
      { time: "11/03/2026 16:45", label: "Tạo đơn hàng", desc: "Khách đặt mua tại showroom.", active: false },
      { time: "12/03/2026 09:00", label: "Yêu cầu hủy", desc: "Lý do: Khách đổi mẫu khác.", active: false },
      { time: "12/03/2026 09:05", label: "Chờ duyệt hủy", desc: "Chờ chủ cửa hàng phê duyệt hủy đơn.", active: true },
    ],
  },
  "DH-S05": {
    code: "DH-SAN-005", type: "Hàng sẵn", status: "Đã hủy",
    date: "2026-03-09T10:00:00", deliveryDate: "2026-03-10",
    cancelReason: "Khách không còn nhu cầu",
    customer: { name: "Đinh Công Vinh", phone: "0944556677", address: "789 Trần Hưng Đạo, Q. 5, TP.HCM" },
    salesPerson: "Bình Nguyễn", total: 2100000, deposit: 0, paymentStatus: "none",
    notes: "",
    products: [
      { name: "Ghế gỗ tần bì phòng ăn", material: "Gỗ tần bì Nga", size: "45×50×92 cm", finish: "Sơn PU bóng mờ tự nhiên", pattern: "Đơn giản, chắc chắn", qty: 2, price: 1050000 },
    ],
    timeline: [
      { time: "09/03/2026 10:00", label: "Tạo đơn hàng", desc: "Khách đặt hàng qua điện thoại.", active: false },
      { time: "09/03/2026 15:00", label: "Đã hủy", desc: "Chủ cửa hàng duyệt hủy. Lý do: Khách không còn nhu cầu.", active: true },
    ],
  },

  // ========== NHÓM 2: HÀNG THÔ ==========
  "DH-T01": {
    code: "DH-THO-001", type: "Hàng thô", status: "Chờ gia công",
    date: "2026-03-12T10:00:00", deliveryDate: "2026-03-20",
    customer: { name: "Hoàng Nguyệt Ánh", phone: "0978901234", address: "789 Võ Văn Tần, Q. 3, TP.HCM" },
    salesPerson: "Bình Nguyễn", total: 56000000, deposit: 15000000, paymentStatus: "partial",
    notes: "Khách yêu cầu đánh ráp kỹ, sơn PU bóng, không bị lỗi bề mặt.",
    products: [
      { name: "Sập thờ gỗ mít (Mộc thô)", material: "Gỗ mít ta nguyên khối", size: "220×110×130 cm", finish: "Chờ gia công sơn PU", pattern: "Chạm tứ linh truyền thống", qty: 1, price: 56000000 },
    ],
    timeline: [
      { time: "12/03/2026 10:00", label: "Tiếp nhận mộc thô", desc: "Khách chọn bộ mộc tại kho. Đã đặt cọc 15tr.", active: false },
      { time: "12/03/2026 11:00", label: "Chờ gia công", desc: "Đã ghi nhận yêu cầu gia công. Chờ phân công thợ.", active: true },
    ],
  },
  "DH-T02": {
    code: "DH-THO-002", type: "Hàng thô", status: "Đang gia công",
    date: "2026-03-11T15:30:00", deliveryDate: "2026-03-15",
    customer: { name: "Đặng Tuấn Kiệt", phone: "0931234567", address: "123 Trần Hưng Đạo, Q. 5, TP.HCM" },
    salesPerson: "Bình Nguyễn", total: 8200000, deposit: 2000000, paymentStatus: "partial",
    notes: "Cần đánh ráp kỹ, sơn bóng mờ, không bị lỗi bề mặt.",
    products: [
      { name: "Trường kỷ gỗ lim (Mộc thô)", material: "Gỗ lim Lào cao cấp", size: "Dài 2m1, ngồi 3 người", finish: "Đang đánh ráp + sơn PU mờ", pattern: "Tứ quý chạm nổi", qty: 1, price: 8200000 },
    ],
    timeline: [
      { time: "11/03/2026 15:30", label: "Tiếp nhận mộc thô", desc: "Khách chọn bộ tại showroom.", active: false },
      { time: "11/03/2026 16:00", label: "Đặt cọc", desc: "Khách cọc 2tr, bắt đầu gia công.", active: false },
      { time: "12/03/2026 08:00", label: "Đang gia công", desc: "Thợ Nguyễn Văn Đức tiếp nhận, đang đánh ráp.", active: true },
    ],
  },
  "DH-T03": {
    code: "DH-THO-003", type: "Hàng thô", status: "Hoàn thiện sản phẩm",
    date: "2026-03-10T08:00:00", deliveryDate: "2026-03-14",
    finishedImage: "https://images.unsplash.com/photo-1599690924032-4e55e5108bb6?auto=format&fit=crop&q=80&w=400",
    customer: { name: "Vũ Hải Đăng", phone: "0966778899", address: "34 Lê Lợi, Q. Hoàn Kiếm, Hà Nội" },
    salesPerson: "Bình Nguyễn", total: 12500000, deposit: 4000000, paymentStatus: "partial",
    notes: "Màu sơn: nâu vân gỗ tự nhiên. Sơn 3 lớp PU.",
    products: [
      { name: "Bộ bàn ghế gỗ gụ phòng trà", material: "Gỗ gụ mật Bắc Kạn", size: "Bàn: 90×50×45 cm, Ghế: 2 chiếc", finish: "PU bóng 3 lớp đã hoàn thiện", pattern: "Trơn, kết hợp đường chỉ nổi", qty: 1, price: 12500000 },
    ],
    timeline: [
      { time: "10/03/2026 08:00", label: "Tiếp nhận mộc", desc: "Nhận mộc từ xưởng ngoài.", active: false },
      { time: "11/03/2026 09:00", label: "Đang gia công", desc: "Thợ sơn tiến hành đánh ráp lần 1.", active: false },
      { time: "12/03/2026 15:00", label: "Hoàn thiện sản phẩm", desc: "Sơn xong, đang phơi khô. Chờ kiểm tra QC.", active: true },
    ],
  },
  "DH-T04": {
    code: "DH-THO-004", type: "Hàng thô", status: "Đang giao hàng",
    date: "2026-03-09T11:20:00", deliveryDate: "2026-03-12",
    customer: { name: "Bùi Tiến Dũng", phone: "0922334455", address: "56 Nguyễn Trãi, Q. Thanh Xuân, Hà Nội" },
    salesPerson: "Bình Nguyễn", total: 28000000, deposit: 10000000, paymentStatus: "partial",
    notes: "Giao trước 12h. Gọi trước khi đến.",
    products: [
      { name: "Tủ thờ gỗ hương đỏ", material: "Gỗ hương đỏ Lào nguyên khối", size: "120×45×180 cm", finish: "PU cánh gián bóng nhẹ", pattern: "Chạm tứ linh + câu đối", qty: 1, price: 28000000 },
    ],
    timeline: [
      { time: "09/03/2026 11:20", label: "Tạo đơn", desc: "Khách đặt gia công tại cửa hàng.", active: false },
      { time: "10/03/2026 08:00", label: "Đang gia công", desc: "Thợ Trần Minh Tâm tiến hành.", active: false },
      { time: "12/03/2026 08:00", label: "Hoàn thiện sản phẩm", desc: "QC thông qua, đóng gói xong.", active: false },
      { time: "12/03/2026 10:00", label: "Đang giao hàng", desc: "Xe tải đang trên đường tới địa chỉ khách.", active: true },
    ],
  },
  "DH-T05": {
    code: "DH-THO-005", type: "Hàng thô", status: "Giao hàng thành công",
    date: "2026-03-08T14:45:00", deliveryDate: "2026-03-11",
    deliveryImage: "https://images.unsplash.com/photo-1617806118233-ef203e91122b?auto=format&fit=crop&q=80&w=400",
    customer: { name: "Đinh Công Thành", phone: "0988776655", address: "78 Hai Bà Trưng, Q. 1, TP.HCM" },
    salesPerson: "Bình Nguyễn", total: 15400000, deposit: 15400000, paymentStatus: "full",
    notes: "",
    products: [
      { name: "Bộ salon gỗ nu xà cừ", material: "Gỗ nu xà cừ", size: "Bàn: 120×65×45 cm, Ghế đơn ×2", finish: "PU bóng giữ vân gỗ tự nhiên", pattern: "Trơn hiện đại", qty: 1, price: 15400000 },
    ],
    timeline: [
      { time: "08/03/2026 14:45", label: "Tạo đơn", desc: "Khách đặt gia công.", active: false },
      { time: "09/03/2026 08:00", label: "Đang gia công", desc: "Bắt đầu đánh ráp và sơn PU.", active: false },
      { time: "10/03/2026 16:00", label: "Hoàn thiện sản phẩm", desc: "Sơn hoàn thiện, QC thông qua.", active: false },
      { time: "11/03/2026 10:00", label: "Giao hàng thành công", desc: "Khách đã nhận và thanh toán đủ tiền hàng.", active: true },
    ],
  },

  // ========== NHÓM 3: HÀNG ĐẶT ==========
  "DH-D01": {
    code: "DH-DAT-001", type: "Hàng đặt", status: "Chờ nhập hàng",
    date: "2026-03-12T11:15:00", deliveryDate: "2026-03-30",
    customer: { name: "Nguyễn Thị Hồng", phone: "0912123123", address: "KĐT Times City, Q. Hai Bà Trưng, Hà Nội" },
    salesPerson: "Bình Nguyễn", total: 75000000, deposit: 25000000, paymentStatus: "partial",
    notes: "Yêu cầu gỗ hương đá đặc, đục tay kỹ lưỡng, sơn PU bóng 5 lớp.",
    products: [
      { name: "Tủ thờ đục kỹ gỗ hương đá", material: "Gỗ hương đá nguyên khối", size: "160×50×220 cm", finish: "Sơn PU bóng 5 lớp", pattern: "Chạm tứ linh cuốn thư thủ công", qty: 1, price: 75000000 },
    ],
    timeline: [
      { time: "12/03/2026 11:15", label: "Chờ nhập hàng", desc: "Khách chốt bản vẽ, đặt cọc 25tr. Cửa hàng đang đi nhập mộc.", active: true },
    ],
  },
  "DH-D02": {
    code: "DH-DAT-002", type: "Hàng đặt", status: "Đang gia công",
    date: "2026-03-05T09:00:00", deliveryDate: "2026-03-25",
    customer: { name: "Lê Văn Tám", phone: "0321654987", address: "Biệt thự 12, Khu compound Thảo Điền, Q. 2, TP.HCM" },
    salesPerson: "Bình Nguyễn", total: 120000000, deposit: 40000000, paymentStatus: "partial",
    notes: "Bộ phòng khách full gỗ hương đá. Khách yêu cầu tiến độ cập nhật hàng tuần.",
    products: [
      { name: "Bộ Salon gỗ hương đá 5 món", material: "Gỗ hương đá Nam Phi", size: "Bàn: 150×80×45 cm, Trường kỷ: 220 cm, Ghế đơn ×2, Đôn ×2", finish: "Sơn PU trần bóng mờ", pattern: "Chạm nghê bảo đỉnh + triện cổ", qty: 1, price: 90000000 },
      { name: "Kệ tivi gỗ hương đá nguyên khối", material: "Gỗ hương đá", size: "240×45×60 cm", finish: "PU đồng màu bộ bàn ghế", pattern: "Trơn, phẳng hiện đại", qty: 1, price: 30000000 },
    ],
    timeline: [
      { time: "05/03/2026 09:00", label: "Ký hợp đồng", desc: "Khách ký HĐ và cọc 40tr.", active: false },
      { time: "06/03/2026 08:00", label: "Phân công thợ", desc: "Thợ Nguyễn Văn Đức + Lê Văn Hùng phụ trách.", active: false },
      { time: "07/03/2026 08:00", label: "Đang gia công", desc: "Đang gia công tại xưởng. Dự kiến hoàn thiện 20/03.", active: true },
    ],
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
    "Chờ xử lý":           { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
    "Chờ nhập hàng":       { bg: "#FFFBEB", text: "#B45309", border: "#FDE68A" },
    "Chờ gia công":        { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
    "Đang gia công":       { bg: "#F5F3FF", text: "#7C3AED", border: "#DDD6FE" },
    "Hoàn thiện sản phẩm": { bg: "#ECFDF5", text: "#047857", border: "#A7F3D0" },
    "Chuẩn bị giao hàng":  { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
    "Đang giao hàng":      { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
    "Giao hàng thành công": { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
    "Chờ duyệt hủy":      { bg: "#FEF3C7", text: "#D97706", border: "#FDE68A" },
    "Đã hủy":              { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA" },
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

// --- KIỂU HIỂN THỊ CHỜ BÁO GIÁ ---
// Chuyên dụng để nhập giá
const QuoteBuilderView = ({ o, quotedPrices, handlePriceChange, displayTotal }) => {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      <div
        className="flex items-start gap-3 p-4 rounded-2xl"
        style={{ backgroundColor: "#FFFBEB", border: "1px solid #FDE68A" }}
      >
        <Calculator size={18} className="shrink-0 mt-0.5" style={{ color: "#B45309" }} />
        <div>
          <p className="text-[13px] font-bold" style={{ color: "#92400E" }}>Đơn hàng cần Báo giá</p>
          <p className="text-[12px] mt-0.5" style={{ color: "#A16207" }}>
            Nhân viên {o.salesPerson} đã lên đơn. Bạn vui lòng kiểm tra thông số kỹ thuật và tạo báo giá.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 space-y-4">
          <CustomerInfoCard o={o} />

          {/* Table nhập báo giá */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: "var(--background)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
          >
            <div
              className="px-5 py-3 flex items-center gap-2"
              style={{ borderBottom: "1px solid var(--grid-border)", backgroundColor: "var(--grid-header-bg)" }}
            >
              <Package size={14} style={{ color: "#B45309" }} />
              <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: "var(--text-main)" }}>
                Bảng tính báo giá ({o.products.length} SP)
              </span>
            </div>
            <div className="divide-y" style={{ borderColor: "var(--grid-border)" }}>
              {o.products.map((p, i) => (
                <div key={i} className="px-5 py-4 flex flex-col md:flex-row items-center gap-4">
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                        style={{ backgroundColor: "var(--bg-main)", border: "1px solid var(--grid-border)" }}
                      >
                        <Package size={16} style={{ color: "var(--text-secondary)" }} />
                      </div>
                      <div>
                        <p className="text-[14px] font-bold" style={{ color: "var(--text-main)" }}>{p.name}</p>
                        <p className="text-[12px] mt-0.5 text-gray-600">Quy cách: {p.size} | {p.material} | {p.finish}</p>
                        {p.note && (
                          <p className="text-[12px] italic mt-0.5" style={{ color: "var(--status-error)" }}>
                            * {p.note}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="shrink-0 flex items-center gap-4 bg-gray-50/50 p-3 rounded-xl border border-dashed border-gray-200 w-full md:w-auto">
                    <div className="text-center">
                      <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Số lượng</span>
                      <span className="text-[15px] font-bold text-gray-800 bg-white px-3 py-1 rounded shadow-sm border border-gray-100">{p.qty}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Đơn giá báo khách (đ)</span>
                      <input
                        type="text"
                        placeholder="Nhập giá..."
                        value={quotedPrices[i] ? new Intl.NumberFormat("vi-VN").format(quotedPrices[i]) : ""}
                        onChange={(e) => handlePriceChange(i, e.target.value)}
                        className="h-9 px-3 w-36 text-right rounded-md text-[14px] font-bold focus:outline-none focus:ring-2 transition"
                        style={{ border: "1px solid #FDE68A", color: "#B45309", backgroundColor: "#FFFBEB" }}
                      />
                    </div>
                    {(quotedPrices[i] > 0) && (
                      <div className="text-right pl-2 ml-2 border-l border-gray-200">
                        <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Thành tiền</span>
                        <span className="text-[15px] font-bold" style={{ color: "var(--brand-primary)" }}>
                          {fmtCurrency(Number(quotedPrices[i]) * p.qty)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div
              className="px-5 py-4 flex flex-col items-end gap-1"
              style={{ borderTop: "1px solid var(--grid-border)", backgroundColor: "var(--grid-header-bg)" }}
            >
              <span className="text-[12px] font-bold uppercase" style={{ color: "var(--text-placeholder)" }}>Tổng thành tiền dự kiến</span>
              <span className="text-[20px] font-bold" style={{ color: "var(--brand-primary)" }}>{fmtCurrency(displayTotal)}</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          {/* Card action */}
          <div
            className="rounded-2xl overflow-hidden p-5 flex flex-col items-center justify-center text-center space-y-3"
            style={{ backgroundColor: "var(--background)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid var(--grid-border)" }}
          >
             <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-1">
                <FileText size={20} className="text-orange-600" />
             </div>
             <p className="text-[14px] font-bold" style={{ color: "var(--text-main)" }}>Hoàn tất Báo giá</p>
             <p className="text-[12px] text-gray-500">Sau khi chắc chắn với mức giá cho {o.products.length} sản phẩm, hãy xác nhận gửi.</p>
             <button
               className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold transition hover:opacity-90 cursor-pointer disabled:opacity-50"
               style={{ backgroundColor: "#B45309", color: "#fff" }}
               disabled={displayTotal <= 0}
             >
               Gửi báo giá ngay
             </button>
          </div>

          <HistoryCard o={o} />
        </div>
      </div>
    </div>
  );
};

// --- KIỂU HIỂN THỊ ĐƠN HÀNG THÔNG THƯỜNG ---
// Chuyên dụng để theo dõi đơn (Đã chốt giá, Đang sản xuất, Giao hàng...)
const StandardOrderView = ({ o, displayTotal, hasPricing, remaining, deliveryImage, onDeliveryImageChange }) => {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      {/* ── BANNER ── */}
      {o.status === "Hoàn thiện sản phẩm" && (
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
                <p className="text-[14px] font-bold" style={{ color: "#14532D" }}>Thợ đã báo cáo Hoàn thiện!</p>
                <p className="text-[13px] mt-0.5" style={{ color: "#15803D" }}>
                  Bạn và QC có thể xem ảnh sản phẩm hoàn thiện. Nếu đạt chuẩn, hãy duyệt để chuyển xếp lịch giao hàng.
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

      {o.status === "Giao hàng thành công" && (
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
      
      {o.status === "Chờ xác nhận" && (
        <div
          className="flex items-start gap-3 p-4 rounded-2xl"
          style={{ backgroundColor: "#FFF7ED", border: "1px solid #FED7AA" }}
        >
          <Phone size={18} className="shrink-0 mt-0.5" style={{ color: "#C2410C" }} />
          <div>
            <p className="text-[13px] font-bold" style={{ color: "#9A3412" }}>Đơn hàng Đang chờ Khách xác nhận</p>
            <p className="text-[12px] mt-0.5" style={{ color: "#B45309" }}>
              Báo giá đã được chủ cửa hàng chốt. Sales đang trực tiếp trao đổi và làm việc với khách hàng để chốt phương án cuối cùng và tiền cọc. Nhấn "Gửi nhắc nhở tư vấn" nếu đơn treo quá lâu.
            </p>
          </div>
        </div>
      )}

      {o.status === "Đã báo giá" && (
        <div
          className="flex items-start gap-3 p-4 rounded-2xl"
          style={{ backgroundColor: "#ECFDF5", border: "1px solid #A7F3D0" }}
        >
          <FileText size={18} className="shrink-0 mt-0.5" style={{ color: "#047857" }} />
          <div>
            <p className="text-[13px] font-bold" style={{ color: "#065F46" }}>Đã ra giá thành công</p>
            <p className="text-[12px] mt-0.5" style={{ color: "#047857" }}>
              Bạn đã lên Báo giá xong cho sản phẩm này. Bấm "Chuyển chờ xác nhận" phòng Sale báo cho khách.
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
     // Chờ báo giá -> DH001
     "DH001": "DH001", "DH015": "DH001", "DH033": "DH001",
     // Đã báo giá -> DH006
     "DH006": "DH006", "DH021": "DH006", "DH041": "DH006",
     // Chờ xác nhận -> DH010
     "DH010": "DH010", "DH024": "DH010", "DH042": "DH010",
     // Xác nhận đơn hàng -> DH003
     "DH003": "DH003",
     // Đang sản xuất -> DH008
     "DH008": "DH008", "DH013": "DH008", "DH036": "DH008",
     
     // Hàng sẵn Giao hàng thành công -> DH002
     "DH002": "DH002", "DH009": "DH002", "DH014": "DH002", "DH020": "DH002", "DH028": "DH002", "DH034": "DH002", "DH018": "DH002", "DH039": "DH002",
     
     // Hàng sẵn Chờ xử lý / Đang chuẩn bị / Đang giao hàng -> DH011
     "DH011": "DH011", "DH999": "DH011", "DH012": "DH011", "DH016": "DH011", "DH017": "DH011", "DH019": "DH011", "DH022": "DH011", "DH023": "DH011", "DH026": "DH011", "DH029": "DH011", "DH031": "DH011", "DH032": "DH011", "DH035": "DH011", "DH038": "DH011", "DH040": "DH011", "DH007": "DH011",
     
     // Các trạng thái Hàng sẵn khác (Chờ hủy, Hủy) -> DH005
     "DH005": "DH005", "DH025": "DH005", "DH027": "DH005", "DH037": "DH005",
  };
  
  const fallbackRef = idFallbackMap[id] || "DH008"; 

  const o = MOCK_ORDERS[id] || { 
    ...MOCK_ORDERS[fallbackRef], 
    code: `DH-2603-${id?.replace(/\D/g, '') || "9999"}`,
  };

  const ss = statusStyle(o.status);
  
  const [quotedPrices, setQuotedPrices] = useState({});
  const [deliveryImage, setDeliveryImage] = useState(null);

  const handleDeliveryImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setDeliveryImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handlePriceChange = (index, val) => {
    const num = val.replace(/\D/g, "");
    setQuotedPrices((prev) => ({ ...prev, [index]: num }));
  };

  const calculatedTotal = o.products.reduce((acc, p, i) => {
    const priceVal = o.status === "Chờ báo giá" ? Number(quotedPrices[i] || 0) : (p.price || 0);
    return acc + (priceVal * p.qty);
  }, 0);

  const displayTotal = o.status === "Chờ báo giá" 
    ? calculatedTotal 
    : (o.total != null ? o.total : calculatedTotal);
    
  const hasPricing = o.status === "Chờ báo giá" ? displayTotal > 0 : o.total != null;
  const remaining = hasPricing ? displayTotal - (o.deposit || 0) : null;

  const navigate = useNavigate();

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
              {o.status === "Đã báo giá" && (
                 <button
                   className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold transition hover:opacity-90 cursor-pointer shadow-sm"
                   style={{ backgroundColor: "#059669", color: "#fff" }}
                 >
                   <FileText size={14} />
                   Báo Sale tư vấn & Chuyển chờ XN
                 </button>
              )}

              {o.status === "Chờ xác nhận" && (
                 <button
                   className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold transition hover:opacity-90 cursor-pointer shadow-sm"
                   style={{ backgroundColor: "#FFF7ED", color: "#C2410C", border: "1px solid #FED7AA" }}
                 >
                   <Phone size={14} />
                   Gửi nhắc nhở Sales
                 </button>
              )}
              
              {o.status === "Xác nhận đơn hàng" && o.type === "Đặt theo mẫu" && (
                <button
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold transition hover:opacity-90 cursor-pointer shadow-sm"
                  style={{ backgroundColor: "var(--brand-primary)", color: "#fff" }}
                >
                  <Hammer size={14} />
                  Duyệt triển khai sản xuất
                </button>
              )}

              {o.status === "Chờ duyệt hủy" && (
                <button
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold transition hover:opacity-90 cursor-pointer"
                  style={{ backgroundColor: "#DC2626", color: "#fff" }}
                >
                  <XCircle size={14} />
                  Duyệt hủy đơn
                </button>
              )}

              {o.status === "Hoàn thiện sản phẩm" && (
                <button
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold transition hover:opacity-90 cursor-pointer shadow-sm"
                  style={{ backgroundColor: "#059669", color: "#fff" }}
                  onClick={() => alert("Đã duyệt chuyển sang Chuẩn bị giao hàng!")}
                >
                  <Package size={14} />
                  Duyệt & Chuẩn bị giao
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
                        return { ...order, status: "Giao hàng thành công", deliveryImage };
                      }
                      return order;
                    });
                    if (needsAdd) {
                       updated.push({ ...o, status: "Giao hàng thành công", deliveryImage, id });
                    }
                    localStorage.setItem("tpf_simulated_orders", JSON.stringify(updated));
                    alert("Hoàn tất giao hàng thành công!");
                    navigate("/owner/orders");
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold transition hover:opacity-90 cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ backgroundColor: deliveryImage ? "#15803D" : "#9CA3AF", color: "#fff" }}
                  title={!deliveryImage ? "Vui lòng tải ảnh giao hàng trước" : ""}
                >
                  <CheckCircle size={14} />
                  Xác nhận giao thành công
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ╔══════════ SCROLLABLE CONTENT ══════════╗ */}
        {o.status === "Chờ báo giá" 
          ? <QuoteBuilderView o={o} quotedPrices={quotedPrices} handlePriceChange={handlePriceChange} displayTotal={displayTotal} />
          : <StandardOrderView o={o} displayTotal={displayTotal} hasPricing={hasPricing} remaining={remaining} deliveryImage={deliveryImage} onDeliveryImageChange={handleDeliveryImageChange} />
        }
      </div>
    </>
  );
}
