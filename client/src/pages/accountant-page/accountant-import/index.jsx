/**
 * AccountantImportManage – Quản lý Nhập Hàng
 *
 * Quy trình thực tế:
 *  - Chủ đã đến xưởng kiểm tra và xác nhận hàng ngoài thực tế
 *  - Kế toán tạo phiếu nhập → lưu kho
 *  - Không cần bước duyệt trên hệ thống
 *
 * Trạng thái: Đang xử lý → Đã nhập kho
 *
 * Created By: HieuNM – 07/03/2026
 */

import { useState, useMemo, useEffect } from "react";
import {
    Search, ArrowDownToLine, Eye, Plus, X,
    ChevronLeft, ChevronRight, Calendar, CheckCircle2, Clock,
} from "lucide-react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import { toast } from "react-hot-toast";
import CreateImportModal from "../accountant-product/CreateImportModal";

// ─────────────────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────────────────
const INIT_IMPORTS = [
    { id: "NK001", code: "NK-0703-001", date: "2026-03-07T08:30:00", product: "Bộ bàn ghế Nghê Bảo Đỉnh 6 món", supplier: "Xưởng Minh Đức", qty: 5, unitPrice: 38000000, totalPrice: 190000000, warehouse: "Kho chính", note: "Nhập theo đơn tháng 3", status: "Đã nhập kho" },
    { id: "NK002", code: "NK-0703-002", date: "2026-03-07T09:00:00", product: "Sofa nguyên khối chữ L", supplier: "Xưởng Tiến Phát", qty: 3, unitPrice: 25000000, totalPrice: 75000000, warehouse: "Kho chính", note: "", status: "Đang xử lý" },
    { id: "NK003", code: "NK-0603-001", date: "2026-03-06T14:00:00", product: "Sập thờ Mai Điểu chân 20", supplier: "Xưởng Minh Đức", qty: 2, unitPrice: 18000000, totalPrice: 36000000, warehouse: "Kho phụ", note: "Bổ sung tồn kho", status: "Đã nhập kho" },
    { id: "NK004", code: "NK-0503-001", date: "2026-03-05T10:30:00", product: "Bộ bàn ăn 8 ghế nguyên khối", supplier: "Xưởng An Bình", qty: 4, unitPrice: 32000000, totalPrice: 128000000, warehouse: "Kho chính", note: "", status: "Đã nhập kho" },
    { id: "NK005", code: "NK-0403-001", date: "2026-03-04T08:00:00", product: "Tủ quần áo 4 cánh chạm hoa lá tây", supplier: "Xưởng Tiến Phát", qty: 6, unitPrice: 22000000, totalPrice: 132000000, warehouse: "Kho chính", note: "Hàng khách đặt – Gia đình anh Minh", status: "Đang xử lý" },
    { id: "NK006", code: "NK-0303-001", date: "2026-03-03T15:00:00", product: "Giường ngủ hoa hồng Tân cổ điển", supplier: "Xưởng Minh Đức", qty: 3, unitPrice: 15000000, totalPrice: 45000000, warehouse: "Kho phụ", note: "Hàng khách đặt theo mẫu", status: "Đã nhập kho" },
    { id: "NK007", code: "NK-0203-001", date: "2026-03-02T09:00:00", product: "Hoành phi câu đối chạm rồng", supplier: "Xưởng An Bình", qty: 8, unitPrice: 9500000, totalPrice: 76000000, warehouse: "Kho chính", note: "", status: "Đã nhập kho" },
    { id: "NK008", code: "NK-0103-001", date: "2026-03-01T08:30:00", product: "Bàn thờ chạm rồng cuốn thủy", supplier: "Xưởng Tiến Phát", qty: 5, unitPrice: 28000000, totalPrice: 140000000, warehouse: "Kho chính", note: "Nhập đầu tháng", status: "Đã nhập kho" },
];

const STATUSES = ["Tất cả", "Đang xử lý", "Đã nhập kho"];

const STATUS_STYLES = {
    "Đang xử lý": { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
    "Đã nhập kho": { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
};

const fmtCurrency = (n) => new Intl.NumberFormat("vi-VN").format(n) + "₫";
const fmtDateTime = (s) => {
    if (!s) return "—";
    const d = new Date(s);
    return `${d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} - ${d.toLocaleDateString("vi-VN")}`;
};

const StatusPill = ({ status }) => {
    const s = STATUS_STYLES[status] || { bg: "#F3F4F6", text: "#6B7280", border: "#E5E7EB" };
    return (
        <span className="inline-flex items-center px-2.5 py-1 text-[11px] font-bold rounded-md whitespace-nowrap"
            style={{ backgroundColor: s.bg, color: s.text, border: `1px solid ${s.border}` }}>
            <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: s.text }} />
            {status}
        </span>
    );
};

