import React, { useState, useMemo, useEffect } from "react";
import {
   ShieldCheck, Eye, AlertCircle, Search, Plus, ClipboardList, Calendar, 
   FileText, Activity, Printer, RefreshCw, Trash2, Hammer, X, CheckCircle, 
   BadgeDollarSign, Info, Truck, User, Phone, MapPin, ChevronRight, Settings, Image as ImageIcon, Copy
} from "lucide-react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import DataTable from "@/components/control/DataTable";
import ConfirmModal from "@/components/control/ConfirmModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

// ===================== ERP 3.0: 8-STAGE GOLDEN FLOW & CONFIG =====================
const STAGE_CONFIG = {
   "TIẾP NHẬN": { label: "1. Tiếp nhận", bg: "#f8fafc", text: "#475569", border: "#e2e8f0", icon: ClipboardList },
   "XÁC MINH": { label: "2. Xác minh", bg: "#f0fdfa", text: "#0d9488", border: "#ccfbf1", icon: ShieldCheck },
   "LÊN LỊCH": { label: "3. Lên lịch", bg: "#fffbeb", text: "#b45309", border: "#fef3c7", icon: Calendar },
   "ĐANG KIỂM TRA": { label: "4. Đang kiểm tra", bg: "#eff6ff", text: "#1e40af", border: "#dbeafe", icon: Search },
   "CHỜ PHÊ DUYỆT": { label: "5. Chờ duyệt", bg: "#f5f3ff", text: "#7c3aed", border: "#ede9fe", icon: Activity },
   "ĐANG SỬA": { label: "6. Đang sửa", bg: "#fff7ed", text: "#c2410c", border: "#ffedd5", icon: Hammer },
   "CHỜ GIAO TRẢ": { label: "7. Chờ giao trả", bg: "#faf5ff", text: "#9333ea", border: "#f3e8ff", icon: Truck },
   "HOÀN TẤT": { label: "Hoàn tất", bg: "#f0fdf4", text: "#166534", border: "#dcfce7", icon: CheckCircle },
   "TỪ CHỐI BH": { label: "Từ chối", bg: "#fef2f2", text: "#991b1b", border: "#fecaca", icon: X },
   "SỬA DỊCH VỤ": { label: "Sửa dịch vụ", bg: "#fee2e2", text: "#b91c1c", border: "#fecaca", icon: BadgeDollarSign },
};

const INITIAL_REQUESTS = [
   {
      id: "RQ-001", orderId: "ORD-991", customerName: "Nguyễn Văn Hùng", phone: "0912345678",
      productName: "Sập thờ Mai Điểu", status: "TIẾP NHẬN", 
      purchaseDate: "2023-01-15", warrantyYears: 2,
      defectCategory: "Nứt, tách mộng", channel: "Zalo", receiveMethod: "Tại nhà KH", contactStaff: "Sale Trang",
      defect: "Nứt vách tâm do độ ẩm",
      updatedAt: new Date().toISOString(), 
      history: [{ date: "2024-04-02 09:00", action: "Tiếp nhận thông tin lỗi", user: "Sale Trang", location: "" }]
   },
   {
      id: "RQ-002", orderId: "ORD-882", customerName: "Thanh Bình", phone: "0988776655",
      productName: "Bộ bàn ăn 10 ghế", status: "LÊN LỊCH",
      purchaseDate: "2024-02-10", warrantyYears: 3, defectCategory: "Bong sơn", channel: "Showroom",
      receiveMethod: "Tại nhà KH", contactStaff: "Sale Mai", isWarranty: true,
      updatedAt: new Date().toISOString(),
      history: [
         { date: "2024-04-01 10:00", action: "Tiếp nhận phiếu", user: "Sale" },
         { date: "2024-04-01 15:00", action: "Đã xác minh điều kiện bảo hành", user: "Quản lý" }
      ]
   },
   {
      id: "RQ-003", orderId: "ORD-991", customerName: "Nguyễn Văn Hùng", phone: "0912345678",
      productName: "Bàn cơm gỗ Gụ", status: "ĐANG KIỂM TRA", assignedTech: "Thợ Cường",
      appointmentDate: "2024-04-01", appointmentLocation: "mang vào xưởng",
      purchaseDate: "2022-05-15", warrantyYears: 1, defectCategory: "Lỗi khác",
      updatedAt: new Date().toISOString(),
      history: [{ date: "2024-03-31 09:00", action: "Thợ Cường bắt đầu kiểm tra", user: "Thợ Cường", location: "Tại xưởng" }]
   },
   {
      id: "RQ-004", orderId: "ORD-773", customerName: "Lê Văn Tám", phone: "0933445566",
      productName: "Tủ giày 3 cánh", status: "CHỜ PHÊ DUYỆT", assignedTech: "Thợ Minh",
      appointmentDate: "2024-04-01", isService: true,
      surveyNotes: "Cần thay bản lề lá, quật lại mộc cánh trái", 
      materials: [{ name: "Bản lề", quantity: 2, price: 50000 }],
      purchaseDate: "2021-01-10", warrantyYears: 2, // Expired
      updatedAt: new Date().toISOString(),
      history: [{ date: "2024-04-02 10:30", action: "Nộp báo cáo khảo sát (Có phí)", user: "Thợ Minh" }]
   }
];

// ===================== HELPER COMPONENTS =====================

