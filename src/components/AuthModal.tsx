import React, { useState } from 'react';
import { X, Lock, Mail, UserCheck, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User, token: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('elfadh687@gmail.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint = isSignUp ? '/api/auth/signup' : '/api/auth/login';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Autentikasi gagal.');
      }

      onSuccess(data.user, data.token);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal login.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDemo: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Demo login gagal.');
      onSuccess(data.user, data.token);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal login demo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div 
        className="glass-modal w-full max-w-md rounded-3xl p-6 sm:p-7 relative border border-white/80 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#005C53]/10 text-[#005C53] flex items-center justify-center">
              <Lock className="w-5 h-5 text-[#005C53]" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                {isSignUp ? 'Daftar Akun Baru' : 'Masuk ke ReviewLink'}
              </h3>
              <p className="text-xs text-slate-500">
                Kelola shortlink review & QR code bisnis Anda
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
        <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Alamat Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="auth-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@bisnis.com"
                className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005C53]/20 focus:border-[#005C53]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Kata Sandi / Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="auth-password-input"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005C53]/20 focus:border-[#005C53]"
              />
            </div>
          </div>

          <button
            id="auth-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full mt-2 gradient-btn text-white text-xs sm:text-sm font-semibold py-2.5 rounded-xl shadow transition active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Memproses...' : isSignUp ? 'Daftar Sekarang' : 'Masuk ke Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Login Option */}
        <div className="mt-4 pt-3 border-t border-slate-200/80 text-center">
          <button
            id="auth-demo-login-btn"
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-[#005C53] text-xs font-bold py-2 rounded-xl border border-emerald-200 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#9FC131]" />
            <span>Login Instan Mode Demo (1-Klik)</span>
          </button>
        </div>

        {/* Switch Sign In / Sign Up */}
        <div className="mt-4 text-center text-xs text-slate-500">
          {isSignUp ? (
            <span>
              Sudah memiliki akun?{' '}
              <button
                type="button"
                onClick={() => setIsSignUp(false)}
                className="font-bold text-[#005C53] hover:underline"
              >
                Masuk di sini
              </button>
            </span>
          ) : (
            <span>
              Belum memiliki akun?{' '}
              <button
                type="button"
                onClick={() => setIsSignUp(true)}
                className="font-bold text-[#005C53] hover:underline"
              >
                Daftar akun baru
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
