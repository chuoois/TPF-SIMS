import { Clock, Play, CheckCircle2, AlertCircle } from "lucide-react";

export let MOCK_TASKS = [
  {
    id: "T-1001",
    productName: "Bàn ăn gỗ sồi 6 ghế",
    woodType: "Gỗ Sồi",
    dimensions: "160 x 80 x 75 cm",
    color: "Nâu tự nhiên",
    startedAt: "07/03/2026 08:30",
    status: "SANDING", // WAITING, SANDING, QC_PENDING, COMPLETED, REWORK
    isCustomOrder: true,
    orderCode: "DH-102",
    notes: "Bo tròn 4 góc, chà nhẵn mặt dưới bàn.",
    deadline: "17:00 Hôm nay",
    image: "/wood_products.png",
  },
  {
    id: "T-1002",
    productName: "Ghế đôn sofa bọc nhung",
    woodType: "Khung Gỗ Thông",
    dimensions: "40 x 40 x 45 cm",
    color: "Xám đậm",
    startedAt: null,
    status: "WAITING",
    isCustomOrder: false,
    orderCode: "NK-09",
    notes: "",
    deadline: "",
    image: "/wood_products.png",
  },
  {
    id: "T-1003",
    productName: "Kệ TV treo tường tối giản",
    woodType: "Gỗ Công Nghiệp MDF",
    dimensions: "200 x 30 x 40 cm",
    color: "Trắng bóng mờ",
    startedAt: "06/03/2026 10:15",
    status: "REWORK",
    isCustomOrder: true,
    orderCode: "DH-105",
    notes: "Khách yêu cầu sơn bóng mờ.",
    qcFeedback: "Chà nhám góc trái chưa mịn, cần làm lại.",
    deadline: "12:00 Ngày mai",
    image: "/wood_products.png",
  },
];

export const STATUS_CONFIG = {
  WAITING: { label: "Chờ xử lý", color: "bg-gray-100 text-gray-700", icon: Clock },
  SANDING: { label: "Đang chà nhám", color: "bg-blue-100 text-blue-700", icon: Play },
  PAINTING: { label: "Đang sơn/phủ", color: "bg-indigo-100 text-indigo-700", icon: Play },
  QC_PENDING: { label: "Chờ duyệt", color: "bg-orange-100 text-orange-700", icon: AlertCircle },
  REWORK: { label: "Làm lại", color: "bg-red-100 text-red-700 font-bold", icon: AlertCircle },
  COMPLETED: { label: "Đã xong", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
};

export const updateMockTaskStatus = (id, newStatus) => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const timestamp = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  MOCK_TASKS = MOCK_TASKS.map((t) => {
    if (t.id !== id) return t;
    const updates = { ...t, status: newStatus };
    if (newStatus === 'SANDING' && !t.startedAt) {
      updates.startedAt = timestamp;
    }
    return updates;
  });
};

export const getTaskById = (id) => {
  return MOCK_TASKS.find((t) => t.id === id);
};
