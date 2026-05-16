const express = require("express");
const router = express.Router();
const InventoryController = require("../controller/inventory.controller");
const { verifyAccessToken } = require("../middlewares/auth.middleware");

/**
 * Inventory Routes - Quản lý Kho hàng cho Kế toán
 * Created By: Hieunm
 * Created Date: 2026-04-26
 */

// Yêu cầu đăng nhập
router.use(verifyAccessToken);

/**
 * @swagger
 * /api/inventory/dashboard:
 *   get:
 *     summary: Lấy thống kê tổng quan kho hàng (KPI, cảnh báo, nhập gần đây)
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thống kê tổng quan kho hàng
 */
router.get("/dashboard", InventoryController.getDashboardStats);

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

/**
 * @swagger
 * /api/inventory/item/{itemSerial}/status:
 *   patch:
 *     summary: Cập nhật trạng thái một đơn vị sản phẩm (báo lỗi/bỏ báo lỗi)
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: itemSerial
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [AVAILABLE, DEFECTIVE, PENDING_DELIVERY, PROCESSING]
 *               note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.patch("/item/:itemSerial/status", InventoryController.updateItemStatus);

/**
 * @swagger
 * /api/inventory/defective/process:
 *   post:
 *     summary: Xử lý hàng lỗi (trả NCC, thanh lý, xuất hủy)
 *     tags: [Inventory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               unitIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               processType:
 *                 type: string
 *                 enum: [RETURN, SCRAP, WRITE_OFF]
 *               scrapPrice:
 *                 type: number
 *               note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Xử lý thành công
 */
router.post("/defective/process", InventoryController.processDefectiveItems);

/**
 * @swagger
 * /api/inventory/product/{id}/min-stock:
 *   patch:
 *     summary: Cập nhật định mức tồn kho tối thiểu
 *     tags: [Inventory]
 */
router.patch("/product/:id/min-stock", InventoryController.updateMinStock);

module.exports = router;
