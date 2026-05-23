const { Server } = require("socket.io");
const Notification = require("../entities/Notification");

let io;
const userSockets = new Map(); // Lưu trữ map user_id -> socket_id

/**
 * Socket Manager
 * Quản lý kết nối thời gian thực và thông báo
 * Created By: ThinhBui
 * Created Date: 26/04/2026
 */
const initSocket = (server) => {
  io = new Server(server, {
    path: "/socket.io",
    cors: {
      origin: "*", // Trong sản xuất nên giới hạn origins
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Khi người dùng định danh (sau khi login)
    socket.on("register", (userId) => {
      if (userId) {
        userSockets.set(userId.toString(), socket.id);
        socket.join(userId.toString()); // Join a room to support multi-device broadcast
        console.log(`User ${userId} registered with socket ${socket.id}`);
      }
    });

    socket.on("disconnect", () => {
      // Xóa socket khỏi map khi ngắt kết nối
      for (const [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          userSockets.delete(userId);
          break;
        }
      }
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
};

/**
 * Gửi thông báo real-time và lưu vào DB
 */
const sendNotification = async ({ userId, title, message, type = "INFO", link = null, createBy = null }) => {
  try {
    // 1. Lưu vào Database
    const newNotif = await Notification.create({
      fk_user_id: userId,
      title,
      message,
      type,
      link,
      createBy,
    });

    // 2. Gửi real-time qua Socket
    if (io) {
      if (userId) {
        // Gửi cho một user cụ thể
        const socketId = userSockets.get(userId.toString());
        if (socketId) {
          io.to(socketId).emit("new_notification", newNotif);
        }
      } else {
        // Gửi cho tất cả (Broadcast)
        io.emit("new_notification", newNotif);
      }
    }

    return newNotif;
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

/**
 * Buộc đăng xuất tất cả các thiết bị của một người dùng
 */
const forceLogout = (userId) => {
  if (io && userId) {
    io.to(userId.toString()).emit("force_logout", {
      message: "Tài khoản của bạn đã bị vô hiệu hóa hoặc xóa.",
    });
    console.log(`Emitted force_logout to user ${userId}`);
  }
};

module.exports = {
  initSocket,
  sendNotification,
  forceLogout,
  getIO: () => io,
};
