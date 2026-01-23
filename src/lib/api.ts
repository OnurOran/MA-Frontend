import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { logError } from './errors';

function serializeDates(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (obj instanceof Date) {
    return obj.toISOString();
  }

  if (Array.isArray(obj)) {
    return obj.map(serializeDates);
  }

  if (typeof obj === 'object') {
    const serialized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        serialized[key] = serializeDates(obj[key]);
      }
    }
    return serialized;
  }

  return obj;
}

function deserializeDates(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {

    const isoDatePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z?$/;
    if (isoDatePattern.test(obj)) {
      return new Date(obj);
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(deserializeDates);
  }

  if (typeof obj === 'object') {
    const deserialized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        deserialized[key] = deserializeDates(obj[key]);
      }
    }
    return deserialized;
  }

  return obj;
}

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5123/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (config.data) {
      config.data = serializeDates(config.data);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

type AuthenticatedRequest = AxiosRequestConfig & { _retry?: boolean; skipAuthRefresh?: boolean };

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });
  failedQueue = [];
};

const refreshSession = async () => {
  const refreshConfig: AuthenticatedRequest = {
    withCredentials: true,

    headers: { 'X-Auth-Refresh': 'true' },
    skipAuthRefresh: true,
  };

  await apiClient.post('/auth/refresh', {}, refreshConfig);
};

apiClient.interceptors.response.use(
  (response) => {

    if (response.data) {
      response.data = deserializeDates(response.data);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = (error.config as AuthenticatedRequest) ?? {};
    const url = originalRequest.url ?? '';

    if (error.response?.status !== 401 || originalRequest._retry || originalRequest.skipAuthRefresh) {
      return Promise.reject(error);
    }

    if (url.includes('/auth/login') || url.includes('/auth/refresh') || url.includes('/auth/test')) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => apiClient(originalRequest))
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {

      await refreshSession();

      processQueue();

      return apiClient(originalRequest);
    } catch (refreshError) {

      logError(refreshError, 'Token Refresh');
      processQueue(refreshError as Error);

      if (typeof window !== 'undefined') {

        window.dispatchEvent(new Event('auth:logout'));
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;
