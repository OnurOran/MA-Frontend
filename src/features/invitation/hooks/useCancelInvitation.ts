import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/src/lib/api';
import { toast } from 'sonner';
import { parseApiError, logError } from '@/src/lib/errors';

export function useCancelInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, surveyId }: { id: number; surveyId: number }) => {
      await apiClient.delete(`/invitations/${id}`);
      return surveyId;
    },
    onSuccess: (surveyId) => {
      queryClient.invalidateQueries({ queryKey: ['invitations', surveyId] });
      toast.success('Davetiye iptal edildi');
    },
    onError: (error) => {
      logError(error, 'Cancel Invitation');
      const message = parseApiError(error);
      toast.error(message);
    },
  });
}
