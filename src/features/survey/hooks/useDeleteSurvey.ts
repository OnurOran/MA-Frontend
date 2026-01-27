import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/src/lib/api';
import { toast } from 'sonner';
import { parseApiError, logError } from '@/src/lib/errors';

export function useDeleteSurvey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (surveyId: number) => {
      await apiClient.delete(`/Surveys/${surveyId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      toast.success('Anket başarıyla silindi');
    },
    onError: (error) => {
      logError(error, 'Delete Survey');
      const message = parseApiError(error);
      toast.error(message);
    },
  });
}
