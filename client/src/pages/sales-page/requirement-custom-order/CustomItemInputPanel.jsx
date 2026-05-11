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
  ClipboardEdit,
  ImagePlus,
} from "lucide-react";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { fmt } from "@/constants/orderConfig";
import productAttributeService from "@/services/productAttribute.service";
import { uploadMultipleImages } from "@/services/cloudinary.service";

const inputBase = "w-full text-[13px] rounded-lg px-4 py-3 focus:outline-none transition-all border";
const inputStyle = {
  color: "var(--text-main)",
  borderColor: "var(--grid-border)",
  backgroundColor: "var(--bg-main)",
};

// ===================== ITEM VALIDATION SCHEMA =====================
const itemSchema = Yup.object().shape({
  productName: Yup.string().trim().required("Tên sản phẩm không được để trống"),
  woodType: Yup.string().required("Vui lòng chọn hoặc nhập chất liệu"),
  quantity: Yup.number().min(1, "Số lượng phải ít nhất là 1").required(),
});

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

  const [errors, setErrors] = useState({});
  const [showWoodDropdown, setShowWoodDropdown] = useState(false);
  const [showColorDropdown, setShowColorDropdown] = useState(false);

  const [materialOptions, setMaterialOptions] = useState([]);
  const [colorOptions, setColorOptions] = useState([]);

  useEffect(() => {
    const fetchAttributes = async () => {
      try {
        const res = await productAttributeService.getAllAttributes();
        setMaterialOptions(res.materials?.map((m) => m.material_name) || []);
        setColorOptions(res.colors?.map((c) => c.color_name) || []);
      } catch (error) {
        console.error("Failed to fetch product attributes:", error);
      }
    };
    fetchAttributes();
  }, []);

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

  const updateNewItem = (field, value) => {
    setNewItem((prev) => ({ ...prev, [field]: value }));
    // Clear error when typing
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };


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
    setErrors({});
    setEditingItemId(null);
  };

  const saveItem = async () => {
    try {
      await itemSchema.validate(newItem, { abortEarly: false });

      // Sync material if new
      if (newItem.woodType && !materialOptions.some(m => m.toLowerCase() === newItem.woodType.toLowerCase())) {
        try {
          await productAttributeService.syncMaterial(newItem.woodType);
          setMaterialOptions(prev => [...prev, newItem.woodType]);
        } catch (e) {
          console.error("Failed to sync new material", e);
        }
      }

      // Sync color if new
      if (newItem.color && !colorOptions.some(c => c.toLowerCase() === newItem.color.toLowerCase())) {
        try {
          await productAttributeService.syncColor(newItem.color);
          setColorOptions(prev => [...prev, newItem.color]);
        } catch (e) {
          console.error("Failed to sync new color", e);
        }
      }

      const sizeObj = {
        unit: "cm",
        width: Number(newItem.width) || 0,
        height: Number(newItem.height) || 0,
        length: Number(newItem.length) || 0,
      };

      const itemToSave = { 
        ...newItem, 
        id: newItem.id || `custom-${Date.now()}`,
        item_size: sizeObj, 
        size: sizeObj 
      };

      if (editingItemId) {
        formik.setFieldValue(
          "cartItems",
          formik.values.cartItems.map((i) =>
            i.id === editingItemId ? { ...itemToSave, id: editingItemId } : i
          )
        );
        toast.success("Đã cập nhật sản phẩm");
      } else {
        formik.setFieldValue("cartItems", [
          ...formik.values.cartItems,
          { id: getNextItemId(), ...itemToSave },
        ]);
        toast.success("Đã thêm vào danh sách");
      }
      resetForm();
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const newErrors = {};
        err.inner.forEach((e) => {
          newErrors[e.path] = e.message;
        });
        setErrors(newErrors);
        toast.error(err.inner[0].message);
      }
    }
  };

  return (
    <div
      className="flex flex-col w-[44%] bg-white rounded-lg overflow-hidden border border-[var(--grid-border)]"
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
              className={`${inputBase} !py-2 ${errors.productName ? "border-red-500 bg-red-50" : ""}`}
              style={inputStyle}
            />
            {errors.productName && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.productName}</p>}
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
                  className={`${inputBase} !py-2 ${errors.woodType ? "border-red-500 bg-red-50" : ""}`}
                  style={inputStyle}
                />
                {errors.woodType && <p className="text-[10px] text-red-500 font-bold ml-1 mt-1">{errors.woodType}</p>}
                {showWoodDropdown && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border rounded-lg z-50 max-h-40 overflow-y-auto border-[var(--grid-border)]">
                    {materialOptions.filter(w => w.toLowerCase().includes(newItem.woodType.toLowerCase())).map(w => (
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
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border rounded-lg z-50 max-h-40 overflow-y-auto border-[var(--grid-border)]">
                    {colorOptions.filter(c => c.toLowerCase().includes(newItem.color.toLowerCase())).map(c => (
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
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1 flex items-center gap-1">
              <ClipboardEdit size={10} /> Ghi chú sản xuất (Yêu cầu riêng)
            </label>
            <textarea
              placeholder="Nhập các yêu cầu sản xuất đặc biệt khác..."
              value={newItem.note}
              onChange={(e) => updateNewItem("note", e.target.value)}
              className={`${inputBase} bg-white !py-2 min-h-[60px] resize-none`}
              style={{ ...inputStyle, backgroundColor: "white" }}
            />
          </div>
        </div>

        {/* Section: Price & Deposit */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1 flex items-center gap-2">
                <PackageCheck size={12} /> Số lượng
              </label>
              <div className="flex items-center h-[38px] rounded-lg border overflow-hidden" style={{ borderColor: "var(--grid-border)", backgroundColor: "var(--bg-main)" }}>
                <button onClick={() => {
                  const newQty = Math.max(1, newItem.quantity - 1);
                  updateNewItem("quantity", newQty);
                }} className="w-12 h-full flex items-center justify-center hover:bg-gray-50 border-r" style={{ borderColor: "var(--grid-border)" }}><Minus size={14} /></button>
                <input type="number" value={newItem.quantity} onChange={(e) => {
                  const newQty = parseInt(e.target.value) || 1;
                  updateNewItem("quantity", newQty);
                }} className="flex-1 text-center font-bold focus:outline-none bg-transparent" />
                <button onClick={() => {
                  const newQty = newItem.quantity + 1;
                  updateNewItem("quantity", newQty);
                }} className="w-12 h-full flex items-center justify-center hover:bg-gray-50 border-l" style={{ borderColor: "var(--grid-border)" }}><Plus size={14} /></button>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Photos */}
        <div className="space-y-3">
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1 flex items-center gap-2">
            <ImagePlus size={12} /> Hình ảnh mẫu
          </label>
          <div className="flex flex-wrap gap-2">
            {newItem.images.map((img, i) => (
              <div key={i} className="relative w-14 h-14 rounded-lg border border-gray-200 overflow-hidden group">
                <img src={typeof img === "string" ? img : URL.createObjectURL(img)} className="w-full h-full object-cover" />
                <button onClick={() => updateNewItem("images", newItem.images.filter((_, idx) => idx !== i))} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white">
                  <X size={14} />
                </button>
              </div>
            ))}
            <label className="w-14 h-14 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-green-400 hover:bg-green-50 transition">
              <ImagePlus size={20} className="text-gray-300" />
              <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => {
                const files = Array.from(e.target.files || []);
                if (files.length > 0) {
                  updateNewItem("images", [...newItem.images, ...files]);
                }
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
          className="w-full h-12 rounded-xl font-bold flex items-center justify-center gap-2 border border-green-200"
        >
          {editingItemId ? <CheckCircle2 size={18} /> : <Plus size={18} />}
          {editingItemId ? "Cập nhật sản phẩm" : "Thêm vào danh sách"}
        </Button>
      </div>
    </div>
  );
}

