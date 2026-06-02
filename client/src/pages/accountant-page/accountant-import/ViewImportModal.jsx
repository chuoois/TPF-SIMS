/**
 * ViewImportModal – Xem Chi Tiết Phiếu Nhập Kho (Read-Only)
 * Hỗ trợ cả dòng đơn lẻ và dòng bộ (isBundle=true) với bảng các món lẻ.
 * Updated: Tải chi tiết từ API để hiển thị đúng tên sản phẩm.
 */

import { useState, useEffect } from "react";
import {
    X, ArrowDownToLine, Building2, Calendar, Warehouse,
    StickyNote, Package, Ruler, Tag, Layers, AlignLeft, Hash, List, Info, Hexagon
} from "lucide-react";
import importService from "@/services/import.service";
import { toast } from "react-hot-toast";

// ── Helpers ──────────────────────────────────────────────
const fmtCurrency = (n) =>
    n != null ? new Intl.NumberFormat("vi-VN").format(n) + "₫" : "—";

const fmtDate = (s) => {
    if (!s) return "—";
    const d = new Date(s);
    return `${d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} · ${d.toLocaleDateString("vi-VN")}`;
};

const InfoBlock = ({ icon: Icon, label, value, className = "" }) => (
    <div className={`flex flex-col gap-1.5 p-3 rounded-xl bg-gray-50/70 border border-gray-100 ${className}`}>
        <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 text-gray-500">
            {Icon && <Icon size={12} className="text-gray-400" />}{label}
        </span>
        <span className="text-[13px] font-semibold text-gray-800">
            {value || "—"}
        </span>
    </div>
);

