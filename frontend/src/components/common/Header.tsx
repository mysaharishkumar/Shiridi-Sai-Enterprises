import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search, Phone, MessageCircle, Menu, X, Sparkles, MapPin, ShieldCheck, ArrowLeft
} from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { storeApi } from '../../api/client';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isAdmin } = useAuth();
  const { settings } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setShowSuggestions(false);
  }, [location.pathname]);

  // Click outside listener
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
    <header className="sticky top-0 z-40 bg-white/98 backdrop-blur-md border-b border-stone-200/80 shadow-xs">

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 h-16 sm:h-20">
          {/* Left Side: Mobile Menu Button + Shop Name Logo */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 -ml-1 rounded-lg text-stone-700 hover:text-stone-900 hover:bg-stone-100 cursor-pointer shrink-0"
              aria-label="Open navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Business Logo / Shop Name (Left-aligned) */}
            <Logo />
          </div>

          {/* Prominent Search Bar (Desktop) */}
          <div ref={searchRef} className="hidden lg:flex flex-1 max-w-xl mx-4 items-center gap-2 relative">
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
                className="shrink-0 inline-flex items-center gap-1 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 rounded-full text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-xs"
                title="Go back"
                aria-label="Back"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-stone-700" />
                <span>Back</span>
              </button>
            )}

            <form onSubmit={handleSearchSubmit} className="w-full relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim().length >= 2 && setShowSuggestions(true)}
                placeholder="Search sofas, teak dining tables, beds, bhirva wardrobes, prices..."
                className="w-full pl-11 pr-24 py-2.5 bg-stone-100/90 hover:bg-stone-100 focus:bg-white text-stone-900 placeholder-stone-500 rounded-full border border-stone-200 focus:border-stone-500 focus:ring-2 focus:ring-stone-400/20 text-sm transition-all outline-hidden shadow-inner"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
              
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-stone-800 hover:bg-stone-900 text-white rounded-full text-xs font-semibold tracking-wide transition-colors cursor-pointer"
              >
                Search
              </button>
            </form>

            {/* Suggestions Dropdown */}
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

        {/* Mobile Search Input Row with Back Button on Left */}
        <div className="lg:hidden pb-3">
          <div className="flex items-center gap-2">
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

            <form onSubmit={handleSearchSubmit} className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search furniture & check prices..."
                className="w-full pl-9 pr-16 py-2 bg-stone-100 text-stone-900 rounded-full text-xs border border-stone-200 focus:outline-hidden focus:border-stone-500 focus:bg-white"
              />
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-stone-800 hover:bg-stone-900 text-white text-[10px] font-semibold rounded-full cursor-pointer"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-full bg-white border-b border-stone-200 shadow-2xl max-h-[85vh] overflow-y-auto z-50 animate-in slide-in-from-top-2">
          <div className="p-4 space-y-4">
            <div className="space-y-1 text-sm font-medium">
              <Link
                to="/"
                className="block px-3 py-2.5 rounded-lg text-stone-800 hover:bg-stone-100 hover:text-stone-900"
              >
                Home
              </Link>
              <Link
                to="/contact"
                className="block px-3 py-2.5 rounded-lg text-stone-800 hover:bg-stone-100 hover:text-stone-900"
              >
                Showroom Location & Contact
              </Link>
            </div>

            <div className="pt-4 border-t border-stone-100 space-y-2 text-xs">
              {settings?.phone && (
                <a
                  href={`tel:${settings.phone}`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Showroom: {settings.phone}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
