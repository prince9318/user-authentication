import express from "express";
import adminController from "../controllers/adminController.js";
import { auth } from "../middleware/auth.js";
import roleCheck from "../middleware/roleCheck.js";

const router = express.Router();

// All routes require authentication and admin role
router.use(auth, roleCheck(["admin"]));

// Get all users with pagination and search
router.get("/users", adminController.getAllUsers);

// Get user by ID
router.get("/users/:id", adminController.getUserById);

// Update user role
router.put("/users/:id/role", adminController.updateUserRole);

// Delete user
router.delete("/users/:id", adminController.deleteUser);

export default router;
