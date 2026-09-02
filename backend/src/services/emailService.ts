import nodemailer from 'nodemailer';
import { config } from '../config/env';

/**
 * Creates and configures the Nodemailer transporter
 */
const createTransporter = () => {
  if (config.email.isConfigured) {
    return nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.port === 465,
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
    });
  }

  // Development fallback: If SMTP is not configured, create a mock transporter that logs dispatch
  return {
    sendMail: async (options: nodemailer.SendMailOptions) => {
      console.log('────────────────────────────────────────────────────────────');
      console.log('[EmailService DEV MOCK] Outgoing Email Dispatched:');
      console.log(`To: ${options.to}`);
      console.log(`Subject: ${options.subject}`);
      console.log('────────────────────────────────────────────────────────────');
      return { messageId: 'dev-mock-id' };
    },
  } as unknown as nodemailer.Transporter;
};

export const emailService = {
  /**
   * Sends a password reset instruction email with a secure reset link
   */
  async sendPasswordResetEmail(
    toEmail: string,
    userName: string,
    resetUrl: string
  ): Promise<boolean> {
    try {
      const transporter = createTransporter();

      const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Request</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #0b0f19;
      color: #f1f5f9;
      margin: 0;
      padding: 0;
    }
    .wrapper {
      max-width: 600px;
      margin: 30px auto;
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
    }
    .header {
      background: linear-gradient(135deg, #1e3a8a, #312e81);
      padding: 28px 32px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 20px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #ffffff;
    }
    .content {
      padding: 32px;
      line-height: 1.6;
      color: #94a3b8;
      font-size: 14px;
    }
    .content p {
      margin: 0 0 16px 0;
    }
    .content .greeting {
      font-size: 16px;
      color: #f8fafc;
      font-weight: 600;
      margin-bottom: 12px;
    }
    .btn-container {
      text-align: center;
      margin: 28px 0;
    }
    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #2563eb, #4f46e5);
      color: #ffffff !important;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      padding: 12px 28px;
      border-radius: 9999px;
      box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);
    }
    .warning {
      background: #1e1b4b;
      border: 1px solid #3730a3;
      border-radius: 8px;
      padding: 12px 16px;
      margin: 20px 0;
      color: #c7d2fe;
      font-size: 12px;
    }
    .footer {
      border-top: 1px solid #1e293b;
      padding: 20px 32px;
      text-align: center;
      font-size: 11px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>RajSaurbh Tools_Hub</h1>
    </div>
    <div class="content">
      <div class="greeting">Hello ${userName || 'there'},</div>
      <p>We received a request to reset the password for your RajSaurbh Tools_Hub account. Click the button below to set a new password:</p>
      
      <div class="btn-container">
        <a href="${resetUrl}" class="btn" target="_blank">Reset My Password</a>
      </div>

      <div class="warning">
        <strong>Security Notice:</strong> This link is strictly confidential and will expire in <strong>15 minutes</strong>. It can only be used once.
      </div>

      <p>If you did not request a password reset, you can safely ignore this email. Your existing password will remain unchanged and your account is secure.</p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} RajSaurbh Tools_Hub. All rights reserved.
    </div>
  </div>
</body>
</html>
      `;

      await transporter.sendMail({
        from: config.email.from,
        to: toEmail,
        subject: 'Password Reset Request — RajSaurbh Tools_Hub',
        text: `Hello ${userName || 'there'},\n\nWe received a request to reset your password. Use the following link to reset your password:\n\n${resetUrl}\n\nThis link will expire in 15 minutes.\n\nIf you did not request this, please ignore this email.\n`,
        html: htmlContent,
      });

      return true;
    } catch (error) {
      console.error('[EmailService Error] Failed to dispatch password reset email:', error);
      return false;
    }
  },
};
