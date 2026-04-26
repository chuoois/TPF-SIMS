const express = require("express");
const router = express.Router();
const productAttributeController = require("../controller/productAttribute.controller");
const { verifyAccessToken } = require("../middleware/auth.middleware");

// Yêu cầu đăng nhập để sử dụng các API này
router.use(verifyAccessToken);

/**
 * @swagger
 * tags:
 *   name: ProductAttributes
 *   description: API quản lý thuộc tính sản phẩm (Danh mục, Màu sắc, Chất liệu)
 */

/**
 * @swagger
 * /api/product-attribute/all:
 *   get:
 *     summary: Lấy tất cả danh mục, màu sắc, chất liệu
 *     tags: [ProductAttributes]
 *     responses:
 *       200:
 *         description: Danh sách các thuộc tính
 */
router.get("/all", productAttributeController.getAllAttributes);

/**
 * @swagger
 * /api/product-attribute/category/sync:
 *   post:
 *     summary: Tìm hoặc tạo mới danh mục theo tên
 *     tags: [ProductAttributes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Trả về danh mục đã tồn tại hoặc vừa tạo mới
 */
router.post("/category/sync", productAttributeController.syncCategory);

/**
 * @swagger
 * /api/product-attribute/color/sync:
 *   post:
 *     summary: Tìm hoặc tạo mới màu sắc theo tên
 *     tags: [ProductAttributes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Trả về màu sắc đã tồn tại hoặc vừa tạo mới
 */
router.post("/color/sync", productAttributeController.syncColor);

/**
 * @swagger
 * /api/product-attribute/material/sync:
 *   post:
 *     summary: Tìm hoặc tạo mới chất liệu theo tên
 *     tags: [ProductAttributes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Trả về chất liệu đã tồn tại hoặc vừa tạo mới
 */
router.post("/material/sync", productAttributeController.syncMaterial);

/**
 * @swagger
 * /api/product-attribute/room/sync:
 *   post:
 *     summary: Tìm hoặc tạo mới phòng/khu vực theo tên
 *     tags: [ProductAttributes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Trả về phòng/khu vực đã tồn tại hoặc vừa tạo mới
 */
router.post("/room/sync", productAttributeController.syncRoom);

/**
 * @swagger
 * /api/product-attribute/{type}/save:
 *   post:
 *     summary: Lưu thuộc tính (Thêm mới hoặc Cập nhật)
 *     tags: [ProductAttributes]
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [category, color, material, room]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Trả về thuộc tính đã lưu
 */
router.post("/:type/save", productAttributeController.saveAttribute);

/**
 * @swagger
 * /api/product-attribute/{type}/{id}:
 *   delete:
 *     summary: Xóa thuộc tính (Soft Delete)
 *     tags: [ProductAttributes]
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [category, color, material, room]
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.delete("/:type/:id", productAttributeController.deleteAttribute);

module.exports = router;
