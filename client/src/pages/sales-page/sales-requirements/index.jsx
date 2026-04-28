import { useState, useMemo, useEffect } from "react";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import { PageHelmet } from "@/components/seo/PageHelmet";
import {
  Calendar,
  AlertCircle,
  Package,
  Eye,
} from "lucide-react";
import DataTable from "@/components/control/DataTable";
import ConfirmModal from "@/components/control/ConfirmModal";
import RequirementDetailModal, { ImageViewer } from "./RequirementDetailModal";
import { STATUS_CONFIG, STATUS_MAP, REVERSE_STATUS_MAP } from "./mockData";
import customRequestService from "@/services/customRequest.service";

// ===================== MAIN COMPONENT =====================
export default function SalesRequirements() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [statusCountsFromApi, setStatusCountsFromApi] = useState({});
  const [selectedReq, setSelectedReq] = useState(null);
  const [selectedReqId, setSelectedReqId] = useState(null);
  const [enlargedImg, setEnlargedImg] = useState(null);

  // Selection State
  const [selectedIds, setSelectedIds] = useState([]);

  // Cancellation States
  const [cancelTarget, setCancelTarget] = useState(null);

  // Column definitions for DataTable
  const columns = [
    {
      header: "STT",
      render: (_, idx) => (currentPage - 1) * itemsPerPage + idx + 1,
      headerClassName: "w-[60px] text-center",
      className: "text-center font-medium text-slate-400",
    },
    {
      header: "Mã yêu cầu",
      key: "code",
      className: "font-mono font-bold text-slate-700",
    },
    {
      header: "Khách hàng",
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center font-bold text-[12px] text-slate-400 uppercase">
            {r.customer.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-slate-800 leading-tight">
              {r.customer}
            </p>
            <p className="text-[11px] text-slate-400 font-medium">{r.phone}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Ngày nhận",
      render: (r) => (
        <div className="flex items-center gap-2 text-slate-600">
          <Calendar size={14} className="text-slate-300" />
          <span className="font-medium">
            {r.createdDate?.split("T")[0].split("-").reverse().join("/")}
          </span>
        </div>
      ),
    },
    {
      header: "Trạng thái",
      headerClassName: "text-right pr-12",
      className: "text-right pr-12",
      render: (r) => {
        const sc = STATUS_CONFIG[r.status] || STATUS_CONFIG["Đang xử lý"];
        return (
          <div className="flex justify-end">
            <span
              className="inline-flex items-center px-2.5 py-1 text-[11px] font-bold rounded-lg border min-w-[120px] justify-center"
              style={{
                backgroundColor: sc.bg,
                color: sc.text,
                borderColor: sc.border,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full mr-1.5"
                style={{ backgroundColor: sc.text }}
              ></span>
              {r.status}
            </span>
          </div>
        );
      },
    },
  ];

  const statusFilter = searchParams.get("status") || "Tất cả";
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  const fetchRequirements = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        status: statusFilter !== "Tất cả" ? REVERSE_STATUS_MAP[statusFilter] : undefined,
        search: searchTerm.trim() || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      };
      const response = await customRequestService.getAllRequests(params);
      
      const mapped = response.data.map((r) => ({
        id: r.pk_custom_request_id,
        code: r.request_code,
        customer: r.customer?.full_name || "Khách lẻ",
        phone: r.customer?.phone_number || "",
        createdDate: r.createdate,
        status: STATUS_MAP[r.status] || "Đang xử lý",
        address: r.address,
        notes: r.note,
        totalAmount: r.total_amount,
      }));

      setRequirements(mapped);
      setTotalItems(response.pagination.totalItems);
      setStatusCountsFromApi(response.statusCounts || {});
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Không thể tải danh sách yêu cầu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequirements();
  }, [currentPage, itemsPerPage, statusFilter, searchTerm, dateFrom, dateTo]);

  const handleViewDetail = async (id) => {
    try {
      const response = await customRequestService.getRequestById(id);
      const r = response.data;
      
      // Map detail data
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
          specs: {
            dimensions: item.item_size
              ? `${item.item_size.length}x${item.item_size.width}x${item.item_size.height} ${item.item_size.unit || "cm"}`
              : "",
            note: item.item_note,
          },
          customerImages: item.customer_img || [],
          designImages: item.design_img || [],
          quotedPrice: item.item_price,
        })),
      };
      
      setSelectedReq(detailedReq);
      setSelectedReqId(r.pk_custom_request_id);
    } catch (error) {
      console.error("Detail error:", error);
      toast.error("Không thể tải chi tiết yêu cầu");
    }
  };

  const handleCancelSubmit = async (target = cancelTarget) => {
    if (!target) return;
    try {
      await customRequestService.updateStatus(target.id, { 
        status: REVERSE_STATUS_MAP["Đơn đã hủy"] 
      });
      toast.success(`Đã hủy yêu cầu ${target.code} thành công`);
      fetchRequirements();
      setCancelTarget(null);
      setSelectedReqId(null);
      setSelectedReq(null);
    } catch (error) {
      toast.error("Lỗi khi hủy yêu cầu");
    }
  };

  const rowActions = [
    {
      label: "Hủy yêu cầu",
      icon: AlertCircle,
      className:
        "bg-white border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200",
      showIf: (r) => r.status === "Đang xử lý",
      requireConfirm: true,
      confirmTitle: "Xác nhận hủy yêu cầu?",
      confirmMessage: (r) =>
        `Bạn có chắc chắn muốn hủy yêu cầu thiết kế mã ${r.code} của khách hàng ${r.customer}? Hành động này không thể hoàn tác.`,
      onClick: (r) => {
        setCancelTarget(r);
        handleCancelSubmit(r);
      },
    },
    {
      label: "Xem chi tiết",
      icon: Eye,
      className:
        "bg-white border-slate-100 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100",
      onClick: (r) => handleViewDetail(r.id),
    },
  ];

  const updateParams = (newParams) => {
    const current = Object.fromEntries(searchParams.entries());
    setSearchParams({ ...current, ...newParams });
  };

  const statusCounts = useMemo(() => {
    const counts = { "Tất cả": totalItems };
    Object.keys(STATUS_CONFIG).forEach((label) => {
      const numericStatus = REVERSE_STATUS_MAP[label];
      counts[label] = statusCountsFromApi[numericStatus] || 0;
    });
    return counts;
  }, [statusCountsFromApi, totalItems]);

  const hasActiveFilters =
    statusFilter !== "Tất cả" || searchTerm || dateFrom || dateTo;
  const clearAllFilters = () => {
    updateParams({ status: "Tất cả" });
    setSearchTerm("");
    setDateFrom("");
    setDateTo("");
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateFrom, dateTo]);

  return (
    <>
      <PageHelmet title="Yêu cầu khách hàng | Sales" />

      <div
        className="flex flex-col h-[calc(100vh-64px)] -m-6 p-6 space-y-4"
        style={{ backgroundColor: "var(--bg-main)" }}
      >
        {/* Header Section */}
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1
              className="text-xl font-bold flex items-center gap-2"
              style={{ color: "var(--text-main)" }}
            >
              <Package size={22} style={{ color: "var(--brand-primary)" }} />
              Yêu cầu từ khách hàng
            </h1>
            <p
              className="text-[13px] mt-0.5"
              style={{ color: "var(--text-placeholder)" }}
            >
              {totalItems} yêu cầu ({statusFilter.toLowerCase()})
            </p>
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap py-1">
          {["Tất cả", ...Object.keys(STATUS_CONFIG)].map((s) => {
            const isActive = statusFilter === s;
            const sc = s !== "Tất cả" ? STATUS_CONFIG[s] : null;
            return (
              <button
                key={s}
                onClick={() => updateParams({ status: s })}
                className="px-4 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer flex items-center gap-2 border"
                style={{
                  backgroundColor: isActive
                    ? sc
                      ? sc.bg
                      : "#fff"
                    : "transparent",
                  color: isActive
                    ? sc
                      ? sc.text
                      : "var(--brand-primary)"
                    : "var(--text-secondary)",
                  borderColor: isActive
                    ? sc
                      ? sc.border
                      : "var(--grid-border)"
                    : "transparent",
                  boxShadow: isActive ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
                }}
              >
                {s !== "Tất cả" && (
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor: sc ? sc.text : "var(--brand-primary)",
                    }}
                  />
                )}
                {s}
                <span className="text-[10px] opacity-60 bg-black/5 px-1.5 rounded-md ml-0.5">
                  {statusCounts[s] || 0}
                </span>
              </button>
            );
          })}
        </div>

        {/* DataTable Section */}
        <DataTable
          columns={columns}
          data={requirements}
          isLoading={loading}
          onRowClick={(r) => handleViewDetail(r.id)}
          rowStyle={(item) => ({
            backgroundColor:
              item.status === "Đang xử lý"
                ? "rgba(14, 165, 233, 0.03)"
                : "transparent",
          })}
          // Selection
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          // Search & Filters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          searchPlaceholder="Mã yêu cầu, khách hàng..."
          dateFrom={dateFrom}
          setDateFrom={setDateFrom}
          dateTo={dateTo}
          setDateTo={setDateTo}
          hasActiveFilters={hasActiveFilters}
          clearAllFilters={clearAllFilters}
          // Row Actions (Hủy, Chi tiết)
          rowActions={rowActions}
          // Bulk Actions
          bulkActions={[
            {
              label: "HỦY HÀNG LOẠT",
              icon: AlertCircle,
              className: "text-red-600 hover:bg-red-50",
              showIf: (selectedRows) => {
                return selectedRows.some((r) => r.status === "Đang xử lý");
              },
              requireConfirm: true,
              confirmTitle: "Hủy hàng loạt yêu cầu?",
              confirmMessage: (selectedRows) => {
                const cancelableCount = selectedRows.filter(
                  (r) => r.status === "Đang xử lý",
                ).length;
                return `Bạn có chắc chắn muốn hủy ${cancelableCount} yêu cầu 'Đang xử lý' trong danh sách chọn? Hành động này không thể hoàn tác.`;
              },
              onClick: async (selectedRows) => {
                const cancelableIds = selectedRows
                  .filter((r) => r.status === "Đang xử lý")
                  .map((r) => r.id);

                try {
                  await Promise.all(
                    cancelableIds.map((id) =>
                      customRequestService.updateStatus(id, {
                        status: REVERSE_STATUS_MAP["Đơn đã hủy"],
                      }),
                    ),
                  );
                  setSelectedIds([]);
                  fetchRequirements();
                  toast.success(
                    `Đã hủy ${cancelableIds.length} yêu cầu thành công`,
                  );
                } catch (error) {
                  toast.error("Lỗi khi hủy hàng loạt");
                }
              },
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

        {/* Modal */}
        <RequirementDetailModal
          req={selectedReq}
          onClose={() => {
            setSelectedReq(null);
            setSelectedReqId(null);
          }}
          onEnlarge={(src) => setEnlargedImg(src)}
          onOpenCancel={(r) => setCancelTarget(r)}
        />

        <ConfirmModal
          isOpen={!!cancelTarget}
          title="Xác nhận hủy yêu cầu?"
          message={`Bạn có chắc chắn muốn hủy yêu cầu thiết kế mã ${cancelTarget?.code} của khách hàng ${cancelTarget?.customer}? Hành động này không thể hoàn tác.`}
          onConfirm={() => handleCancelSubmit(cancelTarget)}
          onCancel={() => setCancelTarget(null)}
        />

        {/* Image Viewer */}
        <ImageViewer src={enlargedImg} onClose={() => setEnlargedImg(null)} />
      </div>
    </>
  );
}
