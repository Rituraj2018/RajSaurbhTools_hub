import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  ArrowUp,
  Mail,
  FileText,
  HelpCircle,
  Sparkles,
  CheckCircle2,
  Lock,
  Cpu,
  Heart,
  ChevronRight,
  ShieldAlert,
  Linkedin,
  Instagram,
  Github,
  Facebook,
  MessageSquareHeart,
} from 'lucide-react';
import { useAppSelector } from '../../features/store';
import { Modal } from './Modal';
import { historyApi, getLocalToolUsageMap } from '../../api/historyApi';
import { PopularToolUsage } from '../../types/history.types';

import { BrandLogo } from './BrandLogo';

type SupportModalType = 'help' | 'contact' | 'privacy' | 'terms' | null;

interface DisplayTool {
  name: string;
  path: string;
  badge: string;
  usageCount?: number;
}

interface ToolCatalogItem {
  name: string;
  path: string;
  badge: string;
  slugs: string[];
}

const ALL_TOOLS_CATALOG: ToolCatalogItem[] = [
  {
    name: 'Passport Photo Studio',
    path: '/tools/passport-photo-studio',
    badge: 'Popular',
    slugs: ['passport-photo-studio', 'passport-photo', 'passport photo studio', 'passport photo studio pro'],
  },
  {
    name: 'File Password Protector',
    path: '/tools/file-password-protector',
    badge: 'AES-256',
    slugs: ['file-password-protector', 'file-protector', 'pdf-protect', 'file password protector'],
  },
  {
    name: 'Aadhaar Print Studio Pro',
    path: '/tools/aadhaar-print-studio',
    badge: 'Print Ready',
    slugs: ['aadhaar-print-studio', 'aadhaar-print', 'aadhaar print studio pro', 'aadhaar print studio'],
  },
  {
    name: 'Ayushman Card Print Pro',
    path: '/tools/ayushman-print-tool',
    badge: 'PM-JAY',
    slugs: ['ayushman-print-tool', 'ayushman-card-print', 'ayushman card print tool pro', 'ayushman card print pro'],
  },
  {
    name: 'PAN / CR80 Print Studio',
    path: '/tools/pan-print-studio',
    badge: 'CR80 PVC',
    slugs: ['pan-print-studio', 'pan-card-print', 'pan / cr80 print studio', 'pan / cr80 print studio pro'],
  },
  {
    name: 'Merge PDF Master',
    path: '/tools/pdf-merge',
    badge: 'Utility',
    slugs: ['pdf-merge', 'merge-pdf', 'pdf merge', 'merge pdf master', 'pdf merge master'],
  },
  {
    name: 'Split PDF Pro',
    path: '/tools/pdf-split',
    badge: 'Extract',
    slugs: ['pdf-split', 'split-pdf', 'pdf split', 'split pdf pro'],
  },
  {
    name: 'Image Compressor',
    path: '/tools/image-compressor',
    badge: 'Lossless',
    slugs: ['image-compressor', 'photo-compress', 'image compressor'],
  },
  {
    name: 'QR Code Studio Pro',
    path: '/tools/qr-generator',
    badge: 'UPI Ready',
    slugs: ['qr-generator', 'qr-code-studio', 'qr code studio pro', 'qr code generator'],
  },
  {
    name: 'Signature Cropper',
    path: '/tools/signature-cropper',
    badge: 'Exam Preset',
    slugs: ['signature-cropper', 'signature cropper'],
  },
  {
    name: 'Image to PDF',
    path: '/tools/image-to-pdf',
    badge: 'Popular',
    slugs: ['image-to-pdf', 'jpg-to-pdf', 'image to pdf', 'image to pdf converter'],
  },
  {
    name: 'PDF to Word',
    path: '/tools/pdf-to-word',
    badge: 'Document',
    slugs: ['pdf-to-word', 'pdf to word'],
  },
  {
    name: 'Word to PDF',
    path: '/tools/word-to-pdf',
    badge: 'Convert',
    slugs: ['word-to-pdf', 'word to pdf'],
  },
  {
    name: 'PNG to JPG',
    path: '/tools/png-to-jpg',
    badge: 'Fast JPG',
    slugs: ['png-to-jpg', 'png to jpg'],
  },
  {
    name: 'JPG to PNG',
    path: '/tools/jpg-to-png',
    badge: 'Lossless',
    slugs: ['jpg-to-png', 'jpg to png'],
  },
  {
    name: 'Image Resizer',
    path: '/tools/image-resizer',
    badge: 'Resize',
    slugs: ['image-resizer', 'image resizer'],
  },
];

