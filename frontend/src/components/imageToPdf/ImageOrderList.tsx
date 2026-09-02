import React, { useState } from 'react';
import {
  Trash2,
  RotateCw,
  ChevronUp,
  ChevronDown,
  ArrowUpToLine,
  ArrowDownToLine,
  ArrowUpDown,
  Maximize2,
  FileImage,
} from 'lucide-react';
import { ImageFileItem } from '../../utils/imageToPdfProcessor';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';

export interface ImageOrderListProps {
  images: ImageFileItem[];
  onReorder: (newImages: ImageFileItem[]) => void;
  onRemove: (id: string) => void;
  onRotate: (id: string) => void;
  onClearAll: () => void;
}

export const ImageOrderList: React.FC<ImageOrderListProps> = ({
  images,
  onReorder,
  onRemove,
  onRotate,
  onClearAll,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [previewItem, setPreviewItem] = useState<ImageFileItem | null>(null);

  // Move operations
  const moveItem = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length) return;
    const updated = [...images];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    onReorder(updated);
  };

  const moveToStart = (index: number) => {
    moveItem(index, 0);
  };

  const moveToEnd = (index: number) => {
    moveItem(index, images.length - 1);
  };

  const reverseOrder = () => {
    onReorder([...images].reverse());
  };

  const rotateAll = () => {
    const updated = images.map((item) => ({
      ...item,
      rotation: (item.rotation + 90) % 360,
    }));
    onReorder(updated);
  };

  // Drag and drop HTML5 reorder
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

  if (images.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Top Toolbar: Batch Actions */}
      <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Document Pages Queue ({images.length})
          </span>
          <span className="text-[11px] text-slate-400">
            • Drag cards or use arrows to reorder pages
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={reverseOrder}
            leftIcon={<ArrowUpDown className="w-3.5 h-3.5" />}
          >
            Reverse
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={rotateAll}
            leftIcon={<RotateCw className="w-3.5 h-3.5" />}
          >
            Rotate All
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

      {/* Reorderable Image Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((item, index) => {
          return (
            <div
              key={item.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`group relative p-4 rounded-2xl bg-slate-900/90 border transition-all duration-200 shadow-lg flex flex-col justify-between ${
                draggedIndex === index
                  ? 'border-blue-500 bg-blue-500/10 opacity-75 scale-[0.98]'
                  : 'border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              {/* Header: Page Badge & Drag Handle */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-bold font-mono">
                    {index + 1}
                  </span>
                  <span className="text-xs font-bold text-white truncate max-w-[140px]" title={item.name}>
                    {item.name}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPreviewItem(item)}
                    className="p-1.5 rounded-lg bg-slate-950/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    title="Preview Full Image"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onRemove(item.id)}
                    className="p-1.5 rounded-lg bg-slate-950/60 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Remove Image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Thumbnail Container with Rotation */}
              <div className="relative w-full h-36 rounded-xl bg-slate-950/80 border border-slate-800/80 overflow-hidden flex items-center justify-center mb-3">
                <img
                  src={item.url}
                  alt={item.name}
                  style={{
                    transform: `rotate(${item.rotation}deg)`,
                    transition: 'transform 0.2s ease-out',
                  }}
                  className="max-w-full max-h-full object-contain"
                />

                {item.rotation !== 0 && (
                  <span className="absolute bottom-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/80 text-white shadow-md">
                    {item.rotation}°
                  </span>
                )}
              </div>

              {/* Card Meta & Control Actions */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>{item.width} × {item.height} px</span>
                  <span>{formatFileSize(item.size)}</span>
                </div>

                {/* Navigation / Move Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => onRotate(item.id)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-slate-300 hover:text-purple-400 py-1 px-2 rounded-lg bg-slate-950/60 hover:bg-slate-800 transition-colors"
                    title="Rotate 90 degrees"
                  >
                    <RotateCw className="w-3 h-3" />
                    <span>Rotate</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {/* Move to start */}
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveToStart(index)}
                      className="p-1 rounded-md bg-slate-950/60 hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move to first page"
                    >
                      <ArrowUpToLine className="w-3.5 h-3.5" />
                    </button>

                    {/* Move Up */}
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveItem(index, index - 1)}
                      className="p-1 rounded-md bg-slate-950/60 hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move Up"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>

                    {/* Move Down */}
                    <button
                      type="button"
                      disabled={index === images.length - 1}
                      onClick={() => moveItem(index, index + 1)}
                      className="p-1 rounded-md bg-slate-950/60 hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move Down"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>

                    {/* Move to end */}
                    <button
                      type="button"
                      disabled={index === images.length - 1}
                      onClick={() => moveToEnd(index)}
                      className="p-1 rounded-md bg-slate-950/60 hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move to last page"
                    >
                      <ArrowDownToLine className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Preview Modal */}
      {previewItem && (
        <Modal
          isOpen={!!previewItem}
          onClose={() => setPreviewItem(null)}
          size="lg"
          title={
            <div className="flex items-center gap-2">
              <FileImage className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-bold text-white truncate">{previewItem.name}</span>
            </div>
          }
          footer={
            <Button variant="secondary" size="sm" onClick={() => setPreviewItem(null)}>
              Close
            </Button>
          }
        >
          <div className="flex items-center justify-center p-4 bg-slate-950 rounded-2xl min-h-[300px]">
            <img
              src={previewItem.url}
              alt={previewItem.name}
              style={{
                transform: `rotate(${previewItem.rotation}deg)`,
              }}
              className="max-h-[60vh] max-w-full object-contain rounded-lg"
            />
          </div>
        </Modal>
      )}
    </div>
  );
};
