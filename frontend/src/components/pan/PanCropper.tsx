import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  PanDocItem,
  PanCropBox,
  CR80_ASPECT_RATIO,
} from '../../utils/panProcessor';

export interface PanCropperProps {
  documentItem: PanDocItem;
  onChangeCrop: (frontCrop: PanCropBox, backCrop: PanCropBox, hasBackCard: boolean) => void;
}

export const PanCropper: React.FC<PanCropperProps> = ({
  documentItem,
  onChangeCrop,
}) => {
  const [activeSide, setActiveSide] = useState<'front' | 'back'>('front');
  const [hasBackCard, setHasBackCard] = useState<boolean>(documentItem.hasBackCard);
  const [frontCrop, setFrontCrop] = useState<PanCropBox>(documentItem.frontCrop);
  const [backCrop, setBackCrop] = useState<PanCropBox>(documentItem.backCrop);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; cropX: number; cropY: number } | null>(null);

  const activeCrop = activeSide === 'front' ? frontCrop : backCrop;

  const updateActiveCrop = useCallback(
    (newCrop: Partial<PanCropBox>) => {
      if (activeSide === 'front') {
        const updated = { ...frontCrop, ...newCrop };
        setFrontCrop(updated);
        onChangeCrop(updated, backCrop, hasBackCard);
      } else {
        const updated = { ...backCrop, ...newCrop };
        setBackCrop(updated);
        onChangeCrop(frontCrop, updated, hasBackCard);
      }
    },
    [activeSide, frontCrop, backCrop, hasBackCard, onChangeCrop]
  );

  const handleToggleHasBack = (val: boolean) => {
    setHasBackCard(val);
    if (!val && activeSide === 'back') {
      setActiveSide('front');
    }
    onChangeCrop(frontCrop, backCrop, val);
  };

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
    ctx.strokeStyle = activeSide === 'front' ? '#2563EB' : 'rgba(37, 99, 235, 0.5)';
    ctx.lineWidth = activeSide === 'front' ? 4 : 2;
    ctx.strokeRect(fX, fY, fW, fH);

    // Label Front Box
    ctx.fillStyle = '#2563EB';
    ctx.fillRect(fX, fY - 26, 130, 24);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px Arial, sans-serif';
    ctx.fillText('PAN Front Card', fX + 10, fY - 9);

    // Clear and highlight Back Crop Box if enabled (Emerald)
    if (hasBackCard) {
      const bX = (backCrop.x / 100) * canvas.width;
      const bY = (backCrop.y / 100) * canvas.height;
      const bW = (backCrop.width / 100) * canvas.width;
      const bH = (backCrop.height / 100) * canvas.height;

      ctx.drawImage(src, bX, bY, bW, bH, bX, bY, bW, bH);
      ctx.strokeStyle = activeSide === 'back' ? '#059669' : 'rgba(5, 150, 105, 0.5)';
      ctx.lineWidth = activeSide === 'back' ? 4 : 2;
      ctx.strokeRect(bX, bY, bW, bH);

      // Label Back Box
      ctx.fillStyle = '#059669';
      ctx.fillRect(bX, bY - 26, 130, 24);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px Arial, sans-serif';
      ctx.fillText('PAN Back Card', bX + 10, bY - 9);
    }
  }, [documentItem, frontCrop, backCrop, activeSide, hasBackCard]);

  // Pointer drag to move crop box
  const handlePointerDown = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = 100 / rect.width;
    const scaleY = 100 / rect.height;

    const pointerPercentX = (e.clientX - rect.left) * scaleX;
    const pointerPercentY = (e.clientY - rect.top) * scaleY;

    // Check if clicked inside active crop
    if (
      pointerPercentX >= activeCrop.x &&
      pointerPercentX <= activeCrop.x + activeCrop.width &&
      pointerPercentY >= activeCrop.y &&
      pointerPercentY <= activeCrop.y + activeCrop.height
    ) {
      setIsDragging(true);
      setDragStart({
        x: pointerPercentX,
        y: pointerPercentY,
        cropX: activeCrop.x,
        cropY: activeCrop.y,
      });
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragStart || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = 100 / rect.width;
    const scaleY = 100 / rect.height;

    const currentX = (e.clientX - rect.left) * scaleX;
    const currentY = (e.clientY - rect.top) * scaleY;

    const deltaX = currentX - dragStart.x;
    const deltaY = currentY - dragStart.y;

    let newX = Math.max(0, Math.min(100 - activeCrop.width, dragStart.cropX + deltaX));
    let newY = Math.max(0, Math.min(100 - activeCrop.height, dragStart.cropY + deltaY));

    updateActiveCrop({ x: parseFloat(newX.toFixed(2)), y: parseFloat(newY.toFixed(2)) });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      setDragStart(null);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (err) {}
    }
  };

  // NSDL preset
  const handleNsdlPreset = () => {
    const f: PanCropBox = { x: 8.0, y: 65.0, width: 41.5, height: 27.0 };
    const b: PanCropBox = { x: 50.5, y: 65.0, width: 41.5, height: 27.0 };
    setFrontCrop(f);
    setBackCrop(b);
    setHasBackCard(true);
    onChangeCrop(f, b, true);
  };

  // Single card scan preset
  const handleSingleCardPreset = () => {
    const f: PanCropBox = { x: 5.0, y: 10.0, width: 90.0, height: 56.7 };
    setFrontCrop(f);
    setHasBackCard(false);
    onChangeCrop(f, backCrop, false);
  };

  return (
    <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6">
      {/* Top Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSide('front')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeSide === 'front'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Front Card
          </button>

          {hasBackCard && (
            <button
              type="button"
              onClick={() => setActiveSide('back')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeSide === 'back'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Back Card
            </button>
          )}

          <button
            type="button"
            onClick={() => handleToggleHasBack(!hasBackCard)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              hasBackCard
                ? 'border-slate-700 text-slate-400 hover:text-white'
                : 'border-blue-500/40 bg-blue-500/10 text-blue-400'
            }`}
          >
            {hasBackCard ? 'Single-Side Mode' : '+ Enable Back Card'}
          </button>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleNsdlPreset}
            className="px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            e-PAN Dual Cutout
          </button>
          <button
            type="button"
            onClick={handleSingleCardPreset}
            className="px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Full Scan Fit
          </button>
        </div>
      </div>

      {/* Interactive Document Crop Canvas */}
      <div
        ref={containerRef}
        className="relative w-full rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden select-none flex items-center justify-center p-2"
      >
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="max-w-full max-h-[520px] object-contain cursor-grab active:cursor-grabbing rounded-lg shadow-2xl"
        />
      </div>

      {/* Manual Fine-Tuning Slider Controls */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs">
        <div className="space-y-1">
          <span className="text-slate-400">Position X</span>
          <input
            type="range"
            min={0}
            max={100 - activeCrop.width}
            step={0.5}
            value={activeCrop.x}
            onChange={(e) => updateActiveCrop({ x: parseFloat(e.target.value) })}
            className="w-full accent-blue-500"
          />
        </div>
        <div className="space-y-1">
          <span className="text-slate-400">Position Y</span>
          <input
            type="range"
            min={0}
            max={100 - activeCrop.height}
            step={0.5}
            value={activeCrop.y}
            onChange={(e) => updateActiveCrop({ y: parseFloat(e.target.value) })}
            className="w-full accent-blue-500"
          />
        </div>
        <div className="space-y-1">
          <span className="text-slate-400">Crop Width</span>
          <input
            type="range"
            min={15}
            max={95}
            step={0.5}
            value={activeCrop.width}
            onChange={(e) => {
              const w = parseFloat(e.target.value);
              const canvas = documentItem.originalCanvas;
              const ratio = canvas ? canvas.width / canvas.height : 1;
              const h = (w / CR80_ASPECT_RATIO) * ratio;
              updateActiveCrop({ width: w, height: Math.min(100 - activeCrop.y, h) });
            }}
            className="w-full accent-blue-500"
          />
        </div>
        <div className="flex items-center justify-center pt-2">
          <span className="text-[11px] text-slate-500 font-mono">
            Ratio 85.6 : 54 locked
          </span>
        </div>
      </div>
    </div>
  );
};
