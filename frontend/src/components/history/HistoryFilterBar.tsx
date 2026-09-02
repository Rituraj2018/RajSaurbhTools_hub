import React from 'react';
import {
  Search,
  X,
  Wrench,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  AlertCircle,
  Layers,
  Trash2,
} from 'lucide-react';
import { HistoryStatus } from '../../types/history.types';
import { Button } from '../common/Button';

export interface HistoryFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTool: string;
  onToolChange: (tool: string) => void;
  selectedStatus: HistoryStatus | 'all';
  onStatusChange: (status: HistoryStatus | 'all') => void;
  sortBy: 'newest' | 'oldest';
  onSortChange: (sort: 'newest' | 'oldest') => void;
  onClearHistory?: () => void;
  hasEntries: boolean;
}

export const HistoryFilterBar: React.FC<HistoryFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedTool,
  onToolChange,
  selectedStatus,
  onStatusChange,
  sortBy,
  onSortChange,
  onClearHistory,
  hasEntries,
}) => {
  return (
    <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
      {/* Top Row: Search Input + Tool Dropdown + Sort Dropdown + Clear Action */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Field */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search history by tool name, input file, or output file..."
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
          {/* Tool Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
            <Wrench className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <select
              value={selectedTool}
              onChange={(e) => onToolChange(e.target.value)}
              className="bg-transparent text-xs text-slate-200 outline-none cursor-pointer pr-1"
            >
              <option value="all" className="bg-slate-900 text-white">
                All Tools
              </option>
              <option value="passport" className="bg-slate-900 text-white">
                Passport Photo Studio
              </option>
              <option value="image-to-pdf" className="bg-slate-900 text-white">
                Image to PDF Tool
              </option>
              <option value="pdf-merge" className="bg-slate-900 text-white">
                PDF Merge Tool
              </option>
              <option value="aadhaar" className="bg-slate-900 text-white">
                Aadhaar Print Studio
              </option>
              <option value="ayushman" className="bg-slate-900 text-white">
                Ayushman Card Print Tool
              </option>
            </select>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as 'newest' | 'oldest')}
              className="bg-transparent text-xs text-slate-200 outline-none cursor-pointer pr-1"
            >
              <option value="newest" className="bg-slate-900 text-white">
                Newest First
              </option>
              <option value="oldest" className="bg-slate-900 text-white">
                Oldest First
              </option>
            </select>
          </div>

          {/* Clear History Button */}
          {hasEntries && onClearHistory && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearHistory}
              className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 text-xs"
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Clear Log
            </Button>
          )}
        </div>
      </div>

      {/* Bottom Row: Status Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
        <button
          type="button"
          onClick={() => onStatusChange('all')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
            selectedStatus === 'all'
              ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/20'
              : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All Statuses</span>
        </button>

        <button
          type="button"
          onClick={() => onStatusChange('completed')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
            selectedStatus === 'completed'
              ? 'bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-500/20'
              : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Completed</span>
        </button>

        <button
          type="button"
          onClick={() => onStatusChange('processing')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
            selectedStatus === 'processing'
              ? 'bg-cyan-600 border-cyan-500 text-white shadow-md shadow-cyan-500/20'
              : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>In Progress</span>
        </button>

        <button
          type="button"
          onClick={() => onStatusChange('failed')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
            selectedStatus === 'failed'
              ? 'bg-rose-600 border-rose-500 text-white shadow-md shadow-rose-500/20'
              : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Failed</span>
        </button>
      </div>
    </div>
  );
};
