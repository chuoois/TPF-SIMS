import React from "react";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import { Bell, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:3000";

let socket;
const shownNotificationIds = new Set(); // Bộ nhớ tạm tránh lặp Toast

/**
 * Xử lý thông báo: Hiển thị Toast và gọi callback cập nhật Context
 */
const handleNotification = (notification, onNewNotification) => {
  // Tránh hiển thị trùng Toast cho cùng một ID thông báo
  if (notification.pk_notification_id && shownNotificationIds.has(notification.pk_notification_id)) {
    // Vẫn gọi callback để cập nhật danh sách nếu cần, nhưng không hiện Toast nữa
    if (onNewNotification) onNewNotification(notification);
    return;
  }
  
  if (notification.pk_notification_id) {
    shownNotificationIds.add(notification.pk_notification_id);
    // Giới hạn bộ nhớ đệm
    if (shownNotificationIds.size > 50) {
      const firstId = shownNotificationIds.values().next().value;
      shownNotificationIds.delete(firstId);
    }
  }

  console.log("New notification received:", notification);

  // 1. Hiển thị Toast
  const getIcon = () => {
    switch (notification.type) {
      case "SUCCESS": return <CheckCircle2 size={18} className="text-green-500" />;
      case "ERROR": return <XCircle size={18} className="text-red-500" />;
      case "WARNING": return <AlertTriangle size={18} className="text-amber-500" />;
      default: return <Bell size={18} className="text-blue-500" />;
    }
  };

  const message = (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 shrink-0">
        {getIcon()}
      </div>
      <div className="flex flex-col gap-0.5">
        <p className="font-bold text-[13px] text-gray-800 leading-tight">
          {notification.title}
        </p>
        <p className="text-[11px] text-gray-500 leading-relaxed">
          {notification.message}
        </p>
      </div>
    </div>
  );

  toast(message, {
    duration: 5000,
    style: {
      borderRadius: '12px',
      background: '#fff',
      color: '#333',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      padding: '12px 16px',
      border: '1px solid #f3f4f6'
    }
  });

  // 2. Gọi callback để cập nhật danh sách thông báo trong UI (NotificationContext)
  if (onNewNotification) {
    onNewNotification(notification);
  }
};

/**
 * Socket Service
 * Quản lý kết nối real-time phía Client
 * Created By: ThinhBui
 * Created Date: 26/04/2026
 */
export const initSocket = (userId, onNewNotification, onForceLogout) => {
  if (socket) {
    // Nếu socket đã tồn tại, cập nhật lại listener với callback mới
    socket.off("new_notification");
    socket.on("new_notification", (notification) => {
      handleNotification(notification, onNewNotification);
    });

    socket.off("force_logout");
    if (onForceLogout) {
      socket.on("force_logout", (data) => {
        onForceLogout(data);
      });
    }

    return socket;
  }

  socket = io(SOCKET_URL, {
    transports: ["websocket"],
    reconnection: true,
  });

  socket.on("connect", () => {
    console.log("Connected to real-time server");
    if (userId) {
      socket.emit("register", userId);
    }
  });

  // Lắng nghe thông báo mới
  socket.on("new_notification", (notification) => {
    handleNotification(notification, onNewNotification);
  });

  // Lắng nghe yêu cầu đăng xuất
  if (onForceLogout) {
    socket.on("force_logout", (data) => {
      onForceLogout(data);
    });
  }

  socket.on("disconnect", () => {
    console.log("Disconnected from real-time server");
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
