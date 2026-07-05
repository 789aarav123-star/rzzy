'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { createOrder, reduceProductStock } from '@/lib/firestore-service';
import { sendOrderConfirmationToCustomer, sendOrderNotificationToOwner } from '@/lib/notifications';
import toast from 'react-hot-toast';
import AnimatedSection from '@/components/AnimatedSection';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [promoCode, setPromoCode] = useState('');

  const shipping = subtotal > 150 ? 0 : 12.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const [placing, setPlacing] = useState(false);

  const handleCheckout = async () => {
    if (!user || !user.email) {
      toast.error('Please sign in to checkout');
      return;
    }
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setPlacing(true);
    try {
      // Reduce stock for each item
      for (const item of items) {
        const result = await reduceProductStock(item.product.id, item.quantity);
        if (!result.success) {
          toast.error(`Not enough stock for ${item.product.name}`);
          setPlacing(false);
          return;
        }
      }

      const orderId = await createOrder({
        items: items,
        total,
        subtotal,
        shipping,
        tax,
        status: 'pending',
        customerEmail: user.email,
        customerName: user.displayName || 'Customer',
        shippingAddress: {
          street: '',
          city: '',
          state: '',
          zip: '',
          country: '',
        },
        paymentMethod: 'card',
      });

      // Send notifications (fire and forget)
      const orderData = {
        id: orderId,
        items,
        total,
        subtotal,
        shipping,
        tax,
        status: 'pending' as const,
        customerEmail: user.email,
        customerName: user.displayName || 'Customer',
        shippingAddress: { street: '', city: '', state: '', zip: '', country: '' },
        paymentMethod: 'card',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      sendOrderConfirmationToCustomer(orderData);
      sendOrderNotificationToOwner(orderData);

      clearCart();
      router.push(`/order/success?id=${orderId}`);
    } catch (err) {
      console.error('Failed to place order:', err);
      router.push('/order/failure');
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-8 h-8 text-zinc-400" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900">Your cart is empty</h2>
          <p className="text-zinc-500 mt-2">Looks like you haven&apos;t added anything yet.</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-zinc-900 text-white rounded-full
                       text-sm font-medium hover:bg-zinc-800 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <AnimatedSection>
          <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight">Shopping Cart</h1>
          <p className="text-zinc-500 mt-1">{items.length} item{items.length !== 1 ? 's' : ''} in your cart</p>
        </AnimatedSection>

        <div className="grid lg:grid-cols-3 gap-10 mt-10">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => (
              <motion.div
                key={`${item.product.id}-${item.size}-${item.color}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex gap-4 sm:gap-6 p-4 sm:p-6 bg-zinc-50 rounded-2xl"
              >
                {/* Image */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-zinc-200 flex items-center justify-center text-3xl flex-shrink-0">
                  {item.product.category === 'tops' ? '👕' :
                   item.product.category === 'bottoms' ? '👖' : '👗'}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        href={`/products/${item.product.id}`}
                        className="font-medium text-zinc-900 hover:text-zinc-600 transition-colors"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-sm text-zinc-500 mt-0.5">
                        {item.size} / {item.color}
                      </p>
                      <p className="text-sm font-semibold text-zinc-900 mt-1">
                        ${item.product.price.toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        removeFromCart(item.product.id, item.size, item.color);
                        toast.success('Item removed');
                      }}
                      className="p-2 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border border-zinc-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity - 1)}
                        className="p-2 hover:bg-zinc-100 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-4 text-sm font-medium text-zinc-900 min-w-[32px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity + 1)}
                        className="p-2 hover:bg-zinc-100 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="font-semibold text-zinc-900">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-zinc-50 rounded-2xl p-6 sticky top-28">
              <h3 className="text-lg font-semibold text-zinc-900 mb-6">Order Summary</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-zinc-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-zinc-400">
                    Free shipping on orders over $150
                  </p>
                )}
                <div className="flex justify-between text-zinc-600">
                  <span>Tax (8%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-zinc-200 pt-3 mt-3">
                  <div className="flex justify-between text-zinc-900 font-semibold text-base">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Promo Code */}
              <div className="mt-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm
                               outline-none focus:border-zinc-900 transition-colors"
                  />
                  <button className="px-4 py-2.5 bg-zinc-900 text-white text-sm rounded-xl hover:bg-zinc-800 transition-colors">
                    Apply
                  </button>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={placing}
                className="w-full mt-6 py-3.5 bg-zinc-900 text-white rounded-xl font-medium
                           hover:bg-zinc-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {placing ? 'Placing Order...' : 'Checkout'}
                {!placing && <ArrowRight className="w-4 h-4" />}
              </button>

              <Link
                href="/products"
                className="block text-center mt-3 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
