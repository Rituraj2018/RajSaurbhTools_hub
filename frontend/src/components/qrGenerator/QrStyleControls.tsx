import React, { useRef } from 'react';
import { Palette, Image as ImageIcon, X } from 'lucide-react';
import { QrStylingOptions } from '../../utils/qrGeneratorProcessor';

interface QrStyleControlsProps {
  options: QrStylingOptions;
  onChange: (options: Partial<QrStylingOptions>) => void;
}

const COLOR_PRESETS = [
  { label: 'Classic Black', fg: '#000000', bg: '#ffffff' },
  { label: 'Royal Blue', fg: '#1d4ed8', bg: '#ffffff' },
  { label: 'Emerald Green', fg: '#047857', bg: '#ffffff' },
  { label: 'Violet Purple', fg: '#6d28d9', bg: '#ffffff' },
  { label: 'Crimson Red', fg: '#b91c1c', bg: '#ffffff' },
  { label: 'Dark Mode Slate', fg: '#ffffff', bg: '#0f172a' },
];

export const QrStyleControls: React.FC<QrStyleControlsProps> = ({ options, onChange }) => {
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        onChange({ centerLogo: reader.result as string, errorCorrectionLevel: 'H' });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
      <div className="flex items-center gap-2">
        <Palette className="w-4 h-4 text-blue-400" />
        <h4 className="text-sm font-bold text-white uppercase tracking-wider">
          Style & Customization
        </h4>
      </div>

      {/* Quick Color Presets */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-300">Color Presets</label>
        <div className="flex flex-wrap gap-2">
          {COLOR_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => onChange({ fgColor: preset.fg, bgColor: preset.bg })}
              className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-950/60 hover:border-slate-500 text-[11px] font-semibold text-slate-300 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <div
                className="w-3.5 h-3.5 rounded-full border border-slate-600 shadow-sm shrink-0"
                style={{ backgroundColor: preset.fg }}
              />
              <span>{preset.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Color Pickers */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300">Foreground Color</label>
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-xl px-2 py-1.5">
            <input
              type="color"
              value={options.fgColor}
              onChange={(e) => onChange({ fgColor: e.target.value })}
              className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
            />
            <input
              type="text"
              value={options.fgColor}
              onChange={(e) => onChange({ fgColor: e.target.value })}
              className="w-full bg-transparent text-xs text-white font-mono uppercase focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300">Background Color</label>
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-xl px-2 py-1.5">
            <input
              type="color"
              value={options.bgColor}
              onChange={(e) => onChange({ bgColor: e.target.value })}
              className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
            />
            <input
              type="text"
              value={options.bgColor}
              onChange={(e) => onChange({ bgColor: e.target.value })}
              className="w-full bg-transparent text-xs text-white font-mono uppercase focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Resolution & Margin */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label className="font-bold text-slate-300">Resolution</label>
            <span className="text-slate-400 font-mono">{options.size} × {options.size} px</span>
          </div>
          <input
            type="range"
            min={256}
            max={2048}
            step={128}
            value={options.size}
            onChange={(e) => onChange({ size: parseInt(e.target.value, 10) })}
            className="w-full accent-blue-500 cursor-pointer"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label className="font-bold text-slate-300">Quiet Zone (Margin)</label>
            <span className="text-slate-400 font-mono">{options.margin} blocks</span>
          </div>
          <input
            type="range"
            min={0}
            max={6}
            step={1}
            value={options.margin}
            onChange={(e) => onChange({ margin: parseInt(e.target.value, 10) })}
            className="w-full accent-blue-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Center Logo Upload */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
          <span>Center Logo / Brand Icon</span>
          <span className="text-[10px] text-purple-400 font-semibold">Auto-sets High Error Correction (30%)</span>
        </label>

        <input
          ref={logoInputRef}
          type="file"
          accept="image/png,image/jpeg,image/svg+xml,image/webp"
          className="hidden"
          onChange={handleLogoUpload}
        />

        {options.centerLogo ? (
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-700">
            <div className="flex items-center gap-3">
              <img
                src={options.centerLogo}
                alt="Center logo"
                className="w-9 h-9 rounded-lg object-contain bg-white p-1 border border-slate-600"
              />
              <div>
                <p className="text-xs font-bold text-white">Custom Logo Embedded</p>
                <p className="text-[10px] text-slate-400">Centered with high redundancy</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onChange({ centerLogo: null })}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => logoInputRef.current?.click()}
            className="w-full py-3 px-4 rounded-xl border border-dashed border-slate-700 bg-slate-950/60 hover:border-slate-500 text-xs font-semibold text-slate-400 hover:text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <ImageIcon className="w-4 h-4 text-purple-400" />
            <span>Upload Logo / Brand Icon (PNG or JPG)</span>
          </button>
        )}
      </div>
    </div>
  );
};
