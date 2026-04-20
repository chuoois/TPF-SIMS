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
  deposit: "",
  deliveryInfo: {
    address: "",
    district: "",
    ward: "",
    shippingNote: "",
  },
});

export const getNextItemId = () => `custom-${++itemIdCounter}`;

// ===================== SHARED INPUT STYLE =====================
export const inputBase =
  "w-full text-[13px] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all bg-white border border-gray-200 hover:border-gray-300";
export const inputStyle = {
  color: "var(--text-main)",
};
