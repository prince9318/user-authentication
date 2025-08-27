import jwt from "jsonwebtoken";
import crypto from "crypto";
import { jwt as jwtConfig } from "../config/env.js";

const generateToken = (payload) => {
  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
  });
};

const generateRefreshToken = (payload) => {
  return jwt.sign(payload, jwtConfig.refreshSecret, {
    expiresIn: jwtConfig.refreshExpiresIn,
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, jwtConfig.secret);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, jwtConfig.refreshSecret);
};

const generateRandomToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

export {
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
  generateRandomToken,
};