const VisualTimeline = ({ history }) => (
   <div className="mt-8 pt-8 border-t" style={{ borderColor: "var(--grid-border)" }}>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-1.5" style={{ color: "var(--text-placeholder)" }}>
         <Activity size={12} /> Truy vết nghiệp vụ
      </p>
      <div className="relative pl-6 space-y-8 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5" style={{ "--timeline-line": "var(--grid-border)" }}>
         <div className="absolute left-[11px] top-2 bottom-2 w-0.5" style={{ backgroundColor: "var(--grid-border)" }} />
         {history?.map((h, i) => (
            <div key={i} className="relative">
               <div 
                  className={`absolute -left-[30px] top-1.5 w-4 h-4 rounded-full border-4 border-white ${i === 0 ? 'ring-4' : ''}`}
                  style={{ 
                     backgroundColor: i === 0 ? "var(--brand-primary)" : "var(--grid-border)",
                     borderColor: "white",
                     boxShadow: i === 0 ? "0 0 0 4px var(--status-focus)" : "none"
                  }} 
               />
               <div className="space-y-1">
                  <div className="flex items-center gap-2">
                     <span className="text-[11px] font-black underline underline-offset-4 decoration-current opacity-80" style={{ color: "var(--text-main)" }}>{h.user}</span>
                     {h.location && (
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold">{h.location}</span>
                     )}
                     <span className="text-[10px] font-bold font-mono" style={{ color: "var(--text-placeholder)" }}>{h.date}</span>
                  </div>
                  <p className="text-[12px] font-medium" style={{ color: "var(--text-secondary)" }}>{h.action}</p>
               </div>
            </div>
         ))}
      </div>
   </div>
);

