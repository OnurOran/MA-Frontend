import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/src/lib/api';
import { CreateQuestionDto } from '@/src/types';
import { toast } from 'sonner';
import { parseApiError, logError } from '@/src/lib/errors';

interface AddQuestionParams {
  surveyId: number;
  question: CreateQuestionDto;
}

export function useAddQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ surveyId, question }: AddQuestionParams) => {
      const response = await apiClient.post(`/surveys/${surveyId}/questions`, question);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['survey', variables.surveyId] });
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      toast.success('Soru başarıyla eklendi');
    },
    onError: (error) => {
      logError(error, 'Add Question');
      const message = parseApiError(error);
      toast.error(message);
    },
  });
}
