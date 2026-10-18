import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, Plus, Search, Filter, Copy, Edit, Trash2, Eye,
  CheckCircle, XCircle, AlertTriangle, RefreshCw
} from 'lucide-react';
import { Product, Category } from '../../types';
import { adminApi, storeApi } from '../../api/client';
import { useToast } from '../../context/ToastContext';

export const AdminProductsPage: React.FC = () => {
  const { success, error: toastError } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  // Deletion modal state
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getProducts({
        search: search.trim() || undefined,
        category_id: categoryFilter || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        page,
        limit: 15
      });
      setProducts(res.items);
      setTotal(res.total);
    } catch (err: any) {
      toastError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    adminApi.getCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [search, categoryFilter, statusFilter, page]);

  const handleDuplicate = async (id: string) => {
    try {
      const duplicated = await adminApi.duplicateProduct(id);
      success(`Duplicated product created as '${duplicated.name}' (Draft)`);
      fetchProducts();
    } catch (err: any) {
      toastError(err.message || 'Failed to duplicate product');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    setDeleting(true);
    try {
      await adminApi.deleteProduct(productToDelete.id, false); // Safe archiving
      success(`Product '${productToDelete.name}' has been safely archived`);
      setProductToDelete(null);
      fetchProducts();
    } catch (err: any) {
      toastError(err.message || 'Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = Math.ceil(total / 15) || 1;

  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 tracking-tight">
            Furniture Product Management
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Create, update, duplicate, price, and organize catalog inventory.
          </p>
        </div>

        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs tracking-wide shadow-md transition-all active:scale-95 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by product name, SKU, material..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:bg-white focus:outline-hidden"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="w-full md:w-auto p-2 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:outline-hidden"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full md:w-auto p-2 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:outline-hidden"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
            <option value="low_stock">Low Stock (≤ 5)</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Products Table Card */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-stone-50/80 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-3">SKU</th>
                <th className="py-3.5 px-3">Category</th>
                <th className="py-3.5 px-3 text-right">Selling Price</th>
                <th className="py-3.5 px-3 text-center">Stock</th>
                <th className="py-3.5 px-3 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stone-400">
                    Loading products...
                  </td>
                </tr>
              ) : products.length > 0 ? (
                products.map((p) => {
                  const img = p.images?.[0]?.url || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=100&q=80';
                  const isOutOfStock = !p.in_stock || p.total_stock <= 0;
                  const isLow = p.in_stock && p.total_stock > 0 && p.total_stock <= 5;

                  return (
                    <tr key={p.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={img}
                            alt=""
                            className="w-12 h-12 object-contain p-0.5 rounded-xl border border-stone-200 shrink-0 bg-stone-50"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-stone-900 block truncate max-w-xs sm:max-w-md">
                              {p.name}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                              {p.is_featured && (
                                <span className="text-[10px] font-bold text-stone-800 bg-stone-100 px-1.5 py-0.2 rounded">
                                  Featured
                                </span>
                              )}
                              {p.is_best_seller && (
                                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded">
                                  Best Seller
                                </span>
                              )}
                              {p.colors && p.colors.length > 0 && (
                                <span className="text-[10px] text-stone-400">
                                  {p.colors.length} {p.colors.length === 1 ? 'color' : 'colors'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 font-mono text-stone-500 font-medium">
                        {p.sku || '—'}
                      </td>

                      <td className="py-3 px-3 text-stone-600">
                        {p.category_name || '—'}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="font-bold text-stone-900 font-serif">
                          ₹{p.selling_price.toLocaleString('en-IN')}
                        </div>
                        {p.original_price && p.original_price > p.selling_price && (
                          <div className="text-[10px] text-stone-400 line-through">
                            ₹{p.original_price.toLocaleString('en-IN')}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center">
                        {isOutOfStock ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">
                            0 Out
                          </span>
                        ) : isLow ? (
                          <span className="px-2 py-0.5 rounded-full bg-stone-200 text-stone-800 font-bold text-[10px]">
                            {p.total_stock} Low
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            {p.total_stock}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center">
                        {p.is_archived ? (
                          <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-semibold text-[10px]">
                            Archived
                          </span>
                        ) : p.is_published ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-[10px]">
                            Published
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-semibold text-[10px]">
                            Draft
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/product/${p.slug}`}
                            target="_blank"
                            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg"
                            title="Preview in Storefront"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          <button
                            onClick={() => handleDuplicate(p.id)}
                            className="p-1.5 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-lg cursor-pointer"
                            title="Duplicate Product"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          <Link
                            to={`/admin/products/edit/${p.id}`}
                            className="p-1.5 text-stone-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          <button
                            onClick={() => setProductToDelete(p)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                            title="Safe Delete / Archive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-500">
                    No products found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
            <span>
              Page {page} of {totalPages} ({total} total products)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete / Safe Archive Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 animate-in zoom-in-95">
            <h3 className="text-lg font-bold font-serif text-stone-900">
              Safe Archive Product
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Are you sure you want to archive <strong>"{productToDelete.name}"</strong>? It will be safely removed from customer storefront browsing while preserving past order history.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer"
              >
                {deleting ? 'Archiving...' : 'Confirm Archive'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
