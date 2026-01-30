'use client';

import { useMemo, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { useSurvey } from '@/src/features/survey/hooks';
import {
  useInvitations,
  useCreateInvitation,
  useImportInvitations,
  useSendInvitations,
  useCancelInvitation,
} from '@/src/features/invitation/hooks';
import { Button } from '@/src/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/src/components/ui/dialog';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { DataTable } from '@/src/components/ui/data-table';
import { InvitationDto, DeliveryMethod } from '@/src/types';
import { toast } from 'sonner';

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Pending':
      return { label: 'Bekliyor', color: 'bg-gray-100 text-gray-700 border-gray-200' };
    case 'Sent':
      return { label: 'Gönderildi', color: 'bg-blue-100 text-blue-700 border-blue-200' };
    case 'Viewed':
      return { label: 'Görüntülendi', color: 'bg-amber-100 text-amber-700 border-amber-200' };
    case 'Completed':
      return { label: 'Tamamlandı', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
    case 'Cancelled':
      return { label: 'İptal Edildi', color: 'bg-red-100 text-red-700 border-red-200' };
    default:
      return { label: status, color: 'bg-gray-100 text-gray-700 border-gray-200' };
  }
};

const formatDate = (date: Date | null | undefined) => {
  if (!date) return '—';
  return new Date(date).toLocaleString('tr-TR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function InvitationsPage() {
  const params = useParams();
  const router = useRouter();
  const surveyId = Number(params.id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: survey, isLoading: surveyLoading } = useSurvey(surveyId);
  const { data: invitations, isLoading: invitationsLoading } = useInvitations(surveyId);
  const createInvitation = useCreateInvitation();
  const importInvitations = useImportInvitations();
  const sendInvitations = useSendInvitations();
  const cancelInvitation = useCancelInvitation();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+90');
  const [phone, setPhone] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('Email');

  const countryCodes = [
    { code: '+90', country: 'Türkiye', flag: '🇹🇷' },
    { code: '+1', country: 'ABD/Kanada', flag: '🇺🇸' },
    { code: '+44', country: 'İngiltere', flag: '🇬🇧' },
    { code: '+49', country: 'Almanya', flag: '🇩🇪' },
    { code: '+33', country: 'Fransa', flag: '🇫🇷' },
    { code: '+31', country: 'Hollanda', flag: '🇳🇱' },
    { code: '+39', country: 'İtalya', flag: '🇮🇹' },
    { code: '+34', country: 'İspanya', flag: '🇪🇸' },
    { code: '+7', country: 'Rusya', flag: '🇷🇺' },
    { code: '+86', country: 'Çin', flag: '🇨🇳' },
    { code: '+81', country: 'Japonya', flag: '🇯🇵' },
    { code: '+82', country: 'Güney Kore', flag: '🇰🇷' },
    { code: '+91', country: 'Hindistan', flag: '🇮🇳' },
    { code: '+971', country: 'BAE', flag: '🇦🇪' },
    { code: '+966', country: 'Suudi Arabistan', flag: '🇸🇦' },
    { code: '+20', country: 'Mısır', flag: '🇪🇬' },
    { code: '+30', country: 'Yunanistan', flag: '🇬🇷' },
    { code: '+359', country: 'Bulgaristan', flag: '🇧🇬' },
    { code: '+994', country: 'Azerbaycan', flag: '🇦🇿' },
    { code: '+995', country: 'Gürcistan', flag: '🇬🇪' },
  ];

  const handleCreateInvitation = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error('Ad ve soyad zorunludur');
      return;
    }

    if (deliveryMethod === 'Email' && !email.trim()) {
      toast.error('Email adresi zorunludur');
      return;
    }

    if (deliveryMethod === 'Sms' && !phone.trim()) {
      toast.error('Telefon numarası zorunludur');
      return;
    }

    try {
      const fullPhone = deliveryMethod === 'Sms' ? `${countryCode}${phone.trim()}` : null;
      await createInvitation.mutateAsync({
        surveyId,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim() || null,
        phone: fullPhone,
        deliveryMethod,
      });
      setCreateDialogOpen(false);
      resetForm();
    } catch {
      // Error handled by hook
    }
  };

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setCountryCode('+90');
    setPhone('');
    setDeliveryMethod('Email');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await importInvitations.mutateAsync({ surveyId, file });
    } catch {
      // Error handled by hook
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendAll = async () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    try {
      await sendInvitations.mutateAsync({ surveyId, baseUrl });
    } catch {
      // Error handled by hook
    }
  };

  const handleCopyLink = async (token: string) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${baseUrl}/s/${token}`;

    try {
      await navigator.clipboard.writeText(url);
      toast.success('Davetiye bağlantısı kopyalandı');
    } catch {
      toast.error('Bağlantı kopyalanamadı');
    }
  };

  const handleCancel = async (id: number) => {
    try {
      await cancelInvitation.mutateAsync({ id, surveyId });
    } catch {
      // Error handled by hook
    }
  };

  const columns: ColumnDef<InvitationDto>[] = useMemo(
    () => [
      {
        accessorKey: 'firstName',
        header: 'Ad Soyad',
        cell: ({ row }) => (
          <span className="font-medium">{row.original.firstName} {row.original.lastName}</span>
        ),
      },
      {
        accessorKey: 'deliveryMethod',
        header: 'İletişim',
        cell: ({ row }) => (
          <div className="text-sm">
            {row.original.deliveryMethod === 'Email' ? (
              <span className="text-muted-foreground">{row.original.email}</span>
            ) : (
              <span className="text-muted-foreground">{row.original.phone}</span>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Durum',
        cell: ({ getValue }) => {
          const status = getStatusBadge(getValue<string>());
          return (
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border ${status.color}`}>
              {status.label}
            </span>
          );
        },
      },
      {
        accessorKey: 'sentAt',
        header: 'Gönderim',
        cell: ({ getValue }) => (
          <span className="text-sm text-muted-foreground">{formatDate(getValue<Date | null>())}</span>
        ),
      },
      {
        accessorKey: 'viewedAt',
        header: 'Görüntüleme',
        cell: ({ getValue }) => (
          <span className="text-sm text-muted-foreground">{formatDate(getValue<Date | null>())}</span>
        ),
      },
      {
        accessorKey: 'completedAt',
        header: 'Tamamlama',
        cell: ({ getValue }) => (
          <span className="text-sm text-muted-foreground">{formatDate(getValue<Date | null>())}</span>
        ),
      },
      {
        id: 'actions',
        header: 'İşlemler',
        cell: ({ row }) => {
          const invitation = row.original;
          const canCancel = invitation.status !== 'Completed' && invitation.status !== 'Cancelled';

          return (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopyLink(invitation.token)}
                title="Bağlantıyı Kopyala"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </Button>
              {canCancel && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCancel(invitation.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  title="İptal Et"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    [surveyId]
  );

  const pendingCount = invitations?.filter(i => i.status === 'Pending').length ?? 0;

  if (surveyLoading || invitationsLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-border/50 p-6">
          <div className="h-8 w-48 skeleton rounded-lg"></div>
        </div>
        <div className="bg-white rounded-xl border border-border/50 p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 skeleton rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!survey || survey.accessType !== 'InvitationOnly') {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground mb-1">Bu sayfa davetiye bazlı anketler içindir</h3>
          <p className="text-muted-foreground">Anket davetiye bazlı değilse bu sayfaya erişilemez.</p>
          <Button className="mt-4" onClick={() => router.back()}>
            Geri Dön
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-border/50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Button>
              <h1 className="text-2xl font-bold text-foreground">Davetiyeler</h1>
            </div>
            <p className="text-muted-foreground mt-1 ml-10">{survey.title}</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleFileUpload}
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={importInvitations.isPending}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Excel İçe Aktar
            </Button>
            {pendingCount > 0 && (
              <Button
                variant="outline"
                onClick={handleSendAll}
                disabled={sendInvitations.isPending}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Bekleyenleri Gönder ({pendingCount})
              </Button>
            )}
            <Button onClick={() => setCreateDialogOpen(true)}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Yeni Davetiye
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        {['Pending', 'Sent', 'Viewed', 'Completed', 'Cancelled'].map((status) => {
          const count = invitations?.filter(i => i.status === status).length ?? 0;
          const badge = getStatusBadge(status);
          return (
            <div key={status} className="bg-white rounded-xl border border-border/50 p-4">
              <div className="text-2xl font-bold text-foreground">{count}</div>
              <div className={`text-sm ${badge.color.replace('bg-', 'text-').split(' ')[1]}`}>
                {badge.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-border/50">
        <DataTable
          columns={columns}
          data={invitations ?? []}
          searchKey="firstName"
          filterableColumns={[
            {
              id: 'status',
              title: 'Durum',
              options: [
                { value: 'Pending', label: 'Bekliyor' },
                { value: 'Sent', label: 'Gönderildi' },
                { value: 'Viewed', label: 'Görüntülendi' },
                { value: 'Completed', label: 'Tamamlandı' },
                { value: 'Cancelled', label: 'İptal Edildi' },
              ],
            },
            {
              id: 'deliveryMethod',
              title: 'Yöntem',
              options: [
                { value: 'Email', label: 'Email' },
                { value: 'Sms', label: 'SMS' },
              ],
            },
          ]}
          emptyMessage="Henüz davetiye bulunmuyor"
          enableColumnVisibility={false}
        />
      </div>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Yeni Davetiye</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Ad *</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Ahmet"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Soyad *</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Yılmaz"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliveryMethod">Gönderim Yöntemi *</Label>
              <Select value={deliveryMethod} onValueChange={(v) => setDeliveryMethod(v as DeliveryMethod)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="Email">Email</SelectItem>
                  {/* SMS temporarily disabled due to provider issues */}
                  {/* <SelectItem value="Sms">SMS</SelectItem> */}
                </SelectContent>
              </Select>
            </div>

            {deliveryMethod === 'Email' && (
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ahmet@example.com"
                />
              </div>
            )}

            {deliveryMethod === 'Sms' && (
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon *</Label>
                <div className="flex gap-2">
                  <Select value={countryCode} onValueChange={setCountryCode}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white max-h-[300px]">
                      {countryCodes.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.flag} {c.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="5551234567"
                    className="flex-1"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                İptal
              </Button>
              <Button onClick={handleCreateInvitation} disabled={createInvitation.isPending}>
                {createInvitation.isPending ? 'Oluşturuluyor...' : 'Oluştur'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
