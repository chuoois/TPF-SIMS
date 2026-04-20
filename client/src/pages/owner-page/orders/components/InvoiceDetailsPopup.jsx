import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  X, Package, Calendar, User, Phone, MapPin,
  Clock, CheckCircle, CheckCircle2, AlertTriangle, Hammer,
  Camera, FileText, Ban, RefreshCw,
  Trash2, Lock,
  Paintbrush, RotateCcw, ChevronRight, Eye, AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";
import { MOCK_ORDERS_DETAILED, INITIAL_ORDERS } from "../mockData";


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
        {o.customer.name.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-bold truncate text-[var(--text-main)]">{o.customer.name}</p>
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
          <p className="text-[13px] font-semibold mt-0.5 text-[var(--text-main)]">{o.code}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-placeholder)]">Loại hàng</p>
          <p className="text-[13px] font-semibold mt-0.5 text-[var(--text-main)]">{o.type}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-placeholder)]">Nhân viên</p>
          <p className="text-[13px] font-semibold mt-0.5 text-[var(--text-main)]">{o.salesPerson}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-placeholder)]">Ngày tạo</p>
          <p className="text-[13px] font-semibold mt-0.5 text-[var(--text-main)]">{fmtDateTime(o.date)}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-placeholder)]">Ngày giao</p>
          <p className="text-[13px] font-semibold mt-0.5 text-[var(--text-main)]">{fmtDate(o.deliveryDate)}</p>
        </div>
        <div className="md:col-span-1">
          <p className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-placeholder)]">Ghi chú</p>
          <p className="text-[13px] font-semibold mt-0.5 text-[var(--text-main)]">{o.notes || "—"}</p>
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
      {o.timeline?.map((t, idx) => (
        <div key={idx} className="relative pl-1">
          <div
            className={`absolute top-1 left-[-21px] w-4 h-4 rounded-full border-2 bg-[var(--background)] flex items-center justify-center z-10 transition-colors ${t.active ? "border-[var(--brand-primary)] shadow-[0_0_8px_rgba(52,176,87,0.3)]" : "border-[var(--grid-border)]"
              }`}
          >
            {t.active && <div className="w-1.5 h-1.5 rounded-full bg-[var(--brand-primary)]" />}
          </div>
          <div className="flex items-start justify-between min-w-0">
            <div className="min-w-0">
              <p className={`text-[13px] font-bold ${t.active ? "text-[var(--text-main)]" : "text-[var(--text-placeholder)]"}`}>
                {t.label}
              </p>
              <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">{t.desc}</p>
            </div>
            <span className="text-[10px] font-bold text-[var(--text-placeholder)] shrink-0 ml-4">
              {t.time}
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
  // New props from parent
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
    return productions.every(p => p.status === "Hoàn thành");
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
            <p className="text-[10px] font-black text-[var(--sidebar-foreground)]/50 uppercase tracking-widest">Lịch trình</p>
            <p className="text-[13px] font-bold">
              <span className="text-[var(--sidebar-foreground)]/40">Giao:</span> {o.deliveryDate ? new Date(o.deliveryDate).toLocaleDateString("vi-VN") : "Chưa hẹn"}
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
          { id: "products", label: `Sản phẩm (${o.products.length})`, icon: Package },
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
                      <span className="text-[12px] font-black uppercase tracking-tight">Yêu cầu đặc biệt từ khách</span>
                    </div>
                    <p className="text-[14px] text-[var(--text-main)] italic opacity-80 leading-relaxed">
                      "{o.customRequirements || "Khách yêu cầu làm kỹ phần đục chạm, đánh nhám kỹ trước khi lót. Chân quỳ đặc."}"
                    </p>
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
                      <div className="relative h-56 bg-[var(--status-warning)]/5 group cursor-pointer overflow-hidden border-l border-[var(--grid-border)]" onClick={() => p.customerSampleImage && onPreview(p.customerSampleImage)}>
                        {p.customerSampleImage ? (
                          <img src={p.customerSampleImage} alt="Mẫu khách" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[var(--status-warning)]/20"><Camera size={48} /></div>
                        )}
                        <div className="absolute top-4 right-4 px-2.5 py-1 bg-[var(--status-pending)]/80 backdrop-blur-md rounded border border-[var(--status-pending)]/30">
                          <span className="text-[9px] font-black text-white uppercase tracking-widest">Mẫu khách</span>
                        </div>
                      </div>
                    </div>
                    {/* Info */}
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <h4 className="text-[18px] font-black text-[var(--text-main)] leading-tight">{p.name}</h4>
                          <span className="mt-2 inline-block px-2 py-0.5 rounded bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] text-[11px] font-black uppercase">x{p.qty} {p.unit}</span>
                        </div>
                        <p className="text-[20px] font-black text-[var(--text-main)] ml-4">{fmtCurrency(p.price)}</p>
                      </div>
                      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-[var(--bg-main)] rounded-xl">
                        {[
                          { label: "Chất liệu", val: p.material },
                          { label: "Kích thước", val: p.size },
                          { label: "Hoàn thiện", val: p.finish },
                          { label: "Bảo hành", val: `${p.warranty || 12}T` },
                        ].map((spec, i) => (
                          <div key={i} className="space-y-1">
                            <span className="text-[9px] font-black text-[var(--text-placeholder)] uppercase tracking-widest block">{spec.label}</span>
                            <p className="text-[12px] font-bold text-[var(--text-secondary)]">{spec.val || "—"}</p>
                          </div>
                        ))}
                      </div>
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
                  { icon: Calendar, label: "Ngày hẹn", val: fmtDate(o.deliveryDate) },
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
  "Tiếp nhận": { label: "Tiếp nhận", bg: "var(--palette-blue)/10", text: "var(--palette-dark-blue)", border: "var(--palette-blue)/20", icon: Package },
  "Đang đánh giấy ráp": { label: "Tiếp nhận", bg: "var(--palette-blue)/10", text: "var(--palette-dark-blue)", border: "var(--palette-blue)/20", icon: Package },
  "Đang sơn": { label: "Tiếp nhận", bg: "var(--palette-blue)/10", text: "var(--palette-dark-blue)", border: "var(--palette-blue)/20", icon: Package },
  "Chờ nghiệm thu": { label: "Nghiệm thu", bg: "var(--status-warning)/10", text: "var(--palette-orange)", border: "var(--status-warning)/20", icon: Camera },
  "Hoàn thành": { label: "Hoàn thành", bg: "var(--status-success)/10", text: "var(--brand-primary)", border: "var(--status-success)/20", icon: CheckCircle2 },
};

const STEP_LABELS = [
  { key: "Tiếp nhận", icon: Package },
  { key: "Nghiệm thu", icon: Camera },
  { key: "Hoàn thành", icon: CheckCircle2 },
];

function getItemStep(item) {
  if (item.status === "Hoàn thành" || item.status === "COMPLETED") return 3;
  if (item.isPendingApproval || item.status === "Chờ nghiệm thu" || item.status === "OWNER_PENDING" || item.status === "QC_PENDING") return 2;
  return 1;
}

function ProdItemRow({ item, onInspect }) {
  const cfg = PROD_STATUS_CFG[item.isPendingApproval ? "Chờ nghiệm thu" : item.status]
    || { label: item.status, bg: "var(--bg-main)", text: "var(--text-placeholder)", border: "var(--grid-border)", icon: Package };
  const step = getItemStep(item);
  const needsKCS = item.isPendingApproval || item.status === "Chờ nghiệm thu";

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
        <div className="h-12 w-12 rounded-lg overflow-hidden shrink-0 border border-[var(--grid-border)]/50 bg-[var(--bg-main)] relative">
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
                {item.expectedEndDate ? new Date(item.expectedEndDate).toLocaleDateString("vi-VN") : "—"}
              </p>
            </div>
            {item.quantityPlanned > 1 && (
              <div>
                <p className="text-[9px] font-black text-[var(--text-placeholder)] uppercase tracking-wider">Số lượng</p>
                <p className="text-[12px] font-bold text-[var(--brand-primary)]">{item.quantityCompleted}/{item.quantityPlanned} sp</p>
              </div>
            )}
          </div>
        </div>/

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
              {i < 2 && (
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

function ProductionProgressCard({ order, onInspect, onRedoRequest, productions }) {
  const updateProductionInLocal = (itemId, updates) => {
    try {
      const saved = JSON.parse(localStorage.getItem("tpf_simulated_productions") || "[]");
      const index = saved.findIndex(p => p.id === itemId);
      if (index !== -1) {
        saved[index] = { ...saved[index], ...updates };
        localStorage.setItem("tpf_simulated_productions", JSON.stringify(saved));
        window.dispatchEvent(new Event("storage"));
      }
    } catch (e) { console.error(e); }
  };

  if (productions.length === 0) return null;

  const total = productions.length;
  const completed = productions.filter(p => p.status === "Hoàn thành").length;
  const hasPendingKCS = productions.some(p => p.isPendingApproval || p.status === "Chờ nghiệm thu");
  const progress = Math.round((completed / total) * 100);

  return (
    <div className="rounded-lg overflow-hidden bg-white border border-[var(--grid-border)] printer-hidden">
      <div className="px-5 py-3 flex items-center justify-between gap-2 border-b border-[var(--grid-border)]/50 bg-[var(--grid-header-bg)]">
        <div className="flex items-center gap-2">
          <Hammer size={14} className="text-[var(--status-pending)]" />
          <span className="text-[12px] font-bold uppercase tracking-wider text-[var(--status-pending)]">Tiến độ gia công</span>
          {hasPendingKCS && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--status-success)]/10 text-[var(--status-success)] text-[9px] font-black uppercase">
              <Camera size={9} /> Chờ nghiệm thu
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-20 h-1.5 bg-[var(--bg-main)] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: progress === 100 ? "var(--status-success)" : "var(--status-warning)" }} />
            </div>
            <span className="text-[10px] font-black text-[var(--text-placeholder)]">{completed}/{total}</span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {productions.map(item => (
          <ProdItemRow
            key={item.id}
            item={item}
            onInspect={onInspect}
            onUpdate={updateProductionInLocal}
          />
        ))}
      </div>

      <div className="px-5 py-2 border-t border-[var(--grid-border)]/50 flex items-center justify-between">
        <p className="text-[10px] text-[var(--text-placeholder)] italic">* Tiến độ được thợ xưởng cập nhật trực tiếp</p>
        <p className="text-[9px] font-bold text-[var(--brand-primary)]/50 uppercase">PRODUCTION TRACKER</p>
      </div>
    </div>
  );
}
export default function InvoiceDetailsPopup({ invoiceId, isOpen, onClose, onStatusChanged }) {
  const [viewState, setViewState] = useState("loading");
  const [order, setOrder] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [deliveryImage, setDeliveryImage] = useState(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [finalPayment, setFinalPayment] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("Chuyển khoản");

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

  const syncProductions = useCallback((orderData) => {
    if (!orderData) return;
    try {
      const saved = JSON.parse(localStorage.getItem("tpf_simulated_productions") || "[]");
      const filtered = saved.filter(p => p.orderId === orderData.id || p.orderCode === orderData.code);
      setProductions(filtered);
    } catch (e) { }
  }, []);

  useEffect(() => {
    if (isOpen && order) {
      syncProductions(order);
      window.addEventListener("storage", () => syncProductions(order));
      // Poll every 2s for local changes that don't trigger storage event
      const interval = setInterval(() => syncProductions(order), 2000);
      return () => {
        window.removeEventListener("storage", () => syncProductions(order));
        clearInterval(interval);
      };
    }
  }, [isOpen, order, syncProductions]);

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
        found = INITIAL_ORDERS.find(o => o.id === invoiceId || o.code === invoiceId);
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

  useEffect(() => {
    if (showCompleteModal && order) {
      const calculatedTotal = order.products.reduce((acc, p) => acc + (p.price || 0) * p.qty, 0);
      const displayTotal = order.total != null ? order.total : calculatedTotal;
      const rem = displayTotal + (order.processingFee || 0) - (order.discount || 0) - (order.deposit || 0);
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

  const lastActiveStatus = useMemo(() => {
    if (!order?.timeline) return "Chờ xử lý";
    const cancelIdx = order.timeline.findIndex(t => t.label.includes("Yêu cầu hủy") || t.label.includes("Chờ duyệt hủy"));
    if (cancelIdx > 0) return order.timeline[cancelIdx - 1]?.label || "Đang xử lý";
    return order.status;
  }, [order?.timeline, order?.status]);

  const hasProduction = order?.productionOrders && order.productionOrders.length > 0;
  const isStarted = ["Đang sản xuất", "Đã nhập kho", "Đang gia công", "Chờ giao hàng"].includes(lastActiveStatus) || hasProduction;
  const isRefundBlocked = isStarted;

  const handleUpdate = (newStatus, extraData = {}) => {
    const saved = JSON.parse(localStorage.getItem("tpf_simulated_orders") || "[]");
    let target = { ...order, status: newStatus, ...extraData };

    if (newStatus === "Đơn đã hủy" && extraData.depositResolution === "forfeited") {
      convertCancelledToStock(target);
    }

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} — ${now.toLocaleDateString("vi-VN")}`;

    let label = `Cập nhật: ${newStatus}`;
    let desc = `Trạng thái được cập nhật bởi Chủ cửa hàng.`;

    if (extraData.timelineLabel) label = extraData.timelineLabel;
    if (extraData.timelineDesc) desc = extraData.timelineDesc;

    const newEntry = { time: timeStr, label, desc, active: true };
    target.timeline = [...(target.timeline || []), newEntry];

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
      paymentStatus: isFullPayment ? "full" : "partial",
      timelineLabel: "Hoàn tất đơn hàng",
      timelineDesc: isFullPayment
        ? "Khách hàng đã nhận đủ sản phẩm và thanh toán hoàn tất. Kích hoạt bảo hành."
        : `Khách nhận hàng & thanh toán một phần. Ghi nợ: ${fmtCurrency(debtAmount)}. Kích hoạt bảo hành.`
    });
    setShowCompleteModal(false);
  };

  const handleHandoverConfirm = () => {
    const newStatus = "Đang gia công";

    const updatedProducts = order.products.map((p, idx) => ({
      ...p,
      finishingDays: handoverItemsData[idx]?.days || "",
      deadline: handoverItemsData[idx]?.deadline || handoverDeadline
    }));

    const finalDeadlines = updatedProducts.map(p => p.deadline).filter(d => !!d);
    const maxDeadline = finalDeadlines.length > 0
      ? new Date(Math.max(...finalDeadlines.map(d => new Date(d)))).toISOString().split('T')[0]
      : handoverDeadline;

    const deadlineStr = maxDeadline ? new Date(maxDeadline).toLocaleDateString("vi-VN") : "Chưa xác định";

    // Create production items for each product
    try {
      const savedProds = JSON.parse(localStorage.getItem("tpf_simulated_productions") || "[]");
      const newProds = updatedProducts.map((p, idx) => ({
        id: `PROD-${order.code}-${idx + 1}-${Date.now()}`,
        orderId: order.id || order.code,
        orderCode: order.code,
        productName: p.name,
        assignedWorker: "Chưa giao",
        status: "Đang đánh giấy ráp",
        isPendingApproval: false,
        expectedEndDate: p.deadline || maxDeadline,
        quantityPlanned: p.qty || 1,
        quantityCompleted: 0,
        productImage: p.image || "https://dogomynghenamtuan.com/wp-content/uploads/2020/07/sap-tho-tu-linh-go-mit-moc.jpg",
        workerNotes: "Bàn giao gia công sản xuất mới."
      }));
      localStorage.setItem("tpf_simulated_productions", JSON.stringify([...savedProds, ...newProds]));
    } catch (e) { console.error(e); }

    handleUpdate(newStatus, {
      products: updatedProducts,
      worker_deadline: maxDeadline,
      handover_notes: handoverNotes,
      handover_checklist: {
        approved_at: new Date().toISOString(),
        notes: handoverNotes,
        deadline: maxDeadline,
      },
      timelineLabel: "Bàn giao gia công",
      timelineDesc: `Bàn giao ${updatedProducts.length} món. Hạn (muộn nhất): ${deadlineStr}.`
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

        {viewState === "ready" && order && (
          <div className="p-4 border-t border-[var(--grid-border)]/50 bg-[var(--bg-main)]/50 flex items-center justify-end shrink-0 popup-footer printer-hidden">
            <div className="flex items-center gap-3">
              {/* ── Hàng mộc & Hàng khách đặt: bàn giao xưởng ── */}
              {order.status === "Chờ xử lý" && (order.type === "Hàng mộc" || order.type === "Hàng khách đặt") && (
                <button
                  className="px-5 py-2 bg-[var(--brand-primary)] text-white rounded-lg text-[13px] font-bold hover:opacity-90 transition-all active:scale-95 flex items-center gap-2"
                  onClick={() => setShowHandoverModal(true)}
                >
                  <Hammer size={16} /> BÀN GIAO XƯỞNG
                </button>
              )}

              {order.status === "Đang gia công" && (order.type === "Hàng mộc" || order.type === "Hàng khách đặt") && (
                <button
                  disabled={productions.length > 0 && !productions.every(p => p.status === "Hoàn thành")}
                  className={`h-10 px-5 rounded-lg text-[13px] font-bold transition-all active:scale-95 flex items-center gap-2 ${productions.length > 0 && !productions.every(p => p.status === "Hoàn thành")
                    ? "bg-[var(--text-placeholder)]/20 text-[var(--text-placeholder)] cursor-not-allowed"
                    : "bg-[var(--status-success)] text-[var(--primary-foreground)] hover:opacity-90"
                    }`}
                  onClick={() => {
                    if (window.confirm("Xác nhận sản phẩm đã hoàn thiện và sẵn sàng để giao?")) {
                      handleUpdate("Chờ giao hàng");
                    }
                  }}
                  title={productions.length > 0 && !productions.every(p => p.status === "Hoàn thành") ? "Chờ thợ hoàn thiện 100% các món hàng" : ""}
                >
                  {productions.length > 0 && !productions.every(p => p.status === "Hoàn thành") ? <Clock size={16} /> : <CheckCircle size={16} />}
                  {productions.length > 0 && !productions.every(p => p.status === "Hoàn thành") ? "CHỜ XƯỞNG HOÀN THIỆN" : "HOÀN TẤT GIA CÔNG"}
                </button>
              )}

              {order.status === "Chờ giao hàng" && (
                <button
                  className="px-5 py-2 bg-[var(--palette-blue)] text-white rounded-lg text-[13px] font-bold hover:opacity-90 transition-all active:scale-95 flex items-center gap-2"
                  onClick={() => handleUpdate("Đang giao hàng")}
                >
                  <RefreshCw size={16} /> BẮT ĐẦU GIAO
                </button>
              )}

              {order.status === "Đang giao hàng" && (
                <button
                  className="px-5 py-2 bg-[var(--status-success)] text-white rounded-lg text-[13px] font-bold hover:opacity-90 transition-all active:scale-95 flex items-center gap-2"
                  onClick={() => setShowCompleteModal(true)}
                >
                  <CheckCircle size={16} /> HOÀN TẤT ĐƠN
                </button>
              )}

              {order.status === "Chờ duyệt hủy" && (
                <div className="flex gap-2 p-1 bg-[var(--background)] border border-[var(--grid-border)]/50 rounded-xl">
                  <button
                    disabled={["Đang sản xuất", "Đang gia công", "Chờ giao hàng"].includes(lastActiveStatus) || (order.productionOrders?.length > 0)}
                    className="px-6 py-2.5 bg-[var(--bg-main)] text-[var(--text-secondary)] rounded-lg text-[13px] font-bold hover:bg-[var(--grid-border)]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center gap-2"
                    onClick={() => {
                      if (window.confirm("Duyệt hủy đơn và HOÀN TRẢ TIỀN CỌC cho khách hàng?")) {
                        handleUpdate("Đơn đã hủy", {
                          depositResolution: "refunded",
                          timelineLabel: "Duyệt đơn hủy (Hoàn cọc)",
                          timelineDesc: "Đơn bị hủy khi chưa triển khai. Chủ cửa hàng đã đồng ý hoàn trả 100% tiền cọc."
                        });
                      }
                    }}
                  >
                    {["Đang sản xuất", "Đang gia công", "Chờ giao hàng"].includes(lastActiveStatus) ? <Lock size={16} /> : <RefreshCw size={16} />}
                    DUYỆT & HOÀN CỌC
                  </button>
                  <button
                    className="px-6 py-2.5 bg-[var(--palette-orange)] text-white rounded-lg text-[13px] font-bold hover:opacity-90 transition-all active:scale-95 flex items-center gap-2"
                    onClick={() => {
                      const recoveryAmt = order.deposit || 0;
                      const msg = recoveryAmt > 0
                        ? `Thu hồi ${fmtCurrency(recoveryAmt)} cọc & Nhập lại kho?`
                        : `Hủy đơn & Nhập lại kho?`;
                      if (window.confirm(msg)) {
                        handleUpdate("Đơn đã hủy", {
                          depositResolution: "forfeited",
                          timelineLabel: "Duyệt đơn hủy (Thu cọc)",
                          timelineDesc: `Quyết định của Chủ: Thu hồi ${recoveryAmt} cọc bồi thường chi phí. Tự động nhập kho món hàng sẵn/mộc.`
                        });
                      }
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
                  <label className="text-[11px] font-black text-[var(--text-placeholder)] uppercase tracking-widest ml-1">Hình thức thanh toán</label>
                  <div className="grid grid-cols-2 gap-2 mt-1.5">
                    {["Chuyển khoản", "Tiền mặt"].map(m => (
                      <button
                        key={m}
                        onClick={() => setPaymentMethod(m)}
                        className={`py-2 px-4 rounded-lg border font-bold text-[13px] transition-all ${paymentMethod === m ? 'bg-[var(--brand-primary)] border-[var(--brand-primary)] text-[var(--primary-foreground)]' : 'bg-[var(--background)] border-[var(--grid-border)] text-[var(--text-secondary)] hover:bg-[var(--grid-header-bg)]'
                          }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-black text-[var(--text-placeholder)] uppercase tracking-widest ml-1">Ảnh giao hàng thực tế</label>
                  <label className={`mt-2 w-full h-24 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${deliveryImage ? 'border-[var(--status-success)] bg-[var(--status-success)]/5' : 'border-[var(--grid-border)] bg-[var(--bg-main)] hover:bg-[var(--grid-border)]/10'
                    }`}>
                    {deliveryImage ? (
                      <img src={deliveryImage} className="h-20 w-auto rounded-lg object-cover" alt="Delivery" />
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-[var(--text-placeholder)]">
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
                    BÀN GIAO GIA CÔNG XƯỞNG SƠN
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
                <div className="px-3 py-1.5 bg-[var(--status-focus)] border border-[var(--brand-primary)]/10 rounded-full flex items-center gap-2">
                  <Hammer size={12} className="text-[var(--brand-primary)]" />
                  <span className="text-[11px] font-bold text-[var(--brand-primary)] uppercase tracking-wider">
                    Xưởng Sơn Hoàn Thiện
                  </span>
                </div>
              </div>

              {/* Product List Section */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-widest px-1">
                  1. Danh sách sản phẩm & Hạn hoàn thiện
                </h4>
                {order?.products?.map((p, idx) => {
                  const itemData = handoverItemsData[idx] || { unitLabor: 0, days: "0", deadline: "" };
                  return (
                    <div
                      key={idx}
                      className="bg-white border border-[var(--grid-border)] rounded-lg p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-[var(--bg-main)] border border-[var(--grid-border)] shrink-0">
                          <img
                            src={p.image || "/api/placeholder/400/320"}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0 grid grid-cols-12 gap-8 items-center">
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
                          </div>

                          {/* Deadline Input */}
                          <div className="col-span-5">
                            <p className="text-[9px] font-bold text-[var(--text-placeholder)] uppercase tracking-tight mb-1 ml-1">
                              Hạn xong SP
                            </p>
                            <div className="relative">
                              <input
                                type="date"
                                className="w-full pl-8 pr-2 py-1.5 bg-white border border-[var(--grid-border)] rounded-lg font-bold text-[11px] text-[var(--text-main)] focus:border-[var(--brand-primary)] outline-none transition-all"
                                value={itemData.deadline || ""}
                                onChange={(e) => {
                                  const newData = [...handoverItemsData];
                                  newData[idx] = { ...itemData, deadline: e.target.value };
                                  setHandoverItemsData(newData);
                                }}
                              />
                              <Calendar
                                size={12}
                                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-placeholder)]"
                              />
                            </div>
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

            <div className="p-6 bg-[var(--grid-header-bg)] border-t border-[var(--grid-border)] shrink-0 flex items-center justify-end">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowHandoverModal(false)}
                  className="px-6 py-2.5 rounded-lg border border-[var(--grid-border)] text-[13px] font-bold text-[var(--text-secondary)] hover:bg-white transition-all cursor-pointer"
                >
                  Bỏ qua
                </button>
                <button
                  onClick={handleHandoverConfirm}
                  className="px-8 py-2.5 bg-[var(--brand-primary)] hover:opacity-90 text-white rounded-lg font-bold text-[13px] transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  Xác nhận bàn giao
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
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
                    updateProductionInLocal(inspectItem.id, {
                      status: "Hoàn thành",
                      isPendingApproval: false,
                      quantityCompleted: inspectItem.quantityPlanned
                    });
                    toast.success("Đã nghiệm thu thành công sản phẩm!");
                    setInspectItem(null);
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
                    updateProductionInLocal(redoItem.id, {
                      status: "Đang sơn",
                      isPendingApproval: false,
                      needsRedo: true,
                      redoNote: redoNote
                    });
                    toast.success("Đã gửi yêu cầu sửa lại cho thợ!");
                    setRedoItem(null);
                    setRedoNote("");
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
    </div>
  );
}

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
