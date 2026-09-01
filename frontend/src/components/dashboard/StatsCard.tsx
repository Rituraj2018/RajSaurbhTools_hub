import React from 'react';
import {
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  HardDrive,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react';
import { DashboardStat } from '../../types';

export interface StatsCardProps {
  stat: DashboardStat;
}

export const StatsCard: React.FC<StatsCardProps> = ({ stat }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'FileText':
        return <FileText className="w-5 h-5 text-blue-400" />;
      case 'Image':
        return <ImageIcon className="w-5 h-5 text-purple-400" />;
      case 'FileSpreadsheet':
        return <FileSpreadsheet className="w-5 h-5 text-cyan-400" />;
      case 'HardDrive':
        return <HardDrive className="w-5 h-5 text-violet-400" />;
      default:
        return <TrendingUp className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <div
      className={`relative p-5 sm:p-6 rounded-2xl bg-slate-900/70 border ${stat.borderColor} backdrop-blur-xl hover:bg-slate-900/90 transition-all duration-300 group shadow-lg overflow-hidden`}
    >
      {/* Background Gradient Mesh */}
      <div
        className={`absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br ${stat.gradient} rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500`}
      />

      <div className="relative z-10 space-y-4">
        {/* Card Header: Icon & Trend Tag */}
        <div className="flex items-center justify-between">
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 shadow-inner group-hover:scale-105 transition-transform">
            {getIcon(stat.icon)}
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-950/80 border border-slate-800 text-[11px] font-semibold text-emerald-400">
            <ArrowUpRight className="w-3 h-3" />
            <span>{stat.change}</span>
          </div>
        </div>

        {/* Card Body: Label, Value & Subtitle */}
        <div className="space-y-1">
          <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
            {stat.label}
          </span>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {stat.value}
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">{stat.subtitle}</p>
        </div>
      </div>
    </div>
  );
};
