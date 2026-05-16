import { Clock, Hammer, Camera, CheckCircle2, X } from "lucide-react";

export const STATUS_CONFIG = {
  "Chờ gia công": { label: "Chờ gia công", color: "bg-gray-100 text-gray-700", icon: Clock },
  "Đang gia công": { label: "Đang gia công", color: "bg-blue-100 text-blue-700", icon: Hammer },
  "Gửi Nghiệm Thu": { label: "Gửi Nghiệm Thu", color: "bg-amber-100 text-amber-700", icon: Camera },
  "Hoàn Thành": { label: "Hoàn Thành", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  "Hủy": { label: "Đã hủy", color: "bg-red-100 text-red-700", icon: X },
};