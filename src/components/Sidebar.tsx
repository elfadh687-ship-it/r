import React from 'react';
import { 
  LayoutDashboard, 
  BarChart2, 
  MapPin, 
  Database, 
  LogOut, 
  LogIn, 
  ExternalLink, 
  Link as LinkIcon,
  X,
  Sparkles,
  Cloud
} from 'lucide-react';
import { User, SupabaseConfigStatus } from '../types';

interface SidebarProps {
  user: User | null;
  activeTab: 'links' | 'analytics';
  setActiveTab: (tab: 'links' | 'analytics') => void;
  onOpenCreateModal: () => void;
  onOpenAuthModal: () => void;
  onOpenDbModal: () => void;
  onOpenCloudflareModal: () => void;
  onLogout: () => void;
  dbStatus: SupabaseConfigStatus | null;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onOpenAuthModal,
  onOpenDbModal,
  onOpenCloudflareModal,
  onLogout,
  dbStatus,
  isOpenMobile,
  onCloseMobile,
}) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside 
        className={`fixed lg:static top-0 left-0 bottom-0 z-50 w-64 h-full bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out shrink-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#005C53] to-[#9FC131] flex items-center justify-center shadow-lg shadow-[#005C53]/20 text-white">
              <LinkIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight text-[#005C53]">
                Geo<span className="text-[#70A9A1]">Short</span>
              </span>
              <span className="block text-[10px] font-medium text-slate-400 -mt-0.5">
                ReviewLink Platform
              </span>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 space-y-1 mt-2 overflow-y-auto">
          <button
            id="nav-dashboard-btn"
            onClick={() => {
              setActiveTab('links');
              onCloseMobile();
            }}
            className={`w-full flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition ${
              activeTab === 'links'
                ? 'bg-[#005C53]/10 text-[#005C53]'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mr-3 text-current" />
            <span>Dashboard</span>
          </button>

          <button
            id="nav-analytics-btn"
            onClick={() => {
              setActiveTab('analytics');
              onCloseMobile();
            }}
            className={`w-full flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition ${
              activeTab === 'analytics'
                ? 'bg-[#005C53]/10 text-[#005C53]'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <BarChart2 className="w-5 h-5 mr-3 text-current" />
            <span>Analytics</span>
          </button>

          {/* External Google Place ID Finder */}
          <a
            id="nav-place-id-finder-link"
            href="https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-xl transition"
          >
            <div className="flex items-center">
              <MapPin className="w-5 h-5 mr-3 text-slate-400" />
              <span>Find Place ID</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>

          {/* Database / Supabase status */}
          <button
            id="nav-database-btn"
            onClick={() => {
              onOpenDbModal();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-xl transition"
          >
            <div className="flex items-center">
              <Database className="w-5 h-5 mr-3 text-slate-400" />
              <span>Database</span>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              dbStatus?.mode === 'supabase'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-slate-100 text-slate-600'
            }`}>
              {dbStatus?.mode === 'supabase' ? 'Supabase' : 'Active'}
            </span>
          </button>

          {/* Cloudflare Hosting Ready Button */}
          <button
            id="nav-cloudflare-btn"
            onClick={() => {
              onOpenCloudflareModal();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-500 hover:bg-orange-50/70 hover:text-orange-950 rounded-xl transition group"
          >
            <div className="flex items-center">
              <Cloud className="w-5 h-5 mr-3 text-orange-500 group-hover:text-orange-600 transition" />
              <span>Cloudflare</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
              Ready
            </span>
          </button>
        </nav>

        {/* User Account / Session Widget */}
        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#9FC131] border-2 border-white shadow-sm flex items-center justify-center text-[#005C53] font-bold text-xs shrink-0">
              {user ? user.email.charAt(0).toUpperCase() : 'B'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">
                {user ? user.email.split('@')[0] : 'Budi Santoso'}
              </p>
              <p className="text-[10px] text-slate-500 truncate">
                {user ? 'Pro Account' : 'Demo Account'}
              </p>
            </div>
            {user ? (
              <button
                id="sidebar-logout-btn"
                onClick={onLogout}
                title="Keluar Sesi"
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
              <button
                id="sidebar-login-btn"
                onClick={onOpenAuthModal}
                title="Masuk Akun"
                className="p-1.5 text-[#005C53] hover:text-[#005C53] hover:bg-[#005C53]/10 rounded-lg transition"
              >
                <LogIn className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
