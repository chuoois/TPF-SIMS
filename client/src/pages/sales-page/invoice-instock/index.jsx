/**
 * Component InStockInvoicePage
 * Tạo hóa đơn cho hàng có sẵn – Kiểu POS bán nhanh
 * - Hỗ trợ nhiều tab hóa đơn (mỗi tab có giỏ hàng riêng)
 * - Layout 2 cột: Giỏ hàng (trái) + Danh mục sản phẩm (phải)
 * - Tìm kiếm sản phẩm, thêm vào giỏ, chỉnh SL, xoá
 * - Tìm khách hàng (tùy chọn), ghi chú đơn hàng
 * - Tính tổng tiền tự động
 * - THANH TOÁN → tạo đơn hàng qua API
 *
 * Created By: DNC
 * Created Date: 25/02/2026
 */

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
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
  ChevronLeft,
  ChevronRight,
  Package,
  PackageCheck,
  Hammer,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import { Button } from "@/components/ui/button";
import AddCustomerModal from "@/pages/sales-page/components/AddCustomerModal";
import { salesService } from "@/services/sales.service";

// ===================== CONSTANTS =====================
const ITEMS_PER_PAGE = 9;

// ===================== HELPERS =====================
const formatCurrency = (value) => {
  return new Intl.NumberFormat("vi-VN").format(value);
};

let tabIdCounter = 1;

const createEmptyTab = () => ({
  id: ++tabIdCounter,
  cartItems: [],
  searchCustomer: "",
  selectedCustomer: null,
  orderNote: "",
  discount: 0,
});

