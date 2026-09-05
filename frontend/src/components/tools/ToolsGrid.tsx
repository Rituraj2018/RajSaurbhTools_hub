import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Tool } from '../../features/tools';
import { ToolCard } from './ToolCard';
import { EmptyState } from '../common/EmptyState';

export interface ToolsGridProps {
  tools: Tool[];
  loading?: boolean;
  onLaunchTool?: (tool: Tool) => void;
  onToggleFavorite?: (toolId: string) => void;
  favoriteIds?: string[];
  onClearFilters?: () => void;
  searchQuery?: string;
  selectedCategory?: string;
}

export const ToolsGrid: React.FC<ToolsGridProps> = ({
  tools,
  loading = false,
  onLaunchTool,
  onToggleFavorite,
  favoriteIds = [],
  onClearFilters,
  searchQuery = '',
  selectedCategory = 'All',
}) => {
  // Skeleton loader for loading state
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 animate-pulse space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-slate-800" />
              <div className="w-16 h-5 rounded-full bg-slate-800" />
            </div>
            <div className="space-y-2">
              <div className="w-3/4 h-5 rounded bg-slate-800" />
              <div className="w-full h-3.5 rounded bg-slate-800/60" />
              <div className="w-2/3 h-3.5 rounded bg-slate-800/60" />
            </div>
            <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between">
              <div className="w-16 h-4 rounded bg-slate-800" />
              <div className="w-12 h-4 rounded bg-slate-800" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state if no tools match
  if (tools.length === 0) {
    return (
      <EmptyState
        icon={<SlidersHorizontal className="w-8 h-8" />}
        title="No tools match your criteria"
        description={
          searchQuery.trim()
            ? `No tools found for "${searchQuery}" in ${selectedCategory} category.`
            : `There are currently no tools listed under ${selectedCategory}.`
        }
        actionText="Reset Filters"
        onAction={onClearFilters}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {tools.map((tool) => {
        const toolObjectId = tool._id ? String(tool._id) : '';
        const toolId = tool.id ? String(tool.id) : '';
        const isFav = favoriteIds.some((favId) => {
          const idStr = String(favId);
          return (
            (toolObjectId && idStr === toolObjectId) ||
            (toolId && idStr === toolId) ||
            (tool.slug && idStr === tool.slug)
          );
        });

        return (
          <ToolCard
            key={tool._id || tool.id || tool.slug}
            tool={tool}
            onLaunch={onLaunchTool}
            onToggleFavorite={onToggleFavorite}
            isFavorite={isFav}
          />
        );
      })}
    </div>
  );
};
