import { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import couponService from "@/services/coupon.service";
import productService from "@/services/product.service";
import { PageHelmet } from "@/components/seo/PageHelmet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Tag, ChevronRight, RefreshCw, Percent, Banknote,
    Calendar, Package, PackageCheck, Hammer, X, Check, Loader2, Info,
    Sparkles, HelpCircle, Search, ChevronLeft,
    AlertCircle, Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

// ─── Constants (synced with sales invoice-instock page) ───────────────────
const WOOD_FINISHING_RATE = 1.35; // Giá hoàn thiện = giá thô × 1.35

const CATEGORIES = ["Tất cả"];
const MODAL_PAGE_SIZE = 12;

// ─── Helpers ───────────────────────────────────────────────────────────────
const fmtVND = (raw) => {
    if (raw === "" || raw == null) return "";
    const n = parseInt(String(raw).replace(/\D/g, ""), 10);
    return isNaN(n) ? "" : n.toLocaleString("vi-VN");
};
const parseRaw = (v) => parseInt(String(v).replace(/\D/g, ""), 10) || 0;

function generateCode() {
    const prefixes = ["SALE", "OFF", "DEAL", "VIP", "SAVE", "HOT"];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const nums = String(Math.floor(Math.random() * 90) + 10);
    const suffix = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const extra = Array.from({ length: 3 }, () => suffix[Math.floor(Math.random() * suffix.length)]).join("");
    return `${prefix}${nums}${extra}`.slice(0, 20);
}

// ─── Atom UI ───────────────────────────────────────────────────────────────

function SectionCard({ step, title, subtitle, children }) {
    return (
        <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
            <div className="px-6 py-4 border-b flex items-center gap-3" style={{ borderColor: "var(--grid-border)", backgroundColor: "var(--grid-header-bg)" }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[12px] font-black text-white shrink-0"
                    style={{ backgroundColor: "var(--brand-primary)" }}>
                    {step}
                </div>
                <div>
                    <h2 className="text-[14px] font-bold text-gray-800 leading-tight">{title}</h2>
                    {subtitle && <p className="text-[11px] text-gray-400 mt-0.5">{subtitle}</p>}
                </div>
            </div>
            <div className="px-6 py-6 space-y-5">{children}</div>
        </div>
    );
}

function FieldRow({ label, required, hint, tooltip, error, children, half }) {
    return (
        <div className={cn("space-y-1.5", half && "flex-1 min-w-0")}>
            <div className="flex items-center gap-1.5">
                <label className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">
                    {label}{required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {tooltip && (
                    <span className="relative group cursor-help">
                        <HelpCircle size={12} className="text-gray-300 group-hover:text-gray-500 transition" />
                        <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-52 bg-gray-800 text-white text-[11px] rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity z-50 font-normal leading-snug shadow-xl">
                            {tooltip}
                        </span>
                    </span>
                )}
            </div>
            {children}
            {hint && !error && <p className="text-[11px] flex items-center gap-1" style={{ color: "var(--text-placeholder)" }}><Info size={11} className="shrink-0" />{hint}</p>}
            {error && <p className="text-[11px] flex items-center gap-1 text-red-500 animate-in fade-in duration-150"><AlertCircle size={11} className="shrink-0" />{error}</p>}
        </div>
    );
}

// ─── Product Modal (Sales-invoice style) ──────────────────────────────────
function ProductModal({ allProducts, selected, onClose, onConfirm }) {
    const [localSelected, setLocalSelected] = useState(new Set(selected));
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    const filtered = useMemo(() => {
        return allProducts.filter(p => {
            const s = search.toLowerCase();
            const matchSearch = !search.trim() || p.name.toLowerCase().includes(s) || p.sku.toLowerCase().includes(s);
            return matchSearch;
        });
    }, [allProducts, search]);

    const pageCount = Math.max(1, Math.ceil(filtered.length / MODAL_PAGE_SIZE));
    const paged = filtered.slice((page - 1) * MODAL_PAGE_SIZE, page * MODAL_PAGE_SIZE);

    const toggle = (id) => {
        setLocalSelected(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const selectAll = () => setLocalSelected(new Set(allProducts.map(p => p.id)));
    const clearAll = () => setLocalSelected(new Set());

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-lg w-full max-w-3xl shadow-2xl flex flex-col max-h-[88vh] animate-in zoom-in-95 duration-200 overflow-hidden">

                {/* Header */}
                <div className="px-6 py-4 border-b flex items-center justify-between shrink-0" style={{ borderColor: "var(--grid-border)" }}>
                    <div>
                        <h3 className="text-[15px] font-bold text-gray-900">Chọn sản phẩm áp dụng</h3>
                        <p className="text-[12px] text-gray-400 mt-0.5">
                            Đã chọn <strong className="text-emerald-600">{localSelected.size}</strong> / {allProducts.length} sản phẩm
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={selectAll} className="text-[12px] font-bold cursor-pointer" style={{ color: "var(--brand-primary)" }}>Chọn tất cả</button>
                        <span className="text-gray-200">|</span>
                        <button onClick={clearAll} className="text-[12px] font-bold text-gray-400 cursor-pointer hover:text-red-500">Bỏ chọn</button>
                        <button onClick={onClose} className="ml-2 p-2 rounded-xl hover:bg-gray-100 transition cursor-pointer">
                            <X size={18} className="text-gray-400" />
                        </button>
                    </div>
                </div>

                {/* Search bar */}
                <div className="px-4 pt-3 pb-2 space-y-2.5 border-b shrink-0" style={{ borderColor: "var(--grid-border)", backgroundColor: "var(--grid-header-bg)" }}>
                    <div className="flex gap-2 items-center">
                        <div className="relative flex-1">
                            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-placeholder)" }} />
                            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                                placeholder="Tên sản phẩm, mã SKU..."
                                className="w-full h-9 pl-8 pr-8 rounded-lg text-[13px] focus:outline-none focus:ring-1"
                                style={{ border: "1px solid var(--grid-border)", backgroundColor: "#fff" }} />
                            {search && (
                                <button onClick={() => { setSearch(""); setPage(1); }} className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer opacity-50 hover:opacity-100">
                                    <X size={13} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Product card grid */}
                <div className="flex-1 overflow-y-auto px-4 py-4">
                    {paged.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 gap-2" style={{ color: "var(--text-placeholder)" }}>
                            <Package size={28} strokeWidth={1.5} />
                            <p className="text-[13px] font-medium">Không tìm thấy sản phẩm phù hợp</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-3">
                            {paged.map(p => {
                                const out = p.stock <= 0;
                                const low = p.stock > 0 && p.stock <= 3;
                                const sel = localSelected.has(p.id);
                                return (
                                    <button key={p.id} onClick={() => toggle(p.id)}
                                        className={cn(
                                            "group flex flex-col rounded-xl text-left transition-all duration-150 cursor-pointer relative overflow-hidden",
                                            sel ? "ring-2 ring-emerald-500 shadow-md" : out ? "opacity-50 cursor-not-allowed" : "hover:shadow-lg hover:shadow-gray-200/50 hover:-translate-y-0.5"
                                        )}
                                        style={{ border: sel ? "2px solid var(--brand-primary)" : "1px solid var(--grid-border)" }}>

                                        {/* Selected overlay check */}
                                        {sel && (
                                            <div className="absolute top-2 left-2 z-20 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow">
                                                <Check size={10} className="text-white" strokeWidth={3} />
                                            </div>
                                        )}

                                        {/* Stock badge */}
                                        <div className="absolute top-2 right-2 z-10 text-[9px] font-bold px-1.5 py-0.5 rounded-md"
                                            style={{
                                                backgroundColor: out ? "#FEE2E2" : low ? "#FEF3C7" : "var(--status-focus)",
                                                color: out ? "#DC2626" : low ? "#D97706" : "var(--brand-primary)",
                                            }}>
                                            {out ? "Hết hàng" : `Kho: ${p.stock}`}
                                        </div>

                                        {/* Image */}
                                        <div className="aspect-square overflow-hidden bg-gray-50">
                                            <img src={p.image} alt={p.name}
                                                className={cn("w-full h-full object-cover transition-transform duration-500", !out && "group-hover:scale-105",
                                                    sel && "brightness-95")} />
                                        </div>

                                        {/* Info */}
                                        <div className="p-2.5 space-y-0.5">
                                            <p className="text-[12px] font-semibold line-clamp-2 leading-snug min-h-[2.25rem]" style={{ color: "var(--text-main)" }}>
                                                {p.name}
                                            </p>
                                            <p className="text-[10px] truncate" style={{ color: "var(--text-placeholder)" }}>KT: {p.size}</p>
                                            <p className="text-[10px] truncate" style={{ color: "var(--text-placeholder)" }}>Màu: {p.color}</p>
                                            <p className="text-[12px] font-bold" style={{ color: "var(--brand-primary)" }}>
                                                {Number(p.price).toLocaleString("vi-VN")}₫
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Pagination + footer */}
                <div className="px-4 py-3 border-t flex items-center justify-between shrink-0" style={{ borderColor: "var(--grid-border)", backgroundColor: "var(--grid-header-bg)" }}>
                    <div className="flex items-center gap-1.5">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                            className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition hover:bg-gray-200"
                            style={{ border: "1px solid var(--grid-border)" }}><ChevronLeft size={14} /></button>
                        {Array.from({ length: pageCount }, (_, i) => i + 1).map(pg => (
                            <button key={pg} onClick={() => setPage(pg)}
                                className={cn("w-8 h-8 rounded-lg text-[12px] font-bold transition cursor-pointer",
                                    pg === page ? "text-white" : "hover:bg-gray-100 text-gray-600")}
                                style={pg === page ? { backgroundColor: "var(--brand-primary)" } : {}}>{pg}</button>
                        ))}
                        <button onClick={() => setPage(p => Math.min(pageCount, p + 1))} disabled={page === pageCount}
                            className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition hover:bg-gray-200"
                            style={{ border: "1px solid var(--grid-border)" }}><ChevronRight size={14} /></button>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={onClose}
                            className="h-9 px-5 rounded-xl border font-bold text-[13px] text-gray-500 hover:bg-gray-100 transition cursor-pointer"
                            style={{ borderColor: "var(--grid-border)" }}>Hủy</button>
                        <button onClick={() => onConfirm([...localSelected])}
                            className="h-9 px-5 rounded-xl text-white font-bold text-[13px] transition cursor-pointer hover:opacity-90"
                            style={{ backgroundColor: "var(--brand-primary)" }}>
                            Xác nhận ({localSelected.size})
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Main form ─────────────────────────────────────────────────────────────
const INIT = {
    code: "",
    name: "",
    description: "",
    discountType: "percent",   // "percent" | "amount"
    discountValue: "",
    minOrderValue: "",
    usageLimit: "",
    startDate: "",
    endDate: "",
    allProducts: true,
    selectedProducts: [],
    isActive: true,
};

export default function CouponCreatePage() {
    const navigate = useNavigate();
    const { id: editId } = useParams();
    const isEdit = !!editId;
    const [form, setForm] = useState(INIT);
    const [allProducts, setAllProducts] = useState([]);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [loading, setLoading] = useState(false);
    const [showProductModal, setShowProductModal] = useState(false);
    const [codeGenLoading, setCodeGenLoading] = useState(false);

    // Load all products once for selection and preview
    useEffect(() => {
        const fetchAll = async () => {
            try {
                const res = await productService.getAllProducts({ limit: 1000 });
                const products = (res.data || []).map(p => ({
                    id: p.pk_product_id,
                    name: p.product_name,
                    sku: p.sku || "",
                    image: p.product_img || "/wood_products.png",
                    stock: p.available_quantity || 0,
                    price: p.display_price || 0,
                    size: (() => {
                        if (typeof p.size === "object" && p.size !== null) {
                            return [p.size.length, p.size.width, p.size.height].filter(v => v != null && v !== "").join(" × ");
                        }
                        return p.size || "";
                    })(),
                    color: p.color_name || "",
                    category: p.category_name || "",
                }));
                setAllProducts(products);
            } catch (err) {
                console.error("Fetch all products error:", err);
            }
        };
        fetchAll();
    }, []);

    // Load coupon data for edit mode
    useEffect(() => {
        if (!isEdit) return;
        const loadCoupon = async () => {
            try {
                const res = await couponService.getCouponById(editId);
                const c = res.data;
                if (!c) return;
                setForm(prev => ({
                    ...prev,
                    code: c.coupon_code || "",
                    name: c.coupon_name || "",
                    description: c.description || "",
                    discountValue: c.discount_percent ? String(Number(c.discount_percent)) : "",
                    startDate: c.start_date ? new Date(c.start_date).toISOString().slice(0, 10) : "",
                    endDate: c.end_date ? new Date(c.end_date).toISOString().slice(0, 10) : "",
                    allProducts: !c.products || c.products.length === 0,
                    selectedProducts: c.products ? c.products.map(p => p.pk_product_id) : [],
                    isActive: c.status === 1,
                }));
            } catch (err) {
                console.error("Load coupon error:", err);
                toast.error("Không thể tải thông tin mã giảm giá");
            }
        };
        loadCoupon();
    }, [editId, isEdit]);

    const set = useCallback((field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (touched[field]) validate({ ...form, [field]: value });
    }, [form, touched]);

    const touch = (field) => setTouched(prev => ({ ...prev, [field]: true }));

    // ── Realtime validation ──────────────────────────────────────────────────
    const validate = useCallback((f = form) => {
        const e = {};
        if (!f.code.trim()) e.code = "Vui lòng nhập mã coupon";
        else if (f.code.length > 20) e.code = "Tối đa 20 ký tự";
        if (!f.name.trim()) e.name = "Vui lòng nhập tên chương trình";
        if (!f.discountValue) {
            e.discountValue = "Bắt buộc nhập giá trị giảm";
        } else {
            const v = parseFloat(f.discountValue);
            if (isNaN(v) || v <= 0 || v > 100) e.discountValue = "Phần trăm: 1 – 100";
        }
        if (f.startDate && f.endDate && f.endDate < f.startDate) e.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
        if (!f.allProducts && f.selectedProducts.length === 0) e.selectedProducts = "Chọn ít nhất 1 sản phẩm";
        setErrors(e);
        return e;
    }, [form]);

    const isValid = useMemo(() => {
        const e = {};
        if (!form.code.trim() || form.code.length > 20) return false;
        if (!form.name.trim()) return false;
        if (!form.discountValue) return false;
        const v = parseFloat(form.discountValue);
        if (isNaN(v) || v <= 0 || v > 100) return false;
        if (form.startDate && form.endDate && form.endDate < form.startDate) return false;
        if (!form.allProducts && form.selectedProducts.length === 0) return false;
        return true;
    }, [form]);

    // ── Auto-generate code with flash animation ──────────────────────────────
    const handleGenCode = async () => {
        setCodeGenLoading(true);
        await new Promise(r => setTimeout(r, 350));
        set("code", generateCode());
        setCodeGenLoading(false);
    };

    // ── Preview sentence ─────────────────────────────────────────────────────
    const preview = useMemo(() => {
        if (!form.discountValue) return null;
        const val = `${form.discountValue}%`;
        const products = form.allProducts ? "tất cả sản phẩm" : `${form.selectedProducts.length} sản phẩm đã chọn`;
        const minOrder = form.minOrderValue ? ` cho đơn hàng từ ${fmtVND(form.minOrderValue)}₫` : "";
        const limit = form.usageLimit ? ` (tối đa ${form.usageLimit} lượt)` : "";
        return `Khách được giảm ${val}${minOrder}${limit} — áp dụng cho ${products}`;
    }, [form]);

    // ── Submit ───────────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        const allTouched = Object.fromEntries(Object.keys(INIT).map(k => [k, true]));
        setTouched(allTouched);
        const errs = validate(form);
        if (Object.keys(errs).length > 0) { toast.error("Vui lòng kiểm tra lại thông tin"); return; }
        setLoading(true);
        try {
            const payload = {
                coupon_code: form.code.toUpperCase(),
                coupon_name: form.name.trim(),
                description: form.description.trim() || null,
                discount_percent: parseFloat(form.discountValue),
                start_date: form.startDate || null,
                end_date: form.endDate || null,
                productIds: form.allProducts ? [] : form.selectedProducts,
                status: form.isActive ? 1 : 0,
            };

            if (isEdit) {
                await couponService.updateCoupon(editId, payload);
                toast.success("Cập nhật mã coupon thành công!");
            } else {
                await couponService.createCoupon(payload);
                toast.success("Tạo mã coupon thành công!");
            }
            navigate("/owner/coupons");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    // ── Selected product names (for preview tags) ────────────────────────────
    const selectedProductObjects = useMemo(
        () => allProducts.filter(p => form.selectedProducts.includes(p.id)),
        [form.selectedProducts, allProducts]
    );

    // ─── Render ──────────────────────────────────────────────────────────────
    return (
        <>
            <PageHelmet title={isEdit ? "Chỉnh sửa mã giảm giá | TPF-SIMS" : "Tạo mã giảm giá | TPF-SIMS"} />

            {showProductModal && (
                <ProductModal
                    allProducts={allProducts}
                    selected={form.selectedProducts}
                    onClose={() => setShowProductModal(false)}
                    onConfirm={(ids) => {
                        set("selectedProducts", ids);
                        set("allProducts", ids.length === 0);
                        setErrors(prev => ({ ...prev, selectedProducts: "" }));
                        setShowProductModal(false);
                    }}
                />
            )}

            <div className="flex flex-col min-h-[calc(100vh-64px)] -m-6 p-6" style={{ backgroundColor: "var(--bg-main)" }}>

                {/* ── Inline page header ──────────────────────────────────── */}
                <div className="flex items-center justify-between mb-5 shrink-0">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "var(--status-focus)" }}>
                                <Tag size={18} style={{ color: "var(--brand-primary)" }} />
                            </div>
                            <div>
                                <h1 className="text-[22px] font-bold leading-tight" style={{ color: "var(--text-main)", letterSpacing: "-0.01em" }}>
                                    {isEdit ? "Chỉnh sửa mã giảm giá" : "Tạo mã giảm giá"}
                                </h1>
                                <p className="text-[13px] font-medium italic" style={{ color: "var(--text-placeholder)" }}>
                                    {isEdit ? "Cập nhật thông tin coupon khuyến mãi" : "Cài đặt coupon mới cho chương trình khuyến mãi"}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button type="button" onClick={() => navigate("/owner/coupons")}
                            className="h-10 px-5 rounded-xl border font-bold text-[13px] text-gray-500 hover:bg-gray-100 transition cursor-pointer"
                            style={{ borderColor: "var(--grid-border)" }}>
                            Hủy
                        </button>
                        <button type="button" onClick={handleSubmit} disabled={!isValid || loading}
                            className={cn("h-10 px-6 rounded-xl text-white font-bold text-[13px] flex items-center gap-2 transition cursor-pointer",
                                isValid && !loading ? "hover:-translate-y-0.5" : "opacity-50 cursor-not-allowed")}
                            style={{ backgroundColor: "var(--brand-primary)" }}>
                            {loading && <Loader2 size={14} className="animate-spin" />}
                            {loading ? "Đang lưu..." : isEdit ? "Cập nhật" : "Lưu mã giảm giá"}
                        </button>
                    </div>
                </div>

                {/* ── Content area ───────────────────────────────────────── */}
                <div className="flex-1">
                    <div className="mx-auto max-w-[860px] space-y-5">

                        {/* Preview banner */}
                        {preview && (
                            <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl border text-[13px] font-medium animate-in slide-in-from-top-2 duration-300"
                                style={{ backgroundColor: "var(--status-focus)", borderColor: "rgba(52,176,87,0.25)", color: "var(--brand-primary)" }}>
                                <Sparkles size={16} className="shrink-0" />
                                <span>{preview}</span>
                            </div>
                        )}

                        {/* ── Section 1: Basic info ─────────────────────────── */}
                        <SectionCard step="1" title="Thông tin cơ bản" subtitle="Tên chương trình, mã coupon và mô tả">
                            {/* Coupon code */}
                            <FieldRow label="Mã coupon" required error={touched.code && errors.code}
                                hint="Tối đa 20 ký tự · Tự động viết hoa"
                                tooltip="Mã mà khách hàng nhập tại ô giảm giá khi thanh toán">
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Tag size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                                        <Input
                                            value={form.code}
                                            onChange={e => set("code", e.target.value.toUpperCase().slice(0, 20))}
                                            onBlur={() => touch("code")}
                                            placeholder="VD: FASHION20"
                                            maxLength={20}
                                            className={cn("h-11 rounded-xl pl-9 pr-14 font-mono uppercase tracking-widest text-[14px]",
                                                touched.code && errors.code && "border-red-400 focus-visible:border-red-400 focus-visible:ring-red-200")}
                                            aria-invalid={!!(touched.code && errors.code)}
                                        />
                                        {form.code && (
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-300 font-mono tabular-nums">
                                                {form.code.length}/20
                                            </span>
                                        )}
                                    </div>
                                    <button type="button" onClick={handleGenCode} disabled={codeGenLoading}
                                        className="h-11 px-4 rounded-xl border text-[12px] font-bold flex items-center gap-1.5 transition cursor-pointer hover:bg-emerald-50 disabled:opacity-50"
                                        style={{ borderColor: "var(--brand-primary)", color: "var(--brand-primary)" }}>
                                        <RefreshCw size={14} className={cn("transition-transform", codeGenLoading && "animate-spin")} />
                                        Tự động
                                    </button>
                                </div>
                            </FieldRow>

                            {/* Program name */}
                            <FieldRow label="Tên chương trình" required error={touched.name && errors.name}>
                                <Input
                                    value={form.name}
                                    onChange={e => set("name", e.target.value)}
                                    onBlur={() => touch("name")}
                                    placeholder="VD: Khuyến mãi mùa hè 2026"
                                    className={cn("h-11 rounded-xl",
                                        touched.name && errors.name && "border-red-400 focus-visible:border-red-400 focus-visible:ring-red-200")}
                                />
                            </FieldRow>

                            {/* Description */}
                            <FieldRow label="Mô tả (tuỳ chọn)" hint="Ghi chú nội bộ, không hiển thị với khách">
                                <Textarea
                                    value={form.description}
                                    onChange={e => set("description", e.target.value)}
                                    placeholder="Mô tả thêm về chương trình khuyến mãi..."
                                    className="rounded-xl resize-none min-h-[80px] text-[13px]"
                                    rows={3}
                                />
                            </FieldRow>

                        </SectionCard>

                        {/* ── Section 2: Discount & Date range ──────────────── */}
                        <SectionCard step="2" title="Cài đặt giảm giá & Thời gian" subtitle="Mức giảm phần trăm và thời hạn áp dụng của chương trình">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                                {/* Discount value */}
                                <div className="col-span-1 md:border-r border-gray-100 md:pr-6">
                                    <FieldRow label="Mức giảm (%)"
                                        required error={touched.discountValue && errors.discountValue}
                                        hint="Từ 1 đến 100">
                                        <div className="relative group">
                                            <div className="absolute left-0 inset-y-0 w-11 flex items-center justify-center bg-gray-50 rounded-l-xl border-r group-hover:bg-emerald-50 transition-colors" style={{ borderColor: touched.discountValue && errors.discountValue ? "#F87171" : "var(--grid-border)" }}>
                                                <Percent size={14} className="text-gray-400 group-hover:text-emerald-500 transition-colors" />
                                            </div>
                                            <Input
                                                type="number" inputMode="numeric"
                                                value={form.discountValue}
                                                onChange={e => set("discountValue", e.target.value)}
                                                onBlur={() => touch("discountValue")}
                                                min={1} max={100}
                                                placeholder="VD: 20"
                                                className={cn("h-11 rounded-xl pl-14 pr-10 font-bold text-[15px] border-gray-200 focus-visible:border-emerald-500 focus-visible:ring-emerald-200 transition-all placeholder:font-normal placeholder:text-gray-400",
                                                    touched.discountValue && errors.discountValue && "border-red-400 focus-visible:border-red-400 focus-visible:ring-red-200",
                                                    !errors.discountValue && form.discountValue && "bg-emerald-50/20 text-emerald-700")}
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[15px] font-black text-gray-300 group-hover:text-emerald-500 transition-colors">
                                                %
                                            </span>
                                        </div>
                                    </FieldRow>
                                </div>

                                {/* Dates */}
                                <div className="col-span-1 md:col-span-2">
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <FieldRow label="Ngày bắt đầu" hint="Để trống = hiệu lực ngay" half>
                                            <div className="relative group">
                                                <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                                                <Input type="date"
                                                    value={form.startDate}
                                                    onChange={e => { set("startDate", e.target.value); touch("startDate"); }}
                                                    className="h-11 rounded-xl pl-10 text-[13px] border-gray-200 hover:border-emerald-300 focus-visible:border-emerald-500 transition-colors"
                                                    min={new Date().toISOString().slice(0, 10)} />
                                            </div>
                                        </FieldRow>
                                        <FieldRow label="Ngày kết thúc" hint="Để trống = không giới hạn" half error={touched.endDate && errors.endDate}>
                                            <div className="relative group">
                                                <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                                                <Input type="date"
                                                    value={form.endDate}
                                                    onChange={e => { set("endDate", e.target.value); touch("endDate"); }}
                                                    onBlur={() => touch("endDate")}
                                                    className={cn("h-11 rounded-xl pl-10 text-[13px] border-gray-200 hover:border-emerald-300 focus-visible:border-emerald-500 transition-colors",
                                                        touched.endDate && errors.endDate && "border-red-400 focus-visible:border-red-400 focus-visible:ring-red-200")}
                                                    min={form.startDate || new Date().toISOString().slice(0, 10)} />
                                            </div>
                                        </FieldRow>
                                    </div>

                                    {/* Duration chip */}
                                    {form.startDate && form.endDate && !errors.endDate && (
                                        <div className="mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-medium animate-in fade-in duration-200 bg-emerald-50 text-emerald-700 border border-emerald-100 w-fit">
                                            <Calendar size={14} />
                                            {(() => {
                                                const days = Math.ceil((new Date(form.endDate) - new Date(form.startDate)) / 86400000);
                                                return `Thời hạn chương trình: ${days} ngày`;
                                            })()}
                                        </div>
                                    )}
                                </div>

                            </div>
                        </SectionCard>

                        {/* ── Section 3: Products ───────────────────────────── */}
                        <SectionCard step="3" title="Sản phẩm áp dụng" subtitle="Chọn sản phẩm hoặc áp dụng toàn bộ">
                            {/* All-products toggle */}
                            <button type="button" onClick={() => { set("allProducts", !form.allProducts); if (!form.allProducts) set("selectedProducts", []); }}
                                className={cn("w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all cursor-pointer",
                                    form.allProducts ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-gray-300")}>
                                <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                                    form.allProducts ? "bg-emerald-500 border-emerald-500" : "border-gray-300")}>
                                    {form.allProducts && <Check size={11} className="text-white" strokeWidth={3} />}
                                </div>
                                <div>
                                    <p className={cn("text-[13px] font-bold", form.allProducts ? "text-emerald-700" : "text-gray-700")}>Áp dụng tất cả sản phẩm</p>
                                    <p className="text-[11px] text-gray-400 mt-0.5">Coupon hợp lệ với toàn bộ sản phẩm trong hệ thống</p>
                                </div>
                            </button>

                            {/* Specific products */}
                            {!form.allProducts && (
                                <div className="space-y-3 animate-in fade-in-50 duration-200">
                                    <div className="flex items-center gap-3">
                                        <button type="button" onClick={() => setShowProductModal(true)}
                                            className="h-10 px-5 rounded-xl border-2 text-[13px] font-bold flex items-center gap-2 transition cursor-pointer hover:bg-emerald-50"
                                            style={{ borderColor: "var(--brand-primary)", color: "var(--brand-primary)" }}>
                                            <Package size={15} />
                                            {form.selectedProducts.length > 0 ? "Thay đổi sản phẩm" : "Chọn sản phẩm"}
                                        </button>
                                        {form.selectedProducts.length > 0 && (
                                            <span className="text-[12px] font-bold px-3 py-1 rounded-lg" style={{ backgroundColor: "var(--status-focus)", color: "var(--brand-primary)" }}>
                                                {form.selectedProducts.length} sản phẩm đã chọn
                                            </span>
                                        )}
                                    </div>

                                    {/* Product tags preview */}
                                    {selectedProductObjects.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {selectedProductObjects.slice(0, 6).map(p => (
                                                <div key={p.id}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px] font-medium bg-white group animate-in zoom-in-95 duration-150"
                                                    style={{ borderColor: "var(--grid-border)" }}>
                                                    <Package size={11} style={{ color: "var(--brand-primary)" }} />
                                                    <span className="text-gray-700 max-w-[140px] truncate">{p.name}</span>
                                                    <button type="button" onClick={() => set("selectedProducts", form.selectedProducts.filter(id => id !== p.id))}
                                                        className="ml-1 opacity-0 group-hover:opacity-100 transition cursor-pointer text-gray-400 hover:text-red-500">
                                                        <X size={11} />
                                                    </button>
                                                </div>
                                            ))}
                                            {selectedProductObjects.length > 6 && (
                                                <div className="flex items-center px-3 py-1.5 rounded-lg border text-[12px] font-bold text-gray-400 bg-white"
                                                    style={{ borderColor: "var(--grid-border)" }}>
                                                    +{selectedProductObjects.length - 6} khác
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {touched.selectedProducts && errors.selectedProducts && (
                                        <p className="text-[12px] flex items-center gap-1 text-red-500"><AlertCircle size={11} />{errors.selectedProducts}</p>
                                    )}
                                </div>
                            )}
                        </SectionCard>

                        {/* ── Bottom save bar ───────────────────────────────── */}
                        <div className="flex items-center justify-end gap-3 pt-2 pb-8">
                            <button type="button" onClick={() => navigate("/owner/coupons")}
                                className="h-11 px-8 rounded-xl border font-bold text-[14px] text-gray-500 hover:bg-gray-100 transition cursor-pointer"
                                style={{ borderColor: "var(--grid-border)" }}>
                                Hủy
                            </button>
                            <button type="button" onClick={handleSubmit} disabled={!isValid || loading}
                                className={cn("h-11 px-10 rounded-xl text-white font-bold text-[14px] flex items-center gap-2 transition cursor-pointer",
                                    isValid && !loading ? "hover:opacity-90 hover:-translate-y-0.5" : "opacity-50 cursor-not-allowed")}
                                style={{ backgroundColor: "var(--brand-primary)" }}>
                                {loading && <Loader2 size={16} className="animate-spin" />}
                                {loading ? "Đang lưu..." : isEdit ? "Cập nhật coupon" : "Lưu mã coupon"}
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}