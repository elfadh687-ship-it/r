import React, { useState } from 'react';
import { 
  Cloud, 
  X, 
  CheckCircle2, 
  Copy, 
  Check, 
  ExternalLink, 
  Terminal, 
  Settings, 
  Globe, 
  FileCode,
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface CloudflareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CloudflareModal: React.FC<CloudflareModalProps> = ({ isOpen, onClose }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'quick' | 'build' | 'cli' | 'files'>('quick');

  if (!isOpen) return null;

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const wranglerConfig = `# wrangler.toml
name = "reviewlink"
compatibility_date = "2024-09-01"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = "dist"

[vars]
# SUPABASE_URL = "https://your-project.supabase.co"
# SUPABASE_ANON_KEY = "your-supabase-anon-key"`;

  const cliCommands = `# 1. Install Wrangler CLI
npm install -g wrangler

# 2. Login ke Cloudflare
npx wrangler login

# 3. Build & Deploy
npm run build:pages
npx wrangler pages deploy dist --project-name=reviewlink`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-slate-900 text-base">
                  Cloudflare Hosting Ready
                </h2>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Siap Deploy
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Aplikasi telah dikonfigurasi untuk Cloudflare Pages & Edge Functions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 px-6 bg-slate-50/50 text-xs font-semibold text-slate-600 overflow-x-auto gap-2 py-2">
          <button
            onClick={() => setActiveTab('quick')}
            className={`px-3 py-1.5 rounded-lg transition shrink-0 ${
              activeTab === 'quick'
                ? 'bg-white text-orange-600 shadow-xs font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            Panduan GitHub (Rekomendasi)
          </button>
          <button
            onClick={() => setActiveTab('build')}
            className={`px-3 py-1.5 rounded-lg transition shrink-0 ${
              activeTab === 'build'
                ? 'bg-white text-orange-600 shadow-xs font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            Pengaturan Build
          </button>
          <button
            onClick={() => setActiveTab('cli')}
            className={`px-3 py-1.5 rounded-lg transition shrink-0 ${
              activeTab === 'cli'
                ? 'bg-white text-orange-600 shadow-xs font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            Deploy via CLI (Wrangler)
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`px-3 py-1.5 rounded-lg transition shrink-0 ${
              activeTab === 'files'
                ? 'bg-white text-orange-600 shadow-xs font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            File Konfigurasi
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {activeTab === 'quick' && (
            <div className="space-y-4">
              <div className="bg-orange-50 border border-orange-200/80 rounded-2xl p-4 text-orange-900">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <Zap className="w-4 h-4 text-orange-600" />
                  <span>Deployment Otomatis Cloudflare Pages</span>
                </div>
                <p className="text-[11px] text-orange-800 leading-relaxed">
                  Cukup tautkan repository GitHub proyek ini ke Cloudflare Pages. Setiap kali Anda melakukan update kode, Cloudflare akan mem-build dan men-deploy secara otomatis dengan CDN global super cepat.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <div className="w-6 h-6 rounded-full bg-orange-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-800">Push Kode ke GitHub</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Buat repository baru di GitHub dan upload seluruh file proyek ini.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <div className="w-6 h-6 rounded-full bg-orange-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-800">Hubungkan di Cloudflare Dashboard</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Buka <strong>Workers & Pages</strong> &rarr; <strong>Create application</strong> &rarr; tab <strong>Pages</strong> &rarr; <strong>Connect to Git</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <div className="w-6 h-6 rounded-full bg-orange-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    3
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-800">Gunakan Preset Build Otomatis</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Pilih <strong>Vite</strong>. Build command: <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-700 font-mono">npm run build:pages</code> dan output directory: <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-700 font-mono">dist</code>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    4
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-800">Selesai & Dapatkan Domain Gratis</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Aplikasi live di <code className="text-emerald-700 font-semibold font-mono">*.pages.dev</code> dan Anda bisa menambahkan custom domain Anda sendiri secara gratis!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'build' && (
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3 font-mono text-[11px]">
                <div className="flex items-center justify-between py-1.5 border-b border-slate-200">
                  <span className="text-slate-500 font-sans font-medium">Framework Preset:</span>
                  <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">Vite</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-200">
                  <span className="text-slate-500 font-sans font-medium">Build Command:</span>
                  <span className="font-bold text-orange-600 bg-white px-2 py-0.5 rounded border border-slate-200">npm run build:pages</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-200">
                  <span className="text-slate-500 font-sans font-medium">Build Output Directory:</span>
                  <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">dist</span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-slate-500 font-sans font-medium">Node.js Version:</span>
                  <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">20.x atau 22.x</span>
                </div>
              </div>

              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
                <h4 className="font-bold text-amber-900 text-xs mb-1">Environment Variables di Cloudflare:</h4>
                <p className="text-[11px] text-amber-800 mb-2">
                  Jika menggunakan Supabase, tambahkan di <em>Settings &rarr; Environment variables</em>:
                </p>
                <div className="bg-white/90 p-2.5 rounded-xl border border-amber-200 font-mono text-[10px] space-y-1 text-slate-700">
                  <div>SUPABASE_URL = https://your-project.supabase.co</div>
                  <div>SUPABASE_ANON_KEY = your-supabase-anon-key</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cli' && (
            <div className="space-y-3">
              <p className="text-slate-600 text-xs">
                Anda juga bisa deploy langsung dari terminal komputer Anda menggunakan <strong>Cloudflare Wrangler</strong>:
              </p>
              <div className="relative">
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-2xl font-mono text-[11px] overflow-x-auto leading-relaxed">
                  {cliCommands}
                </pre>
                <button
                  onClick={() => handleCopy(cliCommands, 'cli')}
                  className="absolute top-3 right-3 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition"
                  title="Salin Perintah"
                >
                  {copiedSection === 'cli' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'files' && (
            <div className="space-y-3">
              <p className="text-slate-600 text-xs">
                File integrasi Cloudflare yang sudah siap di dalam project ini:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5">
                  <FileCode className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 font-mono text-[11px]">wrangler.toml</span>
                    <p className="text-[10px] text-slate-500">Konfigurasi project Cloudflare Pages & flags</p>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5">
                  <FileCode className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 font-mono text-[11px]">public/_redirects</span>
                    <p className="text-[10px] text-slate-500">Routing SPA tanpa 404 saat refresh</p>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5">
                  <FileCode className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 font-mono text-[11px]">public/_headers</span>
                    <p className="text-[10px] text-slate-500">Header keamanan & CDN caching aset</p>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5">
                  <FileCode className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 font-mono text-[11px]">functions/r/[id].ts</span>
                    <p className="text-[10px] text-slate-500">Edge Function dynamic shortlink redirect</p>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5 sm:col-span-2">
                  <FileCode className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 font-mono text-[11px]">CLOUDFLARE_GUIDE.md</span>
                    <p className="text-[10px] text-slate-500">Dokumentasi panduan lengkap langkah demi langkah</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <a
            href="https://dash.cloudflare.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-orange-600 font-bold hover:underline"
          >
            <span>Buka Cloudflare Dashboard</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
