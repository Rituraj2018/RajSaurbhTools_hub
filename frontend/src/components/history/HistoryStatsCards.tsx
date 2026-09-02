import React from 'react';
import {
  Activity,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { HistoryStats } from '../../types/history.types';

export interface HistoryStatsCardsProps {
  stats?: HistoryStats;
}

export const HistoryStatsCards: React.FC<HistoryStatsCardsProps> = ({ stats }) => {
  const total = stats?.totalCount || 0;
  const completed = stats?.completedCount || 0;
  const processing = stats?.processingCount || 0;
  const failed = stats?.failedCount || 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Operations */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400">Total Operations</p>
            <p className="text-2xl font-extrabold text-white mt-1 font-mono">{total}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Activity className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2. Completed */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-emerald-400">Completed</p>
            <p className="text-2xl font-extrabold text-white mt-1 font-mono">{completed}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. In Processing */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-cyan-400">In Progress</p>
            <p className="text-2xl font-extrabold text-white mt-1 font-mono">{processing}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 4. Failed */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-rose-400">Failed</p>
            <p className="text-2xl font-extrabold text-white mt-1 font-mono">{failed}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
};
