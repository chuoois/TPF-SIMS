// ═══════════════════════════════════════════════════════════
// ACCOUNTANT CONSTANTS – dữ liệu tĩnh dùng chung
// ═══════════════════════════════════════════════════════════

// ── accountant-product/index.jsx ─────────────────────────
export const CATEGORIES = ["Phòng khách", "Phòng ngủ", "Phòng thờ", "Phòng ăn"];

// ── CreateImportModal.jsx ────────────────────────────────
export const MATERIAL_TYPES = [
  "Gỗ Mít", "Gỗ Hương", "Gỗ Gụ", "Gỗ Gõ Đỏ",
  "Gỗ Sồi Nga", "Gỗ Óc Chó", "Gỗ Xà Cừ", "Gỗ Dổi",
  "Gỗ Lim", "Gỗ Trắc", "Gỗ Căm Xe",
];

export const COLORS = ["Trần", "Chay", "Hương", "Óc chó", "Gõ đỏ", "Nguyên mộc"];

export const PRODUCT_TYPES = [
  { value: "RAW", label: "Hàng mộc", code: "HM" },
  { value: "CUSTOM", label: "Hàng khách đặt", code: "KD" },
  { value: "FINISHED", label: "Hàng có sẵn", code: "HS" },
  { value: "PROCESSING", label: "Đang gia công", code: "GC" },
];
