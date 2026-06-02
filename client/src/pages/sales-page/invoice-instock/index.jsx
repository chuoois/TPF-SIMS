

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import useDebounce from "@/hooks/useDebounce";
import { PrintableInvoice } from "@/pages/common/orders/PrintableInvoice";
import { PageHelmet } from "@/components/seo/PageHelmet";
import {
  ORDER_CONFIG,
  PRODUCT_TYPES,
  DELIVERY_METHODS,
  createEmptyTab,
  fmt
} from "@/constants/orderConfig";
import AddCustomerModal from "@/pages/sales-page/components/AddCustomerModal";

import CartPanel from "./CartPanel";
import ProductPanel from "./ProductPanel";
import useCachedFetch from "@/hooks/useCachedFetch";
import productService from "@/services/product.service";
import productAttributeService from "@/services/productAttribute.service";
import customerService from "@/services/customer.service";
import orderService from "@/services/order.service";
import { uploadMultipleImages } from "@/services/cloudinary.service";
import { todayVN, nowVN, formatDateVN } from "@/lib/dateUtils";

const { ITEMS_PER_PAGE, DEFAULT_WARRANTY } = ORDER_CONFIG;

// ===================== VALIDATION SCHEMA =====================
const orderSchema = Yup.object().shape({
  selectedCustomer: Yup.object().nullable().required("Vui lòng chọn khách hàng"),
  deliveryMethod: Yup.string().required(),
  deliveryDate: Yup.string().when("deliveryMethod", {
    is: "delivery",
    then: (schema) => schema.required("Vui lòng chọn ngày giao hàng"),
    otherwise: (schema) => schema.nullable(),
  }),
  depositAmount: Yup.number().min(0, "Số tiền đặt cọc không hợp lệ"),

  orderNote: Yup.string().nullable(),
});

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
      isFullPayment: false,
      depositAmount: 0,
      deliveryMethod: "store",
      deliveryDate: "",
      storePickupDate: "",

    },
  ]);
  const [activeTabId, setActiveTabId] = useState(tabs[0].id);
  const [productTypeTab, setProductTypeTab] = useState(PRODUCT_TYPES.INSTOCK);

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
  const [isSearchingCustomers, setIsSearchingCustomers] = useState(false);
  const [productSearch, setProductSearch] = useState("");

  const debouncedProductSearch = useDebounce(productSearch, 500);
  const debouncedCustomerSearch = useDebounce(customerSearch, 300);


  useEffect(() => {
    if (customerSearch !== debouncedCustomerSearch) {
      setIsSearchingCustomers(true);
    }
  }, [customerSearch, debouncedCustomerSearch]);

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  const updateActiveTab = useCallback(
    (updates) => {
      setTabs((prev) =>
        prev.map((t) => (t.id === activeTabId ? { ...t, ...updates } : t)),
      );
    },
    [activeTabId],
  );

  // Ref to track last synced values to prevent infinite loops and expensive stringify
  const lastSyncedValuesRef = useRef(null);

  // ===================== FORMIK CONFIG =====================
  const formik = useFormik({
    initialValues: activeTab,
    enableReinitialize: false, // Tắt tự động để tránh vòng lặp
    validationSchema: orderSchema,
    onSubmit: async (values) => {
      if (values.cartItems.length === 0) {
        toast.error("Giỏ hàng trống!");
        return;
      }

      const loadingToast = toast.loading("Đang xử lý thanh toán...");

      try {
        // Upload any pending files in cart items
        const finalCartItems = await Promise.all(
          values.cartItems.map(async (item) => {
            if (item.images && item.images.length > 0) {
              const filesToUpload = item.images.filter(img => typeof img !== 'string');
              const existingUrls = item.images.filter(img => typeof img === 'string');

              let newUrls = [];
              if (filesToUpload.length > 0) {
                const uploadedResults = await uploadMultipleImages(filesToUpload);
                newUrls = uploadedResults.map((res) => res.url);
              }

              return {
                ...item,
                images: [...existingUrls, ...newUrls]
              };
            }
            return item;
          })
        );

        const computedOrderType = finalCartItems.some((i) => i.productType === PRODUCT_TYPES.RAW) ? 1 : 2;

        // Prepare payload for backend
        const orderData = {
          fk_customer_id: values.selectedCustomer.id,
          fulfillment_method:
            values.deliveryMethod === "store" ? "Lấy tại cửa hàng" : "Giao tận nhà",
          expected_fulfillment_date:
            values.deliveryMethod === "store"
              ? values.storePickupDate || todayVN()
              : values.deliveryDate,
          note: values.orderNote,
          deposit_amount: values.depositAmount,

          address: values.selectedCustomer.address,
          total_amount: subtotal,
          order_type: computedOrderType,
          order_status: computedOrderType === 1
            ? ORDER_CONFIG.REVERSE_STATUS_MAP["Chờ xử lý"]
            : (values.deliveryMethod === "store" && !values.storePickupDate)
              ? ORDER_CONFIG.REVERSE_STATUS_MAP["Hoàn thành"]
              : ORDER_CONFIG.REVERSE_STATUS_MAP["Chờ giao hàng"],
          items: finalCartItems.map((item) => ({
            fk_product_id: item.id,
            item_name: item.name,
            item_quantity: item.quantity,
            item_price: item.price,
            item_is_bundle: item.isBundle ? 1 : 0,
            item_bundle_items: item.bundleItems || null,
            item_is_gift: item.isGift ? 1 : 0,
            is_finished: item.productType === PRODUCT_TYPES.RAW ? 0 : 1,
            item_note: item.note,
            customer_img: item.images || [], // Gửi mảng URL ảnh hàng mộc
            item_img: item.image, // Lưu ảnh sản phẩm gốc
          })),
        };

        const response = await orderService.createOrder(orderData);
        const createdOrder = response.order;

        // Prepare UI object for printing
        const newOrder = {
          code: createdOrder.pk_order_id ? `HD-${createdOrder.pk_order_id}` : ("HD-" + Math.floor(Math.random() * 1000000)),
          customer: {
            name: values.selectedCustomer?.name,
            phone: values.selectedCustomer?.phone || "",
            address: values.selectedCustomer?.address || "",
          },
          type: finalCartItems.some((i) => i.productType === PRODUCT_TYPES.RAW)
            ? PRODUCT_TYPES.RAW
            : PRODUCT_TYPES.INSTOCK,
          salesPerson: "Nhân viên bán hàng",
          products: finalCartItems.map((item) => ({
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
          discount: values.discount || 0,
          deposit: values.depositAmount,
          deliveryMethod: values.deliveryMethod,
          deliveryDate:
            values.deliveryMethod === "store"
              ? values.storePickupDate || todayVN()
              : values.deliveryDate,
          storePickupDate:
            values.deliveryMethod === "store"
              ? values.storePickupDate || null
              : null,
          date: todayVN(),
        };

        // Simulation: Update simulated warranties
        const warranties = JSON.parse(
          localStorage.getItem("tpf_simulated_warranties") || "[]"
        );

        const newWarranties = finalCartItems
          .filter((item) => !item.isGift && item.warrantyMonths)
          .map((item, idx) => {
            const startDate = nowVN();
            const endDate = new Date(startDate);
            endDate.setMonth(endDate.getMonth() + (item.warrantyMonths || 12));

            return {
              id: `BH-${nowVN().getFullYear()}-${Math.floor(Math.random() * 1000000)}`,
              orderId: newOrder.code,
              customerName: newOrder.customer.name,
              phone: newOrder.customer.phone,
              productCode: item.sku,
              productName: item.name,
              serial: `${item.sku}-${Date.now().toString().slice(-4)}${idx}`,
              startDate: todayVN(),
              endDate: formatDateVN(endDate, "yyyy-MM-dd"),
              warrantyMonths: item.warrantyMonths || 12,
              status: "Còn hạn",
              maintenanceHistory: [],
              notes: item.warrantyContent || "Bảo hành các lỗi kỹ thuật.",
            };
          });

        if (newWarranties.length > 0) {
          localStorage.setItem(
            "tpf_simulated_warranties",
            JSON.stringify([...warranties, ...newWarranties])
          );
        }

        setPrintingOrder(newOrder);

        // Clear active tab after success
        const freshTab = { ...createEmptyTab(), id: activeTabId };
        updateActiveTab(freshTab);
        formik.resetForm({ values: freshTab });

        // Refresh products to update stock
        refreshProducts();

        toast.dismiss(loadingToast);
      } catch (error) {
        toast.dismiss(loadingToast);
        console.error("Checkout error:", error);
        toast.error(error.response?.data?.message || error.message || "Lỗi khi tạo đơn hàng");
      }
    },
  });

  // Hiển thị thông báo lỗi validation nếu có
  useEffect(() => {
    if (formik.submitCount > 0 && Object.keys(formik.errors).length > 0) {
      const firstError = Object.values(formik.errors)[0];
      if (typeof firstError === "string") {
        toast.error(firstError, { id: "validation-error" });
      }
    }
  }, [formik.submitCount, formik.errors]);

  // Sync Formik when switching tabs
  useEffect(() => {
    formik.resetForm({ values: activeTab });
    lastSyncedValuesRef.current = activeTab;
  }, [activeTabId]);

  // Optimized sync Formik values back to tabs - ONLY when values actually change
  useEffect(() => {
    if (!formik.values || lastSyncedValuesRef.current === formik.values) return;

    // Tránh đồng bộ nếu đây là kết quả của việc resetForm (initialValues)
    if (JSON.stringify(activeTab) === JSON.stringify(formik.values)) {
      lastSyncedValuesRef.current = formik.values;
      return;
    }

    setTabs((prev) =>
      prev.map((t) => (t.id === activeTabId ? { ...t, ...formik.values } : t))
    );
    lastSyncedValuesRef.current = formik.values;
  }, [formik.values, activeTabId, activeTab]);

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

  // Fetch products via useCachedFetch
  const fetchFn = useCallback(async () => {
    let sell_type = 2; // Default Hàng sẵn
    let is_gift_param = 0;

    if (productTypeTab === PRODUCT_TYPES.RAW) {
      sell_type = 1;
    } else if (productTypeTab === PRODUCT_TYPES.GIFT) {
      sell_type = null;
      is_gift_param = 1;
    } else if (productTypeTab === PRODUCT_TYPES.CUSTOM) {
      sell_type = 4;
    }

    const params = {
      search: debouncedProductSearch,
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
    return {
      items: res.data,
      total: res.pagination.totalItems
    };
  }, [
    productTypeTab,
    debouncedProductSearch,
    selectedCategories,
    selectedColors,
    selectedMaterials,
    selectedRooms,
    priceRange,
    currentPage,
  ]);

  const { data: cachedData, isLoading, isRefreshing, refresh: refreshProducts } = useCachedFetch(
    `instock_products_${productTypeTab}_${currentPage}_${debouncedProductSearch}_${selectedCategories.join(",")}_${selectedColors.join(",")}_${selectedMaterials.join(",")}_${selectedRooms.join(",")}_${priceRange.min}_${priceRange.max}`,
    fetchFn,
    { ttl: 1000 * 60 * 5 }
  );

  const products = cachedData?.items || [];
  const totalItems = cachedData?.total || 0;

  // Fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      if (!debouncedCustomerSearch.trim()) {
        setCustomerResults([]);
        return;
      }
      setIsSearchingCustomers(true);
      try {
        const res = await customerService.getAllCustomers({
          search: debouncedCustomerSearch,
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
      } finally {
        setIsSearchingCustomers(false);
      }
    };
    fetchCustomers();
  }, [debouncedCustomerSearch]);

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
    // Unique ID = ProductID + Type (để phân biệt cùng 1 sp nhưng bán Mộc hoặc Sẵn)
    const cartItemId = `${product.pk_product_id}-${productTypeTab}`;

    // Kiểm tra tính đồng nhất của giỏ hàng (Không cho phép lẫn Hàng Mộc và Hàng Sẵn)
    const currentItems = formik.values.cartItems || [];
    const isAddingGift = productTypeTab === PRODUCT_TYPES.GIFT;
    const isAddingRaw = productTypeTab === PRODUCT_TYPES.RAW;
    const isAddingInstock = productTypeTab === PRODUCT_TYPES.INSTOCK;

    if (!isAddingGift) {
      const hasRaw = currentItems.some(i => i.productType === PRODUCT_TYPES.RAW);
      const hasInstock = currentItems.some(i => i.productType === PRODUCT_TYPES.INSTOCK);

      if (isAddingRaw && hasInstock) {
        toast.error("Giỏ hàng đang có hàng Sẵn, không thể thêm hàng Mộc!", { id: "mix-error" });
        return;
      }
      if (isAddingInstock && hasRaw) {
        toast.error("Giỏ hàng đang có hàng Mộc, không thể thêm hàng Sẵn!", { id: "mix-error" });
        return;
      }
    }

    const existing = currentItems.find(
      (i) => i.cartItemId === cartItemId,
    );
    if (existing) {
      if (existing.quantity >= product.available_quantity) {
        toast.error(`"${product.product_name}" đã hết hàng trong kho`);
        return;
      }
      formik.setFieldValue(
        "cartItems",
        currentItems.map((i) =>
          i.cartItemId === cartItemId ? { ...i, quantity: i.quantity + 1 } : i,
        ),
      );
    } else {
      if (
        product.available_quantity <= 0 &&
        productTypeTab !== PRODUCT_TYPES.CUSTOM
      ) {
        toast.error(`"${product.product_name}" đã hết hàng`);
        return;
      }
      const isGift = productTypeTab === PRODUCT_TYPES.GIFT;
      formik.setFieldValue("cartItems", [
        ...currentItems,
        {
          cartItemId, // ID duy nhất trong giỏ
          id: product.pk_product_id, // ID sản phẩm thực tế
          productType: productTypeTab, // Lưu loại sản phẩm (Mộc/Sẵn/Quà)
          name: product.product_name,
          image: product.product_img,
          price: isGift ? 0 : parseFloat(product.display_price),
          stock: product.available_quantity,
          sku: product.sku,
          quantity: 1,
          note: "",
          images: productTypeTab === PRODUCT_TYPES.RAW ? [] : null,
          isGift,
          isBundle: product.is_bundle === 1,
          bundleItems: product.bundle_items || null,
          leadTime: product.leadTime || 0,
          warrantyMonths: product.warranty_months || DEFAULT_WARRANTY,
          warrantyContent:
            product.warrantyContent || "Bảo hành các lỗi kỹ thuật.",
        },
      ]);
    }
  };

  const updateQuantity = (cartItemId, delta) => {
    const newCartItems = formik.values.cartItems
      .map((i) => {
        if (i.cartItemId !== cartItemId) return i;
        const newQty = i.quantity + delta;
        if (delta > 0 && newQty > i.stock) {
          toast.error(`Tồn kho chỉ còn ${i.stock}`);
          return i;
        }
        return { ...i, quantity: Math.max(0, newQty) };
      })
      .filter((i) => i.quantity > 0);

    formik.setFieldValue("cartItems", newCartItems);
  };

  const removeFromCart = (cartItemId) => {
    formik.setFieldValue(
      "cartItems",
      formik.values.cartItems.filter((i) => i.cartItemId !== cartItemId),
    );
  };

  const setQuantity = (cartItemId, qty) => {
    const val = parseInt(qty) || 0;
    if (val <= 0) return removeFromCart(cartItemId);
    const item = formik.values.cartItems.find((i) => i.cartItemId === cartItemId);
    if (item && val > item.stock) {
      toast.error(`Tồn kho chỉ còn ${item.stock}`);
      return;
    }
    formik.setFieldValue(
      "cartItems",
      formik.values.cartItems.map((i) =>
        i.cartItemId === cartItemId ? { ...i, quantity: val } : i,
      ),
    );
  };

  const updateItemNote = (cartItemId, note) => {
    formik.setFieldValue(
      "cartItems",
      formik.values.cartItems.map((i) =>
        i.cartItemId === cartItemId ? { ...i, note } : i,
      ),
    );
  };

  const updateItemImages = (cartItemId, newFiles) => {
    formik.setFieldValue(
      "cartItems",
      formik.values.cartItems.map((i) =>
        i.cartItemId === cartItemId
          ? { ...i, images: [...(i.images || []), ...newFiles] }
          : i,
      ),
    );
  };

  const removeItemImage = (cartItemId, imgIdx) => {
    formik.setFieldValue(
      "cartItems",
      formik.values.cartItems.map((i) =>
        i.cartItemId === cartItemId
          ? { ...i, images: i.images.filter((_, idx) => idx !== imgIdx) }
          : i,
      ),
    );
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
  }, [activeTab.cartItems]); const totalPayable = Math.max(
    0,
    subtotal - activeTab.discount - activeTab.depositAmount,
  );
  const itemCount = activeTab.cartItems.reduce((sum, i) => sum + i.quantity, 0);

  const handleCheckout = () => {
    formik.handleSubmit();
  };

  // ===================== RENDER =====================
  return (
    <>
      <PageHelmet title="Bán hàng có sẵn - TPF-SIMS" />

      <div
        className="flex h-full gap-4 -m-4 p-4 relative"
        style={{ backgroundColor: "var(--bg-main)" }}
      >
        {(isLoading || isRefreshing) && (
          <div className="fixed top-0 left-0 right-0 z-[9999]">
            <div className="h-[2px] bg-indigo-500 animate-[loading_1.5s_infinite] origin-left"></div>
          </div>
        )}
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
          isSearchingCustomers={isSearchingCustomers}
          updateActiveTab={updateActiveTab}
          setShowAddCustomer={setShowAddCustomer}

          subtotal={subtotal}
          itemCount={itemCount}
          totalPayable={totalPayable}
          handleCheckout={handleCheckout}
          formik={formik}
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
          isRefreshing={isRefreshing}
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


    </>
  );
}
