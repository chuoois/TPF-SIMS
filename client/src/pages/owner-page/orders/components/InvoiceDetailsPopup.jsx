import { useState, useEffect, useRef, useMemo } from "react";
import {
  X, Maximize2, Minimize2, Minus,
  User, Phone, MapPin, Calendar,
  Package, Clock, FileText, CheckCircle,
  Truck, AlertTriangle, Hammer, Camera,
  Eye, RefreshCw, ChevronRight, Ban, XCircle
} from "lucide-react";
import toast from "react-hot-toast";

// ===================== MOCK DATA (Ported from detail.jsx & matched with INITIAL_ORDERS) =====================
// ===================== MOCK DATA (Matched with INITIAL_ORDERS in orders/index.jsx) =====================
const MOCK_ORDERS_DETAILED = {
  "DH-S01": {
    code: "DH-SAN-001", type: "Hàng sẵn", status: "Chờ xử lý",
    date: "2026-03-29T08:30:00", deliveryDate: "2026-04-01", fulfillmentType: "Giao tận nhà",
    customer: { name: "Nguyễn Văn Hùng", phone: "0912345678", address: "45 Đường Giải Phóng, Hà Đông, Hà Nội" },
    salesPerson: "Bình Nguyễn", total: 18500000, deposit: 2000000, depositMethod: "Chuyển khoản", paymentStatus: "partial",
    notes: "Khách cần bọc lót kỹ phần chân gỗ khi vận chuyển.",
    products: [{
      name: "Bàn ăn gỗ Sồi Nga 6 ghế",
      image: "https://images.unsplash.com/photo-1617103996702-96ff29b1c467?q=80&w=800",
      customerSampleImage: "https://images.unsplash.com/photo-1541004996924-4dc40be48be7?q=80&w=800",
      material: "Gỗ sồi tự nhiên", size: "160x80 cm", finish: "Sơn màu hạt dẻ", qty: 1, price: 18500000, note: "Màu hạt dẻ"
    }],
    timeline: [
      { time: "29/03/2026 08:30", label: "Tiếp nhận đơn", desc: "Đơn hàng mới từ showroom", active: true },
      { time: "29/03/2026 09:15", label: "Đang kiểm kho", desc: "Xác nhận hàng sẵn có tại kho Hà Đông", active: false }
    ],
  },
  "DH-S02": {
    code: "DH-SAN-002", type: "Hàng sẵn", status: "Chờ giao hàng",
    date: "2026-03-28T14:20:00", deliveryDate: "2026-03-30", fulfillmentType: "Lấy tại cửa hàng",
    customer: { name: "Lê Thị Lan", phone: "0345678901", address: "Căn 1204, Tòa C, Vinhomes Ocean Park" },
    salesPerson: "Bình Nguyễn", total: 8500000, deposit: 8500000, depositMethod: "Tiền mặt", paymentStatus: "full",
    products: [{ name: "Kệ Tivi gỗ Sồi", image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=800", material: "Gỗ sồi", size: "2m2", finish: "Cánh mây", qty: 1, price: 8500000, note: "" }],
    timeline: [
      { time: "28/03/2026 14:20", label: "Tiếp nhận đơn", active: true },
      { time: "29/03/2026 10:00", label: "Đã chuẩn bị xong", desc: "Hàng đã được đóng gói chờ khách lấy", active: true }
    ],
  },
  "DH-S03": {
    code: "DH-SAN-003", type: "Hàng sẵn", status: "Đang giao hàng",
    date: "2026-03-27T09:15:00", deliveryDate: "2026-03-31", fulfillmentType: "Giao tận nơi",
    customer: { name: "Trần Minh Quang", phone: "0909123456", address: "Số 88 Cầu Giấy, Hà Nội" },
    salesPerson: "Bình Nguyễn", total: 42000000, deposit: 20000000, depositMethod: "Chuyển khoản", paymentStatus: "partial",
    products: [{ name: "Bộ Sofa gỗ Sồi chữ U", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800", material: "Gỗ Sồi Nga", size: "Chữ U 2m8x1m8", finish: "Sơn màu hạt dẻ", qty: 1, price: 42000000, note: "Nệm da Hàn Quốc màu nâu" }],
    timeline: [
      { time: "27/03/2026 09:15", label: "Tiếp nhận đơn", active: true },
      { time: "30/03/2026 08:30", label: "Đang giao hàng", desc: "Tài xế Nguyễn Văn A (0988xxx) đang vận chuyển", active: true }
    ],
  },
  "DH-S04": {
    code: "DH-SAN-004", type: "Hàng sẵn", status: "Hoàn thành",
    date: "2026-03-25T16:45:00", deliveryDate: "2026-03-26", fulfillmentType: "Giao tận nơi",
    customer: { name: "Phạm Thành Nam", phone: "0987654321", address: "BT Linh Đàm, Hoàng Mai, Hà Nội" },
    salesPerson: "Bình Nguyễn", total: 15600000, deposit: 15600000, depositMethod: "Tiền mặt", paymentStatus: "full",
    products: [{ name: "Tủ giày thông minh", image: "https://images.unsplash.com/photo-1595515106969-a0ff2bc82092?q=80&w=800", material: "Gỗ sồi", size: "3 tầng cánh lật", finish: "Sơn Lau", qty: 1, price: 15600000, note: "" }],
    timeline: [{ time: "26/03/2026 15:00", label: "Đã giao hàng", desc: "Hàng đã bàn giao đầy đủ cho khách", active: true }],
  },
  "DH-T01": {
    code: "DH-MOC-001", type: "Hàng mộc", status: "Chờ xử lý",
    date: "2026-03-30T10:00:00", deliveryDate: "2026-04-10", fulfillmentType: "Giao tận nơi",
    customer: { name: "Hoàng Nguyệt Ánh", phone: "0978901234", address: "KĐT Ecopark, Hưng Yên" },
    salesPerson: "Bình Nguyễn", total: 56000000, deposit: 10000000, depositMethod: "Chuyển khoản", paymentStatus: "partial",
    products: [{
      name: "Sập thờ Tứ Linh",
      image: "https://images.unsplash.com/photo-1620608208153-90928221805b?q=80&w=800",
      customerSampleImage: "https://images.unsplash.com/photo-1620027177243-c1b1236895b6?q=80&w=800",
      material: "Gỗ mít", size: "Chân 18, Dạ 5 phân", finish: "Mộc", qty: 1, price: 56000000, note: "Đục tay kỹ"
    }],
    timeline: [{ time: "30/03/2026 10:00", label: "Tạo đơn", desc: "Nhận hàng mộc chuyển xưởng hoàn thiện", active: true }],
  },
  "DH-T02": {
    code: "DH-MOC-002", type: "Hàng mộc", status: "Đang gia công",
    date: "2026-03-28T15:30:00", deliveryDate: "2026-04-05", fulfillmentType: "Giao tận nơi",
    customer: { name: "Đặng Tuấn Kiệt", phone: "0931234567", address: "Số 12A Xuân Thủy, Cầu Giấy" },
    salesPerson: "Bình Nguyễn", total: 32000000, deposit: 15000000, depositMethod: "Tiền mặt", paymentStatus: "partial",
    products: [{
      name: "Bộ bàn ghế Âu Á",
      image: "https://images.unsplash.com/photo-1616486341351-70252447aece?q=80&w=800",
      customerSampleImage: "https://images.unsplash.com/photo-1595515106969-a0ff2bc82092?q=80&w=800",
      material: "Gỗ Hương Đá", size: "Chương voi", finish: "Sơn Lau", qty: 1, price: 32000000, note: "Hàng mộc về xưởng"
    }],
    timeline: [{ time: "29/03/2026 14:00", label: "Gia công", desc: "Đang trong giai đoạn sơn PU lớp 2", active: true }],
  },
  "DH-D01": {
    code: "DH-DAT-001", type: "Hàng khách đặt", status: "Chờ sản xuất",
    date: "2026-03-30T11:15:00", deliveryDate: "2026-04-30", fulfillmentType: "Giao tận nơi",
    customer: { name: "Nguyễn Thị Hồng", phone: "0912123123", address: "Số 5 Đường Thành, Hoàn Kiếm" },
    salesPerson: "Bình Nguyễn", total: 125000000, deposit: 40000000, depositMethod: "Chuyển khoản", paymentStatus: "partial",
    products: [{
      name: "Trường kỷ Sen Vịt",
      image: "https://images.unsplash.com/photo-1617806118233-ef203e91122b?q=80&w=800",
      customerSampleImage: "https://images.unsplash.com/photo-1540632739335-ade38b0070bc?q=80&w=800",
      material: "Gỗ Gụ Lào", size: "2m17", finish: "Đục tay kỹ", qty: 1, price: 125000000, note: "Đóng mộng thủ công"
    }],
    timeline: [{ time: "30/03/2026 11:15", label: "Nhận đơn", desc: "Đơn hàng đặt sản xuất theo mẫu riêng", active: true }],
  },
  "DH-D02": {
    code: "DH-DAT-002", type: "Hàng khách đặt", status: "Đã nhập kho",
    date: "2026-03-25T09:00:00", deliveryDate: "2026-04-05", fulfillmentType: "Giao tận nơi",
    customer: { name: "Lê Văn Tám", phone: "0321654987", address: "Quận 1, TP.HCM" },
    salesPerson: "Bình Nguyễn", total: 75000000, deposit: 30000000, depositMethod: "Chuyển khoản", paymentStatus: "partial",
    products: [{ name: "Tủ chè khảm trai", image: "https://images.unsplash.com/photo-1616486341351-70252447aece?q=80&w=800", material: "Gỗ Gụ", size: "Cánh cong", finish: "Khảm trai kỹ", qty: 1, price: 75000000, note: "Khảm tích cổ" }],
    timeline: [
      { time: "25/03/2026 09:00", label: "Tạo đơn đặt hàng", active: true },
      { time: "28/03/2026 15:30", label: "Đã nhập mộc", desc: "Mộc về kho chờ khách duyệt mộc", active: true }
    ],
  },
  "DH-D03": {
    code: "DH-DAT-003", type: "Hàng khách đặt", status: "Hoàn thành",
    date: "2026-03-10T08:30:00", deliveryDate: "2026-03-20", fulfillmentType: "Giao tận nơi",
    customer: { name: "Bùi Tiến Dũng", phone: "0911223344", address: "Hải Phòng" },
    salesPerson: "Bình Nguyễn", total: 210000000, deposit: 210000000, depositMethod: "Chuyển khoản", paymentStatus: "full",
    products: [{ name: "Combo phòng thờ VIP", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800", material: "Gỗ Gụ", size: "Phòng 25m2", finish: "Sơn Lau vàng óng", qty: 1, price: 210000000, note: "Bao gồm sập thờ, cuốn thư" }],
    timeline: [{ time: "20/03/2026 10:00", label: "Hoàn tất", desc: "Đã bàn giao và lắp đặt hoàn thiện", active: true }],
  }
};

const INITIAL_ORDERS_LIST = [
  { id: "DH-D03", code: "DH-DAT-003", customerName: "Bùi Tiến Dũng", phone: "0911223344", type: "Hàng khách đặt", total: 210000000, status: "Hoàn thành", date: "2026-03-10T08:30:00", salesPerson: "Bình Nguyễn", deliveryDate: "2026-03-20", deposit: 210000000, fulfillmentType: "Giao hàng" },
];

const fmtCurrency = (n) =>
  n != null ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n) : "—";

const formatNumberInput = (value) => {
  if (value === "" || value === null || value === undefined) return "";
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const parseNumberInput = (value) => {
  if (!value) return "";
  return value.replace(/\./g, "").replace(/[^\d]/g, "");
};

const fmtDate = (s) => (s ? new Date(s).toLocaleDateString("vi-VN") : "—");

const fmtDateTime = (s) => {
  if (!s) return "—";
  const d = new Date(s);
  return `${d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} — ${d.toLocaleDateString("vi-VN")}`;
};

const statusStyle = (status) => {
  const m = {
    "Chờ xử lý": { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
    "Đang xử lý": { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
    "Chờ sản xuất": { bg: "#FEF3C7", text: "#B45309", border: "#FDE68A" },
    "Đã nhập kho": { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
    "Đang gia công": { bg: "#FEF3C7", text: "#D97706", border: "#FDE68A" },
    "Chờ giao hàng": { bg: "#F5F3FF", text: "#7C3AED", border: "#DDD6FE" },
    "Đang giao hàng": { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
    "Hoàn thành": { bg: "#F0FDF4", text: "#166534", border: "#BBF7D0" },
    "Chờ duyệt hủy": { bg: "#FEF3C7", text: "#D97706", border: "#FDE68A" },
    "Đơn đã hủy": { bg: "#FEF2F2", text: "#B91C1C", border: "#FECACA" },
  };
  return m[status] || { bg: "#F3F4F6", text: "#6B7280", border: "#E5E7EB" };
};

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
    className="rounded-2xl overflow-hidden border border-gray-100 bg-white/50 backdrop-blur-sm shadow-sm"
  >
    <div
      className="px-5 py-4 flex items-center gap-4 border-b border-gray-100"
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center text-[15px] font-bold shrink-0 bg-indigo-50 text-indigo-600 border border-indigo-100"
      >
        {o.customer.name.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-bold truncate text-gray-800">{o.customer.name}</p>
        <div className="flex items-center gap-4 mt-0.5 flex-wrap">
          <span className="inline-flex items-center gap-1 text-[12px] text-gray-500">
            <Phone size={11} className="text-gray-400" />
            {o.customer.phone}
          </span>
          <span className="inline-flex items-center gap-1 text-[12px] text-gray-500">
            <MapPin size={11} className="text-gray-400" />
            {o.customer.address}
          </span>
        </div>
      </div>
    </div>

    <div className="px-5 py-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Mã đơn</p>
          <p className="text-[13px] font-semibold mt-0.5 text-gray-700">{o.code}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Loại hàng</p>
          <p className="text-[13px] font-semibold mt-0.5 text-gray-700">{o.type}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Nhân viên</p>
          <p className="text-[13px] font-semibold mt-0.5 text-gray-700">{o.salesPerson}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Ngày tạo</p>
          <p className="text-[13px] font-semibold mt-0.5 text-gray-700">{fmtDateTime(o.date)}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Ngày giao</p>
          <p className="text-[13px] font-semibold mt-0.5 text-gray-700">{fmtDate(o.deliveryDate)}</p>
        </div>
        <div className="md:col-span-1">
          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Ghi chú</p>
          <p className="text-[13px] font-semibold mt-0.5 text-gray-700">{o.notes || "—"}</p>
        </div>
      </div>
    </div>
  </div>
);

const HistoryCard = ({ o }) => (
  <div
    className="rounded-2xl overflow-hidden border border-gray-100 bg-white/50 backdrop-blur-sm shadow-sm"
  >
    <div
      className="px-5 py-3 flex items-center gap-2 border-b border-gray-100 bg-gray-50/30"
    >
      <Clock size={14} className="text-gray-400" />
      <span className="text-[12px] font-bold uppercase tracking-wider text-gray-500">Lịch sử đơn hàng</span>
    </div>
    <div className="px-5 py-5 space-y-6 relative ml-3 mt-2">
      <div className="absolute top-2 bottom-2 left-[-13px] w-0.5 bg-gray-100" />
      {o.timeline?.map((t, idx) => (
        <div key={idx} className="relative pl-1">
          <div
            className={`absolute top-1 left-[-21px] w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center z-10 transition-colors ${t.active ? "border-indigo-500" : "border-gray-200"
              }`}
          >
            {t.active && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
          </div>
          <div className="flex items-start justify-between min-w-0">
            <div className="min-w-0">
              <p className={`text-[13px] font-bold ${t.active ? "text-gray-800" : "text-gray-400"}`}>
                {t.label}
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">{t.desc}</p>
            </div>
            <span className="text-[10px] font-bold text-gray-400 shrink-0 ml-4">
              {t.time}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const MediaGallery = ({ title, icon: Icon, images, onPreview, colorClass = "emerald" }) => {
  if (!images || images.length === 0) return null;
  const colorMap = {
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-600" },
    indigo: { bg: "bg-indigo-50", text: "text-indigo-600", dot: "bg-indigo-600" },
    amber: { bg: "bg-amber-50", text: "text-amber-600", dot: "bg-amber-600" },
  };
  const c = colorMap[colorClass] || colorMap.emerald;

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-100 bg-white/50 backdrop-blur-sm shadow-sm group">
      <div className={`px-5 py-3 flex items-center gap-2 border-b border-gray-100 ${c.bg}/30`}>
        <Icon size={14} className={c.text} />
        <span className={`text-[12px] font-bold uppercase tracking-wider ${c.text}`}>{title}</span>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {images.map((img, idx) => (
            <div
              key={idx}
              className="relative aspect-square rounded-xl overflow-hidden cursor-zoom-in hover:ring-2 hover:ring-indigo-300 transition-all group/img border border-gray-100 shadow-sm"
              onClick={() => onPreview(img)}
            >
              <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110" />
              <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover/img:opacity-100">
                <Eye size={18} className="text-white drop-shadow-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
const StandardOrderView = ({
  o,
  productTotal,
  displayTotal,
  hasPricing,
  remaining,
  deliveryImage,
  onDeliveryImageChange,
  onPreview
}) => {
  const paidAmount = (o.deposit || 0) + (o.receivedAmount || 0);

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COL */}
        <div className="space-y-4">
          <CustomerInfoCard o={o} />

          {/* ── CARD: Danh sách sản phẩm ── */}
          <div
            className="rounded-2xl overflow-hidden border border-gray-100 bg-white/50 backdrop-blur-sm shadow-sm"
          >
            <div
              className="px-5 py-3 flex items-center gap-2 border-b border-gray-100 bg-gray-50/30"
            >
              <Package size={14} className="text-gray-400" />
              <span className="text-[12px] font-bold uppercase tracking-wider text-gray-500">Sản phẩm</span>
            </div>
            <div className="divide-y divide-gray-50">
              {o.products.map((p, idx) => (
                <div key={idx} className="px-5 py-4 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4">
                      <div className="flex gap-2">
                        {/* 1. Ảnh thực tế tại kho */}
                        <div className="w-16 h-16 rounded-xl bg-gray-100 flex flex-col items-center justify-center shrink-0 border border-gray-100 overflow-hidden relative group cursor-pointer" onClick={() => p.image && onPreview(p.image)}>
                          {p.image ? (
                            <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                          ) : (
                            <Package size={20} className="text-gray-300" />
                          )}
                          <div className="absolute inset-x-0 bottom-0 bg-black/40 py-0.5 text-center">
                            <span className="text-[7px] text-white font-bold uppercase tracking-tighter">Thực tế</span>
                          </div>
                        </div>

                        {/* 2. Ảnh mẫu của khách (nếu có) */}
                        {p.customerSampleImage && (
                          <div className="w-16 h-16 rounded-xl bg-amber-50 flex flex-col items-center justify-center shrink-0 border border-amber-100 overflow-hidden relative group cursor-pointer" onClick={() => onPreview(p.customerSampleImage)}>
                            <img src={p.customerSampleImage} alt="Mẫu khách gửi" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                            <div className="absolute inset-x-0 bottom-0 bg-amber-600/80 py-0.5 text-center">
                              <span className="text-[7px] text-white font-bold uppercase tracking-tighter">Mẫu khách</span>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[14px] font-bold text-gray-800 line-clamp-1">{p.name}</p>
                        <p className="text-[12px] text-gray-500 mt-1">
                          {p.material} • {p.size} • {p.finish}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100">
                            x{p.qty} {p.unit || "Bộ"}
                          </span>
                          {p.note && (
                            <span className="text-[11px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 italic">
                              {p.note}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[14px] font-black text-gray-800">{fmtCurrency(p.price * p.qty)}</p>
                      <p className="text-[11px] text-gray-400 mt-1">{fmtCurrency(p.price)} / {p.unit || "bộ"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── CARD: Lệnh sản xuất liên quan ── */}
          {o.productionOrders && o.productionOrders.length > 0 && (
            <div className="rounded-2xl overflow-hidden border border-gray-100 bg-white/50 backdrop-blur-sm shadow-sm">
              <div className="px-5 py-3 flex items-center gap-2 border-b border-gray-100 bg-gray-50/30">
                <Hammer size={14} className="text-gray-400" />
                <span className="text-[12px] font-bold uppercase tracking-wider text-gray-500">Gia công & Sản xuất</span>
              </div>
              <div className="divide-y divide-gray-50">
                {o.productionOrders.map((lsx, idx) => (
                  <div key={idx} className="px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <span className={`w-2 h-2 rounded-full ${lsx.status === 'Hoàn thành' ? 'bg-green-600' : 'bg-purple-600 animate-pulse'}`} />
                      <div>
                        <p className="text-[13px] font-bold text-gray-800">{lsx.code}</p>
                        <p className="text-[12px] text-gray-500 mt-0.5">{lsx.desc} • Thợ: {lsx.worker}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold ${lsx.status === 'Hoàn thành' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                        {lsx.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {o.type === "Hàng khách đặt" && (
            <MediaGallery
              title="Bản thiết kế từ Chủ"
              icon={FileText}
              images={o.designSketches}
              onPreview={onPreview}
              colorClass="indigo"
            />
          )}

          {o.type === "Hàng khách đặt" && (
            <div className="rounded-2xl overflow-hidden border border-gray-100 bg-white/50 backdrop-blur-sm shadow-sm pt-4 px-5 pb-5">
              <p className="text-[11px] uppercase tracking-wider font-bold text-gray-400 flex items-center gap-2 mb-2">
                <FileText size={12} /> Yêu cầu chi tiết
              </p>
              <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-100/50">
                <p className="text-[13px] text-amber-900 leading-relaxed italic">
                  {o.customRequirements || "Khách yêu cầu làm kỹ phần đục chạm, đánh nhám kỹ trước khi lót. Chân quỳ đặc."}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COL */}
        <div className="space-y-4">
          {hasPricing && (
            <div className="rounded-2xl overflow-hidden border border-gray-100 bg-white/50 backdrop-blur-sm shadow-sm">
              <div className="px-5 py-3 flex items-center gap-2 border-b border-gray-100 bg-gray-50/30">
                <FileText size={14} className="text-gray-400" />
                <span className="text-[12px] font-bold uppercase tracking-wider text-gray-500">Thanh toán</span>
              </div>
              <div className="px-5 py-4 space-y-3">
                <div className="flex justify-between text-[13px]">
                  <span className="text-gray-500">Tiền hàng</span>
                  <span className="font-bold text-gray-800">{fmtCurrency(productTotal)}</span>
                </div>

                <div className="flex justify-between text-[13px]">
                  <span className="text-gray-500">Phí gia công</span>
                  <span className="font-bold text-amber-600">
                    {o.processingFee > 0 ? `+${fmtCurrency(o.processingFee)}` : "0 ₫"}
                  </span>
                </div>

                <div className="flex justify-between text-[13px]">
                  <span className="text-gray-500">Giảm giá</span>
                  <span className="font-bold text-emerald-600">
                    {o.discount > 0 ? `-${fmtCurrency(o.discount)}` : "0 ₫"}
                  </span>
                </div>

                <div className="pt-2 border-t border-dashed border-gray-100">
                  <div className="flex justify-between text-[13px]">
                    <span className="font-bold text-gray-700">
                      {o.status === "Đơn đã hủy" ? "Tổng tiền gốc" : "Tổng thanh toán"}
                    </span>
                    <span className={`font-bold text-[15px] ${o.status === "Đơn đã hủy" ? 'text-gray-400 line-through' : 'text-indigo-600'}`}>
                      {fmtCurrency(displayTotal)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between text-[13px]">
                  <span className="text-gray-500">Đặt cọc</span>
                  <div className="text-right">
                    <span className="font-bold text-green-700">{fmtCurrency(o.deposit || 0)}</span>
                    {o.status === "Đơn đã hủy" && o.depositResolution && (
                      <p className={`text-[10px] font-bold mt-0.5 ${o.depositResolution === 'refunded' ? 'text-blue-600' : 'text-amber-600'}`}>
                        {o.depositResolution === 'refunded' ? "(Đã hoàn cọc)" : "(Khách mất cọc)"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-between text-[13px]">
                  <span className="text-gray-500">Đã thu thêm</span>
                  <span className="font-bold text-emerald-700">{fmtCurrency(o.receivedAmount || 0)}</span>
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] font-bold text-gray-800">
                      {o.status === "Đơn đã hủy" ? "Phải thu còn lại" : "Còn lại"}
                    </span>
                    <div className="text-right">
                      <p className={`text-[18px] font-black ${o.status === "Đơn đã hủy" ? 'text-gray-300' : (remaining > 0 ? "text-red-600" : "text-green-600")}`}>
                        {fmtCurrency(o.status === "Đơn đã hủy" ? 0 : remaining)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap gap-2">
                  {o.paymentStatus === "full" && (
                    <Badge style={{ backgroundColor: "#F0FDF4", color: "#15803D", border: "1px solid #BBF7D0" }}>
                      Đã thanh toán đủ
                    </Badge>
                  )}
                  {o.paymentStatus === "partial" && (
                    <Badge style={{ backgroundColor: "#FFF7ED", color: "#C2410C", border: "1px solid #FED7AA" }}>
                      Thanh toán một phần (Ghi nợ)
                    </Badge>
                  )}
                  {o.paymentStatus === "pending" && (
                    <Badge style={{ backgroundColor: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}>
                      Chưa thanh toán
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="rounded-2xl overflow-hidden border border-gray-100 bg-white/50 backdrop-blur-sm shadow-sm">
            <div className="px-5 py-3 flex items-center gap-2 border-b border-gray-100 bg-gray-50/30">
              <Truck size={14} className="text-gray-400" />
              <span className="text-[12px] font-bold uppercase tracking-wider text-gray-500">Giao hàng</span>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div className="flex items-start gap-3">
                <MapPin size={15} className="mt-0.5 text-gray-400" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Địa chỉ giao</p>
                  <p className="text-[13px] font-semibold mt-0.5 text-gray-700">{o.customer.address}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar size={15} className="mt-0.5 text-gray-400" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Ngày giao dự kiến</p>
                  <p className="text-[13px] font-semibold mt-0.5 text-gray-700">{fmtDate(o.deliveryDate)}</p>
                </div>
              </div>

              {o.deliveryImage && (
                <div className="mt-2 pt-2 border-t border-gray-50">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-2">Ảnh giao hàng</p>
                  <img src={o.deliveryImage} alt="Ảnh giao hàng" className="w-full bg-gray-100 h-48 rounded-xl object-cover cursor-zoom-in" onClick={() => onPreview(o.deliveryImage)} />
                </div>
              )}

              {!o.deliveryImage && deliveryImage && (
                <div className="mt-2 pt-2 border-t border-gray-50">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-green-600 mb-2">Ảnh vừa tải lên</p>
                  <img src={deliveryImage} alt="Ảnh giao hàng" className="w-full bg-gray-100 h-48 rounded-xl object-cover" />
                </div>
              )}

              {o.status === "Đang giao hàng" && !o.deliveryImage && (
                <div className="mt-2 pt-2 border-t border-gray-50">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-indigo-600 mb-2">Tải ảnh giao hàng để hoàn tất</p>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-indigo-200 rounded-xl hover:bg-indigo-50/50 cursor-pointer transition-all">
                    <Camera size={24} className="text-indigo-400 mb-2" />
                    <span className="text-[12px] font-bold text-indigo-600">Chọn ảnh thực tế</span>
                    <input type="file" className="hidden" accept="image/*" onChange={onDeliveryImageChange} />
                  </label>
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
export default function InvoiceDetailsPopup({ invoiceId, isOpen, onClose, onStatusChanged }) {
  const [viewState, setViewState] = useState("loading"); // loading | ready | error
  const [order, setOrder] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [deliveryImage, setDeliveryImage] = useState(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [finalPayment, setFinalPayment] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("Chuyển khoản");
  const [painterCost, setPainterCost] = useState(0);

  // Handover Modal State
  const [handoverDeadline, setHandoverDeadline] = useState("");
  const [handoverNotes, setHandoverNotes] = useState("");
  const [handoverChecks, setHandoverChecks] = useState({ dimension: false, material: false, techNotes: false });

  const popupRef = useRef(null);


  // Fetch & Normalize Data
  useEffect(() => {
    if (!isOpen || !invoiceId) {
      setHasUnsavedChanges(false);
      setDeliveryImage(null);
      return;
    }

    setViewState("loading");
    setTimeout(() => {
      let found = MOCK_ORDERS_DETAILED[invoiceId];
      if (!found) {
        const saved = JSON.parse(localStorage.getItem("tpf_simulated_orders") || "[]");
        found = saved.find(o => o.id === invoiceId || o.code === invoiceId);
      }
      if (!found) {
        found = INITIAL_ORDERS_LIST.find(o => o.id === invoiceId || o.code === invoiceId);
      }

      if (found) {
        const normalized = {
          ...found,
          customer: found.customer || {
            name: found.customerName || "Khách hàng",
            phone: found.phone || "---",
            address: found.address || "---"
          },
          products: found.products || [
            { name: "Sản phẩm đồ gỗ", material: "Gỗ tự nhiên", size: "Chuẩn", finish: "Sơn PU", qty: 1, price: found.total || 0, unit: "Bộ" }
          ],
          timeline: found.timeline || [
            { time: found.date ? fmtDateTime(found.date) : fmtDateTime(new Date()), label: "Tạo đơn", active: true }
          ],
          processingFee: found.processingFee || 0,
          discount: found.discount || 0,
          deposit: found.deposit || 0,
          paymentStatus: found.paymentStatus || "pending",
        };
        setOrder(normalized);
        const rem = (normalized.total || 0) + (normalized.processingFee || 0) - (normalized.discount || 0) - (normalized.deposit || 0);
        setFinalPayment(rem > 0 ? rem : 0);
        setViewState("ready");
      } else {
        setViewState("error");
      }
    }, 600);
  }, [invoiceId, isOpen]);

  // Sync Final Payment when modal opens
  useEffect(() => {
    if (showCompleteModal && order) {
      const calculatedTotal = order.products.reduce((acc, p) => acc + (p.price || 0) * p.qty, 0);
      const displayTotal = order.total != null ? order.total : calculatedTotal;
      const rem = displayTotal + (order.processingFee || 0) - (order.discount || 0) - (order.deposit || 0);
      setFinalPayment(rem > 0 ? rem : 0);
    }
  }, [showCompleteModal, order]);

  // Sync Handover Deadline when modal opens
  useEffect(() => {
    if (showHandoverModal && order?.deliveryDate) {
      const delivery = new Date(order.deliveryDate);
      delivery.setDate(delivery.getDate() - 2);
      const isoDate = delivery.toISOString().split('T')[0];
      setHandoverDeadline(isoDate);
      setHandoverNotes("");
    }
  }, [showHandoverModal, order?.deliveryDate]);

  const convertCancelledToStock = (o) => {
    const possibleStatuses = ["Đã nhập kho", "Chờ giao hàng", "Chờ duyệt hủy", "Đang gia công", "Đang sản xuất"];
    const isFinishedOrTriaging = possibleStatuses.includes(o.status);

    if (!isFinishedOrTriaging || (o.type !== "Hàng khách đặt" && o.type !== "Hàng mộc")) return;

    const savedProducts = localStorage.getItem("tpf_simulated_products");
    const savedLogs = localStorage.getItem("tpf_simulated_inventory_logs");

    let currentInventory = savedProducts ? JSON.parse(savedProducts) : [];
    let currentLogs = savedLogs ? JSON.parse(savedLogs) : [];

    const newItems = o.products.map((p, idx) => {
      let cat = "Phòng khách";
      const n = p.name?.toLowerCase() || "";
      if (n.includes("giường") || n.includes("tủ áo") || n.includes("tab")) cat = "Phòng ngủ";
      else if (n.includes("thờ") || n.includes("án gian") || n.includes("sập")) cat = "Phòng thờ";
      else if (n.includes("ăn") || n.includes("bếp")) cat = "Phòng ăn";
      else if (n.includes("tượng") || n.includes("bình") || n.includes("tranh")) cat = "Trang trí";

      const isMocOrder = o.type === "Hàng mộc";
      const targetType = isMocOrder ? "Hàng mộc" : "Hàng sẵn";

      const newItem = {
        id: `SP-CAN-${o.code}-${idx}-${Date.now()}`,
        code: `${isMocOrder ? "HM" : "HS"}-${o.code}-${idx + 1}`,
        name: p.name,
        category: cat,
        material: p.material,
        color: isMocOrder ? "Để mộc" : p.finish,
        dimensions: p.size,
        costPrice: 0,
        retailPrice: p.price,
        unit: "Bộ",
        productType: targetType,
        status: targetType,
        stock: p.qty,
        isPriced: true,
        description: `Tự động nhập từ đơn hủy ${o.code}. Loại: ${o.type}.`,
        techNotes: { leg: "", apron: "", other: "Hàng hoàn hoàn thiện/mộc từ đơn hủy." }
      };

      const logEntry = {
        id: `LOG-CAN-${Date.now()}-${idx}`,
        timestamp: new Date().toISOString(),
        type: "Nhập kho",
        productName: p.name,
        productCode: newItem.code,
        change: +p.qty,
        balance: p.qty,
        reference: o.code,
        authorizedBy: "Hệ thống (Tự động)",
        note: `Hủy đơn ${o.code}. Khách mất cọc. Chuyển sang hàng sẵn.`
      };
      currentLogs.unshift(logEntry);
      return newItem;
    });

    localStorage.setItem("tpf_simulated_products", JSON.stringify([...currentInventory, ...newItems]));
    localStorage.setItem("tpf_simulated_inventory_logs", JSON.stringify(currentLogs.slice(0, 100)));

    toast.success(`Đã tự động nhập ${newItems.length} món vào Kho!`, { icon: "📦" });
  };



  const productTotal = order?.products?.reduce((acc, p) => acc + (p.price || 0) * (p.qty || 1), 0) || 0;
  const displayTotalValue = productTotal + (order?.processingFee || 0) - (order?.discount || 0);
  const remainingValue = displayTotalValue - (order?.deposit || 0) - (order?.receivedAmount || 0);

  // Actions logic
  const handleUpdate = (newStatus, extraData = {}) => {
    const saved = JSON.parse(localStorage.getItem("tpf_simulated_orders") || "[]");
    let target = { ...order, status: newStatus, ...extraData };

    // Automation: Convert to stock if forfeited
    if (newStatus === "Đơn đã hủy" && extraData.depositResolution === "forfeited") {
      convertCancelledToStock(target);
    }

    // Add timeline entry
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} — ${now.toLocaleDateString("vi-VN")}`;

    let label = `Cập nhật: ${newStatus}`;
    let desc = `Trạng thái được cập nhật bởi Chủ cửa hàng.`;

    if (extraData.timelineLabel) label = extraData.timelineLabel;
    if (extraData.timelineDesc) desc = extraData.timelineDesc;

    const newEntry = { time: timeStr, label, desc, active: true };
    target.timeline = [...(target.timeline || []), newEntry];

    // Remove internal flags from data
    delete target.timelineLabel;
    delete target.timelineDesc;

    const updatedList = saved.filter(o => o.id !== order.id && o.code !== order.code);
    updatedList.push(target);

    localStorage.setItem("tpf_simulated_orders", JSON.stringify(updatedList));
    setOrder(target);
    onStatusChanged(target.id, newStatus);
    toast.success(`Đã cập nhật trạng thái: ${newStatus}`);
  };

  const handleFinishOrder = () => {
    if (!deliveryImage && !order.deliveryImage) {
      toast.error("Vui lòng tải ảnh giao hàng trước!");
      return;
    }

    // Warranty Activation logic (simulated by adding to warranties list)
    try {
      const savedWarranties = JSON.parse(localStorage.getItem("tpf_simulated_warranties") || "[]");
      const newWarranties = order.products.map((p, idx) => {
        const mat = p.material?.toLowerCase() || "";
        const months = mat.includes("sồi") || mat.includes("mdf") || mat.includes("công nghiệp") ? 12 : 36;
        const start = new Date();
        const end = new Date();
        end.setMonth(end.getMonth() + months);

        return {
          id: `BH-${order.code}-${idx + 1}`,
          orderId: order.code,
          productName: p.name,
          startDate: start.toISOString().split('T')[0],
          endDate: end.toISOString().split('T')[0],
          status: "Active"
        };
      });
      localStorage.setItem("tpf_simulated_warranties", JSON.stringify([...savedWarranties, ...newWarranties]));
    } catch (e) { console.error(e); }

    const debtAmount = Math.max(0, remainingValue - finalPayment);
    const isFullPayment = debtAmount <= 0;

    handleUpdate("Hoàn thành", {
      deliveryImage: deliveryImage || order.deliveryImage,
      receivedAmount: finalPayment,
      debtAmount: debtAmount,
      paymentMethod,
      painter_cost: painterCost,
      paymentStatus: isFullPayment ? "full" : "partial",
      timelineLabel: "Hoàn tất đơn hàng",
      timelineDesc: isFullPayment
        ? "Khách hàng đã nhận đủ sản phẩm và thanh toán hoàn tất. Kích hoạt bảo hành."
        : `Khách nhận hàng & thanh toán một phần. Ghi nợ: ${fmtCurrency(debtAmount)}. Kích hoạt bảo hành.`
    });
    setShowCompleteModal(false);
  };

  const handleHandoverConfirm = () => {
    const isMoc = order.type === "Hàng mộc";
    const newStatus = isMoc ? "Đang sản xuất" : "Đang gia công";
    const deadlineStr = new Date(handoverDeadline).toLocaleDateString("vi-VN");

    handleUpdate(newStatus, {
      worker_deadline: handoverDeadline,
      handover_notes: handoverNotes,
      handover_checklist: {
        approved_at: new Date().toISOString(),
        notes: handoverNotes,
        deadline: handoverDeadline
      },
      timelineLabel: "Bàn giao gia công",
      timelineDesc: isMoc
        ? `Owner bàn giao xưởng. Deadline: ${deadlineStr}. Ghi chú: ${handoverNotes || "Không"}`
        : `Đã duyệt mộc & chuyển gia công. Deadline: ${deadlineStr}.`
    });
    setShowHandoverModal(false);
  };


  const handleSafeClose = () => {
    if (hasUnsavedChanges) {
      if (window.confirm("Bạn có thay đổi chưa lưu. Bạn có chắc chắn muốn đóng?")) onClose();
    } else onClose();
  };

  useEffect(() => {
    const handleKeyDown = (e) => { if (isOpen && e.key === "Escape") handleSafeClose(); };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, hasUnsavedChanges]);

  if (!isOpen) return null;



  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px] animate-in fade-in duration-200"
        onClick={handleSafeClose}
      />
      <div
        className="relative bg-white w-full max-w-6xl h-full max-h-[90vh] rounded-[2.5rem] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        style={{ boxShadow: "0 25px 50px rgba(0,0,0,0.15)" }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
              <Package size={20} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-[17px] font-bold text-gray-900">
                  Chi tiết đơn hàng
                </h2>
                <span className="px-2 py-0.5 bg-gray-50 border border-gray-200 text-gray-600 rounded-md text-[11px] font-bold font-mono">
                  {order?.code || invoiceId}
                </span>
                {order && (
                  <span
                    className="px-2 py-0.5 rounded-md text-[11px] font-bold border capitalize"
                    style={{
                      backgroundColor: statusStyle(order.status).bg,
                      color: statusStyle(order.status).text,
                      borderColor: statusStyle(order.status).border,
                    }}
                  >
                    {order.status}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={handleSafeClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>



        {/* Content Body */}
        <div className="flex-1 overflow-hidden flex flex-col relative">
          {viewState === "loading" && <LoadingSkeleton />}
          {viewState === "error" && <ErrorState onRetry={() => setViewState("loading")} />}
          {viewState === "ready" && order && (
            <StandardOrderView
              o={order}
              productTotal={productTotal}
              displayTotal={displayTotalValue}
              hasPricing={true}
              remaining={remainingValue}
              deliveryImage={deliveryImage}
              onDeliveryImageChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => setDeliveryImage(reader.result);
                  reader.readAsDataURL(file);
                }
              }}
              onPreview={setPreviewImage}
            />
          )}
        </div>

        {/* Footer Actions Section */}
        {viewState === "ready" && order && (
          <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end shrink-0">
            {/* Action Buttons Column */}
            <div className="flex items-center gap-3">
              {/* 1. Bàn giao xưởng */}
              {((order.status === "Chờ xử lý" && order.type === "Hàng mộc") || (order.status === "Đã nhập kho" && order.type === "Hàng khách đặt")) && (
                <button
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-[13px] font-black hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-2"
                  onClick={() => setShowHandoverModal(true)}
                >
                  <Hammer size={16} /> BÀN GIAO XƯỞNG
                </button>
              )}

              {/* 2. Xác nhận đơn (Hàng sẵn) */}
              {order.status === "Chờ xử lý" && order.type === "Hàng sẵn" && (
                <button
                  className="px-6 py-3 bg-emerald-600 text-white rounded-xl text-[13px] font-black hover:bg-emerald-700 transition-all active:scale-95 flex items-center gap-2"
                  onClick={() => {
                    if (window.confirm("Xác nhận đơn hàng và Chờ giao hàng?")) {
                      handleUpdate("Chờ giao hàng");
                    }
                  }}
                >
                  <CheckCircle size={16} /> XÁC NHẬN ĐƠN
                </button>
              )}

              {/* 3. Hoàn tất gia công */}
              {order.status === "Đang gia công" && (order.type === "Hàng mộc" || order.type === "Hàng khách đặt") && (
                <button
                  className="px-6 py-3 bg-emerald-600 text-white rounded-xl text-[13px] font-black hover:bg-emerald-700 transition-all active:scale-95 flex items-center gap-2"
                  onClick={() => {
                    if (window.confirm("Xác nhận sản phẩm đã hoàn thiện và sẵn sàng để giao?")) {
                      handleUpdate("Chờ giao hàng");
                    }
                  }}
                >
                  <CheckCircle size={16} /> HOÀN TẤT GIA CÔNG
                </button>
              )}

              {/* 4. Bắt đầu giao hàng */}
              {order.status === "Chờ giao hàng" && (
                <button
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl text-[13px] font-black hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2"
                  onClick={() => handleUpdate("Đang giao hàng")}
                >
                  <RefreshCw size={16} /> BẮT ĐẦU GIAO
                </button>
              )}

              {/* 5. Hoàn tất đơn hàng */}
              {order.status === "Đang giao hàng" && (
                <button
                  className="px-6 py-3 bg-emerald-600 text-white rounded-xl text-[13px] font-black hover:bg-emerald-700 transition-all active:scale-95 flex items-center gap-2"
                  onClick={() => setShowCompleteModal(true)}
                >
                  <CheckCircle size={16} /> HOÀN TẤT ĐƠN
                </button>
              )}

              {/* 6. Duyệt hủy (Nếu là Chờ duyệt hủy) */}
              {order.status === "Chờ duyệt hủy" && (
                <div className="flex gap-2">
                  <button
                    className="px-5 py-3 bg-rose-600 text-white rounded-xl text-[13px] font-black hover:bg-rose-700 transition-all active:scale-95 flex items-center gap-2"
                    onClick={() => {
                      if (window.confirm("Duyệt hủy đơn và HOÀN TRẢ TIỀN CỌC cho khách hàng?")) {
                        handleUpdate("Đơn đã hủy", {
                          depositResolution: "refunded",
                          timelineLabel: "Duyệt hủy & Hoàn cọc",
                          timelineDesc: "Chủ cửa hàng đã duyệt. Đã hoàn trả tiền cọc 100%."
                        });
                      }
                    }}
                  >
                    <XCircle size={16} /> HOÀN CỌC
                  </button>
                  <button
                    className="px-5 py-3 bg-amber-700 text-white rounded-xl text-[13px] font-black hover:bg-amber-800 transition-all active:scale-95 flex items-center gap-2"
                    onClick={() => {
                      const msg = order.type === "Hàng sẵn"
                        ? "Duyệt hủy đơn và THU HỒI TIỀN CỌC (Bồi thường)?"
                        : "Xác nhận hủy đơn: Khách MẤT CỌC do xưởng đã triển khai sản xuất?";
                      if (window.confirm(msg)) {
                        handleUpdate("Đơn đã hủy", {
                          depositResolution: "forfeited",
                          timelineLabel: "Duyệt hủy & Thu cọc",
                          timelineDesc: "Chủ cửa hàng đã duyệt. Thu hồi tiền cọc bồi thường."
                        });
                      }
                    }}
                  >
                    <Ban size={16} /> THU CỌC
                  </button>
                </div>
              )}

              {/* 7. Yêu cầu hủy (Cho các trạng thái khác) */}
              {["Chờ xử lý", "Chờ sản xuất", "Đã nhập kho", "Đang gia công", "Chờ giao hàng"].includes(order.status) && (
                <button
                  className="px-5 py-3 bg-white text-rose-600 border border-rose-100 rounded-xl text-[13px] font-bold hover:bg-rose-50 transition-all flex items-center gap-2"
                  onClick={() => {
                    const isInitial = order.status === "Chờ xử lý" || order.status === "Chờ sản xuất";
                    let confirmMsg = "Xác nhận yêu cầu hủy đơn hàng này?";
                    if (isInitial) {
                      confirmMsg = "Đơn hàng mới - Chuyển sang Chờ duyệt hủy để quyết định Hoàn hoặc Thu cọc?";
                    } else {
                      confirmMsg = "HÀNG ĐANG XỬ LÝ - Chuyển sang Chờ duyệt hủy để thực hiện THU CỌC bồi thường?";
                    }
                    if (window.confirm(confirmMsg)) {
                      handleUpdate("Chờ duyệt hủy", { cancelReason: "Chủ cửa hàng yêu cầu hủy" });
                    }
                  }}
                >
                  <Ban size={16} /> HỦY
                </button>
              )}
            </div>
          </div>
        )}

        {/* INTERNAL MODALS (PORTAL-STYLE WITHIN POPUP) */}
        {/* These must be at the top level of the relative container to overlay header/footer */}
        {showCompleteModal && (
          <div className="absolute inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
            <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden modal-content border border-slate-100 transform animate-in zoom-in-95 duration-300">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                <h3 className="text-[16px] font-black text-slate-800 flex items-center gap-2">
                  <CheckCircle className="text-emerald-500" size={20} /> HOÀN TẤT ĐƠN HÀNG
                </h3>
                <button onClick={() => setShowCompleteModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                  <X size={18} />
                </button>
              </div>
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-100 space-y-3">
                  <div className="flex justify-between items-center text-[13px] text-slate-500 font-medium">
                    <span>Tổng tiền hàng:</span>
                    <span className="font-bold text-slate-700">{fmtCurrency(displayTotalValue)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[13px] text-slate-500 font-medium">
                    <span>Đã đặt cọc:</span>
                    <span className="font-bold text-slate-700">{fmtCurrency(order.deposit || 0)}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                    <span className="text-emerald-700 font-bold text-[14px]">Cần thanh toán:</span>
                    <span className="text-emerald-700 font-black text-[22px] tracking-tight">{fmtCurrency(remainingValue)}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Số thực thu tại chỗ</label>
                    <div className="mt-1.5 relative">
                      <input
                        type="text"
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-black text-lg text-slate-800 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none"
                        value={formatNumberInput(finalPayment)}
                        onChange={(e) => {
                          const val = Number(parseNumberInput(e.target.value)) || 0;
                          const maxPayable = Math.max(0, remainingValue);
                          if (val > maxPayable) {
                            setFinalPayment(maxPayable);
                            toast.error("Số thực thu không được vượt quá số tiền cần thanh toán", { id: "payment-limit-error" });
                          } else {
                            setFinalPayment(val);
                          }
                        }}
                      />
                      <span className="absolute right-5 top-1/2 -translate-y-1/2 font-bold text-slate-400">₫</span>
                    </div>
                    {remainingValue - finalPayment > 0 && (
                      <div className="mt-2 text-right">
                        <span className="text-[11px] font-black uppercase text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
                          Ghi nợ: {fmtCurrency(remainingValue - finalPayment)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Hình thức thanh toán</label>
                    <div className="grid grid-cols-2 gap-2 mt-1.5">
                      {["Chuyển khoản", "Tiền mặt"].map(m => (
                        <button
                          key={m}
                          onClick={() => setPaymentMethod(m)}
                          className={`py-3 rounded-xl border font-bold text-[13px] transition-all ${paymentMethod === m ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                            }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Ảnh giao hàng thực tế</label>
                    <label className={`mt-2 w-full h-24 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${deliveryImage ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                      }`}>
                      {deliveryImage ? (
                        <img src={deliveryImage} className="h-20 w-auto rounded-lg object-cover" alt="Delivery" />
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-slate-400">
                          <Camera size={20} />
                          <span className="text-[10px] font-bold uppercase">Nhấp để tải ảnh</span>
                        </div>
                      )}
                      <input type="file" accept="image/*" className="hidden"
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

                <button
                  onClick={handleFinishOrder}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-[15px] transition-all active:scale-[0.98] mt-2 h-14 flex items-center justify-center"
                >
                  XÁC NHẬN HOÀN TẤT
                </button>
              </div>
            </div>
          </div>
        )}

        {showHandoverModal && (
          <div className="absolute inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
            <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden modal-content border border-slate-100 transform animate-in zoom-in-95 duration-300">
              <div className="px-6 py-5 border-b border-indigo-100 flex items-center justify-between bg-indigo-50/80">
                <h3 className="text-[16px] font-black text-indigo-800 flex items-center gap-2">
                  <Hammer className="text-indigo-600" size={20} /> BÀN GIAO XƯỞNG
                </h3>
                <button onClick={() => setShowHandoverModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                  <X size={18} />
                </button>
              </div>
              <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Kiểm tra thông số</label>
                    <div className="space-y-2">
                      {[
                        { id: 'dimension', label: 'Kích thước chuẩn yêu cầu' },
                        { id: 'material', label: 'Chất liệu gỗ chuẩn loại' },
                        { id: 'techNotes', label: 'Ghi chú kỹ thuật dặn thợ' }
                      ].map(check => (
                        <label key={check.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50 cursor-pointer hover:bg-slate-50 transition-colors">
                          <input
                            type="checkbox"
                            className="w-5 h-5 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-600"
                            checked={handoverChecks[check.id]}
                            onChange={(e) => setHandoverChecks({ ...handoverChecks, [check.id]: e.target.checked })}
                          />
                          <span className="text-[13px] font-bold text-slate-700">{check.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Calendar size={12} className="text-indigo-500" /> Hạn hoàn thành xong
                    </label>
                    <input
                      type="date"
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-[14px] text-slate-700 mt-1.5 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none"
                      value={handoverDeadline}
                      onChange={(e) => setHandoverDeadline(e.target.value)}
                    />
                    <p className="text-[10px] text-indigo-500 font-bold italic mt-1.5 ml-1">
                      Gợi ý: Trước ngày giao khách 2 ngày ({fmtDate(order?.deliveryDate)})
                    </p>
                  </div>

                  <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <FileText size={12} className="text-indigo-500" /> Ghi chú dặn thợ
                    </label>
                    <textarea
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-[13px] text-slate-700 mt-1.5 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none min-h-[100px]"
                      placeholder="Nhập các yêu cầu cụ thể..."
                      value={handoverNotes}
                      onChange={(e) => setHandoverNotes(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  disabled={!handoverChecks.dimension || !handoverChecks.material}
                  onClick={handleHandoverConfirm}
                  className={`w-full py-4 text-white rounded-2xl font-black text-[15px] transition-all active:scale-[0.98] h-14 flex items-center justify-center ${(!handoverChecks.dimension || !handoverChecks.material) ? 'bg-slate-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                >
                  XÁC NHẬN BÀN GIAO
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* GLOBAL IMAGE PREVIEW */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[2000] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-8 transition-all animate-in fade-in cursor-zoom-out"
          onClick={() => setPreviewImage(null)}
        >
          <img src={previewImage} className="max-w-[90vw] max-h-[90vh] object-contain shadow-2xl rounded-2xl border border-white/10 p-1 bg-white/5 animate-in zoom-in-95 duration-300" alt="Full Preview" />
          <button className="absolute top-8 right-8 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all backdrop-blur-md">
            <X size={24} />
          </button>
        </div>
      )}
    </div>
  );
}

// ===================== MINI UI ATOMS =====================

const LoadingSkeleton = () => (
  <div className="p-8 space-y-8 animate-pulse h-full overflow-hidden">
    <div className="grid grid-cols-2 gap-8 h-full">
      <div className="space-y-6">
        <div className="h-40 bg-slate-100 rounded-3xl" />
        <div className="h-64 bg-slate-100 rounded-3xl" />
      </div>
      <div className="space-y-6">
        <div className="h-48 bg-slate-50 rounded-3xl" />
        <div className="h-32 bg-slate-50 rounded-3xl" />
        <div className="h-40 bg-slate-50 rounded-3xl" />
      </div>
    </div>
  </div>
);

const ErrorState = ({ onRetry }) => (
  <div className="flex flex-col items-center justify-center p-12 text-center h-full bg-slate-50/50">
    <div className="w-20 h-20 rounded-3xl bg-rose-50 flex items-center justify-center text-rose-500 mb-6 shadow-sm border border-rose-100">
      <AlertTriangle size={36} />
    </div>
    <h3 className="text-lg font-black text-slate-800">Không thể tải dữ liệu</h3>
    <p className="text-[14px] text-slate-500 mt-2 max-w-xs leading-relaxed">Đơn hàng không tồn tại hoặc đã bị gỡ khỏi hệ thống. Vui lòng kiểm tra lại.</p>
    <button
      onClick={onRetry}
      className="mt-8 px-8 py-3 bg-indigo-600 text-white rounded-2xl text-[14px] font-black hover:bg-indigo-700 transition-all active:scale-95"
    >
      THỬ LẠI
    </button>
  </div>
);
