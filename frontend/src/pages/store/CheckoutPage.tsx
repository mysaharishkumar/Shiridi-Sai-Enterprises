import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Truck, ShieldCheck, CheckCircle2, ArrowLeft, Banknote,
  MapPin, Phone, User, FileText, AlertCircle
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { orderApi } from '../../api/client';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, refreshCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { error: toastError, success: toastSuccess } = useToast();

  const [formData, setFormData] = useState({
    customer_name: user?.name || '',
    customer_email: user?.email || '',
    customer_phone: user?.phone || '',
    street_address: '',
    landmark: '',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500072',
    delivery_instructions: ''
  });

  const [selectedSavedAddrIndex, setSelectedSavedAddrIndex] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Auto-populate user addresses if available
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        customer_name: user.name || prev.customer_name,
        customer_email: user.email || prev.customer_email,
        customer_phone: user.phone || prev.customer_phone
      }));

      if (user.addresses && user.addresses.length > 0) {
        const defaultAddr = user.addresses.find((a) => a.is_default) || user.addresses[0];
        setFormData((prev) => ({
          ...prev,
          customer_name: defaultAddr.full_name || prev.customer_name,
          customer_phone: defaultAddr.phone || prev.customer_phone,
          street_address: defaultAddr.street_address || '',
          landmark: defaultAddr.landmark || '',
          city: defaultAddr.city || 'Hyderabad',
          state: defaultAddr.state || 'Telangana',
          pincode: defaultAddr.pincode || '500072'
        }));
        setSelectedSavedAddrIndex(0);
      }
    }
  }, [user]);

  const handleSelectSavedAddress = (index: number) => {
    if (!user?.addresses?.[index]) return;
    const addr = user.addresses[index];
    setSelectedSavedAddrIndex(index);
    setFormData((prev) => ({
      ...prev,
      customer_name: addr.full_name,
      customer_phone: addr.phone,
      street_address: addr.street_address,
      landmark: addr.landmark || '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cart || cart.items.length === 0) {
      toastError('Your cart is empty');
      navigate('/cart');
      return;
    }

    if (!formData.customer_name.trim() || !formData.customer_phone.trim() || !formData.street_address.trim() || !formData.pincode.trim()) {
      toastError('Please complete all required delivery details');
      return;
    }

    setSubmitting(true);
    try {
      const orderPayload = {
        customer_name: formData.customer_name.trim(),
        customer_email: formData.customer_email.trim() || 'customer@shiridisaienterprises.com',
        customer_phone: formData.customer_phone.trim(),
        shipping_address: {
          full_name: formData.customer_name.trim(),
          phone: formData.customer_phone.trim(),
          street_address: formData.street_address.trim(),
          landmark: formData.landmark.trim() || undefined,
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim(),
          is_default: true
        },
        delivery_instructions: formData.delivery_instructions.trim() || undefined,
        payment_method: 'cod'
      };

      const createdOrder = await orderApi.createOrder(orderPayload);
      toastSuccess(`Order ${createdOrder.order_number} confirmed!`);
      await refreshCart();
      navigate(`/order-confirmation/${createdOrder.order_number}`);
    } catch (err: any) {
      toastError(err.message || 'Failed to place order. Please check stock availability.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-stone-500 mb-4">Your cart is empty.</p>
        <Link to="/products" className="text-stone-800 font-bold hover:underline">
          Return to Shopping →
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#FCFBF9] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-stone-500 mb-6 font-medium">
          <Link to="/cart" className="hover:text-stone-800 transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Cart
          </Link>
          <span>/</span>
          <span className="text-stone-900 font-bold">Checkout</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 mb-8 tracking-tight">
          Delivery Address & Checkout
        </h1>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Form: Delivery Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Saved Addresses (if customer is logged in) */}
            {user?.addresses && user.addresses.length > 0 && (
              <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-3">
                <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                  Select a Saved Address
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {user.addresses.map((addr, idx) => (
                    <div
                      key={addr.id || idx}
                      onClick={() => handleSelectSavedAddress(idx)}
                      className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all ${
                        selectedSavedAddrIndex === idx
                          ? 'border-stone-800 bg-stone-100/70 text-stone-950 ring-2 ring-stone-700/20 shadow-xs'
                          : 'border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      <div className="font-bold text-stone-900">{addr.full_name}</div>
                      <div className="text-stone-600 line-clamp-2 mt-0.5">{addr.street_address}</div>
                      <div className="text-stone-500 mt-1">
                        {addr.city}, {addr.state} - {addr.pincode}
                      </div>
                      <div className="text-stone-500 font-semibold">{addr.phone}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Address Input Fields */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
              <h2 className="text-lg font-bold font-serif text-stone-900 pb-3 border-b border-stone-100 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-stone-800" />
                Shipping & Contact Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={handleChange}
                    placeholder="e.g. Ramesh Chandra"
                    className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs focus:bg-white focus:border-stone-700 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Phone / Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    name="customer_phone"
                    value={formData.customer_phone}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs focus:bg-white focus:border-stone-700 focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Email Address (For invoice & order updates) *
                  </label>
                  <input
                    type="email"
                    required
                    name="customer_email"
                    value={formData.customer_email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs focus:bg-white focus:border-stone-700 focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Flat, House No., Building, Street Address *
                  </label>
                  <input
                    type="text"
                    required
                    name="street_address"
                    value={formData.street_address}
                    onChange={handleChange}
                    placeholder="House/Flat number, Apartment name, Road or Colony"
                    className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs focus:bg-white focus:border-stone-700 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    name="landmark"
                    value={formData.landmark}
                    onChange={handleChange}
                    placeholder="Near temple, metro station, park..."
                    className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs focus:bg-white focus:border-stone-700 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="6-digit postal code"
                    className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs focus:bg-white focus:border-stone-700 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    City / District *
                  </label>
                  <input
                    type="text"
                    required
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs focus:bg-white focus:border-stone-700 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    State *
                  </label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs focus:bg-white focus:border-stone-700 focus:outline-hidden"
                  >
                    <option value="Telangana">Telangana</option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Maharashtra">Maharashtra</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Delivery Instructions (Optional)
                  </label>
                  <textarea
                    rows={2}
                    name="delivery_instructions"
                    value={formData.delivery_instructions}
                    onChange={handleChange}
                    placeholder="Elevator availability, preferred delivery time, gate security instructions..."
                    className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs focus:bg-white focus:border-stone-700 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Section: Cash on Delivery (COD) */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
              <h2 className="text-lg font-bold font-serif text-stone-900 pb-3 border-b border-stone-100 flex items-center gap-2">
                <Banknote className="w-5 h-5 text-stone-800" />
                Payment Method
              </h2>

              <div className="p-4 rounded-2xl bg-stone-50 border-2 border-stone-700 flex items-start gap-4">
                <div className="w-5 h-5 rounded-full bg-stone-800 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-stone-900">
                    Cash on Delivery (COD)
                  </h4>
                  <p className="text-xs text-stone-600 leading-relaxed font-light">
                    Pay in cash or UPI scan when your solid wood furniture is delivered, unpacked, and inspected at your home.
                  </p>
                  <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Safe & Zero Risk Guarantee
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Review & Confirmation */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-6 sticky top-28">
              <h2 className="text-lg font-bold font-serif text-stone-900 pb-3 border-b border-stone-100">
                Order Review
              </h2>

              {/* Items Preview */}
              <div className="divide-y divide-stone-100 max-h-60 overflow-y-auto pr-1">
                {cart.items.map((item) => (
                  <div key={item.item_id} className="py-2.5 flex items-center gap-3">
                    <img
                      src={item.image_url}
                      alt={item.product_name}
                      className="w-12 h-12 object-cover rounded-lg border border-stone-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0 text-xs">
                      <p className="font-semibold text-stone-900 truncate">{item.product_name}</p>
                      <p className="text-stone-500">
                        Qty: {item.quantity} {item.color ? `• ${item.color}` : ''}
                      </p>
                    </div>
                    <span className="font-bold text-xs text-stone-900 whitespace-nowrap">
                      ₹{item.subtotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Calculation Summary */}
              <dl className="space-y-2.5 text-xs pt-3 border-t border-stone-100">
                <div className="flex justify-between text-stone-600">
                  <span>Items Subtotal</span>
                  <span className="font-bold text-stone-900">
                    ₹{cart.subtotal.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between text-stone-600">
                  <span>Delivery & Installation</span>
                  <span>
                    {cart.delivery_charge === 0 ? (
                      <span className="text-emerald-700 font-bold uppercase">FREE</span>
                    ) : (
                      <span className="font-bold text-stone-900">
                        ₹{cart.delivery_charge.toLocaleString('en-IN')}
                      </span>
                    )}
                  </span>
                </div>

                <div className="pt-3 border-t border-stone-100 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-stone-900">Final Total (COD)</span>
                  <span className="text-2xl font-black text-stone-900 font-serif">
                    ₹{cart.final_total.toLocaleString('en-IN')}
                  </span>
                </div>
              </dl>

              {/* Submit Order Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-2xl bg-stone-800 hover:bg-stone-900 active:scale-98 text-white font-bold text-sm tracking-wide shadow-xl shadow-stone-950/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <span className="animate-pulse">Placing Your Order...</span>
                ) : (
                  <span>Confirm Cash on Delivery Order</span>
                )}
              </button>

              <div className="text-[11px] text-stone-500 text-center leading-relaxed">
                By clicking Confirm, you agree to our{' '}
                <Link to="/policies/terms" className="underline text-stone-700 hover:text-stone-900">
                  Terms of Service
                </Link>{' '}
                and 7-Day Replacement Policy.
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
