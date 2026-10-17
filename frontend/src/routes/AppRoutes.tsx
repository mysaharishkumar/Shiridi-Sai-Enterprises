import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { StoreLayout } from '../layouts/StoreLayout';
import { AdminLayout } from '../layouts/AdminLayout';

// Storefront pages
import { HomePage } from '../pages/store/HomePage';
import { CategoryPage } from '../pages/store/CategoryPage';
import { ProductsCatalogPage } from '../pages/store/ProductsCatalogPage';
import { ProductDetailPage } from '../pages/store/ProductDetailPage';
import { CartPage } from '../pages/store/CartPage';
import { CheckoutPage } from '../pages/store/CheckoutPage';
import { OrderConfirmationPage } from '../pages/store/OrderConfirmationPage';
import { TrackOrderPage } from '../pages/store/TrackOrderPage';
import { PoliciesPage } from '../pages/store/PoliciesPage';
import { ContactPage } from '../pages/store/ContactPage';

// Customer Account pages
import { LoginPage } from '../pages/account/LoginPage';
import { RegisterPage } from '../pages/account/RegisterPage';
import { OrdersPage } from '../pages/account/OrdersPage';
import { ProfilePage } from '../pages/account/ProfilePage';

// Admin pages
import { AdminLoginPage } from '../pages/admin/AdminLoginPage';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminProductsPage } from '../pages/admin/AdminProductsPage';
import { AdminProductFormPage } from '../pages/admin/AdminProductFormPage';
import { AdminCategoriesPage } from '../pages/admin/AdminCategoriesPage';
import { AdminBannersPage } from '../pages/admin/AdminBannersPage';
import { AdminOrdersPage } from '../pages/admin/AdminOrdersPage';
import { AdminUsersPage } from '../pages/admin/AdminUsersPage';
import { AdminSettingsPage } from '../pages/admin/AdminSettingsPage';
import { AdminAuditLogsPage } from '../pages/admin/AdminAuditLogsPage';

// 404 Component
const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <span className="text-6xl font-bold font-serif text-amber-900/30">404</span>
      <h1 className="text-2xl font-bold font-serif text-stone-900 mt-2">Page Not Found</h1>
      <p className="text-stone-500 text-sm max-w-md mt-2 mb-8">
        The page or furniture piece you are looking for may have been moved, renamed, or is currently unavailable.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/"
          className="px-6 py-2.5 rounded-full bg-amber-800 text-white text-xs font-semibold uppercase tracking-wider hover:bg-amber-900 transition-colors shadow-sm"
        >
          Return to Storefront
        </Link>
        <Link
          to="/products"
          className="px-6 py-2.5 rounded-full bg-stone-100 text-stone-800 text-xs font-semibold uppercase tracking-wider hover:bg-stone-200 transition-colors"
        >
          Browse All Furniture
        </Link>
      </div>
    </div>
  );
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Admin Login Route */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* Admin Dashboard Protected Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="products/new" element={<AdminProductFormPage />} />
        <Route path="products/edit/:id" element={<AdminProductFormPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="banners" element={<AdminBannersPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="customers" element={<AdminUsersPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
        <Route path="audit-logs" element={<AdminAuditLogsPage />} />
      </Route>

      {/* Public Storefront Routes wrapped in StoreLayout */}
      <Route path="/" element={<StoreLayout />}>
        <Route index element={<HomePage />} />
        
        {/* Categories */}
        <Route path="category/:slug" element={<CategoryPage />} />
        <Route path="categories/:slug" element={<CategoryPage />} />

        {/* Products */}
        <Route path="products" element={<ProductsCatalogPage />} />
        <Route path="product/:slug" element={<ProductDetailPage />} />
        <Route path="products/:slug" element={<ProductDetailPage />} />

        {/* Cart & Checkout */}
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="order-confirmation/:orderNumber" element={<OrderConfirmationPage />} />

        {/* Order Tracking */}
        <Route path="track-order" element={<TrackOrderPage />} />
        <Route path="track-order/:orderNumber" element={<TrackOrderPage />} />

        {/* Customer Accounts */}
        <Route path="login" element={<LoginPage />} />
        <Route path="account/login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="account/register" element={<RegisterPage />} />
        <Route path="account/orders" element={<OrdersPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="account/profile" element={<ProfilePage />} />
        <Route path="profile" element={<ProfilePage />} />

        {/* Information & Policies */}
        <Route path="contact" element={<ContactPage />} />
        <Route path="policies" element={<PoliciesPage />} />
        <Route path="policies/:type" element={<PoliciesPage />} />
        <Route path="delivery-info" element={<Navigate to="/policies/delivery" replace />} />
        <Route path="returns" element={<Navigate to="/policies/returns" replace />} />
        <Route path="privacy" element={<Navigate to="/policies/privacy" replace />} />
        <Route path="terms" element={<Navigate to="/policies/terms" replace />} />

        {/* 404 Catch-All */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};
