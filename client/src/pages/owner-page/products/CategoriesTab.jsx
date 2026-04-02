import React from "react";
import {
  Plus,
  Pencil,
  X,
  Armchair,
  Monitor,
  Bed,
  Flower2,
  Briefcase,
  Utensils,
  Box,
} from "lucide-react";

/**
 * CategoriesTab Component
 * Managed products categories list.
 */
const CategoriesTab = ({ categories, onAdd, onEdit, onDelete }) => {
  const getCategoryIcon = (name) => {
    const n = name.toLowerCase();
    if (n.includes("phòng khách"))
      return <Armchair size={18} className="text-orange-500" />;
    if (n.includes("phòng thờ"))
      return <Monitor size={18} className="text-red-500" />;
    if (n.includes("phòng ngủ"))
      return <Bed size={18} className="text-blue-500" />;
    if (n.includes("trang trí"))
      return <Flower2 size={18} className="text-purple-500" />;
    if (n.includes("làm việc"))
      return <Briefcase size={18} className="text-gray-600" />;
    if (n.includes("phòng ăn") || n.includes("bếp"))
      return <Utensils size={18} className="text-emerald-500" />;
    return <Box size={18} className="text-blue-500" />;
  };

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
            Danh mục sản phẩm
          </h2>
          <p className="text-[12px] text-gray-400 mt-0.5 font-medium">
            Quản lý các nhóm hàng hóa trong kho
          </p>
        </div>
        <button
          onClick={onAdd}
          className="h-9 px-4 rounded-xl flex items-center gap-2 text-[13px] font-bold transition hover:opacity-90 shadow-sm"
          style={{ backgroundColor: "var(--brand-primary)", color: "#fff" }}
        >
          <Plus size={16} /> Thêm danh mục
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
                Tên nhóm
              </th>
              <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 text-center w-32">
                Số hàng
              </th>
              <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 text-right w-32">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map((c, i) => (
              <tr
                key={c}
                className="hover:bg-gray-50/50 transition-colors group"
                style={{ borderBottom: "1px solid var(--grid-border)" }}
              >
                <td className="px-6 py-4 font-medium text-gray-400">
                  {String(i + 1).padStart(2, "0")}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:scale-110 transition-transform">
                      {getCategoryIcon(c)}
                    </div>
                    <span className="font-bold text-gray-900 text-[14px]">
                      {c}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex px-2 py-0.5 rounded-md text-[11px] font-bold bg-gray-50 text-gray-500 border border-gray-100">
                    10 món
                  </span>
                </td>
                <td className="px-6 py-4 relative">
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-end gap-1.5 translate-x-2 group-hover:translate-x-0">
                    <button
                      onClick={() => onEdit(c)}
                      className="h-8 px-3 text-[12px] font-bold text-gray-600 hover:text-blue-600 bg-white border border-gray-200 hover:border-blue-200 rounded-lg transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                    >
                      <Pencil size={14} /> Sửa
                    </button>
                    <button
                      onClick={() => onDelete(c)}
                      className="h-8 px-3 text-[12px] font-bold text-gray-600 hover:text-red-600 bg-white border border-gray-200 hover:border-red-200 rounded-lg transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                    >
                      <X size={14} /> Xóa
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

export default CategoriesTab;
