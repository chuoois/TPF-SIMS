import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Eye,
  Edit,
  Clock,
  Calendar,
  User,
  Phone,
  FileText,
  Wrench,
  Settings,
  History,
} from "lucide-react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import DataTable from "@/components/control/DataTable";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useReactToPrint } from "react-to-print";
import { PrintableWarrantyCertificate } from "./PrintTemplates";
import WarrantySettings from "./WarrantySettings";
import "@/pages/owner-page/warranty/mock.js";

// Helper components
const StatusBadge = ({ status }) => {
  let style = { bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-200" };
  switch (status) {
    case "Còn hạn":
      style = { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" };
      break;
    case "Sắp hết hạn":
      style = { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" };
      break;
    case "Hết hạn":
      style = { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" };
      break;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style.bg} ${style.text} ${style.border}`}>
      {status}
    </span>
  );
};

export default function WarrantyPage() {
  const navigate = useNavigate();
  const [warranties, setWarranties] = useState([]);
  const [activeTab, setActiveTab] = useState("history"); // "history" | "settings"
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedWarranty, setSelectedWarranty] = useState(null);
  
  // Printing
  const printRef = React.useRef(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Phieu_Bao_Hanh_${selectedWarranty?.id || ""}`,
  });

  useEffect(() => {
    const rawData = localStorage.getItem("tpf_simulated_warranties");
    if (rawData) {
      let parsed = JSON.parse(rawData);
      
      // Auto-update status based on current date
      const today = new Date();
      const updated = parsed.map(w => {
        const end = new Date(w.endDate);
        const diffDays = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
        
        let newStatus = "Hết hạn";
        if (diffDays > 30) newStatus = "Còn hạn";
        else if (diffDays > 0) newStatus = "Sắp hết hạn";
        
        return { ...w, status: newStatus };
      });
      
      setWarranties(updated);
      
      // Sync back if statuses changed
      if (JSON.stringify(updated) !== rawData) {
        localStorage.setItem("tpf_simulated_warranties", JSON.stringify(updated));
      }
    }
  }, []);

  const groupedCustomers = useMemo(() => {
    // 1. Filter individual warranties first
    const filtered = warranties.filter((w) => {
      const matchSearch = 
        (w.customerName || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
        (w.id || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (w.phone || "").includes(searchQuery) ||
        (w.productName || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === "Tất cả" || w.status === statusFilter;
      return matchSearch && matchStatus;
    });

    // 2. Group by phone
    const groups = filtered.reduce((acc, w) => {
      const key = w.phone;
      if (!acc[key]) {
        acc[key] = {
          id: key, // Used by DataTable for expansion
          customerName: w.customerName || "Khách ẩn danh",
          phone: w.phone || "---",
          items: [],
          statusCounts: { "Còn hạn": 0, "Sắp hết hạn": 0, "Hết hạn": 0 }
        };
      }
      acc[key].items.push(w);
      acc[key].statusCounts[w.status]++;
      return acc;
    }, {});

    return Object.values(groups);
  }, [warranties, searchQuery, statusFilter]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const paginatedData = useMemo(() => {
    return groupedCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [groupedCustomers, currentPage, itemsPerPage]);

  const handleOpenDetail = (warranty) => {
    setSelectedWarranty(warranty);
    setModalOpen(true);
  };

  const columns = [
    {
      header: "Khách Hàng",
      key: "customerName",
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
            {(item.customerName || "?").charAt(0)}
          </div>
          <div>
            <div className="font-semibold text-gray-800">{item.customerName}</div>
            <div className="text-xs text-gray-500">{item.phone}</div>
          </div>
        </div>
      )
    },
    {
      header: "Số Lượng Phiếu",
      key: "count",
      className: "text-center",
      headerClassName: "text-center",
      render: (item) => (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-700">
          <FileText size={14} className="text-gray-400" />
          {item.items.length}
        </div>
      )
    },
    {
      header: "Tóm Tắt Trạng Thái",
      key: "statusSummary",
      render: (item) => (
        <div className="flex gap-2">
          {item.statusCounts["Còn hạn"] > 0 && (
            <span className="px-2 py-0.5 rounded-md bg-green-50 text-green-700 border border-green-100 text-[10px] font-bold">
              {item.statusCounts["Còn hạn"]} Còn hạn
            </span>
          )}
          {item.statusCounts["Sắp hết hạn"] > 0 && (
            <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-bold">
              {item.statusCounts["Sắp hết hạn"]} Sắp hết
            </span>
          )}
           {item.statusCounts["Hết hạn"] > 0 && (
            <span className="px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-100 text-[10px] font-bold">
              {item.statusCounts["Hết hạn"]} Hết hạn
            </span>
          )}
        </div>
      )
    }
  ];

  const renderWarrantyDetail = (customer) => {
    return (
      <div className="p-4 bg-gray-50/50 border-y border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customer.items.map((w) => (
            <div key={w.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all group relative">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-[10px] font-mono text-indigo-500 font-bold bg-indigo-50 px-1.5 py-0.5 rounded mb-1 inline-block">
                    {w.id}
                  </span>
                  <h5 className="font-bold text-gray-800 text-sm line-clamp-1">{w.productName}</h5>
                </div>
                <StatusBadge status={w.status} />
              </div>
              
              <div className="space-y-2 text-xs text-gray-500 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar size={12} className="text-indigo-400" />
                  <span className="font-medium text-gray-700">
                    {format(new Date(w.startDate), "dd/MM/yyyy")} - {format(new Date(w.endDate), "dd/MM/yyyy")}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-gray-50">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] uppercase font-bold text-gray-400">Chất liệu</span>
                    <span className="font-semibold text-gray-700 truncate">{w.material || "Gỗ tự nhiên"}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] uppercase font-bold text-gray-400">Kích thước</span>
                    <span className="font-semibold text-gray-700 truncate">{w.size || "Chuẩn"}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenDetail(w);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-[11px] font-bold hover:bg-indigo-100 transition-colors"
                >
                  <Eye size={12} /> CHI TIẾT
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/owner/warranty/repairs", { state: { prefill: w } });
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border ${
                    w.status === "Hết hạn" 
                      ? "bg-red-50 text-red-600 border-red-100 hover:bg-red-100" 
                      : "bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100"
                  }`}
                >
                  <Wrench size={12} /> {w.status === "Hết hạn" ? "SỬA CHỮA DỊCH VỤ" : "TIẾP NHẬN BẢO HÀNH"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <PageHelmet title="Quản lý Bảo Hành" />

      {/* Header Info */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
          <ShieldCheck className="text-[var(--brand-primary)]" />
          Phiếu Bảo Hành & Bảo Trì
        </h1>
        
        <div className="flex bg-gray-100 p-1 rounded-xl w-fit mb-6">
          <button 
            onClick={() => setActiveTab("history")}
            className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'history' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <History size={16} /> LỊCH SỬ PHIẾU
          </button>
          <button 
            onClick={() => setActiveTab("settings")}
            className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'settings' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Settings size={16} /> CẤU HÌNH CHÍNH SÁCH
          </button>
        </div>

        {activeTab === "history" ? (
          <div className="flex gap-6">
             <div className="flex flex-col">
               <span className="text-sm text-gray-500">Tổng phiếu</span>
               <span className="text-2xl font-bold text-gray-800">
                 {warranties.length}
               </span>
             </div>
             <div className="flex flex-col">
               <span className="text-sm text-gray-500">Còn hạn</span>
               <span className="text-2xl font-bold text-green-600">
                 {warranties.filter(w => w.status === "Còn hạn").length}
               </span>
             </div>
             <div className="flex flex-col">
               <span className="text-sm text-gray-500">Sắp hết hạn</span>
               <span className="text-2xl font-bold text-amber-600">
                 {warranties.filter(w => w.status === "Sắp hết hạn").length}
               </span>
             </div>
          </div>
        ) : (
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 uppercase font-black text-[10px] tracking-widest text-blue-500">Thiết lập đặc quyền</span>
            <span className="text-lg font-bold text-slate-800">Cài đặt quy tắc bảo hành cho Xưởng Trọng Phóng</span>
          </div>
        )}
      </div>

      {activeTab === "history" ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex flex-wrap gap-4 justify-between items-center bg-gray-50/50">
             <div className="flex gap-4">
               {/* Search */}
               <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Tìm mã phiếu, khách hàng..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-[280px] border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition-all bg-white"
                />
              </div>

              {/* Status Filter */}
              <div className="flex bg-white border border-gray-200 rounded-lg p-1">
                 {["Tất cả", "Còn hạn", "Sắp hết hạn", "Hết hạn"].map(st => (
                   <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                        statusFilter === st 
                          ? "bg-[var(--brand-primary)] text-white" 
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                   >
                     {st}
                   </button>
                 ))}
              </div>
             </div>
          </div>

          <DataTable
            columns={columns}
            data={paginatedData}
            renderDetail={renderWarrantyDetail}
            pagination={{
              total: groupedCustomers.length,
              currentPage,
              setCurrentPage,
              itemsPerPage,
              setItemsPerPage
            }}
          />
        </div>
      ) : (
        <WarrantySettings />
      )}

      {/* Detail Modal */}
      {modalOpen && selectedWarranty && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
               <div>
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    Chi tiết Phiếu Bảo Hành
                    <span className="font-mono text-sm text-[var(--brand-primary)] bg-blue-50 px-2 py-0.5 rounded-md">
                      {selectedWarranty.id}
                    </span>
                  </h3>
               </div>
               <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                  <XCircle size={20} className="text-gray-500" />
               </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-6">
               
               {/* Status Banner */}
               <div className={`p-4 rounded-lg flex items-center gap-3 ${
                 selectedWarranty.status === 'Còn hạn' ? 'bg-green-50 border border-green-200' :
                 selectedWarranty.status === 'Sắp hết hạn' ? 'bg-amber-50 border border-amber-200' :
                 'bg-red-50 border border-red-200'
               }`}>
                  {selectedWarranty.status === 'Còn hạn' && <ShieldCheck className="text-green-600" />}
                  {selectedWarranty.status === 'Sắp hết hạn' && <AlertTriangle className="text-amber-600" />}
                  {selectedWarranty.status === 'Hết hạn' && <XCircle className="text-red-600" />}
                  
                  <div>
                    <h4 className={`font-bold ${
                      selectedWarranty.status === 'Còn hạn' ? 'text-green-700' :
                      selectedWarranty.status === 'Sắp hết hạn' ? 'text-amber-700' :
                      'text-red-700'
                    }`}>
                      {selectedWarranty.status}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Hiệu lực: {format(new Date(selectedWarranty.startDate), "dd/MM/yyyy")} - {format(new Date(selectedWarranty.endDate), "dd/MM/yyyy")}
                      ({selectedWarranty.warrantyMonths} tháng)
                    </p>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-6">
                 {/* Customer Info */}
                 <div className="space-y-3">
                    <h5 className="font-semibold text-gray-700 flex items-center gap-2 border-b pb-2">
                      <User size={16}/> Khách hàng
                    </h5>
                    <div className="space-y-1 text-sm">
                       <p><span className="text-gray-500 w-24 inline-block">Họ tên:</span> <span className="font-medium text-gray-800">{selectedWarranty.customerName}</span></p>
                       <p><span className="text-gray-500 w-24 inline-block">Điện thoại:</span> <span className="font-medium text-gray-800">{selectedWarranty.phone}</span></p>
                    </div>
                 </div>

                 {/* Product Info */}
                 <div className="space-y-3">
                    <h5 className="font-semibold text-gray-700 flex items-center gap-2 border-b pb-2">
                      <FileText size={16}/> Sản phẩm
                    </h5>
                    <div className="space-y-1 text-sm">
                       <p><span className="text-gray-500 w-24 inline-block">Tên SP:</span> <span className="font-medium text-gray-800">{selectedWarranty.productName}</span></p>
                       <p><span className="text-gray-500 w-24 inline-block">Mã SP:</span> <span className="font-medium text-gray-800">{selectedWarranty.productCode}</span></p>
                    </div>
                 </div>
               </div>

               {/* Notes */}
               {selectedWarranty.notes && (
                 <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                   <h5 className="font-semibold text-gray-700 mb-2">Ghi chú bảo hành</h5>
                   <p className="text-sm text-gray-600">{selectedWarranty.notes}</p>
                 </div>
               )}

               {/* Maintenance History */}
               <div className="space-y-3">
                  <h5 className="font-semibold text-gray-700 flex items-center gap-2 border-b pb-2">
                    <Clock size={16}/> Lịch sử bảo trì / sửa chữa
                  </h5>
                  {selectedWarranty.maintenanceHistory.length > 0 ? (
                    <div className="space-y-3">
                      {selectedWarranty.maintenanceHistory.map((hist, idx) => (
                        <div key={idx} className="flex gap-4 p-3 border border-gray-100 rounded-lg bg-gray-50 mt-2">
                           <div className="text-sm font-medium text-gray-500 shrink-0">
                             {format(new Date(hist.date), "dd/MM/yyyy")}
                           </div>
                           <div className="text-sm">
                             <p className="text-gray-800 font-medium mb-1">{hist.notes}</p>
                             <p className="text-xs text-gray-500">Kỹ thuật viên: {hist.technician}</p>
                           </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">Chưa có lịch sử bảo trì.</p>
                  )}
               </div>

            </div>

             {/* Footer */}
             <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
                >
                  In Phiếu
                </button>
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-[var(--brand-primary)] text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-md shadow-green-500/20"
                >
                  Đóng
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Hidden Print Content */}
      <div style={{ display: "none" }}>
        {selectedWarranty && (
          <div ref={printRef}>
             <PrintableWarrantyCertificate warranty={selectedWarranty} />
          </div>
        )}
      </div>
    </div>
  );
}
