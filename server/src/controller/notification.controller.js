const { Notification } = require("../entities");

/**
 * Notification Controller
 * Quản lý các API về thông báo
 * Created By: ThinhBui
 * Created Date: 26/04/2026
 */
class NotificationController {
  /**
   * Lấy danh sách thông báo của người dùng
   */
  async getMyNotifications(req, res) {
    try {
      const userId = req.user.userId;
      const { limit = 20, page = 1 } = req.query;

      const offset = (page - 1) * limit;

      const notifications = await Notification.findAndCountAll({
        where: {
          fk_user_id: [userId, null], // Lấy cả thông báo riêng và thông báo hệ thống
          status: 1,
        },
        order: [["createdate", "DESC"]],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      return res.status(200).json({
        total: notifications.count,
        pages: Math.ceil(notifications.count / limit),
        currentPage: parseInt(page),
        data: notifications.rows,
      });
    } catch (error) {
      console.error("Get notifications error:", error);
      return res.status(500).json({ message: "Lỗi khi lấy danh sách thông báo" });
    }
  }

  /**
   * Đánh dấu thông báo là đã đọc
   */
  async markAsRead(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const notif = await Notification.findOne({
        where: { pk_notification_id: id, fk_user_id: userId },
      });

      if (!notif) {
        return res.status(404).json({ message: "Không tìm thấy thông báo" });
      }

      await notif.update({ is_read: true });

      return res.status(200).json({ message: "Đã đánh dấu là đã đọc" });
    } catch (error) {
      console.error("Mark as read error:", error);
      return res.status(500).json({ message: "Lỗi khi cập nhật trạng thái thông báo" });
    }
  }

  /**
   * Đánh dấu tất cả thông báo là đã đọc
   */
  async markAllAsRead(req, res) {
    try {
      const userId = req.user.userId;

      await Notification.update(
        { is_read: true },
        { where: { fk_user_id: userId, is_read: false } }
      );

      return res.status(200).json({ message: "Đã đánh dấu tất cả là đã đọc" });
    } catch (error) {
      console.error("Mark all as read error:", error);
      return res.status(500).json({ message: "Lỗi khi cập nhật trạng thái thông báo" });
    }
  }
}

module.exports = new NotificationController();
