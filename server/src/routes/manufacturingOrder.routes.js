const express = require("express");
const router = express.Router();
const manufacturingOrderController = require("../controller/manufacturingOrder.controller");
const { verifyAccessToken, verifyRole } = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const { createManufacturingOrderSchema, updateManufacturingStatusSchema } = require("../validations/manufacturingOrder.validation");


/**
 * ManufacturingOrder Routes - Quản lý phiếu nhập hàng / gia công gửi xưởng
 * Created By: ThinhBui
 * Created Date: 13/05/2026
 */

// Yêu cầu đăng nhập
router.use(verifyAccessToken);

// Chỉ Owner và Admin mới có quyền quản lý phiếu nhập hàng
const ownerAndAdminOnly = verifyRole(["OWNER", "ADMIN"]);
router.use(ownerAndAdminOnly);
/**
 * @swagger
 * tags:
 *   name: ManufacturingOrder
 *   description: Quản lý phiếu nhập hàng / gia công (Owner/Admin)
 */

/**
 * @swagger
 * /api/manufacturing-order:
 *   get:
 *     summary: Lấy danh sách phiếu nhập hàng
 *     tags: [ManufacturingOrder]
 *     parameters:
 *       - in: query
 *         name: supplier_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         description: Danh sách phiếu nhập hàng
 */
router.get("/", manufacturingOrderController.getAllOrders);

/**
 * @swagger
 * /api/manufacturing-order/{id}:
 *   get:
 *     summary: Lấy chi tiết phiếu nhập hàng
 *     tags: [ManufacturingOrder]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Chi tiết phiếu nhập hàng
 */
router.get("/:id", manufacturingOrderController.getOrderById);

/**
 * @swagger
 * /api/manufacturing-order:
 *   post:
 *     summary: Tạo mới phiếu nhập hàng từ danh sách sản phẩm
 *     tags: [ManufacturingOrder]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fk_supplier_id:
 *                 type: integer
 *               note:
 *                 type: string
 *               deposit_amount:
 *                 type: number
 *               expected_delivery_date:
 *                 type: string
 *                 format: date
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     fk_product_id:
 *                       type: integer
 *                     fk_custom_request_item_id:
 *                       type: integer
 *                     item_name:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *                     import_price:
 *                       type: number
 *     responses:
 *       201:
 *         description: Tạo thành công
 */
router.post("/", validate(createManufacturingOrderSchema), manufacturingOrderController.createOrder);

/**
 * @swagger
 * /api/manufacturing-order/{id}/status:
 *   patch:
 *     summary: Cập nhật trạng thái phiếu nhập hàng
 *     tags: [ManufacturingOrder]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.patch("/:id/status", validate(updateManufacturingStatusSchema), manufacturingOrderController.updateStatus);

module.exports = router;
