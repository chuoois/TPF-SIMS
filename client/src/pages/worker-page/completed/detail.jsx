import { useNavigate, useParams } from "react-router-dom";
import { Clock, CheckCircle2, ArrowLeft, TreePine, Maximize2, Palette, Layers, Camera, ZoomIn, X } from "lucide-react";
import { useState, useEffect } from "react";
import workerService from "@/services/worker.service";

export default function CompletedTaskDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [zoomImage, setZoomImage] = useState(null);
  const [task, setTask] = useState(null);

  useEffect(() => {
    const fetchTask = async () => {
      if (id) {
        try {
          const res = await workerService.getCompletedTasks();
          let foundTask = null;
          for (const order of res.data) {
            const item = order.items.find((i) => i.id === id);
            if (item) {
              foundTask = {
                ...item,
                image: item.picture,
                customerImages: item.finishedImage ? [item.finishedImage] : [],
                orderCode: order.id
              };
              break;
            }
          }
          setTask(foundTask);
        } catch (error) {
          console.error("Failed to load task", error);
        }
      }
    };
    fetchTask();
  }, [id]);

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)]">
        <p className="text-gray-500 font-medium">
          Đang tải hoặc không tìm thấy thông tin công việc...
        </p>
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 font-semibold mt-4 hover:underline cursor-pointer"
        >
          Quay lại trang chính
        </button>
      </div>
    );
  }

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
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-white border shadow-sm hover:bg-gray-50 transition-colors cursor-pointer"
          style={{ borderColor: "var(--grid-border)" }}
        >
          <ArrowLeft size={18} style={{ color: "var(--text-main)" }} />
        </button>
        <div>
          <h1
            className="text-xl font-bold"
            style={{ color: "var(--text-main)" }}
          >
            Chi tiết sản phẩm hoàn thành
          </h1>
          <p className="text-[13px] text-gray-500 mt-0.5">
            Mã sản phẩm: #{task.id}
          </p>
        </div>
      </div>

      <div
        className="bg-white rounded-2xl shadow-sm border p-6 flex flex-col sm:flex-row gap-8"
        style={{ borderColor: "var(--grid-border)" }}
      >
        {/* Left: Image (if any) */}
        <div className="w-full sm:w-1/3 shrink-0 flex flex-col gap-4">
          <div 
            className="aspect-[4/3] rounded-xl overflow-hidden border border-gray-200 relative group cursor-zoom-in"
            onClick={() => setZoomImage(task.image)}
          >
            <img
              src={task.image}
              alt={task.productName}
              className="w-full h-full object-cover grayscale-[10%] group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
              <ZoomIn
                size={24}
                className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md"
              />
            </div>
          </div>

          {/* Customer Provided Images */}
          {task.customerImages && task.customerImages.length > 0 && (
            <div className="mt-6 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera size={14} className="text-blue-500" />
                  <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">
                    Ảnh đính kèm
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {task.customerImages.map((img, i) => (
                  <div
                    key={i}
                    className="w-20 h-16 rounded-lg overflow-hidden border border-gray-100 cursor-zoom-in hover:shadow-md transition-shadow group relative shrink-0"
                    style={{ background: "var(--bg-main)" }}
                    onClick={() => setZoomImage(img)}
                  >
                    <img
                      src={img}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      alt={`Customer ${i + 1}`}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
                      <ZoomIn
                        size={14}
                        className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-4">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[13px] font-bold bg-green-100 text-green-700`}
            >
              <CheckCircle2 size={13} />
              ĐÃ XONG
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
              className="px-3 py-1.5 rounded-lg border bg-gray-50 text-gray-700 border-gray-200 text-[13px] font-bold font-mono"
            >
              Mã ĐH: {task.orderCode}
            </span>
            <span className="px-3 py-1.5 rounded-lg border bg-blue-50 border-blue-100 text-[13px] font-semibold text-blue-700 flex items-center gap-1.5">
              <Clock size={14} /> Bắt đầu: {task.startedAt || "—"}
            </span>
            <span className="px-3 py-1.5 rounded-lg border bg-amber-50 border-amber-100 text-[13px] font-semibold text-amber-700 flex items-center gap-1.5">
              <Clock size={14} /> Hạn chót: {task.deadline || "—"}
            </span>
          </div>

          <h3 className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Layers size={14} className="text-blue-500" />
            Thông số kỹ thuật
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                <TreePine size={16} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-tight">
                  Loại
                </p>
                <p className="font-bold text-[14px] text-gray-800 leading-none mt-1">
                  {task.type}
                </p>
              </div>
            </div>
            
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                <Maximize2 size={16} className="text-blue-600" />
              </div>
              <div>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-tight">
                  Kích Thước
                </p>
                <p className="font-bold text-[14px] text-gray-800 mt-1 whitespace-nowrap">
                  {task.size}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                <Palette size={16} className="text-pink-500" />
              </div>
              <div>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-tight">
                  Màu sắc
                </p>
                <p className="font-bold text-[14px] text-gray-800 leading-none mt-1">
                  {task.color || "Tiêu chuẩn"}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 col-span-1 md:col-span-3 flex flex-col gap-1.5">
              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-tight">
                Ghi chú yêu cầu
              </p>
              {task.note ? (
                <p className="font-medium text-[13px] text-gray-700 leading-relaxed italic">
                  "{task.note}"
                </p>
              ) : (
                <p className="text-[13px] text-gray-400 italic">—</p>
              )}
            </div>
          </div>
        </div>
      {/* ═══════════ IMAGE ZOOM MODAL ═══════════ */}
      {zoomImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 transition-all animate-in fade-in duration-200"
          onClick={() => setZoomImage(null)}
        >
          <button 
            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setZoomImage(null);
            }}
          >
            <X size={24} />
          </button>
          <div 
            className="relative max-w-5xl w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={zoomImage} 
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
              alt="Zoomed preview"
            />
          </div>
        </div>
      )}
    </div>
  </div>
);
}
