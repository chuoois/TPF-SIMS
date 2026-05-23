/**
 * ViewProductModal – Xem Chi Tiết Sản Phẩm trong Kho (Read-Only)
 * Tab 1: Thông tin chung
 * Tab 2: Chi tiết từng đơn vị sản phẩm (nhóm theo phiếu nhập)
 *
 * Updated: 02/04/2026 – Bỏ khái niệm lô, hiển thị đơn vị theo phiếu nhập
 */

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Package,
  Tag,
  Layers,
  Palette,
  Ruler,
  BarChart2,
  CheckCircle,
  Hammer,
  Users,
  Image as ImageIcon,
  TrendingDown,
  ArrowDownToLine,
  Boxes,
  CalendarDays,
  ClipboardList,
  StickyNote,
  Info,
  ChevronDown,
  Hash,
  AlertTriangle,
  MapPin,
  ShieldCheck,
  Gift,
  StickyNote as NoteIcon,
} from "lucide-react";
import ProcessDefectiveModal from "./ProcessDefectiveModal";
import { toast } from "react-hot-toast";
import inventoryService from "@/services/inventory.service";

// ─────────────────────────────────────────────────────────
// Cấu hình trạng thái đơn vị hàng
// ─────────────────────────────────────────────────────────
const UNIT_STATUS_CONFIG = {
  AVAILABLE: {
    label: "Sẵn sàng",
    color: "#15803D",
    bg: "#F0FDF4",
    border: "#BBF7D0",
  },
  PROCESSING: {
    label: "Đang gia công",
    color: "#7C3AED",
    bg: "#F5F3FF",
    border: "#DDD6FE",
  },
  PENDING_DELIVERY: {
    label: "Chờ giao",
    color: "#1D4ED8",
    bg: "#EFF6FF",
    border: "#BFDBFE",
  },
  DEFECTIVE: {
    label: "Hàng lỗi",
    color: "#DC2626",
    bg: "#FEF2F2",
    border: "#FECACA",
  },
};

// Các trạng thái đang ở trong kho (hiển thị)
const IN_STOCK_STATUSES = [
  "AVAILABLE",
  "PROCESSING",
  "PENDING_DELIVERY",
  // "DEFECTIVE",
];

// ── Helpers ──────────────────────────────────────────────
const fmtCurrency = (n) =>
  n != null && n !== "" ? new Intl.NumberFormat("vi-VN").format(n) + "₫" : "—";

const fmtDate = (s) => {
  if (!s) return "—";
  const d = new Date(s);
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const fmtMillions = (n) => {
  if (!n) return "—";
  return (
    (n / 1_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 1 }) +
    " triệu ₫"
  );
};

const TYPE_CONFIG = {
  FINISHED: {
    label: "Hàng có sẵn",
    icon: CheckCircle,
    bg: "#F0FDF4",
    text: "#15803D",
    border: "#BBF7D0",
    headerBg: "linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)",
  },
  RAW: {
    label: "Hàng mộc",
    icon: Hammer,
    bg: "#FFF7ED",
    text: "#C2410C",
    border: "#FED7AA",
    headerBg: "linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)",
  },
  CUSTOM: {
    label: "Hàng khách đặt",
    icon: Users,
    bg: "#EFF6FF",
    text: "#1D4ED8",
    border: "#BFDBFE",
    headerBg: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)",
  },
};

// ── InfoRow ───────────────────────────────────────────────
const InfoRow = ({ icon: Icon, label, value, valueStyle }) => (
  <div
    className="flex items-start gap-3 py-2.5 border-b last:border-0"
    style={{ borderColor: "var(--grid-border)" }}
  >
    <div
      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
      style={{ backgroundColor: "var(--bg-main)" }}
    >
      {Icon && <Icon size={14} style={{ color: "var(--text-placeholder)" }} />}
    </div>
    <div className="flex-1 min-w-0">
      <p
        className="text-[10px] font-bold uppercase tracking-widest mb-0.5"
        style={{ color: "var(--text-placeholder)" }}
      >
        {label}
      </p>
      <p
        className="text-[13px] font-semibold break-words"
        style={{ color: "var(--text-main)", ...valueStyle }}
      >
        {value != null && value !== "" ? value : "—"}
      </p>
    </div>
  </div>
);

