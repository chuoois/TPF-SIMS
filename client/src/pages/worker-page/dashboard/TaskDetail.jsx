import { useState, useEffect } from "react";
import * as Yup from "yup";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
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
  Calendar,
  Settings,
  X,
  Hammer,
} from "lucide-react";

import workerService from "@/services/worker.service";
import { uploadImage } from "@/services/cloudinary.service";

// Helper to safely render values that may be objects
const formatValue = (val) => {
  if (val && typeof val === "object") {
    try {
      return JSON.stringify(val);
    } catch {
      return String(val);
    }
  }
  return val;
};

// Schema validate khi thợ gửi ảnh hoàn thành (mảng files)
const finishedImagesSchema = Yup.object().shape({
  files: Yup.array()
    .min(1, "Vui lòng tải lên ít nhất 1 ảnh sản phẩm hoàn thành")
    .max(10, "Tối đa 10 ảnh")
    .required("Vui lòng tải lên ảnh sản phẩm hoàn thành trước khi gửi"),
});

/* ─── Production Steps ─── */
const STEPS = [
  { id: 1, key: "Chờ gia công", label: "Chờ nhận", icon: Clock },
  { id: 2, key: "Đang gia công", label: "Đang làm", icon: Hammer },
  { id: 3, key: "Gửi Nghiệm Thu", label: "Nghiệm thu", icon: Camera },
  { id: 4, key: "Hoàn Thành", label: "Xong", icon: CheckCircle2 },
];

const getStepIndex = (status) => {
  switch (status) {
    case "Chờ gia công":
      return 0;
    case "Đang gia công":
      return 1;
    case "Gửi Nghiệm Thu":
      return 2;
    case "Hoàn Thành":
      return 4;
    default:
      return 0;
  }
};

/* ─── Status badge helper ─── */
const getStatusBadge = (status) => {
  const map = {
    "Chờ gia công": {
      label: "Chờ gia công",
      bg: "rgba(158,158,158,0.1)",
      color: "var(--text-secondary)",
      border: "var(--grid-border)",
    },
    "Đang gia công": {
      label: "Đang gia công",
      bg: "rgba(52,176,87,0.08)",
      color: "var(--brand-primary)",
      border: "rgba(52,176,87,0.15)",
    },
    "Gửi Nghiệm Thu": {
      label: "Chờ chủ duyệt",
      bg: "rgba(245,158,11,0.08)",
      color: "#d97706",
      border: "rgba(245,158,11,0.2)",
    },
    "Hoàn Thành": {
      label: "Hoàn thành",
      bg: "rgba(52,176,87,0.08)",
      color: "var(--status-success)",
      border: "rgba(52,176,87,0.2)",
    },
  };
  return map[status] || map["Chờ gia công"];
};

