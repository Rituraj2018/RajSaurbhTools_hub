import React from 'react';
import {
  FileSpreadsheet,
  Scissors,
  Square,
  Sliders,
  Maximize,
  CheckCircle,
} from 'lucide-react';
import {
  AyushmanPrintOptions,
} from '../../utils/ayushmanProcessor';

export interface AyushmanPrintLayoutProps {
  options: AyushmanPrintOptions;
  onChangeOptions: (options: AyushmanPrintOptions) => void;
  totalCards: number;
}

export const AyushmanPrintLayout: React.FC<AyushmanPrintLayoutProps> = ({
  options,
  onChangeOptions,
  totalCards,
}) => {
  const update = (partial: Partial<AyushmanPrintOptions>) => {
    onChangeOptions({
      ...options,
      ...partial,
    });
  };

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              A4 Sheet Print Settings
            </h3>
            <p className="text-[11px] text-slate-400">
              Arranging {totalCards} {totalCards === 1 ? 'card pair' : 'card pairs'} on A4 sheet
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
          A4 (210 × 297 mm)
        </span>
      </div>

      {/* 1. Layout Mode */}
      <div className="space-y-2">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Maximize className="w-3.5 h-3.5 text-emerald-400" />
          <span>Card Alignment & Arrangement</span>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => update({ layoutMode: 'side-by-side' })}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              options.layoutMode === 'side-by-side'
                ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500'
                : 'border-slate-800 bg-slate-950/60 hover:bg-slate-950 hover:border-slate-700'
            }`}
          >
            <p className="text-xs font-bold text-white">Side-by-Side (Recommended)</p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Front & Back side-by-side with fold guideline for quick card pouch lamination
            </p>
          </button>

          <button
            type="button"
            onClick={() => update({ layoutMode: 'stacked' })}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              options.layoutMode === 'stacked'
                ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500'
                : 'border-slate-800 bg-slate-950/60 hover:bg-slate-950 hover:border-slate-700'
            }`}
          >
            <p className="text-xs font-bold text-white">Stacked (Vertical)</p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Front placed above Back card centered vertically on paper
            </p>
          </button>
        </div>
      </div>

      {/* 2. Print Marks Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Cutting Guides */}
        <div
          onClick={() => update({ showCuttingGuides: !options.showCuttingGuides })}
          className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
            options.showCuttingGuides
              ? 'border-emerald-500/60 bg-emerald-500/10'
              : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Scissors className="w-4 h-4 text-emerald-400" />
            <div>
              <p className="text-xs font-bold text-white">Scissor Cut Crosshairs</p>
              <p className="text-[10px] text-slate-400">Corner alignment markers</p>
            </div>
          </div>
          <div
            className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
              options.showCuttingGuides
                ? 'bg-emerald-600 border-emerald-500 text-white'
                : 'border-slate-700 bg-slate-900'
            }`}
          >
            {options.showCuttingGuides && <CheckCircle className="w-3.5 h-3.5" />}
          </div>
        </div>

        {/* Card Border */}
        <div
          onClick={() => update({ showBorder: !options.showBorder })}
          className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
            options.showBorder
              ? 'border-emerald-500/60 bg-emerald-500/10'
              : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Square className="w-4 h-4 text-teal-400" />
            <div>
              <p className="text-xs font-bold text-white">Card Outline Border</p>
              <p className="text-[10px] text-slate-400">1px cutting boundary line</p>
            </div>
          </div>
          <div
            className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
              options.showBorder
                ? 'bg-emerald-600 border-emerald-500 text-white'
                : 'border-slate-700 bg-slate-900'
            }`}
          >
            {options.showBorder && <CheckCircle className="w-3.5 h-3.5" />}
          </div>
        </div>
      </div>

      {/* 3. Card Spacing Slider */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-xs">
          <label className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            <span>Card Separation Gap</span>
          </label>
          <span className="font-mono text-slate-400">{options.cardSpacingMm} mm</span>
        </div>
        <input
          type="range"
          min="0"
          max="15"
          step="1"
          value={options.cardSpacingMm}
          onChange={(e) => update({ cardSpacingMm: parseInt(e.target.value) })}
          className="w-full accent-emerald-400"
        />
      </div>
    </div>
  );
};
