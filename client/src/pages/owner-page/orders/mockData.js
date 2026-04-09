export const INITIAL_ORDERS = [
  {
    id: "DH-SAN-001",
    code: "DH-SAN-001",
    customerName: "Lê Văn Tám",
    phone: "0321654987",
    type: "Hàng sẵn",
    total: 18500000,
    status: "Chờ giao hàng",
    date: new Date().toISOString(),
    salesPerson: "Bình Nguyễn",
    deliveryDate: "2026-04-15",
    deposit: 18500000,
    fulfillmentType: "Giao tận nơi",
    products: [{ name: "Bàn ăn gỗ Sồi Nga 6 ghế", specs: "160x80 cm, Sơn màu hạt dẻ", qty: 1, unit: "Bộ" }]
  },
  {
    id: "DH-MOC-001",
    code: "DH-MOC-001",
    customerName: "Nguyễn Văn Hùng",
    phone: "0912345678",
    type: "Hàng mộc",
    total: 56000000,
    status: "Chờ xử lý",
    date: new Date().toISOString(),
    salesPerson: "Bình Nguyễn",
    deliveryDate: "2026-04-20",
    deposit: 10000000,
    fulfillmentType: "Giao tận nơi",
    products: [{ name: "Sập thờ Tứ Linh", specs: "Gỗ mít, Chân 18, Dạ 5 phân", qty: 1, unit: "Chiếc" }]
  },
  {
    id: "DH-MOC-002",
    code: "DH-MOC-002",
    customerName: "Đặng Tuấn Kiệt",
    phone: "0931234567",
    type: "Hàng mộc",
    total: 32000000,
    status: "Đang gia công",
    date: new Date().toISOString(),
    salesPerson: "Bình Nguyễn",
    deliveryDate: "2026-04-22",
    deposit: 15000000,
    fulfillmentType: "Giao tận nơi",
    products: [{ name: "Bộ bàn ghế Âu Á", specs: "Gỗ Hương Đá, Chương voi", qty: 1, unit: "Bộ" }]
  },
  {
    id: "DH-DAT-001",
    code: "DH-DAT-001",
    customerName: "Trần Thùy Linh",
    phone: "0987654321",
    type: "Hàng khách đặt",
    total: 125000000,
    status: "Chờ sản xuất",
    date: new Date().toISOString(),
    salesPerson: "Bình Nguyễn",
    deliveryDate: "2026-05-10",
    deposit: 40000000,
    fulfillmentType: "Giao tận nơi",
    products: [{ name: "Trường kỷ Sen Vịt", specs: "Gỗ Gụ Lào, 2m17, Đục tay kỹ", qty: 1, unit: "Bộ" }]
  },
  {
    id: "DH-DAT-002",
    code: "DH-DAT-002",
    customerName: "Phạm Phúc Lộc",
    phone: "0944556677",
    type: "Hàng khách đặt",
    total: 80000000,
    status: "Chờ xử lý",
    date: new Date().toISOString(),
    salesPerson: "Bình Nguyễn",
    deliveryDate: "2026-05-15",
    deposit: 30000000,
    fulfillmentType: "Giao tận nơi",
    products: [{ name: "Tủ rượu Tân Cổ Điển", specs: "Gỗ Gõ Đỏ nguyên khối", qty: 1, unit: "Chiếc" }]
  },
  {
    id: "DH-DAT-003",
    code: "DH-DAT-003",
    customerName: "Bùi Bách Hợp",
    phone: "0988112233",
    type: "Hàng khách đặt",
    total: 95000000,
    status: "Đang gia công",
    date: new Date().toISOString(),
    salesPerson: "Bình Nguyễn",
    deliveryDate: "2026-05-20",
    deposit: 45000000,
    fulfillmentType: "Giao tận nơi",
    products: [{ name: "Sofa Nguyên Khối", specs: "Gỗ Hương Vân, Dày 10cm", qty: 1, unit: "Bộ" }]
  },
];

