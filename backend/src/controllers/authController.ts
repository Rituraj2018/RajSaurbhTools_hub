import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/apiError';
import { config } from '../config/env';

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
