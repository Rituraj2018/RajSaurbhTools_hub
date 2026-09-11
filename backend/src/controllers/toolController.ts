import { Request, Response } from 'express';
import { Tool, ITool } from '../models/Tool';
import { HistoryRecord } from '../models/History';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/apiError';
import { seedInitialTools, INITIAL_STATIC_TOOLS } from '../utils/seedTools';

/**
 * Helper to generate a URL-friendly slug from a string
 */
const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Helper to escape regex special characters in user input
 */
const escapeRegex = (text: string): string => {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

/**
 * @desc    Get all tools with filtering & search support
 * @route   GET /api/tools
 * @access  Public
 */
export const getTools = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  // Ensure database has tools seeded if empty or missing newly added tools
  const count = await Tool.countDocuments();
  const staticCount = Array.isArray(INITIAL_STATIC_TOOLS) ? INITIAL_STATIC_TOOLS.length : 0;
  if (count < staticCount && staticCount > 0 && typeof seedInitialTools === 'function') {
    await seedInitialTools();
  }

  const { category, search, isFeatured, isActive } = req.query;

  const filter: Record<string, any> = {};

  // Category filtering (case-insensitive & safe against regex syntax errors)
  if (category && typeof category === 'string' && category.trim() && category.toLowerCase() !== 'all') {
    const trimmedCat = category.trim();
    if (trimmedCat.toLowerCase().includes('id card')) {
      filter.category = new RegExp('id card', 'i');
    } else {
      filter.category = new RegExp(`^${escapeRegex(trimmedCat)}$`, 'i');
    }
  }

  // Active status filter (default to active for public queries)
  if (isActive !== undefined) {
    filter.isActive = isActive === 'true';
  } else {
    filter.isActive = true;
  }

  // Featured status filter
  if (isFeatured !== undefined) {
    filter.isFeatured = isFeatured === 'true';
  }

  // Search filter across name and description (safe regex escaping)
  if (search && typeof search === 'string' && search.trim()) {
    const searchRegex = new RegExp(escapeRegex(search.trim()), 'i');
    filter.$or = [{ name: searchRegex }, { description: searchRegex }];
  }

  const tools = await Tool.find(filter).sort({ isFeatured: -1, createdAt: 1 });

  res.status(200).json({
    success: true,
    message: 'Tools retrieved successfully',
    data: {
      tools,
      total: tools.length,
    },
  });
});

/**
 * @desc    Get top popular tools ranked by real user processing history
 * @route   GET /api/tools/popular
 * @access  Public
 */
export const getPopularTools = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  // Aggregate completed history records to find the most used tools
  const topHistory = await HistoryRecord.aggregate([
    {
      $match: {
        status: { $in: ['completed', 'processing'] },
      },
    },
    {
      $group: {
        _id: { $toLower: '$tool' },
        toolName: { $first: '$toolName' },
        usageCount: { $sum: 1 },
      },
    },
    { $sort: { usageCount: -1 } },
    { $limit: 10 },
  ]);

  res.status(200).json({
    success: true,
    message: 'Popular tools retrieved successfully',
    data: {
      popular: topHistory.map((item) => ({
        slug: item._id,
        toolName: item.toolName,
        usageCount: item.usageCount,
      })),
    },
  });
});

/**
 * @desc    Get a single tool by slug
 * @route   GET /api/tools/:slug
 * @access  Public
 */
export const getToolBySlug = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { slug } = req.params;

  const tool = await Tool.findOne({ slug: slug.toLowerCase().trim() });

  if (!tool) {
    throw new ApiError(404, `Tool with slug '${slug}' not found`);
  }

  res.status(200).json({
    success: true,
    message: 'Tool retrieved successfully',
    data: {
      tool,
    },
  });
});

/**
 * @desc    Create a new tool (Admin only)
 * @route   POST /api/tools
 * @access  Private (Admin)
 */
export const createTool = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { name, slug, description, category, icon, isActive, isFeatured } = req.body;

  const toolSlug = slug ? generateSlug(slug) : generateSlug(name);

  // Check if slug already exists
  const existingTool = await Tool.findOne({ slug: toolSlug });
  if (existingTool) {
    throw new ApiError(409, `Tool with slug '${toolSlug}' already exists`);
  }

  const newTool = await Tool.create({
    name: name.trim(),
    slug: toolSlug,
    description: description.trim(),
    category,
    icon: icon ? icon.trim() : 'Wrench',
    isActive: isActive !== undefined ? isActive : true,
    isFeatured: isFeatured !== undefined ? isFeatured : false,
  });

  res.status(201).json({
    success: true,
    message: 'Tool created successfully',
    data: {
      tool: newTool,
    },
  });
});

/**
 * @desc    Update an existing tool (Admin only)
 * @route   PUT /api/tools/:id
 * @access  Private (Admin)
 */
export const updateTool = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const updateData: Partial<ITool> = { ...req.body };

  if (updateData.slug) {
    updateData.slug = generateSlug(updateData.slug);
    const existingWithSlug = await Tool.findOne({
      slug: updateData.slug,
      _id: { $ne: id },
    });
    if (existingWithSlug) {
      throw new ApiError(409, `Tool with slug '${updateData.slug}' already exists`);
    }
  }

  const updatedTool = await Tool.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!updatedTool) {
    throw new ApiError(404, `Tool with ID '${id}' not found`);
  }

  res.status(200).json({
    success: true,
    message: 'Tool updated successfully',
    data: {
      tool: updatedTool,
    },
  });
});

/**
 * @desc    Delete a tool (Admin only)
 * @route   DELETE /api/tools/:id
 * @access  Private (Admin)
 */
export const deleteTool = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const deletedTool = await Tool.findByIdAndDelete(id);

  if (!deletedTool) {
    throw new ApiError(404, `Tool with ID '${id}' not found`);
  }

  res.status(200).json({
    success: true,
    message: 'Tool deleted successfully',
    data: {
      id: deletedTool._id,
      name: deletedTool.name,
      slug: deletedTool.slug,
    },
  });
});