// ===================== COMPONENT =====================
export default function InStockInvoicePage() {
  const navigate = useNavigate();

  // ---- Multi-tab state ----
  const [tabs, setTabs] = useState([
    {
      id: 1,
      cartItems: [],
      searchCustomer: "",
      selectedCustomer: null,
      orderNote: "",
      discount: 0,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState(1);

  // Product grid state (shared across tabs)
  const [searchProduct, setSearchProduct] = useState("");
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // ---- API state ----
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [customerResults, setCustomerResults] = useState([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [searchingCustomers, setSearchingCustomers] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Toast state
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message }
  const toastTimer = useRef(null);

  const customerDropdownRef = useRef(null);

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

  // ---- Show toast ----
  const showToast = (type, message) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ type, message });
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  };

  // ---- Fetch products ----
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);
        const data = await salesService.getProductsForSale(searchProduct);
        setProducts(data);
      } catch (err) {
        console.error("Fetch products error:", err);
      } finally {
        setLoadingProducts(false);
      }
    };

    const timer = setTimeout(fetchProducts, 300); // debounce
    return () => clearTimeout(timer);
  }, [searchProduct]);

  // ---- Customer search ----
  useEffect(() => {
    const query = activeTab.searchCustomer.trim();
    if (!query) {
      setCustomerResults([]);
      setShowCustomerDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setSearchingCustomers(true);
        const data = await salesService.getCustomers(query);
        setCustomerResults(data);
        setShowCustomerDropdown(true);
      } catch (err) {
        console.error("Search customers error:", err);
      } finally {
        setSearchingCustomers(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [activeTab.searchCustomer]);

  // Close customer dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        customerDropdownRef.current &&
        !customerDropdownRef.current.contains(e.target)
      ) {
        setShowCustomerDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  // ---- Pagination ----
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const paginatedProducts = products.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // ---- Cart actions (operate on active tab) ----
  const addToCart = (product) => {
    const cartId = product.sku?.pk_sku_id || product.pk_product_id;
    const existing = activeTab.cartItems.find((i) => i.id === cartId);
    if (existing) {
      // Kiểm tra tồn kho
      if (existing.quantity >= product.stock) {
        showToast("error", `Sản phẩm "${product.product_name}" đã hết hàng`);
        return;
      }
      updateActiveTab({
        cartItems: activeTab.cartItems.map((i) =>
          i.id === cartId ? { ...i, quantity: i.quantity + 1 } : i,
        ),
      });
    } else {
      if (product.stock <= 0) {
        showToast("error", `Sản phẩm "${product.product_name}" đã hết hàng`);
        return;
      }
      updateActiveTab({
        cartItems: [
          ...activeTab.cartItems,
          {
            id: cartId,
            skuId: product.sku?.pk_sku_id,
            name: product.product_name,
            price: product.selling_price,
            stock: product.stock,
            skuCode: product.sku?.sku_code || "",
            quantity: 1,
          },
        ],
      });
    }
  };

  const updateQuantity = (id, delta) => {
    updateActiveTab({
      cartItems: activeTab.cartItems
        .map((i) => {
          if (i.id !== id) return i;
          const newQty = i.quantity + delta;
          if (delta > 0 && newQty > i.stock) {
            showToast("error", `Tồn kho chỉ còn ${i.stock}`);
            return i;
          }
          return { ...i, quantity: Math.max(0, newQty) };
        })
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
      const item = activeTab.cartItems.find((i) => i.id === id);
      if (item && val > item.stock) {
        showToast("error", `Tồn kho chỉ còn ${item.stock}`);
        return;
      }
      updateActiveTab({
        cartItems: activeTab.cartItems.map((i) =>
          i.id === id ? { ...i, quantity: val } : i,
        ),
      });
    }
  };

  // ---- Select customer ----
  const selectCustomer = (customer) => {
    updateActiveTab({
      selectedCustomer: {
        id: customer.pk_customer_id,
        name: customer.full_name,
        phone: customer.phone_number,
      },
      searchCustomer: "",
    });
    setShowCustomerDropdown(false);
  };

  // ---- Totals ----
  const subtotal = activeTab.cartItems.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0,
  );
  const totalPayable = Math.max(0, subtotal - activeTab.discount);

  // ---- Checkout ----
  const handleCheckout = async () => {
    if (activeTab.cartItems.length === 0) return;

    try {
      setIsCheckingOut(true);
      const data = {
        customerId: activeTab.selectedCustomer?.id || null,
        orderNote: activeTab.orderNote || "",
        discount: activeTab.discount || 0,
        items: activeTab.cartItems.map((item) => ({
          skuId: item.skuId,
          quantity: item.quantity,
          unitPrice: item.price,
        })),
      };

      const result = await salesService.createInStockOrder(data);

      showToast(
        "success",
        `Tạo hóa đơn ${result.order.orderCode} thành công! Tổng: ${formatCurrency(result.order.totalAmount)}đ`,
      );

      // Reset giỏ hàng tab hiện tại
      updateActiveTab({
        cartItems: [],
        selectedCustomer: null,
        orderNote: "",
        discount: 0,
        searchCustomer: "",
      });

      // Refresh sản phẩm (tồn kho đã thay đổi)
      const refreshed = await salesService.getProductsForSale(searchProduct);
      setProducts(refreshed);
    } catch (err) {
      const msg =
        err.response?.data?.message || "Lỗi khi tạo hóa đơn, vui lòng thử lại";
      showToast("error", msg);
    } finally {
      setIsCheckingOut(false);
    }
  };

  // ===================== RENDER =====================
  return (
    <>
      <PageHelmet title="Bán hàng có sẵn - TPF-SIMS" />

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
        {/* ═══════════════ CỘT TRÁI – GIỎ HÀNG ═══════════════ */}
        <div className="flex flex-col w-[58%] border-r bg-white">
          {/* ── Header: Search + Invoice Tabs ── */}
          <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground">
            <div className="flex items-center gap-2 shrink-0">
              <Search size={16} />
              <input
                type="text"
                placeholder="Tìm hàng hóa"
                value={searchProduct}
                onChange={(e) => {
                  setSearchProduct(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-white/20 backdrop-blur-sm text-primary-foreground placeholder-white/70 rounded-md px-3 py-1.5 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-white/40"
              />
            </div>

            {/* Invoice Tabs */}
            <div className="ml-3 flex items-center gap-1 overflow-x-auto flex-1 scrollbar-none">
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
                  <span>HĐ {idx + 1}</span>
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
                title="Thêm hóa đơn mới"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* ── Cart Table ── */}
          <div className="flex-1 overflow-y-auto">
            {activeTab.cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-300">
                <ShoppingCart size={64} strokeWidth={1} />
                <p className="mt-4 text-sm font-medium">Chưa có sản phẩm nào</p>
                <p className="text-xs mt-1">
                  Click sản phẩm bên phải để thêm vào giỏ
                </p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-gray-50 sticky top-0 z-10 border-b text-xs text-gray-400 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="p-3 w-10">#</th>
                    <th className="p-3">Sản phẩm</th>
                    <th className="p-3 text-center w-32">Số lượng</th>
                    <th className="p-3 text-right w-28">Đơn giá</th>
                    <th className="p-3 text-right w-32">Thành tiền</th>
                    <th className="p-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {activeTab.cartItems.map((item, idx) => (
                    <tr
                      key={item.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <td className="p-3 text-xs text-gray-400 font-medium">
                        {idx + 1}
                      </td>
                      <td className="p-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-800 line-clamp-1">
                            {item.name}
                          </p>
                          <p className="text-[10px] text-gray-400 font-mono">
                            {item.skuCode}
                          </p>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition text-gray-500"
                          >
                            <Minus size={12} />
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              setQuantity(item.id, e.target.value)
                            }
                            className="w-12 h-7 text-center text-sm font-semibold border rounded-md focus:outline-none focus:ring-2 focus:ring-ring [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition text-gray-500"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </td>
                      <td className="p-3 text-right text-sm font-medium text-gray-700">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="p-3 text-right text-sm font-bold text-primary">
                        {formatCurrency(item.price * item.quantity)}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-300 hover:text-red-500 transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
              <div className="flex justify-between text-base font-bold pt-1 border-t">
                <span className="text-gray-800">Khách cần trả</span>
                <span className="text-primary text-lg">
                  {formatCurrency(totalPayable)}
                </span>
              </div>
            </div>
          </div>

          {/* ── Bottom Tabs ── */}
          <div className="flex border-t bg-gray-50">
            <button className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold text-primary border-b-2 border-primary bg-white">
              <PackageCheck size={15} /> Hàng có sẵn
            </button>
            <button
              onClick={() => navigate("/sales/dashboard/invoice-custom-order")}
              className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium text-gray-500 hover:bg-gray-100 transition"
            >
              <Hammer size={15} /> Hàng đặt riêng
            </button>
          </div>
        </div>

        {/* ═══════════════ CỘT PHẢI – SẢN PHẨM ═══════════════ */}
        <div className="flex flex-col w-[42%] bg-white">
          {/* ── Customer Search ── */}
          <div className="relative" ref={customerDropdownRef}>
            <div className="flex items-center gap-2 px-4 py-3 border-b">
              <Search size={16} className="text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Tìm khách hàng (tùy chọn)"
                value={activeTab.searchCustomer}
                onChange={(e) =>
                  updateActiveTab({ searchCustomer: e.target.value })
                }
                onFocus={() => {
                  if (customerResults.length > 0) setShowCustomerDropdown(true);
                }}
                className="flex-1 text-sm text-gray-600 focus:outline-none placeholder-gray-400"
              />
              {searchingCustomers && (
                <Loader2 size={14} className="animate-spin text-gray-400" />
              )}
              <button
                onClick={() => setShowAddCustomer(true)}
                className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition border border-primary/20"
                title="Thêm khách hàng mới"
              >
                <UserPlus size={14} />
              </button>
            </div>

            {/* Customer dropdown */}
            {showCustomerDropdown && customerResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border shadow-lg rounded-b-lg z-20 max-h-48 overflow-y-auto">
                {customerResults.map((c) => (
                  <button
                    key={c.pk_customer_id}
                    onClick={() => selectCustomer(c)}
                    className="w-full px-4 py-2.5 text-left hover:bg-primary/5 transition flex items-center justify-between border-b last:border-b-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {c.full_name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {c.phone_number || "Không có SĐT"} • {c.customer_code}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {activeTab.selectedCustomer && (
            <div className="px-4 py-2 bg-primary/10 border-b flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-primary">
                  {activeTab.selectedCustomer.name}
                </p>
                <p className="text-xs text-primary/70">
                  {activeTab.selectedCustomer.phone || "Không có SĐT"}
                </p>
              </div>
              <button
                onClick={() => updateActiveTab({ selectedCustomer: null })}
                className="text-primary/50 hover:text-primary"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* ── Product Grid ── */}
          <div className="flex-1 overflow-y-auto p-3">
            {loadingProducts ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-300">
                <Loader2 size={48} strokeWidth={1} className="animate-spin" />
                <p className="mt-3 text-sm">Đang tải sản phẩm...</p>
              </div>
            ) : paginatedProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-300">
                <Package size={48} strokeWidth={1} />
                <p className="mt-3 text-sm">Không tìm thấy sản phẩm</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {paginatedProducts.map((product) => (
                  <button
                    key={product.pk_product_id}
                    onClick={() => addToCart(product)}
                    disabled={product.stock <= 0}
                    className={`group flex flex-col items-center p-3 rounded-lg border transition-all duration-200 text-left cursor-pointer relative ${
                      product.stock <= 0
                        ? "border-gray-100 opacity-50 cursor-not-allowed"
                        : "border-gray-100 hover:border-primary/30 hover:bg-primary/5 hover:shadow-md"
                    }`}
                  >
                    {/* Stock badge */}
                    <span
                      className={`absolute top-1.5 right-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                        product.stock <= 0
                          ? "bg-red-100 text-red-600"
                          : product.stock <= 5
                            ? "bg-amber-100 text-amber-700"
                            : "bg-green-100 text-green-700"
                      }`}
                    >
                      {product.stock <= 0 ? "Hết" : `SL: ${product.stock}`}
                    </span>

                    <div className="w-16 h-16 rounded-lg bg-gray-50 flex items-center justify-center text-3xl mb-2 group-hover:scale-105 transition-transform border">
                      📦
                    </div>
                    <p className="text-xs font-medium text-gray-700 text-center line-clamp-2 leading-tight min-h-[2rem]">
                      {product.product_name}
                    </p>
                    {product.sku?.sku_code && (
                      <p className="text-[9px] text-gray-400 font-mono mt-0.5">
                        {product.sku.sku_code}
                      </p>
                    )}
                    <p className="text-xs font-bold text-primary mt-1">
                      {formatCurrency(product.selling_price)}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 py-2 border-t text-sm text-gray-500">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="font-medium">
                {currentPage}/{totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* ── Checkout Button ── */}
          <div className="p-3 border-t">
            <Button
              className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-lg shadow-primary/30 transition-all duration-200 active:scale-[0.98]"
              disabled={activeTab.cartItems.length === 0 || isCheckingOut}
              onClick={handleCheckout}
            >
              {isCheckingOut ? (
                <>
                  <Loader2 size={18} className="animate-spin mr-2" />
                  ĐANG XỬ LÝ...
                </>
              ) : (
                "THANH TOÁN"
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* ── Add Customer Modal ── */}
      <AddCustomerModal
        isOpen={showAddCustomer}
        onClose={() => setShowAddCustomer(false)}
        onCustomerAdded={(customer) => {
          updateActiveTab({
            selectedCustomer: {
              id: customer.pk_customer_id,
              name: customer.full_name,
              phone: customer.phone_number,
            },
            searchCustomer: "",
          });
        }}
      />
    </>
  );
}
