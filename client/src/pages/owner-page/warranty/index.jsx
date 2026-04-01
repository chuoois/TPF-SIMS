import React, { useState, useMemo, useEffect } from "react";
import {
  ShieldCheck,
  Search,
  Filter,
  ArrowUpDown,
  Phone,
  Calendar,
  Clock,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Eye,
  AlertCircle,
  CheckCircle2,
  Wrench,
  User,
  Package,
  Layers,
  Truck,
  RefreshCw,
  X,
  FileText,
  DollarSign,
  BadgeDollarSign
} from "lucide-react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import toast from "react-hot-toast";
import { format, addMonths } from "date-fns";
import { vi } from "date-fns/locale";

// ===================== BUSINESS POLICIES =====================
const WARRANTY_POLICIES = {
  NATURAL_WOOD: { 
    id: "NATURAL_WOOD",
    label: "Gỗ tự nhiên (Gụ, Hương, Mít)", 
    duration: 36, 
    coverage: [
      "Bảo hành nứt nẻ, cong vênh do lỗi xử lý gỗ.",
      "Xử lý gỗ bị co ngót, hở mộng do thời tiết.",
      "Cam kết đúng loại gỗ 100%."
    ],
    conditions: "Không để sản phẩm dưới ánh nắng trực tiếp hoặc nơi quá ẩm ướt."
  },
  INDUSTRIAL_WOOD: { 
    id: "INDUSTRIAL_WOOD",
    label: "Gỗ công nghiệp (MDF, HDF)", 
    duration: 12, 
    coverage: [
      "Bảo hành bong tróc cạnh, bề mặt gỗ.",
      "Lỗi phụ kiện (bản lề, tay nắm) trong 12 tháng."
    ],
    conditions: "Tránh tiếp xúc trực tiếp với nước hoặc độ ẩm cao kéo dài."
  }
};

const calculateWarrantyDates = (startDateStr, policyOrDuration) => {
  if (!startDateStr) return { startDate: "N/A", endDate: "N/A", status: "Pending" };
  
  try {
    const start = new Date(startDateStr);
    if (isNaN(start.getTime())) {
      return { startDate: "N/A", endDate: "N/A", status: "Pending" };
    }
    
    // Support both the policy object and a raw duration number
    const duration = typeof policyOrDuration === "object" ? policyOrDuration.duration : policyOrDuration;
    const months = parseInt(duration) || 12;
    
    const end = addMonths(start, months);
    const now = new Date();
    
    let status = "Active";
    if (now > end) {
      status = "Expired";
    }
    
    return {
      startDate: format(start, "yyyy-MM-dd"),
      endDate: format(end, "yyyy-MM-dd"),
      status: status
    };
  } catch (error) {
    console.error("Lỗi tính toán ngày bảo hành:", error);
    return { startDate: "N/A", endDate: "N/A", status: "Pending" };
  }
};

const getPolicyByProductCode = (code) => {
  const c = (code || "").toUpperCase();
  if (c.includes("-MIT") || c.includes("-HUONG") || c.includes("-GU")) return WARRANTY_POLICIES.NATURAL_WOOD;
  return WARRANTY_POLICIES.INDUSTRIAL_WOOD;
};

