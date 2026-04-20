/**
 * Mock Data & Constants — SalesRequirements
 *
 * ⚠️  Khi tích hợp backend, thay thế MOCK_REQUIREMENTS bằng API service calls.
 *     Ví dụ: MOCK_REQUIREMENTS → requirementApi.getAll()
 */

export const MOCK_REQUIREMENTS = [
  {
    id: "REQ-001",
    code: "REQ-2603-0001",
    customer: "Lê Thị Lan",
    phone: "0345678901",
    address: "Căn 1204, Tòa C, Vinhomes Ocean Park, Gia Lâm, Hà Nội",
    salesPerson: "Bình Nguyễn",
    createdDate: "2026-03-12",
    status: "Đang xử lý",
    leadTime: 30,
    notes:
      "Khách nâng cấp căn hộ, cần giường Master và kệ Tivi phòng khách đồng bộ gỗ Sồi.",
    surveyNotes: "",
    proposedSolution: "",
    estimatedPrice: 0,
    items: [
      {
        id: "ITM-001",
        name: "Giường ngủ Master",
        material: "Gỗ Sồi Mỹ",
        specs: {
          dimensions: "180 x 200 x 40 cm",
          note: "Hộc kéo 2 bên hông giường",
        },
        customerImages: [
          "https://images.unsplash.com/photo-1505693419173-42b9218a5c81?auto=format&fit=crop&q=80&w=600",
        ],
        quotedPrice: 0,
      },
      {
        id: "ITM-005",
        name: "Kệ Tivi phòng khách",
        material: "Gỗ Sồi Mỹ",
        specs: {
          dimensions: "220 x 45 x 50 cm",
          note: "Cánh mây mắt cáo tự nhiên",
        },
        customerImages: [
          "https://images.unsplash.com/photo-1594913785162-e6785b42defa?auto=format&fit=crop&q=80&w=600",
        ],
        quotedPrice: 0,
      },
    ],
  },
  {
    id: "REQ-002",
    code: "REQ-2603-0002",
    customer: "Trần Minh Quang",
    phone: "0909123456",
    address: "Biệt thự KĐT Ecopark, Văn Giang, Hưng Yên",
    salesPerson: "Bình Nguyễn",
    createdDate: "2026-03-11",
    status: "Đang xử lý",
    leadTime: 45,
    notes: "Khách muốn bộ bàn ăn cổ điển kiểu Louis XVI",
    surveyNotes: "",
    proposedSolution: "",
    estimatedPrice: 0,
    items: [
      {
        id: "ITM-002",
        name: "Bàn ăn Hoàng Gia",
        material: "Gỗ Gõ Đỏ Pachy",
        specs: {
          dimensions: "240 x 110 x 75 cm",
          note: "Đục chạm mẫu Louis XVI",
        },
        customerImages: [
          "https://images.unsplash.com/photo-1617806118233-ef203e91122b?auto=format&fit=crop&q=80&w=600",
          "https://images.unsplash.com/photo-1565538810844-16ad7395015c?auto=format&fit=crop&q=80&w=600",
        ],
        quotedPrice: 0,
        isApproved: false,
      },
    ],
  },
  {
    id: "REQ-003",
    code: "REQ-2603-0003",
    customer: "Nguyễn Thị Hồng",
    phone: "0912123123",
    address: "KĐT Times City, Quận Hai Bà Trưng, Hà Nội",
    salesPerson: "Bình Nguyễn",
    createdDate: "2026-03-10",
    status: "Đã tạo đơn",
    notes: "Khách phê duyệt thiết kế hiện đại",
    surveyNotes: "Khách yêu cầu độ hoàn thiện bóng kính.",
    proposedSolution: "Tủ rượu âm tường gỗ Hương, LED cảm ứng.",
    estimatedPrice: 45000000,
    items: [
      {
        id: "ITM-003",
        name: "Tủ rượu sang trọng",
        material: "Gỗ Hương",
        specs: {
          dimensions: "120 x 50 x 200 cm",
          note: "3 ngăn kéo, khóa an toàn",
        },
        customerImages: [
          "https://images.unsplash.com/photo-1578500494198-246f612d03b3?auto=format&fit=crop&q=80&w=600",
        ],
        quotedPrice: 45000000,
        isApproved: true,
      },
    ],
  },
  {
    id: "REQ-004",
    code: "REQ-2603-0004",
    customer: "Phạm Thành Nam",
    phone: "0987654321",
    address: "Chung cư Green Stars, Phạm Văn Đồng, Bắc Từ Liêm, HN",
    salesPerson: "Bình Nguyễn",
    createdDate: "2026-03-09",
    status: "Đã tạo đơn",
    notes: "Combo phòng khách căn hộ chung cư",
    surveyNotes: "Căn hộ tầng 25, diện tích nhỏ.",
    proposedSolution: "Thiết kế tối giản, tích hợp ngăn chứa đồ thông minh.",
    estimatedPrice: 12000000,
    items: [
      {
        id: "ITM-004",
        name: "Kệ Tivi Slim",
        material: "Gỗ Công nghiệp An Cường",
        specs: {
          dimensions: "200 x 40 x 45 cm",
          note: "Hàng đặt theo kích thước lẻ",
        },
        customerImages: [
          "https://images.unsplash.com/photo-1594913785162-e6785b42defa?auto=format&fit=crop&q=80&w=600",
        ],
        quotedPrice: 12000000,
        isApproved: true,
      },
    ],
  },
];

export const STATUS_CONFIG = {
  "Đang xử lý": {
    bg: "#FEF3C7",
    text: "#D97706",
    border: "#FDE68A",
    icon: "Clock",
    description: "Đang trong quá trình khảo sát, thiết kế & báo giá",
  },
  "Đã tạo đơn": {
    bg: "#F0FDF4",
    text: "#166534",
    border: "#BBF7D0",
    icon: "CheckCircle2",
    description: "Đã lập lệnh sản xuất & chuyển sang phân xưởng",
  },
  "Đơn đã hủy": {
    bg: "#F3F4F6",
    text: "#6B7280",
    border: "#E5E7EB",
    icon: "X",
    description: "Yêu cầu đã bị hủy hoặc khách dừng tư vấn",
  },
};
