/**
 * CreateImportModal – Tạo Phiếu Nhập Kho
 * - Khu vực 1: Thông tin chứng từ (xưởng, ngày, hình thức, ảnh HĐ)
 * - Khu vực 2: Chi tiết phôi / Sản phẩm thô (gồm nhiều dòng)
 * - Tự sinh SKU khi lưu: chữ đầu Tên + Loại gỗ viết tắt + mã Hình thức
 * Modal size: max-w-3xl, max-h-[70vh]
 *
 * Created By: HieuNM – 07/03/2026
 */

import { useState, useRef } from "react";
import {
    X, Plus, Trash2, Upload, FileImage,
    Building2, Calendar, Package, ChevronDown, Tag,
} from "lucide-react";
import { toast } from "react-hot-toast";

const WOOD_TYPES = [
    "Gỗ Mít", "Gỗ Hương", "Gỗ Gụ", "Gỗ Gõ Đỏ",
    "Gỗ Sồi Nga", "Gỗ Óc Chó", "Gỗ Xà Cừ", "Gỗ Dổi",
    "Gỗ Lim", "Gỗ Trắc", "Gỗ Căm Xe",
];

const FORM_TYPES = [
    { value: "READY", label: "Hàng sẵn có (nhập thêm)", code: "HS" },
    { value: "CUSTOM", label: "Hàng khách đặt", code: "KD" },
];

// ── SKU generator ──────────────────────────────────────
const initials = (str) =>
    str
        .trim()
        .split(/\s+/)
        .map((w) => w[0]?.toUpperCase() ?? "")
        .join("");

const woodAbbr = (wood) =>
    wood
        .replace(/^Gỗ\s*/i, "")
        .split(/\s+/)
        .map((w) => w[0]?.toUpperCase() ?? "")
        .join("");

const generateSKU = (productName, woodType, formType) => {
    const nameInit = initials(productName) || "XX";
    const woodInit = woodType ? woodAbbr(woodType) : "GX";
    const formCode = FORM_TYPES.find((f) => f.value === formType)?.code ?? "XX";
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `${nameInit}-${woodInit}-${formCode}-${rand}`;
};

// ── Helpers ────────────────────────────────────────────
const fmtCurrency = (n) =>
    n ? new Intl.NumberFormat("vi-VN").format(n) + "₫" : "—";

const emptyLine = () => ({
    _id: Math.random(),
    productName: "",
    woodType: "",
    formType: "READY",
    length: "",
    width: "",
    height: "",
    qty: "",
    unitPrice: "",
    sku: "",
});

