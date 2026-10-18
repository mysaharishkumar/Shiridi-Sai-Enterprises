import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, ArrowRight, ShieldCheck, Truck, RefreshCw,
  Award, CheckCircle, Star, PhoneCall
} from 'lucide-react';
import { BannerCarousel } from '../../components/store/BannerCarousel';
import { CategoryGrid } from '../../components/store/CategoryGrid';
import { ProductCard } from '../../components/store/ProductCard';
import { Product } from '../../types';
import { storeApi } from '../../api/client';
import { useStore } from '../../context/StoreContext';

export const HomePage: React.FC = () => {
  const { banners, categories, settings } = useStore();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [specialOffers, setSpecialOffers] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'featured' | 'bestsellers' | 'new' | 'offers'>('featured');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShowcaseProducts = async () => {
      setLoading(true);
      try {
        const [featRes, bestRes, newRes, offerRes] = await Promise.all([
          storeApi.getProducts({ is_featured: true, limit: 8 }),
          storeApi.getProducts({ is_best_seller: true, limit: 8 }),
          storeApi.getProducts({ is_new_arrival: true, limit: 8 }),
          storeApi.getProducts({ is_special_offer: true, limit: 8 })
        ]);

        setFeaturedProducts(featRes.items);
        setBestSellers(bestRes.items);
        setNewArrivals(newRes.items);
        setSpecialOffers(offerRes.items);
      } catch (err) {
        console.error('Failed to load showcase products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchShowcaseProducts();
  }, []);

  const getDisplayedProducts = () => {
    switch (activeTab) {
      case 'bestsellers':
        return bestSellers;
      case 'new':
        return newArrivals;
      case 'offers':
        return specialOffers;
      case 'featured':
      default:
        return featuredProducts;
    }
  };

  const displayedProducts = getDisplayedProducts();

  return (
    <div className="space-y-0">
      {/* 1. Promotional Hero Banner Carousel */}
      <BannerCarousel banners={banners} />

      {/* 2. Shop By Category Grid */}
      <CategoryGrid categories={categories} />

      {/* 3. Featured Products Showcase with Interactive Tabs */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">
              Signature Creations
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 tracking-tight mt-1">
              Featured Furniture Range
            </h2>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-stone-100/90 rounded-2xl border border-stone-200 self-start md:self-auto overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab('featured')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'featured'
                  ? 'bg-amber-800 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Featured
            </button>
            <button
              onClick={() => setActiveTab('bestsellers')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'bestsellers'
                  ? 'bg-amber-800 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Best Sellers
            </button>
            <button
              onClick={() => setActiveTab('new')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'new'
                  ? 'bg-amber-800 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              New Arrivals
            </button>
            <button
              onClick={() => setActiveTab('offers')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'offers'
                  ? 'bg-amber-800 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Special Offers %
            </button>
          </div>
        </div>

        {/* Product Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse bg-stone-100 rounded-2xl h-64 sm:h-80 border border-stone-200" />
            ))}
          </div>
        ) : displayedProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {displayedProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-stone-200">
            <p className="text-stone-500 text-sm">No items in this collection currently.</p>
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs tracking-wider uppercase transition-all shadow-md active:scale-95"
          >
            <span>Explore All Furniture</span>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </Link>
        </div>
      </section>

      {/* 4. Brand Story & Craftsmanship Spotlight */}
      <section className="py-20 bg-gradient-to-br from-amber-950 via-stone-950 to-stone-900 text-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                The Shiridi Sai Hallmark
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif leading-tight text-amber-50">
                Heirloom Woodcraft Designed for Modern Comfort
              </h2>
              <p className="text-stone-300 text-sm sm:text-base leading-relaxed font-light">
                For discerning homeowners, furniture is not merely utility—it is a generational centerpiece. At{' '}
                <strong className="text-white font-medium">Shiridi Sai Enterprises</strong>, our master craftsmen
                select only seasoned Grade-A Teakwood and sustainably sourced Sheesham, treated with traditional kiln-drying
                techniques to withstand all weather conditions.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-white">Mortise & Tenon Joinery</h4>
                    <p className="text-xs text-stone-400 mt-0.5">Heavy-duty structural joints that never loosen or creak.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-white">Termite Resistant</h4>
                    <p className="text-xs text-stone-400 mt-0.5">Dual-layer deep pressure anti-borer and termite treatment.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-white">Custom Color Variants</h4>
                    <p className="text-xs text-stone-400 mt-0.5">Match wood polish and upholstery to your interior décor.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-white">Transparent Pricing</h4>
                    <p className="text-xs text-stone-400 mt-0.5">Direct workshop pricing with clear M.R.P. and discount savings.</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <Link
                  to="/products"
                  className="px-6 py-3 rounded-full bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs tracking-wider uppercase transition-colors"
                >
                  Explore Collections
                </Link>
                <a
                  href={`tel:${settings?.phone}`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-stone-600 hover:border-amber-400 text-stone-200 hover:text-white text-xs font-semibold transition-colors"
                >
                  <PhoneCall className="w-4 h-4 text-amber-400" />
                  <span>Call Furniture Expert</span>
                </a>
              </div>
            </div>

            {/* Visual Collage */}
            <div className="relative">
              <div className="relative aspect-4/3 rounded-3xl overflow-hidden shadow-2xl border border-stone-800">
                <img
                  src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1000&q=80"
                  alt="Shiridi Sai Handcrafted Living Room"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Floating Stat Badge */}
              <div className="absolute -bottom-6 -left-6 bg-white text-stone-900 p-5 rounded-2xl shadow-2xl border border-stone-200 hidden sm:flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xl font-serif">
                  10+
                </div>
                <div>
                  <h4 className="font-bold text-sm">Years Warranty</h4>
                  <p className="text-xs text-stone-500">Certified Solid Teak Timber</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
