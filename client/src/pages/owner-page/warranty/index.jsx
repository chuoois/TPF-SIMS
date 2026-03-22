import { useState, useMemo, useEffect } from "react";
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
  Truck,
  RefreshCw,
  X,
  FileText
} from "lucide-react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import toast from "react-hot-toast";
import { format, addMonths } from "date-fns";
import { vi } from "date-fns/locale";

// ===================== BUSINESS POLICIES =====================
const WARRANTY_POLICIES = {
  NATURAL_WOOD: { 
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
    label: "Gỗ công nghiệp (MDF, HDF)", 
    duration: 12, 
    coverage: [
      "Bảo hành bong tróc cạnh, bề mặt gỗ.",
      "Lỗi phụ kiện (bản lề, tay nắm) trong 12 tháng."
    ],
    conditions: "Tránh tiếp xúc trực tiếp với nước hoặc độ ẩm cao kéo dài."
  }
};

const getPolicyByProductCode = (code) => {
  if (code.includes("-Mit") || code.includes("-Huong") || code.includes("-Gu")) return WARRANTY_POLICIES.NATURAL_WOOD;
  return WARRANTY_POLICIES.INDUSTRIAL_WOOD;
};

// ===================== MOCK DATA =====================
const INITIAL_WARRANTIES = [
  {
    id: "BH-DH-SAN-004",
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
      { date: "2025-10-15", type: "Xử lý co ngót", technician: "Trần Văn A", detail: "Chỉnh lại mộng bàn bị hở do gỗ co lại trong mùa hanh khô.", cost: 0, status: "Done" }
    ],
  },
  {
    id: "BH-DH-THO-002",
    customerName: "Đặng Tuấn Kiệt",
    customerPhone: "0931234567",
    productName: "Kệ tivi cột nho 2m4 (Hàng mộc)",
    productCode: "KTV-HM-CotNho-Huong",
    productImg: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=300",
    warrantyMonths: 36,
    startDate: null,
    endDate: null,
    status: "Pending",
    policy: WARRANTY_POLICIES.NATURAL_WOOD,
    history: [
      { date: "2026-03-11", action: "Khởi tạo phiếu (Chờ giao hàng)", note: "Đơn hàng đang trong quá trình gia công" },
    ],
    maintenanceLogs: []
  },
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
      return { bg: "var(--bg-main)", text: "var(--text-secondary)", border: "var(--grid-border)" };
  }
};

const StatusBadge = ({ status, endDate }) => {
  const isExpiringSoon = status === "Active" && endDate && 
    (new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24) < 30;

  const config = getStatusColor(status);
  const label = status === "Pending" ? "Chờ kích hoạt" : 
                status === "Active" ? (isExpiringSoon ? "Sắp hết hạn" : "Bảo hành") :
                status === "Claimed" ? "Đang sửa chữa" : "Hết hạn";

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
  const combined = (w.productName + " " + (w.productCode || "")).toLowerCase();
  if (combined.includes("mít") || combined.includes("-mit")) return "Gỗ Mít";
  if (combined.includes("hương") || combined.includes("-huong")) return "Gỗ Hương";
  if (combined.includes("gụ") || combined.includes("-gu")) return "Gỗ Gụ";
  if (combined.includes("sồi") || combined.includes("-soi")) return "Gỗ Sồi";
  if (combined.includes("mdf") || combined.includes("hdf")) return "Gỗ công nghiệp (MDF/HDF)";
  return w.policy?.label?.split(" (")[0] || "Gỗ tự nhiên";
};

