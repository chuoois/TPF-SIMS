import { useState } from "react";
import {
  Clock,
  Play,
  Pause,
  CheckCircle2,
  AlertCircle,
  X,
  Camera,
  Upload,
  MessageSquare,
  Box,
  CornerDownRight,
} from "lucide-react";

// Mock Data cho Thợ
const MOCK_TASKS = [
  {
    id: "T-1001",
    productName: "Bàn ăn gỗ sồi 6 ghế",
    woodType: "Gỗ Sồi",
    dimensions: "160 x 80 x 75 cm",
    status: "SANDING", // WAITING, SANDING, QC_PENDING, COMPLETED, REWORK
    isCustomOrder: true,
    orderCode: "DH-102",
    notes: "Bo tròn 4 góc, chà nhẵn mặt dưới bàn.",
    deadline: "17:00 Hôm nay",
    image: "/wood_products.png",
  },
  {
    id: "T-1002",
    productName: "Ghế đôn sofa bọc nhung",
    woodType: "Khung Gỗ Thông",
    dimensions: "40 x 40 x 45 cm",
    status: "WAITING",
    isCustomOrder: false,
    orderCode: "NK-09",
    notes: "",
    deadline: "",
    image: "/wood_products.png",
  },
  {
    id: "T-1003",
    productName: "Kệ TV treo tường tối giản",
    woodType: "Gỗ Công Nghiệp MDF",
    dimensions: "200 x 30 x 40 cm",
    status: "REWORK",
    isCustomOrder: true,
    orderCode: "DH-105",
    notes: "Khách yêu cầu sơn bóng mờ.",
    qcFeedback: "Chà nhám góc trái chưa mịn, cần làm lại.",
    deadline: "12:00 Ngày mai",
    image: "/wood_products.png",
  },
];

const STATUS_CONFIG = {
  WAITING: {
    label: "Chờ xử lý",
    color: "bg-gray-100 text-gray-700",
    icon: Clock,
  },
  SANDING: {
    label: "Đang chà nhám",
    color: "bg-blue-100 text-blue-700",
    icon: Play,
  },
  PAINTING: {
    label: "Đang sơn/phủ",
    color: "bg-indigo-100 text-indigo-700",
    icon: Play,
  },
  QC_PENDING: {
    label: "Chờ duyệt",
    color: "bg-orange-100 text-orange-700",
    icon: AlertCircle,
  },
  REWORK: {
    label: "Làm lại",
    color: "bg-red-100 text-red-700 font-bold",
    icon: AlertCircle,
  },
  COMPLETED: {
    label: "Đã xong",
    color: "bg-green-100 text-green-700",
    icon: CheckCircle2,
  },
};

