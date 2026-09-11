import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Palette, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Button } from '../components/common/Button';
import {
  IdCardCanvas,
  IdCardFieldEditor,
  IdCardPhotoUploader,
  IdCardDimensionPicker,
  IdCardExportPanel,
} from '../components/idCard';
import { Input } from '../components/common/Input';
import {
  CardData,
  CardTemplate,
  CardDimensions,
  DEFAULT_TEMPLATES,
  CARD_PRESETS,
  downloadCard,
} from '../utils/idCardProcessor';
import { generateSingleCardPdf } from '../utils/idCardPdfGenerator';
import { recordToolHistorySafely } from '../api/historyApi';

export const IdCardTemplateMakerPage: React.FC = () => {
  const [template, setTemplate] = useState<CardTemplate>({
    ...DEFAULT_TEMPLATES[4], // blank template
    id: `custom-${Date.now()}`,
    name: 'My Custom Template',
  });
  const [dimensions, setDimensions] = useState<CardDimensions>({ ...CARD_PRESETS.CR80 });
  const [fields, setFields] = useState<Record<string, string>>({});
  const [logo, setLogo] = useState<string | undefined>();
  const [exporting, setExporting] = useState(false);

  const cardData: CardData = { template, dimensions, logo, fields };

  const handleFieldChange = (id: string, value: string) => setFields(prev => ({ ...prev, [id]: value }));

  const handleAddField = () => {
    const id = `custom_${Date.now()}`;
    setTemplate(prev => ({
      ...prev,
      fields: [...prev.fields, {
        id, label: 'New Field', value: '', x: 35, y: 80,
        fontSize: 12, fontWeight: 'normal' as const, fontFamily: 'Arial, sans-serif',
        color: '#64748b', textAlign: 'left' as const, maxWidth: 60, visible: true,
      }],
    }));
  };

  const handleRemoveField = (id: string) => {
    setTemplate(prev => ({ ...prev, fields: prev.fields.filter(f => f.id !== id) }));
    setFields(prev => { const n = { ...prev }; delete n[id]; return n; });
  };

  const handleDownloadPng = async () => {
    setExporting(true);
    try {
      const outName = `Template_${Date.now()}.png`;
      await downloadCard(cardData, `Template_${Date.now()}`, 'png');
      await recordToolHistorySafely({
        tool: 'id-card-template-maker',
        toolName: 'ID Card Template Maker',
        inputFiles: [{ name: template.name || 'template.json', type: 'application/json' }],
        outputFile: { name: outName, type: 'image/png' },
        status: 'completed',
        metadata: { format: 'png', templateName: template.name, width: dimensions.widthPx, height: dimensions.heightPx },
      });
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadJpg = async () => {
    setExporting(true);
    try {
      const outName = `Template_${Date.now()}.jpg`;
      await downloadCard(cardData, `Template_${Date.now()}`, 'jpeg');
      await recordToolHistorySafely({
        tool: 'id-card-template-maker',
        toolName: 'ID Card Template Maker',
        inputFiles: [{ name: template.name || 'template.json', type: 'application/json' }],
        outputFile: { name: outName, type: 'image/jpeg' },
        status: 'completed',
        metadata: { format: 'jpg', templateName: template.name, width: dimensions.widthPx, height: dimensions.heightPx },
      });
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadPdf = async () => {
    setExporting(true);
    try {
      const outName = `ID_Card_PDF_${Date.now()}.pdf`;
      await generateSingleCardPdf(cardData);
      await recordToolHistorySafely({
        tool: 'id-card-template-maker',
        toolName: 'ID Card Template Maker',
        inputFiles: [{ name: template.name || 'template.json', type: 'application/json' }],
        outputFile: { name: outName, type: 'application/pdf' },
        status: 'completed',
        metadata: { format: 'pdf', templateName: template.name, width: dimensions.widthPx, height: dimensions.heightPx },
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2">
            <Link to="/tools" className="hover:text-teal-400 transition-colors">Tools Catalog</Link><span>/</span>
            <Link to="/tools?category=ID Card" className="hover:text-teal-400 transition-colors">ID Card Tools</Link><span>/</span>
            <span className="text-teal-400">ID Card Template Maker</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 to-cyan-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">ID Card Template Maker</h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Design a reusable custom ID card template with colors, fields, and layout.</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium"><ShieldCheck className="w-3.5 h-3.5" />Client-Side</span>
          <Link to="/tools"><Button variant="secondary" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>Back</Button></Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <IdCardDimensionPicker dimensions={dimensions} onChange={setDimensions} />

          {/* Template design controls */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/60 space-y-4">
            <h3 className="text-sm font-bold text-white">Template Design</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Background</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={template.backgroundColor} onChange={e => setTemplate(p => ({ ...p, backgroundColor: e.target.value }))} className="w-8 h-8 rounded-lg border border-slate-700 cursor-pointer bg-transparent" aria-label="Background color" />
                  <span className="text-xs font-mono text-slate-400">{template.backgroundColor}</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Accent</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={template.accentColor} onChange={e => setTemplate(p => ({ ...p, accentColor: e.target.value }))} className="w-8 h-8 rounded-lg border border-slate-700 cursor-pointer bg-transparent" aria-label="Accent color" />
                  <span className="text-xs font-mono text-slate-400">{template.accentColor}</span>
                </div>
              </div>
            </div>
            <Input id="tpl-header" label={`Header Height (${template.headerHeight}%)`} type="range" min={0} max={40} value={template.headerHeight} onChange={e => setTemplate(p => ({ ...p, headerHeight: Number(e.target.value) }))} />
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Border</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={template.borderColor} onChange={e => setTemplate(p => ({ ...p, borderColor: e.target.value }))} className="w-8 h-8 rounded-lg border border-slate-700 cursor-pointer bg-transparent" aria-label="Border color" />
                  <label className="flex items-center gap-1 text-xs text-slate-300 cursor-pointer">
                    <input type="checkbox" checked={template.showBorder} onChange={e => setTemplate(p => ({ ...p, showBorder: e.target.checked }))} className="w-3 h-3 rounded border-slate-600 bg-slate-800 text-teal-500" />
                    Show
                  </label>
                </div>
              </div>
              <Input id="tpl-border-w" label="Border Width" type="number" min={0} max={5} value={template.borderWidth} onChange={e => setTemplate(p => ({ ...p, borderWidth: Number(e.target.value) }))} />
            </div>
          </div>

          <IdCardPhotoUploader label="Organization Logo" imageUrl={logo} onImageChange={setLogo} compact />

          <IdCardFieldEditor fields={template.fields} values={fields} onChange={handleFieldChange} onAddField={handleAddField} onRemoveField={handleRemoveField} />
        </div>

        <div className="space-y-6">
          <IdCardCanvas cardData={cardData} scale={0.5} />
          <IdCardExportPanel onDownloadPng={handleDownloadPng} onDownloadJpg={handleDownloadJpg} onDownloadPdf={handleDownloadPdf} disabled={exporting} loading={exporting} />
        </div>
      </div>
    </div>
  );
};
