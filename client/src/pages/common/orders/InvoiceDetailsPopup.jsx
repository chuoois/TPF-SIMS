import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  X, Package, Calendar, User, Phone, MapPin,
  Clock, CheckCircle, CheckCircle2, AlertTriangle, Hammer,
  Camera, FileText, Ban, RefreshCw,
  Trash2, Lock,
  Paintbrush, RotateCcw, ChevronRight, Eye, AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";
import orderService from "@/services/order.service";
import { ORDER_CONFIG } from "@/constants/orderConfig";
import { formatShortDateVN, formatDateTimeVN, todayVN, addDaysVN, diffDays, isDateAfter } from "@/lib/dateUtils";
import ConfirmModal from "@/components/control/ConfirmModal";
import { uploadImage } from "@/services/cloudinary.service";


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

const addOneDayStr = (dateStr) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

const subOneDayStr = (dateStr) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
};

const fmtDateTime = (s) => {
  if (!s) return "—";
  const d = new Date(s);
  return `${d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} — ${d.toLocaleDateString("vi-VN")}`;
};

const parseItemSize = (s) => {
  if (!s) return "Chuẩn";
  if (typeof s === "object") return s;
  try {
    const p = JSON.parse(s);
    if (p && typeof p === "object") return p;
    return s;
  } catch (e) {
    return s;
  }
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
  return m[status] || { bg: "var(--bg-main)", text: "var(--text-secondary)", border: "var(--grid-border)" };
};

const CustomerInfoCard = ({ o }) => (
  <div
    className="rounded-lg overflow-hidden bg-[var(--bg-main)]/40 backdrop-blur-sm border border-[var(--grid-border)]"
  >
    <div
      className="px-5 py-4 flex items-center gap-4 border-b border-[var(--grid-border)]/10"
    >
      <div
        className="w-11 h-11 rounded-lg flex items-center justify-center text-[15px] font-bold shrink-0 bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] border border-[var(--brand-primary)]/10"
      >
        {(o.customer?.name || "K").charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-bold truncate text-[var(--text-main)]">{o.customer?.name || "Khách hàng"}</p>
        <div className="flex items-center gap-4 mt-0.5 flex-wrap">
          <span className="inline-flex items-center gap-1 text-[12px] text-[var(--text-secondary)]">
            <Phone size={11} className="text-[var(--text-placeholder)]" />
            {o.customer.phone}
          </span>
          <span className="inline-flex items-center gap-1 text-[12px] text-[var(--text-secondary)]">
            <MapPin size={11} className="text-[var(--text-placeholder)]" />
            {o.customer.address}
          </span>
        </div>
      </div>
    </div>

    <div className="px-5 py-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-placeholder)]">Mã đơn</p>
          <p className="text-[13px] font-semibold mt-0.5 text-[var(--text-main)]">{o.order_code}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-placeholder)]">Loại hàng</p>
          <p className="text-[13px] font-semibold mt-0.5 text-[var(--text-main)]">{o.type}</p>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-placeholder)]">Ngày tạo</p>
          <p className="text-[13px] font-semibold mt-0.5 text-[var(--text-main)]">{fmtDateTime(o.date)}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-placeholder)]">Ngày giao</p>
          <p className="text-[13px] font-semibold mt-0.5 text-[var(--text-main)]">{fmtDate(o.deliveryDate)}</p>
        </div>

      </div>
    </div>
  </div>
);

