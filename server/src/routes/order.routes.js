const express = require("express");
const router = express.Router();
const OrderController = require("../controller/order.controller");
const { verifyAccessToken } = require("../middleware/auth.middleware");

/**
 * Order Routes - Quản lý đơn hàng
 * Created By: ThinhBui
 * Created Date: 23/04/2026
 */

// Yêu cầu đăng nhập để sử dụng các API này
router.use(verifyAccessToken);

/**
 * @swagger
 * /api/order:
 *   get:
 *     summary: Lấy danh sách đơn hàng (hỗ trợ lọc theo trạng thái và khách hàng)
 *     tags: [Order]
 *     parameters:
 *       - in: query
 *         name: order_status
 *         schema:
 *           type: integer
 *         description: "Trạng thái đơn hàng (1: Pending, 2: Confirmed, 3: Processing, 4: Shipping, 5: Completed, 0: Cancelled)"
 *       - in: query
 *         name: customer_id
 *         schema:
 *           type: integer
 *         description: ID của khách hàng
 *       - in: query
 *         name: order_type
 *         schema:
 *           type: integer
 *         description: "Loại đơn hàng (1: Mộc, 2: Sẵn, 3: Custom)"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Danh sách đơn hàng
 */
router.get("/", OrderController.getAllOrders);

/**
 * @swagger
 * /api/order:
 *   post:
 *     summary: Tạo đơn hàng mới kèm chi tiết sản phẩm
 *     tags: [Order]
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
 *               note:
 *                 type: string
 *               deposit_amount:
 *                 type: number
 *               address:
 *                 type: string
 *               total_amount:
 *                 type: number
 *               order_type:
 *                 type: integer
 *                 description: "1: Đơn hàng mộc, 2: Đơn hàng sẵn, 3: Đơn hàng custom"
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     fk_product_id:
 *                       type: integer
 *                     item_name:
 *                       type: string
 *                     item_quantity:
 *                       type: integer
 *                     item_price:
 *                       type: number
 *                     item_material:
 *                       type: string
 *                     item_size:
 *                       type: string
 *                     item_color:
 *                       type: string
 *                     item_img:
 *                       type: string
 *                       description: "Ảnh gốc của sản phẩm (clone)"
 *                     customer_img:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: "Danh sách ảnh từ khách hàng"
 *                     item_note:
 *                       type: string
 *     responses:
 *       201:
 *         description: Đơn hàng đã được tạo thành công
 */
router.post("/", OrderController.createOrder);

/**
 * @swagger
 * /api/order/customer/{id}:
 *   get:
 *     summary: Lấy danh sách đơn hàng theo ID khách hàng
 *     tags: [Order]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của khách hàng
 *     responses:
 *       200:
 *         description: Danh sách đơn hàng của khách hàng
 */
router.get("/customer/:id", OrderController.getOrdersByCustomer);

/**
 * @swagger
 * /api/order/convert-from-request:
 *   post:
 *     summary: Chuyển đổi một Yêu cầu đặt riêng thành Đơn hàng
 *     tags: [Order]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               custom_request_id:
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
 *               final_price:
 *                 type: number
 *               design_files:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Chuyển đổi thành công
 */
router.post("/convert-from-request", OrderController.convertRequestToOrder);

module.exports = router;
