/**
 * Component InStockInvoicePage
 * Tạo hóa đơn cho hàng có sẵn – Kiểu POS bán nhanh
 * - Hỗ trợ nhiều tab hóa đơn (mỗi tab có giỏ hàng riêng)
 * - Layout 2 cột: Giỏ hàng (trái) + Danh mục sản phẩm (phải)
 * - Tìm kiếm sản phẩm, thêm vào giỏ, chỉnh SL, xoá
 * - Tìm khách hàng, ghi chú đơn hàng
 * - Tính tổng tiền tự động
 *
 * Created By: DNC
 * Created Date: 25/02/2026
 */

import { useState, useMemo, useCallback } from "react";
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
} from "lucide-react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AddCustomerModal from "@/pages/sales-page/components/AddCustomerModal";

// ===================== MOCK DATA =====================
const MOCK_PRODUCTS = [
  { id: "p1", name: "Quầy tiếp tân Mộc Thành", price: 6500000, image: "🪑" },
  { id: "p2", name: "Bàn giám đốc gỗ sồi", price: 8900000, image: "🪵" },
  { id: "p3", name: "Ghế xoay trắng Trình Thiên", price: 1389500, image: "💺" },
  { id: "p4", name: "Ghế xoay đỏ Trình Thiên", price: 1389500, image: "💺" },
  { id: "p5", name: "Bàn ghế cafe sân vườn", price: 1750000, image: "☕" },
  { id: "p6", name: "Bàn ghế gỗ đầu màu vàng", price: 500000, image: "🪑" },
  { id: "p7", name: "Ghế quầy bar cao cấp", price: 599000, image: "🍸" },
  { id: "p8", name: "Bộ bàn ăn 6 ghế", price: 6000000, image: "🍽️" },
  { id: "p9", name: "Tủ bếp gỗ sồi Alaska", price: 2500000, image: "🏠" },
  { id: "p10", name: "Kệ xoong nồi inox", price: 450000, image: "🍳" },
  { id: "p11", name: "Sofa góc phòng khách", price: 3450000, image: "🛋️" },
  { id: "p12", name: "Vách ngăn phòng khách", price: 2200000, image: "🚪" },
  { id: "p13", name: "Tủ rượu Alaska gỗ óc chó", price: 4200000, image: "🍷" },
  { id: "p14", name: "Bộ bàn ghế gỗ hương đẹp", price: 28500000, image: "🪑" },
  { id: "p15", name: "Kệ tủ bếp nhôm kính", price: 1200000, image: "🏠" },
  { id: "p16", name: "Chậu rửa chén Roland", price: 2040000, image: "🚰" },
  { id: "p17", name: "Bộ bàn ghế chữ nhật", price: 480000, image: "📐" },
  {
    id: "p18",
    name: "Bộ bàn ghế cafe ngoài trời",
    price: 1350000,
    image: "☀️",
  },
  { id: "p19", name: "Ghế đơn hình bàn tay", price: 2800000, image: "✋" },
  { id: "p20", name: "Bộ drop ga gối lụa tơ tằm", price: 4500000, image: "🛏️" },
];

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

  // ---- Tab management ----
  const addTab = () => {
    const newTab = createEmptyTab();
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
  };

  const closeTab = (tabId, e) => {
    e.stopPropagation();
    if (tabs.length <= 1) return; // Phải giữ ít nhất 1 tab
    setTabs((prev) => {
      const filtered = prev.filter((t) => t.id !== tabId);
      if (activeTabId === tabId) {
        setActiveTabId(filtered[filtered.length - 1].id);
      }
      return filtered;
    });
  };

  // ---- Filter products ----
  const filteredProducts = useMemo(() => {
    if (!searchProduct.trim()) return MOCK_PRODUCTS;
    const q = searchProduct.toLowerCase();
    return MOCK_PRODUCTS.filter((p) => p.name.toLowerCase().includes(q));
  }, [searchProduct]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // ---- Cart actions (operate on active tab) ----
  const addToCart = (product) => {
    const existing = activeTab.cartItems.find((i) => i.id === product.id);
    if (existing) {
      updateActiveTab({
        cartItems: activeTab.cartItems.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
        ),
      });
    } else {
      updateActiveTab({
        cartItems: [...activeTab.cartItems, { ...product, quantity: 1 }],
      });
    }
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
    (sum, i) => sum + i.price * i.quantity,
    0,
  );
  const totalPayable = Math.max(0, subtotal - activeTab.discount);

  // ===================== RENDER =====================
  return (
    <>
      <PageHelmet title="Bán hàng có sẵn - TPF-SIMS" />
      <div className="flex h-[calc(100vh-64px)] bg-gray-100 -m-6">
        {/* ═══════════════ CỘT TRÁI – GIỎ HÀNG ═══════════════ */}
        <div className="flex flex-col w-[58%] border-r bg-white">
          {/* ── Header: Search + Invoice Tabs ── */}
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white">
            <div className="flex items-center gap-2 shrink-0">
              <Search size={16} />
              <input
                type="text"
                placeholder="Tìm hàng hóa (F3)"
                value={searchProduct}
                onChange={(e) => {
                  setSearchProduct(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-white/20 backdrop-blur-sm text-white placeholder-white/70 rounded-md px-3 py-1.5 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-white/40"
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
                      className="hover:bg-blue-50/30 transition-colors"
                    >
                      <td className="p-3 text-xs text-gray-400 font-medium">
                        {idx + 1}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{item.image}</span>
                          <div>
                            <p className="text-sm font-semibold text-gray-800 line-clamp-1">
                              {item.name}
                            </p>
                            <p className="text-[10px] text-gray-400 font-mono">
                              SKU-{item.id.toUpperCase()}
                            </p>
                          </div>
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
                            className="w-12 h-7 text-center text-sm font-semibold border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                      <td className="p-3 text-right text-sm font-bold text-blue-600">
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
                  className="w-28 text-right text-sm font-semibold border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <div className="flex justify-between text-base font-bold pt-1 border-t">
                <span className="text-gray-800">Khách cần trả</span>
                <span className="text-blue-600 text-lg">
                  {formatCurrency(totalPayable)}
                </span>
              </div>
            </div>
          </div>

          {/* ── Bottom Tabs ── */}
          <div className="flex border-t bg-gray-50">
            <button className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold text-blue-600 border-b-2 border-blue-600 bg-white">
              🛒 Bán thường
            </button>
            <button
              onClick={() => navigate("/sales/dashboard/invoice-custom-order")}
              className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium text-gray-500 hover:bg-gray-100 transition"
            >
              🚚 Bán giao hàng
            </button>
          </div>
        </div>

        {/* ═══════════════ CỘT PHẢI – SẢN PHẨM ═══════════════ */}
        <div className="flex flex-col w-[42%] bg-white">
          {/* ── Customer Search ── */}
          <div className="flex items-center gap-2 px-4 py-3 border-b">
            <Search size={16} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Tìm khách hàng (F4)"
              value={activeTab.searchCustomer}
              onChange={(e) =>
                updateActiveTab({ searchCustomer: e.target.value })
              }
              className="flex-1 text-sm text-gray-600 focus:outline-none placeholder-gray-400"
            />
            <button
              onClick={() => setShowAddCustomer(true)}
              className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition border border-blue-200"
              title="Thêm khách hàng mới"
            >
              <UserPlus size={14} />
            </button>
          </div>

          {activeTab.selectedCustomer && (
            <div className="px-4 py-2 bg-blue-50 border-b flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-700">
                  {activeTab.selectedCustomer.name}
                </p>
                <p className="text-xs text-blue-500">
                  {activeTab.selectedCustomer.phone}
                </p>
              </div>
              <button
                onClick={() => updateActiveTab({ selectedCustomer: null })}
                className="text-blue-400 hover:text-blue-600"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* ── Product Grid ── */}
          <div className="flex-1 overflow-y-auto p-3">
            {paginatedProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-300">
                <Package size={48} strokeWidth={1} />
                <p className="mt-3 text-sm">Không tìm thấy sản phẩm</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {paginatedProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="group flex flex-col items-center p-3 rounded-lg border border-gray-100 hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-md transition-all duration-200 text-left cursor-pointer"
                  >
                    <div className="w-16 h-16 rounded-lg bg-gray-50 flex items-center justify-center text-3xl mb-2 group-hover:scale-105 transition-transform border">
                      {product.image}
                    </div>
                    <p className="text-xs font-medium text-gray-700 text-center line-clamp-2 leading-tight min-h-[2rem]">
                      {product.name}
                    </p>
                    <p className="text-xs font-bold text-blue-600 mt-1">
                      {formatCurrency(product.price)}
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
              className="w-full h-12 text-base font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg shadow-blue-600/30 transition-all duration-200 active:scale-[0.98]"
              disabled={activeTab.cartItems.length === 0}
            >
              THANH TOÁN
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
