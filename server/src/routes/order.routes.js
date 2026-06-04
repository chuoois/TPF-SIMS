const express = require("express");
const router = express.Router();
const OrderController = require("../controller/order.controller");
const { verifyAccessToken, verifyRole } = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const { createOrderSchema } = require("../validations/order.validation");
/**
 * Order Routes - Quản lý đơn hàng
 * Created By: ThinhBui
 * Created Date: 25/04/2026
 */

// Yêu cầu đăng nhập
router.use(verifyAccessToken);
const ownerAndSalesOnly = verifyRole(["SALES", "OWNER"]);
router.use(ownerAndSalesOnly);

/**
 * @swagger
 * /api/order:
 *   get:
 *     summary: Lấy danh sách đơn hàng
 *     tags: [Order]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: "Trang hiện tại"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: "Số bản ghi trên 1 trang"
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: "Tìm kiếm mã đơn, tên/SĐT khách hàng, tên SP"
 *       - in: query
 *         name: order_status
 *         schema:
 *           type: integer
 *         description: "Trạng thái đơn hàng"
 *       - in: query
 *         name: order_type
 *         schema:
 *           type: integer
 *         description: "Loại đơn hàng (1: Mộc, 2: Sẵn, 3: Đặt riêng)"
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: "Từ ngày (YYYY-MM-DD)"
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: "Đến ngày (YYYY-MM-DD)"
 *     responses:
 *       200:
 *         description: Danh sách đơn hàng
 */
router.get("/", OrderController.getAllOrders);

/**
 * @swagger
 * /api/order/{id}:
 *   get:
 *     summary: Lấy chi tiết đơn hàng (List detail)
 *     tags: [Order]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Chi tiết đơn hàng
 */
router.get("/:id", OrderController.getOrderById);

/**
 * @swagger
 * /api/order:
 *   post:
 *     summary: Tạo mới đơn hàng (Bán hàng tại quầy/Online)
 *     description: |
 *       Tạo đơn hàng mới và tự động giữ chỗ (allocation) sản phẩm từ kho.
 *       - Nếu `order_type = 1` (Hàng mộc): Giữ chỗ sản phẩm và gán trạng thái Chờ giao.
 *       - Nếu `order_type = 2` (Hàng sẵn): Giữ chỗ sản phẩm và gán trạng thái Chờ giao.
 *       - Tự động kế thừa thông tin Material, Color, Size từ Product nếu không truyền chi tiết.
 *     tags: [Order]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fk_customer_id
 *               - total_amount
 *               - items
 *             properties:
 *               fk_customer_id:
 *                 type: integer
 *                 example: 1
 *               fulfillment_method:
 *                 type: string
 *                 description: "Phương thức giao hàng (VD: Lấy tại cửa hàng, Giao tận nhà)"
 *                 example: "Giao tận nhà"

 *               expected_fulfillment_date:
 *                 type: string
 *                 format: date-time
 *                 description: "Ngày dự kiến giao hàng"
 *               note:
 *                 type: string
 *                 example: "Giao vào giờ hành chính"
 *               deposit_amount:
 *                 type: number
 *                 description: "Số tiền đặt cọc"
 *                 example: 500000
 *               address:
 *                 type: string
 *                 description: "Địa chỉ giao hàng"
 *                 example: "123 Đường ABC, Quận 1, HCM"
 *               total_amount:
 *                 type: number
 *                 description: "Tổng trị giá đơn hàng"
 *                 example: 2500000
 *               order_status:
 *                 type: integer
 *                 description: "Trạng thái (1: Chờ xác nhận, 2: Đã xác nhận, 3: Đang xử lý, 4: Chờ giao, 5: Hoàn thành, 0: Đã hủy)"
 *                 default: 1
 *               order_type:
 *                 type: integer
 *                 description: "Loại đơn hàng (1: Đơn hàng mộc, 2: Đơn hàng sẵn, 3: Đơn hàng đặt riêng)"
 *                 default: 1
 *               items:
 *                 type: array
 *                 description: "Danh sách sản phẩm trong đơn hàng"
 *                 items:
 *                   type: object
 *                   properties:
 *                     fk_product_id:
 *                       type: integer
 *                       description: "ID sản phẩm từ bảng Product"
 *                     item_name:
 *                       type: string
 *                       description: "Tên hiển thị trên đơn (mặc định lấy từ Product)"
 *                     item_img:
 *                       type: string
 *                     item_quantity:
 *                       type: integer
 *                       default: 1
 *                     item_price:
 *                       type: number
 *                       description: "Giá bán của món hàng (nếu trống sẽ lấy từ ProductPricing)"
 *                     item_material:
 *                       type: string
 *                     item_color:
 *                       type: string
 *                     item_size:
 *                       type: string
 *                     item_warranty:
 *                       type: integer
 *                       description: "Số tháng bảo hành"
 *                     item_note:
 *                       type: string
 *                     item_is_bundle:
 *                       type: integer
 *                       description: "1: Bộ sản phẩm, 0: SP đơn lẻ"
 *                     item_bundle_items:
 *                       type: array
 *                       description: "Danh sách sản phẩm con trong bộ (JSON)"
 *                     item_is_gift:
 *                       type: integer
 *                       description: "1: Quà tặng, 0: Hàng bán bình thường"
 *                     is_finished:
 *                       type: integer
 *                       description: "1: Hàng hoàn thiện (sơn), 0: Hàng mộc"
 *                     customer_img:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: "Mảng URL ảnh khách hàng cung cấp"
 *                     design_img:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: "Mảng URL ảnh thiết kế"
 *     responses:
 *       201:
 *         description: Tạo đơn hàng thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 order:
 *                   type: object
 *       400:
 *         description: Lỗi logic (Sản phẩm không tồn tại, Không đủ tồn kho, ...)
 *       500:
 *         description: Lỗi hệ thống
 */
router.post("/", validate(createOrderSchema), OrderController.createOrder);

/**
 * @swagger
 * /api/order/{id}/status:
 *   put:
 *     summary: Cập nhật trạng thái đơn hàng
 *     tags: [Order]
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
 *             required:
 *               - order_status
 *             properties:
 *               order_status:
 *                 type: integer
 *                 description: "Trạng thái mới (0: Đã hủy, 1: Chờ xử lý...)"
 *               note:
 *                 type: string
 *                 description: "Ghi chú thay đổi trạng thái"
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.put("/:id/status", OrderController.updateOrderStatus);

module.exports = router;
