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
import manufacturingOrderService from "@/services/manufacturingOrder.service";
import customRequestService from "@/services/customRequest.service";
import productService from "@/services/product.service";
import supplierService from "@/services/supplier.service";
import { useEffect, useCallback } from "react";
import useCachedFetch from "@/hooks/useCachedFetch";
import { formatDateTimeVN, formatDateVN } from "@/lib/dateUtils";


const STATUS_MAP = {
  "Mới tạo": { bg: "#F0FDF4", text: "#166534", border: "#BBF7D0" },
  "Đã hủy": { bg: "#FEF2F2", text: "#991B1B", border: "#FCA5A5" },
};

export default function ManufacturingOrdersPage() {
  const [allOrders, setAllOrders] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [allSuppliers, setAllSuppliers] = useState([]);


  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  const fetchFn = useCallback(async () => {
    const res = await manufacturingOrderService.getAllOrders({
      page: currentPage,
      limit: itemsPerPage,
      search: searchTerm,
    });
    return {
      items: res.data || [],
      total: res.pagination?.totalItems || 0,
    };
  }, [currentPage, itemsPerPage, searchTerm]);

  const {
    data: cachedData,
    isLoading,
    isRefreshing,
    refresh,
  } = useCachedFetch(
    `manufacturing_orders_${searchTerm}_${currentPage}_${itemsPerPage}`,
    fetchFn,
    { ttl: 1000 * 60 * 5 },
  );

  const manufacturingOrders = cachedData?.items || [];
  const totalItems = cachedData?.total || 0;

  const [showCreate, setShowCreate] = useState(false);
  const [detailOrder, setDetailOrder] = useState(null);

  const getUniqueExpectedDates = (o) => {
    const dates = (o.items || [])
      .map((it) => it.expectedDate || it.expected_date)
      .filter(Boolean)
      .sort((a, b) => new Date(a) - new Date(b));

    const unique = [...new Set(dates)];
    if (unique.length === 0)
      return o.expectedDate || o.expected_delivery_date
        ? [new Date(o.expectedDate || o.expected_delivery_date)]
        : [];
    return unique.map((d) => new Date(d));
  };

  const fetchInitialData = async () => {
    try {
      // Lấy danh sách yêu cầu hợp lệ để gom đơn (status = 2: Quoted)
      const resReq = await customRequestService.getAllRequests({
        status: 3,
        limit: 100,
      });
      setAllOrders(resReq.data || []);

      // Lấy danh mục sản phẩm
      const resProd = await productService.getAllProducts({ limit: 100 });
      setAllProducts(resProd.data || []);

      // Lấy danh sách nhà cung cấp
      const resSupp = await supplierService.getAllSuppliers();
      setAllSuppliers(resSupp.data || []);

    } catch (error) {
      console.error("Fetch initial data error:", error);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fmt = (n) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(n || 0);

  const handleCreated = () => {
    refresh();
    fetchInitialData();
  };

  const handleCancel = async (id) => {
    try {
      await manufacturingOrderService.updateStatus(id, { status: 0 });
      toast.success("Đã hủy phiếu nhập hàng");
      refresh();
    } catch (error) {
      toast.error("Không thể hủy phiếu");
    }
  };

  // ── Filter ──
  // Filter logic handled by API, using search from API
  const filtered = manufacturingOrders;

  const paginated = manufacturingOrders;

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
          {o.order_code || o.id}
        </p>
      ),
    },
    {
      header: "Ngày tạo",
      render: (o) => (
        <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
          {formatDateTimeVN(o.createdate || o.createdAt) || "—"}
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
            {o.supplier?.supplier_name || o.supplierName || "—"}
          </p>
          {(o.supplier?.pk_supplier_id || o.fk_supplier_id) && (
            <p
              className="text-[11px] font-mono font-bold"
              style={{ color: "var(--text-placeholder)" }}
            >
              NCC#{o.supplier?.pk_supplier_id || o.fk_supplier_id}
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
                    {formatDateVN(d) || "—"}
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
        const total = o.items?.reduce((s, i) => s + (i.quantity || i.qty || 0), 0) || 0;
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

      {/* ── Global Loading (The Purple Bar) ── */}
      {(isLoading || isRefreshing) && (
        <div className="fixed top-0 left-0 right-0 z-[9999]">
          <div className="h-[2px] bg-indigo-500 animate-[loading_1.5s_infinite] origin-left"></div>
        </div>
      )}

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
            onClick={() => {
              fetchInitialData();
              setShowCreate(true);
            }}
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
              onClick={() => {
                fetchInitialData();
                setShowCreate(true);
              }}
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
                onClick: (o) => handleCancel(o.pk_manufacturing_order_id || o.id),
                className:
                  "bg-white border-gray-200 text-gray-400 hover:text-rose-500 hover:border-rose-200",
                requireConfirm: true,
                confirmTitle: "Hủy phiếu nhập hàng?",
                confirmMessage: "Bạn có chắc chắn muốn hủy phiếu này không?",
                showIf: (o) => o.status !== 0 && o.status !== "Đã hủy",
              },
            ]}
            pagination={{
              total: totalItems,
              currentPage,
              setCurrentPage,
              itemsPerPage,
              setItemsPerPage,
            }}
            loading={isLoading}
          />
        )}
      </div>

      {/* ── Modals ── */}
      {showCreate && (
        <CreateManufacturingOrderModal
          orders={allOrders}
          catalogProducts={allProducts}
          suppliers={allSuppliers}
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
