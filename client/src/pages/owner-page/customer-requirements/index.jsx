import { useState, useMemo, useEffect, useRef } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { PageHelmet } from "@/components/seo/PageHelmet";
import { Button } from "@/components/ui/button";
import {
  Search,
  Phone,
  Clock,
  ChevronRight,
  User,
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
  ChevronDown,
  Truck,
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
    notes:
      "Khách nâng cấp căn hộ, cần giường Master và kệ Tivi phòng khách đồng bộ gỗ Sồi.",
    surveyNotes: "",
    proposedSolution: "",
    estimatedPrice: 0,
    deposit: 0,
    estimatedDeliveryDate: "2026-04-10",
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
          "https://scontent.fhan15-1.fna.fbcdn.net/v/t39.30808-6/637459691_1977013123217579_6531168230899229053_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=1d70fc&_nc_ohc=HOM3FFuOUaEQ7kNvwF0Or8M&_nc_oc=AdlPq2yOHwV4yoeTTB1yyX6uN-SlODZh2T7HU8FBUl5IKzJ9UtupGabqX5HIHRdAG1dTYgwmvnvFh0AeaEj0ZfYC&_nc_zt=23&_nc_ht=scontent.fhan15-1.fna&_nc_gid=jadTa4V6nf_sWyNQtwAVXw&_nc_ss=8&oh=00_AfxV5mxqXC-Q0Z3pylSWXN4aVjrVQk7jD1C0CITFUeZnrw&oe=69BC9542",
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
    notes: "Khách muốn bộ bàn ăn cổ điển kiểu Louis XVI",
    surveyNotes: "",
    proposedSolution: "",
    estimatedPrice: 0,
    deposit: 0,
    estimatedDeliveryDate: "2026-04-15",
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
    deposit: 0,
    estimatedDeliveryDate: "2026-04-05",
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
    deposit: 0,
    hasImportedGoods: true,
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
  {
    id: "REQ-005",
    code: "REQ-2603-0005",
    customer: "Chu Văn An",
    phone: "0933441122",
    address: "123 Đường 3/2, Ninh Kiều, Cần Thơ",
    salesPerson: "Bình Nguyễn",
    createdDate: "2026-03-01",
    status: "Đơn đã hủy",
    notes: "Khách hủy do thay đổi thiết kế nội thất toàn diện.",
    surveyNotes: "Đã khảo sát hiện trạng tại Cần Thơ.",
    proposedSolution: "Thiết kế full nội thất gỗ MDF.",
    estimatedPrice: 42000000,
    deposit: 0,
    items: [
      {
        id: "ITM-008",
        name: "Bàn phấn trang điểm",
        material: "Gỗ MDF chống ẩm",
        specs: {
          dimensions: "100 x 45 x 75 cm",
          note: "Tân cổ điển, sơn trắng 2K",
        },
        customerImages: [
          "https://images.unsplash.com/photo-1615529328322-92c90680fd74?q=80&w=300",
        ],
        quotedPrice: 42000000,
        isApproved: false,
      },
    ],
  },
];

const MATERIAL_SAMPLES = [
  "Gỗ Sồi Mỹ",
  "Gỗ Gõ Đỏ Pachy",
  "Gỗ Hương",
  "Gỗ Công nghiệp An Cường",
  "Gỗ Ash (Tần bì)",
  "Gỗ Walnut (Óc chó)",
  "MDF Phủ Melamine",
  "MDF Phủ Acrylic",
  "Nhựa Picomat",
  "Đá Marble tự nhiên",
  "Đá Quartz nhân tạo",
  "Kính cường lực",
  "Mây mắt cáo tự nhiên",
];

const COLOR_SAMPLES = [
  "Sơn trắng S8",
  "Sơn đen mờ",
  "Màu gỗ Sồi tự nhiên",
  "Màu gỗ Óc chó (Walnut)",
  "Màu gỗ Gõ Đỏ",
  "Xám xi măng",
  "Xám chì",
  "Vàng sồi",
  "Trắng gương (Acrylic)",
  "Xanh mint",
  "Gỗ An Cường MS 402",
  "Gỗ An Cường MS 201",
];

