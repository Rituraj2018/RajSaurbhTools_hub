/**
 * Authenticated User Entity
 */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  profileImage?: string;
  isEmailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Payload for User Registration
 */
export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

/**
 * Payload for User Login
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * API Auth Payload Response
 */
export interface AuthResponseData {
  token?: string;
  user: AuthUser;
}

/**
 * Redux Auth State
 */
export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  validationErrors?: string[];
  successMessage: string | null;
}
