import { useQuery } from '@tanstack/react-query';
import apiClient from '@/src/lib/api';
import { UserDto } from '@/src/types';
import { logError } from '@/src/lib/errors';

export function useDepartmentUsers(departmentId: number | undefined) {
  return useQuery({
    queryKey: ['department-users', departmentId],
    queryFn: async () => {
      if (!departmentId) return [];

      try {
        const response = await apiClient.get<UserDto[]>(`/departments/${departmentId}/users`);
        return response.data;
      } catch (error) {
        logError(error, 'Fetch Department Users');
        throw error;
      }
    },
    enabled: !!departmentId,
    staleTime: 2 * 60 * 1000,
  });
}
