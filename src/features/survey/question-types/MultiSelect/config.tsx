import { QuestionTypeConfig, ValidationError, QuestionFormData } from '../types';
import { MultiSelectEditor } from './MultiSelectEditor';

export const multiSelectConfig: QuestionTypeConfig = {
  type: 'MultiSelect',
  label: 'Çoklu Seçim',
  description: 'Kullanıcılar birden fazla seçenek seçebilir (checkbox)',
  icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),

  requiresOptions: true,
  supportsQuestionAttachment: true,
  supportsOptionAttachment: true,
  supportsAllowedContentTypes: false,

  EditorComponent: MultiSelectEditor,

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
