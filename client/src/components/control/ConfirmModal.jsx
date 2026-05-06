import React from "react";
import { X, AlertCircle, Info, CheckCircle2, AlertTriangle } from "lucide-react";

/**
 * ConfirmModal - Modal xác nhận hành động
 * @param {string} type - Loại modal: 'danger' (đỏ), 'warning' (vàng), 'success' (xanh lá), 'info' (xanh dương)
 */
const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, type = "danger" }) => {
  if (!isOpen) return null;

  const config = {
    danger: {
      bg: "bg-rose-50",
      border: "border-rose-100",
      iconColor: "text-rose-600",
      btnBg: "bg-rose-600 hover:bg-rose-700",
      icon: AlertCircle
    },
    warning: {
      bg: "bg-amber-50",
      border: "border-amber-100",
      iconColor: "text-amber-600",
      btnBg: "bg-amber-600 hover:bg-amber-700",
      icon: AlertTriangle
    },
    success: {
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      iconColor: "text-emerald-600",
      btnBg: "bg-emerald-600 hover:bg-emerald-700",
      icon: CheckCircle2
    },
    info: {
      bg: "bg-indigo-50",
      border: "border-indigo-100",
      iconColor: "text-indigo-600",
      btnBg: "bg-indigo-600 hover:bg-indigo-700",
      icon: Info
    }
  };

  const current = config[type] || config.info;
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200"
        onClick={onCancel}
      />

      {/* Modal */}
      <div
        className="relative bg-white w-full max-w-[400px] rounded-xl border border-gray-100 overflow-hidden animate-in zoom-in-95 fade-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl ${current.bg} flex items-center justify-center shrink-0 border ${current.border}`}>
              <Icon size={24} className={current.iconColor} />
            </div>
            <div className="flex-1">
              <h3 className="text-[17px] font-black text-gray-900 leading-tight">
                {title}
              </h3>
              <p className="text-[13px] text-gray-500 mt-2 font-medium leading-relaxed">
                {message}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-8">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-[13px] font-bold text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-lg transition-all cursor-pointer"
            >
              Bỏ qua
            </button>
            <button
              onClick={onConfirm}
              className={`px-6 py-2 text-[13px] font-bold text-white ${current.btnBg} rounded-lg transition-all active:scale-95 cursor-pointer`}
            >
              Xác nhận
            </button>
          </div>
        </div>

        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition text-gray-300 hover:text-gray-500 cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default ConfirmModal;
