import nodemailer from 'nodemailer';
import { config } from '../config/env';

export interface FeedbackEmailData {
  feedbackType: string;
  rating: number;
  ratingEmoji: string;
  message: string;
  toolId?: string;
  toolName?: string;
  featureTitle?: string;
  featureBenefit?: string;
  newToolName?: string;
  newToolUse?: string;
  expectedResult?: string;
  actualResult?: string;
  email?: string;
  userName?: string;
  userId?: string;
  createdAt?: Date;
}

/**
 * Creates and configures the Nodemailer transporter
 */
const createTransporter = () => {
  if (config.email.isConfigured) {
    const isPort465 = Number(config.email.port) === 465;
    const cleanPassword = (config.email.pass || '').replace(/\s+/g, '');

    return nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: isPort465,
      auth: {
        user: config.email.user,
        pass: cleanPassword,
      },
      connectionTimeout: 8000, // 8s connection timeout
      greetingTimeout: 8000,   // 8s greeting timeout
      socketTimeout: 8000,     // 8s socket timeout
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
      <h1>Toolix</h1>
    </div>
    <div class="content">
      <div class="greeting">Hello ${userName || 'there'},</div>
      <p>We received a request to reset the password for your Toolix account. Click the button below to set a new password:</p>
      
      <div class="btn-container">
        <a href="${resetUrl}" class="btn" target="_blank">Reset My Password</a>
      </div>

      <div class="warning">
        <strong>Security Notice:</strong> This link is strictly confidential and will expire in <strong>15 minutes</strong>. It can only be used once.
      </div>

      <p>If you did not request a password reset, you can safely ignore this email. Your existing password will remain unchanged and your account is secure.</p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Toolix. All rights reserved.
    </div>
  </div>
</body>
</html>
      `;

      await transporter.sendMail({
        from: config.email.from,
        to: toEmail,
        subject: 'Password Reset Request — Toolix',
        text: `Hello ${userName || 'there'},\n\nWe received a request to reset your password. Use the following link to reset your password:\n\n${resetUrl}\n\nThis link will expire in 15 minutes.\n\nIf you did not request this, please ignore this email.\n`,
        html: htmlContent,
      });

      return true;
    } catch (error: any) {
      console.error(
        '[EmailService Error] Failed to dispatch password reset email:',
        error instanceof Error ? error.message : 'SMTP dispatch failure'
      );
      return false;
    }
  },

  /**
   * Sends a feedback alert notification email to the configured developer/admin
   */
  async sendFeedbackNotificationEmail(data: FeedbackEmailData): Promise<boolean> {
    try {
      const transporter = createTransporter();
      const adminEmail = config.email.user || 'riturajsingh8543@gmail.com';

      const typeLabels: Record<string, string> = {
        bug: '🐛 Report a Problem',
        feature: '🚀 Suggest a Feature',
        improve_tool: '🛠️ Improve a Tool',
        new_tool: '✨ Suggest a New Tool',
        praise: '❤️ User Appreciation',
        other: '💬 General Feedback',
      };

      const typeLabel = typeLabels[data.feedbackType] || data.feedbackType;
      const formattedDate = (data.createdAt ? new Date(data.createdAt) : new Date()).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });

      const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New User Feedback</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #0b0f19;
      color: #f1f5f9;
      margin: 0;
      padding: 0;
    }
    .wrapper {
      max-width: 620px;
      margin: 24px auto;
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
    }
    .header {
      background: linear-gradient(135deg, #1e3a8a, #312e81);
      padding: 24px 28px;
      text-align: left;
    }
    .header-title {
      margin: 0;
      font-size: 18px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.3px;
    }
    .header-sub {
      margin: 4px 0 0 0;
      font-size: 12px;
      color: #93c5fd;
    }
    .content {
      padding: 24px 28px;
      line-height: 1.6;
      color: #94a3b8;
      font-size: 13px;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background: #1e293b;
      color: #38bdf8;
      border: 1px solid #334155;
    }
    .grid-table {
      width: 100%;
      margin: 16px 0;
      border-collapse: collapse;
      background: #0b1120;
      border-radius: 10px;
      overflow: hidden;
      border: 1px solid #1e293b;
    }
    .grid-table td {
      padding: 10px 14px;
      font-size: 12px;
      border-bottom: 1px solid #1e293b;
    }
    .grid-table tr:last-child td {
      border-bottom: none;
    }
    .label {
      color: #64748b;
      font-weight: 600;
      width: 35%;
    }
    .value {
      color: #f8fafc;
      font-weight: 500;
    }
    .message-box {
      background: #020617;
      border: 1px solid #1e293b;
      border-left: 4px solid #3b82f6;
      border-radius: 8px;
      padding: 14px 16px;
      margin: 16px 0;
      color: #f1f5f9;
      font-size: 13px;
      line-height: 1.6;
      white-space: pre-wrap;
    }
    .section-title {
      font-size: 12px;
      font-weight: 700;
      color: #e2e8f0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 16px 0 6px 0;
    }
    .detail-card {
      background: #0b1120;
      border: 1px solid #1e293b;
      border-radius: 8px;
      padding: 10px 14px;
      margin-bottom: 10px;
      font-size: 12px;
    }
    .detail-label {
      color: #64748b;
      font-weight: 600;
      font-size: 11px;
      margin-bottom: 2px;
    }
    .detail-val {
      color: #cbd5e1;
    }
    .footer {
      border-top: 1px solid #1e293b;
      padding: 16px 28px;
      text-align: center;
      font-size: 11px;
      color: #64748b;
      background: #0b0f19;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="header-title">Toolix — User Feedback</div>
      <div class="header-sub">New feedback submission received on ${formattedDate}</div>
    </div>
    
    <div class="content">
      <div style="margin-bottom: 12px;">
        <span class="badge">${typeLabel}</span>
      </div>

      <table class="grid-table">
        <tr>
          <td class="label">Experience Rating</td>
          <td class="value"><strong>${data.ratingEmoji?.toUpperCase() || ''} (${data.rating}/5)</strong></td>
        </tr>
        ${data.toolName ? `
        <tr>
          <td class="label">Referenced Tool</td>
          <td class="value"><span style="color: #60a5fa; font-weight: 600;">${data.toolName}</span></td>
        </tr>` : ''}
        <tr>
          <td class="label">Submitter Email</td>
          <td class="value">${data.email ? `<a href="mailto:${data.email}" style="color: #38bdf8;">${data.email}</a>` : '<span style="color: #64748b;">Not provided (Guest)</span>'}</td>
        </tr>
        ${data.userName ? `
        <tr>
          <td class="label">Logged-in User</td>
          <td class="value">${data.userName}</td>
        </tr>` : ''}
        <tr>
          <td class="label">Submitted At</td>
          <td class="value">${formattedDate}</td>
        </tr>
      </table>

      ${data.featureTitle || data.featureBenefit ? `
      <div class="section-title">Feature Suggestion Details</div>
      ${data.featureTitle ? `
      <div class="detail-card">
        <div class="detail-label">PROPOSED FEATURE</div>
        <div class="detail-val">${data.featureTitle}</div>
      </div>` : ''}
      ${data.featureBenefit ? `
      <div class="detail-card">
        <div class="detail-label">USER BENEFIT / USE CASE</div>
        <div class="detail-val">${data.featureBenefit}</div>
      </div>` : ''}
      ` : ''}

      ${data.newToolName || data.newToolUse ? `
      <div class="section-title">New Tool Request</div>
      ${data.newToolName ? `
      <div class="detail-card">
        <div class="detail-label">REQUESTED TOOL</div>
        <div class="detail-val">${data.newToolName}</div>
      </div>` : ''}
      ${data.newToolUse ? `
      <div class="detail-card">
        <div class="detail-label">PLANNED USE CASE</div>
        <div class="detail-val">${data.newToolUse}</div>
      </div>` : ''}
      ` : ''}

      ${data.expectedResult || data.actualResult ? `
      <div class="section-title">Problem Report Details</div>
      ${data.expectedResult ? `
      <div class="detail-card">
        <div class="detail-label">EXPECTED RESULT</div>
        <div class="detail-val">${data.expectedResult}</div>
      </div>` : ''}
      ${data.actualResult ? `
      <div class="detail-card">
        <div class="detail-label">ACTUAL RESULT</div>
        <div class="detail-val">${data.actualResult}</div>
      </div>` : ''}
      ` : ''}

      <div class="section-title">User Feedback Message</div>
      <div class="message-box">${data.message}</div>
    </div>

    <div class="footer">
      This notification was automatically sent from Toolix Feedback Engine.
    </div>
  </div>
</body>
</html>
      `;

      const plainTextMessage = `
New User Feedback — Toolix
────────────────────────────────────────
Type: ${typeLabel}
Rating: ${data.ratingEmoji} (${data.rating}/5)
Tool: ${data.toolName || 'N/A'}
Submitter Email: ${data.email || 'Not provided'}
Submitted At: ${formattedDate}

Message:
${data.message}

${data.featureTitle ? `Feature Title: ${data.featureTitle}\n` : ''}
${data.featureBenefit ? `Feature Benefit: ${data.featureBenefit}\n` : ''}
${data.newToolName ? `New Tool: ${data.newToolName}\n` : ''}
${data.newToolUse ? `New Tool Use: ${data.newToolUse}\n` : ''}
${data.expectedResult ? `Expected Result: ${data.expectedResult}\n` : ''}
${data.actualResult ? `Actual Result: ${data.actualResult}\n` : ''}
      `.trim();

      await transporter.sendMail({
        from: config.email.from,
        to: adminEmail,
        replyTo: data.email || undefined,
        subject: `[Feedback] ${typeLabel} — Toolix`,
        text: plainTextMessage,
        html: htmlContent,
      });

      return true;
    } catch (error) {
      console.error('[EmailService Error] Failed to dispatch feedback notification email:', error);
      return false;
    }
  },
};