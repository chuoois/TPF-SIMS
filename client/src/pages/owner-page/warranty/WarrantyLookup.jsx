import React, { useState, useMemo, useEffect } from "react";
import {
   ShieldCheck,
   Search,
   X,
   Plus,
   Wrench,
   ChevronDown,
   Ruler,
   Paintbrush,
   Info,
   CheckCircle,
   Hammer,
   AlertCircle,
   Activity,
   Truck,
   BadgeDollarSign
} from "lucide-react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import DataTable from "@/components/control/DataTable";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

// ===================== CONFIG & MOCK DATA (SELF-CONTAINED) =====================
const STAGE_CONFIG = {
   "TIẾP NHẬN": { label: "1. Tiếp nhận", bg: "#f8fafc", text: "#475569", border: "#e2e8f0", icon: AlertCircle },
   "XÁC MINH": { label: "2. Xác minh", bg: "#f0fdfa", text: "#0d9488", border: "#ccfbf1", icon: ShieldCheck },
   "LÊN LỊCH": { label: "3. Lên lịch", bg: "#fffbeb", text: "#b45309", border: "#fef3c7", icon: Search },
   "ĐANG KIỂM TRA": { label: "4. Đang kiểm tra", bg: "#eff6ff", text: "#1e40af", border: "#dbeafe", icon: Activity },
   "CHỜ PHÊ DUYỆT": { label: "5. Chờ duyệt", bg: "#f5f3ff", text: "#7c3aed", border: "#ede9fe", icon: Activity },
   "ĐANG SỬA": { label: "6. Đang sửa", bg: "#fff7ed", text: "#c2410c", border: "#ffedd5", icon: Hammer },
   "CHỜ GIAO TRẢ": { label: "7. Chờ giao trả", bg: "#faf5ff", text: "#9333ea", border: "#f3e8ff", icon: Truck },
   "HOÀN TẤT": { label: "Hoàn tất ✅", bg: "#f0fdf4", text: "#166534", border: "#dcfce7", icon: CheckCircle },
   "TỪ CHỐI BH": { label: "Từ chối", bg: "#fef2f2", text: "#991b1b", border: "#fecaca", icon: X },
   "SỬA DỊCH VỤ": { label: "Sửa dịch vụ", bg: "#fee2e2", text: "#b91c1c", border: "#fecaca", icon: BadgeDollarSign },
};

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

// ===================== HELPER COMPONENTS =====================

const ModalContainer = ({ title, onClose, children, maxWidth = "max-w-md" }) => (
   <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] animate-in fade-in duration-200" onClick={onClose} />
      <div className={cn("relative bg-white rounded-lg w-full shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200", maxWidth)}>
         <div className="px-6 py-4 border-b flex items-center justify-between shrink-0" style={{ borderColor: "var(--grid-border)" }}>
            <h3 className="text-[16px] font-bold text-gray-900">{title}</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition text-gray-400 hover:text-gray-600 cursor-pointer">
               <X size={18} />
            </button>
         </div>
         <div className="flex-1 overflow-y-auto p-6 text-gray-900">
            {children}
         </div>
      </div>
   </div>
);

const DEFECT_TYPES = [
   "Nứt, tách mộng",
   "Bong sơn/PU",
   "Mối mọt",
   "Bản lề hỏng",
   "Lỗi khác"
];

