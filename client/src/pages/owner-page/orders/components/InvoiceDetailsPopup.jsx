import { useState, useEffect, useRef, useMemo } from "react";
import {
  X, Package, Calendar, User, Phone, MapPin,
  Clock, CheckCircle, AlertTriangle, Hammer,
  Camera, FileText, Ban, RefreshCw, XCircle,
  Truck
} from "lucide-react";
import CustomCheckbox from "@/components/control/CustomCheckbox";
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
      image: "https://noithatzito.com/wp-content/uploads/2021/04/bo-ban-an-go-soi-nga-6-ghe.jpg",
      customerSampleImage: "https://th.bing.com/th/id/OIP.vr9BRteYrPsEUU_wlBWOpwHaFj?o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3",
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
    products: [{ name: "Bộ Sofa gỗ Sồi chữ U", image: "https://dogophihung.com/wp-content/uploads/2020/05/bo-sofa-go-soi-chu-u.jpg", material: "Gỗ Sồi Nga", size: "Chữ U 2m8x1m8", finish: "Sơn màu hạt dẻ", qty: 1, price: 42000000, note: "Nệm da Hàn Quốc màu nâu" }],
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
      image: "https://dogomynghenamtuan.com/wp-content/uploads/2020/07/sap-tho-tu-linh-go-mit-moc.jpg",
      customerSampleImage: "https://th.bing.com/th/id/OIP.vr9BRteYrPsEUU_wlBWOpwHaFj?o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3",
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
      image: "https://xuongdogogiagoc.com/wp-content/uploads/2020/06/bo-ghe-au-a-go-huong-da-moc.jpg",
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
      image: "https://langnghedoanhnhan.com/wp-content/uploads/2021/04/truong-ky-go-gu-lao-moc.jpg",
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
    "Chờ xử lý": { bg: "var(--brand-primary)/5", text: "var(--brand-primary)", border: "var(--brand-primary)/10" },
    "Đang xử lý": { bg: "var(--palette-orange)/5", text: "var(--palette-orange)", border: "var(--palette-orange)/10" },
    "Chờ sản xuất": { bg: "var(--status-warning)/10", text: "var(--status-pending)", border: "var(--status-warning)/20" },
    "Đã nhập kho": { bg: "var(--status-success)/10", text: "var(--status-success)", border: "var(--status-success)/20" },
    "Đang gia công": { bg: "var(--status-warning)/10", text: "var(--status-pending)", border: "var(--status-warning)/20" },
    "Chờ giao hàng": { bg: "var(--palette-purple)/5", text: "var(--palette-purple)", border: "var(--palette-purple)/10" },
    "Đang giao hàng": { bg: "var(--palette-blue)/5", text: "var(--palette-blue)", border: "var(--palette-blue)/10" },
    "Hoàn thành": { bg: "var(--status-success)/10", text: "var(--status-success)", border: "var(--status-success)/20" },
    "Chờ duyệt hủy": { bg: "var(--status-warning)/10", text: "var(--status-pending)", border: "var(--status-warning)/20" },
    "Đơn đã hủy": { bg: "var(--status-error)/5", text: "var(--status-error)", border: "var(--status-error)/10" },
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
        className="w-11 h-11 rounded-xl flex items-center justify-center text-[15px] font-bold shrink-0 bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] border border-[var(--brand-primary)]/10"
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
            className={`absolute top-1 left-[-21px] w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center z-10 transition-colors ${t.active ? "border-[var(--brand-primary)] shadow-[0_0_8px_rgba(52,176,87,0.3)]" : "border-gray-200"
              }`}
          >
            {t.active && <div className="w-1.5 h-1.5 rounded-full bg-[var(--brand-primary)]" />}
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
    emerald: { bg: "bg-[var(--brand-primary)]/5", text: "text-[var(--brand-primary)]", dot: "bg-[var(--brand-primary)]" },
    indigo: { bg: "bg-[var(--brand-primary)]/5", text: "text-[var(--brand-primary)]", dot: "bg-[var(--brand-primary)]" },
    amber: { bg: "bg-[var(--status-warning)]/5", text: "text-[var(--status-pending)]", dot: "bg-[var(--status-pending)]" },
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
              className="relative aspect-square rounded-xl overflow-hidden cursor-zoom-in hover:ring-2 hover:ring-[var(--brand-primary)]/40 transition-all group/img border border-gray-100 shadow-sm"
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
              className="px-5 py-3 flex items-center gap-2"
            >
              <Package size={14} className="text-gray-400" />
              <span className="text-[12px] font-bold uppercase tracking-wider text-gray-500">Giám sát & Đối soát sản phẩm ({o.products.length})</span>
            </div>
            <div className="p-4 space-y-4 bg-gray-50/30">
              {o.products.map((p, idx) => (
                <div key={idx} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                  {/* 1. Visual Comparison Header (The "Observation" Zone) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-gray-100 border-b border-gray-100">
                    {/* Reality Photo */}
                    <div className="relative h-48 bg-gray-50 group cursor-pointer overflow-hidden" onClick={() => p.image && onPreview(p.image)}>
                      {p.image ? (
                        <img src={p.image} alt="Thực tế" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                          <Package size={48} strokeWidth={1} />
                        </div>
                      )}
                      <div className="absolute top-3 left-3 px-3 py-1 bg-black/70 backdrop-blur-md rounded-full border border-white/20">
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Ảnh thực tế xưởng</span>
                      </div>
                    </div>

                    {/* Customer Sample Photo */}
                    <div className="relative h-48 bg-amber-50/30 group cursor-pointer overflow-hidden border-l border-gray-100" onClick={() => p.customerSampleImage && onPreview(p.customerSampleImage)}>
                      {p.customerSampleImage ? (
                        <img src={p.customerSampleImage} alt="Mẫu khách" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-amber-200/50">
                          <Camera size={48} strokeWidth={1} />
                        </div>
                      )}
                      <div className="absolute top-3 right-3 px-3 py-1 bg-amber-600/90 backdrop-blur-md rounded-full border border-amber-400/30">
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Mẫu khách gửi</span>
                      </div>
                      {!p.customerSampleImage && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[11px] font-bold text-amber-600/40 uppercase tracking-tighter">Không có ảnh mẫu đối chiếu</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 2. Product Info Body */}
                  <div className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h4 className="text-[16px] font-black text-slate-800 leading-tight">{p.name}</h4>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="px-2.5 py-1 bg-[var(--brand-primary)] text-white rounded-lg text-[11px] font-black uppercase tracking-wider">
                            x{p.qty} {p.unit || "Bộ"}
                          </span>
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg text-[11px] font-bold uppercase tracking-wider border border-slate-200">
                            Đơn giá: {fmtCurrency(p.price)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-1">Thành tiền</p>
                        <p className="text-[18px] font-black text-slate-900">{fmtCurrency(p.price * p.qty)}</p>
                      </div>
                    </div>

                    {/* 3. Specs Grid (The "Technical Datasheet" Zone) */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--brand-primary)]/5 rounded-full -mr-16 -mt-16 pointer-events-none" />

                      <div className="space-y-1 relative">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Mã sản phẩm</span>
                        <p className="text-[12px] font-bold text-slate-700">{p.sku || `SKU-${idx + 101}`}</p>
                      </div>
                      <div className="space-y-1 relative">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Chất liệu</span>
                        <p className="text-[12px] font-bold text-slate-700">{p.material || "—"}</p>
                      </div>
                      <div className="space-y-1 relative">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Kích thước</span>
                        <p className="text-[12px] font-bold text-slate-700">{p.size || "—"}</p>
                      </div>
                      <div className="space-y-1 relative">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Màu sắc</span>
                        <p className="text-[12px] font-bold text-slate-700">{p.finish || "—"}</p>
                      </div>
                    </div>

                    {/* 4. Technical Notes & Requirements */}
                    <div className="flex flex-col gap-3">
                      {p.note && (
                        <div className="flex items-start gap-3 p-3 bg-amber-50/50 border border-amber-100 rounded-xl">
                          <div className="mt-0.5"><FileText size={14} className="text-amber-500" /></div>
                          <div>
                            <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest block mb-0.5">Ghi chú kỹ thuật & Yêu cầu khách</span>
                            <p className="text-[12px] font-bold text-amber-800 italic leading-relaxed">{p.note}</p>
                          </div>
                        </div>
                      )}
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
                      <span className={`w-2 h-2 rounded-full ${lsx.status === 'Hoàn thành' ? 'bg-[var(--status-success)]' : 'bg-[var(--palette-purple)] animate-pulse'}`} />
                      <div>
                        <p className="text-[13px] font-bold text-gray-800">{lsx.code}</p>
                        <p className="text-[12px] text-gray-500 mt-0.5">{lsx.desc} • Thợ: {lsx.worker}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold ${lsx.status === 'Hoàn thành' ? 'bg-[var(--status-success)]/10 text-[var(--status-success)]' : 'bg-[var(--palette-purple)]/10 text-[var(--palette-purple)]'}`}>
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
              colorClass="emerald"
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

                <div className="h-px bg-slate-100 my-1"></div>
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-black text-slate-800 uppercase tracking-tight">Tổng thanh toán</span>
                  <span className="text-[18px] font-black text-[var(--brand-primary)] leading-none">{fmtCurrency(productTotal)}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Đặt cọc</p>
                    <p className="text-[14px] font-black text-[var(--status-success)]">{fmtCurrency(o.deposit || 0)}</p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Đã thu thêm</p>
                    <p className="text-[14px] font-black text-[var(--status-success)]">{fmtCurrency(o.receivedAmount || 0)}</p>
                  </div>
                </div>

                <div className="p-4 bg-[var(--status-error)]/5 border border-[var(--status-error)]/10 rounded-2xl flex items-center justify-between">
                  <span className="text-[14px] font-black text-[var(--status-error)] uppercase tracking-tight">Còn lại</span>
                  <span className="text-[20px] font-black text-[var(--status-error)] leading-none">{fmtCurrency(remaining)}</span>
                </div>

                <div className="pt-2 flex flex-wrap gap-2">
                  {remaining > 0 && (
                    <div className="px-3 py-1.5 bg-[var(--status-pending)]/10 text-[var(--status-pending)] text-[10px] font-black rounded-full w-fit uppercase tracking-widest border border-[var(--status-pending)]/20 shadow-sm animate-pulse">
                      Thanh toán một phần (Ghi nợ)
                    </div>
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
                  <p className="text-[10px] uppercase tracking-wider font-bold text-[var(--brand-primary)] mb-2">Tải ảnh giao hàng để hoàn tất</p>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[var(--brand-primary)]/20 rounded-xl hover:bg-[var(--brand-primary)]/5 cursor-pointer transition-all">
                    <Camera size={24} className="text-[var(--brand-primary)]/40 mb-2" />
                    <span className="text-[12px] font-bold text-[var(--brand-primary)]">Chọn ảnh thực tế</span>
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
  const remainingValue = productTotal - (order?.deposit || 0) - (order?.receivedAmount || 0);

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
            <div className="w-10 h-10 rounded-xl bg-[var(--brand-primary)]/10 flex items-center justify-center text-[var(--brand-primary)] shadow-sm border border-[var(--brand-primary)]/10">
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
              displayTotal={productTotal}
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
                  className="px-5 py-2 bg-[var(--brand-primary)] text-white rounded-lg text-[13px] font-bold hover:opacity-90 transition-all active:scale-95 flex items-center gap-2"
                  onClick={() => setShowHandoverModal(true)}
                >
                  <Hammer size={16} /> BÀN GIAO XƯỞNG
                </button>
              )}

              {/* 2. Xác nhận đơn (Hàng sẵn) */}
              {order.status === "Chờ xử lý" && order.type === "Hàng sẵn" && (
                <button
                  className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-[13px] font-bold hover:bg-emerald-700 transition-all active:scale-95 flex items-center gap-2"
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
                  className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-[13px] font-bold hover:bg-emerald-700 transition-all active:scale-95 flex items-center gap-2"
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
                  className="px-5 py-2 bg-[var(--palette-blue)] text-white rounded-lg text-[13px] font-bold hover:opacity-90 transition-all active:scale-95 flex items-center gap-2"
                  onClick={() => handleUpdate("Đang giao hàng")}
                >
                  <RefreshCw size={16} /> BẮT ĐẦU GIAO
                </button>
              )}

              {/* 5. Hoàn tất đơn hàng */}
              {order.status === "Đang giao hàng" && (
                <button
                  className="px-5 py-2 bg-[var(--status-success)] text-white rounded-lg text-[13px] font-bold hover:opacity-90 transition-all active:scale-95 flex items-center gap-2"
                  onClick={() => setShowCompleteModal(true)}
                >
                  <CheckCircle size={16} /> HOÀN TẤT ĐƠN
                </button>
              )}

              {/* 6. Duyệt hủy (Nếu là Chờ duyệt hủy) */}
              {order.status === "Chờ duyệt hủy" && (
                <div className="flex gap-2">
                  <button
                    className="px-4 py-2 bg-[var(--status-error)] text-white rounded-lg text-[13px] font-bold hover:opacity-90 transition-all active:scale-95 flex items-center gap-2"
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
                    className="px-4 py-2 bg-[var(--palette-orange)] text-white rounded-lg text-[13px] font-bold hover:opacity-90 transition-all active:scale-95 flex items-center gap-2"
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
                  className="px-4 py-2 bg-white text-[var(--status-error)] border border-[var(--status-error)]/10 rounded-lg text-[13px] font-bold hover:bg-[var(--status-error)]/5 transition-all flex items-center gap-2"
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
                  <CheckCircle className="text-[var(--status-success)]" size={20} /> HOÀN TẤT ĐƠN HÀNG
                </h3>
                <button onClick={() => setShowCompleteModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                  <X size={18} />
                </button>
              </div>
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-100 space-y-3">
                  <div className="flex justify-between items-center text-[13px] text-slate-500 font-medium">
                    <span>Tổng tiền hàng:</span>
                    <span className="font-bold text-slate-700">{fmtCurrency(productTotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[13px] text-slate-500 font-medium">
                    <span>Đã đặt cọc:</span>
                    <span className="font-bold text-slate-700">{fmtCurrency(order.deposit || 0)}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                    <span className="text-[var(--status-success)] font-bold text-[14px]">Cần thanh toán:</span>
                    <span className="text-[var(--status-success)] font-black text-[22px] tracking-tight">{fmtCurrency(remainingValue)}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Số thực thu tại chỗ</label>
                    <div className="mt-1.5 relative">
                      <input
                        type="text"
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-black text-lg text-slate-800 focus:ring-4 focus:ring-[var(--status-success)]/10 focus:border-[var(--status-success)] transition-all outline-none"
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
                        <span className="text-[11px] font-black uppercase text-[var(--status-error)] bg-[var(--status-error)]/5 px-3 py-1 rounded-full border border-[var(--status-error)]/10">
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
                          className={`py-2 px-4 rounded-lg border font-bold text-[13px] transition-all ${paymentMethod === m ? 'bg-[var(--brand-primary)] border-[var(--brand-primary)] text-white' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                            }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Ảnh giao hàng thực tế</label>
                    <label className={`mt-2 w-full h-24 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${deliveryImage ? 'border-[var(--status-success)] bg-[var(--status-success)]/5' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
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
                  className="w-full py-2 bg-[var(--status-success)] hover:opacity-90 text-white rounded-lg font-bold text-[13px] transition-all active:scale-[0.98] mt-2 h-10 flex items-center justify-center"
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
              <div className="px-6 py-5 border-b border-[var(--brand-primary)]/10 flex items-center justify-between bg-[var(--brand-primary)]/5">
                <h3 className="text-[16px] font-black text-[var(--brand-primary)] flex items-center gap-2">
                  <Hammer className="text-[var(--brand-primary)]" size={20} /> BÀN GIAO XƯỞNG
                </h3>
                <button onClick={() => setShowHandoverModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                  <X size={18} />
                </button>
              </div>
              <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto custom-scrollbar">
                {/* 0. Delivery Reference Card */}
                <div className="bg-[var(--brand-primary)]/5 border border-[var(--brand-primary)]/10 rounded-2xl p-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-[var(--brand-primary)] opacity-60 uppercase tracking-widest block">Ngày khách hẹn nhận hàng</span>
                    <div className="flex items-center gap-2 text-[var(--brand-primary)]">
                      <Calendar size={18} />
                      <span className="text-[18px] font-black">{fmtDate(order?.deliveryDate)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black text-[var(--brand-primary)] opacity-60 uppercase tracking-widest block">Loại đơn</span>
                    <span className="px-2 py-0.5 bg-[var(--brand-primary)] text-white rounded-md text-[11px] font-bold uppercase mt-1 inline-block">{order?.type}</span>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Kiểm tra thông số</label>
                    <div className="space-y-2">
                      {[
                        { id: 'dimension', label: 'Kích thước chuẩn yêu cầu' },
                        { id: 'material', label: 'Chất liệu gỗ chuẩn loại' },
                        { id: 'techNotes', label: 'Ghi chú kỹ thuật dặn thợ' }
                      ].map(check => (
                        <label key={check.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50 cursor-pointer hover:bg-slate-50 transition-colors">
                          <CustomCheckbox
                            checked={handoverChecks[check.id]}
                            onChange={(val) => setHandoverChecks({ ...handoverChecks, [check.id]: val })}
                          />
                          <span className="text-[13px] font-bold text-slate-700">{check.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Calendar size={12} className="text-indigo-500" /> Hạn hoàn thành xong cho xưởng
                      </label>
                    </div>

                    <input
                      type="date"
                      className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl font-bold text-[15px] text-slate-800 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm"
                      value={handoverDeadline}
                      onChange={(e) => setHandoverDeadline(e.target.value)}
                    />

                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3, 5].map(days => {
                        const targetDate = new Date(order?.deliveryDate);
                        targetDate.setDate(targetDate.getDate() - days);
                        const dateStr = targetDate.toISOString().split('T')[0];
                        const isActive = handoverDeadline === dateStr;

                        return (
                          <button
                            key={days}
                            onClick={() => setHandoverDeadline(dateStr)}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border ${isActive
                              ? 'bg-[var(--brand-primary)] border-[var(--brand-primary)] text-white shadow-sm'
                              : 'bg-white border-slate-200 text-slate-500 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]'
                              }`}
                          >
                            Trước {days} ngày ({fmtDate(dateStr)})
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <FileText size={12} className="text-[var(--brand-primary)]" /> Ghi chú dặn thợ
                    </label>
                    <textarea
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-[13px] text-slate-700 mt-1.5 focus:ring-4 focus:ring-[var(--brand-primary)]/10 focus:border-[var(--brand-primary)] outline-none min-h-[100px] transition-all"
                      placeholder="Nhập các yêu cầu cụ thể..."
                      value={handoverNotes}
                      onChange={(e) => setHandoverNotes(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  disabled={!handoverChecks.dimension || !handoverChecks.material}
                  onClick={handleHandoverConfirm}
                  className={`w-full py-2 text-white rounded-lg font-bold text-[13px] transition-all active:scale-[0.98] h-10 flex items-center justify-center ${(!handoverChecks.dimension || !handoverChecks.material) ? 'bg-slate-300 cursor-not-allowed' : 'bg-[var(--brand-primary)] hover:opacity-90'
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
      className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg text-[13px] font-bold hover:bg-indigo-700 transition-all active:scale-95"
    >
      THỬ LẠI
    </button>
  </div>
);
