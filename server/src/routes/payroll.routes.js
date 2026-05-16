const express = require("express");
const router = express.Router();
const payrollController = require("../controller/payroll.controller");
const { verifyAccessToken, verifyRole } = require("../middlewares/auth.middleware");

/**
 * @swagger
 * tags:
 *   name: Payroll
 *   description: Quản lý kỳ lương, bản ghi lương và khoản thưởng/phạt
 */

/**
 * Payroll Routes
 * Created By: Hieunm
 * Created Date: 25/04/2026
 */

router.use(verifyAccessToken);
const allowedRoles = verifyRole(["OWNER", "ADMIN", "ACCOUNTANT"]);

// ──────────────────────────────────────────────────────────
// PAYROLL PERIOD
// ──────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/payroll/periods:
 *   get:
 *     summary: Lấy danh sách tất cả kỳ lương (kèm summary)
 *     tags: [Payroll]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách kỳ lương mới nhất trước
 */
router.get("/periods", allowedRoles, payrollController.getAllPeriods);

/**
 * @swagger
 * /api/payroll/periods/{id}:
 *   get:
 *     summary: Chi tiết 1 kỳ lương (kèm tất cả bản ghi lương và adjustments)
 *     tags: [Payroll]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Chi tiết kỳ lương
 *       404:
 *         description: Không tìm thấy kỳ lương
 */
router.get("/periods/:id", allowedRoles, payrollController.getPeriodById);

/**
 * @swagger
 * /api/payroll/periods:
 *   post:
 *     summary: Tạo kỳ lương mới (auto-clone nhân viên đang hoạt động)
 *     tags: [Payroll]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [period_month]
 *             properties:
 *               period_month:
 *                 type: string
 *                 example: "05/2026"
 *                 description: "Tháng của kỳ lương, format MM/YYYY"
 *               note:
 *                 type: string
 *                 description: Ghi chú (tùy chọn)
 *     responses:
 *       201:
 *         description: Tạo kỳ lương thành công
 *       400:
 *         description: Kỳ lương tháng này đã tồn tại
 */
router.post("/periods", allowedRoles, payrollController.createPeriod);

/**
 * @swagger
 * /api/payroll/periods/{id}/lock:
 *   post:
 *     summary: "Chốt lương – LOCK toàn bộ kỳ (không thể sửa sau khi chốt)"
 *     tags: [Payroll]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Chốt lương thành công
 *       400:
 *         description: Kỳ lương đã được chốt trước đó
 *       404:
 *         description: Không tìm thấy kỳ lương
 */
router.post("/periods/:id/lock", allowedRoles, payrollController.lockPeriod);

/**
 * @swagger
 * /api/payroll/periods/{id}/records:
 *   post:
 *     summary: Thêm một nhân viên vào kỳ lương đã tồn tại
 *     tags: [Payroll]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fk_employee_id]
 *             properties:
 *               fk_employee_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Thêm thành công
 *       400:
 *         description: Nhân viên đã tồn tại trong kỳ
 *       403:
 *         description: Kỳ lương đã chốt
 */
router.post("/periods/:id/records", allowedRoles, payrollController.addRecordToPeriod);

// ──────────────────────────────────────────────────────────
// SALARY RECORD
// ──────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/payroll/records/{id}:
 *   patch:
 *     summary: Cập nhật ngày công / OT cho bản ghi lương
 *     tags: [Payroll]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: record_id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               days_worked:
 *                 type: number
 *                 example: 22.5
 *               overtime_hours:
 *                 type: number
 *                 example: 5
 *     responses:
 *       200:
 *         description: Cập nhật thành công (kèm total_salary mới)
 *       403:
 *         description: Kỳ lương đã chốt
 *       404:
 *         description: Không tìm thấy bản ghi
 */
router.patch("/records/:id", allowedRoles, payrollController.updateRecord);

/**
 * @swagger
 * /api/payroll/records/{id}/increment-day:
 *   patch:
 *     summary: Điểm danh nhanh (cộng 1 ngày công)
 *     tags: [Payroll]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Điểm danh thành công
 */
router.patch("/records/:id/increment-day", allowedRoles, payrollController.incrementDaysWorked);


/**
 * @swagger
 * /api/payroll/records/{id}:
 *   delete:
 *     summary: Xóa bản ghi lương khỏi kỳ lương
 *     tags: [Payroll]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       403:
 *         description: Kỳ lương đã chốt
 */
router.delete("/records/:id", allowedRoles, payrollController.deleteRecord);

/**
 * @swagger
 * /api/payroll/records/{id}/pay:
 *   patch:
 *     summary: Xác nhận đã thanh toán lương cho nhân viên
 *     tags: [Payroll]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Xác nhận thanh toán thành công
 *       400:
 *         description: Đã thanh toán trước đó
 *       403:
 *         description: Kỳ lương đã chốt
 */
router.patch("/records/:id/pay", allowedRoles, payrollController.payRecord);

/**
 * @swagger
 * /api/payroll/records/{id}/unpay:
 *   patch:
 *     summary: Hủy trạng thái đã thanh toán (chỉ khi kỳ chưa LOCK)
 *     tags: [Payroll]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Hủy thanh toán thành công
 *       403:
 *         description: Kỳ lương đã chốt
 */
router.patch("/records/:id/unpay", allowedRoles, payrollController.unpayRecord);

// ──────────────────────────────────────────────────────────
// SALARY ADJUSTMENT (Thưởng / Phụ cấp / Phạt)
// ──────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/payroll/records/{id}/adjustments:
 *   post:
 *     summary: Thêm khoản thưởng / phụ cấp / phạt vào bản ghi lương
 *     tags: [Payroll]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: record_id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, description, amount]
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [BONUS, ALLOWANCE, PENALTY]
 *                 example: "BONUS"
 *               description:
 *                 type: string
 *                 example: "Thưởng KPI tháng 5"
 *               amount:
 *                 type: integer
 *                 example: 500000
 *                 description: "Nhập số dương cho cả PENALTY (hệ thống tự đổi sang âm)"
 *     responses:
 *       201:
 *         description: Thêm khoản điều chỉnh thành công
 *       403:
 *         description: Kỳ lương đã chốt
 */
router.post("/records/:id/adjustments", allowedRoles, payrollController.addAdjustment);

/**
 * @swagger
 * /api/payroll/adjustments/{id}:
 *   delete:
 *     summary: Xóa khoản thưởng / phụ cấp / phạt
 *     tags: [Payroll]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: adjustment_id
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       403:
 *         description: Kỳ lương đã chốt
 *       404:
 *         description: Không tìm thấy khoản điều chỉnh
 */
router.delete("/adjustments/:id", allowedRoles, payrollController.deleteAdjustment);

module.exports = router;
