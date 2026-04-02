import React, { useState, useMemo } from "react";
import {
  Plus,
  Pencil,
  X,
  Ruler,
  Settings2,
  Trash2,
  Check,
} from "lucide-react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import { UNITS as INITIAL_UNITS } from "../constants";
import toast from "react-hot-toast";
import DataTable from "@/components/control/DataTable";
import ConfirmModal from "@/components/control/ConfirmModal";

/**
 * UnitsPage Component
 * Managed products units page using standardized control components.
 */
const UnitsPage = () => {
  const [units, setUnits] = useState(INITIAL_UNITS);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [modal, setModal] = useState({ isOpen: false, mode: "add", data: null });
  const [inputValue, setInputValue] = useState("");

  const handleOpenModal = (mode, unit = null) => {
    setModal({ isOpen: true, mode, data: unit });
    setInputValue(unit || "");
  };

  const closeModal = () => {
    setModal({ isOpen: false, mode: "add", data: null });
    setInputValue("");
  };

  const handleSaveUnit = () => {
    if (!inputValue.trim()) {
      return toast.error("Vui lòng nhập tên đơn vị tính!");
    }

    if (modal.mode === "add") {
      if (units.includes(inputValue.trim())) {
        return toast.error("Đơn vị này đã tồn tại!");
      }
      setUnits([...units, inputValue.trim()]);
      toast.success("Đã thêm đơn vị tính mới!");
    } else {
      if (inputValue.trim() === modal.data) {
        return closeModal();
      }
      setUnits(
        units.map((u) => (u === modal.data ? inputValue.trim() : u)),
      );
      toast.success("Đã cập nhật đơn vị tính!");
    }
    closeModal();
  };

  const handleDelete = (name) => {
    setUnits(units.filter((u) => u !== name));
    toast.success(`Đã xóa đơn vị "${name}"!`);
  };

  const handleBulkDelete = () => {
    setUnits(units.filter((u) => !selectedIds.includes(u)));
    setSelectedIds([]);
    toast.success(`Đã xóa ${selectedIds.length} đơn vị đã chọn!`);
  };

  const filteredUnits = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return units;
    return units.filter((u) => u.toLowerCase().includes(q));
  }, [units, searchTerm]);

  // Data mapping for DataTable (since we only have an array of strings)
  const tableData = useMemo(() => {
    return filteredUnits.map((u) => ({
      id: u, // using name as ID for selection logic
      name: u,
    }));
  }, [filteredUnits]);

  const columns = [
    {
      header: "STT",
      headerClassName: "w-[80px] text-center",
      className: "text-center font-medium text-gray-400",
      render: (_, i) => i + 1,
    },
    {
      header: "Tên đơn vị tính",
      render: (row) => (
        <div className="flex items-center gap-2 font-bold text-gray-700">
          <Ruler size={14} className="text-purple-500" />
          {row.name}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHelmet title="Quản lý đơn vị tính | TPF-SIMS" />

      <div className="flex flex-col h-[calc(100vh-64px)] -m-6 p-6 space-y-4 bg-[var(--bg-main)]">
        {/* HEADER */}
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1
              className="text-xl font-bold flex items-center gap-2"
              style={{ color: "var(--text-main)" }}
            >
              <Settings2 size={22} style={{ color: "var(--brand-primary)" }} />
              Quản lý đơn vị sản phẩm
            </h1>
            <p className="text-[13px] mt-0.5 text-gray-400">
              {units.length} đơn vị đo lường đang được áp dụng cho sản phẩm
            </p>
          </div>
          <button
            onClick={() => handleOpenModal("add")}
            className="h-10 px-6 rounded-lg flex items-center gap-2 text-[13px] font-bold transition-all hover:opacity-90 shadow-sm active:scale-95 text-white"
            style={{ backgroundColor: "var(--brand-primary)" }}
          >
            <Plus size={18} /> Thêm đơn vị mới
          </button>
        </div>

        {/* DATA TABLE */}
        <DataTable
          columns={columns}
          data={tableData}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          searchPlaceholder="Tìm kiếm tên đơn vị..."
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
              confirmTitle: "Xác nhận xóa đơn vị?",
              confirmMessage:
                "Bạn có chắc muốn xóa đơn vị tính này? Các sản phẩm sử dụng đơn vị này có thể bị ảnh hưởng.",
              className: "text-red-500 hover:bg-red-50 hover:border-red-100",
            },
          ]}
          bulkActions={[
            {
              label: "XÓA HÀNG LOẠT",
              icon: Trash2,
              onClick: handleBulkDelete,
              requireConfirm: true,
              confirmTitle: "Xóa hàng loạt đơn vị?",
              confirmMessage: `Bạn có chắc chắn muốn xóa ${selectedIds.length} đơn vị đã chọn không? Hành động này không thể hoàn tác.`,
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
                {modal.mode === "add" ? "Thêm đơn vị mới" : "Sửa tên đơn vị"}
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
                Tên đơn vị <span className="text-red-500">*</span>
              </label>
              <input
                autoFocus
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="VD: Cái, Bộ, Kiện..."
                className="w-full h-11 px-4 rounded-lg border border-gray-200 focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] outline-none text-[15px] font-medium transition-all"
                onKeyDown={(e) => e.key === "Enter" && handleSaveUnit()}
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
                onClick={handleSaveUnit}
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

export default UnitsPage;
