import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
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
  AlertCircle,
  RefreshCw,
  MessageSquare,
  FileText,
  Image as ImageIcon,
  Scissors,
  Layers,
  Minimize2,
  Camera,
  CreditCard,
  QrCode,
  PenTool,
  Lock,
  ArrowUpCircle,
  X,
  FileImage,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../features/store';
import { fetchTools, fetchFavoriteTools, toggleFavoriteTool } from '../features/tools';
import { StatsCard } from '../components/dashboard/StatsCard';
import { ToolCard } from '../components/tools/ToolCard';
import { Button, Modal } from '../components/common';
import { mockTools } from '../utils/mockData';
import { ToolItem, DashboardData, DashboardStat } from '../types';
import { dashboardApi } from '../api/dashboardApi';
import { CloudStorageSettings } from '../components/cloud/CloudStorageSettings';

/**
 * Helper to format byte counts into human-readable strings (e.g. 1.4 MB)
 */
const formatBytes = (bytes?: number): string => {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

/**
 * Helper to format timestamps into relative time or localized date
 */
const formatRelativeTime = (dateString?: string): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';
  const now = new Date();
  const diffSec = Math.floor((now.getTime() / 1000) - (date.getTime() / 1000));
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

interface FileTypeInfo {
  category: 'pdf' | 'png' | 'jpg' | 'webp' | 'word' | 'image' | 'other';
  label: string;
  badgeColor: string;
}

const detectQuickFileType = (file: File): FileTypeInfo => {
  const name = file.name.toLowerCase();
  const mime = file.type.toLowerCase();

  if (name.endsWith('.pdf') || mime === 'application/pdf') {
    return { category: 'pdf', label: 'PDF Document', badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
  }
  if (name.endsWith('.png') || mime === 'image/png') {
    return { category: 'png', label: 'PNG Image', badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
  }
  if (name.endsWith('.jpg') || name.endsWith('.jpeg') || mime === 'image/jpeg' || mime === 'image/jpg') {
    return { category: 'jpg', label: 'JPEG Image', badgeColor: 'bg-orange-500/20 text-orange-400 border-orange-500/30' };
  }
  if (name.endsWith('.webp') || mime === 'image/webp') {
    return { category: 'webp', label: 'WebP Image', badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30' };
  }
  if (
    name.endsWith('.docx') ||
    name.endsWith('.doc') ||
    mime.includes('word') ||
    mime.includes('officedocument')
  ) {
    return { category: 'word', label: 'Word Document', badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' };
  }
  if (mime.startsWith('image/')) {
    return { category: 'image', label: 'Image File', badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
  }
  return { category: 'other', label: 'Generic File', badgeColor: 'bg-slate-500/20 text-slate-400 border-slate-500/30' };
};

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [selectedTool, setSelectedTool] = useState<ToolItem | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Quick File Process state
  const [quickProcessFile, setQuickProcessFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Live user dashboard data state
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { tools, favoriteToolIds } = useAppSelector((state) => state.tools);

  const loadDashboardStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardApi.getUserDashboardStats();
      setDashboardData(data);
    } catch (err: any) {
      console.error('Failed to load dashboard metrics:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to load live dashboard metrics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    dispatch(fetchTools());
    dispatch(fetchFavoriteTools());
    loadDashboardStats();
  }, [dispatch, loadDashboardStats]);

  const handleToggleFavorite = (toolId: string) => {
    dispatch(toggleFavoriteTool(toolId));
  };

  const handleLaunchTool = (tool: any) => {
    const slug = tool.slug || tool.id || '';
    const name = (tool.name || tool.title || '').toLowerCase();

    if (
      slug === 'passport-photo-studio' ||
      slug === 'photo-bg-remove' ||
      name.includes('passport')
    ) {
      navigate('/tools/passport-photo-studio');
      return;
    }
    if (
      slug === 'image-to-pdf' ||
      slug === 'photo-converter' ||
      name.includes('image to pdf')
    ) {
      navigate('/tools/image-to-pdf');
      return;
    }
    if (
      slug === 'pdf-merge' ||
      name.includes('merge pdf') ||
      name.includes('combine')
    ) {
      navigate('/tools/pdf-merge');
      return;
    }
    if (
      slug === 'aadhaar-print-studio' ||
      name.includes('aadhaar')
    ) {
      navigate('/tools/aadhaar-print-studio');
      return;
    }
    if (
      slug === 'ayushman-print-tool' ||
      slug === 'ayushman-card-print' ||
      name.includes('ayushman') ||
      name.includes('pmjay') ||
      name.includes('health card')
    ) {
      navigate('/tools/ayushman-print-tool');
      return;
    }
    if (
      slug === 'image-compressor' ||
      slug === 'photo-compress' ||
      name.includes('image compress') ||
      name.includes('compress image')
    ) {
      navigate('/tools/image-compressor');
      return;
    }
    if (
      slug === 'pdf-split' ||
      name.includes('split pdf') ||
      name.includes('pdf split')
    ) {
      navigate('/tools/pdf-split');
      return;
    }
    if (
      slug === 'qr-generator' ||
      slug === 'qr-code-studio' ||
      name.includes('qr')
    ) {
      navigate('/tools/qr-generator');
      return;
    }
    if (
      slug === 'pan-print-studio' ||
      name.includes('pan') ||
      name.includes('cr80')
    ) {
      navigate('/tools/pan-print-studio');
      return;
    }
    if (
      slug === 'signature-cropper' ||
      name.includes('signature crop') ||
      name.includes('crop signature')
    ) {
      navigate('/tools/signature-cropper');
      return;
    }
    if (
      slug === 'png-to-jpg' ||
      name.includes('png to jpg')
    ) {
      navigate('/tools/png-to-jpg');
      return;
    }
    if (
      slug === 'jpg-to-png' ||
      name.includes('jpg to png')
    ) {
      navigate('/tools/jpg-to-png');
      return;
    }
    if (
      slug === 'pdf-to-word' ||
      name.includes('pdf to word')
    ) {
      navigate('/tools/pdf-to-word');
      return;
    }
    if (
      slug === 'word-to-pdf' ||
      slug === 'doc-word-to-pdf' ||
      name.includes('word to pdf')
    ) {
      navigate('/tools/word-to-pdf');
      return;
    }
    if (
      slug === 'image-resizer' ||
      slug === 'photo-crop-resize' ||
      name.includes('image resiz') ||
      name.includes('resize image')
    ) {
      navigate('/tools/image-resizer');
      return;
    }
    if (
      slug === 'file-password-protector' ||
      name.includes('password protect') ||
      name.includes('file protect')
    ) {
      navigate('/tools/file-password-protector');
      return;
    }
    setSelectedTool(tool);
  };

  const detectedType = useMemo(() => {
    if (!quickProcessFile) return null;
    return detectQuickFileType(quickProcessFile);
  }, [quickProcessFile]);

  const compatibleTools = useMemo(() => {
    if (!detectedType) return [];
    const sourceList = tools.length > 0 ? tools : mockTools;

    return sourceList.filter((tool: any) => {
      const slug = (tool.slug || tool.id || '').toLowerCase();
      const name = (tool.name || tool.title || '').toLowerCase();
      const cat = (tool.category || '').toLowerCase();

      switch (detectedType.category) {
        case 'pdf':
          return (
            slug === 'pdf-merge' ||
            slug === 'pdf-split' ||
            slug === 'pdf-to-word' ||
            slug === 'aadhaar-print-studio' ||
            slug === 'pan-print-studio' ||
            slug === 'ayushman-print-tool' ||
            slug === 'ayushman-card-print' ||
            slug === 'file-password-protector' ||
            name.includes('merge') ||
            name.includes('split') ||
            name.includes('word') ||
            name.includes('aadhaar') ||
            name.includes('pan') ||
            name.includes('ayushman') ||
            name.includes('password')
          );
        case 'png':
          return (
            slug === 'image-to-pdf' ||
            slug === 'png-to-jpg' ||
            slug === 'image-compressor' ||
            slug === 'photo-compress' ||
            slug === 'image-resizer' ||
            slug === 'photo-crop-resize' ||
            slug === 'passport-photo-studio' ||
            slug === 'photo-bg-remove' ||
            slug === 'signature-cropper' ||
            slug === 'aadhaar-print-studio' ||
            slug === 'pan-print-studio' ||
            slug === 'ayushman-print-tool' ||
            slug === 'ayushman-card-print' ||
            slug === 'file-password-protector' ||
            cat === 'photo' ||
            cat === 'image' ||
            name.includes('png') ||
            name.includes('image') ||
            name.includes('photo') ||
            name.includes('signature')
          );
        case 'jpg':
          return (
            slug === 'image-to-pdf' ||
            slug === 'jpg-to-png' ||
            slug === 'image-compressor' ||
            slug === 'photo-compress' ||
            slug === 'image-resizer' ||
            slug === 'photo-crop-resize' ||
            slug === 'passport-photo-studio' ||
            slug === 'photo-bg-remove' ||
            slug === 'signature-cropper' ||
            slug === 'aadhaar-print-studio' ||
            slug === 'pan-print-studio' ||
            slug === 'ayushman-print-tool' ||
            slug === 'ayushman-card-print' ||
            slug === 'file-password-protector' ||
            cat === 'photo' ||
            cat === 'image' ||
            name.includes('jpg') ||
            name.includes('jpeg') ||
            name.includes('image') ||
            name.includes('photo') ||
            name.includes('signature')
          );
        case 'webp':
          return (
            slug === 'image-to-pdf' ||
            slug === 'image-compressor' ||
            slug === 'photo-compress' ||
            slug === 'image-resizer' ||
            slug === 'photo-crop-resize' ||
            slug === 'passport-photo-studio' ||
            slug === 'photo-bg-remove' ||
            slug === 'signature-cropper' ||
            slug === 'file-password-protector' ||
            cat === 'photo' ||
            cat === 'image' ||
            name.includes('webp') ||
            name.includes('image') ||
            name.includes('photo') ||
            name.includes('signature')
          );
        case 'word':
          return (
            slug === 'word-to-pdf' ||
            slug === 'doc-word-to-pdf' ||
            slug === 'file-password-protector' ||
            name.includes('word') ||
            name.includes('doc')
          );
        case 'image':
          return (
            slug === 'image-to-pdf' ||
            slug === 'image-compressor' ||
            slug === 'photo-compress' ||
            slug === 'image-resizer' ||
            slug === 'photo-crop-resize' ||
            slug === 'passport-photo-studio' ||
            slug === 'file-password-protector' ||
            cat === 'photo' ||
            cat === 'image'
          );
        default:
          return (
            slug === 'file-password-protector' ||
            name.includes('password') ||
            name.includes('protect')
          );
      }
    });
  }, [detectedType, tools]);

  const getToolIcon = (iconName?: string) => {
    switch (iconName?.toLowerCase()) {
      case 'camera':
        return <Camera className="w-4 h-4" />;
      case 'filetext':
      case 'filetype':
      case 'pdf':
        return <FileText className="w-4 h-4" />;
      case 'layers':
      case 'combine':
        return <Layers className="w-4 h-4" />;
      case 'scissors':
      case 'split':
        return <Scissors className="w-4 h-4" />;
      case 'minimize2':
      case 'compress':
        return <Minimize2 className="w-4 h-4" />;
      case 'filecheck':
      case 'document':
        return <FileCheck2 className="w-4 h-4" />;
      case 'creditcard':
      case 'card':
        return <CreditCard className="w-4 h-4" />;
      case 'qrcode':
      case 'qr':
        return <QrCode className="w-4 h-4" />;
      case 'pentool':
      case 'signature':
      case 'pen':
        return <PenTool className="w-4 h-4" />;
      case 'sparkles':
      case 'heartpulse':
        return <Sparkles className="w-4 h-4" />;
      case 'fileimage':
      case 'image':
      case 'imageicon':
        return <FileImage className="w-4 h-4" />;
      case 'lock':
      case 'shield':
      case 'security':
        return <Lock className="w-4 h-4" />;
      default:
        return <Wrench className="w-4 h-4" />;
    }
  };

  const handleFileSelect = (file: File) => {
    setQuickProcessFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const displayTools = useMemo(() => {
    const sourceList = tools.length > 0 ? tools : mockTools;
    const isFav = (t: any) => {
      const toolObjectId = (t as any)._id ? String((t as any)._id) : '';
      const toolId = t.id ? String(t.id) : '';
      const slug = (t as any).slug ? String((t as any).slug) : '';
      return favoriteToolIds.some((favId) => {
        const idStr = String(favId);
        return (
          (toolObjectId && idStr === toolObjectId) ||
          (toolId && idStr === toolId) ||
          (slug && idStr === slug)
        );
      });
    };

    const userFavs = sourceList.filter(isFav);
    const otherTools = sourceList.filter((t) => !isFav(t));
    return [...userFavs, ...otherTools].slice(0, 4);
  }, [tools, favoriteToolIds]);

  // Dynamically compute live stat cards from MongoDB metrics
  const statCards: DashboardStat[] = useMemo(() => {
    const metrics = dashboardData?.metrics || {
      totalToolsUsed: 0,
      filesProcessed: 0,
      storageUsedBytes: 0,
      storageSavedBytes: 0,
      totalFavorites: 0,
    };

    return [
      {
        id: 'tools-used',
        label: 'Total Tools Used',
        value: metrics.totalToolsUsed.toString(),
        numericValue: metrics.totalToolsUsed,
        change: metrics.totalToolsUsed > 0 ? `${metrics.totalToolsUsed} Active` : '0 Active',
        isPositive: metrics.totalToolsUsed > 0,
        icon: 'TrendingUp',
        gradient: 'from-blue-600/20 via-indigo-600/10 to-transparent',
        textColor: 'text-blue-400',
        borderColor: 'border-blue-500/30',
        subtitle:
          metrics.totalToolsUsed === 1
            ? '1 unique tool executed'
            : `${metrics.totalToolsUsed} unique tools executed`,
      },
      {
        id: 'files-processed',
        label: 'Files Processed',
        value: metrics.filesProcessed.toLocaleString(),
        numericValue: metrics.filesProcessed,
        change: metrics.filesProcessed > 0 ? `${metrics.filesProcessed} Done` : '0 Done',
        isPositive: metrics.filesProcessed > 0,
        icon: 'FileText',
        gradient: 'from-purple-600/20 via-fuchsia-600/10 to-transparent',
        textColor: 'text-purple-400',
        borderColor: 'border-purple-500/30',
        subtitle:
          metrics.filesProcessed === 1
            ? '1 file completed'
            : `${metrics.filesProcessed.toLocaleString()} total files completed`,
      },
      {
        id: 'storage-used',
        label: 'Storage Used',
        value: formatBytes(metrics.storageUsedBytes),
        numericValue: metrics.storageUsedBytes,
        change: metrics.storageUsedBytes > 0 ? formatBytes(metrics.storageUsedBytes) : '0 B',
        isPositive: true,
        icon: 'HardDrive',
        gradient: 'from-violet-600/20 via-purple-600/10 to-transparent',
        textColor: 'text-violet-400',
        borderColor: 'border-violet-500/30',
        subtitle: 'Total vault & processed storage',
      },
      {
        id: 'total-favorites',
        label: 'Total Favorites',
        value: metrics.totalFavorites.toString(),
        numericValue: metrics.totalFavorites,
        change: metrics.totalFavorites > 0 ? `${metrics.totalFavorites} Pinned` : '0 Pinned',
        isPositive: metrics.totalFavorites > 0,
        icon: 'FileSpreadsheet',
        gradient: 'from-cyan-600/20 via-blue-600/10 to-transparent',
        textColor: 'text-cyan-400',
        borderColor: 'border-cyan-500/30',
        subtitle:
          metrics.totalFavorites === 1
            ? '1 pinned quick-launch tool'
            : `${metrics.totalFavorites} pinned quick-launch tools`,
      },
    ];
  }, [dashboardData]);

  const recentActivities = dashboardData?.recentActivities || [];
  const storageBreakdown = dashboardData?.storageBreakdown || [];
  const metrics = dashboardData?.metrics || {
    totalToolsUsed: 0,
    filesProcessed: 0,
    storageUsedBytes: 0,
    storageSavedBytes: 0,
    totalFavorites: 0,
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Error Alert Banner with Retry Button */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2.5 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={loadDashboardStats}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            className="shrink-0"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Top Banner / Welcome Action Card */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-blue-950/70 via-slate-900 to-purple-950/70 border border-slate-800/80 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-full blur-3xl pointer-events-none -z-0" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[11px] font-bold text-blue-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>RajSaurabh Tools_Hub • Active</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome to RajSaurabh Tools_Hub
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

      {/* 4 Primary Stats Cards (Live Metrics from MongoDB) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            System Metrics & Analytics
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">
            {loading ? 'Refreshing...' : 'Live MongoDB Metrics'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {statCards.map((stat) => (
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
            <span>View all {tools.length > 0 ? tools.length : 16} tools</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {displayTools.map((tool: any) => {
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
                Latest batch files executed in your personal account.
              </p>
            </div>
            <span className="text-xs font-medium text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
              {metrics.filesProcessed} Total Processed
            </span>
          </div>

          {recentActivities.length === 0 ? (
            <div className="rounded-2xl bg-slate-900/70 border border-slate-800/80 p-10 text-center space-y-3 shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/80 text-slate-500 mx-auto flex items-center justify-center border border-slate-700/50">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-200">No processing history recorded yet</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Files processed through our document, photo, and PDF tools will appear in your live audit log.
                </p>
              </div>
              <Link to="/tools" className="inline-block pt-2">
                <Button variant="secondary" size="sm" leftIcon={<Wrench className="w-3.5 h-3.5" />}>
                  Explore All Tools
                </Button>
              </Link>
            </div>
          ) : (
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
                    {recentActivities.map((item) => (
                      <tr
                        key={item.id || item.fileName}
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
                          {formatRelativeTime(item.createdAt)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.status === 'failed'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : item.status === 'processing'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}
                          >
                            <CheckCircle className="w-3 h-3" />
                            <span className="capitalize">{item.status || 'Done'}</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Storage Breakdown Widget (1 Col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-blue-400" />
              Storage Distribution
            </h3>
            <span className="text-xs font-mono text-purple-400">
              {formatBytes(metrics.storageUsedBytes)}
            </span>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-6 shadow-xl">
            {/* Visual Dynamic Gauge Bar */}
            {metrics.storageUsedBytes === 0 ? (
              <div className="space-y-2">
                <div className="flex h-3 w-full rounded-full bg-slate-950 overflow-hidden p-0.5 border border-slate-800">
                  <div className="h-full bg-slate-800/60 rounded-full w-full" />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>0 B Stored in Vault</span>
                  <span className="text-slate-500 font-semibold">0% Used</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex h-3 w-full rounded-full bg-slate-950 overflow-hidden gap-0.5 p-0.5 border border-slate-800">
                  {storageBreakdown.map((cat, idx) => {
                    if (cat.percentage <= 0) return null;
                    const isFirst = idx === 0;
                    const isLast = idx === storageBreakdown.length - 1;
                    return (
                      <div
                        key={cat.fileType}
                        className={`h-full ${cat.color} ${isFirst ? 'rounded-l-full' : ''} ${
                          isLast ? 'rounded-r-full' : ''
                        }`}
                        style={{ width: `${cat.percentage}%` }}
                        title={`${cat.name}: ${cat.percentage}%`}
                      />
                    );
                  })}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>{formatBytes(metrics.storageUsedBytes)} Total Stored</span>
                  <span className="text-emerald-400 font-semibold">
                    {storageBreakdown.reduce((sum, c) => sum + c.count, 0)} Files
                  </span>
                </div>
              </div>
            )}

            {/* Category details with dynamic percentages */}
            <div className="space-y-3 pt-2 border-t border-slate-800/80">
              {storageBreakdown.map((cat) => (
                <div key={cat.fileType} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${cat.color}`} />
                    <span className="text-slate-300 font-medium">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-mono text-[11px]">{formatBytes(cat.bytes)}</span>
                    <span className="text-slate-500 text-[10px]">({cat.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Clean Cache / Explore Vault Button */}
            <Link to="/vault">
              <Button variant="secondary" size="sm" className="w-full">
                View Vault Files
              </Button>
            </Link>
          </div>

          {/* Personal Cloud Storage Connection */}
          <CloudStorageSettings />

          {/* Feedback & Improvement Entry Point */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-xl space-y-3.5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center shrink-0">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>💬 Help us improve</span>
                </h4>
                <p className="text-[11px] text-slate-400">Have an idea or found a problem?</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your feedback directly shapes new tools, performance boosts, and upcoming features.
            </p>
            <Link to="/feedback" className="block">
              <Button variant="gradient" size="sm" className="w-full justify-center">
                Give Feedback
              </Button>
            </Link>
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

      {/* Quick File Process Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setQuickProcessFile(null);
        }}
        size="lg"
        title={
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <span className="text-base font-bold text-white">Quick File Process</span>
            </div>
          </div>
        }
        description={
          quickProcessFile && detectedType
            ? `Detected ${detectedType.label} • Select an existing tool to process this file.`
            : 'Select or drop any document, image, or PDF to detect compatible existing tools.'
        }
        footer={
          <div className="flex items-center justify-between w-full">
            {quickProcessFile ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuickProcessFile(null)}
                >
                  Select Another File
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setIsUploadModalOpen(false);
                    setQuickProcessFile(null);
                  }}
                >
                  Close
                </Button>
              </>
            ) : (
              <div className="flex justify-end w-full">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsUploadModalOpen(false)}
                >
                  Close
                </Button>
              </div>
            )}
          </div>
        }
      >
        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {!quickProcessFile ? (
            /* File Picker / Drop Zone */
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`group relative p-8 sm:p-10 rounded-2xl border-2 border-dashed cursor-pointer text-center transition-all duration-300 backdrop-blur-sm select-none ${
                isDragging
                  ? 'border-blue-500 bg-blue-600/10 scale-[1.01] shadow-xl shadow-blue-500/10'
                  : 'border-slate-800 hover:border-blue-500/50 bg-slate-950/60 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex flex-col items-center justify-center space-y-3">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 shadow-lg ${
                    isDragging
                      ? 'bg-blue-600 text-white scale-110'
                      : 'bg-blue-600/10 text-blue-400 group-hover:scale-110 border border-blue-500/20'
                  }`}
                >
                  <UploadCloud className="w-7 h-7" />
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                    Click to select or drag & drop file here
                  </p>
                  <p className="text-xs text-slate-400">
                    Automatically detects file format and displays all compatible tools
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                    <ArrowUpCircle className="w-3.5 h-3.5 text-blue-400" />
                    <span>Browse Local File</span>
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Supports PDF, PNG, JPG, WEBP, DOCX (up to 50MB)
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Detected File Details + Compatible Existing Tools */
            <div className="space-y-4">
              {/* Selected File Banner */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    {detectedType?.category === 'pdf' ? (
                      <FileText className="w-5 h-5" />
                    ) : detectedType?.category === 'word' ? (
                      <FileText className="w-5 h-5" />
                    ) : (
                      <ImageIcon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-white truncate" title={quickProcessFile.name}>
                      {quickProcessFile.name}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span>{formatBytes(quickProcessFile.size)}</span>
                      <span>•</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${detectedType?.badgeColor || 'bg-slate-800 text-slate-400'}`}>
                        {detectedType?.label || 'Detected File'}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setQuickProcessFile(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors shrink-0 text-xs font-medium flex items-center gap-1"
                  title="Choose a different file"
                >
                  <X className="w-4 h-4" />
                  <span className="hidden sm:inline">Change</span>
                </button>
              </div>

              {/* Compatible Tools List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Compatible Existing Tools ({compatibleTools.length})
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    Click any tool to launch
                  </span>
                </div>

                {compatibleTools.length === 0 ? (
                  <div className="p-6 rounded-xl bg-slate-950/40 border border-slate-800 text-center space-y-2">
                    <p className="text-xs text-slate-300">
                      No specific tool matched this file type directly.
                    </p>
                    <Link to="/tools" onClick={() => setIsUploadModalOpen(false)}>
                      <Button variant="secondary" size="sm" className="mt-1">
                        Explore All Tools
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[340px] overflow-y-auto pr-1">
                    {compatibleTools.map((tool: any) => {
                      const toolName = tool.name || tool.title;
                      const toolDesc = tool.description;
                      const toolCat = tool.category || 'Tool';
                      const toolIcon = tool.icon;

                      return (
                        <div
                          key={tool._id || tool.id || tool.slug}
                          onClick={() => {
                            setIsUploadModalOpen(false);
                            setQuickProcessFile(null);
                            handleLaunchTool(tool);
                          }}
                          className="group p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500/40 transition-all cursor-pointer flex flex-col justify-between space-y-2.5"
                        >
                          <div className="flex items-start gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                              {getToolIcon(toolIcon)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <h5 className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors truncate">
                                  {toolName}
                                </h5>
                                <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 shrink-0">
                                  {toolCat}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                                {toolDesc}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-end pt-1 border-t border-slate-800/50">
                            <span className="text-[11px] font-bold text-blue-400 group-hover:text-blue-300 flex items-center gap-1">
                              <span>Open Tool</span>
                              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
