import React from 'react';
import { Check, Palette } from 'lucide-react';
import { CardTemplate, DEFAULT_TEMPLATES } from '../../utils/idCardProcessor';

interface IdCardTemplateSelectorProps {
  selectedTemplateId: string;
  onSelect: (template: CardTemplate) => void;
  className?: string;
}

export const IdCardTemplateSelector: React.FC<IdCardTemplateSelectorProps> = ({
  selectedTemplateId,
  onSelect,
  className = '',
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="text-sm font-bold text-white flex items-center gap-2">
        <Palette className="w-4 h-4 text-teal-400" />
        Card Template
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {DEFAULT_TEMPLATES.map((tpl) => {
          const isSelected = selectedTemplateId === tpl.id;
          return (
            <button
              key={tpl.id}
              type="button"
              onClick={() => onSelect(tpl)}
              className={`relative p-3 rounded-xl border-2 transition-all text-left group ${
                isSelected
                  ? 'border-teal-400 bg-teal-500/5 shadow-lg shadow-teal-500/10'
                  : 'border-slate-700/80 bg-slate-900/50 hover:border-slate-600 hover:bg-slate-900/70'
              }`}
              aria-label={`Select ${tpl.name} template`}
            >
              {/* Mini preview */}
              <div
                className="w-full h-14 rounded-lg mb-2 relative overflow-hidden border border-slate-700/50"
                style={{ backgroundColor: tpl.backgroundColor }}
              >
                {tpl.headerHeight > 0 && (
                  <div
                    className="absolute top-0 inset-x-0"
                    style={{
                      height: `${tpl.headerHeight}%`,
                      backgroundColor: tpl.accentColor,
                    }}
                  />
                )}
                {/* Mini placeholder elements */}
                <div className="absolute left-1 bottom-1 w-3 h-4 rounded-sm bg-slate-400/30" />
                <div className="absolute left-5 top-1/2 -translate-y-1/2 space-y-0.5">
                  <div className="w-10 h-1 rounded bg-slate-400/40" />
                  <div className="w-7 h-0.5 rounded bg-slate-400/20" />
                </div>
              </div>

              <span className="text-xs font-semibold text-white block truncate">
                {tpl.name}
              </span>
              <span className="text-[10px] text-slate-400 block truncate">
                {tpl.description}
              </span>

              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
