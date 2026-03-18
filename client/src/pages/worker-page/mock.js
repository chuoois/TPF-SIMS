import { Clock, Play, CheckCircle2, AlertCircle } from "lucide-react";

export let MOCK_TASKS = [
  {
    id: "T-1001",
    productName: "Bàn ăn gỗ sồi 6 ghế",
    woodType: "Gỗ Sồi",
    dimensions: "160 x 80 x 75 ",
    color: "Nâu tự nhiên",
    startedAt: "07/03/2026 08:30",
    status: "SANDING",
    isCustomOrder: true,
    orderCode: "DH-102",
    notes: "Bo tròn 4 góc, chà nhẵn mặt dưới bàn.",
    deadline: "17/10/2023",
    urgency: "URGENT",
    image: "/wood_products.png",
    customerImages: [
      "https://images.unsplash.com/photo-1581428982868-e410dd047a90?auto=format&fit=crop&q=80&w=400",
      "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=400",
    ],
  },
  {
    id: "T-1004",
    productName: "Tủ quần áo 4 cánh hiện đại",
    woodType: "Gỗ Công Nghiệp MDF",
    dimensions: "200 x 60 x 220 ",
    color: "Trắng sứ",
    startedAt: "07/03/2026 10:00",
    status: "PAINTING",
    isCustomOrder: true,
    orderCode: "DH-108",
    notes: "Lắp thêm thanh treo inox, bản lề giảm chấn.",
    deadline: "18/10/2023",
    urgency: "WARNING",
    image: "/wood_products.png",
    customerImages: [
      "https://images.unsplash.com/photo-1595428774223-ef52624120ec?auto=format&fit=crop&q=80&w=400",
    ],
  },
  {
    id: "T-1002",
    productName: "Ghế đôn sofa bọc nhung",
    woodType: "Khung Gỗ Thông",
    dimensions: "40 x 40 x 45 ",
    color: "Xám đậm",
    startedAt: null,
    status: "WAITING",
    isCustomOrder: false,
    orderCode: "NK-09",
    notes: "Kiểm tra kỹ phần đệm ngồi trước khi bọc.",
    image: "/wood_products.png",
    customerImages: [
      "https://images.unsplash.com/photo-1595428774223-ef52624120ec?auto=format&fit=crop&q=80&w=400",
    ],
  },
  {
    id: "T-1003",
    productName: "Kệ TV treo tường tối giản",
    woodType: "Gỗ Công Nghiệp MDF",
    dimensions: "200 x 30 x 40 ",
    color: "Trắng bóng mờ",
    startedAt: "06/03/2026 10:15",
    status: "REWORK",
    isCustomOrder: true,
    orderCode: "DH-105",
    notes: "Khách yêu cầu sơn bóng mờ, không lấy bóng gương.",
    qcFeedback: "Chà nhám góc trái chưa mịn, sơn bị đọng giọt.",
    image: "/wood_products.png",
    customerImages: [
      "https://images.unsplash.com/photo-1595428774223-ef52624120ec?auto=format&fit=crop&q=80&w=400",
    ],
  },
  {
    id: "T-1005",
    productName: "Giường ngủ 1m8 Gỗ Xoan Đào",
    woodType: "Gỗ Xoan Đào",
    dimensions: "180 x 200 x 40 ",
    color: "Cánh gián",
    startedAt: null,
    status: "WAITING",
    isCustomOrder: false,
    orderCode: "K-22",
    notes: "Hàng sản xuất kho, phun PU kỹ chống mối mọt.",
    image: "/wood_products.png",
    customerImages: [
      "https://images.unsplash.com/photo-1581428982868-e410dd047a90?auto=format&fit=crop&q=80&w=400",
    ],
  },
];

export const STATUS_CONFIG = {
  WAITING: { label: "Chờ xử lý", color: "bg-gray-100 text-gray-700", icon: Clock },
  SANDING: { label: "Đang đánh giấy giáp", color: "bg-blue-100 text-blue-700", icon: Play },
  PAINTING: { label: "Đang phun sơn", color: "bg-indigo-100 text-indigo-700", icon: Play },
  OWNER_PENDING: { label: "Chờ chủ duyệt", color: "bg-amber-100 text-amber-700", icon: AlertCircle },
  QC_PENDING: { label: "Chờ duyệt", color: "bg-orange-100 text-orange-700", icon: AlertCircle },
  REWORK: { label: "Làm lại", color: "bg-red-100 text-red-700 font-bold", icon: AlertCircle },
  COMPLETED: { label: "Đã xong", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
};

export const updateMockTaskStatus = (id, newStatus, finishedImage = null) => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const timestamp = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  MOCK_TASKS = MOCK_TASKS.map((t) => {
    if (t.id !== id) return t;
    const updates = { ...t, status: newStatus };
    if (newStatus === "SANDING" && !t.startedAt) {
      updates.startedAt = timestamp;
    }
    if (finishedImage) {
      updates.finishedImage = finishedImage;
    }
    return updates;
  });
};

export const updateTaskFinishedImage = (id, finishedImage) => {
  MOCK_TASKS = MOCK_TASKS.map((t) => {
    if (t.id !== id) return t;
    return { ...t, finishedImage };
  });
};

export const updateTaskDeadline = (id, deadline, urgency) => {
  MOCK_TASKS = MOCK_TASKS.map((t) => {
    if (t.id !== id) return t;
    return { ...t, deadline, urgency };
  });
};

export const getTaskById = (id) => {
  return MOCK_TASKS.find((t) => t.id === id);
};
