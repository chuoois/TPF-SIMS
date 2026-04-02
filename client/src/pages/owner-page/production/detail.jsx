import { useState, useMemo, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { PageHelmet } from "@/components/seo/PageHelmet";
import toast from "react-hot-toast";
import { MOCK_PRODUCTIONS, STAGES } from "./mockData";
import {
  ArrowLeft,
  Package,
  Calendar,
  Clock,
  Hammer,
  User,
  CheckCircle,
  UserPlus,
  ClipboardList,
  Paintbrush,
  Wrench,
  ChevronRight,
  X,
  Camera,
  AlertTriangle,
  RotateCcw,
  Star,
  FileText,
  Eye,
} from "lucide-react";

// ===================== HELPERS =====================
const fmtDate = (s) => (s ? new Date(s).toLocaleDateString("vi-VN") : "Chưa xác định");

const fmtDateTime = (s) => {
  if (!s) return "—";
  const d = new Date(s);
  return `${d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} — ${d.toLocaleDateString("vi-VN")}`;
};

const getStatusColor = (status, subStage = null, isPendingApproval = false, needsRedo = false) => {
  const displayStatus = isPendingApproval ? "Chờ duyệt" : status;

  const primaryBadge = {
    "Đánh giấy ráp": { label: "Đánh giấy ráp", bg: "#FDF4FF", text: "#A21CAF", border: "#F5D0FE" },
    "Đang sơn": { label: "Đang sơn", bg: "#E0F2FE", text: "#0369A1", border: "#BAE6FD" },
    "Chờ duyệt": { label: "Chờ duyệt", bg: "#FEF3C7", text: "#D97706", border: "#FDE68A" },
    "Hoàn thành": { label: "Hoàn thành", bg: "#F0FDF4", text: "#166534", border: "#BBF7D0" },
  }[displayStatus] || { label: displayStatus, bg: "#F3F4F6", text: "#6B7280", border: "#E5E7EB" };

  let detailBadge = null;
  if (isPendingApproval && status === "Đang sơn") {
    detailBadge = { label: "Chờ duyệt", bg: "#EFF6FF", text: "#1D4ED8", border: "#DBEAFE" };
  } else if (needsRedo && status === "Đang sơn") {
    detailBadge = { label: "Sửa lại", bg: "#FEF2F2", text: "#EF4444", border: "#FEE2E2" };
  }

  return { primaryBadge, detailBadge };
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

const SpecItem = ({ label, value }) => (
  <div>
    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-tight">{label}</p>
    <p className="text-[12px] font-bold text-gray-800 break-words line-clamp-2" title={value}>{value || "—"}</p>
  </div>
);

const PhotoCardSmall = ({ url }) => (
  <div className="group relative aspect-square rounded-xl overflow-hidden bg-gray-50 border border-gray-100 transition hover:shadow-md cursor-pointer">
    <img src={url} alt="Sample" className="w-full h-full object-cover transition duration-300 group-hover:scale-110" />
    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
      <div className="w-6 h-6 rounded-full bg-white/90 text-gray-900 flex items-center justify-center shadow-sm">
        <Eye size={12} />
      </div>
    </div>
  </div>
);

const PhotoCard = ({ url, time, stage, isDesign = false }) => (
  <div className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-100 transition hover:shadow-lg">
    <img src={url} alt="Progress" className="w-full h-full object-cover transition duration-300 group-hover:scale-110" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2.5">
      {isDesign ? (
        <span className="text-[10px] font-bold text-white uppercase bg-emerald-600 self-start px-2 py-0.5 rounded-full mb-1">Thiết kế</span>
      ) : (
        <div className="flex items-center gap-1.5 mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-[10px] font-bold text-white uppercase">{stage}</span>
        </div>
      )}
      <p className="text-[10px] text-gray-200">{time || "Bản vẽ kỹ thuật"}</p>
    </div>
    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <button className="w-7 h-7 rounded-full bg-white/90 text-gray-900 flex items-center justify-center shadow-md hover:bg-white active:scale-95 transition">
        <Camera size={14} />
      </button>
    </div>
  </div>
);

// ── STEP PROGRESS COMPONENT ──
const StageProgress = ({ currentStage, status, isRaw }) => {
  const currentIdx = STAGES.findIndex((s) => s.key === currentStage);
  const isDone = status === "Hoàn thành";

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ backgroundColor: "var(--background)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
    >
      <div
        className="px-5 py-3 flex items-center gap-2"
        style={{ borderBottom: "1px solid var(--grid-border)", backgroundColor: "var(--grid-header-bg)" }}
      >
        <Hammer size={14} style={{ color: "var(--brand-primary)" }} />
        <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: "var(--text-main)" }}>
          Công đoạn sản xuất
        </span>
      </div>
      <div className="px-6 py-6">
        {/* All steps in one array for unified rendering */}
        {(() => {
          const allSteps = [
            ...STAGES.map((s) => ({ ...s, type: "stage" })),
            { key: "done", label: "Hoàn thành", icon: CheckCircle, color: "#15803D", bg: "#F0FDF4", type: "final" },
          ];

          return (
            <div className="flex items-start">
              {allSteps.map((step, i) => {
                const Icon = step.icon;
                const stageIdx = STAGES.findIndex((s) => s.key === step.key);
                const isCompleted = isDone || (step.type === "stage" && stageIdx < currentIdx);
                const isCurrent = !isDone && step.type === "stage" && stageIdx === currentIdx;
                const isFinalDone = isDone && step.type === "final";
                const isActive = isCompleted || isCurrent || isFinalDone;

                return (
                  <div key={step.key} className="flex items-start" style={{ flex: i < allSteps.length - 1 ? 1 : "0 0 auto" }}>
                    {/* Step node */}
                    <div className="flex flex-col items-center" style={{ width: 72 }}>
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center relative"
                        style={{
                          backgroundColor: (isCompleted || isFinalDone) ? "#F0FDF4" : isCurrent ? step.bg : "#F9FAFB",
                          border: `2px solid ${(isCompleted || isFinalDone) ? "#15803D" : isCurrent ? step.color : "#E5E7EB"}`,
                          boxShadow: isCurrent ? `0 0 0 4px ${step.bg}` : "none",
                        }}
                      >
                        {isCompleted || isFinalDone ? (
                          <CheckCircle size={20} style={{ color: "#15803D" }} />
                        ) : (
                          <Icon size={20} style={{ color: isCurrent ? step.color : "#9CA3AF" }} />
                        )}
                        {isCurrent && (
                          <span
                            className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full animate-pulse"
                            style={{ backgroundColor: step.color, border: "2px solid #fff" }}
                          />
                        )}
                      </div>
                      <p
                        className="text-[11px] font-bold mt-2 whitespace-nowrap"
                        style={{ color: (isCompleted || isFinalDone) ? "#15803D" : isCurrent ? step.color : "#9CA3AF" }}
                      >
                        {step.label}
                      </p>
                      <p className="text-[10px] mt-0.5" style={{ color: "var(--text-placeholder)" }}>
                        {(isCompleted || isFinalDone) ? "✓ Đã xong" : isCurrent ? "● Đang làm" : (isRaw && step.key === "gia_cong_moc") ? "✓ Mộc có sẵn" : "○ Chờ"}
                      </p>
                    </div>

                    {/* Connector */}
                    {i < allSteps.length - 1 && (
                      <div className="flex items-center flex-1 mt-5 px-1">
                        <div
                          className="h-0.5 flex-1 rounded"
                          style={{ backgroundColor: isCompleted ? "#15803D" : "#E5E7EB" }}
                        />
                        <ChevronRight
                          size={14}
                          className="shrink-0 -ml-0.5"
                          style={{ color: isCompleted ? "#15803D" : "#D1D5DB" }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>
    </div>
  );
};

// ===================== MAIN COMPONENT =====================
export default function ProductionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Shared productions state
  const [productions, setProductions] = useState(() => {
    try {
      const saved = localStorage.getItem("tpf_simulated_productions");
      const parsed = saved ? JSON.parse(saved) : null;
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      console.error("Error loading productions from localStorage", e);
    }
    return Object.values(MOCK_PRODUCTIONS);
  });

  useEffect(() => {
    localStorage.setItem("tpf_simulated_productions", JSON.stringify(productions));
  }, [productions]);

  const p = useMemo(() => {
    if (!Array.isArray(productions)) return Object.values(MOCK_PRODUCTIONS)[0];
    return productions.find(item => item.id === id) || productions[0];
  }, [productions, id]);

  // UI States
  const [showRedoModal, setShowRedoModal] = useState(false);
  const [showDelayModal, setShowDelayModal] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [newDeadline, setNewDeadline] = useState("");

  const sc = getStatusColor(p.status, p.subStage, p.isPendingApproval, p.needsRedo);
  const progress = p.quantityPlanned > 0 ? Math.round((p.quantityCompleted / p.quantityPlanned) * 100) : 0;
  const isProducing = p.status === "Đang sơn" || p.status === "Đánh giấy ráp" || p.status === "Đang đánh giấy ráp";
  const isDone = p.status === "Hoàn thành";
  const isHold = false;

  const currentStageInfo = STAGES.find((s) => s.key === p.subStage);
  const currentStageIdx = STAGES.findIndex((s) => s.key === p.subStage);
  const isLastStage = currentStageIdx === STAGES.length - 1;

  // Handlers
  const updateProduction = (updates) => {
    setProductions(prev => prev.map(item => item.id === p.id ? { ...item, ...updates } : item));
  };

  const handleOwnerApprove = () => {
    updateProduction({ status: "Hoàn thành", isPendingApproval: false, quantityCompleted: p.quantityPlanned });
    toast.success(`Đơn hàng ${p.orderCode || p.code} đã hoàn thành xuất sắc!`);
    setTimeout(() => navigate("/owner/production"), 1000);
  };

  const handleRedo = (reason, backToStage) => {
    updateProduction({
      needsRedo: true,
      isPendingApproval: false,
      redoReason: reason,
      subStage: backToStage
    });
    toast.error(`Đã yêu cầu sửa lại: ${reason}.`);
    setShowRedoModal(false);
  };

  const handleDelaySubmit = () => {
    if (!newDeadline) {
      toast.error("Vui lòng chọn ngày giao mới!");
      return;
    }
    updateProduction({ expectedEndDate: newDeadline, isDelayed: true });
    setShowDelayModal(false);
    toast.success(`Đã gia hạn tiến độ thành công.`);
  };

  return (
    <>
      <PageHelmet title={`${p.orderCode || p.code} | Chi tiết sản xuất`} />

      <div className="flex flex-col h-full -m-6" style={{ backgroundColor: "var(--bg-main)" }}>
        {/* ═══════ STICKY HEADER ═══════ */}
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
                to="/owner/production"
                className="w-8 h-8 rounded-xl flex items-center justify-center transition hover:opacity-70"
                style={{ color: "var(--text-secondary)", border: "1px solid var(--grid-border)" }}
              >
                <ArrowLeft size={15} />
              </Link>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-[16px] font-bold" style={{ color: "var(--text-main)" }}>{p.orderCode || p.code}</h1>
                  <Badge style={{ backgroundColor: sc.primaryBadge.bg, color: sc.primaryBadge.text, border: `1px solid ${sc.primaryBadge.border}` }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sc.primaryBadge.text }} />
                    {sc.primaryBadge.label}
                  </Badge>
                  {sc.detailBadge && (
                    <Badge style={{ backgroundColor: sc.detailBadge.bg, color: sc.detailBadge.text, border: `1px solid ${sc.detailBadge.border}` }}>
                      {sc.detailBadge.label}
                    </Badge>
                  )}
                  {p.isDelayed && (
                    <Badge style={{ backgroundColor: "#FEF2F2", color: "#DC2626", border: "1px solid #FCA5A5" }}>
                      <AlertTriangle size={10} />
                      Báo chậm
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] mt-0.5" style={{ color: "var(--text-placeholder)" }}>
                  Khách hàng: {p.customerName}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              {p.isPendingApproval && p.status === "Đang sơn" && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowRedoModal(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold transition hover:opacity-90 cursor-pointer border shadow-sm"
                    style={{ backgroundColor: "#fff", color: "#EF4444", borderColor: "#FCA5A5" }}
                  >
                    <RotateCcw size={14} />
                    Yêu cầu sửa lại
                  </button>
                  <button
                    onClick={handleOwnerApprove}
                    className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-[13px] font-bold transition hover:bg-emerald-700 cursor-pointer shadow-xl"
                    style={{ backgroundColor: "#10B981", color: "#fff" }}
                  >
                    <CheckCircle size={18} />
                    Duyệt & Hoàn thành
                  </button>
                </div>
              )}

              {p.isDelayed && (
                <button
                  onClick={() => {
                    setNewDeadline(p.expectedEndDate || "");
                    setShowDelayModal(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold transition hover:bg-red-600 cursor-pointer shadow-xl border border-red-200"
                  style={{ backgroundColor: "#FEF2F2", color: "#DC2626" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#DC2626";
                    e.currentTarget.style.color = "#FFF";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#FEF2F2";
                    e.currentTarget.style.color = "#DC2626";
                  }}
                >
                  <Calendar size={14} />
                  Xử lý chậm
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ═══════ SCROLLABLE CONTENT ═══════ */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">

          {/* ── BANNERS ── */}
          {p.isDelayed && (
            <div
              className="flex items-start gap-3 p-4 rounded-2xl animate-[shake_0.5s_ease-in-out] shadow-sm"
              style={{ backgroundColor: "#FEF2F2", border: "1px solid #FCA5A5" }}
            >
              <AlertTriangle size={18} className="shrink-0 mt-0.5" style={{ color: "#EF4444" }} />
              <div>
                <p className="text-[13px] font-bold" style={{ color: "#991B1B" }}>Thợ báo chậm tiến độ</p>
                <p className="text-[12px] mt-0.5" style={{ color: "#B91C1C" }}>
                  <strong>Lý do:</strong> {p.delayReason}
                  <span className="block mt-1 italic opacity-80">Hãy liên hệ với khách hàng ({p.customerName}) trước khi cập nhật lại hạn giao.</span>
                </p>
              </div>
            </div>
          )}

          {p.needsRedo && !isDone && (
            <div
              className="flex items-start gap-3 p-4 rounded-2xl animate-[shake_0.5s_ease-in-out] shadow-sm"
              style={{ backgroundColor: "#FEF2F2", border: "1px solid #FCA5A5" }}
            >
              <AlertTriangle size={18} className="shrink-0 mt-0.5" style={{ color: "#EF4444" }} />
              <div>
                <p className="text-[13px] font-bold" style={{ color: "#991B1B" }}>Bác chủ yêu cầu sửa lại lỗi</p>
                <p className="text-[12px] mt-0.5" style={{ color: "#B91C1C" }}>
                  <strong>Nội dung:</strong> {p.redoReason || "Hàng chưa đạt yêu cầu, thợ kiểm tra kỹ lại nhé."}
                </p>
              </div>
            </div>
          )}


          {isProducing && currentStageInfo && (
            <div
              className="flex items-start gap-3 p-4 rounded-2xl"
              style={{ backgroundColor: currentStageInfo.bg, border: `1px solid ${currentStageInfo.color}30` }}
            >
              {(() => { const Icon = currentStageInfo.icon; return <Icon size={18} className="shrink-0 mt-0.5" style={{ color: currentStageInfo.color }} />; })()}
              <div>
                <p className="text-[13px] font-bold" style={{ color: currentStageInfo.color }}>
                  Đang thực hiện: {currentStageInfo.label}
                </p>
                <p className="text-[12px] mt-0.5" style={{ color: currentStageInfo.color, opacity: 0.8 }}>
                  Đơn hàng đang được triển khai thực hiện tại xưởng.
                  {p.subStage === "gia_cong_moc" && " Đang đánh giấy ráp và chuẩn bị hoàn thiện."}
                  {p.subStage === "son_hoan_thien" && " Đang xử lý bề mặt và phun sơn hoàn thiện."}
                </p>
              </div>
            </div>
          )}

          {isDone && (
            <div
              className="flex items-start gap-3 p-4 rounded-2xl"
              style={{ backgroundColor: "#F0FDF4", border: "1px solid #BBF7D0" }}
            >
              <CheckCircle size={18} className="shrink-0 mt-0.5" style={{ color: "#166534" }} />
              <div>
                <p className="text-[13px] font-bold" style={{ color: "#14532D" }}>Sản xuất hoàn tất</p>
                <p className="text-[12px] mt-0.5" style={{ color: "#166534" }}>
                  Sản phẩm đã hoàn thành tất cả các công đoạn. Sẵn sàng giao cho khách hàng.
                </p>
              </div>
            </div>
          )}



          {/* ── STEP PROGRESS — hiện khi đã bắt đầu SX ── */}
          {(isProducing || isDone || isHold) && (
            <StageProgress currentStage={p.subStage} status={p.status} isRaw={p.isRaw} />
          )}

          {/* ═══════ MAIN 2-COLUMN GRID ═══════ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* ═══ LEFT COL (2/3) ═══ */}
            <div className="lg:col-span-2 space-y-4">

              {/* ── CARD: Thông tin sản phẩm ── */}
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
                    Thông tin sản phẩm
                  </span>
                </div>

                <div className="px-5 py-4 space-y-4">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 overflow-hidden"
                      style={{ backgroundColor: "var(--bg-main)", border: "1px solid var(--grid-border)" }}
                    >
                      {p.productImage ? (
                        <img src={p.productImage} alt={p.productName} className="w-full h-full object-cover" />
                      ) : (
                        <Package size={16} style={{ color: "var(--text-secondary)" }} />
                      )}
                    </div>
                    <div>
                      <p className="text-[15px] font-bold" style={{ color: "var(--text-main)" }}>{p.productName}</p>
                      <p className="text-[12px] mt-0.5" style={{ color: "var(--text-secondary)" }}>{p.variantName}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-4 bg-gray-50/50 p-4 rounded-2xl border border-dashed border-gray-200">
                    <SpecItem label="Loại hàng" value={p.isRaw ? "HÀNG MỘC" : "HÀNG KHÁCH ĐẶT"} />
                    <SpecItem label="Chất liệu" value={p.material} />
                    <SpecItem label="Kích thước" value={p.size} />
                    <SpecItem label="Màu sắc" value={p.finish} />
                    <SpecItem
                      label="Ghi chú"
                      value={[p.specs?.notes, p.notes, p.customerNotes, p.shippingNotes].filter(Boolean).join(" | ")}
                      className="md:col-span-2 text-blue-700"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* ── CARD: Ảnh mẫu khách gửi (Chỉ hiện khi có ảnh) ── */}
                {p.customerSampleImages && p.customerSampleImages.length > 0 && (
                  <div
                    className="rounded-2xl overflow-hidden"
                    style={{ backgroundColor: "var(--background)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
                  >
                    <div
                      className="px-5 py-3 flex items-center justify-between"
                      style={{ borderBottom: "1px solid var(--grid-border)", backgroundColor: "#FFFBEB" }}
                    >
                      <div className="flex items-center gap-2">
                        <Star size={14} className="text-amber-600 fill-amber-600" />
                        <span className="text-[12px] font-bold uppercase tracking-wider text-amber-900">Ảnh mẫu từ khách</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-3 gap-2">
                        {p.customerSampleImages?.map((img, idx) => (
                          <PhotoCardSmall key={idx} url={img} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── CARD: Hình ảnh & Bản vẽ ── */}
                {p.images && p.images.length > 0 && (
                  <div
                    className="rounded-2xl overflow-hidden"
                    style={{ backgroundColor: "var(--background)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
                  >
                    <div
                      className="px-5 py-3 flex items-center justify-between"
                      style={{ borderBottom: "1px solid var(--grid-border)", backgroundColor: "#ECFDF5" }}
                    >
                      <div className="flex items-center gap-2">
                        <Camera size={14} className="text-emerald-600" />
                        <span className="text-[12px] font-bold uppercase tracking-wider text-emerald-900">Bản vẽ thiết kế</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-3 gap-2">
                        {p.images?.slice(0, 3).map((img, idx) => (
                          <PhotoCardSmall key={idx} url={img} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>



              {/* ── CARD: Thông tin lệnh SX ── */}
              <div
                className="rounded-2xl overflow-hidden"
                style={{ backgroundColor: "var(--background)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
              >
                <div
                  className="px-5 py-3 flex items-center gap-2"
                  style={{ borderBottom: "1px solid var(--grid-border)", backgroundColor: "var(--grid-header-bg)" }}
                >
                  <ClipboardList size={14} style={{ color: "var(--brand-primary)" }} />
                  <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: "var(--text-main)" }}>
                    Thông tin sản xuất
                  </span>
                </div>

                <div className="px-5 py-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "var(--text-placeholder)" }}>Mã đơn hàng</p>
                      <p className="text-[13px] font-semibold mt-0.5 font-mono" style={{ color: "var(--text-main)" }}>{p.orderCode || p.code}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "var(--text-placeholder)" }}>Khách hàng</p>
                      <p className="text-[13px] font-semibold mt-0.5" style={{ color: "var(--text-main)" }}>{p.customerName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "var(--text-placeholder)" }}>Ngày tạo</p>
                      <p className="text-[13px] font-semibold mt-0.5" style={{ color: "var(--text-main)" }}>{fmtDateTime(p.date)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "var(--text-placeholder)" }}>Ngày bắt đầu</p>
                      <p className="text-[13px] font-semibold mt-0.5" style={{ color: "var(--text-main)" }}>{fmtDate(p.startDate)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "var(--text-placeholder)" }}>Dự kiến hoàn thành</p>
                      <p className="text-[13px] font-semibold mt-0.5" style={{ color: "var(--text-main)" }}>{fmtDate(p.expectedEndDate)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ═══ RIGHT COL (1/3) ═══ */}
            <div className="space-y-4">



              {/* ── CARD: Lịch trình ── */}
              <div
                className="rounded-2xl overflow-hidden"
                style={{ backgroundColor: "var(--background)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
              >
                <div
                  className="px-5 py-3 flex items-center gap-2"
                  style={{ borderBottom: "1px solid var(--grid-border)", backgroundColor: "var(--grid-header-bg)" }}
                >
                  <Calendar size={14} style={{ color: "var(--brand-primary)" }} />
                  <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: "var(--text-main)" }}>Thời gian</span>
                </div>
                <div className="px-5 py-4 space-y-2.5">
                  <div className="flex justify-between text-[13px]">
                    <span style={{ color: "var(--text-secondary)" }}>Ngày bắt đầu</span>
                    <span className="font-bold" style={{ color: "var(--text-main)" }}>{fmtDate(p.startDate)}</span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span style={{ color: "var(--text-secondary)" }}>Dự kiến hoàn thành</span>
                    <span className="font-bold" style={{ color: "var(--text-main)" }}>{fmtDate(p.expectedEndDate)}</span>
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
                  {p.timeline?.map((t, i) => {
                    const isLast = i === p.timeline.length - 1;
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



        {/* ── MODAL: CẬP NHẬT TIẾN ĐỘ CHẬM ── */}
        {showDelayModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-red-50/50">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertTriangle size={18} />
                  <h3 className="text-[15px] font-bold uppercase tracking-tight">Xử lý báo cáo chậm</h3>
                </div>
                <button onClick={() => setShowDelayModal(false)} className="text-gray-400 hover:text-gray-600 transition p-1 hover:bg-white rounded-lg">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="p-4 rounded-2xl bg-red-50 border border-red-100">
                  <p className="text-[11px] text-red-400 font-bold uppercase mb-1">Lý do thợ báo lùi ngày</p>
                  <p className="text-[13px] font-medium text-red-900 leading-relaxed italic border-l-2 border-red-300 pl-3 py-1">
                    "{p.delayReason}"
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                  <p className="text-[11px] text-gray-400 font-bold uppercase">Thông tin liên hệ</p>
                  <div className="text-[13px] font-bold text-gray-900">
                    Khách hàng: {p.customerName}
                  </div>
                  <div className="text-[13px] text-gray-600">
                    Sản phẩm: {p.productName}
                  </div>
                  <div className="mt-2 text-[12px] text-blue-600 font-medium">
                    Hãy liên hệ với khách để thông báo trước khi gia hạn.
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-gray-400 uppercase mb-2 ml-1">Lùi ngày giao mới</label>
                  <input
                    type="date"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300 transition"
                  />
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
                <button
                  onClick={() => setShowDelayModal(false)}
                  className="px-5 py-2 rounded-xl text-[13px] font-bold text-gray-400 hover:bg-gray-100 transition"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleDelaySubmit}
                  className="px-5 py-2 rounded-xl text-[13px] font-bold bg-red-600 text-white hover:bg-red-700 transition shadow-md"
                >
                  Cập nhật tiến độ
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── MODAL: YÊU CẦU SỬA LẠI ── */}
        {showRedoModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-emerald-50/30">
                <div className="flex items-center gap-2 text-emerald-600">
                  <AlertTriangle size={18} />
                  <h3 className="text-[15px] font-bold uppercase tracking-tight">Yêu cầu sửa lại sản phẩm</h3>
                </div>
                <button onClick={() => setShowRedoModal(false)} className="text-gray-400 hover:text-gray-600 transition p-1 hover:bg-white rounded-lg">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200">
                  <p className="text-[11px] text-gray-400 font-bold uppercase mb-1">Đang xử lý lệnh</p>
                  <p className="text-[13px] font-bold text-gray-900">{p.code} - {p.productName}</p>
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-gray-400 uppercase mb-2 ml-1">Chi tiết lỗi / Yêu cầu sửa</label>
                  <textarea
                    id="redoReason"
                    className="w-full h-24 p-4 rounded-2xl border border-gray-200 text-[13px] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-300 transition resize-none"
                    placeholder="Ví dụ: Màu sơn chưa đều, còn xước ở cạnh bàn..."
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-gray-400 uppercase mb-2 ml-1">Quay lại công đoạn</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleRedo(document.getElementById('redoReason').value, 'gia_cong_moc')}
                      className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50 transition group"
                    >
                      <Hammer size={20} className="text-gray-400 group-hover:text-emerald-600" />
                      <span className="text-[12px] font-bold text-gray-600 group-hover:text-emerald-700">Gia công Mộc</span>
                    </button>
                    <button
                      onClick={() => handleRedo(document.getElementById('redoReason').value, 'son_hoan_thien')}
                      className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50 transition group"
                    >
                      <Paintbrush size={20} className="text-gray-400 group-hover:text-emerald-600" />
                      <span className="text-[12px] font-bold text-gray-600 group-hover:text-emerald-700">Sơn hoàn thiện</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => setShowRedoModal(false)}
                  className="px-5 py-2 rounded-xl text-[13px] font-bold text-gray-400 hover:text-gray-600 transition"
                >
                  Hủy bỏ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
