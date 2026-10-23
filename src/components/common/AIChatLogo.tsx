import React from 'react';

interface AIChatLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'icon' | 'badge' | 'full';
  isPulsing?: boolean;
  className?: string;
  theme?: 'dark' | 'light';
}

export const AIChatLogo: React.FC<AIChatLogoProps> = ({
  size = 'md',
  variant = 'icon',
  isPulsing = false,
  className = '',
  theme = 'dark',
}) => {
  const isLight = theme === 'light';

  const sizeDimensions = {
    xs: { box: 20, px: 'w-5 h-5' },
    sm: { box: 26, px: 'w-6.5 h-6.5' },
    md: { box: 36, px: 'w-9 h-9' },
    lg: { box: 48, px: 'w-12 h-12' },
    xl: { box: 64, px: 'w-16 h-16' },
  };

  const currentSize = sizeDimensions[size];

  // Distinctive Atmospheric AI Neural Symbol
  const EmblemSVG = (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${currentSize.px} ${className}`}>
      {/* Ambient Pulsing Aura */}
      {isPulsing && (
        <span
          className="absolute inset-0 rounded-xl bg-cyan-400/30 blur-md animate-ping"
          style={{ animationDuration: '3s' }}
        />
      )}

      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md select-none transition-transform hover:scale-105"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="mpVayuGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06B6D4" />
            <stop offset="45%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>

          <linearGradient id="mpCoreGlow" x1="20%" y1="10%" x2="80%" y2="90%">
            <stop offset="0%" stopColor="#22D3EE" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>

          <radialGradient id="mpBackHalo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={isLight ? '#06B6D4' : '#22D3EE'} stopOpacity={isLight ? '0.22' : '0.4'} />
            <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
          </radialGradient>

          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Hex-Shield / Atmospheric Dome */}
        <rect
          x="6"
          y="6"
          width="88"
          height="88"
          rx="24"
          fill={isLight ? '#FFFFFF' : '#0B1526'}
          stroke="url(#mpVayuGradient)"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Atmospheric Backglow Halo */}
        <circle cx="50" cy="50" r="36" fill="url(#mpBackHalo)" />

        {/* Orbiting Clean Air Vortices (Concentric Wavelets) */}
        <path
          d="M 24 50 A 26 26 0 0 1 76 50"
          stroke="url(#mpVayuGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="4 6"
          opacity="0.8"
        />
        <path
          d="M 76 50 A 26 26 0 0 1 24 50"
          stroke="url(#mpVayuGradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="6 5"
          opacity="0.5"
        />

        {/* Central Neural Environmental Leaf-Pulsar Symbol */}
        {/* Left Leaf / Airfoil Petal */}
        <path
          d="M 50 20 C 35 24 25 38 31 56 C 35 68 46 76 50 80 C 47 70 45 56 49 43 Z"
          fill="url(#mpCoreGlow)"
          opacity="0.95"
        />

        {/* Right Digital Circuit Wing (The AI Element) */}
        <path
          d="M 50 20 C 65 24 75 38 69 56 C 65 68 54 76 50 80 C 53 70 55 56 51 43 Z"
          fill="url(#mpVayuGradient)"
          opacity="0.85"
        />

        {/* Central Synaptic Air Spine & Node */}
        <line x1="50" y1="23" x2="50" y2="76" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.9" />

        {/* 3 AI Environmental Sensor Telemetry Nodes */}
        <circle cx="50" cy="48" r="5" fill="#FFFFFF" filter="url(#softGlow)" />
        <circle cx="50" cy="48" r="2.5" fill="#0891B2" />

        {/* Lateral Synaptic Pins (Data Links) */}
        <circle cx="36" cy="42" r="3" fill="#34D399" />
        <line x1="39" y1="44" x2="46" y2="47" stroke="#34D399" strokeWidth="1.5" strokeLinecap="round" />

        <circle cx="64" cy="42" r="3" fill="#38BDF8" />
        <line x1="61" y1="44" x2="54" y2="47" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" />

        {/* Micro Pulse Dots */}
        <circle cx="50" cy="27" r="2" fill="#E0F2FE" />
        <circle cx="50" cy="69" r="2" fill="#A7F3D0" />
      </svg>
    </div>
  );

  if (variant === 'icon') {
    return EmblemSVG;
  }

  if (variant === 'badge') {
    return (
      <div
        className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-xl border backdrop-blur-md transition-all ${
          isLight
            ? 'bg-slate-100/90 border-slate-300 text-slate-800 shadow-xs'
            : 'bg-slate-900/80 border-cyan-500/30 text-cyan-200 shadow-md shadow-cyan-950/30'
        } ${className}`}
      >
        {EmblemSVG}
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
              VAYU-AI
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <span className={`text-[9px] font-mono leading-none ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            MP Telemetry Neural Core
          </span>
        </div>
      </div>
    );
  }

  // Full Brand Logo
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {EmblemSVG}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="text-base font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">
            AirPredict MP AI
          </span>
          <span
            className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded border ${
              isLight
                ? 'bg-cyan-50 text-cyan-800 border-cyan-200'
                : 'bg-cyan-950/80 text-cyan-300 border-cyan-800/60'
            }`}
          >
            Gemini 3.8 & 4
          </span>
        </div>
        <span className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
          Atmospheric Intelligence & CPCB Live Grounding
        </span>
      </div>
    </div>
  );
};
