import { useState } from "react";
import { Link } from "react-router-dom";
import { PageHelmet } from "@/components/seo/PageHelmet";
import {
  Search,
  FileText,
  Clock,
  ChevronRight,
  User,
  Hammer,
  Calculator,
  Camera,
  Layers,
  CheckCircle2,
  X,
  Info,
  Maximize2,
  ExternalLink,
} from "lucide-react";

// ===================== MOCK DATA =====================
const MOCK_REQUIREMENTS = [
  {
    id: "REQ-001",
    code: "REQ-2603-0001",
    customer: "Lê Thị Lan",
    phone: "0345678901",
    salesPerson: "Bình Nguyễn",
    date: "2026-03-12",
    status: "Yêu cầu mới",
    content: "Tủ quần áo gỗ sồi Mỹ, thiết kế tối giản, 4 cánh mở, kích thước 2.2m x 2.4m.",
    material: "Gỗ Sồi Mỹ",
    priority: "Normal",
    specs: {
      dimensions: "2200 x 2400 x 600 mm",
      finish: "Sơn PU mờ 75% màu sáng",
      accessories: "Bản lề Hafele giảm chấn, thanh treo inox",
      note: "Yêu cầu chia làm 4 khoang đều nhau",
    },
    images: [
      "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1544644131-40436940a6b1?auto=format&fit=crop&q=80&w=600"
    ]
  },
  {
    id: "REQ-002",
    code: "REQ-2603-0002",
    customer: "Trần Minh Quang",
    phone: "0909123456",
    salesPerson: "Bình Nguyễn",
    date: "2026-03-11",
    status: "Đã báo giá",
    content: "Bộ bàn ăn 8 ghế, mẫu hoàng gia, đục chạm thủ công tinh xảo.",
    material: "Gỗ Gõ Đỏ Pachy",
    price: 85000000,
    priority: "High",
    specs: {
      dimensions: "Bàn 2.4m x 1.1m, Ghế cao 1.15m",
      finish: "Đánh vecni thủ công màu cánh gián",
      accessories: "Mặt kính cường lực 10mm tặng kèm",
      note: "Hoa văn chạm khắc theo mẫu Louis XVI",
    },
    images: [
      "https://images.unsplash.com/photo-1617806118233-ef203e91122b?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1577145946459-39f502f59b4c?auto=format&fit=crop&q=80&w=600"
    ]
  },
  {
    id: "REQ-003",
    code: "REQ-2603-0003",
    customer: "Phạm Thành Nam",
    phone: "0987654321",
    salesPerson: "Bình Nguyễn",
    date: "2026-03-10",
    status: "Đã tạo đơn",
    content: "Giường ngủ tân cổ điển, bọc da đầu giường, dát phản gỗ tự nhiên.",
    material: "Gỗ Hương Đá",
    price: 32000000,
    priority: "Normal",
    specs: {
      dimensions: "1.8m x 2m x 0.45m",
      finish: "Sơn PU bóng mờ giữ vân tự nhiên",
      accessories: "Da bò Ý nhập khẩu bọc đầu giường",
      note: "Chân giường đục họa tiết hoa lá tây",
    },
    images: [
      "https://images.unsplash.com/photo-1505693419173-42b9218a5c81?auto=format&fit=crop&q=80&w=600"
    ]
  },
  {
    id: "REQ-004",
    code: "REQ-2603-0004",
    customer: "Vũ Thị Hồng",
    phone: "0911223344",
    salesPerson: "Bình Nguyễn",
    date: "2026-03-09",
    status: "Không thực hiện",
    content: "Kệ tivi gỗ ép giá rẻ (Yêu cầu ngoài danh mục vật liệu cao cấp của xưởng).",
    material: "Gỗ ép công nghiệp",
    priority: "Low",
    specs: {
      dimensions: "1.6m x 0.4m x 0.5m",
      finish: "Phủ Melamine vân gỗ",
      accessories: "Ray trượt thường",
      note: "Từ chối vì xưởng chỉ làm hàng gỗ tự nhiên cao cấp.",
    },
    images: []
  },
];

