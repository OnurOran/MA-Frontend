import { useQuery } from '@tanstack/react-query';
import apiClient from '@/src/lib/api';
import { DepartmentDto } from '@/src/types';
import { logError } from '@/src/lib/errors';

export function useDepartments(enabled: boolean = true) {
  return useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      try {
        const response = await apiClient.get<DepartmentDto[]>('/departments');
        return response.data;
      } catch (error) {
        logError(error, 'Fetch Departments');
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    enabled,
  });
}
