import { Tool } from '../tools/toolsTypes';

/**
 * Admin-scoped User entity (includes isBlocked)
 */
export interface AdminUser {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  profileImage?: string;
  isEmailVerified: boolean;
  isBlocked: boolean;
  favoriteTools?: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Admin File entity (with populated user info)
 */
export interface AdminFile {
  _id: string;
  id?: string;
  user: { _id: string; name: string; email: string; role: string } | null;
  originalName: string;
  fileName: string;
  fileType: 'image' | 'document' | 'pdf';
  mimeType: string;
  fileSize: number;
  fileUrl: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Dashboard statistics payload
 */
export interface AdminStats {
  totalUsers: number;
  totalFiles: number;
  totalProcessed: number;
  activeUsers: number;
  totalTools: number;
}

/**
 * Processing activity by tool
 */
export interface ToolActivity {
  _id: string;
  count: number;
}

/**
 * User growth per day
 */
export interface UserGrowthPoint {
  _id: string; // date string 'YYYY-MM-DD'
  count: number;
}

/**
 * Admin Dashboard full stats response
 */
export interface AdminDashboardData {
  stats: AdminStats;
  recentUsers: AdminUser[];
  processingByTool: ToolActivity[];
  userGrowth: UserGrowthPoint[];
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
  limit: number;
}

/**
 * Redux Admin Slice State
 */
export interface AdminState {
  // Dashboard
  dashboardData: AdminDashboardData | null;
  dashboardLoading: boolean;
  dashboardError: string | null;

  // Users
  users: AdminUser[];
  usersTotal: number;
  usersPage: number;
  usersPages: number;
  usersLoading: boolean;
  usersError: string | null;

  // Tools (reuse from tools slice for CRUD but track loading separately)
  tools: Tool[];
  toolsLoading: boolean;
  toolsError: string | null;

  // Files
  files: AdminFile[];
  filesTotal: number;
  filesPage: number;
  filesPages: number;
  filesLoading: boolean;
  filesError: string | null;

  // Mutation status
  mutationLoading: boolean;
  mutationError: string | null;
  mutationSuccess: string | null;
}

export type { Tool };
