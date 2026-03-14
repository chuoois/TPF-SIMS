/**
 * ViewImportModal – Xem Chi Tiết Phiếu Nhập Kho (Read-Only)
 *
 * Hiển thị:
 *  - Khu vực 1: Thông tin chứng từ (mã phiếu, ngày, xưởng, kho, trạng thái, ghi chú)
 *  - Khu vực 2: Bảng chi tiết sản phẩm từng dòng
 *
 * Created By: HieuNM – 12/03/2026
 */

import {
    X, ArrowDownToLine, Building2, Calendar, Warehouse,
    StickyNote, Package, CheckCircle2, Clock, Ruler,
    Tag, Layers,
} from "lucide-react";

// ── Helpers ──────────────────────────────────────────────
const fmtCurrency = (n) =>
    n != null ? new Intl.NumberFormat("vi-VN").format(n) + "₫" : "—";

const fmtDate = (s) => {
    if (!s) return "—";
    const d = new Date(s);
    return `${d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} · ${d.toLocaleDateString("vi-VN")}`;
};

const STATUS_STYLES = {
    "Đang xử lý": { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
    "Đã nhập kho": { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
};

const StatusPill = ({ status }) => {
    const s = STATUS_STYLES[status] || { bg: "#F3F4F6", text: "#6B7280", border: "#E5E7EB" };
    const Icon = status === "Đã nhập kho" ? CheckCircle2 : Clock;
    return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold"
            style={{ backgroundColor: s.bg, color: s.text, border: `1px solid ${s.border}` }}>
            <Icon size={13} />
            {status}
        </span>
    );
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

// ─────────────────────────────────────────────────────────
export default function ViewImportModal({ item, onClose }) {
    if (!item) return null;

    const lines = item.lines || [];
    const grandTotal = item.totalPrice ?? lines.reduce((s, l) =>
        s + (Number(l.qty || 0) * Number(l.importPrice || 0)), 0);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col"
                style={{ maxHeight: "85vh" }}>

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

                    {/* ── KHU VỰC 1: Thông tin chứng từ ── */}
                    <div className="rounded-xl p-5 space-y-4"
                        style={{ backgroundColor: "var(--bg-main)", border: "1px solid var(--grid-border)" }}>
                        <p className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                            style={{ color: "var(--brand-primary)" }}>
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-[10px] font-black"
                                style={{ backgroundColor: "var(--brand-primary)" }}>1</span>
                            Thông tin chứng từ
                        </p>

                        <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
                            <InfoBlock icon={Calendar} label="Ngày nhập" value={fmtDate(item.date)} />
                            <InfoBlock icon={Building2} label="Xưởng cung cấp" value={item.supplier} />
                            <InfoBlock icon={Warehouse} label="Kho nhận" value={item.warehouse} />
                        </div>

                        <div className="flex items-center justify-between border-t pt-4"
                            style={{ borderColor: "var(--grid-border)" }}>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1"
                                    style={{ color: "var(--text-placeholder)" }}>
                                    <StickyNote size={10} /> Ghi chú
                                </span>
                                <span className="text-[13px] italic" style={{ color: item.note ? "var(--text-main)" : "var(--text-placeholder)" }}>
                                    {item.note || "Không có ghi chú"}
                                </span>
                            </div>
                            <StatusPill status={item.status} />
                        </div>
                    </div>

                    {/* ── KHU VỰC 2: Chi tiết sản phẩm ── */}
                    <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                            style={{ color: "var(--brand-primary)" }}>
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-[10px] font-black"
                                style={{ backgroundColor: "var(--brand-primary)" }}>2</span>
                            Chi tiết sản phẩm nhập
                        </p>

                        {lines.length === 0 ? (
                            /* Fallback khi không có lines[] (phiếu cũ trong mock) */
                            <div className="rounded-xl overflow-hidden border" style={{ borderColor: "var(--grid-border)" }}>
                                <table className="w-full text-left">
                                    <thead style={{ backgroundColor: "var(--grid-header-bg)", borderBottom: "1px solid var(--grid-border)" }}>
                                        <tr>
                                            {["#", "Tên sản phẩm", "Xưởng", "SL", "Đơn giá", "Thành tiền"].map((h, i) => (
                                                <th key={i} className={`px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider ${i >= 3 ? "text-right" : ""}`}
                                                    style={{ color: "var(--text-placeholder)" }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr style={{ borderBottom: "1px solid var(--grid-border)" }}>
                                            <td className="px-4 py-3 text-[12px]" style={{ color: "var(--text-secondary)" }}>1</td>
                                            <td className="px-4 py-3">
                                                <p className="text-[13px] font-semibold" style={{ color: "var(--text-main)" }}>{item.product}</p>
                                            </td>
                                            <td className="px-4 py-3 text-[12px]" style={{ color: "var(--text-secondary)" }}>{item.supplier}</td>
                                            <td className="px-4 py-3 text-right text-[13px] font-bold" style={{ color: "var(--text-main)" }}>{item.qty}</td>
                                            <td className="px-4 py-3 text-right text-[12px]" style={{ color: "var(--text-secondary)" }}>{fmtCurrency(item.unitPrice)}</td>
                                            <td className="px-4 py-3 text-right text-[13px] font-bold" style={{ color: "var(--text-main)" }}>{fmtCurrency(item.totalPrice)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            /* Chi tiết từng dòng khi có lines[] */
                            <div className="space-y-3">
                                {lines.map((line, idx) => {
                                    const lineTotal = Number(line.qty || 0) * Number(line.importPrice || 0);
                                    const formLabel = line.formType === "READY" ? "Hàng sẵn có" : "Hàng mới lên";
                                    const productTypeLabel = {
                                        RAW: "Hàng thô",
                                        CUSTOM: "Hàng khách đặt",
                                        FINISHED: "Hàng hoàn thiện",
                                    }[line.productType] || line.productType || "";

                                    const dims = [line.length, line.width, line.height]
                                        .filter(Boolean).join(" × ");

                                    return (
                                        <div key={line._id ?? idx}
                                            className="rounded-xl border overflow-hidden"
                                            style={{ borderColor: "var(--grid-border)" }}>
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
                                                {/* Tên SP */}
                                                <div className="col-span-2 sm:col-span-3">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 mb-1"
                                                        style={{ color: "var(--text-placeholder)" }}>
                                                        <Tag size={10} /> Tên sản phẩm
                                                    </span>
                                                    <p className="text-[14px] font-bold" style={{ color: "var(--text-main)" }}>
                                                        {line.productName || "—"}
                                                    </p>
                                                    {line.productCode && (
                                                        <p className="text-[11px] font-mono mt-0.5" style={{ color: "var(--text-placeholder)" }}>
                                                            {line.productCode}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Danh mục */}
                                                {line.category && <InfoBlock icon={Layers} label="Danh mục" value={line.category} />}

                                                {/* Loại gỗ */}
                                                {line.woodType && <InfoBlock label="Loại gỗ" value={line.woodType} />}

                                                {/* Màu sắc */}
                                                {line.color && <InfoBlock label="Màu sắc" value={line.color} />}

                                                {/* Kích thước */}
                                                {dims && (
                                                    <InfoBlock icon={Ruler} label="Kích thước (cm)" value={`${dims} cm`} />
                                                )}

                                                {/* Vị trí */}
                                                {line.location && <InfoBlock label="Vị trí cất hàng" value={line.location} />}

                                                {/* SL + Giá */}
                                                <InfoBlock label="Số lượng" value={line.qty ? `${line.qty} cái` : "—"} />
                                                <InfoBlock label="Giá gốc" value={fmtCurrency(Number(line.importPrice))} />
                                                {line.sellingPrice && (
                                                    <InfoBlock label="Giá bán" value={fmtCurrency(Number(line.sellingPrice))} />
                                                )}

                                                {/* Chi tiết */}
                                                {line.details && (
                                                    <div className="col-span-2 sm:col-span-3 mt-1">
                                                        <span className="text-[10px] font-bold uppercase tracking-widest block mb-1"
                                                            style={{ color: "var(--text-placeholder)" }}>Chi tiết</span>
                                                        <p className="text-[12px] italic rounded-lg px-3 py-2"
                                                            style={{ color: "var(--text-secondary)", backgroundColor: "var(--bg-main)", border: "1px solid var(--grid-border)" }}>
                                                            {line.details}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Ảnh SP */}
                                                {line.imagePreview && (
                                                    <div className="col-span-2 sm:col-span-3">
                                                        <span className="text-[10px] font-bold uppercase tracking-widest block mb-1"
                                                            style={{ color: "var(--text-placeholder)" }}>Hình ảnh</span>
                                                        <img src={line.imagePreview} alt={line.productName}
                                                            className="max-h-40 rounded-xl object-cover border"
                                                            style={{ borderColor: "var(--grid-border)" }} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Footer ── */}
                <div className="px-6 py-4 border-t shrink-0 flex items-center justify-between"
                    style={{ borderColor: "var(--grid-border)", backgroundColor: "var(--bg-main)" }}>
                    {/* Tổng giá trị */}
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
