import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Package,
  Activity,
  Trash2
} from "lucide-react";

export const STATUS_MAP = {
  0: "Đã hủy",
  1: "Chờ tiếp nhận",
  2: "Đã tiếp nhận",
  3: "Hoàn thành",
};

export const REVERSE_STATUS_MAP = {
  "Đã hủy": 0,
  "Chờ tiếp nhận": 1,
  "Đã tiếp nhận": 2,
  "Hoàn thành": 3,
};

export const STATUS_CONFIG = {
  "Chờ tiếp nhận": {
    bg: "#fffbeb",
    text: "#d97706",
    border: "#fef3c7",
    icon: Clock
  },
  "Đã tiếp nhận": {
    bg: "#e0f2fe",
    text: "#0284c7",
    border: "#bae6fd",
    icon: Activity
  },
  "Hoàn thành": {
    bg: "#f0fdf4",
    text: "#16a34a",
    border: "#dcfce7",
    icon: CheckCircle2
  },
  "Đã hủy": {
    bg: "#f9fafb",
    text: "#4b5563",
    border: "#f3f4f6",
    icon: Trash2
  },
};
