import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Package,
  Clock,
  Trash2,
  Truck,
  Settings,
  CheckCircle2,
  Activity,
  AlertCircle,
  Eye,
  Paintbrush,
  Camera,
  Layers,
} from "lucide-react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import DataTable from "@/components/control/DataTable";
import ConfirmModal from "@/components/control/ConfirmModal";
import toast from "react-hot-toast";
import InvoiceDetailsPopup from "./components/InvoiceDetailsPopup";
import { INITIAL_ORDERS, INITIAL_PRODUCTIONS } from "./mockData";

const ORDER_TYPES = ["Hàng sẵn", "Hàng mộc", "Hàng khách đặt"];

const HANG_SAN_STATUSES = ["Chờ giao hàng", "Đang giao hàng", "Hoàn thành", "Chờ duyệt hủy", "Đơn đã hủy"];
const HANG_THO_STATUSES = ["Chờ xử lý", "Đang gia công", "Chờ giao hàng", "Đang giao hàng", "Hoàn thành", "Chờ duyệt hủy", "Đơn đã hủy"];
const HANG_DAT_STATUSES = ["Chờ sản xuất", "Chờ xử lý", "Đang gia công", "Chờ giao hàng", "Đang giao hàng", "Hoàn thành", "Chờ duyệt hủy", "Đơn đã hủy"];
const ALL_STATUSES = [...new Set([...HANG_SAN_STATUSES, ...HANG_THO_STATUSES, ...HANG_DAT_STATUSES])];

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
};

