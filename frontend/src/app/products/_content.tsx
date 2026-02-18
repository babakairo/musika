'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';
import { ProductGrid } from '@/components/products/ProductGrid';
import { productsApi } from '@/lib/api';
import { Product, Category } from '@/types';

export default function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const category = searchParams.get('category') || undefined;
  const search = searchParams.get('search') || undefined;
  const featured = searchParams.get('featured') === 'true' ? true : undefined;

  useEffect(() => {
    setPage(1);
  }, [category, search, featured]);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const [productsData, categoriesData] = await Promise.all([
          productsApi.list({ page, limit: 20, category, search, featured }) as any,
          productsApi.getCategories() as any,
        ]);
        setProducts(productsData.products || []);
        setTotal(productsData.total || 0);
        setTotalPages(productsData.totalPages || 1);
        setCategories(categoriesData || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [page, category, search, featured]);

  const getPageTitle = () => {
    if (search) return `Search: "${search}"`;
    if (category) {
      const cat = categories.find((c) => c.slug === category);
      return cat?.name || 'Products';
    }
    if (featured) return 'Featured Products';
    return 'All Products';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total.toLocaleString()} results</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-lg text-sm font-medium text-gray-700 hover:bg-surface transition-colors">
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-lg text-sm font-medium text-gray-700 hover:bg-surface transition-colors">
            Sort by: Featured <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <div className="bg-white border border-border rounded-xl p-4 sticky top-24">
            <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
            <ul className="space-y-1">
              <li>
                <a
                  href="/products"
                  className={`block px-3 py-2 rounded-lg text-sm transition-colors ${!category ? 'bg-accent-50 text-accent-700 font-medium' : 'text-gray-600 hover:bg-surface'}`}
                >
                  All Products
                </a>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <a
                    href={`/products?category=${cat.slug}`}
                    className={`block px-3 py-2 rounded-lg text-sm transition-colors ${category === cat.slug ? 'bg-accent-50 text-accent-700 font-medium' : 'text-gray-600 hover:bg-surface'}`}
                  >
                    {cat.name}
                  </a>
                </li>
              ))}
            </ul>
            <div className="border-t border-border mt-4 pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">Price Range</h3>
              <div className="space-y-1">
                {[
                  { label: 'Under $25', href: '/products?maxPrice=25' },
                  { label: '$25 – $100', href: '/products?minPrice=25&maxPrice=100' },
                  { label: '$100 – $500', href: '/products?minPrice=100&maxPrice=500' },
                  { label: 'Over $500', href: '/products?minPrice=500' },
                ].map(({ label, href }) => (
                  <a
                    key={label}
                    href={href}
                    className="block px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-surface transition-colors"
                  >
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Products */}
        <div className="flex-1 min-w-0">
          <ProductGrid products={products} loading={loading} />

          {totalPages > 1 && !loading && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-border rounded-lg text-sm font-medium text-gray-700 hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${page === p ? 'bg-accent-500 text-white' : 'border border-border text-gray-700 hover:bg-surface'}`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-border rounded-lg text-sm font-medium text-gray-700 hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
