import React, { useRef, useState } from 'react';
import { Upload, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../common/Button';
import { renderPdfPageToCanvas, renderImageFileToCanvas } from '../../utils/panProcessor';

interface PanUploaderProps {
  onDocumentLoaded: (name: string, canvas: HTMLCanvasElement) => void;
  hasDocuments?: boolean;
}

export const PanUploader: React.FC<PanUploaderProps> = ({
  onDocumentLoaded,
  hasDocuments = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // PDF Password Handling
  const [pendingPdfBuffer, setPendingPdfBuffer] = useState<{ buffer: ArrayBuffer; name: string } | null>(null);
  const [password, setPassword] = useState('');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  if (hasDocuments) {
    return (
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf,image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileProcess(e.target.files[0]);
            }
          }}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          leftIcon={isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
        >
          <span>{isLoading ? 'Loading...' : '+ Add Card'}</span>
        </Button>
      </div>
    );
  }

  const handleFileProcess = async (file: File) => {
    setError(null);
    setIsLoading(true);

    try {
      const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';
      const isImg = file.type.startsWith('image/');

      if (!isPdf && !isImg) {
        throw new Error('Please upload an e-PAN PDF document or a scanned image (JPG, PNG, WEBP).');
      }

      if (isPdf) {
        const buffer = await file.arrayBuffer();
        try {
          const canvas = await renderPdfPageToCanvas(buffer);
          onDocumentLoaded(file.name, canvas);
        } catch (pdfErr: any) {
          if (
            pdfErr?.name === 'PasswordException' ||
            pdfErr?.message?.toLowerCase().includes('password')
          ) {
            setPendingPdfBuffer({ buffer, name: file.name });
            setIsPasswordModalOpen(true);
            return;
          }
          throw pdfErr;
        }
      } else {
        const canvas = await renderImageFileToCanvas(file);
        onDocumentLoaded(file.name, canvas);
      }
    } catch (err: any) {
      console.error('File load error:', err);
      setError(err?.message || 'Failed to process document file.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingPdfBuffer || !password.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const canvas = await renderPdfPageToCanvas(pendingPdfBuffer.buffer, password.trim());
      onDocumentLoaded(pendingPdfBuffer.name, canvas);
      setIsPasswordModalOpen(false);
      setPendingPdfBuffer(null);
      setPassword('');
    } catch (err: any) {
      setError('Incorrect password. For e-PAN, password is your Date of Birth in DDMMYYYY format.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (isLoading) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf,image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileProcess(e.target.files[0]);
          }
        }}
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!isLoading) setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => {
          if (!isLoading) fileInputRef.current?.click();
        }}
        className={`relative cursor-pointer rounded-3xl border-2 border-dashed p-10 sm:p-14 text-center transition-all duration-300 ${
          isDragOver
            ? 'border-blue-500 bg-blue-500/10 scale-[1.01]'
            : 'border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900/60'
        } ${isLoading ? 'pointer-events-none opacity-80' : ''}`}
      >
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
            {isLoading ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              <Upload className="w-8 h-8" />
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-lg sm:text-xl font-extrabold text-white">
              {isLoading ? 'Processing PAN Document...' : 'Upload e-PAN PDF or Scanned Card'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Drop your NSDL / UTIITSL e-PAN PDF, Voter ID, or scanned card image here
            </p>
          </div>

          {!isLoading && (
            <div className="pt-2">
              <Button variant="gradient" size="md" leftIcon={<Upload className="w-4 h-4" />}>
                Browse File
              </Button>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-4 text-slate-400 text-xs pt-4 border-t border-slate-800/60">
            <span>🔒 100% Client-Side Private</span>
            <span>🆔 CR80 Exact 85.6 × 54 mm</span>
            <span>✍️ Signature Ink Sharpening</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* PDF Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Password Protected e-PAN</h4>
                <p className="text-xs text-slate-400">Enter PDF password to unlock</p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  Password (Date of Birth: DDMMYYYY)
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="e.g. 15081995"
                  autoFocus
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 font-mono"
                />
                <p className="text-[11px] text-slate-500">
                  Tip: For e-PAN, password is your 8-digit DOB without slashes.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => {
                    setIsPasswordModalOpen(false);
                    setPendingPdfBuffer(null);
                  }}
                >
                  Cancel
                </Button>
                <Button variant="gradient" size="sm" type="submit" disabled={!password.trim() || isLoading}>
                  {isLoading ? 'Unlocking...' : 'Unlock & Crop'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
