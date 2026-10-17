import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Upload, Trash2, Plus, Star, Check, AlertCircle,
  Eye, Image as ImageIcon, Sparkles
} from 'lucide-react';
import { Product, Category, ProductImage, ProductColor, ProductVariant, ProductSpecification } from '../../types';
import { adminApi } from '../../api/client';
import { useToast } from '../../context/ToastContext';

export const AdminProductFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const isEditing = Boolean(id);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    short_description: '',
    category_id: '',
    subcategory_id: '',
    selling_price: 19999,
    original_price: 27999,
    sku: '',
    brand: 'Shiridi Sai Enterprises',
    material: 'Solid Burma Teak Wood',
    finish: 'Honey Teak Satin Polish',
    total_stock: 10,
    warranty_info: '5 Years Manufacturer Warranty on Wood Borer & Termite',
    assembly_required: false,
    is_featured: false,
    is_best_seller: false,
    is_new_arrival: false,
    is_special_offer: false,
    is_published: true
  });

  const [images, setImages] = useState<ProductImage[]>([
    {
      url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=80',
      alt: 'Main View',
      is_primary: true
    }
  ]);

  const [colors, setColors] = useState<ProductColor[]>([
    { name: 'Warm Teak', hex_code: '#8B4513' },
    { name: 'Dark Walnut', hex_code: '#3E2723' }
  ]);

  const [variants, setVariants] = useState<ProductVariant[]>([
    {
      variant_id: 'v_1',
      sku: 'SSE-TEAK-01',
      color: 'Warm Teak',
      dimensions: 'Standard Dimensions',
      price_override: undefined,
      stock_quantity: 5
    }
  ]);

  const [specifications, setSpecifications] = useState<ProductSpecification[]>([
    { label: 'Primary Timber', value: '100% Grade-A Burma Teak' },
    { label: 'Moisture Level', value: 'Kiln-dried <12%' }
  ]);

  useEffect(() => {
    adminApi.getCategories().then((cats) => {
      setCategories(cats);
      if (!isEditing && cats.length > 0) {
        setFormData((prev) => ({ ...prev, category_id: cats[0].id }));
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
            short_description: prod.short_description || '',
            category_id: prod.category_id,
            subcategory_id: prod.subcategory_id || '',
            selling_price: prod.selling_price,
            original_price: prod.original_price || prod.selling_price,
            sku: prod.sku || '',
            brand: prod.brand || 'Shiridi Sai Enterprises',
            material: prod.material || '',
            finish: prod.finish || '',
            total_stock: prod.total_stock,
            warranty_info: prod.warranty_info || '',
            assembly_required: prod.assembly_required,
            is_featured: prod.is_featured,
            is_best_seller: prod.is_best_seller,
            is_new_arrival: prod.is_new_arrival,
            is_special_offer: prod.is_special_offer,
            is_published: prod.is_published
          });
          if (prod.images && prod.images.length > 0) setImages(prod.images);
          if (prod.colors) setColors(prod.colors);
          if (prod.variants) setVariants(prod.variants);
          if (prod.specifications) setSpecifications(prod.specifications);
        })
        .catch((err) => toastError(err.message || 'Failed to load product'))
        .finally(() => setLoading(false));
    }
  }, [id, isEditing]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const res = await adminApi.uploadImage(file);
      setImages((prev) => [
        ...prev,
        { url: res.url, alt: file.name, is_primary: prev.length === 0, public_id: res.public_id }
      ]);
      success('Image uploaded successfully');
    } catch (err: any) {
      toastError(err.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddImageUrl = () => {
    const url = prompt('Enter public image URL:');
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

  // Color Swatches handlers
  const handleAddColor = () => {
    const name = prompt('Color or Finish name (e.g. Royal Emerald Green):');
    if (!name) return;
    const hex = prompt('Hex code (e.g. #064E3B):', '#78350F') || '#78350F';
    setColors((prev) => [...prev, { name, hex_code: hex }]);
  };

  const removeColor = (index: number) => {
    setColors((prev) => prev.filter((_, i) => i !== index));
  };

  // Specifications handlers
  const handleAddSpec = () => {
    setSpecifications((prev) => [...prev, { label: '', value: '' }]);
  };

  const updateSpec = (index: number, key: 'label' | 'value', val: string) => {
    setSpecifications((prev) => {
      const copy = [...prev];
      copy[index][key] = val;
      return copy;
    });
  };

  const removeSpec = (index: number) => {
    setSpecifications((prev) => prev.filter((_, i) => i !== index));
  };

  // Variant handlers
  const handleAddVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        variant_id: `v_${Date.now()}`,
        sku: `${formData.sku}-V${prev.length + 1}`,
        color: colors[0]?.name || 'Standard',
        dimensions: 'Standard Dimensions',
        stock_quantity: 5
      }
    ]);
  };

  const updateVariant = (index: number, field: string, val: any) => {
    setVariants((prev) => {
      const copy = [...prev];
      (copy[index] as any)[field] = val;
      return copy;
    });
  };

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.category_id) {
      toastError('Please complete required fields');
      return;
    }

    if (images.length === 0) {
      toastError('Please provide at least one product image');
      return;
    }

    setSubmitting(true);
    try {
      const selectedCat = categories.find((c) => c.id === formData.category_id);
      const payload = {
        ...formData,
        category_name: selectedCat?.name,
        images,
        colors,
        variants,
        specifications
      };

      if (isEditing && id) {
        await adminApi.updateProduct(id, payload);
        success(`Product '${formData.name}' updated successfully!`);
      } else {
        await adminApi.createProduct(payload);
        success(`Product '${formData.name}' created successfully!`);
      }
      navigate('/admin/products');
    } catch (err: any) {
      toastError(err.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-stone-500 animate-pulse">
        Loading product details...
      </div>
    );
  }

  // Auto discount calculation for preview
  const discountPct =
    formData.original_price > formData.selling_price
      ? Math.round(((formData.original_price - formData.selling_price) / formData.original_price) * 100)
      : 0;

  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="p-2 rounded-xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-50"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 tracking-tight">
              {isEditing ? `Edit Product: ${formData.name}` : 'Create New Furniture Item'}
            </h1>
            <p className="text-xs text-stone-500">
              Configure product details, pricing, variants, and high-res photography.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 1. Basic Information */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold font-serif text-stone-900 uppercase tracking-wider pb-2 border-b border-stone-100">
            1. Basic Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Product Title *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Royal Grand 7-Seater Teak Wood L-Shape Sofa Set"
                className="w-full p-2.5 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Category *
              </label>
              <select
                required
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full p-2.5 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:outline-hidden"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                SKU (Stock Keeping Unit)
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="e.g. SSE-SOFA-RG07"
                className="w-full p-2.5 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:bg-white focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Short Summary (Card preview)
              </label>
              <input
                type="text"
                value={formData.short_description}
                onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                placeholder="One sentence overview of timber grade and cushioning."
                className="w-full p-2.5 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:bg-white focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Detailed Product Description *
              </label>
              <textarea
                rows={4}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Comprehensive description of craftsmanship, wood species, warranty, and room styling."
                className="w-full p-2.5 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* 2. Pricing & Stock */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold font-serif text-stone-900 uppercase tracking-wider pb-2 border-b border-stone-100">
            2. Pricing & Inventory
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                Selling Price (₹ INR) *
              </label>
              <input
                type="number"
                required
                value={formData.selling_price}
                onChange={(e) => setFormData({ ...formData, selling_price: Number(e.target.value) })}
                className="w-full p-2.5 bg-stone-50 rounded-xl border border-stone-200 font-bold font-mono focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                Original MRP (₹ INR)
              </label>
              <input
                type="number"
                value={formData.original_price}
                onChange={(e) => setFormData({ ...formData, original_price: Number(e.target.value) })}
                className="w-full p-2.5 bg-stone-50 rounded-xl border border-stone-200 font-mono focus:bg-white"
              />
              {discountPct > 0 && (
                <span className="text-[11px] text-emerald-700 font-bold mt-1 inline-block">
                  Auto Discount: {discountPct}% OFF
                </span>
              )}
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                Total Available Stock *
              </label>
              <input
                type="number"
                required
                value={formData.total_stock}
                onChange={(e) => setFormData({ ...formData, total_stock: Number(e.target.value) })}
                className="w-full p-2.5 bg-stone-50 rounded-xl border border-stone-200 font-mono focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                Wood / Material
              </label>
              <input
                type="text"
                value={formData.material}
                onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                placeholder="e.g. Solid Burma Teak Wood"
                className="w-full p-2.5 bg-stone-50 rounded-xl border border-stone-200 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                Finish & Polish
              </label>
              <input
                type="text"
                value={formData.finish}
                onChange={(e) => setFormData({ ...formData, finish: e.target.value })}
                placeholder="e.g. Natural Teak Satin Polish"
                className="w-full p-2.5 bg-stone-50 rounded-xl border border-stone-200 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                Warranty Information
              </label>
              <input
                type="text"
                value={formData.warranty_info}
                onChange={(e) => setFormData({ ...formData, warranty_info: e.target.value })}
                className="w-full p-2.5 bg-stone-50 rounded-xl border border-stone-200 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* 3. Product Photography (Multiple Images & Upload) */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <h2 className="text-sm font-bold font-serif text-stone-900 uppercase tracking-wider">
              3. Photography & Media
            </h2>
            <div className="flex items-center gap-2">
              <label className="px-3 py-1.5 rounded-xl bg-amber-800 text-white text-xs font-semibold cursor-pointer hover:bg-amber-900 transition-colors inline-flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" />
                <span>{uploadingImage ? 'Uploading...' : 'Upload File'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploadingImage}
                />
              </label>
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-semibold hover:bg-stone-50 cursor-pointer"
              >
                + Add Image URL
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {images.map((img, idx) => (
              <div
                key={idx}
                className={`relative group rounded-2xl overflow-hidden border-2 p-1.5 bg-stone-50 ${
                  img.is_primary ? 'border-amber-700 ring-2 ring-amber-600/20' : 'border-stone-200'
                }`}
              >
                <div className="aspect-4/3 rounded-xl overflow-hidden bg-stone-200">
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px]">
                  <button
                    type="button"
                    onClick={() => setPrimaryImage(idx)}
                    className={`font-semibold cursor-pointer ${
                      img.is_primary ? 'text-amber-800 font-bold' : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    {img.is_primary ? '★ Primary Cover' : 'Set as Primary'}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="text-rose-500 hover:text-rose-700 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Color Variants & Dimensions */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <h2 className="text-sm font-bold font-serif text-stone-900 uppercase tracking-wider">
              4. Colors & Specific Variants
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAddColor}
                className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold cursor-pointer"
              >
                + Add Color Swatch
              </button>
              <button
                type="button"
                onClick={handleAddVariant}
                className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold cursor-pointer"
              >
                + Add Variant SKU
              </button>
            </div>
          </div>

          {/* Color swatches */}
          {colors.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {colors.map((c, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 text-xs"
                >
                  <span
                    style={{ backgroundColor: c.hex_code }}
                    className="w-3.5 h-3.5 rounded-full border border-stone-300 shadow-inner"
                  />
                  <span className="font-medium text-stone-800">{c.name}</span>
                  <button
                    type="button"
                    onClick={() => removeColor(i)}
                    className="text-stone-400 hover:text-rose-600 ml-1"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Variants Table */}
          {variants.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                Configured Variants
              </span>
              <div className="space-y-2">
                {variants.map((v, i) => (
                  <div
                    key={v.variant_id || i}
                    className="grid grid-cols-1 sm:grid-cols-5 gap-2 p-3 bg-stone-50 rounded-2xl border border-stone-200 text-xs items-center"
                  >
                    <input
                      type="text"
                      placeholder="Variant SKU"
                      value={v.sku || ''}
                      onChange={(e) => updateVariant(i, 'sku', e.target.value)}
                      className="p-2 bg-white rounded-lg border border-stone-200"
                    />
                    <input
                      type="text"
                      placeholder="Color Name"
                      value={v.color || ''}
                      onChange={(e) => updateVariant(i, 'color', e.target.value)}
                      className="p-2 bg-white rounded-lg border border-stone-200"
                    />
                    <input
                      type="text"
                      placeholder="Dimensions / Size"
                      value={v.dimensions || ''}
                      onChange={(e) => updateVariant(i, 'dimensions', e.target.value)}
                      className="p-2 bg-white rounded-lg border border-stone-200"
                    />
                    <input
                      type="number"
                      placeholder="Stock Qty"
                      value={v.stock_quantity}
                      onChange={(e) => updateVariant(i, 'stock_quantity', Number(e.target.value))}
                      className="p-2 bg-white rounded-lg border border-stone-200"
                    />
                    <div className="flex items-center justify-between">
                      <input
                        type="number"
                        placeholder="Price Override"
                        value={v.price_override || ''}
                        onChange={(e) =>
                          updateVariant(
                            i,
                            'price_override',
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                        className="w-24 p-2 bg-white rounded-lg border border-stone-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeVariant(i)}
                        className="text-stone-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 5. Specifications & Attributes */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <h2 className="text-sm font-bold font-serif text-stone-900 uppercase tracking-wider">
              5. Technical Specifications Table
            </h2>
            <button
              type="button"
              onClick={handleAddSpec}
              className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold cursor-pointer"
            >
              + Add Specification Row
            </button>
          </div>

          <div className="space-y-2">
            {specifications.map((s, idx) => (
              <div key={idx} className="flex items-center gap-3 text-xs">
                <input
                  type="text"
                  placeholder="Label (e.g. Foam Density)"
                  value={s.label}
                  onChange={(e) => updateSpec(idx, 'label', e.target.value)}
                  className="w-1/3 p-2.5 bg-stone-50 rounded-xl border border-stone-200 focus:bg-white"
                />
                <input
                  type="text"
                  placeholder="Value (e.g. 40 High Resilient (HR) Foam)"
                  value={s.value}
                  onChange={(e) => updateSpec(idx, 'value', e.target.value)}
                  className="flex-1 p-2.5 bg-stone-50 rounded-xl border border-stone-200 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => removeSpec(idx)}
                  className="p-2 text-stone-400 hover:text-rose-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 6. Visibility, Badges & Publishing */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold font-serif text-stone-900 uppercase tracking-wider pb-2 border-b border-stone-100">
            6. Badges & Publishing Controls
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold">
            <label className="flex items-center gap-2 p-3 rounded-xl border border-stone-200 hover:bg-stone-50 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_published}
                onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                className="w-4 h-4 text-amber-700 rounded"
              />
              <span>Published Live</span>
            </label>

            <label className="flex items-center gap-2 p-3 rounded-xl border border-stone-200 hover:bg-stone-50 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                className="w-4 h-4 text-amber-700 rounded"
              />
              <span>Featured Showcase</span>
            </label>

            <label className="flex items-center gap-2 p-3 rounded-xl border border-stone-200 hover:bg-stone-50 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_best_seller}
                onChange={(e) => setFormData({ ...formData, is_best_seller: e.target.checked })}
                className="w-4 h-4 text-amber-700 rounded"
              />
              <span>Best Seller</span>
            </label>

            <label className="flex items-center gap-2 p-3 rounded-xl border border-stone-200 hover:bg-stone-50 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_new_arrival}
                onChange={(e) => setFormData({ ...formData, is_new_arrival: e.target.checked })}
                className="w-4 h-4 text-amber-700 rounded"
              />
              <span>New Arrival</span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-stone-200">
          <Link
            to="/admin/products"
            className="px-6 py-3 rounded-2xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3.5 rounded-2xl bg-amber-800 hover:bg-amber-900 active:scale-98 text-white font-bold text-xs tracking-wider uppercase shadow-lg shadow-amber-950/20 cursor-pointer disabled:opacity-50"
          >
            {submitting ? 'Saving Product...' : isEditing ? 'Update Product' : 'Publish Product'}
          </button>
        </div>
      </form>
    </div>
  );
};
