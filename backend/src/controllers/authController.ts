import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { User } from '../models/User';
import { emailService } from '../services';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/apiError';
import { config } from '../config/env';

const googleClient = new OAuth2Client(config.google.clientId);

/**
 * Generates a signed JWT token for a given user ID and role
 */
const generateToken = (userId: string, role: string): string => {
  const payload = { id: userId, role };
  const signOptions: SignOptions = {
    expiresIn: config.jwtExpiresIn as unknown as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, config.jwtSecret, signOptions);
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body;

  const normalizedEmail = email.trim().toLowerCase();

  // Check if user already exists
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new ApiError(409, 'User with this email already exists');
  }

  // Hash password using bcrypt
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Create new user in database
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    role: 'user',
    isEmailVerified: false,
  });

  // Return success response with 201 Created status
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  });
});

/**
 * @desc    Authenticate user & get JWT token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const normalizedEmail = email.trim().toLowerCase();

  // Find user and explicitly select password field
  const user = await User.findOne({ email: normalizedEmail }).select('+password');
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Compare hashed password
  const isMatch = await bcrypt.compare(password, user.password || '');
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Generate JWT token
  const token = generateToken(user._id.toString(), user.role);

  // Return token and user data without password
  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  });
});

/**
 * @desc    Get currently authenticated user's profile
 * @route   GET /api/auth/profile
 * @access  Private (Requires Bearer JWT)
 */
export const getUserProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = req.user;

  if (!user) {
    throw new ApiError(401, 'Not authorized, user not found');
  }

  res.status(200).json({
    success: true,
    message: 'Profile retrieved successfully',
    data: {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage || '',
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    },
  });
});

/**
 * @desc    Authenticate or register user via verified Google ID token
 * @route   POST /api/auth/google
 * @access  Public
 */
export const googleLogin = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const credential = req.body.credential || req.body.token || req.body.idToken;

  if (!credential || typeof credential !== 'string') {
    throw new ApiError(400, 'Google authentication credential is required');
  }

  let ticket;
  try {
    ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: config.google.clientId || undefined,
    });
  } catch (error: any) {
    throw new ApiError(401, 'Invalid or expired Google authentication credential');
  }

  const payload = ticket.getPayload();
  if (!payload || !payload.email) {
    throw new ApiError(401, 'Unable to retrieve verified email from Google credential');
  }

  const { sub: googleId, email, name, picture, email_verified } = payload;
  const normalizedEmail = email.trim().toLowerCase();

  // Find user by googleId or email
  let user = await User.findOne({
    $or: [{ googleId }, { email: normalizedEmail }],
  });

  if (user) {
    // Check if user is suspended/blocked
    if (user.isBlocked) {
      throw new ApiError(403, 'Your account has been suspended. Please contact support.');
    }

    let needsSave = false;

    // Link Google ID if user registered previously with email/password
    if (!user.googleId) {
      user.googleId = googleId;
      needsSave = true;
    }

    // If email is verified by Google, mark email as verified
    if (email_verified && !user.isEmailVerified) {
      user.isEmailVerified = true;
      needsSave = true;
    }

    // Set profile image if not already set
    if (!user.profileImage && picture) {
      user.profileImage = picture;
      needsSave = true;
    }

    if (needsSave) {
      await user.save();
    }
  } else {
    // Create new user for first-time Google sign in
    user = await User.create({
      name: name?.trim() || 'Google User',
      email: normalizedEmail,
      googleId,
      role: 'user',
      isEmailVerified: Boolean(email_verified),
      profileImage: picture || '',
      favoriteTools: [],
    });
  }

  // Generate existing project JWT
  const token = generateToken(user._id.toString(), user.role);

  // Return standard auth response structure
  res.status(200).json({
    success: true,
    message: 'Google authentication successful',
    data: {
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage || '',
      },
    },
  });
});

/**
 * @desc    Initiate password reset: generate single-use token and send reset email
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  // Find user by email
  const user = await User.findOne({ email: normalizedEmail });

  // Anti-enumeration: If user not found or isBlocked, return identical success message
  if (!user || user.isBlocked) {
    res.status(200).json({
      success: true,
      message:
        'If an account with that email address exists, a password reset link has been sent.',
    });
    return;
  }

  // Generate cryptographically secure random token (32 bytes = 64 hex characters)
  const rawToken = crypto.randomBytes(32).toString('hex');

  // Compute SHA-256 hash to store in the database
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  // Set token and expiration (15 minutes from now)
  user.resetPasswordToken = tokenHash;
  user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  // Construct secure frontend reset URL
  const resetUrl = `${config.clientUrl}/reset-password/${rawToken}`;

  // Dispatch email
  await emailService.sendPasswordResetEmail(user.email, user.name, resetUrl);

  // Return standard success response without exposing any token
  res.status(200).json({
    success: true,
    message:
      'If an account with that email address exists, a password reset link has been sent.',
  });
});

/**
 * @desc    Reset password using a valid, non-expired reset token
 * @route   POST /api/auth/reset-password/:token or POST /api/auth/reset-password
 * @access  Public
 */
export const resetPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const rawToken = req.params.token || req.body.token;
  const password = req.body.password || req.body.newPassword;

  if (!rawToken || typeof rawToken !== 'string') {
    throw new ApiError(400, 'Password reset token is required');
  }

  // Hash the incoming raw token with SHA-256 to compare against database
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  // Query user with matching unexpired token
  const user = await User.findOne({
    resetPasswordToken: tokenHash,
    resetPasswordExpires: { $gt: new Date() },
  }).select('+password +resetPasswordToken +resetPasswordExpires');

  if (!user) {
    throw new ApiError(400, 'Password reset token is invalid or has expired');
  }

  if (user.isBlocked) {
    throw new ApiError(403, 'Your account has been suspended. Please contact support.');
  }

  // Hash new password using bcrypt
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Update password and invalidate reset token (single-use)
  user.password = hashedPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  // Mark email as verified if not already verified
  if (!user.isEmailVerified) {
    user.isEmailVerified = true;
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password reset successful. You can now log in with your new password.',
  });
});

