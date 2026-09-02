import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AuthState, AuthUser, LoginCredentials, RegisterCredentials } from './authTypes';
import { authService } from './authService';

const initialToken = authService.getToken();
const initialUser = authService.getUser();

const initialState: AuthState = {
  user: initialUser,
  token: initialToken,
  isAuthenticated: !!initialToken,
  loading: false,
  error: null,
  validationErrors: undefined,
  successMessage: null,
};

/**
 * Async Thunk: Register User
 */
export const registerUser = createAsyncThunk<
  { user: AuthUser; message: string },
  RegisterCredentials,
  { rejectValue: { message: string; errors?: string[] } }
>('auth/registerUser', async (credentials, { rejectWithValue }) => {
  try {
    return await authService.register(credentials);
  } catch (error: any) {
    const message =
      error?.message ||
      (typeof error === 'string' ? error : 'Registration failed. Please check your information.');
    const errors = Array.isArray(error?.errors) ? error.errors : undefined;
    return rejectWithValue({ message, errors });
  }
});

/**
 * Async Thunk: Login User
 */
export const loginUser = createAsyncThunk<
  { token: string; user: AuthUser; message: string },
  LoginCredentials,
  { rejectValue: { message: string; errors?: string[] } }
>('auth/loginUser', async (credentials, { rejectWithValue }) => {
  try {
    return await authService.login(credentials);
  } catch (error: any) {
    const message =
      error?.message ||
      (typeof error === 'string' ? error : 'Login failed. Please check your credentials.');
    const errors = Array.isArray(error?.errors) ? error.errors : undefined;
    return rejectWithValue({ message, errors });
  }
});

/**
 * Async Thunk: Google Login
 */
export const loginWithGoogle = createAsyncThunk<
  { token: string; user: AuthUser; message: string },
  string,
  { rejectValue: { message: string } }
>('auth/loginWithGoogle', async (credential, { rejectWithValue }) => {
  try {
    return await authService.googleLogin(credential);
  } catch (error: any) {
    const message =
      error?.message ||
      (typeof error === 'string' ? error : 'Google authentication failed. Please try again.');
    return rejectWithValue({ message });
  }
});

/**
 * Async Thunk: Request Password Reset Link
 */
export const requestPasswordReset = createAsyncThunk<
  { message: string },
  string,
  { rejectValue: { message: string } }
>('auth/requestPasswordReset', async (email, { rejectWithValue }) => {
  try {
    return await authService.forgotPassword(email);
  } catch (error: any) {
    const message =
      error?.message ||
      (typeof error === 'string' ? error : 'Failed to send password reset link. Please try again.');
    return rejectWithValue({ message });
  }
});

/**
 * Async Thunk: Perform Password Reset
 */
export const performPasswordReset = createAsyncThunk<
  { message: string },
  { token: string; password: string },
  { rejectValue: { message: string; errors?: string[] } }
>('auth/performPasswordReset', async ({ token, password }, { rejectWithValue }) => {
  try {
    return await authService.resetPassword(token, password);
  } catch (error: any) {
    const message =
      error?.message ||
      (typeof error === 'string' ? error : 'Password reset failed. The link may have expired.');
    const errors = Array.isArray(error?.errors) ? error.errors : undefined;
    return rejectWithValue({ message, errors });
  }
});

/**
 * Async Thunk: Fetch Current User Profile
 */
export const fetchUserProfile = createAsyncThunk<
  { user: AuthUser },
  void,
  { rejectValue: string }
>('auth/fetchUserProfile', async (_, { rejectWithValue }) => {
  try {
    return await authService.getProfile();
  } catch (error: any) {
    const message = error?.message || 'Failed to fetch user profile';
    return rejectWithValue(message);
  }
});

/**
 * Async Thunk: Logout User
 */
export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
  authService.logout();
});

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
      state.validationErrors = undefined;
    },
    clearAuthSuccess: (state) => {
      state.successMessage = null;
    },
    logout: (state) => {
      authService.logout();
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      state.validationErrors = undefined;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.validationErrors = undefined;
        state.successMessage = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.validationErrors = undefined;
        state.successMessage = action.payload.message;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Registration failed';
        state.validationErrors = action.payload?.errors;
      })

      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.validationErrors = undefined;
        state.successMessage = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
        state.validationErrors = undefined;
        state.successMessage = action.payload.message;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.error = action.payload?.message || 'Login failed';
        state.validationErrors = action.payload?.errors;
      })

      // Google Login
      .addCase(loginWithGoogle.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.validationErrors = undefined;
        state.successMessage = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
        state.validationErrors = undefined;
        state.successMessage = action.payload.message;
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.error = action.payload?.message || 'Google authentication failed';
      })

      // Request Password Reset (Forgot Password)
      .addCase(requestPasswordReset.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.validationErrors = undefined;
        state.successMessage = null;
      })
      .addCase(requestPasswordReset.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.validationErrors = undefined;
        state.successMessage = action.payload.message;
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to send password reset link';
      })

      // Perform Password Reset (Reset Password)
      .addCase(performPasswordReset.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.validationErrors = undefined;
        state.successMessage = null;
      })
      .addCase(performPasswordReset.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.validationErrors = undefined;
        state.successMessage = action.payload.message;
      })
      .addCase(performPasswordReset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Password reset failed';
        state.validationErrors = action.payload?.errors;
      })

      // Fetch Profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(fetchUserProfile.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        authService.logout();
      })

      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
        state.validationErrors = undefined;
        state.successMessage = null;
      });
  },
});

export const { clearAuthError, clearAuthSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
