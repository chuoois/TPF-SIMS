const express = require("express");
const router = express.Router();

const authRoutes = require("./auth.route");
const commonRoutes = require("./common.route");
const ownerRoutes = require("./owner.route");

/**
 * Root Router
 * Created By: ThinhBui
 * Created Date: 05/02/2026
 */

router.use("/auth", authRoutes);
router.use("/common", commonRoutes);
router.use("/owner", ownerRoutes);

module.exports = router;