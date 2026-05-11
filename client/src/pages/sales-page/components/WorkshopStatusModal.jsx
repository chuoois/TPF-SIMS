/**
 * WorkshopStatusModal
 * Popup xem nhanh tiến độ xưởng ngay tại màn hình bán hàng
 * Giúp Sales check nhanh tải trọng xưởng để hẹn ngày khách
 */

import React, { useState } from "react";
import { 
  Hammer, Clock, Search, X, Calendar
} from "lucide-react";
// Mock data moved here after cleanup of worker-page/mock.js
const MOCK_ORDERS = [
  {
    id: "ORD-2023-001",
    customerName: "Nguyễn Văn A",
    status: "PROCESSING",
    items: [
      {
        id: "ITEM-101",
        productName: "Bàn ăn gỗ sồi tân cổ điển",
        picture: "https://images.unsplash.com/photo-1577140917170-285929fb55b7?q=80&w=200",
        size: "120x80x75 cm",
        type: "Gỗ sồi Nga",
        color: "Màu tự nhiên",
        quantity: 1,
        status: "WAITING",
        deadline: "26/10/2023",
      },
    ],
  },
  {
    id: "ORD-2023-002",
    customerName: "Trần Thị Cẩm Tú",
    status: "PROCESSING",
    items: [
      {
        id: "ITEM-201",
        productName: "Tủ quần áo MDF 4 cánh",
        picture: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=200",
        size: "200x60x220 cm",
        type: "Gỗ MDF chống ẩm",
        color: "Trắng vân gỗ",
        quantity: 1,
        status: "INSPECTION",
        deadline: "28/10/2023",
      },
    ],
  },
];
import DataTable from "@/components/control/DataTable";
import { formatShortDateVN, formatDateTimeVN, nowVN } from "@/lib/dateUtils";

