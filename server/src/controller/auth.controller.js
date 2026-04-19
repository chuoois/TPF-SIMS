const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { UserAccount, UserRole, UserProfile, RefreshToken } = require("../entities");
const { generateAccessToken, generateRefreshToken } = require("../utils/jwt");
const { sendNewPasswordEmail } = require("../utils/email");

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

      if (!email || !password) {
        return res.status(400).json({ message: "Vui lòng nhập email và mật khẩu" });
      }

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
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000, // 15 mins
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return res.status(200).json({
        message: "Đăng nhập thành công",
        user: {
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
      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000,
      });

      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
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

      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");

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

      if (!email) {
        return res.status(400).json({ message: "Vui lòng nhập email" });
      }

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
          email: user.email,
          role: user.role?.role_code,
          fullName: user.profile?.full_name || "Người dùng",
        },
      });
    } catch (error) {
      console.error("Get profile error:", error);
      return res.status(500).json({ message: "Lỗi hệ thống" });
    }
  }
}

module.exports = new AuthController();
