import React, { useState } from 'react';
import { AlertTriangle, X, Trash2 } from 'lucide-react';
import { Shortlink } from '../types';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortlink: Shortlink | null;
  onConfirm: (id: number) => Promise<void>;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  shortlink,
  onConfirm,
}) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !shortlink) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(shortlink.id);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div 
        className="glass-modal w-full max-w-md rounded-3xl p-6 relative border border-white/80"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">
              Hapus Shortlink?
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Apakah Anda yakin ingin menghapus shortlink <strong>"{shortlink.title}"</strong> (/r/{shortlink.short_slug})?
            </p>
            <p className="text-[11px] text-red-600 font-medium mt-2">
              ⚠️ Peringatan: QR Code yang telah dicetak untuk tautan ini tidak akan lagi dapat mengarahkan ke halaman review.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-200/80">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            Batal
          </button>
          <button
            id="confirm-delete-btn"
            type="button"
            disabled={loading}
            onClick={handleConfirm}
            className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow transition active:scale-95 disabled:opacity-60"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{loading ? 'Menghapus...' : 'Ya, Hapus Shortlink'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
