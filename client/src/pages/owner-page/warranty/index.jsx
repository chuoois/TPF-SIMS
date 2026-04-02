import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ShieldCheck,
  Search,
  Clock,
  Eye,
  AlertCircle,
  CheckCircle2,
  Wrench,
  X,
  BadgeDollarSign,
  Hammer,
  History,
  ShieldAlert,
  HardHat,
  CheckCircle,
  Plus,
  ClipboardList,
  Calendar,
  Truck,
  FileText,
  Activity,
  TrendingDown,
  Info,
  ChevronDown,
  Ruler,
  Paintbrush,
  Printer,
  RefreshCw
} from "lucide-react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import DataTable from "@/components/control/DataTable";
import toast from "react-hot-toast";
import WarrantyReceipt from "@/pages/owner-page/warranty/WarrantyReceipt";

// ===================== ERP 3.0: 5-STAGE GOLDEN FLOW & CONFIG =====================
const STAGE_CONFIG = {
  "Tiếp nhận": { label: "1. Mới tiếp nhận", bg: "#f8fafc", text: "#475569", border: "#e2e8f0", icon: AlertCircle },
  "Đang kiểm tra": { label: "2. Đang kiểm tra", bg: "#fffbeb", text: "#b45309", border: "#fef3c7", icon: Search },
  "Đang xử lý": { label: "3. Đang xử lý", bg: "#eff6ff", text: "#1e40af", border: "#dbeafe", icon: Hammer },
  "Hoàn thành": { label: "4. Hoàn tất", bg: "#f0fdf4", text: "#166534", border: "#dcfce7", icon: CheckCircle },
  "Từ chối": { label: "5. Từ chối", bg: "#fef2f2", text: "#991b1b", border: "#fecaca", icon: X },
};

// ===================== ENRICHED MOCK DATA (P&L READY) =====================
const MOCK_ASSETS = [
  { 
    id: "A1-1", orderId: "ORD-991", productId: "PRO-101", customerName: "Nguyễn Văn Hùng", phone: "0912345678", 
    productName: "Sập thờ Mai Điểu chân 24", material: "Gỗ Gụ Lào", endDate: "2027-03-20", 
    dimensions: "2170 x 1070 x 1270 mm", paintType: "Sơn PU bóng mờ 70%", deliveryDate: "2024-03-20",
    img: "https://images.unsplash.com/photo-1620608208153-90928221805b?q=80&w=300" 
  },
  { 
    id: "A1-2", orderId: "ORD-991", productId: "PRO-102", customerName: "Nguyễn Văn Hùng", phone: "0912345678", 
    productName: "Bàn cơm gỗ Gụ", material: "Gỗ Gụ", endDate: "2024-04-10", 
    dimensions: "1070 x 610 x 470 mm", paintType: "Sơn PU bóng mờ 70%", deliveryDate: "2024-03-20",
    img: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=300" 
  },
  { 
    id: "A1-3", orderId: "ORD-991", productId: "PRO-103", customerName: "Nguyễn Văn Hùng", phone: "0912345678", 
    productName: "Đôi câu đối Mai Điểu", material: "Gỗ Gụ", endDate: "2023-12-15", 
    dimensions: "1970 x 280 x 40 mm", paintType: "Dát vàng Đài Loan", deliveryDate: "2023-12-15",
    img: "https://images.unsplash.com/photo-1594841763048-6609115fa01d?q=80&w=300" 
  },
  { 
    id: "A2-1", orderId: "ORD-882", productId: "PRO-201", customerName: "Thanh Bình", phone: "0988776655", 
    productName: "Bộ bàn ăn 10 ghế", material: "Gỗ Gõ Đỏ", endDate: "2027-05-10", 
    dimensions: "2400 x 1100 x 780 mm", paintType: "Sơn Inchem Cao Cấp", deliveryDate: "2024-05-10",
    img: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=300" 
  },
  { 
    id: "A2-2", orderId: "ORD-882", productId: "PRO-202", customerName: "Thanh Bình", phone: "0988776655", 
    productName: "Tủ rượu trang trí", material: "Gỗ Gõ Đỏ", endDate: "2024-01-05", 
    dimensions: "1200 x 450 x 2200 mm", paintType: "Sơn Inchem Cao Cấp", deliveryDate: "2023-01-05",
    img: "https://images.unsplash.com/photo-1620608208153-90928221805b?q=80&w=300" 
  },
  { 
    id: "A2-3", orderId: "ORD-882", productId: "PRO-203", customerName: "Thanh Bình", phone: "0988776655", 
    productName: "Kệ tivi gỗ Gõ", material: "Gỗ Gõ Đỏ", endDate: "2025-12-25", 
    dimensions: "2200 x 450 x 600 mm", paintType: "Sơn Inchem Cao Cấp", deliveryDate: "2023-12-25",
    img: "https://images.unsplash.com/photo-1594841763048-6609115fa01d?q=80&w=300" 
  },
  { 
    id: "A3-1", orderId: "ORD-773", productId: "PRO-301", customerName: "Lê Văn Tám", phone: "0933445566", 
    productName: "Sofa gỗ Sồi Nga", material: "Gỗ Sồi", endDate: "2026-10-15", 
    dimensions: "3200 x 1800 mm (L-shape)", paintType: "Sơn Lau Màu Óc Chó", deliveryDate: "2024-10-15",
    img: "https://images.unsplash.com/photo-1594841763048-6609115fa01d?q=80&w=300" 
  },
  { 
    id: "A3-2", orderId: "ORD-773", productId: "PRO-302", customerName: "Lê Văn Tám", phone: "0933445566", 
    productName: "Bàn trà kim cương", material: "Gỗ Sồi/Kính", endDate: "2024-02-28", 
    dimensions: "Dia 800 x 420 mm", paintType: "Sơn Lau Màu Óc Chó", deliveryDate: "2023-02-28",
    img: "https://images.unsplash.com/photo-1620608208153-90928221805b?q=80&w=300" 
  },
  { 
    id: "A3-3", orderId: "ORD-773", productId: "PRO-303", customerName: "Lê Văn Tám", phone: "0933445566", 
    productName: "Tủ giày 3 cánh", material: "Gỗ Sồi", endDate: "2023-01-01", 
    dimensions: "1200 x 350 x 1100 mm", paintType: "Sơn Lau Màu Óc Chó", deliveryDate: "2022-01-01",
    img: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=300" 
  }
];

