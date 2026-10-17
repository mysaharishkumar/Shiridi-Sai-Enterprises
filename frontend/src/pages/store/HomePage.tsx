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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse bg-stone-100 rounded-2xl h-80 border border-stone-200" />
            ))}
          </div>
        ) : displayedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
                    <h4 className="font-semibold text-sm text-white">Cash on Delivery (COD)</h4>
                    <p className="text-xs text-stone-400 mt-0.5">Inspect your furniture at your doorstep before paying.</p>
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

      {/* 5. Customer Testimonials & Reviews */}
      <section className="py-16 bg-stone-50 border-t border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">
              Happy Homeowners
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 tracking-tight mt-1">
              Customer Experiences
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-2">
              Discover why families across Andhra Pradesh and Telangana trust Shiridi Sai Enterprises for their homes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-500 mb-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4 fill-amber-500" />
                  ))}
                </div>
                <p className="text-stone-700 text-xs sm:text-sm leading-relaxed italic">
                  "We ordered the 7-Seater Royal Grand Teak Sofa for our new villa in Hyderabad. The wood finish is
                  magnificent and the cushions provide excellent orthopedic support. The Cash on Delivery option gave us
                  complete peace of mind!"
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-stone-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-xs">
                  VR
                </div>
                <div>
                  <h4 className="font-bold text-xs text-stone-900">Venkatesh Rao</h4>
                  <p className="text-[11px] text-stone-500">KPHB Colony, Hyderabad</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-500 mb-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4 fill-amber-500" />
                  ))}
                </div>
                <p className="text-stone-700 text-xs sm:text-sm leading-relaxed italic">
                  "The Maharaja Sheesham dining table is solid, heavy and has gorgeous natural grain patterns. The delivery team
                  assembled it in less than 20 minutes and took away all the packaging waste. Highly recommended!"
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-stone-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-xs">
                  SL
                </div>
                <div>
                  <h4 className="font-bold text-xs text-stone-900">Srilatha Reddy</h4>
                  <p className="text-[11px] text-stone-500">Guntur, Andhra Pradesh</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-500 mb-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4 fill-amber-500" />
                  ))}
                </div>
                <p className="text-stone-700 text-xs sm:text-sm leading-relaxed italic">
                  "The King Size hydraulic storage bed lifted effortlessly even with our 8-inch mattress on top! The 1200 litre
                  underbed storage freed up so much cupboard space in our apartment."
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-stone-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-xs">
                  KN
                </div>
                <div>
                  <h4 className="font-bold text-xs text-stone-900">Kiran Kumar</h4>
                  <p className="text-[11px] text-stone-500">Madhapur, Hyderabad</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