export const INITIAL_PRODUCTIONS = [
  {
    id: "PROD-MOC-002",
    orderId: "DH-MOC-002",
    orderCode: "DH-MOC-002",
    productName: "Bộ bàn ghế Âu Á",
    assignedWorker: "Lê Văn Hùng (Thợ cả)",
    status: "Chờ nghiệm thu",
    isPendingApproval: true,
    expectedEndDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    quantityPlanned: 1,
    quantityCompleted: 1,
    productImage: "https://xuongdogogiagoc.com/wp-content/uploads/2020/06/bo-ghe-au-a-go-huong-da-moc.jpg",
    workerNotes: "Đã hoàn thiện phần khung và sơn lớp 1, chờ chủ xưởng nghiệm thu"
  },
  {
    id: "PROD-DAT-003",
    orderId: "DH-DAT-003",
    orderCode: "DH-DAT-003",
    productName: "Sofa Nguyên Khối",
    assignedWorker: "Trần Thế Kỷ (Thợ cả)",
    status: "Chờ nghiệm thu",
    isPendingApproval: true,
    expectedEndDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    quantityPlanned: 1,
    quantityCompleted: 1,
    productImage: "https://dogomynghenamtuan.com/wp-content/uploads/2020/07/sap-tho-tu-linh-go-mit-moc.jpg",
    workerNotes: "Hoàn thiện sơn bóng mờ PU theo yêu cầu, chờ nghiệm thu."
  }
];