const INITIAL_REQUESTS = [
  { 
    id: "RQ-001", orderId: "ORD-991", customerName: "Nguyễn Văn Hùng", phone: "0912345678", 
    productName: "Sập thờ Mai Điểu", status: "Tiếp nhận", defect: "Nứt vách tâm do độ ẩm",
    updatedAt: new Date().toISOString(),
    history: [{ date: "2024-04-02 09:00", action: "Tiếp nhận phiếu mới", user: "Hệ thống" }] 
  },
  { 
    id: "RQ-008", orderId: "ORD-112", customerName: "Bùi Thị Minh", phone: "0905112233", 
    productName: "Kệ tivi gỗ Gụ", status: "Tiếp nhận", defect: "Bản lề bị lệch, đóng không khít",
    updatedAt: new Date().toISOString(),
    history: [{ date: "2024-04-02 11:30", action: "Tiếp nhận qua Hotline", user: "Lan CSKH" }] 
  },
  { 
    id: "RQ-002", orderId: "ORD-882", customerName: "Thanh Bình", phone: "0988776655", 
    productName: "Bộ bàn ăn 10 ghế", status: "Đang kiểm tra", assignedTech: "Thợ Minh", 
    updatedAt: new Date().toISOString(),
    history: [
      { date: "2024-04-01 10:00", action: "Tiếp nhận phiếu", user: "Lan CSKH" },
      { date: "2024-04-01 15:00", action: "Gán thợ Minh đi check", user: "Chủ xưởng" }
    ] 
  },
  { 
    id: "RQ-009", orderId: "ORD-223", customerName: "Lê Minh", phone: "0977889900", 
    productName: "Giường ngủ Louis", status: "Đang kiểm tra", assignedTech: "Thợ Cường", 
    updatedAt: new Date().toISOString(),
    history: [{ date: "2024-04-02 13:00", action: "Gán thợ Cường check vết nứt", user: "Chủ xưởng" }] 
  },
  { 
    id: "RQ-003", orderId: "ORD-991", customerName: "Nguyễn Văn Hùng", phone: "0912345678", 
    productName: "Bàn cơm gỗ Gụ", status: "Chờ phương án", assignedTech: "Thợ Cường",
    techNote: "Bị xước mặt do kéo đồ vật sắc nhọn, cần đánh giấy nháp và sơn lại PU phần mặt.",
    suggestion: "Sửa tại chỗ",
    updatedAt: new Date().toISOString(),
    history: [
      { date: "2024-03-30 08:00", action: "Tạo phiếu", user: "Chủ xưởng" },
      { date: "2024-03-31 09:00", action: "Thợ Cường nộp báo cáo check", user: "Thợ Cường" }
    ] 
  },
  { 
    id: "RQ-010", orderId: "ORD-334", customerName: "Ngô Quốc", phone: "0966554433", 
    productName: "Tủ rượu âm tường", status: "Chờ phương án", assignedTech: "Thợ Minh",
    techNote: "Kính bị nứt góc, cần đặt kính mới 8ly cường lực thay thế.",
    suggestion: "Thay linh kiện",
    updatedAt: new Date().toISOString(),
    history: [{ date: "2024-04-02 10:00", action: "Thợ Minh báo cáo cần thay kính", user: "Thợ Minh" }] 
  },
  { 
    id: "RQ-004", orderId: "ORD-773", customerName: "Lê Văn Tám", phone: "0933445566", 
    productName: "Tủ giày 3 cánh", status: "Chờ khách xác nhận", assignedTech: "Thợ Minh",
    isWarranty: false, type: "service", quote: 250000,
    updatedAt: new Date().toISOString(),
    history: [
      { date: "2024-04-01 14:00", action: "Thợ báo cáo lỗi bản lề", user: "Thợ Minh" },
      { date: "2024-04-02 10:30", action: "Chủ xưởng báo giá 250k - Chờ khách chốt", user: "Chủ xưởng" }
    ] 
  },
  { 
    id: "RQ-011", orderId: "ORD-445", customerName: "Đặng Thu", phone: "0911223344", 
    productName: "Bộ trường kỷ gỗ Lim", status: "Chờ khách xác nhận", assignedTech: "Thợ Cường",
    isWarranty: false, type: "service", quote: 1500000,
    updatedAt: new Date().toISOString(),
    history: [{ date: "2024-04-02 14:00", action: "Chốt báo giá sơn lại 1.5tr", user: "Chủ xưởng" }] 
  },
  { 
    id: "RQ-005", orderId: "ORD-882", customerName: "Thanh Bình", phone: "0988776655", 
    productName: "Tủ rượu trang trí", status: "Đang xử lý", assignedTech: "Thợ Cường",
    updatedAt: new Date().toISOString(),
    history: [
      { date: "2024-04-01 09:00", action: "Khách đã đồng ý phương án", user: "Hệ thống" },
      { date: "2024-04-01 11:00", action: "Bắt đầu tháo dỡ xử lý xưởng", user: "Thợ Cường" }
    ] 
  },
  { 
    id: "RQ-012", orderId: "ORD-556", customerName: "Phạm Hùng", phone: "0922334455", 
    productName: "Bàn phấn gỗ Mun", status: "Đang xử lý", assignedTech: "Thợ Minh",
    updatedAt: new Date().toISOString(),
    history: [{ date: "2024-04-02 15:00", action: "Đang quật lại mộc tại xưởng", user: "Thợ Minh" }] 
  },
  { 
    id: "RQ-007", orderId: "ORD-554", customerName: "Hoàng Anh", phone: "0944112233", 
    productName: "Kệ tivi gỗ Hương", status: "Từ chối", 
    updatedAt: new Date().toISOString(),
    history: [{ date: "2024-03-20 14:00", action: "Khách báo giá cao, không sửa", user: "Hệ thống" }] 
  },
  { 
    id: "RQ-013", orderId: "ORD-667", customerName: "Vũ Hoa", phone: "0955667788", 
    productName: "Tủ thờ gỗ Mít", status: "Từ chối", 
    updatedAt: new Date().toISOString(),
    history: [{ date: "2024-03-22 09:00", action: "Sản phẩm hỏng do thiên tai, từ chối bảo hành", user: "Chủ xưởng" }] 
  },
  { 
    id: "RQ-006", orderId: "ORD-991", customerName: "Nguyễn Văn Hùng", phone: "0912345678", 
    productName: "Đôi câu đối Mai Điểu", status: "Hoàn thành", totalCost: 1200000,
    updatedAt: new Date().toISOString(),
    history: [{ date: "2024-03-25 16:00", action: "Nghiệm thu hoàn tất", user: "Chủ xưởng" }] 
  },
  { 
    id: "RQ-014", orderId: "ORD-778", customerName: "Trần Thế", phone: "0966112233", 
    productName: "Bàn trà kim cương", status: "Hoàn thành", totalCost: 500000,
    updatedAt: new Date().toISOString(),
    history: [{ date: "2024-04-01 17:00", action: "Đã thay mặt kính xong", user: "Thợ Cường" }] 
  }
];

