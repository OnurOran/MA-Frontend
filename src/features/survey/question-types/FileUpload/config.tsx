import { QuestionTypeConfig, ValidationError, QuestionFormData } from '../types';
import { FileUploadEditor } from './FileUploadEditor';

export const fileUploadConfig: QuestionTypeConfig = {
  type: 'FileUpload',
  label: 'Dosya Yükleme',
  description: 'Kullanıcılar dosya yükler (max 5 MB)',
  icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  ),

  requiresOptions: false,
  supportsQuestionAttachment: true,
  supportsOptionAttachment: false,
  supportsAllowedContentTypes: true,

  EditorComponent: FileUploadEditor,

  validateQuestion: (question: QuestionFormData): ValidationError[] => {
    const errors: ValidationError[] = [];

    if (!question.text.trim()) {
      errors.push({ field: 'text', message: 'Soru metni gereklidir' });
    }

    if (question.options.length > 0) {
      errors.push({ field: 'options', message: 'Dosya yükleme soruları seçenek içeremez' });
    }

    return errors;
  },
};
