const express = require("express");
const router = express.Router();
const SaleController = require("../controller/sale.controller");
const { verifyAccessToken } = require("../middleware/auth.middleware");

/**
 * Sale Routes - Quản lý khách hàng
 * Created By: Antigravity
 * Created Date: 17/04/2026
 */

// Tất cả các route yêu cầu đăng nhập
router.use(verifyAccessToken);

/**
 * @swagger
 * /api/sale/customers:
 *   get:
 *     summary: Get all customers (active)
 *     tags: [Sale]
 *     responses:
 *       200:
 *         description: List of customers
 */
router.get("/customers", SaleController.getAllCustomers);

/**
 * @swagger
 * /api/sale/customers/{id}:
 *   get:
 *     summary: Get customer by ID
 *     tags: [Sale]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Customer details
 */
router.get("/customers/:id", SaleController.getCustomerById);

/**
 * @swagger
 * /api/sale/customers:
 *   post:
 *     summary: Create new customer
 *     tags: [Sale]
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
router.post("/customers", SaleController.createCustomer);

/**
 * @swagger
 * /api/sale/customers/{id}:
 *   put:
 *     summary: Update customer
 *     tags: [Sale]
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
router.put("/customers/:id", SaleController.updateCustomer);

/**
 * @swagger
 * /api/sale/customers/{id}:
 *   delete:
 *     summary: Soft delete customer
 *     tags: [Sale]
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
router.delete("/customers/:id", SaleController.deleteCustomer);

module.exports = router;
