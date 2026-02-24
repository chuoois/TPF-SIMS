const bcrypt = require("bcrypt");
const { randomUUID } = require("crypto");
const jwt = require("jsonwebtoken");
const { generateAccessToken, generateRefreshToken } = require("../utils/jwt");
const {
  UserRepo,
  RefreshTokenRepo,
  SystemLogRepo,
} = require("../controller/base.controller");

/**
 * Dùng chung cấu hình cookie
 */
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
};

/**
 * Login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }

    const user = await UserRepo.findOne({
      where: { email },
      relations: ["role", "profile"],
    });

    if (!user) {
      return res.status(404).json({ message: "Tài khoản không tồn tại" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Sai tài khoản hoặc mật khẩu" });
    }

    const payload = {
      id: user.pk_user_account_id,
      email: user.email,
      roleCode: user.role?.role_code,
      fullName: user.profile?.full_name || user.email,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Set accessToken cookie (15 phút)
    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    // Set refreshToken cookie (7 ngày)
    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Lưu refreshToken vào DB
    await RefreshTokenRepo.save({
      pk_refresh_token_id: randomUUID(),
      token_hash: refreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      userAccount: user,
    });

    await SystemLogRepo.save({
      pk_system_log_id: randomUUID(),
      description: "Đăng nhập",
      userAccount: user,
    });

    return res.status(200).json({
      message: "Đăng nhập thành công",
      role: user.role?.role_code,
      user: user.email
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * Logout
 */
const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      await RefreshTokenRepo.delete({ token_hash: refreshToken });
    }

    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);

    return res.status(200).json({ message: "Đăng xuất thành công" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * Refresh Access Token
 */
const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "Không tìm thấy refresh token" });
    }

    const tokenRecord = await RefreshTokenRepo.findOne({
      where: { token_hash: refreshToken },
      relations: ["userAccount", "userAccount.role", "userAccount.profile"],
    });

    if (!tokenRecord) {
      return res.status(403).json({ message: "Refresh token không hợp lệ" });
    }

    if (new Date() > new Date(tokenRecord.expires_at)) {
      await RefreshTokenRepo.delete({ token_hash: refreshToken });
      return res.status(403).json({ message: "Refresh token đã hết hạn" });
    }

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const payload = {
      id: tokenRecord.userAccount.pk_user_account_id,
      email: tokenRecord.userAccount.email,
      roleCode: tokenRecord.userAccount.role?.role_code,
      fullName: tokenRecord.userAccount.profile?.full_name || tokenRecord.userAccount.email,
    };

    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    // Rotate refresh token
    await RefreshTokenRepo.delete({ token_hash: refreshToken });

    await RefreshTokenRepo.save({
      pk_refresh_token_id: randomUUID(),
      token_hash: newRefreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      userAccount: tokenRecord.userAccount,
    });

    // getUserRepositorySet accessToken mới
    res.cookie("accessToken", newAccessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    // Set refreshToken mới
    res.cookie("refreshToken", newRefreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ message: "Refreshed" });
  } catch (error) {
    console.error("Refresh token error:", error);
    return res.status(403).json({ message: "Refresh token không hợp lệ" });
  }
};

/**
 * Forgot Password — gửi mật khẩu mới qua email
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập email" });
    }

    const user = await UserRepo.findOne({ where: { email } });

    if (!user) {
      // Không tiết lộ email có tồn tại hay không
      return res
        .status(200)
        .json({ message: "Nếu email tồn tại, mật khẩu mới đã được gửi" });
    }

    // Tạo mật khẩu ngẫu nhiên 10 ký tự
    const newPassword = randomUUID().replace(/-/g, "").slice(0, 10);

    // Hash mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Cập nhật mật khẩu trong DB
    user.password_hash = hashedPassword;
    await UserRepo.save(user);

    // Xóa tất cả refresh token (buộc đăng nhập lại)
    await RefreshTokenRepo.delete({ userAccount: { pk_user_account_id: user.pk_user_account_id } });

    // Gửi email mật khẩu mới
    const { sendNewPasswordEmail } = require("../utils/email");
    await sendNewPasswordEmail(email, newPassword);

    // Ghi log
    await SystemLogRepo.save({
      pk_system_log_id: randomUUID(),
      description: "Đặt lại mật khẩu (forgot password)",
      userAccount: user,
    });

    return res
      .status(200)
      .json({ message: "Mật khẩu mới đã được gửi đến email của bạn" });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

module.exports = { login, logout, refreshAccessToken, forgotPassword };