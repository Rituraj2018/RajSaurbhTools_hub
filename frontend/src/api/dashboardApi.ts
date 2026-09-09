import { axiosClient } from './axiosClient';
import { DashboardData, DashboardResponse } from '../types';

export const dashboardApi = {
  /**
   * Fetch live dashboard metrics, dynamic storage distribution, and recent activities for the authenticated user
   */
  getUserDashboardStats: async (): Promise<DashboardData> => {
    const response = await axiosClient.get<DashboardResponse>('/users/dashboard');
    return response.data.data;
  },
};
