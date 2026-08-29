import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { ServiceResponse } from "../types/api";
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "./tokenStorage";

interface RefreshTokenResponseData {
  accessToken: string;
  refreshToken: string;
}

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const baseURL = import.meta.env.VITE_API_BASE_URL;

export const apiClient = axios.create({ baseURL });

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401 sonrası refresh çağrısını tekilleştirmek için bekleyen isteklerin kuyruğu.
let isRefreshing = false;
let pendingRequests: Array<(token: string | null) => void> = [];

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ServiceResponse<unknown>>) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingRequests.push((token) => {
          if (!token) {
            reject(error);
            return;
          }
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(apiClient(originalRequest));
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        throw error;
      }

      // Sonsuz döngüyü önlemek için interceptor'sız ham axios kullanılır.
      const { data } = await axios.post<ServiceResponse<RefreshTokenResponseData>>(
        `${baseURL}/auth/refresh-token`,
        { refreshToken },
      );

      if (!data.isSuccess || !data.data) {
        throw error;
      }

      setTokens(data.data.accessToken, data.data.refreshToken);
      pendingRequests.forEach((resolvePending) => resolvePending(data.data!.accessToken));
      pendingRequests = [];

      originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      pendingRequests.forEach((resolvePending) => resolvePending(null));
      pendingRequests = [];
      clearTokens();
      window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
