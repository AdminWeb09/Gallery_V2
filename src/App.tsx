import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Database, PlusCircle, LayoutDashboard, Grid3X3, Layers3, 
  Settings, HelpCircle, ArrowRight, Github, CodeXml, Heart, RefreshCw, LogOut
} from 'lucide-react';
import { GalleryItem, SupabaseConfigState } from './types';
import { galleryApi } from './lib/galleryApi';
import GalleryGrid from './components/GalleryGrid';
import AdminPanel from './components/AdminPanel';
import ModalDetails from './components/ModalDetails';
import AdminLogin from './components/AdminLogin';

export default function App() {
  // Global Workspace states
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [config, setConfig] = useState<SupabaseConfigState>(galleryApi.getConfig());
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'browse' | 'admin'>('browse');
  const [lastSyncTime, setLastSyncTime] = useState<string>('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => localStorage.getItem('admin_session_active') === 'true');

  const handleLogout = () => {
    localStorage.removeItem('admin_session_active');
    setIsAdminAuthenticated(false);
  };

  // Fetch initial assets and register real-time updates
  const loadDatabase = async () => {
    setIsLoading(true);
    try {
      const dbItems = await galleryApi.getItems();
      setItems(dbItems);
      setLastSyncTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (e) {
      console.error('Failed to load initial assets:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // 1. Initial Load of items
    loadDatabase();

    // 2. Register real-time database listener
    const unsubscribe = galleryApi.subscribeToChanges((freshItems) => {
      setItems(freshItems);
      setLastSyncTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    });

    // Clean up connections on unmount
    return () => {
      unsubscribe();
    };
  }, [config.useLocalFallback, config.url]);

  // Client handlers for item insertions and deletions
  const handleItemAdded = (newItem: GalleryItem) => {
    setItems(prev => [newItem, ...prev]);
  };

  const handleItemDeleted = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  // Synchronize internal state on like event received from modal details
  const handleLikeUpdated = (id: string, newLikesCount: number) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, likes: newLikesCount } : item));
    if (selectedItem && selectedItem.id === id) {
      setSelectedItem(current => current ? { ...current, likes: newLikesCount } : null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col justify-between font-sans selection:bg-emerald-500/30 selection:text-emerald-400">
      
      {/* HEADER SECTION WITH NAVIGATION */}
      <header className="border-b border-zinc-900 bg-zinc-950/60 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Main Logo brand */}
          <div className="flex items-center gap-3 select-none">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Layers3 className="w-5.5 h-5.5 text-zinc-950" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5 font-mono">
                SUITE GALLERY 
                <span className="text-[10px] text-zinc-500 font-normal">v1.2.0</span>
              </h1>
              <p className="text-[10px] text-zinc-500 font-mono tracking-wide">Serverless Media Platform</p>
            </div>
          </div>

          {/* Quick status details pill */}
          <div className="hidden lg:flex items-center gap-2 bg-zinc-900 border border-zinc-850 px-3.5 py-1.5 rounded-full">
            <span className={`w-2 h-2 rounded-full ${config.isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400 animate-pulse'}`} />
            <span className="text-[11px] font-mono text-zinc-400">
              Database: <strong className={config.isConnected ? "text-emerald-400" : "text-amber-400"}>{config.isConnected ? 'Supabase cloud' : 'Simulasi Lokal'}</strong>
            </span>
            {lastSyncTime && (
              <span className="text-[10px] text-zinc-600 font-mono border-l border-zinc-800 pl-2">
                Aktif {lastSyncTime}
              </span>
            )}
            <button 
              onClick={loadDatabase} 
              className="hover:rotate-180 transition-all duration-500 text-zinc-600 hover:text-zinc-400 pl-1"
              title="Perbarui Data"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>

          {/* View Toggle tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('browse')}
              className={`flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl transition ${
                activeTab === 'browse'
                  ? 'bg-zinc-900 text-emerald-400 border border-zinc-800'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
              }`}
              id="nav-btn-browse"
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span>Telusuri</span>
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl transition ${
                activeTab === 'admin'
                  ? 'bg-zinc-900 text-emerald-400 border border-zinc-800'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
              }`}
              id="nav-btn-admin"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Admin Panel</span>
            </button>

            {isAdminAuthenticated && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2.5 rounded-xl bg-red-950/40 text-red-400 border border-red-900/40 hover:bg-red-900 hover:text-white hover:border-transparent transition"
                id="nav-btn-logout"
                title="Keluar Admin"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* CORE WRAPPER / HERO VIEWPORT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full">
        <AnimatePresence mode="wait">
          
          {/* ==================== VIEW 1: BROWSE CATALOG GRID ==================== */}
          {activeTab === 'browse' && (
            <motion.div
              key="browse-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
              id="gallery-browse-container"
            >
              {/* Introduction Banner header */}
              <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-900 p-6 md:p-8 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden relative">
                <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/5 blur-[120px] rounded-full -mr-16 -mt-16 pointer-events-none" />
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" /> Karya Seni Terunggah
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">Galeri Fotografi Serverless</h2>
                  <p className="text-xs text-zinc-400 max-w-xl leading-relaxed">
                    Katalog visual performa tinggi dengan rendering instan, lazy loading yang dioptimasi, dan pembaruan metrik analitik real-time. Hubungkan ke data proyek Supabase Anda kapan saja dari panel admin.
                  </p>
                </div>

                {!config.isConfigured && (
                  <button
                    onClick={() => {
                      setActiveTab('admin');
                      // Wait a brief tick then trigger settings panel switch inside Admin component
                      setTimeout(() => {
                        const tabBtn = document.getElementById('tab-admin-supabase');
                        if (tabBtn) tabBtn.click();
                      }, 10);
                    }}
                    className="bg-zinc-900 hover:bg-zinc-850 text-zinc-300 font-medium text-xs px-4 py-3 rounded-xl border border-zinc-800 flex items-center gap-2 group transition"
                    id="banner-btn-connect"
                  >
                    <span>Hubungkan database</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
              </div>

              {/* Gallery elements display */}
              <GalleryGrid 
                items={items} 
                onSelectItem={setSelectedItem} 
                onLikeItem={handleLikeUpdated}
                isLoading={isLoading}
              />
            </motion.div>
          )}

          {/* ==================== VIEW 2: ADMIN MANAGEMENT CONTROL ==================== */}
          {activeTab === 'admin' && (
            <motion.div
              key="admin-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              id="gallery-admin-container"
            >
              {!isAdminAuthenticated ? (
                <AdminLogin 
                  onSuccess={() => setIsAdminAuthenticated(true)}
                  onBack={() => setActiveTab('browse')}
                />
              ) : (
                <AdminPanel
                  items={items}
                  onItemAdded={handleItemAdded}
                  onItemDeleted={handleItemDeleted}
                  config={config}
                  onConfigChange={setConfig}
                />
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* CORE LIGHTBOX COMPONENT POPUP */}
      <AnimatePresence>
        {selectedItem && (
          <ModalDetails 
            item={selectedItem} 
            onClose={() => setSelectedItem(null)} 
            onLiked={handleLikeUpdated}
          />
        )}
      </AnimatePresence>

      {/* FOOTER METADATA */}
      <footer className="border-t border-zinc-900 py-6 mt-16 bg-zinc-950/20 text-zinc-600 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono">
          <p>© 2026 Space Web Gallery. Built with React and Supabase integration.</p>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5"><CodeXml className="w-3.5 h-3.5" /> Express + Vite Stack</span>
            <span className="text-zinc-800">•</span>
            <span className="flex items-center gap-1.5"><Database className="w-3.5 h-3.5" /> Supabase Storage Storage Enabled</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
