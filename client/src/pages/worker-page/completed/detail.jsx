import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import { Clock, CheckCircle2, Box, ArrowLeft } from "lucide-react";

export default function CompletedTaskDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const task = location.state?.task;

  // Render similar to the drawer, but full width
  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)]">
        <p className="text-gray-500 font-medium">
          Không tìm thấy thông tin công việc (hoặc chưa truyền dữ liệu).
        </p>
        <button
          onClick={() => navigate("/worker/completed")}
          className="text-blue-600 font-semibold mt-4 hover:underline"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  // Same status config
  const STATUS_CONFIG = {
    COMPLETED: {
      label: "Đã Xong",
      color: "bg-green-100 text-green-700",
      icon: CheckCircle2,
    },
  };

  return (
    <div
      className="flex flex-col min-h-[calc(100vh-64px)] -m-6 p-6 space-y-6 max-w-5xl mx-auto w-full"
      style={{ backgroundColor: "transparent" }}
    >
      {/* Header with Back button */}
      <div className="flex items-center gap-4 shrink-0">
        <Link
          to="/worker/completed"
          className="w-10 h-10 rounded-full flex items-center justify-center bg-white border shadow-sm hover:bg-gray-50 transition-colors"
          style={{ borderColor: "var(--grid-border)" }}
        >
          <ArrowLeft size={18} style={{ color: "var(--text-main)" }} />
        </Link>
        <div>
          <h1
            className="text-xl font-bold"
            style={{ color: "var(--text-main)" }}
          >
            Chi tiết công việc hoàn thành
          </h1>
          <p className="text-[13px] text-gray-500 mt-0.5">
            Mã công việc: #{task.id}
          </p>
        </div>
      </div>

      <div
        className="bg-white rounded-2xl shadow-sm border p-6 flex flex-col sm:flex-row gap-8"
        style={{ borderColor: "var(--grid-border)" }}
      >
        {/* Left: Image (if any) */}
        <div className="w-full sm:w-1/3 shrink-0 flex flex-col gap-4">
          <div className="aspect-[4/3] rounded-xl overflow-hidden border border-gray-200">
            <img
              src={task.image}
              alt={task.productName}
              className="w-full h-full object-cover grayscale-[20%]"
            />
          </div>
        </div>

        {/* Right: Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-4">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[13px] font-bold ${
                STATUS_CONFIG[task.status].color
              }`}
            >
              <CheckCircle2 size={13} />
              {STATUS_CONFIG[task.status].label}
            </span>
          </div>

          <h2
            className="text-[20px] font-bold leading-tight mb-4"
            style={{ color: "var(--text-main)" }}
          >
            {task.productName}
          </h2>

          <div className="flex flex-wrap gap-2 mb-6">
            <span
              className={`px-3 py-1.5 rounded-lg border text-[13px] font-semibold ${
                task.isCustomOrder
                  ? "bg-purple-50 text-purple-700 border-purple-100"
                  : "bg-gray-50 text-gray-600 border-gray-100"
              }`}
            >
              Nguồn: {task.isCustomOrder ? "Đặt Riêng" : "Hàng Kho"} (
              {task.orderCode})
            </span>
            <span className="px-3 py-1.5 rounded-lg border bg-blue-50 border-blue-100 text-[13px] font-semibold text-blue-700 flex items-center gap-1.5">
              <Clock size={14} /> Bắt đầu: {task.startedAt || "—"}
            </span>
            <span className="px-3 py-1.5 rounded-lg border bg-green-50 border-green-100 text-[13px] font-semibold text-green-700 flex items-center gap-1.5">
              <Clock size={14} /> Hoàn thành: {task.completedAt}
            </span>
          </div>

          <h3 className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-3">
            Thông số kỹ thuật
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-[12px] text-gray-400 mb-1 font-medium">
                Loại Gỗ
              </p>
              <p className="font-bold text-[14px] text-gray-800">
                {task.woodType}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-[12px] text-gray-400 mb-1 font-medium">
                Kích Thước
              </p>
              <p className="font-bold text-[14px] text-gray-800 flex items-center justify-between">
                {task.dimensions}
                <Box size={16} className="text-gray-300" />
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 col-span-2">
              <p className="text-[12px] text-gray-400 mb-1 font-medium">
                Màu sắc
              </p>
              <p className="font-bold text-[14px] text-gray-800">
                {task.colorType || "Như thiết kế tiêu chuẩn"}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 col-span-2 flex flex-col gap-1.5">
              <p className="text-[12px] text-gray-400 font-medium">
                Ghi chú yêu cầu
              </p>
              {task.notes ? (
                <p className="font-medium text-[14px] text-gray-800 leading-relaxed italic">
                  "{task.notes}"
                </p>
              ) : (
                <p className="text-[14px] text-gray-400 italic">—</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
