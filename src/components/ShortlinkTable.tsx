import React, { useState } from 'react';
import { 
  Search, 
  QrCode, 
  Edit3, 
  Trash2, 
  Copy, 
  Check, 
  ExternalLink, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  Filter,
  Plus
} from 'lucide-react';
import { Shortlink } from '../types';

interface ShortlinkTableProps {
  shortlinks: Shortlink[];
  baseUrl: string;
  onEdit: (shortlink: Shortlink) => void;
  onDelete: (shortlink: Shortlink) => void;
  onOpenQR: (shortlink: Shortlink) => void;
  onOpenCreate: () => void;
  filter: 'all' | 'assigned' | 'unassigned';
  setFilter: (filter: 'all' | 'assigned' | 'unassigned') => void;
  search: string;
  setSearch: (search: string) => void;
}

export const ShortlinkTable: React.FC<ShortlinkTableProps> = ({
  shortlinks,
  baseUrl,
  onEdit,
  onDelete,
  onOpenQR,
  onOpenCreate,
  filter,
  setFilter,
  search,
  setSearch,
}) => {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopy = (shortlink: Shortlink) => {
    const fullUrl = `${baseUrl}/r/${shortlink.short_slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(shortlink.id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  return (
    <section className="flex-1 flex flex-col bg-white/70 backdrop-blur-md rounded-3xl border border-white/50 shadow-xl shadow-slate-200/50 overflow-hidden">
      {/* Table Header Controls */}
      <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="font-bold text-slate-800 text-sm sm:text-base">
            Recent Shortlinks
          </h2>
          <span className="text-[11px] text-slate-400 font-medium">
            ({shortlinks.length} links)
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="shortlink-search-input"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search links..."
              className="text-xs pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005C53]/20 w-44 sm:w-52 bg-white/90 transition"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status Filter Pill */}
          <div className="flex items-center bg-slate-100/90 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                filter === 'all'
                  ? 'bg-white text-[#005C53] font-bold shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('assigned')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                filter === 'assigned'
                  ? 'bg-white text-emerald-700 font-bold shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Assigned
            </button>
            <button
              onClick={() => setFilter('unassigned')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                filter === 'unassigned'
                  ? 'bg-white text-amber-700 font-bold shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Missing ID
            </button>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/50 text-[10px] uppercase tracking-widest text-slate-400 font-bold sticky top-0 border-b border-slate-100">
            <tr>
              <th className="px-6 py-3">Location Name</th>
              <th className="px-6 py-3">Shortlink ID</th>
              <th className="px-6 py-3">Place ID Status</th>
              <th className="px-6 py-3">Total Scans</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-slate-100">
            {shortlinks.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                  <div className="max-w-xs mx-auto space-y-2">
                    <p className="font-semibold text-slate-600">No shortlinks found</p>
                    <p className="text-xs text-slate-400">
                      {search
                        ? 'Try modifying your search criteria.'
                        : 'Create your first dynamic shortlink to start receiving Google Maps reviews.'}
                    </p>
                    <button
                      onClick={onOpenCreate}
                      className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#005C53] to-[#70A9A1] text-white rounded-xl text-xs font-semibold shadow-md shadow-[#005C53]/20"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create New Link</span>
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              shortlinks.map((link) => {
                const isAssigned = Boolean(link.place_id && link.place_id.trim());

                return (
                  <tr
                    key={link.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    {/* Location Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#005C53]/5 flex items-center justify-center text-[#005C53] shrink-0">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-semibold text-slate-900 block truncate max-w-xs sm:max-w-sm">
                            {link.title}
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            {new Date(link.created_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Shortlink ID */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-600 text-xs font-medium">
                          r/{link.short_slug}
                        </span>
                        <a
                          id={`test-link-${link.id}`}
                          href={`/r/${link.short_slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-slate-400 hover:text-[#005C53] transition"
                          title="Open shortlink"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </td>

                    {/* Place ID Status */}
                    <td className="px-6 py-4">
                      {isAssigned ? (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase">
                            ASSIGNED
                          </span>
                          <span 
                            className="font-mono text-[11px] text-slate-400 truncate max-w-[120px] hidden md:inline" 
                            title={link.place_id!}
                          >
                            {link.place_id}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 uppercase">
                            MISSING ID
                          </span>
                          <button
                            onClick={() => onEdit(link)}
                            className="text-[10px] font-bold text-[#005C53] hover:underline"
                          >
                            + Set
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Total Scans */}
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {(link.click_count || 0).toLocaleString('id-ID')}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        {/* Copy Link Button */}
                        <button
                          id={`copy-btn-${link.id}`}
                          onClick={() => handleCopy(link)}
                          className="p-1.5 text-[#005C53] hover:bg-[#005C53]/10 rounded-md transition"
                          title="Copy shortlink"
                        >
                          {copiedId === link.id ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>

                        {/* QR Code Button */}
                        <button
                          id={`qr-btn-${link.id}`}
                          onClick={() => onOpenQR(link)}
                          className="p-1.5 text-[#70A9A1] hover:bg-[#70A9A1]/10 rounded-md transition"
                          title="View / Print QR Code"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>

                        {/* Edit Button */}
                        <button
                          id={`edit-btn-${link.id}`}
                          onClick={() => onEdit(link)}
                          className="p-1.5 text-[#005C53] hover:bg-[#005C53]/10 rounded-md transition"
                          title="Edit link or Place ID"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Delete Button */}
                        <button
                          id={`delete-btn-${link.id}`}
                          onClick={() => onDelete(link)}
                          className="p-1.5 text-red-400 hover:bg-red-50 rounded-md transition"
                          title="Delete shortlink"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Pagination Bar */}
      <div className="px-6 py-4 border-t border-slate-100 bg-white/50 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-medium gap-2">
        <span>
          Showing {shortlinks.length} of {shortlinks.length} shortlinks
        </span>
        <div className="flex gap-1">
          <button 
            disabled 
            className="px-2 py-1 border border-slate-200 rounded text-slate-400 cursor-not-allowed text-[11px]"
          >
            Previous
          </button>
          <button className="px-2.5 py-1 bg-[#005C53] text-white font-bold rounded text-[11px]">
            1
          </button>
          <button 
            disabled 
            className="px-2 py-1 border border-slate-200 rounded text-slate-400 cursor-not-allowed text-[11px]"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
};
