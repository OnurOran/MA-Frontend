import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/src/lib/api';
import type { SurveyReportDto, ParticipantResponseDto } from '@/src/types';

export function useSurveyReport(surveyId: number | undefined, includePartial: boolean = false) {
  return useQuery<SurveyReportDto>({
    queryKey: ['survey-report', surveyId, includePartial],
    queryFn: async () => {
      if (!surveyId) throw new Error('Survey ID is required');
      const response = await apiClient.get<SurveyReportDto>(`/surveys/${surveyId}/report`, {
        params: { includePartial },
      });
      return response.data;
    },
    enabled: !!surveyId,
  });
}

export function useParticipantResponse(surveyId: number | undefined, participationId: number | undefined) {
  return useQuery<ParticipantResponseDto>({
    queryKey: ['participant-response', surveyId, participationId],
    queryFn: async () => {
      if (!surveyId || !participationId) throw new Error('Survey ID and participation id are required');
      const response = await apiClient.get<ParticipantResponseDto>(`/surveys/${surveyId}/report/participant`, {
        params: { participationId },
      });
      return response.data;
    },
    enabled: !!surveyId && !!participationId && participationId > 0,
  });
}