const QuickIntakeModal = ({ isOpen, onClose, asset, onAdd }) => {
   const [data, setData] = useState({ defectType: DEFECT_TYPES[0], defect: "", location: "Tại nhà KH" });
   if (!isOpen || !asset) return null;
   const isExpired = new Date(asset.endDate) < new Date();

   return (
      <ModalContainer title="Tiếp nhận bảo hành" onClose={onClose} maxWidth="max-w-sm">
         <div className="space-y-5">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
               <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Sản phẩm đối soát</p>
               <div className="flex items-center gap-3">
                  <img src={asset.img} className="w-12 h-12 rounded-lg object-cover shadow-sm border border-white" />
                  <div>
                     <p className="text-[13px] font-bold text-slate-900 leading-tight">{asset.productName}</p>
                     <p className={`text-[11px] font-bold mt-1 uppercase ${isExpired ? 'text-red-500' : 'text-emerald-600'}`}>
                        {isExpired ? 'Hết hạn bảo hành' : 'Còn bảo hành'}
                     </p>
                  </div>
               </div>
            </div>

            <div className="space-y-1.5">
               <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Loại lỗi đồ gỗ</label>
               <select
                  value={data.defectType}
                  onChange={e => setData({ ...data, defectType: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-white border border-gray-200 font-bold text-[13px] outline-none focus:border-brand-primary cursor-pointer shadow-sm"
               >
                  {DEFECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
               </select>
            </div>

            <div className="space-y-1.5">
               <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Địa điểm khảo sát</label>
               <div className="grid grid-cols-2 gap-2">
                  {["Tại nhà KH", "Tại xưởng"].map(loc => (
                     <button
                        key={loc}
                        onClick={() => setData({ ...data, location: loc })}
                        className={cn(
                           "h-9 rounded-lg text-[11px] font-bold border transition-all",
                           data.location === loc ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                        )}
                     >
                        {loc}
                     </button>
                  ))}
               </div>
            </div>

            <div className="space-y-1.5">
               <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Mô tả chi tiết</label>
               <textarea
                  value={data.defect}
                  onChange={e => setData({ ...data, defect: e.target.value })}
                  className="w-full p-3 rounded-xl bg-white border border-gray-200 font-medium text-[13px] outline-none focus:border-brand-primary h-24 resize-none shadow-sm"
                  placeholder="Ghi chú thêm về vị trí, kích thước vết nứt..."
               />
            </div>

            <Button
               onClick={() => {
                  onAdd({ ...asset, ...data, type: isExpired ? "service" : "warranty" });
                  setData({ defectType: DEFECT_TYPES[0], defect: "", location: "Tại nhà KH" });
                  onClose();
               }}
               className={cn("w-full h-11 rounded-xl text-[13px] font-bold uppercase shadow-md", isExpired ? 'bg-amber-600 hover:bg-amber-700' : 'bg-slate-900 hover:bg-slate-800')}
            >
               {isExpired ? 'Lập phiếu Sửa chữa Dịch vụ' : 'Ghi nhận phiếu Bảo hành'}
            </Button>
         </div>
      </ModalContainer>
   );
};

const ProductCard = ({ asset, isExpanded, onToggle, onAdd, requests }) => {
   const pastRepairs = useMemo(() => requests.filter(r => r.orderId === asset.orderId && r.productName === asset.productName), [asset, requests]);
   const expired = new Date(asset.endDate) < new Date();

   return (
      <div className={cn(
         "bg-white rounded-xl border-2 overflow-hidden group/card flex flex-col transition-all",
         isExpanded ? "border-slate-900 shadow-xl" : "border-slate-100 shadow-sm"
      )}>
         <div className="relative h-40 overflow-hidden bg-slate-50">
            <img src={asset.img} className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-700" />
            <div className="absolute top-2.5 right-2.5">
               <span className={cn(
                  "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest shadow-sm",
                  expired ? "bg-red-500 text-white" : "bg-emerald-600 text-white"
               )}>
                  {expired ? 'Hết hạn' : 'Bảo hành'}
               </span>
            </div>
            <button onClick={onToggle} className="absolute bottom-2.5 right-2.5 p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-white text-slate-900 hover:bg-white transition-all transform active:scale-95">
               {isExpanded ? <ChevronDown size={14} /> : <Info size={14} />}
            </button>
         </div>

         <div className="p-4 space-y-4 flex-1 flex flex-col">
            <div className="min-w-0">
               <h4 className="text-[14px] font-bold text-slate-900 leading-tight mb-0.5 truncate">{asset.productName}</h4>
               <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{asset.material}</p>
            </div>

            {isExpanded ? (
               <div className="space-y-4 pt-3 border-t border-slate-50 animate-in fade-in slide-in-from-top-1">
                  <div className="grid grid-cols-2 gap-3">
                     <div className="space-y-0.5">
                        <p className="text-[9px] font-bold text-slate-300 uppercase flex items-center gap-1"><Ruler size={10} /> Kích thước</p>
                        <p className="text-[11px] font-semibold text-slate-600 line-clamp-1">{asset.dimensions}</p>
                     </div>
                     <div className="space-y-0.5">
                        <p className="text-[9px] font-bold text-slate-300 uppercase flex items-center gap-1"><Paintbrush size={10} /> Hoàn thiện</p>
                        <p className="text-[11px] font-semibold text-slate-600 line-clamp-1">{asset.paintType || 'Sơn PU'}</p>
                     </div>
                  </div>

                  <div className="space-y-2">
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Lịch sử xử lý</p>
                     <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1 scrollbar-thin">
                        {pastRepairs.length === 0 ? (
                           <p className="text-[10px] font-medium text-slate-300 italic py-3 text-center bg-slate-50 rounded-lg">Chưa có lịch sử</p>
                        ) : (
                           pastRepairs.map((r, i) => (
                              <div key={i} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                                 <div className="flex justify-between items-start mb-0.5">
                                    <p className="text-[10px] font-bold text-slate-900">#{r.id}</p>
                                    <p className="text-[9px] font-bold uppercase" style={{ color: (STAGE_CONFIG[r.status] || STAGE_CONFIG["HOÀN TẤT"]).text }}>
                                       {(STAGE_CONFIG[r.status] || STAGE_CONFIG["HOÀN TẤT"]).label}
                                    </p>
                                 </div>
                                 <p className="text-[11px] font-semibold text-slate-600 line-clamp-2">{r.defect}</p>
                              </div>
                           ))
                        )}
                     </div>
                  </div>
               </div>
            ) : (
               <div className="pt-3 border-t border-slate-50 flex justify-between items-center text-[10px] font-bold text-slate-300 italic uppercase">
                  <span>Lần xử lý:</span>
                  <span className={pastRepairs.length > 0 ? 'text-amber-500' : ''}>{pastRepairs.length} lần</span>
               </div>
            )}

            <Button
               size="sm"
               onClick={() => onAdd(asset)}
               className={cn(
                  "mt-auto w-full h-10 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all shadow-md",
                  expired ? "bg-amber-600 hover:bg-amber-700" : "bg-slate-900 hover:bg-slate-800"
               )}
            >
               {expired ? <Wrench size={14} className="mr-1.5" /> : <Plus size={14} className="mr-1.5" />}
               {expired ? 'Sửa dịch vụ' : 'Tiếp nhận BH'}
            </Button>
         </div>
      </div>
   );
};

// ===================== MAIN PAGE =====================

export default function WarrantyLookup() {
   const [requests, setRequests] = useState(() => JSON.parse(localStorage.getItem("tpf_erp_warranty_requests_v2")) || []);
   const [searchTerm, setSearchTerm] = useState("");
   const [selected, setSelected] = useState(null);
   const [showIntake, setShowIntake] = useState(false);
   const [expandedOrders, setExpandedOrders] = useState([]);

   useEffect(() => localStorage.setItem("tpf_erp_warranty_requests_v2", JSON.stringify(requests)), [requests]);

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

   const orderColumns = [
      {
         header: "STT",
         headerClassName: "text-center w-[60px]",
         className: "text-center font-medium",
         style: { color: "var(--text-secondary)" },
         render: (_, idx) => idx + 1,
      },
      { header: "Mã đơn hàng", render: (g) => <span className="font-bold font-mono">#{g.orderId}</span> },
      {
         header: "Khách hàng",
         render: (g) => (
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[12px] bg-gray-100 text-gray-500 border border-gray-200">
                  {g.customerName.charAt(0)}
               </div>
               <div>
                  <p className="text-[13px] font-semibold text-gray-900">{g.customerName}</p>
                  <p className="text-[11px] text-gray-400 font-medium">{g.phone}</p>
               </div>
            </div>
         ),
      },
      {
         header: "Món",
         className: "text-right pr-6",
         render: (g) => (
            <span className="px-2.5 py-1 bg-white border border-gray-100 rounded-md text-[11px] font-bold text-gray-500 uppercase flex items-center gap-1.5 w-fit ml-auto shadow-sm">
               {g.products.length}
            </span>
         ),
      },
   ];

   const toggleOrder = (id) => setExpandedOrders(prev => prev.includes(id) ? prev.filter(oid => oid !== id) : [...prev, id]);

   return (
      <>
         <PageHelmet title="Tra cứu Bảo hành | TPF-SIMS" />
         <div className="flex flex-col h-[calc(100vh-64px)] -m-6 p-6 space-y-4" style={{ backgroundColor: "var(--bg-main)" }}>
            {/* Header Section */}
            <div className="flex items-center justify-between shrink-0 mb-1">
               <div>
                  <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: "var(--text-main)" }}>
                     <Search size={22} style={{ color: "var(--brand-primary)" }} />
                     Tra cứu & Tiếp nhận Bảo hành
                  </h1>
                  <p className="text-[13px] mt-0.5" style={{ color: "var(--text-placeholder)" }}>
                     {groupedAssets.length} đơn hàng đang được tra cứu
                  </p>
               </div>
            </div>

            <DataTable
               columns={orderColumns}
               data={groupedAssets}
               searchTerm={searchTerm}
               setSearchTerm={setSearchTerm}
               searchPlaceholder="Tìm theo mã đơn, khách hàng..."
               renderDetail={(group) => (
                  <div className="p-8 bg-gray-50/50 rounded-lg border-b border-gray-100 shadow-inner overflow-x-auto">
                     <div className="flex gap-6 min-w-max pb-2">
                        {group.products.map((p) => (
                           <div key={p.id} className="w-[300px]">
                              <ProductCard
                                 asset={p}
                                 requests={requests}
                                 isExpanded={expandedOrders.includes(p.id)}
                                 onToggle={() => setExpandedOrders(prev => prev.includes(p.id) ? prev.filter(id => id !== p.id) : [...prev, p.id])}
                                 onAdd={(asset) => { setSelected(asset); setShowIntake(true); }}
                              />
                           </div>
                        ))}
                     </div>
                  </div>
               )}
               expandedIds={expandedOrders}
               onToggleExpand={toggleOrder}
            />

            <QuickIntakeModal 
               isOpen={showIntake} 
               onClose={() => setShowIntake(false)} 
               asset={selected} 
               onAdd={(d) => {
                  const warrantyYears = Math.max(1, Math.round((new Date(d.endDate) - new Date(d.deliveryDate)) / (1000 * 60 * 60 * 24 * 365)));
                  const newReq = { 
                     id: "RQ-" + (requests.length + 1).toString().padStart(3, '0'), 
                     orderId: d.orderId,
                     customerName: d.customerName,
                     phone: d.phone,
                     productName: d.productName,
                     purchaseDate: d.deliveryDate,
                     warrantyYears: warrantyYears,
                     defectCategory: d.defectType,
                     defect: d.defect,
                     channel: "Tra cứu ERP",
                     receiveMethod: d.location,
                     contactStaff: "Bộ phận CSKH",
                     isService: d.type === "service",
                     status: "TIẾP NHẬN", 
                     updatedAt: new Date().toISOString(), 
                     history: [{ date: new Date().toLocaleString('vi-VN').replace(',', ''), action: "Ghi nhận phiếu từ Tra cứu", user: "Admin", location: "" }] 
                  };
                  setRequests([newReq, ...requests]);
                  toast.success("Đã ghi nhận! Chuyển sang Danh Sách Bảo Hành để xử lý.");
               }} 
            />
         </div>
      </>
   );
}