const WarrantyDetailPopup = ({ isOpen, onClose, claim, onUpdate }) => {
   const [stepData, setStepData] = useState({});

   useEffect(() => {
      if (claim) {
         setStepData({ ...claim, newMaterial: { name: "", quantity: 1, price: 0 } });
      }
   }, [claim]);

   if (!isOpen || !claim) return null;

   const sc = STAGE_CONFIG[claim.status] || STAGE_CONFIG["HOÀN THÀNH"];
   
   // Warranty Validation
   const today = new Date();
   const purchaseDate = new Date(stepData.purchaseDate || "2024-01-01");
   const expDate = new Date(purchaseDate);
   expDate.setFullYear(expDate.getFullYear() + Number(stepData.warrantyYears || 0));
   const isValidWarranty = expDate >= today;

   const handleAddMaterial = () => {
      if (!stepData.newMaterial?.name) return;
      const mats = [...(stepData.materials || []), stepData.newMaterial];
      setStepData({ ...stepData, materials: mats, newMaterial: { name: "", quantity: 1, price: 0 } });
   };

   const handleRemoveMaterial = (idx) => {
      const mats = [...(stepData.materials || [])];
      mats.splice(idx, 1);
      setStepData({ ...stepData, materials: mats });
   };

   const renderActionArea = () => {
      switch (claim.status) {
         case "TIẾP NHẬN":
            return (
               <div className="space-y-4 pt-4 border-t" style={{ borderColor: "var(--grid-border)" }}>
                  <p className="text-[11px] font-black uppercase tracking-widest text-center italic mb-4" style={{ color: "var(--text-placeholder)" }}>1. Ghi nhận yêu cầu</p>
                  <div className="space-y-3">
                     <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                           <label className="text-[10px] font-bold uppercase" style={{ color: "var(--text-secondary)" }}>Ngày mua hàng</label>
                           <Input type="date" value={stepData.purchaseDate || ""} onChange={e => setStepData({...stepData, purchaseDate: e.target.value})} className="h-9"/>
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-bold uppercase" style={{ color: "var(--text-secondary)" }}>Số năm BH</label>
                           <Input type="number" value={stepData.warrantyYears || ""} onChange={e => setStepData({...stepData, warrantyYears: e.target.value})} className="h-9"/>
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                           <label className="text-[10px] font-bold uppercase" style={{ color: "var(--text-secondary)" }}>Hình thức nhận</label>
                           <select className="w-full h-9 border rounded-md px-2 text-[12px]" value={stepData.channel || ""} onChange={e => setStepData({...stepData, channel: e.target.value})}>
                              <option>Zalo</option><option>Khách gọi</option><option>Showroom</option><option>Khác</option>
                           </select>
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-bold uppercase" style={{ color: "var(--text-secondary)" }}>Nhân viên Sale</label>
                           <Input value={stepData.contactStaff || ""} onChange={e => setStepData({...stepData, contactStaff: e.target.value})} className="h-9"/>
                        </div>
                     </div>
                     <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase" style={{ color: "var(--text-secondary)" }}>Phân loại lỗi</label>
                        <select className="w-full h-9 border rounded-md px-2 text-[12px]" value={stepData.defectCategory || ""} onChange={e => setStepData({...stepData, defectCategory: e.target.value})}>
                           <option>Nứt, tách mộng</option><option>Bong sơn/PU</option><option>Mối mọt</option><option>Bản lề hỏng</option><option>Lỗi khác</option>
                        </select>
                     </div>
                     <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase" style={{ color: "var(--text-secondary)" }}>KH Mô tả chi tiết</label>
                        <textarea className="w-full p-2 border rounded-md text-[13px] h-16" value={stepData.defect || ""} onChange={e => setStepData({...stepData, defect: e.target.value})} />
                     </div>
                     <Button 
                        onClick={() => onUpdate(claim.id, { ...stepData, status: "XÁC MINH" }, "Đã tiếp nhận đầy đủ thông tin, chuyển xác minh")}
                        className="w-full h-11 bg-slate-900 text-white font-black uppercase text-[12px]"
                     >Ghi nhận & Chuyển Xác Minh</Button>
                  </div>
               </div>
            );
         case "XÁC MINH":
            return (
               <div className="space-y-4 pt-4 border-t" style={{ borderColor: "var(--grid-border)" }}>
                  <p className="text-[11px] font-black uppercase tracking-widest text-center italic mb-4" style={{ color: "var(--text-placeholder)" }}>2. Xác minh điều kiện</p>
                  <div className="grid grid-cols-1 gap-2">
                     {isValidWarranty ? (
                        <Button onClick={() => onUpdate(claim.id, { status: "LÊN LỊCH", isWarranty: true, isService: false }, "Xác nhận đủ điều kiện BH")} className="h-12 bg-[var(--brand-primary)] text-white font-black uppercase text-[12px]">
                           <ShieldCheck size={18} className="mr-2" /> Chấp nhận Bảo hành Free
                        </Button>
                     ) : (
                        <p className="text-red-500 text-[12px] text-center font-bold italic mb-2">Sản phẩm đã hết hạn bảo hành!</p>
                     )}
                     <Button onClick={() => onUpdate(claim.id, { status: "LÊN LỊCH", isWarranty: false, isService: true }, "Chuyển sang sửa dịch vụ (có phí)")} className="h-12 bg-amber-500 text-white font-black uppercase text-[12px]">
                        <BadgeDollarSign size={18} className="mr-2" /> Chuyển sang Sửa dịch vụ
                     </Button>
                     <Button variant="outline" onClick={() => onUpdate(claim.id, { status: "TỪ CHỐI BH" }, "Từ chối xử lý")} className="h-11 hover:bg-red-50 font-black uppercase text-[12px] text-red-600 border-red-200">
                        <X size={18} className="mr-2" /> Từ chối hẳn
                     </Button>
                  </div>
               </div>
            );
         case "LÊN LỊCH":
            const isAtHome = stepData.receiveMethod === "Tại nhà KH";
            const smsMock = `Kính chào Anh/Chị ${claim.customerName}, Xưởng Gỗ TPF xác nhận lịch kiểm tra/sửa chữa sản phẩm lúc ${stepData.appointmentTime || "[Giờ]"} ngày ${stepData.appointmentDate || "[Ngày]"}. Thợ ${stepData.assignedTech || "[Tên thợ]"} sẽ liên hệ. SĐT hỗ trợ: 09xx. Xin cảm ơn!`;
            return (
               <div className="space-y-4 pt-4 border-t" style={{ borderColor: "var(--grid-border)" }}>
                  <p className="text-[11px] font-black uppercase tracking-widest mb-2" style={{ color: "var(--text-placeholder)" }}>3. Lên lịch xử lý</p>
                  <div className="space-y-3">
                     <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase" style={{ color: "var(--text-secondary)" }}>Chọn thợ thực hiện</label>
                        <select className="w-full h-9 border rounded-md px-2 text-[12px]" value={stepData.assignedTech || ""} onChange={e => setStepData({...stepData, assignedTech: e.target.value})}>
                           <option value="">-- Chọn Thợ --</option><option>Thợ Minh</option><option>Thợ Cường</option>
                        </select>
                     </div>
                     <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                           <label className="text-[10px] font-bold uppercase" style={{ color: "var(--text-secondary)" }}>Ngày hẹn</label>
                           <Input type="date" value={stepData.appointmentDate || ""} onChange={e => setStepData({...stepData, appointmentDate: e.target.value})} className="h-9"/>
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-bold uppercase" style={{ color: "var(--text-secondary)" }}>Giờ hẹn</label>
                           <Input type="time" value={stepData.appointmentTime || ""} onChange={e => setStepData({...stepData, appointmentTime: e.target.value})} className="h-9"/>
                        </div>
                     </div>
                     <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase" style={{ color: "var(--text-secondary)" }}>Ví trí xử lý</label>
                        <select className="w-full h-9 border rounded-md px-2 text-[12px]" value={stepData.receiveMethod || ""} onChange={e => setStepData({...stepData, receiveMethod: e.target.value})}>
                           <option>Tại nhà KH</option><option>KH mang tới xưởng</option>
                        </select>
                     </div>
                     {isAtHome && (
                        <div className="space-y-1">
                           <label className="text-[10px] font-bold uppercase text-red-500">Địa chỉ khách hàng</label>
                           <Input placeholder="Nhập địa chỉ cụ thể..." value={stepData.appointmentLocation || ""} onChange={e => setStepData({...stepData, appointmentLocation: e.target.value})} className="h-9"/>
                        </div>
                     )}
                     
                     <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg relative">
                        <p className="text-[10px] font-black uppercase text-blue-600 mb-1">Mẫu tin nhắn Zalo/SMS</p>
                        <p className="text-[12px] text-blue-900 leading-relaxed font-medium">{smsMock}</p>
                        <button className="absolute top-2 right-2 p-1 text-blue-500 hover:bg-blue-100 rounded"><Copy size={14}/></button>
                     </div>

                     <Button 
                        disabled={!stepData.assignedTech || !stepData.appointmentDate}
                        onClick={() => onUpdate(claim.id, { ...stepData, status: "ĐANG KIỂM TRA" }, `Đã lên lịch cho thợ ${stepData.assignedTech}`)}
                        className="w-full h-11 bg-[var(--brand-primary)] text-white font-black uppercase text-[12px]"
                     >Chốt lịch hẹn & Nhắn KH</Button>
                  </div>
               </div>
            );
         case "ĐANG KIỂM TRA":
            return (
               <div className="space-y-4 pt-4 border-t" style={{ borderColor: "var(--grid-border)" }}>
                  <p className="text-[11px] font-black uppercase tracking-widest mb-2 flex items-center gap-2" style={{ color: "var(--text-placeholder)" }}><Search size={14} /> 4. Thợ tạo báo cáo khảo sát</p>
                  <div className="space-y-4">
                     <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase" style={{ color: "var(--text-secondary)" }}>Mô tả thực tế</label>
                        <textarea className="w-full p-2 border rounded-md text-[13px] h-16" placeholder="Mô tả nguyên nhân lỗi..." value={stepData.surveyNotes || ""} onChange={e => setStepData({...stepData, surveyNotes: e.target.value})} />
                     </div>

                     <div className="border rounded-md p-3 space-y-2 bg-slate-50">
                        <label className="text-[10px] font-bold uppercase" style={{ color: "var(--text-secondary)" }}>Dự toán Vật tư / Linh kiện</label>
                        {stepData.materials?.map((m, i) => (
                           <div key={i} className="flex gap-2 items-center text-[12px] bg-white p-2 border rounded shadow-sm">
                              <span className="flex-1 font-bold">{m.name}</span>
                              <span className="w-12 text-center text-gray-500">x{m.quantity}</span>
                              {claim.isService && <span className="w-20 text-right text-orange-600 font-bold">{m.price?.toLocaleString()}đ</span>}
                              <button onClick={() => handleRemoveMaterial(i)} className="text-red-400 hover:text-red-600"><X size={14}/></button>
                           </div>
                        ))}
                        <div className="flex gap-2 mt-2">
                           <Input placeholder="Tên vật tư..." className="h-8 text-[12px]" value={stepData.newMaterial?.name || ""} onChange={e => setStepData({...stepData, newMaterial: {...stepData.newMaterial, name: e.target.value}})} />
                           <Input type="number" placeholder="SL" className="h-8 w-16 text-[12px]" value={stepData.newMaterial?.quantity || 1} onChange={e => setStepData({...stepData, newMaterial: {...stepData.newMaterial, quantity: Number(e.target.value)}})} />
                           {claim.isService && <Input type="number" placeholder="Giá" className="h-8 w-24 text-[12px]" value={stepData.newMaterial?.price || ""} onChange={e => setStepData({...stepData, newMaterial: {...stepData.newMaterial, price: Number(e.target.value)}})} />}
                           <Button onClick={handleAddMaterial} className="h-8 w-8 p-0 bg-slate-900 shrink-0"><Plus size={14} /></Button>
                        </div>
                     </div>

                     <Button 
                        disabled={!stepData.surveyNotes}
                        onClick={() => onUpdate(claim.id, { ...stepData, status: "CHỜ PHÊ DUYỆT" }, `Thợ nộp báo cáo kiểm tra`)}
                        className="w-full h-11 bg-slate-900 text-white font-black uppercase text-[12px]"
                     >Gửi báo cáo cho Chủ Xưởng</Button>
                  </div>
               </div>
            );
         case "CHỜ PHÊ DUYỆT":
            return (
               <div className="space-y-4 pt-4 border-t" style={{ borderColor: "var(--grid-border)" }}>
                  <p className="text-[11px] font-black uppercase tracking-widest text-center italic mb-4" style={{ color: "var(--text-placeholder)" }}>5. Phê duyệt & Chốt phương án</p>
                  <Button 
                     onClick={() => onUpdate(claim.id, { status: "ĐANG SỬA" }, "Duyệt phương án. Bắt đầu sửa.")}
                     className="w-full h-12 bg-green-600 text-white font-black uppercase text-[12px] shadow-lg"
                  >Duyệt & Bắt đầu Sửa chữa</Button>
                  <Button variant="outline" className="w-full h-11 text-red-600 border-red-200">Từ chối - Yêu cầu khảo sát lại</Button>
               </div>
            );
         case "ĐANG SỬA":
            return (
               <div className="space-y-4 pt-4 border-t flex flex-col items-center" style={{ borderColor: "var(--grid-border)" }}>
                  <p className="text-[11px] font-black uppercase tracking-widest text-center italic mb-2" style={{ color: "var(--text-placeholder)" }}>6. Đang trong quá trình sửa</p>
                  <Hammer size={40} className="text-gray-300 animate-pulse my-4" />
                  <Button 
                     onClick={() => onUpdate(claim.id, { status: "CHỜ GIAO TRẢ" }, "Xong mốc sửa chữa, chuẩn bị giao")}
                     className="w-full h-12 bg-[var(--brand-primary)] text-white text-[12px] font-black uppercase"
                  >Hoàn thành sửa chữa</Button>
               </div>
            );
         case "CHỜ GIAO TRẢ":
            return (
               <div className="space-y-4 pt-4 border-t" style={{ borderColor: "var(--grid-border)" }}>
                  <p className="text-[11px] font-black uppercase tracking-widest mb-2" style={{ color: "var(--text-placeholder)" }}>7. Vận chuyển / Giao trả</p>
                  <div className="space-y-3">
                     <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase" style={{ color: "var(--text-secondary)" }}>Hình thức giao</label>
                        <select className="w-full h-9 border rounded-md px-2 text-[12px]" value={stepData.deliveryMethod || ""} onChange={e => setStepData({...stepData, deliveryMethod: e.target.value})}>
                           <option value="">-- Chọn hình thức --</option><option>Thợ mang đến nhà</option><option>Taxi Tiện chuyến</option><option>Khách tự lấy</option>
                        </select>
                     </div>
                     <Button 
                        onClick={() => onUpdate(claim.id, { ...stepData, status: "HOÀN TẤT" }, "Hàng đã trên đường giao cho KH")}
                        className="w-full h-11 bg-purple-600 text-white font-black uppercase text-[12px]"
                     >Xác nhận Đã Giao</Button>
                     <Button variant="outline" className="w-full h-11 border-dashed">
                        <Printer size={16} className="mr-2"/> In phiếu bàn giao
                     </Button>
                  </div>
               </div>
            );
         case "HOÀN TẤT":
            return (
               <div className="space-y-4 pt-4 border-t" style={{ borderColor: "var(--grid-border)" }}>
                  <p className="text-[11px] font-black uppercase tracking-widest mb-2 text-center" style={{ color: "var(--text-placeholder)" }}>8. Hoàn tất toàn bộ case</p>
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg space-y-2">
                     <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 text-green-600 rounded bg-gray-100" />
                        <span className="text-[12px] font-bold text-green-900">Khách hàng đã nhận lại SP</span>
                     </label>
                     <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 text-green-600 rounded bg-gray-100" />
                        <span className="text-[12px] font-bold text-green-900">Khách hàng hài lòng</span>
                     </label>
                  </div>
                  {claim.isService && (
                     <div className="p-3 border border-orange-200 rounded-lg">
                        <p className="text-[11px] font-black text-orange-600 mb-2">Trạng thái thanh toán phí sửa dịch vụ</p>
                        <select className="w-full h-9 border border-orange-200 rounded-md px-2 text-[12px] bg-orange-50 font-bold" value={stepData.paymentStatus || "Chưa thu"} onChange={e => setStepData({...stepData, paymentStatus: e.target.value})}>
                           <option>Chưa thu tiền</option><option>Đã thu tiền mặt</option><option>Đã chuyển khoản</option>
                        </select>
                     </div>
                  )}
                  <div className="space-y-1">
                     <label className="text-[10px] font-bold uppercase" style={{ color: "var(--text-secondary)" }}>Ghi chú nội bộ</label>
                     <textarea className="w-full p-2 border rounded-md text-[13px] h-16" placeholder="Ghi chú đóng phiếu..." value={stepData.finalNotes || ""} onChange={e => setStepData({...stepData, finalNotes: e.target.value})} />
                  </div>
                  <Button 
                     onClick={() => onUpdate(claim.id, { ...stepData }, "Lưu trữ phiếu thông tin đóng")}
                     className="w-full h-11 bg-slate-900 text-white font-black uppercase text-[12px]"
                  >Cập nhật Ghi chú</Button>
               </div>
            );
         default:
            return (
               <div className="pt-4 border-t flex flex-col items-center justify-center p-6" style={{ borderColor: "var(--grid-border)", color: "var(--text-placeholder)" }}>
                  <X size={40} className="mb-2 opacity-50 text-red-500" />
                  <p className="text-[12px] font-black uppercase tracking-[0.2em] opacity-50">Phiếu đã từ chối</p>
               </div>
            );
      }
   };

   return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
         <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] animate-in fade-in" onClick={onClose} />
         <div className="relative bg-white w-full max-w-5xl h-[85vh] rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="px-8 py-5 border-b flex items-center justify-between bg-white shrink-0" style={{ borderColor: "var(--grid-border)" }}>
               <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-xl">
                     <ShieldCheck size={20} />
                  </div>
                  <div>
                     <h3 className="text-[15px] font-black uppercase tracking-tight flex items-center gap-2" style={{ color: "var(--text-main)" }}>
                        Quy trình {claim.isService ? "Dịch vụ" : "Bảo hành"} <span style={{ color: "var(--brand-primary)" }}>#{claim.id}</span>
                        {claim.isService && <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-bold">DỊCH VỤ CÓ PHÍ</span>}
                     </h3>
                     <div className="flex items-center gap-2 mt-0.5">
                        <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border" style={{ backgroundColor: sc.bg, color: sc.text, borderColor: sc.border }}>
                           {sc.label}
                        </span>
                        <span className="text-[11px] font-bold" style={{ color: "var(--text-placeholder)" }}>• Mã đơn: {claim.orderId}</span>
                        {claim.status !== "TIẾP NHẬN" && claim.purchaseDate && (
                           <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${isValidWarranty ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {isValidWarranty ? 'CÒN BẢO HÀNH' : 'HẾT HẠN BH'}
                           </span>
                        )}
                     </div>
                  </div>
               </div>
               <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-all cursor-pointer">
                  <X size={20} />
               </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-hidden flex">
               <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[var(--bg-main)]/30">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     {/* Information Column */}
                     <div className="space-y-6">
                        <div className="rounded-lg bg-white border overflow-hidden shadow-sm" style={{ borderColor: "var(--grid-border)" }}>
                           <div className="px-5 py-3 bg-[var(--grid-header-bg)] border-b flex items-center gap-2" style={{ borderColor: "var(--grid-border)" }}>
                              <User size={14} style={{ color: "var(--text-placeholder)" }} />
                              <span className="text-[11px] font-black uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Thông tin khách hàng & Dịch vụ</span>
                           </div>
                           <div className="p-5 flex items-start gap-4">
                              <div className="h-12 w-12 rounded-full bg-[var(--bg-main)] border flex items-center justify-center font-black text-slate-900 shadow-sm shrink-0" style={{ borderColor: "var(--grid-border)" }}>
                                 {claim.customerName.charAt(0)}
                              </div>
                              <div className="space-y-2 flex-1">
                                 <div>
                                    <p className="text-[15px] font-black" style={{ color: "var(--text-main)" }}>{claim.customerName}</p>
                                    <p className="text-[12px] font-bold mt-0.5 flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}><Phone size={12} /> {claim.phone}</p>
                                 </div>
                                 <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t text-[11px] font-medium text-gray-500">
                                    <p>Ngày mua: <strong className="text-gray-900">{claim.purchaseDate || "Chưa nhập"}</strong></p>
                                    <p>Hạn BH: <strong className="text-gray-900">{claim.warrantyYears || 0} năm</strong></p>
                                    <p>Tiếp nhận: <strong className="text-gray-900">{claim.channel || "Không rõ"}</strong></p>
                                    <p>Sale: <strong className="text-gray-900">{claim.contactStaff || "Không rõ"}</strong></p>
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="rounded-lg bg-white border overflow-hidden shadow-sm" style={{ borderColor: "var(--grid-border)" }}>
                           <div className="px-5 py-3 bg-[var(--grid-header-bg)] border-b flex items-center gap-2" style={{ borderColor: "var(--grid-border)" }}>
                              <Hammer size={14} style={{ color: "var(--text-placeholder)" }} />
                              <span className="text-[11px] font-black uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Mô tả sản phẩm lỗi</span>
                           </div>
                           <div className="p-6 space-y-5">
                              <div>
                                 <h4 className="text-[17px] font-black leading-tight" style={{ color: "var(--text-main)" }}>{claim.productName}</h4>
                                 <div className="mt-3 flex flex-wrap gap-2">
                                    <span className="px-3 py-1.5 bg-[var(--bg-main)] rounded-lg text-[10px] font-black uppercase border flex items-center gap-1.5" style={{ color: "var(--text-secondary)", borderColor: "var(--grid-border)" }}>
                                       <Activity size={12} /> {claim.defectCategory || "Lỗi khác"}
                                    </span>
                                    <span className="px-3 py-1.5 bg-[var(--bg-main)] rounded-lg text-[10px] font-black uppercase border flex items-center gap-1.5" style={{ color: "var(--text-secondary)", borderColor: "var(--grid-border)" }}>
                                       <MapPin size={12} /> {claim.receiveMethod || "Tại nhà"}
                                    </span>
                                 </div>
                              </div>
                              <div className="p-4 rounded-lg relative" style={{ backgroundColor: "var(--status-pending)15", border: "1px dashed var(--status-pending)" }}>
                                 <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: "var(--status-pending)" }}>Khách phản ánh</p>
                                 <p className="text-[13px] font-bold italic leading-relaxed" style={{ color: "var(--text-main)" }}>"{claim.defect || "..."}"</p>
                              </div>
                           </div>
                        </div>

                        {claim.surveyNotes && (
                           <div className="rounded-lg bg-white border overflow-hidden shadow-sm" style={{ borderColor: "var(--grid-border)" }}>
                              <div className="px-5 py-3 bg-[var(--grid-header-bg)] border-b flex items-center gap-2" style={{ borderColor: "var(--grid-border)" }}>
                                 <Settings size={14} style={{ color: "var(--text-placeholder)" }} />
                                 <span className="text-[11px] font-black uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Báo cáo khảo sát thực tế</span>
                              </div>
                              <div className="p-5 space-y-4">
                                 {claim.assignedTech && <p className="text-[12px] font-bold text-gray-500">Giám định viên: <strong className="text-gray-900">{claim.assignedTech}</strong></p>}
                                 <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: "var(--text-placeholder)" }}>Mô tả thực tế</p>
                                    <p className="text-[13px] font-bold" style={{ color: "var(--text-main)" }}>{claim.surveyNotes}</p>
                                 </div>
                                 {claim.materials && claim.materials.length > 0 && (
                                    <div className="pt-2">
                                       <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: "var(--text-placeholder)" }}>Vật tư đề xuất</p>
                                       <div className="space-y-1">
                                          {claim.materials.map((m, i) => (
                                             <div key={i} className="flex justify-between items-center text-[12px] bg-gray-50 p-2 rounded">
                                                <span className="font-bold">{m.name}</span>
                                                <span className="text-gray-500">x{m.quantity}</span>
                                                {claim.isService && <span className="font-bold text-orange-600">{m.price?.toLocaleString()}đ</span>}
                                             </div>
                                          ))}
                                       </div>
                                    </div>
                                 )}
                              </div>
                           </div>
                        )}
                     </div>

                     {/* Action & Timeline Column */}
                     <div className="space-y-6">
                        <div className="rounded-lg bg-white border p-6 shadow-sm" style={{ borderColor: "var(--grid-border)" }}>
                           <div className="flex items-center justify-between mb-6">
                              <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: "var(--text-placeholder)" }}>Trạng thái hiện tại</p>
                              <div className="flex items-center gap-2">
                                 <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: sc.bg === '#fff' ? 'var(--brand-primary)' : sc.text }} />
                                 <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: sc.text }}>{claim.status}</span>
                              </div>
                           </div>
                           {renderActionArea()}
                        </div>
                        <VisualTimeline history={claim.history} />
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

