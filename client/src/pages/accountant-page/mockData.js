// ═══════════════════════════════════════════════════════════
// ACCOUNTANT MOCK DATA – nguồn dữ liệu dùng chung
// ═══════════════════════════════════════════════════════════

// ── accountant-product/index.jsx ─────────────────────────
export const CATEGORIES = ["Phòng khách", "Phòng ngủ", "Phòng thờ", "Phòng ăn"];

export const ALL_PRODUCTS = [
  {
    id: "P001", sku: "BBG-HS-180x90x75-H", name: "Bộ bàn ghế Nghê Bảo Đỉnh 6 món",
    category: "Phòng khách", type: "FINISHED", materialType: "Gỗ Hương", color: "Hương",
    stock: 10, stockBreakdown: { available: 7, processing: 0, defective: 2, delivering: 1 },
    importPrice: 38000000, sellingPrice: 55000000, img: "https://placehold.co/80x80?text=SP001",
    length: "180", width: "90", height: "75", minStock: 2, importedAt: "2025-12-20",
    details: "Bộ 6 món gồm 1 bàn lớn, 4 ghế tựa và 1 ghế chủ. Chạm khắc hình nghê bảo đỉnh tinh xảo, sơn PU cao cấp.",
    isBundle: true, bundlePrice: 38000000,
    items: [{ _id: 1, name: "Bàn lớn", qty: 1 }, { _id: 2, name: "Ghế tựa", qty: 4 }, { _id: 3, name: "Ghế chủ", qty: 1 }],
    lots: [
      {
        lotId: "LOT-P001-001", importReceiptId: "PN-2025-0089", importDate: "2025-12-20",
        importPrice: 38000000, supplier: "Xưởng Minh Phát",
        units: [
          { unitId: "BBG-HS-001", status: "AVAILABLE", importDate: "2025-12-20", importPrice: 38000000, importReceiptId: "PN-2025-0089" },
          { unitId: "BBG-HS-002", status: "AVAILABLE", importDate: "2025-12-20", importPrice: 38000000, importReceiptId: "PN-2025-0089" },
          { unitId: "BBG-HS-003", status: "AVAILABLE", importDate: "2025-12-20", importPrice: 38000000, importReceiptId: "PN-2025-0089" },
          { unitId: "BBG-HS-004", status: "AVAILABLE", importDate: "2025-12-20", importPrice: 38000000, importReceiptId: "PN-2025-0089" },
          { unitId: "BBG-HS-005", status: "DEFECTIVE", importDate: "2025-12-20", importPrice: 38000000, importReceiptId: "PN-2025-0089" },
          { unitId: "BBG-HS-006", status: "SOLD", importDate: "2025-12-20", importPrice: 38000000, importReceiptId: "PN-2025-0089" },
        ],
      },
      {
        lotId: "LOT-P001-002", importReceiptId: "PN-2026-0012", importDate: "2026-02-15",
        importPrice: 40000000, supplier: "Xưởng Minh Phát",
        units: [
          { unitId: "BBG-HS-007", status: "AVAILABLE", importDate: "2026-02-15", importPrice: 40000000, importReceiptId: "PN-2026-0012" },
          { unitId: "BBG-HS-008", status: "AVAILABLE", importDate: "2026-02-15", importPrice: 40000000, importReceiptId: "PN-2026-0012" },
          { unitId: "BBG-HS-009", status: "PENDING_DELIVERY", importDate: "2026-02-15", importPrice: 40000000, importReceiptId: "PN-2026-0012" },
          { unitId: "BBG-HS-010", status: "DEFECTIVE", importDate: "2026-02-15", importPrice: 40000000, importReceiptId: "PN-2026-0012" },
        ],
      },
    ],
  },
  {
    id: "P003", sku: "STM-HS-200x100x60-C", name: "Sập thờ Mai Điểu chân 20",
    category: "Phòng thờ", type: "FINISHED", materialType: "Gỗ Gụ", color: "Chay",
    stock: 3, stockBreakdown: { available: 2, processing: 0, defective: 1, delivering: 0 },
    importPrice: 18000000, img: "https://placehold.co/80x80?text=SP003",
    length: "200", width: "100", height: "60", minStock: 1, importedAt: "2026-01-05",
    details: "Chạm khắc hoa văn mai điểu tứ quý, chân chạm 20 vòng. Gỗ gụ mật già, màu chay tự nhiên.",
    lots: [{ lotId: "LOT-P003-001", importReceiptId: "PN-2026-0003", importDate: "2026-01-05", importPrice: 18000000, supplier: "Xưởng Đại Thành",
      units: [
        { unitId: "STM-C-001", status: "AVAILABLE", importDate: "2026-01-05", importPrice: 18000000, importReceiptId: "PN-2026-0003" },
        { unitId: "STM-C-002", status: "AVAILABLE", importDate: "2026-01-05", importPrice: 18000000, importReceiptId: "PN-2026-0003" },
        { unitId: "STM-C-003", status: "DEFECTIVE", importDate: "2026-01-05", importPrice: 18000000, importReceiptId: "PN-2026-0003" },
      ],
    }],
  },
  {
    id: "P005", sku: "HPD-HS-120x40x5-H", name: "Hoành phi câu đối chạm rồng",
    category: "Phòng thờ", type: "FINISHED", materialType: "Gỗ Hương", color: "Hương",
    stock: 6, stockBreakdown: { available: 6, processing: 0, defective: 0, delivering: 0 },
    importPrice: 9500000, sellingPrice: 15000000, img: "https://placehold.co/80x80?text=SP005",
    length: "120", width: "40", height: "5", minStock: 2, importedAt: "2026-03-01",
    details: "Bộ hoành phi 1 tấm + 2 câu đối. Chạm rồng 5 móng nổi, sơn thiếp vàng 24k.",
    isBundle: true, bundlePrice: 9500000,
    items: [{ _id: 1, name: "Hoành phi", qty: 1 }, { _id: 2, name: "Câu đối", qty: 2 }],
    lots: [{ lotId: "LOT-P005-001", importReceiptId: "PN-2026-0031", importDate: "2026-03-01", importPrice: 9500000, supplier: "Xưởng Minh Phát",
      units: [
        { unitId: "HPD-H-001", status: "AVAILABLE", importDate: "2026-03-01", importPrice: 9500000, importReceiptId: "PN-2026-0031" },
        { unitId: "HPD-H-002", status: "AVAILABLE", importDate: "2026-03-01", importPrice: 9500000, importReceiptId: "PN-2026-0031" },
        { unitId: "HPD-H-003", status: "AVAILABLE", importDate: "2026-03-01", importPrice: 9500000, importReceiptId: "PN-2026-0031" },
        { unitId: "HPD-H-004", status: "AVAILABLE", importDate: "2026-03-01", importPrice: 9500000, importReceiptId: "PN-2026-0031" },
        { unitId: "HPD-H-005", status: "AVAILABLE", importDate: "2026-03-01", importPrice: 9500000, importReceiptId: "PN-2026-0031" },
        { unitId: "HPD-H-006", status: "AVAILABLE", importDate: "2026-03-01", importPrice: 9500000, importReceiptId: "PN-2026-0031" },
      ],
    }],
  },
  {
    id: "P006", sku: "BBA-HS-220x100x78-H", name: "Bộ bàn ăn 8 ghế nguyên khối",
    category: "Phòng ăn", type: "FINISHED", materialType: "Gỗ Hương", color: "Hương",
    stock: 3, stockBreakdown: { available: 2, processing: 0, defective: 0, delivering: 1 },
    importPrice: 32000000, sellingPrice: 48000000, img: "https://placehold.co/80x80?text=SP006",
    length: "220", width: "100", height: "78", minStock: 1, importedAt: "2026-02-10",
    details: "Bộ gồm 1 bàn + 8 ghế. Mặt bàn nguyên khối liền, chân chạm hoa văn truyền thống. Sơn PU bóng.",
    isBundle: true, bundlePrice: 32000000,
    items: [{ _id: 1, name: "Bàn ăn", qty: 1 }, { _id: 2, name: "Ghế ăn", qty: 8 }],
    lots: [{ lotId: "LOT-P006-001", importReceiptId: "PN-2026-0018", importDate: "2026-02-10", importPrice: 32000000, supplier: "Xưởng Trường Phát",
      units: [
        { unitId: "BBA-H-001", status: "AVAILABLE", importDate: "2026-02-10", importPrice: 32000000, importReceiptId: "PN-2026-0018" },
        { unitId: "BBA-H-002", status: "AVAILABLE", importDate: "2026-02-10", importPrice: 32000000, importReceiptId: "PN-2026-0018" },
        { unitId: "BBA-H-003", status: "PENDING_DELIVERY", importDate: "2026-02-10", importPrice: 32000000, importReceiptId: "PN-2026-0018" },
      ],
    }],
  },
  {
    id: "P007", sku: "KTV-HS-180x45x55-T", name: "Kệ tivi nguyên khối mặt liền",
    category: "Phòng khách", type: "FINISHED", materialType: "Gỗ Gõ Đỏ", color: "Trần",
    stock: 1, stockBreakdown: { available: 0, processing: 0, defective: 1, delivering: 0 },
    importPrice: 22000000, img: null, length: "180", width: "45", height: "55", minStock: 1, importedAt: "2025-12-01",
    details: "Kệ tivi 3 ngăn, mặt liền không mộng. Gỗ gõ đỏ trần tự nhiên, giữ vân gỗ.",
    lots: [{ lotId: "LOT-P007-001", importReceiptId: "PN-2025-0081", importDate: "2025-12-01", importPrice: 22000000, supplier: "Xưởng Bình Dương",
      units: [{ unitId: "KTV-T-001", status: "DEFECTIVE", importDate: "2025-12-01", importPrice: 22000000, importReceiptId: "PN-2025-0081" }],
    }],
  },
  {
    id: "P010", sku: "TRU-HS-120x40x180-OC", name: "Tủ rượu nguyên khối cánh kính",
    category: "Phòng khách", type: "FINISHED", materialType: "Gỗ Sồi Nga", color: "Óc chó",
    stock: 1, stockBreakdown: { available: 1, processing: 0, defective: 0, delivering: 0 },
    importPrice: 19000000, img: null, length: "120", width: "40", height: "180", minStock: 1, importedAt: "2025-11-15",
    details: "Tủ rượu cánh kính cường lực, thân gỗ sồi Nga, màu óc chó đậm. 3 tầng kệ bên trong.",
    lots: [{ lotId: "LOT-P010-001", importReceiptId: "PN-2025-0071", importDate: "2025-11-15", importPrice: 19000000, supplier: "Xưởng Sồi Nga",
      units: [{ unitId: "TRU-OC-001", status: "AVAILABLE", importDate: "2025-11-15", importPrice: 19000000, importReceiptId: "PN-2025-0071" }],
    }],
  },
  {
    id: "P002", sku: "SFA-HM-260x160x85-raw", name: "Sofa nguyên khối chữ L",
    category: "Phòng khách", type: "RAW", materialType: "Gỗ Gõ Đỏ", color: "raw",
    stock: 12, stockBreakdown: { available: 8, processing: 4, defective: 0, delivering: 0 },
    importPrice: 25000000, img: null, length: "260", width: "160", height: "85", minStock: 3, importedAt: "2026-01-10",
    details: "Khung sofa nguyên khối gỗ gõ đỏ, chưa bọc đệm. Dùng để bán thô hoặc gia công thêm.",
    lots: [
      { lotId: "LOT-P002-001", importReceiptId: "PN-2026-0005", importDate: "2026-01-10", importPrice: 25000000, supplier: "Xưởng Gỗ Miền Nam",
        units: [
          { unitId: "SFA-001", status: "AVAILABLE", importDate: "2026-01-10", importPrice: 25000000, importReceiptId: "PN-2026-0005" },
          { unitId: "SFA-002", status: "AVAILABLE", importDate: "2026-01-10", importPrice: 25000000, importReceiptId: "PN-2026-0005" },
          { unitId: "SFA-003", status: "AVAILABLE", importDate: "2026-01-10", importPrice: 25000000, importReceiptId: "PN-2026-0005" },
          { unitId: "SFA-004", status: "AVAILABLE", importDate: "2026-01-10", importPrice: 25000000, importReceiptId: "PN-2026-0005" },
          { unitId: "SFA-005", status: "PROCESSING", importDate: "2026-01-10", importPrice: 25000000, importReceiptId: "PN-2026-0005" },
          { unitId: "SFA-006", status: "PROCESSING", importDate: "2026-01-10", importPrice: 25000000, importReceiptId: "PN-2026-0005" },
          { unitId: "SFA-007", status: "SOLD", importDate: "2026-01-10", importPrice: 25000000, importReceiptId: "PN-2026-0005" },
        ],
      },
      { lotId: "LOT-P002-002", importReceiptId: "PN-2026-0022", importDate: "2026-02-28", importPrice: 25000000, supplier: "Xưởng Gỗ Miền Nam",
        units: [
          { unitId: "SFA-008", status: "AVAILABLE", importDate: "2026-02-28", importPrice: 25000000, importReceiptId: "PN-2026-0022" },
          { unitId: "SFA-009", status: "AVAILABLE", importDate: "2026-02-28", importPrice: 25000000, importReceiptId: "PN-2026-0022" },
          { unitId: "SFA-010", status: "AVAILABLE", importDate: "2026-02-28", importPrice: 25000000, importReceiptId: "PN-2026-0022" },
          { unitId: "SFA-011", status: "AVAILABLE", importDate: "2026-02-28", importPrice: 25000000, importReceiptId: "PN-2026-0022" },
          { unitId: "SFA-012", status: "PROCESSING", importDate: "2026-02-28", importPrice: 25000000, importReceiptId: "PN-2026-0022" },
        ],
      },
    ],
  },
  {
    id: "P012", sku: "GHV-HM-45x45x95-raw", name: "Ghế chạm hoa văn (mộc)",
    category: "Phòng ăn", type: "RAW", materialType: "Gỗ Mít", color: "raw",
    stock: 20, stockBreakdown: { available: 16, processing: 3, defective: 1, delivering: 0 },
    importPrice: 3500000, img: null, length: "45", width: "45", height: "95", minStock: 5, importedAt: "2025-10-01",
    details: "Ghế ăn phôi thô, khung chạm hoa văn dây leo. Bộ 4–8 chiếc tùy đơn.",
    lots: [{ lotId: "LOT-P012-001", importReceiptId: "PN-2025-0055", importDate: "2025-10-01", importPrice: 3500000, supplier: "Xưởng Tiền Giang",
      units: Array.from({ length: 20 }, (_, i) => ({
        unitId: `GHV-${String(i + 1).padStart(3, "0")}`,
        status: i < 16 ? "AVAILABLE" : i < 19 ? "PROCESSING" : "DEFECTIVE",
        importDate: "2025-10-01", importPrice: 3500000, importReceiptId: "PN-2025-0055",
      })),
    }],
  },
  {
    id: "P013", sku: "BBG-KD-180x90x75-H", name: "Bộ bàn ghế Nghê Bảo Đỉnh 6 món – ĐĐ anh Tuấn",
    category: "Phòng khách", type: "CUSTOM", materialType: "Gỗ Hương", color: "Hương",
    stock: 2, stockBreakdown: { available: 0, processing: 2, defective: 0, delivering: 0 },
    importPrice: 42000000, sellingPrice: 65000000, img: null, length: "180", width: "90", height: "75",
    minStock: null, importedAt: "2026-03-10",
    details: "Đơn đặt của anh Tuấn. Bộ 6 món, yêu cầu chạm thêm hoa văn riêng. Dự kiến giao 25/03/2026.",
    isBundle: true, bundlePrice: 42000000,
    items: [{ _id: 1, name: "Bàn lớn (chạm riêng)", qty: 1 }, { _id: 2, name: "Ghế tựa", qty: 4 }, { _id: 3, name: "Ghế chủ", qty: 1 }],
    lots: [{ lotId: "LOT-P013-001", importReceiptId: "PN-2026-0033", importDate: "2026-03-10", importPrice: 42000000, supplier: "Xưởng Minh Phát",
      units: [
        { unitId: "BBG-KD-001", status: "PROCESSING", importDate: "2026-03-10", importPrice: 42000000, importReceiptId: "PN-2026-0033" },
        { unitId: "BBG-KD-002", status: "PROCESSING", importDate: "2026-03-10", importPrice: 42000000, importReceiptId: "PN-2026-0033" },
      ],
    }],
  },
  {
    id: "P014", sku: "GHH-KD-200x160x50-C", name: "Giường hoa hồng – ĐĐ cô Lan",
    category: "Phòng ngủ", type: "CUSTOM", materialType: "Gỗ Gụ", color: "Chay",
    stock: 1, stockBreakdown: { available: 0, processing: 0, defective: 0, delivering: 1 },
    importPrice: 22000000, img: null, length: "200", width: "160", height: "50",
    minStock: null, importedAt: "2026-03-12",
    details: "Đơn của cô Lan. Đã hoàn thiện, chờ khách nhận ngày 15/03/2026.",
    lots: [{ lotId: "LOT-P014-001", importReceiptId: "PN-2026-0035", importDate: "2026-03-12", importPrice: 22000000, supplier: "Xưởng Đại Thành",
      units: [{ unitId: "GHH-C-001", status: "PENDING_DELIVERY", importDate: "2026-03-12", importPrice: 22000000, importReceiptId: "PN-2026-0035" }],
    }],
  },
];

