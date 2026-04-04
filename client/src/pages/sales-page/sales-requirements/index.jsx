import { useState, useMemo, useEffect } from "react";
import toast from "react-hot-toast";
import { Link, useSearchParams } from "react-router-dom";
import { PageHelmet } from "@/components/seo/PageHelmet";
import {
  Search,
  Phone,
  Clock,
  ChevronRight,
  User,
  DollarSign,
  Camera,
  Layers,
  CheckCircle2,
  X,
  Info,
  Maximize2,
  MessageSquare,
  Calendar,
  AlertCircle,
  FileText,
  Trash2,
  Edit2,
  Package,
  Eye,
  ChevronLeft,
  Hammer,
  Settings,
  Activity,
  RefreshCw,
  MapPin,
} from "lucide-react";

// ===================== MOCK DATA =====================
const MOCK_REQUIREMENTS = [
  {
    id: "REQ-001",
    code: "REQ-2603-0001",
    customer: "Lê Thị Lan",
    phone: "0345678901",
    address: "Căn 1204, Tòa C, Vinhomes Ocean Park, Gia Lâm, Hà Nội",
    salesPerson: "Bình Nguyễn",
    createdDate: "2026-03-12",
    status: "Đang xử lý",
    leadTime: 30,
    notes:
      "Khách nâng cấp căn hộ, cần giường Master và kệ Tivi phòng khách đồng bộ gỗ Sồi.",
    surveyNotes: "",
    proposedSolution: "",
    estimatedPrice: 0,
    items: [
      {
        id: "ITM-001",
        name: "Giường ngủ Master",
        material: "Gỗ Sồi Mỹ",
        specs: {
          dimensions: "180 x 200 x 40 cm",
          note: "Hộc kéo 2 bên hông giường",
        },
        customerImages: [
          "https://images.unsplash.com/photo-1505693419173-42b9218a5c81?auto=format&fit=crop&q=80&w=600",
        ],
        quotedPrice: 0,
      },
      {
        id: "ITM-005",
        name: "Kệ Tivi phòng khách",
        material: "Gỗ Sồi Mỹ",
        specs: {
          dimensions: "220 x 45 x 50 cm",
          note: "Cánh mây mắt cáo tự nhiên",
        },
        customerImages: [
          "https://images.unsplash.com/photo-1594913785162-e6785b42defa?auto=format&fit=crop&q=80&w=600",
        ],
        quotedPrice: 0,
      },
    ],
  },
  {
    id: "REQ-002",
    code: "REQ-2603-0002",
    customer: "Trần Minh Quang",
    phone: "0909123456",
    address: "Biệt thự KĐT Ecopark, Văn Giang, Hưng Yên",
    salesPerson: "Bình Nguyễn",
    createdDate: "2026-03-11",
    status: "Đang xử lý",
    leadTime: 45,
    notes: "Khách muốn bộ bàn ăn cổ điển kiểu Louis XVI",
    surveyNotes: "",
    proposedSolution: "",
    estimatedPrice: 0,
    items: [
      {
        id: "ITM-002",
        name: "Bàn ăn Hoàng Gia",
        material: "Gỗ Gõ Đỏ Pachy",
        specs: {
          dimensions: "240 x 110 x 75 cm",
          note: "Đục chạm mẫu Louis XVI",
        },
        customerImages: [
          "https://images.unsplash.com/photo-1617806118233-ef203e91122b?auto=format&fit=crop&q=80&w=600",
          "https://images.unsplash.com/photo-1565538810844-16ad7395015c?auto=format&fit=crop&q=80&w=600",
        ],
        quotedPrice: 0,
        isApproved: false,
      },
    ],
  },
  {
    id: "REQ-003",
    code: "REQ-2603-0003",
    customer: "Nguyễn Thị Hồng",
    phone: "0912123123",
    address: "KĐT Times City, Quận Hai Bà Trưng, Hà Nội",
    salesPerson: "Bình Nguyễn",
    createdDate: "2026-03-10",
    status: "Đã tạo đơn",
    notes: "Khách phê duyệt thiết kế hiện đại",
    surveyNotes: "Khách yêu cầu độ hoàn thiện bóng kính.",
    proposedSolution: "Tủ rượu âm tường gỗ Hương, LED cảm ứng.",
    estimatedPrice: 45000000,
    items: [
      {
        id: "ITM-003",
        name: "Tủ rượu sang trọng",
        material: "Gỗ Hương",
        specs: {
          dimensions: "120 x 50 x 200 cm",
          note: "3 ngăn kéo, khóa an toàn",
        },
        customerImages: [
          "https://images.unsplash.com/photo-1578500494198-246f612d03b3?auto=format&fit=crop&q=80&w=600",
        ],
        quotedPrice: 45000000,
        isApproved: true,
      },
    ],
  },
  {
    id: "REQ-004",
    code: "REQ-2603-0004",
    customer: "Phạm Thành Nam",
    phone: "0987654321",
    address: "Chung cư Green Stars, Phạm Văn Đồng, Bắc Từ Liêm, HN",
    salesPerson: "Bình Nguyễn",
    createdDate: "2026-03-09",
    status: "Đã tạo đơn",
    notes: "Combo phòng khách căn hộ chung cư",
    surveyNotes: "Căn hộ tầng 25, diện tích nhỏ.",
    proposedSolution: "Thiết kế tối giản, tích hợp ngăn chứa đồ thông minh.",
    estimatedPrice: 12000000,
    items: [
      {
        id: "ITM-004",
        name: "Kệ Tivi Slim",
        material: "Gỗ Công nghiệp An Cường",
        specs: {
          dimensions: "200 x 40 x 45 cm",
          note: "Hàng đặt theo kích thước lẻ",
        },
        customerImages: [
          "https://images.unsplash.com/photo-1594913785162-e6785b42defa?auto=format&fit=crop&q=80&w=600",
        ],
        quotedPrice: 12000000,
        isApproved: true,
      },
    ],
  },
];