export const MOCK_ORDERS_DETAILED = {
  "DH-SAN-001": {
    code: "DH-SAN-001", type: "Hàng sẵn", status: "Chờ giao hàng",
    date: "2026-03-29T08:30:00", deliveryDate: "2026-04-01", fulfillmentType: "Giao tận nhà",
    customer: { name: "Nguyễn Văn Hùng", phone: "0912345678", address: "45 Đường Giải Phóng, Hà Đông, Hà Nội" },
    salesPerson: "Bình Nguyễn", total: 18500000, deposit: 2000000, depositMethod: "Chuyển khoản", paymentStatus: "partial",
    notes: "Khách cần bọc lót kỹ phần chân gỗ khi vận chuyển.",
    products: [{
      name: "Bàn ăn gỗ Sồi Nga 6 ghế",
      image: "https://noithatzito.com/wp-content/uploads/2021/04/bo-ban-an-go-soi-nga-6-ghe.jpg",
      customerSampleImage: "https://th.bing.com/th/id/OIP.vr9BRteYrPsEUU_wlBWOpwHaFj?o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3",
      material: "Gỗ sồi tự nhiên", size: "160x80 cm", finish: "Sơn màu hạt dẻ", qty: 1, price: 18500000, note: "Màu hạt dẻ"
    }],
    timeline: [
      { time: "29/03/2026 08:30", label: "Tiếp nhận đơn", desc: "Đơn hàng mới từ showroom", active: true },
      { time: "29/03/2026 09:15", label: "Đang kiểm kho", desc: "Xác nhận hàng sẵn có tại kho Hà Đông", active: true }
    ],
  },
  "DH-MOC-001": {
    code: "DH-MOC-001", type: "Hàng mộc", status: "Chờ xử lý",
    date: "2026-03-30T10:00:00", deliveryDate: "2026-04-10", fulfillmentType: "Giao tận nơi",
    customer: { name: "Hoàng Nguyệt Ánh", phone: "0978901234", address: "KĐT Ecopark, Hưng Yên" },
    salesPerson: "Bình Nguyễn", total: 56000000, deposit: 10000000, depositMethod: "Chuyển khoản", paymentStatus: "partial",
    products: [{
      name: "Sập thờ Tứ Linh",
      image: "https://dogomynghenamtuan.com/wp-content/uploads/2020/07/sap-tho-tu-linh-go-mit-moc.jpg",
      customerSampleImage: "https://th.bing.com/th/id/OIP.vr9BRteYrPsEUU_wlBWOpwHaFj?o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3",
      material: "Gỗ mít", size: "Chân 18, Dạ 5 phân", finish: "Mộc", qty: 1, price: 56000000, note: "Đục tay kỹ",
      painterLabor: 1200000, finishingDays: 7
    }],
    timeline: [
      { time: "30/03/2026 10:00", label: "Tạo đơn", desc: "Nhận đơn hàng mộc từ kho", active: true }
    ],
  },
  "DH-MOC-002": {
    code: "DH-MOC-002", type: "Hàng mộc", status: "Đang gia công",
    date: "2026-03-28T15:30:00", deliveryDate: "2026-04-05", fulfillmentType: "Giao tận nơi",
    customer: { name: "Đặng Tuấn Kiệt", phone: "0931234567", address: "Số 12A Xuân Thủy, Cầu Giấy" },
    salesPerson: "Bình Nguyễn", total: 32000000, deposit: 15000000, depositMethod: "Tiền mặt", paymentStatus: "partial",
    products: [{
      name: "Bộ bàn ghế Âu Á",
      image: "https://xuongdogogiagoc.com/wp-content/uploads/2020/06/bo-ghe-au-a-go-huong-da-moc.jpg",
      customerSampleImage: "https://images.unsplash.com/photo-1595515106969-a0ff2bc82092?q=80&w=800",
      material: "Gỗ Hương Đá", size: "Chương voi", finish: "Sơn Lau", qty: 1, price: 32000000, note: "Hàng mộc về xưởng"
    }],
    timeline: [{ time: "29/03/2026 14:00", label: "Gia công", desc: "Đang trong giai đoạn sơn PU lớp 2", active: true }],
  },
  "DH-DAT-001": {
    code: "DH-DAT-001", type: "Hàng khách đặt", status: "Chờ sản xuất",
    date: "2026-03-30T11:15:00", deliveryDate: "2026-04-30", fulfillmentType: "Giao tận nơi",
    customer: { name: "Nguyễn Thị Hồng", phone: "0912123123", address: "Số 5 Đường Thành, Hoàn Kiếm" },
    salesPerson: "Bình Nguyễn", total: 125000000, deposit: 40000000, depositMethod: "Chuyển khoản", paymentStatus: "partial",
    products: [{
      name: "Trường kỷ Sen Vịt",
      image: "https://langnghedoanhnhan.com/wp-content/uploads/2021/04/truong-ky-go-gu-lao-moc.jpg",
      customerSampleImage: "https://images.unsplash.com/photo-1540632739335-ade38b0070bc?q=80&w=800",
      material: "Gỗ Gụ Lào", size: "2m17", finish: "Đục tay kỹ", qty: 1, price: 125000000, note: "Đóng mộng thủ công",
      painterLabor: 2500000, finishingDays: 14
    }],
    timeline: [{ time: "30/03/2026 11:15", label: "Nhận đơn", desc: "Đơn hàng đặt sản xuất theo mẫu riêng", active: true }],
  },
  "DH-DAT-002": {
    code: "DH-DAT-002", type: "Hàng khách đặt", status: "Chờ xử lý",
    date: "2026-03-31T09:00:00", deliveryDate: "2026-05-15", fulfillmentType: "Giao tận nơi",
    customer: { name: "Phạm Phúc Lộc", phone: "0944556677", address: "KĐT Vinhomes Ocean Park" },
    salesPerson: "Bình Nguyễn", total: 80000000, deposit: 30000000, depositMethod: "Chuyển khoản", paymentStatus: "partial",
    products: [{
      name: "Tủ rượu Tân Cổ Điển",
      image: "https://langnghedoanhnhan.com/wp-content/uploads/2021/04/truong-ky-go-gu-lao-moc.jpg",
      customerSampleImage: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=800",
      material: "Gỗ Gõ Đỏ", size: "Cao 2m2, rộng 1m8", finish: "Khắc CNC sâu", qty: 1, price: 80000000, note: "Sản phẩm đặt làm riêng",
      painterLabor: 3000000, finishingDays: 10
    }],
    timeline: [{ time: "31/03/2026 09:00", label: "Chờ xử lý hàng", desc: "Hàng mộc đã về, đang chờ điều phối thợ", active: true }],
  },
  "DH-DAT-003": {
    code: "DH-DAT-003", type: "Hàng khách đặt", status: "Đang gia công",
    date: "2026-03-25T14:20:00", deliveryDate: "2026-05-20", fulfillmentType: "Giao tận nơi",
    customer: { name: "Bùi Bách Hợp", phone: "0988112233", address: "Biệt thự Ciputra, Tây Hồ" },
    salesPerson: "Bình Nguyễn", total: 95000000, deposit: 45000000, depositMethod: "Tiền mặt", paymentStatus: "partial",
    products: [{
      name: "Sofa Nguyên Khối",
      image: "https://dogomynghenamtuan.com/wp-content/uploads/2020/07/sap-tho-tu-linh-go-mit-moc.jpg",
      customerSampleImage: "https://images.unsplash.com/photo-1540574163026-643ea20d25b5?q=80&w=800",
      material: "Gỗ Hương Vân", size: "Dày 10cm", finish: "Sơn bóng mờ 50", qty: 1, price: 95000000, note: "Gỗ nguyên khối đặc",
      painterLabor: 4000000, finishingDays: 15
    }],
    timeline: [{ time: "25/03/2026 14:20", label: "Đang gia công", desc: "Đã bàn giao cho thợ hoàn thiện", active: true }],
  }
};
