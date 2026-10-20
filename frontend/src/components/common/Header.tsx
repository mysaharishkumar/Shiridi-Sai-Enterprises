import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search, Phone, MessageCircle, Menu, X, ArrowLeft, Home, Sparkles, MapPin, ChevronRight, Layers
} from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { storeApi } from '../../api/client';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isAdmin } = useAuth();
  const { settings, categories } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Amazon/Flipkart style collapsing top brand row
  const [showBrandRow, setShowBrandRow] = useState(true);

  const searchRef = useRef<HTMLDivElement>(null);

  // Scroll direction listener to hide navigation/name on scroll down and unhide on scroll up
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          // Always show full header near the top of the page
          if (currentScrollY <= 25) {
            setShowBrandRow(true);
          } else if (currentScrollY > lastScrollY + 6) {
            // User scrolling down (touch swiping up) -> hide navigation menu & name
            setShowBrandRow(false);
          } else if (currentScrollY < lastScrollY - 6) {
            // User scrolling up (touch swiping down, even small amount) -> unhide navigation menu & name
            setShowBrandRow(true);
          }

          lastScrollY = Math.max(0, currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus and restore header on route change
  useEffect(() => {
    setShowBrandRow(true);
    setMobileMenuOpen(false);
    setShowSuggestions(false);
  }, [location.pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Click outside listener for search suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search suggestions
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const matches = await storeApi.getSearchSuggestions(searchQuery.trim());
        setSuggestions(matches);
        setShowSuggestions(true);
      } catch (err) {
        console.error('Search error:', err);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const whatsappUrl = settings?.whatsapp_number
    ? `https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hi Shiridi Sai Enterprises, I am browsing your furniture website and would like to know more about product prices and availability.')}`
    : `https://wa.me/919876543210`;

  return (
    <>
      {/* 
        Sticky Top Header:
        - Row 1 (Navigation Menu & Shop Name): Hides when scrolling down, unhides when scrolling up (like Amazon/Flipkart)
        - Row 2 (Back Button & Search Bar): NEVER moves off-screen, stays permanently pinned at the top
      */}
      <header className="sticky top-0 z-40 bg-white border-b border-stone-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          
          {/* Row 1: Mobile Hamburger Navigation Menu + Shop Name Logo */}
          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              showBrandRow
                ? 'max-h-20 opacity-100 translate-y-0 py-2 sm:py-3'
                : 'max-h-0 opacity-0 -translate-y-2 py-0 pointer-events-none lg:max-h-20 lg:opacity-100 lg:translate-y-0 lg:py-3 lg:pointer-events-auto'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              {/* Left Side: Mobile Menu Button + Shop Name Logo */}
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(true)}
                  className="p-2 -ml-1 rounded-xl text-stone-700 hover:text-stone-900 hover:bg-stone-100 active:scale-95 transition-all cursor-pointer shrink-0"
                  aria-label="Open navigation menu"
                  title="Open navigation menu"
                >
                  <Menu className="w-6 h-6" />
                </button>

                {/* Business Logo / Shop Name */}
                <Logo />
              </div>

              {/* Desktop Direct Contact Links */}
              <div className="hidden lg:flex items-center gap-4 text-xs font-semibold">
                {settings?.phone && (
                  <a
                    href={`tel:${settings.phone}`}
                    className="flex items-center gap-2 text-stone-700 hover:text-stone-900 transition-colors"
                  >
                    <Phone className="w-4 h-4 text-stone-600" />
                    <span>{settings.phone}</span>
                  </a>
                )}
                {settings?.whatsapp_number && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Row 2: Back Button and Search Bar (PERMANENTLY PINNED / NEVER MOVES OFF SCREEN) */}
          <div className="pb-2.5 pt-1">
            <div className="flex items-center gap-2">
              {/* Back Button (shown on all pages except home) */}
              {location.pathname !== '/' && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.history.length > 1) {
                      window.history.back();
                    } else {
                      navigate('/');
                    }
                  }}
                  className="shrink-0 inline-flex items-center gap-1 px-3 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-full text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
                  title="Go back"
                  aria-label="Back"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              )}

              {/* Search Input Bar */}
              <div ref={searchRef} className="relative flex-1">
                <form onSubmit={handleSearchSubmit} className="relative w-full">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery.trim().length >= 2 && setShowSuggestions(true)}
                    placeholder="Search furniture & check prices..."
                    className="w-full pl-9 pr-16 py-2 sm:py-2.5 bg-stone-100 hover:bg-stone-50 focus:bg-white text-stone-900 placeholder-stone-500 rounded-full text-xs sm:text-sm border border-stone-200 focus:outline-hidden focus:border-stone-500 shadow-inner transition-colors"
                  />
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <button
                    type="submit"
                    className="absolute right-1 top-1/2 -translate-y-1/2 px-3 py-1 bg-stone-800 hover:bg-stone-900 text-white text-[11px] font-semibold rounded-full shadow-xs cursor-pointer active:scale-95 transition-all"
                  >
                    Search
                  </button>
                </form>

                {/* Suggestions Dropdown (Desktop & Mobile Unified) */}
                {showSuggestions && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                    {suggestions.length > 0 ? (
                      <div className="max-h-80 overflow-y-auto divide-y divide-stone-100">
                        {suggestions.map((item) => (
                          <Link
                            key={item.id}
                            to={`/product/${item.slug}`}
                            onClick={() => setShowSuggestions(false)}
                            className="flex items-center gap-3 p-3 hover:bg-stone-100/80 transition-colors group"
                          >
                            <img
                              src={item.image || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=100&q=80'}
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded-lg border border-stone-200 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-stone-900 group-hover:text-stone-700 truncate">
                                {item.name}
                              </p>
                              <p className="text-xs text-stone-500">{item.category}</p>
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-sm text-stone-900 whitespace-nowrap block">
                                ₹{item.price.toLocaleString('en-IN')}
                              </span>
                              <span className="text-[10px] text-emerald-700 font-semibold">Special Price</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center text-stone-500 text-sm">
                        No matching furniture found for "{searchQuery}"
                      </div>
                    )}
                    <div className="p-2.5 bg-stone-50 text-center border-t border-stone-100">
                      <button
                        type="button"
                        onClick={handleSearchSubmit}
                        className="text-xs font-medium text-stone-700 hover:text-stone-900 hover:underline cursor-pointer"
                      >
                        View all matching results for "{searchQuery}" →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Slide-over Mobile Navigation Drawer (Amazon / Flipkart Style) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Sidebar Panel */}
          <aside
            className="relative w-72 sm:w-80 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto z-10 animate-in slide-in-from-left duration-300"
            role="dialog"
            aria-label="Customer Navigation Menu"
          >
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
              <Logo />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-200/70 transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Navigation Links */}
            <div className="p-4 sm:p-5 space-y-6 flex-1 overflow-y-auto">
              {/* Quick Store Links */}
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-2 px-3">
                  Store Navigation
                </h4>
                <div className="space-y-1 text-sm font-medium">
                  <Link
                    to="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-stone-800 hover:bg-stone-100 hover:text-stone-900 transition-colors"
                  >
                    <Home className="w-4 h-4 text-stone-500" />
                    <span>Home Showcase</span>
                  </Link>
                  <Link
                    to="/products"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-stone-800 hover:bg-stone-100 hover:text-stone-900 transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-stone-500" />
                    <span>All Furniture & Prices</span>
                  </Link>
                  <Link
                    to="/contact"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-stone-800 hover:bg-stone-100 hover:text-stone-900 transition-colors"
                  >
                    <MapPin className="w-4 h-4 text-stone-500" />
                    <span>Showroom Location & Contact</span>
                  </Link>
                </div>
              </div>

              {/* Furniture Categories */}
              {categories && categories.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-2 px-3">
                    Explore Categories
                  </h4>
                  <div className="space-y-1 text-xs font-semibold">
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/category/${cat.slug}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between px-3 py-2.5 rounded-xl text-stone-700 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <Layers className="w-3.5 h-3.5 text-stone-400" />
                          <span>{cat.name}</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer Actions (Call, WhatsApp, Admin Login) */}
            <div className="p-4 sm:p-5 border-t border-stone-200 bg-stone-50 space-y-2.5">
              {settings?.phone && (
                <a
                  href={`tel:${settings.phone}`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs shadow-xs transition-all active:scale-95"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Showroom: {settings.phone}</span>
                </a>
              )}

              {settings?.whatsapp_number && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Chat on WhatsApp</span>
                </a>
              )}

              <Link
                to="/admin/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-1.5 pt-2 text-[11px] font-medium text-stone-400 hover:text-stone-700 transition-colors"
              >
                <span>Store Management Login →</span>
              </Link>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};
