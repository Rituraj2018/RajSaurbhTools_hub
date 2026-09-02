import { Router } from 'express';
import {
  getTools,
  getToolBySlug,
  createTool,
  updateTool,
  deleteTool,
} from '../controllers/toolController';
import { validateCreateTool, validateUpdateTool } from '../validators/tool.validator';
import { authenticate } from '../middlewares/authMiddleware';
import { requireAdmin } from '../middlewares/adminMiddleware';

const router = Router();

/**
 * Public Routes
 */
// GET /api/tools - Retrieve all tools with query filtering
router.get('/', getTools);

// GET /api/tools/:slug - Retrieve single tool details by slug
router.get('/:slug', getToolBySlug);

/**
 * Admin Protected Routes
 */
// POST /api/tools - Create a new tool
router.post('/', authenticate, requireAdmin, validateCreateTool, createTool);

// PUT /api/tools/:id - Update an existing tool
router.put('/:id', authenticate, requireAdmin, validateUpdateTool, updateTool);

// DELETE /api/tools/:id - Delete a tool
router.delete('/:id', authenticate, requireAdmin, deleteTool);

export default router;
