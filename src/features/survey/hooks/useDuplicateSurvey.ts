import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/src/lib/api';
import { toast } from 'sonner';
import { parseApiError, logError } from '@/src/lib/errors';

export function useDuplicateSurvey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (surveyId: number) => {
      console.log('🚀 Duplicating survey:', surveyId);
      const response = await apiClient.post(`/Surveys/${surveyId}/duplicate`);

      const location = response.headers['location'];
      if (location) {
        const newSurveyId = location.split('/').pop();
        return newSurveyId;
      }
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      toast.success('Anket başarıyla çoğaltıldı');
    },
    onError: (error) => {
      logError(error, 'Duplicate Survey');
      const message = parseApiError(error);
      toast.error(message);
    },
  });
}
