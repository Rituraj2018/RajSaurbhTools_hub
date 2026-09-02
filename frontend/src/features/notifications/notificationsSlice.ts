import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { NotificationsState, Notification } from './notificationsTypes';
import {
  notificationsService,
  GetNotificationsParams,
} from './notificationsService';

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  total: 0,
  loading: false,
  error: null,
  markingRead: false,
};

/* ─── Async Thunks ─── */

export const fetchNotifications = createAsyncThunk<
  { notifications: Notification[]; unreadCount: number; total: number },
  GetNotificationsParams | undefined,
  { rejectValue: string }
>('notifications/fetch', async (params, { rejectWithValue }) => {
  try {
    const data = await notificationsService.getNotifications(params);
    return { notifications: data.notifications, unreadCount: data.unreadCount, total: data.total };
  } catch (e: any) {
    return rejectWithValue(e?.message || 'Failed to fetch notifications');
  }
});

export const markNotificationRead = createAsyncThunk<
  Notification,
  string,
  { rejectValue: string }
>('notifications/markRead', async (id, { rejectWithValue }) => {
  try {
    return await notificationsService.markRead(id);
  } catch (e: any) {
    return rejectWithValue(e?.message || 'Failed to mark notification read');
  }
});

export const markAllNotificationsRead = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>('notifications/markAllRead', async (_, { rejectWithValue }) => {
  try {
    await notificationsService.markAllRead();
  } catch (e: any) {
    return rejectWithValue(e?.message || 'Failed to mark all notifications read');
  }
});

export const deleteNotification = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('notifications/delete', async (id, { rejectWithValue }) => {
  try {
    return await notificationsService.deleteNotification(id);
  } catch (e: any) {
    return rejectWithValue(e?.message || 'Failed to delete notification');
  }
});

/* ─── Slice ─── */

export const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearNotificationsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    /* Fetch */
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
        state.total = action.payload.total;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch notifications';
      });

    /* Mark single as read */
    builder
      .addCase(markNotificationRead.pending, (state) => {
        state.markingRead = true;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        state.markingRead = false;
        const idx = state.notifications.findIndex((n) => n._id === action.payload._id);
        if (idx !== -1) {
          const wasUnread = !state.notifications[idx].isRead;
          state.notifications[idx] = action.payload;
          if (wasUnread) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
        }
      })
      .addCase(markNotificationRead.rejected, (state) => {
        state.markingRead = false;
      });

    /* Mark ALL as read */
    builder
      .addCase(markAllNotificationsRead.pending, (state) => {
        state.markingRead = true;
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.markingRead = false;
        state.notifications = state.notifications.map((n) => ({ ...n, isRead: true }));
        state.unreadCount = 0;
      })
      .addCase(markAllNotificationsRead.rejected, (state) => {
        state.markingRead = false;
      });

    /* Delete */
    builder.addCase(deleteNotification.fulfilled, (state, action) => {
      const removed = state.notifications.find((n) => n._id === action.payload);
      state.notifications = state.notifications.filter((n) => n._id !== action.payload);
      state.total = Math.max(0, state.total - 1);
      if (removed && !removed.isRead) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    });
  },
});

export const { clearNotificationsError } = notificationsSlice.actions;
export default notificationsSlice.reducer;
