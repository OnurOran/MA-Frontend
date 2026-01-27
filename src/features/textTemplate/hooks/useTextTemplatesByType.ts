import { useQuery } from '@tanstack/react-query';
import apiClient from '@/src/lib/api';
import { TextTemplateDto, TextTemplateType } from '@/src/types';

export function useTextTemplatesByType(type: TextTemplateType | null) {
  return useQuery({
    queryKey: ['textTemplates', 'by-type', type],
    queryFn: async () => {
      const response = await apiClient.get<TextTemplateDto[]>(
        `/TextTemplates/department/by-type?type=${type}`
      );
      return response.data;
    },
    enabled: type !== null,
    staleTime: 2 * 60 * 1000,
  });
}
