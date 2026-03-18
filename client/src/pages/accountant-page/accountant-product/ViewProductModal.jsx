/**
 * ViewProductModal – Xem Chi Tiết Sản Phẩm trong Kho (Read-Only)
 *
 * Created By: HieuNM – 12/03/2026
 */

import {
    X, Package, Tag, Layers, Palette, Ruler, MapPin,
    BarChart2, DollarSign, CheckCircle, Hammer, Users,
    Image as ImageIcon, TrendingDown, TrendingUp, ArrowDownToLine,
} from "lucide-react";

// ── Helpers ──────────────────────────────────────────────
const fmtCurrency = (n) =>
    n != null && n !== "" ? new Intl.NumberFormat("vi-VN").format(n) + "₫" : "—";

const TYPE_CONFIG = {
    FINISHED: {
        label: "Hàng có sẵn",
        icon: CheckCircle,
        bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0",
        headerBg: "linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)",
    },
    RAW: {
        label: "Hàng mộc",
        icon: Hammer,
        bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA",
        headerBg: "linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)",
    },
    CUSTOM: {
        label: "Hàng khách đặt",
        icon: Users,
        bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE",
        headerBg: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)",
    },
};

const STATUS_COLOR = {
    "Đang kinh doanh": { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
    "Đang sản xuất": { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
    "Hoàn thành": { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
};

const InfoRow = ({ icon: Icon, label, value, valueStyle }) => (
    <div className="flex items-start gap-3 py-2.5 border-b last:border-0" style={{ borderColor: "var(--grid-border)" }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
            style={{ backgroundColor: "var(--bg-main)" }}>
            {Icon && <Icon size={14} style={{ color: "var(--text-placeholder)" }} />}
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5"
                style={{ color: "var(--text-placeholder)" }}>{label}</p>
            <p className="text-[13px] font-semibold break-words" style={{ color: "var(--text-main)", ...valueStyle }}>
                {value || "—"}
            </p>
        </div>
    </div>
);

// ─────────────────────────────────────────────────────────
export default function ViewProductModal({ product, onClose }) {
    if (!product) return null;

    const cfg = TYPE_CONFIG[product.type] || TYPE_CONFIG.FINISHED;
    const TypeIcon = cfg.icon;

    const dims = [product.length, product.width, product.height].filter(Boolean);
    const hasPrice = product.sellingPrice != null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                style={{ maxHeight: "88vh" }}>

                {/* ── Gradient Header by Type ── */}
                <div className="px-6 py-5 shrink-0 relative" style={{ background: cfg.headerBg }}>
                    {/* Close */}
                    <button onClick={onClose}
                        className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-black/5 cursor-pointer transition"
                        style={{ color: cfg.text }}>
                        <X size={18} />
                    </button>

                    {/* Type badge + code */}
                    <div className="flex items-center gap-2 mb-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold"
                            style={{ backgroundColor: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}` }}>
                            <TypeIcon size={12} />
                            {cfg.label}
                        </span>
                        <span className="text-[11px] font-mono font-bold px-2 py-1 rounded-lg bg-white/70"
                            style={{ color: cfg.text }}>
                            {product.code}
                        </span>
                    </div>

                    {/* Product name */}
                    <h2 className="text-[17px] font-black leading-snug pr-8"
                        style={{ color: cfg.text }}>
                        {product.name}
                    </h2>

                </div>

                {/* ── Scrollable Body ── */}
                <div className="flex-1 overflow-y-auto">
                    {/* Ảnh + Tồn kho nổi bật */}
                    <div className="flex gap-0 border-b" style={{ borderColor: "var(--grid-border)" }}>
                        {/* Ảnh */}
                        <div className="w-40 shrink-0 flex items-center justify-center border-r p-4"
                            style={{ borderColor: "var(--grid-border)", backgroundColor: "var(--bg-main)" }}>
                            {product.img
                                ? <img src={product.img} alt={product.name}
                                    className="w-28 h-28 rounded-xl object-cover shadow-sm"
                                    style={{ border: "1px solid var(--grid-border)" }} />
                                : <div className="w-28 h-28 rounded-xl flex flex-col items-center justify-center gap-2"
                                    style={{ border: "2px dashed var(--grid-border)", color: "var(--text-placeholder)" }}>
                                    <ImageIcon size={28} strokeWidth={1.5} />
                                    <span className="text-[10px]">Chưa có ảnh</span>
                                </div>
                            }
                        </div>

                        {/* Stats nhanh – hàng trên: Tồn / Giá nhập / Giá bán */}
                        <div className="flex-1 flex flex-col divide-y" style={{ borderColor: "var(--grid-border)" }}>
                            <div className="grid grid-cols-3 divide-x" style={{ borderColor: "var(--grid-border)" }}>
                                {/* Tồn kho */}
                                <div className="p-4 flex flex-col gap-1">
                                    <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1"
                                        style={{ color: "var(--text-placeholder)" }}>
                                        <BarChart2 size={10} /> Tồn kho
                                    </span>
                                    <span className="text-[26px] font-black leading-none"
                                        style={{ color: product.stock === 0 ? "#DC2626" : product.stock <= 3 ? "#D97706" : "#15803D" }}>
                                        {product.stock}
                                    </span>
                                    <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                                        {product.stock === 0 ? "Hết hàng" : product.stock <= 3 ? "Sắp hết" : "Còn hàng"}
                                    </span>
                                </div>

                                {/* Giá nhập */}
                                <div className="p-4 flex flex-col gap-1">
                                    <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1"
                                        style={{ color: "var(--text-placeholder)" }}>
                                        <ArrowDownToLine size={10} /> Giá nhập
                                    </span>
                                    {product.importPrice != null
                                        ? <>
                                            <span className="text-[16px] font-black leading-none" style={{ color: "#C2410C" }}>
                                                {new Intl.NumberFormat("vi-VN").format(product.importPrice)}
                                            </span>
                                            <span className="text-[11px] font-bold" style={{ color: "#C2410C" }}>₫</span>
                                        </>
                                        : <span className="text-[13px] italic" style={{ color: "var(--text-placeholder)" }}>—</span>
                                    }
                                </div>

                                {/* Giá bán */}
                                <div className="p-4 flex flex-col gap-1">
                                    <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1"
                                        style={{ color: "var(--text-placeholder)" }}>
                                        <DollarSign size={10} /> Giá bán
                                    </span>
                                    {hasPrice
                                        ? <>
                                            <span className="text-[16px] font-black leading-none" style={{ color: "var(--brand-primary)" }}>
                                                {new Intl.NumberFormat("vi-VN").format(product.sellingPrice)}
                                            </span>
                                            <span className="text-[11px] font-bold" style={{ color: "var(--brand-primary)" }}>₫</span>
                                        </>
                                        : <span className="text-[13px] italic" style={{ color: "var(--text-placeholder)" }}>Chưa định giá</span>
                                    }
                                </div>
                            </div>

                            {/* Hàng dưới: Tồn min */}
                            <div className="p-3 flex items-center gap-3">
                                <TrendingDown size={14} style={{ color: "var(--text-placeholder)" }} />
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-placeholder)" }}>Tồn tối thiểu</p>
                                    <p className="text-[15px] font-bold" style={{ color: "var(--text-main)" }}>{product.minStock ?? "—"}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Chi tiết ── */}
                    <div className="px-6 py-2">
                        <InfoRow icon={Layers} label="Danh mục" value={product.category} />
                        <InfoRow icon={Tag} label="Loại" value={product.materialType} />
                        <InfoRow icon={Palette} label="Màu sắc" value={product.color} />
                        {dims.length > 0 && (
                            <InfoRow icon={Ruler} label="Kích thước (Dài × Rộng × Cao)"
                                value={`${dims.join(" × ")} cm`} />
                        )}

                        {product.details && (
                            <div className="py-2.5 border-b" style={{ borderColor: "var(--grid-border)" }}>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                                        style={{ backgroundColor: "var(--bg-main)" }}>
                                        <Package size={14} style={{ color: "var(--text-placeholder)" }} />
                                    </div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest"
                                        style={{ color: "var(--text-placeholder)" }}>Chi tiết sản phẩm</p>
                                </div>
                                <p className="text-[13px] leading-relaxed ml-10 italic rounded-lg px-3 py-2"
                                    style={{ color: "var(--text-secondary)", backgroundColor: "var(--bg-main)", border: "1px solid var(--grid-border)" }}>
                                    {product.details}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Footer ── */}
                <div className="px-6 py-4 border-t shrink-0 flex items-center justify-end"
                    style={{ borderColor: "var(--grid-border)", backgroundColor: "var(--bg-main)" }}>
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