// ── CreateImportModal ─────────────────────────────────────
export const MATERIAL_TYPES = [
  "Gỗ Mít", "Gỗ Hương", "Gỗ Gụ", "Gỗ Gõ Đỏ",
  "Gỗ Sồi Nga", "Gỗ Óc Chó", "Gỗ Xà Cừ", "Gỗ Dổi",
  "Gỗ Lim", "Gỗ Trắc", "Gỗ Căm Xe",
];

export const IMPORT_CATEGORIES = [
  "Phòng Khách", "Phòng Ngủ", "Phòng Thờ", "Phòng Ăn",
  "Phòng Làm Việc", "Khác",
];

export const COLORS = ["Trần", "Chay", "Hương", "Óc chó", "Gõ đỏ", "Nguyên mộc"];

export const SUPPLIERS = [
  "Xưởng Minh Đức", "Xưởng An Bình", "Xưởng Tiến Phát", "Xưởng Hà Linh", "Xưởng Đồng Kỵ",
];

export const FORM_TYPES = [
  { value: "NEW", label: "Hàng mới", code: "HM" },
  { value: "READY", label: "Hàng nhập thêm", code: "HS" },
];

export const PRODUCT_TYPES = [
  { value: "RAW", label: "Hàng mộc", code: "HM" },
  { value: "CUSTOM", label: "Hàng khách đặt", code: "KD" },
  { value: "FINISHED", label: "Hàng có sẵn", code: "HS" },
  { value: "PROCESSING", label: "Đang gia công", code: "GC" },
];

