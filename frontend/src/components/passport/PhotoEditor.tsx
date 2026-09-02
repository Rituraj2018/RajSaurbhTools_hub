import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Crop,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  FlipHorizontal,
  Eye,
  Sparkles,
} from 'lucide-react';
import {
  CropArea,
  calculateAutoCrop,
  PASSPORT_ASPECT_RATIO,
} from '../../utils/passportProcessor';
import { Button } from '../common/Button';

export interface PhotoEditorProps {
  image: HTMLImageElement;
  cropArea: CropArea;
  onCropChange: (crop: CropArea) => void;
  rotation: number;
  onRotationChange: (rotation: number) => void;
  flipHorizontal: boolean;
  onFlipChange: (flip: boolean) => void;
  showBiometricGuides: boolean;
  onToggleGuides: (show: boolean) => void;
  onAutoCrop?: () => void;
}

type DragHandle =
  | 'inside'
  | 'nw'
  | 'ne'
  | 'se'
  | 'sw'
  | 'n'
  | 's'
  | 'e'
  | 'w'
  | null;

export const PhotoEditor: React.FC<PhotoEditorProps> = ({
  image,
  cropArea,
  onCropChange,
  rotation,
  onRotationChange,
  flipHorizontal,
  onFlipChange,
  showBiometricGuides,
  onToggleGuides,
  onAutoCrop,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [zoom, setZoom] = useState<number>(1);
  const [isDragging, setIsDragging] = useState(false);
  const [activeHandle, setActiveHandle] = useState<DragHandle>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; crop: CropArea } | null>(
    null
  );

  // Render & draw crop overlay on canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const container = containerRef.current;
    const containerWidth = container ? container.clientWidth : 600;
    const containerHeight = Math.min(520, Math.max(380, window.innerHeight * 0.5));

    // Calculate display scale so image fits comfortably inside editor canvas
    const imgAspect = image.naturalWidth / image.naturalHeight;
    let dispWidth = containerWidth;
    let dispHeight = dispWidth / imgAspect;

    if (dispHeight > containerHeight) {
      dispHeight = containerHeight;
      dispWidth = dispHeight * imgAspect;
    }

    // Apply zoom
    dispWidth *= zoom;
    dispHeight *= zoom;

    canvas.width = dispWidth;
    canvas.height = dispHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw transformed image
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    if (flipHorizontal) ctx.scale(-1, 1);
    if (rotation !== 0) ctx.rotate((rotation * Math.PI) / 180);

    ctx.drawImage(
      image,
      -canvas.width / 2,
      -canvas.height / 2,
      canvas.width,
      canvas.height
    );
    ctx.restore();

    // Scaling ratio between original image and displayed canvas
    const scaleX = canvas.width / image.naturalWidth;
    const scaleY = canvas.height / image.naturalHeight;

    // Crop box coordinates on canvas
    const cx = cropArea.x * scaleX;
    const cy = cropArea.y * scaleY;
    const cw = cropArea.width * scaleX;
    const ch = cropArea.height * scaleY;

    // 2. Dim area outside crop box
    ctx.fillStyle = 'rgba(2, 6, 23, 0.72)';
    ctx.beginPath();
    // Outer rectangle
    ctx.rect(0, 0, canvas.width, canvas.height);
    // Inner cutout rectangle (counter-clockwise to punch hole)
    ctx.rect(cx + cw, cy, -cw, ch);
    ctx.fill();

    // 3. Crop Box Boundary Border
    ctx.strokeStyle = '#38BDF8'; // Sky blue border
    ctx.lineWidth = 2;
    ctx.strokeRect(cx, cy, cw, ch);

    // 4. Subtle 3x3 Grid Lines inside crop box
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    ctx.beginPath();
    // Vertical grid
    ctx.moveTo(cx + cw / 3, cy);
    ctx.lineTo(cx + cw / 3, cy + ch);
    ctx.moveTo(cx + (2 * cw) / 3, cy);
    ctx.lineTo(cx + (2 * cw) / 3, cy + ch);
    // Horizontal grid
    ctx.moveTo(cx, cy + ch / 3);
    ctx.lineTo(cx + cw, cy + ch / 3);
    ctx.moveTo(cx, cy + (2 * ch) / 3);
    ctx.lineTo(cx + cw, cy + (2 * ch) / 3);
    ctx.stroke();
    ctx.setLineDash([]); // Reset dash

    // 5. Biometric Passport Guideline Overlays
    if (showBiometricGuides) {
      // Center vertical guide
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.6)'; // Soft rose red
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx + cw / 2, cy);
      ctx.lineTo(cx + cw / 2, cy + ch);
      ctx.stroke();

      // Eye-level horizontal line (~40% from top)
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)'; // Cyan line
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx + 8, cy + ch * 0.42);
      ctx.lineTo(cx + cw - 8, cy + ch * 0.42);
      ctx.stroke();

      // Chin horizontal guide line (~78% from top)
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.8)'; // Amber line
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx + 12, cy + ch * 0.8);
      ctx.lineTo(cx + cw - 12, cy + ch * 0.8);
      ctx.stroke();

      // Head Oval Guide (Standard 70-80% height coverage)
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.85)'; // Purple oval
      ctx.lineWidth = 2;
      ctx.beginPath();
      const ovalCenterX = cx + cw / 2;
      const ovalCenterY = cy + ch * 0.48;
      const ovalRadiusX = cw * 0.32;
      const ovalRadiusY = ch * 0.34;
      ctx.ellipse(ovalCenterX, ovalCenterY, ovalRadiusX, ovalRadiusY, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Label tags inside crop box
      ctx.fillStyle = '#38BDF8';
      ctx.font = '10px sans-serif';
      ctx.fillText('EYE LEVEL', cx + 10, cy + ch * 0.42 - 4);

      ctx.fillStyle = '#FBBF24';
      ctx.fillText('CHIN LINE', cx + 10, cy + ch * 0.8 - 4);
    }

    // 6. Corner and Edge Drag Handles
    const handleSize = 12;
    const cornerHandles = [
      { x: cx, y: cy, type: 'nw' },
      { x: cx + cw, y: cy, type: 'ne' },
      { x: cx + cw, y: cy + ch, type: 'se' },
      { x: cx, y: cy + ch, type: 'sw' },
    ];

    cornerHandles.forEach((h) => {
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#0284C7';
      ctx.lineWidth = 2;
      ctx.fillRect(h.x - handleSize / 2, h.y - handleSize / 2, handleSize, handleSize);
      ctx.strokeRect(h.x - handleSize / 2, h.y - handleSize / 2, handleSize, handleSize);
    });

    // 35mm x 45mm Tag on top of crop box
    ctx.fillStyle = '#0284C7';
    ctx.fillRect(cx, cy - 20 > 0 ? cy - 20 : cy + 4, 86, 18);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('35 × 45 mm', cx + 8, (cy - 20 > 0 ? cy - 20 : cy + 4) + 13);
  }, [image, cropArea, rotation, flipHorizontal, zoom, showBiometricGuides]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Window resize listener to keep canvas crisp
  useEffect(() => {
    const handleResize = () => drawCanvas();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawCanvas]);

  /**
   * Determine handle clicked under cursor
   */
  const getHandleAtPoint = (px: number, py: number): DragHandle => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return null;

    const scaleX = canvas.width / image.naturalWidth;
    const scaleY = canvas.height / image.naturalHeight;

    const cx = cropArea.x * scaleX;
    const cy = cropArea.y * scaleY;
    const cw = cropArea.width * scaleX;
    const ch = cropArea.height * scaleY;

    const hit = 16; // Hit test distance

    if (Math.abs(px - cx) < hit && Math.abs(py - cy) < hit) return 'nw';
    if (Math.abs(px - (cx + cw)) < hit && Math.abs(py - cy) < hit) return 'ne';
    if (Math.abs(px - (cx + cw)) < hit && Math.abs(py - (cy + ch)) < hit) return 'se';
    if (Math.abs(px - cx) < hit && Math.abs(py - (cy + ch)) < hit) return 'sw';

    // Inside crop box
    if (px >= cx && px <= cx + cw && py >= cy && py <= cy + ch) {
      return 'inside';
    }

    return null;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const handle = getHandleAtPoint(px, py);
    if (handle) {
      setIsDragging(true);
      setActiveHandle(handle);
      setDragStart({ x: e.clientX, y: e.clientY, crop: { ...cropArea } });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    // Update cursor style
    if (!isDragging) {
      const handle = getHandleAtPoint(px, py);
      if (handle === 'nw' || handle === 'se') canvas.style.cursor = 'nwse-resize';
      else if (handle === 'ne' || handle === 'sw') canvas.style.cursor = 'nesw-resize';
      else if (handle === 'inside') canvas.style.cursor = 'grab';
      else canvas.style.cursor = 'default';
      return;
    }

    if (!dragStart || !activeHandle) return;

    const scaleX = canvas.width / image.naturalWidth;
    const scaleY = canvas.height / image.naturalHeight;

    const deltaX = (e.clientX - dragStart.x) / scaleX;
    const deltaY = (e.clientY - dragStart.y) / scaleY;

    const initial = dragStart.crop;
    let newCrop: CropArea = { ...initial };

    if (activeHandle === 'inside') {
      // Reposition crop area within image boundaries
      newCrop.x = Math.max(0, Math.min(image.naturalWidth - initial.width, initial.x + deltaX));
      newCrop.y = Math.max(0, Math.min(image.naturalHeight - initial.height, initial.y + deltaY));
    } else {
      // Resizing while locking aspect ratio to 35:45 (PASSPORT_ASPECT_RATIO)
      let newWidth = initial.width;
      let newHeight = initial.height;

      if (activeHandle === 'se') {
        newWidth = Math.max(100, initial.width + deltaX);
        newHeight = newWidth / PASSPORT_ASPECT_RATIO;
      } else if (activeHandle === 'nw') {
        newWidth = Math.max(100, initial.width - deltaX);
        newHeight = newWidth / PASSPORT_ASPECT_RATIO;
        newCrop.x = initial.x + (initial.width - newWidth);
        newCrop.y = initial.y + (initial.height - newHeight);
      } else if (activeHandle === 'ne') {
        newWidth = Math.max(100, initial.width + deltaX);
        newHeight = newWidth / PASSPORT_ASPECT_RATIO;
        newCrop.y = initial.y + (initial.height - newHeight);
      } else if (activeHandle === 'sw') {
        newWidth = Math.max(100, initial.width - deltaX);
        newHeight = newWidth / PASSPORT_ASPECT_RATIO;
        newCrop.x = initial.x + (initial.width - newWidth);
      }

      // Check bounds
      if (
        newCrop.x >= 0 &&
        newCrop.y >= 0 &&
        newCrop.x + newWidth <= image.naturalWidth &&
        newCrop.y + newHeight <= image.naturalHeight
      ) {
        newCrop.width = newWidth;
        newCrop.height = newHeight;
      } else {
        return;
      }
    }

    onCropChange(newCrop);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setActiveHandle(null);
    setDragStart(null);
    if (canvasRef.current) canvasRef.current.style.cursor = 'default';
  };

  const handleAutoCenterCrop = () => {
    if (onAutoCrop) {
      onAutoCrop();
    } else {
      const auto = calculateAutoCrop(image.naturalWidth, image.naturalHeight);
      onCropChange(auto);
    }
  };

  const handleRotateCCW = () => {
    onRotationChange((rotation - 90 + 360) % 360);
  };

  const handleRotateCW = () => {
    onRotationChange((rotation + 90) % 360);
  };

  return (
    <div className="space-y-4">
      {/* Editor Main Canvas Container */}
      <div
        ref={containerRef}
        className="relative rounded-3xl bg-slate-950 border border-slate-800/90 shadow-2xl overflow-hidden flex items-center justify-center p-2 sm:p-4 select-none min-h-[380px]"
      >
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="rounded-xl shadow-lg touch-none"
        />

        {/* Floating Top Badge with Aspect Ratio Info */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-blue-500/30 text-xs font-semibold text-blue-300 backdrop-blur-md shadow-lg">
            <Crop className="w-3.5 h-3.5 text-blue-400" />
            <span>Ratio 35:45 Locked</span>
          </div>
        </div>

        {/* Floating Quick Action Button: Auto Crop */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <button
            onClick={handleAutoCenterCrop}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
            title="Automatically center & fit 35x45mm crop frame"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Auto Crop</span>
          </button>
        </div>
      </div>

      {/* Interactive Tool Control Bar */}
      <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-lg flex flex-wrap items-center justify-between gap-4">
        {/* Left: Rotate & Flip Actions */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRotateCCW}
            title="Rotate 90° Left"
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            <span>-90°</span>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRotateCW}
            title="Rotate 90° Right"
            leftIcon={<RotateCw className="w-3.5 h-3.5" />}
          >
            <span>+90°</span>
          </Button>
          <Button
            variant={flipHorizontal ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => onFlipChange(!flipHorizontal)}
            title="Flip Horizontal"
            leftIcon={<FlipHorizontal className="w-3.5 h-3.5" />}
          >
            <span>Flip</span>
          </Button>
        </div>

        {/* Center: Zoom Controls */}
        <div className="flex items-center gap-2 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setZoom((z) => Math.max(0.6, z - 0.1))}
            className="text-slate-400 hover:text-white p-1"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <input
            type="range"
            min="0.6"
            max="2.0"
            step="0.05"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-20 sm:w-28 accent-blue-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <button
            onClick={() => setZoom((z) => Math.min(2.0, z + 0.1))}
            className="text-slate-400 hover:text-white p-1"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono text-slate-400 min-w-[36px] text-right">
            {Math.round(zoom * 100)}%
          </span>
          {zoom !== 1 && (
            <button
              onClick={() => setZoom(1)}
              className="text-[10px] text-blue-400 hover:underline ml-1"
              title="Reset Zoom"
            >
              Reset
            </button>
          )}
        </div>

        {/* Right: Biometric Guidelines Toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant={showBiometricGuides ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => onToggleGuides(!showBiometricGuides)}
            leftIcon={<Eye className="w-3.5 h-3.5" />}
          >
            <span>{showBiometricGuides ? 'Guides Active' : 'Show Guides'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
