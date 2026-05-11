const attributeController = require("../../../src/controller/productAttribute.controller");
const { ProductCategory, ProductColor, ProductMaterial, ProductRoom } = require("../../../src/entities");
const systemLogController = require("../../../src/controller/systemLog.controller");

jest.mock("../../../src/controller/systemLog.controller");
jest.mock("../../../src/entities", () => {
  return {
    ProductCategory: {
      findAndCountAll: jest.fn(),
      findOrCreate: jest.fn(),
      findByPk: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      findAll: jest.fn(),
      destroy: jest.fn(),
      sequelize: {
        fn: jest.fn(),
        col: jest.fn(),
        where: jest.fn(),
      }
    },
    ProductColor: {
      findAndCountAll: jest.fn(),
      findOrCreate: jest.fn(),
    },
    ProductMaterial: { findAndCountAll: jest.fn() },
    ProductRoom: { findAndCountAll: jest.fn() },
  };
});

describe("ProductAttributeController Unit Tests", () => {
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

  describe("getAllAttributes()", () => {
    it("nên lấy theo type thành công", async () => {
      mockReq.query = { type: "category", page: 1, limit: 10 };
      ProductCategory.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: [{ pk_product_category_id: 1, category_name: "Test Cat" }]
      });

      await attributeController.getAllAttributes(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json.mock.calls[0][0].categories).toBeDefined();
    });

    it("nên lấy tất cả khi không có type", async () => {
      mockReq.query = { search: "test" };
      ProductCategory.findAndCountAll.mockResolvedValue({ count: 1, rows: [] });
      ProductColor.findAndCountAll.mockResolvedValue({ count: 1, rows: [] });
      ProductMaterial.findAndCountAll.mockResolvedValue({ count: 1, rows: [] });
      ProductRoom.findAndCountAll.mockResolvedValue({ count: 1, rows: [] });

      await attributeController.getAllAttributes(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json.mock.calls[0][0].categories).toBeDefined();
    });
  });

  describe("Sync methods", () => {
    it("nên đồng bộ danh mục thành công", async () => {
      mockReq.body = { name: "New Cat" };
      ProductCategory.findOrCreate.mockResolvedValue([{ category_name: "New Cat" }, true]);

      await attributeController.syncCategory(mockReq, mockRes);
      expect(systemLogController.record).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it("nên đồng bộ màu sắc thành công", async () => {
      mockReq.body = { name: "Red" };
      ProductColor.findOrCreate.mockResolvedValue([{ color_name: "Red" }, true]);

      await attributeController.syncColor(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });
  });

  describe("saveAttribute()", () => {
    it("nên tạo mới thuộc tính thành công", async () => {
      mockReq.params = { type: "category" };
      mockReq.body = { name: "Cat 1" };
      
      ProductCategory.findOne.mockResolvedValue(null);
      ProductCategory.create.mockResolvedValue({ category_name: "Cat 1" });

      await attributeController.saveAttribute(mockReq, mockRes);
      expect(ProductCategory.create).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it("nên cập nhật thuộc tính thành công", async () => {
      mockReq.params = { type: "category" };
      mockReq.body = { id: 1, name: "Cat Updated" };
      
      const mockUpdate = jest.fn();
      ProductCategory.findByPk.mockResolvedValue({ category_name: "Old", update: mockUpdate });

      await attributeController.saveAttribute(mockReq, mockRes);
      expect(mockUpdate).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe("deleteAttribute()", () => {
    it("nên xóa thuộc tính thành công", async () => {
      mockReq.params = { type: "category" };
      mockReq.body = { id: 1 };
      
      ProductCategory.findAll.mockResolvedValue([{ category_name: "Del Cat" }]);
      
      await attributeController.deleteAttribute(mockReq, mockRes);
      
      expect(ProductCategory.destroy).toHaveBeenCalled();
      expect(systemLogController.record).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });
});
