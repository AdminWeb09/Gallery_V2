import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageOff, Loader2 } from 'lucide-react';

interface ImageOptimizedProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: 'video' | 'square' | 'portrait' | 'auto' | 'landscape';
  priority?: boolean;
}

export default function ImageOptimized({
  src,
  alt,
  className = '',
  aspectRatio = 'auto',
  priority = false
}: ImageOptimizedProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [srcToLoad, setSrcToLoad] = useState('');

  // Re-emit triggers on source adjustment
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
    
    // Simulate slight network lag for realistic mock loads of big visuals
    const delay = priority ? 10 : 300;
    const timer = setTimeout(() => {
      setSrcToLoad(src);
    }, delay);

    return () => clearTimeout(timer);
  }, [src, priority]);

  // Translate ratio presets to Tailwind helper wrappers
  const ratioClasses = {
    video: 'aspect-video',
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]',
    auto: 'h-auto'
  };

  return (
    <div 
      className={`relative overflow-hidden bg-zinc-900 rounded-lg select-none w-full ${ratioClasses[aspectRatio]}`}
      id={`container-${alt.replace(/\s+/g, '-').toLowerCase()}`}
    >
      {/* Loading Blur / Shimmer Placeholder */}
      <AnimatePresence>
        {!isLoaded && !hasError && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gradient-to-tr from-zinc-900 via-zinc-800 to-zinc-950"
            id={`shimmer-${alt.replace(/\s+/g, '-').toLowerCase()}`}
          >
            {/* Shimmer overlay effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" 
                 style={{
                   animation: 'shimmer 1.8s infinite',
                   backgroundSize: '200% 100%'
                 }}
            />
            <Loader2 className="w-5 h-5 text-emerald-400/70 animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actual Image Tag */}
      {srcToLoad && !hasError ? (
        <motion.img
          initial={priority ? { opacity: 1 } : { opacity: 0, scale: 1.03 }}
          animate={isLoaded ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          src={srcToLoad}
          alt={alt}
          referrerPolicy="no-referrer"
          loading={priority ? 'eager' : 'lazy'}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`w-full h-full object-cover transition-colors duration-300 ${className} ${
            isLoaded ? 'filter-none' : 'blur-md bg-zinc-900'
          }`}
          id={`img-${alt.replace(/\s+/g, '-').toLowerCase()}`}
        />
      ) : null}

      {/* Error Fallback */}
      {hasError && (
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-zinc-900 text-zinc-500 border border-zinc-800/60 rounded-lg"
          id={`error-${alt.replace(/\s+/g, '-').toLowerCase()}`}
        >
          <ImageOff className="w-8 h-8 mb-2 text-zinc-600 animate-pulse" />
          <p className="text-xs font-mono max-w-[200px] truncate">{alt}</p>
          <span className="text-[10px] text-red-400 bg-red-950/40 border border-red-900/30 px-1.5 py-0.5 rounded mt-1.5 font-mono">
            Load failed
          </span>
        </div>
      )}

      {/* Shimmer Animation CSS Rules */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