// ===================== HELPER COMPONENTS =====================

const VisualTimeline = ({ history }) => (
  <div className="mt-8 pt-8 border-t border-slate-100">
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-1.5"><Activity size={12}/> Truy vết nghiệp vụ</p>
    <div className="relative pl-6 space-y-8 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
       {history?.map((h, i) => (
         <div key={i} className="relative">
            <div className={`absolute -left-[30px] top-1.5 w-4 h-4 rounded-full border-4 border-white ${i === 0 ? 'bg-green-600 ring-4 ring-green-50 animate-pulse' : 'bg-slate-200'}`} />
            <div className="space-y-1">
               <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black text-slate-900 underline underline-offset-4 decoration-slate-200">{h.user}</span>
                  <span className="text-[10px] font-bold text-slate-400 font-mono">{h.date}</span>
               </div>
               <p className="text-[12px] text-slate-500 font-medium">{h.action}</p>
            </div>
         </div>
       ))}
    </div>
  </div>
);

const QuickIntakeModal = ({ isOpen, onClose, asset, onAdd }) => {
  const [data, setData] = useState({ defect: "", urgency: "Thường" });
  if (!isOpen || !asset) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-10 space-y-8 border-4 border-slate-50 animate-in zoom-in-95">
         <div className="flex justify-between items-center"><h3 className="text-sm font-black uppercase text-slate-800 tracking-tight">Tiếp nhận bảo hành</h3><button onClick={onClose} className="p-2 bg-slate-50 rounded-full"><X size={18} className="text-slate-400"/></button></div>
         <div className="p-5 bg-slate-50 rounded-2xl ring-1 ring-slate-100 space-y-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sản phẩm đối soát</p>
            <div className="flex items-center gap-4">
               <img src={asset.img} className="w-12 h-12 rounded-xl object-cover shadow-md" />
               <div>
                  <p className="text-[13px] font-black text-slate-900 leading-tight">{asset.productName}</p>
                  <p className={`text-[10px] font-black mt-1 uppercase ${new Date(asset.endDate) < new Date() ? 'text-red-500' : 'text-green-600'}`}>
                    {new Date(asset.endDate) < new Date() ? 'Hết hạn bảo hành' : 'Còn bảo hành'}
                  </p>
               </div>
            </div>
         </div>
         <div className="space-y-4">
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mô tả tình trạng lỗi</label>
               <textarea autoFocus value={data.defect} onChange={e => setData({...data, defect: e.target.value})} className="w-full p-5 rounded-2xl bg-slate-50 font-bold text-sm outline-none border-2 border-transparent focus:border-green-600 h-28 resize-none shadow-inner" placeholder="VD: Gỗ bị nứt dọc vách tâm..." />
            </div>
         </div>
         <button onClick={() => { 
            const isExpired = new Date(asset.endDate) < new Date();
            onAdd({ ...asset, ...data, type: isExpired ? "service" : "warranty" }); 
            setData({defect:"", urgency:"Thường"}); 
            onClose(); 
            toast.success("Đã tiếp nhận yêu cầu!"); 
         }} className={`w-full h-14 ${new Date(asset.endDate) < new Date() ? 'bg-orange-600' : 'bg-slate-950'} text-white rounded-2xl text-[11px] font-black uppercase shadow-xl hover:brightness-110 transition-all`}>
            {new Date(asset.endDate) < new Date() ? 'Lập phiếu Sửa chữa Dịch vụ' : 'Ghi nhận phiếu Bảo hành'}
         </button>
      </div>
    </div>
  );
};

