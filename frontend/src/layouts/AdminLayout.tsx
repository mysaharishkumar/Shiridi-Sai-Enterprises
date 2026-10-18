import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import {
  FolderTree, Image, Settings, LogOut, ExternalLink, Menu, X
} from 'lucide-react';
import { Logo } from '../components/common/Logo';
import { useAuth } from '../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const { user, isAuthenticated, isAdmin, isLoading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center text-white">
        <div className="animate-pulse text-sm font-medium">Verifying Administrator Access...</div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  // ONLY the 3 navigation items requested by user: Categories, Offers, Store Settings
  const navItems = [
    { label: 'Categories', path: '/admin/categories', icon: FolderTree },
    { label: 'Offers', path: '/admin/banners', icon: Image },
    { label: 'Store Settings', path: '/admin/settings', icon: Settings }
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col lg:flex-row text-stone-900 font-sans">
      {/* Mobile Header Bar */}
      <div className="lg:hidden bg-stone-950 text-white px-4 py-3 flex items-center justify-between border-b border-stone-800 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <Logo admin className="brightness-125" />
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/"
            target="_blank"
            className="p-2 text-stone-400 hover:text-white"
            title="View Storefront"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
            title="Logout from Admin"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Admin Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-stone-950 text-stone-300 flex flex-col justify-between transition-transform duration-300 lg:static lg:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 space-y-6">
          {/* Logo */}
          <div className="hidden lg:block brightness-125">
            <Logo admin />
          </div>

          {/* Admin User Info Card */}
          <div className="p-3 bg-stone-900/90 rounded-2xl border border-stone-800 text-xs">
            <div className="font-bold text-white truncate">{user?.name}</div>
            <div className="text-[11px] text-stone-400 truncate">{user?.email}</div>
            <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800/60">
              {user?.role?.replace('_', ' ')}
            </span>
          </div>

          {/* Navigation Links (ONLY Categories, Offers, Store Settings) */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === '/admin/categories'
                  ? location.pathname === '/admin' ||
                    location.pathname.startsWith('/admin/categories') ||
                    location.pathname.startsWith('/admin/products')
                  : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-amber-800 text-white shadow-md shadow-amber-950/40'
                      : 'text-stone-400 hover:text-white hover:bg-stone-900'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-stone-900 space-y-2">
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium text-stone-400 hover:text-white hover:bg-stone-900 transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-amber-400" />
            <span>Open Public Store</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition-all text-center cursor-pointer active:scale-98"
            title="Logout from Admin Dashboard"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content Body */}
      <main className="flex-1 min-w-0 bg-[#F5F5F4] overflow-y-auto flex flex-col min-h-screen">
        {/* Universal Admin Top Header with prominent Logout button */}
        <header className="bg-white border-b border-stone-200/90 px-6 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-100/70 border border-amber-300/80 px-2.5 py-1 rounded-full">
              Admin Portal
            </span>
            <span className="hidden sm:inline text-xs text-stone-400">•</span>
            <span className="hidden sm:inline text-xs font-semibold text-stone-700">
              Shiridi Sai Enterprises Management
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              target="_blank"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-stone-700 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-700" />
              <span>View Storefront</span>
            </Link>

            {/* Admin User Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-100 border border-stone-200 text-stone-700 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-stone-900 truncate max-w-[140px]">{user?.name}</span>
            </div>

            {/* Prominent Header Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-900/20 transition-all cursor-pointer active:scale-95"
              title="Logout from Admin Dashboard"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Page Content View */}
        <div className="flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
