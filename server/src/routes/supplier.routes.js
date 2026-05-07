const express = require("express");
const router = express.Router();
const SupplierController = require("../controller/supplier.controller");
const { verifyAccessToken } = require("../middlewares/auth.middleware");

// Yêu cầu đăng nhập
router.use(verifyAccessToken);

/**
 * @swagger
 * /api/supplier:
 *   get:
 *     summary: Lấy danh sách nhà cung cấp
 *     tags: [Supplier]
 *     responses:
 *       200:
 *         description: Danh sách nhà cung cấp
 */
router.get("/", SupplierController.getAllSuppliers);

module.exports = router;
