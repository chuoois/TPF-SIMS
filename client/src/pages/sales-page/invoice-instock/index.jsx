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

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { PrintableInvoice } from "../orders/components/PrintableInvoice";
import { PageHelmet } from "@/components/seo/PageHelmet";
import AddCustomerModal from "@/pages/sales-page/components/AddCustomerModal";
import CartPanel from "./CartPanel";
import ProductPanel from "./ProductPanel";
import {
  WOOD_PRODUCTS,
  GIFT_PRODUCTS,
  MOCK_CUSTOMERS,
  ITEMS_PER_PAGE,
  SYSTEM_WARRANTY,
  createEmptyTab,
} from "./mockData";

// ===================== COMPONENT =====================
export default function InStockInvoicePage() {
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

  const [tabs, setTabs] = useState([
    {
      id: 1,
      cartItems: [],
      selectedCustomer: null,
      orderNote: "",
      discount: 0,
      depositAmount: 0,
      deliveryMethod: "store",
      deliveryDate: "",
      storePickupDate: "",
    },
  ]);
  const [activeTabId, setActiveTabId] = useState(1);
  const [productTypeTab, setProductTypeTab] = useState("Hàng mộc");

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedProductTypes, setSelectedProductTypes] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [customerSearch, setCustomerSearch] = useState("");
  const [productSearch, setProductSearch] = useState(""); // Thêm state tìm kiếm sản phẩm

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  const updateActiveTab = useCallback(
    (updates) => {
      setTabs((prev) =>
        prev.map((t) => (t.id === activeTabId ? { ...t, ...updates } : t)),
      );
    },
    [activeTabId],
  );

  const filteredProducts = useMemo(() => {
    const source =
      productTypeTab === "Quà tặng" ? GIFT_PRODUCTS : WOOD_PRODUCTS;
    return source.filter((p) => {
      const matchType =
        productTypeTab === "Quà tặng" ? true : p.productType === productTypeTab;
      const matchCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(p.category);

      const pNameLower = p.name.toLowerCase();
      let pType = "Khác";
      if (pNameLower.includes("bàn") || pNameLower.includes("tab"))
        pType = "Bàn";
      else if (
        pNameLower.includes("ghế") ||
        pNameLower.includes("sofa") ||
        pNameLower.includes("đôn")
      )
        pType = "Ghế";
      else if (
        pNameLower.includes("tủ") ||
        pNameLower.includes("kệ") ||
        pNameLower.includes("hộc") ||
        pNameLower.includes("giá")
      )
        pType = "Tủ";
      else if (pNameLower.includes("giường")) pType = "Giường";

      const matchProductType =
        selectedProductTypes.length === 0 ||
        selectedProductTypes.includes(pType);

      const minP = parseInt(priceRange.min);
      const maxP = parseInt(priceRange.max);
      const matchPrice =
        (isNaN(minP) || p.price >= minP) && (isNaN(maxP) || p.price <= maxP);

      // Lọc theo từ khóa tìm kiếm
      const matchSearch =
        !productSearch.trim() ||
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.sku.toLowerCase().includes(productSearch.toLowerCase());

      return (
        matchType &&
        matchCategory &&
        matchProductType &&
        matchPrice &&
        matchSearch
      );
    });
  }, [
    productTypeTab,
    selectedCategories,
    selectedProductTypes,
    priceRange,
    productSearch,
  ]);

  const customerResults = useMemo(() => {
    if (!customerSearch.trim()) return [];
    const q = customerSearch.toLowerCase();
    return MOCK_CUSTOMERS.filter(
      (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q),
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
    const cartItemId = product.id;

    const existing = activeTab.cartItems.find((i) => i.id === cartItemId);
    if (existing) {
      if (existing.quantity >= product.stock) {
        toast.error(`"${product.name}" đã hết hàng trong kho`);
        return;
      }
      updateActiveTab({
        cartItems: activeTab.cartItems.map((i) =>
          i.id === cartItemId ? { ...i, quantity: i.quantity + 1 } : i,
        ),
      });
    } else {
      if (product.stock <= 0) {
        toast.error(`"${product.name}" đã hết hàng`);
        return;
      }
      const isGift = productTypeTab === "Quà tặng";
      updateActiveTab({
        cartItems: [
          ...activeTab.cartItems,
          {
            id: cartItemId,
            name: product.name,
            price: isGift ? 0 : product.price,
            stock: product.stock,
            sku: product.sku,
            quantity: 1,
            note: "",
            productType: product.productType,
            images: product.productType === "Hàng mộc" ? [] : null,
            isGift,
            leadTime: product.leadTime || 0,
            warrantyMonths: product.warrantyMonths || 12,
            warrantyContent:
              product.warrantyContent || "Bảo hành các lỗi kỹ thuật.",
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
            toast.error(`Tồn kho chỉ còn ${i.stock}`);
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
      toast.error(`Tồn kho chỉ còn ${item.stock}`);
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

  const updateItemPrices = (id, field, value) => {
    const raw = value.replace(/\D/g, "");
    const numVal = parseInt(raw) || 0;
    updateActiveTab({
      cartItems: activeTab.cartItems.map((i) =>
        i.id === id
          ? {
              ...i,
              [field]: numVal,
              // Cập nhật price = discountPrice để tính tổng đúng
              ...(field === "discountPrice" ? { price: numVal } : {}),
            }
          : i,
      ),
    });
  };

  // Bảo hành do hệ thống cấu hình, không cho sales chỉnh

  const updateItemImages = (id, newImages) => {
    updateActiveTab({
      cartItems: activeTab.cartItems.map((i) =>
        i.id === id ? { ...i, images: [...(i.images || []), ...newImages] } : i,
      ),
    });
  };

  const removeItemImage = (itemId, imgIdx) => {
    updateActiveTab({
      cartItems: activeTab.cartItems.map((i) =>
        i.id === itemId
          ? { ...i, images: i.images.filter((_, idx) => idx !== imgIdx) }
          : i,
      ),
    });
  };

  const subtotal = activeTab.cartItems.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0,
  );

  const maxLeadTime = useMemo(() => {
    return activeTab.cartItems.reduce((max, item) => {
      const lt = item.priceMode === "raw" ? 0 : item.leadTime || 0;
      return Math.max(max, lt);
    }, 0);
  }, [activeTab.cartItems]);

  const workshopStats = useMemo(() => {
    try {
      const stored = localStorage.getItem("tpf_simulated_orders");
      if (!stored) return { count: 0, level: "Bình thường", buffer: 0 };
      const orders = JSON.parse(stored);
      // Đếm các đơn đang chờ gia công hoặc đang gia công
      const activeProduction = orders.filter(
        (o) =>
          (o.status === "Đang gia công" || o.status === "Chờ xử lý") &&
          (o.type === "Hàng mộc" || o.type === "Hàng khách đặt"),
      );
      const count = activeProduction.length;
      if (count > 8)
        return {
          count,
          level: "Quá tải",
          buffer: 7,
          color: "text-red-600",
          bg: "bg-red-50",
          border: "border-red-200",
        };
      if (count > 4)
        return {
          count,
          level: "Khá bận",
          buffer: 3,
          color: "text-amber-600",
          bg: "bg-amber-50",
          border: "border-amber-200",
        };
      return {
        count,
        level: "Bình thường",
        buffer: 0,
        color: "text-green-600",
        bg: "bg-green-50",
        border: "border-green-200",
      };
    } catch (e) {
      return { count: 0, level: "Bình thường", buffer: 0 };
    }
  }, [activeTab.cartItems]);

  const needsWorkshop = useMemo(() => {
    return activeTab.cartItems.some((item) => {
      if (item.priceMode === "raw") return false;
      return (
        item.productType === "Hàng mộc" ||
        item.productType === "Hàng khách đặt" ||
        (item.leadTime && item.leadTime > 0)
      );
    });
  }, [activeTab.cartItems]);

  const expectedReadyDate = useMemo(() => {
    if (!needsWorkshop || maxLeadTime === 0) return null;
    const totalDays = maxLeadTime + workshopStats.buffer;
    const d = new Date();
    d.setDate(d.getDate() + totalDays);
    return d.toISOString().split("T")[0];
  }, [maxLeadTime, workshopStats.buffer, needsWorkshop]);

  const totalPayable = Math.max(
    0,
    subtotal - activeTab.discount - activeTab.depositAmount,
  );
  const itemCount = activeTab.cartItems.reduce((sum, i) => sum + i.quantity, 0);

  const handleCheckout = () => {
    if (activeTab.cartItems.length === 0) return;

    if (!activeTab.selectedCustomer) {
      toast.error("Vui lòng nhập hoặc chọn Khách hàng trước khi thanh toán!");
      return;
    }

    // Validate: giao tận nơi nhưng chưa chọn ngày giao
    if (activeTab.deliveryMethod === "delivery" && !activeTab.deliveryDate) {
      toast.error("Vui lòng chọn ngày giao hàng!");
      return;
    }

    const newOrder = {
      code: "HD-" + Math.floor(Math.random() * 1000000),
      customer: {
        name: activeTab.selectedCustomer?.name,
        phone: activeTab.selectedCustomer?.phone || "",
        address: activeTab.selectedCustomer?.address || "",
      },
      type: activeTab.cartItems.some((i) => i.productType === "Hàng mộc")
        ? "Hàng mộc"
        : "Hàng sẵn",
      salesPerson: "Nhân viên bán hàng",
      products: activeTab.cartItems.map((item) => ({
        name: item.name,
        material: item.category || "Hàng trưng bày",
        size: "",
        qty: item.quantity,
        price: item.price,
        warranty: item.isGift
          ? "Không bảo hành"
          : `${item.warrantyMonths || 12} tháng`,
        note: item.note || "",
        images: item.images || [],
        leadTime: item.leadTime || 0,
      })),
      total: totalPayable,
      subtotal: subtotal,
      discount: activeTab.discount,
      deposit: activeTab.depositAmount,
      leadTime: maxLeadTime,
      expectedReadyDate: expectedReadyDate,
      deliveryMethod: activeTab.deliveryMethod,
      // Hẹn ngày lấy hoặc lấy luôn (Hôm nay)
      deliveryDate:
        activeTab.deliveryMethod === "store"
          ? activeTab.storePickupDate || new Date().toISOString().split("T")[0]
          : activeTab.deliveryDate,
      storePickupDate:
        activeTab.deliveryMethod === "store"
          ? activeTab.storePickupDate || null
          : null,
      date: new Date().toISOString(),
    };

    const warranties = JSON.parse(
      localStorage.getItem("tpf_simulated_warranties") || "[]",
    );

    const newWarranties = activeTab.cartItems
      .filter((item) => !item.isGift && item.warrantyMonths)
      .map((item, idx) => {
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + (item.warrantyMonths || 12));

        return {
          id: `BH-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000000)}`,
          orderId: newOrder.code,
          customerName: newOrder.customer.name,
          phone: newOrder.customer.phone,
          productCode: item.sku,
          productName: item.name,
          serial: `${item.sku}-${Date.now().toString().slice(-4)}${idx}`,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          warrantyMonths: item.warrantyMonths || 12,
          status: "Còn hạn",
          maintenanceHistory: [],
          notes: item.warrantyContent || "Bảo hành các lỗi kỹ thuật.",
        };
      });

    if (newWarranties.length > 0) {
      localStorage.setItem(
        "tpf_simulated_warranties",
        JSON.stringify([...warranties, ...newWarranties]),
      );
    }

    toast.success(`Tạo yêu cầu ${newOrder.code} thành công!`);
    setPrintingOrder(newOrder);

    updateActiveTab({
      cartItems: [],
      selectedCustomer: null,
      orderNote: "",
      discount: 0,
      depositAmount: 0,
      deliveryMethod: "store",
      deliveryDate: "",
      storePickupDate: "",
    });
  };

  // ===================== RENDER =====================
  return (
    <>
      <PageHelmet title="Bán hàng có sẵn - TPF-SIMS" />

      <div
        className="flex h-full gap-4 -m-4 p-4"
        style={{ backgroundColor: "var(--bg-main)" }}
      >
        {/* ═══════════════ LEFT PANEL – CART ═══════════════ */}
        <CartPanel
          tabs={tabs}
          activeTabId={activeTabId}
          activeTab={activeTab}
          setActiveTabId={setActiveTabId}
          addTab={addTab}
          closeTab={closeTab}
          updateQuantity={updateQuantity}
          removeFromCart={removeFromCart}
          setQuantity={setQuantity}
          updateItemNote={updateItemNote}
          updateItemImages={updateItemImages}
          removeItemImage={removeItemImage}
          customerSearch={customerSearch}
          setCustomerSearch={setCustomerSearch}
          customerResults={customerResults}
          updateActiveTab={updateActiveTab}
          setShowAddCustomer={setShowAddCustomer}
          needsWorkshop={needsWorkshop}
          maxLeadTime={maxLeadTime}
          workshopStats={workshopStats}
          expectedReadyDate={expectedReadyDate}
          subtotal={subtotal}
          itemCount={itemCount}
          totalPayable={totalPayable}
          handleCheckout={handleCheckout}
        />

        {/* ═══════════════ RIGHT PANEL – PRODUCTS ═══════════════ */}
        <ProductPanel
          productTypeTab={productTypeTab}
          setProductTypeTab={setProductTypeTab}
          productSearch={productSearch}
          setProductSearch={setProductSearch}
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          selectedProductTypes={selectedProductTypes}
          setSelectedProductTypes={setSelectedProductTypes}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          paginatedProducts={paginatedProducts}
          addToCart={addToCart}
        />
      </div>

      <AddCustomerModal
        isOpen={showAddCustomer}
        onClose={() => setShowAddCustomer(false)}
        onCustomerAdded={(customer) => {
          updateActiveTab({
            selectedCustomer: {
              id: customer.pk_customer_id,
              name: customer.full_name,
              phone: customer.phone_number,
              address: customer.address || "",
            },
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
