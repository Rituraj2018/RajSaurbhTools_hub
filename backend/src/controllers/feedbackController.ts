import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Feedback } from '../models/Feedback';
import { User } from '../models/User';
import { config } from '../config/env';
import { emailService } from '../services/emailService';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/apiError';

interface JwtPayload {
  id: string;
  role: string;
}

/**
 * Optional User Helper
 * If an Authorization Bearer token is provided, extract user without failing if absent.
 */
const getOptionalUser = async (req: Request) => {
  if (req.user) return req.user;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
        if (decoded?.id) {
          const user = await User.findById(decoded.id);
          if (user && !user.isBlocked) {
            return user;
          }
        }
      } catch {
        // Ignore invalid token for public feedback
      }
    }
  }
  return null;
};

/**
 * @desc    Submit user feedback (Public / Authenticated)
 * @route   POST /api/feedback
 * @access  Public
 */
export const submitFeedback = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const {
      feedbackType,
      rating,
      ratingEmoji,
      toolId,
      toolName,
      message,
      featureTitle,
      featureBenefit,
      newToolName,
      newToolUse,
      expectedResult,
      actualResult,
      email,
    } = req.body;

    // Validate required fields
    if (!feedbackType) {
      throw new ApiError(400, 'Please select a feedback type');
    }

    const validTypes = ['bug', 'feature', 'improve_tool', 'new_tool', 'praise', 'other'];
    if (!validTypes.includes(feedbackType)) {
      throw new ApiError(400, 'Invalid feedback type selected');
    }

    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
      throw new ApiError(400, 'Please select a valid rating between 1 and 5');
    }

    const validEmojis = ['poor', 'okay', 'good', 'great', 'excellent'];
    if (!ratingEmoji || !validEmojis.includes(ratingEmoji)) {
      throw new ApiError(400, 'Please select a valid experience rating');
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      throw new ApiError(400, 'Feedback message is required');
    }

    if (message.trim().length > 1000) {
      throw new ApiError(400, 'Feedback message cannot exceed 1000 characters');
    }

    // Validate optional email
    let cleanEmail: string | undefined = undefined;
    if (email && typeof email === 'string' && email.trim().length > 0) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email.trim())) {
        throw new ApiError(400, 'Please provide a valid email address');
      }
      cleanEmail = email.trim().toLowerCase();
    }

    // Optional user attachment
    const currentUser = await getOptionalUser(req);

    const feedback = await Feedback.create({
      feedbackType,
      rating,
      ratingEmoji,
      toolId: toolId ? String(toolId).trim() : undefined,
      toolName: toolName ? String(toolName).trim() : undefined,
      message: message.trim(),
      featureTitle: featureTitle ? String(featureTitle).trim() : undefined,
      featureBenefit: featureBenefit ? String(featureBenefit).trim() : undefined,
      newToolName: newToolName ? String(newToolName).trim() : undefined,
      newToolUse: newToolUse ? String(newToolUse).trim() : undefined,
      expectedResult: expectedResult ? String(expectedResult).trim() : undefined,
      actualResult: actualResult ? String(actualResult).trim() : undefined,
      email: cleanEmail,
      user: currentUser ? currentUser._id : undefined,
      status: 'new',
    });

    // Send email notification to developer/admin (Non-blocking: failure never blocks user response)
    try {
      await emailService.sendFeedbackNotificationEmail({
        feedbackType: feedback.feedbackType,
        rating: feedback.rating,
        ratingEmoji: feedback.ratingEmoji,
        message: feedback.message,
        toolId: feedback.toolId || undefined,
        toolName: feedback.toolName || undefined,
        featureTitle: feedback.featureTitle || undefined,
        featureBenefit: feedback.featureBenefit || undefined,
        newToolName: feedback.newToolName || undefined,
        newToolUse: feedback.newToolUse || undefined,
        expectedResult: feedback.expectedResult || undefined,
        actualResult: feedback.actualResult || undefined,
        email: feedback.email || undefined,
        userName: currentUser?.name || undefined,
        userId: currentUser ? String(currentUser._id) : undefined,
        createdAt: feedback.createdAt,
      });
    } catch (emailError) {
      console.error('[Feedback] Non-fatal error sending notification email:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Thank you for your feedback! Your submission has been received.',
      data: {
        id: feedback._id,
        feedbackType: feedback.feedbackType,
        rating: feedback.rating,
        createdAt: feedback.createdAt,
      },
    });
  }
);

/**
 * @desc    Get all feedback entries (Admin only)
 * @route   GET /api/feedback
 * @access  Private/Admin
 */
export const getAllFeedback = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};
    if (req.query.type) {
      filter.feedbackType = req.query.type;
    }
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const [feedbacks, total] = await Promise.all([
      Feedback.find(filter)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Feedback.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      message: 'Feedbacks retrieved successfully',
      data: {
        feedbacks,
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  }
);
