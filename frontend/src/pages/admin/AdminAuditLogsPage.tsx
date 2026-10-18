import React, { useState, useEffect } from 'react';
import { History, Search, RefreshCw, Filter, ShieldAlert, ArrowLeft, ArrowRight, UserCheck } from 'lucide-react';
import { adminApi } from '../../api/client';
import { AuditLog } from '../../types';
import { useToast } from '../../context/ToastContext';

export const AdminAuditLogsPage: React.FC = () => {
  const { error: toastError } = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [resourceFilter, setResourceFilter] = useState('');
  const [adminEmailFilter, setAdminEmailFilter] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAuditLogs({
        page,
        limit: 25,
        resource_type: resourceFilter || undefined,
        admin_email: adminEmailFilter.trim() || undefined
      });
      if (data) {
        setLogs(data.items);
        setTotalPages(data.total_pages || 1);
        setTotal(data.total);
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to fetch audit activity logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, resourceFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const getActionBadge = (action: string) => {
    if (action.includes('create') || action.includes('add')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (action.includes('update') || action.includes('edit')) {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    if (action.includes('delete') || action.includes('remove')) {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    }
    if (action.includes('status')) {
      return 'bg-stone-200 text-stone-800 border-stone-300';
    }
    return 'bg-stone-100 text-stone-700 border-stone-200';
  };

  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900 flex items-center gap-2">
            <History className="w-6 h-6 text-stone-700" />
            Security & Audit Activity Logs
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Immutable tracking of administrator operations, catalog updates, price modifications, and order dispatch events.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-stone-700 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-stone-700' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <form onSubmit={handleSearchSubmit} className="flex flex-1 flex-col sm:flex-row gap-3 w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Filter by admin email..."
              value={adminEmailFilter}
              onChange={(e) => setAdminEmailFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-stone-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-stone-400" />
            <select
              value={resourceFilter}
              onChange={(e) => {
                setResourceFilter(e.target.value);
                setPage(1);
              }}
              className="border border-stone-200 rounded-lg px-3 py-2 text-sm bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-400"
            >
              <option value="">All Resource Types</option>
              <option value="product">Products</option>
              <option value="category">Categories</option>
              <option value="banner">Banners</option>
              <option value="order">Orders</option>
              <option value="user">User Accounts</option>
              <option value="settings">Site Settings</option>
            </select>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-stone-900 text-white rounded-lg text-sm font-medium hover:bg-stone-800 transition"
          >
            Search
          </button>
        </form>

        <div className="text-xs text-stone-500 whitespace-nowrap">
          Showing <span className="font-semibold text-stone-900">{logs.length}</span> of <span className="font-semibold text-stone-900">{total}</span> events
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-700">
            <thead className="bg-stone-50 text-xs uppercase font-semibold text-stone-500 border-b border-stone-200">
              <tr>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Administrator</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Resource</th>
                <th className="py-3.5 px-4">Details / Changes</th>
                <th className="py-3.5 px-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading && logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-stone-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-stone-700" />
                      <span>Loading audit trail...</span>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-stone-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <ShieldAlert className="w-8 h-8 text-stone-300" />
                      <span className="font-medium">No audit logs matching this filter</span>
                      <p className="text-xs text-stone-400">Operations will automatically be recorded here as admins make changes.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3 px-4 text-xs font-mono text-stone-500 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-stone-900 font-medium text-xs">
                        <UserCheck className="w-3.5 h-3.5 text-stone-700" />
                        <span>{log.admin_email || 'System / Auto'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 rounded bg-stone-100 text-stone-800 text-xs font-semibold uppercase tracking-wider">
                        {log.resource_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-md">
                      <div className="text-stone-800 text-xs truncate" title={log.details || ''}>
                        {log.details || <span className="text-stone-400 italic">No extra details</span>}
                      </div>
                      {log.resource_id && (
                        <div className="text-[10px] text-stone-400 font-mono mt-0.5">
                          ID: {log.resource_id}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs font-mono text-stone-400 whitespace-nowrap">
                      {log.ip_address || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-stone-200 flex items-center justify-between text-sm">
            <span className="text-stone-500 text-xs">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="p-1.5 rounded border border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages || loading}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                className="p-1.5 rounded border border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
