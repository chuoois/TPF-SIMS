const orderController = require("../../../src/controller/order.controller");
const { Order, OrderItem, OrderHistory, Product, ProductItem, CustomerProfile, UserAccount } = require("../../../src/entities");
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
      literal: jest.fn(),
    },
    Order: {
      findAndCountAll: jest.fn(),
      count: jest.fn(),
      findByPk: jest.fn(),
      create: jest.fn(),
    },
    OrderItem: {
      create: jest.fn(),
      findAll: jest.fn(),
    },
    OrderHistory: {
      create: jest.fn(),
    },
    Product: {
      findAll: jest.fn(),
    },
    ProductPricing: {},
    ProductItem: {
      findAll: jest.fn(),
      update: jest.fn(),
    },
    CustomerProfile: {
      findOne: jest.fn(),
    },
    UserAccount: {
      findAll: jest.fn(),
    },
    UserProfile: {},
    UserRole: {},
    ProductMaterial: {},
    ProductColor: {},
    ProductTask: {},
  };
});

describe("OrderController Unit Tests", () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {
      query: {},
      params: {},
      body: {},
      user: { userId: 1, email: "sale@test.com" },
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe("getAllOrders()", () => {
    it("nên lấy danh sách đơn hàng thành công", async () => {
      mockReq.query = { page: 1, limit: 10, search: "Nguyen" };
      
      Order.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: [{ pk_order_id: 1, total_amount: 5000 }]
      });
      Order.count.mockResolvedValue([
        { order_status: 1, count: 1 }
      ]);

      await orderController.getAllOrders(mockReq, mockRes);

      expect(Order.findAndCountAll).toHaveBeenCalled();
      expect(Order.count).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      
      const responseData = mockRes.json.mock.calls[0][0];
      expect(responseData.data[0].pk_order_id).toBe(1);
      expect(responseData.statusCounts["1"]).toBe(1);
    });
  });

  describe("getOrderById()", () => {
    it("nên trả về lỗi 404 nếu không tìm thấy đơn", async () => {
      mockReq.params = { id: 99 };
      Order.findByPk.mockResolvedValue(null);

      await orderController.getOrderById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it("nên trả về chi tiết đơn hàng thành công", async () => {
      mockReq.params = { id: 1 };
      Order.findByPk.mockResolvedValue({ pk_order_id: 1, order_status: 1 });

      await orderController.getOrderById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ data: { pk_order_id: 1, order_status: 1 } });
    });
  });

  describe("createOrder()", () => {
    it("nên tạo đơn hàng thành công và allocate items", async () => {
      mockReq.body = {
        fk_customer_id: 1,
        address: "Hanoi",
        order_type: 2, // Hàng sẵn
        items: [{ fk_product_id: 10, item_quantity: 2 }]
      };

      CustomerProfile.findOne.mockResolvedValue({ pk_customer_id: 1, full_name: "Test Cus" });
      Order.create.mockResolvedValue({ pk_order_id: 100 });
      Product.findAll.mockResolvedValue([{
        pk_product_id: 10,
        product_name: "Ghe",
        pricings: [{ final_price: 500 }]
      }]);
      
      OrderItem.create.mockResolvedValue({ pk_order_item_id: 50 });
      
      const mockProductItemUpdate = jest.fn();
      ProductItem.findAll.mockResolvedValue([
        { pk_item_id: 1, update: mockProductItemUpdate },
        { pk_item_id: 2, update: mockProductItemUpdate }
      ]);

      UserAccount.findAll.mockResolvedValue([{ user_account_id: 2 }]);

      await orderController.createOrder(mockReq, mockRes);

      expect(Order.create).toHaveBeenCalled();
      expect(OrderItem.create).toHaveBeenCalled();
      expect(mockProductItemUpdate).toHaveBeenCalledTimes(2);
      expect(OrderHistory.create).toHaveBeenCalled();
      expect(systemLogController.record).toHaveBeenCalled();
      expect(socketManager.sendNotification).toHaveBeenCalledTimes(2);
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it("nên throw lỗi nếu thiếu tồn kho cho hàng sẵn", async () => {
      mockReq.body = {
        fk_customer_id: 1,
        order_type: 2,
        items: [{ fk_product_id: 10, item_quantity: 5 }] // Cần 5
      };

      CustomerProfile.findOne.mockResolvedValue({ pk_customer_id: 1 });
      Order.create.mockResolvedValue({ pk_order_id: 100 });
      Product.findAll.mockResolvedValue([{ pk_product_id: 10, product_name: "Ghe" }]);
      
      OrderItem.create.mockResolvedValue({ pk_order_item_id: 50 });
      
      ProductItem.findAll.mockResolvedValue([
        { pk_item_id: 1, update: jest.fn() },
        { pk_item_id: 2, update: jest.fn() }
      ]);

      await orderController.createOrder(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining("không đủ số lượng sẵn sàng trong kho")
      }));
    });

    it("nên rollback giao dịch và trả về lỗi 400 khi database lỗi kết nối đột ngột (UTCID12)", async () => {
      mockReq.body = {
        fk_customer_id: 1,
        order_type: 2,
        items: [{ fk_product_id: 10, item_quantity: 2 }]
      };

      CustomerProfile.findOne.mockRejectedValue(new Error("Lỗi kết nối cơ sở dữ liệu đột ngột"));

      await orderController.createOrder(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Lỗi kết nối cơ sở dữ liệu đột ngột"
      });
    });
  });

  describe("updateOrderStatus()", () => {
    it("nên trả lỗi nếu không tìm thấy đơn", async () => {
      mockReq.params = { id: 99 };
      mockReq.body = { order_status: 2 };
      Order.findByPk.mockResolvedValue(null);

      await orderController.updateOrderStatus(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it("nên cập nhật thành công và nhả kho nếu hủy đơn", async () => {
      mockReq.params = { id: 100 };
      mockReq.body = { order_status: 0 }; // Hủy đơn
      
      const mockOrderUpdate = jest.fn();
      Order.findByPk.mockResolvedValue({
        pk_order_id: 100,
        order_status: 1, // Đang chờ xác nhận
        update: mockOrderUpdate
      });

      // Trả về order items thuộc đơn hàng này
      OrderItem.findAll.mockResolvedValue([{ pk_order_item_id: 50 }]);

      await orderController.updateOrderStatus(mockReq, mockRes);

      expect(mockOrderUpdate).toHaveBeenCalledWith(expect.objectContaining({ order_status: 0 }), expect.any(Object));
      // Nhả kho
      expect(ProductItem.update).toHaveBeenCalledWith(
        expect.objectContaining({ item_status: 1 }),
        expect.any(Object)
      );
      expect(OrderHistory.create).toHaveBeenCalled();
      expect(socketManager.sendNotification).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });
});
