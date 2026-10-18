import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, FolderTree, Users, ShoppingCart, AlertTriangle,
  CheckCircle2, Clock, IndianRupee, ArrowRight, Eye, ShieldAlert,
  TrendingUp, RefreshCw
} from 'lucide-react';
import { adminApi } from '../../api/client';
import { AdminKPIs, AuditLog } from '../../types';

export const AdminDashboardPage: React.FC = () => {
  const [kpis, setKpis] = useState<AdminKPIs | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [lowStockAlerts, setLowStockAlerts] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getOverview();
      setKpis(data.kpis);
      setRecentOrders(data.recent_orders || []);
      setLowStockAlerts(data.low_stock_alerts || []);
      setRecentActivity(data.recent_activity || []);
    } catch (err) {
      console.error('Failed to load overview data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Real-time business performance, inventory status, and order fulfillment.
          </p>
        </div>

        <button
          onClick={fetchOverview}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-semibold shadow-xs cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Orders */}
        <div className="p-5 bg-white rounded-3xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
            <div className="w-8 h-8 rounded-xl bg-stone-200 text-stone-800 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
            {kpis?.total_orders ?? '—'}
          </div>
          <p className="text-[11px] text-stone-500 font-medium">
            Pending: <strong className="text-stone-800">{kpis?.pending_orders ?? 0}</strong> • Active: {kpis?.processing_orders ?? 0}
          </p>
        </div>

        {/* Order Volume */}
        <div className="p-5 bg-white rounded-3xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Bookings</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
            ₹{kpis ? kpis.total_order_value.toLocaleString('en-IN') : '—'}
          </div>
          <p className="text-[11px] text-stone-500 font-medium">
            Cash Collected: <strong className="text-emerald-700">₹{kpis ? kpis.collected_revenue.toLocaleString('en-IN') : '0'}</strong>
          </p>
        </div>

        {/* Total Catalog Products */}
        <div className="p-5 bg-white rounded-3xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Products</span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
            {kpis?.total_products ?? '—'}
          </div>
          <p className="text-[11px] text-stone-500 font-medium">
            Across {kpis?.total_categories ?? 0} Master Categories
          </p>
        </div>

        {/* Registered Customers */}
        <div className="p-5 bg-white rounded-3xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold uppercase tracking-wider">Registered Clients</span>
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-900 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
            {kpis?.total_customers ?? '—'}
          </div>
          <p className="text-[11px] text-stone-500 font-medium">
            Verified Shopping Profiles
          </p>
        </div>
      </div>

      {/* Inventory & Stock Health Alerts Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-stone-700" />
            <div>
              <h4 className="font-bold text-xs text-stone-900 uppercase tracking-wider">
                Low Stock Threshold (≤ 5 units)
              </h4>
              <p className="text-xs text-stone-700 font-medium">
                {kpis?.low_stock_count ?? 0} products need workshop replenishment
              </p>
            </div>
          </div>
          <Link
            to="/admin/products?status=low_stock"
            className="text-xs font-bold text-stone-800 hover:underline"
          >
            Review Items →
          </Link>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-700" />
            <div>
              <h4 className="font-bold text-xs text-rose-950 uppercase tracking-wider">
                Out of Stock
              </h4>
              <p className="text-xs text-rose-800 font-medium">
                {kpis?.out_of_stock_count ?? 0} products currently unavailable
              </p>
            </div>
          </div>
          <Link
            to="/admin/products?status=out_of_stock"
            className="text-xs font-bold text-rose-900 hover:underline"
          >
            Manage Stock →
          </Link>
        </div>
      </div>

      {/* Main Two-Column Section: Recent Orders & Alerts/Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-stone-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h2 className="text-base font-bold font-serif text-stone-900">
              Recent Customer Orders
            </h2>
            <Link
              to="/admin/orders"
              className="text-xs font-bold text-stone-800 hover:text-stone-950 hover:underline flex items-center gap-1"
            >
              <span>View All Orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-100 text-stone-400 font-bold uppercase tracking-wider">
                    <th className="pb-3">Order Number</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Payment</th>
                    <th className="pb-3 text-right">Total</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {recentOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-3 font-mono font-bold text-stone-900">
                        {ord.order_number}
                      </td>
                      <td className="py-3">
                        <span className="font-semibold text-stone-900 block">{ord.customer_name}</span>
                        <span className="text-[10px] text-stone-400">{ord.items_count} items</span>
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            ord.order_status === 'delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ord.order_status === 'cancelled'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-stone-200 text-stone-800'
                          }`}
                        >
                          {ord.order_status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 capitalize text-stone-600 font-medium">
                        {ord.payment_status}
                      </td>
                      <td className="py-3 text-right font-bold text-stone-900 font-serif">
                        ₹{ord.final_total?.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          to={`/admin/orders`}
                          className="p-1.5 inline-flex text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-100"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-stone-500 italic py-4">No recent orders recorded.</p>
          )}
        </div>

        {/* Right Column: Low Stock Alerts & Recent Admin Activity */}
        <div className="space-y-6">
          {/* Low Stock Alerts Widget */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 space-y-4">
            <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-stone-700" />
              Low Stock Warnings
            </h3>

            {lowStockAlerts.length > 0 ? (
              <div className="divide-y divide-stone-100">
                {lowStockAlerts.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={item.image}
                        alt=""
                        className="w-10 h-10 object-cover rounded-lg border border-stone-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-stone-900 truncate">{item.name}</p>
                        <p className="text-[10px] text-stone-400">SKU: {item.sku}</p>
                      </div>
                    </div>
                    <span className="font-bold text-rose-600 px-2 py-0.5 rounded-md bg-rose-50 text-[11px] whitespace-nowrap">
                      {item.stock} left
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-500 italic">Inventory levels are healthy.</p>
            )}
          </div>

          {/* Recent Audit Log */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 space-y-4">
            <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-stone-700" />
              Administrative Audit Logs
            </h3>

            {recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((log) => (
                  <div key={log.id} className="text-xs space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900 font-mono text-[11px]">
                        {log.action}
                      </span>
                      <span className="text-[10px] text-stone-400">
                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600 leading-snug">{log.details}</p>
                    <p className="text-[10px] text-stone-400">By: {log.admin_email}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-500 italic">No recent administrative logs.</p>
            )}

            <Link
              to="/admin/audit-logs"
              className="block pt-2 text-center text-xs font-semibold text-stone-800 hover:underline"
            >
              View Full Audit Trail →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
