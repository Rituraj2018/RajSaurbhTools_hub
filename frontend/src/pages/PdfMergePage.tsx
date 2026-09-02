import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  ArrowLeft,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  PdfMergeUploader,
  PdfFileList,
  PdfMergeActionCard,
} from '../components/pdfMerge';
import { PdfFileItem } from '../utils/pdfMergeProcessor';
import { Button } from '../components/common/Button';

export const PdfMergePage: React.FC = () => {
  const [files, setFiles] = useState<PdfFileItem[]>([]);

  const handleFilesAdded = (newFiles: PdfFileItem[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleReorder = (reordered: PdfFileItem[]) => {
    setFiles(reordered);
  };

  const handleRemove = (id: string) => {
    setFiles((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearAll = () => {
    setFiles([]);
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
            <Link to="/tools?category=PDF" className="hover:text-blue-400 transition-colors">
              PDF Suite
            </Link>
            <span>/</span>
            <span className="text-blue-400">PDF Merge</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-red-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                PDF Merge Master Pro
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Combine multiple PDF documents into a single organized file in seconds with zero cloud uploads.
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

      {/* Main Content Workspace */}
      {files.length === 0 ? (
        /* Empty State */
        <div className="space-y-8">
          <PdfMergeUploader onFilesAdded={handleFilesAdded} hasFiles={false} />

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Instant Client-Side Merging</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                PDF files are parsed and assembled directly in your browser's memory without sending confidential documents to external servers.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Custom Page Ordering</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Drag and drop or use arrow buttons to organize file sequences, view exact page count tallies, and remove files.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Full Vector & Quality Retention</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Retains original vector typography, bookmarks, images, and page geometries with zero perceptible compression loss.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Workspace with Uploaded Files */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">
          {/* Left Column (7 cols): File Queue & Reordering */}
          <div className="lg:col-span-7 space-y-6">
            <PdfFileList
              files={files}
              onReorder={handleReorder}
              onRemove={handleRemove}
              onClearAll={handleClearAll}
            />

            {/* Uploader to add more PDFs */}
            <PdfMergeUploader
              onFilesAdded={handleFilesAdded}
              hasFiles={true}
              totalFilesCount={files.length}
            />
          </div>

          {/* Right Column (5 cols): Sticky Merge Action & Document Summary */}
          <div className="lg:col-span-5 space-y-6 sticky top-6">
            <PdfMergeActionCard files={files} />
          </div>
        </div>
      )}
    </div>
  );
};
