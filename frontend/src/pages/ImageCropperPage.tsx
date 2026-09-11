import React, { useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Crop, ArrowLeft, ShieldCheck, Zap, Monitor,
  ChevronDown, ChevronUp,
} from 'lucide-react';
import {
  ImageCropperUploader,
  ImageCropperWorkspace,
  ImageCropperControls,
  ImageCropperPreview,
} from '../components/imageCropper';
import {
  LoadedCropImage, CropState, CropBox,
  DEFAULT_CROP_STATE,
  ASPECT_RATIO_PRESETS, PRESET_SIZES,
  applyCrop, downloadCroppedImage,
  buildCropBoxForAspectRatio, positionCropBox,
} from '../utils/imageCropperProcessor';
import { Button } from '../components/common/Button';
import { recordToolHistorySafely } from '../api/historyApi';

// ─────────────────────────────────────────────────────────────
// History / Undo-Redo helpers
// ─────────────────────────────────────────────────────────────

const MAX_HISTORY = 50;

function useHistory(initial: CropState) {
  const [stack, setStack]   = useState<CropState[]>([initial]);
  const [index, setIndex]   = useState(0);

  const current = stack[index];

  const push = useCallback((state: CropState) => {
    setStack(prev => {
      const trimmed = prev.slice(0, index + 1);
      const next    = [...trimmed, state].slice(-MAX_HISTORY);
      return next;
    });
    setIndex(prev => Math.min(prev + 1, MAX_HISTORY - 1));
  }, [index]);

  const undo = useCallback(() => {
    setIndex(i => Math.max(0, i - 1));
  }, []);

  const redo = useCallback(() => {
    setIndex(i => Math.min(stack.length - 1, i + 1));
  }, [stack.length]);

  const reset = useCallback((state: CropState) => {
    setStack([state]);
    setIndex(0);
  }, []);

  return {
    current,
    push,
    undo, canUndo: index > 0,
    redo, canRedo: index < stack.length - 1,
    reset,
  };
}

// ─────────────────────────────────────────────────────────────
// How-to guide steps
// ─────────────────────────────────────────────────────────────

const HOW_TO_STEPS = [
  { step: 1, title: 'Upload Your Image',           desc: 'Click "Select Image" or drag & drop a JPG, PNG, or WebP file (up to 50 MB).' },
  { step: 2, title: 'Choose Crop Mode',             desc: 'Select Free Crop, an Aspect Ratio preset, a Preset Size (e.g. Passport Photo), or enter Custom Width × Height.' },
  { step: 3, title: 'Adjust the Crop Area',         desc: 'Drag the handles on the workspace to resize. Drag inside the crop box to move it. Drag outside the crop box to pan the image.' },
  { step: 4, title: 'Zoom & Pan the Image',         desc: 'Use the Zoom slider to zoom in for finer positioning. Drag outside the crop box to pan the image within the viewport.' },
  { step: 5, title: 'Rotate or Flip',               desc: 'Use Rotate Left / Right / 180° and Flip Horizontal / Vertical to correct image orientation.' },
  { step: 6, title: 'Apply Shape or Padding',       desc: 'Enable Circle Crop or Rounded Corners for shaped output. Enable Background Padding to add a border around the crop.' },
  { step: 7, title: 'Select Quality & Format',      desc: 'Choose JPG (smaller file), PNG (lossless, transparency), or WebP (modern). Adjust the Quality slider for JPG/WebP.' },
  { step: 8, title: 'Check the Before / After',     desc: 'Scroll down to the Before / After preview to verify the result matches your expectations.' },
  { step: 9, title: 'Apply Crop',                   desc: 'When satisfied, click "Download Cropped Image" — the file is processed and saved directly in your browser.' },
  { step: 10, title: 'Download',                    desc: 'The final image downloads instantly as "cropped-<filename>.ext". No server upload occurs.' },
];

// ─────────────────────────────────────────────────────────────
// Page Component
// ─────────────────────────────────────────────────────────────

