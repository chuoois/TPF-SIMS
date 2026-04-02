import React from "react";
import { Plus, Pencil, Ban, Palette } from "lucide-react";

/**
 * PropertiesTab Component
 * Managed product properties like colors.
 */
const PropertiesTab = ({
  colors,
  onAddColor,
  onEditColor,
  onDeleteColor,
}) => {
  return (
    <div
      className="flex flex-col bg-white rounded-2xl flex-1 overflow-hidden"
      style={{
        boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
      }}
    >
      <div
        className="px-6 py-4 border-b flex items-center justify-between shrink-0"
        style={{ borderColor: "var(--grid-border)" }}
      >
        <div>
          <h2 className="text-[15px] font-bold text-gray-900">
            Màu sắc sản phẩm
          </h2>
          <p className="text-[12px] text-gray-400 mt-0.5 font-medium">
            Quản lý bảng màu sơn và hoàn thiện
          </p>
        </div>
        <button
          onClick={onAddColor}
          className="h-9 px-4 rounded-xl flex items-center gap-2 text-[13px] font-bold transition hover:opacity-90 shadow-sm"
          style={{ backgroundColor: "var(--brand-primary)", color: "#fff" }}
        >
          <Plus size={16} /> Thêm màu sắc
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left relative text-[13px]">
          <thead
            className="sticky top-0 z-10"
            style={{
              backgroundColor: "var(--grid-header-bg)",
              borderBottom: "1px solid var(--grid-border)",
            }}
          >
            <tr>
              <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 w-16">
                STT
              </th>
              <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Tên màu
              </th>
              <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 text-right w-32">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {colors.map((c, idx) => (
              <tr key={c} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-3.5 text-gray-400 font-medium italic">
                  {idx + 1}
                </td>
                <td className="px-6 py-3.5">
                  <div className="flex items-center gap-2 font-bold text-gray-700">
                    <Palette size={14} className="text-blue-500" />
                    {c}
                  </div>
                </td>
                <td className="px-6 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEditColor(c)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => onDeleteColor(c)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Ban size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PropertiesTab;
