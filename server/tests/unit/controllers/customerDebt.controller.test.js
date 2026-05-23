const customerDebtController = require("../../../src/controller/customerDebt.controller");
const { Order, CustomerProfile, OrderHistory, sequelize } = require("../../../src/entities");
const systemLogController = require("../../../src/controller/systemLog.controller");

jest.mock("../../../src/controller/systemLog.controller");
jest.mock("../../../src/entities", () => {
    const mockTransaction = { commit: jest.fn(), rollback: jest.fn(), finished: false };
    return {
        sequelize: {
            transaction: jest.fn(async () => mockTransaction),
            literal: jest.fn(val => val)
        },
        Order: {
            findAndCountAll: jest.fn(),
            findByPk: jest.fn()
        },
        CustomerProfile: {},
        OrderHistory: {
            create: jest.fn(),
            findAll: jest.fn()
        }
    };
});

describe("CustomerDebtController Unit Tests", () => {
    let mockReq;
    let mockRes;

    beforeEach(() => {
        jest.clearAllMocks();
        mockReq = {
            query: {},
            params: {},
            body: {},
            user: { userId: 1, email: "test@test.com" }
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    describe("getAllCustomerDebts()", () => {
        it("nên lấy danh sách công nợ (DEBT) thành công", async () => {
            mockReq.query = { page: 1, limit: 10, status: "DEBT" };
            Order.findAndCountAll.mockResolvedValue({
                count: 1,
                rows: [{ pk_order_id: 1, total_amount: 5000, deposit_amount: 1000, received_amount: 0 }]
            });

            await customerDebtController.getAllCustomerDebts(mockReq, mockRes);

            expect(Order.findAndCountAll).toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.any(Array),
                pagination: expect.any(Object)
            }));
        });

        it("nên lấy danh sách đã thanh toán (SETTLED) thành công", async () => {
            mockReq.query = { page: 1, limit: 10, status: "SETTLED", search: "Nguyen" };
            Order.findAndCountAll.mockResolvedValue({
                count: 1,
                rows: [{ pk_order_id: 1, total_amount: 5000, deposit_amount: 5000, received_amount: 0 }]
            });

            await customerDebtController.getAllCustomerDebts(mockReq, mockRes);
            expect(Order.findAndCountAll).toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(200);
        });

        it("nên trả về lỗi 500 khi query DB thất bại", async () => {
            Order.findAndCountAll.mockRejectedValue(new Error("DB Error"));
            await customerDebtController.getAllCustomerDebts(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(500);
        });
    });

    describe("addPayment()", () => {
        it("nên báo lỗi nếu số tiền <= 0", async () => {
            mockReq.params = { id: 1 };
            mockReq.body = { amount: 0 };
            
            await customerDebtController.addPayment(mockReq, mockRes);
            
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ message: "Số tiền thanh toán phải lớn hơn 0" });
        });

        it("nên báo lỗi 400 nếu không tìm thấy đơn hàng", async () => {
            mockReq.params = { id: 99 };
            mockReq.body = { amount: 1000 };
            Order.findByPk.mockResolvedValue(null);

            await customerDebtController.addPayment(mockReq, mockRes);
            
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ message: "Không tìm thấy đơn hàng" });
        });

        it("nên ghi nhận thanh toán thành công", async () => {
            mockReq.params = { id: 1 };
            mockReq.body = { amount: 2000, method: "Chuyển khoản", note: "CK" };
            
            const mockUpdate = jest.fn();
            Order.findByPk.mockResolvedValue({
                pk_order_id: 1,
                deposit_amount: 1000,
                received_amount: 500,
                total_amount: 5000,
                update: mockUpdate
            });

            await customerDebtController.addPayment(mockReq, mockRes);

            expect(mockUpdate).toHaveBeenCalledWith(
                expect.objectContaining({ received_amount: 2500 }), 
                expect.any(Object)
            );
            expect(OrderHistory.create).toHaveBeenCalled();
            expect(systemLogController.record).toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                message: "Ghi nhận thanh toán thành công",
                received_amount: 2500
            }));
        });
    });

    describe("getPaymentHistory()", () => {
        it("nên lấy lịch sử thanh toán thành công", async () => {
            mockReq.params = { id: 1 };
            const noteObj = JSON.stringify({ display: "Đã thu", details: { amount: 2000, method: "Tiền mặt" } });
            OrderHistory.findAll.mockResolvedValue([
                { pk_order_history_id: 1, createdate: new Date(), note: noteObj, changed_by: 2 }
            ]);

            await customerDebtController.getPaymentHistory(mockReq, mockRes);

            expect(OrderHistory.findAll).toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(200);
            const responseData = mockRes.json.mock.calls[0][0].data;
            expect(responseData[0].amount).toBe(2000);
            expect(responseData[0].method).toBe("Tiền mặt");
        });

        it("nên xử lý không lỗi nếu note không phải JSON", async () => {
            mockReq.params = { id: 1 };
            OrderHistory.findAll.mockResolvedValue([
                { pk_order_history_id: 2, createdate: new Date(), note: "Normal text note", changed_by: 2 }
            ]);

            await customerDebtController.getPaymentHistory(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            const responseData = mockRes.json.mock.calls[0][0].data;
            expect(responseData[0].amount).toBe(0);
            expect(responseData[0].note).toBe("Normal text note");
        });

        it("nên bắt lỗi 500 nếu DB thất bại", async () => {
            OrderHistory.findAll.mockRejectedValue(new Error("DB Error"));
            await customerDebtController.getPaymentHistory(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(500);
        });
    });
});
