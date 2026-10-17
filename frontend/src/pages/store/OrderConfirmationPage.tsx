import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle, Package, Truck, Clock, ArrowRight, Printer,
  MapPin, Phone, ShieldCheck, Banknote
} from 'lucide-react';
import { Order } from '../../types';
import { orderApi } from '../../api/client';

export const OrderConfirmationPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderNumber) return;
    orderApi
      .getOrder(orderNumber)
      .then(setOrder)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [orderNumber]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center animate-pulse space-y-4">
        <div className="w-16 h-16 rounded-full bg-stone-200 mx-auto" />
        <div className="h-8 bg-stone-200 rounded-lg w-1/2 mx-auto" />
        <div className="h-4 bg-stone-200 rounded-lg w-1/3 mx-auto" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold font-serif text-stone-900">Order Not Found</h2>
        <p className="text-stone-500 text-xs">
          We could not locate the details for this order number.
        </p>
        <Link to="/" className="text-amber-800 font-semibold text-xs hover:underline">
          Return to Home →
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#FCFBF9] min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Celebration Banner */}
        <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 text-center shadow-xs space-y-4 mb-8">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner animate-in zoom-in-75">
            <CheckCircle className="w-10 h-10" />
          </div>

          <span className="text-xs font-bold text-amber-800 uppercase tracking-widest">
            Order Placed Successfully
          </span>

          <h1 className="text-2xl sm:text-4xl font-bold font-serif text-stone-900 tracking-tight">
            Thank You, {order.customer_name}!
          </h1>

          <p className="text-stone-600 text-xs sm:text-sm max-w-lg mx-auto font-light leading-relaxed">
            Your furniture order has been received by our master craftsman workshop. We will contact you at{' '}
            <strong className="text-stone-900 font-semibold">{order.customer_phone}</strong> to confirm dispatch and scheduling.
          </p>

          <div className="inline-flex items-center gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-700 mt-2">
            <span>Order Number:</span>
            <strong className="font-mono text-amber-900 text-sm font-black tracking-wider">
              {order.order_number}
            </strong>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3 no-print">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-stone-300 hover:bg-stone-50 text-stone-700 font-semibold text-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Order Receipt</span>
            </button>

            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-amber-800 hover:bg-amber-900 text-white font-semibold text-xs tracking-wider uppercase transition-colors shadow-sm"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Order Details & Status Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Items and Summary */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
              <h2 className="text-base font-bold font-serif text-stone-900 pb-3 border-b border-stone-100 flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-800" />
                Ordered Furniture Pieces
              </h2>

              <div className="divide-y divide-stone-100">
                {order.items.map((it, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          it.image_url ||
                          'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=150&q=80'
                        }
                        alt={it.product_name}
                        className="w-16 h-16 object-cover rounded-xl border border-stone-200 shrink-0"
                      />
                      <div className="space-y-0.5 text-xs">
                        <h4 className="font-semibold text-stone-900">{it.product_name}</h4>
                        {it.color && <p className="text-stone-500">Color: {it.color}</p>}
                        <p className="text-stone-400">Qty: {it.quantity} × ₹{it.unit_price.toLocaleString('en-IN')}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-sm text-stone-900 font-serif">
                        ₹{it.item_total.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Calculation */}
              <dl className="space-y-2 text-xs pt-4 border-t border-stone-100">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-900">
                    ₹{order.subtotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Delivery & Assembly</span>
                  <span>
                    {order.delivery_charge === 0 ? (
                      <span className="text-emerald-700 font-bold uppercase">FREE</span>
                    ) : (
                      <span className="font-semibold text-stone-900">
                        ₹{order.delivery_charge.toLocaleString('en-IN')}
                      </span>
                    )}
                  </span>
                </div>
                <div className="pt-3 border-t border-stone-100 flex justify-between items-baseline">
                  <span className="font-bold text-sm text-stone-900">Total Payable at Delivery</span>
                  <span className="text-xl font-black text-amber-900 font-serif">
                    ₹{order.final_total.toLocaleString('en-IN')}
                  </span>
                </div>
              </dl>
            </div>
          </div>

          {/* Right Column: Address and Status Details */}
          <div className="space-y-6">
            {/* Delivery Address Card */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-800" />
                Delivery Address
              </h3>

              <div className="text-xs text-stone-600 space-y-1 leading-relaxed">
                <p className="font-bold text-stone-900">{order.shipping_address.full_name}</p>
                <p>{order.shipping_address.street_address}</p>
                {order.shipping_address.landmark && <p>Landmark: {order.shipping_address.landmark}</p>}
                <p>
                  {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}
                </p>
                <p className="font-medium text-stone-800 pt-1">Phone: {order.shipping_address.phone}</p>
              </div>

              <div className="pt-3 border-t border-stone-100 text-xs">
                <span className="text-stone-500 block">Payment Method:</span>
                <span className="font-bold text-stone-900 flex items-center gap-1.5 mt-0.5">
                  <Banknote className="w-4 h-4 text-emerald-600" />
                  Cash on Delivery (Pending)
                </span>
              </div>
            </div>

            {/* Order Status Tracking Card */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-800" />
                Order Status
              </h3>

              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-center">
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                  Current Status
                </span>
                <span className="text-sm font-black text-amber-950 capitalize block mt-0.5">
                  {order.order_status.replace('_', ' ')}
                </span>
              </div>

              {order.status_history && order.status_history.length > 0 && (
                <div className="space-y-3 pt-2">
                  {order.status_history.map((h, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs">
                      <div className="w-2 h-2 rounded-full bg-amber-700 mt-1.5 shrink-0" />
                      <div>
                        <span className="font-bold text-stone-900 capitalize block">
                          {h.status.replace('_', ' ')}
                        </span>
                        {h.note && <p className="text-[11px] text-stone-500">{h.note}</p>}
                        <span className="text-[10px] text-stone-400">
                          {new Date(h.timestamp).toLocaleDateString()} {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
