import React, { useCallback } from 'react';
import { Upload, X, Camera } from 'lucide-react';
import { validateCardImage, fileToDataUrl } from '../../utils/idCardProcessor';

interface IdCardPhotoUploaderProps {
  label: string;
  imageUrl?: string;
  onImageChange: (dataUrl: string | undefined) => void;
  aspectHint?: string;
  className?: string;
  compact?: boolean;
}

export const IdCardPhotoUploader: React.FC<IdCardPhotoUploaderProps> = ({
  label,
  imageUrl,
  onImageChange,
  aspectHint,
  className = '',
  compact = false,
}) => {
  const [error, setError] = React.useState<string | null>(null);
  const [dragging, setDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    const validation = validateCardImage(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }
    try {
      const dataUrl = await fileToDataUrl(file);
      onImageChange(dataUrl);
    } catch {
      setError('Failed to read file');
    }
  }, [onImageChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const handleRemove = () => {
    onImageChange(undefined);
    setError(null);
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="text-xs font-semibold text-slate-300">{label}</label>

      {imageUrl ? (
        <div className={`relative rounded-xl overflow-hidden border border-slate-700 bg-slate-900 ${compact ? 'w-20 h-24' : 'w-32 h-40'}`}>
          <img
            src={imageUrl}
            alt={label}
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-1 right-1 p-1 rounded-lg bg-slate-900/80 text-slate-300 hover:text-rose-400 transition-colors"
            aria-label={`Remove ${label}`}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
            compact ? 'w-20 h-24 p-2' : 'w-32 h-40 p-4'
          } ${
            dragging
              ? 'border-teal-400 bg-teal-500/5'
              : 'border-slate-700 bg-slate-900/50 hover:border-slate-600 hover:bg-slate-900/70'
          }`}
          role="button"
          tabIndex={0}
          aria-label={`Upload ${label}`}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
        >
          {compact ? (
            <Camera className="w-5 h-5 text-slate-500" />
          ) : (
            <>
              <Upload className="w-6 h-6 text-slate-500" />
              <span className="text-[10px] text-slate-400 text-center">
                Drop or click
              </span>
            </>
          )}
        </div>
      )}

      {aspectHint && !imageUrl && (
        <p className="text-[10px] text-slate-500">{aspectHint}</p>
      )}

      {error && (
        <p className="text-[11px] text-rose-400">{error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleInputChange}
        className="hidden"
        aria-label={`${label} file input`}
      />
    </div>
  );
};
