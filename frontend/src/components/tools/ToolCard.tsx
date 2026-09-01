import React from 'react';
import {
  Layers,
  Scissors,
  Minimize2,
  FileText,
  Lock,
  PenTool,
  Sparkles,
  Zap,
  Repeat,
  Crop,
  ShieldCheck,
  ScanText,
  FileType,
  EyeOff,
  Code,
  Star,
  ArrowRight,
} from 'lucide-react';
import { ToolItem } from '../../types';

export interface ToolCardProps {
  tool: ToolItem;
  onLaunch?: (tool: ToolItem) => void;
  onToggleFavorite?: (toolId: string) => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({
  tool,
  onLaunch,
  onToggleFavorite,
}) => {
  const getToolIcon = (iconName: string) => {
    switch (iconName) {
      case 'Layers':
        return <Layers className="w-5 h-5" />;
      case 'Scissors':
        return <Scissors className="w-5 h-5" />;
      case 'Minimize2':
        return <Minimize2 className="w-5 h-5" />;
      case 'FileText':
        return <FileText className="w-5 h-5" />;
      case 'Lock':
        return <Lock className="w-5 h-5" />;
      case 'PenTool':
        return <PenTool className="w-5 h-5" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5" />;
      case 'Zap':
        return <Zap className="w-5 h-5" />;
      case 'Repeat':
        return <Repeat className="w-5 h-5" />;
      case 'Crop':
        return <Crop className="w-5 h-5" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5" />;
      case 'ScanText':
        return <ScanText className="w-5 h-5" />;
      case 'FileType':
        return <FileType className="w-5 h-5" />;
      case 'EyeOff':
        return <EyeOff className="w-5 h-5" />;
      case 'Code':
        return <Code className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  const getCategoryStyles = (category: ToolItem['category']) => {
    switch (category) {
      case 'photo':
        return {
          iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
          badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
          hoverBorder: 'hover:border-purple-500/40',
        };
      case 'pdf':
        return {
          iconBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          hoverBorder: 'hover:border-blue-500/40',
        };
      case 'document':
        return {
          iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          hoverBorder: 'hover:border-emerald-500/40',
        };
      default:
        return {
          iconBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          hoverBorder: 'hover:border-blue-500/40',
        };
    }
  };

  const styles = getCategoryStyles(tool.category);

  return (
    <div
      className={`group relative p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 ${styles.hoverBorder} hover:bg-slate-900/90 transition-all duration-200 flex flex-col justify-between shadow-md hover:shadow-xl hover:-translate-y-0.5`}
    >
      <div>
        {/* Top: Icon, Badges & Favorite Toggle */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div
            className={`w-11 h-11 rounded-xl border flex items-center justify-center ${styles.iconBg} shadow-sm group-hover:scale-105 transition-transform`}
          >
            {getToolIcon(tool.icon)}
          </div>

          <div className="flex items-center gap-1.5">
            {tool.badge && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border border-blue-500/30">
                {tool.badge}
              </span>
            )}
            <button
              onClick={() => onToggleFavorite && onToggleFavorite(tool.id)}
              className={`p-1.5 rounded-lg border transition-colors ${
                tool.isFavorite
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : 'bg-slate-950/60 border-slate-800 text-slate-500 hover:text-slate-300'
              }`}
              title={tool.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star className={`w-3.5 h-3.5 ${tool.isFavorite ? 'fill-amber-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
              {tool.title}
            </h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
            {tool.description}
          </p>
        </div>
      </div>

      {/* Footer Details & Launch CTA */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${styles.badge}`}>
            {tool.category}
          </span>
          {tool.estimatedSpeed && (
            <span className="text-[10px] text-slate-500 font-mono">
              {tool.estimatedSpeed}
            </span>
          )}
        </div>

        <button
          onClick={() => onLaunch && onLaunch(tool)}
          className="flex items-center gap-1 text-xs font-semibold text-blue-400 group-hover:text-blue-300 group-hover:translate-x-0.5 transition-all"
        >
          <span>Open</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
