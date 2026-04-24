/**
 * WorkshopStatusModal
 * Popup xem nhanh tiến độ xưởng ngay tại màn hình bán hàng
 * Giúp Sales check nhanh tải trọng xưởng để hẹn ngày khách
 */

import React, { useState, useEffect, useMemo } from "react";
import { 
  X, Hammer, Clock, Package, Search, ChevronDown, Info, 
  AlertTriangle, CheckCircle2, Play, Calendar
} from "lucide-react";
import { MOCK_ORDERS } from "../../worker-page/mock";

const STATUS_CONFIG = {
  WAITING: { label: "Tiếp nhận", color: "bg-gray-100 text-gray-700", icon: Clock },
  PROCESSING: { label: "Đang làm", color: "bg-blue-50 text-blue-600", icon: Hammer },
  INSPECTION: { label: "Nghiệm thu", color: "bg-blue-100 text-blue-700", icon: Play },
  OWNER_PENDING: { label: "Chờ chủ duyệt", color: "bg-amber-100 text-amber-700", icon: AlertTriangle },
  COMPLETED: { label: "Hoàn thành", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
};

export default function WorkshopStatusModal({ isOpen, onClose }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  if (!isOpen) return null;

  // Lọc đơn đang ở xưởng
  const filteredOrders = MOCK_ORDERS.filter(o => {
    const q = searchTerm.toLowerCase();
    const isWorkshop = ["WAITING", "PROCESSING", "INSPECTION", "OWNER_PENDING"].includes(o.status);
    if (!isWorkshop) return false;
    
    return (
        o.id.toLowerCase().includes(q) ||
        o.customerName?.toLowerCase().includes(q) ||
        o.items?.some(p => p.productName?.toLowerCase().includes(q))
    );
  });

  const getDeadlineBadge = (dateStr) => {
    if (!dateStr) return <span className="text-slate-300">—</span>;
    let d;
    if (dateStr.includes('/')) {
        const [day, month, year] = dateStr.split('/').map(Number);
        d = new Date(year, month - 1, day);
    } else { d = new Date(dateStr); }
    if (isNaN(d.getTime())) return <span className="text-slate-300">—</span>;

    const now = new Date();
    now.setHours(0,0,0,0);
    const diff = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
    
    let cls = "text-slate-600 bg-slate-50 border-slate-100";
    if (diff <= 1) cls = "text-rose-700 bg-rose-50 border-rose-100 font-black animate-pulse";
    else if (diff <= 3) cls = "text-amber-700 bg-amber-50 border-amber-100 font-bold";
    
    return (
        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] ${cls}`}>
            {d.toLocaleDateString('vi-VN')}
            {diff >= 0 && diff <= 3 && <span className="text-[8px] uppercase">{diff === 0 ? "Hnay" : `${diff}n`}</span>}
        </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-white animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
              <Hammer size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800 leading-none">Kiểm tra tải trọng xưởng</h3>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Dữ liệu sản xuất thời gian thực</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="relative w-64 hidden md:block">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Tìm đơn, sản phẩm..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-xl text-[12px] font-bold focus:ring-4 focus:ring-indigo-100 outline-none"
                />
             </div>
             <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white text-slate-300 hover:text-slate-900 transition-all">
                <X size={20} />
             </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 px-6 py-4 bg-white border-b border-slate-50">
            <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-[12px] shadow-sm">
                    {MOCK_ORDERS.length}
                </div>
                <span className="text-[11px] font-black text-indigo-700 uppercase tracking-wider">Tổng đơn tại xưởng</span>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-black text-[12px] shadow-sm">
                    {MOCK_ORDERS.filter(o => o.status === "WAITING").length}
                </div>
                <span className="text-[11px] font-black text-amber-700 uppercase tracking-wider">Chờ xử lý</span>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center font-black text-[12px] shadow-sm">
                    {MOCK_ORDERS.filter(o => o.status === "PROCESSING").length}
                </div>
                <span className="text-[11px] font-black text-blue-700 uppercase tracking-wider">Đang gia công</span>
            </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-3 text-[10px] font-black uppercase text-slate-400 tracking-widest">Mã đơn</th>
                <th className="pb-3 text-[10px] font-black uppercase text-slate-400 tracking-widest">Khách hàng</th>
                <th className="pb-3 text-[10px] font-black uppercase text-slate-400 tracking-widest">Trạng thái</th>
                <th className="pb-3 text-[10px] font-black uppercase text-slate-400 tracking-widest">Hạn chót</th>
                <th className="pb-3 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right pr-4">Số lượng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredOrders.map((order) => (
                <React.Fragment key={order.id}>
                  <tr className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}>
                    <td className="py-4 text-[13px] font-black font-mono text-slate-700">{order.id}</td>
                    <td className="py-4 text-[13px] font-bold text-slate-600">{order.customerName}</td>
                    <td className="py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                        order.status === "PROCESSING" ? "bg-blue-50 text-blue-600 border-blue-100" :
                        order.status === "INSPECTION" ? "bg-purple-50 text-purple-600 border-purple-100" :
                        "bg-slate-50 text-slate-500 border-slate-200"
                      }`}>
                        {order.status === "PROCESSING" ? "ĐANG XỬ LÝ" : order.status === "INSPECTION" ? "NGHIỆM THU" : "CHỜ LÀM"}
                      </span>
                    </td>
                    <td className="py-4">
                      {(() => {
                        const deadlines = order.items?.map(i => i.deadline).filter(Boolean);
                        if (!deadlines?.length) return <span className="text-slate-300">—</span>;
                        return getDeadlineBadge(deadlines[0]);
                      })()}
                    </td>
                    <td className="py-4 text-right pr-4">
                      <div className="flex items-center justify-end gap-3">
                        <span className="text-[12px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100 whitespace-nowrap">
                          {order.items?.reduce((sum, i) => sum + i.quantity, 0)} SP
                        </span>
                        <ChevronDown size={14} className={`text-slate-300 transition-transform shrink-0 ${expandedOrderId === order.id ? "rotate-180 text-indigo-500" : ""}`} />
                      </div>
                    </td>
                  </tr>
                  
                  {expandedOrderId === order.id && (
                    <tr>
                      <td colSpan={5} className="py-4 px-6 bg-slate-50/50">
                        <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                          {order.items?.map((item, i) => (
                            <div key={i} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between group/item">
                              <div className="flex items-center gap-5 flex-1">
                                <img src={item.picture} className="w-16 h-16 rounded-xl object-cover shadow-sm border border-slate-50" alt="" />
                                <div className="grid grid-cols-4 gap-x-8 gap-y-1 flex-1">
                                  <div className="col-span-4">
                                    <p className="text-[14px] font-black text-slate-800 mb-1">{item.productName}</p>
                                  </div>
                                  <div className="space-y-0.5">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Kích thước</p>
                                    <p className="text-[12px] font-bold text-slate-600">{item.size}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-1.5">Hạn chót</p>
                                    <p className="text-[12px] font-bold text-slate-600">{item.deadline || "---"}</p>
                                  </div>
                                  <div className="space-y-0.5">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Loại</p>
                                    <p className="text-[12px] font-bold text-slate-600">{item.type}</p>
                                  </div>
                                  <div className="space-y-0.5">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Màu sắc</p>
                                    <p className="text-[12px] font-bold text-slate-600">{item.color}</p>
                                  </div>
                                  <div className="space-y-0.5">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Số lượng</p>
                                    <p className="text-[12px] font-black text-indigo-600">x{item.quantity}</p>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-3 shrink-0">
                                <div className="px-3 py-1 rounded-full bg-slate-50 border border-slate-100 flex items-center gap-2">
                                  <Clock size={12} className="text-slate-400" />
                                  <span className="text-[11px] font-bold text-slate-600">Tiếp nhận</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            <div></div>
            <span>Dữ liệu mới nhất lúc: {new Date().toLocaleTimeString('vi-VN')}</span>
        </div>
      </div>
    </div>
  );
}
