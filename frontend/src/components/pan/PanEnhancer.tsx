import React from 'react';
import { Sliders, Sparkles, Sun, Contrast, Feather } from 'lucide-react';
import { PanImageAdjustments, DEFAULT_PAN_ADJUSTMENTS } from '../../utils/panProcessor';

interface PanEnhancerProps {
  adjustments: PanImageAdjustments;
  onChangeAdjustments: (adj: PanImageAdjustments) => void;
}

export const PanEnhancer: React.FC<PanEnhancerProps> = ({
  adjustments,
  onChangeAdjustments,
}) => {
  const update = (partial: Partial<PanImageAdjustments>) => {
    onChangeAdjustments({ ...adjustments, ...partial });
  };

  const handleReset = () => {
    onChangeAdjustments(DEFAULT_PAN_ADJUSTMENTS);
  };

  return (
    <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-blue-400" />
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">
            Card Enhancement & Ink Booster
          </h4>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
        >
          Reset Filters
        </button>
      </div>

      {/* Signature & Text Ink Darkening Toggle */}
      <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
            <Feather className="w-4 h-4" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-white">Signature & PAN Number Clarity</h5>
            <p className="text-[11px] text-slate-400 leading-tight">
              Boosts blue/black ink darkness for ultra-crisp signatures on PVC plastic cards.
            </p>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={adjustments.signatureBoost}
            onChange={(e) => update({ signatureBoost: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {/* Contrast & Brightness Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 flex items-center gap-1.5 font-semibold">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Brightness</span>
            </span>
            <span className="text-slate-400 font-mono">{adjustments.brightness}%</span>
          </div>
          <input
            type="range"
            min={-50}
            max={50}
            step={1}
            value={adjustments.brightness}
            onChange={(e) => update({ brightness: parseInt(e.target.value, 10) })}
            className="w-full accent-blue-500"
          />
        </div>

        <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 flex items-center gap-1.5 font-semibold">
              <Contrast className="w-3.5 h-3.5 text-purple-400" />
              <span>Contrast</span>
            </span>
            <span className="text-slate-400 font-mono">+{adjustments.contrast}%</span>
          </div>
          <input
            type="range"
            min={-30}
            max={60}
            step={1}
            value={adjustments.contrast}
            onChange={(e) => update({ contrast: parseInt(e.target.value, 10) })}
            className="w-full accent-blue-500"
          />
        </div>

        <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 flex items-center gap-1.5 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sharpen</span>
            </span>
            <span className="text-slate-400 font-mono">{adjustments.sharpness}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={adjustments.sharpness}
            onChange={(e) => update({ sharpness: parseInt(e.target.value, 10) })}
            className="w-full accent-blue-500"
          />
        </div>
      </div>
    </div>
  );
};
