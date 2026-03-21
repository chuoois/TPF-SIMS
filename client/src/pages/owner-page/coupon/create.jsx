import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { PageHelmet } from "@/components/seo/PageHelmet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Tag, ChevronRight, RefreshCw, Percent, Banknote,
  Calendar, Package, X, Check, Loader2, Info,
  Sparkles, HelpCircle, Search, ChevronLeft,
  AlertCircle, Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

// ─── Mock products ─────────────────────────────────────────────────────────
const ALL_PRODUCTS = [
  { id: "SP001", sku: "ST-HS-197x107", name: "Sập thờ Mai Điểu chân 20", category: "Phòng thờ", price: 45000000, stock: 2, productType: "Hàng mộc", size: "197×107×108 cm", color: "Nguyên mộc", image: "/wood_products.png" },
  { id: "SP002", sku: "BBG-HKD-Tay12", name: "Bộ bàn ghế Quốc Voi 6 món", category: "Phòng khách", price: 120000000, stock: 0, productType: "Hàng sẵn", size: "Bộ 6 món", color: "Gỗ hương đỏ", image: "/wood_products.png" },
  { id: "SP003", sku: "SF-260x180", name: "Sofa nguyên khối chữ L", category: "Phòng khách", price: 35000000, stock: 5, productType: "Hàng sẵn", size: "260×180×85 cm", color: "Vải bố xám", image: "/wood_products.png" },
  { id: "SP004", sku: "LB-180m", name: "Lộc bình cao 1m8", category: "Trang trí", price: 25000000, stock: 0, productType: "Hàng sẵn", size: "Cao 180 cm", color: "Gỗ hương đỏ", image: "/wood_products.png" },
  { id: "SP005", sku: "GN-180x200-Soi", name: "Giường ngủ hoa hồng Tân cổ điển", category: "Phòng ngủ", price: 18500000, stock: 3, productType: "Hàng sẵn", size: "180×200 cm", color: "Sơn trắng", image: "/wood_products.png" },
  { id: "SP006", sku: "TDM-60x30", name: "Tượng Đạt Ma sư tổ", category: "Trang trí", price: 8500000, stock: 1, productType: "Hàng mộc", size: "60×30 cm", color: "Nguyên mộc", image: "/wood_products.png" },
  { id: "SP007", sku: "BA-240x95", name: "Bộ bàn ăn 8 ghế nguyên khối", category: "Phòng ăn", price: 55000000, stock: 0, productType: "Hàng sẵn", size: "240×95 cm", color: "Gỗ gõ đỏ", image: "/wood_products.png" },
  { id: "SP008", sku: "TA-160x200", name: "Tủ áo gỗ xoan đào", category: "Phòng ngủ", price: 12500000, stock: 3, productType: "Hàng mộc", size: "160×200×55 cm", color: "Nguyên mộc", image: "/wood_products.png" },
  { id: "SP009", sku: "ST-HM-197x107", name: "Sập thờ Mai Điểu (Hàng mộc)", category: "Phòng thờ", price: 38000000, stock: 2, productType: "Hàng mộc", size: "197×107 cm", color: "Gỗ gụ", image: "/wood_products.png" },
  { id: "SP010", sku: "BG-TanThuyHoang", name: "Bộ Tần Thủy Hoàng 6 món", category: "Phòng khách", price: 62000000, stock: 1, productType: "Hàng sẵn", size: "Bộ 6 món", color: "Gỗ hương", image: "/wood_products.png" },
  { id: "SP011", sku: "GN-HM-180x200", name: "Giường ngủ chữ X (Hàng mộc)", category: "Phòng ngủ", price: 15500000, stock: 5, productType: "Hàng mộc", size: "180×200 cm", color: "Nguyên mộc", image: "/wood_products.png" },
  { id: "SP012", sku: "BA-HM-6Ghe", name: "Bộ bàn ăn 6 ghế chữ Thọ", category: "Phòng ăn", price: 9500000, stock: 3, productType: "Hàng mộc", size: "Bộ 6 ghế", color: "Nguyên mộc", image: "/wood_products.png" },
  { id: "SP013", sku: "KTV-240", name: "Kệ tivi cột nho 2m4", category: "Phòng khách", price: 17000000, stock: 2, productType: "Hàng mộc", size: "240×45×55 cm", color: "Gỗ hương", image: "/wood_products.png" },
];
const PRODUCT_TYPES = ["Hàng mộc", "Hàng sẵn"];
const CATEGORIES = ["Tất cả", "Phòng khách", "Phòng thờ", "Phòng ngủ", "Phòng ăn", "Trang trí"];
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
function ProductModal({ selected, onClose, onConfirm }) {
  const [localSelected, setLocalSelected] = useState(new Set(selected));
  const [productType, setProductType] = useState("Hàng mộc");
  const [category, setCategory] = useState("Tất cả");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let r = ALL_PRODUCTS.filter(p => p.productType === productType);
    if (category !== "Tất cả") r = r.filter(p => p.category === category);
    if (search.trim()) {
      const s = search.toLowerCase();
      r = r.filter(p => p.name.toLowerCase().includes(s) || p.sku.toLowerCase().includes(s));
    }
    return r;
  }, [productType, category, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / MODAL_PAGE_SIZE));
  const paged = filtered.slice((page - 1) * MODAL_PAGE_SIZE, page * MODAL_PAGE_SIZE);

  const toggle = (id) => {
    setLocalSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => setLocalSelected(new Set(ALL_PRODUCTS.map(p => p.id)));
  const clearAll = () => setLocalSelected(new Set());

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[88vh] animate-in zoom-in-95 duration-200 overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between shrink-0" style={{ borderColor: "var(--grid-border)" }}>
          <div>
            <h3 className="text-[15px] font-bold text-gray-900">Chọn sản phẩm áp dụng</h3>
            <p className="text-[12px] text-gray-400 mt-0.5">
              Đã chọn <strong className="text-emerald-600">{localSelected.size}</strong> / {ALL_PRODUCTS.length} sản phẩm
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

        {/* Product type tab strip — identical to sales invoice */}
        <div className="px-4 pt-3 pb-2 space-y-2.5 border-b shrink-0" style={{ borderColor: "var(--grid-border)", backgroundColor: "var(--grid-header-bg)" }}>
          <div className="flex rounded-xl overflow-hidden" style={{ border: "1px solid var(--grid-border)", backgroundColor: "var(--bg-main)" }}>
            {PRODUCT_TYPES.map(tab => (
              <button key={tab}
                onClick={() => { setProductType(tab); setCategory("Tất cả"); setPage(1); }}
                className="flex-1 py-2.5 text-[13px] font-semibold transition-all cursor-pointer"
                style={{
                  backgroundColor: productType === tab ? "var(--brand-primary)" : "transparent",
                  color: productType === tab ? "#fff" : "var(--text-secondary)",
                }}>
                {tab}
              </button>
            ))}
          </div>

          {/* Search + category pills */}
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
          <div className="flex gap-1.5 flex-wrap">
            <button onClick={() => { setCategory("Tất cả"); setPage(1); }}
              className={cn("h-7 px-3 rounded-lg text-[12px] font-semibold transition cursor-pointer",
                category === "Tất cả" ? "text-white" : "bg-white border hover:bg-gray-50")}
              style={category === "Tất cả" ? { backgroundColor: "var(--brand-primary)" } : { borderColor: "var(--grid-border)", color: "var(--text-secondary)" }}>
              Tất cả
            </button>
            {CATEGORIES.filter(c => c !== "Tất cả").map(c => (
              <button key={c} onClick={() => { setCategory(c); setPage(1); }}
                className={cn("h-7 px-3 rounded-lg text-[12px] font-semibold transition cursor-pointer",
                  category === c ? "text-white" : "bg-white border hover:bg-gray-50")}
                style={category === c ? { backgroundColor: "var(--brand-primary)" } : { borderColor: "var(--grid-border)", color: "var(--text-secondary)" }}>
                {c}
              </button>
            ))}
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
                        {p.price.toLocaleString("vi-VN")}₫
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
  maxDiscount: "",           // cap in VND when type=percent
  minOrderValue: "",
  totalLimit: "",
  perUserLimit: "",
  startDate: "",
  endDate: "",
  allProducts: true,
  selectedProducts: [],
  isActive: true,
};

