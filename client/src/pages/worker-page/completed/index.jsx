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
  TrendingUp,
  Award,
} from "lucide-react";

// Mock Data cho Thợ (Chỉ List Đã Hoàn Thành)
const MOCK_TASKS = [
  {
    id: "T-0985",
    productName: "Bàn ăn gỗ sồi 6 ghế",
    woodType: "Gỗ Sồi",
    dimensions: "160 x 80 x 75 cm",
    status: "COMPLETED",
    isCustomOrder: true,
    orderCode: "DH-102",
    notes: "Khách khen làm đúng yêu cầu bo tròn viền.",
    completedAt: "14:30 Hôm nay",
    rating: 5,
    image: "/wood_products.png",
  },
  {
    id: "T-0982",
    productName: "Kệ sách treo tường thông minh",
    woodType: "Gỗ Công Nghiệp MDF",
    dimensions: "120 x 20 x 30 cm",
    status: "COMPLETED",
    isCustomOrder: false,
    orderCode: "NK-09",
    notes: "Xử lý bề mặt rất mịn, đạt chuẩn xuất xưởng.",
    completedAt: "09:15 Hôm qua",
    rating: 4,
    image: "/wood_products.png",
  },
  {
    id: "T-0975",
    productName: "Giường ngủ tân cổ điển",
    woodType: "Gỗ Gõ Đỏ",
    dimensions: "180 x 200 x 45 cm",
    status: "COMPLETED",
    isCustomOrder: true,
    orderCode: "DH-099",
    notes: "",
    completedAt: "Thứ 4, 18/02",
    rating: 5,
    image: "/wood_products.png",
  },
];

const STATUS_CONFIG = {
  COMPLETED: {
    label: "Đã Xong",
    color: "bg-green-100 text-green-700",
    icon: CheckCircle2,
  },
};

export default function WorkerCompleted() {
  const [tasks] = useState(MOCK_TASKS);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  const openTask = (task) => {
    setSelectedTask(task);
    setDrawerOpen(true);
  };

  const closeTask = () => {
    setDrawerOpen(false);
    setTimeout(() => setSelectedTask(null), 300); // Wait for transition
  };

  return (
    <div className="h-full relative overflow-hidden flex flex-col">
      {/* ── Header Area ── */}
      <div className="mb-4 flex flex-col gap-4 shrink-0 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-lg font-bold mb-0.5"
            style={{ color: "var(--text-main)" }}
          >
            Lịch sử Hoàn Thành
          </h1>
          <p
            className="text-[13px] font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            Tuyệt vời! Bạn đã hoàn thành{" "}
            <span className="text-green-600 font-bold">{tasks.length}</span>{" "}
            công việc gần đây.
          </p>
        </div>

        {/* Thống kê hiệu suất nhỏ */}
        <div className="flex gap-4">
          <div
            className="px-4 py-2 bg-white rounded-lg border flex items-center gap-3"
            style={{ borderColor: "var(--grid-border)" }}
          >
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
            <div>
              <p className="text-[11px] text-gray-500 font-medium">
                Trung bình/ngày
              </p>
              <p className="text-[14px] font-bold text-gray-900">4 Sản phẩm</p>
            </div>
          </div>
          <div
            className="px-4 py-2 bg-white rounded-lg border flex items-center gap-3"
            style={{ borderColor: "var(--grid-border)" }}
          >
            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
              <Award size={16} />
            </div>
            <div>
              <p className="text-[11px] text-gray-500 font-medium">
                Đánh giá QC
              </p>
              <p className="text-[14px] font-bold text-gray-900">4.8 / 5.0</p>
            </div>
          </div>
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
                  border: "1px solid var(--grid-border)",
                }}
              >
                {/* Image Section */}
                <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                  <img
                    src={task.image}
                    alt={task.productName}
                    className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  {/* Origin Badge */}
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

                  {/* Rating Overlay */}
                  <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-[11px] font-bold text-amber-600 shadow-sm flex items-center gap-1">
                    <Award size={12} fill="currentColor" />
                    {task.rating}/5 Đạt
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-3 flex-1 flex flex-col">
                  {/* Status Badge */}
                  <div className="mb-2 flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold ${
                        STATUS_CONFIG[task.status].color
                      }`}
                    >
                      <StatusIcon size={12} />
                      {STATUS_CONFIG[task.status].label}
                    </span>
                    <span className="text-[11px] font-medium text-gray-500">
                      {task.completedAt}
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
                    <span className="text-[11px] font-medium text-gray-400">
                      Mã: #{task.id}
                    </span>
                    <button className="h-6 px-2 bg-gray-50 text-gray-600 hover:bg-gray-200 transition-colors rounded text-[11px] font-bold flex items-center gap-1">
                      Xem Lại <CornerDownRight size={12} />
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
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-bold ${
                    STATUS_CONFIG[selectedTask.status].color
                  }`}
                >
                  <CheckCircle2 size={12} />
                  {STATUS_CONFIG[selectedTask.status].label}
                </span>
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
            <div className="flex-1 overflow-y-auto px-5 py-5 pb-8">
              <h2
                className="text-[16px] font-bold leading-tight mb-4"
                style={{ color: "var(--text-main)" }}
              >
                {selectedTask.productName}
              </h2>

              {/* Origin & Time */}
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
                <span className="px-2.5 py-1 rounded border bg-green-50 border-green-100 text-[12px] font-semibold text-green-700 flex items-center gap-1.5">
                  <Clock size={12} /> Hoàn thành: {selectedTask.completedAt}
                </span>
              </div>

              {/* Specs Grid */}
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Thông số kỹ thuật
              </h3>
              <div className="grid grid-cols-2 gap-3 mb-6">
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

              {/* QC Feedback */}
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Đánh giá từ Quản Đốc (QC)
              </h3>
              <div className="p-4 rounded-xl border border-green-200 bg-green-50 mb-6">
                <div className="flex items-center gap-1 text-amber-500 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Award
                      key={i}
                      size={16}
                      fill={i < selectedTask.rating ? "currentColor" : "none"}
                      className={
                        i >= selectedTask.rating ? "text-gray-300" : ""
                      }
                    />
                  ))}
                  <span className="text-[12px] font-bold text-green-700 ml-2">
                    Đạt Chuẩn QC
                  </span>
                </div>
                {selectedTask.notes ? (
                  <p className="text-[13px] font-medium text-green-800 italic leading-relaxed">
                    "{selectedTask.notes}"
                  </p>
                ) : (
                  <p className="text-[13px] text-green-600/70 italic">
                    Chưa có nhận xét thêm.
                  </p>
                )}
              </div>

              {/* Reference Image */}
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Ảnh nộp thành phẩm
              </h3>
              <div className="aspect-[4/3] rounded-xl overflow-hidden border border-gray-200">
                <img
                  src={selectedTask.image}
                  alt="Thành phẩm"
                  className="w-full h-full object-cover grayscale-[20%]"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
