import React, { useState, useEffect } from "react";
import { X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

/**
 * Reusable ImageZoomModal Component
 * Premium design with glassmorphic controls and zoom features.
 */
const ImageZoomModal = ({ isOpen, src, alt, onClose }) => {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (isOpen) {
      setScale(1);
    }
  }, [isOpen]);

  if (!isOpen || !src) return null;

  const handleZoomIn = (e) => {
    e.stopPropagation();
    setScale((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = (e) => {
    e.stopPropagation();
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleResetZoom = (e) => {
    e.stopPropagation();
    setScale(1);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Top bar controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2.5 z-50">
        <button
          onClick={handleZoomIn}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all cursor-pointer border border-white/10"
          title="Phóng to (Zoom In)"
        >
          <ZoomIn size={18} />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all cursor-pointer border border-white/10"
          title="Thu nhỏ (Zoom Out)"
        >
          <ZoomOut size={18} />
        </button>
        <button
          onClick={handleResetZoom}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all cursor-pointer border border-white/10"
          title="Đặt lại (Reset)"
        >
          <RotateCcw size={16} />
        </button>
        <div className="w-[1px] h-6 bg-white/20 mx-1" />
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-rose-600/80 hover:bg-rose-600 active:scale-95 text-white transition-all cursor-pointer border border-rose-500/30"
          title="Đóng (Close)"
        >
          <X size={18} />
        </button>
      </div>

      {/* Image container */}
      <div
        className="relative max-w-full max-h-[85vh] overflow-hidden flex items-center justify-center transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt={alt || "Hình ảnh phóng to"}
          className="max-w-[90vw] max-h-[80vh] object-contain rounded-xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] transition-transform duration-200 select-none"
          style={{ transform: `scale(${scale})` }}
        />
      </div>

      {/* Bottom text */}
      {alt && (
        <div className="absolute bottom-6 px-5 py-2.5 bg-black/60 backdrop-blur-md rounded-full text-white/90 text-sm font-semibold border border-white/15 shadow-xl select-none max-w-[80vw] truncate">
          {alt}
        </div>
      )}
    </div>
  );
};

export default ImageZoomModal;