export default function CouponCreatePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INIT);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [codeGenLoading, setCodeGenLoading] = useState(false);

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
    } else if (f.discountType === "percent") {
      const v = parseFloat(f.discountValue);
      if (isNaN(v) || v <= 0 || v > 100) e.discountValue = "Phần trăm: 1 – 100";
    } else {
      const v = parseRaw(f.discountValue);
      if (!v || v <= 0) e.discountValue = "Số tiền phải lớn hơn 0";
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
    if (form.discountType === "percent") { const v = parseFloat(form.discountValue); if (isNaN(v) || v <= 0 || v > 100) return false; }
    else { if (!parseRaw(form.discountValue)) return false; }
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
    const val = form.discountType === "percent"
      ? `${form.discountValue}%`
      : `${fmtVND(form.discountValue)}₫`;
    const cap = form.discountType === "percent" && form.maxDiscount
      ? `, tối đa ${fmtVND(form.maxDiscount)}₫`
      : "";
    const minOrder = form.minOrderValue ? ` cho đơn hàng từ ${fmtVND(form.minOrderValue)}₫` : "";
    const products = form.allProducts ? "tất cả sản phẩm" : `${form.selectedProducts.length} sản phẩm đã chọn`;
    return `Khách được giảm ${val}${cap}${minOrder} — áp dụng cho ${products}`;
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
      await new Promise(r => setTimeout(r, 1200));
      const payload = {
        couponCode: form.code.toUpperCase(),
        couponName: form.name.trim(),
        description: form.description.trim() || null,
        discountType: form.discountType === "percent" ? "PERCENT" : "AMOUNT",
        discountValue: form.discountType === "percent" ? parseFloat(form.discountValue) : parseRaw(form.discountValue),
        maxDiscountAmount: form.discountType === "percent" && form.maxDiscount ? parseRaw(form.maxDiscount) : null,
        minOrderValue: form.minOrderValue ? parseRaw(form.minOrderValue) : null,
        totalUsageLimit: form.totalLimit ? parseInt(form.totalLimit) : null,
        perUserLimit: form.perUserLimit ? parseInt(form.perUserLimit) : null,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        applyAllProducts: form.allProducts,
        productIds: form.allProducts ? [] : form.selectedProducts,
        isActive: form.isActive,
      };
      console.log("[CouponCreate] →", payload);
      toast.success("Tạo mã coupon thành công!");
      navigate("/owner/coupons");
    } catch {
      toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // ── Selected product names (for preview tags) ────────────────────────────
  const selectedProductObjects = useMemo(
    () => ALL_PRODUCTS.filter(p => form.selectedProducts.includes(p.id)),
    [form.selectedProducts]
  );

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <>
      <PageHelmet title="Tạo mã giảm giá | TPF-SIMS" />

      {showProductModal && (
        <ProductModal
          selected={form.selectedProducts}
          onClose={() => setShowProductModal(false)}
          onConfirm={(ids) => {
            set("selectedProducts", ids);
            set("allProducts", ids.length === ALL_PRODUCTS.length || ids.length === 0);
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
                  Tạo mã giảm giá
                </h1>
                <p className="text-[13px] font-medium italic" style={{ color: "var(--text-placeholder)" }}>
                  Cài đặt coupon mới cho chương trình khuyến mãi
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
              style={{ backgroundColor: "var(--brand-primary)", boxShadow: isValid ? "0 4px 12px rgba(52,176,87,0.25)" : "none" }}>
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? "Đang lưu..." : "Lưu mã giảm giá"}
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

              {/* Active toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl border" style={{ borderColor: "var(--grid-border)" }}>
                <div>
                  <p className="text-[13px] font-bold text-gray-700">Kích hoạt ngay</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Mã sẽ hoạt động ngay sau khi lưu</p>
                </div>
                <button type="button" onClick={() => set("isActive", !form.isActive)} className="cursor-pointer">
                  <div className={cn("relative w-11 h-6 rounded-full transition-all duration-200", form.isActive ? "bg-emerald-500" : "bg-gray-200")}>
                    <span className={cn("absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200", form.isActive ? "translate-x-5" : "translate-x-0")} />
                  </div>
                </button>
              </div>
            </SectionCard>

            {/* ── Section 2: Discount ──────────────────────────── */}
            <SectionCard step="2" title="Loại & giá trị giảm giá" subtitle="Chọn hình thức và mức giảm">
              {/* Type selector */}
              <FieldRow label="Hình thức giảm giá" required>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { v: "percent", label: "Phần trăm (%)", icon: Percent, desc: "VD: Giảm 20%" },
                    { v: "amount", label: "Số tiền cố định", icon: Banknote, desc: "VD: Giảm 100.000₫" },
                  ].map(({ v, label, icon: Icon, desc }) => (
                    <button key={v} type="button"
                      onClick={() => { set("discountType", v); set("discountValue", ""); set("maxDiscount", ""); }}
                      className={cn("p-4 rounded-xl border-2 text-left transition-all cursor-pointer",
                        form.discountType === v
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-gray-200 hover:border-gray-300 bg-white")}>
                      <div className="flex items-center gap-2 mb-1">
                        <Icon size={16} className={form.discountType === v ? "text-emerald-600" : "text-gray-400"} />
                        <span className={cn("text-[13px] font-bold", form.discountType === v ? "text-emerald-700" : "text-gray-700")}>{label}</span>
                        {form.discountType === v && <Check size={13} className="ml-auto text-emerald-500" />}
                      </div>
                      <p className="text-[11px] text-gray-400">{desc}</p>
                    </button>
                  ))}
                </div>
              </FieldRow>

              <div className="flex gap-4">
                {/* Discount value */}
                <FieldRow label={form.discountType === "percent" ? "Mức giảm (%)" : "Số tiền giảm (₫)"}
                  required error={touched.discountValue && errors.discountValue}
                  hint={form.discountType === "percent" ? "Từ 1 đến 100" : "Định dạng VNĐ"} half>
                  <div className="relative">
                    <Input
                      type={form.discountType === "percent" ? "number" : "text"} inputMode="numeric"
                      value={form.discountType === "amount" ? fmtVND(form.discountValue) : form.discountValue}
                      onChange={e => {
                        const raw = e.target.value.replace(/\D/g, "");
                        set("discountValue", form.discountType === "percent" ? e.target.value : raw);
                      }}
                      onBlur={() => touch("discountValue")}
                      min={1} max={form.discountType === "percent" ? 100 : undefined}
                      placeholder={form.discountType === "percent" ? "20" : "100.000"}
                      className={cn("h-11 rounded-xl pr-10",
                        touched.discountValue && errors.discountValue && "border-red-400 focus-visible:border-red-400 focus-visible:ring-red-200")}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[14px] font-black" style={{ color: "var(--brand-primary)" }}>
                      {form.discountType === "percent" ? "%" : "₫"}
                    </span>
                  </div>
                </FieldRow>

                {/* Max discount cap (only for percent) */}
                {form.discountType === "percent" && (
                  <FieldRow label="Giảm tối đa (₫)" hint="Để trống = không giới hạn"
                    tooltip="Dù phần trăm tính ra lớn hơn, khách chỉ được giảm tối đa mức này" half>
                    <div className="relative">
                      <Input
                        type="text" inputMode="numeric"
                        value={fmtVND(form.maxDiscount)}
                        onChange={e => set("maxDiscount", e.target.value.replace(/\D/g, ""))}
                        placeholder="500.000"
                        className="h-11 rounded-xl pr-8"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[14px] font-black text-gray-300">₫</span>
                    </div>
                  </FieldRow>
                )}
              </div>
            </SectionCard>

            {/* ── Section 3: Conditions ─────────────────────────── */}
            <SectionCard step="3" title="Điều kiện áp dụng" subtitle="Giá trị đơn hàng tối thiểu, giới hạn lượt">
              <div className="flex gap-4">
                {/* Min order */}
                <FieldRow label="Đơn hàng tối thiểu (₫)" hint="Để trống = áp dụng mọi đơn" half
                  tooltip="Coupon chỉ áp dụng khi giá trị đơn hàng đạt mức tối thiểu này">
                  <div className="relative">
                    <Input type="text" inputMode="numeric"
                      value={fmtVND(form.minOrderValue)}
                      onChange={e => set("minOrderValue", e.target.value.replace(/\D/g, ""))}
                      placeholder="500.000"
                      className="h-11 rounded-xl pr-8" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[14px] font-black text-gray-300">₫</span>
                  </div>
                </FieldRow>
                {/* Empty spacer when not percent */}
                {form.discountType !== "percent" && <div className="flex-1 min-w-0" />}
              </div>

              <div className="flex gap-4">
                {/* Total limit */}
                <FieldRow label="Tổng lượt dùng" hint="Để trống = không giới hạn" half
                  tooltip="Số lần tối đa coupon này được dùng bởi tất cả khách">
                  <div className="relative">
                    <Input type="number" min={1}
                      value={form.totalLimit}
                      onChange={e => set("totalLimit", e.target.value)}
                      placeholder="100"
                      className="h-11 rounded-xl" />
                  </div>
                </FieldRow>
                {/* Per user limit */}
                <FieldRow label="Mỗi khách hàng" hint="Để trống = không giới hạn" half
                  tooltip="Mỗi tài khoản chỉ dùng được tối đa số lần này">
                  <div className="relative">
                    <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                    <Input type="number" min={1}
                      value={form.perUserLimit}
                      onChange={e => set("perUserLimit", e.target.value)}
                      placeholder="1"
                      className="h-11 rounded-xl pl-9" />
                  </div>
                </FieldRow>
              </div>
            </SectionCard>

            {/* ── Section 4: Date range ─────────────────────────── */}
            <SectionCard step="4" title="Thời gian hiệu lực" subtitle="Ngày bắt đầu và kết thúc của chương trình">
              <div className="flex gap-4">
                <FieldRow label="Ngày bắt đầu" hint="Để trống = hiệu lực ngay" half>
                  <div className="relative">
                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                    <Input type="date"
                      value={form.startDate}
                      onChange={e => { set("startDate", e.target.value); touch("startDate"); }}
                      className="h-11 rounded-xl pl-9"
                      min={new Date().toISOString().slice(0, 10)} />
                  </div>
                </FieldRow>
                <FieldRow label="Ngày kết thúc" hint="Để trống = không giới hạn" half error={touched.endDate && errors.endDate}>
                  <div className="relative">
                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                    <Input type="date"
                      value={form.endDate}
                      onChange={e => { set("endDate", e.target.value); touch("endDate"); }}
                      onBlur={() => touch("endDate")}
                      className={cn("h-11 rounded-xl pl-9",
                        touched.endDate && errors.endDate && "border-red-400 focus-visible:border-red-400 focus-visible:ring-red-200")}
                      min={form.startDate || new Date().toISOString().slice(0, 10)} />
                  </div>
                </FieldRow>
              </div>

              {/* Duration chip */}
              {form.startDate && form.endDate && !errors.endDate && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-medium animate-in fade-in duration-200"
                  style={{ backgroundColor: "var(--status-focus)", color: "var(--brand-primary)" }}>
                  <Calendar size={13} />
                  {(() => {
                    const days = Math.ceil((new Date(form.endDate) - new Date(form.startDate)) / 86400000);
                    return `Thời hạn: ${days} ngày`;
                  })()}
                </div>
              )}
            </SectionCard>

            {/* ── Section 5: Products ───────────────────────────── */}
            <SectionCard step="5" title="Sản phẩm áp dụng" subtitle="Chọn sản phẩm hoặc áp dụng toàn bộ">
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
                  <p className="text-[11px] text-gray-400 mt-0.5">Coupon hợp lệ với toàn bộ {ALL_PRODUCTS.length} sản phẩm trong hệ thống</p>
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
                style={{ backgroundColor: "var(--brand-primary)", boxShadow: isValid ? "0 6px 16px rgba(52,176,87,0.3)" : "none" }}>
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? "Đang lưu..." : "Lưu mã coupon"}
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
