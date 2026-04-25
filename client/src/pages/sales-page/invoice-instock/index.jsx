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
import WorkshopStatusModal from "@/pages/sales-page/components/WorkshopStatusModal";
import CartPanel from "./CartPanel";
import ProductPanel from "./ProductPanel";
import productService from "@/services/product.service";
import productAttributeService from "@/services/productAttribute.service";
import customerService from "@/services/customer.service";
import {
  ITEMS_PER_PAGE,
  SYSTEM_WARRANTY,
  createEmptyTab,
  fmt,
} from "./mockData";

// ===================== COMPONENT =====================
export default function InStockInvoicePage() {
  const printRef = useRef(null);
  const [printingOrder, setPrintingOrder] = useState(null);
  const [showWorkshopStatus, setShowWorkshopStatus] = useState(false);


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
  const [productTypeTab, setProductTypeTab] = useState("Hàng sẵn"); // 1: Mộc, 2: Sẵn, 3: Quà tặng, 4: Custom

  const [metadata, setMetadata] = useState({
    categories: [],
    colors: [],
    materials: [],
    rooms: [],
  });
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerResults, setCustomerResults] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  const updateActiveTab = useCallback(
    (updates) => {
      setTabs((prev) =>
        prev.map((t) => (t.id === activeTabId ? { ...t, ...updates } : t)),
      );
    },
    [activeTabId],
  );

  // Fetch metadata
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const data = await productAttributeService.getAllAttributes();
        setMetadata(data);
      } catch (error) {
        console.error("Failed to fetch metadata", error);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        let sell_type = 2; // Default Hàng sẵn
        let is_gift_param = 0;

        if (productTypeTab === "Hàng mộc") {
          sell_type = 1;
        } else if (productTypeTab === "Quà tặng") {
          sell_type = null; // Quà tặng có thể không lọc theo sell_type (giá)
          is_gift_param = 1;
        } else if (productTypeTab === "Hàng custom") {
          sell_type = 4;
        }

        const params = {
          search: productSearch,
          category_id: selectedCategories.join(","),
          color_id: selectedColors.join(","),
          material_id: selectedMaterials.join(","),
          room_id: selectedRooms.join(","),
          sell_type: sell_type || undefined,
          is_gift: is_gift_param,
          min_price: priceRange.min,
          max_price: priceRange.max,
          page: currentPage,
          limit: ITEMS_PER_PAGE,
        };

        const res = await productService.getAllProducts(params);
        setProducts(res.data);
        setTotalItems(res.pagination.totalItems);
      } catch (error) {
        toast.error("Không thể tải danh sách sản phẩm");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [
    productTypeTab,
    productSearch,
    selectedCategories,
    selectedColors,
    selectedMaterials,
    selectedRooms,
    priceRange,
    currentPage,
  ]);

  // Fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      if (!customerSearch.trim()) {
        setCustomerResults([]);
        return;
      }
      try {
        const res = await customerService.getAllCustomers({
          search: customerSearch,
          limit: 10,
        });
        // Map backend customer data to UI structure
        const mapped = res.data.map((c) => ({
          id: c.pk_customer_id,
          name: c.full_name,
          phone: c.phone_number,
          address: c.address || "",
        }));
        setCustomerResults(mapped);
      } catch (error) {
        console.error("Failed to fetch customers", error);
      }
    };
    const timer = setTimeout(fetchCustomers, 300);
    return () => clearTimeout(timer);
  }, [customerSearch]);

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

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
    const cartItemId = product.pk_product_id;

    const existing = activeTab.cartItems.find((i) => i.id === cartItemId);
    if (existing) {
      if (existing.quantity >= product.available_quantity) {
        toast.error(`"${product.product_name}" đã hết hàng trong kho`);
        return;
      }
      updateActiveTab({
        cartItems: activeTab.cartItems.map((i) =>
          i.id === cartItemId ? { ...i, quantity: i.quantity + 1 } : i,
        ),
      });
    } else {
      if (product.available_quantity <= 0 && productTypeTab !== "Hàng custom") {
        toast.error(`"${product.product_name}" đã hết hàng`);
        return;
      }
      const isGift = productTypeTab === "Quà tặng";
      updateActiveTab({
        cartItems: [
          ...activeTab.cartItems,
          {
            id: cartItemId,
            name: product.product_name,
            price: isGift ? 0 : parseFloat(product.display_price),
            stock: product.available_quantity,
            sku: product.sku,
            quantity: 1,
            note: "",
            productType: productTypeTab,
            images: productTypeTab === "Hàng mộc" ? [] : null,
            isGift,
            leadTime: product.leadTime || 0, // Backend should provide this if needed
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
          setShowWorkshopStatus={setShowWorkshopStatus}
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
          metadata={metadata}
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          selectedColors={selectedColors}
          setSelectedColors={setSelectedColors}
          selectedMaterials={selectedMaterials}
          setSelectedMaterials={setSelectedMaterials}
          selectedRooms={selectedRooms}
          setSelectedRooms={setSelectedRooms}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          products={products}
          addToCart={addToCart}
          isLoading={isLoading}
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
              displayTotal={printingOrder.subtotal - (printingOrder.discount || 0)}
            />
          </div>
        )}
      </div>

      {/* ── Workshop Status Quick View Modal ── */}
      <WorkshopStatusModal 
        isOpen={showWorkshopStatus} 
        onClose={() => setShowWorkshopStatus(false)} 
      />
    </>
  );
}
