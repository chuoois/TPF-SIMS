import { useState, useMemo } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { PageHelmet } from "@/components/seo/PageHelmet";
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
} from "lucide-react";

// ===================== CONSTANTS =====================
const STAGES = [
  { key: "gia_cong_moc", label: "Gia công Mộc", icon: Hammer, color: "#7C3AED", bg: "#F5F3FF" },
  { key: "son_hoan_thien", label: "Sơn hoàn thiện", icon: Paintbrush, color: "#0891B2", bg: "#ECFEFF" },
];

// ===================== MOCK DATA =====================
const MOCK_PRODUCTIONS = {
  // CHỜ GIAO THỢ
  LSX001: {
    code: "LSX-2603-0001",
    orderCode: "DH-2603-0001",
    orderId: "DH001",
    productName: "Tủ bếp chữ L",
    status: "Chờ giao thợ",
    subStage: null,
    isPendingApproval: false,
    needsRedo: false,
    assignedWorker: null,
    startDate: null,
    expectedEndDate: "2026-03-20",
    date: "2026-03-05T16:30:00",
    customerName: "Vũ Phương Thảo",
    notes: "Khách tự trang bị phụ kiện bếp",
    timeline: [
      { time: "05/03/2026 16:30", label: "Tạo lệnh sản xuất", desc: "Hệ thống tự tạo từ đơn DH-2603-0001", active: false },
      { time: "05/03/2026 16:30", label: "Chờ giao thợ", desc: "Chờ chủ xưởng giao việc cho thợ", active: true },
    ],
  },
  // ĐANG SẢN XUẤT
  LSX003: {
    code: "LSX-2603-0003",
    orderCode: "DH-2603-0008",
    orderId: "DH008",
    productName: "Bộ bàn ghế phòng khách",
    status: "Đang sản xuất",
    subStage: "gia_cong_moc",
    isPendingApproval: false,
    needsRedo: true,
    redoReason: "Mặt bàn bị xước nhỏ ở góc trái. Bác chủ yêu cầu sơn lại và xử lý kỹ khâu Mộc.",
    assignedWorker: "Nguyễn Văn Đức",
    startDate: "2026-03-03",
    expectedEndDate: "2026-03-25",
    date: "2026-03-03T08:00:00",
    customerName: "Hoàng Nguyệt Ánh",
    notes: "Mặt bàn đục nguyên khối không ghép",
    images: ["https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=800"],
    progressPhotos: [],
    timeline: [
      { time: "03/03/2026 08:00", label: "Tạo lệnh sản xuất", desc: "Hệ thống tự tạo từ đơn DH-2603-0008", active: false },
      { time: "03/03/2026 08:15", label: "Giao việc", desc: "Giao cho thợ Nguyễn Văn Đức", active: false },
      { time: "03/03/2026 09:00", label: "Bắt đầu làm Mộc", desc: "Thợ xác nhận nhận việc", active: true },
    ],
  },
  // CHỜ DUYỆT (Merged into Đang sản xuất)
  LSX005: {
    code: "LSX-2603-0012",
    orderCode: "DH-2603-0012",
    orderId: "DH012",
    productName: "Bàn thờ chạm rồng",
    status: "Đang sản xuất",
    subStage: "son_hoan_thien",
    isPendingApproval: true,
    needsRedo: false,
    assignedWorker: "Lê Văn Hùng",
    startDate: "2026-03-04",
    expectedEndDate: "2026-03-20",
    date: "2026-03-04T09:00:00",
    customerName: "Nguyễn Công Vinh",
    notes: "Hàng tâm linh, làm kỹ khâu hoàn thiện",
    images: ["https://images.unsplash.com/photo-1615529328322-92c90680fd74?q=80&w=800"],
    progressPhotos: [
      { url: "https://images.unsplash.com/photo-1620608208153-90928221805b?q=80&w=800", time: "12/03/2026 15:30", stage: "Sơn" }
    ],
    timeline: [
      { time: "04/03/2026 09:00", label: "Tạo lệnh sản xuất", active: false },
      { time: "12/03/2026 15:30", label: "Báo cáo hoàn thành", desc: "Thợ báo xong, chờ chủ xưởng nghiệm thu", active: true },
    ],
  },
  // HOÀN THÀNH
  LSX004: {
    code: "LSX-2603-0004",
    status: "Hoàn thành",
    subStage: null,
    isPendingApproval: false,
    needsRedo: false,
    assignedWorker: "Trần Minh Tâm",
    productName: "Kệ tivi nguyên khối",
    orderCode: "DH-2603-0008",
    customerName: "Hoàng Nguyệt Ánh",
    timeline: [
      { time: "12/03/2026 16:00", label: "Đã nghiệm thu", desc: "Chủ xưởng đã duyệt sản phẩm", active: true },
    ],
  },
};

