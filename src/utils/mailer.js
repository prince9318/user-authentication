import nodemailer from "nodemailer";
import { email, clientUrl } from "../config/env.js";

const transporter = nodemailer.createTransporter({
  host: email.host,
  port: email.port,
  secure: false, // true for 465, false for other ports
  auth: {
    user: email.user,
    pass: email.pass,
  },
});

const sendVerificationEmail = async (user, token) => {
  const verificationUrl = `${clientUrl}/verify-email?token=${token}`;

  const mailOptions = {
    from: `"User Management System" <${email.user}>`,
    to: user.email,
    subject: "Verify Your Email Address",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Email Verification</h2>
        <p>Hello ${user.firstName},</p>
        <p>Thank you for registering with our User Management System. Please click the button below to verify your email address:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Verify Email
          </a>
        </p>
        <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
        <p>${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account with us, please ignore this email.</p>
        <br>
        <p>Best regards,<br>User Management Team</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

const sendPasswordResetEmail = async (user, token) => {
  const resetUrl = `${clientUrl}/reset-password?token=${token}`;

  const mailOptions = {
    from: `"User Management System" <${email.user}>`,
    to: user.email,
    subject: "Password Reset Request",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset</h2>
        <p>Hello ${user.firstName},</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #f44336; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
        <p>${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request a password reset, please ignore this email.</p>
        <br>
        <p>Best regards,<br>User Management Team</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export { sendVerificationEmail, sendPasswordResetEmail };
