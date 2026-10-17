import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Truck, Clock, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import { Order } from '../../types';
import { orderApi } from '../../api/client';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderApi
      .getMyOrders()
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-[#FCFBF9] min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
          <div>
            <h1 className="text-2xl font-bold font-serif text-stone-900 tracking-tight">
              My Orders
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Review and track all your furniture orders placed with Shiridi Sai Enterprises.
            </p>
          </div>
          <Link
            to="/account/profile"
            className="text-xs font-semibold text-amber-800 hover:underline"
          >
            Manage Addresses →
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-40 bg-stone-100 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4 transition-all hover:shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100 text-xs">
                  <div>
                    <span className="text-stone-400">Order #</span>
                    <strong className="font-mono font-bold text-stone-900 ml-1">
                      {order.order_number}
                    </strong>
                    <span className="text-stone-400 ml-3">
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        order.order_status === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.order_status === 'cancelled'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {order.order_status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Items Preview */}
                <div className="divide-y divide-stone-50">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={it.image_url}
                          alt=""
                          className="w-12 h-12 object-cover rounded-xl border border-stone-200 shrink-0"
                        />
                        <div>
                          <p className="font-semibold text-stone-900 line-clamp-1">{it.product_name}</p>
                          <p className="text-stone-500">
                            Qty: {it.quantity} {it.color ? `• ${it.color}` : ''}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-stone-900 font-serif">
                        ₹{it.item_total.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Total and Actions */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-stone-500">Order Total (COD): </span>
                    <strong className="text-amber-900 font-serif font-black text-base ml-1">
                      ₹{order.final_total.toLocaleString('en-IN')}
                    </strong>
                  </div>

                  <Link
                    to={`/order-confirmation/${order.order_number}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-colors"
                  >
                    <span>View Receipt & Timeline</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 space-y-4">
            <Package className="w-12 h-12 text-stone-300 mx-auto" />
            <h3 className="font-bold text-base text-stone-900 font-serif">
              No orders placed yet
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              You haven't placed any orders with Shiridi Sai Enterprises yet. Discover our handcrafted solid wood pieces!
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-amber-800 text-white font-semibold text-xs tracking-wider uppercase shadow-sm"
            >
              Browse Collections
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
