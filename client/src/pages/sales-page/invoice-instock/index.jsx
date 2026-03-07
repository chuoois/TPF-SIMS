/**
 * Component InStockInvoicePage
 * POS-style invoice for in-stock wood products
 *
 * Layout: 2-column split — Cart (left) + Product Catalog (right)
 * Features: Multi-tab invoices, search, category filter, quantity controls
 *
 * Created By: DNC
 * Created Date: 25/02/2026
 */

import { useState, useMemo, useCallback, useRef } from "react";
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
  CheckCircle2,
  AlertCircle,
  User,
  Receipt,
  Filter,
} from "lucide-react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import { Button } from "@/components/ui/button";
import AddCustomerModal from "@/pages/sales-page/components/AddCustomerModal";

// ===================== STATIC DATA =====================
const WOOD_PRODUCTS = [
  {
    id: 1,
    name: "Bộ bàn ăn gỗ sồi 4 ghế",
    sku: "BA-SOI-4G",
    price: 12500000,
    stock: 8,
    image: "/wood_products.png",
    category: "Phòng ăn",
  },
  {
    id: 2,
    name: "Kệ sách gỗ óc chó 5 tầng",
    sku: "KS-OC-5T",
    price: 8900000,
    stock: 5,
    image: "/wood_products.png",
    category: "Phòng làm việc",
  },
  {
    id: 3,
    name: "Bàn làm việc gỗ sồi 3 ngăn",
    sku: "BLV-SOI-3N",
    price: 7200000,
    stock: 12,
    image: "/wood_products.png",
    category: "Phòng làm việc",
  },
  {
    id: 4,
    name: "Tủ đựng đồ gỗ óc chó",
    sku: "TDD-OC-01",
    price: 9800000,
    stock: 3,
    image: "/wood_products.png",
    category: "Phòng ngủ",
  },
  {
    id: 5,
    name: "Ghế ăn gỗ sồi tự nhiên",
    sku: "GA-SOI-TN",
    price: 1850000,
    stock: 25,
    image: "/wood_products.png",
    category: "Phòng ăn",
  },
  {
    id: 6,
    name: "Bàn trà gỗ tần bì",
    sku: "BT-TB-01",
    price: 4500000,
    stock: 10,
    image: "/wood_products.png",
    category: "Phòng khách",
  },
  {
    id: 7,
    name: "Kệ TV gỗ óc chó 1m8",
    sku: "KTV-OC-18",
    price: 11200000,
    stock: 4,
    image: "/wood_products.png",
    category: "Phòng khách",
  },
  {
    id: 8,
    name: "Giường ngủ gỗ sồi 1m6",
    sku: "GN-SOI-16",
    price: 15800000,
    stock: 6,
    image: "/wood_products.png",
    category: "Phòng ngủ",
  },
  {
    id: 9,
    name: "Tủ quần áo 3 cánh gỗ sồi",
    sku: "TQA-SOI-3C",
    price: 18500000,
    stock: 2,
    image: "/wood_products.png",
    category: "Phòng ngủ",
  },
  {
    id: 10,
    name: "Bàn ăn gỗ tần bì 6 ghế",
    sku: "BA-TB-6G",
    price: 16200000,
    stock: 0,
    image: "/wood_products.png",
    category: "Phòng ăn",
  },
  {
    id: 11,
    name: "Ghế bar gỗ cao su",
    sku: "GB-CS-01",
    price: 1200000,
    stock: 18,
    image: "/wood_products.png",
    category: "Phòng ăn",
  },
  {
    id: 12,
    name: "Bàn console gỗ óc chó",
    sku: "BC-OC-01",
    price: 6800000,
    stock: 7,
    image: "/wood_products.png",
    category: "Phòng khách",
  },
  {
    id: 13,
    name: "Sofa da thật góc L chữ U",
    sku: "SF-DA-13",
    price: 25000000,
    stock: 3,
    image: "/wood_products.png",
    category: "Phòng khách",
  },
  {
    id: 14,
    name: "Bàn trà đôi mặt kính khung sắt",
    sku: "BT-K-14",
    price: 3200000,
    stock: 15,
    image: "/wood_products.png",
    category: "Phòng khách",
  },
  {
    id: 15,
    name: "Kệ TV treo tường tối giản",
    sku: "KTV-TT-15",
    price: 4100000,
    stock: 20,
    image: "/wood_products.png",
    category: "Phòng khách",
  },
  {
    id: 16,
    name: "Tủ giày thông minh 3 tầng",
    sku: "TG-TM-16",
    price: 2800000,
    stock: 12,
    image: "/wood_products.png",
    category: "Phòng khách",
  },
  {
    id: 17,
    name: "Ghế đôn sofa bọc nhung",
    sku: "GD-BN-17",
    price: 850000,
    stock: 30,
    image: "/wood_products.png",
    category: "Phòng khách",
  },
  {
    id: 18,
    name: "Vách ngăn phòng khách cnc",
    sku: "VN-CNC-18",
    price: 5600000,
    stock: 5,
    image: "/wood_products.png",
    category: "Phòng khách",
  },

  // Phòng ngủ
  {
    id: 19,
    name: "Giường bọc da đầu giường cao",
    sku: "GBD-19",
    price: 18500000,
    stock: 4,
    image: "/wood_products.png",
    category: "Phòng ngủ",
  },
  {
    id: 20,
    name: "Tủ quần áo cánh lùa kính đen",
    sku: "TQA-L-20",
    price: 21000000,
    stock: 2,
    image: "/wood_products.png",
    category: "Phòng ngủ",
  },
  {
    id: 21,
    name: "Bàn trang điểm gương LED",
    sku: "BTD-LED-21",
    price: 5400000,
    stock: 8,
    image: "/wood_products.png",
    category: "Phòng ngủ",
  },
  {
    id: 22,
    name: "Tab đầu giường gỗ tự nhiên",
    sku: "TDG-TN-22",
    price: 1200000,
    stock: 25,
    image: "/wood_products.png",
    category: "Phòng ngủ",
  },
  {
    id: 23,
    name: "Giường tầng trẻ em gỗ thông",
    sku: "GT-TE-23",
    price: 9500000,
    stock: 6,
    image: "/wood_products.png",
    category: "Phòng ngủ",
  },
  {
    id: 24,
    name: "Ghế thư giãn đọc sách kèm đôn",
    sku: "GTG-24",
    price: 6200000,
    stock: 10,
    image: "/wood_products.png",
    category: "Phòng ngủ",
  },
  {
    id: 25,
    name: "Tủ ngăn kéo để đồ mini",
    sku: "TNK-25",
    price: 3100000,
    stock: 14,
    image: "/wood_products.png",
    category: "Phòng ngủ",
  },
  {
    id: 26,
    name: "Giá treo quần áo khung thép",
    sku: "GTQA-26",
    price: 950000,
    stock: 40,
    image: "/wood_products.png",
    category: "Phòng ngủ",
  },

  // Phòng ăn
  {
    id: 27,
    name: "Bộ bàn ăn mặt đá ceramic",
    sku: "BCC-27",
    price: 17800000,
    stock: 5,
    image: "/wood_products.png",
    category: "Phòng ăn",
  },
  {
    id: 28,
    name: "Tủ lạnh âm tủ đa năng",
    sku: "TCA-28",
    price: 12500000,
    stock: 3,
    image: "/wood_products.png",
    category: "Phòng ăn",
  },
  {
    id: 29,
    name: "Tủ bếp acrylic bóng gương",
    sku: "TBAC-29",
    price: 28000000,
    stock: 1,
    image: "/wood_products.png",
    category: "Phòng ăn",
  },
  {
    id: 30,
    name: "Ghế ăn bọc da PU cao cấp",
    sku: "GAAP-30",
    price: 1450000,
    stock: 50,
    image: "/wood_products.png",
    category: "Phòng ăn",
  },
  {
    id: 31,
    name: "Đảo bếp di động mặt gỗ",
    sku: "DB-31",
    price: 8900000,
    stock: 7,
    image: "/wood_products.png",
    category: "Phòng ăn",
  },
  {
    id: 32,
    name: "Kệ để rượu treo tường",
    sku: "KDR-32",
    price: 2100000,
    stock: 18,
    image: "/wood_products.png",
    category: "Phòng ăn",
  },
  {
    id: 33,
    name: "Bàn ăn tròn xoay thông minh",
    sku: "BAT-33",
    price: 15600000,
    stock: 4,
    image: "/wood_products.png",
    category: "Phòng ăn",
  },

  // Phòng làm việc
  {
    id: 34,
    name: "Ghế công thái học Ergonomic",
    sku: "GCTH-34",
    price: 4500000,
    stock: 22,
    image: "/wood_products.png",
    category: "Phòng làm việc",
  },
  {
    id: 35,
    name: "Bàn nâng hạ chiều cao điện",
    sku: "BNH-35",
    price: 8200000,
    stock: 9,
    image: "/wood_products.png",
    category: "Phòng làm việc",
  },
  {
    id: 36,
    name: "Tủ hồ sơ văn phòng 2 cánh",
    sku: "THS-36",
    price: 3600000,
    stock: 16,
    image: "/wood_products.png",
    category: "Phòng làm việc",
  },
  {
    id: 37,
    name: "Kệ máy in để bàn",
    sku: "KMI-37",
    price: 650000,
    stock: 35,
    image: "/wood_products.png",
    category: "Phòng làm việc",
  },
  {
    id: 38,
    name: "Ghế xoay lưới văn phòng",
    sku: "GXV-38",
    price: 1850000,
    stock: 45,
    image: "/wood_products.png",
    category: "Phòng làm việc",
  },
  {
    id: 39,
    name: "Hộc tủ di động 3 ngăn kéo",
    sku: "HT-39",
    price: 1550000,
    stock: 28,
    image: "/wood_products.png",
    category: "Phòng làm việc",
  },
  {
    id: 40,
    name: "Bàn họp chân sắt chữ U",
    sku: "BHC-40",
    price: 9800000,
    stock: 5,
    image: "/wood_products.png",
    category: "Phòng làm việc",
  },
];

