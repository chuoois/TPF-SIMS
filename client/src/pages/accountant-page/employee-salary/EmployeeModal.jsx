import { useState, useEffect } from "react";
import { X } from "lucide-react";

const getCurrentMonth = () => {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy = now.getFullYear();
  return `${mm}/${yyyy}`;
};

const formatNumber = (num) => {
  if (num == null || num === "") return "";
  return new Intl.NumberFormat("vi-VN").format(num);
};

const parseNumber = (str) => {
  if (!str) return "";
  return str.toString().replace(/\D/g, "");
};

import { cn } from "@/lib/utils";

export default function EmployeeModal({ 
  isOpen, 
  onClose, 
  onSave, 
  employeeToEdit 
}) {
  const [formData, setFormData] = useState({
    name: "",
    type: "SALES",
    baseRate: "",
    daysWorked: ""
  });
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingData, setPendingData] = useState(null);

  // Init form
  useEffect(() => {
    if (isOpen) {
      if (employeeToEdit) {
        setFormData({
          name: employeeToEdit.name || "",
          type: employeeToEdit.type || "SALES",
          baseRate: employeeToEdit.base_rate || "",
          daysWorked: employeeToEdit.days_worked || ""
        });
      } else {
        setFormData({
          name: "",
          type: "SALES",
          baseRate: "",
          daysWorked: ""
        });
      }
    }
  }, [isOpen, employeeToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    let empRole = "";
    if (formData.type === "SALES") empRole = "Nhân viên bán hàng";
    else if (formData.type === "SANDER") empRole = "Nhân viên giấy ráp";
    else if (formData.type === "PAINTER") empRole = "Thợ sơn";
    else if (formData.type === "ACCOUNTANT") empRole = "Kế toán";

    // Build the employee object
    const employeeData = {
      id: employeeToEdit ? employeeToEdit.id : `NV${Math.floor(100 + Math.random() * 900)}`,
      name: formData.name,
      role: empRole,
      type: formData.type,
      adjustments: employeeToEdit ? employeeToEdit.adjustments : [],
      status: employeeToEdit ? employeeToEdit.status : "Chưa thanh toán",
      month: employeeToEdit ? employeeToEdit.month : getCurrentMonth(),
      payment_date: formData.paymentDate,
    };

    if ([("SALES"), "ACCOUNTANT", "SANDER", "PAINTER"].includes(formData.type)) {
      employeeData.base_rate = Number(formData.baseRate) || 0;
      employeeData.days_worked = Number(formData.daysWorked) || 0;
    }

    // Nếu đang sửa, hiện confirm trước khi lưu
    if (employeeToEdit) {
      setPendingData(employeeData);
      setShowConfirm(true);
    } else {
      onSave(employeeData);
    }
  };

  const handleConfirmSave = () => {
    if (pendingData) {
      onSave(pendingData);
      setShowConfirm(false);
      setPendingData(null);
    }
  };

  const inputClass = "w-full h-9 px-3 rounded-lg border text-[13px] bg-white outline-none focus:ring-2 focus:ring-blue-100 transition";
  const inputStyle = { borderColor: "var(--grid-border)", color: "var(--text-main)" };

  return (<>
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}>
      <div className="bg-white w-full max-w-lg rounded-lg shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200 overflow-hidden"
           onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="px-6 py-5 shrink-0 border-b relative" style={{ borderColor: "var(--grid-border)" }}>
          <button onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-black/5 cursor-pointer transition">
              <X size={18} style={{ color: "var(--text-secondary)" }}/>
          </button>
          <h2 className="text-[17px] font-black" style={{ color: "var(--text-main)" }}>
              {employeeToEdit ? "Chỉnh Sửa Hồ Sơ Lương" : "Thêm Nhân Viên Tính Lương"}
          </h2>
          <p className="text-[13px] mt-1" style={{ color: "var(--text-secondary)" }}>
              {employeeToEdit ? "Cập nhật các thông số tính lương cho nhân viên" : "Điền thông tin và thông số tính lương mới"}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          <form id="emp-form" onSubmit={handleSubmit} className="space-y-4">
            
            <div className="space-y-1.5">
                <label className="text-[13px] font-bold" style={{ color: "var(--text-main)" }}>Họ và tên nhân viên <span className="text-red-500">*</span></label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required
                    disabled={!!employeeToEdit}
                    className={cn("w-full h-10 px-3 rounded-xl border text-[13px] focus:outline-none focus:ring-2 transition bg-gray-50/50", employeeToEdit && "opacity-60 cursor-not-allowed")}
                    placeholder="Nhập tên nhân viên..."
                    style={{ borderColor: "var(--grid-border)", color: "var(--text-main)" }} />
            </div>

            <div className="space-y-1.5">
                <label className="text-[13px] font-bold" style={{ color: "var(--text-main)" }}>Bộ phận <span className="text-red-500">*</span></label>
                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}
                    disabled={!!employeeToEdit}
                    className={cn("w-full h-10 px-3 rounded-xl border text-[13px] focus:outline-none focus:ring-2 transition bg-gray-50/50 outline-none", employeeToEdit && "opacity-60 cursor-not-allowed")}
                    style={{ borderColor: "var(--grid-border)", color: "var(--text-main)" }}>
                    <option value="SALES">Nhân viên bán hàng</option>
                    <option value="ACCOUNTANT">Kế toán</option>
                    <option value="SANDER">Nhân viên giấy ráp</option>
                    <option value="PAINTER">Thợ sơn</option>
                </select>
            </div>

            {/* Dynamic Fields based on Type */}
            <div className="p-4 rounded-xl border bg-gray-50/50 space-y-4" style={{ borderColor: "var(--grid-border)" }}>
              <div className="flex items-center justify-between mb-2">
                 <h4 className="text-[12px] font-bold uppercase tracking-wider text-gray-500">Thông số tính lương</h4>
              </div>

              {/* SALES, ACCOUNTANT, SANDER & PAINTER – Same daily rate structure */}
              {(["SALES", "ACCOUNTANT", "SANDER", "PAINTER"].includes(formData.type)) && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                          <label className="text-[13px] font-bold" style={{ color: "var(--text-main)" }}>Đơn giá / Ngày</label>
                          <input type="text" value={formatNumber(formData.baseRate)} onChange={e => setFormData({...formData, baseRate: parseNumber(e.target.value)})} required
                              className={cn(inputClass)}
                              placeholder="400.000" style={inputStyle} />
                      </div>
                      <div className="space-y-1.5">
                          <label className="text-[13px] font-bold" style={{ color: "var(--text-main)" }}>Số ngày công</label>
                          <input type="number" min="0" step="0.5" value={formData.daysWorked} onChange={e => setFormData({...formData, daysWorked: e.target.value})} required
                              className={inputClass} placeholder="26" style={inputStyle} />
                      </div>
                  </div>
                </>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex items-center justify-end gap-3" style={{ borderColor: "var(--grid-border)", backgroundColor: "var(--bg-main)" }}>
          <button type="button" onClick={onClose}
              className="h-10 px-6 rounded-xl text-[13px] font-bold border cursor-pointer hover:bg-gray-50 transition"
              style={{ borderColor: "var(--grid-border)", color: "var(--text-secondary)" }}>
              Hủy
          </button>
          <button form="emp-form" type="submit"
              className="h-10 px-6 rounded-xl text-[13px] font-bold cursor-pointer hover:opacity-90 transition flex justify-center items-center"
              style={{ backgroundColor: "var(--brand-primary)", color: "#fff" }}>
              {employeeToEdit ? "Lưu thay đổi" : "Lưu nhân viên mới"}
          </button>
        </div>

      </div>
    </div>

    {/* Confirm Dialog */}
    {showConfirm && (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
           onClick={() => setShowConfirm(false)}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
             onClick={e => e.stopPropagation()}>
          <div className="p-6 space-y-3">
            <div className="w-11 h-11 rounded-full bg-amber-100 flex items-center justify-center mb-3">
              <span className="text-xl">✏️</span>
            </div>
            <h3 className="text-[16px] font-black text-gray-900">Xác nhận lưu thay đổi?</h3>
            <p className="text-[13px] text-gray-500">
              Bạn có chắc chắn muốn lưu thay đổi thông tin lương cho 
              <span className="font-bold text-gray-800">{employeeToEdit?.name}</span>?
            </p>
            {pendingData && (
              <div className="mt-3 p-3 rounded-xl bg-gray-50 border border-gray-100 text-[12px] space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-500">Đơn giá / Ngày:</span>
                  <span className="font-bold text-gray-800">{new Intl.NumberFormat("vi-VN").format(pendingData.base_rate)}&#8363;</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Số ngày công:</span>
                  <span className="font-bold text-gray-800">{pendingData.days_worked} ngày</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-1.5 mt-1">
                  <span className="font-bold text-gray-600">Tổng lương ước tính:</span>
                  <span className="font-black text-amber-600">{new Intl.NumberFormat("vi-VN").format(pendingData.base_rate * pendingData.days_worked)}&#8363;</span>
                </div>
              </div>
            )}
          </div>
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
            <button type="button" onClick={() => setShowConfirm(false)}
                className="h-9 px-5 rounded-xl text-[13px] font-bold border border-gray-200 text-gray-600 hover:bg-white cursor-pointer transition">
              Không, hủy
            </button>
            <button type="button" onClick={handleConfirmSave}
                className="h-9 px-6 rounded-xl text-[13px] font-bold text-white cursor-pointer hover:opacity-90 transition"
                style={{ backgroundColor: "var(--brand-primary)" }}>
              Xác nhận lưu
            </button>
          </div>
        </div>
      </div>
    )}
  </>);
}
