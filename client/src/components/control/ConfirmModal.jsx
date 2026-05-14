import React, { useState } from "react";
import { X, AlertCircle } from "lucide-react";

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, showInput = false, inputPlaceholder = "Nhập nội dung...", required = false }) => {
  const [inputValue, setInputValue] = useState("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (required && showInput && !inputValue.trim()) {
      return;
    }
    onConfirm(showInput ? inputValue : null);
    setInputValue("");
  };

  const handleCancel = () => {
    onCancel();
    setInputValue("");
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px] animate-in fade-in duration-200"
        onClick={handleCancel}
      />

      {/* Modal */}
      <div
        className="relative bg-white w-full max-w-[400px] rounded-lg border border-gray-100 overflow-hidden animate-in zoom-in-95 fade-in duration-200 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0 border border-rose-100">
              <AlertCircle size={20} className="text-rose-600" />
            </div>
            <div className="flex-1 text-[var(--sidebar-background)]">
              <h3 className="text-[16px] font-bold text-gray-900 leading-tight">
                {title}
              </h3>
              <p className="text-[13px] text-gray-500 mt-2 leading-relaxed">
                {message}
              </p>

              {showInput && (
                <div className="mt-4">
                  <textarea
                    autoFocus
                    className="w-full h-24 p-3 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all resize-none"
                    placeholder={inputPlaceholder}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                  {required && !inputValue.trim() && (
                    <p className="text-[11px] text-rose-500 mt-1 font-medium">* Vui lòng nhập lý do</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-8">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-[13px] font-bold text-gray-500 hover:bg-gray-100 rounded-lg transition cursor-pointer"
            >
              Bỏ qua
            </button>
            <button
              disabled={required && showInput && !inputValue.trim()}
              onClick={handleConfirm}
              className="px-6 py-2 text-[13px] font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Xác nhận
            </button>
          </div>
        </div>

        <button
          onClick={handleCancel}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition text-gray-400 cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default ConfirmModal;