export const ImageCropperPage: React.FC = () => {
  const [loadedImage, setLoadedImage]     = useState<LoadedCropImage | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showGuide, setShowGuide]         = useState(false);

  const history = useHistory(DEFAULT_CROP_STATE);
  const cropState = history.current;

  // Ref used to debounce workspace drag updates (only push to history on pointer-up)
  const pendingCropBox = useRef<CropBox | null>(null);

  // ── Image loaded ──

  const handleImageLoaded = useCallback((img: LoadedCropImage) => {
    setLoadedImage(img);
    history.reset(DEFAULT_CROP_STATE);
  }, [history]);

  // ── Crop box changed from workspace ──

  const handleCropBoxChange = useCallback((box: CropBox) => {
    pendingCropBox.current = box;
    // Apply immediately to state (workspace re-renders fast)
    // History push is deferred to avoid flooding — for simplicity in this
    // implementation we push every update (50-entry cap handles it)
    history.push({ ...history.current, cropBox: box });
  }, [history]);

  const handlePanChange = useCallback((panX: number, panY: number) => {
    history.push({ ...history.current, panX, panY });
  }, [history]);

  // ── Controls → state changes ──

  const handleChange = useCallback((partial: Partial<CropState>) => {
    const next = { ...history.current, ...partial };

    // If aspect ratio changed, rebuild crop box
    if (partial.aspectRatioId && partial.aspectRatioId !== history.current.aspectRatioId) {
      const arPreset = ASPECT_RATIO_PRESETS.find(p => p.id === partial.aspectRatioId);
      if (arPreset && loadedImage) {
        const isSwapped = next.rotation === 90 || next.rotation === 270;
        const effW = isSwapped ? loadedImage.naturalHeight : loadedImage.naturalWidth;
        const effH = isSwapped ? loadedImage.naturalWidth  : loadedImage.naturalHeight;
        next.cropBox = buildCropBoxForAspectRatio(effW, effH, arPreset.ratio, next.cropBox);
      }
    }

    // If preset size changed, set aspect ratio from preset
    if (partial.presetSizeId && partial.presetSizeId !== history.current.presetSizeId) {
      const szPreset = PRESET_SIZES.find(p => p.id === partial.presetSizeId);
      if (szPreset && szPreset.id !== 'custom' && loadedImage) {
        const isSwapped = next.rotation === 90 || next.rotation === 270;
        const effW = isSwapped ? loadedImage.naturalHeight : loadedImage.naturalWidth;
        const effH = isSwapped ? loadedImage.naturalWidth  : loadedImage.naturalHeight;
        next.cropBox = buildCropBoxForAspectRatio(effW, effH, szPreset.aspectRatio, next.cropBox);
        next.customWidth  = szPreset.widthPx;
        next.customHeight = szPreset.heightPx;
        // Derive closest aspect ratio id
        const matched = ASPECT_RATIO_PRESETS.find(
          p => p.ratio !== null && Math.abs(p.ratio - szPreset.aspectRatio) < 0.01
        );
        next.aspectRatioId = matched ? matched.id : 'free';
      }
    }

    history.push(next);
  }, [history, loadedImage]);

  // ── Rotate ──

  const handleRotate = useCallback((delta: 90 | -90 | 180) => {
    const current = history.current.rotation;
    const next = ((current + delta + 360) % 360) as 0 | 90 | 180 | 270;
    history.push({ ...history.current, rotation: next });
  }, [history]);

  // ── Flip ──

  const handleFlipH = useCallback(() => {
    history.push({ ...history.current, flipH: !history.current.flipH });
  }, [history]);

  const handleFlipV = useCallback(() => {
    history.push({ ...history.current, flipV: !history.current.flipV });
  }, [history]);

  // ── Zoom ──

  const handleZoomIn    = useCallback(() => history.push({ ...history.current, zoom: Math.min(3, parseFloat((history.current.zoom + 0.25).toFixed(2))) }), [history]);
  const handleZoomOut   = useCallback(() => history.push({ ...history.current, zoom: Math.max(0.5, parseFloat((history.current.zoom - 0.25).toFixed(2))) }), [history]);
  const handleZoomReset = useCallback(() => history.push({ ...history.current, zoom: 1, panX: 0, panY: 0 }), [history]);

  // ── Position ──

  const handlePosition = useCallback((pos: 'center' | 'top' | 'bottom' | 'left' | 'right') => {
    const newBox = positionCropBox(history.current.cropBox, pos);
    history.push({ ...history.current, cropBox: newBox });
  }, [history]);

  // ── Reset ──

  const handleReset = useCallback(() => {
    if (loadedImage) {
      history.reset(DEFAULT_CROP_STATE);
    }
  }, [history, loadedImage]);

  // ── Download ──

  const handleDownload = useCallback(async () => {
    if (!loadedImage || isDownloading) return;
    setIsDownloading(true);
    try {
      const resultCanvas = applyCrop(loadedImage.img, cropState);
      downloadCroppedImage(resultCanvas, cropState.outputFormat, cropState.outputQuality, loadedImage.name);

      recordToolHistorySafely({
        tool: 'image-cropper',
        toolName: 'Image Cropper',
        inputFiles: [{
          name: loadedImage.name,
          size: loadedImage.size,
          type: loadedImage.file.type || 'image/jpeg',
        }],
        outputFile: {
          name: `cropped-${loadedImage.name.replace(/\.[^/.]+$/, '')}.${cropState.outputFormat === 'jpeg' ? 'jpg' : cropState.outputFormat}`,
          type: `image/${cropState.outputFormat}`,
        },
        status: 'completed',
        metadata: {
          rotation: cropState.rotation,
          flipH: cropState.flipH,
          flipV: cropState.flipV,
          format: cropState.outputFormat,
          quality: cropState.outputQuality,
          circleCrop: cropState.circleCrop,
        },
      });
    } catch (err) {
      console.error('Image crop download failed:', err);
    } finally {
      setIsDownloading(false);
    }
  }, [loadedImage, cropState, isDownloading]);

  // ─────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8 animate-fadeIn pb-16">

      {/* ── Header Banner ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2">
            <Link to="/tools" className="hover:text-blue-400 transition-colors">
              Tools Catalog
            </Link>
            <span>/</span>
            <Link to="/tools?category=Crop" className="hover:text-blue-400 transition-colors">
              Crop Tools
            </Link>
            <span>/</span>
            <span className="text-blue-400">Image Cropper</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Crop className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Image Cropper Pro
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Professional image cropping with aspect ratios, rotation, flip, circle crop, padding &amp; more.
              </p>
            </div>
          </div>
        </div>

        <Link to="/tools">
          <Button variant="secondary" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Tools
          </Button>
        </Link>
      </div>

      {/* ── Upload Zone ── */}
      <ImageCropperUploader onImageLoaded={handleImageLoaded} />

      {/* ── Editor (only when image is loaded) ── */}
      {loadedImage && (
        <>
          {/* Main editor layout */}
          <div className="flex flex-col xl:flex-row gap-6">

            {/* Controls panel */}
            <div className="xl:w-72 shrink-0 rounded-2xl bg-slate-900/50 border border-slate-800 p-5">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">Crop Controls</p>
              <ImageCropperControls
                cropState={cropState}
                onChange={handleChange}
                onRotateLeft={() => handleRotate(-90)}
                onRotateRight={() => handleRotate(90)}
                onRotate180={() => handleRotate(180)}
                onFlipH={handleFlipH}
                onFlipV={handleFlipV}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onZoomReset={handleZoomReset}
                onPosition={handlePosition}
                onUndo={history.undo}
                onRedo={history.redo}
                onReset={handleReset}
                onDownload={handleDownload}
                canUndo={history.canUndo}
                canRedo={history.canRedo}
                isDownloading={isDownloading}
              />
            </div>

            {/* Workspace */}
            <div className="flex-1 space-y-4">
              <div
                className="relative"
                style={{ minHeight: 480 }}
              >
                <ImageCropperWorkspace
                  image={loadedImage}
                  cropState={cropState}
                  onCropBoxChange={handleCropBoxChange}
                  onPanChange={handlePanChange}
                />
              </div>

              {/* Tip bar */}
              <div className="flex flex-wrap gap-3 text-xs text-slate-500 px-1">
                <span>💡 Drag handles to resize the crop area</span>
                <span>·</span>
                <span>Drag inside crop box to move it</span>
                <span>·</span>
                <span>Drag outside to pan image</span>
              </div>
            </div>
          </div>

          {/* ── Before / After ── */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              Before / After Preview
            </h2>
            <ImageCropperPreview originalImage={loadedImage} cropState={cropState} />
          </div>
        </>
      )}

      {/* ── Feature Highlights (shown when no image) ── */}
      {!loadedImage && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Crop className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Full-Featured Cropper</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Aspect ratios, custom dimensions, preset sizes, circle crop, rounded corners, background padding and more.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Rotate, Flip &amp; Zoom</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Rotate in 90° steps, flip horizontally or vertically, and zoom for precise positioning.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">100% Client-Side Privacy</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your image is processed entirely in your browser. Nothing is uploaded to any server.
            </p>
          </div>
        </div>
      )}

      {/* ── How-to Guide ── */}
      <div className="rounded-2xl bg-slate-900/40 border border-slate-800 overflow-hidden">
        <button
          id="ic-guide-toggle"
          type="button"
          aria-expanded={showGuide}
          onClick={() => setShowGuide(v => !v)}
          className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-900/60 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Monitor className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-white">How to Use — Step-by-Step Guide</span>
          </div>
          {showGuide ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {showGuide && (
          <div className="px-5 pb-6 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
            {HOW_TO_STEPS.map(({ step, title, desc }) => (
              <div key={step} className="flex gap-3">
                <div className="shrink-0 w-7 h-7 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 text-xs font-bold">
                  {step}
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-white">{title}</p>
                  <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
