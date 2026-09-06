import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowLeft, ShieldCheck, Layers } from 'lucide-react';
import { PdfToWordUploader, PdfToWordWorkspace } from '../components/pdfToWord';
import { LoadedPdfDocument, inspectPdfDocument } from '../utils/pdfToWordProcessor';
import { Button } from '../components/common/Button';

export const PdfToWordPage: React.FC = () => {
  const [loadedDoc, setLoadedDoc] = useState<LoadedPdfDocument | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const handleFileSelected = async (file: File) => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const doc = await inspectPdfDocument(file);
      setLoadedDoc(doc);
    } catch (err: any) {
      setLoadError(err?.message || 'Failed to read and inspect the selected PDF file.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setLoadedDoc(null);
    setLoadError(null);
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2">
            <Link to="/tools" className="hover:text-blue-400 transition-colors">
              Tools Catalog
            </Link>
            <span>/</span>
            <Link to="/tools?category=PDF" className="hover:text-blue-400 transition-colors">
              PDF Suite
            </Link>
            <span>/</span>
            <span className="text-blue-400">PDF to Word</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                PDF to Word Converter
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Convert PDF documents into editable Microsoft Word (.docx) files with preserved text structure, headings, and pagination.
              </p>
            </div>
          </div>
        </div>

        <Link to="/tools">
          <Button variant="secondary" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Tools
          </Button>
        </Link>
      </div>

      {loadError && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs sm:text-sm max-w-2xl mx-auto">
          {loadError}
        </div>
      )}

      {/* Main Content Area */}
      {!loadedDoc ? (
        <div className="space-y-8">
          <PdfToWordUploader onFileSelected={handleFileSelected} isLoading={isLoading} />

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Authentic DOCX Output</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generates genuine Microsoft Word OpenXML (.docx) documents compatible with Word, Google Docs, and LibreOffice.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Smart Structure Extraction</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Reconstructs lines, paragraphs, headings, typography, and pagination from complex PDF text streams automatically.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">100% Client-Side Privacy</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Entire conversion happens in your browser. Confidential contracts and personal PDFs are never uploaded to any server.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <PdfToWordWorkspace document={loadedDoc} onReset={handleReset} />
      )}
    </div>
  );
};
