const express = require("express");
const router = express.Router();
const employeeController = require("../controller/employee.controller");
const { verifyAccessToken, verifyRole } = require("../middlewares/auth.middleware");

/**
 * @swagger
 * tags:
 *   name: Employee
 *   description: Quản lý nhân viên xưởng (thợ sơn, giấy ráp, bán hàng...)
 */

/**
 * Employee Routes
 * Created By: hieunm
 * Created Date: 25/04/2026
 */

router.use(verifyAccessToken);
// Kế toán và Owner đều được phép quản lý nhân viên
const allowedRoles = verifyRole(["OWNER", "ADMIN", "ACCOUNTANT"]);

/**
 * @swagger
 * /api/employee:
 *   get:
 *     summary: Lấy danh sách nhân viên
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Tìm theo mã NV hoặc tên
 *       - in: query
 *         name: role_type
 *         schema: { type: string, enum: [SALES, ACCOUNTANT, SANDER, PAINTER] }
 *       - in: query
 *         name: is_active
 *         schema: { type: integer }
 *         description: 1 = đang làm, 0 = đã nghỉ
 *     responses:
 *       200:
 *         description: Danh sách nhân viên
 */
router.get("/", allowedRoles, employeeController.getAllEmployees);

/**
 * @swagger
 * /api/employee/{id}:
 *   get:
 *     summary: Lấy chi tiết nhân viên
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Thông tin nhân viên
 *       404:
 *         description: Không tìm thấy
 */
router.get("/:id", allowedRoles, employeeController.getEmployeeById);

/**
 * @swagger
 * /api/employee:
 *   post:
 *     summary: Thêm nhân viên mới
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [employee_code, full_name, role_name, role_type, base_rate]
 *             properties:
 *               employee_code:
 *                 type: string
 *                 example: "NV007"
 *               full_name:
 *                 type: string
 *                 example: "Nguyễn Văn A"
 *               role_name:
 *                 type: string
 *                 example: "Thợ sơn"
 *               role_type:
 *                 type: string
 *                 enum: [SALES, ACCOUNTANT, SANDER, PAINTER]
 *               base_rate:
 *                 type: integer
 *                 example: 400000
 *               user_account_id:
 *                 type: integer
 *                 description: ID tài khoản login (tùy chọn)
 *     responses:
 *       201:
 *         description: Thêm thành công
 *       400:
 *         description: Mã nhân viên đã tồn tại
 */
router.post("/", allowedRoles, employeeController.createEmployee);

/**
 * @swagger
 * /api/employee/{id}:
 *   put:
 *     summary: Cập nhật thông tin nhân viên
 *     tags: [Employee]
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
 *             properties:
 *               full_name: { type: string }
 *               role_name: { type: string }
 *               role_type: { type: string, enum: [SALES, ACCOUNTANT, SANDER, PAINTER] }
 *               base_rate: { type: integer }
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         description: Không tìm thấy nhân viên
 */
router.put("/:id", allowedRoles, employeeController.updateEmployee);

/**
 * @swagger
 * /api/employee/{id}/status:
 *   patch:
 *     summary: Bật/tắt trạng thái nhân viên (đang làm / đã nghỉ)
 *     tags: [Employee]
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
 *             required: [is_active]
 *             properties:
 *               is_active:
 *                 type: integer
 *                 description: 1 = đang làm, 0 = đã nghỉ
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái thành công
 */
router.patch("/:id/status", allowedRoles, employeeController.toggleStatus);

module.exports = router;