const getStatusColor = (status) => {
  switch (status) {
    case "Yêu cầu mới": return { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" };
    case "Đã báo giá": return { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" };
    case "Đã tạo đơn": return { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" };
    case "Không thực hiện": return { bg: "#F3F4F6", text: "#6B7280", border: "#E5E7EB" };
    default: return { bg: "#F3F4F6", text: "#6B7280", border: "#E5E7EB" };
  }
};

// ===================== SUB-COMPONENTS =====================
const ImageViewer = ({ src, onClose }) => {
  if (!src) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-8 bg-black/95 animate-in fade-in duration-200">
       <button onClick={onClose} className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition">
          <X size={24} />
       </button>
       <img src={src} alt="enlarged" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
    </div>
  );
};

const RequirementDetailModal = ({ req, onClose, onAction, onEnlarge }) => {
  if (!req) return null;
  const ss = getStatusColor(req.status);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      
      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="px-8 py-6 border-b flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <FileText size={24} />
             </div>
             <div>
                <h2 className="text-[18px] font-black text-gray-800">Chi tiết yêu cầu: {req.code}</h2>
                <div className="flex items-center gap-2 mt-0.5">
                   <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase" style={{ backgroundColor: ss.bg, color: ss.text, border: `1px solid ${ss.border}` }}>
                      {req.status}
                   </span>
                   <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
                      <Clock size={11} /> {req.date}
                   </span>
                </div>
             </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
           {/* Section 1: Nội dung yêu cầu */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                 <div>
                    <h3 className="text-[12px] font-black uppercase tracking-tighter text-gray-400 mb-3 flex items-center gap-2">
                       <Info size={14} className="text-indigo-500" /> Mô tả yêu cầu
                    </h3>
                    <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 italic text-gray-700 leading-relaxed text-[15px]">
                       "{req.content}"
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-gray-50/50 border border-gray-100">
                       <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Vật liệu chính</p>
                       <p className="text-[14px] font-bold text-gray-800 flex items-center gap-1.5">
                          <Layers size={14} className="text-indigo-400" /> {req.material}
                       </p>
                    </div>
                    {req.price && (
                       <div className="p-4 rounded-xl bg-orange-50/50 border border-orange-100">
                          <p className="text-[10px] uppercase font-bold text-orange-400 mb-1">Giá dự kiến</p>
                          <p className="text-[14px] font-black text-orange-600">
                             {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(req.price)}
                          </p>
                       </div>
                    )}
                 </div>
              </div>

              {/* Gallery */}
              <div>
                 <h3 className="text-[12px] font-black uppercase tracking-tighter text-gray-400 mb-3 flex items-center gap-2">
                    <Camera size={14} className="text-indigo-500" /> Hình ảnh & Phác thảo
                 </h3>
                 <div className="grid grid-cols-2 gap-3">
                    {req.images?.map((img, idx) => (
                       <div 
                         key={idx} 
                         onClick={() => onEnlarge(img)}
                         className="relative aspect-square rounded-2xl overflow-hidden group/img cursor-pointer border border-gray-100 shadow-sm transition hover:scale-[1.02]"
                       >
                          <img src={img} alt="requirement" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                             <Maximize2 size={24} className="text-white drop-shadow-lg" />
                          </div>
                       </div>
                    ))}
                    {(!req.images || req.images.length === 0) && (
                       <div className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 col-span-2">
                          <Camera size={24} strokeWidth={1} />
                          <p className="text-[11px] mt-2 font-medium italic">Không có hình ảnh đính kèm</p>
                       </div>
                    )}
                 </div>
              </div>
           </div>

           {/* Section 2: Thông số kỹ thuật */}
           <div className="pt-6 border-t border-gray-100">
              <h3 className="text-[12px] font-black uppercase tracking-tighter text-gray-400 mb-4 flex items-center gap-2">
                 <Hammer size={14} className="text-indigo-500" /> Thông số kỹ thuật chi tiết
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                 <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-[13px] text-gray-500">Kích thước (D x R x C)</span>
                    <span className="text-[13px] font-bold text-gray-800">{req.specs?.dimensions || "Chưa xác định"}</span>
                 </div>
                 <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-[13px] text-gray-500">Loại hoàn thiện / Sơn</span>
                    <span className="text-[13px] font-bold text-gray-800">{req.specs?.finish || "Theo tiêu chuẩn"}</span>
                 </div>
                 <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-[13px] text-gray-500">Phụ kiện & Phần cứng</span>
                    <span className="text-[13px] font-bold text-gray-800">{req.specs?.accessories || "Tùy chọn"}</span>
                 </div>
                 <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-[13px] text-gray-500">Mức độ ưu tiên</span>
                    <span className={`text-[13px] font-black ${req.priority === 'High' ? 'text-red-500' : 'text-gray-800'}`}>
                       {req.priority === 'High' ? 'Cao (Gấp)' : req.priority === 'Low' ? 'Thấp' : 'Trung bình'}
                    </span>
                 </div>
              </div>
              {req.specs?.note && (
                 <div className="mt-4 p-4 rounded-xl bg-blue-50/50 border border-blue-100/50">
                    <p className="text-[11px] font-black text-blue-600 uppercase mb-1">Lưu ý kỹ thuật:</p>
                    <p className="text-[13px] text-blue-800">{req.specs.note}</p>
                 </div>
              )}
           </div>

           {/* Customer Info */}
           <div className="p-6 rounded-[24px] bg-gray-50 border border-gray-100 flex flex-col md:flex-row items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-[24px] font-black text-indigo-600">
                 {req.customer.charAt(0)}
              </div>
              <div className="flex-1 text-center md:text-left">
                 <p className="text-[16px] font-black text-gray-800">{req.customer}</p>
                 <p className="text-[13px] text-gray-500 font-medium">Số điện thoại: {req.phone}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                 <button className="h-10 px-6 rounded-xl border border-gray-200 bg-white text-[13px] font-bold text-gray-600 hover:bg-gray-50 transition flex items-center gap-2">
                    <ExternalLink size={14} /> Xem hồ sơ khách
                 </button>
              </div>
           </div>
        </div>

        {/* Footer Actions */}
        <div className="px-8 py-6 border-t bg-gray-50 flex items-center justify-end gap-3">
           <button 
             onClick={onClose}
             className="h-11 px-6 rounded-2xl text-[14px] font-bold text-gray-500 hover:bg-gray-100 transition"
           >
             Đóng
           </button>
           {req.status === "Yêu cầu mới" && (
             <>
               <button 
                 onClick={() => onAction("cancel")}
                 className="h-11 px-6 rounded-2xl text-[14px] font-bold text-red-500 hover:bg-red-50 transition"
               >
                 Hủy yêu cầu
               </button>
               <button 
                 onClick={() => onAction("quote")}
                 className="h-11 px-8 rounded-2xl bg-indigo-600 text-white text-[14px] font-bold hover:bg-indigo-700 transition shadow-xl shadow-indigo-100 flex items-center gap-2"
               >
                 <Calculator size={18} /> Gửi báo giá ngay
               </button>
             </>
           )}
           {req.status === "Đã báo giá" && (
             <button 
                onClick={() => onAction("create_order")}
                className="h-11 px-8 rounded-2xl bg-emerald-600 text-white text-[14px] font-bold hover:bg-emerald-700 transition shadow-xl shadow-emerald-100 flex items-center gap-2"
             >
               <CheckCircle2 size={18} /> Chốt đơn & Tạo đơn hàng
             </button>
           )}
        </div>
      </div>
    </div>
  );
};

// ===================== MAIN COMPONENT =====================
export default function OwnerRequirements() {
  const [searchTerm, setSearchTerm] = useState("");
  const [requirements, setRequirements] = useState(MOCK_REQUIREMENTS);
  const [selectedReqId, setSelectedReqId] = useState(null);
  const [enlargedImg, setEnlargedImg] = useState(null);

  const filtered = requirements.filter(r => 
    r.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedReq = requirements.find(r => r.id === selectedReqId);

  const handleAction = (type, reqId = selectedReqId) => {
    const currentReq = requirements.find(r => r.id === reqId);
    if (!currentReq) return;

    if (type === "create_order") {
       const ok = window.confirm(`Xác nhận tạo đơn hàng từ yêu cầu ${currentReq.code}?\n\nĐơn hàng mới sẽ được tạo trong danh sách 'Hàng đặt'.`);
       if(ok) {
          setRequirements(prev => prev.map(r => r.id === reqId ? { ...r, status: "Đã tạo đơn" } : r));
          alert("Đã tạo đơn hàng thành công! (Mã DH-linked-" + currentReq.id + ")");
          setSelectedReqId(null);
       }
    } else if (type === "quote") {
       setRequirements(prev => prev.map(r => r.id === reqId ? { ...r, status: "Đã báo giá" } : r));
       alert(`Đã gửi báo giá cho yêu cầu ${currentReq.code} thành công.`);
       setSelectedReqId(null);
    } else if (type === "cancel") {
       const ok = window.confirm(`Bạn có chắc muốn hủy yêu cầu ${currentReq.code}?`);
       if(ok) {
          setRequirements(prev => prev.map(r => r.id === reqId ? { ...r, status: "Không thực hiện" } : r));
          alert(`Đã hủy yêu cầu ${currentReq.code}.`);
          setSelectedReqId(null);
       }
    }
  };

  return (
    <>
      <PageHelmet title="Yêu cầu khách hàng | Quản lý" />
      
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-[20px] font-black tracking-tight" style={{ color: "var(--text-main)" }}>Yêu Cầu Khách Hàng</h1>
            <p className="text-[13px] mt-1" style={{ color: "var(--text-secondary)" }}>Xử lý các đơn hàng thiết kế riêng theo yêu cầu</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm tên khách, mã yêu cầu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 pl-10 pr-4 w-64 rounded-xl text-[13px] border transition focus:outline-none focus:ring-2"
                style={{ borderColor: "var(--grid-border)", backgroundColor: "var(--background)" }}
              />
            </div>
          </div>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                 <Camera size={22} />
              </div>
              <div>
                 <p className="text-[24px] font-black line-height-1">2</p>
                 <p className="text-[12px] font-bold text-gray-400 uppercase tracking-tighter">Cần phác thảo</p>
              </div>
           </div>
           <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                 <Calculator size={22} />
              </div>
              <div>
                 <p className="text-[24px] font-black line-height-1">1</p>
                 <p className="text-[12px] font-bold text-gray-400 uppercase tracking-tighter">Đợi báo giá</p>
              </div>
           </div>
           <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                 <CheckCircle2 size={22} />
              </div>
              <div>
                 <p className="text-[24px] font-black line-height-1">12</p>
                 <p className="text-[12px] font-bold text-gray-400 uppercase tracking-tighter">Đã chuyển đơn</p>
              </div>
           </div>
        </div>

        {/* Requirements List */}
        <div className="space-y-4">
          {filtered.map((req) => {
            const ss = getStatusColor(req.status);
            return (
              <div 
                key={req.id}
                className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition group"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <span className="text-[14px] font-black text-gray-800">{req.code}</span>
                         <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase" style={{ backgroundColor: ss.bg, color: ss.text, border: `1px solid ${ss.border}` }}>
                           {req.status}
                         </span>
                      </div>
                      <span className="text-[12px] text-gray-400 font-medium flex items-center gap-1">
                        <Clock size={12} /> {req.date}
                      </span>
                    </div>

                    <div className="flex gap-4">
                       <div className="p-4 rounded-xl bg-gray-50 border border-dashed border-gray-200 flex-1">
                          <p className="text-[14px] font-semibold text-gray-700 leading-relaxed">{req.content}</p>
                          <div className="mt-3 flex flex-wrap gap-4 pt-3 border-t border-gray-200 border-dotted text-[12px]">
                             <span className="flex items-center gap-1.5 font-bold text-gray-500">
                                <Layers size={13} /> Vật liệu: <span className="text-gray-800">{req.material}</span>
                             </span>
                             {req.price && (
                               <span className="flex items-center gap-1.5 font-bold text-gray-500">
                                  <Calculator size={13} /> Dự kiến: <span className="text-orange-600 font-black">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(req.price)}</span>
                               </span>
                             )}
                          </div>
                       </div>
                       {req.sampleImage && (
                          <div className="w-24 h-24 rounded-xl overflow-hidden border border-gray-100 shadow-sm shrink-0">
                             <img src={req.sampleImage} alt="sample" className="w-full h-full object-cover" />
                             <div className="absolute top-2 right-2 p-1 bg-white/80 rounded-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera size={12} className="text-gray-600" />
                             </div>
                          </div>
                       )}
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-[12px]">
                          {req.customer.charAt(0)}
                        </div>
                        <div>
                          <p className="text-[12px] font-bold text-gray-800">{req.customer}</p>
                          <p className="text-[11px] text-gray-400">{req.phone}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="lg:w-64 shrink-0 flex flex-col justify-center gap-2 lg:border-l lg:pl-6 border-gray-100">
                    {req.status === "Yêu cầu mới" && (
                       <div className="space-y-2">
                          <button 
                            onClick={() => handleAction("quote", req.id)}
                            className="w-full h-10 rounded-xl bg-indigo-600 text-white text-[13px] font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
                          >
                            <Calculator size={14} /> Gửi báo giá
                          </button>
                          <button 
                            onClick={() => handleAction("cancel", req.id)}
                            className="w-full h-10 rounded-xl border border-gray-100 text-gray-400 text-[13px] font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition"
                          >
                            Hủy yêu cầu
                          </button>
                       </div>
                    )}
                    {req.status === "Đã báo giá" && (
                       <button 
                         onClick={() => handleAction("create_order", req.id)}
                         className="w-full h-10 rounded-xl bg-emerald-600 text-white text-[13px] font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition shadow-lg shadow-emerald-100">
                         <CheckCircle2 size={14} /> Tạo đơn hàng
                       </button>
                    )}
                    {req.status === "Đã tạo đơn" && (
                       <div className="text-center py-5 px-3 rounded-xl bg-gray-50 border border-gray-100 mb-1">
                          <p className="text-[12px] font-bold text-gray-400 uppercase tracking-tighter flex items-center justify-center gap-1.5">
                            <CheckCircle2 size={14} className="text-emerald-500" /> Đã chuyển thành đơn hàng
                          </p>
                       </div>
                    )}
                    
                    <button 
                       onClick={() => setSelectedReqId(req.id)}
                       className="w-full h-10 rounded-xl border border-gray-200 text-gray-600 text-[13px] font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition"
                    >
                       Xem chi tiết <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
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
