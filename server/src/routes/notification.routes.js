const express = require("express");
const router = express.Router();
const notificationController = require("../controller/notification.controller");
const { verifyAccessToken } = require("../middlewares/auth.middleware");

/**
 * Notification Routes
 * Created By: ThinhBui
 * Created Date: 26/04/2026
 */

/**
 * @swagger
 * tags:
 *   name: Notification
 *   description: API Quản lý thông báo
 */

router.use(verifyAccessToken);

/**
 * @swagger
 * /api/notification:
 *   get:
 *     summary: Lấy danh sách thông báo của tôi
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get("/", notificationController.getMyNotifications);

/**
 * @swagger
 * /api/notification/mark-all-read:
 *   post:
 *     summary: Đánh dấu tất cả thông báo là đã đọc
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công
 */
router.post("/mark-all-read", notificationController.markAllAsRead);

/**
 * @swagger
 * /api/notification/{id}/read:
 *   patch:
 *     summary: Đánh dấu một thông báo là đã đọc
 *     tags: [Notification]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công
 */
router.patch("/:id/read", notificationController.markAsRead);

module.exports = router;
