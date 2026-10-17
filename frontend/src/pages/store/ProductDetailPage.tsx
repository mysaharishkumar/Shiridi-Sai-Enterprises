import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star, ShoppingBag, Truck, ShieldCheck, RefreshCw, Check,
  ChevronRight, ArrowLeft, Heart, Share2, HelpCircle, AlertCircle
} from 'lucide-react';
import { Product } from '../../types';
import { storeApi } from '../../api/client';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from '../../components/store/ProductCard';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { settings } = useStore();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Gallery state
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [zoomActive, setZoomActive] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  // Selection state
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const loadProduct = async () => {
      setLoading(true);
      try {
        const prod = await storeApi.getProduct(slug);
        setProduct(prod);

        // Set initial selected color / variant
        if (prod.colors && prod.colors.length > 0) {
          setSelectedColor(prod.colors[0].name);
        }
        if (prod.variants && prod.variants.length > 0) {
          setSelectedVariantId(prod.variants[0].variant_id);
        }

        // Fetch related products
        const rel = await storeApi.getRelatedProducts(prod.id);
        setRelatedProducts(rel);
      } catch (err) {
        console.error('Failed to load product details:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-pulse space-y-8">
        <div className="h-6 w-48 bg-stone-200 rounded-md" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-square bg-stone-200 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-10 bg-stone-200 rounded-lg w-3/4" />
            <div className="h-6 bg-stone-200 rounded-lg w-1/4" />
            <div className="h-28 bg-stone-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-2xl font-bold font-serif text-stone-900">Product Not Found</h2>
        <p className="text-stone-500 text-sm">
          The requested furniture piece might be unpublished or no longer in catalog.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-amber-800 text-white font-semibold text-xs"
        >
          <ArrowLeft className="w-4 h-4" /> Back to All Furniture
        </Link>
      </div>
    );
  }

  // Determine current active price & stock based on selected variant
  let currentPrice = product.selling_price;
  let currentOriginalPrice = product.original_price;
  let currentStock = product.total_stock;

  if (selectedVariantId) {
    const v = product.variants?.find((item) => item.variant_id === selectedVariantId);
    if (v) {
      if (v.price_override) currentPrice = v.price_override;
      if (v.stock_quantity !== undefined) currentStock = v.stock_quantity;
    }
  }

  const isOutOfStock = !product.in_stock || currentStock <= 0;
  const isLowStock = currentStock > 0 && currentStock <= 5;

  const currentImage = product.images[selectedImageIndex]?.url || product.images[0]?.url;

  // Image mouse move handler for zoom
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPosition({ x, y });
  };

  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    setIsAdding(true);
    try {
      await addItem(product.id, quantity, selectedVariantId || undefined, selectedColor || undefined);
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="bg-[#FCFBF9] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-stone-500 mb-6 font-medium">
          <Link to="/" className="hover:text-stone-900 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to={`/category/${product.category_id}`} className="hover:text-stone-900 transition-colors">
            {product.category_name || 'Category'}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-stone-900 truncate max-w-xs">{product.name}</span>
        </div>

        {/* Product Details Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 bg-white p-6 sm:p-8 lg:p-10 rounded-3xl border border-stone-200/90 shadow-xs">
          {/* Left Column: Image Gallery with Magnifier */}
          <div className="space-y-4">
            {/* Main Image Container */}
            <div
              className="relative aspect-4/3 w-full rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 cursor-crosshair group"
              onMouseEnter={() => setZoomActive(true)}
              onMouseLeave={() => setZoomActive(false)}
              onMouseMove={handleMouseMove}
            >
              <img
                src={currentImage}
                alt={product.name}
                className="w-full h-full object-cover object-center transition-all duration-200"
              />

              {/* Magnified Zoom Lens */}
              {zoomActive && (
                <div
                  className="hidden md:block absolute inset-0 pointer-events-none z-20 rounded-2xl overflow-hidden border border-amber-500 shadow-2xl"
                  style={{
                    backgroundImage: `url(${currentImage})`,
                    backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                    backgroundSize: '220%',
                    backgroundRepeat: 'no-repeat',
                  }}
                />
              )}

              {/* Badges */}
              <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
                {product.discount_percentage ? (
                  <span className="px-2.5 py-1 rounded-full bg-rose-600 text-white font-bold text-xs tracking-wide shadow-md uppercase">
                    {product.discount_percentage}% OFF
                  </span>
                ) : null}
              </div>
            </div>

            {/* Thumbnail Navigation Bar */}
            {product.images && product.images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-20 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      selectedImageIndex === idx
                        ? 'border-amber-700 shadow-sm scale-102 ring-2 ring-amber-600/20'
                        : 'border-stone-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Information & Buying Actions */}
          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Category, Rating & SKU */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-bold text-amber-800 uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200/60">
                  {product.category_name}
                </span>

                <div className="flex items-center gap-3 text-stone-500">
                  <div className="flex items-center gap-1 text-amber-600 font-bold">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    <span>{product.rating || 4.8}</span>
                    <span className="text-stone-400 font-normal">({product.review_count || 24} reviews)</span>
                  </div>
                  {product.sku && <span>SKU: {product.sku}</span>}
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 tracking-tight leading-snug">
                {product.name}
              </h1>

              {/* Price & Discount */}
              <div className="flex items-baseline gap-3 pt-1">
                <span className="text-3xl sm:text-4xl font-extrabold text-stone-900 font-serif">
                  ₹{currentPrice.toLocaleString('en-IN')}
                </span>
                {currentOriginalPrice && currentOriginalPrice > currentPrice && (
                  <span className="text-lg text-stone-400 line-through">
                    ₹{currentOriginalPrice.toLocaleString('en-IN')}
                  </span>
                )}
                <span className="text-xs text-stone-500 font-medium">Inclusive of all taxes</span>
              </div>

              {/* Short Description */}
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed font-light">
                {product.description}
              </p>

              {/* Color Selection */}
              {product.colors && product.colors.length > 0 && (
                <div className="pt-2">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-stone-800 uppercase tracking-wider">
                      Available Color: <span className="text-amber-800 font-semibold">{selectedColor}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    {product.colors.map((c, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedColor(c.name)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                          selectedColor === c.name
                            ? 'border-amber-700 bg-amber-50/70 text-amber-950 shadow-xs'
                            : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                        }`}
                      >
                        <span
                          style={{ backgroundColor: c.hex_code || '#78350F' }}
                          className="w-3.5 h-3.5 rounded-full border border-stone-300 shadow-inner"
                        />
                        <span>{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Variant / Size Selection */}
              {product.variants && product.variants.length > 1 && (
                <div className="pt-2">
                  <span className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                    Select Dimensions / Variant:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {product.variants.map((v) => (
                      <button
                        key={v.variant_id}
                        onClick={() => setSelectedVariantId(v.variant_id)}
                        className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                          selectedVariantId === v.variant_id
                            ? 'border-amber-700 bg-amber-50/80 text-amber-950 font-bold shadow-xs'
                            : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                        }`}
                      >
                        <div className="truncate">{v.dimensions || v.color || v.sku}</div>
                        {v.price_override && (
                          <div className="text-amber-800 font-semibold mt-0.5">
                            ₹{v.price_override.toLocaleString('en-IN')}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Stock Status Notification */}
              <div className="pt-2">
                {isOutOfStock ? (
                  <div className="flex items-center gap-2 text-rose-700 bg-rose-50 p-3 rounded-xl border border-rose-200 text-xs font-semibold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Currently out of stock. Contact us for custom order booking.</span>
                  </div>
                ) : isLowStock ? (
                  <div className="flex items-center gap-2 text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-xs font-medium">
                    <span className="w-2 h-2 rounded-full bg-amber-600 animate-ping" />
                    <span>Hurry! Only {currentStock} left in warehouse.</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 text-xs font-semibold">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>In Stock & Ready for White-Glove Dispatch</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quantity Selector & Add to Cart Buttons */}
            <div className="space-y-4 pt-4 border-t border-stone-200">
              <div className="flex items-center gap-4">
                {/* Quantity Controls */}
                <div className="flex items-center rounded-xl border border-stone-300 bg-stone-50 p-1">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="w-8 h-8 rounded-lg bg-white flex items-center justify-center font-bold text-stone-700 hover:bg-stone-100 disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-sm font-bold text-stone-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
                    disabled={quantity >= currentStock || isOutOfStock}
                    className="w-8 h-8 rounded-lg bg-white flex items-center justify-center font-bold text-stone-700 hover:bg-stone-100 disabled:opacity-40"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || isAdding}
                  className={`flex-1 py-3.5 px-6 rounded-2xl font-bold text-sm tracking-wide shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isOutOfStock
                      ? 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
                      : added
                      ? 'bg-emerald-700 text-white shadow-emerald-900/20'
                      : 'bg-amber-800 hover:bg-amber-900 active:scale-98 text-white shadow-amber-950/20'
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span>Added to Shopping Cart!</span>
                    </>
                  ) : isAdding ? (
                    <span className="animate-pulse">Adding...</span>
                  ) : (
                    <>
                      <ShoppingBag className="w-5 h-5" />
                      <span>Add to Cart (₹{(currentPrice * quantity).toLocaleString('en-IN')})</span>
                    </>
                  )}
                </button>
              </div>

              {/* Cash On Delivery Assurance */}
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 flex items-center gap-3 text-xs text-amber-900">
                <Truck className="w-5 h-5 text-amber-800 shrink-0" />
                <div>
                  <span className="font-bold">Cash on Delivery (COD) Available: </span>
                  <span>Pay upon safe arrival and installation at your home.</span>
                </div>
              </div>
            </div>

            {/* Service & Guarantee Badges */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-stone-100 text-center">
              <div className="p-2">
                <Truck className="w-4 h-4 text-amber-700 mx-auto mb-1" />
                <span className="text-[11px] font-semibold text-stone-900 block">White-Glove</span>
                <span className="text-[10px] text-stone-500">Free Assembly</span>
              </div>
              <div className="p-2">
                <ShieldCheck className="w-4 h-4 text-amber-700 mx-auto mb-1" />
                <span className="text-[11px] font-semibold text-stone-900 block">5 - 10 Yr</span>
                <span className="text-[10px] text-stone-500">Wood Warranty</span>
              </div>
              <div className="p-2">
                <RefreshCw className="w-4 h-4 text-amber-700 mx-auto mb-1" />
                <span className="text-[11px] font-semibold text-stone-900 block">7-Day</span>
                <span className="text-[10px] text-stone-500">Replacement</span>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications & Product Overview Tabbed Box */}
        <div className="mt-12 bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-8 lg:p-10 shadow-xs">
          <h2 className="text-xl font-bold font-serif text-stone-900 pb-4 border-b border-stone-200 mb-6">
            Product Specifications & Craft Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Specs Table */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-3">
                Key Attributes
              </h3>
              <dl className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden text-xs">
                {product.material && (
                  <div className="p-3 bg-stone-50/50 flex justify-between">
                    <dt className="font-semibold text-stone-600">Primary Material</dt>
                    <dd className="font-medium text-stone-900">{product.material}</dd>
                  </div>
                )}
                {product.finish && (
                  <div className="p-3 flex justify-between">
                    <dt className="font-semibold text-stone-600">Finish & Polish</dt>
                    <dd className="font-medium text-stone-900">{product.finish}</dd>
                  </div>
                )}
                {product.brand && (
                  <div className="p-3 bg-stone-50/50 flex justify-between">
                    <dt className="font-semibold text-stone-600">Brand / Maker</dt>
                    <dd className="font-medium text-stone-900">{product.brand}</dd>
                  </div>
                )}
                {product.dimensions && (
                  <div className="p-3 flex justify-between">
                    <dt className="font-semibold text-stone-600">Dimensions (L x W x H)</dt>
                    <dd className="font-medium text-stone-900">
                      {product.dimensions.length} x {product.dimensions.width} x {product.dimensions.height}{' '}
                      {product.dimensions.unit}
                    </dd>
                  </div>
                )}
                {product.warranty_info && (
                  <div className="p-3 bg-stone-50/50 flex justify-between">
                    <dt className="font-semibold text-stone-600">Warranty Coverage</dt>
                    <dd className="font-medium text-stone-900">{product.warranty_info}</dd>
                  </div>
                )}
                <div className="p-3 flex justify-between">
                  <dt className="font-semibold text-stone-600">Assembly</dt>
                  <dd className="font-medium text-stone-900">
                    {product.assembly_required ? 'Provided Free at Delivery' : 'Pre-assembled'}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Right Features & Custom Specifications */}
            <div className="space-y-6">
              {product.specifications && product.specifications.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-3">
                    Technical Specifications
                  </h3>
                  <div className="space-y-2 text-xs">
                    {product.specifications.map((s, i) => (
                      <div key={i} className="flex justify-between py-1.5 border-b border-stone-100">
                        <span className="text-stone-500 font-medium">{s.label}</span>
                        <span className="text-stone-900 font-semibold">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {product.features && product.features.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-3">
                    Highlights & Construction
                  </h3>
                  <ul className="space-y-2 text-xs text-stone-600">
                    {product.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-stone-200">
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900">
                You May Also Like
              </h2>
              <Link
                to={`/category/${product.category_id}`}
                className="text-xs font-semibold text-amber-800 hover:text-amber-900"
              >
                View Category Catalog →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
