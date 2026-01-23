import { QuestionTypeConfig, ValidationError, QuestionFormData } from '../types';
import { SingleSelectEditor } from './SingleSelectEditor';

export const singleSelectConfig: QuestionTypeConfig = {
  type: 'SingleSelect',
  label: 'Tek Seçim',
  description: 'Kullanıcılar bir seçenek seçer (radio button)',
  icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),

  requiresOptions: true,
  supportsQuestionAttachment: true,
  supportsOptionAttachment: true,
  supportsAllowedContentTypes: false,

  EditorComponent: SingleSelectEditor,

  validateQuestion: (question: QuestionFormData): ValidationError[] => {
    const errors: ValidationError[] = [];

    if (!question.text.trim()) {
      errors.push({ field: 'text', message: 'Soru metni gereklidir' });
    }

    if (question.options.length < 2 || question.options.length > 5) {
      errors.push({ field: 'options', message: '2 ile 5 arasında seçenek ekleyin' });
    }

    question.options.forEach((option, index) => {
      if (!option.text.trim()) {
        errors.push({ field: `options[${index}].text`, message: `Seçenek ${index + 1} metni gereklidir` });
      }
    });

    return errors;
  },
};
