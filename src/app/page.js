"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/mapa');
      } else {
        router.push('/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
  return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-purple-200 mx-auto mb-6"></div>
          <p className="text-2xl font-bold text-purple-700">Cargando...</p>
      </div>
    </div>
  );
}

  return null; // Se redirigirá automáticamente
}