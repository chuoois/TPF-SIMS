const productController = require("../../../src/controller/product.controller");
const { sequelize, Product } = require("../../../src/entities");

jest.mock("../../../src/entities", () => {
  const mockProduct = {
    findAndCountAll: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    count: jest.fn(),
  };

  return {
    sequelize: {
      literal: jest.fn().mockReturnValue("mock_literal_query"),
      col: jest.fn().mockReturnValue("mock_col"),
    },
    Product: mockProduct,
    ProductPricing: {},
    ProductCategory: {},
    ProductColor: {},
    ProductMaterial: {},
    ProductRoom: {},
    ProductItem: {},
    ProductCoupon: {},
  };
});

describe("ProductController Unit Tests", () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {
      query: {},
      params: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe("getAllProducts()", () => {
    it("nên trả về lỗi 500 nếu DB thất bại", async () => {
      Product.count.mockRejectedValue(new Error("DB Error"));
      await productController.getAllProducts(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(500);
    });

    it("nên lấy danh sách sản phẩm thành công với dữ liệu quà tặng", async () => {
      mockReq.query = { is_gift: "true", page: 1, limit: 10 };
      
      Product.count.mockResolvedValue(1);
      
      const mockRow = {
        toJSON: () => ({
          pk_product_id: 1,
          product_name: "Sản phẩm Quà tặng",
          is_gift: 1,
          available_quantity: 5,
        })
      };
      
      Product.findAll.mockResolvedValue([mockRow]);

      await productController.getAllProducts(mockReq, mockRes);

      expect(Product.count).toHaveBeenCalled();
      expect(Product.findAll).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      const resData = mockRes.json.mock.calls[0][0];
      expect(resData.data[0].sell_type_name).toBe("Quà tặng");
    });

    it("nên lọc theo category_id và trả về dữ liệu hàng mộc", async () => {
      mockReq.query = { category_id: "1,2", sell_type: 1, search: "tu" };
      
      Product.count.mockResolvedValue(1);
      const mockRow = {
        toJSON: () => ({
          pk_product_id: 2,
          product_name: "Tủ Quần Áo",
          is_gift: 0,
          available_quantity: 10,
          pricings: [{ raw_price: 1000, final_price: 1500 }]
        })
      };
      Product.findAll.mockResolvedValue([mockRow]);

      await productController.getAllProducts(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      const resData = mockRes.json.mock.calls[0][0];
      expect(resData.data[0].sell_type_name).toBe("Hàng mộc");
      expect(resData.data[0].original_price).toBe(1000);
    });
    
    it("nên xử lý hiển thị giá có coupon", async () => {
      mockReq.query = { sell_type: 2 };
      
      Product.count.mockResolvedValue(1);
      const mockRow = {
        toJSON: () => ({
          pk_product_id: 3,
          is_gift: 0,
          pricings: [{ raw_price: 1000, final_price: 2000 }],
          coupons: [{ discount_percent: 10 }]
        })
      };
      Product.findAll.mockResolvedValue([mockRow]);

      await productController.getAllProducts(mockReq, mockRes);
      
      const resData = mockRes.json.mock.calls[0][0];
      // Giá hoàn thiện (sell_type 2) là 2000, giảm 10% = 1800
      expect(resData.data[0].display_price).toBe(1800);
    });
  });

  describe("getProductDetail()", () => {
    it("nên trả về lỗi 404 nếu không tìm thấy sản phẩm", async () => {
      mockReq.params = { id: 99 };
      Product.findByPk.mockResolvedValue(null);

      await productController.getProductDetail(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Không tìm thấy sản phẩm" });
    });

    it("nên trả về chi tiết sản phẩm thành công", async () => {
      mockReq.params = { id: 1 };
      
      const mockProduct = {
        toJSON: () => ({
          pk_product_id: 1,
          product_name: "Bàn gỗ",
          pricings: [{ raw_price: 500, final_price: 1000 }],
          coupons: [{ discount_percent: 20, coupon_code: "SALE20" }],
          items: []
        })
      };

      Product.findByPk.mockResolvedValue(mockProduct);

      await productController.getProductDetail(mockReq, mockRes);

      expect(Product.findByPk).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      
      const responseData = mockRes.json.mock.calls[0][0];
      expect(responseData.pk_product_id).toBe(1);
      // original_final_price = 1000, discount 20% => display_final_price = 800
      expect(responseData.pricing.display_final_price).toBe(800);
    });
  });
});
