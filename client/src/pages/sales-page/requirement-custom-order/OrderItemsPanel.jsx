/**
 * OrderItemsPanel — Left panel of CustomOrderRequirementsPage
 * Includes: Tab bar, Add item form, Cart items list, Footer
 */

import { useState } from "react";
import {
  X,
  Plus,
  Minus,
  Trash2,
  Pencil,
  Package,
  PackageCheck,
  Palette,
  Ruler,
  TreePine,
  CheckCircle2,
  Receipt,
  CreditCard,
  ImagePlus,
  ClipboardEdit,
  Eye,
  Type,
  Hammer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { fmt, WOOD_TYPES, COLORS, inputBase, inputStyle, getNextItemId } from "./mockData";

export default function OrderItemsPanel({
  tabs,
  activeTabId,
  activeTab,
  setActiveTabId,
  addTab,
  closeTab,
  updateActiveTab,
  updateQuantity,
  removeFromCart,
  setQuantity,
  handleEditItem,
  itemCount,
  computedTotal,
  handleCreateOrder,
  setViewingItem,
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const [showWoodDropdown, setShowWoodDropdown] = useState(false);
  const [showColorDropdown, setShowColorDropdown] = useState(false);
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

  const updateNewItem = (field, value) =>
    setNewItem((prev) => ({ ...prev, [field]: value }));

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
    setShowAddForm(false);
    setEditingItemId(null);
  };

  const addCustomItem = () => {
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
      updateActiveTab({
        cartItems: activeTab.cartItems.map((i) =>
          i.id === editingItemId ? { ...itemToSave, id: editingItemId } : i,
        ),
      });
    } else {
      updateActiveTab({
        cartItems: [
          ...activeTab.cartItems,
          { id: getNextItemId(), ...itemToSave },
        ],
      });
    }
    resetForm();
  };

  const onEditItem = (item) => {
    setNewItem({ ...item });
    setEditingItemId(item.id);
    setShowAddForm(true);
  };

  return (
    <div className="flex flex-col w-[56%] bg-white rounded-lg overflow-hidden border border-slate-200">
      {/* Enhanced Tab Bar Header */}
      <div
        className="flex items-center justify-between px-5 py-3.5 border-b"
        style={{ borderColor: "var(--grid-border)", backgroundColor: "var(--grid-header-bg)" }}
      >
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]">
            <Receipt size={18} />
          </div>
          <div>
            <h1 className="text-[15px] font-black text-slate-800 uppercase tracking-tight">Yêu cầu đặt mới</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{tabs.length} Phiếu đang mở</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-3.5 h-9 rounded-lg text-[12px] font-black tracking-wider transition-all cursor-pointer uppercase border border-[var(--brand-primary)]/20 hover:bg-[var(--brand-primary)]/5 active:scale-95 shadow-md shadow-emerald-500/10"
            style={{ backgroundColor: "var(--brand-primary)", color: "white" }}
          >
            <Plus size={14} strokeWidth={3} /> Thêm sản phẩm
          </button>
        </div>
      </div>

      {/* Sub-Tabs Navigation */}
      <div
        className="flex items-center gap-1.5 px-4 py-2 border-b bg-white"
        style={{ borderColor: "var(--grid-border)" }}
      >
        {tabs.map((tab, idx) => {
          const isActive = tab.id === activeTabId;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-[13px] whitespace-nowrap transition-all shrink-0 cursor-pointer border ${
                isActive ? "font-bold" : "border-transparent text-slate-400 hover:bg-slate-50"
              }`}
              style={isActive ? {
                backgroundColor: "var(--status-focus)",
                color: "var(--brand-primary)",
                borderColor: "var(--brand-primary)/20"
              } : {}}
            >
              <Receipt size={14} className={isActive ? "text-[var(--brand-primary)]" : "text-slate-300"} />
              <span>Phiếu {idx + 1}</span>
              {tab.cartItems.length > 0 && (
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none transition-colors ${
                  isActive ? "bg-[var(--brand-primary)] text-white" : "bg-slate-200 text-slate-500"
                }`}>
                  {tab.cartItems.length}
                </span>
              )}
              {tabs.length > 1 && (
                <X
                  size={14}
                  className={`ml-1 cursor-pointer transition-colors ${isActive ? "text-[var(--brand-primary)]/50 hover:text-[var(--brand-primary)]" : "text-slate-300 hover:text-slate-500"}`}
                  onClick={(e) => closeTab(tab.id, e)}
                />
              )}
            </button>
          );
        })}
        <button
          onClick={addTab}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition shrink-0 cursor-pointer hover:bg-slate-50 text-slate-400 border border-transparent hover:border-slate-100"
          title="Thêm yêu cầu mới"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Add Item Form */}
      {showAddForm && (
        <div
          className="border-b p-5 space-y-4 animate-in slide-in-from-top duration-300"
          style={{ borderColor: "var(--grid-border)", backgroundColor: "var(--grid-header-bg)" }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center">
                <Package size={20} />
              </div>
              <div>
                <h4 className="text-[15px] font-black text-slate-800">
                  {editingItemId ? "Cập nhật sản phẩm" : "Thêm yêu cầu mới"}
                </h4>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Mô tả sản phẩm khách đặt riêng</p>
              </div>
            </div>
            <button onClick={resetForm} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white active:scale-95 transition-all cursor-pointer text-slate-300 hover:text-slate-600 border border-transparent hover:border-slate-100">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            {/* Row 1: Product Name */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">
                <Type size={12} className="text-slate-400" /> Tên sản phẩm <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="VD: Bàn ăn gỗ Sồi chân tròn..."
                value={newItem.productName}
                onChange={(e) => updateNewItem("productName", e.target.value)}
                className={inputBase}
                style={{ ...inputStyle, backgroundColor: "white" }}
              />
            </div>

            {/* Row 2: Wood & Color */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">
                  <TreePine size={12} className="text-slate-400" /> Chất liệu
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Chọn hoặc nhập..."
                    value={newItem.woodType}
                    onChange={(e) => { updateNewItem("woodType", e.target.value); setShowWoodDropdown(true); }}
                    onFocus={() => setShowWoodDropdown(true)}
                    onBlur={() => setTimeout(() => setShowWoodDropdown(false), 200)}
                    className={inputBase}
                    style={{ ...inputStyle, backgroundColor: "white" }}
                  />
                  {showWoodDropdown && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border rounded-lg shadow-xl z-50 overflow-hidden border-slate-100 ring-1 ring-black/5">
                      <div className="max-h-48 overflow-y-auto p-1">
                        {WOOD_TYPES.filter((w) => w.toLowerCase().includes(newItem.woodType.toLowerCase())).map((w) => (
                          <div key={w} className="px-3 py-2.5 text-[13px] cursor-pointer transition rounded-lg hover:bg-slate-50 font-bold text-slate-700"
                            onMouseDown={(e) => { e.preventDefault(); updateNewItem("woodType", w); setShowWoodDropdown(false); }}>
                            {w}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">
                  <Palette size={12} className="text-slate-400" /> Màu sắc hoàn thiện
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Chọn hoặc nhập..."
                    value={newItem.color}
                    onChange={(e) => { updateNewItem("color", e.target.value); setShowColorDropdown(true); }}
                    onFocus={() => setShowColorDropdown(true)}
                    onBlur={() => setTimeout(() => setShowColorDropdown(false), 200)}
                    className={inputBase}
                    style={{ ...inputStyle, backgroundColor: "white" }}
                  />
                  {showColorDropdown && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border rounded-lg shadow-xl z-50 overflow-hidden border-slate-100 ring-1 ring-black/5">
                      <div className="max-h-48 overflow-y-auto p-1">
                        {COLORS.filter((c) => c.toLowerCase().includes(newItem.color.toLowerCase())).map((c) => (
                          <div key={c} className="px-3 py-2.5 text-[13px] cursor-pointer transition rounded-lg hover:bg-slate-50 font-bold text-slate-700"
                            onMouseDown={(e) => { e.preventDefault(); updateNewItem("color", c); setShowColorDropdown(false); }}>
                            {c}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Row 3: Dimensions */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Dài (cm)", field: "length", icon: Ruler },
                { label: "Rộng (cm)", field: "width", icon: Ruler },
                { label: "Cao (cm)", field: "height", icon: Ruler },
              ].map((dim) => (
                <div key={dim.field} className="space-y-1.5">
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    <dim.icon size={11} /> {dim.label}
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={newItem[dim.field]}
                    onChange={(e) => updateNewItem(dim.field, e.target.value === "" ? "" : parseInt(e.target.value))}
                    className={`${inputBase} text-center font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                    style={{ ...inputStyle, backgroundColor: "white", paddingLeft: 12 }}
                  />
                </div>
              ))}
            </div>

            {/* Row 4: Quantity & Expected Price */}
            <div className={`grid ${activeTab.mode === "DIRECT_ORDER" ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  <PackageCheck size={11} /> Số lượng <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center h-[46px] bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-gray-300 transition-all">
                  <button onClick={() => updateNewItem("quantity", Math.max(1, (newItem.quantity || 1) - 1))} className="w-12 h-full flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-[var(--brand-primary)] transition-colors">
                    <Minus size={14} strokeWidth={3} />
                  </button>
                  <input type="number" value={newItem.quantity} onChange={(e) => updateNewItem("quantity", parseInt(e.target.value) || 1)}
                    className="flex-1 h-full text-center font-black focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    style={{ color: "var(--text-main)" }} />
                  <button onClick={() => updateNewItem("quantity", (newItem.quantity || 1) + 1)} className="w-12 h-full flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-[var(--brand-primary)] transition-colors">
                    <Plus size={14} strokeWidth={3} />
                  </button>
                </div>
              </div>
              {activeTab.mode === "DIRECT_ORDER" && (
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    <CreditCard size={11} /> Đơn giá
                  </label>
                  <div className="relative">
                    <input type="text" placeholder="VD: 5,000,000"
                      value={newItem.expectedPrice ? fmt(newItem.expectedPrice) : ""}
                      onChange={(e) => { const val = e.target.value.replace(/\D/g, ""); updateNewItem("expectedPrice", val ? Number(val) : ""); }}
                      className={`${inputBase} font-bold h-[46px]`} style={{ ...inputStyle, backgroundColor: "white" }} />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-black text-slate-300">VND</span>
                  </div>
                </div>
              )}
            </div>

            {/* Row 5: Note */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">
                <ClipboardEdit size={12} className="text-slate-400" /> Chi tiết về sản phẩm (Kỹ thuật/Ghi chú)
              </label>
              <textarea placeholder="Mô tả kỹ hơn về mẫu mã, bản lề, bo góc, đục chạm..."
                value={newItem.note} onChange={(e) => updateNewItem("note", e.target.value)}
                className={`${inputBase} resize-none min-h-[80px] leading-relaxed py-3`} style={{ ...inputStyle, backgroundColor: "white" }} />
            </div>

            {/* Images & Buttons Container */}
            <div className="flex items-end justify-between pt-2">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-3.5 h-9 rounded-lg text-[12px] font-black uppercase tracking-wider cursor-pointer transition-all bg-white border border-dashed border-slate-200 text-slate-500 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] hover:bg-white">
                    <ImagePlus size={16} /> Thêm ảnh mẫu
                    <input type="file" accept="image/*" multiple className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        files.forEach((file) => {
                          const reader = new FileReader();
                          reader.onload = (ev) => { setNewItem((prev) => ({ ...prev, images: [...prev.images, ev.target.result] })); };
                          reader.readAsDataURL(file);
                        });
                        e.target.value = "";
                      }} />
                  </label>
                  {newItem.images.length > 0 && (
                    <div className="flex -space-x-2">
                      {newItem.images.slice(0, 5).map((img, i) => (
                        <div key={i} className="relative group/img w-10 h-10 rounded-lg border-2 border-white shadow-sm overflow-hidden bg-slate-50">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                          <button onClick={() => setNewItem((prev) => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }))}
                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition">
                            <X size={14} className="text-white" />
                          </button>
                        </div>
                      ))}
                      {newItem.images.length > 5 && (
                        <div className="w-10 h-10 rounded-lg border-2 border-white shadow-sm bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500">
                          +{newItem.images.length - 5}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={resetForm} className="px-4 h-9 rounded-lg text-[12px] font-black uppercase tracking-wider text-slate-400 hover:text-slate-600 transition-colors">
                  Hủy
                </button>
                <Button onClick={addCustomItem} disabled={!newItem.productName.trim()}
                  className="px-6 h-9 rounded-lg text-[13px] font-black uppercase tracking-wider hover:translate-y-[-1px] transition-all"
                  style={{ backgroundColor: "var(--brand-primary)", color: "white" }}>
                  {editingItemId ? "Lưu thay đổi" : "Thêm vào danh sách"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeTab.cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 p-10 text-center">
            <div className="w-24 h-24 rounded-lg flex items-center justify-center bg-slate-50 text-slate-300">
              <Package size={42} strokeWidth={1} />
            </div>
            <div className="mt-4">
              <p className="text-[16px] font-black text-slate-800">Danh sách trống</p>
              <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mt-1">Chưa có yêu cầu đặt hàng riêng nào</p>
            </div>
            <button onClick={() => setShowAddForm(true)}
              className="mt-6 flex items-center gap-2 px-6 h-9 rounded-lg text-[13px] font-black transition-all cursor-pointer bg-[var(--brand-primary)] text-white hover:scale-105 active:scale-95 uppercase tracking-wider">
              <Plus size={18} strokeWidth={3} /> Thêm ngay
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {activeTab.cartItems.map((item, idx) => (
              <div key={item.id} className="px-6 py-4 group hover:bg-slate-50/50 transition-all duration-300 relative border-l-4 border-transparent hover:border-[var(--brand-primary)]">
                <div className="flex items-start gap-4">
                  <div className="text-[11px] font-black w-6 h-6 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center shrink-0 mt-1">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-[15px] font-black text-slate-800 truncate group-hover:text-[var(--brand-primary)] transition-colors">
                        {item.productName}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
                      {item.woodType && (
                        <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                          <TreePine size={10} className="text-amber-600" />
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">Chất liệu:</span>
                          <span className="text-[11px] font-bold text-slate-700">{item.woodType}</span>
                        </div>
                      )}
                      {item.color && (
                        <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                          <Palette size={10} className="text-purple-500" />
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">Màu sắc:</span>
                          <span className="text-[11px] font-bold text-slate-700">{item.color}</span>
                        </div>
                      )}
                      {item.size && (
                        <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                          <Ruler size={10} className="text-blue-500" />
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">Kích thước:</span>
                          <span className="text-[11px] font-bold text-slate-700">{item.size}</span>
                        </div>
                      )}
                      {activeTab.mode === "DIRECT_ORDER" && item.expectedPrice && (
                        <div className="flex items-center gap-1.5 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                          <CreditCard size={10} className="text-emerald-500" />
                          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tight">Đơn giá:</span>
                          <span className="text-[11px] font-bold text-emerald-700">{fmt(item.expectedPrice)} đ</span>
                        </div>
                      )}
                    </div>
                    {item.images && item.images.length > 0 && (
                      <div className="flex gap-2 mt-3 overflow-hidden">
                        {item.images.slice(0, 4).map((img, i) => (
                          <img key={i} src={img} alt="" className="w-12 h-12 object-cover rounded-lg border border-slate-100 shadow-sm" />
                        ))}
                        {item.images.length > 4 && (
                          <div className="w-12 h-12 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-center text-[10px] font-black text-slate-400">
                            +{item.images.length - 4}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Group */}
                  <div className="flex flex-col items-end gap-2.5 shrink-0">
                    {activeTab.mode === "DIRECT_ORDER" && item.expectedPrice && (
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex flex-col items-end mr-1">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Thành tiền</span>
                          <span className="text-[15px] font-black text-emerald-600 leading-none">{fmt(Number(item.expectedPrice) * item.quantity)}<span className="text-[11px] ml-1 text-emerald-500">đ</span></span>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setViewingItem(item)} className="w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer bg-blue-50 text-blue-600 hover:bg-blue-100" title="Xem chi tiết">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => onEditItem(item)} className="w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer bg-slate-50 text-slate-600 hover:bg-slate-200" title="Sửa">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => removeFromCart(item.id)} className="w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer bg-rose-50 text-rose-600 hover:bg-rose-100" title="Xóa khỏi danh sách">
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-100 hover:border-[var(--brand-primary)]/40 transition-colors">
                        <button onClick={() => updateQuantity(item.id, -1)} className="w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer hover:bg-slate-50 text-slate-400 hover:text-rose-500">
                          <Minus size={12} strokeWidth={3} />
                        </button>
                        <input type="number" value={item.quantity} onChange={(e) => setQuantity(item.id, e.target.value)}
                          className="w-8 text-center text-[13px] font-black focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          style={{ color: "var(--text-main)" }} />
                        <button onClick={() => updateQuantity(item.id, 1)} className="w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer hover:bg-slate-50 text-slate-400 hover:text-[var(--brand-primary)]">
                          <Plus size={12} strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <button onClick={() => setShowAddForm(true)}
              className="w-full py-5 flex items-center justify-center gap-2 text-[12px] font-black uppercase tracking-widest transition-all cursor-pointer bg-slate-50/30 hover:bg-slate-50 text-slate-400 hover:text-[var(--brand-primary)]">
              <Plus size={16} strokeWidth={3} /> Thêm sản phẩm khác
            </button>
          </div>
        )}
      </div>

      {/* Footer Area */}
      <div className="border-t bg-slate-50/50" style={{ borderColor: "var(--grid-border)" }}>
        <div className="flex items-center gap-3 px-5 py-3 border-b" style={{ borderColor: "var(--grid-border)" }}>
          <div className="w-8 h-8 rounded-lg bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-300">
            <Pencil size={14} />
          </div>
          <input type="text" placeholder="Ghi chú chung cho toàn bộ yêu cầu này..."
            value={activeTab.orderNote} onChange={(e) => updateActiveTab({ orderNote: e.target.value })}
            className="flex-1 text-[13px] font-bold focus:outline-none bg-transparent" style={{ color: "var(--text-main)" }} />
        </div>
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex flex-col">
            <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">Tổng số lượng sản phẩm</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-800 leading-none">{itemCount}</span>
              <span className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Sản phẩm</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {activeTab.mode === "DIRECT_ORDER" ? (
              <Button className="h-11 px-8 text-[13px] font-black uppercase tracking-wider text-white rounded-lg transition-all duration-300 active:scale-95 cursor-pointer disabled:opacity-30 flex items-center gap-2"
                style={{ backgroundColor: "var(--brand-primary)" }} disabled={activeTab.cartItems.length === 0} onClick={() => handleCreateOrder(true)}>
                <CheckCircle2 size={18} /> Tạo đơn hàng ngay
              </Button>
            ) : (
              <Button className="h-11 px-8 text-[13px] font-black uppercase tracking-wider text-white rounded-lg transition-all duration-300 active:scale-95 cursor-pointer disabled:opacity-30 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 border-none"
                disabled={activeTab.cartItems.length === 0} onClick={() => handleCreateOrder(false)}>
                <CheckCircle2 size={18} /> Lưu yêu cầu
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
