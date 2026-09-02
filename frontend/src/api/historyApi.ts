import { axiosClient } from './axiosClient';
import {
  HistoryListResponse,
  HistoryFilterParams,
  CreateHistoryDto,
  HistoryItem,
} from '../types/history.types';

export const historyApi = {
  /**
   * Fetch authenticated user's processing history
   */
  getHistory: async (params: HistoryFilterParams = {}): Promise<HistoryListResponse> => {
    const response = await axiosClient.get<{ success: boolean; data: HistoryListResponse }>(
      '/history',
      { params }
    );
    return response.data.data;
  },

  /**
   * Record a new processing action
   */
  recordHistory: async (entry: CreateHistoryDto): Promise<HistoryItem> => {
    const response = await axiosClient.post<{ success: boolean; data: { history: HistoryItem } }>(
      '/history',
      entry
    );
    return response.data.data.history;
  },

  /**
   * Clear all processing history for the user
   */
  clearHistory: async (): Promise<{ deletedCount: number }> => {
    const response = await axiosClient.delete<{ success: boolean; data: { deletedCount: number } }>(
      '/history'
    );
    return response.data.data;
  },
};
