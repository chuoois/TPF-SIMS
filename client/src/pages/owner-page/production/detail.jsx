import { useState, useMemo } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { PageHelmet } from "@/components/seo/PageHelmet";
import toast from "react-hot-toast";
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

// ===================== CONSTANTS =====================
const STAGES = [
  { key: "gia_cong_moc", label: "Gia công Mộc & Ráp", icon: Hammer, color: "#7C3AED", bg: "#F5F3FF" },
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
    productImage: "https://images.unsplash.com/photo-1556912177-c54030639a03?q=80&w=300",
    variantName: "Gỗ sồi Nga — Sơn PU",
    material: "Gỗ sồi Nga",
    size: "3.2m + 2.8m",
    finish: "Sơn PU cánh gián",
    specs: { hardware: "Hafele / DTC", notes: "Lắp chung cư. Yêu cầu: Soi chỉ hiện đại" },
    quantityPlanned: 1,
    quantityCompleted: 0,
    status: "Đang làm mộc",
    subStage: "gia_cong_moc",
    isPendingApproval: false,
    needsRedo: false,
    assignedWorker: "Thợ cả",
    startDate: "2026-03-05",
    expectedEndDate: "2026-03-20",
    date: "2026-03-05T16:30:00",
    customerName: "Vũ Phương Thảo",
    notes: "Khách tự trang bị phụ kiện bếp",
    customerNotes: "Yêu cầu tủ bếp hiện đại, mặt đá trắng sứ vân mây. Các ô ngăn kéo làm ray giảm chấn xịn.",
    customerSampleImages: [
      "https://images.unsplash.com/photo-1556912177-c54030639a03?q=80&w=800",
      "https://images.unsplash.com/photo-1556911223-43a03b30ad51?q=80&w=800"
    ],
    timeline: [
      { time: "05/03/2026 16:45", label: "Bắt đầu làm mộc", desc: "Tự động bàn giao Xưởng", active: true },
    ],
    shippingNotes: "Giao trong giờ hành chính. Nhà có thang máy, báo trước 30p.",
    images: [
      "https://images.unsplash.com/photo-1541888946425-d81bb193005f?q=80&w=800",
      "https://images.unsplash.com/photo-1503387762-592dea58ef4e?q=80&w=800"
    ],
  },
  // ĐANG LÀM MỘC (MOCK_PRODUCTIONS.LSX003)
  LSX003: {
    code: "LSX-2603-0003",
    orderCode: "DH-2603-0008",
    orderId: "DH008",
    status: "Đang làm mộc",
    subStage: "gia_cong_moc",
    assignedWorker: "Nguyễn Văn Đức",
    startDate: "2026-03-03",
    expectedEndDate: "2026-03-25",
    date: "2026-03-03T08:00:00",
    customerName: "Hoàng Nguyệt Ánh",
    productName: "Bàn trà phòng khách",
    productImage: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=300",
    variantName: "Gỗ hương đá — Chạm nghê",
    customerNotes: "Mẫu đục chạm nghê cổ điển, đục tay kỹ. Màu vecni sáng vân gỗ.",
    customerSampleImages: ["https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=800"],
    material: "Gỗ hương đá",
    size: "6 món (1 đoản, 2 đơn)",
    finish: "Vecni truyền thống",
    specs: { hardware: "Không", notes: "Gỗ lõi 100%. Yêu cầu: Chạm Nghê đỉnh" },
    quantityPlanned: 1,
    quantityCompleted: 0,
    notes: "Mặt bàn đục nguyên khối không ghép",
    images: [
      "https://images.unsplash.com/photo-1541888946425-d81bb193005f?q=80&w=800"
    ],
    progressPhotos: [],
    timeline: [
      { time: "03/03/2026 09:00", label: "Bắt đầu làm Mộc", desc: "Thợ xác nhận nhận việc", active: true },
    ],
    shippingNotes: "Giao nhà phố, đường rộng xe tải vào được.",
  },
  // HÀNG THÔ (MOCK_PRODUCTIONS.LSX007)
  LSX007: {
    code: "LSX-2603-0007",
    orderCode: "DH-THO-001",
    orderId: "DH017",
    isRaw: true,
    status: "Đang sơn",
    subStage: "son_hoan_thien",
    assignedWorker: "Thợ sơn B",
    startDate: "2026-03-12",
    expectedEndDate: "2026-03-20",
    date: "2026-03-12T10:00:00",
    customerName: "Hoàng Nguyệt Ánh",
    productName: "Sập thờ gỗ mít",
    productImage: "https://images.unsplash.com/photo-1620608208153-90928221805b?q=80&w=300",
    variantName: "Gỗ mít — Mộc sẵn",
    customerNotes: "Hàng mộc có sẵn tại xưởng. Chỉ cần đánh giấy giáp và lên màu vecni cánh gián.",
    customerSampleImages: [
      "https://images.unsplash.com/photo-1615529328322-92c90680fd74?q=80&w=800"
    ],
    material: "Gỗ mít",
    size: "220cm",
    finish: "Mộc / Vecni",
    specs: { hardware: "Không", notes: "Hoa văn: Tứ linh. Làm kỹ phần chân." },
    quantityPlanned: 1,
    quantityCompleted: 0,
    notes: "Mộc có sẵn, kiểm tra kỹ các mối ghép trước khi sơn",
    images: [],
    progressPhotos: [],
    timeline: [
      { time: "12/03/2026 10:15", label: "Bắt đầu sơn", desc: "Chuyển từ kho mộc sang tổ sơn", active: true },
    ],
    shippingNotes: "Giao lắp tầng 1, đường rộng xe tải vào được.",
  },
  // ĐANG SƠN (MOCK_PRODUCTIONS.LSX005)
  LSX005: {
    code: "LSX-2603-0012",
    orderCode: "DH-2603-0012",
    orderId: "DH012",
    customerName: "Nguyễn Công Vinh",
    productName: "Bàn thờ chạm rồng",
    productImage: "https://images.unsplash.com/photo-1615529328322-92c90680fd74?q=80&w=300",
    variantName: "Gỗ gụ mật — Vecni",
    material: "Gỗ gụ mật",
    size: "197x107x127cm",
    finish: "Vecni cánh gián",
    specs: { hardware: "Không", notes: "Làm mộc kỹ. Yêu cầu: Chạm Tùng Hạc" },
    quantityPlanned: 1,
    quantityCompleted: 0,
    status: "Đang sơn",
    subStage: "son_hoan_thien",
    isPendingApproval: true,
    needsRedo: false,
    assignedWorker: "Lê Văn Hùng",
    startDate: "2026-03-04",
    expectedEndDate: "2026-03-20",
    date: "2026-03-04T09:00:00",
    customerName: "Nguyễn Công Vinh",
    notes: "Hàng tâm linh, làm kỹ khâu hoàn thiện",
    customerNotes: "Làm đúng theo mẫu ảnh cũ, màu vecni cánh gián đậm. Lưu ý các góc đục rồng phải bén.",
    customerSampleImages: [
      "https://images.unsplash.com/photo-1615529328322-92c90680fd74?q=80&w=800"
    ],
    images: [
      "https://images.unsplash.com/photo-1541888946425-d81bb193005f?q=80&w=800"
    ],
    progressPhotos: [
      { url: "https://images.unsplash.com/photo-1620608208153-90928221805b?q=80&w=800", time: "12/03/2026 15:30", stage: "Sơn" }
    ],
    timeline: [
      { time: "12/03/2026 15:30", label: "Báo cáo hoàn thành", desc: "Thợ báo xong, chờ chủ xưởng nghiệm thu", active: true },
    ],
    shippingNotes: "Lắp đặt phòng thờ tầng 5, có thang máy nhưng cần bê bộ phận rời.",
  },
  // HOÀN THÀNH
  LSX004: {
    code: "LSX-2603-0004",
    orderCode: "DH-2603-0008",
    orderId: "DH008",
    productName: "Kệ tivi nguyên khối",
    productImage: "https://images.unsplash.com/photo-1577145745727-42b77daeb623?q=80&w=300",
    variantName: "Gỗ gụ — Sơn PU",
    material: "Gỗ gụ",
    size: "240x40x50cm",
    finish: "Sơn PU bóng mờ",
    specs: { hardware: "Ray nhấn mở Hafele", notes: "Gỗ vỉ nguyên miếng. Yêu cầu: Trơn hiện đại" },
    quantityPlanned: 1,
    quantityCompleted: 1,
    status: "Hoàn thành",
    subStage: null,
    isPendingApproval: false,
    needsRedo: false,
    assignedWorker: "Trần Minh Tâm",
    startDate: "2026-03-01",
    expectedEndDate: "2026-03-12",
    date: "2026-03-01T10:00:00",
    customerName: "Hoàng Nguyệt Ánh",
    customerNotes: "Mẫu hiện đại, không đục chạm. Mặt kệ làm nhẵn mịn.",
    customerSampleImages: [
      "https://images.unsplash.com/photo-1595246140625-573b715d11dc?q=80&w=800"
    ],
    images: ["https://images.unsplash.com/photo-1541888946425-d81bb193005f?q=80&w=800"],
    timeline: [
      { time: "12/03/2026 16:00", label: "Đã nghiệm thu", desc: "Chủ xưởng đã duyệt sản phẩm", active: true },
    ],
    shippingNotes: "Sập nặng, cần ít nhất 4 người khiêng. Tầng 1.",
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
    "Đang làm mộc": { label: "Đang làm mộc", bg: "#FDF4FF", text: "#A21CAF", border: "#F5D0FE" },
    "Đang sơn": { label: "Đang sơn", bg: "#FDF2F8", text: "#DB2777", border: "#FBCFE8" },
    "Hoàn thành": { label: "Hoàn thành", bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
  }[status] || { label: status, bg: "#F3F4F6", text: "#6B7280", border: "#E5E7EB" };

  // 2. Detail Status
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

  // States
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
  const isProducing = p.status === "Đang sản xuất";
  const isDone = p.status === "Hoàn thành";
  const isHold = false;

  const currentStageInfo = STAGES.find((s) => s.key === p.subStage);
  const currentStageIdx = STAGES.findIndex((s) => s.key === p.subStage);
  const isLastStage = currentStageIdx === STAGES.length - 1;

  // Handlers


  const handleOwnerApprove = () => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-[13px] font-medium text-gray-700">
          Xác nhận <strong>Nhập kho & Hoàn thành</strong> mã lệnh <strong>{p.code}</strong>?
        </p>
        <div className="flex justify-end gap-2">
          <button 
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-gray-400 hover:bg-gray-50 transition"
          >
            Hủy
          </button>
          <button 
            onClick={() => {
              toast.dismiss(t.id);
              toast.success(`Lệnh sản xuất ${p.code} đã hoàn thành xuất sắc!`);
              setTimeout(() => navigate("/owner/production"), 1000);
            }}
            className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition"
          >
            Xác nhận
          </button>
        </div>
      </div>
    ), { duration: 5000 });
  };

  const handleRedo = (reason, backToStage) => {
    toast.error(`Đã yêu cầu sửa lại: ${reason}. Quay lại khâu: ${backToStage === "gia_cong_moc" ? "Mộc" : "Sơn"}`);
    setShowRedoModal(false);
  };

  const handleClearRedo = () => {
    toast.success(`Đã xác nhận bác thợ sửa xong lệnh ${p.code}. Trạng thái trở lại bình thường.`);
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
                    Nhập kho & Hoàn thành
                  </button>
                </div>
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
                    <SpecItem label="Loại hàng" value={p.isRaw ? "HÀNG THÔ (Sẵn)" : "HÀNG ĐẶT (Mới)"} />
                    <SpecItem label="Chất liệu gỗ" value={p.material} />
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
                        {p.customerSampleImages.map((img, idx) => (
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
                        {p.images.slice(0, 3).map((img, idx) => (
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
