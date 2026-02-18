'use client';
import Link from 'next/link';
import { Store, TrendingUp, Shield, Smartphone, ChevronRight, Package, BarChart3, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const STEPS = [
  { step: '01', icon: Users, title: 'Create Account', desc: 'Sign up for free and complete your seller profile in minutes.' },
  { step: '02', icon: Package, title: 'List Products', desc: 'Add your products with photos, descriptions, and pricing.' },
  { step: '03', icon: Smartphone, title: 'Get Orders', desc: 'Customers discover and purchase your products. Get notified instantly.' },
  { step: '04', icon: TrendingUp, title: 'Get Paid', desc: 'Receive payments directly to your EcoCash wallet. No delays.' },
];

const FEATURES = [
  { icon: Store, title: 'Your Own Storefront', desc: 'A professional branded page showcasing all your products.' },
  { icon: BarChart3, title: 'Sales Analytics', desc: 'Track revenue, orders, and best-selling products in real-time.' },
  { icon: Smartphone, title: 'EcoCash Integration', desc: 'Get paid instantly via EcoCash — the payment method Zimbabweans trust.' },
  { icon: Shield, title: 'Seller Protection', desc: 'Dispute resolution and buyer verification to protect your business.' },
];

export default function SellPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-primary-900 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block bg-accent-500 text-white text-sm font-bold px-3 py-1 rounded-full mb-4">
            0% Commission for the first 3 months
          </span>
          <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight">
            Sell on Musika.<br />
            <span className="text-accent-400">Reach All of Zimbabwe.</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">
            Join thousands of sellers already growing their businesses on Zimbabwe&apos;s fastest-growing marketplace.
            List your first product in under 5 minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="xl" className="w-full sm:w-auto">
                Start Selling Today <ChevronRight size={18} />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="xl" variant="outline" className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10">
                Sign In to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="bg-accent-500 py-6 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4 text-center text-white">
          <div><p className="text-2xl font-black">500+</p><p className="text-sm opacity-80">Active Sellers</p></div>
          <div><p className="text-2xl font-black">50k+</p><p className="text-sm opacity-80">Monthly Shoppers</p></div>
          <div><p className="text-2xl font-black">$2M+</p><p className="text-sm opacity-80">GMV Processed</p></div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Start in 4 simple steps</h2>
            <p className="text-gray-500 mt-2">From signup to first sale in one afternoon</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="text-center">
                <div className="relative inline-block mb-4">
                  <div className="w-16 h-16 bg-accent-50 rounded-2xl flex items-center justify-center mx-auto">
                    <Icon className="text-accent-500" size={28} />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-accent-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {step.slice(-1)}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-surface py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Everything you need to succeed</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white border border-border rounded-xl p-6 flex gap-4">
                <div className="w-12 h-12 bg-primary-900 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="text-accent-400" size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
                  <p className="text-sm text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to grow your business?</h2>
          <p className="text-gray-500 mb-8">Create your seller account today. No listing fees, no setup costs.</p>
          <Link href="/register">
            <Button size="xl">
              Get Started for Free <ChevronRight size={18} />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
