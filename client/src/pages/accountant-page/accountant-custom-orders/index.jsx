/**
 * AccountantCustomOrders – Tổng hợp Sản phẩm Đặt Làm Riêng
 *
 * Tổng hợp tất cả sản phẩm từ đơn hàng CUSTOM (đặt làm riêng),
 * cho phép kế toán chọn sản phẩm, điền nhà cung cấp và in phiếu nhập hàng.
 *
 * Created By: HieuNM – 07/03/2026
 */

import { useState, useMemo, useRef } from "react";
import {
    Search, X, ClipboardList, Printer, CheckSquare, Square,
    ChevronLeft, ChevronRight, PackageSearch,
    Calendar, Layers, Hash,
} from "lucide-react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import { toast } from "react-hot-toast";


// ─── MOCK DATA ───────────────────────────────────────────────────────────────
// Dữ liệu mẫu: tổng hợp các sản phẩm từ đơn đặt làm riêng
const MOCK_ITEMS = [
    {
        custom_product_name: "Bộ bàn ghế Nghê Bảo Đỉnh 6 món",
        custom_wood_type: "Gỗ Hương",
        custom_size: "120x60x75cm",
        custom_color: "Nâu tự nhiên",
        custom_note: "Chạm hoa văn rồng phượng",
        unit_price: 38000000,
        total_quantity: 2,
        order_codes: "HD260301A1, HD260228B2",
        nearest_delivery: "2026-04-15",
    },
    {
        custom_product_name: "Sofa nguyên khối chữ L",
        custom_wood_type: "Gỗ Gụ",
        custom_size: "280x180cm",
        custom_color: "Đen bóng",
        custom_note: "Bọc da cao cấp",
        unit_price: 25000000,
        total_quantity: 1,
        order_codes: "HD260301C3",
        nearest_delivery: "2026-04-20",
    },
    {
        custom_product_name: "Sập thờ Mai Điểu chân 20",
        custom_wood_type: "Gỗ Mít",
        custom_size: "200x90x80cm",
        custom_color: "Vàng son",
        custom_note: "Chân tiện tròn, mặt phẳng",
        unit_price: 18000000,
        total_quantity: 3,
        order_codes: "HD260225A5, HD260301D4",
        nearest_delivery: "2026-03-30",
    },
    {
        custom_product_name: "Tủ quần áo 4 cánh chạm hoa lá tây",
        custom_wood_type: "Gỗ Xoan Đào",
        custom_size: "200x60x220cm",
        custom_color: "Nâu đỏ",
        custom_note: "Tay nắm đồng, khóa ngầm",
        unit_price: 22000000,
        total_quantity: 2,
        order_codes: "HD260228E6",
        nearest_delivery: "2026-05-01",
    },
    {
        custom_product_name: "Giường ngủ hoa hồng Tân cổ điển",
        custom_wood_type: "Gỗ Sồi",
        custom_size: "180x200cm",
        custom_color: "Trắng ngà",
        custom_note: null,
        unit_price: 15000000,
        total_quantity: 1,
        order_codes: "HD260220F7",
        nearest_delivery: "2026-04-10",
    },
    {
        custom_product_name: "Hoành phi câu đối chạm rồng",
        custom_wood_type: "Gỗ Hương",
        custom_size: "100x40cm",
        custom_color: "Đỏ son dát vàng",
        custom_note: "Chữ thư pháp theo yêu cầu",
        unit_price: 9500000,
        total_quantity: 4,
        order_codes: "HD260215G8, HD260301H9",
        nearest_delivery: null,
    },
    {
        custom_product_name: "Bàn thờ chạm rồng cuốn thủy",
        custom_wood_type: "Gỗ Gụ",
        custom_size: "150x50x85cm",
        custom_color: "Nâu đen",
        custom_note: null,
        unit_price: 28000000,
        total_quantity: 1,
        order_codes: "HD260301I0",
        nearest_delivery: "2026-04-25",
    },
    {
        custom_product_name: "Bộ bàn ăn 8 ghế nguyên khối",
        custom_wood_type: "Gỗ Trắc",
        custom_size: "240x100x75cm",
        custom_color: "Nâu tự nhiên",
        custom_note: "Chân bàn chạm tiện, ghế bọc vải",
        unit_price: 32000000,
        total_quantity: 1,
        order_codes: "HD260210J1",
        nearest_delivery: "2026-05-15",
    },
];

