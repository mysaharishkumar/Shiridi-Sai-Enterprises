import React, { useState, useEffect } from 'react';
import {
  MessageSquare, Phone, Mail, Clock, CheckCircle2, Trash2,
  RefreshCw, MessageCircle, User, AlertCircle
} from 'lucide-react';
import { CustomerInquiry } from '../../types';
import { adminApi } from '../../api/client';
import { useToast } from '../../context/ToastContext';

export const AdminInquiriesPage: React.FC = () => {
  const { success, error: toastError } = useToast();
  const [inquiries, setInquiries] = useState<CustomerInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchInquiries = async () => {
    try {
      const data = await adminApi.getInquiries();
      setInquiries(data);
    } catch (err: any) {
      toastError(err.message || 'Failed to fetch customer inquiries');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchInquiries();
  };

  const handleMarkContacted = async (inq: CustomerInquiry) => {
    const nextStatus = inq.status === 'contacted' ? 'new' : 'contacted';
    try {
      await adminApi.updateInquiryStatus(inq.id, nextStatus);
      success(`Inquiry marked as ${nextStatus}`);
      fetchInquiries();
    } catch (err: any) {
      toastError(err.message || 'Failed to update status');
    }
  };

  const handleDelete = async (inq: CustomerInquiry) => {
    if (!window.confirm(`Delete inquiry from ${inq.name}?`)) return;
    try {
      await adminApi.deleteInquiry(inq.id);
      success('Inquiry deleted');
      fetchInquiries();
    } catch (err: any) {
      toastError(err.message || 'Failed to delete inquiry');
    }
  };

  const newCount = inquiries.filter((i) => i.status === 'new').length;

  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 tracking-tight">
              Customer Messages & Inquiries
            </h1>
            {newCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-bold text-xs animate-pulse">
                {newCount} New
              </span>
            )}
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Incoming customer requirements sent from the Contact Us form and showroom website.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold shadow-xs cursor-pointer active:scale-95 transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Messages</span>
        </button>
      </div>

      {/* Inquiries List */}
      {loading ? (
        <div className="p-12 text-center text-stone-400 text-xs bg-white rounded-3xl border border-stone-200">
          Loading customer inquiries...
        </div>
      ) : inquiries.length > 0 ? (
        <div className="space-y-4">
          {inquiries.map((inq) => {
            const cleanPhone = inq.phone.replace(/[^0-9]/g, '');
            const whatsappUrl = `https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`}?text=${encodeURIComponent(
              `Hi ${inq.name}, thank you for contacting Shiridi Sai Enterprises regarding "${inq.subject || 'your inquiry'}". How can we assist you today?`
            )}`;

            return (
              <div
                key={inq.id}
                className={`bg-white rounded-3xl border p-5 sm:p-6 transition-all shadow-xs space-y-4 ${
                  inq.status === 'new'
                    ? 'border-stone-400 ring-2 ring-stone-400/20 shadow-sm'
                    : 'border-stone-200 opacity-90'
                }`}
              >
                {/* Header row: Name, status, date */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center font-bold text-stone-700 font-serif shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-stone-900 text-sm">{inq.name}</span>
                      {inq.subject && (
                        <span className="text-stone-500 ml-2 font-medium">
                          • {inq.subject}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-stone-400 text-[11px] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(inq.created_at).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        inq.status === 'new'
                          ? 'bg-amber-100 text-amber-900 font-extrabold'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {inq.status === 'new' ? 'Unread / New' : 'Contacted'}
                    </span>
                  </div>
                </div>

                {/* Message Body */}
                <div className="p-4 bg-stone-50 rounded-2xl text-xs text-stone-800 leading-relaxed font-sans border border-stone-100">
                  <strong className="block text-stone-500 text-[10px] uppercase tracking-wider mb-1">
                    Customer Message:
                  </strong>
                  <p className="whitespace-pre-line">{inq.message}</p>
                </div>

                {/* Contact info & Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
                  {/* Direct Contact links */}
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Call Button */}
                    <a
                      href={`tel:${inq.phone}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-900 text-white font-bold transition-all shadow-xs cursor-pointer"
                      title="Call customer directly"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call: {inq.phone}</span>
                    </a>

                    {/* WhatsApp Reply */}
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-xs cursor-pointer"
                      title="Reply to customer on WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Reply on WhatsApp</span>
                    </a>

                    {/* Email Link */}
                    {inq.email && (
                      <a
                        href={`mailto:${inq.email}?subject=${encodeURIComponent(`Re: ${inq.subject || 'Furniture Inquiry'}`)}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-700 transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5 text-stone-500" />
                        <span>{inq.email}</span>
                      </a>
                    )}
                  </div>

                  {/* Manage status / Delete */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleMarkContacted(inq)}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                        inq.status === 'contacted'
                          ? 'border border-stone-200 text-stone-600 hover:bg-stone-50'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{inq.status === 'contacted' ? 'Mark as New' : 'Mark as Contacted'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(inq)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                      title="Delete Inquiry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 space-y-3">
          <MessageSquare className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="font-bold text-sm text-stone-900 font-serif">
            No customer inquiries yet
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            When customers fill out the contact form on your storefront, their inquiries will appear here with instant call and WhatsApp actions.
          </p>
        </div>
      )}
    </div>
  );
};
