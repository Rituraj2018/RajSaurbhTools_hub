import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError';
import { TOOL_CATEGORIES, ToolCategory } from '../models/Tool';

/**
 * Validates tool creation payload
 */
export const validateCreateTool = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const { name, category, description } = req.body;
  const errors: string[] = [];

  if (!name || typeof name !== 'string' || !name.trim()) {
    errors.push('Tool name is required');
  } else if (name.trim().length < 2 || name.trim().length > 100) {
    errors.push('Tool name must be between 2 and 100 characters');
  }

  if (!category || typeof category !== 'string' || !category.trim()) {
    errors.push('Tool category is required');
  } else if (!TOOL_CATEGORIES.includes(category as ToolCategory)) {
    errors.push(`Category must be one of: ${TOOL_CATEGORIES.join(', ')}`);
  }

  if (!description || typeof description !== 'string' || !description.trim()) {
    errors.push('Tool description is required');
  } else if (description.trim().length > 500) {
    errors.push('Tool description cannot exceed 500 characters');
  }

  if (errors.length > 0) {
    throw new ApiError(400, errors[0], errors);
  }

  next();
};

/**
 * Validates tool update payload
 */
export const validateUpdateTool = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const { name, category, description } = req.body;
  const errors: string[] = [];

  if (name !== undefined) {
    if (typeof name !== 'string' || !name.trim()) {
      errors.push('Tool name cannot be empty');
    } else if (name.trim().length < 2 || name.trim().length > 100) {
      errors.push('Tool name must be between 2 and 100 characters');
    }
  }

  if (category !== undefined) {
    if (typeof category !== 'string' || !category.trim()) {
      errors.push('Tool category cannot be empty');
    } else if (!TOOL_CATEGORIES.includes(category as ToolCategory)) {
      errors.push(`Category must be one of: ${TOOL_CATEGORIES.join(', ')}`);
    }
  }

  if (description !== undefined) {
    if (typeof description !== 'string' || !description.trim()) {
      errors.push('Tool description cannot be empty');
    } else if (description.trim().length > 500) {
      errors.push('Tool description cannot exceed 500 characters');
    }
  }

  if (errors.length > 0) {
    throw new ApiError(400, errors[0], errors);
  }

  next();
};
