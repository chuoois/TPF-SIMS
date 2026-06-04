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
    PRODUCT_TYPES,
} from "../mockData";
import importService from "@/services/import.service";
import { uploadImage } from "@/services/cloudinary.service";

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
    requestedQty: null, // Số lượng tối đa từ yêu cầu (null = không giới hạn)
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
    requestedQty: null, // Số lượng tối đa từ yêu cầu (null = không giới hạn)
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
    const [activeRequestId, setActiveRequestId] = useState(null);
    const [activeDropdown, setActiveDropdown] = useState({ id: null, field: null });

    // Yêu cầu nhập hàng data & state
    const [mergedRequests, setMergedRequests] = useState([]);
    const [expandedRequests, setExpandedRequests] = useState({});
    const [selectedRequestItems, setSelectedRequestItems] = useState({});
    const [requestSearchTerm, setRequestSearchTerm] = useState("");
    const [requestsLoading, setRequestsLoading] = useState(false);

    // Submit state
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                setRequestsLoading(true);
                const res = await importService.getImportRequests();
                setMergedRequests(res.data || []);
            } catch (err) {
                console.error("Lỗi tải yêu cầu nhập:", err);
                toast.error("Không thể tải danh sách yêu cầu nhập hàng");
            } finally {
                setRequestsLoading(false);
            }
        };
        fetchRequests();
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
            const lineToRemove = prev.find(l => l._id === id);
            const newList = prev.filter(l => l._id !== id);

            if (newList.length === 0) {
                setActiveRequestId(null);
                setSupplier("");
            }

            if (lineToRemove?.imagePreviews) {
                lineToRemove.imagePreviews.forEach(p => URL.revokeObjectURL(p));
            }
            return newList;
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
    const handleSelectAllInRequest = (req, checked) => {
        const newSelected = { ...selectedRequestItems };
        req.items.forEach(item => {
            const itemKey = `${req.id}_${item.id}`;
            newSelected[itemKey] = checked ? item : undefined;
        });
        setSelectedRequestItems(newSelected);
    };

    const handleAddSelectedItems = () => {
        const selectedItemsEntries = Object.entries(selectedRequestItems).filter(([k, v]) => v !== undefined);
        if (selectedItemsEntries.length === 0) {
            toast.error("Vui lòng chọn ít nhất 1 mặt hàng!");
            return;
        }

        const selectedReqIds = [...new Set(selectedItemsEntries.map(([k]) => k.split('_')[0]))];

        if (selectedReqIds.length > 1) {
            toast.error("Chỉ được chọn mặt hàng từ cùng 1 yêu cầu trong mỗi lần thêm!");
            return;
        }

        const reqId = selectedReqIds[0];

        // So sánh dụng String() để tránh type mismatch (API trả về id là integer, key là string)
        if (activeRequestId && String(activeRequestId) !== String(reqId)) {
            toast.error("Mỗi phiếu nhập chỉ áp dụng cho 01 yêu cầu duy nhất để đảm bảo chính xác thông tin xưởng.");
            return;
        }

        const selectedItems = selectedItemsEntries.map(([k, v]) => v);

        // Tự động gán xưởng và khóa yêu cầu
        if (!activeRequestId) {
            setActiveRequestId(reqId);
            // Dùng String() để so sánh đúng với cả integer id từ API lẫn string id từ mock
            const request = mergedRequests.find(r => String(r.id) === String(reqId));
            if (request) {
                setSupplier(request.supplier || request.createdBy || "Xưởng hệ thống");
            } else {
                setSupplier("Xưởng hệ thống"); // fallback an toàn
            }
        }

        const newLines = selectedItems.map(p => {
            // requestedQty: dùng null nếu không có (không giới hạn), chứ không default về 1
            const requestedQty = (p.requestedQty != null && p.requestedQty > 0) ? p.requestedQty : null;
            const qtyToImport = requestedQty || 1;

            // Parse kích thước từ p.size (API trả về object { length, width, height })
            const sizeObj = p.size && typeof p.size === "object" ? p.size : {};
            const parsedLength = sizeObj.length ?? "";
            const parsedWidth  = sizeObj.width  ?? "";
            const parsedHeight = sizeObj.height ?? "";

            if (p.isBundle) {
                const newBundle = emptyBundle();
                newBundle._id = Math.random();
                newBundle.manufacturingOrderItemId = p.id; // pk_manufacturing_order_item_id
                newBundle.bundleCode = p.bundleCode || p.productCode || "";
                newBundle.bundleName = p.bundleName || p.productName;
                newBundle.category = p.category || "";
                newBundle.materialType = p.materialType || "";
                newBundle.color = p.color || "";
                newBundle.productType = p.productType || "FINISHED";
                // Lưu ảnh hiện có từ yêu cầu nhập (dùng khi không upload ảnh mới)
                newBundle.existingImgUrl = p.productImg || null;
                // Gán kích thước bộ từ yêu cầu nhập
                newBundle.length = parsedLength;
                newBundle.width  = parsedWidth;
                newBundle.height = parsedHeight;
                newBundle.bundleQty = qtyToImport;
                newBundle.requestedQty = requestedQty; // Giới hạn số lượng tối đa (null = không giới hạn)
                newBundle.bundlePrice = p.estimatedPrice || "";
                // Normalize bundleItems: API có thể trả về sub-items với field 'quantity' hoặc 'qty'
                const subItems = p.bundleItems || p.items || [];
                newBundle.items = subItems.length > 0
                    ? subItems.map(it => ({
                        ...it,
                        _id: Math.random(),
                        // Chuẩn hóa field: bundleItems từ API dùng 'quantity', emptyBundleItem dùng 'qty'
                        qty: it.qty ?? it.quantity ?? 1,
                        name: it.name || "",
                        productNote: "",
                    }))
                    : [emptyBundleItem()];
                if (qtyToImport > 0 && newBundle.bundleCode) {
                    newBundle.unitIds = generateBundleUnitIds({ ...newBundle, bundleCode: newBundle.bundleCode }, qtyToImport);
                }
                return newBundle;
            } else {
                const newLine = emptyLine();
                newLine._id = Math.random();
                newLine.manufacturingOrderItemId = p.id; // pk_manufacturing_order_item_id
                newLine.productCode = p.productCode || "";
                newLine.productName = p.productName;
                newLine.category = p.category || "";
                newLine.materialType = p.materialType || "";
                newLine.color = p.color || "";
                newLine.productType = p.productType || "FINISHED";
                // Lưu ảnh hiện có từ yêu cầu nhập (dùng khi không upload ảnh mới)
                newLine.existingImgUrl = p.productImg || null;
                // Gán kích thước từ yêu cầu nhập (API trả về dạng object)
                newLine.length = parsedLength;
                newLine.width  = parsedWidth;
                newLine.height = parsedHeight;
                newLine.qty = qtyToImport;
                newLine.requestedQty = requestedQty; // Giới hạn số lượng tối đa (null = không giới hạn)
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
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!importDate) { toast.error("Vui lòng chọn ngày nhập"); return; }

        // Không cho nhập ngày tương lai quá 7 ngày hoặc quá khứ quá 1 năm
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const selectedDate = new Date(importDate);
        const diffDays = (selectedDate - today) / (1000 * 60 * 60 * 24);
        if (diffDays > 7) { toast.error("Ngày nhập không được vượt quá 7 ngày so với hôm nay"); return; }
        if (diffDays < -365) { toast.error("Ngày nhập không được cách hôm nay quá 1 năm"); return; }

        if (lines.length === 0) { toast.error("Vui lòng thêm ít nhất 1 mặt hàng vào phiếu"); return; }
        if (note && note.length > 500) { toast.error("Ghi chú không được vượt quá 500 ký tự"); return; }

        for (const l of lines) {
            if (l.isBundle) {
                if (!l.bundleName.trim()) { toast.error("Vui lòng nhập tên bộ sản phẩm"); return; }
                const bQty = Number(l.bundleQty);
                if (!l.bundleQty || bQty <= 0) { toast.error(`Bộ "${l.bundleName}": Số bộ phải lớn hơn 0`); return; }
                if (!Number.isInteger(bQty)) { toast.error(`Bộ "${l.bundleName}": Số bộ phải là số nguyên`); return; }
                if (l.requestedQty !== null && bQty > l.requestedQty) {
                    toast.error(`Bộ "${l.bundleName}": Số lượng nhập (${bQty}) không được vượt quá số lượng yêu cầu (${l.requestedQty})`);
                    return;
                }
                if (!l.bundlePrice || Number(l.bundlePrice) <= 0) { toast.error(`Bộ "${l.bundleName}": Giá bộ phải lớn hơn 0`); return; }
                if (l.items.length === 0) { toast.error(`Bộ "${l.bundleName}": Cần có ít nhất 1 món lẻ`); return; }
                const hasEmptyItem = l.items.some(it => !it.name.trim());
                if (hasEmptyItem) { toast.error(`Bộ "${l.bundleName}": Vui lòng nhập tên cho tất cả các món lẻ`); return; }
            } else {
                if (!l.productName.trim()) { toast.error("Vui lòng nhập tên sản phẩm"); return; }
                const pQty = Number(l.qty);
                if (!l.qty || pQty <= 0) { toast.error(`Sản phẩm "${l.productName}": Số lượng phải lớn hơn 0`); return; }
                if (!Number.isInteger(pQty)) { toast.error(`Sản phẩm "${l.productName}": Số lượng phải là số nguyên`); return; }
                if (l.requestedQty !== null && pQty > l.requestedQty) {
                    toast.error(`Sản phẩm "${l.productName}": Số lượng nhập (${pQty}) không được vượt quá số lượng yêu cầu (${l.requestedQty})`);
                    return;
                }
                if (!l.importPrice || Number(l.importPrice) <= 0) { toast.error(`Sản phẩm "${l.productName}": Giá gốc phải lớn hơn 0`); return; }
            }
        }

        // Kiểm tra duplicate unitIds trong toàn bộ phiếu
        const allUnitIds = lines.flatMap(l => l.unitIds || []).filter(Boolean);
        const uniqueUnitIds = new Set(allUnitIds);
        if (uniqueUnitIds.size !== allUnitIds.length) {
            const seen = {};
            const dup = allUnitIds.find(id => (seen[id] ? true : (seen[id] = true) && false));
            toast.error(`Mã định danh "${dup}" bị trùng lặp trong phiếu, vui lòng kiểm tra lại`);
            return;
        }

        try {
            setSubmitting(true);

            // 1. Upload ảnh chứng từ lên Cloudinary (nếu có)
            let invoiceImgUrl = null;
            if (invoiceFile) {
                const uploadToast = toast.loading("Đang tải ảnh chứng từ...");
                try {
                    const uploaded = await uploadImage(invoiceFile);
                    invoiceImgUrl = uploaded.url;
                    toast.dismiss(uploadToast);
                } catch (uploadErr) {
                    toast.dismiss(uploadToast);
                    toast.error("Tải ảnh chứng từ thất bại, tiếp tục lưu không có ảnh");
                }
            }

            // 1b. Upload ảnh sản phẩm từng dòng lên Cloudinary (lấy ảnh đầu tiên)
            // Nếu không có file mới, fallback sang ảnh hiện có từ yêu cầu nhập (existingImgUrl)
            const linesWithImgUrl = await Promise.all(lines.map(async (l) => {
                const firstFile = l.imageFiles?.[0] || null;
                if (!firstFile) return { ...l, productImgUrl: l.existingImgUrl || null };
                try {
                    const uploaded = await uploadImage(firstFile);
                    return { ...l, productImgUrl: uploaded.url };
                } catch {
                    return { ...l, productImgUrl: l.existingImgUrl || null };
                }
            }));

            // 2. Tìm manufacturingOrderId từ request đang active
            const activeReq = mergedRequests.find(r => String(r.id) === String(activeRequestId));
            const manufacturingOrderId = activeReq?.id || null;

            // 3. Gửi dữ liệu về backend
            const payload = {
                importDate,
                supplier,
                note: note || null,
                invoiceImgUrl,
                manufacturingOrderId,
                lines: linesWithImgUrl.map(l => ({
                    id: l.manufacturingOrderItemId || null, // pk_manufacturing_order_item_id để backend liên kết OrderItem
                    isBundle: l.isBundle,
                    // Dòng lẻ — gửi null khi là bundle để tránh Joi min(1) fail với giá trị 0
                    productId: l.productId || null,
                    productCode: l.productCode || "",
                    productName: l.productName || "",
                    qty: l.isBundle ? null : (Number(l.qty) || null),
                    importPrice: l.isBundle ? null : (Number(l.importPrice) || null),
                    unitIds: l.isBundle ? [] : (l.unitIds || []),
                    details: l.details || "",
                    // Thông tin chi tiết sản phẩm (để tạo Product mới đầy đủ)
                    category: l.category || "",
                    materialType: l.materialType || "",
                    color: l.color || "",
                    productType: l.productType || "FINISHED",
                    productImgUrl: l.productImgUrl || null, // URL ảnh sản phẩm đã upload
                    // Dòng bộ — gửi null khi là single line để tránh Joi min(1) fail với giá trị 0
                    bundleCode: l.bundleCode || "",
                    bundleName: l.bundleName || "",
                    bundleQty: l.isBundle ? (Number(l.bundleQty) || null) : null,
                    bundlePrice: l.isBundle ? (Number(l.bundlePrice) || null) : null,
                    bundleUnitIds: l.isBundle ? (l.unitIds || []) : [],
                    items: l.isBundle ? (l.items || []) : [],
                })),
            };

            await importService.createImportReceipt(payload);

            toast.success("Tạo phiếu nhập thành công!", { duration: 4000, style: { fontSize: "13px" } });
            onSaved?.({ supplier, importDate, invoiceImgUrl, note, lines, grandTotal });
            onClose();
        } catch (err) {
            console.error("Submit import error:", err);
            const msg = err?.response?.data?.message || "Tạo phiếu nhập thất bại, vui lòng thử lại";
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    // Shared styles
    const inp = "w-full h-9 px-3 rounded-lg text-[13px] border focus:outline-none focus:ring-2 focus:ring-purple-300 transition";
    const inpS = { borderColor: "var(--grid-border)", backgroundColor: "#fff", color: "var(--text-main)" };
    const lbl = "block text-[11px] font-bold uppercase tracking-wider mb-1";
    const lblS = { color: "var(--text-placeholder)" };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden" style={{ maxWidth: "1100px", maxHeight: "90vh" }}>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b shrink-0" style={{ borderColor: "var(--grid-border)", background: "linear-gradient(135deg,#F5F3FF 0%,#fff 100%)" }}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "var(--brand-primary)" }}>
                            <Package size={18} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-[16px] font-bold" style={{ color: "var(--text-main)" }}>Tạo Phiếu Nhập Kho</h2>
                            <p className="text-[11px] mt-0.5" style={{ color: "var(--text-placeholder)" }}>Chọn mặt hàng từ yêu cầu · Điều chỉnh số lượng · Giá lấy tự động từ yêu cầu</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition" style={{ color: "var(--text-secondary)" }}>
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden flex-1">

                    {/* ── Info bar (ngày + chứng từ + xưởng) ── */}
                    <div className="px-6 py-3 border-b shrink-0 flex items-center gap-4 flex-wrap" style={{ borderColor: "var(--grid-border)", backgroundColor: "var(--bg-main)" }}>
                        {/* Ngày */}
                        <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-gray-400 shrink-0" />
                            <label className="text-[12px] font-bold text-gray-500 whitespace-nowrap">Ngày nhập:</label>
                            <input type="date" value={importDate} onChange={(e) => setImportDate(e.target.value)}
                                className="h-8 px-3 rounded-lg text-[13px] border focus:outline-none focus:ring-2 focus:ring-purple-300 transition"
                                style={{ borderColor: "var(--grid-border)", backgroundColor: "#fff" }} />
                        </div>
                        {/* Xưởng (auto) */}
                        {supplier && (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-200 shadow-sm">
                                <Building2 size={13} className="text-purple-600 shrink-0" />
                                <span className="text-[13px] font-bold text-purple-700">{supplier}</span>
                                <span className="text-[10px] text-purple-400 font-medium">(tự động từ YC)</span>
                            </div>
                        )}
                        {/* Chứng từ */}
                        <div className="flex items-center gap-2 ml-auto">
                            <FileImage size={14} className="text-gray-400 shrink-0" />
                            <label className="text-[12px] font-bold text-gray-500 whitespace-nowrap">Chứng từ:</label>
                            <div onClick={() => fileRef.current?.click()}
                                className="relative cursor-pointer rounded-lg border-2 border-dashed flex items-center justify-center transition hover:border-purple-400 h-8 px-3 min-w-[140px]"
                                style={{ borderColor: invoicePreview ? "var(--brand-primary)" : "var(--grid-border)", backgroundColor: "#fff" }}>
                                {invoicePreview
                                    ? <div className="flex items-center gap-2">
                                        <img src={invoicePreview} alt="HĐ" className="h-5 w-5 rounded object-cover" />
                                        <span className="text-[11px] font-medium text-purple-600 truncate max-w-[100px]">{invoiceFile?.name}</span>
                                        <button type="button" onClick={(e) => { e.stopPropagation(); setInvoiceFile(null); setInvoicePreview(null); }}
                                            className="text-red-400 hover:text-red-600 transition"><X size={12} /></button>
                                    </div>
                                    : <div className="flex items-center gap-1.5 text-gray-400">
                                        <Upload size={13} /><span className="text-[11px]">Tải ảnh bằng chứng</span>
                                    </div>}
                            </div>
                            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                        </div>
                    </div>

                    {/* ── 2-column body ── */}
                    <div className="flex flex-1 overflow-hidden">

                        {/* ── LEFT: Chọn từ yêu cầu ── */}
                        <div className="flex flex-col border-r shrink-0" style={{ width: "420px", borderColor: "var(--grid-border)" }}>
                            {/* Header left */}
                            <div className="px-4 py-3 border-b shrink-0 flex items-center gap-2" style={{ borderColor: "var(--grid-border)", backgroundColor: "#F9F9FF" }}>
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-[10px] font-black" style={{ backgroundColor: "var(--brand-primary)" }}>1</span>
                                <p className="text-[12px] font-bold uppercase tracking-widest" style={{ color: "var(--brand-primary)" }}>Chọn từ yêu cầu nhập</p>
                            </div>

                            {/* Search */}
                            <div className="px-4 pt-3 pb-2 shrink-0">
                                <div className="relative">
                                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input type="text" placeholder="Tìm mã yêu cầu hoặc ghi chú..."
                                        value={requestSearchTerm} onChange={e => setRequestSearchTerm(e.target.value)}
                                        className="w-full text-[13px] h-9 pl-8 pr-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-300 transition"
                                        style={{ borderColor: "var(--grid-border)" }} />
                                </div>
                            </div>

                            {/* Request list */}
                            <div className="flex-1 overflow-y-auto px-4 pb-3 space-y-2 custom-scrollbar">
                                {requestsLoading ? (
                                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                                        <div className="w-7 h-7 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                                        <span className="text-[12px] text-gray-400">Đang tải yêu cầu...</span>
                                    </div>
                                ) : mergedRequests
                                    .filter(r => r.status === "PENDING" || r.status === "Chờ xử lý" || r.status === "Chờ sản xuất" || r.status === "Đang gia công")
                                    .filter(r => (r.requestCode || "").toLowerCase().includes(requestSearchTerm.toLowerCase()) || (r.note || "").toLowerCase().includes(requestSearchTerm.toLowerCase()))
                                    .map(req => {
                                        const isExpanded = expandedRequests[req.id];
                                        const isDisabled = activeRequestId && activeRequestId !== req.id;
                                        const selectedCount = req.items.filter(item => !!selectedRequestItems[`${req.id}_${item.id}`]).length;
                                        return (
                                            <div key={req.id} className={`border rounded-xl bg-white overflow-hidden transition-all shadow-sm ${isDisabled ? "opacity-35 grayscale pointer-events-none" : ""}`} style={{ borderColor: isExpanded ? "#7C3AED" : "var(--grid-border)" }}>
                                                {/* Request header */}
                                                <div className="px-4 py-3 cursor-pointer hover:bg-purple-50/50 flex items-center justify-between"
                                                    onClick={() => setExpandedRequests(p => ({ ...p, [req.id]: !p[req.id] }))}>
                                                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-[13px] text-purple-700">{req.requestCode}</span>
                                                            <span className="text-[11px] font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{req.date}</span>
                                                            {req.supplier && <span className="text-[11px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 truncate max-w-[100px]">{req.supplier}</span>}
                                                        </div>
                                                        <span className="text-[12px] text-gray-500 truncate">{req.note}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 shrink-0 ml-2">
                                                        {selectedCount > 0 && <span className="text-[10px] font-black bg-purple-600 text-white px-1.5 py-0.5 rounded-full">{selectedCount}</span>}
                                                        <span className="text-[11px] text-gray-400">({req.items?.length || 0})</span>
                                                        <ChevronDown size={15} className={`text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                                                    </div>
                                                </div>

                                                {isExpanded && (
                                                    <div className="border-t" style={{ borderColor: "#EDE9FE", backgroundColor: "#FAFAFF" }}>
                                                        {/* Select all */}
                                                        <div className="px-4 py-2 flex items-center justify-between border-b" style={{ borderColor: "#EDE9FE" }}>
                                                            <label className="flex items-center gap-2 cursor-pointer">
                                                                <input type="checkbox" className="w-3.5 h-3.5 rounded text-purple-600 border-gray-300 focus:ring-purple-500"
                                                                    checked={req.items.every(item => !!selectedRequestItems[`${req.id}_${item.id}`])}
                                                                    onChange={(e) => handleSelectAllInRequest(req, e.target.checked)} />
                                                                <span className="text-[11px] font-bold text-gray-600 uppercase tracking-tight">Chọn tất cả ({req.items.length})</span>
                                                            </label>
                                                        </div>
                                                        {/* Items */}
                                                        <div className="flex flex-col divide-y" style={{ divideColor: "#EDE9FE" }}>
                                                            {req.items.map(item => {
                                                                const itemKey = `${req.id}_${item.id}`;
                                                                const isChecked = !!selectedRequestItems[itemKey];
                                                                return (
                                                                    <label key={item.id} className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors ${isChecked ? "bg-purple-50/70" : "hover:bg-gray-50/80"}`}>
                                                                        <input type="checkbox" className="w-4 h-4 mt-0.5 text-purple-600 rounded border-gray-300 focus:ring-purple-500 cursor-pointer shrink-0"
                                                                            checked={isChecked}
                                                                            onChange={(e) => setSelectedRequestItems(p => ({ ...p, [itemKey]: e.target.checked ? item : undefined }))} />
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="text-[13px] font-bold text-gray-800 leading-tight">{item.productName || item.bundleName}</div>
                                                                            <div className="flex flex-wrap gap-1 mt-1">
                                                                                {item.materialType && <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium">{item.materialType}</span>}
                                                                                {item.color && <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium">{item.color}</span>}
                                                                                {item.category && <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium border border-blue-100">{item.category}</span>}
                                                                            </div>
                                                                            {item.details && <div className="text-[11px] text-gray-400 mt-0.5 italic truncate">{item.details}</div>}
                                                                            {item.estimatedPrice > 0 && (
                                                                                <div className="text-[11px] text-green-700 font-bold mt-1">
                                                                                    💰 Giá YC: {new Intl.NumberFormat("vi-VN").format(item.estimatedPrice)}₫
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <div className="shrink-0 flex flex-col items-end gap-1">
                                                                            <div className="flex items-center gap-1 bg-purple-50 px-2 py-1 rounded-md border border-purple-100">
                                                                                <span className="text-[10px] text-purple-500 font-medium">SL:</span>
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
                                        );
                                    })}
                                {mergedRequests.filter(r => r.status === "PENDING" || r.status === "Chờ xử lý" || r.status === "Chờ sản xuất" || r.status === "Đang gia công")
                                    .filter(r => (r.requestCode || "").toLowerCase().includes(requestSearchTerm.toLowerCase()) || (r.note || "").toLowerCase().includes(requestSearchTerm.toLowerCase())).length === 0 && !requestsLoading && (
                                        <div className="p-8 text-center text-gray-400 border border-dashed rounded-xl text-[12px] bg-gray-50/50 mt-2">
                                            Không tìm thấy yêu cầu nào phù hợp.
                                        </div>
                                    )}
                            </div>

                            {/* ── Add button – luôn hiện, không bị khuất ── */}
                            <div className="px-4 py-3 border-t shrink-0" style={{ borderColor: "var(--grid-border)", backgroundColor: "#F9F9FF" }}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[11px] text-gray-500 italic">
                                        Đã chọn <strong className="text-purple-700">{Object.values(selectedRequestItems).filter(i => i !== undefined).length}</strong> mặt hàng
                                    </span>
                                </div>
                                <button type="button" onClick={handleAddSelectedItems}
                                    disabled={Object.values(selectedRequestItems).filter(i => i !== undefined).length === 0}
                                    className="w-full h-10 rounded-xl text-[13px] font-bold border transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                                    style={{ borderColor: "var(--brand-primary)", backgroundColor: "var(--brand-primary)", color: "#fff" }}>
                                    <Plus size={16} strokeWidth={2.5} />
                                    Thêm vào phiếu nhập ({Object.values(selectedRequestItems).filter(i => i !== undefined).length})
                                </button>
                            </div>
                        </div>

                        {/* ── RIGHT: Phiếu nhập ── */}
                        <div className="flex flex-col flex-1 overflow-hidden">
                            {/* Header right */}
                            <div className="px-5 py-3 border-b shrink-0 flex items-center justify-between" style={{ borderColor: "var(--grid-border)", backgroundColor: "#F9FFF9" }}>
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-[10px] font-black bg-green-600">2</span>
                                    <p className="text-[12px] font-bold uppercase tracking-widest text-green-700">Phiếu nhập ({lines.length} mặt hàng)</p>
                                </div>
                                {grandTotal > 0 && (
                                    <div className="px-3 py-1 rounded-lg text-right" style={{ backgroundColor: "#F5F3FF", border: "1px solid #DDD6FE" }}>
                                        <span className="text-[10px] font-bold uppercase text-violet-500">Tổng</span>
                                        <span className="text-[15px] font-black text-violet-700 ml-2">{new Intl.NumberFormat("vi-VN").format(grandTotal)}₫</span>
                                    </div>
                                )}
                            </div>

                            {/* Lines list */}
                            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 custom-scrollbar">
                                {lines.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center">
                                        <Package size={40} className="mb-3 text-gray-200" />
                                        <p className="text-[14px] font-semibold text-gray-400">Chưa có mặt hàng nào</p>
                                        <p className="text-[12px] text-gray-300 mt-1">Chọn từ yêu cầu bên trái và nhấn "Thêm vào phiếu nhập"</p>
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
                                            canRemove={true}
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
                                            canRemove={true}
                                            lineTotal={lineTotal(line)}
                                            activeDropdown={activeDropdown}
                                            setActiveDropdown={setActiveDropdown}
                                            inp={inp} inpS={inpS} lbl={lbl} lblS={lblS}
                                            fmtCurrency={fmtCurrency} formatNumber={formatNumber} parseNumber={parseNumber}
                                        />
                                )}
                            </div>

                            {/* Footer */}
                            <div className="px-5 py-4 border-t shrink-0 flex items-center justify-end gap-3" style={{ borderColor: "var(--grid-border)", backgroundColor: "var(--bg-main)" }}>
                                <button type="button" onClick={onClose}
                                    className="h-10 px-6 rounded-xl text-[13px] font-bold border cursor-pointer hover:bg-gray-50 transition"
                                    style={{ borderColor: "var(--grid-border)", color: "var(--text-secondary)" }}>
                                    Hủy
                                </button>
                                <button type="submit"
                                    disabled={submitting}
                                    className="h-10 px-8 rounded-xl text-[13px] font-bold cursor-pointer hover:opacity-90 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                                    style={{ backgroundColor: "var(--brand-primary)", color: "#fff" }}>
                                    {submitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                            Đang lưu...
                                        </>
                                    ) : "Lưu Phiếu Nhập"}
                                </button>
                            </div>
                        </div>
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
                        <label className={lbl} style={lblS}>
                            Số lượng nhập
                            {line.requestedQty !== null && (
                                <span className="ml-1 font-normal normal-case" style={{ color: "var(--text-placeholder)" }}>
                                    (tối đa: <span className="font-bold text-purple-600">{line.requestedQty}</span>)
                                </span>
                            )}
                        </label>
                        <input
                            type="number"
                            value={line.qty}
                            min={1}
                            max={line.requestedQty !== null ? line.requestedQty : undefined}
                            onChange={(e) => onUpdate("qty", parseNumber(e.target.value))}
                            className={inp}
                            style={{ ...inpS, borderColor: line.requestedQty !== null && Number(line.qty) > line.requestedQty ? "#EF4444" : "#7C3AED" }}
                        />
                        {line.requestedQty !== null && Number(line.qty) > line.requestedQty && (
                            <p className="text-[11px] text-red-500 mt-1 font-medium">⚠️ Vượt quá số lượng yêu cầu ({line.requestedQty})</p>
                        )}
                    </div>
                    <div>
                        {line.manufacturingOrderItemId ? (
                            // Giá từ yêu cầu → read-only, tự tính thành tiền
                            <>
                                <label className={lbl} style={lblS}>
                                    Đơn giá (₫)
                                    <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-black uppercase" style={{ backgroundColor: "#EDE9FE", color: "#6D28D9" }}>🔒 Từ YC</span>
                                </label>
                                <div className="h-9 px-3 rounded-lg text-[13px] flex items-center font-bold select-none"
                                    style={{ border: "1px solid #DDD6FE", backgroundColor: "#F5F3FF", color: "#6D28D9" }}>
                                    {formatNumber(line.importPrice)}₫
                                </div>
                                {Number(line.qty) > 0 && Number(line.importPrice) > 0 && (
                                    <div className="mt-1.5 flex items-center gap-1.5 px-2 py-1 rounded-md" style={{ backgroundColor: "#F0FDF4", border: "1px solid #BBF7D0" }}>
                                        <span className="text-[10px] text-green-600 font-medium">Thành tiền:</span>
                                        <span className="text-[13px] font-black text-green-700">{fmtCurrency(Number(line.importPrice) * Number(line.qty))}</span>
                                    </div>
                                )}
                            </>
                        ) : (
                            // Nhập thủ công → cho sửa giá
                            <>
                                <label className={lbl} style={lblS}>Giá gốc nhập (₫) *</label>
                                <input type="text" value={formatNumber(line.importPrice)}
                                    onChange={(e) => onUpdate("importPrice", parseNumber(e.target.value))}
                                    className={inp} style={{ ...inpS, borderColor: "#7C3AED" }} />
                                {Number(line.qty) > 0 && Number(line.importPrice) > 0 && (
                                    <div className="mt-1.5 flex items-center gap-1.5 px-2 py-1 rounded-md" style={{ backgroundColor: "#F0FDF4", border: "1px solid #BBF7D0" }}>
                                        <span className="text-[10px] text-green-600 font-medium">Thành tiền:</span>
                                        <span className="text-[13px] font-black text-green-700">{fmtCurrency(Number(line.importPrice) * Number(line.qty))}</span>
                                    </div>
                                )}
                            </>
                        )}
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

            {/* Line total – ẩn khi đã hiển thị inline trong ô giá */}
            {lineTotal > 0 && !line.manufacturingOrderItemId && !line.importPrice && (
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
                <div className="px-4 py-3 rounded-lg space-y-2" style={{ backgroundColor: "#F0FDF4", border: "1px solid #BBF7D0" }}>
                    <div className="flex items-center gap-2 flex-wrap">
                        <CheckCircle size={15} style={{ color: "#15803D" }} />
                        <span className="text-[14px] font-bold text-gray-800 mr-2">{bundle.bundleName}</span>
                        <span className="text-[12px] font-semibold" style={{ color: "#15803D" }}>Thuộc tính bộ:</span>
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white ml-1 font-mono border" style={{ borderColor: "#BBF7D0" }}>{bundle.bundleCode}</span>
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white ml-1 border" style={{ borderColor: "#BBF7D0" }}>{bundle.category}</span>
                        {bundle.materialType && <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white ml-1 border" style={{ borderColor: "#BBF7D0" }}>{bundle.materialType} {bundle.color && `- ${bundle.color}`}</span>}
                    </div>
                    {/* Kích thước bộ (nếu có) */}
                    {(bundle.length || bundle.width || bundle.height) && (
                        <div className="flex items-center gap-1.5 text-[12px]" style={{ color: "#15803D" }}>
                            <span className="font-semibold">Kích thước (D×R×C):</span>
                            <span className="font-bold px-2 py-0.5 rounded bg-white border" style={{ borderColor: "#BBF7D0", fontFamily: "monospace" }}>
                                {bundle.length || "0"} × {bundle.width || "0"} × {bundle.height || "0"} cm
                            </span>
                        </div>
                    )}
                </div>


                {/* ── Row 2: Số bộ + Giá cả bộ ── */}
                <div className="grid gap-3 grid-cols-2 mt-2">
                    <div>
                        <label className={lbl} style={lblS}>
                            Số bộ nhập
                            {bundle.requestedQty !== null && (
                                <span className="ml-1 font-normal normal-case" style={{ color: "var(--text-placeholder)" }}>
                                    (tối đa: <span className="font-bold text-purple-600">{bundle.requestedQty}</span>)
                                </span>
                            )}
                        </label>
                        <input
                            type="number"
                            value={bundle.bundleQty}
                            min={1}
                            max={bundle.requestedQty !== null ? bundle.requestedQty : undefined}
                            onChange={(e) => onUpdate("bundleQty", parseNumber(e.target.value))}
                            className={inp}
                            style={{ ...inpS, borderColor: bundle.requestedQty !== null && Number(bundle.bundleQty) > bundle.requestedQty ? "#EF4444" : "#7C3AED" }}
                        />
                        {bundle.requestedQty !== null && Number(bundle.bundleQty) > bundle.requestedQty && (
                            <p className="text-[11px] text-red-500 mt-1 font-medium">⚠️ Vượt quá số lượng yêu cầu ({bundle.requestedQty})</p>
                        )}
                    </div>
                    <div>
                        {bundle.manufacturingOrderItemId ? (
                            // Giá bộ từ yêu cầu → read-only, tự tính thành tiền
                            <>
                                <label className={lbl} style={lblS}>
                                    <span className="text-purple-600">Giá mỗi bộ (₫)</span>
                                    <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-black uppercase" style={{ backgroundColor: "#EDE9FE", color: "#6D28D9" }}>🔒 Từ YC</span>
                                </label>
                                <div className="h-9 px-3 rounded-lg text-[13px] flex items-center font-bold select-none"
                                    style={{ border: "1px solid #DDD6FE", backgroundColor: "#F5F3FF", color: "#6D28D9" }}>
                                    {formatNumber(bundle.bundlePrice)}₫
                                </div>
                                {Number(bundle.bundleQty) > 0 && Number(bundle.bundlePrice) > 0 && (
                                    <div className="mt-1.5 flex items-center gap-1.5 px-2 py-1 rounded-md" style={{ backgroundColor: "#F0FDF4", border: "1px solid #BBF7D0" }}>
                                        <span className="text-[10px] text-green-600 font-medium">Thành tiền:</span>
                                        <span className="text-[13px] font-black text-green-700">{fmtCurrency(Number(bundle.bundlePrice) * Number(bundle.bundleQty))}</span>
                                    </div>
                                )}
                            </>
                        ) : (
                            // Nhập thủ công → cho sửa giá
                            <>
                                <label className={lbl} style={{ ...lblS }}><span className="text-purple-600">Giá cả bộ (₫) *</span></label>
                                <input type="text" value={formatNumber(bundle.bundlePrice)}
                                    onChange={(e) => onUpdate("bundlePrice", parseNumber(e.target.value))}
                                    placeholder="Nhập giá bộ..."
                                    className={inp}
                                    style={{ ...inpS, borderColor: Number(bundle.bundlePrice) <= 0 ? "#EF4444" : "#7C3AED" }} />
                                {Number(bundle.bundlePrice) <= 0 && (
                                    <p className="text-[11px] text-red-500 mt-1 font-medium">⚠️ Giá bộ chưa được nhập hoặc bằng 0</p>
                                )}
                                {Number(bundle.bundleQty) > 0 && Number(bundle.bundlePrice) > 0 && (
                                    <div className="mt-1.5 flex items-center gap-1.5 px-2 py-1 rounded-md" style={{ backgroundColor: "#F0FDF4", border: "1px solid #BBF7D0" }}>
                                        <span className="text-[10px] text-green-600 font-medium">Thành tiền:</span>
                                        <span className="text-[13px] font-black text-green-700">{fmtCurrency(Number(bundle.bundlePrice) * Number(bundle.bundleQty))}</span>
                                    </div>
                                )}
                            </>
                        )}
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

                {/* Bundle total – ẩn khi đã hiển thị inline trong ô giá */}
                {lineTotal > 0 && !bundle.manufacturingOrderItemId && (
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
