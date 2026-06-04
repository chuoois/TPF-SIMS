/**
 * RequirementCartPanel — Left panel of CustomOrderRequirementsPage
 * UI synced with InStock CartPanel
 */

import { useState, useRef, useMemo, useEffect } from "react";
import {
  X,
  Plus,
  Minus,
  Trash2,
  UserPlus,
  ShoppingCart,
  Pencil,
  Receipt,
  User,
  CreditCard,
  Calendar,
  ShieldCheck,
  Eye,
  Package,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";





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

export default function RequirementCartPanel({
  tabs,
  activeTabId,
  activeTab,
  setActiveTabId,
  addTab,
  closeTab,
  updateQuantity,
  removeFromCart,
  setQuantity,
  updateActiveTab,
  customerSearch,
  setCustomerSearch,
  customerResults,
  isSearchingCustomers,
  setShowAddCustomer,
  setShowWorkshopStatus,
  setViewingItem,
  itemCount,
  handleCheckout,
  onEditItem,
  formik,
}) {
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [expandedBundles, setExpandedBundles] = useState({});
  const [enlargedImg, setEnlargedImg] = useState(null);
  const customerSearchRef = useRef(null);

  const toggleBundleExpand = (itemId) => {
    setExpandedBundles(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };



  return (
    <div
      className="flex flex-col w-[56%] bg-white rounded-lg overflow-hidden border border-[var(--grid-border)]"
    >
      {/* ── Tab Bar ── */}
      <div
        className="flex items-center gap-1.5 px-4 py-2.5 border-b"
        style={{ borderColor: "var(--grid-border)" }}
      >
        {tabs.map((tab, idx) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTabId(tab.id)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] whitespace-nowrap transition-all shrink-0 cursor-pointer ${tab.id === activeTabId ? "font-semibold" : "hover:bg-gray-50"
              }`}
            style={{
              backgroundColor:
                tab.id === activeTabId ? "var(--status-focus)" : "transparent",
              color:
                tab.id === activeTabId
                  ? "var(--brand-primary)"
                  : "var(--text-secondary)",
            }}
          >
            <Receipt size={13} />
            <span>Phiếu {idx + 1}</span>
            {tab.cartItems.length > 0 && (
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none"
                style={{
                  backgroundColor:
                    tab.id === activeTabId
                      ? "var(--brand-primary)"
                      : "var(--grid-border)",
                  color:
                    tab.id === activeTabId ? "#fff" : "var(--text-secondary)",
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
          type="button"
          className="w-7 h-7 rounded-lg flex items-center justify-center transition shrink-0 cursor-pointer hover:bg-gray-50"
          style={{ color: "var(--text-placeholder)" }}
          title="Thêm phiếu mới"
        >
          <Plus size={14} />
        </button>

      </div>

      {/* ── Cart Content ── */}
      <div className="flex-1 overflow-y-auto">
        {formik.values.cartItems.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center h-full gap-2"
            style={{ color: "var(--text-placeholder)" }}
          >
            <div
              className="w-20 h-20 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "var(--bg-main)" }}
            >
              <Package size={32} strokeWidth={1.5} />
            </div>
            <p className="text-sm font-medium mt-2">Danh sách yêu cầu trống</p>
            <p className="text-xs">Điền thông tin sản phẩm ở bảng bên phải</p>
          </div>
        ) : (
          <div
            className="divide-y"
            style={{ borderColor: "var(--grid-border)" }}
          >
            {formik.values.cartItems.map((item, idx) => (
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
                    <div className="flex items-center gap-2">
                      <p
                        className="text-[13px] font-semibold truncate"
                        style={{ color: "var(--text-main)" }}
                      >
                        {item.productName}
                      </p>
                      <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 text-[9px] font-bold uppercase tracking-tight shrink-0 border border-amber-100">
                        Đặt riêng
                      </span>
                      {item.item_is_bundle === 1 && (
                        <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-600 text-[9px] font-bold uppercase tracking-tight shrink-0 border border-purple-100 flex items-center gap-0.5">
                          <Package size={9} /> Bộ SP
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className="text-[11px]"
                        style={{ color: "var(--text-placeholder)" }}
                      >
                        {item.woodType}
                        {item.item_is_bundle === 1
                          ? ` | ${(item.item_bundle_items || []).length} món trong bộ`
                          : (() => {
                              const sizeStr = formatDimension(item.size);
                              return sizeStr !== "—" ? ` | ${sizeStr}${item.size?.note ? ` (${item.size.note})` : ""}` : "";
                            })()}
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
                      type="button"
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


                  {/* Actions */}
                  <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      type="button"
                      onClick={() => setViewingItem(item)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-blue-50 hover:text-blue-500 transition cursor-pointer"
                      style={{ color: "var(--text-placeholder)" }}
                    >
                      <Eye size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onEditItem(item)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 hover:text-gray-700 transition cursor-pointer"
                      style={{ color: "var(--text-placeholder)" }}
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition cursor-pointer"
                      style={{ color: "var(--text-placeholder)" }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Requirements detail snippet */}
                {item.note && (
                  <div className="mt-1.5 pl-11 flex items-center gap-2">
                    <span className="text-[11px] italic line-clamp-1" style={{ color: "var(--text-placeholder)" }}>
                      Yêu cầu: {item.note}
                    </span>
                  </div>
                )}

                {/* Sample images row */}
                {item.images?.length > 0 && (
                  <div className="mt-2 pl-11 flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold uppercase text-gray-400 shrink-0">Ảnh mẫu:</span>
                    <div className="flex gap-1 overflow-x-auto">
                      {item.images.map((img, imgIdx) => {
                        const src = typeof img === "string" ? img : (img instanceof Blob || img instanceof File ? URL.createObjectURL(img) : "");
                        return (
                          <div key={imgIdx} className="w-9 h-9 rounded-md bg-gray-50 border border-gray-100 overflow-hidden shrink-0 cursor-zoom-in" onClick={() => src && setEnlargedImg(src)}>
                            {src ? (
                              <img
                                src={src}
                                className="w-full h-full object-cover"
                                alt={`${item.productName} ${imgIdx + 1}`}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-100 text-[10px]">No img</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Bundle items expansion */}
                {item.item_is_bundle === 1 && item.item_bundle_items && item.item_bundle_items.length > 0 && (
                  <div className="mt-2 pl-11">
                    <button
                      type="button"
                      onClick={() => toggleBundleExpand(item.id)}
                      className="flex items-center gap-1.5 text-[11px] font-semibold text-purple-600 hover:text-purple-700 transition cursor-pointer"
                    >
                      <Package size={11} />
                      {item.item_bundle_items.length} sản phẩm trong bộ
                      {expandedBundles[item.id] ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                    {expandedBundles[item.id] && (
                      <div className="mt-1.5 space-y-1 border-l-2 border-purple-100 pl-3">
                        {item.item_bundle_items.map((bi, biIdx) => (
                          <div key={biIdx} className="flex items-center gap-2 py-1">
                            <span className="w-4 h-4 rounded-full bg-purple-50 text-purple-500 text-[9px] font-bold flex items-center justify-center shrink-0">
                              {biIdx + 1}
                            </span>
                            <span className="text-[11px] font-medium text-gray-700 truncate">
                              {bi.name}
                              <span className="ml-1 text-purple-500 font-bold">×{bi.quantity}</span>
                            </span>
                            {(() => {
                              const biSizeStr = formatDimension(bi.size);
                              return biSizeStr !== "—" && (
                                <span className="text-[10px] text-gray-400 shrink-0">
                                  {biSizeStr}
                                </span>
                              );
                            })()}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="border-t" style={{ borderColor: "var(--grid-border)" }}>
        {/* Customer + Note row */}
        <div
          className="flex items-stretch divide-x"
          style={{ borderColor: "var(--grid-border)" }}
        >
          {/* Customer */}
          <div
            className="relative flex items-center gap-2 px-4 py-2.5 w-1/2"
            ref={customerSearchRef}
          >
            <User
              size={14}
              style={{ color: formik.errors.selectedCustomer && formik.touched.selectedCustomer ? "var(--status-error)" : "var(--text-placeholder)" }}
              className="shrink-0"
            />
            {formik.values.selectedCustomer ? (
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <span
                  className="text-[13px] font-medium truncate"
                  style={{ color: "var(--brand-primary)" }}
                >
                  {formik.values.selectedCustomer.name}
                </span>
                <span
                  className="text-[11px] shrink-0"
                  style={{ color: "var(--text-placeholder)" }}
                >
                  {formik.values.selectedCustomer.phone}
                </span>
                <button
                  onClick={() => {
                    formik.setFieldValue("selectedCustomer", null);
                    setCustomerSearch("");
                  }}
                  className="cursor-pointer shrink-0 ml-auto mr-1"
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
              </div>
            )}

            {/* Always show Add Customer icon button in the customer area */}
            <button
              onClick={() => setShowAddCustomer(true)}
              className="w-6 h-6 rounded-md flex items-center justify-center cursor-pointer transition hover:bg-gray-100 shrink-0"
              style={{ color: "var(--brand-primary)" }}
              title="Thêm khách hàng mới"
            >
              <UserPlus size={12} />
            </button>

            {/* Customer search dropdown */}
            {showCustomerDropdown && customerSearch.trim() && (
              <div
                className="absolute left-0 bottom-full mb-1 w-full bg-white rounded-lg border overflow-hidden z-30"
                style={{ borderColor: "var(--grid-border)" }}
              >
                {isSearchingCustomers ? (
                  <div className="p-4 text-center">
                    <p
                      className="text-[12px] animate-pulse"
                      style={{ color: "var(--brand-primary)" }}
                    >
                      Đang tìm kiếm...
                    </p>
                  </div>
                ) : customerResults.length > 0 ? (
                  <div className="max-h-[200px] overflow-y-auto">
                    {customerResults.map((c) => (
                      <button
                        key={c.id}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          formik.setFieldValue("selectedCustomer", c);
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
              value={formik.values.orderNote || ""}
              onChange={(e) => formik.setFieldValue("orderNote", e.target.value)}
              className="flex-1 text-[13px] focus:outline-none bg-transparent"
              style={{ color: "var(--text-secondary)" }}
            />
          </div>

        </div>





        {/* Checkout bar */}
        <div className="flex items-center justify-end px-4 py-3 border-t" style={{ borderColor: "var(--grid-border)" }}>
          <Button
            type="button"
            className="h-11 px-8 text-sm font-bold text-white rounded-lg transition-all active:scale-95 cursor-pointer disabled:opacity-40"
            style={{ backgroundColor: "var(--brand-primary)" }}
            disabled={formik.values.cartItems.length === 0 || formik.isSubmitting}
            onClick={handleCheckout}
          >
            {formik.isSubmitting
              ? "Đang xử lý..."
              : "Lưu yêu cầu thiết kế"}
          </Button>
        </div>
      </div>

      {/* Enlarged image overlay */}
      {enlargedImg && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm cursor-zoom-out" onClick={() => setEnlargedImg(null)}>
          <img src={enlargedImg} className="max-w-[90vw] max-h-[85vh] rounded-xl shadow-2xl object-contain" />
        </div>
      )}
    </div>
  );
}

