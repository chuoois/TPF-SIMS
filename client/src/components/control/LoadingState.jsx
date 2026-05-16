import React from "react";
import { Loader2 } from "lucide-react";

const LoadingState = ({ message = "Đang tải dữ liệu...", className = "" }) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      <div className="relative mb-4">
        <div className="w-12 h-12 rounded-full border-4 border-slate-100 animate-pulse"></div>
        <Loader2 
          className="absolute inset-0 animate-spin text-[var(--brand-primary)]" 
          size={48} 
          strokeWidth={1.5}
        />
      </div>
      <p className="text-[14px] font-medium text-slate-500 animate-pulse">
        {message}
      </p>
    </div>
  );
};

export default LoadingState;