// ===================== MAIN PAGE =====================

export default function WarrantyList() {
   // Khởi tạo data nếu chưa có
   const [requests, setRequests] = useState(() => {
      const existing = localStorage.getItem("tpf_erp_warranty_requests_v2");
      if (existing) return JSON.parse(existing);
      localStorage.setItem("tpf_erp_warranty_requests_v2", JSON.stringify(INITIAL_REQUESTS));
      return INITIAL_REQUESTS;
   });

   const [statusFilter, setStatusFilter] = useState("Tất cả");
   const [searchTerm, setSearchTerm] = useState("");
   const [selected, setSelected] = useState(null);
   const [isDetailOpen, setIsDetailOpen] = useState(false);
   const [currentPage, setCurrentPage] = useState(1);
   const [itemsPerPage, setItemsPerPage] = useState(12);

   useEffect(() => {
      localStorage.setItem("tpf_erp_warranty_requests_v2", JSON.stringify(requests));
   }, [requests]);

   const { filtered, statusCounts } = useMemo(() => {
      let base = requests;
      if (searchTerm) {
         const q = searchTerm.toLowerCase();
         base = base.filter((r) =>
            (r.customerName || "").toLowerCase().includes(q) ||
            (r.productName || "").toLowerCase().includes(q) ||
            (r.id || "").toLowerCase().includes(q) ||
            (r.orderId || "").toLowerCase().includes(q)
         );
      }

      const counts = { all: base.length };
      Object.keys(STAGE_CONFIG).forEach((s) => {
         counts[s] = base.filter((r) => r.status === s).length;
      });

      if (statusFilter !== "Tất cả") {
         base = base.filter((r) => r.status === statusFilter);
      }
      return { filtered: base, statusCounts: counts };
   }, [statusFilter, requests, searchTerm]);

   const [selectedIds, setSelectedIds] = useState([]);
   const [deleteConfirmation, setDeleteConfirmation] = useState(null);
   const [bulkDeleteConfirmation, setBulkDeleteConfirmation] = useState(false);

   const handleUpdate = (id, payload, actionText) => {
      const now = new Date().toLocaleString('vi-VN').replace(',', '');
      const newHistoryItem = { date: now, action: actionText || "Cập nhật", user: "Admin", location: payload.receiveMethod || "" };
      const newUpdatedAt = new Date().toISOString();

      setRequests(prev => prev.map(r => {
         if (r.id !== id) return r;
         return { ...r, ...payload, updatedAt: newUpdatedAt, history: [newHistoryItem, ...(r.history || [])] };
      }));

      setSelected(prev => {
         if (prev && prev.id === id) {
            return { ...prev, ...payload, updatedAt: newUpdatedAt, history: [newHistoryItem, ...(prev.history || [])] };
         }
         return prev;
      });

      toast.success("Cập nhật thành công!");
   };

   // Check trễ hẹn
   const today = new Date().toISOString().split('T')[0];

   const requestColumns = [
      {
         header: "STT",
         headerClassName: "text-center w-[60px]",
         className: "text-center font-medium",
         style: { color: "var(--text-secondary)" },
         render: (_, idx) => (currentPage - 1) * itemsPerPage + idx + 1,
      },
      {
         header: "Mã phiếu",
         render: r => (
            <div>
               <p className="text-[14px] font-bold font-mono">#{r.id}</p>
               {r.isService && <span className="text-[9px] bg-orange-100 text-orange-600 px-1 rounded font-bold">DỊCH VỤ</span>}
            </div>
         )
      },
      {
         header: "Khách hàng",
         render: r => (
            <div className="max-w-[150px]">
               <p className="text-[13px] font-bold truncate">{r.customerName}</p>
               <p className="text-[11px] text-gray-400 font-medium">#{r.orderId}</p>
            </div>
         )
      },
      {
         header: "Sản phẩm lỗi",
         render: r => (
            <div className="max-w-[180px]">
               <p className="text-[13px] font-medium truncate">{r.productName}</p>
               <p className="text-[11px] text-gray-400 font-medium truncate">{r.defectCategory}</p>
            </div>
         )
      },
      {
         header: "Lịch hẹn xử lý",
         render: r => {
            if(!r.appointmentDate) return <span className="text-gray-300 text-[12px] italic">Chưa hẹn</span>;
            const isOverdue = r.appointmentDate < today && !["HOÀN TẤT", "TỪ CHỐI BH"].includes(r.status);
            return (
               <div>
                  <p className={`text-[12px] font-bold ${isOverdue ? 'text-red-500' : 'text-gray-900'}`}>{r.appointmentDate} {r.appointmentTime}</p>
                  <p className="text-[11px] text-gray-500">{r.assignedTech || "Chưa phân thợ"}</p>
               </div>
            )
         }
      },
      {
         header: "Trạng thái",
         render: r => {
            const sc = STAGE_CONFIG[r.status] || STAGE_CONFIG["HOÀN TẤT"];
            return (
               <span
                  className="inline-flex items-center justify-center px-2 py-1 text-[10px] font-black uppercase tracking-wider rounded-md border gap-1.5 shrink-0 whitespace-nowrap"
                  style={{ backgroundColor: sc.bg, color: sc.text, borderColor: sc.border }}
               >
                  {sc.icon && <sc.icon size={12} />}
                  {r.status}
               </span>
            );
         }
      }
   ];

   return (
      <>
         <PageHelmet title="Danh sách Bảo hành/Dịch vụ | TPF-SIMS" />
         <div className="flex flex-col h-[calc(100vh-64px)] -m-6 p-6 space-y-4" style={{ backgroundColor: "var(--bg-main)" }}>
            <div className="flex items-center justify-between shrink-0 mb-1">
               <div>
                  <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: "var(--text-main)" }}>
                     <ShieldCheck size={22} style={{ color: "var(--brand-primary)" }} />
                     Quy trình Trạm Dịch vụ / Bảo hành
                  </h1>
                  <p className="text-[13px] mt-0.5" style={{ color: "var(--text-placeholder)" }}>
                     Quản lý {filtered.length} phiếu cần giải quyết
                  </p>
               </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 px-1 overflow-x-auto pb-2 custom-scrollbar">
               {["Tất cả", ...Object.keys(STAGE_CONFIG)].map((s) => {
                  const isActive = statusFilter === s;
                  const sc = s !== "Tất cả" ? STAGE_CONFIG[s] : null;
                  return (
                     <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className="px-4 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer flex items-center gap-2 border whitespace-nowrap"
                        style={{
                           backgroundColor: isActive ? (sc ? sc.bg : "#fff") : "transparent",
                           color: isActive ? (sc ? sc.text : "var(--brand-primary)") : "var(--text-secondary)",
                           borderColor: isActive ? (sc ? sc.border : "var(--grid-border)") : "transparent",
                           boxShadow: isActive ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
                        }}
                     >
                        {sc?.icon && <sc.icon size={14} />}
                        {s === "Tất cả" ? "Tất cả" : sc.label}
                        <span className="text-[10px] font-black opacity-60 bg-black/5 px-2 py-0.5 rounded-md ml-1">
                           {s === "Tất cả" ? statusCounts.all : (statusCounts[s] || 0)}
                        </span>
                     </button>
                  );
               })}
            </div>

            <DataTable
               columns={requestColumns}
               data={filtered}
               searchTerm={searchTerm}
               setSearchTerm={setSearchTerm}
               searchPlaceholder="Tìm mã phiếu, khách hàng, sản phẩm..."
               pagination={{
                  total: filtered.length,
                  currentPage: currentPage,
                  setCurrentPage: setCurrentPage,
                  itemsPerPage: itemsPerPage,
                  setItemsPerPage: setItemsPerPage
               }}
               selectedIds={selectedIds}
               setSelectedIds={setSelectedIds}
               onRowClick={(r) => { setSelected(r); setIsDetailOpen(true); }}
               rowStyle={(item) => {
                  const isOverdue = item.appointmentDate && item.appointmentDate < today && !["HOÀN TẤT", "TỪ CHỐI BH"].includes(item.status);
                  return { backgroundColor: selectedIds.includes(item.id) ? "var(--status-focus)" : (isOverdue ? "#fef2f2" : "transparent") }
               }}
               rowActions={[
                  {
                     icon: Eye,
                     label: "Xử lý phiếu",
                     onClick: (r) => { setSelected(r); setIsDetailOpen(true); }
                  },
                  {
                     icon: Trash2,
                     label: "Xóa phiếu",
                     onClick: (r) => setDeleteConfirmation(r),
                     className: "text-red-400 hover:text-red-600 hover:bg-red-50"
                  }
               ]}
               bulkActions={[
                  {
                     label: "XÓA HÀNG LOẠT",
                     icon: Trash2,
                     onClick: () => setBulkDeleteConfirmation(true),
                     colorClass: "bg-rose-600"
                  }
               ]}
            />
         </div>

         <WarrantyDetailPopup 
            isOpen={isDetailOpen} 
            onClose={() => setIsDetailOpen(false)} 
            claim={selected} 
            onUpdate={handleUpdate} 
         />

         <ConfirmModal
            isOpen={!!deleteConfirmation}
            title="Xác nhận xóa phiếu?"
            message={`Bạn có chắc chắn muốn xóa phiếu #${deleteConfirmation?.id}?`}
            onConfirm={() => {
               setRequests(prev => prev.filter(r => r.id !== deleteConfirmation.id));
               setDeleteConfirmation(null);
               toast.success("Đã xóa phiếu!");
            }}
            onCancel={() => setDeleteConfirmation(null)}
         />

         <ConfirmModal
            isOpen={bulkDeleteConfirmation}
            title="Xóa hàng loạt phiếu?"
            message={`Bạn có chắc chắn muốn xóa ${selectedIds.length} phiếu đã chọn?`}
            onConfirm={() => {
               setRequests(prev => prev.filter(r => !selectedIds.includes(r.id)));
               setSelectedIds([]);
               setBulkDeleteConfirmation(false);
               toast.success(`Đã xóa ${selectedIds.length} phiếu!`);
            }}
            onCancel={() => setBulkDeleteConfirmation(false)}
         />
      </>
   );
}
