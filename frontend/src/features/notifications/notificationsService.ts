import { axiosClient } from '../../api/axiosClient';
import { ApiResponse } from '../../types';
import { Notification } from './notificationsTypes';

export interface GetNotificationsParams {
  page?: number;
  limit?: number;
}

export const notificationsService = {
  /**
   * Fetch all notifications for the current user (paginated)
   */
  async getNotifications(params?: GetNotificationsParams): Promise<{
    notifications: Notification[];
    unreadCount: number;
    total: number;
    pages: number;
  }> {
    const response = await axiosClient.get<
      ApiResponse<{
        notifications: Notification[];
        unreadCount: number;
        total: number;
        pages: number;
        page: number;
      }>
    >('/notifications', { params });
    const data = response.data.data!;
    return {
      notifications: data.notifications,
      unreadCount: data.unreadCount,
      total: data.total,
      pages: data.pages,
    };
  },

  /**
   * Mark a single notification as read
   */
  async markRead(id: string): Promise<Notification> {
    const response = await axiosClient.patch<ApiResponse<{ notification: Notification }>>(
      `/notifications/${id}/read`
    );
    if (!response.data.data?.notification) throw new Error('Failed to mark notification as read');
    return response.data.data.notification;
  },

  /**
   * Mark all notifications as read
   */
  async markAllRead(): Promise<number> {
    const response = await axiosClient.patch<ApiResponse<{ updatedCount: number }>>(
      '/notifications/read-all'
    );
    return response.data.data?.updatedCount ?? 0;
  },

  /**
   * Delete a single notification
   */
  async deleteNotification(id: string): Promise<string> {
    await axiosClient.delete(`/notifications/${id}`);
    return id;
  },
};
