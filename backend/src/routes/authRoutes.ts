import { Router } from 'express';
import { registerUser, loginUser, getUserProfile } from '../controllers/authController';
import { validateRegister, validateLogin } from '../validators/auth.validator';
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
 * @route   GET /api/auth/profile
 * @desc    Get currently authenticated user's profile
 * @access  Private (Protected route)
 */
router.get('/profile', authenticate, getUserProfile);

export default router;
