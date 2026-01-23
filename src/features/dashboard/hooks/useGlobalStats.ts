import { useQuery } from '@tanstack/react-query';
import apiClient from '@/src/lib/api';

interface GlobalStatsResponse {
  totalSurveys: number;
  activeSurveys: number;
  totalParticipations: number;
  surveys: unknown[];
}

export function useGlobalStats(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['dashboard', 'global'],
    queryFn: async () => {
      const response = await apiClient.get<GlobalStatsResponse>('/Dashboard/global');
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
    enabled: options?.enabled ?? true,
  });
}
