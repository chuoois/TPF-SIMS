const express = require("express");
const router = express.Router();
const SupplierController = require("../controller/supplier.controller");
const { verifyAccessToken, verifyRole } = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const { createSupplierSchema, updateSupplierSchema } = require("../validations/supplier.validation");

// Yêu cầu đăng nhập
router.use(verifyAccessToken);

// Cho phép cả OWNER và ACCOUNTANT truy cập các quyền CRUD nhà cung cấp
const canManageSuppliers = verifyRole(["OWNER", "ACCOUNTANT"]);

/**
 * @swagger
 * /api/supplier:
 *   get:
 *     summary: Lấy danh sách nhà cung cấp
 *     tags: [Supplier]
 *     responses:
 *       200:
 *         description: Danh sách nhà cung cấp
 */
router.get("/", SupplierController.getAllSuppliers);

/**
 * @swagger
 * /api/supplier:
 *   post:
 *     summary: Tạo nhà cung cấp mới
 *     tags: [Supplier]
 */
router.post("/", canManageSuppliers, validate(createSupplierSchema), SupplierController.createSupplier);

/**
 * @swagger
 * /api/supplier/{id}:
 *   put:
 *     summary: Cập nhật thông tin nhà cung cấp
 *     tags: [Supplier]
 */
router.put("/:id", canManageSuppliers, validate(updateSupplierSchema), SupplierController.updateSupplier);

/**
 * @swagger
 * /api/supplier/{id}:
 *   delete:
 *     summary: Xóa mềm nhà cung cấp
 *     tags: [Supplier]
 */
router.delete("/:id", canManageSuppliers, SupplierController.deleteSupplier);

module.exports = router;