export const MOCK_PRODUCTS = [
  { code: "SP-PK-001", name: "Bộ bàn ghế Nghê Bảo Đỉnh 6 món", category: "Phòng Khách", materialType: "Gỗ Hương", importPrice: 25000000 },
  { code: "HS-PK-001", name: "Sofa nguyên khối chữ L", category: "Phòng Khách", materialType: "Gỗ Gõ Đỏ", importPrice: 45000000 },
  { code: "SP-PT-001", name: "Sập thờ Mai Điểu chân 20", category: "Phòng Thờ", materialType: "Gỗ Gụ", importPrice: 18000000 },
  { code: "HS-PA-001", name: "Bộ bàn ăn 8 ghế nguyên khối", category: "Phòng Ăn", materialType: "Gỗ Hương", importPrice: 32000000 },
  { code: "HS-PN-001", name: "Giường ngủ hoa hồng Tân cổ điển", category: "Phòng Ngủ", materialType: "Gỗ Sồi Nga", importPrice: 12000000 },
];

export const MOCK_BUNDLES = [
  {
    code: "BO-PK-001", bundleName: "Bộ bàn ghế Nghê Bảo Đỉnh 6 món",
    category: "Phòng Khách", materialType: "Gỗ Hương", color: "Hương", productType: "FINISHED",
    items: [
      { _id: 1, name: "Bàn lớn", qty: 1, unitPrice: 12000000 },
      { _id: 2, name: "Ghế tựa", qty: 4, unitPrice: 2500000 },
      { _id: 3, name: "Ghế chủ", qty: 1, unitPrice: 3000000 },
    ],
  },
  {
    code: "BO-PA-001", bundleName: "Bộ bàn ăn 8 ghế nguyên khối",
    category: "Phòng Ăn", materialType: "Gỗ Hương", color: "Hương", productType: "FINISHED",
    items: [
      { _id: 1, name: "Bàn ăn", qty: 1, unitPrice: 20000000 },
      { _id: 2, name: "Ghế ăn", qty: 8, unitPrice: 1500000 },
    ],
  },
  {
    code: "BO-PN-001", bundleName: "Bộ phòng ngủ tân cổ điển",
    category: "Phòng Ngủ", materialType: "Gỗ Sồi Nga", color: "Óc chó", productType: "FINISHED",
    items: [
      { _id: 1, name: "Giường đôi", qty: 1, unitPrice: 15000000 },
      { _id: 2, name: "Tủ đầu giường", qty: 2, unitPrice: 3500000 },
      { _id: 3, name: "Tủ quần áo 4 cánh", qty: 1, unitPrice: 22000000 },
    ],
  },
  {
    code: "BO-PT-001", bundleName: "Bộ đồ thờ 5 món",
    category: "Phòng Thờ", materialType: "Gỗ Gụ", color: "Chay", productType: "FINISHED",
    items: [
      { _id: 1, name: "Bàn thờ", qty: 1, unitPrice: 18000000 },
      { _id: 2, name: "Sập thờ", qty: 1, unitPrice: 12000000 },
      { _id: 3, name: "Hoành phi", qty: 1, unitPrice: 5000000 },
      { _id: 4, name: "Câu đối", qty: 2, unitPrice: 3000000 },
    ],
  },
];

