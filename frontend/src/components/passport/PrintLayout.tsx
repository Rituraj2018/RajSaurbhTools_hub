import React from 'react';
import {
  FileSpreadsheet,
  Copy,
  Scissors,
  Square,
  LayoutGrid,
} from 'lucide-react';
import {
  PaperSize,
  PhotoCopies,
  SheetOptions,
} from '../../utils/passportProcessor';

export interface PrintLayoutProps {
  options: SheetOptions;
  onChange: (options: SheetOptions) => void;
}

export const PrintLayout: React.FC<PrintLayoutProps> = ({ options, onChange }) => {
  const handlePaperSizeChange = (paperSize: PaperSize) => {
    onChange({
      ...options,
      paperSize,
    });
  };

  const handleCopiesChange = (copies: PhotoCopies) => {
    onChange({
      ...options,
      copies,
    });
  };

  const handleToggleGuides = () => {
    onChange({
      ...options,
      showCuttingGuides: !options.showCuttingGuides,
    });
  };

  const handleToggleBorder = () => {
    onChange({
      ...options,
      showBorder: !options.showBorder,
    });
  };

  const copiesList: PhotoCopies[] = [4, 6, 8, 12, 16, 24];

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <LayoutGrid className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Print Sheet Layout</h3>
            <p className="text-[11px] text-slate-400">Configure paper size, copy count and cutting guides</p>
          </div>
        </div>
      </div>

      {/* 1. Paper Size Selector (A4, 4x6) */}
      <div className="space-y-2">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
          <span>Paper Size</span>
        </label>

        <div className="grid grid-cols-2 gap-3">
          {/* A4 Paper */}
          <button
            type="button"
            onClick={() => handlePaperSizeChange('A4')}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              options.paperSize === 'A4'
                ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500'
                : 'border-slate-800/80 bg-slate-950/60 hover:bg-slate-950 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-white">A4 Paper</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                210 × 297 mm
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Standard office printer paper sheet (up to 24 photos)
            </p>
          </button>

          {/* 4x6 Photo Paper */}
          <button
            type="button"
            onClick={() => handlePaperSizeChange('4x6')}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              options.paperSize === '4x6'
                ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500'
                : 'border-slate-800/80 bg-slate-950/60 hover:bg-slate-950 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-white">4 × 6 Inch</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                101 × 152 mm
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Standard photo studio card paper (4 to 8 photos)
            </p>
          </button>
        </div>
      </div>

      {/* 2. Photo Copies Selector (4, 6, 8, 12, 16, 24) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Copy className="w-3.5 h-3.5 text-purple-400" />
            <span>Number of Photo Copies</span>
          </label>
          <span className="text-xs font-bold text-purple-400">{options.copies} Copies</span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {copiesList.map((num) => {
            const isSelected = options.copies === num;
            return (
              <button
                key={num}
                type="button"
                onClick={() => handleCopiesChange(num)}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                  isSelected
                    ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-600/30 scale-[1.02]'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-purple-500/40 hover:text-white'
                }`}
              >
                {num}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Toggles: Cutting Guides & Border */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Cutting Guides */}
        <button
          type="button"
          onClick={handleToggleGuides}
          className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
            options.showCuttingGuides
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Scissors className="w-4 h-4 text-emerald-400" />
            <div>
              <p className="text-xs font-bold text-white">Cutting Guides</p>
              <p className="text-[10px] text-slate-400">Scissor alignment marks</p>
            </div>
          </div>
          <span
            className={`w-3.5 h-3.5 rounded-full border ${
              options.showCuttingGuides
                ? 'bg-emerald-500 border-emerald-400'
                : 'border-slate-700'
            }`}
          />
        </button>

        {/* Photo Border */}
        <button
          type="button"
          onClick={handleToggleBorder}
          className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
            options.showBorder
              ? 'bg-blue-500/10 border-blue-500/40 text-blue-300'
              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Square className="w-4 h-4 text-blue-400" />
            <div>
              <p className="text-xs font-bold text-white">Outline Border</p>
              <p className="text-[10px] text-slate-400">1px photo bounding line</p>
            </div>
          </div>
          <span
            className={`w-3.5 h-3.5 rounded-full border ${
              options.showBorder ? 'bg-blue-500 border-blue-400' : 'border-slate-700'
            }`}
          />
        </button>
      </div>
    </div>
  );
};
