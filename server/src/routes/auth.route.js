const express = require("express");
const router = express.Router();
const {
  login,
  logout,
  refreshAccessToken,
  forgotPassword,
} = require("../controller/auth.controller");
const { verifyAccessToken } = require("../middleware/auth.middleware");

/**
 * Auth Routes
 * Created By: ThinhBui
 * Created Date: 05/02/2026
 */

router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh-token", refreshAccessToken);
router.post("/forgot-password", forgotPassword);

module.exports = router;
