import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Scissors, RotateCcw } from 'lucide-react';
import { Button } from '../common/Button';
import {
  LoadedSignatureImage,
  SignatureCropBox,
  AspectRatioPreset,
  ASPECT_RATIO_PRESETS,
  DEFAULT_CROP_BOX,
  executeSignatureCrop,
} from '../../utils/signatureCropperProcessor';

interface SignatureCropWorkspaceProps {
  image: LoadedSignatureImage;
  onCropApplied: (croppedCanvas: HTMLCanvasElement, cropBox: SignatureCropBox) => void;
  onCancel: () => void;
}

type DragHandle = 'move' | 'nw' | 'ne' | 'se' | 'sw' | 'n' | 'e' | 's' | 'w' | null;

export const SignatureCropWorkspace: React.FC<SignatureCropWorkspaceProps> = ({
  image,
  onCropApplied,
  onCancel,
}) => {
  const [cropBox, setCropBox] = useState<SignatureCropBox>(DEFAULT_CROP_BOX);
  const [activePreset, setActivePreset] = useState<AspectRatioPreset>('3:1');
  const [activeHandle, setActiveHandle] = useState<DragHandle>(null);
  const [dragStart, setDragStart] = useState<{
    pointerX: number;
    pointerY: number;
    crop: SignatureCropBox;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Apply preset ratio
  const applyPreset = useCallback(
    (presetId: AspectRatioPreset) => {
      setActivePreset(presetId);
      const preset = ASPECT_RATIO_PRESETS.find((p) => p.id === presetId);
      if (!preset || preset.ratio === null) return;

      const targetRatio = preset.ratio;
      const imgRatio = image.width / image.height;

      // targetRatio = (boxWidthPx / boxHeightPx) = (cropWidth * imgW) / (cropHeight * imgH)
      // => cropHeight = (cropWidth * imgRatio) / targetRatio
      let newW = cropBox.width;
      let newH = (newW * imgRatio) / targetRatio;

      if (newH > 90) {
        newH = 90;
        newW = (newH * targetRatio) / imgRatio;
      }

      const newX = Math.max(0, Math.min(100 - newW, cropBox.x));
      const newY = Math.max(0, Math.min(100 - newH, cropBox.y));

      setCropBox({
        x: parseFloat(newX.toFixed(2)),
        y: parseFloat(newY.toFixed(2)),
        width: parseFloat(newW.toFixed(2)),
        height: parseFloat(newH.toFixed(2)),
      });
    },
    [image.width, image.height, cropBox.width, cropBox.x, cropBox.y]
  );

  // Initial setup for default 3:1 ratio
  useEffect(() => {
    applyPreset('3:1');
  }, []);

  // Render original image with crop overlay
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const src = image.imgElement;
    canvas.width = src.naturalWidth;
    canvas.height = src.naturalHeight;

    // Draw full source image
    ctx.drawImage(src, 0, 0);

    // Dim background overlay
    ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate crop pixel dimensions
    const cX = (cropBox.x / 100) * canvas.width;
    const cY = (cropBox.y / 100) * canvas.height;
    const cW = (cropBox.width / 100) * canvas.width;
    const cH = (cropBox.height / 100) * canvas.height;

    // Cutout original bright area
    ctx.drawImage(src, cX, cY, cW, cH, cX, cY, cW, cH);

    // Outer bounding border
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = Math.max(2, Math.round(canvas.width * 0.003));
    ctx.strokeRect(cX, cY, cW, cH);

    // Rule of thirds grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cX + cW / 3, cY);
    ctx.lineTo(cX + cW / 3, cY + cH);
    ctx.moveTo(cX + (2 * cW) / 3, cY);
    ctx.lineTo(cX + (2 * cW) / 3, cY + cH);
    ctx.moveTo(cX, cY + cH / 3);
    ctx.lineTo(cX + cW, cY + cH / 3);
    ctx.moveTo(cX, cY + (2 * cH) / 3);
    ctx.lineTo(cX + cW, cY + (2 * cH) / 3);
    ctx.stroke();

    // Corner handle visual squares
    const handleSize = Math.max(10, Math.round(canvas.width * 0.015));
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#2563EB';
    ctx.lineWidth = 2;

    const corners = [
      { x: cX - handleSize / 2, y: cY - handleSize / 2 },
      { x: cX + cW - handleSize / 2, y: cY - handleSize / 2 },
      { x: cX + cW - handleSize / 2, y: cY + cH - handleSize / 2 },
      { x: cX - handleSize / 2, y: cY + cH - handleSize / 2 },
    ];

    corners.forEach((c) => {
      ctx.fillRect(c.x, c.y, handleSize, handleSize);
      ctx.strokeRect(c.x, c.y, handleSize, handleSize);
    });

    // Badge with current dimensions
    const badgeW = Math.round(cW);
    const badgeH = Math.round(cH);
    ctx.fillStyle = '#2563EB';
    const textW = 120;
    const textH = 24;
    ctx.fillRect(cX, cY - textH - 2, textW, textH);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px Arial, sans-serif';
    ctx.fillText(`${badgeW} × ${badgeH} px`, cX + 8, cY - 8);
  }, [image, cropBox]);

  // Pointer event handling for dragging & resizing
  const getPointerPercentage = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { px: 0, py: 0 };
    const rect = canvas.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * 100;
    const py = ((e.clientY - rect.top) / rect.height) * 100;
    return { px, py };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    const { px, py } = getPointerPercentage(e);
    const tolerance = 5; // percentage tolerance for handles

    const inX = px >= cropBox.x && px <= cropBox.x + cropBox.width;
    const inY = py >= cropBox.y && py <= cropBox.y + cropBox.height;

    const nearLeft = Math.abs(px - cropBox.x) < tolerance;
    const nearRight = Math.abs(px - (cropBox.x + cropBox.width)) < tolerance;
    const nearTop = Math.abs(py - cropBox.y) < tolerance;
    const nearBottom = Math.abs(py - (cropBox.y + cropBox.height)) < tolerance;

    let handle: DragHandle = null;

    if (nearLeft && nearTop) handle = 'nw';
    else if (nearRight && nearTop) handle = 'ne';
    else if (nearRight && nearBottom) handle = 'se';
    else if (nearLeft && nearBottom) handle = 'sw';
    else if (nearTop && inX) handle = 'n';
    else if (nearRight && inY) handle = 'e';
    else if (nearBottom && inX) handle = 's';
    else if (nearLeft && inY) handle = 'w';
    else if (inX && inY) handle = 'move';

    if (handle) {
      setActiveHandle(handle);
      setDragStart({ pointerX: px, pointerY: py, crop: { ...cropBox } });
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activeHandle || !dragStart) return;

    const { px, py } = getPointerPercentage(e);
    const dx = px - dragStart.pointerX;
    const dy = py - dragStart.pointerY;
    const orig = dragStart.crop;

    const currentPreset = ASPECT_RATIO_PRESETS.find((p) => p.id === activePreset);
    const ratio = currentPreset?.ratio || null;
    const imgRatio = image.width / image.height;

    let next = { ...orig };

    if (activeHandle === 'move') {
      next.x = Math.max(0, Math.min(100 - orig.width, orig.x + dx));
      next.y = Math.max(0, Math.min(100 - orig.height, orig.y + dy));
    } else {
      // Resizing logic
      if (activeHandle === 'se') {
        next.width = Math.max(10, Math.min(100 - orig.x, orig.width + dx));
        if (ratio) {
          next.height = (next.width * imgRatio) / ratio;
          if (next.y + next.height > 100) {
            next.height = 100 - next.y;
            next.width = (next.height * ratio) / imgRatio;
          }
        } else {
          next.height = Math.max(10, Math.min(100 - orig.y, orig.height + dy));
        }
      } else if (activeHandle === 'nw') {
        const potentialW = Math.max(10, orig.width - dx);
        const newX = orig.x + (orig.width - potentialW);
        if (newX >= 0) {
          next.width = potentialW;
          next.x = newX;
        }
        if (ratio) {
          next.height = (next.width * imgRatio) / ratio;
          next.y = Math.max(0, orig.y + orig.height - next.height);
        } else {
          const potentialH = Math.max(10, orig.height - dy);
          const newY = orig.y + (orig.height - potentialH);
          if (newY >= 0) {
            next.height = potentialH;
            next.y = newY;
          }
        }
      } else if (activeHandle === 'ne') {
        next.width = Math.max(10, Math.min(100 - orig.x, orig.width + dx));
        if (ratio) {
          next.height = (next.width * imgRatio) / ratio;
          next.y = Math.max(0, orig.y + orig.height - next.height);
        } else {
          const potentialH = Math.max(10, orig.height - dy);
          const newY = orig.y + (orig.height - potentialH);
          if (newY >= 0) {
            next.height = potentialH;
            next.y = newY;
          }
        }
      } else if (activeHandle === 'sw') {
        const potentialW = Math.max(10, orig.width - dx);
        const newX = orig.x + (orig.width - potentialW);
        if (newX >= 0) {
          next.width = potentialW;
          next.x = newX;
        }
        if (ratio) {
          next.height = (next.width * imgRatio) / ratio;
          if (next.y + next.height > 100) {
            next.height = 100 - next.y;
            next.width = (next.height * ratio) / imgRatio;
          }
        } else {
          next.height = Math.max(10, Math.min(100 - orig.y, orig.height + dy));
        }
      } else if (!ratio) {
        // Freeform side handles
        if (activeHandle === 'e') {
          next.width = Math.max(10, Math.min(100 - orig.x, orig.width + dx));
        } else if (activeHandle === 's') {
          next.height = Math.max(10, Math.min(100 - orig.y, orig.height + dy));
        } else if (activeHandle === 'w') {
          const potentialW = Math.max(10, orig.width - dx);
          const newX = orig.x + (orig.width - potentialW);
          if (newX >= 0) {
            next.width = potentialW;
            next.x = newX;
          }
        } else if (activeHandle === 'n') {
          const potentialH = Math.max(10, orig.height - dy);
          const newY = orig.y + (orig.height - potentialH);
          if (newY >= 0) {
            next.height = potentialH;
            next.y = newY;
          }
        }
      }
    }

    setCropBox({
      x: parseFloat(next.x.toFixed(2)),
      y: parseFloat(next.y.toFixed(2)),
      width: parseFloat(next.width.toFixed(2)),
      height: parseFloat(next.height.toFixed(2)),
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (activeHandle) {
      setActiveHandle(null);
      setDragStart(null);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (err) {}
    }
  };

  const handleApplyCrop = () => {
    const croppedCanvas = executeSignatureCrop(image.imgElement, cropBox);
    onCropApplied(croppedCanvas, cropBox);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Ratio Presets Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
            Aspect Ratio:
          </span>
          {ASPECT_RATIO_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activePreset === preset.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            setCropBox(DEFAULT_CROP_BOX);
            applyPreset('3:1');
          }}
          className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Box</span>
        </button>
      </div>

      {/* Main Interactive Canvas Viewer */}
      <div
        ref={containerRef}
        className="relative w-full rounded-3xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center p-3 select-none touch-none"
      >
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="max-w-full max-h-[500px] object-contain cursor-crosshair rounded-xl shadow-2xl"
        />
      </div>

      {/* Manual Fine-Tuning Range Sliders */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-900/50 border border-slate-800 text-xs">
        <div className="space-y-1">
          <span className="text-slate-400">Position X ({cropBox.x}%)</span>
          <input
            type="range"
            min={0}
            max={100 - cropBox.width}
            step={0.5}
            value={cropBox.x}
            onChange={(e) =>
              setCropBox((prev) => ({ ...prev, x: parseFloat(e.target.value) }))
            }
            className="w-full accent-blue-500 cursor-pointer"
          />
        </div>

        <div className="space-y-1">
          <span className="text-slate-400">Position Y ({cropBox.y}%)</span>
          <input
            type="range"
            min={0}
            max={100 - cropBox.height}
            step={0.5}
            value={cropBox.y}
            onChange={(e) =>
              setCropBox((prev) => ({ ...prev, y: parseFloat(e.target.value) }))
            }
            className="w-full accent-blue-500 cursor-pointer"
          />
        </div>

        <div className="space-y-1">
          <span className="text-slate-400">Width ({cropBox.width}%)</span>
          <input
            type="range"
            min={10}
            max={100 - cropBox.x}
            step={0.5}
            value={cropBox.width}
            onChange={(e) => {
              const w = parseFloat(e.target.value);
              const currentPreset = ASPECT_RATIO_PRESETS.find((p) => p.id === activePreset);
              if (currentPreset?.ratio) {
                const imgRatio = image.width / image.height;
                const h = (w * imgRatio) / currentPreset.ratio;
                if (cropBox.y + h <= 100) {
                  setCropBox((prev) => ({ ...prev, width: w, height: parseFloat(h.toFixed(2)) }));
                  return;
                }
              }
              setCropBox((prev) => ({ ...prev, width: w }));
            }}
            className="w-full accent-blue-500 cursor-pointer"
          />
        </div>

        <div className="space-y-1">
          <span className="text-slate-400">Height ({cropBox.height}%)</span>
          <input
            type="range"
            min={10}
            max={100 - cropBox.y}
            step={0.5}
            value={cropBox.height}
            disabled={activePreset !== 'free'}
            onChange={(e) =>
              setCropBox((prev) => ({ ...prev, height: parseFloat(e.target.value) }))
            }
            className="w-full accent-blue-500 cursor-pointer disabled:opacity-40"
          />
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <Button variant="secondary" size="md" onClick={onCancel}>
          Choose Different Image
        </Button>

        <Button
          variant="gradient"
          size="lg"
          onClick={handleApplyCrop}
          leftIcon={<Scissors className="w-4 h-4" />}
        >
          <span>Apply Crop & Preview Signature</span>
        </Button>
      </div>
    </div>
  );
};
