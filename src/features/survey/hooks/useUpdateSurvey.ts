import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/src/lib/api';
import { CreateSurveyRequest } from '@/src/types';
import { toast } from 'sonner';
import { logError, parseApiError } from '@/src/lib/errors';

export function useUpdateSurvey(surveyId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSurveyRequest) => {
      await apiClient.put(`/Surveys/${surveyId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      toast.success('Anket güncellendi');
    },
    onError: (error) => {
      logError(error, 'Update Survey');
      const message = parseApiError(error);
      toast.error(message);
    },
  });
}