const WarrantyDetailsModal = ({ isOpen, onClose, warranty, onCreateRepair }) => {
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
              <h2 className="text-xl font-black text-gray-900 leading-tight">Mã phiếu: {warranty.id}</h2>
              <p className="text-xs text-gray-400 font-bold flex items-center gap-2 uppercase tracking-tight">
                <Package size={12} /> {warranty.productName}
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
              <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">Thông tin Khách hàng</h3>
                <p className="font-bold text-gray-900 flex items-center gap-2 mb-1">
                  <User size={14} className="text-emerald-500" /> {warranty.customerName}
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-2 font-medium">
                  <Phone size={14} className="text-blue-500" /> {warranty.customerPhone}
                </p>
              </div>
              <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
                 <h3 className="text-[11px] font-black text-emerald-600 uppercase mb-3 tracking-widest">Chi tiết Sản phẩm</h3>
                 <div className="space-y-3">
                   <div>
                     <p className="text-[10px] font-bold text-emerald-600/60 uppercase">Tên sản phẩm</p>
                     <p className="text-sm font-black text-emerald-800">{warranty.productName}</p>
                   </div>
                   <div>
                     <p className="text-[10px] font-bold text-emerald-600/60 uppercase">Mã số (SKU)</p>
                     <p className="text-[11px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded inline-block uppercase italic">{warranty.productCode}</p>
                   </div>
                   <div>
                     <p className="text-[10px] font-bold text-emerald-600/60 uppercase">Loại gỗ</p>
                     <p className="text-[13px] font-bold text-emerald-700">{woodType}</p>
                   </div>
                 </div>
              </div>
            </div>

            {/* Column 2: Warranty & History */}
            <div className="col-span-8 space-y-8">
              {/* Policies & Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Ngày kích hoạt</p>
                  <p className="text-lg font-black text-gray-900">{warranty.startDate ? format(new Date(warranty.startDate), "dd/MM/yyyy") : "Chờ kích hoạt"}</p>
                </div>
                <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Ngày hết hạn</p>
                  <p className="text-lg font-black text-red-600">{warranty.endDate ? format(new Date(warranty.endDate), "dd/MM/yyyy") : "Chờ kích hoạt"}</p>
                </div>
              </div>

              {/* Specific Wood Policy */}
              <div className="p-6 bg-slate-900 text-white rounded-3xl relative overflow-hidden">
                <div className="absolute right-0 bottom-0 opacity-10">
                  <ShieldCheck size={120} />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-emerald-400 mb-4 flex items-center gap-2">
                  <FileText size={16} /> Chính sách bảo hành Gỗ
                </h3>
                <ul className="space-y-3 relative z-10">
                  {warranty.policy?.coverage.map((item, i) => (
                    <li key={i} className="text-sm font-medium flex gap-3">
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 pt-4 border-t border-white/10 text-[11px] text-gray-400 italic">
                  * Ghi chú: {warranty.policy?.conditions}
                </div>
              </div>

              {/* Professional Timeline Service Logs */}
              <div className="space-y-6">
                <div className="flex items-center justify-between px-1">
                  <h3 className="font-extrabold text-gray-900 uppercase tracking-tight text-sm flex items-center gap-2">
                    <Clock size={18} className="text-emerald-600" /> Nhật ký bảo hành & bảo trì
                  </h3>
                  <button 
                    onClick={() => onCreateRepair(warranty)}
                    className="h-8 px-4 rounded-full bg-blue-50 text-blue-700 text-[11px] font-black hover:bg-blue-100 transition-all border border-blue-100 flex items-center gap-2"
                  >
                    + Ghi nhận bảo trì
                  </button>
                </div>

                <div className="relative pl-4 space-y-0">
                  {/* Vertical line mapping from first to last log */}
                  <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gray-100"></div>

                  {[
                    ...(warranty.maintenanceLogs || []).map(l => ({ ...l, isMaintenance: true })),
                    ...(warranty.history || []).map(h => ({ ...h, isHistory: true }))
                  ]
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((log, i) => (
                    <div key={i} className="relative pl-8 pb-8 last:pb-0">
                      {/* Timeline Dot */}
                      <div className={`absolute left-0 top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm z-10 
                        ${log.isMaintenance ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                      
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">
                            {format(new Date(log.date), "dd/MM/yyyy • HH:mm", { locale: vi })}
                          </span>
                          {log.isMaintenance && (
                            <span className="text-[9px] font-black px-1.5 py-0.5 bg-amber-50 text-amber-600 border border-amber-100 rounded uppercase">
                              {log.type}
                            </span>
                          )}
                        </div>
                        <p className="text-[13px] font-bold text-gray-800 leading-relaxed">
                          {log.isMaintenance ? log.detail : log.action}
                        </p>
                        {log.note && <p className="text-[11px] text-gray-500 font-medium italic">{log.note}</p>}
                        {log.technician && (
                          <div className="flex items-center gap-2 mt-1">
                             <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-600 border border-gray-200 uppercase">
                               {log.technician.charAt(0)}
                             </div>
                             <span className="text-[11px] text-gray-400 font-bold">KT: {log.technician}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-8 py-6 border-t bg-gray-50/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-emerald-500 scale-125"></div>
             <span className="text-[11px] font-black text-gray-600 uppercase tracking-widest italic">TPF-SIMS • Wood Specialist System</span>
          </div>
          <div className="flex items-center gap-3">
            {warranty.status === "Pending" ? (
              <div className="flex flex-col items-end gap-1">
                <span className="text-[12px] font-black text-blue-600 animate-pulse flex items-center gap-2">
                  <Clock size={16} /> Tự động kích hoạt sau khi giao hàng
                </span>
                <span className="text-[10px] text-gray-400 italic">Theo dõi trạng thái tại mục Quản lý Đơn hàng</span>
              </div>
            ) : (
              <>
                <button className="h-11 px-6 rounded-2xl border border-gray-200 bg-white text-gray-600 text-[13px] font-black hover:bg-gray-100 transition-all flex items-center gap-2">
                  <ExternalLink size={16} /> Phiếu bảo hành (In)
                </button>
                <button 
                  onClick={() => onCreateRepair(warranty)}
                  className="h-11 px-6 rounded-2xl bg-[#1e1e1e] text-white text-[13px] font-black hover:bg-black transition-all flex items-center gap-2 shadow-lg shadow-black/10"
                >
                  <Wrench size={16} /> Ghi nhận nứt nẻ/co ngót
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const CreateRepairModal = ({ isOpen, onClose, warranty, onSubmit }) => {
  const [formData, setFormData] = useState({
    type: "Bảo hành Co ngót",
    technician: "",
    detail: "",
    cost: 0,
    status: "Done"
  });

  if (!isOpen || !warranty) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-10 py-8 border-b flex items-center justify-between bg-white relative">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Wrench size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 leading-tight">Ghi nhận Bảo trì</h2>
              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">{warranty.id} • {warranty.productCode}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-10 space-y-8">
          <div className="space-y-6">
            <div>
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Phân loại xử lý</label>
              <div className="grid grid-cols-2 gap-3">
                {["Bảo hành Co ngót", "Xử lý Nứt nẻ", "Chỉnh mộng", "Đánh bóng", "Sửa chữa tính phí"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFormData({...formData, type})}
                    className={`h-11 px-4 rounded-xl text-xs font-bold transition-all border ${
                      formData.type === type 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/10' 
                      : 'bg-gray-50 text-gray-600 border-gray-100 hover:border-gray-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Nhân viên thực hiện</label>
                <input 
                  type="text"
                  placeholder="Họ tên nhân viên..."
                  value={formData.technician}
                  onChange={(e) => setFormData({...formData, technician: e.target.value})}
                  className="w-full h-12 px-5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all"
                />
              </div>
              <div>
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Chi phí sửa chữa</label>
                <div className="relative">
                   <input 
                    type="text"
                    placeholder="0"
                    value={formData.cost?.toLocaleString('vi-VN')}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setFormData({...formData, cost: parseInt(val) || 0});
                    }}
                    className="w-full h-12 px-5 pr-12 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all text-blue-700"
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-black text-gray-400">đ</span>
                </div>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Nội dung chi tiết & Ghi chú</label>
              <textarea 
                rows={4}
                placeholder="Nhập chi tiết tình trạng lỗi và cách thức đã xử lý cho khách hàng..."
                value={formData.detail}
                onChange={(e) => setFormData({...formData, detail: e.target.value})}
                className="w-full p-5 bg-gray-50 border border-gray-100 rounded-[1.5rem] text-sm font-medium outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all resize-none leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-10 py-8 bg-gray-50/50 border-t flex gap-4">
          <button onClick={onClose} className="flex-1 h-14 rounded-2xl bg-white border border-gray-200 text-gray-600 font-black text-sm hover:bg-gray-100 transition-all">
            Đóng
          </button>
          <button 
            onClick={() => {
              // Ensure we have at least a basic detail
              const finalData = {
                ...formData,
                technician: formData.technician.trim() || "Chủ cửa hàng",
                detail: formData.detail.trim() || formData.type,
                date: new Date().toISOString()
              };
              
              if (!finalData.detail) {
                toast.error("Vui lòng nhập nội dung chi tiết");
                return;
              }
              
              onSubmit(warranty.id, finalData);
              onClose();
            }}
            className="flex-[2] h-14 rounded-2xl bg-[#1e1e1e] text-white font-black text-sm hover:bg-black transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-2"
          >
            Lưu vào nhật ký bảo trì
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
    
    // Nếu chưa có thì dùng initial và lưu luôn vào localStorage
    const initialized = INITIAL_WARRANTIES.map(w => ({
      ...w,
      policy: w.policy || getPolicyByProductCode(w.productCode),
      maintenanceLogs: w.maintenanceLogs || []
    }));
    localStorage.setItem("tpf_simulated_warranties", JSON.stringify(initialized));
    return initialized;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal states
  const [selectedWarrantyId, setSelectedWarrantyId] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isRepairModalOpen, setIsRepairModalOpen] = useState(false);

  const selectedWarranty = useMemo(() => 
    warranties.find(w => w.id === selectedWarrantyId),
    [warranties, selectedWarrantyId]
  );

  // Lắng nghe thay đổi từ localStorage (để sync khi Order update)
  useEffect(() => {
    const handleStorageChange = () => {
      const updated = localStorage.getItem("tpf_simulated_warranties");
      if (updated) setWarranties(JSON.parse(updated));
    };

    window.addEventListener('storage', handleStorageChange);
    // Shortcut cho cùng window (vì event storage chỉ trigger cho các window KHÁC)
    const interval = setInterval(handleStorageChange, 1000); 
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const activateWarranty = (id) => {
    setWarranties(prevWarranties => {
      const updated = prevWarranties.map(w => {
        if (w.id === id) {
          const startDate = new Date();
          const policy = getPolicyByProductCode(w.productCode);
          const endDate = addMonths(startDate, policy.duration);
          
          return {
            ...w,
            status: "Active",
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            policy,
            warrantyMonths: policy.duration,
            maintenanceLogs: [],
            history: [
              ...(w.history || []),
              { date: new Date().toISOString(), action: "Kích hoạt Bảo hành Gỗ", note: `Bảo hành ${policy.label} chính thức có hiệu lực.` }
            ]
          };
        }
        return w;
      });
      localStorage.setItem("tpf_simulated_warranties", JSON.stringify(updated));
      return updated;
    });
    toast.success("Đã kích hoạt bảo hành gỗ thành công!");
  };

  const handleCreateRepair = (id, repairData) => {
    setWarranties(prevWarranties => {
      const updated = prevWarranties.map(w => {
        if (w.id === id) {
          return {
            ...w,
            status: (repairData.type || "").includes("Bảo hành") || (repairData.type || "").includes("Sửa chữa") ? "Claimed" : w.status,
            maintenanceLogs: [
              { ...repairData, date: repairData.date || new Date().toISOString() },
              ...(w.maintenanceLogs || [])
            ]
          };
        }
        return w;
      });
      localStorage.setItem("tpf_simulated_warranties", JSON.stringify(updated));
      return updated;
    });
    toast.success("Đã lưu yêu cầu sửa chữa/bảo trì");
  };

  const saveAndSync = (updated) => {
    localStorage.setItem("tpf_simulated_warranties", JSON.stringify(updated));
    setWarranties(updated);
  };

  const filteredWarranties = useMemo(() => {
    return warranties.filter((w) => {
      const matchSearch =
        w.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (w.customerPhone && w.customerPhone.includes(searchQuery)) ||
        w.productCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchStatus = statusFilter === "All" || w.status === statusFilter;
      
      return matchSearch && matchStatus;
    });
  }, [warranties, searchQuery, statusFilter]);

  const paginatedWarranties = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredWarranties.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredWarranties, currentPage]);

  const totalPages = Math.ceil(filteredWarranties.length / itemsPerPage);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const stats = {
    total: warranties.length,
    active: warranties.filter((w) => w.status === "Active").length,
    pending: warranties.filter((w) => w.status === "Pending").length,
    claiming: warranties.filter((w) => w.status === "Claimed").length,
    expired: warranties.filter((w) => w.status === "Expired").length,
  };

  return (
    <div className="flex flex-col h-full bg-[#f8f9fa]">
      <PageHelmet title="Quản lý Bảo hành | TPF-SIMS" description="Quản lý chính sách và phiếu bảo hành sản phẩm" />

      {/* HEADER SECTION */}
      <div className="bg-white border-b px-8 py-6 shrink-0">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Quản lý Bảo hành</h1>
              <p className="text-gray-400 text-sm font-medium mt-0.5">
                Quản lý phiếu và chính sách bảo hành sản phẩm
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-5 gap-4">
          {[
            { label: "Tổng số", value: stats.total, color: "text-gray-600", bg: "bg-white", status: "All" },
            { label: "Chờ kích hoạt", value: stats.pending, color: "text-blue-600", bg: "bg-blue-50", status: "Pending" },
            { label: "Đang hiệu lực", value: stats.active, color: "text-emerald-600", bg: "bg-emerald-50", status: "Active" },
            { label: "Đang bảo trì", value: stats.claiming, color: "text-amber-600", bg: "bg-amber-50", status: "Claimed" },
            { label: "Đã hết hạn", value: stats.expired, color: "text-red-600", bg: "bg-red-50", status: "Expired" },
          ].map((s, i) => (
            <div 
              key={i} 
              onClick={() => setStatusFilter(s.status)}
              className={`${s.bg} rounded-2xl p-5 border cursor-pointer transition-all hover:-translate-y-1 ${
                statusFilter === s.status 
                ? 'ring-2 ring-offset-2 ring-blue-500 shadow-md border-transparent scale-[1.02]' 
                : 'border-gray-100 shadow-sm opacity-80 hover:opacity-100'
              }`}
            >
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
              <div className="flex items-end gap-2">
                <span className={`text-2xl font-black ${s.color}`}>{s.value}</span>
                <span className="text-[12px] font-medium text-gray-400 mb-1">phiếu</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FILTER BAR - EXACTLY LIKE orders/index.jsx */}
      <div 
        className="flex items-center justify-between p-4 px-6 border-b shrink-0"
        style={{ backgroundColor: "var(--bg-main)", borderColor: "var(--grid-border)" }}
      >
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-sm group">
            <Search 
              size={16} 
              className="absolute left-3 top-1/2 -translate-y-1/2 transition-colors" 
              style={{ color: "var(--text-placeholder)" }}
            />
            <input
              type="text"
              placeholder="Tìm theo tên khách, SĐT, mã SKU hoặc mã phiếu..."
              className="w-full h-9 pl-10 pr-8 rounded-lg text-[13px] border focus:outline-none focus:ring-1 transition font-medium"
              style={{
                borderColor: "var(--grid-border)",
                backgroundColor: "#fff",
                color: "var(--text-main)",
              }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full cursor-pointer"
              >
                <X size={14} style={{ color: "var(--text-placeholder)" }} />
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-medium" style={{ color: "var(--text-secondary)" }}>Trạng thái:</span>
            <select
              className="h-9 px-3 pr-8 rounded-lg text-[13px] font-bold border cursor-pointer focus:outline-none focus:ring-1 transition appearance-none bg-white"
              style={{
                borderColor: "var(--grid-border)",
                color: "var(--text-main)",
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 8px center",
              }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">Tất cả</option>
              <option value="Pending">Chờ kích hoạt</option>
              <option value="Active">Đang hiệu lực</option>
              <option value="Claimed">Đang sửa chữa</option>
              <option value="Expired">Hết hạn</option>
            </select>
          </div>
        </div>
      </div>

      {/* TABLE AREA */}
      <div className="flex-1 overflow-hidden" style={{ backgroundColor: "var(--bg-main)" }}>
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left relative border-collapse table-fixed">
              <thead className="sticky top-0 z-10" style={{ backgroundColor: "var(--bg-main)", borderBottom: "1px solid var(--grid-border)" }}>
                <tr className="bg-gray-50/30">
                  <th className="pl-6 pr-3 py-3 text-[11px] font-bold uppercase tracking-wider w-[60px]" style={{ color: "var(--text-placeholder)" }}>STT</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider w-[140px]" style={{ color: "var(--text-placeholder)" }}>Mã Phiếu</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider w-[200px]" style={{ color: "var(--text-placeholder)" }}>Khách hàng</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-placeholder)" }}>Sản phẩm</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider w-[180px]" style={{ color: "var(--text-placeholder)" }}>Thời hạn</th>
                  <th className="pr-6 pl-4 py-3 text-[11px] font-bold uppercase tracking-wider w-[140px]" style={{ color: "var(--text-placeholder)" }}>Trạng thái</th>
                </tr>
              </thead>
              <tbody className="">
                {paginatedWarranties.map((w, index) => (
                  <tr 
                    key={w.id} 
                    className="group hover:bg-slate-50/50 transition-all duration-300 cursor-pointer"
                    style={{ borderBottom: "1px solid var(--grid-border)" }}
                    onClick={() => {
                      setSelectedWarrantyId(w.id);
                      setIsDetailModalOpen(true);
                    }}
                  >
                    <td className="pl-6 pr-3 py-3 text-[13px] font-medium" style={{ color: "var(--text-secondary)" }}>
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-4 py-3 font-bold text-[13px] tracking-tight" style={{ color: "var(--text-main)" }}>
                      {w.id}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-[14px]" style={{ color: "var(--text-main)" }}>
                          {w.customerName}
                        </span>
                        <span className="text-[12px] font-medium tracking-tight" style={{ color: "var(--text-secondary)" }}>
                          {w.customerPhone}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-50 overflow-hidden shrink-0 border border-gray-100">
                          <img src={w.productImg} alt={w.productName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-[13px] line-clamp-1" style={{ color: "var(--text-main)" }}>{w.productName}</span>
                          <span className="text-[10px] font-black bg-gray-50 px-1.5 py-0.5 rounded mt-1 w-fit uppercase tracking-tighter border border-gray-100" style={{ color: "var(--text-placeholder)" }}>{w.productCode}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-[13px]" style={{ color: "var(--text-secondary)" }}>
                      {w.startDate ? (
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            <span>{new Date(w.startDate).toLocaleDateString('vi-VN')}</span>
                            <span className="text-gray-300">~</span>
                            <span>{new Date(w.endDate).toLocaleDateString('vi-VN')}</span>
                          </div>
                          <span className="text-[11px]" style={{ color: "var(--text-placeholder)" }}>
                            {w.status === "Expired" ? "Đã hết hạn" : `Thời hạn ${w.warrantyMonths} tháng`}
                          </span>
                        </div>
                      ) : (
                        <span className="italic" style={{ color: "var(--text-placeholder)" }}>Tự động kích hoạt khi giao</span>
                      )}
                    </td>
                    <td className="pr-6 pl-4 py-3 relative h-full">
                      <div className="flex items-center h-full relative">
                        <StatusBadge status={w.status} endDate={w.endDate} />
                        
                        {/* CHI TIẾT Button Overlay - Exactly like orders/index.jsx */}
                        <div className="absolute inset-0 flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity bg-white/40 backdrop-blur-[1px] z-10">
                           <button
                             onClick={(e) => {
                               e.stopPropagation();
                               setSelectedWarrantyId(w.id);
                               setIsDetailModalOpen(true);
                             }}
                             className="h-8 px-3 rounded-xl bg-white border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-wider hover:bg-slate-50 transition-all flex items-center gap-2 active:scale-95 whitespace-nowrap shadow-sm"
                           >
                             <Eye size={14} /> CHI TIẾT
                           </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Footer - VERBATIM FROM orders/index.jsx */}
          {filteredWarranties.length > 0 && (
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
                  {filteredWarranties.length}
                </span>
              </div>

              <div className="flex items-center gap-6">
                {/* Items per page indicator */}
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
                    {[8, 15, 30, 50, 100].map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Range Info */}
                <div
                  className="text-[13px]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <span
                    className="font-bold"
                    style={{ color: "var(--text-main)" }}
                  >
                    {(currentPage - 1) * itemsPerPage + 1} -{" "}
                    {Math.min(currentPage * itemsPerPage, filteredWarranties.length)}
                  </span>{" "}
                  bản ghi
                </div>

                {/* Arrows */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); setCurrentPage((p) => Math.max(1, p - 1)); }}
                    disabled={currentPage === 1}
                    className="flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer hover:bg-gray-200 rounded p-1"
                    style={{ color: "var(--text-main)" }}
                  >
                    <ChevronLeft size={16} strokeWidth={2.5} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setCurrentPage((p) => Math.min(totalPages, p + 1)); }}
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
          
          {/* EMPTY STATE */}
          {filteredWarranties.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center py-20 bg-gray-50/50">
              <div className="w-20 h-20 bg-white border border-dashed border-gray-300 rounded-3xl flex items-center justify-center text-gray-300 mb-4 animate-pulse">
                <ShieldCheck size={40} />
              </div>
              <p className="text-gray-500 font-bold">Không tìm thấy phiếu bảo hành nào</p>
            </div>
          )}
        </div>
      </div>
      {/* MODALS */}
      <WarrantyDetailsModal 
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        warranty={selectedWarranty}
        onCreateRepair={(w) => {
          setSelectedWarrantyId(w.id);
          setIsRepairModalOpen(true);
        }}
      />
      <CreateRepairModal 
        isOpen={isRepairModalOpen}
        onClose={() => setIsRepairModalOpen(false)}
        warranty={selectedWarranty}
        onSubmit={handleCreateRepair}
      />
    </div>
  );
}
