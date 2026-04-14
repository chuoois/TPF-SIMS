/**
 * Component CustomOrderInvoicePage
 * Custom wood product orders — made-to-order items
 *
 * Layout: 2-column — Product list (left) + Customer & Delivery info (right)
 * Features: Multi-tab orders, custom item form, delivery details, deposit
 *
 * Created By: DNC
 * Created Date: 25/02/2026
 */

import { useState, useCallback, useRef, useMemo } from "react";
import toast from "react-hot-toast";
import {
  X,
  Plus,
  Minus,
  Trash2,
  Pencil,
  MapPin,
  Phone,
  CalendarDays,
  Truck,
  Package,
  PackageCheck,
  Hammer,
  Palette,
  Ruler,
  TreePine,
  CheckCircle2,
  AlertCircle,
  User,
  UserPlus,
  Search,
  Receipt,
  FileText,
  CreditCard,
  ImagePlus,
  Lightbulb,
  Clock,
  ClipboardEdit,
  ShieldCheck,
  Eye,
  Info,
  Type,
  Star,
  Camera,
} from "lucide-react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import { Button } from "@/components/ui/button";
import AddCustomerModal from "@/pages/sales-page/components/AddCustomerModal";

// ===================== STATIC DATA =====================
const WOOD_TYPES = [
  "Gỗ sồi",
  "Gỗ óc chó",
  "Gỗ tần bì",
  "Gỗ cao su",
  "Gỗ thông",
  "Gỗ hương",
];

const COLORS = [
  "Tự nhiên",
  "Nâu đậm",
  "Nâu nhạt",
  "Đen",
  "Trắng ngà",
  "Ghi xám",
];

const MOCK_CUSTOMERS = [
  { id: 1, name: "Nguyễn Văn Hoàng", phone: "0901234567" },
  { id: 2, name: "Trần Thị Mai", phone: "0912345678" },
  { id: 3, name: "Lê Minh Tuấn", phone: "0923456789" },
  { id: 4, name: "Phạm Thị Lan", phone: "0934567890" },
  { id: 5, name: "Võ Đức Anh", phone: "0945678901" },
  { id: 6, name: "Đặng Thùy Linh", phone: "0956789012" },
  { id: 7, name: "Bùi Tuấn Anh", phone: "0967890123" },
  { id: 8, name: "Hoàng Nguyệt Ánh", phone: "0978901234" },
  { id: 9, name: "Đinh Quang Hiếu", phone: "0989012345" },
  { id: 10, name: "Vũ Phương Thảo", phone: "0990123456" },
];

// ===================== HELPERS =====================
const fmt = (v) => new Intl.NumberFormat("vi-VN").format(v);

