import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  ArrowLeft,
  Crop,
  Sliders,
  FileSpreadsheet,
  Trash2,
} from 'lucide-react';
import {
  AyushmanUploader,
  AyushmanCropper,
  AyushmanEnhancer,
  AyushmanPrintLayout,
  AyushmanPreview,
} from '../components/ayushman';
import {
  AyushmanCardItem,
  AyushmanPrintOptions,
  DEFAULT_PRINT_OPTIONS,
  CardCropBox,
  ImageAdjustments,
} from '../utils/ayushmanProcessor';
import { Button } from '../components/common/Button';

export const AyushmanPrintStudioPage: React.FC = () => {
  const [cards, setCards] = useState<AyushmanCardItem[]>([]);
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  const [activeStep, setActiveStep] = useState<'crop' | 'enhance' | 'layout'>('crop');
  const [printOptions, setPrintOptions] = useState<AyushmanPrintOptions>(DEFAULT_PRINT_OPTIONS);

  const activeCard = cards[activeCardIndex] || cards[0];

  const handleCardsLoaded = (newCards: AyushmanCardItem[]) => {
    setCards((prev) => {
      const combined = [...prev, ...newCards];
      return combined.slice(0, 5); // max 5 cards
    });
    setActiveCardIndex(cards.length);
    setActiveStep('crop');
  };

  const handleCropChange = (frontCrop: CardCropBox, backCrop: CardCropBox) => {
    if (!activeCard) return;
    setCards((prev) =>
      prev.map((card, idx) =>
        idx === activeCardIndex ? { ...card, frontCrop, backCrop } : card
      )
    );
  };

  const handleAdjustmentsChange = (adjustments: ImageAdjustments) => {
    if (!activeCard) return;
    setCards((prev) =>
      prev.map((card, idx) =>
        idx === activeCardIndex ? { ...card, adjustments } : card
      )
    );
  };

  const handleRemoveCard = (index: number) => {
    setCards((prev) => prev.filter((_, idx) => idx !== index));
    setActiveCardIndex(0);
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Breadcrumbs & Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2">
            <Link to="/tools" className="hover:text-blue-400 transition-colors">
              Tools Catalog
            </Link>
            <span>/</span>
            <Link to="/tools?category=Photo" className="hover:text-blue-400 transition-colors">
              Document & Photo Studio
            </Link>
            <span>/</span>
            <span className="text-emerald-400">Ayushman Card Print Tool</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Ayushman Card Print Tool Pro
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Crop PM-JAY Front & Back card regions, enhance contrast, and tile 1 to 5 cards on A4 print sheets.
              </p>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <Link to="/tools">
          <Button variant="secondary" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Tools
          </Button>
        </Link>
      </div>

      {/* Main Workspace */}
      {cards.length === 0 ? (
        /* Empty State */
        <AyushmanUploader onCardsLoaded={handleCardsLoaded} hasCards={false} />
      ) : (
        /* Loaded Workspace */
        <div className="space-y-6 animate-fadeIn">
          {/* Multi-Card Selector Tabs (1 to 5 cards) */}
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-lg">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">
                Cards ({cards.length}/5):
              </span>

              {cards.map((card, idx) => (
                <div
                  key={card.id}
                  onClick={() => setActiveCardIndex(idx)}
                  className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer border transition-all ${
                    idx === activeCardIndex
                      ? 'bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-500/20'
                      : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span className="max-w-[120px] truncate">{card.name}</span>
                  {cards.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveCard(idx);
                      }}
                      className="p-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {cards.length < 5 && (
              <div className="w-auto">
                <AyushmanUploader
                  onCardsLoaded={handleCardsLoaded}
                  hasCards={true}
                  totalCardsCount={cards.length}
                />
              </div>
            )}
          </div>

          {/* Workflow Step Switcher */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveStep('crop')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeStep === 'crop'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Crop className="w-3.5 h-3.5" />
              <span>1. Crop Front & Back (85.6 × 54 mm)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStep('enhance')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeStep === 'enhance'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>2. Clarity & Contrast</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStep('layout')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeStep === 'layout'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>3. A4 Sheet Layout & Download</span>
            </button>
          </div>

          {/* Step 1: Crop Front & Back */}
          {activeStep === 'crop' && (
            <div className="animate-fadeIn">
              <AyushmanCropper
                cardItem={activeCard}
                onChangeCrop={handleCropChange}
              />
            </div>
          )}

          {/* Step 2: Enhance */}
          {activeStep === 'enhance' && (
            <div className="animate-fadeIn">
              <AyushmanEnhancer
                cardItem={activeCard}
                onChangeAdjustments={handleAdjustmentsChange}
              />
            </div>
          )}

          {/* Step 3: Layout & Export */}
          {activeStep === 'layout' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">
              <div className="lg:col-span-6">
                <AyushmanPrintLayout
                  options={printOptions}
                  onChangeOptions={setPrintOptions}
                  totalCards={cards.length}
                />
              </div>

              <div className="lg:col-span-6 sticky top-6">
                <AyushmanPreview
                  cards={cards}
                  options={printOptions}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
