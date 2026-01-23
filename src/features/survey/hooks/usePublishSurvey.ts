import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/src/lib/api';
import { PublishSurveyRequest } from '@/src/types';
import { toast } from 'sonner';
import { parseApiError, logError } from '@/src/lib/errors';

interface PublishSurveyParams {
  surveyId: number;
  dates: PublishSurveyRequest;
}

export function usePublishSurvey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ surveyId, dates }: PublishSurveyParams) => {
      const response = await apiClient.patch(`/surveys/${surveyId}/publish`, dates);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['survey', variables.surveyId] });
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      toast.success('Anket başarıyla yayınlandı');
    },
    onError: (error) => {
      logError(error, 'Publish Survey');
      const message = parseApiError(error);
      toast.error(message);
    },
  });
}
