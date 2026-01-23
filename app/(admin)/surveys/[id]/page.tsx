'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSurvey, usePublishSurvey } from '@/src/features/survey/hooks';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Label } from '@/src/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/src/components/ui/dialog';
import { DateTimePicker } from '@/src/components/ui/date-time-picker';
import { AttachmentViewer } from '@/src/components/AttachmentViewer';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5123/api';

const getAttachmentUrl = (attachmentId: number) => {
  return `${API_URL}/Attachments/${attachmentId}`;
};

const getQuestionTypeLabel = (type: string) => {
  switch (type) {
    case 'SingleSelect':
      return 'Tek Seçim';
    case 'MultiSelect':
      return 'Çoklu Seçim';
    case 'OpenText':
      return 'Açık Uçlu';
    case 'FileUpload':
      return 'Dosya Yükleme';
    case 'Conditional':
      return 'Koşullu';
    default:
      return type;
  }
};

export default function SurveyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const surveyId = parseInt(params.id as string);

  const { data: survey, isLoading, error } = useSurvey(surveyId);
  const publishSurvey = usePublishSurvey();

  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const getSurveyStatus = (startDate: Date | null, endDate: Date | null) => {
    if (!startDate || !endDate) {
      return { label: 'Taslak', color: 'bg-gray-100 text-gray-700' };
    }

    const now = new Date();

    if (now < startDate) {
      return { label: 'Yakında Başlıyor', color: 'bg-blue-100 text-blue-700' };
    } else if (now >= startDate && now <= endDate) {
      return { label: 'Aktif', color: 'bg-green-100 text-green-700' };
    } else {
      return { label: 'Sona Erdi', color: 'bg-red-100 text-red-700' };
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handlePublish = async () => {
    if (!startDate || !endDate) {
      alert('Lütfen başlangıç ve bitiş tarihlerini girin');
      return;
    }

    if (endDate <= startDate) {
      alert('Bitiş tarihi başlangıç tarihinden sonra olmalıdır');
      return;
    }

    try {
      await publishSurvey.mutateAsync({
        surveyId,
        dates: {
          StartDate: startDate,
          EndDate: endDate,
        },
      });
      setPublishDialogOpen(false);
    } catch {

    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-600">Yükleniyor...</div>
      </div>
    );
  }

  if (error || !survey) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <p className="text-red-600">
              Anket yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.
            </p>
            <Button
              onClick={() => router.push('/admin/surveys')}
              variant="outline"
              className="mt-4"
            >
              Anketlere Geri Dön
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = getSurveyStatus(survey.startDate, survey.endDate);
  const isDraft = !survey.startDate && !survey.endDate;

  return (
    <div className="space-y-6">
      {}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-slate-800">{survey.title}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
              {status.label}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                survey.accessType === 'Internal'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-orange-100 text-orange-700'
              }`}
            >
              {survey.accessType === 'Internal' ? 'Dahili' : 'Halka Açık'}
            </span>
          </div>
          <p className="text-slate-600">{survey.description}</p>

          {}
          {survey.attachment && (
            <div className="mt-4">
              <AttachmentViewer
                attachment={survey.attachment}
                apiUrl={API_URL}
                maxHeight="300px"
              />
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/surveys/${surveyId}/edit`)}>
            {isDraft ? 'Düzenle' : 'Metinleri Düzenle'}
          </Button>
          <Button variant="outline" onClick={() => router.push('/surveys')}>
            Geri
          </Button>
          {isDraft && (
            <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
              <DialogTrigger asChild>
                <Button style={{ backgroundColor: '#0055a5' }}>Anketi Yayınla</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Anketi Yayınla</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="startDate">Başlangıç Tarihi ve Saati *</Label>
                    <DateTimePicker
                      id="startDate"
                      selected={startDate}
                      onChange={(date) => setStartDate(date)}
                      placeholderText="Başlangıç tarihini seçin"
                      minDate={new Date()}
                    />
                    <p className="text-xs text-slate-500 mt-1">Format: GG.AA.YYYY SS:DD (24 saat formatı)</p>
                  </div>
                  <div>
                    <Label htmlFor="endDate">Bitiş Tarihi ve Saati *</Label>
                    <DateTimePicker
                      id="endDate"
                      selected={endDate}
                      onChange={(date) => setEndDate(date)}
                      placeholderText="Bitiş tarihini seçin"
                      minDate={startDate || new Date()}
                    />
                    <p className="text-xs text-slate-500 mt-1">Format: GG.AA.YYYY SS:DD (24 saat formatı)</p>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setPublishDialogOpen(false)}
                    >
                      İptal
                    </Button>
                    <Button
                      onClick={handlePublish}
                      disabled={publishSurvey.isPending}
                      style={{ backgroundColor: '#0055a5' }}
                    >
                      {publishSurvey.isPending ? 'Yayınlanıyor...' : 'Yayınla'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {}
      <Card>
        <CardHeader>
          <CardTitle>Anket Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm font-medium text-slate-600 mb-1">Soru Sayısı</p>
              <p className="text-2xl font-bold text-slate-800">{survey.questions.length}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm font-medium text-slate-600 mb-1">Başlangıç Tarihi</p>
              <p className="text-sm text-slate-800">{formatDate(survey.startDate)}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm font-medium text-slate-600 mb-1">Bitiş Tarihi</p>
              <p className="text-sm text-slate-800">{formatDate(survey.endDate)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Sorular</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {survey.questions.map((question, index) => (
              <Card key={question.id} className="border-slate-200">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-medium text-sm">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-slate-800">{question.text}</h3>
                        <div className="flex gap-2">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              question.isRequired
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {question.isRequired ? 'Zorunlu' : 'İsteğe Bağlı'}
                          </span>
                          <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-700">
                            {getQuestionTypeLabel(question.type)}
                          </span>
                        </div>
                      </div>

                      {}
                      {question.attachment && (
                        <div className="mt-3">
                          <AttachmentViewer
                            attachment={question.attachment}
                            apiUrl={API_URL}
                            maxHeight="300px"
                          />
                        </div>
                      )}

                      {question.options && question.options.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {question.options.map((option) => (
                            <div key={option.id} className="pl-4">
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
                                {option.text}{' '}
                                <span className="text-xs text-slate-400">({option.value})</span>
                              </div>
                              {}
                              {option.attachment && (
                                <div className="mt-2 ml-4">
                                  <AttachmentViewer
                                    attachment={option.attachment}
                                    apiUrl={API_URL}
                                    maxHeight="150px"
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
