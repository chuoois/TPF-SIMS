const express = require("express");
const router = express.Router();
const { verifyAccessToken } = require("../middleware/auth.middleware");
const { getProfile, updateProfile, changePassword } = require("../controller/common.controller");

/**
 * Common Routes
 * Created By: ThinhBui
 * Created Date: 05/02/2026
 */

router.get("/profile", verifyAccessToken, getProfile);
router.put("/profile", verifyAccessToken, updateProfile);
router.put("/change-password", verifyAccessToken, changePassword);

module.exports = router;
