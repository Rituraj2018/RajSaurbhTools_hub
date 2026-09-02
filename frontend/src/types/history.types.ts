export type HistoryStatus = 'processing' | 'completed' | 'failed';

export interface HistoryFileInput {
  name: string;
  size?: number;
  type?: string;
  url?: string;
}

export interface HistoryFileOutput {
  name: string;
  size?: number;
  type?: string;
  url?: string;
}

export interface HistoryItem {
  id: string;
  _id?: string;
  user: string;
  tool: string;
  toolName?: string;
  inputFiles: Array<HistoryFileInput | string>;
  outputFile?: HistoryFileOutput | string;
  status: HistoryStatus;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt?: string;
}

export interface HistoryStats {
  totalCount: number;
  completedCount: number;
  processingCount: number;
  failedCount: number;
}

export interface HistoryListResponse {
  history: HistoryItem[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  stats?: HistoryStats;
}

export interface HistoryFilterParams {
  search?: string;
  tool?: string;
  status?: HistoryStatus | 'all';
  sortBy?: 'newest' | 'oldest';
  page?: number;
  limit?: number;
}

export interface CreateHistoryDto {
  tool: string;
  toolName?: string;
  inputFiles: Array<HistoryFileInput | string>;
  outputFile?: HistoryFileOutput | string;
  status?: HistoryStatus;
  metadata?: Record<string, any>;
}
