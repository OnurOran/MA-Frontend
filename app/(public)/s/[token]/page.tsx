'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTokenSurvey, useStartTokenParticipation } from '@/src/features/invitation/hooks';
import { useSubmitAnswer, useCompleteParticipation } from '@/src/features/participation/hooks';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Label } from '@/src/components/ui/label';
import { Textarea } from '@/src/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/src/components/ui/radio-group';
import { Checkbox } from '@/src/components/ui/checkbox';
import type { QuestionDto } from '@/src/types';
import { AttachmentViewer } from '@/src/components/AttachmentViewer';

const MAX_TEXT_ANSWER_LENGTH = 2000;
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5123/api';

export default function TokenSurveyPage() {
  const params = useParams();
  const token = params.token as string;

  const { data: survey, isLoading, error } = useTokenSurvey(token);
  const startParticipation = useStartTokenParticipation();
  const submitAnswer = useSubmitAnswer();
  const completeParticipation = useCompleteParticipation();

  const [participationId, setParticipationId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);

  // Check if already participated
  useEffect(() => {
    if (survey?.participationId && !participationId) {
      setParticipationId(survey.participationId.toString());
    }
    if (survey?.isCompleted) {
      setIsCompleted(true);
    }
  }, [survey, participationId]);

  const handleStart = async () => {
    try {
      const result = await startParticipation.mutateAsync(token);
      setParticipationId(result.toString());
    } catch {
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

    if (currentQuestion.isRequired && !answer) {
      alert('Bu soru zorunludur. Lütfen cevap verin.');
      return;
    }

    if (currentQuestion.type === 'Matrix') {
      const matrixAnswer = answer || {};
      const answeredOptions = Object.keys(matrixAnswer).filter(
        (optId) => matrixAnswer[optId]?.scaleValue
      );

      if (currentQuestion.isRequired && answeredOptions.length !== currentQuestion.options.length) {
        alert('Lütfen tüm maddeleri değerlendirin.');
        return;
      }

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
      matrixAnswers = Object.entries(answer || {})
        .filter(([_, data]: [string, any]) => data?.scaleValue)
        .map(([optionId, data]: [string, any]) => ({
          optionId: parseInt(optionId),
          scaleValue: data.scaleValue,
          explanation: data.explanation || null,
        }));
    }

    try {
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

      if (currentQuestionIndex < survey.questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        await handleComplete();
      }
    } catch {
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
    } catch {
      alert('Anket tamamlanırken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!participationId || isCompleted) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [participationId, isCompleted]);

  if (isLoading) {
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
            <p className="text-red-600">Geçersiz veya süresi dolmuş davetiye bağlantısı.</p>
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
                {survey.outroText || `Sayın ${survey.firstName} ${survey.lastName},\n\nAnket katılımınız başarıyla tamamlandı.\n\nKatkılarınız için teşekkür ederiz.`}
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
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-blue-800 font-medium">
                Sayın {survey.firstName} {survey.lastName}, bu ankete davet edildiniz.
              </p>
            </div>

            {survey.introText && (
              <div className="bg-slate-100 border border-slate-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{survey.introText}</p>
              </div>
            )}

            <p className="text-slate-700 whitespace-pre-wrap">{survey.description}</p>

            {survey.attachment && (
              <div className="pt-4">
                <AttachmentViewer
                  attachment={survey.attachment}
                  apiUrl={API_URL}
                  maxHeight="300px"
                />
              </div>
            )}

            {survey.hasParticipated && !survey.isCompleted && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                <p className="text-amber-800">
                  Daha önce bu ankete başlamıştınız. Kaldığınız yerden devam edebilirsiniz.
                </p>
              </div>
            )}

            <div className="pt-4 space-y-2 text-sm text-slate-600">
              <p>• Toplam {survey.questions.length} soru</p>
              <p>• Tahmini süre: {Math.ceil(survey.questions.length * 0.5)} dakika</p>
            </div>

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Önemli Bilgiler:</h4>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>✓ Yanıtlarınız her soruda otomatik olarak kaydedilir</li>
                <li>✓ Anketi tamamlamak için son soruya kadar ilerleyip "Tamamla" butonuna basmanız gerekir</li>
                <li>✓ İstediğiniz zaman önceki sorulara geri dönebilirsiniz</li>
              </ul>
            </div>

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

            <div className="pt-6">
              <Button
                onClick={handleStart}
                disabled={startParticipation.isPending || !!(survey.consentText && !consentGiven)}
                style={{ backgroundColor: '#0055a5' }}
                className="w-full"
              >
                {startParticipation.isPending
                  ? 'Başlatılıyor...'
                  : survey.hasParticipated
                  ? 'Devam Et'
                  : 'Ankete Başla'}
              </Button>
              {survey.consentText && !consentGiven && (
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
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-slate-800">
              {currentQuestion.text}
              {currentQuestion.isRequired && <span className="text-red-500 ml-1">*</span>}
            </CardTitle>
            {currentQuestion.description && (
              <p className="text-sm text-slate-600 mt-2">{currentQuestion.description}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {currentQuestion.attachment && (
              <div className="mb-4">
                <AttachmentViewer
                  attachment={currentQuestion.attachment}
                  apiUrl={API_URL}
                  maxHeight="400px"
                />
              </div>
            )}

            {currentQuestion.type === 'SingleSelect' && (
              <RadioGroup value={currentAnswer?.toString()} onValueChange={(value) => handleAnswerChange(currentQuestion.id, parseInt(value))}>
                {currentQuestion.options.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.id.toString()} id={option.id.toString()} />
                    <Label htmlFor={option.id.toString()} className="cursor-pointer">{option.text}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {currentQuestion.type === 'MultiSelect' && (
              <div className="space-y-3">
                {currentQuestion.options.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
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
                    <Label htmlFor={option.id.toString()} className="cursor-pointer">{option.text}</Label>
                  </div>
                ))}
              </div>
            )}

            {currentQuestion.type === 'OpenText' && (
              <div className="space-y-2">
                <Textarea
                  value={currentAnswer || ''}
                  onChange={(e) => {
                    if (e.target.value.length <= MAX_TEXT_ANSWER_LENGTH) {
                      handleAnswerChange(currentQuestion.id, e.target.value);
                    }
                  }}
                  placeholder="Cevabınızı buraya yazın..."
                  rows={5}
                  maxLength={MAX_TEXT_ANSWER_LENGTH}
                />
                <div className="flex justify-end text-sm text-slate-600">
                  <span>{currentAnswer?.length || 0} / {MAX_TEXT_ANSWER_LENGTH}</span>
                </div>
              </div>
            )}

            {currentQuestion.type === 'Matrix' && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="border p-3 text-left"></th>
                      {(currentQuestion.matrixScaleLabels || []).map((label, i) => (
                        <th key={i} className="border p-2 text-center text-xs font-medium">{label}</th>
                      ))}
                      {currentQuestion.matrixShowExplanation && (
                        <th className="border p-2 text-center text-xs font-medium">
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
                        <tr key={option.id}>
                          <td className="border p-3 font-medium">{option.text}</td>
                          {[1, 2, 3, 4, 5].map((scale) => (
                            <td key={scale} className="border p-2 text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  handleAnswerChange(currentQuestion.id, {
                                    ...(currentAnswer || {}),
                                    [option.id]: {
                                      ...matrixAnswer,
                                      scaleValue: scale,
                                      explanation: scale > 2 ? null : matrixAnswer.explanation
                                    }
                                  });
                                }}
                                className={`w-6 h-6 rounded-full border-2 transition-all ${
                                  selectedScale === scale
                                    ? 'bg-blue-600 border-blue-600'
                                    : 'border-slate-300 hover:border-blue-400'
                                }`}
                              />
                            </td>
                          ))}
                          {currentQuestion.matrixShowExplanation && (
                            <td className="border p-2">
                              {showExplanation ? (
                                <textarea
                                  value={matrixAnswer.explanation || ''}
                                  onChange={(e) => {
                                    handleAnswerChange(currentQuestion.id, {
                                      ...(currentAnswer || {}),
                                      [option.id]: { ...matrixAnswer, explanation: e.target.value }
                                    });
                                  }}
                                  placeholder="Lütfen açıklayınız..."
                                  rows={2}
                                  className="w-full text-sm border rounded p-2 resize-none"
                                  maxLength={500}
                                />
                              ) : (
                                <div className="text-xs text-slate-400 text-center">
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
            )}

            {currentQuestionIndex === survey.questions.length - 1 && (
              <div className="mb-4 p-4 bg-green-50 border-2 border-green-300 rounded-lg">
                <p className="text-green-900 font-semibold text-center">
                  Bu son soru! Anketi göndermek için "Tamamla" butonuna tıklayın.
                </p>
              </div>
            )}

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
                }}
              >
                {currentQuestionIndex === survey.questions.length - 1
                  ? isSubmitting ? 'Gönderiliyor...' : 'Tamamla'
                  : submitAnswer.isPending ? 'Gönderiliyor...' : 'Sonraki'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
