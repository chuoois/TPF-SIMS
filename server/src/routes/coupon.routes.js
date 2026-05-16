const express = require("express");
const router = express.Router();
const CouponController = require("../controller/coupon.controller");
const { verifyAccessToken } = require("../middlewares/auth.middleware");


// Yêu cầu đăng nhập
router.use(verifyAccessToken);

/**
 * @swagger
 * /api/coupon:
 *   get:
 *     summary: Lấy danh sách mã giảm giá (có search + phân trang)
 *     tags: [Coupon]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Danh sách mã giảm giá
 */
router.get("/", CouponController.getAllCoupons);

/**
 * @swagger
 * /api/coupon/{id}:
 *   get:
 *     summary: Lấy chi tiết mã giảm giá theo ID
 *     tags: [Coupon]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Chi tiết mã giảm giá
 */
router.get("/:id", CouponController.getCouponById);

/**
 * @swagger
 * /api/coupon:
 *   post:
 *     summary: Tạo mã giảm giá mới
 *     tags: [Coupon]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               coupon_code:
 *                 type: string
 *               coupon_name:
 *                 type: string
 *               description:
 *                 type: string
 *               discount_percent:
 *                 type: number
 *               start_date:
 *                 type: string
 *                 format: date
 *               end_date:
 *                 type: string
 *                 format: date
 *               productIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       201:
 *         description: Tạo thành công
 */
router.post("/", CouponController.createCoupon);

/**
 * @swagger
 * /api/coupon/{id}:
 *   put:
 *     summary: Cập nhật mã giảm giá
 *     tags: [Coupon]
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
router.put("/:id", CouponController.updateCoupon);

/**
 * @swagger
 * /api/coupon:
 *   delete:
 *     summary: Xóa mã giảm giá (đơn lẻ hoặc hàng loạt)
 *     tags: [Coupon]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Xóa thành công
 */
router.delete("/", CouponController.deleteCoupon);

module.exports = router;
