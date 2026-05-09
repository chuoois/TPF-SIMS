import { Clock, Play, CheckCircle2, AlertCircle } from "lucide-react";

export const STATUS_CONFIG = {
  WAITING: { label: "Tiếp nhận", color: "bg-gray-100 text-gray-700", icon: Clock },
  INSPECTION: { label: "Nghiệm thu", color: "bg-blue-100 text-blue-700", icon: Play },
  OWNER_PENDING: { label: "Chờ chủ duyệt", color: "bg-amber-100 text-amber-700", icon: AlertCircle },
  COMPLETED: { label: "Hoàn thành", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
};