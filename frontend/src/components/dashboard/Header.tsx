import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
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

export interface HeaderProps {
  onMobileMenuToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMobileMenuToggle }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifMenuOpen, setIsNotifMenuOpen] = useState(false);

  const notifications = [
    {
      id: 1,
      title: 'Batch PDF Compression finished',
      time: '5m ago',
      unread: true,
    },
    {
      id: 2,
      title: 'New AI Background Remover model active',
      time: '1h ago',
      unread: true,
    },
    {
      id: 3,
      title: 'System storage backup completed',
      time: '1d ago',
      unread: false,
    },
  ];

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
              RajSaurbh
            </span>
          </Link>

          {/* Desktop Tagline / Greeting */}
          <div className="hidden lg:block">
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Platform Dashboard</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Live & Operational
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">
              Welcome back to your high-performance tool workspace.
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

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsNotifMenuOpen(!isNotifMenuOpen);
                setIsUserMenuOpen(false);
              }}
              className="p-2.5 rounded-xl text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-colors relative"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-slate-950 animate-pulse" />
            </button>

            {isNotifMenuOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-3 z-50 animate-scaleUp">
                <div className="flex items-center justify-between px-2 py-1.5 border-b border-slate-800/80 mb-2">
                  <span className="text-xs font-bold text-white">Notifications</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-semibold">
                    2 new
                  </span>
                </div>
                <div className="space-y-1.5">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="p-2.5 rounded-xl hover:bg-slate-800/60 transition-colors text-xs space-y-1 cursor-pointer"
                    >
                      <div className="flex items-center justify-between text-slate-200 font-semibold">
                        <span className="truncate">{notif.title}</span>
                        {notif.unread && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 ml-2" />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {notif.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

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
                <User className="w-4 h-4" />
              </div>
              <div className="text-left hidden sm:block">
                <div className="font-bold text-slate-200 leading-tight">Admin User</div>
                <div className="text-[10px] text-purple-400 font-medium leading-none">
                  Pro Plan
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 animate-scaleUp">
                <div className="px-3 py-2 border-b border-slate-800 mb-1">
                  <p className="text-xs font-bold text-white">Administrator</p>
                  <p className="text-[11px] text-slate-400 truncate">admin@rajsaurbh.hub</p>
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
                    onClick={() => setIsUserMenuOpen(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-rose-400" />
                    <span>Sign Out (Demo)</span>
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
            <span className="text-blue-400 font-medium">RajSaurbh Tool Hub Pro</span>
          </div>
        </div>
      </Modal>
    </>
  );
};
