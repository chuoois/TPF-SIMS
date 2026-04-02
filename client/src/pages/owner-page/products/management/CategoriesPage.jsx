import React, { useState, useMemo } from "react";
import {
  Plus,
  Pencil,
  X,
  Package,
  LayoutGrid,
  Trash2,
  Check,
} from "lucide-react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import { CATEGORIES as INITIAL_CATEGORIES } from "../constants";
import toast from "react-hot-toast";
import DataTable from "@/components/control/DataTable";
import ConfirmModal from "@/components/control/ConfirmModal";

/**
 * CategoriesPage Component
 * Managed products categories page using standardized control components.
 */
const CategoriesPage = () => {
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [modal, setModal] = useState({ isOpen: false, mode: "add", data: null });
  const [inputValue, setInputValue] = useState("");



  const handleOpenModal = (mode, category = null) => {
    setModal({ isOpen: true, mode, data: category });
    setInputValue(category || "");
  };

  const closeModal = () => {
    setModal({ isOpen: false, mode: "add", data: null });
    setInputValue("");
  };

  const handleSaveCategory = () => {
    if (!inputValue.trim()) {
      return toast.error("Vui lòng nhập tên danh mục!");
    }

    if (modal.mode === "add") {
      if (categories.includes(inputValue.trim())) {
        return toast.error("Danh mục này đã tồn tại!");
      }
      setCategories([...categories, inputValue.trim()]);
      toast.success("Đã thêm danh mục mới!");
    } else {
      if (inputValue.trim() === modal.data) {
        return closeModal();
      }
      setCategories(
        categories.map((c) => (c === modal.data ? inputValue.trim() : c)),
      );
      toast.success("Đã cập nhật tên danh mục!");
    }
    closeModal();
  };

  const handleDelete = (name) => {
    setCategories(categories.filter((c) => c !== name));
    toast.success(`Đã xóa danh mục "${name}"!`);
  };

  const handleBulkDelete = () => {
    setCategories(categories.filter((c) => !selectedIds.includes(c)));
    setSelectedIds([]);
    toast.success(`Đã xóa ${selectedIds.length} danh mục đã chọn!`);
  };

  const filteredCategories = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return categories;
    return categories.filter((c) => c.toLowerCase().includes(q));
  }, [categories, searchTerm]);

  // Data mapping for DataTable (since we only have an array of strings)
  const tableData = useMemo(() => {
    return filteredCategories.map((c) => ({
      id: c, // using name as ID for selection logic
      name: c,
    }));
  }, [filteredCategories]);

  const columns = [
    {
      header: "STT",
      headerClassName: "w-[80px] text-center",
      className: "text-center font-medium text-gray-400",
      render: (_, i) => i + 1,
    },
    {
      header: "Tên danh mục",
      render: (row) => (
        <div className="flex items-center gap-2">
          <LayoutGrid size={14} className="text-[var(--brand-primary)]" />
          <span className="font-bold text-gray-900 text-[14px]">
            {row.name}
          </span>
        </div>
      ),
    },
    {
      header: "Số lượng hàng",
      headerClassName: "text-center",
      className: "text-center",
      render: () => (
        <span className="inline-flex px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-600 border border-amber-100">
          10 món
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHelmet title="Quản lý danh mục | TPF-SIMS" />

      <div className="flex flex-col h-[calc(100vh-64px)] -m-6 p-6 space-y-4 bg-[var(--bg-main)]">
        {/* HEADER */}
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1
              className="text-xl font-bold flex items-center gap-2"
              style={{ color: "var(--text-main)" }}
            >
              <LayoutGrid size={22} style={{ color: "var(--brand-primary)" }} />
              Quản lý danh mục sản phẩm
            </h1>
            <p className="text-[13px] mt-0.5 text-gray-400">
              {categories.length} nhóm sản phẩm chính hiện có
            </p>
          </div>
          <button
            onClick={() => handleOpenModal("add")}
            className="h-10 px-6 rounded-xl flex items-center gap-2 text-[13px] font-bold transition-all hover:opacity-90 shadow-sm active:scale-95 text-white"
            style={{ backgroundColor: "var(--brand-primary)" }}
          >
            <Plus size={18} /> Thêm danh mục mới
          </button>
        </div>

        {/* DATA TABLE */}
        <DataTable
          columns={columns}
          data={tableData}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          searchPlaceholder="Tìm kiếm tên danh mục..."
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
              confirmTitle: "Xác nhận xóa danh mục?",
              confirmMessage:
                "Bạn có chắc muốn xóa danh mục này? Các sản phẩm thuộc danh mục này có thể bị ảnh hưởng.",
              className: "text-red-500 hover:bg-red-50 hover:border-red-100",
            },
          ]}
          bulkActions={[
            {
              label: "XÓA HÀNG LOẠT",
              icon: Trash2,
              onClick: handleBulkDelete,
              requireConfirm: true,
              confirmTitle: "Xóa hàng loạt danh mục?",
              confirmMessage: `Bạn có chắc chắn muốn xóa ${selectedIds.length} danh mục đã chọn không? Hành động này không thể hoàn tác.`,
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
                {modal.mode === "add" ? "Thêm danh mục mới" : "Sửa tên danh mục"}
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
                Tên danh mục <span className="text-red-500">*</span>
              </label>
              <input
                autoFocus
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="VD: Phòng khách hiện đại..."
                className="w-full h-11 px-4 rounded-lg border border-gray-200 focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] outline-none text-[15px] font-medium transition-all"
                onKeyDown={(e) => e.key === "Enter" && handleSaveCategory()}
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
                onClick={handleSaveCategory}
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

export default CategoriesPage;
