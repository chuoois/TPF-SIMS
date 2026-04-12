import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Truck, CheckCircle2, User, Phone, Package, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function LogisticsPortal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [completionNote, setCompletionNote] = useState("");

  useEffect(() => {
    const rawData = localStorage.getItem("tpf_simulated_repair_requests");
    if (rawData) {
      const allReqs = JSON.parse(rawData);
      const found = allReqs.find(r => r.id === id);
      if (found) {
        setRequest(found);
      } else {
        toast.error("Không tìm thấy phiếu yêu cầu!");
      }
    }
  }, [id]);

  const handleUpdateStatus = (newStatus) => {
    const rawData = localStorage.getItem("tpf_simulated_repair_requests");
    if (rawData) {
      const allReqs = JSON.parse(rawData);
      const updated = allReqs.map(r => {
        if (r.id === id) {
          const finalNote = completionNote ? `[Thợ/Lái xe]: ${completionNote}` : r.notes;
          return { ...r, status: newStatus, notes: finalNote };
        }
        return r;
      });
      localStorage.setItem("tpf_simulated_repair_requests", JSON.stringify(updated));
      
      // Also update warranty history if it's completed
      const currentReq = allReqs.find(r => r.id === id);
      if (newStatus === "Hoàn thành" && currentReq?.warrantyId) {
          const rawWarranties = localStorage.getItem("tpf_simulated_warranties");
          if (rawWarranties) {
              const warranties = JSON.parse(rawWarranties);
              const updatedWarranties = warranties.map(w => {
                  if (w.id === currentReq.warrantyId) {
                      const newHistory = [
                          {
                              date: new Date().toISOString(),
                              notes: `[Logistics Hoàn thành] ${completionNote || 'Đã sửa chữa xong'}`,
                              technician: currentReq.technician || "Lái xe/Thợ"
                          },
                          ...(w.maintenanceHistory || [])
                      ];
                      return { ...w, maintenanceHistory: newHistory };
                  }
                  return w;
              });
              localStorage.setItem("tpf_simulated_warranties", JSON.stringify(updatedWarranties));
          }
      }

      setRequest({ ...request, status: newStatus, notes: completionNote ? `[Thợ/Lái xe]: ${completionNote}` : request.notes });
      toast.success(`Đã cập nhật trạng thái: ${newStatus}`);
      
      window.dispatchEvent(new Event("storage"));
    }
  };

  if (!request) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="text-center">
        <AlertCircle className="mx-auto text-red-500 mb-2" size={48} />
        <p className="text-gray-600">Đang tải thông tin hoặc không tìm thấy phiếu...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* Header */}
      <div className="bg-amber-600 text-white p-6 shadow-md sticky top-0 z-10">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Truck /> CỔNG THÔNG TIN LÁI XE / THỢ
        </h1>
        <p className="text-xs opacity-90 mt-1 uppercase tracking-wider font-semibold">TRỌNG PHÓNG FURNITURE</p>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Info Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <div className="flex justify-between items-start border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Mã phiếu</span>
              <h2 className="text-lg font-mono font-bold text-amber-700">{request.id}</h2>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold border ${
                request.status === 'Chờ xử lý' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                request.status === 'Đang thực hiện' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                'bg-green-50 text-green-600 border-green-200'
            }`}>
                {request.status.toUpperCase()}
            </div>
          </div>

          <div className="space-y-3 pt-2">
             <div className="flex items-start gap-3">
                 <div className="p-2 bg-slate-100 rounded-lg"><User size={18} className="text-slate-600" /></div>
                 <div>
                    <p className="text-xs text-slate-400 font-medium">Khách hàng</p>
                    <p className="font-bold text-slate-800">{request.customerName}</p>
                 </div>
             </div>
             <div className="flex items-start gap-3">
                 <div className="p-2 bg-slate-100 rounded-lg"><Phone size={18} className="text-slate-600" /></div>
                 <div>
                    <p className="text-xs text-slate-400 font-medium">Liên hệ</p>
                    <a href={`tel:${request.phone}`} className="font-bold text-blue-600 underline decoration-blue-300">{request.phone}</a>
                 </div>
             </div>
             <div className="flex items-start gap-3">
                 <div className="p-2 bg-slate-100 rounded-lg"><Package size={18} className="text-slate-600" /></div>
                 <div>
                    <p className="text-xs text-slate-400 font-medium">Sản phẩm & Hình thức</p>
                    <p className="font-bold text-slate-800">{request.productName}</p>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100 mt-1 inline-block">
                        {request.repairMethod}
                    </span>
                 </div>
             </div>
             <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                <p className="text-xs text-amber-600 font-bold uppercase mb-1">Yêu cầu khách báo:</p>
                <p className="text-sm text-amber-900 italic">"{request.issueDescription}"</p>
             </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {request.status === "Chờ xử lý" && (
            <button 
              onClick={() => handleUpdateStatus("Đang thực hiện")}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95 cursor-pointer"
            >
              <Truck size={24} /> BẮT ĐẦU NHẬN VIỆC / ĐẾN KHÁCH
            </button>
          )}

          {request.status === "Đang thực hiện" && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200">
                <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Ghi chú kết quả (Lái xe/Thợ)</label>
                <textarea 
                  rows={3}
                  value={completionNote}
                  onChange={e => setCompletionNote(e.target.value)}
                  className="w-full text-sm p-3 border border-slate-100 rounded-xl focus:ring-2 focus:ring-green-500/20 outline-none italic"
                  placeholder="Ví dụ: Đã thay bản lề, kiểm tra êm..."
                />
              </div>
              <button 
                onClick={() => handleUpdateStatus("Hoàn thành")}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95 cursor-pointer"
              >
                <CheckCircle2 size={24} /> XÁC NHẬN HOÀN THÀNH
              </button>
            </div>
          )}

          <div className="text-center pt-4">
             <p className="text-xs text-slate-400">Vui lòng gọi Hotline nếu có sự cố: 0988.xxx.xxx</p>
          </div>
        </div>
      </div>
    </div>
  );
}
