import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, MessageCircle, ShieldCheck, Award, Lock, Sparkles, Clock } from 'lucide-react';
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
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Best Showroom Price</h4>
              <p className="text-xs text-stone-400">Direct Workshop-to-Customer Value</p>
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
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Custom Finish & Sizes</h4>
              <p className="text-xs text-stone-400">Made to Measure For Your Home</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Info & Address */}
          <div className="space-y-4">
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
                    WhatsApp Price Inquiry
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
                  View Full Catalog & Prices →
                </Link>
              </li>
            </ul>
          </div>

          {/* Showroom & Inquiry Support */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4 font-serif">
              Showroom & Support
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <Link to="/contact" className="hover:text-amber-300 transition-colors">
                  Showroom Location & Contact
                </Link>
              </li>
              <li>
                <Link to="/policies/terms" className="hover:text-amber-300 transition-colors">
                  Timber Quality & Warranty
                </Link>
              </li>
              <li>
                <Link to="/policies/privacy" className="hover:text-amber-300 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <a
                  href={`https://wa.me/${settings?.whatsapp_number ? settings.whatsapp_number.replace(/[^0-9]/g, '') : '919876543210'}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-amber-300 transition-colors"
                >
                  Direct WhatsApp Price Quote
                </a>
              </li>
            </ul>
          </div>

          {/* Business Hours & Staff Portal */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4 font-serif">
              Showroom Hours
            </h4>
            <div className="text-xs text-stone-400 space-y-2 mb-6">
              <p><strong className="text-stone-200">Monday - Saturday:</strong> 10:00 AM – 9:00 PM</p>
              <p><strong className="text-stone-200">Sunday:</strong> 10:30 AM – 8:00 PM</p>
              <p className="text-stone-400 text-[11px] pt-1">
                Walk-ins welcome. Visit our Hyderabad showroom to inspect timber and wood finishes in person.
              </p>
            </div>

            <div className="pt-4 border-t border-stone-800">
              <Link
                to="/admin/login"
                className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-amber-400 transition-colors"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Admin Login</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-8 border-t border-stone-800/80 text-center text-xs text-stone-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {currentYear} Shiridi Sai Enterprises. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/admin/login" className="hover:text-stone-400 text-stone-600 transition-colors">
              Owner / Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
