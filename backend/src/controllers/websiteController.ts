import { Request, Response } from 'express';
import { Website, HTTP_URL_REGEX } from '../models/Website';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/apiError';

/**
 * Validate URL helper to safely reject malicious protocols
 */
const validateSafeUrl = (url: string): string => {
  const trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    throw new ApiError(400, 'Website URL must begin with http:// or https://');
  }
  if (/^(javascript|data|vbscript|file):/i.test(trimmed)) {
    throw new ApiError(400, 'Unsafe URL scheme detected. Only HTTP and HTTPS are permitted.');
  }
  if (!HTTP_URL_REGEX.test(trimmed)) {
    throw new ApiError(400, 'Please enter a valid website URL (e.g. https://example.com)');
  }
  return trimmed;
};

/**
 * @desc    Get all useful websites (Public / Admin)
 * @route   GET /api/websites
 * @access  Public
 */
export const getWebsites = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { isActive, search } = req.query;

    const filter: Record<string, any> = {};

    // By default, public queries only retrieve active websites
    if (isActive !== undefined && isActive !== 'all') {
      filter.isActive = isActive === 'true';
    } else if (isActive === undefined) {
      filter.isActive = true;
    }

    if (search && typeof search === 'string' && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [{ name: searchRegex }, { description: searchRegex }, { url: searchRegex }];
    }

    // Newest first
    const websites = await Website.find(filter)
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      message: 'Websites retrieved successfully',
      data: {
        websites,
        total: websites.length,
      },
    });
  }
);

/**
 * @desc    Get a single website by ID
 * @route   GET /api/websites/:id
 * @access  Public
 */
export const getWebsiteById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const website = await Website.findById(id).populate('createdBy', 'name email');

    if (!website) {
      throw new ApiError(404, `Website with ID '${id}' not found`);
    }

    res.status(200).json({
      success: true,
      message: 'Website retrieved successfully',
      data: {
        website,
      },
    });
  }
);

/**
 * @desc    Create a new useful website link (Admin only)
 * @route   POST /api/websites
 * @access  Private (Admin)
 */
export const createWebsite = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { name, url, description, iconUrl, isActive } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new ApiError(400, 'Website name is required');
    }

    if (name.trim().length > 100) {
      throw new ApiError(400, 'Website name cannot exceed 100 characters');
    }

    if (!url || typeof url !== 'string' || url.trim().length === 0) {
      throw new ApiError(400, 'Website URL is required');
    }

    const validatedUrl = validateSafeUrl(url);

    // Prevent exact duplicate active URLs if added accidentally
    const existing = await Website.findOne({ url: validatedUrl });
    if (existing) {
      throw new ApiError(409, `A website entry with URL '${validatedUrl}' already exists (${existing.name})`);
    }

    const newWebsite = await Website.create({
      name: name.trim(),
      url: validatedUrl,
      description: description && typeof description === 'string' ? description.trim() : '',
      iconUrl: iconUrl && typeof iconUrl === 'string' ? iconUrl.trim() : '',
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      createdBy: req.user?._id || null,
    });

    res.status(201).json({
      success: true,
      message: 'Website added successfully.',
      data: {
        website: newWebsite,
      },
    });
  }
);

/**
 * @desc    Update an existing website entry (Admin only)
 * @route   PUT /api/websites/:id
 * @access  Private (Admin)
 */
export const updateWebsite = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { name, url, description, iconUrl, isActive } = req.body;

    const existingWebsite = await Website.findById(id);
    if (!existingWebsite) {
      throw new ApiError(404, `Website with ID '${id}' not found`);
    }

    const updatePayload: Record<string, any> = {};

    if (name !== undefined) {
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        throw new ApiError(400, 'Website name cannot be empty');
      }
      if (name.trim().length > 100) {
        throw new ApiError(400, 'Website name cannot exceed 100 characters');
      }
      updatePayload.name = name.trim();
    }

    if (url !== undefined) {
      if (!url || typeof url !== 'string' || url.trim().length === 0) {
        throw new ApiError(400, 'Website URL cannot be empty');
      }
      const validatedUrl = validateSafeUrl(url);
      // Check collision with other websites
      const duplicate = await Website.findOne({ url: validatedUrl, _id: { $ne: id } });
      if (duplicate) {
        throw new ApiError(409, `Another website with URL '${validatedUrl}' already exists (${duplicate.name})`);
      }
      updatePayload.url = validatedUrl;
    }

    if (description !== undefined) {
      updatePayload.description = typeof description === 'string' ? description.trim() : '';
    }

    if (iconUrl !== undefined) {
      updatePayload.iconUrl = typeof iconUrl === 'string' ? iconUrl.trim() : '';
    }

    if (isActive !== undefined) {
      updatePayload.isActive = Boolean(isActive);
    }

    const updatedWebsite = await Website.findByIdAndUpdate(id, updatePayload, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Website updated successfully.',
      data: {
        website: updatedWebsite,
      },
    });
  }
);

/**
 * @desc    Delete a website entry (Admin only)
 * @route   DELETE /api/websites/:id
 * @access  Private (Admin)
 */
export const deleteWebsite = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const deletedWebsite = await Website.findByIdAndDelete(id);

    if (!deletedWebsite) {
      throw new ApiError(404, `Website with ID '${id}' not found`);
    }

    res.status(200).json({
      success: true,
      message: 'Website deleted successfully.',
      data: {
        id: deletedWebsite._id,
        name: deletedWebsite.name,
        url: deletedWebsite.url,
      },
    });
  }
);
