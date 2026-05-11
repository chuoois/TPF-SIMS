const authController = require("../../../src/controller/auth.controller");
const { UserAccount, UserRole, UserProfile, RefreshToken } = require("../../../src/entities");
const bcrypt = require("bcrypt");
const jwtUtils = require("../../../src/utils/jwt");
const systemLogController = require("../../../src/controller/systemLog.controller");
const emailUtils = require("../../../src/utils/email");
const crypto = require("crypto");

// Mock toàn bộ thư viện và module phụ thuộc
jest.mock("bcrypt");
jest.mock("crypto");
jest.mock("nodemailer");
jest.mock("../../../src/utils/jwt");
jest.mock("../../../src/utils/email");
jest.mock("../../../src/controller/systemLog.controller");
jest.mock("../../../src/entities", () => ({
  UserAccount: {
    findOne: jest.fn(),
    findByPk: jest.fn(),
  },
  UserRole: {},
  UserProfile: {},
  RefreshToken: {
    create: jest.fn(),
    findOne: jest.fn(),
    destroy: jest.fn(),
  },
}));

describe("AuthController Unit Tests", () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    // Reset lại tất cả các mock trước mỗi test
    jest.clearAllMocks();

    // Mock Express Request object
    mockReq = {
      body: {},
      cookies: {},
      user: {}
    };

    // Mock Express Response object
    mockRes = {
      status: jest.fn().mockReturnThis(), // Cho phép chaining: res.status(200).json()
      json: jest.fn(),
      cookie: jest.fn(),
      clearCookie: jest.fn()
    };
  });

  describe("login()", () => {
    it("nên trả về lỗi 401 nếu email không tồn tại", async () => {
      // Setup
      mockReq.body = { email: "wrong@test.com", password: "password123" };
      UserAccount.findOne.mockResolvedValue(null); // Giả lập DB không tìm thấy user

      // Action
      await authController.login(mockReq, mockRes);

      // Assert
      expect(UserAccount.findOne).toHaveBeenCalledWith(expect.objectContaining({
        where: { email: "wrong@test.com" }
      }));
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Email không tồn tại" });
    });

    it("nên trả về lỗi 403 nếu tài khoản bị khóa", async () => {
      mockReq.body = { email: "locked@test.com", password: "password123" };
      UserAccount.findOne.mockResolvedValue({ status: 0 }); // status: 0 là bị khóa

      await authController.login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Tài khoản đã bị khóa" });
    });

    it("nên trả về lỗi 401 nếu sai mật khẩu", async () => {
      mockReq.body = { email: "user@test.com", password: "wrongpassword" };
      UserAccount.findOne.mockResolvedValue({ 
        status: 1, 
        password_hash: "hashed_password" 
      });
      bcrypt.compare.mockResolvedValue(false); // Giả lập mật khẩu không khớp

      await authController.login(mockReq, mockRes);

      expect(bcrypt.compare).toHaveBeenCalledWith("wrongpassword", "hashed_password");
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Mật khẩu không chính xác" });
    });

    it("nên đăng nhập thành công và trả về token", async () => {
      mockReq.body = { email: "user@test.com", password: "correctpassword" };
      
      const mockUser = {
        user_account_id: 1,
        email: "user@test.com",
        status: 1,
        password_hash: "hashed_password",
        role: { role_code: "ADMIN" },
        profile: { full_name: "Test User" }
      };

      UserAccount.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwtUtils.generateAccessToken.mockReturnValue("mock_access_token");
      jwtUtils.generateRefreshToken.mockReturnValue("mock_refresh_token");

      await authController.login(mockReq, mockRes);

      // Verify token generation
      expect(jwtUtils.generateAccessToken).toHaveBeenCalled();
      expect(jwtUtils.generateRefreshToken).toHaveBeenCalled();

      // Verify cookies set
      expect(mockRes.cookie).toHaveBeenCalledWith("accessToken", "mock_access_token", expect.any(Object));
      expect(mockRes.cookie).toHaveBeenCalledWith("refreshToken", "mock_refresh_token", expect.any(Object));

      // Verify system log
      expect(systemLogController.record).toHaveBeenCalled();

      // Verify response
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Đăng nhập thành công",
        user: {
          user_account_id: 1,
          email: "user@test.com",
          role: "ADMIN",
          fullName: "Test User"
        }
      });
    });
  });

  describe("logout()", () => {
    it("nên đăng xuất thành công và clear cookies", async () => {
      mockReq.cookies = { refreshToken: "some_refresh_token" };
      mockReq.user = { email: "user@test.com" }; // User information from auth middleware

      await authController.logout(mockReq, mockRes);

      expect(RefreshToken.destroy).toHaveBeenCalledWith({
        where: { token: "some_refresh_token" }
      });

      expect(mockRes.clearCookie).toHaveBeenCalledWith("accessToken", expect.any(Object));
      expect(mockRes.clearCookie).toHaveBeenCalledWith("refreshToken", expect.any(Object));

      expect(systemLogController.record).toHaveBeenCalled();

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Đăng xuất thành công" });
    });
  });

  describe("refreshToken()", () => {
    it("nên trả về lỗi 401 nếu không có refreshToken trong cookie", async () => {
      mockReq.cookies = {};
      await authController.refreshToken(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Không tìm thấy refresh token" });
    });

    it("nên trả về lỗi 403 nếu token không tồn tại trong DB", async () => {
      mockReq.cookies = { refreshToken: "invalid_token" };
      RefreshToken.findOne.mockResolvedValue(null);

      await authController.refreshToken(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Refresh token không hợp lệ hoặc đã bị thu hồi" });
    });

    it("nên trả về lỗi 403 và xóa token nếu token đã hết hạn", async () => {
      mockReq.cookies = { refreshToken: "expired_token" };
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1); // Quá khứ
      RefreshToken.findOne.mockResolvedValue({ expires_at: pastDate });

      await authController.refreshToken(mockReq, mockRes);

      expect(RefreshToken.destroy).toHaveBeenCalledWith({ where: { token: "expired_token" } });
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Refresh token đã hết hạn" });
    });

    it("nên làm mới token thành công", async () => {
      mockReq.cookies = { refreshToken: "valid_token" };
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1); // Tương lai

      const mockUser = {
        user_account_id: 1,
        email: "user@test.com",
        role: { role_code: "ADMIN" }
      };

      RefreshToken.findOne.mockResolvedValue({
        expires_at: futureDate,
        account: mockUser
      });

      jwtUtils.generateAccessToken.mockReturnValue("new_access");
      jwtUtils.generateRefreshToken.mockReturnValue("new_refresh");

      await authController.refreshToken(mockReq, mockRes);

      expect(RefreshToken.destroy).toHaveBeenCalledWith({ where: { token: "valid_token" } });
      expect(RefreshToken.create).toHaveBeenCalled();
      expect(mockRes.cookie).toHaveBeenCalledTimes(2); // set 2 cookies
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Làm mới token thành công" });
    });
  });

  describe("forgotPassword()", () => {
    it("nên trả về lỗi 404 nếu email không tồn tại", async () => {
      mockReq.body = { email: "notfound@test.com" };
      UserAccount.findOne.mockResolvedValue(null);

      await authController.forgotPassword(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Email không tồn tại trong hệ thống" });
    });

    it("nên tạo mật khẩu mới và gửi email thành công", async () => {
      mockReq.body = { email: "user@test.com" };
      
      const mockUserUpdate = jest.fn();
      UserAccount.findOne.mockResolvedValue({
        user_account_id: 1,
        update: mockUserUpdate
      });

      crypto.randomBytes.mockReturnValue({ toString: () => "mock_random" });
      bcrypt.hash.mockResolvedValue("hashed_new_password");

      await authController.forgotPassword(mockReq, mockRes);

      expect(mockUserUpdate).toHaveBeenCalledWith(expect.objectContaining({
        password_hash: "hashed_new_password"
      }));
      expect(emailUtils.sendNewPasswordEmail).toHaveBeenCalledWith("user@test.com", "mock_random");
      expect(systemLogController.record).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Mật khẩu mới đã được gửi vào email của bạn" });
    });
  });

  describe("getProfile()", () => {
    it("nên trả về lỗi 404 nếu user không tồn tại", async () => {
      mockReq.user = { userId: 99 };
      UserAccount.findByPk.mockResolvedValue(null);

      await authController.getProfile(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Người dùng không tồn tại" });
    });

    it("nên trả về profile thành công", async () => {
      mockReq.user = { userId: 1 };
      const mockUser = {
        user_account_id: 1,
        email: "user@test.com",
        role: { role_code: "ADMIN" },
        profile: { full_name: "Test User" }
      };

      UserAccount.findByPk.mockResolvedValue(mockUser);

      await authController.getProfile(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        user: {
          user_account_id: 1,
          email: "user@test.com",
          role: "ADMIN",
          fullName: "Test User"
        }
      });
    });
  });
});
