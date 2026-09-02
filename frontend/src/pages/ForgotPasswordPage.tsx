import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  AlertCircle,
  CheckCircle2,
  Layers,
  ArrowLeft,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../features/store';
import { requestPasswordReset, clearAuthError, clearAuthSuccess } from '../features/auth';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';

export const ForgotPasswordPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { loading, error, successMessage } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState<string | undefined>(undefined);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    dispatch(clearAuthError());
    dispatch(clearAuthSuccess());
  }, [dispatch]);

  const validateEmail = (): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email.trim()) {
      setFieldError('Email address is required');
      return false;
    }
    if (!emailRegex.test(email.trim())) {
      setFieldError('Please provide a valid email address');
      return false;
    }
    setFieldError(undefined);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearAuthError());
    dispatch(clearAuthSuccess());

    if (!validateEmail()) return;

    setSubmitted(true);
    await dispatch(requestPasswordReset(email.trim().toLowerCase()));
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

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
            Forgot your password?
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Enter your registered email address and we'll send you instructions to reset your password.
          </p>
        </div>

        {/* Card Container */}
        <div className="backdrop-blur-xl bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/60 relative">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent rounded-t-2xl" />

          {/* Success Banner */}
          {successMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Reset Link Sent</p>
                <p className="mt-0.5 text-emerald-300/90">{successMessage}</p>
                <p className="mt-2 text-[11px] text-slate-400">
                  Check your inbox and spam folder. The link is valid for 15 minutes.
                </p>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              id="forgot-email"
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldError) setFieldError(undefined);
              }}
              error={fieldError}
              leftIcon={<Mail className="w-4 h-4" />}
              disabled={loading || (submitted && !!successMessage)}
              autoComplete="email"
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="gradient"
                size="lg"
                isLoading={loading}
                disabled={loading || (submitted && !!successMessage)}
                className="w-full shadow-lg shadow-blue-500/20"
                rightIcon={!loading ? <Send className="w-4 h-4" /> : undefined}
              >
                <span>{loading ? 'Sending link...' : 'Send Reset Link'}</span>
              </Button>
            </div>
          </form>

          {/* Back to Login Footer */}
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
          <span>Password reset links are time-limited, encrypted, and single-use.</span>
        </div>
      </div>
    </div>
  );
};
