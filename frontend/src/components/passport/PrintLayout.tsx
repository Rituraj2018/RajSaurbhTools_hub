import React from 'react';
import {
  FileSpreadsheet,
  Copy,
  Scissors,
  Square,
  LayoutGrid,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Crosshair,
  RotateCcw,
  Move,
  CheckCircle2,
  Info,
  Minus,
  Plus,
  Sliders,
} from 'lucide-react';
import {
  PaperSize,
  PhotoCopies,
  ColumnsMode,
  SheetOptions,
  calculatePrintGrid,
  PAPER_SPECS,
} from '../../utils/passportProcessor';

export interface PrintLayoutProps {
  options: SheetOptions;
  onChange: (options: SheetOptions) => void;
  photoPosition: { x: number; y: number };
  onPhotoPositionChange: (pos: { x: number; y: number }) => void;
}

export const PrintLayout: React.FC<PrintLayoutProps> = ({
  options,
  onChange,
  photoPosition,
  onPhotoPositionChange,
}) => {
  // --- Photo Group Step Size (px at 300 DPI: ~10mm per click) ---
  const STEP = Math.round(11.811 * 10); // ≈118px = 10mm

  // Compute boundary limits from the current grid so we never move outside the sheet
  const getClampedPosition = (dx: number, dy: number): { x: number; y: number } => {
    const grid = calculatePrintGrid(
      options.paperSize,
      options.copies,
      options.landscape,
      options.columnsMode
    );
    const totalGridWidth = grid.cols * grid.photoWidthPx + (grid.cols - 1) * grid.gapXPx;
    const totalGridHeight = grid.rows * grid.photoHeightPx + (grid.rows - 1) * grid.gapYPx;

    const minX = -grid.startX;
    const maxX = grid.sheetWidthPx - grid.startX - totalGridWidth;
    const minY = -grid.startY;
    const maxY = grid.sheetHeightPx - grid.startY - totalGridHeight;

    return {
      x: Math.round(Math.min(maxX, Math.max(minX, photoPosition.x + dx))),
      y: Math.round(Math.min(maxY, Math.max(minY, photoPosition.y + dy))),
    };
  };

  const moveUp    = () => onPhotoPositionChange(getClampedPosition(0, -STEP));
  const moveDown  = () => onPhotoPositionChange(getClampedPosition(0, +STEP));
  const moveLeft  = () => onPhotoPositionChange(getClampedPosition(-STEP, 0));
  const moveRight = () => onPhotoPositionChange(getClampedPosition(+STEP, 0));

  // CENTER: move photo group to the visual center of the sheet
  const moveCenter = () => {
    const grid = calculatePrintGrid(
      options.paperSize,
      options.copies,
      options.landscape,
      options.columnsMode
    );
    const totalGridWidth = grid.cols * grid.photoWidthPx + (grid.cols - 1) * grid.gapXPx;
    const totalGridHeight = grid.rows * grid.photoHeightPx + (grid.rows - 1) * grid.gapYPx;
    // The centered startX/Y that would place the grid in the middle of the sheet
    const centeredStartX = Math.round((grid.sheetWidthPx - totalGridWidth) / 2);
    const centeredStartY = Math.round((grid.sheetHeightPx - totalGridHeight) / 2);
    // Offset from the current grid.startX/Y to the centered position
    onPhotoPositionChange({
      x: centeredStartX - grid.startX,
      y: centeredStartY - grid.startY,
    });
  };

  // RESET: restore the default top-left position (offset = 0)
  const resetPosition = () => onPhotoPositionChange({ x: 0, y: 0 });

  const paperList: { size: PaperSize; label: string; dim: string; desc: string; max: number }[] = [
    { size: 'A4', label: 'A4 Paper', dim: '210 × 297 mm', desc: '1 to 30 photos (Standard Sheet)', max: 30 },
    { size: '4x6', label: '4 × 6 Inch', dim: '102 × 152 mm', desc: 'Up to 8 photos (2 × 4 card)', max: 8 },
    { size: '5x7', label: '5 × 7 Inch', dim: '127 × 178 mm', desc: 'Up to 10 photos (2 × 5 card)', max: 10 },
    { size: '6x8', label: '6 × 8 Inch', dim: '152 × 203 mm', desc: 'Up to 12 photos (3 × 4 card)', max: 12 },
    { size: '8x10', label: '8 × 10 Inch', dim: '203 × 254 mm', desc: 'Up to 20 photos (4 × 5 sheet)', max: 20 },
  ];

  const currentPaperConfig = paperList.find((p) => p.size === options.paperSize) || paperList[0];
  const maxCopies = currentPaperConfig.max;
  const currentCopies = Math.min(maxCopies, Math.max(1, options.copies || 1));

  // Current active calculated grid
  const grid = calculatePrintGrid(
    options.paperSize,
    currentCopies,
    options.landscape,
    options.columnsMode
  );

  const handlePaperSizeChange = (paperSize: PaperSize) => {
    const paperTarget = paperList.find((p) => p.size === paperSize) || paperList[0];
    onChange({
      ...options,
      paperSize,
      copies: Math.min(paperTarget.max, options.copies),
    });
  };

  const handleCopiesChange = (copies: PhotoCopies) => {
    const clamped = Math.min(maxCopies, Math.max(1, copies));
    onChange({
      ...options,
      copies: clamped,
    });
  };

  const handleColumnsModeChange = (columnsMode: ColumnsMode) => {
    onChange({
      ...options,
      columnsMode,
    });
  };

  const handleToggleGuides = () => {
    onChange({
      ...options,
      showCuttingGuides: !options.showCuttingGuides,
    });
  };

  const handleToggleBorder = () => {
    onChange({
      ...options,
      showBorder: !options.showBorder,
    });
  };

  const recommendedPresets = [
    { count: 6, label: '6 (2×3)' },
    { count: 8, label: '8 (2×4)' },
    { count: 10, label: '10 (2×5)' },
    { count: 12, label: '12 (3×4)' },
    { count: 13, label: '13 (5 cols)' },
    { count: 15, label: '15 (3×5)' },
    { count: 20, label: '20 (4×5)' },
    { count: 24, label: '24 (4×6)' },
    { count: 30, label: '30 (5×6 Full)' },
  ];

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <LayoutGrid className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Print Sheet Layout</h3>
            <p className="text-[11px] text-slate-400">Configure paper size, 1–30 copy count, and auto layout</p>
          </div>
        </div>
      </div>

      {/* 1. Paper Size Selector (A4, 4x6, 5x7, 6x8, 8x10) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
            <span>Paper Size Options</span>
          </label>
          <span className="text-[10px] text-slate-500 font-mono">
            {PAPER_SPECS[options.paperSize]?.widthMm} × {PAPER_SPECS[options.paperSize]?.heightMm} mm
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {paperList.map((paper) => {
            const isSelected = options.paperSize === paper.size;
            return (
              <button
                key={paper.size}
                type="button"
                onClick={() => handlePaperSizeChange(paper.size)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500'
                    : 'border-slate-800/80 bg-slate-950/60 hover:bg-slate-950 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white">{paper.label}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                    {paper.dim}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  {paper.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Photo Count (1 to maxCopies with row-by-row filling) */}
      <div className="space-y-4 pt-1">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Copy className="w-3.5 h-3.5 text-purple-400" />
            <span>Photo Count (1 to {maxCopies})</span>
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300">
              {currentCopies} {currentCopies === 1 ? 'Photo' : 'Photos'}
              {` • ${grid.cols} cols × ${grid.rows} rows`}
            </span>
          </div>
        </div>

        {/* Stepper + Slider Control Box */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 space-y-3.5 shadow-inner">
          <div className="flex items-center justify-between gap-3">
            {/* Decrement Button */}
            <button
              type="button"
              disabled={currentCopies <= 1}
              onClick={() => handleCopiesChange(currentCopies - 1)}
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-900 border border-slate-700 hover:bg-slate-800 hover:border-purple-500/50 text-white disabled:opacity-40 disabled:hover:border-slate-700 disabled:cursor-not-allowed transition-all active:scale-95 shrink-0"
              title="Decrease by 1"
            >
              <Minus className="w-4 h-4" />
            </button>

            {/* Slider with Live Fill */}
            <div className="flex-1 space-y-1">
              <input
                type="range"
                min={1}
                max={maxCopies}
                step={1}
                value={currentCopies}
                onChange={(e) => handleCopiesChange(Number(e.target.value))}
                className="w-full accent-purple-500 h-2.5 bg-slate-800 rounded-lg cursor-pointer transition-all"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>1 photo</span>
                {maxCopies >= 20 && <span>12</span>}
                {maxCopies >= 24 && <span>24</span>}
                <span>{maxCopies} max</span>
              </div>
            </div>

            {/* Increment Button */}
            <button
              type="button"
              disabled={currentCopies >= maxCopies}
              onClick={() => handleCopiesChange(currentCopies + 1)}
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-900 border border-slate-700 hover:bg-slate-800 hover:border-purple-500/50 text-white disabled:opacity-40 disabled:hover:border-slate-700 disabled:cursor-not-allowed transition-all active:scale-95 shrink-0"
              title="Increase by 1"
            >
              <Plus className="w-4 h-4" />
            </button>

            {/* Direct Numeric Input */}
            <div className="relative w-16 shrink-0">
              <input
                type="number"
                min={1}
                max={maxCopies}
                value={currentCopies}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val)) handleCopiesChange(val);
                }}
                className="w-full py-2 px-1 text-center font-bold text-sm bg-slate-900 border border-purple-500/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Columns Arrangement Mode Selector */}
          <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-slate-800/60">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
              <Sliders className="w-3.5 h-3.5 text-purple-400" />
              <span>Columns Layout:</span>
            </div>
            <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl">
              {[
                { id: 'auto', label: `Auto (${grid.cols} per row)` },
                { id: 5, label: '5 Cols' },
                { id: 4, label: '4 Cols' },
                { id: 3, label: '3 Cols' },
                { id: 2, label: '2 Cols' },
              ].map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => handleColumnsModeChange(mode.id as ColumnsMode)}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
                    (options.columnsMode || 'auto') === mode.id
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Row-by-Row Fill Visualizer (adapts to current grid cols/rows) */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-medium">
                Automatic Row-by-Row Filling ({grid.cols} per row):
              </span>
              <span className="text-slate-300 font-mono">
                {Math.floor(currentCopies / grid.cols)} full {Math.floor(currentCopies / grid.cols) === 1 ? 'row' : 'rows'}
                {currentCopies % grid.cols > 0 ? ` + ${currentCopies % grid.cols} on row ${Math.ceil(currentCopies / grid.cols)}` : ''}
              </span>
            </div>

            {/* Dynamic Rows × Cols Slot Visualizer */}
            <div className="space-y-1.5 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60 max-h-48 overflow-y-auto">
              {Array.from({ length: grid.rows }).map((_, rowIndex) => {
                const rowStart = rowIndex * grid.cols + 1;
                const rowEnd = rowStart + grid.cols - 1;
                const isRowFilled = currentCopies >= rowEnd;
                const isRowPartial = currentCopies >= rowStart && currentCopies < rowEnd;

                return (
                  <div key={rowIndex} className="flex items-center gap-2">
                    <span className="w-16 text-[10px] text-slate-400 font-mono shrink-0">
                      Row {rowIndex + 1} ({rowStart}–{rowEnd})
                    </span>
                    <div
                      className="gap-1.5 flex-1 grid"
                      style={{ gridTemplateColumns: `repeat(${grid.cols}, minmax(0, 1fr))` }}
                    >
                      {Array.from({ length: grid.cols }).map((_, colIndex) => {
                        const slotNumber = rowIndex * grid.cols + colIndex + 1;
                        if (slotNumber > maxCopies) return null;
                        const isSlotFilled = slotNumber <= currentCopies;

                        return (
                          <button
                            key={colIndex}
                            type="button"
                            onClick={() => handleCopiesChange(slotNumber)}
                            title={`Set to ${slotNumber} photos (Row ${rowIndex + 1}, Col ${colIndex + 1})`}
                            className={`h-5 rounded-md text-[9px] font-bold transition-all flex items-center justify-center ${
                              isSlotFilled
                                ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/40 hover:bg-purple-500'
                                : 'bg-slate-950/80 border border-slate-800 text-slate-500 hover:border-purple-500/40 hover:text-slate-300'
                            }`}
                          >
                            {slotNumber}
                          </button>
                        );
                      })}
                    </div>
                    <span className="w-10 text-[9px] text-right shrink-0 font-medium">
                      {isRowFilled ? (
                        <span className="text-emerald-400">Full</span>
                      ) : isRowPartial ? (
                        <span className="text-purple-300">+{currentCopies % grid.cols}</span>
                      ) : (
                        <span className="text-slate-600">Empty</span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Preset Buttons (Matching the Recommended Table) */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] text-slate-400 block font-medium">
              Recommended Layout Presets (Count & Format):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {recommendedPresets
                .filter((p) => p.count <= maxCopies)
                .map((preset) => {
                  const isSelected = currentCopies === preset.count;
                  return (
                    <button
                      key={preset.count}
                      type="button"
                      onClick={() => handleCopiesChange(preset.count)}
                      className={`h-7 px-2.5 rounded-lg text-xs font-bold border transition-all ${
                        isSelected
                          ? 'bg-purple-600 border-purple-500 text-white shadow-sm shadow-purple-600/30'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-purple-500/40 hover:text-white'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Layout Specifications & Diagram Summary Reference */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-950/40 to-slate-900 border border-blue-500/30 space-y-3 text-slate-200 shadow-inner">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="text-xs font-bold text-blue-200 uppercase tracking-wide">
              Passport Photo Printing Layout (Exact Specifications)
            </span>
          </div>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
            {grid.cols} Cols × {grid.rows} Rows • {currentCopies} Photos
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-slate-950/70 p-3 rounded-xl border border-slate-800">
          <div>
            <span className="text-slate-400 block text-[10px]">Photo Size</span>
            <span className="font-bold text-white">35 mm × 45 mm</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Current Layout</span>
            <span className="font-bold text-purple-300">
              {grid.cols} per row • {grid.rows} rows
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Gaps (H / V)</span>
            <span className="font-bold text-white">5 mm / 5 mm</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Paper Size</span>
            <span className="font-bold text-white">{PAPER_SPECS[options.paperSize]?.name || options.paperSize}</span>
          </div>
        </div>

        {/* Summary Reference Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/40">
          <table className="w-full text-[10px] text-left border-collapse">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800/80 bg-slate-900/50">
                <th className="py-1.5 px-2.5">Photos</th>
                <th className="py-1.5 px-2.5">Rows × Columns</th>
                <th className="py-1.5 px-2.5">Paper Size (Recommended)</th>
              </tr>
            </thead>
            <tbody className="text-slate-300 divide-y divide-slate-800/40">
              <tr className={currentCopies === 6 ? 'text-purple-300 font-bold bg-purple-500/10' : ''}>
                <td className="py-1 px-2.5">6</td>
                <td className="py-1 px-2.5">3 × 2</td>
                <td className="py-1 px-2.5">4 × 6 inch / A4</td>
              </tr>
              <tr className={currentCopies === 8 ? 'text-purple-300 font-bold bg-purple-500/10' : ''}>
                <td className="py-1 px-2.5">8</td>
                <td className="py-1 px-2.5">4 × 2</td>
                <td className="py-1 px-2.5">4 × 6 inch</td>
              </tr>
              <tr className={currentCopies === 10 ? 'text-purple-300 font-bold bg-purple-500/10' : ''}>
                <td className="py-1 px-2.5">10</td>
                <td className="py-1 px-2.5">5 × 2</td>
                <td className="py-1 px-2.5">5 × 7 inch</td>
              </tr>
              <tr className={currentCopies === 12 ? 'text-purple-300 font-bold bg-purple-500/10' : ''}>
                <td className="py-1 px-2.5">12</td>
                <td className="py-1 px-2.5">4 × 3</td>
                <td className="py-1 px-2.5">A4 / 6 × 8 inch</td>
              </tr>
              <tr className={currentCopies === 15 ? 'text-purple-300 font-bold bg-purple-500/10' : ''}>
                <td className="py-1 px-2.5">15</td>
                <td className="py-1 px-2.5">5 × 3</td>
                <td className="py-1 px-2.5">A4</td>
              </tr>
              <tr className={currentCopies === 20 ? 'text-purple-300 font-bold bg-purple-500/10' : ''}>
                <td className="py-1 px-2.5">20</td>
                <td className="py-1 px-2.5">5 × 4</td>
                <td className="py-1 px-2.5">A4 / 8 × 10 inch</td>
              </tr>
              <tr className={currentCopies === 24 ? 'text-purple-300 font-bold bg-purple-500/10' : ''}>
                <td className="py-1 px-2.5">24</td>
                <td className="py-1 px-2.5">6 × 4</td>
                <td className="py-1 px-2.5">A4</td>
              </tr>
              <tr className={currentCopies === 30 ? 'text-purple-300 font-bold bg-purple-500/10' : ''}>
                <td className="py-1 px-2.5">30</td>
                <td className="py-1 px-2.5">6 × 5</td>
                <td className="py-1 px-2.5">A4 (Standard Full Sheet)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-snug space-y-1">
            <div>
              <span className="font-bold text-amber-300 uppercase tracking-wide mr-1.5 text-[11px]">
                Important Note:
              </span>
              <span className="text-[11px] text-amber-100/90">
                Printer settings me <strong>'Actual Size'</strong> ya <strong>'100% Scale'</strong> select karein to size sahi rahega.
              </span>
            </div>
            <p className="text-[10px] text-amber-200/70">
              Fitting 36 photos (35×45 mm) onto an A4 sheet with proper cutting gaps is not practical. 30 photos (5 × 6) is the optimal maximum.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Toggles: Cutting Guides & Border */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Cutting Guides */}
        <button
          type="button"
          onClick={handleToggleGuides}
          className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
            options.showCuttingGuides
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Scissors className="w-4 h-4 text-emerald-400" />
            <div>
              <p className="text-xs font-bold text-white">Cutting Guides</p>
              <p className="text-[10px] text-slate-400">Scissor alignment marks</p>
            </div>
          </div>
          <span
            className={`w-3.5 h-3.5 rounded-full border ${
              options.showCuttingGuides
                ? 'bg-emerald-500 border-emerald-400'
                : 'border-slate-700'
            }`}
          />
        </button>

        {/* Photo Border */}
        <button
          type="button"
          onClick={handleToggleBorder}
          className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
            options.showBorder
              ? 'bg-blue-500/10 border-blue-500/40 text-blue-300'
              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Square className="w-4 h-4 text-blue-400" />
            <div>
              <p className="text-xs font-bold text-white">Outline Border</p>
              <p className="text-[10px] text-slate-400">1px photo bounding line</p>
            </div>
          </div>
          <span
            className={`w-3.5 h-3.5 rounded-full border ${
              options.showBorder ? 'bg-blue-500 border-blue-400' : 'border-slate-700'
            }`}
          />
        </button>
      </div>

      {/* 4. Photo Position Controls */}
      <div className="space-y-3 pt-2 border-t border-slate-800/60">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Move className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white tracking-tight">Photo Position</h4>
            <p className="text-[11px] text-slate-400">Move the photo group on the A4 page</p>
          </div>
        </div>

        {/* D-Pad Grid */}
        <div className="flex flex-col items-center gap-1.5">
          {/* Up */}
          <button
            type="button"
            onClick={moveUp}
            title="Move Up"
            className="flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 border border-slate-700 text-slate-200 hover:bg-slate-800 hover:border-amber-500/50 hover:text-amber-300 transition-all active:scale-95"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            UP
          </button>

          {/* Middle row: LEFT · CENTER · RIGHT */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={moveLeft}
              title="Move Left"
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 border border-slate-700 text-slate-200 hover:bg-slate-800 hover:border-amber-500/50 hover:text-amber-300 transition-all active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              LEFT
            </button>

            <button
              type="button"
              onClick={moveCenter}
              title="Center the photo group"
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-500/10 border border-amber-500/40 text-amber-300 hover:bg-amber-500/20 transition-all active:scale-95"
            >
              <Crosshair className="w-3.5 h-3.5" />
              CENTER
            </button>

            <button
              type="button"
              onClick={moveRight}
              title="Move Right"
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 border border-slate-700 text-slate-200 hover:bg-slate-800 hover:border-amber-500/50 hover:text-amber-300 transition-all active:scale-95"
            >
              RIGHT
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Down */}
          <button
            type="button"
            onClick={moveDown}
            title="Move Down"
            className="flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 border border-slate-700 text-slate-200 hover:bg-slate-800 hover:border-amber-500/50 hover:text-amber-300 transition-all active:scale-95"
          >
            DOWN
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Position display + Reset */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] font-mono text-slate-500">
            Offset: x={photoPosition.x}px, y={photoPosition.y}px
          </span>
          <button
            type="button"
            onClick={resetPosition}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-slate-900 border border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white transition-all active:scale-95"
          >
            <RotateCcw className="w-3 h-3" />
            Reset Position
          </button>
        </div>
      </div>
    </div>
  );
};
