import React from 'react';
import {
  Wrench,
  Camera,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  Star,
} from 'lucide-react';

export interface CategoryItem {
  id: string;
  label: string;
  count?: number;
}

export interface ToolCategoryFilterProps {
  categories: CategoryItem[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  className?: string;
}

export const ToolCategoryFilter: React.FC<ToolCategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  className = '',
}) => {
  const getCategoryIcon = (id: string) => {
    switch (id.toLowerCase()) {
      case 'all':
        return <Wrench className="w-3.5 h-3.5" />;
      case 'photo':
        return <Camera className="w-3.5 h-3.5" />;
      case 'pdf':
        return <FileSpreadsheet className="w-3.5 h-3.5" />;
      case 'document':
        return <FileText className="w-3.5 h-3.5" />;
      case 'image':
        return <ImageIcon className="w-3.5 h-3.5" />;
      case 'favorites':
        return <Star className="w-3.5 h-3.5" />;
      default:
        return <Wrench className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div
      className={`flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none select-none ${className}`}
    >
      {categories.map((cat) => {
        const isActive =
          selectedCategory.toLowerCase() === cat.id.toLowerCase();

        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
              isActive
                ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/40 scale-[1.02]'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-800'
            }`}
          >
            {getCategoryIcon(cat.id)}
            <span>{cat.label}</span>
            {cat.count !== undefined && (
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold tracking-tight ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {cat.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
