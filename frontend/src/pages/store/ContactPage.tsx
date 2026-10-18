import React, { useState } from 'react';
import { Phone, Mail, MapPin, MessageCircle, Clock, Send, CheckCircle2, ExternalLink, Loader2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';
import { storeApi } from '../../api/client';

export const ContactPage: React.FC = () => {
  const { settings } = useStore();
  const { success, error: toastError } = useToast();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    name: string;
    phone: string;
    email: string;
    subject: string;
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await storeApi.submitInquiry({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim()
      });
      setSubmittedData({ ...form });
      success('Thank you! Your inquiry has been sent to our store team.');
      setSubmitted(true);
      setForm({ name: '', phone: '', email: '', subject: '', message: '' });
    } catch (err: any) {
      toastError(err.message || 'Failed to send inquiry. Please try WhatsApp or calling us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FCFBF9] min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold text-stone-700 uppercase tracking-widest">
            Shiridi Sai Enterprises Support
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif text-stone-900 tracking-tight">
            Contact Our Furniture Studio
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 font-light">
            Whether you want custom sizing, timber advice, or delivery scheduling, our furniture specialists are ready to assist.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Contact Details Column */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
              <h3 className="text-base font-bold font-serif text-stone-900 pb-3 border-b border-stone-100">
                Store Information
              </h3>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-stone-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-stone-900 mb-0.5">Showroom & Workshop</strong>
                    <span className="text-stone-600 leading-relaxed block">{settings?.address}</span>
                    <a
                      href={settings?.google_maps_url || "https://maps.app.goo.gl/BAFvRkWfaPYMjKHP9?g_st=aw"}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-[11px] font-bold transition-colors"
                    >
                      <span>Open in Google Maps</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-stone-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-stone-900 mb-0.5">Direct Helpline</strong>
                    <a href={`tel:${settings?.phone}`} className="text-stone-600 hover:text-stone-900 font-medium">
                      {settings?.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-stone-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-stone-900 mb-0.5">Email Support</strong>
                    <a href={`mailto:${settings?.email}`} className="text-stone-600 hover:text-stone-900">
                      {settings?.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-stone-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-stone-900 mb-0.5">Working Hours</strong>
                    <span className="text-stone-600">Monday – Sunday: 9:30 AM to 9:00 PM IST</span>
                  </div>
                </div>
              </div>

              {settings?.whatsapp_number && (
                <div className="pt-4 border-t border-stone-100">
                  <a
                    href={`https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Instant WhatsApp Chat</span>
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Inquiry Form */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 sm:p-10 rounded-3xl border border-stone-200 shadow-xs space-y-6">
              <h3 className="text-base font-bold font-serif text-stone-900 pb-3 border-b border-stone-100">
                Send Us a Message
              </h3>

              {submitted ? (
                <div className="p-8 text-center bg-stone-50 rounded-3xl border border-stone-200 space-y-6">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-600">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-lg text-stone-900 font-serif">
                      Inquiry Received & Logged to Admin Portal
                    </h4>
                    <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
                      Thank you, <strong className="text-stone-900">{submittedData?.name}</strong>! Your inquiry has been saved to the store's central database. Our team will review your requirements and get in touch with you shortly.
                    </p>
                  </div>

                  {/* Immediate Direct Options to Connect with Admin */}
                  <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-center gap-3">
                    {submittedData && (
                      <a
                        href={`https://wa.me/${(settings?.whatsapp_number || '9849012345').replace(/[^0-9]/g, '').startsWith('91') ? (settings?.whatsapp_number || '9849012345').replace(/[^0-9]/g, '') : `91${(settings?.whatsapp_number || '9849012345').replace(/[^0-9]/g, '')}`}?text=${encodeURIComponent(
                          `*New Inquiry - Shiridi Sai Furnitures*\n\n*Name:* ${submittedData.name}\n*Phone:* ${submittedData.phone}\n*Email:* ${submittedData.email}\n*Subject:* ${submittedData.subject || 'Furniture Inquiry'}\n*Message:*\n${submittedData.message}`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center justify-center gap-2 transition-all shadow-sm"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Send via WhatsApp to Admin Directly</span>
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="w-full sm:w-auto px-5 py-3 rounded-xl border border-stone-300 hover:bg-stone-200 text-stone-700 font-semibold text-xs transition-colors cursor-pointer"
                    >
                      Send Another Message
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Ramesh Chandra"
                        className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs focus:bg-white focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                        Mobile Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="10-digit mobile"
                        className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs focus:bg-white focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="name@example.com"
                      className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                      Subject / Furniture Category
                    </label>
                    <input
                      type="text"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      placeholder="e.g. Custom 6-Seater Dining Table inquiry"
                      className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                      Message / Specifications *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Please let us know your requirements, preferred wood finish, or room dimensions..."
                      className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-3.5 rounded-full bg-stone-800 hover:bg-stone-900 disabled:opacity-60 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending Inquiry...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Inquiry</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
