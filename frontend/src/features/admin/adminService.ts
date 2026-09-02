import { axiosClient } from '../../api/axiosClient';
import { ApiResponse } from '../../types';
import {
  AdminDashboardData,
  AdminUser,
  AdminFile,
  PaginatedResponse,
} from './adminTypes';
import { Tool } from '../tools/toolsTypes';

export interface GetUsersParams {
  search?: string;
  page?: number;
  limit?: number;
  role?: 'admin' | 'user';
}

export interface GetFilesParams {
  page?: number;
  limit?: number;
  fileType?: 'image' | 'document' | 'pdf';
}

export const adminService = {
  /**
   * Fetch admin dashboard statistics
   */
  async getStats(): Promise<AdminDashboardData> {
    const response = await axiosClient.get<ApiResponse<AdminDashboardData>>('/admin/stats');
    if (!response.data.data) throw new Error('No stats data returned');
    return response.data.data;
  },

  /**
   * Fetch all users (paginated + searchable)
   */
  async getUsers(
    params?: GetUsersParams
  ): Promise<PaginatedResponse<AdminUser> & { users: AdminUser[] }> {
    const response = await axiosClient.get<
      ApiResponse<{
        users: AdminUser[];
        total: number;
        page: number;
        pages: number;
        limit: number;
      }>
    >('/admin/users', { params });
    const data = response.data.data!;
    return {
      items: data.users,
      users: data.users,
      total: data.total,
      page: data.page,
      pages: data.pages,
      limit: data.limit,
    };
  },

  /**
   * Block a user
   */
  async blockUser(userId: string): Promise<AdminUser> {
    const response = await axiosClient.patch<ApiResponse<{ user: AdminUser }>>(
      `/admin/users/${userId}/block`
    );
    if (!response.data.data?.user) throw new Error('Failed to block user');
    return response.data.data.user;
  },

  /**
   * Unblock a user
   */
  async unblockUser(userId: string): Promise<AdminUser> {
    const response = await axiosClient.patch<ApiResponse<{ user: AdminUser }>>(
      `/admin/users/${userId}/unblock`
    );
    if (!response.data.data?.user) throw new Error('Failed to unblock user');
    return response.data.data.user;
  },

  /**
   * Delete a user (cascades files + history)
   */
  async deleteUser(userId: string): Promise<{ id: string; name: string; email: string }> {
    const response = await axiosClient.delete<
      ApiResponse<{ id: string; name: string; email: string }>
    >(`/admin/users/${userId}`);
    return response.data.data!;
  },

  /**
   * Fetch all files (admin view with user info)
   */
  async getFiles(
    params?: GetFilesParams
  ): Promise<PaginatedResponse<AdminFile> & { files: AdminFile[] }> {
    const response = await axiosClient.get<
      ApiResponse<{
        files: AdminFile[];
        total: number;
        page: number;
        pages: number;
        limit: number;
      }>
    >('/admin/files', { params });
    const data = response.data.data!;
    return {
      items: data.files,
      files: data.files,
      total: data.total,
      page: data.page,
      pages: data.pages,
      limit: data.limit,
    };
  },

  /**
   * Fetch all tools for admin (active + inactive)
   */
  async fetchAllTools(): Promise<Tool[]> {
    const response = await axiosClient.get<any>('/tools');
    return response.data.data?.tools || [];
  },

  /**
   * Create a new tool (admin)
   */
  async createTool(data: Partial<Tool>): Promise<Tool> {
    const response = await axiosClient.post<ApiResponse<{ tool: Tool }>>('/tools', data);
    if (!response.data.data?.tool) throw new Error('Failed to create tool');
    return response.data.data.tool;
  },

  /**
   * Update a tool by ID (admin)
   */
  async updateTool(id: string, data: Partial<Tool>): Promise<Tool> {
    const response = await axiosClient.put<ApiResponse<{ tool: Tool }>>(`/tools/${id}`, data);
    if (!response.data.data?.tool) throw new Error('Failed to update tool');
    return response.data.data.tool;
  },

  /**
   * Delete a tool by ID (admin)
   */
  async deleteTool(id: string): Promise<string> {
    await axiosClient.delete(`/tools/${id}`);
    return id;
  },
};
