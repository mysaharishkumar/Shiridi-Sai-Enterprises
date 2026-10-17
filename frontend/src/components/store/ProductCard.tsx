import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Eye, Check, Star } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);

  // Selected or active primary image
  const primaryImage =
    product.images.find((img) => img.is_primary)?.url ||
    product.images[0]?.url ||
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80';

  const secondaryImage = product.images[1]?.url || primaryImage;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!product.in_stock || product.total_stock <= 0) return;

    setIsAdding(true);
    try {
      // Pick first color if available
      const defaultColor = product.colors?.[0]?.name;
      const defaultVariant = product.variants?.[0]?.variant_id;
      await addItem(product.id, 1, defaultVariant, defaultColor);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  const isLowStock = product.in_stock && product.total_stock > 0 && product.total_stock <= 5;
  const isOutOfStock = !product.in_stock || product.total_stock <= 0;

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl border border-stone-200/90 shadow-xs hover:shadow-xl hover:border-amber-300 transition-all duration-300 overflow-hidden">
      {/* Badges Overlay */}
      <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1.5 pointer-events-none">
        {product.discount_percentage ? (
          <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-bold text-[10px] tracking-wide shadow-xs uppercase">
            {product.discount_percentage}% OFF
          </span>
        ) : null}

        {product.is_featured && (
          <span className="px-2 py-0.5 rounded-full bg-amber-800 text-amber-100 font-semibold text-[10px] tracking-wide shadow-xs">
            Featured
          </span>
        )}

        {product.is_best_seller && (
          <span className="px-2 py-0.5 rounded-full bg-emerald-700 text-white font-semibold text-[10px] tracking-wide shadow-xs">
            Best Seller
          </span>
        )}
      </div>

      {/* Product Image Container */}
      <Link
        to={`/product/${product.slug}`}
        className="relative block aspect-4/3 w-full overflow-hidden bg-stone-100"
      >
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Quick View Overlay Button */}
        <div className="absolute inset-0 bg-stone-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/95 text-stone-900 text-xs font-semibold shadow-lg backdrop-blur-xs transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <Eye className="w-3.5 h-3.5" /> View Details
          </span>
        </div>
      </Link>

      {/* Product Information */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Category Tag & Rating */}
          <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1">
            <span className="font-medium text-amber-800 uppercase tracking-wider">
              {product.category_name || 'Furniture'}
            </span>
            <div className="flex items-center gap-1 text-amber-600 font-semibold">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              <span>{product.rating || 4.8}</span>
            </div>
          </div>

          {/* Product Title */}
          <Link
            to={`/product/${product.slug}`}
            className="block font-medium text-sm text-stone-900 group-hover:text-amber-800 transition-colors line-clamp-2 leading-snug"
          >
            {product.name}
          </Link>

          {/* Material & Finish snippet */}
          {product.material && (
            <p className="text-[11px] text-stone-500 line-clamp-1 mt-1">
              {product.material}
            </p>
          )}

          {/* Color Indicators */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[10px] text-stone-400">Colors:</span>
              <div className="flex items-center gap-1">
                {product.colors.slice(0, 4).map((c, i) => (
                  <span
                    key={i}
                    title={c.name}
                    style={{ backgroundColor: c.hex_code || '#78350F' }}
                    className="w-3 h-3 rounded-full border border-stone-300 shadow-xs"
                  />
                ))}
                {product.colors.length > 4 && (
                  <span className="text-[10px] text-stone-400">+{product.colors.length - 4}</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Pricing & Stock Status */}
        <div className="pt-2 border-t border-stone-100 flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-base sm:text-lg font-bold text-stone-900">
                ₹{product.selling_price.toLocaleString('en-IN')}
              </span>
              {product.original_price && product.original_price > product.selling_price && (
                <span className="text-xs text-stone-400 line-through">
                  ₹{product.original_price.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            {/* Stock indicator badge */}
            <div>
              {isOutOfStock ? (
                <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                  Out of Stock
                </span>
              ) : isLowStock ? (
                <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                  Only {product.total_stock} left
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  In Stock
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons: Add to Cart & View Details */}
          <div className="grid grid-cols-2 gap-2 mt-1">
            <Link
              to={`/product/${product.slug}`}
              className="w-full py-2 px-2.5 rounded-xl border border-stone-300 hover:border-stone-400 text-stone-700 hover:bg-stone-50 text-xs font-semibold text-center transition-colors flex items-center justify-center gap-1"
            >
              Details
            </Link>

            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || isAdding}
              className={`w-full py-2 px-2.5 rounded-xl text-xs font-semibold text-center transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer ${
                isOutOfStock
                  ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  : added
                  ? 'bg-emerald-700 text-white'
                  : 'bg-amber-800 hover:bg-amber-900 active:scale-95 text-white'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Added</span>
                </>
              ) : isAdding ? (
                <span className="animate-pulse">Adding...</span>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
