import { Router } from 'express';
import { getDriveConfig, getDriveStatus } from '../controllers/googleDriveController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

/**
 * @route   GET /api/drive/config
 * @desc    Get Google Drive client config (public client ID)
 * @access  Public
 */
router.get('/config', getDriveConfig);

/**
 * @route   GET /api/drive/status
 * @desc    Get Google Drive integration status
 * @access  Private
 */
router.get('/status', authenticate, getDriveStatus);

export default router;
