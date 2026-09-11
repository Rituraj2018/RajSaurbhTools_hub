import React, { useRef, useEffect, useState } from 'react';
import { LayoutGrid, Settings } from 'lucide-react';
import { Input } from '../common/Input';
import {
  calculateSheetLayout,
  renderSheetFromImages,
  SheetLayoutOptions,
  CR80_WIDTH_PX,
  CR80_HEIGHT_PX,
} from '../../utils/idCardProcessor';

interface IdCardSheetLayoutProps {
  cardImages: string[]; // array of dataURLs
  cardWidthPx?: number;
  cardHeightPx?: number;
  onSheetReady?: (canvas: HTMLCanvasElement, layout: SheetLayoutOptions) => void;
  className?: string;
}

export const IdCardSheetLayout: React.FC<IdCardSheetLayoutProps> = ({
  cardImages,
  cardWidthPx = CR80_WIDTH_PX,
  cardHeightPx = CR80_HEIGHT_PX,
  onSheetReady,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [marginMm, setMarginMm] = useState(10);
  const [spacingMm, setSpacingMm] = useState(3);
  const [rendering, setRendering] = useState(false);
  const [layout, setLayout] = useState<SheetLayoutOptions | null>(null);

  useEffect(() => {
    if (cardImages.length === 0) return;

    let cancelled = false;
    const render = async () => {
      setRendering(true);
      try {
        const lo = calculateSheetLayout(cardWidthPx, cardHeightPx, marginMm, spacingMm);
        setLayout(lo);

        const sheetCanvas = await renderSheetFromImages(cardImages, lo);
        if (cancelled) return;

        const display = canvasRef.current;
        if (display) {
          display.width = sheetCanvas.width;
          display.height = sheetCanvas.height;
          display.getContext('2d')!.drawImage(sheetCanvas, 0, 0);
        }

        onSheetReady?.(sheetCanvas, lo);
      } catch (err) {
        console.error('Sheet render error:', err);
      } finally {
        if (!cancelled) setRendering(false);
      }
    };
    render();
    return () => { cancelled = true; };
  }, [cardImages, cardWidthPx, cardHeightPx, marginMm, spacingMm, onSheetReady]);

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-sm font-bold text-white flex items-center gap-2">
        <LayoutGrid className="w-4 h-4 text-teal-400" />
        A4 Sheet Layout
        {layout && (
          <span className="text-[10px] font-normal text-slate-400">
            ({layout.cols} × {layout.rows} = {layout.cols * layout.rows} cards/page)
          </span>
        )}
      </h3>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-3">
        <Input
          id="sheet-margin"
          label="Margin (mm)"
          type="number"
          min={0}
          max={30}
          value={marginMm}
          onChange={(e) => setMarginMm(Number(e.target.value) || 0)}
          leftIcon={<Settings className="w-3.5 h-3.5" />}
        />
        <Input
          id="sheet-spacing"
          label="Spacing (mm)"
          type="number"
          min={0}
          max={20}
          value={spacingMm}
          onChange={(e) => setSpacingMm(Number(e.target.value) || 0)}
          leftIcon={<Settings className="w-3.5 h-3.5" />}
        />
      </div>

      {/* Sheet Preview */}
      <div className="relative rounded-xl bg-slate-950/60 border border-slate-800/60 p-4 flex items-center justify-center overflow-auto" style={{ maxHeight: '500px' }}>
        {rendering && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/50 z-10 rounded-xl">
            <div className="w-5 h-5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {cardImages.length > 0 ? (
          <canvas
            ref={canvasRef}
            className="shadow-xl rounded max-w-full"
            style={{ maxHeight: '460px' }}
          />
        ) : (
          <div className="py-12 text-center">
            <LayoutGrid className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-500">Upload card images to see the sheet layout</p>
          </div>
        )}
      </div>
    </div>
  );
};
