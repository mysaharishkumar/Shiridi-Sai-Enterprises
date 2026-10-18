import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, MessageCircle, Star, Phone, Share2 } from 'lucide-react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { settings } = useStore();
  const { success: toastSuccess } = useToast();
  const [activeColorIndex, setActiveColorIndex] = useState<number>(0);

  // Pick color-specific image if selected, otherwise fallback to primary
  const selectedColor = product.colors?.[activeColorIndex];
  const colorImage = selectedColor?.image_url || selectedColor?.images?.[0];

  const primaryImage =
    colorImage ||
    product.images.find((img) => img.is_primary)?.url ||
    product.images[0]?.url ||
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80';

  const isOutOfStock = !product.in_stock || product.total_stock <= 0;

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const productUrl = `${window.location.origin}/product/${product.slug}`;
    const shareData = {
      title: `${product.name} | Shiridi Sai Enterprises`,
      text: `Take a look at ${product.name} at Shiridi Sai Enterprises:`,
      url: productUrl,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(productUrl);
      toastSuccess('Product link copied to clipboard!');
    } catch {
      const input = document.createElement('input');
      input.value = productUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      toastSuccess('Product link copied to clipboard!');
    }
  };

  const whatsappPhone = settings?.whatsapp_number
    ? settings.whatsapp_number.replace(/[^0-9]/g, '')
    : '919876543210';

  const whatsappText = encodeURIComponent(
    `Hi Shiridi Sai Enterprises, I want to know about "${product.name}" (Showroom Offer Price: ₹${product.selling_price.toLocaleString('en-IN')}). Is it currently available at your showroom?`
  );

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl border border-stone-200/90 shadow-xs hover:shadow-xl hover:border-stone-400 transition-all duration-300 overflow-hidden">
      {/* Share Button (Top Right) */}
      <button
        type="button"
        onClick={handleShare}
        aria-label={`Share ${product.name}`}
        title="Share this product"
        className="absolute top-2.5 right-2.5 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 hover:bg-white text-stone-700 hover:text-stone-900 shadow-sm border border-stone-200/80 flex items-center justify-center transition-all opacity-85 hover:opacity-100 active:scale-90 cursor-pointer"
      >
        <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>

      {/* Badges Overlay */}
      <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1.5 pointer-events-none">
        {product.discount_percentage ? (
          <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-bold text-[11px] tracking-wide shadow-xs uppercase">
            {product.discount_percentage}% OFF
          </span>
        ) : null}

        {product.is_featured && (
          <span className="px-2 py-0.5 rounded-full bg-stone-800 text-stone-100 font-semibold text-[10px] tracking-wide shadow-xs">
            Featured
          </span>
        )}

        {product.is_best_seller && (
          <span className="px-2 py-0.5 rounded-full bg-emerald-800 text-white font-semibold text-[10px] tracking-wide shadow-xs">
            Best Seller
          </span>
        )}
      </div>

      {/* Product Image Container (Displays complete size uploaded image without cropping) */}
      <Link
        to={`/product/${product.slug}`}
        className="relative block aspect-4/3 w-full overflow-hidden bg-stone-50 flex items-center justify-center p-2"
      >
        <img
          src={primaryImage}
          alt={product.name}
          className="max-h-full max-w-full w-auto h-auto object-contain mx-auto group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Quick View Overlay Button */}
        <div className="absolute inset-0 bg-stone-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/95 text-stone-900 text-xs font-semibold shadow-lg backdrop-blur-xs transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <Eye className="w-3.5 h-3.5" /> View Details & Colors
          </span>
        </div>
      </Link>

      {/* Product Information */}
      <div className="p-2.5 sm:p-4 flex flex-col flex-1 justify-between gap-2 sm:gap-3">
        <div>
          {/* Category Tag & Rating */}
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-stone-500 mb-1">
            <span className="font-semibold text-stone-600 uppercase tracking-wider truncate max-w-[90px] sm:max-w-none">
              {product.category_name || 'Furniture'}
            </span>
            <div className="flex items-center gap-0.5 sm:gap-1 text-amber-500 font-semibold shrink-0">
              <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-500 text-amber-500" />
              <span>{product.rating || 4.8}</span>
            </div>
          </div>

          {/* Product Title */}
          <Link
            to={`/product/${product.slug}`}
            className="block font-medium text-xs sm:text-sm text-stone-900 group-hover:text-stone-700 transition-colors line-clamp-2 leading-snug"
          >
            {product.name}
          </Link>

          {/* Material & Timber snippet */}
          {product.material && (
            <p className="text-[10px] sm:text-[11px] text-stone-500 line-clamp-1 mt-0.5 sm:mt-1 font-sans">
              {product.material} {product.finish ? `• ${product.finish}` : ''}
            </p>
          )}

          {/* Color Indicators with Click to Preview Image */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[9px] sm:text-[10px] text-stone-400 font-medium hidden sm:inline">Finishes:</span>
              <div className="flex items-center gap-1">
                {product.colors.map((c, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveColorIndex(i);
                    }}
                    title={`${c.name}${c.image_url ? ' (Click to view image)' : ''}`}
                    style={{ backgroundColor: c.hex_code || '#78350F' }}
                    className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border transition-transform cursor-pointer ${
                      activeColorIndex === i
                        ? 'scale-125 ring-2 ring-stone-700 border-white'
                        : 'border-stone-300 hover:scale-110'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pricing Display */}
        <div className="pt-2 border-t border-stone-100 flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-1 flex-wrap">
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm sm:text-lg font-bold text-stone-900 font-sans">
                ₹{product.selling_price.toLocaleString('en-IN')}
              </span>
              {product.original_price && product.original_price > product.selling_price && (
                <span className="text-[10px] sm:text-xs text-stone-400 line-through">
                  ₹{product.original_price.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            {/* Stock indicator badge */}
            <div className="hidden sm:block">
              {isOutOfStock ? (
                <span className="text-[9px] sm:text-[10px] font-semibold text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded-md">
                  Made to Order
                </span>
              ) : (
                <span className="text-[9px] sm:text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                  In Stock
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons: View Details & Call Showroom */}
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mt-0.5">
            <Link
              to={`/product/${product.slug}`}
              className="w-full py-1.5 sm:py-2 px-1 sm:px-2.5 rounded-xl border border-stone-300 hover:border-stone-400 text-stone-800 hover:text-stone-900 hover:bg-stone-100 text-[11px] sm:text-xs font-semibold text-center transition-colors flex items-center justify-center gap-1"
            >
              <span className="sm:hidden">Details</span>
              <span className="hidden sm:inline">View Details</span>
            </Link>

            <a
              href={`tel:${settings?.phone || '9876543210'}`}
              className="w-full py-1.5 sm:py-2 px-1 sm:px-2 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-[11px] sm:text-xs font-semibold text-center transition-all flex items-center justify-center gap-1 shadow-xs"
              title="Call showroom"
            >
              <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span>Call</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
