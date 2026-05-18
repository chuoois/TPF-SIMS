import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { PageHelmet } from "@/components/seo/PageHelmet";
import {
    Tag, Plus, Pencil, Trash2,
    Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import DataTable from "@/components/control/DataTable";
import ConfirmModal from "@/components/control/ConfirmModal";
import couponService from "@/services/coupon.service";

// ─── Helpers ───────────────────────────────────────────────────────────────
const fmtDate = (iso) => {
    if (!iso) return "Không giới hạn";
    const d = new Date(iso);
    return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const fmtDiscount = (value) => {
    const num = Number(String(value).replace(',', '.'));
    return `${isNaN(num) ? value : num}%`;
};

// ─── Sub-components ────────────────────────────────────────────────────────

/** Expiry badge simplified */
function ExpiryBadge({ toDate, isActive }) {
    if (!toDate) return <span className="text-gray-400 text-[10px]">Vô thời hạn</span>;
    const expired = new Date(toDate) < new Date();
    return (
        <span className={cn(
            "inline-flex w-fit px-2 py-0.5 rounded-lg text-[10px] font-bold border",
            expired
                ? "bg-red-50 text-red-600 border-red-100"
                : isActive
                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                    : "bg-gray-100 text-gray-500 border-gray-200"
        )}>
            {expired ? "Hết hạn" : isActive ? "Còn hạn" : "Đã tắt"}
        </span>
    );
}

// ─── Main ──────────────────────────────────────────────────────────────────
export default function CouponListPage() {
    const navigate = useNavigate();
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [totalItems, setTotalItems] = useState(0);
    const [selectedIds, setSelectedIds] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [couponToDelete, setCouponToDelete] = useState(null);

    // ── Fetch coupons from API ──────────────────────────────────────────────
    const fetchCoupons = useCallback(async () => {
        try {
            setLoading(true);
            const res = await couponService.getAllCoupons({
                search: searchTerm.trim() || undefined,
                page: currentPage,
                limit: itemsPerPage,
            });
            setCoupons(res.data || []);
            setTotalItems(res.pagination?.totalItems || 0);
        } catch (error) {
            console.error("Fetch coupons error:", error);
            toast.error("Không thể tải danh sách mã giảm giá");
        } finally {
            setLoading(false);
        }
    }, [searchTerm, currentPage, itemsPerPage]);

    useEffect(() => {
        fetchCoupons();
    }, [fetchCoupons]);

    // Reset về trang 1 khi search
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    // Delete logic
    const handleDelete = (item) => {
        setCouponToDelete(item);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!couponToDelete) return;
        try {
            await couponService.deleteCoupon({ id: couponToDelete.pk_coupon_id });
            setShowDeleteModal(false);
            setCouponToDelete(null);
            toast.success("Đã xóa mã coupon thành công!");
            fetchCoupons();
        } catch (error) {
            toast.error(error?.response?.data?.message || "Lỗi khi xóa mã giảm giá");
        }
    };

    const handleBulkDelete = async () => {
        try {
            await couponService.deleteCoupon({ ids: selectedIds });
            setSelectedIds([]);
            toast.success(`Đã xóa ${selectedIds.length} mã coupon thành công!`);
            fetchCoupons();
        } catch (error) {
            toast.error(error?.response?.data?.message || "Lỗi khi xóa hàng loạt");
        }
    };

    const columns = [
        {
            header: "STT",
            headerClassName: "w-[60px] text-center",
            className: "text-center font-medium text-slate-400",
            render: (_, index) => (currentPage - 1) * itemsPerPage + index + 1
        },
        {
            header: "Tên Coupon",
            render: (c) => c.coupon_name || c.coupon_code,
        },
        {
            header: "Mã giảm giá",
            render: (c) => (
                <code className="px-2 py-0.5 rounded-md text-[12px] font-mono font-bold tracking-wider"
                    style={{ backgroundColor: "var(--status-focus)", color: "var(--brand-primary)" }}>
                    {c.coupon_code}
                </code>
            ),
        },
        {
            header: "Mức giảm",
            render: (c) => (
                <span className={cn(
                    "inline-flex px-2.5 py-1 rounded-lg text-[13px] font-bold border tracking-tight w-fit",
                    "bg-purple-50 text-purple-600 border-purple-100"
                )}>
                    {fmtDiscount(c.discount_percent)}
                </span>
            )
        },
        {
            header: "Áp dụng",
            render: (c) => {
                const productCount = c.products?.length || 0;
                return (
                    <div className="flex items-center gap-2">
                        {productCount === 0 ? (
                            <span className="text-[12px] font-medium text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                                <Package size={12} className="opacity-40" /> Tất cả SP
                            </span>
                        ) : (
                            <span className="text-[12px] font-bold flex items-center gap-1.5 uppercase tracking-wider"
                                style={{ color: "var(--brand-primary)" }}>
                                <Package size={12} /> {productCount} Sản phẩm
                            </span>
                        )}
                    </div>
                );
            }
        },
        {
            header: "Hiệu lực",
            className: "max-w-[160px]",
            render: (c) => (
                <div className="flex flex-col gap-0.5 whitespace-nowrap">
                    <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                        {fmtDate(c.start_date)} ~ {c.end_date ? fmtDate(c.end_date) : "∞"}
                    </span>
                    <ExpiryBadge toDate={c.end_date} isActive={c.status === 1} />
                </div>
            )
        }
    ];

    return (
        <>
            <PageHelmet title="Mã giảm giá | TPF-SIMS" />

            <div className="flex flex-col h-[calc(100vh-64px)] -m-6 p-6 space-y-4" style={{ backgroundColor: "var(--bg-main)" }}>

                {/* Header Section */}
                <div className="flex items-center justify-between shrink-0">
                    <div>
                        <h1 className="text-xl font-bold flex items-center gap-2"
                            style={{ color: "var(--text-main)" }}>
                            <Tag size={22} style={{ color: "var(--brand-primary)" }} />
                            Quản lý mã giảm giá
                        </h1>
                        <p className="text-[13px] mt-0.5"
                            style={{ color: "var(--text-placeholder)" }}>
                            {totalItems} coupons ({searchTerm ? "đang lọc" : "toàn bộ"})
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/owner/coupons/create")}
                        className="h-10 px-6 rounded-xl flex items-center gap-2 text-[13px] font-bold text-white transition-all hover:opacity-90 shadow-sm active:scale-95 cursor-pointer"
                        style={{ backgroundColor: "var(--brand-primary)" }}
                    >
                        <Plus size={18} /> Thêm mã giảm giá
                    </button>
                </div>

                {/* DataTable Integration */}
                <DataTable
                    columns={columns}
                    data={coupons}
                    loading={loading}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    searchPlaceholder="Tìm mã coupon, tên khuyến mãi..."
                    selectedIds={selectedIds}
                    setSelectedIds={setSelectedIds}
                    idField="pk_coupon_id"
                    pagination={{
                        total: totalItems,
                        currentPage,
                        setCurrentPage,
                        itemsPerPage,
                        setItemsPerPage
                    }}
                    onRowClick={(item) => navigate(`/owner/coupons/${item.pk_coupon_id}/edit`)}
                    rowActions={[
                        {
                            icon: Pencil,
                            label: "Chỉnh sửa",
                            onClick: (item) => navigate(`/owner/coupons/${item.pk_coupon_id}/edit`),
                        },
                        {
                            icon: Trash2,
                            label: "Xóa coupon",
                            onClick: (item) => handleDelete(item),
                            className: "bg-white border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200",
                        },
                    ]}
                    bulkActions={[
                        {
                            label: "XÓA HÀNG LOẠT",
                            icon: Trash2,
                            onClick: handleBulkDelete,
                            requireConfirm: true,
                            confirmTitle: "Xóa hàng loạt coupon?",
                            confirmMessage: `Bạn có chắc chắn muốn xóa ${selectedIds.length} mã giảm giá đã chọn?`
                        }
                    ]}
                />
            </div>

            <ConfirmModal
                isOpen={showDeleteModal}
                title="Xác nhận xóa mã giảm giá"
                message={`Bạn có chắc chắn muốn xóa vĩnh viễn coupon "${couponToDelete?.coupon_name}" (${couponToDelete?.coupon_code}) không? Thao tác này không thể hoàn tác.`}
                onConfirm={confirmDelete}
                onCancel={() => setShowDeleteModal(false)}
            />
        </>
    );
}
