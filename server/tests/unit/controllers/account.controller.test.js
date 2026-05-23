const accountController = require("../../../src/controller/account.controller");
const { UserAccount, UserRole, UserProfile } = require("../../../src/entities");
const bcrypt = require("bcrypt");
const systemLogController = require("../../../src/controller/systemLog.controller");
const { Op } = require("sequelize");

jest.mock("bcrypt");
jest.mock("../../../src/controller/systemLog.controller");
jest.mock("../../../src/sockets/socketManager", () => ({
  forceLogout: jest.fn(),
}));
jest.mock("../../../src/entities", () => {
  const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
  return {
    UserAccount: {
      findAndCountAll: jest.fn(),
      findByPk: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      sequelize: {
        transaction: jest.fn(async (cb) => {
          return await cb(mockTransaction);
        }),
      },
    },
    UserRole: {
      findAll: jest.fn(),
    },
    UserProfile: {
      create: jest.fn(),
    },
    RefreshToken: {
      destroy: jest.fn(),
    },
  };
});

describe("AccountController Unit Tests", () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      query: {},
      params: {},
      body: {},
      user: { userId: 1 }, // ID của người dùng đang gọi request
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe("getAllAccounts()", () => {
    it("nên trả về danh sách tài khoản thành công", async () => {
      mockReq.query = { page: 1, limit: 15, search: "admin" };
      UserAccount.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: [{ user_account_id: 1, email: "admin@test.com" }]
      });

      await accountController.getAllAccounts(mockReq, mockRes);

      expect(UserAccount.findAndCountAll).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        data: [{ user_account_id: 1, email: "admin@test.com" }],
        pagination: {
          totalItems: 1,
          totalPages: 1,
          currentPage: 1,
          limit: 15
        }
      });
    });

    it("nên bắt lỗi 500 nếu DB thất bại", async () => {
      UserAccount.findAndCountAll.mockRejectedValue(new Error("DB Error"));
      await accountController.getAllAccounts(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe("getAccountById()", () => {
    it("nên trả về lỗi 404 nếu không tìm thấy", async () => {
      mockReq.params = { id: 99 };
      UserAccount.findByPk.mockResolvedValue(null);

      await accountController.getAccountById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Không tìm thấy tài khoản" });
    });

    it("nên trả về dữ liệu tài khoản thành công (không có password)", async () => {
      mockReq.params = { id: 1 };
      const mockAccount = {
        user_account_id: 1,
        email: "test@test.com",
        password_hash: "secret",
        toJSON: function() { return { ...this }; } // Giả lập hàm toJSON của Sequelize
      };
      UserAccount.findByPk.mockResolvedValue(mockAccount);

      await accountController.getAccountById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      // Kiểm tra password_hash đã bị xóa
      const responseData = mockRes.json.mock.calls[0][0];
      expect(responseData.password_hash).toBeUndefined();
      expect(responseData.email).toBe("test@test.com");
    });
  });

  describe("createAccount()", () => {
    it("nên trả lỗi 400 nếu email đã tồn tại", async () => {
      mockReq.body = { email: "exist@test.com" };
      UserAccount.findOne.mockResolvedValue({ id: 1 }); // Email đã tồn tại

      await accountController.createAccount(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Email này đã được sử dụng" });
    });

    it("nên tạo tài khoản thành công", async () => {
      mockReq.body = {
        email: "new@test.com",
        password: "password123",
        role_id: 2,
        full_name: "New User"
      };
      UserAccount.findOne.mockResolvedValue(null); // Email chưa tồn tại
      bcrypt.hash.mockResolvedValue("hashed_pwd");

      const createdAccount = { user_account_id: 10, email: "new@test.com" };
      const createdProfile = { id: 5 };
      UserAccount.create.mockResolvedValue(createdAccount);
      UserProfile.create.mockResolvedValue(createdProfile);

      await accountController.createAccount(mockReq, mockRes);

      expect(UserAccount.create).toHaveBeenCalled();
      expect(UserProfile.create).toHaveBeenCalled();
      expect(systemLogController.record).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        message: "Tạo tài khoản thành công"
      }));
    });
  });

  describe("updateAccount()", () => {
    it("nên trả về lỗi 404 nếu không tìm thấy account", async () => {
      mockReq.params = { id: 99 };
      UserAccount.findByPk.mockResolvedValue(null);

      await accountController.updateAccount(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it("nên cập nhật thành công (có kèm profile)", async () => {
      mockReq.params = { id: 1 };
      mockReq.body = { full_name: "Updated Name", password: "newpass" };
      
      const mockProfileUpdate = jest.fn();
      const mockAccountUpdate = jest.fn();

      UserAccount.findByPk.mockResolvedValue({
        user_account_id: 1,
        role_id: 2,
        update: mockAccountUpdate,
        profile: {
          update: mockProfileUpdate
        }
      });

      bcrypt.hash.mockResolvedValue("new_hashed");

      await accountController.updateAccount(mockReq, mockRes);

      expect(bcrypt.hash).toHaveBeenCalledWith("newpass", 10);
      expect(mockAccountUpdate).toHaveBeenCalledWith(expect.objectContaining({ password_hash: "new_hashed" }), expect.any(Object));
      expect(mockProfileUpdate).toHaveBeenCalledWith(expect.objectContaining({ full_name: "Updated Name" }), expect.any(Object));
      expect(systemLogController.record).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe("toggleStatus()", () => {
    it("nên trả lỗi 400 nếu tự khóa chính mình", async () => {
      mockReq.params = { id: 1 }; // current user id là 1
      mockReq.body = { status: 0 };
      UserAccount.findByPk.mockResolvedValue({ user_account_id: 1 });

      await accountController.toggleStatus(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Bạn không thể tự khóa tài khoản của chính mình" });
    });

    it("nên khóa tài khoản người khác thành công", async () => {
      mockReq.params = { id: 2 }; // user khác
      mockReq.body = { status: 0 };
      
      const mockUpdate = jest.fn();
      UserAccount.findByPk.mockResolvedValue({ user_account_id: 2, email: "other@test.com", update: mockUpdate });

      await accountController.toggleStatus(mockReq, mockRes);

      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ status: 0 }));
      expect(systemLogController.record).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe("deleteAccount()", () => {
    it("nên xóa tài khoản thành công", async () => {
      mockReq.params = { id: 5 };
      
      const mockAccountDestroy = jest.fn();
      const mockProfileDestroy = jest.fn();

      UserAccount.findByPk.mockResolvedValue({
        user_account_id: 5,
        email: "delete@test.com",
        destroy: mockAccountDestroy,
        profile: {
          destroy: mockProfileDestroy
        }
      });

      await accountController.deleteAccount(mockReq, mockRes);

      expect(mockProfileDestroy).toHaveBeenCalled();
      expect(mockAccountDestroy).toHaveBeenCalled();
      expect(systemLogController.record).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe("getRoles()", () => {
    it("nên lấy danh sách vai trò thành công", async () => {
      UserRole.findAll.mockResolvedValue([{ id: 1, role_code: "ADMIN" }]);
      await accountController.getRoles(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith([{ id: 1, role_code: "ADMIN" }]);
    });
  });
});
