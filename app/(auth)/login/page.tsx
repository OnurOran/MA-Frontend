'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/src/features/auth/context/AuthContext';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';

function LoginForm() {
  const { login, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      const timer = setTimeout(() => {
        router.push(returnUrl || '/dashboard');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isLoading, router, returnUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login({ username, password });
    } catch (err) {
      setError('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-border/50 overflow-hidden">
      {/* Header */}
      <div className="px-8 pt-8 pb-6">
        <h2 className="text-2xl font-bold text-foreground">
          Hoş Geldiniz
        </h2>
        <p className="text-muted-foreground mt-2">
          Devam etmek için hesabınıza giriş yapın
        </p>
      </div>

      {/* Form */}
      <div className="px-8 pb-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium text-foreground">
              Kullanıcı Adı
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <Input
                id="username"
                type="text"
                placeholder="Kullanıcı adınızı girin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
                className="pl-10 h-12 bg-background border-border focus:border-primary focus:ring-primary"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-foreground">
              Şifre
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Şifrenizi girin"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="pl-10 h-12 bg-background border-border focus:border-primary focus:ring-primary"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-3 rounded-xl bg-destructive/10 border border-destructive/20 p-4">
              <div className="w-8 h-8 bg-destructive/20 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-sm text-destructive font-medium">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-12 text-base"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Giriş yapılıyor...
              </div>
            ) : (
              'Giriş Yap'
            )}
          </Button>
        </form>
      </div>

      {/* Footer - Only show in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="px-8 py-4 bg-muted/30 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Test kullanıcısı: <code className="bg-background px-2 py-1 rounded-md text-foreground font-mono">admin</code> / <code className="bg-background px-2 py-1 rounded-md text-foreground font-mono">Admin123!</code>
          </p>
        </div>
      )}
    </div>
  );
}

function LoadingCard() {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-border/50 overflow-hidden">
      <div className="px-8 pt-8 pb-6">
        <div className="h-8 w-40 skeleton rounded-lg"></div>
        <div className="h-4 w-60 skeleton rounded-lg mt-3"></div>
      </div>
      <div className="px-8 pb-8 space-y-5">
        <div className="space-y-2">
          <div className="h-4 w-24 skeleton rounded"></div>
          <div className="h-12 w-full skeleton rounded-lg"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 w-16 skeleton rounded"></div>
          <div className="h-12 w-full skeleton rounded-lg"></div>
        </div>
        <div className="h-12 w-full skeleton rounded-lg"></div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingCard />}>
      <LoginForm />
    </Suspense>
  );
}
