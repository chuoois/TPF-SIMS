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
    Building2, Calendar, Package, ChevronDown, Tag, Image, AlignLeft, BarChart2, MapPin
} from "lucide-react";
import { toast } from "react-hot-toast";

const WOOD_TYPES = [
    "Gỗ Mít", "Gỗ Hương", "Gỗ Gụ", "Gỗ Gõ Đỏ",
    "Gỗ Sồi Nga", "Gỗ Óc Chó", "Gỗ Xà Cừ", "Gỗ Dổi",
    "Gỗ Lim", "Gỗ Trắc", "Gỗ Căm Xe",
];

const CATEGORIES = [
    "Phòng Khách", "Phòng Ngủ", "Phòng Thờ", "Phòng Ăn",
    "Phòng Làm Việc", "Khác"
];

const FORM_TYPES = [
    { value: "READY", label: "Hàng sẵn có (nhập thêm)", code: "HS" },
    { value: "CUSTOM", label: "Hàng khách đặt", code: "KD" },
];

const MOCK_PRODUCTS = [
    { code: "SP-PK-001", name: "Bộ bàn ghế Nghê Bảo Đỉnh 6 món", category: "Phòng Khách", woodType: "Gỗ Hương" },
    { code: "HS-PK-001", name: "Sofa nguyên khối chữ L", category: "Phòng Khách", woodType: "Gỗ Gõ Đỏ" },
    { code: "SP-PT-001", name: "Sập thờ Mai Điểu chân 20", category: "Phòng Thờ", woodType: "Gỗ Gụ" },
    { code: "HS-PA-001", name: "Bộ bàn ăn 8 ghế nguyên khối", category: "Phòng Ăn", woodType: "Gỗ Hương" },
    { code: "HS-PN-001", name: "Giường ngủ hoa hồng Tân cổ điển", category: "Phòng Ngủ", woodType: "Gỗ Sồi Nga" },
];

// ── Helpers ────────────────────────────────────────────
const fmtCurrency = (n) =>
    n ? new Intl.NumberFormat("vi-VN").format(n) + "₫" : "—";

