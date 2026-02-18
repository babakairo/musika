'use client';
import { useState, useEffect } from 'react';
import { Users, Store, ShoppingBag, TrendingUp, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { adminApi } from '@/lib/api';
import { formatCurrency, formatDate, getOrderStatusConfig } from '@/lib/utils';
import toast from 'react-hot-toast';

type Tab = 'overview' | 'sellers' | 'orders';

export default function AdminDashboardPage() {
  const [tab, setTab] = useState<Tab>('overview');
  const [dashboard, setDashboard] = useState<any>(null);
  const [pendingSellers, setPendingSellers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminApi.dashboard(),
      adminApi.getPendingSellers(),
      adminApi.getOrders(),
    ])
      .then(([dash, sellers, ordersData]: any) => {
        setDashboard(dash);
        setPendingSellers(sellers || []);
        setOrders((ordersData as any)?.orders || []);
      })
      .catch(() => toast.error('Failed to load admin data'))
      .finally(() => setLoading(false));
  }, []);

  const handleApproveSeller = async (id: string) => {
    try {
      await adminApi.approveSeller(id);
      setPendingSellers((s) => s.filter((sel) => sel.id !== id));
      toast.success('Seller approved!');
    } catch {
      toast.error('Failed to approve seller');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-gray-200 rounded-xl" />)}
        </div>
      </div>
    );
  }

  const stats = [
    { icon: Users, label: 'Total Users', value: dashboard?.users?.total ?? 0, color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: Store, label: 'Active Sellers', value: dashboard?.sellers?.total ?? 0, color: 'text-green-600', bg: 'bg-green-50' },
    { icon: ShoppingBag, label: 'Total Orders', value: dashboard?.orders?.total ?? 0, color: 'text-accent-600', bg: 'bg-accent-50' },
    { icon: TrendingUp, label: 'Total Revenue', value: formatCurrency(dashboard?.revenue?.total ?? 0), color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const TABS: { key: Tab; label: string; badge?: number }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'sellers', label: 'Pending Sellers', badge: pendingSellers.length },
    { key: 'orders', label: 'Recent Orders' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

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

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border mb-6">
        {TABS.map(({ key, label, badge }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-2 border-b-2 -mb-px ${tab === key ? 'border-accent-500 text-accent-600' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
          >
            {label}
            {badge ? (
              <span className="bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{badge}</span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && (
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-semibold text-gray-900">Recent Orders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface">
                <tr>
                  {['Order ID', 'Customer', 'Amount', 'Status', 'Date'].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {dashboard?.recentOrders?.map((order: any) => {
                  const cfg = getOrderStatusConfig(order.status);
                  return (
                    <tr key={order.id} className="hover:bg-surface transition-colors">
                      <td className="px-6 py-3 font-mono text-xs text-gray-600">#{order.id.slice(-8).toUpperCase()}</td>
                      <td className="px-6 py-3 text-gray-900">{order.customer?.firstName} {order.customer?.lastName}</td>
                      <td className="px-6 py-3 font-semibold text-gray-900">{formatCurrency(order.totalAmount)}</td>
                      <td className="px-6 py-3"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>{cfg.label}</span></td>
                      <td className="px-6 py-3 text-gray-500">{formatDate(order.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pending Sellers Tab */}
      {tab === 'sellers' && (
        <div className="space-y-4">
          {pendingSellers.length === 0 ? (
            <div className="text-center py-12 bg-white border border-border rounded-xl">
              <CheckCircle size={36} className="text-green-400 mx-auto mb-3" />
              <p className="text-gray-500">No pending seller applications</p>
            </div>
          ) : (
            pendingSellers.map((seller) => (
              <div key={seller.id} className="bg-white border border-border rounded-xl p-5 flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-900">{seller.storeName}</p>
                  <p className="text-sm text-gray-500">{seller.user?.email}</p>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <Clock size={12} /> Applied {formatDate(seller.createdAt)}
                  </p>
                  {seller.description && <p className="text-sm text-gray-600 mt-2 max-w-md">{seller.description}</p>}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button size="sm" onClick={() => handleApproveSeller(seller.id)}>
                    <CheckCircle size={14} /> Approve
                  </Button>
                  <Button size="sm" variant="danger">
                    <XCircle size={14} /> Reject
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Orders Tab */}
      {tab === 'orders' && (
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface">
                <tr>
                  {['Order ID', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((order: any) => {
                  const cfg = getOrderStatusConfig(order.status);
                  return (
                    <tr key={order.id} className="hover:bg-surface transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">#{order.id.slice(-8).toUpperCase()}</td>
                      <td className="px-4 py-3 text-gray-900">{order.customer?.firstName} {order.customer?.lastName}</td>
                      <td className="px-4 py-3 text-gray-500">{order.items?.length ?? 0}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{formatCurrency(order.totalAmount)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={order.payment?.status === 'SUCCESS' ? 'success' : 'warning'}>
                          {order.payment?.status ?? 'UNPAID'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>{cfg.label}</span></td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(order.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
