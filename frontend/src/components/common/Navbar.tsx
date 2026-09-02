import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layers, Activity, LayoutDashboard, Github, LogIn, UserPlus, User } from 'lucide-react';
import { useAppSelector } from '../../features/store';
import { Button } from './Button';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { health, loading: systemLoading } = useAppSelector((state) => state.system);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const navLinks = [
    { label: 'Overview', path: '/' },
    { label: 'All Tools', path: '/tools' },
    { label: 'Photo Studio', path: '/tools?category=photo' },
    { label: 'PDF Suite', path: '/tools?category=pdf' },
    { label: 'Document Lab', path: '/tools?category=document' },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  RajSaurbh Tool Hub
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 border border-blue-500/30">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide hidden sm:block">
                All-in-One Processing Platform
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800/80">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Action Area */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Backend Health Badge */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
              <Activity
                className={`w-3.5 h-3.5 ${
                  systemLoading
                    ? 'text-amber-400 animate-spin'
                    : health?.status === 'healthy'
                    ? 'text-emerald-400 animate-pulse'
                    : 'text-rose-400'
                }`}
              />
              <span className="text-slate-400 font-medium">API:</span>
              <span
                className={`font-semibold capitalize ${
                  systemLoading
                    ? 'text-amber-400'
                    : health?.status === 'healthy'
                    ? 'text-emerald-400'
                    : 'text-rose-400'
                }`}
              >
                {systemLoading ? 'Checking...' : health?.status || 'Offline'}
              </span>
            </div>

            {/* Auth Dependent Navigation Buttons */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/dashboard"
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
                >
                  <div className="w-5 h-5 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-[10px] font-bold text-blue-400">
                    {user?.name?.charAt(0).toUpperCase() || <User className="w-3 h-3" />}
                  </div>
                  <span className="font-medium max-w-[100px] truncate">{user?.name}</span>
                </Link>

                <Link to="/dashboard">
                  <Button
                    variant="gradient"
                    size="sm"
                    leftIcon={<LayoutDashboard className="w-3.5 h-3.5" />}
                  >
                    <span>Dashboard</span>
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<LogIn className="w-3.5 h-3.5" />}
                  >
                    <span>Sign In</span>
                  </Button>
                </Link>

                <Link to="/register">
                  <Button
                    variant="gradient"
                    size="sm"
                    leftIcon={<UserPlus className="w-3.5 h-3.5" />}
                  >
                    <span>Get Started</span>
                  </Button>
                </Link>
              </div>
            )}

            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-lg text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-colors hidden sm:flex"
              title="Repository"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};
