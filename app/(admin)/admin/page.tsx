'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/features/auth/context/AuthContext';
import { useGlobalStats, useDepartmentStats } from '@/src/features/dashboard/hooks';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { isSuperAdmin } from '@/src/lib/permissions';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const isAdmin = user ? isSuperAdmin(user) : false;

  const {
    data: globalStats,
    isLoading: globalLoading,
  } = useGlobalStats({ enabled: isAdmin });

  const {
    data: departmentStats,
    isLoading: departmentLoading,
  } = useDepartmentStats({ enabled: !isAdmin });

  const stats = isAdmin ? globalStats : departmentStats;
  const isLoading = isAdmin ? globalLoading : departmentLoading;

  const statCards = [
    {
      label: isAdmin ? 'Toplam Anket' : 'Departman Anketleri',
      value: stats?.totalSurveys ?? 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      color: 'bg-metro-blue',
      bgColor: 'bg-metro-blue/10',
      textColor: 'text-metro-blue',
    },
    {
      label: isAdmin ? 'Aktif Anket' : 'Aktif Departman Anketleri',
      value: stats?.activeSurveys ?? 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-emerald-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
    },
    {
      label: isAdmin ? 'Toplam Katılım' : 'Departman Katılımları',
      value: stats?.totalParticipations ?? 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'bg-violet-600',
      bgColor: 'bg-violet-50',
      textColor: 'text-violet-600',
    },
  ];

  const quickActions = [
    {
      title: 'Anketler',
      description: isAdmin
        ? 'Anketleri oluşturun, düzenleyin ve yayınlayın'
        : 'Departman anketlerinizi yönetin',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      href: '/surveys',
      buttonText: 'Anketleri Görüntüle',
    },
    {
      title: 'Rol Yönetimi',
      description: 'Kullanıcı rolleri ve yetkilerini yönetin',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      href: '/admin/role-management',
      buttonText: 'Rolleri Yönet',
    },
    {
      title: isAdmin ? 'Raporlar' : 'Katılım Özeti',
      description: isAdmin
        ? 'Anket sonuçlarını görüntüleyin ve analiz edin'
        : 'Departman katılımlarını izleyin',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      href: '/surveys',
      buttonText: 'Raporları Gör',
      variant: 'outline' as const,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-metro rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-metro-red rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold">
            {isAdmin ? 'Yönetim Paneli' : 'Departman Paneli'}
          </h1>
          <p className="text-white/80 mt-2 text-lg">
            {isAdmin
              ? `Hoş geldiniz, ${user?.username || 'Admin'}! Sistem genelindeki istatistikleri görüntüleyin.`
              : `Hoş geldiniz, ${user?.username || 'Kullanıcı'}. Departman özetiniz hazır.`}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {statCards.map((stat, index) => (
          <Card key={index} className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </p>
                  {isLoading ? (
                    <div className="h-9 w-16 skeleton rounded-lg mt-2"></div>
                  ) : (
                    <p className={`text-3xl font-bold mt-2 ${stat.textColor}`}>
                      {stat.value.toLocaleString('tr-TR')}
                    </p>
                  )}
                </div>
                <div className={`w-14 h-14 ${stat.bgColor} rounded-xl flex items-center justify-center ${stat.textColor}`}>
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Hızlı İşlemler</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {quickActions.map((action, index) => (
            <Card key={index} className="card-hover">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-metro-blue rounded-xl flex items-center justify-center text-white">
                    {action.icon}
                  </div>
                  <CardTitle>{action.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {action.description}
                </p>
                <Button
                  className="w-full"
                  variant={action.variant || 'default'}
                  onClick={() => router.push(action.href)}
                >
                  {action.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* User Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Hesap Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/50 rounded-xl">
              <p className="text-sm font-medium text-muted-foreground mb-1">Kullanıcı ID</p>
              <p className="text-sm font-mono text-foreground">{user?.userId}</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-xl">
              <p className="text-sm font-medium text-muted-foreground mb-1">Kullanıcı Adı</p>
              <p className="text-sm text-foreground font-medium">{user?.username || 'N/A'}</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-xl">
              <p className="text-sm font-medium text-muted-foreground mb-1">Yetki Durumu</p>
              {user?.isSuperAdmin ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-metro-red/10 text-metro-red text-xs font-semibold">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Süper Admin
                </span>
              ) : user?.permissions && user.permissions.length > 0 ? (
                <p className="text-sm text-foreground">{user.permissions.join(', ')}</p>
              ) : (
                <p className="text-sm text-muted-foreground">Yetki atanmamış</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
