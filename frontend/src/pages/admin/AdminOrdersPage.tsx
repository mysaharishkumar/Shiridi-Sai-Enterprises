import React, { useState, useEffect } from 'react';
import {
  ShoppingCart, Search, Filter, Eye, CheckCircle2, Clock,
  Truck, AlertCircle, X, Banknote, MapPin, Phone, User
} from 'lucide-react';
import { Order, OrderStatus, PaymentStatus } from '../../types';
import { adminApi } from '../../api/client';
import { useToast } from '../../context/ToastContext';

export const AdminOrdersPage: React.FC = () => {
  const { success, error: toastError } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [page, setPage] = useState(1);

  // Selected Order for inspection / status update
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('placed');
  const [newPaymentStatus, setNewPaymentStatus] = useState<PaymentStatus>('pending');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [courierPartner, setCourierPartner] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getOrders({
        search: search.trim() || undefined,
        order_status: statusFilter === 'all' ? undefined : statusFilter,
        payment_status: paymentFilter === 'all' ? undefined : paymentFilter,
        page,
        limit: 15
      });
      setOrders(res.items);
      setTotal(res.total);
    } catch (err: any) {
      toastError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [search, statusFilter, paymentFilter, page]);

  const handleOpenOrder = (ord: Order) => {
    setSelectedOrder(ord);
    setNewStatus(ord.order_status);
    setNewPaymentStatus(ord.payment_status);
    setTrackingNumber(ord.tracking_number || '');
    setCourierPartner(ord.courier_partner || 'White-Glove Van Delivery');
    setStatusNote('');
  };

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setUpdating(true);
    try {
      const updated = await adminApi.updateOrderStatus(selectedOrder.id, {
        order_status: newStatus,
        payment_status: newPaymentStatus,
        tracking_number: trackingNumber || undefined,
        courier_partner: courierPartner || undefined,
        note: statusNote || undefined
      });
      setSelectedOrder(updated);
      success(`Order #${updated.order_number} status updated to ${newStatus}`);
      fetchOrders();
    } catch (err: any) {
      toastError(err.message || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const totalPages = Math.ceil(total / 15) || 1;

  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 tracking-tight">
          Customer Orders & Dispatch Fulfillment
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Monitor incoming COD orders, dispatch stages, white-glove transport, and payments.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by order number, customer name, phone, email, PIN code..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:bg-white focus:outline-hidden"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full md:w-auto p-2 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:outline-hidden"
          >
            <option value="all">All Order Statuses</option>
            <option value="placed">Placed</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => {
              setPaymentFilter(e.target.value);
              setPage(1);
            }}
            className="w-full md:w-auto p-2 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:outline-hidden"
          >
            <option value="all">All Payment Statuses</option>
            <option value="pending">Pending (COD)</option>
            <option value="collected">Collected</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-stone-50/80 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Order #</th>
                <th className="py-3.5 px-3">Date</th>
                <th className="py-3.5 px-3">Customer</th>
                <th className="py-3.5 px-3">Destination</th>
                <th className="py-3.5 px-3 text-right">Order Total</th>
                <th className="py-3.5 px-3 text-center">Payment</th>
                <th className="py-3.5 px-3 text-center">Order Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-stone-400">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length > 0 ? (
                orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-stone-900">
                      {ord.order_number}
                    </td>

                    <td className="py-3 px-3 text-stone-500 whitespace-nowrap">
                      {new Date(ord.created_at).toLocaleDateString()}
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-bold text-stone-900 block">{ord.customer_name}</span>
                      <span className="text-stone-400 text-[11px]">{ord.customer_phone}</span>
                    </td>

                    <td className="py-3 px-3 text-stone-600">
                      <span>{ord.shipping_address?.city}, {ord.shipping_address?.pincode}</span>
                    </td>

                    <td className="py-3 px-3 text-right font-bold text-stone-900 font-serif">
                      ₹{ord.final_total.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          ord.payment_status === 'collected'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {ord.payment_status}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          ord.order_status === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.order_status === 'cancelled'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {ord.order_status?.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenOrder(ord)}
                        className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-900 font-semibold text-xs transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Manage</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-stone-400">
                    No orders match filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
            <span>
              Page {page} of {totalPages} ({total} total orders)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Management Inspector Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                  Order Management
                </span>
                <h2 className="text-xl font-bold font-serif text-stone-900">
                  Order #{selectedOrder.order_number}
                </h2>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Details & Shipping */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-stone-50 p-4 rounded-2xl border border-stone-200">
              <div>
                <strong className="text-stone-900 block mb-1">Customer Contact</strong>
                <p>{selectedOrder.customer_name}</p>
                <p>{selectedOrder.customer_phone}</p>
                <p>{selectedOrder.customer_email}</p>
              </div>

              <div>
                <strong className="text-stone-900 block mb-1">Shipping Destination</strong>
                <p>{selectedOrder.shipping_address?.street_address}</p>
                <p>
                  {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state} - {selectedOrder.shipping_address?.pincode}
                </p>
                {selectedOrder.delivery_instructions && (
                  <p className="text-amber-800 font-semibold mt-1">
                    Notes: {selectedOrder.delivery_instructions}
                  </p>
                )}
              </div>
            </div>

            {/* Items Snapshot */}
            <div>
              <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                Order Items ({selectedOrder.items.length})
              </h4>
              <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden">
                {selectedOrder.items.map((it, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between text-xs bg-white">
                    <div className="flex items-center gap-3">
                      <img src={it.image_url} alt="" className="w-10 h-10 object-cover rounded-lg" />
                      <div>
                        <span className="font-semibold text-stone-900">{it.product_name}</span>
                        <span className="text-stone-400 block">
                          Qty: {it.quantity} {it.color ? `• ${it.color}` : ''}
                        </span>
                      </div>
                    </div>
                    <span className="font-bold text-stone-900 font-serif">
                      ₹{it.item_total.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Transition Form */}
            <form onSubmit={handleStatusUpdate} className="space-y-4 pt-2 border-t border-stone-100 text-xs">
              <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                Update Order Stage & Logistics
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Order Status Transition
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                    className="w-full p-2.5 bg-stone-50 rounded-xl border border-stone-200 font-bold capitalize"
                  >
                    <option value="placed">Placed</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing (Wood Polishing)</option>
                    <option value="shipped">Shipped (Out for Delivery)</option>
                    <option value="delivered">Delivered & Assembled</option>
                    <option value="cancelled">Cancelled (Restore Stock)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Payment Status (COD)
                  </label>
                  <select
                    value={newPaymentStatus}
                    onChange={(e) => setNewPaymentStatus(e.target.value as PaymentStatus)}
                    className="w-full p-2.5 bg-stone-50 rounded-xl border border-stone-200 font-bold capitalize"
                  >
                    <option value="pending">Pending (Cash on Delivery)</option>
                    <option value="collected">Collected (Cash Received)</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Courier / Vehicle Partner
                  </label>
                  <input
                    type="text"
                    value={courierPartner}
                    onChange={(e) => setCourierPartner(e.target.value)}
                    placeholder="e.g. Dedicated White-Glove Van #4"
                    className="w-full p-2.5 bg-stone-50 rounded-xl border border-stone-200"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Tracking Number
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g. TRK-HYD-8821"
                    className="w-full p-2.5 bg-stone-50 rounded-xl border border-stone-200 font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Status History Note (Internal / Customer audit)
                  </label>
                  <input
                    type="text"
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="e.g. Teak sanding complete, packed with corner protectors."
                    className="w-full p-2.5 bg-stone-50 rounded-xl border border-stone-200"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 font-semibold"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-6 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  {updating ? 'Updating...' : 'Save Order Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
