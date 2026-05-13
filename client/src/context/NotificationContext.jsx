import React, { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "@/lib/axios";
import { useAuth } from "./AuthContext";
import { initSocket, disconnectSocket } from "@/services/socket.service";
import toast from "react-hot-toast";

const NotificationContext = createContext();

/**
 * Notification Context
 * Quản lý danh sách thông báo toàn cục
 * Created By: ThinhBui
 * Created Date: 26/04/2026
 */
export const NotificationProvider = ({ children }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Tải thông báo từ API
  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await axiosInstance.get("/notification");
      setNotifications(res.data.data);
      const unread = res.data.data.filter((n) => !n.is_read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Fetch notifications error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      // Khởi tạo Socket và lắng nghe thông báo mới
      if (user && user.user_account_id) {
        initSocket(
          user.user_account_id,
          (notif) => {
            addNotification(notif);
          },
          (data) => {
            toast.error(data?.message || "Tài khoản của bạn đã bị vô hiệu hóa hoặc xóa.", { duration: 5000 });
            if (logout) logout();
          }
        );
      }
    } else {
      setNotifications([]);
      setUnreadCount(0);
      disconnectSocket();
    }
  }, [isAuthenticated, user]);

  // Hàm thêm thông báo mới (gọi từ Socket)
  const addNotification = (notif) => {
    setNotifications((prev) => [notif, ...prev]);
    if (!notif.is_read) {
      setUnreadCount((prev) => prev + 1);
    }
  };

  // Đánh dấu đã đọc một tin
  const markAsRead = async (id) => {
    try {
      await axiosInstance.patch(`/notification/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.pk_notification_id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Mark as read error:", error);
    }
  };

  // Đánh dấu tất cả là đã đọc
  const markAllAsRead = async () => {
    try {
      await axiosInstance.post("/notification/mark-all-read");
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Mark all as read error:", error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        addNotification,
        markAsRead,
        markAllAsRead,
        refresh: fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};
