import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  Sparkles,
  ArrowRight,
  Clock,
  HardDrive,
  FileCheck2,
  CheckCircle,
  Wrench,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../features/store';
import { fetchTools, fetchFavoriteTools, toggleFavoriteTool } from '../features/tools';
import { StatsCard } from '../components/dashboard/StatsCard';
import { ToolCard } from '../components/tools/ToolCard';
import { Button, Modal } from '../components/common';
import {
  mockStats,
  mockTools,
  mockRecentActivities,
  mockStorageBreakdown,
} from '../utils/mockData';
import { ToolItem, RecentActivity } from '../types';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [selectedTool, setSelectedTool] = useState<ToolItem | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [toolsList, setToolsList] = useState<ToolItem[]>(mockTools);
  const [activities] = useState<RecentActivity[]>(mockRecentActivities);

  const { favoriteToolIds } = useAppSelector((state) => state.tools);

  React.useEffect(() => {
    dispatch(fetchTools());
    dispatch(fetchFavoriteTools());
  }, [dispatch]);

  const handleToggleFavorite = (toolId: string) => {
    dispatch(toggleFavoriteTool(toolId));
    setToolsList((prev) =>
      prev.map((t) => (t.id === toolId ? { ...t, isFavorite: !t.isFavorite } : t))
    );
  };

  const handleLaunchTool = (tool: ToolItem) => {
    if (
      tool.id === 'passport-photo-studio' ||
      tool.id === 'photo-bg-remove' ||
      tool.title.toLowerCase().includes('passport')
    ) {
      navigate('/tools/passport-photo-studio');
      return;
    }
    if (
      tool.id === 'image-to-pdf' ||
      tool.id === 'photo-converter' ||
      tool.title.toLowerCase().includes('image to pdf')
    ) {
      navigate('/tools/image-to-pdf');
      return;
    }
    if (
      tool.id === 'pdf-merge' ||
      tool.title.toLowerCase().includes('merge pdf') ||
      tool.title.toLowerCase().includes('combine')
    ) {
      navigate('/tools/pdf-merge');
      return;
    }
    if (
      tool.id === 'aadhaar-print-studio' ||
      tool.title.toLowerCase().includes('aadhaar')
    ) {
      navigate('/tools/aadhaar-print-studio');
      return;
    }
    if (
      tool.id === 'ayushman-print-tool' ||
      tool.title.toLowerCase().includes('ayushman') ||
      tool.title.toLowerCase().includes('pmjay') ||
      tool.title.toLowerCase().includes('health card')
    ) {
      navigate('/tools/ayushman-print-tool');
      return;
    }
    setSelectedTool(tool);
  };

  const favoriteTools = toolsList.filter((t) => t.isFavorite).slice(0, 4);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner / Welcome Action Card */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-blue-950/70 via-slate-900 to-purple-950/70 border border-slate-800/80 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-full blur-3xl pointer-events-none -z-0" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[11px] font-bold text-blue-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>RajSaurbh Tools_Hub • Active</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome to RajSaurbh Tools_Hub
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Batch process PDFs, remove photo backgrounds with AI, extract text with OCR, or manage your stored processed files.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              onClick={() => setIsUploadModalOpen(true)}
              variant="gradient"
              size="md"
              leftIcon={<UploadCloud className="w-4 h-4" />}
            >
              Quick File Process
            </Button>
            <Link to="/tools">
              <Button
                variant="secondary"
                size="md"
                leftIcon={<Wrench className="w-4 h-4" />}
              >
                All Tools
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Primary Stats Cards */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            System Metrics & Analytics
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">Last 30 Days</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {mockStats.map((stat) => (
            <StatsCard key={stat.id} stat={stat} />
          ))}
        </div>
      </section>

      {/* Quick Access & Favorite Tools */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Quick Tool Launchpad
            </h3>
            <p className="text-xs text-slate-400">
              Your favorite and most frequently used processing tools.
            </p>
          </div>
          <Link to="/tools" className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1">
            <span>View all 18 tools</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {favoriteTools.map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              onLaunch={handleLaunchTool}
              onToggleFavorite={handleToggleFavorite}
              isFavorite={favoriteToolIds.includes(tool.id) || !!tool.isFavorite}
            />
          ))}
        </div>
      </section>

      {/* Dual Section: Recent Processing Activity & Storage Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activities (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                Recent Processing History
              </h3>
              <p className="text-xs text-slate-400">
                Latest batch files executed in your local environment.
              </p>
            </div>
            <span className="text-xs font-medium text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
              {activities.length} Files Processed
            </span>
          </div>

          <div className="rounded-2xl bg-slate-900/70 border border-slate-800/80 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/40 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3.5 px-4 sm:px-6">File Name</th>
                    <th className="py-3.5 px-4">Tool Used</th>
                    <th className="py-3.5 px-4">Size</th>
                    <th className="py-3.5 px-4">Time</th>
                    <th className="py-3.5 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {activities.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-200">
                        <div className="flex items-center gap-2.5 max-w-[200px] sm:max-w-none">
                          <FileCheck2 className="w-4 h-4 text-blue-400 shrink-0" />
                          <span className="truncate">{item.fileName}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[11px] font-medium">
                          {item.toolName}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                        {item.size}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        {item.timestamp}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle className="w-3 h-3" />
                          <span>Done</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Storage Breakdown Widget (1 Col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-blue-400" />
              Storage Distribution
            </h3>
            <span className="text-xs font-mono text-purple-400">4.2 / 10 GB</span>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-6 shadow-xl">
            {/* Visual Gauge Bar */}
            <div className="space-y-2">
              <div className="flex h-3 w-full rounded-full bg-slate-950 overflow-hidden gap-0.5 p-0.5 border border-slate-800">
                <div className="h-full bg-cyan-500 rounded-l-full" style={{ width: '50%' }} />
                <div className="h-full bg-purple-500" style={{ width: '33%' }} />
                <div className="h-full bg-blue-500 rounded-r-full" style={{ width: '17%' }} />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Total 10.0 GB Cloud Allocation</span>
                <span className="text-emerald-400 font-semibold">58% Free</span>
              </div>
            </div>

            {/* Category details */}
            <div className="space-y-3 pt-2 border-t border-slate-800/80">
              {mockStorageBreakdown.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${cat.color}`} />
                    <span className="text-slate-300 font-medium">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-mono text-[11px]">{cat.size}</span>
                    <span className="text-slate-500 text-[10px]">({cat.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Optimize Button */}
            <Button variant="secondary" size="sm" className="w-full">
              Clean Temporary Cache
            </Button>
          </div>
        </div>
      </div>

      {/* Tool Launch Modal (Preview) */}
      {selectedTool && (
        <Modal
          isOpen={!!selectedTool}
          onClose={() => setSelectedTool(null)}
          title={
            <div className="flex items-center gap-2.5">
              <span className="text-lg font-bold text-white">{selectedTool.title}</span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">
                {selectedTool.category}
              </span>
            </div>
          }
          description={selectedTool.description}
          footer={
            <>
              <Button variant="ghost" size="sm" onClick={() => setSelectedTool(null)}>
                Cancel
              </Button>
              <Button
                variant="gradient"
                size="sm"
                onClick={() => {
                  alert(`Phase 3 will launch processor for: ${selectedTool.title}`);
                  setSelectedTool(null);
                }}
              >
                Proceed to Processor
              </Button>
            </>
          }
        >
          <div className="p-6 text-center space-y-4 rounded-xl bg-slate-950/60 border border-dashed border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mx-auto flex items-center justify-center">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Drag & drop files here</p>
              <p className="text-xs text-slate-400 mt-1">
                Supported formats: {selectedTool.fileTypes?.join(', ') || 'All standard files'}
              </p>
            </div>
            <p className="text-[11px] text-purple-400 font-medium">
              ⚡ Expected speed: {selectedTool.estimatedSpeed || '< 2s'}
            </p>
          </div>
        </Modal>
      )}

      {/* Quick Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Quick File Processor"
        description="Select or drop any document, image, or PDF to begin batch processing."
        footer={
          <Button variant="secondary" size="sm" onClick={() => setIsUploadModalOpen(false)}>
            Close
          </Button>
        }
      >
        <div className="p-8 text-center space-y-4 rounded-xl bg-slate-950/60 border border-dashed border-slate-800">
          <UploadCloud className="w-10 h-10 text-blue-400 mx-auto" />
          <div>
            <h4 className="text-sm font-bold text-white">Drop your files here to start</h4>
            <p className="text-xs text-slate-400 mt-1">
              Supports PDF, PNG, JPG, WEBP, DOCX, and scanned documents up to 50MB.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};
