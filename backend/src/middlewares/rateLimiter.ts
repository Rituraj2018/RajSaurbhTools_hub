import { rateLimit } from 'express-rate-limit';
import { config } from '../config/env';

/**
 * Milliseconds in one minute
 */
const ONE_MINUTE_MS = 60 * 1000;

/**
 * Standard rate-limit response handler
 */
const rateLimitHandler = (
  _req: any,
  res: any,
  _next: any,
  options: { message: string; statusCode: number }
) => {
  res.status(options.statusCode).json({
    success: false,
    statusCode: options.statusCode,
    message: options.message,
  });
};

/**
 * Global rate limiter — applied to ALL /api/* routes
 * 200 requests per 15 minutes in production, more lenient in dev
 */
export const globalRateLimiter = rateLimit({
  windowMs: 15 * ONE_MINUTE_MS,
  max: config.isProduction ? 200 : 1000,
  standardHeaders: 'draft-7', // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false,
  message: 'Too many requests. Please try again later.',
  handler: rateLimitHandler,
  skip: (_req) => !config.isProduction && process.env.SKIP_RATE_LIMIT === 'true',
});

/**
 * Auth rate limiter — stricter limit for login/register endpoints
 * 15 attempts per 15 minutes (prevents brute-force)
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * ONE_MINUTE_MS,
  max: 15,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: 'Too many authentication attempts. Please wait 15 minutes and try again.',
  handler: rateLimitHandler,
});

/**
 * Upload rate limiter — prevent upload abuse
 * 30 uploads per 10 minutes per IP
 */
export const uploadRateLimiter = rateLimit({
  windowMs: 10 * ONE_MINUTE_MS,
  max: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: 'Too many file upload requests. Please wait before uploading again.',
  handler: rateLimitHandler,
});
