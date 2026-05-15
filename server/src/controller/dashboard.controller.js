const { Op } = require("sequelize");
const {
    sequelize,
    Order,
    OrderItem,
    OrderItemProcessing,
    Product,
    ProductItem,
    CustomRequest,
    ManufacturingOrder,
    SystemLog,
    UserAccount,
    UserProfile,
    UserRole
} = require("../entities");

/**
 * Dashboard Controller - Tổng hợp dữ liệu cho Owner Dashboard
 * Created By: ThinhBui
 * Created Date: 15/05/2026
 */

const LOW_STOCK_THRESHOLD = 5;

/**
 * Tính khoảng thời gian dựa trên period
 * @param {string} period - today | week | month | year | all
 * @returns {{ dateFrom: Date, dateTo: Date } | null}
 */
function getDateRange(period) {
    const now = new Date();
    // Chuyển về timezone VN (UTC+7)
    const vnNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const year = vnNow.getUTCFullYear();
    const month = vnNow.getUTCMonth();
    const date = vnNow.getUTCDate();
    const day = vnNow.getUTCDay(); // 0=CN, 1=T2,...

    let dateFrom, dateTo;

    switch (period) {
        case "today":
            // Hôm nay: 00:00:00 → 23:59:59 (VN)
            dateFrom = new Date(Date.UTC(year, month, date, -7, 0, 0));
            dateTo = new Date(Date.UTC(year, month, date, 16, 59, 59, 999));
            break;

        case "week":
            // Tuần này (T2 → CN)
            const mondayOffset = day === 0 ? 6 : day - 1;
            dateFrom = new Date(Date.UTC(year, month, date - mondayOffset, -7, 0, 0));
            dateTo = new Date(Date.UTC(year, month, date, 16, 59, 59, 999));
            break;

        case "month":
            // Tháng này
            dateFrom = new Date(Date.UTC(year, month, 1, -7, 0, 0));
            dateTo = new Date(Date.UTC(year, month, date, 16, 59, 59, 999));
            break;

        case "year":
            // Năm này
            dateFrom = new Date(Date.UTC(year, 0, 1, -7, 0, 0));
            dateTo = new Date(Date.UTC(year, month, date, 16, 59, 59, 999));
            break;

        default:
            // "all" hoặc không truyền → không lọc
            return null;
    }

    return { dateFrom, dateTo };
}

