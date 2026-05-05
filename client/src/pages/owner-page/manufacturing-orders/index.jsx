/**
 * ManufacturingOrdersPage
 * Trang quản lý Yêu cầu nhập hàng — Owner
 * Chỉ gom đơn hàng và tạo phiếu, không có trạng thái
 */

import { useState, useMemo } from "react";
import {
  FileStack,
  Plus,
  Search,
  Printer,
  Eye,
  Trash2,
  Clock,
  Calendar,
  XCircle,
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
    name: "Sập thờ Mai Điều chân 20",
    material: "Gỗ Mít",
    dimensions: "197x107x108",
    img: "https://images.unsplash.com/photo-1620608208153-90928221805b?q=80&w=600",
    importPrice: 8500000,
  },
  {
    id: "SP002",
    code: "TA-HM-160x200x55-XoanDao",
    name: "Tủ áo gỗ Xoan Đào (3 cánh)",
    material: "Gỗ xoan đào",
    dimensions: "160x200x55",
    img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=600",
    importPrice: 4500000,
  },
  {
    id: "SP004",
    code: "BG-NEW-Huong-CDG",
    name: "Bộ Ghế Âu Á Chương Cuốn Thư",
    material: "Gỗ Hương",
    dimensions: "Tay 10 - 6 món",
    img: "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?q=80&w=600",
    importPrice: 18000000,
  },
  {
    id: "SP005",
    code: "QT-DK-01",
    name: "Đế kê tượng gỗ Hương",
    material: "Gỗ Hương",
    dimensions: "30x30x20",
    img: "https://images.unsplash.com/photo-1595246140625-573b715d11dc?q=80&w=600",
    importPrice: 1200000,
  },
];

// ── Load all orders (same pattern as orders page) ────────────────────────────
function loadAllOrders() {
  try {
    const saved = JSON.parse(localStorage.getItem("tpf_simulated_orders") || "[]");
    const uniqueInitial = INITIAL_ORDERS.filter((io) => !saved.find((so) => so.id === io.id));
    const all = [...saved, ...uniqueInitial];
    
    // Patch importPrice for existing orders if missing
    return all.map(order => ({
      ...order,
      products: (order.products || []).map(p => {
        // Try to find a matching product in INITIAL_PRODUCTS or INITIAL_ORDERS to get importPrice
        const productDef = INITIAL_PRODUCTS.find(d => d.name === p.name);
        return { ...p, importPrice: p.importPrice || productDef?.importPrice || 0 };
      })
    }));
  } catch {
    return INITIAL_ORDERS;
  }
}

// ── Load all products (from catalog) ─────────────────────────────────────────
function loadAllProducts() {
  try {
    const saved = JSON.parse(localStorage.getItem("tpf_simulated_products") || "[]");
    if (saved.length > 0) {
      return saved.map(p => {
        const def = INITIAL_PRODUCTS.find(d => d.id === p.id || d.name === p.name);
        return { ...p, importPrice: p.importPrice || def?.importPrice || 0 };
      });
    }
    return INITIAL_PRODUCTS;
  } catch {
    return INITIAL_PRODUCTS;
  }
}

const STATUS_MAP = {
  "Mới tạo": { bg: "#F0FDF4", text: "#166534", border: "#BBF7D0" },
  "Đã hủy": { bg: "#FEF2F2", text: "#991B1B", border: "#FCA5A5" },
};

