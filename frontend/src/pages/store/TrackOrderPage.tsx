import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, Search, Truck, Clock, CheckCircle, AlertCircle,
  MapPin, Phone, ArrowLeft, XCircle
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { orderApi } from '../../api/client';
import { useToast } from '../../context/ToastContext';

export const TrackOrderPage: React.FC = () => {
  const { error: toastError, success: toastSuccess } = useToast();
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) {
      toastError('Please enter your order number');
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const data = await orderApi.getOrder(orderNumber.trim(), phone.trim() || undefined);
      setOrder(data);
    } catch (err: any) {
      toastError(err.message || 'Order not found. Please verify your order number and mobile.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order || !cancelReason.trim()) return;
    setCancelling(true);
    try {
      const updated = await orderApi.cancelOrder(order.id, cancelReason);
      setOrder(updated);
      toastSuccess('Order has been cancelled successfully.');
      setShowCancelModal(false);
    } catch (err: any) {
      toastError(err.message || 'Unable to cancel order.');
    } finally {
      setCancelling(false);
    }
  };

  const steps = [
    { key: 'placed', label: 'Order Placed' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'processing', label: 'Processing & Wood Polishing' },
    { key: 'shipped', label: 'Out for White-Glove Delivery' },
    { key: 'delivered', label: 'Delivered & Assembled' }
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'placed':
        return 0;
      case 'confirmed':
        return 1;
      case 'processing':
        return 2;
      case 'shipped':
        return 3;
      case 'delivered':
        return 4;
      default:
        return 0;
    }
  };

  const currentStep = order ? getStepIndex(order.order_status) : 0;
  const isCancelled = order?.order_status === 'cancelled';

  return (
    <div className="bg-[#FCFBF9] min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold text-amber-800 uppercase tracking-widest">
            Order Status Tracking
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 tracking-tight">
            Track Your Furniture Order
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
            Enter your unique order number (e.g. SSE-2026-XXXXX) sent via SMS or email to track workshop progress and delivery schedule.
          </p>
        </div>

        {/* Tracking Search Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs">
          <form onSubmit={handleTrack} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Order Number *
              </label>
              <input
                type="text"
                required
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="SSE-2026-XXXXX"
                className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs font-mono font-bold focus:bg-white focus:border-amber-700 focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-1">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Phone Number (Optional verification)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile"
                className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs focus:bg-white focus:border-amber-700 focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-1 flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-xl bg-amber-800 hover:bg-amber-900 active:scale-98 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span className="animate-pulse">Locating...</span>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Track Order</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Order Details View */}
        {order && (
          <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 sm:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2">
            {/* Order Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
              <div>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                  Order Details
                </span>
                <h2 className="text-xl font-bold font-serif text-stone-900 mt-0.5">
                  Order #{order.order_number}
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  Placed on {new Date(order.created_at).toLocaleDateString()} at{' '}
                  {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    isCancelled
                      ? 'bg-rose-100 text-rose-800'
                      : order.order_status === 'delivered'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  {order.order_status.replace('_', ' ')}
                </span>

                {order.can_cancel && !isCancelled && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="px-3 py-1 rounded-full border border-rose-300 text-rose-600 hover:bg-rose-50 text-xs font-semibold cursor-pointer"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>

            {/* Visual Timeline Tracker */}
            {!isCancelled ? (
              <div className="py-4">
                <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-6">
                  Delivery Progress
                </h3>
                <div className="relative">
                  {/* Connecting Line */}
                  <div className="absolute top-4 left-4 right-4 sm:left-6 sm:right-6 h-0.5 bg-stone-200 -z-0 hidden sm:block" />

                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative z-10">
                    {steps.map((st, idx) => {
                      const isComplete = currentStep >= idx;
                      const isCurrent = currentStep === idx;

                      return (
                        <div key={st.key} className="flex sm:flex-col items-center gap-3 sm:text-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                              isComplete
                                ? 'bg-amber-800 text-white shadow-md shadow-amber-900/20'
                                : 'bg-stone-200 text-stone-500'
                            } ${isCurrent ? 'ring-4 ring-amber-600/20' : ''}`}
                          >
                            {isComplete ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                          </div>
                          <div>
                            <span
                              className={`text-xs block ${
                                isComplete ? 'font-bold text-stone-900' : 'text-stone-400 font-medium'
                              }`}
                            >
                              {st.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 flex items-center gap-3 text-rose-900 text-xs font-semibold">
                <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>This order was cancelled. Restocked in inventory.</span>
              </div>
            )}

            {/* Courier & Tracking Details */}
            {(order.tracking_number || order.courier_partner) && (
              <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div>
                  <span className="text-stone-500">Logistics Partner: </span>
                  <strong className="text-stone-900">{order.courier_partner || 'Dedicated White-Glove Van'}</strong>
                </div>
                <div>
                  <span className="text-stone-500">Tracking Reference: </span>
                  <strong className="font-mono text-amber-900">{order.tracking_number}</strong>
                </div>
                {order.estimated_delivery_date && (
                  <div>
                    <span className="text-stone-500">Expected Date: </span>
                    <strong className="text-stone-900">{order.estimated_delivery_date}</strong>
                  </div>
                )}
              </div>
            )}

            {/* Items & Shipping Snapshot */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-stone-100">
              {/* Ordered Items */}
              <div>
                <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-3">
                  Items Snapshot
                </h4>
                <div className="space-y-3">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-xs">
                      <img
                        src={it.image_url}
                        alt=""
                        className="w-12 h-12 object-cover rounded-lg border border-stone-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-stone-900 truncate">{it.product_name}</p>
                        <p className="text-stone-500">
                          Qty: {it.quantity} {it.color ? `• ${it.color}` : ''}
                        </p>
                      </div>
                      <span className="font-bold text-stone-900">₹{it.item_total.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-3">
                  Destination Address
                </h4>
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-600 space-y-1">
                  <p className="font-bold text-stone-900">{order.shipping_address.full_name}</p>
                  <p>{order.shipping_address.street_address}</p>
                  <p>
                    {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}
                  </p>
                  <p className="text-stone-700 font-semibold pt-1">Phone: {order.shipping_address.phone}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cancellation Reason Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 z-50 bg-stone-950/60 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 animate-in zoom-in-95">
              <h3 className="text-lg font-bold font-serif text-stone-900">
                Cancel Furniture Order #{order?.order_number}
              </h3>
              <p className="text-xs text-stone-500">
                Are you sure you want to cancel this order? Once cancelled, items will be released back into stock.
              </p>
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Reason for Cancellation *
                </label>
                <textarea
                  rows={3}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Changed room plan, ordered incorrect size, delayed delivery..."
                  className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700"
                >
                  Keep Order
                </button>
                <button
                  onClick={handleCancelOrder}
                  disabled={cancelling || !cancelReason.trim()}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold disabled:opacity-50"
                >
                  {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
