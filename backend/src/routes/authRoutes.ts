import { Router } from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  googleLogin,
  forgotPassword,
  resetPassword,
} from '../controllers/authController';
import {
  validateRegister,
  validateLogin,
  validateGoogleAuth,
  validateForgotPassword,
  validateResetPassword,
} from '../validators/auth.validator';
import { authenticate } from '../middlewares/authMiddleware';
import { authRateLimiter } from '../middlewares/rateLimiter';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public — brute-force rate limited
 */
router.post('/register', authRateLimiter, validateRegister, registerUser);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get JWT token
 * @access  Public — brute-force rate limited
 */
router.post('/login', authRateLimiter, validateLogin, loginUser);

/**
 * @route   POST /api/auth/google
 * @desc    Authenticate/Register user via Google OAuth ID token
 * @access  Public — brute-force rate limited
 */
router.post('/google', authRateLimiter, validateGoogleAuth, googleLogin);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset email
 * @access  Public — brute-force rate limited
 */
router.post('/forgot-password', authRateLimiter, validateForgotPassword, forgotPassword);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset user password using token in request body
 * @access  Public — brute-force rate limited
 */
router.post('/reset-password', authRateLimiter, validateResetPassword, resetPassword);

/**
 * @route   POST /api/auth/reset-password/:token
 * @desc    Reset user password using token in URL parameter
 * @access  Public — brute-force rate limited
 */
router.post('/reset-password/:token', authRateLimiter, validateResetPassword, resetPassword);

/**
 * @route   GET /api/auth/profile
 * @desc    Get currently authenticated user's profile
 * @access  Private (Protected route)
 */
router.get('/profile', authenticate, getUserProfile);

export default router;
