import { AccessType, QuestionType } from '@/src/types';

export interface AttachmentData {
  fileName: string;
  contentType: string;
  base64Content: string;
}

export interface OptionFormData {
  text: string;
  order: number;
  value: number;
  attachment: AttachmentData | null;
}

export interface ChildQuestionFormData {
  parentOptionOrder: number;
  text: string;
  description?: string;
  type: QuestionType;
  order: number;
  isRequired: boolean;
  attachment: AttachmentData | null;
  options: OptionFormData[];
  allowedAttachmentContentTypes?: string[];
}

export interface QuestionFormData {
  text: string;
  description?: string;
  type: QuestionType;
  order: number;
  isRequired: boolean;
  attachment: AttachmentData | null;
  options: OptionFormData[];
  allowedAttachmentContentTypes?: string[];
  childQuestions?: ChildQuestionFormData[];
  // Matrix question type properties
  matrixScaleLabels?: string[];
  matrixShowExplanation?: boolean;
  matrixExplanationLabel?: string;
}

export interface SurveyFormData {
  title: string;
  description: string;
  introText?: string;
  consentText?: string;
  outroText?: string;
  accessType: AccessType;
  attachment: AttachmentData | null;
  questions: QuestionFormData[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface QuestionEditorProps {
  question: QuestionFormData;
  questionIndex: number;
  totalQuestions: number;
  onChange: (updated: QuestionFormData) => void;
  onRemove: () => void;
  onReorder: (newOrder: number) => void;
}

export interface QuestionTypeConfig {
  type: QuestionType;
  label: string;
  description: string;
  icon: React.ReactNode;

  requiresOptions: boolean;
  supportsQuestionAttachment: boolean;
  supportsOptionAttachment: boolean;
  supportsAllowedContentTypes: boolean;

  EditorComponent: React.ComponentType<QuestionEditorProps>;

  validateQuestion: (data: QuestionFormData) => ValidationError[];
}
