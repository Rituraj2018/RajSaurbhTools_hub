import React, { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Layers,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../features/store';
import { performPasswordReset, clearAuthError, clearAuthSuccess } from '../features/auth';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { token: paramToken } = useParams<{ token?: string }>();
  const [searchParams] = useSearchParams();

  // Support both /reset-password/:token and /reset-password?token=...
  const resetToken = paramToken || searchParams.get('token') || '';

  const { loading, error, validationErrors, successMessage } = useAppSelector(
    (state) => state.auth
  );

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isResetComplete, setIsResetComplete] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});

  useEffect(() => {
    dispatch(clearAuthError());
    dispatch(clearAuthSuccess());
  }, [dispatch]);

  const validateForm = (): boolean => {
    const errors: { password?: string; confirmPassword?: string } = {};

    if (!password) {
      errors.password = 'New password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearAuthError());
    dispatch(clearAuthSuccess());

    if (!validateForm()) return;

    const result = await dispatch(
      performPasswordReset({
        token: resetToken,
        password,
      })
    );

    if (performPasswordReset.fulfilled.match(result)) {
      setIsResetComplete(true);
      setTimeout(() => {
        navigate('/login', {
          state: {
            successNotice: 'Password has been reset successfully. Please sign in with your new password.',
          },
        });
      }, 2000);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10 space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5 group mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              RajSaurbh Tools_Hub
            </span>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Set a new password
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Please enter and confirm your new secure account password below.
          </p>
        </div>

        {/* Card Container */}
        <div className="backdrop-blur-xl bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/60 relative">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent rounded-t-2xl" />

          {/* Missing Token Warning */}
          {!resetToken && (
            <div className="mb-5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Missing Reset Token</p>
                <p className="mt-0.5 text-amber-300/80">
                  No password reset token was detected in your URL. Please click the link in your email or request a new one.
                </p>
                <div className="mt-3">
                  <Link
                    to="/forgot-password"
                    className="inline-block px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-200 hover:bg-amber-500/30 font-semibold text-[11px] transition-colors"
                  >
                    Request New Link
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Success Banner */}
          {(successMessage || isResetComplete) && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{successMessage || 'Password Reset Successful'}</p>
                <p className="text-[11px] text-emerald-400/80 mt-0.5">
                  Redirecting you to the sign-in page...
                </p>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">{error}</p>
                {validationErrors && validationErrors.length > 0 && (
                  <ul className="list-disc list-inside space-y-0.5 text-rose-300/90 text-[11px]">
                    {validationErrors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* Form */}
          {resetToken && !isResetComplete && (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* New Password */}
              <Input
                id="reset-password"
                label="New Password (min 8 characters)"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter strong password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) {
                    setFieldErrors({ ...fieldErrors, password: undefined });
                  }
                }}
                error={fieldErrors.password}
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-slate-400 hover:text-slate-200 focus:outline-none transition-colors"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                disabled={loading}
                autoComplete="new-password"
              />

              {/* Confirm New Password */}
              <Input
                id="reset-confirm-password"
                label="Confirm New Password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Re-enter your new password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (fieldErrors.confirmPassword) {
                    setFieldErrors({ ...fieldErrors, confirmPassword: undefined });
                  }
                }}
                error={fieldErrors.confirmPassword}
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="p-1 text-slate-400 hover:text-slate-200 focus:outline-none transition-colors"
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                disabled={loading}
                autoComplete="new-password"
              />

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="gradient"
                  size="lg"
                  isLoading={loading}
                  disabled={loading || !resetToken}
                  className="w-full shadow-lg shadow-indigo-500/20"
                  rightIcon={!loading ? <KeyRound className="w-4 h-4" /> : undefined}
                >
                  <span>{loading ? 'Resetting Password...' : 'Reset Password'}</span>
                </Button>
              </div>
            </form>
          )}

          {/* Back to Sign In Link */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>

        {/* Security Trust Pill */}
        <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/60 flex items-center justify-center gap-2 text-xs text-slate-400 font-medium text-center">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Your connection is securely encrypted with 256-bit SSL.</span>
        </div>
      </div>
    </div>
  );
};
