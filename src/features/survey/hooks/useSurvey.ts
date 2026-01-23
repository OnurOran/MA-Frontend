import { useQuery } from '@tanstack/react-query';
import apiClient from '@/src/lib/api';
import { SurveyDetailDto } from '@/src/types';

export function useSurvey(surveyId: number | undefined) {
  return useQuery({
    queryKey: ['survey', surveyId],
    queryFn: async () => {
      if (!surveyId) return null;
      const response = await apiClient.get<SurveyDetailDto>(`/surveys/${surveyId}`);
      return response.data;
    },
    enabled: !!surveyId,
    staleTime: 2 * 60 * 1000,
  });
}