const STATUS_CONFIG = {
  "Chờ xử lý": { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE", icon: Clock },
  "Chờ sản xuất": { bg: "#FEF3C7", text: "#B45309", border: "#FDE68A", icon: Settings },
  "Đã nhập kho": { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0", icon: Package },
  "Đang gia công": { bg: "#FEF3C7", text: "#D97706", border: "#FDE68A", icon: Activity },
  "Chờ giao hàng": { bg: "#F5F3FF", text: "#7C3AED", border: "#DDD6FE", icon: Clock },
  "Đang giao hàng": { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE", icon: Truck },
  "Hoàn thành": { bg: "#F0FDF4", text: "#166534", border: "#BBF7D0", icon: CheckCircle2 },
  "Chờ duyệt hủy": { bg: "#FEF3C7", text: "#D97706", border: "#FDE68A", icon: AlertCircle },
  "Đơn đã hủy": { bg: "#FEF2F2", text: "#B91C1C", border: "#FECACA", icon: Trash2 },
};

const getStatusColor = (status) => STATUS_CONFIG[status] || { bg: "#F3F4F6", text: "#374151", border: "#D1D5DB", icon: Clock };

export default function OwnerOrders() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "Hàng sẵn";
  const statusFilter = searchParams.get("status") || "Tất cả";

  const [orders, setOrders] = useState(() => {
    const saved = JSON.parse(localStorage.getItem("tpf_simulated_orders") || "[]");
    const uniqueInitial = INITIAL_ORDERS.filter(io => !saved.find(so => so.id === io.id));
    return [...saved, ...uniqueInitial];
  });

  // Load production data to compute sub-statuses for "Đang gia công" orders
  const [productions, setProductions] = useState(() => {
    try {
      const saved = localStorage.getItem("tpf_simulated_productions");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) { /* ignore */ }

    // INITIAL MOCK PRODUCTION FOR TESTING (Fallback if missing)
    localStorage.setItem("tpf_simulated_productions", JSON.stringify(INITIAL_PRODUCTIONS));
    return INITIAL_PRODUCTIONS;
  });

  // Sync with localStorage updates (for when actions happen in popup)
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === "tpf_simulated_productions") {
        setProductions(JSON.parse(e.newValue || "[]"));
      }
    };
    window.addEventListener("storage", handleStorage);
    // Also poll every 2 seconds if you want a "real-time" feel without complex state lifting
    const interval = setInterval(() => {
      const current = localStorage.getItem("tpf_simulated_productions");
      if (current) {
        const parsed = JSON.parse(current);
        // Only update if stringified version changed to avoid infinite loop
        setProductions(prev => {
          if (JSON.stringify(prev) !== current) return parsed;
          return prev;
        });
      }
    }, 2000);
    return () => {
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, []);

  // Map orderId -> sub-status counts
  const prodSubStatusMap = useMemo(() => {
    const map = {};
    productions.forEach(p => {
      const key = p.orderId;
      if (!key) return;
      if (!map[key]) map[key] = { received: 0, kcs: 0 };
      if (p.isPendingApproval || p.status === "Chờ nghiệm thu" || p.status === "OWNER_PENDING" || p.status === "QC_PENDING") map[key].kcs++;
      else if (p.status !== "Hoàn thành" && p.status !== "COMPLETED") map[key].received++;
    });
    return map;
  }, [productions]);

  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [detailId, setDetailId] = useState(null);

  const updateParams = (newParams) => {
    const current = Object.fromEntries(searchParams.entries());
    setSearchParams({ ...current, ...newParams });
  };

  const handleUpdateStatus = (id, newStatus) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    const saved = JSON.parse(localStorage.getItem("tpf_simulated_orders") || "[]");
    const updatedSaved = saved.map(o => o.id === id ? { ...o, status: newStatus } : o);
    localStorage.setItem("tpf_simulated_orders", JSON.stringify(updatedSaved));
  };

  const handleBulkCancel = () => {
    setOrders(prev => prev.map(o => selectedIds.includes(o.id) ? { ...o, status: "Đơn đã hủy" } : o));

    const saved = JSON.parse(localStorage.getItem("tpf_simulated_orders") || "[]");
    const updatedSaved = saved.map(o => selectedIds.includes(o.id) ? { ...o, status: "Đơn đã hủy" } : o);
    localStorage.setItem("tpf_simulated_orders", JSON.stringify(updatedSaved));

    toast.success(`Đã hủy ${selectedIds.length} đơn hàng thành công!`);
    setSelectedIds([]);
  };

  const handleSingleCancel = (o) => {
    setOrders(prev => prev.map(item => item.id === o.id ? { ...item, status: "Đơn đã hủy" } : item));

    const saved = JSON.parse(localStorage.getItem("tpf_simulated_orders") || "[]");
    const updatedSaved = saved.map(item => item.id === o.id ? { ...item, status: "Đơn đã hủy" } : item);
    localStorage.setItem("tpf_simulated_orders", JSON.stringify(updatedSaved));

    toast.success(`Đã hủy đơn hàng ${o.code} thành công!`);
  };

  const filtered = useMemo(() => {
    let result = orders;
    if (activeTab !== "Tất cả") result = result.filter(o => o.type === activeTab);
    if (statusFilter !== "Tất cả") result = result.filter(o => o.status === statusFilter);
    if (dateFrom) {
      const from = new Date(dateFrom); from.setHours(0, 0, 0, 0);
      result = result.filter(o => new Date(o.date) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo); to.setHours(23, 59, 59, 999);
      result = result.filter(o => new Date(o.date) <= to);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(o =>
        (o.customerName || o.customer?.name || "").toLowerCase().includes(q) ||
        (o.phone || o.customer?.phone || "").includes(q) ||
        o.code.toLowerCase().includes(q)
      );
    }
    return result.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [orders, activeTab, searchTerm, statusFilter, dateFrom, dateTo]);

  const { possibleStatuses, statusCounts } = useMemo(() => {
    let baseOrders = orders;
    if (activeTab !== "Tất cả") baseOrders = baseOrders.filter(o => o.type === activeTab);

    let statuses = [];
    if (activeTab === "Hàng sẵn") statuses = HANG_SAN_STATUSES;
    else if (activeTab === "Hàng mộc") statuses = HANG_THO_STATUSES;
    else if (activeTab === "Hàng khách đặt") statuses = HANG_DAT_STATUSES;
    else statuses = ALL_STATUSES;

    const counts = { "Tất cả": baseOrders.length };
    statuses.forEach(s => counts[s] = baseOrders.filter(o => o.status === s).length);
    return { possibleStatuses: ["Tất cả", ...statuses], statusCounts: counts };
  }, [orders, activeTab]);

  const paginatedOrders = useMemo(() => {
    return filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const columns = [
    {
      header: "STT",
      headerClassName: "text-center w-[60px]",
      render: (_, idx) => (currentPage - 1) * itemsPerPage + idx + 1,
      className: "text-center text-[13px] font-medium",
      style: { color: "var(--text-secondary)" },
    },
    {
      header: "Mã đơn",
      render: (o) => <p className="text-[13px] font-bold font-mono" style={{ color: "var(--text-main)" }}>{o.code}</p>,
    },
    {
      header: "Khách hàng",
      render: (o) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[12px] group-hover:bg-white border transition" style={{ backgroundColor: "var(--bg-main)", color: "var(--text-placeholder)", borderColor: "var(--grid-border)" }}>
            {(o.customerName || o.customer?.name || "?").charAt(0)}
          </div>
          <div>
            <p className="text-[13px] font-semibold" style={{ color: "var(--text-main)" }}>{o.customerName || o.customer?.name || "—"}</p>
            <p className="text-[11px]" style={{ color: "var(--text-placeholder)" }}>{o.phone || o.customer?.phone || "—"}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Tổng tiền",
      headerClassName: "text-right pr-10",
      render: (o) => <p className="text-[14px] font-bold" style={{ color: o.status === "Đơn đã hủy" ? "var(--text-placeholder)" : "var(--text-main)" }}>{formatCurrency(o.total)}</p>,
      className: "text-right pr-10",
    },
    {
      header: "Ngày giao dự kiến",
      headerClassName: "text-center",
      render: (o) => (
        <div className="flex flex-col items-center justify-center gap-1">
          <div className="flex items-center gap-1.5 text-gray-600 font-bold text-[13px]">
            <Clock size={12} className="text-gray-400" />
            {o.deliveryDate ? new Date(o.deliveryDate).toLocaleDateString("vi-VN") : "---"}
          </div>
        </div>
      ),
      className: "text-center",
    },
    {
      header: "Trạng thái",
      headerClassName: "text-right pr-12",
      render: (o) => {
        const sc = { ...getStatusColor(o.status) };
        const isInProduction = o.status === "Đang gia công";
        const sub = isInProduction ? (prodSubStatusMap[o.id] || { received: 0, kcs: 0 }) : null;
        const needsKcs = sub && sub.kcs > 0;

        if (needsKcs) {
          sc.bg = "#FEF2F2";
          sc.text = "#DC2626";
          sc.border = "#FECACA";
        }

        return (
          <div className="flex flex-col items-end gap-1.5">
            <span
              className={`inline-flex items-center justify-center min-w-[140px] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-md border gap-1.5 shrink-0 relative transition-colors`}
              style={{ backgroundColor: sc.bg, color: sc.text, borderColor: sc.border }}
              title={needsKcs ? "Có sản phẩm chờ chủ xưởng nghiệm thu" : ""}
            >
              {sc.icon && <sc.icon size={12} />}
              {o.status}
              {needsKcs && <AlertCircle size={10} className="text-red-500 animate-pulse ml-0.5" />}

              {needsKcs && (
                <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border border-white"></span>
                </span>
              )}
            </span>

            {/* Sub-status breakdown for "Đang gia công" */}
            {isInProduction && sub && (
              <div
                className="flex items-center gap-1 mt-0.5"
                style={{
                  backgroundColor: "var(--bg-main)",
                  border: "1px solid var(--grid-border)",
                  borderRadius: "6px",
                  padding: "3px 6px",
                }}
              >
                {/* Tiếp nhận */}
                <span
                  className="inline-flex items-center gap-1 px-1.5 py-[2px] rounded text-[10px] font-bold"
                  style={{
                    backgroundColor: sub.received > 0 ? "#E0F2FE" : "transparent",
                    color: sub.received > 0 ? "#0369A1" : "#C4C9D4",
                  }}
                  title={`Tiếp nhận: ${sub.received} sản phẩm`}
                >
                  <Package size={10} strokeWidth={2.2} />
                  <span>{sub.received}</span>
                </span>

                {/* Divider */}
                <span style={{ color: "var(--grid-border)", fontSize: "10px", lineHeight: 1 }}>|</span>

                {/* Nghiệm thu (KCS) */}
                <span
                  className={`inline-flex items-center gap-1 px-1.5 py-[2px] rounded text-[10px] font-bold transition-all${sub.kcs > 0 ? " ring-1 ring-emerald-300" : ""
                    }`}
                  style={{
                    backgroundColor: sub.kcs > 0 ? "#FFEDD5" : "transparent",
                    color: sub.kcs > 0 ? "#9A3412" : "#C4C9D4",
                  }}
                  title={`Chờ nghiệm thu: ${sub.kcs} sản phẩm`}
                >
                  <Camera size={10} strokeWidth={2.2} />
                  <span>{sub.kcs}</span>
                </span>
              </div>
            )}
          </div>
        );
      },
      className: "text-right pr-12",
    }
  ];

  const hasActiveFilters = statusFilter !== "Tất cả" || dateFrom || dateTo || searchTerm;

  return (
    <>
      <PageHelmet title="Quản lý đơn hàng | TPF-SIMS" />
      <div className="flex flex-col h-[calc(100vh-64px)] -m-6 p-6 gap-4" style={{ backgroundColor: "var(--bg-main)" }}>
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: "var(--text-main)" }}>
              <Package size={22} style={{ color: "var(--brand-primary)" }} />
              Quản lý đơn hàng
            </h1>
            <p className="text-[13px] mt-0.5" style={{ color: "var(--text-placeholder)" }}>{filtered.length} đơn hàng ({activeTab.toLowerCase()})</p>
          </div>

          <div className="flex p-1 rounded-lg" style={{ backgroundColor: "var(--grid-header-bg)", border: "1px solid var(--grid-border)" }}>
            {ORDER_TYPES.map((tab) => (
              <button key={tab} onClick={() => updateParams({ tab, status: "Tất cả" })} className="px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-all cursor-pointer" style={{ backgroundColor: activeTab === tab ? "#fff" : "transparent", color: activeTab === tab ? "var(--text-main)" : "var(--text-secondary)" }}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 px-1 flex-wrap">
          {possibleStatuses.map((s) => {
            const isActive = statusFilter === s;
            const sc = s !== "Tất cả" ? getStatusColor(s) : null;
            return (
              <button key={s} onClick={() => updateParams({ status: s })} className="px-4 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer flex items-center gap-2 border" style={{ backgroundColor: isActive ? (sc ? sc.bg : "#fff") : "transparent", color: isActive ? (sc ? sc.text : "var(--brand-primary)") : "var(--text-secondary)", borderColor: isActive ? (sc ? sc.border : "var(--grid-border)") : "transparent" }}>
                {s !== "Tất cả" && sc?.icon && <sc.icon size={14} />}
                {s} <span className="text-[10px] opacity-60 bg-black/5 px-1.5 rounded-md ml-0.5">{statusCounts[s] || 0}</span>
              </button>
            );
          })}
        </div>

        <DataTable
          columns={columns}
          data={paginatedOrders}
          onRowClick={(o) => setDetailId(o.id)}
          rowStyle={(item) => ({
            backgroundColor: selectedIds.includes(item.id) ? "var(--status-focus)" : "transparent"
          })}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          dateFrom={dateFrom}
          setDateFrom={setDateFrom}
          dateTo={dateTo}
          setDateTo={setDateTo}
          hasActiveFilters={hasActiveFilters}
          clearAllFilters={() => { updateParams({ status: "Tất cả" }); setDateFrom(""); setDateTo(""); setSearchTerm(""); }}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}

          rowActions={[
            {
              icon: Eye,
              label: "Xem chi tiết",
              onClick: (o) => setDetailId(o.id),
            },
            {
              icon: Trash2,
              label: "Hủy đơn",
              onClick: (o) => handleSingleCancel(o),
              className: "bg-white border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200",
              requireConfirm: true,
              confirmTitle: "Xác nhận hủy đơn hàng?",
              confirmMessage: "Mọi thông tin thanh toán và trạng thái của đơn sẽ được chuyển về 'Đơn đã hủy'. Bạn chắc chắn chứ?"
            },
          ]}
          bulkActions={[
            {
              label: "HỦY ĐƠN HÀNG LOẠT",
              icon: Trash2,
              onClick: handleBulkCancel,
              requireConfirm: true,
              confirmTitle: "Hủy hàng loạt đơn hàng?",
              confirmMessage: `Hệ thống sẽ chuyển ${selectedIds.length} đơn hàng đã chọn sang trạng thái hủy. Hành động này không thể hoàn tác.`
            }
          ]}
          pagination={{
            total: filtered.length,
            currentPage: currentPage,
            setCurrentPage: setCurrentPage,
            itemsPerPage: itemsPerPage,
            setItemsPerPage: setItemsPerPage,
          }}
        />
      </div >

      <InvoiceDetailsPopup
        invoiceId={detailId}
        isOpen={!!detailId}
        onClose={() => setDetailId(null)}
        onStatusChanged={handleUpdateStatus}
      />
    </>
  );
}