// ─────────────────────────────────────────────────────────
export default function AccountantImportManage() {
    const [imports, setImports] = useState(INIT_IMPORTS);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatus] = useState("Tất cả");
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(15);
    const [showCreate, setShowCreate] = useState(false);

    const filtered = useMemo(() => {
        let r = imports;
        if (statusFilter !== "Tất cả") r = r.filter(i => i.status === statusFilter);
        if (search.trim()) {
            const q = search.toLowerCase();
            r = r.filter(i =>
                i.code.toLowerCase().includes(q) ||
                i.product.toLowerCase().includes(q) ||
                i.supplier.toLowerCase().includes(q)
            );
        }
        return r;
    }, [imports, statusFilter, search]);

    useEffect(() => setPage(1), [search, statusFilter]);

    const paginated = filtered.slice((page - 1) * perPage, page * perPage);
    const totalPages = Math.ceil(filtered.length / perPage) || 1;

    const counts = useMemo(() => {
        const c = { "Tất cả": imports.length, "Đang xử lý": 0, "Đã nhập kho": 0 };
        imports.forEach(i => { c[i.status] = (c[i.status] || 0) + 1; });
        return c;
    }, [imports]);

    // Kế toán xác nhận hoàn tất nhập kho
    const markDone = (id) => {
        setImports(prev => prev.map(i => i.id === id ? { ...i, status: "Đã nhập kho" } : i));
        toast.success("Đã ghi nhận nhập kho thành công!");
    };

    const handleSaved = (data) => {
        const newItem = {
            id: `NK-${Date.now()}`,
            code: `NK-${new Date().toLocaleDateString("vi-VN").replace(/\//g, "")}-${String(imports.length + 1).padStart(3, "0")}`,
            date: new Date().toISOString(),
            product: data.lines[0]?.productName ?? "",
            supplier: data.supplier,
            qty: data.lines.reduce((s, l) => s + Number(l.qty || 0), 0),
            unitPrice: Number(data.lines[0]?.importPrice || 0),
            totalPrice: data.grandTotal,
            warehouse: "Kho chính",
            note: "",
            status: "Đang xử lý",
        };
        setImports(prev => [newItem, ...prev]);
        toast.success("Tạo phiếu nhập thành công!");
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
                            {filtered.length} phiếu nhập · Kế toán tạo phiếu và lưu kho
                        </p>
                    </div>
                    <button onClick={() => setShowCreate(true)}
                        className="h-9 px-5 rounded-lg flex items-center gap-2 text-[13px] font-bold hover:opacity-90 cursor-pointer transition"
                        style={{ backgroundColor: "var(--brand-primary)", color: "#fff" }}>
                        <Plus size={16} /> Tạo phiếu nhập
                    </button>
                </div>

                {/* Status toolbar */}
                <div className="flex items-center gap-2 shrink-0 px-1 flex-wrap">
                    {STATUSES.map(s => {
                        const isA = statusFilter === s;
                        const sc = STATUS_STYLES[s] || null;
                        return (
                            <button key={s} onClick={() => setStatus(s)}
                                className="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                                style={{ backgroundColor: isA ? (sc ? sc.bg : "#fff") : "transparent", color: isA ? (sc ? sc.text : "var(--text-main)") : "var(--text-secondary)", border: isA ? `1.5px solid ${sc ? sc.border : "var(--grid-border)"}` : "1.5px solid transparent" }}>
                                {s !== "Tất cả" && (
                                    s === "Đã nhập kho"
                                        ? <CheckCircle2 size={12} style={{ opacity: isA ? 1 : 0.5 }} />
                                        : <Clock size={12} style={{ opacity: isA ? 1 : 0.5 }} />
                                )}
                                {s} <span className="text-[11px] opacity-60">({counts[s] ?? 0})</span>
                            </button>
                        );
                    })}
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
                                    {["Mã phiếu", "Ngày nhập", "Sản phẩm", "Xưởng cung cấp", "SL", "Thành tiền", "Ghi chú", "Trạng thái"].map((h, i) => (
                                        <th key={i} className={`px-4 py-3 text-[11px] font-bold uppercase tracking-wider ${i === 4 || i === 5 ? "text-right" : ""}`}
                                            style={{ color: "var(--text-placeholder)" }}>{h}</th>
                                    ))}
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
                                        <td className="px-4 py-3"><p className="text-[12px] italic max-w-[140px] truncate" style={{ color: "var(--text-placeholder)" }}>{item.note || "—"}</p></td>
                                        <td className="px-4 py-3"><StatusPill status={item.status} /></td>
                                        {/* Hover actions */}
                                        <td className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <div className="flex gap-1.5 bg-white/90 backdrop-blur-sm p-1 rounded-xl shadow-sm border border-gray-100">
                                                <button className="h-8 px-2.5 rounded-lg flex items-center gap-1.5 text-[12px] font-bold hover:bg-gray-100 cursor-pointer transition"
                                                    style={{ color: "var(--text-secondary)" }}><Eye size={14} /> Xem</button>
                                                {item.status === "Đang xử lý" && (
                                                    <button onClick={() => markDone(item.id)}
                                                        className="h-8 px-2.5 rounded-lg flex items-center gap-1.5 text-[12px] font-bold cursor-pointer transition hover:opacity-80"
                                                        style={{ backgroundColor: "#F0FDF4", color: "#15803D", border: "1px solid #BBF7D0" }}>
                                                        <CheckCircle2 size={14} /> Hoàn tất nhập kho
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {paginated.length === 0 && (
                                    <tr><td colSpan={9} className="py-24 text-center">
                                        <div className="flex flex-col items-center gap-2" style={{ color: "var(--text-placeholder)" }}>
                                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "var(--bg-main)" }}>
                                                <ArrowDownToLine size={28} strokeWidth={1.5} />
                                            </div>
                                            <p className="text-sm font-medium mt-1">Không tìm thấy phiếu nhập nào</p>
                                        </div>
                                    </td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {filtered.length > 0 && (
                        <div className="flex items-center justify-between px-6 py-3 border-t shrink-0"
                            style={{ borderColor: "var(--grid-border)", backgroundColor: "var(--bg-main)" }}>
                            <div className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                                Tổng: <span className="font-bold" style={{ color: "var(--text-main)" }}>{filtered.length}</span> phiếu
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
                                        {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)}
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
                    onSaved={(data) => { handleSaved(data); setShowCreate(false); }}
                />
            )}
        </>
    );
}
