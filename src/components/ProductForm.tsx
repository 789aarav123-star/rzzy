'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/lib/types';
import { motion } from 'framer-motion';
import { Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProductFormProps {
  product?: Product | null;
  onSave: (product: Partial<Product>) => Promise<void>;
  onCancel: () => void;
}

export default function ProductForm({ product, onSave, onCancel }: ProductFormProps) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: 'tops',
    sizes: 'S, M, L, XL',
    colors: 'Black, White, Gray, Navy',
    tags: '',
    featured: false,
    inStock: true,
    stock: '100',
    rating: '4.5',
    reviews: '0',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        description: product.description,
        price: String(product.price),
        originalPrice: product.originalPrice ? String(product.originalPrice) : '',
        category: product.category,
        sizes: product.sizes.join(', '),
        colors: product.colors.join(', '),
        tags: product.tags.join(', '),
        featured: product.featured,
        inStock: product.inStock,
        stock: String(product.stock ?? 100),
        rating: String(product.rating),
        reviews: String(product.reviews),
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      toast.error('Name and price are required');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        ...form,
        price: parseFloat(form.price),
        originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : undefined,
        sizes: form.sizes.split(',').map((s) => s.trim()).filter(Boolean),
        colors: form.colors.split(',').map((c) => c.trim()).filter(Boolean),
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        rating: parseFloat(form.rating),
        reviews: parseInt(form.reviews) || 0,
        stock: parseInt(form.stock) || 0,
        inStock: (parseInt(form.stock) || 0) > 0 ? form.inStock : false,
      });
      toast.success(product ? 'Product updated!' : 'Product created!');
    } catch (err) {
      toast.error('Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">Product Name *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white
                       placeholder-zinc-500 outline-none focus:border-zinc-500 transition-colors"
            placeholder="e.g. Classic Cotton Tee"
          />
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
            className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white
                       placeholder-zinc-500 outline-none focus:border-zinc-500 transition-colors resize-none"
            placeholder="Describe your product..."
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">Price *</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
            <input
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full pl-7 pr-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white
                         placeholder-zinc-500 outline-none focus:border-zinc-500 transition-colors"
              placeholder="29.99"
            />
          </div>
        </div>

        {/* Original Price */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">Original Price (for sale)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
            <input
              type="number"
              step="0.01"
              value={form.originalPrice}
              onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
              className="w-full pl-7 pr-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white
                         placeholder-zinc-500 outline-none focus:border-zinc-500 transition-colors"
              placeholder="49.99"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">Category</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white
                       outline-none focus:border-zinc-500 transition-colors"
          >
            <option value="tops">Tops</option>
            <option value="bottoms">Bottoms</option>
            <option value="dresses">Dresses</option>
            <option value="outerwear">Outerwear</option>
            <option value="accessories">Accessories</option>
          </select>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">Tags (comma separated)</label>
          <input
            type="text"
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white
                       placeholder-zinc-500 outline-none focus:border-zinc-500 transition-colors"
            placeholder="new, summer, casual"
          />
        </div>

        {/* Sizes */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">Sizes (comma separated)</label>
          <input
            type="text"
            value={form.sizes}
            onChange={(e) => setForm({ ...form, sizes: e.target.value })}
            className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white
                       placeholder-zinc-500 outline-none focus:border-zinc-500 transition-colors"
            placeholder="XS, S, M, L, XL"
          />
        </div>

        {/* Colors */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">Colors (comma separated)</label>
          <input
            type="text"
            value={form.colors}
            onChange={(e) => setForm({ ...form, colors: e.target.value })}
            className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white
                       placeholder-zinc-500 outline-none focus:border-zinc-500 transition-colors"
            placeholder="Black, White, Navy"
          />
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">Rating</label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="5"
            value={form.rating}
            onChange={(e) => setForm({ ...form, rating: e.target.value })}
            className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white
                       outline-none focus:border-zinc-500 transition-colors"
          />
        </div>

        {/* Reviews */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">Review Count</label>
          <input
            type="number"
            min="0"
            value={form.reviews}
            onChange={(e) => setForm({ ...form, reviews: e.target.value })}
            className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white
                       outline-none focus:border-zinc-500 transition-colors"
          />
        </div>

        {/* Toggles */}
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              className="sr-only"
            />
            <div className={`w-10 h-6 rounded-full transition-colors ${form.featured ? 'bg-zinc-500' : 'bg-zinc-700'}`}>
              <div className={`w-4 h-4 bg-white rounded-full transition-transform mt-1 ml-1 ${form.featured ? 'translate-x-4' : ''}`} />
            </div>
            <span className="text-sm text-zinc-300">Featured</span>
          </label>

          {/* Stock */}
          <div>
            <input
              type="number"
              min="0"
              value={form.stock}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0;
                setForm({ ...form, stock: e.target.value, inStock: val > 0 });
              }}
              className="w-24 px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white
                         outline-none focus:border-zinc-500 transition-colors text-sm"
              placeholder="Stock"
            />
            <span className="text-xs text-zinc-500 ml-2">Quantity in stock</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t border-zinc-800">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-zinc-100 text-zinc-900 rounded-xl text-sm font-medium
                     hover:bg-white transition-all active:scale-[0.98] disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 px-6 py-2.5 bg-zinc-800 text-zinc-300 rounded-xl text-sm
                     hover:bg-zinc-700 transition-all"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
      </div>
    </motion.form>
  );
}