const STATUS_CONFIG = {
  "Đang xử lý": {
    bg: "#FEF3C7",
    text: "#D97706",
    border: "#FDE68A",
    icon: "Clock",
    description: "Đang trong quá trình khảo sát, thiết kế & báo giá",
    actionLabel: "Tạo đơn",
    actionIcon: Package,
    actionType: "create_order",
    actionColor: "bg-emerald-600",
  },
  "Đã tạo đơn": {
    bg: "#F0FDF4",
    text: "#166534",
    border: "#BBF7D0",
    icon: "CheckCircle2",
    description: "Đã lập lệnh sản xuất & chuyển sang phân xưởng",
    actionLabel: "Tiến độ",
    actionIcon: Activity,
    actionType: "view_production",
    actionColor: "bg-indigo-600",
  },
  "Đơn đã hủy": {
    bg: "#F3F4F6",
    text: "#6B7280",
    border: "#E5E7EB",
    icon: "X",
    description: "Yêu cầu đã bị hủy hoặc khách dừng tư vấn",
    actionLabel: null,
    actionIcon: RefreshCw,
    actionType: "restore",
    actionColor: "bg-slate-600",
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

// ===================== HELPER COMPONENTS =====================
const AutocompleteSelector = ({
  value,
  onChange,
  disabled,
  options = [],
  placeholder = "Chọn...",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  const filteredOptions = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return options.filter((o) => o.toLowerCase().includes(q));
  }, [searchTerm, options]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative group">
        <input
          type="text"
          value={isOpen ? searchTerm : value}
          onChange={(e) => {
            if (!isOpen) setIsOpen(true);
            setSearchTerm(e.target.value);
            onChange(e.target.value);
          }}
          onFocus={() => {
            setIsOpen(true);
            setSearchTerm("");
          }}
          disabled={disabled}
          placeholder={placeholder}
          className="w-full h-9 px-3 pr-8 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-[13px] disabled:bg-gray-50 disabled:text-gray-700 transition-all font-medium"
        />
        <ChevronDown
          size={14}
          className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-[60] left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-[200px] overflow-y-auto pt-1 pb-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((o, i) => (
                <button
                  key={i}
                  className="w-full text-left px-3 py-2 text-[13px] hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex items-center justify-between font-medium"
                  onClick={() => {
                    onChange(o);
                    setIsOpen(false);
                  }}
                >
                  {o}
                  {value === o && (
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  )}
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-center">
                <p className="text-[12px] text-gray-400 italic">
                  Nhấn để dùng giá trị mới:
                </p>
                <button
                  className="mt-1 text-[13px] font-bold text-indigo-600 hover:underline"
                  onClick={() => setIsOpen(false)}
                >
                  "{searchTerm}"
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Price Formatting Helpers ---
const formatVND = (val) => {
  if (val === null || val === undefined || val === "" || isNaN(val)) return "";
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const PriceInput = ({
  value,
  onChange,
  disabled,
  placeholder = "0",
  className = "",
}) => {
  const [displayValue, setDisplayValue] = useState(formatVND(value));

  useEffect(() => {
    // Only update if the external value actually changed and doesn't match current display
    const formatted = formatVND(value);
    if (formatted !== displayValue) {
      setDisplayValue(formatted);
    }
  }, [value]);

  const handleChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, ""); // Keep only digits
    const numericValue = rawValue === "" ? 0 : Number(rawValue);
    setDisplayValue(formatVND(numericValue));
    onChange(numericValue);
  };

  return (
    <input
      type="text"
      value={displayValue}
      onChange={handleChange}
      disabled={disabled}
      placeholder={placeholder}
      className={className}
    />
  );
};

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px] animate-in fade-in duration-200"
        onClick={onCancel}
      />
      <div
        className="relative bg-white w-full max-w-sm rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        style={{ boxShadow: "0 25px 50px rgba(0,0,0,0.15)" }}
      >
        <div className="p-6 space-y-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto bg-red-50 text-red-600">
            <AlertCircle size={22} />
          </div>
          <div className="text-center">
            <h3 className="text-[15px] font-bold text-gray-900">{title}</h3>
            <p className="text-[13px] text-gray-500 mt-2 leading-relaxed">
              {message}
            </p>
          </div>
          <div className="flex gap-2.5 pt-2">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1 rounded-lg cursor-pointer text-[13px] h-10"
            >
              Hủy
            </Button>
            <Button
              onClick={onConfirm}
              className="flex-1 rounded-lg text-[13px] font-bold text-white cursor-pointer h-10"
              style={{ backgroundColor: "var(--status-error)" }}
            >
              Xác nhận
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const RequirementDetailModal = ({ req, onClose, onAction, onEnlarge }) => {
  const [surveyNotes, setSurveyNotes] = useState("");
  const [proposedSolution, setProposedSolution] = useState("");
  const [estimatedPrice, setEstimatedPrice] = useState("");
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState("");
  const [ownerNotes, setOwnerNotes] = useState("");
  const [deposit, setDeposit] = useState("");
  // Local state for technical specs (mocking per item for simplicity)
  const [itemSpecs, setItemSpecs] = useState([]);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  const handleAddDesignImage = (itemId) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;

    input.onchange = (e) => {
      const files = Array.from(e.target.files);
      if (files.length > 0) {
        const newUrls = files.map((file) => URL.createObjectURL(file));

        setItemSpecs((prev) =>
          prev.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  designImages: [...(item.designImages || []), ...newUrls],
                }
              : item,
          ),
        );
      }
    };

    input.click();
  };

  const handleRemoveDesignImage = (itemId, index) => {
    setItemSpecs((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              designImages: item.designImages.filter((_, i) => i !== index),
            }
          : item,
      ),
    );
  };

  useEffect(() => {
    if (req) {
      const isNewProcessing = req.status === "Đang xử lý" && !req.surveyNotes; // Heuristic: if no notes, it's likely a fresh survey

      setSurveyNotes(req.surveyNotes || "");
      setProposedSolution(req.proposedSolution || "");
      setEstimatedPrice(isNewProcessing ? 0 : req.estimatedPrice || 0);
      setEstimatedDeliveryDate(req.estimatedDeliveryDate || "");
      setOwnerNotes(req.ownerNotes || "");
      setDeposit(req.deposit || 0);

      setItemSpecs(
        req.items.map((item) => ({
          id: item.id,
          material: item.material || "",
          color: item.specs?.color || item.color || "", // Added color
          quantity: item.qty || item.quantity || 1,
          dimensions: item.specs?.dimensions || "",
          hardware: item.specs?.hardware || "",
          note: item.specs?.note || "",
          price: isNewProcessing ? 0 : item.quotedPrice || 0,
          designImages: item.designImages || [],
        })),
      );
    }
  }, [req]);

  // Auto-calculate total when item prices change
  useEffect(() => {
    const total = itemSpecs.reduce(
      (sum, item) => sum + (Number(item.price) || 0),
      0,
    );
    setEstimatedPrice(total);
  }, [itemSpecs]);

  if (!req) return null;

  const statusConfig = STATUS_CONFIG[req.status] || STATUS_CONFIG["Đang xử lý"];
  const isProcessing = req.status === "Đang xử lý";
  const isPriceFixed = req.status === "Đã chốt giá";
  const isOrderCreated = req.status === "Đã tạo đơn";

  const allImages = req.items.flatMap((item) => item.customerImages || []);

  const handleUpdateItemSpec = (id, field, value) => {
    setItemSpecs((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    );
  };

  const handleSave = () => {
    onAction("save_progress", req.id, {
      surveyNotes,
      proposedSolution,
      estimatedPrice: Number(estimatedPrice),
      estimatedDeliveryDate,
      ownerNotes,
      deposit: Number(deposit),
      itemSpecs, // Passing these back for persistence
    });
  };

  const handleFixPrice = () => {
    if (!estimatedPrice)
      return toast.error("Vui lòng nhập giá dự kiến trước khi chốt.");
    onAction("fix_price", req.id, {
      surveyNotes,
      proposedSolution,
      estimatedPrice: Number(estimatedPrice),
      estimatedDeliveryDate,
      ownerNotes,
      deposit: Number(deposit),
      itemSpecs,
    });
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px] animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div
        className="relative bg-white w-full max-w-5xl h-full max-h-[90vh] rounded-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        style={{ boxShadow: "0 25px 50px rgba(0,0,0,0.15)" }}
      >
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

              <div>
                <h3 className="text-[13px] font-bold text-gray-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" /> Ngày giao dự
                  kiến
                </h3>
                <div className="relative">
                  <Calendar
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                  <input
                    type="date"
                    value={estimatedDeliveryDate}
                    onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
                    disabled={!isProcessing}
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-[13px] disabled:bg-gray-50 disabled:text-gray-600 transition-shadow"
                  />
                </div>
              </div>
            </div>

            {(isProcessing || surveyNotes || req.notes) && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-[13px] font-bold text-gray-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <FileText size={16} className="text-gray-400" /> Ghi chú
                  </h3>
                  <textarea
                    value={surveyNotes || req.notes || ""}
                    onChange={(e) => setSurveyNotes(e.target.value)}
                    disabled={!isProcessing}
                    placeholder="Ghi chú lại các nhu cầu ban đầu của khách và thông tin khảo sát thực tế..."
                    className="w-full h-[104px] p-4 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-[13px] disabled:bg-gray-50 disabled:text-gray-600 transition-shadow resize-none"
                  />
                </div>
              </div>
            )}
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
                      {/* Price Input (Inline for cleaner look) */}
                      <div className="flex items-center gap-2">
                        <label className="text-[12px] font-medium text-gray-500">
                          Giá:
                        </label>
                        <div className="relative w-40">
                          <PriceInput
                            value={spec.price || ""}
                            onChange={(val) =>
                              handleUpdateItemSpec(spec.id, "price", val)
                            }
                            disabled={!isProcessing}
                            placeholder="0"
                            className="w-full h-9 pl-3 pr-10 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-[14px] font-medium disabled:bg-gray-50 text-right"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-gray-400">
                            đ
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Item Specs Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
                      <div className="md:col-span-3">
                        <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                          Chất liệu
                        </label>
                        <AutocompleteSelector
                          value={spec.material}
                          onChange={(val) =>
                            handleUpdateItemSpec(spec.id, "material", val)
                          }
                          disabled={!isProcessing}
                          options={MATERIAL_SAMPLES}
                          placeholder="VD: Gỗ Sồi"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                          Màu sắc
                        </label>
                        <AutocompleteSelector
                          value={spec.color}
                          onChange={(val) =>
                            handleUpdateItemSpec(spec.id, "color", val)
                          }
                          disabled={!isProcessing}
                          options={COLOR_SAMPLES}
                          placeholder="VD: Sơn trắng"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                          Số lượng
                        </label>
                        <input
                          type="number"
                          value={spec.quantity}
                          onChange={(e) => handleUpdateItemSpec(spec.id, "quantity", e.target.value ? Number(e.target.value) : "")}
                          disabled={!isProcessing}
                          className="w-full h-9 px-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-[13px] disabled:bg-gray-50 disabled:text-gray-700 font-medium"
                        />
                      </div>
                      <div className="md:col-span-4">
                        <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                          Kích thước (D×R×C)
                        </label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            placeholder="Dài"
                            value={spec.dimensions?.split(/[xX×*]/)[0]?.trim() || ""}
                            onChange={(e) => {
                              const parts = (spec.dimensions || "").split(/[xX×*]/).map(d => d.trim());
                              parts[0] = e.target.value;
                              handleUpdateItemSpec(spec.id, "dimensions", [parts[0]||"", parts[1]||"", parts[2]||""].filter(Boolean).join(" x "));
                            }}
                            disabled={!isProcessing}
                            className="w-full h-9 px-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-[13px] disabled:bg-gray-50 disabled:text-gray-700 font-medium text-center"
                          />
                          <span className="text-gray-400 text-[10px] font-bold">×</span>
                          <input
                            type="text"
                            placeholder="Rộng"
                            value={spec.dimensions?.split(/[xX×*]/)[1]?.trim() || ""}
                            onChange={(e) => {
                              const parts = (spec.dimensions || "").split(/[xX×*]/).map(d => d.trim());
                              parts[1] = e.target.value;
                              handleUpdateItemSpec(spec.id, "dimensions", [parts[0]||"", parts[1]||"", parts[2]||""].filter(Boolean).join(" x "));
                            }}
                            disabled={!isProcessing}
                            className="w-full h-9 px-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-[13px] disabled:bg-gray-50 disabled:text-gray-700 font-medium text-center"
                          />
                          <span className="text-gray-400 text-[10px] font-bold">×</span>
                          <input
                            type="text"
                            placeholder="Cao"
                            value={spec.dimensions?.split(/[xX×*]/)[2]?.trim() || ""}
                            onChange={(e) => {
                              const parts = (spec.dimensions || "").split(/[xX×*]/).map(d => d.trim());
                              parts[2] = e.target.value;
                              handleUpdateItemSpec(spec.id, "dimensions", [parts[0]||"", parts[1]||"", parts[2]||""].filter(Boolean).join(" x "));
                            }}
                            disabled={!isProcessing}
                            className="w-full h-9 px-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-[13px] disabled:bg-gray-50 disabled:text-gray-700 font-medium text-center"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 mb-4">
                      <div>
                        <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                          Yêu cầu sản xuất (Note)
                        </label>
                        <input
                          type="text"
                          value={spec.note}
                          onChange={(e) =>
                            handleUpdateItemSpec(
                              spec.id,
                              "note",
                              e.target.value,
                            )
                          }
                          disabled={!isProcessing}
                          placeholder="Ghi chú kỹ thuật cho xưởng..."
                          className="w-full h-9 px-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-[13px] disabled:bg-gray-50 disabled:text-gray-700 font-medium"
                        />
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
                          {isProcessing && (
                            <button
                              onClick={() => handleAddDesignImage(spec.id)}
                              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800"
                            >
                              + THÊM ẢNH
                            </button>
                          )}
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
                                {isProcessing && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveDesignImage(spec.id, i);
                                    }}
                                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 shadow-sm"
                                  >
                                    <X size={10} />
                                  </button>
                                )}
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
            {/* Financial Summary Breakdown - ERP Style Vertical Box */}
            <div className="bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm min-w-[320px]">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">Tổng tiền hàng</span>
                  <span className="text-[16px] font-black text-gray-900">
                    {formatVND(estimatedPrice)} <span className="text-[12px] font-bold text-gray-400">₫</span>
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-bold text-orange-500 uppercase tracking-wider">Tiền khách cọc</span>
                  <div className="relative w-40">
                    <PriceInput
                      value={deposit}
                      onChange={(val) => setDeposit(val)}
                      disabled={!isProcessing}
                      placeholder="0"
                      className="w-full h-9 pl-3 pr-10 rounded-lg border border-orange-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-[14px] font-black text-orange-600 disabled:bg-orange-50 text-right"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-orange-400 font-bold">
                      ₫
                    </span>
                  </div>
                </div>

                <div className="pt-2 mt-2 border-t border-dashed border-gray-200 flex items-center justify-between">
                  <span className="text-[13px] font-bold text-emerald-600 uppercase tracking-wider">Còn lại phải thu</span>
                  <span className="text-[20px] font-black text-emerald-600">
                    {formatVND(Math.max(0, estimatedPrice - deposit))} <span className="text-[14px] font-bold text-emerald-400">₫</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {isProcessing && (
                <>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-[13px] font-bold hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    Lưu nháp
                  </button>
                  <button
                    onClick={() => onAction("create_order", req.id)}
                    className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-[13px] font-bold hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-2"
                  >
                    <Package size={16} /> Tạo Đơn Hàng
                  </button>
                </>
              )}

              {isOrderCreated && (
                <span className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[13px] font-bold flex items-center gap-2">
                  <CheckCircle2 size={16} /> Đã chuyển sản xuất
                </span>
              )}

              {/* Cancel Button */}
              {(isProcessing || isPriceFixed || isOrderCreated) && (
                <div className="relative group/cancel">
                  <button
                    disabled={req.hasImportedGoods}
                    onClick={() => setShowConfirmCancel(true)}
                    className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                      req.hasImportedGoods
                        ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                        : "text-red-600 hover:bg-red-50"
                    }`}
                  >
                    Hủy bỏ
                  </button>
                  {req.hasImportedGoods && (
                    <div className="absolute bottom-full mb-2 right-0 w-48 p-2 bg-gray-800 text-white text-[10px] rounded shadow-lg opacity-0 group-hover/cancel:opacity-100 transition-opacity pointer-events-none z-50">
                      Không thể hủy yêu cầu này vì hàng đã được nhập về xưởng.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <ConfirmModal
          isOpen={showConfirmCancel}
          title="Xác nhận hủy yêu cầu"
          message="Bạn có chắc chắn muốn hủy yêu cầu này không? Hành động này không thể hoàn tác."
          onCancel={() => setShowConfirmCancel(false)}
          onConfirm={() => {
            setShowConfirmCancel(false);
            onAction("cancel_req", req.id);
          }}
        />
      </div>
    </div>
  );
};

// ===================== MAIN COMPONENT =====================
export default function OwnerRequirements() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [requirements, setRequirements] = useState(MOCK_REQUIREMENTS);
  const [selectedReqId, setSelectedReqId] = useState(null);
  const [enlargedImg, setEnlargedImg] = useState(null);

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

  const handleAction = (type, reqId, data = null) => {
    setRequirements((prev) =>
      prev.map((r) => {
        if (r.id !== reqId) return r;
        if (type === "save_progress") return { ...r, ...data };
        if (type === "fix_price")
          return { ...r, status: "Đã chốt giá", ...data };
        if (type === "create_order") return { ...r, status: "Đã tạo đơn" };
        if (type === "cancel_req") return { ...r, status: "Đơn đã hủy" };
        if (type === "restore") return { ...r, status: "Đang xử lý" };
        if (type === "view_production") {
          toast.success("Chuyển hướng tới chi tiết sản xuất...");
          return r;
        }
        return r;
      }),
    );
    if (type === "save_progress")
      toast.success("Đã lưu tiến độ & thông số kỹ thuật!");
    if (type === "create_order") {
      // Find the finalized requirement data
      const finalizingReq = requirements.find((r) => r.id === reqId);

      // Simulate pushing to the Orders "database"
      const tenDaysFromNow = new Date();
      tenDaysFromNow.setDate(tenDaysFromNow.getDate() + 15);

      const now = new Date().toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      const newOrder = {
        id: `DH-NEW-${Date.now()}`,
        code: finalizingReq.code.replace("REQ", "DH-DAT"),
        // Full customer object so detail.jsx doesn't crash
        customer: {
          name: finalizingReq.customer,
          phone: finalizingReq.phone,
          address: finalizingReq.address || "Chưa có địa chỉ",
        },
        customerName: finalizingReq.customer,
        phone: finalizingReq.phone,
        type: "Hàng đặt",
        total: finalizingReq.estimatedPrice || 0,
        deposit: 0,
        paymentStatus: "pending",
        status: "Chờ sản xuất",
        date: new Date().toISOString(),
        salesPerson: finalizingReq.salesPerson,
        requirementId: finalizingReq.id,
        deliveryDate: tenDaysFromNow.toISOString().split("T")[0],
        notes: finalizingReq.notes || "",
        // Map requirement items → products structure expected by detail.jsx
        products: (finalizingReq.items || []).map((item) => ({
          name: item.name,
          material: item.material || "Chưa rõ",
          size: item.specs?.dimensions || "",
          finish: item.specs?.note || "",
          pattern: "",
          qty: item.qty || 1,
          price: item.quotedPrice || 0,
        })),
        // Initial timeline
        timeline: [
          {
            time: now,
            label: "Tạo đơn hàng",
            desc: `Tạo từ yêu cầu ${finalizingReq.code}. Đang chờ phân công thợ.`,
            active: true,
          },
        ],
      };

      const existingSimulated = JSON.parse(
        localStorage.getItem("tpf_simulated_orders") || "[]",
      );
      // Remove old stale orders for the same requirement (prevent duplicates with missing data)
      const filteredExisting = existingSimulated.filter(
        (ord) => ord.requirementId !== finalizingReq.id,
      );
      localStorage.setItem(
        "tpf_simulated_orders",
        JSON.stringify([newOrder, ...filteredExisting]),
      );

      toast.success(`Đã tạo đơn hàng thành công`);
      setSelectedReqId(null);
      navigate("/owner/orders?tab=Hàng đặt");
    }
  };

  const hasActiveFilters =
    statusFilter !== "Tất cả" || searchTerm || dateFrom || dateTo;
  const clearAllFilters = () => {
    updateParams({ status: "Tất cả" });
    setSearchTerm("");
    setDateFrom("");
    setDateTo("");
  };

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateFrom, dateTo]);

  return (
    <>
      <PageHelmet title="Yêu cầu khách hàng | Quản lý" />

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
              Danh sách các yêu cầu khách hàng
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
            {/* Search (Start) */}
            <div className="relative flex-1 max-w-sm min-w-[300px]">
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

            {/* Date Filter + Actions (End) */}
            <div className="flex items-center gap-4">
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
                    "Ngày tạo yêu cầu",
                    "Trạng thái",
                  ].map((h, i) => (
                    <th
                      key={i}
                      className={`px-4 py-3 text-[11px] font-bold uppercase tracking-wider ${
                        i === 0
                          ? "text-center w-[60px]"
                          : i === 3
                            ? "text-center"
                            : i === 4
                              ? "text-right pr-6"
                              : "text-left"
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
                        className="px-4 py-3 text-[13px] font-medium text-center"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {r.createdDate}
                      </td>
                      <td className="px-4 py-3 text-right pr-6 relative">
                        <div className="flex items-center justify-end gap-3">
                          <span
                            className="inline-flex items-center px-2.5 py-1 text-[11px] font-bold rounded-md"
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

                          {/* Guided Review Actions */}
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 flex items-center gap-2 transition-all transform translate-x-4 group-hover:translate-x-0 z-20">
                            {statusConfig.actionLabel && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedReqId(r.id);
                                }}
                                className={`flex items-center gap-2 ${statusConfig.actionColor} text-white px-3 py-1.5 rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all outline-none`}
                              >
                                <span className="text-[10px] font-black uppercase tracking-wider">
                                  {statusConfig.actionLabel}
                                </span>
                                <statusConfig.actionIcon size={14} />
                              </button>
                            )}

                            {/* View Detail Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedReqId(r.id);
                              }}
                              className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-xl shadow-sm hover:bg-slate-50 active:scale-95 transition-all text-[10px] font-black uppercase tracking-wider outline-none"
                            >
                              Chi tiết
                              <Eye size={14} />
                            </button>
                          </div>
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
          onAction={handleAction}
          onEnlarge={(src) => setEnlargedImg(src)}
        />

        {/* Image Viewer */}
        <ImageViewer src={enlargedImg} onClose={() => setEnlargedImg(null)} />
      </div>
    </>
  );
}