class DashboardController {
    /**
     * GET /api/dashboard/owner?period=today|week|month|year|all
     * Trả về toàn bộ dữ liệu cần thiết cho trang Tổng quan Điều hành
     */
    async getOwnerDashboard(req, res) {
        try {
            const { period = "month" } = req.query;
            const dateRange = getDateRange(period);

            // Điều kiện lọc ngày cho Order
            const orderDateWhere = dateRange
                ? { createdate: { [Op.gte]: dateRange.dateFrom, [Op.lte]: dateRange.dateTo } }
                : {};

            // Điều kiện lọc ngày cho SystemLog
            const logDateWhere = dateRange
                ? { createdate: { [Op.gte]: dateRange.dateFrom, [Op.lte]: dateRange.dateTo } }
                : {};

            // Điều kiện lọc ngày cho ManufacturingOrder
            const mfgDateWhere = dateRange
                ? { createdate: { [Op.gte]: dateRange.dateFrom, [Op.lte]: dateRange.dateTo } }
                : {};

            // ═══════════════════════════════════════════════════════════
            // SECTION 1: Cảnh báo "Cần xử lý ngay" (Luôn lấy trạng thái hiện tại, không lọc ngày)
            // ═══════════════════════════════════════════════════════════

            // 1a. Số sản phẩm chờ nghiệm thu (processing_status = 3: Gửi Nghiệm Thu)
            const itemsToApprove = await OrderItemProcessing.count({
                where: { processing_status: 3 }
            });

            // 1b. Số sản phẩm sắp hết kho (dùng subquery đếm chính xác từ product_item)
            const lowStockLiteral = sequelize.literal(`(
                SELECT COUNT(*)
                FROM product_item
                WHERE product_item.fk_product_id = Product.pk_product_id
                AND product_item.item_status = 1
                AND product_item.fk_order_item_id IS NULL
            )`);

            const lowStockProducts = await Product.findAll({
                where: {
                    product_status: 1,
                    is_gift: { [Op.or]: [0, null] },
                    [Op.and]: [
                        sequelize.where(lowStockLiteral, { [Op.lte]: LOW_STOCK_THRESHOLD })
                    ]
                },
                attributes: [
                    "pk_product_id",
                    "sku",
                    "product_name",
                    "is_bundle",
                    [lowStockLiteral, "available_stock"]
                ],
                order: [[lowStockLiteral, "ASC"]],
                limit: 10
            });

            // 1c. Yêu cầu khách hàng mới chờ xử lý (status = 1: Pending)
            const pendingRequests = await CustomRequest.count({
                where: { status: 1 }
            });

            // ═══════════════════════════════════════════════════════════
            // SECTION 2: Tiến độ xưởng (Pipeline) — Lọc theo ngày tạo
            // ═══════════════════════════════════════════════════════════

            // 2a. Đếm ManufacturingOrder theo status
            const mfgStatusCounts = await ManufacturingOrder.findAll({
                where: { ...mfgDateWhere },
                attributes: [
                    "status",
                    [sequelize.fn("COUNT", sequelize.col("pk_manufacturing_order_id")), "count"]
                ],
                group: ["status"],
                raw: true
            });

            const mfgPipeline = {};
            mfgStatusCounts.forEach(row => {
                mfgPipeline[row.status] = parseInt(row.count);
            });

            // 2b. Đếm OrderItemProcessing theo processing_status
            const processingWhere = dateRange
                ? { createdate: { [Op.gte]: dateRange.dateFrom, [Op.lte]: dateRange.dateTo } }
                : {};

            const processingCounts = await OrderItemProcessing.findAll({
                where: { ...processingWhere },
                attributes: [
                    "processing_status",
                    [sequelize.fn("COUNT", sequelize.col("pk_processing_id")), "count"]
                ],
                group: ["processing_status"],
                raw: true
            });

            const processingPipeline = {};
            processingCounts.forEach(row => {
                processingPipeline[row.processing_status] = parseInt(row.count);
            });

            // ═══════════════════════════════════════════════════════════
            // SECTION 3: Sản phẩm bán chạy (Top 5 theo doanh thu) — Lọc theo ngày tạo đơn
            // ═══════════════════════════════════════════════════════════

            const topProducts = await OrderItem.findAll({
                attributes: [
                    "item_name",
                    [sequelize.fn("SUM", sequelize.col("item_quantity")), "qty"],
                    [sequelize.fn("SUM",
                        sequelize.literal("item_quantity * item_price")
                    ), "revenue"]
                ],
                include: [{
                    model: Order,
                    as: "order",
                    attributes: [],
                    where: {
                        status: 1,
                        order_status: { [Op.notIn]: [0, 7] },
                        ...orderDateWhere
                    }
                }],
                where: { status: 1 },
                group: ["item_name"],
                order: [[sequelize.literal("revenue"), "DESC"]],
                limit: 5,
                raw: true,
                subQuery: false
            });

            // ═══════════════════════════════════════════════════════════
            // SECTION 4: Nhật ký hoạt động gần đây — Lọc theo ngày
            // ═══════════════════════════════════════════════════════════

            const recentActivities = await SystemLog.findAll({
                where: { ...logDateWhere },
                include: [{
                    model: UserAccount,
                    as: "account",
                    attributes: ["email"],
                    include: [
                        { model: UserProfile, as: "profile", attributes: ["full_name"] },
                        { model: UserRole, as: "role", attributes: ["role_name", "role_code"] }
                    ]
                }],
                order: [["createdate", "DESC"]],
                limit: 20,
                raw: false
            });

            // Format activities cho frontend
            const formattedActivities = recentActivities.map(log => {
                const plain = log.toJSON();
                return {
                    id: plain.system_log_id,
                    user: plain.account?.profile?.full_name || plain.account?.email || "Hệ thống",
                    action: plain.action,
                    detail: plain.detail,
                    time: plain.createdate,
                    level: plain.level,
                    role: plain.account?.role?.role_code || null
                };
            });

            // ═══════════════════════════════════════════════════════════
            // Response
            // ═══════════════════════════════════════════════════════════

            return res.status(200).json({
                period,
                dateRange: dateRange
                    ? { from: dateRange.dateFrom, to: dateRange.dateTo }
                    : null,
                alerts: {
                    itemsToApprove,
                    lowStockCount: lowStockProducts.length,
                    pendingRequests
                },
                pipeline: {
                    manufacturing: mfgPipeline,
                    processing: processingPipeline
                },
                topProducts: topProducts.map(p => ({
                    name: p.item_name || "Không xác định",
                    qty: parseInt(p.qty) || 0,
                    revenue: parseFloat(p.revenue) || 0
                })),
                lowStockProducts: lowStockProducts.map(p => {
                    const plain = p.toJSON();
                    return {
                        id: plain.pk_product_id,
                        sku: plain.sku,
                        name: plain.product_name,
                        currentStock: parseInt(plain.available_stock) || 0,
                        isBundle: plain.is_bundle === 1
                    };
                }),
                recentActivities: formattedActivities
            });
        } catch (error) {
            console.error("Get owner dashboard error:", error);
            return res.status(500).json({ message: "Lỗi hệ thống khi tải dữ liệu tổng quan" });
        }
    }
}

module.exports = new DashboardController();
