import React from 'react';
import {
  Sun,
  Contrast,
  Droplet,
  Sliders,
  Sparkles,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { ImageAdjustments } from '../../utils/passportProcessor';
import { Button } from '../common/Button';

export interface PhotoControlsProps {
  adjustments: ImageAdjustments;
  onChange: (adjustments: ImageAdjustments) => void;
  onReset: () => void;
}

export const PhotoControls: React.FC<PhotoControlsProps> = ({
  adjustments,
  onChange,
  onReset,
}) => {
  const updateField = (field: keyof ImageAdjustments, value: any) => {
    onChange({
      ...adjustments,
      [field]: value,
    });
  };

  // Quick Preset Profiles
  const applyPreset = (preset: 'default' | 'studio' | 'vibrant' | 'bw' | 'sharp') => {
    switch (preset) {
      case 'default':
        onChange({
          brightness: 0,
          contrast: 0,
          saturation: 0,
          sharpness: 0,
          grayscale: false,
        });
        break;
      case 'studio':
        onChange({
          brightness: 6,
          contrast: 12,
          saturation: 8,
          sharpness: 25,
          grayscale: false,
        });
        break;
      case 'vibrant':
        onChange({
          brightness: 4,
          contrast: 15,
          saturation: 25,
          sharpness: 15,
          grayscale: false,
        });
        break;
      case 'sharp':
        onChange({
          brightness: 2,
          contrast: 10,
          saturation: 0,
          sharpness: 45,
          grayscale: false,
        });
        break;
      case 'bw':
        onChange({
          brightness: 4,
          contrast: 18,
          saturation: 0,
          sharpness: 20,
          grayscale: true,
        });
        break;
    }
  };

  const isModified =
    adjustments.brightness !== 0 ||
    adjustments.contrast !== 0 ||
    adjustments.saturation !== 0 ||
    adjustments.sharpness !== 0 ||
    adjustments.grayscale;

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Image Enhancement</h3>
            <p className="text-[11px] text-slate-400">Fine-tune exposure, clarity and color depth</p>
          </div>
        </div>

        {isModified && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-xs text-slate-400 hover:text-slate-200"
            leftIcon={<RotateCcw className="w-3 h-3" />}
          >
            Reset
          </Button>
        )}
      </div>

      {/* Preset Quick Styles */}
      <div className="space-y-2">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Zap className="w-3 h-3 text-amber-400" />
          <span>Quick Enhancement Presets</span>
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <button
            type="button"
            onClick={() => applyPreset('default')}
            className={`p-2 rounded-xl text-xs font-semibold border transition-all text-center ${
              !isModified
                ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            Original
          </button>
          <button
            type="button"
            onClick={() => applyPreset('studio')}
            className="p-2 rounded-xl text-xs font-semibold border bg-slate-950/60 border-slate-800 text-slate-300 hover:border-blue-500/50 hover:text-blue-300 transition-all text-center"
          >
            Studio Crisp
          </button>
          <button
            type="button"
            onClick={() => applyPreset('vibrant')}
            className="p-2 rounded-xl text-xs font-semibold border bg-slate-950/60 border-slate-800 text-slate-300 hover:border-purple-500/50 hover:text-purple-300 transition-all text-center"
          >
            Vibrant
          </button>
          <button
            type="button"
            onClick={() => applyPreset('sharp')}
            className="p-2 rounded-xl text-xs font-semibold border bg-slate-950/60 border-slate-800 text-slate-300 hover:border-cyan-500/50 hover:text-cyan-300 transition-all text-center"
          >
            High Detail
          </button>
          <button
            type="button"
            onClick={() => applyPreset('bw')}
            className={`p-2 rounded-xl text-xs font-semibold border transition-all text-center ${
              adjustments.grayscale
                ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-purple-500/50 hover:text-purple-300'
            }`}
          >
            B & W
          </button>
        </div>
      </div>

      {/* Sliders Grid */}
      <div className="space-y-4">
        {/* Brightness Control */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Brightness</span>
            </span>
            <span className="font-mono text-slate-400 text-[11px]">
              {adjustments.brightness > 0 ? `+${adjustments.brightness}` : adjustments.brightness}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="-100"
              max="100"
              step="1"
              value={adjustments.brightness}
              onChange={(e) => updateField('brightness', parseInt(e.target.value))}
              className="flex-1 accent-blue-500 h-2 bg-slate-950 rounded-lg cursor-pointer border border-slate-800"
            />
            {adjustments.brightness !== 0 && (
              <button
                onClick={() => updateField('brightness', 0)}
                className="text-[10px] text-blue-400 hover:underline"
              >
                0
              </button>
            )}
          </div>
        </div>

        {/* Contrast Control */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <Contrast className="w-3.5 h-3.5 text-cyan-400" />
              <span>Contrast</span>
            </span>
            <span className="font-mono text-slate-400 text-[11px]">
              {adjustments.contrast > 0 ? `+${adjustments.contrast}` : adjustments.contrast}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="-100"
              max="100"
              step="1"
              value={adjustments.contrast}
              onChange={(e) => updateField('contrast', parseInt(e.target.value))}
              className="flex-1 accent-blue-500 h-2 bg-slate-950 rounded-lg cursor-pointer border border-slate-800"
            />
            {adjustments.contrast !== 0 && (
              <button
                onClick={() => updateField('contrast', 0)}
                className="text-[10px] text-blue-400 hover:underline"
              >
                0
              </button>
            )}
          </div>
        </div>

        {/* Saturation Control */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <Droplet className="w-3.5 h-3.5 text-purple-400" />
              <span>Saturation</span>
            </span>
            <span className="font-mono text-slate-400 text-[11px]">
              {adjustments.saturation > 0 ? `+${adjustments.saturation}` : adjustments.saturation}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="-100"
              max="100"
              step="1"
              disabled={adjustments.grayscale}
              value={adjustments.saturation}
              onChange={(e) => updateField('saturation', parseInt(e.target.value))}
              className="flex-1 accent-purple-500 h-2 bg-slate-950 rounded-lg cursor-pointer border border-slate-800 disabled:opacity-40"
            />
            {adjustments.saturation !== 0 && !adjustments.grayscale && (
              <button
                onClick={() => updateField('saturation', 0)}
                className="text-[10px] text-purple-400 hover:underline"
              >
                0
              </button>
            )}
          </div>
        </div>

        {/* Sharpness Control */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Clarity & Sharpness</span>
            </span>
            <span className="font-mono text-slate-400 text-[11px]">
              {adjustments.sharpness}%
            </span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={adjustments.sharpness}
              onChange={(e) => updateField('sharpness', parseInt(e.target.value))}
              className="flex-1 accent-emerald-500 h-2 bg-slate-950 rounded-lg cursor-pointer border border-slate-800"
            />
            {adjustments.sharpness !== 0 && (
              <button
                onClick={() => updateField('sharpness', 0)}
                className="text-[10px] text-emerald-400 hover:underline"
              >
                0
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
