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

import { useState, useCallback, useRef, useMemo , useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { PrintableInvoice } from "../order-manage/detail";
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
  discount: 0,
  depositAmount: 0,
  vatRate: 0,
  selectedCustomer: null,
  customerName: "",
  customerPhone: "",
  deliveryInfo: {
    address: "",
    district: "",
    ward: "",
    expectedDate: "",
    shippingNote: "",
  },
});

// ===================== SHARED INPUT STYLE =====================
const inputBase =
  "w-full text-[13px] rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 transition bg-transparent";
const inputStyle = {
  border: "1px solid var(--grid-border)",
  color: "var(--text-main)",
};

// ===================== COMPONENT =====================
export default function CustomOrderInvoicePage() {
  const printRef = useRef(null);
  const [printingOrder, setPrintingOrder] = useState(null);

  useEffect(() => {
    if (printingOrder && printRef.current) {
        const content = printRef.current;
        const printWindow = window.open("", "_blank", "width=900,height=700");
        if (printWindow) {
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                <title>In hóa đơn</title>
                <style>
                    @page { size: A4; margin: 15mm; }
                    body { margin: 0; padding: 0; }
                    .page-break { page-break-after: always; }
                    .page-break:last-child { page-break-after: auto; }
                </style>
                </head>
                <body>${content.innerHTML}</body>
                </html>
            `);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => {
                printWindow.print();
                setPrintingOrder(null);
            }, 500); 
        } else {
            setPrintingOrder(null);
        }
    }
  }, [printingOrder]);

  const navigate = useNavigate();

  const [tabs, setTabs] = useState([createEmptyTab()]);
  const [activeTabId, setActiveTabId] = useState(tabs[0].id);
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

  const [newItem, setNewItem] = useState({
    productName: "",
    woodType: "",
    dimLength: "",
    dimWidth: "",
    dimHeight: "",
    color: "",
    quantity: 1,
    unitPrice: 0,
    note: "",
    images: [],
  });
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

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
    const { dimLength, dimWidth, dimHeight, ...rest } = newItem;
    const size = [dimLength, dimWidth, dimHeight].filter(Boolean).join("×");
    updateActiveTab({
      cartItems: [
        ...activeTab.cartItems,
        {
          id: `custom-${++itemIdCounter}`,
          ...rest,
          size,
          quantity: newItem.quantity || 1,
          unitPrice: newItem.unitPrice || 0,
          images: newItem.images || [],
        },
      ],
    });
    setNewItem({
      productName: "",
      woodType: "",
      dimLength: "",
      dimWidth: "",
      dimHeight: "",
      color: "",
      quantity: 1,
      unitPrice: 0,
      note: "",
      images: [],
    });
    setShowAddForm(false);
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

  // Totals
  const subtotal = activeTab.cartItems.reduce(
    (sum, i) => sum + i.unitPrice * i.quantity,
    0,
  );
  const vatAmount = Math.round(subtotal * (activeTab.vatRate / 100));
  const totalBeforeDeposit = subtotal + vatAmount - activeTab.discount;
  const totalPayable = Math.max(
    0,
    totalBeforeDeposit - activeTab.depositAmount,
  );
  const itemCount = activeTab.cartItems.reduce((sum, i) => sum + i.quantity, 0);

  // Checkout
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
    showToast("success", `Tạo đơn đặt hàng ${generateOrderCode()} thành công!`);
    updateActiveTab(createEmptyTab());
  };

  // ===================== RENDER =====================
  return (
    <>
      <PageHelmet title="Đặt hàng riêng - TPF-SIMS" />

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
                <span>ĐH {idx + 1}</span>
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
              title="Thêm đơn hàng mới"
            >
              <Plus size={14} />
            </button>

            {/* Order type switch */}
            <div
              className="ml-auto flex rounded-lg overflow-hidden text-[12px] font-medium shrink-0"
              style={{ border: "1px solid var(--grid-border)" }}
            >
              <button
                onClick={() => navigate("/sales/dashboard/invoice-instock")}
                className="flex items-center gap-1 px-3 py-1.5 cursor-pointer transition hover:bg-gray-50"
                style={{ color: "var(--text-secondary)" }}
              >
                <PackageCheck size={12} /> Có sẵn
              </button>
              <button
                className="flex items-center gap-1 px-3 py-1.5 cursor-pointer transition"
                style={{
                  backgroundColor: "var(--brand-primary)",
                  color: "#fff",
                }}
              >
                <Hammer size={12} /> Đặt riêng
              </button>
            </div>

            {/* Add product */}
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition shrink-0 ml-2 cursor-pointer"
              style={{
                backgroundColor: "var(--status-focus)",
                color: "var(--brand-primary)",
              }}
            >
              <Plus size={13} /> Thêm SP
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
              <div className="flex items-center justify-between">
                <h4
                  className="text-[13px] font-bold flex items-center gap-2"
                  style={{ color: "var(--text-main)" }}
                >
                  <Package
                    size={14}
                    style={{ color: "var(--brand-primary)" }}
                  />
                  Thêm sản phẩm đặt riêng
                </h4>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="cursor-pointer"
                  style={{ color: "var(--text-placeholder)" }}
                >
                  <X size={16} />
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
                  <select
                    value={newItem.woodType}
                    onChange={(e) => updateNewItem("woodType", e.target.value)}
                    className={`${inputBase} pl-9 appearance-none bg-white`}
                    style={inputStyle}
                  >
                    <option value="">Loại gỗ</option>
                    {WOOD_TYPES.map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="relative">
                  <Palette
                    size={13}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--text-placeholder)" }}
                  />
                  <select
                    value={newItem.color}
                    onChange={(e) => updateNewItem("color", e.target.value)}
                    className={`${inputBase} pl-9 appearance-none bg-white`}
                    style={inputStyle}
                  >
                    <option value="">Màu sắc</option>
                    {COLORS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-3">
                <div className="relative">
                  <Ruler
                    size={13}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--text-placeholder)" }}
                  />
                  <input
                    type="number"
                    placeholder="Dài (cm)"
                    value={newItem.dimLength}
                    onChange={(e) => updateNewItem("dimLength", e.target.value)}
                    className={`${inputBase} pl-9 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                    style={inputStyle}
                  />
                </div>
                <input
                  type="number"
                  placeholder="Rộng (cm)"
                  value={newItem.dimWidth}
                  onChange={(e) => updateNewItem("dimWidth", e.target.value)}
                  className={`${inputBase} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                  style={inputStyle}
                />
                <input
                  type="number"
                  placeholder="Cao (cm)"
                  value={newItem.dimHeight}
                  onChange={(e) => updateNewItem("dimHeight", e.target.value)}
                  className={`${inputBase} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                  style={inputStyle}
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
                  className={`${inputBase} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                  style={inputStyle}
                />
                <input
                  type="text"
                  placeholder="Đơn giá (VNĐ)"
                  value={newItem.unitPrice ? fmt(newItem.unitPrice) : ""}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");
                    updateNewItem("unitPrice", parseInt(raw) || 0);
                  }}
                  className={inputBase}
                  style={inputStyle}
                />
              </div>

              <input
                type="text"
                placeholder="Ghi chú yêu cầu đặc biệt (sơn màu, chạm khắc, ...)"
                value={newItem.note}
                onChange={(e) => updateNewItem("note", e.target.value)}
                className={inputBase}
                style={inputStyle}
              />

              {/* Image upload */}
              <div>
                <div className="flex items-center gap-3">
                  <label
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-medium cursor-pointer transition hover:bg-gray-100"
                    style={{ border: "1px dashed var(--grid-border)", color: "var(--text-secondary)" }}
                  >
                    <ImagePlus size={14} style={{ color: "var(--brand-primary)" }} />
                    Thêm ảnh mẫu
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        files.forEach(file => {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            setNewItem(prev => ({ ...prev, images: [...prev.images, ev.target.result] }));
                          };
                          reader.readAsDataURL(file);
                        });
                        e.target.value = "";
                      }}
                    />
                  </label>
                  {newItem.images.length > 0 && (
                    <span className="text-[11px]" style={{ color: "var(--text-placeholder)" }}>{newItem.images.length} ảnh</span>
                  )}
                </div>
                {newItem.images.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {newItem.images.map((img, i) => (
                      <div key={i} className="relative group/img">
                        <img src={img} alt="" className="w-16 h-16 object-cover rounded-lg" style={{ border: "1px solid var(--grid-border)" }} />
                        <button
                          onClick={() => setNewItem(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }))}
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
                  onClick={() => setShowAddForm(false)}
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
                  <Plus size={13} className="mr-1" /> Thêm vào đơn
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
                  className="w-20 h-20 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: "var(--bg-main)" }}
                >
                  <Package size={32} strokeWidth={1.5} />
                </div>
                <p className="text-sm font-medium mt-2">
                  Chưa có sản phẩm đặt nào
                </p>
                <p className="text-xs">
                  Nhấn "Thêm SP" để mô tả hàng đặt riêng
                </p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="mt-3 flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-medium transition cursor-pointer"
                  style={{
                    backgroundColor: "var(--status-focus)",
                    color: "var(--brand-primary)",
                  }}
                >
                  <Plus size={14} /> Thêm sản phẩm đặt
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
                          className="text-[13px] font-semibold truncate"
                          style={{ color: "var(--text-main)" }}
                        >
                          {item.productName}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {item.woodType && (
                            <span
                              className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md"
                              style={{
                                backgroundColor: "var(--status-focus)",
                                color: "var(--status-success)",
                              }}
                            >
                              <TreePine size={9} /> {item.woodType}
                            </span>
                          )}
                          {item.size && (
                            <span
                              className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md"
                              style={{
                                backgroundColor: "#F3E8FF",
                                color: "#7C3AED",
                              }}
                            >
                              <Ruler size={9} /> {item.size}
                            </span>
                          )}
                          {item.color && (
                            <span
                              className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md"
                              style={{
                                backgroundColor: "#FFF7ED",
                                color: "#EA580C",
                              }}
                            >
                              <Palette size={9} /> {item.color}
                            </span>
                          )}
                        </div>
                        {item.note && (
                          <p
                            className="text-[11px] italic mt-1 truncate"
                            style={{ color: "var(--text-placeholder)" }}
                          >
                            📝 {item.note}
                          </p>
                        )}
                        {item.images && item.images.length > 0 && (
                          <div className="flex gap-1.5 mt-2">
                            {item.images.map((img, i) => (
                              <img key={i} src={img} alt="" className="w-10 h-10 object-cover rounded-md" style={{ border: "1px solid var(--grid-border)" }} />
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

                      {/* Price */}
                      <div className="text-right w-24 shrink-0">
                        <p
                          className="text-[11px]"
                          style={{ color: "var(--text-placeholder)" }}
                        >
                          × {fmt(item.unitPrice)}đ
                        </p>
                        <p
                          className="text-[13px] font-bold"
                          style={{ color: "var(--brand-primary)" }}
                        >
                          {fmt(item.unitPrice * item.quantity)}đ
                        </p>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="w-7 h-7 rounded-lg items-center justify-center transition cursor-pointer opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 hidden group-hover:flex shrink-0 mt-0.5"
                        style={{ color: "var(--text-placeholder)" }}
                      >
                        <Trash2 size={13} />
                      </button>
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
                placeholder="Ghi chú đơn hàng..."
                value={activeTab.orderNote}
                onChange={(e) => updateActiveTab({ orderNote: e.target.value })}
                className="flex-1 text-[13px] focus:outline-none bg-transparent"
                style={{ color: "var(--text-secondary)" }}
              />
            </div>

            {/* Summary */}
            <div
              className="px-4 py-3 space-y-2 border-b"
              style={{
                borderColor: "var(--grid-border)",
                backgroundColor: "var(--grid-header-bg)",
              }}
            >
              <div className="flex justify-between text-[13px]">
                <span style={{ color: "var(--text-secondary)" }}>
                  Tổng ({itemCount} sản phẩm)
                </span>
                <span
                  className="font-medium"
                  style={{ color: "var(--text-main)" }}
                >
                  {fmt(subtotal)}đ
                </span>
              </div>
              <div className="flex justify-between text-[13px] items-center">
                <span style={{ color: "var(--text-secondary)" }}>Giảm giá</span>
                <div className="flex items-center gap-1">
                  <span
                    className="text-[13px]"
                    style={{ color: "var(--text-placeholder)" }}
                  >
                    ₫
                  </span>
                  <input
                    type="text"
                    value={activeTab.discount ? fmt(activeTab.discount) : ""}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "");
                      updateActiveTab({
                        discount: parseInt(raw) || 0,
                      });
                    }}
                    placeholder="0"
                    className="w-28 text-right text-[13px] font-medium rounded-lg px-2 py-1 focus:outline-none focus:ring-1 bg-white"
                    style={{
                      border: "1px solid var(--grid-border)",
                      color: "var(--text-main)",
                    }}
                  />
                </div>
              </div>
              <div className="flex justify-between text-[13px] items-center">
                <span
                  className="font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <CreditCard size={12} className="inline mr-1.5" />
                  Tiền đặt cọc
                </span>
                <div className="flex items-center gap-1">
                  <span
                    className="text-[13px]"
                    style={{ color: "var(--text-placeholder)" }}
                  >
                    ₫
                  </span>
                  <input
                    type="text"
                    value={
                      activeTab.depositAmount
                        ? fmt(activeTab.depositAmount)
                        : ""
                    }
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "");
                      updateActiveTab({
                        depositAmount: parseInt(raw) || 0,
                      });
                    }}
                    placeholder="0"
                    className="w-28 text-right text-[13px] font-medium rounded-lg px-2 py-1 focus:outline-none focus:ring-1 bg-white"
                    style={{
                      border: "1px solid var(--grid-border)",
                      color: "var(--text-main)",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Checkout bar */}
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <p
                  className="text-xs uppercase tracking-wider font-medium"
                  style={{ color: "var(--text-placeholder)" }}
                >
                  Còn phải trả
                </p>
                <p
                  className="text-xl font-bold tracking-tight"
                  style={{ color: "var(--brand-primary)" }}
                >
                  {fmt(totalPayable)}đ
                </p>
              </div>
              <Button
                className="h-11 px-8 text-sm font-bold text-white rounded-xl transition-all duration-200 active:scale-[0.97] cursor-pointer disabled:opacity-40"
                style={{
                  backgroundColor: "var(--brand-primary)",
                  boxShadow:
                    activeTab.cartItems.length > 0
                      ? "0 4px 14px rgba(52, 176, 87, 0.25)"
                      : "none",
                }}
                disabled={activeTab.cartItems.length === 0}
                onClick={handleCreateOrder}
              >
                Tạo đơn đặt hàng
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
              className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md"
              style={{
                backgroundColor: "#FFF7ED",
                color: "var(--status-pending)",
              }}
            >
              Đơn đặt
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
                      className="flex items-center gap-1.5 px-3 py-1.5 flex-1 min-w-0 rounded-lg bg-gray-50 border"
                      style={{ borderColor: "var(--grid-border)" }}
                    >
                      <User
                        size={14}
                        style={{ color: "var(--text-placeholder)" }}
                        className="shrink-0"
                      />
                      <span
                        className="text-[13px] font-medium truncate"
                        style={{ color: "var(--brand-primary)" }}
                      >
                        {activeTab.selectedCustomer.name}
                      </span>
                      <span
                        className="text-[11px] shrink-0"
                        style={{ color: "var(--text-placeholder)" }}
                      >
                        {activeTab.selectedCustomer.phone}
                      </span>
                      <button
                        onClick={() => {
                          updateActiveTab({ 
                            selectedCustomer: null, 
                            customerName: "", 
                            customerPhone: "" 
                          });
                          setCustomerSearch("");
                        }}
                        className="cursor-pointer shrink-0 ml-auto"
                        style={{ color: "var(--text-placeholder)" }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div 
                      className="flex items-center gap-1.5 px-3 flex-1 min-w-0 rounded-lg bg-white box-border border"
                      style={{ borderColor: "var(--grid-border)" }}
                    >
                      <User
                        size={14}
                        style={{ color: "var(--text-placeholder)" }}
                        className="shrink-0"
                      />
                      <input
                        type="text"
                        placeholder="Tìm khách hàng (tên, SĐT)..."
                        value={customerSearch}
                        onChange={(e) => {
                          setCustomerSearch(e.target.value);
                          setShowCustomerDropdown(true);
                        }}
                        onFocus={() => {
                          if (customerSearch.trim()) setShowCustomerDropdown(true);
                        }}
                        onBlur={() => {
                          setTimeout(() => setShowCustomerDropdown(false), 200);
                        }}
                        className="flex-1 text-[13px] py-1.5 focus:outline-none bg-transparent min-w-0 border-none"
                        style={{ color: "var(--text-main)" }}
                      />
                      <button
                        onClick={() => setShowAddCustomer(true)}
                        className="w-6 h-6 rounded-md flex items-center justify-center cursor-pointer transition hover:bg-gray-100 shrink-0"
                        style={{ color: "var(--brand-primary)" }}
                        title="Thêm khách hàng mới"
                      >
                        <UserPlus size={12} />
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
                                  customerPhone: c.phone 
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
                </div></div>

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
            <div
              className="p-4 space-y-3 border-b"
              style={{ borderColor: "var(--grid-border)" }}
            >
              <p
                className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5"
                style={{ color: "var(--text-placeholder)" }}
              >
                <Truck size={12} /> Thông tin giao hàng
              </p>
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

            {/* Expected Date */}
            <div
              className="p-4 space-y-3 border-b"
              style={{ borderColor: "var(--grid-border)" }}
            >
              <p
                className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5"
                style={{ color: "var(--text-placeholder)" }}
              >
                <CalendarDays size={12} /> Ngày giao dự kiến
              </p>
              <input
                type="date"
                value={activeTab.deliveryInfo.expectedDate}
                onChange={(e) => updateDelivery("expectedDate", e.target.value)}
                className={inputBase}
                style={inputStyle}
              />
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
                  className="text-[12px] leading-relaxed"
                  style={{ color: "var(--status-pending)" }}
                >
                  💡 <strong>Đơn đặt hàng riêng:</strong> Sản phẩm sẽ được sản
                  xuất theo yêu cầu. Vui lòng xác nhận đặt cọc và ngày giao hàng
                  dự kiến với khách.
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
          {/* Hidden Print Area */}
      <div style={{ display: "none" }}>
        {printingOrder && (
          <div ref={printRef}>
            <PrintableInvoice
              o={printingOrder}
              displayTotal={printingOrder.total}
            />
          </div>
        )}
      </div>
    </>
  );
}
