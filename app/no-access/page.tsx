'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/features/auth/context/AuthContext';
import { Card, CardContent } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';

export default function NoAccessPage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {

      router.push('/login');
      return;
    }

    const hasPermissions = user.isSuperAdmin || (user.permissions && user.permissions.length > 0);

    if (hasPermissions) {

      router.replace('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Yükleniyor...</div>
      </div>
    );
  }

  if (!user || user.isSuperAdmin || (user.permissions && user.permissions.length > 0)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {}
      <div className="h-16 flex items-center px-6 border-b border-slate-200 bg-white">
        <div>
          <h2 className="text-slate-800 font-bold text-lg">METRO İSTANBUL</h2>
          <div className="h-0.5 w-16 bg-red-600 mt-1"></div>
        </div>
      </div>

      {}
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="max-w-md border-orange-200">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              {}
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-8 h-8 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>

              {}
              <h1 className="text-2xl font-bold text-slate-800">
                Henüz Yetkiniz Bulunmuyor
              </h1>

              {}
              <div className="space-y-2 text-slate-600">
                <p>
                  Merhaba <strong>{user?.username}</strong>,
                </p>
                <p>
                  Sisteme başarıyla giriş yaptınız ancak henüz size bir rol atanmamış.
                </p>
                <p className="text-sm">
                  Lütfen departman yöneticiniz veya sistem yöneticisi ile iletişime geçerek
                  gerekli yetkilerin size atanmasını talep edin.
                </p>
              </div>

              {}
              <div className="bg-slate-50 p-4 rounded-lg text-left space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Kullanıcı Adı:</span>
                  <span className="font-medium text-slate-800">{user?.username}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Departman ID:</span>
                  <span className="font-mono text-xs text-slate-800">
                    {user?.departmentId || 'Bilinmiyor'}
                  </span>
                </div>
              </div>

              {}
              <div className="pt-4">
                <Button
                  onClick={logout}
                  variant="outline"
                  className="w-full border-red-300 text-red-600 hover:bg-red-50"
                >
                  Çıkış Yap
                </Button>
              </div>

              {}
              <p className="text-xs text-slate-500 pt-2">
                Yardım için: admin@metroistanbul.com
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
