/**
 * CustomItemInputPanel — Right panel of CustomOrderRequirementsPage
 * Optimized layout for better usability, removed all animations.
 */

import { useState, useEffect } from "react";
import {
  X,
  Plus,
  Minus,
  CheckCircle2,
  Type,
  TreePine,
  Palette,
  Ruler,
  PackageCheck,
  CreditCard,
  ClipboardEdit,
  ImagePlus,
  Hammer,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { fmt, WOOD_TYPES, COLORS, inputBase, inputStyle, getNextItemId } from "./mockData";

export default function CustomItemInputPanel({
  activeTab,
  updateActiveTab,
  editingItemId,
  setEditingItemId,
  formik,
}) {
  const [newItem, setNewItem] = useState({
    productName: "",
    woodType: "",
    length: "",
    width: "",
    height: "",
    color: "",
    expectedPrice: "",
    quantity: 1,
    note: "",
    images: [],
  });

  const [showWoodDropdown, setShowWoodDropdown] = useState(false);
  const [showColorDropdown, setShowColorDropdown] = useState(false);

  // Load editing item into form
  useEffect(() => {
    if (editingItemId) {
      const item = activeTab.cartItems.find((i) => i.id === editingItemId);
      if (item) {
        setNewItem({ ...item });
      }
    } else {
      resetForm();
    }
  }, [editingItemId]);

  const updateNewItem = (field, value) =>
    setNewItem((prev) => ({ ...prev, [field]: value }));

  // Auto-suggest deposit when price is entered (for the first item or when deposit is 0)
  useEffect(() => {
    if (newItem.expectedPrice > 0 && formik.values.depositAmount === 0) {
      const suggested = Math.round((newItem.expectedPrice * newItem.quantity * 0.5) / 10000) * 10000;
      formik.setFieldValue("depositAmount", suggested);
    }
  }, [newItem.expectedPrice, newItem.quantity]);

  const resetForm = () => {
    setNewItem({
      productName: "",
      woodType: "",
      length: "",
      width: "",
      height: "",
      color: "",
      expectedPrice: "",
      quantity: 1,
      note: "",
      images: [],
    });
    setEditingItemId(null);
  };

  const saveItem = () => {
    if (!newItem.productName.trim()) return;

    const sizeStr = [
      newItem.length ? `D${newItem.length}` : "",
      newItem.width ? `R${newItem.width}` : "",
      newItem.height ? `C${newItem.height}` : "",
    ]
      .filter(Boolean)
      .join(" ");

    const itemToSave = { ...newItem, size: sizeStr };

    if (editingItemId) {
      formik.setFieldValue(
        "cartItems",
        formik.values.cartItems.map((i) =>
          i.id === editingItemId ? { ...itemToSave, id: editingItemId } : i
        )
      );
    } else {
      formik.setFieldValue("cartItems", [
        ...formik.values.cartItems,
        { id: getNextItemId(), ...itemToSave },
      ]);
    }
    resetForm();
  };

  return (
    <div
      className="flex flex-col w-[44%] bg-white rounded-lg overflow-hidden shadow-sm"
      style={{ border: "1px solid var(--grid-border)" }}
    >
      {/* ── Header ── */}
      <div className="flex flex-col gap-2 px-3 pt-3 pb-2 border-b" style={{ borderColor: "var(--grid-border)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div>
              <h2 className="text-[15px] font-bold text-gray-900 leading-tight">
                {editingItemId ? "Sửa sản phẩm" : "Tạo sản phẩm riêng"}
              </h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                Thiết kế theo yêu cầu khách hàng
              </p>
            </div>
          </div>
          {editingItemId && (
            <button onClick={resetForm} className="text-xs font-semibold text-red-500 hover:underline cursor-pointer">
              Hủy sửa
            </button>
          )}
        </div>

        {/* Mode Toggle Tabs (Exactly matched with InStock ProductPanel) */}
        <div
          className="flex-1 flex rounded-lg overflow-hidden"
          style={{
            border: "1px solid var(--grid-border)",
            backgroundColor: "var(--bg-main)",
          }}
        >
          <button
            type="button"
            onClick={() => formik.setFieldValue("mode", "REQUIREMENT")}
            className="flex-1 py-2.5 text-[13px] font-semibold transition-all cursor-pointer whitespace-nowrap"
            style={{
              backgroundColor: formik.values.mode !== "DIRECT_ORDER" ? "var(--brand-primary)" : "transparent",
              color: formik.values.mode !== "DIRECT_ORDER" ? "#fff" : "var(--text-secondary)",
            }}
          >
            Ghi nhận yêu cầu
          </button>
          <button
            type="button"
            onClick={() => formik.setFieldValue("mode", "DIRECT_ORDER")}
            className="flex-1 py-2.5 text-[13px] font-semibold transition-all cursor-pointer whitespace-nowrap"
            style={{
              backgroundColor: formik.values.mode === "DIRECT_ORDER" ? "var(--brand-primary)" : "transparent",
              color: formik.values.mode === "DIRECT_ORDER" ? "#fff" : "var(--text-secondary)",
            }}
          >
            Tạo đơn ngay
          </button>
        </div>
      </div>

      {/* ── Form Content ── */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">

        {/* Section: Basic Info */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1 flex items-center gap-2">
              <Type size={12} /> Tên sản phẩm <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="VD: Bàn ăn gỗ Sồi..."
              value={newItem.productName}
              onChange={(e) => updateNewItem("productName", e.target.value)}
                  className={`${inputBase} !py-2`}
                  style={inputStyle}
                />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1 flex items-center gap-2">
                <TreePine size={12} /> Chất liệu
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Chọn gỗ..."
                  value={newItem.woodType}
                  onFocus={() => setShowWoodDropdown(true)}
                  onBlur={() => setTimeout(() => setShowWoodDropdown(false), 200)}
                  onChange={(e) => { updateNewItem("woodType", e.target.value); setShowWoodDropdown(true); }}
                  className={`${inputBase} !py-2`}
                  style={inputStyle}
                />
                {showWoodDropdown && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border rounded-lg shadow-xl z-50 max-h-40 overflow-y-auto border-[var(--grid-border)]">
                    {WOOD_TYPES.filter(w => w.toLowerCase().includes(newItem.woodType.toLowerCase())).map(w => (
                      <div key={w} onMouseDown={() => updateNewItem("woodType", w)} className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer">{w}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1 flex items-center gap-2">
                <Palette size={12} /> Màu sắc
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Chọn màu..."
                  value={newItem.color}
                  onFocus={() => setShowColorDropdown(true)}
                  onBlur={() => setTimeout(() => setShowColorDropdown(false), 200)}
                  onChange={(e) => { updateNewItem("color", e.target.value); setShowColorDropdown(true); }}
                  className={`${inputBase} !py-2`}
                  style={inputStyle}
                />
                {showColorDropdown && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border rounded-lg shadow-xl z-50 max-h-40 overflow-y-auto border-[var(--grid-border)]">
                    {COLORS.filter(c => c.toLowerCase().includes(newItem.color.toLowerCase())).map(c => (
                      <div key={c} onMouseDown={() => updateNewItem("color", c)} className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer">{c}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section: Specs */}
        <div className="p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--grid-border)] space-y-3">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Thông số kỹ thuật</p>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Dài", field: "length" },
              { label: "Rộng", field: "width" },
              { label: "Cao", field: "height" },
            ].map((dim) => (
              <div key={dim.field} className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1 flex items-center gap-1">
                  <Ruler size={10} /> {dim.label} (cm)
                </label>
                <input
                  type="number"
                  value={newItem[dim.field]}
                  onChange={(e) => updateNewItem(dim.field, e.target.value)}
                  className={`${inputBase} text-center bg-white !py-2`}
                  style={{ ...inputStyle, padding: "8px", backgroundColor: "white" }}
                />
              </div>
            ))}
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1 flex items-center gap-2">
              <ClipboardEdit size={12} /> Ghi chú chi tiết
            </label>
            <textarea
              placeholder="Yêu cầu riêng về mẫu mã, phụ kiện..."
              value={newItem.note}
              onChange={(e) => updateNewItem("note", e.target.value)}
              className={`${inputBase} min-h-[60px] resize-none bg-white !py-2`}
              style={{ ...inputStyle, backgroundColor: "white" }}
            />
          </div>
        </div>

        {/* Section: Price & Deposit */}
        <div className="space-y-3">
          <div className={`grid ${formik.values.mode === "DIRECT_ORDER" ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1 flex items-center gap-2">
                <PackageCheck size={12} /> Số lượng
              </label>
              <div className="flex items-center h-[38px] rounded-lg border overflow-hidden" style={{ borderColor: "var(--grid-border)", backgroundColor: "var(--bg-main)" }}>
                <button onClick={() => {
                  const newQty = Math.max(1, newItem.quantity - 1);
                  updateNewItem("quantity", newQty);
                  if (newItem.expectedPrice > 0) {
                    const suggested = Math.round((newItem.expectedPrice * newQty * 0.5) / 10000) * 10000;
                    formik.setFieldValue("depositAmount", suggested);
                  }
                }} className="w-12 h-full flex items-center justify-center hover:bg-gray-50 border-r" style={{ borderColor: "var(--grid-border)" }}><Minus size={14} /></button>
                <input type="number" value={newItem.quantity} onChange={(e) => {
                  const newQty = parseInt(e.target.value) || 1;
                  updateNewItem("quantity", newQty);
                  if (newItem.expectedPrice > 0) {
                    const suggested = Math.round((newItem.expectedPrice * newQty * 0.5) / 10000) * 10000;
                    formik.setFieldValue("depositAmount", suggested);
                  }
                }} className="flex-1 text-center font-bold focus:outline-none bg-transparent" />
                <button onClick={() => {
                  const newQty = newItem.quantity + 1;
                  updateNewItem("quantity", newQty);
                  if (newItem.expectedPrice > 0) {
                    const suggested = Math.round((newItem.expectedPrice * newQty * 0.5) / 10000) * 10000;
                    formik.setFieldValue("depositAmount", suggested);
                  }
                }} className="w-12 h-full flex items-center justify-center hover:bg-gray-50 border-l" style={{ borderColor: "var(--grid-border)" }}><Plus size={14} /></button>
              </div>
            </div>

            {formik.values.mode === "DIRECT_ORDER" && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1 flex items-center gap-2">
                  <CreditCard size={12} /> Đơn giá
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="VD: 5,000,000"
                    value={newItem.expectedPrice ? fmt(newItem.expectedPrice) : ""}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      const price = val ? Number(val) : 0;
                      updateNewItem("expectedPrice", price);
                      // Auto-sync deposit to 50%
                      const suggested = Math.round((price * newItem.quantity * 0.5) / 10000) * 10000;
                      formik.setFieldValue("depositAmount", suggested);
                    }}
                    className={`${inputBase} font-bold !py-2`}
                    style={inputStyle}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">đ</span>
                </div>
              </div>
            )}
          </div>

          {formik.values.mode === "DIRECT_ORDER" && newItem.expectedPrice > 0 && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1 flex items-center gap-2">
                <ShieldCheck size={12} className="text-orange-500" /> Tiền đặt cọc (50%)
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Số tiền cọc..."
                  value={fmt(formik.values.depositAmount)}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    formik.setFieldValue("depositAmount", Number(val));
                  }}
                  className={`${inputBase} font-bold text-orange-600 !py-2`}
                  style={{ ...inputStyle, borderColor: "var(--status-warning-border)", backgroundColor: "var(--status-warning-bg)" }}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">đ</span>
              </div>
            </div>
          )}
        </div>

        {/* Section: Photos */}
        <div className="space-y-3">
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1 flex items-center gap-2">
            <ImagePlus size={12} /> Hình ảnh mẫu
          </label>
          <div className="flex flex-wrap gap-2">
            {newItem.images.map((img, i) => (
              <div key={i} className="relative w-14 h-14 rounded-lg border border-gray-200 overflow-hidden group">
                <img src={img} className="w-full h-full object-cover" />
                <button onClick={() => updateNewItem("images", newItem.images.filter((_, idx) => idx !== i))} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white">
                  <X size={14} />
                </button>
              </div>
            ))}
            <label className="w-14 h-14 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-green-400 hover:bg-green-50 transition">
              <ImagePlus size={20} className="text-gray-300" />
              <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => {
                const files = Array.from(e.target.files || []);
                files.forEach(f => {
                  const reader = new FileReader();
                  reader.onload = (ev) => updateNewItem("images", [...newItem.images, ev.target.result]);
                  reader.readAsDataURL(f);
                });
                e.target.value = "";
              }} />
            </label>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-3 border-t bg-gray-50" style={{ borderColor: "var(--grid-border)" }}>
        <Button
          onClick={saveItem}
          disabled={!newItem.productName.trim()}
          className="w-full h-12 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-500/10"
        >
          {editingItemId ? <CheckCircle2 size={18} /> : <Plus size={18} />}
          {editingItemId ? "Cập nhật sản phẩm" : "Thêm vào danh sách"}
        </Button>
      </div>
    </div>
  );
}

