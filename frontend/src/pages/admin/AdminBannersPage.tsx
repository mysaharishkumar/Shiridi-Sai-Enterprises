import React, { useState, useEffect } from 'react';
import {
  Plus, Edit, Trash2, Upload, ExternalLink, Image as ImageIcon
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
    image_url: '',
    link_url: '',
    display_order: 1,
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
      image_url: '',
      link_url: '',
      display_order: banners.length + 1,
      is_active: true
    });
    setShowModal(true);
  };

  const handleOpenEdit = (b: Banner) => {
    setEditingBanner(b);
    setBannerForm({
      image_url: b.image_url,
      link_url: b.link_url || '',
      display_order: b.display_order,
      is_active: b.is_active ?? true
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
    if (!bannerForm.image_url) {
      toastError('Please upload or specify a banner image');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: editingBanner?.title || `Offer Banner #${bannerForm.display_order}`,
        subtitle: '',
        badge_text: '',
        cta_text: 'Shop Now',
        image_url: bannerForm.image_url,
        link_url: bannerForm.link_url,
        display_order: bannerForm.display_order,
        is_active: bannerForm.is_active
      };

      if (editingBanner) {
        await adminApi.updateBanner(editingBanner.id, payload);
        success(`Banner #${bannerForm.display_order} updated`);
      } else {
        await adminApi.createBanner(payload);
        success(`Banner #${bannerForm.display_order} created`);
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
    if (!window.confirm(`Are you sure you want to delete banner #${b.display_order}?`)) return;
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
            Promotional Offers & Banners
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Manage your promotional banners, hero offers, and link destinations.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs tracking-wide shadow-md transition-all active:scale-95 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Offer Banner</span>
        </button>
      </div>

      {/* Banners Grid */}
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
                <img
                  src={b.image_url}
                  alt={b.title || 'Promotional Banner'}
                  className="w-full h-full object-cover"
                />

                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-stone-900/90 text-white font-mono text-[11px] font-bold shadow-xs">
                    Display Order: #{b.display_order}
                  </span>
                </div>

                <div className="absolute top-3 right-3">
                  {b.is_active ? (
                    <span className="px-2.5 py-1 rounded-md bg-emerald-600 text-white font-bold text-[10px] shadow-xs">
                      Active
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-md bg-stone-600 text-white font-bold text-[10px] shadow-xs">
                      Hidden
                    </span>
                  )}
                </div>
              </div>

              {/* Banner Details & Action Buttons */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="flex items-center gap-2 text-xs text-stone-600">
                  <ExternalLink className="w-4 h-4 text-stone-400 shrink-0" />
                  <span className="font-semibold text-stone-700">Target Link:</span>
                  {b.link_url && b.link_url.trim() ? (
                    <span className="text-stone-900 font-mono font-medium truncate">
                      {b.link_url}
                    </span>
                  ) : (
                    <span className="text-stone-400 italic">None (Display only, no link)</span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-stone-100 text-xs">
                  <span className="text-[11px] text-stone-400">
                    Order #{b.display_order}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(b)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-lg cursor-pointer font-medium"
                      title="Edit Banner"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(b)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg cursor-pointer font-medium"
                      title="Delete Banner"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 p-12 text-center bg-white rounded-3xl border border-stone-200">
            <ImageIcon className="w-12 h-12 text-stone-300 mx-auto mb-2" />
            <p className="text-stone-500 text-xs">No promotional banners created yet.</p>
          </div>
        )}
      </div>

      {/* Banner Create / Edit Modal (Only: Image, Target Link URL, Display Order) */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-6 animate-in zoom-in-95">
            <h2 className="text-lg font-bold font-serif text-stone-900 pb-3 border-b border-stone-100">
              {editingBanner ? `Edit Offer Banner #${editingBanner.display_order}` : 'Add Promotional Offer Banner'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              {/* 1. Promotional Banner Image */}
              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Promotional Banner Image *
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    required
                    value={bannerForm.image_url}
                    onChange={(e) => setBannerForm({ ...bannerForm, image_url: e.target.value })}
                    placeholder="Paste Image URL or click Upload"
                    className="flex-1 p-2.5 bg-stone-50 rounded-xl border border-stone-200 focus:bg-white focus:outline-hidden"
                  />
                  <label className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-900 text-white font-semibold cursor-pointer inline-flex items-center gap-1.5 shrink-0 shadow-sm transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
                </div>
                {uploadingImage && (
                  <p className="text-stone-500 italic pb-1">Uploading banner image...</p>
                )}
                {bannerForm.image_url ? (
                  <div className="relative rounded-2xl overflow-hidden border border-stone-200 bg-stone-950 aspect-21/9">
                    <img
                      src={bannerForm.image_url}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="rounded-2xl border-2 border-dashed border-stone-200 p-6 text-center text-stone-400 bg-stone-50">
                    <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                    <span>Upload or paste image URL above</span>
                  </div>
                )}
              </div>

              {/* 2. Target Link URL (Optional) */}
              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Target Link URL (Optional)
                </label>
                <input
                  type="text"
                  value={bannerForm.link_url}
                  onChange={(e) => setBannerForm({ ...bannerForm, link_url: e.target.value })}
                  placeholder="Optional: e.g. /category/sofas (leave blank if no link)"
                  className="w-full p-2.5 bg-stone-50 rounded-xl border border-stone-200 focus:bg-white focus:outline-hidden font-mono"
                />
                <p className="text-[11px] text-stone-400 mt-1">
                  Optional. If a link is provided, clicking the banner will open this URL. If left blank, clicking the banner does nothing.
                </p>
              </div>

              {/* 3. Display Order */}
              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Display Order *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={bannerForm.display_order}
                  onChange={(e) =>
                    setBannerForm({ ...bannerForm, display_order: Number(e.target.value) })
                  }
                  className="w-full p-2.5 bg-stone-50 rounded-xl border border-stone-200 focus:bg-white focus:outline-hidden font-mono"
                />
                <p className="text-[11px] text-stone-400 mt-1">
                  1 appears first, 2 appears second, etc.
                </p>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 font-semibold hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingImage}
                  className="px-6 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-900 text-white font-bold cursor-pointer disabled:opacity-50 shadow-sm"
                >
                  {saving ? 'Saving...' : 'Save Offer Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
