const { Op } = require("sequelize");
const { SystemLog, UserAccount, UserProfile, UserRole } = require("../entities");

/**
 * SystemLog Controller
 * Created By: ThinhBui
 * Created Date: 22/04/2026
 */
class SystemLogController {
  /**
   * Lấy danh sách nhật ký hệ thống (kèm phân trang, tìm kiếm, lọc)
   */
  async getAllLogs(req, res) {
    try {
      const { search, level, fromDate, toDate, page = 1, limit = 15 } = req.query;
      const offset = (page - 1) * limit;

      const where = {};

      // Tìm kiếm theo Hành động, Chi tiết, hoặc Tên nhân viên
      if (search) {
        where[Op.or] = [
          { action: { [Op.like]: `%${search}%` } },
          { detail: { [Op.like]: `%${search}%` } },
          { "$account.email$": { [Op.like]: `%${search}%` } },
          { "$account.profile.full_name$": { [Op.like]: `%${search}%` } },
        ];
      }

      // Lọc theo mức độ (INFO, WARN, ERROR)
      if (level) {
        where.level = level;
      }

      // Lọc theo ngày tạo (Created Date)
      if (fromDate || toDate) {
        where.createdate = {};
        if (fromDate) {
          where.createdate[Op.gte] = new Date(fromDate);
        }
        if (toDate) {
          const endOfDay = new Date(toDate);
          endOfDay.setHours(23, 59, 59, 999);
          where.createdate[Op.lte] = endOfDay;
        }
      }

      const { count, rows } = await SystemLog.findAndCountAll({
        where,
        include: [
          {
            model: UserAccount,
            as: "account",
            attributes: ["email"],
            include: [
              { model: UserRole, as: "role", attributes: ["role_name"] },
              { model: UserProfile, as: "profile", attributes: ["full_name"] },
            ],
          },
        ],
        order: [["createdate", "DESC"]],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      return res.status(200).json({
        data: rows,
        pagination: {
          totalItems: count,
          totalPages: Math.ceil(count / limit),
          currentPage: parseInt(page),
          limit: parseInt(limit),
        },
      });
    } catch (error) {
      console.error("Get all system logs error:", error);
      return res.status(500).json({ message: "Lỗi hệ thống khi lấy nhật ký" });
    }
  }

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
