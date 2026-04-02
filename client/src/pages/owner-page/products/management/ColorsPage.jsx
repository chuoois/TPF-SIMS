import React, { useState, useMemo } from "react";
import {
  Plus,
  Pencil,
  X,
  Palette,
  Settings2,
  Trash2,
  Check,
} from "lucide-react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import { COLORS as INITIAL_COLORS } from "../constants";
import toast from "react-hot-toast";
import DataTable from "@/components/control/DataTable";
import ConfirmModal from "@/components/control/ConfirmModal";

/**
 * ColorsPage Component
 * Managed products colors page using standardized control components.
 */
const ColorsPage = () => {
  const [colors, setColors] = useState(INITIAL_COLORS);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [modal, setModal] = useState({ isOpen: false, mode: "add", data: null });
  const [inputValue, setInputValue] = useState("");

  const handleOpenModal = (mode, color = null) => {
    setModal({ isOpen: true, mode, data: color });
    setInputValue(color || "");
  };

  const closeModal = () => {
    setModal({ isOpen: false, mode: "add", data: null });
    setInputValue("");
  };

  const handleSaveColor = () => {
    if (!inputValue.trim()) {
      return toast.error("Vui lòng nhập tên màu sắc!");
    }

    if (modal.mode === "add") {
      if (colors.includes(inputValue.trim())) {
        return toast.error("Màu sắc này đã tồn tại!");
      }
      setColors([...colors, inputValue.trim()]);
      toast.success("Đã thêm màu mới!");
    } else {
      if (inputValue.trim() === modal.data) {
        return closeModal();
      }
      setColors(
        colors.map((c) => (c === modal.data ? inputValue.trim() : c)),
      );
      toast.success("Đã cập nhật màu sắc!");
    }
    closeModal();
  };

  const handleDelete = (name) => {
    setColors(colors.filter((c) => c !== name));
    toast.success(`Đã xóa màu "${name}"!`);
  };

  const handleBulkDelete = () => {
    setColors(colors.filter((c) => !selectedIds.includes(c)));
    setSelectedIds([]);
    toast.success(`Đã xóa ${selectedIds.length} màu sắc đã chọn!`);
  };

  const filteredColors = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return colors;
    return colors.filter((c) => c.toLowerCase().includes(q));
  }, [colors, searchTerm]);

  // Data mapping for DataTable (since we only have an array of strings)
  const tableData = useMemo(() => {
    return filteredColors.map((c) => ({
      id: c, // using name as ID for selection logic
      name: c,
    }));
  }, [filteredColors]);

  const columns = [
    {
      header: "STT",
      headerClassName: "w-[80px] text-center",
      className: "text-center font-medium text-gray-400",
      render: (_, i) => i + 1,
    },
    {
      header: "Tên màu sắc",
      render: (row) => (
        <div className="flex items-center gap-2 font-bold text-gray-700">
          <Palette size={14} className="text-[var(--brand-primary)]" />
          {row.name}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHelmet title="Quản lý màu sắc | TPF-SIMS" />

      <div className="flex flex-col h-[calc(100vh-64px)] -m-6 p-6 space-y-4 bg-[var(--bg-main)]">
        {/* HEADER */}
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1
              className="text-xl font-bold flex items-center gap-2"
              style={{ color: "var(--text-main)" }}
            >
              <Settings2 size={22} style={{ color: "var(--brand-primary)" }} />
              Quản lý bảng màu sắc
            </h1>
            <p className="text-[13px] mt-0.5 text-gray-400">
              {colors.length} màu sắc đang được sử dụng để hoàn thiện sản phẩm
            </p>
          </div>
          <button
            onClick={() => handleOpenModal("add")}
            className="h-10 px-6 rounded-xl flex items-center gap-2 text-[13px] font-bold transition-all hover:opacity-90 shadow-sm active:scale-95 text-white"
            style={{ backgroundColor: "var(--brand-primary)" }}
          >
            <Plus size={18} /> Thêm màu sắc mới
          </button>
        </div>

        {/* DATA TABLE */}
        <DataTable
          columns={columns}
          data={tableData}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          searchPlaceholder="Tìm kiếm tên màu sắc..."
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          rowActions={[
            {
              icon: Pencil,
              label: "Sửa tên",
              onClick: (row) => handleOpenModal("edit", row.name),
            },
            {
              icon: Trash2,
              label: "Xóa",
              onClick: (row) => handleDelete(row.name),
              requireConfirm: true,
              confirmTitle: "Xác nhận xóa màu sắc?",
              confirmMessage:
                "Bạn có chắc muốn xóa màu sắc này? Các sản phẩm sử dụng màu này có thể bị ảnh hưởng.",
              className: "text-red-500 hover:bg-red-50 hover:border-red-100",
            },
          ]}
          bulkActions={[
            {
              label: "XÓA HÀNG LOẠT",
              icon: Trash2,
              onClick: handleBulkDelete,
              requireConfirm: true,
              confirmTitle: "Xóa hàng loạt màu sắc?",
              confirmMessage: `Bạn có chắc chắn muốn xóa ${selectedIds.length} màu sắc đã chọn không? Hành động này không thể hoàn tác.`,
            },
          ]}
        />
      </div>

      {/* ADD/EDIT MODAL */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px] animate-in fade-in duration-200"
            onClick={closeModal}
          />
          <div className="relative bg-white w-full max-w-md rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b flex items-center justify-between bg-gray-50/50">
              <h3 className="text-[16px] font-bold text-gray-900">
                {modal.mode === "add" ? "Thêm màu sắc mới" : "Sửa tên màu sắc"}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                Tên màu sắc <span className="text-red-500">*</span>
              </label>
              <input
                autoFocus
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="VD: Cánh gián, Sơn trắng S8..."
                className="w-full h-11 px-4 rounded-lg border border-gray-200 focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] outline-none text-[15px] font-medium transition-all"
                onKeyDown={(e) => e.key === "Enter" && handleSaveColor()}
              />
            </div>
            <div className="px-6 py-4 border-t bg-gray-50/50 flex items-center justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-5 py-2.5 rounded-lg text-[13px] font-bold text-gray-500 hover:bg-gray-100 transition-all shadow-sm"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSaveColor}
                className="px-6 py-2.5 rounded-lg text-[13px] font-bold text-white transition-all shadow-sm flex items-center gap-2 hover:opacity-90 active:scale-95"
                style={{ backgroundColor: "var(--brand-primary)" }}
              >
                <Check size={18} />
                Lưu lại
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ColorsPage;
