'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {

      router.push('/login');
      return;
    }

    const hasPermissions = user.isSuperAdmin || (user.permissions && user.permissions.length > 0);

    if (!hasPermissions) {
      router.replace('/no-access');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-slate-600">Yükleniyor...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const hasPermissions = user.isSuperAdmin || (user.permissions && user.permissions.length > 0);

  if (!hasPermissions) {
    return null;
  }

  return <>{children}</>;
}