// ── accountant-import/index.jsx ───────────────────────────
export const INIT_IMPORTS = [
  {
    id: "NK001", code: "NK-0703-001", date: "2026-03-07T08:30:00",
    product: "Bộ bàn ghế Nghê Bảo Đỉnh 6 món", supplier: "Xưởng Minh Đức",
    qty: 5, unitPrice: 38000000, totalPrice: 190000000, warehouse: "Kho chính",
    lines: [
      { _id: 1, isBundle: true, bundleName: "Bộ bàn ghế Nghê Bảo Đỉnh 6 món", bundleCode: "BO-PK-001", formType: "READY", productType: "FINISHED", category: "Phòng Khách", materialType: "Gỗ Hương", color: "Hương", bundleQty: 3, bundlePrice: 38000000, details: "Bộ 6 món gồm 1 bàn + 4 ghế + 1 ghế chủ", items: [{ _id: 1, name: "Bàn lớn", qty: 1, unitPrice: 14000000 }, { _id: 2, name: "Ghế tựa", qty: 4, unitPrice: 4500000 }, { _id: 3, name: "Ghế chủ", qty: 1, unitPrice: 5500000 }] },
      { _id: 2, isBundle: true, bundleName: "Bộ bàn ghế Nghê Bảo Đỉnh 4 món", bundleCode: "BO-PK-002", formType: "NEW", productType: "FINISHED", category: "Phòng Khách", materialType: "Gỗ Hương", color: "Hương", bundleQty: 2, bundlePrice: 28000000, details: "Bộ 4 món", items: [{ _id: 1, name: "Bàn lớn", qty: 1, unitPrice: 10000000 }, { _id: 2, name: "Ghế tựa", qty: 2, unitPrice: 5000000 }, { _id: 3, name: "Ghế chủ", qty: 1, unitPrice: 8000000 }] },
    ],
  },
  {
    id: "NK002", code: "NK-0703-002", date: "2026-03-07T09:00:00",
    product: "Sofa nguyên khối chữ L", supplier: "Xưởng Tiến Phát",
    qty: 3, unitPrice: 25000000, totalPrice: 75000000, warehouse: "Kho chính",
    lines: [{ _id: 1, productName: "Sofa nguyên khối chữ L", productCode: "HS-PK-001", formType: "READY", productType: "FINISHED", category: "Phòng Khách", materialType: "Gỗ Gõ Đỏ", color: "Gõ đỏ", length: "260", width: "160", height: "85", qty: 3, importPrice: 25000000, details: "" }],
  },
  {
    id: "NK003", code: "NK-0603-001", date: "2026-03-06T14:00:00",
    product: "Sập thờ Mai Điểu chân 20", supplier: "Xưởng Minh Đức",
    qty: 2, unitPrice: 18000000, totalPrice: 36000000, warehouse: "Kho phụ",
    lines: [{ _id: 1, productName: "Sập thờ Mai Điểu chân 20", productCode: "SP-PT-001", formType: "NEW", productType: "FINISHED", category: "Phòng Thờ", materialType: "Gỗ Gụ", color: "Chay", length: "200", width: "100", height: "60", qty: 2, importPrice: 18000000, details: "Chạm khắc mai điểu, chân 20" }],
  },
  {
    id: "NK004", code: "NK-0503-001", date: "2026-03-05T10:30:00",
    product: "Bộ bàn ăn 8 ghế nguyên khối", supplier: "Xưởng An Bình",
    qty: 4, unitPrice: 32000000, totalPrice: 128000000, warehouse: "Kho chính",
    lines: [{ _id: 1, isBundle: true, bundleName: "Bộ bàn ăn 8 ghế nguyên khối", bundleCode: "BO-PA-001", formType: "READY", productType: "FINISHED", category: "Phòng Ăn", materialType: "Gỗ Hương", color: "Hương", bundleQty: 4, bundlePrice: 32000000, details: "Gồm 1 bàn + 8 ghế. Mặt bàn nguyên khối liền.", items: [{ _id: 1, name: "Bàn ăn", qty: 1, unitPrice: 20000000 }, { _id: 2, name: "Ghế ăn", qty: 8, unitPrice: 1500000 }] }],
  },
  {
    id: "NK005", code: "NK-0403-001", date: "2026-03-04T08:00:00",
    product: "Tủ quần áo 4 cánh chạm hoa lá tây", supplier: "Xưởng Tiến Phát",
    qty: 6, unitPrice: 22000000, totalPrice: 132000000, warehouse: "Kho chính",
    lines: [{ _id: 1, productName: "Tủ quần áo 4 cánh chạm hoa lá tây", productCode: "SP-PN-002", formType: "NEW", productType: "CUSTOM", category: "Phòng Ngủ", materialType: "Gỗ Gụ", color: "Chay", length: "220", width: "60", height: "240", qty: 6, importPrice: 22000000, details: "Hàng đặt theo mẫu của khách – Gia đình anh Minh" }],
  },
  {
    id: "NK006", code: "NK-0303-001", date: "2026-03-03T15:00:00",
    product: "Giường ngủ hoa hồng Tân cổ điển", supplier: "Xưởng Minh Đức",
    qty: 3, unitPrice: 15000000, totalPrice: 45000000, warehouse: "Kho phụ",
    lines: [{ _id: 1, productName: "Giường ngủ hoa hồng Tân cổ điển", productCode: "HS-PN-001", formType: "READY", productType: "FINISHED", category: "Phòng Ngủ", materialType: "Gỗ Sồi Nga", color: "Óc chó", length: "200", width: "160", height: "50", qty: 3, importPrice: 15000000, details: "" }],
  },
  {
    id: "NK007", code: "NK-0203-001", date: "2026-03-02T09:00:00",
    product: "Hoành phi câu đối chạm rồng", supplier: "Xưởng An Bình",
    qty: 8, unitPrice: 9500000, totalPrice: 76000000, warehouse: "Kho chính",
    lines: [{ _id: 1, isBundle: true, bundleName: "Hoành phi câu đối chạm rồng", bundleCode: "BO-PT-002", formType: "NEW", productType: "RAW", category: "Phòng Thờ", materialType: "Gỗ Mít", color: "Trần", bundleQty: 4, bundlePrice: 9500000, details: "Bộ 1 hoành phi + 1 cặp câu đối. Chạm rồng 5 móng, sơn thiếp vàng.", items: [{ _id: 1, name: "Hoành phi", qty: 1, unitPrice: 4000000 }, { _id: 2, name: "Câu đối chạm rồng", qty: 2, unitPrice: 2750000 }] }],
  },
  {
    id: "NK008", code: "NK-0103-001", date: "2026-03-01T08:30:00",
    product: "Bàn thờ chạm rồng cuốn thủy", supplier: "Xưởng Tiến Phát",
    qty: 5, unitPrice: 28000000, totalPrice: 140000000, warehouse: "Kho chính",
    lines: [{ _id: 1, productName: "Bàn thờ chạm rồng cuốn thủy", productCode: "SP-PT-004", formType: "NEW", productType: "FINISHED", category: "Phòng Thờ", materialType: "Gỗ Hương", color: "Hương", length: "180", width: "60", height: "100", qty: 5, importPrice: 28000000, details: "Chạm khắc rồng cuốn thủy, sơn vàng" }],
  },
];

