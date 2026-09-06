import React from 'react';
import { Layers, Scissors, ListFilter, AlertCircle } from 'lucide-react';
import { SplitMode } from '../../utils/pdfSplitProcessor';

interface PdfSplitControlsProps {
  splitMode: SplitMode;
  onSplitModeChange: (mode: SplitMode) => void;
  rangeText: string;
  onRangeTextChange: (text: string) => void;
  rangeError: string | null;
  totalPages: number;
}

export const PdfSplitControls: React.FC<PdfSplitControlsProps> = ({
  splitMode,
  onSplitModeChange,
  rangeText,
  onRangeTextChange,
  rangeError,
  totalPages,
}) => {
  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
      <div>
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
          Split Configuration
        </h3>
        <p className="text-xs text-slate-400">
          Choose how you want to extract and organize pages from this document.
        </p>
      </div>

      {/* Mode Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => onSplitModeChange('selected-pages')}
          className={`p-4 rounded-xl border text-left transition-all ${
            splitMode === 'selected-pages'
              ? 'border-blue-500 bg-blue-500/10 text-white ring-1 ring-blue-500'
              : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-white hover:border-slate-700'
          }`}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <Layers className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold">Visual Selection</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            Click thumbnails directly to cherry-pick pages.
          </p>
        </button>

        <button
          type="button"
          onClick={() => onSplitModeChange('custom-range')}
          className={`p-4 rounded-xl border text-left transition-all ${
            splitMode === 'custom-range'
              ? 'border-blue-500 bg-blue-500/10 text-white ring-1 ring-blue-500'
              : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-white hover:border-slate-700'
          }`}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <ListFilter className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold">Custom Range</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            Specify exact ranges like 1-3, 5, 8-10.
          </p>
        </button>

        <button
          type="button"
          onClick={() => onSplitModeChange('all-individual')}
          className={`p-4 rounded-xl border text-left transition-all ${
            splitMode === 'all-individual'
              ? 'border-blue-500 bg-blue-500/10 text-white ring-1 ring-blue-500'
              : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-white hover:border-slate-700'
          }`}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <Scissors className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold">Split Every Page</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            Extract every single page into separate PDF files.
          </p>
        </button>
      </div>

      {/* Custom Range Input Field */}
      {splitMode === 'custom-range' && (
        <div className="space-y-2 pt-2 animate-fadeIn">
          <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
            <span>Enter Page Ranges</span>
            <span className="text-[11px] text-slate-500 font-normal">
              Total Pages: {totalPages}
            </span>
          </label>
          <input
            type="text"
            value={rangeText}
            onChange={(e) => onRangeTextChange(e.target.value)}
            placeholder="e.g. 1-3, 5, 8-12"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-colors"
          />
          {rangeError ? (
            <div className="flex items-center gap-1.5 text-xs text-red-400">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{rangeError}</span>
            </div>
          ) : (
            <p className="text-[11px] text-slate-400">
              Use hyphens for ranges (e.g. <code>1-4</code>) and commas to separate individual pages (e.g. <code>1-4, 7, 9-10</code>).
            </p>
          )}
        </div>
      )}
    </div>
  );
};
