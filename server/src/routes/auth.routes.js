const express = require("express");
const router = express.Router();
const AuthController = require("../controller/auth.controller");

/**
 * Auth Routes
 * Created By: ThinhBui
 * Created Date: 14/03/2026
 */

const { verifyAccessToken } = require("../middleware/auth.middleware");

router.post("/login", AuthController.login);
router.post("/refresh-token", AuthController.refreshToken);
router.post("/logout", AuthController.logout);
router.post("/forgot-password", AuthController.forgotPassword);
router.get("/profile", verifyAccessToken, AuthController.getProfile);

module.exports = router;
