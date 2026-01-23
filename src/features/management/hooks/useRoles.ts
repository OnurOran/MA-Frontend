import { useQuery } from '@tanstack/react-query';
import apiClient from '@/src/lib/api';
import { RoleDto } from '@/src/types';
import { logError } from '@/src/lib/errors';

export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      try {
        const response = await apiClient.get<RoleDto[]>('/roles');
        return response.data;
      } catch (error) {
        logError(error, 'Fetch Roles');
        throw error;
      }
    },
    staleTime: 10 * 60 * 1000,
  });
}
