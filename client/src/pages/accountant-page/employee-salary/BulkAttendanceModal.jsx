import { useState, useEffect, useMemo } from "react";
import { X, CalendarPlus, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const ROLE_OPTIONS = [
  { value: "ALL", label: "Tất cả bộ phận" },
  { value: "SALES", label: "Nhân viên bán hàng" },
  { value: "ACCOUNTANT", label: "Kế toán" },
  { value: "SANDER", label: "Nhân viên giấy ráp" },
  { value: "PAINTER", label: "Thợ sơn" },
];

/**
 * BulkAttendanceModal
 * Điểm danh hàng loạt: cộng thêm N ngày hoặc đặt cố định số ngày công.
 * Props:
 *  - isOpen: boolean
 *  - onClose: () => void
 *  - onApply: (mode, days, targetRecords) => Promise<void>
 *    mode: "add" | "set"
 *    days: number
 *    targetRecords: SalaryRecord[]
 *  - records: SalaryRecord[]
 *  - periodMonth: string
 */
export default function BulkAttendanceModal({
  isOpen,
  onClose,
  onApply,
  records = [],
  periodMonth,
}) {
  const [mode, setMode] = useState("add");      // "add" | "set"
  const [days, setDays] = useState("");
  const [targetRole, setTargetRole] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("form");     // "form" | "confirm"

  // useMemo phải ở đây, TRƯỚC early return — tuân thủ Rules of Hooks
  const targetRecords = useMemo(() =>
    targetRole === "ALL" ? records : records.filter(r => r.type === targetRole),
    [records, targetRole]
  );

  useEffect(() => {
    if (isOpen) {
      setMode("add");
      setDays("");
      setTargetRole("ALL");
      setStep("form");
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const daysNum = parseFloat(days) || 0;

  const isValid = daysNum > 0 && targetRecords.length > 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid) return;
    setStep("confirm");
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onApply(mode, daysNum, targetRecords);
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
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 shrink-0 border-b relative" style={{ borderColor: "var(--grid-border)" }}>
          <button onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-black/5 cursor-pointer transition text-gray-400">
            <X size={18} />
          </button>
          <div className="flex items-center gap-2.5 mb-0.5">
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
              <CalendarPlus size={16} className="text-green-600" />
            </div>
            <h2 className="text-[17px] font-black" style={{ color: "var(--text-main)" }}>
              Điểm danh hàng loạt
            </h2>
          </div>
          <p className="text-[13px] text-gray-500 pl-10">
            Cập nhật số ngày công cho nhiều nhân viên cùng lúc
            {periodMonth && <span className="font-semibold text-gray-700"> — Kỳ {periodMonth}</span>}
          </p>
        </div>

        {step === "form" ? (
          <>
            <div className="p-6 overflow-y-auto flex-1 space-y-5">

              {/* Chế độ */}
              <div className="space-y-2">
                <label className="text-[13px] font-bold" style={{ color: "var(--text-main)" }}>
                  Kiểu điểm danh <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setMode("add")}
                    className={cn(
                      "h-auto py-3 px-4 rounded-xl border-2 text-left transition cursor-pointer",
                      mode === "add"
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    )}>
                    <p className={cn("text-[13px] font-black", mode === "add" ? "text-green-700" : "text-gray-700")}>
                      ➕ Cộng thêm ngày
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Cộng thêm N ngày vào số ngày công hiện tại
                    </p>
                  </button>
                  <button type="button" onClick={() => setMode("set")}
                    className={cn(
                      "h-auto py-3 px-4 rounded-xl border-2 text-left transition cursor-pointer",
                      mode === "set"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    )}>
                    <p className={cn("text-[13px] font-black", mode === "set" ? "text-blue-700" : "text-gray-700")}>
                      📌 Đặt cố định
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Ghi đè thành đúng N ngày công
                    </p>
                  </button>
                </div>
              </div>

              {/* Số ngày */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold" style={{ color: "var(--text-main)" }}>
                  {mode === "add" ? "Số ngày cộng thêm" : "Số ngày công cố định"}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <button type="button"
                    onClick={() => setDays(v => String(Math.max(0, (parseFloat(v) || 0) - 0.5)))}
                    className="w-9 h-10 rounded-xl border-2 border-gray-200 font-black text-gray-600 hover:bg-gray-50 transition cursor-pointer text-lg flex items-center justify-center shrink-0">
                    −
                  </button>
                  <input
                    type="number" min="0.5" max="31" step="0.5"
                    value={days}
                    onChange={e => setDays(e.target.value)}
                    placeholder="1"
                    className={cn(
                      "flex-1 h-10 px-3 text-center rounded-xl border-2 text-[18px] font-black outline-none transition",
                      mode === "add"
                        ? "border-green-300 text-green-700 focus:border-green-500"
                        : "border-blue-300 text-blue-700 focus:border-blue-500"
                    )}
                  />
                  <button type="button"
                    onClick={() => setDays(v => String((parseFloat(v) || 0) + 0.5))}
                    className="w-9 h-10 rounded-xl border-2 border-gray-200 font-black text-gray-600 hover:bg-gray-50 transition cursor-pointer text-lg flex items-center justify-center shrink-0">
                    ＋
                  </button>
                  <span className="text-[13px] font-bold text-gray-500 shrink-0">ngày</span>
                </div>
                {/* Quick picks */}
                <div className="flex gap-2 flex-wrap pt-1">
                  {[0.5, 1, 2, 3, 5, 10, 26].map(n => (
                    <button key={n} type="button"
                      onClick={() => setDays(String(n))}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-[12px] font-bold border transition cursor-pointer",
                        parseFloat(days) === n
                          ? mode === "add" ? "bg-green-100 border-green-400 text-green-700" : "bg-blue-100 border-blue-400 text-blue-700"
                          : "bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300"
                      )}>
                      {n} ngày
                    </button>
                  ))}
                </div>
              </div>

              {/* Bộ phận */}
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
                          active ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-500 hover:border-gray-300",
                          count === 0 && opt.value !== "ALL" && "opacity-40 cursor-not-allowed"
                        )}>
                        <span>{opt.label}</span>
                        <span className={cn(
                          "text-[11px] px-1.5 py-0.5 rounded-md font-bold",
                          active ? "bg-green-200 text-green-800" : "bg-gray-100 text-gray-500"
                        )}>{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preview impact */}
              {daysNum > 0 && targetRecords.length > 0 && (
                <div className={cn(
                  "p-4 rounded-xl border-2 space-y-2",
                  mode === "add" ? "bg-green-50 border-green-200" : "bg-blue-50 border-blue-200"
                )}>
                  <p className="text-[12px] font-bold uppercase tracking-wider text-gray-500">Tổng ảnh hưởng</p>
                  {mode === "add" ? (
                    <p className="text-[13px] text-gray-600">
                      Cộng thêm <span className="font-black text-green-700">+{daysNum} ngày</span> vào ngày công hiện tại của{" "}
                      <span className="font-black text-green-700">{targetRecords.length} nhân viên</span>
                    </p>
                  ) : (
                    <p className="text-[13px] text-gray-600">
                      Đặt ngày công thành <span className="font-black text-blue-700">{daysNum} ngày</span> cho{" "}
                      <span className="font-black text-blue-700">{targetRecords.length} nhân viên</span>
                    </p>
                  )}
                </div>
              )}

              {targetRecords.length === 0 && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200">
                  <AlertCircle size={16} className="text-red-500 shrink-0" />
                  <p className="text-[13px] text-red-600 font-medium">
                    Không có nhân viên nào trong bộ phận này.
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
                disabled={!isValid}
                className={cn(
                  "h-10 px-6 rounded-xl text-[13px] font-bold text-white transition flex items-center gap-2 shadow-sm",
                  isValid ? "cursor-pointer hover:opacity-90" : "opacity-50 cursor-not-allowed"
                )}
                style={{ backgroundColor: "#16a34a" }}>
                <CalendarPlus size={15} />
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
                  <p className="text-[13px] font-bold text-amber-800">Xác nhận điểm danh hàng loạt</p>
                  <p className="text-[12px] text-amber-700 mt-0.5">
                    {mode === "add"
                      ? `Cộng thêm ${daysNum} ngày công cho ${targetRecords.length} nhân viên.`
                      : `Đặt ngày công thành ${daysNum} ngày cho ${targetRecords.length} nhân viên.`
                    }
                    {mode === "set" && " Dữ liệu ngày công hiện tại sẽ bị ghi đè."}
                  </p>
                </div>
              </div>

              {/* Summary */}
              <div className={cn(
                "p-4 rounded-xl border-2 space-y-2.5",
                mode === "add" ? "bg-green-50 border-green-200" : "bg-blue-50 border-blue-200"
              )}>
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Chi tiết thao tác</p>
                <div className="flex justify-between text-[13px]">
                  <span className="text-gray-600">Kiểu:</span>
                  <span className={cn("font-bold", mode === "add" ? "text-green-700" : "text-blue-700")}>
                    {mode === "add" ? "➕ Cộng thêm ngày" : "📌 Đặt cố định"}
                  </span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-gray-600">Số ngày:</span>
                  <span className={cn("font-black text-[16px]", mode === "add" ? "text-green-700" : "text-blue-700")}>
                    {mode === "add" ? `+${daysNum}` : `= ${daysNum}`} ngày
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between text-[13px]" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
                  <span className="font-bold text-gray-700">Số nhân viên:</span>
                  <span className="font-black text-gray-900">{targetRecords.length} người</span>
                </div>
              </div>

              {/* Employee list with current & new days */}
              <div>
                <p className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Danh sách nhân viên ({targetRecords.length})
                </p>
                <div className="max-h-48 overflow-y-auto space-y-1 pr-0.5">
                  {targetRecords.map(r => {
                    const newDays = mode === "add"
                      ? (r.days_worked || 0) + daysNum
                      : daysNum;
                    return (
                      <div key={r.record_id}
                        className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 border text-[12px]"
                        style={{ borderColor: "var(--grid-border)" }}>
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-mono text-gray-400 text-[11px] shrink-0">{r.id}</span>
                          <span className="font-bold text-gray-800 truncate">{r.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-gray-400">{r.days_worked ?? 0} ngày</span>
                          <span className="text-gray-300">→</span>
                          <span className={cn(
                            "font-black",
                            mode === "add" ? "text-green-600" : "text-blue-600"
                          )}>{newDays} ngày</span>
                        </div>
                      </div>
                    );
                  })}
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
                style={{ backgroundColor: "#16a34a" }}>
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang cập nhật...
                  </>
                ) : (
                  <>
                    <CalendarPlus size={15} />
                    Xác nhận cho {targetRecords.length} NV
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
