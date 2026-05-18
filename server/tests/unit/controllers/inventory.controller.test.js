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
    
    // Helper helper to generate standardized products for inventory mock response
    function createMockProduct(overrides = {}) {
      return {
        toJSON: () => ({
          pk_product_id: 1,
          sku: "SP01",
          product_name: "Bàn Gỗ Cũ",
          product_type: "FINISHED",
          min_stock: 2,
          stock: 10,
          available: 5,
          processing: 2,
          defective: 0,
          delivering: 3,
          importedAt: "2026-05-01",
          ...overrides,
        })
      };
    }

    it("UTCID01 - Lấy tất cả danh sách mặc định với limit=20 - HTTP 200", async () => {
      mockReq.query = { page: 1, limit: 20 };
      Product.findAll.mockResolvedValue([createMockProduct()]);

      await inventoryController.getInventoryProducts(mockReq, mockRes);

      expect(Product.findAll).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      const resData = mockRes.json.mock.calls[0][0];
      expect(resData.data.length).toBe(1);
      expect(resData.counts.ALL).toBe(1);
      expect(resData.pagination.limit).toBe(20);
    });

    it("UTCID02 - Lọc tìm kiếm theo từ khóa 'Bàn Gỗ' - HTTP 200", async () => {
      mockReq.query = { search: "Bàn Gỗ" };
      Product.findAll.mockResolvedValue([
        createMockProduct({ product_name: "Bàn Gỗ Sửa Đổi" })
      ]);

      await inventoryController.getInventoryProducts(mockReq, mockRes);

      expect(Product.findAll).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      const resData = mockRes.json.mock.calls[0][0];
      expect(resData.data[0].name).toContain("Bàn Gỗ");
    });

    it("UTCID03 - Lọc chính xác theo danh mục 'Bàn' - HTTP 200", async () => {
      mockReq.query = { category: "Bàn" };
      Product.findAll.mockResolvedValue([
        createMockProduct({ category: { category_name: "Bàn" } })
      ]);

      await inventoryController.getInventoryProducts(mockReq, mockRes);

      expect(Product.findAll).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      const resData = mockRes.json.mock.calls[0][0];
      expect(resData.data[0].category).toBe("Bàn");
    });

    it("UTCID04 - Lọc đặc biệt tồn kho thấp (LOW_STOCK) - HTTP 200", async () => {
      mockReq.query = { typeFilter: "LOW_STOCK" };
      // available (1) <= minStock (2)
      const lowStockProd = createMockProduct({ available: 1, min_stock: 2 });
      const highStockProd = createMockProduct({ available: 10, min_stock: 2 });

      Product.findAll.mockResolvedValue([lowStockProd, highStockProd]);

      await inventoryController.getInventoryProducts(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      const resData = mockRes.json.mock.calls[0][0];
      expect(resData.data.length).toBe(1);
      expect(resData.data[0].stockBreakdown.available).toBe(1);
    });

    it("UTCID05 - Lọc đặc biệt hàng tồn kho lâu năm (LONG_STAY > 60 ngày) - HTTP 200", async () => {
      mockReq.query = { typeFilter: "LONG_STAY" };
      
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 70); // 70 days ago
      const longStayProd = createMockProduct({ importedAt: oldDate.toISOString() });

      const newDate = new Date();
      newDate.setDate(newDate.getDate() - 10); // 10 days ago
      const freshProd = createMockProduct({ pk_product_id: 2, importedAt: newDate.toISOString() });

      Product.findAll.mockResolvedValue([longStayProd, freshProd]);

      await inventoryController.getInventoryProducts(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      const resData = mockRes.json.mock.calls[0][0];
      expect(resData.data.length).toBe(1);
    });

    it("UTCID06 - Lọc đặc biệt hàng lỗi (DEFECTIVE) - HTTP 200", async () => {
      mockReq.query = { typeFilter: "DEFECTIVE" };
      
      const defectiveProd = createMockProduct({ defective: 3 });
      const normalProd = createMockProduct({ pk_product_id: 2, defective: 0 });

      Product.findAll.mockResolvedValue([defectiveProd, normalProd]);

      await inventoryController.getInventoryProducts(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      const resData = mockRes.json.mock.calls[0][0];
      expect(resData.data.length).toBe(1);
      expect(resData.data[0].stockBreakdown.defective).toBe(3);
    });

    it("UTCID07 - [Abnormal] Database bị ngắt kết nối / lỗi truy vấn - HTTP 500 + 'Lỗi hệ thống khi lấy danh sách kho hàng'", async () => {
      mockReq.query = {};
      Product.findAll.mockRejectedValue(new Error("Database connection timeout"));

      await inventoryController.getInventoryProducts(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Lỗi hệ thống khi lấy danh sách kho hàng" });
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
