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
  Box,
  Image as ImageIcon,
  ChevronRight,
  AlertCircle,
  PenTool,
  Ruler,
  FileSignature,
} from "lucide-react";
import { MOCK_TASKS, updateMockTaskStatus, getTaskById } from "../mock";

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

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [selectedTask, setSelectedTask] = useState(null);
  const [showCameraMode, setShowCameraMode] = useState(false);

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
    setSelectedTask({ ...selectedTask, status: newStatus });

    if (newStatus === "QC_PENDING") {
      setShowCameraMode(false);
    }
  };

  if (!selectedTask) return null;

  const currentStepIndex = getStepIndex(selectedTask.status);

  // Dynamic Button Render based on status
  const renderActionButton = () => {
    if (selectedTask.status === "WAITING" || selectedTask.status === "REWORK") {
      return (
        <button
          onClick={() => updateTaskStatus(selectedTask.id, "SANDING")}
          className="h-11 px-8 bg-[#3B82F6] hover:bg-blue-600 text-white rounded-[10px] font-semibold text-[14px] transition-all shadow-sm flex items-center justify-center gap-2"
        >
          Bắt đầu sản xuất
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
                selectedTask.status === "SANDING" ? "PAINTING" : "QC_PENDING",
              )
            }
            className="h-11 px-8 bg-[#10B981] hover:bg-emerald-600 text-white rounded-[10px] font-semibold text-[14px] transition-all shadow-sm flex items-center justify-center gap-2"
          >
            Nộp ảnh & Tiếp tục <CheckCircle2 size={16} />
          </button>
        );
      }
      return (
        <button
          onClick={() => setShowCameraMode(true)}
          className="h-11 px-8 bg-[#3B82F6] hover:bg-blue-600 text-white rounded-[10px] font-semibold text-[14px] transition-all shadow-sm flex items-center justify-center gap-2"
        >
          Xác nhận xong công đoạn <Camera size={16} />
        </button>
      );
    }

    if (selectedTask.status === "QC_PENDING") {
      return (
        <button
          disabled
          className="h-11 px-8 bg-amber-50 text-amber-600 border border-amber-200 rounded-[10px] font-semibold text-[14px] cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Clock size={16} /> Đang chờ QC duyệt
        </button>
      );
    }

    return null;
  };

  const getStepStatusUI = (index, currentIdx) => {
    if (index < currentIdx) {
      return {
        badge: "Hoàn tất",
        badgeClasses:
          "bg-emerald-50 text-emerald-700 border border-emerald-100",
        iconClasses: "bg-emerald-500 text-white border-emerald-500 shadow-sm",
        titleClasses: "text-slate-900 font-semibold line-through opacity-60",
        icon: Check,
      };
    } else if (index === currentIdx) {
      return {
        badge: "Đang xử lý",
        badgeClasses: "bg-blue-50 text-blue-700 border border-blue-200",
        iconClasses:
          "bg-white text-blue-600 border-[#3B82F6] border-[2px] shadow-sm",
        titleClasses: "text-blue-700 font-bold",
        icon: STEPS[index].icon,
      };
    } else {
      return {
        badge: "Chờ xử lý",
        badgeClasses: "bg-slate-50 text-slate-500 border border-slate-200",
        iconClasses: "bg-slate-50 text-slate-400 border-slate-200",
        titleClasses: "text-slate-500 font-medium",
        icon: CircleDashed,
      };
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] -m-6 overflow-y-auto bg-[#F8FAFC]">
      <div className="max-w-[1400px] mx-auto w-full flex flex-col gap-6 min-h-full p-6 lg:p-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center text-[13px] font-medium text-slate-500">
          <button
            onClick={() => navigate("/worker/dashboard")}
            className="hover:text-slate-900 transition-colors flex items-center gap-1.5"
          >
            Quản lý công việc
          </button>
          <ChevronRight size={14} className="mx-2 opacity-50" />
          <span className="text-slate-900 font-semibold">
            Chi tiết lệnh sản xuất #{selectedTask.id}
          </span>
        </div>

        {/* --- MAIN 2-COLUMN LAYOUT --- */}
        <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
          {/* ================= LEFT COLUMN: IMAGES / BLUEPRINTS ================= */}
          <div className="w-full lg:w-[45%] shrink-0">
            <div className="bg-white rounded-[12px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-slate-200">
              {!selectedTask.isCustomOrder ? (
                /* 1. HIỂN THỊ HÀNG CÓ SẴN (STOCK): GALLERY 2x2 */
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h3 className="text-[14px] font-bold text-slate-800 flex items-center gap-2">
                      <ImageIcon size={16} className="text-blue-500" /> Hình ảnh
                      sản phẩm tham khảo
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="aspect-[4/3] bg-slate-50 rounded-[8px] relative overflow-hidden group border border-slate-100 cursor-zoom-in"
                      >
                        <img
                          src={selectedTask.image}
                          alt={`Reference ${i}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* 2. HIỂN THỊ HÀNG ĐẶT RIÊNG (CUSTOM): BLUEPRINT PLACEHOLDER */
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h3 className="text-[14px] font-bold text-slate-800 flex items-center gap-2">
                      <PenTool size={16} className="text-indigo-500" /> Bản vẽ /
                      Yêu cầu gia công
                    </h3>
                  </div>

                  <div className="aspect-square lg:aspect-[4/3] w-full bg-[#F8FAFC] rounded-[8px] border-2 border-dashed border-indigo-200/60 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                    {/* Blueprint background pattern */}
                    <div
                      className="absolute inset-0 opacity-[0.03]"
                      style={{
                        backgroundImage:
                          "linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)",
                        backgroundSize: "20px 20px",
                      }}
                    ></div>

                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm text-indigo-500 mb-6 relative z-10 border border-indigo-50">
                      <Ruler size={32} strokeWidth={1.5} />
                    </div>

                    <h4 className="text-[18px] font-bold text-slate-800 mb-2 relative z-10">
                      Sản phẩm đặt riêng
                    </h4>
                    <p className="text-[14px] text-slate-500 max-w-[80%] relative z-10">
                      Sản phẩm này được sản xuất theo thông số tùy chỉnh của đơn
                      hàng{" "}
                      <strong className="text-indigo-600">
                        {selectedTask.orderCode}
                      </strong>
                      .
                    </p>

                    {/* Mock Document link */}
                    <button className="mt-6 px-4 py-2 bg-white border border-slate-200 rounded-[8px] text-[13px] font-semibold text-slate-700 shadow-sm flex items-center gap-2 hover:bg-slate-50 transition-colors relative z-10">
                      <FileSignature size={14} className="text-blue-500" /> Xem
                      bản vẽ kỹ thuật PDF
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ================= RIGHT COLUMN: INFO & PROGRESS ================= */}
          <div className="flex-1 w-full flex flex-col gap-6">
            {/* Top Card: Identity & Specs */}
            <div className="bg-white p-6 rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-slate-200 flex flex-col">
              {/* Badge Row */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span
                  className={`px-2.5 py-1 rounded-[6px] text-[12px] font-bold flex items-center gap-1.5 ${
                    selectedTask.isCustomOrder
                      ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                      : "bg-slate-100 text-slate-700 border border-slate-200"
                  }`}
                >
                  {selectedTask.isCustomOrder
                    ? "🎯 Đặt riêng (Custom)"
                    : "📦 Hàng kho (Stock)"}
                </span>
                <span className="text-[13px] font-medium text-slate-500">
                  Mã ĐH:{" "}
                  <strong className="text-slate-700">
                    {selectedTask.orderCode}
                  </strong>
                </span>
              </div>

              <h1 className="text-[24px] lg:text-[28px] font-bold text-slate-900 leading-tight mb-6">
                {selectedTask.productName}
              </h1>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-[#F8FAFC] border border-slate-100 rounded-[8px] p-4">
                  <p className="text-[12px] font-semibold text-slate-500 mb-1">
                    Vật liệu chính
                  </p>
                  <p className="text-[15px] font-bold text-slate-800">
                    {selectedTask.woodType}
                  </p>
                </div>
                <div className="bg-[#F8FAFC] border border-slate-100 rounded-[8px] p-4">
                  <p className="text-[12px] font-semibold text-slate-500 mb-1">
                    Kích thước
                  </p>
                  <p className="text-[15px] font-bold text-slate-800">
                    {selectedTask.dimensions}
                  </p>
                </div>
              </div>

              {/* Customer Notes */}
              {selectedTask.notes && (
                <div className="bg-amber-50 border border-amber-100 rounded-[8px] p-4 flex gap-3">
                  <AlertCircle className="text-amber-600 shrink-0" size={18} />
                  <div className="text-[13px] text-amber-900 leading-relaxed">
                    <span className="font-bold">Ghi chú yêu cầu: </span>
                    {selectedTask.notes}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Card: Progress Timeline */}
            <div className="bg-white p-6 rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-slate-200 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                <h3 className="text-[16px] font-bold text-slate-900 flex items-center gap-2.5">
                  Tiến độ sản xuất
                </h3>
                <div className="flex items-center gap-2 text-[13px]">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  <span className="text-slate-500">Deadline:</span>
                  <span className="font-bold text-slate-800">
                    {selectedTask.deadline || "Không có"}
                  </span>
                </div>
              </div>

              {/* TIMELINE STEPPER */}
              <div className="relative pl-2 pb-4 flex-1">
                {/* Vertical Track line */}
                <div className="absolute top-4 left-[23px] bottom-6 w-[2px] bg-slate-100 z-0"></div>

                {STEPS.map((step, index) => {
                  const statusUI = getStepStatusUI(index, currentStepIndex);
                  const isCurrent = index === currentStepIndex;
                  const isCompleted = index < currentStepIndex;
                  const needsPhoto =
                    isCurrent &&
                    (step.key === "SANDING" || step.key === "PAINTING");
                  const hasMockPhoto =
                    isCompleted &&
                    (step.key === "SANDING" || step.key === "PAINTING");

                  return (
                    <div
                      key={step.id}
                      className="relative flex gap-5 mb-10 last:mb-0 z-10"
                    >
                      {/* Status Icon */}
                      <div className="flex flex-col items-center shrink-0">
                        <div
                          className={`w-[32px] h-[32px] rounded-full flex items-center justify-center transition-colors ${statusUI.iconClasses}`}
                        >
                          <statusUI.icon
                            size={14}
                            strokeWidth={isCurrent ? 2.5 : 2}
                          />
                        </div>
                        {/* Active green line override */}
                        {isCompleted && index !== STEPS.length - 1 && (
                          <div className="absolute top-[32px] left-[15px] w-[2px] h-[calc(100%+8px)] bg-emerald-500 z-10"></div>
                        )}
                      </div>

                      {/* Step Details */}
                      <div className="flex-1 min-w-0 pt-1">
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-1.5">
                          <h4
                            className={`text-[15px] ${statusUI.titleClasses}`}
                          >
                            Bước {index + 1}: {step.label}
                          </h4>
                          <span
                            className={`px-2 py-0.5 rounded-[4px] text-[11px] font-bold border ${statusUI.badgeClasses}`}
                          >
                            {statusUI.badge}
                          </span>
                        </div>

                        {/* CAMERA DROPZONE (For Current Actionable Step) */}
                        {needsPhoto && showCameraMode && (
                          <div className="mt-4 max-w-sm rounded-[8px] bg-blue-50/50 border border-dashed border-blue-300 p-5 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 transition-colors animate-in fade-in slide-in-from-top-2">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-500 border border-blue-100 mb-3">
                              <Camera size={20} />
                            </div>
                            <p className="text-[13px] font-bold text-blue-700">
                              Tải lên ảnh chứng minh
                            </p>
                            <p className="text-[12px] text-blue-600/70 mt-1 text-center font-medium px-2">
                              Bắt buộc nộp ảnh trước khi sang công đoạn tiếp
                              theo
                            </p>
                          </div>
                        )}

                        {/* THUMBNAIL (For Completed Steps) */}
                        {hasMockPhoto && (
                          <div className="mt-3 flex items-center gap-3 p-2 bg-slate-50 rounded-[8px] border border-slate-100 w-fit cursor-zoom-in">
                            <div className="w-12 h-12 rounded-[6px] bg-slate-200 overflow-hidden relative">
                              {/* Just a demo placeholder, not real custom image if it was custom */}
                              <img
                                src={
                                  selectedTask.isCustomOrder
                                    ? "/wood_products.png"
                                    : selectedTask.image
                                }
                                alt="Proof"
                                className="w-full h-full object-cover grayscale-[30%]"
                              />
                            </div>
                            <div className="flex flex-col pr-2">
                              <span className="text-[12px] font-bold text-slate-700 flex items-center gap-1.5">
                                <CheckCircle2
                                  size={14}
                                  className="text-emerald-500"
                                />{" "}
                                Đã cập nhật ảnh
                              </span>
                              <span className="text-[11px] text-slate-500 mt-0.5 font-medium">
                                Lúc 14:00 hôm nay
                              </span>
                            </div>
                          </div>
                        )}

                        {/* QC Revision logic if any */}
                        {isCurrent &&
                          selectedTask.status === "REWORK" &&
                          step.key === "SANDING" &&
                          selectedTask.qcFeedback && (
                            <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-[8px] text-[13px] text-red-700">
                              <span className="font-bold flex items-center gap-1.5 mb-1">
                                <AlertCircle size={14} /> Lỗi kiểm định QC:
                              </span>
                              {selectedTask.qcFeedback}
                            </div>
                          )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Footer */}
              <div className="mt-6 pt-6 border-t border-slate-100 flex justify-end">
                {renderActionButton()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
