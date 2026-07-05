'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { XCircle, RefreshCw, ArrowLeft, HeadphonesIcon } from 'lucide-react';

export default function OrderFailurePage() {
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
          className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <XCircle className="w-10 h-10 text-red-500" />
        </motion.div>

        <h1 className="text-3xl font-bold text-zinc-900 mb-2">Payment Failed</h1>
        <p className="text-zinc-500 mb-8">
          We weren&apos;t able to process your payment. Please try again or use a different payment method.
        </p>

        <div className="space-y-3">
          <Link
            href="/cart"
            className="block w-full py-3.5 bg-zinc-900 text-white rounded-xl font-medium
                       hover:bg-zinc-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Link>
          <Link
            href="/products"
            className="block w-full py-3.5 bg-zinc-100 text-zinc-700 rounded-xl font-medium
                       hover:bg-zinc-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
          <button
            onClick={() => window.location.href = 'mailto:support@rzzy.com'}
            className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors pt-2 inline-flex items-center gap-1"
          >
            <HeadphonesIcon className="w-3.5 h-3.5" />
            Need help? Contact support
          </button>
        </div>
      </motion.div>
    </div>
  );
}
