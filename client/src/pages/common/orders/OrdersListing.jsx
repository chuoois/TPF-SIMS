import { useState, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Package,
  Clock,
  Eye,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import DataTable from "@/components/control/DataTable";
import InvoiceDetailsPopup from "./InvoiceDetailsPopup";
import { ORDER_CONFIG } from "@/constants/orderConfig";
import orderService from "@/services/order.service";
import useCachedFetch from "@/hooks/useCachedFetch";
import { formatShortDateVN } from "@/lib/dateUtils";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
};

const getStatusColor = (statusName) => ORDER_CONFIG.STATUS_STYLE[statusName] || { bg: "#F3F4F6", text: "#374151", border: "#D1D5DB", icon: Clock };

export default function OrdersListing({ userRole = 'owner' }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "Hàng sẵn";
  const statusFilter = searchParams.get("status") || "Tất cả";

  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [detailId, setDetailId] = useState(null);

  const fetchFn = useCallback(async () => {
    const params = {
      page: currentPage,
      limit: itemsPerPage,
      search: searchTerm || undefined,
      order_type: activeTab !== "Tất cả" ? ORDER_CONFIG.REVERSE_TYPE_MAP[activeTab] : undefined,
      order_status: statusFilter !== "Tất cả" ? ORDER_CONFIG.REVERSE_STATUS_MAP[statusFilter] : undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    };
    const res = await orderService.getAllOrders(params);
    return {
      items: res?.data || [],
      total: res?.pagination?.totalItems || 0,
      statusCounts: res?.statusCounts || {},
    };
  }, [currentPage, itemsPerPage, searchTerm, activeTab, statusFilter, dateFrom, dateTo]);

  const cacheKey = `orders_${activeTab}_${statusFilter}_${searchTerm}_${dateFrom}_${dateTo}_${currentPage}_${itemsPerPage}`;

  const { data: cachedData, isLoading, isRefreshing, refresh } = useCachedFetch(
    cacheKey,
    fetchFn,
    { ttl: 1000 * 60 * 5 }
  );

  const orders = cachedData?.items || [];
  const totalItems = cachedData?.total || 0;
  const backendStatusCounts = cachedData?.statusCounts || {};

  const getCountForStatus = (statusName) => {
    if (statusName === "Tất cả") return backendStatusCounts["all"] || 0;
    const statusCode = ORDER_CONFIG.REVERSE_STATUS_MAP[statusName];
    return backendStatusCounts[statusCode] || 0;
  };

  const updateParams = (newParams) => {
    const current = Object.fromEntries(searchParams.entries());
    setSearchParams({ ...current, ...newParams });
    setCurrentPage(1);
  };

  const handleUpdateStatus = (id, newStatus) => {
    refresh();
  };



  const possibleStatuses = useMemo(() => {
    const statuses = ORDER_CONFIG.STATUSES_BY_TYPE[activeTab];
    if (statuses) return ["Tất cả", ...statuses];
    const allStatuses = Object.values(ORDER_CONFIG.STATUSES_BY_TYPE).flat();
    return ["Tất cả", ...new Set(allStatuses)];
  }, [activeTab]);

  const columns = useMemo(() => {
    if (statusFilter === "Đơn đã hủy") {
      return [
        {
          header: "Mã đơn",
          render: (o) => <p className="text-[13px] font-bold font-mono" style={{ color: "var(--text-main)" }}>DH-{o.pk_order_id}</p>,
        },
        {
          header: "Khách hàng",
          render: (o) => {
            const cName = o.customer?.full_name || "—";
            return (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[12px]" style={{ backgroundColor: "var(--bg-main)", color: "var(--text-placeholder)", border: "1px solid var(--grid-border)" }}>
                  {cName.charAt(0)}
                </div>
                <p className="text-[13px] font-semibold" style={{ color: "var(--text-main)" }}>{cName}</p>
              </div>
            );
          },
        },
        {
          header: "Tổng tiền",
          headerClassName: "text-right",
          render: (o) => <p className="text-[14px] font-bold text-[var(--text-placeholder)]">{formatCurrency(o.total_amount)}</p>,
          className: "text-right",
        },
        {
          header: "Đã thanh toán",
          headerClassName: "text-right",
          render: (o) => <p className="text-[14px] font-bold text-[var(--text-main)]">{formatCurrency((Number(o.deposit_amount) || 0) + (Number(o.received_amount) || 0))}</p>,
          className: "text-right",
        },
        {
          header: "Hoàn tiền",
          headerClassName: "text-right",
          render: (o) => {
            const isRefunded = o.deposit_resolution === "refunded";
            const refundAmt = isRefunded ? (Number(o.deposit_amount) || 0) + (Number(o.received_amount) || 0) : 0;
            return <p className="text-[14px] font-bold" style={{ color: refundAmt > 0 ? "var(--brand-primary)" : "var(--text-placeholder)" }}>{formatCurrency(refundAmt)}</p>;
          },
          className: "text-right",
        },
        {
          header: "Trạng thái hoàn tiền",
          headerClassName: "text-center",
          render: (o) => {
            const isRefunded = o.deposit_resolution === "refunded";
            return (
              <div className="flex items-center justify-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${isRefunded ? "bg-[var(--status-success)]" : "bg-[var(--status-error)]"}`} />
                <span className="text-[12px] font-bold" style={{ color: isRefunded ? "var(--status-success)" : "var(--status-error)" }}>
                  {isRefunded ? "Đã hoàn cọc" : "Mất cọc"}
                </span>
              </div>
            );
          },
          className: "text-center",
        },
        {
          header: "Trạng thái",
          headerClassName: "text-center",
          render: (o) => {
            const sc = getStatusColor("Đơn đã hủy");
            return (
              <div className="flex flex-col items-center gap-1">
                <span className="px-3 py-1 rounded-full text-[11px] font-bold border flex items-center" style={{ backgroundColor: sc.bg, color: sc.text, borderColor: sc.border }}>
                  <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: sc.text }}></span>
                  Đã huỷ
                </span>
              </div>
            );
          },
          className: "text-center",
        },
        {
          header: "Lý do",
          render: (o) => <p className="text-[12px] text-[var(--text-secondary)] italic truncate max-w-[150px]" title={o.cancel_reason || o.order_note}>{o.cancel_reason || o.order_note || "—"}</p>,
        }
      ];
    }

    return [
      {
        header: "STT",
        headerClassName: "text-center w-[60px]",
        render: (_, idx) => (currentPage - 1) * itemsPerPage + idx + 1,
        className: "text-center text-[13px] font-medium",
        style: { color: "var(--text-secondary)" },
      },
      {
        header: "Mã đơn",
        render: (o) => <p className="text-[13px] font-bold font-mono" style={{ color: "var(--text-main)" }}>{o.order_code}</p>,
      },
      {
        header: "Khách hàng",
        render: (o) => {
          const cName = o.customer?.full_name || "—";
          const cPhone = o.customer?.phone_number || "—";
          return (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[12px] group-hover:bg-white border transition" style={{ backgroundColor: "var(--bg-main)", color: "var(--text-placeholder)", borderColor: "var(--grid-border)" }}>
                {cName.charAt(0)}
              </div>
              <div>
                <p className="text-[13px] font-semibold" style={{ color: "var(--text-main)" }}>{cName}</p>
                <p className="text-[11px]" style={{ color: "var(--text-placeholder)" }}>{cPhone}</p>
              </div>
            </div>
          );
        },
      },
      {
        header: "Sản phẩm",
        render: (o) => (
          <p className="text-[13px] text-[var(--text-main)] truncate max-w-[180px]" title={o.product_names}>
            {o.product_names || "—"}
          </p>
        ),
      },
      {
        header: "Ngày tiếp nhận",
        headerClassName: "text-center",
        render: (o) => (
          <div className="flex flex-col items-center justify-center gap-1">
            <div className="flex items-center gap-1.5 text-gray-600 font-bold text-[13px]">
              {o.createdate ? formatShortDateVN(o.createdate) : "---"}
            </div>
          </div>
        ),
        className: "text-center",
      },
      {
        header: "Ngày giao dự kiến",
        headerClassName: "text-center",
        render: (o) => (
          <div className="flex flex-col items-center justify-center gap-1">
            <div className="flex items-center gap-1.5 text-gray-600 font-bold text-[13px]">
              <Clock size={12} className="text-gray-400" />
              {o.expected_fulfillment_date ? formatShortDateVN(o.expected_fulfillment_date) : "---"}
            </div>
          </div>
        ),
        className: "text-center",
      },
      {
        header: "Tổng tiền hàng",
        headerClassName: "text-right",
        render: (o) => <p className="text-[14px] font-bold" style={{ color: o.order_status === 0 ? "var(--text-placeholder)" : "var(--text-main)" }}>{formatCurrency(o.total_amount)}</p>,
        className: "text-right",
      },
      {
        header: "Còn lại",
        headerClassName: "text-right pr-10",
        render: (o) => {
          const total = Number(o.total_amount) || 0;
          const deposit = Number(o.deposit_amount) || 0;
          const received = Number(o.received_amount) || 0;
          const remaining = total - deposit - received;
          return <p className="text-[14px] font-bold" style={{ color: o.order_status === 0 ? "var(--text-placeholder)" : "var(--status-error)" }}>{formatCurrency(remaining > 0 ? remaining : 0)}</p>;
        },
        className: "text-right pr-10",
      },
      {
        header: "Trạng thái",
        headerClassName: "text-center",
        render: (o) => {
          const statusName = ORDER_CONFIG.STATUS_MAP[o.order_status] || "Chờ xử lý";
          const sc = getStatusColor(statusName);
          const hasInspection = Number(o.inspection_count) > 0 && o.order_status === 3;

          return (
            <div className="flex flex-col items-center gap-1">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold border flex items-center" style={{ backgroundColor: sc.bg, color: sc.text, borderColor: sc.border }}>
                <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: sc.text }}></span>
                {statusName}
              </span>
              {hasInspection && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black text-white bg-red-500 animate-pulse shadow-sm">
                  <AlertCircle size={10} /> CẦN NGHIỆM THU
                </span>
              )}
            </div>
          );
        },
        className: "text-center",
      }
    ];
  }, [statusFilter, currentPage, itemsPerPage]);

  const hasActiveFilters = statusFilter !== "Tất cả" || dateFrom || dateTo || searchTerm;

  return (
    <>
      <PageHelmet title="Quản lý đơn hàng | TPF-SIMS" />
      {(isLoading || isRefreshing) && (
        <div className="fixed top-0 left-0 right-0 z-[9999]">
          <div className="h-[2px] bg-indigo-500 animate-[loading_1.5s_infinite] origin-left"></div>
        </div>
      )}

      <div className="flex flex-col h-[calc(100vh-64px)] -m-6 p-6 gap-4" style={{ backgroundColor: "var(--bg-main)" }}>
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: "var(--text-main)" }}>
              <Package size={22} style={{ color: "var(--brand-primary)" }} />
              Quản lý đơn hàng
            </h1>
            <p className="text-[13px] mt-0.5" style={{ color: "var(--text-placeholder)" }}>{totalItems} đơn hàng ({activeTab.toLowerCase()})</p>
          </div>

          <div className="flex p-1 rounded-lg" style={{ backgroundColor: "var(--grid-header-bg)", border: "1px solid var(--grid-border)" }}>
            {ORDER_CONFIG.TYPES.map((tab) => (
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
                {s} <span className="text-[10px] opacity-60 bg-black/5 px-1.5 rounded-md ml-0.5">{getCountForStatus(s)}</span>
              </button>
            );
          })}
        </div>

        <DataTable
          columns={columns}
          data={orders}
          loading={isLoading}
          onRowClick={(o) => setDetailId(o.pk_order_id)}

          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          searchPlaceholder="Tìm mã đơn, tên/SĐT khách, tên SP..."
          dateFrom={dateFrom}
          setDateFrom={setDateFrom}
          dateTo={dateTo}
          setDateTo={setDateTo}
          hasActiveFilters={hasActiveFilters}
          clearAllFilters={() => { updateParams({ status: "Tất cả" }); setDateFrom(""); setDateTo(""); setSearchTerm(""); }}

          rowActions={[
            {
              icon: Eye,
              label: "Xem chi tiết",
              onClick: (o) => setDetailId(o.pk_order_id),
            },
          ]}

          pagination={{
            total: totalItems,
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
        userRole={userRole}
      />
    </>
  );
}
