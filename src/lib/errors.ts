import { AxiosError } from 'axios';
import { ApiErrorResponse } from '@/src/types';

export function parseApiError(error: unknown): string {

  if (error instanceof AxiosError) {

    if (error.response?.data) {
      const data = error.response.data as ApiErrorResponse;

      if (data.message) {
        return data.message;
      }

      if (data.errors && Object.keys(data.errors).length > 0) {
        const errorMessages = Object.entries(data.errors)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join('; ');
        return errorMessages;
      }
    }

    if (error.response?.status) {
      switch (error.response.status) {
        case 400:
          return 'Invalid request. Please check your input.';
        case 401:
          return 'You are not authorized. Please login again.';
        case 403:
          return 'You do not have permission to perform this action.';
        case 404:
          return 'The requested resource was not found.';
        case 409:
          return 'A conflict occurred. The resource may already exist.';
        case 422:
          return 'Validation failed. Please check your input.';
        case 500:
          return 'A server error occurred. Please try again later.';
        case 503:
          return 'The service is temporarily unavailable. Please try again later.';
        default:
          return `An error occurred (${error.response.status}). Please try again.`;
      }
    }

    if (error.code === 'ERR_NETWORK') {
      return 'Network error. Please check your connection.';
    }

    if (error.code === 'ECONNABORTED') {
      return 'Request timeout. Please try again.';
    }

    return error.message || 'An unexpected error occurred.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}

export function logError(error: unknown, context?: string): void {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[Error${context ? ` - ${context}` : ''}]:`, error);
  }

}

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public context?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}
