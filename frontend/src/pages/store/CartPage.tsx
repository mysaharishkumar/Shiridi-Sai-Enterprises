import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2, ShoppingBag, ArrowRight, ShieldCheck, Truck,
  ArrowLeft, CheckCircle2, AlertCircle
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, isLoading, updateQuantity, removeItem, clearCart } = useCart();
  const { settings } = useStore();

  const isCartEmpty = !cart || !cart.items || cart.items.length === 0;

  if (isCartEmpty && !isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-24 h-24 rounded-full bg-stone-100 text-stone-800 flex items-center justify-center mx-auto mb-6 shadow-inner">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 mb-3">
          Your Shopping Cart is Empty
        </h1>
        <p className="text-stone-500 text-sm max-w-md mx-auto mb-8">
          Explore our handcrafted solid teak wood furniture, luxurious living sets, and bedroom suites to begin furnishing your dream home.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-stone-800 hover:bg-stone-900 text-white font-semibold text-xs tracking-wider uppercase shadow-md transition-all active:scale-95"
        >
          <span>Browse Furniture Collections</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const freeDeliveryProgress = Math.min(
    100,
    Math.round((cart.subtotal / (cart.free_delivery_threshold || 15000)) * 100)
  );

  return (
    <div className="bg-[#FCFBF9] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between pb-6 mb-8 border-b border-stone-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 tracking-tight">
              Shopping Cart
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              {cart.total_items} handcrafted {cart.total_items === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>

          <button
            onClick={clearCart}
            className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Cart</span>
          </button>
        </div>

        {/* Free Delivery Banner */}
        <div className="mb-8 p-4 bg-white rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className="flex items-center gap-1.5 text-stone-800">
              <Truck className="w-4 h-4 text-stone-700" />
              {cart.free_delivery_remaining > 0 ? (
                <>
                  Add{' '}
                  <strong className="text-stone-800 font-bold">
                    ₹{cart.free_delivery_remaining.toLocaleString('en-IN')}
                  </strong>{' '}
                  more to get Free Doorstep Delivery!
                </>
              ) : (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> You've unlocked FREE Doorstep White-Glove Delivery!
                </span>
              )}
            </span>
            <span className="text-stone-500 font-bold">{freeDeliveryProgress}%</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                freeDeliveryProgress >= 100 ? 'bg-emerald-600' : 'bg-stone-800'
              }`}
              style={{ width: `${freeDeliveryProgress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.item_id}
                className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row gap-4 sm:items-center justify-between transition-all"
              >
                {/* Thumbnail & Info */}
                <div className="flex items-start gap-4">
                  <img
                    src={
                      item.image_url ||
                      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=200&q=80'
                    }
                    alt={item.product_name}
                    className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl border border-stone-200 shrink-0"
                  />
                  <div className="space-y-1">
                    <Link
                      to={`/product/${item.product_slug}`}
                      className="font-semibold text-sm sm:text-base text-stone-900 hover:text-stone-700 transition-colors line-clamp-1"
                    >
                      {item.product_name}
                    </Link>
                    {item.color && (
                      <p className="text-xs text-stone-500 font-medium">Color: {item.color}</p>
                    )}
                    {item.sku && (
                      <p className="text-[11px] text-stone-400">SKU: {item.sku}</p>
                    )}
                    <p className="text-xs font-bold text-stone-800 pt-1">
                      ₹{item.unit_price.toLocaleString('en-IN')} each
                    </p>
                  </div>
                </div>

                {/* Quantity Controls & Subtotal */}
                <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                  <div className="flex items-center rounded-xl border border-stone-300 bg-stone-50 p-1">
                    <button
                      onClick={() => updateQuantity(item.item_id, item.quantity - 1)}
                      className="w-7 h-7 rounded-lg bg-white flex items-center justify-center font-bold text-stone-700 hover:bg-stone-100 text-xs"
                    >
                      -
                    </button>
                    <span className="w-9 text-center text-xs font-bold text-stone-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.item_id, item.quantity + 1)}
                      disabled={item.quantity >= item.available_stock}
                      className="w-7 h-7 rounded-lg bg-white flex items-center justify-center font-bold text-stone-700 hover:bg-stone-100 text-xs disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right min-w-[90px]">
                    <span className="text-sm sm:text-base font-bold text-stone-900 block font-serif">
                      ₹{item.subtotal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <button
                    onClick={() => removeItem(item.item_id)}
                    className="p-2 text-stone-400 hover:text-rose-600 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            <div className="pt-4 flex justify-between items-center text-xs">
              <Link
                to="/products"
                className="inline-flex items-center gap-1.5 font-semibold text-stone-800 hover:text-stone-900"
              >
                <ArrowLeft className="w-4 h-4" /> Continue Browsing Collections
              </Link>
            </div>
          </div>

          {/* Order Summary Card */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-6 sticky top-28">
              <h2 className="text-lg font-bold font-serif text-stone-900 pb-3 border-b border-stone-100">
                Order Summary
              </h2>

              <dl className="space-y-3 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal ({cart.total_items} items)</span>
                  <span className="font-bold text-stone-900">
                    ₹{cart.subtotal.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between text-stone-600">
                  <span>Estimated Delivery & Assembly</span>
                  <span>
                    {cart.delivery_charge === 0 ? (
                      <span className="text-emerald-700 font-bold uppercase tracking-wider">
                        FREE
                      </span>
                    ) : (
                      <span className="font-bold text-stone-900">
                        ₹{cart.delivery_charge.toLocaleString('en-IN')}
                      </span>
                    )}
                  </span>
                </div>

                <div className="pt-3 border-t border-stone-100 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-stone-900">Total Payable (COD)</span>
                  <span className="text-xl font-black text-stone-900 font-serif">
                    ₹{cart.final_total.toLocaleString('en-IN')}
                  </span>
                </div>
              </dl>

              {/* Checkout Button */}
              <button
                onClick={() => navigate('/checkout')}
                className="w-full py-4 rounded-2xl bg-stone-800 hover:bg-stone-900 active:scale-98 text-white font-bold text-sm tracking-wide shadow-lg shadow-stone-950/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="space-y-2 pt-2 border-t border-stone-100 text-[11px] text-stone-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>100% Secure Checkout with Cash on Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-stone-700 shrink-0" />
                  <span>Doorstep delivery & certified furniture installation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
