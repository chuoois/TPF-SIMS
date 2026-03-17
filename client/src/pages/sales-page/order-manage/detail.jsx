/**
 * Component SalesOrderDetail
 * Chi tiết đơn hàng — Nhân viên bán hàng (Read-only + Tools)
 * Giống giao diện Owner nhưng không có action chuyển trạng thái.
 */

import { useState, useMemo, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { PageHelmet } from "@/components/seo/PageHelmet";
import {
  ArrowLeft,
  Phone,
  MapPin,
  Calendar,
  Package,
  Truck,
  Clock,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Hammer,
  Camera,
  Eye,
  Printer,
  ShieldCheck,
  XCircle,
  X,
} from "lucide-react";

// ===================== MOCK DATA =====================
// Đồng bộ keys với INITIAL_ORDERS bên index.jsx
export const MOCK_ORDERS_DETAIL = {
  // ========== NHÓM 1: HÀNG SẴN ==========
  "DH-S01": {
    code: "DH-SAN-001",
    type: "Hàng sẵn",
    status: "Chờ xử lý",
    date: "2026-03-12T08:30:00",
    deliveryDate: "2026-03-14",
    fulfillmentType: "Giao tận nơi",
    customer: {
      name: "Nguyễn Văn Hùng",
      phone: "0912345678",
      address: "45 Đường Giải Phóng, Hà Nội",
    },
    salesPerson: "Bình Nguyễn",
    total: 12500000,
    deposit: 12500000,
    paymentStatus: "full",
    products: [
      {
        name: "Ghế sofa đơn nỉ",
        material: "Gỗ sồi",
        size: "80×85 cm",
        finish: "Chân gỗ",
        pattern: "Trơn",
        qty: 2,
        price: 6250000,
        warranty: "12 tháng",
      },
    ],
    timeline: [
      {
        time: "12/03/2026 08:30",
        label: "Tiếp nhận đơn",
        desc: "Đơn hàng mới",
        active: true,
      },
    ],
  },
  "DH-S02": {
    code: "DH-SAN-002",
    type: "Hàng sẵn",
    status: "Chờ giao hàng",
    date: "2026-03-11T14:20:00",
    deliveryDate: "2026-03-12",
    fulfillmentType: "Lấy tại cửa hàng",
    customer: {
      name: "Lê Thị Lan",
      phone: "0345678901",
      address: "Vinhomes Ocean Park, Hà Nội",
    },
    salesPerson: "Bình Nguyễn",
    total: 3500000,
    deposit: 3500000,
    paymentStatus: "full",
    products: [
      {
        name: "Bàn trà kim loại",
        material: "Sắt nghệ thuật",
        size: "70×70 cm",
        finish: "Sơn tĩnh điện",
        pattern: "Chân X",
        qty: 1,
        price: 3500000,
      },
    ],
    timeline: [
      {
        time: "11/03/2026 14:20",
        label: "Tạo đơn",
        desc: "Thanh toán đủ",
        active: false,
      },
      {
        time: "11/03/2026 15:00",
        label: "Chờ giao hàng",
        desc: "Đã sẵn sàng",
        active: true,
      },
    ],
  },
  "DH-S03": {
    code: "DH-SAN-003",
    type: "Hàng sẵn",
    status: "Đang giao hàng",
    date: "2026-03-10T09:15:00",
    deliveryDate: "2026-03-11",
    fulfillmentType: "Giao tận nơi",
    customer: {
      name: "Trần Minh Quang",
      phone: "0909123456",
      address: "12 Lý Thường Kiệt, Hà Nội",
    },
    salesPerson: "Bình Nguyễn",
    total: 45000000,
    deposit: 45000000,
    paymentStatus: "full",
    products: [
      {
        name: "Sập thờ gỗ",
        material: "Gỗ gụ mật",
        size: "197×107 cm",
        finish: "Vecni",
        pattern: "Mai điểu",
        qty: 1,
        price: 45000000,
      },
    ],
    timeline: [
      {
        time: "11/03/2026 08:00",
        label: "Đang giao hàng",
        desc: "Shipper đi giao",
        active: true,
      },
    ],
  },
  "DH-S04": {
    code: "DH-SAN-004",
    type: "Hàng sẵn",
    status: "Hoàn thành",
    date: "2026-03-09T16:45:00",
    deliveryDate: "2026-03-10",
    fulfillmentType: "Giao nhà",
    deliveryImage:
      "https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&q=80&w=400",
    customer: {
      name: "Phạm Thành Nam",
      phone: "0987654321",
      address: "TP.HCM",
    },
    salesPerson: "Bình Nguyễn",
    total: 8900000,
    deposit: 8900000,
    paymentStatus: "full",
    products: [
      {
        name: "Kệ tivi",
        material: "Gỗ MDF",
        size: "180x40",
        finish: "Melamine",
        pattern: "Trơn",
        qty: 1,
        price: 8900000,
      },
    ],
    timeline: [
      {
        time: "10/03/2026 14:00",
        label: "Hoàn thành",
        desc: "Giao xong",
        active: true,
      },
    ],
  },

  // ========== NHÓM 2: HÀNG THÔ ==========
  "DH-T01": {
    code: "DH-THO-001",
    type: "Hàng thô",
    status: "Chờ xử lý",
    date: "2026-03-12T10:00:00",
    deliveryDate: "2026-03-20",
    customer: {
      name: "Hoàng Nguyệt Ánh",
      phone: "0978901234",
      address: "TP.HCM",
    },
    salesPerson: "Bình Nguyễn",
    total: 56000000,
    deposit: 15000000,
    paymentStatus: "partial",
    products: [
      {
        name: "Sập thờ",
        material: "Gỗ mít",
        size: "220",
        finish: "Mộc",
        pattern: "Tứ linh",
        qty: 1,
        price: 56000000,
        note: "Khách yêu cầu làm mộc kỹ như ảnh mẫu",
      },
    ],
    sampleImages: [
      "https://images.unsplash.com/photo-1615529328322-92c90680fd74?q=80&w=800",
      "https://images.unsplash.com/photo-1620608208153-90928221805b?q=80&w=800",
    ],
    timeline: [
      {
        time: "12/03/2026 10:00",
        label: "Tạo đơn",
        desc: "Nhận mộc",
        active: true,
      },
    ],
  },

  // ========== NHÓM 3: HÀNG ĐẶT ==========
  "DH-D03": {
    code: "DH-DAT-003",
    type: "Hàng khách đặt",
    status: "Đang sản xuất",
    date: "2026-03-10T10:15:00",
    deliveryDate: "2026-03-28",
    customer: {
      name: "Phan Trị",
      phone: "0944123789",
      address: "158 Nguyễn Văn Cừ, Long Biên, HN",
    },
    salesPerson: "Bình Nguyễn",
    total: 45000000,
    deposit: 10000000,
    paymentStatus: "partial",
    products: [
      {
        name: "Tủ rượu gỗ sồi",
        material: "Sồi Nga",
        size: "120x200x40cm",
        finish: "Sơn màu óc chó",
        pattern: "Trơn hiện đại",
        qty: 1,
        price: 45000000,
        note: "Yêu cầu sơn màu óc chó đậm giống ảnh mẫu khách gửi.",
      },
    ],
    sampleImages: [
      "https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=800",
      "https://images.unsplash.com/photo-1616486341351-70252447aece?q=80&w=800",
    ],
    timeline: [
      {
        time: "10/03/2026 10:15",
        label: "Tạo đơn",
        desc: "Khách đặt màu óc chó",
        active: false,
      },
      {
        time: "11/03/2026 09:00",
        label: "Đang sản xuất",
        desc: "Đã bàn giao xưởng",
        active: true,
      },
    ],
  },
};

// ===================== HELPERS =====================
const fmtCurrency = (n) =>
  n != null
    ? new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(n)
    : "—";

const fmtDate = (s) =>
  s ? new Date(s).toLocaleDateString("vi-VN") : "";

const fmtDateTime = (s) => {
  if (!s) return "—";
  const d = new Date(s);
  return `${d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} — ${d.toLocaleDateString("vi-VN")}`;
};

const statusStyle = (status) => {
  const m = {
    "Chờ xử lý": { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" }, // Blue
    "Đang xử lý": { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" }, // Orange
    "Đang sản xuất": { bg: "#FEF3C7", text: "#D97706", border: "#FDE68A" }, // Amber
    "Chờ giao hàng": { bg: "#F5F3FF", text: "#7C3AED", border: "#DDD6FE" }, // Purple
    "Đang giao hàng": { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" }, // Deep Blue
    "Hoàn thành": { bg: "#F0FDF4", text: "#166534", border: "#BBF7D0" }, // Green
    "Chờ duyệt hủy": { bg: "#FEF3C7", text: "#D97706", border: "#FDE68A" }, // Amber/Yellow
    "Đã hủy": { bg: "#FEF2F2", text: "#B91C1C", border: "#FECACA" }, // Red
  };
  return m[status] || { bg: "#F3F4F6", text: "#6B7280", border: "#E5E7EB" };
};

function readNumberVN(num) {
  if (!num) return "";
  const units = ["", "nghìn", "triệu", "tỷ"];
  const words = [
    "không",
    "một",
    "hai",
    "ba",
    "bốn",
    "năm",
    "sáu",
    "bảy",
    "tám",
    "chín",
  ];
  let result = "";
  let str = String(num);
  let unitIdx = 0;
  while (str.length > 0) {
    let block = parseInt(str.slice(-3), 10);
    str = str.slice(0, -3);
    if (block > 0 || (unitIdx === 0 && num === 0)) {
      let blockStr = "";
      let h = Math.floor(block / 100);
      let t = Math.floor((block % 100) / 10);
      let u = block % 10;
      if (h > 0 || str.length > 0) blockStr += words[h] + " trăm ";
      if (t > 1) blockStr += words[t] + " mươi ";
      else if (t === 1) blockStr += "mười ";
      else if (t === 0 && u > 0 && (h > 0 || str.length > 0))
        blockStr += "linh ";
      if (u === 1 && t > 1) blockStr += "mốt ";
      else if (u === 5 && t > 0) blockStr += "lăm ";
      else if (u > 0) blockStr += words[u] + " ";
      result = blockStr + units[unitIdx] + " " + result;
    }
    unitIdx++;
  }
  result = result.replace(/\s+/g, " ").trim();
  return result.charAt(0).toUpperCase() + result.slice(1) + " đồng";
}

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
    style={{
      backgroundColor: "var(--background)",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    }}
  >
    <div
      className="px-5 py-4 flex items-center gap-4"
      style={{ borderBottom: "1px solid var(--grid-border)" }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center text-[15px] font-bold shrink-0"
        style={{
          backgroundColor: "var(--bg-main)",
          color: "var(--brand-primary)",
          border: "1px solid var(--grid-border)",
        }}
      >
        {o.customer.name.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="text-[14px] font-bold truncate"
          style={{ color: "var(--text-main)" }}
        >
          {o.customer.name}
        </p>
        <div className="flex items-center gap-4 mt-0.5 flex-wrap">
          <span
            className="inline-flex items-center gap-1 text-[12px]"
            style={{ color: "var(--text-secondary)" }}
          >
            <Phone size={11} style={{ color: "var(--text-placeholder)" }} />
            {o.customer.phone}
          </span>
          <span
            className="inline-flex items-center gap-1 text-[12px]"
            style={{ color: "var(--text-secondary)" }}
          >
            <MapPin size={11} style={{ color: "var(--text-placeholder)" }} />
            {o.customer.address}
          </span>
        </div>
      </div>
    </div>

    <div className="px-5 py-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
        <div>
          <p
            className="text-[10px] uppercase tracking-wider font-bold"
            style={{ color: "var(--text-placeholder)" }}
          >
            Mã đơn
          </p>
          <p
            className="text-[13px] font-semibold mt-0.5"
            style={{ color: "var(--text-main)" }}
          >
            {o.code}
          </p>
        </div>
        <div>
          <p
            className="text-[10px] uppercase tracking-wider font-bold"
            style={{ color: "var(--text-placeholder)" }}
          >
            Loại đơn
          </p>
          <p
            className="text-[13px] font-semibold mt-0.5"
            style={{ color: "var(--text-main)" }}
          >
            {o.type}
          </p>
        </div>
        <div>
          <p
            className="text-[10px] uppercase tracking-wider font-bold"
            style={{ color: "var(--text-placeholder)" }}
          >
            Nhân viên
          </p>
          <p
            className="text-[13px] font-semibold mt-0.5"
            style={{ color: "var(--text-main)" }}
          >
            {o.salesPerson}
          </p>
        </div>
        <div>
          <p
            className="text-[10px] uppercase tracking-wider font-bold"
            style={{ color: "var(--text-placeholder)" }}
          >
            Ngày tạo
          </p>
          <p
            className="text-[13px] font-semibold mt-0.5"
            style={{ color: "var(--text-main)" }}
          >
            {fmtDateTime(o.date)}
          </p>
        </div>
        <div>
          <p
            className="text-[10px] uppercase tracking-wider font-bold"
            style={{ color: "var(--text-placeholder)" }}
          >
            Ngày giao
          </p>
          <p
            className="text-[13px] font-semibold mt-0.5"
            style={{ color: "var(--text-main)" }}
          >
            {fmtDate(o.deliveryDate)}
          </p>
        </div>
      </div>

      {o.notes && (
        <div
          className="mt-3 pt-3"
          style={{ borderTop: "1px solid var(--grid-border)" }}
        >
          <p
            className="text-[10px] uppercase tracking-wider font-bold"
            style={{ color: "var(--text-placeholder)" }}
          >
            Ghi chú
          </p>
          <p
            className="text-[12px] mt-0.5"
            style={{ color: "var(--text-secondary)" }}
          >
            {o.notes}
          </p>
        </div>
      )}
    </div>
  </div>
);

const HistoryCard = ({ o }) => (
  <div
    className="rounded-2xl overflow-hidden mt-4"
    style={{
      backgroundColor: "var(--background)",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    }}
  >
    <div
      className="px-5 py-3 flex items-center gap-2"
      style={{
        borderBottom: "1px solid var(--grid-border)",
        backgroundColor: "var(--grid-header-bg)",
      }}
    >
      <Clock size={14} style={{ color: "var(--brand-primary)" }} />
      <span
        className="text-[12px] font-bold uppercase tracking-wider"
        style={{ color: "var(--text-main)" }}
      >
        Lịch sử giao dịch
      </span>
    </div>
    <div className="px-5 py-4">
      {o.timeline.map((t, i) => {
        const isLast = i === o.timeline.length - 1;
        return (
          <div key={i} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                style={{
                  backgroundColor: t.active
                    ? "var(--brand-primary)"
                    : "var(--grid-border)",
                }}
              />
              {!isLast && (
                <div
                  className="w-px flex-1 my-1"
                  style={{ backgroundColor: "var(--grid-border)" }}
                />
              )}
            </div>
            <div className="pb-3.5 min-w-0">
              <p
                className="text-[12px] font-bold"
                style={{
                  color: t.active ? "var(--brand-primary)" : "var(--text-main)",
                }}
              >
                {t.label}
              </p>
              <p
                className="text-[10px]"
                style={{ color: "var(--text-placeholder)" }}
              >
                {t.time}
              </p>
              <p
                className="text-[11px] mt-0.5"
                style={{ color: "var(--text-secondary)" }}
              >
                {t.desc}
              </p>
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
    style={{
      backgroundColor: "var(--background)",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    }}
  >
    <div
      className="px-5 py-3 flex items-center justify-between"
      style={{
        borderBottom: "1px solid var(--grid-border)",
        backgroundColor: "var(--grid-header-bg)",
      }}
    >
      <div className="flex items-center gap-2">
        <Camera size={14} className="text-emerald-600" />
        <span
          className="text-[12px] font-bold uppercase tracking-wider"
          style={{ color: "var(--text-main)" }}
        >
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
          <div
            key={idx}
            className="group relative aspect-square rounded-xl overflow-hidden bg-gray-50 border border-gray-100 hover:shadow-lg transition cursor-pointer"
          >
            <img
              src={img}
              alt="Sample"
              className="w-full h-full object-cover transition duration-300 group-hover:scale-110"
            />
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

export const PrintableInvoice = ({ o, displayTotal }) => {
  const today = new Date();
  const printDate = `Ngày ${today.getDate()} tháng ${today.getMonth() + 1} năm ${today.getFullYear()}`;
  return (
    <div
      style={{
        fontFamily: "'Times New Roman', serif",
        color: "#000",
        padding: "20px 0",
        width: "100%",
        maxWidth: "800px",
        margin: "0 auto",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <h1
          style={{
            fontSize: 26,
            fontWeight: "bold",
            marginBottom: 4,
            textTransform: "uppercase",
            color: "#d32f2f",
          }}
        >
          ĐỒ GỖ MỸ NGHỆ
        </h1>
        <h2
          style={{
            fontSize: 36,
            fontFamily: "'Dancing Script', 'Brush Script MT', cursive, serif",
            color: "#d32f2f",
            margin: "4px 0 8px 0",
            fontWeight: "normal",
          }}
        >
          Trọng Phóng
        </h2>
        <p style={{ fontSize: 16, color: "#d32f2f", margin: "4px 0" }}>
          NHẬN ĐẶT HÀNG THEO YÊU CẦU
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 13,
            color: "#d32f2f",
            fontWeight: "bold",
            margin: "8px 0 0 0",
          }}
        >
          <span>ĐC: CHỢ BƯƠNG - CẤN HỮU - QUỐC OAI - HÀ NỘI</span>
          <span>ĐT: 0988.113.995</span>
        </div>
        <div
          style={{ borderBottom: "1px solid #d32f2f", margin: "10px 0 16px" }}
        />
        <h2
          style={{
            fontSize: 22,
            fontWeight: "bold",
            marginBottom: 16,
            color: "#d32f2f",
          }}
        >
          HOÁ ĐƠN BÁN HÀNG
        </h2>
      </div>

      {/* Customer info */}
      <div style={{ marginBottom: 20 }}>
        <div
          style={{ display: "flex", alignItems: "flex-end", marginBottom: 12 }}
        >
          <span
            style={{
              fontSize: 13,
              color: "#d32f2f",
              marginRight: 8,
              whiteSpace: "nowrap",
            }}
          >
            TÊN KHÁCH HÀNG:
          </span>
          <span
            style={{
              flex: 1,
              borderBottom: "1px dotted #d32f2f",
              fontSize: 16,
              color: "blue",
              fontFamily: "'Caveat', 'Dancing Script', cursive, serif",
            }}
          >
            {o.customer.name}
          </span>
        </div>
        <div
          style={{ display: "flex", alignItems: "flex-end", marginBottom: 12 }}
        >
          <span
            style={{
              fontSize: 13,
              color: "#d32f2f",
              marginRight: 8,
              whiteSpace: "nowrap",
            }}
          >
            ĐỊA CHỈ:
          </span>
          <span
            style={{
              flex: 1,
              borderBottom: "1px dotted #d32f2f",
              fontSize: 16,
              color: "blue",
              fontFamily: "'Caveat', 'Dancing Script', cursive, serif",
              minHeight: 22,
            }}
          >
            {o.customer.address}
          </span>
        </div>
        <div
          style={{ display: "flex", alignItems: "flex-end", marginBottom: 12 }}
        >
          <span
            style={{
              fontSize: 13,
              color: "#d32f2f",
              marginRight: 8,
              whiteSpace: "nowrap",
            }}
          >
            NGÀY GIAO:
          </span>
          <span
            style={{
              flex: 1,
              borderBottom: "1px dotted #d32f2f",
              fontSize: 16,
              color: "blue",
              fontFamily: "'Caveat', 'Dancing Script', cursive, serif",
              minHeight: 22,
            }}
          >
            {fmtDate(o.deliveryDate)}
          </span>
        </div>
      </div>

      {/* Products table */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: 14,
          marginBottom: 20,
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                border: "1px solid #d32f2f",
                padding: "8px 6px",
                textAlign: "center",
                width: 40,
                color: "#d32f2f",
                fontWeight: "normal",
              }}
            >
              SỐ TT
            </th>
            <th
              style={{
                border: "1px solid #d32f2f",
                padding: "8px 6px",
                textAlign: "center",
                color: "#d32f2f",
                fontWeight: "normal",
              }}
            >
              TÊN MẶT HÀNG
            </th>
            <th
              style={{
                border: "1px solid #d32f2f",
                padding: "8px 6px",
                textAlign: "center",
                width: 80,
                color: "#d32f2f",
                fontWeight: "normal",
              }}
            >
              SỐ LƯỢNG
            </th>
            <th
              style={{
                border: "1px solid #d32f2f",
                padding: "8px 6px",
                textAlign: "center",
                width: 70,
                color: "#d32f2f",
                fontWeight: "normal",
              }}
            >
              BẢO HÀNH
            </th>
            <th
              style={{
                border: "1px solid #d32f2f",
                padding: "8px 6px",
                textAlign: "center",
                width: 110,
                color: "#d32f2f",
                fontWeight: "normal",
              }}
            >
              ĐƠN GIÁ
            </th>
            <th
              style={{
                border: "1px solid #d32f2f",
                padding: "8px 6px",
                textAlign: "center",
                width: 140,
                color: "#d32f2f",
                fontWeight: "normal",
              }}
            >
              THÀNH TIỀN
            </th>
          </tr>
        </thead>
        <tbody>
          {o.products.map((p, i) => (
            <tr key={i}>
              <td
                style={{
                  border: "1px solid #d32f2f",
                  padding: "6px",
                  textAlign: "center",
                  color: "blue",
                  fontFamily: "'Caveat', 'Dancing Script', cursive, serif",
                  fontSize: 16,
                }}
              >
                {i + 1}
              </td>
              <td
                style={{
                  border: "1px solid #d32f2f",
                  padding: "6px",
                  color: "blue",
                  fontFamily: "'Caveat', 'Dancing Script', cursive, serif",
                  fontSize: 16,
                }}
              >
                {p.name}
                {p.note && (
                  <div
                    style={{ fontSize: 13, fontStyle: "italic", color: "blue" }}
                  >
                    * {p.note}
                  </div>
                )}
              </td>
              <td
                style={{
                  border: "1px solid #d32f2f",
                  padding: "6px",
                  textAlign: "center",
                  color: "blue",
                  fontFamily: "'Caveat', 'Dancing Script', cursive, serif",
                  fontSize: 16,
                }}
              >
                {p.qty}
              </td>
              <td
                style={{
                  border: "1px solid #d32f2f",
                  padding: "6px",
                  textAlign: "center",
                  color: "blue",
                  fontFamily: "'Caveat', 'Dancing Script', cursive, serif",
                  fontSize: 16,
                }}
              >
                {p.warranty || "—"}
              </td>
              <td
                style={{
                  border: "1px solid #d32f2f",
                  padding: "6px",
                  textAlign: "right",
                  color: "blue",
                  fontFamily: "'Caveat', 'Dancing Script', cursive, serif",
                  fontSize: 16,
                }}
              >
                {p.price ? fmtCurrency(p.price) : "—"}
              </td>
              <td
                style={{
                  border: "1px solid #d32f2f",
                  padding: "6px",
                  textAlign: "right",
                  color: "blue",
                  fontFamily: "'Caveat', 'Dancing Script', cursive, serif",
                  fontSize: 16,
                }}
              >
                {p.price ? fmtCurrency(p.price * p.qty) : "—"}
              </td>
            </tr>
          ))}
          {/* Fill empty rows to make it look like a real receipt pad */}
          {Array.from({ length: Math.max(0, 5 - o.products.length) }).map(
            (_, i) => (
              <tr key={"empty-" + i}>
                <td
                  style={{ border: "1px solid #d32f2f", padding: "14px 6px" }}
                ></td>
                <td
                  style={{ border: "1px solid #d32f2f", padding: "14px 6px" }}
                ></td>
                <td
                  style={{ border: "1px solid #d32f2f", padding: "14px 6px" }}
                ></td>
                <td
                  style={{ border: "1px solid #d32f2f", padding: "14px 6px" }}
                ></td>
                <td
                  style={{ border: "1px solid #d32f2f", padding: "14px 6px" }}
                ></td>
                <td
                  style={{ border: "1px solid #d32f2f", padding: "14px 6px" }}
                ></td>
              </tr>
            ),
          )}
          {/* Breakdown Rows */}
          {o.subtotal !== undefined ||
          o.processingFee !== undefined ||
          o.discount > 0 ||
          o.deposit > 0 ? (
            <>
              {o.subtotal !== undefined && (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      border: "1px solid #d32f2f",
                      padding: "6px 8px",
                      textAlign: "right",
                      color: "#d32f2f",
                      fontSize: 13,
                    }}
                  >
                    TỔNG TIỀN HÀNG:
                  </td>
                  <td
                    style={{
                      border: "1px solid #d32f2f",
                      padding: "6px 8px",
                      textAlign: "right",
                      color: "blue",
                      fontFamily: "'Caveat', 'Dancing Script', cursive, serif",
                      fontSize: 16,
                    }}
                  >
                    {fmtCurrency(o.subtotal)}
                  </td>
                </tr>
              )}
              {o.processingFee !== undefined && (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      border: "1px solid #d32f2f",
                      padding: "6px 8px",
                      textAlign: "right",
                      color: "#d32f2f",
                      fontSize: 13,
                    }}
                  >
                    PHÍ GIA CÔNG:
                  </td>
                  <td
                    style={{
                      border: "1px solid #d32f2f",
                      padding: "6px 8px",
                      textAlign: "right",
                      color: "blue",
                      fontFamily: "'Caveat', 'Dancing Script', cursive, serif",
                      fontSize: 16,
                    }}
                  >
                    {fmtCurrency(o.processingFee)}
                  </td>
                </tr>
              )}
              {o.discount !== undefined && (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      border: "1px solid #d32f2f",
                      padding: "6px 8px",
                      textAlign: "right",
                      color: "#d32f2f",
                      fontSize: 13,
                    }}
                  >
                    GIẢM GIÁ:
                  </td>
                  <td
                    style={{
                      border: "1px solid #d32f2f",
                      padding: "6px 8px",
                      textAlign: "right",
                      color: "blue",
                      fontFamily: "'Caveat', 'Dancing Script', cursive, serif",
                      fontSize: 16,
                    }}
                  >
                    {fmtCurrency(o.discount)}
                  </td>
                </tr>
              )}
              {o.deposit !== undefined && (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      border: "1px solid #d32f2f",
                      padding: "6px 8px",
                      textAlign: "right",
                      color: "#d32f2f",
                      fontSize: 13,
                    }}
                  >
                    {o.type === "Hàng sẵn" ? "TIỀN ĐÃ TRẢ:" : "TIỀN ĐẶT CỌC:"}
                  </td>
                  <td
                    style={{
                      border: "1px solid #d32f2f",
                      padding: "6px 8px",
                      textAlign: "right",
                      color: "blue",
                      fontFamily: "'Caveat', 'Dancing Script', cursive, serif",
                      fontSize: 16,
                    }}
                  >
                    {fmtCurrency(o.deposit)}
                  </td>
                </tr>
              )}
              <tr>
                <td
                  colSpan={4}
                  style={{
                    border: "1px solid #d32f2f",
                    padding: "6px 8px",
                    textAlign: "right",
                    color: "#d32f2f",
                    fontWeight: "bold",
                    fontSize: 14,
                  }}
                >
                  {o.type === "Hàng sẵn"
                    ? "TỔNG CÒN LẠI:"
                    : "CÒN LẠI PHẢI THU:"}
                </td>
                <td
                  style={{
                    border: "1px solid #d32f2f",
                    padding: "6px 8px",
                    textAlign: "right",
                    color: "blue",
                    fontFamily: "'Caveat', 'Dancing Script', cursive, serif",
                    fontSize: 18,
                    fontWeight: "bold",
                  }}
                >
                  {fmtCurrency(displayTotal - (o.deposit || 0))}
                </td>
              </tr>
            </>
          ) : (
            <tr>
              <td
                colSpan={4}
                style={{
                  border: "1px solid #d32f2f",
                  padding: "6px 8px",
                  textAlign: "center",
                  color: "#d32f2f",
                  fontWeight: "normal",
                }}
              >
                CỘNG
              </td>
              <td
                style={{
                  border: "1px solid #d32f2f",
                  padding: "6px 8px",
                  textAlign: "right",
                  color: "blue",
                  fontFamily: "'Caveat', 'Dancing Script', cursive, serif",
                  fontSize: 16,
                }}
              >
                {fmtCurrency(displayTotal)}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Totals in words */}
      <div
        style={{ display: "flex", alignItems: "flex-start", marginBottom: 20 }}
      >
        <span
          style={{
            fontSize: 13,
            color: "#d32f2f",
            marginRight: 8,
            whiteSpace: "nowrap",
            textTransform: "uppercase",
          }}
        >
          THÀNH TIỀN BẰNG CHỮ:
        </span>
        <span
          style={{
            flex: 1,
            borderBottom: "1px dotted #d32f2f",
            fontSize: 16,
            color: "blue",
            fontFamily: "'Caveat', 'Dancing Script', cursive, serif",
          }}
        >
          {readNumberVN(displayTotal - (o.deposit || 0))}
        </span>
      </div>

      {/* Notes */}
      {o.notes && (
        <div
          style={{
            marginBottom: 20,
            fontSize: 13,
            fontStyle: "italic",
            color: "#555",
          }}
        >
          <strong style={{ color: "#d32f2f" }}>Ghi chú:</strong> {o.notes}
        </div>
      )}

      {/* Signatures */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 40,
          fontSize: 14,
          textAlign: "center",
        }}
      >
        <div style={{ width: "40%" }}>
          <p style={{ color: "#d32f2f", marginBottom: 30 }}>
            Khách hàng ký nhận
          </p>
        </div>
        <div style={{ width: "40%" }}>
          <p style={{ color: "#d32f2f", marginBottom: 4, fontStyle: "italic" }}>
            {printDate}
          </p>
          <p style={{ color: "#d32f2f", marginBottom: 30 }}>Chủ cửa hàng</p>
          <p
            style={{
              fontFamily: "'Caveat', 'Dancing Script', cursive, serif",
              fontSize: 18,
              color: "blue",
            }}
          >
            Nguyễn Trọng Phóng
          </p>
        </div>
      </div>
    </div>
  );
};

// --- KIỂU HIỂN THỊ ĐƠN HÀNG THÔNG THƯỜNG ---
const StandardOrderView = ({ o, displayTotal, hasPricing, remaining }) => {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      {/* ── BANNER ── */}
      {o.status === "Chờ giao hàng" && (
        <div
          className="flex items-start gap-3 p-4 rounded-2xl"
          style={{ backgroundColor: "#F0FDF4", border: "1px solid #BBF7D0" }}
        >
          <CheckCircle
            size={18}
            className="shrink-0 mt-0.5"
            style={{ color: "#166534" }}
          />
          <div>
            <p className="text-[14px] font-bold" style={{ color: "#14532D" }}>
              Sản phẩm đã sẵn sàng giao!
            </p>
            <p className="text-[13px] mt-0.5" style={{ color: "#15803D" }}>
              Hàng hóa đã được hoàn thiện và đóng gói. Vui lòng sắp xếp lịch
              trình để giao cho khách.
            </p>
          </div>
        </div>
      )}

      {o.status === "Đang giao hàng" && (
        <div
          className="flex items-start gap-3 p-4 rounded-2xl"
          style={{ backgroundColor: "#EFF6FF", border: "1px solid #BFDBFE" }}
        >
          <Truck
            size={18}
            className="shrink-0 mt-0.5"
            style={{ color: "#1D4ED8" }}
          />
          <div>
            <p className="text-[13px] font-bold" style={{ color: "#1E40AF" }}>
              Đơn hàng đang được giao
            </p>
            <p className="text-[12px] mt-0.5" style={{ color: "#1D4ED8" }}>
              Khách hàng đang nhận sản phẩm. Vui lòng theo dõi để cập nhật trạng
              thái hoàn tất.
            </p>
          </div>
        </div>
      )}

      {o.status === "Chờ duyệt hủy" && o.cancelReason && (
        <div
          className="flex items-start gap-3 p-4 rounded-2xl"
          style={{ backgroundColor: "#FEF3C7", border: "1px solid #FDE68A" }}
        >
          <AlertTriangle
            size={18}
            className="shrink-0 mt-0.5"
            style={{ color: "#D97706" }}
          />
          <div>
            <p className="text-[13px] font-bold" style={{ color: "#92400E" }}>
              Yêu cầu hủy đơn hàng
            </p>
            <p className="text-[12px] mt-0.5" style={{ color: "#A16207" }}>
              Lý do: {o.cancelReason}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* LEFT COL */}
        <div className="lg:col-span-2 space-y-4">
          <CustomerInfoCard o={o} />

          <div
            className="rounded-2xl overflow-hidden"
            style={{
              backgroundColor: "var(--background)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
            <div
              className="px-5 py-3 flex items-center gap-2"
              style={{
                borderBottom: "1px solid var(--grid-border)",
                backgroundColor: "var(--grid-header-bg)",
              }}
            >
              <Package size={14} style={{ color: "var(--brand-primary)" }} />
              <span
                className="text-[12px] font-bold uppercase tracking-wider"
                style={{ color: "var(--text-main)" }}
              >
                Sản phẩm đặt mua ({o.products.length})
              </span>
            </div>

            <div
              className="divide-y"
              style={{ borderColor: "var(--grid-border)" }}
            >
              {o.products.map((p, i) => (
                <div
                  key={i}
                  className="px-5 py-4 flex flex-col md:flex-row items-start gap-4"
                >
                  <div className="flex-1 min-w-0 w-full space-y-3">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                        style={{
                          backgroundColor: "var(--bg-main)",
                          border: "1px solid var(--grid-border)",
                        }}
                      >
                        <Package
                          size={16}
                          style={{ color: "var(--text-secondary)" }}
                        />
                      </div>
                      <div>
                        <p
                          className="text-[14px] font-bold"
                          style={{ color: "var(--text-main)" }}
                        >
                          {p.name}
                        </p>
                        {p.note && (
                          <p
                            className="text-[12px] italic mt-0.5"
                            style={{ color: "var(--status-error)" }}
                          >
                            * {p.note}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2.5 bg-[#F9F9F9] p-3 rounded-xl border border-dashed border-gray-200">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-gray-400">
                          Chất liệu
                        </p>
                        <p className="text-[12px] font-semibold text-gray-700">
                          {p.material}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-gray-400">
                          Kích thước
                        </p>
                        <p className="text-[12px] font-semibold text-gray-700">
                          {p.size}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-gray-400">
                          Bảo hành
                        </p>
                        <p className="text-[12px] font-bold text-emerald-600 flex items-center gap-1">
                          <ShieldCheck size={12} />
                          {p.warranty || "—"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 w-full md:w-auto flex md:flex-col justify-between items-center md:items-end">
                    <div className="bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                      <span className="text-[11px] font-bold text-gray-500 uppercase">
                        SL:
                      </span>{" "}
                      <span className="text-[14px] font-bold text-gray-800">
                        {p.qty}
                      </span>
                    </div>
                    <div className="mt-2 text-right">
                      <p
                        className="text-[16px] font-bold"
                        style={{ color: "var(--text-main)" }}
                      >
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
                style={{
                  borderTop: "1px solid var(--grid-border)",
                  backgroundColor: "var(--grid-header-bg)",
                }}
              >
                <span
                  className="text-[12px] font-bold uppercase"
                  style={{ color: "var(--text-placeholder)" }}
                >
                  Tổng đơn hàng
                </span>
                <span
                  className="text-[16px] font-bold"
                  style={{ color: "var(--brand-primary)" }}
                >
                  {fmtCurrency(displayTotal)}
                </span>
              </div>
            )}
          </div>

          {/* LSX liên kết - READ ONLY */}
          {(o.type === "Hàng thô" || o.type === "Hàng đặt") &&
            o.status === "Đang sản xuất" && (
              <div
                className="rounded-2xl overflow-hidden mt-4"
                style={{
                  backgroundColor: "var(--background)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                }}
              >
                <div
                  className="px-5 py-3 flex items-center justify-between"
                  style={{
                    borderBottom: "1px solid var(--grid-border)",
                    backgroundColor: "var(--grid-header-bg)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Hammer
                      size={14}
                      style={{ color: "var(--brand-primary)" }}
                    />
                    <span
                      className="text-[12px] font-bold uppercase tracking-wider"
                      style={{ color: "var(--text-main)" }}
                    >
                      Tiến độ sản xuất
                    </span>
                  </div>
                </div>

                <div
                  className="divide-y"
                  style={{ borderColor: "var(--grid-border)" }}
                >
                  <div className="px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <span className="w-2 h-2 rounded-full bg-purple-600 shadow-[0_0_0_4px_#F5F3FF]" />
                      <div>
                        <p className="text-[13px] font-bold text-gray-800">
                          Lệnh sản xuất liên kết
                        </p>
                        <p className="text-[12px] text-gray-500 mt-0.5">
                          Sản phẩm đang được gia công tại xưởng...
                        </p>
                      </div>
                    </div>
                    <Badge
                      style={{
                        backgroundColor: "#F5F3FF",
                        color: "#7C3AED",
                        border: "1px solid #DDD6FE",
                      }}
                    >
                      ĐANG XỬ LÝ
                    </Badge>
                  </div>
                </div>
              </div>
            )}

          {o.sampleImages && o.sampleImages.length > 0 && (
            <MediaGallery images={o.sampleImages} />
          )}
        </div>

        {/* RIGHT COL */}
        <div className="space-y-4">
          {hasPricing && (
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                backgroundColor: "var(--background)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              }}
            >
              <div
                className="px-5 py-3 flex items-center gap-2"
                style={{
                  borderBottom: "1px solid var(--grid-border)",
                  backgroundColor: "var(--grid-header-bg)",
                }}
              >
                <CreditCard
                  size={14}
                  style={{ color: "var(--brand-primary)" }}
                />
                <span
                  className="text-[12px] font-bold uppercase tracking-wider"
                  style={{ color: "var(--text-main)" }}
                >
                  Thanh toán
                </span>
              </div>
              <div className="px-5 py-4 space-y-2.5">
                <div className="flex justify-between text-[13px]">
                  <span style={{ color: "var(--text-secondary)" }}>
                    Tổng tiền
                  </span>
                  <span
                    className="font-bold"
                    style={{ color: "var(--text-main)" }}
                  >
                    {fmtCurrency(displayTotal)}
                  </span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span style={{ color: "var(--text-secondary)" }}>
                    Đặt cọc
                  </span>
                  <span className="font-bold" style={{ color: "#15803D" }}>
                    {fmtCurrency(o.deposit || 0)}
                  </span>
                </div>
                <div
                  className="pt-2.5"
                  style={{ borderTop: "1px solid var(--grid-border)" }}
                >
                  <div className="flex justify-between text-[13px]">
                    <span
                      className="font-bold"
                      style={{ color: "var(--text-main)" }}
                    >
                      Còn lại
                    </span>
                    <span
                      className="font-bold"
                      style={{ color: remaining > 0 ? "#DC2626" : "#15803D" }}
                    >
                      {fmtCurrency(remaining)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div
            className="rounded-2xl overflow-hidden"
            style={{
              backgroundColor: "var(--background)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
            <div
              className="px-5 py-3 flex items-center gap-2"
              style={{
                borderBottom: "1px solid var(--grid-border)",
                backgroundColor: "var(--grid-header-bg)",
              }}
            >
              <Truck size={14} style={{ color: "var(--brand-primary)" }} />
              <span
                className="text-[12px] font-bold uppercase tracking-wider"
                style={{ color: "var(--text-main)" }}
              >
                Giao hàng
              </span>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div className="flex items-start gap-2.5">
                <MapPin
                  size={13}
                  className="mt-0.5 shrink-0"
                  style={{ color: "var(--text-placeholder)" }}
                />
                <div>
                  <p
                    className="text-[10px] uppercase tracking-wider font-bold"
                    style={{ color: "var(--text-placeholder)" }}
                  >
                    Địa chỉ giao
                  </p>
                  <p
                    className="text-[12px] font-semibold mt-0.5"
                    style={{ color: "var(--text-main)" }}
                  >
                    {o.customer.address}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Calendar
                  size={13}
                  className="mt-0.5 shrink-0"
                  style={{ color: "var(--text-placeholder)" }}
                />
                <div>
                  <p
                    className="text-[10px] uppercase tracking-wider font-bold"
                    style={{ color: "var(--text-placeholder)" }}
                  >
                    Ngày giao dự kiến
                  </p>
                  <p
                    className="text-[12px] font-semibold mt-0.5"
                    style={{ color: "var(--text-main)" }}
                  >
                    {fmtDate(o.deliveryDate)}
                  </p>
                </div>
              </div>
              {o.deliveryImage && (
                <div
                  className="flex items-start gap-2.5 pt-2"
                  style={{ borderTop: "1px solid var(--grid-border)" }}
                >
                  <Camera
                    size={13}
                    className="mt-0.5 shrink-0"
                    style={{ color: "var(--text-placeholder)" }}
                  />
                  <div>
                    <p
                      className="text-[10px] uppercase tracking-wider font-bold"
                      style={{ color: "var(--text-placeholder)" }}
                    >
                      Ảnh giao hàng
                    </p>
                    <img
                      src={o.deliveryImage}
                      alt="Ảnh giao hàng"
                      className="w-28 h-28 rounded-xl object-cover mt-1 border border-gray-200 shadow-sm"
                    />
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
export default function SalesOrderDetail() {
  const { id } = useParams();
  const printRef = useRef(null);

  // Cancel request modal
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelSuccess, setCancelSuccess] = useState(false);

  const handleCancelSubmit = () => {
    if (!cancelTarget || !cancelReason.trim()) return;
    // In a real app, you would update the order status via API
    setCancelSuccess(true);
    setTimeout(() => {
      setCancelTarget(null);
      setCancelReason("");
      setCancelSuccess(false);
    }, 1500);
  };

  // Fake data fallback logic based on ID
  const o = MOCK_ORDERS_DETAIL[id] || {
    ...MOCK_ORDERS_DETAIL["DH-S01"],
    code: id?.startsWith("DH") ? id : `DH-S-${id || "???"}`,
  };

  const ss = statusStyle(o.status);

  const displayTotal =
    o.total != null
      ? o.total
      : o.products.reduce((acc, p) => acc + (p.price || 0) * p.qty, 0);
  const hasPricing = o.total != null || o.products.some((p) => p.price != null);
  const remaining = hasPricing ? displayTotal - (o.deposit || 0) : null;

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const printWindow = window.open("", "_blank", "width=900,height=700");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Hóa đơn ${o.code}</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body { margin: 0; padding: 0; }
        </style>
      </head>
      <body>${content.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 300);
  };

  return (
    <>
      <PageHelmet title={`${o.code} | Chi tiết đơn hàng`} />

      <div
        className="flex flex-col h-full -m-6"
        style={{ backgroundColor: "var(--bg-main)" }}
      >
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
            <div className="flex items-center gap-3">
              <Link
                to="/sales/dashboard/orders"
                className="w-8 h-8 rounded-xl flex items-center justify-center transition hover:opacity-70"
                style={{
                  color: "var(--text-secondary)",
                  border: "1px solid var(--grid-border)",
                }}
              >
                <ArrowLeft size={15} />
              </Link>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1
                    className="text-[16px] font-black tracking-tight"
                    style={{ color: "var(--text-main)" }}
                  >
                    ĐƠN HÀNG {o.code}
                  </h1>
                  <Badge
                    style={{
                      backgroundColor: ss.bg,
                      color: ss.text,
                      border: `1px solid ${ss.border}`,
                    }}
                  >
                    {o.status.toUpperCase()}
                  </Badge>
                </div>
                <p
                  className="text-[11px] font-bold mt-0.5"
                  style={{ color: "var(--text-placeholder)" }}
                >
                  Loại: <span className="text-blue-600">{o.type}</span> • Ngày
                  tạo: {fmtDateTime(o.date)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 h-9 px-4 rounded-xl bg-white border border-gray-200 text-gray-700 text-[12px] font-black hover:bg-gray-50 transition-all shadow-sm"
              >
                <Printer size={15} /> IN HÓA ĐƠN
              </button>

              {/* Request Cancel Button - Conditional */}
              {(["Chờ xử lý", "Đang sản xuất", "Chờ giao hàng"].includes(
                o.status,
              ) ||
                (o.status === "Hoàn thành" &&
                  (o.type === "Hàng sẵn" || o.type === "Hàng thô" || o.type === "Hàng mộc") &&
                  o.fulfillmentType === "Lấy tại cửa hàng")) && (
                <button
                  onClick={() => {
                    setCancelTarget(o);
                    setCancelReason("");
                    setCancelSuccess(false);
                  }}
                  className="flex items-center gap-2 h-9 px-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[12px] font-black hover:bg-red-100 transition-all"
                >
                  <AlertTriangle size={15} /> GỬI YÊU CẦU HỦY
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ╔══════════ MAIN CONTENT ══════════╗ */}
        <StandardOrderView
          o={o}
          displayTotal={displayTotal}
          hasPricing={hasPricing}
          remaining={remaining}
        />
      </div>

      {/* ════════════ MODAL: GỬI YÊU CẦU HỦY ════════════ */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col"
            style={{ border: "1px solid var(--grid-border)" }}
          >
            {cancelSuccess ? (
              <div className="p-8 flex flex-col items-center text-center gap-3">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: "var(--status-focus)" }}
                >
                  <CheckCircle
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
                  trạng thái "Chờ duyệt hủy".
                </p>
              </div>
            ) : (
              <>
                <div
                  className="px-6 py-4 flex items-center justify-between"
                  style={{ borderBottom: "1px solid var(--grid-border)" }}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: "#FEF2F2" }}
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
                        {cancelTarget.code}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 flex flex-col gap-4">
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

                <div
                  className="px-6 py-4 flex justify-end gap-3"
                  style={{
                    borderTop: "1px solid var(--grid-border)",
                    background: "var(--grid-header-bg)",
                  }}
                >
                  <button
                    onClick={() => setCancelTarget(null)}
                    className="px-4 py-2 rounded-lg text-[13px] font-semibold transition hover:bg-gray-100 cursor-pointer border"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    onClick={handleCancelSubmit}
                    disabled={!cancelReason.trim()}
                    className="px-4 py-2 rounded-lg text-[13px] font-semibold text-white bg-red-600 disabled:opacity-40"
                  >
                    Gửi yêu cầu hủy
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Hidden container for printing */}
      <div style={{ display: "none" }}>
        <div ref={printRef}>
          <PrintableInvoice o={o} displayTotal={displayTotal} />
        </div>
      </div>
    </>
  );
}
