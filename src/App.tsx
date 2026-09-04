import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { SummaryMetrics } from './components/SummaryMetrics';
import { ClickAnalytics } from './components/ClickAnalytics';
import { ShortlinkTable } from './components/ShortlinkTable';
import { CreateShortlinkModal } from './components/CreateShortlinkModal';
import { EditShortlinkModal } from './components/EditShortlinkModal';
import { QRCodeModal } from './components/QRCodeModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { SupabaseModal } from './components/SupabaseModal';
import { AuthModal } from './components/AuthModal';
import { Shortlink, User, AnalyticsData, SupabaseConfigStatus } from './types';
import { 
  CheckCircle2, 
  RefreshCw, 
  ShieldCheck,
  MapPin,
  Sparkles
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('reviewlink_token'));
  const [shortlinks, setShortlinks] = useState<Shortlink[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [dbStatus, setDbStatus] = useState<SupabaseConfigStatus | null>(null);
  const [baseUrl, setBaseUrl] = useState<string>(window.location.origin);
  const [loading, setLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Navigation & Filter states
  const [activeTab, setActiveTab] = useState<'links' | 'analytics'>('links');
  const [search, setSearch] = useState<string>('');
  const [filter, setFilter] = useState<'all' | 'assigned' | 'unassigned'>('all');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingShortlink, setEditingShortlink] = useState<Shortlink | null>(null);
  const [isQROpen, setIsQROpen] = useState(false);
  const [qrShortlink, setQrShortlink] = useState<Shortlink | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingShortlink, setDeletingShortlink] = useState<Shortlink | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);

  // Show temporary toast feedback
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Fetch initial session & user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch('/api/auth/me', { headers });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (err) {
        console.error('Error fetching auth:', err);
      }
    };
    fetchUser();
  }, [token]);

  // Fetch DB Status
  useEffect(() => {
    const fetchDbStatus = async () => {
      try {
        const res = await fetch('/api/db/status');
        if (res.ok) {
          const data = await res.json();
          setDbStatus(data);
        }
      } catch (err) {
        console.error('Error fetching db status:', err);
      }
    };
    fetchDbStatus();
  }, []);

  // Fetch Shortlinks & Analytics
  const loadData = async () => {
    try {
      setLoading(true);
      const [linksRes, analyticsRes] = await Promise.all([
        fetch(`/api/shortlinks?search=${encodeURIComponent(search)}&filter=${filter}`),
        fetch('/api/analytics'),
      ]);

      if (linksRes.ok) {
        const data = await linksRes.json();
        setShortlinks(data.shortlinks || []);
        if (data.baseUrl) setBaseUrl(data.baseUrl);
      }

      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, filter]);

  // Auth Handlers
  const handleAuthSuccess = (authUser: User, authToken: string) => {
    setUser(authUser);
    setToken(authToken);
    localStorage.setItem('reviewlink_token', authToken);
    showToast(`Selamat datang, ${authUser.email}!`);
    loadData();
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('reviewlink_token');
    showToast('Sesi berhasil keluar.');
  };

  // Create Shortlink Handler
  const handleCreateShortlink = async (data: { title: string; place_id?: string; custom_slug?: string }) => {
    const res = await fetch('/api/shortlinks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || 'Gagal membuat shortlink.');
    }
    showToast('Shortlink berhasil dibuat!');
    loadData();
    if (result.shortlink) {
      setQrShortlink(result.shortlink);
      setIsQROpen(true);
    }
  };

  // Edit Shortlink Handler
  const handleEditShortlink = async (id: number, data: { title: string; place_id?: string }) => {
    const res = await fetch(`/api/shortlinks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || 'Gagal memperbarui shortlink.');
    }
    showToast('Perubahan disimpan. Link ulasan diperbarui tanpa merubah QR!');
    loadData();
  };

  // Delete Shortlink Handler
  const handleDeleteShortlink = async (id: number) => {
    const res = await fetch(`/api/shortlinks/${id}`, {
      method: 'DELETE',
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || 'Gagal menghapus shortlink.');
    }
    showToast('Shortlink berhasil dihapus.');
    loadData();
  };

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] font-sans text-slate-800 overflow-hidden selection:bg-[#005C53]/15 selection:text-[#005C53]">
      {/* Toast feedback notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-[#9FC131]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Left Navigation Sidebar */}
      <Sidebar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCreateModal={() => setIsCreateOpen(true)}
        onOpenAuthModal={() => setIsAuthOpen(true)}
        onOpenDbModal={() => setIsDbModalOpen(true)}
        onLogout={handleLogout}
        dbStatus={dbStatus}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Dashboard Area */}
      <main className="flex-1 h-full flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <Header
          user={user}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenCreateModal={() => setIsCreateOpen(true)}
          onOpenAuthModal={() => setIsAuthOpen(true)}
          onOpenDbModal={() => setIsDbModalOpen(true)}
          onLogout={handleLogout}
          dbStatus={dbStatus}
          onToggleMobileMenu={() => setIsMobileSidebarOpen(true)}
          onRefresh={loadData}
          isLoading={loading}
        />

        {/* Scrollable Dashboard View */}
        <div className="p-6 sm:p-8 flex flex-col gap-6 flex-1 overflow-y-auto">
          {/* Value Proposition Hero Banner */}
          <div className="bg-white/70 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-white/50 shadow-xl shadow-slate-200/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#005C53] to-[#9FC131] text-white flex items-center justify-center shadow-lg shadow-[#005C53]/20 shrink-0">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <span>Dynamic Shortlink & QR Review Google Maps</span>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    Print Ready
                  </span>
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed mt-0.5">
                  Update your Google Place ID anytime if your location moves or rebrands, with zero need to reprint physical table tents or stickers.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                onClick={loadData}
                disabled={loading}
                className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl shadow-xs transition"
                title="Refresh Data"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#005C53]' : ''}`} />
                <span className="hidden sm:inline">Refresh Data</span>
              </button>
            </div>
          </div>

          {/* Metric Cards */}
          <SummaryMetrics
            analytics={analytics}
            onFilterUnassigned={() => {
              setActiveTab('links');
              setFilter('unassigned');
            }}
            onFilterAll={() => {
              setActiveTab('links');
              setFilter('all');
            }}
          />

          {/* View Tab Switching: Links or Analytics */}
          {activeTab === 'links' ? (
            <ShortlinkTable
              shortlinks={shortlinks}
              baseUrl={baseUrl}
              onEdit={(link) => {
                setEditingShortlink(link);
                setIsEditOpen(true);
              }}
              onDelete={(link) => {
                setDeletingShortlink(link);
                setIsDeleteOpen(true);
              }}
              onOpenQR={(link) => {
                setQrShortlink(link);
                setIsQROpen(true);
              }}
              onOpenCreate={() => setIsCreateOpen(true)}
              filter={filter}
              setFilter={setFilter}
              search={search}
              setSearch={setSearch}
            />
          ) : (
            <ClickAnalytics
              analytics={analytics}
              onOpenCreateModal={() => setIsCreateOpen(true)}
              onOpenQRModal={(link) => {
                setQrShortlink(link);
                setIsQROpen(true);
              }}
              onSelectShortlink={(id) => {
                const target = shortlinks.find((s) => s.id === id);
                if (target) {
                  setQrShortlink(target);
                  setIsQROpen(true);
                }
              }}
            />
          )}
        </div>
      </main>

      {/* Modals */}
      <CreateShortlinkModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateShortlink}
      />

      <EditShortlinkModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditingShortlink(null);
        }}
        shortlink={editingShortlink}
        onSubmit={handleEditShortlink}
      />

      <QRCodeModal
        isOpen={isQROpen}
        onClose={() => {
          setIsQROpen(false);
          setQrShortlink(null);
        }}
        shortlink={qrShortlink}
        baseUrl={baseUrl}
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeletingShortlink(null);
        }}
        shortlink={deletingShortlink}
        onConfirm={handleDeleteShortlink}
      />

      <SupabaseModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        status={dbStatus}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
