/**
 * Supported Tool Categories
 */
export type ToolCategory = 'All' | 'Photo' | 'PDF' | 'Document' | 'Image';

export const TOOL_CATEGORIES: ToolCategory[] = ['All', 'Photo', 'PDF', 'Document', 'Image'];

/**
 * Tool entity interface
 */
export interface Tool {
  id?: string;
  _id?: string;
  name: string;
  slug: string;
  description: string;
  category: 'Photo' | 'PDF' | 'Document' | 'Image';
  icon: string;
  isActive: boolean;
  isFeatured: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Redux Tools Slice State
 */
export interface ToolsState {
  tools: Tool[];
  selectedTool: Tool | null;
  favoriteToolIds: string[];
  activeCategory: string;
  searchQuery: string;
  loading: boolean;
  error: string | null;
}
