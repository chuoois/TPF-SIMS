const dashboardController = require("../../../src/controller/dashboard.controller");
const { 
    Order, OrderItem, OrderItemProcessing, Product, CustomRequest, 
    ManufacturingOrder, SystemLog, sequelize 
} = require("../../../src/entities");

jest.mock("../../../src/entities", () => {
    return {
        sequelize: {
            literal: jest.fn(val => val),
            fn: jest.fn((name, col) => `${name}(${col})`),
            col: jest.fn(val => val),
            where: jest.fn(() => ({}))
        },
        Order: {},
        OrderItem: { findAll: jest.fn() },
        OrderItemProcessing: { count: jest.fn(), findAll: jest.fn() },
        Product: { findAll: jest.fn() },
        ProductItem: {},
        CustomRequest: { count: jest.fn() },
        ManufacturingOrder: { findAll: jest.fn() },
        SystemLog: { findAll: jest.fn() },
        UserAccount: {},
        UserProfile: {},
        UserRole: {}
    };
});

describe("DashboardController Unit Tests", () => {
    let mockReq;
    let mockRes;

    beforeEach(() => {
        jest.clearAllMocks();
        mockReq = {
            query: {}
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    describe("getOwnerDashboard()", () => {
        it("nên lấy dữ liệu dashboard thành công với period mặc định (month)", async () => {
            OrderItemProcessing.count.mockResolvedValue(5);
            Product.findAll.mockResolvedValue([
                { toJSON: () => ({ pk_product_id: 1, sku: "P1", product_name: "Product 1", available_stock: 2, is_bundle: 0 }) }
            ]);
            CustomRequest.count.mockResolvedValue(3);
            
            ManufacturingOrder.findAll.mockResolvedValue([
                { status: 1, count: 2 },
                { status: 2, count: 3 }
            ]);
            
            OrderItemProcessing.findAll.mockResolvedValue([
                { processing_status: 1, count: 4 }
            ]);

            OrderItem.findAll.mockResolvedValue([
                { item_name: "Item 1", qty: 10, revenue: 10000 }
            ]);

            SystemLog.findAll.mockResolvedValue([
                { toJSON: () => ({ system_log_id: 1, action: "LOGIN", account: { email: "admin@test.com" } }) }
            ]);

            await dashboardController.getOwnerDashboard(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            const resData = mockRes.json.mock.calls[0][0];
            
            expect(resData.period).toBe("month");
            expect(resData.alerts.itemsToApprove).toBe(5);
            expect(resData.alerts.pendingRequests).toBe(3);
            expect(resData.alerts.lowStockCount).toBe(1);
            expect(resData.pipeline.manufacturing[1]).toBe(2);
            expect(resData.pipeline.processing[1]).toBe(4);
            expect(resData.topProducts.length).toBe(1);
            expect(resData.topProducts[0].revenue).toBe(10000);
            expect(resData.recentActivities.length).toBe(1);
        });

        it("nên hỗ trợ period là 'today'", async () => {
            mockReq.query = { period: "today" };
            OrderItemProcessing.count.mockResolvedValue(0);
            Product.findAll.mockResolvedValue([]);
            CustomRequest.count.mockResolvedValue(0);
            ManufacturingOrder.findAll.mockResolvedValue([]);
            OrderItemProcessing.findAll.mockResolvedValue([]);
            OrderItem.findAll.mockResolvedValue([]);
            SystemLog.findAll.mockResolvedValue([]);

            await dashboardController.getOwnerDashboard(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            const resData = mockRes.json.mock.calls[0][0];
            expect(resData.period).toBe("today");
            expect(resData.dateRange).not.toBeNull();
        });

        it("nên hỗ trợ period là 'all' không giới hạn thời gian", async () => {
            mockReq.query = { period: "all" };
            OrderItemProcessing.count.mockResolvedValue(0);
            Product.findAll.mockResolvedValue([]);
            CustomRequest.count.mockResolvedValue(0);
            ManufacturingOrder.findAll.mockResolvedValue([]);
            OrderItemProcessing.findAll.mockResolvedValue([]);
            OrderItem.findAll.mockResolvedValue([]);
            SystemLog.findAll.mockResolvedValue([]);

            await dashboardController.getOwnerDashboard(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            const resData = mockRes.json.mock.calls[0][0];
            expect(resData.period).toBe("all");
            expect(resData.dateRange).toBeNull();
        });

        it("nên trả về lỗi 500 nếu query DB thất bại", async () => {
            OrderItemProcessing.count.mockRejectedValue(new Error("DB Error"));
            await dashboardController.getOwnerDashboard(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(500);
        });
    });
});
