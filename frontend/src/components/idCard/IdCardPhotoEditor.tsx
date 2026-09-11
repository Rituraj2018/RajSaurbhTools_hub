import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SunMedium, Contrast, Paintbrush, Crop as CropIcon, RotateCcw } from 'lucide-react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { loadImage, canvasToDataUrl } from '../../utils/idCardProcessor';

interface IdCardPhotoEditorProps {
  imageUrl: string;
  onSave: (editedDataUrl: string) => void;
  onCancel: () => void;
  targetWidth?: number;
  targetHeight?: number;
  className?: string;
}

export const IdCardPhotoEditor: React.FC<IdCardPhotoEditorProps> = ({
  imageUrl,
  onSave,
  onCancel,
  targetWidth = 300,
  targetHeight = 400,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [useBgColor, setUseBgColor] = useState(false);
  const [sourceImg, setSourceImg] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    loadImage(imageUrl).then(setSourceImg).catch(() => {});
  }, [imageUrl]);

  const renderPreview = useCallback(() => {
    if (!sourceImg || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d')!;

    // Background
    if (useBgColor) {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, targetWidth, targetHeight);
    }

    // Apply CSS filters
    const filters: string[] = [];
    if (brightness !== 0) filters.push(`brightness(${1 + brightness / 100})`);
    if (contrast !== 0) filters.push(`contrast(${1 + contrast / 100})`);
    ctx.filter = filters.length > 0 ? filters.join(' ') : 'none';

    // Fit image maintaining aspect ratio
    const imgAspect = sourceImg.width / sourceImg.height;
    const targetAspect = targetWidth / targetHeight;
    let drawW: number, drawH: number, drawX: number, drawY: number;

    if (imgAspect > targetAspect) {
      drawH = targetHeight;
      drawW = drawH * imgAspect;
      drawX = (targetWidth - drawW) / 2;
      drawY = 0;
    } else {
      drawW = targetWidth;
      drawH = drawW / imgAspect;
      drawX = 0;
      drawY = (targetHeight - drawH) / 2;
    }

    ctx.drawImage(sourceImg, drawX, drawY, drawW, drawH);
    ctx.filter = 'none';
  }, [sourceImg, brightness, contrast, bgColor, useBgColor, targetWidth, targetHeight]);

  useEffect(() => {
    renderPreview();
  }, [renderPreview]);

  const handleSave = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasToDataUrl(canvasRef.current, 'png');
    onSave(dataUrl);
  };

  const handleReset = () => {
    setBrightness(0);
    setContrast(0);
    setUseBgColor(false);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Preview */}
      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          className="rounded-xl border border-slate-700 shadow-lg max-w-full"
          style={{ maxHeight: '300px' }}
        />
      </div>

      {/* Controls */}
      <div className="space-y-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800/60">
        <div className="grid grid-cols-2 gap-3">
          <Input
            id="photo-brightness"
            label="Brightness"
            type="range"
            min={-50}
            max={50}
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
            leftIcon={<SunMedium className="w-3.5 h-3.5" />}
          />
          <Input
            id="photo-contrast"
            label="Contrast"
            type="range"
            min={-50}
            max={50}
            value={contrast}
            onChange={(e) => setContrast(Number(e.target.value))}
            leftIcon={<Contrast className="w-3.5 h-3.5" />}
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={useBgColor}
              onChange={(e) => setUseBgColor(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-slate-600 bg-slate-800 text-teal-500 focus:ring-teal-500/30"
            />
            <Paintbrush className="w-3.5 h-3.5 text-slate-400" />
            Background color
          </label>
          {useBgColor && (
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="w-8 h-8 rounded-lg border border-slate-700 cursor-pointer bg-transparent"
              aria-label="Background color picker"
            />
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={handleReset} leftIcon={<RotateCcw className="w-3.5 h-3.5" />}>
          Reset
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="gradient" size="sm" onClick={handleSave} leftIcon={<CropIcon className="w-3.5 h-3.5" />}>
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
};
