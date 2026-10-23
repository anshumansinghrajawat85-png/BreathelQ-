import React, { useState } from 'react';
import { AlertRecord } from '../../types';
import { acknowledgeAlert } from '../../services/api';
import {
  Bell,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  ExternalLink,
  Info,
} from 'lucide-react';

interface AlertsPageProps {
  alerts: AlertRecord[];
  onRefreshAlerts: () => void;
  theme?: 'dark' | 'light';
}

export const AlertsPage: React.FC<AlertsPageProps> = ({ alerts, onRefreshAlerts, theme = 'dark' }) => {
  const isLight = theme === 'light';
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleAcknowledge = async (id: string) => {
    try {
      await acknowledgeAlert(id);
      onRefreshAlerts();
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = alerts.filter((a) => {
    if (filterSeverity !== 'all' && a.severity !== filterSeverity) return false;
    if (filterStatus !== 'all' && a.status !== filterStatus) return false;
    if (searchQuery && !a.title.toLowerCase().includes(searchQuery.toLowerCase()) && !a.location.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header with Search & Filter */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 ${
        isLight ? 'border-slate-200' : 'border-slate-800'
      }`}>
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-rose-500 uppercase">
            <Bell className="w-4 h-4" />
            <span>CRITICAL EARLY WARNING & DISPATCH ADVISORIES</span>
          </div>
          <h2 className={`text-xl md:text-2xl font-bold mt-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Automated Alert Center & Municipal Mitigation
          </h2>
          <p className={`text-xs mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Real-time threshold breaches, rapid surge alerts, and predictive night-time inversion warnings.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5" />
            <input
              type="text"
              placeholder="Search alert..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`rounded-lg pl-8 pr-3 py-1.5 focus:outline-none w-44 border ${
                isLight
                  ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-cyan-500 shadow-sm'
                  : 'bg-[#111C2E] border-slate-700/80 text-white placeholder-slate-500 focus:border-cyan-400'
              }`}
            />
          </div>

          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className={`border rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer ${
              isLight
                ? 'bg-white border-slate-300 text-slate-800 shadow-sm'
                : 'bg-[#111C2E] border-slate-700/80 text-slate-200'
            }`}
          >
            <option value="all">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="Warning">Warning</option>
            <option value="Info">Info</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`border rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer ${
              isLight
                ? 'bg-white border-slate-300 text-slate-800 shadow-sm'
                : 'bg-[#111C2E] border-slate-700/80 text-slate-200'
            }`}
          >
            <option value="all">All Status</option>
            <option value="Active">Active Only</option>
            <option value="Acknowledged">Acknowledged</option>
          </select>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className={`p-12 text-center text-xs rounded-2xl border ${
            isLight
              ? 'bg-white border-slate-200 text-slate-500 shadow-sm'
              : 'bg-[#111C2E] border-slate-800 text-slate-500'
          }`}>
            No alerts match current search and severity filters.
          </div>
        ) : (
          filtered.map((alert) => {
            const isCritical = alert.severity === 'Critical';
            const isWarning = alert.severity === 'Warning';

            return (
              <div
                key={alert.id}
                className={`p-5 rounded-2xl border transition-all ${
                  alert.status === 'Active'
                    ? isCritical
                      ? isLight
                        ? 'bg-rose-50/70 border-rose-300 shadow-md shadow-rose-100'
                        : 'bg-[#181522] border-red-500/50 shadow-lg shadow-red-950/20'
                      : isWarning
                      ? isLight
                        ? 'bg-amber-50/70 border-amber-300 shadow-md shadow-amber-100'
                        : 'bg-[#1a1b24] border-amber-500/40 shadow-lg shadow-amber-950/20'
                      : isLight
                      ? 'bg-white border-slate-200 shadow-sm'
                      : 'bg-[#111C2E] border-slate-800'
                    : isLight
                    ? 'bg-slate-50 border-slate-200 opacity-75'
                    : 'bg-[#0E1624] border-slate-800/80 opacity-80'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${
                          isCritical
                            ? isLight
                              ? 'bg-rose-100 text-rose-800 border-rose-300'
                              : 'bg-red-500/20 text-red-300 border border-red-500/40'
                            : isWarning
                            ? isLight
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : isLight
                            ? 'bg-cyan-100 text-cyan-800 border-cyan-300'
                            : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        }`}
                      >
                        {alert.severity} · {alert.type}
                      </span>
                      <span className={`text-[11px] font-mono-nums ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        Alert ID: {alert.id}
                      </span>
                      <span aria-hidden="true" className={isLight ? 'text-slate-300' : 'text-slate-600'}>·</span>
                      <span className={`text-[11px] font-medium ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
                        {alert.location}
                      </span>
                    </div>

                    <h3 className={`text-base font-bold mt-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>{alert.title}</h3>
                  </div>

                  {/* Acknowledge Button */}
                  <div className="shrink-0 flex items-center gap-2">
                    {alert.status === 'Active' ? (
                      <button
                        onClick={() => handleAcknowledge(alert.id)}
                        className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer border ${
                          isLight
                            ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-sm'
                            : 'text-white bg-slate-800 hover:bg-slate-700 border-slate-700'
                        }`}
                      >
                        Acknowledge Alert
                      </button>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 font-mono-nums">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Acknowledged</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Trigger Condition & Supporting Metric */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 text-xs">
                  <div className={`p-3 rounded-xl border ${
                    isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800/80'
                  }`}>
                    <span className={`text-[10px] uppercase font-semibold block mb-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Trigger Condition
                    </span>
                    <p className={`leading-relaxed ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>{alert.triggerCondition}</p>
                  </div>

                  <div className={`p-3 rounded-xl border ${
                    isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800/80'
                  }`}>
                    <span className={`text-[10px] uppercase font-semibold block mb-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Supporting Measurement / ML Prediction
                    </span>
                    <p className={`font-mono-nums leading-relaxed font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {alert.supportingMeasurement}
                    </p>
                  </div>
                </div>

                {/* Recommended Mitigation Step */}
                <div className={`mt-3 p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                  isLight
                    ? 'bg-cyan-50 border-cyan-200 text-cyan-950'
                    : 'bg-cyan-950/30 border-cyan-800/40 text-cyan-200'
                }`}>
                  <Info className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className={`block font-semibold mb-0.5 ${isLight ? 'text-cyan-900' : 'text-cyan-300'}`}>
                      Recommended Immediate Operational Action:
                    </strong>
                    {alert.recommendedAction}
                  </div>
                </div>

                <div className={`mt-3 flex items-center justify-between text-[11px] font-mono-nums ${
                  isLight ? 'text-slate-500' : 'text-slate-500'
                }`}>
                  <span>Source: {alert.source}</span>
                  <span>Triggered: {new Date(alert.timestamp).toLocaleString()}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
