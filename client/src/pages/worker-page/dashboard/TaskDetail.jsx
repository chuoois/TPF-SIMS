import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Camera,
  Play,
  Check,
  PackageCheck,
  CircleDashed,
  Clock,
  Image as ImageIcon,
  ChevronRight,
  AlertCircle,
  PenTool,
  Ruler,
  FileSignature,
  Layers,
  TreePine,
  Maximize2,
  StickyNote,
  Upload,
  ChevronLeft,
  ZoomIn,
  Palette,
} from "lucide-react";
import { updateMockTaskStatus, getTaskById } from "../mock";

/* ─── Production Steps ─── */
const STEPS = [
  { id: 1, key: "WAITING", label: "Tiếp nhận", icon: PackageCheck },
  { id: 2, key: "SANDING", label: "Đánh giấy ráp", icon: Play },
  { id: 3, key: "PAINTING", label: "Phun sơn", icon: Play },
  { id: 4, key: "QC_PENDING", label: "Hoàn thiện", icon: CheckCircle2 },
];

const getStepIndex = (status) => {
  switch (status) {
    case "WAITING":
      return 0;
    case "SANDING":
      return 1;
    case "PAINTING":
      return 2;
    case "QC_PENDING":
      return 3;
    case "REWORK":
      return 1;
    case "COMPLETED":
      return 4;
    default:
      return 0;
  }
};

