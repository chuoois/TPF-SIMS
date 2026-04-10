import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Eye,
  Clock,
  Calendar,
  User,
  Phone,
  FileText,
  Wrench,
  Settings,
  History,
  X,
} from "lucide-react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import DataTable from "@/components/control/DataTable";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useReactToPrint } from "react-to-print";
import { PrintableWarrantyCertificate } from "./PrintTemplates";
import WarrantySettings from "./WarrantySettings";
import "@/pages/owner-page/warranty/mock.js";

// ─── Helper: Status Badge ───────────────────────────────────────────────────
const STATUS_CONFIG = {
  "Còn hạn":     { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
  "Sắp hết hạn": { bg: "#FFFBEB", text: "#D97706", border: "#FDE68A" },
  "Hết hạn":     { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA" },
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

// ─── Main Component ─────────────────────────────────────────────────────────
export default function WarrantyPage() {
  const navigate = useNavigate();
  const [warranties, setWarranties] = useState([]);
  const [activeTab, setActiveTab] = useState("history");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedWarranty, setSelectedWarranty] = useState(null);

  const printRef = React.useRef(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Phieu_Bao_Hanh_${selectedWarranty?.id || ""}`,
  });

  useEffect(() => {
    const rawData = localStorage.getItem("tpf_simulated_warranties");
    if (rawData) {
      let parsed = JSON.parse(rawData);
      const today = new Date();
      const updated = parsed.map((w) => {
        const end = new Date(w.endDate);
        const diffDays = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
        let newStatus = "Hết hạn";
        if (diffDays > 30) newStatus = "Còn hạn";
        else if (diffDays > 0) newStatus = "Sắp hết hạn";
        return { ...w, status: newStatus };
      });
      setWarranties(updated);
      if (JSON.stringify(updated) !== rawData) {
        localStorage.setItem("tpf_simulated_warranties", JSON.stringify(updated));
      }
    }
  }, []);

  const groupedCustomers = useMemo(() => {
    const filtered = warranties.filter((w) => {
      const matchSearch =
        (w.customerName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (w.id || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (w.phone || "").includes(searchQuery) ||
        (w.productName || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === "Tất cả" || w.status === statusFilter;
      return matchSearch && matchStatus;
    });

    const groups = filtered.reduce((acc, w) => {
      const key = w.phone;
      if (!acc[key]) {
        acc[key] = {
          id: key,
          customerName: w.customerName || "Khách ẩn danh",
          phone: w.phone || "---",
          items: [],
          statusCounts: { "Còn hạn": 0, "Sắp hết hạn": 0, "Hết hạn": 0 },
        };
      }
      acc[key].items.push(w);
      acc[key].statusCounts[w.status]++;
      return acc;
    }, {});

    return Object.values(groups);
  }, [warranties, searchQuery, statusFilter]);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, statusFilter]);

  const paginatedData = useMemo(() =>
    groupedCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [groupedCustomers, currentPage, itemsPerPage]
  );

  // ─── Stats ────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:   warranties.length,
    active:  warranties.filter((w) => w.status === "Còn hạn").length,
    warning: warranties.filter((w) => w.status === "Sắp hết hạn").length,
    expired: warranties.filter((w) => w.status === "Hết hạn").length,
  }), [warranties]);

  // ─── Columns ──────────────────────────────────────────────────────────────
  const columns = [
    {
      header: "Khách hàng",
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center font-bold text-[13px] shrink-0">
            {(item.customerName || "?").charAt(0)}
          </div>
          <div>
            <div className="font-bold text-[13px]" style={{ color: "var(--text-main)" }}>
              {item.customerName}
            </div>
            <div className="text-[11px] font-medium" style={{ color: "var(--text-placeholder)" }}>
              {item.phone}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Số phiếu",
      className: "text-center",
      headerClassName: "text-center",
      render: (item) => (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[var(--bg-main)] border rounded-lg text-[12px] font-bold" style={{ color: "var(--text-main)", borderColor: "var(--grid-border)" }}>
          <FileText size={13} style={{ color: "var(--text-placeholder)" }} />
          {item.items.length}
        </div>
      ),
    },
    {
      header: "Tóm tắt trạng thái",
      render: (item) => (
        <div className="flex gap-2 flex-wrap">
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
      ),
    },
  ];

  // ─── Expandable detail row ────────────────────────────────────────────────
  const renderWarrantyDetail = (customer) => (
    <div className="p-4" style={{ backgroundColor: "var(--bg-main)", borderTop: "1px solid var(--grid-border)", borderBottom: "1px solid var(--grid-border)" }}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {customer.items.map((w) => (
          <div
            key={w.id}
            className="bg-white p-4 rounded-xl border hover:border-[var(--brand-primary)]/30 transition-all group"
            style={{ borderColor: "var(--grid-border)" }}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-[10px] font-mono text-[var(--brand-primary)] font-bold bg-[var(--brand-primary)]/8 px-1.5 py-0.5 rounded mb-1 inline-block">
                  {w.id}
                </span>
                <h5 className="font-bold text-[13px] line-clamp-1" style={{ color: "var(--text-main)" }}>
                  {w.productName}
                </h5>
              </div>
              <StatusBadge status={w.status} />
            </div>

            <div className="space-y-1.5 mb-3">
              <div className="flex items-center gap-2 text-[11px]" style={{ color: "var(--text-secondary)" }}>
                <Calendar size={11} style={{ color: "var(--brand-primary)" }} />
                <span className="font-medium">
                  {format(new Date(w.startDate), "dd/MM/yyyy")} → {format(new Date(w.endDate), "dd/MM/yyyy")}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t" style={{ borderColor: "var(--grid-border)" }}>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] uppercase font-bold" style={{ color: "var(--text-placeholder)" }}>Chất liệu</span>
                  <span className="font-semibold text-[12px] truncate" style={{ color: "var(--text-main)" }}>{w.material || "Gỗ tự nhiên"}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] uppercase font-bold" style={{ color: "var(--text-placeholder)" }}>Kích thước</span>
                  <span className="font-semibold text-[12px] truncate" style={{ color: "var(--text-main)" }}>{w.size || "Chuẩn"}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t" style={{ borderColor: "var(--grid-border)" }}>
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedWarranty(w); setModalOpen(true); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all"
                style={{ backgroundColor: "var(--brand-primary)]/10", color: "var(--brand-primary)", background: "rgba(16,185,129,0.08)" }}
              >
                <Eye size={12} /> Chi tiết
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); navigate("/owner/warranty/repairs", { state: { prefill: w } }); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border ${
                  w.status === "Hết hạn"
                    ? "bg-red-50 text-red-600 border-red-100 hover:bg-red-100"
                    : "bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100"
                }`}
              >
                <Wrench size={12} /> {w.status === "Hết hạn" ? "Sửa chữa" : "Bảo hành"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ─── Status filter pills ──────────────────────────────────────────────────
  const STATUS_FILTERS = [
    { id: "Tất cả",      color: null },
    { id: "Còn hạn",     color: "green" },
    { id: "Sắp hết hạn", color: "amber" },
    { id: "Hết hạn",     color: "red" },
  ];

  const extraFilters = (
    <div className="flex items-center gap-1 p-1 rounded-lg" style={{ backgroundColor: "var(--grid-header-bg)", border: "1px solid var(--grid-border)" }}>
      {STATUS_FILTERS.map((s) => {
        const isActive = statusFilter === s.id;
        const colorMap = {
          green: { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
          amber: { bg: "#FFFBEB", text: "#D97706", border: "#FDE68A" },
          red:   { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA" },
        };
        const sc = s.color ? colorMap[s.color] : null;
        return (
          <button
            key={s.id}
            onClick={() => setStatusFilter(s.id)}
            className="px-3 py-1.5 rounded-md text-[12px] font-bold transition-all cursor-pointer"
            style={{
              backgroundColor: isActive ? (sc ? sc.bg : "#fff") : "transparent",
              color: isActive ? (sc ? sc.text : "var(--brand-primary)") : "var(--text-secondary)",
              border: isActive && sc ? `1px solid ${sc.border}` : "1px solid transparent",
            }}
          >
            {s.id}
          </button>
        );
      })}
    </div>
  );

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <PageHelmet title="Quản lý Bảo Hành | TPF-SIMS" />

      <div
        className="flex flex-col h-[calc(100vh-64px)] -m-6 p-6 space-y-4"
        style={{ backgroundColor: "var(--bg-main)" }}
      >
        {/* ── HEADER ── */}
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1
              className="text-xl font-bold flex items-center gap-2"
              style={{ color: "var(--text-main)" }}
            >
              <ShieldCheck size={22} style={{ color: "var(--brand-primary)" }} />
              Phiếu Bảo Hành &amp; Bảo Trì
            </h1>
            <p className="text-[13px] mt-0.5 font-medium" style={{ color: "var(--text-placeholder)" }}>
              {warranties.length} phiếu bảo hành đang theo dõi
            </p>
          </div>

          {/* Tab switcher */}
          <div
            className="flex p-1 rounded-lg"
            style={{ backgroundColor: "var(--grid-header-bg)", border: "1px solid var(--grid-border)" }}
          >
            {[
              { id: "history",  label: "Lịch sử phiếu",     icon: History },
              { id: "settings", label: "Cấu hình chính sách", icon: Settings },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className="px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-all cursor-pointer flex items-center gap-2"
                style={{
                  backgroundColor: activeTab === id ? "#fff" : "transparent",
                  color: activeTab === id ? "var(--text-main)" : "var(--text-secondary)",
                }}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── STATS (history tab only) ── */}
        {activeTab === "history" && (
          <div className="grid grid-cols-4 gap-3 shrink-0">
            {[
              { label: "Tổng phiếu",    value: stats.total,   color: "var(--text-main)",   bg: "var(--bg-main)" },
              { label: "Còn hạn",       value: stats.active,  color: "#15803D",  bg: "#F0FDF4" },
              { label: "Sắp hết hạn",   value: stats.warning, color: "#D97706",  bg: "#FFFBEB" },
              { label: "Hết hạn",       value: stats.expired, color: "#DC2626",  bg: "#FEF2F2" },
            ].map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border"
                style={{ backgroundColor: s.bg, borderColor: "var(--grid-border)" }}
              >
                <div className="flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--text-placeholder)" }}>
                    {s.label}
                  </p>
                  <p className="text-2xl font-black mt-0.5" style={{ color: s.color }}>
                    {s.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── CONTENT ── */}
        {activeTab === "history" ? (
          <DataTable
            columns={columns}
            data={paginatedData}
            renderDetail={renderWarrantyDetail}
            searchTerm={searchQuery}
            setSearchTerm={setSearchQuery}
            searchPlaceholder="Tìm mã phiếu, khách hàng, sản phẩm..."
            extraFilters={extraFilters}
            pagination={{
              total: groupedCustomers.length,
              currentPage,
              setCurrentPage,
              itemsPerPage,
              setItemsPerPage,
            }}
          />
        ) : (
          <div className="flex-1 overflow-y-auto">
            <WarrantySettings />
          </div>
        )}
      </div>

      {/* ── DETAIL MODAL ── */}
      {modalOpen && selectedWarranty && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-white rounded-lg w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 border" style={{ borderColor: "var(--grid-border)" }}>

            {/* Modal Header */}
            <div className="px-6 py-4 border-b flex justify-between items-center shrink-0" style={{ borderColor: "var(--grid-border)" }}>
              <h3 className="text-[16px] font-bold flex items-center gap-2" style={{ color: "var(--text-main)" }}>
                Chi tiết phiếu bảo hành
                <span
                  className="font-mono text-[13px] px-2 py-0.5 rounded-md"
                  style={{ color: "var(--brand-primary)", backgroundColor: "rgba(16,185,129,0.08)" }}
                >
                  {selectedWarranty.id}
                </span>
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition cursor-pointer"
                style={{ color: "var(--text-placeholder)" }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar">

              {/* Status Banner */}
              {(() => {
                const sc = STATUS_CONFIG[selectedWarranty.status] || {};
                const Icon = selectedWarranty.status === "Còn hạn" ? ShieldCheck
                  : selectedWarranty.status === "Sắp hết hạn" ? AlertTriangle : XCircle;
                return (
                  <div
                    className="p-4 rounded-xl border flex items-center gap-3"
                    style={{ backgroundColor: sc.bg, borderColor: sc.border }}
                  >
                    <Icon size={20} style={{ color: sc.text }} />
                    <div>
                      <p className="font-bold text-[14px]" style={{ color: sc.text }}>
                        {selectedWarranty.status}
                      </p>
                      <p className="text-[12px] font-medium mt-0.5" style={{ color: "var(--text-secondary)" }}>
                        Hiệu lực: {format(new Date(selectedWarranty.startDate), "dd/MM/yyyy")} —{" "}
                        {format(new Date(selectedWarranty.endDate), "dd/MM/yyyy")}
                        &nbsp;({selectedWarranty.warrantyMonths} tháng)
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Customer & Product */}
              <div className="grid grid-cols-2 gap-5">
                {[
                  {
                    label: "Khách hàng", icon: User,
                    rows: [
                      { key: "Họ tên",      val: selectedWarranty.customerName },
                      { key: "Điện thoại",  val: selectedWarranty.phone },
                    ],
                  },
                  {
                    label: "Sản phẩm", icon: FileText,
                    rows: [
                      { key: "Tên SP", val: selectedWarranty.productName },
                      { key: "Mã SP",  val: selectedWarranty.productCode },
                    ],
                  },
                ].map(({ label, icon: Icon, rows }) => (
                  <div key={label} className="space-y-3">
                    <h5 className="text-[12px] font-black uppercase tracking-widest flex items-center gap-2 pb-2 border-b" style={{ color: "var(--text-placeholder)", borderColor: "var(--grid-border)" }}>
                      <Icon size={14} /> {label}
                    </h5>
                    <div className="space-y-1.5">
                      {rows.map(({ key, val }) => (
                        <div key={key} className="flex items-start gap-2 text-[13px]">
                          <span className="w-24 shrink-0 font-medium" style={{ color: "var(--text-secondary)" }}>{key}:</span>
                          <span className="font-bold" style={{ color: "var(--text-main)" }}>{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Notes */}
              {selectedWarranty.notes && (
                <div className="p-4 rounded-xl border" style={{ backgroundColor: "var(--bg-main)", borderColor: "var(--grid-border)" }}>
                  <h5 className="text-[11px] font-black uppercase tracking-widest mb-2" style={{ color: "var(--text-placeholder)" }}>
                    Ghi chú bảo hành
                  </h5>
                  <p className="text-[13px] font-medium" style={{ color: "var(--text-secondary)" }}>
                    {selectedWarranty.notes}
                  </p>
                </div>
              )}

              {/* Maintenance History */}
              <div className="space-y-3">
                <h5 className="text-[12px] font-black uppercase tracking-widest flex items-center gap-2 pb-2 border-b" style={{ color: "var(--text-placeholder)", borderColor: "var(--grid-border)" }}>
                  <Clock size={14} /> Lịch sử bảo trì / sửa chữa
                </h5>
                {selectedWarranty.maintenanceHistory?.length > 0 ? (
                  <div className="space-y-2">
                    {selectedWarranty.maintenanceHistory.map((hist, idx) => (
                      <div key={idx} className="flex gap-4 p-3 border rounded-xl" style={{ borderColor: "var(--grid-border)", backgroundColor: "var(--bg-main)" }}>
                        <div className="text-[12px] font-bold shrink-0" style={{ color: "var(--text-placeholder)" }}>
                          {format(new Date(hist.date), "dd/MM/yyyy")}
                        </div>
                        <div>
                          <p className="text-[13px] font-bold" style={{ color: "var(--text-main)" }}>{hist.notes}</p>
                          <p className="text-[11px] mt-0.5" style={{ color: "var(--text-placeholder)" }}>Kỹ thuật viên: {hist.technician}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[13px] italic" style={{ color: "var(--text-placeholder)" }}>Chưa có lịch sử bảo trì.</p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t flex justify-end gap-3 shrink-0" style={{ borderColor: "var(--grid-border)" }}>
              <button
                onClick={handlePrint}
                className="px-5 py-2 rounded-lg text-[13px] font-bold transition-all hover:bg-gray-100 cursor-pointer"
                style={{ color: "var(--text-secondary)", border: "1px solid var(--grid-border)" }}
              >
                In Phiếu
              </button>
              <button
                onClick={() => setModalOpen(false)}
                className="px-5 py-2 rounded-lg text-[13px] font-bold text-white transition-all hover:opacity-90 active:scale-95 cursor-pointer"
                style={{ backgroundColor: "var(--brand-primary)" }}
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
    </>
  );
}
