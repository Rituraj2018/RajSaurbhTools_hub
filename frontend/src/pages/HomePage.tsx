import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Image as ImageIcon,
  FileSpreadsheet,
  Server,
  Database,
  ArrowRight,
  Cpu,
  RefreshCw,
  LayoutDashboard,
  Zap,
  AlertCircle,
  ShieldCheck,
  Lock,
  Printer,
  CreditCard,
  QrCode,
  Layers,
  Sliders,
  Globe,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../features/store';
import { fetchSystemHealth } from '../features/systemSlice';
import { toolsService, Tool, fetchTools, fetchFavoriteTools, toggleFavoriteTool } from '../features/tools';
import { Website } from '../types/website';
import { websiteApi } from '../api/websiteApi';
import { Button } from '../components/common';
import { EmptyState } from '../components/common/EmptyState';
import { ToolCard } from '../components/tools';
import { WebsiteCard } from '../components/websites';
import heroBg from '../assets/hero-bg.svg';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { health, loading, error, lastChecked } = useAppSelector((state) => state.system);
  const { user } = useAppSelector((state) => state.auth);
  const { tools, favoriteToolIds } = useAppSelector((state) => state.tools);

  const isAdmin = user?.role === 'admin';
  const totalToolsCount = tools.length > 0 ? tools.length : 16;

  const [featuredTools, setFeaturedTools] = useState<Tool[]>([]);
  const [loadingTools, setLoadingTools] = useState<boolean>(true);
  const [errorTools, setErrorTools] = useState<string | null>(null);

  const [usefulWebsites, setUsefulWebsites] = useState<Website[]>([]);
  const [loadingWebsites, setLoadingWebsites] = useState<boolean>(true);
  const [errorWebsites, setErrorWebsites] = useState<string | null>(null);

  const loadFeaturedTools = useCallback(async () => {
    setLoadingTools(true);
    setErrorTools(null);
    try {
      const tools = await toolsService.getTools({ isFeatured: true });
      setFeaturedTools(tools.slice(0, 6));
    } catch (err: any) {
      console.error('Failed to load featured tools:', err);
      setErrorTools(err?.message || 'Failed to load featured tools. Please check your connection and try again.');
    } finally {
      setLoadingTools(false);
    }
  }, []);

  const loadUsefulWebsites = useCallback(async () => {
    setLoadingWebsites(true);
    setErrorWebsites(null);
    try {
      const data = await websiteApi.getWebsites({ isActive: true });
      setUsefulWebsites(data);
    } catch (err: any) {
      console.error('Failed to load useful websites:', err);
      setErrorWebsites(err?.message || 'Unable to load websites right now.');
    } finally {
      setLoadingWebsites(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      dispatch(fetchSystemHealth());
    }
    dispatch(fetchTools());
    dispatch(fetchFavoriteTools());
    loadFeaturedTools();
    loadUsefulWebsites();
  }, [dispatch, loadFeaturedTools, loadUsefulWebsites, isAdmin]);

  const handleToggleFavorite = (toolId: string) => {
    dispatch(toggleFavoriteTool(toolId));
  };

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
    if (id === 'ayushman-print-tool' || id === 'ayushman-card-print' || tool.title?.toLowerCase().includes('ayushman') || tool.title?.toLowerCase().includes('pmjay') || tool.title?.toLowerCase().includes('health card')) {
      navigate('/tools/ayushman-print-tool');
      return;
    }
    if (id === 'photo-compress' || id === 'image-compressor' || tool.title?.toLowerCase().includes('image compress') || tool.title?.toLowerCase().includes('compress image')) {
      navigate('/tools/image-compressor');
      return;
    }
    if (id === 'pdf-split' || tool.title?.toLowerCase().includes('split pdf') || tool.title?.toLowerCase().includes('pdf split')) {
      navigate('/tools/pdf-split');
      return;
    }
    if (id === 'qr-generator' || id === 'qr-code-studio' || tool.title?.toLowerCase().includes('qr')) {
      navigate('/tools/qr-generator');
      return;
    }
    if (id === 'pan-print-studio' || tool.title?.toLowerCase().includes('pan') || tool.title?.toLowerCase().includes('cr80')) {
      navigate('/tools/pan-print-studio');
      return;
    }
    if (id === 'signature-cropper' || tool.title?.toLowerCase().includes('signature crop') || tool.title?.toLowerCase().includes('crop signature')) {
      navigate('/tools/signature-cropper');
      return;
    }
    if (id === 'png-to-jpg' || tool.title?.toLowerCase().includes('png to jpg')) {
      navigate('/tools/png-to-jpg');
      return;
    }
    if (id === 'jpg-to-png' || tool.title?.toLowerCase().includes('jpg to png')) {
      navigate('/tools/jpg-to-png');
      return;
    }
    if (id === 'pdf-to-word' || tool.title?.toLowerCase().includes('pdf to word')) {
      navigate('/tools/pdf-to-word');
      return;
    }
    if (id === 'word-to-pdf' || id === 'doc-word-to-pdf' || tool.title?.toLowerCase().includes('word to pdf')) {
      navigate('/tools/word-to-pdf');
      return;
    }
    if (id === 'image-resizer' || id === 'photo-crop-resize' || tool.title?.toLowerCase().includes('image resiz') || tool.title?.toLowerCase().includes('resize')) {
      navigate('/tools/image-resizer');
      return;
    }
    if (id === 'file-password-protector' || tool.title?.toLowerCase().includes('password protect') || tool.title?.toLowerCase().includes('file protect')) {
      navigate('/tools/file-password-protector');
      return;
    }
    if (id === 'id-card-maker' || tool.title?.toLowerCase().includes('id card maker') || tool.name?.toLowerCase().includes('id card maker')) {
      navigate('/tools/id-card-maker');
      return;
    }
    if (id === 'id-card-print-studio' || tool.title?.toLowerCase().includes('id card print studio') || tool.name?.toLowerCase().includes('id card print studio')) {
      navigate('/tools/id-card-print-studio');
      return;
    }
    if (id === 'id-card-photo-maker' || tool.title?.toLowerCase().includes('id card photo maker') || tool.name?.toLowerCase().includes('id card photo maker')) {
      navigate('/tools/id-card-photo-maker');
      return;
    }
    if (id === 'id-card-resize' || tool.title?.toLowerCase().includes('id card resize') || tool.name?.toLowerCase().includes('id card resize')) {
      navigate('/tools/id-card-resize');
      return;
    }
    if (id === 'id-card-pdf-generator' || tool.title?.toLowerCase().includes('id card pdf generator') || tool.name?.toLowerCase().includes('id card pdf generator')) {
      navigate('/tools/id-card-pdf-generator');
      return;
    }
    if (id === 'id-card-sheet-maker' || tool.title?.toLowerCase().includes('id card sheet maker') || tool.name?.toLowerCase().includes('id card sheet maker')) {
      navigate('/tools/id-card-sheet-maker');
      return;
    }
    if (id === 'id-card-qr-generator' || tool.title?.toLowerCase().includes('id card qr generator') || tool.name?.toLowerCase().includes('id card qr generator')) {
      navigate('/tools/id-card-qr-generator');
      return;
    }
    if (id === 'id-card-barcode-generator' || tool.title?.toLowerCase().includes('id card barcode generator') || tool.name?.toLowerCase().includes('id card barcode generator')) {
      navigate('/tools/id-card-barcode-generator');
      return;
    }
    if (id === 'id-card-template-maker' || tool.title?.toLowerCase().includes('id card template maker') || tool.name?.toLowerCase().includes('id card template maker')) {
      navigate('/tools/id-card-template-maker');
      return;
    }
    if (id === 'id-card-print-preview' || tool.title?.toLowerCase().includes('id card print preview') || tool.name?.toLowerCase().includes('id card print preview')) {
      navigate('/tools/id-card-print-preview');
      return;
    }
    if (id === 'id-card-form-generator' || tool.title?.toLowerCase().includes('id card form generator') || tool.name?.toLowerCase().includes('id card form generator')) {
      navigate('/tools/id-card-form-generator');
      return;
    }
    if (id && id.startsWith('id-card-')) {
      navigate(`/tools/${id}`);
      return;
    }
    navigate('/tools');
  };

  const quickShortcuts = [
    { label: 'Passport Photo Studio', path: '/tools/passport-photo-studio', icon: <ImageIcon className="w-3.5 h-3.5 text-purple-400" /> },
    { label: 'Aadhaar Print Studio', path: '/tools/aadhaar-print-studio', icon: <Printer className="w-3.5 h-3.5 text-blue-400" /> },
    { label: 'Ayushman Card Print', path: '/tools/ayushman-print-tool', icon: <CreditCard className="w-3.5 h-3.5 text-emerald-400" /> },
    { label: 'Image to PDF', path: '/tools/image-to-pdf', icon: <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" /> },
    { label: 'PDF Merge', path: '/tools/pdf-merge', icon: <Layers className="w-3.5 h-3.5 text-indigo-400" /> },
    { label: 'Image Compressor', path: '/tools/image-compressor', icon: <Sliders className="w-3.5 h-3.5 text-cyan-400" /> },
    { label: 'QR Code Studio', path: '/tools/qr-generator', icon: <QrCode className="w-3.5 h-3.5 text-pink-400" /> },
  ];

  return (
    <div className="relative overflow-hidden pb-24">
      {/* Professional SaaS Document & File Toolkit Background Visual */}
      <div
        className="absolute top-0 left-0 right-0 h-[650px] sm:h-[750px] lg:h-[820px] pointer-events-none z-0 overflow-hidden select-none"
        aria-hidden="true"
      >
        <img
          src={heroBg}
          alt=""
          className="w-full h-full object-cover object-top opacity-70 dark:opacity-85 transition-opacity duration-300"
        />
        {/* Soft bottom fade to seamlessly blend into page body */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950/80 dark:to-slate-950" />
      </div>

      {/* Dynamic Background Glow Meshes */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 blur-[150px] pointer-events-none z-0 rounded-full" />
      <div className="absolute top-1/3 right-0 w-[550px] h-[350px] bg-purple-600/12 blur-[140px] pointer-events-none z-0 rounded-full" />
      <div className="absolute top-2/3 left-0 w-[450px] h-[300px] bg-blue-600/10 blur-[130px] pointer-events-none z-0 rounded-full" />

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-20 pb-12">
        <div className="text-center max-w-4xl mx-auto space-y-7">
          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-white">
            All-in-One <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">Document, Photo</span> & PDF Suite
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Welcome to <span className="text-white font-semibold">RajSaurabh Tools_Hub</span>. Fast, private, in-browser utilities for passport photos, government ID printing, PDF merging, compression, and smart format conversions.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link to="/tools">
              <Button
                variant="gradient"
                size="lg"
                leftIcon={<Zap className="w-4 h-4" />}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Explore All {totalToolsCount}+ Tools
              </Button>
            </Link>

            <Link to="/dashboard">
              <Button
                variant="secondary"
                size="lg"
                leftIcon={<LayoutDashboard className="w-4 h-4 text-slate-300" />}
              >
                Launch Dashboard
              </Button>
            </Link>
          </div>

          {/* Quick Tool Chips */}
          <div className="pt-6 border-t border-slate-800/80 max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-3 text-xs font-medium text-slate-400">
              <span>Popular Shortcuts:</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {quickShortcuts.map((sc, i) => (
                <button
                  key={i}
                  onClick={() => navigate(sc.path)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-300 hover:text-white transition-all shadow-sm active:scale-95"
                >
                  {sc.icon}
                  <span>{sc.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Trust / Stats Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-8 max-w-3xl mx-auto">
            <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/70 backdrop-blur-sm text-center">
              <div className="flex justify-center mb-1 text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-sm font-bold text-white">100% Private</div>
              <div className="text-[11px] text-slate-400">Zero Server Storage</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/70 backdrop-blur-sm text-center">
              <div className="flex justify-center mb-1 text-blue-400">
                <Zap className="w-5 h-5" />
              </div>
              <div className="text-sm font-bold text-white">Instant Speed</div>
              <div className="text-[11px] text-slate-400">Client-Side Engine</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/70 backdrop-blur-sm text-center">
              <div className="flex justify-center mb-1 text-purple-400">
                <Printer className="w-5 h-5" />
              </div>
              <div className="text-sm font-bold text-white">Print-Ready</div>
              <div className="text-[11px] text-slate-400">A4, 4x6, CR80 PVC</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/70 backdrop-blur-sm text-center">
              <div className="flex justify-center mb-1 text-amber-400">
                <Lock className="w-5 h-5" />
              </div>
              <div className="text-sm font-bold text-white">Free Forever</div>
              <div className="text-[11px] text-slate-400">No Watermarks</div>
            </div>
          </div>
        </div>
      </section>

      {/* Live System Health & Backend Status Card — Admin Only */}
      {isAdmin && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-2xl relative overflow-hidden">
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
      )}

      {/* Featured Tools Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400 mb-1.5">
              <Zap className="w-3.5 h-3.5" />
              <span>Instant Processors</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Popular Processing Tools
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Top curated utilities chosen by thousands of daily users
            </p>
          </div>
          <Link to="/tools">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              View All Tools Catalog
            </Button>
          </Link>
        </div>

        {loadingTools ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 animate-pulse space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800" />
                  <div className="w-16 h-5 rounded-full bg-slate-800" />
                </div>
                <div className="space-y-2">
                  <div className="w-3/4 h-5 rounded bg-slate-800" />
                  <div className="w-full h-3.5 rounded bg-slate-800/60" />
                  <div className="w-2/3 h-3.5 rounded bg-slate-800/60" />
                </div>
                <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between">
                  <div className="w-16 h-4 rounded bg-slate-800" />
                  <div className="w-12 h-4 rounded bg-slate-800" />
                </div>
              </div>
            ))}
          </div>
        ) : errorTools ? (
          <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Failed to load featured tools</h3>
            <p className="text-xs text-slate-400 max-w-sm">{errorTools}</p>
            <Button
              onClick={loadFeaturedTools}
              variant="secondary"
              size="sm"
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Retry
            </Button>
          </div>
        ) : featuredTools.length === 0 ? (
          <EmptyState
            icon={<Zap className="w-7 h-7 text-purple-400" />}
            title="No featured tools available"
            description="No featured tools are available right now. Explore the full catalog below."
            actionText="View All Tools"
            onAction={() => navigate('/tools')}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTools.map((tool) => {
              const toolObjectId = tool._id ? String(tool._id) : '';
              const toolId = tool.id ? String(tool.id) : '';
              const isFav = favoriteToolIds.some((favId) => {
                const idStr = String(favId);
                return (
                  (toolObjectId && idStr === toolObjectId) ||
                  (toolId && idStr === toolId) ||
                  (tool.slug && idStr === tool.slug)
                );
              });

              return (
                <ToolCard
                  key={tool._id || tool.id || tool.slug}
                  tool={tool}
                  onLaunch={handleLaunchTool}
                  onToggleFavorite={handleToggleFavorite}
                  isFavorite={isFav}
                />
              );
            })}
          </div>
        )}
      </section>

      {/* Platform Pillars / Feature Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Comprehensive Utility Suites
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Engineered for high precision, zero quality loss, and instant export
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-blue-500/40 transition-all duration-300 space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">PDF Master Suite</h3>
              <p className="text-xs text-slate-400 leading-relaxed mt-2">
                Merge multiple volumes, split chapters, encrypt with passwords, compress size, and stamp digital signatures seamlessly.
              </p>
            </div>
            <div className="pt-2 flex flex-wrap gap-1.5 text-[11px]">
              <span className="px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300">Merge PDF</span>
              <span className="px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300">Split PDF</span>
              <span className="px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300">Image to PDF</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-purple-500/40 transition-all duration-300 space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <ImageIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">Photo & Image Studio</h3>
              <p className="text-xs text-slate-400 leading-relaxed mt-2">
                Instant passport photo 4x6 / A4 sheet layouts, smart background removal, WebP/JPG conversion, batch resizing, and signature cropping.
              </p>
            </div>
            <div className="pt-2 flex flex-wrap gap-1.5 text-[11px]">
              <span className="px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300">Passport Photos</span>
              <span className="px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300">Compress</span>
              <span className="px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300">Resize</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-emerald-500/40 transition-all duration-300 space-y-4 group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Printer className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">Card Print & Gov ID Lab</h3>
              <p className="text-xs text-slate-400 leading-relaxed mt-2">
                Perfect CR80 standard front & back card templates for Aadhaar, Ayushman Bharat PMJAY, and PAN cards for instant PVC/paper printing.
              </p>
            </div>
            <div className="pt-2 flex flex-wrap gap-1.5 text-[11px]">
              <span className="px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300">Aadhaar Card</span>
              <span className="px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300">Ayushman Card</span>
              <span className="px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300">PAN Card</span>
            </div>
          </div>
        </div>
      </section>

      {/* Useful Websites Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1.5">
              <Globe className="w-3.5 h-3.5" />
              <span>Recommended Portals</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Useful Websites
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Helpful websites and resources recommended by RajSaurabh Tools_Hub.
            </p>
          </div>
          {isAdmin && (
            <Link to="/admin/websites">
              <Button variant="outline" size="sm" leftIcon={<Globe className="w-3.5 h-3.5" />}>
                Manage Websites
              </Button>
            </Link>
          )}
        </div>

        {loadingWebsites ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 animate-pulse space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-slate-800" />
                  <div className="w-24 h-5 rounded-full bg-slate-800" />
                </div>
                <div className="space-y-2">
                  <div className="w-3/4 h-5 rounded bg-slate-800" />
                  <div className="w-full h-3.5 rounded bg-slate-800/60" />
                  <div className="w-2/3 h-3.5 rounded bg-slate-800/60" />
                </div>
                <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between">
                  <div className="w-16 h-4 rounded bg-slate-800" />
                  <div className="w-24 h-7 rounded-xl bg-slate-800" />
                </div>
              </div>
            ))}
          </div>
        ) : errorWebsites ? (
          <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Unable to load websites right now.</h3>
            <p className="text-xs text-slate-400 max-w-sm">Please check your internet connection and try again.</p>
            <Button
              onClick={loadUsefulWebsites}
              variant="secondary"
              size="sm"
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Retry
            </Button>
          </div>
        ) : usefulWebsites.length === 0 ? (
          <EmptyState
            icon={<Globe className="w-7 h-7 text-indigo-400" />}
            title="Useful websites will appear here soon."
            description="Our team is curating helpful government, educational, and utility portals for you."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {usefulWebsites.map((site) => (
              <WebsiteCard key={site.id || site._id} website={site} />
            ))}
          </div>
        )}
      </section>

      {/* Simple 3-Step Flow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/40 border border-slate-800/90 backdrop-blur-md">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-white">How It Works</h3>
            <p className="text-xs text-slate-400 mt-1">Effortless processing in three quick steps</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="space-y-2">
              <div className="w-10 h-10 mx-auto rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm">
                1
              </div>
              <h4 className="text-sm font-bold text-white">Select Your Tool</h4>
              <p className="text-xs text-slate-400">Choose from over {totalToolsCount}+ purpose-built utilities.</p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 mx-auto rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-sm">
                2
              </div>
              <h4 className="text-sm font-bold text-white">Upload & Customize</h4>
              <p className="text-xs text-slate-400">Adjust borders, page sizes, DPI, and formatting in real-time.</p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 mx-auto rounded-full bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm">
                3
              </div>
              <h4 className="text-sm font-bold text-white">Download & Print</h4>
              <p className="text-xs text-slate-400">Export high-resolution PDF or image files instantly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-blue-900/30 via-indigo-900/30 to-purple-900/30 border border-indigo-500/30 text-center space-y-5 relative overflow-hidden">
          <div className="absolute inset-0 bg-radial-gradient from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ready to streamline your workflow?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Experience lightning fast file operations, government card layouts, and image processing right from your browser.
          </p>
          <div className="pt-2">
            <Link to="/tools">
              <Button variant="gradient" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Get Started with Free Tools
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