// ── Load manufacturing orders ─────────────────────────────────────────────────
function loadManufacturingOrders() {
  try {
    const list = JSON.parse(
      localStorage.getItem("tpf_manufacturing_orders") || "[]",
    );
    
    // Add a specific test order if it doesn't exist to show off multi-dates and financial fields
    const testId = "YCNH-20260505-TEST";
    if (!list.find(o => o.id === testId)) {
      list.unshift({
        id: testId,
        createdAt: new Date().toISOString(),
        supplierName: "Xưởng gỗ Gia Phát (Mẫu)",
        supplierId: "NCC001",
        items: [
          { productName: "Sập thờ Mai Điều chân 20", qty: 1, importPrice: 8500000, expectedDate: "2026-05-10", material: "Gỗ Mít", unit: "Cái" },
          { productName: "Bộ Ghế Âu Á Chương Cuốn Thư", qty: 1, importPrice: 18000000, expectedDate: "2026-05-15", material: "Gỗ Hương", unit: "Bộ" }
        ],
        totalAmount: 26500000,
        deposit: 10000000,
        status: "Mới tạo",
        orderIds: ["DH-MAU-01", "DH-MAU-02"],
        sourceOrderDetails: {
          "DH-MAU-01": { customerName: "Khách hàng A", type: "Hàng khách đặt" },
          "DH-MAU-02": { customerName: "Khách hàng B", type: "Hàng khách đặt" }
        }
      });
    }

    const hasStaleData = list.some((o) =>
      o.items?.some((it) => !it.material && !it.color && !it.finish),
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
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

export default function ManufacturingOrdersPage() {
  const [allOrders] = useState(loadAllOrders);
  const [allProducts] = useState(loadAllProducts);

  const getUniqueExpectedDates = (o) => {
    const dates = (o.items || [])
      .map((it) => it.expectedDate)
      .filter(Boolean)
      .sort((a, b) => new Date(a) - new Date(b));

    const unique = [...new Set(dates)];
    if (unique.length === 0)
      return o.expectedDate ? [new Date(o.expectedDate)] : [];
    return unique.map((d) => new Date(d));
  };

  const [manufacturingOrders, setManufacturingOrders] = useState(
    loadManufacturingOrders,
  );
  const [showCreate, setShowCreate] = useState(false);
  const [detailOrder, setDetailOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  const fmt = (n) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(n || 0);

  const persist = (list) => {
    setManufacturingOrders(list);
    localStorage.setItem("tpf_manufacturing_orders", JSON.stringify(list));
  };

  const handleCreated = (newOrder) => {
    const updated = [newOrder, ...manufacturingOrders];
    setManufacturingOrders(updated);
  };

  const handleCancel = (id) => {
    const updated = manufacturingOrders.map((o) =>
      o.id === id ? { ...o, status: "Đã hủy" } : o
    );
    persist(updated);
    toast.success("Đã hủy phiếu nhập hàng");
  };

  // ── Filter ──
  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return manufacturingOrders;
    const q = searchTerm.toLowerCase();
    return manufacturingOrders.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.orderIds?.some((id) => id.toLowerCase().includes(q)) ||
        o.note?.toLowerCase().includes(q),
    );
  }, [manufacturingOrders, searchTerm]);

  const paginated = useMemo(
    () =>
      filtered.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
      ),
    [filtered, currentPage, itemsPerPage],
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
        <p
          className="text-[13px] font-bold font-mono"
          style={{ color: "var(--text-main)" }}
        >
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
          <p
            className="text-[13px] font-bold"
            style={{ color: "var(--text-main)" }}
          >
            {o.supplierName || "—"}
          </p>
          {o.supplierId && (
            <p
              className="text-[11px] font-mono font-bold"
              style={{ color: "var(--text-placeholder)" }}
            >
              {o.supplierId}
            </p>
          )}
        </div>
      ),
    },
    {
      header: "Hẹn giao",
      render: (o) => {
        const dates = getUniqueExpectedDates(o);
        if (dates.length === 0)
          return <span className="text-[13px] text-gray-400">—</span>;

        const isOverdue = dates.some(
          (d) => d < new Date().setHours(0, 0, 0, 0) && o.status !== "Đã nhập kho",
        );

        return (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-start gap-1">
              <Clock
                size={12}
                className="mt-1"
                style={{
                  color: isOverdue ? "#ef4444" : "var(--text-placeholder)",
                }}
              />
              <div className="flex flex-col">
                {dates.map((d, i) => (
                  <span
                    key={i}
                    className="text-[13px] font-bold"
                    style={{ color: isOverdue ? "#ef4444" : "var(--text-main)" }}
                  >
                    {d.toLocaleDateString("vi-VN")}
                  </span>
                ))}
              </div>
            </div>
            {isOverdue && (
              <span className="text-[10px] font-bold text-rose-500 uppercase tracking-tight">
                Quá hạn
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: "Số SP",
      headerClassName: "text-center",
      className: "text-center",
      render: (o) => {
        const total = o.items?.reduce((s, i) => s + (i.qty || 0), 0) || 0;
        return (
          <div className="flex flex-col items-center gap-0.5">
            <span
              className="text-[14px] font-black"
              style={{ color: "var(--text-main)" }}
            >
              {total}
            </span>
            <span
              className="text-[11px]"
              style={{ color: "var(--text-placeholder)" }}
            >
              {o.items?.length || 0} dòng
            </span>
          </div>
        );
      },
    },
    {
      header: "Ghi chú",
      render: (o) => (
        <p
          className="text-[13px] truncate max-w-[200px]"
          style={{ color: "var(--text-secondary)" }}
        >
          {o.note || "—"}
        </p>
      ),
    },
  ];

  const hasActiveFilters = !!searchTerm;

  return (
    <>
      <PageHelmet title="Yêu cầu nhập hàng | TPF-SIMS" />
      <div
        className="flex flex-col h-[calc(100vh-64px)] -m-6 p-6 gap-4"
        style={{ backgroundColor: "var(--bg-main)" }}
      >
        {/* ── Title bar ── */}
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1
              className="text-xl font-bold flex items-center gap-2"
              style={{ color: "var(--text-main)" }}
            >
              <FileStack size={22} style={{ color: "var(--brand-primary)" }} />
              Yêu cầu nhập hàng
            </h1>
            <p
              className="text-[13px] mt-0.5"
              style={{ color: "var(--text-placeholder)" }}
            >
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
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center"
              style={{ background: "var(--status-focus)" }}
            >
              <FileStack size={40} style={{ color: "var(--brand-primary)" }} />
            </div>
            <div className="text-center">
              <p
                className="text-[16px] font-bold mb-1"
                style={{ color: "var(--text-main)" }}
              >
                Chưa có yêu cầu nhập hàng nào
              </p>
              <p
                className="text-[13px]"
                style={{ color: "var(--text-placeholder)" }}
              >
                Nhấn "Tạo yêu cầu mới" để tổng hợp sản phẩm từ các đơn hàng cần
                gia công
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
            rowClassName={(o) => o.status === "Đã hủy" ? "opacity-50 grayscale bg-gray-50" : ""}
            rowActions={[
              {
                icon: Eye,
                label: "Xem chi tiết",
                onClick: (o) => setDetailOrder(o),
              },
              {
                icon: Printer,
                label: "In yêu cầu",
                onClick: (o) => {
                  setDetailOrder(o);
                },
              },
              {
                icon: XCircle,
                label: "Hủy phiếu",
                onClick: (o) => handleCancel(o.id),
                className:
                  "bg-white border-gray-200 text-gray-400 hover:text-rose-500 hover:border-rose-200",
                requireConfirm: true,
                confirmTitle: "Hủy phiếu nhập hàng?",
                confirmMessage: "Bạn có chắc chắn muốn hủy phiếu này không?",
                showIf: (o) => o.status !== "Đã hủy",
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
