const { Op } = require("sequelize");

/**
 * Sinh danh sách "MM/YYYY" nằm trong khoảng [dateFrom, dateTo]
 * Dùng để lọc PayrollPeriod.period_month cho salary
 */
function getMonthsInRange(dateFrom, dateTo) {
    const months = [];
    const cursor = new Date(dateFrom.getFullYear(), dateFrom.getMonth(), 1);
    const end    = new Date(dateTo.getFullYear(), dateTo.getMonth(), 1);
    while (cursor <= end) {
        const mm = String(cursor.getMonth() + 1).padStart(2, "0");
        const yyyy = cursor.getFullYear();
        months.push(`${mm}/${yyyy}`);
        cursor.setMonth(cursor.getMonth() + 1);
    }
    return months;
}
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
    UserRole,
    ImportReceipt,
    SalaryRecord,
    SalaryAdjustment,
    PayrollPeriod,
    CustomerProfile,
    Employee
} = require("../entities");

/**
 * Tính khoảng thời gian cho Accountant Dashboard dựa trên các bộ lọc
 */
function getAccountantDateRange(query) {
    const { period = "month", selectedMonth, selectedQuarter, selectedYear, startDate, endDate } = query;
    let dateFrom = null;
    let dateTo = null;

    const now = new Date();
    // Quy đổi về timezone VN (UTC+7) để tính tháng/năm hiện tại
    const vnNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const yNow = vnNow.getUTCFullYear();
    const mNow = vnNow.getUTCMonth();

    // Helper: tạo ngày theo múi giờ VN (UTC+7)
    // VD: ngày 01/05/2026 00:00:00 VN = 30/04/2026 17:00:00 UTC
    const vnStart = (y, m, d = 1) => new Date(Date.UTC(y, m, d, -7, 0, 0));       // 00:00:00 VN
    const vnEnd   = (y, m, d)     => new Date(Date.UTC(y, m, d, 16, 59, 59, 999)); // 23:59:59 VN

    try {
        if (period === "custom" && startDate && endDate) {
            if (startDate > endDate) {
                // Fallback về tháng hiện tại nếu range không hợp lệ
                dateFrom = vnStart(yNow, mNow, 1);
                dateTo   = vnEnd(yNow, mNow + 1, 0);
            } else {
                // Lấy ngày cuối tháng của endDate
                const [ey, em, ed] = endDate.split("-").map(Number);
                const [sy, sm, sd] = startDate.split("-").map(Number);
                dateFrom = vnStart(sy, sm - 1, sd);
                dateTo   = vnEnd(ey, em - 1, ed);
            }
        } else if (period === "month" && selectedMonth) {
            // selectedMonth format: "MM/YYYY", ví dụ "05/2026"
            const [m, y] = selectedMonth.split("/");
            const mInt = parseInt(m);
            const yInt = parseInt(y);
            dateFrom = vnStart(yInt, mInt - 1, 1);
            // Ngày cuối tháng: tháng m+1 ngày 0 = ngày cuối tháng m
            dateTo   = vnEnd(yInt, mInt, 0);
        } else if (period === "quarter" && selectedQuarter) {
            // selectedQuarter format: "Q1/2026"
            const [q, y] = selectedQuarter.split("/");
            const quarter = parseInt(q.replace("Q", ""));
            const year = parseInt(y);
            const startMonth = (quarter - 1) * 3;   // 0-indexed: Q1=0, Q2=3, Q3=6, Q4=9
            const endMonth   = startMonth + 2;
            dateFrom = vnStart(year, startMonth, 1);
            dateTo   = vnEnd(year, endMonth + 1, 0); // ngày cuối tháng cuối quý
        } else if (period === "year" && selectedYear) {
            const y = parseInt(selectedYear);
            dateFrom = vnStart(y, 0, 1);         // 01/01/yyyy 00:00:00 VN
            dateTo   = vnEnd(y, 11, 31);         // 31/12/yyyy 23:59:59 VN
        } else {
            // Fallback mặc định: tháng hiện tại theo VN time
            dateFrom = vnStart(yNow, mNow, 1);
            dateTo   = vnEnd(yNow, mNow + 1, 0);
        }
    } catch (err) {
        console.error("Parse date range error:", err);
        dateFrom = vnStart(yNow, mNow, 1);
        dateTo   = vnEnd(yNow, mNow + 1, 0);
    }

    return { dateFrom, dateTo };
}

