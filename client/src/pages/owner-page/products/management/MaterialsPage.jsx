import React, { useState, useMemo, useEffect } from "react";
import {
  Plus,
  Pencil,
  X,
  Hammer,
  Settings2,
  Trash2,
  Check,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import productAttributeService from "@/services/productAttribute.service";
import toast from "react-hot-toast";
import DataTable from "@/components/control/DataTable";
import ConfirmModal from "@/components/control/ConfirmModal";

/**
 * MaterialsPage Component
 * Managed products materials page using a unified standardized interface.
 */
const MaterialsPage = () => {
  const [materials, setMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState([]);
  const [modal, setModal] = useState({
    isOpen: false,
    mode: "add",
    data: null,
  });
  const [inputValue, setInputValue] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    item: null,
  });

  const fetchMaterials = async () => {
    setIsLoading(true);
    try {
      const result = await productAttributeService.getAttributeList("material", {
        search: searchTerm,
        page: currentPage,
        limit: itemsPerPage,
      });
      setMaterials(result.data);
      setTotal(result.total);
    } catch (error) {
      toast.error("Không thể tải danh sách chất liệu");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchMaterials();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, currentPage, itemsPerPage]);

  const handleOpenModal = (mode, material = null) => {
    setModal({ isOpen: true, mode, data: material });
    setInputValue(material ? material.material_name : "");
  };

  const closeModal = () => {
    setModal({ isOpen: false, mode: "add", data: null });
    setInputValue("");
  };

  const handleSaveMaterial = async () => {
    if (!inputValue.trim()) {
      return toast.error("Vui lòng nhập tên chất liệu!");
    }

    const loadingToast = toast.loading(
      modal.mode === "add" ? "Đang thêm..." : "Đang cập nhật...",
    );
    try {
      const data = { name: inputValue.trim() };
      if (modal.mode === "edit" && modal.data) {
        data.id = modal.data.pk_product_material_id;
      }

      await productAttributeService.saveAttribute("material", data);

      toast.success(
        modal.mode === "add"
          ? "Đã thêm chất liệu mới!"
          : "Đã cập nhật chất liệu!",
        { id: loadingToast },
      );
      fetchMaterials();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi lưu chất liệu", {
        id: loadingToast,
      });
    }
  };

  const handleConfirmDelete = (item) => {
    setDeleteConfirm({ isOpen: true, item });
  };

  const handleDeleteMaterial = async () => {
    const { item } = deleteConfirm;
    if (!item) return;

    const loadingToast = toast.loading("Đang xóa chất liệu...");
    try {
      await productAttributeService.deleteAttribute("material", item.id);
      toast.success("Đã xóa chất liệu thành công", { id: loadingToast });
      fetchMaterials();
      setDeleteConfirm({ isOpen: false, item: null });
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi xóa chất liệu", {
        id: loadingToast,
      });
    }
  };

  // Data mapping for DataTable
  const tableData = useMemo(() => {
    return materials.map((m) => ({
      id: m.pk_product_material_id,
      name: m.material_name,
    }));
  }, [materials]);

  const columns = [
    {
      header: "STT",
      headerClassName: "w-[80px] text-center",
      className: "text-center font-medium text-gray-400",
      render: (_, i) => (currentPage - 1) * itemsPerPage + i + 1,
    },
    {
      header: "Tên chất liệu",
      render: (row) => (
        <div className="flex items-center gap-2 font-bold text-gray-700">
          <Hammer size={14} className="text-amber-600" />
          {row.name}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHelmet title="Quản lý chất liệu | TPF-SIMS" />

      <div className="flex flex-col h-[calc(100vh-64px)] -m-6 p-6 space-y-4 bg-[var(--bg-main)]">
        {/* HEADER */}
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1
              className="text-xl font-bold flex items-center gap-2"
              style={{ color: "var(--text-main)" }}
            >
              <Settings2 size={22} style={{ color: "var(--brand-primary)" }} />
              Quản lý danh mục chất liệu
            </h1>
            <p className="text-[13px] mt-0.5 text-gray-400">
              Tổng số {total} loại vật tư và chất liệu đang được sử dụng
            </p>
          </div>
          <button
            onClick={() => handleOpenModal("add")}
            className="h-10 px-6 rounded-lg flex items-center gap-2 text-[13px] font-bold transition-all hover:opacity-90 shadow-sm active:scale-95 text-white"
            style={{ backgroundColor: "var(--brand-primary)" }}
          >
            <Plus size={18} /> Thêm chất liệu mới
          </button>
        </div>

        {/* DATA TABLE */}
        {isLoading && materials.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--brand-primary)]" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={tableData}
            searchTerm={searchTerm}
            setSearchTerm={(val) => {
              setSearchTerm(val);
              setCurrentPage(1);
            }}
            searchPlaceholder="Tìm kiếm tên chất liệu..."
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
            rowActions={[
              {
                icon: Pencil,
                label: "Sửa tên",
                onClick: (row) => {
                  const original = materials.find(
                    (m) => m.pk_product_material_id === row.id,
                  );
                  handleOpenModal("edit", original);
                },
              },
              {
                icon: Trash2,
                label: "Xóa chất liệu",
                onClick: (row) => handleConfirmDelete(row),
                className: "text-red-500 hover:bg-red-50",
              },
            ]}
            pagination={{
              total,
              currentPage,
              setCurrentPage,
              itemsPerPage,
              setItemsPerPage,
            }}
          />
        )}
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
                {modal.mode === "add"
                  ? "Thêm chất liệu mới"
                  : "Sửa tên chất liệu"}
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
                Tên chất liệu <span className="text-red-500">*</span>
              </label>
              <input
                autoFocus
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="VD: Gỗ Sồi, Gỗ Lim, Đồng Đỏ..."
                className="w-full h-11 px-4 rounded-lg border border-gray-200 focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] outline-none text-[15px] font-medium transition-all"
                onKeyDown={(e) => e.key === "Enter" && handleSaveMaterial()}
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
                onClick={handleSaveMaterial}
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

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title="Xác nhận xóa chất liệu"
        message={`Bạn có chắc chắn muốn xóa chất liệu "${deleteConfirm.item?.name}" không? Thao tác này sẽ ẩn chất liệu khỏi các danh sách lựa chọn.`}
        onCancel={() => setDeleteConfirm({ isOpen: false, item: null })}
        onConfirm={handleDeleteMaterial}
        confirmLabel="Xóa chất liệu"
        confirmVariant="danger"
      />
    </>
  );
};

export default MaterialsPage;
