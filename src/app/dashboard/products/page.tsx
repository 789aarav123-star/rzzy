'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Search, Star, RefreshCw, Package } from 'lucide-react';
import { Product } from '@/lib/types';
import { fetchProducts, deleteProduct, seedProducts, updateProduct } from '@/lib/firestore-service';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function DashboardProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (err) {
      console.error('Failed to load products:', err);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await seedProducts();
      toast.success('Sample products seeded!');
      await loadProducts();
    } catch (err) {
      toast.error('Failed to seed products');
    } finally {
      setSeeding(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success('Product deleted');
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  const handleUpdateStock = async (product: Product, newStock: number) => {
    const stock = Math.max(0, newStock);
    try {
      await updateProduct(product.id, {
        stock,
        inStock: stock > 0,
      });
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, stock, inStock: stock > 0 } : p
        )
      );
      toast.success(`Stock updated to ${stock}`);
    } catch (err) {
      toast.error('Failed to update stock');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" color="text-white" />
      </div>
    );
  }

  if (products.length === 0 && !loading) {
    return (
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Products</h1>
            <p className="text-zinc-400 text-sm mt-1">No products yet</p>
          </div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4">📦</div>
          <h3 className="text-xl font-medium text-white mb-2">Your store is empty</h3>
          <p className="text-zinc-400 mb-8 max-w-md mx-auto">
            Get started by adding your first product or seed the store with sample products to see how everything looks.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/dashboard/products/new"
              className="flex items-center gap-2 px-6 py-3 bg-zinc-100 text-zinc-900 rounded-xl text-sm font-medium
                         hover:bg-white transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </Link>
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="flex items-center gap-2 px-6 py-3 bg-zinc-800 text-zinc-300 rounded-xl text-sm
                         hover:bg-zinc-700 transition-all disabled:opacity-50"
            >
              {seeding ? 'Seeding...' : 'Seed Sample Products'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Products</h1>
          <p className="text-zinc-400 text-sm mt-1">{products.length} total products</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadProducts}
            className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 text-zinc-300 rounded-xl text-sm
                       hover:bg-zinc-700 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <Link
            href="/dashboard/products/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-zinc-100 text-zinc-900 rounded-xl text-sm font-medium
                       hover:bg-white transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white
                     placeholder-zinc-500 outline-none focus:border-zinc-600 transition-colors text-sm"
        />
      </div>

      {/* Products Table */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">Product</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">Category</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">Price</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">Rating</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">Stock</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">Status</th>
                <th className="text-right px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredProducts.map((product, i) => (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="hover:bg-zinc-800/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-lg">
                        {product.category === 'tops' ? '👕' :
                         product.category === 'bottoms' ? '👖' :
                         product.category === 'dresses' ? '👗' :
                         product.category === 'outerwear' ? '🧥' : '👜'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{product.name}</p>
                        <p className="text-xs text-zinc-500">ID: {product.id.slice(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-zinc-400 capitalize">{product.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <span className="text-sm font-medium text-white">${product.price.toFixed(2)}</span>
                      {product.originalPrice && (
                        <span className="text-xs text-zinc-500 line-through ml-1">
                          ${product.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-sm text-zinc-400">{product.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateStock(product, product.stock - 1)}
                        disabled={product.stock <= 0}
                        className="w-6 h-6 rounded-full bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700
                                   transition-all flex items-center justify-center text-xs disabled:opacity-30"
                      >
                        -
                      </button>
                      <span className="text-sm font-medium text-white min-w-[24px] text-center">
                        {product.stock}
                      </span>
                      <button
                        onClick={() => handleUpdateStock(product, product.stock + 1)}
                        className="w-6 h-6 rounded-full bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700
                                   transition-all flex items-center justify-center text-xs"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${
                      product.inStock
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-red-500/10 text-red-400'
                    }`}>
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/dashboard/products/${product.id}`}
                        className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
            <p className="text-zinc-500">No products found</p>
          </div>
        )}
      </div>
    </div>
  );
}
