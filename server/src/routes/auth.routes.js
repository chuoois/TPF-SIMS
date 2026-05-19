const express = require("express");
const router = express.Router();
const AuthController = require("../controller/auth.controller");

/**
 * Auth Routes
 * Created By: ThinhBui
 * Created Date: 14/03/2026
 */

const { verifyAccessToken } = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const { loginSchema, forgotPasswordSchema, changePasswordSchema, updateProfileSchema } = require("../validations/auth.validation");

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login to the system
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Unauthorized
 */
router.post("/login", validate(loginSchema), AuthController.login);

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: Refresh access token using refresh token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Token refreshed successful
 *       403:
 *         description: Invalid refresh token
 */
router.post("/refresh-token", AuthController.refreshToken);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout from the system
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post("/logout", verifyAccessToken, AuthController.logout);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset link
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reset email sent
 *       404:
 *         description: User not found
 */
router.post("/forgot-password", validate(forgotPasswordSchema), AuthController.forgotPassword);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successful
 *       401:
 *         description: Unauthorized
 */
router.get("/profile", verifyAccessToken, AuthController.getProfile);
router.put("/profile", verifyAccessToken, validate(updateProfileSchema), AuthController.updateProfile);
router.put("/change-password", verifyAccessToken, validate(changePasswordSchema), AuthController.changePassword);

module.exports = router;
