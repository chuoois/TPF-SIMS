const systemLogController = require("../../../src/controller/systemLog.controller");
const { SystemLog } = require("../../../src/entities");

jest.mock("../../../src/entities", () => ({
  SystemLog: {
    findAndCountAll: jest.fn(),
    create: jest.fn(),
  },
  UserAccount: {},
  UserProfile: {},
  UserRole: {},
}));

describe("SystemLogController Unit Tests", () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {
      query: {},
      ip: "127.0.0.1",
      headers: { "user-agent": "test-agent" },
      user: { userId: 1 },
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe("getAllLogs()", () => {
    it("nên trả lỗi 500 khi DB lỗi", async () => {
      SystemLog.findAndCountAll.mockRejectedValue(new Error("DB Error"));

      await systemLogController.getAllLogs(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(500);
    });

    it("nên lấy danh sách log thành công (kèm filter search, level, date)", async () => {
      mockReq.query = { 
        search: "LOGIN", 
        level: "INFO", 
        fromDate: "2026-05-01", 
        toDate: "2026-05-10", 
        page: 1, 
        limit: 15 
      };

      SystemLog.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: [{ action: "LOGIN", level: "INFO" }]
      });

      await systemLogController.getAllLogs(mockReq, mockRes);

      expect(SystemLog.findAndCountAll).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      const resData = mockRes.json.mock.calls[0][0];
      expect(resData.data.length).toBe(1);
    });
  });

  describe("record()", () => {
    it("nên ghi log thành công", async () => {
      SystemLog.create.mockResolvedValue(true);

      await systemLogController.record(mockReq, "TEST_ACTION", "Test detail", "INFO");

      expect(SystemLog.create).toHaveBeenCalledWith(expect.objectContaining({
        user_account_id: 1,
        action: "TEST_ACTION",
        level: "INFO",
        ip_address: "127.0.0.1",
        user_agent: "test-agent",
      }));
    });

    it("không văng lỗi (crash) hệ thống nếu ghi log thất bại", async () => {
      SystemLog.create.mockRejectedValue(new Error("DB Error"));
      console.error = jest.fn(); // Mock console.error để suppress output

      await systemLogController.record(mockReq, "TEST_ACTION");

      expect(SystemLog.create).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
    });
  });
});
