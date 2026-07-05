'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, ShoppingBag, Users, Package, ArrowUp, ArrowDown } from 'lucide-react';
import Link from 'next/link';
import { fetchProducts, fetchOrders } from '@/lib/firestore-service';
import { Product, Order } from '@/lib/types';
import LoadingSpinner from '@/components/LoadingSpinner';

const statusColors: Record<string, string> = {
  delivered: 'bg-emerald-500/10 text-emerald-400',
  shipped: 'bg-blue-500/10 text-blue-400',
  processing: 'bg-amber-500/10 text-amber-400',
  confirmed: 'bg-sky-500/10 text-sky-400',
  pending: 'bg-zinc-500/10 text-zinc-400',
  cancelled: 'bg-red-500/10 text-red-400',
};

function formatStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fetchedOrders, fetchedProducts] = await Promise.all([
        fetchOrders(),
        fetchProducts(),
      ]);
      setOrders(fetchedOrders);
      setProducts(fetchedProducts);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const pendingCount = orders.filter(
    (o) => o.status === 'pending' || o.status === 'processing'
  ).length;
  const recentOrders = orders.slice(0, 5);

  // Count unique customers by email
  const uniqueCustomers = new Set(orders.map((o) => o.customerEmail)).size;

  const stats = [
    {
      label: 'Total Revenue',
      value: `$${totalRevenue.toLocaleString()}`,
      change: orders.length > 0 ? `From ${orders.length} orders` : '$0',
      trend: 'up' as const,
      icon: DollarSign,
      color: 'bg-emerald-500/10 text-emerald-400',
    },
    {
      label: 'Active Products',
      value: String(products.length),
      change: 'In your store',
      trend: 'up' as const,
      icon: Package,
      color: 'bg-blue-500/10 text-blue-400',
    },
    {
      label: 'Total Orders',
      value: String(orders.length),
      change: `${pendingCount} pending`,
      trend: pendingCount > 0 ? 'up' as const : 'down' as const,
      icon: ShoppingBag,
      color: 'bg-purple-500/10 text-purple-400',
    },
    {
      label: 'Customers',
      value: String(uniqueCustomers),
      change: 'Unique customers',
      trend: 'up' as const,
      icon: Users,
      color: 'bg-amber-500/10 text-amber-400',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" color="text-white" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-zinc-400 text-sm mt-1">Welcome back! Here&apos;s your store overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`flex items-center gap-1 text-xs font-medium ${
                  stat.trend === 'up' ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {stat.trend === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-zinc-500 mt-1">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Orders & Top Products */}
      <div className="grid lg:grid-cols-2 gap-6 mt-8">
        {/* Recent Orders */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Recent Orders</h2>
            <Link
              href="/dashboard/orders"
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              View All
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-zinc-500 text-sm py-6 text-center">No orders yet</p>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between py-3 border-b border-zinc-800 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{order.customerName}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      #{order.id.slice(0, 8)} · {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">${order.total.toFixed(2)}</p>
                    <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full mt-1 ${
                      statusColors[order.status] || 'bg-zinc-500/10 text-zinc-400'
                    }`}>
                      {formatStatus(order.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Top Products</h2>
            <Link
              href="/dashboard/products"
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Manage
            </Link>
          </div>

          {products.length === 0 ? (
            <p className="text-zinc-500 text-sm py-6 text-center">No products yet</p>
          ) : (
            <div className="space-y-4">
              {products.slice(0, 5).map((product, i) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between py-3 border-b border-zinc-800 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-zinc-500 w-5">{i + 1}.</span>
                    <div>
                      <p className="text-sm font-medium text-white">{product.name}</p>
                      <p className="text-xs text-zinc-500 capitalize">{product.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">${product.price.toFixed(2)}</p>
                    <p className="text-xs text-zinc-500">{product.reviews} reviews</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Add Product', href: '/dashboard/products/new', emoji: '➕' },
            { label: 'View Orders', href: '/dashboard/orders', emoji: '📦' },
            { label: 'Edit Products', href: '/dashboard/products', emoji: '✏️' },
            { label: 'View Site', href: '/', emoji: '🌐' },
          ].map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 text-center
                         hover:bg-zinc-800 transition-all group"
            >
              <span className="text-2xl block mb-2 group-hover:scale-110 transition-transform">
                {action.emoji}
              </span>
              <span className="text-sm text-zinc-400 group-hover:text-white transition-colors">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