const HistoryCard = ({ o, className = "" }) => (
  <div
    className={`rounded-lg overflow-hidden bg-[var(--bg-main)]/40 backdrop-blur-sm border border-[var(--grid-border)] printer-hidden ${className}`}
  >
    <div
      className="px-5 py-3 flex items-center gap-2 border-b border-[var(--grid-border)]/10 bg-[var(--grid-header-bg)]/30"
    >
      <span className="text-[12px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Lịch sử đơn hàng</span>
    </div>
    <div className="px-5 py-5 space-y-6 relative ml-3 mt-2">
      <div className="absolute top-2 bottom-2 left-[-13px] w-0.5 bg-[var(--grid-border)]" />
      {o.histories?.map((t, idx) => (
        <div key={idx} className="relative pl-1">
          <div
            className={`absolute top-1 left-[-21px] w-4 h-4 rounded-full border-2 bg-[var(--background)] flex items-center justify-center z-10 transition-colors ${idx === 0 ? "border-[var(--brand-primary)] shadow-[0_0_8px_rgba(52,176,87,0.3)]" : "border-[var(--grid-border)]"
              }`}
          >
            {idx === 0 && <div className="w-1.5 h-1.5 rounded-full bg-[var(--brand-primary)]" />}
          </div>
          <div className="flex items-start justify-between min-w-0">
            <div className="min-w-0">
              <p className={`text-[13px] font-bold ${idx === 0 ? "text-[var(--text-main)]" : "text-[var(--text-placeholder)]"}`}>
                {t.action}
              </p>
              {t.note && t.note !== t.action && (
                <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">{t.note}</p>
              )}
            </div>
            <span className="text-[10px] font-bold text-[var(--text-placeholder)] shrink-0 ml-4">
              {fmtDateTime(t.createdate)}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
);
const StandardOrderView = ({
  o,
  productTotal,
  displayTotal,
  hasPricing,
  remaining,
  deliveryImage,
  onDeliveryImageChange,
  onPreview,
  lastActiveStatus,
  isStarted,
  isRefundBlocked,
  hasProduction,
  onInspect,
  onRedoRequest,
  productions = [],
  activeTab,
  setActiveTab
}) => {
  const isCancellable = o.status === "Chờ duyệt hủy";

  // Check if all items in production are actually finished
  const allProdItemsFinished = useMemo(() => {
    if (productions.length === 0) return true; // If no production orders, it's effectively finished or not started
    return productions.every(p => p.status === "Hoàn Thành");
  }, [productions]);

  const pendingKcsCount = useMemo(() => {
    return productions.filter(p => p.isPendingApproval || p.status === "Chờ nghiệm thu").length;
  }, [productions]);


  // Recommendation logic
  const recommendation = isStarted ? "THU CỌC" : "HOÀN CỌC";
  const recReason = isStarted
    ? `Hàng này đã ${lastActiveStatus} ${hasProduction ? `và có ${o.productionOrders.length} lệnh sản xuất` : ""}. Xưởng đã tốn chi phí nguyên liệu/nhân công.`
    : `Đơn chưa được triển khai sản xuất (đang ${lastActiveStatus}). Bạn có thể hoàn cọc 100%.`;

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      {/* ── 1. IDENTITY BAR ── */}
      <div className="bg-[var(--sidebar)] text-[var(--sidebar-foreground)] px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 sticky top-0 z-20 border-b border-[var(--sidebar-border)]">
        <div className="flex items-center gap-3 border-r border-[var(--sidebar-border)] pr-4">
          <div className="h-10 w-10 rounded-full bg-[var(--brand-primary)]/10 flex items-center justify-center border border-[var(--brand-primary)]/20">
            <User size={18} className="text-[var(--brand-primary)]" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black text-[var(--sidebar-foreground)]/50 uppercase tracking-widest">Khách hàng</p>
            <p className="text-[14px] font-black truncate">{o.customer.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 border-r border-[var(--sidebar-border)] pr-4">
          <div className="h-10 w-10 rounded-full bg-[var(--status-warning)]/10 flex items-center justify-center border border-[var(--status-warning)]/20">
            <Calendar size={18} className="text-[var(--status-pending)]" />
          </div>
          <div>
            <p className="text-[10px] font-black text-[var(--sidebar-foreground)]/50 uppercase tracking-widest">Ngày giao dự kiến</p>
            <p className="text-[13px] font-bold">
              {o.deliveryDate ? new Date(o.deliveryDate).toLocaleDateString("vi-VN") : "Chưa hẹn"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 border-r border-[var(--sidebar-border)] pr-4 relative">
          <div className={`h-10 w-10 rounded-full flex items-center justify-center border ${pendingKcsCount > 0 ? "bg-[var(--status-error)]/20 border-[var(--status-error)]/30" : "bg-[var(--status-success)]/20 border-[var(--status-success)]/30"}`}>
            {pendingKcsCount > 0 ? (
              <AlertCircle size={18} className="text-[var(--status-error)] animate-pulse" />
            ) : (
              <CheckCircle size={18} className="text-[var(--status-success)]" />
            )}
          </div>
          <div>
            <p className="text-[10px] font-black text-[var(--sidebar-foreground)]/50 uppercase tracking-widest">Trạng thái</p>
            <p className={`text-[13px] font-bold uppercase tracking-tighter flex items-center gap-1.5 ${pendingKcsCount > 0 ? "text-[var(--status-error)]" : "text-[var(--status-success)]"}`}>
              {o.status}
              {pendingKcsCount > 0 && (
                <span className="relative flex h-2.5 w-2.5 mt-0.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--status-error)] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--status-error)]"></span>
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-[var(--status-error)]/10 flex items-center justify-center border border-[var(--status-error)]/20">
            <Lock size={18} className="text-[var(--status-error)]" />
          </div>
          <div>
            <p className="text-[10px] font-black text-[var(--sidebar-foreground)]/50 uppercase tracking-widest">Công nợ</p>
            <p className="text-[14px] font-black text-[var(--status-error)]">{fmtCurrency(remaining)}</p>
          </div>
        </div>
      </div>

      {/* ── 2. TAB NAVIGATION ── */}
      <div className="bg-[var(--background)]/95 backdrop-blur-md px-6 pt-4 border-b border-[var(--grid-border)]/50 flex items-center gap-6 sticky top-[72px] z-10">
        {[
          { id: "info", label: "Tổng quan", icon: FileText },
          { id: "products", label: `Sản phẩm`, icon: Package },
          { id: "production", label: "Tiến độ", icon: Hammer, visible: o.status === "Đang gia công" || productions.length > 0 },
        ].map(tab => {
          if (tab.visible === false) return null;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 flex items-center gap-2 text-[13px] font-black transition-all relative ${active ? "text-[var(--brand-primary)]" : "text-[var(--text-placeholder)] hover:text-[var(--text-secondary)]"
                }`}
            >
              <tab.icon size={14} />
              {tab.label}
              {active && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--brand-primary)] rounded-full" />}
            </button>
          );
        })}
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* PRIMARY CONTENT (2/3) */}
          <div className="lg:col-span-2 space-y-6 lg:border-r lg:border-[var(--grid-border)] lg:pr-6">
            {activeTab === "info" && (
              <div className="space-y-6">
                <CustomerInfoCard o={o} />

                {o.customRequirements && (
                  <div className="bg-[var(--status-warning)]/5 p-5 rounded-xl border border-[var(--status-warning)]/10 space-y-2">
                    <div className="flex items-center gap-2 text-[var(--status-pending)]">
                      <FileText size={16} />
                      <span className="text-[12px] font-black uppercase tracking-tight">Ghi chú đơn hàng</span>
                    </div>
                    <p className="text-[14px] text-[var(--text-main)] italic opacity-80 leading-relaxed">
                      "{o.customRequirements || "Khách yêu cầu làm kỹ phần đục chạm, đánh nhám kỹ trước khi lót. Chân quỳ đặc."}"
                    </p>
                  </div>
                )}

                {o.manufacturingOrders && o.manufacturingOrders.length > 0 && (
                  <div className="bg-[var(--brand-primary)]/5 p-5 rounded-xl border border-[var(--brand-primary)]/10 space-y-2">
                    <div className="flex items-center gap-2 text-[var(--brand-primary)]">
                      <Package size={16} />
                      <span className="text-[12px] font-black uppercase tracking-tight">Yêu cầu nhập hàng / Gia công</span>
                    </div>
                    <div className="flex flex-col gap-2.5">
                      {o.manufacturingOrders.map((mo, moIdx) => (
                        <div key={moIdx} className="flex items-center justify-between border-b border-dashed border-[var(--grid-border)]/30 pb-2 last:border-0 last:pb-0">
                          <div>
                            <p className="text-[14px] font-black text-[var(--text-main)]">
                              {mo.code}
                            </p>
                            <p className="text-[11px] text-[var(--text-secondary)]">
                              Tạo ngày {fmtDate(mo.date)}
                            </p>
                          </div>
                          <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded ${mo.status === 4 ? 'bg-[var(--status-success)]/10 text-[var(--status-success)]' :
                              mo.status === 0 ? 'bg-[var(--status-danger)]/10 text-[var(--status-danger)]' : 'bg-[var(--palette-orange)]/10 text-[var(--palette-orange)]'
                            }`}>
                            {mo.status === 4 ? 'Đã về kho' :
                              mo.status === 0 ? 'Đã hủy' : 'Chưa về kho'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="lg:hidden">
                  <HistoryCard o={o} />
                </div>
              </div>
            )}

            {activeTab === "products" && (
              <div className="space-y-6">
                {o.products.map((p, idx) => (
                  <div key={idx} className="bg-[var(--background)] rounded-xl overflow-hidden border border-[var(--grid-border)]/50 transition-all">
                    {/* Visual Comparison */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[var(--grid-border)]/20 border-b border-[var(--grid-border)]/50">
                      <div className="relative h-56 bg-[var(--background)] group cursor-pointer overflow-hidden" onClick={() => p.image && onPreview(p.image)}>
                        {p.image ? (
                          <img src={p.image} alt="Thực tế" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[var(--text-placeholder)]/20"><Package size={48} /></div>
                        )}
                        <div className="absolute top-4 left-4 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded border border-white/20">
                          <span className="text-[9px] font-black text-white uppercase tracking-widest">Thực tế xưởng</span>
                        </div>
                      </div>
                      <div className="relative h-56 bg-[var(--status-warning)]/5 overflow-hidden border-l border-[var(--grid-border)]">
                        {p.customerSampleImages && p.customerSampleImages.length > 0 ? (
                          <>
                            {/* Main preview = first image */}
                            <img
                              src={p.customerSampleImages[0]}
                              alt="Mẫu khách"
                              className="w-full h-full object-cover cursor-zoom-in transition-transform hover:scale-105"
                              onClick={() => onPreview(p.customerSampleImages[0])}
                            />
                            {/* Thumbnail strip at bottom when 2+ images */}
                            {p.customerSampleImages.length > 1 && (
                              <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 bg-gradient-to-t from-black/60 to-transparent flex items-end gap-1.5 z-10">
                                {p.customerSampleImages.map((img, imgIdx) => (
                                  <div
                                    key={imgIdx}
                                    className={`w-9 h-9 rounded border-2 overflow-hidden cursor-zoom-in shrink-0 transition-all hover:scale-110 ${imgIdx === 0 ? 'border-white/80 shadow-sm' : 'border-white/30 hover:border-white/70'}`}
                                    onClick={(e) => { e.stopPropagation(); onPreview(img); }}
                                  >
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[var(--status-warning)]/20"><Camera size={48} /></div>
                        )}
                        <div className="absolute top-4 right-4 px-2.5 py-1 bg-[var(--status-pending)]/80 backdrop-blur-md rounded border border-[var(--status-pending)]/30 z-10">
                          <span className="text-[9px] font-black text-white uppercase tracking-widest">Mẫu khách</span>
                        </div>
                      </div>
                    </div>
                    {/* Info */}
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <h4 className="text-[18px] font-black text-[var(--text-main)] leading-tight mb-2">{p.name}</h4>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-block px-2 py-0.5 rounded bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] text-[11px] font-black uppercase">x{p.qty} {p.unit}</span>
                            {p.manufacturingOrderCode && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] text-[10px] font-black uppercase tracking-wide border border-[var(--brand-primary)]/15">
                                <Package size={10} /> YCNH: {p.manufacturingOrderCode}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end ml-4">
                          <p className="text-[20px] font-black text-[var(--text-main)]">{fmtCurrency(p.price)}</p>
                          <div className="mt-2.5">
                            {o?.type !== "Hàng sẵn" && o?.type !== "Hàng mộc" && (
                              p.importStatus === 1 ? (
                                <span className="flex items-center gap-1.5 px-3 py-1.5 shadow-sm rounded-lg text-[11px] font-black bg-[var(--status-success)] text-white border border-[var(--status-success)]/30 uppercase tracking-wide">
                                  <CheckCircle size={14} /> Đã về kho
                                </span>
                              ) : (
                                <span className="flex items-center gap-1.5 px-3 py-1.5 shadow-sm rounded-lg text-[11px] font-black bg-[var(--palette-orange)] text-white border border-[var(--palette-orange)]/30 uppercase tracking-wide">
                                  <Clock size={14} /> Chưa về kho
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-[var(--bg-main)] rounded-xl">
                        {[
                          { label: "Chất liệu", val: p.material },
                          {
                            label: "Kích thước",
                            val: typeof p.size === 'object' && p.size !== null
                              ? `${p.size.length || 0}x${p.size.width || 0}x${p.size.height || 0}${p.size.unit ? ` ${p.size.unit}` : ''}`
                              : p.size
                          },
                          { label: "Màu sắc", val: p.color || p.finish },
                          { label: "Bảo hành", val: `${p.warranty || 12} Tháng` },
                        ].map((spec, i) => (
                          <div key={i} className="space-y-1">
                            <span className="text-[9px] font-black text-[var(--text-placeholder)] uppercase tracking-widest block">{spec.label}</span>
                            <p className="text-[12px] font-bold text-[var(--text-secondary)]">{spec.val || "—"}</p>
                          </div>
                        ))}
                      </div>

                      {(p.note || p.size?.note) && (
                        <div className="mt-4 p-3 bg-[var(--palette-orange)]/5 border border-[var(--palette-orange)]/10 rounded-lg">
                          <p className="text-[12px] text-[var(--palette-orange)] font-medium leading-relaxed">
                            <span className="opacity-60 mr-1.5 font-bold uppercase text-[10px] tracking-wider">Ghi chú sản phẩm:</span>
                            {p.note || p.size?.note}
                          </p>
                        </div>
                      )}

                      {p.isBundle && p.bundleItems && p.bundleItems.length > 0 && (
                        <div className="mt-6 border-t border-[var(--grid-border)]/30 pt-4">
                          <span className="text-[10px] font-black text-[var(--text-placeholder)] uppercase tracking-widest block mb-3">Thành phần bộ sản phẩm</span>
                          <div className="space-y-3">
                            {p.bundleItems.map((sub, sIdx) => (
                              <div key={sIdx} className="flex items-center gap-3 p-3 bg-white/50 rounded-lg border border-[var(--grid-border)]/20 hover:border-[var(--brand-primary)]/30 transition-colors">
                                <div className="w-8 h-8 rounded-md bg-[var(--brand-primary)]/5 flex items-center justify-center text-[var(--brand-primary)] text-[12px] font-black">
                                  {sIdx + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[13px] font-bold text-[var(--text-main)] truncate">{sub.name}</p>
                                  <div className="flex items-center gap-3 mt-0.5">
                                    <span className="text-[11px] text-[var(--text-secondary)] font-bold">x{sub.quantity || 1}</span>
                                    {sub.size && (
                                      <>
                                        <span className="text-[11px] text-[var(--text-placeholder)]">|</span>
                                        <span className="text-[11px] text-[var(--text-secondary)]">
                                          {typeof sub.size === 'object' && sub.size !== null
                                            ? `${sub.size.length}x${sub.size.width}x${sub.size.height} ${sub.size.unit || 'cm'}`
                                            : sub.size}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "production" && (
              <ProductionProgressCard
                order={o}
                onInspect={onInspect}
                onRedoRequest={onRedoRequest}
                productions={productions}
                onPreview={onPreview}
              />
            )}
          </div>

          {/* SIDEBAR CONTENT (1/3) */}
          <div className="space-y-6">
            {hasPricing && (
              <div className="rounded-xl overflow-hidden bg-[var(--bg-main)]/40 border border-[var(--grid-border)]">
                <div className="px-5 py-3 border-b border-[var(--grid-border)]/50 bg-[var(--grid-header-bg)]/50 flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Thanh toán</span>
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex justify-between text-[13px] text-[var(--text-secondary)]">
                    <span>Tổng tiền hàng</span>
                    <span className="font-bold text-[var(--text-main)]">{fmtCurrency(productTotal)}</span>
                  </div>

                  <div className="h-px bg-[var(--grid-border)]/30" />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-[var(--status-success)]/10 rounded-lg border border-[var(--status-success)]/10">
                      <p className="text-[9px] font-black text-[var(--status-success)] uppercase tracking-widest mb-1">Đã cọc/thu</p>
                      <p className="text-[14px] font-black text-[var(--status-success)]">{fmtCurrency((o.deposit || 0) + (o.receivedAmount || 0))}</p>
                    </div>
                    <div className="p-3 bg-[var(--status-error)]/10 rounded-lg border border-[var(--status-error)]/10">
                      <p className="text-[9px] font-black text-[var(--status-error)] uppercase tracking-widest mb-1">CÒN LẠI</p>
                      <p className="text-[16px] font-black text-[var(--status-error)]">{fmtCurrency(remaining)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-xl overflow-hidden bg-[var(--bg-main)]/40 border border-[var(--grid-border)]">
              <div className="px-5 py-3 border-b border-[var(--grid-border)]/50 bg-[var(--grid-header-bg)]/50 flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Giao nhận</span>
              </div>
              <div className="p-5 space-y-4">
                {[
                  { icon: MapPin, label: "Địa chỉ giao", val: o.customer.address },
                  { icon: Calendar, label: "Ngày giao dự kiến", val: fmtDate(o.deliveryDate) },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <item.icon size={15} className="mt-0.5 text-[var(--text-placeholder)]" />
                    <div>
                      <p className="text-[9px] font-black text-[var(--text-placeholder)] uppercase tracking-widest">{item.label}</p>
                      <p className="text-[13px] font-bold text-[var(--text-main)] leading-tight">{item.val}</p>
                    </div>
                  </div>
                ))}

                {o.deliveryImage && (
                  <div className="pt-2">
                    <img src={o.deliveryImage} className="w-full h-32 rounded-lg object-cover cursor-zoom-in border border-[var(--grid-border)]" onClick={() => onPreview(o.deliveryImage)} />
                  </div>
                )}
              </div>
            </div>

            <HistoryCard o={o} className="hidden lg:block" />
          </div>
        </div>
      </div>
    </div>
  );
};

// =================== PRODUCTION PROGRESS CARD ===================
const PROD_STATUS_CFG = {
  "Chờ gia công": { label: "Chờ gia công", bg: "var(--bg-main)", text: "var(--text-placeholder)", border: "var(--grid-border)", icon: Clock },
  "Đang gia công": { label: "Đang gia công", bg: "var(--palette-blue)/10", text: "var(--palette-dark-blue)", border: "var(--palette-blue)/20", icon: Hammer },
  "Gửi Nghiệm Thu": { label: "Chờ Nghiệm Thu", bg: "var(--status-warning)/10", text: "var(--palette-orange)", border: "var(--status-warning)/20", icon: Camera },
  "Hoàn Thành": { label: "Hoàn Thành", bg: "var(--status-success)/10", text: "var(--brand-primary)", border: "var(--status-success)/20", icon: CheckCircle2 },
  "Hủy": { label: "Hủy", bg: "var(--status-error)/5", text: "var(--status-error)", border: "var(--status-error)/10", icon: Ban },
};

const STEP_LABELS = [
  { key: "Chờ", icon: Clock },
  { key: "Gia công", icon: Hammer },
  { key: "Nghiệm thu", icon: Camera },
  { key: "Xong", icon: CheckCircle2 },
];

function getItemStep(item) {
  if (item.status === "Hoàn Thành") return 4;
  if (item.status === "Gửi Nghiệm Thu") return 3;
  if (item.status === "Đang gia công") return 2;
  return 1; // Chờ gia công
}

function ProdItemRow({ item, onInspect, onPreview }) {
  const cfg = PROD_STATUS_CFG[item.status]
    || { label: item.status, bg: "var(--bg-main)", text: "var(--text-placeholder)", border: "var(--grid-border)", icon: Package };
  const step = getItemStep(item);
  const needsKCS = item.status === "Gửi Nghiệm Thu";

  const deadlineStyle = (() => {
    if (!item.expectedEndDate) return { color: "var(--text-placeholder)", urgent: false };
    const diff = Math.ceil((new Date(item.expectedEndDate) - new Date()) / 86400000);
    if (diff < 0) return { color: "var(--status-error)", urgent: true };
    if (diff <= 3) return { color: "var(--palette-orange)", urgent: true };
    return { color: "var(--text-main)", urgent: false };
  })();

  return (
    <div className="p-4 border border-[var(--grid-border)]/50 rounded-lg bg-[var(--background)] space-y-3">
      <div className="flex items-start gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <div
            className="h-12 w-12 rounded-lg overflow-hidden border border-[var(--grid-border)]/50 bg-[var(--bg-main)] relative cursor-zoom-in hover:opacity-90 transition-all"
            onClick={() => item.productImage && onPreview(item.productImage)}
            title="Ảnh mẫu sản phẩm"
          >
            {item.productImage
              ? <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center"><Package size={20} className="text-[var(--text-placeholder)]" /></div>
            }
            {item.needsRedo && (
              <div className="absolute inset-0 bg-[var(--status-error)]/10 flex items-center justify-center">
                <RotateCcw size={14} className="text-[var(--status-error)]" style={{ animation: "spin 3s linear infinite" }} />
              </div>
            )}
          </div>

          {item.completionPhoto && (
            <div
              className="h-12 w-12 rounded-lg overflow-hidden border-2 border-[var(--status-success)]/30 bg-[var(--bg-main)] relative cursor-zoom-in hover:scale-105 transition-all shadow-sm"
              onClick={() => onPreview(item.completionPhoto)}
              title="Ảnh thợ đã hoàn thiện - Bấm để xem"
            >
              <img src={item.completionPhoto} alt="Hoàn thiện" className="w-full h-full object-cover" />
              <div className="absolute top-0 right-0 p-0.5 bg-[var(--status-success)] rounded-bl-md">
                <Camera size={8} className="text-white" />
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <p className="text-[13px] font-bold text-[var(--text-main)] truncate">{item.productName}</p>
            {item.needsRedo && <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-[var(--status-error)]/10 text-[var(--status-error)] border border-[var(--status-error)]/20 uppercase">Cần sửa</span>}
            {item.isDelayed && <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-[var(--status-warning)]/10 text-[var(--palette-orange)] border border-[var(--status-warning)]/20 uppercase">Trễ hạn</span>}
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <p className="text-[9px] font-black text-[var(--text-placeholder)] uppercase tracking-wider">Hạn bàn giao</p>
              <p className="text-[12px] font-bold" style={{ color: deadlineStyle.color }}>
                {formatShortDateVN(item.expectedEndDate)}
              </p>
            </div>
            {item.quantityPlanned > 1 && (
              <div>
                <p className="text-[9px] font-black text-[var(--text-placeholder)] uppercase tracking-wider">Số lượng</p>
                <p className="text-[12px] font-bold text-[var(--brand-primary)]">{item.quantityCompleted}/{item.quantityPlanned} sp</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border`}
            style={{ backgroundColor: cfg.bg, color: cfg.text, borderColor: cfg.border }}
          >
            <cfg.icon size={11} /> {cfg.label}
          </span>
          {needsKCS && (
            <button
              onClick={() => onInspect(item)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--status-success)] text-[var(--primary-foreground)] text-[11px] font-black hover:opacity-90 transition"
            >
              <Camera size={12} /> NGHIỆM THU
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-0">
        {STEP_LABELS.map((s, i) => {
          const done = step > i;
          const active = step === i + 1;
          const Icon = s.icon;
          return (
            <div key={i} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-0.5">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${done ? "bg-[var(--status-success)] border-[var(--status-success)]" :
                  active ? "bg-[var(--status-warning)] border-[var(--status-warning)]" :
                    "bg-[var(--background)] border-[var(--grid-border)]"
                  }`}>
                  <Icon size={11} className={done || active ? "text-[var(--primary-foreground)]" : "text-[var(--text-placeholder)]"} />
                </div>
                <span className={`text-[9px] font-bold whitespace-nowrap ${done ? "text-[var(--status-success)]" : active ? "text-[var(--palette-orange)]" : "text-[var(--text-placeholder)]"
                  }`}>{s.key}</span>
              </div>
              {i < 3 && (
                <div className={`flex-1 h-0.5 mx-1 rounded ${step > i + 1 ? "bg-[var(--status-success)]/40" : step === i + 1 ? "bg-[var(--status-warning)]/40" : "bg-[var(--bg-main)]"
                  }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProductionProgressCard({ order, onInspect, onRedoRequest, productions, onPreview }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-black text-[var(--text-main)] uppercase tracking-tight flex items-center gap-2">
          <Hammer size={18} className="text-[var(--brand-primary)]" /> Tiến độ gia công xưởng
        </h3>
        <div className="px-2 py-1 bg-[var(--bg-main)] rounded text-[10px] font-bold text-[var(--text-secondary)] border border-[var(--grid-border)]">
          {productions.length} sản phẩm
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {productions.length > 0 ? (
          productions.map((p) => (
            <ProdItemRow key={p.id} item={p} onInspect={onInspect} onPreview={onPreview} />
          ))
        ) : (
          <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-[var(--grid-border)] rounded-xl bg-[var(--bg-main)]/30">
            <Package size={32} className="text-[var(--text-placeholder)] mb-2 opacity-20" />
            <p className="text-[12px] font-medium text-[var(--text-placeholder)]">Chưa có sản phẩm nào được bàn giao gia công</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function InvoiceDetailsPopup({ invoiceId, isOpen, onClose, onStatusChanged, userRole = 'owner' }) {
  const [viewState, setViewState] = useState("loading");
  const [order, setOrder] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [deliveryImage, setDeliveryImage] = useState(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [finalPayment, setFinalPayment] = useState(0);
  const [isUploading, setIsUploading] = useState(false);


  const [showConfirm, setShowConfirm] = useState(false);
  const [showOwnerCancel, setShowOwnerCancel] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({ title: "", message: "", onConfirm: () => { } });

  const [handoverDeadline, setHandoverDeadline] = useState("");
  const [handoverItemsData, setHandoverItemsData] = useState([]);
  const [handoverNotes, setHandoverNotes] = useState("");

  const [inspectItem, setInspectItem] = useState(null);
  const [redoItem, setRedoItem] = useState(null);
  const [redoNote, setRedoNote] = useState("");
  const [productions, setProductions] = useState([]);
  const [activeTab, setActiveTab] = useState("info");

  const popupRef = useRef(null);

  const handlePrint = () => {
    window.print();
  };

  const fetchOrderData = useCallback(async () => {
    if (!invoiceId) return;
    try {
      const res = await orderService.getOrderById(invoiceId);
      const found = res.data;
      if (found) {
        // Adapt API order data to legacy UI format
        const normalized = {
          ...found,
          id: found.pk_order_id,
          code: `DH-${found.pk_order_id}`,
          status: ORDER_CONFIG.STATUS_MAP[found.order_status] || "Chờ xử lý",
          type: ORDER_CONFIG.TYPE_MAP[found.order_type] || "Hàng khách đặt",
          customer: found.customer ? {
            name: found.customer.full_name || "Khách hàng",
            phone: found.customer.phone_number || "---",
            address: found.customer.address || "---"
          } : { name: "Khách hàng", phone: "---", address: "---" },
          products: (found.items || []).map(p => ({
            id: p.pk_order_item_id,
            name: p.item_name || p.product?.product_name || `Sản phẩm #${p.pk_order_item_id}`,
            image: p.item_img || p.product?.product_image || "https://placehold.co/400x320?text=No+Image",
            qty: p.item_quantity || 1,
            unit: p.unit || "Bộ",
            price: Number(p.item_price || 0),
            material: p.item_material || "Gỗ tự nhiên",
            size: parseItemSize(p.item_size),
            finish: p.item_color || (p.is_finished ? "Sơn PU" : "Hàng Mộc"),
            warranty: p.item_warranty || ORDER_CONFIG.DEFAULT_WARRANTY,
            note: p.item_note || "",
            isBundle: p.item_is_bundle === 1,
            bundleItems: (() => {
              if (!p.item_bundle_items) return [];
              try {
                const parsed = typeof p.item_bundle_items === 'string'
                  ? JSON.parse(p.item_bundle_items)
                  : p.item_bundle_items;
                return Array.isArray(parsed) ? parsed : [];
              } catch (e) {
                return [];
              }
            })(),
            customerSampleImages: (() => {
              if (!p.customer_img) return [];
              try {
                const parsed = typeof p.customer_img === 'string'
                  ? JSON.parse(p.customer_img)
                  : p.customer_img;
                if (Array.isArray(parsed)) return parsed.filter(Boolean);
                return typeof parsed === 'string' ? [parsed] : [];
              } catch (e) {
                return typeof p.customer_img === 'string' ? [p.customer_img] : [];
              }
            })(),
            importStatus: p.import_status || 0,
            manufacturingOrderCode: p.customRequestItem?.manufacturingDetail?.order?.order_code || null
          })),
          timeline: (found.histories || []).map(h => ({
            time: formatDateTimeVN(h.createdate),
            label: h.action || h.label,
            note: h.action === "Tạo đơn hàng" ? "Đơn hàng đã được tiếp nhận và chờ xử lý" : (h.note || ""),
            active: true
          })),
          histories: (found.histories || []).map(h => ({
            ...h,
            note: h.action === "Tạo đơn hàng" ? "Đơn hàng đã được tiếp nhận và chờ xử lý" : (h.note || "")
          })),
          processingFee: Number(found.processing_fee || 0),
          discount: Number(found.discount_amount || 0),
          deposit: Number(found.deposit_amount || 0),
          receivedAmount: Number(found.received_amount || 0),
          total: Number(found.total_amount || 0),
          date: found.createdate,
          deliveryDate: found.expected_fulfillment_date,
          notes: found.note || found.order_note || "",
          customRequirements: found.note || found.order_note || "",
          deliveryImage: found.delivery_image,
          sourceRequest: found.customRequest ? {
            code: found.customRequest.request_code,
            id: found.customRequest.pk_custom_request_id,
            status: found.customRequest.status,
            date: found.customRequest.createdate
          } : null,
          manufacturingOrders: (() => {
            const list = (found.items || [])
              .map(p => p.customRequestItem?.manufacturingDetail?.order)
              .filter(Boolean);
            if (list.length === 0) return [];
            const unique = [];
            const seen = new Set();
            for (const item of list) {
              if (!seen.has(item.order_code)) {
                seen.add(item.order_code);
                unique.push({
                  code: item.order_code,
                  id: item.pk_manufacturing_order_id,
                  status: item.status,
                  date: item.createdate
                });
              }
            }
            return unique;
          })()
        };

        const mappedProductions = (found.items || []).flatMap((item) =>
          (item.processing || []).map((proc) => {
            const PROC_STATUS_MAP = {
              1: "Chờ gia công",
              2: "Đang gia công",
              3: "Gửi Nghiệm Thu", // Vẫn giữ key "Gửi Nghiệm Thu" để khớp với logic data nhưng Label sẽ là "Chờ Nghiệm Thu"
              4: "Hoàn Thành",
              0: "Hủy",
            };
            const statusLabel = PROC_STATUS_MAP[proc.processing_status] ?? proc.processing_status;
            return {
              id: proc.pk_processing_id,
              orderItemId: item.pk_order_item_id, // Lưu thêm ID của Order Item để Backend nhận diện đúng
              orderId: found.pk_order_id,
              orderCode: `DH-${found.pk_order_id}`,
              productName: item.item_name || `Sản phẩm #${item.pk_order_item_id}`,
              productImage: item.item_img || null,
              assignedWorker: proc.worker?.profile?.full_name || proc.worker?.email || "Chưa giao",
              status: statusLabel,
              expectedEndDate: proc.end_date || null,
              quantityPlanned: proc.quantity || item.item_quantity || 1,
              quantityCompleted: statusLabel === "Hoàn Thành" ? (proc.quantity || item.item_quantity || 1) : 0,
              needsRedo: false,
              completionPhoto: (() => {
                if (!proc.finished_img) return null;
                try {
                  const imgs = JSON.parse(proc.finished_img);
                  if (Array.isArray(imgs)) return imgs[0];
                  return proc.finished_img;
                } catch {
                  // Nếu không phải JSON, trả về nguyên bản (có thể là URL string)
                  return proc.finished_img;
                }
              })(),
              isDelayed: proc.end_date ? diffDays(proc.end_date, todayVN()) < 0 && statusLabel !== "Hoàn Thành" : false,
              workerNotes: proc.note || "",
            };
          })
        );

        setOrder(normalized);
        setDeliveryImage(normalized.deliveryImage || null);
        setProductions(mappedProductions);
        const rem = (normalized.total || 0) + (normalized.processingFee || 0) - (normalized.discount || 0) - (normalized.deposit || 0) - (normalized.receivedAmount || 0);
        setFinalPayment(rem > 0 ? rem : 0);
        setViewState("ready");
      } else {
        setViewState("error");
      }
    } catch (err) {
      console.error(err);
      setViewState("error");
    }
  }, [invoiceId]);

  useEffect(() => {
    if (!isOpen || !invoiceId) {
      setHasUnsavedChanges(false);
      setDeliveryImage(null);
      return;
    }
    setViewState("loading");
    fetchOrderData();
  }, [isOpen, invoiceId, fetchOrderData]);

  useEffect(() => {
    if (showCompleteModal && order) {
      const calculatedTotal = order.products.reduce((acc, p) => acc + (p.price || 0) * p.qty, 0);
      const displayTotal = order.total != null ? order.total : calculatedTotal;
      const rem = displayTotal + (order.processingFee || 0) - (order.discount || 0) - (order.deposit || 0) - (order.receivedAmount || 0);
      setFinalPayment(rem > 0 ? rem : 0);
    }
  }, [showCompleteModal, order]);

  useEffect(() => {
    if (showHandoverModal && order) {
      if (order.deliveryDate) {
        const delivery = new Date(order.deliveryDate);
        delivery.setDate(delivery.getDate() - 2);
        setHandoverDeadline(delivery.toISOString().split('T')[0]);
      }
      setHandoverNotes("");

      const savedProducts = JSON.parse(localStorage.getItem("tpf_simulated_products") || "[]");

      const initializedData = order.products.map(p => {
        const invItem = savedProducts.find(inv => inv.code === p.code || inv.name === p.name);
        const days = p.finishingDays || invItem?.leadTime || 7;
        const deadlineDate = new Date();
        deadlineDate.setDate(deadlineDate.getDate() + parseInt(days));

        return {
          days: days,
          deadline: deadlineDate.toISOString().split('T')[0]
        };
      });

      setHandoverItemsData(initializedData);
    }
  }, [showHandoverModal, order]);

  useEffect(() => {
    if (showHandoverModal && handoverItemsData.length > 0) {
      // Find the furthest deadline among all products
      const allDates = handoverItemsData
        .map(item => item.deadline)
        .filter(d => !!d)
        .map(d => new Date(d));

      if (allDates.length > 0) {
        const maxDate = new Date(Math.max(...allDates));
        setHandoverDeadline(maxDate.toISOString().split('T')[0]);
      }
    }
  }, [handoverItemsData, showHandoverModal]);

  const updateProductionInLocal = async (orderItemId, updates) => {
    try {
      // Map labels to DB status numbers: 1: Chờ, 2: Đang, 3: Nghiệm thu, 4: Xong, 0: Hủy
      let statusNum = undefined;
      if (updates.status === "Hoàn Thành") statusNum = 4;
      if (updates.status === "Đang gia công") statusNum = 2;
      if (updates.status === "Hủy") statusNum = 0;

      const payload = {
        handover_items: [{
          pk_order_item_id: orderItemId, // Phải dùng pk_order_item_id để backend findOne
          processing_status: statusNum,
          note: updates.note,
          cancel_note: updates.cancel_note
        }]
      };

      const res = await orderService.updateOrderStatus(order.id, payload);
      if (res) {
        await fetchOrderData();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Update production error:", error);
      toast.error("Lỗi cập nhật tiến độ sản phẩm");
      return false;
    }
  };

  const productTotal = order?.products?.reduce((acc, p) => acc + (p.price || 0) * (p.qty || 1), 0) || 0;
  const remainingValue = order?.status === "Đơn đã hủy" ? 0 : (productTotal - (order?.deposit || 0) - (order?.receivedAmount || 0));
  const recoveryAmt = (order?.deposit || 0) + (order?.receivedAmount || 0);

  const lastActiveStatus = useMemo(() => {
    if (!order?.timeline) return "Chờ xử lý";
    const cancelIdx = order.timeline.findIndex(t => t.label?.includes("Yêu cầu hủy") || t.label?.includes("Chờ duyệt hủy"));
    if (cancelIdx > 0) return order.timeline[cancelIdx - 1]?.label || "Đang xử lý";
    return order.status;
  }, [order?.timeline, order?.status]);

  const hasProduction = order?.productionOrders && order.productionOrders.length > 0;
  const isStarted = ["Đang sản xuất", "Đã nhập kho", "Đang gia công", "Chờ giao hàng"].includes(lastActiveStatus) || hasProduction;
  const isRefundBlocked = isStarted;

  const handleUpdate = async (newStatus, extraData = {}) => {
    try {
      const statusValue = ORDER_CONFIG.REVERSE_STATUS_MAP[newStatus];
      const payload = {
        order_status: statusValue !== undefined ? statusValue : order.order_status,
        ...extraData
      };
      const res = await orderService.updateOrderStatus(order.id, payload);
      if (res) {
        await fetchOrderData();
        onStatusChanged(order.id, newStatus);
        toast.success(`Đã cập nhật trạng thái: ${newStatus}`);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Lỗi khi cập nhật trạng thái");
    }
  };

  const handleFinishOrder = async () => {
    if (!deliveryImage && !order.deliveryImage) {
      toast.error("Vui lòng tải ảnh giao hàng trước!");
      return;
    }

    const debtAmount = Math.max(0, remainingValue - finalPayment);
    const isFullPayment = debtAmount <= 0;

    await handleUpdate("Hoàn thành", {
      received_amount: Number(finalPayment || 0),
      delivery_image: deliveryImage,
      order_note: isFullPayment ? "Khách đã thanh toán đủ" : `Khách nợ: ${fmtCurrency(debtAmount)}`
    });
    setShowCompleteModal(false);
  };

  const handleHandoverConfirm = async () => {
    try {
      // 1. Kiểm tra logic ngày: Deadline xưởng sơn phải <= Ngày giao khách
      if (order.deliveryDate) {
        const invalidItems = handoverItemsData.filter((item) => {
          if (!item.deadline) return false;
          return item.deadline >= new Date(order.deliveryDate).toISOString().split('T')[0];
        });

        if (invalidItems.length > 0) {
          toast.error("Hạn xong sản phẩm không được sau Ngày giao khách!");
          return;
        }

        if (isDateAfter(handoverDeadline, order.deliveryDate)) {
          toast.error("Hạn bàn giao tổng không được sau Ngày giao khách!");
          return;
        }
      }

      // 2. Chuẩn bị dữ liệu chi tiết từng món
      const handoverItems = order.products.map((p, idx) => ({
        pk_order_item_id: p.id,
        start_date: todayVN(), // Mặc định ngày bắt đầu là hôm nay khi bàn giao
        end_date: handoverItemsData[idx]?.deadline,
        note: handoverNotes
      }));

      await handleUpdate("Đang gia công", {
        note: handoverNotes || "Bàn giao gia công cho xưởng sơn",
        expected_fulfillment_date: handoverDeadline,
        handover_items: handoverItems
      });
      setShowHandoverModal(false);
    } catch (e) {
      console.error(e);
      toast.error("Lỗi khi bàn giao");
    }
  };

  const handleSafeClose = () => {
    if (hasUnsavedChanges) {
      setConfirmConfig({
        title: "Xác nhận đóng",
        message: "Bạn có thay đổi chưa lưu. Bạn có chắc chắn muốn đóng?",
        onConfirm: () => {
          setShowConfirm(false);
          onClose();
        }
      });
      setShowConfirm(true);
    } else onClose();
  };

  useEffect(() => {
    const handleKeyDown = (e) => { if (isOpen && e.key === "Escape") handleSafeClose(); };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, hasUnsavedChanges]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 print-container">
      <style>{`
        @media print {
          body * { visibility: hidden !important; background: white !important; }
          .print-container, .print-container * { visibility: visible !important; }
          .print-container { 
            position: absolute !important; 
            left: 0 !important; 
            top: 0 !important; 
            width: 100% !important; 
            height: auto !important; 
            overflow: visible !important; 
            padding: 0 !important;
            display: block !important;
            box-shadow: none !important;
            background: white !important;
          }
          .animate-in { animation: none !important; }
          .fixed { position: static !important; }
          .bg-white { background: white !important; }
          .shadow-2xl, .shadow-sm, .shadow-md { box-shadow: none !important; border: 1px solid #eee !important; }
          .printer-hidden, button, .popup-footer { display: none !important; }
          .grid { display: block !important; }
          .flex { display: flex !important; }
          .h-[90vh], .h-[85vh] { height: auto !important; }
          .overflow-y-auto { overflow: visible !important; }
          .max-w-5xl { max-width: 100% !important; }
        }
      `}</style>
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={handleSafeClose}
      />
      <div
        className="bg-[var(--background)] w-full max-w-5xl h-[90vh] md:h-[85vh] rounded-lg overflow-hidden flex flex-col relative border border-[var(--grid-border)]"
      >
        <div className="px-6 py-4 border-b border-[var(--grid-border)] flex items-center justify-between shrink-0 bg-[var(--background)]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[var(--brand-primary)]/10 flex items-center justify-center text-[var(--brand-primary)] border border-[var(--brand-primary)]/10">
              <Package size={20} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-[17px] font-bold text-[var(--text-main)]">
                  Chi tiết đơn hàng
                </h2>
                <span className="px-2 py-0.5 bg-[var(--bg-main)] border border-[var(--grid-border)] text-[var(--text-secondary)] rounded-md text-[11px] font-bold font-mono">
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
          <div className="flex items-center gap-3">
            <button
              onClick={handleSafeClose}
              className="p-2 rounded-lg text-[var(--text-placeholder)] hover:text-[var(--text-main)] hover:bg-[var(--bg-main)] transition-colors printer-hidden"
            >
              <X size={20} />
            </button>
          </div>
        </div>

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
              lastActiveStatus={lastActiveStatus}
              isStarted={isStarted}
              isRefundBlocked={isRefundBlocked}
              hasProduction={hasProduction}
              onInspect={setInspectItem}
              onRedoRequest={setRedoItem}
              productions={productions}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          )}
        </div>

        {viewState === "ready" && order && (userRole === 'owner' || userRole === 'sales') && (
          <div className="p-4 border-t border-[var(--grid-border)]/50 bg-[var(--bg-main)]/50 flex items-center justify-end shrink-0 popup-footer printer-hidden">
            <div className="flex items-center gap-3">
              {/* ── Hàng mộc & Hàng khách đặt: bàn giao xưởng ── */}
              {userRole === 'owner' && order.status === "Chờ xử lý" && (order.type === "Hàng mộc" || order.type === "Hàng khách đặt") && (
                <button
                  className="px-5 py-2 bg-[var(--brand-primary)] text-white rounded-lg text-[13px] font-bold hover:opacity-90 transition-all active:scale-95 flex items-center gap-2"
                  onClick={() => setShowHandoverModal(true)}
                >
                  <Hammer size={16} /> BÀN GIAO XƯỞNG
                </button>
              )}

              {userRole === 'owner' && order.status === "Đang gia công" && (order.type === "Hàng mộc" || order.type === "Hàng khách đặt") && (
                <>
                  {/* Trường hợp thợ chưa làm xong hết */}
                  {productions.length > 0 && !productions.every(p => p.status === "Hoàn Thành") ? (
                    <button
                      disabled
                      className="h-10 px-5 rounded-lg text-[13px] font-bold bg-[var(--text-placeholder)]/20 text-[var(--text-placeholder)] cursor-not-allowed flex items-center gap-2"
                      title="Chờ thợ hoàn thiện 100% các món hàng"
                    >
                      <Clock size={16} /> CHỜ XƯỞNG HOÀN THIỆN
                    </button>
                  ) : (
                    /* Trường hợp thợ đã xong 100% - Đổi sang nút khác */
                    <button
                      className="h-10 px-5 rounded-lg text-[13px] font-bold bg-[var(--status-success)] text-[var(--primary-foreground)] hover:opacity-90 transition-all active:scale-95 flex items-center gap-2 shadow-sm"
                      onClick={() => {
                        setConfirmConfig({
                          title: "Xác nhận chuyển sang Chờ Giao",
                          message: "Xác nhận toàn bộ sản phẩm đã hoàn thiện và chuyển đơn hàng sang trạng thái chờ giao? Việc này sẽ thông báo cho bộ phận vận chuyển để lên lịch giao hàng.",
                          showInput: false,
                          onConfirm: () => {
                            handleUpdate("Chờ giao hàng");
                            setShowConfirm(false);
                          }
                        });
                        setShowConfirm(true);
                      }}
                    >
                      <CheckCircle size={16} /> CHUYỂN SANG CHỜ GIAO
                    </button>
                  )}
                </>
              )}

              {userRole === 'owner' && order.status === "Chờ giao hàng" && (
                <button
                  className="px-5 py-2 bg-[var(--palette-blue)] text-white rounded-lg text-[13px] font-bold hover:opacity-90 transition-all active:scale-95 flex items-center gap-2"
                  onClick={() => {
                    setConfirmConfig({
                      title: "Xác nhận bắt đầu giao hàng",
                      message: "Xác nhận đơn hàng đã được xuất kho và đang trong quá trình vận chuyển đến tay khách hàng? Trạng thái đơn hàng sẽ được cập nhật thành 'Đang giao'.",
                      showInput: false,
                      onConfirm: () => {
                        handleUpdate("Đang giao hàng");
                        setShowConfirm(false);
                      }
                    });
                    setShowConfirm(true);
                  }}
                >
                  <RefreshCw size={16} /> BẮT ĐẦU GIAO
                </button>
              )}

              {userRole === 'owner' && order.status === "Đang giao hàng" && (
                <button
                  className="px-5 py-2 bg-[var(--status-success)] text-white rounded-lg text-[13px] font-bold hover:opacity-90 transition-all active:scale-95 flex items-center gap-2"
                  onClick={() => setShowCompleteModal(true)}
                >
                  <CheckCircle size={16} /> HOÀN TẤT ĐƠN
                </button>
              )}

              {userRole === 'owner' && order.status === "Chờ duyệt hủy" && (
                <div className="flex gap-2 p-1 bg-[var(--background)] border border-[var(--grid-border)]/50 rounded-xl">
                  <button
                    disabled={["Đang sản xuất", "Đang gia công", "Chờ giao hàng"].includes(lastActiveStatus) || (order.productionOrders?.length > 0)}
                    className="px-6 py-2.5 bg-[var(--bg-main)] text-[var(--text-secondary)] rounded-lg text-[13px] font-bold hover:bg-[var(--grid-border)]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center gap-2"
                    onClick={() => {
                      setConfirmConfig({
                        title: "Duyệt đơn hủy & Hoàn cọc",
                        message: "Duyệt hủy đơn và HOÀN TRẢ TIỀN CỌC cho khách hàng?",
                        onConfirm: () => {
                          handleUpdate("Đơn đã hủy", {
                            deposit_resolution: "refunded",
                            timelineLabel: "Duyệt đơn hủy (Hoàn cọc)",
                            timelineDesc: "Đơn bị hủy khi chưa triển khai. Chủ cửa hàng đã đồng ý hoàn trả 100% tiền cọc."
                          });
                          setShowConfirm(false);
                        }
                      });
                      setShowConfirm(true);
                    }}
                  >
                    {["Đang sản xuất", "Đang gia công", "Chờ giao hàng"].includes(lastActiveStatus) ? <Lock size={16} /> : <RefreshCw size={16} />}
                    DUYỆT & HOÀN CỌC
                  </button>
                  <button
                    className="px-6 py-2.5 bg-[var(--palette-orange)] text-white rounded-lg text-[13px] font-bold hover:opacity-90 transition-all active:scale-95 flex items-center gap-2"
                    onClick={() => {
                      const msg = recoveryAmt > 0
                        ? `Thu hồi ${fmtCurrency(recoveryAmt)} cọc & Nhập lại kho?`
                        : `Hủy đơn & Nhập lại kho?`;

                      setConfirmConfig({
                        title: "Duyệt đơn hủy & Thu cọc",
                        message: msg,
                        onConfirm: () => {
                          handleUpdate("Đơn đã hủy", {
                            deposit_resolution: "forfeited",
                            timelineLabel: "Duyệt đơn hủy (Thu cọc)",
                            timelineDesc: `Quyết định của Chủ: Thu hồi ${recoveryAmt} cọc bồi thường chi phí. Tự động nhập kho món hàng sẵn/mộc.`
                          });
                          setShowConfirm(false);
                        }
                      });
                      setShowConfirm(true);
                    }}
                  >
                    <Trash2 size={16} /> DUYỆT & THU CỌC
                  </button>
                </div>
              )}

              {["Chờ xử lý", "Chờ sản xuất", "Đang gia công", "Chờ giao hàng"].includes(order.status) && (
                <button
                  className="px-4 py-2 bg-[var(--background)] text-[var(--status-error)] border border-[var(--status-error)]/10 rounded-lg text-[13px] font-bold hover:bg-[var(--status-error)]/5 transition-all flex items-center gap-2"
                  onClick={() => {
                    if (userRole === 'owner') {
                      setShowOwnerCancel(true);
                      return;
                    }

                    const isInitial = order.status === "Chờ xử lý" || order.status === "Chờ sản xuất";
                    let confirmMsg = "Xác nhận yêu cầu hủy đơn hàng này?";
                    if (isInitial) {
                      confirmMsg = "Đơn hàng mới - Chuyển sang Chờ duyệt hủy để quyết định Hoàn hoặc Thu cọc?";
                    } else {
                      confirmMsg = "HÀNG ĐANG XỬ LÝ - Chuyển sang Chờ duyệt hủy để thực hiện THU CỌC bồi thường?";
                    }

                    setConfirmConfig({
                      title: "Yêu cầu hủy đơn hàng",
                      message: confirmMsg,
                      showInput: true,
                      inputPlaceholder: "Nhập lý do khách hàng muốn hủy đơn...",
                      required: true,
                      onConfirm: (reason) => {
                        handleUpdate("Chờ duyệt hủy", {
                          cancel_reason: reason || "Nhân viên Sales yêu cầu hủy"
                        });
                        setShowConfirm(false);
                      }
                    });
                    setShowConfirm(true);
                  }}
                >
                  <Ban size={16} /> {userRole === 'sales' ? "YÊU CẦU HỦY" : "HỦY"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {showCompleteModal && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center p-6 bg-[var(--sidebar)]/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-[var(--background)] w-full max-w-xl rounded-xl overflow-hidden modal-content transform border border-[var(--grid-border)]">
            <div className="px-6 py-5 border-b border-[var(--grid-border)] flex items-center justify-between bg-[var(--grid-header-bg)]">
              <h3 className="text-[16px] font-black text-[var(--text-main)] flex items-center gap-2">
                <CheckCircle className="text-[var(--status-success)]" size={20} /> HOÀN TẤT ĐƠN HÀNG
              </h3>
              <button onClick={() => setShowCompleteModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--bg-main)] text-[var(--text-placeholder)] transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="bg-[var(--bg-main)]/40 rounded-xl p-5 space-y-3">
                <div className="flex justify-between items-center text-[13px] text-[var(--text-secondary)] font-medium">
                  <span>Tổng tiền hàng:</span>
                  <span className="font-bold text-[var(--text-main)]">{fmtCurrency(productTotal)}</span>
                </div>
                <div className="flex justify-between items-center text-[13px] text-[var(--text-secondary)] font-medium">
                  <span>Đã đặt cọc:</span>
                  <span className="font-bold text-[var(--text-main)]">{fmtCurrency(order.deposit || 0)}</span>
                </div>
                <div className="pt-2 border-t border-[var(--grid-border)]/50 flex justify-between items-baseline">
                  <span className="text-[var(--status-success)] font-bold text-[14px]">Cần thanh toán:</span>
                  <span className="text-[var(--status-success)] font-black text-[22px] tracking-tight">{fmtCurrency(remainingValue)}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-black text-[var(--text-placeholder)] uppercase tracking-widest ml-1">Số thực thu tại chỗ</label>
                  <div className="mt-1.5 relative">
                    <input
                      type="text"
                      className="w-full px-5 py-3 bg-[var(--bg-main)] border border-[var(--grid-border)]/50 rounded-lg font-black text-lg text-[var(--text-main)] focus:ring-4 focus:ring-[var(--status-success)]/10 focus:border-[var(--status-success)] transition-all outline-none"
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
                    <span className="absolute right-5 top-1/2 -translate-y-1/2 font-bold text-[var(--text-placeholder)]">₫</span>
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
                  <label className="text-[11px] font-black text-[var(--text-placeholder)] uppercase tracking-widest ml-1">Ảnh giao hàng thực tế</label>
                  <label className={`mt-2 w-full h-24 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${deliveryImage ? 'border-[var(--status-success)] bg-[var(--status-success)]/5' : 'border-[var(--grid-border)] bg-[var(--bg-main)] hover:bg-[var(--grid-border)]/10'
                    }`}>
                    {deliveryImage ? (
                      <img src={deliveryImage} className="h-20 w-auto rounded-lg object-cover" alt="Delivery" />
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-[var(--text-placeholder)]">
                        {isUploading ? (
                          <RefreshCw size={20} className="animate-spin text-[var(--brand-primary)]" />
                        ) : (
                          <Camera size={20} />
                        )}
                        <span className="text-[10px] font-bold uppercase">
                          {isUploading ? "Đang tải..." : "Nhấp để tải ảnh"}
                        </span>
                      </div>
                    )}
                    <input type="file" accept="image/*" className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          try {
                            setIsUploading(true);
                            const res = await uploadImage(file);
                            setDeliveryImage(res.url);
                            toast.success("Đã tải ảnh lên thành công!");
                          } catch (err) {
                            console.error(err);
                            toast.error("Lỗi khi tải ảnh lên Cloudinary");
                          } finally {
                            setIsUploading(false);
                          }
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <button
                onClick={() => {
                  setConfirmConfig({
                    title: "Xác nhận hoàn tất đơn hàng",
                    message: "Xác nhận đơn hàng đã được giao thành công và hoàn tất thủ tục thanh toán? Sau khi hoàn tất, đơn hàng sẽ được lưu vào lịch sử giao dịch và không thể chỉnh sửa trạng thái.",
                    showInput: false,
                    onConfirm: () => {
                      handleFinishOrder();
                      setShowConfirm(false);
                    }
                  });
                  setShowConfirm(true);
                }}
                className="w-full h-10 bg-[var(--status-success)] hover:opacity-90 text-[var(--primary-foreground)] rounded-lg font-bold text-[13px] transition-all active:scale-95 mt-2 flex items-center justify-center"
              >
                XÁC NHẬN HOÀN TẤT
              </button>
            </div>
          </div>
        </div>
      )}

      {showHandoverModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px] animate-in fade-in duration-200"
            onClick={() => setShowHandoverModal(false)}
          />

          <div className="relative bg-white w-full max-w-2xl rounded-lg border border-[var(--grid-border)] flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 fade-in duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-[var(--grid-border)] flex items-center justify-between bg-[var(--grid-header-bg)]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[var(--status-focus)] flex items-center justify-center text-[var(--brand-primary)] border border-[var(--brand-primary)]/10">
                  <Paintbrush size={18} />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-[var(--text-main)] leading-none uppercase tracking-tight">
                    BÀN GIAO GIA CÔNG
                  </h3>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-1.5 flex items-center gap-1.5">
                    <Package size={12} className="opacity-60" /> {order?.products?.length} món hàng cần hoàn thiện
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowHandoverModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-[var(--text-placeholder)] transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {/* Overall Context */}
              <div className="flex items-center justify-between p-1">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold text-[var(--text-placeholder)] uppercase tracking-widest">
                    Hạn giao khách
                  </span>
                  <div className="flex items-center gap-2 text-[var(--text-main)]">
                    <Calendar size={13} className="text-[var(--text-placeholder)]" />
                    <span className="text-[13px] font-bold">{fmtDate(order?.deliveryDate)}</span>
                  </div>
                </div>
              </div>
              {/* Product List Section */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-widest px-1">
                  1. Danh sách sản phẩm & Hạn hoàn thiện
                </h4>
                {order?.products?.map((p, idx) => {
                  const itemData = handoverItemsData[idx] || { unitLabor: 0, days: "0", deadline: "" };
                  const dl = itemData.deadline;
                  const orderCreatedDate = order?.date ? new Date(order.date).toISOString().split('T')[0] : null;
                  const orderDeliveryDate = order?.deliveryDate ? new Date(order.deliveryDate).toISOString().split('T')[0] : null;

                  const isTooLate = dl && orderDeliveryDate && dl >= orderDeliveryDate;
                  const isTooEarly = dl && orderCreatedDate && dl <= orderCreatedDate;
                  const hasDateError = isTooLate || isTooEarly;

                  return (
                    <div
                      key={idx}
                      className={`border rounded-lg p-4 transition-colors ${hasDateError ? 'bg-[var(--status-error)]/3 border-[var(--status-error)]/40' : 'bg-white border-[var(--grid-border)]'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-[var(--bg-main)] border border-[var(--grid-border)] shrink-0">
                          <img
                            src={p.image || "/api/placeholder/400/320"}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0 grid grid-cols-12 gap-8 items-start">
                          <div className="col-span-7 min-w-0">
                            <h4 className="text-[14px] font-bold text-[var(--text-main)] truncate">
                              {p.name}
                            </h4>
                            <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                              Số lượng:{" "}
                              <span className="font-bold text-[var(--brand-primary)]">
                                {p.qty} {p.unit}
                              </span>
                            </p>
                            {/* Date range hint */}
                            {orderCreatedDate && orderDeliveryDate && (
                              <p className="text-[10px] text-[red] mt-1.5 leading-tight">
                                Phải trong khoảng{" "}
                                <span className="font-bold">{fmtDate(orderCreatedDate)}</span>
                                {" → "}
                                <span className="font-bold">{fmtDate(orderDeliveryDate)}</span>
                              </p>
                            )}
                          </div>

                          {/* Deadline Input */}
                          <div className="col-span-5">
                            <p className={`text-[9px] font-bold uppercase tracking-tight mb-1 ml-1 ${hasDateError ? 'text-[var(--status-error)]' : 'text-[var(--text-placeholder)]'}`}>
                              Hạn xong SP {hasDateError && '⚠'}
                            </p>
                            <div className="relative">
                              <input
                                type="date"
                                min={orderCreatedDate ? addOneDayStr(orderCreatedDate) : undefined}
                                max={orderDeliveryDate ? subOneDayStr(orderDeliveryDate) : undefined}
                                className={`w-full pl-8 pr-2 py-1.5 border rounded-lg font-bold text-[11px] outline-none transition-all focus:ring-2 ${hasDateError
                                  ? 'border-[var(--status-error)] text-[var(--status-error)] bg-[var(--status-error)]/5 focus:ring-[var(--status-error)]/20'
                                  : 'bg-white border-[var(--grid-border)] text-[var(--text-main)] focus:border-[var(--brand-primary)] focus:ring-[var(--brand-primary)]/10'
                                  }`}
                                value={dl || ""}
                                onChange={(e) => {
                                  const newData = [...handoverItemsData];
                                  newData[idx] = { ...itemData, deadline: e.target.value };
                                  setHandoverItemsData(newData);
                                }}
                              />
                              <Calendar
                                size={12}
                                className={`absolute left-2.5 top-1/2 -translate-y-1/2 ${hasDateError ? 'text-[var(--status-error)]' : 'text-[var(--text-placeholder)]'}`}
                              />
                            </div>
                            {/* Inline error message */}
                            {isTooEarly && (
                              <p className="mt-1.5 ml-1 text-[10px] font-bold text-[var(--status-error)] flex items-center gap-1 leading-tight">
                                <AlertTriangle size={10} className="shrink-0" />
                                Phải SAU ngày tạo đơn, không được trùng ({fmtDate(orderCreatedDate)})
                              </p>
                            )}
                            {isTooLate && (
                              <p className="mt-1.5 ml-1 text-[10px] font-bold text-[var(--status-error)] flex items-center gap-1 leading-tight">
                                <AlertTriangle size={10} className="shrink-0" />
                                Phải TRƯỚC ngày giao, không được trùng ({fmtDate(orderDeliveryDate)})
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary Section */}
              <div className="space-y-4 pt-4 border-t border-[var(--grid-border)]">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest ml-1 flex items-center gap-2">
                    <FileText size={12} className="text-[var(--text-placeholder)]" /> Ghi chú cho
                    thợ xưởng
                  </label>
                  <textarea
                    className="w-full p-3 bg-white border border-[var(--grid-border)] rounded-lg text-[12px] font-medium text-[var(--text-main)] focus:border-[var(--brand-primary)] outline-none transition-all min-h-[70px] max-h-[100px] resize-none"
                    placeholder="Màu sắc, độ bóng, yêu cầu riêng..."
                    value={handoverNotes}
                    onChange={(e) => setHandoverNotes(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {(() => {
              const orderCreatedDate = order?.date ? new Date(order.date).toISOString().split('T')[0] : null;
              const orderDeliveryDate = order?.deliveryDate ? new Date(order.deliveryDate).toISOString().split('T')[0] : null;
              const hasAnyDateError = handoverItemsData.some(item => {
                if (!item.deadline) return false;
                return (orderDeliveryDate && item.deadline >= orderDeliveryDate) ||
                  (orderCreatedDate && item.deadline <= orderCreatedDate);
              });
              return (
                <div className="p-6 bg-[var(--grid-header-bg)] border-t border-[var(--grid-border)] shrink-0 space-y-3">
                  {hasAnyDateError && (
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--status-error)]/8 border border-[var(--status-error)]/25">
                      <AlertTriangle size={14} className="text-[var(--status-error)] shrink-0" />
                      <p className="text-[11px] font-bold text-[var(--status-error)] leading-snug">
                        Có sản phẩm có <span className="underline">Hạn xong SP</span> không hợp lệ. Hạn phải sau ngày tạo đơn và trước ngày giao khách.
                      </p>
                    </div>
                  )}
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => setShowHandoverModal(false)}
                      className="px-6 py-2.5 rounded-lg border border-[var(--grid-border)] text-[13px] font-bold text-[var(--text-secondary)] hover:bg-white transition-all cursor-pointer"
                    >
                      Bỏ qua
                    </button>
                    <button
                      onClick={() => {
                        setConfirmConfig({
                          title: "Xác nhận bàn giao gia công",
                          message: "Xác nhận bàn giao các sản phẩm này cho xưởng để tiến hành gia công? Hãy đảm bảo thông tin ghi chú và hạn hoàn thành đã được kiểm tra kỹ.",
                          showInput: false,
                          onConfirm: () => {
                            handleHandoverConfirm();
                            setShowConfirm(false);
                          }
                        });
                        setShowConfirm(true);
                      }}
                      disabled={hasAnyDateError}
                      className={`px-8 py-2.5 rounded-lg font-bold text-[13px] transition-all flex items-center gap-2 ${hasAnyDateError
                        ? 'bg-[var(--text-placeholder)]/20 text-[var(--text-placeholder)] cursor-not-allowed'
                        : 'bg-[var(--brand-primary)] hover:opacity-90 text-white active:scale-95 cursor-pointer'
                        }`}
                    >
                      Xác nhận bàn giao
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {previewImage && (
        <div
          className="fixed inset-0 z-[2000] bg-[var(--sidebar)]/95 backdrop-blur-xl flex items-center justify-center p-8 transition-all animate-in fade-in cursor-zoom-out"
          onClick={() => setPreviewImage(null)}
        >
          <img src={previewImage} className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg border border-white/10 p-1 bg-white/5 animate-in zoom-in-95 duration-300" alt="Full Preview" />
          <button className="absolute top-8 right-8 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all backdrop-blur-md">
            <X size={24} />
          </button>
        </div>
      )}

      {inspectItem && (
        <div className="absolute inset-0 z-[110] flex items-center justify-center p-6 bg-[var(--sidebar)]/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-[var(--background)] w-full max-w-lg rounded-lg overflow-hidden animate-in zoom-in-95 duration-300 border border-[var(--grid-border)]">
            <div className="px-6 py-4 border-b border-[var(--grid-border)] bg-[var(--grid-header-bg)] flex items-center justify-between">
              <h3 className="text-[15px] font-black text-[var(--status-success)] flex items-center gap-2 uppercase tracking-tight">
                <Camera size={18} /> Nghiệm thu sản phẩm
              </h3>
              <button onClick={() => setInspectItem(null)} className="text-[var(--text-placeholder)] hover:text-[var(--text-main)]">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex gap-4">
                <div
                  className="w-24 h-24 rounded-lg overflow-hidden border border-gray-100 shrink-0 cursor-zoom-in hover:opacity-90 transition-opacity"
                  onClick={() => setPreviewImage(inspectItem.productImage)}
                >
                  <img src={inspectItem.productImage} className="w-full h-full object-cover" alt="" />
                </div>
                <div>
                  <h4 className="font-black text-[var(--text-main)] text-[16px]">{inspectItem.productName}</h4>
                  <p className="text-[12px] text-[var(--text-secondary)] mt-1">Đơn hàng: <span className="font-bold text-[var(--text-main)]">{order?.code}</span></p>
                  <p className="text-[12px] text-[var(--text-secondary)]">Thợ đảm trách: <span className="font-bold text-[var(--text-main)]">{inspectItem.assignedWorker}</span></p>
                </div>
              </div>

              {inspectItem.completionPhoto && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[var(--text-placeholder)] uppercase tracking-widest block">Ảnh hoàn thiện từ xưởng</label>
                  <div
                    className="relative aspect-video rounded-lg overflow-hidden border border-gray-100 shadow-inner group cursor-zoom-in"
                    onClick={() => setPreviewImage(inspectItem.completionPhoto)}
                  >
                    <img src={inspectItem.completionPhoto} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="KCS Preview" />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye className="text-white drop-shadow-md" size={28} />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => {
                    setRedoItem(inspectItem);
                    setInspectItem(null);
                  }}
                  className="h-10 px-4 bg-[var(--status-error)]/5 border border-[var(--status-error)]/10 text-[var(--status-error)] rounded-lg text-[13px] font-bold hover:bg-[var(--status-error)]/10 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <RotateCcw size={16} /> YÊU CẦU SỬA LẠI
                </button>
                <button
                  onClick={() => {
                    setConfirmConfig({
                      title: "Xác nhận đạt yêu cầu",
                      message: "Xác nhận sản phẩm đã đạt chuẩn chất lượng và hoàn tất quá trình gia công? Hành động này sẽ ghi nhận sản phẩm đã sẵn sàng để bàn giao.",
                      showInput: false,
                      onConfirm: async () => {
                        const ok = await updateProductionInLocal(inspectItem.orderItemId, {
                          status: "Hoàn Thành"
                        });
                        if (ok) {
                          toast.success("Đã nghiệm thu thành công sản phẩm!");
                          setInspectItem(null);
                        }
                        setShowConfirm(false);
                      }
                    });
                    setShowConfirm(true);
                  }}
                  className="h-10 px-4 bg-emerald-600 text-white rounded-lg text-[13px] font-bold hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={16} /> ĐẠT YÊU CẦU
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {redoItem && (
        <div className="absolute inset-0 z-[120] flex items-center justify-center p-6 bg-[var(--sidebar)]/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-[var(--background)] w-full max-w-md rounded-xl overflow-hidden animate-in zoom-in-95 duration-300 border border-[var(--grid-border)]">
            <div className="px-6 py-4 border-b border-[var(--grid-border)] bg-[var(--grid-header-bg)] flex items-center justify-between">
              <h3 className="text-[15px] font-black text-[var(--status-error)] flex items-center gap-2 uppercase tracking-tight">
                <RotateCcw size={18} /> Yêu cầu sửa lại
              </h3>
              <button onClick={() => setRedoItem(null)} className="text-[var(--text-placeholder)] hover:text-[var(--text-main)]">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-[13px] text-[var(--text-secondary)] font-medium">Bạn muốn thợ <span className="font-bold text-[var(--text-main)]">{redoItem.assignedWorker}</span> sửa lại nội dung gì cho sản phẩm này?</p>

              <textarea
                autoFocus
                className="w-full px-4 py-3 bg-[var(--bg-main)]/40 border border-[var(--grid-border)] rounded-xl font-medium text-[13px] text-[var(--text-main)] focus:ring-4 focus:ring-[var(--brand-primary)]/10 focus:border-[var(--brand-primary)] outline-none transition-all min-h-[120px]"
                placeholder="Ví dụ: Nước sơn còn hơi mỏng, cần bắn thêm lót 2..."
                value={redoNote}
                onChange={(e) => setRedoNote(e.target.value)}
              />

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setRedoItem(null)}
                  className="flex-1 h-10 px-4 border border-[var(--grid-border)] text-[var(--text-placeholder)] rounded-lg text-[13px] font-bold hover:bg-[var(--bg-main)] transition-all active:scale-95 flex items-center justify-center"
                >
                  HỦY
                </button>
                <button
                  onClick={() => {
                    if (!redoNote.trim()) { toast.error("Vui lòng nhập nội dung cần sửa"); return; }
                    setConfirmConfig({
                      title: "Xác nhận gửi yêu cầu sửa",
                      message: "Xác nhận gửi yêu cầu sửa lại sản phẩm này cho thợ? Tiến độ đơn hàng có thể bị ảnh hưởng, hãy đảm bảo bạn đã ghi chú rõ ràng các lỗi cần khắc phục.",
                      showInput: false,
                      onConfirm: async () => {
                        const ok = await updateProductionInLocal(redoItem.orderItemId, {
                          status: "Đang gia công",
                          note: redoNote
                        });
                        if (ok) {
                          toast.success("Đã gửi yêu cầu sửa lại cho thợ!");
                          setRedoItem(null);
                          setRedoNote("");
                        }
                        setShowConfirm(false);
                      }
                    });
                    setShowConfirm(true);
                  }}
                  className="flex-1 h-10 px-4 bg-[var(--status-error)] text-white rounded-lg text-[13px] font-bold hover:opacity-90 transition-all active:scale-95 flex items-center justify-center"
                >
                  GỬI YÊU CẦU
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={showConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setShowConfirm(false)}
        showInput={confirmConfig.showInput}
        inputPlaceholder={confirmConfig.inputPlaceholder}
        required={confirmConfig.required}
      />

      <OwnerCancelModal
        isOpen={showOwnerCancel}
        onClose={() => setShowOwnerCancel(false)}
        onConfirm={(res, reason) => {
          handleUpdate("Đơn đã hủy", {
            deposit_resolution: res,
            cancel_reason: reason,
            timelineLabel: res === "refunded" ? "Hủy đơn (Hoàn cọc)" : "Hủy đơn (Thu cọc)",
            timelineDesc: reason
          });
          setShowOwnerCancel(false);
        }}
      />
    </div>
  );
}

const OwnerCancelModal = ({ isOpen, onClose, onConfirm }) => {
  const [reason, setReason] = useState("");
  const [pendingAction, setPendingAction] = useState(null);

  if (!isOpen) return null;

  const hasReason = reason.trim().length > 0;

  const CONFIRM_CONFIG = {
    refunded: {
      title: "Xác nhận HOÀN CỌC",
      icon: <RefreshCw size={26} />,
      accent: "var(--status-error)",
      warning: "Tiền cọc sẽ được hoàn trả lại cho khách hàng. Hành động này không thể hoàn tác sau khi xác nhận.",
      confirmLabel: "XÁC NHẬN HOÀN CỌC",
    },
    forfeited: {
      title: "Xác nhận THU CỌC",
      icon: <Trash2 size={26} />,
      accent: "var(--status-error)",
      warning: "Tiền cọc sẽ được GIỮ LẠI, không hoàn trả cho khách hàng. Hành động này không thể hoàn tác sau khi xác nhận.",
      confirmLabel: "XÁC NHẬN THU CỌC",
    },
  };

  const cfg = pendingAction ? CONFIRM_CONFIG[pendingAction.type] : null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in"
        onClick={!pendingAction ? onClose : undefined}
      />

      {/* ── MAIN MODAL ── */}
      <div className="relative bg-[var(--background)] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in border border-[var(--grid-border)]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--grid-border)] bg-[var(--status-error)]/5">
          <h3 className="text-[15px] font-black text-[var(--status-error)] flex items-center gap-2 uppercase tracking-tight">
            <Ban size={18} /> Hủy đơn hàng
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[var(--bg-main)] rounded-full transition text-[var(--text-placeholder)] hover:text-[var(--text-main)]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Notice */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-[var(--status-error)]/5 border border-[var(--status-error)]/15">
            <AlertTriangle size={16} className="text-[var(--status-error)] shrink-0 mt-0.5" />
            <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed font-medium">
              Bạn đang thực hiện hủy đơn với quyền <span className="font-black text-[var(--text-main)]">Chủ cửa hàng</span>. Vui lòng nhập lý do và chọn phương án xử lý tiền cọc.
            </p>
          </div>

          {/* Textarea */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase tracking-wider text-[var(--text-placeholder)]">
              Lý do hủy đơn <span className="text-[var(--status-error)]">*</span>
            </label>
            <textarea
              autoFocus
              className="w-full h-28 px-4 py-3 text-[13px] bg-[var(--bg-main)] border border-[var(--grid-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--status-error)]/15 focus:border-[var(--status-error)]/60 transition-all resize-none font-medium text-[var(--text-main)] placeholder:text-[var(--text-placeholder)]"
              placeholder="Nhập lý do hủy đơn hàng..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          {/* Action buttons — only show when reason is filled */}
          <div
            className={`space-y-3 transition-all duration-300 ${hasReason ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"}`}
          >
            <p className="text-[11px] font-black uppercase tracking-wider text-[var(--text-placeholder)] text-center">
              Chọn phương án xử lý tiền cọc
            </p>
            <div className="grid grid-cols-2 gap-3">
              {/* HOÀN CỌC */}
              <button
                onClick={() => setPendingAction({ type: "refunded" })}
                className="group flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 border-[var(--status-error)]/30 bg-[var(--status-error)]/5 hover:bg-[var(--status-error)]/10 hover:border-[var(--status-error)]/60 transition-all active:scale-95"
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--status-error)]/15 flex items-center justify-center text-[var(--status-error)] group-hover:bg-[var(--status-error)]/25 transition-all">
                  <RefreshCw size={18} />
                </div>
                <div className="text-center">
                  <p className="text-[12px] font-black text-[var(--status-error)] uppercase tracking-tight">Hoàn cọc</p>
                  <p className="text-[10px] text-[var(--text-placeholder)] font-medium mt-0.5">Trả tiền cọc cho khách</p>
                </div>
              </button>

              {/* THU CỌC */}
              <button
                onClick={() => setPendingAction({ type: "forfeited" })}
                className="group flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 border-[var(--status-error)]/30 bg-[var(--status-error)]/5 hover:bg-[var(--status-error)]/10 hover:border-[var(--status-error)]/60 transition-all active:scale-95"
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--status-error)]/15 flex items-center justify-center text-[var(--status-error)] group-hover:bg-[var(--status-error)]/25 transition-all">
                  <Trash2 size={18} />
                </div>
                <div className="text-center">
                  <p className="text-[12px] font-black text-[var(--status-error)] uppercase tracking-tight">Thu cọc</p>
                  <p className="text-[10px] text-[var(--text-placeholder)] font-medium mt-0.5">Giữ lại tiền cọc</p>
                </div>
              </button>
            </div>
          </div>

          {/* Cancel button */}
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl border border-[var(--grid-border)] text-[var(--text-placeholder)] text-[12px] font-bold hover:bg-[var(--bg-main)] hover:text-[var(--text-secondary)] transition-all"
          >
            ĐÓNG
          </button>
        </div>
      </div>

      {/* ── CONFIRM STEP ── */}
      {pendingAction && cfg && (
        <div className="absolute inset-0 z-10 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
          <div className="relative bg-[var(--background)] w-full max-w-sm rounded-2xl shadow-2xl border border-[var(--grid-border)] overflow-hidden animate-in zoom-in-95 fade-in duration-200">

            {/* Colored top bar */}
            <div
              className="h-1.5 w-full"
              style={{ background: `linear-gradient(90deg, ${cfg.accent}, ${cfg.accent}99)` }}
            />

            <div className="p-6 space-y-4">
              {/* Icon + Title */}
              <div className="flex flex-col items-center text-center gap-3 pt-2">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: `${cfg.accent}15`, color: cfg.accent, border: `1.5px solid ${cfg.accent}30` }}
                >
                  {cfg.icon}
                </div>
                <h4 className="text-[15px] font-black text-[var(--text-main)]">{cfg.title}</h4>
              </div>

              {/* Warning */}
              <div
                className="flex items-start gap-2.5 p-3.5 rounded-xl text-[12px] font-medium leading-relaxed"
                style={{ background: `${cfg.accent}08`, border: `1px solid ${cfg.accent}25`, color: cfg.accent }}
              >
                <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                <span>{cfg.warning}</span>
              </div>

              {/* Reason summary */}
              <div className="bg-[var(--bg-main)] rounded-xl px-4 py-3 border border-[var(--grid-border)]">
                <p className="text-[10px] font-black uppercase tracking-wider text-[var(--text-placeholder)] mb-1">Lý do hủy</p>
                <p className="text-[13px] text-[var(--text-secondary)] font-medium italic leading-relaxed">"{reason}"</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setPendingAction(null)}
                  className="flex-1 px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--grid-border)] text-[var(--text-secondary)] rounded-xl text-[12px] font-bold hover:bg-[var(--grid-border)]/30 transition-all active:scale-95"
                >
                  QUAY LẠI
                </button>
                <button
                  onClick={() => {
                    onConfirm(pendingAction.type, reason);
                    setPendingAction(null);
                  }}
                  className="flex-1 px-4 py-2.5 text-white rounded-xl text-[12px] font-bold transition-all active:scale-95"
                  style={{ background: cfg.accent }}
                >
                  {cfg.confirmLabel}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ===================== MINI UI ATOMS =====================

const LoadingSkeleton = () => (
  <div className="p-8 space-y-8 animate-pulse h-full overflow-hidden">
    <div className="grid grid-cols-2 gap-8 h-full">
      <div className="space-y-6">
        <div className="h-40 bg-[var(--bg-main)]/60 rounded-xl" />
        <div className="h-64 bg-[var(--bg-main)]/60 rounded-xl" />
      </div>
      <div className="space-y-6">
        <div className="h-48 bg-[var(--bg-main)]/40 rounded-xl" />
        <div className="h-32 bg-[var(--bg-main)]/40 rounded-xl" />
        <div className="h-40 bg-[var(--bg-main)]/40 rounded-xl" />
      </div>
    </div>
  </div>
);

const ErrorState = ({ onRetry }) => (
  <div className="flex flex-col items-center justify-center p-12 text-center h-full bg-[var(--bg-main)]/20">
    <div className="w-20 h-20 rounded-xl bg-[var(--status-error)]/10 flex items-center justify-center text-[var(--status-error)] mb-6 border border-[var(--status-error)]/20">
      <AlertTriangle size={36} />
    </div>
    <h3 className="text-lg font-black text-[var(--text-main)]">Không thể tải dữ liệu</h3>
    <p className="text-[14px] text-[var(--text-secondary)] mt-2 max-w-xs leading-relaxed">Đơn hàng không tồn tại hoặc đã bị gỡ khỏi hệ thống. Vui lòng kiểm tra lại.</p>
    <button
      onClick={onRetry}
      className="mt-6 px-6 py-2 bg-[var(--brand-primary)] text-white rounded-lg text-[13px] font-bold hover:opacity-90 transition-all active:scale-95"
    >
      THỬ LẠI
    </button>
  </div>
);