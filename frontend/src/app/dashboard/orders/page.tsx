'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, ChevronRight, Clock } from 'lucide-react';

import { ordersApi } from '@/lib/api';
import { Order } from '@/types';
import { formatCurrency, formatDate, getOrderStatusConfig } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi.myOrders()
      .then((data: any) => setOrders(data || []))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
        {[1, 2, 3].map((i) => <div key={i} className="h-28 bg-gray-200 rounded-xl animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <Package size={48} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-700 mb-2">No orders yet</h2>
          <p className="text-sm text-gray-400 mb-6">Start shopping to see your orders here.</p>
          <Link href="/products" className="text-accent-600 font-medium hover:underline">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const cfg = getOrderStatusConfig(order.status);
            return (
              <Link key={order.id} href={`/dashboard/orders/${order.id}`}>
                <div className="bg-white border border-border rounded-xl p-5 hover:shadow-card-hover transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-gray-900">Order #{order.id.slice(-8).toUpperCase()}</p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                      </div>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mb-3">
                        <Clock size={12} /> {formatDate(order.createdAt)}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {order.items?.slice(0, 3).map((item, i) => (
                          <div key={i} className="flex items-center gap-2 bg-surface rounded-lg px-2 py-1">
                            {item.product?.images?.[0] && (
                              <img src={item.product.images[0]} alt="" className="w-8 h-8 object-cover rounded" />
                            )}
                            <span className="text-xs text-gray-600 truncate max-w-[120px]">{item.product?.name}</span>
                            <span className="text-xs text-gray-400">x{item.quantity}</span>
                          </div>
                        ))}
                        {(order.items?.length ?? 0) > 3 && (
                          <span className="text-xs text-gray-400 self-center">+{(order.items?.length ?? 0) - 3} more</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-base font-bold text-gray-900">{formatCurrency(order.totalAmount)}</span>
                      <ChevronRight size={18} className="text-gray-400" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
