const importController = require("../../../src/controller/import.controller");
const { 
    ImportReceipt, ProductItem, Product, ProductCategory, ProductColor, 
    ProductMaterial, ManufacturingOrder, ManufacturingOrderItem, Supplier, sequelize 
} = require("../../../src/entities");

jest.mock("../../../src/entities", () => {
    const mockTransaction = { commit: jest.fn(), rollback: jest.fn(), finished: false };
    return {
        sequelize: {
            transaction: jest.fn(async () => mockTransaction),
            literal: jest.fn(val => val)
        },
        ImportReceipt: { count: jest.fn(), create: jest.fn(), findAndCountAll: jest.fn(), findByPk: jest.fn() },
        ProductItem: { create: jest.fn(), findAll: jest.fn() },
        Product: { findOne: jest.fn(), findByPk: jest.fn(), findOrCreate: jest.fn() },
        ProductCategory: { findOne: jest.fn(), findOrCreate: jest.fn() },
        ProductColor: { findOne: jest.fn() },
        ProductMaterial: { findOne: jest.fn() },
        ManufacturingOrder: { findAll: jest.fn(), update: jest.fn() },
        ManufacturingOrderItem: {},
        Supplier: {}
    };
});

describe("ImportController Unit Tests", () => {
    let mockReq;
    let mockRes;

    beforeEach(() => {
        jest.clearAllMocks();
        mockReq = {
            query: {},
            params: {},
            body: {}
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    describe("getImportRequests()", () => {
        it("nên lấy danh sách chờ nhập kho thành công", async () => {
            mockReq.query = { search: "YCNH" };
            ManufacturingOrder.findAll.mockResolvedValue([
                {
                    toJSON: () => ({
                        pk_manufacturing_order_id: 1,
                        order_code: "YCNH-1",
                        createdate: new Date(),
                        supplier: { supplier_name: "NCC 1" },
                        status: 1,
                        items: [
                            {
                                pk_manufacturing_order_item_id: 1,
                                fk_product_id: 1,
                                item_name: "Item 1",
                                quantity: 10,
                                import_price: 100,
                                item_is_bundle: 0
                            }
                        ]
                    })
                }
            ]);

            await importController.getImportRequests(mockReq, mockRes);
            expect(ManufacturingOrder.findAll).toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(200);
            
            const data = mockRes.json.mock.calls[0][0].data;
            expect(data.length).toBe(1);
            expect(data[0].items[0].requestedQty).toBe(10);
        });

        it("nên bắt lỗi 500 nếu lấy danh sách thất bại", async () => {
            ManufacturingOrder.findAll.mockRejectedValue(new Error("DB Error"));
            await importController.getImportRequests(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(500);
        });
    });

    describe("createImportReceipt()", () => {
        it("nên báo lỗi nếu không có importDate", async () => {
            mockReq.body = { lines: [{}] };
            await importController.createImportReceipt(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ message: "Vui lòng chọn ngày nhập" });
        });

        it("nên báo lỗi nếu không có lines", async () => {
            mockReq.body = { importDate: "2026-05-18", lines: [] };
            await importController.createImportReceipt(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ message: "Phiếu nhập cần có ít nhất 1 mặt hàng" });
        });

        it("nên tạo phiếu nhập thành công (sản phẩm lẻ)", async () => {
            mockReq.body = {
                importDate: "2026-05-18",
                manufacturingOrderId: 1,
                lines: [
                    {
                        isBundle: false,
                        qty: 2,
                        importPrice: 100,
                        productCode: "SP-1",
                        productName: "Sản phẩm 1"
                    }
                ]
            };

            ImportReceipt.count.mockResolvedValue(0);
            const mockReceiptUpdate = jest.fn();
            ImportReceipt.create.mockResolvedValue({ pk_receipt_id: 1, update: mockReceiptUpdate });
            Product.findOne.mockResolvedValue({ pk_product_id: 10 });
            ProductItem.create.mockResolvedValue({});

            await importController.createImportReceipt(mockReq, mockRes);

            expect(ImportReceipt.create).toHaveBeenCalled();
            expect(ProductItem.create).toHaveBeenCalledTimes(2); // qty = 2
            expect(mockReceiptUpdate).toHaveBeenCalledWith(
                expect.objectContaining({ total_amount: 200, total_qty: 2 }),
                expect.any(Object)
            );
            expect(ManufacturingOrder.update).toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(201);
        });

        it("nên tạo phiếu nhập thành công (sản phẩm bộ - bundle) và tự tạo Product mới", async () => {
            mockReq.body = {
                importDate: "2026-05-18",
                lines: [
                    {
                        isBundle: true,
                        bundleQty: 1,
                        bundlePrice: 500,
                        bundleName: "Bộ SP 1"
                    }
                ]
            };

            ImportReceipt.count.mockResolvedValue(0);
            const mockReceiptUpdate = jest.fn();
            ImportReceipt.create.mockResolvedValue({ pk_receipt_id: 2, update: mockReceiptUpdate });
            Product.findOne.mockResolvedValue(null);
            Product.findByPk.mockResolvedValue(null);
            ProductCategory.findOne.mockResolvedValue(null);
            ProductCategory.findOrCreate.mockResolvedValue([{ pk_product_category_id: 99 }]);
            Product.findOrCreate.mockResolvedValue([{ pk_product_id: 20 }]);
            ProductItem.create.mockResolvedValue({});

            await importController.createImportReceipt(mockReq, mockRes);

            expect(Product.findOrCreate).toHaveBeenCalled(); // Nên gọi tạo mới
            expect(ProductItem.create).toHaveBeenCalledTimes(1); // bundleQty = 1
            expect(mockRes.status).toHaveBeenCalledWith(201);
        });
    });

    describe("getImportReceipts()", () => {
        it("nên lấy danh sách phiếu nhập thành công", async () => {
            mockReq.query = { page: 1, limit: 10, search: "NK", date: "2026-05-18" };
            ImportReceipt.findAndCountAll.mockResolvedValue({
                count: 1,
                rows: [
                    { toJSON: () => ({ pk_receipt_id: 1, receipt_code: "NK-1", total_amount: 1000, total_qty: 5 }) }
                ]
            });
            ProductItem.findAll.mockResolvedValue([
                { toJSON: () => ({ batch_code: "NK-1", item_name: "Sản phẩm A", product: { product_name: "Sản phẩm A gốc" } }) }
            ]);

            await importController.getImportReceipts(mockReq, mockRes);
            
            expect(ImportReceipt.findAndCountAll).toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(200);
            const data = mockRes.json.mock.calls[0][0].data;
            expect(data[0].product).toBe("Sản phẩm A gốc");
        });
    });

    describe("getImportReceiptDetail()", () => {
        it("nên báo lỗi 404 nếu không thấy phiếu nhập", async () => {
            mockReq.params = { id: 99 };
            ImportReceipt.findByPk.mockResolvedValue(null);
            await importController.getImportReceiptDetail(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(404);
        });

        it("nên lấy chi tiết phiếu nhập thành công và nhóm sản phẩm", async () => {
            mockReq.params = { id: 1 };
            ImportReceipt.findByPk.mockResolvedValue({
                toJSON: () => ({ pk_receipt_id: 1, receipt_code: "NK-1", total_amount: 1000 })
            });
            ProductItem.findAll.mockResolvedValue([
                { toJSON: () => ({ fk_product_id: 10, item_serial: "U1", cost_price: 100, product: { sku: "SP-1", product_name: "SP 1" } }) },
                { toJSON: () => ({ fk_product_id: 10, item_serial: "U2", cost_price: 100, product: { sku: "SP-1", product_name: "SP 1" } }) }
            ]);

            await importController.getImportReceiptDetail(mockReq, mockRes);
            
            expect(mockRes.status).toHaveBeenCalledWith(200);
            const data = mockRes.json.mock.calls[0][0];
            expect(data.lines.length).toBe(1); // 2 unit U1, U2 được gom lại thành 1 line
            expect(data.lines[0].qty).toBe(2);
        });
    });
});
