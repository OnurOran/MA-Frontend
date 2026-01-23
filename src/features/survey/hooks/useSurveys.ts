import { useQuery } from '@tanstack/react-query';
import apiClient from '@/src/lib/api';
import { SurveyListItemDto } from '@/src/types';

export function useSurveys() {
  return useQuery({
    queryKey: ['surveys', 'department'],
    queryFn: async () => {
      const response = await apiClient.get<SurveyListItemDto[]>('/Surveys/department');
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
  });
}
