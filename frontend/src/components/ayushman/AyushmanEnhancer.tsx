import React from 'react';
import {
  Sun,
  Contrast,
  RotateCcw,
  Sliders,
} from 'lucide-react';
import {
  AyushmanCardItem,
  ImageAdjustments,
  DEFAULT_ADJUSTMENTS,
  extractAyushmanCardCanvas,
} from '../../utils/ayushmanProcessor';
import { Button } from '../common/Button';

export interface AyushmanEnhancerProps {
  cardItem: AyushmanCardItem;
  onChangeAdjustments: (adjustments: ImageAdjustments) => void;
}

export const AyushmanEnhancer: React.FC<AyushmanEnhancerProps> = ({
  cardItem,
  onChangeAdjustments,
}) => {
  const adjustments = cardItem.adjustments;

  const update = (partial: Partial<ImageAdjustments>) => {
    onChangeAdjustments({
      ...adjustments,
      ...partial,
    });
  };

  const handleReset = () => {
    onChangeAdjustments({ ...DEFAULT_ADJUSTMENTS });
  };

  const applyPreset = (preset: 'clear' | 'contrast') => {
    if (preset === 'clear') {
      onChangeAdjustments({ brightness: 5, contrast: 15, sharpness: 10 });
    } else {
      onChangeAdjustments({ brightness: -5, contrast: 30, sharpness: 15 });
    }
  };

  const frontEnhanced = extractAyushmanCardCanvas(
    cardItem.originalCanvas,
    cardItem.frontCrop,
    adjustments
  );

  const backEnhanced = extractAyushmanCardCanvas(
    cardItem.originalCanvas,
    cardItem.backCrop,
    adjustments
  );

  return (
    <div className="space-y-6">
      {/* Controls Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Ayushman Card Clarity & Contrast
              </h3>
              <p className="text-[11px] text-slate-400">
                Enhance text legibility and barcode readability for PVC card printing
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Reset
          </Button>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-400">Presets:</span>
          <button
            type="button"
            onClick={() => applyPreset('clear')}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition-all"
          >
            📄 Document Clear (+15% Contrast)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('contrast')}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition-all"
          >
            🖋️ Deep Text Black (+30% Contrast)
          </button>
        </div>

        {/* Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          {/* Brightness */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Brightness</span>
              </label>
              <span className="font-mono text-slate-400">{adjustments.brightness}%</span>
            </div>
            <input
              type="range"
              min="-60"
              max="60"
              step="1"
              value={adjustments.brightness}
              onChange={(e) => update({ brightness: parseInt(e.target.value) })}
              className="w-full accent-amber-400"
            />
          </div>

          {/* Contrast */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Contrast className="w-3.5 h-3.5 text-emerald-400" />
                <span>Contrast</span>
              </label>
              <span className="font-mono text-slate-400">{adjustments.contrast}%</span>
            </div>
            <input
              type="range"
              min="-60"
              max="60"
              step="1"
              value={adjustments.contrast}
              onChange={(e) => update({ contrast: parseInt(e.target.value) })}
              className="w-full accent-emerald-400"
            />
          </div>
        </div>
      </div>

      {/* Live Side-by-Side Enhanced Previews */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white">Enhanced Ayushman Front</span>
            <span className="text-[10px] font-mono text-emerald-400">85.6 × 54 mm</span>
          </div>
          <div className="rounded-xl overflow-hidden border border-slate-700 bg-white shadow-xl">
            <img
              src={frontEnhanced.toDataURL('image/jpeg', 0.95)}
              alt="Enhanced Front Card"
              className="w-full h-auto block"
            />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white">Enhanced Ayushman Back</span>
            <span className="text-[10px] font-mono text-cyan-400">85.6 × 54 mm</span>
          </div>
          <div className="rounded-xl overflow-hidden border border-slate-700 bg-white shadow-xl">
            <img
              src={backEnhanced.toDataURL('image/jpeg', 0.95)}
              alt="Enhanced Back Card"
              className="w-full h-auto block"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
