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
const {
    getProductsForSale,
    createInStockOrder,
    createCustomOrder,
} = require("../controller/order.controller");
const { getAllWoodTypes, getAllColors } = require("../controller/master-data.controller");
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

// ── Products ──
// Get Products for Sale (with stock info)
router.get("/products", getProductsForSale);

// ── Master Data (read-only for sales) ──
router.get("/wood-types", getAllWoodTypes);
router.get("/colors", getAllColors);

// ── Orders ──
// Create In-Stock Order
router.post("/orders/instock", createInStockOrder);

// Create Custom Order (Đặt hàng riêng)
router.post("/orders/custom", createCustomOrder);

// ── Customers ──
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
