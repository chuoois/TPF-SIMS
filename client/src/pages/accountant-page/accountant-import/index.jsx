/**
 * AccountantImportManage – Quản lý Nhập Hàng
 *
 * Quy trình thực tế:
 *  - Chủ đã đến xưởng kiểm tra và xác nhận hàng ngoài thực tế
 *  - Kế toán tạo phiếu nhập → lưu kho
 *  - Không cần bước duyệt trên hệ thống
 *
 * Created By: HieuNM – 07/03/2026
 * Updated: 14/03/2026 – Đổi ghi chú thành ngày nhập, bỏ trạng thái
 */

import { useState, useEffect } from "react";
import {
    Search, ArrowDownToLine, Eye, Plus, X,
    ChevronLeft, ChevronRight, Calendar,
} from "lucide-react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import { toast } from "react-hot-toast";
import CreateImportModal from "../accountant-product/CreateImportModal";
import ViewImportModal from "./ViewImportModal";
import importService from "@/services/import.service";

const fmtCurrency = (n) => new Intl.NumberFormat("vi-VN").format(n) + "₫";
const fmtDateTime = (s) => {
    if (!s) return "—";
    const d = new Date(s);
    return `${d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} - ${d.toLocaleDateString("vi-VN")}`;
};

// ─────────────────────────────────────────────────────────
export default function AccountantImportManage() {
    const [imports, setImports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(15);
    const [showCreate, setShowCreate] = useState(false);
    const [viewItem, setViewItem] = useState(null);

    const fetchReceipts = async () => {
        try {
            setLoading(true);
            const res = await importService.getImportReceipts({
                search: search.trim(),
                date: dateFilter || undefined,
                page,
                limit: perPage,
            });
            setImports(res.data || []);
            setTotalItems(res.pagination?.totalItems || 0);
            setTotalPages(res.pagination?.totalPages || 1);
        } catch (err) {
            console.error("Lỗi tải phiếu nhập:", err);
            toast.error("Không thể tải dữ liệu nhập hàng!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchReceipts(); }, [page, perPage, search, dateFilter]);
    useEffect(() => { setPage(1); }, [search, dateFilter]);

    const paginated = imports;

    const handleSaved = () => {
        setPage(1);
        fetchReceipts();
    };

    return (
        <>
            <PageHelmet title="Nhập hàng | Kế toán" />
            <div className="flex flex-col h-[calc(100vh-64px)] -m-6 p-6 space-y-4" style={{ backgroundColor: "var(--bg-main)" }}>

                {/* Header */}
                <div className="flex items-center justify-between shrink-0">
                    <div>
                        <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: "var(--text-main)" }}>
                            <ArrowDownToLine size={22} style={{ color: "var(--brand-primary)" }} />
                            Quản lý Nhập Hàng
                        </h1>
                        <p className="text-[13px] mt-0.5" style={{ color: "var(--text-placeholder)" }}>
                            {totalItems} phiếu nhập · Kế toán tạo phiếu và lưu kho
                        </p>
                    </div>
                    <button onClick={() => setShowCreate(true)}
                        className="h-9 px-5 rounded-lg flex items-center gap-2 text-[13px] font-bold hover:opacity-90 cursor-pointer transition"
                        style={{ backgroundColor: "var(--brand-primary)", color: "#fff" }}>
                        <Plus size={16} /> Tạo phiếu nhập
                    </button>
                </div>

                {/* Status toolbar */}
                <div className="flex items-center gap-2 shrink-0 px-1">
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border" style={{ borderColor: "var(--grid-border)" }}>
                        <Calendar size={14} style={{ color: "var(--text-secondary)" }} />
                        <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
                            className="bg-transparent text-[13px] font-medium outline-none text-gray-700" />
                        {dateFilter && (
                            <button onClick={() => setDateFilter("")} className="p-0.5 hover:bg-gray-100 rounded-full transition-colors ml-1">
                                <X size={12} style={{ color: "var(--text-secondary)" }} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Table card */}
                <div className="flex flex-col bg-white rounded-2xl flex-1 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                    {/* Search */}
                    <div className="px-4 py-3 border-b shrink-0 flex items-center gap-3" style={{ borderColor: "var(--grid-border)" }}>
                        <div className="relative w-full max-w-md">
                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-placeholder)" }} />
                            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="Tìm mã phiếu, sản phẩm, xưởng..."
                                className="w-full h-9 pl-10 pr-8 rounded-lg text-[13px] focus:outline-none focus:ring-2 transition"
                                style={{ border: "1px solid var(--grid-border)", backgroundColor: "var(--bg-main)", color: "var(--text-main)" }} />
                            {search && <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer" style={{ color: "var(--text-placeholder)" }}><X size={14} /></button>}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="flex-1 overflow-y-auto">
                        <table className="w-full text-left relative">
                            <thead className="sticky top-0 z-10" style={{ backgroundColor: "var(--grid-header-bg)", borderBottom: "1px solid var(--grid-border)" }}>
                                <tr>
                                    {["Mã phiếu", "Ngày nhập", "Sản phẩm", "Xưởng cung cấp", "SL", "Thành tiền"].map((h, i) => (
                                        <th key={i} className={`px-4 py-3 text-[11px] font-bold uppercase tracking-wider ${i === 4 || i === 5 ? "text-right" : ""}`}
                                            style={{ color: "var(--text-placeholder)" }}>{h}</th>
                                    ))}
                                    <th className="w-24 px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.map(item => (
                                    <tr key={item.id} className="group relative hover:bg-gray-50/50 transition-colors" style={{ borderBottom: "1px solid var(--grid-border)" }}>
                                        <td className="px-4 py-3">
                                            <span className="text-[12px] font-bold font-mono px-2 py-1 rounded" style={{ backgroundColor: "var(--bg-main)", color: "var(--text-main)", border: "1px solid var(--grid-border)" }}>{item.code}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5 text-[12px]" style={{ color: "var(--text-secondary)" }}>
                                                <Calendar size={13} style={{ color: "var(--text-placeholder)" }} />{fmtDateTime(item.date)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-[13px] font-semibold" style={{ color: "var(--text-main)" }}>{item.product}</p>
                                        </td>
                                        <td className="px-4 py-3"><p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>{item.supplier}</p></td>
                                        <td className="px-4 py-3 text-right"><span className="text-[13px] font-bold" style={{ color: "var(--text-main)" }}>{item.qty}</span></td>
                                        <td className="px-4 py-3 text-right"><span className="text-[13px] font-bold" style={{ color: "var(--text-main)" }}>{fmtCurrency(item.totalPrice)}</span></td>

                                        {/* Spacer */}
                                        <td className="px-4 py-3"></td>
                                        {/* Hover actions */}
                                        <td className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <div className="flex gap-1.5 bg-white/90 backdrop-blur-sm p-1 rounded-xl shadow-sm border border-gray-100">
                                                <button onClick={() => setViewItem(item)}
                                                    className="h-8 px-2.5 rounded-lg flex items-center gap-1.5 text-[12px] font-bold hover:bg-gray-100 cursor-pointer transition"
                                                    style={{ color: "var(--text-secondary)" }}><Eye size={14} /> Xem</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {loading ? (
                                    <tr><td colSpan={7} className="py-24 text-center">
                                        <div className="flex flex-col items-center gap-3" style={{ color: "var(--text-placeholder)" }}>
                                            <div className="w-8 h-8 border-4 border-gray-200 border-t-[var(--brand-primary)] rounded-full animate-spin" />
                                            <p className="text-sm font-medium">Đang tải dữ liệu...</p>
                                        </div>
                                    </td></tr>
                                ) : paginated.length === 0 ? (
                                    <tr><td colSpan={7} className="py-24 text-center">
                                        <div className="flex flex-col items-center gap-2" style={{ color: "var(--text-placeholder)" }}>
                                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "var(--bg-main)" }}>
                                                <ArrowDownToLine size={28} strokeWidth={1.5} />
                                            </div>
                                            <p className="text-sm font-medium mt-1">Không tìm thấy phiếu nhập nào</p>
                                        </div>
                                    </td></tr>
                                ) : null}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalItems > 0 && (
                        <div className="flex items-center justify-between px-6 py-3 border-t shrink-0"
                            style={{ borderColor: "var(--grid-border)", backgroundColor: "var(--bg-main)" }}>
                            <div className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                                Tổng: <span className="font-bold" style={{ color: "var(--text-main)" }}>{totalItems}</span> phiếu
                            </div>
                            <div className="flex items-center gap-5">
                                <div className="flex items-center gap-2">
                                    <span className="text-[13px]" style={{ color: "var(--text-secondary)" }}>Bản ghi/trang</span>
                                    <select value={perPage} onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }}
                                        className="h-8 px-2 pr-6 rounded-md text-[13px] border cursor-pointer appearance-none"
                                        style={{
                                            borderColor: "var(--grid-border)", backgroundColor: "#fff", color: "var(--text-main)",
                                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                                            backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center"
                                        }}>
                                        {[15, 30, 50].map(n => <option key={n} value={n}>{n}</option>)}
                                    </select>
                                </div>
                                <span className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                                    <span className="font-bold" style={{ color: "var(--text-main)" }}>
                                        {(page - 1) * perPage + 1}–{Math.min(page * perPage, totalItems)}
                                    </span> phiếu
                                </span>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                        className="p-1 rounded disabled:opacity-30 hover:bg-gray-200 cursor-pointer" style={{ color: "var(--text-main)" }}>
                                        <ChevronLeft size={16} strokeWidth={2.5} />
                                    </button>
                                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                                        className="p-1 rounded disabled:opacity-30 hover:bg-gray-200 cursor-pointer" style={{ color: "var(--text-main)" }}>
                                        <ChevronRight size={16} strokeWidth={2.5} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal tạo phiếu */}
            {showCreate && (
                <CreateImportModal
                    onClose={() => setShowCreate(false)}
                    onSaved={() => { handleSaved(); setShowCreate(false); }}
                />
            )}

            {/* Modal xem chi tiết phiếu */}
            {viewItem && (
                <ViewImportModal
                    item={viewItem}
                    onClose={() => setViewItem(null)}
                />
            )}
        </>
    );
}
