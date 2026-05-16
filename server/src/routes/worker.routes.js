const express = require("express");
const router = express.Router();
const workerController = require("../controller/worker.controller");
const { verifyAccessToken, verifyRole } = require("../middlewares/auth.middleware");
const { taskIdSchema, completeTaskSchema, rejectTaskSchema, validate } = require("../validations/worker.validation");

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
router.post("/tasks/start/:id", verifyAccessToken, verifyRole(['WORKER', 'OWNER', 'ADMIN']), validate(taskIdSchema, 'params'), workerController.startTask);

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
router.post("/tasks/complete/:id", verifyAccessToken, verifyRole(['WORKER', 'OWNER', 'ADMIN']), validate(taskIdSchema, 'params'), validate(completeTaskSchema, 'body'), workerController.completeTask);

/**
 * @swagger
 * /api/worker/tasks/approve/{id}:
 *   post:
 *     summary: Chủ xưởng duyệt sản phẩm (Chờ duyệt → Hoàn thành)
 *     tags: [Worker]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: pk_order_item_id
 */
router.post("/tasks/approve/:id", verifyAccessToken, verifyRole(['OWNER', 'ADMIN']), validate(taskIdSchema, 'params'), workerController.approveTask);

/**
 * @swagger
 * /api/worker/tasks/reject/{id}:
 *   post:
 *     summary: Chủ xưởng từ chối sản phẩm (Chờ duyệt → Đang gia công)
 *     tags: [Worker]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: pk_order_item_id
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Lý do từ chối
 */
router.post("/tasks/reject/:id", verifyAccessToken, verifyRole(['OWNER', 'ADMIN']), validate(taskIdSchema, 'params'), validate(rejectTaskSchema, 'body'), workerController.rejectTask);

module.exports = router;
