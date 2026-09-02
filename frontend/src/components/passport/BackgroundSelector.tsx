import React from 'react';
import {
  Palette,
  Check,
  SlidersHorizontal,
  Info,
} from 'lucide-react';
import {
  BackgroundSettings,
  BackgroundPreset,
} from '../../utils/passportProcessor';

export interface BackgroundSelectorProps {
  settings: BackgroundSettings;
  onChange: (settings: BackgroundSettings) => void;
}

export const BackgroundSelector: React.FC<BackgroundSelectorProps> = ({
  settings,
  onChange,
}) => {
  const handleSelectPreset = (mode: BackgroundPreset) => {
    onChange({
      ...settings,
      mode,
    });
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...settings,
      mode: 'custom',
      customColor: e.target.value,
    });
  };

  const handleToleranceChange = (tolerance: number) => {
    onChange({
      ...settings,
      tolerance,
    });
  };

  const presets: { id: BackgroundPreset; label: string; color: string; desc: string }[] = [
    {
      id: 'original',
      label: 'Original',
      color: 'linear-gradient(45deg, #475569, #1E293B)',
      desc: 'Keep raw photo backdrop',
    },
    {
      id: 'white',
      label: 'White',
      color: '#FFFFFF',
      desc: 'Standard for India, US, Visa',
    },
    {
      id: 'light-blue',
      label: 'Light Blue',
      color: '#BCE0FD',
      desc: 'Common Visa & ID standard',
    },
    {
      id: 'dark-blue',
      label: 'Dark Blue',
      color: '#163E75',
      desc: 'Diplomatic & National ID',
    },
    {
      id: 'light-grey',
      label: 'Light Grey',
      color: '#E5E7EB',
      desc: 'UK & Schengen standard',
    },
    {
      id: 'red',
      label: 'Red',
      color: '#DC2626',
      desc: 'Official Asian ID standard',
    },
  ];

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Palette className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Background Color</h3>
            <p className="text-[11px] text-slate-400">
              Select standard backdrop color for official requirements
            </p>
          </div>
        </div>

        <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
          Browser Engine
        </span>
      </div>

      {/* Preset Swatches Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {presets.map((p) => {
          const isSelected = settings.mode === p.id;
          const isWhiteOrLight = p.id === 'white' || p.id === 'light-grey' || p.id === 'light-blue';

          return (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelectPreset(p.id)}
              className={`relative p-3 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between overflow-hidden group ${
                isSelected
                  ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500'
                  : 'border-slate-800/80 bg-slate-950/60 hover:bg-slate-950 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                {/* Color Swatch Pill */}
                <div
                  className="w-7 h-7 rounded-xl border border-slate-700 shadow-inner flex items-center justify-center shrink-0"
                  style={{
                    background: p.color,
                  }}
                >
                  {isSelected && (
                    <Check
                      className={`w-3.5 h-3.5 ${
                        isWhiteOrLight ? 'text-slate-900' : 'text-white'
                      }`}
                    />
                  )}
                </div>

                {isSelected && (
                  <span className="text-[10px] font-bold text-blue-400">Selected</span>
                )}
              </div>

              <div>
                <p className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">
                  {p.label}
                </p>
                <p className="text-[10px] text-slate-400 leading-tight line-clamp-1 mt-0.5">
                  {p.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom Color Option & Threshold Keying */}
      {settings.mode !== 'original' && (
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-4 animate-fadeIn">
          {/* Custom Color Hex Picker */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
            <span className="text-xs font-semibold text-slate-300">Custom Color Hex Picker</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.customColor || '#FFFFFF'}
                onChange={handleCustomColorChange}
                className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
              />
              <span className="text-xs font-mono text-slate-400">
                {settings.mode === 'custom' ? settings.customColor : 'Click to pick'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
              <span>Background Edge Sensitivity</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {settings.tolerance || 35}%
            </span>
          </div>

          <input
            type="range"
            min="10"
            max="75"
            step="1"
            value={settings.tolerance || 35}
            onChange={(e) => handleToleranceChange(parseInt(e.target.value))}
            className="w-full accent-blue-500 h-2 bg-slate-900 rounded-lg cursor-pointer border border-slate-800"
          />

          <div className="flex items-center justify-between text-[10px] text-slate-500">
            <span>Stricter Edge</span>
            <span>Balanced</span>
            <span>Broader Coverage</span>
          </div>
        </div>
      )}

      {/* Compliance Information Note */}
      <div className="flex items-start gap-2 text-[11px] text-slate-400 bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
        <Info className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
        <span>
          <strong>Passport Standards:</strong> Most international embassies require a clean{' '}
          <strong>White</strong> or <strong>Light Grey</strong> background with no shadows or patterns.
        </span>
      </div>
    </div>
  );
};
