import React from 'react';
import {
  Sliders,
  Link2,
  Link2Off,
  Maximize,
} from 'lucide-react';
import {
  CompressionMode,
  CompressionOptions,
  ImageInfo,
  OUTPUT_FORMATS,
  RESIZE_PRESETS,
  TARGET_SIZE_OPTIONS,
} from '../../utils/imageCompressorProcessor';

interface ImageCompressorControlsProps {
  imageInfo: ImageInfo;
  options: CompressionOptions;
  onChange: (options: CompressionOptions) => void;
  maintainAspectRatio: boolean;
  onToggleAspectRatio: () => void;
  customTargetSize: string;
  customTargetUnit: 'KB' | 'MB';
  onCustomTargetSizeChange: (value: string) => void;
  onCustomTargetUnitChange: (unit: 'KB' | 'MB') => void;
  activePreset: number;
  onPresetChange: (preset: number) => void;
}

export const ImageCompressorControls: React.FC<ImageCompressorControlsProps> = ({
  imageInfo,
  options,
  onChange,
  maintainAspectRatio,
  onToggleAspectRatio,
  customTargetSize,
  customTargetUnit,
  onCustomTargetSizeChange,
  onCustomTargetUnitChange,
  activePreset,
  onPresetChange,
}) => {
  const aspectRatio = imageInfo.width / imageInfo.height;

  // Helpers
  const updateOption = <K extends keyof CompressionOptions>(key: K, value: CompressionOptions[K]) => {
    onChange({ ...options, [key]: value });
  };

  const handleWidthChange = (val: string) => {
    const w = Math.max(1, parseInt(val, 10) || 1);
    if (maintainAspectRatio) {
      const h = Math.round(w / aspectRatio);
      onChange({ ...options, width: w, height: Math.max(1, h) });
    } else {
      updateOption('width', w);
    }
    onPresetChange(-1);
  };

  const handleHeightChange = (val: string) => {
    const h = Math.max(1, parseInt(val, 10) || 1);
    if (maintainAspectRatio) {
      const w = Math.round(h * aspectRatio);
      onChange({ ...options, width: Math.max(1, w), height: h });
    } else {
      updateOption('height', h);
    }
    onPresetChange(-1);
  };

  const handlePresetClick = (percent: number) => {
    if (percent === -1) {
      onPresetChange(-1);
      return;
    }
    const w = Math.round(imageInfo.width * (percent / 100));
    const h = Math.round(imageInfo.height * (percent / 100));
    onChange({ ...options, width: Math.max(1, w), height: Math.max(1, h) });
    onPresetChange(percent);
  };

  const handleTargetSizeSelect = (bytes: number | null) => {
    updateOption('targetSizeBytes', bytes);
  };

  const handleCustomTargetApply = () => {
    const val = parseFloat(customTargetSize);
    if (isNaN(val) || val <= 0) return;
    const bytes = customTargetUnit === 'MB' ? val * 1024 * 1024 : val * 1024;
    updateOption('targetSizeBytes', Math.round(bytes));
  };

  const isPng = options.outputFormat === 'image/png';

  // ---- Section Card ----
  const SectionCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({
    title,
    icon,
    children,
  }) => (
    <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-3">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
        {icon}
        <span>{title}</span>
      </div>
      {children}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* ---- Dimensions ---- */}
      <SectionCard
        title="Dimensions"
        icon={<Maximize className="w-3.5 h-3.5 text-blue-400" />}
      >
        {/* Resize Presets */}
        <div className="flex flex-wrap gap-1.5">
          {RESIZE_PRESETS.map((preset) => (
            <button
              key={preset.value}
              onClick={() => handlePresetClick(preset.value)}
              className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg border transition-all ${
                activePreset === preset.value
                  ? 'bg-blue-600/20 border-blue-500/40 text-blue-300'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Width / Height Inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400">Width (px)</label>
            <input
              id="image-compressor-width"
              type="number"
              min={1}
              value={options.width}
              onChange={(e) => handleWidthChange(e.target.value)}
              className="w-full bg-slate-950/80 text-slate-100 text-sm rounded-xl border border-slate-800 focus:border-blue-500/80 focus:ring-2 focus:ring-blue-500/20 focus:outline-none px-3 py-2 h-10 transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400">Height (px)</label>
            <input
              id="image-compressor-height"
              type="number"
              min={1}
              value={options.height}
              onChange={(e) => handleHeightChange(e.target.value)}
              className="w-full bg-slate-950/80 text-slate-100 text-sm rounded-xl border border-slate-800 focus:border-blue-500/80 focus:ring-2 focus:ring-blue-500/20 focus:outline-none px-3 py-2 h-10 transition-all"
            />
          </div>
        </div>

        {/* Aspect Ratio Toggle */}
        <button
          onClick={onToggleAspectRatio}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all w-full ${
            maintainAspectRatio
              ? 'bg-blue-600/10 border-blue-500/30 text-blue-300'
              : 'bg-slate-950/60 border-slate-800 text-slate-500 hover:text-slate-300'
          }`}
        >
          {maintainAspectRatio ? (
            <Link2 className="w-3.5 h-3.5" />
          ) : (
            <Link2Off className="w-3.5 h-3.5" />
          )}
          <span>Maintain Aspect Ratio</span>
          <span
            className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${
              maintainAspectRatio
                ? 'bg-blue-500/20 text-blue-300'
                : 'bg-slate-800 text-slate-500'
            }`}
          >
            {maintainAspectRatio ? 'ON' : 'OFF'}
          </span>
        </button>
      </SectionCard>

      {/* ---- Compression Mode ---- */}
      <SectionCard
        title="Compression Mode"
        icon={<Sliders className="w-3.5 h-3.5 text-purple-400" />}
      >
        <div className="grid grid-cols-2 gap-2">
          {(['lossy', 'lossless'] as CompressionMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => updateOption('mode', mode)}
              className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                options.mode === mode
                  ? 'bg-purple-600/15 border-purple-500/40 text-purple-300'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="capitalize">{mode}</div>
              <div className="text-[10px] font-normal mt-0.5 opacity-70">
                {mode === 'lossy' ? 'Smaller file, adjustable quality' : 'Preserve visual quality'}
              </div>
            </button>
          ))}
        </div>
      </SectionCard>

      {/* ---- Quality Slider ---- */}
      <SectionCard
        title="Quality"
        icon={<Sliders className="w-3.5 h-3.5 text-emerald-400" />}
      >
        {isPng ? (
          <p className="text-[11px] text-slate-500 italic">
            Quality control is not applicable for PNG (always lossless).
          </p>
        ) : options.mode === 'lossless' ? (
          <p className="text-[11px] text-slate-500 italic">
            Quality is set to maximum in lossless mode.
          </p>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Low</span>
              <span className="text-sm font-bold text-white font-mono">
                {Math.round(options.quality * 100)}%
              </span>
              <span className="text-[11px] text-slate-400">High</span>
            </div>
            <input
              id="image-compressor-quality"
              type="range"
              min={10}
              max={100}
              step={1}
              value={Math.round(options.quality * 100)}
              onChange={(e) => updateOption('quality', parseInt(e.target.value, 10) / 100)}
              className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-500
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:shadow-blue-500/40 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-300
                [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-blue-500 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-blue-300 [&::-moz-range-thumb]:cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-600 font-mono">
              <span>10%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        )}
      </SectionCard>

      {/* ---- Target File Size ---- */}
      <SectionCard
        title="Target File Size"
        icon={<Sliders className="w-3.5 h-3.5 text-amber-400" />}
      >
        {isPng ? (
          <p className="text-[11px] text-slate-500 italic">
            Target size is not available for PNG (lossless format — size depends on image content).
          </p>
        ) : (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5">
              {TARGET_SIZE_OPTIONS.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => handleTargetSizeSelect(opt.bytes)}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-all ${
                    options.targetSizeBytes === opt.bytes
                      ? 'bg-amber-600/15 border-amber-500/40 text-amber-300'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Custom Target Input */}
            <div className="flex items-center gap-2">
              <input
                id="image-compressor-custom-target"
                type="number"
                min={1}
                placeholder="Custom"
                value={customTargetSize}
                onChange={(e) => onCustomTargetSizeChange(e.target.value)}
                className="flex-1 bg-slate-950/80 text-slate-100 text-xs rounded-lg border border-slate-800 focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/20 focus:outline-none px-3 py-2 h-8 transition-all"
              />
              <select
                value={customTargetUnit}
                onChange={(e) => onCustomTargetUnitChange(e.target.value as 'KB' | 'MB')}
                className="bg-slate-950/80 text-slate-100 text-xs rounded-lg border border-slate-800 focus:outline-none px-2 py-2 h-8 cursor-pointer"
              >
                <option value="KB">KB</option>
                <option value="MB">MB</option>
              </select>
              <button
                onClick={handleCustomTargetApply}
                className="px-3 py-1.5 text-[11px] font-bold rounded-lg bg-amber-600/15 border border-amber-500/40 text-amber-300 hover:bg-amber-600/25 transition-all h-8"
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </SectionCard>

      {/* ---- Output Format ---- */}
      <SectionCard
        title="Output Format"
        icon={<Sliders className="w-3.5 h-3.5 text-cyan-400" />}
      >
        <div className="grid grid-cols-3 gap-2">
          {OUTPUT_FORMATS.map((fmt) => (
            <button
              key={fmt.value}
              onClick={() => updateOption('outputFormat', fmt.value)}
              className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                options.outputFormat === fmt.value
                  ? 'bg-cyan-600/15 border-cyan-500/40 text-cyan-300'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {fmt.label}
            </button>
          ))}
        </div>

        {/* TIFF / GIF note */}
        <p className="text-[10px] text-slate-600 leading-relaxed">
          TIFF output is not available — browsers do not natively support TIFF encoding. GIF output is limited to a single frame.
        </p>
      </SectionCard>
    </div>
  );
};
