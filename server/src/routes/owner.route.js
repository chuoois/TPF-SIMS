const express = require("express");
const router = express.Router();
const ownerController = require("../controller/owner.controller");
const { verifyAccessToken, verifyRole } = require("../middleware/auth.middleware");

// Owner Routes
// Protected by Access Token and "OWNER" role

router.use(verifyAccessToken);
router.use(verifyRole(["OWNER"]));

// Create Account (and Profile)
router.post("/accounts", ownerController.createAccount);

// Get All Accounts
router.get("/accounts", ownerController.getAllAccounts);

// Get Account By ID
router.get("/accounts/:id", ownerController.getAccountById);

// Update Account
router.put("/accounts/:id", ownerController.updateAccount);

// Delete Account
router.delete("/accounts/:id", ownerController.deleteAccount);

module.exports = router;
