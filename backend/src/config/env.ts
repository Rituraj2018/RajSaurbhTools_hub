import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables from .env file (supports running from repo root or backend dir)
const envPath = fs.existsSync(path.resolve(process.cwd(), '.env'))
  ? path.resolve(process.cwd(), '.env')
  : path.resolve(__dirname, '../../.env');

dotenv.config({ path: envPath });

export const config = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongoUri: process.env.MONGODB_URI || process.env.MONGODB_URL || '',
  mongodbUri: process.env.MONGODB_URI || process.env.MONGODB_URL || '',
  isProduction: process.env.NODE_ENV === 'production',
  jwtSecret: process.env.JWT_SECRET || 'default_jwt_secret_dev_key_only',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  // Cloudinary — optional; if unset, upload falls back to local disk
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    get isConfigured(): boolean {
      return Boolean(
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
      );
    },
  },
  // Google OAuth configuration (for Google Login)
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackUrl:
      process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
    get isConfigured(): boolean {
      return Boolean(process.env.GOOGLE_CLIENT_ID);
    },
  },
  // Google Drive OAuth configuration (for personal cloud storage)
  googleDrive: {
    clientId: process.env.GOOGLE_DRIVE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_DRIVE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET || '',
    redirectUri:
      process.env.GOOGLE_DRIVE_REDIRECT_URI ||
      'http://localhost:5000/api/cloud/google/callback',
    get isConfigured(): boolean {
      return Boolean(
        (process.env.GOOGLE_DRIVE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID) &&
        (process.env.GOOGLE_DRIVE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET)
      );
    },
  },
  // Microsoft OneDrive / Graph API configuration (for personal cloud storage)
  microsoft: {
    clientId: process.env.MICROSOFT_CLIENT_ID || '',
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',
    tenantId: process.env.MICROSOFT_TENANT_ID || 'common',
    redirectUri:
      process.env.MICROSOFT_REDIRECT_URI ||
      'http://localhost:5000/api/cloud/microsoft/callback',
    get isConfigured(): boolean {
      return Boolean(process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET);
    },
  },
  // Email / SMTP configuration
  email: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || '"RajSaurbh Tools_Hub" <no-reply@rajsaurbh.tools>',
    get isConfigured(): boolean {
      return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
    },
  },
};

/**
 * Validates that critical environment variables are set when running in production.
 * Crashes the process early with a clear message if any are missing.
 * Call this once during server startup.
 */
export const validateEnv = (): void => {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Critical — must be set in production
  if (config.isProduction) {
    if (!process.env.JWT_SECRET) {
      errors.push('JWT_SECRET must be set in production');
    }
    if (!process.env.MONGODB_URI) {
      errors.push('MONGODB_URI must be set in production');
    }
    if (!process.env.CLIENT_URL) {
      warnings.push('CLIENT_URL is not set — CORS will be permissive');
    }
  }

  // Warn about weak JWT secret in any environment
  if (config.jwtSecret === 'default_jwt_secret_dev_key_only') {
    warnings.push(
      '[SECURITY] Using default JWT secret — set JWT_SECRET in production!'
    );
  }

  // Warn about Cloudinary not configured
  if (!config.cloudinary.isConfigured) {
    warnings.push(
      '[INFO] Cloudinary is not configured — using local file storage fallback'
    );
  }

  warnings.forEach((w) => console.warn(`[Env Warning] ${w}`));

  if (errors.length > 0) {
    errors.forEach((e) => console.error(`[Env Error] ${e}`));
    process.exit(1);
  }
};