/**
 * Dashboard Controller - Tổng hợp dữ liệu cho Owner Dashboard
 * Created By: ThinhBui
 * Created Date: 15/05/2026
 */

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
                    product_type: "FINISHED",
                    min_stock: { [Op.gt]: 0 },
                    [Op.and]: [
                        sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM product_item
                            WHERE product_item.fk_product_id = Product.pk_product_id
                            AND product_item.item_status = 1
                            AND product_item.fk_order_item_id IS NULL
                        ) <= Product.min_stock`)
                    ]
                },
                attributes: [
                    "pk_product_id",
                    "sku",
                    "product_name",
                    "is_bundle",
                    "min_stock",
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
                        isBundle: plain.is_bundle === 1,
                        minStock: plain.min_stock || 0
                    };
                }),
                recentActivities: formattedActivities
            });
        } catch (error) {
            console.error("Get owner dashboard error:", error);
            return res.status(500).json({ message: "Lỗi hệ thống khi tải dữ liệu tổng quan" });
        }
    }

    /**
     * GET /api/dashboard/accountant
     * Trả về dữ liệu tổng quan tài chính cho Accountant Dashboard kèm các bộ lọc
     */
    async getAccountantDashboard(req, res) {
        try {
            const { orderType = "all", costType = "all" } = req.query;
            const { dateFrom, dateTo } = getAccountantDateRange(req.query);

            // 1. Điều kiện lọc Order
            const orderWhere = {
                status: 1,
                createdate: { [Op.gte]: dateFrom, [Op.lte]: dateTo }
            };
            if (orderType !== "all") {
                orderWhere.order_type = parseInt(orderType);
            }

            // 2. Thực hiện các truy vấn chính song song
            const [
                completedOrdersData,
                abnormalOrdersData,
                importReceiptsData,
                salaryRecordsData,
                mfgOrdersData
            ] = await Promise.all([
                // 2a. Đơn hàng hoàn thành (Doanh thu bán hàng)
                Order.findAll({
                    where: { ...orderWhere, order_status: 6 },
                    include: [{
                        model: CustomerProfile,
                        as: "customer",
                        attributes: ["full_name", "phone_number"]
                    }],
                    order: [["createdate", "DESC"]]
                }),

                // 2b. Đơn hàng hủy mất cọc (Doanh thu bất thường)
                // Lọc theo modifiedate (ngày hủy thực tế) để phản ánh đúng kỳ tài chính
                Order.findAll({
                    where: {
                        status: 1,
                        modifiedate: { [Op.gte]: dateFrom, [Op.lte]: dateTo },
                        order_status: 0,
                        deposit_resolution: "forfeited"
                    },
                    include: [{
                        model: CustomerProfile,
                        as: "customer",
                        attributes: ["full_name", "phone_number"]
                    }],
                    order: [["modifiedate", "DESC"]]
                }),

                // 2c. Phiếu nhập kho (Chi phí nhập hàng)
                ImportReceipt.findAll({
                    where: {
                        import_date: { [Op.gte]: dateFrom, [Op.lte]: dateTo }
                    },
                    order: [["import_date", "DESC"]]
                }),

                // 2d. Bản ghi lương nhân viên (Chi phí lương)
                // Filter qua PayrollPeriod.period_month ("MM/YYYY") thay vì createdate
                SalaryRecord.findAll({
                    include: [
                        {
                            model: SalaryAdjustment,
                            as: "adjustments"
                        },
                        {
                            model: Employee,
                            as: "employee",
                            include: [{
                                model: UserAccount,
                                as: "account",
                                include: [{
                                    model: UserProfile,
                                    as: "profile",
                                    attributes: ["full_name"]
                                }]
                            }]
                        },
                        {
                            model: PayrollPeriod,
                            as: "period",
                            where: {
                                period_month: { [Op.in]: getMonthsInRange(dateFrom, dateTo) }
                            },
                            attributes: ["period_month", "status"]
                        }
                    ],
                    order: [[{ model: PayrollPeriod, as: "period" }, "period_month", "DESC"]]
                }),

                // 2e. Lệnh sản xuất gửi xưởng (Dùng cho dòng tiền cọc xưởng)
                ManufacturingOrder.findAll({
                    where: {
                        createdate: { [Op.gte]: dateFrom, [Op.lte]: dateTo },
                        deposit_amount: { [Op.gt]: 0 }
                    }
                })
            ]);

            // 3. Truy vấn bổ sung cho Dòng tiền (Cọc khách vào & Hoàn cọc khách)
            const [customerDepositOrders, refundDepositOrders] = await Promise.all([
                // Cọc khách vào (Các đơn có cọc > 0)
                Order.findAll({
                    where: {
                        status: 1,
                        createdate: { [Op.gte]: dateFrom, [Op.lte]: dateTo },
                        deposit_amount: { [Op.gt]: 0 }
                    },
                    include: [{ model: CustomerProfile, as: "customer", attributes: ["full_name"] }]
                }),
                // Hoàn cọc khách (Đơn hủy, refunded)
                Order.findAll({
                    where: {
                        status: 1,
                        createdate: { [Op.gte]: dateFrom, [Op.lte]: dateTo },
                        order_status: 0,
                        deposit_resolution: "refunded",
                        deposit_amount: { [Op.gt]: 0 }
                    },
                    include: [{ model: CustomerProfile, as: "customer", attributes: ["full_name"] }]
                })
            ]);

            // ═══════════════════════════════════════════════════════════
            // XỬ LÝ SỐ LIỆU & FORMAT CHO FRONTEND
            // ═══════════════════════════════════════════════════════════

            // --- A. DOANH THU ---
            const completedOrders = completedOrdersData.map(o => ({
                id: o.pk_order_id,
                code: `DH-${o.pk_order_id}`,
                customer: o.customer?.full_name || "Khách lẻ",
                date: new Date(o.createdate).toLocaleDateString("vi-VN"),
                total_amount: parseFloat(o.total_amount) || 0
            }));
            const revenue = completedOrders.reduce((sum, o) => sum + o.total_amount, 0);

            // --- B. DOANH THU BẤT THƯỜNG ---
            const abnormalOrders = abnormalOrdersData.map(o => ({
                id: o.pk_order_id,
                order_code: `DH-${o.pk_order_id}`,
                customer: o.customer?.full_name || "Khách lẻ",
                date: new Date(o.createdate).toLocaleDateString("vi-VN"),
                reason: o.cancel_reason || "Hủy đơn - Khách chịu phạt cọc",
                deposit_kept: parseFloat(o.deposit_amount) || 0
            }));
            const abnormalRevenue = abnormalOrders.reduce((sum, o) => sum + o.deposit_kept, 0);

            // --- C. CHI PHÍ ---
            // Chi phí nhập hàng
            const importReceipts = importReceiptsData.map(r => ({
                id: r.pk_receipt_id,
                code: r.receipt_code,
                supplier: r.supplier_name || "Nhà cung cấp",
                date: new Date(r.import_date).toLocaleDateString("vi-VN"),
                amount: parseFloat(r.total_amount) || 0
            }));
            const importCost = (costType === "all" || costType === "import")
                ? importReceipts.reduce((sum, r) => sum + r.amount, 0)
                : 0;

            // Chi phí lương
            const salaryRecords = salaryRecordsData.map(s => {
                const baseSalary = (parseFloat(s.base_rate_snapshot) || 0) * (parseFloat(s.days_worked) || 0);
                const adjustmentsSum = (s.adjustments || []).reduce((sum, adj) => {
                    const amt = parseFloat(adj.amount) || 0;
                    return adj.type === "PENALTY" ? sum - amt : sum + amt;
                }, 0);
                const totalSalary = baseSalary + adjustmentsSum;

                return {
                    id: s.record_id,
                    employee: s.employee?.account?.profile?.full_name || s.employee?.full_name || `NV #${s.fk_employee_id}`,
                    baseSalary,
                    adjustmentsSum,
                    totalSalary: totalSalary > 0 ? totalSalary : 0
                };
            });
            const salaryCost = (costType === "all" || costType === "salary")
                ? salaryRecords.reduce((sum, s) => sum + s.totalSalary, 0)
                : 0;

            const totalCost = importCost + salaryCost;

            // --- D. LỢI NHUẬN ---
            const profit = revenue - totalCost + abnormalRevenue;

            // --- E. DÒNG TIỀN (CASH FLOWS) ---
            const cashFlows = [];
            // 1. Cọc khách vào
            customerDepositOrders.forEach(o => {
                cashFlows.push({
                    id: `cust-${o.pk_order_id}`,
                    date: new Date(o.createdate).toLocaleDateString("vi-VN"),
                    rawDate: new Date(o.createdate),
                    type: "CUSTOMER_DEPOSIT",
                    label: `Khách ${o.customer?.full_name || "lẻ"} đặt cọc đơn DH-${o.pk_order_id}`,
                    amount: parseFloat(o.deposit_amount) || 0
                });
            });
            // 2. Cọc xưởng ra
            mfgOrdersData.forEach(m => {
                cashFlows.push({
                    id: `mfg-${m.pk_manufacturing_order_id}`,
                    date: new Date(m.createdate).toLocaleDateString("vi-VN"),
                    rawDate: new Date(m.createdate),
                    type: "IMPORT_DEPOSIT",
                    label: `Đặt cọc lệnh sản xuất ${m.order_code}`,
                    amount: parseFloat(m.deposit_amount) || 0
                });
            });
            // 3. Hoàn cọc khách
            refundDepositOrders.forEach(o => {
                cashFlows.push({
                    id: `ref-${o.pk_order_id}`,
                    date: new Date(o.createdate).toLocaleDateString("vi-VN"),
                    rawDate: new Date(o.createdate),
                    type: "REFUND_DEPOSIT",
                    label: `Hoàn cọc cho khách ${o.customer?.full_name || "lẻ"} (DH-${o.pk_order_id})`,
                    amount: parseFloat(o.deposit_amount) || 0
                });
            });

            // Sort dòng tiền theo ngày mới nhất
            cashFlows.sort((a, b) => b.rawDate - a.rawDate);

            const customerIn = cashFlows.filter(c => c.type === "CUSTOMER_DEPOSIT").reduce((sum, c) => sum + c.amount, 0);
            const importOut = cashFlows.filter(c => c.type === "IMPORT_DEPOSIT").reduce((sum, c) => sum + c.amount, 0);
            const refundOut = cashFlows.filter(c => c.type === "REFUND_DEPOSIT").reduce((sum, c) => sum + c.amount, 0);
            const netCash = customerIn - importOut - refundOut;

            // ═══════════════════════════════════════════════════════════
            // TẠO DỮ LIỆU SO SÁNH 6 THÁNG GẦN NHẤT
            // ═══════════════════════════════════════════════════════════
            const now = new Date();
            const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

            const [allOrders6M, allImports6M, allSalaries6M] = await Promise.all([
                Order.findAll({
                    where: { status: 1, createdate: { [Op.gte]: sixMonthsAgo } },
                    attributes: ["pk_order_id", "total_amount", "deposit_amount", "order_status", "deposit_resolution", "createdate"],
                    raw: true
                }),
                ImportReceipt.findAll({
                    where: { import_date: { [Op.gte]: sixMonthsAgo } },
                    attributes: ["total_amount", "import_date"],
                    raw: true
                }),
                SalaryRecord.findAll({
                    include: [
                        { model: SalaryAdjustment, as: "adjustments", attributes: ["amount", "type"] },
                        {
                            model: PayrollPeriod,
                            as: "period",
                            where: {
                                period_month: { [Op.in]: getMonthsInRange(sixMonthsAgo, now) }
                            },
                            attributes: ["period_month"]
                        }
                    ]
                })
            ]);

            // Tạo danh sách 6 tháng (format MM/YYYY)
            const monthlyComparisons = [];
            for (let i = 5; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthStr = `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;

                // Filter data cho tháng này
                const mOrders = allOrders6M.filter(o => {
                    const oDate = new Date(o.createdate);
                    return oDate.getMonth() === d.getMonth() && oDate.getFullYear() === d.getFullYear();
                });
                const mImports = allImports6M.filter(imp => {
                    const impDate = new Date(imp.import_date);
                    return impDate.getMonth() === d.getMonth() && impDate.getFullYear() === d.getFullYear();
                });
                const mSalaries = allSalaries6M.filter(s => {
                    // Lọc theo period_month của kỳ lương ("MM/YYYY") thay vì createdate
                    const periodMonth = s.period?.period_month || s.period?.dataValues?.period_month || "";
                    return periodMonth === monthStr;
                });

                // Tính toán chỉ số tháng
                const mRev = mOrders.filter(o => o.order_status === 6).reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0);
                const mAbnormal = mOrders.filter(o => o.order_status === 0 && o.deposit_resolution === "forfeited").reduce((sum, o) => sum + (parseFloat(o.deposit_amount) || 0), 0);
                const mImpCost = mImports.reduce((sum, imp) => sum + (parseFloat(imp.total_amount) || 0), 0);

                const mSalCost = mSalaries.reduce((sum, s) => {
                    const base = (parseFloat(s.base_rate_snapshot) || 0) * (parseFloat(s.days_worked) || 0);
                    const adjSum = (s.adjustments || []).reduce((aSum, adj) => {
                        const amt = parseFloat(adj.amount) || 0;
                        return adj.type === "PENALTY" ? aSum - amt : aSum + amt;
                    }, 0);
                    const tot = base + adjSum;
                    return sum + (tot > 0 ? tot : 0);
                }, 0);

                const mTotCost = mImpCost + mSalCost;
                const mProfit = mRev - mTotCost + mAbnormal;

                monthlyComparisons.push({
                    month: monthStr,
                    revenue: mRev,
                    salaryCost: mSalCost,
                    importCost: mImpCost,
                    totalCost: mTotCost,
                    abnormal: mAbnormal,
                    profit: mProfit
                });
            }

            // Reverse để tháng mới nhất lên đầu bảng so sánh
            monthlyComparisons.reverse();

            // ═══════════════════════════════════════════════════════════
            // TRẢ VỀ KẾT QUẢ
            // ═══════════════════════════════════════════════════════════
            return res.status(200).json({
                summary: {
                    revenue,
                    importCost,
                    salaryCost,
                    totalCost,
                    abnormalRevenue,
                    profit,
                    customerIn,
                    importOut,
                    refundOut,
                    netCash
                },
                completedOrders,
                abnormalOrders,
                importReceipts,
                salaryRecords,
                cashFlows,
                monthlyComparisons
            });

        } catch (error) {
            console.error("Get accountant dashboard error:", error);
            return res.status(500).json({ message: "Lỗi hệ thống khi tải dữ liệu tổng quan tài chính" });
        }
    }
}

module.exports = new DashboardController();
