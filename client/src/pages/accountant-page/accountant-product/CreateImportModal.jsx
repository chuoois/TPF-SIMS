/**
 * CreateImportModal – Tạo Phiếu Nhập Kho
 * Hỗ trợ 2 loại dòng:
 *   1. Dòng đơn lẻ (line) – sản phẩm bình thường
 *   2. Dòng bộ (bundle) – nhập cả bộ theo HĐ, ước tính giá từng món lẻ
 */

import { useState, useRef } from "react";
import {
    X, Plus, Trash2, Upload, FileImage, Search,
    Building2, Calendar, Package, ChevronDown, AlignLeft,
    BarChart2, Image, Layers, CheckCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";

import { 
    MATERIAL_TYPES, 
    IMPORT_CATEGORIES as CATEGORIES, 
    COLORS, 
    SUPPLIERS, 
    FORM_TYPES, 
    PRODUCT_TYPES, 
    MOCK_PRODUCTS, 
    MOCK_BUNDLES,
    ALL_PRODUCTS
} from "../mockData";

// ── Helpers ────────────────────────────────────────────
const fmtCurrency = (n) =>
    n ? new Intl.NumberFormat("vi-VN").format(n) + "₫" : "—";

const formatNumber = (numStr) => {
    if (!numStr) return "";
    const num = String(numStr).replace(/\D/g, "");
    if (!num) return "";
    return new Intl.NumberFormat("vi-VN").format(num);
};

const parseNumber = (str) => {
    if (!str) return "";
    return str.toString().replace(/\D/g, "");
};

const removeVietnameseTones = (str) => {
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    return str;
};

const toColorAbbreviation = (color) => {
    if (!color) return "";
    if (color.toLowerCase() === "raw") return "raw";
    let str = removeVietnameseTones(color);
    return str.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase()).join("");
};

const generateProductCode = (line) => {
    let prefix = "SP";
    if (line.productName) {
        const words = removeVietnameseTones(line.productName).trim().split(/\s+/);
        prefix = words.slice(0, 3).map(w => w.charAt(0).toUpperCase()).join("");
    }
    const typeCode = PRODUCT_TYPES.find(t => t.value === line.productType)?.code || "XX";
    const dim = `${line.length || "0"}x${line.width || "0"}x${line.height || "0"}`;
    let colorCode = "raw";
    if (line.color && line.color.trim() !== "") {
        colorCode = toColorAbbreviation(line.color);
    }
    return `${prefix}-${typeCode}-${dim}-${colorCode}`;
};

const generateBundleCode = (bundle) => {
    let prefix = "BO";
    if (bundle.bundleName) {
        const words = removeVietnameseTones(bundle.bundleName).trim().split(/\s+/);
        prefix = words.slice(0, 3).map(w => w.charAt(0).toUpperCase()).join("");
    }
    const typeCode = PRODUCT_TYPES.find(t => t.value === bundle.productType)?.code || "XX";
    let colorCode = "raw";
    if (bundle.color && bundle.color.trim() !== "") {
        colorCode = toColorAbbreviation(bundle.color);
    }
    return `${prefix}-${typeCode}-${colorCode}`;
};

// Hàm tự sinh mã định danh (Unit ID)
const generateUnitIds = (line, count) => {
    const sku = line.productCode || generateProductCode(line);
    const timestamp = new Date().getTime().toString().slice(-4);
    return Array.from({ length: count }, (_, i) => `${sku}-U${timestamp}${String(i + 1).padStart(2, '0')}`);
};

const generateBundleUnitIds = (bundle, count) => {
    const sku = bundle.bundleCode || generateBundleCode(bundle);
    const timestamp = new Date().getTime().toString().slice(-4);
    return Array.from({ length: count }, (_, i) => `${sku}-U${timestamp}${String(i + 1).padStart(2, '0')}`);
};

// ── Dòng đơn lẻ ────────────────────────────────────────
const emptyLine = () => ({
    _id: Math.random(),
    isBundle: false,
    productCode: "",
    productName: "",
    imageFiles: [],
    imagePreviews: [],
    category: "",
    materialType: "",
    color: "",
    formType: "NEW",
    productType: "RAW",
    length: "",
    width: "",
    height: "",
    qty: "",
    importPrice: "",
    minStock: "",
    details: "",
    unitIds: [], // Danh sách mã định danh riêng
    showUnitIds: false,
});

// ── Dòng bộ sản phẩm ───────────────────────────────────
const emptyBundleItem = () => ({
    _id: Math.random(),
    name: "",
    qty: 1,
    productNote: "",
});

const emptyBundle = () => ({
    _id: Math.random(),
    isBundle: true,
    bundleCode: "",    // Mã bộ sản phẩm
    bundleName: "",
    bundleQty: 1,
    bundlePrice: "",   // Giá cả bộ theo HĐ thực
    category: "",
    materialType: "",
    color: "",
    formType: "NEW",
    productType: "FINISHED",
    imageFiles: [],
    imagePreviews: [],
    details: "",
    items: [emptyBundleItem()],
    unitIds: [], // Mã định danh cho từng bộ
    showUnitIds: false,
});

