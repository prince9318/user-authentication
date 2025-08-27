import express from "express";
import passport from "passport";
import authController from "../controllers/authController.js";
import {
  validateRegistration,
  validateLogin,
  validatePasswordReset,
} from "../middleware/validator.js";

const router = express.Router();

// Register
router.post("/register", validateRegistration, authController.register);

// Login
router.post("/login", validateLogin, authController.login);

// Verify email
router.get("/verify-email", authController.verifyEmail);

// Forgot password
router.post("/forgot-password", authController.forgotPassword);

// Reset password
router.post(
  "/reset-password",
  validatePasswordReset,
  authController.resetPassword
);

// Refresh token
router.post("/refresh-token", authController.refreshToken);

// Logout
router.post("/logout", authController.logout);

// Google OAuth routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login",
  }),
  authController.googleCallback
);

export default router;
