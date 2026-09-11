import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Button } from '../components/common/Button';
import {
  IdCardCanvas,
  IdCardFieldEditor,
  IdCardPhotoUploader,
  IdCardTemplateSelector,
  IdCardDimensionPicker,
  IdCardExportPanel,
} from '../components/idCard';
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

export const IdCardMakerPage: React.FC = () => {
  const [template, setTemplate] = useState<CardTemplate>({ ...DEFAULT_TEMPLATES[0] });
  const [dimensions, setDimensions] = useState<CardDimensions>({ ...CARD_PRESETS.CR80 });
  const [fields, setFields] = useState<Record<string, string>>({});
  const [photo, setPhoto] = useState<string | undefined>();
  const [logo, setLogo] = useState<string | undefined>();
  const [exporting, setExporting] = useState(false);
  const lastCanvasRef = React.useRef<HTMLCanvasElement | null>(null);

  const cardData: CardData = {
    template,
    dimensions,
    photo,
    logo,
    fields,
  };

  const handleFieldChange = (fieldId: string, value: string) => {
    setFields(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleTemplateSelect = (tpl: CardTemplate) => {
    setTemplate({ ...tpl });
  };

  const handleCanvasReady = useCallback((canvas: HTMLCanvasElement) => {
    lastCanvasRef.current = canvas;
  }, []);

  const handleAddField = () => {
    const id = `custom_${Date.now()}`;
    setTemplate(prev => ({
      ...prev,
      fields: [
        ...prev.fields,
        {
          id,
          label: 'Custom Field',
          value: '',
          x: 35,
          y: 80,
          fontSize: 12,
          fontWeight: 'normal' as const,
          fontFamily: 'Arial, sans-serif',
          color: '#64748b',
          textAlign: 'left' as const,
          maxWidth: 60,
          visible: true,
        },
      ],
    }));
  };

  const handleRemoveField = (fieldId: string) => {
    setTemplate(prev => ({
      ...prev,
      fields: prev.fields.filter(f => f.id !== fieldId),
    }));
    setFields(prev => {
      const next = { ...prev };
      delete next[fieldId];
      return next;
    });
  };

  const handleDownloadPng = async () => {
    setExporting(true);
    const filename = `ID_Card_${Date.now()}.png`;
    try {
      await downloadCard(cardData, filename.replace(/\.png$/, ''), 'png');
      await recordToolHistorySafely({
        tool: 'id-card-maker',
        toolName: 'ID Card Maker',
        inputFiles: [{ name: template.name || 'ID Card Template', type: 'application/json' }],
        outputFile: { name: filename, type: 'image/png' },
        status: 'completed',
        metadata: { template: template.name, dimensions: `${dimensions.widthMm}x${dimensions.heightMm}mm`, format: 'png' },
      });
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadJpg = async () => {
    setExporting(true);
    const filename = `ID_Card_${Date.now()}.jpg`;
    try {
      await downloadCard(cardData, filename.replace(/\.jpg$/, ''), 'jpeg', 0.95);
      await recordToolHistorySafely({
        tool: 'id-card-maker',
        toolName: 'ID Card Maker',
        inputFiles: [{ name: template.name || 'ID Card Template', type: 'application/json' }],
        outputFile: { name: filename, type: 'image/jpeg' },
        status: 'completed',
        metadata: { template: template.name, dimensions: `${dimensions.widthMm}x${dimensions.heightMm}mm`, format: 'jpeg' },
      });
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadPdf = async () => {
    setExporting(true);
    const filename = `ID_Card_${Date.now()}.pdf`;
    try {
      await generateSingleCardPdf(cardData);
      await recordToolHistorySafely({
        tool: 'id-card-maker',
        toolName: 'ID Card Maker',
        inputFiles: [{ name: template.name || 'ID Card Template', type: 'application/json' }],
        outputFile: { name: filename, type: 'application/pdf' },
        status: 'completed',
        metadata: { template: template.name, dimensions: `${dimensions.widthMm}x${dimensions.heightMm}mm`, format: 'pdf' },
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2">
            <Link to="/tools" className="hover:text-teal-400 transition-colors">Tools Catalog</Link>
            <span>/</span>
            <Link to="/tools?category=ID Card" className="hover:text-teal-400 transition-colors">ID Card Tools</Link>
            <span>/</span>
            <span className="text-teal-400">ID Card Maker</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 to-cyan-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                ID Card Maker
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Create professional, customizable ID cards with photos, logos, and text fields.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            100% Client-Side
          </span>
          <Link to="/tools">
            <Button variant="secondary" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
              Back to Tools
            </Button>
          </Link>
        </div>
      </div>

      {/* Main workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Controls */}
        <div className="space-y-6">
          <IdCardTemplateSelector
            selectedTemplateId={template.id}
            onSelect={handleTemplateSelect}
          />

          <IdCardDimensionPicker
            dimensions={dimensions}
            onChange={setDimensions}
          />

          <div className="grid grid-cols-2 gap-4">
            <IdCardPhotoUploader
              label="Photo"
              imageUrl={photo}
              onImageChange={setPhoto}
              aspectHint="3:4 passport-style"
            />
            <IdCardPhotoUploader
              label="Logo"
              imageUrl={logo}
              onImageChange={setLogo}
              aspectHint="Square logo"
              compact
            />
          </div>

          <IdCardFieldEditor
            fields={template.fields}
            values={fields}
            onChange={handleFieldChange}
            onAddField={handleAddField}
            onRemoveField={handleRemoveField}
          />
        </div>

        {/* Right: Preview & Export */}
        <div className="space-y-6">
          <IdCardCanvas
            cardData={cardData}
            scale={0.5}
            onCanvasReady={handleCanvasReady}
          />

          <IdCardExportPanel
            onDownloadPng={handleDownloadPng}
            onDownloadJpg={handleDownloadJpg}
            onDownloadPdf={handleDownloadPdf}
            disabled={exporting}
            loading={exporting}
          />
        </div>
      </div>
    </div>
  );
};
