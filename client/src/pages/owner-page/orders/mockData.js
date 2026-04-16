export const INITIAL_ORDERS = [
  {
    id: "DH-SAN-101",
    code: "DH-SAN-101",
    customerName: "Trần Thị B",
    phone: "0912345679",
    type: "Hàng sẵn",
    total: 15000000,
    status: "Chờ giao hàng",
    date: new Date(Date.now() + 0 * 86400000).toISOString(),
    salesPerson: "Bình Nguyễn",
    deliveryDate: "2026-04-20",
    deposit: 4500000,
    fulfillmentType: "Giao tận nơi",
    products: [{ name: "Sản phẩm Hàng sẵn 1", specs: "Kích thước tiêu chuẩn", qty: 10, unit: "Cái" }]
  },
  {
    id: "DH-SAN-102",
    code: "DH-SAN-102",
    customerName: "Lê Văn C",
    phone: "0912345680",
    type: "Hàng sẵn",
    total: 15000000,
    status: "Đang giao hàng",
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
    salesPerson: "Bình Nguyễn",
    deliveryDate: "2026-04-18",
    deposit: 4500000,
    fulfillmentType: "Giao tận nơi",
    products: [{ name: "Sản phẩm Hàng sẵn 2", specs: "Kích thước tiêu chuẩn", qty: 10, unit: "Cái" }]
  },
  {
    id: "DH-SAN-103",
    code: "DH-SAN-103",
    customerName: "Phạm Thị D",
    phone: "0912345681",
    type: "Hàng sẵn",
    total: 15000000,
    status: "Hoàn thành",
    date: new Date(Date.now() - 4 * 86400000).toISOString(),
    salesPerson: "Bình Nguyễn",
    deliveryDate: "2026-04-16",
    deposit: 4500000,
    fulfillmentType: "Giao tận nơi",
    products: [{ name: "Sản phẩm Hàng sẵn 3", specs: "Kích thước tiêu chuẩn", qty: 10, unit: "Cái" }]
  },
  {
    id: "DH-SAN-104",
    code: "DH-SAN-104",
    customerName: "Hoàng Văn E",
    phone: "0912345682",
    type: "Hàng sẵn",
    total: 15000000,
    status: "Chờ duyệt hủy",
    date: new Date(Date.now() - 6 * 86400000).toISOString(),
    salesPerson: "Bình Nguyễn",
    deliveryDate: "2026-04-14",
    deposit: 0,
    fulfillmentType: "Giao tận nơi",
    products: [{ name: "Sản phẩm Hàng sẵn 4", specs: "Kích thước tiêu chuẩn", qty: 10, unit: "Cái" }]
  },
  {
    id: "DH-SAN-105",
    code: "DH-SAN-105",
    customerName: "Vũ Thị F",
    phone: "0912345683",
    type: "Hàng sẵn",
    total: 15000000,
    status: "Đơn đã hủy",
    date: new Date(Date.now() - 8 * 86400000).toISOString(),
    salesPerson: "Bình Nguyễn",
    deliveryDate: "2026-04-12",
    deposit: 0,
    fulfillmentType: "Giao tận nơi",
    products: [{ name: "Sản phẩm Hàng sẵn 5", specs: "Kích thước tiêu chuẩn", qty: 10, unit: "Cái" }]
  },
  {
    id: "DH-MOC-101",
    code: "DH-MOC-101",
    customerName: "Đặng Văn G",
    phone: "0912345684",
    type: "Hàng mộc",
    total: 45000000,
    status: "Chờ xử lý",
    date: new Date(Date.now() + 0 * 86400000).toISOString(),
    salesPerson: "Bình Nguyễn",
    deliveryDate: "2026-04-20",
    deposit: 13500000,
    fulfillmentType: "Giao tận nơi",
    products: [
      { name: "Bộ bàn ghế ăn 6 chỗ", material: "Gỗ sồi", size: "D180 R90 C75", color: "Nâu đậm", finish: "Sơn PU bóng mờ", qty: 1, unit: "Bộ", note: "Bo góc tròn, chân tiện tròn kiểu cổ điển", image: "https://noithatzito.com/wp-content/uploads/2021/04/bo-ban-an-go-soi-nga-6-ghe.jpg" },
      { name: "Tủ rượu cánh kính", material: "Gỗ sồi", size: "D120 R40 C200", color: "Nâu đậm", finish: "Sơn PU bóng mờ", qty: 2, unit: "Chiếc", note: "Kính cường lực 8mm, bản lề giảm chấn Blum", image: "https://noithatminhkhoi.com/upload/images/tu-quan-ao-go-soi-nga-4-canh-dep.jpg" }
    ]
  },
  {
    id: "DH-MOC-102",
    code: "DH-MOC-102",
    customerName: "Nguyễn Văn A",
    phone: "0912345685",
    type: "Hàng mộc",
    total: 45000000,
    status: "Đang gia công",
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
    salesPerson: "Bình Nguyễn",
    deliveryDate: "2026-04-18",
    deposit: 13500000,
    fulfillmentType: "Giao tận nơi",
    products: [
      { name: "Sập thờ tứ linh", material: "Gỗ mít", size: "D197 R107 C87", color: "Tự nhiên", finish: "Đánh vecni bóng", qty: 1, unit: "Chiếc", note: "Đục chạm tứ linh: Long - Lân - Quy - Phụng, chân quỳ", image: "https://dogomynghenamtuan.com/wp-content/uploads/2020/07/sap-tho-tu-linh-go-mit-moc.jpg" },
      { name: "Kệ thờ treo tường", material: "Gỗ mít", size: "D107 R47 C57", color: "Tự nhiên", finish: "Đánh vecni bóng", qty: 2, unit: "Chiếc", note: "Chạm hoa sen, đục thủng 2 bên", image: "https://dogomynghenamtuan.com/wp-content/uploads/2020/07/sap-tho-tu-linh-go-mit-moc.jpg" }
    ]
  },
  {
    id: "DH-MOC-103",
    code: "DH-MOC-103",
    customerName: "Trần Thị B",
    phone: "0912345686",
    type: "Hàng mộc",
    total: 45000000,
    status: "Chờ giao hàng",
    date: new Date(Date.now() - 4 * 86400000).toISOString(),
    salesPerson: "Bình Nguyễn",
    deliveryDate: "2026-04-16",
    deposit: 13500000,
    fulfillmentType: "Giao tận nơi",
    products: [{ name: "Sản phẩm Hàng mộc 3", specs: "Kích thước tiêu chuẩn", qty: 10, unit: "Cái" }]
  },
  {
    id: "DH-MOC-104",
    code: "DH-MOC-104",
    customerName: "Lê Văn C",
    phone: "0912345687",
    type: "Hàng mộc",
    total: 45000000,
    status: "Đang giao hàng",
    date: new Date(Date.now() - 6 * 86400000).toISOString(),
    salesPerson: "Bình Nguyễn",
    deliveryDate: "2026-04-14",
    deposit: 13500000,
    fulfillmentType: "Giao tận nơi",
    products: [{ name: "Sản phẩm Hàng mộc 4", specs: "Kích thước tiêu chuẩn", qty: 10, unit: "Cái" }]
  },
  {
    id: "DH-MOC-105",
    code: "DH-MOC-105",
    customerName: "Phạm Thị D",
    phone: "0912345688",
    type: "Hàng mộc",
    total: 45000000,
    status: "Hoàn thành",
    date: new Date(Date.now() - 8 * 86400000).toISOString(),
    salesPerson: "Bình Nguyễn",
    deliveryDate: "2026-04-12",
    deposit: 13500000,
    fulfillmentType: "Giao tận nơi",
    products: [{ name: "Sản phẩm Hàng mộc 5", specs: "Kích thước tiêu chuẩn", qty: 10, unit: "Cái" }]
  },
  {
    id: "DH-MOC-106",
    code: "DH-MOC-106",
    customerName: "Hoàng Văn E",
    phone: "0912345689",
    type: "Hàng mộc",
    total: 45000000,
    status: "Chờ duyệt hủy",
    date: new Date(Date.now() - 10 * 86400000).toISOString(),
    salesPerson: "Bình Nguyễn",
    deliveryDate: "2026-04-10",
    deposit: 0,
    fulfillmentType: "Giao tận nơi",
    products: [{ name: "Sản phẩm Hàng mộc 6", specs: "Kích thước tiêu chuẩn", qty: 10, unit: "Cái" }]
  },
  {
    id: "DH-MOC-107",
    code: "DH-MOC-107",
    customerName: "Vũ Thị F",
    phone: "0912345690",
    type: "Hàng mộc",
    total: 45000000,
    status: "Đơn đã hủy",
    date: new Date(Date.now() - 12 * 86400000).toISOString(),
    salesPerson: "Bình Nguyễn",
    deliveryDate: "2026-04-08",
    deposit: 0,
    fulfillmentType: "Giao tận nơi",
    products: [{ name: "Sản phẩm Hàng mộc 7", specs: "Kích thước tiêu chuẩn", qty: 10, unit: "Cái" }]
  },
  {
    id: "DH-DAT-101",
    code: "DH-DAT-101",
    customerName: "Đặng Văn G",
    phone: "0912345691",
    type: "Hàng khách đặt",
    total: 85000000,
    status: "Chờ sản xuất",
    date: new Date(Date.now() + 0 * 86400000).toISOString(),
    salesPerson: "Bình Nguyễn",
    deliveryDate: "2026-04-20",
    deposit: 25500000,
    fulfillmentType: "Giao tận nơi",
    products: [
      { name: "Bàn giám đốc chữ L", material: "Gỗ óc chó", size: "D200 R90 C75 + D140 R60", color: "Nâu óc chó", finish: "Sơn PU 7 lớp bóng mờ 40%", qty: 1, unit: "Chiếc", note: "Hộc tủ 3 ngăn bên phải, lỗ luồn dây điện mặt bàn, chân sắt sơn tĩnh điện đen", image: "https://noithatzito.com/wp-content/uploads/2021/04/bo-ban-an-go-soi-nga-6-ghe.jpg" },
      { name: "Tủ hồ sơ 4 cánh", material: "Gỗ óc chó", size: "D160 R45 C200", color: "Nâu óc chó", finish: "Sơn PU bóng mờ", qty: 1, unit: "Chiếc", note: "Khóa âm, bản lề giảm chấn, ngăn trên cánh kính" }
    ]
  },
  {
    id: "DH-DAT-102",
    code: "DH-DAT-102",
    customerName: "Nguyễn Văn A",
    phone: "0912345692",
    type: "Hàng khách đặt",
    total: 85000000,
    status: "Chờ xử lý",
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
    salesPerson: "Bình Nguyễn",
    deliveryDate: "2026-04-18",
    deposit: 25500000,
    fulfillmentType: "Giao tận nơi",
    products: [
      { name: "Giường ngủ đầu bọc nệm", material: "Gỗ tần bì", size: "D200 R180 C35 (đầu giường C120)", color: "Trắng ngà", finish: "Sơn PU trắng bóng mờ", qty: 1, unit: "Chiếc", note: "Đầu giường bọc nệm da Ý màu ghi, có hộc kéo 2 bên, dát phản" },
      { name: "Tab đầu giường", material: "Gỗ tần bì", size: "D50 R40 C55", color: "Trắng ngà", finish: "Sơn PU trắng bóng mờ", qty: 2, unit: "Chiếc", note: "2 ngăn kéo, tay nắm đồng vàng" },
      { name: "Tủ quần áo 6 cánh", material: "Gỗ tần bì", size: "D300 R60 C240", color: "Trắng ngà", finish: "Sơn PU trắng bóng mờ", qty: 1, unit: "Chiếc", note: "3 khoang, 2 cánh kính, thanh treo inox, ngăn kéo bên dưới, bản lề Blum" }
    ]
  },
  {
    id: "DH-DAT-103",
    code: "DH-DAT-103",
    customerName: "Trần Thị B",
    phone: "0912345693",
    type: "Hàng khách đặt",
    total: 85000000,
    status: "Đang gia công",
    date: new Date(Date.now() - 4 * 86400000).toISOString(),
    salesPerson: "Bình Nguyễn",
    deliveryDate: "2026-04-16",
    deposit: 25500000,
    fulfillmentType: "Giao tận nơi",
    products: [
      { name: "Bộ trường kỷ gỗ gụ", material: "Gỗ gụ", size: "D220 R70 C85", color: "Đỏ nâu tự nhiên", finish: "Đánh vecni bóng", qty: 1, unit: "Bộ", note: "Chạm đào - trúc - cúc - mai, lưng ghế chạm thủng, mặt ngồi phẳng", image: "https://langnghedoanhnhan.com/wp-content/uploads/2021/04/truong-ky-go-gu-lao-moc.jpg" },
      { name: "Đôn kê trường kỷ", material: "Gỗ gụ", size: "D50 R50 C50", color: "Đỏ nâu tự nhiên", finish: "Đánh vecni bóng", qty: 2, unit: "Chiếc", note: "Chạm hoa lá, có ngăn kéo" }
    ]
  },
  {
    id: "DH-DAT-104",
    code: "DH-DAT-104",
    customerName: "Lê Văn C",
    phone: "0912345694",
    type: "Hàng khách đặt",
    total: 85000000,
    status: "Chờ giao hàng",
    date: new Date(Date.now() - 6 * 86400000).toISOString(),
    salesPerson: "Bình Nguyễn",
    deliveryDate: "2026-04-14",
    deposit: 25500000,
    fulfillmentType: "Giao tận nơi",
    products: [{ name: "Sản phẩm Hàng khách đặt 4", specs: "Kích thước tiêu chuẩn", qty: 10, unit: "Cái" }]
  },
  {
    id: "DH-DAT-105",
    code: "DH-DAT-105",
    customerName: "Phạm Thị D",
    phone: "0912345695",
    type: "Hàng khách đặt",
    total: 85000000,
    status: "Đang giao hàng",
    date: new Date(Date.now() - 8 * 86400000).toISOString(),
    salesPerson: "Bình Nguyễn",
    deliveryDate: "2026-04-12",
    deposit: 25500000,
    fulfillmentType: "Giao tận nơi",
    products: [{ name: "Sản phẩm Hàng khách đặt 5", specs: "Kích thước tiêu chuẩn", qty: 10, unit: "Cái" }]
  },
  {
    id: "DH-DAT-106",
    code: "DH-DAT-106",
    customerName: "Hoàng Văn E",
    phone: "0912345696",
    type: "Hàng khách đặt",
    total: 85000000,
    status: "Hoàn thành",
    date: new Date(Date.now() - 10 * 86400000).toISOString(),
    salesPerson: "Bình Nguyễn",
    deliveryDate: "2026-04-10",
    deposit: 25500000,
    fulfillmentType: "Giao tận nơi",
    products: [{ name: "Sản phẩm Hàng khách đặt 6", specs: "Kích thước tiêu chuẩn", qty: 10, unit: "Cái" }]
  },
  {
    id: "DH-DAT-107",
    code: "DH-DAT-107",
    customerName: "Vũ Thị F",
    phone: "0912345697",
    type: "Hàng khách đặt",
    total: 85000000,
    status: "Chờ duyệt hủy",
    date: new Date(Date.now() - 12 * 86400000).toISOString(),
    salesPerson: "Bình Nguyễn",
    deliveryDate: "2026-04-08",
    deposit: 0,
    fulfillmentType: "Giao tận nơi",
    products: [{ name: "Sản phẩm Hàng khách đặt 7", specs: "Kích thước tiêu chuẩn", qty: 10, unit: "Cái" }]
  },
  {
    id: "DH-DAT-108",
    code: "DH-DAT-108",
    customerName: "Đặng Văn G",
    phone: "0912345698",
    type: "Hàng khách đặt",
    total: 85000000,
    status: "Đơn đã hủy",
    date: new Date(Date.now() - 14 * 86400000).toISOString(),
    salesPerson: "Bình Nguyễn",
    deliveryDate: "2026-04-06",
    deposit: 0,
    fulfillmentType: "Giao tận nơi",
    products: [{ name: "Sản phẩm Hàng khách đặt 8", specs: "Kích thước tiêu chuẩn", qty: 10, unit: "Cái" }]
  },
  {
    id: "DH-TEST-2X",
    code: "DH-TEST-2X",
    customerName: "Nguyễn Thị Thử",
    phone: "0333444555",
    type: "Hàng khách đặt",
    total: 35000000,
    status: "Chờ xử lý",
    date: new Date().toISOString(),
    salesPerson: "Bình Nguyễn",
    deliveryDate: "2026-05-01",
    deposit: 10000000,
    fulfillmentType: "Giao tận nơi",
    products: [
      { name: "Ghế trường kỷ gỗ gụ", material: "Gỗ gụ", size: "D200 R65 C90", color: "Cánh gián", finish: "Đánh vecni bóng", qty: 1, unit: "Chiếc", note: "Tay vịn chạm rồng cuốn, lưng chạm tứ quý, mặt ngồi phẳng bo cạnh" },
      { name: "Bàn trà đục chạm", material: "Gỗ gụ", size: "D120 R80 C48", color: "Cánh gián", finish: "Đánh vecni bóng", qty: 1, unit: "Cái", note: "Mặt bàn đục chạm mai điểu, chân quỳ, có ngăn kéo giữa" }
    ]
  },
];

