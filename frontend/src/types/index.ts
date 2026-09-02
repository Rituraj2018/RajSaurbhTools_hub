export interface ApiResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  errors?: string[];
}

export interface HealthCheckData {
  success: boolean;
  message: string;
  database: string;
  appName?: string;
  status?: string;
  timestamp?: string;
  uptime?: string;
  environment?: string;
}

export type ToolCategoryType = 'all' | 'photo' | 'pdf' | 'document' | 'favorites';

export interface ToolItem {
  id: string;
  title: string;
  description: string;
  category: 'photo' | 'pdf' | 'document';
  icon: string;
  badge?: string;
  popular?: boolean;
  isFavorite?: boolean;
  fileTypes?: string[];
  estimatedSpeed?: string;
}

export interface DashboardStat {
  id: string;
  label: string;
  value: string;
  numericValue: number;
  change: string;
  isPositive: boolean;
  icon: string;
  gradient: string;
  textColor: string;
  borderColor: string;
  subtitle: string;
}

export interface RecentActivity {
  id: string;
  fileName: string;
  toolName: string;
  category: 'photo' | 'pdf' | 'document';
  timestamp: string;
  size: string;
  status: 'completed' | 'processing' | 'failed';
}

export interface StorageCategory {
  name: string;
  size: string;
  color: string;
  percentage: number;
}

export * from './file.types';
export * from './history.types';
