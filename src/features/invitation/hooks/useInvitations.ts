import { useQuery } from '@tanstack/react-query';
import apiClient from '@/src/lib/api';
import { InvitationDto } from '@/src/types';

export function useInvitations(surveyId: number | undefined) {
  return useQuery({
    queryKey: ['invitations', surveyId],
    queryFn: async () => {
      if (!surveyId) return [];
      const response = await apiClient.get<InvitationDto[]>(`/invitations/surveys/${surveyId}`);
      return response.data;
    },
    enabled: !!surveyId,
    staleTime: 30 * 1000,
  });
}
