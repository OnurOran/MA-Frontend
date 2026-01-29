import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/src/lib/api';
import { toast } from 'sonner';
import { parseApiError, logError } from '@/src/lib/errors';

export function useImportInvitations() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ surveyId, file }: { surveyId: number; file: File }) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post<{ importedCount: number }>(
        `/invitations/surveys/${surveyId}/import`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invitations', variables.surveyId] });
      toast.success(`${data.importedCount} davetiye başarıyla içe aktarıldı`);
    },
    onError: (error) => {
      logError(error, 'Import Invitations');
      const message = parseApiError(error);
      toast.error(message);
    },
  });
}
