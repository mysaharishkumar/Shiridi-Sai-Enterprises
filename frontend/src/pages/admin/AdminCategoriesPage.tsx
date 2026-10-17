import React, { useState, useEffect } from 'react';
import {
  FolderTree, Plus, Edit, Trash2, CheckCircle2, XCircle,
  Upload, AlertTriangle, ArrowUpDown
} from 'lucide-react';
import { Category, Subcategory } from '../../types';
import { adminApi } from '../../api/client';
import { useToast } from '../../context/ToastContext';

export const AdminCategoriesPage: React.FC = () => {
  const { success, error: toastError } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleRemoveSubcategory = (idx: number) => {
    setSubcategories(subcategories.filter((_, i) => i !== idx));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const res = await adminApi.uploadImage(file);
      setCategoryForm((prev) => ({ ...prev, image_url: res.url }));
      success('Image uploaded');
    } catch (err: any) {
      toastError(err.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...categoryForm,
        subcategories
      };

      if (editingCategory) {
        await adminApi.updateCategory(editingCategory.id, payload);
        success(`Category '${categoryForm.name}' updated`);
      } else {
        await adminApi.createCategory(payload);
        success(`Category '${categoryForm.name}' created`);
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
    if (cat.product_count && cat.product_count > 0) {
      toastError(
        `Cannot delete '${cat.name}' because it contains ${cat.product_count} active products. Reassign or delete those products first.`
      );
      return;
    }

    if (!window.confirm(`Are you sure you want to permanently delete category '${cat.name}'?`)) {
      return;
    }

    try {
      await adminApi.deleteCategory(cat.id);
      success(`Category '${cat.name}' deleted`);
      fetchCategories();
    } catch (err: any) {
      toastError(err.message || 'Failed to delete category');
    }
  };

  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 tracking-tight">
            Furniture Category Management
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Organize customer navigation, subcategories, banner images and display priorities.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs tracking-wide shadow-md transition-all active:scale-95 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Categories Cards & Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-stone-50/80 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Order</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-3">Slug</th>
                <th className="py-3.5 px-3 text-center">Products</th>
                <th className="py-3.5 px-3">Subcategories</th>
                <th className="py-3.5 px-3 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stone-400">
                    Loading categories...
                  </td>
                </tr>
              ) : categories.length > 0 ? (
                categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-stone-700">
                      #{cat.display_order}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            cat.image_url ||
                            'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=100&q=80'
                          }
                          alt=""
                          className="w-12 h-10 object-cover rounded-xl border border-stone-200 shrink-0"
                        />
                        <div>
                          <span className="font-bold text-stone-900 block">{cat.name}</span>
                          <span className="text-[11px] text-stone-400 line-clamp-1 max-w-xs">
                            {cat.description || 'No description provided'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono text-stone-500">
                      {cat.slug}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className="font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 text-xs">
                        {cat.product_count ?? 0}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      {cat.subcategories && cat.subcategories.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {cat.subcategories.slice(0, 3).map((sub, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[10px]"
                            >
                              {sub.name}
                            </span>
                          ))}
                          {cat.subcategories.length > 3 && (
                            <span className="text-[10px] text-stone-400">
                              +{cat.subcategories.length - 3}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-stone-400 italic">None</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center">
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
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(cat)}
                          className="p-1.5 text-stone-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg cursor-pointer"
                          title="Edit Category"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(cat)}
                          className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stone-400">
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-6 animate-in zoom-in-95">
            <h2 className="text-lg font-bold font-serif text-stone-900 pb-3 border-b border-stone-100">
              {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Create New Category'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="e.g. Dining Tables"
                  className="w-full p-2.5 bg-stone-50 rounded-xl border border-stone-200 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                  URL Slug (Optional - auto generated if empty)
                </label>
                <input
                  type="text"
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                  placeholder="e.g. dining-tables"
                  className="w-full p-2.5 bg-stone-50 rounded-xl border border-stone-200 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  placeholder="Summary for category header..."
                  className="w-full p-2.5 bg-stone-50 rounded-xl border border-stone-200 focus:bg-white focus:outline-hidden"
                />
              </div>

              {/* Image URL and Upload */}
              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Category Photography Image
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={categoryForm.image_url}
                    onChange={(e) => setCategoryForm({ ...categoryForm, image_url: e.target.value })}
                    placeholder="Image URL"
                    className="flex-1 p-2 bg-stone-50 rounded-xl border border-stone-200"
                  />
                  <label className="px-3 py-2 rounded-xl bg-amber-800 text-white font-semibold cursor-pointer hover:bg-amber-900 inline-flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
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
                  <img
                    src={categoryForm.image_url}
                    alt=""
                    className="w-24 h-16 object-cover rounded-xl border border-stone-200"
                  />
                )}
              </div>

              {/* Subcategories */}
              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Subcategories
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="e.g. 6-Seater Dining Sets"
                    value={subName}
                    onChange={(e) => setSubName(e.target.value)}
                    className="flex-1 p-2 bg-stone-50 rounded-xl border border-stone-200"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubcategory}
                    className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 font-bold"
                  >
                    + Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {subcategories.map((s, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 text-stone-800 text-[11px]"
                    >
                      <span>{s.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubcategory(i)}
                        className="text-stone-400 hover:text-rose-600 font-bold ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Display Order & Active */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Display Order (Priority)
                  </label>
                  <input
                    type="number"
                    value={categoryForm.display_order}
                    onChange={(e) =>
                      setCategoryForm({ ...categoryForm, display_order: Number(e.target.value) })
                    }
                    className="w-full p-2 bg-stone-50 rounded-xl border border-stone-200 font-mono"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-800">
                    <input
                      type="checkbox"
                      checked={categoryForm.is_active}
                      onChange={(e) =>
                        setCategoryForm({ ...categoryForm, is_active: e.target.checked })
                      }
                      className="w-4 h-4 text-amber-700 rounded"
                    />
                    <span>Active in Storefront</span>
                  </label>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold"
                >
                  {saving ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