export default function WorkerDashboard() {
  const [tasks, setTasks] = useState(MOCK_TASKS);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [showCameraMode, setShowCameraMode] = useState(false);

  const openTask = (task) => {
    setSelectedTask(task);
    setDrawerOpen(true);
    setShowCameraMode(false);
  };

  const closeTask = () => {
    setDrawerOpen(false);
    setTimeout(() => setSelectedTask(null), 300); // Wait for transition
  };

  const updateTaskStatus = (id, newStatus) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, status: newStatus } : t)));
    setSelectedTask((prev) => (prev ? { ...prev, status: newStatus } : null));

    if (newStatus === "QC_PENDING") {
      setShowCameraMode(false);
    }
  };

  return (
    <div className="h-full relative overflow-hidden flex flex-col">
      {/* ── Header Area ── */}
      <div className="mb-4 flex items-center justify-between shrink-0">
        <div>
          <h1
            className="text-lg font-bold mb-0.5"
            style={{ color: "var(--text-main)" }}
          >
            Công việc đang chờ
          </h1>
          <p
            className="text-[13px] font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            Bạn có{" "}
            <span className="text-blue-600 font-bold">
              {tasks.filter((t) => t.status !== "COMPLETED").length}
            </span>{" "}
            công việc cần xử lý
          </p>
        </div>
      </div>

      {/* ── Task Grid ── */}
      <div className="flex-1 overflow-y-auto pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {tasks.map((task) => {
            const StatusIcon = STATUS_CONFIG[task.status].icon;
            return (
              <div
                key={task.id}
                onClick={() => openTask(task)}
                className="bg-white rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 group flex flex-col"
                style={{
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                  border:
                    task.status === "REWORK"
                      ? "1px solid #ef4444"
                      : "1px solid var(--grid-border)",
                }}
              >
                {/* Image Section */}
                <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                  <img
                    src={task.image}
                    alt={task.productName}
                    className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  {/* Source Badge */}
                  <div className="absolute top-2 left-2 flex gap-1">
                    <span
                      className={`px-2 py-0.5 text-[11px] font-bold rounded flex items-center shadow-sm ${
                        task.isCustomOrder
                          ? "bg-purple-600 text-white"
                          : "bg-white text-gray-700"
                      }`}
                    >
                      {task.isCustomOrder ? "⭐ Đặt Riêng" : "📦 Kho"}
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-3 flex-1 flex flex-col">
                  {/* Status Badge */}
                  <div className="mb-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold ${
                        STATUS_CONFIG[task.status].color
                      }`}
                    >
                      <StatusIcon size={12} />
                      {STATUS_CONFIG[task.status].label}
                    </span>
                  </div>

                  <h3
                    className="text-[13px] font-bold leading-tight mb-2 line-clamp-2"
                    style={{ color: "var(--text-main)" }}
                  >
                    {task.productName}
                  </h3>

                  <div className="space-y-1 mb-3 flex-1">
                    <p
                      className="text-[12px] flex items-center gap-1.5"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <span className="w-3.5 h-3.5 rounded-sm bg-amber-50 border text-amber-600 flex items-center justify-center text-[9px] font-bold">
                        G
                      </span>
                      {task.woodType}
                    </p>
                    <p
                      className="text-[12px] flex items-center gap-1.5"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <span className="w-3.5 h-3.5 rounded-sm bg-gray-50 border text-gray-500 flex items-center justify-center text-[9px] font-bold">
                        K
                      </span>
                      {task.dimensions}
                    </p>
                  </div>

                  {/* Footer */}
                  <div
                    className="pt-2.5 border-t border-dashed flex items-center justify-between"
                    style={{ borderColor: "var(--grid-border)" }}
                  >
                    <span className="text-[11px] font-bold text-red-500">
                      {task.deadline || "—"}
                    </span>
                    <button className="h-6 px-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors rounded text-[11px] font-bold flex items-center gap-1">
                      Mở <CornerDownRight size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══════════════ SLIDE-OUT TASK DETAILS PANEL ═══════════════ */}
      {/* Backdrop */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 backdrop-blur-[1px] transition-opacity"
          onClick={closeTask}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-[400px] bg-white z-50 transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-2xl flex flex-col ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {selectedTask && (
          <>
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-3 border-b"
              style={{ borderColor: "var(--grid-border)" }}
            >
              <div className="flex items-center gap-2">
                {(() => {
                  const DrawerIcon = STATUS_CONFIG[selectedTask.status].icon;
                  return (
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-bold ${
                        STATUS_CONFIG[selectedTask.status].color
                      }`}
                    >
                      <DrawerIcon size={12} />
                      {STATUS_CONFIG[selectedTask.status].label}
                    </span>
                  );
                })()}
                <span className="font-mono text-[12px] font-medium text-gray-400">
                  #{selectedTask.id}
                </span>
              </div>
              <button
                onClick={closeTask}
                className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto px-5 py-5 pb-24">
              {/* Rework Alert */}
              {selectedTask.status === "REWORK" && (
                <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-100 flex gap-2 text-red-700">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-[13px] mb-0.5">
                      Yêu cầu làm lại
                    </h4>
                    <p className="text-[12px] font-medium">
                      {selectedTask.qcFeedback}
                    </p>
                  </div>
                </div>
              )}

              <h2
                className="text-[16px] font-bold leading-tight mb-4"
                style={{ color: "var(--text-main)" }}
              >
                {selectedTask.productName}
              </h2>

              {/* Origin & Deadline */}
              <div className="flex flex-wrap gap-2 mb-5">
                <span
                  className={`px-2.5 py-1 rounded border text-[12px] font-semibold ${
                    selectedTask.isCustomOrder
                      ? "bg-purple-50 text-purple-700 border-purple-100"
                      : "bg-gray-50 text-gray-600 border-gray-100"
                  }`}
                >
                  Nguồn: {selectedTask.isCustomOrder ? "Đặt Riêng" : "Hàng Kho"}{" "}
                  ({selectedTask.orderCode})
                </span>
                {selectedTask.deadline && (
                  <span className="px-2.5 py-1 rounded border bg-red-50 border-red-100 text-[12px] font-semibold text-red-600">
                    Hạn chót: {selectedTask.deadline}
                  </span>
                )}
              </div>

              {/* Specs Grid */}
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Thông số kỹ thuật
              </h3>
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[11px] text-gray-400 mb-0.5 font-medium">
                    Loại Gỗ
                  </p>
                  <p className="font-bold text-[13px] text-gray-800">
                    {selectedTask.woodType}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[11px] text-gray-400 mb-0.5 font-medium">
                    Kích Thước
                  </p>
                  <p className="font-bold text-[13px] text-gray-800 flex items-center justify-between">
                    {selectedTask.dimensions}
                    <Box size={14} className="text-gray-300" />
                  </p>
                </div>
              </div>

              {/* Special Notes */}
              {selectedTask.notes && (
                <>
                  <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Lưu ý đặc biệt
                  </h3>
                  <div className="p-3.5 rounded-xl bg-yellow-50/80 border border-yellow-200">
                    <div className="flex gap-2 text-yellow-800">
                      <MessageSquare
                        size={14}
                        className="shrink-0 text-yellow-600 mt-0.5"
                      />
                      <p className="font-semibold text-[13px] leading-relaxed italic">
                        {selectedTask.notes}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* Camera Interface Mockup */}
              {showCameraMode && (
                <div className="mt-6 border-t pt-5 border-dashed">
                  <h3 className="text-[12px] font-bold text-gray-600 mb-2">
                    Tải ảnh xác nhận
                  </h3>
                  <div className="w-full h-40 bg-gray-50 rounded-xl overflow-hidden relative flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-gray-200 hover:bg-gray-100 transition cursor-pointer">
                    <Camera size={24} className="mb-2 text-gray-400" />
                    <p className="text-[12px] font-medium">
                      Bấm vào đây để chọn ảnh chụp bề mặt
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      updateTaskStatus(selectedTask.id, "QC_PENDING")
                    }
                    className="w-full mt-3 h-10 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold text-[13px] flex items-center justify-center gap-1.5 shadow-md transition-transform active:scale-95"
                  >
                    Nộp Ảnh Lên QC <CheckCircle2 size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Action Footer (Sticky) */}
            <div
              className="absolute bottom-0 left-0 w-full p-4 bg-white border-t"
              style={{ borderColor: "var(--grid-border)" }}
            >
              {/* Controls for WAITING or REWORK */}
              {(selectedTask.status === "WAITING" ||
                selectedTask.status === "REWORK") && (
                <button
                  onClick={() => updateTaskStatus(selectedTask.id, "SANDING")}
                  className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[13px] flex items-center justify-center gap-1.5 shadow-sm transition-transform active:scale-95 uppercase tracking-wide"
                >
                  <Play size={16} fill="currentColor" /> Bắt Đầu Làm
                </button>
              )}

              {/* Controls for IN PROGRESS (SANDING/PAINTING) */}
              {(selectedTask.status === "SANDING" ||
                selectedTask.status === "PAINTING") &&
                !showCameraMode && (
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        updateTaskStatus(selectedTask.id, "WAITING")
                      }
                      className="w-10 h-10 shrink-0 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg flex items-center justify-center transition-transform active:scale-95 border"
                      title="Tạm dừng"
                    >
                      <Pause size={16} fill="currentColor" />
                    </button>
                    <button
                      onClick={() => setShowCameraMode(true)}
                      className="flex-1 h-10 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold text-[13px] flex items-center justify-center gap-1.5 shadow-sm transition-transform active:scale-95 uppercase tracking-wide"
                    >
                      Hoàn Thành Bề Mặt <CheckCircle2 size={16} />
                    </button>
                  </div>
                )}

              {/* State for QC Pending */}
              {selectedTask.status === "QC_PENDING" && (
                <div className="w-full h-10 bg-orange-50 border border-orange-200 text-orange-600 rounded-lg font-bold text-[13px] flex items-center justify-center gap-1.5">
                  <AlertCircle size={16} /> Đang Chờ Quản Đốc Duyệt
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
