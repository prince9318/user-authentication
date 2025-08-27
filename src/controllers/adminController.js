import db from "../models/index.js";
import { Op } from "sequelize";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const adminController = {
  // Get all users with pagination and search
  getAllUsers: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || "";
      const offset = (page - 1) * limit;

      // Build where clause for search
      let whereClause = {};
      if (search) {
        whereClause = {
          [Op.or]: [
            { firstName: { [Op.like]: `%${search}%` } },
            { lastName: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } },
          ],
        };
      }

      // Get users with pagination
      const { count, rows: users } = await db.User.findAndCountAll({
        where: whereClause,
        attributes: {
          exclude: [
            "password",
            "verificationToken",
            "resetPasswordToken",
            "resetPasswordExpires",
          ],
        },
        include: [{ model: db.Role, as: "role" }],
        limit,
        offset,
        order: [["createdAt", "DESC"]],
      });

      const totalPages = Math.ceil(count / limit);

      res.json({
        users,
        pagination: {
          currentPage: page,
          totalPages,
          totalUsers: count,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      });
    } catch (error) {
      console.error("Get all users error:", error);
      res.status(500).json({ message: "Server error while fetching users" });
    }
  },

  // Get user by ID
  getUserById: async (req, res) => {
    try {
      const { id } = req.params;

      const user = await db.User.findByPk(id, {
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

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ user });
    } catch (error) {
      console.error("Get user by ID error:", error);
      res.status(500).json({ message: "Server error while fetching user" });
    }
  },

  // Update user role
  updateUserRole: async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      // Find role
      const roleRecord = await db.Role.findOne({ where: { name: role } });

      if (!roleRecord) {
        return res.status(400).json({ message: "Invalid role" });
      }

      // Update user role
      const [updated] = await db.User.update(
        { roleId: roleRecord.id },
        { where: { id } }
      );

      if (!updated) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get updated user
      const user = await db.User.findByPk(id, {
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
        message: "User role updated successfully",
        user,
      });
    } catch (error) {
      console.error("Update user role error:", error);
      res
        .status(500)
        .json({ message: "Server error while updating user role" });
    }
  },

  // Delete user
  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;

      // Prevent admin from deleting themselves
      if (id === req.user.id) {
        return res
          .status(400)
          .json({ message: "Cannot delete your own account" });
      }

      const user = await db.User.findByPk(id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
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

      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({ message: "Server error while deleting user" });
    }
  },
};

export default adminController;
