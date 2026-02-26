/**
 * Component CustomOrderInvoicePage
 * Tạo đơn hàng đặt riêng – Hàng custom theo yêu cầu khách
 * - Hỗ trợ nhiều tab hóa đơn (mỗi tab có giỏ hàng & thông tin giao hàng riêng)
 * - Layout 2 cột: Danh sách sản phẩm đặt (trái) + Khách hàng & Giao hàng (phải)
 * - Thêm sản phẩm thủ công: tên, loại gỗ, kích thước, màu sắc, SL, đơn giá
 * - Form thông tin giao hàng + đặt cọc + ngày giao dự kiến
 *
 * Created By: DNC
 * Created Date: 25/02/2026
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  X,
  Plus,
  Minus,
  Trash2,
  UserPlus,
  ShoppingCart,
  Pencil,
  MapPin,
  Phone,
  CalendarDays,
  FileText,
  Truck,
  Package,
  PackageCheck,
  Hammer,
  Palette,
  Ruler,
  TreePine,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import { Button } from "@/components/ui/button";
import { salesService } from "@/services/sales.service";

// ===================== CONSTANTS =====================
// Wood types will be fetched from the database
// ===================== HELPERS =====================
const formatCurrency = (value) => {
  return new Intl.NumberFormat("vi-VN").format(value);
};

const generateOrderCode = () => {
  const now = new Date();
  return `DH${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;
};

const formatDateTime = () => {
  const now = new Date();
  return now.toLocaleString("vi-VN", {
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
  searchCustomer: "",
  selectedCustomer: null,
  orderNote: "",
  discount: 0,
  depositAmount: 0,
  vatRate: 0,
  customerName: "",
  customerPhone: "",
  deliveryInfo: {
    recipientName: "",
    recipientPhone: "",
    address: "",
    district: "",
    ward: "",
    expectedDate: "",
    shippingNote: "",
  },
});

// ===================== COMPONENT =====================
export default function CustomOrderInvoicePage() {
  const navigate = useNavigate();

  // ---- Multi-tab state ----
  const [tabs, setTabs] = useState([
    {
      id: 1,
      cartItems: [],
      orderNote: "",
      discount: 0,
      depositAmount: 0,
      vatRate: 0,
      deliveryInfo: {
        recipientName: "",
        recipientPhone: "",
        address: "",
        district: "",
        ward: "",
        expectedDate: "",
        shippingNote: "",
      },
    },
  ]);
  const [activeTabId, setActiveTabId] = useState(1);

  // Add item form (shared UI state)
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    productName: "",
    woodType: "",
    size: "",
    color: "",
    quantity: 1,
    unitPrice: 0,
    note: "",
  });

  // ---- Active tab helpers ----
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  const updateActiveTab = useCallback(
    (updates) => {
      setTabs((prev) =>
        prev.map((t) => (t.id === activeTabId ? { ...t, ...updates } : t)),
      );
    },
    [activeTabId],
  );

  // ---- API state ----
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  // ---- Wood types & Colors from DB ----
  const [woodTypes, setWoodTypes] = useState([]);
  const [colors, setColors] = useState([]);

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [wtData, colorData] = await Promise.all([
          salesService.getWoodTypes(),
          salesService.getColors(),
        ]);
        setWoodTypes(wtData.items || []);
        setColors(colorData.items || []);
      } catch (err) {
        console.error("Fetch master data error:", err);
      }
    };
    fetchMasterData();
  }, []);

  // ---- Show toast ----
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

  const updateNewItem = (field, value) => {
    setNewItem((prev) => ({ ...prev, [field]: value }));
  };

  // ---- Tab management ----
  const addTab = () => {
    const newTab = createEmptyTab();
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
  };

  const closeTab = (tabId, e) => {
    e.stopPropagation();
    if (tabs.length <= 1) return;
    setTabs((prev) => {
      const filtered = prev.filter((t) => t.id !== tabId);
      if (activeTabId === tabId) {
        setActiveTabId(filtered[filtered.length - 1].id);
      }
      return filtered;
    });
  };

  // ---- Cart actions ----
  const addCustomItem = () => {
    if (!newItem.productName.trim()) return;
    const id = `custom-${++itemIdCounter}`;
    updateActiveTab({
      cartItems: [
        ...activeTab.cartItems,
        {
          id,
          productName: newItem.productName,
          woodType: newItem.woodType,
          size: newItem.size,
          color: newItem.color,
          quantity: newItem.quantity || 1,
          unitPrice: newItem.unitPrice || 0,
          note: newItem.note,
        },
      ],
    });
    setNewItem({
      productName: "",
      woodType: "",
      size: "",
      color: "",
      quantity: 1,
      unitPrice: 0,
      note: "",
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

  const removeFromCart = (id) => {
    updateActiveTab({
      cartItems: activeTab.cartItems.filter((i) => i.id !== id),
    });
  };

  const setQuantity = (id, qty) => {
    const val = parseInt(qty) || 0;
    if (val <= 0) {
      removeFromCart(id);
    } else {
      updateActiveTab({
        cartItems: activeTab.cartItems.map((i) =>
          i.id === id ? { ...i, quantity: val } : i,
        ),
      });
    }
  };

  // ---- Totals ----
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

  // ---- Checkout ----
  const handleCreateOrder = async () => {
    if (activeTab.cartItems.length === 0) return;

    const name = activeTab.customerName.trim();
    const phone = activeTab.customerPhone.trim();
    if (!name) {
      showToast("error", "Vui lòng nhập tên khách hàng");
      return;
    }
    if (!phone) {
      showToast("error", "Vui lòng nhập số điện thoại khách hàng");
      return;
    }

    try {
      setIsSubmitting(true);

      // Tạo hồ sơ khách hàng trước
      const customerRes = await salesService.createCustomer({
        fullName: name,
        phoneNumber: phone,
      });
      const customerId = customerRes.customer?.pk_customer_id;

      const data = {
        customerId,
        orderNote: activeTab.orderNote || "",
        discount: activeTab.discount || 0,
        depositAmount: activeTab.depositAmount || 0,
        vatRate: activeTab.vatRate || 0,
        deliveryInfo: activeTab.deliveryInfo,
        items: activeTab.cartItems.map((item) => ({
          productName: item.productName,
          woodType: item.woodType || "",
          size: item.size || "",
          color: item.color || "",
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          note: item.note || "",
        })),
      };

      const result = await salesService.createCustomOrder(data);

      showToast(
        "success",
        `Tạo đơn đặt hàng ${result.order.orderCode} thành công!`,
      );

      // Reset tab
      updateActiveTab({
        cartItems: [],
        orderNote: "",
        discount: 0,
        depositAmount: 0,
        vatRate: 0,
        customerName: "",
        customerPhone: "",
        deliveryInfo: {
          recipientName: "",
          recipientPhone: "",
          address: "",
          district: "",
          ward: "",
          expectedDate: "",
          shippingNote: "",
        },
      });
    } catch (err) {
      const msg = err.response?.data?.message || "Lỗi khi tạo đơn đặt hàng";
      showToast("error", msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ===================== RENDER =====================
  return (
    <>
      <PageHelmet title="Đặt hàng riêng - TPF-SIMS" />

      {/* ── Toast notification ── */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-in slide-in-from-top-2 ${
            toast.type === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          {toast.message}
          <button
            onClick={() => setToast(null)}
            className="ml-2 opacity-70 hover:opacity-100"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="flex h-[calc(100vh-64px)] bg-gray-100 -m-6">
        {/* ═══════════════ CỘT TRÁI – SẢN PHẨM ĐẶT ═══════════════ */}
        <div className="flex flex-col w-[58%] border-r bg-white">
          {/* ── Header ── */}
          <div className="flex items-center justify-between px-4 py-2 bg-primary text-primary-foreground">
            <div className="flex items-center gap-2 shrink-0">
              <Truck size={16} />
              <span className="font-semibold text-sm">Đơn đặt hàng riêng</span>
            </div>
            <div className="flex items-center gap-1 overflow-x-auto flex-1 ml-3 scrollbar-none">
              {tabs.map((tab, idx) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTabId(tab.id)}
                  className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-sm whitespace-nowrap transition shrink-0 ${
                    tab.id === activeTabId
                      ? "bg-white/25 font-semibold"
                      : "bg-white/10 hover:bg-white/15"
                  }`}
                >
                  <ShoppingCart size={12} />
                  <span>ĐH {idx + 1}</span>
                  {tab.cartItems.length > 0 && (
                    <span className="bg-white/30 text-[10px] font-bold px-1.5 rounded-full ml-0.5">
                      {tab.cartItems.length}
                    </span>
                  )}
                  {tabs.length > 1 && (
                    <X
                      size={12}
                      className="ml-1 cursor-pointer hover:text-red-200 opacity-60 hover:opacity-100"
                      onClick={(e) => closeTab(tab.id, e)}
                    />
                  )}
                </button>
              ))}
              <button
                onClick={addTab}
                className="w-7 h-7 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center transition shrink-0"
                title="Thêm đơn hàng mới"
              >
                <Plus size={14} />
              </button>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 rounded-md px-3 py-1.5 text-sm font-medium transition shrink-0 ml-2"
            >
              <Plus size={14} />
              Thêm SP
            </button>
          </div>

          {/* ── Add Custom Item Form (Slide-down) ── */}
          {showAddForm && (
            <div className="border-b bg-muted/50 p-4 space-y-3 animate-in slide-in-from-top">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Package size={15} className="text-primary" />
                  Thêm sản phẩm đặt riêng
                </h4>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Row 1: Tên sản phẩm */}
              <input
                type="text"
                placeholder="Tên sản phẩm *"
                value={newItem.productName}
                onChange={(e) => updateNewItem("productName", e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring placeholder-gray-400"
              />

              {/* Row 2: Loại gỗ + Màu sắc */}
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <TreePine
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <select
                    value={newItem.woodType}
                    onChange={(e) => updateNewItem("woodType", e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-ring bg-white text-gray-600 appearance-none"
                  >
                    <option value="">Loại gỗ</option>
                    {woodTypes.map((w) => (
                      <option key={w.pk_wood_type_id} value={w.wood_name}>
                        {w.wood_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="relative">
                  <Palette
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <select
                    value={newItem.color}
                    onChange={(e) => updateNewItem("color", e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-ring bg-white text-gray-600 appearance-none"
                  >
                    <option value="">Màu sắc</option>
                    {colors.map((c) => (
                      <option key={c.pk_color_id} value={c.color_name}>
                        {c.color_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: Kích thước + Số lượng + Đơn giá */}
              <div className="grid grid-cols-3 gap-3">
                <div className="relative">
                  <Ruler
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Kích thước (D×R×C)"
                    value={newItem.size}
                    onChange={(e) => updateNewItem("size", e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-ring placeholder-gray-400"
                  />
                </div>
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
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-ring [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <input
                  type="text"
                  placeholder="Đơn giá (VNĐ)"
                  value={
                    newItem.unitPrice ? formatCurrency(newItem.unitPrice) : ""
                  }
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");
                    updateNewItem("unitPrice", parseInt(raw) || 0);
                  }}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Row 4: Ghi chú riêng */}
              <input
                type="text"
                placeholder="Ghi chú yêu cầu đặc biệt (sơn màu, chạm khắc, ...)"
                value={newItem.note}
                onChange={(e) => updateNewItem("note", e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-ring placeholder-gray-400"
              />

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs"
                >
                  Hủy
                </Button>
                <Button
                  size="sm"
                  onClick={addCustomItem}
                  disabled={!newItem.productName.trim()}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold"
                >
                  <Plus size={14} className="mr-1" />
                  Thêm vào đơn
                </Button>
              </div>
            </div>
          )}

          {/* ── Cart Table ── */}
          <div className="flex-1 overflow-y-auto">
            {activeTab.cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-300">
                <Package size={64} strokeWidth={1} />
                <p className="mt-4 text-sm font-medium">
                  Chưa có sản phẩm đặt nào
                </p>
                <p className="text-xs mt-1">
                  Nhấn "Thêm SP" để mô tả hàng đặt riêng
                </p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="mt-4 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition border border-primary/20"
                >
                  <Plus size={14} />
                  Thêm sản phẩm đặt
                </button>
              </div>
            ) : (
              <div className="divide-y">
                {activeTab.cartItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-3 hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      {/* Info */}
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <span className="text-xs text-gray-400 font-bold mt-1 w-5 shrink-0">
                          {idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">
                            {item.productName}
                          </p>
                          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                            {item.woodType && (
                              <span className="inline-flex items-center gap-1 text-[11px] text-green-700 bg-green-50 px-1.5 py-0.5 rounded border border-green-200">
                                <TreePine size={10} />
                                {item.woodType}
                              </span>
                            )}
                            {item.size && (
                              <span className="inline-flex items-center gap-1 text-[11px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                                <Ruler size={10} />
                                {item.size}
                              </span>
                            )}
                            {item.color && (
                              <span className="inline-flex items-center gap-1 text-[11px] text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200">
                                <Palette size={10} />
                                {item.color}
                              </span>
                            )}
                          </div>
                          {item.note && (
                            <p className="text-[11px] text-gray-400 italic mt-1 truncate">
                              📝 {item.note}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Quantity + Price */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-6 h-6 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition text-gray-500"
                          >
                            <Minus size={10} />
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              setQuantity(item.id, e.target.value)
                            }
                            className="w-10 h-6 text-center text-xs font-semibold border rounded focus:outline-none focus:ring-1 focus:ring-ring [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-6 h-6 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition text-gray-500"
                          >
                            <Plus size={10} />
                          </button>
                        </div>
                        <div className="text-right w-24">
                          <p className="text-xs text-gray-400">
                            {formatCurrency(item.unitPrice)}
                          </p>
                          <p className="text-sm font-bold text-primary">
                            {formatCurrency(item.unitPrice * item.quantity)}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Quick add button at bottom */}
                <button
                  onClick={() => setShowAddForm(true)}
                  className="w-full p-3 flex items-center justify-center gap-2 text-sm text-primary hover:bg-muted transition font-medium"
                >
                  <Plus size={14} />
                  Thêm sản phẩm đặt khác
                </button>
              </div>
            )}
          </div>

          {/* ── Footer: Note + Totals ── */}
          <div className="border-t bg-white">
            {/* Order Note */}
            <div className="flex items-center gap-2 px-4 py-2 border-b">
              <Pencil size={14} className="text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Ghi chú đơn hàng"
                value={activeTab.orderNote}
                onChange={(e) => updateActiveTab({ orderNote: e.target.value })}
                className="flex-1 text-sm text-gray-600 focus:outline-none placeholder-gray-300"
              />
            </div>

            {/* Totals */}
            <div className="px-4 py-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tổng tiền hàng</span>
                <span className="font-semibold text-gray-700">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-sm items-center">
                <span className="text-gray-500">Giảm giá</span>
                <input
                  type="number"
                  value={activeTab.discount}
                  onChange={(e) =>
                    updateActiveTab({
                      discount: Math.max(0, parseInt(e.target.value) || 0),
                    })
                  }
                  className="w-28 text-right text-sm font-semibold border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-ring [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              {vatAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400 text-xs">
                    Thuế VAT ({activeTab.vatRate}%)
                  </span>
                  <span className="text-xs text-gray-500">
                    +{formatCurrency(vatAmount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm items-center">
                <span className="text-gray-500 font-medium">Tiền đặt cọc</span>
                <input
                  type="number"
                  value={activeTab.depositAmount}
                  onChange={(e) =>
                    updateActiveTab({
                      depositAmount: Math.max(0, parseInt(e.target.value) || 0),
                    })
                  }
                  className="w-28 text-right text-sm font-semibold border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-ring text-green-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <div className="flex justify-between text-base font-bold pt-1 border-t">
                <span className="text-gray-800">Còn phải trả</span>
                <span className="text-primary text-lg">
                  {formatCurrency(totalPayable)}
                </span>
              </div>
            </div>
          </div>

          {/* ── Bottom Tabs ── */}
          <div className="flex border-t bg-gray-50">
            <button
              onClick={() => navigate("/sales/dashboard/invoice-instock")}
              className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium text-gray-500 hover:bg-gray-100 transition"
            >
              <PackageCheck size={15} /> Hàng có sẵn
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold text-primary border-b-2 border-primary bg-white">
              <Hammer size={15} /> Hàng đặt riêng
            </button>
          </div>
        </div>

        {/* ═══════════════ CỘT PHẢI – KHÁCH HÀNG & GIAO HÀNG ═══════════════ */}
        <div className="flex flex-col w-[42%] bg-white">
          {/* ── Order Header ── */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-gray-700">
                {generateOrderCode()}
              </span>
              <span className="text-gray-300">|</span>
              <span className="text-xs text-gray-400">{formatDateTime()}</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-500 bg-orange-50 px-2 py-1 rounded border border-orange-200">
              Đơn đặt
            </span>
          </div>

          {/* ── Thông tin khách hàng (bắt buộc) ── */}
          <div className="px-4 py-3 border-b space-y-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Thông tin khách hàng <span className="text-red-500">*</span>
            </p>
            <div className="flex items-center gap-3">
              <UserPlus size={16} className="text-primary shrink-0" />
              <input
                type="text"
                placeholder="Tên khách hàng"
                value={activeTab.customerName}
                onChange={(e) =>
                  updateActiveTab({ customerName: e.target.value })
                }
                className="flex-1 text-sm border-b border-gray-200 pb-2 focus:outline-none focus:border-primary transition placeholder-gray-400"
              />
            </div>
            <div className="flex items-center gap-3">
              <Phone size={16} className="text-primary shrink-0" />
              <input
                type="tel"
                placeholder="Số điện thoại"
                value={activeTab.customerPhone}
                onChange={(e) =>
                  updateActiveTab({ customerPhone: e.target.value })
                }
                className="flex-1 text-sm border-b border-gray-200 pb-2 focus:outline-none focus:border-primary transition placeholder-gray-400"
              />
            </div>
          </div>

          {/* ── Delivery Form ── */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-4">
              {/* Địa chỉ */}
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-green-500 shrink-0 mt-1" />
                <div className="flex-1 space-y-3">
                  <input
                    type="text"
                    placeholder="Địa chỉ giao hàng (Số nhà, ngõ, đường)"
                    value={activeTab.deliveryInfo.address}
                    onChange={(e) => updateDelivery("address", e.target.value)}
                    className="w-full text-sm border-b border-gray-200 pb-2 focus:outline-none focus:border-primary transition placeholder-gray-400"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Quận/Huyện"
                      value={activeTab.deliveryInfo.district}
                      onChange={(e) =>
                        updateDelivery("district", e.target.value)
                      }
                      className="text-sm border-b border-gray-200 pb-2 focus:outline-none focus:border-primary transition placeholder-gray-400"
                    />
                    <input
                      type="text"
                      placeholder="Phường/Xã"
                      value={activeTab.deliveryInfo.ward}
                      onChange={(e) => updateDelivery("ward", e.target.value)}
                      className="text-sm border-b border-gray-200 pb-2 focus:outline-none focus:border-primary transition placeholder-gray-400"
                    />
                  </div>
                </div>
              </div>

              {/* Ngày giao hàng dự kiến */}
              <div className="flex items-center gap-3">
                <CalendarDays size={16} className="text-purple-500 shrink-0" />
                <div className="flex-1">
                  <label className="text-xs text-gray-400 font-medium block mb-1">
                    Ngày giao hàng dự kiến
                  </label>
                  <input
                    type="date"
                    value={activeTab.deliveryInfo.expectedDate}
                    onChange={(e) =>
                      updateDelivery("expectedDate", e.target.value)
                    }
                    className="w-full text-sm border-b border-gray-200 pb-2 focus:outline-none focus:border-primary transition"
                  />
                </div>
              </div>

              {/* Tip box */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-700">
                  💡 <strong>Đơn đặt hàng riêng:</strong> Sản phẩm sẽ được sản
                  xuất theo yêu cầu. Vui lòng xác nhận đặt cọc và ngày giao hàng
                  dự kiến với khách.
                </p>
              </div>
            </div>
          </div>

          {/* ── Create Order Button ── */}
          <div className="p-3 border-t">
            <Button
              className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-lg shadow-primary/30 transition-all duration-200 active:scale-[0.98]"
              disabled={activeTab.cartItems.length === 0 || isSubmitting}
              onClick={handleCreateOrder}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin mr-2" />
                  ĐANG XỬ LÝ...
                </>
              ) : (
                "TẠO ĐƠN ĐẶT HÀNG"
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
