import React from 'react';
import {
  RotateCcw, RotateCw, FlipHorizontal, FlipVertical,
  ZoomIn, ZoomOut, Maximize2,
  AlignCenter, AlignStartVertical, AlignEndVertical, AlignLeft, AlignRight,
  Circle, SquareDashedBottom, Square, Download, Undo2, Redo2, RefreshCw,
} from 'lucide-react';
import { Button } from '../common/Button';
import {
  CropState, ASPECT_RATIO_PRESETS, PRESET_SIZES,
  AspectRatioId, PresetSizeId,
} from '../../utils/imageCropperProcessor';

interface Props {
  cropState: CropState;
  onChange: (partial: Partial<CropState>) => void;
  onRotateLeft:  () => void;
  onRotateRight: () => void;
  onRotate180:   () => void;
  onFlipH:       () => void;
  onFlipV:       () => void;
  onZoomIn:      () => void;
  onZoomOut:     () => void;
  onZoomReset:   () => void;
  onPosition:    (pos: 'center' | 'top' | 'bottom' | 'left' | 'right') => void;
  onUndo:    () => void;
  onRedo:    () => void;
  onReset:   () => void;
  onDownload: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isDownloading: boolean;
}

/* ─── Section wrapper ─── */
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-2">
    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{title}</p>
    {children}
  </div>
);

