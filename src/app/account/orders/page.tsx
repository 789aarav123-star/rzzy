'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Package, ChevronLeft, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchOrdersByUser } from '@/lib/firestore-service';
import { Order } from '@/lib/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';

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

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const statusSteps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

function getOrderProgress(status: string): number {
  const idx = statusSteps.indexOf(status);
  return idx >= 0 ? idx : -1;
}

export default function MyOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
      return;
    }
    if (user?.email) {
      loadOrders();
    }
  }, [user, authLoading]);

  const loadOrders = async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      const data = await fetchOrdersByUser(user.email);
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Home
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight">My Orders</h1>
        <p className="text-zinc-500 mt-1">
          {orders.length === 0 ? 'No orders yet' : `${orders.length} order${orders.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-zinc-50 rounded-3xl">
          <div className="w-16 h-16 bg-zinc-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-7 h-7 text-zinc-400" />
          </div>
          <h3 className="text-xl font-medium text-zinc-900 mb-2">No orders yet</h3>
          <p className="text-zinc-500 mb-6">When you place an order, it will appear here.</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-full text-sm font-medium
                       hover:bg-zinc-800 transition-all"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const progress = getOrderProgress(order.status);
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-zinc-200 rounded-2xl p-6"
              >
                {/* Order Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Order #{order.id.slice(0, 12)}</p>
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <Clock className="w-3 h-3" />
                      {formatDate(order.createdAt)}
                    </div>
                  </div>
                  <span className={`inline-block text-xs px-3 py-1 rounded-full font-medium ${
                    statusColors[order.status] || 'bg-zinc-500/10 text-zinc-400'
                  }`}>
                    {formatStatus(order.status)}
                  </span>
                </div>

                {/* Progress Bar */}
                {progress >= 0 && order.status !== 'cancelled' && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      {statusSteps.map((step, i) => (
                        <div key={step} className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full ${
                            i <= progress ? 'bg-zinc-900' : 'bg-zinc-200'
                          }`} />
                          <span className={`text-[10px] mt-1 ${
                            i <= progress ? 'text-zinc-700 font-medium' : 'text-zinc-400'
                          }`}>
                            {formatStatus(step)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="relative mt-1">
                      <div className="absolute top-0 left-0 h-0.5 bg-zinc-200 w-full" />
                      <div
                        className="absolute top-0 left-0 h-0.5 bg-zinc-900 transition-all"
                        style={{ width: `${(progress / (statusSteps.length - 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {order.status === 'cancelled' && (
                  <div className="mb-4 px-3 py-2 bg-red-50 rounded-xl text-xs text-red-600">
                    This order has been cancelled
                  </div>
                )}

                {/* Order Items */}
                <div className="space-y-3">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 py-2 border-b border-zinc-100 last:border-0">
                      <div className="w-12 h-12 rounded-lg bg-zinc-100 flex items-center justify-center text-xl flex-shrink-0">
                        {item.product.category === 'tops' ? '👕' :
                         item.product.category === 'bottoms' ? '👖' : '👗'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-900 truncate">{item.product.name}</p>
                        <p className="text-xs text-zinc-500">
                          {item.size} / {item.color} × {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-zinc-900">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-100">
                  <div className="text-sm text-zinc-500">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''} · {order.paymentMethod}
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-zinc-500">Total: </span>
                    <span className="text-lg font-bold text-zinc-900">${order.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Shipping Address */}
                {order.shippingAddress?.street && (
                  <div className="mt-3 text-xs text-zinc-400">
                    Shipping to: {order.shippingAddress.street}, {order.shippingAddress.city},{' '}
                    {order.shippingAddress.state} {order.shippingAddress.zip}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
