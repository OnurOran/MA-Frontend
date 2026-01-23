import { QuestionTypeConfig, ValidationError, QuestionFormData } from '../types';
import { ConditionalEditor } from './ConditionalEditor';

export const conditionalConfig: QuestionTypeConfig = {
  type: 'Conditional',
  label: 'Koşullu Soru',
  description: 'Seçilen seçeneğe göre farklı alt sorular gösterir',
  icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12M8 12h12m-12 5h12M4 7h.01M4 12h.01M4 17h.01" />
    </svg>
  ),

  requiresOptions: true,
  supportsQuestionAttachment: true,
  supportsOptionAttachment: true,
  supportsAllowedContentTypes: false,

  EditorComponent: ConditionalEditor,

  validateQuestion: (question: QuestionFormData): ValidationError[] => {
    const errors: ValidationError[] = [];

    if (!question.text.trim()) {
      errors.push({ field: 'text', message: 'Soru metni gereklidir' });
    }

    if (question.options.length < 2 || question.options.length > 5) {
      errors.push({ field: 'options', message: 'Koşullu sorular 2 ile 5 seçenek arasında olmalıdır' });
    }

    question.options.forEach((option, index) => {
      if (!option.text.trim()) {
        errors.push({ field: `options[${index}].text`, message: `Seçenek ${index + 1} metni gereklidir` });
      }
    });

    // Validate child questions (stored at question level with parentOptionOrder)
    if (question.childQuestions && question.childQuestions.length > 0) {
      question.childQuestions.forEach((childQuestion, childIndex) => {
        const parentOptionIndex = question.options.findIndex(opt => opt.order === childQuestion.parentOptionOrder);
        const optionLabel = parentOptionIndex >= 0 ? `Seçenek ${parentOptionIndex + 1}` : `Seçenek`;

        if (!childQuestion.text.trim()) {
          errors.push({
            field: `childQuestions[${childIndex}].text`,
            message: `${optionLabel} - Alt soru metni gereklidir`
          });
        }

        // Child questions cannot be Conditional type
        if (childQuestion.type === 'Conditional') {
          errors.push({
            field: `childQuestions[${childIndex}].type`,
            message: `Alt sorular Koşullu tip olamaz`
          });
        }

        // Validate child question options for SingleSelect/MultiSelect types
        if (childQuestion.type === 'SingleSelect' || childQuestion.type === 'MultiSelect') {
          if (!childQuestion.options || childQuestion.options.length < 2) {
            errors.push({
              field: `childQuestions[${childIndex}].options`,
              message: `${optionLabel} - Alt soru en az 2 seçenek içermelidir`
            });
          } else {
            childQuestion.options.forEach((childOption, childOptIndex) => {
              if (!childOption.text.trim()) {
                errors.push({
                  field: `childQuestions[${childIndex}].options[${childOptIndex}].text`,
                  message: `${optionLabel} - Alt soru - Seçenek ${childOptIndex + 1} metni gereklidir`
                });
              }
            });
          }
        }
      });
    }

    return errors;
  },
};