// ─── helpers ────────────────────────────────────────────────────────────────
const fmtDate = (s) => {
    if (!s) return "—";
    return new Date(s).toLocaleDateString("vi-VN");
};

const fmtCurrency = (n) =>
    n ? new Intl.NumberFormat("vi-VN").format(n) + "₫" : "—";

const rowKey = (item) =>
    [item.custom_product_name, item.custom_wood_type, item.custom_size, item.custom_color, item.custom_note]
        .map((v) => v ?? "")
        .join("|");

// ─── sub-components ─────────────────────────────────────────────────────────
const TagPill = ({ value, color, bg }) => {
    if (!value) return null;
    return (
        <span
            className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold"
            style={{ backgroundColor: bg, color }}
        >
            {value}
        </span>
    );
};

// ─── Print stylesheet injected once ─────────────────────────────────────────
const PRINT_STYLE = `
@media print {
  body * { visibility: hidden !important; }
  #co-print-area, #co-print-area * { visibility: visible !important; }
  #co-print-area {
    position: fixed !important;
    top: 0; left: 0;
    width: 100%; height: auto;
    padding: 24px 32px;
    background: #fff;
    font-family: 'Times New Roman', serif;
  }
}
`;

// ─── main page ───────────────────────────────────────────────────────────────
export default function AccountantCustomOrders() {
    const [items] = useState(MOCK_ITEMS);
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState(new Set());
    const [page, setPage] = useState(1);
    const perPage = 15;

    // Inject print style once
    const styleInjected = useRef(false);
    if (!styleInjected.current) {
        const tag = document.createElement("style");
        tag.innerHTML = PRINT_STYLE;
        document.head.appendChild(tag);
        styleInjected.current = true;
    }

    // Filter
    const filtered = useMemo(() => {
        if (!search.trim()) return items;
        const q = search.toLowerCase();
        return items.filter((it) =>
            it.custom_product_name.toLowerCase().includes(q) ||
            (it.custom_wood_type || "").toLowerCase().includes(q) ||
            (it.order_codes || "").toLowerCase().includes(q)
        );
    }, [items, search]);

    // Pagination
    const totalPages = Math.ceil(filtered.length / perPage) || 1;
    const paginated = useMemo(
        () => filtered.slice((page - 1) * perPage, page * perPage),
        [filtered, page, perPage]
    );

    // Selection helpers
    const allPageSelected =
        paginated.length > 0 && paginated.every((it) => selected.has(rowKey(it)));

    const toggleAll = () => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (allPageSelected) paginated.forEach((it) => next.delete(rowKey(it)));
            else paginated.forEach((it) => next.add(rowKey(it)));
            return next;
        });
    };

    const toggleRow = (key) => {
        setSelected((prev) => {
            const next = new Set(prev);
            next.has(key) ? next.delete(key) : next.add(key);
            return next;
        });
    };

    const selectedItems = items.filter((it) => selected.has(rowKey(it)));
    const selectAll = () => setSelected(new Set(items.map(rowKey)));
    const clearAll = () => setSelected(new Set());

    const handlePrint = () => {
        if (selected.size === 0) {
            toast.error("Vui lòng chọn ít nhất 1 sản phẩm để in");
            return;
        }
        window.print();
    };

    const today = new Date().toLocaleDateString("vi-VN");

    return (
        <>
            <PageHelmet title="Sản phẩm Đặt Làm Riêng | Kế toán" />

            {/* ══════════════ PRINT AREA ══════════════ */}
            <div id="co-print-area" style={{ display: "none" }}>
                <style>{`@media print { #co-print-area { display: block !important; } }`}</style>

                <div style={{ textAlign: "center", marginBottom: 20 }}>
                    <h2 style={{ fontSize: 20, fontWeight: "bold", letterSpacing: 1, textTransform: "uppercase" }}>
                        Phiếu Nhập Hàng – Sản Phẩm Đặt Làm Riêng
                    </h2>
                    <p style={{ fontSize: 13, color: "#555", marginTop: 4 }}>Ngày in: {today}</p>
                </div>

                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead>
                        <tr style={{ backgroundColor: "#F3F4F6" }}>
                            {["STT", "Tên sản phẩm", "Loại gỗ", "Kích thước", "Ghi chú", "SL"].map((h) => (
                                <th
                                    key={h}
                                    style={{
                                        border: "1px solid #D1D5DB",
                                        padding: "6px 8px",
                                        textAlign: h === "SL" ? "right" : "left",
                                    }}
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {selectedItems.map((it, idx) => (
                            <tr key={rowKey(it)}>
                                <td style={{ border: "1px solid #D1D5DB", padding: "5px 8px", textAlign: "center" }}>{idx + 1}</td>
                                <td style={{ border: "1px solid #D1D5DB", padding: "5px 8px", fontWeight: "bold" }}>{it.custom_product_name}</td>
                                <td style={{ border: "1px solid #D1D5DB", padding: "5px 8px" }}>{it.custom_wood_type || "—"}</td>
                                <td style={{ border: "1px solid #D1D5DB", padding: "5px 8px" }}>{it.custom_size || "—"}</td>
                                <td style={{ border: "1px solid #D1D5DB", padding: "5px 8px", fontStyle: "italic" }}>{it.custom_note || "—"}</td>
                                <td style={{ border: "1px solid #D1D5DB", padding: "5px 8px", textAlign: "right", fontWeight: "bold" }}>{it.total_quantity}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr style={{ backgroundColor: "#F9FAFB" }}>
                            <td colSpan={6} style={{ border: "1px solid #D1D5DB", padding: "6px 8px", fontWeight: "bold", textAlign: "right" }}>Tổng cộng</td>
                            <td style={{ border: "1px solid #D1D5DB", padding: "6px 8px", textAlign: "right", fontWeight: "bold" }}>
                                {selectedItems.reduce((s, it) => s + it.total_quantity, 0)}
                            </td>
                        </tr>
                    </tfoot>
                </table>

                {/* Signatures */}
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 48, fontSize: 13 }}>
                    {["Người lập phiếu", "Xưởng sản xuất", "Chủ cửa hàng"].map((label) => (
                        <div key={label} style={{ textAlign: "center", width: "30%" }}>
                            <p style={{ fontWeight: "bold" }}>{label}</p>
                            <p style={{ color: "#888", fontSize: 11, marginTop: 4 }}>(Ký và ghi rõ họ tên)</p>
                            <div style={{ marginTop: 52, borderTop: "1px solid #aaa" }} />
                        </div>
                    ))}
                </div>
            </div>

            {/* ══════════════ SCREEN UI ══════════════ */}
            <div
                className="flex flex-col h-[calc(100vh-64px)] -m-6 p-6 space-y-4"
                style={{ backgroundColor: "var(--bg-main)" }}
            >
                {/* Header */}
                <div className="flex items-start justify-between shrink-0 gap-4 flex-wrap">
                    <div>
                        <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: "var(--text-main)" }}>
                            <ClipboardList size={22} style={{ color: "var(--brand-primary)" }} />
                            Sản phẩm Đặt Làm Riêng
                        </h1>
                        <p className="text-[13px] mt-0.5" style={{ color: "var(--text-placeholder)" }}>
                            {filtered.length} sản phẩm · Tổng hợp từ các đơn hàng đặt làm riêng
                            {selected.size > 0 && (
                                <> · <span className="font-semibold" style={{ color: "var(--brand-primary)" }}>Đã chọn {selected.size} dòng</span></>
                            )}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Print */}
                        <button
                            onClick={handlePrint}
                            disabled={selected.size === 0}
                            className="h-9 px-4 rounded-lg flex items-center gap-2 text-[13px] font-bold hover:opacity-90 cursor-pointer transition disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{ backgroundColor: "var(--brand-primary)", color: "#fff" }}
                        >
                            <Printer size={15} />
                            In phiếu {selected.size > 0 && `(${selected.size})`}
                        </button>
                    </div>
                </div>

                {/* Stats bar */}
                {selected.size > 0 && (
                    <div
                        className="shrink-0 rounded-xl px-4 py-2.5 flex items-center gap-4 flex-wrap"
                        style={{ backgroundColor: "#EEF2FF", border: "1px solid #C7D2FE" }}
                    >
                        <div className="flex items-center gap-2">
                            <Layers size={14} style={{ color: "#4F46E5" }} />
                            <span className="text-[12px] font-semibold" style={{ color: "#4338CA" }}>
                                Tổng SL: <strong>{selectedItems.reduce((s, it) => s + it.total_quantity, 0)}</strong>
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Hash size={14} style={{ color: "#4F46E5" }} />
                            <span className="text-[12px] font-semibold" style={{ color: "#4338CA" }}>
                                Tổng tiền: <strong>{fmtCurrency(selectedItems.reduce((s, it) => s + it.unit_price * it.total_quantity, 0))}</strong>
                            </span>
                        </div>
                        <div className="ml-auto flex gap-2">
                            <button
                                onClick={selectAll}
                                className="text-[12px] font-semibold px-2.5 py-1 rounded-md hover:bg-indigo-100 cursor-pointer transition"
                                style={{ color: "#4338CA" }}
                            >
                                Chọn tất cả ({items.length})
                            </button>
                            <button
                                onClick={clearAll}
                                className="text-[12px] font-semibold px-2.5 py-1 rounded-md hover:bg-red-50 cursor-pointer transition"
                                style={{ color: "#DC2626" }}
                            >
                                Bỏ chọn
                            </button>
                        </div>
                    </div>
                )}

                {/* Table card */}
                <div
                    className="flex flex-col bg-white rounded-2xl flex-1 overflow-hidden"
                    style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
                >
                    {/* Search */}
                    <div className="px-4 py-3 border-b shrink-0 flex items-center gap-3" style={{ borderColor: "var(--grid-border)" }}>
                        <div className="relative w-full max-w-md">
                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-placeholder)" }} />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                placeholder="Tìm theo tên sản phẩm, loại gỗ, mã đơn..."
                                className="w-full h-9 pl-10 pr-8 rounded-lg text-[13px] focus:outline-none focus:ring-2 transition"
                                style={{ border: "1px solid var(--grid-border)", backgroundColor: "var(--bg-main)", color: "var(--text-main)" }}
                            />
                            {search && (
                                <button
                                    onClick={() => { setSearch(""); setPage(1); }}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
                                    style={{ color: "var(--text-placeholder)" }}
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                        <span className="text-[12px]" style={{ color: "var(--text-placeholder)" }}>{filtered.length} kết quả</span>
                    </div>

                    {/* Table */}
                    <div className="flex-1 overflow-y-auto">
                        <table className="w-full text-left">
                            <thead
                                className="sticky top-0 z-10"
                                style={{ backgroundColor: "var(--grid-header-bg)", borderBottom: "1px solid var(--grid-border)" }}
                            >
                                <tr>
                                    {/* Checkbox header */}
                                    <th className="px-4 py-3 w-10">
                                        <button
                                            onClick={toggleAll}
                                            className="cursor-pointer"
                                            style={{ color: allPageSelected ? "var(--brand-primary)" : "var(--text-placeholder)" }}
                                        >
                                            {allPageSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                                        </button>
                                    </th>
                                    {["Tên sản phẩm", "Loại gỗ", "Kích thước", "Ghi chú", "Tổng SL", "Mã đơn hàng"].map((h) => (
                                        <th
                                            key={h}
                                            className={`px-4 py-3 text-[11px] font-bold uppercase tracking-wider ${h === "Tổng SL" ? "text-right" : ""}`}
                                            style={{ color: "var(--text-placeholder)" }}
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.map((item) => {
                                    const key = rowKey(item);
                                    const checked = selected.has(key);
                                    return (
                                        <tr
                                            key={key}
                                            onClick={() => toggleRow(key)}
                                            className="cursor-pointer transition-colors"
                                            style={{
                                                borderBottom: "1px solid var(--grid-border)",
                                                backgroundColor: checked ? "rgba(79,70,229,0.05)" : undefined,
                                            }}
                                            onMouseEnter={(e) => { if (!checked) e.currentTarget.style.backgroundColor = "#F9FAFB"; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = checked ? "rgba(79,70,229,0.05)" : ""; }}
                                        >
                                            {/* Checkbox */}
                                            <td className="px-4 py-3">
                                                <span style={{ color: checked ? "var(--brand-primary)" : "var(--text-placeholder)" }}>
                                                    {checked ? <CheckSquare size={16} /> : <Square size={16} />}
                                                </span>
                                            </td>

                                            {/* Tên SP */}
                                            <td className="px-4 py-3 max-w-[200px]">
                                                <p className="text-[13px] font-bold" style={{ color: "var(--text-main)" }} title={item.custom_product_name}>
                                                    {item.custom_product_name}
                                                </p>
                                            </td>

                                            {/* Loại gỗ */}
                                            <td className="px-4 py-3">
                                                <TagPill value={item.custom_wood_type} color="#92400E" bg="#FEF3C7" />
                                            </td>

                                            {/* Kích thước */}
                                            <td className="px-4 py-3">
                                                <TagPill value={item.custom_size} color="#065F46" bg="#ECFDF5" />
                                            </td>

                                            {/* Ghi chú */}
                                            <td className="px-4 py-3 max-w-[160px]">
                                                <p className="text-[12px] italic truncate" style={{ color: "var(--text-placeholder)" }} title={item.custom_note}>
                                                    {item.custom_note || "—"}
                                                </p>
                                            </td>

                                            {/* Tổng SL */}
                                            <td className="px-4 py-3 text-right">
                                                <span
                                                    className="inline-flex items-center justify-center min-w-[32px] h-7 px-2 rounded-lg text-[13px] font-bold"
                                                    style={{
                                                        backgroundColor: checked ? "var(--brand-primary)" : "#F3F4F6",
                                                        color: checked ? "#fff" : "var(--text-main)",
                                                    }}
                                                >
                                                    {item.total_quantity}
                                                </span>
                                            </td>

                                            {/* Mã đơn */}
                                            <td className="px-4 py-3 max-w-[180px]">
                                                <p className="text-[11px] font-mono truncate" style={{ color: "#4F46E5" }} title={item.order_codes}>
                                                    {item.order_codes || "—"}
                                                </p>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {paginated.length === 0 && (
                                    <tr>
                                        <td colSpan={10} className="py-24 text-center">
                                            <div className="flex flex-col items-center gap-2" style={{ color: "var(--text-placeholder)" }}>
                                                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "var(--bg-main)" }}>
                                                    <PackageSearch size={28} strokeWidth={1.5} />
                                                </div>
                                                <p className="text-sm font-medium mt-1">Không tìm thấy sản phẩm nào</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {filtered.length > perPage && (
                        <div
                            className="flex items-center justify-between px-6 py-3 border-t shrink-0"
                            style={{ borderColor: "var(--grid-border)", backgroundColor: "var(--bg-main)" }}
                        >
                            <div className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                                Tổng: <span className="font-bold" style={{ color: "var(--text-main)" }}>{filtered.length}</span> sản phẩm
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                                    <span className="font-bold" style={{ color: "var(--text-main)" }}>
                                        {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)}
                                    </span>{" "}/ {filtered.length}
                                </span>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="p-1 rounded disabled:opacity-30 hover:bg-gray-200 cursor-pointer"
                                        style={{ color: "var(--text-main)" }}
                                    >
                                        <ChevronLeft size={16} strokeWidth={2.5} />
                                    </button>
                                    <button
                                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={page >= totalPages}
                                        className="p-1 rounded disabled:opacity-30 hover:bg-gray-200 cursor-pointer"
                                        style={{ color: "var(--text-main)" }}
                                    >
                                        <ChevronRight size={16} strokeWidth={2.5} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
