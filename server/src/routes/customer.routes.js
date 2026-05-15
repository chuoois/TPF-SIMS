const express = require("express");
const router = express.Router();
const CustomerController = require("../controller/customer.controller");
const { verifyAccessToken, verifyRole } = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const { createCustomerSchema, updateCustomerSchema } = require("../validations/customer.validation");
/**
 * Customer Routes - Quản lý khách hàng
 * Created By: ThinhBui
 * Created Date: 17/04/2026
 */

// Tất cả các route yêu cầu đăng nhập
router.use(verifyAccessToken);
const salesOnly = verifyRole(["SALES"]);
router.use(salesOnly);
/**
 * @swagger
 * /api/sale/customers:
 *   get:
 *     summary: Get all customers (active)
 *     tags: [Customer]
 *     responses:
 *       200:
 *         description: List of customers
 */
router.get("/customers", CustomerController.getAllCustomers);

/**
 * @swagger
 * /api/sale/customers/{id}:
 *   get:
 *     summary: Get customer by ID with paginated orders
 *     tags: [Customer]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *     responses:
 *       200:
 *         description: Customer details with paginated orders
 */
router.get("/customers/:id", CustomerController.getCustomerById);

/**
 * @swagger
 * /api/sale/customers:
 *   post:
 *     summary: Create new customer
 *     tags: [Customer]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - full_name
 *             properties:
 *               full_name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               address:
 *                 type: string
 *               gender:
 *                 type: integer
 *               dob:
 *                 type: string
 *                 format: date
 *               note:
 *                 type: string
 *     responses:
 *       201:
 *         description: Customer created
 */
router.post("/customers", validate(createCustomerSchema), CustomerController.createCustomer);

/**
 * @swagger
 * /api/sale/customers/{id}:
 *   put:
 *     summary: Update customer
 *     tags: [Customer]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Customer updated
 */
router.put("/customers/:id", validate(updateCustomerSchema), CustomerController.updateCustomer);

/**
 * @swagger
 * /api/sale/customers/{id}:
 *   delete:
 *     summary: Soft delete customer
 *     tags: [Customer]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Customer soft deleted
 */
router.delete("/customers/:id", CustomerController.deleteCustomer);

module.exports = router;