export default function CreateImportModal({ onClose, onSaved }) {
    // Section 1
    const [supplier, setSupplier] = useState("");
    const [importDate, setImportDate] = useState(new Date().toISOString().slice(0, 10));
    const [invoiceFile, setInvoiceFile] = useState(null);
    const [invoicePreview, setInvoicePreview] = useState(null);
    const fileRef = useRef(null);

    // Section 2
    const [lines, setLines] = useState([emptyLine()]);

    const handleFile = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        setInvoiceFile(f);
        setInvoicePreview(URL.createObjectURL(f));
    };

    const updateLine = (id, field, value) =>
        setLines((prev) => prev.map((l) => (l._id === id ? { ...l, [field]: value } : l)));

    const removeLine = (id) => setLines((prev) => prev.filter((l) => l._id !== id));

    const lineTotal = (l) =>
        l.qty && l.unitPrice ? Number(l.qty) * Number(l.unitPrice) : 0;

    const grandTotal = lines.reduce((s, l) => s + lineTotal(l), 0);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!supplier.trim()) { toast.error("Vui lòng nhập tên xưởng cung cấp"); return; }
        if (!importDate) { toast.error("Vui lòng chọn ngày nhập"); return; }
        for (const l of lines) {
            if (!l.productName.trim()) { toast.error("Vui lòng nhập tên sản phẩm"); return; }
            if (!l.qty || Number(l.qty) <= 0) { toast.error("Số lượng phải lớn hơn 0"); return; }
            if (!l.unitPrice || Number(l.unitPrice) <= 0) { toast.error("Đơn giá phải lớn hơn 0"); return; }
        }

        // Generate SKU for each line
        const linesWithSKU = lines.map((l) => ({
            ...l,
            sku: generateSKU(l.productName, l.woodType, l.formType),
        }));

        // Show generated SKUs in toast summary
        const skuList = linesWithSKU.map((l) => `• ${l.productName}: ${l.sku}`).join("\n");
        toast.success(
            `Tạo phiếu nhập thành công!\n\nMã SKU tự sinh:\n${skuList}`,
            { duration: 6000, style: { whiteSpace: "pre-line", fontSize: "13px" } }
        );

        onSaved?.({ supplier, importDate, invoiceFile, lines: linesWithSKU, grandTotal });
        onClose();
    };

    // Shared styles
    const inp = "w-full h-9 px-3 rounded-lg text-[13px] border focus:outline-none focus:ring-2 focus:ring-purple-300 transition";
    const inpS = { borderColor: "var(--grid-border)", backgroundColor: "#fff", color: "var(--text-main)" };
    const lbl = "block text-[11px] font-bold uppercase tracking-wider mb-1";
    const lblS = { color: "var(--text-placeholder)" };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            {/* Modal – 70% màn hình */}
            <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl flex flex-col"
                style={{ maxHeight: "70vh" }}>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b shrink-0"
                    style={{ borderColor: "var(--grid-border)" }}>
                    <div>
                        <h2 className="text-[16px] font-bold" style={{ color: "var(--text-main)" }}>
                            Tạo Phiếu Nhập Kho
                        </h2>
                        <p className="text-[11px] mt-0.5" style={{ color: "var(--text-placeholder)" }}>
                            Nhập từ hóa đơn giấy — SKU sẽ tự động được sinh sau khi lưu
                        </p>
                    </div>
                    <button onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition"
                        style={{ color: "var(--text-secondary)" }}>
                        <X size={18} />
                    </button>
                </div>

                {/* Scrollable body */}
                <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden flex-1">
                    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">

                        {/* ── KHU VỰC 1 ── */}
                        <div className="p-4 rounded-xl space-y-3"
                            style={{ backgroundColor: "var(--bg-main)", border: "1px solid var(--grid-border)" }}>
                            <p className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2"
                                style={{ color: "var(--brand-primary)" }}>
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-[10px] font-black"
                                    style={{ backgroundColor: "var(--brand-primary)" }}>1</span>
                                Thông tin chứng từ
                            </p>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={lbl} style={lblS}><Building2 size={11} className="inline mr-1" />Tên xưởng *</label>
                                    <input value={supplier} onChange={(e) => setSupplier(e.target.value)}
                                        placeholder="VD: Xưởng Hà Linh..." className={inp} style={inpS} />
                                </div>
                                <div>
                                    <label className={lbl} style={lblS}><Calendar size={11} className="inline mr-1" />Ngày nhập *</label>
                                    <input type="date" value={importDate} onChange={(e) => setImportDate(e.target.value)}
                                        className={inp} style={inpS} />
                                </div>
                            </div>

                            {/* Invoice upload */}
                            <div>
                                <label className={lbl} style={lblS}><FileImage size={11} className="inline mr-1" />Ảnh hóa đơn</label>
                                <div onClick={() => fileRef.current?.click()}
                                    className="cursor-pointer rounded-xl border-2 border-dashed flex items-center justify-center transition hover:border-purple-400 min-h-[80px]"
                                    style={{ borderColor: invoicePreview ? "var(--brand-primary)" : "var(--grid-border)", backgroundColor: invoicePreview ? "transparent" : "var(--bg-main)" }}>
                                    {invoicePreview
                                        ? <img src={invoicePreview} alt="HĐ" className="max-h-24 rounded-lg object-contain" />
                                        : <div className="flex flex-col items-center gap-1 py-3" style={{ color: "var(--text-placeholder)" }}>
                                            <Upload size={22} strokeWidth={1.5} />
                                            <p className="text-[12px]">Nhấp để tải ảnh hóa đơn lên</p>
                                        </div>}
                                    {invoicePreview && (
                                        <button type="button" onClick={(e) => { e.stopPropagation(); setInvoiceFile(null); setInvoicePreview(null); }}
                                            className="absolute top-2 right-2 bg-red-50 text-red-500 rounded-full p-1 hover:bg-red-100">
                                            <X size={12} />
                                        </button>
                                    )}
                                </div>
                                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                                {invoiceFile && <p className="text-[11px] mt-1 font-medium" style={{ color: "var(--brand-primary)" }}>✓ {invoiceFile.name}</p>}
                            </div>
                        </div>

                        {/* ── KHU VỰC 2 ── */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <p className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2"
                                    style={{ color: "var(--brand-primary)" }}>
                                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-[10px] font-black"
                                        style={{ backgroundColor: "var(--brand-primary)" }}>2</span>
                                    Chi tiết phôi / Sản phẩm thô
                                </p>
                                <button type="button" onClick={() => setLines((p) => [...p, emptyLine()])}
                                    className="flex items-center gap-1.5 h-7 px-3 rounded-lg text-[12px] font-bold cursor-pointer hover:opacity-80 transition"
                                    style={{ backgroundColor: "var(--brand-primary)", color: "#fff" }}>
                                    <Plus size={13} /> Thêm dòng
                                </button>
                            </div>

                            {lines.map((line, idx) => (
                                <div key={line._id} className="p-3 rounded-xl space-y-2.5"
                                    style={{ backgroundColor: "var(--bg-main)", border: "1px solid var(--grid-border)" }}>
                                    <div className="flex items-center justify-between">
                                        <p className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-1.5"
                                            style={{ color: "var(--text-secondary)" }}>
                                            <Package size={11} /> Mặt hàng #{idx + 1}
                                        </p>
                                        {lines.length > 1 && (
                                            <button type="button" onClick={() => removeLine(line._id)}
                                                className="p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-500 cursor-pointer transition">
                                                <Trash2 size={13} />
                                            </button>
                                        )}
                                    </div>

                                    {/* Row 1: Tên SP + Loại gỗ + Hình thức */}
                                    <div className="grid grid-cols-3 gap-2">
                                        <div>
                                            <label className={lbl} style={lblS}>Tên sản phẩm *</label>
                                            <input value={line.productName}
                                                onChange={(e) => updateLine(line._id, "productName", e.target.value)}
                                                placeholder="VD: Bàn thờ Kim Tiền..." className={inp} style={inpS} />
                                        </div>
                                        <div>
                                            <label className={lbl} style={lblS}>Loại gỗ</label>
                                            <div className="relative">
                                                <select value={line.woodType}
                                                    onChange={(e) => updateLine(line._id, "woodType", e.target.value)}
                                                    className={inp + " appearance-none pr-7 cursor-pointer"} style={inpS}>
                                                    <option value="">-- Chọn loại gỗ --</option>
                                                    {WOOD_TYPES.map((w) => <option key={w} value={w}>{w}</option>)}
                                                </select>
                                                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                                                    style={{ color: "var(--text-placeholder)" }} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className={lbl} style={lblS}>Hình thức</label>
                                            <div className="relative">
                                                <select value={line.formType}
                                                    onChange={(e) => updateLine(line._id, "formType", e.target.value)}
                                                    className={inp + " appearance-none pr-7 cursor-pointer"} style={inpS}>
                                                    {FORM_TYPES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                                                </select>
                                                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                                                    style={{ color: "var(--text-placeholder)" }} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Row 2: Kích thước + SL + Đơn giá */}
                                    <div className="grid grid-cols-5 gap-2">
                                        <div>
                                            <label className={lbl} style={lblS}>Dài (cm)</label>
                                            <input type="number" min="0" value={line.length}
                                                onChange={(e) => updateLine(line._id, "length", e.target.value)}
                                                placeholder="0" className={inp} style={inpS} />
                                        </div>
                                        <div>
                                            <label className={lbl} style={lblS}>Rộng (cm)</label>
                                            <input type="number" min="0" value={line.width}
                                                onChange={(e) => updateLine(line._id, "width", e.target.value)}
                                                placeholder="0" className={inp} style={inpS} />
                                        </div>
                                        <div>
                                            <label className={lbl} style={lblS}>Cao (cm)</label>
                                            <input type="number" min="0" value={line.height}
                                                onChange={(e) => updateLine(line._id, "height", e.target.value)}
                                                placeholder="0" className={inp} style={inpS} />
                                        </div>
                                        <div>
                                            <label className={lbl} style={lblS}>Số lượng *</label>
                                            <input type="number" min="1" value={line.qty}
                                                onChange={(e) => updateLine(line._id, "qty", e.target.value)}
                                                placeholder="0" className={inp} style={inpS} />
                                        </div>
                                        <div>
                                            <label className={lbl} style={lblS}>Đơn giá (₫) *</label>
                                            <input type="number" min="0" value={line.unitPrice}
                                                onChange={(e) => updateLine(line._id, "unitPrice", e.target.value)}
                                                placeholder="0" className={inp} style={inpS} />
                                        </div>
                                    </div>

                                    {/* SKU preview + Line total */}
                                    <div className="flex items-center justify-between">
                                        {line.productName ? (
                                            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-1 rounded"
                                                style={{ backgroundColor: "#EEF2FF", color: "#4F46E5" }}>
                                                <Tag size={11} />
                                                SKU dự kiến: {generateSKU(line.productName, line.woodType, line.formType)}
                                            </span>
                                        ) : <span />}
                                        {lineTotal(line) > 0 && (
                                            <span className="text-[12px] font-bold px-3 py-1 rounded-lg"
                                                style={{ backgroundColor: "#F5F3FF", color: "#7C3AED" }}>
                                                {fmtCurrency(lineTotal(line))}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Grand total */}
                            {grandTotal > 0 && (
                                <div className="flex justify-end">
                                    <div className="px-4 py-2.5 rounded-xl text-right"
                                        style={{ backgroundColor: "#F5F3FF", border: "1px solid #DDD6FE" }}>
                                        <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#7C3AED" }}>Tổng giá trị</p>
                                        <p className="text-[20px] font-black" style={{ color: "#5B21B6" }}>{fmtCurrency(grandTotal)}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-3 border-t shrink-0 flex gap-3"
                        style={{ borderColor: "var(--grid-border)", backgroundColor: "var(--bg-main)" }}>
                        <button type="button" onClick={onClose}
                            className="flex-1 h-10 rounded-xl text-[13px] font-bold border cursor-pointer hover:bg-gray-50 transition"
                            style={{ borderColor: "var(--grid-border)", color: "var(--text-secondary)" }}>
                            Hủy
                        </button>
                        <button type="submit"
                            className="flex-1 h-10 rounded-xl text-[13px] font-bold cursor-pointer hover:opacity-90 transition"
                            style={{ backgroundColor: "var(--brand-primary)", color: "#fff" }}>
                            Lưu &amp; Sinh mã SKU
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
