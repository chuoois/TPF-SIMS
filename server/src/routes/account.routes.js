const express = require("express");
const router = express.Router();
const accountController = require("../controller/account.controller");
const { verifyAccessToken, verifyRole } = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const { createAccountSchema, updateAccountSchema, toggleStatusSchema } = require("../validations/account.validation");
/**
 * @swagger
 * tags:
 *   name: Account
 *   description: Quản lý tài khoản nhân viên và hồ sơ (Owner/Admin only)
 */

/**
 * Account Routes
 * Created By: ThinhBui
 * Created Date: 23/04/2026
 */

// Tất cả các route này yêu cầu đăng nhập và thường chỉ dành cho Admin (Owner)
router.use(verifyAccessToken);
const adminOnly = verifyRole(["OWNER"]);
router.use(adminOnly);

/**
 * @swagger
 * /api/account/roles:
 *   get:
 *     summary: Lấy danh sách các vai trò (UserRoles)
 *     tags: [Account]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trả về mảng các vai trò
 *       401:
 *         description: Chưa xác thực
 *       403:
 *         description: Không có quyền truy cập
 */
router.get("/roles", accountController.getRoles);

/**
 * @swagger
 * /api/account:
 *   get:
 *     summary: Lấy danh sách tài khoản kèm phân trang và lọc
 *     tags: [Account]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo email hoặc họ tên nhân viên
 *       - in: query
 *         name: role_id
 *         schema:
 *           type: integer
 *         description: Lọc theo ID vai trò
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Lọc từ ngày tạo
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Lọc đến ngày tạo
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Trang hiện tại
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 15
 *         description: Số bản ghi trên mỗi trang
 *     responses:
 *       200:
 *         description: Danh sách tài khoản kèm thông tin phân trang
 */
router.get("/", accountController.getAllAccounts);

/**
 * @swagger
 * /api/account/{id}:
 *   get:
 *     summary: Lấy thông tin chi tiết tài khoản theo ID
 *     tags: [Account]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID tài khoản (user_account_id)
 *     responses:
 *       200:
 *         description: Thông tin tài khoản và hồ sơ
 *       404:
 *         description: Không tìm thấy tài khoản
 */
router.get("/:id", accountController.getAccountById);

/**
 * @swagger
 * /api/account:
 *   post:
 *     summary: Tạo mới tài khoản nhân viên (kèm Profile)
 *     tags: [Account]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - role_id
 *               - full_name
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *                 description: Mật khẩu (mặc định 123456aA@ nếu để trống)
 *               role_id:
 *                 type: integer
 *               full_name:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               dob:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: integer
 *                 description: 1 cho Nam, 0 cho Nữ
 *     responses:
 *       201:
 *         description: Tạo tài khoản thành công
 *       400:
 *         description: Email đã tồn tại hoặc dữ liệu không hợp lệ
 */
router.post("/", validate(createAccountSchema), accountController.createAccount);

/**
 * @swagger
 * /api/account/{id}:
 *   put:
 *     summary: Cập nhật thông tin tài khoản và hồ sơ
 *     tags: [Account]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role_id:
 *                 type: integer
 *               full_name:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               dob:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: integer
 *               password:
 *                 type: string
 *                 description: Mật khẩu mới nếu muốn thay đổi
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         description: Không tìm thấy tài khoản
 */
router.put("/:id", validate(updateAccountSchema), accountController.updateAccount);

/**
 * @swagger
 * /api/account/{id}/status:
 *   patch:
 *     summary: Thay đổi trạng thái tài khoản (Kích hoạt/Khóa)
 *     tags: [Account]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: integer
 *                 description: 1 cho Kích hoạt, 0 cho Khóa
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái thành công
 *       400:
 *         description: Không thể tự khóa tài khoản của mình
 */
router.patch("/:id/status", validate(toggleStatusSchema), accountController.toggleStatus);

/**
 * @swagger
 * /api/account/{id}:
 *   delete:
 *     summary: Xóa vĩnh viễn tài khoản
 *     tags: [Account]
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
 *         description: Xóa thành công
 *       404:
 *         description: Không tìm thấy tài khoản
 */
router.delete("/:id", accountController.deleteAccount);

module.exports = router;
