'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { AdminGuard } from '@/src/features/auth/components/AdminGuard';
import { useAuth } from '@/src/features/auth/context/AuthContext';
import { isSuperAdmin } from '@/src/lib/permissions';

const navItems = [
  {
    label: 'Kontrol Paneli',
    href: '/dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: 'Anketler',
    href: '/surveys',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    label: 'Rol Yönetimi',
    href: '/admin/role-management',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const isAdmin = user && isSuperAdmin(user);

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-background">
        {/* Sidebar */}
        <aside className="w-72 bg-metro-navy flex flex-col shadow-xl">
          {/* Logo Section */}
          <div className="px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-white font-bold text-lg tracking-tight">METRO İSTANBUL</h1>
                <div className="h-0.5 w-12 bg-metro-red mt-1 rounded-full"></div>
              </div>
            </div>
            <p className="text-white/50 text-xs mt-3 font-medium">Anket Yönetim Sistemi</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4">
            <div className="space-y-1">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200
                      ${active
                        ? 'bg-white text-metro-navy shadow-lg'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                      }
                    `}
                  >
                    <span className={active ? 'text-metro-blue' : ''}>{item.icon}</span>
                    {item.label}
                    {active && (
                      <span className="ml-auto w-1.5 h-1.5 bg-metro-red rounded-full"></span>
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-white/10">
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-metro-blue rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">{user?.username || 'Kullanıcı'}</p>
                  <p className="text-white/50 text-xs">
                    {isAdmin ? 'Süper Admin' : 'Kullanıcı'}
                  </p>
                </div>
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-metro-red text-white rounded-lg transition-all duration-200 text-sm font-medium"
                type="button"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Çıkış Yap
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="h-16 bg-white border-b border-border/50 shadow-sm sticky top-0 z-10">
            <div className="h-full px-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-lg font-semibold text-foreground">
                  {pathname === '/dashboard' || pathname === '/admin' ? 'Kontrol Paneli' :
                   pathname.startsWith('/surveys') ? 'Anketler' :
                   pathname.startsWith('/admin/role') ? 'Rol Yönetimi' : 'Sayfa'}
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  Hoş geldiniz, <span className="font-medium text-foreground">{user?.username}</span>
                </span>
                <div className="w-px h-6 bg-border"></div>
                <span className="text-xs text-muted-foreground">
                  {new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto">
            <div className="p-8 max-w-7xl mx-auto w-full animate-fade-in">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
