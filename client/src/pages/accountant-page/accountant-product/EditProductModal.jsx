/**
 * EditProductModal – Chỉnh Sửa Sản Phẩm (Giá nhập,  Tồn tối thiểu)
 *
 * Created By: HieuNM
 */

import { useState } from "react";
import {
    X, Package, Tag, Layers, Palette, Ruler, MapPin,
    BarChart2, DollarSign, CheckCircle, Hammer, Users,
    Image as ImageIcon, TrendingDown, TrendingUp, ArrowDownToLine,
    Save
} from "lucide-react";

// ── Helpers ──────────────────────────────────────────────
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
export default function EditProductModal({ product, onClose, onSave }) {
    if (!product) return null;

    const [minStock, setMinStock] = useState(product.minStock || "");

    const cfg = TYPE_CONFIG[product.type] || TYPE_CONFIG.FINISHED;
    const TypeIcon = cfg.icon;

    const dims = [product.length, product.width, product.height].filter(Boolean);

    const handleSave = (e) => {
        e.preventDefault();
        onSave({
            ...product, // giữ nguyên các field khác
            minStock: minStock === "" ? null : Number(minStock),
        });
    };

    const inpStr = "w-full h-10 px-4 mt-2 rounded-xl text-[14px] border focus:outline-none focus:ring-2 focus:ring-purple-300 transition font-bold";
    const inpS = { borderColor: "var(--grid-border)", backgroundColor: "#fff", color: "var(--text-main)" };

    return (
        <form onSubmit={handleSave}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                style={{ maxHeight: "88vh" }}>

                {/* ── Gradient Header by Type ── */}
                <div className="px-6 py-5 shrink-0 relative" style={{ background: cfg.headerBg }}>
                    {/* Close */}
                    <button type="button" onClick={onClose}
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
                            Mã sản phẩm: {product.code || product.sku}
                        </span>
                    </div>

                    {/* Product name */}
                    <h2 className="text-[17px] font-black leading-snug pr-8"
                        style={{ color: cfg.text }}>
                        Cập nhật định mức: {product.name}
                    </h2>
                </div>

                {/* ── Scrollable Body ── */}
                <div className="flex-1 overflow-y-auto">
                    {/* Ảnh + Chỉnh sửa số liệu nổi bật */}
                    <div className="flex gap-0 border-b flex-col sm:flex-row" style={{ borderColor: "var(--grid-border)" }}>
                        {/* Ảnh */}
                        <div className="w-full sm:w-40 shrink-0 flex items-center justify-center border-b sm:border-b-0 sm:border-r p-4"
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

                        {/* Input form for MinStock Only */}
                        <div className="flex-1 p-6 bg-gray-50/30 flex flex-col justify-center">
                            <div className="max-w-xs">
                                <label className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2"
                                    style={{ color: "var(--text-placeholder)" }}>
                                    <TrendingDown size={14} /> Tồn kho tối thiểu (Định mức)
                                </label>
                                <p className="text-[11px] mt-1 mb-2" style={{ color: "var(--text-secondary)" }}>
                                    Hệ thống sẽ cảnh báo khi số lượng Sẵn sàng thấp hơn mức này.
                                </p>
                                <input type="number" min="0"
                                    value={minStock} onChange={e => setMinStock(e.target.value)}
                                    className={inpStr} style={inpS} placeholder="Ví dụ: 2" />
                            </div>
                        </div>
                    </div>

                    {/* ── Chi tiết (Read-only) ── */}
                    <div className="px-6 py-2 pb-6">
                        <InfoRow icon={ArrowDownToLine} label="Giá nhập hiện tại"
                            value={product.importPrice ? new Intl.NumberFormat("vi-VN").format(product.importPrice) + " ₫" : "—"}
                            valueStyle={{ color: "#C2410C", fontSize: "15px" }} />
                        <InfoRow icon={Layers} label="Danh mục" value={product.category} />
                        <InfoRow icon={Tag} label="Loại" value={product.materialType || product.materialType} />
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
                <div className="px-6 py-4 border-t shrink-0 flex items-center justify-end gap-3"
                    style={{ borderColor: "var(--grid-border)", backgroundColor: "var(--bg-main)" }}>
                    <button type="button" onClick={onClose}
                        className="h-10 px-6 rounded-xl text-[13px] font-bold border cursor-pointer hover:bg-gray-50 transition"
                        style={{ borderColor: "var(--grid-border)", color: "var(--text-secondary)" }}>
                        Trở lại
                    </button>
                    <button type="submit"
                        className="h-10 px-6 rounded-xl text-[13px] font-bold cursor-pointer hover:opacity-90 transition flex items-center gap-2"
                        style={{ backgroundColor: "var(--brand-primary)", color: "#fff" }}>
                        <Save size={14} /> Lưu Thay Đổi
                    </button>
                </div>
            </div>
        </form>
    );
}
