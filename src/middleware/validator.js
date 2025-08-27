import { body, validationResult } from "express-validator";
import db from "../models/index.js";

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};

// User registration validation
const validateRegistration = [
  body("firstName")
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters"),

  body("lastName")
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters"),

  body("email")
    .isEmail()
    .withMessage("Please provide a valid email")
    .custom(async (email) => {
      const existingUser = await db.User.findOne({ where: { email } });
      if (existingUser) {
        throw new Error("Email already in use");
      }
    }),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one lowercase letter, one uppercase letter, and one number"
    ),

  handleValidationErrors,
];

// User login validation
const validateLogin = [
  body("email").isEmail().withMessage("Please provide a valid email"),

  body("password").notEmpty().withMessage("Password is required"),

  handleValidationErrors,
];

// Password reset validation
const validatePasswordReset = [
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one lowercase letter, one uppercase letter, and one number"
    ),

  handleValidationErrors,
];

// Profile update validation
const validateProfileUpdate = [
  body("firstName")
    .optional()
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters"),

  body("lastName")
    .optional()
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters"),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Please provide a valid email")
    .custom(async (email, { req }) => {
      if (email) {
        const existingUser = await db.User.findOne({
          where: { email },
          attributes: ["id"],
        });

        if (existingUser && existingUser.id !== req.user.id) {
          throw new Error("Email already in use");
        }
      }
    }),

  handleValidationErrors,
];

export {
  validateRegistration,
  validateLogin,
  validatePasswordReset,
  validateProfileUpdate,
  handleValidationErrors,
};
