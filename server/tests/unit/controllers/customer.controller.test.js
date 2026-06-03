const customerController = require("../../../src/controller/customer.controller");
const { CustomerProfile, Order, OrderItem } = require("../../../src/entities");
const systemLogController = require("../../../src/controller/systemLog.controller");

jest.mock("../../../src/controller/systemLog.controller");
jest.mock("../../../src/entities", () => ({
  CustomerProfile: {
    findAndCountAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
  },
  Order: {
    findAndCountAll: jest.fn(),
  },
  OrderItem: {},
}));

describe("CustomerController Unit Tests", () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {
      query: {},
      params: {},
      body: {},
      user: { userId: 1 },
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe("getAllCustomers()", () => {
    it("nên trả về danh sách khách hàng", async () => {
      mockReq.query = { page: 1, limit: 10, search: "Nguyen" };
      CustomerProfile.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: [{ pk_customer_id: 1, full_name: "Nguyen Van A" }],
      });

      await customerController.getAllCustomers(mockReq, mockRes);

      expect(CustomerProfile.findAndCountAll).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        data: [{ pk_customer_id: 1, full_name: "Nguyen Van A" }],
        pagination: { totalItems: 1, totalPages: 1, currentPage: 1, limit: 10 },
      });
    });

    it("nên trả về lỗi 500 khi DB lỗi", async () => {
      CustomerProfile.findAndCountAll.mockRejectedValue(new Error("DB Error"));
      await customerController.getAllCustomers(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe("getCustomerById()", () => {
    it("nên trả về lỗi 404 nếu khách hàng không tồn tại", async () => {
      mockReq.params = { id: 99 };
      CustomerProfile.findOne.mockResolvedValue(null);

      await customerController.getCustomerById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it("nên trả về thông tin khách hàng kèm đơn hàng", async () => {
      mockReq.params = { id: 1 };
      mockReq.query = { page: 1, limit: 5 };
      
      const mockCustomer = {
        pk_customer_id: 1,
        full_name: "Test",
        toJSON: () => ({ pk_customer_id: 1, full_name: "Test" }),
      };
      
      CustomerProfile.findOne.mockResolvedValue(mockCustomer);
      Order.findAndCountAll.mockResolvedValue({
        count: 2,
        rows: [{ order_id: 1 }, { order_id: 2 }],
      });

      await customerController.getCustomerById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        pk_customer_id: 1,
        full_name: "Test",
        orders: [{ order_id: 1 }, { order_id: 2 }],
        pagination: { totalItems: 2, totalPages: 1, currentPage: 1, limit: 5 },
      });
    });
  });

  describe("createCustomer()", () => {
    it("nên tự tạo mã khách hàng và tạo thành công", async () => {
      mockReq.body = { full_name: "New Customer" };
      CustomerProfile.count.mockResolvedValue(5);
      
      const newCus = { pk_customer_id: 2, customer_code: "KH0006", full_name: "New Customer" };
      CustomerProfile.create.mockResolvedValue(newCus);

      await customerController.createCustomer(mockReq, mockRes);

      expect(CustomerProfile.create).toHaveBeenCalledWith(expect.objectContaining({
        customer_code: "KH0006",
        full_name: "New Customer",
        status: 1,
      }));
      expect(systemLogController.record).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Tạo khách hàng thành công" }));
    });

    it("nên trả về lỗi 400 nếu trùng số điện thoại", async () => {
      mockReq.body = { full_name: "New Customer", phone_number: "0987654321" };
      CustomerProfile.findOne.mockResolvedValue({ pk_customer_id: 1, phone_number: "0987654321" });

      await customerController.createCustomer(mockReq, mockRes);

      expect(CustomerProfile.findOne).toHaveBeenCalledWith(expect.objectContaining({
        where: { phone_number: "0987654321", status: 1 }
      }));
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        message: "Số điện thoại này đã được đăng ký bởi một khách hàng khác."
      }));
    });
  });

  describe("updateCustomer()", () => {
    it("nên trả lỗi 404 nếu không tìm thấy", async () => {
      mockReq.params = { id: 99 };
      CustomerProfile.findOne.mockResolvedValue(null);

      await customerController.updateCustomer(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it("nên cập nhật thông tin thành công", async () => {
      mockReq.params = { id: 1 };
      mockReq.body = { phone_number: "0123456789" };
      
      const mockUpdate = jest.fn();
      CustomerProfile.findOne
        .mockResolvedValueOnce({ pk_customer_id: 1, full_name: "Test", update: mockUpdate })
        .mockResolvedValueOnce(null);

      await customerController.updateCustomer(mockReq, mockRes);

      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ phone_number: "0123456789" }));
      expect(systemLogController.record).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it("nên trả về lỗi 400 nếu cập nhật số điện thoại trùng với khách hàng khác", async () => {
      mockReq.params = { id: 1 };
      mockReq.body = { phone_number: "0987654321" };
      
      const mockUpdate = jest.fn();
      CustomerProfile.findOne
        .mockResolvedValueOnce({ pk_customer_id: 1, full_name: "Test", update: mockUpdate })
        .mockResolvedValueOnce({ pk_customer_id: 2, phone_number: "0987654321" });

      await customerController.updateCustomer(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        message: "Số điện thoại này đã được đăng ký bởi một khách hàng khác."
      }));
    });
  });

  describe("deleteCustomer()", () => {
    it("nên trả lỗi 404 nếu không tìm thấy", async () => {
      mockReq.params = { id: 99 };
      CustomerProfile.findOne.mockResolvedValue(null);

      await customerController.deleteCustomer(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it("nên xóa mềm (soft delete) thành công", async () => {
      mockReq.params = { id: 1 };
      
      const mockUpdate = jest.fn();
      CustomerProfile.findOne.mockResolvedValue({ pk_customer_id: 1, full_name: "Test", update: mockUpdate });

      await customerController.deleteCustomer(mockReq, mockRes);

      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ status: 0 })); // status: 0
      expect(systemLogController.record).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });
});
