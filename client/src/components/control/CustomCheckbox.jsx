import React from "react";
import { Check } from "lucide-react";

/**
 * CustomCheckbox Component
 * Focused on the brand identity with custom styling and animations.
 */
const CustomCheckbox = ({ checked, onChange, disabled, circular = false }) => {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onChange(!checked);
      }}
      disabled={disabled}
      className={`
        relative w-5 h-5 border-2 flex items-center justify-center cursor-pointer outline-none transition-all
        ${circular ? "rounded-full" : "rounded-md"}
        ${
          checked
            ? "bg-[var(--brand-primary)] border-[var(--brand-primary)]"
            : "bg-white border-[var(--grid-border)]"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      {checked && (
        circular 
          ? <div className="w-2 h-2 rounded-full bg-white animate-in zoom-in-50 duration-200" />
          : <Check size={14} strokeWidth={4} className="text-white animate-in zoom-in-50 duration-200" />
      )}
    </button>
  );
};

export default CustomCheckbox;
