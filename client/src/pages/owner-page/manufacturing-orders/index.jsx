/**
 * ManufacturingOrdersPage
 * Trang quản lý Yêu cầu nhập hàng — Owner
 * Chỉ gom đơn hàng và tạo phiếu, không có trạng thái
 */

import { useState, useMemo } from "react";
import {
  FileStack, Plus, Search, Printer, Eye, Trash2, Clock, Calendar,
} from "lucide-react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import DataTable from "@/components/control/DataTable";
import toast from "react-hot-toast";
import CreateManufacturingOrderModal from "./components/CreateManufacturingOrderModal";
import ManufacturingOrderDetail from "./components/ManufacturingOrderDetail";
import { INITIAL_ORDERS } from "../orders/mockData";

const INITIAL_PRODUCTS = [
  {
    id: "SP001",
    code: "ST-HS-197x107x108-Mit",
    name: "Sập thờ Mai Điểu chân 20",
    material: "Gỗ Mít",
    dimensions: "197x107x108",
    img: "https://images.unsplash.com/photo-1620608208153-90928221805b?q=80&w=600",
  },
  {
    id: "SP002",
    code: "TA-HM-160x200x55-XoanDao",
    name: "Tủ áo gỗ Xoan Đào (3 cánh)",
    material: "Gỗ xoan đào",
    dimensions: "160x200x55",
    img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=600",
  },
  {
    id: "SP005",
    code: "QT-DK-01",
    name: "Đế kê tượng gỗ Hương",
    material: "Gỗ Hương",
    dimensions: "30x30x20",
    img: "https://images.unsplash.com/photo-1595246140625-573b715d11dc?q=80&w=600",
  },
];

// ── Load all orders (same pattern as orders page) ────────────────────────────
function loadAllOrders() {
  try {
    const saved = JSON.parse(localStorage.getItem("tpf_simulated_orders") || "[]");
    const uniqueInitial = INITIAL_ORDERS.filter((io) => !saved.find((so) => so.id === io.id));
    return [...saved, ...uniqueInitial];
  } catch {
    return INITIAL_ORDERS;
  }
}

// ── Load all products (from catalog) ─────────────────────────────────────────
function loadAllProducts() {
  try {
    const saved = JSON.parse(localStorage.getItem("tpf_simulated_products") || "[]");
    return saved.length > 0 ? saved : INITIAL_PRODUCTS;
  } catch {
    return INITIAL_PRODUCTS;
  }
}

// ── Load manufacturing orders ─────────────────────────────────────────────────
function loadManufacturingOrders() {
  try {
    const list = JSON.parse(localStorage.getItem("tpf_manufacturing_orders") || "[]");
    const hasStaleData = list.some(o =>
      o.items?.some(it => !it.material && !it.color && !it.finish)
    );
    if (hasStaleData && list.length > 0) {
      localStorage.removeItem("tpf_manufacturing_orders");
      localStorage.removeItem("tpf_simulated_orders");
      return [];
    }
    return list;
  } catch {
    return [];
  }
}

const formatDateTime = (iso) =>
  iso
    ? new Date(iso).toLocaleString("vi-VN", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      })
    : "—";

