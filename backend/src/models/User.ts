import mongoose, { Document, Schema, Model } from 'mongoose';

/**
 * User Role Types
 */
export type UserRole = 'user' | 'admin';

/**
 * TypeScript interface representing User document attributes
 */
export interface IUser {
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  role: UserRole;
  profileImage?: string;
  isEmailVerified: boolean;
  isBlocked: boolean;
  favoriteTools?: string[];
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * TypeScript interface for User Mongoose Document
 */
export interface IUserDocument extends Document, Omit<IUser, 'createdAt' | 'updatedAt'> {
  favoriteTools: string[];
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Email validation regex pattern (RFC 5322 compatible standard)
 */
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Mongoose Schema definition for User
 */
const userSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [EMAIL_REGEX, 'Please provide a valid email address'],
      index: true,
    },
    password: {
      type: String,
      required: [
        function (this: IUserDocument) {
          // Password is required for manual email/password registration, but optional for Google OAuth
          return !this.googleId;
        },
        'Password is required',
      ],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false, // Exclude password from query results by default
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    role: {
      type: String,
      enum: {
        values: ['user', 'admin'],
        message: '{VALUE} is not a valid role',
      },
      default: 'user',
    },
    profileImage: {
      type: String,
      default: '',
      trim: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
      index: true,
    },
    favoriteTools: {
      type: [String],
      default: [],
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
    toJSON: {
      transform: (_doc, ret: Record<string, any>) => {
        delete ret.password;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpires;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: (_doc, ret: Record<string, any>) => {
        delete ret.password;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpires;
        delete ret.__v;
        return ret;
      },
    },
  }
);

/**
 * Mongoose Model for User
 */
export const User: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>('User', userSchema);

export default User;
