import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, SlidersHorizontal, Heart, Eye, ArrowUpDown, LayoutGrid, Sparkles, Filter, Grid3X3 } from 'lucide-react';
import { GalleryItem } from '../types';
import ImageOptimized from './ImageOptimized';

interface GalleryGridProps {
  items: GalleryItem[];
  onSelectItem: (item: GalleryItem) => void;
  onLikeItem: (id: string, newLikes: number) => void;
  isLoading: boolean;
}

type SortOption = 'latest' | 'likes' | 'views' | 'size';

export default function GalleryGrid({ items, onSelectItem, onLikeItem, isLoading }: GalleryGridProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [gridStyle, setGridStyle] = useState<'masonry' | 'standard'>('standard');

  // Discover all registered visual categories dynamically
  const categories = useMemo(() => {
    const list = new Set<string>();
    items.forEach(item => {
      if (item.category) list.add(item.category);
    });
    return ['Semua', ...Array.from(list)];
  }, [items]);

  // Compute filtering and sorting values
  const processedItems = useMemo(() => {
    // 1. Search Query and Category Filters
    let result = items.filter(item => {
      const matchesSearch = 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === 'Semua' || item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    // 2. Metrics Sorting
    result.sort((a, b) => {
      if (sortBy === 'latest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === 'likes') {
        return b.likes - a.likes;
      }
      if (sortBy === 'views') {
        return b.views - a.views;
      }
      if (sortBy === 'size') {
        return b.size_kb - a.size_kb;
      }
      return 0;
    });

    return result;
  }, [items, searchQuery, selectedCategory, sortBy]);

  return (
    <div className="space-y-6" id="gallery-grid-main">
      {/* Category Tabs Scrollbar & Layout Mode Selectors */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between border-b border-zinc-900 pb-5">
        <div className="flex flex-wrap gap-1.5 overflow-x-auto select-none no-scrollbar max-w-full">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs font-medium tracking-wide py-2 px-4 rounded-full transition-all duration-300 ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-zinc-950 font-semibold shadow-md shadow-emerald-500/10 scale-102 border border-emerald-400'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800/50'
              }`}
              id={`tab-category-${cat.toLowerCase()}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* View Layout options toggle */}
        <div className="flex items-center gap-2 self-end md:self-auto bg-zinc-950/40 p-1 border border-zinc-900 rounded-lg">
          <button
            onClick={() => setGridStyle('standard')}
            className={`p-1.5 rounded transition ${gridStyle === 'standard' ? 'bg-zinc-900 text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'}`}
            title="Symmetrical Grid"
            id="btn-grid-style-standard"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setGridStyle('masonry')}
            className={`p-1.5 rounded transition ${gridStyle === 'masonry' ? 'bg-zinc-900 text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'}`}
            title="Masonry-styled Heights"
            id="btn-grid-style-masonry"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Query Filter panel and Settings Controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Search Input bar */}
        <div className="relative md:col-span-6">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Cari foto, deskripsi, atau tag di sini..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800/80 focus:border-emerald-500/70 focus:ring-1 focus:ring-emerald-500/20 text-sm pl-11 pr-4 py-3 rounded-xl text-zinc-200 outline-none transition"
            id="input-gallery-search"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-500 hover:text-zinc-300 bg-zinc-850 px-1.5 py-0.5 rounded"
            >
              clear
            </button>
          )}
        </div>

        {/* Metrics Sorter Picker */}
        <div className="relative md:col-span-3 flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-zinc-500 shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="w-full bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800/80 text-sm p-3 rounded-xl text-zinc-300 outline-none transition cursor-pointer appearance-none"
            id="select-gallery-sort"
          >
            <option value="latest">Terbaru Ditambahkan</option>
            <option value="likes">Terpopuler (Likes)</option>
            <option value="views">Paling Sering Dilihat</option>
            <option value="size">Ukuran Berkas Terbesar</option>
          </select>
        </div>

        {/* Total stats match indicators */}
        <div className="md:col-span-3 text-right text-xs text-zinc-400 font-mono flex items-center justify-end gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          Ditemukan <strong className="text-zinc-100">{processedItems.length}</strong> dari <strong className="text-zinc-100">{items.length}</strong> karya
        </div>
      </div>

      {/* Loading Overlay State */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin" />
          <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest animate-pulse">Memuat Database Gallery...</p>
        </div>
      ) : processedItems.length === 0 ? (
        <div className="py-20 p-8 text-center bg-zinc-950 border border-zinc-800/40 rounded-2xl max-w-lg mx-auto">
          <Filter className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-zinc-300">Tidak Ada Foto Ditemukan</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-2.5">
            Coba pastikan kata kunci pencarian Anda benar atau ubah filter kategori terpilih untuk menemukan karya seni Anda.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('Semua');
            }}
            className="mt-6 text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 px-4 py-2.5 rounded-lg font-medium transition"
          >
            Reset Semua Filter
          </button>
        </div>
      ) : (
        /* Image Grid Columns based on style state */
        <motion.div 
          layout
          className={
            gridStyle === 'masonry'
              ? 'columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4'
              : 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5'
          }
          id="gallery-grid-items"
        >
          <AnimatePresence mode="popLayout">
            {processedItems.map((item) => (
              <motion.div
                key={item.id}
                layoutId={`card-${item.id}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                onClick={() => onSelectItem(item)}
                className={`group relative cursor-pointer bg-zinc-900/40 border border-zinc-900 hover:border-zinc-800 hover:bg-zinc-900/80 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 ${
                  gridStyle === 'masonry' ? 'break-inside-avoid block' : 'flex flex-col h-full'
                }`}
                id={`item-card-${item.id}`}
              >
                {/* Image Block Wrapper */}
                <div className="relative overflow-hidden shrink-0">
                  <ImageOptimized 
                    src={item.url} 
                    alt={item.title} 
                    aspectRatio={gridStyle === 'standard' ? 'square' : 'auto'}
                  />
                  {/* Category overlay tags */}
                  <span className="absolute top-2.5 left-2.5 z-20 text-[10px] font-semibold font-mono bg-zinc-950/80 backdrop-blur border border-zinc-800/80 text-emerald-400 px-2 py-0.5 rounded uppercase">
                    {item.category}
                  </span>
                </div>

                {/* Info Text Block */}
                <div className="p-4 flex flex-col justify-between flex-grow">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors line-clamp-1" id={`card-title-${item.id}`}>
                      {item.title}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1 line-clamp-2 leading-relaxed" id={`card-desc-${item.id}`}>
                      {item.description}
                    </p>
                  </div>

                  {/* Likes and Views Metrics tokens */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-900/80 text-[10px] font-mono text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-zinc-600" />
                      <strong>{item.views}</strong> views
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 text-rose-600/70" />
                      <strong>{item.likes}</strong> likes
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
