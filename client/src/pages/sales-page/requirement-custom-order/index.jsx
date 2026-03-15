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
  deliveryInfo: {
    address: "",
    district: "",
    ward: "",
    shippingNote: "",
  },
});

// ===================== SHARED INPUT STYLE =====================
const inputBase =
  "w-full text-[13px] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all bg-white border border-gray-200 hover:border-gray-300";
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
    size: "",
    color: "",
    quantity: 1,
    note: "",
    images: [],
  });
  const [editingItemId, setEditingItemId] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const updateActiveTab = useCallback(
    (updates) => {
      setTabs((prev) =>
        prev.map((t) => (t.id === activeTabId ? { ...t, ...updates } : t)),
      );
    },
    [activeTabId],
  );

  const showToast = (type, message) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ type, message });
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  };

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
    
    if (editingItemId) {
      updateActiveTab({
        cartItems: activeTab.cartItems.map((i) =>
          i.id === editingItemId ? { ...newItem, id: editingItemId } : i
        ),
      });
      setEditingItemId(null);
    } else {
      updateActiveTab({
        cartItems: [
          ...activeTab.cartItems,
          {
            id: `custom-${++itemIdCounter}`,
            ...newItem,
          },
        ],
      });
    }

    setNewItem({
      productName: "",
      woodType: "",
      size: "",
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

  const handleCreateOrder = () => {
    if (activeTab.cartItems.length === 0) return;
    if (!activeTab.customerName.trim()) {
      showToast("error", "Vui lòng nhập tên khách hàng");
      return;
    }
    if (!activeTab.customerPhone.trim()) {
      showToast("error", "Vui lòng nhập số điện thoại");
      return;
    }
    showToast(
      "success",
      `Tạo yêu cầu đặt hàng ${generateOrderCode()} thành công!`,
    );
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

      {/* Toast */}
      {toast && (
        <div
          className="fixed top-5 right-5 z-50 flex items-center gap-3 pl-4 pr-3 py-3 rounded-xl text-sm font-medium text-white animate-in slide-in-from-top-2"
          style={{
            backgroundColor:
              toast.type === "success"
                ? "var(--status-success)"
                : "var(--status-error)",
            boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
          }}
        >
          {toast.type === "success" ? (
            <CheckCircle2 size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          <span className="mr-1">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="opacity-60 hover:opacity-100 cursor-pointer p-0.5"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div
        className="flex h-full gap-4 -m-4 p-4"
        style={{ backgroundColor: "var(--bg-main)" }}
      >
        {/* ═══════════════ LEFT — ORDER ITEMS ═══════════════ */}
        <div
          className="flex flex-col w-[56%] bg-white rounded-2xl overflow-hidden"
          style={{
            boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
          }}
        >
          {/* Tab Bar */}
          <div
            className="flex items-center gap-1.5 px-4 py-2.5 border-b"
            style={{ borderColor: "var(--grid-border)" }}
          >
            {tabs.map((tab, idx) => (
              <button
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                  tab.id === activeTabId ? "font-semibold" : "hover:bg-gray-50"
                }`}
                style={{
                  backgroundColor:
                    tab.id === activeTabId
                      ? "var(--status-focus)"
                      : "transparent",
                  color:
                    tab.id === activeTabId
                      ? "var(--brand-primary)"
                      : "var(--text-secondary)",
                }}
              >
                <Receipt size={13} />
                <span>YC {idx + 1}</span>
                {tab.cartItems.length > 0 && (
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none"
                    style={{
                      backgroundColor:
                        tab.id === activeTabId
                          ? "var(--brand-primary)"
                          : "var(--grid-border)",
                      color:
                        tab.id === activeTabId
                          ? "#fff"
                          : "var(--text-secondary)",
                    }}
                  >
                    {tab.cartItems.length}
                  </span>
                )}
                {tabs.length > 1 && (
                  <X
                    size={12}
                    className="ml-0.5 cursor-pointer opacity-40 hover:opacity-100"
                    onClick={(e) => closeTab(tab.id, e)}
                  />
                )}
              </button>
            ))}
            <button
              onClick={addTab}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition shrink-0 cursor-pointer hover:bg-gray-50"
              style={{ color: "var(--text-placeholder)" }}
              title="Thêm yêu cầu mới"
            >
              <Plus size={14} />
            </button>

            {/* Add product pushed to right */}
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-[12px] font-bold transition-all shrink-0 ml-auto cursor-pointer shadow-sm hover:translate-y-[-1px] active:translate-y-[0px]"
              style={{
                backgroundColor: "var(--brand-primary)",
                color: "white",
              }}
            >
              <Plus size={14} /> Yêu cầu mới
            </button>
          </div>

          {/* Add Item Form */}
          {showAddForm && (
            <div
              className="border-b p-4 space-y-3 animate-in slide-in-from-top"
              style={{
                borderColor: "var(--grid-border)",
                backgroundColor: "var(--grid-header-bg)",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                    <Package size={16} className="text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-gray-900">
                      {editingItemId ? "Cập nhật sản phẩm" : "Thông tin sản phẩm"}
                    </h4>
                    <p className="text-[11px] text-gray-500">Mô tả chi tiết sản phẩm khách muốn đặt riêng</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingItemId(null);
                    setNewItem({
                      productName: "",
                      woodType: "",
                      size: "",
                      color: "",
                      quantity: 1,
                      note: "",
                      images: [],
                    });
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition cursor-pointer text-gray-400"
                >
                  <X size={18} />
                </button>
              </div>

              <input
                type="text"
                placeholder="Tên sản phẩm *"
                value={newItem.productName}
                onChange={(e) => updateNewItem("productName", e.target.value)}
                className={inputBase}
                style={inputStyle}
              />

              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <TreePine
                    size={13}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--text-placeholder)" }}
                  />
                  <input
                    type="text"
                    placeholder="Loại gỗ"
                    value={newItem.woodType}
                    onChange={(e) => {
                      updateNewItem("woodType", e.target.value);
                      setShowWoodDropdown(true);
                    }}
                    onFocus={() => setShowWoodDropdown(true)}
                    onBlur={() =>
                      setTimeout(() => setShowWoodDropdown(false), 200)
                    }
                    className={`${inputBase} pl-9`}
                    style={inputStyle}
                  />
                  {showWoodDropdown && (
                    <div
                      className="absolute left-0 right-0 top-full mt-1 bg-white border rounded-xl shadow-lg z-50 overflow-hidden"
                      style={{ borderColor: "var(--grid-border)" }}
                    >
                      <div className="max-h-48 overflow-y-auto">
                        {WOOD_TYPES.filter((w) =>
                          w
                            .toLowerCase()
                            .includes(newItem.woodType.toLowerCase()),
                        ).map((w) => (
                          <div
                            key={w}
                            className="px-3 py-2 text-[13px] cursor-pointer transition hover:bg-gray-50 font-medium"
                            style={{ color: "var(--text-main)" }}
                            onMouseDown={(e) => {
                              e.preventDefault(); // Ngăn focus bị mất khi chọn
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

                <div className="relative">
                  <Palette
                    size={13}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--text-placeholder)" }}
                  />
                  <input
                    type="text"
                    placeholder="Màu sắc"
                    value={newItem.color}
                    onChange={(e) => {
                      updateNewItem("color", e.target.value);
                      setShowColorDropdown(true);
                    }}
                    onFocus={() => setShowColorDropdown(true)}
                    onBlur={() =>
                      setTimeout(() => setShowColorDropdown(false), 200)
                    }
                    className={`${inputBase} pl-9`}
                    style={inputStyle}
                  />
                  {showColorDropdown && (
                    <div
                      className="absolute left-0 right-0 top-full mt-1 bg-white border rounded-xl shadow-lg z-50 overflow-hidden"
                      style={{ borderColor: "var(--grid-border)" }}
                    >
                      <div className="max-h-48 overflow-y-auto">
                        {COLORS.filter((c) =>
                          c.toLowerCase().includes(newItem.color.toLowerCase()),
                        ).map((c) => (
                          <div
                            key={c}
                            className="px-3 py-2 text-[13px] cursor-pointer transition hover:bg-gray-50 font-medium"
                            style={{ color: "var(--text-main)" }}
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

              <div className="relative">
                <Ruler
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-placeholder)" }}
                />
                <input
                  type="text"
                  placeholder="Kích thước yêu cầu (Ví dụ: D120 R60 C75 cm)"
                  value={newItem.size}
                  onChange={(e) => updateNewItem("size", e.target.value)}
                  className={`${inputBase} pl-9`}
                  style={inputStyle}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <Package
                    size={13}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--text-placeholder)" }}
                  />
                  <input
                    type="number"
                    placeholder="Số lượng"
                    value={newItem.quantity}
                    onChange={(e) =>
                      updateNewItem(
                        "quantity",
                        Math.max(1, parseInt(e.target.value) || 1),
                      )
                    }
                    className={`${inputBase} pl-9 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                    style={inputStyle}
                  />
                </div>
               
                <input
                  type="text"
                  placeholder="Ghi chú (sơn màu, chạm khắc, ...)"
                  value={newItem.note}
                  onChange={(e) => updateNewItem("note", e.target.value)}
                  className={inputBase}
                  style={inputStyle}
                />
              </div>

              {/* Image upload */}
              <div>
                <div className="flex items-center gap-3">
                  <label
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-medium cursor-pointer transition hover:bg-gray-100"
                    style={{
                      border: "1px dashed var(--grid-border)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    <ImagePlus
                      size={14}
                      style={{ color: "var(--brand-primary)" }}
                    />
                    Thêm ảnh mẫu
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
                    <span
                      className="text-[11px]"
                      style={{ color: "var(--text-placeholder)" }}
                    >
                      {newItem.images.length} ảnh
                    </span>
                  )}
                </div>
                {newItem.images.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {newItem.images.map((img, i) => (
                      <div key={i} className="relative group/img">
                        <img
                          src={img}
                          alt=""
                          className="w-16 h-16 object-cover rounded-lg"
                          style={{ border: "1px solid var(--grid-border)" }}
                        />
                        <button
                          onClick={() =>
                            setNewItem((prev) => ({
                              ...prev,
                              images: prev.images.filter((_, idx) => idx !== i),
                            }))
                          }
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition cursor-pointer"
                          style={{ fontSize: 10 }}
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingItemId(null);
                    setNewItem({
                      productName: "",
                      woodType: "",
                      size: "",
                      color: "",
                      quantity: 1,
                      note: "",
                      images: [],
                    });
                  }}
                  className="text-xs cursor-pointer rounded-lg"
                >
                  Hủy
                </Button>
                <Button
                  size="sm"
                  onClick={addCustomItem}
                  disabled={!newItem.productName.trim()}
                  className="text-xs font-bold text-white rounded-lg cursor-pointer"
                  style={{ backgroundColor: "var(--brand-primary)" }}
                >
                  {editingItemId ? (
                    <>
                      <Pencil size={13} className="mr-1" /> Lưu thay đổi
                    </>
                  ) : (
                    <>
                      <Plus size={13} className="mr-1" /> Tạo yêu cầu
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Cart Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab.cartItems.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center h-full gap-2"
                style={{ color: "var(--text-placeholder)" }}
              >
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center bg-gray-50 text-gray-300"
                >
                  <Package size={32} strokeWidth={1.5} />
                </div>
                <p className="text-sm font-bold text-gray-900 mt-2">
                  Chưa có sản phẩm
                </p>
                <p className="text-xs text-gray-400">
                  Nhấn "Yêu cầu mới" để thêm thông tin hàng đặt riêng
                </p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="mt-3 flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-[13px] font-bold transition-all cursor-pointer bg-green-50 text-green-600 hover:bg-green-100 shadow-sm"
                >
                  <Plus size={16} /> Thêm ngay
                </button>
              </div>
            ) : (
              <div
                className="divide-y"
                style={{ borderColor: "var(--grid-border)" }}
              >
                {activeTab.cartItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="px-4 py-3 group hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className="text-xs font-medium w-5 text-center shrink-0 mt-0.5"
                        style={{ color: "var(--text-placeholder)" }}
                      >
                        {idx + 1}
                      </span>

                      <div className="flex-1 min-w-0">
                        <p
                          className="text-[14px] font-bold"
                          style={{ color: "var(--text-main)" }}
                        >
                          {item.productName}
                        </p>
                        
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
                          {item.woodType && (
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-gray-400 w-14">Loại gỗ:</span>
                              <span className="text-[11px] font-medium text-gray-700">{item.woodType}</span>
                            </div>
                          )}
                          {item.color && (
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-gray-400 w-14">Màu sắc:</span>
                              <span className="text-[11px] font-medium text-gray-700">{item.color}</span>
                            </div>
                          )}
                          {item.size && (
                            <div className="flex items-center gap-2 col-span-2">
                              <span className="text-[11px] text-gray-400 w-14">Kích thước:</span>
                              <span className="text-[11px] font-medium text-gray-700">{item.size}</span>
                            </div>
                          )}
                        </div>

                        {item.note && (
                          <div
                            className="text-[11px] mt-2 flex items-start gap-1.5 p-2 rounded-lg bg-gray-50 border border-gray-100"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            <FileText size={12} className="shrink-0 mt-0.5 opacity-60" />
                            <span className="italic">{item.note}</span>
                          </div>
                        )}
                        {item.images && item.images.length > 0 && (
                          <div className="flex gap-1.5 mt-2">
                            {item.images.map((img, i) => (
                              <img
                                key={i}
                                src={img}
                                alt=""
                                className="w-10 h-10 object-cover rounded-md"
                                style={{
                                  border: "1px solid var(--grid-border)",
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Quantity */}
                      <div className="flex items-center gap-0.5 shrink-0">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition cursor-pointer hover:bg-gray-100"
                          style={{
                            border: "1px solid var(--grid-border)",
                            color: "var(--text-secondary)",
                          }}
                        >
                          <Minus size={11} />
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => setQuantity(item.id, e.target.value)}
                          className="w-10 h-7 text-center text-[13px] font-semibold rounded-lg focus:outline-none focus:ring-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          style={{
                            border: "1px solid var(--grid-border)",
                            color: "var(--text-main)",
                          }}
                        />
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition cursor-pointer hover:bg-gray-100"
                          style={{
                            border: "1px solid var(--grid-border)",
                            color: "var(--text-secondary)",
                          }}
                        >
                          <Plus size={11} />
                        </button>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0 mt-0.5 group-hover:flex hidden">
                        <button
                          onClick={() => handleEditItem(item)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition cursor-pointer hover:bg-indigo-50 hover:text-indigo-500"
                          style={{ color: "var(--text-placeholder)" }}
                          title="Sửa"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition cursor-pointer hover:bg-red-50 hover:text-red-500"
                          style={{ color: "var(--text-placeholder)" }}
                          title="Xóa"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => setShowAddForm(true)}
                  className="w-full py-3 flex items-center justify-center gap-2 text-[13px] font-medium transition cursor-pointer hover:bg-gray-50"
                  style={{ color: "var(--brand-primary)" }}
                >
                  <Plus size={14} /> Thêm sản phẩm đặt khác
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            className="border-t"
            style={{ borderColor: "var(--grid-border)" }}
          >
            {/* Note row */}
            <div
              className="flex items-center gap-2 px-4 py-2.5 border-b"
              style={{ borderColor: "var(--grid-border)" }}
            >
              <Pencil
                size={12}
                style={{ color: "var(--text-placeholder)" }}
                className="shrink-0"
              />
              <input
                type="text"
                placeholder="Ghi chú ..."
                value={activeTab.orderNote}
                onChange={(e) => updateActiveTab({ orderNote: e.target.value })}
                className="flex-1 text-[13px] focus:outline-none bg-transparent"
                style={{ color: "var(--text-secondary)" }}
              />
            </div>

            {/* Checkout bar */}
            <div
              className="flex items-center justify-between px-4 py-3 border-t"
              style={{ borderColor: "var(--grid-border)" }}
            >
              <div className="flex flex-col">
                <p className="text-[10px] uppercase tracking-[0.1em] font-bold text-gray-400">
                  Tổng sản phẩm
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-green-600 leading-none">{itemCount}</span>
                  <span className="text-[12px] font-bold text-gray-400 uppercase">Món</span>
                </div>
              </div>
              <Button
                className="h-12 px-10 text-[14px] font-black uppercase tracking-wider text-white rounded-xl transition-all duration-300 active:scale-[0.95] cursor-pointer disabled:opacity-30 flex items-center gap-2 group shadow-[0_8px_20px_-6px_rgba(34,197,94,0.4)] hover:shadow-[0_12px_25px_-4px_rgba(34,197,94,0.5)]"
                style={{
                  backgroundColor: "var(--brand-primary)",
                }}
                disabled={activeTab.cartItems.length === 0}
                onClick={handleCreateOrder}
              >
                Gửi yêu cầu ngay
                <CheckCircle2 size={18} className="transition-transform group-hover:scale-110" />
              </Button>
            </div>
          </div>
        </div>

        {/* ═══════════════ RIGHT — CUSTOMER & DELIVERY ═══════════════ */}
        <div
          className="flex flex-col w-[44%] bg-white rounded-2xl overflow-hidden"
          style={{
            boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
          }}
        >
          {/* Order Header */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b"
            style={{ borderColor: "var(--grid-border)" }}
          >
            <div className="flex items-center gap-3">
              <FileText
                size={14}
                style={{ color: "var(--text-placeholder)" }}
              />
              <span
                className="text-[13px] font-bold"
                style={{ color: "var(--text-main)" }}
              >
                {generateOrderCode()}
              </span>
              <span
                className="w-px h-4"
                style={{ backgroundColor: "var(--grid-border)" }}
              />
              <span
                className="text-[12px]"
                style={{ color: "var(--text-placeholder)" }}
              >
                {formatDateTime()}
              </span>
            </div>
            <span
              className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md flex items-center gap-1.5"
              style={{
                backgroundColor: "#FFF7ED",
                color: "var(--status-pending)",
              }}
            >
              <Clock size={11} strokeWidth={3} />
              Yêu cầu
            </span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Customer Info */}
            <div
              className="p-4 space-y-3 border-b relative"
              style={{ borderColor: "var(--grid-border)" }}
            >
              <div className="flex items-center justify-between">
                <p
                  className="text-[11px] font-bold uppercase tracking-wider"
                  style={{ color: "var(--text-placeholder)" }}
                >
                  Thông tin khách hàng{" "}
                  <span style={{ color: "var(--status-error)" }}>*</span>
                </p>

                {/* Customer Search Bar Identical to Instock */}
                <div
                  className="relative flex items-center gap-1.5 w-[50%]"
                  ref={customerSearchRef}
                >
                  {activeTab.selectedCustomer ? (
                    <div
                      className="flex items-center gap-2.5 px-3 py-2 flex-1 min-w-0 rounded-xl bg-green-50/50 border border-green-100"
                    >
                      <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                        <User size={14} className="text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold text-green-700 truncate leading-tight">
                          {activeTab.selectedCustomer.name}
                        </p>
                        <p className="text-[10px] text-green-600/70 font-medium">
                          {activeTab.selectedCustomer.phone}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          updateActiveTab({
                            selectedCustomer: null,
                            customerName: "",
                            customerPhone: "",
                          });
                          setCustomerSearch("");
                        }}
                        className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-green-100 transition cursor-pointer text-green-600"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div
                      className={`flex items-center gap-1.5 px-3 flex-1 min-w-0 rounded-xl bg-white border transition-all ${
                        showCustomerDropdown ? "ring-4 ring-green-500/10 border-green-500/30" : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Search
                        size={14}
                        className="text-gray-400 shrink-0"
                      />
                      <input
                        type="text"
                        placeholder="Tìm khách hàng..."
                        value={customerSearch}
                        onChange={(e) => {
                          setCustomerSearch(e.target.value);
                          setShowCustomerDropdown(true);
                        }}
                        onFocus={() => {
                          if (customerSearch.trim())
                            setShowCustomerDropdown(true);
                        }}
                        onBlur={() => {
                          setTimeout(() => setShowCustomerDropdown(false), 200);
                        }}
                        className="flex-1 text-[13px] py-2.5 focus:outline-none bg-transparent min-w-0"
                        style={{ color: "var(--text-main)" }}
                      />
                      <button
                        onClick={() => setShowAddCustomer(true)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition bg-green-50 text-green-600 hover:bg-green-100 shrink-0"
                        title="Thêm mới"
                      >
                        <UserPlus size={14} />
                      </button>
                    </div>
                  )}

                  {/* Customer search dropdown */}
                  {showCustomerDropdown && customerSearch.trim() && (
                    <div
                      className="absolute right-0 top-full mt-1 w-full bg-white rounded-xl shadow-lg border overflow-hidden z-30"
                      style={{ borderColor: "var(--grid-border)" }}
                    >
                      {customerResults.length > 0 ? (
                        <div className="max-h-[200px] overflow-y-auto">
                          {customerResults.map((c) => (
                            <button
                              key={c.id}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                updateActiveTab({
                                  selectedCustomer: c,
                                  customerName: c.name,
                                  customerPhone: c.phone,
                                });
                                setCustomerSearch("");
                                setShowCustomerDropdown(false);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                              <div
                                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold"
                                style={{
                                  backgroundColor: "var(--status-focus)",
                                  color: "var(--brand-primary)",
                                }}
                              >
                                {c.name.charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p
                                  className="text-[13px] font-semibold truncate"
                                  style={{ color: "var(--text-main)" }}
                                >
                                  {c.name}
                                </p>
                                <p
                                  className="text-[11px]"
                                  style={{ color: "var(--text-placeholder)" }}
                                >
                                  {c.phone}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="px-4 py-3 text-center">
                          <p
                            className="text-[13px]"
                            style={{ color: "var(--text-placeholder)" }}
                          >
                            Không tìm thấy khách hàng
                          </p>
                          <button
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setShowAddCustomer(true);
                              setShowCustomerDropdown(false);
                            }}
                            className="text-[12px] font-semibold mt-1 cursor-pointer"
                            style={{ color: "var(--brand-primary)" }}
                          >
                            + Thêm khách hàng mới
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="relative">
                  <User
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--text-placeholder)" }}
                  />
                  <input
                    type="text"
                    placeholder="Tên khách hàng"
                    value={activeTab.customerName}
                    onChange={(e) =>
                      updateActiveTab({ customerName: e.target.value })
                    }
                    className={`${inputBase} pl-10`}
                    style={inputStyle}
                  />
                </div>
                <div className="relative">
                  <Phone
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--text-placeholder)" }}
                  />
                  <input
                    type="tel"
                    placeholder="Số điện thoại"
                    value={activeTab.customerPhone}
                    onChange={(e) =>
                      updateActiveTab({ customerPhone: e.target.value })
                    }
                    className={`${inputBase} pl-10`}
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="p-4 space-y-4 border-b">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Truck size={12} className="text-blue-600" />
                </div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Thông tin giao hàng
                </p>
              </div>
              <div className="space-y-2.5">
                <div className="relative">
                  <MapPin
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--text-placeholder)" }}
                  />
                  <input
                    type="text"
                    placeholder="Địa chỉ giao hàng"
                    value={activeTab.deliveryInfo.address}
                    onChange={(e) => updateDelivery("address", e.target.value)}
                    className={`${inputBase} pl-10`}
                    style={inputStyle}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    placeholder="Quận/Huyện"
                    value={activeTab.deliveryInfo.district}
                    onChange={(e) => updateDelivery("district", e.target.value)}
                    className={inputBase}
                    style={inputStyle}
                  />
                  <input
                    type="text"
                    placeholder="Phường/Xã"
                    value={activeTab.deliveryInfo.ward}
                    onChange={(e) => updateDelivery("ward", e.target.value)}
                    className={inputBase}
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            {/* Tip box */}
            <div className="p-4">
              <div
                className="rounded-xl p-3.5"
                style={{
                  backgroundColor: "#FFF7ED",
                  border: "1px solid #FED7AA",
                }}
              >
                <p
                  className="text-[12px] leading-relaxed flex items-start gap-2"
                  style={{ color: "var(--status-pending)" }}
                >
                  <Lightbulb size={14} className="mt-0.5 shrink-0" />
                  <span>
                    <strong>Yêu cầu đặt hàng:</strong> Sales chỉ ghi nhận thông
                    tin và chuyển yêu cầu.
                  </span>
                </p>
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
    </>
  );
}
