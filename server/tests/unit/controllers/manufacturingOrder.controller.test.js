const manufacturingOrderController = require("../../../src/controller/manufacturingOrder.controller");
const { 
    ManufacturingOrder, ManufacturingOrderItem, Supplier, 
    Product, CustomRequestItem, sequelize 
} = require("../../../src/entities");
const systemLogController = require("../../../src/controller/systemLog.controller");

jest.mock("../../../src/controller/systemLog.controller");
jest.mock("../../../src/entities", () => {
    const mockTransaction = { commit: jest.fn(), rollback: jest.fn(), finished: false };
    return {
        sequelize: {
            transaction: jest.fn(async () => mockTransaction)
        },
        ManufacturingOrder: { findAndCountAll: jest.fn(), findByPk: jest.fn(), count: jest.fn(), create: jest.fn(), update: jest.fn() },
        ManufacturingOrderItem: { findAll: jest.fn(), bulkCreate: jest.fn() },
        Supplier: {},
        Product: { findAll: jest.fn() },
        CustomRequestItem: { update: jest.fn() }
    };
});

describe("ManufacturingOrderController Unit Tests", () => {
    let mockReq;
    let mockRes;

    beforeEach(() => {
        jest.clearAllMocks();
        mockReq = {
            query: {},
            params: {},
            body: {},
            user: { userId: 1 }
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    describe("getAllOrders()", () => {
        it("nên lấy danh sách phiếu nhập hàng thành công", async () => {
            mockReq.query = { page: 1, limit: 10, search: "YCNH", status: "1", supplier_id: "2" };
            ManufacturingOrder.findAndCountAll.mockResolvedValue({
                count: 1,
                rows: [{ pk_manufacturing_order_id: 1, order_code: "YCNH-1" }]
            });

            await manufacturingOrderController.getAllOrders(mockReq, mockRes);
            expect(ManufacturingOrder.findAndCountAll).toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.any(Array)
            }));
        });

        it("nên báo lỗi 500 nếu lấy danh sách thất bại", async () => {
            ManufacturingOrder.findAndCountAll.mockRejectedValue(new Error("DB Error"));
            await manufacturingOrderController.getAllOrders(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(500);
        });
    });

    describe("getOrderById()", () => {
        it("nên báo lỗi 404 nếu không tìm thấy phiếu", async () => {
            mockReq.params = { id: 99 };
            ManufacturingOrder.findByPk.mockResolvedValue(null);
            await manufacturingOrderController.getOrderById(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(404);
        });

        it("nên lấy chi tiết phiếu thành công", async () => {
            mockReq.params = { id: 1 };
            ManufacturingOrder.findByPk.mockResolvedValue({ pk_manufacturing_order_id: 1 });
            await manufacturingOrderController.getOrderById(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({ data: expect.any(Object) });
        });
    });

    describe("createOrder()", () => {
        it("nên tạo phiếu nhập hàng thành công", async () => {
            mockReq.body = {
                fk_supplier_id: 2,
                note: "Note",
                deposit_amount: 1000,
                expected_delivery_date: "2026-05-30",
                items: [
                    { fk_product_id: 1, quantity: 5, import_price: 100 },
                    { fk_custom_request_item_id: 10, quantity: 2, import_price: 200 }
                ]
            };

            ManufacturingOrder.count.mockResolvedValue(0);
            ManufacturingOrder.create.mockResolvedValue({ pk_manufacturing_order_id: 1, order_code: "YCNH-NEW" });
            ManufacturingOrderItem.findAll.mockResolvedValue([]); // Không bị trùng custom request item
            Product.findAll.mockResolvedValue([{ pk_product_id: 1, is_bundle: 1, bundle_items: "[1,2]" }]);

            await manufacturingOrderController.createOrder(mockReq, mockRes);

            expect(ManufacturingOrder.create).toHaveBeenCalled();
            expect(ManufacturingOrderItem.bulkCreate).toHaveBeenCalled();
            expect(CustomRequestItem.update).toHaveBeenCalled();
            expect(systemLogController.record).toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(201);
        });

        it("nên báo lỗi 400 nếu Custom Request Item đã được tạo phiếu nhập trước đó", async () => {
            mockReq.body = {
                items: [{ fk_custom_request_item_id: 10, quantity: 2 }]
            };

            ManufacturingOrder.count.mockResolvedValue(0);
            ManufacturingOrder.create.mockResolvedValue({ pk_manufacturing_order_id: 1 });
            ManufacturingOrderItem.findAll.mockResolvedValue([{ fk_custom_request_item_id: 10 }]); // Đã tồn tại

            await manufacturingOrderController.createOrder(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ message: "Một số sản phẩm từ yêu cầu khách hàng đã được tạo phiếu nhập trước đó." });
        });
    });

    describe("updateStatus()", () => {
        it("nên báo lỗi 404 nếu không tìm thấy phiếu", async () => {
            mockReq.params = { id: 99 };
            ManufacturingOrder.findByPk.mockResolvedValue(null);
            await manufacturingOrderController.updateStatus(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(404);
        });

        it("nên cập nhật trạng thái thành công", async () => {
            mockReq.params = { id: 1 };
            mockReq.body = { status: 2 };
            
            const mockUpdate = jest.fn();
            ManufacturingOrder.findByPk.mockResolvedValue({ order_code: "YCNH-1", update: mockUpdate });

            await manufacturingOrderController.updateStatus(mockReq, mockRes);

            expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ status: 2 }));
            expect(systemLogController.record).toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(200);
        });
    });
});