const generateOrderCode = () => {
  const now = new Date();
  return `DH${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;
};

const formatDateTime = () => {
  return new Date().toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

let tabIdCounter = 1;
let itemIdCounter = 0;

const createEmptyTab = () => ({
  id: ++tabIdCounter,
  cartItems: [],
  orderNote: "",
  selectedCustomer: null,
  customerName: "",
  customerPhone: "",
  expectedQuote: "",
  deposit: "",
  deliveryInfo: {
    address: "",
    district: "",
    ward: "",
    shippingNote: "",
  },
});

// ===================== SHARED INPUT STYLE =====================
const inputBase =
  "w-full text-[13px] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all bg-white border border-gray-200 hover:border-gray-300";
const inputStyle = {
  color: "var(--text-main)",
};

// ===================== COMPONENT =====================
export default function CustomOrderRequirementsPage() {
  const [tabs, setTabs] = useState([createEmptyTab()]);
  const [activeTabId, setActiveTabId] = useState(tabs[0].id);
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const customerSearchRef = useRef(null);

  const customerResults = useMemo(() => {
    if (!customerSearch.trim()) return [];
    const q = customerSearch.toLowerCase();
    return MOCK_CUSTOMERS.filter(
      (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q),
    );
  }, [customerSearch]);

  const [showWoodDropdown, setShowWoodDropdown] = useState(false);
  const [showColorDropdown, setShowColorDropdown] = useState(false);

  const [newItem, setNewItem] = useState({
    productName: "",
    woodType: "",
    length: "",
    width: "",
    height: "",
    color: "",
    quantity: 1,
    note: "",
    images: [],
  });
  const [editingItemId, setEditingItemId] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);

  // Direct Order Conf Modal
  const [showDirectOrderModal, setShowDirectOrderModal] = useState(false);
  const [directOrderForm, setDirectOrderForm] = useState({
    finalPrice: "",
    finalDeposit: ""
  });

  const updateActiveTab = useCallback(
    (updates) => {
      setTabs((prev) =>
        prev.map((t) => (t.id === activeTabId ? { ...t, ...updates } : t)),
      );
    },
    [activeTabId],
  );


  const updateDelivery = (field, value) => {
    updateActiveTab({
      deliveryInfo: { ...activeTab.deliveryInfo, [field]: value },
    });
  };

  const updateNewItem = (field, value) =>
    setNewItem((prev) => ({ ...prev, [field]: value }));

  // Tab management
  const addTab = () => {
    const t = createEmptyTab();
    setTabs((p) => [...p, t]);
    setActiveTabId(t.id);
  };
  const closeTab = (tabId, e) => {
    e.stopPropagation();
    if (tabs.length <= 1) return;
    setTabs((prev) => {
      const filtered = prev.filter((t) => t.id !== tabId);
      if (activeTabId === tabId)
        setActiveTabId(filtered[filtered.length - 1].id);
      return filtered;
    });
  };

  // Cart
  const addCustomItem = () => {
    if (!newItem.productName.trim()) return;

    // Combine dimensions into a size string for display
    const sizeStr = [
      newItem.length ? `D${newItem.length}` : "",
      newItem.width ? `R${newItem.width}` : "",
      newItem.height ? `C${newItem.height}` : "",
    ]
      .filter(Boolean)
      .join(" ");

    const itemToSave = {
      ...newItem,
      size: sizeStr,
    };

    if (editingItemId) {
      updateActiveTab({
        cartItems: activeTab.cartItems.map((i) =>
          i.id === editingItemId ? { ...itemToSave, id: editingItemId } : i,
        ),
      });
      setEditingItemId(null);
    } else {
      updateActiveTab({
        cartItems: [
          ...activeTab.cartItems,
          {
            id: `custom-${++itemIdCounter}`,
            ...itemToSave,
          },
        ],
      });
    }

    setNewItem({
      productName: "",
      woodType: "",
      length: "",
      width: "",
      height: "",
      color: "",
      quantity: 1,
      note: "",
      images: [],
    });
    setShowAddForm(false);
  };

  const handleEditItem = (item) => {
    setNewItem({ ...item });
    setEditingItemId(item.id);
    setShowAddForm(true);
  };

  const updateQuantity = (id, delta) => {
    updateActiveTab({
      cartItems: activeTab.cartItems
        .map((i) =>
          i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i,
        )
        .filter((i) => i.quantity > 0),
    });
  };

  const removeFromCart = (id) =>
    updateActiveTab({
      cartItems: activeTab.cartItems.filter((i) => i.id !== id),
    });

  const setQuantity = (id, qty) => {
    const val = parseInt(qty) || 0;
    if (val <= 0) return removeFromCart(id);
    updateActiveTab({
      cartItems: activeTab.cartItems.map((i) =>
        i.id === id ? { ...i, quantity: val } : i,
      ),
    });
  };


  // Checkout
  const itemCount = activeTab.cartItems.reduce((sum, i) => sum + i.quantity, 0);

  const handleCreateOrder = (isDirect = false) => {
    if (activeTab.cartItems.length === 0) return;
    if (!activeTab.customerName.trim()) {
      toast.error("Vui lòng nhập tên khách hàng");
      return;
    }
    if (!activeTab.customerPhone.trim()) {
      toast.error("Vui lòng nhập số điện thoại");
      return;
    }
    
    if (isDirect) {
      setDirectOrderForm({
        finalPrice: activeTab.expectedQuote || "",
        finalDeposit: activeTab.deposit || ""
      });
      setShowDirectOrderModal(true);
    } else {
      toast.success(
        `Gửi yêu cầu thiết kế ${generateOrderCode()} cho xưởng thành công!`,
      );
      if (tabs.length <= 1) {
        updateActiveTab(createEmptyTab());
      } else {
        closeTab(activeTabId, { stopPropagation: () => {} });
      }
    }
  };

  const handleConfirmDirectOrder = () => {
    if (!directOrderForm.finalPrice) {
      toast.error("Vui lòng nhập giá trị đơn hàng chính thức!");
      return;
    }
    
    toast.success(
      `Tạo đơn hàng trực tiếp ${generateOrderCode()} thành công!`,
    );

    setShowDirectOrderModal(false);

    if (tabs.length <= 1) {
      updateActiveTab(createEmptyTab());
    } else {
      closeTab(activeTabId, { stopPropagation: () => {} });
    }
  };

  // ===================== RENDER =====================
  return (
    <>
      <PageHelmet title="Yêu cầu đặt riêng - TPF-SIMS" />


      <div
        className="flex h-full gap-4 -m-4 p-4"
        style={{ backgroundColor: "var(--bg-main)" }}
      >
        {/* ═══════════════ LEFT — ORDER ITEMS ═══════════════ */}
        <div
          className="flex flex-col w-[56%] bg-white rounded-lg overflow-hidden border border-slate-200"
        >
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

            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-3.5 h-9 rounded-lg text-[12px] font-black tracking-wider transition-all cursor-pointer uppercase border border-[var(--brand-primary)]/20 hover:bg-[var(--brand-primary)]/5 active:scale-95"
              style={{
                backgroundColor: "var(--brand-primary)",
                color: "white",
              }}
            >
              <Plus size={14} strokeWidth={3} /> Thêm sản phẩm
            </button>
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
                    <span
                      className={`text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none transition-colors ${
                        isActive ? "bg-[var(--brand-primary)] text-white" : "bg-slate-200 text-slate-500"
                      }`}
                    >
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
              style={{
                borderColor: "var(--grid-border)",
                backgroundColor: "var(--grid-header-bg)",
              }}
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
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingItemId(null);
                    setNewItem({
                      productName: "",
                      woodType: "",
                      length: "",
                      width: "",
                      height: "",
                      color: "",
                      quantity: 1,
                      note: "",
                      images: [],
                    });
                  }}
                  className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white active:scale-95 transition-all cursor-pointer text-slate-300 hover:text-slate-600 border border-transparent hover:border-slate-100"
                >
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
                      <TreePine size={12} className="text-slate-400" /> Loại hàng/Chất liệu
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Chọn hoặc nhập..."
                        value={newItem.woodType}
                        onChange={(e) => {
                          updateNewItem("woodType", e.target.value);
                          setShowWoodDropdown(true);
                        }}
                        onFocus={() => setShowWoodDropdown(true)}
                        onBlur={() => setTimeout(() => setShowWoodDropdown(false), 200)}
                        className={inputBase}
                        style={{ ...inputStyle, backgroundColor: "white" }}
                      />
                      {showWoodDropdown && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-white border rounded-lg shadow-xl z-50 overflow-hidden border-slate-100 ring-1 ring-black/5">
                          <div className="max-h-48 overflow-y-auto p-1">
                            {WOOD_TYPES.filter((w) => w.toLowerCase().includes(newItem.woodType.toLowerCase())).map((w) => (
                              <div
                                key={w}
                                className="px-3 py-2.5 text-[13px] cursor-pointer transition rounded-lg hover:bg-slate-50 font-bold text-slate-700"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  updateNewItem("woodType", w);
                                  setShowWoodDropdown(false);
                                }}
                              >
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
                        onChange={(e) => {
                          updateNewItem("color", e.target.value);
                          setShowColorDropdown(true);
                        }}
                        onFocus={() => setShowColorDropdown(true)}
                        onBlur={() => setTimeout(() => setShowColorDropdown(false), 200)}
                        className={inputBase}
                        style={{ ...inputStyle, backgroundColor: "white" }}
                      />
                      {showColorDropdown && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-white border rounded-lg shadow-xl z-50 overflow-hidden border-slate-100 ring-1 ring-black/5">
                          <div className="max-h-48 overflow-y-auto p-1">
                            {COLORS.filter((c) => c.toLowerCase().includes(newItem.color.toLowerCase())).map((c) => (
                              <div
                                key={c}
                                className="px-3 py-2.5 text-[13px] cursor-pointer transition rounded-lg hover:bg-slate-50 font-bold text-slate-700"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  updateNewItem("color", c);
                                  setShowColorDropdown(false);
                                }}
                              >
                                {c}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Row 3: Dimensions & Quantity */}
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: "Dài (cm)", field: "length", icon: Ruler },
                    { label: "Rộng (cm)", field: "width", icon: Ruler },
                    { label: "Cao (cm)", field: "height", icon: Ruler },
                    { label: "Số lượng", field: "quantity", icon: PackageCheck },
                  ].map((dim) => (
                    <div key={dim.field} className="space-y-1.5">
                      <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        <dim.icon size={11} /> {dim.label}
                      </label>
                      <input
                        type="number"
                        placeholder="0"
                        value={newItem[dim.field]}
                        onChange={(e) =>
                          updateNewItem(
                            dim.field,
                            e.target.value === "" ? "" : parseInt(e.target.value)
                          )
                        }
                        className={`${inputBase} text-center font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                        style={{ ...inputStyle, backgroundColor: "white", paddingLeft: 12 }}
                      />
                    </div>
                  ))}
                </div>

                {/* Row 4: Note */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">
                    <ClipboardEdit size={12} className="text-slate-400" /> Chi tiết về sản phẩm (Kỹ thuật/Ghi chú)
                  </label>
                  <textarea
                    placeholder="Mô tả kỹ hơn về mẫu mã, bản lề, bo góc, đục chạm..."
                    value={newItem.note}
                    onChange={(e) => updateNewItem("note", e.target.value)}
                    className={`${inputBase} resize-none min-h-[80px] leading-relaxed py-3`}
                    style={{ ...inputStyle, backgroundColor: "white" }}
                  />
                </div>

                {/* Images & Buttons Container */}
                <div className="flex items-end justify-between pt-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 px-3.5 h-9 rounded-lg text-[12px] font-black uppercase tracking-wider cursor-pointer transition-all bg-white border border-dashed border-slate-200 text-slate-500 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] hover:bg-white">
                        <ImagePlus size={16} /> Thêm ảnh mẫu
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            files.forEach((file) => {
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                setNewItem((prev) => ({
                                  ...prev,
                                  images: [...prev.images, ev.target.result],
                                }));
                              };
                              reader.readAsDataURL(file);
                            });
                            e.target.value = "";
                          }}
                        />
                      </label>
                      {newItem.images.length > 0 && (
                        <div className="flex -space-x-2">
                          {newItem.images.slice(0, 5).map((img, i) => (
                            <div key={i} className="relative group/img w-10 h-10 rounded-lg border-2 border-white shadow-sm overflow-hidden bg-slate-50">
                              <img src={img} alt="" className="w-full h-full object-cover" />
                              <button
                                onClick={() => setNewItem((prev) => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }))}
                                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition"
                              >
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
                    <button
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingItemId(null);
                        setNewItem({
                          productName: "",
                          woodType: "",
                           length: "",
                           width: "",
                           height: "",
                           color: "",
                           quantity: 1,
                           note: "",
                           images: [],
                         });
                       }}
                       className="px-4 h-9 rounded-lg text-[12px] font-black uppercase tracking-wider text-slate-400 hover:text-slate-600 transition-colors"
                     >
                       Hủy
                     </button>
                     <Button
                       onClick={addCustomItem}
                       disabled={!newItem.productName.trim()}
                       className="px-6 h-9 rounded-lg text-[13px] font-black uppercase tracking-wider hover:translate-y-[-1px] transition-all"
                       style={{ backgroundColor: "var(--brand-primary)", color: "white" }}
                     >
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
              <div
                className="flex flex-col items-center justify-center h-full gap-2 p-10 text-center"
              >
                <div
                  className="w-24 h-24 rounded-lg flex items-center justify-center bg-slate-50 text-slate-300"
                >
                  <Package size={42} strokeWidth={1} />
                </div>
                <div className="mt-4">
                    <p className="text-[16px] font-black text-slate-800">Danh sách trống</p>
                    <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mt-1">Chưa có yêu cầu đặt hàng riêng nào</p>
                </div>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="mt-6 flex items-center gap-2 px-6 h-9 rounded-lg text-[13px] font-black transition-all cursor-pointer bg-[var(--brand-primary)] text-white hover:scale-105 active:scale-95 uppercase tracking-wider"
                >
                  <Plus size={18} strokeWidth={3} /> Thêm ngay
                </button>
              </div>
            ) : (
              <div
                className="divide-y divide-slate-50"
              >
                {activeTab.cartItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="px-6 py-4 group hover:bg-slate-50/50 transition-all duration-300 relative border-l-4 border-transparent hover:border-[var(--brand-primary)]"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="text-[11px] font-black w-6 h-6 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center shrink-0 mt-1"
                      >
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
                        </div>

                        {item.images && item.images.length > 0 && (
                          <div className="flex gap-2 mt-3 overflow-hidden">
                            {item.images.slice(0, 4).map((img, i) => (
                              <img
                                key={i}
                                src={img}
                                alt=""
                                className="w-12 h-12 object-cover rounded-lg border border-slate-100 shadow-sm"
                              />
                            ))}
                            {item.images.length > 4 && (
                                <div className="w-12 h-12 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-center text-[10px] font-black text-slate-400">
                                    +{item.images.length - 4}
                                </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Right Group: Quantity + Actions */}
                      <div className="flex flex-col items-end gap-3 shrink-0">
                        {/* Quantity controls */}
                        <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-100">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer hover:bg-slate-50 text-slate-400 hover:text-rose-500"
                          >
                            <Minus size={12} strokeWidth={3} />
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => setQuantity(item.id, e.target.value)}
                            className="w-10 text-center text-[14px] font-black focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            style={{ color: "var(--text-main)" }}
                          />
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer hover:bg-slate-50 text-slate-400 hover:text-[var(--brand-primary)]"
                          >
                            <Plus size={12} strokeWidth={3} />
                          </button>
                        </div>

                        {/* Action Buttons: View, Edit, Delete grouped on Far Right as requested */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setViewingItem(item)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer bg-blue-50 text-blue-600 hover:bg-blue-100"
                            title="Xem chi tiết"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleEditItem(item)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer bg-slate-50 text-slate-600 hover:bg-slate-200"
                            title="Sửa"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer bg-rose-50 text-rose-600 hover:bg-rose-100"
                            title="Xóa khỏi danh sách"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => setShowAddForm(true)}
                  className="w-full py-5 flex items-center justify-center gap-2 text-[12px] font-black uppercase tracking-widest transition-all cursor-pointer bg-slate-50/30 hover:bg-slate-50 text-slate-400 hover:text-[var(--brand-primary)]"
                >
                  <Plus size={16} strokeWidth={3} /> Thêm sản phẩm khác
                </button>
              </div>
            )}
          </div>

          {/* Footer Area */}
          <div
            className="border-t bg-slate-50/50"
            style={{ borderColor: "var(--grid-border)" }}
          >
            {/* Note row */}
            <div
              className="flex items-center gap-3 px-5 py-3 border-b"
              style={{ borderColor: "var(--grid-border)" }}
            >
              <div className="w-8 h-8 rounded-lg bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-300">
                <Pencil size={14} />
              </div>
              <input
                type="text"
                placeholder="Ghi chú chung cho toàn bộ yêu cầu này..."
                value={activeTab.orderNote}
                onChange={(e) => updateActiveTab({ orderNote: e.target.value })}
                className="flex-1 text-[13px] font-bold focus:outline-none bg-transparent"
                style={{ color: "var(--text-main)" }}
              />
            </div>

            {/* Checkout bar */}
            <div
              className="flex items-center justify-between px-6 py-4"
            >
              <div className="flex flex-col">
                <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">
                  Tổng số lượng sản phẩm
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black text-slate-800 leading-none">{itemCount}</span>
                  <span className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Sản phẩm</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  className="h-11 px-6 text-[13px] font-black uppercase tracking-wider bg-white text-indigo-600 border border-indigo-200 rounded-lg transition-all duration-300 hover:bg-indigo-50 active:scale-95 cursor-pointer disabled:opacity-30 flex items-center gap-2"
                  disabled={activeTab.cartItems.length === 0}
                  onClick={() => handleCreateOrder(true)}
                >
                  <CheckCircle2 size={18} />
                  Tạo đơn trực tiếp
                </Button>
                <Button
                  className="h-11 px-6 text-[13px] font-black uppercase tracking-wider text-white rounded-lg transition-all duration-300 active:scale-95 cursor-pointer disabled:opacity-30"
                  style={{
                    backgroundColor: "var(--brand-primary)",
                  }}
                  disabled={activeTab.cartItems.length === 0}
                  onClick={() => handleCreateOrder()}
                >
                  Gửi cho chủ
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════ RIGHT — CUSTOMER & DELIVERY ═══════════════ */}
        <div
          className="flex flex-col w-[44%] bg-white rounded-lg overflow-hidden border border-slate-200"
        >
          {/* Order Info Header */}
          <div
            className="flex items-center justify-between px-5 py-4 border-b bg-[var(--grid-header-bg)]"
            style={{ borderColor: "var(--grid-border)" }}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white border border-slate-100 text-slate-400">
                <FileText size={16} />
              </div>
              <div>
                <span className="text-[14px] font-black text-slate-800 tracking-tight">
                  {generateOrderCode()}
                </span>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">
                  {formatDateTime()}
                </p>
              </div>
            </div>
            <div
              className="px-2.5 py-1 rounded-lg flex items-center gap-2 border"
              style={{
                backgroundColor: "var(--status-focus)",
                color: "var(--brand-primary)",
                borderColor: "var(--brand-primary)/20"
              }}
            >
              <Clock size={12} strokeWidth={3} className="animate-pulse" />
              <span className="text-[11px] font-black uppercase tracking-wider">Mới tạo</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {/* Customer Info Card */}
            <div className="p-5 border-b border-slate-50 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500">
                        <User size={12} strokeWidth={3} />
                    </div>
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                      Khách hàng <span className="text-rose-500">*</span>
                    </p>
                </div>

                {/* Customer Search Bar */}
                <div className="relative flex items-center gap-1.5 w-[65%]" ref={customerSearchRef}>
                  {activeTab.selectedCustomer ? (
                    <div className="flex items-center gap-2.5 px-3 py-2 flex-1 min-w-0 rounded-lg bg-indigo-50/50 border border-indigo-100 animate-in zoom-in-95">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shrink-0">
                        <User size={14} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-black text-indigo-900 truncate leading-tight">
                          {activeTab.selectedCustomer.name}
                        </p>
                        <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-tighter">
                          {activeTab.selectedCustomer.phone}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          updateActiveTab({ selectedCustomer: null, customerName: "", customerPhone: "" });
                          setCustomerSearch("");
                        }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white transition-all cursor-pointer text-indigo-400 hover:text-rose-500 border border-transparent hover:border-rose-100"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className={`flex items-center gap-1.5 px-3.5 flex-1 min-w-0 rounded-lg bg-white border transition-all ${
                        showCustomerDropdown ? "ring-4 ring-indigo-500/10 border-indigo-500/30" : "border-slate-200 hover:border-slate-300"
                      }`}>
                      <Search size={14} className="text-slate-400 shrink-0" />
                      <input
                        type="text"
                        placeholder="Tìm khách hàng..."
                        value={customerSearch}
                        onChange={(e) => {
                          setCustomerSearch(e.target.value);
                          setShowCustomerDropdown(true);
                        }}
                        onFocus={() => { if (customerSearch.trim()) setShowCustomerDropdown(true); }}
                        onBlur={() => { setTimeout(() => setShowCustomerDropdown(false), 200); }}
                        className="flex-1 text-[13px] py-2.5 focus:outline-none bg-transparent min-w-0 font-bold"
                        style={{ color: "var(--text-main)" }}
                      />
                      <button
                        onClick={() => setShowAddCustomer(true)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-all bg-indigo-50 text-indigo-600 hover:bg-indigo-100 shrink-0"
                        title="Thêm mới"
                      >
                        <UserPlus size={16} />
                      </button>
                    </div>
                  )}

                  {/* Customer search dropdown */}
                  {showCustomerDropdown && customerSearch.trim() && (
                    <div className="absolute right-0 top-full mt-2 w-full bg-white rounded-lg shadow-lg border border-slate-100 overflow-hidden z-[60] ring-1 ring-black/5 animate-in slide-in-from-top-2">
                      {customerResults.length > 0 ? (
                        <div className="max-h-[250px] overflow-y-auto p-1.5 custom-scrollbar">
                          {customerResults.map((c) => (
                            <button
                              key={c.id}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                updateActiveTab({ selectedCustomer: c, customerName: c.name, customerPhone: c.phone });
                                setCustomerSearch("");
                                setShowCustomerDropdown(false);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group"
                            >
                              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-[12px] font-black bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                                {c.name.charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-black text-slate-700 truncate">{c.name}</p>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{c.phone}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="px-5 py-6 text-center">
                          <p className="text-[13px] font-bold text-slate-400">Không tìm thấy kết quả</p>
                          <button
                            onMouseDown={(e) => { e.preventDefault(); setShowAddCustomer(true); setShowCustomerDropdown(false); }}
                            className="text-[12px] font-black mt-2 cursor-pointer text-indigo-600 hover:underline"
                          >
                            + Thêm khách mới
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tên hiển thị</label>
                  <div className="relative">
                    <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input
                      type="text"
                      placeholder="Tên khách hàng"
                      value={activeTab.customerName}
                      onChange={(e) => updateActiveTab({ customerName: e.target.value })}
                      className={`${inputBase} pl-10`}
                      style={{ ...inputStyle, backgroundColor: "white" }}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Liên hệ</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input
                      type="tel"
                      placeholder="Số điện thoại"
                      value={activeTab.customerPhone}
                      onChange={(e) => updateActiveTab({ customerPhone: e.target.value })}
                      className={`${inputBase} pl-10`}
                      style={{ ...inputStyle, backgroundColor: "white" }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Info Card */}
            <div className="p-5 border-b border-slate-50 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <CreditCard size={12} strokeWidth={3} />
                </div>
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                  Giá trị đơn hàng & Đặt cọc
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Giá trị đơn hàng</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="VD: 15,000,000"
                      value={activeTab.expectedQuote ? fmt(activeTab.expectedQuote) : ""}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        updateActiveTab({ expectedQuote: val ? Number(val) : "" });
                      }}
                      className={inputBase}
                      style={{ ...inputStyle, backgroundColor: "white" }}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-black text-slate-300">VND</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tiền cọc đã nhận</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="VD: 5,000,000"
                      value={activeTab.deposit ? fmt(activeTab.deposit) : ""}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        updateActiveTab({ deposit: val ? Number(val) : "" });
                      }}
                      className={inputBase}
                      style={{ ...inputStyle, backgroundColor: "white" }}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-black text-slate-300">VND</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Info Card */}
            <div className="p-5 border-b border-slate-50 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                  <Truck size={12} strokeWidth={3} />
                </div>
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                  Giao hàng
                </p>
              </div>
              <div className="space-y-4">
                <div className="relative">
                  <MapPin size={14} className="absolute left-3.5 top-4 text-slate-300" />
                  <textarea
                    placeholder="Địa chỉ giao hàng chi tiết..."
                    value={activeTab.deliveryInfo.address}
                    onChange={(e) => updateDelivery("address", e.target.value)}
                    className={`${inputBase} pl-10 py-3 resize-none min-h-[60px]`}
                    style={{ ...inputStyle, backgroundColor: "white" }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Quận/Huyện"
                      value={activeTab.deliveryInfo.district}
                      onChange={(e) => updateDelivery("district", e.target.value)}
                      className={inputBase}
                      style={{ ...inputStyle, backgroundColor: "white" }}
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Phường/Xã"
                      value={activeTab.deliveryInfo.ward}
                      onChange={(e) => updateDelivery("ward", e.target.value)}
                      className={inputBase}
                      style={{ ...inputStyle, backgroundColor: "white" }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Note Section */}
            <div className="p-5">
              <div className="p-4 rounded-lg bg-amber-50/50 border border-amber-100/50">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                    <Lightbulb size={16} />
                  </div>
                  <div>
                    <h5 className="text-[12px] font-black text-amber-800 uppercase tracking-tight">Lưu ý nghiệp vụ</h5>
                    <p className="text-[11px] font-bold text-amber-700/70 leading-relaxed mt-1 italic font-sans">
                      Dữ liệu chỉ lưu thông tin yêu cầu. Trạng thái "Mới tạo" dành cho Sales chuẩn bị thông tin trước khi đẩy xuống xưởng.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddCustomerModal
        isOpen={showAddCustomer}
        onClose={() => setShowAddCustomer(false)}
        onCustomerAdded={(customer) => {
          updateActiveTab({
            selectedCustomer: {
              name: customer.full_name,
              phone: customer.phone_number,
            },
            customerName: customer.full_name,
            customerPhone: customer.phone_number,
          });
        }}
      />

      {/* ── Custom Item Quick View Modal ── */}
      {viewingItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div
            className="bg-white rounded-lg w-full max-w-3xl overflow-hidden shadow-xl animate-in zoom-in-95 duration-500 border border-white"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-50 bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center">
                    <Hammer size={24} />
                </div>
                <div>
                    <h3 className="text-[18px] font-black text-slate-800 leading-none">Chi tiết sản phẩm đặt riêng</h3>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Thông số kỹ thuật & yêu cầu của khách</p>
                </div>
              </div>
              <button
                onClick={() => setViewingItem(null)}
                className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-white text-slate-300 hover:text-slate-900 transition-all cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 max-h-[80vh] overflow-y-auto custom-scrollbar space-y-8 font-sans">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Image Section */}
                <div className="w-full md:w-[45%] space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Hình ảnh mẫu</p>
                  {viewingItem.images && viewingItem.images.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {viewingItem.images.map((img, i) => (
                        <div key={i} className="aspect-square rounded-lg overflow-hidden border border-slate-100 relative group">
                          <img src={img} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="aspect-square rounded-lg bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 text-slate-300">
                      <Camera size={32} strokeWidth={1} />
                      <span className="text-[11px] font-black uppercase tracking-widest">Không có ảnh mẫu</span>
                    </div>
                  )}
                </div>

                {/* Specs Section */}
                <div className="w-full md:w-[55%] space-y-6 text-left">
                  <div className="space-y-2">
                    <h2 className="text-[26px] font-black text-slate-800 leading-tight">{viewingItem.productName}</h2>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-50 text-orange-600 border border-orange-100">
                        <Star size={12} fill="currentColor" />
                        <span className="text-[11px] font-black uppercase tracking-wider">Hàng thiết kế riêng</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 rounded-lg bg-white border border-slate-100 flex items-center justify-between group hover:border-[var(--brand-primary)] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                            <TreePine size={18} />
                        </div>
                        <span className="text-[13px] font-black text-slate-400 uppercase tracking-widest">Chất liệu</span>
                      </div>
                      <span className="text-[15px] font-black text-slate-700">{viewingItem.woodType || "—"}</span>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-white border border-slate-100 flex items-center justify-between group hover:border-[var(--brand-primary)] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                            <Palette size={18} />
                        </div>
                        <span className="text-[13px] font-black text-slate-400 uppercase tracking-widest">Màu sắc</span>
                      </div>
                      <span className="text-[15px] font-black text-slate-700">{viewingItem.color || "—"}</span>
                    </div>

                    <div className="p-4 rounded-lg bg-white border border-slate-100 flex items-center justify-between group hover:border-[var(--brand-primary)] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                            <Ruler size={18} />
                        </div>
                        <span className="text-[13px] font-black text-slate-400 uppercase tracking-widest">Kích thước</span>
                      </div>
                      <span className="text-[15px] font-black text-slate-700">{viewingItem.size || "—"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Note Section */}
              {viewingItem.note && (
                <div className="p-6 rounded-lg bg-slate-50 border border-slate-100 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <ClipboardEdit size={80} strokeWidth={1} />
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <ClipboardEdit size={18} />
                    </div>
                    <span className="text-[12px] font-black text-indigo-900 uppercase tracking-[0.2em]">Yêu cầu bổ sung kỹ thuật</span>
                  </div>
                  <p className="text-[14px] font-bold text-slate-600 leading-relaxed italic relative z-10 bg-white/50 p-4 rounded-lg">
                    "{viewingItem.note}"
                  </p>
                </div>
              )}
            </div>
            
            <div className="px-8 py-6 border-t border-slate-50 bg-slate-50/50 flex justify-end">
              <Button
                onClick={() => setViewingItem(null)}
                className="h-11 rounded-lg px-12 font-black uppercase tracking-wider text-white active:scale-95 transition-all"
                style={{ backgroundColor: "var(--brand-primary)" }}
              >
                Đã hiểu
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Direct Order Confirmation Modal ── */}
      {showDirectOrderModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-xl w-full max-w-md overflow-hidden shadow-xl animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <h3 className="text-[16px] font-black text-slate-800 leading-none">Xác nhận tạo đơn hàng</h3>
                  <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Tạo trực tiếp không qua chủ</p>
                </div>
              </div>
              <button
                onClick={() => setShowDirectOrderModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white text-slate-300 hover:text-slate-900 transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100/50 flex items-start gap-2.5">
                <Info size={16} className="text-blue-500 mt-0.5 shrink-0" />
                <p className="text-[12px] font-bold text-blue-800/80 leading-relaxed italic">
                  Vì bạn đang tạo đơn hàng trực tiếp, vui lòng xác nhận lại giá.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                    Giá trị đơn hàng <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="VD: 15,000,000"
                      value={directOrderForm.finalPrice ? fmt(directOrderForm.finalPrice) : ""}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setDirectOrderForm(p => ({ ...p, finalPrice: val ? Number(val) : "" }));
                      }}
                      className={`${inputBase} bg-white border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100/50 transition-all font-bold text-slate-800 h-12`}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-black text-slate-400">VND</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Đã thu tiền cọc</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="VD: 5,000,000"
                      value={directOrderForm.finalDeposit ? fmt(directOrderForm.finalDeposit) : ""}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setDirectOrderForm(p => ({ ...p, finalDeposit: val ? Number(val) : "" }));
                      }}
                      className={`${inputBase} bg-white border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100/50 transition-all font-bold text-slate-800 h-12`}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-black text-slate-400">VND</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
              <button
                onClick={() => setShowDirectOrderModal(false)}
                className="flex-1 h-11 rounded-lg font-black text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 transition-all text-[12px] uppercase tracking-wider cursor-pointer"
              >
                Trở lại
              </button>
              <button
                onClick={handleConfirmDirectOrder}
                className="flex-1 h-11 rounded-lg font-black text-white bg-emerald-500 hover:bg-emerald-600 border border-transparent transition-all text-[12px] uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-500/20"
              >
                Chốt Đơn Lập Tức
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
