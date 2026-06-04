const customRequestController = require("../../../src/controller/customRequest.controller");
const { Op } = require("sequelize");
const { CustomRequest, CustomRequestItem, CustomerProfile, UserAccount, Order } = require("../../../src/entities");
const systemLogController = require("../../../src/controller/systemLog.controller");
const socketManager = require("../../../src/sockets/socketManager");

jest.mock("../../../src/controller/systemLog.controller");
jest.mock("../../../src/sockets/socketManager", () => ({
  sendNotification: jest.fn(),
}));

jest.mock("../../../src/entities", () => {
  const mockTransaction = { commit: jest.fn(), rollback: jest.fn(), finished: false };
  return {
    sequelize: {
      transaction: jest.fn(async () => mockTransaction),
      fn: jest.fn(),
      col: jest.fn(),
    },
    CustomRequest: {
      create: jest.fn(),
      findAndCountAll: jest.fn(),
      findAll: jest.fn(),
      findByPk: jest.fn(),
    },
    CustomRequestItem: {
      bulkCreate: jest.fn(),
      update: jest.fn(),
    },
    CustomerProfile: {},
    UserAccount: {
      findAll: jest.fn(),
    },
    UserRole: {},
    Supplier: {},
    Order: { create: jest.fn() },
    OrderItem: { create: jest.fn() },
    OrderItemProcessing: { create: jest.fn() },
    OrderHistory: { create: jest.fn() },
    ManufacturingOrderItem: {},
  };
});

describe("CustomRequestController Unit Tests", () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {
      query: {},
      params: {},
      body: {},
      user: { userId: 1, roleCode: "OWNER", email: "owner@test.com" },
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe("createRequest()", () => {
    it("nên tạo phiếu yêu cầu thành công", async () => {
      mockReq.body = { fk_customer_id: 1, total_amount: 5000, items: [{}] };

      CustomRequest.create.mockResolvedValue({ pk_custom_request_id: 1, request_code: "YC-1" });
      UserAccount.findAll.mockResolvedValue([{ user_account_id: 2 }]);

      await customRequestController.createRequest(mockReq, mockRes);

      expect(CustomRequest.create).toHaveBeenCalled();
      expect(CustomRequestItem.bulkCreate).toHaveBeenCalled();
      expect(systemLogController.record).toHaveBeenCalled();
      expect(socketManager.sendNotification).toHaveBeenCalledTimes(2);
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });
  });

  describe("getAllRequests()", () => {
    it("nên lấy danh sách yêu cầu thành công", async () => {
      mockReq.query = { page: 1, limit: 10 };

      CustomRequest.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: [{ get: () => ({ pk_custom_request_id: 1 }) }] // Plain object
      });
      CustomRequest.findAll.mockResolvedValue([
        { status: 1, count: 1 }
      ]);

      await customRequestController.getAllRequests(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it("nên xử lý điều kiện search chính xác", async () => {
      mockReq.query = { search: "Giường", page: 1, limit: 10 };

      CustomRequest.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: []
      });
      CustomRequest.findAll.mockResolvedValue([]);

      await customRequestController.getAllRequests(mockReq, mockRes);

      const findArgs = CustomRequest.findAndCountAll.mock.calls[0][0];
      const orConditions = findArgs.where[Op.or];

      expect(orConditions).toBeDefined();
      expect(orConditions).toEqual(
        expect.arrayContaining([
          { request_code: { [Op.like]: "%Giường%" } },
          { "$customer.full_name$": { [Op.like]: "%Giường%" } },
          { "$customer.phone_number$": { [Op.like]: "%Giường%" } },
          { "$items.item_name$": { [Op.like]: "%Giường%" } }
        ])
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe("getRequestById()", () => {
    it("nên trả về chi tiết yêu cầu", async () => {
      mockReq.params = { id: 1 };

      CustomRequest.findByPk.mockResolvedValue({
        get: () => ({ pk_custom_request_id: 1, items: [{ item_cost_price: 100 }] })
      });

      await customRequestController.getRequestById(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(200);

      const resData = mockRes.json.mock.calls[0][0];
      // Since user is OWNER, cost_price should be kept
      expect(resData.data.items[0].item_cost_price).toBe(100);
    });
  });

  describe("updateStatus()", () => {
    it("nên cập nhật trạng thái thành công", async () => {
      mockReq.params = { id: 1 };
      mockReq.body = { status: 2 };

      const mockUpdate = jest.fn();
      CustomRequest.findByPk.mockResolvedValue({ pk_custom_request_id: 1, createby: 2, update: mockUpdate });
      UserAccount.findAll.mockResolvedValue([]);

      await customRequestController.updateStatus(mockReq, mockRes);

      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ status: 2 }), expect.any(Object));
      expect(socketManager.sendNotification).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it("nên tạo đơn hàng tự động khi chuyển sang trạng thái 3", async () => {
      mockReq.params = { id: 1 };
      mockReq.body = { status: 3 };

      const mockUpdate = jest.fn();
      CustomRequest.findByPk.mockResolvedValue({
        pk_custom_request_id: 1,
        createby: 2,
        status: 2,
        update: mockUpdate,
        items: [{ fk_product_id: 1, item_name: "Tủ áo" }]
      });
      UserAccount.findAll.mockResolvedValue([]);
      Order.create.mockResolvedValue({ pk_order_id: 100 });

      await customRequestController.updateStatus(mockReq, mockRes);

      expect(Order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          order_code: expect.stringMatching(/^DH-\d+$/),
          order_type: 3,
        }),
        expect.any(Object)
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe("updateRequest()", () => {
    it("nên cho phép owner cập nhật chi tiết yêu cầu", async () => {
      mockReq.params = { id: 1 };
      mockReq.body = { deposit_amount: 100, items: [{ id: 1, item_cost_price: 50 }] };

      const mockUpdate = jest.fn();
      CustomRequest.findByPk.mockResolvedValue({ status: 1, update: mockUpdate }); // status 1: Chờ tiếp nhận

      await customRequestController.updateRequest(mockReq, mockRes);

      expect(mockUpdate).toHaveBeenCalled();
      expect(CustomRequestItem.update).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });
});
