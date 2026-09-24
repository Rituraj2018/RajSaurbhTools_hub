import React, { useState } from 'react';
import { Globe, ExternalLink } from 'lucide-react';
import { Website } from '../../types/website';

interface WebsiteCardProps {
  website: Website;
}

export const WebsiteCard: React.FC<WebsiteCardProps> = ({ website }) => {
  const [imageError, setImageError] = useState(false);

  // Extract clean domain for display
  const getDomain = (urlStr: string): string => {
    try {
      const parsed = new URL(urlStr);
      return parsed.hostname.replace(/^www\./, '');
    } catch {
      return urlStr;
    }
  };

  const domain = getDomain(website.url);
  // Derive safe favicon source: custom iconUrl or Google's public favicon service
  const faviconUrl =
    website.iconUrl && website.iconUrl.trim() !== ''
      ? website.iconUrl.trim()
      : `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

  return (
    <div className="group relative flex flex-col justify-between p-5 sm:p-6 rounded-2xl bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800/80 hover:border-indigo-500/40 backdrop-blur-xl shadow-lg hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 transform hover:-translate-y-1">
      {/* Top Background Glow Effect on Hover */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 group-hover:bg-indigo-500/10 rounded-full blur-2xl pointer-events-none transition-all duration-500" />

      {/* Card Header & Content */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between gap-3">
          {/* Favicon / Icon */}
          <div className="w-11 h-11 rounded-xl bg-slate-800/90 border border-slate-700/60 p-2 flex items-center justify-center shrink-0 shadow-inner group-hover:border-indigo-500/30 transition-colors">
            {!imageError ? (
              <img
                src={faviconUrl}
                alt={website.name}
                onError={() => setImageError(true)}
                className="w-full h-full object-contain rounded-md"
                loading="lazy"
              />
            ) : (
              <Globe className="w-5 h-5 text-indigo-400" />
            )}
          </div>

          {/* Domain Tag */}
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2.5 py-1 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/60 truncate max-w-[150px]">
            <Globe className="w-3 h-3 text-indigo-400 shrink-0" />
            <span className="truncate">{domain}</span>
          </span>
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="text-base font-bold text-white group-hover:text-indigo-200 transition-colors line-clamp-1">
            {website.name}
          </h3>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed line-clamp-2 min-h-[32px]">
            {website.description || 'Useful resource recommended by Toolix.'}
          </p>
        </div>
      </div>

      {/* Card Footer: Action Button */}
      <div className="pt-4 mt-2 border-t border-slate-800/60 flex items-center justify-between">
        <span className="text-[11px] text-slate-500 font-medium">External Link</span>
        <a
          href={website.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600/20 to-indigo-600/20 hover:from-blue-600/30 hover:to-indigo-600/30 border border-indigo-500/30 hover:border-indigo-500/60 text-xs font-semibold text-indigo-300 hover:text-white transition-all shadow-sm active:scale-95 group/btn"
        >
          <span>Visit Website</span>
          <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
        </a>
      </div>
    </div>
  );
};
