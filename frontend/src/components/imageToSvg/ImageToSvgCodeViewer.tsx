import React, { useState } from 'react';
import {
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  FileCode,
} from 'lucide-react';
import { Button } from '../common/Button';

interface ImageToSvgCodeViewerProps {
  svgCode: string;
}

export const ImageToSvgCodeViewer: React.FC<ImageToSvgCodeViewerProps> = ({ svgCode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(svgCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const lineCount = svgCode.split('\n').length;
  const charCount = svgCode.length;

  return (
    <div className="rounded-3xl bg-slate-900/60 border border-slate-800 shadow-lg overflow-hidden transition-all">
      {/* Accordion Header */}
      <div className="p-4 sm:p-5 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 text-left focus:outline-none flex-1 group"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
            <FileCode className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                SVG Source Code Viewer
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                {lineCount} lines • {charCount.toLocaleString()} chars
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Inspect, copy raw markup or embed directly in your web applications.
            </p>
          </div>
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopy}
            leftIcon={
              isCopied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )
            }
          >
            {isCopied ? 'Copied SVG!' : 'Copy Code'}
          </Button>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Code Body */}
      {isOpen && (
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 animate-fadeIn">
          <pre className="text-xs font-mono text-slate-300 bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto max-h-[300px] overflow-y-auto leading-relaxed select-all">
            <code>{svgCode}</code>
          </pre>
        </div>
      )}
    </div>
  );
};
