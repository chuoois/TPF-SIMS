/**
 * WorkshopStatusPage
 * Màn hình xem tiến độ xưởng dành cho Sales (Dạng Dashboard Thợ)
 * Giúp Sales nắm bắt được các đơn đang gia công và hạn chót để hẹn ngày khách chính xác
 * 
 * Created By: DNC
 * Created Date: 24/04/2026
 */

import React, { useState, useEffect, useMemo } from "react";
import { 
  Search, ChevronLeft, ChevronRight, ChevronDown, Hammer, 
  Clock, Package, Users, Calendar, AlertTriangle, LayoutDashboard,
  Info, ChevronRight as ChevronRightIcon, CheckCircle2, Play
} from "lucide-react";
import { PageHelmet } from "@/components/seo/PageHelmet";

// ===================== HELPERS & CONFIG =====================
const STATUS_CONFIG = {
  WAITING: { label: "Tiếp nhận", color: "bg-gray-100 text-gray-700", icon: Clock },
  PROCESSING: { label: "Đang làm", color: "bg-blue-50 text-blue-600", icon: Hammer },
  INSPECTION: { label: "Nghiệm thu", color: "bg-blue-100 text-blue-700", icon: Play },
  OWNER_PENDING: { label: "Chờ chủ duyệt", color: "bg-amber-100 text-amber-700", icon: AlertTriangle },
  COMPLETED: { label: "Hoàn thành", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
};

// Component con hiển thị chi tiết sản phẩm tương tự WorkerDashboard
const ProductItemRow = ({ item }) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors px-3 rounded-lg group">
      <div className="h-16 w-16 rounded-xl overflow-hidden shrink-0 border bg-white border-slate-200">
        <img
          src={item.picture || item.images?.[0] || "https://images.unsplash.com/photo-1577140917170-285929fb55b7?q=80&w=200"}
          alt={item.productName || item.name}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform"
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 gap-2">
          <h4 className="text-[13px] font-bold text-slate-800 truncate">
            {item.productName || item.name}
          </h4>
          <span className="text-[12px] font-bold text-indigo-600">
             x{item.quantity || item.qty} {item.unit || "Món"}
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-1 gap-x-4 text-[12px] mt-1.5 text-slate-500">
          <div><strong className="font-bold text-slate-700">Chất liệu:</strong> {item.type || item.material || "—"}</div>
          <div><strong className="font-bold text-slate-700">Kích thước:</strong> {item.size || "—"}</div>
          <div><strong className="font-bold text-slate-700">Màu sắc:</strong> {item.color || item.finish || "—"}</div>
        </div>

        {item.note && (
          <div className="mt-2 text-[11px] flex items-start gap-1.5 text-amber-700 bg-amber-50 px-2 py-1 rounded-md border border-amber-100 w-fit">
            <Info size={14} className="shrink-0 mt-0.5" />
            <span className="truncate">{item.note}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// DỮ LIỆU MOCKUP RIÊNG CHO TRANG TIẾN ĐỘ XƯỞNG (SALES)
const MOCK_ORDERS = [
  {
    id: "ORD-WS-001",
    customerName: "Nguyễn Hoàng Nam",
    orderDate: "20/04/2026",
    status: "PROCESSING",
    isCustomOrder: true,
    items: [
      {
        id: "ITEM-001",
        productName: "Bàn ăn gỗ Gõ Đỏ nguyên khối",
        picture: "https://noithatzito.com/wp-content/uploads/2021/04/bo-ban-an-go-soi-nga-6-ghe.jpg",
        size: "220x100x15 cm",
        type: "Gỗ Gõ Đỏ",
        color: "Sơn bóng mờ 50",
        quantity: 1,
        note: "Chọn gỗ vân bông, không bám rác, sơn kỹ mặt dưới",
        status: "INSPECTION",
        startedAt: "21/04/2026",
        deadline: new Date().toLocaleDateString('vi-VN'), // Hôm nay
        urgency: "HIGH",
      },
    ],
  },
  {
    id: "ORD-WS-002",
    customerName: "Trần Thu Hà",
    orderDate: "21/04/2026",
    status: "PROCESSING",
    isCustomOrder: false,
    items: [
      {
        id: "ITEM-002",
        productName: "Kệ tivi gỗ Hương Đá",
        picture: "https://xuongdogogiagoc.com/wp-content/uploads/2020/06/bo-ghe-au-a-go-huong-da-moc.jpg",
        size: "240x45x60 cm",
        type: "Gỗ Hương Đá",
        color: "Màu cánh gián",
        quantity: 1,
        note: "Đục mẫu đồng tiền, chân quỳ kẹp",
        status: "PROCESSING",
        startedAt: "22/04/2026",
        deadline: new Date(Date.now() + 86400000).toLocaleDateString('vi-VN'), // Mai
        urgency: "NORMAL",
      },
      {
        id: "ITEM-003",
        productName: "Đôn gỗ trang trí",
        picture: "https://images.unsplash.com/photo-1592078615290-033ee584e267?q=80&w=200",
        size: "40x40x50 cm",
        type: "Gỗ Hương Đá",
        color: "Màu cánh gián",
        quantity: 2,
        status: "WAITING",
        deadline: new Date(Date.now() + 86400000).toLocaleDateString('vi-VN'),
        urgency: "NORMAL",
      },
    ],
  },
  {
    id: "ORD-WS-003",
    customerName: "Lê Quốc Bảo",
    orderDate: "18/04/2026",
    status: "WAITING",
    isCustomOrder: true,
    items: [
      {
        id: "ITEM-004",
        productName: "Giường ngủ mẫu X hiện đại",
        picture: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=200",
        size: "180x200 cm",
        type: "Gỗ Sồi Nga",
        color: "Trắng kem",
        quantity: 1,
        note: "Bọc nệm đầu giường da microfiber màu xám",
        status: "WAITING",
        deadline: new Date(Date.now() + 86400000 * 5).toLocaleDateString('vi-VN'), // 5 ngày tới
        urgency: "NORMAL",
      },
    ],
  },
  {
    id: "ORD-WS-004",
    customerName: "Phạm Minh Quang",
    orderDate: "15/04/2026",
    status: "PROCESSING",
    isCustomOrder: true,
    items: [
      {
        id: "ITEM-005",
        productName: "Tủ rượu Tân Cổ Điển",
        picture: "https://langnghedoanhnhan.com/wp-content/uploads/2021/04/truong-ky-go-gu-lao-moc.jpg",
        size: "120x45x210 cm",
        type: "Gỗ Gõ Đỏ",
        color: "Sơn Lau cao cấp",
        quantity: 1,
        note: "Kính cường lực 8mm, đèn led cảm ứng",
        status: "OWNER_PENDING",
        startedAt: "16/04/2026",
        deadline: "22/04/2026", // Quá hạn
        urgency: "CRITICAL",
      },
    ],
  },
];

// ===================== MAIN COMPONENT =====================
export default function WorkshopStatusPage() {
  const [orders, setOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("Tất cả");

  useEffect(() => {
    // Sử dụng mockup riêng của trang để tránh xung đột với trang khác
    setOrders(MOCK_ORDERS);
  }, []);

  // Lọc các đơn đang ở xưởng (Đồng bộ với Worker Dashboard)
  const workshopOrders = useMemo(() => {
    return orders.filter(o => 
      ["WAITING", "PROCESSING", "INSPECTION", "OWNER_PENDING"].includes(o.status) ||
      o.items?.some(it => ["WAITING", "PROCESSING", "INSPECTION", "OWNER_PENDING"].includes(it.status))
    );
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return workshopOrders.filter(o => {
        if (activeTab === "Hàng mộc" && o.isCustomOrder) return false;
        if (activeTab === "Hàng đặt" && !o.isCustomOrder) return false;
        
        const q = searchTerm.toLowerCase();
        return (
            (o.id || o.code || "").toLowerCase().includes(q) ||
            (o.customerName || "").toLowerCase().includes(q) ||
            o.items?.some(p => (p.productName || p.name || "").toLowerCase().includes(q))
        );
    });
  }, [workshopOrders, searchTerm, activeTab]);

  const toggleOrder = (id) => {
    setExpandedOrderId(prev => prev === id ? null : id);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] -m-6 p-6 space-y-4" style={{ backgroundColor: "var(--bg-main)" }}>
      <PageHelmet title="Tiến độ Xưởng | TPF-SIMS" />

      {/* Header tương tự WorkerDashboard */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2 text-slate-800">
            <Hammer className="text-[var(--brand-primary)]" />
            Tiến độ Xưởng đang xử lý
          </h1>
          <p className="text-[13px] mt-0.5 text-slate-500 font-medium">
            {filteredOrders.length} đơn hàng đang trong quá trình gia công/hoàn thiện
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Tabs bộ lọc */}
          <div className="flex gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm shrink-0">
            {["Tất cả", "Hàng mộc", "Hàng đặt"].map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-4 py-1.5 rounded-lg text-[13px] font-bold transition-all ${
                  activeTab === t
                    ? "bg-slate-100 text-slate-800 shadow-sm"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search & Stats Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
         <div className="bg-indigo-600 rounded-2xl p-4 text-white flex items-center justify-between shadow-lg shadow-indigo-100">
            <div>
                <p className="text-[10px] font-black uppercase opacity-80 tracking-widest">Tổng đơn tại xưởng</p>
                <p className="text-2xl font-black">{workshopOrders.length}</p>
            </div>
            <Package size={32} className="opacity-40" />
         </div>
         <div className="bg-amber-500 rounded-2xl p-4 text-white flex items-center justify-between shadow-lg shadow-amber-100">
            <div>
                <p className="text-[10px] font-black uppercase opacity-80 tracking-widest">Đang chờ xử lý</p>
                <p className="text-2xl font-black">{workshopOrders.filter(o => o.status === "WAITING" || o.status === "OWNER_PENDING").length}</p>
            </div>
            <Clock size={32} className="opacity-40" />
         </div>
         <div className="bg-white rounded-2xl p-4 border border-slate-200 flex items-center justify-between shadow-sm">
            <div className="relative w-full">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Tìm đơn hàng, khách hàng..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-[13px] font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none"
                />
            </div>
         </div>
      </div>

      {/* Table Card layout tương tự WorkerDashboard */}
      <div className="flex flex-col bg-white rounded-2xl flex-1 overflow-hidden border border-slate-200 shadow-sm">
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <table className="w-full text-left relative border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200">
              <tr>
                {["#", "Mã đơn hàng", "Khách hàng", "Ngày đặt", "Hạn chót", "Trạng thái", "Sản phẩm", ""].map((h, i) => (
                  <th key={i} className="px-5 py-3.5 text-[11px] font-black uppercase tracking-widest text-slate-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order, idx) => {
                const isExpanded = expandedOrderId === order.id;
                const config = STATUS_CONFIG[order.status] || STATUS_CONFIG["Chờ sản xuất"];
                const StatusIcon = config.icon;

                // Tính toán độ khẩn cấp của hạn chót
                const getDeadlineBadge = (dateStr) => {
                    if (!dateStr) return <span className="text-slate-300">—</span>;
                    
                    let d;
                    if (dateStr.includes('/')) {
                        const [day, month, year] = dateStr.split('/').map(Number);
                        d = new Date(year, month - 1, day);
                    } else {
                        d = new Date(dateStr);
                    }

                    if (isNaN(d.getTime())) return <span className="text-slate-300">—</span>;

                    const now = new Date();
                    now.setHours(0,0,0,0);
                    const diff = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
                    
                    let cls = "text-slate-600 bg-slate-50 border-slate-100";
                    if (diff <= 1) cls = "text-rose-700 bg-rose-50 border-rose-100 font-black animate-pulse";
                    else if (diff <= 3) cls = "text-amber-700 bg-amber-50 border-amber-100 font-bold";
                    
                    return (
                        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[11px] ${cls}`}>
                            {d.toLocaleDateString('vi-VN')}
                            {diff >= 0 && diff <= 3 && <span className="text-[9px] uppercase">({diff === 0 ? "Hôm nay" : `Còn ${diff}n`})</span>}
                            {diff < 0 && <span className="text-[9px] uppercase">(Quá hạn)</span>}
                        </div>
                    );
                };

                return (
                  <React.Fragment key={order.id}>
                    <tr
                      className={`transition-colors cursor-pointer group ${isExpanded ? "bg-indigo-50/30" : "hover:bg-slate-50/50"}`}
                      style={{ borderBottom: "1px solid #f1f5f9" }}
                      onClick={() => toggleOrder(order.id)}
                    >
                      <td className="px-5 py-4 text-[12px] font-black text-slate-300">
                        {idx + 1}
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-[14px] font-black font-mono tracking-tight text-slate-700 group-hover:text-indigo-600 transition-colors">
                          {order.id || order.code}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                           <div className="w-7 h-7 rounded-full bg-indigo-50 flex items-center justify-center text-[10px] font-black text-indigo-500">
                                {order.customerName?.charAt(0) || "K"}
                           </div>
                           <span className="text-[13px] font-bold text-slate-700">{order.customerName}</span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-[12px] font-bold text-slate-500">
                          {order.orderDate || (order.date ? new Date(order.date).toLocaleDateString('vi-VN') : "—")}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {(() => {
                           const deadline = order.deadline || order.deliveryDate || (order.items?.[0]?.deadline);
                           return getDeadlineBadge(deadline);
                        })()}
                      </td>

                      <td className="px-5 py-4">
                        <div
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider ${
                            order.status === "COMPLETED"
                              ? "bg-green-50 text-green-600 border-green-100"
                              : order.status === "PROCESSING"
                              ? "bg-blue-50 text-blue-600 border-blue-100"
                              : "bg-gray-50 text-gray-600 border-gray-200"
                          }`}
                        >
                          {order.status === "PROCESSING" ? "ĐANG XỬ LÝ" : order.status === "COMPLETED" ? "HOÀN THÀNH" : "CHỜ XỬ LÝ"}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-[11px] font-black px-2 py-1 bg-slate-100 rounded-lg text-slate-500 border border-slate-200">
                          {order.items?.length || 0} SP
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button className={`p-1.5 rounded-xl transition-all ${isExpanded ? "bg-indigo-100 text-indigo-600" : "text-slate-300 group-hover:bg-slate-100 group-hover:text-slate-500"}`}>
                          <ChevronDown className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} size={18} />
                        </button>
                      </td>
                    </tr>

                    {/* Nội dung mở rộng hiển thị các sản phẩm trong đơn */}
                    <tr className={isExpanded ? "" : "hidden"}>
                      <td colSpan={8} className="px-6 py-4 bg-slate-50/50">
                        <div className="flex flex-col gap-3 animate-in slide-in-from-top-2 duration-300">
                          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1 ml-1">Chi tiết sản phẩm gia công (# {order.id || order.code})</h4>
                          <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-sm">
                             {order.items?.map((p, i) => (
                               <ProductItemRow key={i} item={p} />
                             ))}
                          </div>
                          
                          {/* Advice area inside expanded row */}
                          <div className="flex items-center gap-4 mt-2 px-2">
                             <div className="flex-1 p-3 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center gap-3">
                                <Info size={16} className="text-indigo-500 shrink-0" />
                                <p className="text-[12px] font-bold text-indigo-700">
                                   Lưu ý: Đơn hàng này do <span className="font-black underline">{order.salesPerson}</span> phụ trách. Cần trao đổi với xưởng trước khi dời hạn giao.
                                </p>
                             </div>
                             <button className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-[12px] font-black text-slate-500 hover:bg-slate-50 transition-all">
                                Xem chi tiết hóa đơn
                             </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}

              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-200">
                        <LayoutDashboard size={32} />
                      </div>
                      <p className="text-[14px] font-bold text-slate-400 uppercase tracking-widest">Không có dữ liệu phù hợp</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer info tương tự WorkerDashboard */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                 <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></div>
                 <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Sắp đến hạn ({"<"} 2 ngày)</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                 <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Gần hạn ({"<"} 4 ngày)</span>
              </div>
           </div>
           <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
              Dữ liệu cập nhật lúc: {new Date().toLocaleTimeString('vi-VN')}
           </p>
        </div>
      </div>
    </div>
  );
}
