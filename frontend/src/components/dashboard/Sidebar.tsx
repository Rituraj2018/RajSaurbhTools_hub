import React, { useState, useEffect, useCallback } from 'react';
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
  X,
  ExternalLink,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { cloudApi, CloudStatusResponse, formatStorageBytes } from '../../api/cloudApi';
import { GoogleDriveIcon } from '../cloud';
import { BrandLogo } from '../common/BrandLogo';

export interface SidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onMobileClose }) => {
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);
  const { tools } = useAppSelector((state) => state.tools);

  const [cloudStatus, setCloudStatus] = useState<CloudStatusResponse | null>(null);
  const [loadingCloud, setLoadingCloud] = useState<boolean>(true);
  const [connectingDrive, setConnectingDrive] = useState<boolean>(false);

  const fetchCloudStatus = useCallback(async () => {
    if (!user) {
      setLoadingCloud(false);
      setCloudStatus(null);
      return;
    }
    try {
      setLoadingCloud(true);
      const data = await cloudApi.getStatus();
      setCloudStatus(data);
    } catch (err) {
      console.warn('[Sidebar] Could not load cloud storage status:', err);
    } finally {
      setLoadingCloud(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCloudStatus();
  }, [fetchCloudStatus]);

  // Listen for OAuth callback event from popup or window focus
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'CLOUD_OAUTH_CALLBACK') {
        fetchCloudStatus();
      }
    };
    window.addEventListener('message', handleMessage);
    const handleFocus = () => {
      fetchCloudStatus();
    };
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchCloudStatus]);

  const handleConnectGoogleDrive = async () => {
    try {
      setConnectingDrive(true);
      const authUrl = await cloudApi.getGoogleAuthUrl();
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      window.open(
        authUrl,
        'Google Drive Authorization',
        `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes`
      );
    } catch (err) {
      console.error('[Sidebar] Failed to start Google Drive OAuth:', err);
    } finally {
      setConnectingDrive(false);
    }
  };

  const googleDriveStatus = cloudStatus?.providers?.google_drive;
  const googleQuota = googleDriveStatus?.storageQuota;

  const totalToolsCount = tools.length > 0 ? tools.length : 16;

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
      badge: String(totalToolsCount),
    },
    {
      name: 'Security Tools',
      path: '/tools?category=security',
      icon: ShieldCheck,
      category: 'security',
      badge: undefined,
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
      badge: '6',
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

  const navContent = (
    <div className="flex flex-col h-full bg-slate-950/95 border-r border-slate-800 backdrop-blur-xl">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div onClick={onMobileClose}>
          <BrandLogo size="sm" showSubtitle={false} />
        </div>

        {/* Mobile close button */}
        <button
          onClick={onMobileClose}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-3.5 py-5 space-y-6">
        {/* Main Menu */}
        <div>
          <h2 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Main Menu
          </h2>
          <nav className="space-y-1">
            {mainNavigation.map((item) => {
              const Icon = item.icon;
              const isCategoryActive =
                item.category &&
                location.pathname === '/tools' &&
                new URLSearchParams(location.search).get('category') === item.category;

              const isToolsActive =
                item.path === '/tools' &&
                !item.category &&
                location.pathname === '/tools' &&
                !location.search;

              const isDashboardActive =
                item.path === '/dashboard' && location.pathname === '/dashboard';

              const active = isCategoryActive || isToolsActive || isDashboardActive;

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={onMobileClose}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    active
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
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

        {/* Workspace & Library */}
        <div>
          <h2 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Workspace & Library
          </h2>
          <nav className="space-y-1">
            {libraryNavigation.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={onMobileClose}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    active
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
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

      {/* Footer Content */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 space-y-3">
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

        {/* Google Drive Storage Card */}
        {loadingCloud ? (
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <GoogleDriveIcon className="w-3.5 h-3.5 flex-shrink-0" />
                Google Drive Storage
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 py-1">
              <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
              <span>Loading storage...</span>
            </div>
          </div>
        ) : googleDriveStatus?.isConnected ? (
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs gap-2">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5 truncate">
                <GoogleDriveIcon className="w-3.5 h-3.5 flex-shrink-0" />
                Google Drive Storage
              </span>
              <span className="text-slate-300 font-mono text-[11px] font-medium flex-shrink-0">
                {googleQuota
                  ? `${formatStorageBytes(googleQuota.usedBytes)} / ${
                      googleQuota.totalBytes > 0 ? formatStorageBytes(googleQuota.totalBytes) : 'Unlimited'
                    }`
                  : 'Connected'}
              </span>
            </div>

            {/* Dynamic Progress bar */}
            {googleQuota && (
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    googleQuota.usagePercentage > 90
                      ? 'bg-rose-500'
                      : googleQuota.usagePercentage > 75
                      ? 'bg-amber-500'
                      : 'bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, googleQuota.usagePercentage))}%` }}
                />
              </div>
            )}

            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
              <span>
                {googleQuota ? (
                  <>
                    <span className="text-slate-300 font-medium">{googleQuota.usagePercentage}%</span>
                    {googleQuota.remainingBytes > 0 && (
                      <span className="text-slate-400"> ({formatStorageBytes(googleQuota.remainingBytes)} available)</span>
                    )}
                  </>
                ) : (
                  <span className="text-emerald-400 truncate">{googleDriveStatus.providerEmail || 'Connected'}</span>
                )}
              </span>
              <NavLink
                to="/files"
                onClick={onMobileClose}
                className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-0.5 flex-shrink-0"
              >
                Manage <ExternalLink className="w-2.5 h-2.5" />
              </NavLink>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <GoogleDriveIcon className="w-3.5 h-3.5 flex-shrink-0" />
                Google Drive
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Google Drive is not connected</p>
            <button
              type="button"
              onClick={handleConnectGoogleDrive}
              disabled={connectingDrive}
              className="w-full mt-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 hover:text-blue-200 text-xs font-semibold transition-all disabled:opacity-50 active:scale-95"
            >
              {connectingDrive ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <span>Connect Google Drive</span>
              )}
            </button>
          </div>
        )}
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
