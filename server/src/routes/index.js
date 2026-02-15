const express = require("express");
const router = express.Router();

const authRoutes = require("./auth.route");

/**
 * Root Router
 * Created By: ThinhBui
 * Created Date: 05/02/2026
 */

router.use("/auth", authRoutes);

module.exports = router;