/* ─── Status badge helper ─── */
const getStatusBadge = (status) => {
  const map = {
    WAITING: {
      label: "Chờ xử lý",
      bg: "rgba(158,158,158,0.1)",
      color: "var(--text-secondary)",
      border: "var(--grid-border)",
    },
    SANDING: {
      label: "Đang chà nhám",
      bg: "rgba(33,164,244,0.08)",
      color: "#1a8fd4",
      border: "rgba(33,164,244,0.2)",
    },
    PAINTING: {
      label: "Đang sơn/phủ",
      bg: "rgba(67,104,224,0.08)",
      color: "#4368E0",
      border: "rgba(67,104,224,0.2)",
    },
    QC_PENDING: {
      label: "Chờ QC duyệt",
      bg: "rgba(255,153,0,0.08)",
      color: "#e08a00",
      border: "rgba(255,153,0,0.2)",
    },
    REWORK: {
      label: "Cần làm lại",
      bg: "rgba(229,72,77,0.08)",
      color: "var(--status-error)",
      border: "rgba(229,72,77,0.2)",
    },
    COMPLETED: {
      label: "Hoàn thành",
      bg: "rgba(52,176,87,0.08)",
      color: "var(--status-success)",
      border: "rgba(52,176,87,0.2)",
    },
  };
  return map[status] || map.WAITING;
};

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [selectedTask, setSelectedTask] = useState(null);
  const [showCameraMode, setShowCameraMode] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const task = getTaskById(id);
    if (task) {
      setSelectedTask(task);
    } else {
      navigate("/worker/dashboard");
    }
  }, [id, navigate]);

  const updateTaskStatus = (taskId, newStatus) => {
    updateMockTaskStatus(taskId, newStatus);
    // Re-read the task from mock to pick up any changes (e.g. startedAt)
    const updated = getTaskById(taskId);
    setSelectedTask(updated);

    if (newStatus === "QC_PENDING") {
      setShowCameraMode(false);
    }
  };

  if (!selectedTask) return null;

  const currentStepIndex = getStepIndex(selectedTask.status);
  const statusBadge = getStatusBadge(selectedTask.status);
  const progressPercent = Math.round(
    (currentStepIndex / STEPS.length) * 100
  );

  /* ─── Action Button ─── */
  const renderActionButton = () => {
    if (selectedTask.status === "WAITING" || selectedTask.status === "REWORK") {
      return (
        <button
          onClick={() => updateTaskStatus(selectedTask.id, "SANDING")}
          className="h-11 px-8 rounded-xl font-semibold text-[14px] transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          style={{
            background: "var(--brand-primary)",
            color: "#fff",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.filter = "brightness(1.1)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.filter = "none")}
        >
          <Play size={15} /> Bắt đầu sản xuất
        </button>
      );
    }

    if (
      selectedTask.status === "SANDING" ||
      selectedTask.status === "PAINTING"
    ) {
      if (showCameraMode) {
        return (
          <button
            onClick={() =>
              updateTaskStatus(
                selectedTask.id,
                selectedTask.status === "SANDING" ? "PAINTING" : "QC_PENDING"
              )
            }
            className="h-11 px-8 rounded-xl font-semibold text-[14px] transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            style={{
              background: "var(--status-success)",
              color: "#fff",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.filter = "brightness(1.1)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.filter = "none")}
          >
            <CheckCircle2 size={15} /> Nộp ảnh & Tiếp tục
          </button>
        );
      }
      return (
        <button
          onClick={() => setShowCameraMode(true)}
          className="h-11 px-8 rounded-xl font-semibold text-[14px] transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          style={{
            background: "var(--brand-primary)",
            color: "#fff",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.filter = "brightness(1.1)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.filter = "none")}
        >
          <Camera size={15} /> Xác nhận xong công đoạn
        </button>
      );
    }

    if (selectedTask.status === "QC_PENDING") {
      return (
        <button
          disabled
          className="h-11 px-8 rounded-xl font-semibold text-[14px] flex items-center justify-center gap-2 cursor-not-allowed"
          style={{
            background: "rgba(255,153,0,0.08)",
            color: "#e08a00",
            border: "1px solid rgba(255,153,0,0.2)",
          }}
        >
          <Clock size={15} /> Đang chờ QC duyệt
        </button>
      );
    }

    return null;
  };

  /* ─── Step Status UI ─── */
  const getStepStatusUI = (index, currentIdx) => {
    if (index < currentIdx) {
      return {
        badge: "Hoàn tất",
        badgeBg: "rgba(52,176,87,0.08)",
        badgeColor: "var(--status-success)",
        badgeBorder: "rgba(52,176,87,0.15)",
        iconBg: "var(--status-success)",
        iconColor: "#fff",
        titleColor: "var(--text-placeholder)",
        strikethrough: true,
        icon: Check,
      };
    } else if (index === currentIdx) {
      return {
        badge: "Đang xử lý",
        badgeBg: "rgba(52,176,87,0.08)",
        badgeColor: "var(--brand-primary)",
        badgeBorder: "rgba(52,176,87,0.15)",
        iconBg: "#fff",
        iconColor: "var(--brand-primary)",
        iconBorder: "var(--brand-primary)",
        titleColor: "var(--brand-primary)",
        strikethrough: false,
        icon: STEPS[index].icon,
      };
    } else {
      return {
        badge: "Chờ xử lý",
        badgeBg: "var(--bg-main)",
        badgeColor: "var(--text-placeholder)",
        badgeBorder: "var(--grid-border)",
        iconBg: "var(--bg-main)",
        iconColor: "var(--text-placeholder)",
        titleColor: "var(--text-placeholder)",
        strikethrough: false,
        icon: CircleDashed,
      };
    }
  };

  /* ─── Mock images array ─── */
  const productImages = [
    selectedTask.image,
    selectedTask.image,
    selectedTask.image,
    selectedTask.image,
  ];

  return (
    <div
      className="flex flex-col h-[calc(100vh-64px)] -m-6 overflow-y-auto"
      style={{ backgroundColor: "var(--bg-main)" }}
    >
      <div className="max-w-[1440px] mx-auto w-full flex flex-col gap-5 p-6 lg:p-8">
        {/* ═══════════ BREADCRUMB ═══════════ */}
        <div className="flex items-center gap-2 text-[13px]">
          <button
            onClick={() => navigate("/worker/dashboard")}
            className="flex items-center gap-1.5 font-medium transition-colors cursor-pointer"
            style={{ color: "var(--text-secondary)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--text-main)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--text-secondary)")
            }
          >
            <ArrowLeft size={14} />
            Quản lý công việc
          </button>
          <ChevronRight
            size={13}
            style={{ color: "var(--text-placeholder)", opacity: 0.5 }}
          />
          <span
            className="font-semibold"
            style={{ color: "var(--text-main)" }}
          >
            Chi tiết #{selectedTask.id}
          </span>
        </div>

        {/* ═══════════ HERO HEADER CARD ═══════════ */}
        <div
          className="bg-white rounded-2xl overflow-hidden"
          style={{
            border: "1px solid var(--grid-border)",
            boxShadow:
              "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
          }}
        >
          <div className="p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Left: Product title & badges */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <span
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold"
                  style={{
                    background: selectedTask.isCustomOrder
                      ? "rgba(67,104,224,0.08)"
                      : "var(--bg-main)",
                    color: selectedTask.isCustomOrder
                      ? "#4368E0"
                      : "var(--text-secondary)",
                    border: `1px solid ${
                      selectedTask.isCustomOrder
                        ? "rgba(67,104,224,0.15)"
                        : "var(--grid-border)"
                    }`,
                  }}
                >
                  {selectedTask.isCustomOrder
                    ? "🎯 Đặt riêng"
                    : "📦 Hàng kho"}
                </span>
                <span
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold"
                  style={{
                    background: statusBadge.bg,
                    color: statusBadge.color,
                    border: `1px solid ${statusBadge.border}`,
                  }}
                >
                  {statusBadge.label}
                </span>
                <span
                  className="text-[12px] font-medium"
                  style={{ color: "var(--text-placeholder)" }}
                >
                  Mã ĐH:{" "}
                  <strong style={{ color: "var(--text-main)" }}>
                    {selectedTask.orderCode}
                  </strong>
                </span>
              </div>
              <h1
                className="text-[22px] lg:text-[26px] font-bold leading-tight"
                style={{ color: "var(--text-main)" }}
              >
                {selectedTask.productName}
              </h1>
            </div>

            {/* Right: Progress ring */}
            <div className="flex items-center gap-4 shrink-0">
              <div className="relative w-16 h-16">
                <svg
                  viewBox="0 0 36 36"
                  className="w-full h-full -rotate-90"
                >
                  <circle
                    cx="18"
                    cy="18"
                    r="15.5"
                    fill="none"
                    stroke="var(--bg-main)"
                    strokeWidth="3"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.5"
                    fill="none"
                    stroke="var(--brand-primary)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${progressPercent} 100`}
                    style={{ transition: "stroke-dasharray 0.6s ease" }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className="text-[14px] font-bold"
                    style={{ color: "var(--brand-primary)" }}
                  >
                    {progressPercent}%
                  </span>
                </div>
              </div>
              <div className="flex flex-col">
                <span
                  className="text-[12px] font-medium"
                  style={{ color: "var(--text-placeholder)" }}
                >
                  Tiến độ
                </span>
                <span
                  className="text-[14px] font-bold"
                  style={{ color: "var(--text-main)" }}
                >
                  {currentStepIndex}/{STEPS.length} bước
                </span>
                {selectedTask.deadline && (
                  <span className="text-[11px] font-semibold mt-0.5 flex items-center gap-1"
                    style={{ color: "var(--status-error)" }}>
                    <Clock size={11} />
                    {selectedTask.deadline}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Thin progress bar */}
          <div
            style={{
              height: 3,
              background: "var(--bg-main)",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progressPercent}%`,
                background: "var(--brand-primary)",
                borderRadius: "0 2px 2px 0",
                transition: "width 0.6s ease",
              }}
            />
          </div>
        </div>

        {/* ═══════════ MAIN 2-COLUMN LAYOUT ═══════════ */}
        <div className="flex flex-col lg:flex-row gap-5 items-start w-full">
          {/* ────── LEFT COLUMN ────── */}
          <div className="w-full lg:w-[42%] shrink-0 flex flex-col gap-5">
            {/* Image / Blueprint Card */}
            <div
              className="bg-white rounded-2xl overflow-hidden"
              style={{
                border: "1px solid var(--grid-border)",
                boxShadow:
                  "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
              }}
            >
              {!selectedTask.isCustomOrder ? (
                /* ── Stock Product Gallery ── */
                <div className="p-5 flex flex-col gap-4">
                  <div
                    className="flex items-center gap-2 pb-3"
                    style={{
                      borderBottom: "1px solid var(--grid-border)",
                    }}
                  >
                    <ImageIcon
                      size={15}
                      style={{ color: "var(--brand-primary)" }}
                    />
                    <h3
                      className="text-[13px] font-bold"
                      style={{ color: "var(--text-main)" }}
                    >
                      Hình ảnh sản phẩm tham khảo
                    </h3>
                  </div>
                  {/* Main Image */}
                  <div
                    className="aspect-[4/3] rounded-xl overflow-hidden relative group cursor-zoom-in"
                    style={{
                      background: "var(--bg-main)",
                      border: "1px solid var(--grid-border)",
                    }}
                  >
                    <img
                      src={productImages[activeImageIndex]}
                      alt="Main preview"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
                      <ZoomIn
                        size={28}
                        className="text-white opacity-0 group-hover:opacity-80 transition-opacity drop-shadow-lg"
                      />
                    </div>
                  </div>
                  {/* Thumbnail strip */}
                  <div className="flex gap-2">
                    {productImages.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImageIndex(i)}
                        className="w-16 h-12 rounded-lg overflow-hidden cursor-pointer transition-all"
                        style={{
                          border:
                            activeImageIndex === i
                              ? "2px solid var(--brand-primary)"
                              : "2px solid var(--grid-border)",
                          opacity: activeImageIndex === i ? 1 : 0.6,
                        }}
                      >
                        <img
                          src={img}
                          alt={`Thumb ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* ── Custom Order Blueprint ── */
                <div className="p-5 flex flex-col gap-4">
                  <div
                    className="flex items-center gap-2 pb-3"
                    style={{
                      borderBottom: "1px solid var(--grid-border)",
                    }}
                  >
                    <PenTool
                      size={15}
                      style={{ color: "#4368E0" }}
                    />
                    <h3
                      className="text-[13px] font-bold"
                      style={{ color: "var(--text-main)" }}
                    >
                      Bản vẽ / Yêu cầu gia công
                    </h3>
                  </div>
                  <div
                    className="aspect-[4/3] w-full rounded-xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden"
                    style={{
                      background: "var(--bg-main)",
                      border: "2px dashed rgba(67,104,224,0.25)",
                    }}
                  >
                    {/* Blueprint grid pattern */}
                    <div
                      className="absolute inset-0 opacity-[0.04]"
                      style={{
                        backgroundImage:
                          "linear-gradient(#4368E0 1px, transparent 1px), linear-gradient(90deg, #4368E0 1px, transparent 1px)",
                        backgroundSize: "24px 24px",
                      }}
                    />
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 relative z-10"
                      style={{
                        background: "#fff",
                        border: "1px solid var(--grid-border)",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                      }}
                    >
                      <Ruler
                        size={28}
                        strokeWidth={1.5}
                        style={{ color: "#4368E0" }}
                      />
                    </div>
                    <h4
                      className="text-[16px] font-bold mb-1.5 relative z-10"
                      style={{ color: "var(--text-main)" }}
                    >
                      Sản phẩm đặt riêng
                    </h4>
                    <p
                      className="text-[13px] max-w-[85%] relative z-10 leading-relaxed"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Theo thông số tùy chỉnh đơn hàng{" "}
                      <strong style={{ color: "#4368E0" }}>
                        {selectedTask.orderCode}
                      </strong>
                    </p>
                    <button
                      className="mt-5 px-4 py-2 rounded-lg text-[12px] font-semibold flex items-center gap-2 cursor-pointer transition-colors relative z-10"
                      style={{
                        background: "#fff",
                        color: "var(--text-main)",
                        border: "1px solid var(--grid-border)",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.borderColor =
                          "var(--brand-primary)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.borderColor =
                          "var(--grid-border)")
                      }
                    >
                      <FileSignature
                        size={13}
                        style={{ color: "#4368E0" }}
                      />{" "}
                      Xem bản vẽ kỹ thuật PDF
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Specs Card */}
            <div
              className="bg-white rounded-2xl p-5"
              style={{
                border: "1px solid var(--grid-border)",
                boxShadow:
                  "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
              }}
            >
              <h3
                className="text-[13px] font-bold mb-4 flex items-center gap-2"
                style={{ color: "var(--text-main)" }}
              >
                <Layers size={15} style={{ color: "var(--brand-primary)" }} />
                Thông số kỹ thuật
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {/* Material */}
                <div
                  className="rounded-xl p-4 flex items-start gap-3"
                  style={{
                    background: "var(--bg-main)",
                    border: "1px solid var(--grid-border)",
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: "#fff",
                      border: "1px solid var(--grid-border)",
                    }}
                  >
                    <TreePine size={16} style={{ color: "var(--brand-primary)" }} />
                  </div>
                  <div>
                    <p
                      className="text-[11px] font-semibold mb-0.5"
                      style={{ color: "var(--text-placeholder)" }}
                    >
                      Vật liệu
                    </p>
                    <p
                      className="text-[14px] font-bold"
                      style={{ color: "var(--text-main)" }}
                    >
                      {selectedTask.woodType}
                    </p>
                  </div>
                </div>
                {/* Dimensions */}
                <div
                  className="rounded-xl p-4 flex items-start gap-3"
                  style={{
                    background: "var(--bg-main)",
                    border: "1px solid var(--grid-border)",
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: "#fff",
                      border: "1px solid var(--grid-border)",
                    }}
                  >
                    <Maximize2 size={16} style={{ color: "#4368E0" }} />
                  </div>
                  <div>
                    <p
                      className="text-[11px] font-semibold mb-0.5"
                      style={{ color: "var(--text-placeholder)" }}
                    >
                      Kích thước
                    </p>
                    <p
                      className="text-[14px] font-bold"
                      style={{ color: "var(--text-main)" }}
                    >
                      {selectedTask.dimensions}
                    </p>
                  </div>
                </div>
                {/* Color */}
                <div
                  className="rounded-xl p-4 flex items-start gap-3"
                  style={{
                    background: "var(--bg-main)",
                    border: "1px solid var(--grid-border)",
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: "#fff",
                      border: "1px solid var(--grid-border)",
                    }}
                  >
                    <Palette size={16} style={{ color: "#EA509D" }} />
                  </div>
                  <div>
                    <p
                      className="text-[11px] font-semibold mb-0.5"
                      style={{ color: "var(--text-placeholder)" }}
                    >
                      Màu sắc
                    </p>
                    <p
                      className="text-[14px] font-bold"
                      style={{ color: "var(--text-main)" }}
                    >
                      {selectedTask.color || "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedTask.notes && (
                <div
                  className="mt-3 rounded-xl p-4 flex gap-3"
                  style={{
                    background: "rgba(255,153,0,0.04)",
                    border: "1px solid rgba(255,153,0,0.15)",
                  }}
                >
                  <StickyNote
                    className="shrink-0 mt-0.5"
                    size={15}
                    style={{ color: "var(--status-pending)" }}
                  />
                  <div>
                    <p
                      className="text-[11px] font-bold mb-1"
                      style={{ color: "#e08a00" }}
                    >
                      GHI CHÚ YÊU CẦU
                    </p>
                    <p
                      className="text-[13px] leading-relaxed"
                      style={{ color: "var(--text-main)" }}
                    >
                      {selectedTask.notes}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ────── RIGHT COLUMN: PRODUCTION PROGRESS ────── */}
          <div className="flex-1 w-full flex flex-col gap-5">
            {/* Progress Timeline Card */}
            <div
              className="bg-white rounded-2xl flex flex-col"
              style={{
                border: "1px solid var(--grid-border)",
                boxShadow:
                  "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
              }}
            >
              {/* Card Header */}
              <div
                className="px-6 py-4 flex items-center justify-between"
                style={{
                  borderBottom: "1px solid var(--grid-border)",
                }}
              >
                <h3
                  className="text-[14px] font-bold flex items-center gap-2"
                  style={{ color: "var(--text-main)" }}
                >
                  Tiến độ sản xuất
                </h3>
                {selectedTask.deadline && (
                  <div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-semibold"
                    style={{
                      background: "rgba(229,72,77,0.06)",
                      color: "var(--status-error)",
                      border: "1px solid rgba(229,72,77,0.12)",
                    }}
                  >
                    <Clock size={12} />
                    Hạn: {selectedTask.deadline}
                  </div>
                )}
              </div>

              {/* Timeline */}
              <div className="p-6 flex-1">
                <div className="relative pl-1">
                  {/* Vertical track */}
                  <div
                    className="absolute left-[15px] top-4 bottom-4 w-[2px]"
                    style={{ background: "var(--grid-border)" }}
                  />

                  {STEPS.map((step, index) => {
                    const statusUI = getStepStatusUI(index, currentStepIndex);
                    const isCurrent = index === currentStepIndex;
                    const isCompleted = index < currentStepIndex;
                    const isLast = index === STEPS.length - 1;
                    const needsPhoto =
                      isCurrent &&
                      (step.key === "SANDING" || step.key === "PAINTING");
                    const hasMockPhoto =
                      isCompleted &&
                      (step.key === "SANDING" || step.key === "PAINTING");

                    return (
                      <div
                        key={step.id}
                        className="relative flex gap-4 z-10"
                        style={{
                          paddingBottom: isLast ? 0 : 32,
                        }}
                      >
                        {/* Step icon */}
                        <div className="flex flex-col items-center shrink-0">
                          <div
                            className="w-[32px] h-[32px] rounded-full flex items-center justify-center transition-all"
                            style={{
                              background: statusUI.iconBg,
                              color: statusUI.iconColor,
                              border: statusUI.iconBorder
                                ? `2px solid ${statusUI.iconBorder}`
                                : "1px solid var(--grid-border)",
                              boxShadow: isCurrent
                                ? "0 0 0 4px rgba(52,176,87,0.1)"
                                : "none",
                            }}
                          >
                            <statusUI.icon
                              size={14}
                              strokeWidth={isCurrent ? 2.5 : 2}
                            />
                          </div>
                          {/* Green completed line */}
                          {isCompleted && !isLast && (
                            <div
                              className="absolute left-[15px] top-[32px] w-[2px] z-10"
                              style={{
                                height: "calc(100% - 0px)",
                                background: "var(--status-success)",
                              }}
                            />
                          )}
                        </div>

                        {/* Step details */}
                        <div className="flex-1 min-w-0 pt-1">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                            <h4
                              className="text-[14px] font-semibold"
                              style={{
                                color: statusUI.titleColor,
                                textDecoration: statusUI.strikethrough
                                  ? "line-through"
                                  : "none",
                                opacity: statusUI.strikethrough ? 0.6 : 1,
                              }}
                            >
                              Bước {index + 1}: {step.label}
                            </h4>
                            <span
                              className="px-2 py-0.5 rounded-md text-[10px] font-bold"
                              style={{
                                background: statusUI.badgeBg,
                                color: statusUI.badgeColor,
                                border: `1px solid ${statusUI.badgeBorder}`,
                              }}
                            >
                              {statusUI.badge}
                            </span>
                          </div>

                          {/* Photo upload zone */}
                          {needsPhoto && showCameraMode && (
                            <div
                              className="mt-3 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors"
                              style={{
                                background: "rgba(52,176,87,0.03)",
                                border:
                                  "2px dashed rgba(52,176,87,0.25)",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.background =
                                  "rgba(52,176,87,0.06)")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.background =
                                  "rgba(52,176,87,0.03)")
                              }
                            >
                              <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center mb-2.5"
                                style={{
                                  background: "#fff",
                                  border: "1px solid var(--grid-border)",
                                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                                }}
                              >
                                <Upload
                                  size={18}
                                  style={{
                                    color: "var(--brand-primary)",
                                  }}
                                />
                              </div>
                              <p
                                className="text-[13px] font-bold"
                                style={{
                                  color: "var(--brand-primary)",
                                }}
                              >
                                Tải lên ảnh chứng minh
                              </p>
                              <p
                                className="text-[11px] mt-1 text-center font-medium"
                                style={{
                                  color: "var(--text-placeholder)",
                                }}
                              >
                                Bắt buộc nộp ảnh trước khi sang công đoạn
                                tiếp theo
                              </p>
                            </div>
                          )}

                          {/* Completed photo thumbnail */}
                          {hasMockPhoto && (
                            <div
                              className="mt-2.5 flex items-center gap-3 p-2.5 rounded-lg w-fit cursor-zoom-in"
                              style={{
                                background: "var(--bg-main)",
                                border: "1px solid var(--grid-border)",
                              }}
                            >
                              <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0">
                                <img
                                  src={
                                    selectedTask.isCustomOrder
                                      ? "/wood_products.png"
                                      : selectedTask.image
                                  }
                                  alt="Proof"
                                  className="w-full h-full object-cover"
                                  style={{ filter: "grayscale(20%)" }}
                                />
                              </div>
                              <div className="flex flex-col pr-2">
                                <span
                                  className="text-[12px] font-bold flex items-center gap-1.5"
                                  style={{
                                    color: "var(--text-main)",
                                  }}
                                >
                                  <CheckCircle2
                                    size={13}
                                    style={{
                                      color: "var(--status-success)",
                                    }}
                                  />
                                  Đã cập nhật ảnh
                                </span>
                                <span
                                  className="text-[11px] mt-0.5 font-medium"
                                  style={{
                                    color: "var(--text-placeholder)",
                                  }}
                                >
                                  Lúc 14:00 hôm nay
                                </span>
                              </div>
                            </div>
                          )}

                          {/* QC Rework feedback */}
                          {isCurrent &&
                            selectedTask.status === "REWORK" &&
                            step.key === "SANDING" &&
                            selectedTask.qcFeedback && (
                              <div
                                className="mt-3 p-3.5 rounded-xl text-[13px] flex gap-2.5"
                                style={{
                                  background: "rgba(229,72,77,0.04)",
                                  border:
                                    "1px solid rgba(229,72,77,0.12)",
                                  color: "var(--status-error)",
                                }}
                              >
                                <AlertCircle
                                  className="shrink-0 mt-0.5"
                                  size={14}
                                />
                                <div>
                                  <span className="font-bold block mb-0.5">
                                    Lỗi kiểm định QC:
                                  </span>
                                  <span style={{ color: "var(--text-main)" }}>
                                    {selectedTask.qcFeedback}
                                  </span>
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Footer */}
              <div
                className="px-6 py-4 flex justify-end"
                style={{
                  borderTop: "1px solid var(--grid-border)",
                }}
              >
                {renderActionButton()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
