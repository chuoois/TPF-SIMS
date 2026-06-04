import { useState, useEffect } from "react";
import { X, Users, CheckCircle2, AlertCircle, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const formatNumber = (num) => {
  if (!num) return "";
  return new Intl.NumberFormat("vi-VN").format(num);
};

const parseNumber = (str) => {
  if (!str) return "";
  return str.toString().replace(/\D/g, "");
};

const ROLE_OPTIONS = [
  { value: "ALL", label: "Tất cả bộ phận" },
  { value: "SALES", label: "Nhân viên bán hàng" },
  { value: "ACCOUNTANT", label: "Kế toán" },
  { value: "SANDER", label: "Nhân viên giấy ráp" },
  { value: "PAINTER", label: "Thợ sơn" },
];

/**
 * BulkAdjustmentModal
 * Thêm thưởng/phạt/phụ cấp cho nhiều nhân viên cùng lúc.
 * Props:
 *  - isOpen: boolean
 *  - onClose: () => void
 *  - onApply: (adjustmentData, targetRecords) => Promise<void>
 *  - records: array of salary records (filtered by current period)
 *  - periodMonth: string (e.g. "05/2026")
 */
export default function BulkAdjustmentModal({
  isOpen,
  onClose,
  onApply,
  records = [],
  periodMonth,
}) {
  const [type, setType] = useState("BONUS");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [targetRole, setTargetRole] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("form"); // "form" | "confirm"

  // Reset state khi mở
  useEffect(() => {
    if (isOpen) {
      setType("BONUS");
      setDescription("");
      setAmount("");
      setTargetRole("ALL");
      setStep("form");
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Danh sách nhân viên sẽ được áp dụng
  const targetRecords = targetRole === "ALL"
    ? records
    : records.filter(r => r.type === targetRole);

  const amountNum = Number(amount) || 0;
  const isValid = description.trim() !== "" && amountNum > 0;

  const finalAmount = type === "PENALTY" ? -amountNum : amountNum;
  const totalImpact = finalAmount * targetRecords.length;

  const typeConfig = {
    BONUS: { label: "Thưởng", color: "text-green-600", bg: "bg-green-50", border: "border-green-200", sign: "+" },
    ALLOWANCE: { label: "Phụ cấp", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", sign: "+" },
    PENALTY: { label: "Phạt", color: "text-red-600", bg: "bg-red-50", border: "border-red-200", sign: "-" },
  };
  const cfg = typeConfig[type];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid || targetRecords.length === 0) return;
    setStep("confirm");
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onApply(
        { type, description: description.trim(), amount: amountNum },
        targetRecords
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        style={{ animation: "zoom-in 0.15s ease" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 shrink-0 border-b relative" style={{ borderColor: "var(--grid-border)" }}>
          <button onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-black/5 cursor-pointer transition text-gray-400">
            <X size={18} />
          </button>
          <div className="flex items-center gap-2.5 mb-0.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <Zap size={16} className="text-amber-600" />
            </div>
            <h2 className="text-[17px] font-black" style={{ color: "var(--text-main)" }}>
              Thưởng / Phạt hàng loạt
            </h2>
          </div>
          <p className="text-[13px] text-gray-500 ml-10.5">
            Áp dụng một khoản điều chỉnh cho nhiều nhân viên cùng lúc
            {periodMonth && <span className="font-semibold text-gray-700"> — Kỳ {periodMonth}</span>}
          </p>
        </div>

        {step === "form" ? (
          <>
            {/* Form */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5">

              {/* Loại điều chỉnh */}
              <div className="space-y-2">
                <label className="text-[13px] font-bold" style={{ color: "var(--text-main)" }}>
                  Loại điều chỉnh <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { v: "BONUS", label: "🎁 Thưởng", color: "green" },
                    { v: "ALLOWANCE", label: "💼 Phụ cấp", color: "blue" },
                    { v: "PENALTY", label: "⚠️ Phạt", color: "red" },
                  ].map(opt => (
                    <button key={opt.v} type="button"
                      onClick={() => setType(opt.v)}
                      className={cn(
                        "h-10 rounded-xl border-2 text-[13px] font-bold transition cursor-pointer",
                        type === opt.v
                          ? opt.color === "green" ? "border-green-500 bg-green-50 text-green-700"
                            : opt.color === "blue" ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-red-500 bg-red-50 text-red-700"
                          : "border-gray-200 text-gray-500 hover:border-gray-300"
                      )}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mô tả */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold" style={{ color: "var(--text-main)" }}>
                  Mô tả lý do <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="VD: Thưởng lễ 30/4, Phụ cấp tháng 5, Phạt đi muộn..."
                  className="w-full h-10 px-3 rounded-xl border text-[13px] outline-none focus:ring-2 focus:ring-blue-100 transition"
                  style={{ borderColor: "var(--grid-border)", color: "var(--text-main)" }}
                />
              </div>

              {/* Số tiền */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold" style={{ color: "var(--text-main)" }}>
                  Số tiền (₫) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className={cn(
                    "absolute left-3 top-1/2 -translate-y-1/2 text-[15px] font-black",
                    type === "PENALTY" ? "text-red-500" : "text-green-500"
                  )}>
                    {type === "PENALTY" ? "−" : "+"}
                  </span>
                  <input
                    type="text"
                    value={formatNumber(amount)}
                    onChange={e => setAmount(parseNumber(e.target.value))}
                    placeholder="200.000"
                    className={cn(
                      "w-full h-10 pl-8 pr-3 rounded-xl border text-[13px] font-bold outline-none focus:ring-2 transition",
                      type === "PENALTY"
                        ? "text-red-600 focus:ring-red-100"
                        : "text-green-600 focus:ring-green-100"
                    )}
                    style={{ borderColor: "var(--grid-border)" }}
                  />
                </div>
              </div>

              {/* Bộ phận áp dụng */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold" style={{ color: "var(--text-main)" }}>
                  Áp dụng cho bộ phận
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {ROLE_OPTIONS.map(opt => {
                    const count = opt.value === "ALL"
                      ? records.length
                      : records.filter(r => r.type === opt.value).length;
                    const active = targetRole === opt.value;
                    return (
                      <button key={opt.value} type="button"
                        onClick={() => setTargetRole(opt.value)}
                        disabled={count === 0 && opt.value !== "ALL"}
                        className={cn(
                          "h-10 px-3 rounded-xl border-2 text-[13px] font-bold transition cursor-pointer flex items-center justify-between",
                          active ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-500 hover:border-gray-300",
                          (count === 0 && opt.value !== "ALL") && "opacity-40 cursor-not-allowed"
                        )}>
                        <span>{opt.label}</span>
                        <span className={cn(
                          "text-[11px] px-1.5 py-0.5 rounded-md font-bold",
                          active ? "bg-blue-200 text-blue-800" : "bg-gray-100 text-gray-500"
                        )}>{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preview impact */}
              {amountNum > 0 && targetRecords.length > 0 && (
                <div className={cn("p-4 rounded-xl border-2 space-y-2", cfg.bg, cfg.border)}>
                  <p className="text-[12px] font-bold uppercase tracking-wider text-gray-500">Tổng ảnh hưởng</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-gray-600">
                      {cfg.sign}{formatNumber(amountNum)}₫ × {targetRecords.length} nhân viên
                    </span>
                    <span className={cn("text-[18px] font-black", cfg.color)}>
                      {cfg.sign}{formatNumber(amountNum * targetRecords.length)}₫
                    </span>
                  </div>
                </div>
              )}

              {/* No employees warning */}
              {targetRecords.length === 0 && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200">
                  <AlertCircle size={16} className="text-red-500 shrink-0" />
                  <p className="text-[13px] text-red-600 font-medium">
                    Không có nhân viên nào trong bộ phận này để áp dụng.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t flex items-center justify-end gap-3 bg-gray-50"
              style={{ borderColor: "var(--grid-border)" }}>
              <button type="button" onClick={onClose}
                className="h-10 px-6 rounded-xl text-[13px] font-bold border cursor-pointer hover:bg-white transition"
                style={{ borderColor: "var(--grid-border)", color: "var(--text-secondary)" }}>
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                disabled={!isValid || targetRecords.length === 0}
                className={cn(
                  "h-10 px-6 rounded-xl text-[13px] font-bold text-white transition flex items-center gap-2",
                  isValid && targetRecords.length > 0
                    ? "cursor-pointer hover:opacity-90 shadow-sm"
                    : "opacity-50 cursor-not-allowed"
                )}
                style={{ backgroundColor: "var(--brand-primary)" }}>
                <Users size={15} />
                Xem trước & Áp dụng
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Confirm Step */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border-2 border-amber-200">
                <CheckCircle2 size={20} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[13px] font-bold text-amber-800">Xác nhận áp dụng hàng loạt</p>
                  <p className="text-[12px] text-amber-700 mt-0.5">
                    Thao tác này sẽ thêm khoản điều chỉnh vào {targetRecords.length} bản ghi lương.
                    Bạn vẫn có thể xóa từng khoản sau nếu cần.
                  </p>
                </div>
              </div>

              {/* Summary */}
              <div className={cn("p-4 rounded-xl border-2 space-y-2.5", cfg.bg, cfg.border)}>
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Chi tiết khoản áp dụng</p>
                <div className="flex justify-between text-[13px]">
                  <span className="text-gray-600">Loại:</span>
                  <span className={cn("font-bold", cfg.color)}>{cfg.label}</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-gray-600">Mô tả:</span>
                  <span className="font-bold text-gray-800 text-right max-w-[60%]">{description}</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-gray-600">Mỗi nhân viên:</span>
                  <span className={cn("font-black text-[15px]", cfg.color)}>
                    {cfg.sign}{formatNumber(amountNum)}₫
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between text-[13px]" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
                  <span className="font-bold text-gray-700">Số nhân viên:</span>
                  <span className="font-black text-gray-900">{targetRecords.length} người</span>
                </div>
                <div className="border-t pt-2 flex justify-between" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
                  <span className="text-[13px] font-black text-gray-700">Tổng tác động:</span>
                  <span className={cn("text-[18px] font-black", cfg.color)}>
                    {cfg.sign}{formatNumber(amountNum * targetRecords.length)}₫
                  </span>
                </div>
              </div>

              {/* Employee list preview */}
              <div>
                <p className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Danh sách sẽ áp dụng ({targetRecords.length})
                </p>
                <div className="max-h-40 overflow-y-auto space-y-1 pr-0.5">
                  {targetRecords.map(r => (
                    <div key={r.record_id}
                      className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 border text-[12px]"
                      style={{ borderColor: "var(--grid-border)" }}>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-gray-400 text-[11px]">{r.id}</span>
                        <span className="font-bold text-gray-800">{r.name}</span>
                      </div>
                      <span className="text-gray-400 text-[11px]">{r.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t flex items-center justify-between bg-gray-50"
              style={{ borderColor: "var(--grid-border)" }}>
              <button type="button" onClick={() => setStep("form")}
                className="h-10 px-5 rounded-xl text-[13px] font-bold border cursor-pointer hover:bg-white transition text-gray-600"
                style={{ borderColor: "var(--grid-border)" }}>
                ← Quay lại
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className={cn(
                  "h-10 px-6 rounded-xl text-[13px] font-bold text-white transition flex items-center gap-2 shadow-sm",
                  loading ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:opacity-90"
                )}
                style={{ backgroundColor: type === "PENALTY" ? "#dc2626" : "var(--brand-primary)" }}>
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang áp dụng...
                  </>
                ) : (
                  <>
                    <Zap size={15} />
                    Xác nhận áp dụng cho {targetRecords.length} NV
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
