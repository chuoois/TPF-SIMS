const express = require("express");
const router = express.Router();
const workerController = require("../controller/worker.controller");
const { verifyAccessToken, verifyRole } = require("../middlewares/auth.middleware");

/**
 * @swagger
 * tags:
 *   name: Worker
 *   description: API dành cho thợ gia công
 */

/**
 * @swagger
 * /api/worker/tasks/pending:
 *   get:
 *     summary: Lấy danh sách công việc đang chờ hoặc đang gia công
 *     tags: [Worker]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trả về danh sách đơn hàng và món hàng cần gia công
 */
router.get("/tasks/pending", verifyAccessToken, verifyRole(['WORKER', 'OWNER', 'ADMIN']), workerController.getPendingTasks);

/**
 * @swagger
 * /api/worker/tasks/completed:
 *   get:
 *     summary: Lấy danh sách công việc đã hoàn thành
 *     tags: [Worker]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trả về danh sách các công việc đã hoàn thành
 */
router.get("/tasks/completed", verifyAccessToken, verifyRole(['WORKER', 'OWNER', 'ADMIN']), workerController.getCompletedTasks.bind(workerController));

/**
 * @swagger
 * /api/worker/tasks/start/{id}:
 *   post:
 *     summary: Bắt đầu gia công (Chờ → Đang gia công)
 *     tags: [Worker]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: pk_order_item_id
 */
router.post("/tasks/start/:id", verifyAccessToken, verifyRole(['WORKER', 'OWNER', 'ADMIN']), workerController.startTask);

/**
 * @swagger
 * /api/worker/tasks/complete/{id}:
 *   post:
 *     summary: Hoàn thành gia công (Đang gia công → Hoàn thành)
 *     tags: [Worker]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: pk_order_item_id
 */
router.post("/tasks/complete/:id", verifyAccessToken, verifyRole(['WORKER', 'OWNER', 'ADMIN']), workerController.completeTask);

module.exports = router;
