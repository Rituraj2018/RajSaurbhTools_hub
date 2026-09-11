import React from 'react';
import { Ruler, CreditCard } from 'lucide-react';
import { Input } from '../common/Input';
import { CardDimensions, CARD_PRESETS, mmToPx } from '../../utils/idCardProcessor';

interface IdCardDimensionPickerProps {
  dimensions: CardDimensions;
  onChange: (dims: CardDimensions) => void;
  className?: string;
}

export const IdCardDimensionPicker: React.FC<IdCardDimensionPickerProps> = ({
  dimensions,
  onChange,
  className = '',
}) => {
  const [preset, setPreset] = React.useState('CR80');

  const handlePresetChange = (key: string) => {
    setPreset(key);
    if (key !== 'Custom') {
      onChange({ ...CARD_PRESETS[key] });
    }
  };

  const handleCustomDimension = (field: 'widthMm' | 'heightMm', value: number) => {
    const newDims = { ...dimensions, [field]: value };
    newDims.widthPx = mmToPx(newDims.widthMm, newDims.dpi);
    newDims.heightPx = mmToPx(newDims.heightMm, newDims.dpi);
    setPreset('Custom');
    onChange(newDims);
  };

  const handleDpiChange = (dpi: number) => {
    const newDims = { ...dimensions, dpi };
    newDims.widthPx = mmToPx(newDims.widthMm, dpi);
    newDims.heightPx = mmToPx(newDims.heightMm, dpi);
    onChange(newDims);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="text-sm font-bold text-white flex items-center gap-2">
        <Ruler className="w-4 h-4 text-teal-400" />
        Card Dimensions
      </h3>

      {/* Preset buttons */}
      <div className="flex flex-wrap gap-2">
        {Object.keys(CARD_PRESETS).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => handlePresetChange(key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              preset === key
                ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30'
                : 'bg-slate-800/80 text-slate-400 border border-slate-700 hover:text-slate-200 hover:border-slate-600'
            }`}
          >
            <CreditCard className="w-3 h-3" />
            {key}
          </button>
        ))}
      </div>

      {/* Dimension inputs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Input
          id="card-width-mm"
          label="Width (mm)"
          type="number"
          min={10}
          max={300}
          step={0.1}
          value={dimensions.widthMm}
          onChange={(e) => handleCustomDimension('widthMm', parseFloat(e.target.value) || 85.6)}
        />
        <Input
          id="card-height-mm"
          label="Height (mm)"
          type="number"
          min={10}
          max={300}
          step={0.1}
          value={dimensions.heightMm}
          onChange={(e) => handleCustomDimension('heightMm', parseFloat(e.target.value) || 53.98)}
        />
        <Input
          id="card-dpi"
          label="DPI"
          type="number"
          min={72}
          max={600}
          value={dimensions.dpi}
          onChange={(e) => handleDpiChange(parseInt(e.target.value) || 300)}
        />
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Output (px)</label>
          <div className="h-10 flex items-center px-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 font-mono">
            {dimensions.widthPx} × {dimensions.heightPx}
          </div>
        </div>
      </div>
    </div>
  );
};