const getDeadlineStyle = (urgency) => {
  switch (urgency) {
    case "DANGER":
      return {
        bg: "rgba(229,72,77,0.08)",
        color: "#e5484d",
        border: "rgba(229,72,77,0.2)",
        label: "Quá hạn",
      };
    case "URGENT":
      return {
        bg: "rgba(245,158,11,0.08)",
        color: "#d97706",
        border: "rgba(245,158,11,0.2)",
        label: "Gấp",
      };
    case "WARNING":
      return {
        bg: "rgba(67,104,224,0.08)",
        color: "#4368E0",
        border: "rgba(67,104,224,0.2)",
        label: "Sắp tới hạn",
      };
    default:
      return {
        bg: "rgba(158,158,158,0.1)",
        color: "var(--text-secondary)",
        border: "var(--grid-border)",
        label: "Bình thường",
      };
  }
};

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [selectedTask, setSelectedTask] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [pendingFiles, setPendingFiles] = useState([]);  // File objects chưa upload (preview cục bộ)
  const [isUploading, setIsUploading] = useState(false);
  const [showDeadlineModal, setShowDeadlineModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [isStartingProduction, setIsStartingProduction] = useState(false);
  const [zoomImage, setZoomImage] = useState(null);

  const getTimeRemaining = (deadline) => {
    if (!deadline) return null;
    const [d, m, y] = deadline.split("/").map(Number);
    const target = new Date(y, m - 1, d);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((target - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return null;
    if (diffDays === 0)
      return {
        label: "Hôm nay là hạn chót!",
        color: "text-red-600 font-black animate-pulse",
      };
    if (diffDays === 1)
      return {
        label: "Gấp: Chỉ còn 1 ngày",
        color: "text-orange-600 font-bold",
      };
    if (diffDays <= 3)
      return {
        label: `Còn lại ${diffDays} ngày`,
        color: "text-amber-600 font-bold",
      };
    return { label: `Còn lại ${diffDays} ngày`, color: "text-emerald-600" };
  };

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        setIsLoading(true);
        const res = await workerService.getPendingTasks();

        let foundTask = null;
        for (const order of res.data) {
          const item = order.items.find((i) => i.id === id);
          if (item) {
            foundTask = {
              ...item,
              image: item.picture,
              orderId: order.id,
              customerName: order.customerName,
              isCustomOrder: order.isCustomOrder,
              workerNotes: item.note || "" // Áp dụng note từ backend vào workerNotes
            };
            break;
          }
        }

        if (foundTask) {
          setSelectedTask(foundTask);
        } else {
          navigate("/worker/dashboard");
        }
      } catch (error) {
        console.error("Lỗi khi tải chi tiết công việc:", error);
        toast.error("Không thể tải dữ liệu công việc!");
        navigate("/worker/dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTask();
  }, [id, navigate]);

  // Trích xuất số ID thực từ "SP-123" → "123"
  const extractRealId = (formattedId) => {
    if (!formattedId) return null;
    return String(formattedId).replace('SP-', '');
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    const realId = extractRealId(taskId);
    try {
      if (newStatus === 'Đang gia công') {
        await workerService.startTask(realId);
        toast.success('Đã bắt đầu gia công!');
        setSelectedTask(prev => ({ ...prev, status: newStatus }));
      } else if (newStatus === 'Gửi Nghiệm Thu') {
        // Upload tất cả ảnh lên Cloudinary rồi mới gọi API
        setIsUploading(true);
        const uploadedUrls = [];
        for (const file of pendingFiles) {
          const result = await uploadImage(file);
          uploadedUrls.push(result.url);
        }
        await workerService.completeTask(realId, uploadedUrls);
        toast.success('Đã gửi ảnh, chờ chủ duyệt!');
        setSelectedTask(prev => ({ ...prev, status: newStatus, finishedImages: uploadedUrls }));
        setPendingFiles([]);
        setIsUploading(false);
      }
    } catch (error) {
      setIsUploading(false);
      console.error('Lỗi cập nhật trạng thái:', error);
      toast.error(error?.response?.data?.message || 'Lỗi khi cập nhật trạng thái!');
    }
  };

  // Chọn ảnh → chỉ preview cục bộ, CHƯA upload Cloudinary
  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    try {
      await finishedImagesSchema.validate({ files: [...pendingFiles, ...files] });
      setPendingFiles(prev => [...prev, ...files]);
      // Reset input để có thể chọn lại cùng file
      e.target.value = null;
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Xóa 1 ảnh khỏi danh sách pending
  const handleRemovePendingFile = (index) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Gửi lại ảnh mới khi đang ở OWNER_PENDING
  const handleUpdateImages = async () => {
    try {
      await finishedImagesSchema.validate({ files: pendingFiles });
    } catch (err) {
      toast.error(err.message);
      return;
    }
    const realId = extractRealId(selectedTask.id);
    setIsUploading(true);
    try {
      const uploadedUrls = [];
      for (const file of pendingFiles) {
        const result = await uploadImage(file);
        uploadedUrls.push(result.url);
      }
      await workerService.completeTask(realId, uploadedUrls);
      setSelectedTask(prev => ({ ...prev, finishedImages: uploadedUrls }));
      setPendingFiles([]);
      toast.success("Đã cập nhật ảnh sản phẩm!");
    } catch (error) {
      console.error("Lỗi cập nhật ảnh:", error);
      toast.error(error?.response?.data?.message || "Lỗi khi cập nhật ảnh!");
    } finally {
      setIsUploading(false);
    }
  };

  const handleStartProduction = async () => {
    const realId = extractRealId(selectedTask.id);
    try {
      await workerService.startTask(realId);
      setSelectedTask(prev => ({ ...prev, status: 'Đang gia công', startedAt: new Date().toLocaleDateString('vi-VN') }));
      toast.success('Đã bắt đầu gia công!');
    } catch (error) {
      console.error('Start task error:', error);
      toast.error(error?.response?.data?.message || 'Lỗi khi bắt đầu gia công!');
    }
  };

  const handleSetPlanDate = () => {
    if (!selectedDate) {
      toast.error("Vui lòng chọn ngày kế hoạch hoàn thành");
      return;
    }

    const targetDate = new Date(selectedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      toast.error("Vui lòng chọn ngày trong tương lai");
      return;
    }

    const dateStr = `${targetDate.getDate().toString().padStart(2, "0")}/${(targetDate.getMonth() + 1).toString().padStart(2, "0")}/${targetDate.getFullYear()}`;

    let urgency = "NORMAL";
    if (diffDays <= 1) urgency = "URGENT";
    else if (diffDays <= 3) urgency = "WARNING";

    // Since mock data was removed, we update local state for demonstration
    // In a real app, this should call workerService.updateDeadline(...)
    setSelectedTask(prev => ({
      ...prev,
      deadline: dateStr,
      status: isStartingProduction ? "Đang gia công" : prev.status,
      startedAt: isStartingProduction ? new Date().toLocaleDateString("vi-VN") : prev.startedAt
    }));

    if (isStartingProduction) {
      setIsStartingProduction(false);
    }

    setShowDeadlineModal(false);
    setSelectedDate("");
    toast.success(
      isStartingProduction
        ? `Đã bắt đầu & thiết lập hạn chót: ${dateStr}`
        : `Đã cập nhật hạn chót: ${dateStr}`
    );
  };

  if (!selectedTask) return null;

  const currentStepIndex = getStepIndex(selectedTask.status);
  const statusBadge = getStatusBadge(selectedTask.status);
  const progressPercent = Math.round((currentStepIndex / STEPS.length) * 100);

  /* ─── Action Button ─── */
  const renderActionButton = () => {
    if (selectedTask.status === "Chờ gia công") {
      return (
        <button
          onClick={handleStartProduction}
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
          <Play size={15} /> Bắt đầu gia công
        </button>
      );
    }

    if (selectedTask.status === "Đang gia công") {
      return (
        <div className="flex flex-col gap-4 items-end">
          <div className="w-full max-w-sm">
            <label className="block text-[12px] font-bold text-gray-500 mb-2 uppercase tracking-wider">
              Ảnh sản phẩm hoàn thiện <span className="text-red-500">*</span>
              <span className="text-[10px] font-normal text-gray-400 ml-1">
                ({pendingFiles.length}/10 ảnh)
              </span>
            </label>

            {/* Grid preview ảnh đã chọn */}
            {pendingFiles.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {pendingFiles.map((file, index) => (
                  <div key={index} className="relative group/thumb rounded-xl overflow-hidden border border-emerald-200 shadow-sm aspect-square">
                    <img
                      src={URL.createObjectURL(file)}
                      className="w-full h-full object-cover"
                      alt={`Preview ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePendingFile(index)}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity cursor-pointer"
                    >
                      <X size={12} className="text-white" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-[9px] text-center py-0.5 font-medium">
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Nút thêm ảnh */}
            {pendingFiles.length < 10 && (
              <div className="relative group">
                <label
                  className="w-full h-20 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-gray-100 flex flex-col items-center justify-center cursor-pointer transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm mb-1 group-hover:scale-110 transition-transform">
                    <Camera size={16} className="text-gray-400" />
                  </div>
                  <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                    Chụp hoặc thêm ảnh
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            )}
          </div>

          <button
            onClick={async () => {
              try {
                await finishedImagesSchema.validate({ files: pendingFiles });
                updateTaskStatus(selectedTask.id, "Gửi Nghiệm Thu");
              } catch (err) {
                toast.error(err.message);
              }
            }}
            disabled={isUploading || pendingFiles.length === 0}
            className={`h-11 px-8 rounded-xl font-semibold text-[14px] transition-all shadow-sm flex items-center justify-center gap-2 ${isUploading || pendingFiles.length === 0
                ? "opacity-50 cursor-not-allowed bg-gray-400"
                : "cursor-pointer bg-emerald-600 hover:bg-emerald-700"
              }`}
            style={{ color: "#fff" }}
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Đang tải ảnh lên...
              </>
            ) : (
              <>
                <CheckCircle2 size={15} /> Gửi {pendingFiles.length} ảnh cho chủ duyệt
              </>
            )}
          </button>
        </div>
      );
    }

    if (selectedTask.status === "Gửi Nghiệm Thu") {
      const serverImages = selectedTask.finishedImages || [];
      const hasPendingFiles = pendingFiles.length > 0;

      return (
        <div className="flex flex-col gap-4 items-end">
          <div className="w-full max-w-sm">
            <label className="block text-[12px] font-bold text-gray-500 mb-2 uppercase tracking-wider">
              {hasPendingFiles ? "Ảnh mới chọn (chưa lưu)" : "Ảnh đã gửi cho chủ duyệt"}
            </label>

            {/* Grid ảnh đã gửi (từ server) */}
            {!hasPendingFiles && serverImages.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {serverImages.map((url, index) => (
                  <div
                    key={index}
                    className="relative group/img rounded-xl overflow-hidden border border-amber-200 shadow-sm aspect-square cursor-zoom-in"
                    onClick={() => setZoomImage(url)}
                  >
                    <img src={url} className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110" alt={`Sent ${index + 1}`} />
                    <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-colors flex items-center justify-center">
                      <ZoomIn size={18} className="text-white opacity-0 group-hover/img:opacity-100 transition-opacity drop-shadow-md" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-[9px] text-center py-0.5 font-medium">
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Grid ảnh mới (pending files) */}
            {hasPendingFiles && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {pendingFiles.map((file, index) => (
                  <div key={index} className="relative group/thumb rounded-xl overflow-hidden border border-amber-200 shadow-sm aspect-square">
                    <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt={`New ${index + 1}`} />
                    <button
                      type="button"
                      onClick={() => handleRemovePendingFile(index)}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity cursor-pointer"
                    >
                      <X size={12} className="text-white" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-[9px] text-center py-0.5 font-medium">
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Nút thêm ảnh mới */}
            <div className="relative group">
              <label className="w-full h-16 rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50/30 flex items-center justify-center cursor-pointer transition-all hover:bg-amber-50 gap-2">
                <Camera size={16} className="text-amber-500" />
                <span className="text-amber-600 text-[11px] font-bold uppercase tracking-wider">
                  {hasPendingFiles ? "Thêm ảnh" : "Chọn ảnh mới để gửi lại"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            </div>
          </div>

          <div className="flex gap-3">
            {hasPendingFiles && (
              <button
                onClick={() => setPendingFiles([])}
                className="h-11 px-6 rounded-xl font-semibold text-[14px] border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all cursor-pointer"
              >
                Hủy thay đổi
              </button>
            )}
            <button
              onClick={hasPendingFiles ? handleUpdateImages : null}
              disabled={isUploading || !hasPendingFiles}
              className={`h-11 px-8 rounded-xl font-semibold text-[14px] transition-all shadow-sm flex items-center justify-center gap-2 ${!hasPendingFiles
                  ? "opacity-50 cursor-not-allowed bg-amber-100/50 text-amber-600 border border-amber-200"
                  : "cursor-pointer bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200"
                }`}
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang tải ảnh lên...
                </>
              ) : hasPendingFiles ? (
                <>
                  <CheckCircle2 size={15} />
                  Gửi lại {pendingFiles.length} ảnh mới
                </>
              ) : (
                <>
                  <AlertCircle size={15} />
                  Đang chờ chủ duyệt
                </>
              )}
            </button>
          </div>
        </div>
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
  const productImages = [selectedTask.image, selectedTask.finishedImage].filter(
    Boolean,
  );

  return (
    <div
      className="flex flex-col h-[calc(100vh-64px)] -m-6 overflow-y-auto"
      style={{ backgroundColor: "var(--bg-main)" }}
    >
      <div className="max-w-[1440px] mx-auto w-full flex flex-col gap-5 p-6 lg:p-8">
        {/* ═══════════ BREADCRUMB ═══════════ */}
        <div className="flex items-center gap-2 text-[13px]">
          <button
            onClick={() => navigate(-1)}
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
          <span className="font-semibold" style={{ color: "var(--text-main)" }}>
            Chi tiết #{selectedTask.id}
          </span>
        </div>

        {/* ═══════════ HERO HEADER CARD ═══════════ */}
        <div
          className="bg-white rounded-2xl overflow-hidden"
          style={{
            border: "1px solid var(--grid-border)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
          }}
        >
          <div className="p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Left: Product title & badges */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2.5">
                {selectedTask.status !== "Chờ gia công" &&
                  selectedTask.status !== "REWORK" && (
                    <button
                      onClick={() => {
                        setIsStartingProduction(false);
                        setShowDeadlineModal(true);
                      }}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                      style={{
                        background: "rgba(16,185,129,0.08)",
                        color: "#10b981",
                        border: "1px solid rgba(16,185,129,0.2)",
                      }}
                    >
                      <Calendar size={12} />
                      {selectedTask.deadline ? "Đổi hạn chót" : "Đặt hạn chót"}
                    </button>
                  )}
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
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
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
                  <div className="flex flex-col gap-1.5 mt-1.5 pt-1.5 border-t border-gray-100">
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} className="text-gray-400" />
                      <span
                        className="text-[14px] font-bold"
                        style={{ color: "var(--text-main)" }}
                      >
                        Hạn chót: {selectedTask.deadline}
                      </span>
                    </div>
                    {(() => {
                      const timeInfo = getTimeRemaining(selectedTask.deadline);
                      return (
                        timeInfo && (
                          <span
                            className={`text-[12px] ${timeInfo.color} flex items-center gap-1`}
                          >
                            <AlertCircle size={10} /> {timeInfo.label}
                          </span>
                        )
                      );
                    })()}
                  </div>
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
        
        {/* HIỂN THỊ GHI CHÚ TỪ CHỦ XƯỞNG (ĐẶC BIỆT KHI YÊU CẦU SỬA LẠI) */}
        {selectedTask.workerNotes && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-[11px] font-black text-amber-600 uppercase tracking-widest mb-1 flex items-center gap-2">
                Ghi chú từ chủ xưởng 
                {selectedTask.status === 'Đang gia công' && <span className="bg-amber-500 text-white px-1.5 py-0.5 rounded text-[9px] animate-pulse">CẦN SỬA LẠI</span>}
              </p>
              <p className="text-[14px] font-bold text-amber-900 leading-relaxed italic">
                "{selectedTask.workerNotes}"
              </p>
            </div>
          </div>
        )}

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
                      Hình ảnh sản phẩm
                    </h3>
                  </div>
                  {/* Main Image */}
                  <div
                    className="aspect-[4/3] rounded-xl overflow-hidden relative group cursor-zoom-in"
                    style={{
                      background: "var(--bg-main)",
                      border: "1px solid var(--grid-border)",
                    }}
                    onClick={() =>
                      setZoomImage(productImages[activeImageIndex])
                    }
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
                    <PenTool size={15} style={{ color: "#4368E0" }} />
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
                      <FileSignature size={13} style={{ color: "#4368E0" }} />{" "}
                      Xem bản vẽ kỹ thuật PDF
                    </button>
                  </div>
                </div>
              )}

              {/* Customer Provided Images */}
              {selectedTask.customerImages &&
                selectedTask.customerImages.length > 0 && (
                  <div
                    className="p-5 flex flex-col gap-4"
                    style={{ borderTop: "1px solid var(--grid-border)" }}
                  >
                    <div className="flex items-center justify-between pb-1">
                      <div className="flex items-center gap-2">
                        <Camera size={15} className="text-blue-500" />
                        <h3
                          className="text-[13px] font-bold"
                          style={{ color: "var(--text-main)" }}
                        >
                          Hình ảnh từ khách hàng
                        </h3>
                      </div>
                      <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                        {selectedTask.customerImages.length} Ảnh
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedTask.customerImages.map((img, i) => (
                        <div
                          key={i}
                          className="w-24 h-20 rounded-lg overflow-hidden border border-gray-100 cursor-zoom-in hover:shadow-md transition-shadow group relative shrink-0"
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
                              size={16}
                              className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md"
                            />
                          </div>
                        </div>
                      ))}
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
                    <TreePine
                      size={16}
                      style={{ color: "var(--brand-primary)" }}
                    />
                  </div>
                  <div>
                    <p
                      className="text-[11px] font-semibold mb-0.5"
                      style={{ color: "var(--text-placeholder)" }}
                    >
                      Loại
                    </p>
                    <p
                      className="text-[14px] font-bold"
                      style={{ color: "var(--text-main)" }}
                    >
                      {selectedTask.type || "—"}
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
                      className="text-[14px] font-bold whitespace-nowrap"
                      style={{ color: "var(--text-main)" }}
                    >
                      {selectedTask.size || "—"}
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
              {selectedTask.note && (
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
                      GHI CHÚ KỸ THUẬT
                    </p>
                    <p
                      className="text-[13px] leading-relaxed break-words whitespace-pre-line"
                      style={{ color: "var(--text-main)" }}
                    >
                      {formatValue(selectedTask.note)}
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
                  <div className="flex flex-col items-end gap-1">
                    <div
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-semibold"
                      style={{
                        background: "rgba(229,72,77,0.06)",
                        color: "var(--status-error)",
                        border: "1px solid rgba(229,72,77,0.12)",
                      }}
                    >
                      <Clock size={12} />
                      Hạn chót: {selectedTask.deadline}
                    </div>
                    {(() => {
                      const timeInfo = getTimeRemaining(selectedTask.deadline);
                      return (
                        timeInfo && (
                          <span
                            className={`text-[10px] uppercase tracking-wider ${timeInfo.color}`}
                          >
                            {timeInfo.label}
                          </span>
                        )
                      );
                    })()}
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

      {/* ═══════════ PLAN DATE MODAL ═══════════ */}
      {showDeadlineModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowDeadlineModal(false)}
          />
          <div className="relative bg-white w-full max-w-sm rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <Calendar size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">
                    Đặt hạn chót
                  </h3>
                  <p className="text-[12px] text-gray-500">
                    Thời gian dự kiến thợ sẽ hoàn thành sản phẩm
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[12px] font-bold text-gray-500 mb-2 uppercase tracking-wider">
                    Chọn ngày bạn dự kiến hoàn thành
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={selectedDate}
                      min={new Date().toLocaleDateString("en-CA")}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-semibold"
                    />
                  </div>
                </div>

                {selectedDate && (
                  <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100">
                    <p className="text-[12px] text-blue-700 leading-relaxed font-medium">
                      Hệ thống sẽ ghi nhận hạn chót là ngày{" "}
                      <strong>
                        {new Date(selectedDate).toLocaleDateString("vi-VN")}
                      </strong>.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setShowDeadlineModal(false)}
                className="flex-1 h-11 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-all text-[14px]"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSetPlanDate}
                className="flex-1 h-11 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-sm text-[14px]"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

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
  );
}
