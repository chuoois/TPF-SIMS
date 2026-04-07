import { useState, useEffect, useRef } from "react";
import {
  X, Package, Calendar, Phone, MapPin,
  Clock, Camera, FileText, Printer, Truck,
  CheckCircle, Eye, History, ShieldCheck,
  AlertTriangle, Trash2, User, Settings,
  Activity, AlertCircle, CheckCircle2
} from "lucide-react";
import toast from "react-hot-toast";
import { MOCK_ORDERS_DETAIL, PrintableInvoice } from "../detail";

const fmtCurrency = (n) =>
  n != null ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n) : "—";

const fmtDate = (s) => (s ? new Date(s).toLocaleDateString("vi-VN") : "—");

const fmtDateTime = (s) => {
  if (!s) return "—";
  const d = new Date(s);
  return `${d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} — ${d.toLocaleDateString("vi-VN")}`;
};

const statusStyle = (status) => {
  const m = {
    "Chờ xử lý": { bg: "rgba(59, 130, 246, 0.1)", text: "#1d4ed8", border: "rgba(59, 130, 246, 0.2)", icon: Clock },
    "Đang xử lý": { bg: "rgba(249, 115, 22, 0.1)", text: "#c2410c", border: "rgba(249, 115, 22, 0.2)", icon: Activity },
    "Chờ sản xuất": { bg: "rgba(245, 158, 11, 0.1)", text: "#b45309", border: "rgba(245, 158, 11, 0.2)", icon: Settings },
    "Đã nhập kho": { bg: "rgba(34, 197, 94, 0.1)", text: "#15803d", border: "rgba(34, 197, 94, 0.2)", icon: Package },
    "Đang gia công": { bg: "rgba(245, 158, 11, 0.1)", text: "#b45309", border: "rgba(245, 158, 11, 0.2)", icon: Activity },
    "Chờ giao hàng": { bg: "rgba(139, 92, 246, 0.1)", text: "#7c3aed", border: "rgba(139, 92, 246, 0.2)", icon: Clock },
    "Đang giao hàng": { bg: "rgba(59, 130, 246, 0.1)", text: "#1d4ed8", border: "rgba(59, 130, 246, 0.2)", icon: Truck },
    "Hoàn thành": { bg: "rgba(34, 197, 94, 0.1)", text: "#15803d", border: "rgba(34, 197, 94, 0.2)", icon: CheckCircle2 },
    "Chờ duyệt hủy": { bg: "rgba(245, 158, 11, 0.1)", text: "#b45309", border: "rgba(245, 158, 11, 0.2)", icon: AlertCircle },
    "Đơn đã hủy": { bg: "rgba(239, 68, 68, 0.1)", text: "#b91c1c", border: "rgba(239, 68, 68, 0.2)", icon: Trash2 },
  };
  return m[status] || { bg: "#F3F4F6", text: "#6B7280", border: "#E5E7EB", icon: Clock };
};

