const express = require("express");
const router = express.Router();
const ImportController = require("../controller/import.controller");
const { verifyAccessToken } = require("../middlewares/auth.middleware");
const { validateCreateImportReceipt } = require("../validations/import.validation");

/**
 * Import Routes - Quản lý Phiếu Nhập Kho
 * Created By: HieuNM
 * Created Date: 15/05/2026
 */

router.use(verifyAccessToken);

/**
 * @swagger
 * /api/import/requests:
 *   get:
 *     summary: Lấy danh sách yêu cầu nhập hàng (ManufacturingOrder đang chờ)
 *     tags: [Import]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm theo mã yêu cầu hoặc ghi chú
 *     responses:
 *       200:
 *         description: Danh sách yêu cầu nhập hàng
 */
router.get("/requests", ImportController.getImportRequests.bind(ImportController));

/**
 * @swagger
 * /api/import/receipt:
 *   post:
 *     summary: Tạo phiếu nhập kho mới
 *     tags: [Import]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - importDate
 *               - lines
 *             properties:
 *               importDate:
 *                 type: string
 *                 format: date
 *               supplier:
 *                 type: string
 *               note:
 *                 type: string
 *               invoiceImgUrl:
 *                 type: string
 *                 description: URL ảnh chứng từ đã upload lên Cloudinary
 *               manufacturingOrderId:
 *                 type: integer
 *               lines:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Tạo phiếu nhập thành công
 */
router.post("/receipt", validateCreateImportReceipt, ImportController.createImportReceipt.bind(ImportController));

/**
 * @swagger
 * /api/import/receipt:
 *   get:
 *     summary: Lấy danh sách phiếu nhập kho
 *     tags: [Import]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
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
 *         description: Danh sách phiếu nhập
 */
router.get("/receipt", ImportController.getImportReceipts.bind(ImportController));

/**
 * @swagger
 * /api/import/receipt/{id}:
 *   get:
 *     summary: Lấy chi tiết một phiếu nhập kho
 *     tags: [Import]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Chi tiết phiếu nhập
 *       404:
 *         description: Không tìm thấy phiếu
 */
router.get("/receipt/:id", ImportController.getImportReceiptDetail.bind(ImportController));

module.exports = router;
