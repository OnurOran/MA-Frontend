'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/src/components/ui/button';
import { SurveyBasicInfo, QuestionList } from '@/src/features/survey/components/SurveyCreator';
import { SurveyFormData, QuestionFormData, getAllQuestionTypes } from '@/src/features/survey/question-types';
import { useCreateSurvey } from '@/src/features/survey/hooks';
import { CreateSurveyRequest, CreateQuestionDto } from '@/src/types';

export default function NewSurveyPage() {
  const router = useRouter();
  const createSurvey = useCreateSurvey();

  const [survey, setSurvey] = useState<SurveyFormData>({
    title: '',
    description: '',
    introText: '',
    consentText: '',
    outroText: '',
    accessType: 'Internal',
    attachment: null,
    questions: [],
  });

  const updateSurvey = (field: keyof SurveyFormData, value: any) => {
    setSurvey({ ...survey, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: string[] = [];

    if (!survey.title.trim()) {
      errors.push('Anket başlığı gereklidir');
    }

    if (!survey.description.trim()) {
      errors.push('Anket açıklaması gereklidir');
    }

    if (survey.questions.length === 0) {
      errors.push('En az bir soru eklenmelidir');
    }

    survey.questions.forEach((question, index) => {
      const questionTypes = getAllQuestionTypes();
      const questionType = questionTypes.find((qt) => qt.type === question.type);

      if (questionType) {
        const questionErrors = questionType.validateQuestion(question);
        questionErrors.forEach((err) => {
          errors.push(`Soru ${index + 1}: ${err.message}`);
        });
      }
    });

    if (errors.length > 0) {
      alert('Lütfen aşağıdaki hataları düzeltin:\n\n' + errors.join('\n'));
      return;
    }

    const request: CreateSurveyRequest = {
      title: survey.title,
      description: survey.description,
      introText: survey.introText || null,
      consentText: survey.consentText || null,
      outroText: survey.outroText || null,
      accessType: survey.accessType,
      questions: survey.questions.map((q) => ({
        text: q.text,
        type: q.type,
        order: q.order,
        isRequired: q.isRequired,
        options:
          q.type === 'OpenText' || q.type === 'FileUpload'
            ? null
            : q.options.map((opt) => ({
                text: opt.text,
                order: opt.order,
                value: opt.value || 0,
                attachment: opt.attachment || null,
              })),
        attachment: q.attachment || null,
        allowedAttachmentContentTypes: q.type === 'FileUpload' ? q.allowedAttachmentContentTypes || null : null,
        childQuestions:
          q.type === 'Conditional' && q.childQuestions
            ? q.childQuestions.map((cq) => ({
                parentOptionOrder: cq.parentOptionOrder,
                text: cq.text,
                type: cq.type,
                order: cq.order,
                isRequired: cq.isRequired,
                options:
                  cq.type === 'OpenText' || cq.type === 'FileUpload'
                    ? null
                    : cq.options.map((opt) => ({
                        text: opt.text,
                        order: opt.order,
                        value: opt.value || 0,
                        attachment: opt.attachment || null,
                      })),
                attachment: cq.attachment || null,
                allowedAttachmentContentTypes: cq.type === 'FileUpload' ? cq.allowedAttachmentContentTypes || null : null,
              }))
            : null,
        // Matrix question type properties
        matrixScaleLabels: q.type === 'Matrix' ? q.matrixScaleLabels || null : null,
        matrixShowExplanation: q.type === 'Matrix' ? q.matrixShowExplanation || false : false,
        matrixExplanationLabel: q.type === 'Matrix' ? q.matrixExplanationLabel || null : null,
      })),
      attachment: survey.attachment || null,
    };

    try {
      await createSurvey.mutateAsync(request);
      router.push('/surveys');
    } catch (error) {

    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Yeni Anket Oluştur</h1>
          <p className="text-slate-600 mt-1">
            Anket bilgilerini ve sorularını tanımlayın
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            İptal
          </Button>
          <Button
            type="submit"
            style={{ backgroundColor: '#0055a5' }}
            disabled={createSurvey.isPending}
          >
            {createSurvey.isPending ? 'Oluşturuluyor...' : 'Anketi Oluştur'}
          </Button>
        </div>
      </div>

      {}
      <SurveyBasicInfo
        title={survey.title}
        description={survey.description}
        introText={survey.introText}
        consentText={survey.consentText}
        outroText={survey.outroText}
        accessType={survey.accessType}
        attachment={survey.attachment}
        onTitleChange={(title) => updateSurvey('title', title)}
        onDescriptionChange={(description) => updateSurvey('description', description)}
        onIntroTextChange={(introText) => updateSurvey('introText', introText)}
        onConsentTextChange={(consentText) => updateSurvey('consentText', consentText)}
        onOutroTextChange={(outroText) => updateSurvey('outroText', outroText)}
        onAccessTypeChange={(accessType) => updateSurvey('accessType', accessType)}
        onAttachmentChange={(attachment) => updateSurvey('attachment', attachment)}
      />

      {}
      <QuestionList
        questions={survey.questions}
        onChange={(questions) => updateSurvey('questions', questions)}
      />
    </form>
  );
}
