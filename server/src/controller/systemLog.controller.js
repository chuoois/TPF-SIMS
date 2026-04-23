const { SystemLog } = require("../entities");

/**
 * SystemLog Controller
 * Created By: ThinhBui
 * Created Date: 22/04/2026
 */
class SystemLogController {
  /**
   * Ghi log hành động hệ thống
   * @param {Object} req - Express request object (để lấy IP và User Agent)
   * @param {string} action - Tên hành động (VD: 'LOGIN', 'LOGOUT', 'UPDATE_ORDER')
   * @param {string} detail - Chi tiết hành động
   * @param {string} level - Mức độ log (INFO, WARN, ERROR)
   * @param {number} userId - ID người dùng (nếu không truyền sẽ lấy từ req.user)
   */
  async record(req, action, detail = "", level = "INFO", userId = null) {
    try {
      const logData = {
        user_account_id: userId || req.user?.userId || null,
        action: action,
        level: level,
        detail: detail,
        ip_address: req.ip || req.connection.remoteAddress || "",
        user_agent: req.headers ? req.headers["user-agent"] : "N/A",
      };

      await SystemLog.create(logData);
    } catch (error) {
      console.error("Failed to record system log:", error);
    }
  }
}

module.exports = new SystemLogController();
