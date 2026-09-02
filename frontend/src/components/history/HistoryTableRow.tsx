import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  FileImage,
  FileText,
  CreditCard,
  Layers,
  Wrench,
  Eye,
  FileSpreadsheet,
} from 'lucide-react';
import { HistoryItem } from '../../types/history.types';

export interface HistoryTableRowProps {
  item: HistoryItem;
  onViewDetails: (item: HistoryItem) => void;
}

export const HistoryTableRow: React.FC<HistoryTableRowProps> = ({
  item,
  onViewDetails,
}) => {
  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const getToolIcon = () => {
    const slug = (item.tool || '').toLowerCase();
    if (slug.includes('passport')) {
      return <FileImage className="w-4 h-4 text-emerald-400" />;
    }
    if (slug.includes('merge') || slug.includes('image-to-pdf')) {
      return <FileText className="w-4 h-4 text-red-400" />;
    }
    if (slug.includes('aadhaar')) {
      return <CreditCard className="w-4 h-4 text-blue-400" />;
    }
    if (slug.includes('ayushman') || slug.includes('pmjay')) {
      return <Layers className="w-4 h-4 text-cyan-400" />;
    }
    return <Wrench className="w-4 h-4 text-purple-400" />;
  };

  const getStatusBadge = () => {
    switch (item.status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <CheckCircle2 className="w-3 h-3" />
            <span>Completed</span>
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 animate-pulse">
            <Clock className="w-3 h-3 animate-spin" />
            <span>Processing</span>
          </span>
        );
      case 'failed':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <AlertCircle className="w-3 h-3" />
            <span>Failed</span>
          </span>
        );
    }
  };

  // Helper to format input files
  const getInputFilesDisplay = () => {
    if (!item.inputFiles || item.inputFiles.length === 0) {
      return <span className="text-slate-500 italic">None</span>;
    }
    const first = item.inputFiles[0];
    const firstName = typeof first === 'string' ? first : first.name;
    const extraCount = item.inputFiles.length - 1;

    return (
      <div className="flex items-center gap-1.5 max-w-[200px] sm:max-w-xs">
        <span className="text-xs text-white truncate font-medium" title={firstName}>
          {firstName}
        </span>
        {extraCount > 0 && (
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 shrink-0">
            +{extraCount} more
          </span>
        )}
      </div>
    );
  };

  // Helper to format output file
  const getOutputFileDisplay = () => {
    if (!item.outputFile) {
      return <span className="text-slate-500 text-xs italic">—</span>;
    }
    const name = typeof item.outputFile === 'string' ? item.outputFile : item.outputFile.name;
    return (
      <div className="flex items-center gap-1.5 max-w-[200px] sm:max-w-xs">
        <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400 shrink-0" />
        <span className="text-xs text-slate-300 truncate font-mono" title={name}>
          {name}
        </span>
      </div>
    );
  };

  return (
    <tr className="border-b border-slate-800/80 hover:bg-slate-800/40 transition-colors group">
      {/* Tool Column */}
      <td className="py-3.5 px-4 whitespace-nowrap">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 shrink-0">
            {getToolIcon()}
          </div>
          <div>
            <p className="text-xs sm:text-sm font-bold text-white">
              {item.toolName || item.tool}
            </p>
            <p className="text-[10px] font-mono text-slate-400">{item.tool}</p>
          </div>
        </div>
      </td>

      {/* Input File(s) Column */}
      <td className="py-3.5 px-4">
        {getInputFilesDisplay()}
      </td>

      {/* Output File Column */}
      <td className="py-3.5 px-4">
        {getOutputFileDisplay()}
      </td>

      {/* Status Column */}
      <td className="py-3.5 px-4 whitespace-nowrap">
        {getStatusBadge()}
      </td>

      {/* Date Column */}
      <td className="py-3.5 px-4 text-xs text-slate-400 whitespace-nowrap font-mono">
        {formatDate(item.createdAt)}
      </td>

      {/* Actions */}
      <td className="py-3.5 px-4 text-right whitespace-nowrap">
        <button
          type="button"
          onClick={() => onViewDetails(item)}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-sm"
        >
          <Eye className="w-3.5 h-3.5 text-blue-400" />
          <span>Details</span>
        </button>
      </td>
    </tr>
  );
};
