const express = require("express");
const router = express.Router();
const SupplierDebtController = require("../controller/supplierDebt.controller");
const { verifyAccessToken, verifyRole } = require("../middlewares/auth.middleware");

/**
 * Supplier Debt Routes - Quản lý công nợ nhà cung cấp/xưởng
 * Created By: Antigravity
 * Created Date: 17/05/2026
 */

router.use(verifyAccessToken);
const accountantOrOwner = verifyRole(["OWNER", "ACCOUNTANT"]);
router.use(accountantOrOwner);

/**
 * @swagger
 * /api/supplier-debt:
 *   get:
 *     summary: Lấy danh sách công nợ tất cả nhà cung cấp
 *     tags: [SupplierDebt]
 */
router.get("/", SupplierDebtController.getAllSupplierDebts);

/**
 * @swagger
 * /api/supplier-debt/{id}/ledger:
 *   get:
 *     summary: Lấy sổ công nợ chi tiết (Ledger) của nhà cung cấp
 *     tags: [SupplierDebt]
 */
router.get("/:id/ledger", SupplierDebtController.getSupplierLedger);

/**
 * @swagger
 * /api/supplier-debt/{id}/payment:
 *   post:
 *     summary: Ghi nhận đợt thanh toán mới cho nhà cung cấp
 *     tags: [SupplierDebt]
 */
router.post("/:id/payment", SupplierDebtController.addPayment);

module.exports = router;
