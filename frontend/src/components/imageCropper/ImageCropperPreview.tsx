import React, { useEffect, useRef } from 'react';
import { LoadedCropImage, CropState, applyCrop } from '../../utils/imageCropperProcessor';

interface Props {
  originalImage: LoadedCropImage;
  cropState: CropState;
}

export const ImageCropperPreview: React.FC<Props> = ({ originalImage, cropState }) => {
  const afterCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = afterCanvasRef.current;
    if (!canvas) return;

    // Render the cropped result
    try {
      const result = applyCrop(originalImage.img, cropState);

      // Scale down to fit the preview box (max 200 x 200)
      const MAX = 200;
      const scale = Math.min(MAX / result.width, MAX / result.height, 1);
      canvas.width  = Math.round(result.width  * scale);
      canvas.height = Math.round(result.height * scale);

      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Checkerboard background for transparency
      const tileSize = 8;
      for (let ty = 0; ty < canvas.height; ty += tileSize) {
        for (let tx = 0; tx < canvas.width; tx += tileSize) {
          const isLight = ((tx / tileSize + ty / tileSize) % 2 === 0);
          ctx.fillStyle = isLight ? '#e2e8f0' : '#cbd5e1';
          ctx.fillRect(tx, ty, tileSize, tileSize);
        }
      }

      ctx.drawImage(result, 0, 0, canvas.width, canvas.height);
    } catch {
      // Preview render errors are non-fatal
    }
  }, [originalImage, cropState]);

  const effW = (cropState.rotation === 90 || cropState.rotation === 270)
    ? originalImage.naturalHeight : originalImage.naturalWidth;
  const effH = (cropState.rotation === 90 || cropState.rotation === 270)
    ? originalImage.naturalWidth  : originalImage.naturalHeight;

  const cropW = Math.round((cropState.cropBox.w / 100) * effW);
  const cropH = Math.round((cropState.cropBox.h / 100) * effH);
  const outW  = cropState.customWidth  > 0 ? cropState.customWidth  : cropW;
  const outH  = cropState.customHeight > 0 ? cropState.customHeight : cropH;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Before */}
      <div className="rounded-2xl bg-slate-900/50 border border-slate-800 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-slate-500" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Before</p>
        </div>
        <div
          className="rounded-xl overflow-hidden flex items-center justify-center"
          style={{ minHeight: 120, background: 'repeating-conic-gradient(#334155 0% 25%, #1e293b 0% 50%) 0 0 / 16px 16px' }}
        >
          <img
            src={originalImage.dataUrl}
            alt="Original"
            className="max-w-full max-h-48 object-contain"
            style={{ imageRendering: 'auto' }}
          />
        </div>
        <p className="text-[10px] text-slate-500">
          {originalImage.naturalWidth} × {originalImage.naturalHeight} px
        </p>
      </div>

      {/* After */}
      <div className="rounded-2xl bg-slate-900/50 border border-slate-800 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <p className="text-xs font-bold text-blue-400 uppercase tracking-wider">After Crop</p>
        </div>
        <div
          className="rounded-xl overflow-hidden flex items-center justify-center"
          style={{ minHeight: 120, background: 'repeating-conic-gradient(#334155 0% 25%, #1e293b 0% 50%) 0 0 / 16px 16px' }}
        >
          <canvas
            ref={afterCanvasRef}
            className="max-w-full max-h-48"
            aria-label="Cropped image preview"
            style={{ imageRendering: 'auto' }}
          />
        </div>
        <p className="text-[10px] text-slate-500">
          Output: {outW} × {outH} px
          {cropState.paddingEnabled ? ` (+${cropState.paddingSize}px padding)` : ''}
          {cropState.circleCrop ? ' · Circle' : ''}
          {cropState.cornerRadius > 0 ? ` · ${cropState.cornerRadius}px radius` : ''}
          {' · '}{cropState.outputFormat.toUpperCase()}
        </p>
      </div>
    </div>
  );
};
