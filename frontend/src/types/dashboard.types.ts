export interface DashboardMetrics {
  totalToolsUsed: number;
  filesProcessed: number;
  storageUsedBytes: number;
  storageSavedBytes: number;
  totalFavorites: number;
}

export interface DashboardStorageCategory {
  fileType: 'image' | 'pdf' | 'document';
  name: string;
  bytes: number;
  count: number;
  percentage: number;
  color: string;
}

export interface DashboardRecentActivity {
  id: string;
  fileName: string;
  tool: string;
  toolName: string;
  size: string;
  sizeBytes?: number;
  status: 'completed' | 'processing' | 'failed';
  createdAt: string;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  storageBreakdown: DashboardStorageCategory[];
  recentActivities: DashboardRecentActivity[];
}

export interface DashboardResponse {
  success: boolean;
  message: string;
  data: DashboardData;
}
