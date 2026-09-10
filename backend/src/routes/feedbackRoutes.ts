import { Router } from 'express';
import { submitFeedback, getAllFeedback } from '../controllers/feedbackController';
import { authenticate } from '../middlewares/authMiddleware';
import { requireAdmin } from '../middlewares/adminMiddleware';

const router = Router();

// Public feedback submission (supports guest and authenticated users)
router.post('/', submitFeedback);

// Admin-only review route
router.get('/', authenticate, requireAdmin, getAllFeedback);

export default router;
