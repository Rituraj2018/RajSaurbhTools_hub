import React from 'react';
import { LayoutGrid, Scissors, Square } from 'lucide-react';
import { PanPrintOptions } from '../../utils/panProcessor';

interface PanPrintLayoutProps {
  options: PanPrintOptions;
  onChangeOptions: (options: PanPrintOptions) => void;
}

export const PanPrintLayout: React.FC<PanPrintLayoutProps> = ({
  options,
  onChangeOptions,
}) => {
  const update = (partial: Partial<PanPrintOptions>) => {
    onChangeOptions({ ...options, ...partial });
  };

  return (
    <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-5">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
        <LayoutGrid className="w-4 h-4 text-blue-400" />
        <h4 className="text-sm font-bold text-white uppercase tracking-wider">
          A4 Print Sheet Layout
        </h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Layout Orientation */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300">Card Placement</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => update({ layoutMode: 'side-by-side' })}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                options.layoutMode === 'side-by-side'
                  ? 'border-blue-500 bg-blue-500/10 text-white ring-1 ring-blue-500'
                  : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
              }`}
            >
              Side by Side
            </button>
            <button
              type="button"
              onClick={() => update({ layoutMode: 'stacked' })}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                options.layoutMode === 'stacked'
                  ? 'border-blue-500 bg-blue-500/10 text-white ring-1 ring-blue-500'
                  : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
              }`}
            >
              Stacked Vertical
            </button>
          </div>
        </div>

        {/* Spacing between front & back */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label className="font-bold text-slate-300">Front / Back Gap</label>
            <span className="text-slate-400 font-mono">{options.cardSpacingMm} mm</span>
          </div>
          <input
            type="range"
            min={0}
            max={10}
            step={0.5}
            value={options.cardSpacingMm}
            onChange={(e) => update({ cardSpacingMm: parseFloat(e.target.value) })}
            className="w-full accent-blue-500"
          />
        </div>
      </div>

      {/* Checkboxes */}
      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
        <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={options.showCuttingGuides}
            onChange={(e) => update({ showCuttingGuides: e.target.checked })}
            className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-0"
          />
          <Scissors className="w-3.5 h-3.5 text-purple-400" />
          <span>Corner Cutting Guides</span>
        </label>

        <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={options.showBorder}
            onChange={(e) => update({ showBorder: e.target.checked })}
            className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-0"
          />
          <Square className="w-3.5 h-3.5 text-blue-400" />
          <span>Outer Card Border</span>
        </label>
      </div>
    </div>
  );
};
