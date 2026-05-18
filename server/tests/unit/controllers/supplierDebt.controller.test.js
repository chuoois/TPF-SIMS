const supplierDebtController = require("../../../src/controller/supplierDebt.controller");
const { Supplier, ManufacturingOrder, ImportReceipt, sequelize } = require("../../../src/entities");
const systemLogController = require("../../../src/controller/systemLog.controller");

jest.mock("../../../src/controller/systemLog.controller");
jest.mock("../../../src/entities", () => {
    const mockTransaction = { commit: jest.fn(), rollback: jest.fn(), finished: false };
    return {
        sequelize: {
            transaction: jest.fn(async () => mockTransaction)
        },
        Supplier: {
            findAndCountAll: jest.fn(),
            findByPk: jest.fn()
        },
        ManufacturingOrder: {
            findAll: jest.fn()
        },
        ImportReceipt: {
            findAll: jest.fn()
        }
    };
});

describe("SupplierDebtController Unit Tests", () => {
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

    describe("getAllSupplierDebts()", () => {
        it("nên lấy danh sách công nợ nhà cung cấp thành công", async () => {
            mockReq.query = { page: 1, limit: 10, search: "NCC" };
            Supplier.findAndCountAll.mockResolvedValue({
                count: 1,
                rows: [{ 
                    pk_supplier_id: 1, 
                    supplier_name: "NCC 1", 
                    note: JSON.stringify({ payments: [{ amount: 1000 }] }) 
                }]
            });
            ManufacturingOrder.findAll.mockResolvedValue([
                { pk_manufacturing_order_id: 10, deposit_amount: 500 }
            ]);
            ImportReceipt.findAll.mockResolvedValue([
                { total_amount: 2000 }
            ]);

            await supplierDebtController.getAllSupplierDebts(mockReq, mockRes);

            expect(Supplier.findAndCountAll).toHaveBeenCalled();
            expect(ManufacturingOrder.findAll).toHaveBeenCalled();
            expect(ImportReceipt.findAll).toHaveBeenCalled();
            
            expect(mockRes.status).toHaveBeenCalledWith(200);
            const responseData = mockRes.json.mock.calls[0][0].data;
            expect(responseData[0].totalImport).toBe(2000);
            expect(responseData[0].totalPaid).toBe(1500); // 500 deposit + 1000 payment
            expect(responseData[0].debt).toBe(500); // 2000 - 1500
        });

        it("nên xử lý không lỗi nếu note của supplier không phải JSON hợp lệ", async () => {
            Supplier.findAndCountAll.mockResolvedValue({
                count: 1,
                rows: [{ pk_supplier_id: 2, supplier_name: "NCC 2", note: "Just a text note" }]
            });
            ManufacturingOrder.findAll.mockResolvedValue([]);
            ImportReceipt.findAll.mockResolvedValue([]);

            await supplierDebtController.getAllSupplierDebts(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            const responseData = mockRes.json.mock.calls[0][0].data;
            expect(responseData[0].group).toBe("Just a text note");
        });

        it("nên trả về lỗi 500 nếu query thất bại", async () => {
            Supplier.findAndCountAll.mockRejectedValue(new Error("DB Error"));
            await supplierDebtController.getAllSupplierDebts(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(500);
        });
    });

    describe("getSupplierLedger()", () => {
        it("nên báo lỗi 404 nếu không tìm thấy nhà cung cấp", async () => {
            mockReq.params = { id: 99 };
            Supplier.findByPk.mockResolvedValue(null);

            await supplierDebtController.getSupplierLedger(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({ message: "Không tìm thấy nhà cung cấp" });
        });

        it("nên lấy sổ cái chi tiết thành công", async () => {
            mockReq.params = { id: 1 };
            Supplier.findByPk.mockResolvedValue({
                pk_supplier_id: 1,
                supplier_name: "NCC 1",
                note: JSON.stringify({ payments: [{ amount: 1000, date: "2026-05-10T10:00:00Z" }] })
            });

            ManufacturingOrder.findAll.mockResolvedValue([
                { pk_manufacturing_order_id: 1, order_code: "MO-1", deposit_amount: 500, createdate: "2026-05-01T10:00:00Z" }
            ]);

            ImportReceipt.findAll.mockResolvedValue([
                { pk_receipt_id: 1, receipt_code: "NK-1", total_amount: 2000, import_date: "2026-05-05" }
            ]);

            await supplierDebtController.getSupplierLedger(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            const resData = mockRes.json.mock.calls[0][0];
            expect(resData.ledger).toBeDefined();
            expect(resData.importHistory.length).toBe(1);
        });

        it("nên xử lý không lỗi nếu note của supplier không phải JSON", async () => {
            mockReq.params = { id: 1 };
            Supplier.findByPk.mockResolvedValue({ pk_supplier_id: 1, note: "Text" });
            ManufacturingOrder.findAll.mockResolvedValue([]);
            ImportReceipt.findAll.mockResolvedValue([]);

            await supplierDebtController.getSupplierLedger(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(200);
        });

        it("nên trả về lỗi 500 nếu query thất bại", async () => {
            mockReq.params = { id: 1 };
            Supplier.findByPk.mockRejectedValue(new Error("DB Error"));
            await supplierDebtController.getSupplierLedger(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(500);
        });
    });

    describe("addPayment()", () => {
        it("nên báo lỗi nếu số tiền <= 0", async () => {
            mockReq.params = { id: 1 };
            mockReq.body = { amount: 0 };
            
            await supplierDebtController.addPayment(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
        });

        it("nên báo lỗi 400 nếu không tìm thấy nhà cung cấp", async () => {
            mockReq.params = { id: 99 };
            mockReq.body = { amount: 1000 };
            Supplier.findByPk.mockResolvedValue(null);

            await supplierDebtController.addPayment(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
        });

        it("nên ghi nhận thanh toán thành công và cập nhật JSON trong note", async () => {
            mockReq.params = { id: 1 };
            mockReq.body = { amount: 2000, method: "Chuyển khoản", note: "Thanh toán đợt 1" };
            
            const mockUpdate = jest.fn();
            Supplier.findByPk.mockResolvedValue({
                pk_supplier_id: 1,
                supplier_name: "NCC 1",
                note: JSON.stringify({ group: "VIP", payments: [{ amount: 500 }] }),
                update: mockUpdate
            });

            await supplierDebtController.addPayment(mockReq, mockRes);

            expect(mockUpdate).toHaveBeenCalled();
            // Lấy object mà mockUpdate được gọi để kiểm tra string JSON
            const updateData = mockUpdate.mock.calls[0][0];
            const parsedNote = JSON.parse(updateData.note);
            expect(parsedNote.payments.length).toBe(2);
            expect(parsedNote.payments[1].amount).toBe(2000);
            
            expect(systemLogController.record).toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(200);
        });

        it("nên xử lý tạo JSON nếu note cũ là text hoặc null", async () => {
            mockReq.params = { id: 1 };
            mockReq.body = { amount: 2000 };
            
            const mockUpdate = jest.fn();
            Supplier.findByPk.mockResolvedValue({
                pk_supplier_id: 1,
                note: "Old text note",
                update: mockUpdate
            });

            await supplierDebtController.addPayment(mockReq, mockRes);
            const updateData = mockUpdate.mock.calls[0][0];
            const parsedNote = JSON.parse(updateData.note);
            expect(parsedNote.notes).toBe("Old text note");
            expect(parsedNote.payments.length).toBe(1);
        });
    });
});
