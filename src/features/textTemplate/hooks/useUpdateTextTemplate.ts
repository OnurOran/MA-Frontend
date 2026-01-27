import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/src/lib/api';
import { UpdateTextTemplateRequest } from '@/src/types';
import { toast } from 'sonner';
import { parseApiError, logError } from '@/src/lib/errors';

export function useUpdateTextTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateTextTemplateRequest }) => {
      await apiClient.put(`/TextTemplates/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['textTemplates'] });
      toast.success('Metin şablonu güncellendi');
    },
    onError: (error) => {
      logError(error, 'Update Text Template');
      const message = parseApiError(error);
      toast.error(message);
    },
  });
}
