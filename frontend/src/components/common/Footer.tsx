import React from 'react';
import { Layers, ShieldCheck, Terminal, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/60 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1 */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center">
                <Layers className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-bold text-white tracking-tight">
                RajSaurbh Tools_Hub
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Production-grade, privacy-first processing suite for PDF manipulations, photo optimizations,
              and document conversions. Designed with scalability and clean MERN architecture.
            </p>
          </div>

          {/* Col 2 */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Navigation</h4>
            <ul className="text-xs text-slate-400 space-y-1.5">
              <li>
                <Link to="/dashboard" className="hover:text-blue-400 transition-colors">
                  Dashboard Overview
                </Link>
              </li>
              <li>
                <Link to="/tools" className="hover:text-blue-400 transition-colors">
                  All Processing Tools
                </Link>
              </li>
              <li>
                <Link to="/tools?category=photo" className="hover:text-purple-400 transition-colors">
                  Photo & Image Studio
                </Link>
              </li>
              <li>
                <Link to="/tools?category=pdf" className="hover:text-cyan-400 transition-colors">
                  PDF Processing Suite
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Architecture</h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Modern Glassmorphism UI</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <Terminal className="w-4 h-4 text-blue-400 shrink-0" />
                <span>MERN + End-to-End TypeScript</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} RajSaurbh Tools_Hub. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="w-3 h-3 text-purple-500 fill-purple-500" /> for high performance
          </p>
        </div>
      </div>
    </footer>
  );
};