export default function ManufacturingOrdersPage() {
  const [allOrders] = useState(loadAllOrders);
  const [allProducts] = useState(loadAllProducts);
  const [manufacturingOrders, setManufacturingOrders] = useState(loadManufacturingOrders);
  const [showCreate, setShowCreate]   = useState(false);
  const [detailOrder, setDetailOrder] = useState(null);
  const [searchTerm, setSearchTerm]   = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  const persist = (list) => {
    setManufacturingOrders(list);
    localStorage.setItem("tpf_manufacturing_orders", JSON.stringify(list));
  };

  const handleCreated = (newOrder) => {
    const updated = [newOrder, ...manufacturingOrders];
    setManufacturingOrders(updated);
  };

  const handleDelete = (id) => {
    const updated = manufacturingOrders.filter((o) => o.id !== id);
    persist(updated);
    toast.success("Đã xóa yêu cầu nhập hàng");
  };

  // ── Filter ──
  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return manufacturingOrders;
    const q = searchTerm.toLowerCase();
    return manufacturingOrders.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.orderIds?.some((id) => id.toLowerCase().includes(q)) ||
        o.note?.toLowerCase().includes(q)
    );
  }, [manufacturingOrders, searchTerm]);

  const paginated = useMemo(
    () => filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [filtered, currentPage, itemsPerPage]
  );

  // ── Columns ──
  const columns = [
    {
      header: "STT",
      headerClassName: "text-center w-[60px]",
      render: (_, idx) => (currentPage - 1) * itemsPerPage + idx + 1,
      className: "text-center text-[13px] font-medium",
      style: { color: "var(--text-secondary)" },
    },
    {
      header: "Mã phiếu",
      render: (o) => (
        <p className="text-[13px] font-bold font-mono" style={{ color: "var(--text-main)" }}>
          {o.id}
        </p>
      ),
    },
    {
      header: "Ngày tạo",
      render: (o) => (
        <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
          {formatDateTime(o.createdAt)}
        </p>
      ),
    },
    {
      header: "Nhà cung cấp",
      render: (o) => (
        <div className="flex flex-col">
          <p className="text-[13px] font-bold" style={{ color: "var(--text-main)" }}>
            {o.supplierName || "—"}
          </p>
          {o.supplierId && (
            <p className="text-[11px] font-mono font-bold" style={{ color: "var(--text-placeholder)" }}>
              {o.supplierId}
            </p>
          )}
        </div>
      ),
    },
    {
      header: "Hẹn giao",
      render: (o) => {
        if (!o.expectedDate) return <span className="text-[13px] text-gray-400">—</span>;
        const d = new Date(o.expectedDate);
        const isOverdue = d < new Date().setHours(0,0,0,0) && o.status !== "Đã nhập kho";
        return (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1">
              <Clock size={12} style={{ color: isOverdue ? "#ef4444" : "var(--text-placeholder)" }} />
              <span className="text-[13px] font-bold" style={{ color: isOverdue ? "#ef4444" : "var(--text-main)" }}>
                {new Date(o.expectedDate).toLocaleDateString("vi-VN")}
              </span>
            </div>
            {isOverdue && <span className="text-[10px] font-bold text-rose-500 uppercase tracking-tight">Quá hạn</span>}
          </div>
        );
      }
    },
    {
      header: "Đơn hàng liên quan",
      render: (o) => (
        <div className="flex flex-col gap-1">
          {o.orderIds?.slice(0, 3).map((id) => {
            const detail = o.sourceOrderDetails?.[id];
            return (
              <div key={id} className="flex items-center gap-1.5">
                <span className="text-[11px] font-mono px-1.5 py-0.5 rounded" style={{ background: "var(--bg-main)", color: "var(--text-secondary)", border: "1px solid var(--grid-border)" }}>
                  {id}
                </span>
                {detail?.customerName && (
                  <span className="text-[11px] font-medium truncate max-w-[100px]" style={{ color: "var(--text-main)" }}>
                    {detail.customerName}
                  </span>
                )}
              </div>
            );
          })}
          {o.orderIds?.length > 3 && (
            <span className="text-[11px] px-1.5 py-0.5 rounded" style={{ color: "var(--text-placeholder)" }}>
              +{o.orderIds.length - 3} đơn khác
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Số SP",
      headerClassName: "text-center",
      className: "text-center",
      render: (o) => {
        const total = o.items?.reduce((s, i) => s + (i.qty || 0), 0) || 0;
        return (
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[14px] font-black" style={{ color: "var(--text-main)" }}>{total}</span>
            <span className="text-[11px]" style={{ color: "var(--text-placeholder)" }}>{o.items?.length || 0} dòng</span>
          </div>
        );
      },
    },
    {
      header: "Ghi chú",
      render: (o) => (
        <p className="text-[13px] truncate max-w-[200px]" style={{ color: "var(--text-secondary)" }}>
          {o.note || "—"}
        </p>
      ),
    },
  ];

  const hasActiveFilters = !!searchTerm;

  return (
    <>
      <PageHelmet title="Yêu cầu nhập hàng | TPF-SIMS" />
      <div className="flex flex-col h-[calc(100vh-64px)] -m-6 p-6 gap-4" style={{ backgroundColor: "var(--bg-main)" }}>

        {/* ── Title bar ── */}
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: "var(--text-main)" }}>
              <FileStack size={22} style={{ color: "var(--brand-primary)" }} />
              Yêu cầu nhập hàng
            </h1>
            <p className="text-[13px] mt-0.5" style={{ color: "var(--text-placeholder)" }}>
              {filtered.length} yêu cầu
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold cursor-pointer transition-all"
            style={{ background: "var(--brand-primary)", color: "#fff" }}
          >
            <Plus size={16} /> Tạo yêu cầu mới
          </button>
        </div>

        {/* ── Empty state ── */}
        {manufacturingOrders.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-5">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center" style={{ background: "var(--status-focus)" }}>
              <FileStack size={40} style={{ color: "var(--brand-primary)" }} />
            </div>
            <div className="text-center">
              <p className="text-[16px] font-bold mb-1" style={{ color: "var(--text-main)" }}>Chưa có yêu cầu nhập hàng nào</p>
              <p className="text-[13px]" style={{ color: "var(--text-placeholder)" }}>
                Nhấn "Tạo yêu cầu mới" để tổng hợp sản phẩm từ các đơn hàng cần gia công
              </p>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[14px] font-bold cursor-pointer transition-all"
              style={{ background: "var(--brand-primary)", color: "#fff" }}
            >
              <Plus size={16} /> Tạo yêu cầu đầu tiên
            </button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={paginated}
            onRowClick={(o) => setDetailOrder(o)}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            hasActiveFilters={hasActiveFilters}
            clearAllFilters={() => setSearchTerm("")}
            rowActions={[
              {
                icon: Eye,
                label: "Xem chi tiết",
                onClick: (o) => setDetailOrder(o),
              },
              {
                icon: Printer,
                label: "In yêu cầu",
                onClick: (o) => { setDetailOrder(o); },
              },
              {
                icon: Trash2,
                label: "Xóa yêu cầu",
                onClick: (o) => handleDelete(o.id),
                className: "bg-white border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200",
                requireConfirm: true,
                confirmTitle: "Xóa yêu cầu nhập hàng?",
                confirmMessage: "Phiếu sẽ bị xóa vĩnh viễn. Bạn chắc chắn chứ?",
              },
            ]}
            pagination={{
              total: filtered.length,
              currentPage,
              setCurrentPage,
              itemsPerPage,
              setItemsPerPage,
            }}
          />
        )}
      </div>

      {/* ── Modals ── */}
      {showCreate && (
        <CreateManufacturingOrderModal
          orders={allOrders}
          catalogProducts={allProducts}
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}

      {detailOrder && (
        <ManufacturingOrderDetail
          order={detailOrder}
          onClose={() => setDetailOrder(null)}
        />
      )}
    </>
  );
}
