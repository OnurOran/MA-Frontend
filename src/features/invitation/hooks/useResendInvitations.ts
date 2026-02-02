import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/src/lib/api';
import { toast } from 'sonner';
import { parseApiError, logError } from '@/src/lib/errors';

export function useResendInvitations() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ surveyId, baseUrl }: { surveyId: number; baseUrl: string }) => {
      const response = await apiClient.post<{ sentCount: number }>(
        `/invitations/surveys/${surveyId}/resend`,
        { baseUrl }
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invitations', variables.surveyId] });
      if (data.sentCount > 0) {
        toast.success(`${data.sentCount} davetiye tekrar gönderildi`);
      } else {
        toast.info('Tekrar gönderilecek davetiye bulunamadı');
      }
    },
    onError: (error) => {
      logError(error, 'Resend Invitations');
      const message = parseApiError(error);
      toast.error(message);
    },
  });
}
