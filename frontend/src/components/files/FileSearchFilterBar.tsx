import React from 'react';
import {
  Search,
  X,
  LayoutGrid,
  List,
  Plus,
  ArrowUpDown,
  FileImage,
  FileText,
  FileSpreadsheet,
  Files,
} from 'lucide-react';
import {
  FileTypeFilter,
  FileSortOption,
} from '../../types/file.types';
import { Button } from '../common/Button';

export interface FileSearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedType: FileTypeFilter;
  onTypeChange: (type: FileTypeFilter) => void;
  sortBy: FileSortOption;
  onSortChange: (sort: FileSortOption) => void;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
  onUploadClick: () => void;
}

export const FileSearchFilterBar: React.FC<FileSearchFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  onUploadClick,
}) => {
  return (
    <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
      {/* Top Row: Search Input + Sort Dropdown + View Mode + Upload Button */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Field */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search your files by name..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-9 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:border-blue-500 outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Controls Group */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as FileSortOption)}
              className="bg-transparent text-xs text-slate-200 outline-none cursor-pointer pr-1"
            >
              <option value="newest" className="bg-slate-900 text-white">
                Newest First
              </option>
              <option value="oldest" className="bg-slate-900 text-white">
                Oldest First
              </option>
              <option value="size_desc" className="bg-slate-900 text-white">
                Size: Largest
              </option>
              <option value="size_asc" className="bg-slate-900 text-white">
                Size: Smallest
              </option>
              <option value="name_asc" className="bg-slate-900 text-white">
                Name (A-Z)
              </option>
              <option value="name_desc" className="bg-slate-900 text-white">
                Name (Z-A)
              </option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800">
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Upload Button */}
          <Button
            variant="gradient"
            size="sm"
            onClick={onUploadClick}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Upload File
          </Button>
        </div>
      </div>

      {/* Bottom Row: File Type Filter Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
        <button
          type="button"
          onClick={() => onTypeChange('all')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
            selectedType === 'all'
              ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/20'
              : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
          }`}
        >
          <Files className="w-3.5 h-3.5" />
          <span>All Files</span>
        </button>

        <button
          type="button"
          onClick={() => onTypeChange('image')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
            selectedType === 'image'
              ? 'bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-500/20'
              : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
          }`}
        >
          <FileImage className="w-3.5 h-3.5" />
          <span>Photos & Images</span>
        </button>

        <button
          type="button"
          onClick={() => onTypeChange('pdf')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
            selectedType === 'pdf'
              ? 'bg-red-600 border-red-500 text-white shadow-md shadow-red-500/20'
              : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>PDF Documents</span>
        </button>

        <button
          type="button"
          onClick={() => onTypeChange('document')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
            selectedType === 'document'
              ? 'bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-500/20'
              : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Other Docs</span>
        </button>
      </div>
    </div>
  );
};
