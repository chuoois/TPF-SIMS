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
// router.use(verifyAccessToken);

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
 *           type: integer
 *       - in: query
 *         name: color_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: material_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: product_type
 *         schema:
 *           type: integer
 *           description: "1: Standard, 2: Custom"
 *       - in: query
 *         name: sell_type
 *         schema:
 *           type: integer
 *           description: "1: Hàng mộc, 2: Hàng sẵn, 3: Hàng custom"
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

module.exports = router;
