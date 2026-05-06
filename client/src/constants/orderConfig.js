import {
  Package, Clock, CheckCircle2, AlertCircle, XCircle, Hammer, Truck
} from "lucide-react";

export const ORDER_CONFIG = {
  TYPES: ["Hàng mộc", "Hàng sẵn", "Hàng khách đặt"],
  TYPE_MAP: { 1: "Hàng mộc", 2: "Hàng sẵn", 3: "Hàng khách đặt" },
  REVERSE_TYPE_MAP: { "Hàng mộc": 1, "Hàng sẵn": 2, "Hàng khách đặt": 3 },

  STATUS_MAP: {
    0: "Đơn đã hủy", 1: "Chờ sản xuất", 2: "Chờ xử lý", 3: "Đang gia công",
    4: "Chờ giao hàng", 5: "Đang giao hàng", 6: "Hoàn thành", 7: "Chờ duyệt hủy"
  },

  REVERSE_STATUS_MAP: {
    "Đơn đã hủy": 0, "Chờ sản xuất": 1, "Chờ xử lý": 2, "Đang gia công": 3,
    "Chờ giao hàng": 4, "Đang giao hàng": 5, "Hoàn thành": 6, "Chờ duyệt hủy": 7
  },

  STATUSES_BY_TYPE: {
    "Hàng mộc": ["Chờ xử lý", "Đang gia công", "Chờ giao hàng", "Đang giao hàng", "Hoàn thành", "Chờ duyệt hủy", "Đơn đã hủy"],
    "Hàng sẵn": ["Chờ xử lý", "Chờ giao hàng", "Đang giao hàng", "Hoàn thành", "Chờ duyệt hủy", "Đơn đã hủy"],
    "Hàng khách đặt": ["Chờ sản xuất", "Chờ xử lý", "Đang gia công", "Chờ giao hàng", "Đang giao hàng", "Hoàn thành", "Chờ duyệt hủy", "Đơn đã hủy"]
  },

  STATUS_STYLE: {
    "Chờ xử lý": { bg: "rgba(var(--brand-primary-rgb), 0.05)", text: "var(--brand-primary)", border: "rgba(var(--brand-primary-rgb), 0.1)", icon: Clock },
    "Chờ sản xuất": { bg: "rgba(var(--status-warning-rgb), 0.1)", text: "var(--status-pending)", border: "rgba(var(--status-warning-rgb), 0.2)", icon: Package },
    "Đang gia công": { bg: "rgba(var(--status-warning-rgb), 0.1)", text: "var(--status-pending)", border: "rgba(var(--status-warning-rgb), 0.2)", icon: Hammer },
    "Chờ giao hàng": { bg: "rgba(var(--palette-purple-rgb), 0.05)", text: "var(--palette-purple)", border: "rgba(var(--palette-purple-rgb), 0.1)", icon: Package },
    "Đang giao hàng": { bg: "rgba(var(--palette-blue-rgb), 0.05)", text: "var(--palette-blue)", border: "rgba(var(--palette-blue-rgb), 0.1)", icon: Truck },
    "Hoàn thành": { bg: "rgba(var(--status-success-rgb), 0.1)", text: "var(--status-success)", border: "rgba(var(--status-success-rgb), 0.2)", icon: CheckCircle2 },
    "Chờ duyệt hủy": { bg: "rgba(var(--status-warning-rgb), 0.1)", text: "var(--status-pending)", border: "rgba(var(--status-warning-rgb), 0.2)", icon: AlertCircle },
    "Đơn đã hủy": { bg: "rgba(var(--status-error-rgb), 0.05)", text: "var(--status-error)", border: "rgba(var(--status-error-rgb), 0.1)", icon: XCircle },
    "Đã nhập kho": { bg: "rgba(var(--status-success-rgb), 0.1)", text: "var(--status-success)", border: "rgba(var(--status-success-rgb), 0.2)", icon: Package },
  }
};
