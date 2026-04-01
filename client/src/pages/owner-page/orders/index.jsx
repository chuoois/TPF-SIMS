import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  Package,
  Clock,
  Trash2,
  Truck,
  Settings,
  CheckCircle2,
  Activity,
  AlertCircle,
} from "lucide-react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import DataTable from "@/components/control/DataTable";
import ConfirmModal from "@/components/control/ConfirmModal";
import toast from "react-hot-toast";
import InvoiceDetailsPopup from "./components/InvoiceDetailsPopup";

const INITIAL_ORDERS = [
  // ========== NHÓM 1: HÀNG SẴN (Sản phẩm có sẵn tại showroom) ==========
  {
    id: "DH-S01", code: "DH-SAN-001", customerName: "Nguyễn Văn Hùng", phone: "0912345678",
    type: "Hàng sẵn", total: 18500000, status: "Chờ xử lý",
    date: "2026-03-29T08:30:00", salesPerson: "Bình Nguyễn", deliveryDate: "2026-04-01",
    deposit: 2000000, fulfillmentType: "Giao tận nơi",
    products: [{ name: "Bàn ăn gỗ Sồi Nga 6 ghế", specs: "160x80 cm, Sơn màu hạt dẻ" }]
  },
  {
    id: "DH-S02", code: "DH-SAN-002", customerName: "Lê Thị Lan", phone: "0345678901",
    type: "Hàng sẵn", total: 8500000, status: "Chờ giao hàng",
    date: "2026-03-28T14:20:00", salesPerson: "Bình Nguyễn", deliveryDate: "2026-03-30",
    deposit: 8500000, fulfillmentType: "Lấy tại cửa hàng",
    products: [{ name: "Kệ Tivi gỗ Sồi", specs: "2m2, Cánh mây tự nhiên" }]
  },
  {
    id: "DH-S03", code: "DH-SAN-003", customerName: "Trần Minh Quang", phone: "0909123456",
    type: "Hàng sẵn", total: 42000000, status: "Đang giao hàng",
    date: "2026-03-27T09:15:00", salesPerson: "Bình Nguyễn", deliveryDate: "2026-03-31",
    deposit: 20000000, fulfillmentType: "Giao tận nơi",
    products: [{ name: "Bộ Sofa gỗ Sồi chữ U", specs: "Nệm da Hàn Quốc, màu nâu" }]
  },
  {
    id: "DH-S04", code: "DH-SAN-004", customerName: "Phạm Thành Nam", phone: "0987654321",
    type: "Hàng sẵn", total: 15600000, status: "Hoàn thành",
    date: "2026-03-25T16:45:00", salesPerson: "Bình Nguyễn", deliveryDate: "2026-03-26",
    deposit: 15600000, fulfillmentType: "Giao tận nơi",
    products: [{ name: "Tủ giày thông minh", specs: "Gỗ sồi, 3 tầng cánh lật" }]
  },

  // ========== NHÓM 2: HÀNG MỘC (Cần hoàn thiện sơn/đánh bóng) ==========
  {
    id: "DH-T01", code: "DH-MOC-001", customerName: "Hoàng Nguyệt Ánh", phone: "0978901234",
    type: "Hàng mộc", total: 56000000, status: "Chờ xử lý",
    date: "2026-03-30T10:00:00", salesPerson: "Bình Nguyễn", deliveryDate: "2026-04-10",
    deposit: 10000000, fulfillmentType: "Giao tận nơi",
    products: [{ name: "Sập thờ Tứ Linh", specs: "Gỗ mít, Chân 18, Dạ 5 phân" }]
  },
  {
    id: "DH-T02", code: "DH-MOC-002", customerName: "Đặng Tuấn Kiệt", phone: "0931234567",
    type: "Hàng mộc", total: 32000000, status: "Đang gia công",
    date: "2026-03-28T15:30:00", salesPerson: "Bình Nguyễn", deliveryDate: "2026-04-05",
    deposit: 15000000, fulfillmentType: "Giao tận nơi",
    products: [{ name: "Bộ bàn ghế Âu Á", specs: "Gỗ Hương Đá, Chương voi" }]
  },

  // ========== NHÓM 3: HÀNG KHÁCH ĐẶT (Sản xuất mới theo yêu cầu) ==========
  {
    id: "DH-D01", code: "DH-DAT-001", customerName: "Nguyễn Thị Hồng", phone: "0912123123",
    type: "Hàng khách đặt", total: 125000000, status: "Chờ sản xuất",
    date: "2026-03-30T11:15:00", salesPerson: "Bình Nguyễn", deliveryDate: "2026-04-30",
    deposit: 40000000, fulfillmentType: "Giao tận nơi",
    products: [{ name: "Trường kỷ Sen Vịt", specs: "Gỗ Gụ Lào, 2m17, Đục tay kỹ" }]
  },
  {
    id: "DH-D02", code: "DH-DAT-002", customerName: "Lê Văn Tám", phone: "0321654987",
    type: "Hàng khách đặt", total: 75000000, status: "Đã nhập kho",
    date: "2026-03-25T09:00:00", salesPerson: "Bình Nguyễn", deliveryDate: "2026-04-05",
    deposit: 30000000, fulfillmentType: "Giao tận nơi",
    products: [{ name: "Tủ chè khảm trai", specs: "Gỗ Gụ, Cánh cong đục tích" }]
  },
  {
    id: "DH-D03", code: "DH-DAT-003", customerName: "Bùi Tiến Dũng", phone: "0911223344",
    type: "Hàng khách đặt", total: 210000000, status: "Hoàn thành",
    date: "2026-03-05T08:30:00", salesPerson: "Bình Nguyễn", deliveryDate: "2026-03-15",
    deposit: 210000000, fulfillmentType: "Giao tận nơi",
    deliveryImage: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=400"
  },
];

