const express = require("express");
const router = express.Router();
const CustomRequestController = require("../controller/customRequest.controller");
const { verifyAccessToken } = require("../middleware/auth.middleware");

/**
 * CustomRequest Routes - Quản lý phiếu yêu cầu đặt hàng riêng
 * Created By: ThinhBui
 * Created Date: 24/04/2026
 */

// Yêu cầu đăng nhập
router.use(verifyAccessToken);

/**
 * @swagger
 * /api/custom-request:
 *   get:
 *     summary: Lấy danh sách phiếu yêu cầu đặt riêng
 *     tags: [CustomRequest]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: integer
 *         description: "Trạng thái (1: Pending, 2: Quoted, 3: Ordered, 0: Cancelled)"
 *       - in: query
 *         name: customer_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         description: Danh sách yêu cầu
 */
router.get("/", CustomRequestController.getAllRequests);

/**
 * @swagger
 * /api/custom-request:
 *   post:
 *     summary: Tạo mới một phiếu yêu cầu kèm danh sách sản phẩm
 *     tags: [CustomRequest]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fk_customer_id:
 *                 type: integer
 *               fulfillment_method:
 *                 type: string
 *               expected_fulfillment_date:
 *                 type: string
 *                 format: date-time
 *               deposit_amount:
 *                 type: number
 *               address:
 *                 type: string
 *               total_amount:
 *                 type: number
 *               order_status:
 *                 type: integer
 *               order_type:
 *                 type: integer
 *               note:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     item_name:
 *                       type: string
 *                     item_img:
 *                       type: string
 *                     item_quantity:
 *                       type: integer
 *                     item_material:
 *                       type: string
 *                     item_size:
 *                       type: object
 *                       description: "JSON {length, width, height}"
 *                     item_color:
 *                       type: string
 *                     item_price:
 *                       type: number
 *                     item_note:
 *                       type: string
 *                     is_finished:
 *                       type: integer
 *                       description: "0: Mộc, 1: Sơn"
 *                     customer_img:
 *                       type: array
 *                       items:
 *                         type: string
 *                     design_img:
 *                       type: array
 *                       items:
 *                         type: string
 *     responses:
 *       201:
 *         description: Tạo thành công
 */
router.post("/", CustomRequestController.createRequest);

/**
 * @swagger
 * /api/custom-request/{id}:
 *   get:
 *     summary: Xem chi tiết một phiếu yêu cầu và danh sách món hàng
 *     tags: [CustomRequest]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Chi tiết yêu cầu
 */
router.get("/:id", CustomRequestController.getRequestById);

/**
 * @swagger
 * /api/custom-request/{id}/status:
 *   patch:
 *     summary: Cập nhật trạng thái hoặc báo giá cho phiếu yêu cầu
 *     tags: [CustomRequest]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: integer
 *                 description: "Trạng thái mới"
 *               total_estimated_price:
 *                 type: number
 *               note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.patch("/:id/status", CustomRequestController.updateStatus);

/**
 * @swagger
 * /api/custom-request/{id}:
 *   put:
 *     summary: Cập nhật thông tin chi tiết yêu cầu (Owner/Admin)
 *     tags: [CustomRequest]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.put("/:id", CustomRequestController.updateRequest);

module.exports = router;
