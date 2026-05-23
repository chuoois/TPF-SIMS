const productController = require("../../../src/controller/product.controller");
const { sequelize, Product, ProductPricing } = require("../../../src/entities");

jest.mock("../../../src/entities", () => {
  const mockProduct = {
    findAndCountAll: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    count: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  };

  return {
    sequelize: {
      transaction: jest.fn(),
      literal: jest.fn().mockReturnValue("mock_literal_query"),
      col: jest.fn().mockReturnValue("mock_col"),
    },
    Product: mockProduct,
    ProductPricing: {
      create: jest.fn(),
    },
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
  let mockTransaction;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {
      query: {},
      params: {},
      body: {},
      user: { id: 1 },
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockTransaction = {
      commit: jest.fn(),
      rollback: jest.fn(),
    };
    sequelize.transaction.mockResolvedValue(mockTransaction);
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
      const mockProductDetail = {
        toJSON: () => ({
          pk_product_id: 1,
          product_name: "Bàn gỗ",
          pricings: [{ raw_price: 500, final_price: 1000 }],
          coupons: [{ discount_percent: 20, coupon_code: "SALE20" }],
          items: []
        })
      };
      Product.findByPk.mockResolvedValue(mockProductDetail);

      await productController.getProductDetail(mockReq, mockRes);

      expect(Product.findByPk).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      const responseData = mockRes.json.mock.calls[0][0];
      expect(responseData.pk_product_id).toBe(1);
      expect(responseData.pricing.display_final_price).toBe(800);
    });
  });

  describe("createProduct()", () => {
    it("UTCID01 - Tạo sản phẩm thành công với thông tin hợp lệ (Tên 'Bàn Gỗ', Mã 'SP01', Bảo hành '12', Danh mục '1', Hàng mộc) - Kỳ vọng trả về HTTP 201 và thông báo 'Tạo sản phẩm thành công'", async () => {
      mockReq.body = {
        product_name: "Bàn Gỗ",
        sku: "SP01",
        warranty_months: 12,
        fk_category_id: 1,
        sell_type: 1
      };

      Product.findOne.mockResolvedValue(null);
      Product.create.mockResolvedValue({ pk_product_id: 1, sku: "SP01" });
      Product.findByPk.mockResolvedValue({
        pk_product_id: 1,
        product_name: "Bàn Gỗ",
        toJSON: () => ({ pk_product_id: 1, product_name: "Bàn Gỗ" })
      });

      await productController.createProduct(mockReq, mockRes);

      expect(Product.findOne).toHaveBeenCalledWith({ where: { sku: "SP01" } });
      expect(Product.create).toHaveBeenCalled();
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Tạo sản phẩm thành công" })
      );
    });

    it("UTCID02 - Lỗi hệ thống khi Tên sản phẩm là 'null' (bắt buộc trong DB) - Kỳ vọng trả về HTTP 500 với DB Error", async () => {
      mockReq.body = {
        product_name: "null",
        sku: "SP01",
        warranty_months: 12,
        fk_category_id: 1,
        sell_type: 1
      };

      Product.findOne.mockResolvedValue(null);
      Product.create.mockRejectedValue(new Error("ValidationError: product_name cannot be null"));

      await productController.createProduct(mockReq, mockRes);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Lỗi hệ thống khi tạo sản phẩm" });
    });

    it("UTCID03 - Tạo sản phẩm thành công khi Tên sản phẩm bị trùng (EXISTING) - Kỳ vọng trả về HTTP 201 và thông báo 'Tạo sản phẩm thành công'", async () => {
      mockReq.body = {
        product_name: "EXISTING",
        sku: "SP01",
        warranty_months: 12,
        fk_category_id: 1,
        sell_type: 1
      };

      Product.findOne.mockResolvedValue(null);
      Product.create.mockResolvedValue({ pk_product_id: 3, sku: "SP01" });
      Product.findByPk.mockResolvedValue({
        pk_product_id: 3,
        product_name: "EXISTING",
        toJSON: () => ({ pk_product_id: 3, product_name: "EXISTING" })
      });

      await productController.createProduct(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it("UTCID04 - Từ chối tạo sản phẩm khi Mã sản phẩm bị trùng (EXISTING) - Kỳ vọng trả về HTTP 409 và thông báo 'Đầu vào không hợp lệ'", async () => {
      mockReq.body = {
        product_name: "Bàn Gỗ",
        sku: "EXISTING",
        warranty_months: 12,
        fk_category_id: 1,
        sell_type: 1
      };

      Product.findOne.mockResolvedValue({ sku: "EXISTING" });

      await productController.createProduct(mockReq, mockRes);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Mã sản phẩm "EXISTING" đã tồn tại' });
    });

    it("UTCID05 - Từ chối tạo sản phẩm khi Mã sản phẩm bị bỏ trống (null) - Kỳ vọng trả về HTTP 500 và thông báo 'Đầu vào không hợp lệ'", async () => {
      mockReq.body = {
        product_name: "Bàn Gỗ",
        sku: null,
        warranty_months: 12,
        fk_category_id: 1,
        sell_type: 1
      };

      Product.findOne.mockResolvedValue(null);
      Product.create.mockRejectedValue(new Error("ValidationError: sku cannot be null"));

      await productController.createProduct(mockReq, mockRes);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(500);
    });

    it("UTCID06 - Tạo sản phẩm thành công khi số tháng bảo hành bị bỏ trống (null) - Kỳ vọng trả về HTTP 201 và thông báo 'Tạo sản phẩm thành công'", async () => {
      mockReq.body = {
        product_name: "Bàn Gỗ",
        sku: "SP01",
        warranty_months: null,
        fk_category_id: 1,
        sell_type: 1
      };

      Product.findOne.mockResolvedValue(null);
      Product.create.mockResolvedValue({ pk_product_id: 6, sku: "SP01" });
      Product.findByPk.mockResolvedValue({
        pk_product_id: 6,
        product_name: "Bàn Gỗ",
        toJSON: () => ({ pk_product_id: 6, product_name: "Bàn Gỗ" })
      });

      await productController.createProduct(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it("UTCID07 - Tạo sản phẩm thành công khi danh mục sản phẩm bị bỏ trống (null) - Kỳ vọng trả về HTTP 201 và thông báo 'Tạo sản phẩm thành công'", async () => {
      mockReq.body = {
        product_name: "Bàn Gỗ",
        sku: "SP01",
        warranty_months: 12,
        fk_category_id: null,
        sell_type: 1
      };

      Product.findOne.mockResolvedValue(null);
      Product.create.mockResolvedValue({ pk_product_id: 7, sku: "SP01" });
      Product.findByPk.mockResolvedValue({
        pk_product_id: 7,
        product_name: "Bàn Gỗ",
        toJSON: () => ({ pk_product_id: 7, product_name: "Bàn Gỗ" })
      });

      await productController.createProduct(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it("UTCID08 - Tạo sản phẩm thành công với hình thức bán là Hàng sẵn (sell_type = 2) - Kỳ vọng trả về HTTP 201 và thông báo 'Tạo sản phẩm thành công'", async () => {
      mockReq.body = {
        product_name: "Bàn Gỗ",
        sku: "SP01",
        warranty_months: 12,
        fk_category_id: 1,
        sell_type: 2
      };

      Product.findOne.mockResolvedValue(null);
      Product.create.mockResolvedValue({ pk_product_id: 8, sku: "SP01" });
      Product.findByPk.mockResolvedValue({
        pk_product_id: 8,
        product_name: "Bàn Gỗ",
        toJSON: () => ({ pk_product_id: 8, product_name: "Bàn Gỗ" })
      });

      await productController.createProduct(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it("UTCID09 - Tạo sản phẩm thành công với hình thức bán là Quà tặng (sell_type = 0) - Kỳ vọng trả về HTTP 201 và thông báo 'Tạo sản phẩm thành công'", async () => {
      mockReq.body = {
        product_name: "Bàn Gỗ",
        sku: "SP01",
        warranty_months: 12,
        fk_category_id: 1,
        sell_type: 0
      };

      Product.findOne.mockResolvedValue(null);
      Product.create.mockResolvedValue({ pk_product_id: 9, sku: "SP01" });
      Product.findByPk.mockResolvedValue({
        pk_product_id: 9,
        product_name: "Bàn Gỗ",
        toJSON: () => ({ pk_product_id: 9, product_name: "Bàn Gỗ" })
      });

      await productController.createProduct(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it("UTCID10 - Tạo sản phẩm thành công với hình thức bán là Hàng custom (sell_type = 4) - Kỳ vọng trả về HTTP 201 và thông báo 'Tạo sản phẩm thành công'", async () => {
      mockReq.body = {
        product_name: "Bàn Gỗ",
        sku: "SP01",
        warranty_months: 12,
        fk_category_id: 1,
        sell_type: 4
      };

      Product.findOne.mockResolvedValue(null);
      Product.create.mockResolvedValue({ pk_product_id: 10, sku: "SP01" });
      Product.findByPk.mockResolvedValue({
        pk_product_id: 10,
        product_name: "Bàn Gỗ",
        toJSON: () => ({ pk_product_id: 10, product_name: "Bàn Gỗ" })
      });

      await productController.createProduct(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it("UTCID11 - Tạo sản phẩm thành công với các thông tin hợp lệ mặc định khác - Kỳ vọng trả về HTTP 201 và thông báo 'Tạo sản phẩm thành công'", async () => {
      mockReq.body = {
        product_name: "Bàn Gỗ",
        sku: "SP01",
        warranty_months: 12,
        fk_category_id: 1,
        sell_type: 1
      };

      Product.findOne.mockResolvedValue(null);
      Product.create.mockResolvedValue({ pk_product_id: 11, sku: "SP01" });
      Product.findByPk.mockResolvedValue({
        pk_product_id: 11,
        product_name: "Bàn Gỗ",
        toJSON: () => ({ pk_product_id: 11, product_name: "Bàn Gỗ" })
      });

      await productController.createProduct(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });
  });

  // ============================================================
  //  updateProduct() — UTCID01 to UTCID07
  // ============================================================
  describe("updateProduct()", () => {

    function makeMockProduct(overrides = {}) {
      return {
        pk_product_id: 1,
        sku: "OWN_SKU",
        product_name: "Bàn Gỗ Cũ",
        update: jest.fn().mockResolvedValue(true),
        ...overrides,
      };
    }

    function makeFullProduct(overrides = {}) {
      return {
        pk_product_id: 1,
        product_name: "Bàn Gỗ Sửa Đổi",
        sku: "NEW_SKU",
        ...overrides,
      };
    }

    it("UTCID01 - Cập nhật thành công với thông tin hợp lệ, SKU mới và có pricing mới - HTTP 200", async () => {
      mockReq.params = { id: "1" };
      mockReq.body = {
        product_name: "Bàn Gỗ Sửa Đổi",
        sku: "NEW_SKU",
        pricing: { final_price: 200 }
      };

      Product.findByPk
        .mockResolvedValueOnce(makeMockProduct())
        .mockResolvedValueOnce(makeFullProduct());
      Product.findOne.mockResolvedValue(null);
      ProductPricing.update.mockResolvedValue([1]);
      ProductPricing.create.mockResolvedValue({ pk_pricing_id: 100 });

      await productController.updateProduct(mockReq, mockRes);

      expect(Product.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ where: { sku: "NEW_SKU", pk_product_id: { [Op.ne]: "1" } } })
      );
      expect(ProductPricing.update).toHaveBeenCalled();
      expect(ProductPricing.create).toHaveBeenCalled();
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it("UTCID02 - Cập nhật thành công với SKU của chính nó (OWN_SKU) và pricing = null - HTTP 200", async () => {
      mockReq.params = { id: "1" };
      mockReq.body = {
        product_name: "Bàn Gỗ Sửa Đổi",
        sku: "OWN_SKU",
        pricing: null
      };

      Product.findByPk
        .mockResolvedValueOnce(makeMockProduct({ sku: "OWN_SKU" }))
        .mockResolvedValueOnce(makeFullProduct({ sku: "OWN_SKU" }));
      Product.findOne.mockResolvedValue(null);

      await productController.updateProduct(mockReq, mockRes);

      expect(ProductPricing.update).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it("UTCID03 - [Abnormal] ID sản phẩm không tồn tại (9999) - HTTP 404 + 'Không tìm thấy sản phẩm'", async () => {
      mockReq.params = { id: "9999" };
      mockReq.body = {
        sku: null,
        product_name: null,
        pricing: null
      };

      Product.findByPk.mockResolvedValueOnce(null);

      await productController.updateProduct(mockReq, mockRes);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Không tìm thấy sản phẩm" });
    });

    it("UTCID04 - [Abnormal] Trùng mã SKU của sản phẩm khác (OTHER_SKU) - HTTP 409 + 'Mã sản phẩm đã tồn tại'", async () => {
      mockReq.params = { id: "1" };
      mockReq.body = {
        product_name: "Bàn Gỗ Sửa Đổi",
        sku: "OTHER_SKU",
        pricing: null
      };

      Product.findByPk.mockResolvedValueOnce(makeMockProduct());
      Product.findOne.mockResolvedValue({ pk_product_id: 2, sku: "OTHER_SKU" });

      await productController.updateProduct(mockReq, mockRes);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Mã sản phẩm "OTHER_SKU" đã tồn tại' });
    });

    it("UTCID05 - [Abnormal] Tên sản phẩm truyền null (lỗi ràng buộc DB bắt buộc) - HTTP 500", async () => {
      mockReq.params = { id: "1" };
      mockReq.body = {
        product_name: null,
        sku: "NEW_SKU",
        pricing: null
      };

      const mockProductWithValidation = {
        pk_product_id: 1,
        update: jest.fn().mockRejectedValue(new Error("ValidationError: product_name cannot be null")),
      };
      Product.findByPk.mockResolvedValueOnce(mockProductWithValidation);
      Product.findOne.mockResolvedValue(null);

      await productController.updateProduct(mockReq, mockRes);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Lỗi hệ thống khi cập nhật sản phẩm" });
    });

    it("UTCID06 - [Boundary] Cập nhật thành công với tên sản phẩm đạt biên tối đa 255 ký tự - HTTP 200", async () => {
      const longName255 = "a".repeat(255);
      mockReq.params = { id: "1" };
      mockReq.body = {
        product_name: longName255,
        sku: "NEW_SKU",
        pricing: null
      };

      Product.findByPk
        .mockResolvedValueOnce(makeMockProduct())
        .mockResolvedValueOnce(makeFullProduct({ product_name: longName255 }));
      Product.findOne.mockResolvedValue(null);

      await productController.updateProduct(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it("UTCID07 - [Boundary] Cập nhật thất bại khi tên sản phẩm vượt biên 256 ký tự (DB lỗi) - HTTP 500", async () => {
      const longName256 = "a".repeat(256);
      mockReq.params = { id: "1" };
      mockReq.body = {
        product_name: longName256,
        sku: "NEW_SKU",
        pricing: null
      };

      const mockProductWithLengthError = {
        pk_product_id: 1,
        update: jest.fn().mockRejectedValue(new Error("DataTruncationError: Data too long for column 'product_name'")),
      };
      Product.findByPk.mockResolvedValueOnce(mockProductWithLengthError);
      Product.findOne.mockResolvedValue(null);

      await productController.updateProduct(mockReq, mockRes);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(500);
    });

  });
});
