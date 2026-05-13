import {
  Package, Clock, CheckCircle2, AlertCircle, XCircle, Hammer, Truck
} from "lucide-react";

export const PRODUCT_TYPES = {
  INSTOCK: "Hàng sẵn",
  RAW: "Hàng mộc",
  GIFT: "Quà tặng",
  CUSTOM: "Hàng custom", // Giữ nguyên để phân biệt logic fetch
};

export const DELIVERY_METHODS = {
  STORE: "store",
  DELIVERY: "delivery",
};



export const ORDER_CONFIG = {
  ITEMS_PER_PAGE: 15,
  DEFAULT_WARRANTY: 12,
  TYPES: ["Hàng mộc", "Hàng sẵn", "Hàng khách đặt"],
  TYPE_MAP: { 1: "Hàng mộc", 2: "Hàng sẵn", 3: "Hàng khách đặt" },
  REVERSE_TYPE_MAP: { "Hàng mộc": 1, "Hàng sẵn": 2, "Hàng khách đặt": 3 },

  STATUS_MAP: {
    0: "Đơn đã hủy", 1: "Chờ sản xuất", 2: "Chờ xử lý", 3: "Đang gia công",
    4: "Chờ giao hàng", 5: "Đang giao hàng", 6: "Hoàn thành", 7: "Chờ duyệt hủy"
  },

  REVERSE_STATUS_MAP: {
    "Đơn đã hủy": 0, "Chờ sản xuất": 1, "Chờ xử lý": 2, "Đang gia công": 3,
    "Chờ giao hàng": 4, "Đang giao hàng": 5, "Hoàn thành": 6, "Chờ duyệt hủy": 7
  },

  STATUSES_BY_TYPE: {
    "Hàng mộc": ["Chờ xử lý", "Đang gia công", "Chờ giao hàng", "Đang giao hàng", "Hoàn thành", "Chờ duyệt hủy", "Đơn đã hủy"],
    "Hàng sẵn": ["Chờ giao hàng", "Đang giao hàng", "Hoàn thành", "Chờ duyệt hủy", "Đơn đã hủy"],
    "Hàng khách đặt": ["Chờ sản xuất", "Chờ xử lý", "Đang gia công", "Chờ giao hàng", "Đang giao hàng", "Hoàn thành", "Chờ duyệt hủy", "Đơn đã hủy"]
  },

  STATUS_STYLE: {
    "Chờ xử lý": { bg: "#f0f9ff", text: "#0369a1", border: "#e0f2fe", icon: Clock },
    "Chờ sản xuất": { bg: "#fffbeb", text: "#d97706", border: "#fef3c7", icon: Package },
    "Đang gia công": { bg: "#fff7ed", text: "#ea580c", border: "#ffedd5", icon: Hammer },
    "Chờ giao hàng": { bg: "#f5f3ff", text: "#7c3aed", border: "#ede9fe", icon: Package },
    "Đang giao hàng": { bg: "#e0f2fe", text: "#0284c7", border: "#bae6fd", icon: Truck },
    "Hoàn thành": { bg: "#f0fdf4", text: "#16a34a", border: "#dcfce7", icon: CheckCircle2 },
    "Chờ duyệt hủy": { bg: "#fff1f2", text: "#e11d48", border: "#ffe4e6", icon: AlertCircle },
    "Đơn đã hủy": { bg: "#f9fafb", text: "#4b5563", border: "#f3f4f6", icon: XCircle },
  }
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
  isFullPayment: false,
  depositAmount: 0,
  deliveryMethod: DELIVERY_METHODS.STORE,
  deliveryDate: "",
  storePickupDate: "",

});
