import db from "../models/index.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { generateRandomToken } from "../utils/token.js";
import { sendVerificationEmail } from "../utils/mailer.js";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const userController = {
  // Get user profile
  getProfile: async (req, res) => {
    try {
      const user = await db.User.findByPk(req.user.id, {
        attributes: {
          exclude: [
            "password",
            "verificationToken",
            "resetPasswordToken",
            "resetPasswordExpires",
          ],
        },
        include: [{ model: db.Role, as: "role" }],
      });

      res.json({ user });
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({ message: "Server error while fetching profile" });
    }
  },

  // Update user profile
  updateProfile: async (req, res) => {
    try {
      const { firstName, lastName, email } = req.body;
      const userId = req.user.id;

      const user = await db.User.findByPk(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update fields
      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;

      // Handle email change
      if (email && email !== user.email) {
        // Check if email is already in use
        const existingUser = await db.User.findOne({
          where: { email },
          attributes: ["id"],
        });

        if (existingUser && existingUser.id !== userId) {
          return res.status(400).json({ message: "Email already in use" });
        }

        user.email = email;
        user.isVerified = false; // Require email verification

        // Generate new verification token
        user.verificationToken = generateRandomToken();
        await sendVerificationEmail(user, user.verificationToken);
      }

      await user.save();

      // Get updated user with role
      const updatedUser = await db.User.findByPk(userId, {
        attributes: {
          exclude: [
            "password",
            "verificationToken",
            "resetPasswordToken",
            "resetPasswordExpires",
          ],
        },
        include: [{ model: db.Role, as: "role" }],
      });

      res.json({
        message: "Profile updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ message: "Server error while updating profile" });
    }
  },

  // Upload profile image
  uploadProfileImage: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const user = await db.User.findByPk(req.user.id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Delete old profile image if exists
      if (user.profileImage) {
        const oldImagePath = path.join(
          __dirname,
          "../../uploads/profile-images",
          user.profileImage
        );
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      // Update user with new profile image filename
      user.profileImage = req.file.filename;
      await user.save();

      res.json({
        message: "Profile image uploaded successfully",
        profileImage: `/uploads/profile-images/${req.file.filename}`,
      });
    } catch (error) {
      console.error("Upload profile image error:", error);
      res
        .status(500)
        .json({ message: "Server error while uploading profile image" });
    }
  },

  // Delete profile image
  deleteProfileImage: async (req, res) => {
    try {
      const user = await db.User.findByPk(req.user.id);

      if (!user || !user.profileImage) {
        return res.status(404).json({ message: "Profile image not found" });
      }

      // Delete image file
      const imagePath = path.join(
        __dirname,
        "../../uploads/profile-images",
        user.profileImage
      );
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }

      // Update user
      user.profileImage = null;
      await user.save();

      res.json({ message: "Profile image deleted successfully" });
    } catch (error) {
      console.error("Delete profile image error:", error);
      res
        .status(500)
        .json({ message: "Server error while deleting profile image" });
    }
  },

  // Change password
  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await db.User.findByPk(req.user.id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(
        currentPassword
      );
      if (!isCurrentPasswordValid) {
        return res
          .status(400)
          .json({ message: "Current password is incorrect" });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      res.json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({ message: "Server error while changing password" });
    }
  },

  // Delete account
  deleteAccount: async (req, res) => {
    try {
      const { password } = req.body;
      const user = await db.User.findByPk(req.user.id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: "Password is incorrect" });
      }

      // Delete profile image if exists
      if (user.profileImage) {
        const imagePath = path.join(
          __dirname,
          "../../uploads/profile-images",
          user.profileImage
        );
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      // Delete user
      await user.destroy();

      res.json({ message: "Account deleted successfully" });
    } catch (error) {
      console.error("Delete account error:", error);
      res.status(500).json({ message: "Server error while deleting account" });
    }
  },
};

export default userController;
