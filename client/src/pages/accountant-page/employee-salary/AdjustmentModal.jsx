import { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const formatNumber = (num) => {
  if (!num) return "";
  return new Intl.NumberFormat("vi-VN").format(num);
};

const parseNumber = (str) => {
  if (!str) return "";
  return str.toString().replace(/\D/g, "");
};

export default function AdjustmentModal({ 
  isOpen, 
  onClose, 
  onSave, 
  employee,
  isLocked 
}) {
  const [adjustments, setAdjustments] = useState([]);

  useEffect(() => {
    if (isOpen && employee) {
      setAdjustments(employee.adjustments || []);
    }
  }, [isOpen, employee]);

  if (!isOpen || !employee) return null;

  const handleAddRow = () => {
    if (isLocked) return;
    setAdjustments([
      ...adjustments,
      { id: Date.now(), type: "BONUS", description: "", amount: 0 }
    ]);
  };

  const handleUpdateRow = (id, field, value) => {
    if (isLocked) return;
    setAdjustments(adjustments.map(adj => 
      (adj.adjustment_id || adj.id) === id ? { ...adj, [field]: value } : adj
    ));
  };

  const handleDeleteRow = (id) => {
    if (isLocked) return;
    setAdjustments(adjustments.filter(adj => (adj.adjustment_id || adj.id) !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLocked) return;
    
    // Clean up empty adjustments and fix signs
    const cleaned = adjustments
      .filter(a => a.description.trim() !== "" || a.amount !== 0)
      .map(a => {
        let amt = Math.abs(Number(a.amount) || 0);
        if (a.type === "PENALTY") amt = -amt;
        return { ...a, amount: amt };
      });

    onSave(cleaned);
  };

  const inputClass = "h-9 px-3 rounded-lg border text-[13px] bg-white outline-none focus:ring-2 focus:ring-blue-100 transition w-full";
  const inputStyle = { borderColor: "var(--grid-border)", color: "var(--text-main)" };

  const totalAdjustments = adjustments.reduce((sum, a) => {
      let amt = Math.abs(Number(a.amount) || 0);
      if(a.type === "PENALTY") amt = -amt;
      return sum + amt;
  }, 0);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}>
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200 overflow-hidden"
           onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="px-6 py-5 shrink-0 border-b relative" style={{ borderColor: "var(--grid-border)" }}>
          <button onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-black/5 cursor-pointer transition text-gray-400">
              <X size={18} style={{ color: "var(--text-secondary)" }}/>
          </button>
          <h2 className="text-[17px] font-black" style={{ color: "var(--text-main)" }}>
              Chi Tiết Thưởng / Phạt
          </h2>
          <p className="text-[13px] mt-1 text-gray-500 flex items-center gap-2">
              Nhân viên: <span className="font-bold text-gray-900">{employee.name}</span>
              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
              Kỳ lương: <span className="font-medium text-gray-700">{employee.month}</span>
          </p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto bg-gray-50/50 flex-1">
            <div className="space-y-4">
                
                {adjustments.length === 0 ? (
                    <div className="text-center py-8 bg-white border border-dashed rounded-xl" style={{ borderColor: "var(--grid-border)" }}>
                        <p className="text-[13px] text-gray-500">Chưa có khoản điều chỉnh nào.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {adjustments.map((adj, index) => {
                            const uniqueId = adj.adjustment_id || adj.id;
                            return (
                            <div key={uniqueId} className="flex items-start gap-3 p-3 bg-white rounded-xl border shadow-sm" style={{ borderColor: "var(--grid-border)" }}>
                                <div className="w-1/4">
                                    <select 
                                        disabled={isLocked}
                                        value={adj.type} 
                                        onChange={e => handleUpdateRow(uniqueId, "type", e.target.value)}
                                        className={inputClass} style={inputStyle}>
                                        <option value="BONUS">Thưởng (Cộng)</option>
                                        <option value="ALLOWANCE">Phụ cấp (Cộng)</option>
                                        <option value="PENALTY">Phạt (Trừ)</option>
                                    </select>
                                </div>
                                <div className="w-2/4">
                                    <input 
                                        disabled={isLocked}
                                        type="text" 
                                        value={adj.description} 
                                        onChange={e => handleUpdateRow(uniqueId, "description", e.target.value)}
                                        placeholder="Mô tả lý do..." 
                                        className={inputClass} style={inputStyle} 
                                    />
                                </div>
                                <div className="w-1/4">
                                    <div className="relative">
                                        <input 
                                            disabled={isLocked}
                                            type="text" 
                                            value={formatNumber(Math.abs(adj.amount))} 
                                            onChange={e => handleUpdateRow(uniqueId, "amount", parseNumber(e.target.value))}
                                            placeholder="Số tiền" 
                                            className={cn(inputClass, "pl-6 font-bold", adj.type === "PENALTY" ? "text-red-600" : "text-green-600")} 
                                            style={inputStyle} 
                                        />
                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[13px] font-bold">
                                            {adj.type === "PENALTY" ? "-" : "+"}
                                        </span>
                                    </div>
                                </div>
                                {!isLocked && (
                                    <button onClick={() => handleDeleteRow(uniqueId)} className="p-2 mt-0.5 text-red-500 hover:bg-red-50 rounded-lg transition shrink-0 cursor-pointer">
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                            );
                        })}
                    </div>
                )}

                {!isLocked && (
                    <button onClick={handleAddRow} className="flex items-center justify-center gap-2 w-full py-3 border border-dashed rounded-xl text-[13px] font-bold text-blue-600 hover:bg-blue-50 transition cursor-pointer" style={{ borderColor: "var(--brand-primary)" }}>
                        <Plus size={16} />
                        Thêm khoản mới
                    </button>
                )}
            </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex items-center justify-between bg-white" style={{ borderColor: "var(--grid-border)" }}>
          <div className="flex flex-col">
              <span className="text-[11px] font-bold text-gray-500 uppercase">Tổng thay đổi</span>
              <span className={cn("text-[16px] font-black", totalAdjustments > 0 ? "text-green-600" : totalAdjustments < 0 ? "text-red-600" : "text-gray-900")}>
                  {totalAdjustments > 0 ? `+${formatNumber(totalAdjustments)}` : formatNumber(totalAdjustments)} VNĐ
              </span>
          </div>

          <div className="flex items-center gap-3">
            <button type="button" onClick={onClose}
                className="h-10 px-6 rounded-xl text-[13px] font-bold border cursor-pointer hover:bg-gray-50 transition"
                style={{ borderColor: "var(--grid-border)", color: "var(--text-secondary)" }}>
                {isLocked ? "Đóng" : "Hủy"}
            </button>
            {!isLocked && (
                <button onClick={handleSubmit}
                    className="h-10 px-6 rounded-xl text-white text-[13px] font-bold cursor-pointer transition shadow-sm hover:opacity-90"
                    style={{ backgroundColor: "var(--brand-primary)" }}>
                    Lưu các thay đổi
                </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
