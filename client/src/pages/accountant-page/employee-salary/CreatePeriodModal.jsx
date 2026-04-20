import { useState, useEffect } from "react";
import { X, CalendarPlus } from "lucide-react";

export default function CreatePeriodModal({ isOpen, onClose, onCreate }) {
  const now = new Date();
  const [month, setMonth] = useState(String(now.getMonth() + 1).padStart(2, "0"));
  const [year, setYear] = useState(String(now.getFullYear()));

  useEffect(() => {
    if (isOpen) {
      const current = new Date();
      setMonth(String(current.getMonth() + 1).padStart(2, "0"));
      setYear(String(current.getFullYear()));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate(`${month}/${year}`);
    onClose();
  };

  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
  const years = Array.from({ length: 5 }, (_, i) => String(now.getFullYear() - 2 + i));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="px-6 py-5 border-b relative" style={{ borderColor: "var(--grid-border)" }}>
          <button onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-black/5 cursor-pointer transition">
            <X size={18} style={{ color: "var(--text-secondary)" }} />
          </button>
          <div className="flex items-center gap-2">
            <CalendarPlus size={20} className="text-blue-600" />
            <h2 className="text-[17px] font-black" style={{ color: "var(--text-main)" }}>
              Tạo kỳ lương mới
            </h2>
          </div>
          <p className="text-[13px] mt-1" style={{ color: "var(--text-secondary)" }}>
            Dữ liệu nhân viên sẽ được sao chép sang kỳ mới
          </p>
        </div>

        {/* Form */}
        <form id="period-form" onSubmit={handleSubmit} className="p-6 space-y-4 text-gray-900">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[13px] font-bold">Tháng</label>
              <select value={month} onChange={e => setMonth(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border text-[13px] bg-gray-50 focus:outline-none focus:ring-2 transition outline-none"
                style={{ borderColor: "var(--grid-border)" }}>
                {months.map(m => <option key={m} value={m}>Tháng {m}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-bold">Năm</label>
              <select value={year} onChange={e => setYear(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border text-[13px] bg-gray-50 focus:outline-none focus:ring-2 transition outline-none"
                style={{ borderColor: "var(--grid-border)" }}>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex items-center justify-end gap-3" style={{ borderColor: "var(--grid-border)", backgroundColor: "var(--bg-main)" }}>
          <button type="button" onClick={onClose}
            className="h-10 px-6 rounded-xl text-[13px] font-bold border cursor-pointer hover:bg-gray-50 transition"
            style={{ borderColor: "var(--grid-border)", color: "var(--text-secondary)" }}>
            Hủy
          </button>
          <button form="period-form" type="submit"
            className="h-10 px-6 rounded-xl text-[13px] font-bold cursor-pointer hover:opacity-90 transition"
            style={{ backgroundColor: "var(--brand-primary)", color: "#fff" }}>
            Xác nhận tạo
          </button>
        </div>

      </div>
    </div>
  );
}
