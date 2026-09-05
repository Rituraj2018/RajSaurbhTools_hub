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
   * Helper to download a file.
   * Cloud-stored files (google_drive, onedrive) are streamed through the backend
   * proxy endpoint which holds the user's OAuth token.
   * Legacy files (cloudinary, local) use their direct URL.
   */
  downloadFile: async (file: UserFileItem): Promise<void> => {
    const fileId = file.id || file._id || '';

    // Cloud-stored files: download via backend proxy
    if (
      file.storageProvider === 'google_drive' ||
      file.storageProvider === 'onedrive'
    ) {
      try {
        const response = await axiosClient.get(`/files/${fileId}?download=true`, {
          responseType: 'blob',
        });

        // Create a download link from the blob
        const contentType = (response.headers['content-type'] as string) || file.mimeType || 'application/octet-stream';
        const blob = new Blob([response.data], { type: contentType });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.originalName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error('[filesApi] Cloud download failed:', err);
        throw err;
      }
      return;
    }

    // Legacy files (cloudinary / local): open direct URL
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

  /**
   * Helper to get a viewable blob URL for cloud-stored files or backend stream
   */
  getFileBlobUrl: async (fileId: string): Promise<string> => {
    const response = await axiosClient.get(`/files/${fileId}?view=true`, {
      responseType: 'blob',
    });
    const contentType = (response.headers['content-type'] as string) || 'image/jpeg';
    const blob = new Blob([response.data], { type: contentType });
    return window.URL.createObjectURL(blob);
  },
};