export const INITIAL_PRODUCTIONS = [
  {
    id: "PROD-DH-MOC-102-1",
    orderId: "DH-MOC-102",
    orderCode: "DH-MOC-102",
    productName: "Sản phẩm Hàng mộc 2 - Item 1",
    assignedWorker: "Thợ Cả Trần Thị B",
    status: "Tiếp nhận",
    isPendingApproval: false,
    expectedEndDate: "2026-04-16",
    quantityPlanned: 1,
    quantityCompleted: 0,
    productImage: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80",
    workerNotes: "Tiến độ đang bám sát kế hoạch đề ra."
  },
  {
    id: "PROD-DH-MOC-102-2",
    orderId: "DH-MOC-102",
    orderCode: "DH-MOC-102",
    productName: "Sản phẩm Hàng mộc 2 - Item 2",
    assignedWorker: "Thợ Cả Lê Văn C",
    status: "Tiếp nhận",
    isPendingApproval: false,
    expectedEndDate: "2026-04-16",
    quantityPlanned: 1,
    quantityCompleted: 0,
    productImage: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80",
    workerNotes: "Tiến độ đang bám sát kế hoạch đề ra."
  },
  {
    id: "PROD-DH-MOC-102-3",
    orderId: "DH-MOC-102",
    orderCode: "DH-MOC-102",
    productName: "Sản phẩm Hàng mộc 2 - Item 3",
    assignedWorker: "Thợ Cả Phạm Thị D",
    status: "Tiếp nhận",
    isPendingApproval: false,
    expectedEndDate: "2026-04-16",
    quantityPlanned: 1,
    quantityCompleted: 0,
    productImage: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80",
    workerNotes: "Tiến độ đang bám sát kế hoạch đề ra."
  },
  {
    id: "PROD-DH-MOC-102-4",
    orderId: "DH-MOC-102",
    orderCode: "DH-MOC-102",
    productName: "Sản phẩm Hàng mộc 2 - Item 4",
    assignedWorker: "Thợ Cả Hoàng Văn E",
    status: "Tiếp nhận",
    isPendingApproval: false,
    expectedEndDate: "2026-04-16",
    quantityPlanned: 1,
    quantityCompleted: 0,
    productImage: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80",
    workerNotes: "Tiến độ đang bám sát kế hoạch đề ra."
  },
  {
    id: "PROD-DH-MOC-102-5",
    orderId: "DH-MOC-102",
    orderCode: "DH-MOC-102",
    productName: "Sản phẩm Hàng mộc 2 - Item 5",
    assignedWorker: "Thợ Cả Vũ Thị F",
    status: "Tiếp nhận",
    isPendingApproval: false,
    expectedEndDate: "2026-04-16",
    quantityPlanned: 1,
    quantityCompleted: 0,
    productImage: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80",
    workerNotes: "Tiến độ đang bám sát kế hoạch đề ra."
  },
  {
    id: "PROD-DH-MOC-102-6",
    orderId: "DH-MOC-102",
    orderCode: "DH-MOC-102",
    productName: "Sản phẩm Hàng mộc 2 - Item 6",
    assignedWorker: "Thợ Cả Đặng Văn G",
    status: "Tiếp nhận",
    isPendingApproval: false,
    expectedEndDate: "2026-04-16",
    quantityPlanned: 1,
    quantityCompleted: 0,
    productImage: "https://dogomynghenamtuan.com/wp-content/uploads/2020/07/sap-tho-tu-linh-go-mit-moc.jpg",
    workerNotes: "Tiến độ đang bám sát kế hoạch đề ra."
  },
  {
    id: "PROD-DH-MOC-102-7",
    orderId: "DH-MOC-102",
    orderCode: "DH-MOC-102",
    productName: "Sản phẩm Hàng mộc 2 - Item 7",
    assignedWorker: "Thợ Cả Nguyễn Văn A",
    status: "Chờ nghiệm thu",
    isPendingApproval: true,
    expectedEndDate: "2026-04-16",
    quantityPlanned: 1,
    quantityCompleted: 1,
    productImage: "https://dogomynghenamtuan.com/wp-content/uploads/2020/07/sap-tho-tu-linh-go-mit-moc.jpg",
    workerNotes: "Tiến độ đang bám sát kế hoạch đề ra."
  },
  {
    id: "PROD-DH-MOC-102-8",
    orderId: "DH-MOC-102",
    orderCode: "DH-MOC-102",
    productName: "Sản phẩm Hàng mộc 2 - Item 8",
    assignedWorker: "Thợ Cả Trần Thị B",
    status: "Chờ nghiệm thu",
    isPendingApproval: true,
    expectedEndDate: "2026-04-16",
    quantityPlanned: 1,
    quantityCompleted: 1,
    productImage: "https://dogomynghenamtuan.com/wp-content/uploads/2020/07/sap-tho-tu-linh-go-mit-moc.jpg",
    workerNotes: "Tiến độ đang bám sát kế hoạch đề ra."
  },
  {
    id: "PROD-DH-MOC-102-9",
    orderId: "DH-MOC-102",
    orderCode: "DH-MOC-102",
    productName: "Sản phẩm Hàng mộc 2 - Item 9",
    assignedWorker: "Thợ Cả Lê Văn C",
    status: "Chờ nghiệm thu",
    isPendingApproval: true,
    expectedEndDate: "2026-04-16",
    quantityPlanned: 1,
    quantityCompleted: 1,
    productImage: "https://dogomynghenamtuan.com/wp-content/uploads/2020/07/sap-tho-tu-linh-go-mit-moc.jpg",
    workerNotes: "Tiến độ đang bám sát kế hoạch đề ra."
  },
  {
    id: "PROD-DH-MOC-102-10",
    orderId: "DH-MOC-102",
    orderCode: "DH-MOC-102",
    productName: "Sản phẩm Hàng mộc 2 - Item 10",
    assignedWorker: "Thợ Cả Phạm Thị D",
    status: "Chờ nghiệm thu",
    isPendingApproval: true,
    expectedEndDate: "2026-04-16",
    quantityPlanned: 1,
    quantityCompleted: 1,
    productImage: "https://dogomynghenamtuan.com/wp-content/uploads/2020/07/sap-tho-tu-linh-go-mit-moc.jpg",
    workerNotes: "Tiến độ đang bám sát kế hoạch đề ra."
  },
  {
    id: "PROD-DH-MOC-105-1",
    orderId: "DH-MOC-105",
    orderCode: "DH-MOC-105",
    productName: "Sản phẩm Hàng mộc 5",
    assignedWorker: "Thợ Cả Phạm Thị D",
    status: "Hoàn thành",
    isPendingApproval: false,
    expectedEndDate: "2026-04-10",
    quantityPlanned: 10,
    quantityCompleted: 10,
    productImage: "https://xuongdogogiagoc.com/wp-content/uploads/2020/06/bo-ghe-au-a-go-huong-da-moc.jpg",
    workerNotes: "Đã giao hàng và hoàn tất lắp đặt."
  },
  {
    id: "PROD-DH-DAT-103-1",
    orderId: "DH-DAT-103",
    orderCode: "DH-DAT-103",
    productName: "Sản phẩm Hàng khách đặt 3 - Item 1",
    assignedWorker: "Thợ Cả Lê Văn C",
    status: "Tiếp nhận",
    isPendingApproval: false,
    expectedEndDate: "2026-04-14",
    quantityPlanned: 1,
    quantityCompleted: 0,
    productImage: "https://langnghedoanhnhan.com/wp-content/uploads/2021/04/truong-ky-go-gu-lao-moc.jpg",
    workerNotes: "Tiến độ đang bám sát kế hoạch đề ra."
  },
  {
    id: "PROD-DH-DAT-103-2",
    orderId: "DH-DAT-103",
    orderCode: "DH-DAT-103",
    productName: "Sản phẩm Hàng khách đặt 3 - Item 2",
    assignedWorker: "Thợ Cả Phạm Thị D",
    status: "Tiếp nhận",
    isPendingApproval: false,
    expectedEndDate: "2026-04-14",
    quantityPlanned: 1,
    quantityCompleted: 0,
    productImage: "https://langnghedoanhnhan.com/wp-content/uploads/2021/04/truong-ky-go-gu-lao-moc.jpg",
    workerNotes: "Tiến độ đang bám sát kế hoạch đề ra."
  },
  {
    id: "PROD-DH-DAT-103-3",
    orderId: "DH-DAT-103",
    orderCode: "DH-DAT-103",
    productName: "Sản phẩm Hàng khách đặt 3 - Item 3",
    assignedWorker: "Thợ Cả Hoàng Văn E",
    status: "Tiếp nhận",
    isPendingApproval: false,
    expectedEndDate: "2026-04-14",
    quantityPlanned: 1,
    quantityCompleted: 0,
    productImage: "https://langnghedoanhnhan.com/wp-content/uploads/2021/04/truong-ky-go-gu-lao-moc.jpg",
    workerNotes: "Tiến độ đang bám sát kế hoạch đề ra."
  },
  {
    id: "PROD-DH-DAT-103-4",
    orderId: "DH-DAT-103",
    orderCode: "DH-DAT-103",
    productName: "Sản phẩm Hàng khách đặt 3 - Item 4",
    assignedWorker: "Thợ Cả Vũ Thị F",
    status: "Tiếp nhận",
    isPendingApproval: false,
    expectedEndDate: "2026-04-14",
    quantityPlanned: 1,
    quantityCompleted: 0,
    productImage: "https://langnghedoanhnhan.com/wp-content/uploads/2021/04/truong-ky-go-gu-lao-moc.jpg",
    workerNotes: "Tiến độ đang bám sát kế hoạch đề ra."
  },
  {
    id: "PROD-DH-DAT-103-5",
    orderId: "DH-DAT-103",
    orderCode: "DH-DAT-103",
    productName: "Sản phẩm Hàng khách đặt 3 - Item 5",
    assignedWorker: "Thợ Cả Đặng Văn G",
    status: "Tiếp nhận",
    isPendingApproval: false,
    expectedEndDate: "2026-04-14",
    quantityPlanned: 1,
    quantityCompleted: 0,
    productImage: "https://langnghedoanhnhan.com/wp-content/uploads/2021/04/truong-ky-go-gu-lao-moc.jpg",
    workerNotes: "Tiến độ đang bám sát kế hoạch đề ra."
  },
  {
    id: "PROD-DH-DAT-103-6",
    orderId: "DH-DAT-103",
    orderCode: "DH-DAT-103",
    productName: "Sản phẩm Hàng khách đặt 3 - Item 6",
    assignedWorker: "Thợ Cả Nguyễn Văn A",
    status: "Tiếp nhận",
    isPendingApproval: false,
    expectedEndDate: "2026-04-14",
    quantityPlanned: 1,
    quantityCompleted: 0,
    productImage: "https://langnghedoanhnhan.com/wp-content/uploads/2021/04/truong-ky-go-gu-lao-moc.jpg",
    workerNotes: "Tiến độ đang bám sát kế hoạch đề ra."
  },
  {
    id: "PROD-DH-DAT-103-7",
    orderId: "DH-DAT-103",
    orderCode: "DH-DAT-103",
    productName: "Sản phẩm Hàng khách đặt 3 - Item 7",
    assignedWorker: "Thợ Cả Trần Thị B",
    status: "Chờ nghiệm thu",
    isPendingApproval: true,
    expectedEndDate: "2026-04-14",
    quantityPlanned: 1,
    quantityCompleted: 1,
    productImage: "https://langnghedoanhnhan.com/wp-content/uploads/2021/04/truong-ky-go-gu-lao-moc.jpg",
    workerNotes: "Tiến độ đang bám sát kế hoạch đề ra."
  },
  {
    id: "PROD-DH-DAT-103-8",
    orderId: "DH-DAT-103",
    orderCode: "DH-DAT-103",
    productName: "Sản phẩm Hàng khách đặt 3 - Item 8",
    assignedWorker: "Thợ Cả Lê Văn C",
    status: "Chờ nghiệm thu",
    isPendingApproval: true,
    expectedEndDate: "2026-04-14",
    quantityPlanned: 1,
    quantityCompleted: 1,
    productImage: "https://langnghedoanhnhan.com/wp-content/uploads/2021/04/truong-ky-go-gu-lao-moc.jpg",
    workerNotes: "Tiến độ đang bám sát kế hoạch đề ra."
  },
  {
    id: "PROD-DH-DAT-103-9",
    orderId: "DH-DAT-103",
    orderCode: "DH-DAT-103",
    productName: "Sản phẩm Hàng khách đặt 3 - Item 9",
    assignedWorker: "Thợ Cả Phạm Thị D",
    status: "Chờ nghiệm thu",
    isPendingApproval: true,
    expectedEndDate: "2026-04-14",
    quantityPlanned: 1,
    quantityCompleted: 1,
    productImage: "https://langnghedoanhnhan.com/wp-content/uploads/2021/04/truong-ky-go-gu-lao-moc.jpg",
    workerNotes: "Tiến độ đang bám sát kế hoạch đề ra."
  },
  {
    id: "PROD-DH-DAT-103-10",
    orderId: "DH-DAT-103",
    orderCode: "DH-DAT-103",
    productName: "Sản phẩm Hàng khách đặt 3 - Item 10",
    assignedWorker: "Thợ Cả Hoàng Văn E",
    status: "Chờ nghiệm thu",
    isPendingApproval: true,
    expectedEndDate: "2026-04-14",
    quantityPlanned: 1,
    quantityCompleted: 1,
    productImage: "https://langnghedoanhnhan.com/wp-content/uploads/2021/04/truong-ky-go-gu-lao-moc.jpg",
    workerNotes: "Tiến độ đang bám sát kế hoạch đề ra."
  },
  {
    id: "PROD-DH-DAT-106-1",
    orderId: "DH-DAT-106",
    orderCode: "DH-DAT-106",
    productName: "Sản phẩm Hàng khách đặt 6",
    assignedWorker: "Thợ Cả Hoàng Văn E",
    status: "Hoàn thành",
    isPendingApproval: false,
    expectedEndDate: "2026-04-08",
    quantityPlanned: 10,
    quantityCompleted: 10,
    productImage: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80",
    workerNotes: "Đã giao hàng và hoàn tất lắp đặt."
  },
];

