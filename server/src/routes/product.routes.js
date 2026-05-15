const express = require("express");
const router = express.Router();
const ProductController = require("../controller/product.controller");
const { verifyAccessToken, verifyRole } = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const { createProductSchema, updateProductSchema } = require("../validations/product.validation");

/**
 * Product Routes - Quản lý sản phẩm cho đơn hàng & Owner
 * Created By: ThinhBui
 * Created Date: 24/04/2026
 * Modified Date: 15/05/2026
 */

// Yêu cầu đăng nhập
router.use(verifyAccessToken);

// ======================== OWNER-ONLY ROUTES ========================
const ownerOnly = verifyRole(["OWNER"]);

/**
 * @swagger
 * /api/product/owner:
 *   get:
 *     summary: Lấy danh sách sản phẩm cho Owner (bao gồm inactive, chưa định giá)
 *     tags: [Product]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: product_type
 *         schema:
 *           type: string
 *           enum: [FINISHED, RAW, CUSTOM]
 *       - in: query
 *         name: product_status
 *         schema:
 *           type: integer
 *           enum: [0, 1]
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
 *         description: Danh sách sản phẩm cho Owner
 */
router.get("/owner", ownerOnly, ProductController.getAllProductsForOwner);

/**
 * @swagger
 * /api/product:
 *   post:
 *     summary: Tạo sản phẩm mới (Chỉ Owner)
 *     tags: [Product]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_name
 *               - sku
 *             properties:
 *               product_name:
 *                 type: string
 *               sku:
 *                 type: string
 *               product_type:
 *                 type: string
 *                 enum: [FINISHED, RAW, CUSTOM]
 *     responses:
 *       201:
 *         description: Sản phẩm được tạo thành công
 */
router.post("/", ownerOnly, validate(createProductSchema), ProductController.createProduct);

/**
 * @swagger
 * /api/product/{id}:
 *   put:
 *     summary: Cập nhật sản phẩm (Chỉ Owner)
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Sản phẩm được cập nhật thành công
 */
router.put("/:id", ownerOnly, validate(updateProductSchema), ProductController.updateProduct);

/**
 * @swagger
 * /api/product/{id}:
 *   delete:
 *     summary: Vô hiệu hóa sản phẩm - Soft delete (Chỉ Owner)
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Sản phẩm đã bị vô hiệu hóa
 */
router.delete("/:id", ownerOnly, ProductController.deleteProduct);

// ======================== SHARED ROUTES (OWNER, ADMIN, SALES) ========================
const allRoles = verifyRole(["OWNER", "ADMIN", "SALES"]);

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
router.get("/", allRoles, ProductController.getAllProducts);

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
router.get("/:id", allRoles, ProductController.getProductDetail);

module.exports = router;
