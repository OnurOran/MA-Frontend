import { useQuery } from '@tanstack/react-query';
import apiClient from '@/src/lib/api';
import { ParticipationStatusResult } from '@/src/types';
import { logError } from '@/src/lib/errors';

export function useParticipationStatus(slug: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['participationStatus', slug],
    queryFn: async () => {
      const response = await apiClient.get<ParticipationStatusResult>(`/participations/status/${slug}`);
      return response.data;
    },
    enabled,
    retry: false,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}