// ===================== MOCK DATA =====================
const INITIAL_WARRANTIES = [
  {
    id: "BH-DH-SAN-004",
    orderId: "DH-SAN-004",
    customerName: "Phạm Thành Nam",
    customerPhone: "0987654321",
    productName: "Sập thờ Mai Điểu chân 20",
    productCode: "ST-HS-197x107x108-Mit",
    productImg: "https://images.unsplash.com/photo-1620608208153-90928221805b?q=80&w=300",
    warrantyMonths: 36,
    startDate: "2026-03-10",
    endDate: "2029-03-10",
    status: "Active",
    policy: WARRANTY_POLICIES.NATURAL_WOOD,
    history: [
      { date: "2026-03-10", action: "Kích hoạt Tự động", note: "Đã giao hàng thành công. Kích hoạt từ đơn DH-SAN-004" },
    ],
    maintenanceLogs: [],
  },
  {
    id: "BH-DH-EXP-001",
    orderId: "DH-EXP-001",
    customerName: "Nguyễn Hoàng Nam",
    customerPhone: "0912344556",
    productName: "Bàn ăn gỗ sồi 6 ghế",
    productCode: "BA-GO-SOI-001",
    productImg: "https://images.unsplash.com/photo-1577145000248-b7aae941283d?q=80&w=300",
    warrantyMonths: 36,
    startDate: "2025-04-01",
    endDate: "2028-04-01", 
    status: "Active",
    policy: WARRANTY_POLICIES.NATURAL_WOOD,
    history: [
      { date: "2025-04-01", action: "Kích hoạt", note: "Khách mua tại showroom" },
    ],
    maintenanceLogs: [
      { date: "2025-10-15", type: "Xử lý co ngót", detail: "Chỉnh lại mộng bàn bị hở do gỗ co lại trong mùa hanh khô.", status: "Done" }
    ],
  },
  {
    id: "BH-DH-FIX-001",
    orderId: "DH-FIX-001",
    customerName: "Lê Văn Tám",
    customerPhone: "0933445566",
    productName: "Tủ quần áo 4 cánh gỗ Sồi",
    productCode: "TA-SOI-004",
    productImg: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=300",
    warrantyMonths: 36,
    startDate: "2025-01-10",
    endDate: "2028-01-10",
    status: "Claimed",
    policy: WARRANTY_POLICIES.NATURAL_WOOD,
    history: [
      { date: "2025-01-10", action: "Kích hoạt", note: "Đã giao hàng" },
      { date: "2026-03-20", action: "Yêu cầu bảo hành", note: "Cánh tủ bị xệ" }
    ],
    maintenanceLogs: [
      { date: "2026-03-22", type: "Chỉnh sửa bản lề", detail: "Cánh tủ bị xệ do ốc lỏng, đã siết lại và tra dầu.", status: "Done" }
    ],
  },
  {
    id: "BH-DH-OLD-001",
    orderId: "DH-OLD-001",
    customerName: "Hoàng Thị Loan",
    customerPhone: "0977889900",
    productName: "Kệ giày 3 tầng gỗ Cao su",
    productCode: "KG-CS-003",
    productImg: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=300",
    warrantyMonths: 12,
    startDate: "2023-01-01",
    endDate: "2024-01-01",
    status: "Expired",
    policy: WARRANTY_POLICIES.INDUSTRIAL_WOOD,
    history: [
      { date: "2023-01-01", action: "Kích hoạt", note: "Sản phẩm thanh lý" },
      { date: "2024-03-25", action: "Sửa chữa ngoài bảo hành", note: "Sơn lại mặt kệ" }
    ],
    maintenanceLogs: [
      { date: "2024-03-25", type: "Sơn lại làm mới", detail: "Khách yêu cầu sơn lại mặt kệ bị trầy xước.", status: "Done" }
    ],
  }
];

// ===================== REUSABLE COMPONENTS =====================

