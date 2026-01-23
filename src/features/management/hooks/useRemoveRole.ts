import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/src/lib/api';
import { RemoveRoleFromUserCommand } from '@/src/types';
import { toast } from 'sonner';
import { parseApiError, logError } from '@/src/lib/errors';

export function useRemoveRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RemoveRoleFromUserCommand) => {
      const response = await apiClient.post('/departmentrole/remove', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['department-users'] });
      toast.success('Rol başarıyla kaldırıldı');
    },
    onError: (error) => {
      logError(error, 'Remove Role');
      const message = parseApiError(error);
      toast.error(message);
    },
  });
}
