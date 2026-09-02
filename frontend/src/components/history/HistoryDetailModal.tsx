import React from 'react';
import {
  X,
  Calendar,
  Wrench,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileText,
  FileSpreadsheet,
  Code2,
} from 'lucide-react';
import { HistoryItem } from '../../types/history.types';
import { Button } from '../common/Button';

export interface HistoryDetailModalProps {
  item: HistoryItem | null;
  onClose: () => void;
}

export const HistoryDetailModal: React.FC<HistoryDetailModalProps> = ({
  item,
  onClose,
}) => {
  if (!item) return null;

  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl max-h-[90vh] rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {item.toolName || item.tool}
              </h3>
              <p className="text-[11px] font-mono text-slate-400">
                Operation Audit ID: {item.id || item._id}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status & Timestamp Banner */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">Execution Status:</span>
              {item.status === 'completed' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Completed
                </span>
              ) : item.status === 'processing' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                  Processing
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase bg-rose-500/10 border border-rose-500/30 text-rose-400">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Failed
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{formatDate(item.createdAt)}</span>
            </div>
          </div>

          {/* Input Files */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>Input Documents ({item.inputFiles?.length || 0})</span>
            </h4>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              {item.inputFiles && item.inputFiles.length > 0 ? (
                item.inputFiles.map((input, idx) => {
                  const name = typeof input === 'string' ? input : input.name;
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-900/60 border border-slate-800/80"
                    >
                      <span className="text-white font-medium truncate max-w-sm">{name}</span>
                      <span className="text-[10px] font-mono text-slate-400">Doc #{idx + 1}</span>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-500 italic p-1">No input files recorded.</p>
              )}
            </div>
          </div>

          {/* Output File */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Generated Output Document</span>
            </h4>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              {item.outputFile ? (
                <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <span className="text-emerald-300 font-mono font-medium truncate max-w-sm">
                    {typeof item.outputFile === 'string' ? item.outputFile : item.outputFile.name}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
                    Ready
                  </span>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic p-1">No output file generated.</p>
              )}
            </div>
          </div>

          {/* Metadata Parameters */}
          {item.metadata && Object.keys(item.metadata).length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Processing Metadata & Settings</span>
              </h4>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(item.metadata, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex justify-end shrink-0">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
