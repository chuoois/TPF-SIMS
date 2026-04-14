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
import DataTable from "@/components/control/DataTable";
import ConfirmModal from "@/components/control/ConfirmModal";

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
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-lg shadow-xl flex flex-col overflow-hidden relative">
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
                <div className="p-4 rounded-lg border border-gray-100 bg-gray-50/50 space-y-2">
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
                  <div className="w-full h-[104px] p-4 rounded-lg border border-gray-200 bg-gray-50 text-gray-600 text-[13px] overflow-y-auto">
                    {surveyNotes || req.notes || "Không có ghi chú"}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* THỜI GIAN HOÀN THIỆN (LEAD TIME) */}
          <div className="p-4 rounded-lg border border-amber-200 bg-amber-50/40 flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-[14px] font-bold text-amber-900">
                  Tiến độ sản xuất cam kết
                </p>
                <p className="text-[12px] text-amber-700">
                  Dự kiến hoàn thiện cho toàn bộ yêu cầu kỹ thuật
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[24px] font-black text-amber-600 leading-none">
                {req.leadTime || 0}
              </span>
              <span className="ml-1 text-[13px] font-bold text-amber-500 uppercase tracking-wider">
                Ngày
              </span>
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
                    className="p-5 rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden"
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

  // Selection State
  const [selectedIds, setSelectedIds] = useState([]);

  // Cancellation States
  const [cancelTarget, setCancelTarget] = useState(null);

  // Column definitions for DataTable
  const columns = [
    {
      header: "STT",
      render: (_, idx) => (currentPage - 1) * itemsPerPage + idx + 1,
      headerClassName: "w-[60px] text-center",
      className: "text-center font-medium text-slate-400",
    },
    {
      header: "Mã yêu cầu",
      key: "code",
      className: "font-mono font-bold text-slate-700",
    },
    {
      header: "Khách hàng",
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center font-bold text-[12px] text-slate-400 uppercase">
            {r.customer.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-slate-800 leading-tight">
              {r.customer}
            </p>
            <p className="text-[11px] text-slate-400 font-medium">{r.phone}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Ngày nhận",
      render: (r) => (
        <div className="flex items-center gap-2 text-slate-600">
          <Calendar size={14} className="text-slate-300" />
          <span className="font-medium">
            {r.createdDate?.split("-").reverse().join("/")}
          </span>
        </div>
      ),
    },
    {
      header: "Trạng thái",
      headerClassName: "text-right pr-12",
      className: "text-right pr-12",
      render: (r) => {
        const sc = STATUS_CONFIG[r.status] || STATUS_CONFIG["Đang xử lý"];
        return (
          <div className="flex justify-end">
            <span
              className="inline-flex items-center px-2.5 py-1 text-[11px] font-bold rounded-lg border min-w-[120px] justify-center"
              style={{
                backgroundColor: sc.bg,
                color: sc.text,
                borderColor: sc.border,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full mr-1.5"
                style={{ backgroundColor: sc.text }}
              ></span>
              {r.status}
            </span>
          </div>
        );
      },
    },
  ];

  // Row actions (hover buttons)
  const rowActions = [
    {
      label: "Hủy yêu cầu",
      icon: AlertCircle,
      className:
        "bg-white border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200",
      showIf: (r) => r.status === "Đang xử lý",
      requireConfirm: true,
      confirmTitle: "Xác nhận hủy yêu cầu?",
      confirmMessage: (r) =>
        `Bạn có chắc chắn muốn hủy yêu cầu thiết kế mã ${r.code} của khách hàng ${r.customer}? Hành động này không thể hoàn tác.`,
      onClick: (r) => {
        setCancelTarget(r);
        handleCancelSubmit(r);
      },
    },
    {
      label: "Xem chi tiết",
      icon: Eye,
      className:
        "bg-white border-slate-100 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100",
      onClick: (r) => setSelectedReqId(r.id),
    },
  ];

  const handleCancelSubmit = (target = cancelTarget) => {
    if (!target) return;
    setRequirements((prev) =>
      prev.map((r) =>
        r.id === target.id ? { ...r, status: "Đơn đã hủy" } : r,
      ),
    );
    toast.success(`Đã hủy yêu cầu ${target.code} thành công`);
    setCancelTarget(null);
    setSelectedReqId(null);
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
        {/* Header Section */}
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

          {/* Optional: Add a placeholder for tabs if needed in future, currently empty to match spacing */}
          <div className="flex p-1 rounded-lg invisible">
            <button className="px-4 py-1.5 rounded-lg text-[13px] font-semibold">
              Placeholder
            </button>
          </div>
        </div>

        {/* Status Bar (Mirroring Owner Style) */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap py-1">
          {["Tất cả", ...Object.keys(STATUS_CONFIG)].map((s) => {
            const isActive = statusFilter === s;
            const sc = s !== "Tất cả" ? STATUS_CONFIG[s] : null;
            return (
              <button
                key={s}
                onClick={() => updateParams({ status: s })}
                className="px-4 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer flex items-center gap-2 border"
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

        {/* DataTable Section */}
        <DataTable
          columns={columns}
          data={paginatedRequirements}
          onRowClick={(r) => setSelectedReqId(r.id)}
          rowStyle={(item) => ({
            backgroundColor:
              item.status === "Đang xử lý"
                ? "rgba(14, 165, 233, 0.03)"
                : "transparent",
          })}
          // Selection
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          // Search & Filters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          searchPlaceholder="Mã yêu cầu, khách hàng..."
          dateFrom={dateFrom}
          setDateFrom={setDateFrom}
          dateTo={dateTo}
          setDateTo={setDateTo}
          hasActiveFilters={hasActiveFilters}
          clearAllFilters={clearAllFilters}
          // Row Actions (Hủy, Chi tiết)
          rowActions={rowActions}
          // Bulk Actions
          bulkActions={[
            {
              label: "HỦY HÀNG LOẠT",
              icon: AlertCircle,
              className: "text-red-600 hover:bg-red-50",
              showIf: (selectedRows) => {
                // Only show if at least one selected item is "Đang xử lý"
                return selectedRows.some((r) => r.status === "Đang xử lý");
              },
              requireConfirm: true,
              confirmTitle: "Hủy hàng loạt yêu cầu?",
              confirmMessage: (selectedRows) => {
                const cancelableCount = selectedRows.filter(
                  (r) => r.status === "Đang xử lý",
                ).length;
                return `Bạn có chắc chắn muốn hủy ${cancelableCount} yêu cầu 'Đang xử lý' trong danh sách chọn? Hành động này không thể hoàn tác.`;
              },
              onClick: (selectedRows) => {
                const cancelableIds = selectedRows
                  .filter((r) => r.status === "Đang xử lý")
                  .map((r) => r.id);

                setRequirements((prev) =>
                  prev.map((r) =>
                    cancelableIds.includes(r.id)
                      ? { ...r, status: "Đơn đã hủy" }
                      : r,
                  ),
                );
                setSelectedIds([]);
                toast.success(
                  `Đã hủy ${cancelableIds.length} yêu cầu thành công`,
                );
              },
            },
          ]}
          pagination={{
            total: filtered.length,
            currentPage: currentPage,
            setCurrentPage: setCurrentPage,
            itemsPerPage: itemsPerPage,
            setItemsPerPage: setItemsPerPage,
          }}
        />

        {/* Modal */}
        <RequirementDetailModal
          req={selectedReq}
          onClose={() => setSelectedReqId(null)}
          onEnlarge={(src) => setEnlargedImg(src)}
          onOpenCancel={(r) => setCancelTarget(r)}
        />

        <ConfirmModal
          isOpen={!!cancelTarget}
          title="Xác nhận hủy yêu cầu?"
          message={`Bạn có chắc chắn muốn hủy yêu cầu thiết kế mã ${cancelTarget?.code} của khách hàng ${cancelTarget?.customer}? Hành động này không thể hoàn tác.`}
          onConfirm={() => handleCancelSubmit(cancelTarget)}
          onCancel={() => setCancelTarget(null)}
        />

        {/* Image Viewer */}
        <ImageViewer src={enlargedImg} onClose={() => setEnlargedImg(null)} />
      </div>
    </>
  );
}
