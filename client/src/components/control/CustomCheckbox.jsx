import React from "react";
import { Check } from "lucide-react";

/**
 * CustomCheckbox Component
 * Focused on the brand identity with custom styling and animations.
 */
const CustomCheckbox = ({ checked, onChange, disabled }) => {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onChange(!checked);
      }}
      disabled={disabled}
      className={`
        relative w-5 h-5 rounded-md border-2 transition-all duration-200 flex items-center justify-center cursor-pointer outline-none
        ${
          checked
            ? "bg-[var(--brand-primary)] border-[var(--brand-primary)] scale-105"
            : "bg-white border-[var(--grid-border)] hover:border-[var(--brand-primary)]"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : "active:scale-95"}
      `}
      style={checked ? { boxShadow: "0 2px 8px rgba(52, 176, 87, 0.4)" } : {}}
    >
      <div
        className={`
          transition-all duration-200 transform
          ${checked ? "scale-100 opacity-100" : "scale-0 opacity-0"}
        `}
      >
        <Check size={14} strokeWidth={4} className="text-white" />
      </div>
    </button>
  );
};

export default CustomCheckbox;
