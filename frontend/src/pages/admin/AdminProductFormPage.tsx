import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Upload, Trash2, Plus, Star, Check, AlertCircle,
  Eye, Image as ImageIcon, Sparkles, IndianRupee, Palette, Info, CheckCircle2
} from 'lucide-react';
import { Product, Category, ProductImage, ProductColor, ProductVariant, ProductSpecification } from '../../types';
import { adminApi } from '../../api/client';
import { useToast } from '../../context/ToastContext';

export const AdminProductFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const categoryIdParam = searchParams.get('category_id');

  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const isEditing = Boolean(id);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingColorIdx, setUploadingColorIdx] = useState<number | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    category_id: categoryIdParam || '',
    selling_price: 18999,
    original_price: 24999,
    sku: '',
    brand: 'Shiridi Sai Enterprises',
    material: '100% Solid Burma Teak Wood',
    finish: 'Honey Teak Satin Polish',
    total_stock: 10,
    dimensions_length: 180,
    dimensions_width: 90,
    dimensions_height: 75,
    dimensions_unit: 'cm',
    warranty_info: '5 Years Manufacturer Warranty against Wood Borer & Termite',
    is_featured: false,
    is_best_seller: false,
    is_new_arrival: false,
    is_published: true
  });

  // General Image Gallery
  const [images, setImages] = useState<ProductImage[]>([
    {
      url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=80',
      alt: 'Main View',
      is_primary: true
    }
  ]);

  // Colors with Color-Specific Photos (Requested by user)
  const [colors, setColors] = useState<ProductColor[]>([
    {
      name: 'Honey Teak Finish',
      hex_code: '#8B4513',
      image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Dark Walnut Polish',
      hex_code: '#3E2723',
      image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80'
    }
  ]);

  // Key Features list
  const [features, setFeatures] = useState<string[]>([
    '100% Grade-A kiln seasoned solid wood timber',
    'Generational heirloom durability with traditional tenon & mortise joinery',
    'Treated for borer & termite immunity'
  ]);
  const [newFeatureText, setNewFeatureText] = useState('');

  useEffect(() => {
    adminApi.getCategories().then((cats) => {
      setCategories(cats);
      if (!isEditing && !formData.category_id && cats.length > 0) {
        setFormData((prev) => ({ ...prev, category_id: categoryIdParam || cats[0].id }));
      }
    });

    if (isEditing && id) {
      adminApi
        .getProduct(id)
        .then((prod) => {
          setFormData({
            name: prod.name,
            slug: prod.slug,
            description: prod.description,
            category_id: prod.category_id,
            selling_price: prod.selling_price,
            original_price: prod.original_price || prod.selling_price,
            sku: prod.sku || '',
            brand: prod.brand || 'Shiridi Sai Enterprises',
            material: prod.material || '',
            finish: prod.finish || '',
            total_stock: prod.total_stock,
            dimensions_length: prod.dimensions?.length || 180,
            dimensions_width: prod.dimensions?.width || 90,
            dimensions_height: prod.dimensions?.height || 75,
            dimensions_unit: prod.dimensions?.unit || 'cm',
            warranty_info: prod.warranty_info || '',
            is_featured: prod.is_featured,
            is_best_seller: prod.is_best_seller,
            is_new_arrival: prod.is_new_arrival,
            is_published: prod.is_published
          });
          if (prod.images && prod.images.length > 0) setImages(prod.images);
          if (prod.colors && prod.colors.length > 0) setColors(prod.colors);
          if (prod.features && prod.features.length > 0) setFeatures(prod.features);
        })
        .catch((err) => toastError(err.message || 'Failed to load product'))
        .finally(() => setLoading(false));
    }
  }, [id, isEditing]);

  // Gallery image file upload
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const res = await adminApi.uploadImage(file);
      setImages((prev) => [
        ...prev,
        { url: res.url, alt: file.name, is_primary: prev.length === 0, public_id: res.public_id }
      ]);
      success('Product image uploaded');
    } catch (err: any) {
      toastError(err.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddImageUrl = () => {
    const url = prompt('Enter image URL:');
    if (url && url.trim()) {
      setImages((prev) => [
        ...prev,
        { url: url.trim(), alt: 'Product Image', is_primary: prev.length === 0 }
      ]);
    }
  };

  const setPrimaryImage = (index: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        is_primary: i === index
      }))
    );
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Color management with color-specific image upload
  const handleAddColor = () => {
    setColors((prev) => [
      ...prev,
      {
        name: `Color / Finish ${prev.length + 1}`,
        hex_code: '#8B4513',
        image_url: ''
      }
    ]);
  };

  const handleUpdateColor = (index: number, field: keyof ProductColor, value: any) => {
    setColors((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleColorImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingColorIdx(index);
    try {
      const res = await adminApi.uploadImage(file);
      handleUpdateColor(index, 'image_url', res.url);
      success(`Image uploaded for ${colors[index].name}`);
    } catch (err: any) {
      toastError(err.message || 'Color image upload failed');
    } finally {
      setUploadingColorIdx(null);
    }
  };

  const handleRemoveColor = (index: number) => {
    setColors((prev) => prev.filter((_, i) => i !== index));
  };

  // Feature bullet points
  const handleAddFeature = () => {
    if (!newFeatureText.trim()) return;
    setFeatures([...features, newFeatureText.trim()]);
    setNewFeatureText('');
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toastError('Please enter product title');
      return;
    }
    if (!formData.category_id) {
      toastError('Please select a category');
      return;
    }
    if (images.length === 0 && colors.every((c) => !c.image_url)) {
      toastError('Please add at least one product image');
      return;
    }

    const calculatedDiscount =
      formData.original_price > formData.selling_price
        ? Math.round(
            ((formData.original_price - formData.selling_price) / formData.original_price) * 100
          )
        : 0;

    const payload: any = {
      name: formData.name.trim(),
      slug:
        formData.slug.trim() ||
        formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      description: formData.description.trim(),
      category_id: formData.category_id,
      selling_price: Number(formData.selling_price),
      original_price: Number(formData.original_price),
      discount_percentage: calculatedDiscount,
      sku: formData.sku.trim() || undefined,
      brand: formData.brand.trim() || 'Shiridi Sai Enterprises',
      material: formData.material.trim(),
      finish: formData.finish.trim(),
      total_stock: Number(formData.total_stock) || 1,
      in_stock: Number(formData.total_stock) > 0,
      dimensions: {
        length: Number(formData.dimensions_length),
        width: Number(formData.dimensions_width),
        height: Number(formData.dimensions_height),
        unit: formData.dimensions_unit
      },
      warranty_info: formData.warranty_info.trim(),
      images,
      colors,
      features,
      is_featured: formData.is_featured,
      is_best_seller: formData.is_best_seller,
      is_new_arrival: formData.is_new_arrival,
      is_published: formData.is_published
    };

    setSubmitting(true);
    try {
      if (isEditing && id) {
        await adminApi.updateProduct(id, payload);
        success('Product updated successfully');
      } else {
        await adminApi.createProduct(payload);
        success('Product published to catalog successfully');
      }
      navigate('/admin/products');
    } catch (err: any) {
      toastError(err.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const discountSavings =
    formData.original_price > formData.selling_price
      ? formData.original_price - formData.selling_price
      : 0;
  const discountPercent =
    formData.original_price > formData.selling_price
      ? Math.round((discountSavings / formData.original_price) * 100)
      : 0;

  if (loading) {
    return (
      <div className="p-10 max-w-5xl mx-auto text-center animate-pulse space-y-4">
        <div className="h-8 bg-stone-200 rounded w-1/3 mx-auto" />
        <div className="h-64 bg-stone-200 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-5xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <Link
            to="/admin/products"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-amber-800 mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Products List
          </Link>
          <h1 className="text-2xl font-bold font-serif text-stone-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-700" />
            {isEditing ? `Edit Product: ${formData.name}` : 'Add Furniture Piece to Catalog'}
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-0.5">
            Set pricing, upload photos for each color finish, provide dimensions, and describe timber craftsmanship.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="px-6 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs tracking-wider uppercase shadow-md transition-all cursor-pointer disabled:opacity-50"
        >
          {submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Publish Product'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* SECTION 1: Basic Information & Category */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
          <h2 className="text-base font-bold font-serif text-stone-900 pb-3 border-b border-stone-100 flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-800" />
            1. Basic Information & Category
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Product Title / Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Royal Burma Teak 6-Seater Dining Table"
                className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 text-sm font-medium focus:bg-white focus:outline-hidden focus:border-amber-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Category *
              </label>
              <select
                required
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs focus:bg-white focus:outline-hidden focus:border-amber-600"
              >
                <option value="">-- Choose Category --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                SKU / Model Number
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="e.g. SSE-DT-6S-01"
                className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs focus:bg-white focus:outline-hidden"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Product Description & Information *
              </label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide detailed description of the design, wood seasoning, comfort, joints, and ideal living room setup..."
                className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs focus:bg-white focus:outline-hidden leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: Pricing (Original Price & Discount Price) */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
          <h2 className="text-base font-bold font-serif text-stone-900 pb-3 border-b border-stone-100 flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-amber-800" />
            2. Showroom Price & Discounts (Customer Price Showcase)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Original Price (M.R.P.) in ₹ *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-bold">₹</span>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.original_price}
                  onChange={(e) =>
                    setFormData({ ...formData, original_price: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full pl-8 pr-4 py-3 bg-stone-50 rounded-xl border border-stone-200 text-sm font-bold text-stone-900 focus:bg-white focus:outline-hidden"
                />
              </div>
              <p className="text-[11px] text-stone-400 mt-1">
                Display as strikethrough price to show customer savings.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Discount Price (Offer Price) in ₹ *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-bold">₹</span>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.selling_price}
                  onChange={(e) =>
                    setFormData({ ...formData, selling_price: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full pl-8 pr-4 py-3 bg-stone-50 rounded-xl border border-stone-200 text-sm font-bold text-amber-900 focus:bg-white focus:outline-hidden"
                />
              </div>
              <p className="text-[11px] text-stone-400 mt-1">
                Final price customers will see on the website.
              </p>
            </div>
          </div>

          {/* Live Discount Calculator Preview */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-amber-800 text-white flex items-center justify-center font-bold text-sm">
                %
              </span>
              <div>
                <span className="text-xs text-stone-600 block">Live Price Discovery Preview:</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-bold text-stone-900">
                    Offer: ₹{formData.selling_price.toLocaleString('en-IN')}
                  </span>
                  {formData.original_price > formData.selling_price && (
                    <span className="text-xs text-stone-400 line-through">
                      M.R.P. ₹{formData.original_price.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {discountSavings > 0 ? (
              <div className="text-right">
                <span className="inline-block px-3 py-1 rounded-full bg-emerald-600 text-white font-bold text-xs uppercase shadow-xs">
                  {discountPercent}% OFF
                </span>
                <span className="text-xs font-semibold text-emerald-800 block mt-0.5">
                  Customer Saves ₹{discountSavings.toLocaleString('en-IN')}
                </span>
              </div>
            ) : (
              <span className="text-xs text-stone-500 italic">No discount (Selling at full price)</span>
            )}
          </div>
        </div>

        {/* SECTION 3: Colors & Photos for EACH Color (Requested by user) */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
            <div>
              <h2 className="text-base font-bold font-serif text-stone-900 flex items-center gap-2">
                <Palette className="w-4 h-4 text-amber-800" />
                3. Color Finishes & Product Images for EACH Color
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Add each available wood polish/color and upload the exact photo showing that color.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddColor}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition-colors cursor-pointer self-start"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Another Color</span>
            </button>
          </div>

          <div className="space-y-4">
            {colors.map((color, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-stone-200 bg-stone-50/60 flex flex-col md:flex-row items-start md:items-center gap-4 transition-all"
              >
                {/* Color preview photo */}
                <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-stone-200 border border-stone-300 shrink-0">
                  {color.image_url ? (
                    <img
                      src={color.image_url}
                      alt={color.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 text-[10px] text-center p-1">
                      <ImageIcon className="w-5 h-5 mb-0.5 opacity-60" />
                      <span>No photo</span>
                    </div>
                  )}
                  <span
                    style={{ backgroundColor: color.hex_code || '#78350F' }}
                    className="absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white shadow-xs"
                    title={`Swatch: ${color.hex_code}`}
                  />
                </div>

                {/* Color Inputs */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                      Color / Polish Name
                    </label>
                    <input
                      type="text"
                      value={color.name}
                      onChange={(e) => handleUpdateColor(idx, 'name', e.target.value)}
                      placeholder="e.g. Honey Teak, Royal Walnut"
                      className="w-full p-2.5 bg-white rounded-xl border border-stone-200 text-xs font-semibold focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                      Swatch Dot Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={color.hex_code || '#78350F'}
                        onChange={(e) => handleUpdateColor(idx, 'hex_code', e.target.value)}
                        className="w-9 h-9 p-0.5 rounded-lg border border-stone-300 cursor-pointer bg-white"
                      />
                      <input
                        type="text"
                        value={color.hex_code || '#78350F'}
                        onChange={(e) => handleUpdateColor(idx, 'hex_code', e.target.value)}
                        className="flex-1 p-2 bg-white rounded-xl border border-stone-200 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                      Color Photo (Upload / URL)
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="url"
                        placeholder="Image URL..."
                        value={color.image_url || ''}
                        onChange={(e) => handleUpdateColor(idx, 'image_url', e.target.value)}
                        className="flex-1 p-2 bg-white rounded-xl border border-stone-200 text-xs"
                      />
                      <label className="px-3 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-semibold cursor-pointer shrink-0">
                        <span>{uploadingColorIdx === idx ? '...' : 'Upload'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleColorImageUpload(idx, e)}
                          className="hidden"
                          disabled={uploadingColorIdx !== null}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => handleRemoveColor(idx)}
                  className="p-2 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer self-center"
                  title="Remove this color"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 4: General Photo Gallery */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
            <div>
              <h2 className="text-base font-bold font-serif text-stone-900 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-amber-800" />
                4. General Product Photo Gallery
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Overall shots, closeups of joints, zoom details, and lifestyle photos.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-3 py-1.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-xs font-semibold text-stone-700"
              >
                + Paste URL
              </button>
              <label className="px-4 py-1.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold cursor-pointer flex items-center gap-1.5 shadow-xs">
                <Upload className="w-3.5 h-3.5" />
                <span>{uploadingImage ? 'Uploading...' : 'Upload Photo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleGalleryUpload}
                  className="hidden"
                  disabled={uploadingImage}
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {images.map((img, i) => (
              <div
                key={i}
                className={`relative aspect-4/3 rounded-2xl overflow-hidden border-2 bg-stone-100 group ${
                  img.is_primary ? 'border-amber-700 ring-2 ring-amber-600/30' : 'border-stone-200'
                }`}
              >
                <img src={img.url} alt="" className="w-full h-full object-cover" />

                {/* Primary Badge */}
                {img.is_primary && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-amber-800 text-white font-bold text-[10px] shadow-sm">
                    Main Photo
                  </span>
                )}

                {/* Hover overlay actions */}
                <div className="absolute inset-0 bg-stone-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {!img.is_primary && (
                    <button
                      type="button"
                      onClick={() => setPrimaryImage(i)}
                      className="p-1.5 rounded-lg bg-white text-stone-900 text-[10px] font-bold shadow-md hover:bg-amber-100 cursor-pointer"
                      title="Set as Main Cover Photo"
                    >
                      Make Main
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="p-1.5 rounded-lg bg-rose-600 text-white text-[10px] font-bold shadow-md hover:bg-rose-700 cursor-pointer"
                    title="Remove Photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 5: Timber, Dimensions & Specifications */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
          <h2 className="text-base font-bold font-serif text-stone-900 pb-3 border-b border-stone-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-800" />
            5. Timber Craftsmanship & Dimensions
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Primary Material / Timber
              </label>
              <input
                type="text"
                value={formData.material}
                onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                placeholder="e.g. 100% Solid Burma Teak Wood"
                className="w-full p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Polish & Finish
              </label>
              <input
                type="text"
                value={formData.finish}
                onChange={(e) => setFormData({ ...formData, finish: e.target.value })}
                placeholder="e.g. Honey Teak Melamine Polish"
                className="w-full p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs focus:bg-white focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Dimensions (Length × Width × Height)
              </label>
              <div className="grid grid-cols-4 gap-3">
                <input
                  type="number"
                  placeholder="Length"
                  value={formData.dimensions_length}
                  onChange={(e) =>
                    setFormData({ ...formData, dimensions_length: parseFloat(e.target.value) || 0 })
                  }
                  className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs text-center font-bold"
                />
                <input
                  type="number"
                  placeholder="Width"
                  value={formData.dimensions_width}
                  onChange={(e) =>
                    setFormData({ ...formData, dimensions_width: parseFloat(e.target.value) || 0 })
                  }
                  className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs text-center font-bold"
                />
                <input
                  type="number"
                  placeholder="Height"
                  value={formData.dimensions_height}
                  onChange={(e) =>
                    setFormData({ ...formData, dimensions_height: parseFloat(e.target.value) || 0 })
                  }
                  className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs text-center font-bold"
                />
                <select
                  value={formData.dimensions_unit}
                  onChange={(e) => setFormData({ ...formData, dimensions_unit: e.target.value })}
                  className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs font-bold"
                >
                  <option value="cm">cm</option>
                  <option value="inches">inches</option>
                  <option value="feet">feet</option>
                  <option value="mm">mm</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Warranty & Guarantee Information
              </label>
              <input
                type="text"
                value={formData.warranty_info}
                onChange={(e) => setFormData({ ...formData, warranty_info: e.target.value })}
                placeholder="e.g. 5 Years Manufacturer Warranty against Wood Borer & Termite"
                className="w-full p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          {/* Key Feature Highlights */}
          <div className="pt-4 border-t border-stone-100 space-y-3">
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
              Key Craftsmanship Bullet Points:
            </label>

            <div className="space-y-2">
              {features.map((feat, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-700 shrink-0" />
                  <span className="flex-1 text-xs text-stone-800">{feat}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(i)}
                    className="p-1 text-stone-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={newFeatureText}
                onChange={(e) => setNewFeatureText(e.target.value)}
                placeholder="e.g. Handcrafted floral carving on headboard"
                className="flex-1 p-2 bg-stone-50 rounded-xl border border-stone-200 text-xs focus:bg-white focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleAddFeature}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-semibold"
              >
                + Add Bullet
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 6: Badges & Visibility */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <h2 className="text-base font-bold font-serif text-stone-900 pb-3 border-b border-stone-100">
            6. Badges & Storefront Visibility
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <label className="flex items-center gap-2 p-3 rounded-xl border border-stone-200 cursor-pointer hover:bg-stone-50">
              <input
                type="checkbox"
                checked={formData.is_published}
                onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                className="rounded text-amber-800 focus:ring-amber-500 w-4 h-4"
              />
              <span className="text-xs font-semibold text-stone-800">Published (Visible)</span>
            </label>

            <label className="flex items-center gap-2 p-3 rounded-xl border border-stone-200 cursor-pointer hover:bg-stone-50">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                className="rounded text-amber-800 focus:ring-amber-500 w-4 h-4"
              />
              <span className="text-xs font-semibold text-stone-800">Featured Piece</span>
            </label>

            <label className="flex items-center gap-2 p-3 rounded-xl border border-stone-200 cursor-pointer hover:bg-stone-50">
              <input
                type="checkbox"
                checked={formData.is_best_seller}
                onChange={(e) => setFormData({ ...formData, is_best_seller: e.target.checked })}
                className="rounded text-amber-800 focus:ring-amber-500 w-4 h-4"
              />
              <span className="text-xs font-semibold text-stone-800">Best Seller</span>
            </label>

            <label className="flex items-center gap-2 p-3 rounded-xl border border-stone-200 cursor-pointer hover:bg-stone-50">
              <input
                type="checkbox"
                checked={formData.is_new_arrival}
                onChange={(e) => setFormData({ ...formData, is_new_arrival: e.target.checked })}
                className="rounded text-amber-800 focus:ring-amber-500 w-4 h-4"
              />
              <span className="text-xs font-semibold text-stone-800">New Arrival</span>
            </label>
          </div>
        </div>

        {/* Bottom Save Action */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <Link
            to="/admin/products"
            className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs tracking-wider uppercase shadow-md transition-all cursor-pointer"
          >
            {submitting ? 'Saving Product...' : isEditing ? 'Update Product' : 'Publish to Catalog'}
          </button>
        </div>
      </form>
    </div>
  );
};
