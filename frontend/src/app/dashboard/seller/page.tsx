'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Package, TrendingUp, ShoppingBag, AlertTriangle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { sellersApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function SellerDashboardPage() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sellersApi.dashboard()
      .then((data: any) => setDashboard(data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-64" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-gray-200 rounded-xl" />)}
        </div>
        <div className="h-64 bg-gray-200 rounded-xl" />
      </div>
    );
  }

  const stats = [
    { icon: TrendingUp, label: 'Total Revenue', value: formatCurrency(dashboard?.revenue?.total ?? 0), color: 'text-green-600', bg: 'bg-green-50' },
    { icon: ShoppingBag, label: 'Total Orders', value: dashboard?.orders?.total ?? 0, color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: Package, label: 'Products', value: dashboard?.products?.total ?? 0, color: 'text-accent-600', bg: 'bg-accent-50' },
    { icon: AlertTriangle, label: 'Low Stock', value: dashboard?.products?.lowStock ?? 0, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Seller Dashboard</h1>
        <Link href="/dashboard/seller/products/new">
          <Button size="md">
            <Plus size={16} /> Add Product
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {stats.map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="bg-white border border-border rounded-xl p-5">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon size={20} className={color} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Products Table */}
      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-gray-900">My Products</h2>
          <Link href="/dashboard/seller/products/new">
            <button className="text-sm text-accent-600 font-medium hover:underline flex items-center gap-1">
              <Plus size={14} /> Add New
            </button>
          </Link>
        </div>
        {dashboard?.products?.list?.length === 0 ? (
          <div className="py-12 text-center">
            <Package size={36} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No products yet</p>
            <Link href="/dashboard/seller/products/new">
              <Button size="sm" className="mt-4">Add First Product</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface border-b border-border">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(dashboard?.products?.list ?? []).map((product: any) => (
                  <tr key={product.id} className="hover:bg-surface transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.images?.[0] || 'https://placehold.co/40x40/f3f4f6/9ca3af?text=?'}
                          alt=""
                          className="w-10 h-10 object-cover rounded-lg"
                        />
                        <span className="font-medium text-gray-900 max-w-[200px] truncate">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{formatCurrency(product.price)}</td>
                    <td className="px-6 py-4">
                      <span className={product.inventory?.quantityAvailable <= 5 ? 'text-red-600 font-semibold' : 'text-gray-700'}>
                        {product.inventory?.quantityAvailable ?? 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={product.active ? 'success' : 'default'}>
                        {product.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/products/${product.slug}`}>
                        <button className="text-accent-600 hover:underline text-xs font-medium flex items-center gap-1">
                          View <ChevronRight size={12} />
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
