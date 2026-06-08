import nodemailer from 'nodemailer';
import { config } from '../config';
import { logger } from '../config/logger';

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: false,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    await transporter.sendMail({
      from: `"SBI Banking" <${config.smtp.from}>`,
      ...options,
    });
    logger.info(`Email sent to ${options.to}`);
  } catch (error) {
    logger.error('Error sending email:', error);
    throw error;
  }
};

export const sendVerificationEmail = async (email: string, token: string) => {
  const verificationUrl = `${config.corsOrigin}/verify-email?token=${token}`;
  await sendEmail({
    to: email,
    subject: 'Verify Your Email - SBI Banking',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #2c3e50; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">SBI Banking</h1>
        </div>
        <div style="padding: 30px; background: #f8f9fa;">
          <h2>Email Verification</h2>
          <p>Thank you for registering with SBI Banking. Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background: #2c3e50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email
            </a>
          </div>
          <p>Or copy this link: ${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
        </div>
        <div style="padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>&copy; 2024 SBI Banking. All rights reserved.</p>
        </div>
      </div>
    `,
  });
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetUrl = `${config.corsOrigin}/reset-password?token=${token}`;
  await sendEmail({
    to: email,
    subject: 'Reset Your Password - SBI Banking',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #2c3e50; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">SBI Banking</h1>
        </div>
        <div style="padding: 30px; background: #f8f9fa;">
          <h2>Password Reset Request</h2>
          <p>You have requested to reset your password. Click the button below to proceed:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: #e74c3c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      </div>
    `,
  });
};

export const sendTransactionAlert = async (email: string, details: {
  type: string;
  amount: number;
  fromAccount: string;
  toAccount: string;
  date: Date;
}) => {
  await sendEmail({
    to: email,
    subject: `Transaction Alert - ${details.type.toUpperCase()} - SBI Banking`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #2c3e50; padding: 20px;">
          <h1 style="color: white; margin: 0;">Transaction Alert</h1>
        </div>
        <div style="padding: 20px;">
          <p>A transaction has been made on your account:</p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; border: 1px solid #ddd;">Type</td><td style="padding: 8px; border: 1px solid #ddd;">${details.type}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;">Amount</td><td style="padding: 8px; border: 1px solid #ddd;">₹${details.amount.toLocaleString()}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;">From</td><td style="padding: 8px; border: 1px solid #ddd;">${details.fromAccount}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;">To</td><td style="padding: 8px; border: 1px solid #ddd;">${details.toAccount}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;">Date</td><td style="padding: 8px; border: 1px solid #ddd;">${details.date.toLocaleString()}</td></tr>
          </table>
        </div>
      </div>
    `,
  });
};

export const sendOtpEmail = async (email: string, otp: string) => {
  await sendEmail({
    to: email,
    subject: 'Your OTP - SBI Banking',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #2c3e50; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">SBI Banking</h1>
        </div>
        <div style="padding: 30px; text-align: center;">
          <h2>One-Time Password</h2>
          <div style="font-size: 36px; letter-spacing: 8px; font-weight: bold; color: #2c3e50; margin: 20px 0;">
            ${otp}
          </div>
          <p>This OTP is valid for 10 minutes.</p>
        </div>
      </div>
    `,
  });
};
