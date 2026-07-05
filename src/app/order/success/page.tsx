'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle, Package, ArrowLeft } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md mx-auto px-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="w-10 h-10 text-emerald-600" />
        </motion.div>

        <h1 className="text-3xl font-bold text-zinc-900 mb-2">Order Placed! 🎉</h1>
        <p className="text-zinc-500 mb-6">
          Thank you for your purchase. Your order has been placed successfully.
        </p>

        {orderId && (
          <div className="bg-zinc-50 rounded-2xl p-4 mb-8">
            <p className="text-xs text-zinc-500 mb-1">Order ID</p>
            <p className="text-sm font-mono font-medium text-zinc-900">#{orderId.slice(0, 12)}</p>
          </div>
        )}

        <div className="space-y-3">
          <Link
            href="/account/orders"
            className="block w-full py-3.5 bg-zinc-900 text-white rounded-xl font-medium
                       hover:bg-zinc-800 transition-all active:scale-[0.98]"
          >
            View My Orders
          </Link>
          <Link
            href="/products"
            className="block w-full py-3.5 bg-zinc-100 text-zinc-700 rounded-xl font-medium
                       hover:bg-zinc-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