// ── accountant-dashboard/index.jsx ────────────────────────
export const DASHBOARD_LOW_STOCK = [
  { id: "P007", sku: "KTV-HS-180x45x55-Tran", name: "Kệ tivi nguyên khối mặt liền", type: "FINISHED", category: "Phòng khách", stock: 0, minStock: 1 },
  { id: "P010", sku: "TRU-HS-120x40x180-OcCho", name: "Tủ rượu nguyên khối cánh kính", type: "FINISHED", category: "Phòng khách", stock: 1, minStock: 1 },
  { id: "P003", sku: "STM-HS-200x100x60-Chay", name: "Sập thờ Mai Điểu chân 20", type: "FINISHED", category: "Phòng thờ", stock: 1, minStock: 2 },
];

export const DASHBOARD_STATS = {
  totalProducts: 16, finishedCount: 8, rawCount: 4, customCount: 4,
  totalCategories: 4, lowStockCount: 3, totalInventoryQty: 98,
};

export const DASHBOARD_RECENT_IMPORTS = [
  { id: "NK001", code: "NK-0703-001", date: "2026-03-07T08:30:00", product: "Bộ bàn ghế Nghê Bảo Đỉnh 6 món", supplier: "Xưởng Minh Đức", qty: 5, totalPrice: 190000000 },
  { id: "NK002", code: "NK-0703-002", date: "2026-03-07T09:00:00", product: "Sofa nguyên khối chữ L", supplier: "Xưởng Tiến Phát", qty: 3, totalPrice: 75000000 },
  { id: "NK003", code: "NK-0603-001", date: "2026-03-06T14:00:00", product: "Sập thờ Mai Điểu chân 20", supplier: "Xưởng Minh Đức", qty: 2, totalPrice: 36000000 },
  { id: "NK004", code: "NK-0503-001", date: "2026-03-05T10:30:00", product: "Bộ bàn ăn 8 ghế nguyên khối", supplier: "Xưởng An Bình", qty: 4, totalPrice: 128000000 },
  { id: "NK005", code: "NK-0403-001", date: "2026-03-04T08:00:00", product: "Tủ quần áo 4 cánh chạm hoa lá tây", supplier: "Xưởng Tiến Phát", qty: 6, totalPrice: 132000000 },
];

