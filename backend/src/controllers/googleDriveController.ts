import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { GoogleDriveService } from '../services/googleDriveService';

/**
 * @desc    Get Google Drive client configuration (Client ID only, no secrets)
 * @route   GET /api/drive/config
 * @access  Public
 */
export const getDriveConfig = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const config = GoogleDriveService.getPublicConfig();

  res.status(200).json({
    success: true,
    message: 'Google Drive configuration retrieved',
    data: config,
  });
});

/**
 * @desc    Get Google Drive status for the authenticated user
 * @route   GET /api/drive/status
 * @access  Private (Requires Bearer token)
 */
export const getDriveStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const isConfigured = GoogleDriveService.isConfigured();

  res.status(200).json({
    success: true,
    message: 'Google Drive status retrieved',
    data: {
      isConfigured,
      userEmail: req.user?.email,
      recommendedFolder: 'Vikas Tool Hub',
      storagePolicy: 'direct-client-to-drive',
    },
  });
});