const CustomerInfoCard = ({ o }) => (
  <div className="rounded-xl overflow-hidden bg-white shadow-sm border border-gray-100">
    <div className="px-5 py-4 flex items-center gap-4 border-b border-gray-50">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-[18px] font-bold shrink-0 bg-indigo-50 text-indigo-600 border border-indigo-100">
        {o.customer.name.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-bold truncate text-gray-900">{o.customer.name}</p>
        <div className="flex items-center gap-4 mt-1 flex-wrap">
          <span className="inline-flex items-center gap-1.5 text-[12px] text-gray-500">
            <Phone size={13} className="text-gray-400" />
            {o.customer.phone}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[12px] text-gray-500">
            <MapPin size={13} className="text-gray-400" />
            {o.customer.address}
          </span>
        </div>
      </div>
    </div>

    <div className="px-5 py-4 bg-gray-50/30">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
        <div>
          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Mã đơn hàng</p>
          <p className="text-[13px] font-bold mt-1 text-gray-700 font-mono tracking-tight">{o.code}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Loại đơn</p>
          <p className="text-[13px] font-bold mt-1 text-gray-700">{o.type}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Nhân viên</p>
          <p className="text-[13px] font-bold mt-1 text-gray-700">{o.salesPerson || "---"}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Ngày tạo</p>
          <p className="text-[13px] font-bold mt-1 text-gray-700">{fmtDateTime(o.date)}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Ngày giao</p>
          <p className="text-[13px] font-bold mt-1 text-gray-700">{fmtDate(o.deliveryDate)}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Hình thức</p>
          <p className="text-[13px] font-bold mt-1 text-gray-700">{o.fulfillmentType || "Giao tận nơi"}</p>
        </div>
      </div>
    </div>
  </div>
);

const HistoryCard = ({ o }) => (
  <div className="rounded-xl overflow-hidden bg-white shadow-sm border border-gray-100">
    <div className="px-5 py-3.5 flex items-center gap-2 border-b border-gray-50 bg-gray-50/50">
      <History size={15} className="text-gray-400" />
      <span className="text-[12px] font-bold uppercase tracking-wider text-gray-600">Lịch sử hoạt động</span>
    </div>
    <div className="px-6 py-6 space-y-6 relative ml-4">
      <div className="absolute top-2 bottom-2 left-[-17px] w-[2px] bg-gray-100" />
      {(o.timeline || []).map((t, idx) => (
        <div key={idx} className="relative pl-2">
          <div className={`absolute top-1 left-[-26px] w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center z-10 ${
            t.active ? "border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" : "border-gray-200"
          }`}>
            {t.active && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className={`text-[13px] font-bold ${t.active ? "text-gray-900" : "text-gray-400"}`}>{t.label}</p>
              <p className="text-[12px] text-gray-500 mt-0.5 leading-relaxed">{t.desc}</p>
            </div>
            <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap pt-0.5">{t.time}</span>
          </div>
        </div>
      ))}
      {(o.timeline || []).length === 0 && (
        <p className="text-center text-gray-400 text-[12px] py-4 italic">Chưa có lịch sử hoạt động</p>
      )}
    </div>
  </div>
);

const ProductItem = ({ p, onPreview }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-all">
    <div className="flex flex-col sm:flex-row">
      <div 
        className="w-full sm:w-32 aspect-square bg-gray-50 shrink-0 cursor-zoom-in overflow-hidden"
        onClick={() => p.image && onPreview(p.image)}
      >
        {p.image ? (
          <img src={p.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <Package size={32} strokeWidth={1} />
          </div>
        )}
      </div>
      <div className="p-4 flex-1">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h4 className="text-[14px] font-bold text-gray-900 leading-snug">{p.name}</h4>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-[10px] font-bold uppercase tracking-wider">
                Số lượng: {p.qty} {p.unit || "Bộ"}
              </span>
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-[10px] font-bold uppercase tracking-wider border border-indigo-100">
                Đơn giá: {fmtCurrency(p.price)}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[14px] font-bold text-gray-900">{fmtCurrency(p.price * p.qty)}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 pt-3 border-t border-gray-50">
          <div>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Chất liệu</span>
            <p className="text-[11px] font-semibold text-gray-700">{p.material || "—"}</p>
          </div>
          <div>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Kích thước</span>
            <p className="text-[11px] font-semibold text-gray-700">{p.size || "—"}</p>
          </div>
          <div>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Hoàn thiện</span>
            <p className="text-[11px] font-semibold text-gray-700">{p.finish || "—"}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function SalesInvoiceDetailsPopup({ orderData, isOpen, onClose, onCancelRequest }) {
  const [order, setOrder] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const printRef = useRef(null);

  useEffect(() => {
    if (isOpen && orderData) {
      // Simulate loading from mock data
      const found = MOCK_ORDERS_DETAIL[orderData.id];
      if (found) {
        setOrder({
          ...found,
          id: orderData.id,
          customer: found.customer || { name: found.customerName, phone: found.phone, address: "---" },
          products: found.products || []
        });
      } else {
        // Fallback to basic data from the list
        setOrder({
          ...orderData,
          customer: { name: orderData.customerName, phone: orderData.phone, address: "---" },
          products: []
        });
      }
    } else {
      setOrder(null);
    }
  }, [orderData, isOpen]);

  if (!isOpen) return null;

  const handlePrint = () => {
    if (!order) return;
    const content = printRef.current;
    if (!content) return;
    
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (printWindow) {
      printWindow.document.write(`
        <html><head><title>In hóa đơn ${order.code}</title>
        <style>@page { size: A4; margin: 15mm; } body { margin: 0; padding: 0; }</style>
        </head><body>${content.innerHTML}</body></html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };

  const productTotal = order?.products?.reduce((acc, p) => acc + (p.price || 0) * (p.qty || 1), 0) || order?.total || 0;
  
  const isPickupCompleted = order?.fulfillmentType === "Lấy tại cửa hàng" && order?.status === "Hoàn thành";
  const CANCELLABLE_STATUSES = [
    "Chờ xử lý", "Đang chuẩn bị", "Chờ báo giá", "Đã báo giá", 
    "Chờ xác nhận", "Đang gia công", "Chờ sản xuất", "Chờ giao hàng"
  ];
  const cancellable = CANCELLABLE_STATUSES.includes(order?.status) || isPickupCompleted;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={onClose} />
      
      {/* Modal Content */}
      <div className="relative bg-gray-50 w-full max-w-[1000px] h-full max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-white animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between bg-white border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
             <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600">
                <Package size={20} />
             </div>
             <div>
                <h3 className="text-[17px] font-bold text-gray-900">Chi tiết đơn hàng</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[12px] font-mono text-gray-400 font-bold tracking-tight">{order?.code}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-200" />
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tighter">
                    {order?.type}
                  </span>
                </div>
             </div>
          </div>
          
          <div className="flex items-center gap-2">
             {order && (
                <button 
                  onClick={handlePrint}
                  className="h-9 px-4 rounded-xl bg-white border border-gray-200 text-gray-700 text-[12px] font-bold hover:bg-gray-50 transition-all flex items-center gap-2 active:scale-95"
                >
                  <Printer size={15} /> In hóa đơn
                </button>
             )}
             
             {cancellable && (
                <button 
                  onClick={() => onCancelRequest(order)}
                  className="h-9 px-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-[12px] font-bold hover:bg-rose-100 transition-all flex items-center gap-2 active:scale-95"
                >
                  <Trash2 size={15} /> Yêu cầu hủy
                </button>
             )}

             <button 
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
             >
                <X size={18} />
             </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">
          {!order ? (
            <div className="h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Infos & Products (8 cols) */}
              <div className="lg:col-span-8 space-y-6">
                <CustomerInfoCard o={order} />

                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                     <div className="flex items-center gap-2">
                        <Package size={16} className="text-gray-400" />
                        <h4 className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">Danh sách sản phẩm ({order.products.length})</h4>
                     </div>
                  </div>
                  <div className="space-y-3">
                    {order.products.map((p, idx) => (
                      <ProductItem key={idx} p={p} onPreview={setPreviewImage} />
                    ))}
                    {order.products.length === 0 && (
                      <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <p className="text-[13px] text-gray-400 italic">Chưa có thông tin sản phẩm cụ thể cho đơn hàng này.</p>
                      </div>
                    )}
                  </div>
                </div>

                {order.sampleImages && order.sampleImages.length > 0 && (
                  <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-gray-50 flex items-center gap-2">
                       <Camera size={15} className="text-gray-400" />
                       <span className="text-[12px] font-bold uppercase tracking-wider text-gray-600">Ảnh mẫu yêu cầu</span>
                    </div>
                    <div className="p-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                       {order.sampleImages.map((img, idx) => (
                          <div 
                            key={idx} 
                            className="aspect-square rounded-lg overflow-hidden border border-gray-100 bg-gray-50 cursor-pointer group"
                            onClick={() => setPreviewImage(img)}
                          >
                             <img src={img} className="w-full h-full object-cover transition duration-300 group-hover:scale-110" />
                          </div>
                       ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Status & Timeline (4 cols) */}
              <div className="lg:col-span-4 space-y-6">
                {/* Status Card */}
                <div className="rounded-xl p-5 bg-white shadow-sm border border-gray-100">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-3">Trạng thái hiện tại</p>
                  <div 
                    className="flex items-center gap-3 p-3.5 rounded-2xl border"
                    style={{ 
                      backgroundColor: statusStyle(order.status).bg, 
                      color: statusStyle(order.status).text, 
                      borderColor: statusStyle(order.status).border 
                    }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/50 backdrop-blur-sm flex items-center justify-center">
                       {(() => {
                         const StatusIcon = statusStyle(order.status).icon;
                         return StatusIcon ? <StatusIcon size={20} /> : null;
                       })()}
                    </div>
                    <div>
                        <p className="text-[14px] font-black uppercase tracking-tight leading-none">{order.status}</p>
                        <p className="text-[11px] mt-1 font-bold opacity-70">Cập nhật lúc: {order.timeline?.[order.timeline.length-1]?.time || "---"}</p>
                    </div>
                  </div>

                  <div className="mt-6 pt-5 border-t border-gray-50 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-gray-500 font-bold uppercase tracking-wider">Tổng cộng</span>
                      <span className="text-[18px] font-black text-gray-900 leading-none">{fmtCurrency(productTotal)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-gray-500 font-bold uppercase tracking-wider">Đã đặt cọc</span>
                      <span className="text-[14px] font-bold text-emerald-600">{fmtCurrency(order.deposit || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
                      <span className="text-[12px] font-black text-gray-500 uppercase tracking-wider">Còn lại</span>
                      <span className="text-[16px] font-black text-rose-600 leading-none">{fmtCurrency(productTotal - (order.deposit || 0))}</span>
                    </div>
                  </div>
                </div>

                <HistoryCard o={order} />

                {order.deliveryImage && (
                  <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-gray-50 flex items-center gap-2">
                       <Truck size={15} className="text-gray-400" />
                       <span className="text-[12px] font-bold uppercase tracking-wider text-gray-600">Ảnh giao hàng</span>
                    </div>
                    <div className="p-1">
                       <img 
                        src={order.deliveryImage} 
                        className="w-full h-48 object-cover rounded-lg cursor-pointer"
                        onClick={() => setPreviewImage(order.deliveryImage)}
                       />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-6 py-3 bg-white border-t border-gray-100 flex items-center justify-between shrink-0">
           <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-tighter">
                 <ShieldCheck size={12} /> Dữ liệu được bảo mật bởi TPF-SIMS
              </div>
           </div>
           <p className="text-[11px] font-bold text-gray-300">© 2026 TRỌNG PHÓNG</p>
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setPreviewImage(null)} />
           <div className="relative max-w-[90vw] max-h-[90vh]">
              <img src={previewImage} className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" />
              <button 
                onClick={() => setPreviewImage(null)}
                className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300 transition-colors"
              >
                <X size={32} />
              </button>
           </div>
        </div>
      )}

      {/* Hidden Printable Invoice Helper */}
      <div ref={printRef} style={{ position: "absolute", left: "-9999px", top: 0, width: "800px" }}>
        {order && <PrintableInvoice o={order} displayTotal={productTotal} />}
      </div>
    </div>
  );
}
