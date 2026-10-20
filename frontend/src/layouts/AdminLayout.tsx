import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import {
  FolderTree, Image, Settings, LogOut, ExternalLink, Menu, X, MessageSquare
} from 'lucide-react';
import { Logo } from '../components/common/Logo';
import { useAuth } from '../context/AuthContext';
import { adminApi } from '../api/client';

export const AdminLayout: React.FC = () => {
  const { user, isAuthenticated, isAdmin, isLoading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      adminApi.getInquiries()
        .then((data) => {
          const unread = data.filter((i) => i.status === 'new').length;
          setUnreadCount(unread);
        })
        .catch(() => {});
    }
  }, [location.pathname, isAuthenticated, isAdmin]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center text-stone-900">
        <div className="animate-pulse text-sm font-medium">Verifying Administrator Access...</div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  // Navigation items: Categories, Offers, Customer Messages, Store Settings
  const navItems = [
    { label: 'Categories', path: '/admin/categories', icon: FolderTree },
    { label: 'Offers', path: '/admin/banners', icon: Image },
    { label: 'Customer Messages', path: '/admin/inquiries', icon: MessageSquare, badge: unreadCount },
    { label: 'Store Settings', path: '/admin/settings', icon: Settings }
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F4] text-stone-900 font-sans">
      {/* Universal Sticky Top Header (ONLY SHOP NAME AS REQUESTED) */}
      <header className="sticky top-0 z-40 bg-white border-b border-stone-200 px-4 sm:px-8 h-16 flex items-center shadow-xs">
        <div className="flex items-center gap-3">
          {/* Mobile Hamburger Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="lg:hidden p-2 -ml-1 rounded-xl text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Business Logo / Shop Name */}
          <Logo admin />
        </div>
      </header>

      {/* Main Container below sticky header */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Mobile Drawer Backdrop */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs z-50 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Admin Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-stone-200 text-stone-800 flex flex-col justify-between transition-transform duration-300 lg:static lg:translate-x-0 shadow-xl lg:shadow-none ${
            mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-6 space-y-6">
            {/* Header with Close button for mobile */}
            <div className="flex items-center justify-between lg:hidden pb-3 border-b border-stone-100">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-800 bg-stone-200 border border-stone-300 px-2.5 py-1 rounded-full">
                Navigation Menu
              </span>
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-100 cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Admin User Info Card */}
            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-xs">
              <div className="font-bold text-stone-900 truncate">{user?.name}</div>
              <div className="text-[11px] text-stone-500 truncate">{user?.email}</div>
              <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-200 text-stone-800 border border-stone-300">
                {user?.role?.replace('_', ' ')}
              </span>
            </div>

            {/* Navigation Links */}
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
                    className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-stone-800 text-white shadow-md shadow-stone-900/20'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </div>
                    {Boolean(item.badge && item.badge > 0) && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-extrabold animate-pulse shadow-xs">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Footer Actions in Left Navigation Menu: View Store & Logout */}
          <div className="p-6 border-t border-stone-200 space-y-2.5">
            <Link
              to="/"
              target="_blank"
              onClick={() => setMobileSidebarOpen(false)}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-stone-700 hover:text-stone-900 hover:bg-stone-100 border border-stone-200 transition-colors shadow-2xs"
              title="Open Public Store in New Tab"
            >
              <ExternalLink className="w-4 h-4 text-stone-600 shrink-0" />
              <span>View Store</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
              title="Logout from Admin Dashboard"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Page Content View */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
