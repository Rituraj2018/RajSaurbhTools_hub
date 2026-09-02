import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../features/store';
import {
  LayoutDashboard,
  Wrench,
  Image as ImageIcon,
  FileSpreadsheet,
  FileText,
  FolderLock,
  History,
  Star,
  Settings,
  Layers,
  X,
  HardDrive,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

export interface SidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onMobileClose }) => {
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);

  const mainNavigation = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      badge: undefined,
    },
    {
      name: 'All Tools',
      path: '/tools',
      icon: Wrench,
      badge: '18',
    },
    {
      name: 'Photo Tools',
      path: '/tools?category=photo',
      icon: ImageIcon,
      category: 'photo',
      badge: undefined,
    },
    {
      name: 'PDF Tools',
      path: '/tools?category=pdf',
      icon: FileSpreadsheet,
      category: 'pdf',
      badge: undefined,
    },
    {
      name: 'Document Tools',
      path: '/tools?category=document',
      icon: FileText,
      category: 'document',
      badge: undefined,
    },
  ];

  const libraryNavigation = [
    {
      name: 'My Files',
      path: '/files',
      icon: FolderLock,
      badge: '5',
    },
    {
      name: 'History',
      path: '/history',
      icon: History,
      badge: undefined,
    },
    {
      name: 'Favorites',
      path: '/favorites',
      icon: Star,
      badge: undefined,
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: Settings,
      badge: undefined,
    },
  ];

  const checkIsActive = (path: string, category?: string) => {
    if (category) {
      const searchParams = new URLSearchParams(location.search);
      return location.pathname === '/tools' && searchParams.get('category') === category;
    }
    if (path === '/tools' && !location.search) {
      return location.pathname === '/tools';
    }
    return location.pathname === path;
  };

  const navContent = (
    <div className="flex flex-col h-full bg-slate-950/95 border-r border-slate-800/80 backdrop-blur-xl">
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 sm:h-20 px-6 border-b border-slate-800/80">
        <NavLink to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold text-white tracking-tight">
                RajSaurbh Tools_Hub
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Processing Platform</p>
          </div>
        </NavLink>

        {/* Mobile close button */}
        <button
          onClick={onMobileClose}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {/* Main Tools Menu */}
        <div>
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            Main Menu
          </p>
          <nav className="space-y-1">
            {mainNavigation.map((item) => {
              const active = checkIsActive(item.path, item.category);
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={onMobileClose}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group ${
                    active
                      ? 'bg-gradient-to-r from-blue-600/90 to-purple-600/90 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                        active ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        active
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Library & Management */}
        <div>
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            Workspace & Library
          </p>
          <nav className="space-y-1">
            {libraryNavigation.map((item) => {
              const active = checkIsActive(item.path);
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={onMobileClose}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group ${
                    active
                      ? 'bg-gradient-to-r from-blue-600/90 to-purple-600/90 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                        active ? 'text-white' : 'text-slate-400 group-hover:text-purple-400'
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        active
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Storage Utilization Card in Sidebar Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 space-y-3">
        {/* Admin Panel Link (admin role only) */}
        {user?.role === 'admin' && (
          <NavLink
            to="/admin"
            onClick={onMobileClose}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600/20 to-orange-600/10 border border-rose-500/30 text-xs font-bold text-rose-400 hover:from-rose-600/30 hover:to-orange-600/20 transition-all group"
          >
            <ShieldCheck className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>Admin Panel</span>
            <ExternalLink className="w-3 h-3 ml-auto opacity-60" />
          </NavLink>
        )}
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-semibold flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-blue-400" />
              Storage Used
            </span>
            <span className="text-slate-400 font-mono text-[11px]">4.2 / 10 GB</span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full"
              style={{ width: '42%' }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
            <span>42% utilized</span>
            <NavLink
              to="/files"
              onClick={onMobileClose}
              className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-0.5"
            >
              Manage <ExternalLink className="w-2.5 h-2.5" />
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 shrink-0 z-30">
        {navContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={onMobileClose}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl z-10 transition-transform animate-slideRight">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
