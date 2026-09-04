import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  Sparkles,
  Server,
  Database,
  ArrowRight,
  Cpu,
  RefreshCw,
  LayoutDashboard,
  Zap,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../features/store';
import { fetchSystemHealth } from '../features/systemSlice';
import { Button } from '../components/common';
import { mockTools } from '../utils/mockData';
import { ToolCard } from '../components/tools';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { health, loading, error, lastChecked } = useAppSelector((state) => state.system);

  useEffect(() => {
    dispatch(fetchSystemHealth());
  }, [dispatch]);

  const handleRefreshHealth = () => {
    dispatch(fetchSystemHealth());
  };

  const handleLaunchTool = (tool: any) => {
    const id = tool.slug || tool.id || '';
    if (id === 'passport-photo-studio' || id === 'photo-bg-remove' || tool.title?.toLowerCase().includes('passport')) {
      navigate('/tools/passport-photo-studio');
      return;
    }
    if (id === 'image-to-pdf' || id === 'photo-converter' || tool.title?.toLowerCase().includes('image to pdf')) {
      navigate('/tools/image-to-pdf');
      return;
    }
    if (id === 'pdf-merge' || tool.title?.toLowerCase().includes('merge pdf') || tool.title?.toLowerCase().includes('combine')) {
      navigate('/tools/pdf-merge');
      return;
    }
    if (id === 'aadhaar-print-studio' || tool.title?.toLowerCase().includes('aadhaar')) {
      navigate('/tools/aadhaar-print-studio');
      return;
    }
    if (id === 'ayushman-print-tool' || tool.title?.toLowerCase().includes('ayushman') || tool.title?.toLowerCase().includes('pmjay') || tool.title?.toLowerCase().includes('health card')) {
      navigate('/tools/ayushman-print-tool');
      return;
    }
    if (id === 'photo-compress' || id === 'image-compressor' || tool.title?.toLowerCase().includes('image compress')) {
      navigate('/tools/image-compressor');
      return;
    }
    navigate('/tools');
  };

  const featuredTools = mockTools.filter((t) => t.popular).slice(0, 6);

  return (
    <div className="relative overflow-hidden pb-20">
      {/* Dynamic Background Glow meshes */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-r from-blue-600/15 via-indigo-600/15 to-purple-600/15 blur-[140px] pointer-events-none -z-10 rounded-full" />
      <div className="absolute top-1/3 right-0 w-[500px] h-[300px] bg-purple-600/10 blur-[130px] pointer-events-none -z-10 rounded-full" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-24 pb-14">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-purple-500/30 text-xs font-semibold text-purple-300 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span>Step 2 Complete • Professional UI Foundation Active</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.12] bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            All-in-One Document, Photo & PDF Processing Hub
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Welcome to <span className="text-white font-semibold">RajSaurbh Tools_Hub</span>. A modern,
            high-throughput processing platform built with clean MERN architecture, dark glassmorphic styling, and scalable TypeScript.
          </p>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link to="/dashboard">
              <Button
                variant="gradient"
                size="lg"
                leftIcon={<LayoutDashboard className="w-4 h-4" />}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Launch Dashboard
              </Button>
            </Link>

            <Link to="/tools">
              <Button variant="secondary" size="lg">
                Explore All 18+ Tools
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Live System Health & Backend Status Card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    Backend Health Monitor
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      GET /api/health
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Live endpoint connectivity verified via Redux Toolkit & Axios
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {lastChecked && (
                <span className="text-[11px] text-slate-400 font-mono">
                  Checked: {lastChecked}
                </span>
              )}
              <Button
                onClick={handleRefreshHealth}
                disabled={loading}
                variant="secondary"
                size="sm"
                leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-400' : ''}`} />}
              >
                {loading ? 'Pinging API...' : 'Ping API'}
              </Button>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
            {/* Status */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-1">
              <span className="text-xs text-slate-400 font-medium">Service Status</span>
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    health?.status === 'healthy'
                      ? 'bg-emerald-400 shadow-md shadow-emerald-400/50'
                      : error
                      ? 'bg-rose-500'
                      : 'bg-amber-400'
                  }`}
                />
                <span className="text-sm font-bold capitalize text-white">
                  {loading ? 'Checking...' : health?.status || (error ? 'Offline' : 'Pending')}
                </span>
              </div>
            </div>

            {/* Environment */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-1">
              <span className="text-xs text-slate-400 font-medium">Environment</span>
              <div className="flex items-center gap-1.5 text-white text-sm font-bold">
                <Cpu className="w-4 h-4 text-purple-400" />
                <span>{health?.environment || 'development'}</span>
              </div>
            </div>

            {/* Uptime */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-1">
              <span className="text-xs text-slate-400 font-medium">Server Uptime</span>
              <div className="text-sm font-bold font-mono text-white">
                {health?.uptime || 'N/A'}
              </div>
            </div>

            {/* MongoDB State */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-1">
              <span className="text-xs text-slate-400 font-medium">Database (Mongoose)</span>
              <div className="flex items-center gap-1.5 text-white text-sm font-bold">
                <Database className="w-4 h-4 text-blue-400" />
                <span className="capitalize">{health?.database || 'Configured'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tools Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400 mb-1">
              <Zap className="w-3.5 h-3.5" />
              <span>Instant Processors</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Popular Processing Tools
            </h2>
          </div>
          <Link to="/tools">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              View All Tools Catalog
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} onLaunch={handleLaunchTool} />
          ))}
        </div>
      </section>

      {/* Platform Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">PDF Master Suite</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Merge multiple volumes, split chapters, encrypt with passwords, compress size, and stamp digital signatures seamlessly.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <ImageIcon className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Photo & Image Studio</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              AI background removal, 4K neural upscaling, WebP conversion, batch resizing, and watermarking.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Document & OCR Lab</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Extract editable text from scanned documents, Word-to-PDF conversion, and metadata privacy scrubbing.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