const STATUS_CONFIG = {
  "Đang xử lý": {
    bg: "#FEF3C7",
    text: "#D97706",
    border: "#FDE68A",
    icon: "Clock",
    description: "Đang trong quá trình khảo sát, thiết kế & báo giá",
  },
  "Đã tạo đơn": {
    bg: "#F0FDF4",
    text: "#166534",
    border: "#BBF7D0",
    icon: "CheckCircle2",
    description: "Đã lập lệnh sản xuất & chuyển sang phân xưởng",
  },
  "Đơn đã hủy": {
    bg: "#F3F4F6",
    text: "#6B7280",
    border: "#E5E7EB",
    icon: "X",
    description: "Yêu cầu đã bị hủy hoặc khách dừng tư vấn",
  },
};

// ===================== SUB-COMPONENTS =====================
const CancelRequestModal = ({ target, onSuccess, onCancel }) => {
  if (!target) return null;
  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col scale-in duration-200">
        <div className="p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-red-50 text-red-600 mb-4">
            <AlertCircle size={32} />
          </div>
          <h3 className="text-[18px] font-bold text-gray-900 mb-2">
            Xác nhận hủy?
          </h3>
          <p className="text-[14px] text-gray-500 mb-6 font-medium leading-relaxed">
            Bạn có chắc chắn muốn hủy yêu cầu mã{" "}
            <strong className="text-gray-900">{target.code}</strong> không?{" "}
            <br />
            Hành động này sẽ chuyển trạng thái sang "Đơn đã hủy" ngay lập tức.
          </p>

          <div className="flex flex-col w-full gap-2">
            <button
              onClick={onSuccess}
              className="w-full py-3 rounded-xl text-[14px] font-bold text-white bg-red-600 hover:bg-red-700 transition-all active:scale-[0.98] shadow-lg shadow-red-100"
            >
              Xác nhận hủy
            </button>
            <button
              onClick={onCancel}
              className="w-full py-3 rounded-xl text-[14px] font-bold text-gray-600 hover:bg-gray-100 transition-all"
            >
              Quay lại
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ImageViewer = ({ src, onClose }) => {
  if (!src) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-8 bg-black/95 animate-in fade-in duration-200">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
      >
        <X size={24} />
      </button>
      <img
        src={src}
        alt="Enlarged"
        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in duration-300"
      />
    </div>
  );
};

