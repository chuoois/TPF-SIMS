import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import {
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
  X,
} from "lucide-react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import DataTable from "@/components/control/DataTable";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { useReactToPrint } from "react-to-print";
import { PrintableRepairInvoice } from "./PrintTemplates";
import "@/pages/owner-page/warranty/mock.js";

// ─── Status Badge ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  "Chờ xử lý":     { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  "Đang thực hiện":{ bg: "#FFFBEB", text: "#D97706", border: "#FDE68A" },
  "Hoàn thành":    { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
  "Đã hủy":        { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA" },
};

const StatusBadge = ({ status }) => {
  const sc = STATUS_CONFIG[status] || { bg: "#F3F4F6", text: "#6B7280", border: "#E5E7EB" };
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-bold border whitespace-nowrap"
      style={{ backgroundColor: sc.bg, color: sc.text, borderColor: sc.border }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: sc.text }} />
      {status}
    </span>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
export default function RepairRequests() {
  const location = useLocation();
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
    customerName: "", phone: "", productName: "",
    issueDescription: "", repairCategory: "Lỗi Mộc",
    repairMethod: "Tại nhà", transportFee: 0,
    isWarrantyCovered: false, damageSource: "Lỗi Sản xuất",
    technician: "", promisedDate: new Date(Date.now() + 86400000 * 3).toISOString(),
  }));

  const printRef = React.useRef(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Phieu_Sua_Chua_${editReq?.id || ""}`,
  });

  const loadData = () => {
    const rawData = localStorage.getItem("tpf_simulated_repair_requests");
    if (rawData) setRequests(JSON.parse(rawData));
  };

  useEffect(() => {
    loadData();
    window.addEventListener("storage", loadData);
    if (location.state?.prefill) {
      const data = location.state.prefill;
      const isStillValid = data.status === "Còn hạn" || data.status === "Sắp hết hạn";
      setNewReq((prev) => ({
        ...prev,
        customerName: data.customerName,
        phone: data.phone,
        productName: data.productName,
        isWarrantyCovered: isStillValid,
        warrantyId: data.id,
        issueDescription: data.status === "Sắp hết hạn" ? "Kiểm tra định kỳ & Bảo trì cuối hạn" : "",
      }));
      setCreateModalOpen(true);
      window.history.replaceState({}, document.title);
    }
    return () => window.removeEventListener("storage", loadData);
  }, [location]);

  useEffect(() => {
    if (modalOpen && editReq) {
      const current = requests.find((r) => r.id === editReq.id);
      if (current && current.status !== editReq.status) {
        setEditReq(current);
        setSelectedReq(current);
        toast.info(`Trạng thái cập nhật: ${current.status}`);
      }
    }
  }, [requests, modalOpen]);

  const filteredRequests = useMemo(() =>
    requests.filter((r) => {
      const q = searchQuery.toLowerCase();
      const matchSearch = String(r.customerName || "").toLowerCase().includes(q) ||
        String(r.id || "").toLowerCase().includes(q) ||
        String(r.phone || "").includes(searchQuery);
      return matchSearch && (statusFilter === "Tất cả" || r.status === statusFilter);
    }),
    [requests, searchQuery, statusFilter]
  );

  useEffect(() => { setCurrentPage(1); }, [searchQuery, statusFilter]);

  const paginatedData = useMemo(() =>
    filteredRequests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [filteredRequests, currentPage, itemsPerPage]
  );

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
    const id = `YC-${new Date().getFullYear()}-0${requests.length + 1}`;
    const newRequestData = {
      ...newReq, id,
      requestDate: new Date().toISOString(),
      promisedDate: newReq.promisedDate || new Date(Date.now() + 86400000 * 3).toISOString(),
      status: "Chờ xử lý",
      technician: newReq.technician || "",
      services: [],
      totalCost: Number(newReq.transportFee || 0),
      warrantyId: newReq.warrantyId || (newReq.isWarrantyCovered ? "WA-NEW" : null),
      damageSource: newReq.damageSource,
      paymentStatus: newReq.isWarrantyCovered ? "Bảo hành" : "Sửa chữa dịch vụ",
    };
    const newReqs = [newRequestData, ...requests];
    setRequests(newReqs);
    localStorage.setItem("tpf_simulated_repair_requests", JSON.stringify(newReqs));
    setNewReq({
      customerName: "", phone: "", productName: "",
      issueDescription: "", repairCategory: "Lỗi Mộc",
      repairMethod: "Tại nhà", transportFee: 0,
      isWarrantyCovered: false, technician: "",
      promisedDate: new Date(Date.now() + 86400000 * 3).toISOString(),
    });
    setCreateModalOpen(false);
    toast.success("Tạo phiếu yêu cầu thành công!");
  };

  const handleSave = (statusOverride) => {
    const finalReq = { ...editReq };
    if (statusOverride) finalReq.status = statusOverride;
    const updatedReqs = requests.map((r) => r.id === finalReq.id ? finalReq : r);
    setRequests(updatedReqs);
    localStorage.setItem("tpf_simulated_repair_requests", JSON.stringify(updatedReqs));

    if (statusOverride === "Hoàn thành" && finalReq.warrantyId) {
      const rawW = localStorage.getItem("tpf_simulated_warranties");
      if (rawW) {
        const ws = JSON.parse(rawW).map((w) => {
          if (w.id !== finalReq.warrantyId) return w;
          return {
            ...w,
            maintenanceHistory: [
              {
                date: new Date().toISOString(),
                notes: `[Hoàn thành - ${finalReq.id}] ${finalReq.services.map((s) => s.name).join(", ")}`,
                technician: finalReq.technician || "KTV xưởng",
              },
              ...(w.maintenanceHistory || []),
            ],
          };
        });
        localStorage.setItem("tpf_simulated_warranties", JSON.stringify(ws));
      }
    }

    setSelectedReq(finalReq);
    setEditReq(finalReq);
    toast.success("Đã cập nhật phiếu!");
    if (statusOverride === "Hoàn thành" || statusOverride === "Đã hủy") setModalOpen(false);
  };

  const handleAddService = () => {
    if (!newService.name) return;
    const cost = Number(newService.cost) || 0;
    const updated = [...editReq.services, { ...newService, cost }];
    const total = updated.reduce((a, c) => a + c.cost, 0) + (Number(editReq.transportFee) || 0);
    setEditReq({ ...editReq, services: updated, totalCost: total });
    setNewService({ name: "", type: "Dịch vụ", cost: "" });
  };

  const handleRemoveService = (idx) => {
    const updated = editReq.services.filter((_, i) => i !== idx);
    const total = updated.reduce((a, c) => a + c.cost, 0) + (Number(editReq.transportFee) || 0);
    setEditReq({ ...editReq, services: updated, totalCost: total });
  };

  const handleTransportFeeChange = (val) => {
    const v = Number(val) || 0;
    const sTotal = editReq.services.reduce((a, c) => a + c.cost, 0);
    setEditReq({ ...editReq, transportFee: v, totalCost: sTotal + v });
  };

  // ─── Stats ─────────────────────────────────────────────────────────────────
  const stats = [
    { label: "Tổng tiếp nhận",  value: requests.length, color: "var(--text-main)",   bg: "var(--bg-main)" },
    { label: "Chờ xử lý",       value: requests.filter((r) => r.status === "Chờ xử lý").length,      color: "#1D4ED8", bg: "#EFF6FF" },
    { label: "Đang thực hiện",  value: requests.filter((r) => r.status === "Đang thực hiện").length,  color: "#D97706", bg: "#FFFBEB" },
    { label: "Hoàn thành",      value: requests.filter((r) => r.status === "Hoàn thành").length,      color: "#15803D", bg: "#F0FDF4" },
  ];

  // ─── Status filter ──────────────────────────────────────────────────────────
  const STATUS_FILTERS = ["Tất cả", "Chờ xử lý", "Đang thực hiện", "Hoàn thành", "Đã hủy"];
  const extraFilters = (
    <div
      className="flex items-center gap-1 p-1 rounded-lg"
      style={{ backgroundColor: "var(--grid-header-bg)", border: "1px solid var(--grid-border)" }}
    >
      {STATUS_FILTERS.map((s) => {
        const isActive = statusFilter === s;
        const sc = STATUS_CONFIG[s];
        return (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className="px-3 py-1.5 rounded-md text-[12px] font-bold transition-all cursor-pointer"
            style={{
              backgroundColor: isActive ? (sc ? sc.bg : "#fff") : "transparent",
              color: isActive ? (sc ? sc.text : "var(--brand-primary)") : "var(--text-secondary)",
              border: isActive && sc ? `1px solid ${sc.border}` : "1px solid transparent",
            }}
          >
            {s}
          </button>
        );
      })}
    </div>
  );

  // ─── Columns ────────────────────────────────────────────────────────────────
  const columns = [
    {
      header: "Mã phiếu",
      render: (item) => (
        <span className="font-mono font-bold text-[13px]" style={{ color: "var(--brand-primary)" }}>
          {item.id}
        </span>
      ),
    },
    {
      header: "Khách hàng",
      render: (item) => (
        <div>
          <div className="font-bold text-[13px]" style={{ color: "var(--text-main)" }}>{item.customerName}</div>
          <div className="text-[11px] font-medium" style={{ color: "var(--text-placeholder)" }}>{item.phone}</div>
        </div>
      ),
    },
    {
      header: "Hình thức",
      render: (item) => (
        <span
          className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md border ${
            item.repairMethod === "Tại nhà"
              ? "bg-blue-50 text-blue-600 border-blue-100"
              : "bg-purple-50 text-purple-600 border-purple-100"
          }`}
        >
          {item.repairMethod}
        </span>
      ),
    },
    {
      header: "Trạng thái",
      render: (item) => <StatusBadge status={item.status} />,
    },
  ];

  // ─── Input field style helper ───────────────────────────────────────────────
  const inputCls = "w-full px-4 py-2.5 border rounded-xl text-[13px] font-medium outline-none transition-all";
  const inputStyle = { borderColor: "var(--grid-border)", color: "var(--text-main)", backgroundColor: "#fff" };
  const labelCls = "text-[10px] font-black uppercase tracking-widest block mb-1";
  const labelStyle = { color: "var(--text-placeholder)" };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <PageHelmet title="Quản lý Sửa Chữa | TPF-SIMS" />

      <div
        className="flex flex-col h-[calc(100vh-64px)] -m-6 p-6 space-y-4"
        style={{ backgroundColor: "var(--bg-main)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: "var(--text-main)" }}>
              <Wrench size={22} style={{ color: "var(--brand-primary)" }} />
              Quản lý sửa chữa & bảo hành
            </h1>
            <p className="text-[13px] mt-0.5 font-medium" style={{ color: "var(--text-placeholder)" }}>
              {requests.length} phiếu sửa chữa đã tiếp nhận
            </p>
          </div>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="h-10 px-6 rounded-xl flex items-center gap-2 text-[13px] font-bold text-white transition-all hover:opacity-90 shadow-sm active:scale-95 cursor-pointer"
            style={{ backgroundColor: "var(--brand-primary)" }}
          >
            <Plus size={18} /> Tạo phiếu mới
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 shrink-0">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border"
              style={{ backgroundColor: s.bg, borderColor: "var(--grid-border)" }}
            >
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--text-placeholder)" }}>
                  {s.label}
                </p>
                <p className="text-2xl font-black mt-0.5" style={{ color: s.color }}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* DataTable */}
        <DataTable
          columns={columns}
          data={paginatedData}
          searchTerm={searchQuery}
          setSearchTerm={setSearchQuery}
          searchPlaceholder="Tìm tên khách, mã phiếu, SĐT..."
          extraFilters={extraFilters}
          onRowClick={handleOpenDetail}
          rowActions={[
            {
              icon: Eye,
              label: "Xem chi tiết",
              onClick: handleOpenDetail,
            },
          ]}
          pagination={{
            total: filteredRequests.length,
            currentPage, setCurrentPage, itemsPerPage, setItemsPerPage,
          }}
        />
      </div>

      {/* ── DETAIL MODAL ── */}
      {modalOpen && selectedReq && editReq && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/30 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div
            className="bg-white rounded-lg w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200 border"
            style={{ borderColor: "var(--grid-border)" }}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b flex justify-between items-center shrink-0" style={{ borderColor: "var(--grid-border)" }}>
              <div className="flex items-center gap-3">
                <h3 className="text-[16px] font-bold" style={{ color: "var(--text-main)" }}>Chi tiết phiếu xử lý</h3>
                <span
                  className="font-mono text-[12px] font-bold px-2.5 py-0.5 rounded-lg"
                  style={{ color: "var(--brand-primary)", backgroundColor: "rgba(16,185,129,0.08)" }}
                >
                  {editReq.id}
                </span>
                <StatusBadge status={editReq.status} />
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition cursor-pointer"
                style={{ color: "var(--text-placeholder)" }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <div className="grid grid-cols-12 gap-6">
                {/* Left */}
                <div className="col-span-8 space-y-5">
                  {/* Product Info */}
                  <div className="p-5 rounded-xl border" style={{ borderColor: "var(--grid-border)", backgroundColor: "var(--bg-main)" }}>
                    <h4 className="text-[16px] font-black mb-1" style={{ color: "var(--text-main)" }}>{editReq.productName}</h4>
                    <div className="flex items-center gap-4 text-[12px] font-medium mb-4" style={{ color: "var(--text-secondary)" }}>
                      <span className="flex items-center gap-1"><User size={13} /> {editReq.customerName}</span>
                      <span className="flex items-center gap-1"><Phone size={13} /> {editReq.phone}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-3 border-t" style={{ borderColor: "var(--grid-border)" }}>
                      <div>
                        <span className={labelCls} style={labelStyle}>Hình thức & Nguyên nhân</span>
                        <div className="flex flex-col">
                          <span className="font-bold text-[13px] text-amber-600">{editReq.repairMethod} — {editReq.repairCategory}</span>
                          <span className={`text-[11px] font-bold ${editReq.damageSource === "Lỗi Sử dụng" ? "text-red-500" : "text-blue-500"}`}>
                            ({editReq.damageSource || "Lỗi Sản xuất"})
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className={labelCls} style={labelStyle}>Hẹn trả khách</span>
                        <span className="font-bold text-[13px] text-blue-600">{format(new Date(editReq.promisedDate), "dd/MM/yyyy HH:mm")}</span>
                      </div>
                    </div>
                    <div className="mt-3 p-3 rounded-lg border" style={{ borderColor: "var(--grid-border)", backgroundColor: "#fff" }}>
                      <span className={labelCls} style={labelStyle}>Ghi nhận lỗi ban đầu</span>
                      <p className="text-[13px] italic" style={{ color: "var(--text-secondary)" }}>"{editReq.issueDescription}"</p>
                    </div>
                  </div>

                  {/* Services Table */}
                  <div className="space-y-3">
                    <h4 className="text-[12px] font-black uppercase tracking-widest flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
                      <FileText size={14} style={{ color: "var(--brand-primary)" }} /> Hạng mục sửa chữa & chi phí
                    </h4>
                    <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--grid-border)" }}>
                      <table className="w-full text-[13px]">
                        <thead style={{ backgroundColor: "var(--grid-header-bg)", borderBottom: "1px solid var(--grid-border)" }}>
                          <tr className="text-[10px] font-black uppercase" style={{ color: "var(--text-placeholder)" }}>
                            <th className="px-4 py-3 text-left">Hạng mục</th>
                            <th className="px-4 py-3 text-right">Chi phí (đ)</th>
                            {editReq.status !== "Hoàn thành" && <th className="px-4 py-3 w-10" />}
                          </tr>
                        </thead>
                        <tbody className="divide-y" style={{ borderColor: "var(--grid-border)" }}>
                          {editReq.services.map((srv, idx) => (
                            <tr key={idx} className="hover:bg-[var(--bg-main)] transition-colors">
                              <td className="px-4 py-3 font-bold" style={{ color: "var(--text-main)" }}>
                                {srv.name}{" "}
                                <span className="text-[10px] font-medium" style={{ color: "var(--text-placeholder)" }}>({srv.type})</span>
                              </td>
                              <td className="px-4 py-3 text-right font-black" style={{ color: "var(--text-main)" }}>
                                {new Intl.NumberFormat("vi-VN").format(srv.cost)}
                              </td>
                              {editReq.status !== "Hoàn thành" && (
                                <td className="px-4 py-3 text-center">
                                  <button onClick={() => handleRemoveService(idx)} className="text-gray-300 hover:text-red-500 transition cursor-pointer">
                                    <XCircle size={15} />
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))}
                          {editReq.status !== "Hoàn thành" && (
                            <tr style={{ backgroundColor: "var(--bg-main)" }}>
                              <td className="p-2">
                                <input type="text" placeholder="Tên việc..." value={newService.name}
                                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                                  className="w-full px-3 py-1.5 border rounded-lg text-[12px] bg-white outline-none" style={{ borderColor: "var(--grid-border)" }} />
                              </td>
                              <td className="p-2">
                                <input type="number" placeholder="Tiền..." value={newService.cost}
                                  onChange={(e) => setNewService({ ...newService, cost: e.target.value })}
                                  className="w-full px-3 py-1.5 border rounded-lg text-[12px] text-right bg-white outline-none" style={{ borderColor: "var(--grid-border)" }} />
                              </td>
                              <td className="p-2">
                                <button onClick={handleAddService} className="text-[var(--brand-primary)] hover:scale-110 transition cursor-pointer">
                                  <Plus size={18} strokeWidth={3} />
                                </button>
                              </td>
                            </tr>
                          )}
                        </tbody>
                        <tfoot className="border-t font-bold" style={{ borderColor: "var(--grid-border)", backgroundColor: "var(--grid-header-bg)" }}>
                          <tr>
                            <td className="px-4 py-2 text-right text-[12px] font-medium" style={{ color: "var(--text-secondary)" }}>Chi phí vận chuyển:</td>
                            <td className="px-4 py-2 text-right">
                              {editReq.status !== "Hoàn thành" ? (
                                <input type="number" value={editReq.transportFee || 0}
                                  onChange={(e) => handleTransportFeeChange(e.target.value)}
                                  className="w-24 px-2 py-1 border rounded-lg text-[12px] text-right bg-white outline-none" style={{ borderColor: "var(--grid-border)" }} />
                              ) : (
                                <span className="font-bold" style={{ color: "var(--text-main)" }}>{new Intl.NumberFormat("vi-VN").format(editReq.transportFee || 0)}</span>
                              )}
                            </td>
                            {editReq.status !== "Hoàn thành" && <td />}
                          </tr>
                          <tr>
                            <td className="px-4 py-3 text-right text-[12px] font-black uppercase tracking-tighter" style={{ color: "var(--text-secondary)" }}>Tổng thanh toán:</td>
                            <td className="px-4 py-3 text-right text-[18px] font-black text-amber-600">{new Intl.NumberFormat("vi-VN").format(editReq.totalCost)} đ</td>
                            {editReq.status !== "Hoàn thành" && <td />}
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {/* Warranty coverage */}
                    <div className={`p-3 rounded-xl border flex items-center gap-2 text-[13px] font-bold ${editReq.isWarrantyCovered ? "bg-green-50 text-green-700 border-green-100" : "bg-red-50 text-red-700 border-red-100"}`}>
                      {editReq.isWarrantyCovered ? <ShieldCheck size={16} /> : <AlertCircle size={16} />}
                      {editReq.isWarrantyCovered ? "Chế độ bảo hành miễn phí" : "Dịch vụ sửa chữa có tính phí"}
                    </div>
                  </div>
                </div>

                {/* Right */}
                <div className="col-span-4 space-y-4">
                  {/* Assignee */}
                  <div className="p-4 rounded-xl border space-y-3" style={{ borderColor: "var(--grid-border)", backgroundColor: "#fff" }}>
                    <h5 className={labelCls} style={labelStyle}>Phân công xử lý</h5>
                    <div>
                      <span className={labelCls} style={labelStyle}>Người phụ trách</span>
                      <input type="text" value={editReq.technician || ""}
                        onChange={(e) => setEditReq({ ...editReq, technician: e.target.value })}
                        className={inputCls} style={inputStyle} placeholder="Tên thợ..." />
                    </div>
                    <div>
                      <span className={labelCls} style={labelStyle}>Ghi chú nội bộ</span>
                      <textarea rows={3} value={editReq.notes || ""}
                        onChange={(e) => setEditReq({ ...editReq, notes: e.target.value })}
                        className="w-full px-4 py-2.5 border rounded-xl text-[13px] font-medium italic outline-none"
                        style={{ borderColor: "var(--grid-border)", color: "var(--text-secondary)" }}
                        placeholder="Lưu ý thêm cho thợ..." />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="p-4 rounded-xl border space-y-3" style={{ borderColor: "var(--grid-border)", backgroundColor: "var(--bg-main)" }}>
                    <h5 className={labelCls} style={labelStyle}>Trạng thái vận hành</h5>
                    {editReq.status === "Chờ xử lý" && (
                      <button onClick={() => handleSave("Đang thực hiện")}
                        className="w-full py-3 rounded-xl font-black text-[13px] text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95 cursor-pointer"
                        style={{ backgroundColor: "#1D4ED8" }}>
                        <Truck size={18} /> Bắt đầu thực hiện
                      </button>
                    )}
                    {editReq.status === "Đang thực hiện" && (
                      <button onClick={() => handleSave("Hoàn thành")}
                        className="w-full py-3 rounded-xl font-black text-[13px] text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95 cursor-pointer"
                        style={{ backgroundColor: "#15803D" }}>
                        <CheckCircle2 size={18} /> Hoàn thành phiếu
                      </button>
                    )}
                    {editReq.status === "Hoàn thành" && (
                      <div className="text-center py-4 rounded-xl border border-green-100 bg-green-50">
                        <CheckCircle2 size={28} className="mx-auto text-green-600 mb-1" />
                        <p className="font-bold text-[13px] text-green-700">Công việc đã kết thúc</p>
                      </div>
                    )}
                    <button onClick={() => handleSave(null)}
                      className="w-full py-2.5 rounded-xl font-bold text-[13px] transition-all hover:bg-gray-100 active:scale-95 cursor-pointer border"
                      style={{ color: "var(--text-main)", borderColor: "var(--grid-border)", backgroundColor: "#fff" }}>
                      Lưu thông tin cập nhật
                    </button>
                    {editReq.status !== "Hoàn thành" && editReq.status !== "Đã hủy" && (
                      <button onClick={() => handleSave("Đã hủy")}
                        className="w-full py-2 text-[12px] font-bold text-red-500 hover:text-red-600 transition cursor-pointer">
                        Hủy phiếu xử lý
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Hidden print */}
            <div style={{ display: "none" }}>
              <div ref={printRef}><PrintableRepairInvoice request={editReq} /></div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t flex justify-between items-center shrink-0" style={{ borderColor: "var(--grid-border)" }}>
              <button onClick={handlePrint}
                className="px-5 py-2 rounded-lg text-[13px] font-bold transition-all cursor-pointer border"
                style={{ color: "var(--text-main)", borderColor: "var(--grid-border)", backgroundColor: "#fff" }}>
                In phiếu bàn giao
              </button>
              <button onClick={() => setModalOpen(false)}
                className="px-5 py-2 rounded-lg text-[13px] font-bold text-white transition-all hover:opacity-90 active:scale-95 cursor-pointer"
                style={{ backgroundColor: "var(--brand-primary)" }}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CREATE MODAL ── */}
      {createModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/30 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div
            className="bg-white rounded-lg w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200 border"
            style={{ borderColor: "var(--grid-border)" }}
          >
            <div className="px-6 py-4 border-b flex justify-between items-center shrink-0" style={{ borderColor: "var(--grid-border)" }}>
              <h3 className="text-[16px] font-bold" style={{ color: "var(--text-main)" }}>Lập phiếu sửa chữa mới</h3>
              <button onClick={() => setCreateModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition cursor-pointer"
                style={{ color: "var(--text-placeholder)" }}>
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelCls} style={labelStyle}>Khách hàng</label>
                  <input type="text" value={newReq.customerName}
                    onChange={(e) => setNewReq({ ...newReq, customerName: e.target.value })}
                    className={inputCls} style={inputStyle} placeholder="Tên khách..." />
                </div>
                <div className="space-y-1">
                  <label className={labelCls} style={labelStyle}>Số điện thoại</label>
                  <input type="text" value={newReq.phone}
                    onChange={(e) => setNewReq({ ...newReq, phone: e.target.value })}
                    className={inputCls} style={inputStyle} placeholder="SĐT..." />
                </div>
              </div>
              <div className="space-y-1">
                <label className={labelCls} style={labelStyle}>Tên sản phẩm</label>
                <input type="text" value={newReq.productName}
                  onChange={(e) => setNewReq({ ...newReq, productName: e.target.value })}
                  className={inputCls} style={inputStyle} placeholder="VD: Giường mộc 1m8" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelCls} style={labelStyle}>Loại lỗi</label>
                  <select value={newReq.repairCategory}
                    onChange={(e) => setNewReq({ ...newReq, repairCategory: e.target.value })}
                    className={inputCls + " cursor-pointer"} style={inputStyle}>
                    {["Lỗi Mộc", "Lỗi Sơn PU", "Lỗi Phụ Kiện", "Khác"].map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className={labelCls} style={labelStyle}>Ngày hẹn trả</label>
                  <input type="date" value={newReq.promisedDate ? newReq.promisedDate.split("T")[0] : ""}
                    onChange={(e) => setNewReq({ ...newReq, promisedDate: new Date(e.target.value).toISOString() })}
                    className={inputCls} style={{ ...inputStyle, color: "#1D4ED8", fontWeight: 700 }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelCls} style={labelStyle}>Nguyên nhân</label>
                  <select value={newReq.damageSource}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewReq({ ...newReq, damageSource: val, isWarrantyCovered: val === "Lỗi Sản xuất" ? newReq.isWarrantyCovered : false });
                    }}
                    className={`${inputCls} cursor-pointer font-bold`}
                    style={{ borderColor: "var(--grid-border)", color: newReq.damageSource === "Lỗi Sử dụng" ? "#DC2626" : "#1D4ED8" }}>
                    <option value="Lỗi Sản xuất">Lỗi từ Xưởng (Bảo hành)</option>
                    <option value="Lỗi Sử dụng">Lỗi khách dùng (Tính phí)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className={labelCls} style={labelStyle}>Chế độ thanh toán</label>
                  <select value={newReq.isWarrantyCovered.toString()}
                    onChange={(e) => setNewReq({ ...newReq, isWarrantyCovered: e.target.value === "true" })}
                    disabled={newReq.damageSource === "Lỗi Sử dụng"}
                    className={`${inputCls} cursor-pointer disabled:opacity-60`} style={inputStyle}>
                    <option value="true">Miễn phí (Bảo hành)</option>
                    <option value="false">Sửa chữa dịch vụ</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className={labelCls} style={labelStyle}>Thợ phụ trách (nếu có)</label>
                <input type="text" value={newReq.technician || ""}
                  onChange={(e) => setNewReq({ ...newReq, technician: e.target.value })}
                  className={inputCls} style={inputStyle} placeholder="Tên thợ..." />
              </div>
              <div className="space-y-1">
                <label className={labelCls} style={labelStyle}>Mô tả tình trạng lỗi</label>
                <textarea rows={2} value={newReq.issueDescription}
                  onChange={(e) => setNewReq({ ...newReq, issueDescription: e.target.value })}
                  className="w-full px-4 py-2.5 border rounded-xl text-[13px] font-medium italic outline-none resize-none"
                  style={{ borderColor: "var(--grid-border)", color: "var(--text-secondary)" }}
                  placeholder="Lỗi như thế nào..." />
              </div>
              {newReq.repairMethod === "Về xưởng" && (
                <div className="flex items-center justify-between p-3 rounded-xl border border-amber-100 bg-amber-50">
                  <span className="text-[12px] font-bold text-amber-700">Phí xe tải dự kiến:</span>
                  <div className="flex items-center gap-1">
                    <input type="number" value={newReq.transportFee}
                      onChange={(e) => setNewReq({ ...newReq, transportFee: Number(e.target.value) || 0 })}
                      className="w-24 px-2 py-1 border border-amber-200 rounded-lg text-right text-[13px] font-bold bg-white outline-none" />
                    <span className="text-[12px] font-bold text-amber-500">đ</span>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t flex justify-end gap-3 shrink-0" style={{ borderColor: "var(--grid-border)" }}>
              <button onClick={() => setCreateModalOpen(false)}
                className="px-5 py-2 rounded-lg text-[13px] font-bold transition-all hover:bg-gray-100 cursor-pointer border"
                style={{ color: "var(--text-secondary)", borderColor: "var(--grid-border)" }}>
                Hủy
              </button>
              <button onClick={handleCreate}
                className="px-6 py-2 rounded-lg text-[13px] font-bold text-white transition-all hover:opacity-90 active:scale-95 cursor-pointer"
                style={{ backgroundColor: "var(--brand-primary)" }}>
                Tạo phiếu ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
