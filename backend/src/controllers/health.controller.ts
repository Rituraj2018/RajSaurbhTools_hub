import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { getDatabaseStatus } from '../config/database';

export const getHealthStatus = asyncHandler(async (_req: Request, res: Response) => {
  const dbStatus = getDatabaseStatus();

  // Format process uptime as human-readable string
  const uptimeSec = Math.floor(process.uptime());
  const hours = Math.floor(uptimeSec / 3600);
  const minutes = Math.floor((uptimeSec % 3600) / 60);
  const seconds = uptimeSec % 60;
  const uptime = `${hours}h ${minutes}m ${seconds}s`;

  return res.status(200).json({
    success: true,
    status: 'healthy',
    message: 'Server is running',
    database: dbStatus,
    uptime,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});