export const DASHBOARD_LONG_STAY = [
  { id: "P010", name: "Tủ rượu nguyên khối cánh kính", sku: "TRU-HS-120x40x180-OcCho", category: "Phòng khách", type: "FINISHED", stock: 1, importedAt: "2025-11-15", importPrice: 19000000 },
  { id: "P007", name: "Kệ tivi nguyên khối mặt liền", sku: "KTV-HS-180x45x55-Tran", category: "Phòng khách", type: "FINISHED", stock: 0, importedAt: "2025-12-01", importPrice: 22000000 },
  { id: "P001", name: "Bộ bàn ghế Nghê Bảo Đỉnh 6 món", sku: "BBG-HS-180x90x75-Huong", category: "Phòng khách", type: "FINISHED", stock: 5, importedAt: "2025-12-20", importPrice: 38000000 },
  { id: "P004", name: "Giường ngủ hoa hồng Tân cổ điển (mộc)", sku: "GNG-HM-200x160x50-raw", category: "Phòng ngủ", type: "RAW", stock: 8, importedAt: "2025-12-10", importPrice: 12000000 },
  { id: "P012", name: "Ghế chạm hoa văn (mộc)", sku: "GHV-HM-45x45x95-raw", category: "Phòng ăn", type: "RAW", stock: 20, importedAt: "2025-10-01", importPrice: 3500000 },
];

