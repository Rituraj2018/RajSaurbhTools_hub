import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const config = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/rajsaurbh_tool_hub_pro',
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
