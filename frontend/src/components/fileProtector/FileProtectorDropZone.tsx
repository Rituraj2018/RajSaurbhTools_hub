import React, { useRef, useState, useCallback, useId } from 'react';
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  X,
  AlertCircle,
  File as FileIcon,
} from 'lucide-react';
import {
  isSupportedFile,
  isPdf,
  isImageFile,
  formatFileSize,
  MAX_FILE_SIZE_BYTES,
  SUPPORTED_EXTENSIONS,
} from '../../utils/fileProtectorProcessor';

export interface FileProtectorDropZoneProps {
  mode: 'protect' | 'unlock';
  /** For protect mode: allows multi-select only if all files are images */
  onFilesSelected: (files: File[]) => void;
  selectedFiles: File[];
  onRemoveFile: (index: number) => void;
}

const MAX_IMAGES = 20;

export const FileProtectorDropZone: React.FC<FileProtectorDropZoneProps> = ({
  mode,
  onFilesSelected,
  selectedFiles,
  onRemoveFile,
}) => {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const isMultiMode = mode === 'protect';

  const validateAndAccept = useCallback(
    (incoming: File[]) => {
      setValidationError(null);

      if (incoming.length === 0) return;

      // Unlock mode: single file only, must be a container file
      if (mode === 'unlock') {
        const f = incoming[0];
        // Accept any file in unlock mode — the user selects the protected container
        onFilesSelected([f]);
        return;
      }

      // Protect mode: validate file types
      const unsupported = incoming.filter((f) => !isSupportedFile(f));
      if (unsupported.length > 0) {
        setValidationError(
          `Unsupported file type: "${unsupported[0].name}". Supported: PDF, JPG, JPEG, PNG, WEBP.`
        );
        return;
      }

      const oversize = incoming.filter((f) => f.size > MAX_FILE_SIZE_BYTES);
      if (oversize.length > 0) {
        setValidationError(
          `"${oversize[0].name}" exceeds the 50 MB limit.`
        );
        return;
      }

      const empty = incoming.filter((f) => f.size === 0);
      if (empty.length > 0) {
        setValidationError(`"${empty[0].name}" appears to be an empty file.`);
        return;
      }

      // PDF + images cannot be mixed — user must pick one type
      const hasPdf = incoming.some((f) => isPdf(f));
      const hasImage = incoming.some((f) => isImageFile(f));

      if (hasPdf && hasImage) {
        setValidationError(
          'You cannot mix PDFs and images in a single protection. Please select only PDFs or only images.'
        );
        return;
      }

      // Multiple PDFs: only one allowed
      if (hasPdf && incoming.length > 1) {
        setValidationError('Only one PDF file can be protected at a time.');
        return;
      }

      // Multiple images: up to MAX_IMAGES
      const totalImages = selectedFiles.filter((f) => isImageFile(f)).length + incoming.filter((f) => isImageFile(f)).length;
      if (hasImage && totalImages > MAX_IMAGES) {
        setValidationError(`You can select up to ${MAX_IMAGES} images at a time.`);
        return;
      }

      // Already has a PDF, refuse additional files
      if (selectedFiles.some((f) => isPdf(f))) {
        setValidationError('A PDF is already selected. Remove it before adding new files.');
        return;
      }

      onFilesSelected(incoming);
    },
    [mode, onFilesSelected, selectedFiles]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const droppedFiles = Array.from(e.dataTransfer.files);
      validateAndAccept(droppedFiles);
    },
    [validateAndAccept]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files) return;
      validateAndAccept(Array.from(e.target.files));
      // Reset input so the same file can be re-selected after removal
      if (inputRef.current) inputRef.current.value = '';
    },
    [validateAndAccept]
  );

  const hasFiles = selectedFiles.length > 0;

  return (
    <div className="space-y-3">
      {/* Drop Zone */}
      {(!hasFiles || (isMultiMode && selectedFiles.every((f) => isImageFile(f)))) && (
        <>
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            multiple={isMultiMode}
            accept={
              mode === 'unlock'
                ? '*'
                : SUPPORTED_EXTENSIONS.join(',')
            }
            onChange={handleChange}
            className="hidden"
          />
          <div
            role="button"
            tabIndex={0}
            aria-label="Upload file drop zone"
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
            onDrop={handleDrop}
            className={`group relative rounded-2xl border-2 border-dashed cursor-pointer select-none transition-all duration-300 p-8 text-center backdrop-blur-sm ${
              isDragging
                ? 'border-emerald-500 bg-emerald-600/10 scale-[1.01] shadow-xl shadow-emerald-500/10'
                : 'border-slate-700/80 hover:border-emerald-500/50 bg-slate-900/40 hover:bg-slate-900/70'
            }`}
          >
            <div className="flex flex-col items-center gap-3">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg ${
                isDragging
                  ? 'bg-emerald-600 text-white scale-110'
                  : 'bg-emerald-600/10 text-emerald-400 group-hover:scale-110 border border-emerald-500/20'
              }`}>
                <UploadCloud className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <p className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                  {mode === 'unlock'
                    ? 'Select your protected file'
                    : hasFiles
                    ? 'Add more images'
                    : 'Click to upload or drag & drop'}
                </p>
                <p className="text-xs text-slate-400">
                  {mode === 'unlock'
                    ? 'Select the protected .pdf or .zip file you want to unlock'
                    : 'PDF (single) · JPG · JPEG · PNG · WEBP · up to 50 MB'}
                </p>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                <UploadCloud className="w-3.5 h-3.5 text-emerald-400" />
                {mode === 'unlock' ? 'Browse Protected File' : 'Browse Files'}
              </span>
            </div>
          </div>
        </>
      )}

      {/* File list */}
      {hasFiles && (
        <div className="space-y-2">
          {selectedFiles.map((file, idx) => (
            <div
              key={`${file.name}-${idx}`}
              className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800 animate-fadeIn"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border bg-slate-800/60 border-slate-700">
                  {isPdf(file) ? (
                    <FileText className="w-4 h-4 text-red-400" />
                  ) : isImageFile(file) ? (
                    <ImageIcon className="w-4 h-4 text-blue-400" />
                  ) : (
                    <FileIcon className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{file.name}</p>
                  <p className="text-[11px] text-slate-400">
                    {formatFileSize(file.size)} · {file.name.split('.').pop()?.toUpperCase()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onRemoveFile(idx)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors shrink-0"
                title="Remove file"
                aria-label={`Remove ${file.name}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

          {/* "Add more images" zone shown below if there are image files */}
          {mode === 'protect' && selectedFiles.every((f) => isImageFile(f)) && selectedFiles.length < MAX_IMAGES && (
            <p className="text-[11px] text-slate-500 text-center pt-1">
              {selectedFiles.length} image{selectedFiles.length > 1 ? 's' : ''} selected · You can add up to {MAX_IMAGES - selectedFiles.length} more
            </p>
          )}
        </div>
      )}

      {/* Validation Error */}
      {validationError && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{validationError}</span>
          <button
            onClick={() => setValidationError(null)}
            className="ml-auto text-rose-400 hover:text-rose-200"
            aria-label="Dismiss error"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
