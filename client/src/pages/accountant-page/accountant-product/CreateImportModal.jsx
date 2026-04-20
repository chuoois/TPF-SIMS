/**
 * CreateImportModal – Tạo Phiếu Nhập Kho
 * Hỗ trợ 2 loại dòng:
 *   1. Dòng đơn lẻ (line) – sản phẩm bình thường
 *   2. Dòng bộ (bundle) – nhập cả bộ theo HĐ, ước tính giá từng món lẻ
 */

import { useState, useRef, useEffect, useMemo } from "react";
import {
    X, Plus, Trash2, Upload, FileImage, Search,
    Building2, Calendar, Package, ChevronDown, AlignLeft,
    BarChart2, Image, Layers, CheckCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";

import {
    MATERIAL_TYPES,
    COLORS,
    SUPPLIERS,
    PRODUCT_TYPES,
    ALL_PRODUCTS,
    MOCK_IMPORT_REQUESTS
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
    productType: "",
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
    productType: "",
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

    // Section 2 – Yêu cầu & lines
    const [lines, setLines] = useState([]);
    const [activeDropdown, setActiveDropdown] = useState({ id: null, field: null });

    // Yêu cầu nhập hàng data & state
    const [mergedRequests, setMergedRequests] = useState([]);
    const [expandedRequests, setExpandedRequests] = useState({});
    const [selectedRequestItems, setSelectedRequestItems] = useState({});
    const [requestSearchTerm, setRequestSearchTerm] = useState("");

    useEffect(() => {
        const localData = JSON.parse(localStorage.getItem("tpf_manufacturing_orders") || "[]");
        
        const adaptedLocal = localData.map(r => ({
            id: r.id,
            requestCode: r.id,
            date: r.createdAt ? r.createdAt.substring(0, 10) : "",
            createdBy: r.createdBy || "Chủ xưởng",
            note: r.note || "Yêu cầu từ xưởng",
            status: r.status === "Mới tạo" ? "PENDING" : r.status,
            items: (r.items || []).map((it, idx) => ({
                id: `loc_item_${r.id}_${it.id || idx}`,
                productCode: "",
                productName: it.productName || it.name || "Sản phẩm",
                category: "",
                materialType: it.material || "",
                color: it.color || "",
                productType: "FINISHED",
                requestedQty: it.qty || 1,
                estimatedPrice: 0,
                isBundle: false,
                details: it.note || it.size || "",
            }))
        }));

        const combined = [...adaptedLocal, ...MOCK_IMPORT_REQUESTS];
        setMergedRequests(combined);
    }, []);

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

    // ── Gắn Request (Thêm các mặt hàng đã tick chọn) ───
    const handleAddSelectedItems = () => {
        const selectedItems = Object.values(selectedRequestItems).filter(item => item !== undefined);
        if (selectedItems.length === 0) {
            toast.error("Vui lòng chọn ít nhất 1 mặt hàng!");
            return;
        }

        const newLines = selectedItems.map(p => {
            const qtyToImport = p.requestedQty || 1;
            if (p.isBundle) {
                const newBundle = emptyBundle();
                newBundle._id = Math.random();
                newBundle.bundleCode = p.bundleCode || p.productCode || "";
                newBundle.bundleName = p.bundleName || p.productName;
                newBundle.category = p.category || "";
                newBundle.materialType = p.materialType || "";
                newBundle.color = p.color || "";
                newBundle.productType = p.productType || "FINISHED";
                newBundle.bundleQty = qtyToImport;
                newBundle.bundlePrice = p.estimatedPrice || "";
                newBundle.items = (p.items || []).map(it => ({ ...it, _id: Math.random(), productNote: "" }));
                if (qtyToImport > 0 && newBundle.bundleCode) {
                    newBundle.unitIds = generateBundleUnitIds({ ...newBundle, bundleCode: newBundle.bundleCode }, qtyToImport);
                }
                return newBundle;
            } else {
                const newLine = emptyLine();
                newLine._id = Math.random();
                newLine.productCode = p.productCode || "";
                newLine.productName = p.productName;
                newLine.category = p.category || "";
                newLine.materialType = p.materialType || "";
                newLine.color = p.color || "";
                newLine.productType = p.productType || "FINISHED";
                newLine.qty = qtyToImport;
                newLine.importPrice = p.estimatedPrice || "";
                newLine.details = p.details || "";
                if (qtyToImport > 0 && newLine.productCode) {
                    newLine.unitIds = generateUnitIds(newLine, qtyToImport);
                }
                return newLine;
            }
        });

        setLines(prev => [...prev, ...newLines]);
        toast.success(`Đã thêm ${newLines.length} mặt hàng vào phiếu!`, { style: { fontSize: "13px" } });
        
        setSelectedRequestItems({});
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
                if (!l.importPrice || Number(l.importPrice) <= 0) { toast.error("Giá gốc phải lớn hơn 0"); return; }
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
            <div className="w-full max-w-3xl bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden" style={{ maxHeight: "80vh" }}>

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
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 mb-2">
                                <p className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 whitespace-nowrap" style={{ color: "var(--brand-primary)" }}>
                                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-[10px] font-black" style={{ backgroundColor: "var(--brand-primary)" }}>2</span>
                                    CHỌN TỪ YÊU CẦU NHẬP
                                </p>
                            </div>

                            {/* Thanh tìm kiếm yêu cầu */}
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Tìm theo mã yêu cầu hoặc ghi chú..." 
                                    value={requestSearchTerm}
                                    onChange={e => setRequestSearchTerm(e.target.value)}
                                    className="w-full text-[13px] h-9 pl-9 pr-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-300 transition"
                                    style={{ borderColor: "var(--grid-border)" }}
                                />
                            </div>

                            <div className="flex flex-col gap-3">
                                <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                                    {mergedRequests
                                        .filter(r => r.status === "PENDING" || r.status === "Chờ xử lý" || r.status === "Chờ sản xuất" || r.status === "Đang gia công")
                                        .filter(r => (r.requestCode || "").toLowerCase().includes(requestSearchTerm.toLowerCase()) || (r.note || "").toLowerCase().includes(requestSearchTerm.toLowerCase()))
                                        .map(req => {
                                        const isExpanded = expandedRequests[req.id];
                                        return (
                                        <div key={req.id} className="border rounded-xl bg-white overflow-hidden transition-all shadow-sm shrink-0" style={{ borderColor: "var(--grid-border)" }}>
                                            <div 
                                                className="px-4 py-3 cursor-pointer hover:bg-purple-50 flex items-center justify-between"
                                                onClick={() => setExpandedRequests(p => ({...p, [req.id]: !p[req.id]}))}
                                            >
                                                <div className="flex flex-col gap-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-[13px] text-purple-700">{req.requestCode}</span>
                                                        <span className="text-[11px] font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{req.date}</span>
                                                    </div>
                                                    <span className="text-[12px] text-gray-600 font-medium line-clamp-1">{req.note}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="text-[11px] text-gray-500 font-medium">({req.items?.length || 0} SP)</div>
                                                    <ChevronDown size={16} className={`text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                                                </div>
                                            </div>
                                            
                                            {isExpanded && (
                                                <div className="border-t bg-gray-50 p-3" style={{ borderColor: "var(--grid-border)" }}>
                                                    <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
                                                        {req.items.map(item => {
                                                            const itemKey = `${req.id}_${item.id}`;
                                                            const isChecked = !!selectedRequestItems[itemKey];
                                                            return (
                                                                <label key={item.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-white border cursor-pointer hover:border-purple-300 transition-colors" style={{ borderColor: isChecked ? "#c084fc" : "var(--grid-border)" }}>
                                                                    <div className="shrink-0 flex items-center justify-center">
                                                                        <input 
                                                                            type="checkbox" 
                                                                            className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500 cursor-pointer"
                                                                            checked={isChecked}
                                                                            onChange={(e) => {
                                                                                setSelectedRequestItems(p => ({...p, [itemKey]: e.target.checked ? item : undefined}))
                                                                            }}
                                                                        />
                                                                    </div>
                                                                    <div className="flex-1 flex justify-between items-center text-[13px]">
                                                                        <div className="flex flex-col">
                                                                            <span className="font-bold text-gray-800">{item.productName}</span>
                                                                            <div className="text-[11px] text-gray-500 flex gap-1.5 mt-0.5">
                                                                                {item.materialType && <span className="bg-gray-100 px-1.5 rounded">{item.materialType}</span>}
                                                                                {item.color && <span className="bg-gray-100 px-1.5 rounded">{item.color}</span>}
                                                                                {item.details && <span className="text-gray-400 max-w-[150px] truncate italic">({item.details})</span>}
                                                                            </div>
                                                                        </div>
                                                                        <div className="shrink-0 flex items-center gap-1.5 bg-purple-50 px-2 py-1 rounded-md border border-purple-100">
                                                                            <span className="text-[11px] text-purple-600 font-medium">SL:</span>
                                                                            <span className="font-black text-[14px] text-purple-700">{item.requestedQty}</span>
                                                                        </div>
                                                                    </div>
                                                                </label>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                                {mergedRequests.filter(r => r.status === "PENDING" || r.status === "Chờ xử lý" || r.status === "Chờ sản xuất" || r.status === "Đang gia công")
                                        .filter(r => (r.requestCode || "").toLowerCase().includes(requestSearchTerm.toLowerCase()) || (r.note || "").toLowerCase().includes(requestSearchTerm.toLowerCase())).length === 0 && (
                                    <div className="p-6 text-center text-gray-400 border border-dashed rounded-xl text-[12px] bg-gray-50/50">
                                        Không tìm thấy yêu cầu nào phù hợp.
                                    </div>
                                )}
                                </div>
                                <div className="flex justify-between items-center mt-1 border-t pt-3" style={{ borderColor: "var(--grid-border)" }}>
                                    <span className="text-[11px] text-gray-500 italic">
                                        Đã chọn {Object.values(selectedRequestItems).filter(i => i !== undefined).length} mặt hàng
                                    </span>
                                    <button 
                                        type="button"
                                        onClick={handleAddSelectedItems}
                                        disabled={Object.values(selectedRequestItems).filter(i => i !== undefined).length === 0}
                                        className="h-9 px-5 rounded-lg text-[13px] font-bold border transition-all flex items-center gap-2 shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{ borderColor: "var(--brand-primary)", backgroundColor: "var(--brand-primary)", color: "#fff" }}
                                    >
                                        <Plus size={16} strokeWidth={2.5} /> Thêm vào phiếu nhập ({Object.values(selectedRequestItems).filter(i => i !== undefined).length})
                                    </button>
                                </div>
                            </div>

                            {lines.length === 0 ? (
                                <div className="p-8 text-center border-2 border-dashed rounded-xl" style={{ borderColor: "var(--grid-border)" }}>
                                    <Package size={30} className="mx-auto mb-2 text-gray-300" />
                                    <p className="text-[13px] text-gray-500 font-medium">Bạn chưa chọn Yêu cầu nhập hàng nào.</p>
                                </div>
                            ) : null}

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

            <>
                {/* Khung thông tin SP (ReadOnly) */}
                <div className="mb-4 bg-gray-50 p-4 rounded-xl border border-dashed text-[12px] flex flex-col gap-2 relative" style={{ borderColor: "var(--grid-border)" }}>
                    <div className="absolute right-3 top-3"><CheckCircle size={14} className="text-emerald-500" /></div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        <div className="col-span-2 text-[14px] font-bold text-gray-800 mb-1">{line.productName}</div>
                        <div><span className="text-gray-500">Mã SP:</span> <span className="font-bold text-gray-800 font-mono ml-1">{line.productCode}</span></div>
                        <div><span className="text-gray-500">Danh mục:</span> <span className="font-semibold text-purple-700 ml-1">{line.category || "—"}</span></div>
                        <div><span className="text-gray-500">Loại SP:</span> <span className="font-semibold text-gray-700 ml-1">{
                            PRODUCT_TYPES.find(t => t.value === line.productType)?.label || line.productType || "—"
                        }</span></div>
                        <div><span className="text-gray-500">Chất liệu:</span> <span className="font-semibold text-gray-700 ml-1">{line.materialType || "—"} / {line.color || "—"}</span></div>
                        <div className="col-span-2"><span className="text-gray-500">Kích thước (D×R×C):</span> <span className="font-semibold text-gray-700 ml-1">{line.length || "0"} × {line.width || "0"} × {line.height || "0"} cm</span></div>
                    </div>
                </div>

                {/* Các input nhập liệu */}
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
                        <label className={lbl} style={lblS}>Giá gốc nhập (₫) *</label>
                        <input type="text" value={formatNumber(line.importPrice)} onChange={(e) => onUpdate("importPrice", parseNumber(e.target.value))} placeholder="0" className={inp} style={inpS} />
                    </div>
                    <div>
                        <label className={lbl} style={lblS}><AlignLeft size={11} className="inline mr-1" />Ghi chú</label>
                        <input type="text" value={line.details} onChange={(e) => onUpdate("details", e.target.value)} placeholder="Ghi chú mặt hàng..." className={inp} style={inpS} />
                    </div>
                </div>

                <div className="space-y-3 pt-4">
                    <div>
                        <label className={lbl} style={lblS}>Ảnh nhập chuẩn (Nhiều ảnh)</label>
                        <div className="flex flex-wrap gap-3">
                            {line.imagePreviews.map((pre, i) => (
                                <div key={i} className="relative w-20 h-20 rounded-xl border overflow-hidden group shadow-sm" style={{ borderColor: "var(--grid-border)" }}>
                                    <img src={pre} alt="SP" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button type="button" onClick={() => onRemoveImage(i)}
                                            className="p-1.5 bg-red-500 rounded-lg text-white hover:bg-red-600 transition shadow-lg">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <div className="relative w-20 h-20 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition hover:border-purple-400 hover:bg-purple-50/30"
                                style={{ borderColor: "var(--grid-border)", backgroundColor: "var(--bg-main)" }}>
                                <div className="flex flex-col items-center gap-1" style={{ color: "var(--text-placeholder)" }}>
                                    <Plus size={18} strokeWidth={2.5} />
                                    <span className="text-[9px] font-bold uppercase">Thêm ảnh</span>
                                </div>
                                <input type="file" multiple accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={onFileChange} title="Chọn nhiều ảnh" />
                            </div>
                        </div>
                    </div>
                </div>
            </>

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
                                    <span className="text-[9px] font-bold uppercase text-gray-400">Đơn vị #${i + 1}</span>
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

// BUNDLE ROW – Dòng bộ sản phẩm
// ══════════════════════════════════════════════════════════
function BundleRow({ bundle, idx, onUpdate, onRemove, onAddItem, onRemoveItem, onUpdateItem,
    onFileChange, onRemoveImage, canRemove, lineTotal,
    activeDropdown, setActiveDropdown,
    inp, inpS, lbl, lblS, fmtCurrency, formatNumber, parseNumber }) {

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

                {/* Khung thông tin Bộ (ReadOnly) */}
                <div className="flex items-center gap-2 flex-wrap px-4 py-3 rounded-lg" style={{ backgroundColor: "#F0FDF4", border: "1px solid #BBF7D0" }}>
                    <CheckCircle size={15} style={{ color: "#15803D" }} />
                    <span className="text-[14px] font-bold text-gray-800 mr-2">{bundle.bundleName}</span>
                    <span className="text-[12px] font-semibold" style={{ color: "#15803D" }}>Thuộc tính bộ:</span>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white ml-1 font-mono border" style={{ borderColor: "#BBF7D0" }}>{bundle.bundleCode}</span>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white ml-1 border" style={{ borderColor: "#BBF7D0" }}>{bundle.category}</span>
                    {bundle.materialType && <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white ml-1 border" style={{ borderColor: "#BBF7D0" }}>{bundle.materialType} {bundle.color && `- ${bundle.color}`}</span>}
                </div>


                {/* ── Row 2: Số bộ + Giá cả bộ ── */}
                <div className="grid gap-3 grid-cols-2 mt-2">
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

                {/* ── Các món lẻ trong bộ (ReadOnly) ── */}
                <div className="rounded-xl overflow-hidden mt-3" style={{ border: "1px solid #DDD6FE" }}>
                    <div className="px-4 py-2.5 flex items-center justify-between" style={{ backgroundColor: "#EDE9FE" }}>
                        <p className="text-[11px] font-bold uppercase tracking-wider flex gap-1 items-center" style={{ color: "#5B21B6" }}>
                            Các món lẻ trong bộ <span className="opacity-70 normal-case font-normal">(theo thiết lập của chủ xưởng - không thể sửa)</span>
                        </p>
                    </div>
                    <table className="w-full" style={{ backgroundColor: "#fff" }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid #EDE9FE" }}>
                                <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-wider w-6" style={{ color: "#7C3AED" }}>#</th>
                                <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-wider" style={{ color: "#7C3AED" }}>Tên món</th>
                                <th className="px-4 py-2 text-center text-[10px] font-bold uppercase tracking-wider w-20" style={{ color: "#7C3AED" }}>SL/bộ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bundle.items.map((item, iIdx) => (
                                <tr key={item._id || iIdx} style={{ borderBottom: "1px solid #F3F0FF" }}>
                                    <td className="px-4 py-2 text-[12px]" style={{ color: "#7C3AED" }}>{iIdx + 1}</td>
                                    <td className="px-4 py-2">
                                        <div className="w-full h-8 px-2 rounded-md flex items-center text-[13px] bg-gray-50 text-gray-700"
                                            style={{ borderColor: "#DDD6FE" }}>
                                            {item.name}
                                        </div>
                                    </td>
                                    <td className="px-4 py-2">
                                        <div className="w-full h-8 px-2 rounded-md flex items-center justify-center text-[13px] font-semibold bg-gray-50 text-gray-800"
                                            style={{ borderColor: "#DDD6FE" }}>
                                            {item.qty}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Quản lý mã định danh bộ */}
                {bundle.bundleQty > 0 && (
                    <div className="pt-3 border-t" style={{ borderColor: "var(--grid-border)" }}>
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
                                        <span className="text-[9px] font-bold uppercase text-gray-400">Bộ #${i + 1}</span>
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
                <div className="space-y-4 pt-3">
                    <div>
                        <label className={lbl} style={lblS}>Ảnh bộ sản phẩm (Nhiều ảnh)</label>
                        <div className="flex flex-wrap gap-3">
                            {bundle.imagePreviews.map((pre, i) => (
                                <div key={i} className="relative w-20 h-20 rounded-xl border overflow-hidden group shadow-sm" style={{ borderColor: "#DDD6FE" }}>
                                    <img src={pre} alt="Bộ SP" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button type="button" onClick={() => onRemoveImage(i)}
                                            className="p-1.5 bg-red-500 rounded-lg text-white hover:bg-red-600 transition shadow-lg">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <div className="relative w-20 h-20 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition hover:border-purple-400 hover:bg-purple-50/20"
                                style={{ borderColor: "#DDD6FE", backgroundColor: "#F5F3FF" }}>
                                <div className="flex flex-col items-center gap-1" style={{ color: "#A78BFA" }}>
                                    <Plus size={18} strokeWidth={2.5} />
                                    <span className="text-[9px] font-bold uppercase">Thêm ảnh</span>
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
