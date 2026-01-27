import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/src/lib/api';
import { toast } from 'sonner';
import { parseApiError, logError } from '@/src/lib/errors';

export function useDeleteTextTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/TextTemplates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['textTemplates'] });
      toast.success('Metin şablonu başarıyla silindi');
    },
    onError: (error) => {
      logError(error, 'Delete Text Template');
      const message = parseApiError(error);
      toast.error(message);
    },
  });
}
