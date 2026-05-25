import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { X, Heart, Eye, Tag, Calendar, Database, HardDrive, Sparkles, Copy, Check, Download } from 'lucide-react';
import { GalleryItem } from '../types';
import { galleryApi } from '../lib/galleryApi';
import ImageOptimized from './ImageOptimized';

interface ModalDetailsProps {
  item: GalleryItem;
  onClose: () => void;
  onLiked: (id: string, newLikes: number) => void;
}

export default function ModalDetails({ item, onClose, onLiked }: ModalDetailsProps) {
  const [likes, setLikes] = useState(item.likes);
  const [views, setViews] = useState(item.views);
  const [hasLiked, setHasLiked] = useState(false);
  const [copied, setCopied] = useState(false);

  // Auto record view analytics on load
  useEffect(() => {
    let active = true;
    galleryApi.viewItem(item.id).then(newViews => {
      if (active) setViews(newViews);
    });
    return () => {
      active = false;
    };
  }, [item.id]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasLiked) return;
    
    setHasLiked(true);
    const updatedLikesCount = await galleryApi.likeItem(item.id);
    setLikes(updatedLikesCount);
    onLiked(item.id, updatedLikesCount);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(item.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Human descriptive time format
  const formattedDate = new Date(item.created_at).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 md:p-8 backdrop-blur-md"
      onClick={onClose}
      id={`modal-overlay-${item.id}`}
    >
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="absolute top-4 right-4 z-50 bg-zinc-900/80 border border-zinc-800 p-2.5 rounded-full text-zinc-300 hover:text-white"
        onClick={onClose}
        id="btn-close-modal"
      >
        <X className="w-5 h-5" />
      </motion.button>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-zinc-950 border border-zinc-800/80 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto grid grid-cols-1 lg:grid-cols-12 shadow-2xl text-zinc-200"
        onClick={(e) => e.stopPropagation()}
        id={`modal-content-${item.id}`}
      >
        {/* Left Aspect Ratio Wrapper - Picture display */}
        <div className="lg:col-span-7 bg-black flex flex-col justify-center items-center p-4 border-b lg:border-b-0 lg:border-r border-zinc-800/70 min-h-[300px]">
          <div className="w-full h-full max-h-[70vh]">
            <ImageOptimized 
              src={item.url} 
              alt={item.title} 
              aspectRatio="auto"
              priority={true}
              className="rounded-xl shadow-lg border border-zinc-800 max-h-[65vh] w-full object-contain"
            />
          </div>
        </div>

        {/* Right Details content wrapper */}
        <div className="lg:col-span-5 p-6 md:p-8 flex flex-col justify-between" id={`details-container-${item.id}`}>
          <div>
            {/* Category Pill Tag */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[11px] font-mono tracking-wider text-emerald-400 bg-emerald-950/40 border border-emerald-900/60 px-2.5 py-0.5 rounded-full uppercase">
                {item.category}
              </span>
              <span className="text-[11px] font-mono text-zinc-500 flex items-center gap-1">
                <Database className="w-3 h-3 text-zinc-600" />
                {item.id.length > 8 ? 'Supabase' : 'Offline Engine'}
              </span>
            </div>

            {/* Title & Description */}
            <h2 className="text-2xl font-bold tracking-tight text-white mb-3" id={`modal-title-${item.id}`}>
              {item.title}
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed mb-6" id={`modal-desc-${item.id}`}>
              {item.description}
            </p>

            {/* Image Property Specifications */}
            <div className="bg-zinc-900/40 border border-zinc-900 rounded-xl p-4 space-y-3.5 mb-6 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 font-mono flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" /> Tanggal Unggah
                </span>
                <span className="text-zinc-300 font-medium">{formattedDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 font-mono flex items-center gap-2">
                  <HardDrive className="w-3.5 h-3.5" /> Ukuran Berkas
                </span>
                <span className="text-zinc-300 font-mono">{item.size_kb} KB</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 font-mono flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" /> Resolusi Asli
                </span>
                <span className="text-zinc-300 font-mono">{item.width} × {item.height} px</span>
              </div>
            </div>

            {/* Custom Tag Clusters */}
            {item.tags && item.tags.length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-semibold text-zinc-400 mb-2 flex items-center gap-1.5 font-mono uppercase">
                  <Tag className="w-3 h-3" /> Tag Identifikasi
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {item.tags.map((tag, i) => (
                    <span 
                      key={i} 
                      className="text-xs text-zinc-400 bg-zinc-900 hover:text-zinc-200 hover:bg-zinc-800 transition-colors px-2 py-0.5 rounded border border-zinc-800/40"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Social Feedback metrics & Actions Row */}
          <div className="mt-8 pt-6 border-t border-zinc-900 space-y-4">
            <div className="flex items-center justify-between text-zinc-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-xs font-mono">
                  <Eye className="w-4 h-4 text-zinc-500" />
                  <strong>{views}</strong> views
                </span>
                <span className="flex items-center gap-1.5 text-xs font-mono">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <strong>{likes}</strong> likes
                </span>
              </div>

              {/* Action Button: Like */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLike}
                disabled={hasLiked}
                className={`flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-xl transition-all duration-300 border ${
                  hasLiked 
                    ? 'bg-rose-950/30 text-rose-400 border-rose-900/60' 
                    : 'bg-zinc-800 hover:bg-rose-600 hover:text-white hover:border-rose-500 text-zinc-300 border-zinc-700/60'
                }`}
                id={`btn-like-${item.id}`}
              >
                <Heart className={`w-4 h-4 ${hasLiked ? 'fill-current text-rose-500' : ''}`} />
                {hasLiked ? 'Telah Disukai' : 'Sukai Foto'}
              </motion.button>
            </div>

            {/* Auxiliary Sharing Actions: Copy CDN and Open raw tab */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-2 text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800/80 py-2.5 rounded-xl transition"
                id="btn-copy-link"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400 animate-bounce" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Tersalin!' : 'Copy Link Gambar'}
              </button>

              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800/80 py-2.5 rounded-xl transition"
                id="btn-open-raw"
              >
                <Download className="w-4 h-4" />
                Unduh Original
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
