'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef, SortingState } from '@tanstack/react-table';
import { useSurveys, usePublishSurvey, useDuplicateSurvey, useDeleteSurvey } from '@/src/features/survey/hooks';
import { Button } from '@/src/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/src/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu';
import { Label } from '@/src/components/ui/label';
import { DateTimePicker } from '@/src/components/ui/date-time-picker';
import { DataTable } from '@/src/components/ui/data-table';
import { SurveyListItemDto } from '@/src/types';
import { toast } from 'sonner';

type SurveyStatus = {
  value: 'draft' | 'published';
  label: string;
  color: string;
};

const getSurveyStatus = (survey: SurveyListItemDto): SurveyStatus => {
  if (!survey.isActive) {
    return { value: 'draft', label: 'Taslak', color: 'bg-amber-100 text-amber-700 border-amber-200' };
  }
  return { value: 'published', label: 'Yayında', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
};

const formatDate = (date: Date | null) => {
  if (!date) return '—';
  return date.toLocaleString('tr-TR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function SurveysPage() {
  const router = useRouter();
  const { data: surveys, isLoading, error } = useSurveys();
  const publishSurvey = usePublishSurvey();
  const duplicateSurvey = useDuplicateSurvey();
  const deleteSurvey = useDeleteSurvey();

  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [selectedSurveyId, setSelectedSurveyId] = useState<number | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteSurveyId, setDeleteSurveyId] = useState<number | null>(null);
  const [deleteSurveyTitle, setDeleteSurveyTitle] = useState('');

  const handlePublishClick = (surveyId: number) => {
    setSelectedSurveyId(surveyId);
    setStartDate(null);
    setEndDate(null);
    setPublishDialogOpen(true);
  };

  const handlePublish = async () => {
    if (!selectedSurveyId || !startDate || !endDate) {
      toast.error('Lütfen başlangıç ve bitiş tarihlerini girin');
      return;
    }

    if (endDate <= startDate) {
      toast.error('Bitiş tarihi başlangıç tarihinden sonra olmalıdır');
      return;
    }

    try {
      await publishSurvey.mutateAsync({
        surveyId: selectedSurveyId,
        dates: {
          StartDate: startDate,
          EndDate: endDate,
        },
      });
      setPublishDialogOpen(false);
      setSelectedSurveyId(null);
    } catch {
      // Error is handled by the hook
    }
  };

  const handleDuplicate = async (surveyId: number) => {
    try {
      await duplicateSurvey.mutateAsync(surveyId);
    } catch {
      // Error is handled by the hook
    }
  };

  const handleDeleteClick = (survey: SurveyListItemDto) => {
    setDeleteSurveyId(survey.id);
    setDeleteSurveyTitle(survey.title);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteSurveyId) return;
    try {
      await deleteSurvey.mutateAsync(deleteSurveyId);
      setDeleteDialogOpen(false);
      setDeleteSurveyId(null);
      setDeleteSurveyTitle('');
    } catch {
      // Error is handled by the hook
    }
  };

  const handleCopySurveyLink = async (survey: SurveyListItemDto) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${baseUrl}/p/${survey.slug}`;

    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Anket bağlantısı kopyalandı');
        return;
      } catch {
        // Fallback to execCommand
      }
    }

    try {
      const textarea = document.createElement('textarea');
      textarea.value = url;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const copied = document.execCommand('copy');
      document.body.removeChild(textarea);

      if (copied) {
        toast.success('Anket bağlantısı kopyalandı');
      } else {
        toast.error('Bağlantı kopyalanamadı');
      }
    } catch {
      toast.error('Bağlantı kopyalanamadı');
    }
  };

  const columns: ColumnDef<SurveyListItemDto>[] = useMemo(
    () => [
      {
        accessorKey: 'title',
        header: 'Anket Başlığı',
        filterFn: 'includesString',
        cell: ({ row }) => (
          <div>
            <div className="font-semibold text-foreground">{row.original.title}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{row.original.slug}</div>
          </div>
        ),
      },
      {
        id: 'accessType',
        header: 'Erişim Türü',
        accessorFn: (row) => row.accessType,
        filterFn: 'equalsString',
        cell: ({ getValue }) => {
          const value = getValue<string>();
          const isInternal = value === 'Internal';
          const isInvitationOnly = value === 'InvitationOnly';
          return (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold border ${
                isInternal
                  ? 'bg-violet-50 text-violet-700 border-violet-200'
                  : isInvitationOnly
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-orange-50 text-orange-700 border-orange-200'
              }`}
            >
              {isInternal ? (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              ) : isInvitationOnly ? (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              ) : (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {isInternal ? 'Dahili' : isInvitationOnly ? 'Davetiye' : 'Halka Açık'}
            </span>
          );
        },
      },
      {
        id: 'status',
        header: 'Durum',
        accessorFn: (row) => getSurveyStatus(row).value,
        filterFn: 'equalsString',
        cell: ({ row }) => {
          const status = getSurveyStatus(row.original);
          return (
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border ${status.color}`}>
              {status.label}
            </span>
          );
        },
      },
      {
        accessorKey: 'startDate',
        header: 'Başlangıç',
        cell: ({ getValue }) => (
          <span className="text-sm text-muted-foreground">{formatDate(getValue<Date | null>())}</span>
        ),
      },
      {
        accessorKey: 'endDate',
        header: 'Bitiş',
        cell: ({ getValue }) => (
          <span className="text-sm text-muted-foreground">{formatDate(getValue<Date | null>())}</span>
        ),
      },
      {
        accessorKey: 'createdBy',
        header: 'Oluşturan',
        cell: ({ getValue }) => (
          <span className="text-sm font-medium text-foreground">{getValue<string>()}</span>
        ),
      },
      {
        id: 'actions',
        header: 'İşlemler',
        cell: ({ row }) => {
          const survey = row.original;
          const status = getSurveyStatus(survey);
          const isDraft = status.value === 'draft';

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                  Seçenekler
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {isDraft && (
                  <DropdownMenuItem onClick={() => handlePublishClick(survey.id)}>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Yayınla
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => router.push(`/surveys/${survey.id}/edit`)}>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  {isDraft ? 'Düzenle' : 'Metinleri Düzenle'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDuplicate(survey.id)} disabled={duplicateSurvey.isPending}>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Çoğalt
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleCopySurveyLink(survey)}>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Bağlantıyı Kopyala
                </DropdownMenuItem>
                {survey.accessType === 'InvitationOnly' && (
                  <DropdownMenuItem onClick={() => router.push(`/surveys/${survey.id}/invitations`)}>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Davetiyeleri Yönet
                  </DropdownMenuItem>
                )}
                {!isDraft && (
                  <DropdownMenuItem onClick={() => router.push(`/surveys/${survey.id}/report`)}>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Rapor
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDeleteClick(survey)}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Sil
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [router, duplicateSurvey.isPending]
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-border/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-8 w-48 skeleton rounded-lg"></div>
              <div className="h-4 w-72 skeleton rounded mt-2"></div>
            </div>
            <div className="h-10 w-32 skeleton rounded-lg"></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border/50 p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 skeleton rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Bir Hata Oluştu</h3>
          <p className="text-muted-foreground">Anketler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.</p>
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
            <h1 className="text-2xl font-bold text-foreground">Anketler</h1>
            <p className="text-muted-foreground mt-1">Departman anketlerinizi görüntüleyin ve yönetin</p>
          </div>
          <Button onClick={() => router.push('/surveys/new')}>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Yeni Anket
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-border/50">
        <DataTable
          columns={columns}
          data={surveys ?? []}
          searchKey="title"
          sorting={sorting}
          onSortingChange={setSorting}
          filterableColumns={[
            {
              id: 'status',
              title: 'Durum',
              options: [
                { value: 'draft', label: 'Taslak' },
                { value: 'published', label: 'Yayında' },
              ],
            },
            {
              id: 'accessType',
              title: 'Erişim',
              options: [
                { value: 'Internal', label: 'Dahili' },
                { value: 'Public', label: 'Halka Açık' },
                { value: 'InvitationOnly', label: 'Davetiye' },
              ],
            },
          ]}
          toolbarContent={null}
          emptyMessage="Henüz anket bulunmuyor"
          enableColumnVisibility={false}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              Anketi Sil
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">&quot;{deleteSurveyTitle}&quot;</strong> anketini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                İptal
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteSurvey.isPending}
              >
                {deleteSurvey.isPending ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Siliniyor...
                  </div>
                ) : (
                  'Sil'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Publish Dialog */}
      <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-metro-blue/10 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-metro-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              Anketi Yayınla
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-sm font-medium">
                Başlangıç Tarihi ve Saati <span className="text-destructive">*</span>
              </Label>
              <DateTimePicker
                id="startDate"
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                placeholderText="Başlangıç tarihini seçin"
                minDate={new Date()}
              />
              <p className="text-xs text-muted-foreground">Format: GG.AA.YYYY SS:DD</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-sm font-medium">
                Bitiş Tarihi ve Saati <span className="text-destructive">*</span>
              </Label>
              <DateTimePicker
                id="endDate"
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                placeholderText="Bitiş tarihini seçin"
                minDate={startDate || new Date()}
              />
              <p className="text-xs text-muted-foreground">Format: GG.AA.YYYY SS:DD</p>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setPublishDialogOpen(false)}>
                İptal
              </Button>
              <Button onClick={handlePublish} disabled={publishSurvey.isPending}>
                {publishSurvey.isPending ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Yayınlanıyor...
                  </div>
                ) : (
                  'Yayınla'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
