import React from 'react';

interface BrandLogoProps {
  layout?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  theme?: 'dark' | 'light';
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  layout = 'horizontal',
  size = 'md',
  showTagline = true,
  theme = 'dark',
  className = '',
}) => {
  const isLight = theme === 'light';

  // Sizing definitions
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-18 h-18',
  };

  const titleSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-2xl',
  };

  const taglineSizes = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-xs',
    xl: 'text-sm',
  };

  return (
    <div
      className={`flex select-none transition-all ${
        layout === 'vertical' ? 'flex-col items-center text-center' : 'items-center gap-3'
      } ${className}`}
    >
      {/* Premium Original SVG Logo Mark (Airflow Vortex + Botanical Leaf + Predictive Waveform) */}
      <div
        className={`relative ${iconSizes[size]} shrink-0 rounded-2xl flex items-center justify-center p-1.5 transition-transform hover:scale-105 duration-300 ${
          isLight
            ? 'bg-gradient-to-br from-cyan-50 via-teal-50 to-emerald-50 border border-cyan-200/80 shadow-md shadow-cyan-100/60'
            : 'bg-gradient-to-br from-[#122338] via-[#0E1B2C] to-[#0A1422] border border-cyan-500/40 shadow-xl shadow-cyan-950/60'
        }`}
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            {/* Primary atmospheric airflow gradient */}
            <linearGradient id="airVortexGrad" x1="4" y1="8" x2="44" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#22D3EE" />
              <stop offset="50%" stopColor="#2DD4BF" />
              <stop offset="100%" stopColor="#34D399" />
            </linearGradient>

            {/* Neural predictive pulse gradient */}
            <linearGradient id="wavePulseGrad" x1="8" y1="24" x2="40" y2="24" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#22D3EE" stopOpacity="1" />
              <stop offset="100%" stopColor="#67E8F9" stopOpacity="0.8" />
            </linearGradient>

            {/* Leaf chlorophyll glow */}
            <linearGradient id="leafGrad" x1="18" y1="12" x2="36" y2="34" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#4ADE80" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.3" />
            </linearGradient>

            {/* Ambient particle glow filter */}
            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Outer Atmospheric Orbital Halo */}
          <circle
            cx="24"
            cy="24"
            r="20.5"
            stroke="url(#airVortexGrad)"
            strokeWidth="1.2"
            strokeDasharray="4 3"
            strokeOpacity={isLight ? '0.5' : '0.45'}
          />

          {/* Streamline 1: Upper Stratospheric Wave */}
          <path
            d="M 8 16 C 14 11, 20 12, 26 15 C 32 18, 38 17, 41 13"
            stroke="url(#airVortexGrad)"
            strokeWidth="2.4"
            strokeLinecap="round"
            filter="url(#softGlow)"
          />

          {/* Streamline 2: Middle Dynamic Troposphere Flow */}
          <path
            d="M 6 25 C 13 22, 18 29, 27 27 C 34 25, 38 21, 42 22"
            stroke="url(#airVortexGrad)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeOpacity={isLight ? '0.85' : '0.75'}
          />

          {/* Center Botanical Leaf + Predictive Waveform Fusion */}
          <path
            d="M 16 32 C 16 32, 21 21, 31 17 C 35 15, 37 17, 36 21 C 34 29, 23 35, 16 32 Z"
            fill="url(#leafGrad)"
            stroke="#2DD4BF"
            strokeWidth="1.5"
          />

          {/* Leaf vein transitioning into predictive telemetry step waveform */}
          <path
            d="M 17 31 L 23 26 L 27 28 L 32 20 L 36 21"
            stroke="#FFFFFF"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#softGlow)"
          />

          {/* Airborne Particle Monitoring Nodes */}
          <circle cx="12" cy="19" r="1.8" fill="#22D3EE" />
          <circle cx="37" cy="14" r="1.5" fill="#34D399" />
          <circle cx="30" cy="35" r="1.6" fill="#38BDF8" />
          <circle cx="21" cy="14" r="1.2" fill="#67E8F9" />
        </svg>
      </div>

      {/* Brand Typography & Tagline */}
      <div className={layout === 'vertical' ? 'mt-2.5' : ''}>
        <div className="flex items-center gap-2 justify-center sm:justify-start">
          <span
            className={`font-display font-black tracking-tight ${titleSizes[size]} ${
              isLight
                ? 'bg-gradient-to-r from-slate-900 via-teal-900 to-cyan-800 bg-clip-text text-transparent'
                : 'bg-gradient-to-r from-white via-cyan-100 to-teal-300 bg-clip-text text-transparent'
            }`}
          >
            AirPredict
          </span>
          <div className="flex items-center gap-1">
            <span
              className={`font-mono text-[10px] font-extrabold tracking-wider px-1.5 py-0.5 rounded border uppercase shadow-xs ${
                isLight
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
              }`}
            >
              MP
            </span>
            <span
              className={`font-mono text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded border uppercase ${
                isLight
                  ? 'bg-cyan-100/80 text-cyan-800 border-cyan-300'
                  : 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60'
              }`}
            >
              AI
            </span>
          </div>
        </div>

        {showTagline && (
          <p
            className={`${taglineSizes[size]} tracking-wide mt-0.5 font-semibold flex items-center justify-center sm:justify-start gap-1.5 ${
              isLight ? 'text-teal-700' : 'text-cyan-400/90'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Madhya Pradesh Environmental Intelligence</span>
          </p>
        )}
      </div>
    </div>
  );
};
