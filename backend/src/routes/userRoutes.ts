import { Router } from 'express';
import {
  addFavoriteTool,
  removeFavoriteTool,
  getFavoriteTools,
} from '../controllers/userController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

/**
 * @route   GET /api/users/favorites
 * @desc    Get authenticated user's favorite tools
 * @access  Private (Requires Authentication)
 */
router.get('/favorites', authenticate, getFavoriteTools);

/**
 * @route   POST /api/users/favorites/:toolId
 * @desc    Add a tool to favorites
 * @access  Private (Requires Authentication)
 */
router.post('/favorites/:toolId', authenticate, addFavoriteTool);

/**
 * @route   DELETE /api/users/favorites/:toolId
 * @desc    Remove a tool from favorites
 * @access  Private (Requires Authentication)
 */
router.delete('/favorites/:toolId', authenticate, removeFavoriteTool);

export default router;
