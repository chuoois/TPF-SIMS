import { useState } from "react";
import { useParams, Link } from "react-router-dom";
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
} from "lucide-react";

// ===================== CONSTANTS =====================
const STAGES = [
  { key: "danh_rap", label: "Đánh ráp", icon: Wrench, color: "#7C3AED", bg: "#F5F3FF" },
  { key: "phun_son", label: "Phun sơn", icon: Paintbrush, color: "#0891B2", bg: "#ECFEFF" },
];

// ===================== MOCK DATA =====================
const MOCK_PRODUCTIONS = {
  // CHỜ XỬ LÝ
  LSX001: {
    code: "LSX-2603-0001",
    orderCode: "DH-2603-0010",
    orderId: "DH001",
    productName: "Tủ bếp chữ L",
    variantName: "Gỗ sồi Nga — Sơn PU màu óc chó",
    material: "Gỗ sồi Nga",
    finish: "Sơn PU màu óc chó",
    size: "Dài 3.5m x Cao 2.2m",
    pattern: "Cánh phẳng hiện đại",
    quantityPlanned: 1,
    quantityCompleted: 0,
    status: "Chờ xử lý",
    subStage: null,
    assignedWorker: null,
    startDate: null,
    expectedEndDate: "2026-03-20",
    date: "2026-03-05T16:30:00",
    customerName: "Vũ Phương Thảo",
    notes: "Khách tự trang bị phụ kiện bếp",
    timeline: [
      { time: "05/03/2026 16:30", label: "Tạo lệnh sản xuất", desc: "Hệ thống tự tạo từ đơn DH-2603-0010", active: false },
      { time: "05/03/2026 16:30", label: "Chờ xử lý", desc: "Chờ chủ xưởng giao việc cho thợ", active: true },
    ],
  },
  // ĐANG SẢN XUẤT — GIAI ĐOẠN ĐÁNH RÁP
  LSX003: {
    code: "LSX-2603-0003",
    orderCode: "DH-2603-0008",
    orderId: "DH008",
    productName: "Bộ bàn ghế phòng khách",
    variantName: "Gỗ hương đá — Chạm nghê bảo đỉnh",
    material: "Gỗ hương đá Nam Phi",
    finish: "Sơn PU trần bóng mờ",
    size: "Bàn 200×80×45cm, Đoản 220cm",
    pattern: "Chạm nghê bảo đỉnh",
    quantityPlanned: 1,
    quantityCompleted: 0,
    status: "Đang sản xuất",
    subStage: "danh_rap",
    assignedWorker: "Nguyễn Văn Đức",
    startDate: "2026-03-03",
    expectedEndDate: "2026-03-25",
    date: "2026-03-03T08:00:00",
    customerName: "Hoàng Nguyệt Ánh",
    notes: "Mặt bàn đục nguyên khối không ghép",
    timeline: [
      { time: "03/03/2026 08:00", label: "Tạo lệnh sản xuất", desc: "Hệ thống tự tạo từ đơn DH-2603-0008", active: false },
      { time: "03/03/2026 08:15", label: "Giao việc", desc: "Giao cho thợ Nguyễn Văn Đức", active: false },
      { time: "03/03/2026 09:00", label: "Bắt đầu đánh ráp", desc: "Thợ xác nhận nhận việc, gia công khung sườn", active: true },
    ],
  },
  // ĐANG SẢN XUẤT — GIAI ĐOẠN PHUN SƠN
  LSX005: {
    code: "LSX-2603-0005",
    orderCode: "DH-2603-0012",
    orderId: "DH012",
    productName: "Bàn thờ chạm rồng",
    variantName: "Gỗ mít — Sơn PU bóng",
    material: "Gỗ mít",
    finish: "Sơn PU bóng",
    size: "217×81×127 cm",
    pattern: "Chạm rồng cuốn thủy",
    quantityPlanned: 2,
    quantityCompleted: 1,
    status: "Đang sản xuất",
    subStage: "phun_son",
    assignedWorker: "Lê Văn Hùng",
    startDate: "2026-03-04",
    expectedEndDate: "2026-03-20",
    date: "2026-03-04T09:00:00",
    customerName: "Nguyễn Thị Hồng",
    notes: "Sơn 3 lớp PU, hong khô 24h giữa mỗi lớp",
    timeline: [
      { time: "04/03/2026 09:00", label: "Tạo lệnh sản xuất", desc: "Hệ thống tự tạo", active: false },
      { time: "04/03/2026 09:15", label: "Giao việc", desc: "Giao cho thợ Lê Văn Hùng", active: false },
      { time: "04/03/2026 10:00", label: "Bắt đầu đánh ráp", desc: "Cắt phôi, đục và ráp khung", active: false },
      { time: "06/03/2026 08:00", label: "Hoàn thành đánh ráp", desc: "Khung sườn và chi tiết chạm hoàn chỉnh", active: false },
      { time: "06/03/2026 10:00", label: "Bắt đầu phun sơn", desc: "Phun lớp lót PU đầu tiên", active: true },
    ],
  },
  // HOÀN THÀNH
  LSX004: {
    code: "LSX-2603-0004",
    orderCode: "DH-2603-0008",
    orderId: "DH008",
    productName: "Kệ tivi nguyên khối",
    variantName: "Gỗ hương đá — PU đồng màu",
    material: "Gỗ hương đá",
    finish: "PU đồng màu bộ bàn ghế",
    size: "240×45×60 cm",
    pattern: "Trơn, phẳng",
    quantityPlanned: 1,
    quantityCompleted: 1,
    status: "Hoàn thành",
    subStage: null,
    assignedWorker: "Trần Minh Tâm",
    startDate: "2026-03-03",
    expectedEndDate: "2026-03-15",
    date: "2026-03-03T08:15:00",
    customerName: "Hoàng Nguyệt Ánh",
    notes: null,
    timeline: [
      { time: "03/03/2026 08:15", label: "Tạo lệnh sản xuất", desc: "Hệ thống tự tạo từ đơn DH-2603-0008", active: false },
      { time: "03/03/2026 08:30", label: "Giao việc", desc: "Giao cho thợ Trần Minh Tâm", active: false },
      { time: "03/03/2026 09:30", label: "Bắt đầu đánh ráp", desc: "Thợ xác nhận nhận việc", active: false },
      { time: "08/03/2026 16:00", label: "Hoàn thành đánh ráp", desc: "Ráp xong, chuyển phun sơn", active: false },
      { time: "09/03/2026 08:00", label: "Bắt đầu phun sơn", desc: "Phun PU lót + finish", active: false },
      { time: "12/03/2026 16:00", label: "Hoàn thành", desc: "Sản phẩm hoàn thiện, chờ kiểm tra chất lượng", active: true },
    ],
  },
};

