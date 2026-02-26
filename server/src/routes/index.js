const express = require("express");
const router = express.Router();

const authRoutes = require("./auth.route");
const commonRoutes = require("./common.route");
const ownerRoutes = require("./owner.route");
const masterDataRoutes = require("./master-data.route");
const salesRoutes = require("./sales.route");
const accountantRoutes = require("./accountant.route");

/**
 * Root Router
 * Created By: ThinhBui
 * Created Date: 05/02/2026
 */

router.use("/auth", authRoutes);
router.use("/common", commonRoutes);
router.use("/owner", ownerRoutes);
router.use("/master-data", masterDataRoutes);
router.use("/sales", salesRoutes);
router.use("/accountant", accountantRoutes);

module.exports = router;