import mongoose from 'mongoose';
import { Request, Response } from 'express';
import { User } from '../models/User';
import { Tool } from '../models/Tool';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/apiError';
import { seedInitialTools } from '../utils/seedTools';

/**
 * @desc    Toggle a tool in the authenticated user's favorites (Add if absent, Remove if present)
 * @route   POST /api/users/favorites/:toolId
 * @access  Private (Requires Authentication)
 */
export const toggleFavoriteTool = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new ApiError(401, 'Authentication required');
  }

  const { toolId } = req.params;
  if (!toolId) {
    throw new ApiError(400, 'Tool ID or slug is required');
  }

  const cleanId = toolId.toLowerCase().trim();
  const isObjectId = mongoose.Types.ObjectId.isValid(cleanId) && /^[0-9a-fA-F]{24}$/.test(cleanId);
  const tool = await Tool.findOne({
    $or: [
      ...(isObjectId ? [{ _id: cleanId }] : []),
      { slug: cleanId },
      ...(cleanId === 'ayushman-print-tool' ? [{ slug: 'ayushman-card-print' }] : []),
    ],
  });

  if (!tool) {
    throw new ApiError(404, 'Tool not found');
  }

  const user = await User.findById(req.user._id).select('favoriteTools');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const toolObjectIdStr = tool._id.toString();
  const isCurrentlyFav = (user.favoriteTools || []).some(
    (favId: any) => favId.toString() === toolObjectIdStr
  );

  let updatedUser;
  if (isCurrentlyFav) {
    // Already in favorites -> Remove it
    updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { favoriteTools: tool._id } },
      { new: true, select: 'favoriteTools' }
    );
  } else {
    // Not in favorites -> Add it atomically
    updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { favoriteTools: tool._id } },
      { new: true, select: 'favoriteTools' }
    );
  }

  if (!updatedUser) {
    throw new ApiError(404, 'User not found');
  }

  const favoriteTools = (updatedUser.favoriteTools || []).map((id: any) => id.toString());

  res.status(200).json({
    success: true,
    message: isCurrentlyFav
      ? 'Tool removed from favorites successfully'
      : 'Tool added to favorites successfully',
    data: {
      isFavorite: !isCurrentlyFav,
      favoriteTools,
      toolId: tool._id.toString(),
    },
  });
});

export const addFavoriteTool = toggleFavoriteTool;

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

  const cleanId = toolId.toLowerCase().trim();
  const isObjectId = mongoose.Types.ObjectId.isValid(cleanId) && /^[0-9a-fA-F]{24}$/.test(cleanId);
  const tool = await Tool.findOne({
    $or: [
      ...(isObjectId ? [{ _id: cleanId }] : []),
      { slug: cleanId },
      ...(cleanId === 'ayushman-print-tool' ? [{ slug: 'ayushman-card-print' }] : []),
    ],
  });

  const targetObjectId = tool
    ? tool._id
    : isObjectId
    ? new mongoose.Types.ObjectId(cleanId)
    : null;

  if (!targetObjectId) {
    throw new ApiError(404, 'Tool not found');
  }

  // Remove Tool ObjectId from favorites array
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { $pull: { favoriteTools: targetObjectId } },
    { new: true, select: 'favoriteTools' }
  );

  if (!updatedUser) {
    throw new ApiError(404, 'User not found');
  }

  const favoriteTools = (updatedUser.favoriteTools || []).map((id: any) => id.toString());

  res.status(200).json({
    success: true,
    message: 'Tool removed from favorites successfully',
    data: {
      favoriteTools,
      toolId: tool ? tool._id.toString() : toolId,
    },
  });
});

/**
 * @desc    Get authenticated user's favorite tools list (populated Tool objects)
 * @route   GET /api/users/favorites
 * @access  Private (Requires Authentication)
 */
export const getFavoriteTools = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new ApiError(401, 'Authentication required');
  }

  const count = await Tool.countDocuments();
  if (count === 0) {
    await seedInitialTools();
  }

  const user = await User.findById(req.user._id)
    .select('favoriteTools')
    .populate('favoriteTools');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Ensure only valid, active populated tool objects are returned
  const populatedTools = (user.favoriteTools || []).filter(
    (item: any) => item && typeof item === 'object' && item._id && item.isActive !== false
  );

  const favoriteIds: string[] = populatedTools.map((t: any) => t._id.toString());

  res.status(200).json({
    success: true,
    message: 'Favorite tools retrieved successfully',
    data: {
      favoriteIds,
      favorites: populatedTools,
      totalFavorites: favoriteIds.length,
    },
  });
});
