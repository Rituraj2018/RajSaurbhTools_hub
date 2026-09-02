import React from 'react';
import {
  FileSpreadsheet,
  Compass,
  Square,
  Maximize,
  Sliders,
  FileType,
} from 'lucide-react';
import {
  PdfSettings,
} from '../../utils/imageToPdfProcessor';

export interface ImageToPdfSettingsProps {
  settings: PdfSettings;
  onChange: (settings: PdfSettings) => void;
}

export const ImageToPdfSettings: React.FC<ImageToPdfSettingsProps> = ({
  settings,
  onChange,
}) => {
  const update = (partial: Partial<PdfSettings>) => {
    onChange({
      ...settings,
      ...partial,
    });
  };

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">PDF Document Settings</h3>
            <p className="text-[11px] text-slate-400">
              Customize page format, orientation, margins, and scaling
            </p>
          </div>
        </div>
      </div>

      {/* 1. Page Size Selector (A4, Letter, Custom) */}
      <div className="space-y-2">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
          <span>Page Size</span>
        </label>

        <div className="grid grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => update({ pageSize: 'A4' })}
            className={`p-3 rounded-2xl border text-left transition-all ${
              settings.pageSize === 'A4'
                ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500'
                : 'border-slate-800/80 bg-slate-950/60 hover:bg-slate-950 hover:border-slate-700'
            }`}
          >
            <p className="text-xs font-bold text-white">A4</p>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">210 × 297 mm</p>
          </button>

          <button
            type="button"
            onClick={() => update({ pageSize: 'Letter' })}
            className={`p-3 rounded-2xl border text-left transition-all ${
              settings.pageSize === 'Letter'
                ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500'
                : 'border-slate-800/80 bg-slate-950/60 hover:bg-slate-950 hover:border-slate-700'
            }`}
          >
            <p className="text-xs font-bold text-white">US Letter</p>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">216 × 279 mm</p>
          </button>

          <button
            type="button"
            onClick={() => update({ pageSize: 'Custom' })}
            className={`p-3 rounded-2xl border text-left transition-all ${
              settings.pageSize === 'Custom'
                ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500'
                : 'border-slate-800/80 bg-slate-950/60 hover:bg-slate-950 hover:border-slate-700'
            }`}
          >
            <p className="text-xs font-bold text-white">Custom</p>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">Set mm dimensions</p>
          </button>
        </div>

        {/* Custom Dimensions Inputs */}
        {settings.pageSize === 'Custom' && (
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 grid grid-cols-2 gap-3 animate-fadeIn mt-2">
            <div>
              <label className="text-[10px] font-medium text-slate-400">Width (mm)</label>
              <input
                type="number"
                min="30"
                max="1000"
                value={settings.customWidthMm}
                onChange={(e) => update({ customWidthMm: Math.max(20, parseInt(e.target.value) || 210) })}
                className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-medium text-slate-400">Height (mm)</label>
              <input
                type="number"
                min="30"
                max="1000"
                value={settings.customHeightMm}
                onChange={(e) => update({ customHeightMm: Math.max(20, parseInt(e.target.value) || 297) })}
                className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:border-blue-500 outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. Orientation Selector (Portrait, Landscape, Auto) */}
      <div className="space-y-2">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-purple-400" />
          <span>Page Orientation</span>
        </label>

        <div className="grid grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => update({ orientation: 'portrait' })}
            className={`p-3 rounded-2xl border text-center transition-all ${
              settings.orientation === 'portrait'
                ? 'border-purple-500 bg-purple-500/10 text-white shadow-lg shadow-purple-500/10 ring-1 ring-purple-500'
                : 'border-slate-800/80 bg-slate-950/60 text-slate-300 hover:border-slate-700'
            }`}
          >
            <p className="text-xs font-bold">Portrait</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Vertical</p>
          </button>

          <button
            type="button"
            onClick={() => update({ orientation: 'landscape' })}
            className={`p-3 rounded-2xl border text-center transition-all ${
              settings.orientation === 'landscape'
                ? 'border-purple-500 bg-purple-500/10 text-white shadow-lg shadow-purple-500/10 ring-1 ring-purple-500'
                : 'border-slate-800/80 bg-slate-950/60 text-slate-300 hover:border-slate-700'
            }`}
          >
            <p className="text-xs font-bold">Landscape</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Horizontal</p>
          </button>

          <button
            type="button"
            onClick={() => update({ orientation: 'auto' })}
            className={`p-3 rounded-2xl border text-center transition-all ${
              settings.orientation === 'auto'
                ? 'border-purple-500 bg-purple-500/10 text-white shadow-lg shadow-purple-500/10 ring-1 ring-purple-500'
                : 'border-slate-800/80 bg-slate-950/60 text-slate-300 hover:border-slate-700'
            }`}
          >
            <p className="text-xs font-bold">Auto Match</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Per Image</p>
          </button>
        </div>
      </div>

      {/* 3. Margins Selector (None, Small, Standard, Large, Custom) */}
      <div className="space-y-2">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Square className="w-3.5 h-3.5 text-emerald-400" />
          <span>Page Margins</span>
        </label>

        <div className="grid grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => update({ margin: 'none' })}
            className={`py-2 px-2 rounded-xl border text-center text-xs font-semibold transition-all ${
              settings.margin === 'none'
                ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            None (0mm)
          </button>

          <button
            type="button"
            onClick={() => update({ margin: 'small' })}
            className={`py-2 px-2 rounded-xl border text-center text-xs font-semibold transition-all ${
              settings.margin === 'small'
                ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            Small (5mm)
          </button>

          <button
            type="button"
            onClick={() => update({ margin: 'standard' })}
            className={`py-2 px-2 rounded-xl border text-center text-xs font-semibold transition-all ${
              settings.margin === 'standard'
                ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            Standard (12mm)
          </button>

          <button
            type="button"
            onClick={() => update({ margin: 'large' })}
            className={`py-2 px-2 rounded-xl border text-center text-xs font-semibold transition-all ${
              settings.margin === 'large'
                ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            Large (20mm)
          </button>
        </div>
      </div>

      {/* 4. Image Scaling & Fit Mode */}
      <div className="space-y-2">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Maximize className="w-3.5 h-3.5 text-cyan-400" />
          <span>Image Placement & Fit</span>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => update({ imageFit: 'contain' })}
            className={`p-3 rounded-2xl border text-left transition-all ${
              settings.imageFit === 'contain'
                ? 'border-cyan-500 bg-cyan-500/10 text-white ring-1 ring-cyan-500'
                : 'border-slate-800/80 bg-slate-950/60 text-slate-300 hover:border-slate-700'
            }`}
          >
            <p className="text-xs font-bold">Fit to Page (Proportional)</p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Preserve original aspect ratio with no cropping
            </p>
          </button>

          <button
            type="button"
            onClick={() => update({ imageFit: 'cover' })}
            className={`p-3 rounded-2xl border text-left transition-all ${
              settings.imageFit === 'cover'
                ? 'border-cyan-500 bg-cyan-500/10 text-white ring-1 ring-cyan-500'
                : 'border-slate-800/80 bg-slate-950/60 text-slate-300 hover:border-slate-700'
            }`}
          >
            <p className="text-xs font-bold">Fill Page (Full Bleed)</p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Expand to fill page boundary
            </p>
          </button>
        </div>
      </div>

      {/* 5. Document Filename Input */}
      <div className="space-y-1.5 pt-1">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <FileType className="w-3.5 h-3.5 text-blue-400" />
          <span>Output PDF Filename</span>
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={settings.filename}
            onChange={(e) => update({ filename: e.target.value })}
            placeholder="Converted_Document"
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-blue-500 outline-none"
          />
          <span className="text-xs font-mono text-slate-500">.pdf</span>
        </div>
      </div>
    </div>
  );
};
