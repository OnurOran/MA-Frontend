import { useQuery } from '@tanstack/react-query';
import apiClient from '@/src/lib/api';
import { TextTemplateDto } from '@/src/types';

export function useTextTemplates() {
  return useQuery({
    queryKey: ['textTemplates'],
    queryFn: async () => {
      const response = await apiClient.get<TextTemplateDto[]>('/TextTemplates/department');
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
  });
}
