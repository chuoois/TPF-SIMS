/**
 * RequirementsListing — Danh sách yêu cầu thiết kế (UNIFIED)
 * Handles both Sales and Owner roles.
 */

import { useState, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import { PageHelmet } from "@/components/seo/PageHelmet";
import {
  Calendar,
  AlertCircle,
  Package,
  Eye,
  Image as ImageIcon,
} from "lucide-react";
import DataTable from "@/components/control/DataTable";
import ConfirmModal from "@/components/control/ConfirmModal";
import useCachedFetch from "@/hooks/useCachedFetch";
import customRequestService from "@/services/customRequest.service";
import { STATUS_MAP, STATUS_CONFIG, REVERSE_STATUS_MAP } from "@/constants/customRequest.constants";
import RequirementDetailModal, { ImageViewer } from "./RequirementDetailModal";
import { formatShortDateVN, isoToDisplayDate } from "@/lib/dateUtils";

export default function RequirementsListing({ userRole = 'sales' }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [selectedReq, setSelectedReq] = useState(null);
  const [selectedReqId, setSelectedReqId] = useState(null);
  const [enlargedImg, setEnlargedImg] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [cancelTarget, setCancelTarget] = useState(null);

  const statusFilter = searchParams.get("status") || "Tất cả";
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  const fetchFn = useCallback(async () => {
    const params = {
      page: currentPage,
      limit: itemsPerPage,
      status: statusFilter !== "Tất cả" ? REVERSE_STATUS_MAP[statusFilter] : undefined,
      search: searchTerm.trim() || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    };
    const response = await customRequestService.getAllRequests(params);

    return {
      items: response.data.map((r) => {
        const itemNames = (r.items || []).map(it => it.item_name).filter(Boolean);
        const hasBundle = (r.items || []).some(it => Number(it.item_is_bundle) === 1);

        return {
          id: r.pk_custom_request_id,
          code: r.request_code,
          customer: r.customer?.full_name || "Khách lẻ",
          phone: r.customer?.phone_number || "",
          createdDate: r.createdate,
          status: STATUS_MAP[r.status] || "Đang xử lý",
          address: r.address,
          notes: r.note,
          totalAmount: r.total_amount,
          deliveryDate: r.expected_fulfillment_date,
          thumbnail: r.items?.[0]?.item_img,
          customerImages: (r.items || []).flatMap((it) => it.customer_img || []),
          productNames: itemNames.join(", "),
          itemCount: itemNames.length,
          hasBundle,
          expectedWorkshopDate: (r.items || []).reduce((max, item) => {
            if (!item.expected_supplier_date) return max;
            const itemDate = String(item.expected_supplier_date).split("T")[0];
            return !max || itemDate > max ? itemDate : max;
          }, null),
        };
      }),
      total: response.pagination.totalItems,
      counts: response.statusCounts || {}
    };
  }, [currentPage, itemsPerPage, statusFilter, searchTerm, dateFrom, dateTo]);

  const { data: cachedData, isLoading, isRefreshing, refresh } = useCachedFetch(
    `${userRole}_reqs_${statusFilter}_${currentPage}_${searchTerm}_${dateFrom}_${dateTo}`,
    fetchFn,
    { ttl: 1000 * 60 * 5 }
  );

  const requirements = cachedData?.items || [];
  const totalItems = cachedData?.total || 0;
  const statusCountsFromApi = cachedData?.counts || {};

  // ─── handleViewDetail: map đầy đủ tất cả fields từ API ───────────────────
  const handleViewDetail = async (id) => {
    try {
      const response = await customRequestService.getRequestById(id);
      const r = response.data;
      const detailedReq = {
        id: r.pk_custom_request_id,
        code: r.request_code,
        customer: r.customer?.full_name || "Khách lẻ",
        phone: r.customer?.phone_number || "",
        address: r.address,
        createdDate: r.createdate,
        status: STATUS_MAP[r.status],
        notes: r.note,
        estimatedPrice: r.total_estimated_price,
        totalAmount: r.total_amount,
        depositAmount: r.deposit_amount,
        deliveryMethod: r.fulfillment_method,
        deliveryDate: r.expected_fulfillment_date,
        items: (r.items || []).map((item) => ({
          id: item.pk_custom_request_item_id,
          name: item.item_name,
          material: item.item_material,
          color: item.item_color,
          qty: item.item_quantity,
          price: item.item_price,
          item_cost_price: item.item_cost_price || item.cost_price,
          specs: {
            length: item.item_size?.length,
            width: item.item_size?.width,
            height: item.item_size?.height,
            note: item.item_note,
          },
          customerImages: item.customer_img || [],
          designImages: item.design_img || [],
          fk_supplier_id: item.fk_supplier_id,
          expectedWorkshopDate: item.expected_supplier_date,
          // ✅ Bundle fields — bắt buộc để hiển thị đúng loại sản phẩm
          item_is_bundle: item.item_is_bundle ?? 0,
          item_bundle_items: item.item_bundle_items || [],
        })),
      };
      setSelectedReq(detailedReq);
      setSelectedReqId(r.pk_custom_request_id);
    } catch (error) {
      console.error("Detail error:", error);
      toast.error("Không thể tải chi tiết yêu cầu");
    }
  };

  const columns = [
    { header: "STT", render: (_, idx) => (currentPage - 1) * itemsPerPage + idx + 1, headerClassName: "w-[60px] text-center", className: "text-center font-medium text-slate-400" },
    { header: "Mã yêu cầu", key: "code", className: "font-mono font-bold text-slate-700" },
    {
      header: "Ảnh mẫu", headerClassName: "w-[120px] text-center", className: "text-center",
      render: (r) => (
        <div className="flex justify-center gap-1 flex-wrap max-w-[120px] mx-auto">
          {r.customerImages && r.customerImages.length > 0 ? (
            r.customerImages.map((img, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded border border-slate-100 bg-slate-50 overflow-hidden cursor-zoom-in group relative shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setEnlargedImg(img);
                }}
              >
                <img
                  src={img}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                />
              </div>
            ))
          ) : (
            <div className="w-8 h-8 rounded border border-slate-100 bg-slate-50 overflow-hidden flex items-center justify-center text-slate-300">
              <ImageIcon size={14} />
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Khách hàng",
      render: (r) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900">{r.customer}</span>
          <span className="text-[11px] text-slate-400 font-medium">{r.phone}</span>
        </div>
      ),
    },
    {
      header: "Sản phẩm",
      className: "max-w-[200px]",
      render: (r) => (
        <div className="flex flex-col gap-1">
          <span className="text-[13px] font-medium text-slate-700 truncate max-w-full" title={r.productNames}>
            {r.productNames || "---"}
          </span>
          {r.itemCount > 0 && (
            <span className="text-[10px] text-slate-400 font-medium italic">
              {r.itemCount} sản phẩm
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Ngày tạo",
      headerClassName: "text-center",
      className: "text-center",
      render: (r) => formatShortDateVN(r.createdDate) || "---"
    },
    {
      header: "Giao hàng (Dự kiến)",
      headerClassName: "text-center",
      className: "text-center",
      render: (r) => (
        <div className="flex items-center justify-center gap-2 text-indigo-600">
          <Calendar size={14} className="text-indigo-300" />
          <span className="font-bold">{isoToDisplayDate(r.deliveryDate) || "---"}</span>
        </div>
      ),
    },
    {
      header: "Xong xưởng (Dự kiến)",
      headerClassName: "text-center",
      className: "text-center",
      render: (r) => (
        <div className="flex items-center justify-center gap-2 text-amber-600">
          <Calendar size={14} className="text-amber-300" />
          <span className="font-bold">{isoToDisplayDate(r.expectedWorkshopDate) || "---"}</span>
        </div>
      ),
    },
    {
      header: "Trạng thái",
      headerClassName: "text-center",
      className: "text-center",
      render: (r) => {
        const sc = STATUS_CONFIG[r.status] || STATUS_CONFIG["Chờ tiếp nhận"];
        return (
          <div className="inline-flex justify-center">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold border flex items-center" style={{ backgroundColor: sc.bg, color: sc.text, borderColor: sc.border }}>
              <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: sc.text }}></span>
              {r.status}
            </span>
          </div>
        );
      },
    },
  ];

  const rowActions = [
    { label: "Chi tiết", icon: Eye, onClick: (r) => handleViewDetail(r.id), className: "text-indigo-600 hover:bg-indigo-50" },
    {
      label: "Hủy", icon: AlertCircle,
      className: "bg-white border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600",
      showIf: (r) => r.status === "Chờ tiếp nhận",
      requireConfirm: true,
      confirmTitle: "Xác nhận hủy yêu cầu?",
      confirmMessage: (r) => `Bạn có chắc chắn muốn hủy yêu cầu mã ${r.code}? Hành động này không thể hoàn tác.`,
      onClick: async (r) => {
        try {
          await customRequestService.updateStatus(r.id, { status: 0 });
          toast.success("Đã hủy yêu cầu thành công");
          refresh();
        } catch (error) {
          toast.error("Lỗi khi hủy yêu cầu");
        }
      },
    },
  ];

  const bulkActions = [
    {
      label: "HỦY HÀNG LOẠT", icon: AlertCircle, className: "text-red-600 hover:bg-red-50",
      showIf: (selectedRows) => selectedRows.some((r) => r.status === "Chờ tiếp nhận"),
      requireConfirm: true,
      confirmTitle: "Hủy hàng loạt yêu cầu?",
      confirmMessage: (selectedRows) => `Bạn có chắc chắn muốn hủy ${selectedRows.filter(r => r.status === "Chờ tiếp nhận").length} yêu cầu 'Chờ tiếp nhận'?`,
      onClick: async (selectedRows) => {
        const cancelableIds = selectedRows.filter(r => r.status === "Chờ tiếp nhận").map(r => r.id);
        try {
          await Promise.all(cancelableIds.map(id => customRequestService.updateStatus(id, { status: 0 })));
          toast.success(`Đã hủy ${cancelableIds.length} yêu cầu`);
          refresh();
          setSelectedIds([]);
        } catch (error) {
          toast.error("Lỗi khi xử lý hàng loạt");
        }
      },
    },
  ];

  const hasActiveFilters = statusFilter !== "Tất cả" || dateFrom || dateTo || searchTerm;

  return (
    <>
      <PageHelmet title={userRole === 'owner' ? "Yêu cầu khách hàng | Quản lý" : "Yêu cầu khách hàng | Sales"} />

      <div className="flex flex-col h-[calc(100vh-64px)] -m-6 p-6 space-y-4" style={{ backgroundColor: "var(--bg-main)" }}>
        {/* Header Section */}
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: "var(--text-main)" }}>
              <Package size={22} style={{ color: "var(--brand-primary)" }} />
              Quản lý Yêu cầu Thiết kế
            </h1>
            <p className="text-[13px] mt-0.5" style={{ color: "var(--text-placeholder)" }}>
              {totalItems} yêu cầu ({userRole === 'owner' ? 'điều phối sản xuất' : 'tiếp nhận sales'})
            </p>
          </div>
        </div>

        {/* Status Filter Row */}
        <div className="flex items-center gap-2 shrink-0 px-1 overflow-x-auto no-scrollbar pb-1">
          {["Tất cả", "Chờ tiếp nhận", "Đã tiếp nhận", "Hoàn thành", "Đã hủy"].map((status) => {
            const count = status === "Tất cả"
              ? totalItems
              : statusCountsFromApi[REVERSE_STATUS_MAP[status]] || 0;
            const isActive = statusFilter === status;
            const sc = STATUS_CONFIG[status];

            return (
              <button
                key={status}
                onClick={() => setSearchParams({ status })}
                className="px-4 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer flex items-center gap-2 border"
                style={isActive ? {
                  backgroundColor: sc ? sc.bg : "#fff",
                  color: sc ? sc.text : "var(--brand-primary)",
                  borderColor: sc ? sc.border : "var(--grid-border)"
                } : {
                  backgroundColor: "transparent",
                  borderColor: "transparent",
                  color: "var(--text-secondary)"
                }}
              >
                {status !== "Tất cả" && sc?.icon && <sc.icon size={14} />}
                {status}
                <span className="text-[10px] opacity-60 bg-black/5 px-1.5 rounded-md ml-0.5">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={requirements}
          isLoading={isLoading}
          isRefreshing={isRefreshing}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          searchPlaceholder="Tìm mã yêu cầu, tên KH, SĐT, tên SP..."
          dateFrom={dateFrom}
          setDateFrom={setDateFrom}
          dateTo={dateTo}
          setDateTo={setDateTo}
          hasActiveFilters={hasActiveFilters}
          clearAllFilters={() => { setSearchParams({ status: "Tất cả" }); setDateFrom(""); setDateTo(""); setSearchTerm(""); }}
          pagination={{
            total: totalItems,
            currentPage: currentPage,
            setCurrentPage: setCurrentPage,
            itemsPerPage: itemsPerPage,
            setItemsPerPage: setItemsPerPage,
          }}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          rowActions={rowActions}
          bulkActions={bulkActions}
          onRowClick={(r) => handleViewDetail(r.id)}
        />
      </div>

      {selectedReq && (
        <RequirementDetailModal
          req={selectedReq}
          userRole={userRole}
          onClose={() => { setSelectedReq(null); setSelectedReqId(null); }}
          onEnlarge={setEnlargedImg}
          onRefresh={() => { handleViewDetail(selectedReqId); refresh(); }}
        />
      )}

      {enlargedImg && <ImageViewer src={enlargedImg} onClose={() => setEnlargedImg(null)} />}
    </>
  );
}