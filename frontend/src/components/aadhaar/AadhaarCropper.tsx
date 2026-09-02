import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  RotateCcw,
  Sparkles,
  Layers,
  CreditCard,
} from 'lucide-react';
import {
  AadhaarDocItem,
  CardCropBox,
  DEFAULT_FRONT_CROP,
  DEFAULT_BACK_CROP,
  CR80_ASPECT_RATIO,
  extractCardCanvas,
} from '../../utils/aadhaarProcessor';
import { Button } from '../common/Button';

export interface AadhaarCropperProps {
  documentItem: AadhaarDocItem;
  onChangeCrop: (frontCrop: CardCropBox, backCrop: CardCropBox) => void;
}

export const AadhaarCropper: React.FC<AadhaarCropperProps> = ({
  documentItem,
  onChangeCrop,
}) => {
  const [activeSide, setActiveSide] = useState<'front' | 'back'>('front');
  const [frontCrop, setFrontCrop] = useState<CardCropBox>(documentItem.frontCrop);
  const [backCrop, setBackCrop] = useState<CardCropBox>(documentItem.backCrop);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; cropX: number; cropY: number } | null>(null);

  const activeCrop = activeSide === 'front' ? frontCrop : backCrop;

  const updateActiveCrop = useCallback(
    (newCrop: Partial<CardCropBox>) => {
      if (activeSide === 'front') {
        const updated = { ...frontCrop, ...newCrop };
        setFrontCrop(updated);
        onChangeCrop(updated, backCrop);
      } else {
        const updated = { ...backCrop, ...newCrop };
        setBackCrop(updated);
        onChangeCrop(frontCrop, updated);
      }
    },
    [activeSide, frontCrop, backCrop, onChangeCrop]
  );

  // Draw full document onto canvas with highlighted crop boxes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !documentItem.originalCanvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const src = documentItem.originalCanvas;
    canvas.width = src.width;
    canvas.height = src.height;

    // Draw full source document
    ctx.drawImage(src, 0, 0);

    // Dim background overlay
    ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Clear and highlight Front Crop Box (Blue)
    const fX = (frontCrop.x / 100) * canvas.width;
    const fY = (frontCrop.y / 100) * canvas.height;
    const fW = (frontCrop.width / 100) * canvas.width;
    const fH = (frontCrop.height / 100) * canvas.height;

    ctx.drawImage(src, fX, fY, fW, fH, fX, fY, fW, fH);
    ctx.strokeStyle = activeSide === 'front' ? '#3B82F6' : 'rgba(59, 130, 246, 0.5)';
    ctx.lineWidth = activeSide === 'front' ? 4 : 2;
    ctx.strokeRect(fX, fY, fW, fH);

    // Label Front Box
    ctx.fillStyle = '#3B82F6';
    ctx.fillRect(fX, fY - 26, 120, 24);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 13px Arial, sans-serif';
    ctx.fillText('Front Card', fX + 10, fY - 9);

    // Clear and highlight Back Crop Box (Purple)
    const bX = (backCrop.x / 100) * canvas.width;
    const bY = (backCrop.y / 100) * canvas.height;
    const bW = (backCrop.width / 100) * canvas.width;
    const bH = (backCrop.height / 100) * canvas.height;

    ctx.drawImage(src, bX, bY, bW, bH, bX, bY, bW, bH);
    ctx.strokeStyle = activeSide === 'back' ? '#A855F7' : 'rgba(168, 85, 247, 0.5)';
    ctx.lineWidth = activeSide === 'back' ? 4 : 2;
    ctx.strokeRect(bX, bY, bW, bH);

    // Label Back Box
    ctx.fillStyle = '#A855F7';
    ctx.fillRect(bX, bY - 26, 120, 24);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 13px Arial, sans-serif';
    ctx.fillText('Back Card', bX + 10, bY - 9);
  }, [documentItem, frontCrop, backCrop, activeSide]);

  // Mouse drag handlers for positioning the active crop box
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    // Check if clicked inside active box
    if (
      clickX >= activeCrop.x &&
      clickX <= activeCrop.x + activeCrop.width &&
      clickY >= activeCrop.y &&
      clickY <= activeCrop.y + activeCrop.height
    ) {
      setIsDragging(true);
      setDragStart({
        x: clickX,
        y: clickY,
        cropX: activeCrop.x,
        cropY: activeCrop.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !dragStart) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const currentX = ((e.clientX - rect.left) / rect.width) * 100;
    const currentY = ((e.clientY - rect.top) / rect.height) * 100;

    const deltaX = currentX - dragStart.x;
    const deltaY = currentY - dragStart.y;

    const newX = Math.max(0, Math.min(100 - activeCrop.width, dragStart.cropX + deltaX));
    const newY = Math.max(0, Math.min(100 - activeCrop.height, dragStart.cropY + deltaY));

    updateActiveCrop({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  // Reset to default Aadhaar positions
  const handleResetPositions = () => {
    setFrontCrop({ ...DEFAULT_FRONT_CROP });
    setBackCrop({ ...DEFAULT_BACK_CROP });
    onChangeCrop({ ...DEFAULT_FRONT_CROP }, { ...DEFAULT_BACK_CROP });
  };

  // Auto-Position Presets
  const handlePresetFront = () => {
    updateActiveCrop({ ...DEFAULT_FRONT_CROP });
  };

  const handlePresetBack = () => {
    updateActiveCrop({ ...DEFAULT_BACK_CROP });
  };

  // Render quick thumbnail preview
  const frontPreviewCanvas = extractCardCanvas(documentItem.originalCanvas, frontCrop);
  const backPreviewCanvas = extractCardCanvas(documentItem.originalCanvas, backCrop);

  return (
    <div className="space-y-6">
      {/* Top Toolbar: Active Side Selector & Preset Buttons */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        {/* Active Side Toggle */}
        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-950/80 border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveSide('front')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSide === 'front'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>1. Front Card Crop</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSide('back')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSide === 'back'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>2. Back Card Crop</span>
          </button>
        </div>

        {/* Quick Position Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={activeSide === 'front' ? handlePresetFront : handlePresetBack}
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-400" />}
          >
            Auto Position {activeSide === 'front' ? 'Front' : 'Back'}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetPositions}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Reset Default
          </Button>
        </div>
      </div>

      {/* Main Cropping Canvas & Side Preview Slices */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left (8 cols): Interactive Canvas Workspace */}
        <div className="lg:col-span-8 rounded-3xl bg-slate-950 border border-slate-800 p-4 shadow-2xl flex flex-col items-center justify-center overflow-hidden relative">
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 backdrop-blur-sm z-10">
            Click & drag crop frame to position • CR80 Ratio 85.6:54
          </div>

          <div ref={containerRef} className="w-full flex justify-center py-2">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              className="max-h-[580px] w-auto h-auto rounded-lg shadow-2xl border border-slate-800 cursor-move block object-contain"
            />
          </div>

          {/* Size & Position Fine-Tuning Sliders */}
          <div className="w-full pt-4 mt-2 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-400">
            <div>
              <label className="text-[10px] font-semibold text-slate-400">Width Scale (%)</label>
              <input
                type="range"
                min="20"
                max="60"
                step="0.5"
                value={activeCrop.width}
                onChange={(e) => {
                  const w = parseFloat(e.target.value);
                  const h = w / CR80_ASPECT_RATIO;
                  updateActiveCrop({ width: w, height: h });
                }}
                className="w-full mt-1 accent-blue-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-400">Horizontal Pos X (%)</label>
              <input
                type="range"
                min="0"
                max={100 - activeCrop.width}
                step="0.5"
                value={activeCrop.x}
                onChange={(e) => updateActiveCrop({ x: parseFloat(e.target.value) })}
                className="w-full mt-1 accent-blue-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-400">Vertical Pos Y (%)</label>
              <input
                type="range"
                min="0"
                max={100 - activeCrop.height}
                step="0.5"
                value={activeCrop.y}
                onChange={(e) => updateActiveCrop({ y: parseFloat(e.target.value) })}
                className="w-full mt-1 accent-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Right (4 cols): Extracted Live Cards Previews */}
        <div className="lg:col-span-4 space-y-4">
          {/* Front Card Slice */}
          <div
            onClick={() => setActiveSide('front')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              activeSide === 'front'
                ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500'
                : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-blue-400" />
                <span>Front Card Slice</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">85.6 × 54 mm</span>
            </div>

            <div className="rounded-lg overflow-hidden border border-slate-700 bg-white shadow-md">
              <img
                src={frontPreviewCanvas.toDataURL('image/jpeg', 0.9)}
                alt="Front Card Preview"
                className="w-full h-auto block"
              />
            </div>
          </div>

          {/* Back Card Slice */}
          <div
            onClick={() => setActiveSide('back')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              activeSide === 'back'
                ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/10 ring-1 ring-purple-500'
                : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                <span>Back Card Slice</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">85.6 × 54 mm</span>
            </div>

            <div className="rounded-lg overflow-hidden border border-slate-700 bg-white shadow-md">
              <img
                src={backPreviewCanvas.toDataURL('image/jpeg', 0.9)}
                alt="Back Card Preview"
                className="w-full h-auto block"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
