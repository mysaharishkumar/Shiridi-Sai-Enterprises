import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
  const hasLink = Boolean(current.link_url && current.link_url.trim());

  const imageElement = (
    <picture className="w-full h-full block">
      {current.mobile_image_url && (
        <source media="(max-width: 640px)" srcSet={current.mobile_image_url} />
      )}
      <img
        src={current.image_url}
        alt={current.title || 'Promotional Offer Banner'}
        onError={(e) => {
          (e.target as HTMLImageElement).src =
            'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=80';
        }}
        className="w-full h-full object-cover object-center"
      />
    </picture>
  );

  return (
    <div
      className="relative w-full overflow-hidden bg-stone-900 select-none group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Banner Container: Only pure image rendered, clickable only if target link_url exists */}
      <div className="relative min-h-[300px] sm:min-h-[400px] md:min-h-[480px] lg:min-h-[540px] flex items-center">
        {hasLink ? (
          <Link
            to={current.link_url!.trim()}
            className="absolute inset-0 z-0 block cursor-pointer transition-opacity hover:opacity-95"
            title="View offer"
          >
            {imageElement}
          </Link>
        ) : (
          <div className="absolute inset-0 z-0 block cursor-default">
            {imageElement}
          </div>
        )}

        {/* Previous Button */}
        {activeBanners.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              prevSlide();
            }}
            aria-label="Previous Offer"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 active:scale-90 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-md"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Next Button */}
        {activeBanners.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              nextSlide();
            }}
            aria-label="Next Offer"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 active:scale-90 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-md"
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
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                aria-label={`Slide ${idx + 1}`}
                className={`transition-all duration-300 rounded-full h-2 cursor-pointer ${
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
