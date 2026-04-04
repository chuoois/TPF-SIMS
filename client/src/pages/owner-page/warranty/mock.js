export const INITIAL_WARRANTIES = [
  {
    id: "BH-2026-001",
    orderId: "DH-2026-001",
    customerName: "Nguyễn Văn A",
    phone: "0901234567",
    productCode: "ST-HS-197x107x108-Mit",
    productName: "Sập thờ Mai Điểu chân 20 (Gỗ Mít)",
    serial: "ST202601",
    startDate: "2025-06-15T10:30:00",
    endDate: "2027-06-15T10:30:00",
    warrantyMonths: 24,
    status: "Còn hạn",
    maintenanceHistory: [
      {
        date: "2025-12-01T09:00:00",
        notes: "Kiểm tra định kỳ, lau chùi bề mặt sơn để xử lý vết xước nhỏ.",
        technician: "Trần Thợ 1"
      }
    ],
    notes: "Khách hàng mua kèm mâm bồng, dặn kỹ việc bảo trì nước sơn PU ở các mặt khuất."
  },
  {
    id: "BH-2026-001B",
    orderId: "DH-2026-001B",
    customerName: "Nguyễn Văn A",
    phone: "0901234567",
    productCode: "BBG-HKD-Tay12-Huong",
    productName: "Bộ bàn ghế Quốc Voi 6 món (Hương Đá)",
    startDate: "2025-03-15T10:30:00",
    endDate: "2026-04-15T10:30:00",
    warrantyMonths: 13,
    status: "Sắp hết hạn",
    maintenanceHistory: [],
    notes: ""
  },
  {
    id: "BH-2026-001C",
    orderId: "DH-2026-001C",
    customerName: "Nguyễn Văn A",
    phone: "0901234567",
    productCode: "TA-HM-160x200-XoanDao",
    productName: "Tủ quần áo 4 cánh (Xoan Đào)",
    startDate: "2024-01-15T10:30:00",
    endDate: "2025-01-15T10:30:00",
    warrantyMonths: 12,
    status: "Hết hạn",
    maintenanceHistory: [],
    notes: ""
  },
  {
    id: "BH-2026-002",
    orderId: "DH-2026-005",
    customerName: "Trần Thị B",
    phone: "0987654321",
    productCode: "BBG-HKD-Tay12-Huong",
    productName: "Bộ bàn ghế Quốc Voi 6 món (Hương Đá)",
    serial: "BBG202605",
    startDate: "2023-04-10T14:20:00",
    endDate: "2024-04-10T14:20:00",
    warrantyMonths: 12,
    status: "Hết hạn",
    maintenanceHistory: [],
    notes: "Chính sách bảo hành kết cấu 1 năm. Nếu cần bảo trì sẽ tính theo chi phí dịch vụ thông thường."
  },
  {
    id: "BH-2026-002B",
    orderId: "DH-2026-005B",
    customerName: "Trần Thị B",
    phone: "0987654321",
    productCode: "GN-S-180x200-GoSoi",
    productName: "Giường ngủ hiện đại 1m8 (Gỗ Sồi Nga)",
    startDate: "2025-10-01T15:00:00",
    endDate: "2028-10-01T15:00:00",
    warrantyMonths: 36,
    status: "Còn hạn",
    maintenanceHistory: [],
    notes: ""
  },
  {
    id: "BH-2026-002C",
    orderId: "DH-2026-005C",
    customerName: "Trần Thị B",
    phone: "0987654321",
    productCode: "KTV-GoGo-220",
    productName: "Kệ tivi nguyên khối cham khắc 2m2 (Gỗ Gõ Đỏ)",
    startDate: "2025-04-05T09:00:00",
    endDate: "2026-04-15T09:00:00",
    warrantyMonths: 12,
    status: "Sắp hết hạn",
    maintenanceHistory: [],
    notes: ""
  },
  {
    id: "BH-2026-003",
    orderId: "DH-2026-012",
    customerName: "Lê Văn C",
    phone: "0912345678",
    productCode: "TA-HM-160x200x55-XoanDao",
    productName: "Tủ quần áo 4 cánh (Xoan Đào)",
    serial: "TA202612",
    startDate: "2026-03-25T08:15:00",
    endDate: "2026-04-15T08:15:00", 
    warrantyMonths: 1, 
    status: "Sắp hết hạn",
    maintenanceHistory: [],
    notes: "Đặc biệt lưu ý phụ kiện bản lề giảm chấn và thanh ray trượt."
  },
  {
    id: "BH-2026-003B",
    orderId: "DH-2026-012B",
    customerName: "Lê Văn C",
    phone: "0912345678",
    productCode: "ST-HS-197x107-Mit",
    productName: "Sập thờ Mai Điểu chân 20 (Gỗ Mít)",
    startDate: "2025-01-15T08:15:00",
    endDate: "2027-01-15T08:15:00",
    warrantyMonths: 24,
    status: "Còn hạn",
    maintenanceHistory: [],
    notes: ""
  },
  {
    id: "BH-2026-003C",
    orderId: "DH-2026-012C",
    customerName: "Lê Văn C",
    phone: "0912345678",
    productCode: "BBG-T12",
    productName: "Bộ bàn ghế (Tùy chọn)",
    startDate: "2024-01-15T08:15:00",
    endDate: "2025-01-15T08:15:00",
    warrantyMonths: 12,
    status: "Hết hạn",
    maintenanceHistory: [],
    notes: ""
  },
  {
    id: "BH-2026-004",
    orderId: "DH-2026-018",
    customerName: "Phạm Tấn D",
    phone: "0944556677",
    productCode: "GN-S-180x200-GoSoi",
    productName: "Giường ngủ hiện đại 1m8 (Gỗ Sồi Nga)",
    serial: "GN202618",
    startDate: "2025-10-01T15:00:00",
    endDate: "2028-10-01T15:00:00",
    warrantyMonths: 36,
    status: "Còn hạn",
    maintenanceHistory: [
      {
        date: "2026-02-15T14:30:00",
        notes: "Gia cố lại vạt giường bị lỏng vít do lúc lắp ghép bị lệch.",
        technician: "Lê Thợ 2"
      }
    ],
    notes: "Mối mọt được bảo hành trọn đời theo chính sách của xưởng."
  },
  {
    id: "BH-2026-004B",
    orderId: "DH-2026-018B",
    customerName: "Phạm Tấn D",
    phone: "0944556677",
    productCode: "TA-4C",
    productName: "Tủ áo 4 cánh",
    startDate: "2026-03-01T15:00:00",
    endDate: "2026-04-10T15:00:00",
    warrantyMonths: 1,
    status: "Sắp hết hạn",
    maintenanceHistory: [],
    notes: ""
  },
  {
    id: "BH-2026-004C",
    orderId: "DH-2026-018C",
    customerName: "Phạm Tấn D",
    phone: "0944556677",
    productCode: "KTV-220",
    productName: "Kệ tivi 2m2",
    startDate: "2024-01-01T15:00:00",
    endDate: "2025-01-01T15:00:00",
    warrantyMonths: 12,
    status: "Hết hạn",
    maintenanceHistory: [],
    notes: ""
  },
  {
    id: "BH-2026-005",
    orderId: "DH-2026-022",
    customerName: "Vũ Hải E",
    phone: "0977889900",
    productCode: "KTV-GoGo-220",
    productName: "Kệ tivi nguyên khối cham khắc 2m2 (Gỗ Gõ Đỏ)",
    serial: "KTV202622",
    startDate: "2025-04-05T09:00:00",
    endDate: "2026-04-05T09:00:00",
    warrantyMonths: 12,
    status: "Sắp hết hạn",
    maintenanceHistory: [],
    notes: "Xử lý ngay nếu gỗ có tình trạng nứt xé do sấy chưa kỹ."
  },
  {
    id: "BH-2026-005B",
    orderId: "DH-2026-022B",
    customerName: "Vũ Hải E",
    phone: "0977889900",
    productCode: "GN-S",
    productName: "Giường ngủ",
    startDate: "2025-10-05T09:00:00",
    endDate: "2028-10-05T09:00:00",
    warrantyMonths: 36,
    status: "Còn hạn",
    maintenanceHistory: [],
    notes: ""
  },
  {
    id: "BH-2026-005C",
    orderId: "DH-2026-022C",
    customerName: "Vũ Hải E",
    phone: "0977889900",
    productCode: "BBG-12",
    productName: "Bộ bàn ghế",
    startDate: "2024-04-05T09:00:00",
    endDate: "2025-04-05T09:00:00",
    warrantyMonths: 12,
    status: "Hết hạn",
    maintenanceHistory: [],
    notes: ""
  }
];

