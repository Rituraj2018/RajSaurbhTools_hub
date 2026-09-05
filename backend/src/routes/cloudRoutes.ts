import { Router } from 'express';
import {
  getCloudStatus,
  getGoogleAuthUrl,
  handleGoogleCallback,
  getMicrosoftAuthUrl,
  handleMicrosoftCallback,
  disconnectProvider,
} from '../controllers/cloudController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

/**
 * @route   GET /api/cloud/status
 * @desc    Get cloud connection status for all providers
 * @access  Private
 */
router.get('/status', authenticate, getCloudStatus);

/**
 * @route   GET /api/cloud/google/auth-url
 * @desc    Get Google OAuth authorization URL
 * @access  Private
 */
router.get('/google/auth-url', authenticate, getGoogleAuthUrl);

/**
 * @route   GET /api/cloud/google/callback
 * @desc    Handle Google OAuth callback (redirect from Google)
 * @access  Public
 */
router.get('/google/callback', handleGoogleCallback);

/**
 * @route   GET /api/cloud/microsoft/auth-url
 * @desc    Get Microsoft OAuth authorization URL
 * @access  Private
 */
router.get('/microsoft/auth-url', authenticate, getMicrosoftAuthUrl);

/**
 * @route   GET /api/cloud/microsoft/callback
 * @desc    Handle Microsoft OAuth callback (redirect from Microsoft)
 * @access  Public
 */
router.get('/microsoft/callback', handleMicrosoftCallback);

/**
 * @route   POST /api/cloud/disconnect
 * @desc    Disconnect a cloud provider
 * @access  Private
 */
router.post('/disconnect', authenticate, disconnectProvider);

export default router;
