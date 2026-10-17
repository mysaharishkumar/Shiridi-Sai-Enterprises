import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon, Plus, Edit, Trash2, Upload,
  Sparkles, ArrowRight, Eye, CheckCircle2, ArrowUpDown
} from 'lucide-react';
import { Banner } from '../../types';
import { adminApi } from '../../api/client';
import { useToast } from '../../context/ToastContext';

export const AdminBannersPage: React.FC = () => {
  const { success, error: toastError } = useToast();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [bannerForm, setBannerForm] = useState({
    title: '',
    subtitle: '',
    badge_text: 'Festive Offer',
    image_url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=80',
    mobile_image_url: '',
    cta_text: 'Shop Now',
    link_url: '/category/sofas',
    display_order: 0,
    is_active: true
  });
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getBanners();
      setBanners(data);
    } catch (err: any) {
      toastError(err.message || 'Failed to fetch banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleOpenCreate = () => {
    setEditingBanner(null);
    setBannerForm({
      title: '',
      subtitle: '',
      badge_text: 'Festive Offer',
      image_url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=80',
      mobile_image_url: '',
      cta_text: 'Shop Now',
      link_url: '/category/sofas',
      display_order: banners.length + 1,
      is_active: true
    });
    setShowModal(true);
  };

  const handleOpenEdit = (b: Banner) => {
    setEditingBanner(b);
    setBannerForm({
      title: b.title,
      subtitle: b.subtitle || '',
      badge_text: b.badge_text || '',
      image_url: b.image_url,
      mobile_image_url: b.mobile_image_url || '',
      cta_text: b.cta_text || 'Shop Now',
      link_url: b.link_url || '/products',
      display_order: b.display_order,
      is_active: b.is_active
    });
    setShowModal(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const res = await adminApi.uploadImage(file);
      setBannerForm((prev) => ({ ...prev, image_url: res.url }));
      success('Banner promotional image uploaded');
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
      if (editingBanner) {
        await adminApi.updateBanner(editingBanner.id, bannerForm);
        success(`Banner '${bannerForm.title}' updated`);
      } else {
        await adminApi.createBanner(bannerForm);
        success(`Banner '${bannerForm.title}' created`);
      }
      setShowModal(false);
      fetchBanners();
    } catch (err: any) {
      toastError(err.message || 'Failed to save banner');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (b: Banner) => {
    if (!window.confirm(`Are you sure you want to delete banner '${b.title}'?`)) return;
    try {
      await adminApi.deleteBanner(b.id);
      success(`Banner deleted`);
      fetchBanners();
    } catch (err: any) {
      toastError(err.message || 'Failed to delete banner');
    }
  };

  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 tracking-tight">
            Promotional Banner & Offer Carousel
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Control the hero promotional offers on the public homepage without modifying code.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs tracking-wide shadow-md transition-all active:scale-95 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Promotional Banner</span>
        </button>
      </div>

      {/* Banners Grid / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 py-12 text-center text-stone-400">Loading banners...</div>
        ) : banners.length > 0 ? (
          banners.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs flex flex-col justify-between"
            >
              {/* Preview Thumbnail */}
              <div className="relative aspect-21/9 bg-stone-950 overflow-hidden group">
                <img src={b.image_url} alt={b.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-stone-950/20" />
                
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-stone-900/90 text-white font-mono text-[10px] font-bold">
                    Order #{b.display_order}
                  </span>
                  {b.badge_text && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/90 text-stone-950 font-bold text-[10px]">
                      {b.badge_text}
                    </span>
                  )}
                </div>

                <div className="absolute top-3 right-3">
                  {b.is_active ? (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-white font-bold text-[10px]">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-stone-600 text-white font-bold text-[10px]">
                      Hidden
                    </span>
                  )}
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="font-bold text-sm sm:text-base font-serif drop-shadow-md line-clamp-1">
                    {b.title}
                  </h3>
                </div>
              </div>

              {/* Banner Details & Action Buttons */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                <p className="text-xs text-stone-600 line-clamp-2">{b.subtitle || 'No subtitle text'}</p>

                <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                  <div className="text-stone-500">
                    CTA: <strong className="text-stone-800">{b.cta_text || 'Shop Now'}</strong> →{' '}
                    <span className="text-stone-400 font-mono">{b.link_url}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(b)}
                      className="p-1.5 text-stone-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg cursor-pointer"
                      title="Edit Banner"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(b)}
                      className="p-1.5 text-stone-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                      title="Delete Banner"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 p-12 text-center bg-white rounded-3xl border border-stone-200">
            <p className="text-stone-500 text-xs">No banners created yet.</p>
          </div>
        )}
      </div>

      {/* Banner Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-6 animate-in zoom-in-95">
            <h2 className="text-lg font-bold font-serif text-stone-900 pb-3 border-b border-stone-100">
              {editingBanner ? `Edit Banner: ${editingBanner.title}` : 'Add Promotional Banner'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Banner Headline *
                </label>
                <input
                  type="text"
                  required
                  value={bannerForm.title}
                  onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                  placeholder="e.g. Royal Teak Living Room Collection"
                  className="w-full p-2.5 bg-stone-50 rounded-xl border border-stone-200 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Subtitle / Offer Details
                </label>
                <textarea
                  rows={2}
                  value={bannerForm.subtitle}
                  onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                  placeholder="e.g. Save up to 40% on handcrafted Burma Teak sofas + Free Delivery."
                  className="w-full p-2.5 bg-stone-50 rounded-xl border border-stone-200 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Badge Text
                  </label>
                  <input
                    type="text"
                    value={bannerForm.badge_text}
                    onChange={(e) => setBannerForm({ ...bannerForm, badge_text: e.target.value })}
                    placeholder="Festive Offer"
                    className="w-full p-2 bg-stone-50 rounded-xl border border-stone-200 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                    CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={bannerForm.cta_text}
                    onChange={(e) => setBannerForm({ ...bannerForm, cta_text: e.target.value })}
                    placeholder="Explore Sofas"
                    className="w-full p-2 bg-stone-50 rounded-xl border border-stone-200 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Target Link URL
                </label>
                <input
                  type="text"
                  value={bannerForm.link_url}
                  onChange={(e) => setBannerForm({ ...bannerForm, link_url: e.target.value })}
                  placeholder="/category/sofas or /product/slug"
                  className="w-full p-2.5 bg-stone-50 rounded-xl border border-stone-200 focus:bg-white font-mono"
                />
              </div>

              {/* Promotional Image URL / Upload */}
              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Promotional Banner Photography
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    required
                    value={bannerForm.image_url}
                    onChange={(e) => setBannerForm({ ...bannerForm, image_url: e.target.value })}
                    placeholder="Banner Image URL"
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
                {bannerForm.image_url && (
                  <img
                    src={bannerForm.image_url}
                    alt=""
                    className="w-full h-24 object-cover rounded-xl border border-stone-200"
                  />
                )}
              </div>

              {/* Display Order & Active */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Display Order (Priority)
                  </label>
                  <input
                    type="number"
                    value={bannerForm.display_order}
                    onChange={(e) =>
                      setBannerForm({ ...bannerForm, display_order: Number(e.target.value) })
                    }
                    className="w-full p-2 bg-stone-50 rounded-xl border border-stone-200 font-mono"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-800">
                    <input
                      type="checkbox"
                      checked={bannerForm.is_active}
                      onChange={(e) =>
                        setBannerForm({ ...bannerForm, is_active: e.target.checked })
                      }
                      className="w-4 h-4 text-amber-700 rounded"
                    />
                    <span>Active on Homepage</span>
                  </label>
                </div>
              </div>

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
                  {saving ? 'Saving...' : 'Save Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
