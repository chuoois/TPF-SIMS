const express = require("express");
const router = express.Router();
const {
    createCustomer,
    updateCustomer,
    addSpecialNote,
    getAllCustomers,
    getCustomerById,
    deleteCustomer,
} = require("../controller/customer.controller");
const { verifyAccessToken, verifyRole } = require("../middleware/auth.middleware");

/**
 * Sales Routes
 * Dành cho SALES và OWNER
 *
 * Created By: ThinhBui
 * Created Date: 23/02/2026
 */

router.use(verifyAccessToken);
router.use(verifyRole(["SALES", "OWNER"]));

// Get All Customers (có thể tìm kiếm theo ?search=)
router.get("/customers", getAllCustomers);

// Get Customer By ID
router.get("/customers/:id", getCustomerById);

// Create Customer Profile
router.post("/customers", createCustomer);

// Update Customer Profile
router.put("/customers/:id", updateCustomer);

// Add / Update Special Note (ngày giao, màu sơn, vị trí lắp đặt,...)
router.patch("/customers/:id/note", addSpecialNote);

// Delete Customer Profile
router.delete("/customers/:id", deleteCustomer);

module.exports = router;
