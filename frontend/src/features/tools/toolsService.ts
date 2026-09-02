import { axiosClient } from '../../api/axiosClient';
import { ApiResponse } from '../../types';
import { Tool } from './toolsTypes';

export interface GetToolsParams {
  category?: string;
  search?: string;
  isFeatured?: boolean;
  isActive?: boolean;
}

export const toolsService = {
  /**
   * Fetch all tools with optional query parameters
   */
  async getTools(params?: GetToolsParams): Promise<Tool[]> {
    const response = await axiosClient.get<ApiResponse<{ tools: Tool[]; total: number }>>(
      '/tools',
      { params }
    );
    return response.data.data?.tools || [];
  },

  /**
   * Fetch single tool details by slug
   */
  async getToolBySlug(slug: string): Promise<Tool> {
    const response = await axiosClient.get<ApiResponse<{ tool: Tool }>>(`/tools/${slug}`);
    if (!response.data.data?.tool) {
      throw new Error(response.data.message || 'Tool not found');
    }
    return response.data.data.tool;
  },

  /**
   * Create a new tool (Admin)
   */
  async createTool(data: Partial<Tool>): Promise<Tool> {
    const response = await axiosClient.post<ApiResponse<{ tool: Tool }>>('/tools', data);
    if (!response.data.data?.tool) {
      throw new Error(response.data.message || 'Failed to create tool');
    }
    return response.data.data.tool;
  },

  /**
   * Update tool by ID (Admin)
   */
  async updateTool(id: string, data: Partial<Tool>): Promise<Tool> {
    const response = await axiosClient.put<ApiResponse<{ tool: Tool }>>(`/tools/${id}`, data);
    if (!response.data.data?.tool) {
      throw new Error(response.data.message || 'Failed to update tool');
    }
    return response.data.data.tool;
  },

  /**
   * Delete tool by ID (Admin)
   */
  async deleteTool(id: string): Promise<{ id: string; slug: string }> {
    const response = await axiosClient.delete<
      ApiResponse<{ id: string; name: string; slug: string }>
    >(`/tools/${id}`);
    return { id: response.data.data?.id || id, slug: response.data.data?.slug || '' };
  },

  /**
   * Get authenticated user's favorite tools
   */
  async getFavorites(): Promise<{ favorites: Tool[]; favoriteIds: string[] }> {
    const response = await axiosClient.get<
      ApiResponse<{ favorites: Tool[]; favoriteIds: string[]; totalFavorites: number }>
    >('/users/favorites');
    return {
      favorites: response.data.data?.favorites || [],
      favoriteIds: response.data.data?.favoriteIds || [],
    };
  },

  /**
   * Add a tool to authenticated user's favorites
   */
  async addFavorite(toolId: string): Promise<string[]> {
    const response = await axiosClient.post<
      ApiResponse<{ favoriteTools: string[]; toolId: string }>
    >(`/users/favorites/${toolId}`);
    return response.data.data?.favoriteTools || [];
  },

  /**
   * Remove a tool from authenticated user's favorites
   */
  async removeFavorite(toolId: string): Promise<string[]> {
    const response = await axiosClient.delete<
      ApiResponse<{ favoriteTools: string[]; toolId: string }>
    >(`/users/favorites/${toolId}`);
    return response.data.data?.favoriteTools || [];
  },
};
