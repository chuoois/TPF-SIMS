const express = require("express");
const router = express.Router();
const ProductController = require("../controller/product.controller");
const { verifyAccessToken } = require("../middleware/auth.middleware");

/**
 * Product Routes - Quản lý sản phẩm cho đơn hàng
 * Created By: ThinhBui
 * Created Date: 24/04/2026
 */

// Yêu cầu đăng nhập
router.use(verifyAccessToken);

/**
 * @swagger
 * /api/product:
 *   get:
 *     summary: Lấy danh sách sản phẩm kèm giá (Phục vụ lên đơn hàng)
 *     tags: [Product]
 *     parameters:
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: string
 *         description: "ID loại sản phẩm (hỗ trợ nhiều giá trị: 1,2,3)"
 *       - in: query
 *         name: color_id
 *         schema:
 *           type: string
 *         description: "ID màu sắc (hỗ trợ nhiều giá trị: 1,2,3)"
 *       - in: query
 *         name: material_id
 *         schema:
 *           type: string
 *         description: "ID chất liệu (hỗ trợ nhiều giá trị: 1,2,3)"
 *       - in: query
 *         name: room_id
 *         schema:
 *           type: string
 *         description: "ID phòng (hỗ trợ nhiều giá trị: 1,2,3)"
 *       - in: query
 *         name: sell_type
 *         schema:
 *           type: integer
 *         description: "1: Hàng mộc (lọc theo giá mộc), 2: Hàng sẵn (lọc theo giá hoàn thiện), 4: Hàng custom"
 *       - in: query
 *         name: is_gift
 *         schema:
 *           type: integer
 *           enum: [0, 1]
 *         description: "1: Chỉ lấy hàng quà tặng, 0: Chỉ lấy hàng bán bình thường"
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: "Tìm kiếm theo tên SP, SKU, tên loại, tên màu, tên chất liệu, tên phòng"
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
 *         description: Danh sách sản phẩm
 */
router.get("/", ProductController.getAllProducts);

/**
 * @swagger
 * /api/product/{id}:
 *   get:
 *     summary: Lấy chi tiết sản phẩm
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Chi tiết sản phẩm
 */
router.get("/:id", ProductController.getProductDetail);
router.delete("/:id", ProductController.deleteProduct);
router.put("/:id", ProductController.updateProduct);

module.exports = router;
