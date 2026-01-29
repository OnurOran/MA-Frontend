export type AccessType = 'Internal' | 'Public' | 'InvitationOnly';

export type DeliveryMethod = 'Email' | 'Sms';

export type InvitationStatus = 'Pending' | 'Sent' | 'Viewed' | 'Completed' | 'Cancelled';

export type TextTemplateType = 'Intro' | 'Consent' | 'Outro';

export interface TextTemplateDto {
  id: number;
  title: string;
  content: string;
  type: TextTemplateType;
  departmentId: number;
  createDate: Date;
}

export interface CreateTextTemplateRequest {
  title: string;
  content: string;
  type: TextTemplateType;
}

export interface UpdateTextTemplateRequest {
  title: string;
  content: string;
  type: TextTemplateType;
}

export type QuestionType = 'SingleSelect' | 'MultiSelect' | 'OpenText' | 'FileUpload' | 'Conditional' | 'Matrix';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken?: string;
}

export interface LogoutRequest {
  refreshToken?: string;
}

export interface AuthTokensDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthTestResponse {
  isAuthenticated: boolean;
  claims: Array<{
    type: string;
    value: string;
  }>;
}

export interface UserPermissions {
  permissions: string[];
  isSuperAdmin: boolean;
}

export interface UpdateAdminPasswordRequest {
  newPassword: string;
}

export interface AttachmentDto {
  fileName: string;
  contentType: string;
  base64Content: string;
}

export interface AttachmentMetadata {
  id: number;
  fileName: string;
  contentType: string;
  sizeBytes: number;
}

export interface CreateSurveyRequest {
  title: string;
  description: string;
  introText?: string | null;
  consentText?: string | null;
  outroText?: string | null;
  accessType: AccessType;
  attachment?: AttachmentDto | null;
  questions: CreateQuestionDto[];
}

export interface CreateQuestionDto {
  text: string;
  type: QuestionType;
  order: number;
  isRequired: boolean;
  options: CreateOptionDto[] | null;
  attachment?: AttachmentDto | null;
  allowedAttachmentContentTypes?: string[] | null;
  childQuestions?: CreateChildQuestionDto[] | null;
  // Matrix question type properties
  matrixScaleLabels?: string[] | null;
  matrixShowExplanation?: boolean;
  matrixExplanationLabel?: string | null;
}

export interface CreateChildQuestionDto {
  parentOptionOrder: number;
  text: string;
  type: QuestionType;
  order: number;
  isRequired: boolean;
  options: CreateOptionDto[] | null;
  attachment?: AttachmentDto | null;
  allowedAttachmentContentTypes?: string[] | null;
}

export interface CreateOptionDto {
  text: string;
  order: number;
  value: number | null;
  attachment?: AttachmentDto | null;
}

export interface PublishSurveyRequest {
  StartDate: Date;
  EndDate: Date;
}

export interface SurveyListItemDto {
  id: number;
  surveyNumber: number;
  slug: string;
  title: string;
  description: string;
  departmentId: number;
  accessType: AccessType;
  isActive: boolean;
  createdAt: Date;
  startDate: Date | null;
  endDate: Date | null;
  createdBy: string;
}

export interface SurveyDetailDto {
  id: number;
  surveyNumber: number;
  slug: string;
  title: string;
  description: string;
  introText?: string | null;
  consentText?: string | null;
  outroText?: string | null;
  accessType: AccessType;
  isPublished: boolean;
  startDate: Date | null;
  endDate: Date | null;
  questions: QuestionDto[];
  attachment?: AttachmentMetadata | null;
}

export interface QuestionDto {
  id: number;
  text: string;
  description?: string | null;
  type: QuestionType;
  order: number;
  isRequired: boolean;
  options: OptionDto[];
  attachment?: AttachmentMetadata | null;
  allowedAttachmentContentTypes?: string[] | null;
  // Matrix question type properties
  matrixScaleLabels?: string[] | null;
  matrixShowExplanation?: boolean;
  matrixExplanationLabel?: string | null;
}

export interface OptionDto {
  id: number;
  text: string;
  order: number;
  value: number;
  attachment?: AttachmentMetadata | null;
  childQuestions?: QuestionDto[] | null;
}

export interface StartParticipationRequest {
  Slug: string;
}

export interface SubmitAnswerRequest {
  questionId: number;
  textValue?: string | null;
  optionIds: number[];
  attachment?: AttachmentDto | null;
  matrixAnswers?: MatrixAnswerItem[] | null;
}

export interface MatrixAnswerItem {
  optionId: number;
  scaleValue: number;
  explanation?: string | null;
}

