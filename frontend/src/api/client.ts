import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { getToken, setToken } from './tokenStore';

export const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const getAssetUrl = (url: string | null | undefined) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const formattedBaseUrl = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${formattedBaseUrl}${path}`;
};

export const client = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to inject Authorization header
client.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Flag to track refreshing state
let isRefreshing = false;

// Queue of failed requests awaiting token refresh
interface FailedRequest {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}
let failedQueue: FailedRequest[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (token) {
      promise.resolve(token);
    } else {
      promise.reject(error);
    }
  });
  failedQueue = [];
};

// Response interceptor to intercept 401 errors and refresh token in background
client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized errors and retry request
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Avoid infinite loop if refresh request itself fails
      if (originalRequest.url === '/api/auth/token/refresh/') {
        setToken(null);
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return client(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await client.post<{ access: string }>('/api/auth/token/refresh/');
        const newAccessToken = response.data.access;
        setToken(newAccessToken);

        // Resolve all queued requests with the new access token
        processQueue(null, newAccessToken);

        // Retry the original request
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return client(originalRequest);
      } catch (refreshError) {
        // Reject all queued requests and clear token
        processQueue(refreshError, null);
        setToken(null);
        // Dispatch global event to sign out user
        window.dispatchEvent(new Event('auth-logout'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
