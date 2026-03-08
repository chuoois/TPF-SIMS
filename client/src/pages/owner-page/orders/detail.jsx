import { useState } from "react";
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
      phone: "0990123456",
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
      phone: "0989012345",
      address: "123 Đường Nam Kỳ Khởi Nghĩa, Quận 1, TP.HCM",
    },
    salesPerson: "Lê Minh Tuấn",
    total: 36000000,
    deposit: 36000000,
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
  // ĐƠN HÀNG SẴN ĐANG CHUẨN BỊ
  DH011: {
    code: "DH-2603-0003",
    type: "Hàng sẵn",
    status: "Đang chuẩn bị",
    date: "2026-03-05T09:15:00",
    deliveryDate: "2026-03-07",
    customer: {
      name: "Lê Minh Tuấn",
      phone: "0923456789",
      address: "89 Lê Duẩn, Quận Hoàn Kiếm, Hà Nội",
    },
    salesPerson: "Trần Thị Cúc",
    total: 8900000,
    deposit: 8900000,
    paymentStatus: "full",
    paymentMethod: "Chuyển khoản",
    notes: "Khách đã thanh toán 100%, yêu cầu bọc chống xước mút xốp 3 lớp.",
    products: [
      { 
        name: "Tủ giày thông minh 3 tầng", 
        material: "Gỗ MDF chống ẩm", 
        finish: "Phủ Melamine vân gỗ sồi", 
        pattern: "Cánh lật tiết kiệm không gian",
        size: "1m2 x 30cm x 1m1", 
        warranty: "2 năm",
        note: null,
        qty: 1, 
        price: 2400000 
      },
      { 
        name: "Kệ trang trí góc tường", 
        material: "Gỗ cao su ghép thanh", 
        finish: "Sơn PU màu cánh gián", 
        pattern: "5 tầng 1/4 hình tròn",
        size: "Cao 1m5, bán kính 40cm", 
        warranty: "2 năm",
        note: null,
        qty: 1, 
        price: 1500000 
      },
      { 
        name: "Bàn trà Nhật ngồi bệt", 
        material: "Gỗ hương vân", 
        finish: "PU bóng mờ giữ vân tự nhiên", 
        pattern: "Chân gập",
        size: "90cm x 50cm x 30cm", 
        warranty: "5 năm",
        note: null,
        qty: 1, 
        price: 5000000 
      },
    ],
    timeline: [
      { time: "05/03/2026 09:15", label: "Tạo đơn hàng", desc: "NV Trần Thị Cúc tạo đơn hàng sẵn", active: false },
      { time: "05/03/2026 09:20", label: "Thanh toán", desc: "Khách chuyển khoản thành công 8.900.000đ", active: false },
      { time: "05/03/2026 10:00", label: "Đang chuẩn bị", desc: "Kho xuất hàng, đang tiến hành đóng gói", active: true },
    ],
  },
  // ĐƠN ĐÃ XÁC NHẬN - CHỜ DUYỆT SẢN XUẤT (TỐI ƯU NGHIỆP VỤ)
  DH003: {
    code: "DH-2603-0012",
    type: "Đặt theo mẫu",
    status: "Xác nhận đơn hàng",
    date: "2026-03-04T08:15:00",
    deliveryDate: "2026-03-20",
    customer: {
      name: "Nguyễn Thị Hồng",
      phone: "0912345678",
      address: "KĐT Times City, Quận Hai Bà Trưng, Hà Nội",
    },
    salesPerson: "Trần Thị Cúc",
    total: 24000000,
    deposit: 7200000,
    paymentStatus: "partial",
    paymentMethod: "Chuyển khoản",
    notes: "Khách đã chốt cọc, cần triển khai sản xuất sớm",
    products: [
      { 
        name: "Bàn thờ chạm rồng", 
        material: "Gỗ mít", 
        finish: "Sơn PU bóng", 
        pattern: "Chạm rồng cuốn thủy",
        size: "217×81×127 cm", 
        warranty: "20 năm",
        note: "Sơn 3 lớp PU",
        qty: 2, 
        price: 12000000 
      },
    ],
    timeline: [
      { time: "03/03/2026 14:00", label: "Tạo đơn hàng", desc: "NV Trần Thị Cúc tạo đơn đặt theo mẫu", active: false },
      { time: "03/03/2026 15:30", label: "Đã báo giá", desc: "Báo giá: 24.000.000đ", active: false },
      { time: "04/03/2026 08:15", label: "Xác nhận đơn hàng", desc: "Khách đã đặt cọc, chờ duyệt sản xuất", active: true },
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
      phone: "0945678901",
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
        price: 3400000 
      },
    ],
    timeline: [
      { time: "03/03/2026 16:20", label: "Tạo đơn hàng", desc: "NV Trần Thị Cúc tạo đơn hàng sẵn", active: false },
      { time: "03/03/2026 17:00", label: "Đang chuẩn bị", desc: "Xuất kho, đóng gói sản phẩm", active: false },
      { time: "04/03/2026 09:00", label: "Yêu cầu hủy", desc: "Khách yêu cầu hủy — Lý do: đổi ý chọn mẫu khác", active: false },
      { time: "04/03/2026 09:05", label: "Chờ duyệt hủy", desc: "Chờ chủ cửa hàng phê duyệt", active: true },
    ],
  },
  // ĐƠN ĐÃ BÁO GIÁ - CHỜ KHÁCH XÁC NHẬN
  DH010: {
    code: "DH-2603-0002",
    type: "Đặt theo mẫu",
    status: "Chờ xác nhận",
    date: "2026-03-02T10:15:00",
    deliveryDate: null,
    customer: {
      name: "Trần Thị Mai",
      phone: "0912345678",
      address: "Chung cư Hoàng Anh Gia Lai, Quận 7, TP.HCM",
    },
    salesPerson: "Nguyễn Văn Bình",
    total: 42000000,
    deposit: null,
    paymentStatus: null,
    paymentMethod: null,
    notes: "Đã gửi bảng báo giá qua Zalo cho khách ngày 05/03, khách hẹn cuối tuần chốt màu.",
    products: [
      { 
        name: "Tủ bếp chữ I", 
        material: "MDF chống ẩm Hòe Nhai", 
        finish: "Phủ Melamine An Cường", 
        pattern: "Trơn, phẳng hiện đại",
        size: "Dài 4m x Cao 2m2", 
        warranty: "05 năm",
        note: "Khách có thể đổi ý sang màu xám vân đá",
        qty: 1, 
        price: 42000000 
      },
    ],
    timeline: [
      { time: "02/03/2026 10:15", label: "Tạo đơn hàng", desc: "NV Nguyễn Văn Bình tạo đơn", active: false },
      { time: "05/03/2026 09:30", label: "Đã báo giá", desc: "Chủ cửa hàng báo giá: 42.000.000đ", active: false },
      { time: "05/03/2026 10:00", label: "Chờ xác nhận", desc: "Đã gửi giá cho khách. Đang chờ phản hồi.", active: true },
    ],
  },
  // ĐƠN ĐÃ BÁO GIÁ - CHƯA GỬI CHO KHÁCH
  DH006: {
    code: "DH-2603-0006",
    type: "Đặt theo mẫu",
    status: "Đã báo giá",
    date: "2026-03-04T11:10:00",
    deliveryDate: null,
    customer: {
      name: "Đặng Thùy Linh",
      phone: "0956789012",
      address: "Biệt thự Vinhomes Riverside, Long Biên, Hà Nội",
    },
    salesPerson: "Lê Minh Tuấn",
    total: 85000000,
    deposit: null,
    paymentStatus: null,
    paymentMethod: null,
    notes: "Bộ bàn ghế sofa chữ U gỗ gõ đỏ, bọc da Ý",
    products: [
      { 
        name: "Sofa gỗ chữ U", 
        material: "Gỗ gõ đỏ", 
        finish: "Sơn PU mờ", 
        pattern: "Hiện đại, đệm da bò tự nhiên",
        size: "3m2 x 2m8", 
        warranty: "15 năm",
        note: "Đệm tựa lưng may caro rút múi",
        qty: 1, 
        price: 85000000 
      },
    ],
    timeline: [
      { time: "04/03/2026 11:10", label: "Tạo đơn hàng", desc: "NV Lê Minh Tuấn tạo đơn", active: false },
      { time: "04/03/2026 14:30", label: "Đã báo giá", desc: "Chủ cửa hàng đã tính toán và ra giá: 85.000.000đ", active: true },
    ],
  },
  // ĐƠN ĐANG SẢN XUẤT — có đầy đủ giá
  DH008: {
    code: "DH-2603-0008",
    type: "Đặt theo mẫu",
    status: "Đang sản xuất",
    date: "2026-03-05T08:45:00",
    deliveryDate: "2026-03-25",
    customer: {
      name: "Hoàng Nguyệt Ánh",
      phone: "0978901234",
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
const StandardOrderView = ({ o, displayTotal, hasPricing, remaining }) => {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      {/* ── BANNER ── */}
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
            </div>
          </div>
        </div>

        {/* ╔══════════ SCROLLABLE CONTENT ══════════╗ */}
        {o.status === "Chờ báo giá" 
          ? <QuoteBuilderView o={o} quotedPrices={quotedPrices} handlePriceChange={handlePriceChange} displayTotal={displayTotal} />
          : <StandardOrderView o={o} displayTotal={displayTotal} hasPricing={hasPricing} remaining={remaining} />
        }
      </div>
    </>
  );
}
