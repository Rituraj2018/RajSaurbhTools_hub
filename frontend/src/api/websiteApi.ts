import { axiosClient } from './axiosClient';
import {
  Website,
  WebsiteFormData,
  WebsitesApiResponse,
  SingleWebsiteApiResponse,
} from '../types/website';

export const websiteApi = {
  /**
   * Fetch all useful websites (Public or Admin filtered)
   */
  async getWebsites(params?: { isActive?: boolean | string; search?: string }): Promise<Website[]> {
    const response = await axiosClient.get<WebsitesApiResponse>('/websites', { params });
    return response.data.data?.websites || [];
  },

  /**
   * Fetch single website by ID
   */
  async getWebsiteById(id: string): Promise<Website> {
    const response = await axiosClient.get<SingleWebsiteApiResponse>(`/websites/${id}`);
    if (!response.data.data?.website) {
      throw new Error('Website not found');
    }
    return response.data.data.website;
  },

  /**
   * Add a new website (Admin only)
   */
  async createWebsite(data: WebsiteFormData): Promise<Website> {
    const response = await axiosClient.post<SingleWebsiteApiResponse>('/websites', data);
    if (!response.data.data?.website) {
      throw new Error('Failed to create website');
    }
    return response.data.data.website;
  },

  /**
   * Update an existing website (Admin only)
   */
  async updateWebsite(id: string, data: Partial<WebsiteFormData>): Promise<Website> {
    const response = await axiosClient.put<SingleWebsiteApiResponse>(`/websites/${id}`, data);
    if (!response.data.data?.website) {
      throw new Error('Failed to update website');
    }
    return response.data.data.website;
  },

  /**
   * Delete a website by ID (Admin only)
   */
  async deleteWebsite(id: string): Promise<{ id: string; name: string }> {
    const response = await axiosClient.delete<{
      success: boolean;
      message: string;
      data: { id: string; name: string };
    }>(`/websites/${id}`);
    return response.data.data;
  },
};
