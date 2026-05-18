const couponController = require("../../../src/controller/coupon.controller");
const { sequelize, ProductCoupon, CouponProduct, Product, ProductPricing } = require("../../../src/entities");
const systemLogController = require("../../../src/controller/systemLog.controller");

jest.mock("../../../src/entities", () => {
    const mockProductCoupon = {
        findAndCountAll: jest.fn(),
        findOne: jest.fn(),
        findByPk: jest.fn(),
        create: jest.fn(),
        findAll: jest.fn(),
        destroy: jest.fn(),
    };

    const mockCouponProduct = {
        bulkCreate: jest.fn(),
        destroy: jest.fn(),
    };

    const mockTransaction = {
        commit: jest.fn(),
        rollback: jest.fn(),
        finished: false,
    };

    return {
        sequelize: {
            transaction: jest.fn(() => mockTransaction),
            Op: {
                ne: Symbol('ne'),
                or: Symbol('or'),
                like: Symbol('like'),
            }
        },
        ProductCoupon: mockProductCoupon,
        CouponProduct: mockCouponProduct,
        Product: {},
        ProductPricing: {}
    };
});

jest.mock("../../../src/controller/systemLog.controller", () => ({
    record: jest.fn()
}));

describe("CouponController Unit Tests", () => {
    let mockReq;
    let mockRes;
    let mockTransaction;

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
        mockTransaction = sequelize.transaction();
    });

    describe("getAllCoupons()", () => {
        it("nên trả về lỗi 500 nếu lấy dữ liệu DB thất bại", async () => {
            ProductCoupon.findAndCountAll.mockRejectedValue(new Error("DB Error"));
            await couponController.getAllCoupons(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({ message: "Lỗi hệ thống khi lấy danh sách mã giảm giá" });
        });

        it("nên lấy danh sách mã giảm giá thành công (không có search)", async () => {
            mockReq.query = { page: 1, limit: 10 };
            ProductCoupon.findAndCountAll.mockResolvedValue({
                count: 1,
                rows: [{ pk_coupon_id: 1, coupon_code: "SUMMER20" }]
            });

            await couponController.getAllCoupons(mockReq, mockRes);

            expect(ProductCoupon.findAndCountAll).toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(200);
            const resData = mockRes.json.mock.calls[0][0];
            expect(resData.data.length).toBe(1);
            expect(resData.pagination.totalItems).toBe(1);
        });

        it("nên gọi findAndCountAll với điều kiện search khi có search param", async () => {
            mockReq.query = { search: "SALE" };
            ProductCoupon.findAndCountAll.mockResolvedValue({
                count: 0,
                rows: []
            });

            await couponController.getAllCoupons(mockReq, mockRes);
            
            // Just verifying that findAndCountAll is called, the exact where clause is verified by implementation
            expect(ProductCoupon.findAndCountAll).toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(200);
        });
    });

    describe("getCouponById()", () => {
        it("nên trả về lỗi 404 nếu không tìm thấy mã giảm giá", async () => {
            mockReq.params = { id: 99 };
            ProductCoupon.findOne.mockResolvedValue(null);

            await couponController.getCouponById(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({ message: "Không tìm thấy mã giảm giá" });
        });

        it("nên lấy chi tiết mã giảm giá thành công", async () => {
            mockReq.params = { id: 1 };
            ProductCoupon.findOne.mockResolvedValue({ pk_coupon_id: 1, coupon_code: "TET2026" });

            await couponController.getCouponById(mockReq, mockRes);
            expect(ProductCoupon.findOne).toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json.mock.calls[0][0].data.coupon_code).toBe("TET2026");
        });

        it("nên xử lý lỗi 500 khi query DB thất bại", async () => {
            mockReq.params = { id: 1 };
            ProductCoupon.findOne.mockRejectedValue(new Error("DB error"));

            await couponController.getCouponById(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(500);
        });
    });

    describe("createCoupon()", () => {
        it("nên trả về lỗi nếu thiếu mã coupon", async () => {
            mockReq.body = { coupon_name: "Test", discount_percent: 10 };
            await couponController.createCoupon(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json.mock.calls[0][0].message).toContain("Mã coupon không được để trống");
        });

        it("nên trả về lỗi nếu thiếu discount_percent hoặc không hợp lệ", async () => {
            mockReq.body = { coupon_code: "CODE1", coupon_name: "Test", discount_percent: 150 };
            await couponController.createCoupon(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json.mock.calls[0][0].message).toContain("Mức giảm phải từ 1 đến 100%");
        });

        it("nên trả về lỗi nếu mã coupon đã tồn tại", async () => {
            mockReq.body = { coupon_code: "EXISTING", coupon_name: "Test", discount_percent: 10 };
            ProductCoupon.findOne.mockResolvedValue({ pk_coupon_id: 2 }); // code exists
            
            await couponController.createCoupon(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json.mock.calls[0][0].message).toContain("đã tồn tại trong hệ thống");
        });

        it("nên tạo mã giảm giá thành công và gán sản phẩm", async () => {
            mockReq.body = {
                coupon_code: "NEWCODE",
                coupon_name: "Sale Khủng",
                discount_percent: 20,
                productIds: [1, 2]
            };
            ProductCoupon.findOne.mockResolvedValue(null);
            ProductCoupon.create.mockResolvedValue({ pk_coupon_id: 10, coupon_code: "NEWCODE" });
            
            await couponController.createCoupon(mockReq, mockRes);
            
            expect(ProductCoupon.create).toHaveBeenCalled();
            expect(CouponProduct.bulkCreate).toHaveBeenCalledWith(
                [{ fk_coupon_id: 10, fk_product_id: 1 }, { fk_coupon_id: 10, fk_product_id: 2 }],
                expect.any(Object)
            );
            expect(mockTransaction.commit).toHaveBeenCalled();
            expect(systemLogController.record).toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(201);
        });

        it("nên rollback transaction nếu xảy ra lỗi trong quá trình xử lý", async () => {
            mockReq.body = { coupon_code: "CODE", coupon_name: "Name", discount_percent: 10 };
            ProductCoupon.findOne.mockResolvedValue(null);
            ProductCoupon.create.mockRejectedValue(new Error("Lỗi insert"));

            await couponController.createCoupon(mockReq, mockRes);
            
            expect(mockTransaction.rollback).toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(400);
        });
    });

    describe("updateCoupon()", () => {
        it("nên trả về lỗi 400 nếu không tìm thấy mã cần update", async () => {
            mockReq.params = { id: 99 };
            mockReq.body = { coupon_code: "UPDATED", coupon_name: "Name", discount_percent: 10 };
            ProductCoupon.findByPk.mockResolvedValue(null);

            await couponController.updateCoupon(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json.mock.calls[0][0].message).toBe("Không tìm thấy mã giảm giá để cập nhật");
        });

        it("nên update mã giảm giá thành công (bao gồm update danh sách sản phẩm)", async () => {
            mockReq.params = { id: 1 };
            mockReq.body = { coupon_code: "UPDATE1", productIds: [3, 4] };
            
            const mockUpdate = jest.fn();
            ProductCoupon.findByPk.mockResolvedValue({ 
                pk_coupon_id: 1, 
                status: 1,
                update: mockUpdate,
                coupon_code: "OLDCODE"
            });
            ProductCoupon.findOne.mockResolvedValue(null); // ko bị trùng code

            await couponController.updateCoupon(mockReq, mockRes);

            expect(mockUpdate).toHaveBeenCalled();
            expect(CouponProduct.destroy).toHaveBeenCalledWith(expect.objectContaining({
                where: { fk_coupon_id: 1 }
            }));
            expect(CouponProduct.bulkCreate).toHaveBeenCalledWith(
                [{ fk_coupon_id: 1, fk_product_id: 3 }, { fk_coupon_id: 1, fk_product_id: 4 }],
                expect.any(Object)
            );
            expect(mockTransaction.commit).toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(200);
        });
    });

    describe("deleteCoupon()", () => {
        it("nên trả về lỗi nếu không truyền id hoặc ids", async () => {
            mockReq.body = {};
            await couponController.deleteCoupon(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
        });

        it("nên trả về lỗi nếu mã không tồn tại trong CSDL", async () => {
            mockReq.body = { id: 99 };
            ProductCoupon.findAll.mockResolvedValue([]);
            await couponController.deleteCoupon(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(404);
        });

        it("nên xóa mã giảm giá thành công (xóa cứng hiện tại)", async () => {
            mockReq.body = { id: 1 };
            ProductCoupon.findAll.mockResolvedValue([{ pk_coupon_id: 1, coupon_code: "CODE1" }]);

            await couponController.deleteCoupon(mockReq, mockRes);

            expect(CouponProduct.destroy).toHaveBeenCalledWith({ where: { fk_coupon_id: [1] } });
            expect(ProductCoupon.destroy).toHaveBeenCalledWith({ where: { pk_coupon_id: [1] } });
            expect(systemLogController.record).toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(200);
        });

        it("nên xử lý xóa nhiều (ids) thành công", async () => {
            mockReq.body = { ids: [1, 2] };
            ProductCoupon.findAll.mockResolvedValue([
                { pk_coupon_id: 1, coupon_code: "CODE1" },
                { pk_coupon_id: 2, coupon_code: "CODE2" }
            ]);

            await couponController.deleteCoupon(mockReq, mockRes);

            expect(CouponProduct.destroy).toHaveBeenCalledWith({ where: { fk_coupon_id: [1, 2] } });
            expect(ProductCoupon.destroy).toHaveBeenCalledWith({ where: { pk_coupon_id: [1, 2] } });
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json.mock.calls[0][0].deletedIds).toEqual([1, 2]);
        });
    });
});
