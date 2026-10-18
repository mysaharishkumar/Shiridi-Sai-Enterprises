import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, Mail, ShieldCheck, ArrowRight, LogOut, CheckCircle2 } from 'lucide-react';
import { Logo } from '../../components/common/Logo';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fromPath = (location.state as any)?.from?.pathname || '/admin/categories';
  const { user, isAuthenticated, isAdmin, login, logout } = useAuth();
  const { success, error: toastError } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const loggedUser = await login(email, password);
      const adminRoles = ['admin', 'super_admin', 'product_manager', 'order_manager'];
      if (!adminRoles.includes(loggedUser.role)) {
        toastError('Access denied. Administrator privileges required.');
        return;
      }
      success(`Welcome to Management Portal, ${loggedUser.name}`);
      navigate(fromPath);
    } catch {
      // Toast already shown in AuthContext
    } finally {
      setLoading(false);
    }
  };

  const fillSuperAdmin = () => {
    setEmail('shiridisaifurnitures1991@gmail.com');
    setPassword('Saikiran@123');
  };

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-stone-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="flex justify-center brightness-125">
          <Logo admin />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-800/70 text-stone-300 border border-stone-700 text-xs font-semibold uppercase tracking-wider">
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
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@shiridisaienterprises.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-950/80 border border-stone-700 rounded-xl text-xs text-white placeholder-stone-600 focus:outline-hidden focus:border-stone-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-1.5">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-950/80 border border-stone-700 rounded-xl text-xs text-white placeholder-stone-600 focus:outline-hidden focus:border-stone-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-2 border border-stone-700"
            >
              {loading ? (
                <span className="animate-pulse">Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Admin Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Autofill */}
          <div className="pt-4 border-t border-stone-800/80 text-center">
            <button
              type="button"
              onClick={fillSuperAdmin}
              className="text-[11px] text-stone-300 hover:text-white font-medium underline underline-offset-2 transition-colors cursor-pointer"
            >
              Auto-fill Store Owner Credentials
            </button>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-xs text-stone-500 hover:text-stone-300 transition-colors"
          >
            ← Return to Public Storefront
          </Link>
        </div>
      </div>
    </div>
  );
};