const ProductCard = ({ asset, isExpanded, onToggle, onAdd, requests }) => {
   const pastRepairs = useMemo(() => requests.filter(r => r.orderId === asset.orderId && r.productName === asset.productName), [asset, requests]);
   const expired = new Date(asset.endDate) < new Date();

   return (
     <div className={`bg-white rounded-[2.5rem] border-4 ${isExpanded ? 'border-slate-900 ring-4 ring-slate-100 shadow-2xl' : 'border-slate-50 shadow-xl'} overflow-hidden group/card flex flex-col ring-1 ring-slate-100 hover:ring-green-500/20 transition-all`}>
         <div className="relative h-44 overflow-hidden bg-slate-100">
            <img src={asset.img} className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-700" />
            <div className="absolute top-4 right-4 flex flex-col gap-2">
               <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg ${expired ? 'bg-red-500 text-white' : 'bg-green-600 text-white'}`}>
                  {expired ? 'Hết hạn' : 'Đang bảo hành'}
               </span>
            </div>
            <button onClick={onToggle} className="absolute bottom-4 right-4 p-3 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white text-slate-900 hover:bg-white transition-all transform active:scale-95">
               {isExpanded ? <ChevronDown size={20} /> : <Info size={20} />}
            </button>
         </div>
         
         <div className="p-6 space-y-5 flex-1 flex flex-col">
            <div>
               <h4 className="text-[15px] font-black text-slate-900 leading-tight mb-1">{asset.productName}</h4>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{asset.material}</p>
            </div>

            {isExpanded ? (
               <div className="space-y-6 pt-4 border-t border-slate-50 animate-in fade-in slide-in-from-top-2">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-300 uppercase flex items-center gap-1"><Ruler size={10}/> Kích thước</p>
                        <p className="text-[11px] font-bold text-slate-700">{asset.dimensions}</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-300 uppercase flex items-center gap-1"><Paintbrush size={10}/> Hoàn thiện</p>
                        <p className="text-[11px] font-bold text-slate-700">{asset.paintType || 'Sơn PU'}</p>
                     </div>
                  </div>

                  <div className="space-y-3">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Lịch sử sửa chữa chi tiết</p>
                     <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 scrollbar-thin">
                        {pastRepairs.length === 0 ? (
                           <p className="text-[10px] font-bold text-slate-300 italic py-4 text-center bg-slate-50 rounded-xl">Chưa có lịch sử sửa chữa</p>
                        ) : (
                           pastRepairs.map((r, i) => (
                              <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                 <div className="flex justify-between items-start mb-1">
                                    <p className="text-[10px] font-black text-slate-900">{r.id} • {new Date(r.updatedAt).toLocaleDateString('vi-VN')}</p>
                                    <p className="text-[9px] font-black text-green-600 uppercase">{r.status}</p>
                                 </div>
                                 <p className="text-[11px] font-bold text-slate-600 mb-1">{r.defect}</p>
                                 <p className="text-[9px] text-slate-400 italic">Thợ: {r.assignedTech || "N/A"} - {r.techNote || "Không ghi chú"}</p>
                              </div>
                           ))
                        )}
                     </div>
                  </div>
               </div>
            ) : (
               <div className="pt-4 border-t border-slate-50 flex justify-between items-center text-[10px] font-bold text-slate-300 italic uppercase">
                  <span>Lịch sử:</span>
                  <span className={pastRepairs.length > 0 ? 'text-orange-500' : ''}>{pastRepairs.length} lần xử lý</span>
               </div>
            )}

            <div className="pt-2 mt-auto flex gap-2">
               <button 
                 onClick={() => onAdd(asset)} 
                 className={`flex-[3] py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl hover:translate-y-[-2px] active:scale-95 flex items-center justify-center gap-2 ${expired ? 'bg-orange-500 text-white shadow-orange-200/50' : 'bg-slate-900 text-white shadow-slate-200'}`}
               >
                  {expired ? <Wrench size={14}/> : <Plus size={14}/>}
                  {expired ? 'Sửa chữa có phí' : 'Tiếp nhận bảo hành'}
               </button>
            </div>
         </div>
     </div>
   );
};

const PlanModal = ({ isOpen, onClose, claim, onUpdate }) => {
   const [data, setData] = useState({ reason: "Lỗi NSX", repairType: "onsite", quote: 0, internalNotes: "", forceFree: false });
   const isInWarrantyByDate = useMemo(() => claim && new Date(claim.endDate) > new Date(), [claim]);
   const isFree = data.forceFree ?? (isInWarrantyByDate && data.reason === "Lỗi NSX");

  useEffect(() => { if(claim) setData({...data, repairType: claim.suggestion || "onsite"}); }, [claim]);
  if (!isOpen || !claim) return null;

   return (
    <div onClick={onClose} className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
      <div onClick={e => e.stopPropagation()} className="relative bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-10 animate-in zoom-in-95 overflow-y-auto max-h-[90vh] border-8 border-slate-50 space-y-8">
         <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors"><X size={18} className="text-slate-400"/></button>
         
         <div className="space-y-2">
            <h3 className="text-sm font-black uppercase tracking-tight text-slate-800 flex items-center gap-2"><AlertCircle size={24} className="text-orange-500" /> Vấn đề phát sinh & Báo phí</h3>
            <p className="text-[10px] font-bold text-slate-400 italic font-mono uppercase tracking-widest leading-relaxed">Sản phẩm: {claim.productName}</p>
         </div>

         <div className="space-y-5">
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nội dung lỗi chính (Cần lưu vết)</label>
               <textarea value={data.techNote} onChange={e => setData({...data, techNote: e.target.value})} className="w-full p-5 rounded-2xl bg-slate-50 h-24 border-2 border-slate-200 font-bold text-xs" placeholder="VD: Nứt gỗ vách tâm, cần mang về xưởng xử lại mộc..." />
            </div>

            <div className="space-y-3">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phương án xử lý (Kết quả Call)</p>
               
               <div className="grid grid-cols-1 gap-3">
                  <button 
                     onClick={() => onUpdate(claim.id, { ...data, status: "Đang xử lý", isWarranty: true, quote: 0 }, "Lỗi lớn - Fix Bảo hành (0đ)")} 
                     className="w-full py-5 bg-green-50 hover:bg-green-100 text-green-700 rounded-2xl border-2 border-green-200 flex flex-col items-center gap-1 transition-all"
                  >
                     <ShieldCheck size={24} />
                     <span className="text-[11px] font-black uppercase">Lỗi lớn (BH Miễn phí)</span>
                  </button>

                  <div className="p-5 bg-orange-50 rounded-2xl border-2 border-orange-200 space-y-4">
                     <div className="flex items-center gap-2 text-orange-700">
                        <BadgeDollarSign size={20} />
                        <span className="text-[11px] font-black uppercase font-mono tracking-tighter">Phát sinh Chi phí (Lấy tiền)</span>
                     </div>
                     <div className="relative">
                        <input type="number" value={data.quote} onChange={e => setData({...data, quote: e.target.value})} className="w-full h-12 px-5 bg-white rounded-xl border-2 border-orange-200 font-black text-sm text-orange-900 outline-none" placeholder="Nhập số tiền..." />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-400 font-black text-[10px]">VNĐ</span>
                     </div>
                     <button 
                        disabled={!data.quote || data.quote <= 0}
                        onClick={() => onUpdate(claim.id, { ...data, status: "Đang xử lý", isWarranty: false }, `Chốt Dịch vụ: ${data.quote}đ`)} 
                        className="w-full py-4 bg-orange-600 text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-orange-200 font-mono disabled:opacity-50 disabled:grayscale transition-all"
                     >
                        Xác nhận & Chuyển Đang sửa
                     </button>
                  </div>

                  <button 
                     onClick={() => onUpdate(claim.id, { ...data, status: "Từ chối" }, "Khách từ chối sửa")} 
                     className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl border-2 border-slate-200 flex items-center justify-center gap-2 transition-all"
                  >
                     <X size={16} />
                     <span className="text-[10px] font-black uppercase">Khách từ chối (Đóng phiếu)</span>
                  </button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

const TechReportModal = ({ isOpen, onClose, claim, onUpdate }) => {
  const [data, setData] = useState({ techNote: "", suggestion: "onsite" });
  if (!isOpen || !claim) return null;
   return (
    <div onClick={onClose} className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
      <div onClick={e => e.stopPropagation()} className="relative bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-10 space-y-8 border-8 border-slate-50 animate-in zoom-in-95">
         <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors"><X size={18} className="text-slate-400"/></button>
         <h3 className="text-sm font-black uppercase tracking-tight text-slate-800 flex items-center gap-2"><Truck size={20} className="text-blue-500" /> Nhập kết quả thợ (Ghi nhận hộ)</h3>
         <div className="space-y-6">
            <textarea value={data.techNote} onChange={e => setData({...data, techNote: e.target.value})} className="w-full p-5 rounded-2xl bg-slate-50 h-28 border-2 border-slate-200 font-bold text-xs" placeholder="Ghi chú kỹ thuật thợ..." />
         </div>
         <VisualTimeline history={claim.history} />
         <button onClick={() => onUpdate(claim.id, { ...data, status: "Chờ phương án" }, "Thợ nộp báo cáo")} className="w-full h-14 bg-blue-600 text-white rounded-2xl text-[11px] font-black uppercase shadow-2xl">Gửi chủ</button>
      </div>
    </div>
  );
};

const ScheduleModal = ({ isOpen, onClose, claim, onUpdate }) => {
  const [data, setData] = useState({ date: "", tech: "" });
  if (!isOpen || !claim) return null;
   return (
    <div onClick={onClose} className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
      <div onClick={e => e.stopPropagation()} className="relative bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-10 space-y-8 border-8 border-slate-50 animate-in zoom-in-95">
         <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors"><X size={18} className="text-slate-400"/></button>
         <h3 className="text-sm font-black uppercase tracking-tight text-slate-800 flex items-center gap-2"><Calendar size={20} className="text-orange-500" /> Gán lịch thợ</h3>
         <select value={data.tech} onChange={e => setData({...data, tech: e.target.value})} className="w-full h-12 px-5 rounded-xl bg-slate-50 border-2 border-slate-200 font-bold text-sm">
            <option value="">-- Chọn thợ --</option>
            <option value="Thợ Minh">Thợ Minh</option>
            <option value="Thợ Cường">Thợ Cường</option>
         </select>
         <VisualTimeline history={claim.history} />
         <button onClick={() => onUpdate(claim.id, { assignedTech: data.tech, status: "Đang kiểm tra" }, `Gán thợ kiểm tra: ${data.tech}`)} className="w-full h-14 bg-slate-950 text-white rounded-2xl text-[11px] font-black uppercase shadow-2xl">Xác nhận & Giao việc</button>
      </div>
    </div>
  );
};

const CompletionModal = ({ isOpen, onClose, claim, onUpdate }) => {
  const [costs, setCosts] = useState({ labor: 0, material: 0, transport: 0 });
  if (!isOpen || !claim) return null;
  
  const total = Number(costs.labor) + Number(costs.material) + Number(costs.transport);

   return (
    <div onClick={onClose} className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
      <div onClick={e => e.stopPropagation()} className="relative bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-10 space-y-8 border-8 border-slate-50 overflow-y-auto max-h-[90vh] animate-in zoom-in-95">
         <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors"><X size={18} className="text-slate-400"/></button>
         <h3 className="text-sm font-black uppercase tracking-tight text-slate-800 flex items-center gap-2"><CheckCircle2 size={24} className="text-green-600" /> Nghiệm thu & Chốt phí</h3>
         
         <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
               <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Công thợ (VNĐ)</label>
                  <input type="number" value={costs.labor} onChange={e => setCosts({...costs, labor: e.target.value})} className="w-full h-11 px-4 bg-slate-50 rounded-xl border border-slate-100 font-bold text-sm" />
               </div>
               <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Vật tư (VNĐ)</label>
                  <input type="number" value={costs.material} onChange={e => setCosts({...costs, material: e.target.value})} className="w-full h-11 px-4 bg-slate-50 rounded-xl border border-slate-100 font-bold text-sm" />
               </div>
               <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Vận chuyển (VNĐ)</label>
                  <input type="number" value={costs.transport} onChange={e => setCosts({...costs, transport: e.target.value})} className="w-full h-11 px-4 bg-slate-50 rounded-xl border border-slate-100 font-bold text-sm" />
               </div>
            </div>
         </div>

         <div className="p-5 bg-slate-950 rounded-2xl flex justify-between items-center text-white shadow-xl ring-4 ring-slate-100">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tổng chi phí:</span>
            <span className="text-[18px] font-black text-green-400">{total.toLocaleString()} đ</span>
         </div>

         <VisualTimeline history={claim.history} />
         <button onClick={() => onUpdate(claim.id, { 
            costs, 
            totalCost: total,
            customerPay: claim.isWarranty ? 0 : total,
            companyLoss: claim.isWarranty ? total : 0,
            status: "Hoàn thành" 
         }, "Đóng phiếu & Hạch toán tài chính")} className="w-full h-14 bg-green-600 text-white rounded-2xl text-[11px] font-black uppercase shadow-2xl hover:brightness-110 active:scale-95 transition-all">Hoàn thành & Đóng</button>
      </div>
    </div>
  );
};

// ===================== MAIN COMPONENT =====================

export default function WarrantyManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "Tra cứu";
  const statusFilter = searchParams.get("status") || "Tất cả";

  const [requests, setRequests] = useState(() => JSON.parse(localStorage.getItem("tpf_erp_warranty_requests")) || INITIAL_REQUESTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [selected, setSelected] = useState(null);
  const [modals, setModals] = useState({ intake: false, schedule: false, report: false, plan: false, complete: false, preview: false });
  const [expandedOrders, setExpandedOrders] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  useEffect(() => localStorage.setItem("tpf_erp_warranty_requests", JSON.stringify(requests)), [requests]);
  useEffect(() => setCurrentPage(1), [activeTab, statusFilter, searchTerm]);

  const groupedAssets = useMemo(() => {
    const groups = {};
    MOCK_ASSETS.forEach(item => {
      if (!groups[item.orderId]) {
        groups[item.orderId] = { orderId: item.orderId, customerName: item.customerName, phone: item.phone, products: [] };
      }
      groups[item.orderId].products.push(item);
    });
    let result = Object.values(groups);
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(g => g.orderId.toLowerCase().includes(q) || g.customerName.toLowerCase().includes(q) || g.phone.toLowerCase().includes(q));
    }
    return result;
  }, [searchTerm]);

  const { filtered, statusCounts } = useMemo(() => {
    let base = requests;
    if (statusFilter !== "Tất cả") base = requests.filter(r => r.status === statusFilter);
    if (searchTerm && activeTab !== "Danh sách bảo hành") {
      const q = searchTerm.toLowerCase();
      base = base.filter(r => (r.customerName || "").toLowerCase().includes(q) || (r.productName || "").toLowerCase().includes(q) || (r.id || "").toLowerCase().includes(q));
    }
    const counts = { all: requests.length };
    Object.keys(STAGE_CONFIG).forEach(s => {
      counts[s] = requests.filter(r => r.status === s).length;
    });
    return { filtered: base, statusCounts: counts };
  }, [activeTab, statusFilter, requests, searchTerm]);

  const paginatedData = useMemo(() => filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage), [filtered, currentPage, itemsPerPage]);

  const handleUpdate = (id, payload, actionText) => {
    setRequests(prev => prev.map(r => {
       if (r.id !== id) return r;
       const now = new Date().toLocaleString('vi-VN').replace(',', '');
       return { ...r, ...payload, updatedAt: new Date().toISOString(), history: [{ date: now, action: actionText || "Cập nhật", user: "Chủ xưởng" }, ...(r.history || [])] };
    }));
    setModals({ intake: false, schedule: false, report: false, plan: false, complete: false, preview: false });
    toast.success("ERP: Thành công!");
  };

  const toggleOrder = (id) => setExpandedOrders(prev => prev.includes(id) ? prev.filter(oid => oid !== id) : [...prev, id]);

  const requestColumns = [
    { header: "Mã phiếu", render: r => <div className="space-y-1"><p className="text-[13px] font-black font-mono">#{r.id}</p><button onClick={() => { setSelected(r); setModals(m => ({ ...m, preview: true })); }} className="text-[9px] font-black uppercase text-blue-600 flex items-center gap-1"><FileText size={10}/> Xuất phiếu</button></div> },
    { header: "Khách hàng", render: r => <div><p className="text-[13px] font-bold">{r.customerName}</p><p className="text-[10px] text-slate-400">#{r.orderId}</p></div> },
    { header: "Sản phẩm", render: r => <p className="text-[13px] font-medium">{r.productName}</p> },
    { header: "Trạng thái", render: r => { const sc = STAGE_CONFIG[r.status] || STAGE_CONFIG["Hoàn thành"]; return <span className="px-3 py-1 text-[10px] font-black uppercase rounded-lg border" style={{ backgroundColor: sc.bg, color: sc.text, borderColor: sc.border }}>{r.status}</span>; } },
    { header: "Hành động", className: "text-right", render: r => {
          if (r.status === 'Tiếp nhận') return <button onClick={() => { setSelected(r); setModals(m => ({ ...m, schedule: true })); }} className="px-5 py-2.5 bg-orange-500 text-white text-[11px] font-black uppercase rounded-2xl shadow-lg shadow-orange-100 hover:scale-105 active:scale-95 transition-all">Giao việc cho thợ</button>;
          if (r.status === 'Đang kiểm tra') {
            return (
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => handleUpdate(r.id, { status: "Hoàn thành", isWarranty: true, techNote: "Đã xử lý tại chỗ (Sửa nhanh 0đ)" }, "Thợ đã xử lý xong tại chỗ")}
                  className="px-4 py-2 bg-green-600 text-white text-[10px] font-black rounded-xl hover:brightness-110 active:scale-95 transition-all"
                >
                  Xong luôn (0đ)
                </button>
                <button
                  onClick={() => { setSelected(r); setModals(m => ({ ...m, plan: true })); }}
                  className="px-4 py-2 bg-purple-600 text-white text-[10px] font-black rounded-xl hover:brightness-110 active:scale-95 transition-all"
                >
                  Phát sinh vấn đề
                </button>
              </div>
            );
          }
          if (r.status === 'Đang xử lý') return <button onClick={() => { setSelected(r); setModals(m => ({ ...m, complete: true })); }} className="px-5 py-2.5 bg-green-600 text-white text-[11px] font-black uppercase rounded-2xl shadow-lg shadow-green-100 hover:scale-105 active:scale-95 transition-all">Nghiệm thu xong</button>;
          return null;
       }
    }
  ];

  return (
    <>
      <PageHelmet title="Quản lý bảo hành - TPF SIMS" />
      <div className="flex flex-col h-[calc(100vh-64px)] -m-6 p-6 space-y-6 bg-[#f8fafc]">
        {/* Header */}
        <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-green-600" size={30} />
          <h1 className="text-[24px] font-black text-slate-800 uppercase tracking-tighter">Quản lý Bảo hành</h1>
        </div>
           <div className="flex items-center gap-3">
              <div className="flex p-1.5 bg-slate-200/50 rounded-2xl border border-slate-200">
                {["Danh sách bảo hành", "Phiếu yêu cầu"].map(tab => (<button key={tab} onClick={() => setSearchParams({ tab, status: "Tất cả" })} className={`px-6 py-2 rounded-xl text-[12px] font-black uppercase transition-all ${activeTab === tab ? "bg-white shadow-lg text-slate-900" : "text-slate-500 hover:text-slate-700"}`}>{tab}</button>))}
              </div>
           </div>
        </div>

        {/* Filters */}
        {activeTab === "Phiếu yêu cầu" && (
           <div className="flex gap-2 overflow-x-auto pb-2 shrink-0 px-1">
              <button onClick={() => setSearchParams({ tab: activeTab, status: "Tất cả" })} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase border transition-all whitespace-nowrap ${statusFilter === "Tất cả" ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'}`}>Tất cả ({statusCounts.all})</button>
              {Object.keys(STAGE_CONFIG).map(s => (
                <button key={s} onClick={() => setSearchParams({ tab: activeTab, status: s })} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase border transition-all whitespace-nowrap flex items-center gap-2 ${statusFilter === s ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'}`}>
                  {STAGE_CONFIG[s].label} ({statusCounts[s] || 0})
                </button>
              ))}
           </div>
        )}

        {/* Content */}
        <div className="flex-1 bg-white rounded-[2rem] shadow-xl overflow-hidden flex flex-col border-4 border-slate-50 relative">
           {activeTab === "Danh sách bảo hành" ? (
             <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-4 border-b bg-slate-50/50 flex items-center gap-4 shrink-0">
                   <div className="relative flex-1 max-w-sm">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="text" placeholder="Tìm tên khách, số điện thoại hoặc mã đơn..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full h-11 pl-10 pr-4 bg-white rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-green-600 transition-all shadow-inner" />
                   </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                   <table className="w-full text-left border-collapse">
                      <thead className="sticky top-0 z-20 bg-slate-50/90 backdrop-blur-sm border-b border-slate-100">
                         <tr>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-16">STT</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mã Đơn hàng</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Khách hàng</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sản phẩm</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Thao tác</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                         {groupedAssets.map((group, idx) => {
                            const isExpanded = expandedOrders.includes(group.orderId);
                            return (
                               <React.Fragment key={group.orderId}>
                                  <tr onClick={() => toggleOrder(group.orderId)} className={`group hover:bg-slate-50/50 cursor-pointer transition-colors ${isExpanded ? 'bg-slate-50/50' : ''}`}>
                                     <td className="px-6 py-5 text-[13px] font-black text-slate-300 font-mono">{(idx + 1).toString().padStart(2, '0')}</td>
                                     <td className="px-6 py-5 text-[14px] font-black text-slate-900 uppercase tracking-tight">#{group.orderId}</td>
                                     <td className="px-6 py-5">
                                        <p className="text-[13px] font-bold text-slate-800">{group.customerName}</p>
                                        <p className="text-[11px] text-slate-400 font-medium">{group.phone}</p>
                                     </td>
                                     <td className="px-6 py-5">
                                        <span className="px-2.5 py-1 bg-white border border-slate-100 rounded-lg text-[10px] font-black text-slate-500 uppercase flex items-center gap-2 w-fit shadow-sm">
                                           {group.products.length} Sản phẩm <ChevronDown size={14} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                                        </span>
                                     </td>
                                     <td className="px-6 py-5 text-right">
                                        <button className="text-[10px] font-black uppercase text-blue-600 hover:text-blue-800 transition-colors">Xem chi tiết đơn</button>
                                     </td>
                                  </tr>
                                  {isExpanded && (
                                     <tr className="animate-in fade-in slide-in-from-top-2 duration-300">
                                        <td colSpan="5" className="px-12 py-0">
                                           <div className="my-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                              {group.products.map((p) => (
                                                 <ProductCard 
                                                   key={p.id} 
                                                   asset={p} 
                                                   requests={requests}
                                                   isExpanded={expandedOrders.includes(p.id)} 
                                                   onToggle={() => setExpandedOrders(prev => prev.includes(p.id) ? prev.filter(id => id !== p.id) : [...prev, p.id])}
                                                   onAdd={(asset) => { setSelected(asset); setModals(m => ({ ...m, intake: true })); }}
                                                 />
                                              ))}
                                           </div>
                                        </td>
                                     </tr>
                                  )}
                               </React.Fragment>
                            );
                         })}
                         {groupedAssets.length === 0 && (
                            <tr><td colSpan="5" className="py-24 text-center text-slate-300 font-bold text-sm">Không tìm thấy đơn hàng nào khớp với từ khóa</td></tr>
                         )}
                      </tbody>
                   </table>
                </div>
             </div>
           ) : (
             <DataTable columns={requestColumns} data={paginatedData} />
           )}
        </div>

        {/* MODALS */}
        <QuickIntakeModal isOpen={modals.intake} onClose={() => setModals({...modals, intake: false})} asset={selected} onAdd={(d) => setRequests([{ id: "RQ-"+(requests.length+1).toString().padStart(3,'0'), ...d, status: "Tiếp nhận", updatedAt: new Date().toISOString(), history: [{ date: new Date().toLocaleString('vi-VN').replace(',',''), action: "Lập phiếu mới", user: "ERP" }] }, ...requests])} />
        <ScheduleModal isOpen={modals.schedule} onClose={() => setModals({...modals, schedule: false})} claim={selected} onUpdate={handleUpdate} />
        <TechReportModal isOpen={modals.report} onClose={() => setModals({...modals, report: false})} claim={selected} onUpdate={handleUpdate} />
        <PlanModal isOpen={modals.plan} onClose={() => setModals({...modals, plan: false})} claim={selected} onUpdate={handleUpdate} />
        <CompletionModal isOpen={modals.complete} onClose={() => setModals({...modals, complete: false})} claim={selected} onUpdate={handleUpdate} />

        {/* Receipt Preview Modal */}
        {modals.preview && selected && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-8 bg-slate-900/60 backdrop-blur-lg animate-in fade-in duration-300 overflow-y-auto">
             <div className="w-full max-w-4xl bg-slate-50 rounded-[3rem] shadow-3xl overflow-hidden flex flex-col ring-8 ring-white/10 my-auto">
                <div className="p-6 bg-white border-b flex justify-between items-center shrink-0">
                   <div className="flex items-center gap-3"><div className="w-10 h-10 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg"><FileText size={20}/></div><p className="text-sm font-black uppercase text-slate-900 tracking-tight">Chi tiết Phiếu ERP</p></div>
                   <div className="flex gap-2">
                      <button onClick={() => window.print()} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl active:scale-95 transition-all"><Printer size={16}/> In phiếu</button>
                      <button onClick={() => setModals({...modals, preview: false})} className="px-6 py-2.5 bg-white border-2 border-slate-100 text-slate-400 rounded-xl text-[11px] font-black uppercase tracking-widest hover:text-slate-900 transition-all">Đóng</button>
                   </div>
                </div>
                <div className="flex-1 overflow-y-auto p-12 bg-slate-200/50 custom-scrollbar">
                   <div className="shadow-2xl mb-8 transform -rotate-1 origin-top printable-content">
                      <WarrantyReceipt data={selected} />
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>
    </>
  );
}
