import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { Logo } from '../../components/common/Logo';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { success } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      success('Welcome back to Shiridi Sai Enterprises!');
      navigate(from, { replace: true });
    } catch {
      // Toast already shown in AuthContext
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCustomer = () => {
    setEmail('customer@example.com');
    setPassword('Customer@123');
  };

  return (
    <div className="min-h-screen bg-[#FCFBF9] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Logo className="justify-center" />
        <h2 className="text-2xl font-bold font-serif text-stone-900 tracking-tight">
          Customer Account Login
        </h2>
        <p className="text-xs text-stone-500">
          Sign in to track orders, manage delivery addresses, and view invoices.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-stone-200/90 shadow-lg space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="customer@example.com"
                  className="w-full pl-10 pr-3 py-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs focus:bg-white focus:border-stone-700 focus:outline-hidden"
                />
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs focus:bg-white focus:border-stone-700 focus:outline-hidden"
                />
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-stone-800 hover:bg-stone-900 active:scale-98 text-white font-bold text-xs tracking-wider uppercase shadow-md shadow-stone-950/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? <span className="animate-pulse">Authenticating...</span> : <span>Sign In</span>}
            </button>
          </form>

          {/* Quick Demo Credentials Fill */}
          <div className="pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={fillDemoCustomer}
              className="w-full py-2 px-3 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-600 text-[11px] font-medium border border-stone-200 transition-colors"
            >
              ⚡ Fill Demo Customer Credentials (customer@example.com)
            </button>
          </div>

          <div className="text-center text-xs text-stone-500 pt-2">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-stone-800 hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
