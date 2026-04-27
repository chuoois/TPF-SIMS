/**
 * Mock Data & Constants — CustomOrderRequirementsPage
 *
 * ⚠️  Khi tích hợp backend, thay thế MOCK_CUSTOMERS bằng API service calls.
 */

export const WOOD_TYPES = [
  "Gỗ sồi",
  "Gỗ óc chó",
  "Gỗ tần bì",
  "Gỗ cao su",
  "Gỗ thông",
  "Gỗ hương",
];

export const DELIVERY_METHODS = {
  STORE: "store",
  DELIVERY: "delivery",
};

export const COLORS = [
  "Tự nhiên",
  "Nâu đậm",
  "Nâu nhạt",
  "Đen",
  "Trắng ngà",
  "Ghi xám",
];

export const MOCK_CUSTOMERS = [
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

// ===================== HELPERS =====================
export const fmt = (v) => new Intl.NumberFormat("vi-VN").format(v);

export const generateOrderCode = () => {
  const now = new Date();
  return `DH${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;
};

export const formatDateTime = () => {
  return new Date().toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

let tabIdCounter = 1;
let itemIdCounter = 0;

export const createEmptyTab = () => ({
  id: ++tabIdCounter,
  mode: "REQUIREMENT", // REQUIREMENT or DIRECT_ORDER
  cartItems: [],
  orderNote: "",
  selectedCustomer: null,
  customerName: "",
  customerPhone: "",
  expectedQuote: "",
  depositAmount: 0,
  discount: 0,
  deliveryMethod: DELIVERY_METHODS.STORE,
  deliveryDate: "",
  storePickupDate: "",
});

/**
 * Calculate deposit based on business rules for custom orders
 * Usually higher than in-stock (e.g. 40-50%)
 */
export const calculateSuggestedDeposit = (subtotal) => {
  if (!subtotal || subtotal <= 0) {
    return { amount: 0, percentage: 0, reason: "", rate: 0 };
  }

  const rate = 0.5;
  let amount = Math.round((subtotal * rate) / 10000) * 10000;
  amount = Math.min(amount, subtotal);

  return {
    amount,
    percentage: Math.round(rate * 100),
    rate,
    reason: "Đơn hàng đặt làm riêng (Yêu cầu cọc 50% để nhập phôi gỗ)",
  };
};

export const getNextItemId = () => `custom-${++itemIdCounter}`;

// ===================== SHARED INPUT STYLE =====================
export const inputBase =
  "w-full text-[13px] rounded-lg px-4 py-3 focus:outline-none transition-all border";
export const inputStyle = {
  color: "var(--text-main)",
  borderColor: "var(--grid-border)",
  backgroundColor: "var(--bg-main)",
};
