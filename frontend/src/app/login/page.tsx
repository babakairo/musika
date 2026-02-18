'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';

const DEMO_ACCOUNTS = [
  { label: 'Customer', email: 'customer@musika.co.zw', role: 'CUSTOMER' },
  { label: 'Seller', email: 'techstore@musika.co.zw', role: 'SELLER' },
  { label: 'Admin', email: 'admin@musika.co.zw', role: 'ADMIN' },
];

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.login(form) as any;
      setAuth(res.user, res.token);
      toast.success(`Welcome back, ${res.user.firstName}!`);
      const redirect = res.user.role === 'ADMIN' ? '/dashboard/admin'
        : res.user.role === 'SELLER' ? '/dashboard/seller' : '/';
      router.push(redirect);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const loginAsDemo = (email: string) => {
    setForm({ email, password: 'Password123!' });
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-900 rounded-xl flex items-center justify-center">
              <span className="text-accent-400 font-black text-lg">M</span>
            </div>
            <span className="text-2xl font-bold text-primary-900">Musika</span>
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
        </div>

        {/* Demo accounts */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <p className="text-xs font-semibold text-blue-700 mb-2">Demo Accounts (Password: Password123!)</p>
          <div className="flex gap-2 flex-wrap">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.role}
                onClick={() => loginAsDemo(acc.email)}
                className="text-xs px-3 py-1.5 bg-white border border-blue-200 rounded-lg text-blue-700 hover:bg-blue-50 transition-colors font-medium"
              >
                {acc.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-card border border-border p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              leftIcon={<Mail size={16} />}
            />
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Your password"
                leftIcon={<Lock size={16} />}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-sm text-accent-600 hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" fullWidth size="lg" loading={loading}>
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-accent-600 font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