/* ─── Icon button helper ─── */
const IconBtn: React.FC<{
  id: string; title: string; onClick: () => void;
  active?: boolean; children: React.ReactNode;
}> = ({ id, title, onClick, active, children }) => (
  <button
    id={id}
    type="button"
    title={title}
    aria-label={title}
    onClick={onClick}
    className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-950 ${
      active
        ? 'bg-blue-600 text-white shadow shadow-blue-500/30'
        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
    }`}
  >
    {children}
  </button>
);

export const ImageCropperControls: React.FC<Props> = ({
  cropState, onChange,
  onRotateLeft, onRotateRight, onRotate180,
  onFlipH, onFlipV,
  onZoomIn, onZoomOut, onZoomReset,
  onPosition,
  onUndo, onRedo, onReset, onDownload,
  canUndo, canRedo, isDownloading,
}) => {
  const { aspectRatioId, presetSizeId, circleCrop, cornerRadius,
          paddingEnabled, paddingSize, paddingColor,
          outputFormat, outputQuality, zoom,
          customWidth, customHeight } = cropState;

  const handleAspectRatio = (id: AspectRatioId) => {
    onChange({ aspectRatioId: id, circleCrop: false });
  };

  const handlePreset = (id: PresetSizeId) => {
    const preset = PRESET_SIZES.find(p => p.id === id);
    if (!preset) return;
    onChange({ presetSizeId: id, circleCrop: false });
  };

  const qualityLabel = (q: number) => {
    if (q >= 0.9) return 'High';
    if (q >= 0.7) return 'Medium';
    return 'Low';
  };

  return (
    <div className="flex flex-col gap-5 overflow-y-auto pr-1" style={{ maxHeight: '75vh' }}>

      {/* ── Aspect Ratio ── */}
      <Section title="Aspect Ratio">
        <div className="flex flex-wrap gap-1.5">
          {ASPECT_RATIO_PRESETS.map(p => (
            <button
              key={p.id}
              id={`ic-ratio-${p.id}`}
              type="button"
              title={`Set aspect ratio to ${p.label}`}
              onClick={() => handleAspectRatio(p.id)}
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                aspectRatioId === p.id && !circleCrop
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </Section>

      {/* ── Preset Sizes ── */}
      <Section title="Preset Sizes">
        <select
          id="ic-preset-select"
          value={presetSizeId}
          onChange={e => handlePreset(e.target.value as PresetSizeId)}
          aria-label="Select a preset size"
          className="w-full rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-200 text-xs py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        >
          {PRESET_SIZES.map(p => (
            <option key={p.id} value={p.id}>{p.label} — {p.description}</option>
          ))}
        </select>
      </Section>

      {/* ── Custom Dimensions ── */}
      <Section title="Custom Width × Height (px)">
        <div className="flex gap-2">
          <div className="flex-1">
            <label htmlFor="ic-custom-w" className="text-[10px] text-slate-500 block mb-1">Width</label>
            <input
              id="ic-custom-w"
              type="number"
              min="1"
              max="8000"
              value={customWidth || ''}
              placeholder="e.g. 1080"
              onChange={e => {
                const v = parseInt(e.target.value, 10);
                onChange({ customWidth: isNaN(v) || v < 1 ? 0 : v });
              }}
              className="w-full rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-200 text-xs py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="ic-custom-h" className="text-[10px] text-slate-500 block mb-1">Height</label>
            <input
              id="ic-custom-h"
              type="number"
              min="1"
              max="8000"
              value={customHeight || ''}
              placeholder="e.g. 1080"
              onChange={e => {
                const v = parseInt(e.target.value, 10);
                onChange({ customHeight: isNaN(v) || v < 1 ? 0 : v });
              }}
              className="w-full rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-200 text-xs py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        {customWidth > 0 && customHeight > 0 && (
          <p className="text-[10px] text-slate-500 mt-1">
            Output will be scaled to {customWidth} × {customHeight} px
          </p>
        )}
      </Section>

      {/* ── Rotate ── */}
      <Section title="Rotate">
        <div className="flex gap-1.5">
          <IconBtn id="ic-rotate-left"  title="Rotate 90° left"  onClick={onRotateLeft}>
            <RotateCcw className="w-4 h-4" />
          </IconBtn>
          <IconBtn id="ic-rotate-right" title="Rotate 90° right" onClick={onRotateRight}>
            <RotateCw className="w-4 h-4" />
          </IconBtn>
          <button
            id="ic-rotate-180"
            type="button"
            title="Rotate 180°"
            onClick={onRotate180}
            aria-label="Rotate 180 degrees"
            className="px-3 h-9 rounded-xl bg-slate-800/80 text-slate-300 text-xs font-semibold hover:bg-slate-700 hover:text-white border border-slate-700/60 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            180°
          </button>
        </div>
      </Section>

      {/* ── Flip ── */}
      <Section title="Flip">
        <div className="flex gap-1.5">
          <IconBtn id="ic-flip-h" title="Flip horizontal" onClick={onFlipH} active={cropState.flipH}>
            <FlipHorizontal className="w-4 h-4" />
          </IconBtn>
          <IconBtn id="ic-flip-v" title="Flip vertical" onClick={onFlipV} active={cropState.flipV}>
            <FlipVertical className="w-4 h-4" />
          </IconBtn>
        </div>
      </Section>

      {/* ── Zoom ── */}
      <Section title={`Zoom — ${Math.round(zoom * 100)}%`}>
        <input
          id="ic-zoom-slider"
          type="range"
          min="0.5"
          max="3"
          step="0.1"
          value={zoom}
          aria-label={`Zoom level: ${Math.round(zoom * 100)}%`}
          onChange={e => onChange({ zoom: parseFloat(e.target.value) })}
          className="w-full accent-blue-500"
        />
        <div className="flex gap-1.5">
          <IconBtn id="ic-zoom-out"   title="Zoom out"   onClick={onZoomOut}><ZoomOut  className="w-4 h-4" /></IconBtn>
          <IconBtn id="ic-zoom-in"    title="Zoom in"    onClick={onZoomIn}> <ZoomIn   className="w-4 h-4" /></IconBtn>
          <IconBtn id="ic-zoom-reset" title="Reset zoom" onClick={onZoomReset}><Maximize2 className="w-4 h-4" /></IconBtn>
        </div>
      </Section>

      {/* ── Position ── */}
      <Section title="Crop Position">
        <div className="flex flex-wrap gap-1.5">
          {([
            ['center', 'Center',  <AlignCenter className="w-3.5 h-3.5" />],
            ['top',    'Top',     <AlignStartVertical className="w-3.5 h-3.5" />],
            ['bottom', 'Bottom',  <AlignEndVertical className="w-3.5 h-3.5" />],
            ['left',   'Left',    <AlignLeft className="w-3.5 h-3.5" />],
            ['right',  'Right',   <AlignRight className="w-3.5 h-3.5" />],
          ] as [string, string, React.ReactNode][]).map(([pos, label, icon]) => (
            <button
              key={pos}
              id={`ic-pos-${pos}`}
              type="button"
              title={`Position: ${label}`}
              aria-label={`Move crop area to ${label}`}
              onClick={() => onPosition(pos as any)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-slate-800/80 text-slate-300 text-xs font-semibold hover:bg-slate-700 hover:text-white border border-slate-700/60 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {icon}
              <span>{label}</span>
            </button>
          ))}
        </div>
      </Section>

      {/* ── Circle Crop ── */}
      <Section title="Shape">
        <div className="space-y-2">
          <button
            id="ic-circle-crop"
            type="button"
            role="switch"
            aria-checked={circleCrop}
            onClick={() => onChange({ circleCrop: !circleCrop, aspectRatioId: !circleCrop ? '1:1' : aspectRatioId })}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              circleCrop
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
            }`}
          >
            <Circle className="w-4 h-4" />
            Circle Crop {circleCrop ? '(ON)' : '(OFF)'}
          </button>

          {/* Rounded Corners */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <button
                id="ic-rounded-corners"
                type="button"
                role="switch"
                aria-checked={cornerRadius > 0}
                onClick={() => onChange({ cornerRadius: cornerRadius > 0 ? 0 : 24, circleCrop: false })}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  cornerRadius > 0
                    ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
                }`}
              >
                <SquareDashedBottom className="w-4 h-4" />
                Rounded Corners {cornerRadius > 0 ? '(ON)' : '(OFF)'}
              </button>
            </div>
            {cornerRadius > 0 && (
              <div className="space-y-1">
                <label htmlFor="ic-corner-radius" className="text-[10px] text-slate-500">
                  Radius: {cornerRadius}px
                </label>
                <input
                  id="ic-corner-radius"
                  type="range"
                  min="4"
                  max="200"
                  step="2"
                  value={cornerRadius}
                  aria-label={`Corner radius: ${cornerRadius}px`}
                  onChange={e => onChange({ cornerRadius: parseInt(e.target.value, 10) })}
                  className="w-full accent-purple-500"
                />
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* ── Padding ── */}
      <Section title="Background Padding">
        <button
          id="ic-padding-toggle"
          type="button"
          role="switch"
          aria-checked={paddingEnabled}
          onClick={() => onChange({ paddingEnabled: !paddingEnabled })}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            paddingEnabled
              ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
          }`}
        >
          <Square className="w-4 h-4" />
          Padding {paddingEnabled ? '(ON)' : '(OFF)'}
        </button>
        {paddingEnabled && (
          <div className="space-y-2 animate-fadeIn">
            <div>
              <label htmlFor="ic-padding-size" className="text-[10px] text-slate-500">Size: {paddingSize}px</label>
              <input
                id="ic-padding-size"
                type="range"
                min="4"
                max="200"
                step="4"
                value={paddingSize}
                aria-label={`Padding size: ${paddingSize}px`}
                onChange={e => onChange({ paddingSize: parseInt(e.target.value, 10) })}
                className="w-full accent-emerald-500"
              />
            </div>
            <div>
              <label htmlFor="ic-padding-color" className="text-[10px] text-slate-500 block mb-1">Background Color</label>
              <div className="flex items-center gap-2">
                <input
                  id="ic-padding-color"
                  type="color"
                  value={paddingColor}
                  aria-label="Padding background color"
                  onChange={e => onChange({ paddingColor: e.target.value })}
                  className="w-8 h-8 rounded-lg border border-slate-700 cursor-pointer bg-transparent"
                />
                <span className="text-xs text-slate-400">{paddingColor}</span>
              </div>
            </div>
          </div>
        )}
      </Section>

      {/* ── Quality ── */}
      <Section title={`Quality — ${qualityLabel(outputQuality)} (${Math.round(outputQuality * 100)}%)`}>
        <input
          id="ic-quality-slider"
          type="range"
          min="0.1"
          max="1"
          step="0.05"
          value={outputQuality}
          disabled={outputFormat === 'png'}
          aria-label={`Output quality: ${Math.round(outputQuality * 100)}%`}
          onChange={e => onChange({ outputQuality: parseFloat(e.target.value) })}
          className={`w-full accent-amber-500 ${outputFormat === 'png' ? 'opacity-40 cursor-not-allowed' : ''}`}
        />
        {outputFormat === 'png' && (
          <p className="text-[10px] text-slate-500">PNG is always lossless.</p>
        )}
      </Section>

      {/* ── Output Format ── */}
      <Section title="Output Format">
        <div className="flex gap-1.5">
          {(['jpeg', 'png', 'webp'] as const).map(fmt => (
            <button
              key={fmt}
              id={`ic-format-${fmt}`}
              type="button"
              title={`Export as ${fmt.toUpperCase()}`}
              aria-pressed={outputFormat === fmt}
              onClick={() => onChange({ outputFormat: fmt })}
              className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                outputFormat === fmt
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
              }`}
            >
              {fmt}
            </button>
          ))}
        </div>
        {(circleCrop || cornerRadius > 0) && outputFormat !== 'png' && (
          <p className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2 py-1.5 mt-1">
            ⚠ Use PNG format to preserve transparency for circle / rounded corner crops.
          </p>
        )}
      </Section>

      <div className="border-t border-slate-800 pt-4 space-y-3">
        {/* ── Undo / Redo / Reset ── */}
        <div className="flex gap-1.5">
          <Button
            id="ic-undo-btn"
            variant="secondary"
            size="sm"
            leftIcon={<Undo2 className="w-3.5 h-3.5" />}
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo last action"
            className="flex-1"
          >
            Undo
          </Button>
          <Button
            id="ic-redo-btn"
            variant="secondary"
            size="sm"
            leftIcon={<Redo2 className="w-3.5 h-3.5" />}
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo last action"
            className="flex-1"
          >
            Redo
          </Button>
          <Button
            id="ic-reset-btn"
            variant="ghost"
            size="sm"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={onReset}
            title="Reset to original state"
          >
            Reset
          </Button>
        </div>

        {/* ── Download ── */}
        <Button
          id="ic-download-btn"
          variant="gradient"
          size="lg"
          leftIcon={<Download className="w-4 h-4" />}
          onClick={onDownload}
          isLoading={isDownloading}
          className="w-full"
        >
          Download Cropped Image
        </Button>
      </div>
    </div>
  );
};
