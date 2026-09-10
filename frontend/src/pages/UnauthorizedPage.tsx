import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, LogIn, Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/common';

export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 animate-fadeIn">
      <div className="max-w-md w-full text-center space-y-6 bg-slate-900/60 border border-slate-800/80 p-8 sm:p-10 rounded-3xl backdrop-blur-xl shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center shadow-lg shadow-amber-500/5">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
            HTTP 401 / 403
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Authentication Required
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            You need to be signed in to access this tool or resource, or your session has expired.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-800/80">
          <Link to="/login" className="w-full sm:w-auto">
            <Button
              variant="gradient"
              size="md"
              className="w-full"
              leftIcon={<LogIn className="w-4 h-4" />}
            >
              Sign In to Continue
            </Button>
          </Link>

          <Link to="/" className="w-full sm:w-auto">
            <Button
              variant="secondary"
              size="md"
              className="w-full"
              leftIcon={<Home className="w-4 h-4" />}
            >
              Hub Home
            </Button>
          </Link>
        </div>

        <div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go back to previous page</span>
          </button>
        </div>
      </div>
    </div>
  );
};
