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
    stock: 1, stockBreakdown: { available: 0, processing: 1, defective: 0, delivering: 0 },
    importPrice: 22000000, img: null, length: "200", width: "160", height: "50",
    minStock: null, importedAt: "2026-03-12",
    details: "Đơn của cô Lan. Đang hoàn thiện phần sơn.",
    lots: [{ lotId: "LOT-P014-001", importReceiptId: "PN-2026-0035", importDate: "2026-03-12", importPrice: 22000000, supplier: "Xưởng Đại Thành",
      units: [{ unitId: "GHH-C-001", status: "PROCESSING", importDate: "2026-03-12", importPrice: 22000000, importReceiptId: "PN-2026-0035" }],
    }],
  },
  {
    id: "P015", sku: "TQA-KD-220x60x240-OC", name: "Tủ quần áo 4 cánh – ĐĐ KS Mường Thanh",
    category: "Phòng ngủ", type: "CUSTOM", materialType: "Gỗ Sồi Nga", color: "Óc chó",
    stock: 5, stockBreakdown: { available: 0, processing: 5, defective: 0, delivering: 0 },
    importPrice: 15000000, img: null, length: "220", width: "60", height: "240",
    minStock: null, importedAt: "2026-04-01",
    details: "Đơn dự án KS Mường Thanh. Tủ 4 cánh Tân cổ điển.",
    orderCode: "HD-MT-001",
    lots: [],
  },
  {
    id: "P016", sku: "GND-KD-200x180x45-OC", name: "Giường đôi bọc đệm – ĐĐ KS Mường Thanh",
    category: "Phòng ngủ", type: "CUSTOM", materialType: "Gỗ Sồi Nga", color: "Óc chó",
    stock: 5, stockBreakdown: { available: 0, processing: 5, defective: 0, delivering: 0 },
    importPrice: 8500000, img: null, length: "200", width: "180", height: "45",
    minStock: null, importedAt: "2026-04-01",
    details: "Đơn dự án KS Mường Thanh. Giường bọc đệm nỉ Hàn Quốc.",
    orderCode: "HD-MT-001",
    lots: [],
  },
  {
    id: "P017", sku: "KTV-KD-160x40x55-OC", name: "Kệ Tivi kết hợp mini bar – ĐĐ KS Mường Thanh",
    category: "Phòng khách", type: "CUSTOM", materialType: "Gỗ Sồi Nga", color: "Óc chó",
    stock: 5, stockBreakdown: { available: 0, processing: 5, defective: 0, delivering: 0 },
    importPrice: 4200000, img: null, length: "160", width: "40", height: "55",
    minStock: null, importedAt: "2026-04-01",
    details: "Đơn dự án KS Mường Thanh.",
    orderCode: "HD-MT-001",
    lots: [],
  },
  {
    id: "P018", sku: "BBA-KD-180x90x75-H", name: "Bàn ăn nguyên khối – ĐĐ khách Chú Minh",
    category: "Phòng ăn", type: "CUSTOM", materialType: "Gỗ Hương", color: "Hương",
    stock: 1, stockBreakdown: { available: 0, processing: 1, defective: 0, delivering: 0 },
    importPrice: 22000000, img: null, length: "180", width: "90", height: "75",
    minStock: null, importedAt: "2026-04-05",
    details: "Nhà chú Minh ở Ninh Hiệp. Mặt bàn nguyên khối dày 10cm.",
    orderCode: "HD260405-M01",
    lots: [],
  },
  {
    id: "P019", sku: "GHA-KD-45x45x105-H", name: "Ghế ăn tựa cao hoa lá tây – ĐĐ khách Chú Minh",
    category: "Phòng ăn", type: "CUSTOM", materialType: "Gỗ Hương", color: "Hương",
    stock: 8, stockBreakdown: { available: 0, processing: 8, defective: 0, delivering: 0 },
    importPrice: 2500000, img: null, length: "45", width: "45", height: "105",
    minStock: null, importedAt: "2026-04-05",
    details: "Đi kèm bộ bàn ăn mặt nguyên khối.",
    orderCode: "HD260405-M01",
    lots: [],
  }
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

