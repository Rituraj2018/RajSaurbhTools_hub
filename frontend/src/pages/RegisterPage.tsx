import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Layers,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../features/store';
import { registerUser, loginWithGoogle, clearAuthError, clearAuthSuccess } from '../features/auth';
import { GoogleLogin } from '@react-oauth/google';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { isAuthenticated, loading, error, validationErrors, successMessage } = useAppSelector(
    (state) => state.auth
  );

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const validateForm = (): boolean => {
    const errors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!name.trim()) {
      errors.name = 'Full name is required';
    } else if (name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters long';
    } else if (name.trim().length > 50) {
      errors.name = 'Name cannot exceed 50 characters';
    }

    if (!email.trim()) {
      errors.email = 'Email address is required';
    } else if (!emailRegex.test(email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
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
      registerUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      })
    );

    if (registerUser.fulfilled.match(result)) {
      setIsRegistered(true);
      // Automatically redirect to login after short delay
      setTimeout(() => {
        navigate('/login', {
          state: {
            registeredEmail: email.trim().toLowerCase(),
          },
        });
      }, 1500);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

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
            Create your account
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Get unlimited access to all-in-one PDF, photo and document editing utilities.
          </p>
        </div>

        {/* Card Container */}
        <div className="backdrop-blur-xl bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/60 relative">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent rounded-t-2xl" />

          {/* Success Banner */}
          {(successMessage || isRegistered) && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">
                  {successMessage || 'Account created successfully!'}
                </p>
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

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Name Input */}
            <Input
              id="register-name"
              label="Full Name"
              type="text"
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: undefined });
              }}
              error={fieldErrors.name}
              leftIcon={<User className="w-4 h-4" />}
              disabled={loading || isRegistered}
              autoComplete="name"
            />

            {/* Email Input */}
            <Input
              id="register-email"
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: undefined });
              }}
              error={fieldErrors.email}
              leftIcon={<Mail className="w-4 h-4" />}
              disabled={loading || isRegistered}
              autoComplete="email"
            />

            {/* Password Input */}
            <Input
              id="register-password"
              label="Password (min 6 characters)"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: undefined });
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
              disabled={loading || isRegistered}
              autoComplete="new-password"
            />

            {/* Confirm Password Input */}
            <Input
              id="register-confirm-password"
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Re-enter your password"
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
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              }
              disabled={loading || isRegistered}
              autoComplete="new-password"
            />

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="gradient"
                size="lg"
                isLoading={loading}
                disabled={isRegistered}
                className="w-full shadow-lg shadow-indigo-500/20"
                rightIcon={
                  !loading && (isRegistered ? <Check className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />)
                }
              >
                <span>
                  {loading
                    ? 'Creating Account...'
                    : isRegistered
                    ? 'Account Created!'
                    : 'Create Account'}
                </span>
              </Button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-900/90 px-3 text-slate-500 font-medium tracking-wider">
                Or
              </span>
            </div>
          </div>

          {/* Google Sign Up / Sign In */}
          <div className="flex justify-center w-full min-h-[44px]">
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                if (credentialResponse.credential) {
                  dispatch(loginWithGoogle(credentialResponse.credential));
                }
              }}
              onError={() => {
                // Handled gracefully without crash
              }}
              theme="filled_black"
              shape="pill"
              size="large"
              text="continue_with"
              width="100%"
            />
          </div>

          {/* Footer Note & Sign In Link */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
            <p className="text-xs text-slate-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1 group"
              >
                <span>Sign In</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </p>
          </div>
        </div>

        {/* Security / Privacy Trust Pill */}
        <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/60 flex items-center justify-center gap-2 text-xs text-slate-400 font-medium text-center">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Your personal information and uploaded files are 100% private.</span>
        </div>
      </div>
    </div>
  );
};
