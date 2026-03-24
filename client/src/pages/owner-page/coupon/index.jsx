import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { PageHelmet } from "@/components/seo/PageHelmet";
import {
    Tag, Plus, Search, Pencil, Trash2,
    ChevronLeft, ChevronRight, Loader2,
    XCircle, Package, Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

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

const PAGE_SIZE = 10;

// ─── Sub-components ────────────────────────────────────────────────────────

/** Inline switch toggle used per-row */
function RowSwitch({ checked, loading, onChange, title }) {
    return (
        <button
            type="button"
            onClick={onChange}
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

/** Expiry badge */
function ExpiryBadge({ toDate, isActive }) {
    if (!toDate) return <span className="text-gray-400 text-[12px]">Không giới hạn</span>;
    const expired = new Date(toDate) < new Date();
    return (
        <span className={cn(
            "inline-flex px-2 py-0.5 rounded-md text-[11px] font-bold border",
            expired
                ? "bg-red-50 text-red-600 border-red-100"
                : isActive
                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                    : "bg-gray-100 text-gray-500 border-gray-200"
        )}>
            {fmtDate(toDate)}
        </span>
    );
}

// ─── Main ──────────────────────────────────────────────────────────────────
export default function CouponListPage() {
    const navigate = useNavigate();
    const [coupons, setCoupons] = useState(INITIAL_COUPONS);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [toggleLoadingId, setToggleLoadingId] = useState(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);

    // ── Search ───────────────────────────────────────────────────
    const filtered = useMemo(() => {
        if (!search.trim()) return coupons;
        const s = search.toLowerCase();
        return coupons.filter(c =>
            c.name.toLowerCase().includes(s) ||
            c.code.toLowerCase().includes(s)
        );
    }, [coupons, search]);

    const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const handleSearch = () => setPage(1);
    const handleSearchKey = (e) => { if (e.key === "Enter") handleSearch(); };
    const clearSearch = () => { setSearch(""); setPage(1); };

    // ── Toggle status ────────────────────────────────────────────
    const handleToggle = useCallback(async (id, currentState) => {
        setToggleLoadingId(id);
        try {
            // Simulate API: PATCH /coupons/{id}/status
            await new Promise(res => setTimeout(res, 600));
            setCoupons(prev => prev.map(c =>
                c.id === id ? { ...c, isActive: !currentState } : c
            ));
            toast.success(!currentState ? "Đã bật mã coupon" : "Đã tắt mã coupon");
        } catch {
            toast.error("Cập nhật thất bại. Thử lại.");
        } finally {
            setToggleLoadingId(null);
        }
    }, []);

    // ── Delete ───────────────────────────────────────────────────
    const handleDeleteConfirm = (id) => setDeleteConfirmId(id);
    const handleDeleteCancel = () => setDeleteConfirmId(null);
    const handleDeleteExecute = async () => {
        const id = deleteConfirmId;
        setDeleteConfirmId(null);
        // Simulate API: DELETE /coupons/{id}
        await new Promise(res => setTimeout(res, 300));
        setCoupons(prev => prev.filter(c => c.id !== id));
        toast.success("Đã xóa mã coupon");
    };

    return (
        <>
            <PageHelmet title="Mã giảm giá | TPF-SIMS" />

            {/* Delete confirm overlay */}
            {deleteConfirmId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                        <div className="px-6 pt-6 pb-5 text-center space-y-3">
                            <div className="w-14 h-14 rounded-2xl bg-red-50 border-2 border-red-100 flex items-center justify-center mx-auto">
                                <Trash2 size={24} className="text-red-500" />
                            </div>
                            <div>
                                <h3 className="text-[16px] font-bold text-gray-900">Xóa mã coupon?</h3>
                                <p className="text-[13px] text-gray-400 mt-1">Thao tác này không thể hoàn tác.</p>
                            </div>
                        </div>
                        <div className="px-6 pb-6 flex gap-3">
                            <button onClick={handleDeleteCancel}
                                className="flex-1 h-11 rounded-xl border font-bold text-[13px] text-gray-500 hover:bg-gray-50 transition cursor-pointer"
                                style={{ borderColor: "var(--grid-border)" }}>
                                Hủy
                            </button>
                            <button onClick={handleDeleteExecute}
                                className="flex-1 h-11 rounded-xl font-bold text-[13px] text-white bg-red-500 hover:bg-red-600 transition cursor-pointer shadow-sm">
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col h-[calc(100vh-64px)] -m-6 p-6 space-y-4" style={{ backgroundColor: "var(--bg-main)" }}>

                {/* ── Page header ──────────────────────────────────────── */}
                <div className="flex items-center justify-between shrink-0">
                    <div>
                        <h1 className="text-[22px] font-bold flex items-center gap-2.5" style={{ color: "var(--text-main)", letterSpacing: "-0.01em" }}>
                            <Tag size={22} style={{ color: "var(--brand-primary)" }} />
                            Mã giảm giá
                        </h1>
                        <p className="text-[13px] mt-1 font-medium italic" style={{ color: "var(--text-placeholder)" }}>
                            {filtered.length} coupon{search ? " (đang lọc)" : ""}
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/owner/coupons/create")}
                        className="h-10 px-4 rounded-xl flex items-center gap-2 text-[13px] font-bold text-white transition hover:-translate-y-0.5 cursor-pointer"
                        style={{ backgroundColor: "var(--brand-primary)", boxShadow: "0 4px 10px rgba(52,176,87,0.25)" }}
                    >
                        <Plus size={17} /> Thêm mã giảm giá
                    </button>
                </div>

                {/* ── Table card ───────────────────────────────────────── */}
                <div className="flex flex-col bg-white rounded-2xl flex-1 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>

                    {/* Toolbar */}
                    <div className="px-4 py-3 border-b flex items-center gap-3 shrink-0 flex-wrap" style={{ borderColor: "var(--grid-border)" }}>
                        <div className="relative w-full max-w-xs">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                onKeyDown={handleSearchKey}
                                placeholder="Tìm mã coupon, tên coupon..."
                                className="w-full h-9 pl-9 pr-8 rounded-lg text-[13px] focus:outline-none transition focus:border-emerald-400"
                                style={{ border: "1px solid var(--grid-border)", backgroundColor: "var(--bg-main)" }}
                            />
                        </div>
                    </div>

                    {/* Table scroll area */}
                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left text-[13px] min-w-[900px]">
                            <thead className="sticky top-0 z-10" style={{ backgroundColor: "var(--grid-header-bg)", borderBottom: "1px solid var(--grid-border)" }}>
                                <tr>
                                    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 w-[72px] text-center">Trạng thái</th>
                                    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Tên coupon</th>
                                    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Mã coupon</th>
                                    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 w-28">Giảm giá</th>
                                    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 w-32">Sản phẩm</th>
                                    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 w-28">Từ ngày</th>
                                    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 w-28">Đến ngày</th>
                                    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 text-right w-28">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paged.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-20 text-center">
                                            <Tag size={32} className="mx-auto mb-3 opacity-20 text-gray-400" />
                                            <p className="text-gray-400 font-medium text-[14px]">
                                                {search ? "Không tìm thấy mã nào phù hợp" : "Chưa có mã giảm giá nào"}
                                            </p>
                                            {!search && (
                                                <button onClick={() => navigate("/owner/coupons/create")}
                                                    className="mt-4 h-9 px-4 rounded-lg text-[13px] font-bold text-white inline-flex items-center gap-1.5 cursor-pointer transition hover:opacity-90"
                                                    style={{ backgroundColor: "var(--brand-primary)" }}>
                                                    <Plus size={14} /> Tạo coupon đầu tiên
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ) : paged.map((c) => {
                                    const isToggleLoading = toggleLoadingId === c.id;
                                    const isExpired = c.toDate && new Date(c.toDate) < new Date();

                                    return (
                                        <tr
                                            key={c.id}
                                            className="group border-b hover:bg-emerald-50/20 transition-colors"
                                            style={{ borderColor: "var(--grid-border)" }}
                                        >
                                            {/* Toggle */}
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex flex-col items-center gap-1.5">
                                                    <RowSwitch
                                                        checked={c.isActive}
                                                        loading={isToggleLoading}
                                                        onChange={() => handleToggle(c.id, c.isActive)}
                                                    />
                                                    {isExpired && (
                                                        <span className="text-[9px] font-bold text-red-400 uppercase tracking-wider">Hết hạn</span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Tên */}
                                            <td className="px-4 py-3">
                                                <p className="font-bold text-gray-800">{c.name}</p>
                                            </td>

                                            {/* Mã */}
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono text-[12px] font-bold border"
                                                    style={{ backgroundColor: "var(--status-focus)", color: "var(--brand-primary)", borderColor: "rgba(52,176,87,0.2)" }}>
                                                    <Tag size={10} />{c.code}
                                                </span>
                                            </td>





                                            {/* Giảm giá */}
                                            <td className="px-4 py-3">
                                                <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-bold border",
                                                    c.discountType === "PERCENT"
                                                        ? "bg-purple-50 text-purple-700 border-purple-100"
                                                        : "bg-blue-50 text-blue-700 border-blue-100")}>
                                                    {fmtDiscount(c.discountType, c.discountValue)}
                                                </span>
                                            </td>

                                            {/* Sản phẩm */}
                                            <td className="px-4 py-3">
                                                {c.applyAllProducts ? (
                                                    <span className="text-[12px] text-gray-400 flex items-center gap-1"><Package size={11} />Không giới hạn</span>
                                                ) : (
                                                    <span className="text-[12px] font-semibold text-gray-700 flex items-center gap-1">
                                                        <Package size={11} style={{ color: "var(--brand-primary)" }} />{c.productIds.length} sản phẩm
                                                    </span>
                                                )}
                                            </td>

                                            {/* Từ ngày */}
                                            <td className="px-4 py-3 text-[12px] text-gray-500">{fmtDate(c.fromDate)}</td>

                                            {/* Đến ngày */}
                                            <td className="px-4 py-3">
                                                <ExpiryBadge toDate={c.toDate} isActive={c.isActive} />
                                            </td>



                                            {/* Hành động */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => navigate(`/owner/coupons/${c.id}/edit`)}
                                                        title="Chỉnh sửa"
                                                        className="h-8 px-3 rounded-lg text-[12px] font-bold text-gray-600 hover:text-blue-600 bg-white border border-gray-200 hover:border-blue-200 flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                                                    >
                                                        <Pencil size={13} /> Sửa
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteConfirm(c.id)}
                                                        title="Xóa coupon"
                                                        className="h-8 px-3 rounded-lg text-[12px] font-bold text-gray-600 hover:text-red-600 bg-white border border-gray-200 hover:border-red-200 flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination footer */}
                    {filtered.length > 0 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t shrink-0 bg-gray-50/30"
                            style={{ borderColor: "var(--grid-border)" }}>
                            <span className="text-[13px] text-gray-500">
                                Tổng: <strong className="text-gray-800">{filtered.length}</strong> mã coupon
                            </span>
                            {pageCount > 1 && (
                                <div className="flex items-center gap-1.5">
                                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                        className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30 cursor-pointer disabled:cursor-default transition">
                                        <ChevronLeft size={15} />
                                    </button>
                                    {Array.from({ length: pageCount }, (_, i) => i + 1).map(pg => (
                                        <button key={pg} onClick={() => setPage(pg)}
                                            className={cn("w-8 h-8 rounded-lg text-[13px] font-bold transition cursor-pointer",
                                                pg === page ? "text-white" : "hover:bg-gray-100 text-gray-600")}
                                            style={pg === page ? { backgroundColor: "var(--brand-primary)" } : {}}>
                                            {pg}
                                        </button>
                                    ))}
                                    <button onClick={() => setPage(p => Math.min(pageCount, p + 1))} disabled={page === pageCount}
                                        className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30 cursor-pointer disabled:cursor-default transition">
                                        <ChevronRight size={15} />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
