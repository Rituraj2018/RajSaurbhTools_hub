import { axiosClient } from './axiosClient';
import {
  UserFileItem,
  FileListResponse,
  FileFilterParams,
} from '../types/file.types';

export const filesApi = {
  /**
   * Fetch authenticated user's files with search, filter, sort, and pagination
   */
  getFiles: async (params: FileFilterParams = {}): Promise<FileListResponse> => {
    const response = await axiosClient.get<{ success: boolean; data: FileListResponse }>(
      '/files',
      { params }
    );
    return response.data.data;
  },

  /**
   * Fetch single file metadata
   */
  getFileById: async (id: string): Promise<UserFileItem> => {
    const response = await axiosClient.get<{ success: boolean; data: { file: UserFileItem } }>(
      `/files/${id}`
    );
    return response.data.data.file;
  },

  /**
   * Upload a new file to the user's vault
   */
  uploadFile: async (file: File): Promise<UserFileItem> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosClient.post<{ success: boolean; data: { file: UserFileItem } }>(
      '/files/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data.file;
  },

  /**
   * Delete a file permanently
   */
  deleteFile: async (id: string): Promise<{ id: string }> => {
    const response = await axiosClient.delete<{ success: boolean; data: { id: string } }>(
      `/files/${id}`
    );
    return response.data.data;
  },

  /**
   * Helper to download a file
   */
  downloadFile: (file: UserFileItem): void => {
    const downloadUrl = file.fileUrl.startsWith('http')
      ? file.fileUrl
      : `${axiosClient.defaults.baseURL?.replace('/api', '') || ''}${file.fileUrl}`;

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = file.originalName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};