const MOCK_WORKERS = [
  { id: "W001", name: "Nguyễn Văn Đức", role: "Thợ sản xuất", avatar: "Đ" },
  { id: "W002", name: "Trần Minh Tâm", role: "Thợ sản xuất", avatar: "T" },
  { id: "W003", name: "Lê Văn Hùng", role: "Thợ sơn", avatar: "H" },
  { id: "W004", name: "Phạm Quốc Bảo", role: "Thợ mộc", avatar: "B" },
];

// ===================== HELPERS =====================
const fmtDate = (s) => (s ? new Date(s).toLocaleDateString("vi-VN") : "Chưa xác định");

const fmtDateTime = (s) => {
  if (!s) return "—";
  const d = new Date(s);
  return `${d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} — ${d.toLocaleDateString("vi-VN")}`;
};

const getStatusColor = (status, subStage = null, isPendingApproval = false, needsRedo = false) => {
  // 1. Primary Status
  const primaryBadge = {
    "Chờ giao thợ": { label: "Chờ giao thợ", bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
    "Đang sản xuất": { label: "Đang sản xuất", bg: "#F5F3FF", text: "#7C3AED", border: "#DDD6FE" },
    "Hoàn thành": { label: "Hoàn thành", bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
  }[status] || { label: status, bg: "#F3F4F6", text: "#6B7280", border: "#E5E7EB" };

  // 2. Detail Status
  let detailBadge = null;
  if (isPendingApproval && subStage === "son_hoan_thien") {
    detailBadge = { label: "Chờ duyệt", bg: "#EFF6FF", text: "#1D4ED8", border: "#DBEAFE" };
  } else if (needsRedo) {
    detailBadge = { label: "Sửa lại", bg: "#FEF2F2", text: "#EF4444", border: "#FEE2E2" };
  } else if (status === "Đang sản xuất") {
    if (subStage === "gia_cong_moc") detailBadge = { label: "Gia công Mộc", bg: "#FDF4FF", text: "#A21CAF", border: "#F5D0FE" };
    if (subStage === "son_hoan_thien") detailBadge = { label: "Sơn hoàn thiện", bg: "#FDF2F8", text: "#DB2777", border: "#FBCFE8" };
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
const StageProgress = ({ currentStage, status }) => {
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
                        {(isCompleted || isFinalDone) ? "✓ Đã xong" : isCurrent ? "● Đang làm" : "○ Chờ"}
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

  // States
  const [showAssignModal, setShowAssignModal] = useState(location.state?.autoOpenAssign || false);
  const [showRedoModal, setShowRedoModal] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);

  // Fake data fallback logic
  const fallbackRef = ["LSX001", "LSX002", "LSX010", "LSX015"].includes(id) ? "LSX001"
    : ["LSX004", "LSX006", "LSX012", "LSX016"].includes(id) ? "LSX004"
      : ["LSX003", "LSX011", "LSX007"].includes(id) ? "LSX003"
        : "LSX003";

  const p = MOCK_PRODUCTIONS[id] || {
    ...MOCK_PRODUCTIONS[fallbackRef],
    code: `LSX-2603-${id?.replace(/\D/g, '') || "9999"}`,
    needsRedo: false,
    isPendingApproval: false,
  };
  const sc = getStatusColor(p.status, p.subStage, p.isPendingApproval, p.needsRedo);
  const progress = p.quantityPlanned > 0 ? Math.round((p.quantityCompleted / p.quantityPlanned) * 100) : 0;
  const isWaiting = p.status === "Chờ giao thợ";
  const isProducing = p.status === "Đang sản xuất";
  const isDone = p.status === "Hoàn thành";
  const isHold = false;

  const currentStageInfo = STAGES.find((s) => s.key === p.subStage);
  const currentStageIdx = STAGES.findIndex((s) => s.key === p.subStage);
  const isLastStage = currentStageIdx === STAGES.length - 1;

  // Handlers
  const handleNextStage = () => {
    alert("Xong phần Mộc! Lệnh này sẽ chuyển sang khâu Sơn hoàn thiện.");
    navigate(0);
  };

  const handleOwnerApprove = () => {
    const confirm = window.confirm(`Phê duyệt & Chốt hoàn thành mã lệnh ${p.code}?`);
    if (confirm) {
      alert(`Lệnh sản xuất ${p.code} đã hoàn thành xuất sắc!`);
      navigate("/owner/production");
    }
  };

  const handleRedo = (reason, backToStage) => {
    alert(`Đã yêu cầu sửa lại: ${reason}. Quay lại khâu: ${backToStage === "gia_cong_moc" ? "Mộc" : "Sơn"}`);
    setShowRedoModal(false);
    navigate(0);
  };

  const handleClearRedo = () => {
    alert(`Đã xác nhận bác thợ sửa xong lệnh ${p.code}. Trạng thái trở lại bình thường.`);
    navigate(0);
  };

  return (
    <>
      <PageHelmet title={`${p.code} | Chi tiết lệnh SX`} />

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
                  <h1 className="text-[16px] font-bold" style={{ color: "var(--text-main)" }}>{p.code}</h1>
                  <Badge style={{ backgroundColor: sc.primaryBadge.bg, color: sc.primaryBadge.text, border: `1px solid ${sc.primaryBadge.border}` }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sc.primaryBadge.text }} />
                    {sc.primaryBadge.label}
                  </Badge>
                  {sc.detailBadge && (
                    <Badge style={{ backgroundColor: sc.detailBadge.bg, color: sc.detailBadge.text, border: `1px solid ${sc.detailBadge.border}` }}>
                      {sc.detailBadge.label}
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] mt-0.5" style={{ color: "var(--text-placeholder)" }}>
                  Đơn hàng: {p.orderCode} • Khách: {p.customerName}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              {p.isPendingApproval && p.subStage === "son_hoan_thien" && (
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
                    Phê duyệt & Hoàn thiện
                  </button>
                </div>
              )}






              {isWaiting && (
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[12px] font-bold transition hover:bg-emerald-700 cursor-pointer shadow-md active:scale-95"
                  style={{ backgroundColor: "#10B981", color: "#fff" }}
                >
                  <UserPlus size={14} />
                  Giao việc ngay
                </button>
              )}



            </div>
          </div>
        </div>

        {/* ═══════ SCROLLABLE CONTENT ═══════ */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">

          {/* ── BANNERS ── */}
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
          {isWaiting && (
            <div
              className="flex items-start gap-3 p-4 rounded-2xl"
              style={{ backgroundColor: "#FFF7ED", border: "1px solid #FED7AA" }}
            >
              <ClipboardList size={18} className="shrink-0 mt-0.5" style={{ color: "#C2410C" }} />
              <div>
                <p className="text-[13px] font-bold text-orange-900">Chờ giao thợ</p>
                <p className="text-[12px] mt-0.5 text-orange-700">
                  Sản phẩm chưa được phân công cho thợ. Vui lòng chọn thợ phụ trách để bắt đầu sản xuất.
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
                  Thợ {p.assignedWorker} đang đảm nhiệm công việc.
                  {p.subStage === "gia_cong_moc" && " Đang gia công khung sườn và chi tiết mộc."}
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
                  Sản phẩm đã hoàn thành tất cả các công đoạn bởi thợ {p.assignedWorker}. Sẵn sàng giao cho khách hàng.
                </p>
              </div>
            </div>
          )}



          {/* ── STEP PROGRESS — hiện khi đã bắt đầu SX ── */}
          {(isProducing || isDone || isHold) && (
            <StageProgress currentStage={p.subStage} status={p.status} />
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
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                      style={{ backgroundColor: "var(--bg-main)", border: "1px solid var(--grid-border)" }}
                    >
                      <Package size={16} style={{ color: "var(--text-secondary)" }} />
                    </div>
                    <div>
                      <p className="text-[15px] font-bold" style={{ color: "var(--text-main)" }}>{p.productName}</p>
                      <p className="text-[12px] mt-0.5" style={{ color: "var(--text-secondary)" }}>{p.variantName}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-4 bg-gray-50/50 p-4 rounded-2xl border border-dashed border-gray-200">
                    <SpecItem label="Chất liệu gỗ" value={p.material} />
                    <SpecItem label="Kích thước" value={p.size} />
                    <SpecItem label="Hoàn thiện" value={p.finish} />
                    <SpecItem label="Mẫu/Hoa văn" value={p.pattern} />
                    <SpecItem label="Phụ kiện" value={p.specs?.hardware} />
                    <SpecItem label="Yêu cầu riêng" value={p.specs?.notes} />
                    <SpecItem label="Kế hoạch" value={`${p.quantityPlanned} bộ`} />
                    <SpecItem label="Thực tế" value={`${p.quantityCompleted}/${p.quantityPlanned}`} />
                  </div>

                  {p.notes && (
                    <div className="pt-3 px-1" style={{ borderTop: "1px solid var(--grid-border)" }}>
                      <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "var(--text-placeholder)" }}>Ghi chú sản xuất</p>
                      <p className="text-[13px] mt-1 text-gray-600 italic leading-relaxed">“{p.notes}”</p>
                    </div>
                  )}
                </div>
              </div>

              {/* ── CARD: Hình ảnh & Bản vẽ — Luôn hiển thị ── */}
              <div
                className="rounded-2xl overflow-hidden"
                style={{ backgroundColor: "var(--background)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
              >
                <div
                  className="px-5 py-3 flex items-center justify-between"
                  style={{ borderBottom: "1px solid var(--grid-border)", backgroundColor: "var(--grid-header-bg)" }}
                >
                  <div className="flex items-center gap-2">
                    <Camera size={14} className="text-emerald-600" />
                    <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: "var(--text-main)" }}>
                      Hình ảnh & Bản vẽ thiết kế
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {p.images?.length || 0} File
                  </span>
                </div>
                <div className="p-5">
                  {p.images && p.images.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {p.images.map((img, idx) => (
                        <PhotoCard key={idx} url={img} isDesign={true} />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-400 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                      <Camera size={24} className="mb-2 opacity-20" />
                      <p className="text-[13px] font-medium">Chưa có ảnh bản vẽ thiết kế</p>
                    </div>
                  )}
                </div>
              </div>

              {/* ── CARD: Ảnh tiến độ sản xuất — Hiện khi đang làm ── */}
              {isProducing && (
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{ backgroundColor: "var(--background)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
                >
                  <div
                    className="px-5 py-3 flex items-center justify-between"
                    style={{ borderBottom: "1px solid var(--grid-border)", backgroundColor: "var(--grid-header-bg)" }}
                  >
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-blue-600" />
                      <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: "var(--text-main)" }}>
                        Ảnh tiến độ thực tế (Xưởng)
                      </span>
                    </div>
                    <button className="text-[11px] font-bold text-blue-600 hover:underline">
                      Xem tất cả
                    </button>
                  </div>
                  <div className="p-5">
                    {p.progressPhotos && p.progressPhotos.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {p.progressPhotos.map((photo, idx) => (
                          <PhotoCard
                            key={idx}
                            url={photo.url}
                            time={photo.time}
                            stage={photo.stage}
                          />
                        ))}
                        {/* Upload placeholder */}
                        <div className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1.5 hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer group">
                          <Camera size={20} className="text-gray-300 group-hover:text-blue-500" />
                          <span className="text-[10px] font-bold text-gray-400 group-hover:text-blue-600 uppercase">Thêm ảnh</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-gray-400 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                        <Camera size={24} className="mb-2 opacity-20" />
                        <p className="text-[13px] font-medium">Thợ chưa cập nhật ảnh tiến độ</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

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
                    Thông tin lệnh sản xuất
                  </span>
                </div>

                <div className="px-5 py-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "var(--text-placeholder)" }}>Mã lệnh SX</p>
                      <p className="text-[13px] font-semibold mt-0.5 font-mono" style={{ color: "var(--text-main)" }}>{p.code}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "var(--text-placeholder)" }}>Đơn hàng</p>
                      <Link
                        to={`/owner/orders/${p.orderId}`}
                        className="text-[13px] font-semibold mt-0.5 hover:underline"
                        style={{ color: "var(--brand-primary)" }}
                      >
                        {p.orderCode}
                      </Link>
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

              {/* ── CARD: Thợ phụ trách ── */}
              <div
                className="rounded-2xl overflow-hidden"
                style={{ backgroundColor: "var(--background)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
              >
                <div
                  className="px-5 py-3 flex items-center gap-2"
                  style={{ borderBottom: "1px solid var(--grid-border)", backgroundColor: "var(--grid-header-bg)" }}
                >
                  <User size={14} style={{ color: "var(--brand-primary)" }} />
                  <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: "var(--text-main)" }}>Thợ phụ trách</span>
                </div>
                <div className="px-5 py-4">
                  {p.assignedWorker ? (
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-[14px] font-bold shrink-0"
                        style={{ backgroundColor: "var(--bg-main)", color: "var(--brand-primary)", border: "1px solid var(--grid-border)" }}
                      >
                        {p.assignedWorker.charAt(0)}
                      </div>
                      <div>
                        <p className="text-[14px] font-bold" style={{ color: "var(--text-main)" }}>{p.assignedWorker}</p>
                        <p className="text-[11px]" style={{ color: "var(--text-placeholder)" }}>Thợ sản xuất</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center py-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-2"
                        style={{ backgroundColor: "var(--bg-main)", border: "1px solid var(--grid-border)" }}
                      >
                        <UserPlus size={20} style={{ color: "var(--text-placeholder)" }} />
                      </div>
                      <p className="text-[13px] font-bold" style={{ color: "var(--text-secondary)" }}>Chưa phân công</p>
                    </div>
                  )}
                </div>
              </div>

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
                  {p.timeline.map((t, i) => {
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

        {/* ── MODAL: GIAO VIỆC ── */}
        {showAssignModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b flex items-center justify-between bg-emerald-50/30">
                <div className="flex items-center gap-2 text-emerald-600">
                  <UserPlus size={18} />
                  <h3 className="text-[15px] font-bold uppercase tracking-tight">Giao việc cho thợ</h3>
                </div>
                <button onClick={() => setShowAssignModal(false)} className="p-2 hover:bg-white rounded-lg transition text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <p className="text-[13px] text-gray-600">Chọn thợ phụ trách cho lệnh sản xuất <span className="font-bold text-emerald-600">{p.code}</span>:</p>

                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                    {MOCK_WORKERS.map(worker => (
                      <label
                        key={worker.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 transition cursor-pointer hover:border-emerald-200 ${selectedWorker === worker.id ? 'border-emerald-500 bg-emerald-50' : 'border-gray-50 bg-white'}`}
                      >
                        <input
                          type="radio"
                          name="worker"
                          className="hidden"
                          onChange={() => setSelectedWorker(worker.id)}
                          checked={selectedWorker === worker.id}
                        />
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-[14px] transition-colors ${selectedWorker === worker.id ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                          {worker.avatar}
                        </div>
                        <div className="flex-1">
                          <p className="text-[14px] font-bold text-gray-900">{worker.name}</p>
                          <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">{worker.role}</p>
                        </div>
                        {selectedWorker === worker.id && <CheckCircle size={18} className="text-emerald-600" />}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => setShowAssignModal(false)}
                    className="flex-1 h-11 rounded-xl text-[13px] font-bold text-gray-400 hover:bg-gray-50 transition"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    disabled={!selectedWorker}
                    onClick={() => {
                      alert(`Đã giao việc cho thợ ${MOCK_WORKERS.find(w => w.id === selectedWorker).name}. Trạng thái lệnh chuyển sang Đang sản xuất.`);
                      setShowAssignModal(false);
                      navigate("/owner/production");
                    }}
                    className="flex-1 h-11 rounded-xl text-[13px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-100 active:scale-95"
                  >
                    Xác nhận giao việc
                  </button>
                </div>
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
                  <label className="block text-[12px] font-bold text-gray-400 uppercase mb-2 ml-1">Nguyên nhân lỗi / Dặn dò thợ</label>
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
