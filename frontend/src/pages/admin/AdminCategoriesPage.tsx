import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  FolderTree, Plus, Edit, Trash2, Upload, LayoutGrid, List,
  Eye, PackagePlus, Search, ArrowLeft, ArrowRight, CheckCircle2,
  Package, Tag, Palette, Sparkles, RefreshCw, X
} from 'lucide-react';
import { Category, Subcategory, Product } from '../../types';
import { adminApi } from '../../api/client';
import { useToast } from '../../context/ToastContext';

export const AdminCategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryIdParam = searchParams.get('category_id');

  const { success, error: toastError } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [productSearchFilter, setProductSearchFilter] = useState('');

  // Selected Category View state (When clicking a category, e.g. "Sofas")
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Modal State for Category Edit/Create
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: '',
    display_order: 0,
    is_active: true
  });
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Fetch all categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getCategories();
      setCategories(data);

      // If category_id is in URL params, automatically select it
      if (categoryIdParam) {
        const found = data.find((c) => c.id === categoryIdParam);
        if (found) {
          handleSelectCategory(found);
        }
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // When a category card is clicked (e.g. Sofas)
  const handleSelectCategory = async (cat: Category) => {
    setSelectedCategory(cat);
    setSearchParams({ category_id: cat.id });
    setLoadingProducts(true);
    try {
      const res = await adminApi.getProducts({ category_id: cat.id, limit: 100 });
      setCategoryProducts(res.items || []);
    } catch (err: any) {
      toastError(err.message || `Failed to load products for ${cat.name}`);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Back to category cards
  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setCategoryProducts([]);
    setProductSearchFilter('');
    setSearchParams({});
  };

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setCategoryForm({
      name: '',
      slug: '',
      description: '',
      image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80',
      display_order: categories.length + 1,
      is_active: true
    });
    setSubcategories([]);
    setShowModal(true);
  };

  const handleOpenEdit = (cat: Category, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingCategory(cat);
    setCategoryForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      image_url: cat.image_url || '',
      display_order: cat.display_order,
      is_active: cat.is_active
    });
    setSubcategories(cat.subcategories || []);
    setShowModal(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const res = await adminApi.uploadImage(file);
      setCategoryForm((prev) => ({ ...prev, image_url: res.url }));
      success('Category image uploaded');
    } catch (err: any) {
      toastError(err.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      toastError('Category name is required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...categoryForm,
        slug:
          categoryForm.slug.trim() ||
          categoryForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        subcategories
      };

      if (editingCategory) {
        await adminApi.updateCategory(editingCategory.id, payload);
        success('Category updated successfully');
      } else {
        await adminApi.createCategory(payload);
        success('Category created successfully');
      }
      setShowModal(false);
      fetchCategories();
    } catch (err: any) {
      toastError(err.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (cat: Category, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
      try {
        await adminApi.deleteCategory(cat.id);
        success('Category deleted');
        if (selectedCategory?.id === cat.id) {
          handleBackToCategories();
        }
        fetchCategories();
      } catch (err: any) {
        toastError(err.message || 'Failed to delete category');
      }
    }
  };

  const handleDeleteProduct = async (prod: Product) => {
    if (confirm(`Are you sure you want to delete "${prod.name}" from catalog?`)) {
      try {
        await adminApi.deleteProduct(prod.id);
        success('Product deleted from catalog');
        if (selectedCategory) {
          handleSelectCategory(selectedCategory);
        }
        fetchCategories();
      } catch (err: any) {
        toastError(err.message || 'Failed to delete product');
      }
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const displayedCategoryProducts = productSearchFilter.trim()
    ? categoryProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(productSearchFilter.toLowerCase()) ||
          (p.sku && p.sku.toLowerCase().includes(productSearchFilter.toLowerCase()))
      )
    : categoryProducts;

  return (
    <div className="p-3.5 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* ============================================================== */}
      {/* VIEW 1: CATEGORY DETAIL WITH ALL PRODUCTS + ADD PRODUCT BUTTON */}
      {/* (Triggered when clicking a category, e.g. "Sofas")              */}
      {/* ============================================================== */}
      {selectedCategory ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
          {/* Top Bar: Back button & Search Bar (STAYS FIXED AT TOP-16 ALONG WITH HEADER) */}
          <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md py-3 -mx-3.5 px-3.5 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 border-b border-stone-200 shadow-xs flex items-center gap-2">
            <button
              type="button"
              onClick={handleBackToCategories}
              className="shrink-0 inline-flex items-center gap-1 px-3 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-full text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
              title="Back to All Categories"
              aria-label="Back"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <div className="relative flex-1 max-w-xl">
              <input
                type="text"
                value={productSearchFilter}
                onChange={(e) => setProductSearchFilter(e.target.value)}
                placeholder={`Search in ${selectedCategory.name}...`}
                className="w-full pl-9 pr-16 py-2 bg-stone-100 hover:bg-stone-50 focus:bg-white text-stone-900 placeholder-stone-500 rounded-full text-xs border border-stone-200 focus:outline-hidden focus:border-stone-500 shadow-inner transition-colors"
              />
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                className="absolute right-1 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-stone-800 hover:bg-stone-900 text-white text-[10px] font-semibold rounded-full shadow-xs cursor-pointer"
              >
                Search
              </button>
            </div>
          </div>

          {/* Category Header (Without the 2 removed buttons) */}
          <div className="pb-4 border-b border-stone-200">
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold font-serif text-stone-900">
                {selectedCategory.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-stone-200 text-stone-800 text-xs font-bold">
                {categoryProducts.length} Items in Catalog
              </span>
            </div>
            {selectedCategory.description && (
              <p className="text-xs text-stone-500 mt-1 max-w-xl">
                {selectedCategory.description}
              </p>
            )}
          </div>

          {/* Products List for this Category (2 Columns on mobile!) */}
          {loadingProducts ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-56 sm:h-72 bg-stone-200/70 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : categoryProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {/* Quick Add Card */}
              <div
                onClick={() =>
                  navigate(`/admin/products/new?category_id=${selectedCategory.id}`)
                }
                className="flex flex-col items-center justify-center p-3 sm:p-6 rounded-2xl border-2 border-dashed border-stone-300 hover:border-stone-500 bg-stone-50/50 hover:bg-stone-100/70 transition-all cursor-pointer min-h-[190px] sm:min-h-[280px] text-center group"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white border border-stone-300 text-stone-800 flex items-center justify-center mb-2 sm:mb-3 shadow-xs group-hover:scale-110 transition-transform">
                  <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h4 className="font-bold text-xs sm:text-sm text-stone-900 group-hover:text-stone-700">
                  Add {selectedCategory.name.replace(/s$/, '')}
                </h4>
                <p className="text-[10px] sm:text-xs text-stone-500 mt-0.5 max-w-xs line-clamp-1">
                  + Upload photos
                </p>
              </div>

              {/* Product Cards in this Category */}
              {displayedCategoryProducts.map((prod) => {
                const primaryImage =
                  prod.images.find((img) => img.is_primary)?.url ||
                  prod.colors?.[0]?.image_url ||
                  prod.colors?.[0]?.images?.[0] ||
                  prod.images[0]?.url ||
                  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80';

                return (
                  <div
                    key={prod.id}
                    className="flex flex-col bg-white rounded-2xl border border-stone-200/90 shadow-xs hover:shadow-lg transition-all duration-300 overflow-hidden"
                  >
                    {/* Image Container (Complete size image without cropping) */}
                    <div className="relative aspect-4/3 w-full bg-stone-50 overflow-hidden flex items-center justify-center p-2">
                      <img
                        src={primaryImage}
                        alt={prod.name}
                        className="max-h-full max-w-full w-auto h-auto object-contain mx-auto"
                      />

                      {/* Discount Badge */}
                      {prod.discount_percentage ? (
                        <span className="absolute top-2 left-2 px-1.5 sm:px-2 py-0.5 rounded-full bg-rose-600 text-white font-bold text-[9px] sm:text-[10px] uppercase shadow-sm">
                          {prod.discount_percentage}% OFF
                        </span>
                      ) : null}

                      {/* Stock badge */}
                      <span className="absolute bottom-2 left-2 px-1.5 sm:px-2 py-0.5 rounded-md bg-stone-900/80 backdrop-blur-xs text-white text-[9px] sm:text-[10px] font-semibold">
                        Stock: {prod.total_stock}
                      </span>
                    </div>

                    {/* Product Details */}
                    <div className="p-2.5 sm:p-4 flex flex-col flex-1 justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-stone-900 line-clamp-1 sm:line-clamp-2 leading-snug">
                          {prod.name}
                        </h4>

                        {/* Price discovery display */}
                        <div className="flex flex-wrap items-baseline gap-1 mt-1 sm:mt-2">
                          <span className="text-xs sm:text-base font-bold text-stone-900">
                            ₹{prod.selling_price.toLocaleString('en-IN')}
                          </span>
                          {prod.original_price && prod.original_price > prod.selling_price && (
                            <span className="text-[10px] sm:text-xs text-stone-400 line-through">
                              ₹{prod.original_price.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>

                        {/* Available colors indicator */}
                        {prod.colors && prod.colors.length > 0 && (
                          <div className="flex items-center gap-1 mt-1 sm:mt-2">
                            <span className="text-[9px] sm:text-[10px] text-stone-400 font-medium hidden sm:inline">Finishes:</span>
                            <div className="flex items-center gap-1">
                              {prod.colors.slice(0, 3).map((c, idx) => (
                                <span
                                  key={idx}
                                  title={`${c.name} (${c.images?.length || (c.image_url ? 1 : 0)} photos)`}
                                  style={{ backgroundColor: c.hex_code || '#78350F' }}
                                  className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border border-stone-300 shadow-xs"
                                />
                              ))}
                              {prod.colors.length > 3 && (
                                <span className="text-[9px] text-stone-400">+{prod.colors.length - 3}</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions: Edit & Delete */}
                      <div className="pt-2 border-t border-stone-100 grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/products/edit/${prod.id}`)}
                          className="py-1 sm:py-1.5 px-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-[10px] sm:text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(prod)}
                          className="py-1 sm:py-1.5 px-1.5 rounded-lg border border-stone-200 text-rose-600 hover:bg-rose-50 text-[10px] sm:text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 space-y-4">
              <Package className="w-12 h-12 text-stone-300 mx-auto" />
              <h3 className="text-base font-bold text-stone-900 font-serif">
                No products added to "{selectedCategory.name}" yet
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Add your first piece with original price, discount price, color finishes, and multiple photos.
              </p>
              <button
                type="button"
                onClick={() =>
                  navigate(`/admin/products/new?category_id=${selectedCategory.id}`)
                }
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-stone-800 text-white font-bold text-xs uppercase tracking-wider shadow-sm hover:bg-stone-900 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add First {selectedCategory.name} Piece</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* ============================================================== */
        /* VIEW 2: VISUAL CATEGORY CARDS (Click any card to view products) */
        /* ============================================================== */
        <div className="space-y-6">
          {/* 1. Sticky Top Bar: Back button & Search Bar (STAYS FIXED AT TOP-16 ALONG WITH HEADER) */}
          <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md py-3 -mx-3.5 px-3.5 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 border-b border-stone-200 shadow-xs flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (window.history.length > 1) {
                  window.history.back();
                } else {
                  navigate('/admin');
                }
              }}
              className="shrink-0 inline-flex items-center gap-1 px-3 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-full text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
              title="Go back"
              aria-label="Back"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <div className="relative flex-1 max-w-xl">
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search furniture categories & collections..."
                className="w-full pl-9 pr-16 py-2 bg-stone-100 hover:bg-stone-50 focus:bg-white text-stone-900 placeholder-stone-500 rounded-full text-xs border border-stone-200 focus:outline-hidden focus:border-stone-500 shadow-inner transition-colors"
              />
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                className="absolute right-1 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-stone-800 hover:bg-stone-900 text-white text-[10px] font-semibold rounded-full shadow-xs cursor-pointer"
              >
                Search
              </button>
            </div>
          </div>

          {/* 2. "Categories & Furniture Collections" AFTER the search bar */}
          <div className="pb-1 pt-1">
            <h1 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-stone-700" />
              <span>Categories & Furniture Collections</span>
            </h1>
            <p className="text-stone-500 text-xs mt-1">
              Click any category card to view its products and add new pieces.
            </p>
          </div>

          {/* Category Cards Grid (2 Columns on Mobile - Like Customer Categories Page!) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5">
            {/* Create New Category Card */}
            <div
              onClick={handleOpenCreate}
              className="flex flex-col items-center justify-center p-3.5 sm:p-6 rounded-2xl border-2 border-dashed border-stone-300 hover:border-stone-500 bg-stone-50/50 hover:bg-stone-100 transition-all cursor-pointer min-h-[190px] sm:min-h-[260px] group text-center"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-400 group-hover:text-stone-800 group-hover:scale-110 shadow-xs transition-all mb-2 sm:mb-3">
                <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-stone-900 group-hover:text-stone-700">
                Add Category
              </h3>
              <p className="text-[10px] sm:text-xs text-stone-400 mt-0.5 line-clamp-1">
                + New collection
              </p>
            </div>

            {filteredCategories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => handleSelectCategory(cat)}
                className="group relative flex flex-col rounded-2xl bg-white border border-stone-200 shadow-xs hover:shadow-xl hover:border-stone-400 transition-all duration-300 overflow-hidden cursor-pointer"
              >
                {/* Category Image (Complete size image without cropping) */}
                <div className="relative aspect-4/3 w-full bg-stone-50 overflow-hidden flex items-center justify-center p-2">
                  <img
                    src={
                      cat.image_url ||
                      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80'
                    }
                    alt={cat.name}
                    className="max-h-full max-w-full w-auto h-auto object-contain mx-auto group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Status & Count Badges */}
                  <div className="absolute top-2 left-2 z-10 flex items-center gap-1">
                    <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-stone-900/80 backdrop-blur-xs text-white text-[9px] sm:text-[10px] font-bold">
                      {cat.product_count ?? 0} Items
                    </span>
                    {cat.is_active ? (
                      <span className="px-1.5 py-0.5 rounded-full bg-emerald-700 text-white text-[9px] font-semibold hidden xs:inline">
                        Live
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded-full bg-stone-600 text-white text-[9px] font-semibold hidden xs:inline">
                        Hidden
                      </span>
                    )}
                  </div>

                  {/* Quick Edit/Delete Buttons */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
                    <button
                      onClick={(e) => handleOpenEdit(cat, e)}
                      className="p-1 sm:p-1.5 rounded-lg bg-white/90 text-stone-700 hover:text-stone-900 hover:bg-white shadow-xs transition-colors cursor-pointer"
                      title="Edit Category Details"
                    >
                      <Edit className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteCategory(cat, e)}
                      className="p-1 sm:p-1.5 rounded-lg bg-white/90 text-stone-700 hover:text-rose-600 hover:bg-white shadow-xs transition-colors cursor-pointer"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Category Info */}
                <div className="p-2.5 sm:p-4 flex flex-col flex-1 justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-xs sm:text-base text-stone-900 group-hover:text-stone-700 transition-colors line-clamp-1">
                      {cat.name}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-stone-500 line-clamp-1 sm:line-clamp-2 mt-0.5 leading-snug">
                      {cat.description || `${cat.product_count ?? 0} pieces in collection.`}
                    </p>
                  </div>

                  {/* Direct Action Buttons */}
                  <div className="pt-2 border-t border-stone-100 space-y-1 sm:space-y-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/admin/products/new?category_id=${cat.id}`);
                      }}
                      className="w-full py-1.5 sm:py-2 px-2 rounded-lg sm:rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-[10px] sm:text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                    >
                      <PackagePlus className="w-3 h-3" />
                      <span className="truncate">+ Add Product</span>
                    </button>

                    <div className="text-center text-[10px] sm:text-[11px] font-semibold text-stone-700 group-hover:underline truncate">
                      View All ({cat.product_count ?? 0}) →
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-6 animate-in zoom-in-95">
            <h2 className="text-lg font-bold font-serif text-stone-900 pb-3 border-b border-stone-100">
              {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Create New Category'}
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sofas, Dining Tables"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs focus:bg-white focus:outline-hidden focus:border-stone-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Category Cover Image
                </label>
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <label className="px-4 py-2.5 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-semibold cursor-pointer inline-flex items-center justify-center gap-2 shrink-0 shadow-xs transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingImage ? 'Uploading...' : 'Upload Image from Device'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                    </label>

                    <input
                      type="text"
                      placeholder="Or paste image URL (https://...)"
                      value={categoryForm.image_url}
                      onChange={(e) => setCategoryForm({ ...categoryForm, image_url: e.target.value })}
                      className="flex-1 p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  {categoryForm.image_url && (
                    <div className="relative rounded-2xl overflow-hidden border border-stone-200 bg-stone-50 p-2 flex items-center justify-center max-h-48">
                      <img
                        src={categoryForm.image_url}
                        alt="Category Preview"
                        className="max-h-40 w-auto object-contain rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setCategoryForm({ ...categoryForm, image_url: '' })}
                        className="absolute top-3 right-3 p-1.5 rounded-full bg-stone-900/70 hover:bg-stone-900 text-white shadow-md transition-colors cursor-pointer"
                        title="Remove Image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief description of this furniture collection..."
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={categoryForm.display_order}
                    onChange={(e) =>
                      setCategoryForm({ ...categoryForm, display_order: parseInt(e.target.value) || 0 })
                    }
                    className="w-full p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Visibility
                  </label>
                  <select
                    value={categoryForm.is_active ? 'true' : 'false'}
                    onChange={(e) =>
                      setCategoryForm({ ...categoryForm, is_active: e.target.value === 'true' })
                    }
                    className="w-full p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs"
                  >
                    <option value="true">Active (Visible)</option>
                    <option value="false">Hidden</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-xs font-semibold cursor-pointer"
                >
                  {saving ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
