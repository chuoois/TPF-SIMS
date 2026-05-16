const express = require("express");
const router = express.Router();
const CustomerDebtController = require("../controller/customerDebt.controller");
const { verifyAccessToken, verifyRole } = require("../middlewares/auth.middleware");

/**
 * Customer Debt Routes
 * Quản lý công nợ khách hàng
 * Created By: Antigravity
 */

// Yêu cầu đăng nhập và quyền OWNER hoặc ACCOUNTANT (giả định có role này)
router.use(verifyAccessToken);
const accountantOrOwner = verifyRole(["OWNER", "ACCOUNTANT", "SALES"]); // Cho phép Sales xem công nợ nhưng có thể chặn quyền thu tiền
router.use(accountantOrOwner);

/**
 * @swagger
 * /api/customer-debt:
 *   get:
 *     summary: Lấy danh sách công nợ khách hàng
 *     tags: [CustomerDebt]
 */
router.get("/", CustomerDebtController.getAllCustomerDebts);

/**
 * @swagger
 * /api/customer-debt/{id}/payment:
 *   post:
 *     summary: Ghi nhận thanh toán đợt mới
 *     tags: [CustomerDebt]
 */
router.post("/:id/payment", CustomerDebtController.addPayment);

/**
 * @swagger
 * /api/customer-debt/{id}/history:
 *   get:
 *     summary: Lấy lịch sử thanh toán của một đơn hàng
 *     tags: [CustomerDebt]
 */
router.get("/:id/history", CustomerDebtController.getPaymentHistory);

module.exports = router;
