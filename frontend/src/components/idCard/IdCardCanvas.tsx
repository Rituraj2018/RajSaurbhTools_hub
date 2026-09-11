import React, { useRef, useEffect, useState } from 'react';
import { Move, ZoomIn, ZoomOut } from 'lucide-react';
import {
  CardData,
  renderCardToCanvas,
} from '../../utils/idCardProcessor';

interface IdCardCanvasProps {
  cardData: CardData;
  scale?: number;
  showGrid?: boolean;
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
  className?: string;
}

export const IdCardCanvas: React.FC<IdCardCanvasProps> = ({
  cardData,
  scale = 0.5,
  showGrid = false,
  onCanvasReady,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [rendering, setRendering] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const render = async () => {
      setRendering(true);
      try {
        const rendered = await renderCardToCanvas(cardData, scale);
        if (cancelled) return;
        
        const displayCanvas = canvasRef.current;
        if (!displayCanvas) return;

        displayCanvas.width = rendered.width;
        displayCanvas.height = rendered.height;
        const ctx = displayCanvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, displayCanvas.width, displayCanvas.height);
        ctx.drawImage(rendered, 0, 0);

        if (showGrid) {
          ctx.strokeStyle = 'rgba(59, 130, 246, 0.2)';
          ctx.lineWidth = 1;
          const step = Math.round(rendered.width / 10);
          for (let x = step; x < rendered.width; x += step) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, rendered.height);
            ctx.stroke();
          }
          for (let y = step; y < rendered.height; y += step) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(rendered.width, y);
            ctx.stroke();
          }
        }

        onCanvasReady?.(rendered);
      } catch (err) {
        console.error('Card render error:', err);
      } finally {
        if (!cancelled) setRendering(false);
      }
    };
    render();
    return () => { cancelled = true; };
  }, [cardData, scale, showGrid, onCanvasReady]);

  return (
    <div className={`relative ${className}`}>
      {/* Zoom controls */}
      <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
        <button
          type="button"
          onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}
          className="p-1.5 rounded-lg bg-slate-800/90 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          aria-label="Zoom out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <span className="text-[10px] font-mono text-slate-400 px-1 min-w-[3rem] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={() => setZoom(z => Math.min(3, z + 0.25))}
          className="p-1.5 rounded-lg bg-slate-800/90 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          aria-label="Zoom in"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Canvas container */}
      <div
        ref={containerRef}
        className="overflow-auto rounded-xl bg-slate-950/60 border border-slate-800/60 p-4 flex items-center justify-center min-h-[200px]"
        style={{ maxHeight: '500px' }}
      >
        {rendering && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/50 z-10 rounded-xl">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Move className="w-4 h-4 animate-pulse" />
              <span>Rendering...</span>
            </div>
          </div>
        )}
        <canvas
          ref={canvasRef}
          className="shadow-lg rounded"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center',
            transition: 'transform 0.2s ease',
            imageRendering: zoom > 1.5 ? 'pixelated' : 'auto',
          }}
        />
      </div>
    </div>
  );
};