// ── Component chính ────────────────────────────────────
export default function CreateImportModal({ onClose, onSaved }) {
    // Section 1
    const [supplier, setSupplier] = useState("");
    const [importDate, setImportDate] = useState(new Date().toISOString().slice(0, 10));
    const [note, setNote] = useState("");
    const [invoiceFile, setInvoiceFile] = useState(null);
    const [invoicePreview, setInvoicePreview] = useState(null);
    const fileRef = useRef(null);

    // Section 2 – lines (có thể là đơn lẻ hoặc bundle)
    const [lines, setLines] = useState([emptyLine()]);
    const [activeDropdown, setActiveDropdown] = useState({ id: null, field: null });

    // ── File handlers ──────────────────────────────────
    const handleFile = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        setInvoiceFile(f);
        setInvoicePreview(URL.createObjectURL(f));
    };

    const handleLineFile = (lineId, e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        
        setLines(prev => prev.map(l => {
            if (l._id !== lineId) return l;
            const newPreviews = files.map(f => URL.createObjectURL(f));
            return { 
                ...l, 
                imageFiles: [...l.imageFiles, ...files], 
                imagePreviews: [...l.imagePreviews, ...newPreviews] 
            };
        }));
    };

    const removeLineImage = (lineId, idx) => {
        setLines(prev => prev.map(l => {
            if (l._id !== lineId) return l;
            const newFiles = [...l.imageFiles];
            const newPreviews = [...l.imagePreviews];
            
            if (newPreviews[idx]) URL.revokeObjectURL(newPreviews[idx]);
            
            newFiles.splice(idx, 1);
            newPreviews.splice(idx, 1);
            
            return { ...l, imageFiles: newFiles, imagePreviews: newPreviews };
        }));
    };

    // ── Line update helpers ────────────────────────────
    const updateLine = (id, field, value) =>
        setLines(prev => prev.map(l => l._id === id ? { ...l, [field]: value } : l));

    const removeLine = (id) => {
        setLines(prev => {
            const line = prev.find(l => l._id === id);
            if (line?.imagePreviews) {
                line.imagePreviews.forEach(p => URL.revokeObjectURL(p));
            }
            return prev.filter(l => l._id !== id);
        });
    };

    // ── Bundle item helpers ────────────────────────────
    const addBundleItem = (bundleId) => {
        setLines(prev => prev.map(l =>
            l._id === bundleId ? { ...l, items: [...l.items, emptyBundleItem()] } : l
        ));
    };

    const removeBundleItem = (bundleId, itemId) => {
        setLines(prev => prev.map(l =>
            l._id === bundleId ? { ...l, items: l.items.filter(it => it._id !== itemId) } : l
        ));
    };

    const updateBundleItem = (bundleId, itemId, field, value) => {
        setLines(prev => prev.map(l =>
            l._id === bundleId
                ? { ...l, items: l.items.map(it => it._id === itemId ? { ...it, [field]: value } : it) }
                : l
        ));
    };

    // ── Tính tổng ──────────────────────────────────────
    const lineTotal = (l) => {
        if (l.isBundle) {
            return l.bundleQty && l.bundlePrice ? Number(l.bundleQty) * Number(l.bundlePrice) : 0;
        }
        return l.qty && l.importPrice ? Number(l.qty) * Number(l.importPrice) : 0;
    };

    // bundleItemsTotal removed — pricing is per-bundle only (no per-item price estimation)

    const grandTotal = lines.reduce((s, l) => s + lineTotal(l), 0);

    // ── Pull from Custom Order ─────────────────────────
    const applyCustomProduct = (p) => {
        const qtyToImport = p.stockBreakdown?.processing || 1;
        if (p.isBundle) {
            const newBundle = emptyBundle();
            newBundle._id = Math.random();
            newBundle.bundleCode = p.sku || p.id;
            newBundle.bundleName = p.name;
            newBundle.category = p.category || "";
            newBundle.materialType = p.materialType || "";
            newBundle.color = p.color || "";
            newBundle.productType = p.type || "CUSTOM";
            newBundle.bundleQty = qtyToImport;
            newBundle.bundlePrice = p.importPrice || "";
            newBundle.items = (p.items || []).map(it => ({ ...it, _id: Math.random(), productNote: "" }));
            if (qtyToImport > 0 && newBundle.bundleCode) {
                 newBundle.unitIds = generateBundleUnitIds({ ...newBundle, bundleCode: newBundle.bundleCode }, qtyToImport);
            }
            // Remove initial empty line if untouched
            setLines(prev => {
                if (prev.length === 1 && !prev[0].isBundle && !prev[0].productCode && !prev[0].productName) return [newBundle];
                return [...prev, newBundle];
            });
        } else {
            const newLine = emptyLine();
            newLine._id = Math.random();
            newLine.productCode = p.sku || p.id;
            newLine.productName = p.name;
            newLine.category = p.category || "";
            newLine.materialType = p.materialType || "";
            newLine.color = p.color || "";
            newLine.productType = p.type || "CUSTOM";
            newLine.qty = qtyToImport;
            newLine.importPrice = p.importPrice || "";
            if (qtyToImport > 0 && newLine.productCode) {
                 newLine.unitIds = generateUnitIds(newLine, qtyToImport);
            }
            setLines(prev => {
                if (prev.length === 1 && !prev[0].isBundle && !prev[0].productCode && !prev[0].productName) return [newLine];
                return [...prev, newLine];
            });
        }
        toast.success(`Đã kéo thành công: ${p.name}`, { style: { fontSize: "13px" } });
    };

    // ── Submit ─────────────────────────────────────────
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!supplier.trim()) { toast.error("Vui lòng nhập tên xưởng cung cấp"); return; }
        if (!SUPPLIERS.includes(supplier.trim())) { toast.error("Xưởng cung cấp không hợp lệ"); return; }
        if (!importDate) { toast.error("Vui lòng chọn ngày nhập"); return; }

        for (const l of lines) {
            if (l.isBundle) {
                if (!l.bundleName.trim()) { toast.error("Vui lòng nhập tên bộ sản phẩm"); return; }
                if (!l.bundlePrice || Number(l.bundlePrice) <= 0) { toast.error("Giá cả bộ phải lớn hơn 0"); return; }
                if (!l.bundleQty || Number(l.bundleQty) <= 0) { toast.error("Số bộ phải lớn hơn 0"); return; }
                if (l.items.length === 0) { toast.error("Bộ sản phẩm cần có ít nhất 1 món lẻ"); return; }
                const hasEmptyItem = l.items.some(it => !it.name.trim());
                if (hasEmptyItem) { toast.error("Vui lòng nhập tên cho tất cả các món lẻ trong bộ"); return; }
            } else {
                if (!l.productName.trim()) { toast.error("Vui lòng nhập tên sản phẩm"); return; }
                if (!l.qty || Number(l.qty) <= 0) { toast.error("Số lượng phải lớn hơn 0"); return; }
                if (l.formType !== "READY") {
                    if (!l.importPrice || Number(l.importPrice) <= 0) { toast.error("Giá gốc phải lớn hơn 0"); return; }
                }
            }
        }

        toast.success("Tạo phiếu nhập thành công!", { duration: 4000, style: { fontSize: "13px" } });
        onSaved?.({ supplier, importDate, invoiceFile, note, lines, grandTotal });
        onClose();
    };

    // Shared styles
    const inp = "w-full h-9 px-3 rounded-lg text-[13px] border focus:outline-none focus:ring-2 focus:ring-purple-300 transition";
    const inpS = { borderColor: "var(--grid-border)", backgroundColor: "#fff", color: "var(--text-main)" };
    const lbl = "block text-[11px] font-bold uppercase tracking-wider mb-1";
    const lblS = { color: "var(--text-placeholder)" };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl flex flex-col" style={{ maxHeight: "80vh" }}>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b shrink-0" style={{ borderColor: "var(--grid-border)" }}>
                    <div>
                        <h2 className="text-[16px] font-bold" style={{ color: "var(--text-main)" }}>Tạo Phiếu Nhập Kho</h2>
                        <p className="text-[11px] mt-0.5" style={{ color: "var(--text-placeholder)" }}>Nhập từ hóa đơn giấy</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition" style={{ color: "var(--text-secondary)" }}>
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden flex-1">
                    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">

                        {/* ── KHU VỰC 1 ── */}
                        <div className="p-4 rounded-xl space-y-3" style={{ backgroundColor: "var(--bg-main)", border: "1px solid var(--grid-border)" }}>
                            <p className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: "var(--brand-primary)" }}>
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-[10px] font-black" style={{ backgroundColor: "var(--brand-primary)" }}>1</span>
                                Thông tin chứng từ
                            </p>

                            <div className="grid grid-cols-2 gap-3">
                                {/* Supplier dropdown */}
                                <div className="relative">
                                    <label className={lbl} style={lblS}><Building2 size={11} className="inline mr-1" />Tên xưởng *</label>
                                    <input value={supplier}
                                        onChange={(e) => { setSupplier(e.target.value); setActiveDropdown({ id: "supplier", field: "supplier" }); }}
                                        onFocus={() => setActiveDropdown({ id: "supplier", field: "supplier" })}
                                        onBlur={() => setTimeout(() => setActiveDropdown({ id: null, field: null }), 200)}
                                        placeholder="VD: Xưởng Hà Linh..." className={inp} style={inpS} />
                                    {activeDropdown.id === "supplier" && activeDropdown.field === "supplier" && (
                                        <div className="absolute z-50 left-0 right-0 top-[100%] mt-1 max-h-40 overflow-y-auto bg-white rounded-xl shadow-lg border" style={{ borderColor: "var(--grid-border)" }}>
                                            {SUPPLIERS.filter(s => s.toLowerCase().includes(supplier.toLowerCase())).length > 0
                                                ? SUPPLIERS.filter(s => s.toLowerCase().includes(supplier.toLowerCase())).map(s => (
                                                    <div key={s} className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b last:border-0 text-[13px]"
                                                        onMouseDown={(e) => { e.preventDefault(); setSupplier(s); setActiveDropdown({ id: null, field: null }); }}>
                                                        {s}
                                                    </div>
                                                ))
                                                : <div className="p-3 text-[12px] text-gray-500 text-center">Không tìm thấy xưởng</div>}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className={lbl} style={lblS}><Calendar size={11} className="inline mr-1" />Ngày nhập *</label>
                                    <input type="date" value={importDate} onChange={(e) => setImportDate(e.target.value)} className={inp} style={inpS} />
                                </div>
                            </div>

                            <div>
                                <label className={lbl} style={lblS}><AlignLeft size={11} className="inline mr-1" />Ghi chú về đơn</label>
                                <textarea value={note} onChange={(e) => setNote(e.target.value)}
                                    placeholder="Ghi chú thêm thông tin về đơn nhập (tùy chọn)..."
                                    className="w-full p-2.5 rounded-lg text-[13px] border focus:outline-none focus:ring-2 focus:ring-purple-300 transition resize-none"
                                    style={{ ...inpS, minHeight: "60px" }} />
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
                                <p className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: "var(--brand-primary)" }}>
                                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-[10px] font-black" style={{ backgroundColor: "var(--brand-primary)" }}>2</span>
                                    Chi tiết nhập
                                </p>
                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <button type="button" onClick={() => setActiveDropdown(activeDropdown?.id === "pullOrder" ? {id: null, field: null} : {id: "pullOrder", field: "pullOrder"})}
                                            className="flex items-center gap-1.5 h-7 px-3 rounded-lg text-[12px] font-bold cursor-pointer hover:opacity-80 transition"
                                            style={{ backgroundColor: "#10B981", color: "#fff" }}>
                                            <Search size={13} /> Kéo từ Khách đặt
                                        </button>
                                        {activeDropdown.id === "pullOrder" && (
                                            <div className="absolute right-0 top-[100%] mt-2 w-[400px] bg-white rounded-xl shadow-2xl border flex flex-col z-[100] overflow-hidden" style={{ borderColor: "var(--grid-border)" }}>
                                                <div className="p-3 border-b" style={{ borderColor: "var(--grid-border)", backgroundColor: "#FAFAFA" }}>
                                                    <p className="text-[12px] font-bold mb-2">Sản phẩm Hàng Đặt (CUSTOM) chờ nhập kho:</p>
                                                    <input type="text" autoFocus 
                                                        onChange={(e) => setActiveDropdown({...activeDropdown, search: e.target.value})}
                                                        placeholder="Tìm Tên khách, Mã, HĐ..."
                                                        className="w-full h-8 px-3 rounded-md text-[13px] border focus:outline-none focus:ring-1 focus:ring-emerald-400 cursor-text"
                                                        style={{ borderColor: "var(--grid-border)", color: "var(--text-main)" }} />
                                                </div>
                                                <div className="max-h-60 overflow-y-auto w-full flex flex-col">
                                                    {(() => {
                                                        const q = (activeDropdown.search || "").toLowerCase();
                                                        let results = ALL_PRODUCTS.filter(p => p.type === "CUSTOM" && (p.stockBreakdown?.processing > 0));
                                                        if (q) {
                                                            results = results.filter(p => p.name.toLowerCase().includes(q) || (p.details || "").toLowerCase().includes(q) || (p.sku || "").toLowerCase().includes(q));
                                                        }
                                                        if (results.length === 0) return <div className="p-4 text-center text-[12px] text-gray-500">Chưa có sản phẩm Khách Đặt nào chờ nhập.</div>;
                                                        return results.map(p => (
                                                            <div key={p.id} className="p-3 border-b border-gray-100 last:border-0 hover:bg-emerald-50 cursor-pointer transition flex flex-col gap-1"
                                                            onClick={() => { applyCustomProduct(p); setActiveDropdown({id: null, field: null}); }}>
                                                                <p className="text-[13px] font-bold text-gray-800">{p.name}</p>
                                                                <div className="flex gap-2 items-center">
                                                                    <span className="text-[10px] font-mono px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">{p.sku}</span>
                                                                    <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 font-bold rounded flex items-center gap-1">Cần nhập: {p.stockBreakdown?.processing}</span>
                                                                </div>
                                                                {p.details && <p className="text-[11px] text-gray-500 italic mt-0.5 line-clamp-1 truncate">{p.details}</p>}
                                                            </div>
                                                        ))
                                                    })()}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <button type="button" onClick={() => setLines(p => [...p, emptyLine()])}
                                        className="flex items-center gap-1.5 h-7 px-3 rounded-lg text-[12px] font-bold cursor-pointer hover:opacity-80 transition"
                                        style={{ backgroundColor: "var(--brand-primary)", color: "#fff" }}>
                                        <Plus size={13} /> Thêm lẻ
                                    </button>
                                    <button type="button" onClick={() => setLines(p => [...p, emptyBundle()])}
                                        className="flex items-center gap-1.5 h-7 px-3 rounded-lg text-[12px] font-bold cursor-pointer hover:opacity-80 transition"
                                        style={{ backgroundColor: "#7C3AED", color: "#fff" }}>
                                        <Layers size={13} /> Thêm bộ
                                    </button>
                                </div>
                            </div>

                            {lines.map((line, idx) =>
                                line.isBundle
                                    ? <BundleRow key={line._id} bundle={line} idx={idx}
                                        onUpdate={(f, v) => updateLine(line._id, f, v)}
                                        onRemove={() => removeLine(line._id)}
                                        onAddItem={() => addBundleItem(line._id)}
                                        onRemoveItem={(iid) => removeBundleItem(line._id, iid)}
                                        onUpdateItem={(iid, f, v) => updateBundleItem(line._id, iid, f, v)}
                                        onFileChange={(e) => handleLineFile(line._id, e)}
                                        onRemoveImage={(idx) => removeLineImage(line._id, idx)}
                                        canRemove={lines.length > 1}
                                        lineTotal={lineTotal(line)}
                                        activeDropdown={activeDropdown}
                                        setActiveDropdown={setActiveDropdown}
                                        inp={inp} inpS={inpS} lbl={lbl} lblS={lblS}
                                        fmtCurrency={fmtCurrency} formatNumber={formatNumber} parseNumber={parseNumber}
                                    />
                                    : <SingleRow key={line._id} line={line} idx={idx}
                                        onUpdate={(f, v) => updateLine(line._id, f, v)}
                                        onRemove={() => removeLine(line._id)}
                                        onFileChange={(e) => handleLineFile(line._id, e)}
                                        onRemoveImage={(idx) => removeLineImage(line._id, idx)}
                                        canRemove={lines.length > 1}
                                        lineTotal={lineTotal(line)}
                                        activeDropdown={activeDropdown}
                                        setActiveDropdown={setActiveDropdown}
                                        inp={inp} inpS={inpS} lbl={lbl} lblS={lblS}
                                        fmtCurrency={fmtCurrency} formatNumber={formatNumber} parseNumber={parseNumber}
                                    />
                            )}
                        </div>

                        {/* Grand total */}
                        {grandTotal > 0 && (
                            <div className="flex justify-end p-6 border-t" style={{ borderColor: "var(--grid-border)" }}>
                                <div className="px-5 py-3 rounded-xl text-right" style={{ backgroundColor: "#F5F3FF", border: "1px solid #DDD6FE" }}>
                                    <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "#7C3AED" }}>Tổng giá trị phiếu nhập</p>
                                    <p className="text-[22px] font-black" style={{ color: "#5B21B6" }}>{fmtCurrency(grandTotal)}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t shrink-0 flex items-center justify-end gap-3" style={{ borderColor: "var(--grid-border)", backgroundColor: "var(--bg-main)" }}>
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

// ══════════════════════════════════════════════════════════
// SINGLE ROW – Dòng sản phẩm đơn lẻ
// ══════════════════════════════════════════════════════════
function SingleRow({ line, idx, onUpdate, onRemove, onFileChange, onRemoveImage, canRemove, lineTotal,
    activeDropdown, setActiveDropdown, inp, inpS, lbl, lblS, fmtCurrency, formatNumber, parseNumber }) {
    return (
        <div className="p-5 rounded-2xl space-y-4 shadow-sm" style={{ backgroundColor: "var(--bg-main)", border: "1px solid var(--grid-border)" }}>
            <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}>
                    <Package size={11} /> Sản phẩm lẻ {idx + 1}
                </p>
                {canRemove && (
                    <button type="button" onClick={onRemove} className="p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-500 cursor-pointer transition">
                        <Trash2 size={13} />
                    </button>
                )}
            </div>

            {line.formType === "READY" ? (
                <>
                    <div className="grid grid-cols-4 gap-4 mb-4">
                        <div className="col-span-1">
                            <label className={lbl} style={lblS}>Hình thức</label>
                            <div className="relative">
                                <select value={line.formType} onChange={(e) => onUpdate("formType", e.target.value)}
                                    className={inp + " appearance-none pr-7 cursor-pointer"} style={inpS}>
                                    {FORM_TYPES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                                </select>
                                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-placeholder)" }} />
                            </div>
                        </div>
                        <div className="relative col-span-3">
                            <label className={lbl} style={lblS}>Tìm kiếm sản phẩm *</label>
                            <input value={line.productName}
                                onChange={(e) => { onUpdate("productName", e.target.value); setActiveDropdown({ id: line._id, field: "productName" }); }}
                                onFocus={() => { if (line.productName.trim()) setActiveDropdown({ id: line._id, field: "productName" }); }}
                                onBlur={() => setTimeout(() => setActiveDropdown({ id: null, field: null }), 200)}
                                placeholder="Nhập tên hoặc mã sản phẩm..." className={inp} style={inpS} />
                            {activeDropdown.id === line._id && activeDropdown.field === "productName" && line.productName.trim() && (
                                <div className="absolute z-50 left-0 right-0 top-[100%] mt-1 max-h-56 overflow-y-auto bg-white rounded-xl shadow-lg border" style={{ borderColor: "var(--grid-border)" }}>
                                    {(() => {
                                        const q = line.productName.toLowerCase();
                                        const results = MOCK_PRODUCTS.filter(p => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q));
                                        if (results.length === 0) return <div className="p-3 text-[12px] text-gray-500 text-center">Không tìm thấy sản phẩm</div>;
                                        return results.map(p => (
                                            <div key={p.code} className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b last:border-0"
                                                style={{ borderColor: "var(--grid-border)" }}
                                                onMouseDown={(e) => {
                                                    e.preventDefault();
                                                    onUpdate("productName", p.name); onUpdate("productCode", p.code);
                                                    onUpdate("category", p.category); onUpdate("materialType", p.materialType);
                                                    onUpdate("importPrice", p.importPrice || "");
                                                    if (line.qty > 0 && p.code) {
                                                        onUpdate("unitIds", generateUnitIds({ ...line, productCode: p.code }, line.qty));
                                                    }
                                                    setActiveDropdown({ id: null, field: null });
                                                }}>
                                                <p className="text-[13px] font-semibold text-gray-800 truncate">{p.name}</p>
                                                <div className="flex gap-2 mt-0.5">
                                                    <span className="text-[10px] text-gray-500">{p.code}</span>
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium" style={{ backgroundColor: "#F3E8FF", color: "#7C3AED" }}>{p.category}</span>
                                                </div>
                                            </div>
                                        ));
                                    })()}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 border-t pt-4" style={{ borderColor: "var(--grid-border)" }}>
                        <div>
                            <label className={lbl} style={lblS}>Số lượng nhập *</label>
                            <input type="number" min="1" value={line.qty} onChange={(e) => {
                                const q = e.target.value;
                                onUpdate("qty", q);
                                if (q > 0 && line.productCode?.trim()) {
                                    onUpdate("unitIds", generateUnitIds(line, q));
                                } else {
                                    onUpdate("unitIds", []);
                                }
                            }} placeholder="0" className={inp} style={inpS} />
                        </div>
                        <div>
                            <label className={lbl} style={lblS}>Giá nhập (₫) *</label>
                            <input type="text" value={formatNumber(line.importPrice)} onChange={(e) => onUpdate("importPrice", parseNumber(e.target.value))} placeholder="0" className={inp} style={inpS} />
                        </div>
                        <div>
                            <label className={lbl} style={lblS}><AlignLeft size={11} className="inline mr-1" />Chi tiết</label>
                            <input type="text" value={line.details} onChange={(e) => onUpdate("details", e.target.value)} placeholder="Ghi chú thêm..." className={inp} style={inpS} />
                        </div>
                    </div>
                </>
            ) : (
                <>
                    {/* Row 1: Hình thức + Mã + Tên */}
                    <div className="grid grid-cols-6 gap-3">
                        <div className="col-span-1">
                            <label className={lbl} style={lblS}>Hình thức</label>
                            <div className="relative">
                                <select value={line.formType} onChange={(e) => onUpdate("formType", e.target.value)}
                                    className={inp + " appearance-none pr-7 cursor-pointer"} style={inpS}>
                                    {FORM_TYPES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                                </select>
                                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-placeholder)" }} />
                            </div>
                        </div>
                        <div className="col-span-2">
                            <label className={lbl} style={lblS}>Mã sản phẩm</label>
                            <div className="relative">
                                <input value={line.productCode} onChange={(e) => {
                                    onUpdate("productCode", e.target.value);
                                    if (line.qty > 0 && e.target.value.trim() !== "") {
                                        onUpdate("unitIds", generateUnitIds({ ...line, productCode: e.target.value }, line.qty));
                                    } else {
                                        onUpdate("unitIds", []);
                                    }
                                }} placeholder="Tự sinh/Nhập tay" className={inp + " pr-16"} style={inpS} />
                                <button type="button" onClick={() => {
                                    const newCode = generateProductCode(line);
                                    onUpdate("productCode", newCode);
                                    if (line.qty > 0 && newCode.trim() !== "") {
                                        onUpdate("unitIds", generateUnitIds({ ...line, productCode: newCode }, line.qty));
                                    } else {
                                        onUpdate("unitIds", []);
                                    }
                                }} className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-2 text-[10px] font-bold rounded bg-purple-50 text-purple-600 hover:bg-purple-100 transition">Tự sinh</button>
                            </div>
                        </div>
                        <div className="col-span-3">
                            <label className={lbl} style={lblS}>Tên sản phẩm *</label>
                            <input value={line.productName} onChange={(e) => onUpdate("productName", e.target.value)} placeholder="VD: Bàn thờ Kim Tiền..." className={inp} style={inpS} />
                        </div>
                    </div>

                    {/* Row 2: Loại SP + Danh mục + Loại gỗ + Màu */}
                    <div className="grid grid-cols-4 gap-3">
                        <div>
                            <label className={lbl} style={lblS}>Loại hàng</label>
                            <div className="relative">
                                <select value={line.productType} onChange={(e) => onUpdate("productType", e.target.value)}
                                    className={inp + " appearance-none pr-7 cursor-pointer"} style={inpS}>
                                    {PRODUCT_TYPES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-placeholder)" }} />
                            </div>
                        </div>

                        {[
                            { label: "Danh mục", field: "category", opts: CATEGORIES },
                            { label: "Loại", field: "materialType", opts: MATERIAL_TYPES },
                            { label: "Màu sắc", field: "color", opts: COLORS },
                        ].map(({ label, field, opts }) => (
                            <div key={field} className="relative">
                                <label className={lbl} style={lblS}>{label}</label>
                                <input value={line[field]}
                                    onChange={(e) => { onUpdate(field, e.target.value); setActiveDropdown({ id: line._id, field }); }}
                                    onFocus={() => setActiveDropdown({ id: line._id, field })}
                                    onBlur={() => setTimeout(() => setActiveDropdown({ id: null, field: null }), 200)}
                                    placeholder="Tìm hoặc thêm..." className={inp} style={inpS} />
                                {activeDropdown.id === line._id && activeDropdown.field === field && (
                                    <div className="absolute z-50 left-0 right-0 top-[100%] mt-1 max-h-40 overflow-y-auto bg-white rounded-xl shadow-lg border" style={{ borderColor: "var(--grid-border)" }}>
                                        {opts.filter(o => o.toLowerCase().includes(line[field].toLowerCase())).map(o => (
                                            <div key={o} className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b last:border-0 text-[13px]"
                                                onMouseDown={(e) => { e.preventDefault(); onUpdate(field, o); setActiveDropdown({ id: null, field: null }); }}>
                                                {o}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>


                    {/* Row 3: Kích thước */}
                    <div className="grid grid-cols-3 gap-4">
                        {[["length", "Dài (cm)"], ["width", "Rộng (cm)"], ["height", "Cao (cm)"]].map(([f, l]) => (
                            <div key={f}>
                                <label className={lbl} style={lblS}>{l}</label>
                                <input type="number" min="0" value={line[f]} onChange={(e) => onUpdate(f, e.target.value)} placeholder="0" className={inp} style={inpS} />
                            </div>
                        ))}
                    </div>

                    {/* Row 4: Số lượng + Giá + Tồn min */}
                    <div className={`grid ${line.productType === "CUSTOM" ? "grid-cols-2" : "grid-cols-3"} gap-4`}>
                        <div>
                            <label className={lbl} style={lblS}>Số lượng *</label>
                            <input type="number" min="1" value={line.qty} onChange={(e) => {
                                const q = e.target.value;
                                onUpdate("qty", q);
                                if (q > 0 && line.productCode?.trim()) {
                                    onUpdate("unitIds", generateUnitIds(line, q));
                                } else {
                                    onUpdate("unitIds", []);
                                }
                            }} placeholder="0" className={inp} style={inpS} />
                        </div>
                        <div>
                            <label className={lbl} style={lblS}>Giá gốc (₫) *</label>
                            <input type="text" value={formatNumber(line.importPrice)} onChange={(e) => onUpdate("importPrice", parseNumber(e.target.value))} placeholder="0" className={inp} style={inpS} />
                        </div>
                        {line.productType !== "CUSTOM" && (
                            <div>
                                <label className={lbl} style={lblS}><BarChart2 size={11} className="inline mr-1" />Tồn thấp nhất</label>
                                <input type="number" min="0" value={line.minStock} onChange={(e) => onUpdate("minStock", e.target.value)} placeholder="0" className={inp} style={inpS} />
                            </div>
                        )}
                    </div>

            {/* Ảnh + Chi tiết */}
            <div className="space-y-3">
                <div>
                    <label className={lbl} style={lblS}>Ảnh sản phẩm (Có thể chọn nhiều)</label>
                    <div className="flex flex-wrap gap-3">
                        {line.imagePreviews.map((pre, i) => (
                            <div key={i} className="relative w-24 h-24 rounded-xl border overflow-hidden group shadow-sm" style={{ borderColor: "var(--grid-border)" }}>
                                <img src={pre} alt="SP" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button type="button" onClick={() => onRemoveImage(i)}
                                        className="p-1.5 bg-red-500 rounded-lg text-white hover:bg-red-600 transition shadow-lg">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        
                        <div className="relative w-24 h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition hover:border-purple-400 hover:bg-purple-50/30"
                            style={{ borderColor: "var(--grid-border)", backgroundColor: "var(--bg-main)" }}>
                            <div className="flex flex-col items-center gap-1" style={{ color: "var(--text-placeholder)" }}>
                                <Plus size={20} strokeWidth={2.5} />
                                <span className="text-[10px] font-bold uppercase">Thêm ảnh</span>
                            </div>
                            <input type="file" multiple accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={onFileChange} title="Chọn nhiều ảnh" />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col">
                    <label className={lbl} style={lblS}><AlignLeft size={11} className="inline mr-1" />Chi tiết sản phẩm</label>
                    <textarea value={line.details} onChange={(e) => onUpdate("details", e.target.value)}
                        placeholder="Ghi chú thêm thông tin chi tiết mặt hàng..."
                        className="w-full p-2.5 rounded-lg text-[13px] border focus:outline-none focus:ring-2 focus:ring-purple-300 transition resize-none"
                        style={{ ...inpS, lineHeight: 1.4, minHeight: "4rem" }} />
                </div>
            </div>
                </>
            )}

            {/* Quản lý mã định danh đơn vị */}
            {line.qty > 0 && (
                <div className="pt-2 border-t" style={{ borderColor: "var(--grid-border)" }}>
                    <button type="button" onClick={() => onUpdate("showUnitIds", !line.showUnitIds)}
                        className="text-[11px] font-bold flex items-center gap-1.5 hover:opacity-80 transition"
                        style={{ color: "var(--brand-primary)" }}>
                        <ChevronDown size={14} style={{ transform: line.showUnitIds ? "rotate(0)" : "rotate(-90deg)", transition: "0.2s" }} />
                        {line.showUnitIds ? "Ẩn danh sách mã định danh" : `Quản lý ${line.qty} mã định danh đơn vị (tự sinh/nhập tay)`}
                    </button>
                    
                    {line.showUnitIds && (
                        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {Array.from({ length: Number(line.qty) }).map((_, i) => (
                                <div key={i} className="flex flex-col gap-1">
                                    <span className="text-[9px] font-bold uppercase text-gray-400">Đơn vị #{i + 1}</span>
                                    <input 
                                        value={line.unitIds[i] || ""}
                                        onChange={(e) => {
                                            const newIds = [...line.unitIds];
                                            newIds[i] = e.target.value;
                                            onUpdate("unitIds", newIds);
                                        }}
                                        placeholder={`Mã ĐV ${i + 1}`}
                                        className="h-7 px-2 rounded-md text-[11px] font-mono border focus:outline-none focus:ring-1 focus:ring-purple-200"
                                        style={{ borderColor: "var(--grid-border)", backgroundColor: "#fff" }}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Line total */}
            {lineTotal > 0 && (
                <div className="flex items-center justify-end">
                    <span className="text-[12px] font-bold px-3 py-1.5 rounded-lg shadow-sm" style={{ backgroundColor: "#F5F3FF", color: "#7C3AED", border: "1px solid #EDE9FE" }}>
                        Thành tiền: {fmtCurrency(lineTotal)}
                    </span>
                </div>
            )}
        </div>
    );
}

// ══════════════════════════════════════════════════════════
// BUNDLE ROW – Dòng bộ sản phẩm
// ══════════════════════════════════════════════════════════
function BundleRow({ bundle, idx, onUpdate, onRemove, onAddItem, onRemoveItem, onUpdateItem,
    onFileChange, onRemoveImage, canRemove, lineTotal,
    activeDropdown, setActiveDropdown,
    inp, inpS, lbl, lblS, fmtCurrency, formatNumber, parseNumber }) {

    const isReady = bundle.formType === "READY";

    // Khi chọn bộ có sẵn → tự điền thông tin
    const applyBundle = (b) => {
        onUpdate("bundleCode", b.code);
        onUpdate("bundleName", b.bundleName);
        onUpdate("category", b.category);
        onUpdate("materialType", b.materialType);
        onUpdate("color", b.color);
        onUpdate("productType", b.productType);
        onUpdate("items", b.items.map(it => ({ ...it, _id: Math.random(), productNote: "" })));
        if (bundle.bundleQty > 0 && b.code) {
           onUpdate("unitIds", generateBundleUnitIds({ ...bundle, bundleCode: b.code }, bundle.bundleQty));
        }
    };

    return (
        <div className="rounded-2xl shadow-sm overflow-hidden" style={{ border: "2px solid #7C3AED" }}>
            {/* Bundle header bar */}
            <div className="px-5 py-2.5 flex items-center justify-between" style={{ backgroundColor: "#F5F3FF" }}>
                <p className="pt-3 text-[11px] font-bold uppercase tracking-widest flex items-center gap-1.5" style={{ color: "#7C3AED" }}>
                    <Layers size={11} /> Bộ sản phẩm {idx + 1}
                </p>
                {canRemove && (
                    <button type="button" onClick={onRemove} className="p-1 rounded hover:bg-red-50 text-purple-300 hover:text-red-500 cursor-pointer transition">
                        <Trash2 size={13} />
                    </button>
                )}
            </div>

            <div className="pt-3 px-5 pb-5 space-y-4 " style={{ backgroundColor: "var(--bg-main)" }}>

                {/* ── Row 1: Hình thức + Mã bộ + Tên bộ ── */}
                <div className="grid grid-cols-6 gap-3">
                    <div className="col-span-1">
                        <label className={lbl} style={lblS}>Hình thức</label>
                        <div className="relative">
                            <select value={bundle.formType} onChange={(e) => onUpdate("formType", e.target.value)}
                                className={inp + " appearance-none pr-7 cursor-pointer"} style={inpS}>
                                {FORM_TYPES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                            </select>
                            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-placeholder)" }} />
                        </div>
                    </div>

                    <div className="col-span-2">
                        <label className={lbl} style={lblS}>Mã bộ sản phẩm</label>
                        <div className="relative">
                            <input value={bundle.bundleCode}
                                onChange={(e) => {
                                    onUpdate("bundleCode", e.target.value);
                                    if (bundle.bundleQty > 0 && e.target.value.trim() !== "") {
                                        onUpdate("unitIds", generateBundleUnitIds({ ...bundle, bundleCode: e.target.value }, bundle.bundleQty));
                                    } else {
                                        onUpdate("unitIds", []);
                                    }
                                }}
                                placeholder="Tự sinh / Nhập tay"
                                className={inp + (isReady ? "" : " pr-16")}
                                style={isReady ? { ...inpS, backgroundColor: "#F5F3FF", color: "#7C3AED", fontWeight: 600 } : inpS}
                                readOnly={isReady} />
                            {!isReady && (
                                <button type="button" onClick={() => {
                                    const newCode = generateBundleCode(bundle);
                                    onUpdate("bundleCode", newCode);
                                    if (bundle.bundleQty > 0 && newCode.trim() !== "") {
                                        onUpdate("unitIds", generateBundleUnitIds({ ...bundle, bundleCode: newCode }, bundle.bundleQty));
                                    } else {
                                        onUpdate("unitIds", []);
                                    }
                                }} className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-2 text-[10px] font-bold rounded bg-purple-50 text-purple-600 hover:bg-purple-100 transition">Tự sinh</button>
                            )}
                        </div>
                    </div>

                    {isReady ? (
                        <div className="col-span-3 relative">
                            <label className={lbl} style={lblS}>
                                Tìm bộ đã có trong kho *
                                {bundle.category && <span className="ml-2 normal-case font-normal text-purple-500">✓ Đã chọn — chỉ cần nhập số bộ &amp; giá HĐ</span>}
                            </label>
                            <input
                                value={bundle.bundleName}
                                onChange={(e) => { onUpdate("bundleName", e.target.value); setActiveDropdown({ id: bundle._id, field: "bundleSearch" }); }}
                                onFocus={() => setActiveDropdown({ id: bundle._id, field: "bundleSearch" })}
                                onBlur={() => setTimeout(() => setActiveDropdown({ id: null, field: null }), 200)}
                                placeholder="Gõ tên bộ để tìm... VD: Bộ bàn ăn..."
                                className={inp} style={{ ...inpS, borderColor: "#7C3AED", boxShadow: "0 0 0 1px #EDE9FE" }}
                            />
                            {activeDropdown.id === bundle._id && activeDropdown.field === "bundleSearch" && (
                                <div className="absolute z-50 left-0 right-0 top-[100%] mt-1 max-h-64 overflow-y-auto bg-white rounded-xl shadow-xl border" style={{ borderColor: "#DDD6FE" }}>
                                    {(() => {
                                        const q = bundle.bundleName.toLowerCase();
                                        const results = MOCK_BUNDLES.filter(b =>
                                            b.bundleName.toLowerCase().includes(q) ||
                                            b.code.toLowerCase().includes(q) ||
                                            b.category.toLowerCase().includes(q)
                                        );
                                        if (results.length === 0) return <div className="p-4 text-[12px] text-gray-500 text-center">Không tìm thấy bộ nào trong kho</div>;
                                        return results.map(b => (
                                            <div key={b.code}
                                                className="px-4 py-3 hover:bg-purple-50 cursor-pointer border-b last:border-0 transition-colors"
                                                style={{ borderColor: "#F3F0FF" }}
                                                onMouseDown={(e) => { e.preventDefault(); applyBundle(b); setActiveDropdown({ id: null, field: null }); }}>
                                                <div className="flex items-center justify-between">
                                                    <p className="text-[13px] font-semibold text-gray-800">{b.bundleName}</p>
                                                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ backgroundColor: "#EDE9FE", color: "#7C3AED" }}>{b.code}</span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ backgroundColor: "#F0FDF4", color: "#15803D" }}>{b.category}</span>
                                                    <span className="text-[10px] text-gray-500">{b.materialType} · {b.color}</span>
                                                    <span className="text-[10px] text-gray-400">{b.items.length} món lẻ</span>
                                                </div>
                                            </div>
                                        ));
                                    })()}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="col-span-3">
                            <label className={lbl} style={lblS}>Tên bộ sản phẩm *</label>
                            <input value={bundle.bundleName} onChange={(e) => onUpdate("bundleName", e.target.value)}
                                placeholder="VD: Bộ bàn ăn 8 ghế nguyên khối..."
                                className={inp} style={inpS} />
                        </div>
                    )}
                </div>

                {/* ── Row 2: Số bộ + Giá cả bộ (luôn hiện) ── */}
                <div className={`grid gap-3 ${isReady ? "grid-cols-2" : "grid-cols-3"}`}>
                    {!isReady && (
                        <div>
                            <label className={lbl} style={lblS}>Loại sản phẩm</label>
                            <div className="relative">
                                <select value={bundle.productType} onChange={(e) => onUpdate("productType", e.target.value)}
                                    className={inp + " appearance-none pr-7 cursor-pointer"} style={inpS}>
                                    {PRODUCT_TYPES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-placeholder)" }} />
                            </div>
                        </div>
                    )}
                    <div>
                        <label className={lbl} style={lblS}>Số bộ nhập *</label>
                        <input type="number" min="1" value={bundle.bundleQty} onChange={(e) => {
                            const q = e.target.value;
                            onUpdate("bundleQty", q);
                            if (q > 0 && bundle.bundleCode?.trim()) {
                                onUpdate("unitIds", generateBundleUnitIds(bundle, q));
                            } else {
                                onUpdate("unitIds", []);
                            }
                        }}
                            placeholder="1" className={inp} style={inpS} />
                    </div>
                    <div>
                        <label className={lbl} style={{ ...lblS }}><span className="text-purple-600">Giá cả bộ (₫) — theo HĐ *</span></label>
                        <input type="text" value={formatNumber(bundle.bundlePrice)}
                            onChange={(e) => onUpdate("bundlePrice", parseNumber(e.target.value))}
                            placeholder="Nhập đúng theo HĐ xưởng..." className={inp}
                            style={{ ...inpS, borderColor: "#7C3AED", boxShadow: "0 0 0 1px #EDE9FE" }} />
                    </div>
                </div>

                {/* ── Row 3: Danh mục/Gỗ/Màu — chỉ hiện khi NEW ── */}
                {!isReady && (
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: "Danh mục", field: "category", opts: CATEGORIES },
                            { label: "Chất liệu", field: "materialType", opts: MATERIAL_TYPES },
                            { label: "Màu sắc", field: "color", opts: COLORS },
                        ].map(({ label, field, opts }) => (
                            <div key={field} className="relative">
                                <label className={lbl} style={lblS}>{label}</label>
                                <input value={bundle[field]}
                                    onChange={(e) => { onUpdate(field, e.target.value); setActiveDropdown({ id: bundle._id, field }); }}
                                    onFocus={() => setActiveDropdown({ id: bundle._id, field })}
                                    onBlur={() => setTimeout(() => setActiveDropdown({ id: null, field: null }), 200)}
                                    placeholder="Tìm hoặc thêm..." className={inp} style={inpS} />
                                {activeDropdown.id === bundle._id && activeDropdown.field === field && (
                                    <div className="absolute z-50 left-0 right-0 top-[100%] mt-1 max-h-40 overflow-y-auto bg-white rounded-xl shadow-lg border" style={{ borderColor: "var(--grid-border)" }}>
                                        {opts.filter(o => o.toLowerCase().includes(bundle[field].toLowerCase())).map(o => (
                                            <div key={o} className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b last:border-0 text-[13px]"
                                                onMouseDown={(e) => { e.preventDefault(); onUpdate(field, o); setActiveDropdown({ id: null, field: null }); }}>
                                                {o}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Badge tự điền (khi READY + đã chọn bộ) */}
                {isReady && bundle.category && (
                    <div className="flex items-center gap-2 flex-wrap px-3 py-2 rounded-lg" style={{ backgroundColor: "#F0FDF4", border: "1px solid #BBF7D0" }}>
                        <CheckCircle size={13} style={{ color: "#15803D" }} />
                        <span className="text-[12px] font-semibold" style={{ color: "#15803D" }}>Đã tự điền:</span>
                        {[bundle.category, bundle.materialType, bundle.color].filter(Boolean).map(v => (
                            <span key={v} className="text-[11px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: "#DCFCE7", color: "#15803D" }}>{v}</span>
                        ))}
                        <span className="text-[11px]" style={{ color: "#15803D" }}>· {bundle.items.length} món lẻ (có thể chỉnh lại thông tin)</span>
                    </div>
                )}

                {/* ── Các món lẻ trong bộ ── */}
                <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #DDD6FE" }}>
                    <div className="px-4 py-2.5 flex items-center justify-between" style={{ backgroundColor: "#EDE9FE" }}>
                        <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "#5B21B6" }}>
                            Các món lẻ trong bộ
                        </p>
                    </div>
                    <table className="w-full" style={{ backgroundColor: "#fff" }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid #EDE9FE" }}>
                                <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-wider w-6" style={{ color: "#7C3AED" }}>#</th>
                                <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-wider" style={{ color: "#7C3AED" }}>Tên món</th>
                                <th className="px-3 py-2 text-center text-[10px] font-bold uppercase tracking-wider w-20" style={{ color: "#7C3AED" }}>SL/bộ</th>
                                <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider" style={{ color: "#7C3AED" }}>Kích thước (D×R×C)</th>
                                <th className="w-10" />
                            </tr>
                        </thead>
                        <tbody>
                            {bundle.items.map((item, iIdx) => (
                                <tr key={item._id} style={{ borderBottom: "1px solid #F3F0FF" }}>
                                    <td className="px-4 py-2 text-[12px]" style={{ color: "#7C3AED" }}>{iIdx + 1}</td>
                                    <td className="px-4 py-2">
                                        <input value={item.name}
                                            onChange={(e) => onUpdateItem(item._id, "name", e.target.value)}
                                            placeholder="VD: Bàn ăn, Ghế ăn..."
                                            className="w-full h-8 px-2 rounded-md text-[13px] border focus:outline-none focus:ring-1 focus:ring-purple-200 transition"
                                            style={{ borderColor: "#DDD6FE", backgroundColor: "#FAFAFA" }} />
                                    </td>
                                    <td className="px-3 py-2">
                                        <input type="number" min="1" value={item.qty}
                                            onChange={(e) => onUpdateItem(item._id, "qty", e.target.value)}
                                            className="w-full h-8 px-2 rounded-md text-[13px] border text-center focus:outline-none focus:ring-1 focus:ring-purple-200 transition"
                                            style={{ borderColor: "#DDD6FE", backgroundColor: "#FAFAFA" }} />
                                    </td>
                                    <td className="px-3 py-2">
                                        <div className="flex items-center gap-2">
                                            <input type="number" value={item.length || ""}
                                                onChange={(e) => onUpdateItem(item._id, "length", e.target.value)}
                                                placeholder="Dài"
                                                className="w-full h-8 px-2 rounded-md text-[13px] border text-center focus:outline-none focus:ring-1 focus:ring-purple-200 transition"
                                                style={{ borderColor: "#DDD6FE", backgroundColor: "#FAFAFA" }} />
                                            <span className="text-[12px]" style={{ color: "var(--text-placeholder)" }}>×</span>
                                            <input type="number" value={item.width || ""}
                                                onChange={(e) => onUpdateItem(item._id, "width", e.target.value)}
                                                placeholder="Rộng"
                                                className="w-full h-8 px-2 rounded-md text-[13px] border text-center focus:outline-none focus:ring-1 focus:ring-purple-200 transition"
                                                style={{ borderColor: "#DDD6FE", backgroundColor: "#FAFAFA" }} />
                                            <span className="text-[12px]" style={{ color: "var(--text-placeholder)" }}>×</span>
                                            <input type="number" value={item.height || ""}
                                                onChange={(e) => onUpdateItem(item._id, "height", e.target.value)}
                                                placeholder="Cao"
                                                className="w-full h-8 px-2 rounded-md text-[13px] border text-center focus:outline-none focus:ring-1 focus:ring-purple-200 transition"
                                                style={{ borderColor: "#DDD6FE", backgroundColor: "#FAFAFA" }} />
                                            <span className="text-[12px]" style={{ color: "var(--text-placeholder)" }}>cm</span>
                                        </div>
                                    </td>
                                    <td className="px-2 py-2 text-center">
                                        {bundle.items.length > 1 && (
                                            <button type="button" onClick={() => onRemoveItem(item._id)}
                                                className="p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-500 cursor-pointer transition">
                                                <Trash2 size={12} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Add item */}
                    <div className="px-4 py-3" style={{ borderTop: "1px solid #EDE9FE", backgroundColor: "#FAFAFE" }}>
                        <button type="button" onClick={onAddItem}
                            className="flex items-center gap-1.5 h-7 px-3 rounded-lg text-[12px] font-bold cursor-pointer hover:opacity-80 transition"
                            style={{ backgroundColor: "#EDE9FE", color: "#7C3AED" }}>
                            <Plus size={12} /> Thêm món
                        </button>
                    </div>
                </div>

                {/* Quản lý mã định danh bộ */}
                {bundle.bundleQty > 0 && (
                    <div className="pt-2 border-t" style={{ borderColor: "var(--grid-border)" }}>
                        <button type="button" onClick={() => onUpdate("showUnitIds", !bundle.showUnitIds)}
                            className="text-[11px] font-bold flex items-center gap-1.5 hover:opacity-80 transition"
                            style={{ color: "#7C3AED" }}>
                            <ChevronDown size={14} style={{ transform: bundle.showUnitIds ? "rotate(0)" : "rotate(-90deg)", transition: "0.2s" }} />
                            {bundle.showUnitIds ? "Ẩn danh sách mã định danh bộ" : `Quản lý ${bundle.bundleQty} mã định danh bộ (tự sinh/nhập tay)`}
                        </button>
                        
                        {bundle.showUnitIds && (
                            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {Array.from({ length: Number(bundle.bundleQty) }).map((_, i) => (
                                    <div key={i} className="flex flex-col gap-1">
                                        <span className="text-[9px] font-bold uppercase text-gray-400">Bộ #{i + 1}</span>
                                        <input 
                                            value={bundle.unitIds[i] || ""}
                                            onChange={(e) => {
                                                const newIds = [...bundle.unitIds];
                                                newIds[i] = e.target.value;
                                                onUpdate("unitIds", newIds);
                                            }}
                                            placeholder={`Mã bộ ${i + 1}`}
                                            className="h-7 px-2 rounded-md text-[11px] font-mono border focus:outline-none focus:ring-1 focus:ring-purple-200"
                                            style={{ borderColor: "#DDD6FE", backgroundColor: "#fff" }}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Ảnh + Chi tiết bộ */}
                <div className="space-y-4">
                    <div>
                        <label className={lbl} style={lblS}>Ảnh bộ sản phẩm (Nhiều ảnh)</label>
                        <div className="flex flex-wrap gap-3">
                            {bundle.imagePreviews.map((pre, i) => (
                                <div key={i} className="relative w-24 h-24 rounded-xl border overflow-hidden group shadow-sm" style={{ borderColor: "#DDD6FE" }}>
                                    <img src={pre} alt="Bộ SP" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button type="button" onClick={() => onRemoveImage(i)}
                                            className="p-1.5 bg-red-500 rounded-lg text-white hover:bg-red-600 transition shadow-lg">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            
                            <div className="relative w-24 h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition hover:border-purple-400 hover:bg-purple-50/20"
                                style={{ borderColor: "#DDD6FE", backgroundColor: "#F5F3FF" }}>
                                <div className="flex flex-col items-center gap-1" style={{ color: "#A78BFA" }}>
                                    <Plus size={20} strokeWidth={2.5} />
                                    <span className="text-[10px] font-bold uppercase">Thêm ảnh</span>
                                </div>
                                <input type="file" multiple accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={onFileChange} title="Chọn nhiều ảnh bộ" />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <label className={lbl} style={lblS}><AlignLeft size={11} className="inline mr-1" />Chi tiết bộ sản phẩm</label>
                        <textarea value={bundle.details} onChange={(e) => onUpdate("details", e.target.value)}
                            placeholder="Ghi chú thêm thông tin về bộ hàng này..."
                            className="w-full p-2.5 rounded-lg text-[13px] border focus:outline-none focus:ring-2 focus:ring-purple-300 transition resize-none"
                            style={{ borderColor: "var(--grid-border)", backgroundColor: "#fff", color: "var(--text-main)", lineHeight: 1.4, minHeight: "4rem" }} />
                    </div>
                </div>

                {/* Bundle total */}
                {lineTotal > 0 && (
                    <div className="flex items-center justify-end">
                        <span className="text-[12px] font-bold px-3 py-1.5 rounded-lg shadow-sm" style={{ backgroundColor: "#F5F3FF", color: "#7C3AED", border: "1px solid #EDE9FE" }}>
                            Thành tiền (HĐ): {fmtCurrency(lineTotal)}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