export const MOCK_ORDERS_DETAILED = {
  "DH-SAN-101": {
    code: "DH-SAN-101", type: "Hàng sẵn", status: "Chờ giao hàng",
    date: "2026-04-13T12:09:19.625Z", deliveryDate: "2026-04-20", fulfillmentType: "Giao tận nơi",
    customer: { name: "Trần Thị B", phone: "0912345679", address: "123 Đường Vĩnh Thực, Hà Nội" },
    salesPerson: "Bình Nguyễn", total: 15000000, deposit: 4500000, depositMethod: "Chuyển khoản", paymentStatus: "partial",
    notes: "Khách yêu cầu sơn cẩn thận, sản phẩm đạt chất lượng cao.",
    products: [{
      name: "Sản phẩm Hàng sẵn 1",
      image: "https://noithatzito.com/wp-content/uploads/2021/04/bo-ban-an-go-soi-nga-6-ghe.jpg",
      customerSampleImage: "https://images.unsplash.com/photo-1540574163026-643ea20d25b5?q=80&w=800",
      material: "Gỗ Tự Nhiên", size: "Tiêu chuẩn", finish: "Bóng mờ 50%", qty: 10, price: 1500000, unit: "Cái", note: "Yêu cầu chi tiết đục chạm tinh xảo"
    }],
    timeline: [
      { time: "2026-04-12T12:09:19.625Z", label: "Tiếp nhận thông tin", desc: "Khách liên hệ qua Zalo", active: true },
      { time: "2026-04-13T12:09:19.625Z", label: "Chốt đơn", desc: "Khách đã chốt mẫu và thanh toán cọc", active: true },
      { time: "2026-04-14T12:09:19.625Z", label: "Cập nhật trạng thái", desc: "Đơn hàng bắt đầu sang trạng thái: Chờ giao hàng", active: true }
    ],
  },
  "DH-SAN-102": {
    code: "DH-SAN-102", type: "Hàng sẵn", status: "Đang giao hàng",
    date: "2026-04-11T12:09:19.625Z", deliveryDate: "2026-04-18", fulfillmentType: "Giao tận nơi",
    customer: { name: "Lê Văn C", phone: "0912345680", address: "123 Đường Vĩnh Thực, Hà Nội" },
    salesPerson: "Bình Nguyễn", total: 15000000, deposit: 4500000, depositMethod: "Chuyển khoản", paymentStatus: "partial",
    notes: "Khách yêu cầu sơn cẩn thận, sản phẩm đạt chất lượng cao.",
    products: [{
      name: "Sản phẩm Hàng sẵn 2",
      image: "https://noithatminhkhoi.com/upload/images/tu-quan-ao-go-soi-nga-4-canh-dep.jpg",
      customerSampleImage: "https://images.unsplash.com/photo-1540574163026-643ea20d25b5?q=80&w=800",
      material: "Gỗ Tự Nhiên", size: "Tiêu chuẩn", finish: "Bóng mờ 50%", qty: 10, price: 1500000, unit: "Cái", note: "Yêu cầu chi tiết đục chạm tinh xảo"
    }],
    timeline: [
      { time: "2026-04-10T12:09:19.625Z", label: "Tiếp nhận thông tin", desc: "Khách liên hệ qua Zalo", active: true },
      { time: "2026-04-11T12:09:19.625Z", label: "Chốt đơn", desc: "Khách đã chốt mẫu và thanh toán cọc", active: true },
      { time: "2026-04-12T12:09:19.625Z", label: "Cập nhật trạng thái", desc: "Đơn hàng bắt đầu sang trạng thái: Đang giao hàng", active: true }
    ],
  },
  "DH-SAN-103": {
    code: "DH-SAN-103", type: "Hàng sẵn", status: "Hoàn thành",
    date: "2026-04-09T12:09:19.625Z", deliveryDate: "2026-04-16", fulfillmentType: "Giao tận nơi",
    customer: { name: "Phạm Thị D", phone: "0912345681", address: "123 Đường Vĩnh Thực, Hà Nội" },
    salesPerson: "Bình Nguyễn", total: 15000000, deposit: 4500000, depositMethod: "Chuyển khoản", paymentStatus: "paid",
    notes: "Khách yêu cầu sơn cẩn thận, sản phẩm đạt chất lượng cao.",
    products: [{
      name: "Sản phẩm Hàng sẵn 3",
      image: "https://noithatzito.com/wp-content/uploads/2021/04/bo-ban-an-go-soi-nga-6-ghe.jpg",
      customerSampleImage: "https://images.unsplash.com/photo-1540574163026-643ea20d25b5?q=80&w=800",
      material: "Gỗ Tự Nhiên", size: "Tiêu chuẩn", finish: "Bóng mờ 50%", qty: 10, price: 1500000, unit: "Cái", note: "Yêu cầu chi tiết đục chạm tinh xảo"
    }],
    timeline: [
      { time: "2026-04-08T12:09:19.625Z", label: "Tiếp nhận thông tin", desc: "Khách liên hệ qua Zalo", active: true },
      { time: "2026-04-09T12:09:19.625Z", label: "Chốt đơn", desc: "Khách đã chốt mẫu và thanh toán cọc", active: true },
      { time: "2026-04-10T12:09:19.625Z", label: "Cập nhật trạng thái", desc: "Đơn hàng bắt đầu sang trạng thái: Hoàn thành", active: true }
    ],
  },
  "DH-SAN-104": {
    code: "DH-SAN-104", type: "Hàng sẵn", status: "Chờ duyệt hủy",
    date: "2026-04-07T12:09:19.625Z", deliveryDate: "2026-04-14", fulfillmentType: "Giao tận nơi",
    customer: { name: "Hoàng Văn E", phone: "0912345682", address: "123 Đường Vĩnh Thực, Hà Nội" },
    salesPerson: "Bình Nguyễn", total: 15000000, deposit: 0, depositMethod: "Chuyển khoản", paymentStatus: "unpaid",
    notes: "Khách yêu cầu sơn cẩn thận, sản phẩm đạt chất lượng cao.",
    products: [{
      name: "Sản phẩm Hàng sẵn 4",
      image: "https://noithatminhkhoi.com/upload/images/tu-quan-ao-go-soi-nga-4-canh-dep.jpg",
      customerSampleImage: "https://images.unsplash.com/photo-1540574163026-643ea20d25b5?q=80&w=800",
      material: "Gỗ Tự Nhiên", size: "Tiêu chuẩn", finish: "Bóng mờ 50%", qty: 10, price: 1500000, unit: "Cái", note: "Yêu cầu chi tiết đục chạm tinh xảo"
    }],
    timeline: [
      { time: "2026-04-06T12:09:19.625Z", label: "Tiếp nhận thông tin", desc: "Khách liên hệ qua Zalo", active: true },
      { time: "2026-04-07T12:09:19.625Z", label: "Chốt đơn", desc: "Khách đã chốt mẫu và thanh toán cọc", active: true },
      { time: "2026-04-08T12:09:19.625Z", label: "Cập nhật trạng thái", desc: "Đơn hàng bắt đầu sang trạng thái: Chờ duyệt hủy", active: true }
    ],
  },
  "DH-SAN-105": {
    code: "DH-SAN-105", type: "Hàng sẵn", status: "Đơn đã hủy",
    date: "2026-04-05T12:09:19.625Z", deliveryDate: "2026-04-12", fulfillmentType: "Giao tận nơi",
    customer: { name: "Vũ Thị F", phone: "0912345683", address: "123 Đường Vĩnh Thực, Hà Nội" },
    salesPerson: "Bình Nguyễn", total: 15000000, deposit: 0, depositMethod: "Chuyển khoản", paymentStatus: "unpaid",
    notes: "Khách yêu cầu sơn cẩn thận, sản phẩm đạt chất lượng cao.",
    products: [{
      name: "Sản phẩm Hàng sẵn 5",
      image: "https://noithatzito.com/wp-content/uploads/2021/04/bo-ban-an-go-soi-nga-6-ghe.jpg",
      customerSampleImage: "https://images.unsplash.com/photo-1540574163026-643ea20d25b5?q=80&w=800",
      material: "Gỗ Tự Nhiên", size: "Tiêu chuẩn", finish: "Bóng mờ 50%", qty: 10, price: 1500000, unit: "Cái", note: "Yêu cầu chi tiết đục chạm tinh xảo"
    }],
    timeline: [
      { time: "2026-04-04T12:09:19.625Z", label: "Tiếp nhận thông tin", desc: "Khách liên hệ qua Zalo", active: true },
      { time: "2026-04-05T12:09:19.625Z", label: "Chốt đơn", desc: "Khách đã chốt mẫu và thanh toán cọc", active: true },
      { time: "2026-04-06T12:09:19.625Z", label: "Cập nhật trạng thái", desc: "Đơn hàng bắt đầu sang trạng thái: Đơn đã hủy", active: true }
    ],
  },
  "DH-MOC-101": {
    code: "DH-MOC-101", type: "Hàng mộc", status: "Chờ xử lý",
    date: "2026-04-13T12:09:19.625Z", deliveryDate: "2026-04-20", fulfillmentType: "Giao tận nơi",
    customer: { name: "Đặng Văn G", phone: "0912345684", address: "123 Đường Vĩnh Thực, Hà Nội" },
    salesPerson: "Bình Nguyễn", total: 45000000, deposit: 13500000, depositMethod: "Chuyển khoản", paymentStatus: "partial",
    notes: "Khách yêu cầu sơn cẩn thận, sản phẩm đạt chất lượng cao.",
    products: [{
      name: "Sản phẩm Hàng mộc 1",
      image: "https://xuongdogogiagoc.com/wp-content/uploads/2020/06/bo-ghe-au-a-go-huong-da-moc.jpg",
      customerSampleImage: "https://images.unsplash.com/photo-1540574163026-643ea20d25b5?q=80&w=800",
      material: "Gỗ Tự Nhiên", size: "Tiêu chuẩn", finish: "Bóng mờ 50%", qty: 10, price: 4500000, unit: "Cái", note: "Yêu cầu chi tiết đục chạm tinh xảo"
    }],
    timeline: [
      { time: "2026-04-12T12:09:19.625Z", label: "Tiếp nhận thông tin", desc: "Khách liên hệ qua Zalo", active: true },
      { time: "2026-04-13T12:09:19.625Z", label: "Chốt đơn", desc: "Khách đã chốt mẫu và thanh toán cọc", active: true },
      { time: "2026-04-14T12:09:19.625Z", label: "Cập nhật trạng thái", desc: "Đơn hàng bắt đầu sang trạng thái: Chờ xử lý", active: true }
    ],
  },
  "DH-MOC-102": {
    code: "DH-MOC-102", type: "Hàng mộc", status: "Đang gia công",
    date: "2026-04-11T12:09:19.625Z", deliveryDate: "2026-04-18", fulfillmentType: "Giao tận nơi",
    customer: { name: "Nguyễn Văn A", phone: "0912345685", address: "123 Đường Vĩnh Thực, Hà Nội" },
    salesPerson: "Bình Nguyễn", total: 45000000, deposit: 13500000, depositMethod: "Chuyển khoản", paymentStatus: "partial",
    notes: "Khách yêu cầu sơn cẩn thận, sản phẩm đạt chất lượng cao.",
    products: [{
      name: "Sản phẩm Hàng mộc 2",
      image: "https://dogomynghenamtuan.com/wp-content/uploads/2020/07/sap-tho-tu-linh-go-mit-moc.jpg",
      customerSampleImage: "https://images.unsplash.com/photo-1540574163026-643ea20d25b5?q=80&w=800",
      material: "Gỗ Tự Nhiên", size: "Tiêu chuẩn", finish: "Bóng mờ 50%", qty: 10, price: 4500000, unit: "Cái", note: "Yêu cầu chi tiết đục chạm tinh xảo"
    }],
    timeline: [
      { time: "2026-04-10T12:09:19.625Z", label: "Tiếp nhận thông tin", desc: "Khách liên hệ qua Zalo", active: true },
      { time: "2026-04-11T12:09:19.625Z", label: "Chốt đơn", desc: "Khách đã chốt mẫu và thanh toán cọc", active: true },
      { time: "2026-04-12T12:09:19.625Z", label: "Cập nhật trạng thái", desc: "Đơn hàng bắt đầu sang trạng thái: Đang gia công", active: true }
    ],
  },
  "DH-MOC-103": {
    code: "DH-MOC-103", type: "Hàng mộc", status: "Chờ giao hàng",
    date: "2026-04-09T12:09:19.625Z", deliveryDate: "2026-04-16", fulfillmentType: "Giao tận nơi",
    customer: { name: "Trần Thị B", phone: "0912345686", address: "123 Đường Vĩnh Thực, Hà Nội" },
    salesPerson: "Bình Nguyễn", total: 45000000, deposit: 13500000, depositMethod: "Chuyển khoản", paymentStatus: "partial",
    notes: "Khách yêu cầu sơn cẩn thận, sản phẩm đạt chất lượng cao.",
    products: [{
      name: "Sản phẩm Hàng mộc 3",
      image: "https://xuongdogogiagoc.com/wp-content/uploads/2020/06/bo-ghe-au-a-go-huong-da-moc.jpg",
      customerSampleImage: "https://images.unsplash.com/photo-1540574163026-643ea20d25b5?q=80&w=800",
      material: "Gỗ Tự Nhiên", size: "Tiêu chuẩn", finish: "Bóng mờ 50%", qty: 10, price: 4500000, unit: "Cái", note: "Yêu cầu chi tiết đục chạm tinh xảo"
    }],
    timeline: [
      { time: "2026-04-08T12:09:19.625Z", label: "Tiếp nhận thông tin", desc: "Khách liên hệ qua Zalo", active: true },
      { time: "2026-04-09T12:09:19.625Z", label: "Chốt đơn", desc: "Khách đã chốt mẫu và thanh toán cọc", active: true },
      { time: "2026-04-10T12:09:19.625Z", label: "Cập nhật trạng thái", desc: "Đơn hàng bắt đầu sang trạng thái: Chờ giao hàng", active: true }
    ],
  },
  "DH-MOC-104": {
    code: "DH-MOC-104", type: "Hàng mộc", status: "Đang giao hàng",
    date: "2026-04-07T12:09:19.625Z", deliveryDate: "2026-04-14", fulfillmentType: "Giao tận nơi",
    customer: { name: "Lê Văn C", phone: "0912345687", address: "123 Đường Vĩnh Thực, Hà Nội" },
    salesPerson: "Bình Nguyễn", total: 45000000, deposit: 13500000, depositMethod: "Chuyển khoản", paymentStatus: "partial",
    notes: "Khách yêu cầu sơn cẩn thận, sản phẩm đạt chất lượng cao.",
    products: [{
      name: "Sản phẩm Hàng mộc 4",
      image: "https://dogomynghenamtuan.com/wp-content/uploads/2020/07/sap-tho-tu-linh-go-mit-moc.jpg",
      customerSampleImage: "https://images.unsplash.com/photo-1540574163026-643ea20d25b5?q=80&w=800",
      material: "Gỗ Tự Nhiên", size: "Tiêu chuẩn", finish: "Bóng mờ 50%", qty: 10, price: 4500000, unit: "Cái", note: "Yêu cầu chi tiết đục chạm tinh xảo"
    }],
    timeline: [
      { time: "2026-04-06T12:09:19.625Z", label: "Tiếp nhận thông tin", desc: "Khách liên hệ qua Zalo", active: true },
      { time: "2026-04-07T12:09:19.625Z", label: "Chốt đơn", desc: "Khách đã chốt mẫu và thanh toán cọc", active: true },
      { time: "2026-04-08T12:09:19.625Z", label: "Cập nhật trạng thái", desc: "Đơn hàng bắt đầu sang trạng thái: Đang giao hàng", active: true }
    ],
  },
  "DH-MOC-105": {
    code: "DH-MOC-105", type: "Hàng mộc", status: "Hoàn thành",
    date: "2026-04-05T12:09:19.625Z", deliveryDate: "2026-04-12", fulfillmentType: "Giao tận nơi",
    customer: { name: "Phạm Thị D", phone: "0912345688", address: "123 Đường Vĩnh Thực, Hà Nội" },
    salesPerson: "Bình Nguyễn", total: 45000000, deposit: 13500000, depositMethod: "Chuyển khoản", paymentStatus: "paid",
    notes: "Khách yêu cầu sơn cẩn thận, sản phẩm đạt chất lượng cao.",
    products: [{
      name: "Sản phẩm Hàng mộc 5",
      image: "https://xuongdogogiagoc.com/wp-content/uploads/2020/06/bo-ghe-au-a-go-huong-da-moc.jpg",
      customerSampleImage: "https://images.unsplash.com/photo-1540574163026-643ea20d25b5?q=80&w=800",
      material: "Gỗ Tự Nhiên", size: "Tiêu chuẩn", finish: "Bóng mờ 50%", qty: 10, price: 4500000, unit: "Cái", note: "Yêu cầu chi tiết đục chạm tinh xảo"
    }],
    timeline: [
      { time: "2026-04-04T12:09:19.625Z", label: "Tiếp nhận thông tin", desc: "Khách liên hệ qua Zalo", active: true },
      { time: "2026-04-05T12:09:19.625Z", label: "Chốt đơn", desc: "Khách đã chốt mẫu và thanh toán cọc", active: true },
      { time: "2026-04-06T12:09:19.625Z", label: "Cập nhật trạng thái", desc: "Đơn hàng bắt đầu sang trạng thái: Hoàn thành", active: true }
    ],
  },
  "DH-MOC-106": {
    code: "DH-MOC-106", type: "Hàng mộc", status: "Chờ duyệt hủy",
    date: "2026-04-03T12:09:19.625Z", deliveryDate: "2026-04-10", fulfillmentType: "Giao tận nơi",
    customer: { name: "Hoàng Văn E", phone: "0912345689", address: "123 Đường Vĩnh Thực, Hà Nội" },
    salesPerson: "Bình Nguyễn", total: 45000000, deposit: 0, depositMethod: "Chuyển khoản", paymentStatus: "unpaid",
    notes: "Khách yêu cầu sơn cẩn thận, sản phẩm đạt chất lượng cao.",
    products: [{
      name: "Sản phẩm Hàng mộc 6",
      image: "https://dogomynghenamtuan.com/wp-content/uploads/2020/07/sap-tho-tu-linh-go-mit-moc.jpg",
      customerSampleImage: "https://images.unsplash.com/photo-1540574163026-643ea20d25b5?q=80&w=800",
      material: "Gỗ Tự Nhiên", size: "Tiêu chuẩn", finish: "Bóng mờ 50%", qty: 10, price: 4500000, unit: "Cái", note: "Yêu cầu chi tiết đục chạm tinh xảo"
    }],
    timeline: [
      { time: "2026-04-02T12:09:19.625Z", label: "Tiếp nhận thông tin", desc: "Khách liên hệ qua Zalo", active: true },
      { time: "2026-04-03T12:09:19.625Z", label: "Chốt đơn", desc: "Khách đã chốt mẫu và thanh toán cọc", active: true },
      { time: "2026-04-04T12:09:19.625Z", label: "Cập nhật trạng thái", desc: "Đơn hàng bắt đầu sang trạng thái: Chờ duyệt hủy", active: true }
    ],
  },
  "DH-MOC-107": {
    code: "DH-MOC-107", type: "Hàng mộc", status: "Đơn đã hủy",
    date: "2026-04-01T12:09:19.625Z", deliveryDate: "2026-04-08", fulfillmentType: "Giao tận nơi",
    customer: { name: "Vũ Thị F", phone: "0912345690", address: "123 Đường Vĩnh Thực, Hà Nội" },
    salesPerson: "Bình Nguyễn", total: 45000000, deposit: 0, depositMethod: "Chuyển khoản", paymentStatus: "unpaid",
    notes: "Khách yêu cầu sơn cẩn thận, sản phẩm đạt chất lượng cao.",
    products: [{
      name: "Sản phẩm Hàng mộc 7",
      image: "https://xuongdogogiagoc.com/wp-content/uploads/2020/06/bo-ghe-au-a-go-huong-da-moc.jpg",
      customerSampleImage: "https://images.unsplash.com/photo-1540574163026-643ea20d25b5?q=80&w=800",
      material: "Gỗ Tự Nhiên", size: "Tiêu chuẩn", finish: "Bóng mờ 50%", qty: 10, price: 4500000, unit: "Cái", note: "Yêu cầu chi tiết đục chạm tinh xảo"
    }],
    timeline: [
      { time: "2026-03-31T12:09:19.625Z", label: "Tiếp nhận thông tin", desc: "Khách liên hệ qua Zalo", active: true },
      { time: "2026-04-01T12:09:19.625Z", label: "Chốt đơn", desc: "Khách đã chốt mẫu và thanh toán cọc", active: true },
      { time: "2026-04-02T12:09:19.625Z", label: "Cập nhật trạng thái", desc: "Đơn hàng bắt đầu sang trạng thái: Đơn đã hủy", active: true }
    ],
  },
  "DH-DAT-101": {
    code: "DH-DAT-101", type: "Hàng khách đặt", status: "Chờ sản xuất",
    date: "2026-04-13T12:09:19.625Z", deliveryDate: "2026-04-20", fulfillmentType: "Giao tận nơi",
    customer: { name: "Đặng Văn G", phone: "0912345691", address: "123 Đường Vĩnh Thực, Hà Nội" },
    salesPerson: "Bình Nguyễn", total: 85000000, deposit: 25500000, depositMethod: "Chuyển khoản", paymentStatus: "partial",
    notes: "Khách yêu cầu sơn cẩn thận, sản phẩm đạt chất lượng cao.",
    products: [{
      name: "Sản phẩm Hàng khách đặt 1",
      image: "https://langnghedoanhnhan.com/wp-content/uploads/2021/04/truong-ky-go-gu-lao-moc.jpg",
      customerSampleImage: "https://images.unsplash.com/photo-1540574163026-643ea20d25b5?q=80&w=800",
      material: "Gỗ Tự Nhiên", size: "Tiêu chuẩn", finish: "Bóng mờ 50%", qty: 10, price: 8500000, unit: "Cái", note: "Yêu cầu chi tiết đục chạm tinh xảo"
    }],
    timeline: [
      { time: "2026-04-12T12:09:19.625Z", label: "Tiếp nhận thông tin", desc: "Khách liên hệ qua Zalo", active: true },
      { time: "2026-04-13T12:09:19.625Z", label: "Chốt đơn", desc: "Khách đã chốt mẫu và thanh toán cọc", active: true },
      { time: "2026-04-14T12:09:19.625Z", label: "Cập nhật trạng thái", desc: "Đơn hàng bắt đầu sang trạng thái: Chờ sản xuất", active: true }
    ],
  },
  "DH-DAT-102": {
    code: "DH-DAT-102", type: "Hàng khách đặt", status: "Chờ xử lý",
    date: "2026-04-11T12:09:19.625Z", deliveryDate: "2026-04-18", fulfillmentType: "Giao tận nơi",
    customer: { name: "Nguyễn Văn A", phone: "0912345692", address: "123 Đường Vĩnh Thực, Hà Nội" },
    salesPerson: "Bình Nguyễn", total: 85000000, deposit: 25500000, depositMethod: "Chuyển khoản", paymentStatus: "partial",
    notes: "Khách yêu cầu sơn cẩn thận, sản phẩm đạt chất lượng cao.",
    products: [{
      name: "Sản phẩm Hàng khách đặt 2",
      image: "https://dogomynghenamtuan.com/wp-content/uploads/2020/07/giuong-ngu-go-huong-da.jpg",
      customerSampleImage: "https://images.unsplash.com/photo-1540574163026-643ea20d25b5?q=80&w=800",
      material: "Gỗ Tự Nhiên", size: "Tiêu chuẩn", finish: "Bóng mờ 50%", qty: 10, price: 8500000, unit: "Cái", note: "Yêu cầu chi tiết đục chạm tinh xảo"
    }],
    timeline: [
      { time: "2026-04-10T12:09:19.625Z", label: "Tiếp nhận thông tin", desc: "Khách liên hệ qua Zalo", active: true },
      { time: "2026-04-11T12:09:19.625Z", label: "Chốt đơn", desc: "Khách đã chốt mẫu và thanh toán cọc", active: true },
      { time: "2026-04-12T12:09:19.625Z", label: "Cập nhật trạng thái", desc: "Đơn hàng bắt đầu sang trạng thái: Chờ xử lý", active: true }
    ],
  },
  "DH-DAT-103": {
    code: "DH-DAT-103", type: "Hàng khách đặt", status: "Đang gia công",
    date: "2026-04-09T12:09:19.625Z", deliveryDate: "2026-04-16", fulfillmentType: "Giao tận nơi",
    customer: { name: "Trần Thị B", phone: "0912345693", address: "123 Đường Vĩnh Thực, Hà Nội" },
    salesPerson: "Bình Nguyễn", total: 85000000, deposit: 25500000, depositMethod: "Chuyển khoản", paymentStatus: "partial",
    notes: "Khách yêu cầu sơn cẩn thận, sản phẩm đạt chất lượng cao.",
    products: [{
      name: "Sản phẩm Hàng khách đặt 3",
      image: "https://langnghedoanhnhan.com/wp-content/uploads/2021/04/truong-ky-go-gu-lao-moc.jpg",
      customerSampleImage: "https://images.unsplash.com/photo-1540574163026-643ea20d25b5?q=80&w=800",
      material: "Gỗ Tự Nhiên", size: "Tiêu chuẩn", finish: "Bóng mờ 50%", qty: 10, price: 8500000, unit: "Cái", note: "Yêu cầu chi tiết đục chạm tinh xảo"
    }],
    timeline: [
      { time: "2026-04-08T12:09:19.625Z", label: "Tiếp nhận thông tin", desc: "Khách liên hệ qua Zalo", active: true },
      { time: "2026-04-09T12:09:19.625Z", label: "Chốt đơn", desc: "Khách đã chốt mẫu và thanh toán cọc", active: true },
      { time: "2026-04-10T12:09:19.625Z", label: "Cập nhật trạng thái", desc: "Đơn hàng bắt đầu sang trạng thái: Đang gia công", active: true }
    ],
  },
  "DH-DAT-104": {
    code: "DH-DAT-104", type: "Hàng khách đặt", status: "Chờ giao hàng",
    date: "2026-04-07T12:09:19.625Z", deliveryDate: "2026-04-14", fulfillmentType: "Giao tận nơi",
    customer: { name: "Lê Văn C", phone: "0912345694", address: "123 Đường Vĩnh Thực, Hà Nội" },
    salesPerson: "Bình Nguyễn", total: 85000000, deposit: 25500000, depositMethod: "Chuyển khoản", paymentStatus: "partial",
    notes: "Khách yêu cầu sơn cẩn thận, sản phẩm đạt chất lượng cao.",
    products: [{
      name: "Sản phẩm Hàng khách đặt 4",
      image: "https://dogomynghenamtuan.com/wp-content/uploads/2020/07/giuong-ngu-go-huong-da.jpg",
      customerSampleImage: "https://images.unsplash.com/photo-1540574163026-643ea20d25b5?q=80&w=800",
      material: "Gỗ Tự Nhiên", size: "Tiêu chuẩn", finish: "Bóng mờ 50%", qty: 10, price: 8500000, unit: "Cái", note: "Yêu cầu chi tiết đục chạm tinh xảo"
    }],
    timeline: [
      { time: "2026-04-06T12:09:19.625Z", label: "Tiếp nhận thông tin", desc: "Khách liên hệ qua Zalo", active: true },
      { time: "2026-04-07T12:09:19.625Z", label: "Chốt đơn", desc: "Khách đã chốt mẫu và thanh toán cọc", active: true },
      { time: "2026-04-08T12:09:19.625Z", label: "Cập nhật trạng thái", desc: "Đơn hàng bắt đầu sang trạng thái: Chờ giao hàng", active: true }
    ],
  },
  "DH-DAT-105": {
    code: "DH-DAT-105", type: "Hàng khách đặt", status: "Đang giao hàng",
    date: "2026-04-05T12:09:19.625Z", deliveryDate: "2026-04-12", fulfillmentType: "Giao tận nơi",
    customer: { name: "Phạm Thị D", phone: "0912345695", address: "123 Đường Vĩnh Thực, Hà Nội" },
    salesPerson: "Bình Nguyễn", total: 85000000, deposit: 25500000, depositMethod: "Chuyển khoản", paymentStatus: "partial",
    notes: "Khách yêu cầu sơn cẩn thận, sản phẩm đạt chất lượng cao.",
    products: [{
      name: "Sản phẩm Hàng khách đặt 5",
      image: "https://langnghedoanhnhan.com/wp-content/uploads/2021/04/truong-ky-go-gu-lao-moc.jpg",
      customerSampleImage: "https://images.unsplash.com/photo-1540574163026-643ea20d25b5?q=80&w=800",
      material: "Gỗ Tự Nhiên", size: "Tiêu chuẩn", finish: "Bóng mờ 50%", qty: 10, price: 8500000, unit: "Cái", note: "Yêu cầu chi tiết đục chạm tinh xảo"
    }],
    timeline: [
      { time: "2026-04-04T12:09:19.625Z", label: "Tiếp nhận thông tin", desc: "Khách liên hệ qua Zalo", active: true },
      { time: "2026-04-05T12:09:19.625Z", label: "Chốt đơn", desc: "Khách đã chốt mẫu và thanh toán cọc", active: true },
      { time: "2026-04-06T12:09:19.625Z", label: "Cập nhật trạng thái", desc: "Đơn hàng bắt đầu sang trạng thái: Đang giao hàng", active: true }
    ],
  },
  "DH-DAT-106": {
    code: "DH-DAT-106", type: "Hàng khách đặt", status: "Hoàn thành",
    date: "2026-04-03T12:09:19.625Z", deliveryDate: "2026-04-10", fulfillmentType: "Giao tận nơi",
    customer: { name: "Hoàng Văn E", phone: "0912345696", address: "123 Đường Vĩnh Thực, Hà Nội" },
    salesPerson: "Bình Nguyễn", total: 85000000, deposit: 25500000, depositMethod: "Chuyển khoản", paymentStatus: "paid",
    notes: "Khách yêu cầu sơn cẩn thận, sản phẩm đạt chất lượng cao.",
    products: [{
      name: "Sản phẩm Hàng khách đặt 6",
      image: "https://dogomynghenamtuan.com/wp-content/uploads/2020/07/giuong-ngu-go-huong-da.jpg",
      customerSampleImage: "https://images.unsplash.com/photo-1540574163026-643ea20d25b5?q=80&w=800",
      material: "Gỗ Tự Nhiên", size: "Tiêu chuẩn", finish: "Bóng mờ 50%", qty: 10, price: 8500000, unit: "Cái", note: "Yêu cầu chi tiết đục chạm tinh xảo"
    }],
    timeline: [
      { time: "2026-04-02T12:09:19.625Z", label: "Tiếp nhận thông tin", desc: "Khách liên hệ qua Zalo", active: true },
      { time: "2026-04-03T12:09:19.625Z", label: "Chốt đơn", desc: "Khách đã chốt mẫu và thanh toán cọc", active: true },
      { time: "2026-04-04T12:09:19.625Z", label: "Cập nhật trạng thái", desc: "Đơn hàng bắt đầu sang trạng thái: Hoàn thành", active: true }
    ],
  },
  "DH-DAT-107": {
    code: "DH-DAT-107", type: "Hàng khách đặt", status: "Chờ duyệt hủy",
    date: "2026-04-01T12:09:19.625Z", deliveryDate: "2026-04-08", fulfillmentType: "Giao tận nơi",
    customer: { name: "Vũ Thị F", phone: "0912345697", address: "123 Đường Vĩnh Thực, Hà Nội" },
    salesPerson: "Bình Nguyễn", total: 85000000, deposit: 0, depositMethod: "Chuyển khoản", paymentStatus: "unpaid",
    notes: "Khách yêu cầu sơn cẩn thận, sản phẩm đạt chất lượng cao.",
    products: [{
      name: "Sản phẩm Hàng khách đặt 7",
      image: "https://langnghedoanhnhan.com/wp-content/uploads/2021/04/truong-ky-go-gu-lao-moc.jpg",
      customerSampleImage: "https://images.unsplash.com/photo-1540574163026-643ea20d25b5?q=80&w=800",
      material: "Gỗ Tự Nhiên", size: "Tiêu chuẩn", finish: "Bóng mờ 50%", qty: 10, price: 8500000, unit: "Cái", note: "Yêu cầu chi tiết đục chạm tinh xảo"
    }],
    timeline: [
      { time: "2026-03-31T12:09:19.625Z", label: "Tiếp nhận thông tin", desc: "Khách liên hệ qua Zalo", active: true },
      { time: "2026-04-01T12:09:19.625Z", label: "Chốt đơn", desc: "Khách đã chốt mẫu và thanh toán cọc", active: true },
      { time: "2026-04-02T12:09:19.625Z", label: "Cập nhật trạng thái", desc: "Đơn hàng bắt đầu sang trạng thái: Chờ duyệt hủy", active: true }
    ],
  },
  "DH-DAT-108": {
    code: "DH-DAT-108", type: "Hàng khách đặt", status: "Đơn đã hủy",
    date: "2026-03-30T12:09:19.625Z", deliveryDate: "2026-04-06", fulfillmentType: "Giao tận nơi",
    customer: { name: "Đặng Văn G", phone: "0912345698", address: "123 Đường Vĩnh Thực, Hà Nội" },
    salesPerson: "Bình Nguyễn", total: 85000000, deposit: 0, depositMethod: "Chuyển khoản", paymentStatus: "unpaid",
    notes: "Khách yêu cầu sơn cẩn thận, sản phẩm đạt chất lượng cao.",
    products: [{
      name: "Sản phẩm Hàng khách đặt 8",
      image: "https://dogomynghenamtuan.com/wp-content/uploads/2020/07/giuong-ngu-go-huong-da.jpg",
      customerSampleImage: "https://images.unsplash.com/photo-1540574163026-643ea20d25b5?q=80&w=800",
      material: "Gỗ Tự Nhiên", size: "Tiêu chuẩn", finish: "Bóng mờ 50%", qty: 10, price: 8500000, unit: "Cái", note: "Yêu cầu chi tiết đục chạm tinh xảo"
    }],
    timeline: [
      { time: "2026-03-29T12:09:19.625Z", label: "Tiếp nhận thông tin", desc: "Khách liên hệ qua Zalo", active: true },
      { time: "2026-03-30T12:09:19.625Z", label: "Chốt đơn", desc: "Khách đã chốt mẫu và thanh toán cọc", active: true },
      { time: "2026-03-31T12:09:19.625Z", label: "Cập nhật trạng thái", desc: "Đơn hàng bắt đầu sang trạng thái: Đơn đã hủy", active: true }
    ],
  },
  "DH-TEST-2X": {
    code: "DH-TEST-2X", type: "Hàng khách đặt", status: "Chờ xử lý",
    date: new Date().toISOString(), deliveryDate: "2026-05-01", fulfillmentType: "Giao tận nơi",
    customer: { name: "Nguyễn Thị Thử", phone: "0333444555", address: "Số 10 Phố Gỗ, Đồng Kỵ, Bắc Ninh" },
    salesPerson: "Bình Nguyễn", total: 35000000, deposit: 10000000, depositMethod: "Chuyển khoản", paymentStatus: "partial",
    notes: "Đơn hàng thử nghiệm tính năng deadline từng món.",
    products: [
      {
        name: "Ghế trường kỷ gỗ gụ",
        image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80",
        customerSampleImage: "https://images.unsplash.com/photo-1540574163026-643ea20d25b5?q=80&w=800",
        material: "Gỗ Gụ Lào", size: "2000 x 600 mm", finish: "Sơn PU mờ", qty: 1, price: 25000000, unit: "Chiếc", note: "Làm kỹ mộng"
      },
      {
        name: "Bàn trà đục chạm",
        image: "https://xuongdogogiagoc.com/wp-content/uploads/2020/06/bo-ghe-au-a-go-huong-da-moc.jpg",
        customerSampleImage: "https://images.unsplash.com/photo-1540574163026-643ea20d25b5?q=80&w=800",
        material: "Gỗ Gụ Lào", size: "1200 x 800 mm", finish: "Sơn PU mờ", qty: 1, price: 10000000, unit: "Cái", note: "Đục tích tứ linh"
      }
    ],
    timeline: [
      { time: new Date().toISOString(), label: "Tạo đơn", desc: "Đơn hàng khởi tạo để test deadline từng SP", active: true }
    ],
  },
};
