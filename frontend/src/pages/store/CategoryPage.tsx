import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  SlidersHorizontal, ChevronRight, Search, X, RotateCcw,
  Sparkles, Check, ArrowUpDown
} from 'lucide-react';
import { ProductCard } from '../../components/store/ProductCard';
import { Product, Category } from '../../types';
import { storeApi } from '../../api/client';
import { useStore } from '../../context/StoreContext';

export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { categories } = useStore();

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchInCat, setSearchInCat] = useState('');
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Predefined popular wood & fabric colors
  const filterColors = ['Teak', 'Walnut', 'Beige', 'Grey', 'Green', 'Black'];

  // Sync category details
  useEffect(() => {
    if (!slug) return;
    const cat = categories.find((c) => c.slug === slug);
    if (cat) {
      setCategory(cat);
    } else {
      storeApi.getCategory(slug).then(setCategory).catch(console.error);
    }
    // Reset filters when category changes
    setSearchInCat('');
    setMinPrice('');
    setMaxPrice('');
    setSelectedColor('');
    setInStockOnly(false);
    setSortBy('newest');
    setPage(1);
  }, [slug, categories]);

  // Fetch filtered products
  useEffect(() => {
    const fetchFilteredProducts = async () => {
      setLoading(true);
      try {
        const params: Record<string, any> = {
          category: slug,
          page,
          limit: 12,
          sort: sortBy
        };

        if (searchInCat.trim()) params.search = searchInCat.trim();
        if (minPrice !== '') params.min_price = minPrice;
        if (maxPrice !== '') params.max_price = maxPrice;
        if (selectedColor) params.color = selectedColor;
        if (inStockOnly) params.in_stock = true;

        const res = await storeApi.getProducts(params);
        setProducts(res.items);
        setTotal(res.total);
      } catch (err) {
        console.error('Failed to load category products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredProducts();
  }, [slug, searchInCat, minPrice, maxPrice, selectedColor, inStockOnly, sortBy, page]);

  const handleResetFilters = () => {
    setSearchInCat('');
    setMinPrice('');
    setMaxPrice('');
    setSelectedColor('');
    setInStockOnly(false);
    setSortBy('newest');
    setPage(1);
  };

  const totalPages = Math.ceil(total / 12) || 1;

  return (
    <div className="bg-[#FCFBF9] min-h-screen">
      {/* Category Hero Banner */}
      <div className="relative bg-stone-900 text-white py-12 sm:py-16 overflow-hidden">
        {category?.image_url && (
          <div className="absolute inset-0 z-0">
            <img
              src={category.image_url}
              alt={category.name}
              className="w-full h-full object-cover object-center opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/80 to-stone-950/40" />
          </div>
        )}

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-amber-200/80 mb-3 font-medium">
            <Link to="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/products" className="hover:text-white transition-colors">
              Collections
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white">{category?.name || slug}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif text-white tracking-tight">
            {category?.name || slug?.replace(/-/g, ' ').toUpperCase()}
          </h1>

          {category?.description && (
            <p className="mt-3 text-stone-300 text-xs sm:text-sm max-w-2xl font-light leading-relaxed">
              {category.description}
            </p>
          )}

          <div className="mt-4 flex items-center gap-4 text-xs text-amber-400 font-semibold">
            <span>{total} Handcrafted Products</span>
            {category?.subcategories && category.subcategories.length > 0 && (
              <>
                <span>•</span>
                <span>{category.subcategories.length} Specialized Subcategories</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Mobile Filter Toggle & Sort Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 mb-6 border-b border-stone-200">
          <div className="w-full sm:w-auto flex items-center justify-between gap-3">
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-xs font-semibold text-stone-800 shadow-xs"
            >
              <SlidersHorizontal className="w-4 h-4 text-amber-800" />
              <span>Filters</span>
              {(selectedColor || minPrice || maxPrice || inStockOnly) && (
                <span className="w-2 h-2 rounded-full bg-amber-600" />
              )}
            </button>

            <span className="text-xs text-stone-500 font-medium">
              Showing <strong>{products.length}</strong> of <strong>{total}</strong> products
            </span>
          </div>

          {/* Sort Dropdown */}
          <div className="w-full sm:w-auto flex items-center justify-end gap-2 text-xs">
            <label htmlFor="sortBy" className="text-stone-500 font-medium whitespace-nowrap">
              Sort by:
            </label>
            <div className="relative">
              <select
                id="sortBy"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="pl-3 pr-8 py-2 bg-white rounded-xl border border-stone-200 text-stone-800 font-semibold focus:outline-hidden focus:border-amber-600 text-xs shadow-xs"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Layout Grid: Sidebar Filters + Products Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters (Desktop + Mobile Drawer) */}
          <aside
            className={`lg:block ${
              mobileFilterOpen ? 'fixed inset-0 z-50 bg-stone-950/60 flex justify-end' : 'hidden'
            }`}
          >
            <div
              className={`bg-white rounded-2xl border border-stone-200 p-5 space-y-6 ${
                mobileFilterOpen
                  ? 'w-full max-w-xs h-full overflow-y-auto animate-in slide-in-from-right rounded-none'
                  : ''
              }`}
            >
              {/* Header inside mobile drawer */}
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-amber-800" />
                  <h3 className="font-bold text-sm text-stone-900 font-serif">Refine Selection</h3>
                </div>
                {mobileFilterOpen && (
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="p-1.5 text-stone-400 hover:text-stone-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* 1. In-Category Search */}
              <div>
                <label className="block text-xs font-semibold text-stone-800 uppercase tracking-wider mb-2">
                  Search in {category?.name || 'Category'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchInCat}
                    onChange={(e) => {
                      setSearchInCat(e.target.value);
                      setPage(1);
                    }}
                    placeholder="e.g. 3-seater, marble top..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:outline-hidden focus:border-amber-600 focus:bg-white"
                  />
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  {searchInCat && (
                    <button
                      onClick={() => setSearchInCat('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* 2. Price Range Filter */}
              <div>
                <label className="block text-xs font-semibold text-stone-800 uppercase tracking-wider mb-2">
                  Price Range (₹)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => {
                      setMinPrice(e.target.value ? Number(e.target.value) : '');
                      setPage(1);
                    }}
                    placeholder="Min ₹"
                    className="w-full p-2 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:outline-hidden focus:border-amber-600 focus:bg-white"
                  />
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => {
                      setMaxPrice(e.target.value ? Number(e.target.value) : '');
                      setPage(1);
                    }}
                    placeholder="Max ₹"
                    className="w-full p-2 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:outline-hidden focus:border-amber-600 focus:bg-white"
                  />
                </div>
              </div>

              {/* 3. Color Filter */}
              <div>
                <label className="block text-xs font-semibold text-stone-800 uppercase tracking-wider mb-2">
                  Wood / Finish Tone
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {filterColors.map((col) => (
                    <button
                      key={col}
                      onClick={() => {
                        setSelectedColor(selectedColor === col ? '' : col);
                        setPage(1);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        selectedColor === col
                          ? 'bg-amber-800 text-white shadow-xs'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Availability Filter */}
              <div>
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-stone-800">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => {
                      setInStockOnly(e.target.checked);
                      setPage(1);
                    }}
                    className="w-4 h-4 rounded text-amber-700 focus:ring-amber-500 border-stone-300"
                  />
                  <span>In Stock Only</span>
                </label>
              </div>

              {/* Clear All Filters Button */}
              <button
                onClick={handleResetFilters}
                className="w-full py-2.5 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
                <span>Reset All Filters</span>
              </button>
            </div>
          </aside>

          {/* Product Grid */}
          <main className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="animate-pulse bg-stone-100 rounded-2xl h-80 border border-stone-200" />
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex items-center justify-center gap-2">
                    <button
                      onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 rounded-xl border border-stone-200 bg-white text-xs font-medium text-stone-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-50"
                    >
                      Previous
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                      <button
                        key={pNum}
                        onClick={() => setPage(pNum)}
                        className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          page === pNum
                            ? 'bg-amber-800 text-white shadow-md'
                            : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
                        }`}
                      >
                        {pNum}
                      </button>
                    ))}

                    <button
                      onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 rounded-xl border border-stone-200 bg-white text-xs font-medium text-stone-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 space-y-4">
                <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-stone-900 font-serif">
                  No products matched your filter criteria
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Try adjusting or clearing your price filters, color options or search keyword to see available pieces.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-2.5 rounded-full bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold shadow-sm"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
