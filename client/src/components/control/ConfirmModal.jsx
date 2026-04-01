import React from "react";
import { X, AlertCircle } from "lucide-react";

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px] animate-in fade-in duration-200"
        onClick={onCancel}
      />

      {/* Modal */}
      <div
        className="relative bg-white w-full max-w-[400px] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0 border border-rose-100">
              <AlertCircle size={20} className="text-rose-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-[16px] font-bold text-gray-900 leading-tight">
                {title}
              </h3>
              <p className="text-[13px] text-gray-500 mt-2 leading-relaxed">
                {message}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-8">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-[13px] font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition cursor-pointer"
            >
              Bỏ qua
            </button>
            <button
              onClick={onConfirm}
              className="px-6 py-2 text-[13px] font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition active:scale-95 cursor-pointer"
            >
              Xác nhận
            </button>
          </div>
        </div>

        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition text-gray-400 cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default ConfirmModal;
