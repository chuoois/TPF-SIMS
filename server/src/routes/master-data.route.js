const express = require("express");
const router = express.Router();
const masterDataController = require("../controller/master-data.controller");
const { verifyAccessToken, verifyRole } = require("../middleware/auth.middleware");

// Tất cả các route đều cần xác thực
router.use(verifyAccessToken);

// GET routes: cho phép cả OWNER & ACCOUNTANT đọc dữ liệu (dùng cho dropdown)
const readOnly = verifyRole(["OWNER", "ACCOUNTANT"]);
// Mutate routes: chỉ OWNER
const ownerOnly = verifyRole(["OWNER"]);

// Wood Types
router.get("/wood-types", readOnly, masterDataController.getAllWoodTypes);
router.post("/wood-types", ownerOnly, masterDataController.createWoodType);
router.put("/wood-types/:id", ownerOnly, masterDataController.updateWoodType);
router.delete("/wood-types/:id", ownerOnly, masterDataController.deleteWoodType);

// Product Categories
router.get("/categories", readOnly, masterDataController.getAllCategories);
router.post("/categories", ownerOnly, masterDataController.createCategory);
router.put("/categories/:id", ownerOnly, masterDataController.updateCategory);
router.delete("/categories/:id", ownerOnly, masterDataController.deleteCategory);

// Colors
router.get("/colors", readOnly, masterDataController.getAllColors);
router.post("/colors", ownerOnly, masterDataController.createColor);
router.put("/colors/:id", ownerOnly, masterDataController.updateColor);
router.delete("/colors/:id", ownerOnly, masterDataController.deleteColor);

module.exports = router;

