const express = require("express");
const router = express.Router();
const InventoryController = require("../controller/inventory.controller");
const { verifyAccessToken } = require("../middleware/auth.middleware");

/**
 * Inventory Routes - Quản lý Kho hàng cho Kế toán
 * Created Date: 2026-04-26
 */

// Yêu cầu đăng nhập
router.use(verifyAccessToken);

/**
 * @swagger
 * /api/inventory/product:
 *   get:
 *     summary: Lấy danh sách sản phẩm trong kho kèm chi tiết số lượng
 *     tags: [Inventory]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: typeFilter
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Danh sách sản phẩm trong kho
 */
router.get("/product", InventoryController.getInventoryProducts);

/**
 * @swagger
 * /api/inventory/product/{id}/items:
 *   get:
 *     summary: Lấy chi tiết từng đơn vị sản phẩm trong kho
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Danh sách các đơn vị sản phẩm được nhóm theo lô/phiếu nhập
 */
router.get("/product/:id/items", InventoryController.getProductItems);

module.exports = router;
