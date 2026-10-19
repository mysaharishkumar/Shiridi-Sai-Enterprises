import React, { useState, useEffect } from 'react';
import { Settings, Save, Upload, Sparkles, ShieldCheck, Phone, Mail, MapPin } from 'lucide-react';
import { SiteSettings } from '../../types';
import { adminApi } from '../../api/client';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';

export const AdminSettingsPage: React.FC = () => {
  const { refreshSettings } = useStore();
  const { success, error: toastError } = useToast();

  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    adminApi
      .getSettings()
      .then(setSettings)
      .catch((err) => toastError(err.message || 'Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const res = await adminApi.uploadImage(file);
      setSettings((prev) => (prev ? { ...prev, logo_url: res.url } : null));
      success('Logo image uploaded');
    } catch (err: any) {
      toastError(err.message || 'Logo upload failed');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    try {
      const updated = await adminApi.updateSettings(settings);
      setSettings(updated);
      await refreshSettings();
      success('Store settings successfully updated and live across the website!');
    } catch (err: any) {
      toastError(err.message || 'Failed to update store settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="p-8 text-center text-stone-500 animate-pulse">
        Loading store configuration...
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 tracking-tight">
          Store Settings & Customization
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Customize brand name, logo, shipping rules, cash on delivery, and customer policies.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* 1. General Branding */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold font-serif text-stone-900 uppercase tracking-wider pb-2 border-b border-stone-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-stone-700" />
            1. Business Branding & Logo
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                Store Name *
              </label>
              <input
                type="text"
                required
                value={settings.store_name}
                onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
                className="w-full p-2.5 bg-stone-50 rounded-xl border border-stone-200 font-bold text-stone-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                Store Tagline
              </label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full p-2.5 bg-stone-50 rounded-xl border border-stone-200 focus:bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                Brand Logo (Optional - falls back to handcrafted icon logo)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={settings.logo_url || ''}
                  onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
                  placeholder="Logo Image URL"
                  className="flex-1 p-2 bg-stone-50 rounded-xl border border-stone-200"
                />
                <label className="px-3 py-2 rounded-xl bg-stone-800 text-white font-semibold cursor-pointer hover:bg-stone-900 text-xs inline-flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Logo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    disabled={uploadingLogo}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Contact Information */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold font-serif text-stone-900 uppercase tracking-wider pb-2 border-b border-stone-100 flex items-center gap-2">
            <Phone className="w-4 h-4 text-stone-700" />
            2. Contact & Showroom Address
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                Support Helpline Phone *
              </label>
              <input
                type="text"
                required
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full p-2.5 bg-stone-50 rounded-xl border border-stone-200 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                WhatsApp Business Number
              </label>
              <input
                type="text"
                value={settings.whatsapp_number}
                onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                className="w-full p-2.5 bg-stone-50 rounded-xl border border-stone-200 focus:bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                Support Email Address *
              </label>
              <input
                type="email"
                required
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full p-2.5 bg-stone-50 rounded-xl border border-stone-200 focus:bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                Physical Showroom Address *
              </label>
              <textarea
                rows={2}
                required
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full p-2.5 bg-stone-50 rounded-xl border border-stone-200 focus:bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                Google Maps Location URL (Showroom Directions)
              </label>
              <input
                type="text"
                value={settings.google_maps_url || ''}
                onChange={(e) => setSettings({ ...settings, google_maps_url: e.target.value })}
                placeholder="https://maps.app.goo.gl/..."
                className="w-full p-2.5 bg-stone-50 rounded-xl border border-stone-200 focus:bg-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* 3. Policies & Customer Information */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold font-serif text-stone-900 uppercase tracking-wider pb-2 border-b border-stone-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-stone-700" />
            3. Policies & Store Content
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                About Shiridi Sai Enterprises (Homepage / Footer summary)
              </label>
              <textarea
                rows={3}
                value={settings.about_us}
                onChange={(e) => setSettings({ ...settings, about_us: e.target.value })}
                className="w-full p-2.5 bg-stone-50 rounded-xl border border-stone-200 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                Delivery & Assembly Information
              </label>
              <textarea
                rows={2}
                value={settings.delivery_info}
                onChange={(e) => setSettings({ ...settings, delivery_info: e.target.value })}
                className="w-full p-2.5 bg-stone-50 rounded-xl border border-stone-200 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                Returns & Cancellation Policy
              </label>
              <textarea
                rows={2}
                value={settings.return_policy}
                onChange={(e) => setSettings({ ...settings, return_policy: e.target.value })}
                className="w-full p-2.5 bg-stone-50 rounded-xl border border-stone-200 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                Terms of Service & Warranty Policy
              </label>
              <textarea
                rows={2}
                value={settings.terms_and_conditions}
                onChange={(e) =>
                  setSettings({ ...settings, terms_and_conditions: e.target.value })
                }
                className="w-full p-2.5 bg-stone-50 rounded-xl border border-stone-200 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4 border-t border-stone-200">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 rounded-2xl bg-stone-800 hover:bg-stone-900 active:scale-98 text-white font-bold text-xs tracking-wider uppercase shadow-lg shadow-stone-950/20 cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Updating Store Settings...' : 'Save All Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
