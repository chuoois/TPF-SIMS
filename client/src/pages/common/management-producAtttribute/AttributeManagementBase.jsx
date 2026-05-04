import React, { useState, useMemo, useCallback } from "react";
import {
  Plus,
  Pencil,
  X,
  Trash2,
  Check,
  Loader2,
} from "lucide-react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import productAttributeService from "@/services/productAttribute.service";
import toast from "react-hot-toast";
import DataTable from "@/components/control/DataTable";
import ConfirmModal from "@/components/control/ConfirmModal";
import useCachedFetch from "@/hooks/useCachedFetch";

/**
 * AttributeManagementBase Component
 * A common base for managing product attributes (Categories, Colors, Materials, Rooms).
 */
const AttributeManagementBase = ({
  type,
  title,
  icon: Icon,
  itemIcon: ItemIcon,
  placeholder,
  unitLabel,
  searchField,
  pkField,
  responseKey,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
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

  const fetchFn = useCallback(async () => {
    const result = await productAttributeService.getAttributeList(type, {
      search: searchTerm,
      page: currentPage,
      limit: itemsPerPage,
    });
    return {
      items: result[responseKey] || [],
      total: result.pagination?.totalItems || 0,
    };
  }, [type, responseKey, searchTerm, currentPage, itemsPerPage]);

  const {
    data: cachedData,
    isLoading,
    isRefreshing,
    refresh,
  } = useCachedFetch(
    `mgmt_${type}_${searchTerm}_${currentPage}_${itemsPerPage}`,
    fetchFn,
    { ttl: 1000 * 60 * 5 },
  );

  const items = cachedData?.items || [];
  const total = cachedData?.total || 0;

  const handleOpenModal = (mode, item = null) => {
    setModal({ isOpen: true, mode, data: item });
    setInputValue(item ? item[searchField] : "");
  };

  const closeModal = () => {
    setModal({ isOpen: false, mode: "add", data: null });
    setInputValue("");
  };

  const handleSave = async () => {
    if (!inputValue.trim()) {
      return toast.error(`Vui lòng nhập tên ${unitLabel}!`);
    }

    const loadingToast = toast.loading(
      modal.mode === "add" ? "Đang thêm..." : "Đang cập nhật...",
    );
    try {
      const data = { name: inputValue.trim() };
      if (modal.mode === "edit" && modal.data) {
        data.id = modal.data[pkField];
      }

      await productAttributeService.saveAttribute(type, data);

      toast.success(
        modal.mode === "add"
          ? `Đã thêm ${unitLabel} mới!`
          : `Đã cập nhật ${unitLabel}!`,
        { id: loadingToast },
      );
      refresh();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || `Lỗi khi lưu ${unitLabel}`, {
        id: loadingToast,
      });
    }
  };

  const handleConfirmDelete = (item) => {
    setDeleteConfirm({ isOpen: true, item });
  };

  const handleDelete = async () => {
    const { item } = deleteConfirm;
    if (!item) return;

    const loadingToast = toast.loading(`Đang xóa ${unitLabel}...`);
    try {
      await productAttributeService.deleteAttribute(type, item.id);
      toast.success(`Đã xóa ${unitLabel} thành công`, { id: loadingToast });
      refresh();
      setDeleteConfirm({ isOpen: false, item: null });
    } catch (error) {
      toast.error(error.response?.data?.message || `Lỗi khi xóa ${unitLabel}`, {
        id: loadingToast,
      });
    }
  };

  const handleDeleteMultiple = async () => {
    if (selectedIds.length === 0) return;

    const loadingToast = toast.loading(`Đang xóa ${selectedIds.length} mục...`);
    try {
      await productAttributeService.deleteMultipleAttributes(type, selectedIds);
      toast.success(`Đã xóa thành công ${selectedIds.length} ${unitLabel}!`, {
        id: loadingToast,
      });
      refresh();
      setSelectedIds([]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi xóa nhiều mục", {
        id: loadingToast,
      });
    }
  };

  // Data mapping for DataTable
  const tableData = useMemo(() => {
    return (items || []).map((item) => ({
      id: item[pkField],
      name: item[searchField],
    }));
  }, [items, pkField, searchField]);

  const columns = [
    {
      header: "STT",
      headerClassName: "w-[80px] text-center",
      className: "text-center font-medium text-gray-400",
      render: (_, i) => (currentPage - 1) * itemsPerPage + i + 1,
    },
    {
      header: `Tên ${unitLabel}`,
      render: (row) => (
        <div className="flex items-center gap-2 font-bold text-gray-700">
          {ItemIcon && <ItemIcon size={14} className="text-[var(--brand-primary)]" />}
          {row.name}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHelmet title={`${title} | TPF-SIMS`} />

      {/* TOP LOADING BAR (PURPLE THING) */}
      {(isLoading || isRefreshing) && (
        <div className="fixed top-0 left-0 right-0 z-[9999]">
          <div className="h-[2px] bg-indigo-500 animate-[loading_1.5s_infinite] origin-left"></div>
        </div>
      )}

      <div className="flex flex-col h-[calc(100vh-64px)] -m-6 p-6 space-y-4 bg-[var(--bg-main)]">
        {/* HEADER */}
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1
              className="text-xl font-bold flex items-center gap-2"
              style={{ color: "var(--text-main)" }}
            >
              {Icon && <Icon size={22} style={{ color: "var(--brand-primary)" }} />}
              {title}
            </h1>
            <p className="text-[13px] mt-0.5 text-gray-400">
              Tổng số {total} {unitLabel} hiện có trong hệ thống
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleOpenModal("add")}
              className="h-10 px-6 rounded-xl flex items-center gap-2 text-[13px] font-bold transition-all hover:opacity-90 shadow-sm active:scale-95 text-white"
              style={{ backgroundColor: "var(--brand-primary)" }}
            >
              <Plus size={18} /> Thêm {unitLabel} mới
            </button>
          </div>
        </div>

        {/* DATA TABLE */}
        {isLoading && items.length === 0 ? (
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
            searchPlaceholder={placeholder}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
            bulkActions={[
              {
                label: "Xóa các mục đã chọn",
                icon: Trash2,
                onClick: handleDeleteMultiple,
                requireConfirm: true,
                confirmTitle: "Xác nhận xóa nhiều",
                confirmMessage: `Bạn có chắc chắn muốn xóa ${selectedIds.length} mục đã chọn? Thao tác này không thể hoàn tác.`,
              },
            ]}
            rowActions={[
              {
                icon: Pencil,
                label: "Sửa tên",
                onClick: (row) => {
                  const original = items.find((item) => item[pkField] === row.id);
                  handleOpenModal("edit", original);
                },
              },
              {
                icon: Trash2,
                label: `Xóa ${unitLabel}`,
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
                {modal.mode === "add" ? `Thêm ${unitLabel} mới` : `Sửa tên ${unitLabel}`}
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
                Tên {unitLabel} <span className="text-red-500">*</span>
              </label>
              <input
                autoFocus
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={placeholder}
                className="w-full h-11 px-4 rounded-lg border border-gray-200 focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] outline-none text-[15px] font-medium transition-all"
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
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
                onClick={handleSave}
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
        title={`Xác nhận xóa ${unitLabel}`}
        message={`Bạn có chắc chắn muốn xóa "${deleteConfirm.item?.name}" không? Thao tác này sẽ xóa vĩnh viễn khỏi hệ thống.`}
        onCancel={() => setDeleteConfirm({ isOpen: false, item: null })}
        onConfirm={handleDelete}
        confirmLabel={`Xóa ${unitLabel}`}
        confirmVariant="danger"
      />
    </>
  );
};

export default AttributeManagementBase;
