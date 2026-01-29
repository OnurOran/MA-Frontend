import { useQuery } from '@tanstack/react-query';
import apiClient from '@/src/lib/api';
import { TokenSurveyDto } from '@/src/types';

export function useTokenSurvey(token: string | undefined) {
  return useQuery({
    queryKey: ['tokenSurvey', token],
    queryFn: async () => {
      if (!token) return null;
      const response = await apiClient.get<TokenSurveyDto>(`/s/${token}`);
      return response.data;
    },
    enabled: !!token,
    staleTime: 60 * 1000,
    retry: false,
  });
}
