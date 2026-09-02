import { Request, Response } from 'express';
import { HistoryRecord } from '../models/History';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/apiError';

/**
 * @desc    Get authenticated user's processing history with search, filtering, and pagination
 * @route   GET /api/history
 * @access  Private (Requires Authentication)
 */
export const getUserHistory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new ApiError(401, 'Authentication required');
  }

  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
  const skip = (page - 1) * limit;

  const search = (req.query.search as string)?.trim();
  const tool = (req.query.tool as string)?.trim();
  const status = (req.query.status as string)?.trim().toLowerCase();
  const sortBy = (req.query.sortBy as string) || 'newest';

  // Base filter: user can ONLY view their own processing history
  const query: Record<string, any> = {
    user: req.user._id,
  };

  // Tool filter
  if (tool && tool !== 'all') {
    query.$or = [
      { tool: { $regex: tool, $options: 'i' } },
      { toolName: { $regex: tool, $options: 'i' } },
    ];
  }

  // Status filter
  if (status && status !== 'all') {
    query.status = status;
  }

  // Search filter across tool name, tool slug, input files, and output file
  if (search) {
    const searchRegex = { $regex: search, $options: 'i' };
    const searchConditions = [
      { tool: searchRegex },
      { toolName: searchRegex },
      { 'inputFiles.name': searchRegex },
      { inputFiles: searchRegex },
      { 'outputFile.name': searchRegex },
      { outputFile: searchRegex },
    ];

    if (query.$or) {
      query.$and = [{ $or: query.$or }, { $or: searchConditions }];
      delete query.$or;
    } else {
      query.$or = searchConditions;
    }
  }

  // Sorting
  const sortOption: Record<string, any> =
    sortBy === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };

  const [history, totalItems, allUserHistory] = await Promise.all([
    HistoryRecord.find(query).sort(sortOption).skip(skip).limit(limit),
    HistoryRecord.countDocuments(query),
    // Aggregate user operations metrics
    HistoryRecord.find({ user: req.user._id }).select('status'),
  ]);

  const totalPages = Math.ceil(totalItems / limit) || 1;

  // Compute status statistics
  const totalCount = allUserHistory.length;
  const completedCount = allUserHistory.filter((h) => h.status === 'completed').length;
  const processingCount = allUserHistory.filter((h) => h.status === 'processing').length;
  const failedCount = allUserHistory.filter((h) => h.status === 'failed').length;

  res.status(200).json({
    success: true,
    message: 'Processing history retrieved successfully',
    data: {
      history,
      totalItems,
      totalPages,
      currentPage: page,
      limit,
      stats: {
        totalCount,
        completedCount,
        processingCount,
        failedCount,
      },
    },
  });
});

/**
 * @desc    Record a new processing history entry
 * @route   POST /api/history
 * @access  Private (Requires Authentication)
 */
export const createHistoryEntry = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new ApiError(401, 'Authentication required');
  }

  const { tool, toolName, inputFiles, outputFile, status, metadata } = req.body;

  if (!tool) {
    throw new ApiError(400, 'Tool identifier is required');
  }

  const historyEntry = await HistoryRecord.create({
    user: req.user._id,
    tool,
    toolName: toolName || tool,
    inputFiles: inputFiles || [],
    outputFile: outputFile || null,
    status: status || 'completed',
    metadata: metadata || {},
  });

  res.status(201).json({
    success: true,
    message: 'History entry recorded successfully',
    data: {
      history: historyEntry,
    },
  });
});

/**
 * @desc    Clear all processing history for the authenticated user
 * @route   DELETE /api/history
 * @access  Private (Requires Authentication)
 */
export const clearUserHistory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new ApiError(401, 'Authentication required');
  }

  const result = await HistoryRecord.deleteMany({ user: req.user._id });

  res.status(200).json({
    success: true,
    message: 'Processing history cleared successfully',
    data: {
      deletedCount: result.deletedCount,
    },
  });
});
