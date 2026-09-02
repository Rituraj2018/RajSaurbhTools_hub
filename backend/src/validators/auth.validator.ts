import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError';

/**
 * Standard email format regex pattern
 */
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Password strength requirements:
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 digit
 * - At least 1 special character
 */
const PASSWORD_RULES = [
  { regex: /.{8,}/, message: 'Password must be at least 8 characters long' },
  { regex: /[A-Z]/, message: 'Password must contain at least one uppercase letter' },
  { regex: /[a-z]/, message: 'Password must contain at least one lowercase letter' },
  { regex: /[0-9]/, message: 'Password must contain at least one number' },
  {
    regex: /[^A-Za-z0-9]/,
    message: 'Password must contain at least one special character (!@#$%^&* etc.)',
  },
];

const validatePasswordStrength = (password: string): string[] =>
  PASSWORD_RULES.filter((rule) => !rule.regex.test(password)).map((rule) => rule.message);

/**
 * Middleware validator for user registration requests
 */
export const validateRegister = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const { name, email, password } = req.body;
  const errors: string[] = [];

  // Name validation
  if (!name || typeof name !== 'string' || !name.trim()) {
    errors.push('Name is required');
  } else if (name.trim().length < 2 || name.trim().length > 50) {
    errors.push('Name must be between 2 and 50 characters');
  }

  // Email validation
  if (!email || typeof email !== 'string' || !email.trim()) {
    errors.push('Email is required');
  } else if (!EMAIL_REGEX.test(email.trim().toLowerCase())) {
    errors.push('Please provide a valid email address');
  }

  // Password validation
  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
  } else {
    const pwErrors = validatePasswordStrength(password);
    errors.push(...pwErrors);
  }

  if (errors.length > 0) {
    throw new ApiError(400, errors[0], errors);
  }

  next();
};

/**
 * Middleware validator for user login requests
 */
export const validateLogin = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const { email, password } = req.body;
  const errors: string[] = [];

  // Email validation
  if (!email || typeof email !== 'string' || !email.trim()) {
    errors.push('Email is required');
  } else if (!EMAIL_REGEX.test(email.trim().toLowerCase())) {
    errors.push('Please provide a valid email address');
  }

  // Password validation
  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    throw new ApiError(400, errors[0], errors);
  }

  next();
};