const ORDER_TYPES = ["Hàng sẵn", "Hàng mộc", "Hàng khách đặt"];

const HANG_SAN_STATUSES = ["Chờ giao hàng", "Đang giao hàng", "Hoàn thành", "Chờ duyệt hủy", "Đơn đã hủy"];
const HANG_THO_STATUSES = ["Chờ xử lý", "Đang gia công", "Chờ giao hàng", "Đang giao hàng", "Hoàn thành", "Chờ duyệt hủy", "Đơn đã hủy"];
const HANG_DAT_STATUSES = ["Chờ sản xuất", "Đã nhập kho", "Đang gia công", "Chờ giao hàng", "Đang giao hàng", "Hoàn thành", "Chờ duyệt hủy", "Đơn đã hủy"];
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

  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [detailId, setDetailId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);

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
    
    // Sync with localStorage
    const saved = JSON.parse(localStorage.getItem("tpf_simulated_orders") || "[]");
    const updatedSaved = saved.map(o => selectedIds.includes(o.id) ? { ...o, status: "Đơn đã hủy" } : o);
    localStorage.setItem("tpf_simulated_orders", JSON.stringify(updatedSaved));

    toast.success(`Đã hủy ${selectedIds.length} đơn hàng thành công!`);
    setSelectedIds([]);
    setShowBulkConfirm(false);
  };

  const filtered = useMemo(() => {
    let result = orders.filter(o => !(o.type === "Hàng sẵn" && o.status === "Chờ xử lý"));
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
    let baseOrders = orders.filter(o => !(o.type === "Hàng sẵn" && o.status === "Chờ xử lý"));
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
        const sc = getStatusColor(o.status);
        return (
          <div className="flex flex-col items-end gap-1.5">
            <span className="inline-flex items-center justify-center w-[140px] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-md border gap-1.5 shrink-0" style={{ backgroundColor: sc.bg, color: sc.text, borderColor: sc.border }}>
              {sc.icon && <sc.icon size={12} />}
              {o.status}
            </span>
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
      <div className="flex flex-col h-[calc(100vh-64px)] -m-6 p-6 space-y-4" style={{ backgroundColor: "var(--bg-main)" }}>
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: "var(--text-main)" }}>
              <Package size={22} style={{ color: "var(--brand-primary)" }} />
              Quản lý đơn hàng
            </h1>
            <p className="text-[13px] mt-0.5" style={{ color: "var(--text-placeholder)" }}>{filtered.length} đơn hàng ({activeTab.toLowerCase()})</p>
          </div>
          <div className="flex p-1 rounded-xl" style={{ backgroundColor: "var(--grid-header-bg)", border: "1px solid var(--grid-border)" }}>
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
              <button key={s} onClick={() => updateParams({ status: s })} className="px-4 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer flex items-center gap-2 border" style={{ backgroundColor: isActive ? (sc ? sc.bg : "#fff") : "transparent", color: isActive ? (sc ? sc.text : "var(--brand-primary)") : "var(--text-secondary)", borderColor: isActive ? (sc ? sc.border : "var(--grid-border)") : "transparent" }}>
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
          bulkActions={[
            {
              label: "HỦY ĐƠN HÀNG LOẠT",
              icon: Trash2,
              onClick: () => setShowBulkConfirm(true),
              colorClass: "bg-rose-600",
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
      </div>

      <InvoiceDetailsPopup
        invoiceId={detailId}
        isOpen={!!detailId}
        onClose={() => setDetailId(null)}
        onStatusChanged={handleUpdateStatus}
      />

      {/* Confirm Bulk Cancel Modal */}
      <ConfirmModal
        isOpen={showBulkConfirm}
        title="Xác nhận hủy hàng loạt"
        message={`Bạn có chắc chắn muốn hủy ${selectedIds.length} đơn hàng đang được chọn không? Hành động này không thể hoàn tác.`}
        onCancel={() => setShowBulkConfirm(false)}
        onConfirm={handleBulkCancel}
      />
    </>
  );
}
