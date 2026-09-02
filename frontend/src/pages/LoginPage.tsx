import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  CheckCircle2,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../features/store';
import { loginUser, clearAuthError, clearAuthSuccess } from '../features/auth';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const { isAuthenticated, loading, error, validationErrors, successMessage } = useAppSelector(
    (state) => state.auth
  );

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  // Get redirection path from router state or default to /dashboard
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  useEffect(() => {
    // Clear previous auth errors on mount
    dispatch(clearAuthError());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const validateForm = (): boolean => {
    const errors: { email?: string; password?: string } = {};
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!email.trim()) {
      errors.email = 'Email address is required';
    } else if (!emailRegex.test(email.trim())) {
      errors.email = 'Please provide a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearAuthError());
    dispatch(clearAuthSuccess());

    if (!validateForm()) return;

    await dispatch(
      loginUser({
        email: email.trim().toLowerCase(),
        password,
      })
    );
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Glow Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10 space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5 group mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              RajSaurbh Tool Hub
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 border border-blue-500/30">
              PRO
            </span>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Welcome back
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Sign in to access your high-speed PDF, Photo and Document processing suite.
          </p>
        </div>

        {/* Card Container */}
        <div className="backdrop-blur-xl bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/60 relative">
          {/* Top subtle highlight line */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent rounded-t-2xl" />

          {/* Success Banner */}
          {successMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
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
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email Input */}
            <Input
              id="login-email"
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
              disabled={loading}
              autoComplete="email"
            />

            {/* Password Input */}
            <div className="space-y-1.5">
              <Input
                id="login-password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
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
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                }
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="gradient"
                size="lg"
                isLoading={loading}
                className="w-full shadow-lg shadow-blue-500/20"
                rightIcon={!loading ? <LogIn className="w-4 h-4" /> : undefined}
              >
                <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              </Button>
            </div>
          </form>

          {/* Footer Note & Registration Link */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
            <p className="text-xs text-slate-400">
              Don't have an account yet?{' '}
              <Link
                to="/register"
                className="font-semibold text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1 group"
              >
                <span>Create an Account</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </p>
          </div>
        </div>

        {/* Feature Highlights Pills */}
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/60 flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Encrypted & Private</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/60 flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Instant Cloud & Local Engine</span>
          </div>
        </div>
      </div>
    </div>
  );
};
