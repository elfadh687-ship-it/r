import React, { useState } from 'react';
import { X, MapPin, ExternalLink, Sparkles, HelpCircle, Check } from 'lucide-react';

interface CreateShortlinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; place_id?: string; custom_slug?: string }) => Promise<void>;
}

export const CreateShortlinkModal: React.FC<CreateShortlinkModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [placeId, setPlaceId] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Nama / Label tempat wajib diisi.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSubmit({
        title: title.trim(),
        place_id: placeId.trim() || undefined,
        custom_slug: customSlug.trim() || undefined,
      });
      setTitle('');
      setPlaceId('');
      setCustomSlug('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal membuat shortlink.');
    } finally {
      setLoading(false);
    }
  };

  const previewUrl = placeId.trim()
    ? `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId.trim())}`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div 
        className="glass-modal w-full max-w-lg rounded-3xl p-6 sm:p-7 relative border border-white/80 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#005C53]/10 text-[#005C53] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#005C53]" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                Buat Shortlink Review Baru
              </h3>
              <p className="text-xs text-slate-500">
                Buat tautan review dinamis & siapkan QR Code cetak
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {/* Field 1: Nama / Label */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Nama / Label Tempat <span className="text-red-500">*</span>
            </label>
            <input
              id="input-create-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Kopi Kenangan Cab. Tebet"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005C53]/20 focus:border-[#005C53]"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Digunakan sebagai penanda cabang atau nama usaha Anda.
            </p>
          </div>

          {/* Field 2: Place ID Google Maps */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <span>Google Maps Place ID</span>
                <span className="text-slate-400 font-normal">(Opsional)</span>
              </label>

              {/* Shortcut to Google Place ID Finder */}
              <a
                id="modal-place-id-finder-link"
                href="https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#005C53] hover:underline"
              >
                <MapPin className="w-3 h-3 text-[#9FC131]" />
                <span>Buka Place ID Finder</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>

            <input
              id="input-create-place-id"
              type="text"
              value={placeId}
              onChange={(e) => setPlaceId(e.target.value)}
              placeholder="Contoh: ChIJW9xK49TxaS4Rgq_Q_j3M1R8 (Boleh dikosongkan)"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005C53]/20 focus:border-[#005C53] font-mono"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Bisa dikosongkan dan diisi nanti. Jika kosong, pengunjung akan melihat halaman konfigurasi.
            </p>

            {/* Target URL Preview */}
            {previewUrl && (
              <div className="mt-2 p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                <span className="font-semibold block mb-0.5 text-[11px] text-emerald-900">
                  Target Google Review URL Otomatis:
                </span>
                <div className="font-mono text-[11px] break-all select-all text-emerald-700">
                  {previewUrl}
                </div>
              </div>
            )}
          </div>

          {/* Field 3: Custom Short ID */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Custom Short ID / Slug <span className="text-slate-400 font-normal">(Opsional)</span>
            </label>
            <div className="flex items-center">
              <span className="bg-slate-100 border border-r-0 border-slate-200 text-slate-500 text-xs font-mono px-3 py-2.5 rounded-l-xl">
                /r/
              </span>
              <input
                id="input-create-slug"
                type="text"
                value={customSlug}
                onChange={(e) => setCustomSlug(e.target.value)}
                placeholder="Otomatis angka unik jika dikosongkan (contoh: 1005)"
                className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-[#005C53]/20 focus:border-[#005C53] font-mono"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-200/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Batal
            </button>

            <button
              id="submit-create-shortlink-btn"
              type="submit"
              disabled={loading}
              className="gradient-btn text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl shadow transition active:scale-95 disabled:opacity-60"
            >
              {loading ? 'Menyimpan...' : 'Buat Shortlink'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
