/**
 * Component CustomOrderRequirementsPage
 * Custom wood product orders — made-to-order items
 * UI synced with POS InStockInvoicePage
 *
 * Layout: 2-column split — Order Cart (left) + Custom Input (right)
 */

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import useDebounce from "@/hooks/useDebounce";
import { PageHelmet } from "@/components/seo/PageHelmet";
import AddCustomerModal from "@/pages/sales-page/components/AddCustomerModal";
import WorkshopStatusModal from "@/pages/sales-page/components/WorkshopStatusModal";
import RequirementCartPanel from "./RequirementCartPanel";
import CustomItemInputPanel from "./CustomItemInputPanel";
import { Button } from "@/components/ui/button";
import { X, Package } from "lucide-react";
import {
  ORDER_CONFIG,
  DELIVERY_METHODS,
  createEmptyTab,
  fmt
} from "@/constants/orderConfig";
import { todayVN, nowVN } from "@/lib/dateUtils";
import { format } from "date-fns";
import customerService from "@/services/customer.service";
import orderService from "@/services/order.service";
import customRequestService from "@/services/customRequest.service";

import { uploadMultipleImages } from "@/services/cloudinary.service";
import useCachedFetch from "@/hooks/useCachedFetch";

// ===================== VALIDATION SCHEMA =====================
const orderSchema = Yup.object().shape({
  selectedCustomer: Yup.object().nullable().required("Vui lòng chọn khách hàng"),
  orderNote: Yup.string().nullable(),

  cartItems: Yup.array()
    .min(1, "Danh sách yêu cầu không được để trống")
    .required("Danh sách yêu cầu không được để trống"),
  deliveryMethod: Yup.string().nullable(),
  deliveryDate: Yup.string().nullable(),
});

