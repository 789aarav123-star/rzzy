'use client';

import { useRouter } from 'next/navigation';
import ProductForm from '@/components/ProductForm';
import { createProduct } from '@/lib/firestore-service';
import toast from 'react-hot-toast';

export default function NewProductPage() {
  const router = useRouter();

  const handleSave = async (data: any) => {
    try {
      const id = await createProduct(data);
      toast.success('Product created!');
      router.push('/dashboard/products');
    } catch (err) {
      console.error('Failed to create product:', err);
      toast.error('Failed to create product');
      throw err;
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Add New Product</h1>
        <p className="text-zinc-400 text-sm mt-1">Create a new product listing</p>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 sm:p-8">
        <ProductForm onSave={handleSave} onCancel={() => router.push('/dashboard/products')} />
      </div>
    </div>
  );
}
