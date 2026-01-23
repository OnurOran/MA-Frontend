import { QuestionTypeConfig, ValidationError, QuestionFormData } from '../types';
import { MatrixEditor } from './MatrixEditor';

export const matrixConfig: QuestionTypeConfig = {
  type: 'Matrix',
  label: 'Matrix / Likert',
  description: 'Birden fazla maddeyi 1-5 ölçeğinde değerlendirme',
  icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  ),

  requiresOptions: true,
  supportsQuestionAttachment: true,
  supportsOptionAttachment: false,
  supportsAllowedContentTypes: false,

  EditorComponent: MatrixEditor,

  validateQuestion: (question: QuestionFormData): ValidationError[] => {
    const errors: ValidationError[] = [];

    if (!question.text.trim()) {
      errors.push({ field: 'text', message: 'Soru metni gereklidir' });
    }

    // Validate options (rows)
    if (question.options.length < 2) {
      errors.push({ field: 'options', message: 'En az 2 değerlendirme maddesi ekleyin' });
    }

    if (question.options.length > 20) {
      errors.push({ field: 'options', message: 'En fazla 20 değerlendirme maddesi ekleyebilirsiniz' });
    }

    question.options.forEach((option, index) => {
      if (!option.text.trim()) {
        errors.push({ field: `options[${index}].text`, message: `Madde ${index + 1} metni gereklidir` });
      }
    });

    // Validate scale labels
    if (!question.matrixScaleLabels || question.matrixScaleLabels.length !== 5) {
      errors.push({ field: 'matrixScaleLabels', message: '5 adet ölçek etiketi gereklidir' });
    } else {
      question.matrixScaleLabels.forEach((label, index) => {
        if (!label.trim()) {
          errors.push({ field: `matrixScaleLabels[${index}]`, message: `Ölçek ${index + 1} etiketi gereklidir` });
        }
      });
    }

    // Validate explanation settings
    if (question.matrixShowExplanation && !question.matrixExplanationLabel?.trim()) {
      errors.push({ field: 'matrixExplanationLabel', message: 'Açıklama etiketi gereklidir' });
    }

    return errors;
  },
};
