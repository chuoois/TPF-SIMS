const { Op } = require("sequelize");
const bcrypt = require("bcrypt");
const { UserAccount, UserProfile, UserRole, RefreshToken } = require("../entities");
const systemLogController = require("./systemLog.controller");
const socketManager = require("../sockets/socketManager");

/**
 * Account Controller - Quản lý tài khoản và hồ sơ nhân viên
 * Created By: ThinhBui
 * Created Date: 23/04/2026
 */
class AccountController {
  /**
   * Lấy danh sách tài khoản (kèm phân trang, tìm kiếm, lọc)
   */
  async getAllAccounts(req, res) {
    try {
      const { search, role_id, fromDate, toDate, page = 1, limit = 15 } = req.query;
      const offset = (page - 1) * limit;

      const where = {
        "$role.role_code$": { [Op.ne]: "OWNER" }
      };
      const profileWhere = {};

      // Tìm kiếm theo Email hoặc Tên nhân viên
      if (search) {
        where[Op.or] = [
          { email: { [Op.like]: `%${search}%` } },
          { "$profile.full_name$": { [Op.like]: `%${search}%` } },
        ];
      }

      // Lọc theo vai trò
      if (role_id) {
        where.role_id = role_id;
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

      const { count, rows } = await UserAccount.findAndCountAll({
        where,
        include: [
          { model: UserRole, as: "role" },
          { model: UserProfile, as: "profile" },
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
      console.error("Get all accounts error:", error);
      return res.status(500).json({ message: "Lỗi hệ thống khi lấy danh sách tài khoản" });
    }
  }

  /**
   * Lấy chi tiết một tài khoản
   */
  async getAccountById(req, res) {
    try {
      const { id } = req.params;
      const account = await UserAccount.findByPk(id, {
        include: [
          { model: UserRole, as: "role" },
          { model: UserProfile, as: "profile" },
        ],
      });

      if (!account) {
        return res.status(404).json({ message: "Không tìm thấy tài khoản" });
      }

      // Không trả về password_hash
      const accountData = account.toJSON();
      delete accountData.password_hash;

      return res.status(200).json(accountData);
    } catch (error) {
      console.error("Get account by id error:", error);
      return res.status(500).json({ message: "Lỗi hệ thống khi lấy thông tin tài khoản" });
    }
  }

  /**
   * Tạo tài khoản mới (kèm Profile)
   */
  async createAccount(req, res) {
    try {
      const { email, password, role_id, full_name, phone_number, dob, gender } = req.body;
      const currentUserId = req.user.userId;

      // Kiểm tra email đã tồn tại chưa
      const existingAccount = await UserAccount.findOne({ where: { email } });
      if (existingAccount) {
        return res.status(400).json({ message: "Email này đã được sử dụng" });
      }

      // Hash mật khẩu
      const hashedPassword = await bcrypt.hash(password || "123456aA@", 10);

      // Tạo tài khoản trong transaction để đảm bảo cả account và profile đều được tạo
      const result = await UserAccount.sequelize.transaction(async (t) => {
        const newAccount = await UserAccount.create(
          {
            email,
            password_hash: hashedPassword,
            role_id,
            status: 1, // Mặc định Active
            createby: currentUserId,
            createdate: new Date(),
          },
          { transaction: t }
        );

        const newProfile = await UserProfile.create(
          {
            user_account_id: newAccount.user_account_id,
            full_name,
            phone_number,
            dob,
            gender,
            createby: currentUserId,
            createdate: new Date(),
          },
          { transaction: t }
        );

        return { account: newAccount, profile: newProfile };
      });

      // Ghi log
      await systemLogController.record(
        req,
        "CREATE_ACCOUNT",
        `Đã tạo tài khoản mới cho nhân viên: ${full_name} (${email})`,
        "INFO",
        currentUserId
      );

      return res.status(201).json({
        message: "Tạo tài khoản thành công",
        data: {
          user_account_id: result.account.user_account_id,
          email: result.account.email,
        },
      });
    } catch (error) {
      console.error("Create account error:", error);
      return res.status(500).json({ message: "Lỗi hệ thống khi tạo tài khoản" });
    }
  }

  /**
   * Cập nhật thông tin tài khoản và hồ sơ
   */
  async updateAccount(req, res) {
    try {
      const { id } = req.params;
      const { role_id, full_name, phone_number, dob, gender, password } = req.body;
      const currentUserId = req.user.userId;

      const account = await UserAccount.findByPk(id, {
        include: [{ model: UserProfile, as: "profile" }],
      });

      if (!account) {
        return res.status(404).json({ message: "Không tìm thấy tài khoản để cập nhật" });
      }

      await UserAccount.sequelize.transaction(async (t) => {
        // Cập nhật account (vai trò, mật khẩu nếu có)
        const accountUpdates = {
          role_id: role_id || account.role_id,
          modifiedate: new Date(),
          modifieby: currentUserId,
        };

        if (password) {
          accountUpdates.password_hash = await bcrypt.hash(password, 10);
        }

        await account.update(accountUpdates, { transaction: t });

        // Cập nhật profile
        if (account.profile) {
          await account.profile.update(
            {
              full_name,
              phone_number,
              dob,
              gender,
              modifiedate: new Date(),
              modifieby: currentUserId,
            },
            { transaction: t }
          );
        } else {
          // Trường hợp hiếm: tạo profile nếu chưa có
          await UserProfile.create(
            {
              user_account_id: id,
              full_name,
              phone_number,
              dob,
              gender,
              createby: currentUserId,
              createdate: new Date(),
            },
            { transaction: t }
          );
        }
      });

      // Ghi log
      await systemLogController.record(
        req,
        "UPDATE_ACCOUNT",
        `Đã cập nhật thông tin tài khoản: ${full_name || account.email} (ID: ${id})`,
        "INFO",
        currentUserId
      );

      return res.status(200).json({ message: "Cập nhật tài khoản thành công" });
    } catch (error) {
      console.error("Update account error:", error);
      return res.status(500).json({ message: "Lỗi hệ thống khi cập nhật tài khoản" });
    }
  }

  /**
   * Thay đổi trạng thái tài khoản (Active/Inactive)
   */
  async toggleStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body; // 1 hoặc 0
      const currentUserId = req.user.userId;

      const account = await UserAccount.findByPk(id);
      if (!account) {
        return res.status(404).json({ message: "Không tìm thấy tài khoản" });
      }

      // Không cho phép tự khóa tài khoản của mình
      if (parseInt(id) === currentUserId && status === 0) {
        return res.status(400).json({ message: "Bạn không thể tự khóa tài khoản của chính mình" });
      }

      await account.update({
        status,
        modifiedate: new Date(),
        modifieby: currentUserId,
      });

      // Nếu trạng thái là khóa (status === 0), xóa token và buộc đăng xuất
      if (status === 0) {
        await RefreshToken.destroy({ where: { user_account_id: id } });
        socketManager.forceLogout(id);
      }

      const statusName = status === 1 ? "Kích hoạt" : "Khóa";
      // Ghi log
      await systemLogController.record(
        req,
        "TOGGLE_ACCOUNT_STATUS",
        `${statusName} tài khoản: ${account.email} (ID: ${id})`,
        status === 1 ? "INFO" : "WARN",
        currentUserId
      );

      return res.status(200).json({ message: `${statusName} tài khoản thành công` });
    } catch (error) {
      console.error("Toggle account status error:", error);
      return res.status(500).json({ message: "Lỗi hệ thống khi thay đổi trạng thái tài khoản" });
    }
  }

  /**
   * Lấy danh sách vai trò (để hiển thị trong dropdown filter/form)
   */
  async getRoles(req, res) {
    try {
      const roles = await UserRole.findAll();
      return res.status(200).json(roles);
    } catch (error) {
      console.error("Get roles error:", error);
      return res.status(500).json({ message: "Lỗi hệ thống khi lấy danh sách vai trò" });
    }
  }

  /**
   * Xóa vĩnh viễn một tài khoản
   */
  async deleteAccount(req, res) {
    try {
      const { id } = req.params;
      const currentUserId = req.user.userId;

      const account = await UserAccount.findByPk(id, {
        include: [{ model: UserProfile, as: "profile" }],
      });

      if (!account) {
        return res.status(404).json({ message: "Không tìm thấy tài khoản" });
      }

      const email = account.email;
      const fullName = account.profile?.full_name || email;

      await UserAccount.sequelize.transaction(async (t) => {
        // Xóa token trước
        await RefreshToken.destroy({ where: { user_account_id: id }, transaction: t });
        
        // Xóa profile trước (vì có foreign key)
        if (account.profile) {
          await account.profile.destroy({ transaction: t });
        }
        await account.destroy({ transaction: t });
      });

      // Buộc đăng xuất qua socket
      socketManager.forceLogout(id);

      // Ghi log
      await systemLogController.record(
        req,
        "DELETE_ACCOUNT",
        `Đã xóa vĩnh viễn tài khoản: ${fullName} (${email})`,
        "WARN",
        currentUserId
      );

      return res.status(200).json({ message: "Xóa tài khoản thành công" });
    } catch (error) {
      console.error("Delete account error:", error);
      return res.status(500).json({ message: "Lỗi hệ thống khi xóa tài khoản" });
    }
  }
}

module.exports = new AccountController();
