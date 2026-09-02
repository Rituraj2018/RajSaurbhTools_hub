import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Wrench,
  FolderOpen,
  BarChart3,
  ShieldCheck,
  X,
  Menu,
  ChevronRight,
  LogOut,
  Layers,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../features/store';
import { logoutUser } from '../features/auth/authSlice';

const adminNavItems = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
  { name: 'Users', path: '/admin/users', icon: Users },
  { name: 'Tools', path: '/admin/tools', icon: Wrench },
  { name: 'Files', path: '/admin/files', icon: FolderOpen },
  { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
];

export const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  const navContent = (
    <div className="flex flex-col h-full bg-slate-950 border-r border-rose-900/20">
      {/* Brand */}
      <div className="flex items-center justify-between h-16 sm:h-20 px-5 border-b border-rose-900/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-orange-500 flex items-center justify-center shadow-md shadow-rose-500/30">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-extrabold text-white tracking-tight">Admin Panel</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase bg-rose-500/20 text-rose-400 border border-rose-500/30">
                SECURED
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">RajSaurbh Control Center</p>
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
        <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
          Administration
        </p>
        {adminNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group ${
                  isActive
                    ? 'bg-gradient-to-r from-rose-600/90 to-orange-600/80 text-white shadow-md shadow-rose-500/20'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-rose-400'
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>
                  <ChevronRight
                    className={`w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'opacity-100' : ''}`}
                  />
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Back to App + Logout */}
      <div className="p-4 border-t border-rose-900/20 space-y-2">
        <NavLink
          to="/dashboard"
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-100 hover:bg-slate-900/80 transition-all group"
        >
          <Layers className="w-4 h-4 group-hover:text-blue-400 transition-colors" />
          <span>Back to App</span>
        </NavLink>
        <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-rose-500 to-orange-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
            {user?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-white truncate">{user?.name}</p>
            <p className="text-[10px] text-rose-400 font-medium">Administrator</p>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 shrink-0 z-30">
        {navContent}
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl z-10">
            {navContent}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 h-14 bg-slate-950/95 border-b border-rose-900/20 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-rose-400" />
              <span className="text-sm font-bold text-white">Admin Control Panel</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="hidden sm:block">Logged in as</span>
            <span className="font-semibold text-rose-400">{user?.name}</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
