import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { User } from '../models/User';
import { ApiError } from '../utils/apiError';
import { asyncHandler } from '../utils/asyncHandler';

interface JwtPayload {
  id: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Authentication middleware — verifies Bearer JWT and attaches user to request.
 *
 * Security checks performed:
 * 1. Token presence & format
 * 2. Signature validity + expiration (via jwt.verify)
 * 3. User still exists in database
 * 4. User account is not blocked
 */
export const authenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Authentication token missing or malformed');
    }

    const token = authHeader.split(' ')[1];

    if (!token || token.length === 0) {
      throw new ApiError(401, 'Authentication token required');
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
    } catch {
      // Do not leak whether the token is expired vs invalid — generic message
      throw new ApiError(401, 'Invalid or expired authentication token');
    }

    // Ensure the user still exists (token may be valid but account deleted)
    const user = await User.findById(decoded.id).select('+isBlocked');
    if (!user) {
      throw new ApiError(401, 'User account no longer exists');
    }

    // Reject blocked accounts immediately
    if (user.isBlocked) {
      throw new ApiError(
        403,
        'Your account has been suspended. Please contact support.'
      );
    }

    // Attach authenticated user to request
    req.user = user;
    next();
  }
);