// ── accountant-home/index.jsx ─────────────────────────────
export const HOME_MOCK_DATA = {
  customerDebt: {
    totalOrders: 5, remainingDebtOrders: 4, totalRemainingDebt: 53700000, settledOrders: 1,
    recentDebts: [
      { code: "HD260314A1B2C3", customer: "Nguyễn Văn A", total: 15500000, paid: 5000000, date: "10/03/2026" },
      { code: "HD260312X7Y8Z9", customer: "Lê Minh C", total: 25000000, paid: 10000000, date: "05/03/2026" },
      { code: "HD260313D4E5F6", customer: "Trần Thị B", total: 8200000, paid: 3000000, date: "12/03/2026" },
    ],
  },
  supplierDebt: {
    totalSuppliers: 4, debtSuppliers: 3, totalRemainingDebt: 550000000, settledSuppliers: 1,
    recentSuppliers: [
      { code: "NCC-TAM", name: "Xưởng gỗ mỹ nghệ Thành Tâm", totalImport: 1250000000, debt: 350000000 },
      { code: "NCC-PHAT", name: "Xưởng mộc nội thất Gia Phát", totalImport: 890000000, debt: 120000000 },
      { code: "NCC-MINH", name: "Cơ sở sản xuất gỗ Minh Long", totalImport: 620000000, debt: 80000000 },
      { code: "NCC-HAI", name: "Tổng kho gỗ nguyên liệu Nam Hải", totalImport: 4500000000, debt: 0 },
    ],
  },
  employeeSalary: {
    month: "03/2026", totalEmployees: 6, unpaidCount: 4, paidCount: 2, totalFund: 74000000,
    recentSalaries: [
      { id: "NV001", name: "Nguyễn Thị Mai", role: "Nhân viên bán hàng", type: "SALES", calc: "Lương tháng cố định", total: 11000000, status: "Chưa thanh toán" },
      { id: "NV002", name: "Trần Văn Khoa", role: "Nhân viên bán hàng", type: "SALES", calc: "Lương tháng cố định", total: 8500000, status: "Đã thanh toán" },
      { id: "NV003", name: "Lê Đình Chinh", role: "Nhân viên giấy ráp", type: "SANDER", calc: "400.000₫ × 22 ngày", total: 8800000, status: "Chưa thanh toán" },
      { id: "NV004", name: "Phạm Xuân Đạt", role: "Nhân viên giấy ráp", type: "SANDER", calc: "400.000₫ × 25 ngày", total: 10200000, status: "Chưa thanh toán" },
      { id: "NV005", name: "Đỗ Hữu Hùng", role: "Thợ sơn", type: "PAINTER", calc: "150.000₫ × 120 SP", total: 18000000, status: "Chưa thanh toán" },
      { id: "NV006", name: "Vũ Tấn Tài", role: "Thợ sơn", type: "PAINTER", calc: "200.000₫ × 85 SP", total: 17500000, status: "Đã thanh toán" },
    ],
  },
};

// ── customer-debt/index.jsx ───────────────────────────────
export const MOCK_DEBTS = [
  { id: "1", order_code: "HD260314A1B2C3", customer_name: "Nguyễn Văn A", phone_number: "0901234567", total_amount: 15500000, deposit_amount: 5000000, order_date: "10/03/2026", payment_history: [{ date: "10/03/2026", amount: 5000000, bill_img: "https://placehold.co/400x600?text=Deposit+Bill", note: "Đặt cọc tiền bàn ghế" }] },
  { id: "2", order_code: "HD260313D4E5F6", customer_name: "Trần Thị B", phone_number: "0987654321", total_amount: 8200000, deposit_amount: 3000000, order_date: "12/03/2026", payment_history: [{ date: "12/03/2026", amount: 3000000, bill_img: "https://placehold.co/400x600?text=Payment+Bill+1", note: "Thanh toán đợt 1" }] },
  { id: "3", order_code: "HD260312X7Y8Z9", customer_name: "Lê Minh C", phone_number: "0912223334", total_amount: 25000000, deposit_amount: 10000000, order_date: "05/03/2026", payment_history: [{ date: "05/03/2026", amount: 10000000, bill_img: "https://placehold.co/400x600?text=Deposit+Bill", note: "Đặt cọc thi công" }] },
  { id: "4", order_code: "HD260310P1Q2R3", customer_name: "Phạm Xuân D", phone_number: "0934445556", total_amount: 4500000, deposit_amount: 1500000, order_date: "01/03/2026", payment_history: [{ date: "01/03/2026", amount: 1500000, bill_img: "https://placehold.co/400x600?text=Deposit+Bill", note: "Đặt cọc hàng mộc" }] },
  { id: "5", order_code: "HD260305W1X2Y3", customer_name: "Hoàng Văn E", phone_number: "0966778899", total_amount: 10000000, deposit_amount: 10000000, order_date: "05/03/2026", payment_history: [{ date: "05/03/2026", amount: 10000000, bill_img: "https://placehold.co/400x600?text=Full+Payment+Bill", note: "Đã thanh toán hết" }] },
];

// ── supplier-debt/index.jsx ───────────────────────────────
export const INITIAL_SUPPLIERS = [
  {
    id: "NCC001", code: "NCC-TAM", name: "Xưởng gỗ mỹ nghệ Thành Tâm",
    contactPerson: "Nguyễn Văn Tâm", phone: "0901234567", email: "thanhtam@wood.com",
    address: "Làng nghề Đồng Kỵ, Từ Sơn, Bắc Ninh", totalImport: 1250000000, debt: 350000000,
    group: "Xưởng nội thất mỹ nghệ", notes: ["Đối tác chiến lược khu vực phía Bắc", "Cung cấp gỗ sồi chất lượng loại 1"],
    ledger: [
      { id: "TXP001", date: "2024-02-15 09:00", note: "Nhập lô gỗ sồi PN-2580", change: 200000000, balance: 200000000 },
      { id: "TXP002", date: "2024-02-20 15:30", note: "Chuyển khoản thanh toán đợt 1", change: -100000000, balance: 100000000, bill_img: "https://placehold.co/400x600?text=Bill+1" },
      { id: "TXP003", date: "2024-03-01 11:00", note: "Nhập lô gỗ hương PN-2601", change: 150000000, balance: 250000000 },
      { id: "TXP004", date: "2024-03-05 16:00", note: "Tiền mặt thanh toán đợt 2", change: -100000000, balance: 150000000, bill_img: "https://placehold.co/400x600?text=Bill+2" },
    ],
  },
  { id: "NCC002", code: "NCC-HAI", name: "Tổng kho gỗ nguyên liệu Nam Hải", contactPerson: "Trần Thế Hải", phone: "0912345678", email: "namhai@timber.vn", address: "Khu CN Thạch Thất, Hà Nội", totalImport: 4500000000, debt: 0, group: "Tổng kho gỗ nguyên liệu", notes: ["Chuyên gỗ lim và gỗ hương Nam Phi"], ledger: [] },
  { id: "NCC003", code: "NCC-PHAT", name: "Xưởng mộc nội thất Gia Phát", contactPerson: "Lê Văn Phát", phone: "0987654321", email: "giaphat@furniture.com", address: "Làng mộc Hữu Bằng, Thạch Thất, Hà Nội", totalImport: 890000000, debt: 120000000, group: "Xưởng mộc gia công", notes: [], ledger: [] },
  { id: "NCC004", code: "NCC-MINH", name: "Cơ sở sản xuất gỗ Minh Long", contactPerson: "Hoàng Minh Long", phone: "0923456789", email: "minhlong@gom.vn", address: "KCN Phú Nghĩa, Chương Mỹ, Hà Nội", totalImport: 620000000, debt: 80000000, group: "Xưởng mộc gia công", notes: ["Chuyên gỗ óc chó nhập khẩu"], ledger: [] },
];

