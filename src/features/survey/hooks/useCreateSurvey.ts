import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/src/lib/api';
import { CreateSurveyRequest } from '@/src/types';
import { toast } from 'sonner';
import { parseApiError, logError } from '@/src/lib/errors';

export function useCreateSurvey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSurveyRequest) => {
      console.log('🚀 Sending survey creation request:', JSON.stringify(data, null, 2));
      const response = await apiClient.post('/Surveys', data);

      const location = response.headers['location'];
      if (location) {
        const surveyId = location.split('/').pop();
        return surveyId;
      }
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      toast.success('Anket başarıyla oluşturuldu');
    },
    onError: (error) => {
      logError(error, 'Create Survey');
      const message = parseApiError(error);
      toast.error(message);
    },
  });
}
