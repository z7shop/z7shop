'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlineX } from 'react-icons/hi';

interface ImageGalleryProps {
  images: string[];
  name: string;
}

export default function ImageGallery({ images, name }: ImageGalleryProps) {
  const imgs = images.length > 0 ? images : [];
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zooming, setZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const mainRef = useRef<HTMLDivElement>(null);

  const goTo = useCallback((index: number) => {
    if (imgs.length === 0) return;
    setActiveIndex((index + imgs.length) % imgs.length);
  }, [imgs.length]);

  const prev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);
  const next = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [lightboxOpen, prev, next]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mainRef.current) return;
    const rect = mainRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  if (imgs.length === 0) {
    return (
      <div className="space-y-4">
        <div className="aspect-square bg-gradient-to-br from-gray-800/40 to-gray-900/60 rounded-2xl overflow-hidden flex items-center justify-center">
          <span className="text-8xl opacity-30">👔</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {/* Main Image */}
        <div
          ref={mainRef}
          className="relative aspect-square bg-gradient-to-br from-gray-800/40 to-gray-900/60 rounded-2xl overflow-hidden cursor-zoom-in group"
          onClick={() => setLightboxOpen(true)}
          onMouseEnter={() => setZooming(true)}
          onMouseLeave={() => setZooming(false)}
          onMouseMove={handleMouseMove}
        >
          <div
            className="w-full h-full transition-transform duration-100"
            style={zooming ? {
              transform: 'scale(2)',
              transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
            } : undefined}
          >
            <Image
              src={imgs[activeIndex]}
              alt={`${name} - ${activeIndex + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </div>

          {/* Counter badge */}
          <div className="absolute bottom-3 end-3 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-lg pointer-events-none z-10">
            {activeIndex + 1} / {imgs.length}
          </div>

          {/* Prev/Next arrows */}
          {imgs.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute start-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 z-10"
              >
                <HiOutlineChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute end-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 z-10"
              >
                <HiOutlineChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {imgs.length > 1 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {imgs.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition-all ${activeIndex === i ? 'border-gold ring-2 ring-gold/30 scale-105' : 'border-gray-700/50 hover:border-gray-500'}`}
              >
                <Image src={img} alt={`${name} thumbnail ${i + 1}`} fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center animate-fade-in" onClick={() => setLightboxOpen(false)}>
          {/* Close */}
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 end-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/20 transition-colors z-10"
          >
            <HiOutlineX className="w-6 h-6" />
          </button>

          {/* Counter */}
          <div className="absolute top-4 start-4 text-white/70 text-sm font-medium z-10">
            {activeIndex + 1} / {imgs.length}
          </div>

          {/* Image */}
          <div className="max-w-4xl max-h-[85vh] w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <Image
              src={imgs[activeIndex]}
              alt={`${name} - ${activeIndex + 1}`}
              width={800}
              height={800}
              className="w-full h-full object-contain rounded-lg animate-fade-in"
            />
          </div>

          {/* Nav arrows */}
          {imgs.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute start-2 md:start-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <HiOutlineChevronLeft className="w-7 h-7" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute end-2 md:end-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <HiOutlineChevronRight className="w-7 h-7" />
              </button>
            </>
          )}

          {/* Swipe hint on mobile */}
          <p className="absolute bottom-6 start-1/2 -translate-x-1/2 text-white/40 text-xs md:hidden">
            ← Swipe to navigate →
          </p>
        </div>
      )}
    </>
  );
}
