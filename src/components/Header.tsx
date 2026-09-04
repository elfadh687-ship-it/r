import React from 'react';
import { 
  Plus, 
  Menu, 
  RefreshCw, 
  MapPin, 
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { User, SupabaseConfigStatus } from '../types';

interface HeaderProps {
  user: User | null;
  activeTab: 'links' | 'analytics';
  setActiveTab: (tab: 'links' | 'analytics') => void;
  onOpenCreateModal: () => void;
  onOpenAuthModal: () => void;
  onOpenDbModal: () => void;
  onLogout: () => void;
  dbStatus: SupabaseConfigStatus | null;
  onToggleMobileMenu?: () => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenCreateModal,
  onToggleMobileMenu,
  onRefresh,
  isLoading,
}) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between shrink-0 z-30">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger toggle */}
        <button
          id="mobile-menu-toggle-btn"
          onClick={onToggleMobileMenu}
          className="p-2 -ml-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl lg:hidden transition"
          aria-label="Buka Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
            {activeTab === 'links' ? 'Overview Dashboard' : 'Performance Analytics'}
          </h1>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            {activeTab === 'links' 
              ? 'Kelola shortlink ulasan & cetak QR Code Google Maps' 
              : 'Pantau analitik klik, scan, dan performa lokasi'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
            title="Segarkan Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#005C53]' : ''}`} />
          </button>
        )}

        <button
          id="create-shortlink-header-btn"
          onClick={onOpenCreateModal}
          className="px-4 py-2 bg-gradient-to-r from-[#005C53] to-[#70A9A1] text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-[#005C53]/20 flex items-center gap-2 hover:opacity-95 active:scale-95 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Link</span>
        </button>
      </div>
    </header>
  );
};
