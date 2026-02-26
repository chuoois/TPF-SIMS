const express = require("express");
const router = express.Router();
const masterDataController = require("../controller/master-data.controller");
const { verifyAccessToken, verifyRole } = require("../middleware/auth.middleware");

// Tất cả các route admin/master data đều cần là OWNER
router.use(verifyAccessToken);
router.use(verifyRole(["OWNER"]));

// Wood Types
router.get("/wood-types", masterDataController.getAllWoodTypes);
router.post("/wood-types", masterDataController.createWoodType);
router.put("/wood-types/:id", masterDataController.updateWoodType);
router.delete("/wood-types/:id", masterDataController.deleteWoodType);

// Product Categories
router.get("/categories", masterDataController.getAllCategories);
router.post("/categories", masterDataController.createCategory);
router.put("/categories/:id", masterDataController.updateCategory);
router.delete("/categories/:id", masterDataController.deleteCategory);

// Colors
router.get("/colors", masterDataController.getAllColors);
router.post("/colors", masterDataController.createColor);
router.put("/colors/:id", masterDataController.updateColor);
router.delete("/colors/:id", masterDataController.deleteColor);

module.exports = router;
