const inventoryController = require("../../../src/controller/inventory.controller");
const { Product, ProductItem, sequelize } = require("../../../src/entities");

jest.mock("../../../src/entities", () => ({
  sequelize: {
    literal: jest.fn().mockReturnValue("mock_literal"),
    col: jest.fn().mockReturnValue("mock_col"),
  },
  Product: {
    findAll: jest.fn(),
  },
  ProductItem: {
    findOne: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
  },
  ProductCategory: {},
  ProductColor: {},
  ProductMaterial: {},
  ProductRoom: {},
  ProductPricing: {},
}));

describe("InventoryController Unit Tests", () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {
      query: {},
      params: {},
      body: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe("getInventoryProducts()", () => {
    it("nên trả về danh sách sản phẩm trong kho thành công", async () => {
      mockReq.query = { page: 1, limit: 10 };
      
      const mockProduct = {
        toJSON: () => ({
          pk_product_id: 1,
          product_name: "Test",
          product_type: "FINISHED",
          stock: 10,
          available: 5,
          processing: 2,
          defective: 0,
          delivering: 3,
        })
      };
      Product.findAll.mockResolvedValue([mockProduct]);

      await inventoryController.getInventoryProducts(mockReq, mockRes);

      expect(Product.findAll).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      const resData = mockRes.json.mock.calls[0][0];
      expect(resData.data.length).toBe(1);
      expect(resData.counts.FINISHED).toBe(1);
    });

    it("nên lọc theo typeFilter = DEFECTIVE", async () => {
      mockReq.query = { typeFilter: "DEFECTIVE" };
      
      const mockProduct1 = { toJSON: () => ({ pk_product_id: 1, type: "FINISHED", defective: 0 }) };
      const mockProduct2 = { toJSON: () => ({ pk_product_id: 2, type: "FINISHED", defective: 1 }) }; // Co loi
      
      Product.findAll.mockResolvedValue([mockProduct1, mockProduct2]);

      await inventoryController.getInventoryProducts(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      const resData = mockRes.json.mock.calls[0][0];
      // Product 2 passes filter
      expect(resData.data.length).toBe(1);
      expect(resData.data[0].id).toBe(2);
    });
  });

  describe("updateItemStatus()", () => {
    it("nên trả về lỗi 400 nếu status không hợp lệ", async () => {
      mockReq.params = { itemSerial: "SER123" };
      mockReq.body = { status: "INVALID" };

      await inventoryController.updateItemStatus(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it("nên cập nhật trạng thái đơn vị thành công", async () => {
      mockReq.params = { itemSerial: "SER123" };
      mockReq.body = { status: "DEFECTIVE" }; // = 3
      
      const mockUpdate = jest.fn();
      ProductItem.findOne.mockResolvedValue({ item_serial: "SER123", update: mockUpdate });

      await inventoryController.updateItemStatus(mockReq, mockRes);

      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ item_status: 3 }));
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe("processDefectiveItems()", () => {
    it("nên xử lý hàng lỗi thành công", async () => {
      mockReq.body = { unitIds: ["S1", "S2"], processType: "SCRAP", scrapPrice: 100 };
      
      const mockUpdate = jest.fn();
      ProductItem.findAll.mockResolvedValue([
        { item_serial: "S1", update: mockUpdate },
        { item_serial: "S2", update: mockUpdate }
      ]);

      await inventoryController.processDefectiveItems(mockReq, mockRes);
      expect(mockUpdate).toHaveBeenCalledTimes(2);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe("getProductItems()", () => {
    it("nên lấy chi tiết đơn vị sản phẩm", async () => {
      mockReq.params = { id: 1 };
      ProductItem.findAll.mockResolvedValue([
        { item_serial: "S1", item_status: 1, createdate: "2026-05-01", cost_price: 100, batch_code: "B1" }
      ]);

      await inventoryController.getProductItems(mockReq, mockRes);
      expect(ProductItem.findAll).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      const resData = mockRes.json.mock.calls[0][0];
      expect(resData[0].units.length).toBe(1);
    });
  });
});