const ITEMS_PER_PAGE = 15;
const CATEGORIES = ["Phòng khách", "Phòng ngủ", "Phòng ăn", "Phòng làm việc"];

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

const fmt = (v) => new Intl.NumberFormat("vi-VN").format(v);

let tabIdCounter = 1;
const createEmptyTab = () => ({
  id: ++tabIdCounter,
  cartItems: [],
  selectedCustomer: null,
  orderNote: "",
  discount: 0,
});

// ===================== COMPONENT =====================
export default function InStockInvoicePage() {
  const navigate = useNavigate();

  const [tabs, setTabs] = useState([
    {
      id: 1,
      cartItems: [],
      selectedCustomer: null,
      orderNote: "",
      discount: 0,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState(1);
  const [searchProduct, setSearchProduct] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const customerSearchRef = useRef(null);

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

  const filteredProducts = useMemo(() => {
    return WOOD_PRODUCTS.filter((p) => {
      const matchSearch =
        !searchProduct ||
        p.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchProduct.toLowerCase());
      const matchCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(p.category);
      return matchSearch && matchCategory;
    });
  }, [searchProduct, selectedCategories]);

  const customerResults = useMemo(() => {
    if (!customerSearch.trim()) return [];
    const q = customerSearch.toLowerCase();
    return MOCK_CUSTOMERS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.phone.includes(q),
    );
  }, [customerSearch]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

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
      if (activeTabId === tabId)
        setActiveTabId(filtered[filtered.length - 1].id);
      return filtered;
    });
  };

  const addToCart = (product) => {
    const existing = activeTab.cartItems.find((i) => i.id === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) {
        showToast("error", `"${product.name}" đã hết hàng trong kho`);
        return;
      }
      updateActiveTab({
        cartItems: activeTab.cartItems.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
        ),
      });
    } else {
      if (product.stock <= 0) {
        showToast("error", `"${product.name}" đã hết hàng`);
        return;
      }
      updateActiveTab({
        cartItems: [
          ...activeTab.cartItems,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            stock: product.stock,
            sku: product.sku,
            quantity: 1,
            note: "",
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
    if (val <= 0) return removeFromCart(id);
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
  };

  const updateItemNote = (id, note) => {
    updateActiveTab({
      cartItems: activeTab.cartItems.map((i) =>
        i.id === id ? { ...i, note } : i,
      ),
    });
  };

  const subtotal = activeTab.cartItems.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0,
  );
  const totalPayable = Math.max(0, subtotal - activeTab.discount);
  const itemCount = activeTab.cartItems.reduce((sum, i) => sum + i.quantity, 0);

  const handleCheckout = () => {
    if (activeTab.cartItems.length === 0) return;
    showToast("success", `Tạo hóa đơn thành công! Tổng: ${fmt(totalPayable)}đ`);
    updateActiveTab({
      cartItems: [],
      selectedCustomer: null,
      orderNote: "",
      discount: 0,
    });
  };

  // ===================== RENDER =====================
  return (
    <>
      <PageHelmet title="Bán hàng có sẵn - TPF-SIMS" />

      {/* ── Toast ── */}
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
        {/* ═══════════════ LEFT PANEL – CART ═══════════════ */}
        <div
          className="flex flex-col w-[56%] bg-white rounded-2xl overflow-hidden"
          style={{
            boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
          }}
        >
          {/* ── Tab Bar ── */}
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
                <span>HĐ {idx + 1}</span>
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
              title="Thêm hóa đơn mới"
            >
              <Plus size={14} />
            </button>

            {/* Order type switch — pushed to right */}
            <div
              className="ml-auto flex rounded-lg overflow-hidden text-[12px] font-medium shrink-0"
              style={{ border: "1px solid var(--grid-border)" }}
            >
              <button
                className="flex items-center gap-1 px-3 py-1.5 cursor-pointer transition"
                style={{
                  backgroundColor: "var(--brand-primary)",
                  color: "#fff",
                }}
              >
                <PackageCheck size={12} /> Có sẵn
              </button>
              <button
                onClick={() =>
                  navigate("/sales/dashboard/invoice-custom-order")
                }
                className="flex items-center gap-1 px-3 py-1.5 cursor-pointer transition hover:bg-gray-50"
                style={{ color: "var(--text-secondary)" }}
              >
                <Hammer size={12} /> Đặt riêng
              </button>
            </div>
          </div>

          {/* ── Cart Content ── */}
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
                  <ShoppingCart size={32} strokeWidth={1.5} />
                </div>
                <p className="text-sm font-medium mt-2">Giỏ hàng trống</p>
                <p className="text-xs">Chọn sản phẩm từ danh mục bên phải</p>
              </div>
            ) : (
              <div
                className="divide-y"
                style={{ borderColor: "var(--grid-border)" }}
              >
                {activeTab.cartItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex flex-col px-4 py-3 group hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {/* Index */}
                      <span
                        className="text-xs font-medium w-5 text-center shrink-0"
                        style={{ color: "var(--text-placeholder)" }}
                      >
                        {idx + 1}
                      </span>

                      {/* Product info */}
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-[13px] font-semibold truncate"
                          style={{ color: "var(--text-main)" }}
                        >
                          {item.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className="text-[11px] font-mono"
                            style={{ color: "var(--text-placeholder)" }}
                          >
                            {item.sku}
                          </span>
                          <span
                            className="text-[11px]"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            × {fmt(item.price)}đ
                          </span>
                        </div>
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

                      {/* Subtotal */}
                      <span
                        className="text-[13px] font-bold w-24 text-right shrink-0"
                        style={{ color: "var(--brand-primary)" }}
                      >
                        {fmt(item.price * item.quantity)}đ
                      </span>

                      {/* Delete */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="w-7 h-7 rounded-lg items-center justify-center transition cursor-pointer opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 hidden group-hover:flex shrink-0"
                        style={{ color: "var(--text-placeholder)" }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {/* Item Note */}
                    <div className="mt-2 pl-11 flex items-center gap-2">
                      <Pencil
                        size={11}
                        style={{ color: "var(--text-placeholder)" }}
                        className="shrink-0"
                      />
                      <input
                        type="text"
                        placeholder="Ghi chú cho sản phẩm này..."
                        value={item.note || ""}
                        onChange={(e) =>
                          updateItemNote(item.id, e.target.value)
                        }
                        className="text-[12px] italic focus:outline-none bg-transparent w-full"
                        style={{ color: "var(--text-secondary)" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <div
            className="border-t"
            style={{ borderColor: "var(--grid-border)" }}
          >
            {/* Customer + Note row */}
            <div
              className="flex items-stretch divide-x"
              style={{ borderColor: "var(--grid-border)" }}
            >
              {/* Customer */}
              <div className="relative flex items-center gap-2 px-4 py-2.5 w-1/2" ref={customerSearchRef}>
                <User
                  size={14}
                  style={{ color: "var(--text-placeholder)" }}
                  className="shrink-0"
                />
                {activeTab.selectedCustomer ? (
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
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
                        updateActiveTab({ selectedCustomer: null });
                        setCustomerSearch("");
                      }}
                      className="cursor-pointer shrink-0 ml-auto"
                      style={{ color: "var(--text-placeholder)" }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
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
                      className="flex-1 text-[13px] focus:outline-none bg-transparent"
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
                    className="absolute left-0 bottom-full mb-1 w-full bg-white rounded-xl shadow-lg border overflow-hidden z-30"
                    style={{ borderColor: "var(--grid-border)" }}
                  >
                    {customerResults.length > 0 ? (
                      <div className="max-h-[200px] overflow-y-auto">
                        {customerResults.map((c) => (
                          <button
                            key={c.id}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              updateActiveTab({ selectedCustomer: c });
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

              {/* Note */}
              <div className="flex items-center gap-2 px-4 py-2.5 w-1/2">
                <Pencil
                  size={12}
                  style={{ color: "var(--text-placeholder)" }}
                  className="shrink-0"
                />
                <input
                  type="text"
                  placeholder="Ghi chú..."
                  value={activeTab.orderNote}
                  onChange={(e) =>
                    updateActiveTab({ orderNote: e.target.value })
                  }
                  className="flex-1 text-[13px] focus:outline-none bg-transparent"
                  style={{ color: "var(--text-secondary)" }}
                />
              </div>
            </div>

            {/* Summary */}
            <div
              className="px-4 py-3 space-y-2 border-t"
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
                    type="number"
                    value={activeTab.discount}
                    onChange={(e) =>
                      updateActiveTab({
                        discount: Math.max(0, parseInt(e.target.value) || 0),
                      })
                    }
                    className="w-24 text-right text-[13px] font-medium rounded-lg px-2 py-1 focus:outline-none focus:ring-1 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                  Tổng thanh toán
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
                onClick={handleCheckout}
              >
                Thanh toán
              </Button>
            </div>
          </div>
        </div>

        {/* ═══════════════ RIGHT PANEL – PRODUCTS ═══════════════ */}
        <div
          className="flex flex-col w-[44%] bg-white rounded-2xl overflow-hidden"
          style={{
            boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
          }}
        >
          {/* ── Search + Filter ── */}
          <div className="px-4 pt-4 pb-3 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative flex-1">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-placeholder)" }}
                />
                <input
                  type="text"
                  placeholder="Tìm sản phẩm..."
                  value={searchProduct}
                  onChange={(e) => {
                    setSearchProduct(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full h-10 pl-10 pr-4 rounded-xl text-[13px] focus:outline-none focus:ring-2 transition"
                  style={{
                    border: "1px solid var(--grid-border)",
                    backgroundColor: "var(--bg-main)",
                    color: "var(--text-main)",
                  }}
                />
              </div>

              {/* Filter Button */}
              <button
                onClick={() => setIsFilterDrawerOpen(true)}
                className="h-10 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all text-[13px] font-medium"
                style={{
                  border: "1px solid var(--grid-border)",
                  backgroundColor: "var(--bg-main)",
                  color: "var(--text-main)",
                }}
              >
                <Filter size={15} />
                <span>Lọc</span>
                {selectedCategories.length > 0 && (
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 ml-0.5 border-2 border-white"></span>
                )}
              </button>
            </div>

            {/* Active Filters */}
            {selectedCategories.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {selectedCategories.map((cat) => (
                  <span
                    key={cat}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-green-50 text-green-700 border border-green-200"
                  >
                    {cat}
                    <X
                      size={12}
                      className="cursor-pointer opacity-60 hover:opacity-100"
                      onClick={() => {
                        setSelectedCategories((prev) =>
                          prev.filter((c) => c !== cat),
                        );
                        setCurrentPage(1);
                      }}
                    />
                  </span>
                ))}
                <button
                  onClick={() => {
                    setSelectedCategories([]);
                    setCurrentPage(1);
                  }}
                  className="text-[11px] font-medium text-gray-400 hover:text-gray-600 ml-2"
                >
                  Xóa tất cả
                </button>
              </div>
            )}
          </div>

          {/* ── Product Grid ── */}
          <div className="flex-1 overflow-y-auto px-4 pb-3">
            {paginatedProducts.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center h-full gap-2"
                style={{ color: "var(--text-placeholder)" }}
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: "var(--bg-main)" }}
                >
                  <Package size={28} strokeWidth={1.5} />
                </div>
                <p className="text-sm font-medium">Không tìm thấy sản phẩm</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {paginatedProducts.map((product) => {
                  const outOfStock = product.stock <= 0;
                  const lowStock = product.stock > 0 && product.stock <= 5;

                  return (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product)}
                      disabled={outOfStock}
                      className={`group flex flex-col rounded-xl transition-all duration-200 text-left cursor-pointer relative overflow-hidden ${
                        outOfStock
                          ? "opacity-50 cursor-not-allowed grayscale"
                          : "hover:shadow-lg hover:shadow-gray-200/50 hover:-translate-y-0.5"
                      }`}
                      style={{ border: "1px solid var(--grid-border)" }}
                    >
                      {/* Stock badge */}
                      <div
                        className="absolute top-2 right-2 z-10 text-[10px] font-bold px-2 py-0.5 rounded-md"
                        style={{
                          backgroundColor: outOfStock
                            ? "#FEE2E2"
                            : lowStock
                              ? "#FEF3C7"
                              : "var(--status-focus)",
                          color: outOfStock
                            ? "var(--status-error)"
                            : lowStock
                              ? "var(--status-pending)"
                              : "var(--status-success)",
                        }}
                      >
                        {outOfStock ? "Hết hàng" : `Kho: ${product.stock}`}
                      </div>

                      {/* Image */}
                      <div className="aspect-square overflow-hidden bg-gray-50">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>

                      {/* Info */}
                      <div className="p-2.5 space-y-1">
                        <p
                          className="text-[12px] font-semibold line-clamp-2 leading-snug min-h-[2.25rem]"
                          style={{ color: "var(--text-main)" }}
                        >
                          {product.name}
                        </p>
                        <p
                          className="text-[10px] font-mono tracking-wide"
                          style={{ color: "var(--text-placeholder)" }}
                        >
                          {product.sku}
                        </p>
                        <p
                          className="text-[13px] font-bold"
                          style={{ color: "var(--brand-primary)" }}
                        >
                          {fmt(product.price)}đ
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div
              className="flex items-center justify-center gap-2 py-2.5 border-t"
              style={{ borderColor: "var(--grid-border)" }}
            >
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer hover:bg-gray-50"
                style={{
                  border: "1px solid var(--grid-border)",
                  color: "var(--text-secondary)",
                }}
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className="w-8 h-8 rounded-lg text-[12px] font-medium transition cursor-pointer"
                    style={{
                      backgroundColor:
                        currentPage === page
                          ? "var(--brand-primary)"
                          : "transparent",
                      color:
                        currentPage === page ? "#fff" : "var(--text-secondary)",
                    }}
                  >
                    {page}
                  </button>
                ),
              )}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer hover:bg-gray-50"
                style={{
                  border: "1px solid var(--grid-border)",
                  color: "var(--text-secondary)",
                }}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}
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
          });
        }}
      />

      {/* ── Filter Drawer ── */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px] transition-opacity"
            onClick={() => setIsFilterDrawerOpen(false)}
          />
          <div className="relative w-[320px] h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-[16px] font-bold text-gray-800 flex items-center gap-2">
                <Filter size={18} className="text-green-500" /> Lọc sản phẩm
              </h2>
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-100 text-gray-400 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              <div className="space-y-3">
                <label className="text-[13px] font-semibold text-gray-600 uppercase tracking-wider block">
                  Danh mục
                </label>
                <div className="flex flex-col gap-2">
                  {CATEGORIES.map((cat) => {
                    const isActive = selectedCategories.includes(cat);
                    return (
                      <label
                        key={cat}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-[13px] cursor-pointer transition select-none ${
                          isActive
                            ? "border-green-500 bg-green-50/50"
                            : "border-gray-200 hover:border-green-200 hover:bg-gray-50"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                            isActive
                              ? "bg-green-500 border-green-500 text-white"
                              : "border-gray-300 bg-white"
                          }`}
                        >
                          {isActive && (
                            <CheckCircle2 size={12} strokeWidth={3} />
                          )}
                        </div>
                        <span
                          className={`flex-1 ${isActive ? "font-medium text-green-700" : "text-gray-600"}`}
                        >
                          {cat}
                        </span>
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={isActive}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCategories((prev) => [...prev, cat]);
                            } else {
                              setSelectedCategories((prev) =>
                                prev.filter((c) => c !== cat),
                              );
                            }
                            setCurrentPage(1);
                          }}
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => {
                  setSelectedCategories([]);
                  setCurrentPage(1);
                }}
                className="flex-1 py-2.5 rounded-xl text-[13px] font-medium border cursor-pointer border-gray-200 text-gray-600 hover:bg-gray-50 transition"
              >
                Thiết lập lại
              </button>
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-[13px] cursor-pointer font-medium bg-green-500 text-white hover:bg-green-600 transition shadow-md shadow-green-500/20"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
