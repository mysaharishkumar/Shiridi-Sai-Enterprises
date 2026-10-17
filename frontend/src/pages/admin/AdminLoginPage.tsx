import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ShieldCheck, ArrowRight } from 'lucide-react';
import { Logo } from '../../components/common/Logo';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { success, error: toastError } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      const adminRoles = ['admin', 'super_admin', 'product_manager', 'order_manager'];
      if (!adminRoles.includes(user.role)) {
        toastError('Access denied. Administrator privileges required.');
        return;
      }
      success(`Welcome to Management Portal, ${user.name}`);
      navigate('/admin');
    } catch {
      // Toast already shown in AuthContext
    } finally {
      setLoading(false);
    }
  };

  const fillSuperAdmin = () => {
    setEmail('admin@shiridisaienterprises.com');
    setPassword('Admin@123456');
  };

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-stone-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="flex justify-center brightness-125">
          <Logo admin />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/70 text-amber-400 border border-amber-800/60 text-xs font-semibold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Restricted Admin Portal</span>
        </div>
        <p className="text-xs text-stone-400">
          Sign in with your administrative credentials to manage store operations.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-stone-900/90 py-8 px-6 sm:px-10 rounded-3xl border border-stone-800 shadow-2xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-1.5">
                Administrator Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@shiridisaienterprises.com"
                  className="w-full pl-10 pr-3 py-2.5 bg-stone-800 rounded-xl border border-stone-700 text-white text-xs focus:bg-stone-800/80 focus:border-amber-500 focus:outline-hidden"
                />
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 bg-stone-800 rounded-xl border border-stone-700 text-white text-xs focus:bg-stone-800/80 focus:border-amber-500 focus:outline-hidden"
                />
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-amber-700 hover:bg-amber-600 active:scale-98 text-white font-bold text-xs tracking-wider uppercase shadow-lg shadow-amber-950/50 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span className="animate-pulse">Authenticating Admin...</span>
              ) : (
                <span>Access Management Portal</span>
              )}
            </button>
          </form>

          {/* Demo Admin Shortcut */}
          <div className="pt-2 border-t border-stone-800">
            <button
              type="button"
              onClick={fillSuperAdmin}
              className="w-full py-2 px-3 rounded-lg bg-stone-800/60 hover:bg-stone-800 text-amber-300 text-[11px] font-medium border border-stone-700 transition-colors"
            >
              ⚡ Fill Super Admin Credentials (admin@shiridisaienterprises.com)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