export type StartParticipationResponse = number;

export interface ParticipationStatusResult {
  hasParticipated: boolean;
  isCompleted: boolean;
  completedAt: Date | null;
}

export interface RoleDto {
  id: number;
  name: string;
  description: string;
  permissions: string[];
}

export interface CreateRoleCommand {
  name: string;
  description: string;
  permissions: string[];
}

export interface PermissionDto {
  id: number;
  name: string;
  description: string;
}

export interface DepartmentDto {
  id: number;
  name: string;
  externalIdentifier: string;
}

export interface UserDto {
  id: number;
  username: string;
  email: string;
  roles: string[];
}

export interface AssignRoleToUserCommand {
  userId: number;
  roleId: number;
}

export interface RemoveRoleFromUserCommand {
  userId: number;
  roleId: number;
}

export interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

export interface SurveyReportDto {
  surveyId: number;
  title: string;
  description: string;
  introText?: string | null;
  outroText?: string | null;
  accessType: AccessType;
  startDate: Date | null;
  endDate: Date | null;
  isActive: boolean;
  totalParticipations: number;
  completedParticipations: number;
  completionRate: number;
  participants: ParticipantSummaryDto[];
  questions: QuestionReportDto[];
  attachment?: AttachmentMetadata | null;
}

export interface ParticipantSummaryDto {
  participationId: number;
  participantName: string | null;
  isCompleted: boolean;
  startedAt: Date;
}

export interface QuestionReportDto {
  questionId: number;
  text: string;
  type: QuestionType;
  order: number;
  isRequired: boolean;
  totalResponses: number;
  responseRate: number;
  attachment?: AttachmentMetadata | null;
  optionResults?: OptionResultDto[];
  textResponses?: TextResponseDto[];
  fileResponses?: FileResponseDto[];
  conditionalResults?: ConditionalBranchResultDto[];
  // Matrix question type properties
  matrixScaleLabels?: string[];
  matrixResults?: MatrixRowResultDto[];
}

export interface MatrixRowResultDto {
  optionId: number;
  text: string;
  order: number;
  totalResponses: number;
  averageScore: number;
  scaleDistribution: number[];
  explanations: MatrixRowExplanationDto[];
}

export interface MatrixRowExplanationDto {
  participationId: number;
  participantName?: string | null;
  scaleValue: number;
  explanation: string;
  submittedAt: Date;
}

export interface OptionResultDto {
  optionId: number;
  text: string;
  order: number;
  selectionCount: number;
  percentage: number;
  attachment?: AttachmentMetadata | null;
}

export interface TextResponseDto {
  participationId: number;
  participantName?: string | null;
  textValue: string;
  submittedAt: Date;
}

export interface FileResponseDto {
  answerId: number;
  attachmentId: number;
  participationId: number;
  participantName?: string | null;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  submittedAt: Date;
}

export interface ConditionalBranchResultDto {
  parentOptionId: number;
  parentOptionText: string;
  participantCount: number;
  childQuestions: QuestionReportDto[];
}

export interface ParticipantResponseDto {
  participationId: number;
  participantName: string | null;
  isCompleted: boolean;
  startedAt: Date;
  completedAt: Date | null;
  answers: ParticipantAnswerDto[];
}

export interface ParticipantAnswerDto {
  questionId: number;
  questionText: string;
  textValue: string | null;
  selectedOptions: string[];
  fileName: string | null;
  answerId: number | null;
  matrixAnswers?: MatrixAnswerDetailDto[] | null;
}

export interface MatrixAnswerDetailDto {
  rowText: string;
  scaleValue: number;
  explanation?: string | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
}

export interface InvitationDto {
  id: number;
  surveyId: number;
  token: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  deliveryMethod: DeliveryMethod;
  status: InvitationStatus;
  sentAt?: Date | null;
  viewedAt?: Date | null;
  completedAt?: Date | null;
  participationId?: number | null;
  createDate: Date;
}

export interface CreateInvitationRequest {
  surveyId: number;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  deliveryMethod: DeliveryMethod;
}

export interface SendInvitationsRequest {
  baseUrl: string;
}

export interface TokenSurveyDto {
  surveyId: number;
  surveyNumber: number;
  slug: string;
  title: string;
  description?: string | null;
  introText?: string | null;
  consentText?: string | null;
  outroText?: string | null;
  firstName: string;
  lastName: string;
  hasParticipated: boolean;
  isCompleted: boolean;
  completedAt?: Date | null;
  participationId?: number | null;
  questions: QuestionDto[];
  attachment?: AttachmentMetadata | null;
}