const emptyLine = () => ({
    _id: Math.random(),
    productCode: "",
    productName: "",
    imageFile: null,
    imagePreview: null,
    category: "",
    woodType: "",
    formType: "READY",
    length: "",
    width: "",
    height: "",
    qty: "",
    importPrice: "",
    sellingPrice: "",
    minStock: "",
    maxStock: "",
    location: "",
    details: "",
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
    const [activeDropdownId, setActiveDropdownId] = useState(null);

    const handleFile = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        setInvoiceFile(f);
        setInvoicePreview(URL.createObjectURL(f));
    };

    const handleLineFile = (lineId, e) => {
        const f = e.target.files[0];
        if (!f) return;
        setLines(prev => prev.map(l => {
            if (l._id !== lineId) return l;
            // Xóa URL cũ nếu có
            if (l.imagePreview) URL.revokeObjectURL(l.imagePreview);
            return { ...l, imageFile: f, imagePreview: URL.createObjectURL(f) };
        }));
    };

    const removeLineFile = (lineId) => {
        setLines(prev => prev.map(l => {
            if (l._id !== lineId) return l;
            if (l.imagePreview) URL.revokeObjectURL(l.imagePreview);
            return { ...l, imageFile: null, imagePreview: null };
        }));
    };

    const updateLine = (id, field, value) =>
        setLines((prev) => prev.map((l) => (l._id === id ? { ...l, [field]: value } : l)));

    const removeLine = (id) => {
        setLines((prev) => {
            const line = prev.find(l => l._id === id);
            if (line && line.imagePreview) URL.revokeObjectURL(line.imagePreview);
            return prev.filter(l => l._id !== id);
        });
    };

    const lineTotal = (l) =>
        l.qty && l.importPrice ? Number(l.qty) * Number(l.importPrice) : 0;

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

        toast.success(
            `Tạo phiếu nhập thành công!`,
            { duration: 4000, style: { fontSize: "13px" } }
        );

        onSaved?.({ supplier, importDate, invoiceFile, lines, grandTotal });
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
                            Nhập từ hóa đơn giấy
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
                                    Chi tiết sản phẩm nhập
                                </p>
                                <button type="button" onClick={() => setLines((p) => [...p, emptyLine()])}
                                    className="flex items-center gap-1.5 h-7 px-3 rounded-lg text-[12px] font-bold cursor-pointer hover:opacity-80 transition"
                                    style={{ backgroundColor: "var(--brand-primary)", color: "#fff" }}>
                                    <Plus size={13} /> Thêm dòng
                                </button>
                            </div>

                            {lines.map((line, idx) => (
                                <div key={line._id} className="p-5 rounded-2xl space-y-4 shadow-sm"
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

                                    {/* Row 1: Tên SP + Mã SP */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="col-span-1">
                                            <label className={lbl} style={lblS}>Mã sản phẩm</label>
                                            <input value={line.productCode}
                                                onChange={(e) => updateLine(line._id, "productCode", e.target.value)}
                                                placeholder="Tự sinh/Nhập tay" className={inp} style={inpS} />
                                        </div>
                                        <div className="relative col-span-2">
                                            <label className={lbl} style={lblS}>Tên sản phẩm *</label>
                                            <input value={line.productName}
                                                onChange={(e) => {
                                                    updateLine(line._id, "productName", e.target.value);
                                                    if (line.formType === "READY") setActiveDropdownId(line._id);
                                                }}
                                                onFocus={() => {
                                                    if (line.formType === "READY" && line.productName.trim()) setActiveDropdownId(line._id);
                                                }}
                                                onBlur={() => setTimeout(() => setActiveDropdownId(null), 200)}
                                                placeholder="VD: Bàn thờ Kim Tiền..." className={inp} style={inpS} />
                                            
                                            {/* Thả xuống tìm kiếm SP */}
                                            {activeDropdownId === line._id && line.formType === "READY" && line.productName.trim() && (
                                                <div className="absolute z-50 left-0 right-0 top-[100%] mt-1 max-h-56 overflow-y-auto bg-white rounded-xl shadow-lg border" style={{ borderColor: 'var(--grid-border)' }}>
                                                    {(() => {
                                                        const q = line.productName.toLowerCase();
                                                        const results = MOCK_PRODUCTS.filter(p => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q));
                                                        if (results.length === 0) return <div className="p-3 text-[12px] text-gray-500 text-center">Không tìm thấy sản phẩm</div>;
                                                        return results.map(p => (
                                                            <div key={p.code} className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b last:border-0 transition-colors"
                                                                style={{ borderColor: 'var(--grid-border)' }}
                                                                onMouseDown={(e) => {
                                                                    e.preventDefault();
                                                                    updateLine(line._id, "productName", p.name);
                                                                    updateLine(line._id, "productCode", p.code);
                                                                    updateLine(line._id, "category", p.category);
                                                                    updateLine(line._id, "woodType", p.woodType);
                                                                    setActiveDropdownId(null);
                                                                }}>
                                                                <p className="text-[13px] font-semibold text-gray-800 truncate">{p.name}</p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className="text-[10px] text-gray-500 font-medium">{p.code}</span>
                                                                    <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium" style={{ backgroundColor: '#F3E8FF', color: '#7C3AED' }}>{p.category}</span>
                                                                    <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium" style={{ backgroundColor: '#F0FDF4', color: '#15803D' }}>{p.woodType}</span>
                                                                </div>
                                                            </div>
                                                        ))
                                                    })()}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Row 2: Danh mục + Loại gỗ + Hình thức */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className={lbl} style={lblS}>Danh mục</label>
                                            <div className="relative">
                                                <select value={line.category}
                                                    onChange={(e) => updateLine(line._id, "category", e.target.value)}
                                                    className={inp + " appearance-none pr-7 cursor-pointer"} style={inpS}>
                                                    <option value="">-- Chọn danh mục --</option>
                                                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                                                    style={{ color: "var(--text-placeholder)" }} />
                                            </div>
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

                                    {/* Row 3: Kích thước */}
                                    <div className="grid grid-cols-3 gap-4">
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
                                    </div>
                                    {/* Row 4: Số lượng, Giá, Tồn */}
                                    <div className="grid grid-cols-5 gap-4">
                                        <div>
                                            <label className={lbl} style={lblS}>Số lượng *</label>
                                            <input type="number" min="1" value={line.qty}
                                                onChange={(e) => updateLine(line._id, "qty", e.target.value)}
                                                placeholder="0" className={inp} style={inpS} />
                                        </div>
                                        <div>
                                            <label className={lbl} style={lblS}>Giá gốc (₫) *</label>
                                            <input type="number" min="0" value={line.importPrice}
                                                onChange={(e) => updateLine(line._id, "importPrice", e.target.value)}
                                                placeholder="0" className={inp} style={inpS} />
                                        </div>
                                        <div>
                                            <label className={lbl} style={lblS}>Giá bán (₫) *</label>
                                            <input type="number" min="0" value={line.sellingPrice}
                                                onChange={(e) => updateLine(line._id, "sellingPrice", e.target.value)}
                                                placeholder="0" className={inp} style={inpS} />
                                        </div>
                                        <div>
                                            <label className={lbl} style={lblS}><div className="flex items-center gap-1"><BarChart2 size={11} />Tồn thấp nhất</div></label>
                                            <input type="number" min="0" value={line.minStock}
                                                onChange={(e) => updateLine(line._id, "minStock", e.target.value)}
                                                placeholder="0" className={inp} style={inpS} />
                                        </div>
                                        <div>
                                            <label className={lbl} style={lblS}><div className="flex items-center gap-1"><BarChart2 size={11} />Tồn cao nhất</div></label>
                                            <input type="number" min="0" value={line.maxStock}
                                                onChange={(e) => updateLine(line._id, "maxStock", e.target.value)}
                                                placeholder="0" className={inp} style={inpS} />
                                        </div>
                                    </div>

                                    {/* Row 5: Ảnh + Vị trí + Chi tiết */}
                                    <div className="grid grid-cols-12 gap-4">
                                        {/* Ảnh */}
                                        <div className="col-span-3">
                                            <label className={lbl} style={lblS}><div className="flex items-center gap-1"><Image size={11} />Hình ảnh</div></label>
                                            <div className="relative h-24">
                                                {line.imagePreview ? (
                                                    <div className="relative w-full h-full rounded-lg border overflow-hidden group" style={{ borderColor: 'var(--grid-border)' }}>
                                                        <img src={line.imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center backdrop-blur-[2px]">
                                                            <button type="button" onClick={() => removeLineFile(line._id)}
                                                                className="bg-white text-red-500 rounded-full p-1.5 shadow-sm hover:scale-110 transition-transform">
                                                                <Trash2 size={13} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <label className="flex flex-col items-center justify-center w-full h-full rounded-lg border border-dashed cursor-pointer group transition-all"
                                                        style={{ borderColor: "var(--brand-primary)", backgroundColor: "rgba(79, 70, 229, 0.03)" }}>
                                                        <div className="bg-white p-2 rounded-full shadow-sm mt-2 mb-2 group-hover:scale-110 transition-transform">
                                                            <FileImage size={16} style={{ color: "var(--brand-primary)" }} />
                                                        </div>
                                                        <span className="text-[11px] font-medium px-1" style={{ color: "var(--brand-primary)" }}>Thêm ảnh</span>
                                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleLineFile(line._id, e)} />
                                                    </label>
                                                )}
                                            </div>
                                        </div>

                                        {/* Vị trí cất và Chi tiết */}
                                        <div className="col-span-9 flex flex-col gap-4">
                                            <div>
                                                <label className={lbl} style={lblS}><div className="flex items-center gap-1"><MapPin size={11} />Vị trí cất hàng</div></label>
                                                <input type="text" value={line.location}
                                                    onChange={(e) => updateLine(line._id, "location", e.target.value)}
                                                    placeholder="VD: Kho A, Tầng 2, Dãy C..."
                                                    className={inp}
                                                    style={inpS} />
                                            </div>
                                            <div className="flex-1 flex flex-col">
                                                <label className={lbl} style={lblS}><div className="flex items-center gap-1"><AlignLeft size={11} />Chi tiết sản phẩm</div></label>
                                                <textarea value={line.details}
                                                    onChange={(e) => updateLine(line._id, "details", e.target.value)}
                                                    placeholder="Ghi chú thêm thông tin chi tiết..."
                                                    className={`w-full p-2.5 rounded-lg text-[13px] border focus:outline-none focus:ring-2 focus:ring-purple-300 transition resize-none flex-1`}
                                                    style={{ ...inpS, lineHeight: 1.4, minHeight: '3.5rem' }} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Line total */}
                                    <div className="flex items-center justify-end">
                                        {lineTotal(line) > 0 && (
                                            <span className="text-[12px] font-bold px-3 py-1.5 rounded-lg shadow-sm"
                                                style={{ backgroundColor: "#F5F3FF", color: "#7C3AED", border: "1px solid #EDE9FE" }}>
                                                Thành tiền: {fmtCurrency(lineTotal(line))}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Grand total */}
                        {grandTotal > 0 && (
                            <div className="flex justify-end p-6 border-t" style={{ borderColor: "var(--grid-border)" }}>
                                <div className="px-5 py-3 rounded-xl text-right"
                                    style={{ backgroundColor: "#F5F3FF", border: "1px solid #DDD6FE" }}>
                                    <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "#7C3AED" }}>Tổng giá trị</p>
                                    <p className="text-[22px] font-black" style={{ color: "#5B21B6" }}>{fmtCurrency(grandTotal)}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t shrink-0 flex items-center justify-end gap-3"
                        style={{ borderColor: "var(--grid-border)", backgroundColor: "var(--bg-main)" }}>
                        <button type="button" onClick={onClose}
                            className="flex-1 h-10 rounded-xl text-[13px] font-bold border cursor-pointer hover:bg-gray-50 transition"
                            style={{ borderColor: "var(--grid-border)", color: "var(--text-secondary)" }}>
                            Hủy
                        </button>
                        <button type="submit"
                            className="flex-1 h-10 rounded-xl text-[13px] font-bold cursor-pointer hover:opacity-90 transition"
                            style={{ backgroundColor: "var(--brand-primary)", color: "#fff" }}>
                            Lưu Phiếu Nhập
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
