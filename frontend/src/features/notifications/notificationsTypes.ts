/**
 * Notification type variants
 */
export type NotificationType = 'success' | 'error' | 'info' | 'warning';

/**
 * Single Notification entity
 */
export interface Notification {
  _id: string;
  id?: string;
  user: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Redux Notifications Slice State
 */
export interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  total: number;
  loading: boolean;
  error: string | null;
  markingRead: boolean;
}
