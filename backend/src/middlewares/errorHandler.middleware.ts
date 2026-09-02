import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { ApiError } from '../utils/apiError';
import { config } from '../config/env';

/**
 * Centralized Error Handler Middleware
 *
 * Converts known error types (Mongoose, JWT, Multer, etc.)
 * into consistent ApiError responses. Stack traces are ONLY
 * included in non-production environments.
 */
export const errorHandler = (
  err: Error | ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors: string[] = [];

  /* ── Already normalized ApiError ── */
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  }

  /* ── Mongoose: Invalid ObjectId ── */
  else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid value for field "${err.path}": ${err.value}`;
  }

  /* ── Mongoose: Schema Validation Errors ── */
  else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    errors = Object.values(err.errors).map((e) => e.message);
    message = errors[0] || 'Validation failed';
  }

  /* ── MongoDB: Duplicate Key (E11000) ── */
  else if ((err as any).code === 11000) {
    statusCode = 409;
    const field = Object.keys((err as any).keyValue || {})[0] || 'field';
    message = `A record with this ${field} already exists`;
  }

  /* ── JWT: Token Expired ── */
  else if (err instanceof TokenExpiredError) {
    statusCode = 401;
    message = 'Session expired. Please log in again.';
  }

  /* ── JWT: Invalid Signature / Malformed ── */
  else if (err instanceof JsonWebTokenError) {
    statusCode = 401;
    message = 'Invalid authentication token. Please log in again.';
  }

  /* ── Multer: File Too Large ── */
  else if ((err as any).type === 'entity.too.large') {
    statusCode = 413;
    message = 'Request body exceeds size limit';
  }

  /* ── Generic Error ── */
  else if (err instanceof Error) {
    message = config.isProduction ? 'An unexpected error occurred' : err.message;
  }

  // In production: never expose raw server error details
  const responseBody: Record<string, any> = {
    success: false,
    statusCode,
    message,
  };

  if (errors.length > 0) {
    responseBody.errors = errors;
  }

  // Stack trace only in development — never in production
  if (!config.isProduction && err.stack) {
    responseBody.stack = err.stack;
  }

  res.status(statusCode).json(responseBody);
};
