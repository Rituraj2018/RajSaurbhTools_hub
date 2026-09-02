import { axiosClient } from '../../api/axiosClient';
import { ApiResponse } from '../../types';
import { AuthUser, LoginCredentials, RegisterCredentials } from './authTypes';

const TOKEN_KEY = 'rajsaurbh_auth_token';
const USER_KEY = 'rajsaurbh_auth_user';

export const authService = {
  /**
   * Token Management in LocalStorage
   */
  getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setToken(token: string): void {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch (e) {
      console.error('Failed to save auth token to localStorage', e);
    }
  },

  removeToken(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch (e) {
      console.error('Failed to remove auth token from localStorage', e);
    }
  },

  /**
   * User Info Persistence
   */
  getUser(): AuthUser | null {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  setUser(user: AuthUser): void {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save user to localStorage', e);
    }
  },

  removeUser(): void {
    try {
      localStorage.removeItem(USER_KEY);
    } catch (e) {
      console.error('Failed to remove user from localStorage', e);
    }
  },

  clearStorage(): void {
    this.removeToken();
    this.removeUser();
  },

  /**
   * Register a new user
   */
  async register(data: RegisterCredentials): Promise<{ user: AuthUser; message: string }> {
    const response = await axiosClient.post<ApiResponse<{ user: AuthUser }>>(
      '/auth/register',
      data
    );
    const responseData = response.data;

    if (!responseData.data?.user) {
      throw new Error(responseData.message || 'Registration failed');
    }

    return {
      user: responseData.data.user,
      message: responseData.message || 'User registered successfully',
    };
  },

  /**
   * Login user and persist token/user
   */
  async login(
    data: LoginCredentials
  ): Promise<{ token: string; user: AuthUser; message: string }> {
    const response = await axiosClient.post<ApiResponse<{ token: string; user: AuthUser }>>(
      '/auth/login',
      data
    );
    const responseData = response.data;

    if (!responseData.data?.token || !responseData.data?.user) {
      throw new Error(responseData.message || 'Login failed');
    }

    const { token, user } = responseData.data;

    // Persist session
    this.setToken(token);
    this.setUser(user);

    return {
      token,
      user,
      message: responseData.message || 'Login successful',
    };
  },

  /**
   * Fetch current authenticated user profile
   */
  async getProfile(): Promise<{ user: AuthUser }> {
    const response = await axiosClient.get<ApiResponse<{ user: AuthUser }>>('/auth/profile');
    const responseData = response.data;

    if (!responseData.data?.user) {
      throw new Error(responseData.message || 'Failed to fetch user profile');
    }

    this.setUser(responseData.data.user);
    return {
      user: responseData.data.user,
    };
  },

  /**
   * Authenticate with Google credential and persist token/user
   */
  async googleLogin(
    credential: string
  ): Promise<{ token: string; user: AuthUser; message: string }> {
    const response = await axiosClient.post<ApiResponse<{ token: string; user: AuthUser }>>(
      '/auth/google',
      { credential }
    );
    const responseData = response.data;

    if (!responseData.data?.token || !responseData.data?.user) {
      throw new Error(responseData.message || 'Google authentication failed');
    }

    const { token, user } = responseData.data;

    // Persist session
    this.setToken(token);
    this.setUser(user);

    return {
      token,
      user,
      message: responseData.message || 'Google authentication successful',
    };
  },

  /**
   * Request password reset link
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await axiosClient.post<ApiResponse<void>>('/auth/forgot-password', {
      email,
    });
    return {
      message:
        response.data.message ||
        'If an account with that email address exists, a password reset link has been sent.',
    };
  },

  /**
   * Reset password using token
   */
  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    const response = await axiosClient.post<ApiResponse<void>>('/auth/reset-password', {
      token,
      password,
    });
    return {
      message:
        response.data.message ||
        'Password reset successful. You can now log in with your new password.',
    };
  },

  /**
   * Logout user and clear stored authentication state
   */
  logout(): void {
    this.clearStorage();
  },
};
