import React from 'react';
import { AnalyticsData } from '../types';

interface SummaryMetricsProps {
  analytics: AnalyticsData | null;
  onFilterUnassigned: () => void;
  onFilterAll: () => void;
}

export const SummaryMetrics: React.FC<SummaryMetricsProps> = ({
  analytics,
  onFilterUnassigned,
  onFilterAll,
}) => {
  const totalShortlinks = analytics?.totalShortlinks ?? 0;
  const totalClicks = analytics?.totalClicks ?? 0;
  const unassignedCount = analytics?.unassignedCount ?? 0;

  // Format click count with k if >= 1000
  const formattedClicks = totalClicks >= 10000 
    ? `${(totalClicks / 1000).toFixed(1)}k`
    : totalClicks.toLocaleString('id-ID');

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Metric 1: Total Shortlinks */}
      <div 
        id="metric-total-shortlinks"
        onClick={onFilterAll}
        className="bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-white/50 shadow-xl shadow-slate-200/50 hover:bg-white/90 transition-all cursor-pointer group"
      >
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
          Total Shortlinks
        </p>
        <div className="flex items-end justify-between">
          <span className="text-3xl font-bold text-[#005C53] tracking-tight">
            {totalShortlinks}
          </span>
          <span className="text-xs font-medium text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">
            +12%
          </span>
        </div>
      </div>

      {/* Metric 2: Total Click/Scans */}
      <div 
        id="metric-total-clicks"
        className="bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-white/50 shadow-xl shadow-slate-200/50 hover:bg-white/90 transition-all"
      >
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
          Total Click/Scans
        </p>
        <div className="flex items-end justify-between">
          <span className="text-3xl font-bold text-[#005C53] tracking-tight">
            {formattedClicks}
          </span>
          <span className="text-xs font-medium text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">
            +{totalClicks > 0 ? totalClicks : '0'}
          </span>
        </div>
      </div>

      {/* Metric 3: Unassigned Links (Requires Place ID) */}
      <div 
        id="metric-unassigned"
        onClick={onFilterUnassigned}
        className={`p-6 rounded-3xl border shadow-xl transition-all cursor-pointer ${
          unassignedCount > 0
            ? 'bg-[#FFFAEB] border-[#FEF0C7] shadow-orange-100/50 hover:bg-[#FFF6D9]'
            : 'bg-white/70 backdrop-blur-md border-white/50 shadow-slate-200/50'
        }`}
      >
        <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${
          unassignedCount > 0 ? 'text-[#B45309]' : 'text-slate-400'
        }`}>
          Unassigned Links
        </p>
        <div className="flex items-end justify-between">
          <span className={`text-3xl font-bold tracking-tight ${
            unassignedCount > 0 ? 'text-[#B45309]' : 'text-[#005C53]'
          }`}>
            {unassignedCount}
          </span>
          <span className={`text-[10px] italic font-medium ${
            unassignedCount > 0 ? 'text-[#D97706]' : 'text-slate-400'
          }`}>
            {unassignedCount > 0 ? 'Requires Place ID' : 'All Configured'}
          </span>
        </div>
      </div>
    </section>
  );
};
