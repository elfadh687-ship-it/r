import React, { useState, useEffect } from 'react';
import { X, MapPin, ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react';
import { Shortlink } from '../types';

interface EditShortlinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortlink: Shortlink | null;
  onSubmit: (id: number, data: { title: string; place_id?: string }) => Promise<void>;
}

export const EditShortlinkModal: React.FC<EditShortlinkModalProps> = ({
  isOpen,
  onClose,
  shortlink,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [placeId, setPlaceId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (shortlink) {
      setTitle(shortlink.title);
      setPlaceId(shortlink.place_id || '');
    }
  }, [shortlink]);

  if (!isOpen || !shortlink) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Nama / Label tempat tidak boleh kosong.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSubmit(shortlink.id, {
        title: title.trim(),
        place_id: placeId.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal memperbarui shortlink.');
    } finally {
      setLoading(false);
    }
  };

  const previewUrl = placeId.trim()
    ? `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId.trim())}`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div 
        className="glass-modal w-full max-w-lg rounded-3xl p-6 sm:p-7 relative border border-white/80 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 mb-5">
          <div>
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">
              Edit Shortlink Review
            </h3>
            <p className="text-xs text-slate-500">
              Ubah Nama atau Place ID Google Maps
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Guarantee Callout */}
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-800">
          <ShieldCheck className="w-4 h-4 text-[#005C53] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-[#005C53] block mb-0.5">
              URL Shortlink & QR Code Tidak Berubah
            </span>
            <p className="text-emerald-700 text-[11px] leading-relaxed">
              Alamat <strong>/r/{shortlink.short_slug}</strong> dan QR Code yang sudah dicetak tetap sama. Hanya tujuan link ulasan Google Maps yang diperbarui.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {/* Readonly Shortlink Slug indicator */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">
              Shortlink ID (Tetap)
            </label>
            <div className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-3 py-2 rounded-xl border border-slate-200">
              /r/{shortlink.short_slug}
            </div>
          </div>

          {/* Nama / Label */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Nama / Label Tempat <span className="text-red-500">*</span>
            </label>
            <input
              id="input-edit-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005C53]/20 focus:border-[#005C53]"
            />
          </div>

          {/* Place ID */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <span>Google Maps Place ID</span>
              </label>

              <a
                href="https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#005C53] hover:underline"
              >
                <MapPin className="w-3 h-3 text-[#9FC131]" />
                <span>Place ID Finder</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>

            <input
              id="input-edit-place-id"
              type="text"
              value={placeId}
              onChange={(e) => setPlaceId(e.target.value)}
              placeholder="Contoh: ChIJW9xK49TxaS4Rgq_Q_j3M1R8"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005C53]/20 focus:border-[#005C53] font-mono"
            />

            {previewUrl ? (
              <div className="mt-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
                <span className="font-semibold block mb-0.5 text-[11px] text-slate-600">
                  Target Review Otomatis:
                </span>
                <div className="font-mono text-[11px] break-all select-all text-[#005C53]">
                  {previewUrl}
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-amber-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Jika dikosongkan, pengunjung akan melihat halaman konfigurasi.</span>
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-200/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Batal
            </button>

            <button
              id="submit-edit-shortlink-btn"
              type="submit"
              disabled={loading}
              className="gradient-btn text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl shadow transition active:scale-95 disabled:opacity-60"
            >
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
