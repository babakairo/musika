import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, ShieldCheck, Truck, RefreshCcw, Headphones, ArrowRight, Star } from 'lucide-react';
import { ProductGrid } from '@/components/products/ProductGrid';
import { productsApi } from '@/lib/api';
import { Product, Category } from '@/types';

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const data = (await productsApi.list({ featured: true, limit: 8 })) as any;
    return data.products || [];
  } catch {
    return [];
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    return (await productsApi.getCategories()) as Category[];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [featuredProducts, categories] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary-800 via-primary-900 to-primary-800 text-white overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&h=600&fit=crop')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-accent-500/20 border border-accent-500/30 text-accent-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <Star className="w-3.5 h-3.5 fill-current" />
              Zimbabwe&apos;s #1 Online Marketplace
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4">
              Everything you need,{' '}
              <span className="text-accent-400">delivered to you.</span>
            </h1>
            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
              Shop from thousands of products from verified Zimbabwean sellers. Pay with EcoCash.
              Get it delivered or pick up at your nearest agent.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-3 bg-accent-500 hover:bg-accent-400 text-white font-semibold rounded-xl transition-colors"
              >
                Shop Now <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/sell"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-colors"
              >
                Start Selling
              </Link>
            </div>
          </div>
        </div>
        <div className="relative bg-black/20 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              {[
                { value: '10,000+', label: 'Products' },
                { value: '500+', label: 'Sellers' },
                { value: '50+', label: 'Agent Locations' },
                { value: 'EcoCash', label: 'Instant Payments' },
              ].map(({ value, label }) => (
                <div key={label}>
                  <p className="text-xl font-bold text-accent-400">{value}</p>
                  <p className="text-xs text-gray-400">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: Truck, title: 'Fast Delivery', desc: 'Harare & Bulawayo' },
              { icon: ShieldCheck, title: 'Secure Payments', desc: 'EcoCash protected' },
              { icon: RefreshCcw, title: 'Easy Returns', desc: '7-day return policy' },
              { icon: Headphones, title: '24/7 Support', desc: 'Always here for you' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-accent-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{title}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-12">
        {/* Categories */}
        {categories.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Shop by Category</h2>
              <Link
                href="/products"
                className="text-sm text-accent-600 hover:text-accent-700 font-medium flex items-center gap-1"
              >
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {categories.slice(0, 6).map((category) => (
                <Link
                  key={category.id}
                  href={`/products?category=${category.slug}`}
                  className="group flex flex-col items-center text-center"
                >
                  <div className="w-full aspect-square rounded-2xl overflow-hidden bg-surface border border-border mb-2 group-hover:border-accent-300 group-hover:shadow-card-hover transition-all">
                    {category.image && (
                      <Image
                        src={category.image}
                        alt={category.name}
                        width={160}
                        height={160}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                  </div>
                  <span className="text-xs font-medium text-gray-700 group-hover:text-accent-600 transition-colors">
                    {category.name}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Featured Products */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Featured Products</h2>
              <p className="text-sm text-gray-500">Handpicked deals from top sellers</p>
            </div>
            <Link
              href="/products?featured=true"
              className="text-sm text-accent-600 hover:text-accent-700 font-medium flex items-center gap-1"
            >
              See all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <ProductGrid products={featuredProducts} />
        </section>

        {/* Seller Banner */}
        <section className="bg-gradient-to-r from-primary-800 to-primary-900 rounded-2xl overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center p-8 gap-6">
            <div className="flex-1 text-white">
              <h2 className="text-2xl font-bold mb-2">Start Selling on Musika</h2>
              <p className="text-gray-300 text-sm mb-4">
                Join hundreds of Zimbabwean sellers reaching customers nationwide. Send your
                inventory to our warehouse — we handle storage, packing, and delivery.
              </p>
              <ul className="space-y-1 text-sm text-gray-300 mb-6">
                {[
                  'Free seller registration',
                  'Centralized warehouse storage',
                  'EcoCash payouts',
                  'Real-time sales dashboard',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent-500 hover:bg-accent-400 text-white font-semibold rounded-xl text-sm transition-colors"
              >
                Become a Seller <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="hidden sm:flex w-48 h-48 bg-white/5 rounded-2xl border border-white/10 items-center justify-center">
              <div className="text-center">
                <p className="text-4xl font-bold text-accent-400">0%</p>
                <p className="text-sm text-gray-300 mt-1">Commission</p>
                <p className="text-xs text-gray-400">for first 3 months</p>
              </div>
            </div>
          </div>
        </section>

        {/* EcoCash Banner */}
        <section className="bg-green-600 rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-black text-green-600">E</span>
            </div>
            <div className="flex-1 text-white text-center sm:text-left">
              <h3 className="text-lg font-bold mb-1">Pay with EcoCash</h3>
              <p className="text-green-100 text-sm">
                Instant, secure mobile payments. No card needed. Just your EcoCash number and PIN.
              </p>
            </div>
            <Link
              href="/help/ecocash"
              className="flex-shrink-0 px-5 py-2.5 bg-white text-green-700 font-semibold rounded-xl text-sm hover:bg-green-50 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
