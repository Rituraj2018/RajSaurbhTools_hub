import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, LayoutDashboard, Github, LogIn, UserPlus, User, Menu, X, Sun, Moon } from 'lucide-react';
import { useAppSelector } from '../../features/store';
import { Button } from './Button';
import { useTheme } from './ThemeProvider';
import { BrandLogo } from './BrandLogo';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { health, loading: systemLoading } = useAppSelector((state) => state.system);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  const navLinks = [
    { label: 'Overview', path: '/' },
    { label: 'All Tools', path: '/tools' },
    { label: 'Photo Studio', path: '/tools?category=photo' },
    { label: 'PDF Suite', path: '/tools?category=pdf' },
    { label: 'Document Lab', path: '/tools?category=document' },
  ];

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  // Close mobile menu on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(event.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [mobileMenuOpen]);

  // Close on Escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileMenuOpen]);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo */}
          <BrandLogo size="md" />

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
            {/* Backend Health Badge — Admin Only */}
            {user?.role === 'admin' && (
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
            )}

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

            {/* Day/Night Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-colors hidden sm:flex items-center justify-center"
              title={theme === 'dark' ? 'Switch to Day Mode' : 'Switch to Night Mode'}
              aria-label={theme === 'dark' ? 'Switch to Day Mode' : 'Switch to Night Mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-lg text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-colors hidden sm:flex"
              title="Repository"
            >
              <Github className="w-4 h-4" />
            </a>

            {/* Mobile Hamburger Button — visible only below md */}
            <button
              ref={hamburgerRef}
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-colors"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu — visible only below md */}
      {mobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="md:hidden border-t border-slate-800/80 bg-slate-950/95 backdrop-blur-xl"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-3">
            {/* Mobile Nav Links */}
            <nav className="space-y-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={closeMobileMenu}
                    className={`block px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
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

            {/* Mobile API Status — Admin Only */}
            {user?.role === 'admin' && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
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
            )}

            {/* Mobile Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all w-full text-left"
              aria-label={theme === 'dark' ? 'Switch to Day Mode' : 'Switch to Night Mode'}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>Day Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span>Night Mode</span>
                </>
              )}
            </button>

            {/* Mobile Auth Section */}
            <div className="border-t border-slate-800/60 pt-3">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-xs font-bold text-blue-400">
                    {user?.name?.charAt(0).toUpperCase() || <User className="w-3.5 h-3.5" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="truncate max-w-[200px]">{user?.name}</span>
                    <span className="text-xs text-slate-500 font-normal">Go to Dashboard</span>
                  </div>
                </Link>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link to="/login" onClick={closeMobileMenu}>
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<LogIn className="w-3.5 h-3.5" />}
                      className="w-full justify-center"
                    >
                      <span>Sign In</span>
                    </Button>
                  </Link>
                  <Link to="/register" onClick={closeMobileMenu}>
                    <Button
                      variant="gradient"
                      size="sm"
                      leftIcon={<UserPlus className="w-3.5 h-3.5" />}
                      className="w-full justify-center"
                    >
                      <span>Get Started</span>
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
