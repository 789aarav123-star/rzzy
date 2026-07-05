'use client';

import { useState, useEffect, useMemo } from 'react';
import { notFound, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Bell,
  Share2,
  ShoppingBag,
  Star,
  ChevronLeft,
  Truck,
  RefreshCw,
  Shield,
  AlertTriangle,
} from 'lucide-react';
import { fetchProductById, fetchProducts, addNotifyRequest } from '@/lib/firestore-service';
import { Product } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import AuthModal from '@/components/AuthModal';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [notifying, setNotifying] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [params.id]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const data = await fetchProductById(params.id as string);
      if (!data) {
        setProduct(null);
        return;
      }
      setProduct(data);

      // Load related products
      const allProducts = await fetchProducts({ category: data.category });
      setRelatedProducts(
        allProducts.filter((p) => p.id !== data.id).slice(0, 4)
      );
    } catch (err) {
      console.error('Failed to load product:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!selectedSize && product.sizes.length > 1) {
      toast.error('Please select a size');
      return;
    }
    if (!selectedColor) {
      toast.error('Please select a color');
      return;
    }
    addToCart({
      product,
      quantity,
      size: selectedSize || product.sizes[0],
      color: selectedColor,
    });
    toast.success(`${product.name} added to cart!`);
  };

  const handleNotifyMe = async () => {
    if (!product) return;

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
      toast.success(`We'll email you when ${product.name} is back in stock!`);
    } catch (err) {
      toast.error('Failed to submit request');
    } finally {
      setNotifying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!product) {
    notFound();
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Back button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Link
          href="/products"
          className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Products
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="aspect-[4/5] bg-zinc-100 rounded-3xl overflow-hidden relative group">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-8xl">
                  {product.category === 'tops' ? '👕' :
                   product.category === 'bottoms' ? '👖' :
                   product.category === 'dresses' ? '👗' :
                   product.category === 'outerwear' ? '🧥' : '👜'}
                </span>
              </div>

              {/* Discount Badge */}
              {product.originalPrice && (
                <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-full">
                  -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                </div>
              )}

              {/* Out of Stock Badge */}
              {!product.inStock && (
                <div className="absolute top-4 right-4 bg-zinc-900/80 text-white text-sm font-bold px-3 py-1.5 rounded-full backdrop-blur-sm flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  Out of Stock
                </div>
              )}

              {/* Share */}
              <div className="absolute bottom-4 right-4">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success('Link copied!');
                  }}
                  className="p-3 rounded-full bg-white/80 backdrop-blur-md text-zinc-700 hover:bg-white transition-all shadow-lg"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Thumbnails */}
            <div className="flex gap-3 mt-4">
              {[0, 1, 2, 3].map((idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-20 rounded-xl bg-zinc-100 flex items-center justify-center text-2xl
                             border-2 transition-all ${
                    selectedImage === idx ? 'border-zinc-900' : 'border-transparent hover:border-zinc-300'
                  }`}
                >
                  {['👕', '👖', '👗', '🧥'][idx % 4]}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-zinc-400 mb-4">
              <Link href="/" className="hover:text-zinc-600">Home</Link>
              <span>/</span>
              <Link href="/products" className="hover:text-zinc-600">Products</Link>
              <span>/</span>
              <span className="text-zinc-600 capitalize">{product.category}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-zinc-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-zinc-500">
                {product.rating} ({product.reviews} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mt-6">
              <span className="text-3xl font-bold text-zinc-900">${product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <span className="text-xl text-zinc-400 line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="mt-4 flex items-center gap-2">
              {product.inStock ? (
                <span className="text-sm text-emerald-600 font-medium flex items-center gap-1">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                  In Stock ({product.stock} available)
                </span>
              ) : (
                <span className="text-sm text-red-500 font-medium flex items-center gap-1">
                  <span className="w-2 h-2 bg-red-500 rounded-full" />
                  Out of Stock
                </span>
              )}
            </div>

            <p className="mt-6 text-zinc-600 leading-relaxed">{product.description}</p>

            {product.inStock && (
              <>
                {/* Color Selection */}
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-zinc-900">
                      Color: <span className="text-zinc-500 font-normal">{selectedColor || 'Select'}</span>
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2.5 rounded-xl text-sm transition-all ${
                          selectedColor === color
                            ? 'bg-zinc-900 text-white ring-2 ring-zinc-900 ring-offset-2'
                            : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size Selection */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-zinc-900">
                      Size: <span className="text-zinc-500 font-normal">{selectedSize || 'Select'}</span>
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[48px] px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                          selectedSize === size
                            ? 'bg-zinc-900 text-white ring-2 ring-zinc-900 ring-offset-2'
                            : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity */}
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-zinc-900 mb-3">Quantity</h3>
                  <div className="flex items-center border border-zinc-200 rounded-xl w-fit">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors rounded-l-xl"
                    >
                      -
                    </button>
                    <span className="px-6 py-2.5 text-sm font-medium text-zinc-900 border-x border-zinc-200 min-w-[48px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-4 py-2.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors rounded-r-xl"
                    >
                      +
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              {product.inStock ? (
                <button
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-zinc-900 text-white rounded-xl
                             font-medium hover:bg-zinc-800 transition-all active:scale-[0.98]"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Add to Cart — ${(product.price * quantity).toFixed(2)}
                </button>
              ) : (
                <button
                  onClick={handleNotifyMe}
                  disabled={notifying}
                  className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-amber-500 text-white rounded-xl
                             font-medium hover:bg-amber-600 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  <Bell className="w-5 h-5" />
                  {notifying ? 'Submitting...' : 'Notify Me When In Stock'}
                </button>
              )}
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 mt-10 pt-8 border-t border-zinc-100">
              {[
                { icon: Truck, label: 'Free Shipping', desc: 'On orders over $150' },
                { icon: RefreshCw, label: 'Easy Returns', desc: '30-day return policy' },
                { icon: Shield, label: 'Secure', desc: 'Protected checkout' },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-2">
                    <item.icon className="w-4 h-4 text-zinc-700" />
                  </div>
                  <p className="text-xs font-medium text-zinc-900">{item.label}</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-20 pt-16 border-t border-zinc-100">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-2xl font-bold text-zinc-900">Complete the Look</h2>
                <p className="text-zinc-500 mt-1">More from {product.category}</p>
              </div>
              <Link
                href={`/products?category=${product.category}`}
                className="text-sm font-medium text-zinc-900 hover:text-zinc-600 transition-colors"
              >
                View All
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
