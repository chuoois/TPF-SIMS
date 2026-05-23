const workerController = require("../../../src/controller/worker.controller");
const { Order, OrderItem, OrderItemProcessing, CustomerProfile, sequelize } = require("../../../src/entities");
const { sendNotification } = require("../../../src/sockets/socketManager");

jest.mock("../../../src/sockets/socketManager", () => ({
    sendNotification: jest.fn()
}));

jest.mock("../../../src/entities", () => {
    const mockTransaction = { commit: jest.fn(), rollback: jest.fn(), finished: false };
    return {
        sequelize: {
            transaction: jest.fn(async () => mockTransaction)
        },
        Order: { findAll: jest.fn() },
        OrderItem: { findByPk: jest.fn() },
        OrderItemProcessing: { findOne: jest.fn() },
        CustomerProfile: {}
    };
});

describe("WorkerController Unit Tests", () => {
    let mockReq;
    let mockRes;

    beforeEach(() => {
        jest.clearAllMocks();
        mockReq = {
            query: {},
            params: {},
            body: {},
            user: { userId: 2 } // role thợ hoặc owner tuỳ test
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    describe("getPendingTasks()", () => {
        it("nên lấy danh sách chờ hoặc đang gia công thành công", async () => {
            Order.findAll.mockResolvedValue([
                {
                    pk_order_id: 1,
                    order_type: 1,
                    createdate: new Date(),
                    customer: { full_name: "Nguyen Van A" },
                    items: [
                        {
                            pk_order_item_id: 10,
                            item_name: "Bàn gỗ",
                            item_size: '{"length": 100, "width": 50}',
                            processing: [
                                { processing_status: 1, quantity: 2, note: "Cẩn thận" }
                            ]
                        }
                    ]
                }
            ]);

            await workerController.getPendingTasks(mockReq, mockRes);
            expect(Order.findAll).toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(200);
            
            const data = mockRes.json.mock.calls[0][0].data;
            expect(data.length).toBe(1);
            expect(data[0].status).toBe("Chờ gia công");
            expect(data[0].items[0].size).toBe("100x50 cm");
            expect(data[0].items[0].status).toBe("Chờ gia công");
        });

        it("nên xử lý không lỗi khi order.items rỗng hoặc missing data", async () => {
            Order.findAll.mockResolvedValue([]);
            await workerController.getPendingTasks(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(200);
        });
    });

    describe("getCompletedTasks()", () => {
        it("nên lấy danh sách đã hoàn thành thành công", async () => {
            Order.findAll.mockResolvedValue([
                {
                    pk_order_id: 2,
                    order_type: 3,
                    createdate: new Date(),
                    customer: null,
                    items: [
                        {
                            pk_order_item_id: 20,
                            item_name: "Ghế",
                            processing: [
                                { processing_status: 4, quantity: 1 } // status 4 = hoàn thành
                            ]
                        }
                    ]
                }
            ]);

            await workerController.getCompletedTasks(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            
            const data = mockRes.json.mock.calls[0][0].data;
            expect(data.length).toBe(1);
            expect(data[0].status).toBe("Hoàn Thành");
        });
    });

    describe("startTask()", () => {
        it("nên báo lỗi 404 nếu không tìm thấy task chờ gia công", async () => {
            mockReq.params = { id: 10 };
            OrderItemProcessing.findOne.mockResolvedValue(null);
            
            await workerController.startTask(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({ message: "Không tìm thấy công việc đang chờ gia công" });
        });

        it("nên bắt đầu gia công thành công", async () => {
            mockReq.params = { id: 10 };
            const mockUpdate = jest.fn();
            OrderItemProcessing.findOne.mockResolvedValue({ pk_processing_id: 5, update: mockUpdate });

            await workerController.startTask(mockReq, mockRes);

            expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ processing_status: 2 }), expect.any(Object));
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Đã bắt đầu gia công" }));
        });
    });

    describe("completeTask()", () => {
        it("nên hoàn thành gia công và gửi ảnh thành công", async () => {
            mockReq.params = { id: 10 };
            mockReq.body = { finishedImages: ["url1", "url2"] };
            
            const mockUpdate = jest.fn();
            OrderItemProcessing.findOne.mockResolvedValue({ pk_processing_id: 5, update: mockUpdate });

            await workerController.completeTask(mockReq, mockRes);

            expect(mockUpdate).toHaveBeenCalledWith(
                expect.objectContaining({ processing_status: 3, finished_img: '["url1","url2"]' }), 
                expect.any(Object)
            );
            expect(mockRes.status).toHaveBeenCalledWith(200);
        });
    });

    describe("approveTask()", () => {
        it("nên duyệt task thành công và gửi notification cho thợ", async () => {
            mockReq.params = { id: 10 }; // owner đang duyệt
            const mockUpdate = jest.fn();
            
            OrderItemProcessing.findOne.mockResolvedValue({ 
                pk_processing_id: 5, 
                fk_user_account_id: 3, // Thợ
                update: mockUpdate 
            });
            OrderItem.findByPk.mockResolvedValue({ item_name: "Bàn", fk_order_id: 1 });

            await workerController.approveTask(mockReq, mockRes);

            expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ processing_status: 4 }), expect.any(Object));
            expect(sendNotification).toHaveBeenCalledWith(expect.objectContaining({
                userId: 3,
                title: "Chủ xưởng đã duyệt sản phẩm"
            }));
            expect(mockRes.status).toHaveBeenCalledWith(200);
        });
    });

    describe("rejectTask()", () => {
        it("nên từ chối task thành công và gửi notification cho thợ làm lại", async () => {
            mockReq.params = { id: 10 }; 
            mockReq.body = { reason: "Sai màu" };
            const mockUpdate = jest.fn();
            
            OrderItemProcessing.findOne.mockResolvedValue({ 
                pk_processing_id: 5, 
                fk_user_account_id: 3, 
                update: mockUpdate 
            });
            OrderItem.findByPk.mockResolvedValue({ item_name: "Ghế", fk_order_id: 2 });

            await workerController.rejectTask(mockReq, mockRes);

            expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ 
                processing_status: 2, 
                note: "Sai màu", 
                finished_img: null 
            }), expect.any(Object));
            
            expect(sendNotification).toHaveBeenCalledWith(expect.objectContaining({
                userId: 3,
                type: "WARNING"
            }));
            expect(mockRes.status).toHaveBeenCalledWith(200);
        });
    });
});
