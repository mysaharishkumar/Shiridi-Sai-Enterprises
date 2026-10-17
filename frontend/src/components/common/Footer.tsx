import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, MessageCircle, ShieldCheck, Truck, RefreshCw, Award, Lock } from 'lucide-react';
import { Logo } from './Logo';
import { useStore } from '../../context/StoreContext';

export const Footer: React.FC = () => {
  const { settings, categories } = useStore();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      {/* Value Badges Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 mb-12 border-b border-stone-800/80">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
          <div className="flex items-center gap-4 p-3 rounded-2xl bg-stone-800/40 border border-stone-800">
            <div className="w-12 h-12 rounded-xl bg-amber-900/40 text-amber-400 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Solid Teak Wood</h4>
              <p className="text-xs text-stone-400">100% Genuine Seasoned Timber</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-3 rounded-2xl bg-stone-800/40 border border-stone-800">
            <div className="w-12 h-12 rounded-xl bg-amber-900/40 text-amber-400 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">White Glove Delivery</h4>
              <p className="text-xs text-stone-400">Free Assembly Across AP & TS</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-3 rounded-2xl bg-stone-800/40 border border-stone-800">
            <div className="w-12 h-12 rounded-xl bg-amber-900/40 text-amber-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">5 - 10 Yr Warranty</h4>
              <p className="text-xs text-stone-400">Termite & Borer Protection</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-3 rounded-2xl bg-stone-800/40 border border-stone-800">
            <div className="w-12 h-12 rounded-xl bg-amber-900/40 text-amber-400 flex items-center justify-center shrink-0">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">7-Day Replacement</h4>
              <p className="text-xs text-stone-400">Zero-Risk Transit Guarantee</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info & Address */}
          <div className="lg:col-span-2 space-y-4">
            <div className="brightness-125">
              <Logo className="text-white" />
            </div>
            <p className="text-stone-400 text-xs leading-relaxed max-w-sm">
              {settings?.about_us ||
                'Shiridi Sai Enterprises has been a trusted symbol of premium wood craftsmanship and contemporary home luxury. We craft heirloom solid wood pieces engineered for modern living.'}
            </p>

            <div className="space-y-2.5 text-xs text-stone-300 pt-2">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{settings?.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <a href={`tel:${settings?.phone}`} className="hover:text-amber-300 transition-colors">
                  {settings?.phone}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a href={`mailto:${settings?.email}`} className="hover:text-amber-300 transition-colors">
                  {settings?.email}
                </a>
              </div>
              {settings?.whatsapp_number && (
                <div className="flex items-center gap-2.5">
                  <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <a
                    href={`https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-emerald-300 transition-colors text-emerald-400 font-medium"
                  >
                    WhatsApp Chat Support
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4 font-serif">
              Furniture Collections
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              {categories.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <Link
                    to={`/category/${cat.slug}`}
                    className="hover:text-amber-300 transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/products" className="text-amber-400 hover:text-amber-300 font-medium">
                  View Full Catalog →
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service & Policies */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4 font-serif">
              Customer Support
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <Link to="/track-order" className="hover:text-amber-300 transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link to="/policies/delivery" className="hover:text-amber-300 transition-colors">
                  Delivery & Assembly Policy
                </Link>
              </li>
              <li>
                <Link to="/policies/returns" className="hover:text-amber-300 transition-colors">
                  Returns & Cancellations
                </Link>
              </li>
              <li>
                <Link to="/policies/privacy" className="hover:text-amber-300 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/policies/terms" className="hover:text-amber-300 transition-colors">
                  Terms of Service & Warranty
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-amber-300 transition-colors">
                  Contact Store
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Account & Store Portal */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4 font-serif">
              Account & Portal
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <Link to="/login" className="hover:text-amber-300 transition-colors">
                  Customer Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-amber-300 transition-colors">
                  Create Account
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-amber-300 transition-colors">
                  View Shopping Cart
                </Link>
              </li>
              <li className="pt-4 border-t border-stone-800">
                <Link
                  to="/admin/login"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors text-[11px] font-medium"
                >
                  <Lock className="w-3 h-3 text-amber-400" />
                  <span>Admin Management Portal</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© {currentYear} Shiridi Sai Enterprises. All rights reserved. Handcrafted Solid Wood Furniture.</p>
          <div className="flex items-center gap-4">
            <span className="text-stone-400">Payment: Cash on Delivery (COD)</span>
            <span>•</span>
            <span className="text-stone-400">Currency: Indian Rupee (₹)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
