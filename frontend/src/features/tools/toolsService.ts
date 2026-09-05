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
    const rawIds = response.data.data?.favoriteIds || [];
    const favorites = response.data.data?.favorites || [];
    return {
      favorites,
      favoriteIds: rawIds.map((id: any) => String(id)),
    };
  },

  /**
   * Toggle a tool in authenticated user's favorites
   */
  async toggleFavorite(
    toolId: string
  ): Promise<{ favoriteTools: string[]; toolId: string; isFavorite: boolean }> {
    const response = await axiosClient.post<
      ApiResponse<{ favoriteTools: string[]; toolId: string; isFavorite: boolean }>
    >(`/users/favorites/${toolId}`);
    const raw = response.data.data?.favoriteTools || [];
    return {
      favoriteTools: raw.map((id: any) => String(id)),
      toolId: response.data.data?.toolId || toolId,
      isFavorite: !!response.data.data?.isFavorite,
    };
  },

  /**
   * Add a tool to authenticated user's favorites
   */
  async addFavorite(toolId: string): Promise<string[]> {
    const res = await this.toggleFavorite(toolId);
    return res.favoriteTools;
  },

  /**
   * Remove a tool from authenticated user's favorites
   */
  async removeFavorite(toolId: string): Promise<string[]> {
    const response = await axiosClient.delete<
      ApiResponse<{ favoriteTools: string[]; toolId: string }>
    >(`/users/favorites/${toolId}`);
    const raw = response.data.data?.favoriteTools || [];
    return raw.map((id: any) => String(id));
  },
};
