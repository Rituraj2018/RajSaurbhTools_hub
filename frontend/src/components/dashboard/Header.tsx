import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  User,
  Layers,
  Sliders,
  LogOut,
  ChevronDown,
  X,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { mockTools } from '../../utils/mockData';
import { useAppDispatch, useAppSelector } from '../../features/store';
import { logoutUser } from '../../features/auth';
import { NotificationBell } from '../notifications/NotificationBell';

export interface HeaderProps {
  onMobileMenuToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMobileMenuToggle }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifMenuOpen, setIsNotifMenuOpen] = useState(false);

  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    await dispatch(logoutUser());
    navigate('/login');
  };

  const filteredTools = searchQuery.trim()
    ? mockTools.filter(
        (t) =>
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <>
      <header className="sticky top-0 z-30 h-16 sm:h-20 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-all">
        {/* Left Section: Mobile Menu & Breadcrumb / Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Application Logo on Mobile */}
          <Link to="/" className="flex lg:hidden items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-extrabold text-white tracking-tight">
              RajSaurbh Tools_Hub
            </span>
          </Link>

          {/* Desktop Tagline / Greeting */}
          <div className="hidden lg:block">
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              <span>RajSaurbh Tools_Hub</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Live & Operational
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">
              Welcome to RajSaurbh Tools_Hub workspace.
            </p>
          </div>
        </div>

        {/* Right Section: Search Button, Notifications, User Placeholder */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Search Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 sm:gap-4 px-3 sm:px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs font-medium transition-all group"
            title="Search Tools & Files"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-400 transition-colors" />
              <span className="hidden sm:inline">Search tools, files, actions...</span>
              <span className="sm:hidden">Search</span>
            </div>
            <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 border border-slate-700 rounded">
              Ctrl+K
            </kbd>
          </button>

          {/* Notifications Bell */}
          <NotificationBell
            isOpen={isNotifMenuOpen}
            onToggle={() => {
              setIsNotifMenuOpen((prev) => !prev);
              setIsUserMenuOpen(false);
            }}
            onClose={() => setIsNotifMenuOpen(false)}
          />

          {/* User Placeholder & Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsUserMenuOpen(!isUserMenuOpen);
                setIsNotifMenuOpen(false);
              }}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 transition-all text-xs"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-sm shadow-blue-500/30">
                {user?.name ? (
                  <span className="text-xs font-extrabold">{user.name.charAt(0).toUpperCase()}</span>
                ) : (
                  <User className="w-4 h-4" />
                )}
              </div>
              <div className="text-left hidden sm:block">
                <div className="font-bold text-slate-200 leading-tight truncate max-w-[120px]">
                  {user?.name || 'My Account'}
                </div>
                <div className="text-[10px] text-purple-400 font-medium leading-none capitalize">
                  {user?.role ? `${user.role} Plan` : 'Free Tier'}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 animate-scaleUp">
                <div className="px-3 py-2 border-b border-slate-800 mb-1">
                  <p className="text-xs font-bold text-white truncate">{user?.name || 'User'}</p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {user?.email || 'user@example.com'}
                  </p>
                </div>

                <Link
                  to="/settings"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <Sliders className="w-4 h-4 text-slate-400" />
                  <span>Preferences & Settings</span>
                </Link>

                <div className="pt-1 mt-1 border-t border-slate-800">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-rose-400" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Quick Search Modal */}
      <Modal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        size="lg"
        showCloseButton={false}
      >
        <div className="space-y-4">
          <div className="relative flex items-center border-b border-slate-800 pb-3">
            <Search className="w-5 h-5 text-blue-400 absolute left-0" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search across all photo, PDF and document tools..."
              className="w-full bg-transparent text-white text-base pl-8 pr-8 focus:outline-none placeholder:text-slate-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-white absolute right-0"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick results */}
          <div className="max-h-72 overflow-y-auto space-y-1">
            {searchQuery.trim() ? (
              filteredTools.length > 0 ? (
                filteredTools.map((tool) => (
                  <Link
                    key={tool.id}
                    to="/tools"
                    onClick={() => setIsSearchOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/70 border border-transparent hover:border-slate-700 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                        {tool.category === 'photo' ? (
                          <ImageIcon className="w-4 h-4 text-purple-400" />
                        ) : (
                          <FileText className="w-4 h-4 text-blue-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white group-hover:text-blue-300">
                          {tool.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 line-clamp-1">
                          {tool.description}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      {tool.category}
                    </span>
                  </Link>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-slate-500">
                  No tools found matching "{searchQuery}".
                </div>
              )
            ) : (
              <div className="py-4 space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Popular Quick Actions
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {mockTools.slice(0, 4).map((tool) => (
                    <Link
                      key={tool.id}
                      to="/tools"
                      onClick={() => setIsSearchOpen(false)}
                      className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-blue-500/40 hover:bg-slate-800/40 text-left transition-all"
                    >
                      <div className="text-xs font-semibold text-white">{tool.title}</div>
                      <div className="text-[10px] text-slate-400 capitalize">
                        {tool.category} Processing
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span>Tip: Press ESC to close</span>
            <span className="text-blue-400 font-medium">RajSaurbh Tools_Hub</span>
          </div>
        </div>
      </Modal>
    </>
  );
};
