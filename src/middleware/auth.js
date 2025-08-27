import jwt from "jsonwebtoken";
import { jwt as jwtConfig } from "../config/env.js";
import { client as redisClient } from "../config/redis.js";
import db from "../models/index.js";

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({ message: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token, jwtConfig.secret);

    // Check if token is blacklisted (logged out)
    const isBlacklisted = await redisClient.get(`bl_${decoded.id}`);
    if (isBlacklisted) {
      return res
        .status(401)
        .json({ message: "Token revoked. Please log in again." });
    }

    const user = await db.User.findByPk(decoded.id, {
      include: [{ model: db.Role, as: "role" }],
    });

    if (!user) {
      return res.status(401).json({ message: "Token is not valid." });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token is not valid." });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (token) {
      const decoded = jwt.verify(token, jwtConfig.secret);

      // Check if token is blacklisted (logged out)
      const isBlacklisted = await redisClient.get(`bl_${decoded.id}`);
      if (!isBlacklisted) {
        const user = await db.User.findByPk(decoded.id, {
          include: [{ model: db.Role, as: "role" }],
        });

        if (user) {
          req.user = user;
        }
      }
    }

    next();
  } catch (error) {
    // If token is invalid, just continue without user
    next();
  }
};

export { auth, optionalAuth };
