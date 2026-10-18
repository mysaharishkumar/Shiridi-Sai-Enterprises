import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star, ShieldCheck, Check, ChevronRight, ArrowLeft,
  Phone, MessageCircle, MapPin, Sparkles, Clock, Info, CheckCircle2,
  Maximize2, X
} from 'lucide-react';
import { Product } from '../../types';
import { storeApi } from '../../api/client';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from '../../components/store/ProductCard';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { settings } = useStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Gallery state
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [zoomActive, setZoomActive] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Selection state
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');

  useEffect(() => {
    if (!slug) return;
    const loadProduct = async () => {
      setLoading(true);
      try {
        const prod = await storeApi.getProduct(slug);
        setProduct(prod);

        // Set initial selected color
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
          The requested furniture piece might be unpublished or no longer in our catalog.
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

  // Determine current active price based on selected variant
  let currentPrice = product.selling_price;
  let currentOriginalPrice = product.original_price || product.selling_price;

  if (selectedVariantId) {
    const v = product.variants?.find((item) => item.variant_id === selectedVariantId);
    if (v && v.price_override) {
      currentPrice = v.price_override;
    }
  }

  const discountSavings =
    currentOriginalPrice > currentPrice ? currentOriginalPrice - currentPrice : 0;
  const discountPct =
    currentOriginalPrice > currentPrice
      ? Math.round(((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100)
      : product.discount_percentage || 0;

  // Find color object matching selected color
  const activeColorObj = product.colors?.find((c) => c.name === selectedColor);

  interface GalleryItem {
    url: string;
    label?: string;
    colorName?: string;
  }

  // Dynamic gallery items: prioritize all photos for the selected finish, followed by general photos & other finishes
  const galleryItems: GalleryItem[] = [];
  const seenUrls = new Set<string>();

  // 1. Photos for the currently active selected color
  if (activeColorObj) {
    const colorPhotos = (activeColorObj.images && activeColorObj.images.length > 0)
      ? activeColorObj.images
      : (activeColorObj.image_url ? [activeColorObj.image_url] : []);

    colorPhotos.forEach((url, i) => {
      if (!seenUrls.has(url)) {
        galleryItems.push({
          url,
          colorName: activeColorObj.name,
          label: colorPhotos.length > 1 ? `${activeColorObj.name} (Photo ${i + 1}/${colorPhotos.length})` : `${activeColorObj.name} Finish`
        });
        seenUrls.add(url);
      }
    });
  }

  // 2. Standard product catalog photos
  if (product.images && product.images.length > 0) {
    product.images.forEach((img, i) => {
      if (!seenUrls.has(img.url)) {
        galleryItems.push({
          url: img.url,
          label: img.alt || `Product View ${i + 1}`
        });
        seenUrls.add(img.url);
      }
    });
  }

  // 3. Other color finishes' photos
  if (product.colors) {
    product.colors.forEach((c) => {
      if (c.name !== selectedColor) {
        const cPhotos = (c.images && c.images.length > 0)
          ? c.images
          : (c.image_url ? [c.image_url] : []);
        cPhotos.forEach((url, i) => {
          if (!seenUrls.has(url)) {
            galleryItems.push({
              url,
              colorName: c.name,
              label: cPhotos.length > 1 ? `${c.name} (${i + 1})` : `${c.name} Finish`
            });
            seenUrls.add(url);
          }
        });
      }
    });
  }

  // Fallback if no images found
  if (galleryItems.length === 0) {
    galleryItems.push({
      url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=80',
      label: product.name
    });
  }

  const currentGalleryItem = galleryItems[selectedImageIndex] || galleryItems[0];
  const currentImage = currentGalleryItem?.url || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=80';

  // Handler for color selection: updates selected color and switches main view to first photo of that color
  const handleSelectColor = (colorName: string) => {
    setSelectedColor(colorName);
    setSelectedImageIndex(0);
  };

  // Image mouse move handler for zoom
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPosition({ x, y });
  };

  const whatsappPhone = settings?.whatsapp_number
    ? settings.whatsapp_number.replace(/[^0-9]/g, '')
    : '919876543210';

  const whatsappInquiryText = encodeURIComponent(
    `Hello Shiridi Sai Enterprises, I am inquiring about "${product.name}".\n\n- Offer Price: ₹${currentPrice.toLocaleString('en-IN')}\n- Selected Finish: ${selectedColor || 'Standard'}\n- Product Link: ${window.location.href}\n\nPlease share availability, customization options, and showroom viewing details.`
  );

  return (
    <div className="bg-[#FCFBF9] min-h-screen py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Product Details Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 bg-white p-6 sm:p-8 lg:p-10 rounded-3xl border border-stone-200/90 shadow-xs">
          {/* Left Column: Image Gallery with Magnifier */}
          <div className="space-y-4">
            {/* Main Image Container (Complete full-size image without cropping) */}
            <div
              className="relative min-h-[300px] sm:min-h-[420px] max-h-[550px] aspect-4/3 w-full rounded-2xl overflow-hidden bg-stone-50 border border-stone-200 flex items-center justify-center p-3 cursor-crosshair group shadow-inner"
              onMouseEnter={() => setZoomActive(true)}
              onMouseLeave={() => setZoomActive(false)}
              onMouseMove={handleMouseMove}
            >
              <img
                src={currentImage}
                alt={currentGalleryItem?.label || product.name}
                className="max-h-full max-w-full w-auto h-auto object-contain mx-auto transition-all duration-300"
              />

              {/* Magnified Zoom Lens */}
              {zoomActive && (
                <div
                  className="hidden md:block absolute inset-0 pointer-events-none z-20 rounded-2xl overflow-hidden border-2 border-amber-500/80 shadow-2xl bg-white"
                  style={{
                    backgroundImage: `url(${currentImage})`,
                    backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                    backgroundSize: '220%',
                    backgroundRepeat: 'no-repeat',
                  }}
                />
              )}

              {/* View Complete Full-Size Photo Modal Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxOpen(true);
                }}
                className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 hover:bg-white text-stone-800 text-xs font-semibold shadow-md border border-stone-200 backdrop-blur-xs transition-transform active:scale-95 cursor-pointer"
                title="View Complete Full-Size Image"
              >
                <Maximize2 className="w-3.5 h-3.5 text-amber-800" />
                <span className="hidden sm:inline">View Full Size</span>
              </button>

              {/* Badges */}
              <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
                {discountPct > 0 && (
                  <span className="px-3 py-1 rounded-full bg-rose-600 text-white font-bold text-xs tracking-wide shadow-md uppercase">
                    {discountPct}% OFF
                  </span>
                )}
                {currentGalleryItem?.colorName && (
                  <span className="px-3 py-1 rounded-full bg-stone-900/85 backdrop-blur-xs text-white font-semibold text-[11px] shadow-sm flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-white/60 inline-block"
                      style={{
                        backgroundColor:
                          product.colors?.find((c) => c.name === currentGalleryItem.colorName)?.hex_code || '#78350F'
                      }}
                    />
                    {currentGalleryItem.label || currentGalleryItem.colorName}
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Navigation Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                <span>Photo Gallery ({galleryItems.length} {galleryItems.length === 1 ? 'view' : 'views'}):</span>
                {activeColorObj && ((activeColorObj.images && activeColorObj.images.length > 0) || activeColorObj.image_url) && (
                  <span className="text-amber-800 font-bold lowercase first-letter:uppercase">
                    {(activeColorObj.images?.length || 1)} photos in {activeColorObj.name}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
                {galleryItems.map((item, idx) => (
                  <button
                    key={`gal-${idx}`}
                    type="button"
                    onClick={() => {
                      setSelectedImageIndex(idx);
                      if (item.colorName && item.colorName !== selectedColor) {
                        setSelectedColor(item.colorName);
                      }
                    }}
                    title={item.label || `Photo ${idx + 1}`}
                    className={`relative w-20 h-16 rounded-xl overflow-hidden border-2 bg-stone-50 transition-all shrink-0 cursor-pointer flex items-center justify-center p-1 ${
                      selectedImageIndex === idx
                        ? 'border-amber-700 shadow-sm scale-102 ring-2 ring-amber-600/20'
                        : 'border-stone-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={item.url} alt="" className="max-h-full max-w-full w-auto h-auto object-contain" />
                    {item.colorName && (
                      <span className="absolute bottom-0 inset-x-0 bg-stone-900/80 text-white text-[9px] text-center font-medium py-0.5 truncate px-1">
                        {item.colorName}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Product Information, Price Breakdown & Inquiry Actions */}
          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Category, Rating & SKU */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-bold text-amber-800 uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200/60">
                  {product.category_name || 'Furniture Collection'}
                </span>

                <div className="flex items-center gap-3 text-stone-500">
                  <div className="flex items-center gap-1 text-amber-600 font-bold">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    <span>{product.rating || 4.8}</span>
                    <span className="text-stone-400 font-normal">({product.review_count || 24} ratings)</span>
                  </div>
                  {product.sku && <span>SKU: {product.sku}</span>}
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 tracking-tight leading-snug">
                {product.name}
              </h1>

              {/* Transparent Price Discovery Box */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                <div className="flex items-baseline gap-3">
                  <div className="text-xs uppercase tracking-wider font-bold text-stone-500">
                    Showroom Offer Price:
                  </div>
                </div>

                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl font-extrabold text-stone-900 font-sans tracking-tight">
                    ₹{currentPrice.toLocaleString('en-IN')}
                  </span>

                  {currentOriginalPrice > currentPrice && (
                    <div className="flex items-center gap-2">
                      <span className="text-lg text-stone-400 line-through">
                        M.R.P. ₹{currentOriginalPrice.toLocaleString('en-IN')}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold">
                        Save ₹{discountSavings.toLocaleString('en-IN')} ({discountPct}% OFF)
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-stone-500">
                  Direct manufacturer price. Taxes included. Visit our showroom to inspect the finish.
                </p>
              </div>

              {/* Information About Product */}
              <div>
                <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-amber-800" />
                  About This Furniture Piece
                </h3>
                <p className="text-stone-600 text-xs sm:text-sm leading-relaxed font-normal whitespace-pre-line">
                  {product.description}
                </p>
              </div>

              {/* Color Finish Selection with Color-Specific Images */}
              {product.colors && product.colors.length > 0 && (
                <div className="pt-2">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-stone-800 uppercase tracking-wider">
                      Select Finish / Color:{' '}
                      <span className="text-amber-800 font-bold">{selectedColor}</span>
                    </span>
                    {activeColorObj && ((activeColorObj.images && activeColorObj.images.length > 0) || activeColorObj.image_url) && (
                      <span className="text-[11px] text-emerald-700 font-medium">
                        ✓ {(activeColorObj.images?.length || 1)} photos available
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {product.colors.map((c, i) => {
                      const isSelected = selectedColor === c.name;
                      const colorThumb = (c.images && c.images.length > 0) ? c.images[0] : c.image_url;
                      const photoCount = (c.images && c.images.length > 0) ? c.images.length : (c.image_url ? 1 : 0);
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSelectColor(c.name)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                            isSelected
                              ? 'border-amber-700 bg-amber-50/80 text-amber-950 shadow-xs ring-2 ring-amber-600/30'
                              : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                          }`}
                        >
                          {colorThumb ? (
                            <img
                              src={colorThumb}
                              alt={c.name}
                              className="w-5 h-5 rounded-full object-cover border border-stone-300 shrink-0"
                            />
                          ) : (
                            <span
                              style={{ backgroundColor: c.hex_code || '#78350F' }}
                              className="w-4 h-4 rounded-full border border-stone-300 shadow-inner shrink-0"
                            />
                          )}
                          <span>{c.name}</span>
                          {photoCount > 1 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-stone-200/80 text-stone-700 font-normal">
                              {photoCount} photos
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Variant / Size Options */}
              {product.variants && product.variants.length > 1 && (
                <div className="pt-2">
                  <span className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                    Dimensions / Size Variant:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {product.variants.map((v) => (
                      <button
                        key={v.variant_id}
                        type="button"
                        onClick={() => setSelectedVariantId(v.variant_id)}
                        className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                          selectedVariantId === v.variant_id
                            ? 'border-amber-700 bg-amber-50/80 text-amber-950 font-bold shadow-xs'
                            : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                        }`}
                      >
                        <div className="truncate">{v.dimensions || v.color || v.sku}</div>
                        {v.price_override && (
                          <div className="text-amber-800 font-bold mt-0.5">
                            ₹{v.price_override.toLocaleString('en-IN')}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Direct Inquiry & Showroom Contact Buttons (Replaces Delivery / Cart) */}
            <div className="space-y-3 pt-4 border-t border-stone-200">
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                Interested in this piece? Inquire directly with our showroom:
              </span>

              <div className="pt-1">
                {settings?.phone && (
                  <a
                    href={`tel:${settings.phone}`}
                    className="w-full py-4 px-6 rounded-2xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-sm tracking-wide shadow-md shadow-amber-950/20 transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-98"
                  >
                    <Phone className="w-5 h-5 shrink-0" />
                    <span>Call Showroom: {settings.phone}</span>
                  </a>
                )}
              </div>

              {/* Showroom Visit Card */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex items-start gap-3 text-xs text-stone-700">
                <MapPin className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-stone-900">
                    Visit Shiridi Sai Enterprises Showroom:
                  </p>
                  <p className="text-stone-600 leading-relaxed">
                    {settings?.address || 'Showroom Address: Hyderabad, Telangana.'}
                  </p>
                  <p className="text-[11px] text-amber-800 font-semibold flex items-center gap-1.5 pt-0.5">
                    <Clock className="w-3.5 h-3.5" /> Open Mon-Sat 10 AM - 9 PM • Sunday 10:30 AM - 8 PM
                  </p>
                </div>
              </div>
            </div>

            {/* Quality & Craft Badges */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-stone-100 text-center">
              <div className="p-2">
                <Sparkles className="w-4 h-4 text-amber-700 mx-auto mb-1" />
                <span className="text-[11px] font-semibold text-stone-900 block">Solid Wood</span>
                <span className="text-[10px] text-stone-500">Heirloom Timber</span>
              </div>
              <div className="p-2">
                <ShieldCheck className="w-4 h-4 text-amber-700 mx-auto mb-1" />
                <span className="text-[11px] font-semibold text-stone-900 block">5 - 10 Yr</span>
                <span className="text-[10px] text-stone-500">Borer Warranty</span>
              </div>
              <div className="p-2">
                <CheckCircle2 className="w-4 h-4 text-amber-700 mx-auto mb-1" />
                <span className="text-[11px] font-semibold text-stone-900 block">Custom Sizes</span>
                <span className="text-[10px] text-stone-500">Made To Measure</span>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications & Detailed Product Information Box */}
        <div className="mt-12 bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-8 lg:p-10 shadow-xs">
          <h2 className="text-xl font-bold font-serif text-stone-900 pb-4 border-b border-stone-200 mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-700" />
            Detailed Product Information & Specifications
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Specs Table */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-3">
                Material & Timber Attributes
              </h3>
              <dl className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden text-xs">
                {product.material && (
                  <div className="p-3.5 bg-stone-50/50 flex justify-between">
                    <dt className="font-semibold text-stone-600">Primary Material / Timber</dt>
                    <dd className="font-bold text-stone-900">{product.material}</dd>
                  </div>
                )}
                {product.finish && (
                  <div className="p-3.5 flex justify-between">
                    <dt className="font-semibold text-stone-600">Finish & Polish</dt>
                    <dd className="font-medium text-stone-900">{product.finish}</dd>
                  </div>
                )}
                {product.brand && (
                  <div className="p-3.5 bg-stone-50/50 flex justify-between">
                    <dt className="font-semibold text-stone-600">Brand / Manufacturer</dt>
                    <dd className="font-medium text-stone-900">{product.brand}</dd>
                  </div>
                )}
                {product.dimensions && (
                  <div className="p-3.5 flex justify-between">
                    <dt className="font-semibold text-stone-600">Dimensions</dt>
                    <dd className="font-medium text-stone-900">
                      {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height}{' '}
                      {product.dimensions.unit}
                    </dd>
                  </div>
                )}
                {product.warranty_info && (
                  <div className="p-3.5 bg-stone-50/50 flex justify-between">
                    <dt className="font-semibold text-stone-600">Warranty Coverage</dt>
                    <dd className="font-medium text-emerald-800">{product.warranty_info}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Right: Key Features & Information */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-3">
                Craftsmanship & Highlights
              </h3>

              {product.features && product.features.length > 0 ? (
                <ul className="space-y-2 text-xs text-stone-700">
                  {product.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                      <span className="leading-relaxed">{feat}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-stone-500 leading-relaxed">
                  Crafted using 100% seasoned solid timber with traditional tenon and mortise joints for maximum generational durability.
                </p>
              )}

              {/* Extra Customization Notice */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-xs text-amber-950 space-y-1 mt-4">
                <span className="font-bold block">Need a Custom Size or Different Polish?</span>
                <p className="text-stone-700 leading-relaxed">
                  Shiridi Sai Enterprises provides custom furniture making. Bring your room measurements or inspiration designs to our showroom or contact us on WhatsApp.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Carousel */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="flex items-end justify-between mb-8 pb-4 border-b border-stone-200">
              <div>
                <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">
                  Explore More
                </span>
                <h2 className="text-2xl font-bold font-serif text-stone-900 tracking-tight mt-1">
                  Similar Furniture Designs
                </h2>
              </div>
              <Link to="/products" className="text-xs font-bold text-amber-800 hover:underline">
                View All →
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

        {/* Lightbox for Complete Full Size Uploaded Image */}
        {lightboxOpen && (
          <div
            className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 animate-in fade-in"
            onClick={() => setLightboxOpen(false)}
          >
            <div
              className="relative max-w-5xl max-h-[92vh] w-full bg-white rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full flex items-center justify-between pb-3 border-b border-stone-200">
                <span className="text-xs sm:text-sm font-bold text-stone-900 truncate pr-2">
                  {currentGalleryItem?.label || product.name} — Complete Uploaded Photo
                </span>
                <button
                  type="button"
                  onClick={() => setLightboxOpen(false)}
                  className="p-1.5 rounded-full hover:bg-stone-100 text-stone-600 cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-2 sm:p-4 flex-1 overflow-auto flex items-center justify-center w-full max-h-[78vh]">
                <img
                  src={currentImage}
                  alt={product.name}
                  className="max-h-[75vh] w-auto max-w-full object-contain rounded-xl shadow-xs"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
