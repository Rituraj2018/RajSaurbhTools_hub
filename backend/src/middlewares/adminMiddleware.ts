import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * Middleware that restricts route access strictly to administrator users
 */
export const requireAdmin = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required');
    }

    if (req.user.role !== 'admin') {
      throw new ApiError(403, 'Forbidden: Admin privileges required');
    }

    next();
  }
);
