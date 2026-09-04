import React, { useState } from 'react';
import { X, Database, Check, Copy, Shield, Server, Terminal, ExternalLink } from 'lucide-react';
import { SupabaseConfigStatus } from '../types';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: SupabaseConfigStatus | null;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  status,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const sqlCode = status?.sqlScript || `
-- Supabase SQL Schema setup for ReviewLink
CREATE TABLE IF NOT EXISTS public.shortlinks (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  short_slug TEXT UNIQUE NOT NULL,
  place_id TEXT,
  target_url TEXT,
  click_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.shortlinks ENABLE ROW LEVEL SECURITY;

-- Allow public redirect lookup
CREATE POLICY "Public can view shortlinks" 
ON public.shortlinks FOR SELECT 
USING (true);

-- Allow owners full management
CREATE POLICY "Users can manage own shortlinks" 
ON public.shortlinks FOR ALL 
USING (auth.uid() = user_id);
  `.trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <div 
        className="glass-modal w-full max-w-xl rounded-3xl p-6 sm:p-7 relative border border-white/80 shadow-2xl my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center">
              <Database className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                Status Integrasi Supabase & Database
              </h3>
              <p className="text-xs text-slate-500">
                PostgreSQL Schema & Konfigurasi Autentikasi
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

        {/* Current Mode Badge */}
        <div className="mb-5 p-4 rounded-2xl border bg-slate-50/80 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#005C53]/10 text-[#005C53] flex items-center justify-center shrink-0 mt-0.5">
            <Server className="w-4 h-4" />
          </div>
          <div className="flex-1 text-xs">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-slate-800">Mode Database Saat Ini:</span>
              <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                status?.mode === 'supabase'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-[#005C53]/10 text-[#005C53]'
              }`}>
                {status?.mode === 'supabase' ? 'Supabase Cloud PostgreSQL' : 'Local High-Performance Store'}
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              {status?.message || 'Database siap digunakan secara mulus dengan penyimpanan persisten.'}
            </p>
          </div>
        </div>

        {/* SQL Schema Script Box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-slate-500" />
              <span>Skema SQL Tabel Supabase (`shortlinks`):</span>
            </span>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#005C53] hover:underline"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Tersalin ke Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin SQL Schema</span>
                </>
              )}
            </button>
          </div>

          <div className="relative">
            <pre className="bg-slate-900 text-slate-100 text-[11px] font-mono p-3.5 rounded-xl overflow-x-auto max-h-44 border border-slate-800 leading-relaxed select-all">
              {sqlCode}
            </pre>
          </div>
        </div>

        {/* Connection Setup Guide */}
        <div className="mt-5 p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl text-xs text-emerald-900">
          <h4 className="font-bold mb-1 flex items-center gap-1.5 text-emerald-950">
            <Shield className="w-3.5 h-3.5 text-emerald-700" />
            <span>Cara Menghubungkan Project Supabase Sendiri:</span>
          </h4>
          <ol className="list-decimal list-inside space-y-1 text-emerald-800 text-[11px] leading-relaxed">
            <li>Buat project baru di Supabase.com</li>
            <li>Buka SQL Editor di Dashboard Supabase dan jalankan script SQL di atas</li>
            <li>Masukkan <code className="bg-white/80 px-1 py-0.5 rounded font-mono">SUPABASE_URL</code> dan <code className="bg-white/80 px-1 py-0.5 rounded font-mono">SUPABASE_ANON_KEY</code> ke environment variables</li>
          </ol>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold gradient-btn text-white rounded-xl shadow-sm"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
