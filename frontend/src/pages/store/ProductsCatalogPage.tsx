import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  SlidersHorizontal, ChevronRight, Search, X, RotateCcw,
  Check, ArrowUpDown
} from 'lucide-react';
import { ProductCard } from '../../components/store/ProductCard';
import { Product } from '../../types';
import { storeApi } from '../../api/client';
import { useStore } from '../../context/StoreContext';

export const ProductsCatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { categories } = useStore();

  const searchQuery = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const filterColors = ['Teak', 'Walnut', 'Beige', 'Grey', 'Green', 'Black'];

  // Sync with URL query parameter
  useEffect(() => {
    setLocalSearch(searchQuery);
    setSelectedCategory(categoryParam);
    setPage(1);
  }, [searchQuery, categoryParam]);

  // Fetch products
  useEffect(() => {
    const fetchCatalog = async () => {
      setLoading(true);
      try {
        const params: Record<string, any> = {
          page,
          limit: 12,
          sort: sortBy
        };

        if (localSearch.trim()) params.search = localSearch.trim();
        if (selectedCategory) params.category = selectedCategory;
        if (minPrice !== '') params.min_price = minPrice;
        if (maxPrice !== '') params.max_price = maxPrice;
        if (selectedColor) params.color = selectedColor;
        if (inStockOnly) params.in_stock = true;

        const res = await storeApi.getProducts(params);
        setProducts(res.items);
        setTotal(res.total);
      } catch (err) {
        console.error('Failed to load catalog:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, [localSearch, selectedCategory, minPrice, maxPrice, selectedColor, inStockOnly, sortBy, page]);

  const handleResetFilters = () => {
    setLocalSearch('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSelectedColor('');
    setInStockOnly(false);
    setSortBy('newest');
    setPage(1);
    setSearchParams({});
  };

  const totalPages = Math.ceil(total / 12) || 1;

  return (
    <div className="bg-[#FCFBF9] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb & Title */}
        <div className="flex items-center gap-2 text-xs text-stone-500 mb-3 font-medium">
          <Link to="/" className="hover:text-stone-900 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-stone-900">
            {localSearch ? `Search Results for "${localSearch}"` : 'All Furniture Collections'}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 mb-8 border-b border-stone-200">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold font-serif text-stone-900 tracking-tight">
              {localSearch ? `Search: "${localSearch}"` : 'All Handcrafted Collections'}
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Explore authentic solid wood furniture designed for durability and comfort.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="text-stone-500">
              Showing <strong>{products.length}</strong> of <strong>{total}</strong> products
            </span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="pl-3 pr-8 py-2 bg-white rounded-xl border border-stone-200 text-stone-800 font-semibold text-xs shadow-xs focus:outline-hidden"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Grid: Filters Sidebar + Products */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:block">
            <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-amber-800" />
                  <h3 className="font-bold text-sm text-stone-900 font-serif">Filters</h3>
                </div>
                {(localSearch || selectedCategory || minPrice || maxPrice || selectedColor || inStockOnly) && (
                  <button
                    onClick={handleResetFilters}
                    className="text-[11px] font-semibold text-amber-800 hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Keyword Search */}
              <div>
                <label className="block text-xs font-semibold text-stone-800 uppercase tracking-wider mb-2">
                  Search Keyword
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={localSearch}
                    onChange={(e) => {
                      setLocalSearch(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Search furniture..."
                    className="w-full pl-8 pr-3 py-2 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:outline-hidden focus:border-amber-600 focus:bg-white"
                  />
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-xs font-semibold text-stone-800 uppercase tracking-wider mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setPage(1);
                  }}
                  className="w-full p-2 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:outline-hidden focus:border-amber-600"
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-xs font-semibold text-stone-800 uppercase tracking-wider mb-2">
                  Price (₹)
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
                    className="w-full p-2 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:outline-hidden"
                  />
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => {
                      setMaxPrice(e.target.value ? Number(e.target.value) : '');
                      setPage(1);
                    }}
                    placeholder="Max ₹"
                    className="w-full p-2 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Color Tones */}
              <div>
                <label className="block text-xs font-semibold text-stone-800 uppercase tracking-wider mb-2">
                  Color / Wood Tone
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

              {/* Availability */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-800">
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

              <button
                onClick={handleResetFilters}
                className="w-full py-2.5 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
                <span>Reset All Filters</span>
              </button>
            </div>
          </aside>

          {/* Product Cards */}
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
                  No products matched your search
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Try checking the spelling or removing filter constraints.
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
