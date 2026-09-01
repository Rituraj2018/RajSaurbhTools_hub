import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { getDatabaseStatus } from '../config/database';

export const getHealthStatus = asyncHandler(async (_req: Request, res: Response) => {
  const dbStatus = getDatabaseStatus();

  return res.status(200).json({
    success: true,
    message: 'Server is running',
    database: dbStatus,
  });
});