const DEFAULT_POPULAR_TOOLS: DisplayTool[] = [
  { name: 'Passport Photo Studio', path: '/tools/passport-photo-studio', badge: 'Popular' },
  { name: 'File Password Protector', path: '/tools/file-password-protector', badge: 'AES-256' },
  { name: 'Aadhaar Print Studio Pro', path: '/tools/aadhaar-print-studio', badge: 'Print Ready' },
  { name: 'Ayushman Card Print Pro', path: '/tools/ayushman-print-tool', badge: 'PM-JAY' },
  { name: 'PAN / CR80 Print Studio', path: '/tools/pan-print-studio', badge: 'CR80 PVC' },
];

export const Footer: React.FC = () => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [activeModal, setActiveModal] = useState<SupportModalType>(null);
  const [topTools, setTopTools] = useState<DisplayTool[]>(DEFAULT_POPULAR_TOOLS);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const calculateTopTools = useCallback((apiUsage: PopularToolUsage[] = []) => {
    try {
      const localUsage = getLocalToolUsageMap();
      const usageScoreMap: Record<string, number> = {};

      // Helper to match key with catalog tool
      const findCatalogItem = (identifier: string): ToolCatalogItem | undefined => {
        const cleanId = identifier.toLowerCase().trim();
        return ALL_TOOLS_CATALOG.find((cat) =>
          cat.slugs.some((s) => s.toLowerCase() === cleanId) ||
          cat.name.toLowerCase() === cleanId ||
          cat.path.toLowerCase().endsWith(`/${cleanId}`)
        );
      };

      // 1. Process API Usage rankings
      apiUsage.forEach((item) => {
        const matched = findCatalogItem(item.slug) || (item.toolName ? findCatalogItem(item.toolName) : undefined);
        if (matched) {
          usageScoreMap[matched.path] = (usageScoreMap[matched.path] || 0) + (item.usageCount || 0);
        }
      });

      // 2. Combine with Local/Client Usage
      Object.entries(localUsage).forEach(([key, count]) => {
        const matched = findCatalogItem(key);
        if (matched) {
          usageScoreMap[matched.path] = (usageScoreMap[matched.path] || 0) + (count || 0);
        }
      });

      // 3. Build ranked list of catalog tools
      const scoredTools = ALL_TOOLS_CATALOG.map((tool) => ({
        name: tool.name,
        path: tool.path,
        badge: tool.badge,
        usageCount: usageScoreMap[tool.path] || 0,
      }));

      // Sort descending by usage count
      scoredTools.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));

      const toolsWithUsage = scoredTools.filter((t) => (t.usageCount || 0) > 0);

      // If we have tools with usage, pick top 5 (filling with defaults if fewer than 5)
      if (toolsWithUsage.length > 0) {
        const selected: DisplayTool[] = [];
        const seenPaths = new Set<string>();

        // Add tools with usage
        for (const tool of toolsWithUsage) {
          if (!seenPaths.has(tool.path)) {
            selected.push(tool);
            seenPaths.add(tool.path);
            if (selected.length === 5) break;
          }
        }

        // If fewer than 5, fill from default catalog
        if (selected.length < 5) {
          for (const defTool of DEFAULT_POPULAR_TOOLS) {
            if (!seenPaths.has(defTool.path)) {
              selected.push(defTool);
              seenPaths.add(defTool.path);
              if (selected.length === 5) break;
            }
          }
        }

        setTopTools(selected.slice(0, 5));
      } else {
        setTopTools(DEFAULT_POPULAR_TOOLS.slice(0, 5));
      }
    } catch {
      setTopTools(DEFAULT_POPULAR_TOOLS.slice(0, 5));
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadPopular = async () => {
      try {
        const popularData = await historyApi.getPopularTools();
        if (isMounted) {
          calculateTopTools(popularData);
        }
      } catch {
        if (isMounted) {
          calculateTopTools([]);
        }
      }
    };

    loadPopular();

    // Listen for local tool usage events
    const handleToolUsed = () => {
      loadPopular();
    };

    window.addEventListener('rajsaurabh:tool_used', handleToolUsed);
    return () => {
      isMounted = false;
      window.removeEventListener('rajsaurabh:tool_used', handleToolUsed);
    };
  }, [calculateTopTools]);

  return (
    <>
      <footer className="border-t border-slate-800/80 bg-slate-950/90 text-slate-300 relative z-10">
        {/* Privacy Highlight Banner */}
        <div className="border-b border-slate-800/60 bg-gradient-to-r from-blue-950/30 via-slate-900/40 to-purple-950/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-center sm:text-left">
              <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <p className="text-slate-300 leading-snug">
                <strong className="text-emerald-400 font-semibold">Privacy First:</strong> Many
                tools process files directly in your browser. Files are only uploaded or stored when
                you explicitly use a cloud storage feature.
              </p>
            </div>
            <button
              onClick={() => setActiveModal('privacy')}
              className="inline-flex items-center gap-1 text-slate-400 hover:text-blue-400 transition-colors font-medium shrink-0 group cursor-pointer"
            >
              <span>Learn more</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
            {/* Column 1 — Project Information (lg:col-span-4) */}
            <div className="lg:col-span-4 space-y-4">
              <BrandLogo size="md" subtitleText="Digital Document & Image Suite" />

              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                Fast, secure and easy-to-use digital tools for Photos, Documents, PDFs and ID Card
                Printing.
              </p>

              <p className="text-[11px] text-slate-500 leading-relaxed max-w-sm">
                Professional tools designed to simplify everyday digital document and image
                processing.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400">
                  <Cpu className="w-3 h-3 text-blue-400" />
                  <span>Client-Side Engine</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400">
                  <Lock className="w-3 h-3 text-purple-400" />
                  <span>MERN Stack</span>
                </div>
              </div>
            </div>

            {/* Column 2 — Quick Links (Authentication-Aware) (lg:col-span-3) */}
            <div className="lg:col-span-3 space-y-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <span>Quick Links</span>
                {isAuthenticated && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-semibold uppercase">
                    Account
                  </span>
                )}
              </h3>

              <ul className="text-xs space-y-2.5">
                <li>
                  <Link
                    to="/"
                    className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    <ChevronRight className="w-3 h-3 text-slate-600" />
                    <span>Home</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/tools"
                    className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    <ChevronRight className="w-3 h-3 text-slate-600" />
                    <span>All Tools</span>
                  </Link>
                </li>

                {/* Authentication Conditional Links */}
                {!isAuthenticated ? (
                  <>
                    <li>
                      <Link
                        to="/login"
                        className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
                      >
                        <ChevronRight className="w-3 h-3 text-slate-600" />
                        <span>Sign In</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/register"
                        className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
                      >
                        <ChevronRight className="w-3 h-3 text-slate-600" />
                        <span>Create Account</span>
                      </Link>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link
                        to="/dashboard"
                        className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
                      >
                        <ChevronRight className="w-3 h-3 text-slate-600" />
                        <span>Dashboard</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/favorites"
                        className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
                      >
                        <ChevronRight className="w-3 h-3 text-slate-600" />
                        <span>Favorite Tools</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/files"
                        className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
                      >
                        <ChevronRight className="w-3 h-3 text-slate-600" />
                        <span>My Files</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/history"
                        className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
                      >
                        <ChevronRight className="w-3 h-3 text-slate-600" />
                        <span>Processing History</span>
                      </Link>
                    </li>
                  </>
                )}

                {/* Admin Only Link */}
                {isAuthenticated && user?.role === 'admin' && (
                  <li className="pt-1.5 border-t border-slate-800/60">
                    <Link
                      to="/admin"
                      className="text-rose-400 hover:text-rose-300 font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <ShieldAlert className="w-3 h-3 text-rose-500" />
                      <span>Admin Control Panel</span>
                    </Link>
                  </li>
                )}
              </ul>
            </div>

            {/* Column 3 — Popular Tools (lg:col-span-3) */}
            <div className="lg:col-span-3 space-y-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Popular Tools
              </h3>

              <ul className="text-xs space-y-2.5">
                {topTools.map((tool) => (
                  <li key={tool.path}>
                    <Link
                      to={tool.path}
                      className="text-slate-400 hover:text-white transition-colors flex items-center justify-between group"
                    >
                      <span className="flex items-center gap-1.5 truncate">
                        <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-blue-400 transition-colors shrink-0" />
                        <span className="group-hover:translate-x-0.5 transition-transform truncate">
                          {tool.name}
                        </span>
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 group-hover:border-slate-700 group-hover:text-slate-300 transition-colors shrink-0 ml-1">
                        {tool.badge}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4 — Support & Legal (lg:col-span-2) */}
            <div className="lg:col-span-2 space-y-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Support & Info
              </h3>

              <ul className="text-xs space-y-2.5">
                <li>
                  <Link
                    to="/feedback"
                    className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 text-left w-full group"
                  >
                    <MessageSquareHeart className="w-3.5 h-3.5 text-pink-400 shrink-0 group-hover:scale-110 transition-transform" />
                    <span>Feedback</span>
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => setActiveModal('help')}
                    className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer text-left w-full"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>Help & Support</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveModal('contact')}
                    className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer text-left w-full"
                  >
                    <Mail className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>Contact</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveModal('privacy')}
                    className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer text-left w-full"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Privacy Information</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveModal('terms')}
                    className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer text-left w-full"
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Terms of Use</span>
                  </button>
                </li>
              </ul>

              <div className="pt-2">
                <a
                  href="mailto:riturajsingh8543@gmail.com"
                  className="block px-2.5 py-2 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
                >
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Email Desk</span>
                  <span className="truncate block font-medium">riturajsingh8543@gmail.com</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="border-t border-slate-800/80 bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
              <p>© 2026 Toolix. All Rights Reserved.</p>
              <span className="hidden sm:inline text-slate-700">•</span>
              <p className="flex items-center gap-1.5 text-slate-400">
                <span>Made with</span>
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline animate-pulse" />
                <span>by</span>
                <a
                  href="https://github.com/Rituraj2018"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-200 hover:text-blue-400 font-medium transition-colors underline decoration-slate-700 underline-offset-2 hover:decoration-blue-400"
                >
                  Rituraj Singh
                </a>
              </p>
            </div>

            {/* Social Media & Contact Links + Back to Top */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <div className="flex items-center gap-2">
                <a
                  href="https://github.com/Rituraj2018"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub Profile"
                  title="GitHub: Rituraj2018"
                  className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/80 hover:border-slate-700 transition-all flex items-center justify-center"
                >
                  <Github className="w-4 h-4" />
                </a>
                <a
                  href="https://www.linkedin.com/in/rituraj-singh-437472284"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn Profile"
                  title="LinkedIn: Rituraj Singh"
                  className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-[#0a66c2] hover:bg-slate-800/80 hover:border-slate-700 transition-all flex items-center justify-center"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href="https://www.instagram.com/rajsaurabhs"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram Profile"
                  title="Instagram"
                  className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-[#e4405f] hover:bg-slate-800/80 hover:border-slate-700 transition-all flex items-center justify-center"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="https://www.facebook.com/share/14mQLgcHTq3/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook Profile"
                  title="Facebook"
                  className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-[#1877f2] hover:bg-slate-800/80 hover:border-slate-700 transition-all flex items-center justify-center"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href="mailto:riturajsingh8543@gmail.com"
                  aria-label="Email Rituraj Singh"
                  title="Email: riturajsingh8543@gmail.com"
                  className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-400 hover:bg-slate-800/80 hover:border-slate-700 transition-all flex items-center justify-center"
                >
                  <Mail className="w-4 h-4" />
                </a>
              </div>

              <div className="hidden sm:block h-4 w-px bg-slate-800" />

              <button
                onClick={scrollToTop}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/80 hover:border-slate-700 transition-all cursor-pointer text-xs"
                title="Scroll to Top"
              >
                <span>Back to top</span>
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Support Modals */}
      {/* 1. Help & Support Modal */}
      <Modal
        isOpen={activeModal === 'help'}
        onClose={() => setActiveModal(null)}
        title={
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-400" />
            <span className="text-base font-bold text-white">Help & Support</span>
          </div>
        }
      >
        <div className="space-y-4 text-xs text-slate-300">
          <p className="leading-relaxed">
            Welcome to the Toolix Support center. Here are quick answers to common
            questions:
          </p>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <h4 className="font-semibold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                How are my files processed?
              </h4>
              <p className="text-slate-400 leading-relaxed">
                Most studio tools (like Passport Photo Studio, Aadhaar Print Studio, Ayushman Print,
                and Image Compressor) utilize high-performance in-browser canvas and client rendering.
                Your files remain local to your device unless explicitly saved to cloud storage.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <h4 className="font-semibold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                What are the print specifications?
              </h4>
              <p className="text-slate-400 leading-relaxed">
                ID card studios generate exact 300 DPI high-resolution A4 print sheets designed
                according to standard Indian government card dimensions with precise cut guides.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <h4 className="font-semibold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                Need direct assistance?
              </h4>
              <p className="text-slate-400 leading-relaxed">
                Reach out to our support team anytime via email at{' '}
                <a
                  href="mailto:riturajsingh8543@gmail.com"
                  className="text-blue-400 hover:underline font-medium"
                >
                  riturajsingh8543@gmail.com
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </Modal>

      {/* 2. Contact Modal */}
      <Modal
        isOpen={activeModal === 'contact'}
        onClose={() => setActiveModal(null)}
        title={
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-purple-400" />
            <span className="text-base font-bold text-white">Contact & Support</span>
          </div>
        }
      >
        <div className="space-y-4 text-xs text-slate-300">
          <p className="leading-relaxed">
            Have questions, feedback, or need help with any tool in Toolix? We are here
            to help.
          </p>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <h4 className="font-semibold text-white">General & Technical Support</h4>
                <p className="text-slate-400 text-[11px] mb-1.5">
                  Direct email support for tool issues, bug reports, and inquiries.
                </p>
                <a
                  href="mailto:riturajsingh8543@gmail.com"
                  className="inline-flex items-center gap-1 text-blue-400 hover:underline font-semibold"
                >
                  <span>riturajsingh8543@gmail.com</span>
                </a>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Developer & Creator</h4>
                <p className="text-slate-400 text-[11px] mb-2.5">
                  Engineered and maintained by <strong>Rituraj Singh</strong>. Built using modern
                  MERN architecture and end-to-end TypeScript.
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href="https://github.com/Rituraj2018"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
                  >
                    <Github className="w-3 h-3" />
                    <span>GitHub</span>
                  </a>
                  <a
                    href="https://www.linkedin.com/in/rituraj-singh"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 hover:text-[#0a66c2] hover:border-slate-700 transition-colors"
                  >
                    <Linkedin className="w-3 h-3" />
                    <span>LinkedIn</span>
                  </a>
                  <a
                    href="mailto:riturajsingh8543@gmail.com"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 hover:text-amber-400 hover:border-slate-700 transition-colors"
                  >
                    <Mail className="w-3 h-3" />
                    <span>Email</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* 3. Privacy Information Modal */}
      <Modal
        isOpen={activeModal === 'privacy'}
        onClose={() => setActiveModal(null)}
        title={
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-base font-bold text-white">Privacy Information</span>
          </div>
        }
      >
        <div className="space-y-4 text-xs text-slate-300">
          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 leading-relaxed">
            <strong>Privacy First Architecture:</strong> Many tools process files directly in your
            browser. Files are only uploaded or stored when you explicitly use a cloud storage
            feature.
          </div>

          <div className="space-y-2.5">
            <h4 className="font-semibold text-white">How We Handle Your Data:</h4>
            <ul className="space-y-2 list-disc pl-5 text-slate-400 leading-relaxed">
              <li>
                <strong>Browser-Side Processing:</strong> Tools such as Passport Photo Studio,
                Aadhaar Print Studio, Ayushman Card Print, Image to PDF, PDF Merge, and Image
                Compressor execute computations on your device via HTML5 Canvas and WebAssembly/JS.
              </li>
              <li>
                <strong>Cloud Storage Features:</strong> Files are uploaded to secure cloud/server
                storage only when you explicitly choose to save processed documents to your "My
                Files" library or cloud providers.
              </li>
              <li>
                <strong>No Unsolicited Retention:</strong> We do not track, inspect, or retain your
                personal documents without your explicit action.
              </li>
              <li>
                <strong>Account Privacy:</strong> User credentials and tokens are secured via JWT
                encryption and industry-standard security practices.
              </li>
            </ul>
          </div>
        </div>
      </Modal>

      {/* 4. Terms of Use Modal */}
      <Modal
        isOpen={activeModal === 'terms'}
        onClose={() => setActiveModal(null)}
        title={
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <span className="text-base font-bold text-white">Terms of Use</span>
          </div>
        }
      >
        <div className="space-y-4 text-xs text-slate-300">
          <p className="leading-relaxed">
            By utilizing Toolix, you agree to the following terms and principles:
          </p>

          <div className="space-y-2.5 text-slate-400 leading-relaxed">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <h4 className="font-semibold text-white">1. Lawful & Authorized Use</h4>
              <p>
                You must possess lawful ownership or authorization for all documents, photos, or ID
                cards processed through this platform. Any unauthorized replication or misuse of
                government identification is strictly prohibited.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <h4 className="font-semibold text-white">2. Platform Availability</h4>
              <p>
                Toolix is provided for productivity, utility, and convenience. While we
                strive for 100% uptime and high performance, services are provided on an as-available
                basis.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <h4 className="font-semibold text-white">3. Intellectual Property</h4>
              <p>
                The platform design, interfaces, and utilities are © 2026 Toolix. All
                rights reserved.
              </p>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};
