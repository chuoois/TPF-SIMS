const express = require("express");
const router = express.Router();
const accountantController = require("../controller/accountant.controller");
const { verifyAccessToken, verifyRole } = require("../middleware/auth.middleware");

/**
 * Accountant Routes
 * Accessible by OWNER and ACCOUNTANT roles
 *
 * Created By: ThinhBui
 * Created Date: 27/02/2026
 */

router.use(verifyAccessToken);
router.use(verifyRole(["OWNER", "ACCOUNTANT"]));

// Dashboard
router.get("/dashboard/stats", accountantController.getDashboardStats);

// Products
router.get("/products", accountantController.getAllProducts);
router.put("/products/:id", accountantController.updateProduct);
router.delete("/products/:id", accountantController.deleteProduct);

// Import Stock (batch)
router.post("/import-stock", accountantController.importStock);

// Warehouses dropdown
router.get("/warehouses", accountantController.getWarehouses);

module.exports = router;
