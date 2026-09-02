import React, { useState } from 'react';
import {
  FileText,
  Trash2,
  ChevronUp,
  ChevronDown,
  ArrowUpToLine,
  ArrowDownToLine,
  ArrowUpDown,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { PdfFileItem } from '../../utils/pdfMergeProcessor';
import { Button } from '../common/Button';

export interface PdfFileListProps {
  files: PdfFileItem[];
  onReorder: (newFiles: PdfFileItem[]) => void;
  onRemove: (id: string) => void;
  onClearAll: () => void;
}

export const PdfFileList: React.FC<PdfFileListProps> = ({
  files,
  onReorder,
  onRemove,
  onClearAll,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const moveItem = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= files.length) return;
    const updated = [...files];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    onReorder(updated);
  };

  const moveToStart = (index: number) => {
    moveItem(index, 0);
  };

  const moveToEnd = (index: number) => {
    moveItem(index, files.length - 1);
  };

  const reverseOrder = () => {
    onReorder([...files].reverse());
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    moveItem(draggedIndex, index);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (files.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Top Toolbar: Batch Actions */}
      <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            PDF Merge Sequence ({files.length} Files)
          </span>
          <span className="text-[11px] text-slate-400">
            • Files will be merged in this exact order
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={reverseOrder}
            leftIcon={<ArrowUpDown className="w-3.5 h-3.5" />}
          >
            Reverse Order
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Clear All
          </Button>
        </div>
      </div>

      {/* Reorderable PDF Cards List */}
      <div className="space-y-3">
        {files.map((item, index) => {
          const isInvalid = !!item.error;

          return (
            <div
              key={item.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`group relative p-4 rounded-2xl border transition-all duration-200 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-grab active:cursor-grabbing ${
                draggedIndex === index
                  ? 'border-blue-500 bg-blue-500/10 opacity-70 scale-[0.99]'
                  : isInvalid
                  ? 'bg-rose-950/20 border-rose-500/30'
                  : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              {/* Left Side: Number Pill, PDF Icon & Details */}
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                {/* Sequence Number */}
                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-bold font-mono text-blue-400 shrink-0">
                  {index + 1}
                </div>

                {/* PDF Document Icon */}
                <div
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                    isInvalid
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                      : 'bg-red-500/10 border-red-500/20 text-red-400'
                  }`}
                >
                  <FileText className="w-5 h-5" />
                </div>

                {/* Name & Page / Size Badges */}
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white truncate max-w-sm" title={item.name}>
                      {item.name}
                    </p>
                    {!isInvalid && (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    )}
                  </div>

                  {isInvalid ? (
                    <div className="flex items-center gap-1.5 text-xs text-rose-400">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{item.error}</span>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 font-mono">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                        {item.pageCount} {item.pageCount === 1 ? 'Page' : 'Pages'}
                      </span>
                      <span>•</span>
                      <span>{formatFileSize(item.size)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side: Reordering Controls & Delete Action */}
              <div className="flex items-center gap-1.5 justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
                {/* Move to Top */}
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => moveToStart(index)}
                  className="p-1.5 rounded-lg bg-slate-950/60 hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                  title="Move to first position"
                >
                  <ArrowUpToLine className="w-4 h-4" />
                </button>

                {/* Move Up */}
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => moveItem(index, index - 1)}
                  className="p-1.5 rounded-lg bg-slate-950/60 hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                  title="Move up one position"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>

                {/* Move Down */}
                <button
                  type="button"
                  disabled={index === files.length - 1}
                  onClick={() => moveItem(index, index + 1)}
                  className="p-1.5 rounded-lg bg-slate-950/60 hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                  title="Move down one position"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>

                {/* Move to Bottom */}
                <button
                  type="button"
                  disabled={index === files.length - 1}
                  onClick={() => moveToEnd(index)}
                  className="p-1.5 rounded-lg bg-slate-950/60 hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                  title="Move to last position"
                >
                  <ArrowDownToLine className="w-4 h-4" />
                </button>

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => onRemove(item.id)}
                  className="p-1.5 rounded-lg bg-slate-950/60 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors ml-1"
                  title="Remove this PDF"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
