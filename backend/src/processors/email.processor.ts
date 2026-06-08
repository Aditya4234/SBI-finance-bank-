import { Job } from 'bull';
import { emailQueue } from '../queues';
import { EmailJobData } from '../queues/jobTypes';
import { sendEmail } from '../services/email.service';
import { logger } from '../config/logger';

export const processEmailQueue = async () => {
  emailQueue.process(async (job: Job<EmailJobData>) => {
    const { type, to, payload } = job.data;
    logger.info(`Processing email job ${job.id}: ${type} to ${to}`);

    switch (type) {
      case 'verification':
        await sendEmail({
          to,
          subject: 'Verify Your Email - SBI Banking',
          html: getVerificationEmail(payload.token),
        });
        break;

      case 'password-reset':
        await sendEmail({
          to,
          subject: 'Reset Your Password - SBI Banking',
          html: getPasswordResetEmail(payload.token),
        });
        break;

      case 'transaction-alert':
        await sendEmail({
          to,
          subject: `Transaction Alert - ${payload.type?.toUpperCase()} - SBI Banking`,
          html: getTransactionAlertEmail(payload),
        });
        break;

      case 'otp':
        await sendEmail({
          to,
          subject: 'Your OTP - SBI Banking',
          html: getOtpEmail(payload.otp),
        });
        break;

      case 'welcome':
        await sendEmail({
          to,
          subject: 'Welcome to SBI Banking',
          html: getWelcomeEmail(payload.name),
        });
        break;

      case 'kyc-status':
        await sendEmail({
          to,
          subject: `KYC ${payload.status} - SBI Banking`,
          html: getKycStatusEmail(payload),
        });
        break;

      case 'loan-status':
        await sendEmail({
          to,
          subject: `Loan ${payload.status} - SBI Banking`,
          html: getLoanStatusEmail(payload),
        });
        break;

      default:
        logger.warn(`Unknown email type: ${type}`);
    }
  });

  emailQueue.on('completed', (job) => {
    logger.info(`Email job ${job.id} completed successfully`);
  });

  emailQueue.on('failed', (job, err) => {
    logger.error(`Email job ${job?.id} failed:`, err);
  });
};

const getVerificationEmail = (token: string) => `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
    <div style="background:#003366;padding:20px;text-align:center;">
      <h1 style="color:white;margin:0;">SBI Banking</h1>
    </div>
    <div style="padding:30px;background:#f8f9fa;">
      <h2>Email Verification</h2>
      <p>Please verify your email by clicking the button below:</p>
      <div style="text-align:center;margin:30px 0;">
        <a href="${process.env.CORS_ORIGIN || 'http://localhost:3000'}/verify-email?token=${token}"
           style="background:#003366;color:white;padding:12px 30px;text-decoration:none;border-radius:5px;display:inline-block;">
          Verify Email
        </a>
      </div>
    </div>
  </div>`;

const getPasswordResetEmail = (token: string) => `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
    <div style="background:#003366;padding:20px;text-align:center;">
      <h1 style="color:white;margin:0;">SBI Banking</h1>
    </div>
    <div style="padding:30px;background:#f8f9fa;">
      <h2>Password Reset</h2>
      <p>Click below to reset your password:</p>
      <div style="text-align:center;margin:30px 0;">
        <a href="${process.env.CORS_ORIGIN || 'http://localhost:3000'}/reset-password?token=${token}"
           style="background:#dc2626;color:white;padding:12px 30px;text-decoration:none;border-radius:5px;display:inline-block;">
          Reset Password
        </a>
      </div>
    </div>
  </div>`;

const getTransactionAlertEmail = (data: any) => `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
    <div style="background:#003366;padding:20px;"><h1 style="color:white;margin:0;">Transaction Alert</h1></div>
    <div style="padding:20px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:8px;border:1px solid #ddd;">Type</td><td style="padding:8px;border:1px solid #ddd;">${data.type}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;">Amount</td><td style="padding:8px;border:1px solid #ddd;">₹${data.amount?.toLocaleString()}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;">From</td><td style="padding:8px;border:1px solid #ddd;">${data.fromAccount}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;">To</td><td style="padding:8px;border:1px solid #ddd;">${data.toAccount}</td></tr>
      </table>
    </div>
  </div>`;

const getOtpEmail = (otp: string) => `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
    <div style="background:#003366;padding:20px;text-align:center;"><h1 style="color:white;margin:0;">SBI Banking</h1></div>
    <div style="padding:30px;text-align:center;">
      <h2>Your OTP</h2>
      <div style="font-size:36px;letter-spacing:8px;font-weight:bold;color:#003366;margin:20px 0;">${otp}</div>
      <p>Valid for 10 minutes</p>
    </div>
  </div>`;

const getWelcomeEmail = (name: string) => `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
    <div style="background:#003366;padding:20px;text-align:center;"><h1 style="color:white;margin:0;">Welcome to SBI!</h1></div>
    <div style="padding:30px;">
      <h2>Hello ${name},</h2>
      <p>Thank you for choosing SBI Banking. Your account is now active.</p>
    </div>
  </div>`;

const getKycStatusEmail = (data: any) => `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
    <div style="background:#003366;padding:20px;text-align:center;"><h1 style="color:white;margin:0;">KYC ${data.status}</h1></div>
    <div style="padding:30px;">
      <p>Your KYC document has been <strong>${data.status}</strong>.</p>
      ${data.remarks ? `<p>Remarks: ${data.remarks}</p>` : ''}
    </div>
  </div>`;

const getLoanStatusEmail = (data: any) => `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
    <div style="background:#003366;padding:20px;text-align:center;"><h1 style="color:white;margin:0;">Loan ${data.status}</h1></div>
    <div style="padding:30px;">
      <p>Your ${data.loanType} loan application has been <strong>${data.status}</strong>.</p>
      ${data.amount ? `<p>Amount: ₹${data.amount.toLocaleString()}</p>` : ''}
    </div>
  </div>`;
