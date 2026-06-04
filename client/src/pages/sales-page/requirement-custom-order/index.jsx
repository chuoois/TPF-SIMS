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
import { createEmptyTab, fmt } from "@/constants/orderConfig";
import customerService from "@/services/customer.service";
import customRequestService from "@/services/customRequest.service";
import { uploadMultipleImages } from "@/services/cloudinary.service";
import useCachedFetch from "@/hooks/useCachedFetch";

const STORAGE_KEYS = {
  TABS: "tpf_custom_order_draft_tabs",
  ACTIVE_TAB_ID: "tpf_custom_order_draft_active_id",
};

const orderSchema = Yup.object().shape({
  selectedCustomer: Yup.object().nullable().required("Vui lòng chọn khách hàng"),
  orderNote: Yup.string().nullable(),
  cartItems: Yup.array()
    .min(1, "Danh sách yêu cầu không được để trống")
    .required("Danh sách yêu cầu không được để trống"),
  deliveryMethod: Yup.string().nullable(),
  deliveryDate: Yup.string().nullable(),
});

const safeParseJson = (value, fallback) => {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const formatDimension = (size) => {
  if (!size) return "—";
  let parsed = size;
  if (typeof size === "string") {
    try {
      parsed = JSON.parse(size);
    } catch (e) {
      return size;
    }
  }
  if (parsed && typeof parsed === "object") {
    const isPresent = (val) => {
      if (val === null || val === undefined || val === "") return false;
      const num = Number(val);
      return !isNaN(num) && num > 0;
    };
    const parts = [];
    if (isPresent(parsed.length)) parts.push(`D:${parsed.length}`);
    if (isPresent(parsed.width)) parts.push(`R:${parsed.width}`);
    if (isPresent(parsed.height)) parts.push(`C:${parsed.height}`);
    if (parts.length > 0) {
      return parts.join(" × ") + (parsed.unit ? ` ${parsed.unit}` : " cm");
    }
  }
  return "—";
};

const loadDraftTabs = () => {
  const raw = localStorage.getItem(STORAGE_KEYS.TABS);
  return raw ? safeParseJson(raw, null) : null;
};

const loadActiveTabId = (tabs) => {
  const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB_ID);
  if (!raw) return null;
  const parsed = Number(raw);
  if (!Number.isNaN(parsed) && tabs.some((tab) => tab.id === parsed)) {
    return parsed;
  }
  return tabs[0]?.id || null;
};

const normalizeCustomer = (customer) => ({
  id: customer.pk_customer_id,
  name: customer.full_name,
  phone: customer.phone_number,
  address: customer.address || "",
});

