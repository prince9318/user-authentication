import db from "../models/index.js";
import {
  generateToken,
  generateRefreshToken,
  generateRandomToken,
} from "../utils/token.js";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../utils/mailer.js";
import { client as redisClient } from "../config/redis.js";
import { jwt as jwtConfig } from "../config/env.js";
import jwt from "jsonwebtoken";

const authController = {
  // Register new user
  register: async (req, res) => {
    try {
      const { firstName, lastName, email, password } = req.body;

      // Get user role
      const userRole = await db.Role.findOne({ where: { name: "user" } });

      // Generate verification token
      const verificationToken = generateRandomToken();

      // Create user
      const user = await db.User.create({
        firstName,
        lastName,
        email,
        password,
        roleId: userRole.id,
        verificationToken,
      });

      // Send verification email
      await sendVerificationEmail(user, verificationToken);

      res.status(201).json({
        message:
          "User registered successfully. Please check your email for verification.",
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Server error during registration" });
    }
  },

  // Login user
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user with role
      const user = await db.User.findOne({
        where: { email },
        include: [{ model: db.Role, as: "role" }],
      });

      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Check if user has password (OAuth users might not have one)
      if (!user.password) {
        return res.status(401).json({
          message:
            "This account was created with Google. Please use Google login.",
        });
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Check if email is verified
      if (!user.isVerified) {
        return res.status(401).json({
          message: "Please verify your email before logging in.",
        });
      }

      // Generate tokens
      const tokenPayload = {
        id: user.id,
        email: user.email,
        role: user.role.name,
      };

      const token = generateToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      // Store refresh token in Redis with expiration
      await redisClient.setEx(
        `refresh_${user.id}`,
        parseInt(jwtConfig.refreshExpiresIn) * 24 * 60 * 60, // Convert days to seconds
        refreshToken
      );

      res.json({
        message: "Login successful",
        token,
        refreshToken,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          profileImage: user.profileImage,
          role: user.role.name,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Server error during login" });
    }
  },

  // Verify email
  verifyEmail: async (req, res) => {
    try {
      const { token } = req.query;

      const user = await db.User.findOne({
        where: { verificationToken: token },
      });

      if (!user) {
        return res
          .status(400)
          .json({ message: "Invalid or expired verification token" });
      }

      // Update user as verified
      user.isVerified = true;
      user.verificationToken = null;
      await user.save();

      res.json({ message: "Email verified successfully" });
    } catch (error) {
      console.error("Email verification error:", error);
      res
        .status(500)
        .json({ message: "Server error during email verification" });
    }
  },

  // Forgot password
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;

      const user = await db.User.findOne({ where: { email } });

      if (!user) {
        // Don't reveal if email exists or not for security
        return res.json({
          message: "If the email exists, a password reset link has been sent.",
        });
      }

      // Generate reset token
      const resetToken = generateRandomToken();
      const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

      // Save reset token to user
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = new Date(resetTokenExpiry);
      await user.save();

      // Send password reset email
      await sendPasswordResetEmail(user, resetToken);

      res.json({
        message: "If the email exists, a password reset link has been sent.",
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res
        .status(500)
        .json({ message: "Server error during password reset request" });
    }
  },

  // Reset password
  resetPassword: async (req, res) => {
    try {
      const { token, password } = req.body;

      const user = await db.User.findOne({
        where: {
          resetPasswordToken: token,
          resetPasswordExpires: { [db.Sequelize.Op.gt]: Date.now() },
        },
      });

      if (!user) {
        return res
          .status(400)
          .json({ message: "Invalid or expired reset token" });
      }

      // Update password and clear reset token
      user.password = password;
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();

      res.json({ message: "Password reset successfully" });
    } catch (error) {
      console.error("Password reset error:", error);
      res.status(500).json({ message: "Server error during password reset" });
    }
  },

  // Refresh token
  refreshToken: async (req, res) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({ message: "Refresh token required" });
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, jwtConfig.refreshSecret);

      // Check if refresh token exists in Redis
      const storedRefreshToken = await redisClient.get(`refresh_${decoded.id}`);

      if (!storedRefreshToken || storedRefreshToken !== refreshToken) {
        return res.status(401).json({ message: "Invalid refresh token" });
      }

      // Find user
      const user = await db.User.findByPk(decoded.id, {
        include: [{ model: db.Role, as: "role" }],
      });

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Generate new tokens
      const tokenPayload = {
        id: user.id,
        email: user.email,
        role: user.role.name,
      };

      const newToken = generateToken(tokenPayload);
      const newRefreshToken = generateRefreshToken(tokenPayload);

      // Update refresh token in Redis
      await redisClient.setEx(
        `refresh_${user.id}`,
        parseInt(jwtConfig.refreshExpiresIn) * 24 * 60 * 60, // Convert days to seconds
        newRefreshToken
      );

      res.json({
        token: newToken,
        refreshToken: newRefreshToken,
      });
    } catch (error) {
      console.error("Token refresh error:", error);
      res.status(401).json({ message: "Invalid refresh token" });
    }
  },

  // Logout
  logout: async (req, res) => {
    try {
      // Add token to blacklist
      const token = req.header("Authorization")?.replace("Bearer ", "");

      if (token) {
        const decoded = jwt.verify(token, jwtConfig.secret);

        // Add token to blacklist with expiration
        const tokenExp = decoded.exp - Math.floor(Date.now() / 1000);
        if (tokenExp > 0) {
          await redisClient.setEx(`bl_${decoded.id}`, tokenExp, token);
        }

        // Remove refresh token
        await redisClient.del(`refresh_${decoded.id}`);
      }

      res.json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Server error during logout" });
    }
  },

  // Google OAuth callback
  googleCallback: async (req, res) => {
    try {
      if (!req.user) {
        return res
          .status(401)
          .json({ message: "Google authentication failed" });
      }

      const user = req.user;

      // Generate tokens
      const tokenPayload = {
        id: user.id,
        email: user.email,
        role: user.role.name,
      };

      const token = generateToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      // Store refresh token in Redis
      await redisClient.setEx(
        `refresh_${user.id}`,
        parseInt(jwtConfig.refreshExpiresIn) * 24 * 60 * 60, // Convert days to seconds
        refreshToken
      );

      // Redirect to frontend with tokens as query params
      res.redirect(
        `${process.env.CLIENT_URL}/oauth-success?token=${token}&refreshToken=${refreshToken}`
      );
    } catch (error) {
      console.error("Google callback error:", error);
      res.redirect(
        `${process.env.CLIENT_URL}/login?error=authentication_failed`
      );
    }
  },
};

export default authController;
