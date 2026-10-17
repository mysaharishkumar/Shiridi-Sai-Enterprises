import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FolderTree, Plus, Edit, Trash2, Upload, LayoutGrid, List,
  Eye, PackagePlus, Search, ArrowRight, CheckCircle2, XCircle
} from 'lucide-react';
import { Category, Subcategory } from '../../types';
import { adminApi } from '../../api/client';
import { useToast } from '../../context/ToastContext';

export const AdminCategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modal State
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
  const [subName, setSubName] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getCategories();
      setCategories(data);
    } catch (err: any) {
      toastError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

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

  const handleOpenEdit = (cat: Category) => {
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

  const handleAddSubcategory = () => {
    if (!subName.trim()) return;
    const slug = subName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setSubcategories([...subcategories, { name: subName.trim(), slug }]);
    setSubName('');
  };

  const handleRemoveSubcategory = (index: number) => {
    setSubcategories(subcategories.filter((_, i) => i !== index));
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

  const handleDelete = async (cat: Category) => {
    if (confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
      try {
        await adminApi.deleteCategory(cat.id);
        success('Category deleted');
        fetchCategories();
      } catch (err: any) {
        toastError(err.message || 'Failed to delete category');
      }
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-stone-900 flex items-center gap-2.5">
            <FolderTree className="w-6 h-6 text-amber-700" />
            Category Showcase & Product Adder
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Browse furniture categories visually (same as customer store), manage catalog photos, and add products with 1 click.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View mode toggle */}
          <div className="inline-flex rounded-xl border border-stone-200 bg-white p-1 shadow-xs">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-amber-800 text-white'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              title="Visual Grid View (Like Customer Storefront)"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Visual Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-amber-800 text-white'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Table List</span>
            </button>
          </div>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Category</span>
          </button>
        </div>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-stone-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search category name..."
            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:bg-white focus:outline-hidden focus:border-amber-600"
          />
        </div>

        <div className="text-xs text-stone-500 font-medium">
          Showing <span className="text-stone-900 font-bold">{filteredCategories.length}</span> of{' '}
          <span className="text-stone-900 font-bold">{categories.length}</span> categories
        </div>
      </div>

      {/* VISUAL CARDS GRID (Requested by user: same like customer page) */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Create New Category Card shortcut */}
          <div
            onClick={handleOpenCreate}
            className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-stone-300 hover:border-amber-600 bg-stone-50/50 hover:bg-amber-50/30 transition-all cursor-pointer min-h-[280px] group text-center"
          >
            <div className="w-14 h-14 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-400 group-hover:text-amber-800 group-hover:scale-110 shadow-sm transition-all mb-3">
              <Plus className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-sm text-stone-900 group-hover:text-amber-900">
              Add New Category
            </h3>
            <p className="text-xs text-stone-500 max-w-xs mt-1">
              Create a new category card with title and photo.
            </p>
          </div>

          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              className="group relative flex flex-col rounded-2xl bg-white border border-stone-200 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              {/* Category Image */}
              <div className="relative aspect-4/3 w-full bg-stone-100 overflow-hidden">
                <img
                  src={
                    cat.image_url ||
                    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80'
                  }
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Status and count badges */}
                <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-stone-900/80 backdrop-blur-xs text-white text-[10px] font-bold">
                    {cat.product_count ?? 0} Products
                  </span>
                  {cat.is_active ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-700 text-white text-[10px] font-semibold">
                      Live
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-stone-600 text-white text-[10px] font-semibold">
                      Hidden
                    </span>
                  )}
                </div>

                {/* Edit & Delete Action icons on image hover */}
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1 z-10">
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="p-1.5 rounded-lg bg-white/90 text-stone-700 hover:text-amber-800 hover:bg-white shadow-sm transition-colors cursor-pointer"
                    title="Edit Category Details"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat)}
                    className="p-1.5 rounded-lg bg-white/90 text-stone-700 hover:text-rose-600 hover:bg-white shadow-sm transition-colors cursor-pointer"
                    title="Delete Category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Category Info */}
              <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                <div>
                  <h3 className="font-bold text-base text-stone-900 group-hover:text-amber-900 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-stone-500 line-clamp-2 mt-1 leading-relaxed">
                    {cat.description || 'No description provided.'}
                  </p>
                </div>

                {/* DIRECT ACTION BUTTONS: Add Product or View Products */}
                <div className="pt-3 border-t border-stone-100 space-y-2">
                  {/* 1-Click "Add Product to this Category" */}
                  <button
                    type="button"
                    onClick={() => navigate(`/admin/products/new?category_id=${cat.id}`)}
                    className="w-full py-2.5 px-3 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <PackagePlus className="w-4 h-4" />
                    <span>➕ Add Product to this Category</span>
                  </button>

                  {/* View Products */}
                  <Link
                    to={`/admin/products?category_id=${cat.id}`}
                    className="w-full py-1.5 px-3 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1 text-center"
                  >
                    <span>View All {cat.name} Products</span>
                    <ArrowRight className="w-3 h-3 text-stone-400" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TABLE LIST VIEW (Optional alternate view) */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-200">
                <tr>
                  <th className="py-3.5 px-4">Order</th>
                  <th className="py-3.5 px-4">Category Name & Photo</th>
                  <th className="py-3.5 px-3">Products</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-4 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono text-stone-400">
                      {cat.display_order}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={cat.image_url || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=100&q=80'}
                          alt=""
                          className="w-12 h-10 object-cover rounded-xl border border-stone-200 shrink-0"
                        />
                        <div>
                          <span className="font-bold text-stone-900 block text-sm">{cat.name}</span>
                          <span className="text-[11px] text-stone-400 line-clamp-1">{cat.description}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 text-xs">
                        {cat.product_count ?? 0}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {cat.is_active ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[10px] border border-emerald-200">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 font-semibold text-[10px]">
                          Hidden
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/admin/products/new?category_id=${cat.id}`)}
                          className="px-2.5 py-1 rounded-lg bg-amber-800 text-white font-semibold text-xs flex items-center gap-1 hover:bg-amber-900 cursor-pointer"
                        >
                          <PackagePlus className="w-3.5 h-3.5" />
                          <span>Add Product</span>
                        </button>
                        <button
                          onClick={() => handleOpenEdit(cat)}
                          className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg cursor-pointer"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat)}
                          className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                  placeholder="e.g. Solid Teak Dining Tables"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs focus:bg-white focus:outline-hidden focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Category Cover Image
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="Image URL or upload below..."
                      value={categoryForm.image_url}
                      onChange={(e) => setCategoryForm({ ...categoryForm, image_url: e.target.value })}
                      className="flex-1 p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs focus:bg-white focus:outline-hidden"
                    />
                    <label className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1.5 shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingImage ? 'Uploading...' : 'Upload'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                    </label>
                  </div>

                  {categoryForm.image_url && (
                    <div className="relative aspect-16/9 rounded-xl overflow-hidden border border-stone-200 max-h-36">
                      <img
                        src={categoryForm.image_url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
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
                    Store Visibility
                  </label>
                  <select
                    value={categoryForm.is_active ? 'true' : 'false'}
                    onChange={(e) =>
                      setCategoryForm({ ...categoryForm, is_active: e.target.value === 'true' })
                    }
                    className="w-full p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs"
                  >
                    <option value="true">Active (Visible)</option>
                    <option value="false">Hidden (Draft)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold"
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