// ── Bundle Items Table ──────────────────────────────────────
function BundleItemsTable({ items }) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: "2px solid #7C3AED", margin: "0 24px" }}
    >
      <div className="px-4 py-2.5" style={{ backgroundColor: "#F5F3FF" }}>
        <p
          className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5"
          style={{ color: "#7C3AED" }}
        >
          <Layers size={12} /> Các món lẻ trong bộ
        </p>
      </div>
      <table className="w-full" style={{ backgroundColor: "#FAFAFE" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #EDE9FE" }}>
            <th
              className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-wider w-8"
              style={{ color: "#7C3AED" }}
            >
              #
            </th>
            <th
              className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-wider"
              style={{ color: "#7C3AED" }}
            >
              Tên món
            </th>
            <th
              className="px-3 py-2 text-center text-[10px] font-bold uppercase tracking-wider w-20"
              style={{ color: "#7C3AED" }}
            >
              SL
            </th>
            <th
              className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider"
              style={{ color: "#7C3AED" }}
            >
              Ghi chú
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr
              key={item._id || idx}
              style={{ borderBottom: "1px solid #F3F0FF" }}
            >
              <td
                className="px-4 py-2.5 text-[12px] font-semibold"
                style={{ color: "#7C3AED" }}
              >
                {idx + 1}
              </td>
              <td
                className="px-4 py-2.5 text-[13px] font-semibold"
                style={{ color: "var(--text-main)" }}
              >
                {item.name}
              </td>
              <td className="px-3 py-2.5 text-center">
                <span
                  className="text-[12px] font-bold px-2 py-0.5 rounded-lg"
                  style={{ backgroundColor: "#EDE9FE", color: "#7C3AED" }}
                >
                  x{item.qty}
                </span>
              </td>
              <td
                className="px-3 py-2.5 text-[12px] italic"
                style={{
                  color: item.productNote
                    ? "var(--text-secondary)"
                    : "var(--text-placeholder)",
                }}
              >
                {item.productNote || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}




// ── Status Options ─────────────────────────────────────────
const STATUS_OPTIONS = [
  { key: "AVAILABLE",        ...UNIT_STATUS_CONFIG.AVAILABLE },
  { key: "PROCESSING",       ...UNIT_STATUS_CONFIG.PROCESSING },
  { key: "PENDING_DELIVERY", ...UNIT_STATUS_CONFIG.PENDING_DELIVERY },
  { key: "DEFECTIVE",        ...UNIT_STATUS_CONFIG.DEFECTIVE },
];

// ── Status Dropdown – dùng Portal để tránh bị clip bởi overflow ──
function StatusDropdown({ unit, onChangeStatus, updatingSerial }) {
  const [open, setOpen] = useState(false);
  const [dropPos, setDropPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);
  const isUpdating = updatingSerial === unit.unitId;
  const dropId = `status-drop-${unit.unitId}`;

  // Đóng dropdown khi click ngoài (cả button lẫn portal)
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      const dropEl = document.getElementById(dropId);
      const clickedInsideBtn = btnRef.current && btnRef.current.contains(e.target);
      const clickedInsideDrop = dropEl && dropEl.contains(e.target);
      if (!clickedInsideBtn && !clickedInsideDrop) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, dropId]);

  // Tính vị trí button khi mở dropdown
  const handleToggle = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setDropPos({ top: r.bottom + 6, left: r.left });
    }
    setOpen((v) => !v);
  };

  const cfg = UNIT_STATUS_CONFIG[unit.status] || UNIT_STATUS_CONFIG.AVAILABLE;

  // Spinner khi đang gọi API
  if (isUpdating) {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold"
        style={{ backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
      >
        <span
          className="w-3 h-3 border-2 rounded-full animate-spin shrink-0"
          style={{ borderColor: cfg.color, borderTopColor: "transparent" }}
        />
        Đang lưu...
      </span>
    );
  }

  return (
    <>
      {/* Badge có thể click */}
      <button
        ref={btnRef}
        onClick={handleToggle}
        title="Nhấn để thay đổi trạng thái"
        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer hover:opacity-75 transition-opacity select-none"
        style={{ backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
      >
        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: cfg.color }} />
        {cfg.label}
        <ChevronDown
          size={9}
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.15s",
          }}
        />
      </button>

      {/* Dropdown dùng Portal – render ra document.body tránh bị overflow clip */}
      {open && createPortal(
        <div
          id={dropId}
          className="bg-white rounded-xl shadow-2xl overflow-hidden"
          style={{
            position: "fixed",
            top: dropPos.top,
            left: dropPos.left,
            zIndex: 9999,
            border: "1.5px solid #E5E7EB",
            minWidth: "170px",
          }}
        >
          {/* Header */}
          <div
            className="px-3 py-2 border-b"
            style={{ borderColor: "#F3F4F6", backgroundColor: "#F9FAFB" }}
          >
            <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: "#9CA3AF" }}>
              Đổi trạng thái đơn vị
            </p>
          </div>

          {STATUS_OPTIONS.map(({ key, label, color, bg, border }) => {
            const isCurrent = key === unit.status;
            return (
              <button
                key={key}
                onClick={() => {
                  if (!isCurrent) onChangeStatus(unit.lotId, unit.unitId, key);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-[11px] font-bold text-left transition-colors"
                style={{
                  backgroundColor: isCurrent ? bg : "white",
                  color: color,
                  borderBottom: "1px solid #F9FAFB",
                  cursor: isCurrent ? "default" : "pointer",
                }}
                onMouseEnter={(e) => { if (!isCurrent) e.currentTarget.style.backgroundColor = bg; }}
                onMouseLeave={(e) => { if (!isCurrent) e.currentTarget.style.backgroundColor = "white"; }}
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                {label}
                {isCurrent && (
                  <span className="ml-auto text-[9px] font-black" style={{ color }}>✓ Hiện tại</span>
                )}
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </>
  );
}

// ── Receipt Group Card ─────────────────────────────────────

function ReceiptGroupCard({ receiptId, units, index, onChangeStatus, updatingSerial }) {
  const [collapsed, setCollapsed] = useState(false);

  // Chỉ hiển thị các đơn vị còn trong kho (bỏ SOLD)
  const visibleUnits = units.filter((u) =>
    IN_STOCK_STATUSES.includes(u.status),
  );

  // Tính stats (chỉ các đơn vị còn trong kho)
  const stats = { available: 0, processing: 0, delivering: 0, defective: 0 };
  visibleUnits.forEach((u) => {
    if (u.status === "AVAILABLE") stats.available++;
    else if (u.status === "PROCESSING") stats.processing++;
    else if (u.status === "PENDING_DELIVERY") stats.delivering++;
    else if (u.status === "DEFECTIVE") stats.defective++;
  });

  if (visibleUnits.length === 0) return null; // Không hiển thị nếu tất cả đã bán

  // Lấy thông tin chung từ unit đầu tiên
  const firstUnit = visibleUnits[0] || units[0] || {};
  const importDate = firstUnit.importDate;
  const importPrice = firstUnit.importPrice;

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: "1.5px solid var(--grid-border)" }}
    >
      {/* Header */}
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 transition cursor-pointer hover:opacity-90"
        style={{ backgroundColor: "#F8F7FF" }}
      >
        <div className="flex items-center gap-3 flex-wrap">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-black"
            style={{ backgroundColor: "#7C3AED", color: "#fff" }}
          >
            <ClipboardList size={11} /> Phiếu #{index + 1}
          </span>
          <span
            className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md"
            style={{
              backgroundColor: "#EDE9FE",
              color: "#5B21B6",
              border: "1px solid #DDD6FE",
            }}
          >
            {receiptId || "Không rõ phiếu"}
          </span>
          {importDate && (
            <span
              className="inline-flex items-center gap-1 text-[10px] font-semibold"
              style={{ color: "var(--text-secondary)" }}
            >
              <CalendarDays size={10} /> {fmtDate(importDate)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {importPrice != null && (
            <span
              className="text-[12px] font-black"
              style={{ color: "#C2410C" }}
            >
              {fmtMillions(importPrice)}/đvị
            </span>
          )}
          <span
            className="text-[11px] font-bold px-2 py-0.5 rounded-lg"
            style={{
              backgroundColor: "#F0FDF4",
              color: "#15803D",
              border: "1px solid #BBF7D0",
            }}
          >
            {visibleUnits.length} đvị trong kho
          </span>
          <ChevronDown
            size={14}
            style={{
              color: "#7C3AED",
              transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)",
              transition: "transform 0.2s",
            }}
          />
        </div>
      </button>

      {!collapsed && (
        <div className="pb-4" style={{ backgroundColor: "#FAFAFE" }}>
          {/* Mini stats bar */}
          <div
            className="flex flex-wrap gap-1.5 px-4 py-3 border-b"
            style={{ borderColor: "var(--grid-border)" }}
          >
            {[
              {
                key: "available",
                label: "Sẵn sàng",
                count: stats.available,
                ...UNIT_STATUS_CONFIG.AVAILABLE,
              },
              {
                key: "processing",
                label: "Đang gia công",
                count: stats.processing,
                ...UNIT_STATUS_CONFIG.PROCESSING,
              },
              {
                key: "delivering",
                label: "Chờ giao",
                count: stats.delivering,
                ...UNIT_STATUS_CONFIG.PENDING_DELIVERY,
              },
/* 
              {
                key: "defective",
                label: "Hàng lỗi",
                count: stats.defective,
                ...UNIT_STATUS_CONFIG.DEFECTIVE,
              },
*/
            ]
              .filter((s) => s.count > 0)
              .map((s) => (
                <span
                  key={s.key}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold"
                  style={{
                    backgroundColor: s.bg,
                    color: s.color,
                    border: `1px solid ${s.border}`,
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  {s.label}: {s.count}
                </span>
              ))}
          </div>

          {/* Bảng chi tiết từng đơn vị */}
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid var(--grid-border)",
                    backgroundColor: "#F3F0FF",
                  }}
                >
                  <th
                    className="px-4 py-2 text-left text-[9px] font-bold uppercase tracking-wider"
                    style={{ color: "#6D28D9" }}
                  >
                    <span className="flex items-center gap-1">
                      <Hash size={9} /> Mã định danh
                    </span>
                  </th>
                  <th
                    className="px-4 py-2 text-left text-[9px] font-bold uppercase tracking-wider"
                    style={{ color: "#6D28D9" }}
                  >
                    <span className="flex items-center gap-1">
                      <ArrowDownToLine size={9} /> Giá nhập
                    </span>
                  </th>
                  <th
                    className="px-4 py-2 text-left text-[9px] font-bold uppercase tracking-wider"
                    style={{ color: "#6D28D9" }}
                  >
                    <span className="flex items-center gap-1">
                      <CalendarDays size={9} /> Ngày nhập
                    </span>
                  </th>
                  <th
                    className="px-4 py-2 text-left text-[9px] font-bold uppercase tracking-wider"
                    style={{ color: "#6D28D9" }}
                  >
                    Trạng thái
                  </th>


                </tr>
              </thead>
              <tbody>

                {visibleUnits.map((unit, idx) => {
                  return (
                    <tr
                      key={unit.unitId}
                      style={{
                        borderBottom:
                          idx < visibleUnits.length - 1
                            ? "1px solid #F3F0FF"
                            : "none",
                        backgroundColor: idx % 2 === 0 ? "#FAFAFE" : "#fff",
                      }}
                    >
                      {/* Mã định danh */}
                      <td className="px-4 py-2.5">
                        <span
                          className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md"
                          style={{
                            backgroundColor: "#EDE9FE",
                            color: "#5B21B6",
                            border: "1px solid #DDD6FE",
                          }}
                        >
                          {unit.unitId}
                        </span>
                      </td>
                      {/* Giá nhập */}
                      <td className="px-4 py-2.5">
                        <span
                          className="text-[12px] font-black"
                          style={{ color: "#C2410C" }}
                        >
                          {unit.importPrice != null
                            ? fmtCurrency(unit.importPrice)
                            : importPrice != null
                              ? fmtCurrency(importPrice)
                              : "—"}
                        </span>
                      </td>
                      {/* Ngày nhập */}
                      <td className="px-4 py-2.5">
                        <span
                          className="text-[12px]"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {fmtDate(unit.importDate || importDate)}
                        </span>
                      </td>
                      {/* Trạng thái – có thể chỉnh sửa */}
                      <td className="px-4 py-2.5">
                        <StatusDropdown
                          unit={unit}
                          onChangeStatus={onChangeStatus}
                          updatingSerial={updatingSerial}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tab 2: Unit Detail by Receipt ───────────────────────────
function UnitDetailTab({ product, lots, onChangeStatus, updatingSerial }) {
  // Chỉ lấy các unit còn trong kho
  const allUnits = [];
  (lots || []).forEach((lot) => {
    (lot.units || []).forEach((u) => {
      if (IN_STOCK_STATUSES.includes(u.status)) {
        allUnits.push({
          ...u,
          lotId: lot.lotId,
          importDate: u.importDate || lot.importDate,
          importPrice: u.importPrice != null ? u.importPrice : lot.importPrice,
          importReceiptId: u.importReceiptId || lot.importReceiptId,
        });
      }
    });
  });

  if (allUnits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{
            backgroundColor: "var(--bg-main)",
            border: "2px dashed var(--grid-border)",
          }}
        >
          <Boxes
            size={24}
            style={{ color: "var(--text-placeholder)" }}
            strokeWidth={1.5}
          />
        </div>
        <p
          className="text-[13px] font-medium"
          style={{ color: "var(--text-placeholder)" }}
        >
          Chưa có dữ liệu đơn vị sản phẩm
        </p>
        <p
          className="text-[11px] text-center"
          style={{ color: "var(--text-placeholder)" }}
        >
          Tạo phiếu nhập kho để theo dõi từng đơn vị hàng
        </p>
      </div>
    );
  }

  // Nhóm theo importReceiptId
  const grouped = {};
  allUnits.forEach((u) => {
    const key = u.importReceiptId || "__NO_RECEIPT__";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(u);
  });
  const receiptGroups = Object.entries(grouped);

  // Tổng kết (allUnits đã lọc chỉ còn trong kho)
  const totalUnits = allUnits.length;
  const totalAvailable = allUnits.filter(
    (u) => u.status === "AVAILABLE",
  ).length;
  const uniqueReceipts = receiptGroups.length;
  // Kiểm tra nhiều giá
  const prices = [
    ...new Set(allUnits.map((u) => u.importPrice).filter((p) => p != null)),
  ];
  const hasMultiplePrices = prices.length > 1;

  return (
    <div className="px-5 py-4 space-y-4">
      {/* Tóm tắt tổng quan */}
      <div
        className="rounded-xl p-4"
        style={{ backgroundColor: "#F5F3FF", border: "1.5px solid #DDD6FE" }}
      >
        <p
          className="text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-1.5"
          style={{ color: "#7C3AED" }}
        >
          <Boxes size={11} /> Tổng quan đơn vị sản phẩm
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="flex flex-col gap-0.5">
            <span
              className="text-[9px] font-bold uppercase tracking-widest"
              style={{ color: "#6D28D9" }}
            >
              Số phiếu nhập
            </span>
            <span
              className="text-[20px] font-black"
              style={{ color: "#7C3AED" }}
            >
              {uniqueReceipts}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span
              className="text-[9px] font-bold uppercase tracking-widest"
              style={{ color: "#6D28D9" }}
            >
              Tổng đơn vị
            </span>
            <span
              className="text-[20px] font-black"
              style={{ color: "#7C3AED" }}
            >
              {totalUnits}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span
              className="text-[9px] font-bold uppercase tracking-widest"
              style={{ color: "#6D28D9" }}
            >
              Sẵn sàng bán
            </span>
            <span
              className="text-[20px] font-black"
              style={{ color: "#15803D" }}
            >
              {totalAvailable}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span
              className="text-[9px] font-bold uppercase tracking-widest"
              style={{ color: "#6D28D9" }}
            >
              Giá nhập
            </span>
            {hasMultiplePrices ? (
              <div>
                <span
                  className="text-[11px] font-black"
                  style={{ color: "#C2410C" }}
                >
                  {(Math.min(...prices) / 1_000_000).toFixed(0)}tr –{" "}
                  {(Math.max(...prices) / 1_000_000).toFixed(0)}tr ₫
                </span>
                <span className="block text-[9px]" style={{ color: "#6D28D9" }}>
                  (nhiều mức giá)
                </span>
              </div>
            ) : prices.length === 1 ? (
              <span
                className="text-[13px] font-black"
                style={{ color: "#C2410C" }}
              >
                {fmtMillions(prices[0])}
              </span>
            ) : (
              <span
                className="text-[13px]"
                style={{ color: "var(--text-placeholder)" }}
              >
                —
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Cảnh báo nếu nhiều giá nhập */}
      {hasMultiplePrices && (
        <div
          className="rounded-xl px-4 py-3 flex items-start gap-2.5"
          style={{ backgroundColor: "#FFFBEB", border: "1px solid #FDE68A" }}
        >
          <span className="text-base shrink-0">⚠️</span>
          <div>
            <p className="text-[11px] font-bold" style={{ color: "#92400E" }}>
              Sản phẩm này có đơn vị được nhập với nhiều mức giá khác nhau
            </p>
            <p className="text-[10px] mt-0.5" style={{ color: "#B45309" }}>
              Giá thấp nhất: {fmtCurrency(Math.min(...prices))} · Cao nhất:{" "}
              {fmtCurrency(Math.max(...prices))}
              &emsp;→ Cần lưu ý khi tính giá vốn và định giá bán
            </p>
          </div>
        </div>
      )}

      {/* Danh sách nhóm theo phiếu nhập */}
      <div className="space-y-3">
        {receiptGroups.map(([receiptId, units], idx) => (
          <ReceiptGroupCard
            key={receiptId}
            receiptId={receiptId === "__NO_RECEIPT__" ? null : receiptId}
            units={units}
            index={idx}
            onChangeStatus={onChangeStatus}
            updatingSerial={updatingSerial}
          />
        ))}
      </div>

      {/* Bảng tổng kết theo phiếu nhập */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: "1.5px solid var(--grid-border)" }}
      >
        <div
          className="px-4 py-2.5"
          style={{
            backgroundColor: "var(--bg-main)",
            borderBottom: "1px solid var(--grid-border)",
          }}
        >
          <p
            className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5"
            style={{ color: "var(--text-secondary)" }}
          >
            <StickyNote size={10} /> Bảng tổng kết theo phiếu nhập
          </p>
        </div>
        <table className="w-full bg-white text-[12px]">
          <thead>
            <tr
              style={{
                borderBottom: "1px solid var(--grid-border)",
                backgroundColor: "var(--grid-header-bg)",
              }}
            >
              <th
                className="px-4 py-2 text-left text-[9px] font-bold uppercase tracking-wider"
                style={{ color: "var(--text-placeholder)" }}
              >
                Phiếu nhập
              </th>
              <th
                className="px-4 py-2 text-left text-[9px] font-bold uppercase tracking-wider"
                style={{ color: "var(--text-placeholder)" }}
              >
                Ngày nhập
              </th>
              <th
                className="px-3 py-2 text-right text-[9px] font-bold uppercase tracking-wider"
                style={{ color: "var(--text-placeholder)" }}
              >
                Giá nhập
              </th>
              <th
                className="px-3 py-2 text-center text-[9px] font-bold uppercase tracking-wider"
                style={{ color: "var(--text-placeholder)" }}
              >
                Trong kho
              </th>
              <th
                className="px-3 py-2 text-right text-[9px] font-bold uppercase tracking-wider"
                style={{ color: "var(--text-placeholder)" }}
              >
                Giá trị tồn
              </th>
            </tr>
          </thead>
          <tbody>
            {receiptGroups.map(([receiptId, units], idx) => {
              const firstU = units[0] || {};
              const price = firstU.importPrice;
              const date = firstU.importDate;
              const inStockCount = units.filter((u) =>
                IN_STOCK_STATUSES.includes(u.status),
              ).length;
              const totalVal = price != null ? inStockCount * price : null;
              return (
                <tr
                  key={receiptId}
                  style={{ borderBottom: "1px solid var(--grid-border)" }}
                >
                  <td className="px-4 py-2.5">
                    <span
                      className="font-mono text-[10px] font-bold"
                      style={{ color: "#7C3AED" }}
                    >
                      {receiptId === "__NO_RECEIPT__" ? "—" : receiptId}
                    </span>
                  </td>
                  <td
                    className="px-4 py-2.5"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {fmtDate(date)}
                  </td>
                  <td
                    className="px-3 py-2.5 text-right font-semibold"
                    style={{ color: "#C2410C" }}
                  >
                    {price != null ? fmtCurrency(price) : "—"}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span
                      className="font-bold"
                      style={{
                        color:
                          inStockCount === 0 ? "#DC2626" : "var(--text-main)",
                      }}
                    >
                      {inStockCount}
                    </span>
                  </td>
                  <td
                    className="px-3 py-2.5 text-right font-black"
                    style={{
                      color:
                        totalVal != null && totalVal > 0
                          ? "#15803D"
                          : "var(--text-placeholder)",
                    }}
                  >
                    {totalVal != null && totalVal > 0
                      ? fmtCurrency(totalVal)
                      : "—"}
                  </td>
                </tr>
              );
            })}
            {/* Tổng row */}
            <tr style={{ backgroundColor: "#F5F3FF" }}>
              <td
                className="px-4 py-3 text-[11px] font-black uppercase"
                style={{ color: "#7C3AED" }}
                colSpan={2}
              >
                Tổng cộng
              </td>
              <td className="px-3 py-3" />
              <td
                className="px-3 py-3 text-center font-black text-[13px]"
                style={{ color: "var(--text-main)" }}
              >
                {allUnits.length}
              </td>
              <td
                className="px-3 py-3 text-right font-black text-[14px]"
                style={{ color: "#7C3AED" }}
              >
                {fmtCurrency(
                  allUnits.reduce((sum, u) => sum + (u.importPrice || 0), 0),
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Tab 1: General Info ───────────────────────────────────
function GeneralInfoTab({ product }) {
  const isBundle =
    product.isBundle &&
    Array.isArray(product.items) &&
    product.items.length > 0;
  const dims = [product.length, product.width, product.height].filter(Boolean);

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Ảnh + Stats */}
      <div
        className="flex gap-0 border-b"
        style={{ borderColor: "var(--grid-border)" }}
      >
        <div
          className="w-40 shrink-0 flex items-center justify-center border-r p-4"
          style={{
            borderColor: "var(--grid-border)",
            backgroundColor: "var(--bg-main)",
          }}
        >
          {product.img ? (
            <img
              src={product.img}
              alt={product.name}
              className="w-28 h-28 rounded-xl object-cover shadow-sm"
              style={{ border: "1px solid var(--grid-border)" }}
            />
          ) : (
            <div
              className="w-28 h-28 rounded-xl flex flex-col items-center justify-center gap-2"
              style={{
                border: "2px dashed var(--grid-border)",
                color: "var(--text-placeholder)",
              }}
            >
              <ImageIcon size={28} strokeWidth={1.5} />
              <span className="text-[10px]">Chưa có ảnh</span>
            </div>
          )}
        </div>
        <div
          className="flex-1 flex flex-col divide-y"
          style={{ divideColor: "var(--grid-border)" }}
        >
          <div
            className="grid grid-cols-2 divide-x"
            style={{ borderColor: "var(--grid-border)" }}
          >
            {/* Tồn kho (Tổng) */}
            <div className="p-4 flex flex-col gap-1">
              <span
                className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1"
                style={{ color: "var(--text-placeholder)" }}
              >
                <BarChart2 size={10} /> Tổng tồn kho
              </span>
              <span
                className="text-[26px] font-black leading-none"
                style={{
                  color:
                    product.stock === 0
                      ? "#DC2626"
                      : product.stock <= 3
                        ? "#D97706"
                        : "#15803D",
                }}
              >
                {product.stock ?? 0}
              </span>
              <span
                className="text-[11px]"
                style={{ color: "var(--text-secondary)" }}
              >
                {product.stock === 0
                  ? "Hết hàng"
                  : product.stock <= 3
                    ? "Sắp hết"
                    : "Tổng trong kho"}
                {isBundle ? " bộ" : ""}
              </span>
            </div>

            {/* Số lô */}
            <div className="p-4 flex flex-col gap-1">
              <span
                className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1"
                style={{ color: "var(--text-placeholder)" }}
              >
                <Boxes size={10} /> Số đơn vị
              </span>
              <span
                className="text-[26px] font-black leading-none"
                style={{ color: "#7C3AED" }}
              >
                {product.lots?.reduce(
                  (s, l) => s + (l.units?.length || 0),
                  0,
                ) ?? 0}
              </span>
              <span
                className="text-[11px]"
                style={{ color: "var(--text-secondary)" }}
              >
                đơn vị đã nhập kho
              </span>
            </div>
          </div>

          {/* Tồn min */}
          <div className="p-3 flex items-center gap-3">
            <TrendingDown
              size={14}
              style={{ color: "var(--text-placeholder)" }}
            />
            <div>
              <p
                className="text-[10px] font-bold uppercase tracking-widest"
                style={{ color: "var(--text-placeholder)" }}
              >
                Tồn tối thiểu
              </p>
              <p
                className="text-[15px] font-bold"
                style={{ color: "var(--text-main)" }}
              >
                {product.minStock ?? "—"}
              </p>
            </div>
          </div>

          {/* Breakdown */}
          {product.stockBreakdown && (
            <div
              className="p-4 border-t"
              style={{
                borderColor: "var(--grid-border)",
                backgroundColor: "#FAFAFA",
              }}
            >
              <p
                className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 mb-3"
                style={{ color: "var(--text-secondary)" }}
              >
                <Layers size={11} />
                Chi tiết tình trạng hàng trong kho
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  {
                    key: "available",
                    label: "Sẵn sàng",
                    count: product.stockBreakdown.available,
                    ...UNIT_STATUS_CONFIG.AVAILABLE,
                  },
                  {
                    key: "processing",
                    label: "Đang gia công",
                    count: product.stockBreakdown.processing,
                    ...UNIT_STATUS_CONFIG.PROCESSING,
                  },
                  {
                    key: "delivering",
                    label: "Chờ giao",
                    count: product.stockBreakdown.delivering,
                    ...UNIT_STATUS_CONFIG.PENDING_DELIVERY,
                  },
                  {
                    key: "defective",
                    label: "Hàng lỗi",
                    count: product.stockBreakdown.defective,
                    ...UNIT_STATUS_CONFIG.DEFECTIVE,
                  },
                ]
                  .filter((s) => (s.count || 0) > 0)
                  .map((s) => (
                    <div
                      key={s.key}
                      className="flex flex-col items-center justify-center px-3 py-2 rounded-lg min-w-[62px]"
                      style={{
                        backgroundColor: s.bg,
                        border: `1px solid ${s.border}`,
                      }}
                    >
                      <span
                        className="text-[18px] font-black leading-none"
                        style={{ color: s.color }}
                      >
                        {s.count}
                      </span>
                      <span
                        className="text-[9px] font-bold uppercase mt-1 text-center leading-tight"
                        style={{ color: s.color }}
                      >
                        {s.label}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bundle Items */}
      {isBundle && (
        <div className="py-4">
          <BundleItemsTable items={product.items} />
        </div>
      )}

      {/* Chi tiết */}
      <div className="px-6 py-2">
        <InfoRow icon={Layers} label="Danh mục" value={product.category} />
        <InfoRow icon={MapPin} label="Phòng / Không gian" value={product.room} />
        <InfoRow icon={Tag} label="Chất liệu" value={product.materialType} />
        <InfoRow icon={Palette} label="Màu sắc" value={product.color} />
        {dims.length > 0 && (
          <InfoRow
            icon={Ruler}
            label={`Kích thước (Dài × Rộng × Cao) – ${product.sizeUnit || "cm"}`}
            value={`${dims.join(" × ")} ${product.sizeUnit || "cm"}`}
          />
        )}
        {product.sizeNote && (
          <InfoRow icon={NoteIcon} label="Ghi chú kích thước" value={product.sizeNote} />
        )}
        {product.warrantyMonths != null && (
          <InfoRow
            icon={ShieldCheck}
            label="Bảo hành"
            value={`${product.warrantyMonths} tháng`}
            valueStyle={{ color: "#1D4ED8" }}
          />
        )}
        {product.isGift && (
          <InfoRow
            icon={Gift}
            label="Loại sản phẩm"
            value="Quà tặng"
            valueStyle={{ color: "#7C3AED" }}
          />
        )}
        {product.details && (
          <div
            className="py-2.5 border-b"
            style={{ borderColor: "var(--grid-border)" }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: "var(--bg-main)" }}
              >
                <Package
                  size={14}
                  style={{ color: "var(--text-placeholder)" }}
                />
              </div>
              <p
                className="text-[10px] font-bold uppercase tracking-widest"
                style={{ color: "var(--text-placeholder)" }}
              >
                Chi tiết sản phẩm
              </p>
            </div>
            <p
              className="text-[13px] leading-relaxed ml-10 italic rounded-lg px-3 py-2"
              style={{
                color: "var(--text-secondary)",
                backgroundColor: "var(--bg-main)",
                border: "1px solid var(--grid-border)",
              }}
            >
              {product.details}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
export default function ViewProductModal({ product, onClose, onRefreshInventory }) {
  const [activeTab, setActiveTab] = useState("info");
  const [lots, setLots] = useState(() =>
    product?.lots ? JSON.parse(JSON.stringify(product.lots)) : [],
  );
  const [isLoadingLots, setIsLoadingLots] = useState(false);
  const [isProcessingDefective, setIsProcessingDefective] = useState(false);
  const [updatingSerial, setUpdatingSerial] = useState(null); // serial đang được update

  useEffect(() => {
    if (product && !product.lots) {
      setIsLoadingLots(true);
      inventoryService.getProductItems(product.id)
        .then(res => {
          setLots(res || []);
        })
        .catch(err => {
          console.error("Lỗi khi tải chi tiết đơn vị hàng:", err);
          toast.error("Không thể tải thông tin đơn vị hàng!");
        })
        .finally(() => setIsLoadingLots(false));
    }
  }, [product]);

  if (!product) return null;

  const cfg = TYPE_CONFIG[product.type] || TYPE_CONFIG.FINISHED;
  const TypeIcon = cfg.icon;
  const isBundle =
    product.isBundle &&
    Array.isArray(product.items) &&
    product.items.length > 0;

  const defectiveCount = lots.reduce((total, lot) => {
    return total + (lot.units ? lot.units.filter(u => u.status === "DEFECTIVE").length : 0);
  }, 0) + (product.units ? product.units.filter(u => u.status === "DEFECTIVE").length : 0) || (product.stockBreakdown?.defective || 0);

  const reloadLots = () => {
    setIsLoadingLots(true);
    inventoryService.getProductItems(product.id)
      .then(res => setLots(res || []))
      .catch(() => toast.error("Không thể tải lại danh sách đơn vị!"))
      .finally(() => setIsLoadingLots(false));
  };

  const handleProcessDefective = async (data) => {
    try {
      await inventoryService.processDefectiveItems(data);
      toast.success(`Đã xử lý ${data.unitIds.length} đơn vị hàng lỗi!`, { style: { fontSize: "14px" } });
      setIsProcessingDefective(false);
      reloadLots(); // reload lại danh sách đơn vị sau khi xử lý
      if (onRefreshInventory) onRefreshInventory(); // Refresh lại bảng tồn kho bên ngoài
    } catch (error) {
      toast.error("Xử lý thất bại, vui lòng thử lại!");
    }
  };

  // Cập nhật trạng thái đơn vị – gọi API thật
  const handleChangeUnitStatus = async (lotId, unitId, newStatus) => {
    setUpdatingSerial(unitId);
    try {
      await inventoryService.updateItemStatus(unitId, newStatus);
      setLots((prev) =>
        prev.map((lot) => {
          if (lot.lotId !== lotId) return lot;
          return {
            ...lot,
            units: lot.units.map((u) =>
              u.unitId === unitId ? { ...u, status: newStatus } : u,
            ),
          };
        }),
      );
      toast.success(
        newStatus === "DEFECTIVE" ? "Báo lỗi thành công!" : "Khôi phục trạng thái thành công!",
        { style: { fontSize: "14px" } }
      );
      if (onRefreshInventory) onRefreshInventory(); // Refresh lại bảng tồn kho bên ngoài
    } catch (error) {
      toast.error("Cập nhật thất bại! Vui lòng thử lại.");
    } finally {
      setUpdatingSerial(null);
    }
  };

  // Tính tổng units
  const allUnitCount = lots.reduce(
    (sum, lot) => sum + (lot.units?.length || 0),
    0,
  );

  const TABS = [
    { id: "info", label: "Thông tin chung", icon: Info },
    {
      id: "units",
      label: `Chi tiết đơn vị${allUnitCount > 0 ? ` (${allUnitCount} đvị)` : ""}`,
      icon: Boxes,
      loading: isLoadingLots,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-300 relative overflow-hidden">
        {/* ── Gradient Header by Type ── */}
        <div
          className="px-6 py-5 shrink-0 relative"
          style={{ background: cfg.headerBg }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-black/5 cursor-pointer transition"
            style={{ color: cfg.text }}
          >
            <X size={18} />
          </button>

          {/* Badges */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold"
              style={{
                backgroundColor: cfg.bg,
                color: cfg.text,
                border: `1px solid ${cfg.border}`,
              }}
            >
              <TypeIcon size={12} />
              {cfg.label}
            </span>
            {isBundle && (
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold"
                style={{
                  backgroundColor: "#F5F3FF",
                  color: "#7C3AED",
                  border: "1px solid #DDD6FE",
                }}
              >
                <Layers size={12} /> Bộ sản phẩm · {product.items.length} món
              </span>
            )}
            <span
              className="text-[11px] font-mono font-bold px-2 py-1 rounded-lg bg-white/70"
              style={{ color: cfg.text }}
            >
              Mã sản phẩm: {product.sku || product.code}
            </span>
          </div>

          <h2
            className="text-[17px] font-black leading-snug pr-8"
            style={{ color: cfg.text }}
          >
            {product.name}
          </h2>
          {product.bundleCode && (
            <p
              className="text-[11px] font-mono mt-1 opacity-70"
              style={{ color: cfg.text }}
            >
              {product.bundleCode}
            </p>
          )}
        </div>

        {/* ── Tab Navigation ── */}
        <div
          className="flex border-b shrink-0"
          style={{ borderColor: "var(--grid-border)" }}
        >
          {TABS.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 px-5 py-3 text-[12px] font-bold transition-all cursor-pointer border-b-2 flex-1 justify-center"
                style={{
                  borderBottomColor: isActive
                    ? "var(--brand-primary)"
                    : "transparent",
                  color: isActive
                    ? "var(--brand-primary)"
                    : "var(--text-secondary)",
                  backgroundColor: isActive ? "#F5F3FF" : "transparent",
                }}
              >
                <TabIcon size={13} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "info" ? (
            <GeneralInfoTab
              product={{
                ...product,
                stockBreakdown: (() => {
                  if (!lots || lots.length === 0) return product.stockBreakdown;
                  const bd = {
                    available: 0,
                    processing: 0,
                    delivering: 0,
                    defective: 0,
                  };
                  lots.forEach((lot) =>
                    lot.units.forEach((u) => {
                      if (IN_STOCK_STATUSES.includes(u.status)) {
                        if (u.status === "AVAILABLE") bd.available++;
                        else if (u.status === "PROCESSING") bd.processing++;
                        else if (u.status === "PENDING_DELIVERY")
                          bd.delivering++;
                        else if (u.status === "DEFECTIVE") bd.defective++;
                      }
                    }),
                  );
                  return bd;
                })(),
                stock:
                  lots.length > 0
                    ? lots.reduce(
                        (s, l) =>
                          s +
                          l.units.filter((u) =>
                            IN_STOCK_STATUSES.includes(u.status),
                          ).length,
                        0,
                      )
                    : product.stock,
              }}
            />
          ) : (
            <UnitDetailTab product={product} lots={lots} onChangeStatus={handleChangeUnitStatus} updatingSerial={updatingSerial} />
          )}
        </div>

        {/* ── Footer ── */}
        <div
          className="px-6 py-4 border-t shrink-0 flex items-center justify-between"
          style={{
            borderColor: "var(--grid-border)",
            backgroundColor: "var(--bg-main)",
          }}
        >
          <p
            className="text-[11px]"
            style={{ color: "var(--text-placeholder)" }}
          >
            * Dữ liệu chỉ đơn vị còn trong kho – đơn vị đã bán không hiển thị
          </p>
          <div className="flex items-center gap-3">
            {defectiveCount > 0 && (
              <button
                onClick={() => setIsProcessingDefective(true)}
                className="h-10 px-5 rounded-xl text-[13px] font-bold text-white bg-red-600 hover:bg-red-700 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <AlertTriangle size={15} /> Xử lý hàng lỗi ({defectiveCount})
              </button>
            )}
            <button
              onClick={onClose}
              className="h-10 px-8 rounded-xl text-[13px] font-bold border cursor-pointer hover:bg-gray-50 transition"
              style={{
                borderColor: "var(--grid-border)",
                color: "var(--text-secondary)",
              }}
            >
              Đóng
            </button>
          </div>
        </div>
      </div>

      {isProcessingDefective && (
        <ProcessDefectiveModal
          product={{ ...product, lots }}
          onClose={() => setIsProcessingDefective(false)}
          onProcess={handleProcessDefective}
        />
      )}
    </div>
  );
}
