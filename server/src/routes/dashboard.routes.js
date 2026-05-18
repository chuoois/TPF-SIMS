const express = require("express");
const router = express.Router();
const DashboardController = require("../controller/dashboard.controller");
const { verifyAccessToken, verifyRole } = require("../middlewares/auth.middleware");

/**
 * Dashboard Routes - Tổng quan điều hành
 * Created By: ThinhBui
 * Created Date: 15/05/2026
 */

// Yêu cầu đăng nhập
router.use(verifyAccessToken);

// Chỉ Owner/Admin mới xem được dashboard tổng quan
const ownerOnly = verifyRole(["OWNER", "ADMIN"]);

/**
 * @swagger
 * /api/dashboard/owner:
 *   get:
 *     summary: Lấy dữ liệu tổng quan cho Owner Dashboard
 *     description: |
 *       Trả về toàn bộ dữ liệu cần thiết cho trang Tổng quan Điều hành, bao gồm:
 *       - Cảnh báo: Nghiệm thu xưởng, Hàng sắp hết kho, Yêu cầu khách hàng mới
 *       - Tiến độ xưởng: ManufacturingOrder status + OrderItemProcessing pipeline
 *       - Top 5 sản phẩm bán chạy nhất (theo doanh thu)
 *       - Danh sách sản phẩm sắp hết kho
 *       - Nhật ký hoạt động gần đây (15 log mới nhất)
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Dữ liệu dashboard tổng quan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 alerts:
 *                   type: object
 *                   properties:
 *                     itemsToApprove:
 *                       type: integer
 *                       description: "Số sản phẩm chờ nghiệm thu"
 *                     lowStockCount:
 *                       type: integer
 *                       description: "Số sản phẩm sắp hết kho"
 *                     pendingRequests:
 *                       type: integer
 *                       description: "Số yêu cầu khách hàng đang chờ"
 *                 pipeline:
 *                   type: object
 *                   properties:
 *                     manufacturing:
 *                       type: object
 *                       description: "Đếm ManufacturingOrder theo status"
 *                     processing:
 *                       type: object
 *                       description: "Đếm OrderItemProcessing theo processing_status"
 *                 topProducts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       qty:
 *                         type: integer
 *                       revenue:
 *                         type: number
 *                 lowStockProducts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       sku:
 *                         type: string
 *                       name:
 *                         type: string
 *                       currentStock:
 *                         type: integer
 *                 recentActivities:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       user:
 *                         type: string
 *                       action:
 *                         type: string
 *                       detail:
 *                         type: string
 *                       time:
 *                         type: string
 *                         format: date-time
 *                       level:
 *                         type: string
 *       500:
 *         description: Lỗi hệ thống
 */
router.get("/owner", ownerOnly, DashboardController.getOwnerDashboard);

/**
 * @swagger
 * /api/dashboard/accountant:
 *   get:
 *     summary: Lấy dữ liệu tổng quan tài chính cho Accountant Dashboard
 *     description: |
 *       Trả về toàn bộ số liệu tổng quan tài chính, doanh thu, chi phí, dòng tiền, doanh thu bất thường
 *       kèm hỗ trợ bộ lọc thời gian (month, quarter, year, custom), loại đơn hàng và loại chi phí.
 *     tags: [Dashboard]
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *         description: month | quarter | year | custom
 *       - in: query
 *         name: selectedMonth
 *         schema:
 *           type: string
 *         description: MM/YYYY (ví dụ 05/2026)
 *       - in: query
 *         name: selectedQuarter
 *         schema:
 *           type: string
 *         description: Q1/2026
 *       - in: query
 *         name: selectedYear
 *         schema:
 *           type: string
 *         description: 2026
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *         description: YYYY-MM-DD
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *         description: YYYY-MM-DD
 *       - in: query
 *         name: orderType
 *         schema:
 *           type: string
 *         description: all | 1 | 2 | 3
 *       - in: query
 *         name: costType
 *         schema:
 *           type: string
 *         description: all | import | salary
 *     responses:
 *       200:
 *         description: Dữ liệu dashboard tài chính kế toán
 *       500:
 *         description: Lỗi hệ thống
 */
const accountantOrAdmin = verifyRole(["ACCOUNTANT", "ADMIN", "OWNER"]);
router.get("/accountant", accountantOrAdmin, DashboardController.getAccountantDashboard);

module.exports = router;
