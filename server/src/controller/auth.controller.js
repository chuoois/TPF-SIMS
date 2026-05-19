const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { UserAccount, UserRole, UserProfile, RefreshToken } = require("../entities");
const { generateAccessToken, generateRefreshToken } = require("../utils/jwt");
const { sendNewPasswordEmail } = require("../utils/email");
const systemLogController = require("./systemLog.controller");

/**
 * Auth Controller
 * Created By: ThinhBui
 * Created Date: 14/03/2026
 */
class AuthController {
  /**
   * Đăng nhập
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;


      // Tìm user kèm role và profile
      const user = await UserAccount.findOne({
        where: { email },
        include: [
          { model: UserRole, as: "role" },
          { model: UserProfile, as: "profile" },
        ],
      });

      if (!user) {
        return res.status(401).json({ message: "Email không tồn tại" });
      }

      if (user.status === 0) {
        return res.status(403).json({ message: "Tài khoản đã bị khóa" });
      }

      // Kiểm tra mật khẩu
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ message: "Mật khẩu không chính xác" });
      }

      // Payload cho token
      const payload = {
        userId: user.user_account_id,
        email: user.email,
        roleCode: user.role?.role_code,
      };

      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      // Lưu refresh token vào DB
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days matching jwt expiration

      await RefreshToken.create({
        user_account_id: user.user_account_id,
        token: refreshToken,
        expires_at: expiresAt,
        createby: user.user_account_id,
      });

      // Set cookie
      const isProduction = process.env.NODE_ENV === "production";

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "None" : "Strict",
        maxAge: 15 * 60 * 1000, // 15 mins
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "None" : "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Ghi log đăng nhập
      await systemLogController.record(req, "Đăng nhập", `Người dùng ${user.email} đăng nhập thành công`, "INFO", user.user_account_id);

      return res.status(200).json({
        message: "Đăng nhập thành công",
        user: {
          user_account_id: user.user_account_id,
          email: user.email,
          role: user.role?.role_code,
          fullName: user.profile?.full_name || "Người dùng",
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Lỗi hệ thống" });
    }
  }

  /**
   * Làm mới token
   */
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.cookies;

      if (!refreshToken) {
        return res.status(401).json({ message: "Không tìm thấy refresh token" });
      }

      // Kiểm tra token trong DB
      const storedToken = await RefreshToken.findOne({
        where: { token: refreshToken },
        include: [{
          model: UserAccount,
          as: "account",
          include: [
            { model: UserRole, as: "role" },
            { model: UserProfile, as: "profile" }
          ]
        }],
      });

      if (!storedToken) {
        return res.status(403).json({ message: "Refresh token không hợp lệ hoặc đã bị thu hồi" });
      }

      // Kiểm tra hết hạn (DB level)
      if (new Date() > storedToken.expires_at) {
        await RefreshToken.destroy({ where: { token: refreshToken } });
        return res.status(403).json({ message: "Refresh token đã hết hạn" });
      }

      const user = storedToken.account;
      const payload = {
        userId: user.user_account_id,
        email: user.email,
        roleCode: user.role?.role_code,
      };

      const newAccessToken = generateAccessToken(payload);
      const newRefreshToken = generateRefreshToken(payload);

      // Rotate token: Xóa cũ, tạo mới
      await RefreshToken.destroy({ where: { token: refreshToken } });

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      await RefreshToken.create({
        user_account_id: user.user_account_id,
        token: newRefreshToken,
        expires_at: expiresAt,
        createby: user.user_account_id,
      });

