import { Request, Response } from 'express';
import { User } from '../models/User';
import { Tool } from '../models/Tool';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/apiError';

/**
 * @desc    Add a tool to the authenticated user's favorites (prevents duplicates via $addToSet)
 * @route   POST /api/users/favorites/:toolId
 * @access  Private (Requires Authentication)
 */
export const addFavoriteTool = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new ApiError(401, 'Authentication required');
  }

  const { toolId } = req.params;
  if (!toolId) {
    throw new ApiError(400, 'Tool ID or slug is required');
  }

  // Atomically add to favorites array if not already present
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { favoriteTools: toolId } },
    { new: true, select: 'favoriteTools' }
  );

  if (!updatedUser) {
    throw new ApiError(404, 'User not found');
  }

  res.status(200).json({
    success: true,
    message: 'Tool added to favorites successfully',
    data: {
      favoriteTools: updatedUser.favoriteTools || [],
      toolId,
    },
  });
});

/**
 * @desc    Remove a tool from the authenticated user's favorites
 * @route   DELETE /api/users/favorites/:toolId
 * @access  Private (Requires Authentication)
 */
export const removeFavoriteTool = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new ApiError(401, 'Authentication required');
  }

  const { toolId } = req.params;
  if (!toolId) {
    throw new ApiError(400, 'Tool ID or slug is required');
  }

  // Remove from favorites array
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { $pull: { favoriteTools: toolId } },
    { new: true, select: 'favoriteTools' }
  );

  if (!updatedUser) {
    throw new ApiError(404, 'User not found');
  }

  res.status(200).json({
    success: true,
    message: 'Tool removed from favorites successfully',
    data: {
      favoriteTools: updatedUser.favoriteTools || [],
      toolId,
    },
  });
});

/**
 * @desc    Get authenticated user's favorite tools list
 * @route   GET /api/users/favorites
 * @access  Private (Requires Authentication)
 */
export const getFavoriteTools = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new ApiError(401, 'Authentication required');
  }

  const user = await User.findById(req.user._id).select('favoriteTools');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const favoriteIds: string[] = user.favoriteTools || [];

  let favoriteTools: any[] = [];
  if (favoriteIds.length > 0) {
    const validObjectIds = favoriteIds.filter((id) => /^[0-9a-fA-F]{24}$/.test(id));
    const orConditions: any[] = [{ slug: { $in: favoriteIds } }];
    if (validObjectIds.length > 0) {
      orConditions.push({ _id: { $in: validObjectIds } });
    }
    favoriteTools = await Tool.find({
      $or: orConditions,
      isActive: true,
    });
  }

  res.status(200).json({
    success: true,
    message: 'Favorite tools retrieved successfully',
    data: {
      favoriteIds,
      favorites: favoriteTools,
      totalFavorites: favoriteIds.length,
    },
  });
});
