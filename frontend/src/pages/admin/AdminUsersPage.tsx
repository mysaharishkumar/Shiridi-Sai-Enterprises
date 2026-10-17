import React, { useState, useEffect } from 'react';
import {
  Users, Search, ShieldCheck, UserX, UserCheck, ShieldAlert,
  ArrowUpDown, Clock, ShoppingCart
} from 'lucide-react';
import { User } from '../../types';
import { adminApi } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const AdminUsersPage: React.FC = () => {
  const { user: currentAdmin, isSuperAdmin } = useAuth();
  const { success, error: toastError } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers({
        search: search.trim() || undefined,
        role: roleFilter === 'all' ? undefined : roleFilter,
        page,
        limit: 15
      });
      setUsers(res.items);
      setTotal(res.total);
    } catch (err: any) {
      toastError(err.message || 'Failed to load user accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter, page]);

  const handleToggleStatus = async (user: User) => {
    const nextStatus = !user.is_active;
    const actionName = nextStatus ? 'activate' : 'suspend';
    if (!window.confirm(`Are you sure you want to ${actionName} account for '${user.email}'?`)) {
      return;
    }

    try {
      await adminApi.toggleUserStatus(user.id, nextStatus);
      success(`User account ${actionName}d successfully`);
      fetchUsers();
    } catch (err: any) {
      toastError(err.message || 'Failed to update user status');
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!isSuperAdmin) {
      toastError('Only Super Admin can update administrator roles');
      return;
    }
    try {
      await adminApi.updateUserRole(userId, newRole);
      success(`User role changed to ${newRole}`);
      fetchUsers();
    } catch (err: any) {
      toastError(err.message || 'Failed to update role');
    }
  };

  const totalPages = Math.ceil(total / 15) || 1;

  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 tracking-tight">
          Customer & Administrator Accounts
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Review registered shopping customers, purchase history, and control staff privileges.
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
            placeholder="Search by name, email or phone number..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:bg-white focus:outline-hidden"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="w-full md:w-auto p-2 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:outline-hidden"
        >
          <option value="all">All Account Roles</option>
          <option value="customer">Customers</option>
          <option value="admin">Administrators</option>
          <option value="super_admin">Super Admins</option>
          <option value="product_manager">Product Managers</option>
          <option value="order_manager">Order Managers</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-stone-50/80 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-3">Role</th>
                <th className="py-3.5 px-3 text-center">Orders</th>
                <th className="py-3.5 px-3 text-right">Total Spent</th>
                <th className="py-3.5 px-3">Registered Date</th>
                <th className="py-3.5 px-3 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stone-400">
                    Loading accounts...
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-stone-100 text-stone-700 font-bold flex items-center justify-center text-xs shrink-0">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-stone-900 block">{u.name}</span>
                          <span className="text-[11px] text-stone-500">{u.email}</span>
                          {u.phone && <span className="text-[10px] text-stone-400 block">{u.phone}</span>}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      {isSuperAdmin && u.id !== currentAdmin?.id ? (
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="p-1 rounded-lg border border-stone-200 bg-stone-50 text-[11px] font-semibold text-stone-800"
                        >
                          <option value="customer">Customer</option>
                          <option value="admin">Admin</option>
                          <option value="product_manager">Product Manager</option>
                          <option value="order_manager">Order Manager</option>
                        </select>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 font-bold text-[10px] uppercase tracking-wider">
                          {u.role.replace('_', ' ')}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center font-bold text-stone-800">
                      {u.order_count ?? 0}
                    </td>

                    <td className="py-3 px-3 text-right font-bold text-stone-900 font-serif">
                      ₹{u.total_spent ? u.total_spent.toLocaleString('en-IN') : '0'}
                    </td>

                    <td className="py-3 px-3 text-stone-500 whitespace-nowrap">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>

                    <td className="py-3 px-3 text-center">
                      {u.is_active ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[10px] border border-emerald-200">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-semibold text-[10px] border border-rose-200">
                          Suspended
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {u.id !== currentAdmin?.id ? (
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`px-3 py-1 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                            u.is_active
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {u.is_active ? 'Suspend' : 'Activate'}
                        </button>
                      ) : (
                        <span className="text-[11px] text-stone-400 italic">Current User</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-stone-400">
                    No accounts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
            <span>
              Page {page} of {totalPages} ({total} total users)
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
    </div>
  );
};
