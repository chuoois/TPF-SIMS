/**
 * ViewImportModal – Xem Chi Tiết Phiếu Nhập Kho (Read-Only)
 * Hỗ trợ cả dòng đơn lẻ và dòng bộ (isBundle=true) với bảng các món lẻ.
 */

import {
    X, ArrowDownToLine, Building2, Calendar, Warehouse,
    StickyNote, Package, Ruler, Tag, Layers, CheckCircle, AlertTriangle,
} from "lucide-react";

// ── Helpers ──────────────────────────────────────────────
const fmtCurrency = (n) =>
    n != null ? new Intl.NumberFormat("vi-VN").format(n) + "₫" : "—";

const fmtDate = (s) => {
    if (!s) return "—";
    const d = new Date(s);
    return `${d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} · ${d.toLocaleDateString("vi-VN")}`;
};

const InfoBlock = ({ icon: Icon, label, value, className = "" }) => (
    <div className={`flex flex-col gap-1 ${className}`}>
        <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1"
            style={{ color: "var(--text-placeholder)" }}>
            {Icon && <Icon size={10} />}{label}
        </span>
        <span className="text-[13px] font-semibold" style={{ color: "var(--text-main)" }}>
            {value || "—"}
        </span>
    </div>
);

// ── Bundle card ───────────────────────────────────────────
function BundleLineCard({ line, idx }) {
    const estimatedTotal = (line.items || []).reduce(
        (s, it) => s + (Number(it.qty) || 0) * (Number(it.unitPrice) || 0), 0
    );
    const invoiceTotal = (Number(line.bundleQty) || 0) * (Number(line.bundlePrice) || 0);
    const diff = estimatedTotal - invoiceTotal;
    const isMatch = estimatedTotal > 0 && Math.abs(diff) === 0;

    const formLabel = line.formType === "READY" ? "Hàng nhập thêm" : "Hàng mới";
    const productTypeLabel = { RAW: "Hàng mộc", CUSTOM: "Hàng khách đặt", FINISHED: "Hàng có sẵn" }[line.productType] || "";

    return (
        <div className="rounded-xl overflow-hidden" style={{ border: "2px solid #7C3AED" }}>
            {/* Card header */}
            <div className="px-4 py-2.5 flex items-center justify-between" style={{ backgroundColor: "#F5F3FF" }}>
                <div className="flex items-center gap-2">
                    <Layers size={13} style={{ color: "#7C3AED" }} />
                    <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "#7C3AED" }}>
                        Bộ sản phẩm #{idx + 1}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold"
                        style={{ backgroundColor: "#EEF2FF", color: "#4338CA", border: "1px solid #C7D2FE" }}>
                        {formLabel}
                    </span>
                    {productTypeLabel && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold"
                            style={{ backgroundColor: "#F0FDF4", color: "#15803D", border: "1px solid #BBF7D0" }}>
                            {productTypeLabel}
                        </span>
                    )}
                </div>
                {invoiceTotal > 0 && (
                    <span className="text-[12px] font-bold px-2.5 py-1 rounded-lg"
                        style={{ backgroundColor: "#EDE9FE", color: "#7C3AED", border: "1px solid #DDD6FE" }}>
                        {fmtCurrency(invoiceTotal)}
                    </span>
                )}
            </div>

            <div className="p-4 space-y-4" style={{ backgroundColor: "#FAFAFE" }}>
                {/* Tên bộ + mã */}
                <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 mb-1"
                        style={{ color: "var(--text-placeholder)" }}>
                        <Tag size={10} /> Tên bộ sản phẩm
                    </span>
                    <p className="text-[14px] font-bold" style={{ color: "var(--text-main)" }}>
                        {line.bundleName || "—"}
                    </p>
                    {line.productCode && (
                        <p className="text-[11px] font-mono mt-0.5" style={{ color: "var(--text-placeholder)" }}>
                            {line.productCode}
                        </p>
                    )}
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-3">
                    <InfoBlock label="Số bộ" value={line.bundleQty ? `${line.bundleQty} bộ` : "—"} />
                    <InfoBlock label="Giá cả bộ (HĐ)" value={fmtCurrency(line.bundlePrice)} />
                    {line.category && <InfoBlock icon={Layers} label="Danh mục" value={line.category} />}
                    {line.woodType && <InfoBlock label="Loại gỗ" value={line.woodType} />}
                    {line.color && <InfoBlock label="Màu sắc" value={line.color} />}
                </div>

                {/* Bảng các món lẻ */}
                {line.items && line.items.length > 0 && (
                    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #DDD6FE" }}>
                        <div className="px-4 py-2 flex items-center justify-between" style={{ backgroundColor: "#EDE9FE" }}>
                            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#5B21B6" }}>
                                Các món lẻ trong bộ
                                <span className="ml-1 opacity-60 normal-case font-normal">(ước tính giá vốn)</span>
                            </p>
                            {estimatedTotal > 0 && invoiceTotal > 0 && (
                                isMatch ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                                        style={{ backgroundColor: "#F0FDF4", color: "#15803D", border: "1px solid #BBF7D0" }}>
                                        <CheckCircle size={9} /> Khớp HĐ
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                                        style={{ backgroundColor: "#FFFBEB", color: "#D97706", border: "1px solid #FDE68A" }}>
                                        <AlertTriangle size={9} />
                                        {diff > 0 ? "+" : ""}{fmtCurrency(Math.abs(diff))} chênh lệch
                                    </span>
                                )
                            )}
                        </div>
                        <table className="w-full" style={{ backgroundColor: "#fff" }}>
                            <thead>
                                <tr style={{ borderBottom: "1px solid #EDE9FE" }}>
                                    <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-wider w-8" style={{ color: "#7C3AED" }}>#</th>
                                    <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-wider" style={{ color: "#7C3AED" }}>Tên món</th>
                                    <th className="px-3 py-2 text-center text-[10px] font-bold uppercase tracking-wider w-20" style={{ color: "#7C3AED" }}>SL</th>
                                    <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-wider w-40" style={{ color: "#7C3AED" }}>Giá ước tính/đv</th>
                                    <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-wider w-36" style={{ color: "#7C3AED" }}>Thành</th>
                                </tr>
                            </thead>
                            <tbody>
                                {line.items.map((item, iIdx) => {
                                    const sub = (Number(item.qty) || 0) * (Number(item.unitPrice) || 0);
                                    return (
                                        <tr key={item._id || iIdx} style={{ borderBottom: "1px solid #F3F0FF" }}>
                                            <td className="px-4 py-2.5 text-[12px] font-semibold" style={{ color: "#7C3AED" }}>{iIdx + 1}</td>
                                            <td className="px-4 py-2.5 text-[13px] font-semibold" style={{ color: "var(--text-main)" }}>{item.name}</td>
                                            <td className="px-3 py-2.5 text-center">
                                                <span className="text-[12px] font-bold px-2 py-0.5 rounded-lg" style={{ backgroundColor: "#EDE9FE", color: "#7C3AED" }}>x{item.qty}</span>
                                            </td>
                                            <td className="px-3 py-2.5 text-right text-[12px]" style={{ color: "var(--text-secondary)" }}>
                                                {item.unitPrice ? fmtCurrency(item.unitPrice) : <span style={{ color: "var(--text-placeholder)" }}>Chưa có</span>}
                                            </td>
                                            <td className="px-3 py-2.5 text-right text-[12px] font-bold" style={{ color: sub > 0 ? "#5B21B6" : "var(--text-placeholder)" }}>
                                                {sub > 0 ? fmtCurrency(sub) : "—"}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot>
                                <tr style={{ borderTop: "1px solid #DDD6FE" }}>
                                    <td colSpan={4} className="px-4 py-2 text-right text-[10px] font-bold" style={{ color: "#7C3AED" }}>Tổng ước tính</td>
                                    <td className="px-3 py-2 text-right text-[12px] font-black" style={{ color: "#7C3AED" }}>{fmtCurrency(estimatedTotal)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                )}

                {/* Chi tiết */}
                {line.details && (
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest block mb-1" style={{ color: "var(--text-placeholder)" }}>Chi tiết</span>
                        <p className="text-[12px] italic rounded-lg px-3 py-2"
                            style={{ color: "var(--text-secondary)", backgroundColor: "var(--bg-main)", border: "1px solid var(--grid-border)" }}>
                            {line.details}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Single product card ───────────────────────────────────
function SingleLineCard({ line, idx }) {
    const lineTotal = Number(line.qty || 0) * Number(line.importPrice || 0);
    const formLabel = line.formType === "READY" ? "Hàng nhập thêm" : "Hàng mới";
    const productTypeLabel = { RAW: "Hàng mộc", CUSTOM: "Hàng khách đặt", FINISHED: "Hàng có sẵn" }[line.productType] || "";
    const dims = [line.length, line.width, line.height].filter(Boolean).join(" × ");

    return (
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--grid-border)" }}>
            {/* Line header */}
            <div className="flex items-center justify-between px-4 py-2.5"
                style={{ backgroundColor: "var(--bg-main)", borderBottom: "1px solid var(--grid-border)" }}>
                <div className="flex items-center gap-2">
                    <Package size={13} style={{ color: "var(--brand-primary)" }} />
                    <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
                        Mặt hàng #{idx + 1}
                    </span>
                    {formLabel && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold"
                            style={{ backgroundColor: "#EEF2FF", color: "#4338CA", border: "1px solid #C7D2FE" }}>
                            {formLabel}
                        </span>
                    )}
                    {productTypeLabel && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold"
                            style={{ backgroundColor: "#F0FDF4", color: "#15803D", border: "1px solid #BBF7D0" }}>
                            {productTypeLabel}
                        </span>
                    )}
                </div>
                {lineTotal > 0 && (
                    <span className="text-[12px] font-bold px-2.5 py-1 rounded-lg"
                        style={{ backgroundColor: "#F5F3FF", color: "#7C3AED", border: "1px solid #EDE9FE" }}>
                        {fmtCurrency(lineTotal)}
                    </span>
                )}
            </div>

            {/* Line content */}
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
                <div className="col-span-2 sm:col-span-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 mb-1" style={{ color: "var(--text-placeholder)" }}>
                        <Tag size={10} /> Tên sản phẩm
                    </span>
                    <p className="text-[14px] font-bold" style={{ color: "var(--text-main)" }}>{line.productName || "—"}</p>
                    {line.productCode && (
                        <p className="text-[11px] font-mono mt-0.5" style={{ color: "var(--text-placeholder)" }}>{line.productCode}</p>
                    )}
                </div>
                {line.category && <InfoBlock icon={Layers} label="Danh mục" value={line.category} />}
                {line.woodType && <InfoBlock label="Loại gỗ" value={line.woodType} />}
                {line.color && <InfoBlock label="Màu sắc" value={line.color} />}
                {dims && <InfoBlock icon={Ruler} label="Kích thước (cm)" value={`${dims} cm`} />}
                <InfoBlock label="Số lượng" value={line.qty ? `${line.qty} cái` : "—"} />
                {line.importPrice > 0 && <InfoBlock label="Giá nhập" value={fmtCurrency(Number(line.importPrice))} />}
                {line.sellingPrice > 0 && <InfoBlock label="Giá bán" value={fmtCurrency(Number(line.sellingPrice))} />}
                {line.details && (
                    <div className="col-span-2 sm:col-span-3 mt-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest block mb-1" style={{ color: "var(--text-placeholder)" }}>Chi tiết</span>
                        <p className="text-[12px] italic rounded-lg px-3 py-2"
                            style={{ color: "var(--text-secondary)", backgroundColor: "var(--bg-main)", border: "1px solid var(--grid-border)" }}>
                            {line.details}
                        </p>
                    </div>
                )}
                {line.imagePreview && (
                    <div className="col-span-2 sm:col-span-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest block mb-1" style={{ color: "var(--text-placeholder)" }}>Hình ảnh</span>
                        <img src={line.imagePreview} alt={line.productName}
                            className="max-h-40 rounded-xl object-cover border" style={{ borderColor: "var(--grid-border)" }} />
                    </div>
                )}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────
export default function ViewImportModal({ item, onClose }) {
    if (!item) return null;

    const lines = item.lines || [];
    const grandTotal = item.totalPrice ?? lines.reduce((s, l) => {
        if (l.isBundle) return s + (Number(l.bundleQty || 0) * Number(l.bundlePrice || 0));
        return s + (Number(l.qty || 0) * Number(l.importPrice || 0));
    }, 0);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col"
                style={{ maxHeight: "88vh" }}>

                {/* ── Header ── */}
                <div className="flex items-center justify-between px-6 py-4 border-b shrink-0"
                    style={{ borderColor: "var(--grid-border)" }}>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: "var(--brand-primary)", opacity: 0.9 }}>
                            <ArrowDownToLine size={18} color="#fff" />
                        </div>
                        <div>
                            <h2 className="text-[15px] font-bold" style={{ color: "var(--text-main)" }}>
                                Chi Tiết Phiếu Nhập Kho
                            </h2>
                            <p className="text-[11px] font-mono mt-0.5" style={{ color: "var(--brand-primary)" }}>
                                {item.code}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition"
                        style={{ color: "var(--text-secondary)" }}>
                        <X size={18} />
                    </button>
                </div>

                {/* ── Scrollable Body ── */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

                    {/* KHU VỰC 1: Thông tin chứng từ */}
                    <div className="rounded-xl p-5 space-y-4"
                        style={{ backgroundColor: "var(--bg-main)", border: "1px solid var(--grid-border)" }}>
                        <p className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                            style={{ color: "var(--brand-primary)" }}>
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-[10px] font-black"
                                style={{ backgroundColor: "var(--brand-primary)" }}>1</span>
                            Thông tin chứng từ
                        </p>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                            <InfoBlock icon={Calendar} label="Ngày nhập" value={fmtDate(item.date)} />
                            <InfoBlock icon={Building2} label="Xưởng cung cấp" value={item.supplier} />
                        </div>
                        <div className="flex items-start gap-3 border-t pt-4" style={{ borderColor: "var(--grid-border)" }}>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1" style={{ color: "var(--text-placeholder)" }}>
                                    <StickyNote size={10} /> Ghi chú
                                </span>
                                <span className="text-[13px] italic" style={{ color: item.note ? "var(--text-main)" : "var(--text-placeholder)" }}>
                                    {item.note || "Không có ghi chú"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* KHU VỰC 2: Chi tiết sản phẩm */}
                    <div className="space-y-3">
                        <p className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                            style={{ color: "var(--brand-primary)" }}>
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-[10px] font-black"
                                style={{ backgroundColor: "var(--brand-primary)" }}>2</span>
                            Chi tiết sản phẩm nhập
                            <span className="text-[10px] font-normal normal-case opacity-60">({lines.length} dòng)</span>
                        </p>

                        {lines.length === 0 ? (
                            <div className="rounded-xl border p-6 text-center text-[13px] italic" style={{ borderColor: "var(--grid-border)", color: "var(--text-placeholder)" }}>
                                Không có dữ liệu chi tiết
                            </div>
                        ) : (
                            lines.map((line, idx) =>
                                line.isBundle
                                    ? <BundleLineCard key={line._id ?? idx} line={line} idx={idx} />
                                    : <SingleLineCard key={line._id ?? idx} line={line} idx={idx} />
                            )
                        )}
                    </div>
                </div>

                {/* ── Footer ── */}
                <div className="px-6 py-4 border-t shrink-0 flex items-center justify-between"
                    style={{ borderColor: "var(--grid-border)", backgroundColor: "var(--bg-main)" }}>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-placeholder)" }}>
                            Tổng giá trị phiếu
                        </span>
                        <span className="text-[20px] font-black" style={{ color: "var(--brand-primary)" }}>
                            {fmtCurrency(grandTotal)}
                        </span>
                    </div>
                    <button onClick={onClose}
                        className="h-10 px-8 rounded-xl text-[13px] font-bold border cursor-pointer hover:bg-gray-50 transition"
                        style={{ borderColor: "var(--grid-border)", color: "var(--text-secondary)" }}>
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}
