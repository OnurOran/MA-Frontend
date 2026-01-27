import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/src/lib/api';
import { CreateTextTemplateRequest } from '@/src/types';
import { toast } from 'sonner';
import { parseApiError, logError } from '@/src/lib/errors';

export function useCreateTextTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTextTemplateRequest) => {
      const response = await apiClient.post('/TextTemplates', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['textTemplates'] });
      toast.success('Metin şablonu başarıyla oluşturuldu');
    },
    onError: (error) => {
      logError(error, 'Create Text Template');
      const message = parseApiError(error);
      toast.error(message);
    },
  });
}
