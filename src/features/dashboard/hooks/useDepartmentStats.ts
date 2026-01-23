import { useQuery } from '@tanstack/react-query';
import apiClient from '@/src/lib/api';

interface DepartmentStatsResponse {
  departmentId: number;
  totalSurveys: number;
  activeSurveys: number;
  totalParticipations: number;
  surveys: unknown[];
}

export function useDepartmentStats(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['dashboard', 'department'],
    queryFn: async () => {
      const response = await apiClient.get<DepartmentStatsResponse>('/Dashboard/department');
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
    enabled: options?.enabled ?? true,
  });
}