const RequirementDetailModal = ({ req, onClose, onEnlarge, onOpenCancel }) => {
  const [surveyNotes, setSurveyNotes] = useState("");
  const [proposedSolution, setProposedSolution] = useState("");
  const [estimatedPrice, setEstimatedPrice] = useState("");
  const [itemSpecs, setItemSpecs] = useState([]);

  useEffect(() => {
    if (req) {
      setSurveyNotes(req.surveyNotes || "");
      setProposedSolution(req.proposedSolution || "");
      setEstimatedPrice(req.estimatedPrice || 0);

      setItemSpecs(
        req.items.map((item) => ({
          id: item.id,
          material: item.material || "",
          quantity: item.qty || item.quantity || 1,
          dimensions: item.specs?.dimensions || "",
          hardware: item.specs?.hardware || "",
          note: item.specs?.note || "",
          price: item.quotedPrice || 0,
          designImages: item.designImages || [],
        })),
      );
    }
  }, [req]);

  if (!req) return null;

  const statusConfig = STATUS_CONFIG[req.status] || STATUS_CONFIG["Đang xử lý"];

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-xl flex flex-col overflow-hidden relative">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gray-50">
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-[18px] font-bold text-gray-900">
                  Chi tiết yêu cầu kỹ thuật
                </h2>
                <span className="px-2.5 py-1 bg-white border border-gray-200 text-gray-600 rounded-md text-[12px] font-medium font-mono shadow-sm">
                  {req.code}
                </span>
                <span
                  className="px-2.5 py-1 rounded-md text-[12px] font-medium border"
                  style={{
                    backgroundColor: statusConfig.bg,
                    color: statusConfig.text,
                    borderColor: statusConfig.border,
                  }}
                >
                  {req.status}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-white">
          {/* Section 1: Thông tin chung */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-[13px] font-bold text-gray-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <User size={16} className="text-gray-400" /> Khách hàng
                </h3>
                <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 space-y-2">
                  <p className="text-[14px] font-bold text-gray-900">
                    {req.customer}
                  </p>
                  <p className="text-[13px] text-gray-600 flex items-center gap-2">
                    <Phone size={13} className="text-gray-400 shrink-0" />{" "}
                    {req.phone}
                  </p>
                  <p className="text-[13px] text-gray-600 flex items-start gap-2">
                    <MapPin
                      size={13}
                      className="text-gray-400 mt-0.5 shrink-0"
                    />{" "}
                    <span className="flex-1 leading-snug">
                      {req.address || "Chưa cung cấp địa chỉ"}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {(surveyNotes || req.notes) && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-[13px] font-bold text-gray-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <FileText size={16} className="text-gray-400" /> Ghi chú
                  </h3>
                  <div className="w-full h-[104px] p-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-600 text-[13px] overflow-y-auto">
                    {surveyNotes || req.notes || "Không có ghi chú"}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* THỜI GIAN HOÀN THIỆN (LEAD TIME) */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-[14px] font-bold text-amber-900">Tiến độ sản xuất cam kết</p>
                <p className="text-[12px] text-amber-700">Dự kiến hoàn thiện cho toàn bộ yêu cầu kỹ thuật</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[24px] font-black text-amber-600 leading-none">{req.leadTime || 0}</span>
              <span className="ml-1 text-[13px] font-bold text-amber-500 uppercase tracking-wider">Ngày</span>
            </div>
          </div>

          {/* Section 3: Chi tiết Sản phẩm & Thông số kỹ thuật */}
          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-[14px] font-bold text-gray-900 flex items-center gap-2 mb-4">
              <Package size={18} className="text-indigo-600" /> Danh sách Sản
              phẩm Yêu cầu
            </h3>

            <div className="space-y-6">
              {itemSpecs.map((spec, index) => {
                const originalItem = req.items[index] || {};
                return (
                  <div
                    key={spec.id}
                    className="p-5 rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden"
                  >
                    {/* Item Header */}
                    <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[12px] font-bold">
                          {index + 1}
                        </span>
                        <h4 className="text-[15px] font-bold text-gray-900">
                          {originalItem.name || "Sản phẩm"}
                        </h4>
                      </div>
                    </div>

                    {/* Item Specs Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                          Chất liệu
                        </label>
                        <div className="text-[13px] text-gray-700">
                          {spec.material || "---"}
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                          Số lượng
                        </label>
                        <div className="text-[13px] text-gray-700">
                          {spec.quantity || "1"}
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                          Kích thước
                        </label>
                        <div className="text-[13px] text-gray-700">
                          {spec.dimensions || "---"}
                        </div>
                      </div>
                      <div className="md:col-span-3">
                        <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                          Yêu cầu sản xuất (Note)
                        </label>
                        <div className="text-[13px] text-gray-700">
                          {spec.note || "---"}
                        </div>
                      </div>
                    </div>

                    {/* Item Images Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                      {/* Customer Images */}
                      <div>
                        <p className="text-[12px] font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                          <Camera size={14} className="text-gray-500" /> Ảnh mẫu
                          khách gửi
                        </p>
                        <div className="flex gap-2 overflow-x-auto pb-1">
                          {originalItem.customerImages?.length > 0 ? (
                            originalItem.customerImages.map((img, i) => (
                              <div
                                key={i}
                                onClick={() => onEnlarge(img)}
                                className="w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:border-gray-400 transition-colors"
                              >
                                <img
                                  src={img}
                                  alt="Mẫu"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))
                          ) : (
                            <span className="text-[12px] text-gray-400 italic">
                              Không có ảnh
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Owner Designs */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[12px] font-bold text-indigo-700 flex items-center gap-1.5">
                            <Layers size={14} className="text-indigo-500" /> Bản
                            vẽ kỹ thuật / 3D
                          </p>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-1 min-h-[64px]">
                          {spec.designImages?.length > 0 ? (
                            spec.designImages.map((img, i) => (
                              <div
                                key={i}
                                className="w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-indigo-200 relative group"
                              >
                                <img
                                  src={img}
                                  onClick={() => onEnlarge(img)}
                                  alt="Bản vẽ"
                                  className="w-full h-full object-cover cursor-pointer"
                                />
                              </div>
                            ))
                          ) : (
                            <span className="text-[12px] text-gray-400 italic self-center">
                              Chưa có bản vẽ
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-medium text-gray-500 uppercase">
                Tổng giá trị đơn hàng
              </span>
              <span className="text-[18px] font-bold text-indigo-700">
                {Number(estimatedPrice || 0).toLocaleString("vi-VN")}{" "}
                <span className="text-[14px]">VND</span>
              </span>
            </div>

            <div className="flex items-center gap-3">
              {req.status === "Đang xử lý" && (
                <button
                  onClick={() => onOpenCancel(req)}
                  className="px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg text-[13px] font-bold hover:bg-red-50 transition-colors shadow-sm flex items-center gap-2"
                >
                  <AlertCircle size={16} />
                  Gửi yêu cầu hủy
                </button>
              )}
              <button
                onClick={onClose}
                className="px-6 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-[13px] font-bold hover:bg-gray-50 transition-colors shadow-sm"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ===================== MAIN COMPONENT =====================
export default function SalesRequirements() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [requirements, setRequirements] = useState(MOCK_REQUIREMENTS);
  const [selectedReqId, setSelectedReqId] = useState(null);
  const [enlargedImg, setEnlargedImg] = useState(null);

  // Cancellation States
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelSuccess, setCancelSuccess] = useState(false);

  const handleCancelSubmit = () => {
    if (!cancelTarget) return;
    setRequirements((prev) =>
      prev.map((r) =>
        r.id === cancelTarget.id ? { ...r, status: "Đơn đã hủy" } : r,
      ),
    );
    toast.success(`Đã hủy yêu cầu ${cancelTarget.code} thành công`);
    setCancelTarget(null);
    setSelectedReqId(null); // Close detail modal if it was open
  };

  const statusFilter = searchParams.get("status") || "Tất cả";
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  const updateParams = (newParams) => {
    const current = Object.fromEntries(searchParams.entries());
    setSearchParams({ ...current, ...newParams });
  };

  const filtered = useMemo(() => {
    let result = requirements;

    if (statusFilter !== "Tất cả") {
      result = result.filter((r) => r.status === statusFilter);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (r) =>
          r.customer.toLowerCase().includes(q) ||
          r.phone.includes(q) ||
          r.code.toLowerCase().includes(q),
      );
    }

    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      result = result.filter((r) => new Date(r.createdDate) >= from);
    }

    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      result = result.filter((r) => new Date(r.createdDate) <= to);
    }

    return result.sort(
      (a, b) => new Date(b.createdDate) - new Date(a.createdDate),
    );
  }, [requirements, statusFilter, searchTerm, dateFrom, dateTo]);

  const statusCounts = useMemo(() => {
    const counts = { "Tất cả": requirements.length };
    Object.keys(STATUS_CONFIG).forEach((s) => {
      counts[s] = requirements.filter((r) => r.status === s).length;
    });
    return counts;
  }, [requirements]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedRequirements = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const selectedReq = requirements.find((r) => r.id === selectedReqId);

  const hasActiveFilters =
    statusFilter !== "Tất cả" || searchTerm || dateFrom || dateTo;
  const clearAllFilters = () => {
    updateParams({ status: "Tất cả" });
    setSearchTerm("");
    setDateFrom("");
    setDateTo("");
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateFrom, dateTo]);

  return (
    <>
      <PageHelmet title="Yêu cầu khách hàng | Sales" />

      <div
        className="flex flex-col h-[calc(100vh-64px)] -m-6 p-6 space-y-4"
        style={{ backgroundColor: "var(--bg-main)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1
              className="text-xl font-bold flex items-center gap-2"
              style={{ color: "var(--text-main)" }}
            >
              <Package size={22} style={{ color: "var(--brand-primary)" }} />
              Yêu cầu từ khách hàng
            </h1>
            <p
              className="text-[13px] mt-0.5"
              style={{ color: "var(--text-placeholder)" }}
            >
              {filtered.length} yêu cầu ({statusFilter.toLowerCase()})
            </p>
          </div>
        </div>

        {/* Status Pills Filter */}
        <div className="flex items-center gap-2 shrink-0 px-1 flex-wrap">
          {["Tất cả", ...Object.keys(STATUS_CONFIG)].map((s) => {
            const isActive = statusFilter === s;
            const sc = s !== "Tất cả" ? STATUS_CONFIG[s] : null;
            return (
              <button
                key={s}
                onClick={() => updateParams({ status: s })}
                className="px-4 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer flex items-center gap-2 border"
                style={{
                  backgroundColor: isActive
                    ? sc
                      ? sc.bg
                      : "#fff"
                    : "transparent",
                  color: isActive
                    ? sc
                      ? sc.text
                      : "var(--brand-primary)"
                    : "var(--text-secondary)",
                  borderColor: isActive
                    ? sc
                      ? sc.border
                      : "var(--grid-border)"
                    : "transparent",
                  boxShadow: isActive ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
                }}
              >
                {s !== "Tất cả" && (
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor: sc ? sc.text : "var(--brand-primary)",
                    }}
                  />
                )}
                {s}
                <span className="text-[10px] opacity-60 bg-black/5 px-1.5 rounded-md ml-0.5">
                  {statusCounts[s] || 0}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search + Table Card */}
        <div
          className="flex flex-col bg-white rounded-2xl flex-1 overflow-hidden"
          style={{
            boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
          }}
        >
          {/* Search Header */}
          <div
            className="px-4 py-3 shrink-0 flex flex-wrap items-center justify-between gap-4"
            style={{
              backgroundColor: "var(--grid-header-bg)",
              borderBottom: "1px solid var(--grid-border)",
            }}
          >
            <div className="flex items-center gap-4 flex-1 min-w-[300px]">
              <div className="relative flex-1 max-w-sm">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-placeholder)" }}
                />
                <input
                  type="text"
                  placeholder="Mã yêu cầu, khách hàng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-9 pl-10 pr-8 rounded-lg text-[13px] border focus:outline-none focus:ring-1 transition"
                  style={{
                    borderColor: "var(--grid-border)",
                    backgroundColor: "#fff",
                    color: "var(--text-main)",
                  }}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full cursor-pointer"
                  >
                    <X size={14} style={{ color: "var(--text-placeholder)" }} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Calendar
                    size={14}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--text-placeholder)" }}
                  />
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="h-9 pl-9 pr-3 rounded-lg text-[13px] border focus:outline-none shadow-xs"
                    style={{
                      borderColor: dateFrom
                        ? "var(--brand-primary)"
                        : "var(--grid-border)",
                      backgroundColor: "#fff",
                      color: "var(--text-main)",
                    }}
                  />
                </div>
                <span className="text-gray-400 text-xs font-bold">~</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-9 px-3 rounded-lg text-[13px] border focus:outline-none shadow-xs"
                  style={{
                    borderColor: dateTo
                      ? "var(--brand-primary)"
                      : "var(--grid-border)",
                    backgroundColor: "#fff",
                    color: "var(--text-main)",
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="h-9 px-3 rounded-lg text-[12px] font-bold text-red-600 hover:bg-red-50 transition border border-transparent hover:border-red-100 cursor-pointer"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left relative">
              <thead
                className="sticky top-0 z-10"
                style={{
                  backgroundColor: "var(--grid-header-bg)",
                  borderBottom: "1px solid var(--grid-border)",
                }}
              >
                <tr>
                  {[
                    "STT",
                    "Mã yêu cầu",
                    "Khách hàng",
                    "Ngày nhận",
                    "Trạng thái",
                  ].map((h, i) => (
                    <th
                      key={i}
                      className={`px-4 py-3 text-[11px] font-bold uppercase tracking-wider ${
                        i === 0
                          ? "text-center w-[50px]"
                          : ""
                      }`}
                      style={{ color: "var(--text-placeholder)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedRequirements.map((r, idx) => {
                  const statusConfig =
                    STATUS_CONFIG[r.status] || STATUS_CONFIG["Đang xử lý"];
                  return (
                    <tr
                      key={r.id}
                      onClick={() => setSelectedReqId(r.id)}
                      className="group relative hover:bg-gray-50/50 transition-colors cursor-pointer"
                      style={{ borderBottom: "1px solid var(--grid-border)" }}
                    >
                      <td
                        className="px-4 py-3 text-center text-[13px] font-medium"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {(currentPage - 1) * itemsPerPage + idx + 1}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="text-[13px] font-bold font-mono"
                          style={{ color: "var(--text-main)" }}
                        >
                          {r.code}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[12px] transition group-hover:bg-white border"
                            style={{
                              backgroundColor: "var(--bg-main)",
                              color: "var(--text-placeholder)",
                              borderColor: "var(--grid-border)",
                            }}
                          >
                            {r.customer.charAt(0)}
                          </div>
                          <div>
                            <p
                              className="text-[13px] font-semibold"
                              style={{ color: "var(--text-main)" }}
                            >
                              {r.customer}
                            </p>
                            <p
                              className="text-[11px]"
                              style={{ color: "var(--text-placeholder)" }}
                            >
                              {r.phone}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td
                        className="px-4 py-3 text-[13px] font-medium"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {r.createdDate?.split("-").reverse().join("/")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="inline-flex items-center relative">
                          <div className="absolute right-full top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 flex items-center gap-2 transition-all transform translate-x-3 group-hover:translate-x-0 z-20 mr-4">
                            {r.status === "Đang xử lý" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCancelTarget(r);
                                }}
                                className="flex items-center gap-2 bg-white border border-red-200 text-red-600 px-3 py-1.5 rounded-xl shadow-lg hover:bg-red-50 active:scale-95 transition-all text-[10px] font-black uppercase tracking-wider outline-none whitespace-nowrap"
                              >
                                Hủy
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedReqId(r.id);
                              }}
                              className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-xl shadow-lg hover:bg-slate-50 active:scale-95 transition-all text-[10px] font-black uppercase tracking-wider outline-none whitespace-nowrap"
                            >
                              Chi tiết
                              <Eye size={14} />
                            </button>
                          </div>

                          <span
                            className="inline-flex items-center px-2.5 py-1 text-[11px] font-bold rounded-md whitespace-nowrap"
                            style={{
                              backgroundColor: statusConfig.bg,
                              color: statusConfig.text,
                              border: `1px solid ${statusConfig.border}`,
                            }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full mr-1.5"
                              style={{ backgroundColor: statusConfig.text }}
                            ></span>
                            {r.status}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {filtered.length > 0 && (
            <div
              className="flex items-center justify-between px-6 py-3 border-t shrink-0"
              style={{
                borderColor: "var(--grid-border)",
                backgroundColor: "var(--bg-main)",
              }}
            >
              <div
                className="text-[13px]"
                style={{ color: "var(--text-secondary)" }}
              >
                Tổng số bản ghi:{" "}
                <span
                  className="font-bold"
                  style={{ color: "var(--text-main)" }}
                >
                  {filtered.length}
                </span>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span
                    className="text-[13px]"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Số bản ghi/trang
                  </span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="h-8 px-2 pr-6 rounded-md text-[13px] border cursor-pointer focus:outline-none focus:ring-1 transition appearance-none"
                    style={{
                      borderColor: "var(--grid-border)",
                      backgroundColor: "#fff",
                      color: "var(--text-main)",
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 8px center",
                    }}
                  >
                    {[15, 30, 50, 100].map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>

                <div
                  className="text-[13px]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <span
                    className="font-bold"
                    style={{ color: "var(--text-main)" }}
                  >
                    {(currentPage - 1) * itemsPerPage + 1} -{" "}
                    {Math.min(currentPage * itemsPerPage, filtered.length)}
                  </span>{" "}
                  bản ghi
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer hover:bg-gray-200 rounded p-1"
                    style={{ color: "var(--text-main)" }}
                  >
                    <ChevronLeft size={16} strokeWidth={2.5} />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer hover:bg-gray-200 rounded p-1"
                    style={{ color: "var(--text-main)" }}
                  >
                    <ChevronRight size={16} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal */}
        <RequirementDetailModal
          req={selectedReq}
          onClose={() => setSelectedReqId(null)}
          onEnlarge={(src) => setEnlargedImg(src)}
          onOpenCancel={(r) => {
            setCancelTarget(r);
            setCancelSuccess(false);
          }}
        />

        <CancelRequestModal
          target={cancelTarget}
          onSuccess={handleCancelSubmit}
          onCancel={() => setCancelTarget(null)}
        />

        {/* Image Viewer */}
        <ImageViewer src={enlargedImg} onClose={() => setEnlargedImg(null)} />
      </div>
    </>
  );
}
