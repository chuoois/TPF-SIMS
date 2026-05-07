const express = require("express");
const router = express.Router();
const systemLogController = require("../controller/systemLog.controller");
const { verifyAccessToken, verifyRole } = require("../middlewares/auth.middleware");

/**
 * @swagger
 * tags:
 *   name: SystemLog
 *   description: Nhật ký hệ thống (Owner only)
 */

/**
 * SystemLog Routes
 * Created By: ThinhBui
 * Created Date: 23/04/2026
 */

// Chỉ cho phép Owner xem nhật ký hệ thống
router.use(verifyAccessToken);
router.use(verifyRole(["OWNER"]));

/**
 * @swagger
 * /api/system-log:
 *   get:
 *     summary: Lấy danh sách nhật ký hệ thống
 *     tags: [SystemLog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo hành động, chi tiết hoặc nhân viên
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *         description: Lọc theo mức độ (INFO, WARN, ERROR)
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Lọc từ ngày
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Lọc đến ngày
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 15
 *     responses:
 *       200:
 *         description: Danh sách nhật ký
 */
router.get("/", systemLogController.getAllLogs);

module.exports = router;
