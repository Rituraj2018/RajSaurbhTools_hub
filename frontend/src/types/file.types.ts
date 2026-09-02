export interface UserFileItem {
  id: string;
  _id?: string;
  user: string;
  originalName: string;
  fileName: string;
  fileType: 'image' | 'pdf' | 'document';
  mimeType: string;
  fileSize: number;
  fileUrl: string;
  createdAt: string;
  updatedAt?: string;
}

export interface FileStorageStats {
  totalStorageBytes: number;
  totalFilesCount: number;
  imageCount: number;
  pdfCount: number;
  documentCount: number;
}

export interface FileListResponse {
  files: UserFileItem[];
  totalFiles: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  stats?: FileStorageStats;
}

export type FileTypeFilter = 'all' | 'image' | 'pdf' | 'document';

export type FileSortOption =
  | 'newest'
  | 'oldest'
  | 'size_desc'
  | 'size_asc'
  | 'name_asc'
  | 'name_desc';

export interface FileFilterParams {
  search?: string;
  type?: FileTypeFilter;
  sortBy?: FileSortOption;
  page?: number;
  limit?: number;
}
