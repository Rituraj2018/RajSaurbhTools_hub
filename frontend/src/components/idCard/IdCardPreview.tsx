import React, { useRef, useEffect, useState } from 'react';
import { Eye, RotateCw, Maximize } from 'lucide-react';
import { CardData, renderCardToCanvas } from '../../utils/idCardProcessor';

interface IdCardPreviewProps {
  cardData: CardData;
  backCardData?: CardData;
  showActualSize?: boolean;
  className?: string;
}

export const IdCardPreview: React.FC<IdCardPreviewProps> = ({
  cardData,
  backCardData,
  showActualSize = false,
  className = '',
}) => {
  const frontCanvasRef = useRef<HTMLCanvasElement>(null);
  const backCanvasRef = useRef<HTMLCanvasElement>(null);
  const [showBack, setShowBack] = useState(false);
  const [rendering, setRendering] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const render = async () => {
      setRendering(true);
      try {
        // Render front
        const frontScale = showActualSize ? 1 : 0.6;
        const frontCanvas = await renderCardToCanvas(cardData, frontScale);
        if (cancelled) return;
        const fc = frontCanvasRef.current;
        if (fc) {
          fc.width = frontCanvas.width;
          fc.height = frontCanvas.height;
          fc.getContext('2d')!.drawImage(frontCanvas, 0, 0);
        }

        // Render back if available
        if (backCardData) {
          const backCanvas = await renderCardToCanvas(backCardData, frontScale);
          if (cancelled) return;
          const bc = backCanvasRef.current;
          if (bc) {
            bc.width = backCanvas.width;
            bc.height = backCanvas.height;
            bc.getContext('2d')!.drawImage(backCanvas, 0, 0);
          }
        }
      } catch (err) {
        console.error('Preview render error:', err);
      } finally {
        if (!cancelled) setRendering(false);
      }
    };
    render();
    return () => { cancelled = true; };
  }, [cardData, backCardData, showActualSize]);

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Eye className="w-4 h-4 text-teal-400" />
          Card Preview
          {showActualSize && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
              Actual Size
            </span>
          )}
        </h3>
        {backCardData && (
          <button
            type="button"
            onClick={() => setShowBack(!showBack)}
            className="flex items-center gap-1.5 text-[11px] font-medium text-slate-300 hover:text-white transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
            {showBack ? 'Show Front' : 'Show Back'}
          </button>
        )}
      </div>

      <div className="relative rounded-xl bg-slate-950/60 border border-slate-800/60 p-6 flex items-center justify-center overflow-auto min-h-[180px]">
        {rendering && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/50 z-10 rounded-xl">
            <div className="w-5 h-5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        
        <canvas
          ref={showBack && backCardData ? backCanvasRef : frontCanvasRef}
          className="shadow-xl rounded-lg max-w-full"
          style={{
            maxHeight: showActualSize ? 'none' : '320px',
          }}
        />

        {/* Hidden back canvas for rendering */}
        {backCardData && (
          <canvas ref={backCanvasRef} className="hidden" />
        )}
      </div>

      <div className="flex items-center gap-3 text-[10px] text-slate-500">
        <span className="flex items-center gap-1">
          <Maximize className="w-3 h-3" />
          {cardData.dimensions.widthMm} × {cardData.dimensions.heightMm} mm
        </span>
        <span>
          {cardData.dimensions.widthPx} × {cardData.dimensions.heightPx} px
        </span>
        <span>{cardData.dimensions.dpi} DPI</span>
      </div>
    </div>
  );
};
