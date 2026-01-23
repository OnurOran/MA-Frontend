import { QuestionTypeConfig, ValidationError, QuestionFormData } from '../types';
import { OpenTextEditor } from './OpenTextEditor';

export const openTextConfig: QuestionTypeConfig = {
  type: 'OpenText',
  label: 'Açık Uçlu',
  description: 'Kullanıcılar serbest metin yazabilir',
  icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),

  requiresOptions: false,
  supportsQuestionAttachment: true,
  supportsOptionAttachment: false,
  supportsAllowedContentTypes: false,

  EditorComponent: OpenTextEditor,

  validateQuestion: (question: QuestionFormData): ValidationError[] => {
    const errors: ValidationError[] = [];

    if (!question.text.trim()) {
      errors.push({ field: 'text', message: 'Soru metni gereklidir' });
    }

    return errors;
  },
};
