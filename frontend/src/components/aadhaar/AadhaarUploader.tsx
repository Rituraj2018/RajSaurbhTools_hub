import React, { useRef, useState, DragEvent, ChangeEvent } from 'react';
import {
  UploadCloud,
  Lock,
  Sparkles,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
  Key,
  X,
} from 'lucide-react';
import {
  AadhaarDocItem,
  renderPdfPageToCanvas,
  renderImageFileToCanvas,
  createSampleAadhaarCanvas,
  DEFAULT_FRONT_CROP,
  DEFAULT_BACK_CROP,
  DEFAULT_ADJUSTMENTS,
} from '../../utils/aadhaarProcessor';
import { Button } from '../common/Button';

export interface AadhaarUploaderProps {
  onDocumentLoaded: (item: AadhaarDocItem) => void;
  hasDocuments: boolean;
  totalDocsCount?: number;
}

export const AadhaarUploader: React.FC<AadhaarUploaderProps> = ({
  onDocumentLoaded,
  hasDocuments,
  totalDocsCount: _totalDocsCount = 0,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Password Modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingPdfBuffer, setPendingPdfBuffer] = useState<ArrayBuffer | null>(null);
  const [pendingFileName, setPendingFileName] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = async (file: File) => {
    setErrorMessage(null);
    setIsProcessing(true);

    try {
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        const arrayBuffer = await file.arrayBuffer();
        try {
          // Attempt rendering without password first
          const canvas = await renderPdfPageToCanvas(arrayBuffer);
          const docItem: AadhaarDocItem = {
            id: `aadhaar_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            name: file.name.replace(/\.[^/.]+$/, ''),
            originalCanvas: canvas,
            frontCrop: { ...DEFAULT_FRONT_CROP },
            backCrop: { ...DEFAULT_BACK_CROP },
            adjustments: { ...DEFAULT_ADJUSTMENTS },
          };
          onDocumentLoaded(docItem);
          setIsProcessing(false);
        } catch (err: any) {
          // Check if password is required
          const isPasswordRequired =
            err?.name === 'PasswordException' ||
            err?.message?.toLowerCase().includes('password') ||
            err?.code === 1 ||
            err?.code === 2;

          if (isPasswordRequired) {
            setPendingPdfBuffer(arrayBuffer);
            setPendingFileName(file.name.replace(/\.[^/.]+$/, ''));
            setPasswordError(null);
            setPasswordInput('');
            setShowPasswordModal(true);
            setIsProcessing(false);
          } else {
            throw err;
          }
        }
      } else if (file.type.startsWith('image/')) {
        const canvas = await renderImageFileToCanvas(file);
        const docItem: AadhaarDocItem = {
          id: `aadhaar_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          name: file.name.replace(/\.[^/.]+$/, ''),
          originalCanvas: canvas,
          frontCrop: { ...DEFAULT_FRONT_CROP },
          backCrop: { ...DEFAULT_BACK_CROP },
          adjustments: { ...DEFAULT_ADJUSTMENTS },
        };
        onDocumentLoaded(docItem);
        setIsProcessing(false);
      } else {
        throw new Error('Unsupported file format. Please upload a PDF or image file.');
      }
    } catch (err: any) {
      console.error('File load error:', err);
      setErrorMessage(err?.message || 'Failed to read document file.');
      setIsProcessing(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingPdfBuffer) return;

    setIsProcessing(true);
    setPasswordError(null);

    try {
      const canvas = await renderPdfPageToCanvas(pendingPdfBuffer, passwordInput);
      const docItem: AadhaarDocItem = {
        id: `aadhaar_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        name: pendingFileName || 'Decrypted_Aadhaar',
        originalCanvas: canvas,
        frontCrop: { ...DEFAULT_FRONT_CROP },
        backCrop: { ...DEFAULT_BACK_CROP },
        adjustments: { ...DEFAULT_ADJUSTMENTS },
      };

      onDocumentLoaded(docItem);
      setShowPasswordModal(false);
      setPendingPdfBuffer(null);
    } catch (err: any) {
      setPasswordError('Incorrect password. Please verify and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoadSample = () => {
    setIsProcessing(true);
    try {
      const canvas = createSampleAadhaarCanvas();
      const docItem: AadhaarDocItem = {
        id: `aadhaar_sample_${Date.now()}`,
        name: 'Rahul_Sharma_eAadhaar',
        originalCanvas: canvas,
        frontCrop: { ...DEFAULT_FRONT_CROP },
        backCrop: { ...DEFAULT_BACK_CROP },
        adjustments: { ...DEFAULT_ADJUSTMENTS },
      };
      onDocumentLoaded(docItem);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileProcess(e.target.files[0]);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf,image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Privacy Guarantee Banner */}
      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-300 shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-white tracking-tight">100% In-Memory Local Privacy Guarantee</p>
            <p className="text-emerald-300/80 text-[11px]">
              Document PDF decryption, cropping, and A4 print layout generation occur strictly in your browser memory.
              No document contents or personal information are sent or stored on any server.
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-200 shrink-0 self-start sm:self-center">
          Zero Cloud Storage
        </span>
      </div>

      {/* Main Upload Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative p-8 sm:p-12 rounded-3xl border-2 border-dashed transition-all duration-300 text-center cursor-pointer overflow-hidden ${
          isDragging
            ? 'border-blue-500 bg-blue-500/10 shadow-2xl shadow-blue-500/20 scale-[1.01]'
            : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900/90 hover:border-slate-700 shadow-xl'
        }`}
      >
        <div className="relative z-10 flex flex-col items-center space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600/20 to-emerald-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner group-hover:scale-110 transition-transform">
            {isProcessing ? (
              <RefreshCw className="w-8 h-8 animate-spin text-blue-400" />
            ) : (
              <UploadCloud className="w-8 h-8 animate-pulse" />
            )}
          </div>

          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-white tracking-tight">
              {hasDocuments ? 'Upload Additional Aadhaar Document' : 'Upload e-Aadhaar PDF or Scanned Document'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              {isProcessing
                ? 'Decrypting and rendering document in browser memory...'
                : 'Drag and drop your e-Aadhaar PDF file here, or browse from your computer'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300">
              Password-Protected PDFs Supported
            </span>
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300">
              Standard CR80 Cutout (85.6 × 54 mm)
            </span>
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 font-semibold">
              1 to 5 Cards / A4 Sheet
            </span>
          </div>

          {/* Quick Demo Sample Button */}
          {!hasDocuments && (
            <div
              className="pt-3"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleLoadSample}
                disabled={isProcessing}
                leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-400" />}
              >
                <span>Try with Sample e-Aadhaar Document</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-300 animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Password Decryption Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    Protected PDF Password Required
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    This e-Aadhaar PDF is encrypted by UIDAI
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowPasswordModal(false);
                  setPendingPdfBuffer(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-blue-400" />
                  <span>Document Password</span>
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="e.g. RAHU1995"
                  autoFocus
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:border-blue-500 outline-none"
                />
              </div>

              {/* Password Hint Box */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1 text-[11px] text-slate-400">
                <p className="font-semibold text-slate-300">💡 Standard e-Aadhaar Password Format:</p>
                <p>
                  First <strong>4 letters of your name in CAPITAL</strong> followed by your{' '}
                  <strong>Year of Birth (YYYY)</strong>.
                </p>
                <p className="font-mono text-blue-400 pt-0.5">Example: RAHUL SHARMA born in 1995 → RAHU1995</p>
              </div>

              {passwordError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{passwordError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPendingPdfBuffer(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="gradient"
                  size="sm"
                  disabled={isProcessing}
                  leftIcon={
                    isProcessing ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Lock className="w-3.5 h-3.5" />
                    )
                  }
                >
                  <span>{isProcessing ? 'Decrypting...' : 'Decrypt & Load'}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
