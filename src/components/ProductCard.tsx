'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Product } from '@/lib/types';
import { ShoppingBag, Star, Bell, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { addNotifyRequest } from '@/lib/firestore-service';
import toast from 'react-hot-toast';
import AuthModal from './AuthModal';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [notifying, setNotifying] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    addToCart({
      product,
      quantity: 1,
      size: product.sizes[0] || 'M',
      color: product.colors[0] || 'Black',
    });
    toast.success(`${product.name} added to cart!`);
  };

  const handleNotifyMe = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user || !user.email) {
      setShowAuthModal(true);
      return;
    }

    setNotifying(true);
    try {
      await addNotifyRequest({
        productId: product.id,
        productName: product.name,
        userEmail: user.email,
      });
      toast.success(`We'll email you when ${product.name} is back!`);
    } catch (err) {
      toast.error('Failed to submit request');
    } finally {
      setNotifying(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
        className="group relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link href={`/products/${product.id}`} className="block">
          <div className="relative overflow-hidden rounded-2xl bg-zinc-100 aspect-[3/4] mb-4">
            {/* Product Image Placeholder */}
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-200 to-zinc-300 flex items-center justify-center">
              <motion.div
                animate={isHovered ? { scale: 1.05 } : { scale: 1 }}
                transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                className="text-6xl"
              >
                {product.category === 'tops' ? '👕' :
                 product.category === 'bottoms' ? '👖' :
                 product.category === 'dresses' ? '👗' :
                 product.category === 'outerwear' ? '🧥' :
                 product.category === 'accessories' ? '👜' : '👕'}
              </motion.div>
            </div>

            {/* Out of Stock Overlay */}
            {!product.inStock && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
                <div className="text-center">
                  <AlertTriangle className="w-8 h-8 text-white mx-auto mb-2" />
                  <p className="text-white font-medium text-sm">Out of Stock</p>
                </div>
              </div>
            )}

            {/* Quick Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={isHovered && product.inStock ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              className="absolute top-3 right-3 flex flex-col gap-2"
            >
            </motion.div>

            {/* Quick Add to Cart / Notify Me */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isHovered ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              className="absolute bottom-0 left-0 right-0 p-3"
            >
              {product.inStock ? (
                <button
                  onClick={handleAddToCart}
                  className="w-full py-3 px-4 bg-black/80 backdrop-blur-md text-white rounded-xl text-sm font-medium
                             hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-xl"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Add to Cart
                </button>
              ) : (
                <button
                  onClick={handleNotifyMe}
                  disabled={notifying}
                  className="w-full py-3 px-4 bg-amber-500/90 backdrop-blur-md text-white rounded-xl text-sm font-medium
                             hover:bg-amber-600 transition-colors flex items-center justify-center gap-2 shadow-xl disabled:opacity-50"
                >
                  <Bell className="w-4 h-4" />
                  {notifying ? '...' : 'Notify Me'}
                </button>
              )}
            </motion.div>

            {/* Discount Badge */}
            {product.originalPrice && product.inStock && (
              <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                -{Math.round((1 - product.price / product.originalPrice) * 100)}%
              </div>
            )}
          </div>

          <div className="px-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-medium text-zinc-900 text-sm group-hover:text-zinc-600 transition-colors">
                  {product.name}
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5 capitalize">{product.category}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="font-semibold text-zinc-900">${product.price.toFixed(2)}</span>
                {product.originalPrice && (
                  <span className="text-xs text-zinc-400 line-through ml-1.5">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1 mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(product.rating)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-zinc-200'
                  }`}
                />
              ))}
              <span className="text-xs text-zinc-400 ml-1">({product.reviews})</span>
            </div>

            {/* Colors */}
            <div className="flex gap-1.5 mt-3">
              {product.colors.slice(0, 4).map((color, i) => (
                <div
                  key={i}
                  className="w-3.5 h-3.5 rounded-full border border-zinc-200"
                  style={{ backgroundColor: color.toLowerCase() }}
                  title={color}
                />
              ))}
              {product.colors.length > 4 && (
                <span className="text-[10px] text-zinc-400 ml-1">+{product.colors.length - 4}</span>
              )}
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
