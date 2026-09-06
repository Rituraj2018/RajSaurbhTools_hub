import React from 'react';
import { Download, Loader2, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '../common/Button';
import { SplitMode } from '../../utils/pdfSplitProcessor';

interface PdfSplitActionCardProps {
  documentName: string;
  totalPages: number;
  selectedCount: number;
  splitMode: SplitMode;
  outputFilename: string;
  onOutputFilenameChange: (name: string) => void;
  onExecuteSplit: () => void;
  isProcessing: boolean;
  canExecute: boolean;
}

export const PdfSplitActionCard: React.FC<PdfSplitActionCardProps> = ({
  documentName,
  totalPages,
  selectedCount,
  splitMode,
  outputFilename,
  onOutputFilenameChange,
  onExecuteSplit,
  isProcessing,
  canExecute,
}) => {
  return (
    <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-6 shadow-2xl">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-md">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-extrabold text-white">Extraction Summary</h3>
          <p className="text-xs text-slate-400">Ready to split & download</p>
        </div>
      </div>

      {/* Stats Breakdown */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <span className="text-[11px] text-slate-400 font-medium">Source Document</span>
          <p className="text-sm font-bold text-white truncate" title={documentName}>
            {documentName}
          </p>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <span className="text-[11px] text-slate-400 font-medium">Total Pages</span>
          <p className="text-sm font-bold text-white">{totalPages} Pages</p>
        </div>
      </div>

      {/* Pages to extract tally */}
      <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-blue-300 font-semibold">
            {splitMode === 'all-individual' ? 'All Individual Files' : 'Pages to Extract'}
          </span>
          <span className="text-blue-400 font-bold font-mono">
            {splitMode === 'all-individual' ? `${totalPages} PDF Files` : `${selectedCount} Pages`}
          </span>
        </div>
        <p className="text-[11px] text-slate-400">
          {splitMode === 'all-individual'
            ? 'Each page will download sequentially as a distinct document.'
            : 'Selected pages will be compiled into a single clean PDF.'}
        </p>
      </div>

      {/* Output Filename */}
      {splitMode !== 'all-individual' && (
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300">Output PDF Name</label>
          <div className="relative">
            <input
              type="text"
              value={outputFilename}
              onChange={(e) => onOutputFilenameChange(e.target.value)}
              placeholder="e.g. Extracted_Pages"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors pr-12 font-mono"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-mono">
              .pdf
            </span>
          </div>
        </div>
      )}

      {/* Action Button */}
      <Button
        variant="gradient"
        size="lg"
        className="w-full"
        disabled={!canExecute || isProcessing}
        onClick={onExecuteSplit}
        leftIcon={
          isProcessing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Download className="w-5 h-5" />
          )
        }
      >
        <span>
          {isProcessing
            ? 'Splitting PDF...'
            : splitMode === 'all-individual'
            ? `Download All ${totalPages} Pages`
            : `Split & Download (${selectedCount} Pages)`}
        </span>
      </Button>

      {/* Security note */}
      <div className="flex items-center gap-2 text-[11px] text-slate-400 justify-center">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span>Processed locally in browser • No file uploaded</span>
      </div>
    </div>
  );
};
