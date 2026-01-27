'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSurveyBySlug } from '@/src/features/survey/hooks';
import { useStartParticipation, useSubmitAnswer, useCompleteParticipation, useParticipationStatus } from '@/src/features/participation/hooks';
import { useAuth } from '@/src/features/auth/context/AuthContext';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Label } from '@/src/components/ui/label';
import { Input } from '@/src/components/ui/input';
import { Textarea } from '@/src/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/src/components/ui/radio-group';
import { Checkbox } from '@/src/components/ui/checkbox';
import type { QuestionDto } from '@/src/types';
import { AttachmentViewer } from '@/src/components/AttachmentViewer';

const MAX_TEXT_ANSWER_LENGTH = 2000;

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5123/api';

const getAttachmentUrl = (attachmentId: number) => {
  return `${API_URL}/Attachments/${attachmentId}`;
};

export default function ParticipatePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: survey, isLoading, error } = useSurveyBySlug(slug);
  const { data: participationStatus, isLoading: statusLoading } = useParticipationStatus(slug);
  const startParticipation = useStartParticipation();
  const submitAnswer = useSubmitAnswer();
  const completeParticipation = useCompleteParticipation();

  const [participationId, setParticipationId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);

  const handleStart = async () => {
    try {
      const participationIdResult = await startParticipation.mutateAsync(slug);
      setParticipationId(participationIdResult);
    } catch (error) {
      alert('Ankete başlanırken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const handleAnswerChange = (questionId: number, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleNext = async () => {
    if (!participationId || !survey) return;

    const currentQuestion = survey.questions[currentQuestionIndex];
    const answer = answers[currentQuestion.id];

    // Check if answer is provided for required questions
    if (currentQuestion.isRequired && !answer) {
      alert('Bu soru zorunludur. Lütfen cevap verin.');
      return;
    }

    // FileUpload validation - only required if question is mandatory
    if (currentQuestion.type === 'FileUpload' && currentQuestion.isRequired && !answer) {
      alert('Lütfen bir dosya yükleyin.');
      return;
    }

    // Matrix question validation
    if (currentQuestion.type === 'Matrix') {
      const matrixAnswer = answer || {};
      const answeredOptions = Object.keys(matrixAnswer).filter(
        (optId) => matrixAnswer[optId]?.scaleValue
      );

      if (currentQuestion.isRequired && answeredOptions.length !== currentQuestion.options.length) {
        alert('Lütfen tüm maddeleri değerlendirin.');
        return;
      }

      // Check for required explanations when score is 1-2 (only for answered options)
      if (currentQuestion.matrixShowExplanation && answeredOptions.length > 0) {
        for (const option of currentQuestion.options) {
          const optAnswer = matrixAnswer[option.id];
          if (optAnswer?.scaleValue && optAnswer.scaleValue <= 2 && !optAnswer.explanation?.trim()) {
            alert(`"${option.text}" maddesi için açıklama gereklidir.`);
            return;
          }
        }
      }
    }

    if (currentQuestion.type === 'Conditional' && answer) {
      const selectedOption = currentQuestion.options.find(opt => opt.id === answer);
      if (selectedOption && selectedOption.childQuestions) {
        for (const childQuestion of selectedOption.childQuestions) {
          const childAnswer = answers[childQuestion.id];
          if (childQuestion.isRequired && !childAnswer) {
            alert(`Zorunlu soru cevaplanmadı: ${childQuestion.text}`);
            return;
          }
        }
      }
    }

    // Determine if the user actually provided an answer
    const hasAnswer = (() => {
      if (!answer) return false;
      if (currentQuestion.type === 'OpenText') return typeof answer === 'string' && answer.trim().length > 0;
      if (currentQuestion.type === 'SingleSelect' || currentQuestion.type === 'Conditional') return !!answer;
      if (currentQuestion.type === 'MultiSelect') return Array.isArray(answer) && answer.length > 0;
      if (currentQuestion.type === 'FileUpload') return !!answer?.base64Content;
      if (currentQuestion.type === 'Matrix') {
        const entries = Object.entries(answer || {});
        return entries.some(([_, data]: [string, any]) => data?.scaleValue);
      }
      return false;
    })();

    // If no answer and question is not required, skip to next question without submitting
    if (!hasAnswer && !currentQuestion.isRequired) {
      if (currentQuestionIndex < survey.questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        await handleComplete();
      }
      return;
    }

    let textValue = null;
    let optionIds: number[] = [];
    let attachment = null;
    let matrixAnswers = null;

    if (currentQuestion.type === 'OpenText') {
      textValue = answer || null;
    } else if (currentQuestion.type === 'SingleSelect' || currentQuestion.type === 'Conditional') {
      optionIds = answer ? [answer] : [];
    } else if (currentQuestion.type === 'MultiSelect') {
      optionIds = answer || [];
    } else if (currentQuestion.type === 'FileUpload') {
      attachment = answer ? {
        fileName: answer.fileName,
        contentType: answer.contentType,
        base64Content: answer.base64Content,
      } : null;
    } else if (currentQuestion.type === 'Matrix') {
      // Convert matrix answer object to array format for API
      matrixAnswers = Object.entries(answer || {})
        .filter(([_, data]: [string, any]) => data?.scaleValue) // Only include answered items
        .map(([optionId, data]: [string, any]) => ({
          optionId: parseInt(optionId),
          scaleValue: data.scaleValue,
          explanation: data.explanation || null,
        }));
    }

    try {
      console.log('Submitting answer:', {
        questionType: currentQuestion.type,
        hasAttachment: !!attachment,
        hasMatrixAnswers: !!matrixAnswers,
        attachment: attachment ? {
          fileName: attachment.fileName,
          contentType: attachment.contentType,
          base64Length: attachment.base64Content?.length
        } : null
      });

      await submitAnswer.mutateAsync({
        participationId,
        answer: {
          questionId: currentQuestion.id,
          textValue,
          optionIds,
          attachment,
          matrixAnswers,
        },
      });

      if (currentQuestion.type === 'Conditional' && answer) {
        const selectedOption = currentQuestion.options.find(opt => opt.id === answer);
        if (selectedOption && selectedOption.childQuestions) {
          for (const childQuestion of selectedOption.childQuestions) {
            const childAnswer = answers[childQuestion.id];
            if (childAnswer) {
              let childTextValue = null;
              let childOptionIds: number[] = [];
              let childAttachment = null;

              if (childQuestion.type === 'OpenText') {
                childTextValue = childAnswer;
              } else if (childQuestion.type === 'SingleSelect') {
                childOptionIds = [childAnswer];
              } else if (childQuestion.type === 'MultiSelect') {
                childOptionIds = childAnswer;
              } else if (childQuestion.type === 'FileUpload') {
                childAttachment = {
                  fileName: childAnswer.fileName,
                  contentType: childAnswer.contentType,
                  base64Content: childAnswer.base64Content,
                };
              }

              await submitAnswer.mutateAsync({
                participationId,
                answer: {
                  questionId: childQuestion.id,
                  textValue: childTextValue,
                  optionIds: childOptionIds,
                  attachment: childAttachment,
                },
              });
            }
          }
        }
      }

      if (currentQuestionIndex < survey.questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {

        await handleComplete();
      }
    } catch (error) {
      alert('Cevap gönderilirken bir hata oluştu.');
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleComplete = async () => {
    if (!participationId) return;

    setIsSubmitting(true);
    try {
      await completeParticipation.mutateAsync(participationId);
      setIsCompleted(true);
    } catch (error) {
      alert('Anket tamamlanırken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Exit warning - prevent accidental survey abandonment
  useEffect(() => {
    if (!participationId || isCompleted) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [participationId, isCompleted]);

  if (isLoading || authLoading || statusLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Yükleniyor...</div>
      </div>
    );
  }

  if (error || !survey) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-red-600">Anket bulunamadı veya yüklenemedi.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (survey.accessType === 'Internal' && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Giriş Gerekli</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
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
              <p className="text-slate-700">
                Bu anket yalnızca dahili kullanıcılar için erişilebilir.
              </p>
              <p className="text-slate-600 text-sm">
                Lütfen devam etmek için giriş yapın.
              </p>
              <Button
                onClick={() => router.push(`/login?returnUrl=/p/${slug}`)}
                style={{ backgroundColor: '#0055a5' }}
                className="w-full hover:opacity-90"
              >
                Giriş Yap
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <CardTitle className="text-center text-2xl text-green-600">Teşekkürler!</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <p className="text-slate-700 whitespace-pre-wrap">
                {survey.outroText || 'Anket katılımınız başarıyla tamamlandı.\n\nKatkılarınız için teşekkür ederiz.'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!participationId) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <CardTitle className="text-3xl text-slate-800">{survey.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {}
            {survey.introText && (
              <div className="bg-slate-100 border border-slate-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{survey.introText}</p>
              </div>
            )}

            {}
            <p className="text-slate-700 whitespace-pre-wrap">{survey.description}</p>

            {}
            {survey.attachment && (
              <div className="pt-4">
                <AttachmentViewer
                  attachment={survey.attachment}
                  apiUrl={API_URL}
                  maxHeight="300px"
                />
              </div>
            )}

            {}
            {participationStatus?.isCompleted && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-green-800 mb-1">Bu anketi zaten tamamladınız</h3>
                    <p className="text-sm text-green-700">
                      {participationStatus.completedAt && (
                        <>Tamamlanma tarihi: {new Date(participationStatus.completedAt).toLocaleDateString('tr-TR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</>
                      )}
                    </p>
                    <p className="text-sm text-green-700 mt-1">
                      Ankete tekrar katılamazsınız. Katkılarınız için teşekkür ederiz.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {}
            <div className="pt-4 space-y-2 text-sm text-slate-600">
              <p>• Toplam {survey.questions.length} soru</p>
              <p>• Tahmini süre: {Math.ceil(survey.questions.length * 0.5)} dakika</p>
            </div>

            {}
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">📋 Önemli Bilgiler:</h4>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>✓ Yanıtlarınız her soruda otomatik olarak kaydedilir</li>
                <li>✓ Anketi tamamlamak için son soruya kadar ilerleyip <strong>"Tamamla"</strong> butonuna basmanız gerekir</li>
                <li>✓ İstediğiniz zaman önceki sorulara geri dönebilirsiniz</li>
                <li>✓ Tarayıcıyı kapatırsanız, kaldığınız yerden devam edebilirsiniz</li>
              </ul>
            </div>

            {}
            {survey.consentText && (
              <div className="flex items-start space-x-3 border-t border-slate-200 pt-4 mt-4">
                <Checkbox
                  id="consent"
                  checked={consentGiven}
                  onCheckedChange={(checked) => setConsentGiven(checked as boolean)}
                  className="mt-1"
                />
                <Label htmlFor="consent" className="text-sm text-slate-700 cursor-pointer leading-relaxed">
                  {survey.consentText}
                </Label>
              </div>
            )}

            {}
            <div className="pt-6">
              <Button
                onClick={handleStart}
                disabled={
                  participationStatus?.isCompleted ||
                  startParticipation.isPending ||
                  !!(survey.consentText && !consentGiven)
                }
                style={{ backgroundColor: '#0055a5' }}
                className="w-full"
              >
                {participationStatus?.isCompleted
                  ? 'Anket Tamamlandı'
                  : startParticipation.isPending
                  ? 'Başlatılıyor...'
                  : 'Ankete Başla'}
              </Button>
              {survey.consentText && !consentGiven && !participationStatus?.isCompleted && (
                <p className="text-sm text-red-600 mt-2 text-center">
                  Devam etmek için lütfen onay kutusunu işaretleyin.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = survey.questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestion.id];
  const progress = ((currentQuestionIndex + 1) / survey.questions.length) * 100;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-slate-600 mb-2">
            <span>Soru {currentQuestionIndex + 1} / {survey.questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-900">
              ℹ️ <strong>Önemli:</strong> Yanıtlarınız her soruda otomatik olarak kaydediliyor.
              Anketi tamamlamak için tüm soruları cevaplayıp son sayfada <strong>"Tamamla"</strong> butonuna basmanız gerekir.
            </p>
          </div>
        </div>

        {}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="text-xl text-slate-800">
                {currentQuestion.text}
                {currentQuestion.isRequired && <span className="text-red-500 ml-1">*</span>}
              </CardTitle>
            </div>
            {currentQuestion.description && (
              <p className="text-sm text-slate-600 mt-2">{currentQuestion.description}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {}
            {currentQuestion.attachment && (
              <div className="mb-4">
                <AttachmentViewer
                  attachment={currentQuestion.attachment}
                  apiUrl={API_URL}
                  maxHeight="400px"
                />
              </div>
            )}
            {}
            {currentQuestion.type === 'SingleSelect' && (
              <RadioGroup value={currentAnswer?.toString()} onValueChange={(value) => handleAnswerChange(currentQuestion.id, parseInt(value))}>
                {currentQuestion.options.map((option) => (
                  <div key={option.id} className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={option.id.toString()} id={option.id.toString()} />
                      <Label htmlFor={option.id.toString()} className="cursor-pointer">
                        {option.text}
                      </Label>
                    </div>
                    {option.attachment && (
                      <div className="ml-6">
                        <AttachmentViewer
                          attachment={option.attachment}
                          apiUrl={API_URL}
                          maxHeight="200px"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </RadioGroup>
            )}

            {}
            {currentQuestion.type === 'MultiSelect' && (
              <div className="space-y-3">
                {currentQuestion.options.map((option) => (
                  <div key={option.id} className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={option.id.toString()}
                        checked={currentAnswer?.includes(option.id) || false}
                        onCheckedChange={(checked) => {
                          const newValue = currentAnswer ? [...currentAnswer] : [];
                          if (checked) {
                            newValue.push(option.id);
                          } else {
                            const index = newValue.indexOf(option.id);
                            if (index > -1) newValue.splice(index, 1);
                          }
                          handleAnswerChange(currentQuestion.id, newValue);
                        }}
                      />
                      <Label htmlFor={option.id.toString()} className="cursor-pointer">
                        {option.text}
                      </Label>
                    </div>
                    {option.attachment && (
                      <div className="ml-6">
                        <AttachmentViewer
                          attachment={option.attachment}
                          apiUrl={API_URL}
                          maxHeight="200px"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {}
            {currentQuestion.type === 'OpenText' && (
              <div className="space-y-2">
                <Textarea
                  value={currentAnswer || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= MAX_TEXT_ANSWER_LENGTH) {
                      handleAnswerChange(currentQuestion.id, value);
                    }
                  }}
                  placeholder="Cevabınızı buraya yazın..."
                  rows={5}
                  maxLength={MAX_TEXT_ANSWER_LENGTH}
                />
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">
                    Maksimum {MAX_TEXT_ANSWER_LENGTH} karakter
                  </span>
                  <span className={`${
                    (currentAnswer?.length || 0) > MAX_TEXT_ANSWER_LENGTH * 0.9
                      ? 'text-orange-600 font-medium'
                      : 'text-slate-600'
                  }`}>
                    {currentAnswer?.length || 0} / {MAX_TEXT_ANSWER_LENGTH}
                  </span>
                </div>
              </div>
            )}

            {}
            {currentQuestion.type === 'Conditional' && (
              <div className="space-y-4">
                {}
                <RadioGroup value={currentAnswer?.toString()} onValueChange={(value) => handleAnswerChange(currentQuestion.id, parseInt(value))}>
                  {currentQuestion.options.map((option) => (
                    <div key={option.id} className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value={option.id.toString()} id={option.id.toString()} />
                        <Label htmlFor={option.id.toString()} className="cursor-pointer font-medium">
                          {option.text}
                        </Label>
                      </div>
                      {}
                      {option.attachment && (
                        <div className="ml-6">
                          <AttachmentViewer
                            attachment={option.attachment}
                            apiUrl={API_URL}
                            maxHeight="200px"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </RadioGroup>

                {}
                {currentAnswer && currentQuestion.options.map((option) => {
                  if (option.id !== currentAnswer) return null;
                  if (!option.childQuestions || option.childQuestions.length === 0) return null;

                  return (
                    <div key={option.id} className="mt-6 space-y-6 pl-6 border-l-4 border-blue-300">
                      {option.childQuestions.map((childQuestion) => (
                        <Card key={childQuestion.id} className="border-slate-200 bg-slate-50">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base text-slate-800">
                              {childQuestion.text}
                              {childQuestion.isRequired && <span className="text-red-500 ml-1">*</span>}
                            </CardTitle>
                            {childQuestion.description && (
                              <p className="text-sm text-slate-600 mt-1">{childQuestion.description}</p>
                            )}
                          </CardHeader>
                          <CardContent>
                            {}
                            {childQuestion.attachment && (
                              <div className="mb-4">
                                <AttachmentViewer
                                  attachment={childQuestion.attachment}
                                  apiUrl={API_URL}
                                  maxHeight="300px"
                                />
                              </div>
                            )}

                            {}
                            {childQuestion.type === 'SingleSelect' && (
                              <RadioGroup
                                value={answers[childQuestion.id]?.toString()}
                                onValueChange={(value) => handleAnswerChange(childQuestion.id, parseInt(value))}
                              >
                                {childQuestion.options.map((childOption) => (
                                  <div key={childOption.id} className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value={childOption.id.toString()} id={childOption.id.toString()} />
                                      <Label htmlFor={childOption.id.toString()} className="cursor-pointer">
                                        {childOption.text}
                                      </Label>
                                    </div>
                                    {}
                                    {childOption.attachment && (
                                      <div className="ml-6">
                                        <AttachmentViewer
                                          attachment={childOption.attachment}
                                          apiUrl={API_URL}
                                          maxHeight="200px"
                                        />
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </RadioGroup>
                            )}

                            {}
                            {childQuestion.type === 'MultiSelect' && (
                              <div className="space-y-3">
                                {childQuestion.options.map((childOption) => (
                                  <div key={childOption.id} className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                      <Checkbox
                                        id={childOption.id.toString()}
                                        checked={answers[childQuestion.id]?.includes(childOption.id) || false}
                                        onCheckedChange={(checked) => {
                                          const newValue = answers[childQuestion.id] ? [...answers[childQuestion.id]] : [];
                                          if (checked) {
                                            newValue.push(childOption.id);
                                          } else {
                                            const index = newValue.indexOf(childOption.id);
                                            if (index > -1) newValue.splice(index, 1);
                                          }
                                          handleAnswerChange(childQuestion.id, newValue);
                                        }}
                                      />
                                      <Label htmlFor={childOption.id.toString()} className="cursor-pointer">
                                        {childOption.text}
                                      </Label>
                                    </div>
                                    {}
                                    {childOption.attachment && (
                                      <div className="ml-6">
                                        <AttachmentViewer
                                          attachment={childOption.attachment}
                                          apiUrl={API_URL}
                                          maxHeight="200px"
                                        />
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                            {}
                            {childQuestion.type === 'OpenText' && (
                              <div className="space-y-2">
                                <Textarea
                                  value={answers[childQuestion.id] || ''}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    if (value.length <= MAX_TEXT_ANSWER_LENGTH) {
                                      handleAnswerChange(childQuestion.id, value);
                                    }
                                  }}
                                  placeholder="Cevabınızı buraya yazın..."
                                  rows={4}
                                  maxLength={MAX_TEXT_ANSWER_LENGTH}
                                />
                                <div className="flex justify-end text-sm text-slate-600">
                                  <span>{answers[childQuestion.id]?.length || 0} / {MAX_TEXT_ANSWER_LENGTH}</span>
                                </div>
                              </div>
                            )}

                            {}
                            {childQuestion.type === 'FileUpload' && (
                              <div className="space-y-3">
                                {childQuestion.allowedAttachmentContentTypes && childQuestion.allowedAttachmentContentTypes.length > 0 && (
                                  <div className="text-sm text-slate-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <span className="font-medium">İzin verilen dosya türleri:</span>
                                    <div className="mt-1">
                                      {childQuestion.allowedAttachmentContentTypes.map((type: string, idx: number) => (
                                        <span key={type} className="text-xs">
                                          {type.split('/')[1].toUpperCase()}
                                          {idx < childQuestion.allowedAttachmentContentTypes!.length - 1 && ', '}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center bg-slate-50">
                                  <input
                                    type="file"
                                    id={`file-upload-child-${childQuestion.id}`}
                                    accept={childQuestion.allowedAttachmentContentTypes?.join(',')}
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        if (file.size > 5 * 1024 * 1024) {
                                          alert('Dosya boyutu 5MB\'dan büyük olamaz.');
                                          e.target.value = '';
                                          return;
                                        }
                                        try {
                                          const reader = new FileReader();
                                          reader.onload = () => {
                                            const base64 = (reader.result as string).split(',')[1];
                                            handleAnswerChange(childQuestion.id, {
                                              fileName: file.name,
                                              contentType: file.type,
                                              base64Content: base64,
                                            });
                                          };
                                          reader.onerror = () => {
                                            alert('Dosya okunurken bir hata oluştu. Lütfen tekrar deneyin.');
                                            e.target.value = '';
                                          };
                                          reader.readAsDataURL(file);
                                        } catch {
                                          alert('Dosya işlenirken bir hata oluştu. Lütfen tekrar deneyin.');
                                          e.target.value = '';
                                        }
                                      }
                                    }}
                                    className="hidden"
                                  />
                                  <label
                                    htmlFor={`file-upload-child-${childQuestion.id}`}
                                    className="cursor-pointer"
                                  >
                                    <div className="flex flex-col items-center">
                                      <svg
                                        className="w-10 h-10 text-slate-400 mb-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                        />
                                      </svg>
                                      {answers[childQuestion.id] ? (
                                        <div className="space-y-1">
                                          <p className="text-sm font-medium text-green-600">
                                            Dosya yüklendi
                                          </p>
                                          <p className="text-xs text-slate-600">
                                            {answers[childQuestion.id].fileName}
                                          </p>
                                          <p className="text-xs text-blue-600 hover:text-blue-700">
                                            Farklı bir dosya seçmek için tıklayın
                                          </p>
                                        </div>
                                      ) : (
                                        <div className="space-y-1">
                                          <p className="text-sm font-medium text-slate-700">
                                            Dosya seçmek için tıklayın
                                          </p>
                                          <p className="text-xs text-slate-500">
                                            Maksimum dosya boyutu: 5 MB
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </label>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}

            {}
            {currentQuestion.type === 'FileUpload' && (
              <div className="space-y-3">
                {currentQuestion.allowedAttachmentContentTypes && currentQuestion.allowedAttachmentContentTypes.length > 0 && (
                  <div className="text-sm text-slate-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <span className="font-medium">İzin verilen dosya türleri:</span>
                    <div className="mt-1">
                      {currentQuestion.allowedAttachmentContentTypes.map((type, idx) => (
                        <span key={type} className="text-xs">
                          {type.split('/')[1].toUpperCase()}
                          {idx < currentQuestion.allowedAttachmentContentTypes!.length - 1 && ', '}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center bg-slate-50">
                  <input
                    type="file"
                    id={`file-upload-${currentQuestion.id}`}
                    accept={currentQuestion.allowedAttachmentContentTypes?.join(',')}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {

                        if (file.size > 5 * 1024 * 1024) {
                          alert('Dosya boyutu 5MB\'dan büyük olamaz.');
                          e.target.value = '';
                          return;
                        }

                        try {
                          const reader = new FileReader();
                          reader.onload = () => {
                            const base64 = (reader.result as string).split(',')[1];
                            handleAnswerChange(currentQuestion.id, {
                              fileName: file.name,
                              contentType: file.type,
                              base64Content: base64,
                            });
                          };
                          reader.onerror = () => {
                            alert('Dosya okunurken bir hata oluştu. Lütfen tekrar deneyin.');
                            e.target.value = '';
                          };
                          reader.readAsDataURL(file);
                        } catch (error) {
                          alert('Dosya işlenirken bir hata oluştu. Lütfen tekrar deneyin.');
                          e.target.value = '';
                        }
                      }
                    }}
                    className="hidden"
                  />
                  <label
                    htmlFor={`file-upload-${currentQuestion.id}`}
                    className="cursor-pointer"
                  >
                    <div className="flex flex-col items-center">
                      <svg
                        className="w-12 h-12 text-slate-400 mb-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      {answers[currentQuestion.id] ? (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-green-600">
                            ✓ Dosya yüklendi
                          </p>
                          <p className="text-xs text-slate-600">
                            {answers[currentQuestion.id].fileName}
                          </p>
                          <p className="text-xs text-blue-600 hover:text-blue-700">
                            Farklı bir dosya seçmek için tıklayın
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-slate-700">
                            Dosya seçmek için tıklayın
                          </p>
                          <p className="text-xs text-slate-500">
                            Maksimum dosya boyutu: 5 MB
                          </p>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Matrix Question Type */}
            {currentQuestion.type === 'Matrix' && (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse table-fixed">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="border p-3 text-left w-[180px]"></th>
                        {(currentQuestion.matrixScaleLabels || []).map((label, i) => (
                          <th key={i} className="border p-2 text-center w-[70px] text-xs font-medium">
                            {label}
                          </th>
                        ))}
                        {currentQuestion.matrixShowExplanation && (
                          <th className="border p-2 text-center min-w-[280px] text-xs font-medium">
                            {currentQuestion.matrixExplanationLabel || 'Açıklama'}
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {currentQuestion.options.map((option) => {
                        const matrixAnswer = currentAnswer?.[option.id] || {};
                        const selectedScale = matrixAnswer.scaleValue;
                        const showExplanation = currentQuestion.matrixShowExplanation && selectedScale && selectedScale <= 2;

                        return (
                          <tr key={option.id} className="hover:bg-slate-50">
                            <td className="border p-3 text-slate-700 font-medium">
                              {option.text}
                            </td>
                            {[1, 2, 3, 4, 5].map((scale) => (
                              <td key={scale} className="border p-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newAnswer = {
                                      ...(currentAnswer || {}),
                                      [option.id]: {
                                        ...matrixAnswer,
                                        scaleValue: scale,
                                        explanation: scale > 2 ? null : matrixAnswer.explanation
                                      }
                                    };
                                    handleAnswerChange(currentQuestion.id, newAnswer);
                                  }}
                                  className={`w-6 h-6 rounded-full border-2 transition-all ${
                                    selectedScale === scale
                                      ? 'bg-blue-600 border-blue-600'
                                      : 'border-slate-300 hover:border-blue-400'
                                  }`}
                                >
                                  {selectedScale === scale && (
                                    <svg className="w-4 h-4 text-white mx-auto" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </button>
                              </td>
                            ))}
                            {currentQuestion.matrixShowExplanation && (
                              <td className="border p-2 min-w-[280px]">
                                {showExplanation ? (
                                  <textarea
                                    value={matrixAnswer.explanation || ''}
                                    onChange={(e) => {
                                      const newAnswer = {
                                        ...(currentAnswer || {}),
                                        [option.id]: {
                                          ...matrixAnswer,
                                          explanation: e.target.value
                                        }
                                      };
                                      handleAnswerChange(currentQuestion.id, newAnswer);
                                    }}
                                    placeholder="Lütfen açıklayınız..."
                                    rows={2}
                                    className="w-full min-w-[250px] text-sm border rounded p-2 resize-none"
                                    maxLength={500}
                                  />
                                ) : (
                                  <div className="text-xs text-slate-400 text-center py-2">
                                    {selectedScale ? '-' : '(1-2 seçilirse)'}
                                  </div>
                                )}
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {}
            {currentQuestionIndex === survey.questions.length - 1 && (
              <div className="mb-4 p-4 bg-green-50 border-2 border-green-300 rounded-lg">
                <p className="text-green-900 font-semibold text-center">
                  ✨ Bu son soru! Anketi göndermek için aşağıdaki <strong>"Tamamla"</strong> butonuna tıklamayı unutmayın.
                </p>
              </div>
            )}

            {}
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
              >
                Önceki
              </Button>
              <Button
                onClick={handleNext}
                disabled={submitAnswer.isPending || isSubmitting}
                style={{
                  backgroundColor: currentQuestionIndex === survey.questions.length - 1 ? '#10b981' : '#0055a5',
                  fontSize: currentQuestionIndex === survey.questions.length - 1 ? '1.1rem' : '1rem',
                  fontWeight: currentQuestionIndex === survey.questions.length - 1 ? '700' : '500'
                }}
                className={currentQuestionIndex === survey.questions.length - 1 ? 'px-8 py-6' : ''}
              >
                {currentQuestionIndex === survey.questions.length - 1
                  ? isSubmitting
                    ? '✓ Gönderiliyor...'
                    : '✓ Tamamla'
                  : submitAnswer.isPending
                  ? 'Gönderiliyor...'
                  : 'Sonraki'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
