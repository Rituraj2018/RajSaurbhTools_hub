import { axiosClient } from './axiosClient';
import {
  HistoryListResponse,
  HistoryFilterParams,
  CreateHistoryDto,
  HistoryItem,
  PopularToolUsage,
} from '../types/history.types';

const LOCAL_USAGE_KEY = 'rajsaurabh_popular_tool_usage';

export const getLocalToolUsageMap = (): Record<string, number> => {
  try {
    const raw = localStorage.getItem(LOCAL_USAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const incrementLocalToolUsage = (toolSlugOrName: string): void => {
  if (!toolSlugOrName) return;
  try {
    const map = getLocalToolUsageMap();
    const key = toolSlugOrName.toLowerCase().trim();
    map[key] = (map[key] || 0) + 1;
    localStorage.setItem(LOCAL_USAGE_KEY, JSON.stringify(map));
    window.dispatchEvent(
      new CustomEvent('rajsaurabh:tool_used', { detail: { tool: key, count: map[key] } })
    );
  } catch {
    // ignore local storage errors
  }
};

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
   * Fetch top popular tools usage rankings from processing history
   */
  getPopularTools: async (): Promise<PopularToolUsage[]> => {
    try {
      const response = await axiosClient.get<{
        success: boolean;
        data: { popular: PopularToolUsage[] };
      }>('/tools/popular');
      if (response.data?.data?.popular) {
        return response.data.data.popular;
      }
    } catch {
      try {
        const fallbackRes = await axiosClient.get<{
          success: boolean;
          data: { popular: PopularToolUsage[] };
        }>('/history/popular');
        if (fallbackRes.data?.data?.popular) {
          return fallbackRes.data.data.popular;
        }
      } catch {
        // Ignore network errors - local fallback will handle
      }
    }
    return [];
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
   * Record a new processing action safely without throwing on error
   */
  recordToolHistorySafely: async (entry: CreateHistoryDto): Promise<HistoryItem | null> => {
    incrementLocalToolUsage(entry.tool);
    if (entry.toolName && entry.toolName !== entry.tool) {
      incrementLocalToolUsage(entry.toolName);
    }
    try {
      return await historyApi.recordHistory(entry);
    } catch (historyError) {
      console.error('Failed to record processing history:', historyError);
      return null;
    }
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

/**
 * Convenience helper to record tool history safely without breaking tool operations
 */
export const recordToolHistorySafely = historyApi.recordToolHistorySafely;

