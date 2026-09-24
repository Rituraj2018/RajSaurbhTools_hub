import React from 'react';
import { Link } from 'react-router-dom';

export interface BrandLogoProps {
  /** Size of the logo icon */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Whether to show the text alongside the logo */
  showText?: boolean;
  /** Whether to show the subtitle text */
  showSubtitle?: boolean;
  /** Custom subtitle text (defaults to 'All-in-One Processing Platform') */
  subtitleText?: string;
  /** Additional wrapper class */
  className?: string;
  /** Additional icon wrapper class */
  iconClassName?: string;
  /** Whether clicking the logo navigates to home */
  isLink?: boolean;
  /** Custom destination path if isLink is true */
  to?: string;
}

const sizeMap = {
  xs: {
    icon: 'w-7 h-7',
    svg: 28,
    title: 'text-sm font-bold',
    subtitle: 'text-[9px]',
  },
  sm: {
    icon: 'w-8 h-8',
    svg: 32,
    title: 'text-base font-bold',
    subtitle: 'text-[10px]',
  },
  md: {
    icon: 'w-10 h-10',
    svg: 40,
    title: 'text-lg sm:text-xl font-extrabold',
    subtitle: 'text-[10px]',
  },
  lg: {
    icon: 'w-12 h-12',
    svg: 48,
    title: 'text-xl sm:text-2xl font-extrabold',
    subtitle: 'text-xs',
  },
  xl: {
    icon: 'w-14 h-14',
    svg: 56,
    title: 'text-2xl sm:text-3xl font-extrabold',
    subtitle: 'text-sm',
  },
};

/**
 * High-precision custom vector SVG emblem for Toolix
 */
export const BrandIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 40,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-300 ${className}`}
    >
      <defs>
        {/* Main Background Gradient */}
        <linearGradient id="rs-brand-bg" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="45%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#9333ea" />
        </linearGradient>

        {/* Ambient Back Glow */}
        <radialGradient id="rs-brand-glow" cx="50%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.8" />
          <stop offset="60%" stopColor="#818cf8" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#c084fc" stopOpacity="0" />
        </radialGradient>

        {/* Isometric Top Layer Gradients */}
        <linearGradient id="rs-layer-top" x1="12" y1="12" x2="36" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#bfdbfe" />
        </linearGradient>

        <linearGradient id="rs-layer-mid" x1="10" y1="20" x2="38" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="100%" stopColor="#c084fc" />
        </linearGradient>

        <linearGradient id="rs-layer-bot" x1="8" y1="28" x2="40" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>

        {/* Glass Edge Highlights */}
        <linearGradient id="rs-glass-stroke" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#a5b4fc" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#c084fc" stopOpacity="0.4" />
        </linearGradient>

        {/* Shadow Filter */}
        <filter id="rs-drop-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Outer Squircle Container with Border Glow */}
      <rect
        x="2.5"
        y="2.5"
        width="43"
        height="43"
        rx="13"
        fill="url(#rs-brand-bg)"
        stroke="url(#rs-glass-stroke)"
        strokeWidth="1.5"
        filter="url(#rs-drop-shadow)"
      />

      {/* Internal Ambient Radial Light */}
      <rect x="3" y="3" width="42" height="42" rx="12" fill="url(#rs-brand-glow)" />

      {/* Top Glass Reflection Highlight */}
      <path
        d="M 4 15 C 4 9 9 4 15 4 L 33 4 C 20 4 6 16 4 30 Z"
        fill="white"
        fillOpacity="0.18"
      />

      {/* 3D Isometric Staked Geometric Layers (Tools Hub Core) */}
      <g filter="url(#rs-drop-shadow)">
        {/* Bottom Layer */}
        <path
          d="M 12 30 L 24 35 L 36 30 L 24 25 Z"
          fill="url(#rs-layer-bot)"
          opacity="0.85"
        />
        <path
          d="M 12 30 L 24 35 L 24 37 L 12 32 Z"
          fill="#1e3a8a"
          opacity="0.9"
        />
        <path
          d="M 36 30 L 24 35 L 24 37 L 36 32 Z"
          fill="#581c87"
          opacity="0.9"
        />

        {/* Middle Layer */}
        <path
          d="M 12 23 L 24 28 L 36 23 L 24 18 Z"
          fill="url(#rs-layer-mid)"
        />
        <path
          d="M 12 23 L 24 28 L 24 30 L 12 25 Z"
          fill="#1d4ed8"
          opacity="0.9"
        />
        <path
          d="M 36 23 L 24 28 L 24 30 L 36 25 Z"
          fill="#7e22ce"
          opacity="0.9"
        />

        {/* Top Floating Diamond Crest */}
        <path
          d="M 13 16 L 24 21 L 35 16 L 24 11 Z"
          fill="url(#rs-layer-top)"
        />
        <path
          d="M 13 16 L 24 21 L 24 22.5 L 13 17.5 Z"
          fill="#3b82f6"
        />
        <path
          d="M 35 16 L 24 21 L 24 22.5 L 35 17.5 Z"
          fill="#9333ea"
        />

        {/* Central Core Light Spark Node */}
        <circle cx="24" cy="16" r="2.2" fill="#ffffff" />
        <circle cx="24" cy="16" r="4" fill="#60a5fa" fillOpacity="0.4" />
      </g>
    </svg>
  );
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  showSubtitle = true,
  subtitleText = 'All-in-One Processing Platform',
  className = '',
  iconClassName = '',
  isLink = true,
  to = '/',
}) => {
  const currentSize = sizeMap[size];

  const content = (
    <div className={`flex items-center gap-3 group ${className}`}>
      {/* Icon Emblem Container */}
      <div
        className={`relative ${currentSize.icon} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300 drop-shadow-md ${iconClassName}`}
      >
        <BrandIcon size={currentSize.svg} />
      </div>

      {/* Typography */}
      {showText && (
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span
              className={`${currentSize.title} tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent group-hover:from-blue-400 group-hover:to-purple-300 transition-colors truncate`}
            >
              Toolix
            </span>
          </div>
          {showSubtitle && (
            <p className={`${currentSize.subtitle} text-slate-400 font-medium tracking-wide hidden sm:block truncate`}>
              {subtitleText}
            </p>
          )}
        </div>
      )}
    </div>
  );

  if (isLink) {
    return (
      <Link to={to} className="inline-flex focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl">
        {content}
      </Link>
    );
  }

  return content;
};
