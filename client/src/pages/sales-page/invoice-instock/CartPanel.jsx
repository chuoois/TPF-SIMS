/**
 * CartPanel — Left panel of InStockInvoicePage
 * Includes: Tab bar, Cart items, Customer search, Delivery, Summary, Checkout
 */

import { useState, useRef } from "react";
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
  AlertCircle,
} from "lucide-react";
import { ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fmt } from "./mockData";

export default function CartPanel({
  tabs,
  activeTabId,
  activeTab,
  setActiveTabId,
  addTab,
  closeTab,
  updateQuantity,
  removeFromCart,
  setQuantity,
  updateItemNote,
  updateItemImages,
  removeItemImage,
  customerSearch,
  setCustomerSearch,
  customerResults,
  updateActiveTab,
  setShowAddCustomer,
  needsWorkshop,
  maxLeadTime,
  workshopStats,
  expectedReadyDate,
  subtotal,
  itemCount,
  totalPayable,
  handleCheckout,
}) {
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const customerSearchRef = useRef(null);

  return (
    <div
      className="flex flex-col w-[56%] bg-white rounded-lg overflow-hidden"
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
      </div>

      {/* ── Cart Content ── */}
      <div className="flex-1 overflow-y-auto">
        {activeTab.cartItems.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center h-full gap-2"
            style={{ color: "var(--text-placeholder)" }}
          >
            <div
              className="w-20 h-20 rounded-lg flex items-center justify-center"
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
                    <div className="flex items-center gap-2">
                      <p
                        className="text-[13px] font-semibold truncate"
                        style={{ color: "var(--text-main)" }}
                      >
                        {item.name}
                      </p>
                      {item.isGift && (
                        <span className="px-1.5 py-0.5 rounded bg-orange-100 text-orange-600 text-[10px] font-bold uppercase tracking-tight">
                          Quà tặng
                        </span>
                      )}
                    </div>
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
                        × {item.isGift ? "0đ" : fmt(item.price) + "đ"}
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

                <div className="mt-2 pl-11 flex items-center gap-4">
                  {/* Note */}
                  <div className="flex-1 flex items-center gap-2">
                    <Pencil
                      size={11}
                      style={{ color: "var(--text-placeholder)" }}
                      className="shrink-0"
                    />
                    <input
                      type="text"
                      placeholder="Ghi chú..."
                      value={item.note || ""}
                      onChange={(e) =>
                        updateItemNote(item.id, e.target.value)
                      }
                      className="text-[12px] italic focus:outline-none bg-transparent w-full"
                      style={{ color: "var(--text-secondary)" }}
                    />
                  </div>

                  {/* Warranty – Read-only system config */}
                  {!item.isGift && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200">
                      <ShieldCheck
                        size={12}
                        className="text-emerald-500 shrink-0"
                      />
                      <span className="text-[11px] font-semibold text-emerald-700">
                        Bảo hành: {item.warrantyMonths || 12} tháng
                      </span>
                    </div>
                  )}
                </div>

                {/* === Hàng mộc hoàn thiện: Giá cũ / Giá đã giảm + Upload ảnh === */}
                {item.productType === "Hàng mộc" &&
                  item.priceMode === "finished" && (
                    <div className="mt-2 pl-11 space-y-2">
                      {/* Dual pricing */}

                      {/* Image upload */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {(item.images || []).map((img, imgIdx) => (
                          <div
                            key={imgIdx}
                            className="relative w-14 h-14 rounded-lg overflow-hidden border border-gray-200 group/img"
                          >
                            <img
                              src={
                                typeof img === "string"
                                  ? img
                                  : URL.createObjectURL(img)
                              }
                              alt=""
                              className="w-full h-full object-cover"
                            />
                            <button
                              onClick={() =>
                                removeItemImage(item.id, imgIdx)
                              }
                              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition cursor-pointer shadow"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ))}
                        <label className="w-14 h-14 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-green-400 hover:bg-green-50/50 transition">
                          <ImagePlus size={18} className="text-gray-400" />
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files?.length) {
                                updateItemImages(
                                  item.id,
                                  Array.from(e.target.files),
                                );
                              }
                              e.target.value = "";
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  )}
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
          <div
            className="relative flex items-center gap-2 px-4 py-2.5 w-1/2"
            ref={customerSearchRef}
          >
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
                    if (customerSearch.trim())
                      setShowCustomerDropdown(true);
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
                className="absolute left-0 bottom-full mb-1 w-full bg-white rounded-lg shadow-lg border overflow-hidden z-30"
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



        {/* Delivery Method */}
        <div
          className="px-4 py-3 space-y-3 border-t"
          style={{
            borderColor: "var(--grid-border)",
          }}
        >
          <div className="flex items-center justify-between">
            <p
              className="text-[12px] font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-placeholder)" }}
            >
              Giao hàng
            </p>
            {needsWorkshop && maxLeadTime > 0 && (
              <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold ${workshopStats.bg} ${workshopStats.color} ${workshopStats.border}`}>
                <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${workshopStats.level === 'Quá tải' ? 'bg-red-500' : workshopStats.level === 'Khá bận' ? 'bg-amber-500' : 'bg-green-500'}`} />
                Xưởng {workshopStats.level}
              </div>
            )}
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={`deliveryMethod-${activeTab.id}`}
                value="store"
                checked={activeTab.deliveryMethod === "store"}
                onChange={() =>
                  updateActiveTab({
                    deliveryMethod: "store",
                    deliveryDate: "",
                  })
                }
                className="w-3.5 h-3.5 text-green-600 focus:ring-green-500"
              />
              <span
                className="text-[13px]"
                style={{ color: "var(--text-main)" }}
              >
                Lấy tại cửa hàng
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={`deliveryMethod-${activeTab.id}`}
                value="delivery"
                checked={activeTab.deliveryMethod === "delivery"}
                onChange={() =>
                  updateActiveTab({
                    deliveryMethod: "delivery",
                    storePickupDate: "",
                  })
                }
                className="w-3.5 h-3.5 text-green-600 focus:ring-green-500"
              />
              <span
                className="text-[13px]"
                style={{ color: "var(--text-main)" }}
              >
                Giao tận nơi
              </span>
            </label>
          </div>

          {/* ── Lấy tại cửa hàng: date picker tùy chọn ── */}
          {activeTab.deliveryMethod === "store" && (
            <div
              className="ml-1 pl-4 space-y-2"
              style={{ borderLeft: "2px solid var(--grid-border)" }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="text-[12.5px] shrink-0"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Ngày hẹn lấy:
                </span>
                <div className="relative flex-1">
                  <Calendar
                    size={14}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--text-placeholder)" }}
                  />
                  <input
                    type="date"
                    value={activeTab.storePickupDate || ""}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) =>
                      updateActiveTab({
                        storePickupDate: e.target.value,
                      })
                    }
                    className="w-full text-[12.5px] pl-8 pr-2 py-1.5 focus:outline-none focus:ring-1 rounded-lg bg-white"
                    style={{
                      border: "1px solid var(--grid-border)",
                      color: "var(--text-main)",
                    }}
                  />
                </div>
              </div>
              <p
                className="text-[11px] italic"
                style={{ color: "var(--text-placeholder)" }}
              >
                {activeTab.storePickupDate
                  ? `Khách hẹn lấy tại cửa hàng ngày ${activeTab.storePickupDate.split("-").reverse().join("/")}`
                  : "Để trống nếu khách lấy ngay tại cửa hàng"}
              </p>
              {expectedReadyDate && (
                <p className={`text-[10px] font-bold flex items-center gap-1 ml-1 ${workshopStats.buffer > 0 ? 'text-amber-600 animate-pulse' : 'text-blue-600'}`}>
                  <AlertCircle size={10} />
                  Gợi ý xưởng xong: {expectedReadyDate.split("-").reverse().join("/")} 
                  {workshopStats.buffer > 0 && ` (+${workshopStats.buffer}n chờ xưởng)`}
                </p>
              )}
            </div>
          )}

          {/* ── Giao tận nơi — date picker ── */}
          {activeTab.deliveryMethod === "delivery" && (
            <div className="flex items-center gap-2 mt-1">
              <span
                className="text-[13px] shrink-0"
                style={{ color: "var(--text-secondary)" }}
              >
                Giao vào ngày:
              </span>
              <div className="relative flex-1">
                <Calendar
                  size={14}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-placeholder)" }}
                />
                <input
                  type="date"
                  value={activeTab.deliveryDate || ""}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) =>
                    updateActiveTab({ deliveryDate: e.target.value })
                  }
                  className="w-full text-[13px] pl-8 pr-2 py-1.5 focus:outline-none focus:ring-1 rounded-lg bg-white"
                  style={{
                    border: "1px solid var(--grid-border)",
                    color: "var(--text-main)",
                  }}
                />
              </div>
              {expectedReadyDate && (
                <p className={`text-[10px] font-bold flex items-center gap-1 mt-1 ${workshopStats.buffer > 0 ? 'text-amber-600 animate-pulse' : 'text-blue-600'}`}>
                  <AlertCircle size={10} />
                  Gợi ý xưởng xong: {expectedReadyDate.split("-").reverse().join("/")} 
                  {workshopStats.buffer > 0 && ` (+${workshopStats.buffer}n chờ xưởng)`}
                </p>
              )}
            </div>
          )}
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
            <span
              className="font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              <CreditCard size={12} className="inline mr-1.5" />
              Tiền đặt cọc
            </span>
            <div className="flex items-center gap-1">
              <span
                className="text-[13px]"
                style={{ color: "var(--text-placeholder)" }}
              >
                ₫
              </span>
              <input
                type="text"
                value={
                  activeTab.depositAmount
                    ? fmt(activeTab.depositAmount)
                    : ""
                }
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, "");
                  updateActiveTab({
                    depositAmount: parseInt(raw) || 0,
                  });
                }}
                placeholder="0"
                className="w-28 text-right text-[13px] font-medium rounded-lg px-2 py-1 focus:outline-none focus:ring-1 bg-white"
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
            className="h-11 px-8 text-sm font-bold text-white rounded-lg transition-all duration-200 active:scale-[0.97] cursor-pointer disabled:opacity-40"
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
  );
}
