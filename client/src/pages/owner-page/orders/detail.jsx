/**
 * Component OwnerOrderDetail
 * Chi tiết đơn hàng — Chủ cửa hàng
 *
 * Giao diện thay đổi theo trạng thái:
 * - Chờ báo giá: chưa có giá, hiện nút Báo giá
 * - Các trạng thái khác: hiện đầy đủ thông tin
 *
 * Created Date: 06/03/2026
 */

import { useParams, Link } from "react-router-dom";
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
} from "lucide-react";

// ===================== MOCK DATA =====================
const MOCK_ORDERS = {
  // ĐƠN CHỜ BÁO GIÁ — chưa có giá
  DH001: {
    code: "DH-2603-0010",
    type: "Đặt theo mẫu",
    status: "Chờ báo giá",
    date: "2026-03-05T16:05:00",
    deliveryDate: null,
    customer: {
      name: "Vũ Phương Thảo",
      phone: "0990 123 456",
      address: "123 Đường Lê Lợi, Quận 1, TP.HCM",
    },
    salesPerson: "Nguyễn Văn Bình",
    total: null,
    deposit: null,
    paymentStatus: null,
    paymentMethod: null,
    notes: "Khách yêu cầu gỗ sồi Mỹ, hoàn thiện sơn PU",
    products: [
      { 
        name: "Tủ bếp chữ L", 
        material: "Gỗ sồi Nga", 
        finish: "Sơn PU màu óc chó", 
        pattern: "Cánh phẳng hiện đại",
        size: "Dài 3.5m x Cao 2.2m", 
        warranty: "5 năm",
        note: "Khách tự trang bị phụ kiện bếp",
        qty: 1, 
        price: null 
      },
      { 
        name: "Bàn ăn nguyên tấm", 
        material: "Gỗ gõ đỏ pachy", 
        finish: "PU trần, lau dầu", 
        pattern: "Cạnh tự nhiên (Live edge)",
        size: "D220 x R90 x Dày 10cm", 
        warranty: "Trọn đời",
        note: null,
        qty: 1, 
        price: null 
      },
    ],
    timeline: [
      { time: "05/03/2026 16:05", label: "Tạo đơn hàng", desc: "NV Nguyễn Văn Bình tạo đơn đặt theo mẫu", active: false },
      { time: "05/03/2026 16:10", label: "Chờ báo giá", desc: "Đơn chờ chủ cửa hàng báo giá", active: true },
    ],
  },
  // ĐƠN GIAO HÀNG THÀNH CÔNG (Hoàn thành)
  DH002: {
    code: "DH-2603-0009",
    type: "Hàng sẵn",
    status: "Giao hàng thành công",
    date: "2026-03-05T13:20:00",
    deliveryDate: "2026-03-06",
    customer: {
      name: "Đinh Quang Hiếu",
      phone: "0989 012 345",
      address: "123 Đường Nam Kỳ Khởi Nghĩa, Quận 1, TP.HCM",
    },
    salesPerson: "Lê Minh Tuấn",
    total: 1200000,
    deposit: 1200000,
    paymentStatus: "full",
    paymentMethod: "Chuyển khoản",
    notes: "Giao hỏa tốc trong ngày",
    products: [
      { 
        name: "Sập thờ mai điểu", 
        material: "Gỗ gụ mật", 
        finish: "Đánh vecni thủ công", 
        pattern: "Chạm mai điểu sắc nét",
        size: "197×107×127 cm", 
        warranty: "10 năm",
        note: "Kèm 1 bàn cơm nhỏ",
        qty: 1, 
        price: 36000000 
      },
    ],
    timeline: [
      { time: "05/03/2026 13:20", label: "Tạo đơn hàng", desc: "NV Lê Minh Tuấn tạo đơn", active: false },
      { time: "05/03/2026 13:30", label: "Đang chuẩn bị", desc: "Kho xuất hàng, đóng gói", active: false },
      { time: "06/03/2026 09:00", label: "Đang giao hàng", desc: "Giao cho đơn vị vận chuyển", active: false },
      { time: "06/03/2026 14:30", label: "Giao hàng thành công", desc: "Khách đã nhận và thanh toán đủ", active: true },
    ],
  },
  // ĐƠN CHỜ DUYỆT HỦY
  DH005: {
    code: "DH-2603-0005",
    type: "Hàng sẵn",
    status: "Chờ duyệt hủy",
    date: "2026-03-03T16:20:00",
    deliveryDate: "2026-03-10",
    cancelReason: "Khách đổi ý, muốn chọn mẫu khác",
    customer: {
      name: "Võ Đức Anh",
      phone: "0945 678 901",
      address: "456 Đường Nguyễn Huệ, Quận 3, TP.HCM",
    },
    salesPerson: "Trần Thị Cúc",
    total: 3400000,
    deposit: 3400000,
    paymentStatus: "full",
    paymentMethod: "Tiền mặt",
    notes: "",
    products: [
      { 
        name: "Lục bình phong thủy", 
        material: "Gỗ cẩm lai", 
        finish: "PU bóng mờ giữ vân", 
        pattern: "Tiện trơn nguyên khối",
        size: "Cao 1m6, đường kính 45cm", 
        warranty: "Bảo hành nứt nẻ 1 đổi 1",
        note: null,
        qty: 1, 
        price: 28000000 
      },
    ],
    timeline: [
      { time: "03/03/2026 16:20", label: "Tạo đơn hàng", desc: "NV Trần Thị Cúc tạo đơn hàng sẵn", active: false },
      { time: "03/03/2026 17:00", label: "Đang chuẩn bị", desc: "Xuất kho, đóng gói sản phẩm", active: false },
      { time: "04/03/2026 09:00", label: "Yêu cầu hủy", desc: "Khách yêu cầu hủy — Lý do: đổi ý chọn mẫu khác", active: false },
      { time: "04/03/2026 09:05", label: "Chờ duyệt hủy", desc: "Chờ chủ cửa hàng phê duyệt", active: true },
    ],
  },
  // ĐƠN ĐANG SẢN XUẤT — có đầy đủ giá
  DH008: {
    code: "DH-2603-0008",
    type: "Đặt theo mẫu",
    status: "Đang sản xuất",
    date: "2026-03-01T08:30:00",
    deliveryDate: "2026-03-25",
    customer: {
      name: "Hoàng Nguyệt Ánh",
      phone: "0978 901 234",
      address: "789 Đường Võ Văn Tần, Quận 3, TP.HCM",
    },
    salesPerson: "Lê Minh Tuấn",
    total: 56000000,
    deposit: 16800000,
    paymentStatus: "partial",
    paymentMethod: "Chuyển khoản",
    notes: "Ghế bọc da nhập khẩu",
    products: [
      { 
        name: "Bộ bàn ghế phòng khách", 
        material: "Gỗ hương đá Nam Phi", 
        finish: "Sơn PU trần bóng mờ", 
        pattern: "Chạm nghê bảo đỉnh",
        size: "Bàn 200×80×45cm, Đoản 220cm", 
        warranty: "15 năm mối mọt",
        note: "Mặt bàn đục nguyên khối không ghép",
        qty: 1, 
        price: 35000000 
      },
      { 
        name: "Kệ tivi nguyên khối", 
        material: "Gỗ hương đá", 
        finish: "PU đồng màu bộ bàn ghế", 
        pattern: "Trơn, phẳng",
        size: "240×45×60 cm", 
        warranty: "10 năm",
        note: null,
        qty: 1, 
        price: 21000000 
      },
    ],
    timeline: [
      { time: "01/03/2026 08:30", label: "Tạo đơn hàng", desc: "NV Lê Minh Tuấn tạo đơn đặt theo mẫu", active: false },
      { time: "01/03/2026 10:00", label: "Đã báo giá", desc: "Chủ cửa hàng báo giá 56.000.000đ", active: false },
      { time: "02/03/2026 14:00", label: "Xác nhận đơn hàng", desc: "Khách xác nhận, đặt cọc 30%", active: false },
      { time: "03/03/2026 08:00", label: "Đang sản xuất", desc: "Bắt đầu gia công tại xưởng", active: true },
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
    "Đang chuẩn bị":       { bg: "#F5F3FF", text: "#7C3AED", border: "#DDD6FE" },
    "Đang giao hàng":      { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
    "Giao hàng thành công": { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
    "Chờ báo giá":         { bg: "#FFFBEB", text: "#B45309", border: "#FDE68A" },
    "Đã báo giá":          { bg: "#ECFDF5", text: "#047857", border: "#A7F3D0" },
    "Chờ xác nhận":        { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
    "Xác nhận đơn hàng":   { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
    "Đang sản xuất":       { bg: "#F5F3FF", text: "#7C3AED", border: "#DDD6FE" },
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

// ===================== MAIN COMPONENT =====================
export default function OwnerOrderDetail() {
  const { id } = useParams();
  const o = MOCK_ORDERS[id] || MOCK_ORDERS["DH001"];
  const ss = statusStyle(o.status);
  const hasPricing = o.total != null;
  const remaining = hasPricing ? o.total - (o.deposit || 0) : null;

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
              <Link
                to="/owner/orders"
                className="w-8 h-8 rounded-xl flex items-center justify-center transition hover:opacity-70"
                style={{ color: "var(--text-secondary)", border: "1px solid var(--grid-border)" }}
              >
                <ArrowLeft size={15} />
              </Link>
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

            {/* Right: Action buttons */}
            <div className="flex items-center gap-2">
              {o.status === "Chờ báo giá" && (
                <Link
                  to={`/owner/orders/${id}/quote`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold transition hover:opacity-90 cursor-pointer"
                  style={{ backgroundColor: "#B45309", color: "#fff" }}
                >
                  <FileText size={14} />
                  Tạo báo giá
                </Link>
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
            </div>
          </div>
        </div>

        {/* ╔══════════ SCROLLABLE CONTENT ══════════╗ */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">

          {/* ── BANNER: Chờ duyệt hủy ── */}
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

          {/* ── BANNER: Chờ báo giá ── */}
          {o.status === "Chờ báo giá" && (
            <div
              className="flex items-start gap-3 p-4 rounded-2xl"
              style={{ backgroundColor: "#FFFBEB", border: "1px solid #FDE68A" }}
            >
              <FileText size={18} className="shrink-0 mt-0.5" style={{ color: "#B45309" }} />
              <div>
                <p className="text-[13px] font-bold" style={{ color: "#92400E" }}>Đơn hàng chờ báo giá</p>
                <p className="text-[12px] mt-0.5" style={{ color: "#A16207" }}>
                  Nhân viên {o.salesPerson} đã tạo đơn. Vui lòng xem sản phẩm và tạo báo giá cho khách hàng.
                </p>
              </div>
            </div>
          )}

          {/* ── BANNER: Giao hàng thành công (Hoàn tất) ── */}
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

          {/* ══════════ MAIN 2-COLUMN GRID ══════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* ═══════ LEFT COL (2/3) ═══════ */}
            <div className="lg:col-span-2 space-y-4">

              {/* ── CARD: Thông tin đơn hàng + Khách hàng (gộp chung) ── */}
              <div
                className="rounded-2xl overflow-hidden"
                style={{ backgroundColor: "var(--background)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
              >
                {/* Khách hàng — nổi bật ở trên */}
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

                {/* Thông tin chi tiết */}
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
                      <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "var(--text-placeholder)" }}>Ngày giao dự kiến</p>
                      <p className="text-[13px] font-semibold mt-0.5" style={{ color: "var(--text-main)" }}>{fmtDate(o.deliveryDate)}</p>
                    </div>
                    {hasPricing && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "var(--text-placeholder)" }}>Thanh toán</p>
                        <p className="text-[13px] font-semibold mt-0.5" style={{ color: "var(--text-main)" }}>{o.paymentMethod}</p>
                      </div>
                    )}
                  </div>

                  {o.notes && (
                    <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--grid-border)" }}>
                      <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "var(--text-placeholder)" }}>Ghi chú</p>
                      <p className="text-[12px] mt-0.5" style={{ color: "var(--text-secondary)" }}>{o.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* ── CARD: Sản phẩm ── */}
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
                    Sản phẩm ({o.products.length})
                  </span>
                </div>

                <div className="divide-y" style={{ borderColor: "var(--grid-border)" }}>
                  {o.products.map((p, i) => (
                    <div key={i} className="px-5 py-4 flex flex-col md:flex-row items-start gap-4">
                      {/* Left: Tên SP + Chi tiết Kỹ thuật */}
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

                        {/* Specs Grid */}
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
                            <p className="text-[10px] uppercase font-bold text-gray-400">Hoa văn/Kiểu dáng</p>
                            <p className="text-[12px] font-semibold text-gray-700">{p.pattern}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-gray-400">Bảo hành</p>
                            <p className="text-[12px] font-semibold text-gray-700">{p.warranty}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Right: Số lượng & Giá */}
                      <div className="text-right shrink-0 w-full md:w-auto flex md:flex-col justify-between items-center md:items-end">
                        <div className="bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                          <span className="text-[11px] font-bold text-gray-500 uppercase">SL:</span>{" "}
                          <span className="text-[14px] font-bold text-gray-800">{p.qty}</span>
                        </div>
                        <div className="mt-2 text-right">
                          {p.price != null ? (
                            <p className="text-[16px] font-bold" style={{ color: "var(--brand-primary)" }}>{fmtCurrency(p.price * p.qty)}</p>
                          ) : (
                            <p className="text-[13px] font-bold italic" style={{ color: "#B45309" }}>Chưa báo giá</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tổng — chỉ hiện khi đã có giá */}
                {hasPricing && (
                  <div
                    className="px-5 py-3 flex items-center justify-between"
                    style={{ borderTop: "1px solid var(--grid-border)", backgroundColor: "var(--grid-header-bg)" }}
                  >
                    <span className="text-[12px] font-bold uppercase" style={{ color: "var(--text-placeholder)" }}>Tổng cộng</span>
                    <span className="text-[15px] font-bold" style={{ color: "var(--brand-primary)" }}>{fmtCurrency(o.total)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* ═══════ RIGHT COL (1/3) ═══════ */}
            <div className="space-y-4">

              {/* ── CARD: Thanh toán — chỉ hiện khi có giá ── */}
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
                      <span className="font-bold" style={{ color: "var(--text-main)" }}>{fmtCurrency(o.total)}</span>
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
                    {/* Payment status badge */}
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
                    </div>
                  </div>
                </div>
              )}

              {/* ── CARD: Giao hàng ── */}
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
                </div>
              </div>

              {/* ── CARD: Lịch sử ── */}
              <div
                className="rounded-2xl overflow-hidden"
                style={{ backgroundColor: "var(--background)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
              >
                <div
                  className="px-5 py-3 flex items-center gap-2"
                  style={{ borderBottom: "1px solid var(--grid-border)", backgroundColor: "var(--grid-header-bg)" }}
                >
                  <Clock size={14} style={{ color: "var(--brand-primary)" }} />
                  <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: "var(--text-main)" }}>Lịch sử</span>
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
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
