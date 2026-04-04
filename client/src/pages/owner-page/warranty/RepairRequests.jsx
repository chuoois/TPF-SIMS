import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Plus,
  Wrench,
  XCircle,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  ShieldCheck,
  Truck,
  User,
  Phone,
  Package
} from "lucide-react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import DataTable from "@/components/control/DataTable";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { useReactToPrint } from "react-to-print";
import { PrintableRepairInvoice } from "./PrintTemplates";
import "@/pages/owner-page/warranty/mock.js";

const StatusBadge = ({ status }) => {
  let style = { bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-200" };
  switch (status) {
    case "Chờ xử lý":
      style = { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" };
      break;
    case "Đang thực hiện":
      style = { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" };
      break;
    case "Hoàn thành":
      style = { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" };
      break;
    case "Đã hủy":
      style = { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" };
      break;
  }

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${style.bg} ${style.text} ${style.border}`}>
      {status}
    </span>
  );
};

export default function RepairRequests() {
  const [requests, setRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState(null);
  const [editReq, setEditReq] = useState(null);
  const [newService, setNewService] = useState({ name: "", type: "Dịch vụ", cost: "" });

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newReq, setNewReq] = useState(() => ({
     customerName: "",
     phone: "",
     productName: "",
     issueDescription: "",
     repairCategory: "Lỗi Mộc",
     repairMethod: "Tại nhà",
     transportFee: 0,
     isWarrantyCovered: false,
     technician: "",
     promisedDate: new Date(Date.now() + 86400000 * 3).toISOString()
  }));

  const printRef = React.useRef(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Phieu_Sua_Chua_${editReq?.id || ""}`,
  });

  const loadData = () => {
    const rawData = localStorage.getItem("tpf_simulated_repair_requests");
    if (rawData) {
      setRequests(JSON.parse(rawData));
    }
  };

  useEffect(() => {
    loadData();
    // Listen for changes from other tabs (Driver Portal)
    window.addEventListener("storage", loadData);
    return () => window.removeEventListener("storage", loadData);
  }, []);

  // Update modal state if storage changes while modal is open
  useEffect(() => {
    if (modalOpen && editReq) {
        const current = requests.find(r => r.id === editReq.id);
        if (current && current.status !== editReq.status) {
            setEditReq(current);
            setSelectedReq(current);
            toast.info(`Trạng thái đã được cập nhật bởi Lái xe: ${current.status}`);
        }
    }
  }, [requests, modalOpen]);

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchSearch = String(r.customerName || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
                          String(r.id || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                          String(r.phone || "").includes(searchQuery);
      const matchStatus = statusFilter === "Tất cả" || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [requests, searchQuery, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const paginatedData = useMemo(() => {
    return filteredRequests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [filteredRequests, currentPage, itemsPerPage]);

  const handleOpenDetail = (req) => {
    setSelectedReq(req);
    setEditReq(JSON.parse(JSON.stringify(req)));
    setNewService({ name: "", type: "Dịch vụ", cost: "" });
    setModalOpen(true);
  };

  const handleCreate = () => {
    if (!newReq.customerName || !newReq.productName || !newReq.issueDescription) {
       toast.error("Vui lòng nhập đủ thông tin yêu cầu!");
       return;
    }
    const id = `YC-${new Date().getFullYear()}-00${requests.length + 1}`;
    const newRequestData = {
        ...newReq,
        id,
        requestDate: new Date().toISOString(),
        promisedDate: newReq.promisedDate || new Date(Date.now() + 86400000 * 3).toISOString(),
        status: "Chờ xử lý",
        technician: newReq.technician || "",
        services: [],
        totalCost: Number(newReq.transportFee) || 0,
        warrantyId: newReq.isWarrantyCovered ? `BH-CUSTOM` : null
    };

    const newReqs = [newRequestData, ...requests];
    setRequests(newReqs);
    localStorage.setItem("tpf_simulated_repair_requests", JSON.stringify(newReqs));
    
    setNewReq({ 
      customerName: "", 
      phone: "", 
      productName: "", 
      issueDescription: "", 
      repairCategory: "Lỗi Mộc", 
      repairMethod: "Tại nhà",
      transportFee: 0,
      isWarrantyCovered: false,
      technician: "",
      promisedDate: new Date(Date.now() + 86400000 * 3).toISOString()
    });
    setCreateModalOpen(false);
    toast.success("Tạo yêu cầu mới thành công!");
  };

  const handleSave = (statusOverride) => {
       const finalReq = { ...editReq };
       if (statusOverride) {
           finalReq.status = statusOverride;
       }
       const updatedReqs = requests.map(r => r.id === finalReq.id ? finalReq : r);
       setRequests(updatedReqs);
       localStorage.setItem("tpf_simulated_repair_requests", JSON.stringify(updatedReqs));
       
       setSelectedReq(finalReq);
       setEditReq(finalReq);
       
       toast.success("Đã cập nhật yêu cầu!");
       if (statusOverride === "Hoàn thành" || statusOverride === "Đã hủy") {
           setModalOpen(false);
       }
  };

  const handleAddService = () => {
        if (!newService.name) return;
        const costNum = Number(newService.cost) || 0;
        const updatedServices = [...editReq.services, { ...newService, cost: costNum }];
        const serviceTotal = updatedServices.reduce((acc, curr) => acc + curr.cost, 0);
        const finalTotal = serviceTotal + (Number(editReq.transportFee) || 0);
        setEditReq({ ...editReq, services: updatedServices, totalCost: finalTotal });
        setNewService({ name: "", type: "Dịch vụ", cost: "" });
  };

  const handleRemoveService = (idx) => {
        const updatedServices = editReq.services.filter((_, i) => i !== idx);
        const serviceTotal = updatedServices.reduce((acc, curr) => acc + curr.cost, 0);
        const finalTotal = serviceTotal + (Number(editReq.transportFee) || 0);
        setEditReq({ ...editReq, services: updatedServices, totalCost: finalTotal });
  };

  const handleTransportFeeChange = (val) => {
      const valNum = Number(val) || 0;
      const currentServicesTotal = editReq.services.reduce((acc, curr) => acc + curr.cost, 0);
      setEditReq({ ...editReq, transportFee: valNum, totalCost: currentServicesTotal + valNum });
  };

  const columns = [
    {
      header: "Mã Yêu Cầu",
      key: "id",
      render: (item) => <span className="font-mono text-amber-600 font-bold">{item.id}</span>
    },
    {
      header: "Khách Hàng",
      key: "customerName",
      render: (item) => (
        <div>
          <div className="font-semibold text-gray-800">{item.customerName}</div>
          <div className="text-xs text-gray-500">{item.phone}</div>
        </div>
      )
    },
    {
       header: "Hình thức",
       key: "repairMethod",
       render: (item) => (
          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
            item.repairMethod === 'Tại nhà' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-purple-50 text-purple-600 border-purple-100'
          }`}>
            {item.repairMethod}
          </span>
       )
    },
    {
      header: "Trạng Thái",
      key: "status",
      render: (item) => <StatusBadge status={item.status} />
    },
    {
      header: "Thao Tác",
      key: "actions",
      render: (item) => (
        <button onClick={() => handleOpenDetail(item)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer">
          <Eye size={18} />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHelmet title="Yêu Cầu Sửa Chữa" />

      {/* Header Info */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center bg-gradient-to-r from-white to-slate-50">
        <div>
            <h1 className="text-xl font-black text-slate-800 flex items-center gap-2 mb-1">
            <Wrench className="text-amber-500" />
            QUẢN LÝ SỬA CHỮA
            </h1>
            <p className="text-xs text-slate-500 font-medium italic">Giao diện rút gọn - TRỌNG PHÓNG ERP</p>
        </div>
        <button 
           onClick={() => setCreateModalOpen(true)}
           className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-100 cursor-pointer"
        >
            <Plus size={20} /> Tạo phiếu mới
        </button>
      </div>

       {/* Grid Summary */}
       <div className="grid grid-cols-4 gap-4">
           {[
               { label: "Tổng tiếp nhận", count: requests.length, color: "text-slate-700", bg: "bg-white", icon: FileText },
               { label: "Chờ xử lý", count: requests.filter(r => r.status === "Chờ xử lý").length, color: "text-blue-600", bg: "bg-blue-50/30", icon: Clock },
               { label: "Đang thực hiện", count: requests.filter(r => r.status === "Đang thực hiện").length, color: "text-amber-600", bg: "bg-amber-50/30", icon: Truck },
               { label: "Hoàn thành", count: requests.filter(r => r.status === "Hoàn thành").length, color: "text-green-600", bg: "bg-green-50/30", icon: CheckCircle2 }
           ].map((stat, idx) => {
                const Icon = stat.icon;
                return (
                    <div key={idx} className={`p-5 rounded-2xl border border-slate-100 ${stat.bg} shadow-sm`}>
                        <div className="flex items-center gap-4">
                            <div className={`p-2.5 rounded-xl bg-white shadow-sm ${stat.color}`}>
                                <Icon size={22} />
                            </div>
                            <div>
                                <h4 className="text-xs text-slate-500 font-bold uppercase tracking-tighter">{stat.label}</h4>
                                <span className={`text-2xl font-black ${stat.color}`}>{stat.count}</span>
                            </div>
                        </div>
                    </div>
                )
           })}
       </div>

      {/* Filters & Table */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
        <div className="p-4 flex flex-wrap gap-4 justify-between items-center border-b border-slate-50">
           <div className="flex gap-4 items-center">
             <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Tìm tên khách, mã phiếu..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 pr-4 py-2.5 w-[300px] border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 bg-slate-50" />
            </div>
            <div className="flex bg-slate-100 p-1 rounded-xl">
               {["Tất cả", "Chờ xử lý", "Đang thực hiện", "Hoàn thành"].map(st => (
                 <button key={st} onClick={() => setStatusFilter(st)} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${statusFilter === st ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                   {st.toUpperCase()}
                 </button>
               ))}
            </div>
           </div>
        </div>

        <DataTable columns={columns} data={paginatedData} pagination={{ total: filteredRequests.length, currentPage, setCurrentPage, itemsPerPage, setItemsPerPage }} />
      </div>

       {/* Detail Modal */}
       {modalOpen && selectedReq && editReq && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
               <div className="flex items-center gap-3">
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">CHI TIẾT PHIẾU XỬ LÝ</h3>
                  <span className="font-mono text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">{editReq.id}</span>
               </div>
               <div className="flex items-center gap-2">
                   <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"><XCircle size={24} className="text-slate-400" /></button>
               </div>
            </div>

            {/* Body */}
            <div className="p-8 overflow-y-auto bg-white flex-1 space-y-8">
                <div className="grid grid-cols-12 gap-8">
                    {/* Left contents */}
                    <div className="col-span-8 space-y-8">
                        <section className="bg-slate-50 rounded-2xl p-6 border border-slate-100 relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-4"><StatusBadge status={editReq.status} /></div>
                             <div className="space-y-4">
                                 <div>
                                     <h4 className="text-2xl font-black text-slate-800 mb-1">{editReq.productName}</h4>
                                     <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
                                        <span className="flex items-center gap-1"><User size={16} /> {editReq.customerName}</span>
                                        <span className="flex items-center gap-1"><Phone size={16} /> {editReq.phone}</span>
                                     </div>
                                 </div>
                                 <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-200/60">
                                     <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Hình thức xử lý</label>
                                        <span className="font-bold text-amber-600">{editReq.repairMethod} - {editReq.repairCategory}</span>
                                     </div>
                                     <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Hẹn trả khách</label>
                                        <span className="font-bold text-blue-600 italic">{format(new Date(editReq.promisedDate), "dd/MM/yyyy HH:mm")}</span>
                                     </div>
                                 </div>
                                 <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mt-4">
                                     <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Ghi nhận lỗi ban đầu</label>
                                     <p className="text-sm text-slate-700 italic">"{editReq.issueDescription}"</p>
                                 </div>
                             </div>
                        </section>

                        <section className="space-y-4">
                             <h4 className="text-sm font-black text-slate-800 flex items-center gap-2 uppercase tracking-widest"><FileText size={18} className="text-blue-500" /> Hạng mục sửa chữa & Chi phí</h4>
                             <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                                 <table className="w-full text-sm">
                                     <thead className="bg-slate-50 border-b border-slate-200">
                                         <tr className="text-[10px] font-black text-slate-400 uppercase">
                                             <th className="px-5 py-3 text-left">Hạng mục</th>
                                             <th className="px-5 py-3 text-right">Chi phí (đ)</th>
                                             {editReq.status !== "Hoàn thành" && <th className="px-5 py-3 w-10"></th>}
                                         </tr>
                                     </thead>
                                     <tbody className="divide-y divide-slate-100">
                                         {editReq.services.map((srv, idx) => (
                                             <tr key={idx} className="group hover:bg-slate-50/50">
                                                 <td className="px-5 py-4 font-bold text-slate-800">{srv.name} <span className="text-[10px] font-medium text-slate-400 italic">({srv.type})</span></td>
                                                 <td className="px-5 py-4 text-right font-black text-slate-700">{new Intl.NumberFormat('vi-VN').format(srv.cost)}</td>
                                                 {editReq.status !== "Hoàn thành" && (
                                                     <td className="px-5 py-4 text-center">
                                                         <button onClick={() => handleRemoveService(idx)} className="text-slate-300 hover:text-red-500 cursor-pointer"><XCircle size={16} /></button>
                                                     </td>
                                                 )}
                                             </tr>
                                         ))}
                                         {editReq.status !== "Hoàn thành" && (
                                             <tr className="bg-blue-50/30">
                                                 <td className="p-3"><input type="text" placeholder="Tên việc..." value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-xs bg-white" /></td>
                                                 <td className="p-3"><input type="number" placeholder="Tiền..." value={newService.cost} onChange={e => setNewService({...newService, cost: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-xs text-right bg-white" /></td>
                                                 <td className="p-3"><button onClick={handleAddService} className="text-blue-600 p-1 hover:scale-110 transition cursor-pointer"><Plus size={20} strokeWidth={3} /></button></td>
                                             </tr>
                                         )}
                                     </tbody>
                                     <tfoot className="bg-slate-50/50 font-bold border-t border-slate-200">
                                         <tr>
                                             <td className="px-5 py-3 text-right text-slate-500 font-medium">Chi phí vận chuyển:</td>
                                             <td className="px-5 py-3 text-right">
                                                 {editReq.status !== "Hoàn thành" ? (
                                                     <input type="number" value={editReq.transportFee || 0} onChange={e => handleTransportFeeChange(e.target.value)} className="w-24 px-2 py-1 border rounded-lg text-xs text-right bg-white" />
                                                 ) : (new Intl.NumberFormat('vi-VN').format(editReq.transportFee || 0))}
                                             </td>
                                             {editReq.status !== "Hoàn thành" && <td></td>}
                                         </tr>
                                         <tr className="bg-slate-100/50">
                                             <td className="px-5 py-4 text-right text-slate-800 uppercase tracking-tighter">Tổng cộng thanh toán:</td>
                                             <td className="px-5 py-4 text-right text-xl font-black text-amber-600">{new Intl.NumberFormat('vi-VN').format(editReq.totalCost)} đ</td>
                                             {editReq.status !== "Hoàn thành" && <td></td>}
                                         </tr>
                                     </tfoot>
                                 </table>
                             </div>
                             <div className={`p-4 rounded-xl flex items-center gap-3 font-bold text-sm ${editReq.isWarrantyCovered ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                {editReq.isWarrantyCovered ? <ShieldCheck size={20} /> : <AlertCircle size={20} />}
                                {editReq.isWarrantyCovered ? 'CHẾ ĐỘ BẢO HÀNH MIỄN PHÍ' : 'DỊCH VỤ SỬA CHỮA CÓ THU PHÍ'}
                             </div>
                        </section>
                    </div>

                    {/* Right contents */}
                    <div className="col-span-4 space-y-6">
                        <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                            <h5 className="font-black text-slate-800 uppercase text-xs tracking-widest">Phân công xử lý</h5>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Người phụ trách (Lái xe/Thợ)</label>
                                <input type="text" value={editReq.technician || ""} onChange={e => setEditReq({...editReq, technician: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20" placeholder="Tên thợ..." />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Ghi chú nội bộ</label>
                                <textarea rows="4" value={editReq.notes || ""} onChange={e => setEditReq({...editReq, notes: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 text-xs italic" placeholder="Lưu ý thêm cho thợ..." />
                            </div>
                        </div>

                        <div className="bg-slate-900 rounded-3xl p-6 text-white space-y-4 shadow-xl">
                            <h5 className="font-black uppercase text-xs text-slate-400">Trạng thái vận hành</h5>
                            <div className="space-y-4">
                                {editReq.status === "Chờ xử lý" && (
                                    <button onClick={() => handleSave("Đang thực hiện")} className="w-full bg-blue-600 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition cursor-pointer shadow-lg shadow-blue-900/40">
                                        <Truck size={20} /> BẮT ĐẦU THỰC HIỆN
                                    </button>
                                )}
                                {editReq.status === "Đang thực hiện" && (
                                     <button onClick={() => handleSave("Hoàn thành")} className="w-full bg-green-600 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-green-700 transition cursor-pointer shadow-lg shadow-green-900/40">
                                        <CheckCircle2 size={20} /> HOÀN THÀNH PHIẾU
                                    </button>
                                )}
                                {editReq.status === "Hoàn thành" && (
                                    <div className="text-center py-4 bg-white/10 rounded-2xl border border-white/20">
                                        <CheckCircle2 size={32} className="mx-auto text-green-400 mb-2" />
                                        <p className="font-bold text-sm">CÔNG VIỆC ĐÃ KẾT THÚC</p>
                                    </div>
                                )}
                                <button onClick={() => handleSave(null)} className="w-full bg-white/20 py-3 rounded-xl font-bold text-xs hover:bg-white/30 transition cursor-pointer">
                                    LƯU THÔNG TIN CẬP NHẬT
                                </button>
                                {editReq.status !== "Hoàn thành" && editReq.status !== "Đã hủy" && (
                                    <button onClick={() => handleSave("Đã hủy")} className="w-full bg-transparent text-red-400 py-2 font-bold text-xs hover:text-red-300 transition cursor-pointer">
                                        Hủy phiểu xử lý
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print Hidden container */}
            <div style={{ display: "none" }}>
                <div ref={printRef}>
                    <PrintableRepairInvoice request={editReq} />
                </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-2.5 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-900 transition shadow-lg cursor-pointer">
                    IN PHIẾU BÀN GIAO
                </button>
                <button onClick={() => setModalOpen(false)} className="px-8 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 transition cursor-pointer">
                    ĐÓNG CỬA SỔ
                </button>
            </div>
          </div>
        </div>
       )}

       {/* Create Modal */}
       {createModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
               <h3 className="text-xl font-black text-slate-800">TẠO MỚI YÊU CẦU</h3>
               <button onClick={() => setCreateModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"><XCircle size={24} className="text-slate-400" /></button>
            </div>

            <div className="p-8 overflow-y-auto space-y-5 bg-white flex-1">
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Khách Hàng</label>
                    <input type="text" value={newReq.customerName} onChange={e => setNewReq({...newReq, customerName: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 text-sm" placeholder="Tên khách..." />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Số điện thoại</label>
                    <input type="text" value={newReq.phone} onChange={e => setNewReq({...newReq, phone: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 text-sm" placeholder="SĐT..." />
                  </div>
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase">Tên Sản Phẩm</label>
                 <input type="text" value={newReq.productName} onChange={e => setNewReq({...newReq, productName: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 text-sm" placeholder="Ví dụ: Giường mộc 1m8" />
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Loại lỗi</label>
                    <select value={newReq.repairCategory} onChange={e => setNewReq({...newReq, repairCategory: e.target.value})} className="w-full px-3 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 font-bold text-slate-700 cursor-pointer">
                        <option value="Lỗi Mộc">Lỗi Mộc</option>
                        <option value="Lỗi Sơn PU">Lỗi Sơn PU</option>
                        <option value="Lỗi Phụ Kiện">Lỗi Phụ Kiện</option>
                        <option value="Khác">Khác</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Ngày hẹn trả</label>
                    <input type="date" value={newReq.promisedDate ? newReq.promisedDate.split('T')[0] : ''} onChange={e => setNewReq({...newReq, promisedDate: new Date(e.target.value).toISOString()})} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 text-sm font-bold text-blue-600" />
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Phương án</label>
                    <select value={newReq.repairMethod} onChange={e => setNewReq({...newReq, repairMethod: e.target.value, transportFee: e.target.value === 'Về xưởng' ? 200000 : 0})} className="w-full px-3 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 font-bold text-slate-700 cursor-pointer">
                        <option value="Tại nhà">Sửa tại nhà</option>
                        <option value="Về xưởng">Bốc về xưởng</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Chế độ</label>
                    <select value={newReq.isWarrantyCovered.toString()} onChange={e => setNewReq({...newReq, isWarrantyCovered: e.target.value === "true"})} className="w-full px-3 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 font-bold text-slate-700 cursor-pointer">
                        <option value="true">Bảo hành (0đ)</option>
                        <option value="false">Có tính phí</option>
                    </select>
                  </div>
               </div>

               <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase">Thợ phụ trách (Nếu có)</label>
                 <input type="text" value={newReq.technician || ""} onChange={e => setNewReq({...newReq, technician: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 text-sm" placeholder="Tên thợ..." />
               </div>

               <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase">Mô tả tình trạng lỗi</label>
                 <textarea rows={2} value={newReq.issueDescription} onChange={e => setNewReq({...newReq, issueDescription: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 text-sm italic" placeholder="Lỗi như thế nào..." />
               </div>

               {newReq.repairMethod === "Về xưởng" && (
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-center justify-between">
                     <span className="text-xs font-bold text-amber-700 uppercase tracking-tighter">Phí xe tải dự kiến:</span>
                     <div className="flex items-center gap-1">
                        <input type="number" value={newReq.transportFee} onChange={e => setNewReq({...newReq, transportFee: Number(e.target.value) || 0})} className="w-24 px-2 py-1 bg-white border border-amber-200 rounded-lg text-right text-sm font-bold" />
                        <span className="text-xs font-bold text-amber-500">đ</span>
                     </div>
                  </div>
               )}
            </div>

            <div className="px-8 py-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-4">
                 <button onClick={() => setCreateModalOpen(false)} className="px-6 py-3 border border-slate-200 text-slate-600 rounded-2xl font-bold text-sm bg-white cursor-pointer">Hủy</button>
                 <button onClick={handleCreate} className="px-10 py-3 bg-green-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-green-200 hover:bg-green-700 transition cursor-pointer">TẠO PHIẾU NGAY</button>
            </div>
          </div>
        </div>
       )}
    </div>
  );
}
