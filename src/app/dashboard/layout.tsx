'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AdminSidebar from '@/components/AdminSidebar';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, isOwner } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !isOwner)) {
      router.push('/');
    }
  }, [user, loading, isOwner, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <LoadingSpinner size="lg" color="text-white" />
      </div>
    );
  }

  if (!user || !isOwner) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      <AdminSidebar />
      <div className="flex-1 ml-64 transition-all duration-300">
        <div className="p-6 sm:p-8 lg:p-10">
          {children}
        </div>
      </div>
    </div>
  );
}
