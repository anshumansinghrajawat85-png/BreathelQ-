import React from 'react';
import {
  Home,
  LayoutDashboard,
  MapPin,
  TrendingUp,
  BarChart3,
  Cpu,
  AlertTriangle,
  Bell,
  Bot,
  Database,
  BookOpen,
  FileSpreadsheet,
  Settings,
} from 'lucide-react';

export type NavTab =
  | 'home'
  | 'dashboard'
  | 'map'
  | 'chartsheet'
  | 'forecast'
  | 'analytics'
  | 'sensors'
  | 'anomalies'
  | 'alerts'
  | 'assistant'
  | 'historical'
  | 'methodology'
  | 'settings';

interface NavigationProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  alertCount?: number;
  anomalyCount?: number;
  theme?: 'dark' | 'light';
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  alertCount = 3,
  anomalyCount = 2,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';

  const navItems: Array<{
    id: NavTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    highlight?: boolean;
  }> = [
    { id: 'home', label: 'Overview', icon: Home },
    { id: 'dashboard', label: 'Live Dashboard', icon: LayoutDashboard },
    { id: 'map', label: 'Live Google Map', icon: MapPin, highlight: true },
    { id: 'chartsheet', label: 'Chart Sheet', icon: FileSpreadsheet, highlight: true },
    { id: 'forecast', label: 'ML Forecast', icon: TrendingUp },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'sensors', label: 'IoT Sensors', icon: Cpu },
    { id: 'anomalies', label: 'Anomalies', icon: AlertTriangle, badge: anomalyCount },
    { id: 'alerts', label: 'Alerts & Warnings', icon: Bell, badge: alertCount },
    { id: 'assistant', label: 'AI Assistant', icon: Bot },
    { id: 'historical', label: 'Historical Data', icon: Database },
    { id: 'methodology', label: 'CPCB & Science', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav
      aria-label="Top platform navigation"
      className={`w-full border-b backdrop-blur-md transition-colors z-20 ${
        isLight
          ? 'bg-slate-50/95 border-slate-200/90 text-slate-800'
          : 'bg-[#080E1A]/95 border-slate-800/80 text-slate-200'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1.5 overflow-x-auto py-2 scrollbar-none no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer shrink-0 ${
                  isActive
                    ? isLight
                      ? 'bg-white text-cyan-900 border border-cyan-300 shadow-sm ring-1 ring-cyan-400/30'
                      : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-950/40'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 border border-transparent'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                    isActive
                      ? isLight
                        ? 'text-cyan-600 scale-110'
                        : 'text-cyan-400 scale-110'
                      : isLight
                      ? 'text-slate-500'
                      : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>

                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`ml-0.5 px-1.5 py-0.2 text-[10px] font-mono-nums font-bold rounded-full ${
                      item.id === 'alerts'
                        ? 'bg-red-500 text-white animate-pulse'
                        : isLight
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