export const MOCK_IMPORT_HISTORY = [
  { id: "PN001", code: "PN-2601", date: "2024-03-01 10:00", total: 150000000, status: "Đã nhập kho" },
  { id: "PN002", code: "PN-2605", date: "2024-03-05 14:30", total: 245000000, status: "Đang về" },
  { id: "PN003", code: "PN-2612", date: "2024-03-12 09:15", total: 89000000, status: "Đã nhập kho" },
];

export const MOCK_SHIPMENT_ITEMS = {
  "PN-2601": [
    { id: "I001", name: "Bộ bàn ghế Tần Thủy Hoàng (Gỗ Sồi)", quantity: 5, unitPrice: 15000000, total: 75000000 },
    { id: "I002", name: "Kệ tivi hoa hồng (Gỗ Hương)", quantity: 3, unitPrice: 25000000, total: 75000000 },
  ],
  "PN-2605": [
    { id: "I003", name: "Bộ Minh Quốc Đào (Gỗ Gụ)", quantity: 10, unitPrice: 20000000, total: 200000000 },
    { id: "I004", name: "Tranh mã đáo thành công", quantity: 5, unitPrice: 9000000, total: 45000000 },
  ],
  "PN-2612": [
    { id: "I005", name: "Tủ quần áo 4 cánh", quantity: 2, unitPrice: 30000000, total: 60000000 },
    { id: "I006", name: "Giường ngủ tân cổ điển", quantity: 1, unitPrice: 29000000, total: 29000000 },
  ],
};

// ── employee-salary/index.jsx ─────────────────────────────
const _getCurrentMonth = () => {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  return `${mm}/${now.getFullYear()}`;
};
const CURRENT_MONTH = _getCurrentMonth();

export const MOCK_EMPLOYEES = [
  { id: "NV001", name: "Nguyễn Thị Mai", role: "Nhân viên bán hàng", type: "SALES", base_rate: 400000, days_worked: 26, allowance: 1000000, products_finished: 0, products_log: [], status: "Chưa thanh toán", month: CURRENT_MONTH, payment_date: "" },
  { id: "NV002", name: "Trần Văn Khoa", role: "Nhân viên bán hàng", type: "SALES", base_rate: 350000, days_worked: 24, allowance: 500000, products_finished: 0, products_log: [], status: "Đã thanh toán", month: CURRENT_MONTH, payment_date: "15/03/2024" },
  { id: "KT001", name: "Lê Thị Hương", role: "Kế toán", type: "ACCOUNTANT", base_rate: 450000, days_worked: 26, allowance: 500000, products_finished: 0, products_log: [], status: "Chưa thanh toán", month: CURRENT_MONTH, payment_date: "" },
  { id: "NV003", name: "Lê Đình Chinh", role: "Nhân viên giấy ráp", type: "SANDER", base_rate: 400000, days_worked: 22, allowance: 0, products_finished: 0, products_log: [], status: "Chưa thanh toán", month: CURRENT_MONTH, payment_date: "" },
  { id: "NV004", name: "Phạm Xuân Đạt", role: "Nhân viên giấy ráp", type: "SANDER", base_rate: 400000, days_worked: 25, allowance: 200000, products_finished: 0, products_log: [], status: "Chưa thanh toán", month: CURRENT_MONTH, payment_date: "" },
  {
    id: "NV005", name: "Đỗ Hữu Hùng", role: "Thợ sơn", type: "PAINTER", base_rate: 150000, days_worked: 26, allowance: 0,
    products_log: [{ productName: "Tủ gỗ sồi A1", price: 150000, qty: 40 }, { productName: "Ghế gỗ teak", price: 120000, qty: 35 }, { productName: "Kệ sách đôi", price: 180000, qty: 45 }],
    products_finished: 120, status: "Chưa thanh toán", month: CURRENT_MONTH, payment_date: "",
  },
  {
    id: "NV006", name: "Vũ Tấn Tài", role: "Thợ sơn", type: "PAINTER", base_rate: 200000, days_worked: 20, allowance: 500000,
    products_log: [{ productName: "Bàn ăn gỗ thông", price: 200000, qty: 50 }, { productName: "Ghế bar", price: 200000, qty: 35 }],
    products_finished: 85, status: "Đã thanh toán", month: CURRENT_MONTH, payment_date: "20/03/2024",
  },
].map(emp => {
  if (emp.products_log?.length && emp.products_finished === 0) {
    emp.products_finished = emp.products_log.reduce((s, p) => s + (p.qty || 1), 0);
  }
  return emp;
});
