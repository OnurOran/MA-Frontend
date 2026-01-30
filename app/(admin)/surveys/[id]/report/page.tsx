'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSurveyReport, useParticipantResponse } from '@/src/features/survey/hooks';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/src/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/src/components/ui/popover';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { apiClient } from '@/src/lib/api';
import type { QuestionReportDto, OptionResultDto, ParticipantResponseDto, MatrixRowResultDto } from '@/src/types';
import { Check, ChevronsUpDown, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/src/lib/utils';

const COLORS = ['#0055a5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const QUESTION_TYPE_LABELS: Record<string, string> = {
  SingleSelect: 'Tekli Seçim',
  MultiSelect: 'Çoklu Seçim',
  OpenText: 'Açık Metin',
  FileUpload: 'Dosya Yükleme',
  Conditional: 'Koşullu',
  Matrix: 'Matris',
};

function AuthenticatedImage({ attachmentId, fileName, className }: { attachmentId: number; fileName: string; className?: string }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await apiClient.get(`/attachments/answers/${attachmentId}`, {
          responseType: 'blob',
        });
        const url = URL.createObjectURL(response.data);
        setImageUrl(url);
      } catch (err) {
        console.error('Failed to load image:', err);
        setError(true);
      }
    };

    fetchImage();

    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [attachmentId]);

  if (error) return null;
  if (!imageUrl) return <div className="text-sm text-slate-500">Görsel yükleniyor...</div>;

  return <img src={imageUrl} alt={fileName} className={className} />;
}

function QuestionAttachmentImage({ attachmentId, fileName, className }: { attachmentId: number; fileName: string; className?: string }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await apiClient.get(`/attachments/${attachmentId}`, {
          responseType: 'blob',
        });
        const url = URL.createObjectURL(response.data);
        setImageUrl(url);
      } catch (err) {
        console.error('Failed to load question attachment:', err);
        setError(true);
      }
    };

    fetchImage();

    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [attachmentId]);

  if (error) return null;
  if (!imageUrl) return <div className="text-sm text-slate-500">Görsel yükleniyor...</div>;

  return <img src={imageUrl} alt={fileName} className={className} />;
}

