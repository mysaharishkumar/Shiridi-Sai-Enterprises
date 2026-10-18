import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, Truck, RefreshCw, FileText, ChevronRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const PoliciesPage: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const { settings } = useStore();

  const getPolicyDetails = () => {
    switch (type) {
      case 'delivery':
        return {
          title: 'Delivery & White-Glove Installation Policy',
          icon: <Truck className="w-8 h-8 text-stone-700" />,
          content:
            settings?.delivery_info ||
            'We provide dedicated white-glove logistics with multi-layer bubble wrap, foam corner protectors, and free doorstep assembly by certified technicians.',
          points: [
            'White-glove delivery across Hyderabad, Andhra Pradesh & Telangana within 3-7 business days.',
            'Complimentary unboxing and on-site assembly for all sofas, dining sets, and hydraulic storage beds.',
            'Pre-dispatch quality and moisture inspection by our chief furniture master.',
            'Free doorstep delivery on all orders above ₹15,000.'
          ]
        };
      case 'returns':
        return {
          title: 'Returns, Replacements & Cancellation Policy',
          icon: <RefreshCw className="w-8 h-8 text-stone-700" />,
          content:
            settings?.return_policy ||
            'We offer a hassle-free 7-day replacement guarantee in case of any in-transit damage or manufacturing flaw.',
          points: [
            'Inspect your furniture upon arrival before completing Cash on Delivery (COD) payment.',
            'If transit damage or surface scratch is detected, our team will replace the affected component or entire unit at zero cost.',
            'Cancellations can be made directly through the website while order status is Placed or Confirmed.',
            '7-day zero-question replacement for any structural flaw or woodwork defect.'
          ]
        };
      case 'terms':
        return {
          title: 'Terms of Service & Timber Warranty',
          icon: <ShieldCheck className="w-8 h-8 text-stone-700" />,
          content:
            settings?.terms_and_conditions ||
            'All our solid wood furniture pieces come with standard 5-to-10 year manufacturer warranties against termites and natural wood borer defects.',
          points: [
            '100% genuine Grade-A seasoned Burma Teak and Indian Sheesham timber warranty.',
            '5 to 10 year warranty against wood borers, termites, and internal joint separation.',
            'High-density 40-D foam sag resistance warranty on all sofa seating.',
            'Warranty card and stamped tax invoice provided at time of delivery.'
          ]
        };
      case 'privacy':
      default:
        return {
          title: 'Customer Privacy Policy',
          icon: <FileText className="w-8 h-8 text-stone-700" />,
          content:
            settings?.privacy_policy ||
            'Your personal information is securely handled and never shared. We value customer trust above all.',
          points: [
            'Customer contact and delivery details are exclusively utilized to coordinate white-glove transport.',
            'We do not sell, rent or share your phone numbers or addresses with third-party advertisers.',
            'Authentication tokens and passwords are cryptographically salted and hashed on the server.',
            'You may request deletion or update of your account records at any time.'
          ]
        };
    }
  };

  const policy = getPolicyDetails();

  return (
    <div className="bg-[#FCFBF9] min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
          <Link to="/" className="hover:text-stone-900 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-stone-900">Policies & Terms</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-stone-800 font-bold">{policy.title}</span>
        </div>

        {/* Content Box */}
        <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 shadow-xs space-y-8">
          <div className="flex items-center gap-4 pb-6 border-b border-stone-100">
            <div className="w-14 h-14 rounded-2xl bg-stone-100 text-stone-800 flex items-center justify-center shrink-0 border border-stone-200">
              {policy.icon}
            </div>
            <div>
              <span className="text-[10px] font-bold text-stone-700 uppercase tracking-widest">
                Shiridi Sai Enterprises
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 tracking-tight">
                {policy.title}
              </h1>
            </div>
          </div>

          <div className="prose prose-stone max-w-none text-stone-600 text-xs sm:text-sm leading-relaxed space-y-4">
            <p className="text-base text-stone-800 font-medium leading-relaxed">
              {policy.content}
            </p>

            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider pt-4">
              Key Policy Highlights
            </h3>
            <ul className="space-y-2.5 list-disc pl-5 text-stone-600">
              {policy.points.map((pt, i) => (
                <li key={i}>{pt}</li>
              ))}
            </ul>
          </div>

          {/* Quick Contact Help */}
          <div className="pt-6 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
            <div>
              Have specific questions regarding our timber or delivery?
            </div>
            <Link
              to="/contact"
              className="px-5 py-2.5 rounded-full bg-stone-800 text-white font-semibold text-xs hover:bg-stone-900 transition-colors"
            >
              Contact Support Team →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