const buildRequestPayload = async (values) => {
  const cartItems = await Promise.all(
    values.cartItems.map(async (item) => {
      if (!item.images?.length) return item;

      const filesToUpload = item.images.filter((image) => typeof image !== "string");
      const existingUrls = item.images.filter((image) => typeof image === "string");

      if (!filesToUpload.length) {
        return { ...item, images: existingUrls };
      }

      try {
        const uploadedResults = await uploadMultipleImages(filesToUpload);
        const uploadedUrls = uploadedResults.map((res) => res.url);
        return { ...item, images: [...existingUrls, ...uploadedUrls] };
      } catch (uploadError) {
        console.error("Upload images failed", uploadError);
        const msg = uploadError.message?.includes("cloud_name is disabled")
          ? "Lỗi cấu hình máy chủ ảnh (Cloudinary bị vô hiệu hóa). Vẫn tiếp tục lưu yêu cầu không có ảnh mẫu?"
          : "Không thể tải ảnh lên máy chủ. Vẫn tiếp tục lưu yêu cầu không có ảnh mẫu?";

        if (!window.confirm(msg)) {
          throw new Error("Người dùng đã hủy lưu do lỗi tải ảnh.");
        }

        return { ...item, images: existingUrls };
      }
    })
  );

  return {
    fk_customer_id: values.selectedCustomer.id,
    note: values.orderNote,
    address: values.selectedCustomer?.address || "",
    order_status: 1,
    order_type: 3,
    items: cartItems.map((item) => ({
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
};

const isSamePayload = (a, b) => JSON.stringify(a) === JSON.stringify(b);

export default function CustomOrderRequirementsPage() {
  const [tabs, setTabs] = useState(() => {
    const savedTabs = loadDraftTabs();
    return Array.isArray(savedTabs) && savedTabs.length > 0 ? savedTabs : [createEmptyTab()];
  });

  const [activeTabId, setActiveTabId] = useState(() => loadActiveTabId(tabs));
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showWorkshopStatus, setShowWorkshopStatus] = useState(false);
  const [viewingItem, setViewingItem] = useState(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [enlargedImg, setEnlargedImg] = useState(null);
  const [editingItemId, setEditingItemId] = useState(null);

  const handleViewItem = (item) => {
    setActiveImageIdx(0);
    setViewingItem(item);
  };
  const [customerSearch, setCustomerSearch] = useState("");

  const activeTab = useMemo(
    () => tabs.find((tab) => tab.id === activeTabId) || tabs[0] || createEmptyTab(),
    [tabs, activeTabId]
  );

  const debouncedCustomerSearch = useDebounce(customerSearch, 300);
  const lastSyncedValuesRef = useRef(activeTab);

  const formik = useFormik({
    initialValues: activeTab,
    enableReinitialize: false,
    validationSchema: orderSchema,
    onSubmit: async (values) => {
      if (!values.cartItems?.length) {
        toast.error("Danh sách yêu cầu trống!");
        return;
      }

      const loadingToast = toast.loading("Đang lưu yêu cầu thiết kế...");

      try {
        const requestData = await buildRequestPayload(values);
        await customRequestService.createRequest(requestData);
        toast.dismiss(loadingToast);

        if (tabs.length === 1) {
          const freshTab = createEmptyTab();
          setTabs([freshTab]);
          formik.resetForm({ values: freshTab });
        } else {
          closeTab(activeTabId, { stopPropagation: () => {} });
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

  useEffect(() => {
    if (formik.submitCount === 0 || formik.isValid) return;
    const firstError = Object.values(formik.errors)[0];
    if (typeof firstError === "string") {
      toast.error(firstError);
      return;
    }
    if (Array.isArray(firstError)) {
      toast.error(typeof firstError[0] === "string" ? firstError[0] : "Dữ liệu không hợp lệ");
    }
  }, [formik.submitCount, formik.errors, formik.isValid]);

  const fetchCustomersFn = useCallback(async () => {
    if (!debouncedCustomerSearch.trim()) return { items: [], total: 0 };

    const res = await customerService.getAllCustomers({
      search: debouncedCustomerSearch,
      limit: 10,
    });

    return {
      items: res.data.map((customer) => normalizeCustomer(customer)),
      total: res.pagination?.totalItems || res.data.length,
    };
  }, [debouncedCustomerSearch]);

  const {
    data: cachedCustomerData,
    isLoading: isSearchingCustomers,
    isRefreshing: isRefreshingCustomers,
  } = useCachedFetch(
    `custom_order_customers_${debouncedCustomerSearch}`,
    fetchCustomersFn,
    { enabled: !!debouncedCustomerSearch.trim(), ttl: 1000 * 60 * 5 }
  );

  const customerResults = cachedCustomerData?.items || [];

  useEffect(() => {
    formik.resetForm({ values: activeTab });
    lastSyncedValuesRef.current = activeTab;
    setEditingItemId(null);
  }, [activeTabId]);

  useEffect(() => {
    if (!formik.values) return;
    if (isSamePayload(lastSyncedValuesRef.current, formik.values)) return;
    if (isSamePayload(activeTab, formik.values)) {
      lastSyncedValuesRef.current = formik.values;
      return;
    }

    setTabs((previousTabs) =>
      previousTabs.map((tab) =>
        tab.id === activeTabId ? { ...tab, ...formik.values } : tab
      )
    );
    lastSyncedValuesRef.current = formik.values;
  }, [formik.values, activeTabId, activeTab]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TABS, JSON.stringify(tabs));
  }, [tabs]);

  useEffect(() => {
    if (activeTabId !== null && activeTabId !== undefined) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB_ID, String(activeTabId));
    }
  }, [activeTabId]);

  const updateActiveTab = useCallback(
    (updates) => {
      setTabs((previousTabs) =>
        previousTabs.map((tab) =>
          tab.id === activeTabId ? { ...tab, ...updates } : tab
        )
      );
    },
    [activeTabId]
  );

  const addTab = () => {
    const tab = createEmptyTab();
    setTabs((previousTabs) => [...previousTabs, tab]);
    setActiveTabId(tab.id);
  };

  const closeTab = (tabId, event) => {
    if (event?.stopPropagation) event.stopPropagation();
    if (tabs.length <= 1) return;

    setTabs((previousTabs) => {
      const remaining = previousTabs.filter((tab) => tab.id !== tabId);
      if (activeTabId === tabId) {
        setActiveTabId(remaining[remaining.length - 1]?.id || null);
      }
      return remaining;
    });
  };

  const adjustCartItemQuantity = (id, amount) => {
    const items = formik.values.cartItems || [];
    const targetItem = items.find((item) => item.id === id);
    if (targetItem && targetItem.quantity + amount <= 0 && id === editingItemId) {
      setEditingItemId(null);
    }
    const updated = items
      .map((item) =>
        item.id === id ? { ...item, quantity: Math.max(0, item.quantity + amount) } : item
      )
      .filter((item) => item.quantity > 0);
    formik.setFieldValue("cartItems", updated);
  };

  const removeFromCart = (id) => {
    if (id === editingItemId) {
      setEditingItemId(null);
    }
    formik.setFieldValue(
      "cartItems",
      (formik.values.cartItems || []).filter((item) => item.id !== id)
    );
  };

  const setQuantity = (id, quantity) => {
    const value = Number(quantity) || 0;
    if (value <= 0) {
      removeFromCart(id);
      return;
    }

    formik.setFieldValue(
      "cartItems",
      (formik.values.cartItems || []).map((item) =>
        item.id === id ? { ...item, quantity: value } : item
      )
    );
  };

  const itemCount = (formik.values.cartItems || []).reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const subtotal = (formik.values.cartItems || []).reduce(
    (sum, item) => sum + (Number(item.expectedPrice) || 0) * item.quantity,
    0
  );

  const totalPayable = Math.max(
    0,
    subtotal - (formik.values.discount || 0) - (formik.values.depositAmount || 0)
  );

  const handleCheckout = formik.handleSubmit;

  return (
    <>
      <PageHelmet title="Yêu cầu đặt riêng - TPF-SIMS" />

      <div className="flex h-full gap-4 -m-4 p-4 relative" style={{ backgroundColor: "var(--bg-main)" }}>
        {(isSearchingCustomers || isRefreshingCustomers || formik.isSubmitting) && (
          <div className="fixed top-0 left-0 right-0 z-[9999]">
            <div className="h-[2px] bg-indigo-500 animate-[loading_1.5s_infinite] origin-left"></div>
          </div>
        )}

        <RequirementCartPanel
          tabs={tabs}
          activeTabId={activeTabId}
          activeTab={activeTab}
          setActiveTabId={setActiveTabId}
          addTab={addTab}
          closeTab={closeTab}
          updateQuantity={adjustCartItemQuantity}
          removeFromCart={removeFromCart}
          setQuantity={setQuantity}
          updateActiveTab={updateActiveTab}
          customerSearch={customerSearch}
          setCustomerSearch={setCustomerSearch}
          customerResults={customerResults}
          isSearchingCustomers={isSearchingCustomers}
          setShowAddCustomer={setShowAddCustomer}
          setShowWorkshopStatus={setShowWorkshopStatus}
          setViewingItem={handleViewItem}
          itemCount={itemCount}
          subtotal={subtotal}
          totalPayable={totalPayable}
          handleCheckout={handleCheckout}
          onEditItem={(item) => setEditingItemId(item.id)}
          formik={formik}
        />

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
          formik.setFieldValue("selectedCustomer", normalizeCustomer(customer));
        }}
      />

      <WorkshopStatusModal
        isOpen={showWorkshopStatus}
        onClose={() => setShowWorkshopStatus(false)}
      />

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
              {/* Product info */}
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xl font-bold text-gray-900">{viewingItem.productName}</h4>
                  {viewingItem.item_is_bundle === 1 && (
                    <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-600 text-[10px] font-bold uppercase border border-purple-100 flex items-center gap-1 shrink-0">
                      <Package size={11} /> Bộ SP
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">{viewingItem.woodType} | {viewingItem.color}</p>
                {viewingItem.item_is_bundle === 1 ? (
                  <p className="text-sm text-purple-500 mt-0.5 font-medium">
                    Bộ gồm {(viewingItem.item_bundle_items || []).length} sản phẩm
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 mt-0.5">
                    Kích thước: {formatDimension(viewingItem.size)}
                  </p>
                )}
                {viewingItem.expectedPrice > 0 && (
                  <p className="text-lg font-bold text-green-600 mt-2">{fmt(viewingItem.expectedPrice)}đ</p>
                )}
              </div>

              {/* Sample images row */}
              {viewingItem.images?.length > 0 && (
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Ảnh mẫu</p>
                  <div className="flex gap-2 overflow-x-auto">
                    {viewingItem.images.map((img, idx) => {
                      const src = typeof img === "string" ? img : (img instanceof Blob || img instanceof File ? URL.createObjectURL(img) : "");
                      if (!src) return null;
                      return (
                        <div
                          key={idx}
                          className="w-20 h-20 rounded-lg bg-white border border-gray-200 overflow-hidden shrink-0 cursor-zoom-in hover:border-[#34B057] transition-colors"
                          onClick={() => setEnlargedImg(src)}
                        >
                          <img src={src} className="w-full h-full object-cover" alt={`Ảnh mẫu ${idx + 1}`} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
 
              {/* Danh sách sản phẩm con trong bộ */}
              {viewingItem.item_is_bundle === 1 && viewingItem.item_bundle_items && viewingItem.item_bundle_items.length > 0 && (
                <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100">
                  <p className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <Package size={13} /> Thành phần trong bộ sản phẩm
                  </p>
                  <div className="space-y-2">
                    {viewingItem.item_bundle_items.map((bi, biIdx) => {
                      const biSizeStr = formatDimension(bi.size);
                      return (
                        <div key={biIdx} className="flex items-center gap-3 p-2.5 bg-white rounded-lg border border-purple-100/60">
                          <span className="w-6 h-6 rounded-md bg-purple-100 text-purple-600 text-[10px] font-bold flex items-center justify-center shrink-0">
                            {biIdx + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-bold text-gray-800 truncate">{bi.name}</p>
                            {biSizeStr !== "—" && (
                              <p className="text-[11px] text-gray-400 mt-0.5">
                                Kích thước: {biSizeStr}
                              </p>
                            )}
                          </div>
                          <span className="text-[13px] font-black text-purple-600 shrink-0">×{bi.quantity}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

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

      {/* Enlarged image overlay */}
      {enlargedImg && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm cursor-zoom-out" onClick={() => setEnlargedImg(null)}>
          <img src={enlargedImg} className="max-w-[90vw] max-h-[85vh] rounded-xl shadow-2xl object-contain" />
        </div>
      )}
    </>
  );
}
