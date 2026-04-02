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

import { useState, useMemo, useEffect } from "react";
import {
    Search, ArrowDownToLine, Eye, Plus, X,
    ChevronLeft, ChevronRight, Calendar, CheckCircle2, Clock,
} from "lucide-react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import { toast } from "react-hot-toast";
import CreateImportModal from "../accountant-product/CreateImportModal";
import ViewImportModal from "./ViewImportModal";

// ─────────────────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────────────────
const INIT_IMPORTS = [
    {
        id: "NK001", code: "NK-0703-001", date: "2026-03-07T08:30:00",
        product: "Bộ bàn ghế Nghê Bảo Đỉnh 6 món", supplier: "Xưởng Minh Đức",
        qty: 5, unitPrice: 38000000, totalPrice: 190000000,
        warehouse: "Kho chính",
        lines: [
            { _id: 1, isBundle: true, bundleName: "Bộ bàn ghế Nghê Bảo Đỉnh 6 món", bundleCode: "BO-PK-001", formType: "READY", productType: "FINISHED", category: "Phòng Khách", materialType: "Gỗ Hương", color: "Hương", bundleQty: 3, bundlePrice: 38000000, details: "Bộ 6 món gồm 1 bàn + 4 ghế + 1 ghế chủ", items: [{ _id: 1, name: "Bàn lớn", qty: 1, unitPrice: 14000000 }, { _id: 2, name: "Ghế tựa", qty: 4, unitPrice: 4500000 }, { _id: 3, name: "Ghế chủ", qty: 1, unitPrice: 5500000 }] },
            { _id: 2, isBundle: true, bundleName: "Bộ bàn ghế Nghê Bảo Đỉnh 4 món", bundleCode: "BO-PK-002", formType: "NEW", productType: "FINISHED", category: "Phòng Khách", materialType: "Gỗ Hương", color: "Hương", bundleQty: 2, bundlePrice: 28000000, details: "Bộ 4 món", items: [{ _id: 1, name: "Bàn lớn", qty: 1, unitPrice: 10000000 }, { _id: 2, name: "Ghế tựa", qty: 2, unitPrice: 5000000 }, { _id: 3, name: "Ghế chủ", qty: 1, unitPrice: 8000000 }] },
        ],
    },
    {
        id: "NK002", code: "NK-0703-002", date: "2026-03-07T09:00:00",
        product: "Sofa nguyên khối chữ L", supplier: "Xưởng Tiến Phát",
        qty: 3, unitPrice: 25000000, totalPrice: 75000000,
        warehouse: "Kho chính",
        lines: [
            { _id: 1, productName: "Sofa nguyên khối chữ L", productCode: "HS-PK-001", formType: "READY", productType: "FINISHED", category: "Phòng Khách", materialType: "Gỗ Gõ Đỏ", color: "Gõ đỏ", length: "260", width: "160", height: "85", qty: 3, importPrice: 25000000, location: "Kho B – Tầng 2", details: "" },
        ],
    },
    {
        id: "NK003", code: "NK-0603-001", date: "2026-03-06T14:00:00",
        product: "Sập thờ Mai Điểu chân 20", supplier: "Xưởng Minh Đức",
        qty: 2, unitPrice: 18000000, totalPrice: 36000000,
        warehouse: "Kho phụ",
        lines: [
            { _id: 1, productName: "Sập thờ Mai Điểu chân 20", productCode: "SP-PT-001", formType: "NEW", productType: "FINISHED", category: "Phòng Thờ", materialType: "Gỗ Gụ", color: "Chay", length: "200", width: "100", height: "60", qty: 2, importPrice: 18000000, location: "Kho Phụ – Tầng 1", details: "Chạm khắc mai điểu, chân 20" },
        ],
    },
    {
        id: "NK004", code: "NK-0503-001", date: "2026-03-05T10:30:00",
        product: "Bộ bàn ăn 8 ghế nguyên khối", supplier: "Xưởng An Bình",
        qty: 4, unitPrice: 32000000, totalPrice: 128000000,
        warehouse: "Kho chính",
        lines: [
            { _id: 1, isBundle: true, bundleName: "Bộ bàn ăn 8 ghế nguyên khối", bundleCode: "BO-PA-001", formType: "READY", productType: "FINISHED", category: "Phòng Ăn", materialType: "Gỗ Hương", color: "Hương", bundleQty: 4, bundlePrice: 32000000, details: "Gồm 1 bàn + 8 ghế. Mặt bàn nguyên khối liền.", items: [{ _id: 1, name: "Bàn ăn", qty: 1, unitPrice: 20000000 }, { _id: 2, name: "Ghế ăn", qty: 8, unitPrice: 1500000 }] },
        ],
    },
    {
        id: "NK005", code: "NK-0403-001", date: "2026-03-04T08:00:00",
        product: "Tủ quần áo 4 cánh chạm hoa lá tây", supplier: "Xưởng Tiến Phát",
        qty: 6, unitPrice: 22000000, totalPrice: 132000000,
        warehouse: "Kho chính",
        lines: [
            { _id: 1, productName: "Tủ quần áo 4 cánh chạm hoa lá tây", productCode: "SP-PN-002", formType: "NEW", productType: "CUSTOM", category: "Phòng Ngủ", materialType: "Gỗ Gụ", color: "Chay", length: "220", width: "60", height: "240", qty: 6, importPrice: 22000000, location: "Kho A – Tầng 3", details: "Hàng đặt theo mẫu của khách – Gia đình anh Minh" },
        ],
    },
    {
        id: "NK006", code: "NK-0303-001", date: "2026-03-03T15:00:00",
        product: "Giường ngủ hoa hồng Tân cổ điển", supplier: "Xưởng Minh Đức",
        qty: 3, unitPrice: 15000000, totalPrice: 45000000,
        warehouse: "Kho phụ",
        lines: [
            { _id: 1, productName: "Giường ngủ hoa hồng Tân cổ điển", productCode: "HS-PN-001", formType: "READY", productType: "FINISHED", category: "Phòng Ngủ", materialType: "Gỗ Sồi Nga", color: "Óc chó", length: "200", width: "160", height: "50", qty: 3, importPrice: 15000000, location: "Kho Phụ – Tầng 2", details: "" },
        ],
    },
    {
        id: "NK007", code: "NK-0203-001", date: "2026-03-02T09:00:00",
        product: "Hoành phi câu đối chạm rồng", supplier: "Xưởng An Bình",
        qty: 8, unitPrice: 9500000, totalPrice: 76000000,
        warehouse: "Kho chính",
        lines: [
            { _id: 1, isBundle: true, bundleName: "Hoành phi câu đối chạm rồng", bundleCode: "BO-PT-002", formType: "NEW", productType: "RAW", category: "Phòng Thờ", materialType: "Gỗ Mít", color: "Trần", bundleQty: 4, bundlePrice: 9500000, details: "Bộ 1 hoành phi + 1 cặp câu đối. Chạm rồng 5 móng, sơn thiếp vàng.", items: [{ _id: 1, name: "Hoành phi", qty: 1, unitPrice: 4000000 }, { _id: 2, name: "Câu đối chạm rồng", qty: 2, unitPrice: 2750000 }] },
        ],
    },
    {
        id: "NK008", code: "NK-0103-001", date: "2026-03-01T08:30:00",
        product: "Bàn thờ chạm rồng cuốn thủy", supplier: "Xưởng Tiến Phát",
        qty: 5, unitPrice: 28000000, totalPrice: 140000000,
        warehouse: "Kho chính",
        lines: [
            { _id: 1, productName: "Bàn thờ chạm rồng cuốn thủy", productCode: "SP-PT-004", formType: "NEW", productType: "FINISHED", category: "Phòng Thờ", materialType: "Gỗ Hương", color: "Hương", length: "180", width: "60", height: "100", qty: 5, importPrice: 28000000, location: "Kho B – Tầng 1", details: "Chạm khắc rồng cuốn thủy, sơn vàng" },
        ],
    },
];