export const INITIAL_REPAIR_REQUESTS = [
  {
    id: "YC-2026-001",
    customerName: "Phạm Tấn D",
    phone: "0944556677",
    productName: "Giường ngủ hiện đại 1m8 (Gỗ Sồi Nga)",
    requestDate: "2026-04-01T09:30:00",
    promisedDate: "2026-04-05T17:00:00",
    status: "Đang thực hiện",
    repairMethod: "Tại nhà",
    repairCategory: "Lỗi Mộc",
    technician: "Lê Thợ 2",
    issueDescription: "Các thang giường có dấu hiệu bị cong vênh, vạt phản nằm lên kêu kẽo kẹt.",
    services: [
      { name: "Thay thang giường dự phòng (3 thanh)", cost: 250000, type: "Linh kiện" }
    ],
    transportFee: 0,
    totalCost: 250000,
    isWarrantyCovered: true, 
    notes: "Hỗ trợ bảo hành thang giường."
  },
  {
    id: "YC-2026-002",
    customerName: "Đinh Quang D",
    phone: "0933445566",
    productName: "Tủ rượu gỗ công nghiệp MDF",
    requestDate: "2026-04-02T14:00:00",
    promisedDate: "2026-04-10T10:00:00",
    status: "Chờ xử lý",
    repairMethod: "Về xưởng",
    repairCategory: "Khác",
    technician: "",
    issueDescription: "Hệ thống đèn LED âm tủ bị hỏng nguồn.",
    services: [
        { name: "Thay bộ nguồn 12V", cost: 250000, type: "Linh kiện" }
    ],
    transportFee: 200000,
    totalCost: 450000,
    isWarrantyCovered: false,
    notes: "Khách đồng ý phí vận chuyển 200k."
  },
  {
    id: "YC-2026-003",
    customerName: "Nguyễn Văn A",
    phone: "0901234567",
    productName: "Sập thờ Mai Điểu chân 20",
    requestDate: "2026-03-28T10:15:00",
    promisedDate: "2026-03-31T15:00:00",
    status: "Hoàn thành",
    repairMethod: "Tại nhà",
    repairCategory: "Lỗi Sơn PU",
    technician: "Trần Thợ 1",
    issueDescription: "Dặm lại sơn PU các góc khuất.",
    services: [],
    transportFee: 0,
    totalCost: 0,
    isWarrantyCovered: true,
    notes: "Đã xử lý xong."
  },
  {
    id: "YC-2026-004",
    customerName: "Hoàng Văn H",
    phone: "0911223344",
    productName: "Bộ bàn ghế Âu Á Chương Cuốn Thư",
    requestDate: "2026-04-03T08:00:00",
    promisedDate: "2026-04-15T08:00:00",
    status: "Đang thực hiện",
    repairMethod: "Về xưởng",
    repairCategory: "Lỗi Mộc",
    technician: "Thợ Cường",
    issueDescription: "Mặt bàn bị nứt chân chim do thời tiết khô hanh.",
    services: [
        { name: "Xử lý nứt mộc & phun lại mặt", cost: 800000, type: "Dịch vụ" }
    ],
    transportFee: 500000,
    totalCost: 1300000,
    isWarrantyCovered: false,
    notes: "Đồ về xưởng xử lí kỹ hơn."
  }
];

// Helper to init localStorage
export const initWarrantyMockData = () => {
    // If v7 flag is not set, force push the rich data
    if (!localStorage.getItem("tpf_simulated_warranties_v7")) {
        localStorage.setItem("tpf_simulated_warranties", JSON.stringify(INITIAL_WARRANTIES));
        localStorage.setItem("tpf_simulated_repair_requests", JSON.stringify(INITIAL_REPAIR_REQUESTS));
        localStorage.setItem("tpf_simulated_warranties_v7", "true");
    }
    
    // Fallback if somehow completely empty
    if (!localStorage.getItem("tpf_simulated_warranties")) {
        localStorage.setItem("tpf_simulated_warranties", JSON.stringify(INITIAL_WARRANTIES));
    }
    if (!localStorage.getItem("tpf_simulated_repair_requests")) {
        localStorage.setItem("tpf_simulated_repair_requests", JSON.stringify(INITIAL_REPAIR_REQUESTS));
    }
};

// Auto init on import
initWarrantyMockData();
