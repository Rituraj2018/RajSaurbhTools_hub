import React from 'react';
import {
  Camera,
  FileText,
  Layers,
  Scissors,
  Minimize2,
  FileCheck,
  Sparkles,
  Wrench,
  ArrowRight,
  Star,
} from 'lucide-react';
import { Tool } from '../../features/tools';
import { ToolItem } from '../../types';

export interface ToolCardProps {
  tool: Tool | ToolItem;
  onLaunch?: (tool: any) => void;
  onToggleFavorite?: (toolId: string) => void;
  isFavorite?: boolean;
}

export const ToolCard: React.FC<ToolCardProps> = ({
  tool,
  onLaunch,
  onToggleFavorite,
  isFavorite = false,
}) => {
  const toolName = (tool as Tool).name || (tool as ToolItem).title;
  const toolSlug = (tool as Tool).slug || tool.id;
  const isFeatured = (tool as Tool).isFeatured || (tool as ToolItem).popular;

  const getToolIcon = (iconName: string) => {
    switch (iconName?.toLowerCase()) {
      case 'camera':
        return <Camera className="w-5 h-5" />;
      case 'filetext':
      case 'pdf':
        return <FileText className="w-5 h-5" />;
      case 'layers':
      case 'combine':
        return <Layers className="w-5 h-5" />;
      case 'scissors':
      case 'split':
        return <Scissors className="w-5 h-5" />;
      case 'minimize2':
      case 'compress':
        return <Minimize2 className="w-5 h-5" />;
      case 'filecheck':
      case 'creditcard':
      case 'document':
        return <FileCheck className="w-5 h-5" />;
      case 'sparkles':
      case 'heartpulse':
        return <Sparkles className="w-5 h-5" />;
      default:
        return <Wrench className="w-5 h-5" />;
    }
  };

  const getCategoryStyles = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'photo':
        return {
          iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
          badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
          hoverBorder: 'hover:border-purple-500/50 hover:shadow-purple-500/10',
          glow: 'from-purple-500/10 to-transparent',
        };
      case 'pdf':
        return {
          iconBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          hoverBorder: 'hover:border-blue-500/50 hover:shadow-blue-500/10',
          glow: 'from-blue-500/10 to-transparent',
        };
      case 'document':
        return {
          iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          hoverBorder: 'hover:border-emerald-500/50 hover:shadow-emerald-500/10',
          glow: 'from-emerald-500/10 to-transparent',
        };
      case 'image':
        return {
          iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          hoverBorder: 'hover:border-amber-500/50 hover:shadow-amber-500/10',
          glow: 'from-amber-500/10 to-transparent',
        };
      default:
        return {
          iconBg: 'bg-slate-800 text-slate-300 border-slate-700',
          badge: 'bg-slate-800 text-slate-300 border-slate-700',
          hoverBorder: 'hover:border-slate-700',
          glow: 'from-slate-500/10 to-transparent',
        };
    }
  };

  const styles = getCategoryStyles(tool.category);

  return (
    <div
      className={`group relative p-5 sm:p-6 rounded-2xl bg-slate-900/60 backdrop-blur-sm border border-slate-800/80 ${styles.hoverBorder} hover:bg-slate-900/90 transition-all duration-300 flex flex-col justify-between shadow-lg hover:shadow-2xl hover:-translate-y-1 overflow-hidden`}
    >
      {/* Top subtle highlight line */}
      <div className={`absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r ${styles.glow} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

      <div>
        {/* Top bar: Icon, Badges & Favorite Toggle */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div
            className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${styles.iconBg} shadow-sm group-hover:scale-110 transition-transform duration-300`}
          >
            {getToolIcon(tool.icon)}
          </div>

          <div className="flex items-center gap-1.5">
            {isFeatured && (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30 shadow-sm">
                <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                <span>Featured</span>
              </span>
            )}
            {onToggleFavorite && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const targetId = toolSlug || (tool as any)._id || (tool as any).id;
                  onToggleFavorite(targetId);
                }}
                className={`p-1.5 rounded-lg border transition-colors ${
                  isFavorite
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    : 'bg-slate-950/60 border-slate-800 text-slate-500 hover:text-slate-300'
                }`}
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-400' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Content: Title & Description */}
        <div className="space-y-2 mb-5">
          <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
            {toolName}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
            {tool.description}
          </p>
        </div>
      </div>

      {/* Footer bar: Category badge, status indicator & Launch CTA */}
      <div className="pt-3.5 border-t border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${styles.badge}`}>
            {tool.category}
          </span>
          <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Ready</span>
          </span>
        </div>

        <button
          onClick={() => onLaunch && onLaunch(tool)}
          className="flex items-center gap-1.5 text-xs font-bold text-blue-400 group-hover:text-blue-300 group-hover:translate-x-0.5 transition-all focus:outline-none"
        >
          <span>Open</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
