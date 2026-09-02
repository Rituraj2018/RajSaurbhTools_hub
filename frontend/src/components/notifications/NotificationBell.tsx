import React, { useEffect, useRef, useCallback } from 'react';
import {
  Bell,
  CheckCheck,
  Trash2,
  CheckCircle2,
  XCircle,
  Info,
  AlertTriangle,
  Loader2,
  Inbox,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../features/store';
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  Notification,
  NotificationType,
} from '../../features/notifications';

/* ─── Helpers ─── */

const TYPE_CONFIG: Record<
  NotificationType,
  { icon: React.ReactNode; bg: string; border: string; iconColor: string }
> = {
  success: {
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    iconColor: 'text-emerald-400',
  },
  error: {
    icon: <XCircle className="w-3.5 h-3.5" />,
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    iconColor: 'text-rose-400',
  },
  warning: {
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    iconColor: 'text-amber-400',
  },
  info: {
    icon: <Info className="w-3.5 h-3.5" />,
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    iconColor: 'text-blue-400',
  },
};

const timeAgo = (date: string): string => {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

/* ─── Single Notification Row ─── */

const NotificationItem: React.FC<{
  notification: Notification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}> = ({ notification, onMarkRead, onDelete }) => {
  const cfg = TYPE_CONFIG[notification.type] || TYPE_CONFIG.info;

  return (
    <div
      className={`group relative flex items-start gap-3 p-3 rounded-xl transition-all cursor-default ${
        notification.isRead
          ? 'hover:bg-slate-800/40'
          : 'bg-slate-800/50 hover:bg-slate-800/70'
      }`}
      onClick={() => {
        if (!notification.isRead) onMarkRead(notification._id);
      }}
    >
      {/* Type Icon */}
      <div
        className={`mt-0.5 shrink-0 w-7 h-7 rounded-lg border ${cfg.bg} ${cfg.border} flex items-center justify-center ${cfg.iconColor}`}
      >
        {cfg.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-0.5">
        <p
          className={`text-[12px] font-semibold leading-snug ${
            notification.isRead ? 'text-slate-300' : 'text-white'
          }`}
        >
          {notification.title}
        </p>
        <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
          {notification.message}
        </p>
        <div className="flex items-center gap-2 pt-0.5">
          <span className="text-[10px] text-slate-500 font-medium">
            {timeAgo(notification.createdAt)}
          </span>
          <span
            className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${cfg.bg} ${cfg.iconColor} border ${cfg.border}`}
          >
            {notification.type}
          </span>
        </div>
      </div>

      {/* Unread dot */}
      {!notification.isRead && (
        <span className="mt-1.5 shrink-0 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-slate-900 animate-pulse" />
      )}

      {/* Delete button (on hover) */}
      <button
        id={`delete-notif-${notification._id}`}
        onClick={(e) => {
          e.stopPropagation();
          onDelete(notification._id);
        }}
        title="Delete notification"
        className="absolute top-2 right-2 p-1 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  );
};

/* ─── Bell Dropdown Component ─── */

interface NotificationBellProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  isOpen,
  onToggle,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const { notifications, unreadCount, loading, markingRead } = useAppSelector(
    (state) => state.notifications
  );
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /* Fetch on open & poll every 60s when authenticated */
  const load = useCallback(() => {
    if (isAuthenticated) dispatch(fetchNotifications({ limit: 20 }));
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      load();
      const interval = setInterval(load, 60_000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, load]);

  /* Close on outside click */
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onClose]);

  const handleMarkRead = (id: string) => dispatch(markNotificationRead(id));
  const handleMarkAll = () => dispatch(markAllNotificationsRead());
  const handleDelete = (id: string) => dispatch(deleteNotification(id));

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        id="notification-bell-btn"
        onClick={onToggle}
        className="relative p-2.5 rounded-xl text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-colors"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
      >
        <Bell className="w-4 h-4" />
        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full bg-blue-500 ring-2 ring-slate-950 flex items-center justify-center text-[9px] font-extrabold text-white px-1 animate-bounce">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[340px] sm:w-80 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl shadow-slate-950/80 z-50 overflow-hidden animate-scaleUp">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Bell className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs font-bold text-white">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {markingRead && <Loader2 className="w-3 h-3 text-slate-500 animate-spin" />}
              {unreadCount > 0 && (
                <button
                  id="mark-all-read-btn"
                  onClick={handleMarkAll}
                  disabled={markingRead}
                  title="Mark all as read"
                  className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-blue-400 px-2 py-1 rounded-lg hover:bg-blue-500/10 transition-colors disabled:opacity-50"
                >
                  <CheckCheck className="w-3 h-3" />
                  All read
                </button>
              )}
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-[380px] overflow-y-auto overflow-x-hidden p-2 space-y-1 custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                <p className="text-xs text-slate-500">Loading notifications…</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center">
                  <Inbox className="w-6 h-6 text-slate-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400">All caught up!</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">No notifications yet.</p>
                </div>
              </div>
            ) : (
              notifications.map((n) => (
                <NotificationItem
                  key={n._id}
                  notification={n}
                  onMarkRead={handleMarkRead}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between">
              <span className="text-[10px] text-slate-500">
                {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
              </span>
              <span className="text-[10px] text-slate-500">Click to mark as read</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