// ── UnitListGrid ─────────────────────────────────────────
function UnitListGrid({ qty, unitIds, prefix }) {
    let displayIds = [];
    if (unitIds && Array.isArray(unitIds) && unitIds.length > 0) {
        displayIds = unitIds.map(u => typeof u === 'string' ? u : u.unitId);
    } else if (qty > 0) {
        for (let i = 1; i <= qty; i++) {
            displayIds.push(`${prefix || 'UNIT'}-${String(i).padStart(3, '0')}`);
        }
    }

    if (displayIds.length === 0) return null;

    return (
        <div className="rounded-xl border border-purple-100 bg-white overflow-hidden shadow-sm h-full flex flex-col">
            <div className="px-4 py-2.5 bg-purple-50/40 border-b border-purple-100 shrink-0 flex items-center justify-between">
                 <p className="text-[10px] font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1.5">
                     <Hash size={12}/> Mã định danh chi tiết
                 </p>
                 <span className="text-[10px] font-semibold bg-white px-2 py-0.5 rounded text-purple-500 border border-purple-100">{displayIds.length} mã</span>
            </div>
            <div className="p-3 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 overflow-y-auto" style={{maxHeight: "180px"}}>
                {displayIds.map((id, index) => (
                    <div key={index} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 border border-gray-100 group hover:border-purple-200 hover:bg-purple-50/30 transition-colors">
                         <span className="text-[10px] font-bold text-gray-400">#{index + 1}</span>
                         <span className="font-mono text-[11px] font-bold text-gray-700 group-hover:text-purple-700 transition-colors">{id}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Bundle card ───────────────────────────────────────────────────
function BundleLineCard({ line, idx }) {
    const invoiceTotal = (Number(line.bundleQty) || 0) * (Number(line.bundlePrice || line.importPrice) || 0);
    const productTypeLabel = { RAW: "Hàng mộc", CUSTOM: "Hàng khách đặt", FINISHED: "Hàng có sẵn" }[line.productType] || "";

    return (
        <div className="rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-300 ring-1 ring-purple-100 hover:ring-purple-200">
            {/* Header with gradient */}
            <div className="px-5 py-3.5 flex items-center justify-between bg-gradient-to-r from-purple-50/80 to-fuchsia-50/80 border-b border-purple-100/50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-100/80 flex items-center justify-center text-purple-600 shadow-sm">
                        <Layers size={16} strokeWidth={2.5} />
                    </div>
                    <div>
                        <span className="text-[12px] font-extrabold uppercase tracking-wider text-purple-900 block" style={{lineHeight: 1.2}}>
                            Bộ Sản Phẩm #{idx + 1}
                        </span>
                        {productTypeLabel && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider bg-fuchsia-50 text-fuchsia-600 border border-fuchsia-200/60 shadow-sm mt-1 inline-block">
                                {productTypeLabel}
                            </span>
                        )}
                    </div>
                </div>
                {invoiceTotal > 0 && (
                    <div className="text-right">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400 block mb-0.5">Thành tiền</span>
                        <span className="text-[15px] font-black text-purple-700 bg-white px-3 py-1.5 rounded-xl shadow-sm border border-purple-100">
                            {fmtCurrency(invoiceTotal)}
                        </span>
                    </div>
                )}
            </div>

            <div className="p-5 flex flex-col gap-6">
                {/* Title & Stats */}
                <div className="flex flex-col gap-4">
                    <div>
                        <h3 className="text-lg font-black text-gray-900 mb-1.5">{line.bundleName || line.productName || "—"}</h3>
                        {(line.bundleCode || line.productCode) && (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-50 text-gray-600 text-[11px] font-mono border border-gray-200">
                                <Tag size={11} className="text-gray-400" /> {line.bundleCode || line.productCode}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                         <InfoBlock icon={Tag} label="Giá nhập/bộ" value={fmtCurrency(line.bundlePrice || line.importPrice)} />
                         {line.category && <InfoBlock icon={AlignLeft} label="Danh mục" value={line.category} />}
                         {(line.materialType || line.woodType) && <InfoBlock icon={Hexagon} label="Chất liệu" value={line.materialType || line.woodType} />}
                         {line.color && <InfoBlock icon={Info} label="Màu sắc" value={line.color} />}
                    </div>
                </div>

                {/* Grid for two lists: Unit IDs and Món Lẻ */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Bảng các món lẻ */}
                    {line.items && line.items.length > 0 && (
                        <div className="rounded-lg border border-gray-200 bg-white flex flex-col shadow-sm overflow-hidden" style={{maxHeight: "220px"}}>
                            <div className="px-4 py-2.5 bg-gray-50/80 border-b border-gray-200 shrink-0">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
                                    <List size={12}/> Các món lẻ trong bộ
                                </p>
                            </div>
                            <div className="flex-1 overflow-x-auto overflow-y-auto">
                                <table className="w-full text-left relative">
                                    <thead className="sticky top-0 bg-white/95 backdrop-blur-sm z-10">
                                        <tr className="border-b border-gray-100">
                                            <th className="px-4 py-2.5 text-[10px] font-semibold text-gray-400 w-8">#</th>
                                            <th className="px-4 py-2.5 text-[10px] font-semibold text-gray-400">Tên món</th>
                                            <th className="px-3 py-2.5 text-[10px] font-semibold text-gray-400 text-center w-12">SL</th>
                                            <th className="px-4 py-2.5 text-[10px] font-semibold text-gray-400">Ghi chú</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {line.items.map((item, iIdx) => (
                                            <tr key={item._id || iIdx} className="border-b border-gray-50/80 last:border-0 hover:bg-gray-50/50 transition-colors">
                                                <td className="px-4 py-2.5 text-[11px] font-bold text-gray-300">{iIdx + 1}</td>
                                                <td className="px-4 py-2.5 text-[12px] font-bold text-gray-700">{item.name}</td>
                                                <td className="px-3 py-2.5 text-center">
                                                    <span className="text-[11px] font-black px-2 py-0.5 rounded bg-gray-100 text-gray-600">x{item.qty}</span>
                                                </td>
                                                <td className="px-4 py-2.5 text-[11px] italic text-gray-500 max-w-[120px] truncate" title={item.productNote}>
                                                    {item.productNote || "—"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Danh sách mã định danh */}
                    <UnitListGrid qty={line.bundleQty || line.qty} unitIds={line.unitIds} prefix={line.bundleCode || line.productCode || "BO"} />
                </div>

                {/* Chi tiết */}
                {line.details && (
                    <div className="bg-yellow-50/40 border border-yellow-100 rounded-xl p-4">
                        <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 text-yellow-700 mb-1.5">
                            <StickyNote size={12} /> Chi tiết phụ
                        </span>
                        <p className="text-[12.5px] leading-relaxed text-yellow-900/80">
                            {line.details}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Single product card ───────────────────────────────────
function SingleLineCard({ line, idx }) {
    const lineTotal = Number(line.qty || 0) * Number(line.importPrice || 0);
    const productTypeLabel = { RAW: "Hàng mộc", CUSTOM: "Hàng khách đặt", FINISHED: "Hàng có sẵn" }[line.productType] || "";
    const dims = [line.length, line.width, line.height].filter(Boolean).join(" × ");

    return (
        <div className="rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-300 ring-1 ring-emerald-100 hover:ring-emerald-200">
            {/* Header with gradient */}
            <div className="px-5 py-3.5 flex items-center justify-between bg-gradient-to-r from-emerald-50/80 to-teal-50/80 border-b border-emerald-100/50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100/80 flex items-center justify-center text-emerald-600 shadow-sm">
                        <Package size={16} strokeWidth={2.5} />
                    </div>
                    <div>
                        <span className="text-[12px] font-extrabold uppercase tracking-wider text-emerald-900 block" style={{lineHeight: 1.2}}>
                            Mặt Hàng #{idx + 1}
                        </span>
                        {productTypeLabel && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider bg-teal-50 text-teal-700 border border-teal-200/60 shadow-sm mt-1 inline-block">
                                {productTypeLabel}
                            </span>
                        )}
                    </div>
                </div>
                {lineTotal > 0 && (
                    <div className="text-right">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 block mb-0.5">Thành tiền</span>
                        <span className="text-[15px] font-black text-emerald-700 bg-white px-3 py-1.5 rounded-xl shadow-sm border border-emerald-100">
                            {fmtCurrency(lineTotal)}
                        </span>
                    </div>
                )}
            </div>

            <div className="p-5 flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row gap-6">
                    {/* Image section if exists */}
                    {line.productImg && (
                        <div className="shrink-0 flex justify-center sm:justify-start">
                            <img src={line.productImg} alt={line.productName}
                                className="w-full sm:w-36 h-36 rounded-xl object-cover border border-gray-200 shadow-sm p-1 bg-white" />
                        </div>
                    )}

                    <div className="flex-1 flex flex-col gap-4">
                        <div>
                            <h3 className="text-lg font-black text-gray-900 mb-1.5">{line.productName || "—"}</h3>
                            {line.productCode && (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-50 text-gray-600 text-[11px] font-mono border border-gray-200">
                                    <Tag size={11} className="text-gray-400" /> {line.productCode}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                             <InfoBlock icon={Tag} label="Giá nhập/món" value={fmtCurrency(Number(line.importPrice))} />
                             {line.category && <InfoBlock icon={AlignLeft} label="Danh mục" value={line.category} />}
                             {(line.materialType || line.woodType) && <InfoBlock icon={Hexagon} label="Chất liệu" value={line.materialType || line.woodType} />}
                             {line.color && <InfoBlock icon={Info} label="Màu sắc" value={line.color} />}
                             {dims && <InfoBlock icon={Ruler} label="Kích thước" value={`${dims} cm`} />}
                             {line.sellingPrice > 0 && <InfoBlock icon={Tag} label="Giá bán" value={fmtCurrency(Number(line.sellingPrice))} />}
                        </div>
                    </div>
                </div>

                <UnitListGrid qty={line.qty} unitIds={line.unitIds || line.units} prefix={line.productCode || "SP"} />

                {/* Chi tiết */}
                {line.details && (
                    <div className="bg-yellow-50/40 border border-yellow-100 rounded-xl p-4">
                        <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 text-yellow-700 mb-1.5">
                            <StickyNote size={12} /> Chi tiết phụ
                        </span>
                        <p className="text-[12.5px] leading-relaxed text-yellow-900/80">
                            {line.details}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────
export default function ViewImportModal({ item, onClose }) {
    const [detail, setDetail] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    // Tải chi tiết phiếu từ API khi mở modal
    useEffect(() => {
        if (!item?.id) return;
        const fetchDetail = async () => {
            try {
                setLoadingDetail(true);
                const data = await importService.getImportReceiptDetail(item.id);
                setDetail(data);
            } catch (err) {
                console.error("Lỗi tải chi tiết phiếu nhập:", err);
                toast.error("Không thể tải chi tiết phiếu nhập!");
                // Fallback: dùng dữ liệu có sẵn từ danh sách
                setDetail(item);
            } finally {
                setLoadingDetail(false);
            }
        };
        fetchDetail();
    }, [item?.id]);

    if (!item) return null;

    // Dùng detail từ API (đầy đủ) hoặc fallback về item từ danh sách
    const receipt = detail || item;
    const lines = receipt.lines || [];
    const grandTotal = receipt.totalPrice ?? lines.reduce((s, l) => {
        if (l.isBundle) return s + (Number(l.bundleQty || 0) * Number(l.bundlePrice || l.importPrice || 0));
        return s + (Number(l.qty || 0) * Number(l.importPrice || 0));
    }, 0);

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="w-full max-w-5xl bg-[#FCFCFD] rounded-2xl shadow-2xl flex flex-col"
                style={{ maxHeight: "92vh" }}>

                {/* ── Header ── */}
                <div className="flex items-center justify-between px-6 py-4 bg-white border-b shrink-0 rounded-t-2xl"
                    style={{ borderColor: "var(--grid-border)" }}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 shadow-sm">
                            <ArrowDownToLine size={20} color="#fff" />
                        </div>
                        <div>
                            <h2 className="text-[16px] font-extrabold text-gray-900 tracking-tight">
                                Chi Tiết Phiếu Nhập Kho
                            </h2>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100 font-bold">
                                    {receipt.code}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose}
                        className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors bg-white border border-gray-100 shadow-sm">
                        <X size={18} />
                    </button>
                </div>

                {/* ── Scrollable Body ── */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

                    {/* Loading state */}
                    {loadingDetail && (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                            <p className="text-[13px] font-medium text-gray-500">Đang tải chi tiết phiếu nhập...</p>
                        </div>
                    )}

                    {!loadingDetail && (
                        <>
                            {/* KHU VỰC 1: Thông tin chứng từ */}
                            <div className="rounded-2xl p-5 space-y-4 bg-white border border-gray-200 shadow-sm">
                                <p className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-indigo-600">
                                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-[10px] font-black bg-indigo-600 shadow-sm">1</span>
                                    Thông tin chứng từ
                                </p>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
                                    <InfoBlock icon={Calendar} label="Ngày tạo phiếu" value={fmtDate(receipt.date)} className="bg-indigo-50/30 border-indigo-50" />
                                    <InfoBlock icon={Calendar} label="Ngày nhập hàng" value={receipt.importDate ? new Date(receipt.importDate).toLocaleDateString("vi-VN") : "—"} className="bg-indigo-50/30 border-indigo-50" />
                                    <InfoBlock icon={Building2} label="Xưởng cung cấp" value={receipt.supplier} className="bg-indigo-50/30 border-indigo-50" />
                                </div>
                                {receipt.note && (
                                    <div className="flex items-start gap-2 border-t border-gray-100 pt-4 mt-2">
                                        <div className="flex flex-col gap-1.5 w-full">
                                            <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 text-gray-500">
                                                <StickyNote size={12} className="text-gray-400"/> Ghi chú
                                            </span>
                                            <span className="text-[13px] italic text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                                {receipt.note}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* KHU VỰC 2: Chi tiết sản phẩm */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-indigo-600">
                                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-[10px] font-black bg-indigo-600 shadow-sm">2</span>
                                        Chi tiết mặt hàng
                                    </p>
                                    <span className="text-[11px] font-bold bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg border border-indigo-100">
                                        Tổng {lines.length} dòng · {receipt.qty || 0} đơn vị
                                    </span>
                                </div>

                                {lines.length === 0 ? (
                                    <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center bg-gray-50">
                                        <span className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                                            <Package size={20} className="text-gray-400" />
                                        </span>
                                        <p className="text-[13px] font-semibold text-gray-600">Không có dữ liệu mặt hàng</p>
                                        <p className="text-[11px] text-gray-400 mt-1">Phiếu nhập này trống mặt hàng do lỗi.</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-5">
                                        {lines.map((line, idx) =>
                                            line.isBundle
                                                ? <BundleLineCard key={line._id ?? idx} line={line} idx={idx} />
                                                : <SingleLineCard key={line._id ?? idx} line={line} idx={idx} />
                                        )}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* ── Footer ── */}
                <div className="px-6 py-4 bg-white border-t border-gray-200 shrink-0 flex items-center justify-between rounded-b-2xl shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-0.5">
                            Tổng giá trị phiếu
                        </span>
                        <span className="text-[22px] font-black text-indigo-600 leading-none">
                            {loadingDetail ? "..." : fmtCurrency(grandTotal)}
                        </span>
                    </div>
                    <button onClick={onClose}
                        className="h-10 px-8 rounded-xl text-[13px] font-bold border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer transition-all shadow-sm">
                        Đóng cửa sổ
                    </button>
                </div>
            </div>
        </div>
    );
}
