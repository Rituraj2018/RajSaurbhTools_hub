import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileType, ArrowLeft, ShieldCheck, FileCheck, Layers } from 'lucide-react';
import { WordToPdfUploader, WordToPdfWorkspace } from '../components/wordToPdf';
import { LoadedWordDocument, inspectWordDocument } from '../utils/wordToPdfProcessor';
import { Button } from '../components/common/Button';

export const WordToPdfPage: React.FC = () => {
  const [loadedDoc, setLoadedDoc] = useState<LoadedWordDocument | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const handleFileSelected = async (file: File) => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const doc = await inspectWordDocument(file);
      setLoadedDoc(doc);
    } catch (err: any) {
      setLoadError(err?.message || 'Failed to inspect and read the selected Word document.');
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
            <Link to="/tools" className="hover:text-indigo-400 transition-colors">
              Tools Catalog
            </Link>
            <span>/</span>
            <Link to="/tools?category=Document" className="hover:text-indigo-400 transition-colors">
              Document Lab
            </Link>
            <span>/</span>
            <span className="text-indigo-400">Word to PDF</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <FileType className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Word to PDF Converter
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Convert Microsoft Word documents (.docx, .doc) into standardized, professional A4 PDF documents in your browser.
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
          <WordToPdfUploader onFileSelected={handleFileSelected} isLoading={isLoading} />

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <FileCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Standard A4 PDF Output</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generates compliant, print-ready PDF documents formatted with standard margins, headers, and pagination.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Typography & Structure Preserved</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automatically extracts headings, paragraphs, bullet points, blockquotes, and tables from Word OpenXML.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">100% In-Memory Privacy</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                All document parsing runs client-side in browser memory. No files are uploaded or permanently stored anywhere.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <WordToPdfWorkspace document={loadedDoc} onReset={handleReset} />
      )}
    </div>
  );
};