export const MOCK_IMPORT_REQUESTS = [
  {
    id: "REQ001",
    requestCode: "YC-2604-01",
    date: "2026-04-15",
    createdBy: "Xưởng Minh Đức",
    supplier: "Xưởng Minh Đức",
    note: "Nhập bổ sung nội thất sồi Nga",
    status: "PENDING",
    items: [
      {
        id: "RI001",
        productCode: "SP-PN-002",
        productName: "Tủ quần áo 4 cánh chạm hoa lá tây",
        category: "Phòng Ngủ",
        materialType: "Gỗ Sồi Nga",
        color: "Óc chó",
        length: "220", width: "60", height: "240",
        productType: "FINISHED",
        requestedQty: 5,
        estimatedPrice: 22000000,
        isBundle: false
      },
      {
        id: "RI002",
        productCode: "HS-PN-001",
        productName: "Giường ngủ hoa hồng Tân cổ điển",
        category: "Phòng Ngủ",
        materialType: "Gỗ Sồi Nga",
        color: "Óc chó",
        length: "200", width: "160", height: "50",
        productType: "FINISHED",
        requestedQty: 3,
        estimatedPrice: 15000000,
        isBundle: false
      }
    ]
  },
  {
    id: "REQ002",
    requestCode: "YC-2604-02",
    date: "2026-04-16",
    createdBy: "Xưởng Tiến Phát",
    supplier: "Xưởng Tiến Phát",
    note: "Nhập gấp bộ phòng ăn cho khách sỉ",
    status: "PENDING",
    items: [
      {
        id: "RI003",
        productCode: "BO-PA-001",
        bundleCode: "BO-PA-001",
        bundleName: "Bộ bàn ăn 8 ghế nguyên khối",
        category: "Phòng Ăn",
        materialType: "Gỗ Hương",
        color: "Hương",
        productType: "FINISHED",
        requestedQty: 4,
        estimatedPrice: 32000000,
        isBundle: true,
        items: [
          { _id: 1, name: "Bàn ăn", qty: 1 },
          { _id: 2, name: "Ghế ăn", qty: 8 }
        ]
      }
    ]
  }
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

// ── accountant-home/index.jsx – Tổng quan tài chính ──────
// Đơn hàng đã hoàn thành (doanh thu) – 6 tháng
export const COMPLETED_ORDERS = [
  // Tháng 10/2025
  { id: "DH-1001", code: "HD251002-001", customer: "Công ty Nội thất Minh Đại",   total_amount: 125000000, month: "10/2025", date: "02/10/2025" },
  { id: "DH-1002", code: "HD251010-002", customer: "Nguyễn Hữu Toàn",             total_amount:  48000000, month: "10/2025", date: "10/10/2025" },
  { id: "DH-1003", code: "HD251018-003", customer: "Trần Thị Hoa",                total_amount:  35000000, month: "10/2025", date: "18/10/2025" },
  { id: "DH-1004", code: "HD251025-004", customer: "KS Mường Thanh Hà Nội",       total_amount: 220000000, month: "10/2025", date: "25/10/2025" },
  // Tháng 11/2025
  { id: "DH-1101", code: "HD251105-001", customer: "Lê Văn Sơn",                  total_amount:  62000000, month: "11/2025", date: "05/11/2025" },
  { id: "DH-1102", code: "HD251112-002", customer: "Phạm Thị Ngọc",               total_amount:  29000000, month: "11/2025", date: "12/11/2025" },
  { id: "DH-1103", code: "HD251120-003", customer: "Showroom Đồ Gỗ Đức Hưng",    total_amount:  98000000, month: "11/2025", date: "20/11/2025" },
  { id: "DH-1104", code: "HD251128-004", customer: "Hoàng Văn Bình",              total_amount:  44000000, month: "11/2025", date: "28/11/2025" },
  // Tháng 12/2025
  { id: "DH-1201", code: "HD251203-001", customer: "Cty TNHH Thiên Phú",          total_amount: 185000000, month: "12/2025", date: "03/12/2025" },
  { id: "DH-1202", code: "HD251210-002", customer: "Đặng Minh Quân",              total_amount:  55000000, month: "12/2025", date: "10/12/2025" },
  { id: "DH-1203", code: "HD251215-003", customer: "Vũ Thị Lan Anh",             total_amount:  40000000, month: "12/2025", date: "15/12/2025" },
  { id: "DH-1204", code: "HD251222-004", customer: "Resort Sao Biển Phú Quốc",    total_amount: 310000000, month: "12/2025", date: "22/12/2025" },
  { id: "DH-1205", code: "HD251228-005", customer: "Bùi Anh Tuấn",               total_amount:  78000000, month: "12/2025", date: "28/12/2025" },
  // Tháng 01/2026
  { id: "DH-0101", code: "HD260102-001", customer: "Nguyễn Văn A",               total_amount:  55000000, month: "01/2026", date: "02/01/2026" },
  { id: "DH-0102", code: "HD260108-002", customer: "Cty CP Đầu tư Đại Việt",     total_amount: 142000000, month: "01/2026", date: "08/01/2026" },
  { id: "DH-0103", code: "HD260115-003", customer: "Lê Thị B",                   total_amount:  48000000, month: "01/2026", date: "15/01/2026" },
  { id: "DH-0104", code: "HD260120-004", customer: "Phạm Văn C",                 total_amount:  32000000, month: "01/2026", date: "20/01/2026" },
  { id: "DH-0105", code: "HD260125-005", customer: "Nguyễn Thị Dung",            total_amount:  67000000, month: "01/2026", date: "25/01/2026" },
  // Tháng 02/2026
  { id: "DH-0201", code: "HD260205-001", customer: "Trần Minh D",                total_amount:  65000000, month: "02/2026", date: "05/02/2026" },
  { id: "DH-0202", code: "HD260210-002", customer: "Lê Hoàng Nam",               total_amount:  89000000, month: "02/2026", date: "10/02/2026" },
  { id: "DH-0203", code: "HD260214-003", customer: "Phòng khám Đa khoa Thắng Lợi",total_amount: 175000000, month: "02/2026", date: "14/02/2026" },
  { id: "DH-0204", code: "HD260218-004", customer: "Hoàng Lan E",                total_amount:  28000000, month: "02/2026", date: "18/02/2026" },
  { id: "DH-0205", code: "HD260224-005", customer: "Trịnh Xuân Mạnh",            total_amount:  52000000, month: "02/2026", date: "24/02/2026" },
  // Tháng 03/2026
  { id: "DH-0301", code: "HD260305-001", customer: "Cty Nội thất Hòa Phát",      total_amount: 138000000, month: "03/2026", date: "05/03/2026" },
  { id: "DH-0302", code: "HD260310-002", customer: "Vũ Đức F",                   total_amount:  90000000, month: "03/2026", date: "10/03/2026" },
  { id: "DH-0303", code: "HD260312-003", customer: "Khách sạn Hoàng Gia",        total_amount: 260000000, month: "03/2026", date: "12/03/2026" },
  { id: "DH-0304", code: "HD260315-004", customer: "Đỗ Thị G",                   total_amount:  42000000, month: "03/2026", date: "15/03/2026" },
  { id: "DH-0305", code: "HD260322-005", customer: "Ngô Xuân H",                 total_amount:  15000000, month: "03/2026", date: "22/03/2026" },
  { id: "DH-0306", code: "HD260328-006", customer: "Phan Văn Tú",                total_amount:  73000000, month: "03/2026", date: "28/03/2026" },
];

// Chi phí nhập hàng theo tháng
export const IMPORT_COSTS_BY_MONTH = [
  { month: "10/2025", total: 385000000 },
  { month: "11/2025", total: 198000000 },
  { month: "12/2025", total: 560000000 },
  { month: "01/2026", total: 243000000 },
  { month: "02/2026", total: 315000000 },
  { month: "03/2026", total: 822000000 },
];

// Lương nhân viên theo tháng
export const SALARY_COSTS_BY_MONTH = [
  { month: "10/2025", total: 62000000 },
  { month: "11/2025", total: 65500000 },
  { month: "12/2025", total: 74800000 },
  { month: "01/2026", total: 68500000 },
  { month: "02/2026", total: 71200000 },
  { month: "03/2026", total: 57400000 },
];

// Dòng tiền – tiền đặt cọc
export const CASH_FLOW_DEPOSITS = [
  // ── Tháng 10/2025 ──
  { id: "CF-1001", date: "01/10/2025", month: "10/2025", type: "IMPORT_DEPOSIT",   label: "Đặt cọc nhập hàng – Xưởng Minh Phát (Lô gỗ hương)",          amount: 120000000 },
  { id: "CF-1002", date: "05/10/2025", month: "10/2025", type: "CUSTOMER_DEPOSIT", label: "Cọc đơn HD251002-001 – Cty Nội thất Minh Đại",                amount:  60000000 },
  { id: "CF-1003", date: "15/10/2025", month: "10/2025", type: "CUSTOMER_DEPOSIT", label: "Cọc đơn HD251025-004 – KS Mường Thanh",                       amount: 100000000 },
  { id: "CF-1004", date: "20/10/2025", month: "10/2025", type: "IMPORT_DEPOSIT",   label: "Đặt cọc nhập hàng – Xưởng Đại Thành (Lô gỗ gụ)",             amount:  80000000 },
  { id: "CF-1005", date: "28/10/2025", month: "10/2025", type: "REFUND_DEPOSIT",   label: "Hoàn cọc đơn HD251001-X01 – Khách đổi sang mẫu khác",        amount:  -12000000 },
  // ── Tháng 11/2025 ──
  { id: "CF-1101", date: "03/11/2025", month: "11/2025", type: "CUSTOMER_DEPOSIT", label: "Cọc đơn HD251105-001 – Lê Văn Sơn",                          amount:  25000000 },
  { id: "CF-1102", date: "08/11/2025", month: "11/2025", type: "IMPORT_DEPOSIT",   label: "Đặt cọc nhập hàng – Xưởng Tiến Phát (Sồi Nga)",             amount:  60000000 },
  { id: "CF-1103", date: "15/11/2025", month: "11/2025", type: "CUSTOMER_DEPOSIT", label: "Cọc đơn HD251120-003 – Showroom Đức Hưng",                   amount:  45000000 },
  { id: "CF-1104", date: "25/11/2025", month: "11/2025", type: "REFUND_DEPOSIT",   label: "Hoàn cọc đơn HD251105-X02 – Khách hủy do tài chính",         amount:   -8000000 },
  // ── Tháng 12/2025 ──
  { id: "CF-1201", date: "01/12/2025", month: "12/2025", type: "IMPORT_DEPOSIT",   label: "Đặt cọc nhập hàng – Xưởng An Bình (Gỗ hương lô lớn)",       amount: 180000000 },
  { id: "CF-1202", date: "05/12/2025", month: "12/2025", type: "CUSTOMER_DEPOSIT", label: "Cọc đơn HD251203-001 – Cty TNHH Thiên Phú",                  amount:  90000000 },
  { id: "CF-1203", date: "10/12/2025", month: "12/2025", type: "CUSTOMER_DEPOSIT", label: "Cọc đơn HD251222-004 – Resort Sao Biển Phú Quốc",             amount: 150000000 },
  { id: "CF-1204", date: "15/12/2025", month: "12/2025", type: "IMPORT_DEPOSIT",   label: "Đặt cọc nhập hàng – Xưởng Minh Đức (Gỗ gõ đỏ)",            amount:  90000000 },
  { id: "CF-1205", date: "20/12/2025", month: "12/2025", type: "REFUND_DEPOSIT",   label: "Hoàn cọc đơn HD251201-X03 – Khách hủy sau khi xưởng GC 30%", amount:  -15000000 },
  { id: "CF-1206", date: "28/12/2025", month: "12/2025", type: "CUSTOMER_DEPOSIT", label: "Cọc đơn HD251228-005 – Bùi Anh Tuấn",                        amount:  35000000 },
  // ── Tháng 01/2026 ──
  { id: "CF-0101", date: "02/01/2026", month: "01/2026", type: "IMPORT_DEPOSIT",   label: "Đặt cọc nhập hàng – Xưởng Minh Phát (Lô gỗ hương Q1)",      amount:  50000000 },
  { id: "CF-0102", date: "08/01/2026", month: "01/2026", type: "CUSTOMER_DEPOSIT", label: "Cọc đơn HD260108-002 – Cty CP Đầu tư Đại Việt",              amount:  70000000 },
  { id: "CF-0103", date: "15/01/2026", month: "01/2026", type: "CUSTOMER_DEPOSIT", label: "Cọc đơn HD260115-003 – Lê Thị B",                            amount:  20000000 },
  { id: "CF-0104", date: "20/01/2026", month: "01/2026", type: "REFUND_DEPOSIT",   label: "Hoàn cọc đơn HD260101-X01 – Bùi Văn K (hủy sau 30 ngày)",   amount:   -5000000 },
  { id: "CF-0105", date: "25/01/2026", month: "01/2026", type: "CUSTOMER_DEPOSIT", label: "Cọc đơn HD260125-005 – Nguyễn Thị Dung",                     amount:  30000000 },
  // ── Tháng 02/2026 ──
  { id: "CF-0201", date: "05/02/2026", month: "02/2026", type: "IMPORT_DEPOSIT",   label: "Đặt cọc nhập hàng – Xưởng Tiến Phát (Bộ sập thờ)",          amount:  80000000 },
  { id: "CF-0202", date: "10/02/2026", month: "02/2026", type: "CUSTOMER_DEPOSIT", label: "Cọc đơn HD260210-002 – Lê Hoàng Nam",                        amount:  40000000 },
  { id: "CF-0203", date: "14/02/2026", month: "02/2026", type: "CUSTOMER_DEPOSIT", label: "Cọc đơn HD260214-003 – Phòng khám Thắng Lợi",                amount:  85000000 },
  { id: "CF-0204", date: "20/02/2026", month: "02/2026", type: "CUSTOMER_DEPOSIT", label: "Cọc đơn HD260218-004 – Hoàng Lan E",                         amount:  10000000 },
  { id: "CF-0205", date: "25/02/2026", month: "02/2026", type: "REFUND_DEPOSIT",   label: "Hoàn cọc đơn HD260210-X01 – Khách đổi mẫu",                  amount:   -8000000 },
  // ── Tháng 03/2026 ──
  { id: "CF-0301", date: "03/03/2026", month: "03/2026", type: "IMPORT_DEPOSIT",   label: "Đặt cọc nhập hàng – Xưởng An Bình (Gỗ sồi Nga lô Q1)",      amount:  60000000 },
  { id: "CF-0302", date: "05/03/2026", month: "03/2026", type: "CUSTOMER_DEPOSIT", label: "Cọc đơn HD260305-001 – Cty Nội thất Hòa Phát",               amount:  65000000 },
  { id: "CF-0303", date: "10/03/2026", month: "03/2026", type: "CUSTOMER_DEPOSIT", label: "Cọc đơn HD260310-002 – Vũ Đức F",                            amount:  30000000 },
  { id: "CF-0304", date: "12/03/2026", month: "03/2026", type: "CUSTOMER_DEPOSIT", label: "Cọc đơn HD260312-003 – KS Hoàng Gia",                        amount: 120000000 },
  { id: "CF-0305", date: "15/03/2026", month: "03/2026", type: "CUSTOMER_DEPOSIT", label: "Cọc đơn HD260315-004 – Đỗ Thị G",                            amount:  15000000 },
  { id: "CF-0306", date: "18/03/2026", month: "03/2026", type: "REFUND_DEPOSIT",   label: "Hoàn cọc đơn HD260301-002 – Khách hủy lý do cá nhân",        amount:   -5000000 },
  { id: "CF-0307", date: "20/03/2026", month: "03/2026", type: "IMPORT_DEPOSIT",   label: "Đặt cọc nhập hàng – Xưởng Minh Phát (Hoành phi câu đối)",    amount:  40000000 },
];

// Doanh thu bất thường – thu cọc từ đơn khách hủy do lỗi khách
export const ABNORMAL_REVENUE = [
  { id: "AB-1001", date: "28/10/2025", month: "10/2025", order_code: "HD251001-X01", customer: "Cao Văn Hải",       deposit_kept:  12000000, reason: "Khách hủy đơn sau khi xưởng đã xuất kho nguyên liệu" },
  { id: "AB-1101", date: "25/11/2025", month: "11/2025", order_code: "HD251105-X02", customer: "Mai Thị Thanh",     deposit_kept:   8000000, reason: "Khách hủy đơn sau 30 ngày, mất cọc theo điều khoản hợp đồng" },
  { id: "AB-1201", date: "20/12/2025", month: "12/2025", order_code: "HD251201-X03", customer: "Đinh Công Tuấn",    deposit_kept:  15000000, reason: "Khách hủy đơn sau khi xưởng đã gia công 30% – thu 50% cọc" },
  { id: "AB-0101", date: "20/01/2026", month: "01/2026", order_code: "HD260101-X01", customer: "Bùi Văn K",        deposit_kept:   5000000, reason: "Khách hủy đơn sau 30 ngày, mất cọc theo hợp đồng" },
  { id: "AB-0201", date: "14/02/2026", month: "02/2026", order_code: "HD260110-X02", customer: "Nguyễn Thị L",     deposit_kept:   8000000, reason: "Khách hủy đơn khi hàng đã về xưởng" },
  { id: "AB-0301", date: "18/03/2026", month: "03/2026", order_code: "HD260301-002", customer: "Trần Công M",       deposit_kept:  12000000, reason: "Khách hủy đơn sau khi xưởng đã gia công 50%" },
  { id: "AB-0302", date: "25/03/2026", month: "03/2026", order_code: "HD260315-X03", customer: "Nguyễn Bá Thắng",  deposit_kept:   6000000, reason: "Khách hủy do thay đổi thiết kế nội thất toàn bộ" },
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
      { id: "NV005", name: "Đỗ Hữu Hùng", role: "Thợ sơn", type: "PAINTER", calc: "400.000₫ × 26 ngày", total: 10400000, status: "Chưa thanh toán" },
      { id: "NV006", name: "Vũ Tấn Tài", role: "Thợ sơn", type: "PAINTER", calc: "400.000₫ × 20 ngày = 8.000.000₫ + Phụ cấp", total: 8500000, status: "Đã thanh toán" },
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

export const MOCK_PERIODS = [
  { period_month: CURRENT_MONTH, status: "DRAFT" }
];

export const MOCK_EMPLOYEES = [
  { id: "NV001", name: "Nguyễn Thị Mai", role: "Nhân viên bán hàng", type: "SALES", base_rate: 400000, days_worked: 26, overtime_hours: 0, adjustments: [{ id: 1, type: "ALLOWANCE", description: "Phụ cấp trách nhiệm", amount: 1000000 }], status: "Chưa thanh toán", month: CURRENT_MONTH, payment_date: "" },
  { id: "NV002", name: "Trần Văn Khoa", role: "Nhân viên bán hàng", type: "SALES", base_rate: 350000, days_worked: 24, overtime_hours: 5, adjustments: [{ id: 2, type: "BONUS", description: "Thưởng doanh số", amount: 500000 }], status: "Đã thanh toán", month: CURRENT_MONTH, payment_date: "15/03/2024" },
  { id: "KT001", name: "Lê Thị Hương", role: "Kế toán", type: "ACCOUNTANT", base_rate: 450000, days_worked: 26, overtime_hours: 0, adjustments: [{ id: 3, type: "ALLOWANCE", description: "Phụ cấp ăn trưa", amount: 500000 }], status: "Chưa thanh toán", month: CURRENT_MONTH, payment_date: "" },
  { id: "NV003", name: "Lê Đình Chinh", role: "Nhân viên giấy ráp", type: "SANDER", base_rate: 400000, days_worked: 22, overtime_hours: 0, adjustments: [], status: "Chưa thanh toán", month: CURRENT_MONTH, payment_date: "" },
  { id: "NV004", name: "Phạm Xuân Đạt", role: "Nhân viên giấy ráp", type: "SANDER", base_rate: 400000, days_worked: 25, overtime_hours: 2, adjustments: [{ id: 4, type: "BONUS", description: "Thưởng năng suất", amount: 200000 }], status: "Chưa thanh toán", month: CURRENT_MONTH, payment_date: "" },
  { id: "NV005", name: "Đỗ Hữu Hùng", role: "Thợ sơn", type: "PAINTER", base_rate: 400000, days_worked: 26, overtime_hours: 0, adjustments: [], status: "Chưa thanh toán", month: CURRENT_MONTH, payment_date: "" },
  { id: "NV006", name: "Vũ Tấn Tài", role: "Thợ sơn", type: "PAINTER", base_rate: 400000, days_worked: 20, overtime_hours: 0, adjustments: [{ id: 5, type: "ALLOWANCE", description: "Hỗ trợ đi lại", amount: 500000 }], status: "Đã thanh toán", month: CURRENT_MONTH, payment_date: "20/03/2024" },
].map(emp => ({ ...emp, record_id: `${emp.id}_${emp.month.replace("/", "-")}` }));
