import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search, ShoppingBag, User as UserIcon, Phone,
  Menu, X, ChevronDown, Sparkles, MapPin, Package, LogOut
} from 'lucide-react';
import { Logo } from './Logo';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { storeApi } from '../../api/client';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalItems } = useCart();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { settings, categories } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setShowSuggestions(false);
    setCategoryDropdownOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
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
      setIsSearching(true);
      try {
        const matches = await storeApi.getSearchSuggestions(searchQuery.trim());
        setSuggestions(matches);
        setShowSuggestions(true);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs">
      {/* Top Announcement Bar */}
      {settings?.announcement_enabled && (
        <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 text-amber-100 text-xs py-2 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse shrink-0" />
          <span className="truncate max-w-4xl">{settings.announcement_text}</span>
          <span className="hidden md:inline-block text-amber-300/60">•</span>
          <a
            href={`tel:${settings.phone}`}
            className="hidden md:inline-flex items-center gap-1 text-amber-200 hover:text-white underline decoration-amber-400/50 underline-offset-2 shrink-0"
          >
            <Phone className="w-3 h-3" /> Call: {settings.phone}
          </a>
        </div>
      )}

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-20">
          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100"
            aria-label="Open navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo */}
          <div className="shrink-0">
            <Logo />
          </div>

          {/* Prominent Search Bar (Desktop) */}
          <div ref={searchRef} className="hidden lg:flex flex-1 max-w-xl mx-4 relative">
            <form onSubmit={handleSearchSubmit} className="w-full relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim().length >= 2 && setShowSuggestions(true)}
                placeholder="Search sofas, teak dining tables, beds, bhirva wardrobes..."
                className="w-full pl-11 pr-24 py-2.5 bg-stone-100/90 hover:bg-stone-100 focus:bg-white text-stone-900 placeholder-stone-500 rounded-full border border-stone-200 focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20 text-sm transition-all outline-hidden shadow-inner"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
              
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-amber-800 hover:bg-amber-900 text-white rounded-full text-xs font-semibold tracking-wide transition-colors"
              >
                Search
              </button>
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-3 text-xs font-semibold uppercase tracking-wider text-stone-400 border-b border-stone-100 flex justify-between items-center">
                  <span>Suggested Products</span>
                  {isSearching && <span className="text-amber-700 animate-pulse">Searching...</span>}
                </div>
                {suggestions.length > 0 ? (
                  <div className="divide-y divide-stone-100 max-h-80 overflow-y-auto">
                    {suggestions.map((item) => (
                      <Link
                        key={item.id}
                        to={`/product/${item.slug}`}
                        onClick={() => setShowSuggestions(false)}
                        className="flex items-center gap-3 p-3 hover:bg-amber-50/60 transition-colors group"
                      >
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=100&q=80'}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-lg border border-stone-200 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-stone-900 group-hover:text-amber-900 truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-stone-500">{item.category}</p>
                        </div>
                        <span className="font-semibold text-sm text-amber-800 whitespace-nowrap">
                          ₹{item.price.toLocaleString('en-IN')}
                        </span>
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
                    className="text-xs font-medium text-amber-800 hover:text-amber-900 hover:underline"
                  >
                    View all matching results for "{searchQuery}" →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Header Navigation & Actions */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Track Order Shortcut */}
            <Link
              to="/track-order"
              className="hidden md:flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-amber-800 transition-colors py-2 px-2.5 rounded-lg hover:bg-stone-50"
            >
              <Package className="w-4 h-4 text-amber-700" />
              <span>Track Order</span>
            </Link>

            {/* Account Dropdown */}
            <div ref={userMenuRef} className="relative">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl text-stone-700 hover:text-stone-900 hover:bg-stone-100 transition-colors border border-transparent hover:border-stone-200"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 font-semibold flex items-center justify-center text-xs border border-amber-300">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="hidden sm:inline text-xs font-medium max-w-[100px] truncate">
                    {user?.name?.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400 hidden sm:block" />
                </button>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 text-stone-700 hover:text-amber-800 p-2 rounded-xl hover:bg-stone-100 transition-colors"
                >
                  <UserIcon className="w-5 h-5 text-stone-600" />
                  <span className="hidden sm:inline text-xs font-semibold">Sign In</span>
                </Link>
              )}

              {/* User Menu Dropdown */}
              {userDropdownOpen && isAuthenticated && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2.5 border-b border-stone-100">
                    <p className="text-xs font-bold text-stone-900 truncate">{user?.name}</p>
                    <p className="text-[11px] text-stone-500 truncate">{user?.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      {user?.role?.replace('_', ' ')}
                    </span>
                  </div>

                  <Link
                    to="/account/orders"
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-stone-700 hover:bg-amber-50 hover:text-amber-900"
                  >
                    <Package className="w-4 h-4 text-amber-700" />
                    My Order History
                  </Link>
                  <Link
                    to="/account/profile"
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-stone-700 hover:bg-amber-50 hover:text-amber-900"
                  >
                    <UserIcon className="w-4 h-4 text-amber-700" />
                    Account Settings & Addresses
                  </Link>

                  {isAdmin && (
                    <>
                      <div className="my-1 border-t border-stone-100" />
                      <Link
                        to="/admin"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-100/70"
                      >
                        <Sparkles className="w-4 h-4 text-amber-800" />
                        Admin Dashboard
                      </Link>
                    </>
                  )}

                  <div className="my-1 border-t border-stone-100" />
                  <button
                    onClick={() => {
                      logout();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Shopping Cart Button */}
            <Link
              to="/cart"
              className="relative flex items-center justify-center p-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white shadow-sm shadow-amber-950/20 active:scale-95 transition-all"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-400 text-stone-950 text-[11px] font-black flex items-center justify-center shadow-md border-2 border-white animate-in zoom-in-50">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="lg:hidden pb-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search furniture & decor..."
              className="w-full pl-10 pr-20 py-2 bg-stone-100 text-stone-900 rounded-full text-xs border border-stone-200 focus:outline-hidden focus:border-amber-600 focus:bg-white"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 px-3 py-1 bg-amber-800 text-white text-[11px] font-semibold rounded-full"
            >
              Search
            </button>
          </form>
        </div>

        {/* Desktop Category Navigation Bar */}
        <nav className="hidden lg:flex items-center gap-6 py-2.5 border-t border-stone-100 text-xs font-medium text-stone-700 overflow-x-auto no-scrollbar">
          <Link
            to="/"
            className={`whitespace-nowrap transition-colors hover:text-amber-800 ${
              location.pathname === '/' ? 'text-amber-900 font-bold' : ''
            }`}
          >
            Home
          </Link>
          <Link
            to="/products"
            className={`whitespace-nowrap transition-colors hover:text-amber-800 ${
              location.pathname === '/products' ? 'text-amber-900 font-bold' : ''
            }`}
          >
            All Products
          </Link>
          {categories.slice(0, 9).map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="whitespace-nowrap transition-colors hover:text-amber-800 hover:underline underline-offset-4 decoration-amber-500"
            >
              {cat.name}
            </Link>
          ))}
          {categories.length > 9 && (
            <Link
              to="/categories"
              className="whitespace-nowrap text-amber-800 font-semibold hover:underline"
            >
              More Categories +
            </Link>
          )}
        </nav>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-full bg-white border-b border-stone-200 shadow-2xl max-h-[85vh] overflow-y-auto z-50 animate-in slide-in-from-top-2">
          <div className="p-4 space-y-4">
            <div className="space-y-1">
              <Link
                to="/"
                className="block px-3 py-2 rounded-lg font-medium text-stone-800 hover:bg-stone-100 text-sm"
              >
                Home
              </Link>
              <Link
                to="/products"
                className="block px-3 py-2 rounded-lg font-medium text-stone-800 hover:bg-stone-100 text-sm"
              >
                All Furniture
              </Link>
              <Link
                to="/track-order"
                className="block px-3 py-2 rounded-lg font-medium text-stone-800 hover:bg-stone-100 text-sm"
              >
                Track Your Order
              </Link>
            </div>

            <div className="border-t border-stone-100 pt-3">
              <h4 className="text-[11px] font-bold text-amber-900 uppercase tracking-wider px-3 mb-2">
                Shop By Category
              </h4>
              <div className="grid grid-cols-2 gap-1.5">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/category/${cat.slug}`}
                    className="flex items-center gap-2 p-2 rounded-lg text-xs font-medium text-stone-700 hover:bg-amber-50 hover:text-amber-900"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                    <span className="truncate">{cat.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="border-t border-stone-100 pt-3">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="px-3 py-1">
                    <p className="text-xs font-bold text-stone-900">{user?.name}</p>
                    <p className="text-[11px] text-stone-500">{user?.email}</p>
                  </div>
                  <Link
                    to="/account/orders"
                    className="block px-3 py-2 rounded-lg text-xs font-medium text-stone-700 hover:bg-stone-100"
                  >
                    My Order History
                  </Link>
                  <Link
                    to="/account/profile"
                    className="block px-3 py-2 rounded-lg text-xs font-medium text-stone-700 hover:bg-stone-100"
                  >
                    Profile & Delivery Addresses
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="block px-3 py-2 rounded-lg text-xs font-bold text-amber-800 bg-amber-50"
                    >
                      Admin Dashboard Portal
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Link
                    to="/login"
                    className="w-full py-2.5 text-center text-xs font-semibold rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50"
                  >
                    Customer Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="w-full py-2.5 text-center text-xs font-semibold rounded-xl bg-amber-800 text-white hover:bg-amber-900"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