const getStatusColor = (status) => {
  switch (status) {
    case "Pending":
      return { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" }; // Blue
    case "Active":
      return { bg: "#F0FDF4", text: "#166534", border: "#BBF7D0" }; // Green
    case "Claimed":
      return { bg: "#FEF3C7", text: "#D97706", border: "#FDE68A" }; // Amber/Yellow
    case "Expired":
      return { bg: "#FEF2F2", text: "#B91C1C", border: "#FECACA" }; // Red
    default:
      return { bg: "var(--bg-white)", text: "var(--text-secondary)", border: "var(--grid-border)" };
  }
};

const WarrantyItemRow = ({ item, onDetail, onRepair }) => {
  const woodType = getWoodName(item);
  return (
    <div
      onClick={onDetail}
      className="flex flex-col sm:flex-row items-center gap-6 py-4 border-b border-gray-100 last:border-0 hover:bg-slate-50/50 transition-all px-4 rounded-xl cursor-pointer group"
    >
      {/* Product Image */}
      <div 
        className="h-14 w-14 rounded-xl overflow-hidden shrink-0 border border-gray-100 shadow-sm bg-gray-50"
      >
        <img
          src={item.productImg}
          alt={item.productName}
          className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-4 mb-2">
          <h4 className="text-[14px] font-bold text-gray-900 truncate">
            {item.productName}
          </h4>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 text-[12px]">
          <div className="flex items-center gap-1.5 min-w-[120px]">
             <span className="text-gray-400 font-medium">Mã:</span>
             <span className="font-bold text-gray-600 uppercase font-mono tracking-tight">{item.productCode}</span>
          </div>
          <div className="flex items-center gap-1.5 min-w-[120px]">
             <span className="text-gray-400 font-medium">Chất liệu:</span>
             <span className="font-bold text-gray-700">{woodType}</span>
          </div>
          <div className="flex items-center gap-1.5">
             <span className="text-gray-400 font-medium">Hết hạn:</span>
             <span className="font-bold text-gray-800">{item.endDate ? format(new Date(item.endDate), "dd/MM/yyyy") : "N/A"}</span>
          </div>
        </div>

        <div className="mt-2.5 flex items-center gap-3">
           <StatusBadge status={item.status} endDate={item.endDate} />
        </div>
      </div>

      {/* Action Buttons Area */}
      <div className="shrink-0 flex items-center gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); onRepair(); }}
          className={`h-9 px-4 rounded-xl border transition-all font-bold text-[12px] flex items-center gap-2 ${
            item.status === "Expired"
              ? "border-indigo-200 text-indigo-600 bg-white hover:bg-indigo-600 hover:text-white hover:shadow-lg hover:shadow-indigo-200"
              : "border-orange-200 text-orange-600 bg-white hover:bg-orange-600 hover:text-white hover:shadow-lg hover:shadow-orange-200"
          }`}
        >
          <Wrench size={14} />
          {item.status === "Expired" ? "SỬA CHỮA" : "BẢO TRÌ"}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDetail(); }}
          className="h-9 w-9 rounded-xl border border-gray-200 text-gray-400 bg-white hover:bg-gray-50 hover:text-gray-900 transition-all flex items-center justify-center"
          title="Xem chi tiết"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

const StatusBadge = ({ status, endDate }) => {
  const isExpiringSoon = status === "Active" && endDate && 
    (new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24) < 30;

  const config = getStatusColor(status);
  const label = status === "Active" ? (isExpiringSoon ? "Sắp hết hạn" : "Đang hiệu lực") :
                status === "Claimed" ? "Đang bảo hành" : "Hết hạn";

  return (
    <span
      className="inline-flex items-center px-2.5 py-1 text-[11px] font-bold rounded-md"
      style={{
        backgroundColor: isExpiringSoon ? "#FFF7ED" : config.bg,
        color: isExpiringSoon ? "#C2410C" : config.text,
        border: `1px solid ${isExpiringSoon ? "#FED7AA" : config.border}`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full mr-1.5"
        style={{ backgroundColor: isExpiringSoon ? "#C2410C" : config.text }}
      ></span>
      {label}
    </span>
  );
};

// Helper to extract specific wood name from product name or code
const getWoodName = (w) => {
  if (!w) return "N/A";
  const combined = (w.productName + " " + (w.productCode || "")).toUpperCase();
  if (combined.includes("MÍT") || combined.includes("-MIT")) return "Gỗ Mít";
  if (combined.includes("HƯƠNG") || combined.includes("-HUONG")) return "Gỗ Hương";
  if (combined.includes("GỤ") || combined.includes("-GU")) return "Gỗ Gụ";
  if (combined.includes("SỒI") || combined.includes("-SOI")) return "Gỗ Sồi";
  if (combined.includes("XOAN") || combined.includes("-XOAN")) return "Gỗ Xoan Đào";
  if (combined.includes("MDF") || combined.includes("HDF") || combined.includes("COMPOSITE")) return "Gỗ công nghiệp (MDF/HDF)";
  return w.policy?.label?.split(" (")[0] || "Gỗ tự nhiên";
};

const WarrantyDetailsModal = ({ isOpen, onClose, warranty, onCreateRepair, onCollectPayment }) => {
  const woodType = getWoodName(warranty);
  if (!isOpen || !warranty) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-8 py-6 border-b flex items-center justify-between bg-white relative z-10">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${warranty.status === 'Active' ? 'bg-emerald-500' : 'bg-blue-500'}`}>
              <ShieldCheck size={28} />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 leading-tight">Mã đơn hàng: {warranty.orderId || warranty.id.replace(/^BH-/, "")}</h2>
              <p className="text-[11px] text-gray-400 font-bold flex items-center gap-2 uppercase tracking-widest">
                <Package size={12} /> {warranty.productName} • {warranty.productCode}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10">
          <div className="grid grid-cols-12 gap-8">
            {/* Column 1: Product info */}
            <div className="col-span-4 space-y-6">
              <div className="aspect-square rounded-2xl overflow-hidden border-4 border-gray-50 shadow-inner">
                <img src={warranty.productImg} alt={warranty.productName} className="w-full h-full object-cover" />
              </div>
              <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 italic text-[13px] text-gray-600">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 not-italic">Ghi chú chính sách</h3>
                {warranty.policy?.conditions || "Sử dụng đúng hướng dẫn để được bảo hành tốt nhất."}
              </div>
              <div className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                <h3 className="text-[11px] font-black text-emerald-600 uppercase tracking-widest mb-3">Thông tin Khách hàng</h3>
                <p className="font-bold text-gray-900 flex items-center gap-2 mb-1">
                  <User size={14} className="text-emerald-500" /> {warranty.customerName}
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-2 font-medium">
                  <Phone size={14} className="text-blue-500" /> {warranty.customerPhone}
                </p>
              </div>
            </div>

            {/* Column 2: Warranty & History */}
            <div className="col-span-8 space-y-8">
              {/* Policies & Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:scale-110 transition-transform"><Calendar size={40} /></div>
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Ngày kích hoạt</p>
                  <p className="text-lg font-black text-gray-900">{warranty.startDate ? format(new Date(warranty.startDate), "dd/MM/yyyy") : "Chờ kích hoạt"}</p>
                </div>
                <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:scale-110 transition-transform"><Clock size={40} /></div>
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Ngày hết hạn</p>
                  <p className="text-lg font-black text-red-600">{warranty.endDate ? format(new Date(warranty.endDate), "dd/MM/yyyy") : "Chờ kích hoạt"}</p>
                </div>
              </div>

              {/* Professional Timeline Service Logs */}
              <div className="space-y-6">
                <div className="flex items-center justify-between px-1">
                  <h3 className="font-extrabold text-gray-900 uppercase tracking-tight text-sm flex items-center gap-2">
                    <Clock size={18} className="text-emerald-600" /> Nhật ký sửa chữa & bảo trì
                  </h3>
                  <button 
                    onClick={() => onCreateRepair(warranty)}
                    className="h-8 px-4 rounded-full bg-[#1e1e1e] text-white text-[11px] font-black hover:bg-black transition-all shadow-lg shadow-black/5 flex items-center gap-2"
                  >
                    + Ghi nhận bảo trì
                  </button>
                </div>

                <div className="relative pl-4 space-y-0">
                  <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gray-100"></div>

                  {[
                    ...(warranty.maintenanceLogs || []).map(l => ({ ...l, isMaintenance: true })),
                    ...(warranty.history || []).map(h => ({ ...h, isHistory: true }))
                  ]
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((log, i) => (
                    <div key={i} className="relative pl-8 pb-8 last:pb-0">
                      <div className={`absolute left-0 top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm z-10 
                        ${log.isMaintenance ? (log.serviceType === "Paid" ? 'bg-indigo-500' : 'bg-orange-500') : 'bg-emerald-500'}`}></div>
                      
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">
                            {format(new Date(log.date), "dd/MM/yyyy • HH:mm", { locale: vi })}
                          </span>
                          {log.isMaintenance && (
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase border ${log.serviceType === "Paid" ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                              {log.serviceType === "Paid" ? 'Sửa chữa tính phí' : 'Bảo hành miễn phí'}
                            </span>
                          )}
                        </div>
                        <p className="text-[13px] font-bold text-gray-800 leading-relaxed uppercase tracking-tighter">
                          {log.isMaintenance ? log.type : log.action}
                        </p>
                        <p className="text-[12px] text-gray-500 font-medium">{log.isMaintenance ? log.detail : log.note}</p>
                        
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CreateRepairModal = ({ isOpen, onClose, warranty, onSubmit }) => {
  const [formData, setFormData] = useState({
    serviceType: "Warranty",
    detail: "",
  });

  useEffect(() => {
    if (isOpen && warranty) {
      const isExpired = warranty.status === "Expired";
      setFormData({
        serviceType: isExpired ? "Maintenance" : "Warranty",
        detail: "",
      });
    }
  }, [isOpen, warranty]);

  if (!isOpen || !warranty) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-[480px] rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
        <div className="px-8 py-6 border-b flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
              <Wrench size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 leading-tight italic uppercase italic">Ghi nhận xử lý nhanh</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{warranty.productName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setFormData({...formData, serviceType: "Warranty"})}
              className={`flex-1 h-10 rounded-lg text-xs font-bold transition-all ${
                formData.serviceType === "Warranty" 
                ? 'bg-white text-orange-600 shadow-sm' 
                : 'text-gray-400 hover:text-gray-500'
              }`}
            >
              BẢO HÀNH (0đ)
            </button>
            <button
              onClick={() => setFormData({...formData, serviceType: "Paid"})}
              className={`flex-1 h-10 rounded-lg text-xs font-bold transition-all ${
                formData.serviceType === "Paid" 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-gray-400 hover:text-gray-500'
              }`}
            >
              CÓ PHÍ
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Nội dung xử lý</label>
              <textarea 
                rows={4}
                placeholder="Ví dụ: Sơn lại mặt bàn, Chỉnh mộng bị hở..."
                value={formData.detail}
                onChange={(e) => setFormData({...formData, detail: e.target.value})}
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-700 outline-none focus:bg-white focus:border-blue-500 transition-all resize-none leading-relaxed"
              />
            </div>
          </div>
        </div>

        <div className="px-8 py-6 bg-gray-50/50 border-t flex gap-3">
          <button onClick={onClose} className="flex-1 h-12 rounded-xl bg-white border border-gray-200 text-gray-500 font-black text-xs hover:bg-gray-100 transition-all">
            HỦY
          </button>
          <button 
            onClick={() => {
              if (!formData.detail.trim()) {
                toast.error("Vui lòng nhập nội dung xử lý");
                return;
              }
              const finalData = {
                type: formData.serviceType === "Maintenance" ? "Bảo trì định kỳ" : "Bảo hành miễn phí",
                detail: formData.detail.trim(),
                date: new Date().toISOString(),
                status: "Done",
                serviceType: formData.serviceType
              };
              
              onSubmit(warranty.id, finalData);
              onClose();
            }}
            className="flex-[2] h-12 rounded-xl bg-[#1e1e1e] text-white font-black text-xs hover:bg-black transition-all shadow-xl shadow-black/10"
          >
            LƯU VÀO NHẬT KÝ
          </button>
        </div>
      </div>
    </div>
  );
};

// ===================== MAIN COMPONENT =====================

export default function WarrantyManagement() {
  const [warranties, setWarranties] = useState(() => {
    const saved = localStorage.getItem("tpf_simulated_warranties");
    if (saved) return JSON.parse(saved);
    return INITIAL_WARRANTIES;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [selectedWarrantyId, setSelectedWarrantyId] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isRepairModalOpen, setIsRepairModalOpen] = useState(false);

  // Sync with other tabs/windows
  useEffect(() => {
    const handleStorageChange = () => {
      const updated = localStorage.getItem("tpf_simulated_warranties");
      if (updated) setWarranties(JSON.parse(updated));
    };
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(handleStorageChange, 2000); 
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const toggleOrder = (orderId) => {
    setExpandedOrders(prev => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  };

  const selectedWarranty = useMemo(() => 
    warranties.find(w => w.id === selectedWarrantyId),
    [warranties, selectedWarrantyId]
  );

  const handleCreateRepair = (id, log) => {
    const updated = warranties.map(w => {
      if (w.id === id) {
        return {
          ...w,
          status: "Claimed",
          maintenanceLogs: [log, ...(w.maintenanceLogs || [])],
          history: [
            { 
              date: log.date, 
              action: log.type, 
              note: log.detail
            }, 
            ...(w.history || [])
          ]
        };
      }
      return w;
    });
    setWarranties(updated);
    localStorage.setItem("tpf_simulated_warranties", JSON.stringify(updated));
    toast.success("Đã ghi nhận xử lý thành công");
  };

  const handleCollectPayment = (warrantyId, logDate) => {
    const updated = warranties.map(w => {
      if (w.id === warrantyId) {
        return {
          ...w,
          maintenanceLogs: w.maintenanceLogs.map(log => 
            log.date === logDate ? { ...log, isPaid: true } : log
          )
        };
      }
      return w;
    });
    setWarranties(updated);
    localStorage.setItem("tpf_simulated_warranties", JSON.stringify(updated));
    toast.success("Đã thu tiền thành công!");
  };

  const stats = useMemo(() => {
    const validWarranties = warranties.filter(w => w.status !== "Pending");
    
    let totalServices = 0;
    validWarranties.forEach(w => {
      totalServices += (w.maintenanceLogs || []).length;
    });

    return {
      total: validWarranties.length,
      active: validWarranties.filter(w => {
        const d = calculateWarrantyDates(w.startDate, w.policy);
        return d.status === "Active" && !(w.maintenanceLogs?.some(l => l.status !== "Done"));
      }).length,
      claiming: validWarranties.filter(w => {
        const d = calculateWarrantyDates(w.startDate, w.policy);
        return d.status === "Claimed" || w.maintenanceLogs?.some(l => l.status !== "Done");
      }).length,
      expired: validWarranties.filter(w => {
        const d = calculateWarrantyDates(w.startDate, w.policy);
        return d.status === "Expired";
      }).length,
      totalServices
    };
  }, [warranties]);

  const filteredGroupedWarranties = useMemo(() => {
    const groups = {};
    warranties.forEach(w => {
      if (w.status === "Pending") return; 
      if (!groups[w.orderId]) {
        groups[w.orderId] = {
          orderId: w.orderId,
          customerName: w.customerName,
          customerPhone: w.customerPhone,
          items: [],
          status: "Active"
        };
      }
      const dates = calculateWarrantyDates(w.startDate, w.policy);
      groups[w.orderId].items.push({ ...w, ...dates });
    });

    const result = Object.values(groups).filter(group => {
      const matchSearch = 
        group.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (group.customerPhone && group.customerPhone.includes(searchQuery)) ||
        group.items.some(item => 
          item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.productCode.toLowerCase().includes(searchQuery.toLowerCase())
        );

      let matchStatus = true;
      if (statusFilter !== "All") {
        if (statusFilter === "Claimed") {
          matchStatus = group.items.some(i => i.status === "Claimed");
        } else if (statusFilter === "Active") {
          matchStatus = group.items.every(i => i.status === "Active");
        } else if (statusFilter === "Expired") {
          matchStatus = group.items.every(i => i.status === "Expired");
        }
      }

      return matchSearch && matchStatus;
    });

    return result.map(g => {
      if (g.items.some(i => i.status === "Claimed")) g.status = "Claimed";
      else if (g.items.every(i => i.status === "Expired")) g.status = "Expired";
      else g.status = "Active";
      return g;
    });
  }, [warranties, searchQuery, statusFilter]);

  const paginatedGroups = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredGroupedWarranties.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredGroupedWarranties, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredGroupedWarranties.length / itemsPerPage);

  // ===================== RENDER =====================
  return (
    <>
      <PageHelmet title="Quản lý Bảo hành | TPF-SIMS" />

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
              <ShieldCheck size={22} style={{ color: "var(--brand-primary)" }} />
              Quản lý Bảo hành
            </h1>
            <p
              className="text-[13px] mt-0.5"
              style={{ color: "var(--text-placeholder)" }}
            >
              {filteredGroupedWarranties.length} đơn hàng ({statusFilter === "All" ? "Hệ thống" : statusFilter})
            </p>
          </div>
        </div>

        {/* Status Pills Filter (Order Page Style) */}
        <div className="flex items-center gap-2 shrink-0 px-1 flex-wrap">
          {[
            { id: "All", label: "Tất cả", count: stats.total, color: "text-gray-600", bg: "bg-white", dot: "bg-gray-400" },
            { id: "Active", label: "Đang hiệu lực", count: stats.active, color: "text-emerald-700", bg: "#F0FDF4", dot: "bg-emerald-500" },
            { id: "Claimed", label: "Đang bảo hành", count: stats.claiming, color: "text-amber-700", bg: "#FFF7ED", dot: "bg-amber-500" },
            { id: "Expired", label: "Hết hạn", count: stats.expired, color: "text-red-700", bg: "#FEF2F2", dot: "bg-red-500" },
          ].map((s) => {
            const isActive = statusFilter === s.id;
            return (
              <button
                key={s.id}
                onClick={() => { setStatusFilter(s.id); setCurrentPage(1); }}
                className="px-4 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer flex items-center gap-2 border"
                style={{
                  backgroundColor: isActive ? s.bg : "transparent",
                  color: isActive ? s.color : "var(--text-secondary)",
                  borderColor: isActive ? "rgba(0,0,0,0.05)" : "transparent",
                  boxShadow: isActive ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
                }}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                {s.label}
                <span className="text-[10px] opacity-60 bg-black/5 px-1.5 rounded-md ml-0.5">
                  {s.count}
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
                  placeholder="Khách hàng, mã đơn, SKU gỗ..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="w-full h-9 pl-10 pr-8 rounded-lg text-[13px] border focus:outline-none focus:ring-1 transition"
                  style={{
                    borderColor: "var(--grid-border)",
                    backgroundColor: "#fff",
                    color: "var(--text-main)",
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left relative border-collapse table-fixed">
              <thead
                className="sticky top-0 z-10"
                style={{
                  backgroundColor: "var(--grid-header-bg)",
                  borderBottom: "1px solid var(--grid-border)",
                }}
              >
                <tr>
                  <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider w-[80px] text-gray-400 text-center">#</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider w-[180px] text-gray-400">Mã Đơn Hàng</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider w-[300px] text-gray-400">Khách hàng</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Sản phẩm</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider w-[220px] text-gray-400 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedGroups.map((group, index) => {
                  const isExpanded = expandedOrders.has(group.orderId);
                  return (
                    <React.Fragment key={group.orderId}>
                      <tr 
                        className={`group hover:bg-slate-50 transition-all cursor-pointer ${isExpanded ? 'bg-indigo-50/20' : ''}`}
                        onClick={() => toggleOrder(group.orderId)}
                      >
                        <td className="px-3 py-4 text-[13px] font-medium text-gray-400 italic text-center">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                        <td className="px-4 py-4 font-black text-[13px] text-gray-800">{group.orderId}</td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-[13px] text-gray-900">{group.customerName}</span>
                            <span className="text-[12px] text-gray-500">{group.customerPhone}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-lg text-[11px] font-bold border border-gray-100 w-fit flex items-center gap-1.5 group-hover:bg-white group-hover:border-indigo-100 group-hover:text-indigo-600 transition-all">
                            <Package size={13} /> {group.items.length} món sản phẩm
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="inline-flex">
                            <StatusBadge status={group.status} />
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={5} className="p-0 bg-gray-50/30">
                            <div className="px-10 py-6">
                              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                                {group.items.map((w) => (
                                  <WarrantyItemRow
                                    key={w.id}
                                    item={w}
                                    onDetail={() => { setSelectedWarrantyId(w.id); setIsDetailModalOpen(true); }}
                                    onRepair={() => { setSelectedWarrantyId(w.id); setIsRepairModalOpen(true); }}
                                  />
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
            {filteredGroupedWarranties.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400 space-y-4">
                <Search size={48} className="opacity-20" />
                <p className="text-sm font-medium">Không tìm thấy đơn hàng nào khớp với yêu cầu</p>
              </div>
            )}
          </div>

          {/* Pagination Footer (Order Style) */}
          {filteredGroupedWarranties.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50/30 shrink-0">
              <div className="flex items-center gap-6">
                <div className="text-[13px] text-gray-500 font-medium">
                  Hiển thị <span className="font-bold text-gray-900">{paginatedGroups.length}</span> / {filteredGroupedWarranties.length} đơn hàng
                </div>
                <div className="h-4 w-px bg-gray-200" />
                <div className="flex items-center gap-2">
                  <span className="text-[12px] text-gray-400 font-bold uppercase tracking-wider">Hàng / Trang</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                    className="h-8 px-2 rounded-md text-[13px] border bg-white cursor-pointer font-bold outline-none"
                  >
                    {[8, 15, 30].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white border border-transparent hover:border-gray-200 disabled:opacity-30 transition-all shadow-sm"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="flex items-center px-4 h-10 bg-white border border-gray-200 rounded-xl text-[13px] font-black shadow-sm">
                  {currentPage} <span className="mx-2 text-gray-300">/</span> {totalPages || 1}
                </div>
                <button
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white border border-transparent hover:border-gray-200 disabled:opacity-30 transition-all shadow-sm"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <CreateRepairModal 
        isOpen={isRepairModalOpen} 
        onClose={() => setIsRepairModalOpen(false)} 
        warranty={selectedWarranty}
        onSubmit={handleCreateRepair}
      />

      <WarrantyDetailsModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        warranty={selectedWarranty}
      />
    </>
  );
}
