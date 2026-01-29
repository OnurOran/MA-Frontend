import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/src/lib/api';
import { CreateInvitationRequest } from '@/src/types';
import { toast } from 'sonner';
import { parseApiError, logError } from '@/src/lib/errors';

export function useCreateInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateInvitationRequest) => {
      const response = await apiClient.post<number>('/invitations', data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invitations', variables.surveyId] });
      toast.success('Davetiye oluşturuldu');
    },
    onError: (error) => {
      logError(error, 'Create Invitation');
      const message = parseApiError(error);
      toast.error(message);
    },
  });
}
