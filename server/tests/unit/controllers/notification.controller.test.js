const notificationController = require("../../../src/controller/notification.controller");
const { Notification } = require("../../../src/entities");

jest.mock("../../../src/entities", () => ({
  Notification: {
    findAndCountAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  },
}));

describe("NotificationController Unit Tests", () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {
      user: { userId: 1 },
      query: {},
      params: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe("getMyNotifications()", () => {
    it("nên trả về danh sách thông báo thành công", async () => {
      Notification.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: [{ pk_notification_id: 1, title: "Test" }],
      });

      await notificationController.getMyNotifications(mockReq, mockRes);

      expect(Notification.findAndCountAll).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe("markAsRead()", () => {
    it("nên trả lỗi 404 nếu không tìm thấy", async () => {
      mockReq.params = { id: 99 };
      Notification.findOne.mockResolvedValue(null);

      await notificationController.markAsRead(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it("nên đánh dấu đọc thành công", async () => {
      mockReq.params = { id: 1 };
      const mockUpdate = jest.fn();
      Notification.findOne.mockResolvedValue({ pk_notification_id: 1, update: mockUpdate });

      await notificationController.markAsRead(mockReq, mockRes);
      expect(mockUpdate).toHaveBeenCalledWith({ is_read: true });
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe("markAllAsRead()", () => {
    it("nên đánh dấu đọc tất cả thành công", async () => {
      await notificationController.markAllAsRead(mockReq, mockRes);

      expect(Notification.update).toHaveBeenCalledWith(
        { is_read: true },
        expect.any(Object)
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });
});
