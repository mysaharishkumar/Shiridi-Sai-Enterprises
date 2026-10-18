import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { StoreLayout } from '../layouts/StoreLayout';
import { AdminLayout } from '../layouts/AdminLayout';

// Storefront Showcase pages
import { HomePage } from '../pages/store/HomePage';
import { CategoryPage } from '../pages/store/CategoryPage';
import { ProductsCatalogPage } from '../pages/store/ProductsCatalogPage';
import { ProductDetailPage } from '../pages/store/ProductDetailPage';
import { PoliciesPage } from '../pages/store/PoliciesPage';
import { ContactPage } from '../pages/store/ContactPage';

// Admin pages
import { AdminLoginPage } from '../pages/admin/AdminLoginPage';
import { AdminCategoriesPage } from '../pages/admin/AdminCategoriesPage';
import { AdminBannersPage } from '../pages/admin/AdminBannersPage';
import { AdminSettingsPage } from '../pages/admin/AdminSettingsPage';
import { AdminProductFormPage } from '../pages/admin/AdminProductFormPage';
import { AdminInquiriesPage } from '../pages/admin/AdminInquiriesPage';

// 404 Component
const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <span className="text-6xl font-bold font-serif text-stone-900/30">404</span>
      <h1 className="text-2xl font-bold font-serif text-stone-900 mt-2">Page Not Found</h1>
      <p className="text-stone-500 text-sm max-w-md mt-2 mb-8">
        The page or furniture piece you are looking for may have been moved, renamed, or is currently unavailable.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/"
          className="px-6 py-2.5 rounded-full bg-stone-800 text-white text-xs font-semibold uppercase tracking-wider hover:bg-stone-900 transition-colors shadow-sm"
        >
          Return to Storefront
        </Link>
        <Link
          to="/products"
          className="px-6 py-2.5 rounded-full bg-stone-100 text-stone-800 text-xs font-semibold uppercase tracking-wider hover:bg-stone-200 transition-colors"
        >
          Browse All Furniture & Prices
        </Link>
      </div>
    </div>
  );
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* 
        When typing /admin or /admin/login in URL, always open the Login interface first 
        (as explicitly requested by user)
      */}
      <Route path="/admin" element={<AdminLoginPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* Admin Dashboard Protected Routes (ONLY Categories, Offers, Store Settings) */}
      <Route path="/admin/categories" element={<AdminLayout />}>
        <Route index element={<AdminCategoriesPage />} />
      </Route>
      <Route path="/admin/banners" element={<AdminLayout />}>
        <Route index element={<AdminBannersPage />} />
      </Route>
      <Route path="/admin/inquiries" element={<AdminLayout />}>
        <Route index element={<AdminInquiriesPage />} />
      </Route>
      <Route path="/admin/settings" element={<AdminLayout />}>
        <Route index element={<AdminSettingsPage />} />
      </Route>
      <Route path="/admin/products/new" element={<AdminLayout />}>
        <Route index element={<AdminProductFormPage />} />
      </Route>
      <Route path="/admin/products/edit/:id" element={<AdminLayout />}>
        <Route index element={<AdminProductFormPage />} />
      </Route>
      <Route path="/admin/products" element={<Navigate to="/admin/categories" replace />} />

      {/* Public Storefront Routes wrapped in StoreLayout */}
      <Route path="/" element={<StoreLayout />}>
        <Route index element={<HomePage />} />
        
        {/* Categories */}
        <Route path="category/:slug" element={<CategoryPage />} />
        <Route path="categories/:slug" element={<CategoryPage />} />
        <Route path="categories" element={<Navigate to="/products" replace />} />

        {/* Products Price Showcase & Catalog */}
        <Route path="products" element={<ProductsCatalogPage />} />
        <Route path="product/:slug" element={<ProductDetailPage />} />
        <Route path="products/:slug" element={<ProductDetailPage />} />

        {/* Showroom Information & Warranty Policies */}
        <Route path="contact" element={<ContactPage />} />
        <Route path="policies" element={<PoliciesPage />} />
        <Route path="policies/:type" element={<PoliciesPage />} />
        <Route path="privacy" element={<Navigate to="/policies/privacy" replace />} />
        <Route path="terms" element={<Navigate to="/policies/terms" replace />} />

        {/* Removed customer login / delivery routes */}
        <Route path="login" element={<Navigate to="/admin/login" replace />} />
        <Route path="account/*" element={<Navigate to="/" replace />} />
        <Route path="register" element={<Navigate to="/" replace />} />
        <Route path="cart" element={<Navigate to="/products" replace />} />
        <Route path="checkout" element={<Navigate to="/products" replace />} />
        <Route path="order-confirmation/*" element={<Navigate to="/" replace />} />
        <Route path="track-order/*" element={<Navigate to="/" replace />} />
        <Route path="track-order" element={<Navigate to="/" replace />} />

        {/* 404 Catch-All */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};
