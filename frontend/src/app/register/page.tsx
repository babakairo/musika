'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, User, Mail, Lock, Phone } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone || undefined,
        password: form.password,
      }) as any;
      setAuth(res.user, res.token);
      toast.success(`Welcome to Musika, ${res.user.firstName}!`);
      router.push('/');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-900 rounded-xl flex items-center justify-center">
              <span className="text-accent-400 font-black text-lg">M</span>
            </div>
            <span className="text-2xl font-bold text-primary-900">Musika</span>
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-sm text-gray-500 mt-1">Join Zimbabwe&apos;s largest marketplace</p>
        </div>

        <div className="bg-white rounded-2xl shadow-card border border-border p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="First Name" value={form.firstName} onChange={set('firstName')} placeholder="John" leftIcon={<User size={16} />} />
              <Input label="Last Name" value={form.lastName} onChange={set('lastName')} placeholder="Doe" />
            </div>
            <Input label="Email address" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" leftIcon={<Mail size={16} />} />
            <Input label="Phone (optional)" type="tel" value={form.phone} onChange={set('phone')} placeholder="077 123 4567" leftIcon={<Phone size={16} />} />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={set('password')}
                placeholder="Min. 8 characters"
                leftIcon={<Lock size={16} />}
                helperText="Must contain uppercase, lowercase, and number"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <Input
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={set('confirmPassword')}
              placeholder="Repeat your password"
              leftIcon={<Lock size={16} />}
            />

            <p className="text-xs text-gray-500">
              By creating an account you agree to our{' '}
              <Link href="/terms" className="text-accent-600 hover:underline">Terms of Service</Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-accent-600 hover:underline">Privacy Policy</Link>.
            </p>

            <Button type="submit" fullWidth size="lg" loading={loading}>
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-accent-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