export default function WorkshopStatusModal({ isOpen, onClose }) {
  const [searchTerm, setSearchTerm] = useState("");

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
    if (!dateStr) return <span className="text-gray-300">—</span>;
    let d;
    if (dateStr.includes('/')) {
        const [day, month, year] = dateStr.split('/').map(Number);
        d = new Date(year, month - 1, day);
    } else { d = new Date(dateStr); }
    if (isNaN(d.getTime())) return <span className="text-gray-300">—</span>;

    const now = nowVN();
    now.setHours(0,0,0,0);
    const diff = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
    
    let cls = "text-gray-600 bg-gray-50 border-gray-100";
    if (diff <= 1) cls = "text-rose-700 bg-rose-50 border-rose-100 font-black animate-pulse";
    else if (diff <= 3) cls = "text-amber-700 bg-amber-50 border-amber-100 font-bold";
    
    return (
        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] ${cls}`}>
            <Calendar size={10} />
            {formatShortDateVN(d)}
            {diff >= 0 && diff <= 3 && <span className="text-[8px] uppercase">{diff === 0 ? "Hnay" : `${diff}n`}</span>}
        </div>
    );
  };

  const columns = [
    {
      header: "Mã đơn",
      key: "id",
      className: "font-black font-mono text-gray-700",
    },
    {
      header: "Khách hàng",
      key: "customerName",
      className: "font-bold text-gray-600",
    },
    {
      header: "Trạng thái",
      render: (order) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
            order.status === "PROCESSING"
              ? "bg-blue-50 text-blue-600 border-blue-100"
              : order.status === "INSPECTION"
                ? "bg-purple-50 text-purple-600 border-purple-100"
                : "bg-gray-50 text-gray-500 border-gray-200"
          }`}
        >
          {order.status === "PROCESSING"
            ? "ĐANG XỬ LÝ"
            : order.status === "INSPECTION"
              ? "NGHIỆM THU"
              : "CHỜ LÀM"}
        </span>
      ),
    },
    {
      header: "Hạn chót",
      render: (order) => {
        const deadlines = order.items?.map((i) => i.deadline).filter(Boolean);
        if (!deadlines?.length) return <span className="text-gray-300">—</span>;
        return getDeadlineBadge(deadlines[0]);
      },
    },
    {
      header: "Số lượng",
      className: "text-right pr-4",
      render: (order) => (
        <span className="text-[12px] font-black text-[var(--brand-primary)] bg-green-50 px-2 py-0.5 rounded-lg border border-green-100 whitespace-nowrap">
          {order.items?.reduce((sum, i) => sum + i.quantity, 0)} SP
        </span>
      ),
    },
  ];

  const renderItemDetail = (order) => (
    <div className="space-y-3 p-4 bg-gray-50/50">
      {order.items?.map((item, i) => (
        <div
          key={i}
          className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between group/item"
        >
          <div className="flex items-center gap-5 flex-1">
            <img
              src={item.picture}
              className="w-16 h-16 rounded-xl object-cover shadow-sm border border-gray-50"
              alt=""
            />
            <div className="grid grid-cols-4 gap-x-8 gap-y-1 flex-1">
              <div className="col-span-4">
                <p className="text-[14px] font-black text-gray-800 mb-1">
                  {item.productName}
                </p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                  Kích thước
                </p>
                <p className="text-[12px] font-bold text-gray-600">{item.size}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mt-1.5">
                  Hạn chót
                </p>
                <p className="text-[12px] font-bold text-gray-600">
                  {item.deadline || "---"}
                </p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                  Loại
                </p>
                <p className="text-[12px] font-bold text-gray-600">{item.type}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                  Màu sắc
                </p>
                <p className="text-[12px] font-bold text-gray-600">{item.color}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                  Số lượng
                </p>
                <p className="text-[12px] font-black text-[var(--brand-primary)]">
                  x{item.quantity}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-3 py-1 rounded-full bg-gray-50 border border-gray-100 flex items-center gap-2">
              <Clock size={12} className="text-gray-400" />
              <span className="text-[11px] font-bold text-gray-600">Tiếp nhận</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px] animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="relative bg-white w-full max-w-5xl h-[85vh] flex flex-col rounded-lg border border-gray-100 overflow-hidden animate-in zoom-in-95 fade-in duration-200 shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0 border border-green-100">
              <Hammer size={20} className="text-[var(--brand-primary)]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 leading-none">
                Kiểm tra tải trọng xưởng
              </h3>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                Dữ liệu sản xuất thời gian thực
              </p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-all cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 px-6 py-4 bg-white border-b border-gray-50">
          <div className="p-3 rounded-xl bg-green-50 border border-green-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--brand-primary)] text-white flex items-center justify-center font-black text-[12px] shadow-sm">
              {MOCK_ORDERS.length}
            </div>
            <span className="text-[11px] font-black text-green-700 uppercase tracking-wider">
              Tổng đơn tại xưởng
            </span>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-black text-[12px] shadow-sm">
              {MOCK_ORDERS.filter((o) => o.status === "WAITING").length}
            </div>
            <span className="text-[11px] font-black text-amber-700 uppercase tracking-wider">
              Chờ xử lý
            </span>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center font-black text-[12px] shadow-sm">
              {MOCK_ORDERS.filter((o) => o.status === "PROCESSING").length}
            </div>
            <span className="text-[11px] font-black text-blue-700 uppercase tracking-wider">
              Đang gia công
            </span>
          </div>
        </div>

        {/* DataTable Content */}
        <div className="flex-1 overflow-hidden p-6 flex flex-col bg-gray-50/10">
          <DataTable
            columns={columns}
            data={filteredOrders}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            searchPlaceholder="Tìm mã đơn, tên khách, sản phẩm..."
            renderDetail={renderItemDetail}
            pagination={{
              total: filteredOrders.length,
              currentPage: 1,
              setCurrentPage: () => {},
              itemsPerPage: 100,
              setItemsPerPage: () => {},
            }}
          />
        </div>

        {/* Footer info */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-widest">
          <div></div>
          <span>
            Dữ liệu mới nhất lúc: {formatDateTimeVN(nowVN())}
          </span>
        </div>
      </div>
    </div>
  );
}