export default function CustomOrderRequirementsPage() {
  const [tabs, setTabs] = useState(() => {
    const saved = localStorage.getItem("tpf_custom_order_draft_tabs");
    return saved ? JSON.parse(saved) : [createEmptyTab()];
  });

  const [activeTabId, setActiveTabId] = useState(() => {
    const savedId = localStorage.getItem("tpf_custom_order_draft_active_id");
    if (savedId) {
      const parsed = Number(savedId);
      return isNaN(parsed) ? savedId : parsed;
    }
    return tabs.length > 0 ? tabs[0].id : null;
  });

  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showWorkshopStatus, setShowWorkshopStatus] = useState(false);
  const [viewingItem, setViewingItem] = useState(null);
  const [editingItemId, setEditingItemId] = useState(null);
  const [customerSearch, setCustomerSearch] = useState("");

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0] || createEmptyTab();

  const generateOrderCode = useCallback(() => {
    return format(nowVN(), "'DH'MMddHHmm");
  }, []);

  const debouncedCustomerSearch = useDebounce(customerSearch, 300);
  const lastSyncedValuesRef = useRef(null);

  // ===================== FORMIK CONFIG =====================
  const formik = useFormik({
    initialValues: activeTab,
    enableReinitialize: false,
    validationSchema: orderSchema,
    onSubmit: async (values) => {
      if (values.cartItems.length === 0) {
        toast.error("Danh sách yêu cầu trống!");
        return;
      }

      const loadingToast = toast.loading("Đang lưu yêu cầu thiết kế...");

      try {
        // Upload any pending files in cart items
        const finalCartItems = await Promise.all(
          values.cartItems.map(async (item) => {
            if (item.images && item.images.length > 0) {
              const filesToUpload = item.images.filter(img => typeof img !== 'string');
              const existingUrls = item.images.filter(img => typeof img === 'string');

              let newUrls = [];
              if (filesToUpload.length > 0) {
                try {
                  const uploadedResults = await uploadMultipleImages(filesToUpload);
                  newUrls = uploadedResults.map((res) => res.url);
                } catch (uploadError) {
                  console.error("Image upload failed:", uploadError);
                  // If upload fails, we notify but don't crash the whole process 
                  // unless it's critical. For custom orders, images are important,
                  // but we let the user decide if they want to proceed without them.
                  const msg = uploadError.message?.includes("cloud_name is disabled")
                    ? "Lỗi cấu hình máy chủ ảnh (Cloudinary bị vô hiệu hóa). Vẫn tiếp tục lưu yêu cầu không có ảnh mẫu?"
                    : "Không thể tải ảnh lên máy chủ. Vẫn tiếp tục lưu yêu cầu không có ảnh mẫu?";

                  if (!window.confirm(msg)) {
                    throw new Error("Người dùng đã hủy lưu do lỗi tải ảnh.");
                  }
                  newUrls = [];
                }
              }

              return {
                ...item,
                images: [...existingUrls, ...newUrls]
              };
            }
            return item;
          })
        );

        const requestData = {
          fk_customer_id: values.selectedCustomer.id,
          note: values.orderNote,
          address: values.deliveryMethod === 'delivery' ? (values.selectedCustomer?.address || "") : 'Lấy tại cửa hàng',
          order_status: 1,
          order_type: 3,
          items: finalCartItems.map((item) => ({
            item_name: item.productName,
            item_img: "",
            item_quantity: item.quantity,
            item_price: item.expectedPrice || 0,
            item_material: item.woodType,
            item_color: item.color,
            item_size: item.size,
            item_note: item.note,
            is_finished: 0,
            item_is_bundle: item.item_is_bundle || 0,
            item_bundle_items: item.item_bundle_items || null,
            customer_img: item.images || [],
          })),
        };

        await customRequestService.createRequest(requestData);
        toast.dismiss(loadingToast);

        // Clear active tab after success
        if (tabs.length <= 1) {
          const freshTab = createEmptyTab();
          setTabs([freshTab]);
          formik.resetForm({ values: freshTab });
        } else {
          closeTab(activeTabId, { stopPropagation: () => { } });
        }
      } catch (error) {
        console.error("Create custom request error:", error);
        toast.error(
          error.response?.data?.message || error.message || "Lỗi khi ghi nhận yêu cầu",
          { id: loadingToast }
        );
      }
    },
  });

  // Show validation errors as toasts when submitting
  useEffect(() => {
    if (formik.submitCount > 0 && !formik.isValid) {
      const firstError = Object.values(formik.errors)[0];
      if (typeof firstError === "string") {
        toast.error(firstError);
      } else if (Array.isArray(firstError)) {
        // Handle array of errors (like cartItems)
        toast.error(typeof firstError[0] === 'string' ? firstError[0] : "Dữ liệu không hợp lệ");
      }
    }
  }, [formik.submitCount]);

  // Fetch customers via useCachedFetch
  const fetchCustomersFn = useCallback(async () => {
    if (!debouncedCustomerSearch.trim()) return { items: [], total: 0 };

    const res = await customerService.getAllCustomers({
      search: debouncedCustomerSearch,
      limit: 10,
    });

    return {
      items: res.data.map((c) => ({
        id: c.pk_customer_id,
        name: c.full_name,
        phone: c.phone_number,
        address: c.address || "",
      })),
      total: res.pagination?.totalItems || res.data.length
    };
  }, [debouncedCustomerSearch]);

  const {
    data: cachedCustomerData,
    isLoading: isSearchingCustomers,
    isRefreshing: isRefreshingCustomers
  } = useCachedFetch(
    `custom_order_customers_${debouncedCustomerSearch}`,
    fetchCustomersFn,
    { enabled: !!debouncedCustomerSearch.trim(), ttl: 1000 * 60 * 5 }
  );

  const customerResults = cachedCustomerData?.items || [];

  // Sync Formik when switching tabs
  useEffect(() => {
    formik.resetForm({ values: activeTab });
    lastSyncedValuesRef.current = activeTab;
  }, [activeTabId]);

  // Sync Formik values back to tabs
  useEffect(() => {
    if (!formik.values || lastSyncedValuesRef.current === formik.values) return;
    if (JSON.stringify(activeTab) === JSON.stringify(formik.values)) {
      lastSyncedValuesRef.current = formik.values;
      return;
    }

    setTabs((prev) =>
      prev.map((t) => (t.id === activeTabId ? { ...t, ...formik.values } : t))
    );
    lastSyncedValuesRef.current = formik.values;
  }, [formik.values, activeTabId, activeTab]);

  // Save drafts to localStorage
  useEffect(() => {
    localStorage.setItem("tpf_custom_order_draft_tabs", JSON.stringify(tabs));
  }, [tabs]);

  useEffect(() => {
    if (activeTabId) {
      localStorage.setItem("tpf_custom_order_draft_active_id", activeTabId);
    }
  }, [activeTabId]);

  const updateActiveTab = useCallback(
    (updates) => {
      setTabs((prev) =>
        prev.map((t) => (t.id === activeTabId ? { ...t, ...updates } : t))
      );
    },
    [activeTabId]
  );

  const addTab = () => {
    const t = createEmptyTab();
    setTabs((p) => [...p, t]);
    setActiveTabId(t.id);
  };

  const closeTab = (tabId, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (tabs.length <= 1) return;
    setTabs((prev) => {
      const filtered = prev.filter((t) => t.id !== tabId);
      if (activeTabId === tabId)
        setActiveTabId(filtered[filtered.length - 1].id);
      return filtered;
    });
  };

  // Cart operations (Update to use Formik)
  const updateQuantity = (id, delta) => {
    const newItems = formik.values.cartItems
      .map((i) =>
        i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i
      )
      .filter((i) => i.quantity > 0);
    formik.setFieldValue("cartItems", newItems);
  };

  const removeFromCart = (id) => {
    const newItems = formik.values.cartItems.filter((i) => i.id !== id);
    formik.setFieldValue("cartItems", newItems);
  };

  const setQuantity = (id, qty) => {
    const val = parseInt(qty) || 0;
    if (val <= 0) return removeFromCart(id);
    const newItems = formik.values.cartItems.map((i) =>
      i.id === id ? { ...i, quantity: val } : i
    );
    formik.setFieldValue("cartItems", newItems);
  };

  // Computed values from Formik
  const itemCount = (formik.values.cartItems || []).reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = (formik.values.cartItems || []).reduce(
    (sum, i) => sum + (Number(i.expectedPrice) || 0) * i.quantity,
    0
  );
  const totalPayable = Math.max(
    0,
    subtotal - (formik.values.discount || 0) - (formik.values.depositAmount || 0)
  );

  const handleCheckout = () => {
    formik.handleSubmit();
  };

  return (
    <>
      <PageHelmet title="Yêu cầu đặt riêng - TPF-SIMS" />

      <div
        className="flex h-full gap-4 -m-4 p-4 relative"
        style={{ backgroundColor: "var(--bg-main)" }}
      >
        {(isSearchingCustomers || isRefreshingCustomers || formik.isSubmitting) && (
          <div className="fixed top-0 left-0 right-0 z-[9999]">
            <div className="h-[2px] bg-indigo-500 animate-[loading_1.5s_infinite] origin-left"></div>
          </div>
        )}
        {/* LEFT PANEL – CART & ORDER INFO */}
        <RequirementCartPanel
          tabs={tabs}
          activeTabId={activeTabId}
          activeTab={activeTab}
          setActiveTabId={setActiveTabId}
          addTab={addTab}
          closeTab={closeTab}
          updateQuantity={updateQuantity}
          removeFromCart={removeFromCart}
          setQuantity={setQuantity}
          updateActiveTab={updateActiveTab}
          customerSearch={customerSearch}
          setCustomerSearch={setCustomerSearch}
          customerResults={customerResults}
          isSearchingCustomers={isSearchingCustomers}
          setShowAddCustomer={setShowAddCustomer}
          setShowWorkshopStatus={setShowWorkshopStatus}
          setViewingItem={setViewingItem}
          itemCount={itemCount}
          subtotal={subtotal}
          totalPayable={totalPayable}
          handleCheckout={handleCheckout}
          onEditItem={(item) => setEditingItemId(item.id)}
          formik={formik}
        />

        {/* RIGHT PANEL – INPUT FORM */}
        <CustomItemInputPanel
          activeTab={formik.values}
          updateActiveTab={updateActiveTab}
          editingItemId={editingItemId}
          setEditingItemId={setEditingItemId}
          formik={formik}
        />
      </div>

      <AddCustomerModal
        isOpen={showAddCustomer}
        onClose={() => setShowAddCustomer(false)}
        onCustomerAdded={(customer) => {
          formik.setFieldValue("selectedCustomer", {
            id: customer.pk_customer_id,
            name: customer.full_name,
            phone: customer.phone_number,
            address: customer.address || "",
          });
        }}
      />

      {/* Workshop Status Modal */}
      <WorkshopStatusModal
        isOpen={showWorkshopStatus}
        onClose={() => setShowWorkshopStatus(false)}
      />

      {/* Viewing Item Overlay */}
      {viewingItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl w-full max-w-xl overflow-hidden p-6 text-left border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">Chi tiết yêu cầu</h3>
              <button onClick={() => setViewingItem(null)} className="p-2 hover:bg-gray-100 rounded-full transition cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-32 h-32 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
                  {viewingItem.images?.length > 0 ? (
                    <img src={typeof viewingItem.images[0] === "string" ? viewingItem.images[0] : URL.createObjectURL(viewingItem.images[0])} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300"><Package size={40} /></div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-gray-900">{viewingItem.productName}</h4>
                  <p className="text-sm text-gray-500 mt-1">{viewingItem.woodType} | {viewingItem.color}</p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Kích thước:{" "}
                    {typeof viewingItem.size === "object"
                      ? `${viewingItem.size.length}x${viewingItem.size.width}x${viewingItem.size.height} ${viewingItem.size.unit || "cm"}`
                      : viewingItem.size}
                  </p>
                  <p className="text-lg font-bold text-green-600 mt-2">{fmt(viewingItem.expectedPrice || 0)}đ</p>
                </div>
              </div>

              {viewingItem.note && (
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Mô tả kỹ thuật</p>
                  <p className="text-sm text-gray-700 leading-relaxed italic">"{viewingItem.note}"</p>
                </div>
              )}
            </div>

            <Button onClick={() => setViewingItem(null)} className="w-full mt-8 h-12 rounded-xl font-bold">
              Đóng
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

