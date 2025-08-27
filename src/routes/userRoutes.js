import express from "express";
import userController from "../controllers/userController.js";
import { auth } from "../middleware/auth.js";
import { validateProfileUpdate } from "../middleware/validator.js";
import upload from "../utils/fileUpload.js";

const router = express.Router();

// All routes require authentication
router.use(auth);

// Get user profile
router.get("/profile", userController.getProfile);

// Update user profile
router.put("/profile", validateProfileUpdate, userController.updateProfile);

// Upload profile image
router.post(
  "/profile/image",
  upload.single("image"),
  userController.uploadProfileImage
);

// Delete profile image
router.delete("/profile/image", userController.deleteProfileImage);

// Change password
router.post("/change-password", userController.changePassword);

// Delete account
router.delete("/delete-account", userController.deleteAccount);

export default router;
