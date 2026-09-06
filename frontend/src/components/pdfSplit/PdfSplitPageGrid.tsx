import React from 'react';
import { Check, CheckSquare, Square, RefreshCw } from 'lucide-react';
import { PdfPageInfo } from '../../utils/pdfSplitProcessor';

interface PdfSplitPageGridProps {
  pages: PdfPageInfo[];
  selectedPages: number[]; // 1-indexed
  onTogglePage: (pageNumber: number) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  onInvertSelection: () => void;
}

export const PdfSplitPageGrid: React.FC<PdfSplitPageGridProps> = ({
  pages,
  selectedPages,
  onTogglePage,
  onSelectAll,
  onClearAll,
  onInvertSelection,
}) => {
  const isSelected = (pageNum: number) => selectedPages.includes(pageNum);

  return (
    <div className="space-y-4">
      {/* Grid Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Document Pages ({pages.length})
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-semibold">
            {selectedPages.length} Selected
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onSelectAll}
            className="px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <CheckSquare className="w-3.5 h-3.5 text-blue-400" />
            <span>Select All</span>
          </button>
          <button
            onClick={onClearAll}
            className="px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Square className="w-3.5 h-3.5 text-slate-400" />
            <span>Clear</span>
          </button>
          <button
            onClick={onInvertSelection}
            className="px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5 text-purple-400" />
            <span>Invert</span>
          </button>
        </div>
      </div>

      {/* Pages Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-[600px] overflow-y-auto p-2 rounded-2xl bg-slate-950/40 border border-slate-800/80 custom-scrollbar">
        {pages.map((p) => {
          const active = isSelected(p.pageNumber);
          return (
            <div
              key={p.pageNumber}
              onClick={() => onTogglePage(p.pageNumber)}
              className={`group relative rounded-xl border p-2 cursor-pointer transition-all duration-200 flex flex-col items-center select-none ${
                active
                  ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10 ring-2 ring-blue-500/40'
                  : 'border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-800/60 opacity-70 hover:opacity-100'
              }`}
            >
              {/* Checkbox badge */}
              <div
                className={`absolute top-3 right-3 w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                  active
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-slate-800/90 text-transparent border border-slate-700 group-hover:border-slate-500'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
              </div>

              {/* Page Number Badge */}
              <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-sm border border-slate-800 text-[10px] font-bold text-slate-300">
                Page {p.pageNumber}
              </div>

              {/* Thumbnail Container */}
              <div className="w-full aspect-[1/1.35] bg-white rounded-lg overflow-hidden flex items-center justify-center shadow-inner mt-6 mb-2">
                {p.thumbnailUrl ? (
                  <img
                    src={p.thumbnailUrl}
                    alt={`Page ${p.pageNumber}`}
                    className="w-full h-full object-contain pointer-events-none"
                    loading="lazy"
                  />
                ) : (
                  <span className="text-slate-400 text-xs font-mono">Page {p.pageNumber}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
