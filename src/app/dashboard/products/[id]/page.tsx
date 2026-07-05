'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchProductById, updateProduct } from '@/lib/firestore-service';
import { Product } from '@/lib/types';
import ProductForm from '@/components/ProductForm';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProduct();
  }, [params.id]);

  const loadProduct = async () => {
    try {
      const data = await fetchProductById(params.id as string);
      setProduct(data);
    } catch (err) {
      console.error('Failed to load product:', err);
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: any) => {
    try {
      await updateProduct(params.id as string, data);
      toast.success('Product updated!');
      router.push('/dashboard/products');
    } catch (err) {
      console.error('Failed to update product:', err);
      toast.error('Failed to update product');
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" color="text-white" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <p className="text-zinc-400">Product not found</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Edit Product</h1>
        <p className="text-zinc-400 text-sm mt-1">{product.name}</p>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 sm:p-8">
        <ProductForm
          product={product}
          onSave={handleSave}
          onCancel={() => router.push('/dashboard/products')}
        />
      </div>
    </div>
  );
}
