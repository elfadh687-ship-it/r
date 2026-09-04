import React, { useState } from 'react';
import { 
  TrendingUp, 
  MapPin, 
  QrCode, 
  ExternalLink, 
  Plus, 
  Award, 
  ArrowUpRight, 
  Calendar,
  Sparkles
} from 'lucide-react';
import { AnalyticsData } from '../types';

interface ClickAnalyticsProps {
  analytics: AnalyticsData | null;
  onOpenCreateModal: () => void;
  onOpenQRModal: (shortlink: any) => void;
  onSelectShortlink: (id: number) => void;
}

export const ClickAnalytics: React.FC<ClickAnalyticsProps> = ({
  analytics,
  onOpenCreateModal,
  onOpenQRModal,
  onSelectShortlink,
}) => {
  const [chartMode, setChartMode] = useState<'line' | 'bar'>('bar');
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  const trends = analytics?.clickTrends || [];
  const maxClicks = Math.max(...trends.map((t) => t.clicks), 10);
  const totalPeriodClicks = trends.reduce((acc, curr) => acc + curr.clicks, 0);

  return (
    <div className="space-y-6">
      {/* Quick Action Shortcuts Banner */}
      <div className="bg-white/70 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-white/50 shadow-xl shadow-slate-200/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#005C53] to-[#9FC131] text-white flex items-center justify-center shadow-lg shadow-[#005C53]/20 shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Akselerasi Ulasan Google Maps Bisnis Anda
            </h3>
            <p className="text-xs text-slate-500">
              Buat QR Code cetak untuk meja kasir, kartu nama, packaging, atau tanda terima pelanggan.
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2.5 w-full md:w-auto">
          <button
            id="shortcut-create-link-btn"
            onClick={onOpenCreateModal}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-[#005C53] to-[#70A9A1] text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-[#005C53]/20 hover:opacity-95 active:scale-95 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Shortlink Baru</span>
          </button>

          <a
            id="shortcut-place-id-finder-btn"
            href="https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-[#005C53] text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl border border-slate-200 shadow-sm transition active:scale-95"
          >
            <MapPin className="w-4 h-4 text-[#70A9A1]" />
            <span>Buka Place ID Finder</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Click Activity Trend Chart */}
        <div className="lg:col-span-2 bg-white/70 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-white/50 shadow-xl shadow-slate-200/50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#005C53]" />
                <h3 className="font-bold text-slate-800 text-base sm:text-lg">
                  Aktivitas Klik & Scan Mingguan
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Total {totalPeriodClicks} interaksi pengunjung dalam 7 hari terakhir
              </p>
            </div>

            {/* Toggle view mode */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setChartMode('bar')}
                className={`px-3 py-1 rounded-lg transition ${
                  chartMode === 'bar' ? 'bg-white text-[#005C53] font-bold shadow-sm' : 'text-slate-600'
                }`}
              >
                Grafik Batang
              </button>
              <button
                onClick={() => setChartMode('line')}
                className={`px-3 py-1 rounded-lg transition ${
                  chartMode === 'line' ? 'bg-white text-[#005C53] font-bold shadow-sm' : 'text-slate-600'
                }`}
              >
                Garis Tren
              </button>
            </div>
          </div>

          {/* Chart Display */}
          <div className="h-64 flex flex-col justify-end pt-4 pb-2 relative">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-25">
              <div className="border-b border-slate-300 w-full" />
              <div className="border-b border-slate-300 w-full" />
              <div className="border-b border-slate-300 w-full" />
              <div className="border-b border-slate-300 w-full" />
            </div>

            {chartMode === 'bar' ? (
              /* Bar Chart representation */
              <div className="flex items-end justify-between gap-2 sm:gap-4 h-full relative z-10 px-2">
                {trends.map((day, idx) => {
                  const heightPercent = Math.max(8, Math.round((day.clicks / maxClicks) * 100));
                  const isHovered = hoveredDay === idx;
                  return (
                    <div
                      key={day.date}
                      className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
                      onMouseEnter={() => setHoveredDay(idx)}
                      onMouseLeave={() => setHoveredDay(null)}
                    >
                      {/* Tooltip on hover */}
                      {isHovered && (
                        <div className="absolute -top-12 z-30 bg-slate-900 text-white text-[11px] font-semibold py-1 px-2.5 rounded-lg shadow-lg pointer-events-none whitespace-nowrap">
                          {day.clicks} klik / scan
                          <div className="text-[9px] text-slate-300 font-normal">{day.label}</div>
                        </div>
                      )}

                      {/* Bar fill */}
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full max-w-[38px] rounded-t-xl transition-all duration-300 ${
                          isHovered 
                            ? 'bg-[#005C53] shadow-md shadow-[#005C53]/30 scale-x-105' 
                            : 'bg-gradient-to-t from-[#005C53] to-[#70A9A1]'
                        }`}
                      />

                      {/* Number tag */}
                      <span className="text-[11px] font-bold text-slate-700 mt-2">
                        {day.clicks}
                      </span>

                      {/* Date label */}
                      <span className="text-[10px] text-slate-400 mt-0.5 truncate max-w-full text-center">
                        {day.label.split(',')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* SVG Line chart */
              <div className="relative h-full flex flex-col justify-end">
                <svg className="w-full h-44 overflow-visible" viewBox="0 0 700 160">
                  <defs>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#005C53" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#005C53" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Area fill */}
                  {trends.length > 1 && (
                    <polygon
                      fill="url(#lineGrad)"
                      points={`
                        0,160 
                        ${trends.map((t, i) => `${(i / (trends.length - 1)) * 700},${160 - (t.clicks / maxClicks) * 140}`).join(' ')} 
                        700,160
                      `}
                    />
                  )}

                  {/* Polyline */}
                  {trends.length > 1 && (
                    <polyline
                      fill="none"
                      stroke="#005C53"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={trends
                        .map((t, i) => `${(i / (trends.length - 1)) * 700},${160 - (t.clicks / maxClicks) * 140}`)
                        .join(' ')}
                    />
                  )}

                  {/* Points */}
                  {trends.map((t, i) => {
                    const cx = (i / (trends.length - 1)) * 700;
                    const cy = 160 - (t.clicks / maxClicks) * 140;
                    return (
                      <circle
                        key={t.date}
                        cx={cx}
                        cy={cy}
                        r="5"
                        className="fill-white stroke-[#005C53] stroke-[3] hover:r-7 transition-all cursor-pointer"
                      />
                    );
                  })}
                </svg>

                {/* Day labels beneath */}
                <div className="flex justify-between text-[11px] text-slate-500 font-medium pt-3 border-t border-slate-200">
                  {trends.map((t) => (
                    <span key={t.date} className="text-center">
                      {t.label.split(',')[0]}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Top Performing Locations */}
        <div className="bg-white/70 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-white/50 shadow-xl shadow-slate-200/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-slate-800 text-base sm:text-lg">
                  Top 5 Tempat Terbaik
                </h3>
              </div>
              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
                Paling Banyak Di-scan
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Lokasi dengan konversi ulasan Google Maps tertinggi.
            </p>

            <div className="space-y-3">
              {analytics?.topLocations && analytics.topLocations.length > 0 ? (
                analytics.topLocations.map((loc, idx) => {
                  const rankColors = [
                    'bg-amber-100 text-amber-800 border-amber-300',
                    'bg-slate-200 text-slate-800 border-slate-300',
                    'bg-orange-100 text-orange-800 border-orange-300',
                    'bg-slate-100 text-slate-700 border-slate-200',
                    'bg-slate-100 text-slate-700 border-slate-200',
                  ];

                  return (
                    <div
                      key={loc.id}
                      onClick={() => onSelectShortlink(loc.id)}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/70 hover:bg-white border border-slate-200/80 transition-all hover:border-[#005C53]/30 hover:shadow-sm cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold border ${
                            rankColors[idx] || 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {idx + 1}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-800 truncate group-hover:text-[#005C53]">
                            {loc.title}
                          </h4>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            <span>/r/{loc.short_slug}</span>
                            {loc.place_id ? (
                              <span className="text-emerald-700 font-medium">● Siap</span>
                            ) : (
                              <span className="text-amber-600 font-medium">● Unassigned</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0 ml-2">
                        <span className="text-sm font-extrabold text-[#005C53]">
                          {loc.click_count}
                        </span>
                        <span className="text-[10px] text-slate-400 block">klik</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Belum ada data shortlink.
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200/80">
            <div className="text-[11px] text-slate-500 flex items-center justify-between">
              <span>Dynamic Redirect:</span>
              <span className="font-semibold text-[#005C53]">Aktif (HTTP 302)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