// ===================== HELPERS =====================
const fmtDate = (s) => (s ? new Date(s).toLocaleDateString("vi-VN") : "Chưa xác định");

const fmtDateTime = (s) => {
  if (!s) return "—";
  const d = new Date(s);
  return `${d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} — ${d.toLocaleDateString("vi-VN")}`;
};

const statusStyle = (status) => {
  const m = {
    "Chờ xử lý": { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
    "Đang sản xuất": { bg: "#F5F3FF", text: "#7C3AED", border: "#DDD6FE" },
    "Hoàn thành": { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
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

const SpecItem = ({ label, value }) => (
  <div>
    <p className="text-[10px] uppercase font-bold text-gray-400">{label}</p>
    <p className="text-[12px] font-semibold text-gray-700">{value || "—"}</p>
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
  const p = MOCK_PRODUCTIONS[id] || {
    ...MOCK_PRODUCTIONS["LSX003"],
    code: `LSX-2603-${id?.replace(/\D/g, '') || "9999"}`,
  };
  const ss = statusStyle(p.status);
  const progress = p.quantityPlanned > 0 ? Math.round((p.quantityCompleted / p.quantityPlanned) * 100) : 0;
  const isWaiting = p.status === "Chờ xử lý";
  const isProducing = p.status === "Đang sản xuất";
  const isDone = p.status === "Hoàn thành";
  const isHold = false;

  const currentStageInfo = STAGES.find((s) => s.key === p.subStage);
  const currentStageIdx = STAGES.findIndex((s) => s.key === p.subStage);
  const isLastStage = currentStageIdx === STAGES.length - 1;

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
                  <Badge style={{ backgroundColor: ss.bg, color: ss.text, border: `1px solid ${ss.border}` }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ss.text }} />
                    {p.status}
                  </Badge>
                  {isProducing && currentStageInfo && (
                    <Badge style={{ backgroundColor: currentStageInfo.bg, color: currentStageInfo.color, border: `1px solid ${currentStageInfo.color}30` }}>
                      {(() => { const Icon = currentStageInfo.icon; return <Icon size={11} />; })()}
                      {currentStageInfo.label}
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
              {isWaiting && (
                <button
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold transition hover:opacity-90 cursor-pointer"
                  style={{ backgroundColor: "#7C3AED", color: "#fff" }}
                >
                  <UserPlus size={14} />
                  Giao việc cho thợ
                </button>
              )}
          
              {isProducing && isLastStage && (
                <button
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold transition hover:opacity-90 cursor-pointer"
                  style={{ backgroundColor: "#15803D", color: "#fff" }}
                >
                  <CheckCircle size={14} />
                  Đánh dấu hoàn thành
                </button>
              )}


            </div>
          </div>
        </div>

        {/* ═══════ SCROLLABLE CONTENT ═══════ */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">

          {/* ── BANNERS ── */}
          {isWaiting && (
            <div
              className="flex items-start gap-3 p-4 rounded-2xl"
              style={{ backgroundColor: "#FFF7ED", border: "1px solid #FED7AA" }}
            >
              <ClipboardList size={18} className="shrink-0 mt-0.5" style={{ color: "#C2410C" }} />
              <div>
                <p className="text-[13px] font-bold" style={{ color: "#9A3412" }}>Lệnh sản xuất chờ giao việc</p>
                <p className="text-[12px] mt-0.5" style={{ color: "#C2410C" }}>
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
                  Thợ {p.assignedWorker} đang gia công.
                  {p.subStage === "danh_rap" && " Cắt, đục, ráp khung sườn và chi tiết sản phẩm."}
                  {p.subStage === "phun_son" && " Xử lý bề mặt, phun sơn lót và sơn hoàn thiện."}
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

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2.5 bg-[#F9F9F9] p-3 rounded-xl border border-dashed border-gray-200">
                    <SpecItem label="Chất liệu gỗ" value={p.material} />
                    <SpecItem label="Kích thước" value={p.size} />
                    <SpecItem label="Hoàn thiện" value={p.finish} />
                    <SpecItem label="Hoa văn/Kiểu dáng" value={p.pattern} />
                    <SpecItem label="Số lượng kế hoạch" value={p.quantityPlanned} />
                    <SpecItem label="Đã hoàn thành" value={`${p.quantityCompleted}/${p.quantityPlanned}`} />
                  </div>

                  {p.notes && (
                    <div className="pt-3" style={{ borderTop: "1px solid var(--grid-border)" }}>
                      <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "var(--text-placeholder)" }}>Ghi chú</p>
                      <p className="text-[12px] mt-0.5" style={{ color: "var(--text-secondary)" }}>{p.notes}</p>
                    </div>
                  )}
                </div>
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
                      <p className="text-[11px] mt-0.5" style={{ color: "var(--text-placeholder)" }}>Bạn cần giao việc cho thợ</p>
                      <button
                        className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold transition hover:opacity-90 cursor-pointer"
                        style={{ backgroundColor: "#7C3AED", color: "#fff" }}
                      >
                        <UserPlus size={14} />
                        Giao việc
                      </button>
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
      </div>
    </>
  );
}
