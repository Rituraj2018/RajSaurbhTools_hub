import { Router } from 'express';
import {
  getUserHistory,
  createHistoryEntry,
  clearUserHistory,
} from '../controllers/historyController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

/**
 * @route   GET /api/history
 * @desc    Get user's processing history (with search, tool filter, status filter, pagination)
 * @access  Private (Requires Authentication)
 */
router.get('/', authenticate, getUserHistory);

/**
 * @route   POST /api/history
 * @desc    Record a new processing history entry
 * @access  Private (Requires Authentication)
 */
router.post('/', authenticate, createHistoryEntry);

/**
 * @route   DELETE /api/history
 * @desc    Clear all processing history for the authenticated user
 * @access  Private (Requires Authentication)
 */
router.delete('/', authenticate, clearUserHistory);

export default router;