      // Cập nhật cookies
      const isProduction = process.env.NODE_ENV === "production";

      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "None" : "Strict",
        maxAge: 15 * 60 * 1000,
      });

      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "None" : "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({ message: "Làm mới token thành công" });
    } catch (error) {
      console.error("Refresh token error:", error);
      return res.status(500).json({ message: "Lỗi hệ thống" });
    }
  }

  /**
   * Đăng xuất
   */
  async logout(req, res) {
    try {
      const { refreshToken } = req.cookies;

      if (refreshToken) {
        await RefreshToken.destroy({ where: { token: refreshToken } });
      }

      const isProduction = process.env.NODE_ENV === "production";
      res.clearCookie("accessToken", {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "None" : "Strict",
      });
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "None" : "Strict",
      });

      // Ghi log đăng xuất
      if (req.user) {
        await systemLogController.record(req, "Đăng xuất", `Người dùng ${req.user.email} đã đăng xuất`, "INFO");
      }

      return res.status(200).json({ message: "Đăng xuất thành công" });
    } catch (error) {
      console.error("Logout error:", error);
      return res.status(500).json({ message: "Lỗi hệ thống" });
    }
  }

  /**
   * Quên mật khẩu - Gửi mật khẩu mới qua email
   */
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;


      const user = await UserAccount.findOne({ where: { email } });

      if (!user) {
        return res.status(404).json({ message: "Email không tồn tại trong hệ thống" });
      }

      // Tạo mật khẩu ngẫu nhiên 8 ký tự
      const newPassword = crypto.randomBytes(4).toString("hex");
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Cập nhật vào DB
      await user.update({
        password_hash: hashedPassword,
        modifiedate: new Date(),
        modifieby: user.user_account_id,
      });

      // Gửi email
      await sendNewPasswordEmail(email, newPassword);

      // Ghi log quên mật khẩu
      await systemLogController.record(req, "Quên mật khẩu", `Yêu cầu cấp lại mật khẩu cho email: ${email}`, "WARN", user.user_account_id);

      return res.status(200).json({ message: "Mật khẩu mới đã được gửi vào email của bạn" });
    } catch (error) {
      console.error("Forgot password error:", error);
      return res.status(500).json({ message: "Lỗi hệ thống khi gửi email" });
    }
  }
  /**
   * Lấy thông tin người dùng hiện tại
   */
  async getProfile(req, res) {
    try {
      const user = await UserAccount.findByPk(req.user.userId, {
        include: [
          { model: UserRole, as: "role" },
          { model: UserProfile, as: "profile" }
        ],
      });

      if (!user) {
        return res.status(404).json({ message: "Người dùng không tồn tại" });
      }

      return res.status(200).json({
        user: {
          user_account_id: user.user_account_id,
          email: user.email,
          role: user.role?.role_code,
          fullName: user.profile?.full_name || "",
          phoneNumber: user.profile?.phone_number || "",
          dob: user.profile?.dob || "",
          gender: user.profile?.gender !== undefined ? user.profile?.gender : null,
        },
      });
    } catch (error) {
      console.error("Get profile error:", error);
      return res.status(500).json({ message: "Lỗi hệ thống" });
    }
  }

  /**
   * Cập nhật hồ sơ thông tin cá nhân
   */
  async updateProfile(req, res) {
    try {
      const { fullName, phoneNumber, dob, gender } = req.body;
      const userId = req.user.userId;

      // Tìm tài khoản
      const user = await UserAccount.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: "Người dùng không tồn tại" });
      }

      let profile = await UserProfile.findOne({ where: { user_account_id: userId } });
      if (!profile) {
        profile = await UserProfile.create({
          user_account_id: userId,
          full_name: fullName,
          phone_number: phoneNumber,
          dob: dob || null,
          gender: gender !== undefined ? gender : null,
          createdate: new Date(),
          createby: userId
        });
      } else {
        await profile.update({
          full_name: fullName,
          phone_number: phoneNumber,
          dob: dob || null,
          gender: gender !== undefined ? gender : null,
          modifiedate: new Date(),
          modifieby: userId
        });
      }

      // Ghi log cập nhật thông tin cá nhân
      await systemLogController.record(req, "Cập nhật hồ sơ", `Người dùng ${user.email} cập nhật thông tin cá nhân thành công`, "INFO", userId);

      return res.status(200).json({
        message: "Cập nhật thông tin cá nhân thành công",
        user: {
          user_account_id: user.user_account_id,
          email: user.email,
          role: req.user.roleCode,
          fullName: profile.full_name,
          phoneNumber: profile.phone_number,
          dob: profile.dob,
          gender: profile.gender,
        }
      });
    } catch (error) {
      console.error("Update profile error:", error);
      return res.status(500).json({ message: "Lỗi hệ thống khi cập nhật hồ sơ" });
    }
  }

  /**
   * Thay đổi mật khẩu người dùng
   */
  async changePassword(req, res) {
    try {
      const { oldPassword, newPassword } = req.body;
      const userId = req.user.userId;

      const user = await UserAccount.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: "Người dùng không tồn tại" });
      }

      const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
      if (!isMatch) {
        return res.status(400).json({ message: "Mật khẩu cũ không chính xác" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await user.update({
        password_hash: hashedPassword,
        modifiedate: new Date(),
        modifieby: userId
      });

      // Ghi log đổi mật khẩu
      await systemLogController.record(req, "Đổi mật khẩu", `Người dùng ${user.email} đổi mật khẩu thành công`, "INFO", userId);

      return res.status(200).json({ message: "Đổi mật khẩu thành công" });
    } catch (error) {
      console.error("Change password error:", error);
      return res.status(500).json({ message: "Lỗi hệ thống khi đổi mật khẩu" });
    }
  }
}

module.exports = new AuthController();
