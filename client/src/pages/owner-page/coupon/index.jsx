import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { PageHelmet } from "@/components/seo/PageHelmet";
import {
    Tag, Plus, Pencil, Trash2,
    Loader2, Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import DataTable from "@/components/control/DataTable";
import ConfirmModal from "@/components/control/ConfirmModal";

// ─── Helpers ───────────────────────────────────────────────────────────────
const fmtDate = (iso) => {
    if (!iso) return "Không giới hạn";
    const d = new Date(iso);
    return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const fmtDiscount = (type, value) => {
    if (type === "PERCENT") return `${value}%`;
    return `${Number(value).toLocaleString("vi-VN")}₫`;
};

// ─── Mock data ─────────────────────────────────────────────────────────────
const INITIAL_COUPONS = [
    {
        id: "cp1",
        name: "Khuyến mãi mùa hè",
        code: "SUMMER2026",
        discountType: "PERCENT",
        discountValue: 20,
        usageLimit: 100,
        usedCount: 43,
        applyAllProducts: true,
        productIds: [],
        fromDate: "2026-06-01T00:00:00",
        toDate: "2026-08-31T23:59:59",
        grantedTo: "Tất cả khách hàng",
        isActive: true,
    },
    {
        id: "cp2",
        name: "Flash sale tháng 3",
        code: "FLASH3T26",
        discountType: "AMOUNT",
        discountValue: 500000,
        usageLimit: 50,
        usedCount: 50,
        applyAllProducts: false,
        productIds: ["SP001", "SP003"],
        fromDate: "2026-03-01T00:00:00",
        toDate: "2026-03-31T23:59:59",
        grantedTo: "Tất cả khách hàng",
        isActive: false,
    },
    {
        id: "cp3",
        name: "Ưu đãi VIP",
        code: "VIP50OFF",
        discountType: "PERCENT",
        discountValue: 50,
        usageLimit: null,
        usedCount: 12,
        applyAllProducts: false,
        productIds: ["SP001", "SP002", "SP003", "SP004", "SP005"],
        fromDate: null,
        toDate: null,
        grantedTo: "Tất cả khách hàng",
        isActive: true,
    },
    {
        id: "cp4",
        name: "Giảm tiền sản phẩm gỗ",
        code: "WOOD1M",
        discountType: "AMOUNT",
        discountValue: 1000000,
        usageLimit: 200,
        usedCount: 88,
        applyAllProducts: true,
        productIds: [],
        fromDate: "2026-01-01T00:00:00",
        toDate: "2026-12-31T23:59:59",
        grantedTo: "Tất cả khách hàng",
        isActive: true,
    },
    {
        id: "cp5",
        name: "Chào hàng tuần mới",
        code: "NEWWEEK26",
        discountType: "PERCENT",
        discountValue: 10,
        usageLimit: 30,
        usedCount: 30,
        applyAllProducts: false,
        productIds: ["SP005", "SP006"],
        fromDate: "2026-03-10T00:00:00",
        toDate: "2026-03-17T23:59:59",
        grantedTo: "Tất cả khách hàng",
        isActive: false,
    },
];

// ─── Sub-components ────────────────────────────────────────────────────────

/** Inline switch toggle */
function RowSwitch({ checked, loading, onChange, title }) {
    return (
        <button
            type="button"
            onClick={(e) => {
                e.stopPropagation();
                onChange();
            }}
            title={title || (checked ? "Tắt coupon" : "Bật coupon")}
            disabled={loading}
            className={cn(
                "relative inline-flex w-10 h-6 rounded-full transition-all duration-200 cursor-pointer shrink-0 focus:outline-none",
                loading && "cursor-wait opacity-70",
                checked ? "bg-emerald-500" : "bg-gray-200"
            )}
        >
            {loading ? (
                <span className="absolute inset-0 flex items-center justify-center">
                    <Loader2 size={12} className={cn("animate-spin", checked ? "text-white" : "text-gray-500")} />
                </span>
            ) : (
                <span
                    className={cn(
                        "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200",
                        checked ? "translate-x-4" : "translate-x-0"
                    )}
                />
            )}
        </button>
    );
}

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
    const [coupons, setCoupons] = useState(INITIAL_COUPONS);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [selectedIds, setSelectedIds] = useState([]);
    const [toggleLoadingId, setToggleLoadingId] = useState(null);

    // Filter Logic
    const filteredResults = useMemo(() => {
        let results = coupons;
        if (searchTerm.trim()) {
            const s = searchTerm.toLowerCase();
            results = results.filter(c =>
                c.name.toLowerCase().includes(s) ||
                c.code.toLowerCase().includes(s)
            );
        }
        return results;
    }, [coupons, searchTerm]);

    // Paginated Data for DataTable (since it only renders current page)
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredResults.slice(start, start + itemsPerPage);
    }, [filteredResults, currentPage, itemsPerPage]);

    // Toggle logic
    const handleToggle = useCallback(async (id, currentState) => {
        setToggleLoadingId(id);
        try {
            await new Promise(res => setTimeout(res, 600));
            setCoupons(prev => prev.map(c =>
                c.id === id ? { ...c, isActive: !currentState } : c
            ));
            toast.success(!currentState ? "Đã bật mã coupon" : "Đã tắt mã coupon");
        } catch {
            toast.error("Cập nhật thất bại.");
        } finally {
            setToggleLoadingId(null);
        }
    }, []);

    // Delete logic
    const handleDelete = (item) => {
        setCoupons(prev => prev.filter(c => c.id !== item.id));
        toast.success("Đã xóa mã coupon thành công!");
    };

    const handleBulkDelete = () => {
        setCoupons(prev => prev.filter(c => !selectedIds.includes(c.id)));
        setSelectedIds([]);
        toast.success(`Đã xóa ${selectedIds.length} mã coupon thành công!`);
    };

    const columns = [
        {
            header: "Trạng thái",
            headerClassName: "w-[80px] text-center",
            className: "text-center",
            render: (c) => (
                <div className="flex flex-col items-center gap-1">
                    <RowSwitch
                        checked={c.isActive}
                        loading={toggleLoadingId === c.id}
                        onChange={() => handleToggle(c.id, c.isActive)}
                    />
                    {c.toDate && new Date(c.toDate) < new Date() && (
                        <span className="text-[9px] font-bold text-red-500 uppercase tracking-tighter">Hết hạn</span>
                    )}
                </div>
            )
        },
        {
            header: "Tên Coupon",
            key: "name",
        },
        {
            header: "Mã giảm giá",
            key: "code",
            type: "code",
        },
        {
            header: "Mức giảm",
            render: (c) => (
                <span className={cn(
                    "inline-flex px-2.5 py-1 rounded-lg text-[13px] font-bold border tracking-tight w-fit",
                    c.discountType === "PERCENT"
                        ? "bg-purple-50 text-purple-600 border-purple-100"
                        : "bg-blue-50 text-blue-600 border-blue-100"
                )}>
                    {fmtDiscount(c.discountType, c.discountValue)}
                </span>
            )
        },
        {
            header: "Áp dụng",
            render: (c) => (
                <div className="flex items-center gap-2">
                    {c.applyAllProducts ? (
                        <span className="text-[12px] font-medium text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                            <Package size={12} className="opacity-40" /> Tất cả SP
                        </span>
                    ) : (
                        <span className="text-[12px] font-bold text-[var(--brand-primary)] flex items-center gap-1.5 uppercase tracking-wider">
                            <Package size={12} /> {c.productIds.length} Sản phẩm
                        </span>
                    )}
                </div>
            )
        },
        {
            header: "Hiệu lực",
            className: "max-w-[160px]",
            render: (c) => (
                <div className="flex flex-col gap-0.5 whitespace-nowrap">
                    <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>{fmtDate(c.fromDate)} ~ {c.toDate ? fmtDate(c.toDate) : "∞"}</span>
                    <ExpiryBadge toDate={c.toDate} isActive={c.isActive} />
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
                            {filteredResults.length} coupons ({searchTerm ? "đang lọc" : "toàn bộ"})
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/owner/coupons/create")}
                        className="h-10 px-4 rounded-xl flex items-center gap-2 text-[13px] font-bold text-white transition hover:-translate-y-0.5 cursor-pointer"
                        style={{ backgroundColor: "var(--brand-primary)" }}
                    >
                        <Plus size={17} /> Thêm mã giảm giá
                    </button>
                </div>

                {/* DataTable Integration */}
                <DataTable
                    columns={columns}
                    data={paginatedData}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    searchPlaceholder="Tìm mã coupon, tên khuyến mãi..."
                    selectedIds={selectedIds}
                    setSelectedIds={setSelectedIds}
                    pagination={{
                        total: filteredResults.length,
                        currentPage,
                        setCurrentPage,
                        itemsPerPage,
                        setItemsPerPage
                    }}
                    onRowClick={(item) => navigate(`/owner/coupons/${item.id}/edit`)}
                    rowActions={[
                        {
                            icon: Pencil,
                            label: "Chỉnh sửa",
                            onClick: (item) => navigate(`/owner/coupons/${item.id}/edit`),
                        },
                        {
                            icon: Trash2,
                            label: "Xóa coupon",
                            onClick: (item) => handleDelete(item),
                            className: "bg-white border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200",
                            requireConfirm: true,
                            confirmTitle: "Xóa mã giảm giá?",
                            confirmMessage: "Mã giảm giá này sẽ bị gỡ bỏ vĩnh viễn khỏi hệ thống. Bạn có chắc chắn?"
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
        </>
    );
}