const fmtCurrency = (n) => new Intl.NumberFormat("vi-VN").format(n) + "₫";
const fmtDateTime = (s) => {
    if (!s) return "—";
    const d = new Date(s);
    return `${d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} - ${d.toLocaleDateString("vi-VN")}`;
};

// ─────────────────────────────────────────────────────────
export default function AccountantImportManage() {
    const [imports, setImports] = useState(INIT_IMPORTS);
    const [search, setSearch] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(15);
    const [showCreate, setShowCreate] = useState(false);
    const [viewItem, setViewItem] = useState(null);

    const filtered = useMemo(() => {
        let r = imports;
        if (dateFilter) {
            r = r.filter(i => {
                const dateOnly = i.date.split("T")[0]; // YYYY-MM-DD
                return dateOnly === dateFilter;
            });
        }
        if (search.trim()) {
            const q = search.toLowerCase();
            r = r.filter(i =>
                i.code.toLowerCase().includes(q) ||
                i.product.toLowerCase().includes(q) ||
                i.supplier.toLowerCase().includes(q)
            );
        }
        return r;
    }, [imports, dateFilter, search]);

    useEffect(() => setPage(1), [search, dateFilter]);

    const paginated = filtered.slice((page - 1) * perPage, page * perPage);
    const totalPages = Math.ceil(filtered.length / perPage) || 1;

    const handleSaved = (data) => {
        const newItem = {
            id: `NK-${Date.now()}`,
            code: `NK-${new Date().toLocaleDateString("vi-VN").replace(/\//g, "")}-${String(imports.length + 1).padStart(3, "0")}`,
            date: new Date().toISOString(),
            product: data.lines[0]?.isBundle
                ? (data.lines[0]?.bundleName ?? "")
                : (data.lines[0]?.productName ?? ""),
            supplier: data.supplier,
            qty: data.lines.reduce((s, l) => {
                if (l.isBundle) return s + Number(l.bundleQty || 0);
                return s + Number(l.qty || 0);
            }, 0),
            unitPrice: data.lines[0]?.isBundle
                ? Number(data.lines[0]?.bundlePrice || 0)
                : Number(data.lines[0]?.importPrice || 0),
            totalPrice: data.grandTotal,
            warehouse: "Kho chính",
            lines: data.lines,
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
                                {paginated.length === 0 && (
                                    <tr><td colSpan={7} className="py-24 text-center">
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
