/**
 * Constants & Helpers — InStockInvoicePage
 * Refactored for Production
 */

export const ITEMS_PER_PAGE = 15;
export const DEFAULT_WARRANTY = 12; // Mặc định nếu DB không có

export const PRODUCT_TYPES = {
  INSTOCK: "Hàng sẵn",
  RAW: "Hàng mộc",
  GIFT: "Quà tặng",
  CUSTOM: "Hàng custom",
};

export const DELIVERY_METHODS = {
  STORE: "store",
  DELIVERY: "delivery",
};

// ===================== HELPERS =====================
/**
 * Format currency to VNĐ
 */
export const fmt = (v) => {
  if (v === undefined || v === null) return "0";
  return new Intl.NumberFormat("vi-VN").format(v);
};

/**
 * Generate a new empty tab structure
 */
let tabIdCounter = Date.now();
export const createEmptyTab = () => ({
  id: ++tabIdCounter,
  cartItems: [],
  selectedCustomer: null,
  orderNote: "",
  discount: 0,
  depositAmount: 0,
  deliveryMethod: DELIVERY_METHODS.STORE,
  deliveryDate: "",
  storePickupDate: "",
});

/**
 * Calculate deposit based on business rules:
 * < 10M: 10%
 * >= 10M: 30%
 */
export const calculateSuggestedDeposit = (subtotal) => {
  if (!subtotal || subtotal <= 0) {
    return { amount: 0, percentage: 0, reason: "", rate: 0 };
  }

  const threshold = 10000000;
  const isHighValue = subtotal >= threshold;
  const rate = isHighValue ? 0.3 : 0.1;

  let amount = Math.round((subtotal * rate) / 10000) * 10000;
  amount = Math.min(amount, subtotal);

  return {
    amount,
    percentage: Math.round(rate * 100),
    rate,
    reason: isHighValue
      ? "Đơn hàng từ 10 triệu đồng trở lên (Cọc 30%)"
      : "Đơn hàng dưới 10 triệu đồng (Cọc 10%)",
  };
};
