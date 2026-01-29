import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/src/lib/api';
import { toast } from 'sonner';
import { parseApiError, logError } from '@/src/lib/errors';

export function useStartTokenParticipation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (token: string) => {
      const response = await apiClient.post<number>(`/s/${token}/start`);
      return response.data;
    },
    onSuccess: (_, token) => {
      queryClient.invalidateQueries({ queryKey: ['tokenSurvey', token] });
    },
    onError: (error) => {
      logError(error, 'Start Token Participation');
      const message = parseApiError(error);
      toast.error(message);
    },
  });
}
