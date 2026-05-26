import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Database, PlusCircle, Trash2, CheckCircle2, ChevronRight, Info, AlertTriangle, 
  BarChart3, UploadCloud, Copy, Eye, Heart, HardDrive, Sparkles, FolderClosed
} from 'lucide-react';
import { GalleryItem, GalleryStats, SupabaseConfigState } from '../types';
import { galleryApi } from '../lib/galleryApi';

interface AdminPanelProps {
  items: GalleryItem[];
  onItemAdded: (newItem: GalleryItem) => void;
  onItemDeleted: (id: string) => void;
  config: SupabaseConfigState;
  onConfigChange: (newConfig: SupabaseConfigState) => void;
}

export default function AdminPanel({ items, onItemAdded, onItemDeleted, config, onConfigChange }: AdminPanelProps) {
  // Config states
  const [supabaseUrl, setSupabaseUrl] = useState(config.url);
  const [supabaseKey, setSupabaseKey] = useState(config.anonKey);
  const [useLocalFallback, setUseLocalFallback] = useState(config.useLocalFallback);
  const [showConfigSuccess, setShowConfigSuccess] = useState(false);

  // New Image states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Design');
  const [rawTags, setRawTags] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Tab control states: 'upload' | 'items' | 'supabase' | 'analytics'
  const [activeSubTab, setActiveSubTab] = useState<'upload' | 'items' | 'supabase' | 'analytics'>('upload');
  const [stats, setStats] = useState<GalleryStats | null>(null);
  const [schemaCopied, setSchemaCopied] = useState(false);

  // Load analytical stats
  useEffect(() => {
    galleryApi.getStats().then(setStats);
  }, [items]);

  // Handle saving of credentials
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = galleryApi.saveConfig(supabaseUrl, supabaseKey, useLocalFallback);
    onConfigChange(updated);
    setShowConfigSuccess(true);
    setTimeout(() => setShowConfigSuccess(false), 3000);
  };

  // Upload file interaction handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      // Automatically derive raw title from filename
      if (!title) {
        const cleanName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        setTitle(cleanName.replace(/[-_]+/g, ' '));
      }
    }
  };

  // Submit item creation payload
  const handleUploadItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      setErrorMessage('Judul gambar wajib diisi!');
      return;
    }
    if (!selectedFile && !imageUrl) {
      setErrorMessage('Silakan unggah berkas gambar atau masukkan tautan URL gambar!');
      return;
    }

    setIsUploading(true);
    setErrorMessage('');
    
    try {
      const tagList = rawTags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const newItem = await galleryApi.uploadItem({
        title,
        description,
        category,
        tags: tagList,
        file: selectedFile,
        imageUrl: selectedFile ? undefined : imageUrl
      });

      onItemAdded(newItem);
      
      // Reset upload inputs
      setTitle('');
      setDescription('');
      setSelectedFile(null);
      setImageUrl('');
      setRawTags('');
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Internal connection error, cannot upload item.');
    } finally {
      setIsUploading(false);
    }
  };

  // Delete handler
  const handleDeleteItem = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus gambar ini?')) {
      const success = await galleryApi.deleteItem(id);
      if (success) {
        onItemDeleted(id);
      }
    }
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(galleryApi.getPostgresSchemaCode());
    setSchemaCopied(true);
    setTimeout(() => setSchemaCopied(false), 2000);
  };

  return (
    <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden shadow-2xl" id="admin-panel-root">
      {/* Tab select bar */}
      <div className="grid grid-cols-4 border-b border-zinc-900 text-center text-xs font-mono font-semibold text-zinc-400 select-none bg-zinc-950/40">
        <button
          onClick={() => setActiveSubTab('upload')}
          className={`py-4 transition flex flex-col md:flex-row items-center justify-center gap-1.5 border-b-2 ${
            activeSubTab === 'upload' ? 'border-emerald-500 bg-zinc-900/60 text-emerald-400' : 'border-transparent hover:bg-zinc-900/20 hover:text-zinc-300'
          }`}
          id="tab-admin-upload"
        >
          <PlusCircle className="w-4 h-4 shrink-0" />
          <span className="hidden md:inline">Unggah anyar</span>
        </button>

        <button
          onClick={() => setActiveSubTab('items')}
          className={`py-4 transition flex flex-col md:flex-row items-center justify-center gap-1.5 border-b-2 ${
            activeSubTab === 'items' ? 'border-emerald-500 bg-zinc-900/60 text-emerald-400' : 'border-transparent hover:bg-zinc-900/20 hover:text-zinc-300'
          }`}
          id="tab-admin-items"
        >
          <FolderClosed className="w-4 h-4 shrink-0" />
          <span className="hidden md:inline">Katalog</span>
        </button>

        <button
          onClick={() => setActiveSubTab('supabase')}
          className={`py-4 transition flex flex-col md:flex-row items-center justify-center gap-1.5 border-b-2 ${
            activeSubTab === 'supabase' ? 'border-emerald-500 bg-zinc-900/60 text-emerald-400' : 'border-transparent hover:bg-zinc-900/20 hover:text-zinc-300'
          }`}
          id="tab-admin-supabase"
        >
          <Database className="w-4 h-4 shrink-0" />
          <span className="hidden md:inline">Supabase</span>
        </button>

        <button
          onClick={() => setActiveSubTab('analytics')}
          className={`py-4 transition flex flex-col md:flex-row items-center justify-center gap-1.5 border-b-2 ${
            activeSubTab === 'analytics' ? 'border-emerald-500 bg-zinc-900/60 text-emerald-400' : 'border-transparent hover:bg-zinc-900/20 hover:text-zinc-300'
          }`}
          id="tab-admin-analytics"
        >
          <BarChart3 className="w-4 h-4 shrink-0" />
          <span className="hidden md:inline">Meta-Analisis</span>
        </button>
      </div>

      <div className="p-6 md:p-8" id="admin-panel-content">
        {/* ==================== SUB-TAB 1: UPLOAD WORKSHOP ==================== */}
        {activeSubTab === 'upload' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <UploadCloud className="w-5 h-5 text-emerald-400" />
                  Kreator Unggahan Gallery
                </h3>
                <p className="text-xs text-zinc-500 mt-1">Masukkan data metadata karya seni terbaru Anda ke galeri.</p>
              </div>
              <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 px-2.5 py-1 rounded border border-zinc-800">
                Mode: {config.useLocalFallback ? 'Simulasi Lokal' : 'Direct Supabase'}
              </span>
            </div>

            <form onSubmit={handleUploadItem} className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Column: Image inputs */}
              <div className="md:col-span-5 space-y-4">
                <label className="block text-xs font-semibold uppercase font-mono tracking-wider text-zinc-400">
                  Sumber Berkas Gambar
                </label>

                {/* Drag and Drop File selector */}
                <div className="relative border-2 border-dashed border-zinc-800/85 hover:border-emerald-500/50 bg-zinc-950 rounded-xl p-6 text-center transition cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    id="input-file-uploader"
                  />
                  <UploadCloud className="w-9 h-9 text-zinc-600 group-hover:text-emerald-400/80 mx-auto mb-2 transition" />
                  
                  {selectedFile ? (
                    <div className="text-xs text-zinc-300 font-mono">
                      <p className="font-bold text-emerald-400 truncate max-w-[240px] mx-auto">{selectedFile.name}</p>
                      <p className="text-zinc-500 mt-1">{Math.round(selectedFile.size / 1024)} KB • Klik untuk ganti</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs text-zinc-300 font-medium">Tarik & lepas file foto di sini</p>
                      <p className="text-[10px] text-zinc-500 mt-1">atau klik untuk menelusuri berkas</p>
                    </div>
                  )}
                </div>

                <div className="relative flex items-center my-4 font-mono text-[10px] text-zinc-600 uppercase text-center before:content-[''] before:flex-grow before:h-[1px] before:bg-zinc-900 before:mr-3 after:content-[''] after:flex-grow after:h-[1px] after:bg-zinc-900 after:ml-3">
                  Atau gunakan tautan URL
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5 font-mono">Tautan Teks Web URL</label>
                  <input
                    type="url"
                    placeholder="Contoh: https://images.unsplash.com/photo-..."
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      if (e.target.value) setSelectedFile(null); // URL pre-empts raw inputs
                    }}
                    disabled={!!selectedFile}
                    className="w-full bg-zinc-900/60 border border-zinc-850 focus:border-emerald-500/70 text-xs p-3 rounded-lg text-zinc-300 outline-none disabled:opacity-40 transition"
                    id="input-url-uploader"
                  />
                </div>
              </div>

              {/* Right Column: Text inputs */}
              <div className="md:col-span-7 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1.5 font-mono">Judul Karya *</label>
                    <input
                      type="text"
                      placeholder="Contoh: Ethereal Sunrise"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      className="w-full bg-zinc-900 border border-zinc-850 focus:border-emerald-500/70 text-xs p-3 rounded-lg text-zinc-200 outline-none transition"
                      id="input-title-creation"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1.5 font-mono">Kategori Utama</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-850 focus:border-emerald-500/70 text-xs p-3 rounded-lg text-zinc-300 outline-none transition cursor-pointer"
                      id="select-category-creation"
                    >
                      <option value="Architecture">Architecture</option>
                      <option value="Interior">Interior</option>
                      <option value="Nature">Nature</option>
                      <option value="Abstract">Abstract</option>
                      <option value="City">City</option>
                      <option value="Tech">Tech</option>
                      <option value="Design">Other Design</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5 font-mono">Deskripsi Rinci</label>
                  <textarea
                    placeholder="Tuliskan latar belakang narasi, gaya visual, atau suasana yang disampaikan karya ini..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full bg-zinc-900 border border-zinc-850 focus:border-emerald-500/70 text-xs p-3 rounded-lg text-zinc-200 outline-none resize-none transition"
                    id="input-description-creation"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5 font-mono">
                    Kata Kunci / Tag <span className="text-zinc-600 font-normal">(Dipisah dengan koma)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="landscape, mountains, orange, dawn"
                    value={rawTags}
                    onChange={(e) => setRawTags(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-850 focus:border-emerald-500/70 text-xs p-3 rounded-lg text-zinc-200 outline-none transition"
                    id="input-tags-creation"
                  />
                  <p className="text-[10px] text-zinc-500 mt-1 font-mono">Tags mempermudah saringan pencarian di katalog utama.</p>
                </div>

                {/* Error and Success popups */}
                {errorMessage && (
                  <div className="p-3.5 bg-red-950/40 border border-red-900/60 rounded-xl text-xs text-red-400 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {uploadSuccess && (
                  <div className="p-3.5 bg-emerald-950/40 border border-emerald-900/60 rounded-xl text-xs text-emerald-400 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>Gambar berhasil ditambahkan ke gallery serverless!</span>
                  </div>
                )}

                <div className="pt-2">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    disabled={isUploading}
                    type="submit"
                    className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 text-zinc-950 font-bold text-xs py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 cursor-pointer"
                    id="btn-submit-upload"
                  >
                    {isUploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                        <span>MENGUNGGAH KE DB...</span>
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-4 h-4" />
                        <span>TAMBAHKAN KE GALLERY</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* ==================== SUB-TAB 2: DATABASE ITEMS LIST ==================== */}
        {activeSubTab === 'items' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2 animate-fade">
                Katalog Pengolahan Karya ({items.length})
              </h3>
              <p className="text-xs text-zinc-500 mt-1">Sederhana dan aman untuk menghapus entri database dan assets penyimpanan.</p>
            </div>

            {items.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 text-xs">
                Belum ada items terunggah di database fallback.
              </div>
            ) : (
              <div className="overflow-x-auto border border-zinc-900 rounded-xl">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-zinc-900/50 text-zinc-500 uppercase tracking-wider font-mono border-b border-zinc-900">
                    <tr>
                      <th className="p-4 font-semibold">Karya</th>
                      <th className="p-4 font-semibold">Kategori</th>
                      <th className="p-4 font-semibold tracking-normal">Ukuran</th>
                      <th className="p-4 font-semibold">Tampilan / Suka</th>
                      <th className="p-4 text-right font-semibold">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900/60 bg-zinc-950">
                    {items.map((item) => (
                      <tr key={item.id} className="hover:bg-zinc-900/20 transition-colors">
                        <td className="p-4 flex items-center gap-3">
                          <img 
                            src={item.url} 
                            alt={item.title} 
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded object-cover border border-zinc-800" 
                          />
                          <div className="max-w-[200px] md:max-w-xs">
                            <p className="font-bold text-zinc-200 truncate">{item.title}</p>
                            <p className="text-[10px] text-zinc-500 truncate mt-0.5">{item.id}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="bg-zinc-900/70 border border-zinc-800 text-[10px] px-2 py-0.5 rounded font-mono">
                            {item.category}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-zinc-400">
                          {item.size_kb} KB
                        </td>
                        <td className="p-4 font-mono text-zinc-400">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5 text-zinc-600" /> {item.views}</span>
                            <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-rose-600/60" /> {item.likes}</span>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-red-400 hover:text-red-300 p-2 rounded hover:bg-red-950/30 border border-transparent hover:border-red-900/30 transition"
                            title="Hapus Karya"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ==================== SUB-TAB 3: SUPABASE ENVIRONMENT SYNC ==================== */}
        {activeSubTab === 'supabase' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-400 animate-pulse" />
                Sinkronisasi Serverless Supabase
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                Kembangkan aplikasi ke lingkungan cloud serverless real-time menggunakan platform Supabase.
              </p>
            </div>

            {/* Visual Status Indicator Card */}
            <div className={`p-4 rounded-xl border flex items-start gap-3.5 ${
              config.isConnected 
                ? 'bg-emerald-950/20 border-emerald-900/60 text-emerald-400' 
                : 'bg-zinc-900/30 border-zinc-900 text-zinc-400'
            }`}>
              {config.isConnected ? (
                <>
                  <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0 text-emerald-400" />
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase font-mono">Supabase Online</h4>
                    <p className="text-xs text-zinc-400 mt-1">
                      Koneksi aktif! Semua foto yang Anda unggah sekarang disimpan langsung secara fisik ke dalam tabel <code className="text-emerald-400 font-mono text-[11px]">gallery_items</code> dan bucket penyimpanan <code className="text-emerald-400 font-mono text-[11px]">gallery</code>.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0 text-amber-500/80 animate-pulse" />
                  <div>
                    <h4 className="text-xs font-bold text-zinc-200 uppercase font-mono">MOCK ENGINE (LENGKAP)</h4>
                    <p className="text-xs text-zinc-400 mt-1">
                      Menyala di program Simulasi Lokal. Anda tidak memerlukan akun di awal. File terunggah diubah menjadi strings teromptimalisasi dan dimuat instan pada memori peramban Anda. Anda dapat menambahkan kunci otentikasi di bawah untuk bermigrasi.
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Environment variables Guide */}
              <div className="space-y-4 bg-zinc-900/30 p-5 rounded-xl border border-zinc-900">
                <h4 className="text-xs font-bold font-mono tracking-wider text-zinc-400 uppercase">Informasi Kredensial Environment</h4>
                
                {config.isConnected ? (
                  <div className="space-y-4">
                    <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 rounded-xl text-emerald-400 text-xs">
                      Sistem mendeteksi kredensial secara langsung dari environment file <code className="font-mono text-white bg-zinc-950 px-1 py-0.5 rounded">.env</code> lokal Anda. Pengaturan UI web dinonaktifkan demi alasan efisiensi & keamanan maksimal.
                    </div>
                    <div className="space-y-2.5">
                      <div>
                        <span className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wider">URL Supabase Aktif</span>
                        <code className="block bg-zinc-950 border border-zinc-900 text-zinc-300 text-xs p-2.5 rounded-lg font-mono truncate">
                          {config.url}
                        </code>
                      </div>
                      <div>
                        <span className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Kunci Publik Anon</span>
                        <code className="block bg-zinc-950 border border-zinc-900 text-zinc-500 text-xs p-2.5 rounded-lg font-mono">
                          ••••••••••••••••••••••••••••••••••••••••••••
                        </code>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-xl text-zinc-400 text-xs leading-relaxed">
                      Sistem saat ini menggunakan database emulasi lokal (<span className="text-amber-400">Mock Engine</span>) karena variabel <code className="font-mono text-zinc-200">.env</code> belum dikonfigurasi.
                    </div>
                    <p className="text-xs text-zinc-500">
                      Untuk menghubungkan aplikasi Anda ke database cloud riil, tambahkan baris berikut ke file <strong className="text-zinc-300">.env</strong> atau <strong className="text-zinc-300">.env.local</strong> pada folder root proyek Anda:
                    </p>
                    <pre className="p-3 bg-zinc-950 rounded-xl border border-zinc-900 text-[11px] text-zinc-400 font-mono space-y-1 block leading-relaxed overflow-x-auto">
{`VITE_SUPABASE_URL=https://proyek-anda.supabase.co
VITE_SUPABASE_ANON_KEY=token-anon-publik-anda`}
                    </pre>
                    <div className="text-[10px] text-zinc-600 italic">
                      💡 Setelah mengedit file .env lokal Anda, reload/restart server untuk memuat koneksi baru secara otomatis.
                    </div>
                  </div>
                )}
              </div>

              {/* PostgreSQL Schema Code display */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                    <Database className="w-4 h-4 text-zinc-500" />
                    SQL Script Inisialisasi
                  </h4>
                  <button
                    onClick={handleCopySchema}
                    className="text-[10px] font-mono text-emerald-400 bg-emerald-950/20 hover:bg-emerald-950/50 px-2 py-1 rounded border border-emerald-900/40 flex items-center gap-1.5 transition"
                  >
                    <Copy className="w-3 h-3" />
                    {schemaCopied ? 'Tersalin' : 'Salin SQL'}
                  </button>
                </div>

                <p className="text-[10px] text-zinc-500 leading-relaxed">
                  Buka editor SQL di Supabase console proyek Anda, lalu jalankan script berikut untuk membuat tabel dan kebijakan regulasi baris (RLS):
                </p>

                <pre className="p-3.5 bg-black/70 rounded-xl border border-zinc-900 text-[10px] text-zinc-500 overflow-x-auto font-mono max-h-56 leading-relaxed">
                  {galleryApi.getPostgresSchemaCode()}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* ==================== SUB-TAB 4: GENERAL METRIC ANALYTICS ==================== */}
        {activeSubTab === 'analytics' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
                Statistik & Meta-Analisis Galeri
              </h3>
              <p className="text-xs text-zinc-500 mt-1">Metrik performa gambar, disukai audiens, dan optimasi kapasitas server.</p>
            </div>

            {stats ? (
              <div className="space-y-6">
                {/* 4 Core Banners metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-zinc-900/30 p-4 border border-zinc-900 rounded-xl text-center">
                    <p className="text-zinc-500 font-mono uppercase text-[9px] tracking-widest">Katalog Terbit</p>
                    <p className="text-xl font-bold text-white mt-1">{stats.totalCount}</p>
                    <span className="text-[9px] font-mono text-zinc-600 block mt-0.5">items database</span>
                  </div>

                  <div className="bg-zinc-905/30 p-4 border border-zinc-900 rounded-xl text-center">
                    <p className="text-zinc-500 font-mono uppercase text-[9px] tracking-widest">Pemberian Suka</p>
                    <p className="text-xl font-bold text-rose-400 mt-1 flex items-center justify-center gap-1">
                      <Heart className="w-4 h-4 fill-current" />
                      {stats.totalLikes}
                    </p>
                    <span className="text-[9px] font-mono text-zinc-600 block mt-0.5">likes total</span>
                  </div>

                  <div className="bg-zinc-900/30 p-4 border border-zinc-900 rounded-xl text-center">
                    <p className="text-zinc-500 font-mono uppercase text-[9px] tracking-widest">Jumlah Kunjungan</p>
                    <p className="text-xl font-bold text-emerald-400 mt-1 flex items-center justify-center gap-1">
                      <Eye className="w-4 h-4" />
                      {stats.totalViews}
                    </p>
                    <span className="text-[9px] font-mono text-zinc-600 block mt-0.5">views total</span>
                  </div>

                  <div className="bg-zinc-900/30 p-4 border border-zinc-900 rounded-xl text-center">
                    <p className="text-zinc-500 font-mono uppercase text-[9px] tracking-widest">Kapasitas Penyimpanan</p>
                    <p className="text-xl font-bold text-blue-400 mt-1 flex items-center justify-center gap-1">
                      <HardDrive className="w-4 h-4" />
                      {(stats.totalSizeKb / 1024).toFixed(1)} MB
                    </p>
                    <span className="text-[9px] font-mono text-zinc-600 block mt-0.5">data media</span>
                  </div>
                </div>

                {/* Sub bento chart distributions of tags */}
                <div className="bg-zinc-900/20 p-5 rounded-xl border border-zinc-900">
                  <h4 className="text-xs font-bold font-mono tracking-wider text-zinc-400 uppercase mb-4">Grafis Sebaran Kategori Karya</h4>
                  
                  <div className="space-y-4">
                    {Object.entries(stats.categories).map(([category, count]) => {
                      const numericCount = Number(count);
                      const sharePercentage = stats.totalCount > 0 ? (numericCount / stats.totalCount) * 100 : 0;
                      return (
                        <div key={category} className="space-y-1.5" id={`analytics-row-${category.toLowerCase()}`}>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-zinc-300 font-medium">{category}</span>
                            <span className="font-mono text-zinc-500">
                              <strong className="text-zinc-300">{count}</strong> karya ({sharePercentage.toFixed(0)}%)
                            </span>
                          </div>
                          <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-zinc-850/40">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${sharePercentage}%` }}
                              transition={{ duration: 1, ease: 'easeOut' }}
                              className="bg-emerald-500 h-full rounded-full"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-zinc-600 text-xs">
                Sedang menghitung sirkulasi database...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
