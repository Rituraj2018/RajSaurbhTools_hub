import React from 'react';
import {
  Sun,
  Contrast,
  RotateCcw,
  Sliders,
} from 'lucide-react';
import {
  AadhaarDocItem,
  ImageAdjustments,
  DEFAULT_ADJUSTMENTS,
  extractCardCanvas,
} from '../../utils/aadhaarProcessor';
import { Button } from '../common/Button';

export interface AadhaarEnhancerProps {
  documentItem: AadhaarDocItem;
  onChangeAdjustments: (adjustments: ImageAdjustments) => void;
}

export const AadhaarEnhancer: React.FC<AadhaarEnhancerProps> = ({
  documentItem,
  onChangeAdjustments,
}) => {
  const adjustments = documentItem.adjustments;

  const update = (partial: Partial<ImageAdjustments>) => {
    onChangeAdjustments({
      ...adjustments,
      ...partial,
    });
  };

  const handleReset = () => {
    onChangeAdjustments({ ...DEFAULT_ADJUSTMENTS });
  };

  const applyPreset = (preset: 'clear' | 'contrast' | 'vibrant') => {
    switch (preset) {
      case 'clear':
        onChangeAdjustments({ brightness: 5, contrast: 15, sharpness: 10 });
        break;
      case 'contrast':
        onChangeAdjustments({ brightness: -5, contrast: 30, sharpness: 15 });
        break;
      case 'vibrant':
        onChangeAdjustments({ brightness: 10, contrast: 20, sharpness: 0 });
        break;
    }
  };

  const frontEnhanced = extractCardCanvas(
    documentItem.originalCanvas,
    documentItem.frontCrop,
    adjustments
  );

  const backEnhanced = extractCardCanvas(
    documentItem.originalCanvas,
    documentItem.backCrop,
    adjustments
  );

  return (
    <div className="space-y-6">
      {/* Enhancement Controls Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Document Clarity & Enhancement
              </h3>
              <p className="text-[11px] text-slate-400">
                Adjust brightness and contrast for ultra-sharp card printing
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

        {/* Quick Presets Toolbar */}
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

        {/* Sliders Grid */}
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
                <Contrast className="w-3.5 h-3.5 text-blue-400" />
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
              className="w-full accent-blue-400"
            />
          </div>
        </div>
      </div>

      {/* Live Side-by-Side Enhanced Cards Preview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white">Enhanced Front Card</span>
            <span className="text-[10px] font-mono text-blue-400">85.6 × 54 mm</span>
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
            <span className="text-xs font-bold text-white">Enhanced Back Card</span>
            <span className="text-[10px] font-mono text-purple-400">85.6 × 54 mm</span>
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
