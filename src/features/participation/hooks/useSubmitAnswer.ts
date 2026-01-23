import { useMutation } from '@tanstack/react-query';
import apiClient from '@/src/lib/api';
import { SubmitAnswerRequest } from '@/src/types';
import { logError } from '@/src/lib/errors';

interface SubmitAnswerParams {
  participationId: string;
  answer: SubmitAnswerRequest;
}

export function useSubmitAnswer() {
  return useMutation({
    mutationFn: async ({ participationId, answer }: SubmitAnswerParams) => {

      const request = {
        QuestionId: answer.questionId,
        TextValue: answer.textValue || null,
        OptionIds: answer.optionIds || [],
        Attachment: answer.attachment ? {
          FileName: answer.attachment.fileName,
          ContentType: answer.attachment.contentType,
          Base64Content: answer.attachment.base64Content,
        } : null,
        MatrixAnswers: answer.matrixAnswers?.map(ma => ({
          OptionId: ma.optionId,
          ScaleValue: ma.scaleValue,
          Explanation: ma.explanation || null,
        })) || null,
      };
      await apiClient.post(`/participations/${participationId}/answers`, request);
    },
    onError: (error) => {
      logError(error, 'Submit Answer');
    },
  });
}
