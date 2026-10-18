import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';
import { Banner } from '../../types';

interface BannerCarouselProps {
  banners: Banner[];
}

export const BannerCarousel: React.FC<BannerCarouselProps> = ({ banners }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const activeBanners = banners.filter((b) => b.is_active);

  const nextSlide = useCallback(() => {
    if (activeBanners.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  }, [activeBanners.length]);

  const prevSlide = useCallback(() => {
    if (activeBanners.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  }, [activeBanners.length]);

  // Auto rotation
  useEffect(() => {
    if (isHovered || activeBanners.length <= 1) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isHovered, nextSlide, activeBanners.length]);

  if (activeBanners.length === 0) {
    return null;
  }

  const current = activeBanners[currentIndex];

  return (
    <div
      className="relative w-full overflow-hidden bg-stone-900 select-none group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Aspect Ratio Container: 2.5:1 on desktop, 16:9 on tablet, 4:3 on mobile */}
      <div className="relative min-h-[360px] sm:min-h-[440px] md:min-h-[500px] lg:min-h-[560px] flex items-center">
        {/* Background Image with Fallback */}
        <div className="absolute inset-0 z-0">
          <picture>
            {current.mobile_image_url && (
              <source media="(max-width: 640px)" srcSet={current.mobile_image_url} />
            )}
            <img
              src={current.image_url}
              alt={current.title}
              onError={(e) => {
                // Fallback image if remote url fails
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=80';
              }}
              className="w-full h-full object-cover object-center transform transition-transform duration-1000 ease-out group-hover:scale-105"
            />
          </picture>

          {/* Luxury Warm Wood & Obsidian Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/90 via-stone-950/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-stone-950/20" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full py-12">
          <div className="max-w-xl text-left animate-in fade-in slide-in-from-left-6 duration-500 key={current.id}">
            {/* Promotional Badge */}
            {current.badge_text && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-800/80 border border-stone-600/50 text-stone-200 text-xs font-semibold tracking-wider uppercase mb-4 backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-stone-300" />
                <span>{current.badge_text}</span>
              </div>
            )}

            {/* Banner Title */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold font-serif text-white tracking-tight leading-tight mb-4 drop-shadow-md">
              {current.title}
            </h1>

            {/* Subtitle / Offer Details */}
            {current.subtitle && (
              <p className="text-sm sm:text-base md:text-lg text-stone-200 font-light leading-relaxed mb-8 drop-shadow-xs max-w-lg">
                {current.subtitle}
              </p>
            )}

            {/* CTA Button */}
            <div>
              <Link
                to={current.link_url || '/products'}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-stone-800 hover:bg-stone-700 active:scale-95 text-white font-semibold text-sm tracking-wide shadow-lg border border-stone-600/50 transition-all group/btn"
              >
                <span>{current.cta_text || 'Shop Collection'}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* Previous Button */}
        {activeBanners.length > 1 && (
          <button
            onClick={prevSlide}
            aria-label="Previous Offer"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 active:scale-90 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Next Button */}
        {activeBanners.length > 1 && (
          <button
            onClick={nextSlide}
            aria-label="Next Offer"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 active:scale-90 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Pagination Indicators */}
        {activeBanners.length > 1 && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {activeBanners.map((b, idx) => (
              <button
                key={b.id || idx}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Slide ${idx + 1}`}
                className={`transition-all duration-300 rounded-full h-2 ${
                  currentIndex === idx
                    ? 'w-8 bg-white shadow-md'
                    : 'w-2 bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
