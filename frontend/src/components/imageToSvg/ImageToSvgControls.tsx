import React, { useState } from 'react';
import {
  Sparkles,
  Sliders,
  ChevronDown,
  ChevronUp,
  Wand2,
  RefreshCw,
  ShieldCheck,
  FileBox,
  Scale,
  Zap,
  Check,
} from 'lucide-react';
import {
  SvgConverterSettings,
  ImageAnalysisResult,
  VectorizationMode,
  ColorMode,
  DetailLevel,
  BackgroundHandling,
  SvgOptimization,
  OutputSizePreset,
} from '../../utils/imageToSvgProcessor';
import { Button } from '../common/Button';

interface ImageToSvgControlsProps {
  settings: SvgConverterSettings;
  analysis: ImageAnalysisResult | null;
  onChange: (settings: SvgConverterSettings) => void;
  onReConvert: () => void;
  isConverting?: boolean;
}

const COLOR_COUNT_OPTIONS = [2, 4, 6, 8, 12, 16, 24, 32];
const CUSTOM_KB_PRESETS = [50, 100, 200, 500, 1024];

export const ImageToSvgControls: React.FC<ImageToSvgControlsProps> = ({
  settings,
  analysis,
  onChange,
  onReConvert,
  isConverting = false,
}) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const updateSetting = <K extends keyof SvgConverterSettings>(
    key: K,
    value: SvgConverterSettings[K]
  ) => {
    onChange({
      ...settings,
      [key]: value,
    });
  };

  const handleOutputPresetSelect = (preset: OutputSizePreset) => {
    if (preset === 'auto') {
      if (analysis) {
        onChange({
          ...settings,
          outputSizePreset: 'auto',
          autoOptimize: true,
          ...analysis.recommendedSettings,
        });
      } else {
        onChange({
          ...settings,
          outputSizePreset: 'auto',
          autoOptimize: true,
        });
      }
    } else {
      onChange({
        ...settings,
        outputSizePreset: preset,
        autoOptimize: false,
      });
    }
  };

  const handleCustomKbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      updateSetting('customTargetKb', Math.max(10, Math.min(5000, val)));
    }
  };

  return (
    <div className="space-y-4">
      {/* ── 1. SMART AUTO SETUP / STATUS CARD ── */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-950/40 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-blue-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Smart Auto Vectorization</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {settings.outputSizePreset === 'auto' ? 'Auto Mode Active' : 'Custom Config'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Automatically determines optimal color quantization, smooth Bézier curves & noise filters.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleOutputPresetSelect(settings.outputSizePreset === 'auto' ? 'balanced' : 'auto')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 self-start sm:self-auto ${
              settings.outputSizePreset === 'auto'
                ? 'bg-blue-600 hover:bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/20'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{settings.outputSizePreset === 'auto' ? 'Auto Optimize: ON' : 'Auto Optimize: OFF'}</span>
          </button>
        </div>

        {/* Detected Image Classification Chips */}
        {analysis && (
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                Detected Type
              </span>
              <span className="font-extrabold text-blue-400 flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5" />
                {analysis.classification}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                Background
              </span>
              <span className="font-semibold text-slate-300">
                {analysis.hasTransparency
                  ? 'Transparent'
                  : analysis.isLikelySignature
                  ? 'White Canvas'
                  : 'Solid Color'}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                Edge Complexity
              </span>
              <span className="font-semibold text-slate-300">
                {analysis.edgeComplexity < 30
                  ? 'Low (Clean Edges)'
                  : analysis.edgeComplexity < 60
                  ? 'Medium (Moderate)'
                  : 'High (Complex Details)'}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                Dominant Colors
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                {analysis.dominantColors.slice(0, 5).map((color, i) => (
                  <span
                    key={i}
                    className="w-3.5 h-3.5 rounded-full border border-slate-700 shadow-sm"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
                {analysis.dominantColors.length > 5 && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    +{analysis.dominantColors.length - 5}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── 2. OUTPUT SIZE CONTROL SECTION ── */}
      <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Output Size Control</h3>
              <p className="text-[11px] text-slate-400">
                Choose optimization target or specify a custom target file size in KB.
              </p>
            </div>
          </div>
        </div>

        {/* Preset Selector Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          <button
            type="button"
            onClick={() => handleOutputPresetSelect('auto')}
            className={`p-3 rounded-2xl border text-left transition-all relative ${
              settings.outputSizePreset === 'auto'
                ? 'bg-blue-600/15 border-blue-500 text-white shadow-md shadow-blue-500/10'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Auto Optimize
              </span>
              {settings.outputSizePreset === 'auto' && <Check className="w-3.5 h-3.5 text-blue-400" />}
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Best balance for logos & icons
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleOutputPresetSelect('small')}
            className={`p-3 rounded-2xl border text-left transition-all relative ${
              settings.outputSizePreset === 'small'
                ? 'bg-blue-600/15 border-blue-500 text-white shadow-md shadow-blue-500/10'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold flex items-center gap-1">
                <Zap className="w-3 h-3 text-emerald-400" />
                Small File
              </span>
              {settings.outputSizePreset === 'small' && <Check className="w-3.5 h-3.5 text-blue-400" />}
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Max compression & compact size
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleOutputPresetSelect('balanced')}
            className={`p-3 rounded-2xl border text-left transition-all relative ${
              settings.outputSizePreset === 'balanced'
                ? 'bg-blue-600/15 border-blue-500 text-white shadow-md shadow-blue-500/10'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold flex items-center gap-1">
                <Scale className="w-3 h-3 text-blue-400" />
                Balanced
              </span>
              {settings.outputSizePreset === 'balanced' && <Check className="w-3.5 h-3.5 text-blue-400" />}
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Balanced quality and size
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleOutputPresetSelect('high')}
            className={`p-3 rounded-2xl border text-left transition-all relative ${
              settings.outputSizePreset === 'high'
                ? 'bg-blue-600/15 border-blue-500 text-white shadow-md shadow-blue-500/10'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold flex items-center gap-1">
                <FileBox className="w-3 h-3 text-purple-400" />
                High Quality
              </span>
              {settings.outputSizePreset === 'high' && <Check className="w-3.5 h-3.5 text-blue-400" />}
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Higher detail & fine curves
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleOutputPresetSelect('custom')}
            className={`p-3 rounded-2xl border text-left transition-all relative ${
              settings.outputSizePreset === 'custom'
                ? 'bg-blue-600/15 border-blue-500 text-white shadow-md shadow-blue-500/10'
                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold flex items-center gap-1">
                <Sliders className="w-3 h-3 text-amber-400" />
                Custom Size
              </span>
              {settings.outputSizePreset === 'custom' && <Check className="w-3.5 h-3.5 text-blue-400" />}
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Target specific KB limit
            </p>
          </button>
        </div>

        {/* Custom Target Size Controls */}
        {settings.outputSizePreset === 'custom' && (
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 space-y-3 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label className="text-xs font-bold text-white block">
                  Target Size (KB)
                </label>
                <span className="text-[11px] text-slate-400">
                  Specify approximate SVG target output size (10 KB - 5000 KB).
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <input
                    type="number"
                    min="10"
                    max="5000"
                    step="10"
                    value={settings.customTargetKb}
                    onChange={handleCustomKbChange}
                    className="w-28 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-emerald-400 text-right pr-8 focus:outline-none focus:border-blue-500"
                  />
                  <span className="absolute right-2.5 top-1.5 text-xs text-slate-400 font-bold">
                    KB
                  </span>
                </div>
              </div>
            </div>

            {/* Quick KB Preset Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80">
              <span className="text-[11px] font-semibold text-slate-400">Quick Targets:</span>
              {CUSTOM_KB_PRESETS.map((kb) => (
                <button
                  key={kb}
                  type="button"
                  onClick={() => updateSetting('customTargetKb', kb)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-all ${
                    settings.customTargetKb === kb
                      ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {kb} KB
                </button>
              ))}
            </div>

            {/* Honest Disclaimer */}
            <p className="text-[11px] text-slate-400 italic pt-1">
              Target size is approximate. Actual SVG size depends on image complexity and vector detail.
            </p>
          </div>
        )}
      </div>

      {/* ── 3. EXPANDABLE ADVANCED SETTINGS ACCORDION ── */}
      <div className="rounded-3xl bg-slate-900/60 border border-slate-800 shadow-lg overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
          className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors focus:outline-none"
        >
          <div className="flex items-center gap-2.5">
            <Sliders className="w-4 h-4 text-blue-400" />
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white">
                Advanced Settings & Fine-Tuning
              </h4>
              <p className="text-[11px] text-slate-400">
                Custom vectorization mode, color palette limits, Bézier smoothing & noise thresholds.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
            <span>{isAdvancedOpen ? 'Collapse' : 'Expand Settings'}</span>
            {isAdvancedOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {isAdvancedOpen && (
          <div className="p-5 sm:p-6 border-t border-slate-800/80 space-y-6 animate-fadeIn">
            {/* Logo Quality Mode Quick Toggle */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <div>
                  <h4 className="text-xs font-bold text-white">Logo Quality Optimization</h4>
                  <p className="text-[11px] text-slate-400">
                    Prioritizes ultra-smooth contours, controlled color palette & clean background transparency.
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.logoQualityMode}
                  onChange={(e) => updateSetting('logoQualityMode', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Vectorization Mode */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Vectorization Mode</label>
                <select
                  value={settings.vectorMode}
                  onChange={(e) => {
                    updateSetting('autoOptimize', false);
                    updateSetting('vectorMode', e.target.value as VectorizationMode);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Auto">Auto (Smart Detect)</option>
                  <option value="Logo">Logo / Brand Mark</option>
                  <option value="Icon">Icon & Flat Glyph</option>
                  <option value="Illustration">Illustration</option>
                  <option value="Signature">Signature & Line Art</option>
                  <option value="Black & White">Black & White</option>
                  <option value="Custom">Custom Parameters</option>
                </select>
              </div>

              {/* Color Mode */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Color Mode</label>
                <select
                  value={settings.colorMode}
                  onChange={(e) => {
                    updateSetting('autoOptimize', false);
                    updateSetting('colorMode', e.target.value as ColorMode);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Auto">Auto Color</option>
                  <option value="Full Color">Full Color (Multi-layer)</option>
                  <option value="Limited Colors">Limited Colors</option>
                  <option value="Grayscale">Grayscale</option>
                  <option value="Black & White">Black & White (Monochrome)</option>
                </select>
              </div>

              {/* Color Count */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">Color Palette Limit</label>
                  <span className="text-[11px] font-mono text-blue-400 font-bold">
                    {settings.colorCount} Colors
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {COLOR_COUNT_OPTIONS.map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => {
                        updateSetting('autoOptimize', false);
                        updateSetting('colorCount', count);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                        settings.colorCount === count
                          ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>

              {/* Detail Level */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Detail Level</label>
                <select
                  value={settings.detailLevel}
                  onChange={(e) => {
                    updateSetting('autoOptimize', false);
                    updateSetting('detailLevel', e.target.value as DetailLevel);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Auto">Auto</option>
                  <option value="Low">Low (Faster, Compact SVG)</option>
                  <option value="Medium">Medium (Balanced)</option>
                  <option value="High">High (Fine Details)</option>
                  <option value="Ultra">Ultra (High Resolution)</option>
                </select>
              </div>

              {/* Background Handling */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Background Strategy</label>
                <select
                  value={settings.background}
                  onChange={(e) => {
                    updateSetting('autoOptimize', false);
                    updateSetting('background', e.target.value as BackgroundHandling);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Auto">Auto (Smart Detection)</option>
                  <option value="Preserve">Preserve Background</option>
                  <option value="Transparent">Make Transparent</option>
                  <option value="Remove White">Remove White Background</option>
                </select>
              </div>

              {/* SVG Optimization */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">SVG Output Optimization</label>
                <select
                  value={settings.svgOptimization}
                  onChange={(e) => {
                    updateSetting('autoOptimize', false);
                    updateSetting('svgOptimization', e.target.value as SvgOptimization);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Auto">Auto</option>
                  <option value="Standard">Standard SVG</option>
                  <option value="Maximum Optimization">Maximum Optimization (Minified)</option>
                </select>
              </div>
            </div>

            {/* Precision Range Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-4 border-t border-slate-800/80">
              {/* Edge Smoothing */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300">Edge Smoothing</span>
                  <span className="font-mono text-purple-400 font-bold">{settings.edgeSmoothing} / 10</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={settings.edgeSmoothing}
                  onChange={(e) => {
                    updateSetting('autoOptimize', false);
                    updateSetting('edgeSmoothing', Number(e.target.value));
                  }}
                  className="w-full accent-purple-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Sharp</span>
                  <span>Smooth Curves</span>
                </div>
              </div>

              {/* Noise Removal */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300">Noise Removal (Despeckle)</span>
                  <span className="font-mono text-blue-400 font-bold">{settings.noiseRemoval} / 10</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={settings.noiseRemoval}
                  onChange={(e) => {
                    updateSetting('autoOptimize', false);
                    updateSetting('noiseRemoval', Number(e.target.value));
                  }}
                  className="w-full accent-blue-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Keep Details</span>
                  <span>High Despeckle</span>
                </div>
              </div>

              {/* Path Simplification */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300">Path Simplification</span>
                  <span className="font-mono text-emerald-400 font-bold">{settings.pathSimplification} / 10</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={settings.pathSimplification}
                  onChange={(e) => {
                    updateSetting('autoOptimize', false);
                    updateSetting('pathSimplification', Number(e.target.value));
                  }}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>High Fidelity</span>
                  <span>Simplified Paths</span>
                </div>
              </div>
            </div>

            {/* Re-convert CTA */}
            <div className="flex justify-end pt-2">
              <Button
                variant="gradient"
                size="sm"
                onClick={onReConvert}
                disabled={isConverting}
                leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isConverting ? 'animate-spin' : ''}`} />}
              >
                {isConverting ? 'Re-Vectorizing...' : 'Apply & Re-Vectorize'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
