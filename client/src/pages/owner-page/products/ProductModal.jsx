import { useState, useEffect } from "react";
import {
  X,
  Pencil,
  Trash2,
  Image as ImageIcon,
  ShieldCheck,
  Clock,
  Eye,
  Tag,
  Wrench,
  Package,
  Loader2,
  Upload,
  Plus,
} from "lucide-react";
import toast from "react-hot-toast";
import productService from "@/services/product.service";
import { uploadImage } from "@/services/cloudinary.service";
import ImageZoomModal from "@/components/control/ImageZoomModal";

// ─── Helpers ────────────────────────────────────────────────────────────────
const fmtCurrency = (n) => {
  if (n === undefined || n === null || isNaN(n) || n === 0) return "—";
  return new Intl.NumberFormat("vi-VN").format(n) + "₫";
};

// Formatter cho card chi phí: hiển thị 0₫ thay vì —
const fmtCost = (n) => {
  if (n === undefined || n === null || isNaN(n)) return "—";
  return new Intl.NumberFormat("vi-VN").format(n) + "₫";
};

const formatNum = (v) => {
  if (v === "" || v === null || v === undefined) return "";
  return v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const parseNum = (v) => {
  if (!v) return "";
  return v.toString().replace(/\./g, "").replace(/[^\d]/g, "");
};

const getStatusConfig = (status) => {
  switch (status) {
    case "Chưa định giá":
      return { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA" };
    case "Hàng sẵn":
      return { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" };
    case "Hàng mộc":
      return { bg: "#FFFBEB", text: "#D97706", border: "#FDE68A" };
    case "Hàng khách đặt":
      return { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" };
    case "Hết hàng":
      return { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" };
    case "Quà tặng":
      return { bg: "#FAF5FF", text: "#7E22CE", border: "#E9D5FF" };
    default:
      return { bg: "#F3F4F6", text: "#6B7280", border: "#E5E7EB" };
  }
};

// ─── Sub-components ─────────────────────────────────────────────────────────

/** Single read-only field */
const Field = ({ label, value }) => (
  <div>
    <span className="text-[11px] text-[var(--text-secondary)] block mb-0.5">
      {label}
    </span>
    <span className="font-semibold text-[var(--text-main)] text-sm">
      {value || "—"}
    </span>
  </div>
);

/** Editable text input field */
const InputField = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  postFix,
}) => (
  <div>
    <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
      {label}
    </label>
    <div className="relative">
      <input
        type={type}
        className={`w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[var(--text-main)] outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/30 focus:border-[var(--brand-primary)] transition bg-white ${postFix ? "pr-8" : ""}`}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
      />
      {postFix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
          {postFix}
        </span>
      )}
    </div>
  </div>
);

/** Editable select field */
const SelectField = ({ label, value, onChange, options, placeholder }) => (
  <div>
    <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
      {label}
    </label>
    <select
      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[var(--text-main)] outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/30 focus:border-[var(--brand-primary)] transition bg-white"
      value={value ?? ""}
      onChange={onChange}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  </div>
);

// ─── Pricing display (view mode) ─────────────────────────────────────────────
const PricingView = ({ item }) => {
  if (item.status === "Quà tặng")
    return (
      <div className="flex items-center justify-between">
        <span className="text-xs font-black text-purple-400 uppercase tracking-widest">
          Loại giá
        </span>
        <span className="text-xl font-black text-purple-700">MIỄN PHÍ</span>
      </div>
    );
  if (item.productType === "Hàng mộc")
    return (
      <div className="grid grid-cols-2 gap-3">
        <div>
          <span className="text-[10px] font-black text-amber-500 uppercase block mb-1">
            Giá bán mộc
          </span>
          <span className="text-lg font-black text-amber-700">
            {fmtCurrency(item.rawRetailPrice)}
          </span>
        </div>
        <div>
          <span className="text-[10px] font-black text-emerald-600 uppercase block mb-1">
            Giá hoàn thiện
          </span>
          <span className="text-lg font-black text-emerald-700">
            {fmtCurrency(item.finishedRetailPrice)}
          </span>
        </div>
      </div>
    );
  if (item.status === "Chưa định giá")
    return (
      <div className="text-center py-2">
        <span className="text-lg font-black text-[var(--status-error)] animate-pulse">
          CHỜ ĐỊNH GIÁ
        </span>
      </div>
    );
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
        Giá niêm yết
      </span>
      <span className="text-xl font-black text-[var(--brand-primary)]">
        {fmtCurrency(item.retailPrice)}
      </span>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
export default function ProductModal({
  product,
  mode = "view",
  onClose,
  onSave,
  onDelete,
  onSwitchMode,
  metadata = {},
}) {
  // Extract options from metadata or use defaults
  const categories = metadata.categories?.length > 0 
    ? metadata.categories.map(c => c.category_name) 
    : [];
  
  const materials = metadata.materials?.length > 0 
    ? metadata.materials.map(m => m.material_name) 
    : [];

  const colors = metadata.colors?.length > 0 
    ? metadata.colors.map(c => c.color_name) 
    : [];

  const rooms = metadata.rooms?.length > 0 
    ? metadata.rooms.map(r => r.room_name) 
    : [];

  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [zoomImage, setZoomImage] = useState(null);
  const [dimErrors, setDimErrors] = useState({ dimL: "", dimW: "", dimH: "" });

  const [form, setForm] = useState({
    name: "",
    code: "",
    category: "",
    material: "",
    color: "",
    dimL: "",
    dimW: "",
    dimH: "",
    status: "",
    productType: "",
    warrantyMonths: 12,
    leadTime: 0,
    description: "",
    costPrice: 0,
    processingCost: 0,
    margin: 20,
    rawRetailPrice: 0,
    finishedRetailPrice: 0,
    retailPrice: 0,
  });

  useEffect(() => {
    setImageFile(null);
    setImagePreview(null);
    setSaving(false);
    setDimErrors({ dimL: "", dimW: "", dimH: "" });
    if (product && product.id) {
      const dims = (product.dimensions || "")
        .split(/[xX*×]/)
        .map((d) => d.trim());
      setForm({
        name: product.name || "",
        code: product.code || "",
        category: product.category || "",
        material: product.material || "",
        color: product.color || "",
        dimL: dims[0] || "",
        dimW: dims[1] || "",
        dimH: dims[2] || "",
        status: product.status || "",
        productType: product.productType || "Hàng sẵn",
        warrantyMonths: product.warrantyMonths || 12,
        leadTime: product.leadTime || 0,
        description: product.description || "",
        costPrice: product.costPrice || 0,
        processingCost: product.processingCost || product.paintCost || 0,
        margin: product.profitMargin || 20,
        rawRetailPrice: product.rawRetailPrice || 0,
        finishedRetailPrice: product.finishedRetailPrice || 0,
        retailPrice: product.retailPrice || 0,
      });
    } else if (product) {
      // Create mode - reset form
      setForm({
        name: "", code: "", category: "", material: "", color: "",
        dimL: "", dimW: "", dimH: "", status: "",
        productType: "Hàng sẵn", warrantyMonths: 12, leadTime: 0,
        description: "", costPrice: 0, processingCost: 0, margin: 20,
        rawRetailPrice: 0, finishedRetailPrice: 0, retailPrice: 0,
      });
    }
  }, [product]);

  if (!product) return null;

  const newestLot =
    product.lots?.length > 0
      ? product.lots.reduce(
          (latest, current) =>
            new Date(current.importDate) > new Date(latest.importDate)
              ? current
              : latest,
          product.lots[0],
        )
      : null;

  const isCreate = mode === "create";
  const sc = getStatusConfig(product.status);
  const isWood = isCreate ? form.productType === "Hàng mộc" : product.productType === "Hàng mộc";
  const canDelete = product.stock === 0;

  // Lấy giá nhập gần nhất (lô mới nhất)
  const latestCost = newestLot ? newestLot.importPrice : (form.costPrice || 0);

  const set = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  const setNum = (key) => (e) => {
    const raw = parseNum(e.target.value);
    setForm((prev) => ({ ...prev, [key]: raw === "" ? 0 : Number(raw) }));
  };

  const handleDimensionKeyDown = (e) => {
    if (["e", "E", "+", "-"].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleDimensionChange = (key, value) => {
    let sanitized = value.replace(/[^0-9.]/g, "");
    const parts = sanitized.split(".");
    if (parts.length > 2) {
      sanitized = parts[0] + "." + parts.slice(1).join("");
    }
    if (sanitized.length > 7) {
      sanitized = sanitized.slice(0, 7);
    }
    if (parts.length === 2 && parts[1].length > 2) {
      sanitized = parts[0] + "." + parts[1].slice(0, 2);
    }
    setForm((prev) => ({ ...prev, [key]: sanitized }));

    let errorMsg = "";
    if (sanitized !== "") {
      const num = Number(sanitized);
      if (isNaN(num)) {
        errorMsg = "Vui lòng nhập số hợp lệ";
      } else if (num <= 0) {
        errorMsg = "Kích thước phải lớn hơn 0";
      } else if (num > 9999) {
        errorMsg = "Kích thước tối đa là 9999 cm";
      }
    }
    setDimErrors((prev) => ({ ...prev, [key]: errorMsg }));
  };

  const validateDimensions = () => {
    if (dimErrors.dimL || dimErrors.dimW || dimErrors.dimH) {
      toast.error("Vui lòng sửa các lỗi kích thước trước khi lưu!");
      return false;
    }
    const keys = ["dimL", "dimW", "dimH"];
    const labels = { dimL: "Chiều dài", dimW: "Chiều rộng", dimH: "Chiều cao" };
    for (const key of keys) {
      const val = form[key];
      if (val !== undefined && val !== null && val !== "") {
        const num = Number(val);
        if (isNaN(num) || num <= 0 || num > 9999) {
          toast.error(`${labels[key]} phải là số dương lớn hơn 0 và nhỏ hơn hoặc bằng 9999 cm`);
          return false;
        }
      }
    }
    return true;
  };

  // Helper: lookup FK ID from metadata by name
  const findCategoryId = (name) => metadata.categories?.find(c => c.category_name === name)?.pk_product_category_id || null;
  const findMaterialId = (name) => metadata.materials?.find(m => m.material_name === name)?.pk_product_material_id || null;
  const findColorId = (name) => metadata.colors?.find(c => c.color_name === name)?.pk_product_color_id || null;

  const PRODUCT_TYPE_MAP = { "Hàng sẵn": "FINISHED", "Hàng mộc": "RAW", "Hàng khách đặt": "CUSTOM" };

  // Build API payload from form
  const buildPayload = async (includePricing = false) => {
    let imgUrl = product.img || null;
    if (imageFile) {
      const result = await uploadImage(imageFile);
      imgUrl = result.url;
    }
    const payload = {
      product_name: form.name,
      sku: form.code,
      fk_category_id: findCategoryId(form.category),
      fk_material_id: findMaterialId(form.material),
      fk_color_id: findColorId(form.color),
      product_img: imgUrl,
      description: form.description,
      product_type: PRODUCT_TYPE_MAP[form.productType] || "FINISHED",
      warranty_months: Number(form.warrantyMonths) || 12,
      size: { length: form.dimL || null, width: form.dimW || null, height: form.dimH || null },
      is_gift: form.productType === "Quà tặng" ? 1 : 0,
    };
    if (includePricing) {
      payload.pricing = {
        cost_price: latestCost || form.costPrice || 0,
        raw_price: isWood ? (form.finishedRetailPrice || 0) : 0,
        final_price: isWood ? (form.rawRetailPrice || 0) : (form.retailPrice || 0),
        profit_margin: form.margin || 0,
      };
    }
    return payload;
  };

  const handleSaveEdit = async () => {
    if (!form.name?.trim()) { toast.error("Tên sản phẩm không được để trống!"); return; }
    if (!form.code?.trim()) { toast.error("Mã sản phẩm không được để trống!"); return; }
    if (!validateDimensions()) return;
    setSaving(true);
    try {
      const payload = await buildPayload(false);
      await productService.updateProduct(product.id, payload);
      toast.success("Đã lưu thông tin sản phẩm thành công!");
      onSave?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Lỗi khi cập nhật sản phẩm");
    } finally { setSaving(false); }
  };

  const handleSavePricing = async () => {
    if (isWood) {
      if (!form.rawRetailPrice || !form.finishedRetailPrice) {
        toast.error("Vui lòng nhập đầy đủ giá bán mộc và giá hoàn thiện."); return;
      }
    } else {
      if (!form.retailPrice) { toast.error("Vui lòng nhập giá bán niêm yết."); return; }
    }
    if (!validateDimensions()) return;
    setSaving(true);
    try {
      const payload = await buildPayload(true);
      await productService.updateProduct(product.id, payload);
      toast.success("Đã định giá và mở bán thành công!");
      onSave?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Lỗi khi định giá sản phẩm");
    } finally { setSaving(false); }
  };

  const handleCreate = async () => {
    if (!form.name?.trim()) { toast.error("Tên sản phẩm không được để trống!"); return; }
    if (!form.code?.trim()) { toast.error("Mã sản phẩm không được để trống!"); return; }
    if (!validateDimensions()) return;
    setSaving(true);
    try {
      const payload = await buildPayload(true);
      await productService.createProduct(payload);
      toast.success("Tạo sản phẩm thành công!");
      onSave?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Lỗi khi tạo sản phẩm");
    } finally { setSaving(false); }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const totalCost = latestCost + form.processingCost;
  const multiplier = 1 + form.margin / 100;
  const suggestedRaw = latestCost * multiplier;
  const suggestedFinished = totalCost * multiplier;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="bg-white w-full max-w-[1000px] max-h-[90vh] rounded-lg flex flex-col relative animate-in zoom-in-95 duration-300 shadow-2xl overflow-hidden border border-slate-200">
        {/* ── Header ── */}
        <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {isCreate ? (
              <h2 className="text-base font-bold text-[var(--text-main)] flex items-center gap-2">
                <Plus size={16} className="text-[var(--brand-primary)]" /> Thêm sản phẩm mới
              </h2>
            ) : (
              <>
                {/* Segmented Control */}
                <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                  <button
                    onClick={() => onSwitchMode("view")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] uppercase tracking-wider font-bold rounded-md transition-all ${mode === "view" ? "bg-white text-slate-800" : "text-slate-500 hover:text-slate-700"}`}
                  >
                    <Eye size={12} /> Xem chi tiết
                  </button>
                  <button
                    onClick={() => onSwitchMode("edit")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] uppercase tracking-wider font-bold rounded-md transition-all ${mode === "edit" ? "bg-white text-[var(--brand-primary)]" : "text-slate-500 hover:text-slate-700"}`}
                  >
                    <Pencil size={12} /> Sửa thông tin
                  </button>
                  {product.productType !== "Hàng khách đặt" && (
                    <button
                      onClick={() => onSwitchMode("pricing")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] uppercase tracking-wider font-bold rounded-md transition-all ${mode === "pricing" ? "bg-emerald-500 text-white" : "text-slate-500 hover:text-slate-700"}`}
                    >
                      <Tag size={12} /> Định giá & Mở bán
                    </button>
                  )}
                </div>
                <span className="font-mono text-sm text-[var(--brand-primary)] px-2 py-0.5 bg-[var(--brand-primary)]/5 rounded-md border border-[var(--brand-primary)]/10">
                  {product.code}
                </span>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-full transition text-slate-400 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <div className="flex gap-6">
            {/* Left column: image + status */}
            <div className="w-[160px] shrink-0 space-y-3">
              {(mode === "edit" || isCreate) ? (
                <label className="block cursor-pointer group relative">
                  {(imagePreview || product.img) ? (
                    <img
                      src={imagePreview || product.img}
                      alt={form.name || "Ảnh sản phẩm"}
                      className="w-full aspect-square object-cover rounded-xl border group-hover:opacity-70 transition"
                    />
                  ) : (
                    <div className="w-full aspect-square bg-gray-100 rounded-xl border flex flex-col items-center justify-center text-slate-300 group-hover:bg-gray-200 transition">
                      <Upload size={28} className="mb-1" />
                      <span className="text-xs">Chọn ảnh</span>
                    </div>
                  )}
                  <div className="absolute inset-0 rounded-xl flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition">
                    <Upload size={20} className="text-white" />
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              ) : product.img ? (
                <img
                  src={product.img}
                  alt={product.name}
                  onClick={() => setZoomImage({ src: product.img, alt: `${product.name} (${product.code})` })}
                  className="w-full aspect-square object-cover rounded-xl border hover:scale-105 transition-all cursor-zoom-in active:scale-95 duration-200 hover:shadow-md"
                />
              ) : (
                <div className="w-full aspect-square bg-gray-100 rounded-xl border flex flex-col items-center justify-center text-slate-300">
                  <ImageIcon size={32} className="mb-1" />
                  <span className="text-xs">Chưa có ảnh</span>
                </div>
              )}
              <div className="flex justify-center">
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold rounded-lg"
                  style={{
                    backgroundColor: sc?.bg,
                    color: sc?.text,
                    border: `1px solid ${sc?.border}`,
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: sc?.text }}
                  />
                  {product.status}
                </span>
              </div>

              {mode === "pricing" && (
                <div className="pt-2 space-y-2">
                  <div>
                    <span className="text-[11px] text-[var(--text-secondary)] block mb-0.5">
                      Phân loại
                    </span>
                    <span className="font-semibold text-[var(--text-main)] text-sm">
                      {product.productType || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-[var(--text-secondary)] block mb-0.5">
                      Tồn kho hiện tại
                    </span>
                    <span className="font-semibold text-[var(--text-main)] text-sm">
                      {product.stock}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Right column */}
            <div className="flex-1 space-y-5">
              {/* Title / Form basic inputs */}
              {(mode === "edit" || isCreate) ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <InputField
                      label="Tên sản phẩm *"
                      value={form.name}
                      onChange={set("name")}
                      placeholder="Nhập tên sản phẩm"
                    />
                  </div>
                  <InputField
                    label="Mã sản phẩm *"
                    value={form.code}
                    onChange={set("code")}
                    placeholder="VD: BBG-HS-..."
                  />
                  <SelectField
                    label="Danh mục"
                    value={form.category}
                    onChange={set("category")}
                    options={categories}
                    placeholder="Chọn danh mục"
                  />
                </div>
              ) : (
                <div>
                  <h1 className="text-lg font-bold text-[var(--text-main)] mb-0.5">
                    {product.name}
                  </h1>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {product.category}
                  </p>
                </div>
              )}

              {/* Edit Mode Content */}
              {(mode === "edit" || isCreate) && (
                <div className="grid grid-cols-2 gap-4">
                  {isCreate ? (
                    <SelectField
                      label="Loại hàng"
                      value={form.productType}
                      onChange={set("productType")}
                      options={["Hàng sẵn", "Hàng mộc", "Hàng khách đặt"]}
                    />
                  ) : (
                    <div>
                      <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                        Loại hàng
                      </label>
                      <div className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[var(--text-secondary)] bg-slate-50 font-medium select-none">
                        {form.productType}
                      </div>
                    </div>
                  )}
                  <SelectField
                    label="Chất liệu"
                    value={form.material}
                    onChange={set("material")}
                    options={materials}
                    placeholder="Chọn chất liệu"
                  />
                  <SelectField
                    label="Màu sắc"
                    value={form.color}
                    onChange={set("color")}
                    options={colors}
                    placeholder="Chọn màu"
                  />
                  <div className="col-span-2">
                    <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                      Kích thước (D × R × C) cm
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        className={`w-20 border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 text-center transition-all ${
                          dimErrors.dimL
                            ? "border-red-400 focus:ring-red-500/20 focus:border-red-500"
                            : "border-slate-200 focus:ring-[var(--brand-primary)]/30 focus:border-[var(--brand-primary)]"
                        }`}
                        placeholder="Dài"
                        value={form.dimL}
                        onKeyDown={handleDimensionKeyDown}
                        onChange={(e) => handleDimensionChange("dimL", e.target.value)}
                      />
                      <span className="text-slate-400 font-bold">×</span>
                      <input
                        type="text"
                        className={`w-20 border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 text-center transition-all ${
                          dimErrors.dimW
                            ? "border-red-400 focus:ring-red-500/20 focus:border-red-500"
                            : "border-slate-200 focus:ring-[var(--brand-primary)]/30 focus:border-[var(--brand-primary)]"
                        }`}
                        placeholder="Rộng"
                        value={form.dimW}
                        onKeyDown={handleDimensionKeyDown}
                        onChange={(e) => handleDimensionChange("dimW", e.target.value)}
                      />
                      <span className="text-slate-400 font-bold">×</span>
                      <input
                        type="text"
                        className={`w-20 border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 text-center transition-all ${
                          dimErrors.dimH
                            ? "border-red-400 focus:ring-red-500/20 focus:border-red-500"
                            : "border-slate-200 focus:ring-[var(--brand-primary)]/30 focus:border-[var(--brand-primary)]"
                        }`}
                        placeholder="Cao"
                        value={form.dimH}
                        onKeyDown={handleDimensionKeyDown}
                        onChange={(e) => handleDimensionChange("dimH", e.target.value)}
                      />
                    </div>
                    {(dimErrors.dimL || dimErrors.dimW || dimErrors.dimH) && (
                      <div className="mt-2 space-y-1">
                        {dimErrors.dimL && (
                          <p className="text-[10px] text-red-500 font-bold ml-1">
                            * Chiều dài: {dimErrors.dimL}
                          </p>
                        )}
                        {dimErrors.dimW && (
                          <p className="text-[10px] text-red-500 font-bold ml-1">
                            * Chiều rộng: {dimErrors.dimW}
                          </p>
                        )}
                        {dimErrors.dimH && (
                          <p className="text-[10px] text-red-500 font-bold ml-1">
                            * Chiều cao: {dimErrors.dimH}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="col-span-2">
                    <InputField
                      label="Bảo hành (tháng)"
                      type="number"
                      value={form.warrantyMonths}
                      onChange={set("warrantyMonths")}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                      Mô tả sản phẩm
                    </label>
                    <textarea
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/30 min-h-[72px] resize-none"
                      value={form.description}
                      onChange={set("description")}
                      placeholder="Nhập mô tả..."
                    />
                  </div>
                </div>
              )}

              {/* View Mode Content */}
              {mode === "view" && (
                <>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                    <Field label="Loại hàng" value={product.productType} />
                    <Field label="Chất liệu" value={product.material} />
                    <Field label="Màu sắc" value={product.color} />
                    <Field label="Kích thước" value={product.dimensions} />
                    {product.status !== "Chưa định giá" && (
                      <div>
                        <span className="text-[11px] text-[var(--text-secondary)] block mb-0.5">
                          Bảo hành
                        </span>
                        <span className="flex items-center gap-1 font-bold text-[var(--brand-primary)] text-sm">
                          <ShieldCheck size={13} />{" "}
                          {product.warrantyMonths || 12} tháng
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                    <PricingView item={product} />
                    <div className="border-t border-slate-200 pt-3 flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        Tồn kho thực tế
                      </span>
                      <span className="font-black text-[var(--text-main)]">
                        {product.productType === "Hàng khách đặt"
                          ? "—"
                          : product.stock}
                      </span>
                    </div>
                    {product.productType !== "Hàng khách đặt" && product.minStock > 0 && (
                      <div className="border-t border-slate-200 pt-3 flex items-center justify-between">
                        <span className="text-xs text-slate-500">
                          Định mức tối thiểu (Kế toán nhập)
                        </span>
                        <span className="font-bold text-slate-600 text-sm">
                          {product.minStock}
                        </span>
                      </div>
                    )}
                  </div>

                  {product.description && (
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">
                        Mô tả
                      </span>
                      <p className="text-sm text-gray-700 bg-[var(--bg-main)] p-3 rounded-lg leading-relaxed">
                        {product.description}
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Pricing Mode Content */}
              {mode === "pricing" && (
                <>
                  {/* Block 1: Chi phí */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                        <Wrench size={14} className="text-slate-400" /> 1. Chi
                        phí cấu thành
                      </h3>
                      {newestLot && (
                        <span className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-400 italic">
                          Lần nhập cuối:{" "}
                          {new Date(newestLot.importDate).toLocaleDateString(
                            "vi-VN",
                          )}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Giá nhập & Chi phí gia công & Lịch sử */}
                      <div className="col-span-2 grid grid-cols-3 gap-4 items-start">
                        <div className="col-span-1 flex flex-col gap-4">
                          {/* Giá nhập gần nhất */}
                          <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-4 flex flex-col justify-center h-full">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                              Giá nhập gốc / Lô mới nhất
                            </span>
                            <span className="text-2xl font-black text-[var(--text-main)]">
                              {fmtCost(latestCost)}
                            </span>
                          </div>
                        </div>

                        <div className="col-span-2 flex flex-col max-h-[180px] w-full">
                          <div className="flex items-center justify-between mb-3 shrink-0">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                              Lịch sử lô hàng
                            </span>
                            <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                              T.cộng: {product.lots?.length || 0}
                            </span>
                          </div>

                          <div className="overflow-y-auto custom-scrollbar flex-1 pr-2 space-y-2.5">
                            {product.lots?.length > 0 ? (
                              [...product.lots]
                                .sort(
                                  (a, b) =>
                                    new Date(b.importDate) -
                                    new Date(a.importDate),
                                )
                                .map((lot, idx) => {
                                  const isLatest = idx === 0;
                                  return (
                                    <div
                                      key={lot.lotId || idx}
                                      className={`bg-white border ${isLatest ? "border-emerald-200 shadow-sm shadow-emerald-500/10" : "border-slate-100"} rounded-lg p-2.5 flex items-center justify-between transition-all hover:border-slate-300`}
                                    >
                                      <div className="flex items-center gap-3">
                                        <div
                                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isLatest ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-400"}`}
                                        >
                                          <Package size={14} />
                                        </div>
                                        <div className="flex flex-col">
                                          <div className="flex items-center gap-2">
                                            <span className="text-[11px] font-black text-slate-700">
                                              {new Date(
                                                lot.importDate,
                                              ).toLocaleDateString("vi-VN")}
                                            </span>
                                            {isLatest && (
                                              <span className="text-[8px] bg-[var(--brand-primary)] text-white px-1.5 py-0.5 rounded uppercase font-black tracking-wider">
                                                Mới
                                              </span>
                                            )}
                                          </div>
                                          <span className="text-[10px] font-medium text-slate-400 mt-0.5">
                                            Tồn:{" "}
                                            <span className="text-slate-600 font-bold">
                                              {lot.remainingQuantity ??
                                                lot.initialQuantity ??
                                                0}
                                            </span>{" "}
                                            / {lot.initialQuantity ?? 0}
                                          </span>
                                        </div>
                                      </div>
                                      <span
                                        className={`text-xs font-black ${isLatest ? "text-emerald-600" : "text-slate-600"}`}
                                      >
                                        {fmtCurrency(lot.importPrice)}
                                      </span>
                                    </div>
                                  );
                                })
                            ) : (
                              <div className="text-center py-4 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-400 italic">
                                Chưa có dữ liệu nhập hàng
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Block 2: Định giá */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-4">
                    <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                      <Tag size={14} className="text-slate-400" /> 2. Quyết định
                      giá niêm yết
                    </h3>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                          Chi phí gia công
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[var(--text-main)] outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/30 focus:border-[var(--brand-primary)] transition pr-8 bg-white"
                            value={formatNum(form.processingCost)}
                            onChange={setNum("processingCost")}
                            placeholder="0"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                            ₫
                          </span>
                        </div>
                      </div>
                      <InputField
                        label="Biên lãi gộp (%)"
                        value={formatNum(form.margin)}
                        onChange={setNum("margin")}
                        postFix="%"
                      />
                      <InputField
                        label="Hạn bảo hành"
                        value={formatNum(form.warrantyMonths)}
                        onChange={setNum("warrantyMonths")}
                        postFix="Tháng"
                      />
                    </div>

                    <div className="p-4 bg-white border border-[var(--brand-primary)]/20 rounded-lg space-y-4 relative overflow-hidden">
                      <div className="absolute top-0 right-0 py-0.5 px-2 bg-[var(--brand-primary)]/10 text-[9px] font-black uppercase text-[var(--brand-primary)] rounded-bl-lg border-l border-b border-[var(--brand-primary)]/20">
                        Gợi ý hệ thống
                      </div>

                      {isWood ? (
                        <div className="grid grid-cols-2 gap-5 mt-2">
                          <div>
                            <div className="flex justify-between items-end mb-1">
                              <label className="block text-xs font-bold text-amber-600 uppercase">
                                Giá bán mộc
                              </label>
                              <span
                                onClick={() =>
                                  setForm((prev) => ({
                                    ...prev,
                                    rawRetailPrice: suggestedRaw,
                                  }))
                                }
                                className="text-[10px] text-slate-400 italic cursor-pointer hover:text-amber-600 transition-colors bg-slate-50 hover:bg-amber-50 px-1.5 py-0.5 rounded border border-transparent hover:border-amber-200"
                              >
                                Gợi ý: {fmtCurrency(suggestedRaw)}
                              </span>
                            </div>
                            <div className="relative">
                              <input
                                type="text"
                                className="w-full border border-amber-200 bg-amber-50 rounded-lg px-3 py-2 text-lg font-black text-amber-700 outline-none focus:ring-2 focus:ring-amber-400/30"
                                value={formatNum(form.rawRetailPrice)}
                                onChange={setNum("rawRetailPrice")}
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-amber-400">
                                ₫
                              </span>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between items-end mb-1">
                              <label className="block text-xs font-bold text-emerald-600 uppercase">
                                Giá hoàn thiện
                              </label>
                              <span
                                onClick={() =>
                                  setForm((prev) => ({
                                    ...prev,
                                    finishedRetailPrice: suggestedFinished,
                                  }))
                                }
                                className="text-[10px] text-slate-400 italic cursor-pointer hover:text-emerald-600 transition-colors bg-slate-50 hover:bg-emerald-50 px-1.5 py-0.5 rounded border border-transparent hover:border-emerald-200"
                              >
                                Gợi ý: {fmtCurrency(suggestedFinished)}
                              </span>
                            </div>
                            <div className="relative">
                              <input
                                type="text"
                                className="w-full border border-emerald-200 bg-emerald-50 rounded-lg px-3 py-2 text-lg font-black text-emerald-700 outline-none focus:ring-2 focus:ring-emerald-400/30"
                                value={formatNum(form.finishedRetailPrice)}
                                onChange={setNum("finishedRetailPrice")}
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-emerald-400">
                                ₫
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-2">
                          <div className="flex justify-between items-end mb-1">
                            <label className="block text-xs font-bold text-[var(--brand-primary)] uppercase">
                              Giá bán niêm yết
                            </label>
                            <span
                              onClick={() =>
                                setForm((prev) => ({
                                  ...prev,
                                  retailPrice: suggestedFinished,
                                }))
                              }
                              className="text-[10px] text-slate-400 italic cursor-pointer hover:text-[var(--brand-primary)] transition-colors bg-slate-50 hover:bg-[var(--brand-primary)]/10 px-1.5 py-0.5 rounded border border-transparent hover:border-[var(--brand-primary)]/20"
                            >
                              Gợi ý: {fmtCurrency(suggestedFinished)}
                            </span>
                          </div>
                          <div className="relative">
                            <input
                              type="text"
                              className="w-full border border-[var(--brand-primary)]/20 bg-[var(--brand-primary)]/5 rounded-lg px-4 py-3 text-2xl font-black text-[var(--brand-primary)] outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/30"
                              value={formatNum(form.retailPrice)}
                              onChange={setNum("retailPrice")}
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-[var(--brand-primary)]/50">
                              ₫
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="bg-slate-50/60 px-6 py-4 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div>
            {canDelete && mode === "edit" && (
              <button
                onClick={() => onDelete?.(product)}
                className="px-4 py-2 rounded-lg text-[13px] font-bold bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition flex items-center gap-2"
              >
                <Trash2 size={15} /> Xóa sản phẩm
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-200 border border-slate-200 bg-white rounded-lg transition"
            >
              Hủy
            </button>

            {mode === "view" && (
              <button
                onClick={() => onSwitchMode("edit")}
                className="px-5 py-2.5 rounded-lg text-sm font-bold text-[var(--brand-primary)] bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/20 hover:bg-[var(--brand-primary)]/20 transition flex items-center gap-2"
              >
                <Pencil size={14} /> Chỉnh sửa
              </button>
            )}

            {mode === "edit" && (
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-[var(--brand-primary)] hover:opacity-90 transition active:scale-95 flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Pencil size={14} />} {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            )}

            {mode === "pricing" && (
              <button
                onClick={handleSavePricing}
                disabled={saving}
                className="px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition active:scale-95 flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Tag size={14} />} {saving ? "Đang xử lý..." : "Xác nhận & Mở bán"}
              </button>
            )}

            {isCreate && (
              <button
                onClick={handleCreate}
                disabled={saving}
                className="px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-[var(--brand-primary)] hover:opacity-90 transition active:scale-95 flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} {saving ? "Đang tạo..." : "Tạo sản phẩm"}
              </button>
            )}
          </div>
        </div>
      </div>

      <ImageZoomModal
        isOpen={!!zoomImage}
        src={zoomImage?.src}
        alt={zoomImage?.alt}
        onClose={() => setZoomImage(null)}
      />
    </div>
  );
}