export default function SurveyReportPage() {
  const params = useParams();
  const router = useRouter();
  const surveyId = parseInt(params?.id as string);

  const [includePartialResponses, setIncludePartialResponses] = useState(false);
  const { data: report, isLoading, error } = useSurveyReport(surveyId, includePartialResponses);
  const [selectedParticipantId, setSelectedParticipantId] = useState<number | null>(null);
  const [selectedParticipantName, setSelectedParticipantName] = useState<string>('');
  const { data: participantResponse } = useParticipantResponse(surveyId, selectedParticipantId || 0);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [comboboxOpen, setComboboxOpen] = useState(false);

  const handleParticipantSelect = (participationId: number | null, participantName?: string | null) => {
    if (!participationId) {
      setSelectedParticipantId(null);
      setSelectedParticipantName('');
      setComboboxOpen(false);
      return;
    }

    const fallbackName = participantName || 'İsimsiz';
    setSelectedParticipantId(participationId);
    setSelectedParticipantName(fallbackName);
    setComboboxOpen(false);
  };

  const handleFileDownload = async (attachmentId: number, fileName: string) => {
    try {
      const response = await apiClient.get(`/attachments/answers/${attachmentId}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      alert('Dosya indirilirken bir hata oluştu');
    }
  };

  const handleSurveyorFileDownload = async (attachmentId: number, fileName: string) => {
    try {
      const response = await apiClient.get(`/attachments/${attachmentId}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      alert('Dosya indirilirken bir hata oluştu');
    }
  };


  const handleExportExcel = async () => {
    if (!report) return;
    setExportingExcel(true);
    try {
      const response = await apiClient.get(`/surveys/${surveyId}/report/excel`, {
        params: { includePartial: includePartialResponses },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${report.title}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Excel export error:', err);
      alert('Excel dosyası oluşturulurken bir hata oluştu');
    } finally {
      setExportingExcel(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
          <p className="mt-4 text-sm text-slate-600">Rapor yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          Rapor yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.
        </div>
      </div>
    );
  }

  const isIndividualView = !!selectedParticipantId && !!participantResponse;

  return (
    <div className="min-h-screen bg-slate-50">
      {}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-6 py-4 w-full space-y-3">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              ← Geri Dön
            </Button>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">{report.title}</h1>
              <p className="text-slate-600 mt-1">{report.description}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                onClick={handleExportExcel}
                disabled={exportingExcel}
                variant="outline"
                className="border-green-600 text-green-700 hover:bg-green-50"
              >
                {exportingExcel ? 'Excel Oluşturuluyor...' : 'Excel İndir'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6 w-full">
        <div className="space-y-6">
          {}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4" data-pdf-block>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-500">Toplam Katılım</div>
                    <div className="text-2xl font-bold text-slate-900">{report.totalParticipations}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-500">Tamamlanan</div>
                    <div className="text-2xl font-bold text-green-600">{report.completedParticipations}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-500">Tamamlanma Oranı</div>
                    <div className="text-2xl font-bold text-blue-600">{report.completionRate.toFixed(1)}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-500">Soru Sayısı</div>
                    <div className="text-2xl font-bold text-purple-600">{report.questions.length}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Response Filter */}
          <Card className="bg-blue-50 border-blue-200" data-pdf-block>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Rapor Verileri</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    {includePartialResponses
                      ? `Tüm yanıtlar gösteriliyor (tamamlanmış + kısmi). Analiz edilen katılım: ${report.totalParticipations}`
                      : `Sadece tamamlanmış yanıtlar gösteriliyor. Analiz edilen katılım: ${report.completedParticipations}`
                    }
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includePartialResponses}
                      onChange={(e) => setIncludePartialResponses(e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-slate-700">Kısmi yanıtları dahil et</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {}
          {(report.introText || report.outroText || report.attachment) && (
            <Card className="bg-white" data-pdf-block>
              <CardHeader>
                <CardTitle>Anket Bilgileri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {report.introText && (
                  <div>
                    <div className="text-sm font-semibold text-slate-700 mb-1">Giriş Metni</div>
                    <div className="text-sm text-slate-600 whitespace-pre-wrap bg-slate-50 p-3 rounded">
                      {report.introText}
                    </div>
                  </div>
                )}
                {report.outroText && (
                  <div>
                    <div className="text-sm font-semibold text-slate-700 mb-1">Bitiş Metni</div>
                    <div className="text-sm text-slate-600 whitespace-pre-wrap bg-slate-50 p-3 rounded">
                      {report.outroText}
                    </div>
                  </div>
                )}
                {report.attachment && (
                  <div>
                    <div className="text-sm font-semibold text-slate-700 mb-2">📎 Anket Eki</div>
                    {report.attachment.contentType.startsWith('image/') ? (
                      <div className="space-y-2">
                        <QuestionAttachmentImage
                          attachmentId={report.attachment.id}
                          fileName={report.attachment.fileName}
                          className="max-w-md max-h-64 rounded border border-slate-300 object-contain"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSurveyorFileDownload(report.attachment!.id, report.attachment!.fileName)}
                        >
                          📎 İndir - {report.attachment.fileName}
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSurveyorFileDownload(report.attachment!.id, report.attachment!.fileName)}
                      >
                        📎 İndir - {report.attachment.fileName} ({(report.attachment.sizeBytes / 1024).toFixed(2)} KB)
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {}
          {report.accessType === 'Internal' && report.participants.length > 0 && (
            <Card className="bg-white" data-pdf-block>
              <CardHeader>
                <CardTitle>Katılımcı Seçimi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 items-center">
                  <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={comboboxOpen}
                        className="w-full md:w-96 justify-between bg-white"
                      >
                        {selectedParticipantName
                          ? `👤 ${selectedParticipantName}`
                          : '📊 Tüm Katılımcılar (Toplu Rapor)'}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full md:w-96 p-0 bg-white" align="start">
                      <Command className="bg-white">
                        <CommandInput placeholder="Katılımcı ara..." className="bg-white" />
                        <CommandList className="bg-white">
                          <CommandEmpty>Katılımcı bulunamadı.</CommandEmpty>
                          <CommandGroup className="bg-white">
                            <CommandItem
                              value="all"
                              onSelect={() => handleParticipantSelect(null)}
                              className="bg-white hover:bg-slate-100"
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  !selectedParticipantId ? 'opacity-100' : 'opacity-0'
                                )}
                              />
                              📊 Tüm Katılımcılar (Toplu Rapor)
                            </CommandItem>
                            {report.participants.map((participant) => (
                              <CommandItem
                                key={participant.participationId}
                                value={participant.participantName || 'İsimsiz'}
                                keywords={[participant.participationId.toString()]}
                                onSelect={() => handleParticipantSelect(participant.participationId, participant.participantName)}
                                className="bg-white hover:bg-slate-100"
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    selectedParticipantId === participant.participationId
                                      ? 'opacity-100'
                                      : 'opacity-0'
                                  )}
                                />
                                👤 {participant.participantName || 'İsimsiz'}{' '}
                                {participant.isCompleted ? '✓' : '⏳'}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {selectedParticipantId && (
                    <Button variant="outline" onClick={() => handleParticipantSelect(null)} className="bg-white">
                      Temizle
                    </Button>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {isIndividualView
                    ? 'Seçili katılımcının tüm yanıtlarını görüyorsunuz'
                    : 'Bireysel yanıtları görmek için bir katılımcı seçin veya arayın'}
                </p>
              </CardContent>
            </Card>
          )}

          {}
          {report.questions.map((question, index) => (
            <QuestionResultCard
              key={question.questionId}
              question={question}
              index={index}
              onFileDownload={handleFileDownload}
              onSurveyorFileDownload={handleSurveyorFileDownload}
              participantResponse={isIndividualView ? participantResponse : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function IndividualResponseView({
  response,
  onFileDownload
}: {
  response: ParticipantResponseDto;
  onFileDownload: (attachmentId: number, fileName: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Yanıtlar</CardTitle>
        <div className="text-sm text-slate-600">
          Başlangıç: {new Date(response.startedAt).toLocaleString('tr-TR')}
          {response.completedAt && ` | Tamamlanma: ${new Date(response.completedAt).toLocaleString('tr-TR')}`}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {response.answers.map((answer, idx) => (
            <div key={answer.questionId} className="p-4 bg-slate-50 rounded-md">
              <div className="font-semibold text-slate-900 mb-2">S{idx + 1}: {answer.questionText}</div>
              <div className="text-slate-700">
                {answer.textValue && (
                  <div className="whitespace-pre-wrap">{answer.textValue}</div>
                )}
                {answer.selectedOptions.length > 0 && (
                  <ul className="list-disc list-inside">
                    {answer.selectedOptions.map((opt, i) => (
                      <li key={i}>{opt}</li>
                    ))}
                  </ul>
                )}
                {answer.fileName && answer.answerId && (
                  <div className="mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onFileDownload(answer.answerId!, answer.fileName!)}
                    >
                      📎 {answer.fileName}
                    </Button>
                  </div>
                )}
                {!answer.textValue && answer.selectedOptions.length === 0 && !answer.fileName && (
                  <span className="text-slate-400 italic">Yanıt verilmedi</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function QuestionResultCard({
  question,
  index,
  onFileDownload,
  onSurveyorFileDownload,
  participantResponse,
}: {
  question: QuestionReportDto;
  index: number;
  onFileDownload: (attachmentId: number, fileName: string) => void;
  onSurveyorFileDownload: (attachmentId: number, fileName: string) => void;
  participantResponse?: ParticipantResponseDto;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [collapsed, setCollapsed] = useState(false);
  const selectedParticipantName = participantResponse?.participantName ?? undefined;

  const participantAnswer = participantResponse?.answers.find(a => a.questionId === question.questionId);

  const renderQuestionContent = () => {

    if (participantResponse) {
      return null;
    }

    switch (question.type) {
      case 'SingleSelect':
      case 'MultiSelect':
        return <BarChartView data={question.optionResults || []} type={question.type} onSurveyorFileDownload={onSurveyorFileDownload} />;

      case 'OpenText':
        return <OpenTextView
          responses={question.textResponses || []}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          selectedParticipantName={selectedParticipantName}
        />;

      case 'FileUpload':
        return <FileUploadView
          responses={question.fileResponses || []}
          onFileDownload={onFileDownload}
          selectedParticipantName={selectedParticipantName}
        />;

      case 'Conditional':
        return <ConditionalView question={question} onFileDownload={onFileDownload} onSurveyorFileDownload={onSurveyorFileDownload} />;

      case 'Matrix':
        return <MatrixView question={question} />;

      default:
        return <div className="text-sm text-slate-500">Desteklenmeyen soru tipi</div>;
    }
  };

  return (
    <Card data-pdf-block>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg">
              S{index + 1}: {question.text}
            </CardTitle>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                {QUESTION_TYPE_LABELS[question.type] || question.type}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                {question.totalResponses} yanıt
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                %{question.responseRate.toFixed(1)} oran
              </span>
              {question.isRequired && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">
                  Zorunlu
                </span>
              )}
            </div>
            {}
            {question.attachment && (
              <div className="mt-3 p-3 bg-blue-50 rounded-md border border-blue-200">
                <div className="text-xs font-medium text-blue-900 mb-2">📎 Soru Eki</div>
                {question.attachment.contentType.startsWith('image/') ? (
                  <div className="space-y-2">
                    <QuestionAttachmentImage
                      attachmentId={question.attachment.id}
                      fileName={question.attachment.fileName}
                      className="max-w-sm max-h-48 rounded border border-blue-300 object-contain"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSurveyorFileDownload(question.attachment!.id, question.attachment!.fileName)}
                    >
                      📎 İndir - {question.attachment.fileName}
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSurveyorFileDownload(question.attachment!.id, question.attachment!.fileName)}
                  >
                    📎 İndir - {question.attachment.fileName} ({(question.attachment.sizeBytes / 1024).toFixed(2)} KB)
                  </Button>
                )}
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(prev => !prev)}
            className="shrink-0"
          >
            {collapsed ? (
              <>
                <ChevronDown className="h-4 w-4 mr-1" /> Genişlet
              </>
            ) : (
              <>
                <ChevronUp className="h-4 w-4 mr-1" /> Daralt
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {collapsed ? (
          <div className="text-sm text-slate-400 italic text-center py-2">İçeriği görmek için genişletin</div>
        ) : (
          <>
            {renderQuestionContent()}

            {}
            {participantAnswer && (
              <div className="mt-6 pt-4 border-t-2 border-blue-200">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="text-sm font-bold text-blue-900">
                      👤 {participantResponse?.participantName || 'Seçili Katılımcı'} - Yanıt
                    </div>
                  </div>
                  <div className="text-sm text-slate-800">
                    {participantAnswer.textValue && (
                      <div className="whitespace-pre-wrap bg-white p-3 rounded border border-blue-100">
                        {participantAnswer.textValue}
                      </div>
                    )}
                    {participantAnswer.selectedOptions && participantAnswer.selectedOptions.length > 0 && (
                      <ul className="list-disc list-inside space-y-1 bg-white p-3 rounded border border-blue-100">
                        {participantAnswer.selectedOptions.map((opt, i) => (
                          <li key={i} className="text-slate-700">{opt}</li>
                        ))}
                      </ul>
                    )}
                    {participantAnswer.fileName && (
                      <div className="bg-white p-3 rounded border border-blue-100">
                        {participantAnswer.answerId ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onFileDownload(participantAnswer.answerId!, participantAnswer.fileName!)}
                            className="bg-blue-50 border-blue-200 hover:bg-blue-100"
                          >
                            📎 {participantAnswer.fileName}
                          </Button>
                        ) : (
                          <div className="text-sm text-slate-600">
                            📎 {participantAnswer.fileName}
                          </div>
                        )}
                      </div>
                    )}
                    {participantAnswer.matrixAnswers && participantAnswer.matrixAnswers.length > 0 && (
                      <div className="bg-white p-3 rounded border border-blue-100">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-1">Madde</th>
                              <th className="text-center py-1">Puan</th>
                              <th className="text-left py-1">Açıklama</th>
                            </tr>
                          </thead>
                          <tbody>
                            {participantAnswer.matrixAnswers.map((ma, idx) => (
                              <tr key={idx} className="border-b last:border-b-0">
                                <td className="py-2">{ma.rowText}</td>
                                <td className="text-center py-2 font-medium">{ma.scaleValue}</td>
                                <td className="py-2 text-slate-600">{ma.explanation || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {!participantAnswer.textValue &&
                     (!participantAnswer.selectedOptions || participantAnswer.selectedOptions.length === 0) &&
                     !participantAnswer.fileName &&
                     (!participantAnswer.matrixAnswers || participantAnswer.matrixAnswers.length === 0) && (
                      <span className="text-slate-500 italic">Yanıt verilmedi</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function BarChartView({ data, type, onSurveyorFileDownload }: { data: OptionResultDto[]; type: string; onSurveyorFileDownload: (attachmentId: number, fileName: string) => void }) {
  const chartData = data.map((opt) => ({
    name: opt.text.length > 30 ? opt.text.substring(0, 30) + '...' : opt.text,
    count: opt.selectionCount,
    percentage: opt.percentage,
  }));

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={Math.max(300, data.length * 60)}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="name" type="category" width={150} />
          <Tooltip formatter={(value: number, name: string) => [`${value} (${chartData.find(d => d.count === value)?.percentage.toFixed(1)}%)`, name === 'count' ? 'Seçim Sayısı' : name]} />
          <Legend />
          <Bar dataKey="count" fill="#0055a5" name="Seçim Sayısı">
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-1 gap-2">
        {data.map((opt, idx) => (
          <div key={opt.optionId} className="p-3 bg-slate-50 rounded-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="text-sm font-medium">{opt.text}</span>
              </div>
              <div className="text-sm text-slate-600">
                {opt.selectionCount} ({opt.percentage.toFixed(1)}%)
              </div>
            </div>
            {}
            {opt.attachment && (
              <div className="mt-2 ml-7 p-2 bg-white rounded border border-slate-200">
                <div className="text-xs text-slate-600 mb-1">📎 Seçenek Eki</div>
                {opt.attachment.contentType.startsWith('image/') ? (
                  <div className="space-y-2">
                    <QuestionAttachmentImage
                      attachmentId={opt.attachment.id}
                      fileName={opt.attachment.fileName}
                      className="max-w-xs max-h-32 rounded object-contain"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSurveyorFileDownload(opt.attachment!.id, opt.attachment!.fileName)}
                    >
                      📎 İndir - {opt.attachment.fileName}
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSurveyorFileDownload(opt.attachment!.id, opt.attachment!.fileName)}
                  >
                    📎 İndir - {opt.attachment.fileName} ({(opt.attachment.sizeBytes / 1024).toFixed(2)} KB)
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function OpenTextView({
  responses,
  currentPage,
  itemsPerPage,
  onPageChange,
  selectedParticipantName,
}: {
  responses: any[];
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  selectedParticipantName?: string;
}) {

  const filteredResponses = selectedParticipantName
    ? responses.filter(r => r.participantName === selectedParticipantName)
    : responses;

  const totalPages = Math.ceil(filteredResponses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedResponses = filteredResponses.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-4">
      <div className="text-sm text-slate-600">
        {selectedParticipantName ? `${filteredResponses.length} yanıt` : `Toplam ${filteredResponses.length} yanıt`}
      </div>

      {paginatedResponses.map((response, idx) => (
        <div key={response.participationId + idx} className="p-4 bg-slate-50 rounded-md">
          <div className="flex justify-between items-start mb-2">
            {response.participantName && <span className="text-xs font-medium text-slate-700">{response.participantName}</span>}
            <span className="text-xs text-slate-500">{new Date(response.submittedAt).toLocaleString('tr-TR')}</span>
          </div>
          <p className="text-sm text-slate-900 whitespace-pre-wrap">{response.textValue}</p>
        </div>
      ))}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
            Önceki
          </Button>
          <span className="text-sm text-slate-600">
            Sayfa {currentPage} / {totalPages}
          </span>
          <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
            Sonraki
          </Button>
        </div>
      )}
    </div>
  );
}

function FileUploadView({
  responses,
  onFileDownload,
  selectedParticipantName,
}: {
  responses: any[];
  onFileDownload: (attachmentId: number, fileName: string) => void;
  selectedParticipantName?: string;
}) {

  const filteredResponses = selectedParticipantName
    ? responses.filter(r => r.participantName === selectedParticipantName)
    : responses;

  return (
    <div className="space-y-2">
      <div className="text-sm text-slate-600 mb-3">
        {selectedParticipantName ? `${filteredResponses.length} dosya` : `Toplam ${filteredResponses.length} dosya`}
      </div>
      {filteredResponses.map((file) => {
        const isImage = file.contentType.startsWith('image/');
        return (
          <div key={file.answerId} className="p-3 bg-slate-50 rounded-md">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-900">{file.fileName}</div>
                <div className="text-xs text-slate-500 mt-1">
                  {file.participantName && `${file.participantName} - `}
                  {(file.sizeBytes / 1024).toFixed(2)} KB - {new Date(file.submittedAt).toLocaleString('tr-TR')}
                </div>
                {isImage && (
                  <div className="mt-2">
                    <AuthenticatedImage
                      attachmentId={file.attachmentId}
                      fileName={file.fileName}
                      className="max-w-md max-h-64 rounded border border-slate-200 object-contain"
                    />
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onFileDownload(file.attachmentId, file.fileName)}
              >
                İndir
              </Button>
            </div>
          </div>
        );
      })}
      {filteredResponses.length === 0 && <div className="text-sm text-slate-500">Dosya yüklenmemiş</div>}
    </div>
  );
}

function ConditionalView({
  question,
  onFileDownload,
  onSurveyorFileDownload
}: {
  question: QuestionReportDto;
  onFileDownload: (attachmentId: number, fileName: string) => void;
  onSurveyorFileDownload: (attachmentId: number, fileName: string) => void;
}) {
  return (
    <div className="space-y-6">
      {}
      <div>
        <h4 className="font-semibold text-slate-900 mb-3">Ana Soru Dağılımı</h4>
        <BarChartView data={question.optionResults || []} type="Conditional" onSurveyorFileDownload={onSurveyorFileDownload} />
      </div>

      {}
      {question.conditionalResults?.map((branch) => (
        <div key={branch.parentOptionId} className="border-l-4 border-blue-500 pl-4 ml-4">
          <h4 className="font-semibold text-slate-900 mb-2">
            "{branch.parentOptionText}" seçeneği için ({branch.participantCount} katılımcı)
          </h4>
          <div className="space-y-4">
            {branch.childQuestions.map((childQ, idx) => (
              <div key={childQ.questionId} className="bg-slate-50 p-4 rounded-md">
                <h5 className="font-medium text-sm text-slate-800 mb-2">
                  {idx + 1}. {childQ.text}
                </h5>
                {childQ.type === 'SingleSelect' || childQ.type === 'MultiSelect' ? (
                  <BarChartView data={childQ.optionResults || []} type={childQ.type} onSurveyorFileDownload={onSurveyorFileDownload} />
                ) : childQ.type === 'OpenText' ? (
                  <OpenTextView responses={childQ.textResponses || []} currentPage={1} itemsPerPage={5} onPageChange={() => {}} />
                ) : childQ.type === 'FileUpload' ? (
                  <FileUploadView responses={childQ.fileResponses || []} onFileDownload={onFileDownload} />
                ) : (
                  <div className="text-sm text-slate-500">Yanıt sayısı: {childQ.totalResponses}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function MatrixView({ question }: { question: QuestionReportDto }) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRow = (optionId: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(optionId)) {
      newExpanded.delete(optionId);
    } else {
      newExpanded.add(optionId);
    }
    setExpandedRows(newExpanded);
  };

  const scaleLabels = question.matrixScaleLabels || ['1', '2', '3', '4', '5'];
  const matrixResults = question.matrixResults || [];

  // Prepare chart data for overall averages
  const chartData = matrixResults.map((row) => ({
    name: row.text.length > 25 ? row.text.substring(0, 25) + '...' : row.text,
    fullName: row.text,
    average: row.averageScore,
    responses: row.totalResponses,
  }));

  return (
    <div className="space-y-6">
      {/* Average Scores Chart */}
      <div>
        <h4 className="font-semibold text-slate-900 mb-3">Ortalama Puanlar</h4>
        <ResponsiveContainer width="100%" height={Math.max(250, matrixResults.length * 50)}>
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} />
            <YAxis dataKey="name" type="category" width={180} />
            <Tooltip
              formatter={(value: number) => [value.toFixed(2), 'Ortalama']}
              labelFormatter={(label) => chartData.find(d => d.name === label)?.fullName || label}
            />
            <Bar dataKey="average" fill="#7c3aed" name="Ortalama Puan">
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={chartData[index].average >= 4 ? '#10b981' : chartData[index].average >= 3 ? '#f59e0b' : '#ef4444'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Results Table */}
      <div>
        <h4 className="font-semibold text-slate-900 mb-3">Detaylı Dağılım</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-200 p-2 text-left min-w-[200px]">Madde</th>
                {scaleLabels.map((label, i) => (
                  <th key={i} className="border border-slate-200 p-2 text-center min-w-[80px] text-xs">
                    {label}
                  </th>
                ))}
                <th className="border border-slate-200 p-2 text-center min-w-[80px]">Ort.</th>
                <th className="border border-slate-200 p-2 text-center min-w-[60px]">N</th>
              </tr>
            </thead>
            <tbody>
              {matrixResults.map((row) => {
                const isExpanded = expandedRows.has(row.optionId);
                const hasExplanations = row.explanations && row.explanations.length > 0;

                return (
                  <>
                    <tr key={row.optionId} className="hover:bg-slate-50">
                      <td className="border border-slate-200 p-2 font-medium">
                        <div className="flex items-center gap-2">
                          {hasExplanations && (
                            <button
                              onClick={() => toggleRow(row.optionId)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          )}
                          {row.text}
                        </div>
                      </td>
                      {row.scaleDistribution.map((count, i) => (
                        <td key={i} className="border border-slate-200 p-2 text-center">
                          <div className="flex flex-col items-center">
                            <span className="font-medium">{count}</span>
                            {row.totalResponses > 0 && (
                              <span className="text-xs text-slate-500">
                                ({((count / row.totalResponses) * 100).toFixed(0)}%)
                              </span>
                            )}
                          </div>
                        </td>
                      ))}
                      <td className="border border-slate-200 p-2 text-center font-bold">
                        <span className={
                          row.averageScore >= 4 ? 'text-green-600' :
                          row.averageScore >= 3 ? 'text-yellow-600' : 'text-red-600'
                        }>
                          {row.averageScore.toFixed(2)}
                        </span>
                      </td>
                      <td className="border border-slate-200 p-2 text-center text-slate-600">
                        {row.totalResponses}
                      </td>
                    </tr>
                    {isExpanded && hasExplanations && (
                      <tr key={`${row.optionId}-explanations`}>
                        <td colSpan={scaleLabels.length + 3} className="border border-slate-200 p-0">
                          <div className="bg-blue-50 p-3">
                            <div className="text-xs font-semibold text-blue-900 mb-2">
                              Açıklamalar ({row.explanations.length})
                            </div>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                              {row.explanations.map((exp, idx) => (
                                <div key={idx} className="bg-white p-2 rounded border border-blue-100 text-sm">
                                  <div className="flex justify-between items-start mb-1">
                                    <span className="font-medium text-slate-700">
                                      {exp.participantName || 'Anonim'} - Puan: {exp.scaleValue}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                      {new Date(exp.submittedAt).toLocaleDateString('tr-TR')}
                                    </span>
                                  </div>
                                  <p className="text-slate-600">{exp.explanation}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
